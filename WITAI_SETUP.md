# Wit.ai Setup Instructions for myGameList Chatbot

## 1. Create Wit.ai App
1. Go to https://wit.ai/
2. Sign in with Facebook account
3. Click "New App"
4. Name: `myGameList-Chatbot`
5. Language: **English**
6. Visibility: Private

## 2. Add Intents

### Intent 1: greeting
**Examples:**
- Hi
- Hello
- Hey
- Good morning
- What's up
- Greetings
- Yo

### Intent 2: get_game_info
**Examples:**
- Tell me about Witcher 3
- What do you know about Elden Ring
- Information about Cyberpunk 2077
- What kind of game is Baldur's Gate 3
- Details about God of War
- Info on Red Dead Redemption 2
- Tell me more about Starfield

### Intent 3: get_top_games
**Examples:**
- What are the best games
- Give me top games
- Best rated games
- Which games have the highest ratings
- Top 10 games
- Most popular games
- Show me the best games

### Intent 4: get_statistics
**Examples:**
- Show me statistics
- Game statistics
- Charts
- Graphs
- What statistics are available
- Game analysis
- Show me the stats page

### Intent 5: add_game
**Examples:**
- How to add a game
- Add game to list
- I want to add a game
- How do I put a game on my list
- Adding games
- How can I track a game

### Intent 6: get_recommendation
**Examples:**
- Recommend me a game
- What should I play
- What's a good game
- Recommendation for RPG
- Recommendation for action games
- What do you recommend
- Suggest a game

### Intent 7: check_rating
**Examples:**
- What's the rating for Witcher 3
- How many points does Elden Ring have
- Rating for Cyberpunk
- Game rating
- How good is that game
- What score does it have

### Intent 8: how_to_use
**Examples:**
- How to use the site
- Instructions
- Help
- How does it work
- How to use the database
- Tutorial
- Guide me

### Intent 9: about_site
**Examples:**
- What is myGameList
- About the site
- What's the purpose of this site
- What can you do here
- Info about the platform
- Tell me about this website

## 3. Add Entities

### Entity 1: game_name (wit/wikipedia)
**Type:** Free-text entity
**Examples:**
- The Witcher 3
- Elden Ring
- Cyberpunk 2077
- Baldur's Gate 3
- God of War
- Red Dead Redemption 2
- Starfield
- Hogwarts Legacy

### Entity 2: game_genre (wit/wikipedia)
**Type:** Keywords
**Values:**
- RPG
- Action
- Strategy
- Shooter
- Adventure
- Simulation
- Sports
- Racing
- Horror
- Indie

## 4. Train Model

For each intent:
1. Type example in "Utterance" field
2. Mark the intent
3. If sentence contains game name, mark it as `game_name` entity
4. If contains genre, mark as `game_genre`
5. Click "Train and Validate"
6. Repeat for all examples (at least 10+ per intent)

## 5. Test

In "Understanding" section test:
```
What are the best games?
→ Intent: get_top_games

Tell me about Witcher 3
→ Intent: get_game_info
→ Entity: game_name = "Witcher 3"

Recommend me an RPG game
→ Intent: get_recommendation
→ Entity: game_genre = "RPG"
```

## 6. Copy Token

1. Go to Settings
2. Copy "Server Access Token"
3. Add to `.env.local`:
```
WIT_AI_TOKEN=your_token_here
```

## 7. Additional Test Examples

### For testing in chat:
```
"Hi!" → greeting
"What are the top games?" → get_top_games
"Tell me about Elden Ring" → get_game_info
"How to add a game?" → add_game
"Show statistics" → get_statistics
"Recommend me an action game" → get_recommendation
"What's the rating for Witcher 3?" → check_rating
"How to use the site?" → how_to_use
"What is myGameList?" → about_site
```

## 8. Tips for Better Results

- Add more examples for each intent (20+)
- Use variations (formal/informal)
- Add slang ("hey", "sup", "what's good")
- Train continuously with real user queries
- Check confidence score (>0.7 is good)
- Use different phrasings for same intent
- Mark entities consistently

---

**Ready to go!** 🚀
Kada postaviš sve u Wit.ai i dodaš token u `.env.local`, chatbot će raditi s AI prepoznavanjem namjera!
