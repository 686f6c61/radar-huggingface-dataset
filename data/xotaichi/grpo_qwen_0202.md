# XOTaiChi/grpo_qwen_0202

## Resumen

CBC (Consistency Before Complying) es un ajuste fino de Qwen2.5-7B-Instruct orientado a la defensa contra ataques de inyección de prompts (prompt injection). Lo desarrolla el equipo de XOTaiChi y se presenta junto al artículo "Staying on Task: Defending Against Prompt Injection via Task Consistency Checking", aceptado en EMNLP 2026. El modelo parte de la base instructiva de Qwen2.5 de 7B parámetros y aplica un pipeline de ajuste supervisado (SFT) seguido de alineamiento con GRPO para reforzar el razonamiento de consistencia de tarea antes de obedecer instrucciones.

La propuesta técnica es que el modelo evalúe si una instrucción incrustada en el contexto (por ejemplo, dentro de un documento recuperado por RAG o de la salida de una herramienta) es consistente con la tarea original del usuario antes de ejecutarla. De este modo se busca mantener la utilidad en la tarea legítima mientras se bloquean instrucciones inyectadas maliciosas. El checkpoint se publica con licencia Apache 2.0, en formato safetensors y compatible con transformers y text-generation-inference.

Con 7.615.616.512 parámetros y un repositorio de 30,5 GB, es un modelo denso de tamaño medio que puede desplegarse en GPUs de gama alta de consumo con cuantización. Su relevancia actual reside en que aborda uno de los vectores de ataque más críticos en sistemas con LLM en producción (agentes, RAG, asistentes con acceso a herramientas), un área donde la mayoría de los modelos generalistas no incorpora defensas específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino de Qwen/Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors de transformers es cuantizable con GPTQ, AWQ, bitsandbytes o GGUF mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint instructivo Qwen2.5-7B-Instruct, un transformer decoder-only denso de la familia Qwen2. La innovación no está en la arquitectura base sino en el procedimiento de alineamiento: según la model card, CBC combina razonamiento de consistencia de tarea, ajuste supervisado (SFT) y alineamiento con GRPO (Group Relative Policy Optimization). El objetivo es que el modelo razone si la instrucción recibida es coherente con la tarea declarada por el usuario antes de cumplirla, y que rechace o ignore instrucciones inyectadas que desvíen la tarea.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni los detalles del proceso de síntesis de datos; la model card indica que los datos de entrenamiento y el código de síntesis de datos se publicarán próximamente. Tampoco se detalla si hubo fases adicionales de RLHF o DPO más allá del GRPO mencionado. El checkpoint incluye su propio tokenizer y plantilla de chat, que deben usarse tal cual para reproducir el comportamiento esperado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento de consistencia de tarea: evalúa si una instrucción es coherente con el objetivo original antes de obedecerla.
- Defensa contra prompt injection: resistencia a instrucciones maliciosas incrustadas en contexto, documentos o salidas de herramientas.
- Preservación de utilidad en la tarea legítima, según el objetivo declarado del artículo.
- Razonamiento multi-paso orientado a la verificación de tareas.
- Capacidades generales del modelo base: generación de código, matemáticas y razonamiento (no se detallan métricas específicas en la información disponible).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada; heredable del modelo base, pero no verificado para este checkpoint.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito, visión o audio: no disponibles.

## Casos de uso

