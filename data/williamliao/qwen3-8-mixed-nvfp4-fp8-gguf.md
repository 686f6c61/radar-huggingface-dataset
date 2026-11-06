# williamliao/Qwen3.8-Mixed-NVFP4-FP8-GGUF

## Resumen

Qwen3.8-Mixed-NVFP4-FP8-GGUF es una conversión comunitaria a formato GGUF del modelo Darkstar-Qwen3.8-27B-Base-ModelOpt-W4A16-NVFP4-Mixed-FP8, publicada por el usuario williamliao. No se trata de un fine-tune nuevo ni de un modelo entrenado desde cero, sino de una reempaquetadura de pesos para su uso con llama.cpp: conserva los tensores NVFP4 del checkpoint de origen y reconvierte los tensores FP8 E4M3 a Q8_0 mediante la opción `--fp8-as-q8` del conversor de llama.cpp. El modelo upstream es Qwen/Qwen3.8-27B, con 27.320.698.465 parámetros reales según los safetensors del repositorio base.

La relevancia de esta ficha es práctica: el autor documenta que la ruta nativa FP8 en llama.cpp v0.9.0 ofrecía un rendimiento muy bajo en su hardware (2,6 tok/s en una prueba de generación de código Python), mientras que la variante NVFP4 + Q8_0 alcanzó 29,2 tok/s en la misma prueba, unas 11,2 veces más. Es un resultado observacional, no un benchmark controlado, y debe interpretarse como una pista de configuración más que como una conclusión general sobre FP8.

El repositorio ocupa 42,5 GB y está pensado para despliegue local en GPUs de consumo con llama.cpp. La licencia declarada es Apache-2.0, heredada del modelo de origen, aunque conviene verificar los avisos del modelo upstream y del checkpoint intermedio antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8), con proyecciones GatedDeltaNet según la model card del checkpoint de origen; detalles completos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 27.320.698.465 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `--ctx-size 8192`, pero es solo una configuracion de ejemplo) |
| Tipos de cuantizacion | Mezcla de NVFP4 (193 tensores), Q8_0 (208 tensores), BF16 (105 tensores) y F32 (553 tensores) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer de 27.320 millones de parámetros. La model card del checkpoint intermedio (HangGlidersRule/Darkstar-Qwen3.8-27B-Base-ModelOpt-W4A16-NVFP4-Mixed-FP8) indica que la cuantización se aplicó con NVIDIA ModelOpt en esquema W4A16: NVFP4 sobre las proyecciones MLP del bloque de lenguaje y sobre `lm_head`, FP8 E4M3 sobre las proyecciones de self-attention y de GatedDeltaNet, y componentes protegidos mantenidos en BF16. La presencia de GatedDeltaNet sugiere una arquitectura híbrida con capas de atención lineal, aunque no se dispone de la especificación completa del bloque.

Esta ficha no describe un entrenamiento nuevo. No hay información sobre número de tokens de preentrenamiento, composición del dataset, RLHF, DPO ni etapas de alineación en la información proporcionada. La innovación técnica relevante aquí es exclusivamente de despliegue: la conversión a GGUF preserva los tensores NVFP4 y sustituye los FP8 E4M3 por Q8_0, eliminando 416 tensores F32 auxiliares en el proceso (de 1.475 tensores totales en la variante nativa FP8 a 1.059 en esta conversión). No se ha publicado una evaluación de precisión posterior a la conversión.

## Capacidades

- Generación de texto conversacional y de código: el pipeline declarado es `text-generation` y el tag `conversational` está presente en el repositorio.
- Razonamiento y matemáticas: capacidades esperables del modelo base Qwen3.8-27B, aunque no se documentan evaluaciones específicas en esta conversión.
- Tool calling / function calling: no disponible en la información proporcionada para esta conversión concreta.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere uso tras una API compatible, aunque la librería declarada es llama.cpp.

## Casos de uso

- Inferencia local en estaciones de trabajo con dos GPUs de consumo: el autor documenta un despliegue funcional con una RTX 5070 Ti de 16 GB y una RTX 5060 Ti de 16 GB usando `--split-mode layer` y `--tensor-split 60,40`. Es el escenario validado empíricamente en la model card.
- Generación de código en local para entornos con requisitos de privacidad: la prueba de referencia del autor (`code_python`) y el rendimiento observado de 29,2 tok/s lo hacen utilizable en asistentes de código autoalojados, siempre que se acepte la pérdida de precisión de la doble cuantización.
- Servicio conversacional ligero con llama-server: el ejemplo de la model card arranca `llama-server` en el puerto 18010 con `-np 1`, adecuado para prototipos y demos internas de un solo usuario concurrente.
- Evaluación comparativa de rutas de cuantización: sirve como artefacto de referencia para medir el impacto de FP8 nativo frente a Q8_0 en llama.cpp sobre el mismo checkpoint de origen.
- Despliegue en hardware Blackwell con soporte NVFP4: al conservar los tensores NVFP4, permite aprovechar la aceleración de cuantización de 4 bits en GPUs de la generación RTX 50.
- Base para conversiones posteriores: el procedimiento de reproducción documentado (converter con `--fp8-as-q8` y verificación con `GGUFReader`) facilita generar variantes propias a partir del checkpoint fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo incluye observaciones locales de throughput con `mtp-bench.py`, sin decodificación especulativa (`draft=0`):

