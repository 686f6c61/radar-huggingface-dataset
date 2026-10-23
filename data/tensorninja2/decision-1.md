# tensorninja2/decision-1

## Resumen

`decision-1` es un adaptador de decisión para el modelo base Qwen3.8-27B, desarrollado por el usuario tensorninja2 y publicado bajo licencia Apache-2.0. No es un modelo generativo al uso: combina un adaptador LoRA (rango 16, alpha 32) con una cabeza de puntero (*pointer head*) que lee un estado textual y un conjunto de preguntas tipadas, y devuelve una probabilidad calibrada para cada opción. La inferencia se resuelve únicamente en la fase de prefill, sin generar ni un solo token de texto, lo que reduce la latencia a decenas de milisegundos.

El modelo se distribuye como un fichero `.ninfer` de 89.716.300 bytes (SHA-256 `14015d18…341a39`) y solo puede servirse con el motor NInfer-4090 del mismo autor, que expone dos protocolos sobre el mismo proceso y los mismos pesos: OpenAI Decisions (`POST /v1/decisions`, compatible con el SDK de OpenAI 3.26.0 o superior) y TypeSafe System One (`POST /typesafe/v1/systemone`, para el SDK TypeSafe 0.6 y 0.7). No es un fichero PEFT, de Transformers ni GGUF, lo que condiciona por completo su adopción.

Su relevancia actual está en el nicho de los modelos de decisión ligeros y calibrados que sustituyen a llamadas de clasificación con LLM generativo: en la partición de test bloqueada del corpus decision-v7 alcanza una precisión de 0,856 con un ECE de 0,020, y el autor lo integra como motor de decisión de su agente de código Caudra. Es un artefacto muy reciente (creado el 22 de octubre de 2026), con cero descargas y un único *like*, sin validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de decisión sobre Qwen3.8-27B: LoRA (rango 16, alpha 32) + cabeza de puntero de 256 dimensiones sobre el hidden state tras la final-norm (anchura 5.120). El base incluye capas Gated DeltaNet además de atención estándar (el LoRA se aplica también a la salida de Gated DeltaNet) |
| Parametros totales | Base Qwen3.8-27B: 27.000 millones (según denominación del modelo). Adaptador: fichero de 89.716.300 bytes |
| Parametros activos | No aplica (no es MoE); no disponible |
| Longitud de contexto | 32.768 tokens con caché KV en BF16 en el ejemplo de despliegue del autor; los modos de KV rotado incluyen una variante `rk4v4` de 262K de contexto |
| Tipos de cuantizacion | Entrenamiento QLoRA sobre base cuantizado en NF4; en servicio se admite KV en `bf16` e `int8` (los únicos que cumplen la tolerancia por pregunta) y modos de KV rotado (`rk4v4`, 262K). La cuantización de los pesos del artefacto NInfer no se publica |
| Idiomas soportados | No disponible (la model card no declara idiomas; el entrenamiento fue sobre corpus en texto, idioma no especificado) |
| Licencia | Apache-2.0 para el adaptador y la cabeza; el base Qwen3.8-27B es Apache-2.0; los datasets del corpus decision-v7 conservan sus propias licencias |
| Formato de pesos | `.ninfer` (`decision-1.lora.ninfer`); explícitamente no es PEFT, Transformers ni GGUF |

Otros parámetros relevantes:

| Parametro | Valor |
|---|---|
| Temperatura de calibración | 1,414 |
| Capas objetivo del LoRA | query, output gate, key, value, attention output, Gated DeltaNet output, MLP down projection |
| Cabeza de puntero | Proyecciones query y key de 256 dimensiones sobre hidden state de anchura 5.120 |
| Carga de adaptadores | `--lora-slots 2` (dos ranuras simultáneas) |
| Tarea declarada (pipeline) | text-classification |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.8-27B, un transformer con capas de atención clásica y capas Gated DeltaNet (atención lineal con compuertas), a juzgar por los módulos que el LoRA modifica: query, key, value, output gate, attention output, Gated DeltaNet output y la proyección down del MLP. El LoRA tiene rango 16 y alpha 32, y se acompaña de una cabeza de puntero que proyecta el hidden state de anchura 5.120, tras la normalización final, en dos vectores de 256 dimensiones (query y key por pregunta y por opción). La decisión se obtiene comparando esas proyecciones y aplicando una temperatura fija de 1,414, sin decodificación autoregresiva: todo el cálculo ocurre en el prefill, lo que explica la latencia de decenas de milisegundos.

El entrenamiento consistió en QLoRA más la cabeza de puntero sobre Qwen3.8-27B cuantizado en NF4, durante una sola época sobre la partición de entrenamiento del corpus decision-v7, dentro del repositorio `llm-datasets`. La conversión del directorio PEFT y la cabeza a formato `.ninfer` se hizo con `tools/convert/qwen3_8_27b/convert_lora.py --decision-head`. No se documentan en la información disponible el volumen de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO; tampoco se describe ninguna innovación de decodificación especulativa, ya que el modelo no decodifica.

