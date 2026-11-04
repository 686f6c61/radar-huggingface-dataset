# sw-voice/qwen3-tts-12hz-1.7b-swamiji-en-sft-lr1e-6-3ep

## Resumen

qwen3-tts-12hz-1.7b-swamiji-en-sft-lr1e-6-3ep es un ajuste fino completo (full fine-tune) del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-Base, publicado por el usuario sw-voice. El modelo parte de la arquitectura Qwen3-TTS con tokenizador acústico de 12 Hz y 1.916.676.352 parámetros, y se ha especializado en una única voz sintética denominada `swamiji`, construida a partir de un x-vector de referencia fijo asociado al speaker id 3000.

El propósito del modelo es puramente investigador: clonar y reproducir de forma controlada una voz concreta en inglés mediante un identificador de hablante personalizado, en lugar de depender de prompts de audio en tiempo de inferencia. El entrenamiento se realizó sobre 719 clips de inglés de Swamiji, limpiados, deduplicados y con los finales recortados a 100 ms, empleando la receta oficial `sft_12hz.py` con varias correcciones documentadas por el autor.

Es relevante ahora porque expone un flujo reproducible de ajuste fino de TTS sobre una base Apache 2.0, con hiperparámetros explícitos (LR 1e-6 constante, 3 épocas, 270 updates) y correcciones a bugs conocidos del script oficial, lo que sirve como referencia técnica para quien quiera adaptar Qwen3-TTS a un hablante propio. No obstante, se trata de un experimento con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS con tokenizador acústico de 12 Hz (talker + sub-talker), derivada de Qwen/Qwen3-TTS-12Hz-1.7B-Base |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor usa bfloat16 en inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-TTS-12Hz-1.7B-Base, un sistema de text-to-speech basado en un componente principal (talker) que predice tokens acústicos a una frecuencia de 12 Hz y un sub-talker que refina la salida. El ajuste fino es completo, no LoRA: se actualizan todos los pesos con pesos maestros en fp32 y autocast en bf16. La función de pérdida combina la cross-entropy del talker con 0,3 veces la cross-entropy del sub-talker.

El entrenamiento usó el dataset sw-voice/swamiji-voice-sft-reuse (719 clips en inglés, limpiados, deduplicados y con finales recortados a 100 ms), con batch 4x2, LR constante de 1e-6 tras 10 updates de warmup, 3 épocas (270 updates totales), AdamW con weight decay 0,01 y grad clipping de 1,0. El autor documenta correcciones sobre el script oficial `sft_12hz.py`: proyección de texto (`text_projection`), un único shift, estado del sub-talker en p-1, etiquetas del sub-talker sin shift y pesos maestros en fp32.

La innovación principal no es arquitectónica sino metodológica: la voz se fija mediante un x-vector de referencia constante asignado al speaker id 3000, lo que permite invocar la voz con `speaker="swamiji"` sin aportar audio de referencia en cada llamada.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- Generación con voz personalizada fija mediante el identificador `speaker="swamiji"` (x-vector de referencia predefinido).
- Modo de generación no streaming (`non_streaming_mode=True`) según el ejemplo del autor.
- Inferencia en bfloat16 sobre GPU CUDA mediante la librería `qwen_tts`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés según el campo `language: [en]`; el ejemplo usa `language="Auto"`, pero no hay evidencia de otros idiomas en la información disponible.

## Casos de uso

- Investigación en clonación de voz: servir como referencia reproducible de un full fine-tune de Qwen3-TTS sobre un hablante concreto, con hiperparámetros y correcciones documentadas para replicar el experimento.
- Generación de narración en inglés con una voz consistente: al fijar el x-vector en el speaker id 3000, se obtiene timbre estable entre llamadas sin necesidad de enviar audio de referencia, útil para audiolibros o contenido narrado de un solo locutor.
- Pruebas de calidad de TTS en pipelines de evaluación: comparar la salida del modelo ajustado frente a la base Qwen3-TTS-12Hz-1.7B-Base para medir el efecto del fine-tune sobre 719 clips.
- Prototipado de asistentes de voz en inglés: integrar el modelo en un servicio que reciba texto y devuelva waveform, usando `Qwen3TTSModel.from_pretrained` con `device_map="cuda:0"`.
- Docencia y divulgación sobre ajuste fino de modelos de voz: el repositorio de código `research/exp-iterations/08-qwen3-tts/experiments/01-en-full-sft-lr-grid` documenta la rejilla de experimentos de learning rate.
- Base para nuevos fine-tunes de hablante: al ser Apache 2.0 y safetensors, puede partirse de estos pesos para adaptar la voz a otro locutor o dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.916.676.352 parámetros, en bf16 los pesos ocupan aproximadamente 3,8 GB, por lo que se necesita margen adicional para activaciones y buffers del tokenizador acústico.
- GPU recomendadas: no disponible en la información proporcionada; el ejemplo del autor usa `device_map="cuda:0"` con `dtype=torch.bfloat16`.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos en bf16 cabría en GPUs con 8 GB o más, pero no hay datos publicados de latencia ni de memoria pico.
- Opciones de despliegue: librería `qwen_tts` (`Qwen3TTSModel.from_pretrained`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Estado |
|---|---|---|---|---|---|
| qwen3-tts-12hz-1.7b-swamiji-en-sft-lr1e-6-3ep | 1.916.676.352 | no disponible | en | apache-2.0 | Fine-tune de investigación, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7 B (según nombre) | no disponible | no disponible | no disponible en la información proporcionada | Modelo base oficial |
| Alternativas de TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente como `research` por el autor; no está pensado como producto listo para producción.
- Especializado en una única voz (`swamiji`) y en inglés; no es un TTS multilingüe ni multi-hablante general.
- Riesgo de alucinación acústica y artefactos de pronunciación fuera del dominio de los 719 clips de entrenamiento.
- Sesgos potenciales heredados del dataset de voz de origen y del modelo base Qwen3-TTS; no se documenta ninguna evaluación de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de voz de origen pueden tener condiciones adicionales no detalladas en la información disponible.
- Sin métricas publicadas de calidad (MOS, WER, similitud de hablante); imposible evaluar objetivamente el rendimiento.
- Cero descargas y cero likes en el momento de la consulta: no hay validación por parte de la comunidad.
- Requiere la librería `qwen_tts` y un entorno con CUDA; no se documentan alternativas de inferencia en CPU.
- El identificador de speaker 3000 y el x-vector asociado son específicos de este checkpoint; no son transferibles a otros modelos Qwen3-TTS.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-en-sft-lr1e-6-3ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Dataset de ajuste fino: sw-voice/swamiji-voice-sft-reuse (referenciado en la model card; no se proporciona URL directa)
- Código del experimento: `swamiji-tts`, ruta `research/exp-iterations/08-qwen3-tts/experiments/01-en-full-sft-lr-grid` (referenciada en la model card; no se proporciona URL directa)
