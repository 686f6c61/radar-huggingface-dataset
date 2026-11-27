# studio-rizi/Inkling-2-Mini-Unlock-MLX-oQ4e

## Resumen

Inkling-2-Mini-Unlock-MLX-oQ4e es una conversión a formato MLX del modelo comunitario Inkling-2-Mini-Unlock, un finetune "abliterated" (sin censura) del Inkling-2-Mini original desarrollado por Thinking Machines Lab. El modelo base es un transformer multimodal de tipo Mixture-of-Experts con 26.400 millones de parámetros totales y 3.400 millones activos por token, con una ventana de contexto de 1 millón de tokens y capacidad de procesamiento de imagen y texto. Esta versión concreta la publica el usuario studio-rizi y está pensada para ejecutarse en Apple Silicon mediante el runtime oMLX.

La relevancia de esta ficha radica en dos factores. Primero, es una cuantización mixta de 4 bits (oQ4e) que reduce el peso en disco a 16,2 GB en cuatro shards, más 0,64 GB de un borrador DSpark MTP para decodificación especulativa, lo que permite desplegar un modelo de 26B en hardware de consumo de Apple. Segundo, hereda la naturaleza "abliterated" del modelo intermedio, que elimina parte de los rechazos del modelo original, lo que tiene implicaciones directas de seguridad y de cumplimiento normativo.

Conviene subrayar que no es un checkpoint estándar de `mlx-lm`: usa un layout propietario de oMLX (oQ) y requiere oMLX 0.8.4 o superior. El repositorio no registra descargas ni interacciones en el momento de la consulta, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer MoE multimodal con bucle, según model card) |
| Parametros totales | 26.388.646.400 (26,4B) |
| Parametros activos | 3,4B (dato de model card) |
| Longitud de contexto | 1.000.000 tokens (dato de model card) |
| Tipos de cuantizacion | oQ4e (4 bits afín, grupo 64, mixta con protección de tensores sensibles); expertos enrutados de capas 0-19 en NVFP4 de origen, capas 20-23 en afín 4 bits |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | Apache 2.0 (sujeta a la Acceptable Use Policy del modelo original) |
| Formato de pesos | safetensors (MLX), 4 shards + `mtp.safetensors` |

## Arquitectura y entrenamiento

La arquitectura declarada es `inkling2_loop`, descrita como un MoE multimodal con bucle ("looped multimodal MoE"). El modelo incorpora 422 tensores de visión y se expone como pipeline `image-text-to-text`. La naturaleza "looped" sugiere reutilización iterativa de bloques, aunque la información disponible no detalla el número de iteraciones ni la configuración interna de expertos; no disponible el número de expertos, el ratio de activación ni la dimensión oculta.

