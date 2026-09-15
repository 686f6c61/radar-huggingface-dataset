# yogeshjog/Muse-Glimmer-30B-Q2_K-GGUF

## Resumen

Muse-Glimmer-30B-Q2_K-GGUF es una cuantización no oficial en formato GGUF del modelo multimodal meta-models/Muse-Glimmer-30B, publicada por el usuario yogeshjog. El modelo base, atribuido a Meta Superintelligence Labs en los créditos de la model card, es un modelo de 27.854.794.240 parámetros (unos 27,85 mil millones) con pipeline image-text-to-text, es decir, capaz de procesar imágenes y texto. Esta versión concreta no aporta pesos nuevos: es una conversión del checkpoint BF16 oficial a GGUF y su posterior cuantización agresiva a Q2_K mediante llama.cpp.

El objetivo declarado de la publicación es hacer viable un modelo de casi 28.000 millones de parámetros en equipos con memoria limitada, en particular Apple Silicon, manteniendo la mayor capacidad posible. La cuantización reduce el peso de 53.131,48 MiB en BF16 (16,00 bits por peso) a 10.179,12 MiB (9,95 GiB, 3,07 bits por peso), un factor de compresión superior a 5x. La conversión se hizo directamente desde los pesos BF16, sin recuantizar un checkpoint ya cuantizado, y el proceso completo de cuantización tardó unos 80 segundos en un MacBook Pro con M3 Max y 36 GB de memoria unificada.

Es relevante ahora porque demuestra un flujo reproducible de cuantización multimodal en hardware de consumo y explora el límite práctico de compresión: cuánta capacidad de un modelo de 30B sobrevive a ~10 GiB. Ahora bien, el propio autor advierte de que Q2_K es una cuantización muy agresiva y que debe considerarse una build experimental de bajo consumo de memoria, no un sustituto del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base multimodal image-text-to-text; el autor no detalla la arquitectura en la model card) |
| Parámetros totales | 27.854.794.240 (~27,85 mil millones) |
| Parámetros activos | No aplica; no se indica que el modelo base sea MoE |
| Longitud de contexto | 32.768 tokens (valor configurado y probado en Ollama); máximo oficial del modelo base no disponible |
| Tipos de cuantización | Q2_K (3,07 BPW) en esta publicación; la model card menciona Q4, Q5 y Q8 del modelo base sin especificar tamaños |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors BF16 |
| Modelo base | meta-models/Muse-Glimmer-30B |
| Tamaño del archivo cuantizado | 9,95 GiB (10.179,12 MiB) |
| Tamaño del GGUF de origen (BF16) | 53.131,48 MiB (16,00 BPW) |
| Tamaño del repositorio | 10,7 GB |
| Herramienta de cuantización | llama.cpp, orquestado con phygineer/quantize |
| Pipeline declarado | image-text-to-text |
| Fecha de publicación | 2026-09-15 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo único verificable a partir de la información disponible es que se trata de un modelo multimodal con pipeline image-text-to-text, con 27.854.794.240 parámetros y pesos originales en BF16. No se especifica si emplea attention estándar, atención lineal, mezcla de expertos o algún esquema híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa.

Lo que sí está documentado es el proceso de cuantización, que constituye el aporte técnico de esta ficha. La cadena es: pesos BF16 oficiales en Hugging Face, conversión a GGUF BF16 (~53 GiB), y cuantización Q2_K con `llama-quantize` hasta 9,95 GiB. El autor subraya que no se recuantizó desde un checkpoint Q4 o Q8, lo que evita la acumulación de errores de cuantización sucesivos. La salida del proceso reporta 3,07 BPW frente a los 16,00 BPW del origen. El flujo es reproducible con la utilidad phygineer/quantize sobre llama.cpp.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y `endpoints_compatible`, y el autor verificó que una generación básica funciona correctamente tras importarlo en Ollama.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text, por lo que el modelo base es multimodal. La model card advierte que el rendimiento multimodal puede verse afectado por la cuantización Q2_K, pero no confirma qué componentes de visión quedan incluidos en el archivo GGUF.
- Contexto largo: se probó con 32.768 tokens de contexto configurados en Ollama, con offload del 100 % a GPU.
- Ejecución local en memoria reducida: es la capacidad operativa central de esta publicación, ya que el archivo cabe en 9,95 GiB.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card solo anticipa degradación en razonamiento y seguimiento de instrucciones.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo de pensamiento explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: con 9,95 GiB de pesos, el modelo se puede cargar por completo en GPU en un Mac con 36 GB de memoria unificada, como demuestra la prueba del autor con Ollama. Es adecuado para quien quiera experimentar con un modelo multimodal de casi 28B sin depender de la nube.
- Experimentación con ventanas de contexto largas en portátiles: la build se probó con 32.768 tokens de contexto, lo que permite ensayar tareas de resumen o análisis de documentos extensos en hardware de consumo, asumiendo que el consumo real de memoria crece con la ocupación de la caché KV.
- Pruebas de pipelines de visión-lenguaje offline: para prototipos de descripción de imágenes, extracción de texto o clasificación visual en entornos sin conexión, siempre que se acepte la degradación documentada en el rendimiento multimodal.
- Evaluación de degradación por cuantización: sirve como referencia de comparación frente a Q4, Q5, Q8 y BF16 del mismo modelo base, lo que lo convierte en una pieza útil para estudios de ablation sobre el impacto de la compresión agresiva.
- Demos internas en GPUs de 16 a 24 GB: el autor señala explícitamente ese rango de memoria como objetivo, de modo que el modelo se puede desplegar en estaciones de trabajo modestas para validar ideas antes de escalar a versiones de mayor precisión.
- Asistentes conversacionales con requisitos de privacidad: al ejecutarse íntegramente en local mediante llama.cpp u Ollama, el contenido de las conversaciones no sale del equipo, lo que encaja en escenarios con datos sensibles donde no se permite enviar información a servicios externos.
- Docencia y formación en cuantización: dado que la cadena de conversión y cuantización está documentada paso a paso y es reproducible con herramientas abiertas, el repositorio funciona como material práctico para explicar cómo se comprime un modelo multimodal grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y afirma que se planifican pruebas más exhaustivas en el futuro. El único dato de rendimiento medido es el tiempo de cuantización: 79.786,76 ms (unos 80 segundos) para generar el archivo Q2_K a partir del GGUF BF16. No se reportan latencia ni throughput de inferencia.

