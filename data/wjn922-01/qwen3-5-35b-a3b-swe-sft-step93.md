# wjn922-01/Qwen3.5-35B-A3B-SWE-SFT-step93

## Resumen

Qwen3.5-35B-A3B-SWE-SFT-step93 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-35B-A3B-Base, publicado por el usuario wjn922-01 en Hugging Face. El modelo parte de la arquitectura Qwen3.5 MoE (mezcla de expertos) de aproximadamente 34.660 millones de parametros totales, con 3.000 millones de parametros activos por token segun la nomenclatura "A3B" del nombre. El entrenamiento se realizo sobre un dataset de 1.000 conversaciones orientadas a ingenieria de software (SWE), durante 3 epocas, lo que se traduce en 93 pasos de optimizacion.

El objetivo del ajuste es especializar el modelo base en tareas de resolucion de problemas de software: generacion y edicion de codigo, razonamiento sobre repositorios y ejecucion de trayectorias de agente. El checkpoint publicado corresponde al paso final de produccion de la ejecucion `qwen35_swe_npu128_20261114_154848`, y se distribuye con pesos en FP32, tokenizer, plantilla de chat y configuracion de generacion, pero sin el estado del optimizador.

Es relevante porque demuestra un flujo de trabajo reproducible de SFT sobre un modelo MoE grande para tareas de codigo, con licencia Apache 2.0 y pesos en safetensors compatibles con `transformers` y con el modo solo-texto de vLLM. No obstante, la informacion publicada es escasa: no hay datos de benchmarks, idiomas declarados ni detalles del dataset mas alla de su nombre y tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), configuracion de generacion condicional |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | 3.000 millones (segun nomenclatura A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32), shards multiples; repo de 138,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5, en su variante "35B-A3B": aproximadamente 34,66 mil millones de parametros totales con 3.000 millones activos por token. La exportacion es solo de lenguaje: la torre de vision no esta incluida, aunque la configuracion corresponde a un modelo de generacion condicional Qwen3.5 MoE. Los pesos conservan los parametros FP32 del checkpoint y se excluye el estado del optimizador. El exportador valida el marcador de finalizacion del checkpoint, las claves y formas de los tensores, la finitud de los valores, los buffers de observacion del router a cero y las cabeceras de los shards safetensors; la procedencia queda registrada en `export_manifest.json`.

El entrenamiento consistio en SFT sobre el dataset `wjn922-01/swe-sft-trajectories-1000`, compuesto por 1.000 conversaciones de trayectorias de ingenieria de software, durante 3 epocas (93 pasos de optimizacion) en una ejecucion identificada como `qwen35_swe_npu128_20261114_154848`, lo que sugiere entrenamiento sobre aceleradores NPU. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se especifican innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5.
- Generacion y edicion de codigo, especialidad del ajuste SFT sobre trayectorias SWE.
- Razonamiento sobre repositorios y tareas de ingenieria de software (resolucion de issues, parches, refactorizacion), segun el dataset de entrenamiento.
- Ejecucion de trayectorias de agente de multiples pasos orientadas a tareas de codigo, dado el formato de "trajectories" del dataset.
- Capacidad multimodal de entrada (image-text-to-text) declarada en los tags del repositorio, aunque la torre de vision no se incluye en esta exportacion.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Capacidades multilingues: no documentadas; los idiomas no estan disponibles en la ficha.
- Modo thinking: no documentado en la informacion disponible.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir el contexto de un problema y generar un parche candidato, aprovechando su entrenamiento sobre trayectorias SWE reales.
- Asistente de programacion en IDE: integrado via API compatible con `transformers` o vLLM, puede completar funciones, explicar codigo y proponer refactorizaciones en conversaciones multi-turno.
- Agente de CI/CD para correccion de tests: el modelo puede analizar fallos de test y proponer cambios de codigo, encajando en pipelines que requieran un modelo con comportamiento de agente multi-paso.
- Generacion de parches en revision de codigo: puede producir diffs y explicaciones para pull requests, apoyandose en su especializacion en ingenieria de software.
- Automatizacion de tareas de mantenimiento de codigo: migraciones de API, actualizacion de dependencias y limpieza de deuda tecnica mediante generacion de cambios acotados.
- Base para ajustes adicionales: al publicarse con licencia Apache 2.0 y pesos safetensors, sirve como punto de partida para SFT o DPO especificos de dominio en equipos que necesiten un modelo de codigo propio.
- Evaluacion de trayectorias de agente: util en investigacion para comparar estrategias de resolucion de problemas de software generadas por el modelo frente a trayectorias de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 138 GB solo para pesos, inviable en GPUs consumer; requiere multiples aceleradores de 80 GB (por ejemplo, 2x A100/H100 80 GB como minimo, con margen para cache KV).
- En cuantizacion de 8 bits: en torno a 35 GB de pesos, ajustable en una A100/H100 de 80 GB o en configuraciones multi-GPU.
- En cuantizacion de 4 bits: en torno a 18-20 GB de pesos, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090, siempre que exista soporte de cuantizacion para la arquitectura qwen3_5_moe en la herramienta elegida.
- GPU recomendadas: H100, A100 80 GB para precision completa; RTX 4090/3090 solo con cuantizacion agresiva y verificando compatibilidad.
- Opciones de despliegue: vLLM en modo solo-texto (recomendado por el autor para inferencia de Qwen3.5 MoE sin vision), `transformers` con safetensors. Soporte de llama.cpp, Ollama o TGI no confirmado para esta arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-SWE-SFT-step93 | 34,66 B | 3 B (segun nombre) | no disponible | Apache 2.0 | SFT sobre 1.000 trayectorias SWE; solo texto |
| Qwen/Qwen3.5-35B-A3B-Base | no disponible | no disponible | no disponible | no disponible | Modelo base del ajuste; sin especializacion SWE |
| Alternativas de codigo de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Qwen3.5, puede heredar sesgos del corpus de entrenamiento del modelo base.
- Riesgo de alucinacion en generacion de codigo y en explicaciones tecnicas; no hay evaluaciones publicadas que cuantifiquen su fiabilidad.
- El ajuste se realizo solo sobre 1.000 conversaciones y 93 pasos; el riesgo de sobreajuste al dataset SWE especifico es alto y la generalizacion a otros dominios no esta validada.
- No se incluye la torre de vision: aunque los tags indiquen image-text-to-text, esta exportacion es solo de lenguaje y requiere un cargador compatible con Qwen3.5 MoE solo-texto.
- Idiomas soportados no declarados; el rendimiento fuera del ingles (idioma probable del dataset SWE) no esta garantizado.
- Pesos en FP32 con un repo de 138,7 GB: el coste de almacenamiento y de inferencia es elevado sin cuantizacion propia.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las condiciones del modelo base Qwen3.5.
- Modelo con 17 descargas y 0 likes: ecosistema minimo, sin validacion independiente de la comunidad.
- No hay informacion sobre tool calling, modo thinking ni plantilla de agente; conviene validar el comportamiento real antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/wjn922-01/Qwen3.5-35B-A3B-SWE-SFT-step93
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/wjn922-01/swe-sft-trajectories-1000
