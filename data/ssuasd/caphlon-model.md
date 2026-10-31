# ssuasd/Caphlon-Model

## Resumen

Caphlon-Model es una construcción ligera en formato GGUF del modelo Qwen 3.8 27B, publicada por el usuario ssuasd en HuggingFace el 25 de octubre de 2026. No se trata de una destilación ni de un modelo estudiante: se conserva la topología completa de 27B del modelo base, pero se reduce drásticamente la huella en disco y memoria eliminando redundancia de representación mediante dos técnicas: reducción de la tabla de merges del vocabulario a un objetivo de 100k tokens y poda de capas alineada con los intervalos híbridos de atención, todo ello sobre una cuantización base Unsloth Dynamic IQ2_S.

El resultado es un archivo GGUF de 6,87 GiB que promete calidad de razonamiento cercana al modelo de 27B original con un tamaño apto para portátiles. La arquitectura híbrida del base (mayoría de capas gated-delta-net de estado recurrente de tamaño fijo, minoría de capas de atención completa) permite que la caché KV solo exista en las capas de atención completa, manteniendo el consumo de memoria bajo y escalando el contexto de forma barata.

Es relevante para usuarios que ejecutan modelos localmente en hardware modesto: cabe en 8 GB de VRAM con contexto de 8K, o incluso solo en CPU con 8 GB de RAM vía mmap, y además incorpora decodificación especulativa por n-gramas modificada que multiplica el throughput en tareas de edición de ficheros por 2,34×.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de 60 capas: gated-delta-net (mayoria) + atencion completa (minoria) |
| Parametros totales | 23.862.632.800 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 32K probado |
| Tipos de cuantizacion | IQ2_S (Unsloth Dynamic) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 (heredada de Qwen 3.8 27B) |
| Formato de pesos | GGUF (llama.cpp), compatible con endpoints |

## Arquitectura y entrenamiento

El modelo base, Qwen 3.8 27B, emplea una arquitectura hibrida de 60 capas en la que la mayoria de capas usan gated-delta-net (una red recurrente con estado de tamano fijo) y una minoria usa atencion completa tradicional. Esta combinacion permite que la memoria de contexto crezca de forma barata: la caché KV solo se almacena en las capas de atencion completa, mientras que las capas recurrentes mantienen un estado de tamano constante. El modelo base incluye modo de razonamiento interno (thinking), que puede desactivarse mediante el chat template (`enable_thinking: false`).

Caphlon-Model no reentrena ni destila: aplica tres transformaciones sobre una cuantizacion Unsloth Dynamic IQ2_S del base. Primero, reduce la tabla de merges del vocabulario a un objetivo de 100k tokens mediante seleccion que preserva el cierre (ahorro de 649 MiB). Segundo, elimina las capas 12 a 15 (4 capas alineadas con el intervalo hibrido, ahorro de 302 MiB). Tercero, mantiene los pesos en IQ2_S sin cuantizacion adicional para no degradar la calidad. No hay informacion sobre datos de entrenamiento propios, RLHF ni DPO, ya que se trata de una derivacion directa del modelo base.

## Capacidades

- Generacion de texto en ingles con calidad de razonamiento cercana al modelo base de 27B, segun las metricas de retencion publicadas (92,9% en MMLU, 96,7% en HumanEval).
- Generacion de codigo: resuelve 29 de 30 problemas de HumanEval en evaluacion pass@1 con thinking desactivado.
- Modo de razonamiento interno (thinking) heredado de Qwen 3.8, activable o desactivable via chat template; desactivado por defecto en las evaluaciones para ahorrar presupuesto de tokens.
- Decodificacion especulativa mediante n-gramas modificados (`ngram-mod`), que acelera el throughput en tareas de edicion de ficheros hasta 29,7 tok/s frente a 12,7 tok/s del base.
- Contexto de hasta 32K tokens probado, con coste de memoria contenido gracias a la arquitectura hibrida.
- Compatibilidad con el ecosistema llama.cpp, incluyendo servidor OpenAI-compatible (`llama-server`) y plantillas de chat Jinja.

No hay informacion disponible sobre tool calling, function calling, capacidades de vision, audio ni soporte de agentes.

## Casos de uso

- Ejecucion local en portatiles con GPU de gama media: con 8 GB de VRAM se puede servir el modelo con contexto de 8K y offload completo a GPU, ideal para asistentes privados sin enviar datos a la nube.
- Inferencia solo en CPU en maquinas modestas: con 8 GB de RAM y mmap el modelo es utilizable sin GPU, adecuado para entornos de desarrollo restringidos o servidores pequeños.
- Edicion y refactorizacion de codigo en local: la decodificacion especulativa `ngram-mod` esta optimizada para tareas de edicion de ficheros, alcanzando 29,7 tok/s, lo que la hace practica para herramientas de edicion asistida por LLM.
- Chat conversacional local: mediante `llama-server` con plantilla Jinja se obtiene un endpoint compatible con OpenAI para integrar en clientes de chat como Open WebUI o similares.
- Procesamiento de documentos de longitud media: el contexto de 32K (con 12 GB de VRAM recomendados) permite resumir o analizar documentos largos en local.
- Experimentacion con poda de capas y reduccion de vocabulario: al ser un proyecto documentado con metricas de degradacion publicadas (perplejidad, MMLU, HumanEval), sirve como referencia reproducible para tecnicas de compresion de modelos.
- Despliegue en Apple Silicon: con 16 GB de memoria unificada como minimo y 24 GB o mas recomendados, funciona en MacBooks recientes.

