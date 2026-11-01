# Yesini/Rehearsal-Glimmer-30B-r1-LoRA

## Resumen

Rehearsal-Glimmer-30B-r1-LoRA es un adaptador LoRA (QLoRA) publicado por el usuario Yesini sobre el modelo multimodal `meta-models/Muse-Glimmer-30B`. Su proposito no es el asistente generalista, sino la simulacion de decisiones humanas: dado el perfil de una persona ficticia y una captura de pantalla de una aplicacion movil, el modelo devuelve un JSON con las probabilidades de tres acciones (pagar, volver manana o borrar la app), lo que el usuario "noto" en pantalla y una razon breve en primera persona. Es, por tanto, un modelo de destilacion de comportamiento orientado a la simulacion de mercados de lanzamiento de producto.

El adaptador se entrena por destilacion de las respuestas de Muse Spark (un modelo contribuidor con razonamiento de nivel medio) sobre 4.000 personas ficticias y pantallas de una app de citas inventada. La relevancia actual es metodologica: demuestra que un adaptador pequeno (r=16 sobre las proyecciones q, k, v y o) puede aproximar el comportamiento de un modelo mayor hasta el punto de que su acuerdo con el profesor es similar al acuerdo del profesor consigo mismo en una segunda pasada.

El modelo base tiene 30B parametros y es multimodal image-text-to-text; el adaptador en si ocupa 0,1 GB. El checkpoint fusionado equivalente esta publicado como `Yesini/Rehearsal-Glimmer-30B-r1`, listo para vLLM. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (image-text-to-text); base Muse-Glimmer-30B |
| Parametros totales | 30B en el modelo base; el adaptador LoRA ocupa 0,1 GB en el repositorio |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base entrenado en 4-bit NF4 con computo bf16; checkpoint fusionado publicado en bf16; otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); checkpoint fusionado en bf16 |
| Libreria | peft |
| Tipo de pipeline | image-text-to-text |
| Modelo base | meta-models/Muse-Glimmer-30B (revision `cec94fcfd6512f2cfe708138c32533b346ea4f69`) |
| Hiperparametros LoRA | r=16, alpha=32, dropout=0.05, modulos q, k, v, o del LM; vision tower congelado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer multimodal propietario del ecosistema de Meta (`Muse-Glimmer-30B`), con una torre de vision y un modelo de lenguaje. El entrenamiento congela la torre de vision y solo ajusta las proyecciones de atencion q, k, v y o del modelo de lenguaje mediante LoRA de rango 16 y alpha 32, con dropout 0,05. El base se carga en 4-bit NF4 con computo en bf16, y se realizan 400 pasos de 16 ejemplos (2 epocas) con learning rate 2e-4 durante 56 minutos en una unica H100.

Los datos de entrenamiento son 4.000 personas ficticias, cada una con edad, trabajo, lugar de residencia, situacion economica, historial de citas y estado de animo, expuestas a pantallas de una app de citas inventada. Muse Spark (contribuidor, razonamiento medio) genera la respuesta objetivo, que es unicamente el JSON final enviado al canal de usuario, sin texto de razonamiento. El split es 3.201 / 391 / 408 por persona. La perdida de validacion bajo de 0,958 a 0,257. El formato de prompt abre directamente el turno del asistente en el canal de usuario (`to=user<|message|>`), lo que elimina la generacion de cadena de pensamiento en inferencia.

## Capacidades

- Generacion de JSON estructurado con tres probabilidades normalizadas (pagar, volver manana, borrar app), un campo `noticed` y un campo `reason` en primera persona.
- Comprension de imagenes de interfaz movil (capturas de pantalla) combinada con un perfil textual largo en el system prompt.
- Simulacion de personaje: mantiene el rol de una persona concreta con restricciones economicas, emocionales y de comportamiento.
- Razonamiento implicito sobre pantallas: identifica el elemento visual mas relevante para la decision.
- Destilacion de comportamiento: reproduce el criterio de un modelo profesor (Muse Spark) sobre poblaciones nuevas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling, function calling, agentes multi-paso, vision general, audio y thinking mode explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Simulacion de mercados de lanzamiento: el modelo actua como el decisor de cada persona simulada en Rehearsal, un world model que reproduce 90 dias de un lanzamiento en un mercado estadounidense simulado; cada agente consulta al modelo para decidir su siguiente accion.
- Prediccion de abandono en paywalls: dada una captura de la pantalla de pago y el perfil del usuario, el modelo estima la probabilidad de borrar la app, lo que permite comparar variantes de copy y precio antes de publicar.
- Analisis de friccion en onboarding: alimentando capturas de cada paso del flujo y perfiles sinteticos, se obtiene una distribucion de reacciones que senala en que pantalla se concentra el riesgo de abandono.
- Investigacion de precios: al variar el importe mostrado en la pantalla, el modelo devuelve la probabilidad de pago por segmento de perfil, util para estudiar elasticidad sin lanzar experimentos reales.
- Generacion de datos sinteticos etiquetados: el JSON de salida sirve como etiqueta estructurada para entrenar clasificadores de intencion o modelos de propension en dominios de aplicaciones moviles.
- Evaluacion de modelos de simulacion: el adaptador puede usarse como referencia barata (0,064 s por decision en una H100 con vLLM) para comparar contra el profesor en pruebas de regresion de pipelines de simulacion.
- Prototipado de agentes de comportamiento: integrado en frameworks de agent-based modeling, cada agente delega la decision puntual en el modelo mientras el entorno simula el resto del mundo.

