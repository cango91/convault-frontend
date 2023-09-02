import SignupForm from "../SignupForm/SignupForm";

export default function SignupComponent({setInPage}){
    return (
        <>
        <SignupForm setInPage={setInPage} />
        </>
    );
}