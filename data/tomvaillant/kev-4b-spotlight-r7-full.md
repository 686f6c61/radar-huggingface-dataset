# tomvaillant/kev-4b-spotlight-r7-full

## Resumen

Kev 4B for Spotlight (r7, pesos completos) es un fine-tune de decisión de 4.205.751.296 parámetros desarrollado por el usuario de HuggingFace `tomvaillant` para Spotlight, la herramienta de investigación OSINT de Buried Signals. No es un modelo generativo: recibe un documento (el «estado») y un conjunto fijo de preguntas tipadas, y devuelve en una sola pasada una distribución de probabilidad calibrada sobre las opciones disponibles. En concreto, evalúa cada «lead» de investigación (un resumen, el pasaje fuente del que procede y el brief de investigación) respondiendo a preguntas sobre la fuente y la afirmación, de modo que Spotlight pueda marcar leads débiles y elevar pistas para el periodista.

El modelo parte de `jaredpalmer/kev-4b`, que a su vez se construye sobre `Qwen/Qwen3.5-4B-Base`, y conserva la arquitectura de Kev: un backbone adaptado con LoRA (aquí ya fusionada) más una cabeza pointer que puntúa las opciones de respuesta. Se sirve con `kev serve` y está pensado para ejecutarse localmente dentro del modo Ninja de Spotlight, en inglés y sobre organizaciones y las personas que las dirigen.

