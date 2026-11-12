# yueoss/kanso-laya

## Resumen

kanso-laya es un modelo de clasificación de texto derivado de convaiinnovations/laya (mmBERT-base multilingüe), afinado por el usuario yueoss para distinguir 16 tipos de publicaciones de LinkedIn. El modelo resuelve un problema muy concreto: permitir que una extensión de Chrome (Kanso Feed) oculte las categorías de posts que el usuario no quiere ver, ejecutándose íntegramente en el navegador mediante onnxruntime-web, sin servidor ni cuenta y sin que ningún dato salga del ordenador del lector.

La arquitectura subyacente es un transformer encoder de 22 capas con dimensión oculta de 768 y vocabulario de 256k tokens (mmBERT-base). Sobre él se aplica una cabeza de clasificación en formato de pregunta de opción múltiple con 17 opciones posibles (16 tipos de post más "other"). El modelo se distribuye como ONNX dividido: un encoder cuantizado a 4 bits (MatMulNBits, bloques de 32) y una cabeza en fp32 que incorpora la calibración de temperaturas.

La relevancia actual del modelo es doble: por un lado, demuestra un caso de despliegue edge real de un clasificador transformer en el navegador con un tamaño de repositorio de 0,4 GB; por otro, documenta con rigor sus límites (datos de entrenamiento ficticios, confusiones conocidas, calibración de confianza) y publica resultados tanto en un banco ficticio como en 279 posts reales de LinkedIn, lo que lo convierte en un ejemplo útil de evaluación honesta para modelos de clasificación de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base, 22 capas, d=768, vocabulario 256k) con cabeza de clasificación de opción múltiple |
| Parametros totales | no disponible (modelo base mmBERT-base; el repo pesa 0,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | entrenado con max-len 768 para el encoder y 576 para la cabeza; presupuesto por defecto de la extensión: 448/256 tokens |
| Tipos de cuantizacion | encoder en 4 bits (MatMulNBits, bloques de 32, embeddings int8 por fila); cabeza en fp32; se menciona int8 por tensor como claramente peor |
| Idiomas soportados | fr, en (entrenado); evaluación adicional en de, es, it, pl, pt sin entrenamiento específico |
| Licencia | Apache 2.0 (heredada de convaiinnovations/laya) |
| Formato de pesos | ONNX dividido: `encoder.onnx` (4-bit) + `head.onnx` (fp32), más `tokenizer.json` y `rl_agent_config.json` |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya en su subcarpeta `multilingual`, que corresponde a mmBERT-base: un encoder transformer de 22 capas, dimensión 768 y vocabulario de 256k tokens. Sobre esa base se añade una cabeza de clasificación que formula la tarea como una pregunta de opción múltiple ("What is the author doing in this LinkedIn post?") con 17 opciones: hiring, open to work, career move, achievement, anecdote, company news, self-promotion, event, advice, news and analysis, opinion, humor, life lesson, gratitude, question, politics y other. Cada post recibe exactamente una etiqueta y las probabilidades suman el 100 %.

El entrenamiento se realizó con 684 posts ficticios de LinkedIn escritos específicamente para el proyecto (475 en francés, 209 en inglés), cada uno con una etiqueta, multiplicados por 3 formulaciones distintas de la pregunta. Se usó pérdida soft cross-entropy (`--loss soft-ce`) con `--shuffle-options`, 4 épocas, `--max-len 768 --head-max-len 576` y la tabla de embeddings de tokens congelada. Las temperaturas de calibración se ajustaron sobre una partición reservada antes del entrenamiento. La innovación técnica destacable no está en la arquitectura sino en el pipeline de despliegue: exportación a ONNX dividido con encoder cuantizado a 4 bits y cabeza en fp32 que transporta la calibración, pensado para ejecutarse en un navegador con onnxruntime-web.

## Capacidades

- Clasificación de texto en 16 categorías de publicaciones de LinkedIn más una clase "other", con salida de probabilidades calibradas que suman 100 %.
- Formulación como pregunta de opción múltiple, lo que permite modificar las opciones ofrecidas sin reentrenar (con matices, ver limitaciones).
- Capacidad multilingüe heredada de mmBERT: entrenado en francés e inglés, con resultados de 78,3 % en alemán, español, italiano, polaco y portugués sin entrenamiento específico.
- Calibración de confianza incorporada en la cabeza fp32, pensada para que la extensión solo oculte un post cuando supera un umbral del 60 %.
- Ejecución en navegador mediante onnxruntime-web (laya-ts) y en Python mediante la librería `laya`.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido: es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado de feed en el navegador: la extensión Kanso Feed carga `encoder.onnx` y `head.onnx` una sola vez al instalarse y clasifica cada post localmente; si la categoría está entre las ocultas y la confianza supera el 60 %, el post se oculta. Es el caso de uso principal y para el que fue diseñado.
- Moderación o curación de contenido en redes profesionales: un equipo puede usar el clasificador para etiquetar lotes de publicaciones y decidir qué categorías priorizar en un boletín o panel interno, ejecutándolo en local para no enviar contenido de terceros a un servidor.
- Análisis de audiencia y benchmarking de contenido: clasificar los posts de una cuenta o de un sector para medir la proporción de "self-promotion", "hiring" o "advice" frente a otras categorías, con la ventaja de que el modelo corre en CPU y no requiere GPU.
- Investigación sobre dinámicas de LinkedIn: al ser un clasificador pequeño y Apache 2.0, sirve para estudios académicos que necesiten etiquetar corpus de posts (respetando los términos de LinkedIn, que impiden redistribuir el contenido del feed).
- Prototipado de clasificadores de nicho en el navegador: el patrón ONNX dividido (encoder 4-bit + cabeza fp32) es reutilizable para otras tareas de clasificación que deban ejecutarse en el cliente sin backend.
- Filtrado multilingüe en entornos francófonos y anglófonos: para equipos que gestionan feeds en francés e inglés, con cobertura razonable en alemán, español, italiano, polaco y portugués (78,3 % en la evaluación sin entrenamiento).
- Integración en herramientas de productividad personal: un script en Python con la librería `laya` puede procesar exportaciones de posts y generar un resumen por categoría para revisión manual.

## Benchmarks y rendimiento

Resultados publicados en la model card. La métrica es el porcentaje de posts asignados a la categoría correcta, medido con el código de la extensión (laya-ts + onnxruntime).

| Evaluación | Base Laya (multilingual) | kanso-laya |
|---|---|---|
| 164 posts ficticios no vistos, 448/256 tokens (por defecto) | 36 % | 78 % |
| 164 posts ficticios no vistos, 768/576 tokens | — | 63 % |
| 164 posts ficticios no vistos, 768/576 tokens con dos lecturas promediadas | — | 66 % |
| 279 posts reales de LinkedIn etiquetados a mano | — | 81,7 % |
| 60 posts en 5 idiomas no entrenados (de, es, it, pl, pt) | — | 78,3 % |
| 4-bit vs fp32 (mismos posts) | fp32: 79,9 % | 4-bit: 79,3 % (Δp medio 0,012) |

Desglose de los 279 posts reales según el umbral de confianza del 60 %:

| Categoría | Porcentaje |
|---|---|
| Correcto y por encima del umbral | 67,7 % |
| Correcto pero incierto (se deja visible) | 14,0 % |
| Incorrecto pero incierto (se deja visible, inocuo) | 14,3 % |
| Incorrecto y con confianza (el único caso dañino) | 3,9 % |

Rendimiento en velocidad (Apple Silicon, solo CPU, onnxruntime-node, 4 hilos, un post a la vez): 188 ms/post en el banco ficticio y 562 ms/post en posts reales, cuya longitud mediana es de 1.000 caracteres. El coste depende de la longitud del texto enviado, no del número de posts; el batching resulta más lento porque cada elemento se rellena hasta la longitud del más largo.

## Requisitos de hardware

- VRAM: no aplica en el caso principal, ya que el modelo está diseñado para ejecutarse en CPU dentro del navegador. El repositorio ocupa 0,4 GB y el encoder está cuantizado a 4 bits, por lo que la huella en memoria es reducida.
- GPU recomendadas: no se especifican; el modelo no está pensado para GPU. Cualquier GPU moderna podría ejecutarlo vía ONNX Runtime, pero no hay datos publicados de rendimiento en GPU.
- Cabe en cualquier ordenador de consumo: la evaluación de velocidad se hizo en Apple Silicon solo con CPU. No se han publicado requisitos mínimos oficiales más allá de poder ejecutar onnxruntime-web en el navegador.
- Opciones de despliegue: onnxruntime-web en el navegador mediante laya-ts; onnxruntime-node en Node.js; librería Python `laya` (`laya.load("yueoss/kanso-laya")`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 188 ms/post en el banco ficticio y 562 ms/post en posts reales (mediana de 1.000 caracteres), con 4 hilos en CPU. El batching empeora la latencia por el padding.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros clasificadores de posts de LinkedIn en la información proporcionada. La comparación más directa disponible es con el modelo base del que deriva:

| Modelo | Tarea | Idiomas | Contexto de entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| kanso-laya | Clasificación de 16 tipos de post de LinkedIn | fr, en (evaluado en 6) | 448/256 tokens por defecto | Apache 2.0 | ONNX 4-bit + fp32 |
| convaiinnovations/laya (multilingual) | Modelo base mmBERT; en esta tarea acierta el 36 % | multilingüe | 448/256 tokens | Apache 2.0 | safetensors / ONNX |
| Clasificadores genéricos de texto (no disponibles en la información) | Clasificación general | variable | no disponible | no disponible | no disponible |

La comparación con el base es la más informativa: el afinamiento multiplica por más de dos la precisión en la tarea (36 % a 78 %) manteniendo la licencia Apache 2.0 y añadiendo el pipeline de cuantización para navegador.

## Limitaciones y advertencias

- Los datos de entrenamiento son ficticios: 684 posts escritos para el proyecto, más limpios que un feed real. El 81,7 % en posts reales se midió en el feed de un único lector, en francés y en un momento concreto, por lo que la generalización a otros feeds e idiomas no está garantizada.
- Confusiones conocidas: "life lesson" tiende a clasificarse como "achievement" y la búsqueda de empleo como "career move"; ahí se concentran los errores con alta confianza.
- La clase "opinion" se sobrepredice: cinco de los once errores confiados en posts reales caen en esa categoría.
- Existe una clase de "engagement request" ("like if you agree") en los pesos pero no entre las opciones por defecto. Eliminarla de los datos costaba 5 puntos, por lo que se mantuvo en el entrenamiento; añadirla como opción recupera aproximadamente dos tercios de esos posts y no cuesta precisión (79,3 % frente a 78 %).
- El enunciado de la pregunta forma parte del modelo: cambiar las descripciones de las opciones o los presupuestos de tokens altera el comportamiento. Hay que copiar las opciones de `src/shared/categories.json` del proyecto Kanso.
- La cuantización int8 por tensor es claramente peor que la de 4 bits con bloques; debe usarse la versión de 4 bits incluida.
- El corpus de posts reales no se publica ni se publicará por los términos de LinkedIn; solo se distribuyen los conjuntos ficticios de entrenamiento y evaluación.
- Licencia Apache 2.0 para el modelo, heredada del base. La extensión Kanso Feed usa una licencia Fair Source (FSL-1.1-Apache-2.0), más restrictiva y distinta de la del modelo.
- No es un modelo generativo: no sirve para resúmenes, preguntas y respuestas ni generación de texto; cualquier uso fuera de la clasificación de posts de LinkedIn requeriría reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yueoss/kanso-laya
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de Laya: https://github.com/NandhaKishorM/laya
- Extensión Kanso Feed: https://github.com/adamctr/kanso
