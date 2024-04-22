export default function Rating(props){
    const game=props.game
return(
    <div className="flex   sm:order-2 mt-4 sm:mt-0  gap-10 sm:gap-4 mx-auto sm:ml-auto sm:mx-0 pb-4">
            <div className="flex flex-col ml-auto">
              <p className="text-gray-600 font-medium"> IGDB Rating </p>
              <p className=" font-semibold text-xl text-center">
                {Math.floor(game.rating)}/100
              </p>
            </div>

            <div className="flex flex-col ">
              <p className="text-gray-600 font-medium ">
                {" "}
                Ratings Count
              </p>
              <p className=" font-semibold text-xl text-center">
                {game.rating_count}
              </p>
            </div>

            <div className="flex flex-col ">
              <p className="text-gray-600 font-medium ">
                {" "}
                Your Rating
              </p>
              <p className=" font-semibold text-center text-xl">N/A</p>
            </div>
          </div>
)
}