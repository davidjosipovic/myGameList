# Chatbot Dokumentacija - myGameList

## 1. Koju vrstu chatbota ste odabrali?

Odabrali smo **hibridni chatbot** koji kombinira:
- **Rule-based pristup** za strukturiranu konverzaciju i pattern matching
- **NLP (Natural Language Processing)** putem Wit.ai API-ja za prepoznavanje korisničkih namjera
- **Stateful konverzaciju** s kontekstom sesije koja omogućava multi-step interakcije

Chatbot je implementiran kao **task-oriented assistant** specijaliziran za:
- Pretraživanje i preporuke video igara
- Pružanje informacija o igricama (ocjene, žanrovi, platforme)
- Pomoć korisnicima u korištenju platforme

## 2. Kako ste prilagodili strukturu konverzacije?

Implementirali smo **state machine** s više stanja za složene konverzacijske flow-ove:

### Stanja konverzacije:

**STATE 0 - Početno stanje:**
- Korisnik postavlja inicijalno pitanje
- Wit.ai prepoznaje namjeru (intent) i ekstrahira entitete (platform, genre, game name)
- Bot odlučuje hoće li odgovoriti direktno ili tražiti dodatne informacije
- Provjeravaju se pattern overrides prije slanja Wit.ai-u

**STATE 1 - Prikupljanje dodatnih podataka:**
- Aktivira se kada korisnik traži preporuke ali nije naveo platformu NI žanr
- Bot pita: "What platform or genre are you interested in?"
- Prihvaća odgovor s platformom ILI žanrom ILI oboje
- Ako korisnik promijeni temu (pita drugo pitanje), resetira se stanje i odgovara na novo pitanje
- Ako korisnik kaže "all/any/every", prelazi na top games bez filtera

**STATE 3 - Filtriranje similar games:**
- Aktivira se kada je detektirana samo `similar_game` entitet bez platforme ili žanra
- Bot pita: "Would you like to specify a genre or platform for filtering?"
- Korisnik može specificirati filtere ili reći "no/all" za sve similar games
- Nakon odgovora, vraća rezultate i resetira na STATE 0

**Napomena:** Nema STATE 2 u kodu - sistem koristi samo STATE 0, STATE 1 i STATE 3.

### Session Management:

```typescript
const conversationState = new Map<string, {
  step: number;
  data: { platform?: string; genre?: string };
  timestamp: number;
}>();
```

- Svaki korisnik ima jedinstveni `sessionId`
- Stanje sesije se čuva u memoriji
- Automatsko čišćenje neaktivnih sesija nakon 30 minuta
- Cleanup interval od 10 minuta za optimizaciju memorije

### Pattern Override System:

Implementirali smo **smart detection** koji prepoznaje specifične uzorke prije slanja Wit.ai-u:

1. **About Site Pattern** - `/what is|about|describe|explain|tell me about (mygamelist|this site)/i`
   - Sprečava loop gdje bi "what is mygamelist" triggerirao GameRecommendation
   
2. **Add Game Pattern** - `/\b(how|can)\s+(do|to|i)?\s*(add|put|save|track) (game|games)/i`
   - Direktno prepoznaje pitanja o dodavanju igara
   
3. **All Games Pattern** - `/\b(all|any|every|top)\s+(platform|genre|game)/i`
   - Detektira kada korisnik traži sve igre ili top games bez filtriranja
   - Koristi se samo u STATE 0
   
4. **Keywords Detection** - `/\b(all|any|every)\b/i`
   - U STATE 1 i STATE 3 čisti entitete ako korisnik kaže "all platforms" ili "any genre"
   - Prelazi na top games bez specifičnih filtera

### Smart Detection za Game Info:

Implementiran je **intelligent game name detection** koji kombinira više faktora:

