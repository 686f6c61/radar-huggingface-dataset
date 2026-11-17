# ysharma/pocket-layout-planner-2B

## Resumen

pocket-layout-planner-2B es un ajuste fino (fine-tune) completo del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario ysharma de Hugging Face. El modelo recibe una unica peticion de imagen corta, sin system prompt ni modo de razonamiento, y devuelve en una sola linea una descripcion detallada en la que cita elementos como `<id>` seguidos de una tabla JSON de cajas delimitadoras (`[y_min, x_min, y_max, x_max]`) sobre una rejilla de 0-1000 con origen en la esquina superior izquierda. Se ha destilado a partir del modo `t2i_bbox` del modelo profesor `black-forest-labs/flux-3-image-klein-pup`.

El modelo cuenta con 2.213.241.664 parametros totales (aproximadamente 2,2 mil millones) y se distribuye en formato safetensors con licencia Apache-2.0. Su proposito no es tanto planificar el layout de una imagen generada como actuar como un ampliador de prompts (prompt upsampler) compacto que emite un registro estructurado y parseable de la disposicion de los elementos.

La relevancia de este modelo radica en su honestidad experimental: el propio autor documenta que no se materializo ninguna ventaja de layout ni en el profesor ni en los estudiantes, y que el modelo debe entenderse como un upsampler de prompts de bolsillo con una fiabilidad de parseo superior al 96%, no como un planificador que mejore la adherencia de los renders.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | salida en ingles; peticiones en cualquier idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tune) del transformer Qwen3.5-2B. El entrenamiento se realizo sobre una A100 con una duracion de 1 hora y 1 minuto, a 3,68 segundos por paso, durante 2 epocas (10,1 millones de tokens), sobre el mismo conjunto de 7.575 filas filtradas que el modelo hermano de 0,8B. Se empleo un learning rate de 1e-5 con decaimiento coseno. La perdida final de entrenamiento fue de 0,724, con una precision de token de 0,810; el checkpoint-469 queda como respaldo de la primera epoca.

La innovacion tecnica principal es la destilacion del modo `t2i_bbox` del profesor `black-forest-labs/flux-3-image-klein-pup` (Apache-2.0). El modelo produce una unica linea con una leyenda detallada que cita elementos como `<id>` y una tabla JSON de cajas delimitadoras en una rejilla de 0-1000. La etapa de DPO planificada se descarto por considerarse irrelevante, dado que no se observo ventaja de layout alguna. El modelo no dispone de system prompt ni de modo de pensamiento (thinking mode).

## Capacidades

- Generacion de texto descriptivo detallado a partir de una peticion de imagen corta.
- Emision de tablas JSON de cajas delimitadoras (bounding boxes) con coordenadas `[y_min, x_min, y_max, x_max]` en rejilla 0-1000.
- Citacion verbatim de texto citado entre comillas (55/55 en la evaluacion).
- Parseo y citacion completa fiable: 92,7% de tasa de parseo y citacion completa en el hold-out.
- Tasa de cajas validas del 95,7%.
- Procesamiento de peticiones en cualquier idioma, con salida siempre en ingles.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma documentada.
- No dispone de capacidades de vision, audio ni modo de pensamiento.

## Casos de uso

- Ampliacion de prompts para generacion de imagenes: el modelo transforma una peticion corta en una descripcion detallada con un registro estructurado de layout, adecuado como paso previo a un generador de imagenes como Klein fp8r.
- Extraccion de layouts estructurados: permite obtener una tabla JSON parseable de cajas delimitadoras para cada elemento citado, util en pipelines que necesiten datos de disposicion espacial.
- Preprocesamiento en pipelines de text-to-image: al emitir una unica linea con formato fijo, se integra facilmente en flujos automatizados que requieran parseo fiable (superior al 96%).
- Generacion de descripciones detalladas con citas de elementos: util para tareas de captioning enriquecido donde cada elemento se referencia con un identificador `<id>`.
- Prototipado rapido en entornos con recursos limitados: con 2,2 mil millones de parametros, cabe en GPUs de consumo y permite iterar sobre prompts sin infraestructura pesada.
- Evaluacion comparativa de upsamplers de prompts: sirve como referencia en experimentos que comparen distintos tamanos (0,8B frente a 2B) y estrategias de destilacion.
- Investigacion sobre destilacion de profesores multimodales: el modelo documenta de forma transparente el proceso de destilacion desde el modo `t2i_bbox` de un profesor, con datos y resultados publicos.

## Benchmarks y rendimiento

Evaluacion a nivel de texto sobre 301 peticiones del hold-out, con decodificacion greedy:

