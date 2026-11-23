# TravelDistillation/Travel-gemma3_1b_RCAEval_2_kd

## Resumen

Travel-gemma3_1b_RCAEval_2_kd es un adaptador LoRA (PEFT) entrenado mediante DPO sobre el modelo base google/gemma-3-1b-it. Lo publica el usuario TravelDistillation en Hugging Face y forma parte de un conjunto de experimentos de destilación de preferencias: el dataset de entrenamiento, `preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it`, sugiere que se generaron pares de preferencia comparando las respuestas del modelo pequeño (1B) con las de un modelo mayor de la misma familia (4B) sobre un conjunto de evaluación denominado RCAEval_2.

El modelo no es un modelo completo, sino un adaptador que debe cargarse junto con el base Gemma 3 1B instruction-tuned. Su interés es acotado: sirve como referencia de un pipeline de alineación por DPO sobre un modelo de 1B parámetros, útil para quien quiera reproducir o extender técnicas de destilación de preferencias en entornos con recursos limitados. La model card es prácticamente automática y no aporta descripción, datos de evaluación ni resultados.

No se dispone de información sobre idiomas soportados, composición del dataset ni métricas de rendimiento. Cualquier uso en producción debe considerar que se trata de un artefacto experimental sin validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con adaptador LoRA sobre el base |
| Parametros totales | ~1B (modelo base google/gemma-3-1b-it); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Gemma 3 1B, no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización aplicaría al base) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors |
| Modelo base | google/gemma-3-1b-it |
| Metodo de ajuste | DPO con LoRA (TRL + PEFT) |
| Dataset de entrenamiento | data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it |
| Tamaño del repo | 2.2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 3 1B instruction-tuned, un transformer decoder-only de la familia Gemma 3. El ajuste se realizó con DPO (Direct Preference Optimization) usando LoRA mediante las librerías TRL y PEFT. Los hiperparámetros declarados en la model card son: learning rate 5e-05, batch size de entrenamiento 1 con acumulación de gradiente de 8 (batch efectivo 8), optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), scheduler coseno con warmup del 10 %, una sola época y semilla 42. Las versiones de framework indicadas son PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132, Datasets 5.1.0 y Tokenizers 0.23.3.

El dataset de preferencias se denomina `preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it`, lo que indica que los pares se construyeron contrastando respuestas del modelo de 1B con las de gemma-3-4b-it sobre el conjunto RCAEval_2. No se especifica el número de pares, la composición temática, el criterio de etiquetado de preferencias ni si hubo filtrado. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.); el adaptador hereda la arquitectura del base sin modificaciones.

## Capacidades

- Generación de texto conversacional, heredada del base Gemma 3 1B instruction-tuned.
- Alineación de preferencias mediante DPO: el adaptador está pensado para acercar el estilo y las respuestas del 1B a las del 4B en el dominio de evaluación RCAEval_2.
- Soporte de chat multi-turno en el formato de plantilla de Gemma 3 (no verificado en la información disponible).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles; el adaptador es de tipo `gemma3_text` y no incorpora componentes multimodales.

## Casos de uso

- Reproducción de experimentos de DPO en modelos pequeños: cargar el adaptador con PEFT sobre google/gemma-3-1b-it permite replicar el pipeline de entrenamiento con los hiperparámetros documentados y comparar con el base sin ajustar.
- Destilación de preferencias de un modelo mayor a uno menor: el dataset de pares 1B vs 4B sugiere su uso como referencia para estudiar cómo transferir el comportamiento de un modelo de 4B a uno de 1B en tareas de evaluación concretas.
- Investigación sobre alineación con recursos limitados: al tratarse de un adaptador LoRA sobre 1B, se puede entrenar y evaluar en una única GPU consumer, lo que facilita experimentos académicos repetibles.
- Evaluación comparativa de adaptadores: útil como punto de partida para medir el efecto de DPO frente a SFT en el mismo base y con el mismo conjunto de evaluación.
- Prototipado de asistentes conversacionales ligeros: el base de 1B con el adaptador puede desplegarse en entornos con poca VRAM para pruebas de concepto, siempre que se valide antes la calidad de las respuestas.
- Generación de datos sintéticos de preferencia: el adaptador puede emplearse para producir respuestas candidatas que luego se filtren y se usen en rondas adicionales de DPO o RLHF.

## Benchmarks y rendimiento

La model card declara un `model-index` con `results: []`, es decir, sin resultados de benchmarks. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa 2.2 GB en el repositorio, pero la inferencia requiere cargar además el modelo base google/gemma-3-1b-it (~2 GB en bf16/fp16).
- VRAM estimada para inferencia en bf16/fp16: en torno a 4-6 GB incluyendo base, adaptador y caché KV (estimación orientativa; no confirmada por el autor).
- VRAM estimada en cuantización de 4 bits del base: aproximadamente 2-3 GB (estimación orientativa; la cuantización del adaptador no está documentada).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070) para bf16; A100/H100 no son necesarias para un modelo de 1B.
- Despliegue: transformers + PEFT para cargar el adaptador; vLLM, TGI o llama.cpp/Ollama requerirían fusionar el adaptador con el base o soporte específico de adaptadores LoRA, no documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travel-gemma3_1b_RCAEval_2_kd | ~1B + LoRA | no disponible | Adaptador DPO sobre Gemma 3 1B | gemma | Hugging Face (0 descargas) |
| google/gemma-3-1b-it | ~1B | no disponible en esta ficha | Modelo base instruction-tuned | gemma | Hugging Face (oficial) |
| google/gemma-3-4b-it | ~4B | no disponible en esta ficha | Modelo base instruction-tuned | gemma | Hugging Face (oficial) |
| Adaptadores DPO comunitarios sobre Gemma 3 1B | ~1B + LoRA | variable | Adaptadores PEFT | gemma | Hugging Face (comunidad) |

La comparación relevante es contra el base sin ajustar y contra el 4B usado como referencia en el dataset. No hay datos de rendimiento que permitan cuantificar la mejora del adaptador frente al base.

## Limitaciones y advertencias

- Model card generada automáticamente: no incluye descripción, usos previstos, limitaciones ni datos de evaluación; el autor no ha completado la documentación.
- Sin benchmarks publicados: no es posible verificar que el adaptador mejore al base en ninguna tarea.
- Dataset de preferencias no documentado: se desconoce el número de pares, su calidad, el criterio de anotación y si hubo filtrado, lo que impide evaluar sesgos introducidos.
- Riesgo de alucinación heredado del base de 1B, que es elevado en modelos de este tamaño; el DPO no corrige este problema de forma sistemática.
- Idiomas soportados no declarados: no se puede asumir un comportamiento multilingüe fiable.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; revisar antes de desplegar.
- Sin validación en producción: cero descargas y cero likes en el momento de la ficha; no hay evidencia de uso real.
- El adaptador no incluye los pesos del base; es necesario descargar google/gemma-3-1b-it por separado y aceptar su licencia.
- No se especifica la longitud de contexto efectiva tras el ajuste; asumir la del base sin confirmación puede provocar degradación en contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TravelDistillation/Travel-gemma3_1b_RCAEval_2_kd
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Modelo de referencia del dataset: https://huggingface.co/google/gemma-3-4b-it
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL (DPO): https://huggingface.co/docs/trl
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
