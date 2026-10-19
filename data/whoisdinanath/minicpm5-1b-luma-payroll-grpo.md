# whoisdinanath/MiniCPM5-1B-Luma-Payroll-GRPO

## Resumen

MiniCPM5-1B-Luma-Payroll-GRPO es un conjunto de adaptadores LoRA publicados por el desarrollador independente whoisdinanath sobre el modelo base openbmb/MiniCPM5-1B. No es un modelo entrenado desde cero: es un artefacto de investigacion que demuestra un pipeline de dos etapas (SFT seguido de GRPO) para ensenar a un modelo de 1B a resolver una porcion concreta de trabajo de nomina bajo un conjunto de reglas ficticio, usando una herramienta `calculate` para la aritmetica y pidiendo aclaracion cuando el registro no determina la respuesta.

La relevancia no esta en el dominio (la nomina es sintetica y las reglas son inventadas), sino en el metodo: el autor publica el barrido de KL, la curva de aprendizaje, los episodios de reward gaming, el analisis de fallos y todas las generaciones y puntuaciones por respuesta. Todo el entrenamiento se hizo en una unica GPU consumer de 6 GB (RTX 3050), con el modelo base cargado en 4 bits NF4 y adaptadores de rango 16.

El resultado principal es que GRPO sobre el modelo SFT sube la tasa de nominas exactas del 45,3% al 69,0% en el split de test, y ese salto procede sobre todo de dejar de rechazar nominas que las reglas si determinan (del 19,0% al 0,0% de rechazos), no de elegir mejor la fila de tipos aplicable. El modelo solo soporta ingles y su licencia es Apache-2.0, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only; arquitectura del modelo base openbmb/MiniCPM5-1B no detallada en la informacion disponible |
| Parametros totales | 1B en el modelo base (segun el identificador); los adaptadores LoRA son de rango 16 y alpha 32 sobre todas las proyecciones de atencion y MLP. Numero exacto de parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base cargado en 4-bit NF4 durante el entrenamiento; pesos del adaptador en safetensors. Cuantizaciones GGUF/AWQ del conjunto no documentadas |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); repo de 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador, no un checkpoint completo. La etapa 1 es SFT: un LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atencion y MLP, entrenado sobre 256 tareas cuyos objetivos provienen del entorno Python de referencia y de la calculadora del gym (dos epocas, learning rate 1e-4), y despues fusionado en el modelo base en bf16. La etapa 2 es GRPO sobre el modelo SFT ya fusionado, con recompensa de la rubrica del gym (version 8), penalizacion KL k3 respecto al modelo SFT congelado, clipping PPO de 0,2, dos epocas por batch, 60 pasos, grupos de 4 a 16 respuestas por tarea y temperatura 0,7. El autor declara explicitamente que ningun modelo de lenguaje escribio una etiqueta ni un objetivo de entrenamiento; un juez GLM solo puntua la explicacion de una aclaracion correcta, con peso 0,10.

La innovacion destacable es metodologica y de verificabilidad: el entorno es un gym con reglas ficticias pero ejecutables, de modo que la recompensa es comprobable y la aritmetica la hace la herramienta `calculate` en lugar del modelo. Se publican siete ejecuciones (`rl-0.04`, `rl-0.001`, `rl-0.001-seed8`, `rl-0.001-seed9`, `rl-0.04-balanced`, `rl-10`, `rl-100`) con checkpoints en los pasos 20 y 40 de `rl-0.04` y `rl-10`, ademas de los logs con recompensa, KL, entropia, longitud de completado y tasa de exito por nivel en cada paso.

## Capacidades

- Generacion de texto en ingles con salida estructurada: produce una nomina mensual a partir de un registro en JSON.
- Tool calling: invoca una herramienta `calculate` para toda la aritmetica en lugar de calcular en el propio modelo.
- Razonamiento de varios pasos acotado: interpreta el conjunto de reglas (mensaje de sistema), la tarea, demostraciones resueltas y la definicion de la herramienta.
- Deteccion de informacion insuficiente: pide aclaracion cuando el registro no determina la respuesta (99,2% de trampas detectadas en test con `rl-0.04`).
- Seleccion de fila de tipos aplicable dentro de la tabla de reglas, con mejora pequena respecto al modelo SFT.
- No dispone de vision, audio, ni modo de pensamiento explicito segun la informacion disponible.
- Multilingue: no; solo ingles.

## Casos de uso

- Investigacion sobre RL con recompensas verificables: reproducir el barrido de KL (beta 0,001 a 100) y la curva de aprendizaje con los checkpoints y logs publicados, para estudiar como la penalizacion KL congela la politica en el modelo SFT.
- Estudio de reward gaming: los `samples.jsonl` y el transcript del juez permiten analizar episodios concretos en los que la politica explota la rubrica, un material poco habitual en publicaciones de adaptadores.
- Prototipado de agentes con tool calling en dominios con reglas ejecutables: sirve como plantilla para tareas donde el calculo debe delegarse a una herramienta y el modelo solo decide que invocar y con que argumentos.
- Docencia y formacion en post-entrenamiento: ejemplo completo y reproducible de SFT + GRPO en una GPU de 6 GB, con configuracion, perdidas por paso y evaluaciones por respuesta.
- Evaluacion de robustez ante cambios de prompt: el propio autor mide la transferencia a 15 peticiones escritas a mano (`evals/transfer-local-*`), lo que permite usar el adaptador como caso de estudio de sensibilidad al formato de entrada.
- Despliegue en hardware muy limitado: al ser un LoRA sobre un base de 1B, cabe en GPUs consumer pequenas y sirve para probar pipelines de inferencia con adaptadores intercambiables.
- Referencia para comparar estrategias de rechazo: la tabla de "refuses a determinable payslip" es un caso concreto de calibracion entre abstenerse y responder.

