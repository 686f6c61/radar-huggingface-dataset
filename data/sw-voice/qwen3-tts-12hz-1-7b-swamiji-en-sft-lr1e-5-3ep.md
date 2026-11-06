# sw-voice/qwen3-tts-12hz-1.7b-swamiji-en-sft-lr1e-5-3ep

## Resumen

qwen3-tts-12hz-1.7b-swamiji-en-sft-lr1e-5-3ep es un ajuste fino completo (full fine-tune) del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-Base, desarrollado por el usuario sw-voice. El modelo parte de la arquitectura Qwen3-TTS con tokenizador de audio a 12 Hz y 1.916 millones de parámetros, y se ha especializado en reproducir la voz de un hablante concreto denominado "swamiji" en inglés, mediante un conjunto de 719 clips limpios, deduplicados y con los finales recortados a 100 ms.

El modelo resuelve el problema de la clonación y personalización de voz sobre una base TTS moderna: en lugar de depender de un reference audio en cada inferencia, incorpora una voz personalizada fija ("swamiji") registrada como un x-vector de referencia en el speaker id 3000. Esto permite invocar la voz con una simple llamada a `generate_custom_voice` sin aportar muestras de audio en tiempo de ejecución, lo que simplifica el despliegue en producción.

Es relevante ahora porque demuestra el flujo completo de adaptación de Qwen3-TTS a un hablante concreto con recetas reproducibles (learning rate 1e-5 constante, AdamW con weight decay 0.01, 3 épocas, 270 actualizaciones) y porque corrige varios bugs conocidos del script oficial `sft_12hz.py`. El resultado es un modelo de investigación, publicado bajo licencia Apache 2.0, que sirve como referencia para cualquiera que quiera hacer fine-tuning de voz sobre la familia Qwen3-TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (text-to-speech, tokenizador de audio a 12 Hz, talker + sub-talker) |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-TTS-12Hz-1.7B-Base |
| Tamano del repo | 4.5 GB |
| Pipeline | text-to-speech |
| Voz personalizada | swamiji (x-vector fijo en speaker id 3000) |
| Dataset de ajuste | sw-voice/swamiji-voice-sft-reuse (719 clips, RE-USE cleaned, deduplicados, finales recortados a 100 ms) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-TTS-12Hz-1.7B-Base: un sistema TTS con tokenizador de audio a 12 Hz y una estructura de dos cabezas, un talker principal y un sub-talker, que se entrenan con pérdida de entropía cruzada (CE). La pérdida total del ajuste es `talker CE + 0.3 × sub-talker CE`. El ajuste fino es completo (no LoRA), con pesos maestros en fp32 y autocast en bf16.

El entrenamiento se realizó sobre 719 clips de la voz "swamiji" en inglés, procedentes del dataset `sw-voice/swamiji-voice-sft-reuse`, limpiados y deduplicados, con los finales recortados a 100 ms. La configuración fue: learning rate 1e-5 constante tras 10 actualizaciones de warmup, batch efectivo 4×2, 3 épocas (270 actualizaciones), optimizador AdamW con weight decay 0.01 y grad clipping 1.0. El autor indica que corrigió varios bugs del script oficial `sft_12hz.py`: `text_projection`, un único shift, estado del sub-talker en p-1, etiquetas del sub-talker sin shift y pesos maestros en fp32. La voz personalizada se implementa como un x-vector de referencia fijo registrado en el speaker id 3000.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés con una voz personalizada fija ("swamiji").
- Generación de audio sin necesidad de aportar un reference audio en cada inferencia: la voz se selecciona con `speaker="swamiji"`.
- Soporte de modo no streaming (`non_streaming_mode=True`) en la API de `qwen_tts`.
- Selección de idioma mediante el parámetro `language` (el modelo está ajustado solo para inglés; el ejemplo usa `"Auto"`).
- Inferencia en bf16 sobre GPU (`device_map="cuda:0"`, `dtype=torch.bfloat16`).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente TTS.

## Casos de uso

