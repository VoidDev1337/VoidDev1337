-----
```python
from Github import GithubReadme

class Void:
    def __init__(self):
        self.name = "Void!"
        self.age = "15"
        self.location = "Mars, With Elon Musk"
        self.work = "Developer"
        self.system = "Windows 10, x64"

    def skills(self):
        self.languages = {
            "main": ["Python", "Java", "Php", "Node.js", "C#", "HTML/CSS/JS"],
            "learning": ["golang", "C++"]
        }

        self.works = ['Token Generator', 'hCaptcha Bypass', 'Chat Botter', 'Shill Tool', 'Token Manager', 'etc...']
    
    def social_media(self):
        self.discord = "VO!D.#5481"
        self.telegram = "voiddev1337"
        self.sellix = "voidtools.sellix.io"
        self.onlyfans = None


if __name__ == "__main__":
    readme = GithubReadme.create(Void)
```
-----
