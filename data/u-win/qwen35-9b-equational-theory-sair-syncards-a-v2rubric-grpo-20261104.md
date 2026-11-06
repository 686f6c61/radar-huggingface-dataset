# U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104

## Resumen

Qwen3.5-9B equational-theory RL (v2 rubrics, verdict-neutral judge) es un conjunto de checkpoints de un ajuste fino mediante aprendizaje por refuerzo (GRPO asincrono) sobre un modelo base de la familia Qwen3.5 con aproximadamente 9.650 millones de parametros. Lo desarrolla el usuario U-WIN y su proposito es especializar el modelo en la resolucion y evaluacion de problemas de teoria ecuacional, un dominio de las matematicas discretas y la logica algebraica que requiere razonamiento formal y verificacion de enunciados.

El modelo parte de `U-WIN/qwen35-9b-equational-theory-sair-syncards-a-notes50m-cards123-ntp-kl-0p01` y aplica GRPO con recompensas basadas en rubricas, evaluadas por un juez local congelado (Qwen3.8-27B). El entrenamiento se realizo en un nodo HAI B200 con tres GPUs de entrenador, tres de rollout y dos de juez, en modalidad totalmente asincrona. El resultado son trece ramas de checkpoint (`checkpoint-10` a `checkpoint-130`) que representan la politica tras N actualizaciones del optimizador.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de RL con recompensas por rubrica aplicado a razonamiento matematico formal; por otro, aclara que se trata de un artefacto de investigacion con evaluacion interna limitada, no de un modelo listo para produccion. La licencia Apache 2.0 facilita su reutilizacion, pero la ausencia de benchmarks publicos estandar y de documentacion multilingue exige cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con torre visual y cabeza de prediccion multi-token (MTP); el ajuste solo entrena el modelo de lenguaje |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento usa hasta 32.768 tokens de respuesta |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); shards con prefijo `model-untrained-*` para componentes no entrenados |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con capacidad image-text-to-text, lo que implica una torre visual (`model.visual.*`) y una cabeza de prediccion multi-token (`mtp.*`). Durante el ajuste por RL solo se entrena el modelo de lenguaje: 427 tensores entrenados y 348 arrastrados sin cambios desde el inicializador. Los pesos se publican en bf16 y la conversion desde el formato Megatron a HuggingFace se realizo con `miles-upstream/tools/convert_torch_dist_to_hf.py`, dejando un `conversion_manifest.json` con sha256 por shard y la maxima diferencia absoluta frente al inicializador y al checkpoint previo.

El entrenamiento es un GRPO totalmente asincrono (run `lean2nl-megatron-async-s3j2t3-v2rubric-v3-20261104`) con 24 prompts por rollout y 8 muestras por prompt (batch global de 192), temperatura 1.0 y hasta 32.768 tokens de respuesta. Las recompensas provienen de un juez local congelado (Qwen3.8-27B, politica `v2rubric-verdict-neutral-user-rubric-20261104-v3`) que aplica una rubrica generica y devuelve un JSON de dos campos (`assessment` y `score_0_to_7`); la recompensa es score/7. Se eliminan las lineas de veredicto del candidato y no se muestra al juez ni la solucion de referencia ni la etiqueta de verdad. Se aplica filtrado de grupo sobre las calificaciones no resueltas. Los prompts de entrenamiento son 2.182 problemas (todos TRUE, 54 con portador finito) del dataset `U-WIN/equational-theory-lean2nl-references-gpt-approved-v2-rubric`.

## Capacidades

- Generacion de texto conversacional y razonamiento en el dominio de teoria ecuacional (evaluacion de enunciados y problemas algebraicos formales).
- Razonamiento multi-paso con cadenas de respuesta largas (hasta 32.768 tokens durante el entrenamiento).
- Capacidad multimodal image-text-to-text heredada del modelo base (torre visual no entrenada en este ajuste).
- Prediccion multi-token (cabeza MTP heredada, no entrenada).
- Evaluacion con rubrica: el modelo fue optimizado para producir respuestas puntuables por un juez con escala 0-7.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion automatica de problemas de teoria ecuacional: el modelo puede actuar como resolutor de enunciados TRUE/FALSE y generar justificaciones puntuables, aprovechando el ajuste con rubrica y el formato JSON de dos campos.
- Generacion de datos sinteticos para entrenamiento: dado que produce respuestas largas y razonadas, puede emplearse para crear pares problema-respuesta en dominios algebraicos, filtrando despues con un juez.
- Investigacion en RL con recompensas por rubrica: los trece checkpoints permiten estudiar la evolucion de la politica a lo largo de las actualizaciones y comparar curvas de aprendizaje.
- Reproduccion de experimentos de GRPO asincrono: el manifiesto de conversion y las ramas documentadas facilitan replicar el pipeline en entornos Megatron.
- Prototipado de asistentes matematicos especializados: integrable en cuadernos o servicios internos mediante transformers, con contexto suficiente para problemas extensos.
- Analisis de robustez ante enunciados falsos: el modelo fue evaluado con 106 problemas FALSE, lo que permite estudiar su calibracion en deteccion de errores.
- Base para posteriores ajustes supervisados: al estar en bf16 y con licencia Apache 2.0, sirve como punto de partida para SFT o DPO en dominios afines.

