# yujiepan/deepseek-v4.1-flash-1017-tiny-random

## Resumen

`yujiepan/deepseek-v4.1-flash-1017-tiny-random` es un checkpoint de depuración de 67.984.458 parámetros publicado por el usuario yujiepan. No es un modelo entrenado: sus pesos se inicializan de forma aleatoria a partir de una configuración adaptada de `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un modelo multimodal de texto y visión con arquitectura MoE. Su objetivo no es generar contenido útil, sino reproducir a pequeña escala la topología del modelo original para probar pilas de inferencia, kernels y rutas de ejecución.

El checkpoint conserva elementos estructurales del V4.1 Flash: atención dispersa comprimida con indexador, cuatro flujos residuales Hyper-Connections, búsqueda n-gram Engram, decodificación especulativa DSpark/MTP de tres etapas, torre de visión y cuantización FP8/FP4 con escalas UE8M0. Las dimensiones se reducen de forma deliberada: 6 capas de texto, 128 de dimensión oculta, 4 cabezas de atención y 32 expertos enrutados. Su relevancia es práctica para ingeniería de infraestructura, no para evaluación de capacidades.

La licencia y los idiomas no están declarados. El repositorio ocupa 0,1 GB y contiene un único `model.safetensors` de 96,7
