在微信小程序下会用到wxParse这个东西来达到html转换wxml的效果，

taro小程序官方也给出了示例，地址

这里封装成自己的组件：

```
import Taro, { Component } from "@tarojs/taro"
import { View } from "@tarojs/components"
import WxParse from '../../utils/wxParse/wxParse.js'
import "../../utils/wxParse/wxParse.scss"

export default class ParseComponent extends Component {
    componentDidMount() {}
    defaultProps = {
        mark: ""
    }
    render() {
 
        if (this.props.mark) {
            let domText = this.props.mark
            WxParse.wxParse("domText", "html", domText, this.$scope, 5);
        }
        return (
            <View>
                {process.env.TARO_ENV === "weapp" ? (
                    <View>
                        <import src='../../utils/wxParse/wxParse.wxml' />
                        <template is='wxParse' data='{{wxParseData:domText.nodes}}'
                        />
                    </View>
                ) : (
                    <View>只在小程序里支持</View>
                )}
            </View>
        );
    }
}
```

另外，转化之后的图片地址是相对地址，在小程序中是无法显示的，所以需要到html2json.js文件中加上图片的域名地址：

```
//对img添加额外数据
            if (node.tag === 'img') {
                node.imgIndex = results.images.length;
                var imgUrl = '域名地址' + node.attr.src;
                if (imgUrl[0] == '') {
                    imgUrl.splice(0, 1);
                }
                imgUrl = wxDiscode.urlToHttpUrl(imgUrl, __placeImgeUrlHttps);
                node.attr.src = imgUrl;
                node.from = bindName;
                results.images.push(node);
                results.imageUrls.push(imgUrl);
            }
```

config/index.js

```
  copy: {
    patterns: [
      { from: 'src/components/wxParse/wxParse.wxss', to: 'dist/components/wxParse/wxParse.wxss'},
      { from: 'src/components/wxParse/wxParse.wxml', to: 'dist/components/wxParse/wxParse.wxml'}
    ],
    options: {}
  },
```