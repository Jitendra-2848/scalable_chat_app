import {Queue} from "bullmq"
const message_Queue = new Queue("message",{
    connection:{
        host:"127.0.0.1",
        port:6379,
        password:"yourpassword"
    }
});
export async function message_saving(data) {
    const res = await message_Queue.add("saving in Db",{
        data:data,
    })
    console.log(res.id);
}

