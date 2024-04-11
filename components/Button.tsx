export default function Button(props){
    if (props.color==="green"){
        var bgColor="bg-green-light"
    }
    else if (props.color==="green"){
        var bgColor="bg-red"
    }
    
    return(
    <button 
    className={`hover:bg-green-dark hover:shadow-xl w-32 p-2 text-center text-lg rounded-lg font-bold ${bgColor} hover:bg-green-dark hover:shadow-xl w-32 p-2 text-center text-lg rounded-lg font-bold`}>
        {props.label} 
    </button>)
}