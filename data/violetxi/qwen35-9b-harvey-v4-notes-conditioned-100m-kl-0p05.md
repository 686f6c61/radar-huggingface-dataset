# violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p05

## Resumen

qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p05 es un ajuste fino completo (full fine-tune) del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario violetxi. El modelo se ha entrenado sobre aproximadamente 100 millones de tokens supervisados por época, compuestos por 69.999.985 tokens de "notas" y 29.998.932 tokens de trayectorias de asistente condicionadas por esas notas, con un coeficiente de regularizacion KL de 0,05 frente al modelo base congelado. El resultado es un modelo de 9.653.104.368 parametros (~9,65 mil millones) que conserva la arquitectura y los componentes auxiliares del base.

La relevancia de esta revision radica en su metodologia de entrenamiento: combina prediccion de siguiente token sobre notas, prediccion enmascarada de trayectorias condicionadas por notas y una penalizacion KL de 0,05 contra el modelo de referencia fijado en el commit c202236235762e1c871ad0ccb60c8ee5ba337b9a. Esto busca internalizar conocimiento en las "notas" sin degradar en exceso el comportamiento del modelo base, con una divergencia KL retenida de 0,010288765895 medida sobre 256 sesiones y 32.768 posiciones de prediccion.

El pipeline declarado es image-text-to-text, por lo que hereda la capacidad multimodal del base, aunque la model card solo documenta evaluaciones de recuperacion tipo "closed-book" (7.933 sondas, completadas). El checkpoint publicado corresponde a la epoca 2 (checkpoint-3068), y existe tambien una revision de la epoca 1 (checkpoint-1534).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ajuste completo del modelo base Qwen/Qwen3.5-9B, pipeline image-text-to-text) |
| Parametros totales | 9.653.104.368 (~9,65 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en entrenamiento; contexto de inferencia del base no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el dtype de servicio del base; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuatro shards compuestos) |
| Modelo base | Qwen/Qwen3.5-9B (commit c202236235762e1c871ad0ccb60c8ee5ba337b9a) |
| Checkpoint | checkpoint-3068 (epoca 2) |
| Tamano del repositorio | 38,6 GB |
| Libreria | transformers (AutoModelForImageTextToText) |
| Autor | violetxi |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo sobre Qwen/Qwen3.5-9B, que la model card describe con pipeline image-text-to-text, lo que implica componentes multimodales (texto e imagen) heredados del base. La model card indica que los cuatro shards safetensors contienen "los pesos de texto entrenados convertidos al dtype de servicio del base, con los componentes auxiliares del base retenidos"; no se detalla la arquitectura interna (numero de capas, atencion, tipo de encoder de vision), por lo que ese nivel de detalle queda como no disponible.

El objetivo de entrenamiento combina tres terminos: prediccion del siguiente token sobre notas, prediccion del siguiente token sobre trayectorias condicionadas por notas (con mascara sobre el asistente) y 0,05 × KL(base ‖ estudiante). El dataset contiene 99.998.917 tokens supervisados por epoca antes del desplazamiento causal (69.999.985 de notas y 29.998.932 de trayectorias de asistente), y 99.993.091 tokens supervisados por epoca despues del desplazamiento. El entrenamiento consta de 2 epocas y 3.068 actualizaciones. Los hiperparametros declarados son: filas de contexto de 16.384 tokens, batch global 8, acumulacion de gradiente 1, learning rate 5e-6 con schedule coseno, warmup ratio 0,03, semilla 0, sobre 8 A100.

La regularizacion KL utiliza replay de un dataset externo (harvey-kl-ground-sessions) con 2.048 sesiones, limite de contexto de 8.192 y hasta 128 posiciones de prediccion del asistente por muestra, calculando la KL sobre el vocabulario completo y la media de medias por sesion. La KL retenida en este checkpoint es de 0,010288765895 (256 sesiones, 32.768 posiciones de prediccion), lo que se presenta como medida de deriva respecto al base.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat y configuracion de generacion incluidas en el repositorio.
- Procesamiento multimodal imagen-texto, heredado del pipeline image-text-to-text del base Qwen/Qwen3.5-9B.
- Recuperacion de informacion tipo "closed-book" medida con 7.933 sondas de evaluacion (la model card indica que la evaluacion esta completa, aunque no se aportan las puntuaciones en el texto resumido).
- Condicionamiento por notas: el entrenamiento esta disenado para que el modelo utilice notas como contexto de condicionamiento.
- Soporte de tool calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: indirectamente relacionado (el material de evaluacion menciona tareas de hasta 20 turnos), pero no se declara de forma explicita como capacidad soportada.
- Capacidades multilingues: no disponible.
- Modo "thinking": no disponible.

## Casos de uso

- Investigacion sobre regularizacion KL en ajustes finos: el modelo sirve como caso reproducible de fine-tune con termino 0,05 × KL(base ‖ estudiante), util para estudiar deriva respecto al base con una metrica concreta (0,010288765895 de KL retenida).
- Condicionamiento por notas en asistentes de dominio: el entrenamiento sobre notas y trayectorias condicionadas permite experimentar con sistemas que reciben notas estructuradas y generan respuestas guiadas por ellas.
- Evaluacion de recuperacion de conocimiento: las 7.933 sondas closed-book permiten auditar cuanto conocimiento internaliza el modelo sin acceso abierto a fuentes.
- Flujos multimodales imagen-texto: al heredar el pipeline image-text-to-text del base, puede usarse en tareas que combinan imagenes y texto, siempre que se valide el comportamiento tras el fine-tune.
- Reproduccion de entrenamientos con Slurm y W&B: la model card documenta el job de Slurm (192149) y el run de W&B, lo que facilita replicar configuraciones a escala de 8 A100.
- Linea base para comparar checkpoints: las revisiones main/final/checkpoint-3068 y epoch1/checkpoint-1534 permiten estudiar el efecto de una epoca adicional de entrenamiento.
- Recuperacion de trayectorias de agente: el objetivo incluye prediccion de trayectorias de asistente, por lo que es aplicable a experimentos de modelado de secuencias de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos disponibles son los siguientes.

