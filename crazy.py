from pynput.mouse import Button, Controller
from pynput import keyboard
import time
import threading

mouse = Controller()
clicking = False  # toggle for clicking
delay = 0.1       # time between clicks (adjust as needed)

def clicker():
    while True:
        if clicking:
            mouse.click(Button.left, 1)
            time.sleep(delay)

def on_press(key):
    global clicking

    try:
        if key.char == 's':  # start clicking
            clicking = True
            print("Clicking started.")
        elif key.char == 'q':  # stop clicking
            clicking = False
            print("Clicking stopped.")
    except AttributeError:
        pass  # handles special keys like shift, ctrl, etc.

def on_release(key):
    if key == keyboard.Key.esc:
        print("Exiting...")
        return False  # stops the listener

# Start clicker in a thread
click_thread = threading.Thread(target=clicker)
click_thread.daemon = True
click_thread.start()

# Start keyboard listener
with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()
