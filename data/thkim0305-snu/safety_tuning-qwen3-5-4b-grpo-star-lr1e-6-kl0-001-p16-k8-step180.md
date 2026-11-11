# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step180

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR es un checkpoint de ajuste fino orientado a seguridad del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por el usuario thkim0305-SNU. El modelo parte de la base Qwen3.5-4B (4.659.865.088 parametros segun los pesos en safetensors) y se ha entrenado mediante GRPO (Group Relative Policy Optimization) sobre los conjuntos de datos STAR-1 y STAR-benign-915, con un modelo profesor Qwen3.8-27B encargado de puntuar las respuestas y una referencia congelada del modelo original.

El objetivo del entrenamiento es el alineamiento de seguridad: reducir respuestas daninas o inseguras manteniendo la capacidad conversacional y multimodal del modelo base. La configuracion registrada incluye learning rate de 1e-6, coeficiente KL de 0.001, 16 prompts por actualizacion y 8 respuestas por prompt, con 180 actualizaciones de optimizador completadas. El checkpoint exportado corresponde a la iteracion nativa 179 (indexada desde cero) de la ejecucion `qwen35-star-grpo-4gpu-resume90-trailingjson-20261108-v8`.

Es relevante ahora porque ejemplifica una practica creciente: aplicar RL con recompensas basadas en un modelo juez para alinear modelos multimodales de tamano medio (4B) en lugar de depender exclusivamente de SFT o RLHF clasico. La licencia Apache 2.0 facilita su reutilizacion comercial, aunque la model card no aporta ninguna evaluacion cuantitativa de seguridad ni de rendimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con vision encoder y modulo MTP (multi-token prediction) no entrenado |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B base: un transformer multimodal con torre de vision para entrada image-text-to-text, mas un modulo MTP (multi-token prediction) que, segun la model card, no fue entrenado y se conserva del checkpoint original fijado en la revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. Todos los tensores de texto entrenados se exportan desde el checkpoint nativo; los tensores de vision y los MTP no entrenados se mantienen intactos del modelo base.

El entrenamiento usa GRPO con prompts del dataset STAR-1 y del conjunto benigno STAR-benign-915. Las recompensas provienen de un modelo profesor Qwen3.8-27B que puntua las respuestas, mientras que una copia congelada del modelo original actua como referencia para la penalizacion KL (coeficiente 0.001). La configuracion registrada es lr=1e-6, 16 prompts por actualizacion, 8 respuestas por prompt y 180 pasos de optimizador. La model card documenta dos incidencias de linaje: el prompt de pie de juez cambio tras la actualizacion 44, y la ejecucion reanudada desde el paso 90 acepta un JSON de puntuacion plano final despues del texto del profesor. La conversion a safetensors se verifico con conversion inversa exacta de cada tensor de texto, comprobacion de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-4B.
- Entrada multimodal image-text-to-text: procesa imagenes junto con texto mediante el pipeline declarado.
- Razonamiento y respuesta a prompts de seguridad, con comportamiento alineado hacia respuestas mas seguras segun el entrenamiento GRPO.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Modo thinking explicito: no disponible en la informacion.
- Capacidades de audio: no disponibles.

## Casos de uso

- Filtrado y moderacion de respuestas en asistentes conversacionales: el ajuste GRPO sobre STAR-1 y STAR-benign-915 esta disenado para que el modelo rechace o reformule peticiones daninas; puede usarse como capa de generacion segura en chatbots de atencion al cliente.
- Investigacion en alineamiento con RL: sirve como checkpoint reproducible para estudiar el efecto de GRPO con juez externo (Qwen3.8-27B) y penalizacion KL sobre un modelo de 4B, comparando con el base.
- Evaluacion de robustez en seguridad multimodal: al aceptar image-text-to-text, permite probar si el ajuste de seguridad se mantiene cuando la peticion danina llega acompanada de una imagen.
- Prototipado de asistentes con vision en entornos controlados: descripcion de imagenes, respuesta a preguntas sobre capturas o documentos escaneados, con un modelo de 4B desplegable en una sola GPU.
- Generacion de datos benignos sinteticos: el checkpoint puede producir respuestas seguras para aumentar conjuntos de entrenamiento en tareas de moderacion, dado su ajuste hacia el conjunto STAR-benign-915.
- Base para experimentos de destilacion o comparacion de politicas: al estar publicado en safetensors con verificacion de conversion, se integra directamente en pipelines de transformers para comparar politicas antes y despues del RL.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin las restricciones de otros modelos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no afirma ninguna puntuacion de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,3 GB en fp16/bf16 (coincide con el tamano del repo de 9,3 GB); en cuantizacion de 8 bits, en torno a 5 GB; en 4 bits, en torno a 3 GB (estimaciones a partir del numero de parametros, no verificadas en el repo).
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia; L40S o A10G para despliegue en cloud; RTX 4090 (24 GB) para inferencia en bf16 sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 y tarjetas con 12 GB o mas en cuantizacion de 8 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servicio; llama.cpp/Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR (este) | 4,66B | no disponible | image-text-to-text | Apache 2.0 | Ajuste GRPO de seguridad, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4,66B | no disponible | image-text-to-text | Apache 2.0 | Modelo original sin ajuste de seguridad; referencia congelada del entrenamiento |
| Otros ajustes de seguridad de la familia Qwen de 4B | no disponible | no disponible | texto o multimodal | variable | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No hay evaluaciones publicadas: la model card no aporta metricas de seguridad, sesgo ni calidad, por lo que no se puede verificar que el ajuste reduzca dano sin degradar capacidades.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado tras el ajuste GRPO.
- El juez del RL es un modelo (Qwen3.8-27B), no evaluacion humana; el modelo puede aprender a satisfacer al juez y no a un criterio de seguridad real (reward hacking).
- Cambios de configuracion a mitad de entrenamiento: el prompt de pie de juez cambio tras el paso 44 y la reanudacion desde el paso 90 altera el formato de salida, lo que complica la reproducibilidad exacta.
- El modulo MTP y la torre de vision no fueron entrenados; el comportamiento multimodal es el del modelo base y el ajuste de seguridad solo afecta a los tensores de texto.
- Idiomas soportados y longitud de contexto no declarados: no se puede asumir cobertura multilingue ni ventanas largas.
- Sin variantes cuantizadas publicadas: el despliegue en hardware limitado requiere conversion manual a GGUF o AWQ/GPTQ.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion de seguridad requiere validacion propia.
- Procedencia del modelo base: la revision fijada es `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, y cualquier divergencia con esa revision invalida la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step180
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
