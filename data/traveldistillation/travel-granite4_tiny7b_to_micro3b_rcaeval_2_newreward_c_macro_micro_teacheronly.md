# TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_TeacherOnly

## Resumen

Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_TeacherOnly es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base IBM Granite 4.0-h-micro. Lo publica el usuario TravelDistillation en Hugging Face y forma parte de un pipeline de destilacion de preferencias orientado a la evaluacion de RCA (Root Cause Analysis), segun indica el nombre del dataset de pares de preferencia utilizado.

El artefacto no es un modelo completo, sino un adaptador PEFT (formato safetensors, 6,4 GB de repositorio) que debe cargarse junto al modelo base `models/granite-4.0-h-micro`. El entrenamiento se realizo con TRL y PEFT 0.21.3, con un unico epoch, learning rate 5e-05, batch efectivo de 8 (batch 1 con 8 pasos de acumulacion) y scheduler coseno con un 10 % de warmup.

La relevancia de esta ficha es acotada: se trata de un experimento de investigacion sin descargas ni likes, sin model card completada y sin resultados de benchmarks publicados. Su interes practico radica en documentar una receta reproducible de DPO con LoRA sobre la familia Granite 4.0 y en servir como referencia para quien quiera replicar la destilacion de preferencias entre un modelo "teacher" (tiny) y uno "student" (micro).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer hibrido Granite MoE (`granitemoehybrid`) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Granite 4.0-h-micro no declara cifra en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base al cargarlo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `models/granite-4.0-h-micro`, un modelo de la familia Granite 4.0 de IBM etiquetado como `granitemoehybrid`, lo que indica una arquitectura hibrida con componentes de mezcla de expertos. El adaptador en si es un LoRA de rango no especificado en la model card, entrenado con DPO mediante TRL y PEFT 0.21.3. El repositorio ocupa 6,4 GB, un tamano considerable para un adaptador, lo que sugiere que se guardaron pesos en precision alta o que el adaptador cubre muchas capas.

El dataset de entrenamiento es `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, es decir, pares de preferencia generados en el contexto de una evaluacion RCA comparando las respuestas de Granite 4.0-h-micro y Granite 4.0-h-tiny. Los hiperparametros documentados son: learning rate 5e-05, batch de entrenamiento 1 con 8 pasos de acumulacion (batch efectivo 8), 1 epoch, optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), scheduler coseno con warmup del 10 % y semilla 42. No se documentan innovaciones tecnicas adicionales ni detalles sobre el volumen de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Ajuste de preferencias orientado a tareas de evaluacion de RCA (analisis de causa raiz), segun el nombre del dataset y del adaptador.
- Capacidad de actuar como "student" en un esquema de destilacion desde un modelo "teacher" (Granite 4.0-h-tiny), segun la nomenclatura del repositorio.
- Tool calling, agentes, vision, audio y modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en destilacion de preferencias: el adaptador sirve como punto de partida reproducible para estudiar como DPO con LoRA modifica el comportamiento de Granite 4.0-h-micro cuando se entrena con pares de preferencia generados por un modelo de menor tamano.
- Evaluacion de RCA en pipelines internos: puede integrarse como componente de un sistema que compara respuestas de modelos y aprende a preferir las mas correctas en tareas de diagnostico de causa raiz.
- Baseline para ablaciones de hiperparametros DPO: al estar documentados learning rate, scheduler, warmup y batch efectivo, es util para comparar variantes (por ejemplo, cambiar el reward o el par teacher/student).
- Reproduccion de experimentos con TRL y PEFT: el repositorio incluye las versiones exactas de framework (PEFT 0.21.3, Transformers 5.19.0, PyTorch 2.13.0+cu132, Datasets 5.1.0, Tokenizers 0.23.3), lo que facilita replicar el entorno.
- Prototipado de asistentes conversacionales especializados en analisis tecnico, cargando el adaptador sobre el modelo base y evaluando cualitativamente las respuestas antes de un despliegue real.
- Generacion de datos sinteticos de preferencia: el adaptador puede usarse para producir respuestas candidatas que luego se filtren y se incorporen a un nuevo ciclo de DPO.

## Benchmarks y rendimiento

El model-index del autor declara una entrada con la lista de resultados vacia:

| Benchmark | Resultado |
|---|---|
| (ninguno declarado) | sin resultados |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base Granite 4.0-h-micro y de la cuantizacion elegida, no del adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el repositorio del adaptador ocupa 6,4 GB, pero el requisito real lo marca el modelo base.
- Opciones de despliegue: carga mediante `peft` + `transformers` (el adaptador se fusiona o se mantiene separado del modelo base). vLLM, llama.cpp, Ollama o TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_TeacherOnly | Adaptador LoRA (DPO) sobre Granite 4.0-h-micro | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| IBM Granite 4.0-h-micro (modelo base) | Modelo completo, MoE hibrido | no disponible en la informacion | no disponible | no disponible | Hugging Face (referenciado como `models/granite-4.0-h-micro`) |
| IBM Granite 4.0-h-tiny (teacher en el dataset) | Modelo completo, MoE hibrido | no disponible en la informacion | no disponible | no disponible | Hugging Face (referenciado en el nombre del dataset) |

No se dispone de datos de rendimiento, contexto ni licencia de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a la relacion estructural entre ellos.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones "More information needed" en descripcion, usos previstos, datos de entrenamiento y resultados: no hay garantias documentadas sobre el comportamiento del adaptador.
- No se declara licencia, lo que impide verificar si el uso comercial esta permitido; hay que consultar la licencia del modelo base Granite 4.0-h-micro antes de cualquier despliegue.
- Sin benchmarks ni evaluacion publicada: el rendimiento real frente al modelo base es desconocido y no puede asumirse una mejora.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un ajuste DPO sobre pares de preferencia de un dominio concreto (RCA), puede sobreajustarse a ese estilo y degradar el comportamiento general.
- El entrenamiento es de 1 solo epoch con batch efectivo 8: la senal de preferencia puede ser debil o inestable.
- El repositorio (6,4 GB) no incluye el modelo base; es necesario descargarlo por separado y verificar compatibilidad de versiones (Transformers 5.19.0, PEFT 0.21.3).
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto fuera del idioma o idiomas del dataset de preferencias.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_TeacherOnly
- Modelo base referenciado: https://huggingface.co/models/granite-4.0-h-micro
- Dataset referenciado: `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny` (no se proporciona URL publica en la informacion disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
