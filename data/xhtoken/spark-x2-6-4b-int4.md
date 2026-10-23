# XHToken/Spark-X2.6-4B-INT4

## Resumen

Spark-X2.6-4B-INT4 es la versión cuantizada a 4 bits del modelo Spark-X2.6-4B, un LLM compacto de propósito general desarrollado por XHToken (familia SparkLLM) y orientado explícitamente al despliegue en dispositivo (*on-device*). El modelo conserva exactamente la misma arquitectura que su predecesor Spark-X2.5-4B y obtiene sus mejoras de capacidad exclusivamente mediante un post-entrenamiento revisado, con avances declarados en código, flujos agénticos, contexto largo, multilingüismo y razonamiento.

La relevancia de esta ficha concreta está en el formato: el repositorio publica pesos INT4 en safetensors con `compressed-tensors`, lo que reduce el peso del modelo a un repo de 3,4 GB y lo hace candidato a GPU de consumo. El recuento real de parámetros almacenados en safetensors es de 1.970.362.880 (~1,97 B), por debajo del "4B" del nombre comercial; conviene tenerlo en cuenta al planificar memoria y comparativas.

El modelo solo declara inglés y chino, licencia Apache 2.0 y soporte nativo de *thinking budget* configurable en tres niveles (none, low, high), además de tool calling con parser dedicado (`spark25`). Es, por tanto, una pieza pensada para agentes locales con control fino de latencia y coste de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag de arquitectura `spark2_5`; idéntica a Spark-X2.5-4B, sin detalle en la información) |
| Parámetros totales | 1.970.362.880 (~1,97 B) según safetensors del repo INT4; el nombre comercial indica "4B" |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | hasta 1.048.576 tokens (configuración de servidor SGLang indicada en la model card); `max_new_tokens` de ejemplo: 131.072 |
| Tipos de cuantización | INT4 (`compressed-tensors`); según la entrada de dev.to existen además Q4_K_M para llama.cpp y ejecuciones INT4 con TensorRT y MLX |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers con `trust_remote_code`), cuantización `compressed-tensors` |
| Modelo base | XHToken/Spark-X2.6-4B |
| Librería requerida | transformers 4.57.1 |
| Tamaño del repositorio | 3,4 GB |
| Pipeline | text-generation |
| Descargas / likes | 90 / 14 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La model card afirma que Spark-X2.6-4B "retiene exactamente la misma arquitectura que Spark-X2.5-4B" y que las ganancias provienen de un post-entrenamiento mejorado; el tag de arquitectura registrado es `spark2_5` y la integración en ms-swift se mapea a ese mismo identificador. No se especifica si se trata de un transformer denso, un MoE o un diseño híbrido, ni se publican el número de tokens de entrenamiento ni la composición del dataset.

