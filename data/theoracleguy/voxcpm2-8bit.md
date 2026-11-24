# theoracleguy/VoxCPM2-8bit

## Resumen

VoxCPM2-8bit es una conversión cuantizada a 8 bits del modelo de síntesis de voz openbmb/VoxCPM2, realizada por el usuario theoracleguy para el ecosistema MLX de Apple Silicon. Se trata de un modelo TTS (text-to-speech) de 2.383.791.940 parámetros que genera audio a 48 kHz y que combina clonación de voz, diseño de voz a partir de descripciones textuales y síntesis multilingüe en hasta 30 idiomas. La cuantización se aplica únicamente a las capas del modelo de lenguaje (LM), mientras que el VAE y el DiT se mantienen en precisión completa, lo que busca preservar la calidad del audio generado.

El modelo resuelve el problema de desplegar un TTS de alta fidelidad en hardware de consumo Apple Silicon, donde el modelo original en bf16 ocupa 4,96 GB y no siempre es viable en equipos con memoria unificada limitada. Esta variante reduce el tamaño a 3,23 GB y acelera la inferencia hasta un factor RTF de 0,85x con 7 timesteps, frente al 0,48x del modelo en bf16. La relevancia actual radica en la disponibilidad de un pipeline TTS completo y licenciado Apache 2.0 que puede ejecutarse localmente en Macs sin depender de servicios en la nube.

La ficha se centra en la variante 8-bit publicada en Hugging Face, con 367 descargas y actualizada el 31 de octubre de 2026. Al ser una conversión del modelo base openbmb/VoxCPM2, muchas especificaciones del modelo original (arquitectura interna, datos de entrenamiento, benchmarks) no están documentadas en la información disponible y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con LM, VAE y DiT; la cuantización 8-bit aplica solo a las capas LM) |
| Parametros totales | 2.383.791.940 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (capas LM); VAE y DiT en precisión completa; existe también variante 4-bit y bf16 |
| Idiomas soportados | en, zh, id, ja, ko, multilingual; la model card menciona 30 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería mlx-audio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base openbmb/VoxCPM2 más allá de que combina un modelo de lenguaje (LM), un VAE y un DiT (Diffusion Transformer). La conversión a 8 bits cuantiza exclusivamente las capas del LM, manteniendo el VAE y el DiT en precisión completa, una decisión de diseño que sugiere que la calidad del audio depende críticamente de estos dos componentes y que cuantizarlos degradaría la salida.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card de esta variante tampoco documenta innovaciones técnicas adicionales más allá de la propia conversión a MLX y la cuantización selectiva. El modelo soporta cuatro modos de generación (zero-shot, continuación, clonación por referencia y combinado) y permite controlar el número de timesteps de inferencia y el valor de CFG (classifier-free guidance), con valores de referencia de 7 timesteps y cfg_value=2.0.

## Capacidades

- Generación de voz a 48 kHz con calidad de estudio a partir de texto.
- Clonación de voz a partir de una referencia de audio corta y su texto correspondiente.
- Diseño de voz mediante descripciones textuales (voice design), sin necesidad de audio de referencia.
- Cuatro modos de generación: zero-shot, continuación, clonación por referencia y combinado.
- Soporte multilingüe: inglés, chino, indonesio, japonés, coreano y hasta 30 idiomas según la model card.
- Control de la inferencia mediante parámetros como inference_timesteps y cfg_value.
- Integración con el ecosistema MLX de Apple Silicon a través de la librería mlx-audio.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia para clonación.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz a 48 kHz con calidad de estudio, adecuada para producción de contenido narrado largo, con control de timesteps para ajustar latencia y calidad.
- Clonación de voz para doblaje: usando una muestra corta de un locutor y su transcripción, se puede replicar su timbre en nuevos textos, útil para doblaje de vídeos o podcasts multilingües.
- Asistentes de voz locales en macOS: al ejecutarse sobre MLX en Apple Silicon, permite integrar TTS en aplicaciones de escritorio sin enviar texto a servicios externos.
- Diseño de personajes para videojuegos: la función de voice design permite crear voces nuevas a partir de descripciones ("mujer joven, voz suave y dulce") sin disponer de grabaciones previas.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad en varios idiomas (en, zh, id, ja, ko) con inferencia local.
- Prototipado rápido de interfaces de voz: el modo zero-shot y la API de Python permiten generar muestras en segundos para validar experiencias de usuario antes de invertir en grabaciones profesionales.
- Contenido multilingüe: generación de locuciones en inglés, chino, indonesio, japonés y coreano desde un único modelo, simplificando pipelines de localización.

