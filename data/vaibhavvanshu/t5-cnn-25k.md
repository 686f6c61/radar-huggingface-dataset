# vaibhavvanshu/t5-cnn-25k

## Resumen

El modelo `vaibhavvanshu/t5-cnn-25k` es un ajuste fino de **T5-small** (60,5 millones de parámetros) especializado en resumen abstractivo de texto. Ha sido entrenado sobre 25 000 ejemplos del conjunto de datos **CNN/DailyMail**, un corpus estándar de artículos periodísticos con resúmenes de referencia escritos por humanos. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para aplicaciones de resumen de documentos y artículos, tanto en entornos educativos como de investigación.

Su relevancia radica en su tamaño compacto (60 M de parámetros), lo que permite ejecutarlo en hardware modesto, incluso en CPU, sin necesidad de GPUs de alta gama. Además, está diseñado para integrarse en un sistema de resumen jerárquico que divide documentos largos en fragmentos, genera resúmenes intermedios y los combina para obtener un resumen final, lo que amplía su alcance más allá de la ventana de contexto de 512 tokens del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-small) |
| Parametros totales | 60 506 624 |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens (entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con CNN/DailyMail, corpus en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura **T5** (Text-to-Text Transfer Transformer), un transformer encoder-decoder donde todas las tareas se formulan como conversión de texto a texto. En este caso, el ajuste fino se realizó a partir del modelo base `google-t5/t5-small` (60 millones de parámetros). El entrenamiento se llevó a cabo sobre 25 000 ejemplos del dataset CNN/DailyMail, que contiene artículos de noticias y resúmenes de referencia. No se especifican hiperparámetros concretos (épocas, tasa de aprendizaje, etc.), ni se menciona el uso de técnicas como RLHF o DPO. La model card indica que el modelo está preparado para generar resúmenes de hasta 400 tokens de salida, aunque el ejemplo de uso muestra un máximo de 250 tokens con `num_beams=4` y `early_stopping=True`.

La aplicación asociada implementa un proceso de **resumen jerárquico** para documentos largos: divide el texto en fragmentos, genera resúmenes intermedios, los combina y realiza pasadas adicionales si es necesario, lo que permite manejar documentos que exceden la ventana de contexto del modelo.

## Capacidades

- **Generación de resúmenes abstractivos**: produce resúmenes concisos que reformulan el contenido en lugar de extraer frases literalmente.
- **Resumen de artículos y documentos**: adecuado para noticias, informes y textos generales en inglés.
- **Control de longitud**: la aplicación permite resúmenes cortos (hasta 150 tokens), medianos (250) y largos (400) ajustando el parámetro `max_length`.
- **Resumen jerárquico**: integrado en la aplicación para documentos extensos mediante fragmentación y combinación de resúmenes.
- **Integración con Hugging Face**: compatible con `transformers` y `text-generation-inference` para despliegue en producción.
- **Multilingüismo**: no declarado; el entrenamiento se realizó sobre CNN/DailyMail, que es íntegramente en inglés, por lo que su rendimiento en otros idiomas es desconocido.

## Casos de uso

- **Resumen de artículos de noticias**: dado un artículo en inglés, el modelo genera un resumen de una o dos frases, útil para boletines o alertas informativas.
- **Resumen de documentos PDF**: la aplicación Text Summarizer extrae texto de PDF y lo resume; el modelo se emplea para fragmentos individuales.
- **Resumen jerárquico de informes largos**: mediante el pipeline de resumen en cascada, se pueden resumir informes de varias páginas sin perder la información clave.
- **Herramientas educativas**: para estudiantes que necesitan condensar lecturas académicas o artículos de investigación.
- **Prototipado y demostraciones**: por su pequeño tamaño y licencia Apache, es fácil de integrar en aplicaciones de demostración o proyectos de investigación.
- **Preprocesamiento para sistemas de recuperación**: los resúmenes generados pueden usarse como entrada para sistemas de búsqueda semántica o clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni en la model card ni en la búsqueda web). No se proporcionan métricas ROUGE, MMLU u otras comparativas.

## Requisitos de hardware

- **VRAM estimada**: con 60 millones de parámetros, el modelo en FP32 ocupa aproximadamente 242 MB de memoria. En FP16, se reduce a unos 121 MB. En cuantización de 8 bits, podría caber en menos de 100 MB.
- **GPU recomendadas**: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). En CPU puede ejecutarse sin problema para inferencia en tiempo real.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo (incluso integradas) y en CPU.
- **Opciones de despliegue**: `transformers` (Python), `vLLM`, `Text Generation Inference` (TGI), `Ollama` (si se convierte a GGUF), `llama.cpp` (con conversión), o servicios como Hugging Face Inference Endpoints.
- **Latencia y throughput**: no se han publicado datos específicos. Dado el tamaño, la inferencia en CPU debería ser del orden de decenas de milisegundos por muestra, y en GPU mucho menor.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento entre este modelo y otras alternativas. Como referencia, existen otros modelos de resumen abstractivo de tamaño similar:

- **`google-t5/t5-small`**: el modelo base, sin ajuste fino, con la misma arquitectura y tamaño.
- **`facebook/bart-base`**: otro modelo encoder-decoder de 140 M parámetros, entrenado en tareas de denoising, también usado para resumen.
- **`sshleifer/distilbart-cnn-12-6`**: versión destilada de BART, con 120 M parámetros, entrenado en CNN/DailyMail.

No se puede afirmar que este modelo supere o iguale a esos alternativas sin datos de evaluación.

## Limitaciones y advertencias

- **Sesgo y alucinación**: como todo modelo abstractivo, puede omitir información importante, generar afirmaciones incorrectas o alucinar datos no presentes en el texto original.
- **Dominio**: entrenado exclusivamente en noticias (CNN/DailyMail); su rendimiento en otros dominios (científico, legal, médico) puede ser degradado.
- **Contexto**: la ventana de entrada está limitada a 512 tokens; para textos más largos se requiere el sistema de resumen jerárquico.
- **Idioma**: no hay evidencia de soporte multilingüe; el modelo solo está entrenado en inglés y su uso en otros idiomas no es recomendable.
- **Licencia del dataset**: aunque el modelo tiene licencia Apache 2.0, el dataset CNN/DailyMail tiene restricciones de uso no comercial (consulta los términos del dataset). Para uso comercial, se debe verificar la compatibilidad.
- **Dependencia del tokenizador**: se requiere el tokenizador T5 original para el preprocesado correcto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/vaibhavvanshu/t5-cnn-25k)
- [Modelo base T5-small en Hugging Face](https://huggingface.co/google-t5/t5-small)
- [Documentación de T5 en Transformers](https://huggingface.co/docs/transformers/model_doc/t5)
- [Dataset CNN/DailyMail en Hugging Face](https://huggingface.co/datasets/cnn_dailymail)
- [Repositorio T5X (marco de entrenamiento)](https://github.com/google-research/t5x)
