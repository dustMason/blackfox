#!/usr/local/bin/python
# -*- coding: utf-8 -*-

import urllib
import urllib2
import os
import glob

from BeautifulSoup import BeautifulSoup as bs

MAX_PAGES = 50
HEADERS = {
    "User-Agent" : "Mozilla/5.0",
    "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language" : "en-US,en;q=0.8",
    "Cache-Control" : "no-cache",
    "Connection" : "keep-alive",
    "Pragma" : "no-cache"
}


def get_backgrounds():
    base = 'http://www.thefoxisblack.com/category/the-desktop-wallpaper-project/page/%s/'
    for x in range(0, MAX_PAGES):
        get_images_from_page(base % (x + 1))


def get_images_from_page(url):
    html = fetchurl(url)
    soup = bs(html)
    for link in soup.findAll('a'):
        try:
            href = link['href']
            if '-1680x1050' in href:
                fname = 'fox_backgrounds%s' % href[href.rfind('/'):]
                if not os.path.isfile(fname) and not os.path.isfile(fname + ".skip"):
                  print 'Downloading %s' % href
                  f = fetchurl(href)
                  with open(fname, "wb") as local_file:
                      local_file.write(f)
                else:
                  print 'Skipping %s' % href
        except (KeyError, urllib2.HTTPError):
            pass


def fetchurl(url):
    request = urllib2.Request(url, headers = HEADERS)
    response = urllib2.urlopen(request)
    content = response.read()
    return content


if __name__ == '__main__':
    get_backgrounds()
