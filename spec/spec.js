describe('safemarket',function(){
    it('should exist on port 8000',function(){
        browser.get('http://localhost:8000');
    })
})


describe('account reset', function() {

    it('should have a button in the settigns menu', function() {

        element(by.css('[ng-click="openSettingsModal()"]')).click();
        var resetButtonPresence = element(by.css('[ng-click="reset()"]')).isPresent();
        expect(resetButtonPresence).toBe(true);
    
    });

    it('should trigger an alert',function(){
        var resetButton = element(by.css('[ng-click="reset()"]'));
        resetButton.click();
        browser.switchTo().alert().accept();
    })

    it('should reset localStorage',function(){
        var userJson = browser.executeScript("return localStorage.getItem('user')")
        expect(userJson).toEqual('')
    })

    it('should reset the password',function(){
        var password = browser.executeScript("return angular.element(document.body).injector().get('user').password")
        expect(password).toBeFalsy()
    })

    it('should send user to login page',function(){
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8000/#/login');
        var registerFormPresence = element(by.css('[ng-submit="register()"]')).isPresent()
        expect(registerFormPresence).toEqual(true);
    })
});

describe('registration', function() {

    it('should show the register form',function(){
        expect(element(by.css('#registerForm')).isDisplayed()).toBe(true)
    })

    it('should not show the login form',function(){
        expect(element(by.css('#loginForm')).isDisplayed()).toBe(false)
    })

    it('should not show the navbar',function(){
        expect(element(by.css('#navbar  ')).isDisplayed()).toBe(false)
    })

    it('should have two password fields', function() {

        var passwordInputs = element.all(by.css('#registerForm [type="password"]'))
        expect(passwordInputs.count()).toBe(2);
    
    });

    it('should switch password fields to text fileds when "show password" is checked', function() {

        var showPasswordCheckbox = element(by.css('#registerForm [ng-model="showPassword"]'))
        showPasswordCheckbox.click()
        var passwordInputs = element.all(by.css('#registerForm [type="text"]'))
        expect(passwordInputs.count()).toBe(2);
    
    });

    it('should fail to register when no password is given',function(){
        element(by.css('#registerForm')).submit()
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8000/#/login');
    })

    it('should fail to registerwhen no passwords dont match',function(){
        var passwordInputs = element.all(by.css('#registerForm [type="text"]'))
        passwordInputs.eq(0).sendKeys('password')
        passwordInputs.eq(1).sendKeys('pass')
        element(by.css('#registerForm')).submit()
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8000/#/login');
    })

    it('should create a user with a password of "password"',function(){
        element.all(by.css('#registerForm [type="text"]'))[1].sendKeys('pword')
        element(by.css('#registerForm')).submit()
        var password = browser.executeScript("return angular.element(document.body).injector().get('user').password")
        expect(password).toBe('password')
    })

    it('should send the user to the home page',function(){
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8000/#/');
    })

    it('should open the settings modal',function(){
        var currentModal = browser.executeScript("return angular.element(document.body).injector().get('modals').currentModal")
        expect(currentModal).toBe('SettingsModalController');
    })

})