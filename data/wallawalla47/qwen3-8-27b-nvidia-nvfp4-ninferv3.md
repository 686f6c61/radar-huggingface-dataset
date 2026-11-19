# wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3

## Resumen

Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 es un artefacto de inferencia en formato propietario `.ninfer` (NInfer V3) construido por el usuario wallawalla47 a partir del checkpoint `nvidia/Qwen3.8-27B-NVFP4`. No es un modelo entrenado desde cero ni un fine-tune: es una reempaquetado de cuantización orientado a ejecución de bajísima latencia sobre GPUs Blackwell (sm_120a), específicamente una RTX 5090. El checkpoint base emplea cuantización mixta NVFP4/FP8 generada con NVIDIA Model Optimizer en formato `compressed-tensors`.

El modelo subyacente pertenece a la familia Qwen3.5/Qwen3.8 con backbone híbrido de 64 capas que combina atención lineal Gated Delta-Net con atención completa cada cuarta capa, dimensión oculta 5120 y vocabulario de 248.320 tokens. Incorpora torre de visión (profundidad 27) para entrada image-text-to-text, un compañero MTP para decodificación especulativa y contexto nativo de 262.144 tokens.

La relevancia de este artefacto es operativa: elimina el paso de conversión en tiempo de carga y añade dos componentes de decodificación especulativa (un draft model DFlash2 de 5 capas con atención deslizante y una cabeza de propuesta indexada de 131.072 filas) que habilitan rutas de decodificación rápida en los motores Infernix y NInfer. El repo ocupa 22,8 GB y acumula 8.917 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas (Gated Delta-Net linear attention + full attention cada 4 capas), hidden 5120 |
| Parametros totales | 27B (según denominación del checkpoint base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (W4A4), FP8 e4m3fn row-scale, BF16, FP32, Q4, Q5, Q6, Q8 agrupados, INT32 (tabla de índices) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (NInfer V3, single-file); origen `compressed-tensors` (NVFP4/FP8) |
| Vocabulario | 248.320 tokens |
| Torre de vision | qwen3_5_vision, profundidad 27 |
| Draft especulativo | DFlash2, 5 capas, ventana deslizante 2048, selector rank 256 / top-16 |
| Cabeza de propuesta | 131.072 filas, Q4 agrupado + tabla INT32 |
| Tamano del repo | 22,8 GB |
| Libreria | ninfer |
| Hardware objetivo | NVIDIA Blackwell sm_120a (RTX 5090) |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de 64 capas que intercala atención lineal Gated Delta-Net (GDN) con atención completa cada cuatro capas, con dimensión oculta de 5120 y vocabulario de 248.320 tokens. Esta combinación busca reducir el coste computacional y de memoria de la atención en contextos largos manteniendo capacidad de recuperación exacta en las capas de atención completa. La torre de visión tiene 27 capas y procesa imagen y vídeo para la tarea image-text-to-text.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO: la model card del artefacto no documenta el entrenamiento del modelo base, solo el proceso de conversión. Lo que sí se documenta con precisión es el proceso de cuantización y empaquetado. Las 128 proyecciones MLP en NVFP4 se importan de forma bit-exacta desde el checkpoint de NVIDIA, conservando pesos FP4 empaquetados y escalas de bloque calibradas con Hessian local; las 128 proyecciones de atención y GDN en FP8 e4m3fn con escala por fila también se importan bit-exactas. La cabeza de salida se desconvierte de NVFP4 y se recuantiza a FP8 row-scale (elegido sobre Q8 tras medir que es más rápido en el rango T=1..33 de decodificación/verificación). El embedding se cuantiza de BF16 a FP8. Las proyecciones a/b de GDN permanecen en BF16 porque el layout NVFP4 V3 exige tiles de 128 filas y estos tensores tienen 96. La innovación principal del artefacto es la integración de decodificación especulativa: un draft model DFlash2 de 5 capas con atención deslizante (ventana 2048) y una cabeza de propuesta indexada que permite drafting barato por copia mediante `--lm-head-draft`, además del compañero MTP para decodificación especulativa MTP.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text) con torre de visión de 27 capas para imagen y vídeo.
- Modo thinking / razonamiento explícito, según los tags del modelo (`reasoning`, `thinking`).
- Capacidades agénticas y de razonamiento multi-paso (`agentic`).
- Procesamiento de contexto largo: hasta 262.144 tokens nativos.
- Decodificación especulativa mediante dos rutas: MTP (compañero Qwen3.5 MTP) y DFlash2 (`--spec dflash2`), más drafting por copia con `--lm-head-draft`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se documentan los idiomas cubiertos.

## Casos de uso

