# sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep

## Resumen

`sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep` es un ajuste fino (fine-tune completo) del modelo base `Qwen/Qwen3-TTS-12Hz-1.7B-Base` de Alibaba Qwen, especializado en síntesis de voz (text-to-speech) en telugu. Lo desarrolla el usuario `sw-voice` como trabajo de investigación, y su propósito es mejorar la calidad de la síntesis en telugu mediante un tokenizador de texto adaptado a caracteres de ese idioma en lugar del BPE a nivel de byte del modelo original.

El modelo parte de una arquitectura de TTS basada en el diseño Qwen3-TTS (talker + sub-talker, con cuantización temporal de 12 Hz), con 1.928.677.440 parámetros y pesos en safetensors. El ajuste se realizó sobre 34,4 horas de audio del corpus IndicTTS, con transcripciones generadas por Sarvam `saaras:v4`, y emplea un condicionamiento de voz por x-vector tomado de un clip de referencia.

Su relevancia es doble: por un lado, demuestra una receta reproducible de fine-tune para una lengua de bajos recursos como el telugu; por otro, introduce una innovación concreta de tokenización (100 tokens añadidos, uno por punto de código del bloque Unicode telugu) que reduce la fragmentación del texto de 1,69 a 1,16 tokens por carácter. La licencia Apache 2.0 facilita su reutilización comercial, aunque se trata de un modelo de investigación con cero descargas y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (talker + sub-talker) con cuantización temporal de 12 Hz; transformer para síntesis de voz |
| Parametros totales | 1.928.677.440 (~1,93 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso carga en bfloat16) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-TTS-12Hz-1.7B-Base |
| Pipeline | text-to-speech |
| Tamano del repositorio | 4,5 GB |
| Fecha de creacion | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-TTS del checkpoint base, que combina un componente generativo principal (talker) con un sub-talker y una representación de audio cuantizada a 12 Hz. Sobre esta base se aplicó un fine-tune completo (no LoRA) de todos los pesos durante 2 épocas: 2138 actualizaciones con batch efectivo de 2x4, tasa de aprendizaje constante de 1e-6 tras 50 pasos de warmup, AdamW con weight decay 0,01, clipping de gradiente de 1,0, pesos maestros en fp32 con autocast en bf16. La función de pérdida combina la cross-entropy del talker con 0,3 veces la del sub-talker.

El corpus de entrenamiento son 8548 clips (34,4 horas) de las filas de IndicTTS para telugu del conjunto `sw-voice/telugu-tts-indictts-sarvam-syspin`, con texto transcrito por Sarvam `saaras:v4`. La innovación principal es el tokenizador de caracteres telugu: se añadieron 100 tokens (ids 151676-151775) correspondientes a los puntos de código asignados del bloque Unicode telugu (letras, signos vocálicos, virama, anusvara, dígitos), inicializados como la media de los tokens de byte que sustituyen y alojados en filas libres del embedding de texto. El condicionamiento de hablante usa el x-vector del propio clip en la ranura de hablante, de modo que el modelo funciona como modelo base y la voz se elige aportando un audio de referencia. El autor indica haber corregido varios errores conocidos del script oficial `sft_12hz.py` (text_projection, desplazamiento único, estado del sub-talker p-1, etiquetas del sub-talker sin desplazar, pesos maestros en fp32).

## Capacidades

- Síntesis de voz (text-to-speech) en telugu a partir de texto escrito.
- Clonación de voz zero-shot mediante audio de referencia (`generate_voice_clone` con `ref_audio`).
- Modo de condicionamiento solo por x-vector (`x_vector_only_mode=True`), que captura el timbre del hablante sin necesidad de alinear el texto de referencia.
- Generación no streaming (`non_streaming_mode=True`) para obtener la locución completa de una vez.
- Lectura carácter a carácter del telugu gracias al tokenizador específico, con menor fragmentación que el BPE de bytes.
- Selección de idioma mediante el parámetro `language` (con valor `"Auto"` en el ejemplo).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al telugu según la model card.
- Capacidades de visión o audio de entrada más allá de la referencia de voz: no disponible.

## Casos de uso