El linaje de entrenamiento es el siguiente: el modelo original `thinkingmachines/Inkling-2-Mini` (Apache 2.0) fue sometido a una abliteración parcial sobre parte de los pesos de salida de atención por isichan-ai, dando lugar a `isichan-ai/Inkling-2-Mini-Unlock-GGUF`. Sobre ese GGUF, studio-rizi aplicó una recuantización mixta oQ4e con oMLX 0.8.4, calibrada con el dataset `oqe_code_multilingual` (577 muestras de 512 tokens en modo adaptativo). La reconstrucción de referencia en 16 bits se verificó tensor a tensor contra el GGUF de origen: los tensores no-expertos son idénticos bit a bit y los expertos enrutados conservan el almacenamiento NVFP4/MXFP8 original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y japonés.
- Comprensión de imagen y texto (VLM) mediante oMLX o mlx-vlm.
- Razonamiento con plantilla de chat "thinking-effort aware" (el template permite ajustar el esfuerzo de razonamiento).
- Decodificación especulativa mediante el borrador DSpark MTP incluido (`mtp.safetensors`), orientada al modo Lightning MTP de oMLX.
- Comportamiento sin censura ("uncensored/abliterated"): sigue instrucciones que el modelo original rechaza.
- Servido con API compatible con OpenAI a través de `omlx serve`.
- No se documenta soporte explícito de tool calling, function calling ni de flujos agénticos multi-paso en la información disponible.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar cómo un finetune abliterated modifica las respuestas ante prompts sensibles, comparándolo con el Inkling-2-Mini original en el mismo hardware.
- Red-teaming controlado: útil para generar ataques y sondear defensas en sistemas propios, siempre con las salvaguardas adicionales que exige la model card.
- Procesamiento de documentos largos en local: la ventana de 1M tokens permite analizar contratos, manuales o expedientes completos en un Mac sin enviar datos a la nube.
- Análisis de imágenes con texto asociado: descripción de capturas, extracción de información de diagramas o clasificación de material visual combinada con consultas en lenguaje natural.
- Asistencia de escritura y resumen en inglés y japonés: generación de borradores y condensación de textos, teniendo en cuenta la limitación documentada de cierre en torno a 1.000-1.500 caracteres en escritura larga.
- Desarrollo y pruebas de aplicaciones con API compatible con OpenAI: `omlx serve` permite levantar un endpoint local para prototipar clientes sin depender de servicios externos.
- Evaluación de cuantizaciones en Apple Silicon: comparar la calidad de oQ4e frente al GGUF de origen o al modelo sin cuantizar en tareas de visión y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 16,9 GB; los pesos suman 16,2 GB en 4 shards más 0,64 GB del borrador DSpark. Se recomienda al menos 24 GB de memoria unificada para dejar margen al contexto y al runtime, y 32 GB o más si se usan contextos largos.
- Hardware objetivo: Apple Silicon (MLX). No es ejecutable en GPU NVIDIA ni en CPU genérica mediante este checkpoint.
- GPU recomendadas: chips Apple M-series con memoria unificada amplia (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). No aplica a A100, H100 ni RTX 4090 porque el formato es MLX.
- Despliegue: exclusivamente con oMLX 0.8.4 o superior (`omlx serve`). No es cargable por `mlx-lm` estándar. Para visión, oMLX o mlx-vlm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unlock-MLX-oQ4e (este) | 26,4B totales / 3,4B activos | 1M | MLX oQ4e | Apache 2.0 | Sin censura, visión, requiere oMLX |
| isichan-ai/Inkling-2-Mini-Unlock-GGUF | 26,4B totales / 3,4B activos | 1M (según model card) | GGUF | Apache 2.0 | Sin censura, base de esta conversión |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / 3,4B activos | 1M (según model card) | no disponible | Apache 2.0 | Modelo original con salvaguardas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: sigue instrucciones que el original rechaza. No debe desplegarse en servicios públicos sin mecanismos de seguridad propios.
- Aplica la Acceptable Use Policy del modelo base; se prohíbe el uso para contenido violento, armas, ataques a sistemas, abuso infantil o actividades ilegales.
- Ligera degradación documentada en comprensión de imagen respecto al modelo oficial.
- La escritura de formato largo tiende a cerrarse en torno a 1.000-1.500 caracteres en lugar de continuar.
- Solo inglés y japonés; no se garantiza calidad en castellano.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados.
- Dependencia de runtime propietario (oMLX 0.8.4+); no funciona con `mlx-lm` estándar.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta; conversión no oficial y no afiliada a Thinking Machines Lab, isichan-ai ni Unsloth.
- La licencia Apache 2.0 no exime del cumplimiento de la política de uso aceptable del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/studio-rizi/Inkling-2-Mini-Unlock-MLX-oQ4e
- Modelo base intermedio (GGUF): https://huggingface.co/isichan-ai/Inkling-2-Mini-Unlock-GGUF
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime oMLX: https://github.com/jundot/omlx
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Perfil del autor de la abliteración: https://huggingface.co/isichan-ai
- Perfil de Thinking Machines Lab: https://huggingface.co/thinkingmachines
- Perfil de Unsloth: https://huggingface.co/unsloth
