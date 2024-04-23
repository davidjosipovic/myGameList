export default function Heading(props) {
    const game = props.game

    function formatUnixTimestamp(unixTimestamp: number): string {
        const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return date.toLocaleDateString(undefined, options);
    }

    return (

        <div className="mb-2 w-full text-white sm:order-1 lg:w-5/6 lg:mx-4 ">
            <h2 className="md:text-5xl sm:text-3xl text-2xl font-semibold ">
                {game.name}
            </h2>
            <p className="text-white text-sm">
                <span className="font-medium">Release Date:</span>{" "}
                {formatUnixTimestamp(game.first_release_date)}
            </p>

        </div>)
}