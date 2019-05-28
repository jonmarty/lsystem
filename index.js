var create_init = function(symbol){
  return function(){
  var elem = document.getElementById(symbol + "-init-input")
    if(!elem){
      init[symbol] = undefined
      var row = document.createElement("DIV")
      row.className = "row"
      var left = document.createElement("DIV")
      left.className = "left-cell"
      left.innerHTML = symbol + " INIT"
      row.appendChild(left)
      var right = document.createElement("DIV")
      right.className = "right-cell"
      var input = document.createElement("INPUT")
      input.className = "Input-text"
      input.id = symbol + "-init-input"
      input.onchange = check_expr(input)
      right.appendChild(input)
      row.appendChild(right)
      document.getElementById("input-table").appendChild(row)
    }
  }
}

var check_expr = function(element){
  var func = function(){
    text = element.value
    for (i=0;i<text.length;i++){
      var c = text.charAt(i).toUpperCase();
      if (c.match(/[A-Z]/i) && !Object.keys(data).includes(c)){
        data[String(c)] = undefined
        var row = document.createElement("DIV")
        row.className = "row"
        var left = document.createElement("DIV")
        left.className = "left-cell"
        left.innerHTML = String(c)
        var left_button = document.createElement("BUTTON")
        left_button.className = "mybuttonoverlap"
        left_button.innerHTML = "INIT"
        left_button.onclick = create_init(String(c))
        left.appendChild(left_button)
        row.appendChild(left)
        var right = document.createElement("DIV")
        right.className = "right-cell"
        var input = document.createElement("INPUT")
        input.className = "Input-text"
        input.id = String(c) + "-input"
        input.onchange = check_expr(input)
        right.appendChild(input)
        row.appendChild(right)
        document.getElementById("input-table").appendChild(row)
      }
    }
  }
  return func
}

var symbols_to_logo = function(expr, isinit){
  var str = "";
  for (i=0;i<expr.length;i++){
    var c = String(expr.charAt(i).toUpperCase())
    if (c == '+'){str = str + " lt " + options.angle}
    else if (c == '-'){str = str + " rt " + options.angle}
    else if (isinit){str = str + " fd :ln"}
    else if (data[String(c)] == ""){str = str + " fd :ln"}
    else {str = str + " " + c + " :st :ln"}
  }
  return str
}

var axiom_to_logo = function(options){
  var str = ""
  for (i=0;i<options.axiom.length;i++){
    var c = options.axiom.charAt(i)
    if (c == '+'){str = str + "lt " + options.angle + " "}
    else if (c == '-'){str = str + "rt " + options.angle + " "}
    else if (data[String(c)] == ""){str = str + "fd " + options.length/Math.pow(options.scaledown,options.level+1) + " "}
    else {str = str + String(c) + " " + options.level + " " + options.length + " "}
  }
  return str
}

var make_func = function(name, expr, init, options){
  var str = "to " + name + " :st :ln\nmake \"st :st - 1\nmake \"ln :ln / " + options.scaledown + "\n"
  str = str + "if :st > -1 ["
  str = str + symbols_to_logo(expr, false)
  str = str + "]\nif :st = -1 ["
  str = str + symbols_to_logo(init, true)
  str = str + "]\nend\n\n"
  return str
}

var lsystem_to_logo = function(data, init, options){
  var str = "home\nsetpencolor \"" + options.color + "\n"
  if (options.reset){str = "clearscreen\n" + str}
  Object.keys(data).forEach(function(k){
    if (Object.keys(init).includes(k)){
      str = str + make_func(k, data[k], init[k], options)
    }
    else{
      str = str + make_func(k, data[k], k, options)
    }
  })
  str = str + "setxy " + options.x + " " + options.y + "\n\t" + axiom_to_logo(options)
  return str
}

var x = document.getElementById("x-input")
var y = document.getElementById("y-input")
var scaledown = document.getElementById("scaledown-input")
var color = document.getElementById("color-input")
var reset = document.getElementById("reset-input")
var length = document.getElementById("length-input")
var angle = document.getElementById("angle-input")
var level = document.getElementById("level-input")
var axiom = document.getElementById("axiom-input")
var button = document.getElementById("submit-button")

var data = {}
var options = {}
var init = {}

var run = function (){
  options.length = length.value
  options.angle = angle.value
  options.level = level.value
  options.axiom = axiom.value.toUpperCase()
  options.x = x.value
  options.y = y.value
  options.scaledown = scaledown.value
  options.color = color.value
  options.reset = reset.checked
  keys = Object.keys(data)
  for (i=0;i<keys.length;i++){
    data[keys[i]] = document.getElementById(keys[i] + "-input").value
  }
  init_keys = Object.keys(init)
  for (i=0;i<init_keys.length;i++){
    init[init_keys[i]] = document.getElementById(init_keys[i] + "-init-input").value
  }
  var logo_code = lsystem_to_logo(data, init, options)
  console.log(logo_code)
  logo.run(logo_code)
}

axiom.onchange = check_expr(axiom)
button.onclick = run

//Code for recipes
var recipes = {
  "Koch Snowflake":{
    "scaledown":3,
    "length":1000,
    "angle":60,
    "level":4,
    "axiom":"F--F--F",
    "F":"F+F--F+F",
  },
  "Gosper Curve":{
    "scaledown":2.6457,
    "length":1000,
    "angle":60,
    "level":4,
    "axiom":"A",
    "A":"A-B--B+A++AA+B-",
    "B":"+A-BB--B-A++A+B"
  },
  "Heighway Dragon":{
    "scaledown":Math.sqrt(2),
    "length":300,
    "angle":90,
    "level":14,
    "axiom":"X",
    "X":"X+Y+",
    "Y":"-X-Y"
  },
  "Terdragon":{
    "scaledown":1.5,
    "length":190,
    "angle":120,
    "level":10,
    "axiom":"F",
    "F":"F+F-F"
  },
  "Levy Dragon":{
    "scaledown":Math.sqrt(2),
    "length":200,
    "angle":45,
    "level":13,
    "axiom":"F",
    "F":"+F--F+"
  }
}

var exec_recipe = function(recipe){
  return function(){
    Object.keys(recipe).forEach(function(field){
      if(field.includes("-init")){create_init(field.replace("-init",""))()}
      input = document.getElementById(field+"-input")
      input.value = String(recipe[field])
      if(input.onchange !== null){input.onchange()}
    })
    run()
  }
}

Object.keys(recipes).forEach(function(name){
  var recipe = recipes[name]
  var link = document.createElement("A")
  link.onclick = exec_recipe(recipe)
  link.href = "#"
  link.innerHTML = name
  document.getElementById("recipe-list").appendChild(link)
})