- Replay de sesiones de programación agéntica: el motor Infernix reporta servir el 90 % de los tokens de prompt desde su caché de prefijo en el modelo de 27B, lo que lo hace adecuado para agentes de código con historiales largos y repetidos.
- Asistentes con contexto largo: la ventana nativa de 262.144 tokens permite cargar repositorios completos, contratos o documentación extensa en una sola pasada sin troceado.
- Análisis de documentos con imagen: la torre de visión permite procesar capturas, diagramas y páginas escaneadas junto con texto en la misma conversación.
- Inferencia de baja latencia en estación de trabajo: el artefacto está optimizado para una RTX 5090 (sm_120a) con kernels W4A4 NVFP4, lo que permite ejecutar un modelo de 27B en una GPU de consumo con decodificación especulativa.
- Prellenado rápido de prompts largos: Infernix reporta prellenados 1,3-1,5× más rápidos que NInfer en el artefacto oficial de 27B, útil en pipelines que reciben prompts extensos de forma repetida.
- Despliegue con draft model dedicado: la ruta `--spec dflash2` con ventana deslizante de 2048 y selector top-16 está pensada para escenarios de generación larga donde la latencia de decodificación por token es el cuello de botella.
- Prototipado de agentes multimodales: al ser un único fichero `.ninfer` sin paso de conversión, se puede levantar con `infernix-serve` o `ninfer-serve` apuntando directamente al artefacto.

## Benchmarks y rendimiento

La model card solo aporta métricas comparativas de motor (Infernix frente a NInfer) medidas sobre el artefacto oficial de 27B de NInfer, no sobre este artefacto concreto:

| Metrica | Resultado reportado |
|---|---|
| Tokens de prompt servidos desde caché de prefijo (replay agéntico de código) | 90 % |
| Tiempo hasta el primer token (vs. NInfer) | ~50 % del promedio de NInfer |
| Velocidad de prellenado de prompts largos (vs. NInfer) | 1,3-1,5× |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 22,8 GB, por lo que la inferencia requiere al menos ~23-24 GB de VRAM para pesos, más overhead de KV cache y buffers de activación.
- GPU objetivo declarada: NVIDIA RTX 5090 (sm_120a, Blackwell). Los kernels NVFP4 W4A4 y FP8 requieren arquitectura Blackwell.
- GPU recomendadas: RTX 5090 como plataforma de referencia; GPUs Blackwell de datacenter (B200 y similares) previsiblemente compatibles con sm_120a, aunque no se documenta explícitamente.
- Cabe en GPU de consumo: sí, en RTX 5090. En GPUs anteriores (Ada, Ampere) los kernels NVFP4 nativos no están disponibles, por lo que la compatibilidad no está garantizada.
- Opciones de despliegue: `infernix-serve` (motor recomendado, del mismo autor), `ninfer-serve` (NInfer) y `ninfer-custom`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI: el formato `.ninfer` es propietario.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo; solo las comparativas relativas frente a NInfer indicadas en la sección anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 | 27B | 262.144 | `.ninfer`, NVFP4/FP8 mixto | Apache 2.0 | Añade DFlash2 y cabeza de propuesta; solo motores Infernix/NInfer |
| nvidia/Qwen3.8-27B-NVFP4 (base) | 27B | 262.144 | `compressed-tensors`, NVFP4/FP8 | Apache 2.0 | Checkpoint original de NVIDIA; requiere conversión o motor compatible con compressed-tensors |
| Artefacto oficial NInfer de 27B | 27B | 262.144 | `.ninfer` | Apache 2.0 | Referencia contra la que se miden las mejoras de Infernix; sin DFlash2 ni cabeza de propuesta |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Mencionado como soportado por Infernix; sin datos de specs en la información disponible |

## Limitaciones y advertencias

- Dependencia de hardware: los kernels NVFP4 W4A4 requieren Blackwell (sm_120a). En GPUs sin soporte nativo FP4 el artefacto no es ejecutable tal cual.
- Dependencia de motor: el formato `.ninfer` es propietario y solo lo leen Infernix, NInfer y ninfer-custom. No hay ruta documentada a vLLM, llama.cpp, Ollama o TGI.
- Artefacto de cuantización, no modelo original: la calidad final depende del checkpoint NVFP4 de NVIDIA y de las recuantizaciones aplicadas (cabeza de salida y embedding a FP8), que introducen una desviación respecto al modelo en BF16.
- Proyecciones GDN a/b sin cuantizar: se mantienen en BF16 por restricción de layout (tiles de 128 filas frente a tensores de 96 filas), lo que consume más memoria de la que permitiría una cuantización completa.
- Trazabilidad limitada: no se documentan datos de entrenamiento, composición del corpus, alineación (RLHF/DPO) ni idiomas soportados. Tampoco hay benchmarks de calidad publicados.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al no haber model card del modelo base, no hay documentación de sesgos conocidos.
- Mantenimiento por un único autor: el artefacto, el motor Infernix y la receta de conversión dependen de wallawalla47. La licencia Apache 2.0 permite uso comercial, pero la sostenibilidad del proyecto es un riesgo operativo.
- Recursos de tokenizer: la model card indica que los assets de tokenizer del checkpoint de NVIDIA omiten `added_tokens_decoder` y el patrón Split estándar que exige el tokenizer en C++, por lo que se sustituyeron por los del artefacto oficial de NInfer; conviene verificar la equivalencia de tokenización en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Benchmarks Infernix vs NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork ninfer-custom: https://github.com/Wallawalla47/ninfer-custom
- Recetas de conversión: https://github.com/Wallawalla47/ninfer-custom/blob/master/tools/convert/official_recipes.py
