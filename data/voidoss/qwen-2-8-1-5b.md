# VoidOSS/Qwen-2.8-1.5B

## Resumen

Qwen 2.8 (1.5B) es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por VoidOSS, un ajuste fino (fine-tuning) del modelo base Qwen2.5-1.5B de Alibaba Cloud. Su principal característica es la integración nativa de razonamiento explícito mediante etiquetas `<think>...</think>`, destilado a partir de trazas de razonamiento del dataset AM-DeepSeek-R1-0528-Distilled, que a su vez proviene de DeepSeek-R1. El modelo incorpora un mecanismo de conmutación entre modo "Thinking" (razonamiento paso a paso) y modo "Fast" (respuesta directa sin razonamiento), controlable a nivel de pesos mediante el prefijo del prompt.

Se trata de un modelo pequeño (1.777 millones de parámetros reales según safetensors) pensado para ejecutarse en hardware de consumo, como una RTX 4060 Ti de 8 GB, y está publicado bajo licencia Apache 2.0. Su relevancia radica en demostrar que es posible inyectar capacidades de razonamiento tipo DeepSeek-R1 en modelos de 1.5B mediante destilación y SFT con QLoRA, obteniendo mejoras sustanciales en tareas de matemáticas y lógica frente al modelo base, con un coste computacional muy reducido.

El modelo está orientado exclusivamente a inglés (idioma declarado: en) y a generación de texto conversacional. No se dispone de información sobre la longitud de contexto entrenada más allá de la del modelo base Qwen2.5-1.5B, que no se especifica en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning de Qwen2.5-1.5B |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B, no especificada) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no confirmadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura Qwen2, partiendo de los pesos de Qwen2.5-1.5B. Sobre esa base, VoidOSS aplicó un ajuste fino supervisado (SFT) con QLoRA utilizando el dataset AM-DeepSeek-R1-0528-Distilled, que contiene trazas de razonamiento destiladas de DeepSeek-R1. El entrenamiento incluye una mezcla de replay (replay mixing) para preservar capacidades del modelo base, según se indica en la model card. El resultado es un modelo dual-mode: entrenado para producir razonamiento explícito entre etiquetas `<think>` y `</think>` cuando se le solicita, y para responder directamente cuando se le induce a omitir el razonamiento.

La innovación técnica principal es el control del modo de razonamiento a nivel de pesos mediante el prefilling del prompt: en modo Thinking se usa el prefijo estándar `<|im_start|>assistant\n`, mientras que en modo Fast se prellena `<|im_start|>assistant\n<think>\n</think>\n` para forzar el bypass del razonamiento con una tasa de cumplimiento del 100% (0% de reapertura de `<think>`) según los datos del autor. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento explícito paso a paso mediante bloques `<think>...</think>` (modo Thinking).
- Respuesta directa sin razonamiento en modo Fast, con bypass del bloque de pensamiento.
- Razonamiento matemático (mejora sustancial en GSM8K frente al base, según el autor).
- Razonamiento lógico y resolución de trampas cognitivas.
- Generación y ejecución de código Python (evaluado con tests unitarios).
- Depuración de bugs (bug-fix debugging).
- Resolución de restricciones y problemas multi-hop (constraint & multi-hop puzzles).
- Parada nativa limpia mediante token EOS (clean native EOS stopping).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita, aunque el modo Thinking facilita razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: thinking mode conmutable, destilación de razonamiento DeepSeek-R1.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas aritméticos y de word problems en modo Thinking, con una mejora reportada de 12% a 40% en GSM8K frente al base, adecuado para asistentes educativos o validación de cálculos en entornos con recursos limitados.
- Generación de código Python en local: con un 87,5% de éxito en tests unitarios según el autor, puede integrarse en editores o pipelines de CI/CD ligeros para autocompletar y generar funciones, ejecutándose en una GPU de consumo de 8 GB.
- Depuración de código (bug-fix): aunque sin mejora frente al base (66,7% en ambos), puede usarse como primer filtro en herramientas de revisión de código para identificar errores comunes en fragmentos pequeños.
- Asistente conversacional con razonamiento opcional: gracias al modo Fast, puede desplegarse como chatbot de baja latencia en inglés, activando el modo Thinking solo cuando la consulta requiera razonamiento complejo, optimizando el coste de tokens.
- Resolución de puzzles y problemas de lógica: con un 100% en constraint & multi-hop puzzles en modo Thinking (frente al 12,5% del base), es útil en aplicaciones de resolución de acertijos, planificación con restricciones o generación de explicaciones lógicas.
- Prototipado e investigación en destilación de razonamiento: sirve como caso de estudio reproducible para investigadores que quieran replicar la inyección de trazas de DeepSeek-R1 en modelos pequeños mediante QLoRA y SFT.
- Despliegue en edge o hardware de consumo: al caber en 8 GB de VRAM (RTX 4060 Ti según el autor), puede ejecutarse en estaciones de trabajo modestas para tareas de generación de texto y razonamiento sin infraestructura cloud.

