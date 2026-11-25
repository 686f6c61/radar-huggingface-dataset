# wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-MC-MUL1

## Resumen

GLM-5.3-Flash-EXL3-K4-MC-MUL1 es una cuantizacion de 4 bits del modelo zai-org/GLM-5.3-Flash-BF16, publicada por el usuario wrldsuksgo2mars. Se trata de un checkpoint EXL3 (ExLlamaV3) con codebook MUL1 y una estructura "multi-core" que ofrece tres vistas de pesos (`original`, `k8-compact` y `k6-compact`) compartiendo los expertos enrutados K4, el router, los embeddings, la torre de vision y otros tensores comunes. El modelo base es un transformer de tipo mixture-of-experts (MoE) de la familia GLM-5.3, orientado a tareas agenticas y de razonamiento.

El checkpoint declara 87.811.119.966 parametros reales en safetensors (unos 87,8 mil millones) y ocupa 189,8 GB en el repositorio. La cuantizacion se ha calibrado con un panel especifico de prompts agenticos (codigo fuente real, matematicas resueltas, esquemas de function-call y texto multilingue) usando la plantilla de chat de GLM con el maximo esfuerzo de razonamiento. Es relevante para quien quiera ejecutar el modelo base en hardware mas modesto sin perder calidad en tareas de agente, aunque el ecosistema de ejecucion (libreria `cuteafd`) y la disponibilidad de pesos en formatos estandar son limitados.

La licencia declarada es MIT, heredada del modelo base de Z.AI. No obstante, la ficha no dispone de informacion sobre benchmarks publicados, idiomas soportados de forma oficial ni detalles del entrenamiento original del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con atencion MLA, DSA indexer, KDA recurrent tensors y hyper-connections (segun la model card del checkpoint) |
| Parametros totales | 87.811.119.966 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4-bit (codebook MUL1, multiplier 0x83DCD12D); expertos enrutados K4, nucleos compactos K8 y K6; MTP input projection en BF16 |
| Idiomas soportados | no disponible (la calibracion incluye texto multilingue, pero no se listan idiomas oficiales) |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, con indices por vista `original`, `k8-compact` y `k6-compact`; metadatos en `cuteafd-mc.json`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base zai-org/GLM-5.3-Flash-BF16 (commit `a5b45eb41df6402735dedc900be14a42e8d5e538`). La model card describe una arquitectura MoE con expertos enrutados, router, embeddings, torre de vision, tensores recurrentes KDA, indexador DSA, hyper-connections y proyeccion KV de MLA absorbida. La estructura "multi-core" comparte los expertos K4 y los tensores comunes entre las tres vistas, mientras que el nucleo seleccionado (matrices de atencion, MLPs densos y compartidos, cabeza de vocabulario y resto del nucleo MTP) varia entre vistas. La proyeccion de entrada MTP (`eh_proj`) se mantiene en BF16 en todas las vistas.

El proceso de cuantizacion uso el encoder `tpurtell/GPTQModel@f7d0ca40783d7ae801f1dc58fe88c9227584643d`, busqueda con semilla 787 y `sigma_reg` 0,025, y calculo de hessianos en FP32/FP64 con verificacion de congruencia de Hadamard en FP64. La calibracion se realizo sobre el panel `wrldsuksgo2mars/agentic-quant-panel-v2` con 1.426 prompts agenticos (1.097.737 tokens) seguidos de 250 filas estandar (512.000 tokens), totalizando 1.609.737 tokens. El DSA selecciona 512 grupos completos de 4 tokens con la cola parcial retenida. No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta orientado a tareas de razonamiento con "maximo esfuerzo de razonamiento" segun la plantilla de chat de GLM.
- Codigo y matematicas: el panel de calibracion incluye codigo fuente real y matematicas resueltas, lo que sugiere capacidad para generacion de codigo y resolucion de problemas matematicos.
- Function calling / tool calling: la calibracion incluye esquemas de function-call, indicando soporte para llamadas a herramientas.
- Capacidades agenticas: el panel de calibracion es explicitamente agentico (prompts multi-paso, esquemas de herramientas).
- Vision: la arquitectura incluye una torre de vision compartida entre vistas.
- Multilingue: la calibracion incluye texto multilingue, aunque no se detallan los idiomas soportados oficialmente.
- Capacidades de razonamiento extendido (thinking mode): la plantilla de chat se renderizo con maximo esfuerzo de razonamiento.

## Casos de uso

- Agentes autonomos multi-paso: el modelo esta calibrado con prompts agenticos y soporta function calling, por lo que puede integrarse en bucles de planificacion y ejecucion de herramientas en entornos de desarrollo.
- Generacion de codigo en produccion: la calibracion con codigo fuente real y esquemas de function-call lo hace adecuado para asistentes de codigo integrados en IDE o pipelines de CI/CD.
- Razonamiento matematico asistido: la inclusion de matematicas resueltas en el panel de calibracion sugiere uso en tutoria o resolucion de problemas paso a paso.
- Automatizacion de tareas con herramientas externas: gracias al soporte de function calling, puede orquestar APIs y servicios en flujos de trabajo automatizados.
- Analisis de documentos con vision: la torre de vision permite procesar imagenes junto con texto en tareas de extraccion o comprension de documentos.
- Despliegue en hardware con VRAM limitada: la cuantizacion EXL3 4-bit reduce el peso del modelo base BF16, permitiendo ejecutarlo en GPUs con menos memoria que la version original.
- Experimentacion e investigacion: las tres vistas (`original`, `k8-compact`, `k6-compact`) permiten comparar el impacto del nucleo en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 189,8 GB; la vista `original` declara 163,56 GiB de pesos indexados, `k8-compact` 156,17 GiB y `k6-compact` 154,32 GiB. Se requiere hardware con al menos esa capacidad de memoria, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano de pesos, se necesitan configuraciones multi-GPU de alta gama (tipo A100/H100 en varios nodos) o GPUs con memoria unificada muy grande.
- Cabe en consumer GPU: no, con los datos disponibles el tamano de pesos supera la VRAM de cualquier GPU de consumo individual.
- Opciones de despliegue: la model card indica seleccionar el modelo en la libreria `cuteafd` y configurar `CORE_VIEW` (`original`, `k8-compact` o `k6-compact`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-K4-MC-MUL1 | 87,8 B (totales) | no disponible | EXL3 4-bit | MIT | Hugging Face (repo de 189,8 GB) |
| zai-org/GLM-5.3-Flash-BF16 (base) | no disponible | no disponible | BF16 | MIT | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | MIT | no disponible |

No se dispone de informacion sobre benchmarks ni de modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base BF16, especialmente en tareas de razonamiento complejo o generacion de codigo largo.
- No se han publicado benchmarks que permitan cuantificar la perdida de calidad de esta cuantizacion frente al modelo base.
- El ecosistema de ejecucion (`cuteafd`) es poco comun y no se documentan integraciones con frameworks estandar como vLLM, llama.cpp o TGI.
- La licencia MIT se hereda del modelo base; conviene verificar los terminos exactos del modelo base de Z.AI para uso comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- No se detallan sesgos conocidos ni limitaciones de idioma oficiales.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- El modelo fue creado el 2026-11-25 y actualizado el mismo dia; no hay historial de mantenimiento.
- La vista por defecto (`original`) conserva el nucleo BF16 y las matrices MTP, por lo que el ahorro de memoria respecto al base puede ser limitado.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-MC-MUL1
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Dataset de calibracion: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v2
- Encoder GPTQModel: https://github.com/tpurtell/GPTQModel
- Licencia: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-MC-MUL1/blob/main/LICENSE
