describe('affiliate',function(){

it('should bootstrap',function(){

    browser.get('http://127.0.0.1:8000/#/affiliate');

    browser.wait(function() {
       return element(by.css('h1')).isDisplayed()
    });
})

it('should create an affiliate',function(){
    element(by.css('#open-affiliate-modal-button')).click()
    browser.wait(function(){
        return element(by.css('#affiliate-modal-body')).isPresent()
    })
    browser.waitForAngular()
    element(by.model('code')).sendKeys(browser.params.affiliateCode)
    element(by.css('[ng-click="submit()"]')).click()
    element(by.css('[ng-click="approve()"]')).click()
    browser.wait(function(){
        return element(by.css('.affiliate-code')).isPresent()
    })
    element(by.css('.affiliate-code')).getText().then(function(text){
        expect(text).toBe(browser.params.affiliateCode)
    })
})

})