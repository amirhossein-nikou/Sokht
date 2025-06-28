import { MeliPayamak } from 'node-melipayamak'
import { SmsDto } from '../types/sms.type';
export async function SendSms(smsDto: SmsDto) {
    try {
        const { to, args, bodyId } = smsDto
        const sms = new MeliPayamak("1a0b0ffdc9444004a60e2c1a0ab87bec")
        await sms.sendShared({ to, args, bodyId })
    } catch (error) {
        throw error
    }
}