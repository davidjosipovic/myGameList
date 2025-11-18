export default function Rating(props) {
  const game = props.game
  
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-light';
    if (rating >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="bg-grey-dark border border-white/10 rounded-lg p-4 sm:p-6 shadow-lg hover:border-green-light/30 transition-all duration-300">
      <h3 className="text-lg sm:text-xl font-semibold text-green-light mb-3 sm:mb-4">Ratings</h3>
      
      <div className="space-y-3 sm:space-y-4">
        {/* mGL Rating */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-green-light flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium text-white/90 text-sm sm:text-base">mGL</span>
          </div>
          <span className={`text-xl sm:text-2xl font-bold ${getRatingColor(game.rating)}`}>
            {Math.floor(game.rating)}
          </span>
        </div>

        {/* Ratings Count */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="font-medium text-white/90 text-sm sm:text-base">Count</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-white">
            {game.rating_count?.toLocaleString() || 0}
          </span>
        </div>

        {/* Your Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-green-light flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-white/90 text-sm sm:text-base">You</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-green-light">
            {props.myRating || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}