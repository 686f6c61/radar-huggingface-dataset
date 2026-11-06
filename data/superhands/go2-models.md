# superhands/go2-models

## Resumen

`superhands/go2-models` es un repositorio de artefactos de voz para robots Unitree Go2 EDU gestionados por los docks de Meridein. No contiene un modelo de lenguaje generativo, sino dos modelos de voz específicos para estonio (`et`): un sistema de text-to-speech (Pocket TTS) en formato ONNX y un modelo de reconocimiento automático de voz (Whisper large-v3-turbo) cuantizado a `q5_0` para whisper.cpp. Ambos derivan de modelos públicos y se han convertido para ejecutarse en la Jetson integrada en el dock.

El propósito declarado es servir como fuente de descarga reproducible: el dock descarga los artefactos en un commit fijado y verifica el `sha256` de cada fichero antes de usarlo. El autor mantiene una política explícita de no sobrescribir ficheros, de modo que una release que fija commit y hash sigue funcionando aunque se publiquen versiones nuevas con nombres distintos.

El repositorio tiene 1,0 GB, licencia `cc-by-sa-4.0` (aplicada al modelo Pocket TTS; el Whisper hereda la licencia del modelo de TalTechNLP del que deriva) y, en el momento de la consulta, cero descargas y cero likes. No hay información publicada sobre arquitectura interna, número de parámetros ni benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (ONNX, exportado con pocket-tts 2.1.0 y PocketTTS.cpp `export_onnx.py`) y Whisper large-v3-turbo (ggml, cuantizado `q5_0`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TTS: int8 (se conservan los ficheros fp32 junto al set int8); ASR: `q5_0` |
| Idiomas soportados | estonio (`et`) |
| Licencia | `cc-by-sa-4.0` (Pocket TTS); Whisper: la del modelo TalTechNLP/whisper-large-v3-turbo-et-verbatim-2604 |
| Formato de pesos | ONNX (TTS, empaquetado en `pocket-cpp-et.tar.gz`); ggml bin (ASR) |

## Arquitectura y entrenamiento

El componente TTS es Pocket TTS en estonio, derivado de `cbentes/pocket-tts-estonian`: pesos y tokenizer en `e8d2fd9cc01ae6e4e505269adcc1d9bdaecbea0f`, configuración y seis clips de voz en `b37e49dd65514fb79a05cff2ace696e24af15d66`. Se exportó a ONNX con pocket-tts 2.1.0 y el script `export_onnx.py` de PocketTTS.cpp en `e801e7d`, e incluye el beginning-of-sequence antes de la voz dentro de `mimi_encoder.onnx`. Los pesos originales se entrenaron sobre el TalTech Estonian Speech Dataset 1.0. El artefacto se ejecuta con `--precision int8` en PocketTTS.cpp.

El componente ASR es Whisper large-v3-turbo en estonio, derivado de `TalTechNLP/whisper-large-v3-turbo-et-verbatim-2604` (fichero ggml `ggml/ggml-model.bin`, sha256 `4e231f931f029850d7ca497efe4223f85c495a27d986d955f9a577ac1cd02edb`), cuantizado a `q5_0` con la herramienta `quantize` de whisper.cpp en el commit `60c0be6`. La cuantización reduce el consumo de memoria en aproximadamente 1 GB. Se ejecuta con `whisper-server` de whisper.cpp forzando `language et`.

No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas adicionales más allá de la exportación ONNX, la cuantización int8/q5_0 y el empaquetado reproducible con hashes.

## Capacidades

- Síntesis de voz (text-to-speech) en estonio mediante Pocket TTS ejecutado con PocketTTS.cpp en precisión int8.
- Reconocimiento automático de voz (ASR) en estonio con Whisper large-v3-turbo en modo verbatim, vía `whisper-server` de whisper.cpp.
- Reproducibilidad de despliegue: descarga fijada a commit y verificación de `sha256` por fichero antes de su uso.
- Versionado inmutable: los ficheros nunca se sobrescriben; las nuevas versiones reciben nombres nuevos.
- Integración orientada a robótica: los artefactos están preparados para ejecutarse en la Jetson del dock del Unitree Go2 EDU.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio más allá de voz ni modo thinking.

## Casos de uso

- Interacción por voz en el robot Unitree Go2 EDU: el dock reproduce respuestas habladas en estonio con Pocket TTS int8 mientras el ASR Whisper transcribe las órdenes del usuario, permitiendo diálogo manos libres en el propio robot.
- Despliegue reproducible en flotas de docks: al fijar commit y `sha256` de cada fichero, un parque de robots puede actualizar o reinstalar sus modelos de voz de forma verificable y auditable.
- Transcripción verbatim de audio en estonio: el Whisper large-v3-turbo en modo verbatim resulta adecuado para capturar fielmente lo dicho en entornos de campo o laboratorio, sin normalización agresiva del texto.
- Procesado en el edge con Jetson: la cuantización `q5_0` del ASR ahorra aproximadamente 1 GB de memoria y el int8 del TTS reduce requisitos, lo que encaja en hardware embebido con recursos limitados.
- Teleoperación y accesibilidad: síntesis de voz para emitir avisos o instrucciones a operadores humanos y transcripción de comandos hablados para usuarios con dificultades de teclado.
- Registro y post-proceso de sesiones: transcripción en estonio de grabaciones recogidas por el robot para su análisis posterior, con un modelo ASR especializado en ese idioma.
- Integración en pipelines de voz locales: los artefactos ONNX y ggml pueden servirse con PocketTTS.cpp y whisper.cpp en un servidor local sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el ASR cuantizado a `q5_0` requiere aproximadamente 1 GB menos que el modelo ggml sin cuantizar; no se especifica el total exacto. El TTS int8 se ejecuta sobre los ficheros ONNX incluidos en `pocket-cpp-et.tar.gz`.
- GPU recomendadas: hardware del dock del Unitree Go2 EDU (Jetson) según la model card; no se detallan modelos concretos de GPU (A100, H100, RTX 4090) en la información disponible.
- ¿Cabe en GPU consumer? No disponible en la información proporcionada.
- Opciones de despliegue: PocketTTS.cpp (`e801e7d`, `--precision int8`) para el TTS; `whisper-server` de whisper.cpp (`60c0be6`) con `language et` para el ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `superhands/go2-models` (este repo) | TTS + ASR para robot | et | ONNX + ggml `q5_0` | `cc-by-sa-4.0` (TTS) / licencia TalTechNLP (ASR) | Hugging Face, 0 descargas |
| `cbentes/pocket-tts-estonian` | TTS | et | pesos originales | CC BY-SA 4.0 | Hugging Face |
| `TalTechNLP/whisper-large-v3-turbo-et-verbatim-2604` | ASR | et | ggml | la de su model card | Hugging Face |
| Whisper large-v3-turbo (OpenAI) | ASR multilingüe | multilingüe | varios | MIT (según la información disponible) | amplia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida al estonio (`et`); no apto para otros idiomas sin modelos adicionales.
- No es un modelo de lenguaje: no ofrece generación de texto, razonamiento, código ni tool calling.
- El TTS está limitado a las seis voces incluidas en la exportación; no se documenta clonación de voz ni control de estilo.
- El ASR en modo verbatim puede producir transcripciones menos legibles para aplicaciones que esperan texto normalizado.
- Riesgo de alucinación y errores de transcripción inherentes a Whisper, especialmente con ruido o audio de baja calidad; no cuantificado en la información disponible.
- Licencia `cc-by-sa-4.0` con share-alike para el TTS: las obras derivadas deben distribuirse bajo la misma licencia y con atribución a `cbentes/pocket-tts-estonian` y TalTech.
- La licencia del ASR es la del modelo de TalTechNLP; debe consultarse su model card antes de uso comercial.
- El repositorio tiene cero descargas y cero likes, sin evidencia pública de adopción ni validación externa.
- Política de ficheros inmutables: los consumidores deben fijar commit y `sha256`; apuntar a la rama principal sin hash rompe la reproducibilidad.
- No se documentan sesgos específicos, límites de longitud de audio ni rendimiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/superhands/go2-models
- Modelo TTS de origen: https://huggingface.co/cbentes/pocket-tts-estonian
- Modelo ASR de origen: https://huggingface.co/TalTechNLP/whisper-large-v3-turbo-et-verbatim-2604
- Runtime TTS: https://github.com/VolgaGerm/PocketTTS.cpp
- Runtime ASR: https://github.com/ggml-org/whisper.cpp
- Sitio del autor: https://www.superhands.ai/home2
