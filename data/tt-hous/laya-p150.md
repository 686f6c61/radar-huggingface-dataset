# tt-hous/laya-p150

## Resumen

laya-p150 es un paquete de despliegue publicado por el usuario tt-hous para servir, sobre un acelerador Tenstorrent Blackhole p150, el modelo Laya de convaiinnovations. Laya no es un modelo de lenguaje generativo: es un encoder ModernBERT-large (28 capas, 1024 de dimension oculta, GeGLU, RoPE de doble theta) con una cabeza de decisión de 2 capas y 421 millones de parametros totales, que en una sola pasada de forward responde preguntas tipadas (noul, choice y score) sobre un texto o un estado JSON, devolviendo probabilidades calibradas. Nunca genera texto.

El problema que resuelve es el de las decisiones clasificatorias acotadas dentro de un pipeline: enrutado, triaje, guardrails, relevancia y puntuacion, donde se necesita una probabilidad calibrada en lugar de una respuesta en lenguaje natural. Al ser un encoder con cabeza de decisión, la latencia es de un orden de magnitud inferior a la de un LLM del mismo rango de parametros: 10,9 ms por pregunta en p150 frente a 39,5 ms en una Tesla T4 de referencia, y entre 203 y 250 preguntas por segundo en modo batch sobre un solo chip p150 (349-940 en el perfil p150x4).

El paquete incluye la imagen Docker, el manifiesto de despliegue (tt-model-manager 0.1.0, esquema 5.1) y un servidor HTTP propio compatible con la API `/v1/systemone` de laya-serve, ademas de una pagina de demostracion en `/demo/`. Es un bring-up comunitario en estado experimental, publicado el 6 de octubre de 2026 bajo licencia Apache 2.0, y esta pensado para hardware Tenstorrent, no para GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large (28 capas, 1024 ocultas, GeGLU, RoPE de doble theta, una capa de atencion global por cada tres) mas cabeza de decision de 2 capas con scorer de marcador de opcion y act head |
| Parametros totales | 421 millones |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (`max_len`); `head_max_len` 192 |
| Tipos de cuantizacion | No disponible (referencia de paridad en CPU fp32; el endpoint `/v1/health` informa la precision) |
| Idiomas soportados | Ingles (checkpoint raiz solo en ingles); para otros idiomas el autor remite al checkpoint multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (imagen Docker de serving; los pesos se descargan desde `convaiinnovations/laya` en la revision `7b928d828b7b0e022f929d9bd2e44165aa270148`) |

## Arquitectura y entrenamiento

La arquitectura hereda el encoder ModernBERT-large de answerdotai y anade una cabeza de decision de 2 capas con dos componentes: un scorer de marcador de opcion, que puntua cada opcion candidata dada la representacion del estado, y un act head que produce `act_probability`. El modelo trata la tarea como una clasificacion multiple condicionada: recibe un estado (texto o JSON) y un conjunto de preguntas, cada una con un tipo (`choice`, `score` o `noul`), instrucciones y criterios, y responde con una distribucion sobre las opciones o con una puntuacion. La ventana de entrada es de 512 tokens y la de la cabeza, 192.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; el pipeline declarado es `text-classification` y el checkpoint base es `convaiinnovations/laya`, a su vez derivado de `answerdotai/ModernBERT-large`. La innovacion destacable del paquete no es de entrenamiento sino de despliegue: la compilacion de kernels para el chip p150, el bucketizado exacto de peticiones en 128, 256 o 512 tokens por 1 a 64 filas, y un shim (`shim/laya_tt_backend.py`) que instala un `TtBackend` sobre un `Agent` de pip laya y redirige `agent.model.forward` al endpoint `/v1/forward` del servidor (habilitado porque el paquete define `LAYA_RAW_FORWARD=1`). La calibracion publicada por los autores (ECE 0,081) procede de un ajuste de temperatura por dominio con protocolo no publicado; el valor en crudo es 0,466.

## Capacidades

