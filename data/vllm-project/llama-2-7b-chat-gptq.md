# vllm-project/Llama-2-7B-Chat-GPTQ

## Resumen

Llama-2-7B-Chat-GPTQ es una versión cuantizada en 4 bits mediante GPTQ del modelo meta-llama/Llama-2-7b-chat-hf, el modelo conversacional de 7.000 millones de parámetros publicado por Meta en julio de 2023. Esta copia concreta la mantiene la organización vllm-project como espejo del repositorio original de TheBloke (commit `d5ad931`), con el objetivo declarado de reducir el riesgo de cadena de suministro en los pipelines de integración continua de vLLM, ya que el original reside en una cuenta personal.

El modelo base es un transformer decoder-only autorregresivo de 6.739.777.536 parámetros, entrenado sobre datos mayoritariamente en inglés y afinado con RLHF para uso conversacional. La cuantización GPTQ en 4 bits reduce el peso del repositorio a 3,9 GB, lo que permite desplegarlo en GPUs de consumo con VRAM moderada manteniendo una calidad cercana al modelo en fp16.

Su relevancia actual es fundamentalmente práctica: sirve como checkpoint de referencia estable para probar kernels y rutas de inferencia GPTQ en vLLM, y como opción ligera para prototipos de asistentes conversacionales en inglés sobre hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.739.777.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (modelo base Llama 2) |
| Tipos de cuantizacion | GPTQ 4 bits (multiples permutaciones de group size y act order en ramas del repo) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con RoPE, la arquitectura estándar de la familia Llama 2. El modelo original fue entrenado por Meta sobre 2 billones de tokens de datos públicos, con un proceso posterior de ajuste supervisado y RLHF (rechazo de muestras y optimización con PPO) para alinear el comportamiento conversacional. La model card no detalla la composición exacta del dataset ni los hiperparámetros de entrenamiento.

Esta versión concreta no ha sido reentrenada: es una cuantización GPTQ de 4 bits generada con AutoGPTQ (en la rama principal, para ficheros posteriores a agosto de 2023) o con GPTQ-for-LLaMa en ficheros antiguos. El repositorio ofrece varias permutaciones de parámetros GPTQ (bits, group size, act order/desc_act, damp %, dataset de calibración y longitud de secuencia), cada una en su propia rama, para ajustar el equilibrio entre uso de VRAM y precisión de cuantización. La plantilla de prompt es la de Llama-2-Chat, con bloque `[INST]` y sistema `<<SYS>>`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento básico y respuesta a preguntas generales.
- Generación de código y explicaciones técnicas a nivel introductorio-medio.
- Aritmética y problemas matemáticos sencillos (con fiabilidad limitada en cadenas largas).
- Resumen y reescritura de documentos dentro de la ventana de contexto.
- Seguimiento de instrucciones mediante la plantilla Llama-2-Chat.
- No dispone de tool calling ni function calling nativo.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidades de agente y razonamiento multi-paso muy limitadas; requiere orquestación externa.
- Multilingüismo limitado: el entrenamiento está centrado en inglés.

## Casos de uso

