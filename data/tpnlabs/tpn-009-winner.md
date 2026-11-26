# tpnlabs/tpn-009-winner

## Resumen

TPN-009 Winner es una cuantización GGUF del modelo `google/gemma-4-26B-A4B-it`, publicada por tpnlabs como artefacto ganador (rank-1) de la competición de mineros TPN-009. No se trata de un modelo entrenado desde cero, sino de una compresión del Gemma 4 26B-A4B original, un transformer con mezcla de expertos (MoE) de 25.233 millones de parámetros totales, seleccionada por su equilibrio entre fidelidad al modelo base y rendimiento medido en la infraestructura True Performance Network.

El interés del artefacto reside en su reducción de huella: pasa de 48,10 GiB de ficheros fuente a un único GGUF de 11,46 GiB, y de 51,20 GiB de VRAM medida en el modelo base a 13,96 GiB en la comparación a 2.048 tokens de contexto. Esto lo sitúa en el rango de GPU de consumo alto y estaciones de trabajo con una sola GPU profesional, algo relevante para despliegues locales de un MoE de 26B.

La model card documenta métricas de fidelidad (KL similarity del 50,51% frente al base, divergencia KL media de 0,6829 nats, ratio de perplejidad de 0,3948x) y una puntuación de Fluid Knowledge del 88,36% sobre 1.400 ítems zero-shot. Conviene subrayar que el propio autor advierte que estas métricas no equivalen a capacidad general ni a precisión en tareas, y que la comparación de runtime se clasificó como divergente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), arquitectura `gemma4` |
| Parametros totales | 25.233.142.046 (25,23B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como spec del modelo; evaluado a 8.192 tokens en Fluid Knowledge y 2.048 en fidelidad |
| Tipos de cuantizacion | GGUF (fichero único `model.gguf`, 11,46 GiB); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | google/gemma-4-26B-A4B-it (revisión 4d7ae4984b7db7de8f8457170b3f1a419ee76d52) |
| Capas transformer | 30 |
| Tamano del artefacto | 12.301.636.864 bytes (11,46 GiB) |
| Runtime evaluado | llama.cpp Python 0.3.36 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE de la familia Gemma 4, con 30 capas transformer y 25,23B parámetros totales; el sufijo A4B del nombre del base sugiere del orden de 4B parámetros activos por token, aunque el dato exacto no se detalla en la información disponible. El artefacto publicado no incorpora entrenamiento adicional: es una cuantización del base, generada con `imatrix` (según los tags del repositorio) y optimizada mediante la competición TPN-009, que selecciona la variante con mejor puntuación combinada de conocimiento y fidelidad.

No se dispone de información sobre el dataset de entrenamiento original (número de tokens, composición, fases de RLHF/DPO) ni sobre innovaciones de decodificación especulativa o atención lineal en esta ficha. El proceso de cuantización sí está documentado en su protocolo de evaluación: comparación contra el base en Transformers 5.14.0 / PyTorch 2.11.0+cu128 en bfloat16, con llama.cpp como runtime GGUF, contexto de 2.048 tokens y stride de 1.024, sobre 60 documentos y 91 ventanas (92.960 tokens puntuados de 124.764 procesados) y 4.096 muestras de activación con semilla 28.445, ejecutado en una NVIDIA B200.

## Capacidades

- Generación de texto conversacional, con plantilla de chat propia y soporte de modo thinking (desactivado en las evaluaciones cuando el runtime lo permite).
- Razonamiento y respuesta zero-shot: la evaluación Fluid Knowledge emplea 1.400 ítems zero-shot con formato de respuesta exacto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión: no cubierta; la model card indica explícitamente que las evaluaciones abarcan solo cargas de texto y no un proyector visual ni configuración multimodal.
- Servido compatible con OpenAI mediante `llama-server`.

## Casos de uso

- Despliegue local de un MoE de 26B en una sola GPU: con 13,96 GiB de VRAM medida a 2.048 tokens de contexto, cabe en tarjetas de 24 GB (RTX 4090, RTX 3090, A5000) y en profesionales de 40-80 GB con margen para contextos mayores, lo que permite experimentar con un modelo de escala 26B sin clúster.
- Asistente conversacional autoalojado: la plantilla de chat y el soporte de `llama-server` con endpoint compatible con OpenAI permiten montar un servicio interno de atención o productividad sin depender de APIs externas.
- Prototipado e investigación de cuantizaciones: el artefacto incluye métricas reproducibles de fidelidad (KL, perplejidad, NRMSE por capa) que sirven como referencia para comparar otras compresiones del mismo base.
- Evaluación de razonamiento zero-shot en pipelines de benchmark: el formato de respuesta exacto y la configuración documentada (temperatura 0, semilla 0, 8.192 tokens de contexto) hacen el setup replicable para pruebas internas.
- Generación de texto por lotes en entornos con presupuesto de memoria ajustado: el ratio de perplejidad de 0,3948x frente al base indica una distribución de probabilidad más concentrada, útil cuando se prioriza velocidad y huella sobre fidelidad estricta.
- Nodos de inferencia en infraestructuras distribuidas: el tamaño de 11,46 GiB facilita el despliegue en múltiples nodos o en máquinas con almacenamiento y ancho de banda limitados, frente a los 48,10 GiB del base.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Fluid Knowledge (1.400 ítems zero-shot, epoch-000003) | 88,36% (0,883571) |
| Formato de respuesta válido | 96,50% |
| Formato de respuesta estricto | 96,43% |
| KL similarity base -> candidato | 50,51% |
| Divergencia KL media base -> candidato | 0,6829 nats |
| Ratio de perplejidad base -> candidato | 0,3948x |
| NRMSE medio de hidden states (30 capas) | 0,212145 |
| NRMSE máximo de hidden states | 0,490773 |
| VRAM medida a contexto de 2.048 tokens | 13,96 GiB |
| KL similarity base -> control sin cuantizar | 70,95% |
| KL similarity control -> candidato | 50,56% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que KL similarity es `exp(-mean KL)` y no una precisión, y que la menor perplejidad del candidato no constituye por sí misma evidencia de mayor capacidad general.

## Requisitos de hardware

- VRAM medida: 13,96 GiB tras la carga a 2.048 tokens de contexto en el arnés de comparación; el autor aclara que no es un mínimo universal y que varía con contexto, precisión de caché, batch y runtime.
- VRAM del base para referencia: 51,20 GiB en las mismas condiciones.
- GPU recomendadas: NVIDIA B200 fue la empleada en la evaluación; por huella, resultan adecuadas RTX 4090/3090 (24 GB), A5000/A6000, L40S y A100/H100 con margen amplio para contextos largos.
- GPU de consumo: sí cabe en tarjetas de 24 GB; en 16 GB el margen es muy ajustado y dependerá del contexto y del offload.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, interfaces de llama.cpp). No se documenta soporte de vLLM o TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TPN-009 Winner | 25,23B (MoE) | no disponible | GGUF, 11,46 GiB | Apache 2.0 | Cuantización rank-1 de TPN-009 |
| google/gemma-4-26B-A4B-it | 25,23B (MoE) | no disponible | safetensors, 48,10 GiB | Apache 2.0 | Modelo base de referencia |
| Control sin cuantizar (mismo base) | 25,23B (MoE) | no disponible | GGUF | Apache 2.0 | Conversión sin cuantizar usada para separar el efecto del runtime |

