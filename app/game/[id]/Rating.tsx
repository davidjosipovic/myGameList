export default function Rating(props) {
  const game = props.game
  return (
    <div className="flex flex-col text-white my-2 w-1/2 sm:w-full   rounded-xl text-sm p-2 gap-2 bg-grey-dark border border-white ">

      <div className="flex  ">
        <p className=" font-medium w-2/3"> mGL Rating </p>
        <p className=" font-bold ml-auto ">
          {Math.floor(game.rating)}/100
        </p>
      </div>

      <div className="flex ">
        <p className=" font-medium  w-2/3  ">
    
          Ratings Count
        </p>
        <p className=" font-bold ml-auto  ">
          {game.rating_count}
        </p>
      </div>

      <div className="flex">
        <p className=" font-medium  w-2/3 ">
          
          Your Rating
        </p>
        <p className=" font-bold ml-auto  ">{props.myRating}</p>
      </div>

    </div>
  )
}