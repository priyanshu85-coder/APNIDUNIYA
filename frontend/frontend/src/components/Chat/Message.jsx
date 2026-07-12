import "./Message.css";

function Message({

    sender,

    text

}){

    return(

        <div

            className={

                sender==="user"

                ?

                "user"

                :

                "ai"

            }

        >

            <strong>

                {sender}

            </strong>

            <p style={{ whiteSpace:"pre-wrap " }}>
                {text}
            </p>

        </div>

    )

}

export default Message;