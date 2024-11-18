import { useRecoilValue } from "recoil"
import { authState, userState } from "../store/atoms"
import { useNavigate } from "react-router-dom"

function Home(){
    const auth = useRecoilValue(authState)
    const navigate = useNavigate();
    const user = useRecoilValue(userState);
    return (<>
        <header>
            <h1>Welcome to Neuron: The Ultimate Network!</h1>
            {auth.isAuthenticated && user && <h2>Hello, {user.user?.firstname}!</h2>}

        </header>
        <main>
             <h2>Latest Posts</h2>
            
            <section>
                <h3>Join Our Community</h3>
                {!auth.isAuthenticated && (
                    <p>
                        Sign Up today to connect with friends worldwide and share your thoughts!
                        <button onClick={()=>{navigate("/signup")}}>Register</button>
                        <button onClick={()=>{navigate("/signin")}}>Log In</button>
                    </p>
                )}
            </section>
        </main>
    </>)
}

export default Home