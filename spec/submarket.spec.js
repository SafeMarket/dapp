describe('submarket',function(){

var submarketAlias = 'drinksubmarket'+Math.floor(Math.random()*999999)

describe('safesubmarket',function(){
    it('should exist on port 8000',function(){
        browser.get('http://localhost:8000');
    })
})

describe('submarket modal',function(){
    it('should open when the submarket modal button is clicked',function(){
        element(by.css('[ng-click="openSubmarketModal()"]')).click()
        var currentController = browser.executeScript("return angular.element(document.body).injector().get('modals').currentController")
        expect(currentController).toBe('SubmarketModalController')
    })

    it('should create The Drink Submarket',function(){
        element(by.css('.modal-content [ng-model="alias"]')).sendKeys(submarketAlias)
        element(by.css('[ng-model="name"]')).sendKeys('The Drink Submarket')
        element(by.css('[ng-model="info"]')).sendKeys('The best drinks on the interweb')
        element(by.css('[ng-click="submit()"]')).click()
        element(by.css('[ng-click="approve()"]')).click()
        element(by.css('[ng-href*="#/submarkets/"]')).click()
        element(by.css('h1')).getText().then(function(text){
            expect(text.indexOf('The Drink Submarket')).toNotEqual(-1)
        })
        
    })

})

})