Sí se documentan dos componentes de post-entrenamiento relevantes: un **presupuesto de razonamiento controlable** en tres niveles (none, low, high), que permite ajustar calidad de razonamiento frente a latencia y coste, y un soporte reforzado de **flujos agénticos** con uso de herramientas, planificación multi-paso e ingeniería de software. No se mencionan detalles de RLHF, DPO u otras etapas de alineación, ni innovaciones de atención (attention linear, decodificación especulativa). La model card incluye gráficas de benchmarks (`benchmark.svg`, `all_benchmark.svg`, `inference.svg`) sin valores numéricos en el texto.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (`apply_chat_template`).
- Razonamiento con modo *thinking* activable (`enable_thinking=True`) y presupuesto configurable en tres niveles: none, low, high.
- Capacidades de código y ingeniería de software, con mejoras declaradas frente a Spark-X2.5-4B.
- Capacidades matemáticas y de conocimiento general, evaluadas en la batería de benchmarks del autor.
- Tool calling / function calling: soporte nativo con parser `spark25` en SGLang, lo que habilita APIs compatibles con OpenAI para agentes con herramientas.
- Flujos agénticos multi-paso: planificación y ejecución de tareas compuestas.
- Contexto largo: la configuración de referencia admite hasta 1.048.576 tokens, adecuada para documentos extensos y sesiones agénticas prolongadas.
- Multilingüe limitado a inglés y chino (no se declara castellano).
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- **Agentes locales de escritorio**: con ~1,97 B de parámetros en INT4 y tool calling nativo, el modelo puede ejecutarse en un portátil con GPU de consumo y orquestar herramientas del sistema (ficheros, calendario, shell) sin enviar datos a la nube, lo que resulta crítico para privacidad.
- **Atención al cliente automatizada en inglés o chino**: la ventana de contexto de hasta 1.048.576 tokens permite mantener conversaciones multi-turno con historial largo y documentos adjuntos sin truncar; el modo *thinking* "none" reduce latencia en respuestas rutinarias.
- **Asistente de código en el IDE**: las mejoras declaradas en código y el soporte de instrucciones estructuradas permiten integrarlo en pipelines de revisión, generación de tests y refactorización, con el modo low/high alternando entre autocompletado rápido y explicaciones razonadas.
- **Extracción de información sobre documentación extensa**: contratos, informes o bases de conocimiento de cientos de miles de tokens pueden procesarse en una sola pasada si la memoria del dispositivo lo permite, reduciendo la necesidad de pipelines RAG complejos.
- **Automatización de tareas con APIs**: usando el parser de tool calling `spark25` en SGLang se puede exponer un endpoint compatible con OpenAI y encadenar llamadas a servicios REST en flujos multi-paso.
- **Procesamiento por lotes en el borde**: para clasificación, resumen o normalización de textos en inglés/chino dentro de dispositivos con recursos limitados, donde un modelo de 9 B no cabría.
- **Asistente educativo bilingüe**: explicaciones paso a paso con nivel de razonamiento ajustable, útil para entornos con presupuesto de cómputo variable.
- **Prototipado e investigación de agentes**: al ser Apache 2.0 y caber en una sola GPU, sirve como banco de pruebas reproducible para evaluar estrategias de planificación y *thinking budgets*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card referencia tres gráficas (`benchmark.svg`, `all_benchmark.svg`, `inference.svg`) con comparativas frente a modelos on-device de tamaño similar y modelos de ~9 B, pero los valores no están disponibles en forma de texto.

| Benchmark | Spark-X2.6-4B-INT4 | Referencia Qwen3.5-4B | Referencia Gemma-E4B |
|---|---|---|---|
| MMLU | no disponible | no disponible | no disponible |
| HumanEval | no disponible | no disponible | no disponible |
| GSM8K | no disponible | no disponible | no disponible |
| Tareas agénticas / tool use | no disponible (el autor declara rendimiento "best-in-class" en su clase, sin cifras) | no disponible | no disponible |

Las únicas cifras numéricas encontradas en la búsqueda web corresponden a otro modelo de la familia (Spark-X2.5-1.7B, con valores 47,4 / 42,1 / 64,5 / 71,6) y no identifican los benchmarks, por lo que no se trasladan a esta ficha.

## Requisitos de hardware