- Locución de artículos y noticias en telugu: el modelo convierte texto periodístico en audio con una voz de referencia concreta, útil para medios digitales que quieran ofrecer versión hablada de sus contenidos sin contratar lectores.
- Audiolibros y contenido educativo: con 34,4 horas de entrenamiento en habla telugu y clonación por x-vector, permite narrar materiales didácticos manteniendo una voz consistente entre capítulos usando el mismo clip de referencia.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de documentos y webs en telugu, aprovechando que el tokenizador de caracteres reduce la fragmentación del texto y mejora la pronunciación de palabras nativas.
- Asistentes de voz para atención al cliente en telugu: integración en IVR o chatbots telefónicos donde se necesita una voz estable y reconocible; la clonación por referencia permite usar la voz de marca registrada del cliente.
- Doblaje y localización de vídeo: generación de pistas de voz en telugu para vídeos formativos o corporativos, sustituyendo la locución original por una voz clonada del presentador.
- Investigación en TTS para lenguas de bajos recursos: el modelo sirve como punto de partida y como receta reproducible (tokenizador de caracteres, hiperparámetros, correcciones al script oficial) para experimentar con otras lenguas indexadas en IndicTTS.
- Pruebas de concepto de clonación de voz: evaluación de la calidad de la clonación zero-shot en telugu con distintos clips de referencia antes de desplegar un sistema de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, SIM, MCD) ni comparaciones cuantitativas con otros sistemas de TTS en telugu.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,93 mil millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 3,9 GB; en fp32, unos 7,7 GB. A ello hay que sumar el coste del codificador de audio y del audio de referencia, por lo que se recomienda al menos 8 GB de VRAM en bf16.
- GPU recomendadas: A100, H100 o L40S para despliegues concurrentes; RTX 4090, RTX 3090 o RTX A6000 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) usando bfloat16.
- Opciones de despliegue: el ejemplo oficial usa la librería `qwen_tts` con `Qwen3TTSModel.from_pretrained` y `device_map="cuda:0"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep | 1,93 B | no disponible | telugu | Apache 2.0 | Fine-tune de investigación, sin benchmarks publicados |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ~1,7 B (según nombre) | no disponible | multilingüe (no detallado) | no disponible en la información | Modelo base del que deriva; sin ajuste específico para telugu |
| Otros sistemas TTS para telugu (IndicTTS, sistemas comerciales) | no disponible | no disponible | telugu | variable | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Modelo de investigación: el autor lo etiqueta explícitamente como "(research)"; no hay evidencia de validación en producción ni de evaluación objetiva de calidad.
- Cero descargas y cero likes en Hugging Face en la fecha de consulta: no existe comunidad que haya verificado su funcionamiento ni reportado fallos.
- Sin benchmarks publicados: no se puede afirmar su calidad relativa frente al modelo base ni frente a alternativas comerciales.
- Sesgos potenciales: al entrenarse solo con 34,4 horas de IndicTTS y transcripciones de un único sistema ASR (Sarvam `saaras:v4`), puede heredar sesgos de género, registro o dialecto del corpus y errores de transcripción del ASR.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, repeticiones o artefactos en textos fuera del dominio de entrenamiento.
- Limitación de idioma: solo soporta telugu; el tokenizador de caracteres está diseñado para el bloque Unicode telugu y no cubre otras escrituras.
- Dependencia de un audio de referencia: la voz se selecciona mediante un clip de referencia, por lo que la calidad y las características del clip condicionan el resultado; no se documenta una voz por defecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-TTS y de los datos IndicTTS, no detalladas en la información disponible.
- Caveat de reproducibilidad: el autor menciona correcciones a errores del script oficial `sft_12hz.py`; sin esas correcciones, reproducir el entrenamiento puede dar resultados distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Dataset de referencia citado: https://huggingface.co/sw-voice/telugu-tts-indictts-sarvam-syspin
- Repositorio de código citado: swamiji-tts, ruta `research/exp-iterations/08-qwen3-tts/experiments/06-te-char-tokens` (no se proporciona URL directa en la información disponible)
- Paper, blog o demo adicionales: no disponible
