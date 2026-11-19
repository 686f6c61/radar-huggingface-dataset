# xf15/agentflow-planner-7b-learned-weights-lora

## Resumen

El repositorio `xf15/agentflow-planner-7b-learned-weights-lora` no contiene un modelo independiente, sino una coleccion de 67 adaptadores LoRA entrenados sobre el modelo base `AgentFlow/agentflow-planner-7b`. Lo publica el usuario xf15 bajo licencia MIT y su proposito es servir como material de experimentacion sobre el entrenamiento de un planificador de agente de busqueda. Cada adaptador corresponde a una epoca concreta de 16 ejecuciones de fine-tuning distintas, lo que permite comparar variantes de ponderacion de ejemplos de entrenamiento.

El modelo base es un planificador de 7.000 millones de parametros (el nombre lo indica, aunque el autor no detalla la arquitectura en la model card) que genera los pasos intermedios de un agente de busqueda que responde preguntas de tipo multihop. Los adaptadores se entrenan sobre trayectorias grabadas de un agente profesor que contesta preguntas de 2WikiMultihopQA y HotpotQA, etiquetadas como correctas o incorrectas segun su respuesta final.

La relevancia de este repositorio es metodologica mas que de producto: contrasta el entrenamiento con pesos fijos (todas las muestras pesan 1) frente a pesos aprendidos (cada paso de entrenamiento tiene su propio peso, actualizado por epoca con el gradiente de una perdida de validacion). Es un banco de pruebas para quienes investigan la ponderacion de datos en el ajuste fino de planificadores de agentes, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.0) sobre el modelo base `AgentFlow/agentflow-planner-7b`; arquitectura del base no detallada en la model card |
| Parametros totales | 7.000 millones (por el nombre del modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se guardan en `safetensors`; el autor declara parametros del adaptador en 32 bits y computo en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`adapter_model.safetensors` + `adapter_config.json` por checkpoint) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0.0 aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base `AgentFlow/agentflow-planner-7b` (revision `b8b07b0eff8d3b4285c200838d54a19b9949e527`). El optimizador del modelo es AdamW con learning rate 0.0001, betas 0.9 y 0.999, epsilon 1e-5, epsilon bajo la raiz 1e-10 y weight decay 0.01. Los parametros del adaptador se guardan en 32 bits y el computo se hace en bfloat16. La semilla es 42.

Los datos de entrenamiento son trayectorias grabadas de un agente de busqueda profesor que responde preguntas de 2WikiMultihopQA y HotpotQA. Cada trayectoria se etiqueta como correcta o incorrecta segun su respuesta final, y cada ejemplo de entrenamiento es un paso de una trayectoria. El conjunto de validacion, usado para aprender los pesos, tiene 64 trayectorias correctas y 64 incorrectas; el de test, 160 correctas y 160 incorrectas. La innovacion del repositorio es la ponderacion aprendida: en las ejecuciones con pesos fijos cada paso pesa 1, mientras que en las de pesos aprendidos cada paso tiene su propio peso, que arranca en 1 y se actualiza una vez por epoca con el gradiente de una perdida de validacion (perdida por token en las trayectorias correctas menos la de las incorrectas, salvo que la tabla indique otra cosa). Se exploran variantes de limitacion del rms de la actualizacion de pesos (0.3 y 0.6), actualizacion con Adam (step 0.6), pesos como softplus de un parametro libre, warmup con decaimiento coseno del learning rate del modelo, y distintos valores de weight decay y epsilon de AdamW. Algunas ejecuciones quedan marcadas como degradadas, colapsadas o con una sola epoca, lo que documenta fallos del procedimiento.

## Capacidades

- Generacion de pasos intermedios de planificacion para un agente de busqueda que responde preguntas multihop.
- Razonamiento multi-step sobre preguntas de 2WikiMultihopQA y HotpotQA, segun los datos de entrenamiento declarados.
- Aprendizaje a partir de trayectorias etiquetadas por correccion de la respuesta final.
- No se documentan capacidades de tool calling, function calling ni uso de agentes mas alla del planificador de busqueda.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre ponderacion de datos en ajuste fino: comparar los checkpoints de `fixed-weights` con los de `learned-weights` para medir el efecto de reponderar pasos de trayectoria en el planificador.
- Reproduccion de experimentos de agentes de busqueda: cargar cualquiera de los 67 adaptadores con `PeftModel.from_pretrained` sobre el modelo base fijado a la revision indicada y evaluar sobre el conjunto de test de 160+160 trayectorias.
- Estudio de estabilidad del entrenamiento: los checkpoints marcados como degradados o colapsados (`adamw-epsilon-1e-8`, `adamw-epsilon-1e-7`) sirven como casos negativos para analizar sensibilidad a hiperparametros.
- Analisis de limitacion de actualizaciones: las variantes con limite de rms 0.3 y 0.6 permiten estudiar el efecto de acotar la magnitud de los pesos aprendidos.
- Docencia y formacion: usar los adaptadores como ejemplo practico de LoRA multi-checkpoint y de entrenamiento con pesos por muestra.
- Base para experimentos propios: partir de un checkpoint concreto (por ejemplo, `fixed-weights/correct-trajectories-only/epoch-10`) y continuar el ajuste con otro dataset de trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la estructura de los experimentos y el estado de cada ejecucion (ok, degradado, colapsado, una sola epoca), pero no incluye metricas numericas de rendimiento del planificador.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base de 7.000 millones de parametros; en bfloat16 se estiman aproximadamente 14 GB solo para pesos, mas overhead de activaciones y cache KV. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para el modelo base en bfloat16; GPUs con menos VRAM requeririan cuantizacion del base, no documentada aqui.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB) con el base en bfloat16; en GPUs de 16 GB haria falta cuantizar el base.
- Opciones de despliegue: el autor documenta carga via `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `xf15/agentflow-planner-7b-learned-weights-lora` | 7B (base) + LoRA | no disponible | MIT | Hugging Face, 0 descargas | 67 adaptadores de experimentacion |
| `AgentFlow/agentflow-planner-7b` (base) | 7B | no disponible | no disponible en la informacion proporcionada | Hugging Face | Modelo base sobre el que se aplican los LoRA |
| Alternativas de planificador de agente de 7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el base `AgentFlow/agentflow-planner-7b` en la revision `b8b07b0eff8d3b4285c200838d54a19b9949e527`; usar otra revision puede romper la compatibilidad del adaptador.
- El repositorio pesa 10 GB y contiene 67 checkpoints; no esta pensado para descarga ligera ni para despliegue directo.
- Entrenado exclusivamente sobre trayectorias de 2WikiMultihopQA y HotpotQA; el rendimiento fuera de ese dominio no esta documentado.
- Varias ejecuciones estan marcadas como degradadas, colapsadas o con una sola epoca; no deben usarse como checkpoints de referencia sin validacion previa.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- Idiomas soportados no disponibles; no se garantiza comportamiento multilingue.
- La licencia MIT aplica al repositorio de adaptadores, pero el uso comercial del modelo base depende de la licencia de `AgentFlow/agentflow-planner-7b`, no indicada en la informacion disponible.
- El autor no publica resultados de benchmarks, por lo que no hay evidencia cuantitativa de mejora frente al base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xf15/agentflow-planner-7b-learned-weights-lora
- Modelo base: https://huggingface.co/AgentFlow/agentflow-planner-7b
- Revision del modelo base: https://huggingface.co/AgentFlow/agentflow-planner-7b/tree/b8b07b0eff8d3b4285c200838d54a19b9949e527
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria Transformers: https://github.com/huggingface/transformers
