import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/authStore";

const ErrorPage = () => {
    const {user} = useAuthStore();
    const navigate = useNavigate();
    return (
        <div className="flex flex-col gap-1  items-center justify-center h-[calc(100vh-15rem)]">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-xl  text-muted-foreground">Page Not Found</p>
            <div className="flex pt-6 gap-4">
            {user ? (
                <Button onClick={() => navigate('/')}>Go Home</Button>
            ) : (
                <Button onClick={() => navigate('/login')}>Go Login</Button>
            )}
            </div>
        </div>
    );
};

export default ErrorPage;
