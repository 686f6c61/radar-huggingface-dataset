# wardner/Qwen3-ASR

## Resumen

Qwen3-ASR es un modelo de reconocimiento automatico del habla (ASR) que recibe audio y devuelve el idioma detectado junto con la transcripcion. El repositorio `wardner/Qwen3-ASR` no contiene los pesos originales en formato convencional, sino los artefactos de despliegue para la tarjeta de computo Rockchip RK182x (generacion de 1,82 TOPS) montada sobre una placa host RK3588, empaquetados como grafos RKNN y pesos asociados para el runtime RKLLM + RKNN. Es, por tanto, una distribucion de borde (edge) de la variante Qwen3-ASR-0.6B, no un checkpoint entrenable.

La familia upstream Qwen3-ASR cubre 52 idiomas y dialectos (30 idiomas y 22 dialectos del chino) y puede transcribir habla, canto y musica con fondo musical. Este paquete concreto implementa la ruta de streaming: procesa el audio en bloques de 1 segundo y emite texto de forma incremental, con un prefijo confirmado monotono y una cola no confirmada que se reescribe en cada ronda.

Su relevancia es practica: permite ejecutar ASR multilingue en hardware Rockchip de bajo consumo sin GPU dedicada, con un consumo de memoria estimado de unos 1600 MB y un tiempo de inicializacion de aproximadamente 25 segundos. La licencia Apache 2.0 facilita su integracion comercial, aunque el formato propietario de los artefactos limita su uso fuera del ecosistema RKLLM/RKNN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio (RKNN, variante streaming) + LLM Qwen3-ASR-0.6B (decoder) |
| Parametros totales | 0,6B (variante Qwen3-ASR-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 24.576 tokens (`MAX_CONTEXT_LEN = 1024*24`), equivalente a ~20 minutos de audio |
| Tipos de cuantizacion | Pesos empaquetados para RKNN/RKLLM; tabla de embeddings en fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | 52 idiomas y dialectos en la familia upstream (30 idiomas + 22 dialectos del chino); el paquete no lista el desglose |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (`.rknn`) + ficheros `.weight` + `llm.embed.bin` (fp16) + tokenizer GGUF |
| Tamano total de pesos | 1,05 GB (repo 1,1 GB) |
| Plataforma de computo | RK182x (1,82 TOPS) sobre host RK3588 |
| Runtime | RKLLM + RKNN |
| Memoria estimada | ~1600 MB (encoder 375 MB + LLM 435 MB + embeddings 297 MB) |
| Tiempo de inicializacion | ~25 s |
| Tarjetas requeridas | 1 |
| Entrada de audio | Cualquier sample rate, remuestreado a 16 kHz mono |
| Mel filterbank | 128 mel x 202, fp32 (`mel_128_filters.txt`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder clasico para ASR: un encoder de audio que transforma la señal en representaciones y un decoder basado en el LLM Qwen3-ASR-0.6B que genera la secuencia de tokens (idioma + transcripcion). En este repositorio el encoder se exporta como grafo RKNN en su variante *online* (streaming), con pesos separados de 357,5 MB, mientras que el LLM ocupa 369,3 MB de pesos mas un grafo de 45,3 MB y una tabla de embeddings fp16 de 296,8 MB (vocabulario 151.936 x dimension 1024). El tokenizer es un BPE estilo GPT-2 con ByteLevel, empaquetado en GGUF.

La innovacion destacable es la estrategia de streaming, alineada con la demo C++ `examples/Qwen3_ASR/cpp/online_main.cc`: bloques de 1 segundo (`ONLINE_CHUNK_MS=1000`), un maximo de 50 tokens nuevos por bloque (`ONLINE_MAX_NEW_TOKENS=50`), sin confirmacion durante las 4 primeras rondas (`ONLINE_ROLLBACK_ROUNDS=4`) y con retroceso de los ultimos 5 tokens en las rondas posteriores (`ONLINE_ROLLBACK_TOKENS=5`). El ultimo bloque confirma todo el contenido pendiente. Solo el prefijo confirmado es monotono; la cola no confirmada se reescribe por diseno. La cabeza de idioma emite primero `language <lang>` con el token 151704 como separador, y el SDK devuelve el idioma por separado al frontend. No se documentan en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla con salida conjunta de idioma y transcripcion.
- Transcripcion de habla, canto y musica con fondo musical (capacidad declarada de la familia upstream).
- Streaming incremental: refresco cada segundo con prefijo confirmado monotono.
- Deteccion de idioma integrada en la propia secuencia de tokens generada.
- Soporte multilingue: 52 idiomas y dialectos en la familia upstream.
- Entrada desde fichero de audio, video con pista de audio o microfono en directo de la placa.
- Envio del texto reconocido al navegador por WebSocket a medida que se completa cada bloque de 1 segundo.
- Capacidad declarada `swcap_audio_asr` y factoria de worker `qwen3_asr` en el manifiesto `qwen3-asr.json`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio bidireccional.

## Casos de uso

- Subtitulado en directo en dispositivos empotrados: el modelo procesa bloques de 1 segundo y empuja el texto por WebSocket, lo que permite generar subtitulos casi en tiempo real en una placa RK3588 sin GPU dedicada.
- Transcripcion de reuniones y notas de voz en local: con un contexto de 24k tokens que cubre unos 20 minutos de audio, puede transcribir grabaciones completas sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Asistentes de voz para electrodomesticos y equipos industriales: el consumo de ~1600 MB y la inicializacion de ~25 s encajan en dispositivos de borde con RK182x, permitiendo comandos por voz multilingues sin conectividad.
- Accesibilidad para personas con discapacidad auditiva: transcripcion continua de conversaciones presenciales o de medios audiovisuales, incluyendo canto y musica con fondo, gracias a las capacidades de la familia upstream.
- Indexacion y busqueda de archivos audiovisuales: transcripcion por lotes de videos con pista de audio para generar metadatos y permitir busqueda por texto en archivos locales.
- Atencion al cliente en kioscos interactivos: captura de audio por microfono y transcripcion incremental para alimentar un sistema de dialogo, con deteccion automatica del idioma del usuario entre los 52 soportados por la familia.
- Monitorizacion de medios y cumplimiento: transcripcion de emisiones de radio o television en emisoras locales para auditoria de contenido, con despliegue en hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria estimada: ~1600 MB (encoder 375 MB + LLM 435 MB + tabla de embeddings 297 MB).
- Acelerador: tarjeta de computo Rockchip RK182x (1,82 TOPS), una unidad por despliegue.
- Host: placa RK3588.
- No cabe en GPU consumer convencional (RTX 4090, etc.): los artefactos son grafos RKNN especificos del NPU Rockchip y no son ejecutables en CUDA.
- Runtime de despliegue: RKLLM + RKNN, integrado en la interfaz web `wdnwebui` mediante el manifiesto `qwen3-asr.json`; el backend reescanea el directorio de modelos cada ~2 s sin necesidad de reinicio.
- Tiempo de inicializacion: ~25 s.
- Timeout de inferencia configurado: `infer_timeout_s=120`, ya que una inferencia comprende N rondas seriales del LLM (15 s de audio = 16 rondas) y el presupuesto por defecto de 60 s no es suficiente.
- Limites de duracion: la demo de streaming limita a 60 s (`ONLINE_MAX_AUDIO_SECONDS`); la demo offline admite hasta 20 minutos (`OFFLINE_MAX_AUDIO_SECONDS`).
- Latencia y throughput: no se proporcionan cifras concretas de latencia por bloque ni de throughput mas alla de la cadencia de refresco de 1 segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| wardner/Qwen3-ASR (esta ficha) | 0,6B | 24k tokens (~20 min audio) | 52 (familia upstream) | Apache 2.0 | RKNN/RKLLM para RK182x |
| Whisper large-v3 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Qwen3-ASR-0.6B upstream | 0,6B | no disponible en la informacion | 52 | no disponible en la informacion | safetensors / transformers |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones detalladas de alternativas comparables; la comparativa se limita a lo declarado por el autor sobre la familia upstream.

## Limitaciones y advertencias

- Solo el prefijo confirmado es monotono; la cola no confirmada se reescribe en la siguiente ronda, lo que puede producir cambios visibles en el texto ya mostrado.
- Con poco contexto, la primera ronda puede detectar un idioma erroneo (por ejemplo, `Chinese` para habla en ingles); el idioma final se toma del flujo de tokens confirmado.
- El paquete incluye unicamente el encoder en variante streaming (`encoder_online.*`); cambiar a la ruta one-shot requiere `encoder.1828.rknn` + `encoder.weight` y `use_online_encoder=False`, decision que se toma en tiempo de carga en la spec del SDK.
- El remuestreo a 16 kHz debe usar interpolacion lineal para coincidir byte a byte con la demo C; sustituirlo por un filtro Kaiser-sinc provoca perdida de palabras.
- El numero de tramas mel debe truncarse exactamente a `n_frame * hop` como hace la demo C; sin ese truncamiento la anchura de entrada no coincide y la primera ronda ya diverge.
- `mel_128_filters.txt` debe permanecer junto a los pesos; su ausencia impide el funcionamiento.
- El limite de streaming de la demo es de 60 s por sesion, aunque el contexto exportado cubre ~20 minutos de audio.
- Los artefactos estan atados al hardware RK182x/RK3588 y al runtime RKLLM/RKNN; no son portables a GPU convencional ni a otros aceleradores.
- No se documentan en la informacion disponible sesgos conocidos, tasas de alucinacion ni restricciones adicionales de la licencia Apache 2.0 para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria publica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wardner/Qwen3-ASR
- Manifiesto del worker: `qwen3-asr.json` (incluido en el repositorio, en texto plano)
- Demo C++ de referencia de streaming: `examples/Qwen3_ASR/cpp/online_main.cc` (referenciada en la model card)
- Verificacion de integridad: `SHA256SUMS` (incluido en el repositorio)
- Espejo para descarga: https://hf-mirror.com