## Capacidades

- Evaluación de predicados binarios: dada una frase y una instrucción del tipo «¿este mensaje trata de facturación?», devuelve una probabilidad calibrada (0,939 en el ejemplo del autor).
- Preguntas de tipo `choice`: selección entre varias opciones con distribución de probabilidad (0,913 de precisión en la partición de test).
- Preguntas de tipo `noul` (respuesta única sin elección explícita): 0,929 de precisión en test, el tipo con mejor rendimiento.
- Preguntas de tipo `score`: puntuación numérica o graduada, el tipo más débil (0,596 de precisión en test).
- Salida estructurada por pregunta, con probabilidad individual por opción; no genera texto libre ni justificaciones.
- Soporte de dos protocolos de servicio: OpenAI Decisions (`/v1/decisions`) y TypeSafe System One (`/typesafe/v1/systemone`), con resolución de `jev-latest` al único adaptador de decisión del servidor.
- Integración con agentes: el agente de código Caudra lo usa para consejo de permisos, cribado en modo Auto, predicción del efecto de comandos de shell, cribado de contenido de resultados de herramientas, enrutado de subagentes y reranking; expone `decisions.decide()` y `decisions.rerank()` dentro de fragmentos de código.
- Reutilización de la misma instancia y los mismos pesos que el modelo de chat servido, con recarga de KV cacheada para amortizar el coste entre preguntas.
- Capacidad multimodal: NInfer acepta imágenes en OpenAI Decisions, pero no hay precisión ni calibración establecidas para este adaptador en tareas de imagen.
- Sin detección de rechazo (*refusal detection*): no implementa esa funcionalidad.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Clasificación de tickets de soporte con umbral calibrado**: enviar el texto del ticket como `state` y una pregunta `predicate` por categoría (facturación, incidencia técnica, cancelación). Como la salida es una probabilidad calibrada (ECE 0,020 en test), se pueden fijar umbrales de derivación a humano sin recalibrar y resolver la mayoría de casos en unos 25 ms por pregunta.
- **Enrutado de subagentes en un agente de código**: usar preguntas `choice` para decidir qué subagente debe atender una tarea (búsqueda en repositorio, ejecución de tests, refactor), aprovechando que la decisión se resuelve en prefill y comparte proceso con el modelo de chat, sin una segunda instancia ni una llamada de red adicional.
- **Cribado de contenido de resultados de herramientas**: antes de inyectar en el contexto del agente la salida de un comando o una respuesta HTTP, evaluar predicados sobre contenido peligroso, credenciales expuestas o datos personales. La latencia de ~100 ms para seis preguntas permite aplicar varios predicados en paralelo sobre el mismo estado cacheado.
- **Consejo de permisos y predicción de efectos de comandos de shell**: clasificar si un comando va a modificar ficheros, tocar la red o requerir privilegios, y devolver la probabilidad de cada efecto para que el agente pida confirmación solo por encima de un umbral. Es exactamente el uso que Caudra hace del modelo según la model card.
- **Reranking de candidatos**: emplear `decisions.rerank()` para reordenar resultados de búsqueda o propuestas de parche con una puntuación probabilística, en lugar de un cross-encoder dedicado, reutilizando la misma caché KV del estado.
- **Moderación y guardrails en pipelines de CI/CD**: integrar el endpoint `/v1/decisions` como paso de un job que marque issues, pull requests o mensajes de commit según predicados configurables (¿incluye datos sensibles?, ¿es una petición de cambio de licencia?), con la ventaja de no generar texto y, por tanto, no exponer contenido sintético en los logs.
- **Screening en modo automático de agentes**: decidir si una acción propuesta puede ejecutarse sin intervención humana, con una probabilidad explícita y auditable en lugar de una respuesta binaria de un LLM generativo.

## Benchmarks y rendimiento

Evaluación sobre las preguntas claramente resolubles del corpus decision-v7, con KV en BF16; la partición de test bloqueada se puntuó una sola vez.

| Split | Preguntas | Accuracy | Brier | NLL | ECE |
|---|---:|---:|---:|---:|---:|
| Development | 1.264 | 0,871 | 0,184 | 0,356 | 0,024 |
| Test bloqueado | 1.200 | 0,856 | 0,190 | 0,355 | 0,020 |

Precisión por tipo de pregunta en la partición de test:

| Tipo de pregunta | Accuracy |
|---|---:|
| `noul` | 0,929 |
| `choice` | 0,913 |
| `score` | 0,596 |

## Requisitos de hardware

