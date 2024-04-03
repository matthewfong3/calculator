"use strict"

$(document).ready(() => {
    let display = document.querySelector("#display");
    let numsBtns = document.getElementsByClassName('numbers');
    let operatorsBtns = document.getElementsByClassName('operators');
    let decimalBtn = document.querySelector("#decimal");
    let clearBtn = document.querySelector("#clear");
    let delBtn = document.querySelector("#del");
    let equalBtn = document.querySelector("#equal");

    let userInputs = {
        lInput: undefined,
        rInput: undefined,
        operator: undefined,
        displayString: ''
    };

    for(let b of numsBtns){
        b.addEventListener('click', () => {
            display.value = saveNumberInputs(userInputs, b.value);
        });
    }
    
    for(let b of operatorsBtns){
        b.addEventListener('click', () => {
            if(!userInputs.rInput){
                decimalBtn.disabled = false;
                display.value = saveOperatorInputs(userInputs, b.value);
            }
        });
    }

    decimalBtn.addEventListener('click', (e) => {
        decimalBtn.disabled = true; // once clicked, disable decimal button to prevent multiple decimal point value on either side of calculation
        display.value = handleDecimalPointLogic(userInputs, e.target.value);
    });

    equalBtn.addEventListener('click', () => {
        display.value = evaluateExpression(userInputs, decimalBtn);
    });

    delBtn.addEventListener('click', () => { // delete the last user input from calculation
        display.value = deleteLastInput(userInputs);
    });

    clearBtn.addEventListener('click', () => { // RESET all values
        decimalBtn.disabled = false;
        display.value = clearAll(userInputs);
    });

    // keyboard support
    document.addEventListener('keyup', (e) => {
        switch(e.key){
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '0':
                display.value = saveNumberInputs(userInputs, e.key);
                break;
            case '+':
            case '-':
            case '*':
            case '/':
                if(!userInputs.rInput){
                    decimalBtn.disabled = false; // toggle decimal button ON for second number    
                    display.value = saveOperatorInputs(userInputs, e.key);
                }
                break;
            case '.':
                if(!decimalBtn.disabled){
                    decimalBtn.disabled = true; // once clicked, disable decimal button to prevent multiple decimal point value on either side of calculation
                    display.value = handleDecimalPointLogic(userInputs, e.key);
                }
                break;
            case 'Enter':
                display.value = evaluateExpression(userInputs, decimalBtn);
                break;
            case 'Backspace':
                display.value = deleteLastInput(userInputs);
                break;
        }
    });
});

const saveNumberInputs = (userInputs, val) => {
    if(!userInputs.operator){ // saves user input for first number (left-side calculation)
        if(!userInputs.lInput) userInputs.lInput = val; // first input number
        else userInputs.lInput += val; // additional numbers

        userInputs.displayString += val;
    }
    else{ // saves user input for second number (right-side calculation)
        if(!userInputs.rInput) userInputs.rInput = val; // first input number
        else userInputs.rInput += val; // additional numbers

        userInputs.displayString += val;
    }

    return userInputs.displayString;
};

const saveOperatorInputs = (userInputs, val) => {
    if(!userInputs.rInput && userInputs.operator) userInputs.displayString = userInputs.displayString.slice(0, -1); // allows user to change operator 
    
    userInputs.displayString += val;
    userInputs.operator = val;
    
    return userInputs.displayString;
};

const handleDecimalPointLogic = (userInputs, val) => {
    if(!userInputs.operator){ // handles logic for first number (left-side)
        if(!userInputs.lInput) userInputs.lInput = val; // allows value between 0.0-1.0
        else userInputs.lInput += val; 

        userInputs.displayString += val;
    }
    else{ // handles logic for second number (right-side)
        if(!userInputs.rInput) userInputs.rInput = val; // allows value between 0.0-1.0
        else userInputs.rInput += val;

        userInputs.displayString += val;
    }

    return userInputs.displayString;
};

const evaluateExpression = (userInputs, decimalBtn) => {
    if(userInputs.operator !== undefined && userInputs.lInput !== undefined && userInputs.rInput !== undefined){ // all params are valid - procceed with calculations
        let result = operate(userInputs.operator, userInputs.lInput, userInputs.rInput);
        if(typeof result === 'string'){ // if user divides by 0 - reset all values
            userInputs.displayString = result;
            userInputs.lInput = undefined;
            userInputs.rInput = undefined;
            userInputs.operator = undefined;
            decimalBtn.disabled = false;
        }
        else{ // calculation passed - save result in lInput & reset operator/rInput to allow for 'chaining' calculations
            userInputs.displayString = result;
            userInputs.lInput = result;
            userInputs.rInput = undefined;
            userInputs.operator = undefined; 
            
            if(result % 1 != 0) decimalBtn.disabled = true; // disables decimal button if result is a floating point number
            else decimalBtn.disabled = false; // enables decimal button if result is whole number
        }

        return userInputs.displayString;
    }  
    else { // missing at least one param - reset all values
        userInputs.displayString = '';
        userInputs.lInput = undefined;
        userInputs.rInput = undefined;
        userInputs.operator = undefined;
        decimalBtn.disabled = false;
        return 'ERROR!';
    }
}

const clearAll = (userInputs) => {
    userInputs.lInput = undefined;
    userInputs.rInput = undefined;
    userInputs.operator = undefined;
    userInputs.displayString = '';
    return userInputs.displayString;
};

const deleteLastInput = (userInputs) => {
    if(userInputs.lInput){ // if at least a number exists as a first number (left-side) go through the deletion logic
        if(!userInputs.operator) { // deletion logic for first number (left-side)
            userInputs.lInput = userInputs.lInput.toString().slice(0, -1);
            userInputs.displayString = userInputs.lInput;
        }
        else if(userInputs.operator && !userInputs.rInput) { // deletion logic for operator 
            userInputs.operator = undefined;
            userInputs.displayString = userInputs.lInput;
        }
        else if(userInputs.rInput) { // deletion logic for second number (right-side)
            userInputs.rInput = userInputs.rInput.slice(0, -1);
            userInputs.displayString = userInputs.lInput + userInputs.operator + userInputs.rInput; 
        }
    }
    else{ // if calculation is 'BLANK' - reset all values as fail-safe option
        userInputs.lInput = undefined;
        userInputs.rInput = undefined;
        userInputs.operator = undefined;
        userInputs.displayString = '';
    }

    return userInputs.displayString;
};

// calls the proper evaluation function 
const operate = (operator, lInput, rInput) => {
    let result;

    switch(operator){
        case "+":
            result = add(lInput, rInput);
            break;
        case "-":
            result = subtract(lInput, rInput);
            break;
        case '*':
            result = multiply(lInput, rInput);
            break;
        case '/':
            result = divide(lInput, rInput);
            break;
    }
    if(Number(result)) return Math.round((result + Number.EPSILON) * 100) / 100;

    return result;
};

const add = (a, b) => {
    return Number(a) + Number(b);
};

const subtract = (a, b) => {
    return Number(a) - Number(b);
}; 

const multiply = (a, b) => {
    return Number(a) * Number(b);
}; 

const divide = (a, b) => {
    if(Number(b) === 0) return "bruh";
    return Number(a) / Number(b);
};