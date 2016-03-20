var assert = chai.assert;
var expect = chai.expect
function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').
            replace(/\*\/[^\/]+$/, '').trim().replace(/>\s*</g, "><")
}
function fireClick(el) {
    if (el.click) {
        el.click()
    } else {
//https://developer.mozilla.org/samples/domref/dispatchEvent.html
        var evt = document.createEvent("MouseEvents")
        evt.initMouseEvent("click", true, true, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);
        !el.dispatchEvent(evt);
    }
}
describe('duplex', function() {
    var body = document.body, div, vm
    beforeEach(function() {
        div = document.createElement("div")
        body.appendChild(div)
    })
    afterEach(function() {
        body.removeChild(div)
        delete avalon.vmodels[vm.$id]
    })
   


    it("test", function(done) {
        div.innerHTML = heredoc(function() {
            /*
             <div ms-controller='duplex2' >
             <input type='radio' ms-duplex='aaa|checked'><span>{{aaa}}</span>
             <input type='checkbox' ms-duplex='bbb|checked'><span>{{bbb}}</span>
             <p><input type="radio" ms-duplex="ccc" value="aaa"/>
             <input type="radio" ms-duplex="ccc" value="bbb"/></p>
             <p><input type="checkbox" value="111" ms-duplex="ddd|numeric">
             <input type="checkbox" value="222" ms-duplex="ddd|numeric"></p>
             <p>
             <select ms-duplex="ggg">
             <option>111</option>
             <option >222</option>
             <option selected>333</option>
             <option>444</option>
             </select><span>{{ggg}}</span><input ms-duplex="ggg">
             </p>
             <p>
             <select ms-duplex="hhh|numeric" multiple="">
             <option selected>11</option>
             <option>22</option>
             <option>33</option>
             <option>44</option>
             </select>
             </p>
             </div>
             */
        })
        vm = avalon.define({
            $id: 'duplex2',
            aaa: false,
            bbb: false,
            ccc: "aaa",
            ddd: [222],
            ggg: "222",
            hhh: []
        })
        avalon.scan(div, vm)
        setTimeout(function() {
            var inputs = div.getElementsByTagName("input")
            var spans = div.getElementsByTagName("span")
            var options = div.getElementsByTagName("option")
            var selects = div.getElementsByTagName("select")
            expect(inputs[0].checked).to.equal(false)
            expect(vm.aaa).to.equal(false)
            expect(spans[0].innerHTML).to.equal("false")
            expect(inputs[1].checked).to.equal(false)
            expect(vm.bbb).to.equal(false)
            expect(spans[1].innerHTML).to.equal("false")

            expect(inputs[2].checked).to.equal(true)
            expect(inputs[3].checked).to.equal(false)
            expect(inputs[4].checked).to.equal(false)
            expect(inputs[5].checked).to.equal(true)

            expect(options[1].selected).to.equal(true)
            expect(options[2].selected).to.equal(false)
            expect(options[4].selected).to.equal(false)
            expect(inputs[6].value).to.equal("222")
            fireClick(inputs[0])
            fireClick(inputs[1])
            fireClick(inputs[4])
            fireClick(inputs[5])
            //模执选择option事件
            options[3].selected = true
            avalon.fireDom(selects[0], "change")
            //第二个select元素
            options[5].selected = true
            options[6].selected = true
            options[7].selected = true
            avalon.fireDom(selects[1], "change")
            vm.ccc = "bbb"
            setTimeout(function() {
                expect(inputs[0].checked).to.equal(true)
                expect(vm.aaa).to.equal(true)
                expect(spans[0].innerHTML).to.equal("true")
                expect(inputs[1].checked).to.equal(true)
                expect(vm.bbb).to.equal(true)
                expect(spans[1].innerHTML).to.equal("true")
                expect(inputs[2].checked).to.equal(false)
                expect(inputs[3].checked).to.equal(true)
                expect(inputs[4].checked).to.equal(true)
                expect(inputs[5].checked).to.equal(false)
                expect(vm.ddd.concat()).to.eql([111])
                expect(vm.ggg).to.equal("444")
                expect(inputs[6].value).to.equal("444")
                inputs[6].value = "111"
                expect(options[1].selected).to.equal(false)
                expect(options[2].selected).to.equal(false)
                //==========
                expect(vm.hhh.concat()).to.eql([22, 33, 44])
                setTimeout(function() {
                    expect(options[0].selected).to.equal(true)
                    done()
                },80)

            },80)
        }, 80)

    })
})