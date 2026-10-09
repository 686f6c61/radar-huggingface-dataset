# vosldtgbj/project-llm-rlvr-dynamic-v2-step-125

## Resumen

El modelo `vosldtgbj/project-llm-rlvr-dynamic-v2-step-125` es un punto de control intermedio de pesos completos en BF16 dentro de una trayectoria de aprendizaje por refuerzo con recompensa verificable (RLVR) sobre una variante de Gemma 4 de 12B. Lo publica el usuario `vosldtgbj` y deriva directamente del checkpoint `project-llm-rlvr-dynamic-v2-step-100`, que a su vez procede de la fase RLVR v1. No es un modelo de proposito general, sino una instantanea de investigacion pensada para evaluacion unificada y como peso de inicializacion.

Arquitectonicamente corresponde a `Gemma4UnifiedForConditionalGeneration` (`model_type` `gemma4_unified`), un transformer denso de 48 capas de texto, `hidden size` 3.840 y vocabulario de 262.144 tokens. Los pesos safetensors suman 11.959.730.224 parametros (la model card declara 12.484.280.320), con 5 fragmentos safetensors y un indice. El entrenamiento solo toca la torre de texto: las torres de vision y audio y las proyecciones multimodales permanecen congeladas.

Su relevancia es metodologica: documenta de forma muy detallada un pipeline de RLVR con GRPO sincrono y muestreo dinamico, con conjuntos congelados de SFT y RLVR, verificadores deterministas y un juez externo. El autor advierte que el checkpoint no tiene una puntuacion de validacion independiente y que el reward de entrenamiento no sirve para comparar checkpoints entre si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4UnifiedForConditionalGeneration` (transformer denso unificado, `model_type` `gemma4_unified`) |
| Parametros totales | 12.484.280.320 segun la model card; 11.959.730.224 segun los safetensors publicados |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento RLVR usa limites de entrada 8.192, generacion 2.048 y total 10.240 tokens) |
| Tipos de cuantizacion | no disponible (pesos oficiales unicamente en BF16) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | Gemma (`license: gemma`, enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (5 fragmentos) + `model.safetensors.index.json` |
| Capas de texto | 48 |
| `hidden size` (texto) | 3.840 |
| Tamano de vocabulario | 262.144 |
| Precision de exportacion | BF16 |
| Tamano de pesos por repo | ~23,92 GB decimales (~22,3 GiB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso unificado de la familia Gemma 4 (`Gemma4UnifiedForConditionalGeneration`) con 48 capas de texto, `hidden size` 3.840 y vocabulario de 262.144. Aunque el pipeline declarado es `any-to-any` y la etiqueta incluye `image-text-to-text`, el proyecto solo ha entrenado la parte de texto: las torres de vision y audio, asi como las proyecciones multimodales, se mantienen congeladas respecto al modelo original `google/gemma-4-12B-it`. Los repositorios de experimentos con LoRA/RSLoRA almacenan pesos completos ya fusionados, no adaptadores de bajo rango.

El entrenamiento sigue una cadena larga de fases. Primero, dos rondas de preentrenamiento continuado (CPT) sobre el modelo base; despues, SFT v3 con una vista congelada `official_90_10`: 67.195 registros y 4.083.167 tokens supervisados de entrenamiento, mas 16.972 registros y 1.019.737 tokens de evaluacion. El `packing` agrupa 67.195 registros en 5.824 paquetes de longitud 8.192 (44.084.610 tokens de entrada) con una eficiencia de 0,9240, y solo se calcula perdida sobre respuestas del asistente, llamadas a herramientas y `spans` de control. Sobre esa base se ejecuta RLVR v1 (pasos 25 a 125) y despues RLVR Dynamic v2, de la que este `step-125` forma parte.

La receta RLVR es GRPO sincrono con muestreo dinamico activado, 30 grupos de prompt efectivos por actualizacion, 16 rollouts por prompt (480 rollouts por paso), hasta 5 rondas de interaccion, temperatura de rollout 0,7 y top-p 1,0. El optimizador es Transformer Engine FusedAdam (betas 0,9 y 0,999, eps 1e-8), con `weight decay` 0,1, `max grad norm` 1,0, recorte de ratio PPO de 0,2 a 0,28, ratio de importance sampling truncado de 2,0 y penalizacion KL contra la politica de referencia de 0. El aprendizaje actual es 5e-7 y el `train global / micro batch size` es 480/1. El entrenamiento se hizo en 16 GPU H100 SXM y el backend de rollout fue vLLM con `tensor parallel size` 2.

El conjunto RLVR congelado es `SF-RLVR-Unified-v2`: 30.000 tareas de dominio de proyecto y 7.500 tareas generales publicas (80/20), repartidas en 15 familias verificables (cuestionario sobre documentos, razonamiento multi-documento, abstención, salida estructurada, conflicto de fuentes, versionado temporal, seguimiento de instrucciones, codigo competitivo, matematicas, MCQA, inyeccion de prompt, entre otras). Cada tarea guarda prompt visible, referencia estructurada oculta, `verifier_id` y `reward_contract_id`; las respuestas se generan en linea con la politica actual y se puntuan con verificadores deterministas o con un juez acotado (Nemotron 3 Ultra desplegado en `konst154`). Existe un `locked eval` de 4.700 elementos con un `validation core` congelado de 470.

## Capacidades

- Generacion de texto y razonamiento en japones e ingles, con foco en tareas de dominio sobre documentos (104 libros blancos japoneses publicos).
- Cuestionario con base documental (`single-document grounded`) y razonamiento multi-documento.
- Manejo de conflicto de fuentes y de version temporal, con verificacion determinista asociada.
- Abstención y rechazo calibrado (`abstention`) y gestion de preguntas sin respuesta.
- Salida estructurada con contratos de esquema verificables.
- Llamada a herramientas y trazas de uso de herramientas, incluida recuperacion ante fallo de herramienta.
- Razonamiento agéntico multietapa, con un maximo de 5 rondas de interaccion por episodio en entrenamiento.
- Capacidades generales anadidas: seguimiento de instrucciones, `ReasoningGym`, codigo competitivo, matematicas abiertas, aritmetica, MCQA y resistancia a inyeccion de prompt.
- Capacidad multimodal potencial por herencia arquitectonica (torres de vision y audio presentes), pero sin entrenamiento sobre estas modalidades y con dichas torres congeladas.
- El proyecto asume explicitamente que no se realiza busqueda en internet.

## Casos de uso

- Cuestionario sobre documentacion corporativa en japones: el modelo responde preguntas ancladas a documentos con verificacion determinista, adecuado para bases de conocimiento internas donde se exige cita y no invencion.
- Razonamiento sobre multiples documentos: comparar y sintetizar informacion dispersa en varios informes, con deteccion de conflictos de fuente y de version temporal.
- Agentes con herramientas: integracion en flujos donde el modelo debe invocar funciones, recuperarse de fallos de herramienta y mantener hasta 5 pasos de interaccion.
- Generacion de salida estructurada: rellenar esquemas JSON/SQL verificables en pipelines de extraccion, donde la conformidad al esquema se comprueba de forma automatica.
- Atencion al cliente con rechazo calibrado: gestionar conversaciones donde parte de las preguntas no tienen respuesta disponible y el modelo debe abstenerse en lugar de alucinar.
- Evaluacion comparativa de checkpoints de RLVR: sirve como uno de los 11 puntos de control de la trayectoria para ejecutar un mismo `eval` congelado y las mismas condiciones de inferencia.
- Inicializacion de nuevos experimentos de RLVR: al ser pesos completos en BF16, se puede usar como punto de partida de un run posterior (asi se hizo con el `step-149-final`).
- Filtrado de datos y control de calidad: el modelo puede actuar como anotador de dominio japones para clasificar o validar documentos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este checkpoint no tiene una puntuacion de validacion independiente y que el reward registrado durante el entrenamiento es una senal en linea sobre los datos muestreados, influida por la dificultad de las preguntas, el muestreo dinamico y la politica, por lo que no es valido para clasificar checkpoints entre si. El autor indica que la comparacion correcta exige ejecutar un mismo `eval` congelado sobre los 11 puntos de control con parametros de inferencia identicas. Existen un `locked eval` de 4.700 elementos y un `validation core` de 470, pero no se publican sus puntuaciones en la informacion disponible.

## Requisitos de hardware

- Inferencia en BF16: aproximadamente 24 GB solo para pesos, mas memoria para el contexto y el estado de atencion. Con contexto de 8.192 a 10.240 tokens conviene reservar al menos 40-48 GB de VRAM en BF16 segun lote y backend.
- GPU recomendadas en precision completa: A100 (40/80 GB) y H100 (80 GB). El entrenamiento del proyecto uso 16 H100 SXM.
- GPU de consumo: una RTX 4090 (24 GB) queda muy justa en BF16; requeriria cuantizacion a 8 o 4 bits para dejar margen al contexto, aunque la informacion disponible solo documenta pesos BF16.
- Despliegue: el proyecto uso vLLM con `tensor parallel size` 2 para el rollout; `transformers` es la libreria declarada. No se confirma soporte de llama.cpp, Ollama, TGI ni ficheros GGUF en la informacion disponible.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con modelos externos de la misma categoria. Los unicos terminos de comparacion documentados son otros checkpoints de la misma trayectoria de entrenamiento, que comparten arquitectura, tamano y licencia:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `project-llm-rlvr-dynamic-v2-step-125` | ~12B (dato de safetensors 11,96B) | no disponible | Gemma | este repositorio |
| `project-llm-rlvr-dynamic-v2-step-100` | ~12B | no disponible | Gemma | publico (padre directo) |
| `project-llm-rlvr-dynamic-v2-step-149-final` | ~12B | no disponible | Gemma | publico (siguiente checkpoint) |
| `google/gemma-4-12B-it` | ~12B | no disponible | Gemma | modelo base original de Google (no reeditado por este proyecto) |

No se dispone de datos de rendimiento relativos entre estos checkpoints, por lo que la comparativa se limita a arquitectura, licencia y trazabilidad de parametros.

## Limitaciones y advertencias

- No es un modelo final: es un punto intermedio (paso 125 de la fase v2, paso acumulado 250) de una trayectoria de RLVR, sin puntuacion de validacion independiente.
- El reward de entrenamiento no es un benchmark: puede sobreestimar la calidad y no permite clasificar checkpoints entre si.
- Sesgos: no se documentan analisis de sesgo; el entrenamiento se apoya en 104 libros blancos japoneses publicos y en datos generales, lo que puede introducir sesgos de dominio y de idioma no evaluados.
- Riesgo de alucinacion: el modelo incorpora familias de abstención y verificacion, pero no se publican tasas de alucinacion medidas.
- Limitaciones de idioma: solo japones e ingles; no se garantiza comportamiento en castellano ni en otras lenguas.
- Capacidad multimodal limitada de facto: aunque la arquitectura es unificada y admite vision y audio, estas torres estan congeladas y el entrenamiento es exclusivamente de texto.
- Conformidad al esquema y al formato de cita: la fase SFT v3 elimino rutas internas, hashes y referencias por numero de linea, conservando solo numeros cortos dentro de la peticion o expresiones naturales; los sistemas que esperen citas con rutas podrian romperse.
- Licencia Gemma: el uso comercial y la redistribucion se rigen por la licencia de Gemma 4; hay que revisar sus condiciones antes de desplegar en produccion.
- No hay estado de reanudacion: el archivo no incluye optimizador, `scheduler`, estado aleatorio, cursor de `dataloader` ni fragmentos FSDP/DTensor, por lo que no permite continuar el entrenamiento de forma exacta a nivel de bit.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de terceros.
- La busqueda web no devolvio resultados relevantes sobre este modelo (los enlaces encontrados no guardaban relacion con el).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-125
- Modelo base directo (step-100): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-100
- Siguiente punto de control (step-149-final): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-149-final
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR unificado v2: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset RLVR de dominio v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
- Modelo base original: google/gemma-4-12B-it (no reeditado por este proyecto)
