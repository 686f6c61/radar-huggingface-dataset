# tstepspam/Huihui-Qwen3.5-27B-abliterated-Q8-MLX

## Resumen
Este repositorio contiene una version cuantizada a 8 bits en formato MLX del modelo Huihui-Qwen3.5-27B-abliterated, publicada por el usuario tstepspam. Se trata de un derivado "abliterated" (tambien etiquetado como "uncensored") del modelo Qwen3.5-27B, en el que se han eliminado o atenuado las direcciones de rechazo del modelo original, de modo que el sistema responde a peticiones que la version alineada rechazaria por politicas de seguridad.

El modelo cuenta con 26.895.993.856 parametros (aproximadamente 26,9 mil millones) y se distribuye como un repo de 28,6 GB en safetensors, preparado para ejecutarse con la libreria MLX de Apple sobre silicio de la serie M. La licencia declarada es Apache 2.0, heredada del modelo base Qwen/Qwen3.5-27B.

Su relevancia es doble: por un lado, permite ejecutar localmente un modelo de ~27B en equipos Apple Silicon con memoria unificada suficiente, sin depender de GPUs NVIDIA ni de servicios en la nube; por otro, sirve como material de estudio para investigacion sobre alineacion, mecanismos de rechazo, red teaming y evaluacion de los efectos secundarios del proceso de abliteration. La model card del autor es extremadamente escueta y no aporta informacion sobre entrenamiento, contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base pertenece a la familia Qwen3.5; la model card no especifica detalles) |
| Parametros totales | 26.895.993.856 (aprox. 26,9B), dato real de safetensors |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (Q8) en formato MLX; otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizacion MLX, 8-bit) |
| Libreria de inferencia | mlx |
| Modelo base | huihui-ai/Huihui-Qwen3.5-27B-abliterated |
| Tamano del repositorio | 28,6 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
No se dispone de informacion publicada por el autor sobre la arquitectura concreta, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. Lo unico documentado es la cadena de derivacion: Qwen/Qwen3.5-27B (modelo original con alineacion de seguridad) da lugar a huihui-ai/Huihui-Qwen3.5-27B-abliterated, y este a su vez se cuantiza a 8 bits en MLX para producir el repositorio analizado.

La innovacion tecnica implicita es el proceso de abliteration, consistente en identificar la direccion latente asociada al rechazo de peticiones y suprimirla o proyectarla fuera de los pesos y activaciones, sin reentrenar el modelo desde cero. El resultado es un modelo que conserva la mayor parte de las capacidades del original, pero cuya tasa de rechazo se reduce drasticamente. La cuantizacion a 8 bits en MLX reduce el peso en memoria respecto a la version en precision completa, a costa de una perdida de calidad que el autor no cuantifica en ningun momento.

## Capacidades
- Generacion de texto y conversacion multi-turno (pipeline declarado: text-generation, con etiqueta conversational).
- Capacidades generales heredadas del modelo base Qwen3.5-27B: comprension y generacion de lenguaje, razonamiento, codigo y matematicas. No hay evaluaciones publicadas en este repositorio que las confirmen para esta cuantizacion.
- Respuesta a peticiones que la version alineada rechazaria, al haberse eliminado la direccion de rechazo (abliteration).
- Capacidad multilingue: no confirmada en la model card; no disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado, aunque el modelo base podria soportarlo; no disponible.
- Capacidades de vision o audio: no disponibles (el pipeline es exclusivamente text-generation).
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Ejecucion local en Apple Silicon mediante MLX, con posibilidad de servidor compatible con la API de OpenAI a traves de mlx-lm.

## Casos de uso
- Investigacion sobre alineacion y mecanismos de rechazo: comparar las respuestas de esta version abliterated con las del Qwen3.5-27B original permite estudiar que comportamientos dependen de la direccion de rechazo y cuales son consecuencia del entrenamiento de alineacion.
- Red teaming de sistemas de moderacion: usar el modelo como generador adversario para producir prompts y respuestas que pongan a prueba clasificadores de contenido, aprovechando que no bloquea peticiones sensibles.
- Generacion de datos sinteticos para entrenar clasificadores de seguridad: al no rechazar peticiones, puede producir ejemplos etiquetables como negativos duros que alimenten un dataset de moderacion.
- Escritura creativa sin filtros: redaccion de ficcion con tematicas adultas, violentas o controvertidas en un entorno local, donde el contenido no sale del equipo del usuario.
- Analisis de documentos sensibles en local: procesamiento de textos medicos, legales o de recursos humanos que contienen informacion delicada, gracias a que el modelo se ejecuta en el propio Mac sin enviar datos a terceros.
- Asistencia a la traduccion de contenido sensible: traduccion de material con lenguaje explicito o tematicas delicadas donde un modelo alineado tenderia a suavizar o rechazar el texto.
- Prototipado y desarrollo en Mac: uso como endpoint local compatible con la API de OpenAI mediante mlx-lm para pruebas de aplicaciones que requieran un modelo de ~27B sin coste de API, aceptando la latencia propia de la inferencia en memoria unificada.
- Evaluacion comparativa de cuantizaciones: medir la degradacion de calidad de la version 8-bit MLX frente a la version en precision completa del mismo modelo abliterated, como parte de un estudio de cuantizacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base o con otras cuantizaciones.