- Clonación de voz de un hablante concreto: el modelo permite generar locuciones con la voz "swamiji" sin aportar muestras en cada llamada, gracias al x-vector fijo registrado en el speaker id 3000. Adecuado para producir contenido de audio consistente con una identidad de voz estable.
- Generación de audiolibros y narración: al estar ajustado sobre 719 clips limpios y deduplicados, puede emplearse para narrar textos largos en inglés manteniendo el timbre del hablante de referencia.
- Doblaje y localización de contenido en inglés: integrado en un pipeline que reciba texto y devuelva wavs a 12 Hz de tokenización, sirve para regenerar pistas de voz de un mismo personaje.
- Asistentes de voz y IVR: la API `generate_custom_voice` permite sintetizar respuestas de un asistente con una voz corporativa fija, sin gestionar referencias de audio por sesión.
- Investigación en adaptación de TTS: el modelo y su receta (LR 1e-5, 3 épocas, correcciones del script oficial) sirven como punto de partida reproducible para ajustar Qwen3-TTS a otros hablantes.
- Generación de material de accesibilidad: conversión de texto a voz con una voz concreta para lectores de pantalla o contenido educativo, en despliegues donde la identidad de voz sea un requisito.
- Pruebas de calidad y evaluación de TTS: al ser un modelo de investigación con pipeline `text-to-speech`, es útil para comparar la fidelidad de clonación frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 1.916 millones de parámetros en bf16, los pesos ocupan aproximadamente 3,8 GB; el repo completo pesa 4,5 GB. Hay que sumar el overhead del tokenizador de audio y del runtime de `qwen_tts`.
- GPU recomendadas: el ejemplo del autor usa `device_map="cuda:0"` con bf16, por lo que se requiere una GPU NVIDIA con soporte bf16 (Ampere o posterior: A100, H100, RTX 3090, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y GPUs con al menos 8-12 GB de VRAM, aunque el autor no publica cifras exactas.
- Opciones de despliegue: la API oficial es la librería `qwen_tts` (`Qwen3TTSModel.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3-tts-12hz-1.7b-swamiji-en-sft-lr1e-5-3ep | 1.916 M | no disponible | en | apache-2.0 | Fine-tune de voz "swamiji" sobre Qwen3-TTS-12Hz-1.7B-Base |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1.7 B (aprox., segun nombre) | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base sin voz personalizada; requiere reference audio |
| Otros TTS open source (p. ej. familia XTTS, Bark) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparativa con alternativas de la misma categoria queda limitada a la relacion con su modelo base; no se dispone de datos de rendimiento ni de especificaciones verificadas de otros TTS open source en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo etiqueta explícitamente como "(research)"; no hay garantías de robustez en producción.
- Solo inglés: el ajuste se realizó sobre clips en inglés y el campo `language` de la model card es `[en]`; no se debe esperar calidad en otros idiomas.
- Voz única: está especializado en el hablante "swamiji" (speaker id 3000); no es un modelo TTS general multihablante.
- Dataset pequeño: 719 clips de ajuste, lo que puede limitar la cobertura prosódica y de dominios frente al modelo base.
- Riesgo de alucinación en audio: como todo TTS generativo, puede producir artefactos, pronunciaciones incorrectas o inestabilidad en textos largos o fuera de dominio.
- Sesgos: no se documentan análisis de sesgos; al derivar de una voz concreta, puede heredar características del hablante de referencia.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo se publica sin evaluación de benchmarks.
- Sin datos de benchmarks ni de latencia/throughput: no es posible estimar calidad objetiva ni coste de inferencia a partir de la información disponible.
- Dependencia de la librería `qwen_tts` y del formato de pesos safetensors; no se documentan conversiones a GGUF u otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-en-sft-lr1e-5-3ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Dataset de ajuste: sw-voice/swamiji-voice-sft-reuse (referenciado en la model card; no se proporciona URL directa)
- Codigo del experimento: swamiji-tts `research/exp-iterations/08-qwen3-tts/experiments/01-en-full-sft-lr-grid` (referenciado en la model card; no se proporciona URL directa)
