const MyGameListHome: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-200 flex flex-col justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Welcome to MyGameList</h1>
                <p className="mb-4">
                    Track and showcase your favorite games, discover new ones, and connect with gamers like you.
                </p>
                <div className="flex justify-between">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Sign In
                    </button>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyGameListHome;
