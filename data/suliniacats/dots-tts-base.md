# suliniacats/dots.tts-base

## Resumen

dots.tts-base es un sistema de síntesis de voz de texto a voz (TTS) completamente continuo y autoregresivo de extremo a extremo, desarrollado por el equipo de studio-dots-ai. Con aproximadamente 2.200 millones de parámetros, el modelo combina un codificador semántico, un modelo de lenguaje (LLM) inicializado desde Qwen2.5-1.5B-Base y una cabeza acústica autoregresiva basada en flow-matching que opera sobre un AudioVAE de 48 kHz, sin utilizar tokens discretos de codec en ninguna parte del pipeline. Está entrenado con alrededor de 1,5 millones de horas de voz, lo que lo convierte en una base sólida para tareas de clonación de voz zero-shot y fine-tuning posterior.

La relevancia de este modelo radica en su arquitectura híbrida que combina un LLM con un flujo autoregresivo continuo, logrando una calidad de síntesis comparable o superior a otros sistemas TTS de código abierto del mismo tamaño, como se refleja en los benchmarks Seed-TTS-Eval y MiniMax Multilingual. Además, al estar liberado bajo licencia Apache 2.0, permite uso comercial y modificación sin restricciones significativas. Es el checkpoint base de una familia que incluye variantes post-entrenadas (dots.tts-soar y dots.tts-mf) orientadas a mejorar la fidelidad de la voz y la latencia de inferencia, respectivamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autoregresivo continuo: AudioVAE (48 kHz) + codificador semántico + LLM (Qwen2.5-1.5B-Base) + cabeza acústica flow-matching (DiT) |
| Parametros totales | 2.198.091.778 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se recomienda bfloat16 en el ejemplo de uso) |
| Idiomas soportados | No disponible (benchmarks incluyen inglés y chino; se menciona evaluación multilingüe con 24 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseño totalmente continuo: un AudioVAE congelado codifica la forma de onda mono a 48 kHz en un latente continuo y lo decodifica mediante un decodificador causal estilo BigVGAN. El backbone autoregresivo predice ese latente por parches. Cada parche recién generado se re-codifica con un codificador semántico para obtener una representación compacta que alimenta al LLM, eliminando detalles acústicos de alta varianza. El LLM, inicializado desde Qwen2.5-1.5B-Base, consume texto en formato BPE directamente (sin fonemas) y emite un estado oculto por paso de audio. Una cabeza autoregresiva de flow-matching, implementada como un DiT, condiciona sobre el estado oculto del LLM y el prefijo autoregresivo para denoising del siguiente parche de VAE, con un vector de hablante x-vector CAM++ congelado como entrada lateral.

El entrenamiento se realizó sobre aproximadamente 1,5 millones de horas de voz, sin detalles adicionales sobre la composición exacta del dataset ni sobre técnicas de alineación como RLHF o DPO. El checkpoint base está diseñado para ser el punto de partida recomendado para fine-tuning, ofreciendo control completo sobre el guidance scale (CFG) y el número de pasos de flujo (NFE).

## Capacidades

- Generación de voz sintética de alta calidad a 48 kHz, con salida en formato de audio continuo.
- Clonación de voz zero-shot mediante "continuation voice cloning": se proporciona un audio de referencia y su transcripción exacta, y el modelo genera voz con el timbre del hablante de referencia.
- Síntesis multilingüe: aunque no se especifican los idiomas exactos, los benchmarks incluyen evaluación en inglés y chino, y se menciona una prueba multilingüe con 24 idiomas en el benchmark MiniMax.
- Control fino de la inferencia mediante parámetros como el número de pasos de flujo (recomendado 10–32) y el guidance scale (CFG, recomendado 1.2), lo que permite equilibrar calidad y velocidad.
- Soporte para fine-tuning: el checkpoint base es el recomendado para adaptar el modelo a voces o dominios específicos mediante el script de entrenamiento proporcionado.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de síntesis de voz.

## Casos de uso

- Audiolibros y narración: el modelo puede generar voces naturales y expresivas para narraciones largas, aprovechando la clonación zero-shot para mantener una voz consistente a lo largo de capítulos. Su arquitectura continua evita artefactos típicos de codecs discretos, mejorando la fluidez.
- Asistentes de voz personalizados: integrable en asistentes virtuales o chatbots con voz, permitiendo elegir el timbre del hablante mediante un audio de referencia. La baja latencia (con la variante destilada dots.tts-mf) lo hace apto para interacción en tiempo real.
- Doblaje y localización de contenidos: gracias a su capacidad multilingüe, puede doblar vídeos, podcasts o cursos a varios idiomas manteniendo la identidad vocal del hablante original, con un flujo de trabajo que requiere solo el audio de referencia y su transcripción.
- Accesibilidad para personas con discapacidad visual: puede convertir texto digital en voz natural para lectores de pantalla o aplicaciones de lectura asistida, con la posibilidad de clonar voces familiares para mayor comodidad del usuario.
- Producción de contenido multimedia: creadores de contenido pueden generar locuciones para vídeos, anuncios o presentaciones sin necesidad de un estudio de grabación, usando la API de Python para automatizar la generación por lotes.
- Preservación y restauración de voz: con el consentimiento adecuado, el modelo puede recrear voces de personas que han perdido la capacidad de hablar o para preservar voces históricas, siempre que se disponga de una muestra de audio de referencia y su transcripción.

## Benchmarks y rendimiento

Los resultados publicados en la model card se resumen a continuación. No se han encontrado datos adicionales en la información proporcionada.

### Seed-TTS-Eval (zero-shot, referencia de ~3 s)

| Modelo | Parametros | test-en WER↓ / SIM↑ | test-zh WER↓ / SIM↑ | test-zh-hard WER↓ / SIM↑ | Avg WER↓ / SIM↑ |
|---|---:|---:|---:|---:|---:|
| Seed-TTS | — | 2.25 / 76.2 | 1.12 / 79.6 | 7.59 / 77.6 | 3.65 / 77.8 |
| Qwen3-TTS | 1.7B | **1.23** / 71.7 | 1.22 / 77.0 | 6.76 / 74.8 | 3.07 / 74.5 |
| VoxCPM 2 | 2B | 1.84 / 75.3 | 0.97 / 79.5 | 8.13 / 75.3 | 3.65 / 76.7 |
| **dots.tts-base** | **2B** | 1.34 / **76.8** | **0.96** / **80.5** | **6.46** / **79.2** | **2.92** / **78.8** |

### MiniMax Multilingual (24 idiomas, promedio)

| Modelo | Avg WER↓ | Avg SIM↑ |
|---:|---:|---:|
| MiniMax | **2.8** | 76.6 |
| Fish-Audio S2 | 3.7 | 78.0 |
| VoxCPM 2 | 5.7 | 82.3 |
| **dots.tts-base** | 6.6 | **83.5** |

El modelo destaca por la mejor similitud de hablante (SIM) en ambos benchmarks, aunque en WER multilingüe queda por detrás de MiniMax y Fish-Audio S2. En el README del proyecto se mencionan resultados adicionales (CV3-Eval y EmergentTTS-Eval) que no están disponibles en la información recopilada.

## Requisitos de hardware

- El modelo tiene 2.198 millones de parámetros; en bfloat16, los pesos ocupan aproximadamente 4,4 GB, más el overhead de activaciones y el AudioVAE.
- Para inferencia con el runtime de Python, se recomienda una GPU con al menos 8 GB de VRAM para el checkpoint base en bfloat16. GPUs como RTX 3090, RTX 4090 o A100 son adecuadas.
- En GPUs de consumo (gama alta) es viable ejecutar el modelo con bfloat16, aunque la latencia dependerá del número de pasos de flujo (10–32) y del guidance scale.
- Para fine-tuning se necesita más memoria; se sugiere una GPU con 24 GB o más (por ejemplo, A100 40 GB o RTX 4090) y el uso de `accelerate` para distribución.
- Opciones de despliegue: el modelo se usa a través de la librería `dots_tts` (runtime Python), con soporte CLI. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo TTS, no un LLM de texto.
- No se proporcionan datos oficiales de latencia o throughput; la variante destilada `dots.tts-mf` (NFE=4) está diseñada para baja latencia, pero no se incluye en este checkpoint.

## Comparativa con modelos similares

La comparativa se basa en los benchmarks de la model card. No se dispone de especificaciones completas de los modelos alternativos, por lo que la tabla se limita a los datos publicados.

| Modelo | Parametros | Contexto | Licencia | Seed-TTS-Eval Avg WER↓ / SIM↑ | MiniMax Multilingual Avg WER↓ / SIM↑ |
|---|---:|---|---:|---:|---:|
| **dots.tts-base** | 2B | No disponible | Apache 2.0 | 2.92 / 78.8 | 6.6 / 83.5 |
| Qwen3-TTS | 1.7B | No disponible | No disponible | 3.07 / 74.5 | No disponible |
| VoxCPM 2 | 2B | No disponible | No disponible | 3.65 / 76.7 | 5.7 / 82.3 |
| Seed-TTS | — | No disponible | No disponible | 3.65 / 77.8 | No disponible |
| MiniMax | — | No disponible | No disponible | No disponible | 2.8 / 76.6 |
| Fish-Audio S2 | — | No disponible | No disponible | No disponible | 3.7 / 78.0 |

dots.tts-base ofrece la mejor similitud de hablante en ambos benchmarks, con un WER competitivo en inglés y chino. Su licencia Apache 2.0 es más permisiva que la mayoría de alternativas comerciales.

## Limitaciones y advertencias

- Riesgo de mal uso: la clonación de voz zero-shot de alta fidelidad puede generar audio sintético muy realista. El modelo está destinado a investigación y despliegues autorizados; el uso no consentido para suplantar la voz de una persona es éticamente cuestionable y potencialmente ilegal.
- La model card advierte explícitamente sobre el riesgo de uso indebido, aunque el texto completo de la sección "Risks and Limitations" no está disponible en la información recopilada.
- No se especifican los idiomas exactos soportados, lo que puede dificultar la evaluación de cobertura lingüística para casos de uso concretos.
- No se han publicado datos sobre sesgos, alucinaciones o errores de pronunciación en contextos específicos; se recomienda validar la salida en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal del uso de voces clonadas recae en el usuario final, especialmente en jurisdicciones con leyes de protección de la voz.
- El modelo base requiere ajuste de parámetros (pasos de flujo y guidance scale) para obtener la mejor calidad; valores subóptimos pueden degradar la inteligibilidad o la similitud vocal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suliniacats/dots.tts-base
- Repositorio oficial en GitHub: https://github.com/studio-dots-ai/dots.tts
- Página de demostración: https://studio-dots-ai.github.io/dots.tts-demo/
- Espacio de Hugging Face (playground): https://huggingface.co/spaces/dots-studio/dots.tts
- Colección de modelos dots.tts: https://huggingface.co/collections/dots-studio/dotstts
- Página del modelo original en dots-studio: https://huggingface.co/dots-studio/dots.tts-base
