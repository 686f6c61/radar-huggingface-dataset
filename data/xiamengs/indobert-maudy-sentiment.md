# xiamengs/indobert-maudy-sentiment

## Resumen

IndoBERT Maudy Sentiment es un clasificador de sentimiento en indonesio de tres clases (negativo, neutro, positivo) obtenido mediante fine-tuning del modelo `indolem/indobertweet-base-uncased`, un BERT base adaptado al indonesio a partir de tuits. Lo publica el usuario `xiamengs` en Hugging Face con licencia Apache 2.0 y está pensado para el análisis de opiniones sobre la figura pública Maudy Ayunda durante la polémica de septiembre de 2026 en torno al lema *Mindfulness in the Age of Bad News*.

El modelo resuelve una tarea muy acotada: clasificar tuits en indonesio relacionados con esa controversia concreta. Con 110,5 millones de parámetros y un repositorio de 0,4 GB, es un modelo pequeño y ligero, apto para inferencia en CPU o GPU de gama baja. Su relevancia es limitada fuera del dominio para el que fue entrenado: el propio autor advierte que el corpus se construyó con 20 consultas de palabras clave centradas en vocabulario de la controversia, por lo que las proporciones de clase reflejan el diseño de muestreo y no la opinión pública real.

La métrica de referencia es un macro-F1 de 0,6116 en un conjunto de test reservado de 213 tuits, con un rendimiento especialmente débil en la clase positiva (F1 de 0,263), que solo cuenta con 16 ejemplos en test. Es, por tanto, un artefacto de investigación con utilidad demostrativa más que un clasificador de sentimiento generalista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (familia IndoBERTweet) |
| Parametros totales | 110.560.515 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT base, heredada del checkpoint `indolem/indobertweet-base-uncased`, que adapta BERT al indonesio mediante preentrenamiento sobre tuits. Sobre esa base se añade una cabeza de clasificación de tres clases y se hace fine-tuning supervisado con los siguientes hiperparámetros: longitud máxima de 256 tokens, batch size de 16, learning rate de 5e-5, tres épocas en el ajuste final y semilla 42, sobre un total de 856 tuits etiquetados.

El detalle técnico más relevante es que el modelo exige una normalización previa del texto mediante la función `clean_text()` del proyecto del autor antes de la tokenización; enviar texto sin procesar degrada silenciosamente las predicciones. No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional: es un fine-tuning convencional de clasificación. El conjunto de entrenamiento es muy reducido (856 filas) y está sesgado por el diseño de muestreo basado en 20 consultas de palabras clave sobre la controversia.

## Capacidades

- Clasificación de sentimiento en indonesio en tres clases: negativo, neutro y positivo.
- Procesamiento de tuits con contexto de hasta 256 tokens.
- Pensado específicamente para texto relacionado con la polémica sobre Maudy Ayunda y el lema *Mindfulness in the Age of Bad News*.
- Compatible con el pipeline `text-classification` de la librería `transformers`.
- Compatible con Text Embeddings Inference y con endpoints compatibles según las etiquetas del repositorio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- No es un modelo generativo: no produce texto, solo etiquetas y probabilidades.

## Casos de uso

