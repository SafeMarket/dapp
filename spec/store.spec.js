describe('safemarket',function(){
    it('should exist on port 8000',function(){
        browser.get('http://localhost:8000');
    })
})

describe('store modal',function(){
    it('should open when the store modal button is clicked',function(){
        element(by.css('[ng-click="openStoreModal()"]')).click()
        var currentModal = browser.executeScript("return angular.element(document.body).injector().get('modals').currentModal")
        expect(currentModal).toBe('StoreModalController')
    })

    it('should create Satoshis Lemonade Stand',function(){
        element(by.css('[ng-model="name"]')).sendKeys('Satoshis Lemonade Stand')
        element(by.css('[ng-model="info"]')).sendKeys('The best lemonade on the interweb')
        element(by.css('[ng-click="addProduct()"]')).click(0)
        element.all(by.css('[ng-model="product.name"]')).get(0).sendKeys('Lemonade')
        element.all(by.css('[ng-model="product.price"]')).get(0).sendKeys('0.50')
        element.all(by.css('[ng-model="product.info"]')).get(0).sendKeys('A quenching treat!')
        element.all(by.css('[ng-model="product.name"]')).get(1).sendKeys('Sugar Cookies')
        element.all(by.css('[ng-model="product.price"]')).get(1).sendKeys('1.50')
        element.all(by.css('[ng-model="product.info"]')).get(1).sendKeys('A tasty snack!')
        element(by.css('[ng-click="submit()"]')).click()
        browser.switchTo().alert().accept();
        browser.waitForAngular()
        element(by.css('[ng-href*="#/stores/"]')).click()
        element(by.css('h1')).getText().then(function(text){
            expect(text.indexOf('Satoshis Lemonade Stand')).toNotEqual(-1)
        })
        
    })

    it('should update to Satoshis Awesome Lemonade Stand Edited',function(){
        element(by.css('[ng-click="openStoreModal(store)"]')).click()
        var currentModal = browser.executeScript("return angular.element(document.body).injector().get('modals').currentModal")
        expect(currentModal).toBe('StoreModalController')
        element(by.css('[ng-model="name"]')).sendKeys(' Edited')
        element(by.css('[ng-click="submit()"]')).click()
        browser.switchTo().alert().accept();
        browser.waitForAngular()
        element(by.css('h1')).getText().then(function(text){
            expect(text.indexOf('Satoshis Lemonade Stand Edited')).toNotEqual(-1)
        })  
    })

})