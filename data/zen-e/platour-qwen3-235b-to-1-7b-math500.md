# zen-E/PLatour-Qwen3-235B-to-1.7B-MATH500

## Resumen

PLatour-Qwen3-235B-to-1.7B-MATH500 es un checkpoint de puentes lineales (bridges) publicado por el autor zen-E como parte del proyecto de investigacion PLatour, asociado al paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No se trata de un modelo completo, sino de un conjunto de proyecciones que conectan dos backbones congelados: un emisor grande (Qwen/Qwen3-235B-A22B-FP8) que codifica el prompt y un receptor pequeno (Qwen/Qwen3-1.7B) que genera la respuesta de forma independiente.

El modelo implementa el paradigma PACT (Prefill-to-Autoregressive Cross-model Transfer): el emisor procesa la entrada y transfiere sus representaciones ocultas al receptor a traves de puentes lineales ligeros entrenados con recompensas de tarea mediante GRPO, partiendo de proyecciones inicializadas a cero. El checkpoint corresponde al experimento 15 del proyecto, orientado a la tarea MATH500 (problemas de matematicas).

Es relevante porque explora si la informacion de un modelo grande puede transferirse de forma util a uno mucho mas pequeno sin necesidad de destilar pesos completos, y porque el paper introduce controles (PACT-Check) para verificar que las mejoras provienen realmente de la comunicacion entre modelos y no de la simple adaptacion del receptor. El repositorio pesa 0,9 GB y contiene solo las proyecciones, no los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) entre dos backbones transformer congelados; soporta modelos de atencion hibrida |
| Parametros totales | No disponible (el checkpoint contiene solo proyecciones; los backbones se descargan por separado) |
| Parametros activos | No disponible (el emisor Qwen3-235B-A22B es MoE, pero este checkpoint no incluye sus pesos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el emisor de referencia se distribuye en FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con custom-loader; no cargable con AutoModel.from_pretrained) |

## Arquitectura y entrenamiento

El metodo entrena puentes lineales ligeros entre backbones congelados: el emisor (Qwen3-235B-A22B-FP8) codifica el prompt y suministra representaciones ocultas, mientras el receptor (Qwen3-1.7B) genera la respuesta de forma autonoma. Las proyecciones se inicializan a cero y se entrenan con recompensas de tarea mediante GRPO, usando el mapeo `uniform_endpoints` (frente a `last_aligned`, empleado en la variante PLatour-SFT). El diseno soporta modelos con atencion hibrida.

El entrenamiento se realizo sobre el dataset zen-E/PLatour-Qwen3-Data y corresponde al experimento 15 del proyecto, centrado en MATH500. El paper introduce PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) disenados para determinar si las mejoras dependen de informacion util del emisor o si pueden surgir solo por adaptacion del receptor. El autor advierte explicitamente que un mejor rendimiento en la tarea no demuestra por si solo una comunicacion efectiva entre modelos.

## Capacidades

- Generacion de respuestas a problemas de matematicas (tarea MATH500) mediante la combinacion emisor-receptor.
- Transferencia de representaciones ocultas desde un modelo grande a uno pequeno a traves de puentes lineales entrenados.
- Generacion de texto condicionada por el prompt codificado en el emisor, con decodificacion a cargo del receptor.
- Integracion con backend vLLM para la generacion (segun el ejemplo de la model card).
- Evaluacion reproducible mediante la CLI `platour-exps` con protocolos de tarea publicados.
- Soporte de modelos con atencion hibrida en el diseno del metodo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion sobre transferencia entre modelos: el checkpoint permite reproducir el experimento 15 y analizar si la informacion del emisor mejora al receptor en MATH500, usando los controles PACT-Check para validar la causalidad de la mejora.
- Evaluacion de metodos de comunicacion cross-model: util para comparar PACT frente a alternativas como destilacion clasica o adaptadores, gracias a los protocolos de evaluacion publicados y a la CLI reproducible.
- Estudio de eficiencia computacional: permite medir el coste de ejecutar un emisor grande solo en prefill y un receptor pequeno en decodificacion, frente a ejecutar el modelo grande de extremo a extremo.
- Reproduccion de resultados academicos: el comando `platour-exps evaluate --experiment 15` permite verificar el checkpoint publicado contra las entradas TEST oficiales con ajustes de muestreo y puntuacion definidos.
- Desarrollo de sistemas de razonamiento matematico de bajo coste: el patron emisor-grande/receptor-pequeno podria explorarse para tareas de MATH500 en entornos con VRAM limitada para la decodificacion.
- Base para experimentos de destilacion ligera: los puentes lineales entrenados con recompensas de tarea sirven como punto de partida para investigar variantes del metodo en otras tareas o pares de modelos.

## Benchmarks y rendimiento

El autor indica explicitamente que el repositorio distribuye pesos de inferencia historicos sin puntuaciones de benchmark, y que no se realiza ninguna afirmacion sobre el protocolo de seleccion del checkpoint ni sobre rendimiento imparcial en held-out. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; depende de los backbones. El receptor Qwen3-1.7B es ligero, pero el emisor Qwen3-235B-A22B-FP8 requiere memoria sustancial para el prefill.
- El tamano del repo del checkpoint es de 0,9 GB (solo proyecciones); los backbones se descargan por separado.
- Configuracion por defecto del evaluador: 2 GPU por replica. `--n-gpu 1` es incompatible con el tamano de grupo por defecto.
- `--n-gpu 8` produce 4 replicas independientes de 2 GPU cada una con shards disjuntos de preguntas.
- GPU recomendadas: no disponible de forma especifica; el proyecto requiere Linux con CUDA y memoria suficiente para los modelos seleccionados.
- Despliegue: API del proyecto PLatour (`platour_api.load_session`), backend vLLM para generacion y CLI `platour-exps` para evaluacion. No es cargable con `AutoModel.from_pretrained`.
- Latencia y throughput: no disponibles.
- Entorno: Linux con CUDA, Python 3.11 y checkout editable del repositorio.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento ni especificaciones de modelos comparables en la informacion disponible. Como referencia estructural, el checkpoint se apoya en Qwen/Qwen3-1.7B (receptor) y Qwen/Qwen3-235B-A22B-FP8 (emisor), pero no es equivalente a ninguno de ellos de forma independiente.

## Limitaciones y advertencias

- El checkpoint contiene solo proyecciones (bridges), no pesos completos; no puede cargarse como modelo autonomo con `AutoModel.from_pretrained`.
- Requiere descargar por separado el emisor y el receptor y usar la API del proyecto PLatour con un custom-loader.
- El autor declara que se distribuyen pesos de inferencia historicos sin puntuaciones de benchmark y sin afirmaciones sobre rendimiento imparcial en held-out.
- Se requiere evaluacion independiente y revision de procedencia antes de usar estos artefactos para afirmaciones de rendimiento.
- El ejemplo de generacion de la model card es una demo de prompt personalizado, no el protocolo de benchmark publicado.
- La generacion devuelve texto y no ejecuta codigo generado.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero al depender de backbones Qwen3 conviene verificar las condiciones de los modelos base.
- El metodo se valida con controles PACT-Check; un mejor resultado en tarea no demuestra por si solo comunicacion efectiva entre modelos.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-235B-to-1.7B-MATH500
- Paper: https://arxiv.org/html/2611.06976
- Codigo: https://github.com/zhenyi4/platour
- Coleccion de modelos: https://huggingface.co/collections/zen-E/platour
- Guia de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guia de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Indice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
