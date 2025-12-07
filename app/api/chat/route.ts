import { NextRequest, NextResponse } from "next/server";
import { fetchGamesFromIGDB } from "@/lib/gameSearchUtils";
import { formatGames } from "@/lib/responseFormatter";
import { igdbClient } from "@/lib/igdb";

const WIT_AI_TOKEN = process.env.WIT_AI_TOKEN;

// Conversation state management
const conversationState = new Map<string, { step: number; data: any }>();

interface WitEntity {
  [key: string]: Array<{
    value: string;
    confidence: number;
  }>;
}

interface WitResponse {
  text: string;
  intents: Array<{
    name: string;
    confidence: number;
  }>;
  entities: WitEntity;
  traits: {
    [key: string]: Array<{
      value: string;
      confidence: number;
    }>;
  };
}

// Utility function for Wit.ai API interactions
async function fetchWitAiData(message: string) {
  const witResponse = await fetch(
    `https://api.wit.ai/message?v=20241207&q=${encodeURIComponent(message)}`,
    {
      headers: {
        Authorization: `Bearer ${WIT_AI_TOKEN}`,
      },
    }
  );

  if (!witResponse.ok) {
    throw new Error("Failed to fetch response from Wit.ai");
  }

  const witData: WitResponse = await witResponse.json();
  
  // Log the full response for debugging
  console.log("Wit.ai Response:", JSON.stringify(witData, null, 2));
  
  const intent = witData.intents?.[0]?.name || null;
  const confidence = witData.intents?.[0]?.confidence || 0;
  
  // Extract entities - try multiple possible entity name formats
  const extractEntity = (possibleNames: string[]) => {
    for (const name of possibleNames) {
      if (witData.entities?.[name]?.length > 0) {
        return Array.from(new Set(
          witData.entities[name].map(e => e.value.toLowerCase())
        ));
      }
    }
    return [];
  };

  const platform = extractEntity(['platform:platform', 'platform', 'wit$location:location']);
  const genre = extractEntity(['genre:genre', 'genre', 'game_genre', 'wit$game_genre:game_genre']);
  const gameName = witData.entities?.['game_name:game_name']?.[0]?.value || 
                   witData.entities?.['game_name']?.[0]?.value || 
                   witData.entities?.['wit$game_name:game_name']?.[0]?.value || null;
  const similarGame = witData.entities?.['similar_game:similar_game']?.[0]?.value || 
                      witData.entities?.['similar_game']?.[0]?.value || 
                      witData.entities?.['wit$similar_game:similar_game']?.[0]?.value || null;

  console.log("Extracted:", { intent, confidence, platform, genre, gameName, similarGame });

  return { intent, confidence, platform, genre, gameName, similarGame, witData };
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Missing message" },
        { status: 400 }
      );
    }

    if (!WIT_AI_TOKEN) {
      return NextResponse.json(
        { response: "Chatbot is not configured. Please add WIT_AI_TOKEN to your .env file and restart the server." },
        { status: 200 }
      );
    }

    // Get conversation state
    const state = conversationState.get(sessionId || 'default') || { step: 0, data: {} };

    // Use the utility function to fetch Wit.ai data
    const { intent, confidence, platform, genre, gameName, similarGame } = 
      await fetchWitAiData(message);

    // Smart detection: If message contains question words and similarGame is found, treat as game info request
    const questionWords = /\b(what|tell|about|info|information|explain|describe|details|is)\b/i;
    const hasQuestionWord = questionWords.test(message);
    const hasQuestionMark = message.includes('?');
    
    // If it looks like a question about a game, override intent to get_game_info
    let actualIntent = intent;
    let actualGameName = gameName;
    
    if ((hasQuestionWord || hasQuestionMark) && similarGame && !gameName) {
      actualIntent = 'get_game_info';
      actualGameName = similarGame;
      console.log(`Smart detection: Converting similarGame "${similarGame}" to game info request`);
    }

    // Handle initial conversation step
    if (state.step === 0) {
      // Greetings
      if (actualIntent === "greeting" || actualIntent === "greet" || (confidence < 0.5 && message.toLowerCase().match(/^(hi|hello|hey|greetings)/))) {
        const greetings = [
          "Hello! How can I assist you today?",
          "Hi there! What can I do for you?",
          "Hey! How can I help you?",
          "Greetings! How may I assist you?",
        ];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        return NextResponse.json({ response: randomGreeting });
      }

      // Thank you
      if (actualIntent === "thank_you" || message.toLowerCase().match(/thank/)) {
        return NextResponse.json({ response: "You're welcome! If you need anything else, feel free to ask." });
      }

      // Help
      if (actualIntent === "how_to_use" || actualIntent === "help") {
        return NextResponse.json({ 
          response: "I can help you find game recommendations based on platform, genre, or similar games. Just let me know what you're looking for!" 
        });
      }

      // Exit/Reset
      if (actualIntent === "exit" || message.toLowerCase().match(/^(exit|reset|start over)/)) {
        conversationState.delete(sessionId || 'default');
        return NextResponse.json({ response: "Alright, I've reset our conversation. Let me know if you need anything else!" });
      }

      // Check if this is a game info request (prioritize over recommendations)
      if (actualIntent === 'get_game_info') {
        const reply = await generateResponse(actualIntent, { platform, genre, gameName: actualGameName, similarGame });
        return NextResponse.json({ response: reply, intent: actualIntent, confidence });
      }

      // Game recommendations - check for intent OR if we have useful entities
      const hasRecommendationContext = platform.length > 0 || genre.length > 0 || similarGame;
      const isRecommendationIntent = actualIntent === "get_recommendation" || actualIntent === "GameRecommendation";
      
      if (isRecommendationIntent || hasRecommendationContext) {
        // If user only mentioned similar game, ask for filters
        if (similarGame && platform.length === 0 && genre.length === 0) {
          conversationState.set(sessionId || 'default', { step: 3, data: { similarGame } });
          return NextResponse.json({ response: "Would you like to specify a genre or platform for filtering?" });
        }

        // If no context provided, ask for it
        if (platform.length === 0 && genre.length === 0 && !similarGame) {
          conversationState.set(sessionId || 'default', { step: 1, data: {} });
          return NextResponse.json({ response: "What platform or genre are you interested in?" });
        }

        // Fetch and format games
        const games = await fetchGamesFromIGDB({ platform, genre, similarGame });
        const reply = formatGames(games, similarGame, genre, platform);
        conversationState.delete(sessionId || 'default');
        return NextResponse.json({ response: reply });
      }

      // Handle other intents with existing logic
      if (confidence >= 0.5) {
        const reply = await generateResponse(actualIntent, { platform, genre, gameName: actualGameName, similarGame });
        return NextResponse.json({ response: reply, intent: actualIntent, confidence });
      }

      return NextResponse.json({ response: "I'm not sure what you're asking. I can help you with game recommendations, information, ratings, and statistics!" });
    }

    // Handle follow-up questions (step 1)
    if (state.step === 1) {
      if (message.toLowerCase().match(/^(exit|reset|start over)/)) {
        conversationState.delete(sessionId || 'default');
        return NextResponse.json({ response: "Alright, I've reset our conversation. Let me know if you need anything else!" });
      }

      if (platform.length > 0) state.data.platform = platform;
      if (genre.length > 0) state.data.genre = genre;

      if (!state.data.platform && !state.data.genre) {
        return NextResponse.json({ response: "I still need to know the platform or genre you're interested in." });
      }

      const games = await fetchGamesFromIGDB({
        platform: state.data.platform || platform,
        genre: state.data.genre || genre,
        similarGame,
      });
      const reply = formatGames(games, similarGame, state.data.genre, state.data.platform);

      conversationState.delete(sessionId || 'default');
      return NextResponse.json({ response: reply });
    }

    // Handle similar game filtering (step 3)
    if (state.step === 3) {
      if (message.toLowerCase().match(/^(exit|reset|start over)/)) {
        conversationState.delete(sessionId || 'default');
        return NextResponse.json({ response: "Alright, I've reset our conversation. Let me know if you need anything else!" });
      }

      if (platform.length > 0 || genre.length > 0) {
        state.data.platform = platform;
        state.data.genre = genre;

        const games = await fetchGamesFromIGDB({
          platform: state.data.platform || [],
          genre: state.data.genre || [],
          similarGame: state.data.similarGame,
        });

        conversationState.delete(sessionId || 'default');
        const reply = formatGames(games, state.data.similarGame, state.data.genre, state.data.platform);
        return NextResponse.json({ response: reply });
      }

      if (message.toLowerCase() === "no") {
        const games = await fetchGamesFromIGDB({ 
          platform: [], 
          genre: [], 
          similarGame: state.data.similarGame 
        });
        conversationState.delete(sessionId || 'default');
        const reply = formatGames(games, state.data.similarGame);
        return NextResponse.json({ response: reply });
      }

      return NextResponse.json({ response: "Please specify a genre or platform, or say 'no' to skip filtering." });
    }

    return NextResponse.json({ response: "An unexpected error occurred." });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Error processing message" },
      { status: 500 }
    );
  }
}