## Benchmarks y rendimiento

Split de test: 192 tareas de semillas del generador no usadas en entrenamiento, cuatro respuestas por tarea, modo calculadora.

| Modelo | Nominas exactas | Trampas detectadas | Rechaza una nomina determinable | Recompensa media |
|---|---|---|---|---|
| MiniCPM5-1B, congelado | 0,0% | 19,5% | 61,2% | -35,4% |
| SFT | 45,3% | 100,0% | 19,0% | 59,4% |
| SFT + GRPO, beta 0,04 (`rl-0.04`, recomendado) | 69,0% | 99,2% | 0,0% | 76,4% |
| SFT + GRPO, beta 0,001 (`rl-0.001`) | 67,4% | 100,0% | 1,0% | 75,9% |
| SFT + GRPO, beta 0,04, batches balanceados (`rl-0.04-balanced`) | 69,0% | 98,7% | 0,3% | 76,1% |
| SFT + GRPO, beta 10 (`rl-10`) | 47,4% | 100,0% | 20,1% | 60,8% |
| SFT + GRPO, beta 100 (`rl-100`) | 46,1% | 100,0% | 18,8% | 59,9% |

La ganancia de GRPO sobre SFT con beta 0,04 es de +23,7 puntos de nominas exactas (intervalo al 95%: 15,6 a 31,5), atribuida principalmente a la caida de rechazos. Con beta 10 y 100 la penalizacion KL mantiene la politica practicamente en el modelo SFT. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: una unica RTX 3050 de 6 GB, con el base en 4 bits NF4 y LoRA de rango 16.
- VRAM estimada para inferencia: el base en bf16 ocupa del orden de 2 GB de pesos; en 4 bits, menos de 1 GB. Los adaptadores anaden una fraccion minima. Cifras exactas de pico de VRAM no disponibles.
- Cabe en GPU consumer: si, en tarjetas de 6 GB o mas (RTX 3050, RTX 3060, RTX 4060, RTX 4090). No se han publicado medidas en A100/H100.
- Despliegue documentado: `transformers` + `peft`, con carga del adaptador SFT, `merge_and_unload()` y aplicacion posterior del adaptador `rl/rl-0.04/adapter`.
- Otras opciones (vLLM, TGI, llama.cpp, Ollama): no documentadas en la informacion disponible; al tratarse de adaptadores PEFT sobre un base de 1B, requeririan conversion o soporte de LoRA multi-adaptador, no verificado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Nominas exactas (test) | Trampas detectadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM5-1B congelado | 1B | no disponible | 0,0% | 19,5% | Apache-2.0 | HuggingFace |
| SFT (adaptador incluido en este repo) | 1B + LoRA | no disponible | 45,3% | 100,0% | Apache-2.0 | HuggingFace |
| SFT + GRPO beta 0,04 (este modelo) | 1B + LoRA | no disponible | 69,0% | 99,2% | Apache-2.0 | HuggingFace |
| Otros modelos comparables de tool use en nomina | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye otros adaptadores o modelos publicos del mismo dominio con los que comparar. La unica comparacion con datos es interna al repo (base congelado, SFT y las distintas variantes de GRPO).

## Limitaciones y advertencias

- Las reglas de nomina son ficticias y las tareas sinteticas: es un artefacto de investigacion, no un motor de nomina utilizable en produccion.
- La mayoria de configuraciones se ejecutaron una sola vez; solo beta 0,001 tiene dos semillas adicionales, por lo que la varianza entre semillas esta poco caracterizada.
- El modelo fue entrenado con el registro completo en el prompt. En el modo de herramienta alojado del gym, donde los documentos estan detras de busquedas, no produjo ninguna respuesta valida.
- La habilidad esta atada al prompt generado por el gym (conjunto de reglas como mensaje de sistema, tarea en JSON, demostraciones y herramienta `calculate`). Sobre 15 peticiones escritas a mano, el adaptador `rl-0.04` resolvio 4 de 24 respuestas de nomina (frente al 69% en test) y en la mayoria del resto pidio un mes de nomina que el registro ya contenia.
- Riesgo de alucinacion en la parte no aritmetica: aunque la calculadora realiza las operaciones, la seleccion de la fila de tipos y la interpretacion de las reglas las decide el modelo, y la mejora en ese punto fue marginal.
- Idioma limitado al ingles; no hay evaluacion en castellano ni en otros idiomas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0, que permite uso comercial, pero el propio autor desaconseja explicitamente tratarlo como componente de un sistema de nomina real.

## Enlaces

- HuggingFace: https://huggingface.co/whoisdinanath/MiniCPM5-1B-Luma-Payroll-GRPO
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Informe tecnico: https://luma-payroll-sandbox.whoisdinanath.workers.dev/report
- Dashboard y sandbox en vivo: https://luma-payroll-sandbox.whoisdinanath.workers.dev
- Codigo del gym: https://github.com/whoisdinanath/luma-payroll-gym
