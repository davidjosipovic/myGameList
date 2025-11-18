export default function Button(props){
    const getColorClasses = () => {
        if (props.color === "green") {
            return "bg-green-light hover:bg-green-dark text-grey-dark hover:shadow-lg hover:shadow-green-light/20";
        } else if (props.color === "red") {
            return "bg-red-500 hover:bg-red-600 text-white hover:shadow-lg hover:shadow-red-500/20";
        }
        return "bg-grey-dark hover:bg-grey-light text-white border border-white/20";
    };

    return(
        <button 
            onClick={props.onClick}
            disabled={props.disabled}
            className={`w-full px-6 py-2 text-center text-lg rounded-lg font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${getColorClasses()} ${props.className || ''}`}
        >
            {props.label} 
        </button>
    )
}