# VrKnight/JEV-9B-GGUF

## Resumen

JEV-9B-GGUF es la distribucion en formato GGUF del modelo JEV-9B, un ajuste fino mediante LoRA fusionado sobre el backbone Qwen/Qwen3.5-9B. Lo desarrolla el usuario VrKnight a partir del trabajo original del organizacion autotrust, y su rasgo distintivo es que incorpora una "cabeza de decision System-1" calibrada: ademas de generar texto como un modelo conversacional convencional (System-2), puede emitir decisiones estructuradas —elecciones entre opciones, valores booleanos y puntuaciones de 0 a 5 con probabilidades calibradas y valores esperados—. Esta orientacion hacia la toma de decisiones rapidas lo diferencia de un LLM generativo al uso.

El modelo cuenta con 8.953.803.264 parametros (aproximadamente 9 mil millones) y se distribuye en tres ficheros GGUF: el tronco en Q8_0 (8,86 GiB), el tronco en BF16 (16,68 GiB) y un proyector multimodal de vision (`mmproj`) en BF16 (879 MiB) que anade entrada de imagenes. La licencia declarada es Apache 2.0.

La relevancia de esta publicacion radica en dos factores. Por un lado, ofrece una via de despliegue en C++ puro mediante un runtime propio (`llama-jev`) que incrusta la cabeza de decision System-1 en el binario, algo que llama.cpp estandar no soporta. Por otro, el repositorio presenta cero descargas y cero likes en el momento de la consulta, lo que sugiere un proyecto muy reciente o de nicho, con escasa validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-9B) con cabeza de decision System-1 calibrada y proyector de vision ViT |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tronco Q8_0 y BF16, proyector mmproj en BF16) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-9B, un transformer denso de unos 9 mil millones de parametros, sobre el que se ha aplicado un ajuste fino LoRA orientado a "System-1" (decisiones rapidas y calibradas) que posteriormente se ha fusionado en los pesos del tronco. El resultado es `autotrust/JEV-9B`, del cual esta publicacion es la conversion a GGUF. Ademas del tronco de lenguaje, se incluye un proyector multimodal (`mmproj`) que combina un ViT y un merger de vision del propio Qwen3.5-9B para aceptar entradas de imagen.

La innovacion tecnica principal no esta en el entrenamiento —del que la model card no aporta detalles sobre numero de tokens, composicion del dataset ni uso de RLHF o DPO— sino en la cabeza de decision System-1: produce salidas de tipo `choice`, `bool`/`noul` y `score` de 0 a 5 acompanadas de probabilidades calibradas y valores esperados. El runtime nativo en C++ (`llama-jev-cli`, servidor HTTP en el puerto 8080 con endpoint `POST /v1/decide`) incrusta esta cabeza en el binario, algo que llama.cpp estandar no incluye. El autor reporta una paridad de argmax del 100 % frente a la referencia PyTorch BF16, con una desviacion maxima de probabilidad de 0,00133 en BF16 y 0,0101 en Q8_0.

## Capacidades