```typescript
// Ako poruka sadrži question riječi i similar_game entitet (ali ne game_name)
const questionWords = /\b(what|tell|about|info|information|explain|describe|details|is)\b/i;
const hasQuestionWord = questionWords.test(message);
const hasQuestionMark = message.includes('?');

if ((hasQuestionWord || hasQuestionMark) && similarGame && !gameName) {
  actualIntent = 'get_game_info';
  actualGameName = similarGame;
}
```

Ovo rješava problem gdje Wit.ai klasificira "What is Elden Ring?" kao recommendation umjesto game info.

## 3. Koje ste namjere dodali i kako poboljšavaju korisničko iskustvo?

Implementirali smo **10+ namjera (intents)** kroz Wit.ai:

### Osnovne namjere:

**1. greeting**
- Trigger: "hello", "hi", "hey", "good morning"
- Odgovor: Pozdravljanje + kratki opis što bot može
- Poboljšanje UX: Odmah postavlja kontekst i očekivanja

**2. get_game_info**
- Trigger: "tell me about [game]", "what is [game]", "info on [game]"
- Odgovor: Dohvaća stvarne podatke s IGDB API-ja:
  - Naziv igre i ocjena (rating/10)
  - Žanr i platforme
  - Datum izlaska
  - Summary/storyline tekst
- Fallback: Ako igra nije pronađena, daje generički helpful odgovor s 6 random varijacija
- Poboljšanje UX: Brzo dohvaćanje detaljnih informacija bez navigacije
- Smart detection: Automatski konvertira `similar_game` entitet u `game_name` ako pitanje sadrži question words

**3. get_recommendation (GameRecommendation)**
- Trigger: "recommend a game", "what should I play", "suggest games"
- Flow ovisi o entitetima:
  - **Ako nema platform NI genre NI similar_game** → STATE 1 (traži bilo koji filter)
  - **Ako ima samo similar_game** → STATE 3 (nudi dodatno filtriranje)
  - **Ako ima platform ILI genre** → Direktno vraća rezultate s IGDB-a
- Odgovor: Lista igara s njihovim imenima + kontekst filtera
- Poboljšanje UX: Fleksibilan conversational flow koji se prilagođava korisniku

**4. get_top_games**
- Trigger: "top games", "best games", "highest rated"
- Također se aktivira kada korisnik kaže "all/any/every" uz platform ili genre
- Odgovor: Dohvaća top games s IGDB API-ja (bez filtera) + vraća listu s imenima
- Fallback: Ako API poziv ne uspije, vraća hardcoded listu poznatih igara
- Poboljšanje UX: Brzi pristup najbolje ocijenjenim igrama bez potrebe za filterima

**5. get_statistics**
- Trigger: "show stats", "statistics", "data visualization"
- Odgovor: Upućuje na top gaming listu na home page-u
- Poboljšanje UX: Navigacija do D3.js vizualizacija

### Pomoćne namjere:

**6. how_to_use**
- Trigger: "how does this work", "how to use", "help me get started", "help"
- Odgovor: 3 random varijacije detaljnih step-by-step uputa
- Svaka varijacija pokriva:
  - Registraciju i login
  - Pretraživanje igara
  - Dodavanje u listu
  - Ocjenjivanje
  - Top gaming list na home page-u
  - Korištenje chatbota
- Poboljšanje UX: Smanjuje learning curve, daje jasne akcijske korake

**7. add_game**
- Trigger: "how do I add a game", "how to track games"
- Odgovor: 3 random varijacije s detaljnim tutorialima
- Poboljšanje UX: Direktan odgovor na najčešće pitanje

**8. about_site**
- Trigger: "what is mygamelist", "about this site", "tell me about this platform"
- Pattern override: Detektira se regex-om prije Wit.ai poziva kako bi se izbjegao loop
- Odgovor: 6 random varijacija s opisom platforme
- Svaka varijacija pokriva:
  - Što je myGameList
  - Funkcionalnosti (game tracking, rating system, AI chatbot)
  - Integraciju s IGDB API-jem
  - D3.js vizualizacije na home page-u