## Benchmarks y rendimiento

La model card proporciona datos de rendimiento en Apple Silicon medidos como RTF (Real-Time Factor), donde valores superiores a 1,0 indican inferencia más rápida que el tiempo real.

| Variante | Tamano | RTF (7 timesteps) |
|---|---|---|
| bf16 | 4,96 GB | 0,48x |
| 8-bit | 3,23 GB | 0,85x |
| 4-bit | 2,30 GB | 0,90x |

No se han publicado resultados de benchmarks de calidad de audio (MOS, WER, similitud de voz) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,23 GB para la variante 8-bit; 2,30 GB para la 4-bit; 4,96 GB para bf16.
- Hardware objetivo: Apple Silicon (MLX); no se documenta soporte para GPU NVIDIA o AMD en esta variante.
- Cabe en equipos Mac con memoria unificada de 8 GB o superior, aunque se recomienda 16 GB para margen con el sistema operativo y otras aplicaciones.
- Despliegue: librería mlx-audio (pip install mlx-audio), con CLI (`python -m mlx_audio.tts.generate`) y API de Python (`mlx_audio.tts.load_model`).
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para esta variante MLX.
- Throughput: RTF de 0,85x con 7 timesteps en la variante 8-bit, lo que implica una velocidad ligeramente inferior al tiempo real; el modelo bf16 alcanza 0,48x (más lento que tiempo real).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VoxCPM2-8bit (esta ficha) | 2,38 B | no disponible | 30 (en, zh, id, ja, ko, ...) | Apache 2.0 | safetensors (MLX) |
| openbmb/VoxCPM2 (bf16) | 2,38 B | no disponible | 30 | Apache 2.0 | safetensors |
| VoxCPM2-4bit (misma familia) | 2,38 B | no disponible | 30 | Apache 2.0 | safetensors (MLX) |

No se dispone de información sobre otros modelos TTS comparables (por ejemplo, XTTS, Bark o Fish Speech) en la documentación proporcionada, por lo que no se incluyen datos de rendimiento comparativo.

## Limitaciones y advertencias

- Al ser una cuantización 8-bit de las capas LM, puede existir una degradación sutil de la calidad o naturalidad respecto al modelo bf16, no cuantificada en la información disponible.
- La clonación de voz plantea riesgos de suplantación de identidad y uso fraudulento; es responsabilidad del usuario cumplir la normativa aplicable y obtener consentimiento.
- No se documentan sesgos específicos del modelo ni del dataset de entrenamiento original.
- Riesgo de alucinación en la pronunciación o en la prosodia ante textos ambiguos, siglas o nombres propios poco frecuentes; no cuantificado.
- La longitud máxima de texto por generación y el contexto del LM no están documentados.
- Compatibilidad limitada al ecosistema MLX/Apple Silicon; no apto para despliegue en GPU NVIDIA sin conversión adicional.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base openbmb/VoxCPM2 y las obligaciones de atribución.
- El repositorio tiene pocas descargas (367) y ningún "like", lo que sugiere una validación comunitaria limitada.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/theoracleguy/VoxCPM2-8bit
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- Variante de referencia en la model card: https://huggingface.co/mlx-community/VoxCPM2-8bit