- **VRAM del adaptador**: 89,7 MB (fichero `.ninfer`). La VRAM del artefacto NInfer del base Qwen3.8-27B no se publica.
- **GPU validadas**: el autor reporta ejecución en una RTX 4090 (24 GB, sm_89) con el binario `build-sm89`; implica que el artefacto del base cabe en 24 GB, pero no se documenta la cuantización de pesos empleada.
- **Otras GPU**: no hay datos publicados para A100, H100 ni GPU de menor VRAM.
- **Cabe en GPU de consumo**: sí, al menos en RTX 4090 según el autor; no se documentan otras.
- **Motor de despliegue**: exclusivamente NInfer-4090 (`ninfer-serve`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, y el fichero no es PEFT, Transformers ni GGUF. Requiere descargar además el artefacto `tensorninja2/Qwen3.8-27B-NInfer`.
- **Comando de referencia**: `./build-sm89/apps/ninfer-serve models/qwen3_8_27b.ninfer --kv-dtype bf16 --max-context 32768 --lora-dir lora --lora-slots 2`.
- **Latencia**: en RTX 4090 con estado cacheado, ~25 ms para una pregunta y ~100 ms para seis preguntas, con KV en BF16.
- **Throughput**: no disponible (no se publican peticiones por segundo ni concurrencia soportada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy dev | Accuracy test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| decision-1 | 27B (base) + adaptador de 89,7 MB | 32.768 (BF16); hasta 262K con KV rotado `rk4v4` | 0,871 | 0,856 | Apache-2.0 | Solo motor NInfer-4090 |
| Kev-27B | 27B (base) | No disponible | 0,866 | 0,870 | No disponible | Adapta todas las capas lineales; entrenado sobre un superconjunto de estos datos |
| Qwen3.8-27B (base, sin adaptador) | 27B | No disponible | No disponible | No disponible | Apache-2.0 | Público en HuggingFace |

Kev-27B es el único comparable con datos numéricos en la información proporcionada: pierde 0,005 puntos de accuracy en development y gana 0,014 en test frente a `decision-1`, con la salvedad de que adapta todas las capas lineales y se entrenó sobre un superconjunto del corpus. No se dispone de comparaciones con modelos de decisión propietarios (OpenAI, TypeSafe) más allá de la advertencia del autor de que este adaptador no reproduce sus salidas ni su calibración.

## Limitaciones y advertencias

- **Dependencia total del motor NInfer-4090**: el adaptador no funciona en Transformers, PEFT, llama.cpp, vLLM ni Ollama. La portabilidad es nula fuera del stack del autor.
- **Tipo `score` poco fiable**: 0,596 de precisión en test frente a 0,913 en `choice` y 0,929 en `noul`; no conviene usar preguntas graduadas sin un umbral conservador.
- **Modos de KV rotado**: solo `bf16` e `int8` cumplen la tolerancia por pregunta; los modos rotados, incluido `rk4v4` de 262K de contexto, fallan el listón de probabilidad en algunas preguntas. La ventana larga, por tanto, no está garantizada en calibración.
- **Sesgos conocidos**: no disponible; la model card no documenta análisis de sesgo ni composición del corpus de entrenamiento.
- **Riesgo de alucinación**: bajo en el sentido generativo (no produce texto), pero las probabilidades pueden ser erróneas o estar mal calibradas en dominios alejados de decision-v7; el propio autor advierte que no reproduce la calibración de los modelos de decisión alojados de OpenAI o TypeSafe.
- **Sin detección de rechazo**: no implementa `refusal detection`, por lo que no debe usarse como única barrera de seguridad.
- **Multimodalidad no validada**: aunque el protocolo acepta imágenes, no hay precisión ni calibración establecidas para tareas de imagen.
- **Idiomas no declarados**: no se especifica en qué idiomas se entrenó; el ejemplo de la model card está en inglés. No hay garantía para castellano.
- **Temperatura fija de 1,414**: la calibración reportada está ligada a ese valor; alterarlo invalida las métricas de Brier, NLL y ECE publicadas.
- **Madurez**: modelo creado el 22 de octubre de 2026, 0 descargas, 1 like y ningún tercero independiente que haya replicado la evaluación. Todo el soporte depende de un único autor.
- **Licencias**: adaptador y base son Apache-2.0, lo que permite uso comercial, pero los datasets del corpus decision-v7 conservan sus propias licencias y hay que verificarlas antes de un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tensorninja2/decision-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artefacto NInfer del base: https://huggingface.co/tensorninja2/Qwen3.8-27B-NInfer
- Repositorio del motor NInfer-4090 (protocolos, latencias y límites): https://github.com/tensorninja/ninfer-4090
- Sección de decisiones de NInfer-4090: https://github.com/tensorninja/ninfer-4090#decisions-openai-and-typesafe-system-one
- Integración con Caudra: https://github.com/tensorninja/ninfer-4090#use-it-from-caudra
- Caudra (agente de código): https://caudra.ai
- Corpus kev (decision-v7): https://github.com/jaredpalmer/kev
