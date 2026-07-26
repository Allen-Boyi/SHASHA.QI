import { useState,useEffects,useRef, useEffect } from "react";
import './authForm.css'; 
import ForgotPassword from './forgotpassword'

  
 function AuthForm({onLoginSuccess}) {
    const [isLogin,setIsLogin]=useState(true);
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    const [email,setEmail]=useState("");
    const [phone,setPhone]=useState("");
    const [confirm,setConfirm]=useState("");
    const [roles,setRoles]=useState([]);
    const [selectedRoleId,setSelectedRoleId]=useState("")
    const [message,setMessage]=useState("");
    const [isModalVisible,setIsModalVisible]=useState(false)

    const openModal=(e)=>{
        e.preventDefault();
        setIsModalVisible(true);
    }

    const closeModal=()=>{
        setIsModalVisible(false);
    }

    const WEBSITE_URL="http://192.168.100.100:5000";
    const handleLogin=async()=>{
        try {
            if(!username){
                setMessage("Username missing ")
                setTimeout(()=>{
                    setMessage("")
                },3000);
                return;
            }if(!password){
                setMessage("Password missing")
                setTimeout(()=>{
                    setMessage("")
                },3000)
                return;
            }

            const res=await fetch(WEBSITE_URL+'/login',{
                method:"POST",headers:{"Content-Type":"application/json"},
                body:JSON.stringify({username,password}),
            });
            if(!res.ok){
                console.warn("Error occuredn server responds with status code: ",res.status);
                const errorData=await res.json();
                if (errorData.missing){
                    console.error("Error details: ",errorData.missing);
                    setMessage("There are missing fields.",errorData.missing);
                    setUsername("");
                    setPassword("");
                }else{
                    console.error("Error occured details are, ",errorData.message);
                    setMessage(errorData.message||"Login Failed");
                    setUsername("");
                    setPassword("");
                }
                setTimeout(()=>{
                setMessage("");
            },3000)
                return;
            }
            const data =await res.json()
            console.log("Login successfull, ",data.message)
            if(onLoginSuccess){
                onLoginSuccess(data);
            }
            setMessage("Login succesfull! Welcome "+ data.username);
            setTimeout(()=>{
                setMessage("");
                setUsername("");
                setPassword("");
            },3000)
        } catch (error) {
            setMessage("Error connecting to the server")
            setUsername("");
            setPassword("");
            setTimeout(()=>{
                setMessage("");
            },3000)
        }
    }
    // the loading of the roles dropdown list
    async function fetchRoles(){
        try {
            const res= await fetch(WEBSITE_URL+"/Signup_form-init",{
                method:"GET",headers:{"Content-Type":"application/json"}
            });
            if(res.ok){
                const data =await res.json();
                setRoles(data.roles);
            }
        } catch (error) {
            console.error("Fetch error: ",err)
        }
    }
    useEffect(()=>{
        fetchRoles();
    },[]);
    // the signup api call---------------
    const handleSignup=async()=>{
        try {
            if(password!==confirm){
                console.log("Error password do not match");
                setMessage("Error password do not match");
                setTimeout(()=>{
                setMessage("");
            },3000)
                return;
            }
            if (!password){
                setMessage("Password missing");
                setTimeout(()=>{
                    setMessage("");
                },3000)
                return;
            }
            const res= await fetch(WEBSITE_URL+"/Signup",{
                method:"POST",headers:{"Content-Type":"application/json"},
                body:JSON.stringify({username,email,phone,
                    role_id:selectedRoleId,password
                })
            });
            if (!res.ok){
                console.warn("Server responds with error code: ",res.status);
                const errorData=await res.json();
                if(errorData.missing){
                    console.error("missing fields, ",errorData.missing);
                    setMessage("Error there is missing fields, ",errorData.missing);
                }else{
                    console.error("Error occured, details: "+errorData.message);
                    setMessage("Error occured, details: "+errorData.message);
                }
                setTimeout(()=>{
                setMessage("");
            },3000);
                return;
            }
            const data = await res.json()
            console.log("Success user successfully added check email to confirm account, "+data.message);
            setMessage("Success user successfully added check email to confirm account, "+data.message);
            setTimeout(()=>{
                setIsLogin(true);
                setMessage("");
            },3000)
        } catch (error) {
            console.error("Server error occured: ",error);
            setMessage("Server error occured: ",error);
            setTimeout(()=>{
                setMessage("");
            },3000)
        }
    }
   
   return (
     <div className='container'>
        <div className="form-container">
            <div className="form-toggle">
                <button className={isLogin?"active":""} onClick={()=>{setIsLogin(true);setUsername("");setPassword("");}}>Login</button>
                <button className={!isLogin?"active":""} onClick={()=>{setIsLogin(false);
                setUsername("");setPassword("");setConfirm("");setEmail("");setMessage("");setPhone("");setSelectedRoleId("");
                }}>Signup</button>
            </div>
            {isLogin?<>
                <div className="form">
                    <h2 >Login</h2>
                    <input type="text" name="Username" value={username} placeholder="Username" onChange={(e)=>setUsername(e.target.value)}></input>
                    <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} name="password" id="password" placeholder="Password" required/>
                    <a href="#" onClick={openModal}>Forgot Password</a><ForgotPassword isOpen={isModalVisible} onClose={closeModal}/>
                    <button onClick={handleLogin}>Login</button>
                    <p>Not a Member? <a href="#" onClick={()=>{setIsLogin(false);setUsername("");setPassword("");}}>Signup now</a></p>
                    {message && <p style={{color:'black'}}>{message}</p>}
                </div>
            </>:
                <div className="form">
                    <h2>Signup</h2>
                    <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username" />
                    <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
                    <input type="text" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" />
                    <select name="role_id" value={selectedRoleId} on onChange={(e)=>setSelectedRoleId(e.target.value)}>
                        <option value="" disabled>Select Role</option>
                        {roles.map((role)=>(<option key={role.role_id} value={role.role_id}>{role.role_name}</option>))}
                    </select>
                    <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" />
                    <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Confirm Password" />
                    <button onClick={handleSignup}>Signup</button>
                    {message && <p style={{color:"black"}}>{message}</p>}
                </div>
            }
        </div> 
     </div>
   );
 }
 
 export default AuthForm