- **Peso de los pesos**: el repo INT4 ocupa 3,4 GB; en VRAM, los pesos en INT4 de ~1,97 B de parámetros deberían situarse aproximadamente entre 1 y 2 GB, más overhead de runtime, KV cache y buffers.
- **GPU de consumo**: cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) siempre que se limite la longitud de contexto. La ventana completa de 1.048.576 tokens exige mucha más memoria por el KV cache y no es viable en consumer.
- **GPU de datacenter**: A100 y H100 son las opciones indicadas implícitamente para servir contexto completo con SGLang; la configuración de referencia usa `--tp-size 1` y `--mem-fraction-static 0.8`, por lo que una sola GPU es suficiente si la memoria acompaña.
- **Aceleradores alternativos**: la model card incluye build diario de SGLang para Ascend NPU (CANN 9.0.0, A3 y A2/910B).
- **Opciones de despliegue**: SGLang (imagen `lmsysorg/sglang:nightly-dev-cu13`), transformers 4.57.1 con `trust_remote_code=True`, llama.cpp (Q4_K_M), TensorRT y MLX según la entrada de dev.to, y ms-swift para fine-tuning (la familia Spark-X2.5 aparece soportada en swift 4.7).
- **Latencia y throughput**: no disponibles. El autor afirma eficiencia de inferencia "igual o mejor" que Qwen3.5-4B y Gemma-E4B, pero sin cifras en el texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-INT4 | ~1,97 B (nombre comercial 4B) | hasta 1.048.576 tokens (config. SGLang) | sin cifras; el autor declara paridad o superioridad frente a modelos de ~9 B en varias tareas | Apache 2.0 | Hugging Face y ModelScope |
| Qwen3.5-4B | 4 B (según nombre) | no disponible en la información | referencia de eficiencia usada por el autor | no disponible en la información | no disponible en la información |
| Gemma-E4B | no disponible | no disponible | referencia de eficiencia usada por el autor | no disponible en la información | no disponible en la información |
| inclusionAI/Ling-3.0-tiny | no disponible | no disponible | comparado en discusiones de la comunidad LocalLLaMA | no disponible en la información | no disponible en la información |

La comparativa cuantitativa no puede completarse: la model card solo aporta gráficas y la búsqueda web no devuelve cifras atribuibles a este modelo. Los tres competidores citados aparecen mencionados por el propio autor o por la comunidad, no con datos verificables en esta información.

## Limitaciones y advertencias

- **Idiomas**: solo inglés y chino declarados. El rendimiento en castellano no está garantizado ni evaluado, lo que es un riesgo directo para productos en España.
- **Discrepancia de nomenclatura**: el nombre indica "4B" pero los safetensors del repo INT4 contienen 1.970.362.880 parámetros. Verificar el tamaño efectivo antes de dimensionar infraestructura.
- **Contexto anunciado vs. real**: la ventana de 1.048.576 tokens es una configuración de servidor; la calidad de recuperación en contextos muy largos no está documentada con métricas.
- **Sesgos**: no se publica ninguna información sobre evaluación de sesgos, toxicidad o alineación.
- **Alucinación**: sin datos de tasas de alucinación ni de evaluación en tareas de fidelidad; un modelo de ~2 B es especialmente propenso a errores factuales en conocimiento enciclopédico.
- **Cuantización INT4**: la pérdida de calidad frente al modelo base en FP16/BF16 no está cuantificada en la información disponible; conviene validar en la tarea concreta antes de producción.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de desplegar en entornos regulados.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los artefactos derivados (tokenizer, código custom) y las dependencias del runtime.
- **Madurez**: 90 descargas y 14 likes, con creación en octubre de 2026; tracción muy limitada y ecosistema de terceros escaso.
- **Sin benchmarks verificables**: la ausencia de cifras dificulta la comparación objetiva con alternativas.

## Enlaces

- Hugging Face (modelo INT4): https://huggingface.co/XHToken/Spark-X2.6-4B-INT4
- Hugging Face (modelo base): https://huggingface.co/XHToken/Spark-X2.6-4B
- ModelScope: https://modelscope.ai/models/XHToken/Spark-X2.6-4B-INT4
- Artículo del autor en dev.to: https://dev.to/sparkllm/spark-x26-4b-stronger-on-device-agents-coding-and-controllable-thinking-2fh
- Documentación de ms-swift (modelos soportados): https://swift.readthedocs.io/en/latest/Instruction/Supported-models-and-datasets.html
- Hilo comparativo en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1wao3d5/xhtokensparkx254b_vs_inclusionailing30tiny_vs/
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
