import random
import math
from datetime import datetime, timedelta, timezone

# --- LEVEL DEFINITIONS ---
# Format: id: {name, description, category, base_xp, t_exp, generator_func}
LEVELS = {
    # ADDITION
    'add.1': {'name': 'Single-digit Addition', 'desc': 'Simple addition (1-5)', 'base_xp': 2, 't_exp': 2, 'cat': 'Addition'},
    'add.2': {'name': 'Single-digit Addition II', 'desc': 'Sum up to 10', 'base_xp': 3, 't_exp': 2.5, 'cat': 'Addition'},
    'add.3': {'name': 'Single-digit Addition III', 'desc': 'Sum up to 18 (crossing 10)', 'base_xp': 3, 't_exp': 3, 'cat': 'Addition'},
    'add.4': {'name': 'Double-digit Addition', 'desc': 'No carrying (10-99)', 'base_xp': 4, 't_exp': 4, 'cat': 'Addition'},
    'add.5': {'name': 'Integer Addition', 'desc': 'Negative numbers (-10 to 10)', 'base_xp': 5, 't_exp': 5, 'cat': 'Addition'},
    'add.6': {'name': 'Decimal Addition', 'desc': 'Simple decimals (0.1 to 9.9)', 'base_xp': 5, 't_exp': 5, 'cat': 'Addition'},
    'add.7': {'name': 'Fraction Addition', 'desc': 'Same denominators', 'base_xp': 5, 't_exp': 6, 'cat': 'Addition'},

    # SUBTRACTION
    'sub.1': {'name': 'Single-digit Subtraction', 'desc': 'Simple subtraction (1-5)', 'base_xp': 2, 't_exp': 2, 'cat': 'Subtraction'},
    'sub.2': {'name': 'Single-digit Subtraction II', 'desc': 'Minuend up to 10', 'base_xp': 3, 't_exp': 2.5, 'cat': 'Subtraction'},
    'sub.3': {'name': 'Single-digit Subtraction III', 'desc': 'Minuend up to 18 (crossing 10)', 'base_xp': 3, 't_exp': 3, 'cat': 'Subtraction'},
    'sub.4': {'name': 'Double-digit Subtraction', 'desc': 'No borrowing (10-99)', 'base_xp': 4, 't_exp': 4, 'cat': 'Subtraction'},
    'sub.5': {'name': 'Integer Subtraction', 'desc': 'Negative numbers (-10 to 10)', 'base_xp': 5, 't_exp': 5, 'cat': 'Subtraction'},
    'sub.6': {'name': 'Decimal Subtraction', 'desc': 'Simple decimals (0.1 to 9.9)', 'base_xp': 5, 't_exp': 5, 'cat': 'Subtraction'},
    'sub.7': {'name': 'Fraction Subtraction', 'desc': 'Same denominators', 'base_xp': 5, 't_exp': 6, 'cat': 'Subtraction'},

    # MULTIPLICATION
    'mul.1': {'name': 'Single-digit Multiplication', 'desc': '1x1 to 5x5', 'base_xp': 2, 't_exp': 2.5, 'cat': 'Multiplication'},
    'mul.2': {'name': 'Single-digit Multiplication II', 'desc': '6x6 to 9x9', 'base_xp': 3, 't_exp': 3, 'cat': 'Multiplication'},
    'mul.3': {'name': 'Double-digit Multiplication', 'desc': '10-20 table', 'base_xp': 4, 't_exp': 4, 'cat': 'Multiplication'},
    'mul.4': {'name': 'Integer Multiplication', 'desc': 'Negative numbers (-10 to 10)', 'base_xp': 5, 't_exp': 5, 'cat': 'Multiplication'},
    'mul.5': {'name': 'Decimal Multiplication', 'desc': 'Simple decimals', 'base_xp': 5, 't_exp': 5, 'cat': 'Multiplication'},

    # DIVISION
    'div.1': {'name': 'Simple Division', 'desc': 'No remainders (1-10)', 'base_xp': 2, 't_exp': 2.5, 'cat': 'Division'},
    'div.2': {'name': 'Double-digit Division', 'desc': 'No remainders (10-99)', 'base_xp': 3, 't_exp': 3.5, 'cat': 'Division'},
    'div.3': {'name': 'Integer Division', 'desc': 'Negative numbers', 'base_xp': 5, 't_exp': 5, 'cat': 'Division'},
    'div.4': {'name': 'Decimal Division', 'desc': 'Simple decimals', 'base_xp': 5, 't_exp': 5, 'cat': 'Division'},

    # ADVANCED
    'perc.1': {'name': 'Basic Percentages', 'desc': 'Fractions to %', 'base_xp': 2, 't_exp': 3, 'cat': 'Percentage'},
    'perc.2': {'name': 'Advanced Percentages', 'desc': '% of a number', 'base_xp': 3, 't_exp': 4, 'cat': 'Percentage'},
    'sqr.1': {'name': 'Squares', 'desc': 'Squares up to 20', 'base_xp': 3, 't_exp': 4, 'cat': 'Powers'},
    'cube.1': {'name': 'Cubes', 'desc': 'Cubes up to 10', 'base_xp': 3, 't_exp': 4, 'cat': 'Powers'},
    'sqrt.1': {'name': 'Square Roots', 'desc': 'Perfect squares up to 400', 'base_xp': 3, 't_exp': 4, 'cat': 'Powers'},
    'cube_root.1': {'name': 'Cube Roots', 'desc': 'Perfect cubes up to 1000', 'base_xp': 3, 't_exp': 4, 'cat': 'Powers'},
    'conv.1': {'name': 'Conversions I', 'desc': 'Fraction to Decimal', 'base_xp': 2, 't_exp': 3, 'cat': 'Conversions'},
    'conv.2': {'name': 'Conversions II', 'desc': 'Fraction - Decimal - %', 'base_xp': 3, 't_exp': 4, 'cat': 'Conversions'},
    'dbl.1': {'name': 'Doubling', 'desc': 'Double numbers up to 50', 'base_xp': 1, 't_exp': 1.5, 'cat': 'Mental Math'},
    'half.1': {'name': 'Halving', 'desc': 'Halve numbers up to 50', 'base_xp': 1, 't_exp': 1.5, 'cat': 'Mental Math'},
    
    # MULTI-STEP
      'multi.1': {'name': 'Multi-step I', 'desc': '2 operations (Single digit)', 'base_xp': 4, 't_exp': 5, 'cat': 'Multi-step'},
      'multi.2': {'name': 'Multi-step II', 'desc': 'Double digit operations', 'base_xp': 5, 't_exp': 6, 'cat': 'Multi-step'},
      'multi.3': {'name': 'Multi-step III', 'desc': 'Integer operations', 'base_xp': 5, 't_exp': 6, 'cat': 'Multi-step'},
      'multi.4': {'name': 'Multi-step IV', 'desc': 'Decimal operations', 'base_xp': 5, 't_exp': 6, 'cat': 'Multi-step'},
}