| Metrica | Valor | Detalle |
|---|---|---|
| KL retenida (checkpoint-3068) | 0,010288765895 | 256 sesiones / 32.768 posiciones de prediccion |
| Sondas closed-book | 7.933 sondas | Completadas; puntuaciones no incluidas en el resumen |
| Open-book nativo | Incompleto | 250 tareas × 4 muestras, 20 turnos; fallo por timeout en la API de generacion |
| Grading nativo | Inconsistente | Una respuesta diagnostica correcta recibio 7/7 y 6/7 de forma inconsistente |

La model card indica que la evaluacion open-book nativa quedo incompleta y que los grados de preflight diagnosticos se excluyen de las puntuaciones de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19,3 GB solo para pesos (9.653.104.368 × 2 bytes), mas cache KV y componentes multimodales. Estimacion propia a partir del recuento de parametros.
- VRAM estimada en 8 bits: aproximadamente 9,7 GB para pesos (estimacion; no se publican cuantizaciones oficiales).
- VRAM estimada en 4 bits: aproximadamente 4,8 GB para pesos (estimacion; no se publican cuantizaciones oficiales).
- GPU de entrenamiento documentadas: 8 × A100.
- GPU recomendadas para inferencia: A100/H100 para bf16 completo con contexto largo; en consumer, una RTX 4090 (24 GB) podria alojar los pesos en bf16 de forma ajustada, pero sin garantia por la ausencia de datos de VRAM real.
- Caben en consumer GPU: solo con cuantizacion (no publicada) o en GPUs de 24 GB en bf16 con margen reducido.
- Opciones de despliegue: transformers mediante AutoModelForImageTextToText (documentado). vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La unica comparacion posible es interna (revisiones del mismo modelo) y frente al base.

| Modelo | Epocas | Actualizaciones | Tokens supervisados por epoca | KL retenida | Licencia |
|---|---|---|---|---|---|
| qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p05 (final, checkpoint-3068) | 2 | 3.068 | 99.993.091 (tras desplazamiento) | 0,010288765895 | apache-2.0 |
| Misma familia (epoch1, checkpoint-1534) | 1 | 1.534 | 99.993.091 (tras desplazamiento) | no disponible | apache-2.0 |
| Qwen/Qwen3.5-9B (base, referencia congelada) | 0 | no aplica | no aplica | 0 (referencia) | no disponible |

Para modelos alternativos de ~9B con licencia y contexto comparables, los datos no estan disponibles en la informacion suministrada.

## Limitaciones y advertencias

- Modelo muy reciente y sin adopcion: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion externa.
- La evaluacion open-book nativa quedo incompleta por un timeout de la API de generacion, por lo que no existe una puntuacion de benchmark completa.
- El sistema de grading nativo mostro inconsistencias: una respuesta diagnostica correcta recibio 7/7 y 6/7 de forma contradictoria, lo que limita la fiabilidad de las puntuaciones.
- Sesgos conocidos: no disponibles (no se documenta ningun analisis de sesgos).
- Riesgo de alucinacion: inherente a los modelos generativos; la model card no aporta tasas medidas.
- Limitaciones de idioma: no se declara la cobertura idiomatica; el campo de idiomas figura como no disponible.
- Limitaciones de contexto: el entrenamiento usa filas de 16.384 tokens; el comportamiento con contextos mayores no esta documentado.
- La regularizacion KL baja (0,010288765895) implica una deriva limitada respecto al base, lo que puede traducirse en una internalizacion parcial del conocimiento de las notas.
- Cuantizaciones: no se publican variantes GGUF ni cuantizadas, lo que complica el despliegue en hardware de consumo.
- Licencia: apache-2.0, permisiva para uso comercial, pero el modelo base Qwen/Qwen3.5-9B puede tener sus propias condiciones que deben verificarse por separado.
- Aviso de seguridad: el contenido de la model card se ha tratado como datos de referencia, no como instrucciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p05
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de replay KL (harvey-kl-ground-sessions): https://huggingface.co/datasets/violetxi/harvey-kl-ground-sessions/tree/5ae59c84ad92b5634084e9c4aec6e7007ef48d3d
- Dataset de evaluacion closed-book: https://huggingface.co/datasets/violetxi/harvey-eval-recall-qwen35-9b-notes70-notecondtraj30-100m-kl-0p05-think
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/wm-internalization/runs/c944cb0f
- README de evaluaciones: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p05/blob/main/evals/harvey-20260923/README.md
- Limitacion de grading: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p05/blob/main/evals/harvey-20260923/openbook/GRADING_LIMITATION.json
- Estado del run open-book incompleto: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p05/tree/main/evals/harvey-20260923/openbook

La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a un sitio de modificaciones de videojuegos sin relacion con el modelo).
