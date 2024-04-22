export default function Summary(props) {
  const game = props.game
  const truncateSummary = (text: string, maxLength: number) => {
    const sentences = text.split(/[.!]/).filter(Boolean);
    const truncatedText = sentences.slice(0, 2).join('. ') + '.';
    return truncatedText.length > maxLength ? truncatedText.slice(0, maxLength) + "..." : truncatedText;
  };
  return (
  <div className="w-3/4">

<div className="flex">

    {game.genres && game.genres.length > 0 && (
      <div className="">
        <ul className="flex gap-1 my-2">
          {game.genres.map((genre, index) => (
            <li
              className="text-xs border rounded-3xl border-black text-black px-1 whitespace-nowrap"
              key={index}
            >
              {genre.name}
            </li>
          ))}
        </ul>
      </div>
    )}

    {game.game_modes && game.game_modes.length > 0 && (
      <div className="pl-1">
        <ul className="flex my-2 gap-1">
          {game.game_modes.map((gameMode, index) => (
            <li
              className=" text-xs  border border-black rounded-3xl text-black  px-1  whitespace-nowrap"
              key={index}
            >
              {gameMode.name}
            </li>
          ))}
        </ul>
      </div>
    )}
    </div>
   
    <p className=" text-black text-xs text-white mb-4 sm:mt-5 md:mt-0">{truncateSummary(game.summary, 500)}</p>
  </div>)
}