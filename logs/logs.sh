#!/bin/sh

YM="2014-06"
for s in mx3 mx4 mx5 mx6; do
  scp enmail@$s.enmail.com:logs/$s.enmail.com-$YM.csv .;
done
scp enmail@mx7.enmail.com:logs/mx7-$YM.csv .
mv mx7-$YM.csv mx7.enmail.com-$YM.csv
touch enmail-$YM.csv
echo "do the collating/sorting and then"
echo "scp mx?.enmail.com-$YM.csv enmail-$YM.csv enmail@ks1.enmail.com:logs/"

