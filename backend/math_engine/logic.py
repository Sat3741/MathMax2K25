import random

def generate_problem(topic, difficulty=1):
    """
    Generates a math problem based on topic and difficulty.
    Returns a dictionary with 'question', 'answer', 'options' (optional).
    """
    if topic == 'addition':
        return generate_addition(difficulty)
    elif topic == 'subtraction':
        return generate_subtraction(difficulty)
    elif topic == 'multiplication':
        return generate_multiplication(difficulty)
    elif topic == 'division':
        return generate_division(difficulty)
    else:
        return {"error": "Unknown topic"}

def generate_addition(difficulty):
    if difficulty == 1:
        a, b = random.randint(1, 10), random.randint(1, 10)
    elif difficulty == 2:
        a, b = random.randint(10, 50), random.randint(10, 50)
    else:
        a, b = random.randint(50, 100), random.randint(50, 100)
    
    return {
        "question": f"{a} + {b}",
        "answer": a + b,
        "type": "addition"
    }

def generate_subtraction(difficulty):
    if difficulty == 1:
        a, b = random.randint(5, 15), random.randint(1, 5)
    elif difficulty == 2:
        a, b = random.randint(20, 50), random.randint(5, 20)
    else:
        a, b = random.randint(50, 100), random.randint(10, 50)
    
    # Ensure positive result for elementary level
    if a < b:
        a, b = b, a
        
    return {
        "question": f"{a} - {b}",
        "answer": a - b,
        "type": "subtraction"
    }

def generate_multiplication(difficulty):
    if difficulty == 1:
        a, b = random.randint(1, 5), random.randint(1, 5)
    elif difficulty == 2:
        a, b = random.randint(2, 10), random.randint(2, 10)
    else:
        a, b = random.randint(10, 20), random.randint(2, 10)
        
    return {
        "question": f"{a} × {b}",
        "answer": a * b,
        "type": "multiplication"
    }

def generate_division(difficulty):
    # Generate multiplication first to ensure clean division
    if difficulty == 1:
        b = random.randint(2, 5)
        ans = random.randint(1, 5)
    elif difficulty == 2:
        b = random.randint(2, 10)
        ans = random.randint(2, 10)
    else:
        b = random.randint(5, 15)
        ans = random.randint(5, 15)
        
    a = b * ans
    
    return {
        "question": f"{a} ÷ {b}",
        "answer": ans,
        "type": "division"
    }
