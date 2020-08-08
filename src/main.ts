import * as https from 'https'
import * as querystring from 'querystring'
// import md5 from 'md5'; // 这种引入方式不正确
import md5 = require('md5')
import { appId, appSecret } from './private'

type ErrorMap = {
  [k: string]: string
}
const errorMap: ErrorMap = {
  52001: '请求超时',
  52002: '系统错误',
  52003: '用户认证失败',
  54000: '必填参数为空',
  54001: '签名错误',
  54004: '账户余额不足',
  unknown: '服务器繁忙'
}

export const translate = (word: string) => {

  const salt = Math.random()
  const sign = md5(appId + word + salt + appSecret)
  let from
  let to
  if (/[a-zA-Z]/.test(word[0])) {
    from = 'en'
    to = "zh"
  } else {
    from = 'zh';
    to = 'en'
  }

  const query: string = querystring.stringify({
    q: word, from: from, to: to, appid: appId, salt: salt, sign: sign
  })
  const options = {
    hostname: 'fanyi-api.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    // console.log('状态码:', response.statusCode);
    // console.log('请求头:', response.headers);
    let chunks: Buffer[] = []
    response.on('data', (chunk) => {
      chunks.push(chunk)
    });
    response.on('end', () => {
      const string = Buffer.concat(chunks).toString()
      // console.log(chunks.constructor);
      type BaiduResult = {
        error_code?: string,
        error_msg?: string,
        from: string,
        to: string,
        trans_result: {
          src: string,
          dst: string
        }[],
      }
      const object: BaiduResult = JSON.parse(string)
      if (object.error_code) {

        console.error(errorMap[object.error_code] || object.error_msg);
        process.exit(2) // 参数不为0表示有错误退出
      } else {
        object.trans_result.map(obj => {
          console.log(obj.dst);

        })
        // console.log(object.trans_result[0].dst);
        process.exit(0) // 参数为0表示没有错误并退出
      }
    })
  });
  request.on('error', (e) => {
    console.log(e);
  })
  request.end()
}