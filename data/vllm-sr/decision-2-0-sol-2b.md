# vllm-sr/Decision-2.0-Sol-2B

## Resumen

Decision-2.0-Sol-2B es un modelo de decisión estructurada de 1,88 mil millones de parámetros desarrollado por el equipo de vLLM Semantic Router. No es un modelo generativo: recibe un estado de entrada (texto o JSON) junto con un conjunto de preguntas y devuelve directamente una probabilidad para cada respuesta posible, sin producir texto libre. Resuelve el problema de la clasificación y el enrutamiento de decisiones dentro de pipelines de enrutamiento semántico, donde se necesita latencia muy baja y respuestas deterministas.

El modelo es un ajuste fino (finetune) de Decision-1.0-Sol-2B y forma parte de la familia Decision 2.0. Soporta tres tipos de decisión: elección entre opciones (choice), sí/no (noul) y puntuación en escala (score). Su ventana de contexto es de 16.384 tokens y la licencia es Apache-2.0.

Su relevancia actual radica en que permite resolver múltiples preguntas sobre una misma entrada en una única pasada forward, con una latencia mediana de 7,2 ms por petición de una sola pregunta en una GPU, lo que lo hace adecuado para enrutamiento en tiempo real dentro de infraestructuras de despliegue de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1,88B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de transformer, atencion, capas, dimensiones ocultas ni composicion del dataset de entrenamiento). Se sabe que es un ajuste fino del modelo vLLM-sr/Decision-1.0-Sol-2B y que su tarea principal es la clasificacion zero-shot y la extraccion de caracteristicas, segun los tags del repositorio.

La innovacion tecnica destacable es el mecanismo `system_one`, que agrupa preguntas de distinto tipo (choice, noul y score) sobre la misma entrada y las resuelve en una sola pasada forward, devolviendo una probabilidad por cada opcion. El modelo card indica que los datos de entrenamiento fueron auditados a nivel de fila contra todos los elementos de test del Jev Decision Index, lo que sugiere un control de contaminacion. No se especifica si hubo RLHF, DPO ni el volumen de tokens de entrenamiento.

## Capacidades

- Clasificacion zero-shot con opciones definidas por el usuario (tipo choice).
- Respuestas binarias si/no (tipo noul).
- Puntuacion en escala ordinal con criterios definidos por el usuario (tipo score).
- Resolucion conjunta de multiples preguntas sobre una misma entrada en una sola pasada forward.
- Entrada de estado en texto plano o JSON.
- Salida de probabilidad por cada opcion, sin generacion de texto.
- Integracion como pipeline de transformers (`pipeline("decision", ...)`).
- No dispone de generacion de texto, tool calling, capacidades de agente ni vision segun la informacion disponible.

## Casos de uso

- Enrutamiento de peticiones en atencion al cliente: dado el texto de una solicitud, el modelo decide en una sola pasada si debe ir al equipo de devoluciones, facturacion o soporte tecnico, y ademas evalua la urgencia con una escala, todo con latencias de milisegundos.
- Clasificacion de tickets en produccion: integrado en un pipeline de transformers, permite etiquetar cada ticket entrante con categoria y prioridad sin generar texto, reduciendo coste computacional frente a modelos generativos.
- Filtrado de contenido y moderacion: preguntas binarias (noul) sobre si un texto cumple una politica concreta, con probabilidad asociada para fijar umbrales.
- Enrutamiento semantico dentro de vLLM Semantic Router: el modelo actua como clasificador de senales para decidir que modelo o modalidad atiende cada peticion en despliegues de mezcla de modalidades.
- Extraccion de atributos estructurados desde JSON: dado un estado en formato JSON, responder preguntas booleanas y de escala sobre sus campos para alimentar sistemas de decision aguas abajo.
- Priorizacion de colas de soporte: uso del tipo score para ordenar solicitudes por urgencia (rutina, pronto, hoy) y asignar recursos.
- Evaluacion automatizada de formularios o encuestas: clasificacion de respuestas abiertas en categorias predefinidas con probabilidades calibradas.

## Benchmarks y rendimiento

| Modelo | JevArena ↑ | Human-labelled transfer ↑ | Jev Decision Index ↑ |
|---|---:|---:|---:|
| Decision-2.0-Sol-2B | 52,1 | 51,3 | 29,5 |
| Decider 2B | 49,5 | 42,0 | no disponible |
| This-That 1.2 | 46,1 | 40,5 | no disponible |
| Decision 1.0 Sol | 45,8 | 49,3 | 25,3 |
| Bosun v3.1 1,7B | 42,1 | 38,0 | no disponible |

El modelo card indica que Human-labelled transfer es la mediana de macro-F1 sobre 15 tareas etiquetadas por humanos (×100). La reproduccion del Jev Decision Index se realizo con el kit oficial 0.2.1 sobre los pesos publicados; el resto de resultados provienen de una instantanea publica del board del 2026-09-28. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1,88B parametros en safetensors, el repositorio ocupa 4,8 GB, por lo que en fp16 se requiere aproximadamente 4 GB de VRAM mas overhead.
- GPU recomendadas: no se especifican modelos concretos; el modelo card menciona una unica GPU para la medicion de latencia.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1,88B parametros, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: transformers (version >= 5.17) con `trust_remote_code=True`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 7,2 ms por peticion de una sola pregunta en una unica GPU.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevArena | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-2.0-Sol-2B | 1,88B | 16.384 | 52,1 | Apache-2.0 | Hugging Face |
| Decider 2B | no disponible | no disponible | 49,5 | no disponible | no disponible |
| This-That 1.2 | no disponible | no disponible | 46,1 | no disponible | no disponible |
| Bosun v3.1 1,7B | 1,7B | no disponible | 42,1 | no disponible | no disponible |

Los datos de parametros, contexto y licencia de los modelos comparables no aparecen en la informacion proporcionada. Decision-2.0-Sol-2B lidera el JevArena entre los modelos de su tamano comparados y supera a su predecesor Decision 1.0 Sol en 6,3 puntos de JevArena y 4,2 puntos de Jev Decision Index.

## Limitaciones y advertencias

- No genera texto: solo devuelve probabilidades sobre opciones predefinidas, por lo que no sirve para tareas generativas.
- Idiomas soportados no documentados; el rendimiento fuera del ingles no esta garantizado.
- No se detalla la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos conocidos.
- Riesgo de alucinacion no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento.
- La ventana de contexto esta limitada a 16.384 tokens; entradas mas largas requieren truncado o segmentacion.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene revisar el archivo LICENSE del repositorio para confirmar condiciones.
- Requiere `trust_remote_code=True` y transformers >= 5.17, lo que implica ejecutar codigo personalizado del autor.
- No se documentan opciones de cuantizacion ni soporte en motores de inferencia alternativos, lo que limita el despliegue fuera de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/Decision-2.0-Sol-2B
- Coleccion Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Sitio web de vLLM Semantic Router: https://vllm-sr.ai/
- Modelo base Decision-1.0-Sol-2B: https://huggingface.co/vllm-sr/Decision-1.0-Sol-2B
