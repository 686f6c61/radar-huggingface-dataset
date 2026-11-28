# wallawalla47/Qwen3.8-27B-Uncensored-NVFP4-NInferV3

## Resumen

Qwen3.8-27B-Uncensored-NVFP4-NInferV3 es un artefacto de inferencia en formato `.ninfer` (NInfer V3) construido por wallawalla47 a partir del checkpoint `orcarouter/Qwen3.8-27B-Uncensored-NVFP4`. Se trata de una build multimodal de la familia Qwen3.8/3.5 de 27B de parametros con el alineamiento de seguridad sustancialmente eliminado mediante abliteration (realizada por orcarouter, no por el autor de este repositorio), empaquetada en un unico fichero listo para servir sin paso de conversion en carga.

El artefacto esta optimizado para GPUs NVIDIA Blackwell, concretamente una RTX 5090 (sm_120a), y combina pesos NVFP4 y FP8 importados de forma bit-exacta desde el checkpoint fuente, junto con componentes anadidos de decodificacion especulativa (un draft model DFlash2 y una cabeza de propuesta indexada de 131.072 filas). El objetivo es ofrecer rutas de decodificacion rapidas en los motores Infernix y NInfer sobre hardware consumer de gama alta.

Es relevante ahora porque demuestra un pipeline de cuantizacion mixta FP4/FP8 con preservacion bit-exacta de los pesos codificados, soporte de contexto nativo de 262.144 tokens, vision, modo thinking y decodificacion especulativa, todo en un formato de fichero unico para despliegue directo. La licencia es Apache 2.0, pero el modelo hereda la ausencia de alineamiento de seguridad del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de la familia Qwen3.5: 64 capas con Gated Delta-Net (linear attention) y atencion completa cada 4 capas; torre de vision qwen3_5_vision (profundidad 27); companion MTP |
| Parametros totales | 27B (denominacion del modelo; desglose exacto no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Mixta: NVFP4 (W4A4), FP8 e4m3fn con escalas por fila, BF16, FP32, Q4, Q5, Q6, Q8 agrupados con escalas FP16, INT32 (tabla de indices de propuesta) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (NInfer V3, fichero unico); pesos internos en NVFP4, FP8, BF16, FP32 y formatos agrupados Q4-Q8 |
| Vocabulario | 248.320 tokens |
| Dimension oculta | 5.120 |
| Tamano del repositorio | 23,7 GB |
| Hardware objetivo | NVIDIA Blackwell (sm_120a), probado en RTX 5090 |

## Arquitectura y entrenamiento

El backbone de texto es un transformer hibrido de 64 capas que alterna Gated Delta-Net (una forma de atencion lineal con estado recurrente) con atencion completa cada cuarta capa, con dimension oculta de 5.120 y un vocabulario de 248.320 tokens. Incorpora una torre de vision de 27 capas para entrada de imagen y video, y un companion MTP (multi-token prediction) que habilita decodificacion especulativa. Sobre esta base se anaden dos componentes de aceleracion: un draft model DFlash2 de 5 capas con atencion deslizante (ventana 2.048, selector de rango 256 / top-16) y una cabeza de propuesta indexada de 131.072 filas derivada de la cabeza de salida del modelo fuente.

El proceso de construccion se realizo con el conversor NInfer V3 usando la receta `qwen3_8_27b_nvfp4_orcarouter` sobre CPU (~12 minutos). De los 1.072 objetos de pesos preparados, 112 son NVFP4 (proyecciones MLP de las capas 0-55, importadas bit-exactas), 146 son FP8 (144 objetos de atencion, GDN y MLP de las ultimas ocho capas, importados bit-exactos, mas embedding y cabeza de salida re-cuantizados), 579 BF16, 96 FP32, 55 Q4, 54 Q5, 28 Q8, 1 Q6 y 1 tabla INT32 de indices. Los unicos pesos del modelo de texto re-cuantizados son el embedding y la cabeza de salida (a FP8 con escala por fila), con error relativo maximo de de-cuantizacion medido de 0,034 y 0,023 respectivamente frente al BF16 original (cota 0,07). Los datos de entrenamiento originales (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada; la abliteration fue aplicada por orcarouter sobre el modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo thinking explicito.
- Procesamiento multimodal de imagen y video mediante la torre de vision (pipeline `image-text-to-text`).
- Generacion de codigo y tareas agenticas (tag `agentic`).
- Soporte de contexto largo: hasta 262.144 tokens nativos, adecuado para repositorios, documentos extensos y conversaciones multi-turno prolongadas.
- Decodificacion especulativa mediante MTP, draft model DFlash2 y cabeza de propuesta indexada (`--spec dflash2`, `--lm-head-draft`).
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Comportamiento sin rechazo (abliterated): responde a peticiones que el Qwen3.8-27B original rechazaria.
- Servible con los motores Infernix (recomendado), NInfer y ninfer-custom.

## Casos de uso

- Investigacion de mecanismos de rechazo e interpretabilidad: el modelo permite estudiar como la abliteration altera las representaciones internas y las respuestas ante peticiones sensibles, comparandolo con el checkpoint original.
- Red-teaming y evaluacion de robustez: sirve como modelo adversario controlado para probar clasificadores de seguridad, filtros de moderacion y sistemas de deteccion de contenido danino antes de desplegarlos en produccion.
- Analisis de documentos largos con imagen: gracias a los 262.144 tokens de contexto y la torre de vision, puede procesar informes con graficos, tablas escaneadas y texto extenso en una sola pasada.
- Asistencia de codigo en local sobre RTX 5090: el formato NVFP4/FP8 y las rutas de decodificacion especulativa permiten servir el modelo en hardware consumer para autocompletado y refactorizacion en un IDE.
- Agentes multi-paso con tool calling: el tag `agentic` y el contexto largo lo hacen apto para pipelines que encadenan busquedas, ejecucion de codigo y sintesis de resultados.
- Replay de sesiones de codificacion agentica: Infernix reporta que sirvio el 90 % de los tokens de prompt desde su cache de prefijo en un replay agentico sobre el 27B, lo que reduce coste en flujos repetitivos.
- Evaluacion comparativa de tecnicas de cuantizacion: al preservar pesos NVFP4 y FP8 bit-exactos, permite medir el impacto de la cuantizacion mixta frente al BF16 sin ruido de re-cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento proporcionados son de infraestructura, medidos por el autor en el artefacto oficial de NInfer para el 27B:

| Metrica | Resultado |
|---|---|
| Tokens de prompt servidos desde cache de prefijo (replay agentico) | 90 % |
| Tiempo hasta el primer token (Infernix vs NInfer) | ~50 % del promedio de NInfer |
| Aceleracion de prefill en prompts largos | 1,3-1,5x |
| Error relativo maximo de de-cuantizacion (embedding) | 0,034 |
| Error relativo maximo de de-cuantizacion (cabeza de salida) | 0,023 |
| Cota de error FP8 E4M3 | 0,07 |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 23,7 GB, por lo que se necesita al menos ~24 GB de VRAM para cargar los pesos; el autor lo construyo y probo especificamente para una RTX 5090 (32 GB).
- GPU recomendadas: NVIDIA RTX 5090 (sm_120a, objetivo declarado); otras GPUs Blackwell con capacidad suficiente. No se indica compatibilidad con arquitecturas anteriores (Ampere, Hopper) en la informacion disponible.
- Cabe en GPU consumer: si, en RTX 5090; en GPUs de 24 GB el margen es ajustado y depende del overhead de KV cache para contexto largo.
- Opciones de despliegue: Infernix (`infernix-serve`, recomendado), NInfer (`ninfer-serve`) y ninfer-custom. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para el formato `.ninfer`.
- Latencia y throughput: no disponible de forma absoluta; solo se reportan mejoras relativas de Infernix frente a NInfer (primer token a la mitad de tiempo, prefill 1,3-1,5x mas rapido).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-NVFP4-NInferV3 | 27B | 262.144 | Texto + vision | Apache 2.0 | `.ninfer`, motores Infernix/NInfer |
| orcarouter/Qwen3.8-27B-Uncensored-NVFP4 | 27B | 262.144 | Texto + vision | Apache 2.0 | compressed-tensors (llmcompressor) |
| Qwen3.8-27B (original, con alineamiento) | 27B | 262.144 (segun familia) | Texto + vision | no disponible en la informacion | safetensors (segun familia) |
| NInfer oficial 27B | 27B | no disponible | no disponible | no disponible | `.ninfer` |

Los datos de rendimiento comparativo entre estas variantes no estan disponibles; la unica comparacion cuantificada es Infernix frente a NInfer sobre el artefacto oficial de 27B, no sobre este fichero.

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido sustancialmente eliminado por abliteration: el modelo cumplira peticiones que el Qwen3.8-27B original rechazaria. Requiere capas propias de moderacion antes de exponerlo a usuarios.
- La model card fuente restringe el uso a investigacion legitima (interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo, red-teaming, evaluacion de robustez) y declara que el usuario asume toda la responsabilidad sobre el uso y las salidas.
- Riesgo elevado de alucinacion y de contenido inapropiado, agravado por la ausencia de alineamiento.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Compatibilidad de hardware restringida a NVIDIA Blackwell (sm_120a) segun la informacion disponible; no se confirma funcionamiento en otras generaciones.
- El formato `.ninfer` solo es servible con Infernix, NInfer o ninfer-custom; no hay soporte documentado para ecosistemas estandar como vLLM o llama.cpp.
- La licencia Apache 2.0 permite uso comercial, pero las restricciones eticas de la model card fuente y la responsabilidad legal del despliegue recaen sobre el integrador.
- El repositorio tiene solo 2 likes y fue creado en octubre de 2026, con actualizacion en noviembre de 2026; la madurez y el soporte de la comunidad son limitados pese a las 10.597 descargas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-27B-Uncensored-NVFP4-NInferV3
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-NVFP4
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork ninfer-custom (recetas de conversion): https://github.com/Wallawalla47/ninfer-custom
- Receta de conversion: https://github.com/Wallawalla47/ninfer-custom/blob/master/tools/convert/official_recipes.py
- Benchmarks Infernix vs NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