def generate_problem(level_code='add.1', student=None):
    """
    Generates a problem for the specific level code.
    Defaults to 'add.1' if not found.
    """
    if level_code not in LEVELS:
        level_code = 'add.1'
    
    level = LEVELS[level_code]
    problem = {}
    
    try:
        if level_code.startswith('add'):
            problem = _gen_addition(level_code)
        elif level_code.startswith('sub'):
            problem = _gen_subtraction(level_code)
        elif level_code.startswith('mul'):
            problem = _gen_multiplication(level_code)
        elif level_code.startswith('div'):
            problem = _gen_division(level_code)
        elif level_code.startswith('perc'):
            problem = _gen_percentage(level_code)
        elif level_code.startswith('sqr') or level_code.startswith('sqrt'):
            problem = _gen_power(level_code)
        elif level_code.startswith('cube'):
            problem = _gen_cube(level_code)
        elif level_code.startswith('conv'):
            problem = _gen_conversion(level_code)
        elif level_code == 'dbl.1':
            problem = _gen_doubling()
        elif level_code == 'half.1':
            problem = _gen_halving()
        elif level_code.startswith('multi'):
            problem = _gen_multistep(level_code)
        else:
            problem = _gen_addition('add.1')
    except Exception as e:
        print(f"Error generating {level_code}: {e}")
        problem = _gen_addition('add.1') # Fallback
        
    # Attach Metadata
    problem['level_code'] = level_code
    problem['base_xp'] = level['base_xp']
    problem['t_exp'] = level['t_exp']
    
    return problem

# --- GENERATORS ---

