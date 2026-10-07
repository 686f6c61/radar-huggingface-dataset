# tt-hous/laya-typed-decisions-p150

## Resumen

`tt-hous/laya-typed-decisions-p150` es un paquete de despliegue para hardware Tenstorrent Blackhole del modelo `convaiinnovations/laya-typed-decisions`. No es un modelo generativo: se trata de un encoder ModernBERT-large de 421 millones de parámetros con una cabeza de decisión de 2 capas que responde preguntas tipadas (elección, puntuación y "noul") en una sola pasada hacia delante, devolviendo probabilidades calibradas. El autor del paquete es el usuario de Hugging Face `tt-hous`, mientras que el modelo subyacente lo desarrolla convaiinnovations, con la revisión de pesos `e929ae5c` como referencia.

El modelo resuelve el problema de tomar decisiones estructuradas y trazables sobre un estado textual (por ejemplo, el log de un agente o el expediente de una incidencia), en lugar de generar prosa. Trabaja con una ventana de contexto de 1024 tokens y un presupuesto de cabeza de 256 tokens, y está entrenado y evaluado únicamente en inglés. Su relevancia actual radica en que permite ejecutar inferencia de clasificación con latencias de decenas de milisegundos y decenas de decisiones por llamada sobre un único chip Blackhole p150, con una API HTTP propia compatible con clientes laya y Jev existentes.

