# VertexAGI/amethyst-1.5-mini

## Resumen

Amethyst 1.5 Mini es un modelo de chat de propósito general afinado a partir de google/gemma-3-4b-it, desarrollado por VertexAGI como proyecto de investigación independiente. Su objetivo es resolver un problema concreto de los modelos pequeños: la fiabilidad en el uso de herramientas. Mientras que el modelo base invoca un buscador web de forma errática (busca cosas que ya sabe y no busca información realmente actual), Amethyst 1.5 Mini aprende explícitamente cuándo llamar a la herramienta, cuándo no hacerlo, cómo descomponer preguntas complejas en varias consultas y cómo refinar una búsqueda tras obtener resultados pobres.

Técnicamente es un transformer denso decoder-only de 4B parámetros (4.551.515.648 según los pesos en safetensors), derivado del checkpoint cuantizado QAT de 4 bits de Gemma 3 4B IT y entrenado mediante LoRA con MLX sobre Apple Silicon. La ventana de contexto heredada del modelo base es de 128.000 tokens, aunque el entrenamiento se realizó con secuencias de 2.048 tokens.

Su relevancia actual reside en la demostración de que un ajuste fino pequeño y barato (4.987 ejemplos sintéticos, LoRA de rango 8, 3.250 iteraciones en una máquina de 16 GB) puede corregir un comportamiento de tool calling deficiente sin degradar la calidad conversacional general. El repositorio distribuye pesos en 4 bits para MLX y GGUF Q4_K_M, lo que lo hace desplegable en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 3, transformer denso decoder-only |
| Parámetros totales | 4.551.515.648 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; el entrenamiento usó 2.048) |
| Tipos de cuantización | 4-bit MLX (group size 64), GGUF Q4_K_M |
| Idiomas soportados | inglés |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (MLX, 4-bit) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de mlx-community/gemma-3-4b-it-qat-4bit, un checkpoint de Gemma 3 4B IT con cuantización consciente del entrenamiento, y aplica un ajuste supervisado mediante LoRA con rango 8, escala 20.0, dropout 0.0 y 16 capas adaptadas. El entrenamiento se ejecutó con MLX y mlx-lm sobre Apple Silicon, con optimizador Adam, tasa de aprendizaje constante de 1e-5, longitud de secuencia de 2.048 tokens, gradient checkpointing activado y un tamaño de lote de 2 (reducido desde 4 al superar los 13 GB de memoria pico en una máquina de 16 GB). Se completaron 3.250 iteraciones con validación cada 200 pasos, alcanzando una pérdida de validación final de 0.652 (frente a 0.807 en el punto de reanudación con el lote reducido).

El dataset consta de 4.987 ejemplos sintéticos (4.589 de entrenamiento y 398 de validación) generados por destilación de conocimiento a partir de nvidia/nemotron-3-super-120b-a12b y nvidia/nemotron-3-ultra-550b-a55b vía la API NVIDIA NIM, cinco veces más datos que la versión 1 Mini. La composición es deliberadamente desequilibrada hacia el chat general (3.264 ejemplos), con categorías específicas para seguimiento multi-turno (438), resumen con citas de fragmentos recuperados (374), búsqueda de consulta única (305), refinamiento tras resultado pobre (183), descomposición en múltiples consultas (149) y una clase negativa de 274 ejemplos etiquetados como "no buscar". Esta última es la innovación metodológica clave: sin ejemplos negativos, un modelo con tool calling tiende a invocar la búsqueda incluso para preguntas triviales.

## Capacidades

- Generación de texto conversacional: explicación, razonamiento, código, planificación, escritura creativa, extracción de información, lluvia de ideas, matemáticas, análisis de sentimiento y traducción (dentro del ámbito del dataset).
- Tool calling con un único esquema: emite llamadas en formato `<tool_call>{"name": "web_search", "arguments": {"queries": ["..."]}}</tool_call>` y consume resultados en bloques `<tool_result>`.
- Decisión de invocación: distingue entre preguntas que requieren búsqueda y preguntas respondibles con conocimiento propio.
- Descomposición de consultas: divide una pregunta compuesta en varias búsquedas distintas.
- Refinamiento de consulta: reformula la búsqueda tras obtener resultados débiles.
- Respuesta fundamentada con citas: sintetiza fragmentos recuperados en una respuesta citada.
- Conversación multi-turno con turnos elípticos ("¿y el otro?").
- Capacidades heredadas de Gemma 3 4B IT: ventana de contexto de 128.000 tokens y arquitectura multimodal image-text-to-text en el modelo base (el ajuste se centra en texto y tool use).
- Idiomas: inglés únicamente.

## Casos de uso