def _gen_addition(code):
    if code == 'add.1': return _simple_op(1, 5, 1, 5, '+')
    if code == 'add.2': return _simple_op(1, 9, 1, 9, '+', max_res=10)
    if code == 'add.3': return _simple_op(5, 9, 5, 9, '+') # Crossing 10 likely
    if code == 'add.4': return _simple_op(10, 89, 10, 89, '+') # Double digit
    if code == 'add.5': return _simple_op(-10, 10, -10, 10, '+')
    if code == 'add.6': return _decimal_op(0.1, 9.9, '+')
    if code == 'add.7': return _fraction_op('+')
    return _simple_op(1, 5, 1, 5, '+')

def _gen_subtraction(code):
    if code == 'sub.1': return _simple_op(1, 5, 1, 5, '-', no_neg=True)
    if code == 'sub.2': return _simple_op(1, 10, 1, 9, '-', no_neg=True)
    if code == 'sub.3': return _simple_op(11, 18, 1, 9, '-', no_neg=True)
    if code == 'sub.4': return _simple_op(10, 99, 10, 89, '-', no_neg=True)
    if code == 'sub.5': return _simple_op(-10, 10, -10, 10, '-')
    if code == 'sub.6': return _decimal_op(0.1, 9.9, '-')
    if code == 'sub.7': return _fraction_op('-')
    return _simple_op(1, 5, 1, 5, '-', no_neg=True)

def _gen_multiplication(code):
    if code == 'mul.1': return _simple_op(1, 5, 1, 5, '*')
    if code == 'mul.2': return _simple_op(6, 9, 1, 9, '*')
    if code == 'mul.3': return _simple_op(10, 20, 2, 9, '*')
    if code == 'mul.4': return _simple_op(-10, 10, -10, 10, '*')
    if code == 'mul.5': return _decimal_op(0.1, 12.0, '*')
    return _simple_op(1, 5, 1, 5, '*')

def _gen_division(code):
    # Ensure clean division (no remainder logic for simplified levels unless specified)
    if code == 'div.1': return _clean_div(1, 10, 1, 5)
    if code == 'div.2': return _clean_div(10, 99, 2, 9)
    if code == 'div.3': return _clean_div(-50, 50, -9, 9)
    if code == 'div.4': return _decimal_div()
    return _clean_div(1, 10, 1, 5)

def _gen_percentage(code):
    # perc.1: Fractions to % -> 1/2 = ?%
    if code == 'perc.1':
        num, den = random.choice([(1,2), (1,4), (3,4), (1,5), (2,5), (3,5), (4,5), (1,10), (3,10), (7,10), (9,10)])
        return {
            "question": f"Convert {num}/{den} to percentage",
            "answer": str(int((num/den)*100)) + "%",
            "type": "percentage"
        }
    # perc.2: % of number -> 20% of 50
    if code == 'perc.2':
        base = random.choice([10, 20, 50, 100, 200])
        pct = random.choice([10, 20, 25, 50, 75])
        ans = int(base * pct / 100)
        return {
            "question": f"{pct}% of {base}",
            "answer": ans,
            "type": "percentage"
        }
    return {}

def _gen_power(code):
    if code.startswith('sqr'):
        n = random.randint(1, 20)
        return {"question": f"{n}²", "answer": n*n, "type": "power"}
    if code.startswith('sqrt'):
        ans = random.randint(1, 20)
        return {"question": f"√{ans*ans}", "answer": ans, "type": "root"}
    return {}
    
def _gen_cube(code):
    if code == 'cube.1':
        n = random.randint(1, 10)
        return {"question": f"{n}³", "answer": n*n*n, "type": "cube"}
    if code == 'cube_root.1':
        ans = random.randint(1, 10)
        return {"question": f"∛{ans**3}", "answer": ans, "type": "root"}
    return {} 

def _gen_conversion(code):
    # conv.1: 1/2 -> 0.5
    if code == 'conv.1':
        num, den = random.choice([(1,2), (1,4), (3,4), (1,5), (2,5), (3,5), (4,5), (1,10)])
        return {
            "question": f"Convert {num}/{den} to decimal",
            "answer": str(float(num/den)),
            "type": "conversion"
        }
    # conv.2: 0.5 -> 50%
    if code == 'conv.2':
        val = random.choice([0.5, 0.25, 0.75, 0.2, 0.4, 0.6, 0.8, 0.1])
        return {
            "question": f"Convert {val} to percentage",
            "answer": str(int(val*100)) + "%",
            "type": "conversion"
        }
    return {} 

def _gen_doubling():
    n = random.randint(1, 50)
    return {"question": f"Double of {n}", "answer": n*2, "type": "doubling"}