## Benchmarks y rendimiento

Datos publicados por el autor, evaluados en una RTX 4060 Ti (8 GB) con decodificación greedy (`do_sample=False`):

| Benchmark | Qwen2.5-1.5B (base) | Qwen 2.8-1.5B | Delta |
|---|---|---|---|
| GSM8K (50 problemas, cap 512 tokens) | 12,0% (6/50) | 40,0% (20/50) | +28,0 pts (3,33×) |
| Logic & Cognitive Traps (10) | 30,0% (3/10) | 70,0% (7/10) | +40,0 pts (2,33×) |
| Python Code Execution (8 tests) | 62,5% (5/8) | 87,5% (7/8) | +25,0 pts |
| Bug-Fix Debugging (6 tareas) | 66,7% (4/6) | 66,7% (4/6) | 0,0 pts |
| Constraint & Multi-Hop (8 puzzles) | 12,5% (1/8) | 100,0% (8/8) | +87,5 pts (8,0×) |
| Tasa de razonamiento `<think>` | 0,0% | 97,7% | +97,7 pts |
| Parada nativa EOS limpia | 42,0% | 65,9% | +23,9 pts |

Comparativa Fast Mode vs Thinking Mode (según el autor):

| Modo | Logic Traps (10) | Python Code (8) | Constraint/Multi-Hop (8) | Tokens medios | Tiempo total | Bypass / tasa `<think>` |
|---|---|---|---|---|---|---|
| Fast Mode | 80,0% (8/10) | 87,5% (7/8) | 62,5% (5/8) | 536,9 | 37,8 s | 100,0% bypass |
| Thinking Mode | 80,0% (8/10) | 87,5% (7/8) | 87,5% (7/8) | 502,9 | 37,2 s | 92,3% `<think>` |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, etc.) en la información disponible; los datos anteriores son evaluaciones internas del autor con muestras pequeñas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 3,5 GB solo para pesos (1.777 M parámetros × 2 bytes), más overhead de KV cache y activaciones; en cuantización de 4 bits, alrededor de 1 GB para pesos. Los valores exactos de cuantización no están documentados por el autor.
- GPU recomendadas: el autor reporta evaluación en RTX 4060 Ti (8 GB); cabe holgadamente en RTX 3060 (12 GB), RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6-8 GB o más en FP16, y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: compatible con frameworks estándar para modelos Qwen2 (transformers, vLLM, llama.cpp, Ollama, TGI), aunque no se confirman conversiones GGUF publicadas por el autor.
- Latencia y throughput estimados: el autor reporta tiempos totales de ~37 s para las suites de evaluación en RTX 4060 Ti, con una media de ~500-537 tokens generados; no se proporcionan métricas de throughput (tokens/s) formales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen 2.8-1.5B (VoidOSS) | 1,777 M | no disponible | `<think>` conmutable (destilado R1) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B (Alibaba) | 1,5 B | no disponible | sin modo thinking nativo | Apache 2.0 | Hugging Face |
| Qwen-2.6-Thinking-1.5B (VoidOSS) | ~1,5 B | no disponible | thinking (release previa) | no disponible | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | no disponible | thinking (destilado R1) | no disponible en la información | Hugging Face |

La comparativa se limita a modelos de la misma familia y tamaño; no se dispone de datos de benchmarks cruzados con alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está validado.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5-1.5B y de trazas de DeepSeek-R1, puede heredar sesgos de ambos.
- Alucinación: como todo modelo pequeño, tiene riesgo elevado de alucinación, especialmente en modo Fast y en tareas de conocimiento factual.
- Contexto: la longitud de contexto no se especifica; se desconoce si el fine-tuning preserva la ventana completa del modelo base.
- Benchmarks con muestras pequeñas: las evaluaciones del autor usan 6-50 ejemplos por suite, por lo que los resultados tienen alta varianza y no son comparables con benchmarks estándar.
- Bug-fix sin mejora: el modelo no supera al base en depuración de bugs (66,7% en ambos), lo que limita su uso en esa tarea.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las obligaciones de atribución del modelo base y del dataset de destilación.
- Producción: 0 descargas y 0 likes en el momento de la ficha; el modelo es muy reciente y no tiene validación comunitaria. El autor no documenta cuantizaciones oficiales ni integración con servidores de inferencia.
- Modo Fast: aunque el bypass es del 100% en las pruebas del autor, el control depende de un prefilling específico que debe implementarse correctamente en el servidor de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoidOSS/Qwen-2.8-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de destilación: https://huggingface.co/datasets/a-m-team/AM-DeepSeek-R1-0528-Distilled
- Release previa: https://huggingface.co/VoidOSS/Qwen-2.6-Thinking-1.5B
