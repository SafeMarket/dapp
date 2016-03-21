describe('submarket',function(){

it('should bootstrap',function(){
    browser.get('http://127.0.0.1:8000');

    browser.wait(function() {
       return element(by.css('h1')).isDisplayed()
    }, 1000);
})


it('should create The Drink Submarket',function(){
    element(by.css('[ng-click="openSubmarketModal()"]')).click()
    browser.wait(function(){
        return element(by.css('#submarket-modal-body')).isPresent()
    })
    element(by.css('.modal-content [ng-model="alias"]')).sendKeys(browser.params.submarketAlias)
    element(by.css('[ng-model="name"]')).sendKeys('The Drink Submarket')
    element(by.css('[ng-model="info"]')).sendKeys('The best drinks on the interweb')
    element(by.css('[ng-click="submit()"]')).click()
    element(by.css('[ng-click="approve()"]')).click()    
})

it('should be added to my submarkets',function(){
    browser.wait(function(){
        return element(by.css('[ng-href*="#/submarkets/"]')).isPresent()
    })
    element(by.css('[ng-href*="#/submarkets/"]')).getText().then(function(text){
        expect(text).toBe('@'+browser.params.submarketAlias)
    })
})

it('should be accessable via the aliasbar',function(){
    element(by.css('[ng-model="alias"]')).sendKeys(browser.params.submarketAlias)
    element(by.css('#aliasBar')).submit()
    element(by.css('h1')).getText().then(function(text){
        expect(text.indexOf('The Drink Submarket')).toNotEqual(-1)
    })
})

})