def _gen_halving():
    n = random.randint(1, 25) * 2 # Even numbers
    return {"question": f"Half of {n}", "answer": n//2, "type": "halving"}

def _gen_multistep(code):
    # Simple logic for now: (a op b) op c
    ops = ['+', '-', '*']
    op1 = random.choice(ops)
    op2 = random.choice(ops)
    a, b, c = random.randint(1, 10), random.randint(1, 10), random.randint(1, 10)
    
    q = f"({a} {op1} {b}) {op2} {c}"
    try:
        ans = eval(q)
    except:
        ans = 0
        
    return {"question": q.replace('*', '×'), "answer": ans, "type": "multistep"}

# --- HELPERS ---

def _simple_op(min1, max1, min2, max2, op, no_neg=False, max_res=None):
    a = random.randint(min1, max1)
    b = random.randint(min2, max2)
    
    if no_neg and op == '-' and a < b:
        a, b = b, a
        
    if op == '+': ans = a + b
    elif op == '-': ans = a - b
    elif op == '*': ans = a * b
    else: ans = 0
    
    if max_res and ans > max_res:
         # Retry once simplistically
         a = random.randint(min1, max1 // 2)
         b = random.randint(min2, max2 // 2)
         if op == '+': ans = a + b
    
    return {
        "question": f"{a} {op.replace('*', '×')} {b}",
        "answer": ans,
        "type": "arithmetic"
    }

def _decimal_op(min_val, max_val, op):
    a = round(random.uniform(min_val, max_val), 1)
    b = round(random.uniform(min_val, max_val), 1)
    
    if op == '+': ans = round(a + b, 1)
    elif op == '-': ans = round(a - b, 1)
    elif op == '*': ans = round(a * b, 2)
    else: ans = 0
    
    return {
        "question": f"{a} {op.replace('*', '×')} {b}",
        "answer": ans,
        "type": "decimal"
    }

def _clean_div(min_dividend, max_dividend, min_divisor, max_divisor):
    b = random.randint(min_divisor, max_divisor)
    if b == 0: b = 1
    factor = random.randint(1, 12) 
    a = b * factor
    return {
        "question": f"{a} ÷ {b}",
        "answer": factor,
        "type": "division"
    }

def _decimal_div():
    # Simple cases: 2.4 / 1.2 = 2
    ans = random.randint(1, 10)
    b = round(random.uniform(0.1, 2.0), 1)
    if b == 0: b = 0.5
    a = round(b * ans, 2)
    
    return {
        "question": f"{a} ÷ {b}",
        "answer": ans,
        "type": "decimal_division"
    }

def _fraction_op(op):
    # Simple common denominator
    den = random.choice([2, 3, 4, 5, 8, 10])
    num1 = random.randint(1, den * 2)
    num2 = random.randint(1, den)
    
    if op == '-' and num1 < num2: num1, num2 = num2, num1
    
# --- LEGACY HELPERS (Required by other apps) ---

def calculate_next_review(mastery_level, current_time=None):
    """
    Calculate when the next review should be based on mastery level
    using a spaced repetition algorithm.
    """
    if current_time is None:
        current_time = datetime.now(timezone.utc)
    
    # Base interval in days
    if mastery_level < 0.5:  # Low mastery
        days = 1
    elif mastery_level < 0.7:  # Medium mastery
        days = 3
    elif mastery_level < 0.9:  # High mastery
        days = 7
    else:  # Very high mastery
        days = 14
    
    # Add some randomness to prevent reviewing everything on the same day
    days = int(days * random.uniform(0.8, 1.2))
    
    return current_time + timedelta(days=days)

def analyze_common_errors(responses):
    """Analyze responses to identify common error patterns"""
    if not responses:
        return []
    
    error_patterns = {}
    
    for resp in responses:
        if not resp.get('is_correct', True):
            question_type = resp.get('type', 'unknown')
            error_type = f"{question_type}_error"
            
            # Simple error categorization - can be expanded
            if question_type == 'addition':
                if abs(resp.get('student_answer', 0) - resp.get('correct_answer', 0)) == 1:
                    error_type = "off_by_one"
                elif resp.get('student_answer', 0) > resp.get('correct_answer', 0):
                    error_type = "over_counting"
                else:
                    error_type = "under_counting"
            
            error_patterns[error_type] = error_patterns.get(error_type, 0) + 1
    
    # Sort by frequency
    return sorted(error_patterns.items(), key=lambda x: x[1], reverse=True)
