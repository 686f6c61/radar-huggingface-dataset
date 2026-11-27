# studio-rizi/Inkling-2-Mini-Derisked-MLX-oQ8e

## Resumen

Inkling-2-Mini-Derisked-MLX-oQ8e es una conversión a formato MLX del modelo Blackfrost-AI/Inkling-2-Mini-Derisked, que a su vez es una modificación conductual del modelo original Thinking Machines Lab/Inkling-2-Mini. La conversión la firma el usuario studio-rizi y emplea la cuantización mixta propietaria oQ8e del runtime oMLX, pensada específicamente para Apple Silicon. El resultado es un checkpoint multimodal de 26.388 millones de parámetros en formato de 8 bits que ocupa 18,8 GB en el repositorio.

El modelo original emplea una arquitectura denominada `inkling2_loop`, un transformer con bucles (looped) de tipo mezcla de expertos (MoE) y capacidad multimodal, con una ventana de contexto declarada de 1 millón de tokens. La variante "Derisked" de Blackfrost-AI aplica una modificación a nivel de pesos —ortogonalización por consenso de columnas sobre la proyección de salida de atención (`attn.wo_ud.weight`) en las capas físicas 9 a 18— con el objetivo de reducir rechazos falsos en peticiones seguras sin eliminar el suelo de rechazo ante peticiones claramente dañinas. La verificación incluida en la model card confirma que 1234 de 1244 tensores son idénticos byte a byte al checkpoint original, y solo difieren los 10 tensores documentados.

Su relevancia es doble: por un lado, permite ejecutar un modelo multimodal MoE de gran contexto en hardware Apple Silicon mediante MLX; por otro, documenta de forma transparente la cadena de procedencia y el proceso de cuantización mixta, lo que facilita la auditoría. No es un checkpoint cargable por `mlx-lm` estándar: requiere oMLX 0.8.4 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con bucles, MoE multimodal) |
| Parametros totales | 26.388.646.400 (26,39 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (según model card) |
| Tipos de cuantizacion | oQ8e mixta: base 8-bit affine (grupo 64), expertos en NVFP4/MXFP8, draft DSpark MTP preservado |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, layout oQ), 4 shards + `mtp.safetensors` |

## Arquitectura y entrenamiento