- Pruebas de integración de vLLM: el checkpoint sirve para validar la ruta de inferencia GPTQ en CI, comparando salidas y rendimiento entre versiones del motor sin depender de un repositorio de terceros.
- Asistente conversacional ligero en inglés: desplegado con vLLM o TGI sobre una única GPU, gestiona diálogos multi-turno de hasta 4096 tokens con latencia baja.
- Prototipado de chatbots de soporte interno: permite iterar sobre prompts de sistema y flujos de conversación en inglés antes de migrar a modelos mayores.
- Generación de documentación técnica en inglés: redacción de borradores de README, docstrings y guías a partir de contexto breve.
- Clasificación y extracción de información: tareas de etiquetado zero-shot o few-shot sobre textos que caben en la ventana de contexto.
- Evaluación comparativa de cuantizaciones: al existir variantes GPTQ con distintos group size y act order, permite medir la degradación de calidad frente al modelo fp16 en tareas concretas.
- Entorno educativo y de investigación: modelo pequeño y económico para estudiar comportamiento de modelos alineados con RLHF y efectos de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en GPTQ 4 bits: en torno a 4-5 GB para pesos, más overhead de caché KV; con contexto de 4096 tokens y lote pequeño, el consumo típico se sitúa entre 6 y 8 GB.
- GPUs recomendadas: RTX 3090, RTX 4090, A10G, L4, A100 y H100 para mayor throughput; también válidas RTX 3060 de 12 GB y RTX 4070 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM usando GPTQ 4 bits; las variantes GGUF del modelo base permiten incluso inferencia parcial en CPU.
- Opciones de despliegue: vLLM (motor principal para el que se mantiene esta copia), AutoGPTQ, Text Generation Inference y ExLlama/ExLlamaV2 según la compatibilidad de la rama; llama.cpp y Ollama requieren los ficheros GGUF del repositorio de TheBloke, no estos pesos GPTQ.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU, del group size elegido y de la configuración del motor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-2-7B-Chat-GPTQ (este) | 6,74 B | 4096 | GPTQ 4 bits | llama2 | HuggingFace (espejo vllm-project) |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 | fp16 | llama2 | HuggingFace (oficial) |
| TheBloke/Llama-2-7b-Chat-AWQ | 6,74 B | 4096 | AWQ 4 bits | llama2 | HuggingFace |
| TheBloke/Llama-2-7b-Chat-GGUF | 6,74 B | 4096 | GGUF 2-8 bits | llama2 | HuggingFace |

Las diferencias entre estas variantes son de formato y cuantización, no de capacidad: todas derivan del mismo modelo base. La versión GPTQ está orientada a GPUs con vLLM y AutoGPTQ; AWQ ofrece otra ruta de cuantización de 4 bits para GPUs; GGUF está pensada para CPU y GPU con llama.cpp. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre datos web mayoritariamente en inglés, puede reproducir sesgos de género, raza y cultura presentes en esos datos; el RLHF mitiga pero no elimina este comportamiento.
- Riesgo de alucinación: elevado en preguntas factuales, especialmente con contexto largo o temas poco representados; el prompt de sistema pide explícitamente no inventar información, pero no lo garantiza.
- Limitación de idioma: el modelo está entrenado y evaluado principalmente en inglés; el rendimiento en castellano u otros idiomas es notablemente inferior.
- Ventana de contexto de 4096 tokens: insuficiente para documentos largos o conversaciones extensas sin técnicas de recuperación externa.
- Sin soporte nativo de tool calling ni agentes: cualquier flujo multi-paso requiere prompts estructurados y orquestación externa.
- Licencia Llama 2 Community: permite uso comercial con condiciones (umbral de 700 millones de usuarios mensuales, obligación de incluir el aviso de licencia y la política de uso aceptable); conviene revisar los términos completos antes de desplegar en producción.
- Copia de espejo: esta versión la mantiene vllm-project para CI; para uso en producción es preferible referenciar el repositorio oficial de Meta o el original de TheBloke y fijar una revisión concreta.
- Modelo de 2023: ha sido superado en calidad por generaciones posteriores de Llama y por otros modelos abiertos del mismo tamaño; su uso principal hoy es compatibilidad y pruebas de infraestructura.

## Enlaces

- [HuggingFace: vllm-project/Llama-2-7B-Chat-GPTQ](https://huggingface.co/vllm-project/Llama-2-7B-Chat-GPTQ)
- [Modelo base: meta-llama/Llama-2-7b-chat-hf](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf)
- [Repositorio original: TheBloke/Llama-2-7B-Chat-GPTQ](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GPTQ)
- [Variante AWQ: TheBloke/Llama-2-7b-Chat-AWQ](https://huggingface.co/TheBloke/Llama-2-7b-Chat-AWQ)
- [Variantes GGUF: TheBloke/Llama-2-7b-Chat-GGUF](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF)
- [Paper Llama 2 (arXiv:2307.09288)](https://arxiv.org/abs/2307.09288)
- [Repositorio vLLM](https://github.com/vllm-project/vllm)
