# wjbmattingly/comma-qwen-3.5-0.8b-full-33k

## Resumen

`comma-qwen-3.5-0.8b-full-33k` es un modelo de visión-lenguaje (image-text-to-text) desarrollado por `wjbmattingly` mediante un fine-tune completo de `Qwen/Qwen3.5-0.8B`. Su objetivo es transcribir páginas de manuscritos medievales en latín línea por línea, siguiendo el estándar CATMuS, un formato graphemico que reproduce la secuencia exacta de letras y signos tal como aparecen escritos, sin normalización editorial ni traducción.

Se trata de un checkpoint autónomo, sin adaptadores ni dependencia de PEFT, con 852.985.920 parámetros (el 100 % entrenables). El modelo se entrenó sobre 33.112 páginas del dataset `comma-project/deep-jsonl` durante 2 épocas en bf16, con una secuencia máxima de entrenamiento de 8192 tokens y un presupuesto de 2048 visual tokens por página. Es un fine-tune continuado que parte del checkpoint anterior `comma-qwen-3.5-0.8b-full` (entrenado con 9.906 páginas) y añade datos nuevos, lo que se refleja en una mejora del CER en la evaluación.

Su relevancia radica en que ofrece una herramienta especializada para paleografía y humanidades digitales, capaz de procesar imágenes de manuscritos y producir transcripciones listas para su análisis, con una licencia Apache 2.0 que permite uso comercial. La evaluación se realizó sobre 243 páginas reservadas, cada una de una mano distinta y no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión-lenguaje (image-text-to-text) sobre Qwen3.5-0.8B |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (secuencia de entrenamiento: 8192 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Latín (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de visión-lenguaje de `Qwen/Qwen3.5-0.8B`, un transformer multimodal que procesa imágenes y texto de forma conjunta. En este fine-tune, la imagen se codifica con un límite de 2048 visual tokens por página (2.097.152 píxeles tras smart-resize, un token por bloque de 32×32), configurado en el `processor_config.json` del repositorio. La secuencia máxima de entrenamiento es de 8192 tokens.

El entrenamiento se realizó como un fine-tune completo sobre 33.112 páginas del dataset `comma-project/deep-jsonl`, con 2 épocas, tamaño de lote efectivo 8, tasa de aprendizaje 5e-05, precisión bf16 y una duración de 38,9 horas en una NVIDIA RTX PRO 6000 Blackwell Server Edition. El autor indica que `max_length` nunca trunca: las muestras que exceden el presupuesto se descartan, porque una respuesta truncada enseñaría al modelo a detenerse a mitad de transcripción y un prompt truncado eliminaría las reglas que la salida debe obedecer.

La innovación técnica principal es que el modelo se entrenó para leer un prompt de reglas CATMuS de aproximadamente 11,6k caracteres como parte de la entrada. En consecuencia, servir un prompt diferente equivale a servir una tarea diferente. Además, la inferencia requiere `enable_thinking=False` para evitar que el modelo entre en modo de razonamiento en lugar de transcribir.

## Capacidades

- Transcripción línea por línea de páginas de manuscritos medievales en latín, respetando el orden de lectura físico.
- Producción de salidas conformes al estándar CATMuS: secuencia graphemica de letras y signos reducida al alfabeto latino moderno, sin intervención editorial.
- Reconocimiento óptico de caracteres (OCR) y reconocimiento de escritura a mano (HTR) para manuscritos.
- Procesamiento de imágenes de páginas completas con hasta 2048 visual tokens por página.
- Generación de texto en modo greedy determinista (`do_sample=False`), con `repetition_penalty` configurable.
- Soporte de chat multimodal mediante la plantilla de chat de Qwen3.5, con entrada de imagen y texto.
- Checkpoint autónomo, sin necesidad de adaptadores ni PEFT en tiempo de inferencia.

## Casos de uso

- Transcripción de manuscritos para investigación paleográfica: un investigador carga la imagen de una página de un códice y obtiene la transcripción línea por línea en formato CATMuS, lista para comparar con ediciones críticas o estudios de variantes.
- Digitalización de archivos históricos: instituciones con colecciones de manuscritos latinos pueden procesar lotes de imágenes para generar transcripciones automáticas que alimenten bases de datos de texto completo y catálogos en línea.
- Creación de corpus graphemicos en humanidades digitales: las transcripciones permiten construir conjuntos de datos para análisis estilométricos, lingüísticos o de variantes de escritura sin normalización editorial, lo que resulta útil para estudiar la evolución de la escritura medieval.
- Generación de datos de entrenamiento para modelos de lenguaje en latín medieval: las salidas del modelo pueden usarse como corpus de texto para entrenar modelos de procesamiento del lenguaje natural que trabajen con latín no clásico.
- Accesibilidad de documentos históricos: las transcripciones automáticas permiten ofrecer texto buscable en repositorios digitales donde antes solo había imágenes, facilitando la consulta y el análisis a investigadores no especialistas.
- Control de calidad en proyectos de transcripción colaborativa: el modelo puede pre-transcribir páginas para que voluntarios o paleógrafos corrijan, reduciendo significativamente el tiempo de trabajo y estandarizando el formato de salida.
- Integración en pipelines de archivística digital: al ser un checkpoint estándar de transformers, se puede desplegar como servicio para aplicaciones web o APIs mediante Hugging Face Inference Endpoints u otras plataformas compatibles.

## Benchmarks y rendimiento

La evaluación se realizó con decodificado greedy, 3072 tokens nuevos como máximo, 2048 visual tokens por página y tamaño de lote 4, sobre 243 páginas reservadas, cada una de una mano distinta y no vistas durante el entrenamiento. La columna "Base" corresponde al checkpoint anterior `comma-qwen-3.5-0.8b-full` (9.906 páginas), evaluado en las mismas páginas y dentro del mismo trabajo.

| Metrica | Base (9.906 páginas) | Este modelo (33k) |
|---|---|---|
| CER (NFD) | 0.1458 | 0.1240 |
| CER (raw code points) | 0.1859 | 0.1651 |
| WER (NFD) | 0.4029 | 0.3584 |
| Line recall (NFD) | 0.1672 | 0.1883 |
| CER macro (NFD) | 0.1318 | 0.1385 |
| Páginas degeneradas | 0.0041 | 0.0000 |
| Páginas truncadas | 0.0165 | 0.0123 |

CER y WER están micro-promediados (ediciones totales divididas por el total de caracteres de referencia), de modo que una página larga pesa más que una corta. `line_recall` es la proporción de líneas de referencia reproducidas exactamente y en orden, una métrica clave para el objetivo línea por línea de CATMuS. El autor advierte que diferencias de CER menores a aproximadamente 0.02 deben tratarse como empates, debido a la no determinación del entrenamiento en bf16 entre nodos y a la amplificación de diferencias mínimas en los logits por el decodificado greedy.

## Requisitos de hardware

- VRAM estimada para inferencia: no se publican cifras oficiales. El checkpoint en bf16 ocupa aproximadamente 1,7 GB según el tamaño del repositorio. Con la activación de 2048 visual tokens y secuencias de hasta 8192 tokens, se estima un mínimo de 8 GB de VRAM para inferencia en bf16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede servir el modelo en bf16, como una RTX 4060 Ti, RTX 4070 o A10. Para cargas de trabajo con lotes grandes, se recomienda una A100 40GB o H100 80GB, aunque no se ha validado oficialmente.
- Compatibilidad con GPU de consumo: sí, el modelo es pequeño (852M parámetros) y cabe en GPUs de consumo de 8 GB o más.
- Opciones de despliegue: carga directa con `transformers` mediante `AutoModelForImageTextToText`; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte específico para vLLM o TGI, aunque al ser un checkpoint estándar podría funcionar en esas plataformas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la información disponible comparativas con otros modelos de la misma categoría (HTR/OCR de manuscritos medievales). La siguiente tabla compara este modelo con su checkpoint predecesor y con el modelo base sin fine-tune.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| comma-qwen-3.5-0.8b-full-33k (este) | 852.985.920 | No disponible (sec. entrenamiento: 8192) | HTR/OCR CATMuS latín medieval | Apache 2.0 |
| comma-qwen-3.5-0.8b-full (anterior) | 852.985.920 | No disponible | HTR/OCR CATMuS latín medieval | Apache 2.0 |
| Qwen/Qwen3.5-0.8B (base) | 852.985.920 | No disponible | Visión-lenguaje general | No disponible |

El modelo anterior es el punto de partida de este fine-tune continuado, por lo que la comparación directa de métricas se limita al trabajo de evaluación publicado. El modelo base no está especializado en transcripción de manuscritos y su licencia no se indica en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en transcripción de manuscritos medievales en latín bajo el estándar CATMuS. No es un modelo de lenguaje general ni un traductor; usarlo para otros fines puede producir resultados no deseados.
- El prompt de reglas CATMuS de aproximadamente 11,6k caracteres es parte esencial de la entrada. Si se sirve un prompt diferente, el modelo realizará una tarea diferente y el rendimiento no será comparable.
- `enable_thinking=False` es obligatorio para Qwen3.5 0.8B. Si se deja abierto el bloque de pensamiento, el modelo producirá prosa en lugar de transcripción y agotará el presupuesto de tokens.
- La configuración de visual tokens debe cargarse desde este repositorio (2048 tokens por página). Usar la configuración por defecto de la librería (16.777.216 píxeles, 16k visual tokens) presenta al modelo una resolución que nunca vio durante el entrenamiento, lo que degrada el rendimiento.
- Diferencias de CER menores a aproximadamente 0.02 deben tratarse como empates. El entrenamiento en bf16 es no determinista entre nodos y el decodificado greedy amplifica pequeñas diferencias en los logits.
- El modelo puede producir páginas truncadas (0.0123 en la evaluación) o degeneradas (0.0000 en la evaluación, pero no es una garantía). La calidad depende de la mano, la calidad de la imagen y la resolución.
- No se ha evaluado formalmente el sesgo del modelo. Al estar entrenado en un corpus específico de manuscritos medievales, puede tener limitaciones en la variedad de escrituras, abreviaturas y grafías no representadas en el dataset.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de licencia y no utilizar marcas registradas del proyecto sin permiso.
- El modelo está pensado para latín (la). No se ha evaluado su rendimiento en otros idiomas.

## Enlaces

- Modelo: https://huggingface.co/wjbmattingly/comma-qwen-3.5-0.8b-full-33k
- Modelo anterior (base del fine-tune continuado): https://huggingface.co/wjbmattingly/comma-qwen-3.5-0.8b-full
- Demo interactivo: https://huggingface.co/spaces/wjbmattingly/comma-qwen-3.5-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/comma-project/deep-jsonl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