El paquete se distribuye como imagen Docker mediante `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1) y se marca explícitamente como "experimental community bring-up". El repositorio tiene 0 descargas y 0 likes, un tamaño de 0,9 GB, licencia Apache 2.0 y fecha de creación en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large encoder (28 capas, 1024 hidden, GeGLU, dual-theta RoPE, una capa de atención global por cada tres) más cabeza de decisión de 2 capas con scorer de marcadores de opción y act head |
| Parametros totales | 421 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens; presupuesto de cabeza (`head_max_len`) de hasta 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés; el uso con entrada no inglesa está declarado fuera de alcance |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en la información; los pesos se descargan del repositorio `convaiinnovations/laya-typed-decisions`, revision `e929ae5cf69bc34259cd2f95c9e91145b818b1f0`, a la caché de Hugging Face (no van dentro de la imagen Docker) |
| Hardware objetivo | Tenstorrent Blackhole p150 y p150x4 |
| Perfiles de servicio | `p150` (por defecto, malla P150) y `p150x4` (malla P150x4) |
| Pipeline declarado | text-classification |
| Herramienta de empaquetado | tt-model-manager 0.1.0, esquema de manifiesto 5.1 |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ModernBERT-large con una cabeza de decisión específica. El encoder consta de 28 capas con dimensión oculta de 1024, activación GeGLU, RoPE de doble theta y un patrón de atención que intercala una capa de atención global por cada tres capas. Sobre esa representación se añade una cabeza de 2 capas que incluye un scorer de marcadores de opción y una "act head". El modelo completo tiene 421 millones de parámetros y no genera texto en ningún caso: cada pasada produce una respuesta tipada con probabilidades calibradas.

El paquete documenta que laya-typed-decisions es un fine-tune de Laya sobre la partición de entrenamiento `LocalLLaMA/typed-decisions`. La información disponible no detalla el número de tokens de entrenamiento, la composición completa del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card remite a la tarjeta del modelo original para los detalles de licencia, entrenamiento y evaluación, por lo que esos datos no están disponibles en la fuente consultada. El modelo soporta tres tipos de pregunta: `choice`, `score` y `noul`.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo `choice`, `score` y `noul` en una sola pasada hacia delante, con probabilidades calibradas en lugar de texto generado.
- Puntuación numérica: la modalidad `score` devuelve una puntuación (el paquete reporta un MAE de 0,244 en el conjunto de test de typed-decisions).
- Procesamiento por lotes: el endpoint `/v1/systemone/batch` acepta de 1 a 64 estados que comparten un mismo conjunto de preguntas.
- Gestión de estados largos: aplica un presupuesto de 1024 tokens al estado y de 256 tokens a la cabeza, con recuento de tokens descartados (`state_tokens_dropped`) y marcas de truncado en la respuesta.
- Observabilidad de inferencia: cada respuesta incluye las cabeceras `X-Inference-Time-Ms`, `X-Laya-Device-Ms` y `X-Laya-Batch`.
- Integración con agentes laya: el paquete incluye `shim/laya_tt_backend.py`, que instala un `TtBackend` en un agente laya basado en pip y redirige `agent.model.forward` al endpoint `/v1/forward` del servidor (disponible porque `LAYA_RAW_FORWARD=1`).
- Compatibilidad de cliente: los clientes existentes de laya y Jev funcionan cambiando la URL base.
- Demo integrada: se sirve una página de demostración en `/demo/`.
- Comprobación de salud: `GET /v1/health` informa del backend, la precisión, la malla, los buckets y la comprobación de sanidad de arranque, seleccionada mediante la variable `LAYA_SANITY_REFERENCE` contra `server/sanity_reference_typed_decisions.json`.
- No soporta: generación de texto, entrada en idiomas distintos del inglés ni tool calling/function calling (no se mencionan en la documentación disponible).

## Casos de uso

- Observabilidad de trazas de agentes: el modelo puede clasificar y puntuar decisiones dentro de trazas de agentes (por ejemplo, decidir si un paso es correcto, ambiguo o fallido) gracias a que responde preguntas tipadas sobre un estado textual de hasta 1024 tokens y devuelve probabilidades calibradas en lugar de texto libre.
- Atención al cliente: permite etiquetar y priorizar conversaciones o incidencias con preguntas de tipo `choice` y `score` en lotes de hasta 64 estados por llamada, lo que encaja con colas de tickets que comparten un mismo conjunto de criterios.
- Procesamiento de facturas: la modalidad `choice` permite decidir entre categorías predefinidas (por ejemplo, tipo de gasto o necesidad de revisión manual) y la modalidad `score` asignar una puntuación de riesgo o confianza, con umbral controlado mediante `min_confidence`.
- Gestión de incidentes de seguridad: el modelo puede clasificar un incidente descrito en texto y puntuar su severidad, integrándose en un flujo automatizado que consuma el endpoint `/v1/systemone` y use las cabeceras de latencia para monitorizar el servicio.
- Moderación y triaje de contenido: con precisión reportada de 0,953 en AG News y 0,595 en DAIR Emotion al presupuesto de 1024/256, puede emplearse para clasificación temática y detección de emociones en inglés.
- Enrutado de decisiones en pipelines internos: al devolver una respuesta estructurada por identificador de pregunta, se puede usar como componente de decisión dentro de un orquestador que combine varias preguntas sobre el mismo estado en una sola llamada.
- Evaluación de calidad de trazas a escala: con 203 a 249 preguntas por segundo en un p150 (309 a 936 en p150x4), es adecuado para reprocesar grandes volúmenes de trazas almacenadas.
- Despliegue en el borde o en servidores con aceleradores Tenstorrent: el paquete se sirve como imagen Docker con perfiles `p150` y `p150x4`, lo que facilita su instalación en infraestructura Blackhole existente sin depender de GPU convencionales.

## Benchmarks y rendimiento

Conjunto de test de typed-decisions (400 casos, 2.000 decisiones, `max_len` 1024 / `head_max_len` 256):

| Metrica | p150 (este paquete) | Publicado por los autores | CPU fp32 en el mismo host |
|---|---|---|---|
| Accuracy | 0,764 | 0,766 | 0,766 |
| Soft accuracy | 0,469 | 0,471 | 0,471 |
| Brier | 0,062 | 0,062 | 0,061 |
| ECE | 0,214 | 0,213 | 0,213 |
| Score MAE | 0,244 | 0,242 | 0,242 |

Suites adicionales (presupuesto 1024/256, el autor publica estos conjuntos solo para el checkpoint en inglés):

| Suite | p150 (este paquete) | Publicado por los autores |
|---|---|---|
| AG News (accuracy) | 0,953 | 0,950 |
| DAIR Emotion (accuracy) | 0,595 | 0,595 |

Latencia por llamada (mediana del cliente, en caliente, protocolo `bench_latency` de los autores), p150 frente a Tesla T4 del checkpoint en inglés:

| Preguntas por llamada | p150 (ms) | Tesla T4 (ms) | Forward en dispositivo p150 (ms) |
|---|---|---|---|
| 1 | 10,8 | 39,5 | 9,2 |
| 5 | 24,5 | 84,5 | 22,7 |
| 10 | 42,9 | 158,6 | 40,3 |
| 50 | 197,6 | 771 | 191,9 |

Rendimiento por lotes (`/v1/systemone/batch`): entre 203 y 249 preguntas por segundo en un p150; entre 309 y 936 en el perfil p150x4; la referencia en T4 es de 103 a 332.

Estados largos que alcanzan el bucket de 1024 tokens (filas de 750 tokens, servidas en host): 23,9 / 99,0 / 183,2 / 305,6 ms para 1 / 5 / 10 / 16 preguntas.

Las mediciones corresponden a la build 2 (imagen `tt-model/laya-typed-decisions-p150:a4c8f7eecc1b`, código sha256 `7b36a18faed4998a61c5c6e355eb2bd62cdd9ca9f8ec408bf489b6c30def831b`); las builds 3 y 4 mantienen el mismo código.

## Requisitos de hardware

- Hardware objetivo: un chip Tenstorrent Blackhole p150 (perfil `p150`) o cuatro (perfil `p150x4`). El modelo está empaquetado para esta plataforma, no para GPU convencionales.
- VRAM estimada en GPU equivalente (estimación a partir de los 421 M de parámetros): aproximadamente 1,7 GB en fp32, 0,85 GB en fp16/bf16 y 0,42 GB en int8. Estas cifras son estimaciones derivadas del recuento de parámetros y no aparecen publicadas en la información disponible.
- GPU de referencia empleada por los autores: Tesla T4, con latencias entre 3,7x y 3,9x superiores a las del p150 para 1 y 50 preguntas.
- GPU consumer: por tamaño, el modelo cabría con holgura en cualquier GPU consumer con 4 GB o más de memoria, pero la información disponible no documenta una ruta de despliegue soportada sobre CUDA más allá de la referencia de comparación con T4.
- Opciones de despliegue documentadas: `tt` (CLI de Tenstorrent) con `tt model pull` y `tt serve`, o `tt-model pull` / `tt-model serve` sin el CLI. El paquete descarga la imagen Docker y los pesos, compila kernels en el primer arranque (varios minutos) y expone un servidor HTTP en el puerto 20000 (o el siguiente libre).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La API no es compatible con el formato de chat de OpenAI: expone los endpoints propios `/v1/systemone`, `/v1/systemone/batch`, `/v1/forward` y `/v1/health`.
- Throughput: 203 a 249 preguntas por segundo en p150 y 309 a 936 en p150x4 para peticiones por lotes.
- Latencia: 10,8 ms para una pregunta y 197,6 ms para 50 preguntas en p150 (mediana del cliente, en caliente).

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos de decisión tipada directamente comparables más allá de las variantes del propio autor.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| tt-hous/laya-typed-decisions-p150 | 421 M | 1024 tokens | Decisiones tipadas (`choice`, `score`, `noul`) con probabilidades | Apache 2.0 | Tenstorrent Blackhole p150 / p150x4 |
| convaiinnovations/laya-typed-decisions | 421 M | 1024 tokens | Idéntica (es el modelo original) | No disponible en la información | GPU (referencia T4) / CPU |
| tt-hous/laya-p150 | No disponible | No disponible | Misma API que este paquete | No disponible en la información | Tenstorrent p150 |
| answerdotai/ModernBERT-large | No disponible | No disponible | Representaciones de encoder (no cabe de decisión) | No disponible en la información | GPU |

Respecto a ModernBERT-large, la diferencia relevante es que este paquete añade una cabeza de decisión que permite obtener respuestas tipadas calibradas en lugar de representaciones o logits de clasificación genéricos.

## Limitaciones y advertencias

- No genera texto: cualquier expectativa de uso como modelo conversacional o de generación es incorrecta. Está diseñado exclusivamente para responder preguntas tipadas.
- Solo inglés: la propia tarjeta declara el uso con entrada no inglesa fuera de alcance.
- Ventana de contexto limitada: 1024 tokens para el estado y 256 para la cabeza. Los estados más largos se truncan y la respuesta informa de `state_tokens_dropped` y `truncated`.
- Calibración mejorable: el ECE reportado es de 0,214, un valor relativamente alto que indica que las probabilidades no están perfectamente calibradas; conviene aplicar umbrales (`min_confidence`) y validación propia antes de automatizar decisiones críticas.
- Degradación fuera de distribución: la tarjeta advierte explícitamente contra usar el modelo en flujos alejados de los datos de fine-tuning sin evaluarlos previamente.
- Estado experimental: se define como "experimental community bring-up", con 0 descargas y 0 likes, y con métricas medidas en una build concreta (build 2). No hay historial de uso en producción documentado.
- Dependencia de hardware específico: requiere un chip Tenstorrent Blackhole p150 o p150x4 y la compilación de kernels en el primer arranque, lo que alarga el aprovisionamiento.
- API no estándar: no es compatible con la API de chat de OpenAI, por lo que exige adaptar el código de integración a los formatos de petición y respuesta propios, salvo que se usen clientes laya o Jev existentes.
- Riesgo de alucinación: no aplica en el sentido generativo, pero un error de clasificación o una puntuación sesgada sí puede propagarse a decisiones automatizadas posteriores.
- Sesgos: la información disponible no documenta análisis de sesgos del modelo ni de su conjunto de datos de fine-tuning.
- Licencia: Apache 2.0, que permite uso comercial, pero la tarjeta remite a la del modelo original (`convaiinnovations/laya-typed-decisions`) para los detalles de licencia, entrenamiento y evaluación, por lo que conviene verificar allí las condiciones aplicables.
- Trazabilidad: el paquete incluye una comprobación de sanidad de arranque contra `server/sanity_reference_typed_decisions.json`; conviene conservarla para detectar desviaciones en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tt-hous/laya-typed-decisions-p150
- Modelo base (original): https://huggingface.co/convaiinnovations/laya-typed-decisions
- Revision de pesos utilizada: https://huggingface.co/convaiinnovations/laya-typed-decisions/tree/e929ae5cf69bc34259cd2f95c9e91145b818b1f0
- Encoder base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Herramienta de empaquetado tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Paquete hermano con la misma API: https://huggingface.co/tt-hous/laya-p150
- Referencias de código y resultados citadas en la tarjeta (rutas locales del autor, no enlazables): `doc/release/RUN_NOTES.md`, `/home/hous/dev/laya/evals/results/package_laya-typed-decisions-p150_p150_b2_20261006T022244Z`, `shim/laya_tt_backend.py`, `server/sanity_reference_typed_decisions.json`
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a sitios no relacionados (TikTok, YouTube y otros) y se han descartado.
