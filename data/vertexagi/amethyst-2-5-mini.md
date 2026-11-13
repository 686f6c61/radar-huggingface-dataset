# VertexAGI/amethyst-2-5-mini

## Resumen

Amethyst 2.5 Mini es un modelo de chat de 4.022 millones de parámetros desarrollado por VertexAGI, un proyecto de investigación independiente, mediante ajuste fino supervisado (LoRA) sobre Qwen3-4B. Su propósito es acotado y bien definido: gestionar la decisión de cuándo invocar una herramienta `web_search`, responder de forma breve citando los fragmentos utilizados como `[1]`, `[2]`, y declarar explícitamente cuándo los resultados de búsqueda no contienen la respuesta en lugar de inventar un dato. Es, por tanto, un modelo orientado a tool calling con honestidad epistémica como criterio de diseño central.

El modelo parte de Qwen3-4B, un transformer decoder-only denso, y se distribuye en tres formatos dentro del mismo repositorio: pesos MLX en precisión mixta (capas ajustadas a 8 bits, resto a 4 bits, 2,9 GB), GGUF Q8_0 (4,3 GB) y GGUF Q4_K_M (2,5 GB). La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales.

Su relevancia ahora es doble. Por un lado, aborda un problema práctico poco cubierto por modelos pequeños: el comportamiento tras una búsqueda fallida o infructuosa, con 448 conversaciones dedicadas específicamente a enseñar al modelo a decir que los resultados no responden a la pregunta. Por otro, su pipeline de entrenamiento documenta un fallo habitual en la destilación sintética (un dataset de 20.000 filas que contenía solo ~1.000 prompts únicos) y cómo se corrigió, lo que resulta útil como referencia metodológica para quien entrene adaptadores similares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3, transformer decoder-only denso |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantización | MLX mixta (8 bits en capas LoRA, 4 bits en el resto), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

La base es Qwen3-4B, un transformer decoder-only denso de 4B parámetros. Sobre él se aplicó un LoRA de rango 16, escala 20.0, dropout 0.0 y 16 capas, con la pérdida calculada únicamente sobre los turnos del asistente (`mask_prompt`). El entrenamiento se ejecutó con MLX y `mlx-lm` sobre Apple Silicon, con optimizador Adam, tasa de aprendizaje constante de 6e-5, batch de 4, longitud de secuencia 2.048 y gradient checkpointing, durante 2 épocas y 2.341 iteraciones. La ejecución se pausó manualmente en torno a la iteración 1.580 y se reanudó desde los pesos de la iteración 1.400 para las 941 iteraciones restantes, sin estado del optimizador guardado, por lo que Adam se reinició en frío en ese punto.

El dataset de entrenamiento consta de 3.205 conversaciones sintéticas (4.683 muestras tras dividir cada conversación en una muestra por turno del asistente), generadas por destilación desde GLM 5.3, GLM 5.3 Flash, Kimi K3, poolside Laguna S 2.1 y MiniMax M3.1 Flash a través de NVIDIA NIM y OpenRouter. Todos los resultados de búsqueda del corpus son inventados por los modelos profesor; no se rastreó ninguna página web real. La composición está diseñada para diversidad y concisión: 817 conversaciones de chat general, 309 más 42 de dos turnos para respuestas directas sin búsqueda, 500 de instrucciones de formato estricto, 502 de búsqueda de hechos actuales con una consulta, 127 de fuentes en desacuerdo, 97 más 21 de refinamiento de consulta, 192 de fallo de búsqueda y 448 de resultados en tema pero sin la respuesta. Las filas con resultados de búsqueda pasaron una comprobación automática de grounding: la respuesta final solo puede citar resultados existentes y solo puede usar números y nombres propios presentes en el último resultado o en la pregunta.

La innovación técnica destacable está en la distribución MLX: un merge en 4 bits plano re-cuantiza el ajuste fino y lo destruye, por lo que las 112 capas lineales adaptadas por LoRA se fusionan en fp16 y se re-cuantizan a 8 bits, mientras el resto permanece en el 4 bits original del modelo base. El autor verificó que el modelo fusionado coincide con el adaptador: misma pérdida de validación hasta tres decimales y puntuaciones idénticas en sus prompts de validación.

## Capacidades

- Generación de texto conversacional en inglés con respuestas breves y directas.
- Tool calling: invoca una herramienta `web_search` para información cambiante (noticias, marcadores, precios, términos como "latest") y responde sin buscar las preguntas estables.
- Citación de fuentes: tras una búsqueda, responde brevemente y cita los fragmentos usados como `[1]`, `[2]`.
- Abstención explícita: si la búsqueda falla, no devuelve resultados o devuelve páginas en tema que no contienen la respuesta, lo declara y orienta sobre dónde consultar, sin inventar cifras.
- Manejo de fuentes contradictorias: señala que las fuentes discrepan y cita ambas.
- Refinamiento de consulta: reformula la búsqueda una vez cuando los primeros resultados son débiles.
- Instrucciones de formato estricto: "exactamente 3 viñetas", "menos de 20 palabras", "una sola frase", traducción y reescritura.
- Resúmenes con citas, descomposición en múltiples consultas y seguimiento de preguntas elípticas.
- Concición medida: en dos de sus tres conjuntos de validación, las respuestas simples promedian 31-38 palabras, frente a 45-66 del Qwen3-4B base.

## Casos de uso

