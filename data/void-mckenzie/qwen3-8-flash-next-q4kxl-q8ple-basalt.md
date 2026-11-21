# void-mckenzie/Qwen3.8-Flash-Next-Q4KXL-Q8PLE-Basalt

## Resumen

Qwen3.8-Flash-Next-Q4KXL-Q8PLE-Basalt es un artefacto de pesos cuantizados del modelo Qwen3.8-Flash-Next, empaquetado en el formato propietario `.basalt` para su servicio con el motor Basalt sobre GPUs Blackwell (sm_120). Lo publica el usuario `void-mckenzie`, no el equipo de Qwen, y se distribuye como un único fichero de 131,2 GiB derivado de la cuantización UD-Q4_K_XL de unsloth, con la tabla *engram* Q8_0 sustituida manualmente y la cabecera de contexto parcheada de 262144 a 317440 tokens.

El interés del paquete es operativo más que algorítmico: demuestra una ruta de conversión GGUF a `.basalt` que preserva expertos en Q4_K/Q5_1/Q8_0, incorpora el *drafter* MTP original del checkpoint Qwen y habilita visión y vídeo en un único fichero servible. Las mediciones del autor sobre una RTX 5090 (con una RTX 5060 Ti como peer) reportan 240-279 t/s en decodificación greedy mono-stream, ~7.700 tok/s de prefill y dos contextos concurrentes de ~262K tokens sin OOM con KV en int8.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; no hay información oficial de Qwen sobre esta variante concreta, y los datos de arquitectura, entrenamiento y benchmarks del modelo base no se detallan en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y *hyper-connections*; incluye *drafter* MTP y torre de visión (mmproj). Detalle de capas y dimensión no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262144 tokens en el GGUF de origen; cabecera parcheada a 317440; el autor arranca con `--max-context 348160` (extrapolación del motor) |
| Tipos de cuantizacion | Expertos: Q4_K (gate/up) y Q5_1/Q8_0 (down); tabla *engram*: Q8_0; 194 pesos de hyper-connection en Q8_0 leídos como BF16 vía `--compat-bf16`; KV cache en int8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (motor Basalt bajo MIT; pesos de origen de unsloth bajo sus propios términos) |
| Formato de pesos | `.basalt` (fichero único, 131,2 GiB); origen GGUF UD-Q4_K_XL de 4 shards |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos que incorpora *hyper-connections* (194 pesos con ese rol en el paquete) y un *drafter* MTP (multi-token prediction) para decodificación especulativa. La model card no detalla el número de capas, la dimensión oculta, el número de expertos ni la composición del dataset de entrenamiento; tampoco indica si hubo RLHF, DPO u otras fases de alineamiento. El paquete incluye además una torre de visión (`mmproj-BF16.gguf`) que habilita entrada de imagen y vídeo.

La innovación técnica relevante de este artefacto es el proceso de conversión: `mtp_fetch.py` descarga el *drafter* MTP original del checkpoint Qwen (no el `dense.bin` auto-destilado), y `convert.py` fusiona el GGUF de 4 shards con la tabla *engram* Q8_0 (estampada como shard 4 de 4 mediante `set_split.py`) y el `mmproj`. La bandera `--compat-bf16` es obligatoria porque el motor lee el pool denso en BF16 mientras que los pesos de hyper-connection llegan en Q8_0; el redondeo resultante queda por debajo de la cuantización int8 `hc8` que aplica la ruta de decodificación de todos modos. Los expertos se copian byte a byte desde el GGUF.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de hasta ~348K tokens en el motor Basalt.
- Procesamiento de imagen verificado en las superficies OpenAI y Anthropic del servidor Basalt.
- Procesamiento de vídeo mediante NVDEC a 2 fps, con `--video-max-tokens 32768`.
- Decodificación especulativa mediante *drafter* MTP original del checkpoint Qwen.
- Servicio concurrente con `--parallel 2` y `--slot-full-context`, permitiendo dos contextos completos simultáneos.
- *Resident experts*: el motor mantiene los expertos en memoria para evitar recargas durante la decodificación.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Servicio de chat con contexto muy largo en una sola GPU: con 262K-348K tokens de ventana, el modelo puede mantener conversaciones o documentos completos en memoria; el autor verifica dos contextos concurrentes de ~262K tokens con KV int8 de 7,9 y 10,2 GiB respectivamente.
- Análisis de documentos extensos y codebases: el prefill de ~7.700 tok/s permite procesar un prompt de 262K tokens en 33,5 s, adecuado para resumir o consultar repositorios y contratos largos.
- Inferencia interactiva de baja latencia: 240-279 t/s en decodificación greedy mono-stream sobre una RTX 5090 hace viable la generación en tiempo real para asistentes y autocompletado.
- Procesamiento de vídeo en pipelines de inspección: la ruta NVDEC a 2 fps con 32K tokens de vídeo permite analizar clips cortos en tareas de monitorización o moderación.
- Evaluación comparativa de motores de inferencia: al ser un paquete autocontenido con mediciones reproducibles, sirve para comparar Basalt frente a llama.cpp/vLLM en el mismo hardware Blackwell.
- Despliegue en estaciones de trabajo con dos GPUs consumer: la configuración del autor (RTX 5090 + RTX 5060 Ti) demuestra que el modelo cabe en hardware no-datacenter, útil para prototipado e investigación.
- Servicio multi-cliente con contextos completos aislados: `--parallel 2` con `--slot-full-context` permite atender dos sesiones con ventana completa sin degradar la coherencia en profundidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas son de rendimiento de inferencia, medidas por el autor el 2026-11-19 con Basalt 0.5.0:

