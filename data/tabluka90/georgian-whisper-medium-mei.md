# tabluka90/georgian-whisper-medium-MEI

## Resumen

Georgian Whisper Medium MEI es un modelo de reconocimiento automatico del habla (ASR) especializado en georgiano, desarrollado por el usuario tabluka90 a partir de `openai/whisper-medium`. El nombre MEI corresponde a "Mkhedruli Engine for Intelligent Transcription", en referencia al alfabeto mkhedruli, el sistema de escritura estandar del georgiano moderno. El modelo resuelve el problema de la baja cobertura del georgiano en sistemas ASR genericos: Whisper Medium original, sin ajuste, produce un WER del 100% sobre narracion literaria en este idioma segun la propia model card.

Tecnicamente es un transformer encoder-decoder con 763.857.920 parametros (aproximadamente 769M), la arquitectura clasica de Whisper Medium, con entrada de audio mono a 16 kHz y salida de texto en mkhedruli. Se ha entrenado en dos fases sobre Mozilla Common Voice en georgiano, con un pipeline de aumento de canal que simula radio, telefonia y ruido de fondo.

Su relevancia actual es acotada pero concreta: cubre un idioma de bajos recursos con un WER del 3,85% en validacion in-distribution y del 27,96% en audio externo fuera de dominio, muy por encima del modelo base. La licencia Apache 2.0 y el formato safetensors facilitan su integracion en pipelines de `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Medium (transformer encoder-decoder) |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | no disponible en la model card (formato safetensors en fp32/fp16) |
| Idiomas soportados | georgiano (ka) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-medium`, un transformer encoder-decoder con atencion estandar (no hay atencion lineal ni mecanismos SSM). La entrada es audio mono remuestreado a 16.000 Hz procesado con Librosa/SoundFile, y la salida es texto en alfabeto mkhedruli. El ajuste se hizo con PyTorch y Hugging Face Transformers sobre 2 GPU NVIDIA A100 de 40 GB en el servidor MICM HPC.

El entrenamiento consta de dos fases. La primera (adaptacion de dominio) ajusta el modelo base durante 20.000 pasos sobre el subconjunto georgiano de Mozilla Common Voice v.22.0, con 116.586 clips de 2.316 hablantes. La segunda (aumento de canal y escala) continua el entrenamiento otros 20.000 pasos, hasta 40.000 acumulados, sobre Common Voice Scripted Speech 26.0 en georgiano, con 334.062 clips de 3.146 hablantes. Antes de esta segunda fase se aplica un pipeline de aumento de canal en cuatro vias: radio simulada (filtro Butterworth de orden 4, banda 400-4.500 Hz, ruido blanco gaussiano a ~32 dB SNR), telefonia simulada (Butterworth de orden 5, 300-3.400 Hz, recorte hiperbolico suave para emular microfono de carbon), ruido de fondo (SNR 12-25 dB) y audio limpio sin modificar (~25% de la distribucion). No se documenta uso de RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en georgiano con salida en alfabeto mkhedruli.
- Reconocimiento robusto en condiciones de canal degradado: radio, telefonia y ruido de fondo, gracias al aumento de canal del entrenamiento.
- Procesamiento de audio largo mediante segmentacion en ventanas de 30 s, propia de Whisper.
- Uso directo con `pipeline("automatic-speech-recognition")` y con `WhisperForConditionalGeneration` + `WhisperProcessor`.
- Configuracion forzada de `language="georgian"` y `task="transcribe"` en la generacion.
- Interfaz Gradio y CLI incluidas en el repositorio del autor para transcripcion de ficheros y microfono en vivo.
- No soporta tool calling, function calling, agentes, vision ni audio de entrada mas alla de la transcripcion.

## Casos de uso

- Subtitulado de contenido audiovisual georgiano: el modelo transcribe audio a mkhedruli con WER del 3,85% en habla leida limpia, adecuado para generar subtitulos de documentales, clases o videos divulgativos.
- Transcripcion de archivos historicos de radio: el aumento de canal con filtro Butterworth 400-4.500 Hz y ruido a 32 dB SNR entrena al modelo especificamente para grabaciones con banda limitada, un escenario frecuente en archivos sonoros.
- Atencion al cliente telefonica en georgiano: la simulacion de telefonia (300-3.400 Hz con recorte hiperbolico) hace que el modelo sea util para transcribir llamadas de call center con calidad de linea degradada.
- Dictado y notas de voz en aplicaciones ofimaticas: la interfaz Gradio y la CLI permiten desplegar un servicio de transcripcion local para grabaciones personales o reuniones.
- Accesibilidad para personas con discapacidad auditiva en Georgia: generacion automatica de transcripciones de discursos, actos publicos o medios de comunicacion en georgiano.
- Investigacion linguistica y creacion de corpus: transcripcion masiva de grabaciones para construir datasets anotados en georgiano, con 3.146 hablantes ya representados en el entrenamiento.
- Preprocesado de audio para pipelines de NLP en georgiano: convertir entrevistas o podcasts a texto antes de aplicar analisis de sentimiento, resumen o busqueda semantica.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor.

