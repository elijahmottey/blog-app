package liv.codveda.blog.app.exception;

public class UnauthorizedException  extends RuntimeException{
    public UnauthorizedException(String message){
        super(message);
    }
}
