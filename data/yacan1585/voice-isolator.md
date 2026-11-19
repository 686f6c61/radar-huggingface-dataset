# yacan1585/voice-isolator

## Resumen

Voice Isolator es un sistema de aislamiento de voz (voice isolation) desarrollado por Inworld AI, publicado bajo licencia Apache-2.0. Se distribuye como dos modelos que comparten arquitectura: `voice-isolator-v1` (64M parametros, procesamiento offline por bloques de 8 segundos) y `voice-isolator-v1-realtime` (58M parametros, streaming causal con 20 ms de look-ahead). El modelo resuelve el problema de separar la voz del hablante del ruido de fondo en grabaciones y flujos de audio en vivo, preservando la identidad vocal.

La relevancia actual del modelo radica en su licencia permisiva (Apache-2.0), su operacion a 48 kHz full-band (frente a los 16 kHz tipicos en modelos de denoising) y su capacidad de streaming en tiempo real. Esto lo hace adecuado tanto para curacion de datasets de voz como para pipelines de llamadas en vivo, donde la latencia es critica.

El repositorio en Hugging Face ocupa 0.5 GB y la libreria asociada es `inworld-voice-isolation`. No se trata de un modelo de lenguaje: es un modelo audio-to-audio especializado en speech enhancement y noise suppression. No es un selector de hablante ni un modelo de restauracion (esta previsto para la version 2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo audio-to-audio de aislamiento de voz; dos variantes con arquitectura compartida) |
| Parametros totales | 64M (`voice-isolator-v1` offline); 58M (`voice-isolator-v1-realtime`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa chunks de 8 s (offline) o streaming con 20 ms de look-ahead (realtime) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (procesa senal de voz independientemente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (descarga via libreria `inworld-voice-isolation`; checksums verificados) |

## Arquitectura y entrenamiento

La model card indica que ambas variantes comparten una unica arquitectura. La variante offline procesa cada frame con visibilidad completa de su chunk de 8 segundos, mientras que la variante realtime opera como un flujo causal con 20 ms de look-ahead (equivalente a 2 frames de 20 ms en la API de streaming). El modelo trabaja a 48 kHz full-band y produce salida float32 WAV preservando los niveles originales; la voz aislada y el fondo removido reconstruyen la entrada mono alineada.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). Tampoco se detalla la funcion de perdida ni el esquema de aumentacion de datos. Se menciona un benchmark propio, VIBE (Inworld VIBE full-band tier), que reporta puntuaciones de denoising por sistema, pero los valores numericos no estan disponibles en la informacion proporcionada.

## Capacidades

- Aislamiento de voz en grabaciones ruidosas: separa la voz del hablante del ruido de fondo preservando la identidad vocal.
- Extraccion del fondo: al restar la voz aislada de la entrada se obtiene el ruido de fondo o el residual de pista instrumental (util para separacion de voces y musica).
- Procesamiento en tiempo real: la variante realtime aisla la voz a medida que llega el audio, con 20 ms de look-ahead, apta para llamadas y streams en vivo.
- Procesamiento offline de alta calidad: la variante offline procesa archivos completos con visibilidad de chunks de 8 s.
- Audio full-band a 48 kHz en float32, preservando niveles originales.
- Salida dual: voz aislada y fondo removido, que reconstruyen la entrada mono alineada.
- Entrada mono a 48 kHz; acepta piezas de cualquier tamano en modo streaming (procesa en bloques de 20 ms, 960 muestras).
- Soporte de CUDA, Apple Metal (mps) con PyTorch 2.6 o superior, y CPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No es un selector de hablante ni un modelo de restauracion (restauracion prevista para v2).

## Casos de uso

- Limpieza de grabaciones antes de publicacion: el modelo offline procesa el archivo completo y genera la voz limpia y el fondo por separado, adecuado para podcasts, entrevistas y material de archivo donde la calidad prima sobre la latencia.
- Curacion de datasets de voz: al preservar la identidad del hablante, permite limpiar corpus de entrenamiento para pipelines de ASR o TTS sin alterar las caracteristicas del locutor.
- Llamadas y reuniones en vivo: la variante realtime, con 20 ms de look-ahead, suprime ruido de fondo en tiempo real en flujos de conferencia o telefonia.
- Streaming de audio en produccion: integrable como etapa de un pipeline que recibe audio del microfono en bloques de 20 ms (960 muestras) y emite las muestras finales listas para reproducir o enviar.
- Separacion de voces y musica: restando la voz aislada de la mezcla se obtiene el residual instrumental, util para extraer pistas de acompanamiento o voces a capela.
- Extraccion de ruido de fondo: el fondo removido puede reutilizarse como ambiente sintetico o analizarse para caracterizar condiciones acusticas.
- Preprocesado para pipelines de ASR: mejorar la relacion senal-ruido antes de la transcripcion en entornos ruidosos.
- Demo interactiva: la demo del repositorio carga ambos modelos y permite procesar archivos (Offline) y transmitir el microfono hasta 60 segundos (Online) con formas de onda y espectrogramas actualizados.

## Benchmarks y rendimiento

La model card menciona el benchmark VIBE (Inworld VIBE full-band tier), que reporta una puntuacion de denoising por sistema, pero los valores numericos no estan disponibles en la informacion proporcionada. No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de audio y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 64M y 58M parametros, el modelo es muy ligero; el repositorio ocupa 0.5 GB, por lo que la huella en memoria es reducida.
- GPU probadas: NVIDIA Ampere, Hopper y Blackwell (A100, H100, B200, B300).
- GPU consumer: no se han probado GPU mas pequenas segun la model card (pendiente en el roadmap).
- CPU: soportado.
- Apple Silicon: soportado via backend Metal (mps) con PyTorch 2.6 o superior.
- Despliegue: paquete `inworld-voice-isolation` (pip), CLI `voice-isolate`, API Python `inworld.voice_isolation`, y demo interactiva en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: la variante realtime opera con 20 ms de look-ahead, lo que fija la latencia minima de streaming en ese orden. No se publican cifras de throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de aislamiento de voz con datos de parametros, contexto, rendimiento y licencia que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un selector de hablante: no separa multiples hablantes entre si, solo la voz del ruido de fondo.
- No es un modelo de restauracion: no repara audio degradado mas alla de la supresion de ruido (restauracion prevista para la version 2).
- La variante realtime introduce 20 ms de look-ahead; no es de latencia cero.
- Solo entrada mono a 48 kHz (el modo offline admite `--output-sr 0` para conservar la tasa de entrada).
- GPU consumer no probadas oficialmente; el rendimiento en tarjetas de gama baja no esta validado.
- No se detallan sesgos conocidos ni tasas de alucinacion (no aplica el concepto de alucinacion de modelos de lenguaje, aunque puede haber artefactos de separacion no documentados).
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los terminos del repositorio y de la libreria asociada.
- El modelo se publica bajo el ID `yacan1585/voice-isolator`, un espejo del original `inworld/voice-isolator`; conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Sin descargas ni likes en el momento de la consulta; ecosistema de terceros limitado.

## Enlaces

- Hugging Face: https://huggingface.co/yacan1585/voice-isolator
- Repositorio original en Hugging Face: https://huggingface.co/inworld/voice-isolator
- GitHub: https://github.com/inworld-ai/voice-isolator
- Guia de setup para agentes (AGENTS.md): https://github.com/inworld-ai/voice-isolator/blob/main/AGENTS.md#setting-up-the-voice-isolator-for-a-user
- Demo interactiva: https://github.com/inworld-ai/voice-isolator/blob/main/demo/README.md
- Benchmark: https://github.com/inworld-ai/voice-isolator/blob/main/bench/README.md
- Planes y roadmap: https://github.com/inworld-ai/voice-isolator#plans
- Ejemplo de audio: https://raw.githubusercontent.com/inworld-ai/voice-isolator/main/demo/examples/sample_14.wav
