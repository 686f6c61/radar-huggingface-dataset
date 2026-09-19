# stellalisy/EvoLM-8B-Rubric

## Resumen

EvoLM-8B-Rubric es un checkpoint de generacion de rubricas publicado por el usuario de HuggingFace `stellalisy` como parte del trabajo **EvoLM: Self-Evolving Language Models through Co-Evolved Discriminative Rubrics**. No es un modelo conversacional de proposito general ni un clasificador de calidad: su funcion es emitir, para una pregunta dada, entre 2 y 5 criterios de evaluacion atomicos y ponderados en formato JSON. Esos criterios los aplica despues un modelo juez independiente (en los experimentos principales, `Qwen/Qwen3-1.7B`) para puntuar respuestas candidatas.

El modelo deriva por ajuste fino del checkpoint `Qwen/Qwen3-8B` y corresponde al paso global de entrenamiento 1000 de la fase de rubricas (`rubric/step_1000`), lo que equivale a 500 actualizaciones efectivas de esa fase, ya que las fases de rubrica y de politica se alternan en el pipeline EvoLM. Su pareja de entrenamiento, la politica del paso 950, se publica por separado como `stellalisy/EvoLM-8B`.

La relevancia actual del checkpoint es doble: por un lado forma parte de una linea de investigacion que sustituye las recompensas escalares aprendidas por rubricas generadas dinamicamente, mas interpretables y especificas por pregunta; por otro, es un artefacto reproducible con sumas de comprobacion publicadas y procedencia documentada, lo que facilita reproducir experimentos de RL con recompensas generativas. El repositorio incluye las referencias exactas de revision de codigo usadas en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `Qwen/Qwen3-8B`); sin detalles adicionales publicados |
| Parametros totales | No disponible de forma fiable. La model card no declara cifra; los metadatos de safetensors indican 308.224, valor incoherente con un modelo derivado de Qwen3-8B (aproximadamente 8 200 millones). El repositorio ocupa 16,4 GB en 4 shards, consistente con un modelo del orden de 8B en precision de 16 bits |
| Parametros activos | No aplica (no es un modelo MoE, no hay datos que indiquen lo contrario) |
| Longitud de contexto | No disponible en la informacion del repositorio. El modelo base `Qwen/Qwen3-8B` declara 32 768 tokens nativos ampliables a 131 072, pero este dato no se confirma para el checkpoint |
| Tipos de cuantizacion | No se publican versiones cuantizadas. Pesos originales en `safetensors` (4 shards) en la precision resultante del ajuste |
| Idiomas soportados | No disponible. El campo de idiomas aparece como no disponible en la ficha de HuggingFace y la model card no lo detalla |
| Licencia | apache-2.0 |
| Formato de pesos | `safetensors` (4 archivos: `model-00001-of-00004.safetensors` a `model-00004-of-00004.safetensors`), cargables con `transformers` |
| Rol funcional | Generacion de rubricas ponderadas por pregunta (no genera recompensas escalares) |
| Checkpoint | `rubric/step_1000` del run principal de EvoLM (paso global 1000; 500 pasos de actualizacion de la fase de rubrica) |
| Modelo base | `Qwen/Qwen3-8B` (ajuste fino) |
| Juez usado en los experimentos | `Qwen/Qwen3-1.7B` |
| Datos de entrenamiento | `allenai/tulu-3-sft-mixture` |

## Arquitectura y entrenamiento

El checkpoint reutiliza la arquitectura del modelo base `Qwen/Qwen3-8B`, un transformer decoder-only, y se obtiene por ajuste fino sobre el mismo. La model card no documenta cambios estructurales, ni hiperparametros, ni el numero de tokens vistos durante el ajuste, por lo que la informacion arquitectonica disponible se limita a la herencia del modelo base.

El aspecto diferencial no es la arquitectura, sino el procedimiento de entrenamiento: EvoLM propone un esquema de co-evolucion en el que alternan una fase de generacion de rubricas y una fase de politica. La fuente de datos declarada es `allenai/tulu-3-sft-mixture`. En el momento del checkpoint publicado, la fase de rubrica acumula 500 pasos de actualizacion sobre un paso global de 1000. La generacion sigue la plantilla `rubric_generation_v3` definida en `open_instruct/search_rewards/utils/rubric_chat_templates.py`, donde el mensaje de sistema solicita criterios atomicos y ponderados en JSON y el mensaje de usuario contiene la pregunta a evaluar. La evaluacion de referencia se realiza con los scripts `stella_run_scripts/paper_experiments/eval/eval_rewardbench2.sh` y `reward-bench/scripts/run_generative_v2_rubric.py`, que no se incluyen en el repositorio del modelo.

