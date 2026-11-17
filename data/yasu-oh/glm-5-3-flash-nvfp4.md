# yasu-oh/GLM-5.3-Flash-NVFP4

## Resumen

GLM-5.3-Flash-NVFP4 es una versión cuantizada a NVFP4 (W4A4) del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario independiente yasu-oh. No se trata de un modelo nuevo entrenado desde cero, sino de una compresión del modelo base original de Z.ai (Zhipu AI) orientada a reducir el coste de memoria y acelerar la inferencia en hardware Blackwell de NVIDIA, que es el que soporta nativamente el formato FP4.

El modelo conserva la arquitectura Glm5NextForConditionalGeneration (clase `Glm5NextForConditionalGeneration` en transformers), con 321.323.031.390 parámetros totales según los safetensors del repositorio, y pipeline image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto. El repositorio ocupa 205,1 GB, coherente con un modelo de ese tamaño serializado en formato comprimido de 4 bits más pesos no cuantizados (visión, lm_head y algunas capas exentas).

Su relevancia es práctica: permite desplegar un modelo de más de 300.000 millones de parámetros con pesos de 4 bits y activaciones de 4 bits, algo que con FP16 sería inviable en la mayoría de infraestructuras. La cuantización se realizó con LLM Compressor y se serializa en compressed-tensors, con calibración sobre 1.024 muestras (512 de Aya multilingüe y 512 de Hermes de razonamiento y tool use). La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (transformer multimodal, detalles internos no disponibles) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones de 4 bits en formato float, group_size 16, escalas en float8_e4m3fn); resto de capas sin cuantizar |
| Idiomas soportados | no disponible (la calibración incluye datos multilingües de Aya, pero no se declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors con serialización nvfp4-pack-quantized (compressed-tensors); 8-bit en los tags del repo |

## Arquitectura y entrenamiento

El modelo base es zai-org/GLM-5.3-Flash, un transformer multimodal de la familia GLM (clase Glm5NextForConditionalGeneration) con pipeline image-text-to-text. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si hubo RLHF o DPO en el modelo base; esos datos no están disponibles en la información proporcionada. Lo que sí se conoce es el proceso de cuantización posterior.

La cuantización se aplicó con LLM Compressor 0.15.1a20261106 y compressed-tensors 0.20.2a20261103, sobre transformers 5.22.2. Se usó un GPTQModifier con observador nvfp4_expanded_imatrix y strict activado, actorder estático y block_size 128. Los targets son las proyecciones gate, up y down de los expertos MLP (`re:.*mlp\.experts\..*(gate|up|down)_proj$`), lo que confirma que el modelo base es de tipo mixture-of-experts. Se excluyen de la cuantización las capas visuales, lm_head, la puerta del MLP (`re:.*mlp\.gate$`) y el indexer de self-attention (`re:.*self_attn\.indexer\..*`), lo que sugiere atención con indexado selectivo o disperso. La calibración usó 1.024 muestras con longitud máxima de 4.096 tokens: 512 de instrucciones multilingües de CohereLabs/aya_dataset y 512 de conversaciones de razonamiento y tool use de interstellarninja/hermes_reasoning_tool_use.

## Capacidades

- Generación de texto y conversación multi-turno (tag conversational).
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text), con capas visuales preservadas en precisión original.
- Razonamiento y tool calling, reforzados en la calibración mediante el dataset Hermes de reasoning y tool use.
- Capacidades multilingües, apoyadas por la calibración con Aya, aunque sin lista oficial de idiomas.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades específicas del modelo base (thinking mode, agentes, matemáticas, código) no están documentadas en esta ficha: no disponible.

## Casos de uso