- Asistente de atención al cliente con búsqueda en base de conocimiento: el modelo decide si la consulta requiere recuperación externa o puede responderse directamente, y cuando la recuperación no cubre la pregunta lo indica en lugar de improvisar una respuesta, lo que reduce escalados erróneos y respuestas inventadas.
- Agente de noticias y datos actuales: ante preguntas sobre marcadores deportivos, cotizaciones o titulares, emite una llamada `web_search` bien formada y devuelve una respuesta corta con citas numeradas que el usuario puede verificar.
- Verificación de hechos con trazabilidad: el formato de citas `[1]`, `[2]` y la comprobación de grounding del entrenamiento lo hacen adecuado para flujos donde cada afirmación debe apuntar a un fragmento concreto de la fuente.
- Integración en pipelines de agentes con function calling: su tasa del 100% de llamadas bien formadas en los conjuntos de validación del autor permite conectarlo a orquestadores que exigen esquemas de herramienta válidos sin capas de reparación adicionales.
- Despliegue en Apple Silicon para prototipado: el build MLX de 2,9 GB se ejecuta con `mlx-lm` en portátiles y equipos de sobremesa con chip de Apple, lo que facilita iterar localmente sobre el comportamiento de búsqueda antes de pasar a producción.
- Servicio ligero en CPU o GPU modesta: las variantes GGUF Q4_K_M (2,5 GB) y Q8_0 (4,3 GB) funcionan con llama.cpp, Ollama y LM Studio, útiles para asistentes internos con presupuesto de hardware reducido.
- Generación de respuestas con formato controlado: las 500 conversaciones de instrucciones de formato permiten usarlo para producir salidas con restricciones estrictas de longitud o estructura en tareas de resumen y reescritura.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). La evaluación disponible se limita a decodificación greedy sobre prompts de validación hechos a mano, en tres conjuntos de 44, 64 y 36 prompts. El conjunto de 44 se escribió después de congelar la mezcla de entrenamiento y se excluyó de ella por palabra clave, por lo que es el más limpio; los de 64 y 36 solapan más con los temas de entrenamiento.

| Métrica | Amethyst 2.5 Mini | Qwen3-4B base |
|---|---|---|
| Llamadas de herramienta bien formadas | 100% | 60-88% |
| Búsquedas innecesarias | 0% | no disponible |
| Longitud media de respuesta simple (conjuntos 1 y 2) | 31-38 palabras | 45-66 palabras |
| Longitud media de respuesta simple (conjunto 3) | igual de breve que la base | igual de breve |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB con GGUF Q4_K_M, unos 4,3 GB con GGUF Q8_0 y unos 2,9 GB con el build MLX mixto, más el overhead de contexto y del runtime.
- GPU recomendadas: no se especifican en la información proporcionada; por tamaño, cualquier GPU con al menos 6-8 GB de memoria libre debería acomodar las variantes cuantizadas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más (RTX 3060, 4060, 4070 y superiores), aunque el autor no publica pruebas en estas GPU.
- Apple Silicon: el formato principal es MLX, pensado para `mlx-lm` en chips de Apple; es el entorno en el que se entrenó y validó el modelo.
- Opciones de despliegue: `mlx-lm` para el build MLX; llama.cpp, Ollama y LM Studio para los GGUF. El repositorio incluye la etiqueta `endpoints_compatible`. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amethyst 2.5 Mini | 4,02B (denso) | no disponible | Chat + tool calling de búsqueda con abstención explícita | Apache 2.0 | MLX, GGUF Q8_0, GGUF Q4_K_M |
| Qwen3-4B (base) | 4B (denso) | no disponible | Modelo generalista | Apache 2.0 | safetensors y múltiples cuantizaciones de la comunidad |
| mlx-community/Qwen3-4B-4bit | 4B (denso) | no disponible | Checkpoint base cuantizado para MLX | Apache 2.0 | MLX |

La comparación cuantitativa solo está disponible frente al Qwen3-4B base en las métricas propias del autor: 100% frente a 60-88% de llamadas de herramienta bien formadas y respuestas entre 14 y 35 palabras más cortas en dos de los tres conjuntos. No se han publicado comparaciones con otros modelos ajustados para tool calling en la información disponible.

## Limitaciones y advertencias

- Idioma: solo inglés. No hay soporte declarado de castellano ni de otros idiomas, aunque el modelo base Qwen3-4B es multilingüe y parte de esa capacidad podría conservarse sin garantías.
- Volumen de entrenamiento reducido: 3.205 conversaciones sintéticas y 2.341 iteraciones de LoRA. El ajuste es estrecho y puede degradar capacidades generales del modelo base fuera del dominio de chat con búsqueda.
- Datos completamente sintéticos: todos los resultados de búsqueda del entrenamiento fueron inventados por modelos profesor; no se validó con páginas web reales, lo que puede producir un desajuste de distribución frente a resultados reales de un motor de búsqueda.
- Evaluación limitada: los conjuntos de validación son pequeños (44, 64 y 36 prompts), hechos a mano y parcialmente solapados con los temas de entrenamiento. No hay benchmarks estándar ni evaluación independiente.
- Riesgo de alucinación: aunque el modelo está entrenado para abstenerse cuando los resultados no responden, no hay garantía de que lo haga siempre en producción; conviene mantener validación de las citas en el pipeline.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información proporcionada.
- Contexto: la longitud de contexto no se especifica en la ficha; debe consultarse la del modelo base antes de diseñar flujos con historiales largos o muchos resultados de búsqueda.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B; conviene revisar su documentación.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el proyecto se describe como investigación independiente sin respaldo institucional.
- Procedimiento de entrenamiento con interrupción manual y reinicio en frío del optimizador, lo que introduce una discontinuidad no cuantificada en la trayectoria de optimización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/amethyst-2-5-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint de ajuste fino: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Framework MLX: https://github.com/ml-explore/mlx