## Requisitos de hardware

- Peso del modelo: 9,95 GiB (10.179,12 MiB) en disco y en memoria una vez cargado.
- Overhead adicional: la model card advierte que el tamaño reportado por Ollama (11 GB en la prueba) no debe interpretarse como el consumo total garantizado del sistema con un contexto de 32K completamente ocupado, ya que depende de la caché KV, los buffers del runtime y la versión de Ollama o llama.cpp.
- Hardware validado por el autor: MacBook Pro con Apple M3 Max y 36 GB de memoria unificada, con offload del 100 % a GPU y 32K de contexto configurado.
- GPUs de consumo: el autor indica que la cuantización está pensada para sistemas con 16 a 24 GB de VRAM, y para portátiles y estaciones con memoria unificada limitada. No se especifica una GPU concreta (RTX 4090, A100, H100) en la documentación.
- Opciones de despliegue: llama.cpp mediante `llama-cli` con `-c 32768`, y Ollama mediante un `Modelfile` con `PARAMETER num_ctx 32768` y `ollama create`. No se documenta soporte para vLLM, TGI ni otros servidores.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

La información disponible solo permite comparar esta build con las otras precisiones del mismo modelo base, y únicamente para Q2_K y BF16, que son las que tienen cifras publicadas. La model card menciona Q4, Q5 y Q8 sin aportar tamaños ni bits por peso, por lo que no se pueden tabular. Tampoco se han facilitado datos de modelos alternativos de la misma categoría.

| Versión | Bits por peso | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse-Glimmer-30B-Q2_K-GGUF (esta) | 3,07 BPW | 9,95 GiB | Apache 2.0 | Repositorio de yogeshjog en Hugging Face |
| Muse-Glimmer-30B GGUF BF16 | 16,00 BPW | 53.131,48 MiB | Apache 2.0 (modelo base) | Derivado del modelo base meta-models/Muse-Glimmer-30B |
| Muse-Glimmer-30B Q4 / Q5 / Q8 | No disponible | No disponible | Apache 2.0 (modelo base) | Mencionadas en la model card, sin datos publicados |
| Otros modelos de ~30B comparables | No disponible | No disponible | No disponible | No se han encontrado referencias en la información proporcionada |

## Limitaciones y advertencias

- Cuantización muy agresiva: el propio autor califica Q2_K como agresiva y advierte de pérdida de calidad frente a BF16 y frente a Q4, Q5 o Q8.
- Áreas potencialmente degradadas: razonamiento, precisión en código, seguimiento de instrucciones, recuperación de hechos, salida estructurada, rendimiento multimodal y rendimiento en contexto largo.
- Rendimiento multimodal incierto: aunque el pipeline declarado es image-text-to-text, la model card no confirma que el archivo GGUF incluya los componentes de visión ni cómo se comportan tras la cuantización.
- Consumo de memoria real superior al tamaño del archivo: con contexto de 32K la caché KV y los buffers incrementan el uso efectivo, y el autor lo advierte expresamente.
- Idiomas: no se declaran idiomas soportados, por lo que no hay garantía de cobertura multilingüe.
- Sesgos: no disponible; la model card no incluye ninguna sección de sesgos ni de seguridad.
- Riesgo de alucinación: no cuantificado en la información disponible, pero la degradación en recuperación de hechos descrita por el autor incrementa el riesgo esperado.
- Licencia: Apache 2.0 para el modelo base, pero al ser una cuantización no oficial el usuario debe revisar y cumplir las condiciones del modelo original. No se mencionan restricciones adicionales de uso comercial.
- Madurez: es una build experimental con cero descargas y cero likes en el momento de la consulta y sin evaluación comparativa publicada; no se recomienda para producción donde la calidad sea prioritaria.
- El repositorio no contiene documentación arquitectónica propia; para cualquier detalle del modelo hay que acudir a meta-models/Muse-Glimmer-30B.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/yogeshjog/Muse-Glimmer-30B-Q2_K-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Utilidad de cuantización del autor: https://github.com/phygineer/quantize
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos correspondían a páginas sin relación con el tema (foros de preguntas y respuestas en chino sobre buscadores, redes WiFi, 7-Zip, días de la semana y el uso de la virgulilla), por lo que se descartan como fuentes. No se dispone de paper, blog técnico ni demo asociados.