La arquitectura `inkling2_loop` es un transformer con estructura de bucles (loop pass) que reutiliza bloques de forma iterativa, combinado con mezcla de expertos (MoE) y capacidades de visión (422 tensores de visión incluidos). El modelo incorpora además un módulo MTP (Multi-Token Prediction) denominado DSpark, que actúa como draft para decodificación especulativa ("Lightning MTP") en el runtime oMLX. La ventana de contexto declarada es de 1 millón de tokens.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original. La modificación "Derisked" de Blackfrost-AI no reentrena el modelo: aplica una ortogonalización por consenso de columnas sobre la proyección de salida de atención en las capas 9 a 18 (alpha 2,5), manteniendo intacta la estructura de bucles. La conversión a MLX aplica cuantización mixta con calibración imatrix sobre el dataset `oqe_code_multilingual` (128 muestras de 512 tokens, adaptativo).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con 422 tensores de visión operativos vía oMLX o mlx-vlm.
- Razonamiento y generación de código, inferidos del dataset de calibración multilingüe de código empleado.
- Decodificación especulativa mediante el draft DSpark MTP preservado, que acelera la generación en oMLX.
- Contexto largo de hasta 1 millón de tokens (según especificación del modelo base).
- Modo "derisked": menor tasa de rechazos falsos en peticiones seguras manteniendo rechazo ante peticiones dañinas.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre comportamiento de rechazo: el checkpoint permite estudiar empíricamente cómo una modificación a nivel de pesos (ortogonalización en capas 9-18) altera la tasa de rechazos falsos frente al modelo original, comparando ambos checkpoints con el mismo prompt set.
- Inferencia local en Apple Silicon: desarrolladores con Mac equipados con chip M-series pueden servir el modelo vía `omlx serve` y consumirlo con una API compatible con OpenAI (`/v1/chat/completions`), sin depender de GPU NVIDIA.
- Análisis de documentos extensos: la ventana de 1 millón de tokens permite procesar contratos, informes o bases de código completas en una sola pasada, útil para resumen y extracción de entidades.
- Asistencia multimodal en flujos internos: al aceptar imagen y texto, puede emplearse para describir capturas, diagramas o interfaces en herramientas internas de evaluación.
- Evaluación de cuantización mixta: sirve como caso de estudio para medir la pérdida de calidad de oQ8e (base 8-bit con expertos en NVFP4/MXFP8) frente al checkpoint BF16 de referencia.
- Prototipado de asistentes en inglés y japonés: adecuado para demos bilingües en entornos controlados, con la salvedad de validar el comportamiento de bucles tras la modificación.
- Auditoría de cadena de suministro de modelos: el repositorio documenta la verificación SHA-256 y el diff tensor a tensor, lo que lo convierte en un ejemplo práctico de trazabilidad para equipos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: 18,8 GB en repositorio (18,1 GB en 4 shards + 0,64 GB de draft DSpark).
- VRAM/unified memory estimada: al menos 20-24 GB de memoria unificada para cargar el checkpoint completo en 8 bits con margen para el contexto; contextos muy largos (cientos de miles de tokens) incrementan sustancialmente el consumo por la caché KV.
- Hardware objetivo: Apple Silicon (MLX). No se especifican GPUs NVIDIA compatibles; el layout oQ es nativo de oMLX.
- Cabe en equipos Apple con 32 GB o más de memoria unificada; en configuraciones de 24 GB puede requerir contextos reducidos.
- Despliegue: exclusivamente mediante oMLX 0.8.4 o superior (`omlx serve --model-dir ...`). No es cargable por `mlx-lm` estándar. No se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se espera mejora por la decodificación especulativa MTP, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked-MLX-oQ8e (este) | 26,39 mil M | 1 M | imagen-texto | Apache 2.0 | oMLX (MLX) |
| Blackfrost-AI/Inkling-2-Mini-Derisked | no disponible | 1 M (heredado) | imagen-texto | Apache 2.0 | MLX/PyTorch según checkpoint |
| thinkingmachines/Inkling-2-Mini | no disponible | 1 M | imagen-texto | Apache 2.0 | no disponible |

La comparativa con modelos de otras familias (por tamaño o tarea) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: la model card lo describe como material para investigación controlada y evaluación interna; la salida debe tratarse como dato no confiable.
- No constituye una frontera de seguridad ni de cumplimiento: los operadores son responsables del control de acceso y de los mecanismos de seguridad del despliegue.
- La modificación conductual se aplicó sobre un transformer con bucles; deben revalidarse los comportamientos dependientes de bucles en cada despliegue.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas limitados a inglés y japonés; el rendimiento en castellano no está documentado y probablemente sea degradado.
- Compatibilidad restringida: no carga en `mlx-lm` estándar; requiere oMLX 0.8.4 o superior y layout oQ.
- La cuantización mixta (expertos en NVFP4/MXFP8) puede introducir degradación frente al checkpoint BF16, no medida en la información disponible.
- Licencia Apache 2.0 heredada del modelo original; conviene revisar los términos upstream antes de redistribuir o desplegar comercialmente.
- Conversión no oficial: no está afiliada a Thinking Machines Lab ni a Blackfrost-AI.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/studio-rizi/Inkling-2-Mini-Derisked-MLX-oQ8e
- Modelo base (Derisked): https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime oMLX: https://github.com/jundot/omlx
- Perfil del autor de la modificación: https://huggingface.co/Blackfrost-AI
- Perfil de Thinking Machines Lab: https://huggingface.co/thinkingmachines
