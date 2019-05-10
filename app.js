// sample module pattern using IIFE to protect your code from public
/*
var budgetController = (function(){
    // private
    var x = 23;
    var add = function(a) {
        return x + a;
    }
    // public
    return {
        publicTest: function(b) {
            return (add(b));
        }
    }

})();


var UIController = (function(){


})();


// to link other modules
var controller = (function(budgetCtrl, UICtrl){
    var z = budgetCtrl.publicTest(5);

    return {
        anotherPublic: function(){
            console.log(z);
        }
    }


})(budgetController, UIController);
*/

// ==============real codes from here on out=============================================================
// BUDGET Controller
var budgetController = (function(){
    // create function constructor for expense and income
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    // calculate total inc or expense from var data
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    
    // create data property to store all 
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    // return obj. with new items
    return {
        addItem: function(type, desc, val) {
            var newItem, ID;
            // [1 2 3 4 5], next ID 6 so, last ID + 1
            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // create new item
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            // push into data structure
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
        },
        
        //delete items
        deleteItem: function(type, id) {
            var ids, index;
            //id = 6
            // index = 3
            //[1 2 4 6 8], use map function
            ids = data.allItems[type].map(function(current) {
                return  current.id;
            });
            //determine index
            index = ids.indexOf(id);
            // remove 1 item from the specified index
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function() {
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            // calculate and loop thru all items in array
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };  
        },
        
        testing: function() {
            console.log(data);
        }
    };


})();



// UI Controller
var UIController = (function(){
// create obj for inputs under querySelector, for easy access in case something changes in html; html class names directory; makes life easier
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list', //from HTML, parent of income-0, income-1 etc...
        expensesContainer: '.expenses__list',  //same as above for expenses
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',   //container clearfix
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
            var numSplit, int, dec, intPart;
            /*
            + or - before number
            exactly 2 decimal places
            comma separating the thousands
            */
            //returns absolute value of a number
            num = Math.abs(num);
            //returns 2 decimal places
            num = num.toFixed(2);
            
            //split whole numbers and decimal, use split since it is a string, assign var
            numSplit = num.split('.');
            int = numSplit[0];
            intPart = '';
            //add comma, to position 0, number length - 3, followed by comma, continue with the next 3, read 3 elements
            /*
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            */
            dec = numSplit[1];
            // include 7 digits grouping
            while(int.length > 3) {
                intPart = ',' + int.substr(int.length - 3, 3) + intPart;
                int = int.substr(0, int.length - 3);
            }
            intPart = int + intPart;
            // return everything in a ternary operator
            return (type === 'exp' ? '-' : '+') + ' $' + intPart + '.' + dec;
        };
    
     // we call the nodeListForEach function we pass a callback
    var nodeListForEach = function(list, callback) {
            for (var i = 0; i < list.length; i++) {
                callback(list[i], i);
            }
    };
    

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp
                description: document.querySelector(DOMstrings.inputDesc).value,
                // use parseFloat to convert string to number
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            // create HTML string with placeholder text; ref income-0, expense-0
            var html, newHtml, element;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-circle-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-circle-outline"></i></button></div></div></div>';
            }

            // replace the placeholder with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // insert the HTML into the DOM; insertAdjacentHTML syntax JSs; beforeend as a child of incContainer
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        //delete items from DOM, use var for DRY purposes, removeChild has this syntax
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        
        // Clear input fields, after clicking check or pressing enter key
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);
            // put fields in array so you can slice em
            fieldsArr = Array.prototype.slice.call(fields);
            // loop thru the array and clear the fields
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
                
            // optional, bring focus back to description field
            fieldsArr[0].focus();
                
            });
        },
        
        // display budget and replace text content from getBudget
        displayBudget: function(obj) {
            var type;
            obj.budget  > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            // if statement to show % sign and --
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }
        },
        
        //display percentage on item expenses
        displayPercentages: function(percentages) {
            // return nodelists
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
           
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        },
        // display month and year
        displayMonth: function() {
            var now, month, months, year;
            //JS returns months as integers 0-11, need to create an array for names of months
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        //change color focus on + and -
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputValue
            );
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            // toggle confirm button to red or bluegreen
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        
        // put DOMstrings public, to give access to global app controller;
        getDOMstrings: function() {
            return DOMstrings;
        }
    };


})();

// GLOBAL APP Controller
var controller = (function(budgetCtrl, UICtrl){
    // create function for eventListeners
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // add keypress on Enter key, so the user can use it too aside from click
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
                }
        });
        // for deleting items, both inc and exp delete buttons reside on div container clearfix ;)
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        //change color focus on + and - when user clicks
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    
    // separate budget calculations then call it at ctrlAddItem
    var updateBudget = function() {
        // calcualte the budget, from global budget controller
        budgetCtrl.calculateBudget();
        // return the budget
        var budget = budgetCtrl.getBudget();
        // display the budget on the UI from displayBudget
        UICtrl.displayBudget(budget);
    };
    
    //update percentage on the exp item__percentage
    var updatePercentages = function () {
        
        // calculate percentages
        budgetCtrl.calculatePercentages();
        // read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // update the UI with the new percentages on item expenses
        UICtrl.displayPercentages(percentages);
    };
    
    // for DRY purposes; when someone press enter or click ok
    var ctrlAddItem = function() {
        var input, newItem;
        // get the field input data from UI controller
        input = UICtrl.getInput();
        // verify that input fields are not empty and value is a number greater than 0
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // clear the fields
            UICtrl.clearFields();
            // calculate and update the budget
            updateBudget();
            // calculate and update percentages
            updatePercentages();
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
        // DOM traversing, target the button instead of the i tag, used 4x to move up
        // hardcoded since html DOM is also hardcoded, alternate solution ref Lesson 90 by Geir
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            //inc-0, inc-1, becomes 'inc' '0', 'inc' '1'; e.g. s='inc-0'; s.split('-');
            splitID = itemID.split('-');
            //assign var to elements that you have splitted, then convert ID to number
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            //2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //3. update and show the new budget, from ctrlAddItem
            updateBudget();
            //4. calculate and update the percentages
            updatePercentages();
        }
    };
    
    
    // create init function, so you can run it outside, in public
    return {
        init: function() {
            console.log('App has started...');
            UICtrl.displayMonth();
            UICtrl.clearFields();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };


})(budgetController, UIController);

controller.init();