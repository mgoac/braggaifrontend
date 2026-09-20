import bs4,requests
response = requests.get("https://famu.edu")
scraper = bs4.BeautifulSoup(response.content,'html.parser')
lis = scraper.select('li[class="nav-accordion__item"]')
for li in lis:
    links = li.select("a[href]")
    title = li.find("span", class_=False)
    print(title)
    for link in links:
        print(link["href"])