## Requisitos de hardware
- VRAM / memoria unificada estimada para inferencia: aproximadamente 27 GB solo para los pesos en 8 bits (26,9B parametros x 1 byte), mas overhead de contexto y cache KV; en la practica se recomienda disponer de 36 GB o mas de memoria unificada. Estimacion a partir del numero de parametros y la cuantizacion declarada, ya que el autor no publica cifras.
- Equipos recomendados: Apple Silicon con 36 GB o mas de memoria unificada, como M4 Max (36, 48 o 128 GB), M3 Max (48 o 64 GB), M2 Ultra (64 o 128 GB) o M3 Ultra. No se recomienda intentar cargarlo en configuraciones de 16 o 24 GB.
- Compatibilidad con GPU NVIDIA: no aplicable en su formato actual; el repo esta publicado exclusivamente para MLX. No se proporcionan pesos GGUF ni safetensors estandar para CUDA.
- Despliegue: libreria mlx y mlx-lm para inferencia por linea de comandos; mlx_lm.server para exponer un endpoint HTTP compatible con la API de OpenAI. No se documentan integraciones con vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Comparativa orientativa de memoria entre cuantizaciones del mismo modelo: 8 bits (este repo) ~27 GB de pesos; 4 bits ~13,5 GB (estimacion aritmetica, no confirmada por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tstepspam/Huihui-Qwen3.5-27B-abliterated-Q8-MLX | 26,9B | 8-bit | no disponible | apache-2.0 | safetensors (MLX) | Version analizada; solo Apple Silicon; sin benchmarks |
| huihui-ai/Huihui-Qwen3.5-27B-abliterated | 26,9B | precision completa | no disponible | apache-2.0 | safetensors | Modelo base directo de este repo; mayor calidad esperada, mayor consumo de memoria |
| Qwen/Qwen3.5-27B | 26,9B | precision completa | no disponible | apache-2.0 (segun enlace de licencia del autor) | safetensors | Modelo original con alineacion de seguridad; rechaza peticiones que la version abliterated acepta |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas tres variantes. Las diferencias de comportamiento entre ellas solo pueden afirmarse en terminos de politica de rechazo y de formato de despliegue, no de calidad medida.

## Limitaciones y advertencias
- Ausencia total de evaluaciones: no hay benchmarks ni mediciones de calidad, por lo que se desconoce en que grado la abliteration y la cuantizacion a 8 bits degradan las capacidades originales.
- Riesgo elevado de contenido danino: al eliminar los mecanismos de rechazo, el modelo puede generar instrucciones peligrosas, contenido ilegal, discurso de odio o material sexual explicito sin las salvaguardas del modelo original.
- Responsabilidad legal y etica: el uso de modelos abliterated para generar contenido danino puede infringir normativas de la Union Europea y las condiciones de uso de las plataformas que lo distribuyen. La licencia Apache 2.0 cubre el uso del software, no exime de responsabilidad por el contenido generado.
- Alucinacion: no se han publicado mediciones de tasa de alucinacion para esta version; al tratarse de una cuantizacion con perdida, es razonable esperar un comportamiento igual o peor que el modelo en precision completa, pero no hay datos que lo confirmen.
- Limitaciones de contexto e idioma: se desconocen tanto la longitud de contexto real como los idiomas soportados y su calidad.
- Restricciones de despliegue: al estar en formato MLX, no es utilizable directamente en GPU NVIDIA ni en la mayoria de infraestructuras de servidor x86. Requiere hardware Apple Silicon con memoria unificada abundante.
- Sesgos: no hay analisis de sesgos publicado. Los sesgos del modelo base pueden persistir o amplificarse al eliminar las capas de alineacion.
- Repositorio sin traccion: cero descargas y cero likes, sin validacion por parte de la comunidad, lo que aumenta la incertidumbre sobre la integridad de los pesos publicados.
- La model card es practicamente vacia: solo aporta etiquetas y licencia, sin instrucciones de uso, ejemplos ni advertencias del propio autor.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/tstepspam/Huihui-Qwen3.5-27B-abliterated-Q8-MLX
- Modelo base de esta cuantizacion: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-27B-abliterated
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.5-27B
- Enlace de licencia referenciado por el autor: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Resultados de busqueda web: no se han encontrado enlaces relevantes. Las consultas devolvieron exclusivamente paginas de un sitio de webcams para adultos sin ninguna relacion con el modelo, por lo que no se incluyen. No se dispone de paper, blog tecnico ni repositorio de codigo adicionales.
