# Sultan0336/distilgpt2-imdb-sentiment

## Resumen

`Sultan0336/distilgpt2-imdb-sentiment` es un checkpoint de clasificación de sentimiento en dos clases (0 NEGATIVE, 1 POSITIVE) obtenido mediante fine-tuning de `distilbert/distilgpt2` sobre el dataset IMDb. Lo publica el usuario Sultan0336 como parte de un ejercicio académico de comparación encoder/decoder: el mismo autor entrena un DistilBERT bidireccional (`Sultan0336/distilbert-imdb-sentiment`) y este DistilGPT2 causal, ambos con la misma cabeza de clasificación y el mismo protocolo de datos, para contrastar el comportamiento de ambas arquitecturas en una tarea discriminativa.

El modelo no es un generador conversacional: aunque el backbone es un transformer causal de tipo GPT-2, la cabeza añadida convierte la salida en logits de dos clases. Con 81.914.112 parámetros (safetensors) y un repo de 0,3 GB, es un checkpoint pequeño, entrenado con secuencias truncadas a 128 tokens y con un conjunto de entrenamiento de solo 4.000 reseñas balanceadas. La relevancia práctica es acotada: sirve como referencia didáctica y como clasificador ligero de sentimiento en inglés para prototipos, no como componente de producción a gran escala.

La licencia es Apache 2.0, el idioma declarado es únicamente inglés y la librería es `transformers`, con pipeline `text-classification` y compatibilidad con endpoints. Los resultados medidos en el conjunto de test reservado (1.000 reseñas) son de 0,839 de accuracy y 0,839 de macro-F1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con cabeza de clasificación de secuencia; backbone DistilGPT2 |
| Parametros totales | 81.914.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima usada en entrenamiento y en la llamada de ejemplo; la ventana nativa de DistilGPT2 no se documenta en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | text-classification (2 clases: 0 NEGATIVE, 1 POSITIVE) |
| Dataset de entrenamiento | stanfordnlp/imdb (4.000 train, 500 validación, 1.000 test) |
| Modelo base | distilbert/distilgpt2 |
| Tamano del repo | 0,3 GB |
| Descargas / likes | 42 / 0 |

## Arquitectura y entrenamiento

El backbone es DistilGPT2, un transformer decoder-only con atención causal, al que se le añade una cabeza de clasificación de secuencia. La model card subraya explícitamente la diferencia con el modelo hermano: DistilBERT es bidireccional, mientras que este checkpoint procesa la secuencia de izquierda a derecha y agrega la representación para clasificar. Esa asimetría de atención es precisamente la variable que el ejercicio pretende comparar, aunque el propio autor advierte que la comparación no puede aislar el efecto de la arquitectura de las diferencias de preentrenamiento, tokenizador y número de parámetros.

Los datos provienen de IMDb, con 4.000 reseñas de entrenamiento, 500 de validación y 1.000 de test, todas las particiones balanceadas por clase. La validación se extrae del split original de entrenamiento y el test del split original de test. Se eliminan duplicados exactos normalizados, se quitan los saltos de línea HTML y se normaliza el espacio en blanco. La longitud máxima es de 128 tokens, de modo que las reseñas largas se truncan. El entrenamiento usa semilla 42, 2 épocas, AdamW con learning rate 2e-5, weight decay 0,01, warmup ratio 0,1, batch size 8 con acumulación 2, y selección del checkpoint por mejor macro-F1 de validación. El tiempo de entrenamiento registrado es de 153,86 segundos. No se documenta RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Clasificación binaria de sentimiento (NEGATIVE / POSITIVE) sobre texto en inglés, con salida de logits y etiqueta.
- Procesamiento de secuencias de hasta 128 tokens; el texto más largo se trunca.
- Integración directa con el pipeline `text-classification` de `transformers`, incluyendo `truncation=True` y `max_length=128`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generación de texto conversacional, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No hay capacidades multilingües declaradas: solo inglés.

## Casos de uso

