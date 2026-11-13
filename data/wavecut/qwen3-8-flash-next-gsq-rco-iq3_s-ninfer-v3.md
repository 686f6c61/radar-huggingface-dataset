# WaveCut/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-NInfer-v3

## Resumen

Qwen3.8-Flash-Next GSQ-RCO IQ3_S (artefacto NInfer v3) es una distribucion cuantizada del modelo Qwen3.8-Flash-Next, un transformer de mezcla de expertos (MoE) de 125.000 millones de parametros desarrollado originalmente por el equipo Qwen. El artefacto lo publica WaveCut sobre la cuantizacion GGUF de ISTA-DASLab, empaquetada en el formato propietario `.ninfer` para el motor de inferencia NInfer. La cuantizacion IQ3_S promedia 3,50 bits por peso sobre los pesos del transformer, lo que reduce el modelo a un unico fichero de 54,24 GiB.

El modelo resuelve el problema de servir un MoE de gran tamano en hardware de consumo y estaciones de trabajo con 24-96 GB de VRAM, manteniendo capacidades multimodales (texto e imagen) y decodificacion especulativa integrada. La arquitectura combina 36 capas Gated DeltaNet (atencion lineal) con 12 capas de atencion dispersa (QSA), mas 48 capas de 512 expertos enrutados cada una, con 10 expertos activos por token y unos 6.000 millones de parametros activos.

