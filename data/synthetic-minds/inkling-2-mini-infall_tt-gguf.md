# synthetic-minds/Inkling-2-Mini-Infall_TT-GGUF

## Resumen

Inkling-2-Mini-Infall_TT-GGUF es una familia de cuantizaciones GGUF del modelo multimodal thinkingmachines/Inkling-2-Mini, desarrollado por Thinking Machines Lab y cuantizado por Synthetic Minds mediante su stack propietario Astral-Q. El modelo original es un transformer autorregresivo multimodal con arquitectura de mezcla de expertos (MoE) y mecanismo de bucle (looped transformer), disenado para tareas de imagen-a-texto y conversacion. Con 26.400 millones de parametros totales y solo 3.400 millones activos por token, ofrece una relacion capacidad-coste computacional muy favorable para despliegue en produccion.

La relevancia de esta publicacion radica en que pone a disposicion de la comunidad un conjunto de cuantizaciones optimizadas para GPUs NVIDIA, desde Q4_K_M (18,7 GB) hasta Q8_0 (27,8 GB), con metricas de fidelidad publicadas frente a la referencia Q8_0. El modelo base se publico el 20 de noviembre de 2026 bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Esta ficha cubre la version cuantizada en GGUF, que mantiene la licencia Apache 2.0 del modelo original y esta pensada para ejecutarse tanto en hardware de centro de datos (H100, H200, B200, GB200) como en GPUs de escritorio profesionales (RTX PRO). La cuantizacion emplea tecnicas de imatrix y precision de 8 bits en el pipeline de Astral-Q.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal con MoE y bucle (looped transformer) |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 3,4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_S, Q5_K_M, Q6_K_S, Q6_K, Q6_K_L, Q8_0 |
| Idiomas soportados | Ingles y soporte multilingue general |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer autorregresivo multimodal que combina una arquitectura de mezcla de expertos (MoE) con un mecanismo de bucle (looped transformer, segun el tag `inkling2_loop`). La activacion de solo 3,4B de parametros por token sobre un total de 26,4B permite un coste de inferencia reducido manteniendo una capacidad de representacion amplia. El pipeline `image-text-to-text` confirma que acepta entradas de imagen y texto de forma nativa.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion Astral-Q se aplica sobre el modelo base con soporte de imatrix, y los pesos resultantes son GGUF estandar compatibles con llama.cpp. La model card indica que el proceso de cuantizacion se optimizo para GPUs NVIDIA, desde centros de datos hasta estaciones de trabajo.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto de forma conjunta (image-text-to-text).
- Razonamiento y respuesta a instrucciones en ingles y otros idiomas.
- Soporte multilingue general (segun la model card, "general multilingual support").
- Arquitectura MoE con 3,4B parametros activos, lo que reduce el coste por token.
- Compatibilidad con llama.cpp y, por extension, con ecosistemas que consumen GGUF (Ollama, servidores llama-server, etc.).
- Capacidad de ejecucion en endpoints compatibles (tag `endpoints_compatible`).

No se documentan en la informacion disponible capacidades especificas de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) para este modelo.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo puede procesar imagenes junto con texto en un unico turno, adecuado para aplicaciones de escritorio o entornos con requisitos de privacidad donde no se quiere enviar datos a la nube.
- Despliegue en estaciones de trabajo con GPU profesional: con cuantizaciones de 18,7 a 27,8 GB, cabe en GPUs RTX PRO y similares, permitiendo inferencia local de un modelo de 26,4B con solo 3,4B activos.
- Servicio de atencion al cliente con entrada de imagenes: la naturaleza image-text-to-text permite gestionar consultas que incluyan capturas, fotos de productos o documentacion escaneada junto con texto.
- Prototipado rapido con llama.cpp: la disponibilidad de GGUF estandar y la instalacion simplificada de llama.cpp permiten levantar un servidor con un solo comando, ideal para pruebas de concepto.
- Investigacion en eficiencia de modelos MoE: el modelo sirve como caso de estudio para evaluar el equilibrio entre parametros totales y activos en tareas multimodales.
- Evaluacion comparativa de cuantizaciones: las metricas publicadas de KL divergence, top-1 agreement y perplejidad permiten a los equipos elegir el nivel de cuantizacion segun su presupuesto de VRAM y tolerancia a la perdida de fidelidad.
- Generacion de descripciones de imagenes y analisis visual en pipelines de datos: util para etiquetado automatico o enriquecimiento de catalogos con entrada visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente proporciona metricas de fidelidad de la cuantizacion frente a Q8_0 sobre wikitext-2:

