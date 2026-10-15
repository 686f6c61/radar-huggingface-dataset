# xorslider/FoodExtract-gemma-3-4b-finetuned

## Resumen

FoodExtract-gemma-3-4b-finetuned es un ajuste fino supervisado del modelo google/gemma-3-4b-it, publicado por el usuario xorslider en Hugging Face. Su proposito es acotado y monotematico: recibir texto libre y devolver una extraccion estructurada de alimentos y bebidas, con una etiqueta binaria (`food_or_drink: 0/1`), una lista de tags taxonomicos (`np`, `il`, `me`, `re`, `fi`, `di`, `fa`, `fp`) y dos campos separados para solidos y liquidos.

No se trata de un modelo de proposito general ni de una nueva arquitectura: es una especializacion por fine-tuning sobre un modelo base ya instruido, con 1.136 muestras de entrenamiento y 3 epocas de SFT completo mediante TRL. Esto lo situa en la categoria de los modelos de extraccion de informacion ligeros, pensados para integrarse como componente de un pipeline mayor (preprocesado, indexado, enriquecimiento de catalogo) mas que para conversar con un usuario final.

Su relevancia actual es la de los extractores deterministas y baratos: un modelo de ~4B que quepa en una GPU de consumo y devuelva una salida de formato fijo es mucho mas facil de validar y de operar que un LLM grande al que hay que forzar el formato con prompts largos. La contrapartida es que no hay benchmarks publicados, no se documentan idiomas soportados y el repositorio ocupa solo 0,5 GB, un tamano anormalmente bajo para un modelo de 4B en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada; heredada de google/gemma-3-4b-it, transformer decoder-only) |
| Parametros totales | no disponible (el identificador y el modelo base apuntan a ~4 000 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base google/gemma-3-4b-it declara 128 000 tokens |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin versiones GGUF ni cuantizaciones declaradas |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,5 GB |
| Modelo base | google/gemma-3-4b-it |
| Metodo de ajuste | SFT completo con TRL |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint google/gemma-3-4b-it, un transformer decoder-only de la familia Gemma 3 en su variante de 4B parametros. El autor no documenta ninguna modificacion estructural, ni decodificacion especulativa, ni atencion lineal: el entrenamiento es un fine-tuning supervisado completo (no LoRA, no adaptadores) sobre los pesos del modelo base.

Los datos de entrenamiento provienen del dataset mrdbourke/FoodExtract-1k, con 1.136 muestras. La configuracion declarada es de 3 epocas, batch size 4 y learning rate 2e-4, ejecutada con la libreria TRL de Hugging Face. No se documentan tokens totales, composicion del dataset (mas alla del numero de muestras), tecnicas de RLHF o DPO, ni proceso de evaluacion o split de validacion. La tarea objetivo esta definida de forma explicita en la model card: salida con los campos `food_or_drink`, `tags`, `foods` y `drinks`, con una taxonomia cerrada de ocho tags que distingue entre panel nutricional, lista de ingredientes, menu, receta, items de comida, items de bebida, publicidad alimentaria y empaquetado.

## Capacidades

- Extraccion estructurada de alimentos y bebidas a partir de texto libre, con salida de formato fijo (`food_or_drink`, `tags`, `foods`, `drinks`).
- Clasificacion binaria de presencia o ausencia de contenido alimentario, devolviendo campos vacios y `food_or_drink: 0` cuando no hay menciones.
- Etiquetado taxonomico segun el tipo de fuente textual: panel nutricional (`np`), lista de ingredientes (`il`), menu (`me`), receta (`re`), items de comida (`fi`), items de bebida (`di`), publicidad (`fa`) y empaquetado (`fp`).
- Separacion entre solidos y liquidos en dos campos distintos dentro de la misma salida.
- Uso mediante `pipeline` de transformers con `apply_chat_template`, lo que implica soporte del formato de chat instruct del modelo base.
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio especificos de este ajuste.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base es multilingue, pero el ajuste no declara idiomas).

## Casos de uso

