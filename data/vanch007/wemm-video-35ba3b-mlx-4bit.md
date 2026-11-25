# vanch007/WeMM-Video-35BA3B-mlx-4bit

## Resumen

WeMM-Video-35BA3B es un modelo multimodal de tipo image-text-to-text desarrollado por Tencent, orientado al entendimiento conjunto de video, audio, imagen y texto. Su arquitectura combina un backbone de lenguaje basado en Qwen3.5 con mezcla de expertos (MoE), una torre de visión Qwen3-VL de 27 capas y una torre de audio compuesta por un encoder Whisper de 32 capas más un Q-Former BERT de 2 capas. Con aproximadamente 36.180 millones de parámetros totales, está pensado para tareas de descripción de escenas, resumen de habla y razonamiento multimodal sobre contenido audiovisual.

La ficha que nos ocupa no es el modelo original, sino una conversión realizada por el usuario vanch007 al formato MLX con cuantización mixta de 4 bits, pensada para inferencia nativa en Apple Silicon y para el runtime oMLX. Esta conversión mantiene las torres de visión y audio sin cuantizar (bfloat16 y float16 respectivamente) y aplica 4 bits afines al backbone de lenguaje y a los 256 expertos del MoE, con los routers en 8 bits. El resultado ocupa unos 23,3 GB en disco y permite ejecutar un modelo multimodal de más de 35.000 millones de parámetros en hardware de Apple.

