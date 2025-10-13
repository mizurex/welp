import ChatPage from "@/components/chat-page";
import MobileRestriction from "@/components/mobile-restriction";


export default function Chat() {
  return (
    <MobileRestriction>
         <ChatPage/>
    </MobileRestriction>  
  );
}