- Poboljšanje UX: Jasna komunikacija vrijednosti proizvoda, različite perspektive

**9. check_rating**
- Trigger: "what's the rating of [game]", "how good is [game]"
- Odgovor: Generički odgovor koji upućuje na search funkcionalnost ili top gaming list
- **Napomena:** Nema direktnog API poziva za specifičnu igru u ovom intentu - samo informativna poruka
- Poboljšanje UX: Usmjerava korisnika gdje može pronaći traženu informaciju

### Završne namjere:

**10. farewell**
- Trigger: "bye", "goodbye", "see you", "exit"
- Odgovor: 4 random varijacije oproštajnih poruka
- Poboljšanje UX: Prirodan kraj konverzacije

**11. thank_you**
- Trigger: "thanks", "thank you", "appreciate it"
- Odgovor: "You're welcome! Feel free to ask anything else! 😊"
- Poboljšanje UX: Educiran i prijateljski ton

**12. exit**
- Trigger: "stop", "quit", "cancel"
- Odgovor: Potvrda izlaza + mogućnost ponovnog pokretanja
- Poboljšanje UX: Jasna kontrola nad razgovorom

## 4. Kako ste obučili bota za prepoznavanje različitih korisničkih pitanja?

### Wit.ai Obuka:

**Training Data:**
- Svaka namjera ima **7-35 training utterances** (primjera)
- Korištene varijacije: formalno/neformalno, kratko/dugo, različiti glagoli

Primjer za `how_to_use` intent (35 utterances):
```
- How do I use this?
- How does this work?
- Can you help me get started?
- What can I do here?
- Show me how to use this platform
- I need help using this site
- Guide me through the features
- What are the main features?
... (35 ukupno)
```

**Entity Extraction:**

Wit.ai pokušava ekstrahirati više mogućih naziva entiteta jer se format mijenja:

```typescript
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
```

**Ekstrahovani entiteti:**
- **platform** - Traži: `'platform:platform'`, `'platform'`, `'wit$location:location'`
- **genre** - Traži: `'genre:genre'`, `'genre'`, `'game_genre'`, `'wit$game_genre:game_genre'`
- **game_name** - Traži: `'game_name:game_name'`, `'game_name'`, `'wit$game_name:game_name'`
- **similar_game** - Traži: `'similar_game:similar_game'`, `'similar_game'`, `'wit$similar_game:similar_game'`

**Važno:** Entiteti se vraćaju kao array-i (mogu biti multiple vrijednosti), osim game_name i similar_game koji su single values.

### Custom Pattern Matching:

Prije slanja poruke Wit.ai-u, provjeravaju se **pattern overrides** koji rješavaju edge cases:

```typescript
// 1. About Site Detection (STATE 0)
const aboutSitePattern = /\b(what is|about|describe|explain|tell me about)\s+(mygamelist|this site|this website|this platform|the site|your site)\b/i;
if (aboutSitePattern.test(message)) {
  return generateResponse('about_site', ...);
}

// 2. Add Game Detection (STATE 0)
const addGamePattern = /\b(how|can)\s+(do|to|i)?\s*(add|put|include|save|track|insert|upload)\s+(game|games|a game)/i;
if (addGamePattern.test(message)) {
  return generateResponse('add_game', ...);
}

// 3. All Games Detection (STATE 0)
const allGamesPattern = /\b(all|any|every|top)\s+(platform|genre|game)/i;
const hasAllKeyword = /\b(all|any|every)\b/i.test(message);
if (actualIntent === 'get_top_games' || hasAllKeyword) {
  return generateResponse('get_top_games', { platform: [], genre: [] });
}

// 4. Smart Game Info Detection (STATE 0)
const questionWords = /\b(what|tell|about|info|information|explain|describe|details|is)\b/i;
if ((questionWords.test(message) || message.includes('?')) && similarGame && !gameName) {
  actualIntent = 'get_game_info';
  actualGameName = similarGame;
}
```