- Análisis exploratorio de opiniones sobre Maudy Ayunda en tuits recogidos durante la polémica de septiembre de 2026: el modelo clasifica cada tuit en negativo, neutro o positivo, sirviendo como primera capa de etiquetado para un estudio acotado.
- Filtrado de menciones negativas en un corpus de tuits del dominio: con un F1 de 0,894 en la clase negativa, es la clase más fiable y puede usarse para aislar quejas o críticas dentro de un conjunto de datos ya recolectado con las mismas palabras clave.
- Reproducción de la línea base del artículo del autor: sirve para comparar el rendimiento de un BERT ajustado frente a un TF-IDF con regresión logística (macro-F1 de 0,5318), especialmente en la clase positiva, donde el baseline obtiene 0,0.
- Demostración docente de fine-tuning de BERT en indonesio: con 856 filas de entrenamiento y una receta reproducible (max length 256, batch 16, lr 5e-5, 3 épocas, semilla 42), es un ejemplo práctico de clasificación de texto con pocos datos.
- Evaluación de robustez de clasificadores de sentimiento con pocos ejemplos por clase: al tener solo 16 positivos en test, permite estudiar cómo se degrada el rendimiento en clases minoritarias.
- Prototipado rápido en CPU o GPU de gama baja: con 110 millones de parámetros y 0,4 GB de pesos, se puede desplegar en entornos sin acelerador dedicado para pruebas de concepto.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Validacion cruzada 5-fold x 3 semillas (15 ejecuciones), macro-F1 | 0,6692 +- 0,046 |
| Test reservado (213 tuits, abierto una sola vez), macro-F1 | 0,6116 |
| F1 clase negativa (test) | 0,894 |
| F1 clase neutra (test) | 0,678 |
| F1 clase positiva (test) | 0,263 |
| Baseline TF-IDF + regresion logistica, macro-F1 | 0,5318 |
| Baseline TF-IDF, F1 clase positiva | 0,0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El propio autor advierte que este checkpoint es un reajuste y no el checkpoint evaluado originalmente, por lo que no reproduce exactamente la cifra de 0,6116.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los 110,5 millones de parámetros; en torno a 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo está sobredimensionado para estas tarjetas y no las aprovecha.
- Cabe holgadamente en GPU de consumo y también funciona en CPU, dado el tamaño reducido del repositorio (0,4 GB).
- Opciones de despliegue: `transformers` con el pipeline `text-classification`, Text Embeddings Inference y endpoints compatibles; no hay variantes GGUF publicadas para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xiamengs/indobert-maudy-sentiment | 110,5 M | 256 | Macro-F1 0,6116 en test propio | Apache 2.0 | Hugging Face |
| indolem/indobertweet-base-uncased | no disponible | no disponible | no disponible (modelo base, sin cabeza de clasificacion) | no disponible | Hugging Face |
| Baseline TF-IDF + regresion logistica | no aplicable | no aplicable | Macro-F1 0,5318 | no disponible | Implementacion propia del autor |

No se dispone de datos sobre otros clasificadores de sentimiento en indonesio comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No debe usarse para medir opinión pública: el corpus se construyó con 20 consultas de palabras clave centradas en vocabulario de la controversia, por lo que las proporciones de clase reflejan el diseño de muestreo.
- El rendimiento en la clase positiva es débil (F1 de 0,263) y solo hay 16 ejemplos positivos en test; las probabilidades de la clase positiva deben considerarse poco fiables.
- El checkpoint publicado es un reajuste con la misma receta, no el checkpoint evaluado originalmente, por lo que no reproduce con exactitud la métrica de 0,6116.
- Exige normalizar el texto con `clean_text()` antes de la tokenización; el texto sin procesar degrada las predicciones sin aviso.
- Entrenado con solo 856 filas, lo que limita la generalización fuera del dominio y del periodo temporal de recogida.
- Solo soporta indonesio; no hay capacidades multilingües documentadas.
- Contexto limitado a 256 tokens, insuficiente para documentos largos o hilos de conversación extensos.
- Riesgo de alucinación no aplicable al ser un clasificador, pero sí existe riesgo de clasificaciones erróneas sistemáticas por el sesgo del muestreo y el desbalance de clases.
- Licencia Apache 2.0, que permite uso comercial; sin embargo, las advertencias del autor sobre el sesgo del corpus hacen desaconsejable su uso en producción para decisiones que afecten a personas.
- No se documentan sesgos demográficos o lingüísticos específicos más allá del sesgo de muestreo indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiamengs/indobert-maudy-sentiment
- Modelo base: https://huggingface.co/indolem/indobertweet-base-uncased
