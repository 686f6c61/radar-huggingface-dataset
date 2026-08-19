# vibevoice/VibeVoice-7B

## Resumen

VibeVoice-7B es un modelo de texto a voz (TTS) de código abierto desarrollado por Microsoft, diseñado para generar audio conversacional expresivo, de larga duración y con múltiples hablantes, como podcasts, a partir de texto. El modelo combina un LLM basado en Qwen2.5 con tokenizadores de habla continuos (acústico y semántico) que operan a una frecuencia ultrabaja de 7,5 Hz, y una cabeza de difusión que genera los detalles acústicos de alta fidelidad. Esta arquitectura permite sintetizar hasta 90 minutos de audio con hasta 4 hablantes distintos, superando las limitaciones de los sistemas TTS tradicionales que suelen manejar uno o dos hablantes y secuencias cortas.

El modelo se publicó en septiembre de 2025 bajo licencia MIT, con soporte para inglés y chino. Aunque su nombre indica 7B de parámetros, los pesos reales en safetensors suman 9.343.355.361 parámetros (aproximadamente 9,3B). Es relevante ahora porque representa un avance significativo en TTS generativo de largo contexto, con una arquitectura innovadora que separa la comprensión semántica del diálogo de la síntesis acústica, y porque su liberación como open source permite a la comunidad investigadora y de desarrollo explorar generación de audio conversacional realista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LLM (Qwen2.5) + tokenizadores acustico y semantico continuos + cabeza de difusion (DDPM) |
| Parametros totales | 9.343.355.361 (safetensors) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrenado con curriculum hasta 32K) |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VibeVoice-7B emplea un enfoque de "siguiente token" con difusion. El LLM base es Qwen2.5, que procesa el texto y el flujo de dialogo para generar representaciones semanticas. Estas representaciones se condicionan a una cabeza de difusion ligera (4 capas, ~600M de parametros) que predice las features acusticas del VAE mediante un proceso de Denoising Diffusion Probabilistic Models (DDPM), utilizando Classifier-Free Guidance (CFG) y DPM-Solver en inferencia. Los tokenizadores acustico y semantico operan a 7,5 Hz, con un downsampling de 3200x desde audio de 24 kHz. El tokenizador acustico se basa en una variante de sigma-VAE (propuesta en LatentLM) con estructura encoder-decoder de 7 etapas de bloques Transformer modificados (~340M parametros cada uno). El tokenizador semantico comparte arquitectura pero sin componentes VAE y se entrena con una tarea proxy de reconocimiento de habla (ASR).

El entrenamiento se realiza en dos fases: primero se pre-entrenan los tokenizadores por separado, y luego se congelan mientras se entrena el LLM y la cabeza de difusion. Se usa una estrategia de curriculum de longitud de secuencia que aumenta progresivamente de 4K a 16K y finalmente a 32K tokens. El modelo se entrena exclusivamente con datos de habla en ingles y chino.

## Capacidades

- Generacion de audio conversacional expresivo y de larga duracion (hasta 90 minutos) con hasta 4 hablantes distintos.
- Sintesis de habla natural con control de turnos de conversacion, adecuado para podcasts, audiolibros dialogados y narraciones multi-personaje.
- Soporte de contexto largo: ventana de 32K tokens que permite mantener coherencia y consistencia de voz a lo largo de secuencias extensas.
- Capacidad multilingue limitada a ingles y chino; otros idiomas no estan soportados y pueden producir salidas ininteligibles.
- No genera audio no hablado (musica, efectos de sonido, ambiente) ni solapamiento de habla entre interlocutores.
- No incluye capacidades de vision, tool calling ni agentes; es un modelo puramente de texto a voz.

## Casos de uso

- **Generacion de podcasts automatizada**: el modelo puede convertir guiones de texto en conversaciones multipersona con voces diferenciadas y turnos naturales, reduciendo el coste de produccion de contenido de audio.
- **Audiolibros con multiples narradores**: permite crear versiones audio de novelas o documentos con distintos personajes, manteniendo la consistencia de voz a lo largo de capitulos extensos gracias a su contexto de 32K tokens.
- **Creacion de contenido educativo**: desarrollo de lecciones en formato dialogo entre profesor y alumno, o explicaciones con multiples perspectivas, para plataformas de e-learning.
- **Doblaje de contenido audiovisual**: aunque esta limitado a ingles y chino, puede usarse para doblar dialogos de series o peliculas en esos idiomas, generando voces diferenciadas por personaje.
- **Asistentes de voz con personalidad**: integracion en sistemas de interaccion por voz que requieren respuestas largas y contextuales, como asistentes de bienestar o companeros de conversacion.
- **Investigacion en TTS y procesamiento de habla**: sirve como base para estudiar generacion de audio de largo contexto, consistencia de hablante y tecnicas de difusion aplicadas a voz, gracias a su licencia MIT y codigo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del modelo no incluye metricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- El modelo tiene 9.343.355.361 parametros; en FP16 los pesos ocupan aproximadamente 18,7 GB (coincide con el tamano del repo). Para inferencia se recomienda una GPU con al menos 24 GB de VRAM, como NVIDIA RTX 3090, RTX 4090 o A5000.
- Para generar secuencias de hasta 90 minutos, el consumo de memoria puede aumentar debido a las activaciones del transformer y la cabeza de difusion; se recomienda una GPU con 32 GB o mas (A100, H100) para produccion.
- No se han publicado requisitos oficiales de VRAM ni latencia. Las estimaciones se basan en el tamano del modelo y la arquitectura de difusion.
- Opciones de despliegue: el repositorio de GitHub proporciona instrucciones de instalacion y scripts de inferencia. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo TTS con pipeline especifico.
- Para uso en CPU no es practico debido al tamano y la naturaleza secuencial de la generacion de audio; se requiere GPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos TTS de la misma categoria en la informacion proporcionada. Modelos como XTTS v2, Tortoise TTS o F5-TTS son alternativas populares, pero VibeVoice-7B se distingue por su capacidad de generar audio de hasta 90 minutos con multiples hablantes y su arquitectura de difusion sobre tokenizadores continuos a 7,5 Hz. No hay datos publicados que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El modelo esta limitado a uso de investigacion segun la model card, aunque la licencia es MIT. Esto puede generar ambiguedad legal para uso comercial; se recomienda revisar los terminos del repositorio de GitHub antes de desplegarlo en produccion.
- Solo soporta ingles y chino; transcripciones en otros idiomas pueden producir audio ininteligible o ofensivo.
- Riesgo de uso indebido para suplantacion de voz, desinformacion o fraude. El modelo puede generar voces realistas de personas sin consentimiento, lo que constituye un riesgo de seguridad importante.
- No genera musica, efectos de sonido ni ambiente; solo habla.
- No modela solapamiento de habla entre interlocutores, lo que puede resultar en conversaciones menos naturales en escenarios con interrupciones.
- Puede heredar sesgos y errores del modelo base Qwen2.5, aunque no se han documentado casos especificos.
- No se proporcionan benchmarks ni garantias de calidad; se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vibevoice/VibeVoice-7B
- Repositorio de codigo (Microsoft): https://github.com/microsoft/VibeVoice
- Repositorio de codigo (comunidad): https://github.com/vibevoice-community/VibeVoice
- Informe tecnico (arXiv): https://arxiv.org/abs/2508.19205
- Pagina del proyecto: https://microsoft.github.io/VibeVoice
- Articulo de referencia para tokenizador acustico (LatentLM): https://arxiv.org/pdf/2412.08635
- Re-upload alternativo en Hugging Face: https://huggingface.co/aoi-ot/VibeVoice-7B