| Metrica | Valor medido | Hardware |
|---|---|---|
| Decodificacion greedy mono-stream | 240-279 t/s | RTX 5090 |
| Decodificacion a temperatura 1.0 | ~180 t/s | RTX 5090 |
| Prefill | ~7.700 tok/s (262K tokens en 33,5 s) | RTX 5090 |
| Contextos concurrentes | 2 x ~262K tokens, sin OOM | RTX 5090 + RTX 5060 Ti |
| KV cache por contexto (int8) | 7,9 / 10,2 GiB | RTX 5090 + RTX 5060 Ti |
| Throughput concurrente sin segunda GPU | ~25% inferior | RTX 5090 sola |

## Requisitos de hardware

- VRAM estimada: el fichero pesa 131,2 GiB, por lo que la inferencia requiere al menos ~132 GiB de memoria total entre GPU y, en su caso, memoria del sistema; el autor lo ejecuta repartido entre dos GPUs.
- GPU recomendadas: Blackwell sm_120 es requisito del motor Basalt para este paquete; el autor usa RTX 5090 como principal y RTX 5060 Ti como peer.
- Cabe en GPU consumer: sí, en el sentido de que el autor lo sirve con dos tarjetas consumer (5090 + 5060 Ti), aunque no en una sola tarjeta de 24-32 GB.
- Configuración mono-GPU: el autor indica que omitir `--gpu 0,1` mantiene la velocidad mono-stream idéntica pero reduce ~25% el throughput concurrente.
- Opciones de despliegue: exclusivamente el motor Basalt (`bin/basalt serve`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para el formato `.basalt`.
- KV cache: int8 con `--kv int8`; el autor reporta 7,9-10,2 GiB para contextos de ~262K tokens.
- Contexto máximo de arranque probado: `--max-context 348160`, por encima de la cabecera parcheada de 317440.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Q4KXL-Q8PLE-Basalt | no disponible | 262K-348K (segun cabecera/motor) | `.basalt` (131,2 GiB) | Qwen Community License 1.0 | Hugging Face, 0 descargas |
| unsloth Qwen3.8-Flash-Next UD-Q4_K_XL (origen) | no disponible | 262144 | GGUF (4 shards) | Qwen Community License 1.0 | Hugging Face (unsloth) |
| Qwen3.8-Flash-Next (checkpoint original, vía `mtp_fetch.py`) | no disponible | no disponible | safetensors (presumible) | Qwen Community License 1.0 | Repositorio Qwen |

No se dispone de datos de parámetros, benchmarks ni contexto del checkpoint original en la información proporcionada, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Paquete auto-convertido: el motor Basalt emite la advertencia "glue off" para las capas de expertos con cuantización mixta (tipos 12/7 y 12/8), un coste conocido de este tipo de packs; puede afectar a la calidad en esas capas.
- Cabecera de contexto parcheada manualmente de 262144 a 317440 y arranque a 348160: el motor extrapola más allá de la cabecera, por lo que la calidad en profundidades superiores a 262K no está validada.
- Cero descargas y cero likes en el momento de la consulta: no hay validación independiente de las mediciones del autor.
- El autor no documenta sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base.
- Licencia Qwen Community License 1.0: implica obligaciones de atribución y posibles restricciones de uso comercial que deben revisarse antes de producción; el motor Basalt es MIT, pero los pesos de origen de unsloth se rigen por sus propios términos.
- Dependencia de hardware Blackwell (sm_120): no es desplegable en GPUs Ampere o Hopper sin verificación adicional del motor.
- Formato cerrado `.basalt`: no hay interoperabilidad documentada con ecosistemas estándar (llama.cpp, vLLM), lo que limita la portabilidad.
- Fecha de creación 2026-11-21 y conversión con un commit concreto de Basalt (`caa7c7a0`): la reproducibilidad depende de esa revisión del motor.

## Enlaces

- Hugging Face: https://huggingface.co/void-mckenzie/Qwen3.8-Flash-Next-Q4KXL-Q8PLE-Basalt
- Motor Basalt: https://github.com/jesdga95/basalt
- GGUF de origen (unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Agradecimiento en la model card (sin relación técnica con el modelo): https://void.fr/
