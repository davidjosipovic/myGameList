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

        <div className="mb-2 text-white">
            <h2 className="md:text-5xl sm:text-3xl text-2xl font-semibold text-black">
                {game.name}
            </h2>
            <p className="text-gray-600">
                <span className="font-medium">Release Date:</span>{" "}
                {formatUnixTimestamp(game.first_release_date)}
            </p>

        </div>)
}