# index-dataset

Это индексирует базу записей библиотеки из MongoDB в Elasticsearch.

Перед индексированием не помешало бы настроить маппинг, анализатор и тд. [Пример](https://github.com/grodno-city/index-dataset/blob/master/indexMapping.json)

Ну или нет. 

P.S. может позже подберутся настройки получше, а пока так. см историю, возможно предыдущие были лучше.

>Базу записей можно получить с помощью https://github.com/grodno-city/alis-web-dataset .
>Это база записей http://grodnolib.by/.
>Чтобы получить записи другой библиотеки на базе ALIS-WEB необходимо поменять захардкоженный вот [тут](https://github.com/grodno-city/alis-web-index/blob/265e891d5435f1f27b5624be431258bcfed70c22/config.json) `alisEndpoint` .
>В целом можно использовать только `alis-web-index`. Пример потребителя https://github.com/grodno-city/alis-web-index/blob/master/consumer.js


