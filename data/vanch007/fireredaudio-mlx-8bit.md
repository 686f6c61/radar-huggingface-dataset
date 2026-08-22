# vanch007/FireRedAudio-MLX-8bit

## Resumen

FireRedAudio-MLX-8bit es un checkpoint cuantizado a 8 bits del modelo FireRedAudio, un modelo de lenguaje de audio multimodal de 9B parámetros desarrollado por el equipo FireRedTeam y adaptado a Apple Silicon mediante el framework MLX por vanch007. El modelo original resuelve tareas de comprensión y generación de audio de forma unificada, incluyendo reconocimiento de voz (ASR), texto a voz con clonación de voz, edición de voz y diseño de voz. Esta versión MLX está optimizada para ejecutarse de forma nativa en la GPU Metal de los Mac con chips de la serie M, lo que permite inferencia en tiempo real en equipos de consumo.

El checkpoint publicado en HuggingFace contiene 5.287.302.914 parámetros en formato safetensors, con un tamaño de repositorio de 14,6 GB. La arquitectura combina un LLM base Qwen3.5 de 9B con cuantización selectiva de 8 bits (group_size=64), un autoencoder de audio continuo RedAE, un vocoder ISTFT en precisión completa y una cabeza de generación basada en Flow Matching DiT de 11 capas. El modelo soporta chino e inglés, y se distribuye bajo licencia Apache 2.0.

La relevancia de este checkpoint reside en su rendimiento medido en Apple Silicon: alcanza un factor de tiempo real (RTF) de 0,1396 para ASR (unas 7,2 veces más rápido que el tiempo real) y de 0,7529 para TTS con clonación de voz, usando solo 13,54 GB de memoria Metal activa. Esto lo hace viable en Mac de 16 GB o 24 GB de RAM unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM multimodal (Qwen3.5 9B) + encoder acustico Whisper/Conv1D + autoencoder RedAE VAE + vocoder ISTFT + head de generacion Flow Matching DiT (11 capas) |
| Parametros totales | 5.287.302.914 (modelo original 9B, cuantizado selectivamente a 8 bits) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine selectiva (group_size=64) en el LLM; FP32/BF16 para autoencoder, vocoder y encoder |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

FireRedAudio-MLX-8bit es un modelo multimodal de audio que combina varios componentes. El backbone es un LLM Qwen3.5 de 9B parámetros, cuantizado selectivamente a 8 bits con group size de 64 para reducir el uso de memoria sin degradar excesivamente la calidad. El modelo integra un encoder acústico basado en Whisper/Conv1D para comprensión de audio y un autoencoder continuo RedAE VAE junto con un vocoder ISTFT para la reconstrucción de audio con fidelidad de fase. La generación de audio se realiza mediante un head de 11 capas basado en Flow Matching DiT.

La versión MLX conserva en alta precisión (FP32/BF16) los componentes críticos para la fidelidad de audio —autoencoder, vocoder y encoder— mientras que solo el LLM se cuantiza a 8 bits. El entrenamiento original del modelo FireRedAudio no está documentado en la información proporcionada; no se especifican los datos de entrenamiento ni el uso de RLHF/DPO. La adaptación MLX incluye kernels optimizados para Metal, atención SDPA fusionada y un kernel Gated Delta Metal para acelerar la inferencia en hardware de Apple.

## Capacidades

- Reconocimiento de voz (ASR): transcripción de audio en chino e inglés con RTF de 0,1396, aproximadamente 7,2 veces más rápido que el tiempo real.
- Texto a voz (TTS) con clonación de voz zero-shot: genera voz a partir de texto y un audio de referencia de pocos segundos, sin necesidad de entrenamiento adicional.
- Edición de voz: permite modificar o sustituir segmentos de audio manteniendo la identidad de la voz original.
- Diseño de voz: capacidad de crear voces sintéticas personalizadas a partir de descripciones o referencias.
- Comprensión multimodal de audio: el modelo integra reconocimiento y generación en un solo marco, permitiendo tareas como transcribir y responder en texto o audio.
- Soporte bilingüe: chino e inglés, tanto en entrada como en salida.
- Inferencia en tiempo real en Apple Silicon: gracias a la cuantización 8-bit y a las optimizaciones Metal, el modelo puede ejecutarse en Mac de 16 GB o más.