**Zašto je ovo potrebno?**
- Wit.ai ponekad krivo klasificira specifične upite
- "What is mygamelist" bi triggerirao GameRecommendation umjesto about_site
- "How do I add games" bi se mogao protumačiti kao get_recommendation
- "All platforms" bi ekstrahovao platform entitet umjesto da vrati top games

### Genre Mapping Enhancement:

Implementiran je **genreUtils.ts** modul koji mapira prirodne nazive žanrova i gameplay stilova na IGDB genre ID-ove.

**Primjeri mapiranja:**

```typescript
const genreMapping: Record<string, number> = {
  // Standardni žanrovi
  "rpg": 12,
  "role-playing": 12,
  "shooter": 5,
  "action": 2,
  
  // Gameplay stilovi
  "roguelike": 12,
  "roguelite": 12,
  "souls-like": 12,
  "soulslike": 12,
  "metroidvania": 8,
  
  // Perspektiva
  "fps": 5,
  "first-person shooter": 5,
  "third-person": 2,
  
  // Tematski žanrovi
  "horror": 31,
  "survival": 31,
  "stealth": 31,
  
  // Ostali
  "sandbox": 13,
  "mmo": 12,
  "mmorpg": 12,
  "jrpg": 12,
  "crpg": 12,
  // ... ukupno 56+ mapiranja
};
```

**Kako radi:**
1. Korisnik kaže "roguelike games for PC"
2. Wit.ai ekstrahira genre: "roguelike"
3. genreUtils pretvara "roguelike" → IGDB genre ID 12 (RPG)
4. IGDB query: `where genres = (12) & platforms = (6)`

**Benefit:** Korisnik ne mora znati točne IGDB nazive - može koristiti prirodan gaming slang.

## 5. Što ste naučili o optimizaciji odgovora tijekom obuke?

### 1. Varijacija odgovora sprečava monotoniju:

**Problem:** Bot koji uvijek daje isti odgovor djeluje robotski.

**Rješenje:** Random selection iz 3-4 varijacije:

```typescript
const helpResponses = [
  "🎮 Here's how to get started:\n1. Create an account...",
  "📚 Quick Guide:\n• Search for games...",
  "🌟 Welcome! Here's what you can do:\n1. Browse games...",
  "🚀 Let me help you:\nStep 1: Create your profile..."
];

const randomResponse = helpResponses[Math.floor(Math.random() * helpResponses.length)];
```

### 2. Emoji povećavaju engagement:

Dodavanje emotikona čini odgovore:
- Vizualno privlačnijima
- Lakšim za skeniranje
- Prijateljskijima

Primjer:
```
✅ Instead of: "The game is rated 9.5"
✨ Better: "⭐ The game is rated 9.5/10! 🎮"
```

### 3. Strukturirani odgovori su čitljiviji:

**Prije optimizacije:**
```
You can search for games using the search bar and you can add games to your list and rate them and also browse carousels.
```

**Nakon optimizacije:**
```
🎮 Here's how to get started:

1. 🔍 Search for games using the search bar
2. ➕ Add games to your personal list
3. ⭐ Rate and review your favorites
4. 📊 View your gaming statistics
```

### 4. Error handling poboljšava pouzdanost:

**Fallback strategije:**
- Ako Wit.ai ne odgovori → Generic helpful response
- Ako IGDB API ne radi → Cached/fallback podaci
- Ako nema rezultata → Sugestija za šire pretraživanje

```typescript
try {
  const witResponse = await fetch(WIT_AI_URL);
  // ... obrada
} catch (error) {
  return NextResponse.json({
    reply: "Oops! Something went wrong. This could be a network issue or the AI service might be temporarily unavailable. Please try again! 🔄"
  });
}
```

