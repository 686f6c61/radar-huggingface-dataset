# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd4400-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-opd4400-lora es un adaptador LoRA entrenado sobre Qwen/Qwen2.5-0.5B-Instruct, el modelo de instrucciones de 0,5 mil millones de parametros de la familia Qwen2.5 de Alibaba. Lo desarrolla el usuario uygarkurt dentro del proyecto Post-Training Lab y su objetivo es especializar un modelo pequeno en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la peticion del usuario.

El adaptador se entrena mediante destilacion on-policy (OPD) usando como profesor congelado Qwen/Qwen2.5-3B-Instruct: el estudiante aprende de las probabilidades por token que el profesor asigna a las respuestas que el propio estudiante genera. El entrenamiento consistio en 4.400 actualizaciones OPD sobre el dataset uygarkurt/xlam-tool-calling-mixed, con un tiempo de bucle de entrenamiento de 1,9 horas. El resultado es un adaptador de pocos megabytes que se carga sobre el modelo base original.

La relevancia de esta ficha es doble: por un lado, demuestra una tecnica de post-entrenamiento eficiente (OPD con profesor mayor) aplicada a un modelo de 0,5B, lo que permite desplegar tool calling en entornos con recursos muy limitados; por otro, publica una evaluacion comparativa frente al modelo base en MMLU, MATH-500, IFEval, xLAM y BFCL, lo que permite medir con precision el coste y la ganancia de la especializacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); el adaptador LoRA anade un numero reducido de parametros entrenables no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para el adaptador; el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens segun la documentacion oficial de Qwen, aunque la evaluacion de este adaptador se realizo con un limite de prompt de 640 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT/transformers) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parametros. El entrenamiento no modifica los pesos base: se entrena un adaptador LoRA mediante destilacion on-policy (OPD), donde el estudiante (el modelo de 0,5B con el adaptador) genera respuestas y aprende a imitar la distribucion de probabilidad por token de un profesor congelado mas grande, Qwen/Qwen2.5-3B-Instruct. Este esquema evita el desajuste entre la distribucion de entrenamiento y la de inferencia tipico de la destilacion offline, ya que el estudiante entrena sobre sus propias secuencias.

El dataset de entrenamiento es uygarkurt/xlam-tool-calling-mixed, orientado a tool calling estructurado y a la abstención ante herramientas irrelevantes. Se realizaron 4.400 actualizaciones OPD con un tiempo de bucle de 1,9 horas (sin contar carga de modelo, preparacion de datos ni evaluacion externa). No se especifican en la informacion disponible el rango del adaptador LoRA, el learning rate, el tamano de batch ni la composicion detallada del dataset. La innovacion tecnica destacable es el uso de OPD con un profesor 6 veces mayor sobre un modelo de 0,5B para una tarea estructurada concreta.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: generacion de llamadas a funciones en formato estructurado, segun el dataset xLAM de entrenamiento.
- Abstención ante herramientas irrelevantes: el adaptador aprende a no emitir una llamada a funcion cuando las herramientas ofrecidas no son pertinentes para la peticion.
- Razonamiento basico y matematicas heredadas del modelo base, con ligeras variaciones respecto a este (ver benchmarks).
- Seguimiento de instrucciones a nivel de prompt (IFEval) heredado del modelo base.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte de vision, audio, thinking mode ni agentes multi-paso mas alla del tool calling de un solo turno evaluado.

## Casos de uso