## Casos de uso

- Transcripción de reuniones y entrevistas: con un RTF de 0,14, el modelo puede transcribir en tiempo real conversaciones en chino o inglés, integrándose en aplicaciones de productividad o subtitulado automático.
- Asistentes de voz locales en Mac: permite construir asistentes de voz que ejecutan ASR y TTS en el dispositivo, sin enviar datos a la nube, ideal para entornos con requisitos de privacidad.
- Clonación de voz para producción de contenidos: un creador puede generar narraciones con su propia voz o con voces de referencia a partir de un audio de pocos segundos, acelerando la producción de audiolibros, podcasts o vídeos.
- Edición de voz para postproducción: corregir errores de dicción o sustituir palabras en una grabación manteniendo la coherencia de la voz, sin regrabar.
- Diseño de voces para videojuegos o animación: generar voces personalizadas para personajes a partir de descripciones, reduciendo el coste de casting de actores.
- Accesibilidad: convertir texto en voz natural para usuarios con dificultades de lectura o generar transcripciones para personas con discapacidad auditiva.
- Despliegue en entornos Apple Silicon: integración en apps de macOS o iPadOS mediante el repositorio MLX, con interfaz WebUI para prototipado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son los factores de tiempo real (RTF) en Apple M3 Max:

| Tarea | RTF | Velocidad relativa |
|---|---|---|
| ASR (transcripción) | 0,1396 | ~7,2x tiempo real |
| TTS (clonación de voz) | 0,7529 | ~1,33x tiempo real |

No se dispone de comparativas con otros modelos en los mismos benchmarks.

## Requisitos de hardware

- Memoria activa: 13,54 GB de memoria Metal activa durante la inferencia; compatible con Mac de 16 GB o 24 GB de RAM unificada.
- GPU: requiere Apple Silicon con Metal GPU nativa. El rendimiento de referencia se obtuvo en Apple M3 Max.
- No compatible con GPU NVIDIA/AMD ni con sistemas x86; es un checkpoint MLX exclusivo para Apple Silicon.
- Opciones de despliegue: MLX framework, con CLI y WebUI Studio (Gradio) incluidos en el repositorio `vanch007/mlx-FireRedAudio`.
- Latencia estimada: en M3 Max, la transcripción de un audio de 1 segundo tarda aproximadamente 0,14 segundos; la generación de 1 segundo de voz tarda unos 0,75 segundos.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. Como referencia cualitativa, el modelo original FireRedAudio compite con otros modelos de audio multimodales como Qwen2-Audio y Mini-Omni, pero no se han publicado datos de benchmarks comparativos. La versión MLX se diferencia por su optimización específica para Apple Silicon, mientras que las alternativas suelen requerir GPUs NVIDIA con CUDA.

## Limitaciones y advertencias

- Solo soporta chino e inglés; no hay soporte para otros idiomas.
- La cuantización selectiva de 8 bits puede degradar ligeramente la calidad del audio generado en comparación con la versión en full precisión.
- Requiere Apple Silicon con Metal; no se puede ejecutar en GPU NVIDIA o AMD.
- No se ha documentado el proceso de entrenamiento (datos, tokens, RLHF), lo que limita la evaluación de sesgos.
- Riesgo de alucinación en transcripciones o generaciones: como cualquier modelo de lenguaje, puede producir contenido no fiel al audio de entrada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las restricciones de los componentes subyacentes (Qwen3.5, Whisper) si se utiliza en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la publicación; se trata de un port reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vanch007/FireRedAudio-MLX-8bit
- Repositorio GitHub del port MLX y WebUI Studio: https://github.com/vanch007/mlx-FireRedAudio
- Repositorio oficial de FireRedAudio: https://github.com/FireRedTeam/FireRedAudio
- Framework MLX de Apple: https://github.com/ml-explore/mlx
