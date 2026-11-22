# warlockzero/Qwen3-ASR-0.6B-int4

## Resumen

Qwen3-ASR-0.6B-int4 es una versión cuantizada a 4 bits del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B desarrollado por Alibaba Qwen. La cuantización la ha realizado el usuario independiente warlockzero mediante `bitsandbytes` con cuantización NormalFloat de 4 bits (NF4) y doble cuantización, lo que reduce el peso en disco de 1.492 MB a 641 MB y el pico de VRAM en inferencia de aproximadamente 2,10 GB a 0,76 GB. El modelo base resuelve la transcripción de audio multilingüe (18 idiomas declarados) y esta variante está pensada para entornos con recursos limitados: portátiles de baja VRAM, GPUs de consumo de 4-6 GB y puentes de streaming en tiempo real.

Se trata de un checkpoint de 0,6 mil millones de parámetros con licencia Apache 2.0, empaquetado para `transformers` con la configuración de cuantización ya incluida en `config.json`, de modo que se carga directamente con `AutoModelForMultimodalLM.from_pretrained(...)` sin overrides manuales. El autor reporta una pérdida de precisión mínima: en una prueba de 10,4 segundos de audio en inglés, la salida INT4 difiere de la referencia en una frase ("flour-fatted sauce" pasa a "flour fat and sauce"), con una latencia de inferencia de aproximadamente 0,85 segundos en una RTX 3090.

Su relevancia actual radica en que permite desplegar ASR multilingüe en hardware modesto manteniendo una fidelidad cercana a la del modelo en FP16, algo útil para dictado en tiempo real, subtitulado local y pipelines de voz en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR, encoder de audio + decoder; detalles no especificados en la informacion disponible) |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 NF4 con doble cuantizacion (w4a8 / w4a16); existe variante INT8 W8A16 del mismo autor |
| Idiomas soportados | en, zh, ar, es, fr, de, ja, ko, ru, hi, bn, it, pt, tr, vi, id, th, fa (18 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB), cargable con `transformers` y `bitsandbytes` |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B es un modelo de reconocimiento automático del habla de la familia Qwen3, con un encoder de audio que alimenta un decoder de lenguaje; la model card de esta variante no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención o estrategia de alineamiento temporal). El checkpoint cuantizado no ha sido reentrenado: es una conversión del modelo original `Qwen/Qwen3-ASR-0.6B-hf` mediante `bitsandbytes` con `load_in_4bit=True`, `bnb_4bit_quant_type="nf4"` y `bnb_4bit_use_double_quant=True`, manteniendo las activaciones en FP16 (esquema w4a16/w4a8).

La innovación técnica de esta ficha es exclusivamente la cuantización: la doble cuantización cuantiza también las constantes de cuantización, ahorrando unos 0,4 bits por parámetro adicionales sin pérdida de precisión declarada. No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Transcripción de voz a texto (ASR) en 18 idiomas, incluidos inglés, chino, español, árabe, francés, alemán, ruso, japonés, coreano, hindi, bengalí, italiano, portugués, turco, vietnamita, indonesio, tailandés y persa.
- Identificación automática de idioma (LID) durante la transcripción.
- Alineamiento temporal (timestamps) según la model card.
- Manejo de habla ruidosa, dictado conversacional y entornos acústicos variados.
- Entrada de audio a 16 kHz, mono o estéreo (el estéreo se promedia a mono en el ejemplo de uso).
- Integración con `transformers` mediante `AutoProcessor` y `AutoModelForMultimodalLM`, con formato de petición `apply_transcription_request`.
- No se documentan capacidades de tool calling, agentes, visión ni audio bidireccional en la información disponible.

## Casos de uso

