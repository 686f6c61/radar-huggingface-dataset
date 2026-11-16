# U-WIN/qwen35-9b-equational-theory-sair-notes1m-noref-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-notes1m-noref-rollout-notes-ntp-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el grupo U-WIN en noviembre de 2026 en el marco de su trabajo de internalizacion de teoria ecuacional. El nombre describe el conjunto de datos de entrenamiento, no el numero de parametros: el checkpoint real contiene 9.653.104.368 parametros. Se trata de un experimento de investigacion sobre como un modelo puede aprender a escribir notas de estudio sobre sus propios intentos de resolucion de problemas sin disponer de una solucion de referencia.

El modelo parte de Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y se entrena con prediccion del siguiente token sobre una mezcla de 1.000.081 tokens de notas de estudio del modelo base y 5.602.485 tokens de "rollout notes" generadas por el propio modelo base al revisar sus intentos de resolver implicaciones de teoria ecuacional, sin solucion de referencia. El entrenamiento incorpora una regularizacion KL de 0,01 contra el modelo base sobre un pool de trayectorias congelado.

Es relevante como pieza de investigacion en el area de auto-mejora y aprendizaje de razonamiento sin supervisión de referencia, no como modelo de produccion: el propio autor declara explicitamente que no ha sido evaluado en ningun benchmark y que las cifras publicadas son unicamente perdidas de entrenamiento y validacion. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors compatibles con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-9B; pesos de texto ajustados, vision congelada |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del checkpoint Qwen3.5-9B, un transformer multimodal de tipo image-text-to-text. Solo se ajustaron los pesos de lenguaje (427 tensores); los componentes de vision permanecen congelados y no fueron evaluados para calidad multimodal. El repositorio incluye configuracion completa, tokenizer, chat template y procesadores.

El entrenamiento consistio en prediccion del siguiente token sobre filas empaquetadas de 17.408 tokens (una fila por GPU), durante 2 epochs, con learning rate 5e-06, decaimiento coseno y 3% de warmup, mas una regularizacion `0.01 x KL(base || student)` sobre un pool de repeticion congelado de trayectorias generadas por el modelo base (nunca como objetivo). Se ejecuto en 8 GPU GH200, con 98 pasos de optimizador y 32 minutos de entrenamiento (job Slurm 1146590 en TACC Vista, 16 de noviembre de 2026).

Los datos combinan 1.695 notas de estudio del modelo base (1.000.081 tokens, prefijo del orden sembrado de `notes_ntp_kl_20261012`) y 5.609 notas de rollout escritas por el modelo base al revisar sus propios intentos sobre 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas), sin solucion de referencia. Segun una lectura por expresion regular, aproximadamente el 8% de las notas concluyen solo el veredicto incorrecto y cerca de la mitad mencionan al juez o a una rubrica. Las notas no estan publicadas.

## Capacidades

- Generacion de texto y razonamiento sobre teoria ecuacional (dominio especifico del ajuste).
- Escritura de notas de estudio y auto-revision de intentos de resolucion de problemas.
- Capacidades multimodales heredadas de Qwen3.5-9B (image-text-to-text), aunque los pesos de vision no se ajustaron ni evaluaron.
- Soporte de conversacion multi-turno mediante chat template incluido.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre auto-mejora sin referencia: el modelo sirve para estudiar como un modelo aprende a escribir notas a partir de sus propios intentos y evaluaciones de un juez, sin solucion correcta disponible. Es adecuado porque el checkpoint fue entrenado exactamente para esa tarea.
- Analisis de internalizacion de teoria ecuacional: permite comparar el comportamiento del modelo ajustado frente al base en tareas de implicacion ecuacional, midiendo la perdida de validacion sobre notas de estudio (0,413 frente a 1,245 del base).
- Experimentos de regularizacion KL: util como referencia reproducible de un ajuste con `KL(base || student)` de 0,01 sobre trayectorias congeladas, para estudiar el equilibrio entre adaptacion y deriva respecto al base.
- Generacion de notas de estudio sinteticas: puede emplearse para producir notas sobre problemas de un dominio acotado, siempre que se valide su correccion, dado que no hay garantia de veredicto correcto.
- Estudio de sesgos inducidos por el juez: apropiado para analizar como el vocabulario derivado de la rubrica del juez se filtra en las notas generadas.
- Base para posteriores ajustes: al ser un full fine-tune con licencia Apache 2.0 y pesos en safetensors, puede servir como punto de partida para nuevos experimentos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado y que las cifras son perdidas de entrenamiento y validacion:

| Metrica | Epoch 1 (`epoch-1`) | Epoch 2 (`main`) | Base |
|---|---|---|---|
| Perdida media de entrenamiento | 0,721 | 0,543 | no disponible |
| Perdida held-out en notas de estudio originales | 0,429 | 0,413 | 1,245 |
| Perdida held-out en trayectorias del modelo base | 0,135 | 0,133 | 0,145 |
| KL(base \|\| student) en pool de validacion | 0,059 | 0,053 | no disponible |

El conjunto held-out no contiene notas de rollout, por lo que ninguna cifra mide el ajuste a notas de rollout no vistas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 9.653 millones de parametros, en precision completa (bf16) serian necesarios aproximadamente 19,3 GB solo para pesos, mas memoria para activaciones y cache KV.
- GPU recomendadas: el entrenamiento uso 8 GPU GH200; para inferencia no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; por tamano, un modelo de ~9,6B en bf16 no cabe en GPU de consumo de 16 GB sin cuantizacion, y no se publican cuantizaciones.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` + `AutoProcessor`), con `dtype="auto"` y `device_map="auto"`; otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (U-WIN) | 9,65B | no disponible | no evaluado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B (no confirmado) | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Alternativas de ~9B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo no evaluado: no ha sido puntuado en ningun benchmark; las cifras publicadas son solo perdidas.
- Calidad de las notas no verificada: aproximadamente el 8% de las notas de entrenamiento concluyen solo el veredicto incorrecto, y cerca de la mitad mencionan al juez o a una rubrica; el modelo puede reproducir estos patrones.
- Filtracion de la rubrica: las evaluaciones del juez se redactaron contra una rubrica derivada de la solucion de referencia, por lo que puede aparecer vocabulario derivado de la referencia en las notas.
- Riesgo de alucinacion: sin solucion de referencia en el entrenamiento, el modelo puede generar conclusiones plausibles pero incorrectas sobre implicaciones ecuacionales.
- Componente de vision no evaluado: los pesos multimodales son los del modelo base y no se comprobaron para calidad.
- Idiomas y contexto: no disponibles; no se puede garantizar el comportamiento multilingue ni la ventana de contexto efectiva.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un artefacto de investigacion sin evaluacion, no es recomendable para produccion sin validacion propia.
- Las notas de entrenamiento no estan publicadas, lo que limita la reproducibilidad completa del experimento.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes1m-noref-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefn1mr20261116
- Repositorio del proyecto (ruta indicada en la model card): `recipe/equational_internalization/experiments/rollout_notes_noref_vista_20261116/README.md`