| Variante | Throughput observado (tok/s) | Entorno |
|---|---:|---|
| NVFP4 + FP8 E4M3 nativo | 2,6 | llama.cpp v0.9.0, Windows CUDA, RTX 5070 Ti + RTX 5060 Ti |
| NVFP4 + Q8_0 (esta conversión) | 29,2 | mismo entorno, misma prueba `code_python` |
| NVFP4 + Q8_0 (media de 13 prompts) | ~29 | 2.248 tokens predichos, sin draft tokens |

Otras observaciones del autor sitúan la ruta FP8 nativa en torno a 3,27 tok/s de generación y 3,09–3,22 tok/s en informes parciales de procesamiento de prompt. El autor advierte que son mediciones informales, sin suite controlada, sin logs completos de offload y sin mediciones emparejadas de prompt processing.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 42,5 GB, por lo que la inferencia completa requiere más de 40 GB de VRAM sumando pesos y buffers; con dos GPUs de 16 GB el autor tuvo que usar reparto por capas y verificar el offload en el log de arranque.
- GPUs recomendadas: el autor valida RTX 5070 Ti 16 GB + RTX 5060 Ti 16 GB. Para cargar el modelo completo en una sola GPU se necesitaría una unidad de 48 GB o superior (A6000, L40S, A100 80 GB), aunque esto no está verificado en la información proporcionada.
- GPU de consumo: no cabe entero en una sola GPU de 16 GB o 24 GB; sí es viable con reparto entre dos GPUs de 16 GB o con offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) es la ruta documentada. vLLM, TGI u Ollama no se mencionan para este artefacto GGUF concreto.
- Latencia y throughput: 29,2 tok/s en la prueba `code_python` y ~29 tok/s de media en 13 prompts con el hardware indicado. No hay datos de latencia de primer token ni de prompt processing emparejados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| williamliao/Qwen3.8-Mixed-NVFP4-FP8-GGUF (esta ficha) | 27,3 B | no disponible | GGUF mixto NVFP4/Q8_0/BF16 | Apache-2.0 | Conversión comunitaria para llama.cpp |
| HangGlidersRule/Darkstar-Qwen3.8-27B-Base-ModelOpt-W4A16-NVFP4-Mixed-FP8 | 27,3 B | no disponible | safetensors NVFP4 + FP8 E4M3 | Apache-2.0 | Checkpoint de origen, orientado a vLLM |
| primitive-ai/Qwen3.8-27B-mixed-NVFP4-FP8 | 27,3 B | no disponible | safetensors NVFP4 + FP8 | no disponible | Otra distribución del mismo esquema de cuantización |
| williamliao/Qwen3.8-27B-NVFP4-GGUF | 27,3 B | no disponible | GGUF NVFP4 | Apache-2.0 (según autor) | Conversión alternativa del mismo autor, sin el paso FP8 a Q8_0 |
| Qwen/Qwen3.8-27B | 27,3 B | no disponible | safetensors BF16 | Apache-2.0 | Modelo upstream sin cuantizar |

No se dispone de comparativas de calidad (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un fine-tune nuevo: es una conversión de formato y cuantización de un modelo existente, por lo que hereda tanto las capacidades como los sesgos del modelo upstream.
- No es bit-exact: convertir FP8 E4M3 a Q8_0 introduce una segunda etapa de cuantización que puede degradar la calidad de salida. No se aporta ninguna evaluación de precisión posterior a la conversión.
- No es un modelo completamente NVFP4: mezcla NVFP4, Q8_0, BF16 y F32 de forma intencionada; asumir que se comporta como un modelo de 4 bits puro es incorrecto.
- El resultado de rendimiento de 11,2× es una observación local en un entorno concreto (Windows, llama.cpp v0.9.0, dos GPUs Blackwell) y no una conclusión general sobre la velocidad de FP8 en llama.cpp; la causa del problema no está establecida.
- La model card no documenta sesgos, tasas de alucinación ni comportamiento multilingüe de esta conversión; deben evaluarse sobre el modelo base.
- La licencia Apache-2.0 se declara por herencia del modelo de origen; el autor pide revisar los avisos del modelo Qwen upstream y del checkpoint intermedio antes de redistribuir o usar comercialmente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- El reparto `--tensor-split 60,40` del ejemplo no es una recomendación universal; debe ajustarse a la VRAM libre real y verificarse en el log de arranque.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/williamliao/Qwen3.8-Mixed-NVFP4-FP8-GGUF
- Checkpoint de origen: https://huggingface.co/HangGlidersRule/Darkstar-Qwen3.8-27B-Base-ModelOpt-W4A16-NVFP4-Mixed-FP8
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión alternativa del mismo autor: https://huggingface.co/williamliao/Qwen3.8-27B-NVFP4-GGUF
- Distribución NVFP4 + FP8 de primitive-ai: https://huggingface.co/primitive-ai/Qwen3.8-27B-mixed-NVFP4-FP8/tree/main
- Conversor de llama.cpp: https://github.com/ggerganov/llama.cpp