- Enrutamiento de herramientas en asistentes ligeros: el adaptador puede decidir que funcion invocar en un asistente con un catalogo pequeno de herramientas, con la ventaja de que cabe en CPU o en GPUs de gama baja y su latencia es muy reducida.
- Abstención controlada en pipelines de automatizacion: cuando el conjunto de herramientas ofrecidas no cubre la peticion del usuario, el adaptador tiende a no emitir una llamada erronea (mejora en relevancia del 77,78% al 83,33% en la evaluacion), lo que reduce acciones no deseadas en produccion.
- Prototipado rapido de agentes con tool calling: al ser un adaptador LoRA sobre un modelo de 0,5B, permite iterar en local sobre el diseno de esquemas de funciones y prompts sin coste de GPU dedicada.
- Filtrado y clasificacion de intenciones con salida estructurada: el modelo puede mapear una consulta a una funcion concreta de un conjunto cerrado, util en backends de bajo coste.
- Despliegue en dispositivos edge o entornos con VRAM muy limitada: el modelo base de 0,5B cuantizado ocupa del orden de 0,3-0,5 GB, por lo que es viable en CPUs, Raspberry Pi o GPUs integradas.
- Base para experimentos de destilacion on-policy: sirve como referencia reproducible para investigar OPD con profesor mayor en tareas estructuradas, dado que el autor publica el codigo en Post-Training Lab.
- Generacion de datos sinteticos de tool calling: el adaptador puede usarse para producir pares consulta-llamada a bajo coste y filtrar posteriormente con un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las puntuaciones son porcentajes. La primera fila es el modelo base Qwen2.5-0.5B-Instruct; la segunda, el adaptador OPD tras 4.400 actualizaciones.

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-0.5B-Instruct (base) | 42,04 | 15,80 | 26,80 | 62,61 | 86,57 | 50,28 | 77,78 | 66,93 |
| OPD (este adaptador) | 41,97 | 15,20 | 26,62 | 66,26 | 90,93 | 55,13 | 83,33 | 60,43 |

Notas de la evaluacion segun el autor: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de funcion; ambas usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 descartados por el limite de prompt de 640 tokens. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM usan scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB; en cuantizacion de 8 bits, unos 0,5 GB; en 4 bits, unos 0,3 GB. El adaptador LoRA anade un overhead minimo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada. Tambien es viable en GPUs integradas, CPU y dispositivos edge.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, y tambien en CPU.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, vLLM y TGI con soporte de adaptadores LoRA. El repositorio usa la libreria peft.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en GPU consumer, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-xlam-mixed-opd4400-lora (este) | 0,5B + LoRA | no disponible para el adaptador (base hasta 32.768) | Especializado (xLAM, BFCL) | no disponible | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | hasta 32.768 | Generico, no especializado | Apache 2.0 (segun Qwen) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | hasta 32.768 | Generico | Apache 2.0 (segun Qwen) | Hugging Face |
| xLAM-1B-fc-r (Salesforce) | 1B | no disponible | Especializado en function calling | CC-BY-NC-4.0 (segun Salesforce) | Hugging Face |

Comparado con el modelo base, el adaptador mejora xLAM ETC (+3,65 puntos), xLAM FNA (+4,36), BFCL Single-turn FC (+4,85) y Relevance (+5,55), con un coste minimo en MMLU (-0,07), MATH-500 (-0,60) e IFEval (-0,18) y una caida en Irrelevance (-6,50). Frente al profesor de 3B, el estudiante de 0,5B es mucho mas ligero pero no se publican comparaciones directas con el profesor en la model card.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de uso comercial es necesario verificar la licencia del modelo base (Qwen2.5-0.5B-Instruct) y del dataset de entrenamiento.
- El adaptador solo declara soporte de ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- La evaluacion xLAM se realizo con un limite de prompt de 640 tokens y se descartaron 743 ejemplos; los resultados no reflejan el comportamiento con prompts largos.
- La mejora en abstención (Relevance) viene acompanada de una caida en Irrelevance (66,93% a 60,43%), es decir, el modelo tiende mas a abstenerse tambien cuando la herramienta si era relevante. Es un trade-off que debe calibrarse segun el caso de uso.
- Al ser un modelo de 0,5B, el riesgo de alucinacion en razonamiento abierto y matematicas es alto (MATH-500 en torno al 15%), por lo que no es adecuado para tareas que requieran razonamiento complejo.
- No se documentan sesgos especificos, pero al heredar el modelo base Qwen2.5 arrastra los sesgos de sus datos de preentrenamiento.
- El adaptador debe cargarse sobre el modelo base exacto Qwen/Qwen2.5-0.5B-Instruct; no es un modelo autonomo y no funciona sin el.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el calculo de tamano no se ha actualizado. Conviene verificar la integridad de los ficheros antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd4400-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
