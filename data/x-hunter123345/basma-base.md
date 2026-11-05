# x-hunter123345/basma-base

## Resumen

Basma (base) es un detector de imagenes generadas por IA publicado en Hugging Face por el usuario x-hunter123345. Se distribuye como un build para navegador del proyecto original Basma, alojado en el repositorio de GitHub us3ph/Basma, y se empaqueta en formato ONNX junto con un fichero `fusion.json` que define la logica de fusion de las senales del detector. El modelo se etiqueta con las categorias `ai-image-detection`, `dinov2` y `onnx`, lo que indica que se apoya en un backbone DINOv2 para extraer representaciones visuales y clasificar despues si una imagen es real (etiqueta 0) o generada por IA (etiqueta 1).

El repositorio es de tamano reducido (0,1 GB) y contiene dos variantes de pesos: `onnx/model_w8.onnx`, una version con cuantizacion weight-only de 8 bits, y `onnx/model.onnx`, la version en fp32. Esta doble distribucion esta pensada para cubrir tanto despliegues ligeros en el navegador o en CPU como ejecuciones con mayor fidelidad numerica en GPU o servidores. La licencia es MIT, lo que permite uso comercial y modificacion sin restricciones mas alla de la atribucion.

La relevancia del modelo reside en su enfoque de despliegue: al exportarse a ONNX y ofrecer una variante de 8 bits, puede ejecutarse en entornos sin GPU dedicada, incluidos navegadores mediante ONNX Runtime Web, lo que facilita integrar deteccion de imagenes sinteticas en flujos de moderacion, verificacion de contenido o analisis forense ligero. No obstante, la informacion publica disponible es muy limitada: no se han publicado idiomas soportados, resultados de benchmarks ni detalles sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 (backbone de vision) con cabecera de clasificacion; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | weight-only 8-bit (`model_w8.onnx`) y fp32 (`model.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (dos variantes: w8 y fp32) + `fusion.json` |

## Arquitectura y entrenamiento

La informacion disponible indica que Basma se basa en DINOv2, un modelo de vision auto-supervisado que produce representaciones densas de imagenes y que se usa habitualmente como extractor de caracteristicas para tareas de clasificacion y deteccion. Sobre ese backbone, el proyecto anade una cabeza de clasificacion binaria con dos etiquetas: 0 para imagen real y 1 para imagen generada por IA. El artefacto distribuido incluye un fichero `fusion.json`, lo que sugiere que la decision final combina varias senales o salidas del modelo mediante una logica de fusion configurable.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de ajuste fino supervisado, RLHF/DPO (no aplicables en un clasificador de vision) ni sobre innovaciones tecnicas adicionales. La exportacion a ONNX con una variante weight-only de 8 bits es el aspecto tecnico mas destacable documentado: reduce el peso del modelo y permite inferencia en CPU o en el navegador, a costa de una posible perdida de precision que el autor no cuantifica en la model card.

## Capacidades

- Clasificacion binaria de imagenes: distingue entre imagen real (etiqueta 0) e imagen generada por IA (etiqueta 1).
- Extraccion de caracteristicas visuales mediante el backbone DINOv2.
- Inferencia en navegador y en CPU gracias a la exportacion ONNX y a la variante de 8 bits.
- Fusion de senales configurable mediante `fusion.json`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues (es un modelo de vision, no de texto).
- No se documentan modos especiales como thinking mode, vision adicional, audio o generacion de texto.

## Casos de uso

- Moderacion de contenido en plataformas: el modelo puede clasificar imagenes subidas por usuarios como reales o generadas por IA antes de publicarlas, usando la variante ONNX en el backend para filtrar contenido sintetico no declarado.
- Verificacion de autenticidad en medios: redacciones y agencias pueden pasar imagenes recibidas por el detector para marcar posibles deepfakes o ilustraciones generadas, apoyandose en la etiqueta binaria y en la fusion de senales.
- Deteccion en el navegador sin servidor: al estar exportado a ONNX con una variante de 8 bits, puede integrarse en una extension o aplicacion web que analice imagenes localmente, sin enviar datos a un servidor y preservando la privacidad.
- Analisis forense ligero en equipos sin GPU: investigadores pueden ejecutar `model_w8.onnx` en CPU para preclasificar grandes lotes de imagenes y priorizar las que requieran inspeccion manual.
- Filtrado en pipelines de datos de entrenamiento: equipos que construyen datasets de vision pueden usar el detector para eliminar imagenes sinteticas no deseadas antes de entrenar otros modelos.
- Integracion en herramientas de verificacion periodistica: un plugin que consulte el modelo ONNX puede advertir al usuario cuando una imagen de una noticia presenta alta probabilidad de ser generada por IA.
- Control de calidad en generacion de contenido: estudios que generan imagenes con modelos de difusion pueden usar Basma como discriminador de referencia para medir la fidelidad de sus salidas frente a imagenes reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un fichero `RESULTS.md` en el repositorio original de GitHub, pero no se incluyen sus cifras en los datos proporcionados, por lo que no es posible presentar una tabla comparativa sin inventar numeros.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 0,1 GB, por lo que la variante de 8 bits es apta para entornos con muy poca memoria.
- GPU recomendadas: no se especifican; al ser un modelo de vision de tamano reducido, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) deberia poder ejecutarlo, aunque no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente si, dada la variante weight-only de 8 bits y el tamano del repositorio; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), y cualquier runtime compatible con ONNX; no se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Basma (base) | no disponible | no aplica (vision) | no disponible | MIT | ONNX en Hugging Face |
| Alternativas de deteccion de imagenes IA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas concretas de la misma categoria, ya que la informacion proporcionada no incluye resultados de benchmarks ni especificaciones detalladas del modelo.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion, por lo que se desconoce su tasa de acierto, falsos positivos y falsos negativos.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos por tipo de imagen, origen, demografia o estilo visual.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas: imagenes reales retocadas o con fuerte procesado pueden clasificarse como IA, y generadores nuevos pueden escapar al detector.
- La variante weight-only de 8 bits puede degradar la precision respecto a fp32; no se cuantifica esa perdida.
- No se especifican idiomas ni regiones soportadas; al ser un modelo de vision, el impacto linguistico es indirecto, pero no hay informacion sobre sesgos culturales.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026, por lo que no cuenta con validacion de la comunidad.
- Para produccion, conviene validar el modelo con un conjunto propio de imagenes reales y sinteticas antes de confiar en sus etiquetas.

## Enlaces

- Hugging Face: https://huggingface.co/x-hunter123345/basma-base
- Repositorio original en GitHub: https://github.com/us3ph/Basma
