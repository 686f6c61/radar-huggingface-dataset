# thebriangao/GLM-5.3-Flash-Uncensored-NVFP4

## Resumen

GLM-5.3-Flash-Uncensored-NVFP4 es una conversión de cuantización NVFP4 del checkpoint `orcarouter/GLM-5.3-Flash-Uncensored-FP8`, un fine-tune sin censura (abliterated) del modelo base GLM-5.3-Flash desarrollado por Z.ai (ZhipuAI). El modelo original es un mixture-of-experts (MoE) de 320 mil millones de parámetros totales y 18 mil millones activos, con capacidades multimodales (imagen-texto) y licencia MIT. Este checkpoint concreto, publicado por el usuario thebriangao en HuggingFace, aplica una cuantización NVFP4 W4A16 a las proyecciones de los expertos enrutados, manteniendo el resto de capas en BF16, lo que reduce el uso de memoria manteniendo la mayor parte de la calidad.

La relevancia de este modelo radica en que combina tres características poco habituales: un tamaño de 321B parámetros con solo 18B activos (eficiente en inferencia), la eliminación de los rechazos de seguridad mediante abliteración (lo que lo hace adecuado para investigación sobre alineación y comportamientos no censurados), y una cuantización optimizada para GPUs Blackwell (NVFP4) que permite desplegarlo en hardware de centro de datos con menor huella de memoria. Al estar publicado bajo licencia MIT, puede usarse comercialmente sin restricciones de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, basada en GLM-5.3-Flash |
| Parametros totales | 321.323.031.390 (321B) |
| Parametros activos | 18B (segun datos publicados del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A16) en expertos enrutados; BF16 en el resto; KV cache sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (compressed-tensors, formato `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5. Su arquitectura es un transformer MoE con 321B parámetros totales y 18B activos por token, lo que permite un razonamiento eficiente con un coste computacional mucho menor que un modelo denso de tamaño equivalente. Incluye módulos de visión para entrada de imágenes y un bloque MTP (multi-token prediction) en la capa 45, que se mantiene en BF16 en este checkpoint.

El fine-tune de OrcaRouter, que sirve como punto de partida, aplica una técnica de abliteración (eliminación de rechazos) directamente sobre los pesos, sin usar LoRA ni jailbreaks. Según la documentación del autor, esta modificación "elimina los rechazos horneándolos en los pesos". Posteriormente, el modelo se cuantizó a NVFP4: los expertos enrutados (gate/up/down projections) de las capas 3 a 44 (36.288 tensores) usan pesos E2M1 de 4 bits con escalas de bloque E4M3 y una escala por tensor FP32. El resto (atención, visión, MLPs densos, expertos compartidos, routers, embeddings, normas y el bloque MTP) se mantiene en BF16. La conversión compara dos esquemas de escalado NVFP4 (clásico y Four-Over-Six) y selecciona el de menor error para cada tensor.

Es importante señalar que el fine-tune de OrcaRouter solo se publicó en FP8; por tanto, los pesos se dequantizaron desde FP8 a BF16 antes de la cuantización NVFP4, lo que introduce una segunda pérdida de precisión con respecto a un hipotético modelo BF16 original. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning más allá de la técnica de abliteración.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen y texto, y produce texto (pipeline `image-text-to-text`).
- Chat conversacional sin restricciones de contenido: la abliteración elimina los rechazos de seguridad del modelo base, permitiendo respuestas sobre temas que el modelo original bloquearía.
- Razonamiento y resolución de problemas: al ser un MoE de 18B activos, mantiene capacidades de razonamiento de nivel alto para tareas complejas.
- Generación de código: el modelo base está entrenado para programación, y este checkpoint conserva esa capacidad.
- Escritura creativa: adecuado para redacción de ficción, diálogos y contenido narrativo sin filtros temáticos.
- Tool use / function calling: la documentación del modelo base menciona soporte para uso de herramientas y trabajo agéntico.
- Trabajo agéntico y tareas de contexto largo: el modelo base está diseñado para tareas de agente y manejo de contextos extensos (aunque la longitud exacta no se especifica en la información disponible).
- Modo "uncensored": al haber eliminado los rechazos, puede generar contenido que el modelo base rechazaría, incluyendo temas controvertidos o sensibles.

## Casos de uso

- Investigación sobre alineación y seguridad de modelos: permite estudiar el comportamiento de un modelo sin filtros de seguridad, comparando respuestas con el modelo base para analizar el impacto de la abliteración.
- Generación de código en entornos de desarrollo: con soporte para tool calling y razonamiento, puede integrarse en pipelines de CI/CD para generar, revisar o completar código, aunque requiere supervisión humana por su naturaleza sin censura.
- Asistentes de documentación técnica: puede resumir y redactar documentación extensa a partir de especificaciones o conversaciones largas, aprovechando su ventana de contexto amplia (no especificada).
- Creación de contenido creativo sin restricciones: escritura de guiones, novelas, diálogos de juegos de rol o material literario que requiera explorar temas tabú o controvertidos sin limitaciones impuestas por el modelo.
- Análisis de imágenes con texto: al ser multimodal, puede describir imágenes, extraer información visual y combinarla con instrucciones de texto para tareas como anotación de datos o accesibilidad.
- Prototipado de agentes conversacionales: su capacidad para mantener conversaciones multi-turno y usar herramientas lo hace útil para construir chatbots agénticos de prueba, siempre que se implementen salvaguardas externas si se despliega en producción.
- Despliegue en entornos con restricciones de memoria: gracias a la cuantización NVFP4, es viable en servidores con GPUs Blackwell donde un modelo FP8 o BF16 completo no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para este checkpoint específico. Tampoco se dispone de comparaciones cuantitativas con el modelo base o con otros modelos similares.

## Requisitos de hardware

- El checkpoint ocupa 205,1 GB en disco en formato safetensors. Con la cuantización NVFP4, los expertos (la mayoría de los parámetros) están en 4 bits, pero el resto (atención, vision, embeddings, etc.) está en BF16.
- VRAM estimada para inferencia: no se especifica oficialmente. Dado que el modelo tiene 321B parámetros totales y solo 18B activos, la memoria necesaria para cargar todos los pesos en NVFP4/BF16 ronda entre 180 y 220 GB, por lo que se requieren múltiples GPUs de alta gama. Una configuración típica sería 8x H100 (80 GB) o 8x A100 (80 GB), o GPUs Blackwell como B200 o RTX PRO 6000 Blackwell en configuraciones multi-GPU.
- No cabe en una GPU de consumo (RTX 4090, 24 GB) ni en una sola GPU profesional de 48 GB. Se necesita hardware de centro de datos.
- Opciones de despliegue: al usar el formato `compressed-tensors` de NVIDIA, es compatible con motores de inferencia como vLLM y TensorRT-LLM, que soportan NVFP4 en GPUs Blackwell. También podría usarse con llama.cpp si se convierte a GGUF, aunque no se proporciona dicha conversión.
- Latencia y throughput: no disponibles. Al ser un MoE con 18B activos, el throughput por token es comparable al de un modelo denso de 18B, pero la memoria y el ancho de banda requeridos son mayores por la carga de todos los expertos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 321B | 18B | no disponible | FP8 / BF16 | MIT | Modelo original de Z.ai, con filtros de seguridad |
| GLM-5.3-Flash-Uncensored-FP8 (OrcaRouter) | 321B | 18B | no disponible | FP8 | MIT | Fine-tune abliterado, base de este checkpoint |
| GLM-5.3-Flash-Uncensored-NVFP4 (thebriangao) | 321B | 18B | no disponible | NVFP4 + BF16 | MIT | Cuantizacion del checkpoint FP8, segunda perdida |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | FP8 | MIT | Otro MoE popular, pero con mas parametros |
| Llama 3.1 405B (referencia) | 405B | 405B (denso) | 128K | FP8 | Llama 3.1 | Denso, mucho mayor coste de inferencia |

La comparativa se basa en datos publicos de los modelos de referencia; no se dispone de benchmarks comparativos para este checkpoint.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No debe desplegarse en producción orientada al publico sin capas de moderacion externas.
- La abliteracion elimina los rechazos, pero no garantiza que las respuestas sean factualmente correctas; el riesgo de alucinacion es similar o mayor que en el modelo base.
- La cuantizacion NVFP4 es una segunda perdida con respecto al fine-tune FP8, que a su vez deriva de un BF16 no publicado. Esto puede degradar ligeramente la calidad en tareas sensibles a la precision numerica.
- No se proporciona informacion sobre la longitud de contexto soportada, idiomas ni rendimiento en benchmarks, lo que dificulta evaluar su idoneidad para casos concretos.
- El checkpoint requiere GPUs Blackwell para aprovechar la aceleracion NVFP4 nativa; en GPUs anteriores (Ampere, Hopper) el rendimiento puede ser suboptimo o requerir dequantizacion.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias ni soporte. El modelo se publica "tal cual".
- No hay informacion sobre sesgos especificos, pero al ser un fine-tune de un modelo base entrenado con datos web, es probable que herede sesgos sociales, culturales y de genero.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/thebriangao/GLM-5.3-Flash-Uncensored-NVFP4
- Modelo base FP8 (OrcaRouter): https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Ficha de GLM-5.3-Flash en ModelScope: https://www.modelscope.cn/models/ZhipuAI/GLM-5.3-Flash
- Articulo de ExplainX sobre el fine-tune de OrcaRouter: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Referencia en NanoGPT: https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-uncensored
- Checkpoint similar de otro autor (dealignai): https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
