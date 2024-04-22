export default function Rating(props) {
  const game = props.game
  return (
    <div className="flex flex-col text-white my-2 w-1/2  rounded-xl text-sm p-2 gap-2 bg-grey-dark border border-white ">

      <div className="flex  ">
        <p className="text-gray-600 font-medium w-2/3"> mGL Rating </p>
        <p className=" font-bold ml-auto ">
          {Math.floor(game.rating)}/100
        </p>
      </div>

      <div className="flex ">
        <p className="text-gray-600 font-medium  w-2/3  ">
    
          Ratings Count
        </p>
        <p className=" font-bold ml-auto  ">
          {game.rating_count}
        </p>
      </div>

      <div className="flex">
        <p className="text-gray-600 font-medium  w-2/3 ">
          
          Your Rating
        </p>
        <p className=" font-bold ml-auto  ">N/A</p>
      </div>

    </div>
  )
}