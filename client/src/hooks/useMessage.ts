import { useContext } from 'react';
import { MessageContext } from '../context/message';


export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    // console.log(context);
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};