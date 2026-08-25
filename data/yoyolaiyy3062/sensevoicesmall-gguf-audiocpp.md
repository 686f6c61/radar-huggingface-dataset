# yoyolaiyy3062/SenseVoiceSmall-GGUF-audiocpp

## Resumen

SenseVoiceSmall es un modelo de reconocimiento automático de voz (ASR) desarrollado por FunAudioLLM (Alibaba), diseñado para ofrecer transcripción multilingüe de alta precisión con baja latencia. Este repositorio concreto (`yoyolaiyy3062/SenseVoiceSmall-GGUF-audiocpp`) contiene una exportación autónoma en formato GGUF con cuantización Q8_0, preparada específicamente para el runtime `audio.cpp`, un motor de inferencia en C++ puro que ejecuta modelos de voz en CPU sin dependencias pesadas. El fichero integra el esquema `sense_asr`, el vocabulario SentencePiece, los tensores CMVN y los 919 tensores del modelo, lo que permite cargarlo directamente sin especificaciones externas. Con aproximadamente 234 millones de parámetros, el modelo original ofrece reconocimiento de voz en chino mandarín, cantonés, inglés, japonés y coreano, además de detección de emociones y eventos de audio. Esta versión GGUF es especialmente relevante para despliegues en entornos con recursos limitados o sin GPU, ya que permite ejecutar ASR de calidad en CPU de forma eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de reconocimiento de voz (ASR) basado en transformer, sin especificacion detallada en la informacion disponible |
| Parametros totales | 233.999.728 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo original soporta audio de hasta 30 segundos, pero no se confirma en este repo) |
| Tipos de cuantizacion | Q8_0 (unico fichero en este repo) |
| Idiomas soportados | chino mandarin (zh), ingles (en), cantonés (yue), japones (ja), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `sensevoice-small-q8-audiocpp-v1.gguf`, 254.211.200 bytes) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo, pero por la naturaleza del proyecto SenseVoice se trata de un modelo de reconocimiento de voz con arquitectura encoder-decoder, entrenado para tareas de ASR multilingue, reconocimiento de emociones y deteccion de eventos de audio. El repositorio original de FunAudioLLM publico el modelo en julio de 2024. El fichero GGUF de este repo fue exportado desde la revision `3847d57b6bdf2dd8875cb1508d2af43d80a16bf7` de `FunAudioLLM/SenseVoiceSmall` utilizando el exportador oficial `runtime/llama.cpp/export_sensevoice_gguf.py` con `--wtype q8_0` y `--model-spec`. No se disponen de datos sobre el dataset de entrenamiento, numero de tokens ni el proceso de alineamiento (RLHF/DPO) en la informacion consultada.

## Capacidades

- Transcripcion de voz a texto en 5 idiomas: chino mandarin, cantones, ingles, japones y coreano.
- Reconocimiento de emociones en el habla (el modelo original incluye esta capacidad).
- Deteccion de eventos de audio (por ejemplo, ruidos, pausas, risas, etc.).
- Inferencia de baja latencia, especialmente en CPU gracias a la cuantizacion Q8_0.
- Integracion directa con audio.cpp, sin necesidad de especificaciones externas.
- Compatible con el ecosistema FunASR para despliegues industriales.
- No incluye soporte de tool calling, agentes ni razonamiento multietapa; es exclusivamente un modelo de audio.

## Casos de uso