- Asistente de búsqueda web con citas: el modelo decide si buscar, lanza una o varias consultas y resume los fragmentos recuperados en una respuesta con referencias. Es su caso de uso principal y el que motivó el ajuste.
- Chatbot de atención al cliente con backend de conocimiento: para consultas que requieren datos actuales (estado de pedido, disponibilidad) invoca la herramienta; para preguntas de FAQ responde sin llamada, reduciendo latencia y coste de API.
- Enrutador de consultas en pipelines RAG: actúa como clasificador previo que decide si una pregunta necesita recuperación externa o puede resolverse con el contexto ya inyectado.
- Agente de investigación ligero: descompone preguntas comparativas ("¿qué diferencia hay entre X e Y en precio y soporte?") en búsquedas separadas y consolida los resultados.
- Despliegue local en portátiles Apple Silicon: los pesos MLX de 4 bits (2,56 GB) permiten ejecutar el modelo con mlx-lm en un Mac con 16 GB de memoria unificada, útil para prototipos sin GPU dedicada.
- Experimentación en destilación a pequeña escala: sirve como referencia reproducible de cómo un LoRA de rango 8 y ~5.000 ejemplos sintéticos corrigen un comportamiento específico sobre un modelo de 4B.
- Integración en asistentes de escritorio vía Ollama o LM Studio: el GGUF Q4_K_M (2,87 GB) se carga en runtimes de llama.cpp para asistentes con acceso a búsqueda.

## Benchmarks y rendimiento

Evaluación sobre un conjunto retenido de 26 prompts escritos a mano, sin solapamiento con el banco de escenarios de entrenamiento:

| Métrica | Gemma 3 4B IT (base) | Amethyst 1.5 Mini |
|---|---|---|
| Corrección de tool call (16 prompts: 8 con llamada esperada, 8 sin llamada) | 5/16 (31%) | 16/16 (100%) |
| Calidad de chat general (10 prompts, juez ciego por pares) | 2 victorias | 2 victorias, 6 empates |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de una evaluación propia del autor con 26 prompts, por lo que la muestra es reducida y debe interpretarse como indicativa.

## Requisitos de hardware

- VRAM/memoria para MLX 4-bit: aproximadamente 2,56 GB de pesos; con overhead de runtime, unos 3,5-4 GB de memoria unificada.
- VRAM/memoria para GGUF Q4_K_M: aproximadamente 2,87 GB de pesos; con contexto largo, la caché KV incrementa el consumo de forma proporcional a la longitud de contexto.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para cuantización 4-bit; RTX 3060/4060 en adelante. Para contexto completo de 128.000 tokens se requiere bastante más memoria por la caché KV.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y en Mac con 16 GB de memoria unificada (el autor entrenó en una máquina de 16 GB).
- Opciones de despliegue: mlx-lm (Apple Silicon), llama.cpp, Ollama, LM Studio y transformers con los pesos safetensors. El tag text-generation-inference indica compatibilidad con TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Formatos |
|---|---|---|---|---|---|
| Amethyst 1.5 Mini | 4,55B (denso) | 128.000 (heredado) | Especializado en `web_search` con clase negativa | Gemma Terms of Use | safetensors MLX 4-bit, GGUF Q4_K_M |
| google/gemma-3-4b-it | 4B (denso) | 128.000 | Tool calling genérico, invocación inconsistente según la evaluación del autor | Gemma Terms of Use | safetensors, GGUF (comunidad) |
| Amethyst 1 Mini | 4B (derivado de Gemma 3 4B IT) | no disponible | No entrenado para tool calling (foco en chat) | Gemma Terms of Use | no disponible |

La comparación con alternativas de otros fabricantes en el rango de 3-4B con tool calling especializado no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento de tamaño moderado (~5.000 ejemplos sintéticos): el comportamiento puede ser inconsistente fuera de las categorías representadas.
- Hereda las limitaciones y la fecha de corte de conocimiento de Gemma 3 4B IT.
- Destilado de modelos Nemotron sin revisión humana de cada ejemplo: pueden aparecer artefactos propios de datos sintéticos.
- Tool calling entrenado contra un único esquema (`web_search` con campo `queries`); el comportamiento con otros esquemas de herramientas no está probado.
- Solo inglés: no hay soporte multilingüe declarado.
- La evaluación se basa en 26 prompts del propio autor, sin benchmarks estándar ni validación externa; el 16/16 debe tomarse con cautela.
- El autor declara explícitamente que no está destinado a uso en producción ni a entornos críticos de seguridad.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribución que deben revisarse antes de cualquier despliegue comercial.
- Riesgo de alucinación inherente al modelo base, mitigado parcialmente en el flujo de búsqueda por la exigencia de citar fragmentos recuperados, pero no eliminado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/amethyst-1.5-mini
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Checkpoint de ajuste: https://huggingface.co/mlx-community/gemma-3-4b-it-qat-4bit
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Framework MLX: https://github.com/ml-explore/mlx
- Modelo profesor: https://huggingface.co/nvidia/nemotron-3-super-120b-a12b
- Modelo profesor: https://huggingface.co/nvidia/nemotron-3-ultra-550b-a55b