No se dispone de comparación con otras cuantizaciones públicas del mismo base; el autor indica explícitamente que no reclama tal comparación.

## Limitaciones y advertencias

- Fluid Knowledge mide una única epoch fijada; no refleja capacidad general, seguridad ni fiabilidad factual en todos los contextos.
- La fidelidad se mide sobre un corpus fijo y no es intercambiable con precisión en tareas ni con la puntuación de ranking de la competición.
- El acuerdo de runtime se clasificó como divergente: la comparación base-candidato incluye la diferencia Transformers-llama.cpp, y el arnés detectó políticas distintas de token de inicio de secuencia (se usó la del base para puntuar).
- El ratio de perplejidad de 0,3948x no debe interpretarse como mejora de capacidad; puede reflejar una distribución más concentrada.
- Solo se evalúan cargas de texto; no hay proyector visual ni configuración multimodal validada.
- Idiomas soportados no documentados; el rendimiento fuera del inglés no está verificado.
- Sesgos conocidos y riesgo de alucinación: no documentados específicamente en la información disponible; aplican los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base de Google.
- El artefacto publicado es una copia del envío original (`asura625/g26x-a36`); la evidencia de benchmark está ligada al SHA-256 evaluado, no al nombre del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tpnlabs/tpn-009-winner
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Envío original: https://huggingface.co/asura625/g26x-a36
- Resultados públicos de la competición TPN-009: https://stats.trueperformancenetwork.com/competition?id=tpn-009
