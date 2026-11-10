# twangodev/sita-omni-300m-asr

## Resumen

Sita Omni 300M ASR es un modelo de reconocimiento automático del habla (ASR) especializado en hmong (código ISO `hmn`), desarrollado por el usuario twangodev. Se trata de un ajuste fino (fine-tuning) del modelo base `facebook/omniASR-W2V-300M`, un sistema de ASR basado en la arquitectura wav2vec 2.0 de Meta, y se ha entrenado mediante el paquete SITA, una herramienta propia del autor para el ajuste de modelos de reconocimiento de voz con CTC.

El modelo resuelve un problema concreto: la escasez de sistemas ASR de calidad para el hmong, una lengua con millones de hablantes pero con pocos recursos digitales y prácticamente ausente en los modelos multilingües comerciales. Con 315 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que facilita su despliegue en aplicaciones de transcripción para comunidades hmong.

Es relevante porque publica una evaluación sobre validación disjunta por hablante con un WER codicioso del 42,37% y un CER del 12,81%, lo que ofrece una referencia medible (aunque modesta) para una lengua de bajos recursos. Está liberado bajo licencia Apache 2.0 y se distribuye en formato safetensors con un runtime Python propio (SITA), lo que permite integrarlo en pipelines de transcripción sin depender de infraestructura comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (base `facebook/omniASR-W2V-300M`) con cabeza CTC |
| Parámetros totales | 315.467.420 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio mono a 16 kHz; sin ventana declarada) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | hmong (`hmn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/omniASR-W2V-300M`, un encoder wav2vec 2.0 de aproximadamente 300 millones de parámetros que procesa audio crudo y aprende representaciones auto-supervisadas del habla. Sobre esa base, twangodev ha aplicado un ajuste fino supervisado con una cabeza de clasificación CTC, de modo que el modelo emite directamente la secuencia de caracteres hmong sin necesidad de un modelo de lenguaje externo. La entrada es audio mono a 16 kHz.

El entrenamiento se ha realizado con el paquete SITA, publicado por el propio autor (el repositorio incluye un runtime `sita_runtime-0.1.0-py3-none-any.whl`), y utiliza el dataset `twangodev/sita`. No se especifican en la información disponible el número de horas de audio, la composición exacta del corpus ni si se aplicaron técnicas de aumento de datos, regularización o decodificación con LM. Tampoco se documenta el uso de RLHF/DPO, algo esperable en un modelo CTC de ASR.

## Capacidades

- Reconocimiento automático del habla en hmong a partir de audio mono de 16 kHz.
- Salida de transcripción mediante decodificación CTC (greedy), sin necesidad de un modelo de lenguaje externo.
- Inferencia acelerada por GPU mediante el runtime SITA (`load_pretrained(..., device="cuda")`).
- API Python de alto nivel: `model.transcribe(audio, sample_rate=16000)`.
- No se documentan capacidades de traducción, diarización, detección de idioma, puntuación automática ni marcas de tiempo a nivel de palabra.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).

## Casos de uso

- Transcripción de entrevistas y testimonios en hmong: el modelo convierte grabaciones de audio a texto para proyectos de documentación lingüística y archivo oral, con la ventaja de ser un modelo abierto y ejecutable localmente.
- Subtitulado de vídeo para comunidades hmong: integrado en un pipeline de extracción de audio (ffmpeg) y transcripción, permite generar subtítulos en hmong para contenido divulgativo, educativo o institucional.
- Asistentes de voz en hmong: el modelo sirve como componente ASR en un sistema de dictado o de comandos por voz, alimentando un módulo de NLU posterior.
- Digitalización de servicios públicos: transcripción de llamadas o mensajes de voz en hmong en contextos de atención sanitaria o administrativa, donde el CER del 12,81% puede ser suficiente para triaje y enrutamiento.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible (WER 42,37% / CER 12,81% en validación disjunta por hablante) para comparar nuevas técnicas de ajuste fino o de decodificación.
- Aplicaciones educativas de aprendizaje del hmong: transcripción de material didáctico para generar ejercicios de lectura y evaluación de pronunciación.
- Procesamiento por lotes en servidores modestos: con 315 M de parámetros, puede desplegarse en una única GPU de consumo para transcribir lotes de audio en pipelines internos.

## Benchmarks y rendimiento

| Evaluación | Greedy WER | Greedy CER |
|---|---:|---:|
| Validación disjunta por hablante | 42,37% | 12,81% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR. No se dispone de comparaciones con otros sistemas ASR para hmong.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 315 M de parámetros en FP32, los pesos ocupan aproximadamente 1,26 GB; en FP16, unos 0,63 GB. Hay que sumar el overhead del runtime y del buffer de audio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; el runtime SITA admite `device="cuda"`.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, aunque no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: runtime SITA (`sita_runtime-0.1.0-py3-none-any.whl`) con PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a ASR CTC).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| twangodev/sita-omni-300m-asr | 315 M | hmong | audio 16 kHz | Apache 2.0 | Hugging Face |
| facebook/omniASR-W2V-300M (base) | ~300 M | multilingüe (según modelo base) | audio 16 kHz | no disponible en esta ficha | Hugging Face |
| Whisper (OpenAI) | 39 M – 1,55 B | multilingüe | audio 16 kHz | MIT (según variante) | Hugging Face / OpenAI |

No se dispone de datos de rendimiento comparables entre estos modelos para hmong en la información proporcionada. Whisper se incluye como referencia de categoría (ASR multilingüe), pero no se han verificado sus resultados en hmong.

## Limitaciones y advertencias

- El WER del 42,37% en validación disjunta por hablante es elevado: la transcripción puede contener errores frecuentes en palabras, aunque el CER del 12,81% sugiere que los errores a nivel de carácter son más contenidos.
- Solo soporta hmong; no se ha entrenado ni evaluado para otros idiomas.
- No se documentan sesgos específicos, pero al entrenarse con un corpus limitado (`twangodev/sita`) puede tener peor rendimiento en variantes dialectales, hablantes con acento marcado, audio con ruido o grabaciones de baja calidad.
- Riesgo de alucinación: en modelos CTC la salida está restringida al vocabulario de caracteres, pero pueden aparecer repeticiones o sustituciones en segmentos ambiguos.
- No se documentan marcas de tiempo, puntuación ni normalización de texto; la salida es la secuencia CTC decodificada.
- Requiere el runtime SITA propietario del autor (`sita_runtime-0.1.0-py3-none-any.whl`), lo que añade dependencia de un paquete no estándar.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base `facebook/omniASR-W2V-300M` antes de desplegar en producción.
- No se han publicado requisitos mínimos de hardware ni métricas de latencia/throughput, lo que dificulta dimensionar infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twangodev/sita-omni-300m-asr
- Modelo base: https://huggingface.co/facebook/omniASR-W2V-300M
- Dataset de entrenamiento: https://huggingface.co/datasets/twangodev/sita
- Paper referenciado: https://arxiv.org/abs/2601.09050