Validacion retenida (n = 5.830 clips):

| Modelo | Pasos de ajuste | WER (%) | CER (%) | Solapamiento de tokens (%) |
|---|---|---|---|---|
| Stage 1 (CV 22.0) | 20.000 | 8,92 | 1,41 | 91,53 |
| MEI (Stage 2, CV 26.0 + aumento) | 40.000 | 3,85 | 0,64 | 96,32 |

Generalizacion fuera de dominio (audio externo no visto, narracion literaria, 372 palabras de referencia):

| Modelo | WER (%) | CER (%) | Solapamiento de tokens (%) | Sustituciones | Eliminaciones | Inserciones |
|---|---|---|---|---|---|---|
| Whisper Medium base sin modificar | 100,00 | 84,29 | no disponible | 261 | 111 | 0 |
| Stage 1 | 31,72 | 8,33 | 72,85 | 90 | 14 | 14 |
| MEI (Stage 2) | 27,96 | 6,09 | 75,44 | 81 | 15 | 8 |

Respecto a Stage 1, MEI reduce el WER un 56,8% relativo y el CER un 54,6% relativo en habla retenida.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,6 GB de pesos mas overhead de activaciones y cache, en torno a 2-3 GB totales; en fp32, unos 3,1 GB de pesos.
- GPU recomendadas: NVIDIA A100 (usadas en el entrenamiento), H100, L40S o RTX 4090 para produccion; cualquier GPU con 4 GB o mas de VRAM sirve para inferencia en fp16.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares; tambien en CPU, con mayor latencia.
- Opciones de despliegue: `transformers` con `pipeline` (soporte nativo), integracion en aplicaciones Gradio y CLI incluidas en el repositorio; compatible con endpoints de Hugging Face (tag `endpoints_compatible`). No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI, aunque al ser safetensors estandar de Whisper Medium deberia poder convertirse a otros formatos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER en georgiano (fuera de dominio) |
|---|---|---|---|---|---|
| Georgian Whisper Medium MEI | 763.857.920 | 30 s por segmento | ka | Apache 2.0 | 27,96% |
| openai/whisper-medium (base) | ~769M | 30 s por segmento | multilingue (99 idiomas) | Apache 2.0 | 100,00% |
| openai/whisper-large-v3 | ~1.550M | 30 s por segmento | multilingue (99 idiomas) | Apache 2.0 | no disponible en la informacion proporcionada |
| Whisper Small / Tiny (OpenAI) | 244M / 39M | 30 s por segmento | multilingue | Apache 2.0 | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de otros modelos ASR especificos para georgiano en la informacion proporcionada.

## Limitaciones y advertencias

- Brecha de dominio: el WER pasa del 3,85% en validacion limpia al 27,96% en narracion literaria externa; el rendimiento puede degradarse en dialogo conversacional, conversaciones con solapamiento de hablantes o dialectos regionales marcados.
- El modelo solo esta entrenado para georgiano; no es multilingue pese a heredar la arquitectura de Whisper Medium.
- Riesgo de alucinacion y de sustituciones en audio ruidoso: en el test fuera de dominio se registran 81 sustituciones, 15 eliminaciones y 8 inserciones sobre 372 palabras.
- El modelo base Whisper Medium sin ajuste es practicamente inutilizable en georgiano (WER del 100% en el test externo), por lo que no sirve como referencia de calidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datos de entrenamiento (Mozilla Common Voice) para cumplimiento normativo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente por parte de la comunidad.
- No se documentan sesgos especificos por genero, edad o region, pero la composicion de Common Voice puede introducirlos.
- El contexto de audio esta limitado a segmentos de 30 s; audios mas largos requieren segmentacion externa.
- La fecha de creacion del repositorio (2026-11-04) es posterior a la fecha actual conocida, lo que puede indicar un error de metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabluka90/georgian-whisper-medium-MEI
- Modelo base: https://huggingface.co/openai/whisper-medium
- Mozilla Common Voice: https://commonvoice.mozilla.org/
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
