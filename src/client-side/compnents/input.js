export default function Input(input) {
    return (
        <input 
            type={input.type}  
            className={`${input.width} h-10 ${input.rounded} outline-none ps-3 bg-neutral-100`} 
            id={input.id} 
            placeholder={input.placeholder} 
            onChange={input.handleChange} 
            value={input.value}
            disabled={input.disabled}
            required
        />
    )
}