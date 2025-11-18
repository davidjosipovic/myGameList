export default function Summary(props) {
  const game = props.game
  const truncateSummary = (text: string, maxLength: number) => {
    const sentences = text.split(/[.!]/).filter(Boolean);
    const truncatedText = sentences.slice(0, 2).join('. ') + '.';
    return truncatedText.length > maxLength ? truncatedText.slice(0, maxLength) + "..." : truncatedText;
  };
  
  return (
    <div className="w-full">
      {/* Genres and Game Modes */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {game.genres && game.genres.length > 0 && (
          game.genres.map((genre, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs sm:text-sm font-medium bg-grey-dark border border-green-light/30 text-green-light rounded-full hover:bg-green-light/10 transition-colors duration-200"
            >
              {genre.name}
            </span>
          ))
        )}

        {game.game_modes && game.game_modes.length > 0 && (
          game.game_modes.map((gameMode, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs sm:text-sm font-medium bg-grey-dark border border-white/30 text-white rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              {gameMode.name}
            </span>
          ))
        )}
      </div>

      {/* Summary Text */}
      {game.summary && (
        <div className="bg-grey-dark/50 border border-white/10 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-green-light mb-2 sm:mb-3">About</h3>
          <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed">
            {truncateSummary(game.summary, 500)}
          </p>
        </div>
      )}
    </div>
  )
}