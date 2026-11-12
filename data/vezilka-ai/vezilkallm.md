# vezilka-ai/VezilkaLLM

## Resumen

VezilkaLLM es un modelo de lenguaje base de 3.880.263.168 parámetros (aproximadamente 4B) especializado en macedonio, desarrollado por vezilka-ai a partir del modelo preentrenado Gemma 3 4B de Google. El modelo se ha entrenado sobre un corpus macedonio de alta calidad de 1.470 millones de palabras procedente de LVSTCK, con el objetivo de mejorar la fluidez y el rendimiento en tareas de PLN en macedonio, un idioma de bajos recursos, manteniendo un tamaño reducido que permite el ajuste fino y el despliegue en hardware modesto.

La arquitectura subyacente es la de Gemma 3 4B (transformer decoder-only con pesos en formato safetensors y tipo de modelo `gemma3_text`), entrenada con la API Trainer de Hugging Face Transformers sobre una única GPU NVIDIA H100, con una ventana de contexto de 8192 tokens y optimizada para coherencia en contextos largos. El modelo se distribuye con licencia Apache 2.0.

Su relevancia radica en que es el primer modelo de una nueva serie de LLM macedonios y demuestra que el entrenamiento específico de dominio permite a un modelo de 4B igualar o superar a modelos multilingües o de 7B-8B en benchmarks macedonios. Se plantea como modelo base para futuros ajustes (instruction tuning, chat, razonamiento y tareas de dominio) y no incluye mecanismos de seguridad ni ajuste para chat de serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B, tipo `gemma3_text`) |
| Parametros totales | 3.880.263.168 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Macedonio (entrenamiento específico); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VezilkaLLM parte del modelo preentrenado Gemma 3 4B (`google/gemma-3-4b-pt`), un transformer decoder-only, y lo entrena sobre un corpus macedonio de 1.470 millones de palabras de alta calidad procedente de LVSTCK. El entrenamiento se realizó con la API Trainer de Hugging Face Transformers en una única GPU NVIDIA H100, con una ventana de contexto de 8192 tokens y optimización explícita para coherencia en contextos largos.

No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El modelo se presenta como base, sin ajuste de instrucciones ni de chat.

## Capacidades

- Generación de texto en macedonio con fluidez, gracias al entrenamiento específico sobre un corpus de 1.470 millones de palabras.
- Modelo base: no incluye ajuste para instrucciones ni para chat de serie.
- Coherencia en contextos largos, con ventana de 8192 tokens.
- Rendimiento en tareas de comprensión y razonamiento evaluado en benchmarks macedonios (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, Winogrande, NQ Open).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base).
- Capacidades multilingües: no disponibles más allá del macedonio.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Apto como punto de partida para ajuste fino en tareas posteriores.

## Casos de uso

- Ajuste fino para instrucciones y chat: al ser un modelo base de 4B, sirve como punto de partida para instruction tuning y construcción de asistentes conversacionales en macedonio, con requisitos de hardware moderados.
- Generación de texto en macedonio: redacción de contenido, resúmenes y textos divulgativos con fluidez nativa, aprovechando el corpus específico de dominio.
- Procesamiento de documentos largos: la ventana de 8192 tokens permite resumir o analizar documentos extensos en macedonio manteniendo coherencia.
- Investigación en PLN de bajos recursos: referencia para estudiar el efecto del entrenamiento específico de dominio en idiomas con pocos datos, comparando con Gemma 3 4B y modelos macedonios de 7B-8B.
- Clasificación y respuesta a preguntas: adaptación mediante fine-tuning para tareas como BoolQ o NQ Open en macedonio, donde el modelo ya muestra resultados competitivos.
- Despliegue en hardware modesto: su tamaño de 4B y licencia Apache 2.0 facilitan prototipos y experimentos en entornos con recursos limitados.
- Base para tareas de dominio específico: punto de partida para ajustes en sectores concretos (legal, sanitario, administración) en macedonio.

## Benchmarks y rendimiento

| Modelo | ARC Challenge | ARC Easy | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande | NQ Open |
|---|---|---|---|---|---|---|---|---|
| gemma-3-4b-pt | 0,28 | 0,48 | 0,75 | 0,39 | 0,25 | 0,62 | 0,59 | 0,00 |
| VezilkaLLM | 0,30 | 0,50 | 0,72 | 0,41 | 0,25 | 0,65 | 0,59 | 0,03 |
| domestic-yak-8B | 0,31 | 0,52 | 0,77 | 0,43 | 0,29 | 0,67 | 0,63 | 0,04 |
| MKLLM-7B | 0,32 | 0,54 | 0,71 | 0,43 | 0,28 | 0,62 | 0,62 | 0,03 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4B en FP16 se requiere aproximadamente 8 GB de VRAM, y en cuantizaciones de 8 bits o 4 bits el requisito baja considerablemente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H100; para inferencia son suficientes GPUs consumer de gama alta.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8-16 GB de VRAM (estimación orientativa).
- Opciones de despliegue: Hugging Face Transformers (documentado en la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento macedonio |
|---|---|---|---|---|
| VezilkaLLM | 3,88B | 8192 | Apache 2.0 | Competitivo en ARC, PIQA, HellaSwag |
| gemma-3-4b-pt | 4B (aprox.) | no disponible | no disponible | Ligeramente inferior en la mayoría de benchmarks |
| domestic-yak-8B | 8B | no disponible | no disponible | Superior en la mayoría de benchmarks |
| MKLLM-7B | 7B | no disponible | no disponible | Superior en ARC y HellaSwag |

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni de chat: no está pensado para uso conversacional directo.
- No incluye mecanismos de seguridad de serie; puede generar contenido inapropiado o sesgado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones.
- Idiomas soportados limitados en la práctica al macedonio; el comportamiento en otros idiomas no está documentado.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre el rendimiento en producción.
- Algunos resultados de benchmarks son inferiores a modelos de 7B-8B (BoolQ, OpenBookQA, Winogrande), por lo que conviene evaluar según la tarea.
- La model card contiene errores tipográficos y referencias inconsistentes (por ejemplo, el ID `finki-ukim/VezilkaLLM` en el ejemplo de código frente a `vezilka-ai/VezilkaLLM`), lo que conviene verificar antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/vezilka-ai/VezilkaLLM
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Corpus LVSTCK: https://huggingface.co/LVSTCK
- Modelo comparable domestic-yak-8B: https://huggingface.co/LVSTCK/domestic-yak-8B
- Modelo comparable MKLLM-7B: https://huggingface.co/trajkovnikola/MKLLM-7B
- Figura de benchmarks: https://cdn-uploads.huggingface.co/production/uploads/67b080b373329eb145daa150/Cl0S2V51aucdo0IMDTCSy.png