Su relevancia es acotada pero concreta: es un ejemplo de modelo de decisión pequeño, desplegable en un portátil Apple Silicon (11,3 GB de pico sirviendo), especializado en triage periodístico y con métricas declaradas sobre leads reales. El checkpoint r7 es, además, el que se publicó finalmente porque el candidato posterior (interpolación de las rondas 7 y 9) falló en la métrica de falsas pistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B-Base) con adaptación LoRA fusionada y cabeza pointer que puntúa opciones; inferencia en una sola pasada sin generación de texto |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Checkpoint en bf16 (redondeado una vez desde fp32); no se documentan otras cuantizaciones (GGUF, GPTQ, AWQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (dos shards en bf16), `config.json`, `head.pt` (cabeza pointer y metadatos), `merge.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo no genera lenguaje. Reutiliza el backbone de `Qwen3.5-4B-Base` con la arquitectura propia de la familia Kev: un backbone adaptado mediante LoRA al que se añade una cabeza pointer que asigna puntuaciones a las opciones de cada pregunta, produciendo una distribución de probabilidad calibrada en un único forward pass. El adaptador r7 es la continuación de las rondas r1 a r6 de Spotlight, todas partiendo de `kev-4b`. Tras el entrenamiento, el adaptador se fusionó en el modelo base en fp32 y se redondeó una sola vez a bf16 con `scripts/merge_lora_checkpoint.py`, dejando constancia de los hashes de origen en `merge.json`.

El entrenamiento consistió en una época con learning rate 1e-5 sobre 712 registros más 400 registros del «decision replay» v7 propio de Kev, ejecutado en una sola H100 con el trainer de Kev en el commit `2074cc44`. Aproximadamente 415 de los 712 registros son leads sintéticos escritos por un modelo profesor a través de OpenRouter para las clases débiles: alegaciones («X dice», «X alega»), cómo afecta un lead al brief (supports, complicates, contradicts, unrelated), resúmenes que alteran un valor y cadenas de fuentes débiles como directorios y agregadores. Todos los leads sintéticos usan organizaciones y personas ficticias, cada fila fue revisada a ciegas por dos etiquetadores independientes y solo se conservó si ambos coincidían con la etiqueta prevista o si una regla escrita de etiquetado lo resolvía. El resto es replay de la mezcla de r6, incluidos falsos positivos duros y etiquetas sobre leads reales recolectados. Todo el conjunto se cotejó contra los casos privados de aceptación de Spotlight con solapamiento cero.

## Capacidades

- Clasificación de la fuente de un lead en seis categorías: `primary_record`, `original_reporting`, `secondary`, `interested_party`, `user_generated`, `unclear`.
- Clasificación de la naturaleza de la afirmación: `asserted`, `reported_claim`, `interpretation`.
- Clasificación del estado del hecho: `done`, `decided_not_done`, `proposed_or_offered`, `not_established`, `no_event`.
- Comprobación de fidelidad entre el resumen y el pasaje fuente: `faithful`, `widens`, `contradicts`, `unsupported`.
- Evaluación de la relación del lead con el brief de investigación: `supports`, `complicates`, `contradicts`, `unrelated`.
- Probabilidad de «sí» para la aparición de un actor nuevo (c2) y para un cambio relevante (c3).
- Detección de conflicto entre dos leads sobre un mismo atributo: `agree`, `differ_but_compatible`, `conflict`, `not_comparable`.
- Consistencia por doble orden: Spotlight formula cada pregunta de elección en dos órdenes de opciones y solo acepta la respuesta cuando ambas coinciden.
- Ejecución local sin generación de texto, adecuada para entornos con requisitos de privacidad.
- No documentado: tool calling, function calling, comportamiento agéntico, capacidades multimodales (visión o audio), modo «thinking», ni soporte multilingüe más allá del inglés.

## Casos de uso

- Triage de leads OSINT en una redacción: el modelo puntúa cada lead recolectado por las «research lanes» de Spotlight y permite descartar de forma automática los que no aportan, reduciendo el volumen que llega a revisión humana (0 leads apartados erróneamente en la mitad dev del conjunto de evaluación).
- Marcado de fuentes débiles: clasificar un lead como `interested_party`, `user_generated` o `unclear` permite al periodista priorizar los que provienen de registros primarios o de reportaje original antes de invertir tiempo en verificación.
- Control de fidelidad en resúmenes automáticos: comparar el resumen generado con el pasaje fuente y detectar `widens`, `contradicts` o `unsupported`; útil como filtro de calidad en pipelines de resumen documental, teniendo en cuenta que aproximadamente un tercio de los resúmenes que amplían su fuente pasa el filtro.
- Detección de actores nuevos en un brief: la probabilidad de «sí» en c2 señala leads que introducen personas u organizaciones no contempladas, lo que ayuda a decidir cuándo ampliar el perímetro de la investigación.
- Detección de contradicciones entre leads: la pregunta c4 compara dos leads sobre un mismo atributo y devuelve `conflict` o `differ_but_compatible`, lo que sirve para construir una cola de discrepancias que el periodista resuelve manualmente.
- Verificación de estado de una afirmación: distinguir entre `done`, `proposed_or_offered` y `not_established` evita publicar como hecho consumado algo que solo fue una propuesta.
- Despliegue en local para material sensible: al ejecutarse dentro de Spotlight con `kev serve` y consumir 11,3 GB de pico en un Mac, encaja en flujos donde los documentos no pueden salir a una API en la nube.
- Filtro previo en pipelines de revisión documental: como capa de decisión de bajo coste antes de un modelo generativo mayor, clasificando evidencia y descartando ruido.

## Benchmarks y rendimiento

Evaluación principal sobre la mitad dev (85 leads) de un conjunto nuevo de 174 leads reales sobre diez organizaciones ausentes del entrenamiento, etiquetados por dos etiquetadores ciegos más reglas escritas:

| Medida | r7 | Objetivo |
|---|---|---|
| Falsas pistas por 100 leads | 1,2 | menos de 5 |
| Cobertura de pistas (clue recall) | 0,75 | al menos 0,8 |
| Fallos visibles detectados | 0,77 | al menos 0,6 |
| Leads apartados erróneamente | 0 | 0 |

Sobre la mitad dev de los casos de aceptación de Spotlight (dos casos reales privados y los sintéticos públicos):

| Medida | r7 | Objetivo |
|---|---|---|
| Falsas pistas por 100 leads | 4,0 | no disponible |
| Fallos visibles detectados | 0,78 | no disponible |
| Cobertura de pistas (clue recall) | 1,0 | no disponible |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni una puntuación sellada sobre el conjunto held-out: la mitad reservada se gastó en un candidato posterior (interpolación de las rondas 7 y 9), que falló con 13,5 falsas pistas por 100 leads, por lo que r7 se publicó con sus cifras de dev. Se documenta además que el redondeo a bf16 hace que 2 de 140 respuestas sobre 20 leads cambien respecto al checkpoint sin fusionar, con un desplazamiento máximo de probabilidad de 0,07.

## Requisitos de hardware

- Tamaño del repositorio: 8,4 GB (dos shards bf16 más `head.pt`).
- Memoria pico sirviendo: 11,3 GB en un Mac (carga más 20 peticiones, medida con `/usr/bin/time -l`).
- Primera ejecución desde el Hub, con descarga y carga en el mismo proceso: 15,0 GB de pico.
- Checkpoint LoRA sin fusionar: 16,7 GB de pico.
- Cabe en Apple Silicon con memoria unificada suficiente (los picos medidos van de 11,3 a 15,0 GB); en GPU consumer de 24 GB como la RTX 4090 los pesos bf16 de 8,4 GB dejarían margen, aunque no se han publicado medidas en GPU.
- GPU de entrenamiento: una H100, una época.
- Despliegue: runtime propio `kev` (`uv run python -m kev.serve --run tomvaillant/kev-4b-spotlight-r7-full@<revision>`), con carga vía MLX en bf16 en Apple silicon.
- No documentado: compatibilidad con vLLM, llama.cpp, TGI u Ollama. La presencia de una cabeza pointer en `head.pt` y un formato de checkpoint propio hace que estos runtimes genéricos no sean aplicables según la información disponible.
- Latencia y throughput: no disponibles; solo se publica el pico de memoria sobre 20 peticiones, sin cifra de tiempo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-4b-spotlight-r7-full | 4.205.751.296 | No disponible | Triage de leads OSINT para Spotlight | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| kev-4b | No disponible (construido sobre Qwen3.5-4B-Base) | No disponible | Modelo de decisión general: clasificar, enrutar, puntuar opciones | Apache 2.0 (según la model card de r7) | HuggingFace, GitHub y OpenRouter |
| Qwen3.5-4B-Base | 4B (por denominación; cifra exacta no disponible) | No disponible | Modelo base generativo de texto | Apache 2.0 (según la model card de r7) | HuggingFace |
| Otro fine-tune especializado en triage OSINT | No disponible | No disponible | No disponible | No disponible | No se ha identificado ninguno en la búsqueda |

La diferencia funcional frente a `Qwen3.5-4B-Base` es cualitativa: el modelo base genera texto libre, mientras que r7 devuelve distribuciones calibradas sobre opciones cerradas en una sola pasada y con un conjunto de preguntas fijado por el banco de decisiones de Spotlight. Frente a `kev-4b`, r7 añade el dominio concreto del periodismo de investigación y las siete preguntas del flujo de Spotlight.

## Limitaciones y advertencias

- La cobertura de pistas está por debajo del objetivo (0,75 frente a 0,8): el modelo se pierde la mayoría de leads que complican el brief, como un antiguo cargo o una segunda persona que dirige la operación diaria, y los etiqueta como `supports` o `unrelated`.
- Aproximadamente un tercio de los resúmenes que amplían su pasaje fuente pasan como fieles (12 de 22 detectados en la mitad dev), por lo que no debe usarse como único control de fidelidad.
- No existe puntuación sellada sobre held-out para este checkpoint; las cifras publicadas son de dev y el candidato posterior falló en falsas pistas.
- Las alegaciones y los valores en conflicto apenas aparecen en leads reales, así que esas dos clases de fallo solo se han probado con datos sintéticos.
- Los leads de evaluación se obtuvieron vía búsqueda de Firecrawl porque los motores SearXNG locales estaban limitados por rate limit, y casi todos son snippets de búsqueda; en producción Spotlight busca con SearXNG, de modo que las entradas reales serán algo distintas.
- El redondeo a bf16 altera 2 de 140 respuestas sobre 20 leads, con un desplazamiento máximo de probabilidad de 0,07 respecto al checkpoint sin fusionar.
- Está construido para leads de investigación en inglés sobre organizaciones y sus responsables; no hay soporte documentado de otros idiomas.
- Es una ayuda al triage para un periodista: sus respuestas no son hechos verificados y no deben presentarse como tales.
- Riesgo de sesgo derivado del etiquetado: parte de los datos son sintéticos, generados por un modelo profesor y filtrados por dos etiquetadores humanos con reglas escritas; los criterios de Spotlight son privados y no auditables externamente.
- Uso comercial: la licencia Apache 2.0 lo permite, pero se mantienen las condiciones de los modelos de los que deriva (`kev-4b` y `Qwen3.5-4B-Base`).
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomvaillant/kev-4b-spotlight-r7-full
- Modelo base Kev 4B: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de Kev (trainer y servidor): https://github.com/jaredpalmer/kev
- Spotlight, herramienta OSINT de Buried Signals: https://github.com/buriedsignals/spotlight
- Ficha de Kev 4B en OpenRouter: https://openrouter.ai/jaredpalmer/kev-4b
- Ficha técnica de Kev 4B en Vertical Tabs: https://verticaltabs.com/jaredpalmer/kev-4b
- Colección Kev en HuggingFace: https://huggingface.co/collections/jaredpalmer/kev
