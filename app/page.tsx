
const MyGameListHome: React.FC = () => {
    fetch(
        "https://api.igdb.com/v4/games",
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': process.env.BEARER_ACCESS_TOKEN
          },
          body: "fields age_ratings,aggregated_rating,aggregated_rating_count,alternative_names,artworks,bundles,category,checksum,collection,cover,created_at,dlcs,expanded_games,expansions,external_games,first_release_date,follows,forks,franchise,franchises,game_engines,game_localizations,game_modes,genres,hypes,involved_companies,keywords,language_supports,multiplayer_modes,name,parent_game,platforms,player_perspectives,ports,rating,rating_count,release_dates,remakes,remasters,screenshots,similar_games,slug,standalone_expansions,status,storyline,summary,tags,themes,total_rating,total_rating_count,updated_at,url,version_parent,version_title,videos,websites;"
      })
        .then(response => {
            console.log(response.json());
        })
        .catch(err => {
            console.error(err);
        });
    return (
        <div className="min-h-screen bg-gray-200 flex flex-col justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Welcome to MyGameList</h1>
                <p className="mb-4">
                    Track and showcase your favorite games, discover new ones, and connect with gamers like you.
                </p>
               
                <div className="flex justify-between">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Sign In
                    </button>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyGameListHome;
