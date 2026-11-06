# XudongZhu/Qwen3-1.7B-Base-SFT-OnPolicy-BF16Delta

## Resumen

Qwen3-1.7B-Base-SFT-OnPolicy-BF16Delta es un repositorio de investigación publicado por XudongZhu que contiene los checkpoints intermedios de un ajuste fino supervisado (SFT) en política (on-policy) sobre el modelo base Qwen/Qwen3-1.7B-Base, especializado en problemas matemáticos. El modelo aprende de sus propias respuestas correctas: en cada paso muestrea ocho soluciones por problema, conserva una que pase la verificación matemática y entrena con ella. Forma parte de un estudio sobre cómo el post-entrenamiento modifica los pesos de un modelo, junto con su gemelo OffPolicy, que entrena sobre los mismos problemas pero con respuestas de DeepSeek-R1.

El repositorio no almacena una copia completa de cada checkpoint: guarda el paso 300 como checkpoint normal en la raíz y una cadena de deltas BF16 comprimidos con zstd que permite reconstruir los otros 74 pasos guardados (cada paso hasta 50, después cada 10 hasta 300). Cada delta es el XOR de los bits BF16 crudos de un paso con los del anterior, de modo que un paso reconstruido es idéntico bit a bit al checkpoint FP32 del repositorio original redondeado a BF16.

Se trata de un artefacto para investigación de dinámicas de entrenamiento, no de un modelo pensado para conversar. El modelo base Qwen3-1.7B-Base tiene 1.720.574.976 parámetros y licencia Apache 2.0. El ajuste se realizó sobre 38.400 problemas matemáticos de OpenR1-Math-220k durante 300 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), derivada de Qwen/Qwen3-1.7B-Base |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los prompts de entrenamiento se limitan a 1.024 tokens y prompt + respuesta a 16.384; la generación de evaluación usa hasta 15.360 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; los deltas son BF16 comprimidos con zstd) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint raíz en BF16) más cadena de deltas BF16 con zstd en `deltas/` y `manifest.json` con SHA-256 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3 de 1.700 millones de parámetros en configuración base (decoder-only, sin modo thinking). El ajuste es un SFT on-policy: en cada paso, para cada uno de 128 problemas, el modelo actual muestrea 8 respuestas con temperatura 1.0, top-p 1.0 y hasta 15.360 tokens; math-verify compara los últimos 2.000 caracteres de cada respuesta con la respuesta de referencia y se conserva una respuesta correcta al azar por problema. Los problemas sin ninguna respuesta correcta se omiten en ese paso. Después se minimiza la pérdida SFT (media de −log p sobre los tokens de las respuestas conservadas, sin el prompt).

Los datos proceden del split `default` de OpenR1-Math-220k (93.733 problemas): se conservan 59.188 problemas de enunciado matemático con respuesta de DeepSeek-R1 marcada como correcta por math-verify y completa; se barajan con semilla 0, se reservan 500 para evaluación y se descartan los prompts de más de 1.024 tokens (29) y los pares prompt + respuesta de más de 16.384 tokens (684), tomando los primeros 38.400. El entrenamiento recorre esos 38.400 problemas una sola vez en 300 pasos de 128 problemas. El límite de longitud cuenta también la respuesta de R1 para que ambas variantes (on-policy y off-policy) vean exactamente los mismos problemas.

La innovación técnica principal no está en el modelo sino en el formato de publicación: la cadena de deltas XOR sobre bits BF16 comprimidos con zstd reduce el almacenamiento a 7,2 GB para 75 checkpoints, con verificación SHA-256 por paso. `restore.py` reconstruye cualquier paso partiendo del modelo base en la revisión `ea980cb` (no incluida en el repositorio) y tarda unos 6 segundos por paso en CPU.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con formato de respuesta final dentro de `\boxed{}`.
- Resolución de problemas de enunciado matemático (word problems) en inglés.
- Razonamiento de cadena larga: la evaluación permite hasta 15.360 tokens de generación.
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes ni razonamiento multi-paso con herramientas.
- Capacidades multilingües limitadas al inglés (idioma declarado: `en`).
- No dispone de modo thinking explícito, visión ni audio.
- No está diseñado para conversación: el autor indica expresamente que son checkpoints para investigación, no un modelo con el que conversar.

## Casos de uso

