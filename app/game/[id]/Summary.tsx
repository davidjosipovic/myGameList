export default function Summary(props) {
  const game = props.game
  const truncateSummary = (text: string, maxLength: number) => {
    const sentences = text.split(/[.!]/).filter(Boolean);
    const truncatedText = sentences.slice(0, 2).join('. ') + '.';
    return truncatedText.length > maxLength ? truncatedText.slice(0, maxLength) + "..." : truncatedText;
  };
  return (
  <div className="w-3/4  p-1 mt-1">

<div className="flex flex-wrap gap-1">

    {game.genres && game.genres.length > 0 && (
      <div className="">
        <ul className="flex flex-wrap gap-1 ">
          {game.genres.map((genre, index) => (
            <li
              className="text-xs border rounded-3xl bg-grey-dark border-white text-white px-1 whitespace-nowrap"
              key={index}
            >
              {genre.name}
            </li>
          ))}
        </ul>
      </div>
    )}

    {game.game_modes && game.game_modes.length > 0 && (
      <div className="">
        <ul className="flex flex-wrap  gap-1">
          {game.game_modes.map((gameMode, index) => (
            <li
              className=" text-xs bg-grey-dark  border rounded-3xl border-white text-white  px-1  whitespace-nowrap"
              key={index}
            >
              {gameMode.name}
            </li>
          ))}
        </ul>
      </div>
    )}
    </div>
   
    <p className=" text-black text-xs text-white mb-4 mt-1 sm:mt-5 md:mt-0">{truncateSummary(game.summary, 500)}</p>
  </div>)
}