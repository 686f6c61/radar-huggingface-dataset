# U-WIN/qwen35-9b-equational-theory-sair-notes350m-noref-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-notes350m-noref-rollout-notes-ntp-kl-0p01` es un ajuste fino completo del checkpoint base Qwen3.5-9B, desarrollado por el grupo U-WIN en el marco de su trabajo de internalizacion de teoria ecuacional. Resuelve un problema muy concreto de investigacion: hacer que el modelo asimile notas de estudio y notas de "rollout" generadas por el propio modelo base al revisar sus intentos de resolucion de implicaciones ecuacionales, sin disponer de solucion de referencia. El nombre del repositorio describe el conjunto de datos de entrenamiento, no el numero de parametros, que asciende a 9.653.104.368.

El entrenamiento combina 350 millones de tokens de notas de estudio del modelo base (587.537 notas) con 5,6 millones de tokens de notas de rollout sin referencia (5.609 notas), todo ello mediante prediccion del siguiente token y una regularizacion KL de 0,01 contra el modelo base sobre un pool de trayectorias congeladas. Se trata de un experimento de investigacion, no de un modelo de proposito general: el autor declara explicitamente que no ha sido evaluado en ningun benchmark y que las cifras publicadas son exclusivamente perdidas de entrenamiento y validacion.

