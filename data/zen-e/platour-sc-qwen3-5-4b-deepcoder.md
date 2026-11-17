# zen-E/PLatour-SC-Qwen3.5-4B-DeepCoder

## Resumen

PLatour-SC-Qwen3.5-4B-DeepCoder es un checkpoint de puente (bridge) entrenado dentro del proyecto PLatour, una linea de investigacion sobre transferencia de conocimiento entre modelos (PACT, Prefill-to-Autoregressive Cross-model Transfer). En este caso concreto se trata de un experimento de "Self-Communication" (experimento 27): el mismo backbone Qwen3.5-4B actua simultaneamente como emisor y receptor, y el checkpoint publicado contiene unicamente las proyecciones lineales del puente, no un modelo completo.

El modelo base es Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parametros desarrollado por Alibaba Qwen. El puente PLatour se entrena con recompensas de tarea sobre backbones congelados, partiendo de proyecciones inicializadas a cero, y esta disenado para soportar modelos con atencion hibrida. El objetivo del proyecto es evaluar si la informacion transmitida entre modelos aporta una mejora real frente a la simple adaptacion del receptor.

El checkpoint es relevante por su enfoque metodologico: introduce PACT-Check con controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para distinguir mejoras genuinas de comunicacion de artefactos de adaptacion. El repositorio pesa 0,8 GB (solo los pesos del puente) y requiere descargar el backbone por separado. La tarea objetivo es generacion de codigo (deepcoder), evaluada sobre LCB v6, HumanEval y MBPP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (backbone Qwen3.5-4B) mas puente lineal entrenado (PACT) |
| Parametros totales | No disponible (el repo de 0,8 GB contiene solo el puente; el backbone Qwen3.5-4B no se incluye) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con custom-loader (verificacion de hashes contra manifiesto) |

## Arquitectura y entrenamiento

El sistema PLatour implementa PACT: un emisor (sender) codifica el prompt y entrega representaciones ocultas, mientras un receptor (receiver) genera la respuesta de forma independiente. El metodo entrena puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero y soportando modelos con atencion hibrida. En este checkpoint de Self-Communication, emisor y receptor son el mismo Qwen3.5-4B, de modo que el puente conecta representaciones internas del propio modelo consigo mismo.

El entrenamiento se realiza sobre el dataset zen-E/PLatour-DeepCoder-Data y la evaluacion se lleva a cabo con un juez de codigo en contenedores Docker aislados. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO mas alla del uso de recompensas de tarea. El proyecto incluye controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para validar que las mejoras no provienen solo de la adaptacion del receptor.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, orientada a tareas de programacion competitiva y funciones autocontenidas (tarea deepcoder).
- Razonamiento multi-paso sobre problemas de codigo, heredado del backbone Qwen3.5-4B.
- Generacion de texto general a traves del backbone subyacente.
- Soporte de conversacion multi-turno mediante el formato de mensajes (`messages`) de la API de PLatour.
- Integracion con backend vLLM para inferencia acelerada.
- Evaluacion automatizada con juez de codigo (LCB v6, HumanEval, MBPP).
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Generacion de funciones Python a partir de descripciones en lenguaje natural: el modelo recibe un prompt y devuelve codigo ejecutable, util para prototipado rapido en entornos de desarrollo.
- Evaluacion de investigacion en transferencia entre modelos: sirve como checkpoint de referencia para reproducir el experimento 27 de PLatour y comparar con los controles PACT-Check.
- Benchmarking de generacion de codigo: permite puntuar el modelo sobre LCB v6, HumanEval y MBPP usando el juez de codigo del proyecto, con ejecucion en contenedores aislados.
- Estudio de mecanismos de self-communication: al usar el mismo backbone como emisor y receptor, facilita analizar si las proyecciones del puente aportan informacion util o solo adaptacion.
- Base para experimentos de destilacion o compresion: el puente lineal entrenado puede servir como punto de partida para transferir capacidades de codigo a variantes mas pequenas.
- Generacion de codigo en pipelines de investigacion: integrable via API de PLatour con backend vLLM para producir respuestas en lote sobre conjuntos de problemas de programacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluacion por defecto puntua LCB v6, HumanEval y MBPP, pero no incluye cifras concretas de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; requiere memoria suficiente para cargar el backbone Qwen3.5-4B (aproximadamente 8 GB en FP16, estimacion estandar para 4B parametros) mas el puente y el workload de decodificacion.
- GPU recomendadas: no especificadas; el proyecto asume Linux con CUDA y memoria suficiente para los modelos seleccionados.
- Cabe en GPU de consumo: probablemente si, dado el tamano del backbone (4B), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: backend vLLM mediante la API de PLatour (`load_session` con `backend="vllm"`); no se documentan llama.cpp, Ollama ni TGI.
- Evaluacion multi-GPU: soporta `--n-gpu N` con replicas independientes (1 GPU por replica por defecto) y `--gpus-per-replica G`; usar `CUDA_VISIBLE_DEVICES` para seleccionar GPUs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| PLatour-SC-Qwen3.5-4B-DeepCoder | Solo puente sobre Qwen3.5-4B | No disponible | Apache 2.0 | Transferencia PACT, generacion de codigo |
| Qwen/Qwen3.5-4B | 4B | No disponible | No disponible en la informacion | Modelo base generalista |
| Alternativas de codigo de ~4B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar el backbone Qwen3.5-4B por separado y usar el cargador personalizado del proyecto PLatour.
- El checkpoint contiene solo las proyecciones del puente (0,8 GB), no pesos completos del modelo.
- La generacion devuelve texto y no ejecuta el codigo generado; la evaluacion con juez requiere Docker y configuracion adicional.
- El ejemplo de generacion con 256 tokens es solo una demo y no sigue el protocolo de benchmark publicado.
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el backbone Qwen3.5-4B puede tener condiciones propias que deben verificarse por separado.
- Proyecto de investigacion con pocas descargas (74) y sin likes; no hay evidencia de validacion en produccion.
- El uso de `--n-gpu` no debe combinarse con `torchrun`; cada replica necesita memoria suficiente para sus modelos y decodificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SC-Qwen3.5-4B-DeepCoder
- Paper: https://arxiv.org/html/2611.06976
- Codigo: https://github.com/zhenyi4/platour
- Coleccion de modelos: https://huggingface.co/collections/zen-E/platour
- Guia de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guia de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Indice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