Su relevancia actual radica en que democratiza el despliegue local de un modelo audiovisual de gran tamaño en equipos con memoria unificada, un escenario históricamente reservado a GPUs de datacenter. La licencia Apache 2.0 facilita su uso comercial, aunque la disponibilidad de documentación técnica sobre el modelo base es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal: backbone Qwen3.5 MoE + torre de visión Qwen3-VL (27 capas) + torre de audio Whisper (32 capas) con Q-Former BERT (2 capas) |
| Parametros totales | 36.177.564.024 (~36,18 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (group_size=64) en backbone y 256 expertos MoE; 8-bit affine en router y shared_expert_gate; bfloat16 en torre de visión; float16 en torre de audio; float32 en A_log de Gated DeltaNet. Variantes 6-bit y 8-bit disponibles |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura híbrida multimodal. El núcleo lingüístico es un transformer con mezcla de expertos (MoE) de 256 expertos, derivado de la familia Qwen3.5, e incorpora componentes de tipo Gated DeltaNet (parámetro A_log en float32 en esta conversión), lo que sugiere atención con estado recurrente o lineal combinada con atención estándar. Sobre ese backbone se acoplan dos torres sensoriales: una torre de visión Qwen3-VL de 27 capas en bfloat16 y una torre de audio formada por un encoder Whisper de 32 capas más un Q-Former BERT de 2 capas que proyecta las representaciones acústicas al espacio del lenguaje.

En cuanto al entrenamiento, la información disponible no detalla el volumen de tokens, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card del autor de la conversión se centra exclusivamente en los detalles de cuantización y en las instrucciones de uso, sin aportar datos sobre el preentrenamiento del modelo original. La innovación técnica destacable de esta ficha concreta es la estrategia de cuantización mixta: preservar íntegras las torres de visión y audio para no degradar la percepción multimodal, mientras se comprime agresivamente el backbone y los expertos. El autor reporta una verificación de la torre de audio con coseno de similitud de 0,999826 frente a la referencia FP32.

## Capacidades

- Comprensión de video: descripción de escenas, acciones y objetos a partir de secuencias de vídeo.
- Comprensión de audio: transcripción y resumen del habla presente en el vídeo, gracias al encoder Whisper.
- Razonamiento multimodal conjunto sobre vídeo, audio, imagen y texto en una sola pasada.
- Generación de texto conversacional en inglés y chino.
- Procesamiento de imágenes (pipeline image-text-to-text) mediante la torre Qwen3-VL.
- Soporte de conversaciones multiturno con contenido audiovisual como entrada.
- Capacidad de razonamiento derivada del backbone Qwen3.5 MoE (no documentada explícitamente en esta conversión).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de vídeo para accesibilidad: el modelo puede generar audiodescripciones de escenas combinando la torre de visión con el backbone de lenguaje, útil para plataformas de contenido que necesitan descripciones textuales de material audiovisual.
- Resumen de reuniones y webinars grabados: al procesar simultáneamente pista de vídeo y audio, puede sintetizar el contenido de una grabación y resumir el habla mediante el encoder Whisper integrado.
- Indexación y etiquetado de archivos multimedia: generación de metadatos textuales (escena, hablantes, temas) para bibliotecas de vídeo, facilitando búsqueda semántica sobre grandes archivos.
- Moderación de contenido audiovisual: análisis conjunto de imagen y audio para detectar contenido inapropiado en plataformas de vídeo, con inferencia local en Apple Silicon que evita enviar material sensible a la nube.
- Asistentes de análisis de material de archivo: investigadores que trabajan con fondos documentales pueden ejecutar el modelo localmente para transcribir y describir grabaciones históricas, como el ejemplo del alunizaje Apolo 11 incluido en la model card.
- Prototipado en estaciones de trabajo Mac: equipos de desarrollo que necesitan validar pipelines multimodales sin acceso a GPUs de datacenter pueden usar la versión 4-bit (23,3 GB) en Macs con memoria unificada suficiente.
- Investigación en percepción multimodal: la separación limpia entre torres sin cuantizar y backbone cuantizado permite estudiar el impacto de la compresión en tareas de vídeo y audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: la variante 4-bit ocupa ~23,3 GB en disco; se recomienda al menos 32 GB de memoria unificada para cargar el modelo con margen para el contexto y las activaciones. La variante 6-bit (~31,4 GB) requiere 48 GB o más; la 8-bit (~39,5 GB) requiere 64 GB o más.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) mediante MLX. No está pensada para GPUs NVIDIA o AMD.
- Cabe en consumer hardware: sí, en Macs con memoria unificada de 32 GB o superior (recomendado 48-64 GB para las variantes de mayor precisión).
- Opciones de despliegue: MLX nativo mediante el repositorio vanch007/mlx-wemm-video; integración con oMLX a través del hook de compatibilidad `install_omlx_compat.py`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Video-35BA3B (este, MLX 4-bit) | ~36,18 B | no disponible | vídeo, audio, imagen, texto | Apache 2.0 | Hugging Face, MLX |
| tencent/WeMM-Video-35BA3B (original) | ~36,18 B | no disponible | vídeo, audio, imagen, texto | Apache 2.0 | Hugging Face |
| Qwen3-VL (familia) | no disponible | no disponible | imagen, texto | no disponible | Hugging Face |
| Whisper (encoder de audio) | no disponible | no disponible | audio | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos multimodales vídeo-audio-texto de tamaño similar) no está disponible en la información proporcionada. Los modelos citados en la tabla se incluyen únicamente porque aparecen referenciados como componentes o familia técnica en la model card, no como competidores directos evaluados.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: no se documenta información sobre sesgos conocidos en la información disponible.
- Alucinación: no se aportan datos sobre tasas de alucinación; como modelo generativo multimodal, existe riesgo de descripciones inexactas de escenas o de atribuir habla incorrecta.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar tareas con entradas de vídeo o audio prolongadas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base tencent/WeMM-Video-35BA3B y de los componentes derivados (Qwen3.5, Qwen3-VL, Whisper) antes de un despliegue en producción.
- Plataforma: esta conversión solo funciona en Apple Silicon con MLX; no es portable a GPUs NVIDIA ni a entornos de servidor convencionales.
- Precisión: la cuantización 4-bit del backbone y los expertos puede degradar tareas de razonamiento complejo; las torres de percepción se mantienen sin cuantizar, pero el efecto global no está medido con benchmarks.
- Madurez: el repositorio tiene 78 descargas y 0 likes, y fue actualizado por última vez en noviembre de 2026; es una conversión de terceros, no oficial, sin validación comunitaria amplia.
- Documentación: la model card no incluye información sobre entrenamiento, contexto, benchmarks ni limitaciones del modelo original.

## Enlaces

- Modelo en Hugging Face (esta conversión): https://huggingface.co/vanch007/WeMM-Video-35BA3B-mlx-4bit
- Modelo base original: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Variante 6-bit: https://huggingface.co/vanch007/WeMM-Video-35BA3B-mlx-6bit
- Variante 8-bit: https://huggingface.co/vanch007/WeMM-Video-35BA3B-mlx-8bit
- Repositorio de inferencia MLX: https://github.com/vanch007/mlx-wemm-video