La procedencia esta documentada en detalle: revision de codigo registrada por el entrenamiento `evolm-main-training-e8ee435` (`e8ee4354c225c11faefb262bfd075d1a1216f1c5`), instantanea mas cercana del arbol de trabajo `evolm-main-working-tree-e27c85c` (`e27c85c626f39649adbdbbf885684e0a21d14b1c`) y revision del borrador del articulo `a6234712f39aa145be2f4b72b45d7bbe6293b6e1`. El autor advierte que el trabajo de entrenamiento registro la primera revision pero se ejecuto con cambios de formato de recompensa sin commitear, de modo que la segunda revision es la instantanea preservada mas cercana y podria contener ediciones posteriores al lanzamiento. Se publican las sumas SHA-256 de los cuatro shards de pesos.

No se documenta en la informacion disponible el uso de RLHF, DPO, decodificacion especulativa ni tecnicas de atencion lineal o hibridacion SSM.

## Capacidades

- Generacion de rubricas de evaluacion especificas por pregunta: produce entre 2 y 5 criterios atomicos con pesos, en formato JSON, segun la plantilla `rubric_generation_v3`.
- Evaluacion discriminativa indirecta: no emite puntuaciones escalares; la puntuacion final la calcula un modelo juez que aplica la rubrica a cada respuesta candidata.
- Conversacion con plantilla de chat: utiliza la plantilla de chat estandar de Qwen y esta etiquetado como `conversational` y `text-generation`.
- Generacion de texto autorregresiva estandar, por herencia del modelo base Qwen3-8B.
- Integracion en pipelines de entrenamiento por recompensa generativa (reward modeling basado en rubricas), su uso previsto en el articulo.
- Capacidades multilingues: no disponibles; la ficha no declara idiomas soportados.
- Tool calling / function calling: no documentado.
- Comportamiento de agente o razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking): no documentado.
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es exclusivamente de generacion de texto.

## Casos de uso

- Entrenamiento por refuerzo con recompensas generativas: el modelo genera la rubrica de cada pregunta y un juez independiente (por ejemplo `Qwen/Qwen3-1.7B`) puntua las respuestas de la politica. Es exactamente el uso para el que se entreno el checkpoint, dentro de un bucle alterno rubrica-politica.
- Evaluacion automatica de respuestas abiertas en benchmarks tipo RewardBench2: los scripts de evaluacion citados (`eval_rewardbench2.sh`, `run_generative_v2_rubric.py`) permiten reproducir la comparacion frente a otros sistemas de recompensa.
- Auditoria de calidad de datasets de instrucciones: generar criterios ponderados por pregunta para filtrar respuestas deficientes antes de usarlas en ajuste supervisado, aprovechando que la fuente de entrenamiento es `allenai/tulu-3-sft-mixture`.
- Correccion asistida de examenes de respuesta abierta: producir rubricas atomicas con pesos por pregunta, de forma que un corrector humano o un juez automatico aplique criterios consistentes y auditables.
- Investigacion en co-evolucion de modelos discriminativos: reproducir el pipeline EvoLM alternando el checkpoint de rubrica con su politica emparejada publicada como `stellalisy/EvoLM-8B`, para estudiar la dinamica de mejora mutua.
- Generacion de criterios para evaluacion de asistentes conversacionales: definir dimensiones de utilidad, correccion y formato para comparar versiones de un mismo asistente en pruebas A/B.
- Construccion de conjuntos de evaluacion a medida para dominios verticales: dado un banco de preguntas de un dominio concreto, generar rubricas especificas que sustituyan a metricas genericas como similitud de n-gramas o BLEU.
- Analisis de sensibilidad del juez: usar rubricas fijas generadas por este checkpoint para medir como varia la puntuacion final segun el prompt de generacion, los parametros de decodificacion y el modelo juez elegido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los scripts de evaluacion empleados en el articulo (RewardBench2), pero no incluye cifras de MMLU, HumanEval, GSM8K, RewardBench ni de ninguna otra prueba, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia de orden de magnitud, un modelo de ~8B en precision de 16 bits requiere aproximadamente 16 GB solo para pesos, a los que hay que sumar la cache KV, que crece con la longitud de contexto.
- Repositorio: 16,4 GB, repartidos en 4 shards de `safetensors`; esa cifra es coherente con pesos en 16 bits sin cuantizar.
- GPU recomendadas: no especificadas. Para servir el modelo sin cuantizar son razonables GPU de 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100). No hay datos publicados de latencia ni de throughput para ninguna de ellas.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) y en tarjetas de 24 GB en general si se sirve sin cuantizar; en tarjetas de 12-16 GB harian falta cuantizaciones de 8 o 4 bits, que no se publican en el repositorio.
- Opciones de despliegue: la etiqueta `text-generation-inference` sugiere compatibilidad con TGI; el uso documentado es mediante `transformers` con `AutoModelForCausalLM` y `device_map="auto"`. No se confirma soporte de vLLM, llama.cpp ni Ollama, y no hay ficheros GGUF publicados, por lo que su uso en Ollama o llama.cpp requeriria una conversion previa a GGUF por parte del usuario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con los modelos que se mencionan explicitamente en la ficha: el modelo base y la politica emparejada del mismo run. No se dispone de datos de rendimiento de ninguno de ellos dentro de esta ficha, por lo que la comparacion se limita a rol, procedencia y licencia.

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `stellalisy/EvoLM-8B-Rubric` | Generador de rubricas ponderadas | No declarado; derivado de Qwen3-8B (~8B) | No disponible | apache-2.0 | Publicado en HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| `stellalisy/EvoLM-8B` | Politica emparejada (paso global 950) | No disponible en esta informacion | No disponible | No disponible en esta informacion | Publicado en HuggingFace como repositorio separado |
| `Qwen/Qwen3-8B` | Modelo base de proposito general | ~8 000 millones | No disponible en esta informacion | No indicada en esta informacion | Publico en HuggingFace |
| `Qwen/Qwen3-1.7B` | Juez que aplica las rubricas generadas | ~1 700 millones | No disponible en esta informacion | No indicada en esta informacion | Publico en HuggingFace |