### 5. Kontekstualna svijest povećava točnost:

**Naučeno:** Bot mora pamtiti što je korisnik već rekao i detektirati promjene teme.

**Implementacija:**
```typescript
conversationState.set(sessionId, {
  step: 1,
  data: { platform: ["PC"], genre: [] },
  timestamp: Date.now()
});
```

**Napredna funkcionalnost - Topic switching:**

```typescript
// U STATE 1 ili STATE 3
if (actualIntent === 'get_game_info' || actualIntent === 'about_site' || 
    actualIntent === 'greeting' || actualIntent === 'how_to_use') {
  conversationState.delete(sessionId || 'default');
  const reply = await generateResponse(actualIntent, {...});
  return NextResponse.json({ response: reply, intent: actualIntent });
}
```

Ako korisnik u sredini recommendation flow-a pita nešto drugo (npr. "what is Elden Ring?"), bot:
1. Detektira novi intent
2. Briše staro conversation state
3. Odgovara na novo pitanje
4. Resetira na STATE 0

**Primjer konverzacije:**
```
User: "I want a game recommendation"
Bot: "What platform or genre are you interested in?"
[STATE 1 - čeka filter]

User: "What is Cyberpunk 2077?"
[Detektira get_game_info intent]
Bot: [Briše STATE 1, vraća info o Cyberpunk-u]
[STATE 0 - fresh start]
```

### 6. Character limit i validacija inputa:

**Implementacija u ChatbotButton.tsx:**

```typescript
const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;
  if (inputMessage.length > 500) {
    alert('Message too long. Please keep it under 500 characters.');
    return;
  }
  // ... rest of logic
}
```

**Zašto 500 karaktera?**
- Sprečava spam i abuse
- Optimizira Wit.ai API calls (manji payloadi)
- Tjera korisnike na konciznost
- Štiti od slučajnih paste-ova velikih tekstova

### 7. Session cleanup sprečava memory leak:

```typescript
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes
  
  for (const [sessionId, state] of conversationState.entries()) {
    if (now - state.timestamp > timeout) {
      conversationState.delete(sessionId);
    }
  }
}, 10 * 60 * 1000); // Cleanup every 10 minutes
```

### 8. Auto-scroll poboljšava UX:

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

### 9. Whitespace formatting čini poruke čitljivijim:

```typescript
<div className="whitespace-pre-line">
  {message.text}
</div>
```

Omogućava line breaks u odgovorima:
```
🎮 Top 5 RPG Games:

1. The Witcher 3 - ⭐ 9.5/10
2. Baldur's Gate 3 - ⭐ 9.7/10
```

### 10. Typing indicator i error messaging:

**Typing indicator:**

```typescript
// Prije API poziva
setMessages(prev => [...prev, { text: '...', sender: 'bot' }]);

// Nakon odgovora
setMessages(prev => {
  const withoutTyping = prev.slice(0, -1); // ukloni "..."
  return [...withoutTyping, { text: data.response, sender: 'bot' }];
});
```

Korisnik vidi "..." dok bot "razmišlja", što daje:
- Vizualni feedback da se nešto događa
- Osjećaj naturalnosti (kao u iMessage, WhatsApp)
- Sprečava da korisnik misli da je bot stao

**Better error messages:**

```typescript
catch (error) {
  setMessages(prev => {
    const withoutTyping = prev.slice(0, -1);
    return [...withoutTyping, { 
      text: 'Oops! Something went wrong. This could be a network issue or the AI service might be temporarily unavailable. Please try again in a moment.', 
      sender: 'bot' 
    }];
  });
}
```

Umjesto generičkog "Error", korisnik dobiva:
- Objašnjenje što se moglo dogoditi
- Reassurance da nije njegova greška
- Poziv na akciju (pokušaj ponovo)

### 11. Confidence threshold za intente:

