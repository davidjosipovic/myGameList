export default function Heading(props) {
    const game = props.game

    function formatUnixTimestamp(unixTimestamp: number): string {
        const date = new Date(unixTimestamp * 1000);
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return date.toLocaleDateString(undefined, options);
    }

    return (
        <div className="w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                {game.name}
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 text-white/80">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-green-light flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm sm:text-base lg:text-lg font-medium">
                    <span className="hidden sm:inline">Release Date: </span>
                    <span className="text-white">{formatUnixTimestamp(game.first_release_date)}</span>
                </p>
            </div>
        </div>
    )
}