- Asistentes RAG seguros: el modelo puede procesar documentos recuperados que contengan instrucciones ocultas y decidir si son consistentes con la consulta del usuario, reduciendo el riesgo de que un documento envenenado redirija al asistente. Es adecuado porque su entrenamiento específico en consistencia de tarea está diseñado para este escenario.
- Agentes con acceso a herramientas: en pipelines donde el LLM lee salidas de APIs o resultados de búsqueda, el modelo puede filtrar instrucciones inyectadas en esas salidas antes de ejecutar acciones como envío de correos o llamadas a sistemas internos.
- Atención al cliente automatizada: gestión de conversaciones multi-turno donde el usuario o contenido externo podría intentar manipular al bot para que revele información o realice acciones no autorizadas; la defensa CBC actúa como capa adicional.
- Procesamiento de correo y documentos no confiables: resumen o clasificación de correos entrantes que pueden contener instrucciones maliciosas dirigidas a un asistente LLM; el modelo verifica la consistencia antes de actuar sobre ellas.
- Evaluación de robustez en investigación: servir como checkpoint de referencia para estudiar defensas frente a prompt injection, comparando su tasa de cumplimiento de tareas legítimas frente a su tasa de bloqueo de inyecciones.
- Pipelines de CI/CD con agentes de código: revisión de issues, PRs o comentarios de usuarios que podrían incluir instrucciones inyectadas dirigidas a un agente que opera sobre el repositorio; el modelo puede filtrar antes de ejecutar comandos.
- Moderación de contenido generado por terceros: análisis de texto de usuarios donde se intenta redirigir el comportamiento del sistema, manteniendo la tarea original del flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo de EMNLP 2026 y al repositorio del proyecto para los resultados de evaluación, pero no incluye cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB de pesos, viable en GPUs de 8 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 3090, RTX 4080, RTX 4070 Ti para cuantización 8 bits; RTX 4060 Ti 16 GB o RTX 3060 12 GB para cuantización 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 8-16 GB con cuantización.
- Opciones de despliegue: transformers (nativo), text-generation-inference (TGI, etiqueta endpoints_compatible), vLLM, llama.cpp/Ollama tras conversión a GGUF, y otras herramientas compatibles con safetensors de Qwen2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XOTaiChi/grpo_qwen_0202 (CBC) | 7,6 B | no disponible | Defensa prompt injection (SFT + GRPO) | Apache 2.0 | HuggingFace, ModelScope |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (según modelo base) | Asistente generalista | Apache 2.0 | HuggingFace, ModelScope |
| Meta Llama 3.1 8B Instruct | 8 B | 128.000 tokens | Asistente generalista | Llama 3.1 Community License | HuggingFace, Meta |
| Mistral 7B Instruct | 7,2 B | 32.000 tokens | Asistente generalista | Apache 2.0 | HuggingFace |

La comparación directa en rendimiento frente a defensas específicas de prompt injection no está disponible en la información proporcionada; el artículo de EMNLP 2026 debería contener las comparativas pertinentes.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al heredar el comportamiento del modelo base, es probable que arrastre sesgos presentes en Qwen2.5-7B-Instruct, pero no hay confirmación explícita.
- Riesgo de alucinación: no cuantificado en la información disponible; el ajuste GRPO orientado a consistencia podría alterar la distribución de respuestas respecto al modelo base.
- El modelo está entrenado para una tarea específica (defensa frente a prompt injection) y podría degradar ligeramente la utilidad general en tareas ajenas a ese propósito; no se aportan métricas de utilidad general.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado para este checkpoint.
- Longitud de contexto efectiva no confirmada en la información proporcionada; aunque el modelo base soporta 32K tokens, el ajuste podría no preservar ese rendimiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base.
- El checkpoint no incluye datos de entrenamiento ni código de síntesis de datos en el momento de la publicación (anunciados como "próximamente"), lo que limita la reproducibilidad.
- La fecha de creación del repositorio (2026-10-31) y la referencia a EMNLP 2026 deben verificarse contra la fuente original antes de citar el modelo en producción o publicaciones.
- No se confirma soporte explícito de tool calling en este checkpoint concreto, aunque el modelo base lo soporte.

## Enlaces

- HuggingFace: https://huggingface.co/XOTaiChi/grpo_qwen_0202
- ModelScope mirror: https://modelscope.cn/models/augusttailong/grpo_qwen_0202
- Repositorio de código y evaluación: https://github.com/XOTaichi/CBC-PI
- Artículo EMNLP 2026: https://aclanthology.org/2026.emnlp-main.2303/
- DOI: 10.18653/2026.emnlp-main.2303
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