```typescript
if (confidence >= 0.5) {
  const reply = await generateResponse(actualIntent, {...});
  return NextResponse.json({ response: reply, intent: actualIntent, confidence });
}
```

**Zašto 0.5?**
- Ispod 50% confidence, Wit.ai nije siguran što korisnik želi
- Fallback: "I'm not sure what you're asking. I can help you with..."
- Sprečava krive odgovore s lošom klasifikacijom

**Napomena:** Confidence se provjerava NAKON pattern overrides, što znači da pattern detection ima prioritet.

### 12. Logging i debugging:

```typescript
console.log("Wit.ai Response:", JSON.stringify(witData, null, 2));
console.log("Extracted:", { intent, confidence, platform, genre, gameName, similarGame });
console.log(`Smart detection: Converting similarGame "${similarGame}" to game info request`);
console.log('Pattern detection: Overriding to add_game intent');
```

**Benefit tijekom development-a:**
- Vidi se točno što Wit.ai vraća
- Lakše debugiranje entity extraction problema
- Prati se kada se aktiviraju overrides
- Može se reproducirati user issue s logovima

### 13. Array deduplication za entitete:

```typescript
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
```

**Zašto Set?**
- Wit.ai može vratiti duplikate: `["PC", "pc", "PC"]`
- `new Set()` uklanja duplikate
- `.toLowerCase()` normalizira case (PC = pc)
- Rezultat: `["pc"]` - čist array bez ponavljanja

## Implementacija - Tehnički Detalji

### Tehnologije:
- **Next.js 13** (App Router)
- **Wit.ai API v20241207** (NLP)
- **IGDB API** (Gaming database)
- **TypeScript** (Type safety)
- **Tailwind CSS** (Styling)

### API Route: `/api/chat/route.ts`
- POST endpoint za chatbot konverzaciju
- Session management s Map strukture
- Integration s Wit.ai i IGDB
- Error handling i fallback responses

### Komponenta: `components/ChatbotButton.tsx`
- Global chatbot UI
- Floating action button
- Sliding chat panel
- Message history
- Auto-scroll functionality

### Konfiguracija: `WITAI_SETUP.md`
- Dokumentacija Wit.ai obuke
- Lista svih intents s utterances
- Entity extraction upute

### D3.js Vizualizacija: `components/GameStatsChart.tsx`
- **Interactive bar chart** za top gaming list
- Renderira se na home page-u umjesto HTML tablice
- Features:
  - Animirani rast barova (1000ms duration, staggered by 100ms)
  - Gradient boje (green-light → green-dark)
  - Tooltips s detaljima (game name, rating, reviews)
  - Responsive design (prilagođava se mobile/desktop)
  - Grid lines za bolje očitavanje
  - Average rating line (crvena isprekidana linija)
  - Hover effects (opacity i drop-shadow mijenjanje)
- Podaci dolaze s `/api/stats/public` endpoint-a
- Tema: Tamna pozadina s bijelim tekstom i zelenim akcentima

### API Endpoint: `/api/stats/public/route.ts`
- GET endpoint za dohvat top gaming statistics
- Kombinira top-rated games i popular games s IGDB-a
- Filter: `version_parent = null` (isključuje DLC-ove i expansione)
- Vraća array od 8 GameStats objekata:
  ```typescript
  interface GameStats {
    name: string;
    rating: number; // 0-10 skala
    plays: number;  // rating_count s IGDB-a
  }
  ```
- Fallback data ako IGDB API ne radi

---

## Screenshotovi

> **Napomena:** Dodati screenshotove koji prikazuju:
> 
> 1. **Početni ekran chatbota** - Floating button i inicijalni pozdrav
> 2. **Konverzacija preporuke igara** - Multi-step flow (STATE 0 → 1 → 2 → 3)
> 3. **Game info query** - "Tell me about The Witcher 3"
> 4. **Help response** - Prikaz strukturiranih uputa
> 5. **Top games lista** - Rezultat s IGDB API-ja
> 6. **About site** - Informacije o platformi
> 7. **Error handling** - Prikaz fallback poruke
> 8. **Wit.ai dashboard** - Training data i intents
> 9. **IGDB API response** - Primjer game data
> 10. **D3.js vizualizacija** - Top gaming list chart na home page