## Benchmarks y rendimiento

Resultados sobre 408 personas ficticias retenidas (nunca vistas en entrenamiento), comparados con la respuesta de Muse Spark:

| Modelo | Misma opcion principal | Diferencia absoluta media |
|---|---|---|
| Spark preguntado una segunda vez | 86% | 0,078 |
| Glimmer antes del entrenamiento | 74% | 0,151 |
| Glimmer tras entrenamiento (adaptador sobre base 4-bit) | 85% | 0,079 |
| Glimmer tras entrenamiento (checkpoint fusionado bf16, vLLM) | 84% | 0,083 |

En 300 decisiones de una poblacion distinta (personas disenadas por Muse Wonder), el modelo coincide con Spark en la opcion principal el 90% de las veces, con diferencia absoluta media de 0,065. Con vLLM en una H100, cada decision tarda 0,064 s.

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el base de 30B en bf16 requiere del orden de 60 GB de pesos mas overhead de activaciones y cache KV; en 4-bit NF4 se reduce aproximadamente a 15-20 GB, aunque la cifra exacta no esta disponible en la informacion proporcionada.
- GPU recomendadas: el entrenamiento se realizo en una H100; la evaluacion con vLLM tambien en una H100. Para inferencia en bf16 se recomienda A100 80 GB o H100.
- GPU de consumo: con cuantizacion de 4 bits el base podria caber en GPUs de 24 GB (RTX 4090, RTX 3090), pero no se ha validado en la informacion disponible.
- Despliegue: vLLM con el checkpoint fusionado `Yesini/Rehearsal-Glimmer-30B-r1`; transformers + peft para cargar el adaptador sobre el base. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: 0,064 s por decision con vLLM en una H100 (medido por el autor); throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rehearsal-Glimmer-30B-r1-LoRA | 30B (base) + LoRA r=16 | no disponible | Simulacion de decisiones con vision | apache-2.0 | HuggingFace (adaptador y fusionado) |
| Muse-Glimmer-30B (base) | 30B | no disponible | Multimodal image-text-to-text generalista | no disponible | HuggingFace (meta-models) |
| Muse Spark (profesor) | no disponible | no disponible | Razonamiento multimodal, nivel medio | no disponible | no disponible como pesos publicos |

No se dispone de datos publicos de benchmarks estandar para estos modelos, por lo que la comparativa se limita a parametros, enfoque y disponibilidad. Alternativas de simulacion de comportamiento de proposito general: no disponible.

## Limitaciones y advertencias

- Mismo generador en train y test: las personas retenidas provienen del mismo generador que las de entrenamiento, por lo que los resultados demuestran reproduccion de Spark sobre personas del mismo tipo, no fidelidad frente a usuarios reales.
- Hereda los sesgos de Spark, incluidos los sesgos del profesor en la simulacion de perfiles.
- El modelo solo produce el JSON final; no genera razonamiento explicito, lo que limita la auditabilidad de sus decisiones.
- Idioma limitado al ingles; no se declara soporte de otros idiomas.
- Entrenado sobre pantallas de una unica app de citas ficticia; la generalizacion a otras interfaces o dominios no esta validada.
- Las probabilidades de salida son estimaciones del profesor, no calibraciones sobre datos reales; no deben interpretarse como tasas observadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `meta-models/Muse-Glimmer-30B` puede tener condiciones propias no detalladas en la informacion disponible; conviene verificar antes de produccion.
- Riesgo de alucinacion en el campo `noticed` si la imagen no contiene los elementos esperados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- HuggingFace (adaptador LoRA): https://huggingface.co/Yesini/Rehearsal-Glimmer-30B-r1-LoRA
- HuggingFace (checkpoint fusionado bf16 para vLLM): https://huggingface.co/Yesini/Rehearsal-Glimmer-30B-r1
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Codigo y metodo (Rehearsal): https://github.com/tokyosini573/META-Global-AI-Developer-Hackathon
- Datos de destilacion: https://github.com/tokyosini573/META-Global-AI-Developer-Hackathon/tree/main/data/distill
- Pantallas de la simulacion: https://github.com/tokyosini573/META-Global-AI-Developer-Hackathon/tree/main/engine/screens/out
- Script de entrenamiento, evaluacion y serving vLLM: https://github.com/tokyosini573/META-Global-AI-Developer-Hackathon/blob/main/engine/distill/glimmer_modal.py
