# Virtudant-AI/Qwen3-8B

## Resumen

Qwen3-8B es un modelo de lenguaje causal denso de 8.190.735.360 parámetros (8,2 mil millones, 6,95 mil millones sin contar los embeddings) desarrollado por el equipo Qwen de Alibaba. Esta ficha concreta corresponde a la publicación `Virtudant-AI/Qwen3-8B`, un espejo del modelo oficial `Qwen/Qwen3-8B` que mantiene la licencia Apache 2.0 y se distribuye en formato safetensors para su uso con `transformers`. El modelo base de referencia es `Qwen/Qwen3-8B-Base`.

La propuesta técnica de la familia Qwen3 es la conmutación entre un modo de razonamiento explícito (thinking mode, con bloques `<think>...</think>`) y un modo de diálogo directo (non-thinking mode) dentro del mismo conjunto de pesos, controlable mediante el parámetro `enable_thinking` de la plantilla de chat. Esto permite usar el mismo modelo para tareas de lógica, matemáticas y código con razonamiento extendido, o para conversación general con menor latencia.

Con 36 capas, atención GQA (32 cabezas de consulta y 8 de clave-valor) y una ventana nativa de 32.768 tokens ampliable a 131.072 mediante YaRN, el modelo se posiciona en el segmento de 8B, donde la inferencia en GPU de consumo es viable con cuantización. Su relevancia actual radica en que combina soporte de agentes, tool calling y más de 100 idiomas con una licencia permisiva para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), GQA con 32 cabezas Q y 8 KV, 36 capas |
| Parámetros totales | 8.190.735.360 (8,2B); 6,95B sin embeddings |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantización | No disponible en la información proporcionada (soporte de GGUF, MLX y KTransformers vía ecosistema) |
| Idiomas soportados | Más de 100 idiomas y dialectos según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB); conversiones GGUF/MLX no confirmadas en esta ficha |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con normalización y atención de tipo GQA (Grouped Query Attention), con 32 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de memoria de la caché KV frente a atención multi-cabeza completa. Consta de 36 capas y emplea embeddings de tokens y de salida que suponen aproximadamente 1,24B de parámetros adicionales sobre los 6,95B no-embedding. La ventana de contexto nativa es de 32.768 tokens y se extiende a 131.072 mediante escalado YaRN, una técnica de interpolación posicional que permite extrapolar la longitud de contexto sin reentrenar desde cero.

El entrenamiento se realizó en dos fases: preentrenamiento y postentrenamiento, según la model card. La familia Qwen3 incorpora alineación con preferencias humanas orientada a escritura creativa, role-playing, diálogo multi-turno y seguimiento de instrucciones, además de capacidades de agente para integración con herramientas externas. La información proporcionada no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO de forma explícita; estos datos deben consultarse en el blog y la documentación oficiales de Qwen3.

La innovación técnica principal es el modo de pensamiento conmutable: el modelo genera un bloque de razonamiento delimitado por `<think>...</think>` antes de la respuesta final cuando `enable_thinking=True`, y responde directamente cuando se desactiva. La model card advierte de que en modo thinking debe usarse temperatura 0,6, top-p 0,95, top-k 20 y min-p 0, y desaconseja explícitamente la decodificación greedy por riesgo de degradación y repeticiones infinitas.

## Capacidades

