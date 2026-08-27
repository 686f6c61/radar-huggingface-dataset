# tadiecool29/rasyosef-roberta-base-amharic-finetuned-stl-stance

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `rasyosef/roberta-base-amharic`, un modelo RoBERTa preentrenado desde cero para la lengua amhárica. El ajuste se ha realizado para tareas de análisis de sentimiento o detección de postura (stance) en textos amháricos, según indican las métricas reportadas en la model card. El modelo tiene 110,6 millones de parámetros y se distribuye en formato safetensors. Aunque la información pública es escasa (no se especifica el dataset de entrenamiento ni la licencia), las métricas de evaluación declaradas por el autor muestran un F1 de 0,7985 y una precisión de sentimiento de 0,7976. Su relevancia radica en cubrir una lengua de bajos recursos como el amhárico, donde existen pocos modelos especializados en tareas de clasificación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (similar a XLM-RoBERTa-base) |
| Parametros totales | 110.619.652 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de RoBERTa base: 512, no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | Amhárico (inferido del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `rasyosef/roberta-base-amharic` sigue la arquitectura de XLM-RoBERTa-base, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. Fue preentrenado desde cero sobre 290 millones de tokens procedentes de subconjuntos amháricos de los corpus OSCAR, mc4 y amharic-sentences-corpus, con un tokenizer propio de 32 000 piezas. El ajuste fino se realizó con el Trainer de Hugging Face, usando una tasa de aprendizaje de 1e-5, batch de entrenamiento de 16, batch de evaluación de 32, optimizador AdamW, scheduler coseno con 300 pasos de calentamiento y 6 épocas, con precisión mixta nativa. No se especifica el dataset de entrenamiento (aparece como "None" en la model card), lo que limita la reproducibilidad.

## Capacidades

- Clasificación de sentimiento o postura en textos amháricos, con métricas de precisión, recall y F1 reportadas.
- No se documentan otras capacidades como generación de texto, razonamiento, código o tool calling.
- El modelo es monolingüe (amhárico) y no se indica soporte multilingüe.
- No se menciona soporte para agentes ni razonamiento multi-paso.

## Casos de uso

- Análisis de opiniones en redes sociales: el modelo puede clasificar comentarios o publicaciones en amhárico como positivos, negativos o neutrales, útil para monitorizar la percepción pública de marcas o eventos.
- Detección de posturas en debates políticos: permite identificar si un texto apoya o se opone a una postura concreta, aplicable a análisis de discursos o foros de discusión.
- Moderación de comentarios en plataformas amháricas: puede filtrar contenido tóxico o polarizado en foros, blogs o secciones de comentarios.
- Investigación académica en NLP para lenguas africanas: sirve como punto de partida para estudios sobre sentimiento en amhárico, dado el escaso número de modelos específicos.
- Sistemas de atención al cliente en amhárico: integrado en un pipeline de clasificación, puede derivar automáticamente las quejas o consultas según su tono.
- Análisis de noticias y artículos de opinión: permite clasificar la postura editorial de medios amháricos sobre temas concretos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss | 0,7805 |
| Precision (sentimiento) | 0,7976 |
| Recall (sentimiento) | 0,8010 |
| F1 | 0,7985 |
| Accuracy (sentimiento) | 0,7933 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 110 millones de parámetros, la inferencia en FP32 requiere aproximadamente 440 MB de VRAM, y en FP16 unos 220 MB.
- Puede ejecutarse en GPUs de consumo como una NVIDIA GTX 1060 (6 GB) o superior, así como en RTX 3060, RTX 4090, etc.
- Para despliegue, es compatible con librerías estándar de Hug Face como `transformers` y `pipeline`, y puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF).
- No se dispone de datos oficiales de latencia o throughput; en una GPU moderna se espera una inferencia de decenas de milisegundos por muestra.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de análisis de sentimiento en amhárico. El modelo base `rasyosef/roberta-base-amharic` es el único punto de referencia conocido, pero no se han publicado comparaciones directas.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado, lo que impide evaluar la calidad y representatividad de los datos.
- La licencia no está disponible, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- El modelo está especializado únicamente en amhárico; no es adecuado para otros idiomas.
- Al ser un ajuste fino con un número limitado de épocas y sin datos de validación externa, puede presentar sesgos derivados del corpus de preentrenamiento y del dataset de ajuste.
- No se han documentado riesgos de alucinación, pero al ser un modelo de clasificación, el riesgo principal es la clasificación errónea en textos ambiguos o con dialectos no representados.
- La fecha de creación (2026-08-27) es posterior a la fecha actual, lo que sugiere que el modelo puede ser experimental o tener metadatos incorrectos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tadiecool29/rasyosef-roberta-base-amharic-finetuned-stl-stance)
- [Modelo base rasyosef/roberta-base-amharic](https://huggingface.co/rasyosef/roberta-base-amharic)