- Estudio de dinámicas de post-entrenamiento: comparar la evolución de los pesos entre SFT on-policy y off-policy paso a paso, usando los 75 checkpoints para analizar cuándo y cómo cambian las representaciones internas.
- Análisis de la curva de aprendizaje en matemáticas: los checkpoints intermedios permiten trazar la precisión en ID, MATH-500 y MMLU-Pro a lo largo de los 300 pasos y detectar mesetas o degradaciones.
- Investigación sobre autoentrenamiento (self-training): evaluar el efecto de entrenar con las propias respuestas correctas del modelo frente a respuestas de un profesor externo (DeepSeek-R1), con datos y orden idénticos.
- Reproducibilidad de experimentos: la cadena de deltas con SHA-256 y `restore.py --verify` permite reconstruir y validar bit a bit cada paso, útil para réplicas exactas en publicaciones.
- Ahorro de almacenamiento en infraestructura de investigación: el formato de deltas XOR + zstd sirve como referencia para publicar series largas de checkpoints con un coste de 7,2 GB en lugar de una copia completa por paso.
- Evaluación de métodos de verificación matemática: el pipeline con math-verify sobre los últimos 2.000 caracteres de cada respuesta es reutilizable para medir la calidad de soluciones generadas por modelos pequeños.
- Línea base para experimentos de alineación: el paso 0 (modelo base) y el paso 300 permiten aislar el efecto del SFT on-policy sobre MMLU-Pro (de 0,218 a 0,344) como referencia en estudios de olvido catastrófico.

## Benchmarks y rendimiento

Evaluación con temperatura 0.6, top-p 0.95, hasta 15.360 tokens, semilla 0, vLLM en BF16, una respuesta por pregunta. ID son los 500 problemas reservados de OpenR1-Math; MATH-500 son los 500 problemas de MATH-500; MMLU-Pro son 1.000 preguntas del split de test con semilla 0.

| Paso | ID | MATH-500 | MMLU-Pro |
|---:|---:|---:|---:|
| 0 (base) | 0,220 | 0,562 | 0,218 |
| 10 | 0,248 | 0,590 | 0,240 |
| 25 | 0,240 | 0,614 | 0,241 |
| 50 | 0,246 | 0,620 | 0,257 |
| 100 | 0,266 | 0,640 | 0,292 |
| 150 | 0,302 | 0,632 | 0,304 |
| 200 | 0,288 | 0,664 | 0,318 |
| 250 | 0,290 | 0,638 | 0,316 |
| 300 | 0,312 | 0,652 | 0,344 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos (1,72 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 5-6 GB para contextos moderados.
- En cuantización de 8 bits, alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB (estimaciones a partir del número de parámetros; el repositorio no publica cuantizaciones).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16, como RTX 3060 Ti, RTX 4060 Ti, RTX 4070 o superiores; A100/H100 no son necesarias para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 y en tarjetas con 4-6 GB en cuantizaciones de 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo del repositorio), vLLM (usado por el autor en la evaluación), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`). llama.cpp u Ollama requerirían convertir los pesos a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. La reconstrucción de un paso con `restore.py` tarda unos 6 segundos en CPU.
- Almacenamiento: el repositorio ocupa 7,2 GB; para usar un paso distinto del 300 hay que descargar la cadena completa y el modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-1.7B-Base-SFT-OnPolicy (paso 300) | 1,72 B | no disponible | 0,652 | 0,344 | Apache 2.0 | Hugging Face, pesos BF16 + deltas |
| Qwen3-1.7B-Base (paso 0) | 1,72 B | no disponible | 0,562 | 0,218 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B-Base-SFT-OffPolicy | 1,72 B | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (repositorio gemelo) |
| Otros modelos de ~1,7 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base: el SFT on-policy eleva MATH-500 de 0,562 a 0,652 y MMLU-Pro de 0,218 a 0,344 en 300 pasos. No se dispone de resultados publicados del gemelo OffPolicy en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: el autor lo describe como checkpoints para investigación, no para chatear.
- Entrenado exclusivamente en inglés y sobre problemas matemáticos; el rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación en razonamientos matemáticos: la evaluación usa una sola respuesta por pregunta con temperatura 0.6 y verificación automática con math-verify, que puede tener falsos positivos y negativos.
- El entrenamiento on-policy descarta los problemas sin ninguna respuesta correcta en cada paso, lo que puede introducir sesgo hacia problemas de dificultad baja o media.
- El límite de 1.024 tokens de prompt y 16.384 de prompt + respuesta restringe los problemas tratados; no se ha evaluado con contextos más largos.
- La cadena de deltas no conserva los bits bajos de FP32: para esos valores hay que usar el repositorio FP32 original.
- Para reconstruir pasos distintos del 300 se necesita el modelo base en la revisión `ea980cb`, numpy, torch, safetensors, huggingface_hub y el comando `zstd`.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para producción y su calidad en tareas generales no está documentada.
- Con 0 descargas y 1 like en el momento de la ficha, no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/XudongZhu/Qwen3-1.7B-Base-SFT-OnPolicy-BF16Delta
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Gemelo off-policy: https://huggingface.co/XudongZhu/Qwen3-1.7B-Base-SFT-OffPolicy-BF16Delta
- Repositorio FP32 del mismo entrenamiento: https://huggingface.co/XudongZhu/Qwen3-1.7B-Base-SFT-OnPolicy
- Código del estudio: https://github.com/xzAscC/PostDyn
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de evaluación MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset de evaluación MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Colección de checkpoints PostDyn: https://huggingface.co/collections/XudongZhu/postdyn-checkpoints-of-intermediate-training-steps-6ae29b555274b0282beebb59
