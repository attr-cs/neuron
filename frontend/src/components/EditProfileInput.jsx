

function EditProfileInput({ name, value, placeholder, type, onChange, icon }) {
    return (<>
        <div className="w-full outline-none bg-white border-gray-300 border-2 text-black px-6 pl-3 py-2 rounded-md mb-2 flex gap-4">
            {icon}
            <input
                className="outline-none w-full"
                type={type}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
            />
        </div>
    </>)
}
export default EditProfileInput