- Decisiones tipadas calibradas sobre un estado de texto o JSON: preguntas de tipo `choice` (elegir entre opciones), `score` (puntuacion numerica) y `noul`.
- Respuesta en una unica pasada de forward, sin decodificacion autoregresiva ni generacion de texto.
- Salida de probabilidades calibradas y de una confianza por respuesta (`answer_confidence`), pensada para umbralizar en produccion.
- Procesamiento por lotes: `/v1/systemone/batch` acepta de 1 a 64 estados que comparten un mismo conjunto de preguntas.
- Compatibilidad con clientes existentes de laya y Jev cambiando unicamente la URL base.
- Metricas por respuesta en cabeceras HTTP: `X-Inference-Time-Ms`, `X-Laya-Device-Ms` y `X-Laya-Batch`.
- Endpoint de salud `/v1/health` con backend, precision, malla, buckets y comprobacion de arranque.
- Pagina de demostracion servida en `/demo/`.
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso: esas categorias no aplican a este modelo.
- Uso fuera de alcance declarado por el autor: generacion de texto, entrada en idiomas distintos del ingles y mas de aproximadamente 20 opciones con el presupuesto por defecto de la cabeza.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de preguntas de tipo `choice` con las colas o equipos posibles, y devuelve la probabilidad de cada destino; con 10,9 ms por pregunta en p150, el enrutado puede ejecutarse de forma sincrona dentro del propio flujo de ingesta.
- Triaje y guardrails en linea: se plantean preguntas binarias (`choice`) o de puntuacion (`score`) sobre el contenido generado por otro sistema para decidir si se publica, se revisa o se bloquea, usando `answer_confidence` como criterio de derivacion a revision humana.
- Puntuacion de relevancia en recuperacion (reranking): dado un par consulta-documento como estado, una pregunta de tipo `score` produce una puntuacion numerica utilizable para reordenar candidatos; el modo batch admite 64 estados por peticion compartiendo el mismo conjunto de preguntas.
- Clasificacion de topicos y sentimiento a escala: los resultados reportados en AG News (0,955 de exactitud) y DAIR Emotion (0,593) lo sitúan como un clasificador de texto competitivo para etiquetado masivo; con 203-250 preguntas por segundo en un p150, un corpus de un millon de elementos se procesa en torno a una hora y media.
- Moderacion de contenido por criterios personalizados: la cabeza acepta instrucciones y criterios en cada pregunta, de modo que las politicas de moderacion se pueden reformular sin reentrenar, cambiando el texto de los criterios.
- Decisiones dentro de un agente Jev o laya: mediante el shim incluido, un `Agent` de pip laya puede delegar sus llamadas de `systemone` al chip p150 cambiando solo la URL base, lo que permite separar el razonamiento de alto nivel (LLM) de las decisiones acotadas y deterministas.
- Despliegue en entornos con hardware Tenstorrent: al ejecutarse en p150 o p150x4, encaja en infraestructura on-premise que no disponga de GPU NVIDIA, con el perfil p150x4 ofreciendo entre 349 y 940 preguntas por segundo.

## Benchmarks y rendimiento

Conjunto de decisiones tipadas (400 casos, 2.000 decisiones, zero-shot):

| Metrica | p150 (paquete) | Publicado por los autores | CPU fp32 en el mismo host |
|---|---|---|---|
| Exactitud | 0,359 | 0,362 | 0,3615 |
| Exactitud suave | 0,332 | 0,332 | 0,3315 |
| Brier | 0,311 | 0,316 | 0,3155 |
| ECE | 0,172 | 0,175 | 0,1747 |
| MAE de puntuacion | 0,689 | 0,694 | 0,6937 |

Clasificacion:

| Tarea | p150 (paquete) | Autores (CPU) | Jev |
|---|---|---|---|
| AG News (exactitud) | 0,955 | 0,950 | 0,910 |
| DAIR Emotion (exactitud) | 0,593 | 0,595 | 0,480 |

Latencia por llamada (mediana del cliente, en caliente, protocolo `bench_latency` de los autores):

| Preguntas por llamada | p150 | Tesla T4 (referencia) |
|---|---|---|
| 1 | 10,9 ms | 39,5 ms |
| 5 | 24,6 ms | 84,5 ms |
| 10 | 42,5 ms | 158,6 ms |
| 50 | 197,5 ms | 771 ms |

Forward en dispositivo (mismos cuatro puntos): 9,2 / 22,7 / 40,3 / 191,6 ms. Rendimiento en batch: 203-250 preguntas por segundo en un p150 (frente a 103-332 en la T4) y 349-940 en el perfil p150x4.

Paridad frente a la referencia CPU fp32: en 488 decisiones, 403 de 403 decisiones con confianza (margen de referencia >= 0,10) coinciden; 476 de 488 argmax coinciden; delta maximo absoluto de probabilidad con mediana 0,008, p95 0,031 y maximo 0,12; PCC del logit del scorer 0,994. En las 800 decisiones de la suite de fila unica, 777 de 779 decisiones con confianza coinciden, con mediana 0,001 y maximo 0,27.

## Requisitos de hardware

