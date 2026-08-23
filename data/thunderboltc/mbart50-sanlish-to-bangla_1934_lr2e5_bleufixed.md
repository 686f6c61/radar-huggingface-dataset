# thunderboltc/mbart50-sanlish-to-bangla_1934_lr2e5_bleufixed

## Resumen

`thunderboltc/mbart50-sanlish-to-bangla_1934_lr2e5_bleufixed` es un modelo de traducción automática neuronal (text2text-generation) obtenido mediante fine-tuning del modelo multilingüe `facebook/mbart-large-50-many-to-many-mmt` de Meta. El objetivo declarado es la traducción de "sanlish" (bengalí romanizado, es decir, bengalí escrito con caracteres latinos) a bengalí nativo (escritura bengalí). El nombre del repositorio indica el dataset de entrenamiento (`1934`), el learning rate (`lr2e5`) y la corrección de la métrica BLEU (`bleufixed`).

El modelo tiene 611.129.542 parámetros (misma arquitectura que mBART-50) y ha sido entrenado durante 25 épocas con un learning rate de 2e-05, batch size efectivo de 16 y precisión mixta AMP. La model card es escasa: no se especifica la licencia, los idiomas soportados ni el dataset de entrenamiento (se indica "None"). El repositorio tiene 171.1 GB de tamaño, lo que sugiere que incluye checkpoints intermedios o archivos de entrenamiento además de los pesos finales en safetensors.

