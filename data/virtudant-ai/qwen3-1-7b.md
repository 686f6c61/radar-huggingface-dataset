# Virtudant-AI/Qwen3-1.7B

## Resumen
Qwen3-1.7B es un modelo de lenguaje causal denso de la familia Qwen3, desarrollado por el equipo Qwen de Alibaba. Esta ficha concreta corresponde a la publicación `Virtudant-AI/Qwen3-1.7B`, un repositorio que replica los pesos del modelo base oficial `Qwen/Qwen3-1.7B-Base` bajo licencia Apache 2.0. Con 2.031.739.904 parámetros totales (1.700 millones declarados, 1.400 millones sin contar embeddings), 28 capas y una ventana de contexto de 32.768 tokens, se posiciona como la variante más pequena de la generación Qwen3, pensada para despliegue en entornos con recursos limitados.

La innovación principal de la familia es la capacidad de alternar entre modo "thinking" (razonamiento explícito con bloque `<think>...</think>`) y modo "non-thinking" (diálogo directo) dentro del mismo modelo, controlable mediante el parámetro `enable_thinking` en la plantilla de chat. Esto permite usar una única instancia tanto para tareas de razonamiento complejo como para conversación de baja latencia.

Su relevancia actual radica en que ofrece capacidades de razonamiento, agentes y multilingüismo (más de 100 idiomas según la model card) en un tamano que cabe en GPUs de consumo, con soporte nativo en transformers, vLLM, SGLang, llama.cpp, Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), atención GQA |
| Parametros totales | 2.031.739.904 (1,7B declarados; 1,4B sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No especificados en la informacion disponible; compatible con GGUF via llama.cpp/Ollama y con cuantizaciones estandar de transformers/vLLM |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,1 GB) |

## Arquitectura y entrenamiento
Qwen3-1.7B es un transformer causal denso con 28 capas y atención con Grouped Query Attention (GQA) de 16 cabezas para queries y 8 para claves/valores, lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. El modelo ha pasado por dos etapas: preentrenamiento y post-entrenamiento (instruction tuning y alineación con preferencias humanas), según indica la model card. No se detalla en la información proporcionada el número exacto de tokens de entrenamiento ni la composición del dataset.

La innovación técnica destacable es el doble modo de inferencia: en modo thinking el modelo genera contenido de razonamiento dentro de un bloque `<think>...</think>` antes de la respuesta final, mientras que en modo non-thinking responde directamente. La model card recomienda parámetros de muestreo distintos para cada modo (por ejemplo, `Temperature=0.6`, `TopP=0.95`, `TopK=20`, `MinP=0` en thinking mode) y sugiere `presence_penalty=1.5` para evitar repeticiones infinitas. Requiere `transformers>=4.51.0` para cargar la arquitectura `qwen3`.

## Capacidades
- Generación de texto y diálogo multi-turno con alineación a preferencias humanas (escritura creativa, role-play, seguimiento de instrucciones).
- Razonamiento explícito en modo thinking: matemáticas, lógica y generación de código con cadena de pensamiento visible.
- Modo non-thinking para respuestas rápidas y conversación general de baja latencia.
- Soporte de tool calling / function calling e integración con herramientas externas, en ambos modos.
- Capacidades de agente y razonamiento multi-paso, según la model card.
- Multilingüismo: más de 100 idiomas y dialectos, con instrucciones y traducción.
- Generación de código y matemáticas (mejoras declaradas frente a QwQ en thinking mode y Qwen2.5 instruct en non-thinking mode).
- No incluye visión ni audio según la información disponible.

## Casos de uso
- Asistente conversacional de bajo coste: desplegado en una única GPU de consumo, puede gestionar diálogos multi-turno con hasta 32.768 tokens de contexto, adecuado para chatbots de soporte con historial largo.
- Generación de código asistida en IDE: en modo thinking produce razonamiento paso a paso útil para depuración y explicación de fragmentos; se integra vía API compatible con OpenAI en vLLM o SGLang.
- Automatización de agentes con tool calling: el modelo puede invocar funciones externas (APIs, bases de datos) en flujos multi-paso, útil para orquestadores ligeros en producción.
- Traducción y procesamiento multilingüe: con soporte de más de 100 idiomas, sirve para pipelines de localización o atención al cliente en varios idiomas sin cambiar de modelo.
- Razonamiento matemático y educativo: el modo thinking permite generar explicaciones detalladas de problemas, aprovechable en tutores automáticos o generación de material didáctico.
- Prototipado e investigación: al ser pequeño y Apache 2.0, es idóneo para experimentación académica, fine-tuning y ablaciones sobre razonamiento sin grandes presupuestos de cómputo.
- Extracción y resumen de documentos largos: la ventana de 32K tokens permite procesar contratos, informes o transcripciones en una sola pasada en hardware modesto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4 GB solo para pesos, más KV cache y overhead; en la práctica 6-8 GB.
- En cuantización de 8 bits: en torno a 2-3 GB de pesos; en 4 bits: aproximadamente 1-1,5 GB, con margen adicional para contexto.
- GPU recomendadas: RTX 3060/4060 Ti (12-16 GB), RTX 4090, A10, L4, A100 y H100 para mayor throughput.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de 8 GB en cuantización de 4-8 bits.
- Opciones de despliegue: transformers (>=4.51.0), vLLM (>=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama, LM Studio, MLX-LM, KTransformers y TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B | 1,7B (2,03B reales) | 32.768 | Apache 2.0 | Doble modo thinking/non-thinking, tool calling |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Generación anterior, sin modo thinking explícito |
| Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community | Contexto mayor, licencia con restricciones de uso |
| Gemma 2 2B | 2,6B | 8.192 | Gemma Terms | Contexto menor, licencia con condiciones |

Los datos de rendimiento comparado no están disponibles en la información proporcionada; la comparación se limita a especificaciones y licencia.

## Limitaciones y advertencias
- Riesgo de repeticiones infinitas en generación: la model card recomienda `presence_penalty=1.5` y parámetros de muestreo específicos para mitigarlo.
- Riesgo de alucinación inherente a modelos de este tamano, especialmente en tareas de conocimiento factual denso.
- El modo thinking incrementa la latencia y el consumo de tokens; no es adecuado para aplicaciones de respuesta en tiempo real estricto.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al derivar de un modelo base entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Limitaciones de idioma: aunque se declaran más de 100 idiomas, el rendimiento en idiomas de bajos recursos puede ser inferior al de inglés y chino.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la procedencia de los pesos de este repositorio concreto (replicación de `Qwen/Qwen3-1.7B-Base`).
- Requiere `transformers>=4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una réplica no oficial; para producción se recomienda usar los pesos del repositorio oficial de Qwen.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/Virtudant-AI/Qwen3-1.7B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo oficial Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Paper de referencia (arXiv): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