## Benchmarks y rendimiento

Datos medidos el 25 de octubre de 2026 en una Tesla T4 (16 GB) con llama.cpp, temperatura 0 y thinking desactivado, comparando con el quant base (Unsloth Dynamic IQ2_S sin poda ni reduccion de vocabulario):

| Test | Caphlon-Model | Base quant | Resultado |
|---|---|---|---|
| Perplejidad en ingles (`wiki.test.raw`, 512 ctx x 40 chunks) | 6,6088 | 6,3638 | +3,85% (degradacion) |
| HumanEval, 30 problemas, pass@1 | 29/30 (96,7%) | 30/30 (100%) | −1 problema |
| MMLU, subconjunto de 502 preguntas | 344/502 | 370/502 | 92,9% retenido |
| Throughput edicion de ficheros (`--spec-type ngram-mod`) | 29,7 tok/s | 12,7 tok/s | 2,34x |
| Throughput prosa libre | 12,4 tok/s | 12,7 tok/s | practicamente igual |

No se han publicado comparaciones con otros modelos de la categoria (solo con su quant base inmediato).

## Requisitos de hardware

- VRAM estimada: 8 GB minimo para offload completo a GPU con contexto de 8K; 12 GB recomendados para contexto de 32K. El fichero pesa 6,87 GiB en disco.
- GPU recomendadas: probado en Tesla T4 (16 GB). Cabe en GPUs de consumo con 8-12 GB de VRAM, como RTX 3060 12GB, RTX 4070 o RTX 4090 (esta ultima con amplio margen).
- CPUs: ejecutable solo en CPU con 8 GB de RAM (mmap) como minimo; 16 GB recomendados.
- Apple Silicon: 16 GB de memoria unificada como minimo, 24 GB o mas recomendados.
- Despliegue: llama.cpp (formato nativo GGUF), incluyendo `llama-server` con flash-attention, decodificacion especulativa `ngram-mod` y plantilla Jinja. Ollama y otros runtimes GGUF deberian ser compatibles en principio, aunque no hay confirmacion del autor. No hay informacion sobre vLLM o TGI (GGUF no es su formato nativo).
- Throughput medido: 29,7 tok/s en edicion de ficheros con especulacion ngram-mod y 12,4 tok/s en prosa libre, ambos en Tesla T4.
- Opcional: cuantizar la caché KV con `--cache-type-k q8_0 --cache-type-v q4_0` ahorra 152 MB cuando el contexto es el limite, aunque la salida greedy deja de ser identica byte a byte.

## Comparativa con modelos similares

| | Caphlon-Model | Qwen 3.8 27B (base) | Unsloth Dynamic IQ2_S (quant base) |
|---|---|---|---|
| Parametros | 23,86B (tras poda) | 27B | 27B |
| Tamano | 6,87 GiB (GGUF IQ2_S) | no disponible | no disponible |
| Contexto | hasta 32K probado | no disponible | no disponible |
| Perplejidad (wiki.test.raw) | 6,6088 | no disponible | 6,3638 |
| HumanEval pass@1 (30 problemas) | 96,7% | no disponible | 100% |
| MMLU (502 preguntas) | 344/502 | no disponible | 370/502 |
| Licencia | Apache-2.0 | Apache-2.0 | no disponible |

No hay datos publicados comparando con otros modelos ligeros de la categoria de 7-27B cuantizados en IQ2_S (por ejemplo, otros builds de llama.cpp de tamano similar), por lo que la comparativa se limita a su quant base inmediato.

## Limitaciones y advertencias

- Soporte de idiomas limitado al ingles segun la model card; no hay garantia de rendimiento en castellano ni otros idiomas, y la reduccion del vocabulario a 100k merges puede degradar especialmente los idiomas no ingleses.
- La perplejidad empeora un 3,85% respecto al quant base, y MMLU retiene un 92,9%: la poda y reduccion de vocabulario tienen un coste medible de calidad, aunque modesto.
- La evaluacion de HumanEval y MMLU se hizo sobre subconjuntos pequeños (30 y 502 preguntas respectivamente), por lo que los resultados tienen margen de error considerable y no son comparables directamente con benchmarks estandar completos.
- Al ser una derivacion no oficial con poda de capas, pueden existir modos de fallo no cubiertos por las metricas publicadas (regresiones en tareas largas, razonamiento multi-paso o thinking mode).
- El modo thinking consume presupuesto de tokens si no se desactiva explicitamente via `chat_template_kwargs: {"enable_thinking": false}`.
- La cuantizacion IQ2_S es agresiva (2-2,5 bits efectivos), lo que incrementa el riesgo de alucinaciones y errores factuales frente a cuantizaciones mas altas; no hay datos publicados sobre tasas de alucinacion.
- Licencia: los pesos derivan de Qwen 3.8 27B bajo Apache-2.0, que permite uso comercial conservando los avisos. "Caphlon" es una marca de proyecto: se puede redistribuir el modelo, pero no presentarlo como oficial o respaldado por el proyecto.
- Proyecto comunitario con 266 descargas y 2 likes en el momento de la ficha: traccion y auditoria comunitaria muy limitadas; verificar el SHA-256 publicado (`8487b4e4...3d63bc0`) antes de usar en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/ssuasd/Caphlon-Model
- GitHub: https://github.com/demiralpdev/Caphlon-Model
- Pagina del proyecto: https://demiralpdev.github.io/Caphlon-Model/
- Modelo base: https://huggingface.co/Qwen (Qwen/Qwen3.8-27B)