- Dictado en tiempo real en portátiles de baja VRAM: con un pico de 0,76 GB, el modelo puede convivir con el sistema operativo y otras aplicaciones en GPUs de 4 GB (RTX 3050, GTX 1650) o 6 GB (RTX 4060 Laptop), permitiendo transcripción continua sin agotar memoria.
- Subtitulado local de reuniones y clases: la identificación automática de idioma y los timestamps permiten generar subtítulos alineados en grabaciones multilingües sin enviar audio a servicios en la nube.
- Puentes de streaming de voz (estilo WO Mic o SayCodeVibe): el modelo está pensado para captura en streaming desde móvil o micrófono remoto, con latencia de inferencia de ~0,85 s en RTX 3090 para 10,4 s de audio.
- Coexistencia con LLMs en la misma GPU: al ocupar menos de 0,8 GB en inferencia, puede cargarse junto a un modelo de lenguaje grande para pipelines de voz-a-respuesta (ASR + LLM + TTS) en una sola máquina.
- Transcripción por lotes en servidores modestos: la carga en caliente en menos de 0,4 s en RTX 3090 y el peso de 641 MB permiten arrancar workers de ASR rápidamente en entornos contenerizados.
- Aplicaciones de accesibilidad: dictado por voz para usuarios con movilidad reducida en equipos de consumo, gracias al reducido consumo de VRAM y a la licencia Apache 2.0 que permite distribución.
- Preprocesado de audio para investigación: transcripción de corpus multilingües en estaciones de trabajo con una sola GPU consumer, sin necesidad de infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER sobre datasets como LibriSpeech, Common Voice, FLEURS, etc.) en la información disponible. La model card incluye una verificación cualitativa sobre un único audio de 10,4 segundos en inglés:

| Metrica | FP16 base | INT8 (W8A16) | INT4 NF4 (este repo) |
|---|---|---|---|
| Huella en disco | 1.492 MB | 945 MB | 641 MB |
| VRAM en reposo | ~1,60 GB | 0,95 GB | 0,64 GB |
| Pico de VRAM en inferencia | ~2,10 GB | 1,07 GB | 0,76 GB |
| Reduccion de VRAM | linea base | -40,6% | -63,8% |
| Fidelidad de transcripcion | linea base | coincidencia literal 100% | >99% (casi sin perdida) |
| Tiempo de carga en caliente (RTX 3090) | ~1,8 s | ~0,8 s | <0,4 s |
| Latencia de inferencia (audio 10,4 s, RTX 3090) | no disponible | no disponible | ~0,85 s |

La única discrepancia documentada en la prueba INT4 es la frase "flour-fatted sauce", transcrita como "flour fat and sauce". No hay datos de WER agregado ni comparación con otros modelos ASR.

## Requisitos de hardware

- VRAM en reposo: ~0,64 GB; pico en inferencia: ~0,76 GB (según el autor, en RTX 3090).
- Cabe en GPUs de consumo de 4 GB (RTX 3050, GTX 1650) y 6 GB (RTX 4060 Laptop), así como en cualquier GPU con 8 GB o más.
- GPUs recomendadas: RTX 3090 para el rendimiento medido; tarjetas con ≥1 GB libres de VRAM son suficientes en teoría.
- Despliegue: `transformers >= 4.49.0` con `bitsandbytes >= 0.45.0`, `accelerate >= 1.0.0` y `soundfile`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible (la cuantización bitsandbytes no es compatible con llama.cpp GGUF).
- Latencia y throughput: ~0,85 s para 10,4 s de audio en RTX 3090; carga en caliente <0,4 s. No se dispone de throughput agregado (RTF) ni de latencia en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warlockzero/Qwen3-ASR-0.6B-int4 | 0,6B | no disponible | INT4 NF4 (w4a8/w4a16) | Apache 2.0 | Hugging Face |
| warlockzero/Qwen3-ASR-0.6B-int8 | 0,6B | no disponible | INT8 W8A16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-0.6B-hf (base) | 0,6B | no disponible | FP16 | Apache 2.0 | Hugging Face |

No se dispone de información sobre modelos ASR comparables de otros autores (Whisper, etc.) en la documentación proporcionada, por lo que no se incluye comparación de rendimiento con ellos.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión: en la prueba documentada se omitió parte de una frase ("flour-fatted sauce" → "flour fat and sauce"), lo que implica riesgo de errores en pasajes largos o con vocabulario poco frecuente.
- No hay evaluación sistemática de WER; el rendimiento en acentos, ruido y dominios específicos (médico, legal, técnico) no está cuantificado.
- Los sesgos del modelo base (idiomas con más datos, acentos subrepresentados) se heredan sin mitigación adicional.
- Riesgo de alucinación en segmentos de audio ininteligible o silencios, comportamiento no documentado por el autor.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el comportamiento del checkpoint cuantizado.
- Requiere `bitsandbytes` y una GPU compatible; no funciona con backends GGUF/llama.cpp, lo que limita el despliegue en CPU o en entornos sin CUDA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay validación independiente de la cuantización.
- No se documenta la longitud de contexto ni el límite de duración de audio por petición.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/warlockzero/Qwen3-ASR-0.6B-int4
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Variante INT8 del mismo autor: https://huggingface.co/warlockzero/Qwen3-ASR-0.6B-int8
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Documentación de transformers: https://huggingface.co/docs/transformers