---

## Zaključak

Chatbot uspješno kombinira **rule-based** (pattern matching) i **AI-powered** (Wit.ai NLP) pristupe kako bi pružio prirodnu i korisnu konverzaciju. 

### Postignuti rezultati:

**Conversational AI:**
- 10+ implementiranih intenta s visokom točnošću prepoznavanja
- Multi-step konverzacijski flow s 3 stanja (STATE 0, 1, 3)
- Smart detection sistema koji rješava edge cases prije Wit.ai poziva
- Topic switching - korisnik može promijeniti temu u bilo kojem trenutku

**IGDB Integration:**
- Real-time dohvat game podataka (rating, summary, genres, platforms)
- Top games lista s filterima (platform, genre, similar games)
- Preko 56 žanr mapiranja za prirodan jezik (roguelike, fps, metroidvania)
- Filter za base games (`version_parent = null` isključuje DLC-ove)

**User Experience:**
- 3-6 random varijacija za svaki odgovor (sprečava monotoniju)
- Strukturirani odgovori s emoji-ima i brojevima
- Typing indicator tokom procesiranja
- Auto-scroll u chat prozoru
- 500 character limit s clear error porukama
- Session management s automatskim cleanup-om (30 min timeout)

**D3.js Data Visualization:**
- Interactive bar chart na home page-u
- Animirani prikaz top 8 igara s IGDB-a
- Responsive design (mobile + desktop)
- Tooltips, average line, hover effects
- Tamna tema s zelenim gradientom

### Ključni faktori uspjeha:

✅ **Pattern Override System** - Rješava edge cases koje Wit.ai krivo klasificira  
✅ **Stateful Konverzacija** - Pamti kontekst i omogućava multi-turn dialogue  
✅ **Flexible Entity Extraction** - Prihvaća multiple format varijacije  
✅ **Smart Game Info Detection** - Konvertira similar_game → game_name za pitanja  
✅ **Topic Switching Logic** - Omogućava prirodnu promjenu teme  
✅ **Random Response Variation** - 3-6 varijacija po intentu za prirodnost  
✅ **Integration s IGDB API-jem** - Real-time, ažurni podaci o igrama  
✅ **Session Management** - Cleanup old sessions, timestamp tracking  
✅ **Error Handling** - Informativne poruke, fallback responses  
✅ **D3.js Visualizations** - Profesionalni prikaz podataka  

### Tehnički stack:

- **Frontend:** Next.js 13 App Router, React, TypeScript, Tailwind CSS
- **AI/NLP:** Wit.ai API v20241207
- **Gaming Data:** IGDB API
- **Vizualizacija:** D3.js v7+
- **State Management:** Map-based session storage
- **Deployment:** Vercel-ready

### Metrike:

- **Intenti:** 10+ (greeting, get_game_info, get_recommendation, get_top_games, get_statistics, how_to_use, add_game, about_site, check_rating, farewell, thank_you, exit)
- **Pattern Overrides:** 4 (about_site, add_game, all_games, smart_game_detection)
- **Response Variations:** 30+ ukupnih varijacija kroz sve intente
- **Genre Mappings:** 56+ (standardni + gameplay stilovi + aliasi)
- **Session Timeout:** 30 minuta
- **Cleanup Interval:** 10 minuta
- **Character Limit:** 500 karaktera
- **Confidence Threshold:** 0.5 (50%)

Implementacija demonstrira best practices u chatbot development-u: kombinacija AI-a i rule-based logike, robust error handling, natural language variation, i seamless integration s external API-jima.
