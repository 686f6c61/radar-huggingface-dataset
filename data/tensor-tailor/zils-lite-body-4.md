# tensor-tailor/zils-lite-body-4

## Resumen

zils-lite-body-4 es un ajuste fino de tipo "decision body" desarrollado por tensor-tailor para el pool de modelos Zils `d3-lite`, asociado al subnet 127 de Bittensor. El modelo parte del chasis `vllm-sr/d3-lite`, que a su vez se construye sobre Qwen3.5-0.8B e incorpora tanto tensores de lenguaje como de vision en bf16. Con 852.985.920 parametros totales, se posiciona como un modelo pequeno orientado a tareas de decision y seleccion de opciones, no a generacion libre de texto.

La relevancia de este modelo es acotada y muy especifica: forma parte de un ecosistema de mineria competitiva donde distintos participantes entrenan variantes del mismo chasis y las promedian en un "soup" comun. Este body concreto se obtiene promediando dos cuerpos previos (thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5) y aplicando un ajuste LoRA sobre las capas 16-23 del modelo de lenguaje. El resultado es un modelo que mejora marginalmente las metricas internas del pool en tareas de decision con opciones multiples.

El interes practico para desarrolladores e investigadores es limitado fuera del contexto de Bittensor/Zils: se trata de un artefacto de mineria con licencia Apache-2.0, sin benchmarks publicos estandar y con un pipeline no declarado. Su valor radica en documentar el estado del arte del pool d3-lite en la fecha de publicacion (5 de noviembre de 2026) y en servir como referencia tecnica para quienes estudian tecnicas de model souping y destilacion en modelos de menos de 1.000 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (chasis Qwen3.5-0.8B, con tensores de lenguaje y vision) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (filas de entrenamiento limitadas a 1.024 tokens) |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del chasis `vllm-sr/d3-lite`, que a su vez se basa en Qwen/Qwen3.5-0.8B. Se trata de un transformer denso (no MoE) con 852.985.920 parametros, que incluye tensores de lenguaje y de vision. Los pesos se almacenan en bf16 y el repositorio requiere `custom_code` para su carga, lo que indica que la implementacion no es la estandar de transformers.

El entrenamiento parte del promedio uniforme en fp32 de dos cuerpos previos (thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5), construido con la herramienta `soup.build` de Zils a temperatura 1.0. Sobre esa base se aplica un LoRA de rango 16 y alpha 32, unicamente sobre las capas de lenguaje 16-23 (las 8 superiores de 24). Se usa learning rate 1e-4 con warm-up lineal de 50 pasos y decaimiento coseno, batch 16, semilla 1107, y se descartan filas de mas de 1.024 tokens. En total se usan 78.914 filas de entrenamiento (2.508 descartadas) y 15.565 de regularizacion (293 descartadas), con 5.905 pasos en una sola epoca. El LoRA se fusiona en los pesos y se guarda en bf16; el resto de tensores permanece identico al punto de partida.

La funcion de perdida combina tres terminos: entropia cruzada sobre las filas etiquetadas, divergencia KL forward respecto a las probabilidades de opcion del profesor (`vllm-sr/d3-ultra`) en las filas de destilacion, y divergencia KL respecto a las probabilidades precalculadas del modelo de partida en las filas de regularizacion. El cambio relativo de las capas de lenguaje respecto a Qwen/Qwen3.5-0.8B es de 0.041, dentro del limite de 0.15 impuesto por Zils. Los datos de entrenamiento suman 81.422 filas antes del filtro de longitud, con 17.324 preguntas de destilacion, 20.398 preguntas generadas con respuesta calculada, 11.737 de silabas, 12.000 problemas verbales, 6.246 de alcance de intencion y 13.717 decisiones procedurales tipadas.

## Capacidades

- Seleccion de opciones en tareas de decision multiple: el modelo esta disenado para puntuar opciones y elegir la mas probable, no para generar texto libre.
- Razonamiento sobre herramientas (tool choice): incluye filas de seleccion de herramienta, evaluacion de argumentos y politica de llamada a herramientas (282 filas BFCL en destilacion y generadores propios).
- Comprension de lenguaje natural en tareas de NLI multilingue, analisis de sentimiento financiero, razonamiento logico (babi_nli, ARC, HellaSwag, WinoGrande) segun las fuentes de destilacion.
- Problemas verbales aritmeticos y conteo.
- Manipulacion de silabas y formas de palabra (generador sobre el CMU Pronouncing Dictionary).
- Decisiones procedurales tipadas (tasksource-jev-typed-decisions).
- Capacidad de vision heredada del chasis Qwen3.5-0.8B (tensores de vision presentes), aunque no se documenta su uso en el entrenamiento.
- Soporte multilingue: no disponible como capacidad declarada; las fuentes de destilacion incluyen NLI multilingue, pero no se especifican idiomas de salida.
- Modo thinking, agentes multi-paso o function calling generativo: no disponible.

## Casos de uso

