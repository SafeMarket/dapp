describe('store',function(){

it('should bootstrap',function(){
    browser.get('http://127.0.0.1:8000');

    browser.wait(function() {
       return element(by.css('h1')).isDisplayed()
    }, 1000);
})

it('should create Satoshis Lemonade Stand',function(){
    element(by.css('[ng-click="openStoreModal()"]')).click()
    browser.wait(function(){
        return element(by.css('#store-modal-body')).isPresent()
    })
    browser.waitForAngular()
    element(by.css('.modal-body [ng-model="alias"]')).sendKeys(browser.params.storeAlias)
    element(by.css('[ng-model="name"]')).sendKeys('Satoshis Lemonade Stand')
    element(by.css('[ng-model="info"]')).sendKeys('The best lemonade on the interweb')
    // element(by.css('[ng-click="addProduct()"]')).click(0)
    // element.all(by.css('[ng-model="product.name"]')).get(0).sendKeys('Lemonade')
    // element.all(by.css('[ng-model="product.price"]')).get(0).sendKeys('0.50')
    // element.all(by.css('[ng-model="product.info"]')).get(0).sendKeys('A quenching treat!')
    // element(by.css('[ng-click="addProduct()"]')).click(0)
    // element.all(by.css('[ng-model="product.name"]')).get(1).sendKeys('Sugar Cookies')
    // element.all(by.css('[ng-model="product.price"]')).get(1).sendKeys('1.50')
    // element.all(by.css('[ng-model="product.info"]')).get(1).sendKeys('A tasty snack!')
    // element.all(by.css('[ng-model="product.imageUrl"]')).get(1).sendKeys('http://i.imgur.com/CAck7Ox.jpg')
    // element(by.css('[ng-click="addTransport()"]')).click(0)
    // element.all(by.css('[ng-model="transport.type"]')).get(0).sendKeys('Basic')
    // element.all(by.css('[ng-model="transport.price"]')).get(0).sendKeys('1.00')
    // element(by.css('[ng-click="addSubmarket()"]')).click(0)
    element.all(by.css('[ng-model="submarket.alias"]')).get(0).sendKeys(browser.params.submarketAlias)
    element(by.css('[ng-click="submit()"]')).click()
    element(by.css('[ng-click="approve()"]')).click()
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
        expect(text.indexOf('Satoshis Lemonade Stand')).toNotEqual(-1)
    })
})

it('should update to Satoshis Awesome Lemonade Stand Edited',function(){
    browser.waitForAngular()
    element(by.css('[ng-click="openStoreModal(store)"]')).click()
    var currentController = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('modals').currentController")
    expect(currentController).toBe('StoreModalController')
    browser.waitForAngular()
    browser.wait(function() {
        var deferred = protractor.promise.defer();
        element(by.css('.modal-body')).isPresent()
            .then(function (isPresent) {
              deferred.fulfill(isPresent);
        });
        return deferred.promise;
    });

    element(by.css('[ng-model="name"]')).sendKeys(' Edited')
    element(by.css('[ng-click="submit()"]')).click()
    element(by.css('[ng-click="approve()"]')).click()
    browser.waitForAngular()
    browser.wait(function(){
        var deferred = protractor.promise.defer();
        element(by.css('#name'))
            .getText()
            .then(function (text) {
              deferred.fulfill(text=='Satoshis Lemonade Stand Edited');
            });
        return deferred.promise;
    })
    expect(element(by.css('#name')).getText()).toEqual('Satoshis Lemonade Stand Edited')
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
            expect(text.indexOf('Order')).toNotEqual(-1)
        })
    })

})


})