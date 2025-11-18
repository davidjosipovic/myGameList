export default function Lists(props) {
    const game = props.game

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Platforms Section */}
            {game.platforms && game.platforms.length > 0 && (
                <div className="bg-grey-dark border border-white/10 rounded-lg p-4 sm:p-6 shadow-lg hover:border-green-light/30 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-green-light flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-lg sm:text-xl font-semibold text-green-light">
                            Platforms
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {game.platforms.map((platform, index) => (
                            <li 
                                key={index} 
                                className="flex items-center gap-2 text-sm sm:text-base text-white/90 hover:text-green-light transition-colors duration-200"
                            >
                                <span className="w-1.5 h-1.5 bg-green-light rounded-full flex-shrink-0"></span>
                                <span>{platform.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Companies Section */}
            {game.involved_companies && game.involved_companies.length > 0 && (
                <div className="bg-grey-dark border border-white/10 rounded-lg p-4 sm:p-6 shadow-lg hover:border-green-light/30 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-green-light flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-lg sm:text-xl font-semibold text-green-light">
                            Involved Companies
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {game.involved_companies.map((company, index) => (
                            <li 
                                key={index} 
                                className="flex items-center gap-2 text-sm sm:text-base text-white/90 hover:text-green-light transition-colors duration-200"
                            >
                                <span className="w-1.5 h-1.5 bg-green-light rounded-full flex-shrink-0"></span>
                                <span>{company.company.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}