- Moderación de reseñas de producto o cine en inglés: el modelo clasifica cada reseña como positiva o negativa y permite enrutar automáticamente las negativas a un equipo de soporte. Es adecuado por su tamaño reducido y su latencia, aunque el truncado a 128 tokens limita reseñas largas.
- Etiquetado de datasets de opinión a pequeña escala: con 506,5 muestras por segundo en el test medido (runtime 1,97 s para 1.000 muestras), sirve para preanotar corpus de sentimiento antes de una revisión humana.
- Señal auxiliar en un pipeline de análisis de opinión pública: agregar la proporción de reseñas negativas por producto o por periodo como métrica de seguimiento.
- Filtrado previo en sistemas de recomendación: descartar o priorizar contenido según el tono de las reseñas asociadas antes de un ranking más costoso.
- Baseline académico en experimentos de comparación encoder/decoder: junto con `Sultan0336/distilbert-imdb-sentiment`, permite reproducir el contraste entre atención bidireccional y causal con el mismo protocolo de datos.
- Prototipado rápido en local: al ocupar 0,3 GB y 81,9 M de parámetros, se puede cargar en CPU o en GPU de consumo para validar una idea de clasificación antes de invertir en un modelo mayor.
- Docencia y demostración de fine-tuning con `transformers`: el script de carga de la model card sirve como ejemplo mínimo de pipeline de clasificación.

## Benchmarks y rendimiento

Resultados medidos por el autor en el conjunto de test reservado (1.000 reseñas IMDb):

| Metrica | Valor |
|---|---|
| Test loss | 0,3786 |
| Test accuracy | 0,839 |
| Test macro precision | 0,8391 |
| Test macro recall | 0,839 |
| Test macro F1 | 0,8390 |
| Test runtime | 1,9742 s |
| Test samples per second | 506,536 |
| Test steps per second | 31,912 |
| Training seconds | 153,86 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K ni similares) en la información disponible; estos benchmarks no aplican a una tarea de clasificación de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,33 GB solo para pesos (81,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU.
- En fp16/bf16: alrededor de 0,16 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier modelo con 2 GB o más (GTX 1050 Ti, RTX 3050, RTX 4060, etc.), e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, endpoints de Hugging Face (tag `endpoints_compatible`), y servidores de inferencia compatibles con modelos `transformers`. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión manual no documentada.
- Throughput medido: 506,5 muestras/s y 31,9 pasos/s en el test del autor (hardware no especificado en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Accuracy / F1 en IMDb | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sultan0336/distilgpt2-imdb-sentiment | 81,9 M | 128 tokens (entrenamiento) | Clasificación binaria | 0,839 / 0,839 | Apache 2.0 | Hugging Face |
| Sultan0336/distilbert-imdb-sentiment | no disponible en la información | no disponible | Clasificación binaria | no disponible en la información | Apache 2.0 | Hugging Face |
| distilbert/distilgpt2 (base) | 81,9 M (aprox., backbone) | ventana nativa de GPT-2, no documentada aquí | Generación de texto | no aplica | Apache 2.0 | Hugging Face |

La comparación directa con el modelo hermano de DistilBERT es la más pertinente, pero la información disponible no incluye sus métricas ni su número exacto de parámetros. El autor advierte que cualquier comparación entre ambos no aísla el efecto de la arquitectura frente a diferencias de preentrenamiento, tokenizador y recuento de parámetros.

## Limitaciones y advertencias

- Muestra de entrenamiento pequeña (4.000 reseñas) y una sola semilla: los resultados pueden no ser estables ni representativos de otros dominios.
- Dominio restringido a reseñas de cine (IMDb); el rendimiento fuera de ese dominio no está evaluado.
- Sin etiqueta neutra: textos neutros o mixtos se fuerzan a NEGATIVE o POSITIVE.
- Truncado a 128 tokens: las reseñas largas pierden información y pueden clasificarse mal.
- El sarcasmo y el sentimiento mixto pueden clasificarse erróneamente, según reconoce el autor.
- Las puntuaciones softmax no están calibradas como probabilidades; no deben interpretarse como confianza fiable.
- Solo inglés; no hay soporte multilingüe declarado.
- No es un generador conversacional: no debe usarse para diálogo, generación de texto ni tareas de razonamiento.
- La comparación con el modelo DistilBERT del mismo autor no permite aislar la arquitectura como causa de las diferencias de rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del dataset IMDb enlazados por el autor (https://huggingface.co/datasets/stanfordnlp/imdb) antes de un despliegue comercial.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza aparente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sultan0336/distilgpt2-imdb-sentiment
- Modelo hermano (encoder DistilBERT): https://huggingface.co/Sultan0336/distilbert-imdb-sentiment
- Modelo base: https://huggingface.co/distilbert/distilgpt2
- Dataset IMDb: https://huggingface.co/datasets/stanfordnlp/imdb
- Términos del dataset: https://huggingface.co/datasets/stanfordnlp/imdb
