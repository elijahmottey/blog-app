package liv.codveda.blog.app.exception;

public class NotFoundException  extends RuntimeException{
    public NotFoundException(String message){
        super(message);
    }
}
