const  ImageKit = require("@imageKit/nodejs");



const ImageKit = new ImageKit({

    privateKey :"private_kV1hrn4SmK2I06D8HqOHt10zmSA="
})

async function uploadFile(buffer){
    const result  = await ImageKit.client.upload({
        file: buffer.toString("based64"),
        fileName: 'image_${Date.now()}.jpg'
    })
    return result;

}

module.exports = uploadFile;