## Benchmarks y rendimiento

Los unicos datos publicados son las evaluaciones internas durante el entrenamiento sobre `U-WIN/sair-stage2-nl-verified-v2-rubric` (205 problemas, 99 TRUE y 106 FALSE, 4 muestras por problema), con recompensa media score/7:

| Rollout | Global | Problemas TRUE | Problemas FALSE |
|---|---|---|---|
| 0 | 0,420 | 0,560 | 0,288 |
| 20 | 0,469 | 0,592 | 0,354 |
| 40 | 0,465 | 0,607 | 0,333 |
| 60 | 0,460 | 0,652 | 0,282 |
| 80 | 0,497 | 0,676 | 0,329 |
| 100 | 0,497 | 0,686 | 0,320 |
| 120 | 0,505 | 0,736 | 0,289 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los puntos de evaluacion se toman en identificadores de rollout, por lo que los pesos en uso pueden estar hasta una actualizacion por detras.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19,3 GB solo para pesos (9,65 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- Cuantizacion: no se documentan pesos GGUF ni cuantizados; habria que generarlos a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o B200 para el modelo completo en bf16; en consumer, RTX 4090 (24 GB) puede ser justa para bf16 con contexto corto, y seria necesario cuantizar para contextos largos.
- Despliegue: compatible con transformers; para alto rendimiento se puede servir con vLLM o TGI, aunque no se documenta soporte explicito. llama.cpp y Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento original: nodo HAI B200 con 3 GPUs de entrenador, 3 de rollout y 2 de juez.

## Comparativa con modelos similares

No se dispone de datos publicos de benchmarks para comparar directamente con alternativas. A continuacion se comparan caracteristicas objetivas con modelos de tamano y proposito similares:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-9B equational-theory RL (este) | 9,65 mil M | no disponible | Apache 2.0 | RL con rubrica en teoria ecuacional |
| Qwen2.5-7B-Instruct | 7,6 mil M | 32.768 tokens (ampliable) | Apache 2.0 | Instruccion general |
| Llama 3.1 8B Instruct | 8,0 mil M | 128.000 tokens | Llama 3.1 Community | Instruccion general |
| Mistral 7B Instruct | 7,2 mil M | 32.000 tokens | Apache 2.0 | Instruccion general |

La comparacion de rendimiento no es posible porque este modelo no publica resultados en benchmarks estandar. Su ventaja diferencial es la especializacion en teoria ecuacional y la trazabilidad de checkpoints, no el rendimiento generalista.

## Limitaciones y advertencias

- Es un artefacto de investigacion: trece checkpoints de un unico run, sin validacion externa ni benchmarks estandar.
- La evaluacion interna usa solo 205 problemas y un juez automatico; el rendimiento en problemas FALSE es notablemente inferior al de TRUE (0,289 frente a 0,736 en el rollout 120), lo que indica dificultad para detectar enunciados falsos.
- Riesgo de alucinacion en dominios fuera de la teoria ecuacional, ya que el ajuste RL se concentra en un unico dominio.
- Idiomas soportados no documentados; se desconoce el comportamiento en castellano.
- Contexto maximo no documentado; el entrenamiento usa respuestas de hasta 32.768 tokens, pero no se especifica la ventana total.
- La torre visual y la cabeza MTP no fueron entrenadas en este ajuste; su comportamiento multimodal no esta validado.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantias de calidad ni soporte del autor.
- El juez de recompensa es un modelo local congelado; posibles sesgos del juez pueden haberse transferido a la politica.
- No se publican pesos cuantizados, lo que limita el despliegue en hardware consumer.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104
- Modelo base (inicializador): https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-syncards-a-notes50m-cards123-ntp-kl-0p01
- Dataset de prompts de entrenamiento: https://huggingface.co/datasets/U-WIN/equational-theory-lean2nl-references-gpt-approved-v2-rubric
- Dataset de evaluacion: https://huggingface.co/datasets/U-WIN/sair-stage2-nl-verified-v2-rubric
- Herramienta de conversion Megatron a HuggingFace: miles-upstream/tools/convert_torch_dist_to_hf.py (referenciada en la model card, sin URL directa disponible)
