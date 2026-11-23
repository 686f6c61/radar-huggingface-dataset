# TravelDistillation/Travel-gemma3_1b_RCAEval_2_gkd

## Resumen

Travel-gemma3_1b_RCAEval_2_gkd es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base google/gemma-3-1b-it. Lo desarrolla el usuario TravelDistillation y se distribuye como un repositorio PEFT de 2,2 GB en Hugging Face. El adaptador se ha ajustado sobre un conjunto de pares de preferencia denominado `data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it`, lo que sugiere un proceso de destilación de preferencias desde una variante mayor (gemma-3-4b-it) hacia la variante de 1B.

El modelo resuelve un problema acotado: alinear la salida de Gemma 3 1B instruct con las preferencias de un modelo de mayor tamano sobre un dominio concreto (RCAEval), sin necesidad de reentrenar el modelo base completo. Al ser un adaptador sobre un modelo de 1B parametros, el coste computacional de inferencia y despliegue es bajo, lo que lo hace atractivo para entornos con recursos limitados o para experimentacion rapida en alineamiento.

La relevancia actual es limitada y muy especifica: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la ficha, sin model card completada (el autor deja multiples secciones como "More information needed") y sin resultados de benchmarks publicados. Debe tratarse como un experimento reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con adaptador LoRA sobre el modelo base |
| Parametros totales | No disponible para el adaptador; el modelo base google/gemma-3-1b-it tiene 1B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Gemma 3 1B) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos safetensors del adaptador; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3 en su variante de texto de 1B parametros. El entrenamiento se realizo con PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132, Datasets 5.1.0 y Tokenizers 0.23.3, usando TRL para el bucle de DPO. La tecnica es por tanto un ajuste LoRA combinado con optimizacion de preferencias, no un preentrenamiento ni un SFT clasico.

Los hiperparametros declarados son: learning rate 5e-05, batch de entrenamiento 1 con 8 pasos de acumulacion de gradiente (batch efectivo 8), optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), scheduler coseno con warmup del 10 por ciento de los pasos, una sola epoca y semilla 42. El dataset de entrenamiento son pares de preferencia generados a partir de comparaciones entre gemma-3-1b-it y gemma-3-4b-it sobre la tarea RCAEval, lo que apunta a una destilacion de preferencias (el modelo grande actua como referencia de calidad). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o evaluacion.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de gemma-3-1b-it.
- Alineamiento especifico con las preferencias del modelo gemma-3-4b-it sobre el dominio RCAEval, segun el dataset de entrenamiento declarado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador (depende del modelo base y no se documenta).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles para este adaptador; el modelo base es la variante de texto (gemma3_text).

## Casos de uso

- Experimentacion en alineamiento con DPO: el adaptador sirve como referencia reproducible de un pipeline DPO con LoRA sobre Gemma 3 1B, util para investigadores que quieran replicar o comparar configuraciones de hiperparametros.
- Destilacion de preferencias de modelos mayores: permite estudiar como un modelo de 1B puede aproximar el comportamiento preferido de un modelo de 4B sobre una tarea concreta, con coste de inferencia reducido.
- Evaluacion de tecnicas PEFT: al estar empaquetado como repositorio PEFT con versiones de framework declaradas, es adecuado para pruebas de compatibilidad entre PEFT, TRL y Transformers en entornos de investigacion.
- Prototipado de asistentes conversacionales de bajo coste: al apoyarse en un modelo de 1B, puede desplegarse en hardware modesto para demos internas, siempre que se valide la calidad en el dominio objetivo.
- Baseline para comparativas de alineamiento: util como punto de partida en estudios que midan el efecto de DPO frente a SFT sobre modelos pequenos de la familia Gemma.
- Investigacion sobre RCAEval: si el dominio de evaluacion RCAEval es el objetivo, el adaptador puede emplearse para generar respuestas alineadas con ese criterio y compararlas con las del modelo base sin ajustar.

## Benchmarks y rendimiento

El model-index declarado por el autor contiene una entrada (`gemma3_1b_RCAEval_2_gkd`) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el modelo base Gemma 3 1B en precision bf16 requiere aproximadamente 2-3 GB de VRAM, y en cuantizacion de 8 bits alrededor de 1-1,5 GB (estimacion orientativa, no declarada por el autor).
- GPU recomendadas: no declaradas por el autor. Por el tamano del modelo base, una GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) seria suficiente en principio.
- Cabe en GPU consumer: previsiblemente si, al tratarse de un modelo base de 1B; no confirmado por el autor.
- Opciones de despliegue: el repositorio es compatible con text-generation-inference y endpoints_compatible segun los tags; al ser un adaptador PEFT, requiere cargar el modelo base google/gemma-3-1b-it junto con el adaptador mediante Transformers/PEFT. No se documentan opciones GGUF ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Travel-gemma3_1b_RCAEval_2_gkd | 1B (base) + adaptador LoRA | No disponible | Gemma | Hugging Face, 0 descargas | Adaptador DPO especifico, sin benchmarks publicados |
| google/gemma-3-1b-it | 1B | No disponible en esta ficha | Gemma | Hugging Face, ampliamente usado | Modelo base instruct oficial |
| google/gemma-3-4b-it | 4B | No disponible en esta ficha | Gemma | Hugging Face | Modelo de referencia usado para generar los pares de preferencia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Model card incompleta: el autor deja secciones como "Model description", "Intended uses & limitations" y "Training and evaluation data" sin contenido ("More information needed").
- Ausencia total de benchmarks: no hay evidencia cuantitativa de mejora frente al modelo base.
- Sesgos conocidos: no documentados; hereda los del modelo base Gemma 3 1B, no evaluados aqui.
- Riesgo de alucinacion: no evaluado para este adaptador; el modelo base de 1B tiene capacidad limitada de razonamiento y factualidad.
- Limitaciones de contexto e idioma: no declaradas; dependen del modelo base y no se han verificado.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; es necesario revisar las condiciones de uso comercial y las obligaciones de atribucion de la licencia Gemma antes de cualquier despliegue en produccion.
- Caveat de produccion: al ser un adaptador DPO entrenado con una sola epoca, batch efectivo 8 y sobre un dataset de preferencias acotado, el riesgo de sobreajuste al dominio RCAEval es alto; no se recomienda su uso fuera de ese contexto sin validacion adicional.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la ficha, lo que reduce la confianza en su robustez.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-gemma3_1b_RCAEval_2_gkd
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos asociados a este adaptador.