Este modelo es relevante como ejemplo de fine-tuning de mBART-50 para una tarea de transliteración/romanización inversa, un área con pocas herramientas específicas para el bengalí. Sin embargo, los resultados de evaluación son modestos (BLEU 8.43, ChRF 33.0) y la documentación es insuficiente para recomendarlo en producción sin una validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder multilingüe (mBART-large-50) |
| Parametros totales | 611.129.542 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (mBART-50 original: 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta 50 idiomas; el fine-tuning se orienta a bengalí romanizado → bengalí) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tambien contiene otros archivos; el repo pesa 171.1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/mbart-large-50-many-to-many-mmt`, un transformer encoder-decoder de 611M parámetros preentrenado con denoising multilingüe sobre 50 idiomas. La arquitectura original de mBART-50 emplea una ventana de contexto de 1024 tokens y un vocabulario de 250K subpalabras (SentencePiece). En este fine-tuning se mantienen los pesos preentrenados del modelo base y se ajustan todas las capas.

El entrenamiento se realizó con el `Trainer` de HuggingFace usando los siguientes hiperparámetros: learning rate 2e-05, batch size por dispositivo 8, gradientes acumulados 2 (batch efectivo 16), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal, 25 épocas y precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card (se indica "None"). El nombre del repositorio sugiere que se usó un corpus de 1934 pares de frases, pero no se confirma. La pérdida de entrenamiento desciende de 8.33 a 0.14 a lo largo de las 23 épocas registradas, con la pérdida de validación mínima en la época 3 (2.96) y luego un incremento progresivo, indicando posible sobreajuste.

## Capacidades

- Traducción de bengalí romanizado (sanlish) a bengalí nativo mediante generación de texto secuencial (text2text-generation).
- Generación de texto condicionada por un texto fuente; no se documentan capacidades de tool calling, function calling ni uso de agentes.
- No dispone de capacidades multimodales (sin visión, audio ni vídeo).
- La ventana de contexto hereda la del modelo base (1024 tokens), lo que limita la entrada a textos relativamente cortos.
- El modelo es monolingüe en la práctica (sanlish→bengalí), aunque el modelo base es multilingüe; no se ha verificado el comportamiento en otros idiomas.
- Capacidad de razonamiento limitada a la tarea de traducción; no hay soporte de thinking mode ni de razonamiento multi-step.

## Casos de uso

- Transliteración de texto bengalí romanizado a escritura bengalí: el modelo convierte entradas como "ami tomake bhalobashi" en "আমি তোমাকে ভালোবাসি". Es útil para normalizar contenido de redes sociales y foros donde los usuarios escriben bengalí en alfabeto latino.
- Preprocesamiento para NLP en bengalí: antes de aplicar análisis de sentimiento, NER o clasificación a textos bengalíes no nativos, se puede transliterar a escritura bengalí para unificar el formato.
- Accesibilidad para hablantes no alfabetizados en escritura bengalí: permite a usuarios que solo escriben en latino acceder a contenido en bengalí escrito en su escritura nativa.
- Normalización de corpus de texto: para entrenar modelos de lenguaje en bengalí, se puede usar este modelo para convertir corpus romanizados a escritura nativa, mejorando la calidad de los datos.
- Traducción de mensajes de chat y redes sociales: en aplicaciones de mensajería con usuarios bengalíes que usan romanización, se puede integrar como servicio de traducción en tiempo real.
- Asistencia de escritura para hablantes de bengalí: los usuarios que conocen el idioma pero no la escritura pueden dictar o escribir en romanizado y obtener texto bengalí formal para documentos, correos o publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (el `model-index` de la model card está vacío). El autor declara los siguientes resultados en el conjunto de evaluación durante el entrenamiento:

| Epoch | Validation Loss | Bleu | Chrf |
|:-----:|:---------------:|:----:|:----:|
| 1.0 | 3.5064 | 0.7883 | 12.1081 |
| 2.0 | 3.0986 | 2.5229 | 17.2748 |
| 3.0 | 2.9789 | 2.3490 | 19.8955 |
| 4.0 | 2.9608 | 4.4033 | 23.7514 |
| 5.0 | 3.0397 | 3.6133 | 25.3107 |
| 6.0 | 3.0399 | 5.9597 | 27.0649 |
| 7.0 | 3.1427 | 5.0788 | 27.3468 |
| 8.0 | 3.1384 | 7.2174 | 30.3129 |
| 9.0 | 3.1405 | 7.5372 | 30.1748 |
| 10.0 | 3.2135 | 7.3507 | 29.4237 |
| 11.0 | 3.2691 | 7.6517 | 29.9946 |
| 12.0 | 3.2783 | 8.0592 | 28.8309 |
| 13.0 | 3.2653 | 8.6232 | 31.8898 |
| 14.0 | 3.2907 | 8.7342 | 31.8681 |
| 15.0 | 3.3074 | 8.2271 | 31.2518 |
| 16.0 | 3.2872 | 8.2875 | 31.6010 |
| 17.0 | 3.3393 | 9.0506 | 32.5280 |
| 18.0 | 3.3172 | 10.3651 | 32.2873 |
| 19.0 | 3.3454 | 9.5312 | 32.4380 |
| 20.0 | 3.3242 | 9.2245 | 32.4313 |
| 21.0 | 3.3230 | 9.1774 | 33.7570 |
| 22.0 | 3.3441 | 9.8885 | 33.2189 |
| 23.0 | 3.3407 | 8.4301 | 33.0052 |

El mejor BLEU se alcanza en la época 18 (10.3651) y el mejor Chrf en la época 21 (33.7570). El modelo final (época 23) obtiene BLEU 8.4301 y Chrf 33.0052. Estos valores son bajos en términos absolutos, lo que indica una calidad de traducción limitada, posiblemente por el tamaño reducido del dataset o por la dificultad intrínseca de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: con 611M de parámetros, en fp16 se requieren aproximadamente 1.2 GB de VRAM para los pesos, más overhead de activaciones y atención (para secuencias de 1024 tokens, alrededor de 2-3 GB en total). En fp32, unos 2.8 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 2060, GTX 1660 Ti, RTX 3050, etc.) puede ejecutar inferencia en fp16. Para entrenamiento, se requieren GPUs con más memoria; el autor usó una GPU con al menos 16 GB (por el batch size 8 y AMP).
- Consumer GPU: sí, cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., con cuantización fp16 o int8.
- Opciones de despliegue: se puede servir con HuggingFace `transformers` (pipeline de `text2text-generation`), `vLLM` (si se convierte a formato compatible), `TGI` (Text Generation Inference), o `llama.cpp` si se convierte a GGUF (aunque la arquitectura seq2seq de mBART no está soportada por defecto en llama.cpp).
- Latencia estimada: para una entrada de 50 tokens y salida de 50 tokens, se espera una latencia de ~100-200 ms en una GPU moderna (A100 o RTX 4090) en fp16. En CPU, sería significativamente más lenta (varios segundos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|--------|------------|----------|-------|----------|----------------|
| `thunderboltc/mbart50-sanlish-to-bangla_1934_lr2e5_bleufixed` | 611M | 1024 tokens (base) | sanlish → bengalí | no disponible | HuggingFace |
| `facebook/mbart-large-50-many-to-many-mmt` | 611M | 1024 tokens | traducción multilingüe (50 idiomas) | MIT (no confirmado; modelo base de Meta) | HuggingFace |
| `google/mt5-small` (o mT5) | 300M | 512 tokens | traducción multilingüe | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparables entre estos modelos para la tarea específica de sanlish→bengalí. El modelo base mBART-50 tiene una licencia de Meta (no comercial en algunos términos, según el acuerdo de uso del modelo), pero la licencia del fine-tuning no se especifica. mT5 es una alternativa de código abierto (Apache 2.0) que podría fine-tunearse para la misma tarea.

## Limitaciones y advertencias

- La calidad de traducción es baja: el BLEU final es 8.43, un valor muy inferior a los típicos de sistemas de traducción comerciales (20-40 en tareas similares). El modelo puede producir traducciones incorrectas o incoherentes.
- El dataset de entrenamiento no se especifica ("None" en la model card), lo que impide evaluar su cobertura, calidad y posible sesgo. El nombre del repo sugiere 1934 pares, un tamaño muy reducido para una tarea de traducción.
- No se declara licencia, por lo que el uso comercial del modelo es incierto. El modelo base (mBART-50) tiene restricciones de uso según Meta; estas pueden heredarse.
- No se proporcionan instrucciones de uso, ni ejemplos de preprocesamiento ni de tokens especiales (p.ej. el prefijo de idioma `__bn__` para bengalí). El usuario debe inferir el formato de entrada.
- Riesgo de alucinación y de errores de transliteración, especialmente en nombres propios, palabras no vistas o variantes dialectales del bengalí.
- La ventana de contexto es limitada (1024 tokens), lo que impide procesar documentos largos de una sola vez.
- No se han publicado benchmarks independientes ni evaluaciones de robustez frente a ruido ortográfico (variantes de romanización), lo que limita su fiabilidad en entornos reales.
- El repositorio pesa 171.1 GB, lo que indica que incluye checkpoints de entrenamiento intermedios; se debe descargar solo el checkpoint final para uso en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/thunderboltc/mbart50-sanlish-to-bangla_1934_lr2e5_bleufixed)
- [Repositorio de la versión `1934` (sin el sufijo `bleufixed`)](https://huggingface.co/thunderboltc/mbart50-sanlish-to-bangla_1934)
- [Repositorio base de `mbart50-sanlish-to-bangla`](https://huggingface.co/thunderboltc/mbart50-sanlish-to-bangla)
- [Modelo base: `facebook/mbart-large-50-many-to-many-mmt`](https://huggingface.co/facebook/mbart-large-50-many-to-many-mmt)
- [GitHub topic sobre mBART50 (repos de traducción multilingüe)](https://github.com/topics/mbart50)
- [Paper de IIETA sobre fine-tuning de mBART50 (referencia de contexto)](https://iieta.org/journals/isi/paper/10.18280/isi.290304)