- Etiquetado masivo de corpus alimentarios: procesar lotes de recetas, articulos o resenas y obtener por cada documento la lista de alimentos y bebidas junto con la taxonomia de fuente, para construir indices de busqueda tematicos.
- Construccion de bases de datos nutricionales: extraer ingredientes de listas de ingredientes (`il`) y de paneles nutricionales (`np`) como paso previo a la normalizacion y al cruce con tablas de composicion de alimentos.
- Enriquecimiento de catalogos de comercio electronico: clasificar descripciones de producto, empaquetados (`fp`) y anuncios alimentarios (`fa`) para asignar categorias y atributos de forma automatica.
- Analitica de marcas en redes sociales: detectar menciones de alimentos y bebidas en texto generado por usuarios y agregarlas por producto o categoria para medir presencia de marca.
- Preprocesado para aplicaciones de dietetica y seguimiento de ingestas: convertir notas de diario escritas en lenguaje natural en listas estructuradas de comida y bebida que alimenten un registro posterior.
- Filtrado y moderacion de contenido en plataformas de recetas: usar `food_or_drink: 0` como discriminador rapido para descartar documentos irrelevantes antes de etapas de procesamiento mas caras.
- Pipelines de OCR mas extraccion: aplicar el modelo sobre texto ya extraido de menus, etiquetas o recetas escaneadas para obtener la estructura, dado que la tarea es puramente textual y no requiere vision.
- Generacion de ingredientes para motores de recomendacion: obtener la lista de componentes de una receta para calcular similitud entre recetas o sugerir sustituciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni comparaciones con otros extractores, y tampoco detalla el split de evaluacion empleado sobre las 1.136 muestras del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamano de 4B, no confirmadas por el autor): en bf16/fp16 en torno a 9-11 GB contando pesos y cache KV para contextos moderados; en cuantizacion de 8 bits en torno a 6 GB; en 4 bits en torno a 4 GB.
- GPU recomendadas: para bf16 sin cuantizar, A100, H100, L40S o RTX 4090; para cuantizacion de 8 o 4 bits, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas si se cuantiza, y en tarjetas de 12-16 GB incluso en precision completa.
- Opciones de despliegue: transformers (metodo documentado por el autor), y de forma generica vLLM o TGI para servir el checkpoint en safetensors. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publica ninguna version GGUF.
- Latencia y throughput estimados: no disponibles. Al ser una tarea de salida corta (con `max_new_tokens=128` en el ejemplo oficial), la latencia estara dominada por el prefill del texto de entrada mas que por la decodificacion.
- Advertencia de despliegue: el repositorio ocupa 0,5 GB, muy por debajo de los ~8 GB esperables para un modelo de 4B en bf16. Conviene verificar la integridad y el contenido real de los ficheros antes de planificar recursos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Notas |
|---|---|---|---|---|---|
| FoodExtract-gemma-3-4b-finetuned | ~4B (no declarado) | no disponible | Extraccion de alimentos y bebidas | Gemma Terms of Use | 1.136 muestras de SFT, sin benchmarks publicados |
| google/gemma-3-4b-it | ~4B | 128 000 tokens (segun el fabricante) | Modelo instruct generalista | Gemma Terms of Use | Modelo base; la extraccion estructurada requeriria prompting y no garantiza formato fijo |
| Otros extractores de informacion alimentaria de ~3-4B | no disponible | no disponible | Extraccion de entidades | no disponible | No se dispone de comparativas publicadas en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de este ajuste frente a alternativas de la misma categoria. La comparacion con modelos generalistas del mismo orden de parametros (por ejemplo, Qwen2.5-3B-Instruct o Llama-3.2-3B-Instruct) es conceptual: ninguno esta especializado en esta taxonomia concreta, pero tampoco existen datos publicos que cuantifiquen la diferencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada de precision, recall o F1, ni validacion sobre un conjunto separado. Cualquier uso en produccion exige una evaluacion propia previa.
- Volumen de entrenamiento muy reducido: 1.136 muestras y 3 epocas es un regimen propenso a sobreajuste y a un vocabulario de alimentos limitado al dominio del dataset, con probable sesgo cultural hacia la cocina anglosajona (el ejemplo de la model card menciona eggs, bacon, toast y orange juice).
- Riesgo de alucinacion en la lista de alimentos: al generar texto libre para los campos `foods` y `drinks`, el modelo puede introducir items no presentes en la entrada o normalizar incorrectamente (plurales, marcas, sinonimos).
- Formato de salida no garantizado: aunque el fine-tuning persigue una estructura fija, la decodificacion autoregresiva no asegura que la salida sea siempre parseable. Es imprescindible validar y parsear con tolerancia a errores.
- Diferencias de granularidad no gestionadas de forma explicita: no se documenta como trata el modelo platos compuestos, ingredientes duplicados o cantidades.
- Idiomas soportados no declarados: aunque el modelo base es multilingue, se desconoce si el ajuste conserva competencia en castellano u otros idiomas, dado que el dataset de entrenamiento no se describe linguisticamente.
- Contexto no declarado para este checkpoint: la unica referencia es la ventana de 128 000 tokens del modelo base, sin confirmacion de que el ajuste la preserve.
- Licencia Gemma: el uso comercial esta permitido bajo las Gemma Terms of Use, que imponen obligaciones de redistribucion de los terminos y prohibiciones de uso concretas. Hay que revisarlas antes de integrar el modelo en un producto.
- Integridad del repositorio: el tamano de 0,5 GB es inconsistente con un modelo de 4B en bf16, lo que sugiere pesos parciales, cuantizados o un empaquetado incompleto. Verificar antes de cualquier despliegue.
- Sin soporte GGUF ni cuantizaciones publicadas: cualquier despliegue con llama.cpp u Ollama requiere conversion propia y validacion posterior del comportamiento.
- Metadatos poco fiables: el registro indica fechas de creacion y actualizacion en 2026, y el modelo acumula 0 descargas y 0 likes, sin comunidad que haya reportado problemas o validaciones independientes.
- Sin endpoints ni demo publicados, y sin pipeline declarado en la ficha de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xorslider/FoodExtract-gemma-3-4b-finetuned
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de entrenamiento: mrdbourke/FoodExtract-1k (referenciado en la model card; no se ha proporcionado enlace directo)
- Libreria de entrenamiento: TRL (https://github.com/huggingface/trl)
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo, su dataset o su evaluacion; los resultados devueltos corresponden a dominios sin relacion con el modelo.
