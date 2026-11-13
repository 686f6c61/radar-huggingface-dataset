# storyteller-platform/pocket-tts-spanish

## Resumen

Pocket TTS Spanish es un modelo de síntesis de voz (text-to-speech) entrenado originalmente por Kyutai bajo el identificador `kyutai/pocket-tts` y redistribuido por storyteller-platform para su uso dentro de la plataforma Storyteller. El repositorio actúa como espejo de la versión `2.0.0` del modelo en el registro de Storyteller, que lo instala a través de la herramienta `ghost-story`. La conversión a formato GGUF la realiza audio.cpp y se publica en el repositorio `audio-cpp/audio.cpp-gguf`.

El modelo cuenta con 109.502.146 parámetros (aproximadamente 109,5 millones) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la categoría de modelos TTS ligeros, aptos para inferencia en CPU o GPU de gama baja. La única cuantización GGUF conservada en este espejo es `pocket-tts-spanish-q8_0.gguf`, lo que simplifica el despliegue pero limita las opciones de ajuste entre calidad y consumo de memoria.

Su relevancia radica en que ofrece una alternativa de código abierto (licencia CC-BY-4.0) para síntesis de voz en castellano dentro de un ecosistema de narración/lectura automatizada, con pesos disponibles en GGUF para su integración en pipelines de audio.cpp. No obstante, la información publicada es muy escasa: no se detallan arquitectura interna, datos de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q8_0 (única cuantización conservada en este repo) |
| Idiomas soportados | español (por el nombre del modelo; no se detalla en la model card) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (repo convertido desde safetensors originales de kyutai/pocket-tts) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se sabe que el modelo original fue entrenado por Kyutai (`kyutai/pocket-tts`) y que posteriormente fue convertido a GGUF mediante audio.cpp. El número de parámetros (109,5 M) sugiere un modelo compacto, coherente con la denominación "pocket" y con un tamaño de repositorio de 0,3 GB.

Tampoco se especifican el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente indica la procedencia, la versión (`2.0.0`) y el proceso de conversión a GGUF en la revisión `7bf52723f5a9` del repositorio `audio-cpp/audio.cpp-gguf`. No hay información sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, orientada al idioma español.
- Generación de audio locutado para aplicaciones de narración y lectura automatizada.
- Integración con la plataforma Storyteller mediante la herramienta `ghost-story`.
- Ejecución mediante el ecosistema audio.cpp en formato GGUF (q8_0).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se detallan capacidades multilingües más allá del español implícito en el nombre del modelo.

## Casos de uso

- Narración de libros y artículos: el modelo puede convertir texto largo en audio locutado en español, integrándose en la plataforma Storyteller para generar audiolibros o versiones leídas de contenido escrito.
- Accesibilidad web: generación de versiones en audio de páginas y documentos para usuarios con discapacidad visual, aprovechando el tamaño reducido del modelo (109,5 M de parámetros) para despliegues ligeros.
- Asistentes de voz en aplicaciones móviles o de escritorio: al ser un modelo compacto en GGUF q8_0, puede ejecutarse en entornos con recursos limitados para respuestas habladas en castellano.
- Generación de contenido educativo: creación de materiales didácticos audio en español (lecciones, resúmenes, guiones) de forma automatizada dentro de pipelines de producción de contenido.
- Prototipado rápido de interfaces conversacionales: permite validar flujos de voz en español sin depender de servicios TTS propietarios, gracias a la licencia CC-BY-4.0.
- Integración en herramientas de lectura por voz (lectores de RSS, clientes de correo, aplicaciones de noticias): conversión de texto a audio bajo demanda con un modelo de 0,3 GB que cabe en despliegues modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 109,5 M de parámetros en q8_0, el peso de los pesos ronda los 0,1 GB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser más que suficiente, aunque no hay datos oficiales.
- ¿Cabe en GPU consumer? Sí, por el tamaño del modelo (109,5 M de parámetros y repo de 0,3 GB), es previsible que quepa en GPUs consumer e incluso en CPU.
- Opciones de despliegue: audio.cpp (formato GGUF q8_0). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede mencionar como referencia el modelo original `kyutai/pocket-tts`, del que este repositorio es una conversión a GGUF para español, pero no se han publicado datos comparativos de rendimiento, contexto ni calidad.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pocket-tts-spanish (este repo) | 109,5 M | no disponible | CC-BY-4.0 | GGUF q8_0 | Hugging Face |
| kyutai/pocket-tts (original) | no disponible | no disponible | CC-BY-4.0 | safetensors (original) | Hugging Face |
| Otros modelos TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura, datos de entrenamiento ni evaluación, lo que dificulta valorar su calidad frente a alternativas.
- El repositorio solo conserva la cuantización q8_0 en GGUF; no hay otras cuantizaciones para ajustar memoria/calidad.
- El modelo está orientado al español según su nombre, pero la model card no detalla los idiomas soportados ni su cobertura.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a los autores originales (Kyutai) y respetar los términos de la licencia.
- Al ser un espejo de terceros, la responsabilidad de mantenimiento y actualizaciones recae en storyteller-platform; la versión fijada es `2.0.0`.
- No se han publicado advertencias sobre sesgos, alucinaciones o limitaciones de contexto; al tratarse de un modelo TTS, el riesgo principal es la calidad y naturalidad de la voz generada, no verificable con la información disponible.
- Sin datos de latencia ni throughput, no es posible garantizar requisitos de producción en tiempo real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/pocket-tts-spanish
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Repositorio de conversión GGUF de audio.cpp: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Registro de modelos de Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/pocket-tts-spanish