Comparativas con otros generadores de rubricas o modelos de recompensa de la misma categoria: no disponible.

## Limitaciones y advertencias

- No es un clasificador autonomo de calidad de respuestas: requiere un juez externo que aplique la rubrica. Sin ese componente, el checkpoint no produce puntuaciones.
- La calidad de la rubrica y, por extension, la puntuacion final dependen del prompt de generacion, de los parametros de decodificacion y del modelo juez empleado, tal como advierte el propio autor.
- Es un checkpoint intermedio de investigacion (paso global 1000, 500 pasos de la fase de rubrica), no un modelo final de producto. Puede presentar comportamientos propios de un entrenamiento parcialmente avanzado.
- Idoneidad multilingue desconocida: no se declaran idiomas soportados ni cobertura del dataset en castellano, pese a que la fuente de datos es una mezcla de ajuste supervisado mayoritariamente en ingles.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible. Al generar criterios en JSON, existe riesgo de producir criterios irrelevantes, redundantes o mal formados, sin que se publiquen tasas de fallo de formato.
- Sesgos: no documentados. La fuente de datos (`allenai/tulu-3-sft-mixture`) puede introducir sesgos presentes en los datos de instrucciones originales; no hay analisis publicado para este checkpoint.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y tener en cuenta que el modelo base Qwen3-8B puede estar sujeto a condiciones adicionales propias.
- Trazabilidad del entrenamiento: el autor advierte que el run se ejecuto con cambios de formato de recompensa sin commitear y que la instantanea de codigo preservada podria contener ediciones posteriores al lanzamiento, lo que dificulta la reproduccion exacta.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes), sin evidencia externa de validacion por terceros.
- Ausencia de versiones cuantizadas publicadas, lo que complica el despliegue en hardware de gama media sin trabajo adicional de conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stellalisy/EvoLM-8B-Rubric
- Politica emparejada del mismo run: https://huggingface.co/stellalisy/EvoLM-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Juez usado en los experimentos principales: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Articulo citado: "EvoLM: Self-Evolving Language Models through Co-Evolved Discriminative Rubrics" (no se proporciona URL en la informacion disponible)
- Plantilla de generacion de rubricas referenciada: `open_instruct/search_rewards/utils/rubric_chat_templates.py` (ruta de codigo, sin URL publica en la informacion disponible)
- Script de evaluacion referenciado: `stella_run_scripts/paper_experiments/eval/eval_rewardbench2.sh` (ruta de codigo, sin URL publica en la informacion disponible)
- Script de evaluacion referenciado: `reward-bench/scripts/run_generative_v2_rubric.py` (ruta de codigo, sin URL publica en la informacion disponible)
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo; los resultados obtenidos fueron paginas genericas de ayuda de plataformas y foros sin relacion con EvoLM.