- Transcripcion de reuniones y entrevistas: se puede integrar en un pipeline de ASR para convertir grabaciones de audio en texto con alta precision en varios idiomas, especialmente util en entornos corporativos multilingues.
- Generacion de subtitulos para video: al ser un modelo ligero, puede ejecutarse en CPU durante la postproduccion para generar subtitulos en chino, ingles, japones, coreano o cantones.
- Atencion al cliente automatizada: analisis de llamadas telefonicas para transcribir conversaciones, detectar emociones del interlocutor y extraer eventos relevantes (como tono de voz o pausas) sin necesidad de GPU.
- Asistentes de voz en dispositivos edge: su bajo consumo de recursos permite desplegarlo en dispositivos embebidos o Raspberry Pi para comandos de voz o dictado.
- Sistema de monitorizacion de medios: transcripcion de emisiones de radio o podcasts en varios idiomas para busqueda y analisis de contenido.
- Herramientas de accesibilidad: generacion de subtitulos en tiempo real para personas con discapacidad auditiva, utilizando audio.cpp en CPU para baja latencia.
- Investigacion academica en procesamiento de audio: como punto de partida para experimentos de ASR multilingue o comparativas de rendimiento entre cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia es que en la muestra oficial de 5,616 segundos en mandarin, la transcripcion directa en CPU produjo el texto exacto esperado: "开饭时间早上9点至下午5点。" sin errores, igualando al modelo Q8 original cargado con especificacion externa. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- El fichero GGUF pesa 254 MB, por lo que cabe completamente en memoria RAM de cualquier sistema moderno.
- Se ejecuta en CPU sin necesidad de GPU: el runtime audio.cpp esta diseñado para inferencia en CPU.
- Para uso en GPU, el modelo es suficientemente pequeno (234M params) para caber en cualquier GPU con al menos 1 GB de VRAM, aunque no es el objetivo principal.
- Recomendado para despliegues en servidores ligeros, ordenadores de bajo consumo, o dispositivos edge.
- El modelo se puede ejecutar con `audiocpp_cli` (audio.cpp) y tambien es compatible con llama.cpp a traves del exportador oficial.
- Latencia y throughput: no se proporcionan datos numericos, pero la baja latencia es una caracteristica anunciada del modelo original.

## Comparativa con modelos similares

No se dispone de datos de benchmark comparativos en la informacion proporcionada. A modo orientativo, el modelo se puede comparar con alternativas como Whisper small (244M parametros) o Whisper base (74M), pero no se tienen mediciones directas. La principal diferencia es que SenseVoiceSmall cubre solo 5 idiomas (a diferencia de Whisper que soporta mas de 90), pero ofrece ademas deteccion de emociones y eventos de audio. En cuanto a licencia, ambos usan Apache-2.0 (Whisper usa MIT). En formato GGUF, SenseVoiceSmall es una exportacion especifica para audio.cpp, mientras que Whisper tiene multiples cuantizaciones para llama.cpp.

## Limitaciones y advertencias

- El modelo solo soporta 5 idiomas: chino mandarin, cantones, ingles, japones y coreano. No cubre espanol ni otros idiomas.
- La informacion no detalla el contexto de audio maximo, aunque el modelo original admite hasta 30 segundos; se recomienda verificar en el repositorio original.
- No se han publicado estudios de sesgos ni evaluaciones de robustez para este modelo.
- Al ser una cuantizacion Q8_0, puede haber una ligera perdida de precision respecto al modelo en punto flotante, aunque en la prueba oficial el resultado fue identico.
- El fichero GGUF es una exportacion especifica para audio.cpp; para usarlo con otros runtimes (como llama.cpp) se necesitaria un fichero GGUF generico.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de los terminos de los modelos base de Alibaba (FunAudioLLM) y el proyecto SenseVoice.
- No se incluyen capacidades de generacion de texto, tool calling ni agentes; es exclusivamente ASR.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/yoyolaiyy3062/SenseVoiceSmall-GGUF-audiocpp
- Repositorio original del modelo: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Repositorio original GGUF (oficial): https://huggingface.co/FunAudioLLM/SenseVoiceSmall-GGUF
- Repositorio de audio.cpp: https://github.com/0xShug0/audio.cpp
- Pull request de integracion: https://github.com/0xShug0/audio.cpp/pull/218
- Codigo fuente y exportador de SenseVoice: https://github.com/FunAudioLLM/SenseVoice/tree/main/runtime/llama.cpp
- FunASR: https://github.com/modelscope/FunASR
- Guias de despliegue industrial de FunASR: https://www.funasr.com/
