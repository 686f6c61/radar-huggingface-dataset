# TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_AdvantageAtForward

## Resumen

Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_AdvantageAtForward es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base google/gemma-3-1b-it. Lo desarrolla el usuario TravelDistillation y se publica como un artefacto PEFT empaquetado en safetensors, con un tamano de repositorio de 2,2 GB. Su proposito declarado es ajustar el comportamiento del modelo base de 1B parametros para alinearlo con un conjunto de pares de preferencia derivado de la evaluacion RCAEval, comparando respuestas del propio gemma-3-1b-it frente a las de gemma-3-4b-it.

El modelo resuelve un problema acotado de investigacion: explorar si un modelo pequeno de la familia Gemma 3 puede aproximarse al comportamiento preferido de un modelo mayor de la misma familia mediante optimizacion de preferencias. Es relevante en el contexto de destilacion y alineacion de modelos compactos, donde el interes esta en reducir coste de inferencia manteniendo calidad percibida. No obstante, la model card esta generada automaticamente y carece de descripcion, casos de uso y resultados, por lo que la informacion disponible es muy limitada.

La arquitectura subyacente es la del gemma-3-1b-it (transformer decoder-only de la familia Gemma 3, en su variante de texto), sobre la que se aplica un adaptador LoRA entrenado con TRL y PEFT. El contexto, los idiomas y las capacidades heredan las del modelo base, ya que el adaptador no modifica la arquitectura ni la tokenizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) con adaptador LoRA sobre google/gemma-3-1b-it |
| Parametros totales | 1B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre google/gemma-3-1b-it, un transformer decoder-only de 1B parametros de la familia Gemma 3 en su variante de texto. El adaptador se entrena con la libreria PEFT (version 0.21.3) y TRL, y se publica como pesos safetensors compatibles con el ecosistema transformers. El entrenamiento usa DPO sobre el dataset data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it, un conjunto de pares de preferencia construido a partir de evaluaciones RCAEval que contrastan respuestas de gemma-3-1b-it con las de gemma-3-4b-it.

Los hiperparametros declarados son: learning rate 5e-05, train batch size 1 con acumulacion de gradientes de 8 (batch efectivo de 8), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler coseno con warmup del 10 por ciento de los pasos, una sola epoca y semilla 42. El nombre del modelo sugiere el uso de una senal de recompensa basada en ventajas macro y micro calculadas en el paso forward, aunque la model card no detalla la formulacion de la funcion de recompensa ni la composicion exacta del dataset. No se documentan innovaciones arquitectonicas adicionales: el adaptador no altera la atencion ni la tokenizacion del modelo base.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base gemma-3-1b-it.
- Razonamiento basico y respuesta a instrucciones, condicionada por el ajuste DPO hacia las preferencias del dataset.
- Soporte multilingue: no disponible en la informacion proporcionada (depende del modelo base).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; el adaptador se declara sobre la variante gemma3_text.

## Casos de uso

- Investigacion en alineacion de modelos pequenos: el adaptador permite estudiar como DPO con pares de preferencia generados por un modelo mayor (4B) modifica el comportamiento de un modelo de 1B, util para trabajos academicos sobre destilacion de preferencias.
- Evaluacion comparativa de tecnicas DPO: sirve como punto de partida reproducible (semilla 42, hiperparametros documentados) para replicar o contrastar variantes de recompensa en experimentos controlados.
- Prototipado de asistentes conversacionales ligeros: al ejecutarse sobre un modelo de 1B, permite desplegar prototipos en hardware modesto para validar flujos de conversacion antes de escalar a modelos mayores.
- Experimentos de destilacion de preferencias: el nombre y el dataset sugieren su uso para medir cuanto del comportamiento preferido de gemma-3-4b-it se transfiere a un modelo de 1B mediante DPO.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede combinarse o continuar entrenandose con otros adaptadores LoRA en pipelines de investigacion.
- Evaluacion de robustez en dominios especificos: util para comprobar si el ajuste de preferencias introduce regresiones en tareas generales del modelo base antes de integrarlo en produccion.

## Benchmarks y rendimiento

La model-index del autor declara una entrada con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1B en fp16 requiere aproximadamente 2-3 GB; en cuantizacion de 8 bits, en torno a 1,5 GB; en 4 bits, alrededor de 1 GB. El adaptador anade una sobrecarga minima (parametros del adaptador no disponibles).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para el modelo base en cuantizacion; para fp16 se recomienda 6 GB o mas.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; vLLM y TGI son viables una vez fusionado el adaptador, aunque no se documenta soporte directo de adaptadores en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_AdvantageAtForward | 1B (base) + LoRA | no disponible | gemma | Hugging Face (adaptador PEFT) | Ajuste DPO especifico de investigacion, sin benchmarks publicados |
| google/gemma-3-1b-it | 1B | no disponible en esta ficha | gemma | Hugging Face | Modelo base oficial, sin ajuste de preferencias adicional |
| google/gemma-3-4b-it | 4B | no disponible en esta ficha | gemma | Hugging Face | Modelo mayor usado como referencia en el dataset de preferencias |

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta usos previstos, limitaciones ni datos de evaluacion; la informacion es insuficiente para valorar calidad.
- No se han publicado resultados de benchmarks; no hay evidencia cuantitativa de mejora frente al modelo base.
- Riesgo de alucinacion y sesgos: heredados del modelo base gemma-3-1b-it y potencialmente amplificados o modificados por el ajuste DPO, sin analisis documentado.
- El dataset de preferencias es especifico (RCAEval) y puede introducir un sesgo hacia el estilo o contenido de las respuestas de gemma-3-4b-it en ese dominio concreto.
- Licencia gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion; revisar antes de desplegar.
- Idiomas soportados no declarados; el comportamiento multilingue depende del modelo base y no ha sido evaluado tras el ajuste.
- Al ser un adaptador LoRA, requiere cargar el modelo base google/gemma-3-1b-it; no es un modelo autonomo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_AdvantageAtForward
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset declarado: data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it (referencia interna de la model card, sin URL publica disponible)
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