| Cuantizacion | Tamano (GB) | KL divergence media | Top-1 agreement con Q8_0 | Perplejidad (wikitext-2) |
|---|---|---|---|---|
| Q4_K_M | 18,7 | ~0,0059 | ~96,8% | ~5,943 |
| Q5_K_S | 19,2 | ~0,0041 | ~97,3% | ~5,936 |
| Q5_K_M | 21,2 | ~0,0037 | ~97,5% | ~5,935 |
| Q6_K_S | 24,1 | ~0,0028 | ~97,7% | ~5,931 |
| Q6_K | 24,7 | ~0,0027 | ~97,8% | ~5,934 |
| Q6_K_L | 25,4 | ~0,0026 | ~97,9% | ~5,933 |
| Q8_0 | 27,8 | 0 (referencia) | 100% (referencia) | ~5,931 |

Las diferencias de perplejidad entre cuantizaciones (aproximadamente 0,01) son inferiores a los margenes de error (~±0,035), por lo que resultan estadisticamente indistinguibles de Q8_0 en esa metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 18,7 GB (Q4_K_M) y 27,8 GB (Q8_0) solo para los pesos; hay que anadir memoria para el contexto KV y overhead del runtime.
- GPUs recomendadas por el autor: NVIDIA H100/H200, B200/B300, GB200/GB300, GB10 y RTX PRO.
- Cabe en GPU consumer de gama alta con 24 GB (por ejemplo, RTX 4090) unicamente en cuantizaciones Q4_K_M o Q5_K_S, con contexto limitado; para Q6 y Q8_0 se necesita mas VRAM o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), y por compatibilidad de formato, herramientas que consumen GGUF como Ollama o interfaces basadas en llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de tareas que permitan una comparativa rigurosa con modelos alternativos. A nivel estructural, el modelo se situa en la categoria de MoE multimodal de ~26B totales con ~3,4B activos, con licencia Apache 2.0 y distribucion en GGUF. Cualquier comparacion con otros modelos de la misma categoria (por ejemplo, otros MoE multimodales de rango 20-30B) requeriria datos de benchmarks que no se han publicado aqui.

| Criterio | Inkling-2-Mini (GGUF) | Alternativas |
|---|---|---|
| Parametros totales | 26,4B | no disponible |
| Parametros activos | 3,4B | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Formato | GGUF | no disponible |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion para este modelo en la informacion disponible.
- El soporte idiomatico declarado es ingles con "soporte multilingue general"; el rendimiento en castellano no esta verificado.
- La longitud de contexto no se especifica, lo que impide planificar casos de uso con documentos largos.
- Las metricas de fidelidad de cuantizacion se basan en wikitext-2 y no cubren tareas multimodales ni de razonamiento; la perdida de calidad en dominios especificos puede ser mayor que la indicada.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de las herramientas de cuantizacion (Astral-Q) antes de un despliegue comercial.
- El modelo esta pensado para GPUs NVIDIA segun el autor; el rendimiento en otras plataformas no esta documentado.
- La fecha de publicacion (noviembre de 2026) y el numero reducido de descargas (310) sugieren un ecosistema aun poco contrastado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/synthetic-minds/Inkling-2-Mini-Infall_TT-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Web de Synthetic Minds: https://www.syntheticmindslab.com
- Informacion sobre Astral-Q: https://www.syntheticmindslab.com/astral
- Coleccion de cuantizaciones Astral-Q: https://hf.co/collections/synthetic-minds/astral-gguf-quants
- GitHub de Synthetic Minds: https://github.com/syntheticminds-lab
- Perfil en X de Synthetic Minds: https://x.com/syntheticminds2
- Perfil en X del autor (Tudor): https://x.com/tudoriustin_
- LinkedIn de Synthetic Minds: https://www.linkedin.com/company/synthetic-minds-lab/
- Buy Me a Coffee: https://buymeacoffee.com/syntheticminds_lab