interface ResponseContext {
  platform: string[];
  genre: string[];
  gameName: string | null;
  similarGame: string | null;
}

async function generateResponse(intent: string | null, context: ResponseContext): Promise<string> {
  const { platform, genre, gameName, similarGame } = context;

  switch (intent) {
    case "get_game_info":
      if (gameName) {
        try {
          // Search for the game in IGDB
          const gameData = await igdbClient.request('games', `
            fields name, summary, rating, rating_count, genres.name, platforms.name, release_dates.human, storyline;
            search "${gameName}";
            limit 1;
          `);

          if (gameData && gameData.length > 0) {
            const game = gameData[0];
            const rating = game.rating ? (game.rating / 10).toFixed(1) : 'N/A';
            const genres = game.genres?.map((g: any) => g.name).join(', ') || 'Unknown';
            const platforms = game.platforms?.slice(0, 3).map((p: any) => p.name).join(', ') || 'Various platforms';
            const releaseDate = game.release_dates?.[0]?.human || 'Release date unknown';
            
            let response = `**${game.name}**\n\n`;
            
            if (game.rating) {
              response += `⭐ Rating: ${rating}/10 (${game.rating_count || 0} ratings)\n`;
            }
            
            response += `🎮 Genre: ${genres}\n`;
            response += `💻 Platforms: ${platforms}\n`;
            response += `📅 Released: ${releaseDate}\n\n`;
            
            if (game.summary) {
              response += `${game.summary}\n\n`;
            }
            
            response += `You can search for this game on our platform to add it to your list and see more details!`;
            
            return response;
          }
        } catch (error) {
          console.error("Error fetching game info:", error);
        }
        
        // Fallback if game not found
        const gameInfoResponses = [
          `${gameName} is an excellent game! You can find detailed information, ratings, and player statistics in our database. Use the search feature at the top to explore more about this title!`,
          `Great choice! ${gameName} is a popular title. Check our /stats page for ratings and reviews, or search for it in our database to see detailed information, screenshots, and community ratings.`,
          `${gameName} - that's a fantastic game! You can add it to your personal list, rate it, and see what other players think. Use the search bar to find all the details!`,
          `Interested in ${gameName}? Our platform has comprehensive information from the IGDB database including ratings, release dates, and platforms. Search for it to learn more!`,
          `${gameName} is definitely worth checking out! You can find gameplay details, ratings, and add it to your collection. Just use the search feature to explore this game further.`,
          `Looking for info on ${gameName}? You can search for it on our platform to see ratings, statistics, similar games, and much more from the IGDB database!`
        ];
        return gameInfoResponses[Math.floor(Math.random() * gameInfoResponses.length)];
      }
      
      const noGameResponses = [
        "Which game are you interested in? Tell me the name and I'll help you find detailed information, ratings, and statistics!",
        "I'd love to help! Just tell me which game you want to know about, and I can guide you to all the information we have.",
        "What game would you like to learn about? Give me a name and I'll show you where to find ratings, reviews, and more details!",
        "Sure! Which game are you curious about? I can help you find comprehensive information from our IGDB database.",
        "I'm here to help! Just mention the game title and I'll point you to all the stats, ratings, and details we have available."
      ];
      return noGameResponses[Math.floor(Math.random() * noGameResponses.length)];

    case "get_top_games":
      if (platform.length > 0) {
        try {
          const games = await fetchGamesFromIGDB({ platform, genre: [], similarGame: null });
          if (games.length > 0) {
            const gamesList = games.slice(0, 5).map(g => g.name).join(", ");
            return `Top games for ${platform.join(', ')}: ${gamesList}. Check our /stats page for more detailed rankings!`;
          }
        } catch (error) {
          console.error("Error fetching platform games:", error);
        }
      }
      return "You can see the best-rated games on our /stats page! Currently, top games include The Witcher 3, Baldur's Gate 3, and Elden Ring with ratings of 9+/10.";

    case "get_statistics":
      return "We have detailed statistics on the /stats page! There you can see interactive D3.js charts with ratings, popularity distribution, and rating vs review count analysis. All data is fetched from the IGDB database!";

    case "add_game":
      return "To add a game to your list, you need to log in first. Click 'Login' in the navigation, then you can search and add games to your personal list!";

    case "get_recommendation":
      try {
        const games = await fetchGamesFromIGDB({ platform, genre, similarGame });
        if (games.length > 0) {
          const gamesList = games.map(g => g.name).join(", ");
          let context = [];
          if (genre.length > 0) context.push(`${genre.join(', ')} genre${genre.length > 1 ? 's' : ''}`);
          if (platform.length > 0) context.push(`${platform.join(', ')} platform${platform.length > 1 ? 's' : ''}`);
          if (similarGame) context.push(`similar to ${similarGame}`);
          
          const contextStr = context.length > 0 ? ` for ${context.join(' and ')}` : '';
          return `Here are some great recommendations${contextStr}: ${gamesList}. All highly rated games you should check out!`;
        }
      } catch (error) {
        console.error("Error fetching game recommendations:", error);
      }
      
      if (genre.length > 0) {
        return `For ${genre.join(', ')} genre${genre.length > 1 ? 's' : ''}, I recommend checking our database! We have a great selection. You can filter games by genre on the all games page.`;
      }
      if (similarGame) {
        return `If you liked ${similarGame}, I recommend checking similar games on our platform! Use the search feature to find games with similar gameplay or genre.`;
      }
      return "What genre of games do you prefer? RPG, Action, Strategy, Shooter? I have lots of good recommendations!";

    case "greeting":
      return "Hello! 👋 I'm the AI gaming assistant. I can help you with:\n• Game information\n• Top lists and statistics\n• Game recommendations\n• Adding games to your list\n\nWhat are you interested in?";

    case "check_rating":
      if (gameName) {
        return `${gameName} has an excellent rating! For exact numbers and details, check our /stats page or search for the game in the database.`;
      }
      return "Which game do you want to check? Tell me the name and I'll give you the rating!";

    case "how_to_use":
      return "Using the site is very simple:\n1. Register or log in\n2. Search for games you've played\n3. Add them to your list\n4. Rate the games\n5. View statistics on the /stats page\n\nWhat specifically are you interested in?";

    case "about_site":
      const aboutResponses = [
        "myGameList is a platform for tracking your games! You can:\n• Keep a list of played games\n• Rate games and see what others think\n• View detailed statistics and interactive D3.js charts\n• Get personalized game recommendations\n• Discover top-rated games from the IGDB database\n\nIt's like a diary for your gaming journey!",
        "This is myGameList - your personal game tracker! The platform lets you:\n• Build and manage your game collection\n• Rate games you've played\n• Explore beautiful data visualizations on the /stats page\n• Get AI-powered game recommendations (that's me!)\n• Browse game information from IGDB's massive database\n\nThink of it as your gaming portfolio!",
        "Welcome to myGameList! This site helps gamers like you:\n• Track which games you've played\n• Rate and review your experiences\n• Visualize your gaming habits with charts\n• Discover new games based on your preferences\n• See trending and top-rated games\n\nAll powered by the IGDB game database!",
        "myGameList is a game tracking and discovery platform. Here's what you can do:\n• Create your personal game library\n• Rate games on a 1-10 scale\n• View interactive statistics and charts (check /stats!)\n• Get smart recommendations from me, your AI assistant\n• Search through thousands of games via IGDB\n\nIt's the perfect tool for any serious gamer!",
        "This website is myGameList - a hub for game enthusiasts! Features include:\n• Personal game lists and collections\n• Rating system for games you've played\n• Beautiful D3.js data visualizations\n• AI chatbot for recommendations (that's me!)\n• Integration with IGDB for game data\n\nTrack your gaming journey all in one place!",
        "myGameList helps you organize your gaming life! You can:\n• Maintain a database of games you've played\n• Give ratings to share your opinions\n• Analyze your gaming patterns with charts\n• Chat with me for game suggestions\n• Explore the vast IGDB game catalog\n\nEverything a gamer needs in one platform!"
      ];
      
      return aboutResponses[Math.floor(Math.random() * aboutResponses.length)];

    default:
      return "Interesting question! I can help you with game information, top lists, statistics, or recommendations. What specifically are you interested in?";
  }
}
