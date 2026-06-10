import { ConversationType, MessageType } from "../types/convo.type";

export interface ConvoInterface {
    create(convoDetails: ConversationType): Promise<string>;
    update(convoID: string, title: string): Promise<ConversationType>;
    delete(convoID: string): Promise<Boolean>;
    getConvo(convoID: string): Promise<ConversationType>;
    getConvos(userID: string, limit: number, offset: number): Promise<ConversationType[]>
    addMessage(convoID: string, messageDetails: MessageType): Promise<ConversationType>
}