La relevancia actual es metodologica: documenta con detalle poco habitual la procedencia de los datos, el regimen de entrenamiento (8 x GH200, 5.230 pasos, 444 minutos) y las limitaciones del corpus de notas, incluyendo que aproximadamente el 8% de las notas de rollout concluyen solo el veredicto incorrecto. La arquitectura subyacente es la de Qwen3.5-9B, un modelo multimodal de tipo image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen3.5-9B |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el export de servicio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3.5-9B` (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo de todos los pesos de lenguaje; los componentes de vision se mantienen intactos y no fueron evaluados por calidad multimodal. El entrenamiento usa prediccion del siguiente token sobre filas empaquetadas de 17.408 tokens (una fila por GPU), durante 2 epocas, con tasa de aprendizaje 5e-06, decaimiento coseno y 3% de warmup, mas un termino de regularizacion `0.01 x KL(base || student)` calculado sobre un pool de replay congelado de trayectorias ecuacionales generadas por el modelo base. La infraestructura fue de 8 x GH200, 5.230 pasos de optimizador y 444 minutos en el job Slurm 1146585 de TACC Vista (16 de noviembre de 2026).

El corpus de entrenamiento suma 355.613.770 tokens (20.916 filas empaquetadas por epoca): 350.011.285 tokens de notas de estudio (587.537 notas, prefijo de nota completa del orden sembrado de `notes_ntp_kl_20261012`) mas 5.602.485 tokens de notas de rollout (5.609 notas, mediana de 963 tokens por nota). Las notas de rollout fueron escritas por el Qwen3.5-9B base al revisar sus propios intentos puntuados por un juez, sin solucion de referencia, sobre 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas), en sesiones con acceso limitado a lectura, glob y grep (maximo 20 respuestas). El autor advierte que ninguna nota fue verificada contra el veredicto correcto y que el juez se baso en una rubrica derivada de la solucion de referencia, por lo que puede haber filtracion de formulaciones derivadas de la referencia. Las notas no se publican. Las perdidas de validacion al final de la epoca 2 fueron 0,233 sobre notas de estudio originales (base: 1,245), 0,126 sobre trayectorias del modelo base (base: 0,145) y una KL de 0,029 en el pool de validacion.

## Capacidades

- Generacion de texto y prediccion del siguiente token, heredadas del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque los pesos de vision no fueron ajustados ni evaluados.
- Razonamiento sobre implicaciones de teoria ecuacional, el dominio especifico del ajuste.
- Escritura de notas de analisis a partir de trazas de intentos previos, el comportamiento inducido por el corpus de rollout.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito, vision o audio especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre internalizacion de conocimiento: el modelo sirve como punto de comparacion para estudiar si un ajuste fino sobre notas de estudio y notas de rollout mejora la asimilacion de teoria ecuacional frente al modelo base, usando las perdidas de validacion publicadas como referencia.
- Analisis de notas auto-generadas: permite reproducir el regimen en el que el modelo escribe notas de revision a partir de sus propios intentos, util para estudiar la fidelidad de la auto-reflexion sin solucion de referencia.
- Estudio de regularizacion KL en ajuste fino: el checkpoint documenta el efecto de un termino KL de 0,01 sobre un pool de replay congelado, con la KL de validacion medida (0,034 en epoca 1, 0,029 en epoca 2), lo que lo hace util como caso de control en experimentos de olvido catastrofico.
- Evaluacion de sesgos de juez y rubrica: dado que cerca de la mitad de las notas mencionan al juez o una rubrica y un 8% concluyen solo el veredicto incorrecto, el modelo es un sujeto de estudio para medir como se propaga el sesgo del evaluador al corpus de entrenamiento.
- Reproducibilidad de experimentos a gran escala: el repositorio incluye `training_summary.json` con el digesto del registro de lanzamiento y `artifact_manifest.json` con el sha256 de cada fichero, lo que facilita la auditoria de resultados.
- Servicio de inferencia multimodal en investigacion: al conservar el procesador, la plantilla de chat y los componentes de vision del modelo base, puede desplegarse con `transformers` para prototipos de analisis imagen-texto, aunque sin garantias de calidad multimodal evaluada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que ninguna revision del modelo ha sido puntuada en ningun benchmark y que las cifras publicadas son perdidas de entrenamiento y validacion.

| Metrica | Epoca 1 (`epoch-1`) | Epoca 2 (`main`) | Modelo base |
|---|---|---|---|
| Perdida media de entrenamiento | 0,289 | 0,218 | no aplica |
| Perdida en notas de estudio (held-out) | 0,249 | 0,233 | 1,245 |
| Perdida en trayectorias del base (held-out) | 0,126 | 0,126 | 0,145 |
| KL(base \|\| student) en pool de validacion | 0,034 | 0,029 | no aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo denso de 9.653 millones de parametros en bf16 requiere aproximadamente 19,3 GB solo para pesos, mas memoria para activaciones y cache KV; en cuantizacion de 8 bits rondaria los 9,7 GB y en 4 bits unos 4,8 GB, aunque estas cifras son estimaciones genericas y no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizo en 8 x GH200, lo que indica que el ajuste fino completo requiere hardware de centro de datos. Para inferencia no se especifican GPU en la model card.
- Cabe en GPU de consumo: no confirmado por el autor. Por tamano, seria viable en GPUs con 24 GB o mas en bf16 y en GPUs de 12-16 GB con cuantizacion agresiva, pero no hay validacion publicada.
- Opciones de despliegue: la model card solo documenta carga con `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor` con `dtype="auto"` y `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el repositorio no publica pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado de evaluacion | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (U-WIN, Qwen3.5-9B ajustado) | 9.653.104.368 | no disponible | apache-2.0 | Sin benchmarks; solo perdidas | Hugging Face, safetensors |
| Qwen/Qwen3.5-9B (base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | No indicado | Hugging Face |
| Otros ajustes de teoria ecuacional de U-WIN | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la informacion proporcionada, por lo que la comparativa cuantitativa con alternativas de la misma categoria no es posible.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara que ninguna revision ha sido puntuada en ningun benchmark; las cifras de perdida no miden capacidad downstream.
- Corpus de entrenamiento ruidoso: aproximadamente el 8% de las notas de rollout concluyen solo el veredicto incorrecto segun una lectura por expresion regular, y ninguna nota fue verificada contra el veredicto correcto.
- Filtracion potencial de la referencia: las notas se escribieron sin solucion de referencia, pero las evaluaciones del juez se basaron en una rubrica derivada de ella, por lo que pueden aparecer formulaciones derivadas de la referencia.
- Sesgo hacia el juez y la rubrica: cerca de la mitad de las notas mencionan al juez o una rubrica, lo que puede inducir comportamientos de imitacion del evaluador.
- Validacion limitada al dominio: el conjunto held-out contiene solo notas de estudio originales y trayectorias del modelo base; ninguna metrica mide el ajuste a notas de rollout no vistas.
- Componentes de vision no evaluados: los pesos multimodales son los del modelo base y no se comprobo su calidad tras el ajuste.
- Idiomas y contexto no documentados: la model card no especifica cobertura linguistica ni longitud de contexto, lo que impide garantizar su comportamiento fuera del ingles tecnico del dominio.
- Licencia Apache 2.0: permite uso comercial, pero el modelo es un artefacto de investigacion sin garantias de calidad en produccion.
- Fecha de creacion futura respecto a la mayoria de referencias publicas (16 de noviembre de 2026), lo que debe tenerse en cuenta al contextualizar el experimento.
- Dependencia de revisiones: `main` equivale a `epoch-2` (`checkpoint-5230`); existe la rama `epoch-1` (`checkpoint-2615`), con peores perdidas de validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes350m-noref-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefn350mr20261116
- Codigo, prompts y registro de ejecucion: `recipe/equational_internalization/experiments/rollout_notes_noref_vista_20261116/README.md` en el repositorio del proyecto (no se proporciona URL directa).
