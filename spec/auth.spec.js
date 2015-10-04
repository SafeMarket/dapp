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
        passwordInputs.get(0).sendKeys('password')
        passwordInputs.get(1).sendKeys('pass')
        element(by.css('#registerForm')).submit()
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8000/#/login');
    })

    it('should create a user with a password of "password"',function(){
        element.all(by.css('#registerForm [type="text"]')).get(1).sendKeys('word')
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

    it('should set the default account to web3.eth.defaultAccount',function(){
        var accountMatches = browser.executeScript("return angular.element(document.body).injector().get('user').data.account === web3.eth.defaultAccount")
        expect(accountMatches).toEqual(true)
    })

    it('should set the default currency to usd',function(){
        var currency = browser.executeScript("return angular.element(document.body).injector().get('user').data.currency")
        expect(currency).toEqual('USD')
    })
})

describe('logout/login',function(){

    it('dismiss modal if open',function(){
        browser.executeScript("angular.element(document.body).injector().get('modals').closeInstance()")
    })

    it('should work when clicking the logout button',function(){
        element(by.css('[ng-click="logout()"]')).click()
    })

    it('should send the user to the login page',function(){
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8000/#/login');
    })

    it('should show the login form',function(){
        expect(element(by.css('#loginForm')).isDisplayed()).toBe(true)
    })

    it('should not show the register form',function(){
        expect(element(by.css('#registerForm')).isDisplayed()).toBe(false)
    })

    it('should not show the navbar',function(){
        expect(element(by.css('#navbar  ')).isDisplayed()).toBe(false)
    })

    it('should have one password field', function() {

        var passwordInputs = element.all(by.css('#loginForm [type="password"]'))
        expect(passwordInputs.count()).toBe(1);
    
    });

    it('should switch password fields to text fileds when "show password" is checked', function() {

        var showPasswordCheckbox = element(by.css('#loginForm [ng-model="showPassword"]'))
        showPasswordCheckbox.click()
        var passwordInputs = element.all(by.css('#loginForm [type="text"]'))
        expect(passwordInputs.count()).toBe(1);
    
    });

    it('should fail with the wrong password', function() {

        var passwordInput = element(by.css('#loginForm [type="text"]'))
        passwordInput.sendKeys('pass')
        element(by.css('#loginForm')).submit()
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8000/#/login');
    
    });

    it('should login with the right password', function() {

        var passwordInput = element(by.css('#loginForm [type="text"]'))
        passwordInput.sendKeys('word')
        element(by.css('#loginForm')).submit()
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8000/#/');
    
    });

})