| Metrica | 2B SFT (este modelo) | 0,8B SFT | 2B sin ajustar + prompt `t2i_bbox` |
|---|---|---|---|
| Tasa de parseo y citacion completa | 92,7% | 95,0% | 1,0% |
| Tasa de cajas validas | 95,7% | 96,4% | 10,6% |
| Texto citado verbatim | 55/55 | 55/55 | 55/55 |
| IoU medio de filas emparejadas con el profesor | 0,529 | 0,470 | 0,133 |
| Tokens de salida medios | 646 | 618 | 810 |

Evaluacion a nivel de imagen sobre 100 prompts (60 del subconjunto GenEval y 40 peticiones de especificacion), Klein fp8r a 512², 1 semilla, con una reimplementacion estilo GenEval (OWLv2), no el GenEval oficial:

| Variante | GenEval-style (60) | Conteo de objetos en peticiones de especificacion (40) |
|---|---|---|
| Peticion cruda | 58/60 | 29/40 |
| pup plano `t2i` | 60/60 | 30/40 |
| pup `t2i_bbox` (profesor) | 60/60 | 28/40 |
| 0,8B SFT | 53/60 | 26/40 |
| Este 2B | 58/60 | 26/40 |

El hallazgo declarado es que no se materializo ninguna ventaja de layout, ni para el profesor ni para los estudiantes. Los modelos deben entenderse como upsamplers de prompts de bolsillo que emiten un registro de layout estructurado y parseable (fiable en mas del 96% de los casos), no como planificadores que mejoren la adherencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2,2 mil millones de parametros, en FP16 requeriria aproximadamente 4,4 GB de pesos, y en cuantizaciones de 8 o 4 bits alrededor de 2,2 GB o 1,1 GB respectivamente (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: el autor entreno en una A100; para inferencia, GPUs de consumo como RTX 4090, RTX 3090 o RTX 4060 Ti deberian ser suficientes en FP16 o cuantizado.
- Cabe en GPU de consumo: si, dado su tamano de 2,2 mil millones de parametros.
- Opciones de despliegue: no disponible de forma explicita; el autor remite a la model card del 0,8B para el snippet de uso, que emplea `model_id = "ysharma/pocket-layout-planner-2B"`.
- Latencia y throughput: no disponibles; el entrenamiento registro 3,68 segundos por paso en A100, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (parseo/citacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pocket-layout-planner-2B (este) | 2.213.241.664 | no disponible | 92,7% parseo, 95,7% cajas validas, IoU 0,529 | Apache-2.0 | Hugging Face |
| pocket-layout-planner-0.8B | no disponible | no disponible | 95,0% parseo, 96,4% cajas validas, IoU 0,470 | no disponible | Hugging Face |
| Qwen3.5-2B sin ajustar + prompt `t2i_bbox` | no disponible | no disponible | 1,0% parseo, 10,6% cajas validas, IoU 0,133 | no disponible | Hugging Face |

El modelo hermano de 0,8B supera ligeramente al 2B en tasa de parseo y cajas validas, mientras que el 2B obtiene mejor IoU medio (0,529 frente a 0,470) y un rendimiento de imagen comparable (58/60 frente a 53/60 en GenEval-style). El modelo sin ajustar con prompt `t2i_bbox` queda muy por detras en todas las metricas de texto.

## Limitaciones y advertencias

- El layout no mejora los renders destilados de Klein; debe usarse como upsampler compacto, no como planificador que aumente la adherencia. El Klein de tamano completo o base no se midio.
- La satisfaccion del conteo de objetos en los renders queda ligeramente por detras de la peticion cruda (26/40 frente a 29/40).
- La salida es siempre en ingles, aunque las peticiones pueden estar en cualquier idioma.
- La comparacion de imagenes se realizo con 100 prompts, 1 semilla y puntuacion por conteo de presencia, muy por debajo del protocolo oficial de GenEval (553 prompts y 4 semillas).
- La etapa de DPO planificada se descarto por considerarse irrelevante.
- No se dispone de informacion sobre sesgos conocidos ni sobre riesgo de alucinacion mas alla de los datos de evaluacion.
- Licencia Apache-2.0 heredada de Qwen3.5-2B, lo que permite uso comercial; se atribuye al profesor `black-forest-labs/flux-3-image-klein-pup` (Apache-2.0), sin afiliacion ni respaldo de Black Forest Labs.
- El modelo no esta afiliado ni respaldado por Black Forest Labs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ysharma/pocket-layout-planner-2B
- Modelo hermano de 0,8B: https://huggingface.co/ysharma/pocket-layout-planner-0.8B
- Dataset de planes de layout: https://huggingface.co/datasets/ysharma/klein-layout-plans
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor: `black-forest-labs/flux-3-image-klein-pup` (Apache-2.0)
- Badge ML Intern: https://hf.co/chat?mode=ml-intern
