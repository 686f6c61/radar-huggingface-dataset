# yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep2

## Resumen

yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario yungisimon y publicado en Hugging Face. El objetivo declarado es convertir el modelo instructivo base en un "modelo de memoria" (memory model) entrenado sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus, agrupados mediante el algoritmo de clustering HDBSCAN con un tamano minimo de cluster de 2. El checkpoint publicado corresponde a la epoca 2 de un entrenamiento de 3 epocas.

El modelo conserva la arquitectura transformer densa de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parametros totales, y se distribuye en safetensors en precision bf16, cargable directamente con `transformers`. El repositorio ocupa 3,1 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion habituales.

Su relevancia es acotada: se trata de un experimento de investigacion sobre memorizacion y recuperacion de informacion en modelos pequenos, no de un modelo de proposito general. La ausencia de descargas y likes, junto con la falta de benchmarks publicados, indica que es un artefacto de trabajo personal mas que un modelo listo para produccion. Resulta util como referencia para quienes investigan tecnicas de memoria en LLMs de menos de 2.000 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens (longitud maxima de secuencia usada en entrenamiento); la ventana nativa de Qwen2.5-1.5B-Instruct es de 32.768 tokens, no confirmada para este checkpoint |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; hereda los del modelo base, no verificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion por causalidad estandar, sin mezcla de expertos ni mecanismos hibridos. El ajuste fino es completo: los 1.543.714.304 parametros (el 100 %) son entrenables, ejecutado con FSDP sobre 8 GPU AMD Instinct MI325X. El entrenamiento usa precision bf16 con gradient checkpointing, un tamano de lote efectivo de 1024 (128 por dispositivo, 1 paso de acumulacion, 8 GPU), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay de 0,01, max grad norm de 1,0 y longitud maxima de secuencia de 8.096 tokens. La perdida se calcula solo sobre los tokens del asistente. El entrenamiento completo de 3 epocas declara 0,50 h de reloj (4,0 GPU-h), y este checkpoint es el de la epoca 2.

El dataset de entrenamiento es `bcp_subset300_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`, con 754.069 ejemplos sinteticos de pregunta-respuesta generados a partir de BrowseComp-Plus y agrupados con HDBSCAN (min cluster size 2). La innovacion tecnica no esta en la arquitectura, sino en el paradigma: el modelo se entrena como "modelo de memoria", es decir, para retener y recuperar informacion de documentos cruzados y combinaciones de entidades, en lugar de optimizarse para instrucciones generales. No se documenta uso de RLHF ni DPO en esta fase.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct y ajustada con la plantilla de chat de Qwen.
- Memorizacion y recuperacion de informacion: el entrenamiento sobre pares QA de BrowseComp-Plus busca que el modelo recuerde hechos y entidades de forma directa.
- Razonamiento sobre combinaciones de entidades y documentos cruzados (cross-doc entity combination), segun la composicion declarada del dataset.
- Seguimiento de instrucciones y formato conversacional multi-turno, por herencia del modelo instructivo base.
- Capacidad de codigo y matematicas basicas, heredada del modelo base; no se ha evaluado especificamente tras el ajuste.
- Soporte de tool calling / function calling: no documentado para este checkpoint; el modelo base lo soporta, pero el ajuste puede haber degradado esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multilingues: no documentadas; dependen del modelo base y no han sido verificadas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre memorizacion en LLMs pequenos: sirve como caso de estudio de como un ajuste fino completo sobre pares QA sinteticos afecta a la retencion de hechos en un modelo de 1,5 B de parametros, comparando con el modelo base.
- Recuperacion de hechos de un corpus controlado: en un entorno de laboratorio, se puede interrogar al modelo sobre entidades y relaciones presentes en el dataset de BrowseComp-Plus para medir su tasa de acierto en memoria parametrica.
- Experimentos de destilacion de conocimiento: el checkpoint de la epoca 2 permite comparar la evolucion de la memorizacion entre epocas 1, 2 y 3, util para estudiar curvas de aprendizaje en tareas de memoria.
- Prototipado de asistentes conversacionales de bajo coste: con 1,54 B de parametros y pesos bf16, cabe en GPU de consumo y permite iterar rapidamente en demos de chat con la plantilla de Qwen.
- Evaluacion de tecnicas de clustering aplicadas a datos de entrenamiento: el uso de HDBSCAN con min cluster size 2 sobre el corpus ofrece un ejemplo reproducible de como la agrupacion afecta a la calidad de los pares QA generados.
- Base para posteriores ajustes: al estar bajo Apache 2.0 y en safetensors estandar, puede servir como punto de partida para fine-tunings adicionales en tareas de recuperacion de informacion o QA documental.
- Pruebas de regresion de infraestructura: su tamano reducido lo hace util para validar pipelines de despliegue con transformers o TGI antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4, A10); para cuantizacion 4 bits, GPU con 4-6 GB (GTX 1660, RTX 3050).
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas en bf16 y con 4 GB o mas en cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (metodo documentado por el autor), ademas de Text Generation Inference (el modelo lleva el tag `text-generation-inference` y `endpoints_compatible`). vLLM, llama.cpp y Ollama son viables en teoria por tratarse de arquitectura Qwen2, pero no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep2 | 1,54 B | 8.096 tokens de entrenamiento | Memory model sobre BrowseComp-Plus | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Instructivo general | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Instructivo general | Apache 2.0 (Qwen Research para algunos tamanos) | Hugging Face |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Instructivo general | Llama 3.2 Community License | Hugging Face, con gating |

La comparativa es estructural: el checkpoint de yungisimon no publica metricas, por lo que no puede compararse en rendimiento con las alternativas. Frente al modelo base, la diferencia es el ajuste orientado a memoria; frente a Llama-3.2-1B, la licencia Apache 2.0 es mas permisiva, pero el contexto declarado para el entrenamiento es mucho menor.

## Limitaciones y advertencias

- No se han publicado benchmarks, evaluaciones ni metricas de calidad; no hay evidencia publica de que el ajuste mejore al modelo base en ninguna tarea medible.
- Riesgo elevado de sobreajuste al dataset sintetico de BrowseComp-Plus: el modelo puede reproducir hechos del corpus de entrenamiento y fallar en dominios fuera de distribucion.
- Riesgo de alucinacion: al tratarse de un "memory model", puede generar respuestas con apariencia de recuerdo preciso pero incorrectas, especialmente en consultas que no coinciden con el corpus de entrenamiento.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado y podria haberse degradado respecto al modelo base.
- Longitud de contexto de entrenamiento limitada a 8.096 tokens, muy por debajo de los 32.768 tokens nativos de Qwen2.5-1.5B-Instruct; el rendimiento mas alla de esa longitud no esta garantizado.
- Posible degradacion de capacidades generales (codigo, matematicas, tool calling) tras el ajuste completo sobre un dataset especifico; no evaluado.
- Modelo con 0 descargas y 0 likes: no hay validacion por parte de la comunidad ni reportes de uso en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion es responsabilidad del integrador.
- La fecha de creacion del repositorio (2026-11-11) y la falta de documentacion adicional impiden verificar el estado del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- BrowseComp-Plus (referencia del dataset, no enlazado en la model card): no disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
