# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-ARC-C

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-ARC-C es un checkpoint experimental publicado por el usuario zen-E dentro del proyecto PLatour, que investiga la transferencia entre modelos (PACT, Prefill-to-Autoregressive Cross-model Transfer). En este esquema, un modelo "emisor" grande (Qwen3-8B) procesa el prompt y genera representaciones ocultas, mientras que un modelo "receptor" pequeno (Qwen3-1.7B) produce la respuesta de forma autonoma. El checkpoint liberado no contiene pesos completos de un modelo, sino unicamente las proyecciones lineales (bridges) entrenadas entre ambos backbones congelados.

El modelo esta asociado al articulo arXiv 2611.06976, "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer", y corresponde al experimento 07 sobre la tarea arc_c. La relevancia reside en que propone una via para aprovechar la capacidad de representacion de modelos grandes reduciendo el coste de decodificacion al delegar la generacion en un receptor de 1.700 millones de parametros. El checkpoint se distribuye con licencia Apache 2.0 y un peso de repositorio de aproximadamente 0,9 GB.

Es importante subrayar que este artefacto no es un modelo autonomo: requiere cargar por separado los backbones Qwen3-8B y Qwen3-1.7B mediante la API del proyecto y no puede cargarse con `AutoModel.from_pretrained`. Ademas, el autor indica explicitamente que el repositorio distribuye pesos de inferencia historicos sin puntuaciones de benchmark asociadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbones Qwen3 congelados) mas puentes lineales ligeros entrenados; soporta modelos de atencion hibrida |
| Parametros totales | No disponible como modelo unico; el checkpoint contiene solo proyecciones bridge (repo de 0,9 GB). Backbones: Qwen3-8B (emisor) y Qwen3-1.7B (receptor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cargador personalizado (`custom-loader`); no compatible con carga estandar |

## Arquitectura y entrenamiento

El metodo PACT separa el procesamiento del prompt de la generacion de la respuesta. Un emisor grande (Qwen3-8B) codifica el prompt y suministra representaciones ocultas; un receptor pequeno (Qwen3-1.7B) genera la respuesta de forma independiente. Los backbones permanecen congelados y solo se entrenan puentes lineales ligeros entre ellos, inicializados a cero y optimizados mediante recompensas de tarea. El mapeo utilizado en este checkpoint concreto es `last_aligned`, a diferencia de la variante PLatour con GRPO, que emplea `uniform_endpoints`.

El articulo introduce ademas PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) disenado para verificar si las mejoras provienen realmente de informacion util del emisor o si pueden explicarse por simple adaptacion del receptor. El entrenamiento se realizo sobre el dataset zen-E/PLatour-Qwen3-Data y corresponde al experimento 07 sobre la tarea arc_c. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas adicionales de RLHF o DPO mas alla del esquema basado en recompensas de tarea.

## Capacidades

- Generacion de texto condicionada por representaciones de un emisor de mayor tamano, con decodificacion a cargo de un receptor de 1.700 millones de parametros.
- Razonamiento sobre tareas tipo ARC (Abstraction and Reasoning Corpus) en el contexto del experimento 07.
- Transferencia entre modelos de distinta escala dentro de la familia Qwen3 mediante puentes lineales entrenados.
- Soporte de modelos con atencion hibrida segun la descripcion del metodo.
- Evaluacion mediante el protocolo PACT-Check con controles de transferencia nula, irrelevante, autocomunicacion y receptor entrenado.
- Integracion con backend vLLM para la generacion a traves de la API del proyecto (`load_session`, `generate`).
- No se documentan capacidades de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion sobre transferencia entre modelos: el checkpoint permite reproducir el experimento 07 y analizar si la informacion del emisor mejora al receptor bajo los controles de PACT-Check, usando el comando `platour-exps evaluate`.
- Estudios de eficiencia computacional: evaluar el coste de decodificacion de un receptor de 1.7B frente a generar directamente con un modelo de 8B, manteniendo la calidad derivada de las representaciones del emisor.
- Experimentacion con atencion hibrida: validar el comportamiento de los puentes lineales en arquitecturas que combinan mecanismos de atencion, tal como contempla el metodo.
- Reproduccion de resultados academicos: el cargador de release verifica configuracion y hashes de pesos, lo que facilita replicar evaluaciones sobre las entradas TEST publicadas.
- Desarrollo de pipelines de investigacion con multiples GPUs: el evaluador admite replicas independientes (`--n-gpu 8`) con shards disjuntos de preguntas, util para barridos a gran escala.
- Analisis de provenance y sesgo de seleccion de checkpoints: dado que el repositorio no incluye puntuaciones, sirve como caso de estudio para revisar protocolos de seleccion y evaluacion independiente.
- Prototipado de sistemas emisor-receptor en entornos controlados con CUDA, Python 3.11 y memoria GPU suficiente para ambos backbones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el repositorio distribuye pesos de inferencia historicos sin puntuaciones de benchmark y que no se realiza ninguna afirmacion sobre el protocolo de seleccion de checkpoints ni sobre rendimiento no sesgado en conjuntos reservados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Requiere memoria suficiente para cargar simultaneamente Qwen3-8B (emisor) y Qwen3-1.7B (receptor) mas el checkpoint de puentes (0,9 GB), segun la indicacion del autor de "enough GPU memory for the selected models".
- GPU recomendadas: no se especifican modelos concretos. El evaluador permite `--n-gpu 1` cuando la carga completa cabe en una sola GPU y despliegue multi-GPU con replicas independientes (por defecto 1 GPU por replica).
- GPU de consumo: no confirmado en la informacion disponible; depende de la viabilidad de cargar ambos backbones en la VRAM disponible.
- Opciones de despliegue: backend vLLM a traves de la API del proyecto PLatour (`load_session` con `backend="vllm"`); no compatible con `AutoModel.from_pretrained` ni con cargadores estandar tipo llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-ARC-C | Puentes sobre Qwen3-8B + Qwen3-1.7B | No disponible | Transferencia emisor-receptor (PACT) | Apache 2.0 | Hugging Face (checkpoint de puentes) |
| Qwen3-8B | 8B | No disponible en esta ficha | LLM denso estandar | No disponible en esta ficha | Hugging Face |
| Qwen3-1.7B | 1.7B | No disponible en esta ficha | LLM denso estandar | No disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no es un modelo autonomo: contiene solo proyecciones bridge y exige cargar por separado los backbones Qwen3-8B y Qwen3-1.7B mediante la API del proyecto.
- No es cargable con `AutoModel.from_pretrained` ni con herramientas estandar de inferencia.
- El autor declara que no se publican puntuaciones de benchmark y que no se afirma nada sobre rendimiento no sesgado en conjuntos reservados; se requiere evaluacion independiente y revision de provenance antes de usar estos artefactos para nuevas afirmaciones comparativas.
- El ejemplo de generacion con 256 tokens es una demo de prompt personalizado, no el protocolo de benchmark publicado.
- La generacion devuelve texto y no ejecuta codigo generado.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero las restricciones practicas derivan de la dependencia de los backbones y del codigo del proyecto.
- Requiere entorno Linux con CUDA y Python 3.11, y ejecutar los comandos desde un checkout editable del repositorio para disponer de los manifiestos de release.
- No se debe combinar `--n-gpu` con `torchrun` en el evaluador del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-ARC-C
- Paper: https://arxiv.org/html/2611.06976
- Codigo: https://github.com/zhenyi4/platour
- Coleccion de modelos: https://huggingface.co/collections/zen-E/platour
- Guia de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guia de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Indice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU en evaluacion: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
