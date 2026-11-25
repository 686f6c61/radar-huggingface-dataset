# Tdamre/LFM3-1.7B-Humanizer-Pro-Seed-57303

## Resumen

LFM3-1.7B-Humanizer-Pro-Seed-57303 es un adaptador PEFT (LoRA) de caracter experimental publicado por el usuario Tdamre sobre el modelo base LiquidAI/LFM3-1.7B. Su proposito concreto es la edicion de prosa procedimental en ingles: reescribir pasajes para mejorar su claridad preservando de forma estricta cada hecho, cifra, condicion, incertidumbre y responsable mencionado en el texto original. No es un modelo de proposito general, sino un ajuste fino orientado a una tarea de edicion factual.

El adaptador se entrena con una receta supervisada muy pequena: 48 pares de ejemplo, una epoca y 48 actualizaciones, con LoRA de rango 8, alpha 16, learning rate 0.00005 y semilla 57303. El modelo base permanece congelado en una revision concreta (0dc4268b561499c648c7ba7c9466bf3d8d01517a) y los pesos del adaptador se copiaron sin modificar del primer entrenamiento completado, con SHA-256 verificado.

Su relevancia es acotada pero ilustrativa: documenta de forma reproducible una receta de edicion factual con protocolo de evaluacion publico, algo poco habitual en adaptadores de este tamano. Es un artefacto de investigacion y replicacion, no un modelo listo para produccion, y su evaluacion se limita a ocho avisos en ingles con revision asistida por modelos, sin evaluador humano independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm-open-license-1.0 (Liquid AI LFM Open License v1.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 16 aplicado sobre el modelo base congelado LiquidAI/LFM3-1.7B, fijado en la revision 0dc4268b561499c648c7ba7c9466bf3d8d01517a. El entrenamiento consistio en una epoca sobre 48 pares supervisados de edicion factual, lo que equivale a 48 actualizaciones con learning rate 0.00005 y semilla 57303. Los pesos del adaptador se copiaron sin cambios del primer entrenamiento completado y su integridad esta verificada por SHA-256 (76d5ac206af77653061a1728a2a0c986ea9073bfadcc969042733a0e9cc0de0c).

La receta y el codigo fuente son publicos en el repositorio del autor. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset mas alla de los 48 pares, ni si hubo RLHF o DPO; dado el caracter de replicacion de semilla, se trata de un ajuste supervisado de una sola pasada. El entorno probado es Python 3.12, PyTorch 2.13.0, Transformers 5.22.2, PEFT 0.21.2, Accelerate 1.15.0 y Safetensors 0.8.0, con carga del adaptador verificada en CPU.

## Capacidades

- Edicion de prosa procedimental en ingles para mejorar la claridad.
- Preservacion explicita de hechos, numeros, condiciones, incertidumbres y responsables durante la reescritura.
- Generacion de texto condicionada por una plantilla de chat con instruccion de sistema especifica.
- Modo de generacion determinista en el ejemplo documentado (do_sample=False).
- Soporte de `enable_thinking=False` en la plantilla de chat del modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Edicion de avisos y comunicaciones internas: reescribir avisos procedimentales en ingles manteniendo cifras y condiciones intactas, que es exactamente la tarea del conjunto de evaluacion fijo del autor.
- Normalizacion de documentacion tecnica: pasar pasajes de manuales o guias por el adaptador para mejorar legibilidad sin alterar datos tecnicos.
- Replicacion de investigacion: reproducir la receta de 48 pares y semilla 57303 para estudiar la variabilidad de adaptadores LoRA de bajo rango en tareas de edicion factual.
- Generacion de pares de entrenamiento: usar las reescrituras como candidatos para construir datasets de edicion supervisada, con revision posterior.
- Evaluacion de preservacion factual: servir como linea base pequena para comparar metodos de edicion que priorizan la fidelidad sobre la fluidez.
- Prototipado en CPU: gracias a la carga verificada en CPU del adaptador sobre un base de 1.7B, permite experimentar en entornos sin GPU, aunque con latencia dependiente del dispositivo.

## Benchmarks y rendimiento

La unica evaluacion publicada es la comparacion fija de ocho avisos en ingles, con revision asistida por modelos y sin evaluador humano independiente:

| Medida | Resultado |
|---|---|
| Pasajes totalmente aceptables | 5 / 8 |
| Afirmaciones del original preservadas | 54 / 64 |
| Objetivos de edicion requeridos cumplidos | 3 / 6 |
| Entradas copiadas tras normalizar espacios | 0 / 8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; el modelo base tiene 1.7B parametros y el adaptador LoRA anade una carga minima.
- GPU recomendadas: no especificadas en la informacion; el ejemplo documentado usa `device_map="auto"` con bfloat16.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del base (1.7B), aunque no se aportan medidas concretas de VRAM.
- Carga en CPU: verificada para esta release; el rendimiento de generacion depende del dispositivo disponible.
- Opciones de despliegue: PEFT + Transformers (documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Humanizer-Pro-Seed-57303 | LoRA sobre base 1.7B | no disponible | Edicion factual en ingles | lfm-open-license-1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM3-1.7B | 1.7B | no disponible | Modelo base de proposito general | lfm-open-license-1.0 | Hugging Face |
| Alternativas de edicion de texto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables con otros adaptadores de edicion de texto en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se documenta soporte multilingue.
- Dataset de entrenamiento muy reducido (48 pares, una epoca), lo que limita la generalizacion.
- Evaluacion sobre solo ocho avisos y con revisores automaticos, sin evaluador humano independiente; resultados de muestra pequena.
- Solo 54 de 64 afirmaciones se preservaron y solo 3 de 6 objetivos de edicion se cumplieron en la comparacion publicada, lo que indica riesgo real de perdida de fidelidad factual.
- Riesgo de alucinacion y de introducir afirmaciones no respaldadas por el texto original, pese a la instruccion de no anadir hechos.
- No se documentan sesgos conocidos; al ser un adaptador pequeno sobre un base general, hereda los sesgos del modelo base.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial; no es una licencia permisiva estandar.
- Caracter experimental y de replicacion: cero descargas y cero likes en el momento de la consulta, sin senales de uso en produccion.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Seed-57303
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Codigo fuente de entrenamiento: https://github.com/adybag14-cyber/Humanizer-pro/tree/main/lfm3/replicates
- Protocolo y resultados de la comparacion: https://github.com/adybag14-cyber/Humanizer-pro/blob/main/lfm3/comparison/RESULTS.md
