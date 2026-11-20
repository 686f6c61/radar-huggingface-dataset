# udoy55/CornyMeme-2B

## Resumen

CornyMeme-2B es un adaptador LoRA experimental de generación de texto desarrollado por el usuario udoy55, diseñado específicamente para producir chistes cortos, juegos de palabras y leyendas de memes. No se trata de un modelo completo, sino de un adaptador PEFT que requiere el checkpoint base Qwen/Qwen3.5-2B (revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`) para funcionar. El adaptador contiene 1.881.825.088 parámetros en formato safetensors y el repositorio ocupa 1,3 GB, con pesos también publicados en GGUF.

El modelo aborda un nicho muy concreto: la generación de humor breve y "corny" (cursi, de broma fácil) sin explicaciones adicionales. Su model card recomienda un system prompt que fuerza al modelo a escribir un chiste o leyenda original y corto, evitar explicar el chiste y remitir al feed en vivo de la aplicación cuando se le pide contenido de actualidad, en lugar de inventar tendencias o fuentes.

Es relevante como ejemplo de adaptación ligera y local de un modelo pequeño: el entrenamiento se realizó en una RTX 4070 SUPER con un pico de asignación CUDA de 4,76 GiB, lo que lo sitúa en el terreno de la experimentación accesible en hardware de consumo. No obstante, su entrenamiento es extremadamente reducido (12 demostraciones originales con cuatro variaciones de prompt durante dos épocas), por lo que debe tratarse como una prueba de comportamiento y no como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Qwen/Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (pesos publicados en GGUF); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) que se aplica sobre el checkpoint base Qwen/Qwen3.5-2B, un transformer de aproximadamente 2.000 millones de parámetros. El adaptador no redefine la arquitectura del modelo base; hereda de este la tokenización, la ventana de contexto y el mecanismo de atención, aunque la model card no detalla ninguna de estas características. Los pesos se distribuyen en safetensors y en formato GGUF, lo que facilita su carga tanto en frameworks PEFT como en entornos de inferencia local basados en llama.cpp.

El entrenamiento consistió en 12 demostraciones originales con cuatro variaciones de prompt, ejecutadas durante dos épocas en una RTX 4070 SUPER, con un pico de asignación CUDA de 4,76 GiB. Cuatro prompts se reservaron fuera del conjunto de entrenamiento como prueba de comportamiento (smoke test). No se documenta el uso de RLHF, DPO ni un corpus de preentrenamiento propio; el adaptador se limita a ajustar el estilo del modelo base hacia el humor breve. La model card indica que la aplicación asociada puede recuperar publicaciones de imagen nuevas de la comunidad de memes de Lemmy World durante su uso, pero aclara que los pesos no contienen ningún feed en vivo.

## Capacidades

- Generación de chistes cortos y juegos de palabras en inglés, con un estilo "corny" deliberado.
- Generación de leyendas de memes breves y originales, sin explicar el chiste.
- Gestión de peticiones de contenido de actualidad mediante una respuesta de rechazo controlada: remite al feed en vivo de la aplicación en lugar de inventar tendencias o fuentes.
- Conversación de un solo turno orientada a tareas de humor; la model card no documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas soportados).
- Capacidades de visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Generación de leyendas para memes en una aplicación de ocio: el adaptador produce leyendas cortas y originales a partir de una imagen o un tema, y su system prompt recomendado evita que el modelo explique el chiste, lo que encaja con el formato visual de un meme.
- Bot de humor para comunidades tipo Lemmy o Reddit: integrado en un flujo que recupera publicaciones nuevas de la comunidad de memes de Lemmy World y usa el modelo solo para redactar la leyenda, manteniendo la separación entre datos en vivo y pesos que exige la model card.
- Pruebas de concepto de ajuste fino local: sirve como ejemplo reproducible de entrenamiento LoRA en una GPU de consumo (RTX 4070 SUPER, pico de 4,76 GiB) para desarrolladores que quieran validar su pipeline antes de escalar a un corpus mayor.
- Generación de contenido ligero para redes sociales: creación de frases cursis y juegos de palabras para publicaciones de bajo riesgo, donde la originalidad importa más que la precisión factual.
- Demostración de rechazo controlado de consultas de actualidad: el modelo ilustra un patrón de diseño en el que el LLM delega la información en tiempo real a una fuente externa y evita alucinar tendencias, útil como referencia para arquitecturas RAG sencillas.
- Evaluación comparativa de adaptadores pequeños: al ser un LoRA de 1,3 GB sobre un base de 2B, permite medir el coste y el efecto de un ajuste mínimo en tareas de estilo, con un conjunto de smoke tests ya definido por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye cuatro smoke tests cualitativos con prompts reservados:

| Prompt | Respuesta documentada |
|---|---|
| Tell me something corny about pasta. | My pasta had a bad day. It had too much elbow. |
| Give me a meme about assembling IKEA furniture. | Me assembling IKEA furniture: 10 minutes of frustration, 1 hour of IKEA furniture. |
| Show me what's trending today. | I can't access live meme trends. Check the live feed in the app for today's trending memes. |
| Joke about a broken keyboard. | My keyboard had a bad day. It felt like it needed to reboot. |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador se entrenó con un pico de 4,76 GiB en una RTX 4070 SUPER, lo que da una referencia del orden de magnitud para el ajuste, no necesariamente para la inferencia.
- GPU recomendadas: no disponibles. Por el tamaño del modelo base (unos 2.000 millones de parámetros) y del adaptador (1,3 GB en el repositorio), es plausible su ejecución en GPUs de consumo, pero el autor no publica requisitos oficiales.
- ¿Cabe en GPU de consumo? No confirmado por el autor; el entrenamiento se realizó en una RTX 4070 SUPER, lo que sugiere que la inferencia es viable en hardware de gama media-alta.
- Opciones de despliegue: PEFT (librería declarada), safetensors y GGUF; los pesos GGUF permiten su uso en entornos basados en llama.cpp, aunque no se detallan configuraciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CornyMeme-2B (este) | 1.881.825.088 (adaptador LoRA) | no disponible | apache-2.0 | safetensors, GGUF | Requiere Qwen/Qwen3.5-2B; entrenamiento de 12 demostraciones |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | no disponible en la información proporcionada | no disponible | Modelo base sobre el que se aplica el adaptador |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Entrenamiento extremadamente reducido: 12 demostraciones originales con cuatro variaciones de prompt durante dos épocas; el comportamiento puede degradarse fuera de los temas de los smoke tests.
- Riesgo de alucinación en consultas de actualidad: aunque el system prompt recomendado mitiga la invención de tendencias, no existe una garantía técnica; el modelo puede generar fuentes o tendencias falsas si se le fuerza fuera del prompt previsto.
- Idiomas soportados no documentados: los ejemplos y el system prompt están en inglés, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones largas ni de contexto extendido.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso; no debe emplearse en pipelines de agentes sin validación previa.
- Sesgos conocidos: no documentados por el autor; al ser un adaptador de humor, puede reproducir estereotipos presentes en el modelo base.
- Licencia apache-2.0: permite uso comercial, pero el adaptador depende del modelo base Qwen/Qwen3.5-2B, cuyos términos deben verificarse por separado.
- Estado experimental: el propio autor etiqueta el modelo como "experimental" y "local"; no hay garantías de mantenimiento ni de soporte.
- Los pesos no contienen feed en vivo; cualquier funcionalidad de actualidad depende de la aplicación que recupere datos externos.

## Enlaces

- Hugging Face: https://huggingface.co/udoy55/CornyMeme-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Revisión del checkpoint base: `15852e8c16360a2fea060d615a32b45270f8a8fc`
- Comunidad de memes de Lemmy World: no disponible como enlace directo en la información proporcionada
- Paper, blog o repositorio adicional: no disponibles
