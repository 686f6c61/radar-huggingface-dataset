# vosldtgbj/project-llm-rlvr-v1-step-50

## Resumen

Project LLM RLVR v1 step 50 es un checkpoint de pesos completos en BF16 publicado por el usuario vosldtgbj, correspondiente al paso 50 de un ciclo de aprendizaje por refuerzo con verificación (RLVR) aplicado sobre el modelo google/gemma-4-12B-it. No es un modelo nuevo ni un entrenamiento desde cero: es un punto intermedio de una trayectoria continua de optimizacion de parametros, cuyo padre directo es vosldtgbj/project-llm-rlvr-v1-step-25 y cuyo sucesor publico es project-llm-rlvr-v1-step-75.

El modelo resuelve tareas verificables de forma automatica: pregunta-respuesta anclada a documentos, razonamiento multi-documento, conflicto temporal y de versiones, salida estructurada, absteccion, recuperacion ante fallos de herramientas y limites de permisos frente a inyeccion de prompt. El entrenamiento RLVR usa GRPO sincrono con 30 grupos de prompt y 16 rollouts por pregunta (480 rollouts por actualizacion), con recompensas generadas por verificadores deterministas y, en algunos contratos, por un juez Nemotron 3 Ultra.

Es relevante porque documenta de forma inusualmente detallada la receta de RLVR (datos, verificadores, hiperparametros, hardware y genealogia de checkpoints), algo poco frecuente en publicaciones abiertas. La arquitectura es Gemma4UnifiedForConditionalGeneration (model_type gemma4_unified), con 48 capas de texto, hidden size 3.840 y vocabulario de 262.144 tokens. El pipeline declarado es any-to-any, pero el entrenamiento de este checkpoint es exclusivamente textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4UnifiedForConditionalGeneration (model_type `gemma4_unified`), transformer denso con torres multimodal congeladas |
| Parametros totales | 11.959.730.224 segun safetensors; la model card declara 12.484.280.320 (discrepancia no explicada) |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible el contexto nativo del modelo base. En RLVR: 8.192 tokens de entrada + 2.048 de generacion = 10.240 tokens totales maximos |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos BF16) |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | gemma (Gemma 4 license, https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | Safetensors BF16 en 5 fragmentos + `model.safetensors.index.json`; incluye config, generation config, tokenizer, processor y chat template |
| Capas de texto | 48 |
| Hidden size | 3.840 |
| Vocabulario | 262.144 tokens |
| Tamano del repositorio | 24,0 GB (23,92 GB decimales, ~22,3 GiB de pesos) |
| Modelo base | vosldtgbj/project-llm-rlvr-v1-step-25 (origen de la rama: google/gemma-4-12B-it) |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso multimodal unificado (Gemma4UnifiedForConditionalGeneration) con 48 capas de texto, hidden size de 3.840 y vocabulario de 262.144 tokens. El entrenamiento de este checkpoint afecta unicamente al modelo de lenguaje textual: las torres de vision y audio y las proyecciones multimodales permanecen congeladas, por lo que las mejoras observadas en la model card se refieren exclusivamente a tareas de texto. Los repositorios de la familia guardan pesos completos ya fusionados, no adaptadores LoRA, de modo que no es necesario ningun merge al cargarlos.

El checkpoint procede de un pipeline en cuatro etapas: continued pretraining sobre el modelo original, SFT v3 (con la vista congelada `official_90_10`: 67.195 registros de entrenamiento y 4.083.167 tokens supervisados de asistente, empaquetados en 5.824 packs de longitud 8.192 con eficiencia de packing 0,9240) y finalmente RLVR v1 con GRPO sincrono. La etapa RLVR usa learning rate 1e-6, 30 grupos de prompt validos por actualizacion, 16 rollouts por prompt, 480 rollouts por paso, temperatura 0.7, top-p 1.0, maximo de 5 turnos de interaccion, PPO ratio clip entre 0,2 y 0,28, ratio de importance sampling truncado de 2,0, penalizacion KL contra la politica de referencia de 0 y optimizador Transformer Engine FusedAdam (betas 0,9/0,999, eps 1e-8, weight decay 0,1, max grad norm 1,0). El muestreo es estandar (Dynamic Sampling desactivado) y el entrenamiento se ejecuto sobre 16 GPU H100 SXM con backend de rollout vLLM en tensor parallel size 2.

Los datos de RLVR provienen del conjunto congelado SF-RLVR-Unified-v2: 30.000 tareas de dominio (derivadas de 104 libros blancos japoneses publicos, con canalizacion independiente de la de CPT y SFT) y 7.500 tareas generales, distribuidas en 15 familias verificables. Cada tarea incluye prompt visible, referencia estructurada oculta, `verifier_id` y `reward_contract_id`; las respuestas se generan en linea con la politica actual y se puntuan con verificadores deterministas o con un juez restringido. La evaluacion bloqueada consta de 4.700 elementos, de los cuales 470 forman el nucleo de validacion, y ninguno participa en el gradiente. Este checkpoint no conserva estado de optimizador, scheduler, aleatoriedad ni shards de FSDP, por lo que sirve para inferencia y como inicializacion, pero no permite reanudar el entrenamiento original de forma exacta.

## Capacidades

- Generacion de texto y razonamiento en japones e ingles, con especial enfasis en tareas ancladas a documentos (single-document grounded QA).
- Razonamiento multi-documento: agregacion y contraste de evidencia procedente de varias fuentes.
- Deteccion de conflictos entre fuentes y de conflictos temporales o de version entre documentos.
- Absteccion y clarificacion: el modelo esta entrenado para no responder cuando la evidencia es insuficiente y para pedir aclaraciones.
- Salida estructurada: generacion de respuestas conformes a esquemas (JSON y similares) verificadas por comprobadores deterministicos.
- Tool calling y trayectorias de agente de hasta 5 turnos de interaccion, con familias de entrenamiento especificas de trayectoria normal y de recuperacion ante fallos de herramientas.
- Resistencia a inyeccion de prompt y respeto de limites de permisos, entrenado como familia verificable independiente.
- Capacidades generales de refuerzo: seguimiento de instrucciones, razonamiento, codigo competitivo, matematicas abiertas, aritmetica y MCQA.
- Multimodalidad declarada a nivel de pipeline (any-to-any, image-text-to-text), pero las torres de vision y audio estan congeladas y no fueron entrenadas en esta etapa, por lo que su comportamiento no esta validado por la model card.

## Casos de uso

- Atencion al cliente automatizada en japones: el modelo puede mantener conversaciones multi-turno de hasta 10.240 tokens totales (8.192 de entrada mas 2.048 de generacion) y esta entrenado para abstenerse o pedir aclaraciones cuando la consulta es ambigua, lo que reduce respuestas inventadas en entornos de soporte.
- Consulta sobre normativa y documentacion tecnica corporativa: dado el entrenamiento anclado a 104 libros blancos japoneses, es adecuado para responder preguntas con referencia a fragmentos concretos de un corpus documental interno.
- Agentes con herramientas en produccion: el soporte de tool calling con hasta 5 turnos y la familia de recuperacion ante fallos permite integrarlo en flujos donde una API puede devolver errores y el agente debe reintentar o reformular.
- Extraccion y normalizacion de datos estructurados: la familia de salida estructurada y los verificadores de esquema lo hacen util para convertir documentos no estructurados en registros JSON validados en pipelines ETL.
- Auditoria de conflictos documentales: la deteccion de conflictos entre fuentes y entre versiones temporales sirve para revisiones de cumplimiento donde hay que senalar contradicciones entre documentos vigentes y obsoletos.
- Asistente interno con control de permisos: al estar entrenado frente a inyeccion de prompt y limites de autorizacion, puede desplegarse en entornos donde el usuario no debe poder escalar privilegios mediante instrucciones maliciosas.
- Generacion de codigo y resolucion de problemas matematicos: las familias de codigo competitivo, matematicas abiertas y aritmetica permiten usarlo como asistente de programacion y de calculo verificable en entornos con comprobador automatico.
- Base para investigacion en RLVR: al ser un checkpoint intermedio con genealogia documentada, sirve como punto de partida reproducible para estudiar el efecto del RL con recompensas verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card advierte de que el reward de rollout registrado en los logs no es una evaluacion offline congelada: depende de la dificultad de los prompts, del muestreo dinamico y de la politica en ese momento, y no permite clasificar checkpoints entre si. La comparacion valida, segun el autor, exige ejecutar el mismo conjunto de evaluacion bloqueado con los mismos parametros de inferencia sobre los 11 puntos de guardado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24 GB solo para los pesos (23,92 GB decimales), mas la cache KV y las activaciones, que no se detallan en la informacion disponible. Con contexto completo de 10.240 tokens la reserva adicional es significativa.
- GPU profesionales: cabe con holgura en A100 40 GB y 80 GB, H100 80 GB y A6000 48 GB. El entrenamiento original se realizo sobre 16 H100 SXM con vLLM en tensor parallel size 2.
- GPU de consumo: no cabe de forma holgada en una RTX 4090 de 24 GB en BF16, ya que los pesos por si solos ocupan casi toda la memoria. Seria necesario cuantizar (no hay versiones cuantizadas publicadas) u operar con offloading.
- Opciones de despliegue: transformers y vLLM estan confirmados implicitamente (vLLM se uso como backend de rollout en el entrenamiento). Ollama, llama.cpp, TGI y TensorRT-LLM no aparecen confirmados en la informacion proporcionada y requeririan conversion a GGUF o a otros formatos no publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos externos comparables en la informacion proporcionada. La comparacion mas util es interna a la propia trayectoria de entrenamiento:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| project-llm-rlvr-v1-step-50 | 11.959.730.224 (safetensors) | 10.240 tokens en RLVR (entrada + generacion) | Sin eval congelada publicada | gemma | Repositorio publico, 0 descargas |
| project-llm-rlvr-v1-step-25 (padre) | No disponible | No disponible | Sin eval congelada publicada | gemma | Repositorio publico |
| project-llm-rlvr-v1-step-75 (sucesor) | No disponible | No disponible | Sin eval congelada publicada | gemma | Repositorio publico |
| google/gemma-4-12B-it (origen) | No disponible | No disponible | No disponible en esta informacion | gemma | Publicado por Google |

Todos los checkpoints de la trayectoria comparten estructura, licencia y regimen de inferencia; las diferencias son exclusivamente los valores de los parametros tras 25, 50 y 75 actualizaciones de optimizador. Sin una evaluacion congelada comun no es posible ordenarlos por calidad.

## Limitaciones y advertencias

- Este checkpoint no ha sido validado con una evaluacion offline congelada; el reward de rollout no es comparable entre checkpoints ni sirve como metrica de calidad absoluta.
- Riesgo de alucinacion: aunque el entrenamiento incluye familias de absteccion y de anclaje documental, no hay datos publicados que cuantifiquen la tasa de invencion en produccion.
- Cobertura idiomatica limitada a japones e ingles; el comportamiento en castellano u otros idiomas no esta documentado ni validado.
- El entrenamiento cubre solo texto: las torres de vision y audio permanecen congeladas, por lo que las capacidades any-to-any declaradas en el pipeline no estan respaldadas por esta etapa de entrenamiento.
- No se publican pesos cuantizados, lo que dificulta el despliegue en GPU de consumo y en entornos con VRAM limitada.
- El repositorio no conserva estado de optimizador, scheduler, aleatoriedad ni shards de FSDP/DTensor: es imposible reanudar el entrenamiento original de forma bit a bit.
- Licencia gemma: el uso comercial esta sujeto a los terminos de la licencia de Gemma 4, que imponen obligaciones adicionales de atribucion y de uso aceptable. Hay que revisarlos antes de cualquier despliegue productivo.
- Trazabilidad limitada: el autor es un usuario individual sin historial publico conocido, el repositorio tiene 0 descargas y 0 likes, y la model card esta redactada principalmente en chino, lo que dificulta la revision independiente.
- Discrepancia entre el recuento de parametros de safetensors (11.959.730.224) y el declarado en la model card (12.484.280.320); conviene verificar la configuracion antes de dimensionar infraestructura.
- Las tareas de dominio se construyeron sobre 104 libros blancos japoneses; el rendimiento fuera de ese dominio no esta caracterizado en la informacion disponible.
- Parte de las recompensas dependen de un juez (Nemotron 3 Ultra desplegado en konst154); si se reutiliza el pipeline de evaluacion, hay que replicar ese componente o sustituirlo por verificadores deterministas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-50
- Modelo base directo (step 25): https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-25
- Siguiente checkpoint publico (step 75): https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-75
- Dataset SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR unificado v2: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset RLVR de dominio v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Documentacion de TensorRT-LLM (opcion de despliegue no confirmada para este modelo): https://nvidia.github.io/TensorRT-LLM/
- Material general sobre RLVR (contexto del metodo, no especifico del modelo): https://fourweekmba.com/the-four-stages-of-ai-training-from-pretraining-to-rlvr/
