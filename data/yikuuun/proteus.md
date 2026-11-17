# yikuuun/proteus

## Resumen

ProTEUS es un modelo de lenguaje de proteinas presentado por el autor yikuuun (repositorio vinculado a la Universidad de Pekin, segun la URL del proyecto en GitHub) y descrito en el articulo arXiv 2611.13348 como un "modelo del mundo con resolucion de mutaciones para evolucion dirigida de proteinas en bucle cerrado". A diferencia de los modelos de lenguaje de proteinas convencionales orientados a la prediccion de estructura o a la generacion de secuencias, ProTEUS se plantea como un modelo que predice el efecto de mutaciones concretas y se integra en un ciclo iterativo de diseno-evaluacion-seleccion.

El checkpoint publicado ocupa 8,06 GiB en un unico fichero `proteus_release.pth`, lo que situa el modelo en el rango de los miles de millones de parametros, aunque la model card no desglosa el numero exacto ni la arquitectura interna. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de la atribucion.

Su relevancia actual radica en la combinacion de dos tendencias: el uso de modelos del mundo para planificar experimentos biologicos y la aplicacion de tecnicas de evolucion dirigida asistida por aprendizaje automatico. El modelo se distribuye junto con codigo, documentacion y una demo de extremo a extremo en el repositorio de GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (descrita como "world model" en el paper; no se detalla en la model card) |
| Parametros totales | no disponible (checkpoint de 8,06 GiB, compatible con un modelo de varios miles de millones de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de proteinas; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch, fichero `proteus_release.pth`) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna: no se especifica si se trata de un transformer, de un modelo hibrido o de una arquitectura especifica para proteinas (por ejemplo, basada en ESM o en un encoder de secuencias con cabezas de prediccion de efectos de mutacion). El unico dato estructural disponible es el tamano del checkpoint (8.654.985.537 bytes, 8,06 GiB) y su formato PyTorch.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del corpus de secuencias, uso de RLHF o DPO) ni innovaciones tecnicas concretas. La descripcion del articulo indica que el modelo opera con "resolucion de mutaciones" y en "bucle cerrado", lo que sugiere un entrenamiento orientado a predecir el efecto de mutaciones puntuales y a integrarse en un ciclo iterativo de propuesta de variantes, evaluacion in silico y seleccion. Para obtener la informacion completa de arquitectura y datos de entrenamiento es necesario consultar el paper (arXiv 2611.13348) y el repositorio de GitHub.

## Capacidades

- Prediccion del efecto de mutaciones en proteinas (mutation-effect prediction), segun los tags del modelo.
- Modelado de lenguaje de proteinas: representacion y puntuacion de secuencias de aminoacidos.
- Evolucion dirigida (directed evolution): generacion y evaluacion de variantes dentro de un ciclo iterativo.
- Modelo del mundo para planificacion experimental: el paper lo describe como "world model" para bucle cerrado, lo que implica simular el resultado de intervenciones (mutaciones) antes de ejecutarlas en laboratorio.
- Ingenieria de proteinas (protein engineering) como dominio de aplicacion declarado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (aunque el concepto de bucle cerrado implica iteracion, no se documenta como capacidad de agente general).
- Capacidades multilingues: no aplicable; el modelo opera sobre secuencias de proteinas, no sobre lenguaje natural.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Optimizacion de enzimas industriales: usar ProTEUS para puntuar bibliotecas de variantes de una enzima candidata y priorizar las mutaciones con mayor probabilidad de mejorar actividad o estabilidad termica antes de sintetizarlas, reduciendo el coste de cribado experimental.
- Evolucion dirigida en bucle cerrado: integrar el modelo en un pipeline que proponga mutaciones, prediga su efecto, seleccione las mejores y realimente los resultados experimentales en la siguiente iteracion, tal como propone el paper.
- Priorizacion de variantes en ingenieria de anticuerpos: evaluar mutaciones en regiones determinantes de complementariedad (CDR) para estimar efectos sobre afinidad o estabilidad y descartar candidatos poco prometedores antes de la fase de expresion.
- Diseno de proteinas terapeuticas: analizar el impacto de mutaciones sobre la funcion de proteinas candidatas a farmaco, filtrando variantes con efectos deletéreos predichos.
- Investigacion en biologia computacional: utilizar el modelo como banco de pruebas para estudiar la relacion entre secuencia, mutacion y funcion, y para generar hipotesis que se validen experimentalmente.
- Filtrado en pipelines de protein design generativo: combinar generadores de secuencias (por ejemplo, modelos de difusion o de lenguaje de proteinas) con ProTEUS como evaluador para seleccionar las propuestas con mejor efecto de mutacion predicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de proteinas (por ejemplo, correlacion de Spearman en tareas de prediccion de efecto de mutacion como ProteinGym). Para datos de evaluacion hay que remitirse al paper arXiv 2611.13348.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en precision de 32 bits ocupa 8,06 GiB, por lo que la inferencia requiere al menos unos 10-12 GiB de VRAM solo para los pesos, mas memoria para activaciones y overhead del runtime. En FP16 el peso seria de aproximadamente 4 GiB, aunque no se confirma que exista una version en FP16.
- GPU recomendadas: no disponible en la documentacion. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100 40 GB, H100) es un punto de partida razonable, pero no hay confirmacion del autor.
- GPU de consumo: probablemente cabe en GPUs consumer de gama alta con 16-24 GB (RTX 4090, RTX 3090), sujeto a que el codigo del repositorio permita cargar el modelo en FP16 o en cuantizacion; no confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato `.pth` sugiere carga directa con PyTorch y el codigo del repositorio de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de proteinas (por ejemplo, ESM-2, ESM-3, ProteinMPNN o modelos de prediccion de efecto de mutacion como los evaluados en ProteinGym), ni datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no documenta arquitectura, datos de entrenamiento, contexto ni evaluacion, lo que dificulta la reproduccion y la evaluacion independiente.
- No hay informacion sobre sesgos en los datos de entrenamiento ni sobre la distribucion de proteinas cubierta; el rendimiento puede degradarse en familias de proteinas poco representadas.
- Riesgo de alucinacion: como modelo predictivo, puede generar puntuaciones de efecto de mutacion poco fiables fuera de su dominio de entrenamiento; las predicciones deben validarse experimentalmente.
- No se especifican limitaciones de contexto ni de idioma (no aplica lenguaje natural), pero se desconoce la longitud maxima de secuencia soportada.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no obstante, no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre patentes.
- El modelo se publica como checkpoint de investigacion (0 descargas, 0 likes en el momento de la consulta) y sin garantias de soporte; para produccion conviene evaluar el codigo del repositorio y la estabilidad de la API.
- No se documentan requisitos de hardware ni procesos de cuantizacion, lo que puede complicar el despliegue en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yikuuun/proteus
- Paper: https://huggingface.co/papers/2611.13348
- Repositorio de codigo y demo: https://github.com/yikunpku/ProTEUS
- Pagina del proyecto: https://yikunpku.github.io/ProTEUS/