- Generación de texto y diálogo multi-turno con alineación orientada a preferencias humanas.
- Razonamiento explícito en modo thinking para lógica, matemáticas y código.
- Generación y comprensión de código, con mejora declarada frente a Qwen2.5 instruct en modo non-thinking.
- Razonamiento matemático y lógico de sentido común.
- Soporte de tool calling y function calling en ambos modos (thinking y non-thinking).
- Capacidades de agente para tareas de múltiples pasos con integración de herramientas externas.
- Soporte multilingüe de más de 100 idiomas y dialectos, con seguimiento de instrucciones y traducción.
- Escritura creativa y role-playing.
- Conmutación entre thinking mode y non-thinking mode mediante `enable_thinking`.
- No se declaran capacidades de visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con hasta 32.768 tokens de contexto nativo, suficiente para arrastrar historial de tickets, políticas de producto y datos del cliente en una sola ventana; el modo non-thinking reduce la latencia en respuestas rutinarias.
- Generación de código en producción: con tool calling y modo thinking puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests o explicación de errores de compilación, reservando el razonamiento extendido para casos complejos.
- Asistentes de agente con herramientas: su soporte de function calling en ambos modos permite orquestar llamadas a APIs, consultas a bases de datos y acciones multi-paso en flujos de automatización.
- Análisis de documentos largos: con la extensión YaRN a 131.072 tokens puede procesar contratos, informes o expedientes completos sin troceado agresivo, extrayendo resúmenes y respuestas sobre el contenido.
- Traducción y localización multilingüe: los más de 100 idiomas declarados permiten usarlo como motor de traducción y adaptación de contenido en productos con mercados internacionales.
- Tutoría y resolución de problemas matemáticos: el modo thinking genera cadenas de razonamiento paso a paso útiles en entornos educativos, con la posibilidad de ocultar el bloque `<think>` al usuario final.
- Generación de contenido creativo y role-playing: la alineación con preferencias humanas y el diálogo multi-turno lo hacen adecuado para asistentes de escritura, guiones y personajes conversacionales.
- Despliegue en infraestructura propia: al ser Apache 2.0 y caber en GPU de consumo con cuantización, sirve para prototipos y entornos con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog, GitHub y documentación oficiales de Qwen3 para las evaluaciones comparativas, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de otras suites en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16,4 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda al menos 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB para pesos, con margen adicional para contexto largo.
- GPU de centro de datos: A100 (40/80 GB), H100 y L40S son adecuadas para FP16 con contexto largo y concurrencia.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado y en RTX 3090/4080 o superiores con cuantización de 8 o 4 bits.
- Despliegue en servidor: SGLang (>=0.4.6.post1) y vLLM (>=0.8.5) con soporte de `--reasoning-parser qwen3` y `--enable-reasoning` respectivamente, exponiendo API compatible con OpenAI.
- Despliegue local: Ollama, LM Studio, MLX-LM, llama.cpp y KTransformers están soportados según la model card.
- Requisito de librería: `transformers>=4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (esta ficha) | 8,2B (6,95B sin embeddings) | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Modo thinking conmutable, tool calling, 100+ idiomas |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Generación anterior de Qwen; sin modo thinking explícito |
| Llama 3.1-8B-Instruct | 8,0B | 131.072 | Llama 3.1 Community License | Contexto largo nativo; licencia con restricciones de uso |
| Mistral-7B-Instruct v0.3 | 7,2B | 32.768 | Apache 2.0 | Sin modo de razonamiento explícito |

La comparación de rendimiento entre estos modelos no puede establecerse con los datos disponibles en esta ficha, ya que no se han proporcionado resultados de benchmarks. Las cifras de parámetros y contexto de los modelos alternativos corresponden a sus especificaciones públicas habituales y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información proporcionada; como todo modelo entrenado con datos web a gran escala, es previsible que reproduzca sesgos presentes en esos datos.
- Alucinación: no se cuantifica el riesgo en la model card; el modo thinking puede aumentar la verbosidad y, con decodificación inadecuada, producir repeticiones.
- Decodificación: en thinking mode no debe usarse greedy decoding; la model card especifica temperatura 0,6, top-p 0,95, top-k 20 y min-p 0.
- Contexto: la ventana nativa es de 32.768 tokens; el uso de 131.072 requiere activar YaRN y puede degradar la calidad si no se configura correctamente.
- Idiomas: se declaran más de 100, pero no se especifica el rendimiento por idioma; los idiomas de bajos recursos pueden tener calidad inferior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el enlace de licencia oficial de Qwen referenciado en la model card antes de desplegar en producción.
- Madurez del repositorio: la ficha `Virtudant-AI/Qwen3-8B` registra 0 descargas y 0 likes, por lo que es un espejo sin tracción; para producción se recomienda usar el repositorio oficial `Qwen/Qwen3-8B`.
- Fecha de creación: el repositorio figura creado el 2026-11-06, dato que conviene contrastar con la disponibilidad real del modelo oficial.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Virtudant-AI/Qwen3-8B
- Modelo oficial: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Documentación de SGLang para modos thinking: https://qwen.readthedocs.io/en/latest/deployment/sglang.html#thinking-non-thinking-modes
- Documentación de vLLM para modos thinking: https://qwen.readthedocs.io/en/latest/deployment/vllm.html#thinking-non-thinking-modes
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
