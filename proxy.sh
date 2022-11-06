#/bin/sh

# Парсим прокси с публичных API
wget "https://api.proxyscrape.com/?request=getproxies&proxytype=http&timeout=10000&ssl=no" -O s1.txt;
wget "https://www.proxy-list.download/api/v1/get?type=http" -O s2.txt;
wget "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt" -O s3.txt;
wget "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt" -O s4.txt;

# Сохраняем все прокси в 1 список
cat s1.txt s2.txt s3.txt s4.txt > all_proxy.txt;

# Сортируем и удаляем дубликаты прокси
sort all_proxy.txt | uniq -u > proxy.txt;

# Удаляем времененные файлы.
rm -rf s1.txt; 
rm -rf s2.txt; 
rm -rf s3.txt; 
rm -rf s4.txt; 
rm -rf all_proxy.txt;