const QRCode = require('qrcode');

// 获取本地服务器地址
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://curvy-eggs-fetch.loca.lt';

// 买家入口链接
const buyerUrl = `${baseUrl}/buyer`;

console.log('📱 生成买家入口二维码...\n');

// 生成二维码并保存到文件
QRCode.toFile('./public/buyer-qrcode.png', buyerUrl, {
  width: 400,
  margin: 2,
  color: {
    dark: '#667eea',
    light: '#FFFFFF'
  }
}, function (err) {
  if (err) throw err;
  console.log('✅ 买家二维码已生成: public/buyer-qrcode.png');
  console.log('📱 买家链接:', buyerUrl);
});

// 在终端显示二维码
QRCode.toString(buyerUrl, {
  type: 'terminal',
  small: true
}, function (err, url2) {
  if (err) throw err;
  console.log('\n📱 买家入口二维码:\n');
  console.log(url2);
  console.log('\n💡 提示：');
  console.log('   - 买家扫码或点击链接进入买家页面');
  console.log('   - 卖家访问首页选择卖家工作台');
  console.log('   - 买家入口：', buyerUrl);
});

// 生成首页二维码（供选择）
QRCode.toFile('./public/home-qrcode.png', baseUrl, {
  width: 400,
  margin: 2,
  color: {
    dark: '#764ba2',
    light: '#FFFFFF'
  }
}, function (err) {
  if (err) throw err;
  console.log('\n✅ 首页二维码已生成: public/home-qrcode.png');
});