- Hardware objetivo: chip Tenstorrent Blackhole p150, o malla p150x4. El paquete se sirve con los perfiles `p150` (por defecto) y `p150x4`.
- No se documenta ejecucion sobre GPU NVIDIA: la T4 aparece unicamente como referencia comparativa de los autores.
- VRAM estimada: no disponible como tal, ya que el destino no es GPU. Como referencia de tamano, 421 millones de parametros ocupan aproximadamente 1,7 GB en fp32 y 0,85 GB en bf16 (estimacion derivada del numero de parametros, no publicada por el autor); el repositorio completo ocupa 0,9 GB.
- GPU de consumo: no aplica; no hay soporte documentado para RTX 4090 ni similares.
- Opciones de despliegue: `tt model pull` / `tt serve` con el CLI de Tenstorrent, o directamente `tt-model pull tt-hous/laya-p150 --with-weights` y `tt-model serve tt-hous/laya-p150`. El servidor HTTP escucha en el puerto 20000, o en el siguiente libre.
- No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI; la API expuesta no es compatible con el esquema de chat de OpenAI.
- Latencia y throughput: 10,9 ms para una pregunta y 197,5 ms para 50 en p150; 203-250 preguntas por segundo en batch en p150 y 349-940 en p150x4.
- El primer arranque compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-p150 (este paquete) | 421 M | 512 tokens (cabeza, 192) | Decisiones tipadas calibradas sobre texto o JSON | Apache 2.0 | Imagen Docker para Tenstorrent p150 / p150x4 |
| convaiinnovations/laya | 421 M (encoder ModernBERT-large) | 512 tokens | Igual que el anterior, en CPU/GPU | Apache 2.0 | Pesos en HuggingFace |
| answerdotai/ModernBERT-large | ~395 M | 8.192 tokens | Encoder de proposito general para clasificacion y recuperacion | Apache 2.0 | Pesos en HuggingFace |
| Classificador basado en LLM (p. ej. Jev) | Variable | Variable | Tareas de decision y clasificacion | No disponible | No disponible |

Frente a Jev, los datos aportados por el autor muestran una ventaja clara en tareas de clasificacion (AG News 0,955 frente a 0,910; DAIR Emotion 0,593 frente a 0,480). Frente a ModernBERT-large sin ajustar, la diferencia esta en la cabeza de decision: Laya anade el scorer de marcador de opcion y el act head, y renuncia explicitamente a la generacion de texto. No se dispone de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre; cualquier expectativa de chat o generacion queda fuera de su alcance declarado.
- Solo ingles en el checkpoint raiz; el autor remite a un checkpoint multilingue para otros idiomas.
- Calibracion en crudo deficiente: el ECE de 0,081 publicado por los autores corresponde a un ajuste de temperatura por dominio con protocolo no publicado; el valor sin ajustar es 0,466. El paquete, medido en su conjunto de decisiones tipadas, da 0,172 de ECE.
- Exactitud cercana al azar en decisiones tipadas zero-shot (0,359): el 0,766 publicado pertenece al hermano ajustado, no a este checkpoint base.
- `action.act_probability` no aporta senal utilizable (issue #185 de los autores); hay que umbralizar sobre `answer_confidence`.
- Las temperaturas se recortan al rango [0.5, 5.0] como hace pip laya 0.3.27, de modo que las preguntas de tipo `choice` con mas de 10 opciones usan 0.5 en lugar del 0.1006 enviado.
- Limite practico de aproximadamente 20 opciones por pregunta con el presupuesto por defecto de la cabeza.
- Las peticiones se rellenan (padding) a 128, 256 o 512 tokens por 1 a 64 filas, con buckets exactos en 5, 10 y otros valores (la informacion de la model card esta truncada en este punto); conviene dimensionar los lotes a esos buckets para no desperdiciar computo.
- Estado experimental de bring-up comunitario: no hay garantias de soporte ni de estabilidad de API.
- Dependencia de hardware especifico (Tenstorrent Blackhole p150); no hay ruta de despliegue documentada en GPU convencional.
- Licencia Apache 2.0, que permite uso comercial, pero el paquete descarga pesos de `convaiinnovations/laya`, cuyos terminos deben verificarse por separado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza en las probabilidades si no se recalibra por dominio.
- Sesgos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tt-hous/laya-p150
- Checkpoint base de los pesos: https://huggingface.co/convaiinnovations/laya
- Encoder de origen: https://huggingface.co/answerdotai/ModernBERT-large
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
- Paper o blog oficial: no disponible
- Repositorio del servidor laya-serve: no disponible
- Demostracion: servida localmente en `/demo/` del propio paquete (no hay URL publica en la informacion proporcionada)
