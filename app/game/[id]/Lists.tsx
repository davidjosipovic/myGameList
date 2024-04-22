export default function Lists(props) {
    const game = props.game

    return (
        <section className="order-11">
            {/* Chunk 5: Platforms */}
            {game.platforms && game.platforms.length > 0 && (
                <div className="mt-6 ">
                    <h3 className="text-2xl font-semibold text-black mb-4">
                        Platforms
                        <hr className=" border-black" />
                    </h3>
                    <ul className="list-disc text-gray-800 list-inside">
                        {game.platforms.map((platform, index) => (
                            <li key={index}>{platform.name}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="basis-full h-0 "></div>

            {/*Chunk 8: Companies*/}
            {game.involved_companies && game.involved_companies.length > 0 && (
                <div className="mt-6 ">
                    <h3 className="text-2xl font-semibold text-black mb-4">
                        Involved companies
                        <hr className=" border-black" />
                    </h3>

                    <ul className="list-disc text-gray-800 list-inside">
                        {game.involved_companies.map((company, index) => (
                            <li key={index}>{company.company.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    )
}