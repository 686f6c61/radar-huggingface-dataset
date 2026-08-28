# trohrbaugh/Qwen3.8-Flash-Next-heretic-2

## Resumen

Qwen3.8-Flash-Next-heretic-2 es una versión modificada del modelo Qwen3.8-Flash-Next de Alibaba, creada por trohrbaugh mediante la técnica de abliteration (desensurado) aplicada con la herramienta Heretic. El modelo original es un modelo de lenguaje multimodal de tipo MoE (Mixture of Experts) que sirve como preview de la arquitectura de Qwen4, con 125 mil millones de parámetros totales (6 mil millones activos por token), más 51 mil millones de parámetros de n-gram embedding y 4 mil millones de MTP (Multi-Token Prediction). El modelo resultante mantiene una divergencia KL de 0.0818 respecto al original y reduce los rechazos de 99/100 a 0/100, lo que lo hace adecuado para casos de uso donde se requiere generación sin restricciones de contenido.

La arquitectura combina Gated DeltaNet, Qwen Sparse Attention (QSA), Gated Residual y N-gram Embedding, con una ventana de contexto nativa de 262,144 tokens extensible hasta 1,000,000. El modelo es multimodal (image-text-to-text) y está disponible en formato safetensors para transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet + Qwen Sparse Attention + Gated Residual + N-gram Embedding + Vision Encoder |
| Parametros totales | 177.392.830.576 (según safetensors; el modelo original declara 125B + 51B n-gram + 4B MTP) |
| Parametros activos | 6B (10 expertos activados + 1 compartido de 512) |
| Longitud de contexto | 262,144 tokens nativo, extensible a 1,000,000 via YaRN |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next presenta una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención sparse (Qwen Sparse Attention) en un layout de 12 bloques, cada uno con 3 sub-bloques de Gated DeltaNet seguidos de MoE y 1 sub-bloque de QSA seguido de MoE. El MoE tiene 512 expertos con 10 activados más 1 compartido, y el Gated Residual modula el flujo de información con 4 ramas y bottleneck rank 320. El N-gram Embedding indexa bigramas y trigramas en la capa 2 con 20 millones de entradas, lo que permite escalar parámetros sin aumentar el coste computacional.

El entrenamiento del modelo original utilizó una receta con optimizadores Muon y AdamW aplicados a categorías específicas de pesos, sin warmup de batch size y con learning rates mayores. La versión heretic se obtuvo mediante abliteration con Heretic v1.3.0+custom, que modifica los pesos de las proyecciones de atención y MLP para eliminar los rechazos del modelo. Los parámetros de abliteration se aplican por capa, con valores de max_weight y min_weight específicos para attn.o_proj y mlp.down_proj.

## Capacidades

- Generación de texto sin restricciones de contenido (desensurado): el modelo no rechaza peticiones, como demuestra la métrica de refusals 0/100 frente a 99/100 del original.
- Razonamiento y resolución de problemas: el modelo base alcanza GPQA 91.7 según HokAI.
- Generación de código y matemáticas: capacidades propias de la familia Qwen3.8.
- Comprensión de imágenes: pipeline image-text-to-text, con vision encoder integrado.
- Contexto largo: 262K tokens nativos, extensible a 1M, adecuado para agentes y análisis de documentos extensos.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información, pero el modelo base de Qwen3.8-Flash-Next está diseñado para cargas de trabajo agénticas.
- Multilingüe: no se especifican idiomas, pero la familia Qwen suele soportar múltiples idiomas.

## Casos de uso

- Generación creativa sin filtros: escritores y creadores de contenido pueden usar el modelo para producir narrativas, diálogos o guiones sin las restricciones típicas de los modelos alineados, gracias a la abliteration que elimina los rechazos.
- Investigación en seguridad de IA: los investigadores pueden estudiar el comportamiento de un modelo sin mecanismos de rechazo para analizar sesgos, riesgos de contenido dañino y técnicas de mitigación.
- Agentes autónomos con contexto largo: con 262K tokens de contexto, el modelo puede gestionar conversaciones multi-turno extensas, mantener estado de tareas complejas y procesar documentos largos en pipelines agénticos.
- Análisis de documentos multimodales: al combinar visión y texto, puede extraer información de imágenes, diagramas y capturas de pantalla junto con texto, útil para automatización de procesos empresariales.
- Generación de código en entornos de desarrollo: el modelo puede asistir en programación, generando y depurando código, aunque la versión heretic no añade mejoras específicas de código frente al original.
- Chat conversacional sin censura: para aplicaciones de chatbot donde se requiere libertad total de expresión, como en entornos de rol o simulación, el modelo responde sin rechazar peticiones.

## Benchmarks y rendimiento

La model card original de Qwen3.8-Flash-Next incluye una tabla de benchmarks que no se ha podido extraer completa de la información proporcionada. Según la búsqueda web, el modelo alcanza GPQA 91.7. La versión heretic reporta una divergencia KL de 0.0818 respecto al original y 0 rechazos en 100 peticiones, frente a 99 rechazos del original. No se dispone de más datos de rendimiento específicos de esta versión.

| Metrica | Este modelo | Original |
|---|---|---|
| Divergencia KL | 0.0818 | 0 |
| Rechazos (refusals) | 0/100 | 99/100 |
| GPQA | no disponible | 91.7 (según HokAI) |

## Requisitos de hardware

- El modelo tiene 177.392.830.576 parámetros en total, lo que requiere aproximadamente 177 GB en FP16 o BF16 para cargar los pesos completos.
- Con cuantización de 4 bits, se estima un uso de VRAM de unos 90-100 GB, lo que excede las GPUs de consumo (RTX 4090 con 24 GB no es suficiente).
- GPUs recomendadas: NVIDIA A100 80GB (mínimo 2-3 unidades), H100 80GB, o GPUs de datacenter con memoria agregada.
- Para inferencia con contexto largo, se recomienda usar vLLM, SGLang o TokenSpeed, que son compatibles según la model card original.
- La versión heretic no modifica los requisitos de hardware respecto al original.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B + 51B + 4B | 262K (1M extensible) | qwen-community-1.0 | Modelo base con rechazos |
| Qwen3.8-Flash-Next-heretic-2 | 177B (safetensors) | 262K (1M extensible) | qwen-community-1.0 | Versión desensurada, sin rechazos |
| Qwen3.8-27B | 27B | 256K | no disponible | Modelo más pequeño de la familia, con visión y razonamiento |

No se dispone de información sobre otros modelos desensurados comparables en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido dañino, ilegal, violento o sexualmente explícito sin filtros. Su uso debe restringirse a entornos controlados y legales.
- El modelo puede presentar alucinaciones, especialmente en tareas de razonamiento complejo o con información factual, como cualquier LLM de gran tamaño.
- No se especifican los idiomas soportados; la información disponible no detalla la cobertura multilingüe.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; se recomienda revisar los términos completos.
- El modelo tiene un tamaño de 360 GB en el repositorio, lo que dificulta su despliegue en infraestructuras modestas.
- La divergencia KL de 0.0818 indica que el comportamiento del modelo difiere ligeramente del original, lo que puede afectar a la calidad en tareas específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Fork custom de Heretic: https://github.com/timrohrbaugh/heretic
- Blog de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Documentación de Unsloth para ejecución local: https://unsloth.ai/docs/models/qwen3.8-next
