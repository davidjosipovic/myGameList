export default function Lists(props) {
    const game = props.game

    return (
        <section className="">
            <h1 className='text-2xl text-white mb-2'>Lists</h1>

            <div className="flex  text-white my-2  rounded-xl text-sm p-2 gap-2 bg-grey-dark border border-white ">
                {game.platforms && game.platforms.length > 0 && (
                    <div className="">
                        <h2 className="text-lg  mb-2">
                            Platforms
                        </h2>
                        <ul className="list-disc  list-inside pl-1">
                            {game.platforms.map((platform, index) => (
                                <li key={index}>{platform.name}</li>
                            ))}
                        </ul>
                    </div>
                )}


                {/*Chunk 8: Companies*/}
                {game.involved_companies && game.involved_companies.length > 0 && (
                    <div className="">
                        <h3 className="text-lg mb-2">
                            Involved companies
                            
                        </h3>

                        <ul className="list-disc list-inside pl-1">
                            {game.involved_companies.map((company, index) => (
                                <li key={index}>{company.company.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {/* Chunk 5: Platforms */}

        </section>
    )
}