- Generacion de texto conversacional (modo System-2) sobre el backbone Qwen3.5-9B.
- Decisiones estructuradas System-1: eleccion entre opciones (`choice`), valores booleanos (`bool`/`noul`) y puntuaciones de 0 a 5 (`score`) con probabilidades calibradas y valores esperados.
- Entrada multimodal de imagenes mediante el proyector `mmproj` (ViT + merger de vision).
- Procesamiento por lotes de multiples preguntas en una sola peticion (multi-question batching).
- Servidor HTTP persistente con endpoint `/v1/decide` para integracion en servicios.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y uso conversacional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion binaria en produccion: usar la salida `bool` de la cabeza System-1 para moderacion de contenido, filtros de spam o verificacion de condiciones, aprovechando las probabilidades calibradas para fijar umbrales con control de falsos positivos.
- Enrutamiento de decisiones con puntuacion: emplear la salida `score` de 0 a 5 y su valor esperado para priorizar tickets de soporte, ordenar candidatos o asignar niveles de riesgo en pipelines automatizados.
- Seleccion entre opciones cerradas: la salida `choice` permite resolver tareas de multiple opcion (categorizacion, seleccion de herramienta, eleccion de respuesta) con una unica inferencia y probabilidades comparables.
- Analisis de imagenes con decision asociada: combinando el `mmproj` con la cabeza System-1, se pueden clasificar o puntuar imagenes (control de calidad visual, triaje de documentos escaneados) sin depender de Python ni de vLLM.
- Servicio de decision de baja latencia: desplegar `llama-jev-cli` con `--port 8080` como microservicio C++ sin dependencias externas, adecuado para entornos Windows o Linux donde no se quiere arrastrar un stack Python.
- Evaluacion y anotacion asistida: procesar lotes de preguntas en una sola peticion para etiquetar datasets con decisiones calibradas y valores esperados, utiles para auditoria o generacion de datos de entrenamiento.
- Prototipado multimodal en local: usar los GGUF BF16 o Q8_0 con el proyector de vision para experimentar con entrada de imagenes en maquinas de gama alta sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es la paridad frente a la referencia PyTorch BF16: 100 % de coincidencia en argmax, con `max |dP| = 0,00133` en BF16 y `0,0101` en Q8_0.

## Requisitos de hardware

- VRAM estimada: el tronco Q8_0 ocupa 8,86 GiB y el BF16 16,68 GiB; el proyector multimodal anade 879 MiB. En la practica, para Q8_0 conviene disponer de 12 GB o mas de VRAM (recomendacion explicita del autor); para BF16, de 20 GB o mas.
- GPU recomendadas: el autor sugiere GPUs de 12 GB o mas para Q8_0 (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090). Para BF16 se requieren tarjetas de 24 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en el caso de Q8_0 en tarjetas de 12 GB o mas; BF16 requiere gama alta de consumo o profesional.
- Opciones de despliegue: runtime nativo C++ `llama-jev-cli` (con servidor HTTP en `--port 8080` y endpoint `POST /v1/decide`), compatible con llama.cpp para el chat generativo estandar (sin la cabeza System-1). No se menciona soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| JEV-9B-GGUF | ~8,95 mil millones | no disponible | GGUF (Q8_0, BF16) | Apache 2.0 | Cabeza System-1 calibrada + vision; runtime C++ propio |
| Qwen/Qwen3.5-9B (base) | ~9 mil millones | no disponible | safetensors | no disponible | Backbone original, sin cabeza de decision System-1 |
| autotrust/JEV-9B | ~9 mil millones | no disponible | safetensors | no disponible | Version original antes de la conversion a GGUF |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La cabeza de decision System-1 no funciona con llama.cpp estandar: requiere el runtime propietario `llama-jev`, distribuido como binario con licencia de acceso sujeta a discusion con el autor.
- El acceso a los binarios para uso comercial o indie no es libre: hay que abrir una discusion en el repositorio para obtener licencia, lo que introduce una dependencia y un riesgo operativo en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Qwen3.5-9B, hereda los sesgos del backbone y del dataset de ajuste LoRA, no documentados.
- Riesgo de alucinacion: no evaluado; la calibracion de probabilidades de la cabeza System-1 ayuda a mitigar decisiones erroneas, pero no se aportan metricas de fiabilidad fuera de la paridad numerica.
- Idiomas soportados no declarados: no hay garantia documentada de cobertura multilingue.
- Longitud de contexto no especificada: limita la planificacion de cargas con entradas largas.
- Proyecto con cero descargas y cero likes en el momento de la consulta: sin validacion externa ni comunidad, lo que desaconseja su adopcion en produccion critica sin evaluacion propia.
- La licencia Apache 2.0 se declara sobre los pesos, pero la del runtime binario es independiente y debe negociarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VrKnight/JEV-9B-GGUF
- Modelo original JEV-9B: https://huggingface.co/autotrust/JEV-9B
- Backbone base: https://huggingface.co/Qwen/Qwen3.5-9B
- Discusiones y licencia del binario: https://huggingface.co/VrKnight/JEV-9B-GGUF/discussions