- Asistente multimodal de atención al cliente: el modelo puede recibir capturas de pantalla, facturas o imágenes de producto junto al texto del usuario y responder en la misma conversación, gracias a su pipeline image-text-to-text y a la preservación de las capas visuales en precisión completa.
- Automatización de soporte técnico con tool calling: la calibración incluye 512 muestras de Hermes de razonamiento y uso de herramientas, por lo que es adecuado para flujos donde el modelo debe invocar APIs (consultar estado de pedido, abrir tickets) antes de responder.
- Procesamiento de documentos escaneados: extracción y razonamiento sobre formularios o imágenes de documentos en pipelines internos, combinando entrada visual y generación de texto estructurado.
- Despliegue en clústeres con GPU Blackwell: al estar en NVFP4 W4A4, es una opción para servir un modelo de 321.000 millones de parámetros en infraestructura con soporte nativo de FP4, reduciendo el coste de memoria frente a FP16/BF16.
- Investigación en cuantización: sirve como referencia reproducible (el autor publica el código en GitHub) para estudiar el impacto de NVFP4 W4A4 con GPTQ e imatrix en modelos MoE multimodales grandes.
- Evaluación comparativa de calidad tras cuantización: útil para medir la degradación de un modelo GLM grande al pasar a 4 bits en tareas de razonamiento y multilingües, usando los mismos datasets de calibración como referencia.
- Prototipado de asistentes conversacionales multilingües: la mezcla de calibración Aya (multilingüe) y Hermes (razonamiento) lo hace razonable para demos de chat con contexto largo, aunque la longitud de contexto real no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 205,1 GB, lo que da una idea del peso en disco; en memoria, el modelo cuantizado a 4 bits requiere del orden de 160-200 GB de VRAM solo para pesos, más KV cache y activaciones (estimación orientativa, no publicada por el autor).
- GPU recomendadas: hardware NVIDIA Blackwell con soporte nativo de FP4 (serie B200/GB200 y posteriores). Las GPU Hopper (H100/H200) y Ampere (A100) no ejecutan NVFP4 de forma nativa y requerirían emulación o de-cuantización, con pérdida de las ventajas del formato.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090, 24 GB; RTX 5090, 32 GB); el tamaño del modelo lo impide incluso con cuantización de 4 bits.
- Opciones de despliegue: transformers 5.22.2 con compressed-tensors; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia gestionados. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4 (este) | 321.323.031.390 | no disponible | NVFP4 W4A4 | MIT | Hugging Face, 59 descargas |
| zai-org/GLM-5.3-Flash (base) | no disponible en esta ficha | no disponible | BF16/FP16 (presumiblemente) | no disponible en esta ficha | Hugging Face |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 W4A4 puede degradar la calidad frente al modelo base, especialmente en tareas sensibles a precisión numérica (matemáticas, código, razonamiento largo); no se publican evaluaciones de la degradación.
- El formato NVFP4 requiere hardware Blackwell para aprovecharse; en otras GPU el rendimiento puede ser peor que una cuantización INT4/INT8 convencional.
- Las capas visuales, lm_head, la puerta del MLP y el indexer de atención quedan sin cuantizar, por lo que el ahorro de memoria no es uniforme y el modelo sigue necesitando más de 160 GB de VRAM.
- No se declara lista de idiomas soportados ni longitud de contexto; no se debe asumir un contexto largo sin verificarlo.
- Riesgo de alucinación inherente a los modelos generativos grandes; no hay evaluación publicada específica para esta versión cuantizada.
- Sesgos conocidos: no documentados en la información disponible; los datasets de calibración (Aya, Hermes) pueden introducir sesgos propios.
- Licencia MIT: permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el comportamiento del modelo; conviene revisar también las condiciones del modelo base zai-org/GLM-5.3-Flash.
- Repositorio con 59 descargas y 0 likes: poca validación comunitaria; tratar como artefacto experimental.
- El autor no documenta requisitos de software más allá de las versiones de transformers, llmcompressor y compressed-tensors usadas en la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasu-oh/GLM-5.3-Flash-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Código de cuantización: https://github.com/yasu-oh/glm-5.3-flash-nvfp4-quantization
- Dataset de calibración multilingüe: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset de calibración de razonamiento y tool use: https://huggingface.co/datasets/interstellarninja/hermes_reasoning_tool_use