- Evaluacion de modelos de decision en el contexto de Bittensor subnet 127: sirve como cuerpo candidato para el pool d3-lite y permite a otros mineros comparar tecnicas de souping y LoRA sobre el mismo chasis. Es adecuado porque sigue exactamente el formato y las restricciones del pool (cambio relativo 0.041 frente al cap 0.15).
- Clasificacion de intencion en asistentes conversacionales: el modelo incorpora 6.246 filas de "intent scope" y puede puntuar opciones de intencion en un pipeline de enrutamiento, aunque su uso en produccion requeriria validacion externa.
- Seleccion de herramienta en agentes: las filas de tool choice y politica de llamada permiten integrarlo como modulo de decision previo a la ejecucion de herramientas en un agente, siempre que se valide su comportamiento fuera del conjunto de entrenamiento.
- Analisis de sentimiento en noticias financieras: las 1.314 filas de twitter-financial-news-sentiment de la destilacion lo hacen candidato para tareas de clasificacion de sentimiento, aunque no se publican metricas especificas.
- Razonamiento logico y NLI para filtrado de contenido: las fuentes babi_nli, WinoGrande y ARC permiten usarlo como clasificador de implicacion o coherencia en pipelines de moderacion, con la cautela de que no hay benchmarks publicos.
- Problemas verbales y conteo en entornos educativos: los 12.000 problemas verbales generados y 20.398 preguntas con respuesta calculada lo orientan a tareas de resolucion de problemas aritmeticos simples, aunque el contexto de 1.024 tokens limita la complejidad.
- Investigacion sobre destilacion y regularizacion KL: el modelo documenta con detalle la composicion de la perdida y las fuentes de datos, lo que lo convierte en un caso de estudio reproducible para quienes investigan tecnicas de distillation con profesores de mayor tamano.

## Benchmarks y rendimiento

El autor publica mediciones propias sobre conjuntos held-out, evaluadas con el codigo de scoring de Zils (`soup_grade.evaluate`, 5 secretos de calibracion):

| Conjunto | Este body | El start (soup del 5 nov 2026) |
|---|---|---|
| dev_v2 (3.274 items, ambos bloques) | 47.05 | 45.90 |
| dev_gold (787 items de familia conocida) | 55.21 | 52.88 |
| COMBO (dev_gold + mitad new-block de dev_v2) | 50.15 | 48.46 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son mediciones internas del autor, no el examen oficial de Zils.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB para los pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB dependiendo de la longitud de contexto y el batch.
- VRAM en cuantizacion de 8 bits: alrededor de 0,9-1,2 GB; en 4 bits, alrededor de 0,5-0,8 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para inferencia en bf16 o cuantizada. Para entrenamiento o fine-tuning adicional, se recomienda A100 o H100 por comodidad, aunque el modelo cabe en GPUs consumer de gama media.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas.
- Opciones de despliegue: el modelo requiere `custom_code`, por lo que no es directamente compatible con llama.cpp u Ollama sin conversion. vLLM y TGI son opciones plausibles si el chasis d3-lite esta soportado; no se documenta compatibilidad explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| tensor-tailor/zils-lite-body-4 | 852.985.920 | no disponible | Apache-2.0 | Decision body para pool Zils | HuggingFace, custom_code |
| thermopylae-777/zils-lite-body-2 | no disponible | no disponible | Apache-2.0 (segun card referenciada) | Body previo del mismo pool | HuggingFace |
| dasLOL/zils-lite-skills-v5 | no disponible | no disponible | Apache-2.0 | Body de otro minero con seis fine-tunes | HuggingFace |
| Qwen/Qwen3.5-0.8B | ~800M (chasis) | no disponible | no disponible en esta ficha | Modelo base de lenguaje y vision | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos mas alla de las mediciones internas del autor frente al soup de partida. La comparativa con modelos de proposito general del mismo tamano (por ejemplo, variantes de 0.5-1B) no es posible con la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decision con opciones: no esta pensado para generacion de texto libre ni para uso conversacional general; su salida es una distribucion sobre opciones.
- Sin benchmarks publicos estandar: las unicas metricas son internas del autor y no han sido verificadas de forma independiente.
- Contexto limitado en entrenamiento: las filas de mas de 1.024 tokens se descartaron, por lo que el modelo puede degradarse con entradas largas.
- Idiomas no declarados: la model card no especifica idiomas soportados; las fuentes de destilacion incluyen NLI multilingue, pero no se garantiza cobertura.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, aunque en tareas de seleccion de opciones el riesgo se manifiesta como eleccion incorrecta mas que como texto inventado.
- Sesgos heredados: el modelo parte de Qwen3.5-0.8B y de dos cuerpos entrenados por terceros con datos que el autor no ha verificado (en particular, dasLOL/zils-lite-skills-v5 uso 20 Newsgroups y Sarcasm Headlines, fuentes que el autor de esta ficha evita).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los terminos share-alike y copyleft de algunas fuentes de texto (GPL 303 filas, CC BY-SA) aplican a la redistribucion del texto fuente, no a los pesos. El repositorio contiene solo pesos.
- Dependencia de `custom_code`: requiere cargar codigo personalizado, lo que anade riesgo de seguridad y complejidad en el despliegue.
- Sin pipeline declarado: la ausencia de pipeline en HuggingFace dificulta el uso directo con las herramientas estandar.
- Fecha de creacion futura (2026-11-05): coherencia temporal a verificar segun el contexto de uso.
- Sin garantia de mantenimiento: 0 descargas y 0 likes en el momento de la consulta; el modelo no tiene validacion de la comunidad.

## Enlaces

- [HuggingFace: tensor-tailor/zils-lite-body-4](https://huggingface.co/tensor-tailor/zils-lite-body-4)
- [Modelo base: thermopylae-777/zils-lite-body-2](https://huggingface.co/thermopylae-777/zils-lite-body-2)
- [Modelo base: dasLOL/zils-lite-skills-v5](https://huggingface.co/dasLOL/zils-lite-skills-v5)
- [Chasis: vllm-sr/d3-lite](https://huggingface.co/vllm-sr/d3-lite)
- [Modelo base original: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Profesor de destilacion: vllm-sr/d3-ultra](https://huggingface.co/vllm-sr/d3-ultra)
- [Dataset de respuestas: zils-ai/zils-relay-answers](https://huggingface.co/datasets/zils-ai/zils-relay-answers)
- [Dataset de decisiones: tasksource/tasksource-jev-typed-decisions](https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions)
- [Organizacion tasksource en HuggingFace](https://huggingface.co/tasksource)
