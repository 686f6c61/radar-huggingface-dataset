# wkrfugs/calligen-centerline-extractor-v2

## Resumen

CalliGen Centerline Extractor V2 es un modelo neuronal de vision por computador desarrollado por el usuario wkrfugs, orientado a la extraccion de lineas centrales (centerlines) a partir de imagenes de glifos de caligrafia china de 256 × 256 pixeles. El modelo resuelve un problema especifico dentro del procesado de caligrafia: recuperar la trayectoria del trazo a partir de una imagen rasterizada de tinta, lo que resulta util para vectorizacion, analisis de estilo y generacion caligrafica.

Tecnicamente se trata de una U-Net de 1,93 millones de parametros que predice mapas de calor gaussianos y aplica un umbral de binarizacion de 0,65 para obtener la mascara final de centerline. Es el checkpoint final de la epoca 10, entrenado con perdida MAE ponderada sobre trayectorias de boligrafo renderizadas a partir de CASIA-OLHWDB 1.1.

El modelo es relevante para pipelines de investigacion en caligrafia china y para tareas de vectorizacion de glifos, aunque su alcance es muy acotado: no es un modelo de lenguaje ni un modelo generativo multimodal, sino un extractor de estructura de trazo de dominio especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (red convolucional encoder-decoder) |
| Parametros totales | 1,93 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imagenes de glifos de caligrafia china) |
| Licencia | no disponible |
| Formato de pesos | best.pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo es una U-Net convolucional de 1,93M de parametros que opera sobre entradas de 256 × 256 pixeles y produce mapas de calor gaussianos que representan la probabilidad de pertenencia a la linea central del trazo. La salida se binariza con un umbral fijado en 0,65 para generar la mascara final de centerline.

El entrenamiento se realizo con perdida MAE ponderada sobre un conjunto de datos sintetico: las entradas se renderizaron a partir de trayectorias de boligrafo de CASIA-OLHWDB 1.1 (base de datos de escritura manuscrita online en chino). El checkpoint publicado corresponde a la epoca 10 (final). No se especifica el numero total de tokens ni la composicion detallada del dataset mas alla de su origen sintetico a partir de trayectorias. No se indica si hubo RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de vision de este tipo.

## Capacidades

- Extraccion de lineas centrales a partir de imagenes de glifos de caligrafia china de 256 × 256 pixeles con tinta oscura sobre fondo claro.
- Prediccion de mapas de calor gaussianos y binarizacion con umbral 0,65.
- Generacion de imagenes PNG de salida de 256 × 256 con pixeles de centerline en negro sobre fondo blanco.
- Procesamiento de caracteres individuales (single-character glyphs), no de lineas o parrafos completos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues generales: su dominio es la caligrafia china.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales.

## Casos de uso

- Vectorizacion de glifos caligraficos: el modelo extrae la centerline de una imagen rasterizada de un caracter, que puede servir como base para reconstruir trazos vectoriales o trayectorias de boligrafo en herramientas de tipografia y diseno.
- Analisis de estilo caligrafico: al obtener la estructura del trazo, se pueden medir propiedades geometricas (curvatura, grosor implicito, ramificaciones) para comparar estilos entre autores o epocas.
- Preprocesado para generacion caligrafica: la centerline extraida puede alimentar modelos generativos de trazos o sistemas de sintesis de escritura, actuando como etapa intermedia en un pipeline CalliGen.
- Digitalizacion de manuscritos historicos: para imagenes de tinta con trazos claros, el modelo puede recuperar la estructura del trazo como paso previo a la transcripcion o al archivado digital.
- Investigacion en reconocimiento de escritura manuscrita: la centerline sirve como representacion intermedia compacta que puede alimentar clasificadores o modelos de reconocimiento de caracteres.
- Creacion de datasets sinteticos: al procesar glifos renderizados, el modelo permite generar pares imagen-centerline para entrenar otros modelos de vision o de generacion de trazos.
- Herramientas de ensenanza de caligrafia: la centerline extraida puede mostrarse como guia de trazo para estudiantes, comparando la trayectoria ideal con la ejecucion del alumno.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1 macro a 1 pixel | 0,9557 |
| F1 macro a 2 pixeles | 0,9809 |
| Split de test | 7.236 imagenes sinteticas retenidas |

Los resultados corresponden al split de test sintetico retenido indicado por el autor. No se han publicado comparaciones con otros modelos de extraccion de centerline en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB, dado que el modelo tiene 1,93M de parametros y opera sobre entradas de 256 × 256.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien puede ejecutarse en CPU con latencia aceptable.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) y en GPUs de portatil.
- Opciones de despliegue: inferencia directa con PyTorch (script `inference.py` incluido en el repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de extraccion de centerline ni con alternativas de la misma categoria.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos renderizados a partir de CASIA-OLHWDB 1.1; puede generalizar mal a imagenes reales de tinta historica.
- Los trazos gruesos o solapados en imagenes de tinta historica pueden producir ramificaciones extra y lineas paralelas, segun advierte el propio autor.
- Solo procesa caracteres individuales de 256 × 256 pixeles; no esta disenado para lineas, parrafos ni documentos completos.
- Requiere imagenes con tinta oscura sobre fondo claro; no se documenta el comportamiento con otros esquemas de color o fondos ruidosos.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- No se documentan sesgos especificos, pero al entrenarse solo con caligrafia china, su dominio queda restringido a ese sistema de escritura.
- Riesgo de alucinacion en el sentido de generar centerlines espurias en zonas sin trazo o en trazos ambiguos; el umbral fijo de 0,65 no se adapta por imagen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No hay informacion sobre cuantizacion ni sobre formatos alternativos a PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/wkrfugs/calligen-centerline-extractor-v2
- CASIA-OLHWDB 1.1 (dataset de origen): https://nlpr.ia.ac.cn/databases/handwriting/Online_database.html
