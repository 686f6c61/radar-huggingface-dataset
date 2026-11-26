# vae122/poi-video-match-qwen3-8b-lora

## Resumen

POI video match es un adaptador LoRA sobre Qwen3-8B publicado por el usuario vae122 en Hugging Face. Su proposito es resolver una tarea concreta de emparejamiento: dado un video de servicios locales (con titulo, transcripcion ASR y OCR opcional) y un unico producto candidato descrito por titulo, SKU y detalles, el modelo debe decidir si ese producto corresponde al video. La salida se reduce a una clasificacion binaria de dos etiquetas (`A` = coincide, `B` = no coincide), evaluada a partir de los logits del siguiente token.

El adaptador se construye sobre Qwen3-8B, un modelo de 8.000 millones de parametros con plantilla de chat propia, y se entrena con PEFT con supervision unicamente sobre el ultimo turno del asistente y con `enable_thinking=False`. El repositorio contiene solo los pesos del adaptador (0,2 GB), no los pesos fusionados del modelo base, por lo que requiere descargar Qwen3-8B por separado.

Su relevancia es acotada pero clara: es un ejemplo de ajuste fino de un LLM generalista para una tarea de matching dentro de un pipeline de recuperacion y ranking, no un modelo de proposito general. La model card es explicita en que la recuperacion, la fusion de rankings, la validacion de listados y la deduplicacion las implementa la aplicacion, no el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | 8.000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parametros. El entrenamiento emplea LoRA con supervision restringida al ultimo turno del asistente, lo que concentra la senal de aprendizaje en la decision A/B y evita que el modelo aprenda a reproducir el prompt. La plantilla utilizada es la de chat de Qwen3 con `enable_thinking=False`, es decir, sin modo de razonamiento extendido. El checkpoint evaluado es el `checkpoint-387` del entrenamiento original.

La innovacion tecnica principal no esta en la arquitectura sino en la interfaz de inferencia: en lugar de generar texto y parsearlo, se leen los logits del siguiente token para las etiquetas `A` y `B` y se calcula `softmax([logit_A, logit_B])[0]` como probabilidad de coincidencia. Esto convierte un LLM generativo en un clasificador binario calibrado y determinista, lo que simplifica la integracion en un pipeline. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion binaria de coincidencia entre la descripcion de un video de servicios locales y un producto candidato (etiquetas `A`/`B`).
- Procesamiento conjunto de multiples campos de entrada: reglas de matching, titulo del video, transcripcion ASR, OCR opcional y datos del producto (titulo, SKU, detalles).
- Salida de probabilidad calibrada mediante softmax sobre los logits de `A` y `B`, apta para umbralizacion en produccion.
- Operacion en modo sin razonamiento (`enable_thinking=False`), lo que reduce latencia frente al modo thinking de Qwen3.
- Carga mediante Transformers + PEFT + Accelerate con `PeftModel.from_pretrained`.
- No soporta, segun la informacion disponible, tool calling, agentes, vision, audio ni generacion de texto libre como capacidades entrenadas.
- Capacidad multilingue limitada al chino (zh) segun los metadatos del repositorio.

## Casos de uso

- Emparejamiento producto-video en marketplaces de servicios locales: el adaptador recibe la ficha del video y un candidato y devuelve la probabilidad de coincidencia, que el pipeline usa para aceptar o descartar el candidato antes de mostrarlo al usuario.
- Filtrado de candidatos en un sistema de recuperacion: tras una etapa de retrieval que devuelve N productos por video, el adaptador actua como re-ranker binario por pares, descartando falsos positivos antes de la fusion de rankings.
- Validacion de listados generados automaticamente: cuando un pipeline extrae productos de un video, el adaptador verifica que el producto asignado corresponde realmente al contenido descrito en titulo, ASR y OCR.
- Moderacion de calidad de catalogo: deteccion de asociaciones erroneas entre videos y SKUs en inventarios grandes, priorizando la revision manual de los pares con probabilidad cercana al umbral.
- Deduplicacion asistida de grupos de listados: combinado con la logica de deduplicacion de la aplicacion, el adaptador ayuda a decidir si dos listados apuntan al mismo producto subyacente.
- Verificacion de precios hablados frente a ficha de producto: el modelo aporta la senal de coincidencia semantica entre la descripcion hablada (ASR) y los detalles del producto, mientras la comprobacion numerica la realiza el pipeline.
- Experimentacion academica sobre clasificacion con LLM: util como referencia de como convertir un LLM de 8B en un clasificador binario mediante LoRA y lectura de logits, sin generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el modelo base Qwen3-8B en bf16 requiere aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; el adaptador anade un coste marginal (0,2 GB en disco).
- GPU recomendadas: no especificadas por el autor. Para bf16, GPUs con 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100) permiten cargar el modelo base con margen; en FP8 o cuantizacion de 4 bits cabria en GPUs de 12-16 GB, aunque el autor no documenta soporte de cuantizacion para este adaptador.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16; en GPUs de 12-16 GB solo con cuantizacion no documentada.
- Opciones de despliegue: la model card solo documenta Transformers + PEFT + Accelerate. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el uso de logits A/B requeriria acceso a logits crudos, lo que complica el despliegue en servidores que solo exponen texto generado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| poi-video-match-qwen3-8b-lora | 8B (base) + LoRA | no disponible | Matching binario producto-video | no disponible | Hugging Face (adaptador) |
| Qwen3-8B (base) | 8B | no disponible en esta ficha | Proposito general, chat, razonamiento | no disponible en esta ficha | Hugging Face |
| Adaptadores LoRA especializados en clasificacion | Variable | Variable | Clasificacion de pares | Variable | Hugging Face |

No se dispone de datos de rendimiento ni de modelos comparables directamente equivalentes en la informacion proporcionada; la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- El adaptador solo clasifica pares video-producto; no realiza recuperacion, ranking, deduplicacion ni comprobacion de precios, tareas que la model card atribuye explicitamente a la aplicacion.
- Esta entrenado y etiquetado para chino (zh); su comportamiento en castellano u otros idiomas no esta documentado.
- La licencia no esta declarada en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo relevante para produccion.
- El repositorio no incluye videos, registros ASR/OCR, snapshots de productos ni datasets de entrenamiento, por lo que no es posible reproducir el entrenamiento ni auditar la distribucion de datos.
- El rendimiento depende de la plantilla de chat de Qwen3 y de los presupuestos de campos del prompt original; desviarse de ellos puede degradar la calibracion de la probabilidad A/B.
- Riesgo de alucinacion no aplicable en el sentido clasico (no genera texto), pero si de calibracion erronea: probabilidades cercanas a 0,5 deben tratarse con cautela y derivarse a revision.
- Sesgos conocidos: no documentados. Al entrenarse sobre datos propietarios no publicados, no puede evaluarse el sesgo hacia categorias, regiones o tipos de servicio concretos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por terceros.
- El checkpoint evaluado es `checkpoint-387`; otros checkpoints del entrenamiento podrian comportarse de forma distinta y no estan documentados.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/vae122/poi-video-match-qwen3-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este adaptador.
