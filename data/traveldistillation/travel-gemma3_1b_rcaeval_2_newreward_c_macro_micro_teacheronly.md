# TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_TeacherOnly

## Resumen

Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_TeacherOnly es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base google/gemma-3-1b-it. Lo desarrolla el usuario TravelDistillation y se distribuye como un repositorio PEFT de 2,2 GB que contiene unicamente los pesos del adaptador, no el modelo completo. El nombre sugiere un experimento de destilacion de preferencias desde un modelo profesor gemma-3-4b-it hacia el modelo alumno de 1B, empleando un conjunto de pares de preferencia derivado de la evaluacion RCAEval_2 y una funcion de recompensa configurable en modo macro/micro.

El modelo hereda la arquitectura transformer decoder-only de Gemma 3 en su variante de texto de 1B parametros, con la ventana de contexto de 32 000 tokens que Google asigna a esta familia. Su interes practico es acotado: se trata de un artefacto de investigacion para estudiar alineamiento por preferencias en modelos pequenos, no de un modelo listo para produccion. La model card es practicamente vacia (generada automaticamente por el Trainer) y no documenta datos de entrenamiento, evaluacion ni casos de uso previstos.

No hay resultados de benchmarks publicados ni descargas registradas en el momento de redactar esta ficha. La relevancia actual es, por tanto, la de un ejemplo reproducible de pipeline DPO con TRL y PEFT sobre Gemma 3 1B, util para quien quiera replicar tecnicas de destilacion de preferencias con profesor de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), adaptador LoRA sobre google/gemma-3-1b-it |
| Parametros totales | Aproximadamente 1 000 millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (heredada de Gemma 3 1B; no confirmada de forma explicita en la model card) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite int8, int4 y GGUF via herramientas externas |
| Idiomas soportados | No disponible (la model card no los declara; el modelo base Gemma 3 es multilingue) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (adaptador PEFT); requiere fusion o carga junto al modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-1b-it, un transformer decoder-only con atencion por ventanas deslizantes y completas alternadas, normalizacion RMSNorm y activacion GeGLU, tal como define la familia Gemma 3. El entrenamiento se realizo con DPO mediante TRL y PEFT 0.21.3, sobre el dataset `data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it`, que por su nombre contiene pares de preferencia generados comparando las respuestas del modelo de 1B con las del modelo profesor gemma-3-4b-it en el marco de evaluacion RCAEval_2.

Los hiperparametros documentados son: learning rate 5e-5, batch efectivo de 8 (batch 1 con 8 pasos de acumulacion), una sola epoca, scheduler coseno con 10 % de warmup, semilla 42 y optimizador AdamW con betas (0,9; 0,999). No se especifica el rango ni el alpha de LoRA, ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset. El sufijo "TeacherOnly" del nombre indica que las preferencias se construyeron unicamente a partir de las salidas del profesor, sin comparacion con el alumno en el bucle de generacion.

## Capacidades

- Generacion de texto conversacional en el estilo y los idiomas del modelo base Gemma 3 1B instruct.
- Alineamiento por preferencias orientado a las respuestas del profesor gemma-3-4b-it en el dominio de evaluacion RCAEval_2.
- Razonamiento basico y respuesta a instrucciones heredados del modelo base, con el sesgo adicional introducido por el DPO.
- Soporte de tool calling y function calling: no documentado para este adaptador; depende de lo que ofrezca el modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no declaradas en la model card; heredadas del modelo base en la medida en que el DPO no las degrade.
- Modo thinking, vision o audio: no disponibles en esta variante (el adaptador es solo de texto).

## Casos de uso

- Investigacion sobre DPO en modelos pequenos: replicar el pipeline TRL + PEFT con un profesor de 4B y un alumno de 1B para estudiar como se transfieren las preferencias a escala reducida.
- Experimentos de destilacion de preferencias: usar el adaptador como referencia de linea base al comparar estrategias de construccion de pares (teacher-only frente a on-policy) en tareas de evaluacion tipo RCAEval.
- Evaluacion de alineamiento en dominios especificos: medir si el DPO sobre pares del dominio RCAEval mejora la adherencia a criterios macro y micro definidos por el autor.
- Prototipado de asistentes conversacionales ligeros: desplegar el modelo fusionado en una GPU consumer para demos de bajo coste donde la latencia importe mas que la calidad absoluta.
- Generacion de datos sinteticos de preferencia: emplear las respuestas del adaptador como candidatas en la construccion de nuevos conjuntos de pares para iteraciones posteriores.
- Docencia y formacion: ilustrar de forma reproducible el flujo completo de un entrenamiento DPO con PEFT, desde el dataset hasta la publicacion del adaptador en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor contiene una entrada con la lista de resultados vacia.

## Requisitos de hardware

- VRAM para inferencia del modelo fusionado en fp16: aproximadamente 2,5-3 GB, incluyendo overhead de activaciones y cache KV para contextos moderados.
- VRAM en cuantizacion int8: en torno a 1,5 GB; en int4 (GGUF Q4_K_M): alrededor de 1 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo fusionado; A100 o H100 no son necesarias y solo aportarian throughput.
- Cabe en GPU consumer: si, practicamente en toda la gama actual, incluida la mayoria de portatiles con GPU dedicada.
- Despliegue: transformers con PEFT para cargar el adaptador, vLLM o TGI tras fusionar los pesos, llama.cpp u Ollama tras conversion a GGUF. No se dispone de datos de latencia ni throughput medidos.
- Entrenamiento: el adaptador se entreno con batch efectivo de 8 y una epoca; el coste de replicacion es bajo para una unica GPU de 16-24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_TeacherOnly | ~1B (base) + adaptador LoRA | 32 000 (heredado) | Gemma | Adaptador PEFT en HF | DPO especifico sobre pares RCAEval; sin benchmarks publicados |
| google/gemma-3-1b-it | ~1B | 32 000 | Gemma | Pesos completos en HF | Modelo base instruct oficial, sin el sesgo del DPO |
| google/gemma-3-4b-it | ~4B | 128 000 | Gemma | Pesos completos en HF | Profesor del pipeline; mayor calidad y contexto, mas coste de inferencia |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32 768 | Apache 2.0 | Pesos completos en HF | Alternativa de tamano similar con licencia permisiva, sin adaptador DPO especifico |

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay descripcion de usos previstos, datos de entrenamiento ni evaluacion, lo que impide validar el comportamiento real del adaptador.
- El adaptador se entreno con una sola epoca sobre un dataset de pares de preferencia de dominio especifico (RCAEval_2); es probable que sobreajuste a ese dominio y degrade capacidades generales del modelo base.
- No se documentan sesgos; al heredar Gemma 3 1B, arrastra los sesgos del modelo base y anade los del profesor gemma-3-4b-it empleado para generar las preferencias.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones que midan la tasa de respuestas incorrectas o inventadas.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; conviene revisarlos antes de desplegar.
- El repositorio contiene solo el adaptador (2,2 GB); es necesario descargar el modelo base y fusionar o cargar ambos, lo que anade complejidad operativa.
- Idiomas soportados no declarados: no se puede garantizar el rendimiento en castellano ni en otros idiomas sin evaluacion previa.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_TeacherOnly
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Modelo profesor: https://huggingface.co/google/gemma-3-4b-it
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL (DPO): https://huggingface.co/docs/trl
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
