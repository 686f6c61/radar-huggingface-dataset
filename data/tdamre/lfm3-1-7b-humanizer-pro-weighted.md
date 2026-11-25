# Tdamre/LFM3-1.7B-Humanizer-Pro-Weighted

## Resumen

LFM3-1.7B-Humanizer-Pro-Weighted es un adaptador PEFT (LoRA) publicado por el usuario Tdamre sobre el modelo base LiquidAI/LFM3-1.7B de Liquid AI. Su proposito concreto es la edicion de prosa procedimental en ingles: reescribir pasajes para mejorar su claridad preservando de forma estricta todos los hechos, cifras, condiciones, incertidumbres y responsables mencionados en el texto original. No es un modelo de proposito general, sino un ajuste muy acotado orientado a tareas de text-editing.

El adaptador se entrena con supervised fine-tuning ponderado por tramos criticos (critical-span weighted SFT) sobre un conjunto muy reducido de 24 pares sinteticos de edicion, con un unico epoch y 24 actualizaciones. Los tramos criticos reciben un peso de 3.0. La configuracion LoRA es de rango 8, alpha 16 y tasa de aprendizaje 0.00005, con semilla 57303. El resultado es un adaptador de tamano practicamente despreciable (el repositorio ocupa 0.0 GB) que se carga sobre el modelo base congelado en la revision `0dc4268b561499c648c7ba7c9466bf3d8d01517a`.

Su relevancia es limitada y experimental: se trata de una prueba de concepto con evaluacion de muestra muy pequena (ocho avisos, 64 afirmaciones factuales) y revision asistida por modelo, sin evaluador humano independiente. Resulta util como referencia de metodologia (ponderacion de tramos criticos, comparacion ciega con controles) mas que como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | adaptador LoRA de rango 8 sobre base de 1.7B; parametros exactos del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B, un modelo base de 1.7 mil millones de parametros de Liquid AI. El adaptador en si es un LoRA de rango 8 con alpha 16, entrenado con supervised fine-tuning ponderado por tramos criticos: los fragmentos del texto considerados criticos (hechos, numeros, condiciones, incertidumbres y responsables) reciben un peso de 3.0 durante el calculo de la perdida. El entrenamiento consistio en un unico epoch y 24 actualizaciones sobre 24 pares sinteticos de edicion en ingles.

El modelo base se mantiene congelado en la revision `0dc4268b561499c648c7ba7c9466bf3d8d01517a` y los pesos del adaptador se copiaron sin cambios desde la primera ejecucion de entrenamiento completada, con SHA-256 `a215cf4f20a5585e775d7db64adf3e122664ce7489163fe27520d0ece2840bc2`. La receta y el codigo de entrenamiento son publicos. No se documentan innovaciones adicionales como decodificacion especulativa ni atencion lineal; el interes tecnico reside en la estrategia de ponderacion de tramos criticos y en el protocolo de comparacion ciega.

## Capacidades

- Edicion de prosa procedimental en ingles para mejorar la claridad.
- Preservacion estricta de hechos, cifras, condiciones, incertidumbres y responsables durante la reescritura.
- Generacion de texto condicionada por plantilla de chat (system + user) con `enable_thinking=False`.
- Instruccion de no anadir hechos no presentes en el original y devolver solo el pasaje revisado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Edicion de avisos legales y textos de cumplimiento: el adaptador reescribe avisos procedimentales en ingles preservando cada condicion y responsable, lo que encaja con la tarea para la que fue entrenado (los ocho avisos de la comparacion son de este tipo).
- Normalizacion de documentacion tecnica interna: se puede pasar un procedimiento redactado de forma confusa y obtener una version mas clara sin alterar pasos ni cifras, siempre con revision humana dado el tamano de la evaluacion.
- Preprocesado en pipelines de publicacion: como paso de clarificacion previo a la revision editorial, con la salvaguarda de que el modelo no debe anadir afirmaciones nuevas.
- Prototipado de metodologias de edicion controlada: sirve como referencia reproducible (receta y codigo publicos) para experimentar con SFT ponderado por tramos criticos en tareas de text-editing.
- Investigacion sobre preservacion factual: util para estudiar tecnicas de ponderacion que reduzcan la introduccion de hechos no soportados en tareas de reescritura.
- Filtrado de borradores en herramientas de escritura asistida: puede integrarse como componente de un editor que proponga una version mas clara de un parrafo, con el usuario como validador final.

## Benchmarks y rendimiento

La model card incluye una comparacion fija de ocho avisos en ingles con revision asistida por modelo (sin evaluador humano independiente), sobre 64 afirmaciones factuales, con seis pasajes que requerian edicion y dos controles ya claros.

| Medida | Resultado |
|---|---|
| Pasajes totalmente aceptables | 3 / 8 |
| Afirmaciones del original preservadas | 55 / 64 |
| Objetivos de edicion requeridos cumplidos | 3 / 6 |
| Entradas copiadas tras normalizar espacios | 2 / 8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre una base de 1.7B, la huella dominante es la del modelo base, no el adaptador (que ocupa practicamente nada en disco).
- GPU recomendadas: no especificadas en la informacion; el autor indica que el rendimiento de generacion depende del dispositivo disponible.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de la base de 1.7B, aunque no se confirma en la model card.
- Opciones de despliegue: carga verificada en CPU con Python 3.12, PyTorch 2.13.0, Transformers 5.22.2, PEFT 0.21.2, Accelerate 1.15.0 y Safetensors 0.8.0, usando `PeftModel.from_pretrained` sobre el modelo base con `dtype=torch.bfloat16` y `device_map="auto"`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Humanizer-Pro-Weighted (este) | LoRA r8 sobre base 1.7B | no disponible | Edicion de prosa en ingles | LFM Open License v1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM3-1.7B (base) | 1.7B | no disponible | Modelo de proposito general | LFM Open License v1.0 | Hugging Face |
| Alternativas de edicion de texto del mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion de muestra muy pequena: ocho avisos y 64 afirmaciones, sin evaluador humano independiente; los resultados (3/8 pasajes aceptables) no permiten extrapolar a produccion.
- Solo ingles: no se documenta soporte de otros idiomas.
- Riesgo de no editar: en 2 de 8 entradas el modelo copio la entrada tras normalizar espacios, lo que puede incumplir el objetivo cuando se requiere una edicion real.
- Riesgo de perdida factual: se preservaron 55 de 64 afirmaciones, es decir, nueve afirmaciones no se conservaron en la comparacion.
- Riesgo de anadir afirmaciones no soportadas: el propio criterio de aceptacion lo contempla como fallo, por lo que conviene validar la salida.
- Uso comercial sujeto a la LFM Open License v1.0 del modelo base; es necesario revisar los terminos y la atribucion (NOTICE) antes de desplegar.
- Adaptador experimental con cero descargas y cero likes en el momento de la consulta; sin mantenimiento ni garantias documentadas.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Weighted
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Codigo y receta de entrenamiento: https://github.com/adybag14-cyber/Humanizer-pro/tree/main/lfm3/alternatives
- Protocolo, resultados y limitaciones de la comparacion: https://github.com/adybag14-cyber/Humanizer-pro/blob/main/lfm3/comparison/RESULTS.md
- Licencia: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Weighted/blob/main/LICENSE
- Atribucion: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Weighted/blob/main/NOTICE