Es relevante ahora porque demuestra un pipeline de cuantizacion mixta por tensor (expertos enrutados en IQ2_S/IQ3_XXS/IQ3_S/IQ4_XS, expertos compartidos en Q4_K-Q8_0) combinado con un drafter especulativo DFlash2 y una torre de vision BF16 en un solo artefacto. El motor NInfer, sin embargo, es una bifurcacion no oficial: las builds estandar rechazan estos ficheros y es necesario compilar la rama `master` desde un commit concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 36 capas Gated DeltaNet (atencion lineal) + 12 capas de atencion dispersa (QSA); 48 capas de 512 expertos enrutados |
| Parametros totales | 125.000 millones (125B) |
| Parametros activos | ~6.000 millones (~6B) por token; 10 de 512 expertos activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (3,50 bits/peso de media); por tensor: IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, IQ4_NL, Q2_0, Q4_K, Q5_K, Q6_K, Q8_0, BF16, FP32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.ninfer` (formato propietario de NInfer); origen GGUF; torre de vision en `mmproj-...-BF16.gguf` |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Tamano del fichero | 58.242.390.528 bytes (54,24 GiB) |
| Tamano del repo | 397,7 GB |
| Motor de inferencia | NInfer v3 (rama `master` de iamwavecut/ninfer-all) |
| Commit minimo | `5395ec30b` |
| Drafter especulativo | DFlash2 (incoai), GGUF Q4_0 de 339 MB, 5 capas sliding-window de anchura 2.560 |
| Torre de vision | BF16, 0,9 GB, 27 bloques de anchura 1.152, merge 2x2 sobre 2.560 |
| Tabla n-gram | externa; SHA-256 `dd55c289…6cc3` de las filas |

## Arquitectura y entrenamiento

La arquitectura es un MoE hibrido poco convencional. Las capas de secuencia combinan 36 capas Gated DeltaNet (una variante de atencion lineal con estado recurrente) con 12 capas de atencion dispersa QSA, lo que reduce el coste cuadratico del contexto frente a un transformer denso equivalente. La parte MoE tiene 48 capas con 512 expertos enrutados cada una, de los que se activan 10 por token, dando unos 6B de parametros activos sobre 125B totales. El enrutador se mantiene en BF16 en este artefacto.

La cuantizacion es mixta por tensor y por proyeccion: los expertos enrutados usan por capa y proyeccion gate/up IQ2_S (20 capas), IQ3_XXS (17), IQ3_S (10) e IQ4_XS (1), y down IQ4_NL (39) y Q2_0 (9); los expertos compartidos usan IQ4_NL, Q8_0, Q4_K, Q5_K, Q6_K e IQ4_XS; las capas GDN y QSA usan Q4_K a Q6_K e IQ4_XS. Los expertos se almacenan en orden expert-major, de modo que cada experto ocupa un rango contiguo de bytes. Las proyecciones de hiperconexion se re-cuantizan de BF16 a Q8_0. Los controles GDN, normas, convolucion, `A_log` y `dt_bias` se restauran en BF16/FP32 siguiendo las convenciones del exportador de llama.cpp.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable del artefacto es la integracion de decodificacion especulativa (bloque MTP mas drafter DFlash2 que redacta a partir de los estados ocultos del propio modelo) y la reutilizacion de prefijo de prompt para hasta ocho peticiones concurrentes.

## Capacidades

- Generacion de texto y razonamiento multimodal: pipeline `image-text-to-text`, con torre de vision Qwen3.5/3.6 que procesa imagenes y video.
- Razonamiento multi-paso y modo de pensamiento: el artefacto incluye el bloque MTP (multi-token prediction).
- Codigo y matematicas: capacidades heredadas del modelo base Qwen3.8-Flash-Next (sin datos de benchmark en la informacion disponible).
- Decodificacion especulativa integrada mediante DFlash2, activa por defecto con expertos en host salvo que `--spec` indique lo contrario.
- Salida estructurada (structured output) soportada por el motor NInfer.
- Servicio concurrente de hasta ocho peticiones con reutilizacion de prefijo de prompt.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal en estacion de trabajo: con la torre de vision en BF16 y el modelo en 54 GiB, se puede servir un asistente que responde sobre imagenes y video en una RTX Pro 6000 o una RTX 5090, usando NInfer con hasta ocho peticiones concurrentes.
- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` permite extraer y razonar sobre capturas, diagramas o fotogramas de video en un flujo unico, sin un modelo de vision separado.
- Generacion de codigo asistida en local: el modelo base Qwen3.8-Flash-Next esta orientado a codigo; el artefacto permite ejecutarlo en hardware de consumo con cuantizacion IQ3_S, aunque el soporte de tool calling no esta confirmado en la informacion disponible.
- Razonamiento multi-paso con salida estructurada: el motor NInfer soporta structured output, util para pipelines que necesitan JSON validado en tareas de extraccion o clasificacion.
- Servicio de chat con contexto reutilizado: la reutilizacion de prefijo de prompt reduce el coste de prompts largos y system prompts extensos en aplicaciones de atencion al cliente o asistentes con instrucciones fijas.
- Investigacion en cuantizacion y decodificacion especulativa: el artefacto sirve como banco de pruebas para evaluar IQ3_S mixto, DFlash2 y la hibridacion GDN/QSA frente a alternativas densas.
- Despliegue en RTX 3090/5090: las etiquetas del repo apuntan explicitamente a estas GPU, lo que permite experimentar con un MoE de 125B en una sola tarjeta de consumo (sujeto a limitaciones de VRAM, ver seccion de hardware).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 54,24 GiB; en inferencia hay que sumar la tabla n-gram externa (tamano no disponible), el drafter DFlash2 (339 MB) y la torre de vision (0,9 GB). Con overhead de runtime, se necesita un minimo practico de 56-64 GB de VRAM.
- GPU recomendadas: RTX Pro 6000 (96 GB) es la opcion comoda; RTX 5090 (32 GB) y RTX 3090 (24 GB) no caben en una sola tarjeta y requieren offload de expertos a host o configuraciones multi-GPU. El repo etiqueta explicitamente `rtx-3090`, `rtx-5090` y `rtx-pro-6000`.
- Cabe en consumer GPU: solo con offload a RAM del sistema o multi-GPU; no en una RTX 4090 (24 GB) de forma completa.
- Opciones de despliegue: exclusivamente NInfer (rama `master` de iamwavecut/ninfer-all, commit `5395ec30b` o posterior). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` y la familia de modelos solo existen en esa linea. `CMAKE_CUDA_ARCHITECTURES` debe ser `86`, `89` o `120a`; `120a` requiere CUDA 13.1 o superior.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa con DFlash2 y la reutilizacion de prefijo deberian mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next GSQ-RCO IQ3_S (NInfer v3) | 125B | ~6B | no disponible | qwen-community-license-1.0 | `.ninfer` / NInfer |
| Qwen3.8-Flash-Next GSQ-RCO IQ3_S (GGUF original, ISTA-DASLab) | 125B | ~6B | no disponible | qwen-community-license-1.0 | GGUF / llama.cpp y derivados |
| Qwen/Qwen3.8-Flash-Next (original) | 125B | ~6B | no disponible | qwen-community-license-1.0 | safetensors / Transformers, vLLM |
| DFlash2 drafter (incoai) | no disponible | no disponible | no disponible | no disponible | GGUF Q4_0 / NInfer |

No se dispone de datos de rendimiento comparado en la informacion proporcionada. La diferencia principal frente al GGUF original es el formato contenedor y el motor: el artefacto NInfer integra MTP, DFlash2 y la torre de vision en un unico fichero, mientras que el GGUF requiere el stack de llama.cpp.

## Limitaciones y advertencias

- Dependencia de un motor no oficial: NInfer es una bifurcacion de terceros; las builds estandar rechazan estos ficheros y hay que compilar desde un commit concreto. Esto supone un riesgo de mantenimiento y de seguridad de la cadena de suministro.
- Licencia: qwen-community-license-1.0 no es una licencia de codigo abierto plena; hay que revisar las restricciones de uso comercial antes de desplegar en produccion.
- Cuantizacion agresiva: IQ2_S e IQ3_XXS en la mayoria de expertos enrutados degradan la calidad respecto al modelo original; la model card no aporta evaluaciones de perdida de calidad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin datos de evaluacion especificos para esta cuantizacion.
- Sesgos: no disponibles en la informacion proporcionada.
- Idiomas: no se especifican los idiomas soportados.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible.
- Dependencia externa: la tabla n-gram se distribuye en un repositorio aparte; sin ella el artefacto no funciona correctamente.
- Hardware: 54 GiB de pesos mas overhead hacen inviable el despliegue en GPU de 24 GB sin offload, lo que afecta a latencia y throughput.
- Fecha de creacion (2026-10-05) y actualizacion (2026-11-13): verificar la vigencia de los commits y artefactos enlazados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-NInfer-v3
- Modelo base GGUF: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Tabla n-gram: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3
- Tabla n-gram alternativa (FP8): https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Drafter DFlash2 en GGUF Q4_0: https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF
- Motor NInfer: https://github.com/Neroued/ninfer
- Rama NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit minimo: https://github.com/iamwavecut/ninfer-all/commit/5395ec30ba5653914ac59d265102414712a8721d
- Commit de lectura de tablas n-gram: https://github.com/iamwavecut/ninfer-all/commit/57395b20b4ee9c4ac792146d82ffac6b28396a9b
- Paper referenciado (arXiv 2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv 2605.00649): https://arxiv.org/abs/2605.00649
