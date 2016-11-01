describe('store',function(){

it('should bootstrap',function(){
    browser.get('http://127.0.0.1:8000');

    browser.wait(function() {
       return element(by.css('h1')).isDisplayed()
    }, 1000);
})

it('should create Satoshis Lemonade Stand',function(){
    element(by.id('open-store-modal-button')).click()
    browser.waitForAngular()
    element(by.id('store-modal-alias')).sendKeys(browser.params.storeAlias)
    element(by.id('store-modal-name')).sendKeys('Satoshis Lemonade Stand')
    element(by.id('store-modal-info')).sendKeys('The best lemonade on the interweb')
    element(by.id('add-product-button')).click(0)
    element.all(by.model('product.name')).get(0).sendKeys('Lemonade')
    element.all(by.model('product.price')).get(0).sendKeys('0.50')
    element.all(by.model('product.info')).get(0).sendKeys('A quenching treat!')
    element(by.id('add-product-button')).click(0)
    element.all(by.model('product.name')).get(1).sendKeys('Sugar Cookies')
    element.all(by.model('product.price')).get(1).sendKeys('1.50')
    element.all(by.model('product.info')).get(1).sendKeys('A tasty snack!')
    element(by.id('add-transport-button')).click(0)
    element.all(by.model('transport.name')).get(0).sendKeys('Basic')
    element.all(by.model('transport.price')).get(0).sendKeys('1.00')
    element(by.id('add-submarket-button')).click(0)
    element.all(by.model('submarket.alias')).get(0).sendKeys(browser.params.submarketAlias)
    element(by.id('submit-button')).click()
    element(by.id('approve-button')).click()
})

it('add the store to my stores',function(){
    browser.wait(function(){
        return element(by.css('[ng-href*="#/stores/"]')).isPresent()
    })
    element(by.css('[ng-href*="#/stores/"]')).getText().then(function(text){
        expect(text).toBe('@'+browser.params.storeAlias)
    })
})

it('should be accessable via the aliasbar',function(){
    element(by.css('[ng-model="alias"]')).sendKeys(browser.params.storeAlias)
    element(by.css('#aliasBar')).submit()
    element(by.css('h1')).getText().then(function(text){
        expect(text.indexOf('Satoshis Lemonade Stand')).not.toEqual(-1)
    })
})

it('should update to Satoshis Awesome Lemonade Stand Edited',function(){
    browser.waitForAngular()
    element(by.id('open-store-modal-button')).click()
    browser.waitForAngular()
    element(by.id('store-modal-name')).sendKeys(' Edited')
    element(by.id('submit-button')).click()
    element(by.id('approve-button')).click()
    expect(element(by.id('name')).getText()).toEqual('Satoshis Lemonade Stand Edited')
})

it('should not show any images',function(){
    element(by.css('li[heading|="Products"] a')).click()

    element(by.css('.product-image')).getSize().then(function(size){
        expect(size.height).toBe(0)
        expect(size.width).toBe(0)
    })
})

it('should create an order',function(){
    var url = browser.getCurrentUrl().then(function(url){
        browser.get(url.replace('/about','/products'))

        var productInputs = element.all(by.model('product.quantity'))
        productInputs.get(0).sendKeys('1')
        productInputs.get(1).sendKeys('2')

        element(by.css('#escrow-select option:nth-child(2)')).click()

        element(by.model('affiliateCodeOrAlias')).sendKeys(browser.params.affiliateCode)

        element(by.css('[ng-click="createOrder()"]')).click()
        element(by.css('[ng-click="approve()"]')).click()

        browser.wait(function(){
            return element(by.css('#order')).isPresent()
        })

        element(by.css('h1')).getText().then(function(text){
            expect(text.indexOf('Order')).not.toEqual(-1)
        })
    })

})


})