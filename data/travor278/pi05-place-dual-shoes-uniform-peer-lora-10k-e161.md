# Travor278/pi05-place-dual-shoes-uniform-peer-lora-10k-e161

## Resumen

Travor278/pi05-place-dual-shoes-uniform-peer-lora-10k-e161 es un checkpoint de inferencia para robotica publicado en HuggingFace bajo la libreria `openpi`. Se trata de un ajuste fino mediante LoRA del modelo PI0.5 (receta denominada "peer recipe LoRA10k") orientado a una tarea concreta de manipulacion identificada por el nombre del repositorio: la colocacion de un par de zapatos de forma uniforme. El autor lo describe como parte de la serie de entrenamiento "Sim12" autorizada, lo que apunta a un entorno de simulacion, y la evaluacion se registra en un proyecto externo de SwanLab.

El artefacto es un checkpoint en formato JAX/Orbax con los parametros completos del modelo y los activos de normalizacion emparejados, pero sin estado de optimizador, `train_state` ni estado reanudable del `data_loader`. No se ha realizado conversion de formato, por lo que no es un modelo compatible con Transformers ni con safetensors, y requiere el codigo fuente de OpenPI para PI0.5 mas un entorno de configuracion base concreto.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible de un ajuste fino con LoRA sobre un modelo vision-lenguaje-accion (VLA) en JAX, con trazabilidad de hashes SHA-256 y de la configuracion exacta de entrenamiento. No es un modelo de proposito general ni un modelo de lenguaje: no genera texto conversacional, no soporta tool calling y su unico cometido documentado es producir acciones motoras para la tarea para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI0.5 (vision-lenguaje-accion) con adaptadores LoRA; implementacion en JAX sobre OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el modelo define action horizon 50, distinto de diffusion num_steps 10) |
| Tipos de cuantizacion | no disponible; el autor indica que no se realizo conversion de formato |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (checkpoint de inferencia); no es safetensors ni GGUF |
| Tamano del repositorio | 6,3 GB |
| Libreria | openpi |
| Pipeline declarado | robotics |
| Entrenamiento | 10.000 actualizaciones del optimizador, batch global 16, GA1, FSDP1, semilla 87431, acciones articulares delta y mascara de perdida con temporal padding |
| Dataset | Shiki42/ctr-place-dual-shoes-uniform-20260911 (commit 32f25a495d0cab93307a1c9d73010501a049f1e6) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un ajuste fino LoRA sobre PI0.5 dentro del ecosistema OpenPI, implementado en JAX y serializado con Orbax. El modelo trabaja con acciones articulares en formato delta y emplea una mascara de perdida con temporal padding, ademas de una distincion explicita entre el horizonte de accion (50) y el numero de pasos de difusion (10), lo que sugiere un cabezal de generacion de acciones basado en difusion o flow matching acoplado al modelo VLA. No se detalla en la model card el numero de parametros, la composicion del dataset, ni si hubo etapas de RLHF o DPO; dado que es un modelo de robotica, esas tecnicas no aplican del modo habitual en modelos de lenguaje.

El entrenamiento consta de 10.000 actualizaciones del optimizador con batch global 16, acumulacion de gradiente 1, FSDP en un solo grupo y semilla 87431, sobre el dataset referenciado en un commit concreto. El checkpoint publicado es solo de inferencia: incluye los parametros completos del modelo y los activos de normalizacion, pero excluye optimizador, `train_state` y estado del `data_loader`, por lo que no permite reanudar el entrenamiento. El autor indica que cada archivo fuente fue verificado con SHA-256 contra el recibo original de recarga en CPU antes de la subida, y que `CHECKPOINT_MANIFEST.json` inventaria unicamente los archivos de inferencia. Para ejecutarlo hay que definir las variables `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR`, apuntando la segunda al directorio local `10000/assets`, y usar la fuente OpenPI compatible con PI0.5 y su entorno de configuracion base.

## Capacidades

- Generacion de acciones motoras para una politica VLA en la tarea concreta de colocacion de un par de zapatos de forma uniforme.
- Emision de acciones articulares en formato delta con un horizonte de accion de 50 pasos.
- Generacion de acciones basada en difusion con 10 pasos, parametro independiente del horizonte de accion.
- Inferencia en JAX/Orbax con parametros completos y activos de normalizacion emparejados.
- Ejecucion con soporte de paralelizacion tipo FSDP en la configuracion de referencia del autor.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues documentadas ni de generacion de texto conversacional.
- No dispone de vision generalista mas alla de la percepcion integrada en la politica VLA; no hay modo "thinking", audio ni otras modalidades declaradas.

## Casos de uso

- Reproduccion de experimentos de ajuste fino con LoRA en robotica: el checkpoint permite verificar la receta "LoRA10k" sobre PI0.5 sin reentrenar, usando la configuracion cualificada incluida en `provenance`.
- Investigacion en politicas vision-lenguaje-accion en JAX: sirve como punto de partida para estudiar como afectan el horizonte de accion de 50 pasos y los 10 pasos de difusion al comportamiento del policy.
- Evaluacion en simulacion: el autor lo vincula a la serie de entrenamiento "Sim12" y a un proyecto de seguimiento en SwanLab, de modo que puede emplearse para replicar o comparar curvas de evaluacion en el mismo entorno.
- Docencia y divulgacion tecnica: es un ejemplo real de despliegue de un checkpoint Orbax solo de inferencia, con manifiesto de archivos y verificacion SHA-256, util para explicar flujos de trabajo de MLOps en robotica.
- Generacion de datos sinteticos de manipulacion: ejecutando la politica en simulacion se pueden recolectar trayectorias de colocacion de calzado para ampliar un dataset posterior.
- Pruebas de tuberias de normalizacion: al incluir activos de normalizacion emparejados, sirve para validar la integracion entre `PARALLELVLA_NORM_ASSETS_DIR` y el dataset de entrenamiento referenciado.
- Base para estudios de transferencia simulacion-a-realidad: un ajuste LoRA especializado en una tarea de colocacion es un candidato razonable para medir degradacion al cambiar de dominio, siempre que la licencia y las condiciones de uso lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se registran en un proyecto externo de SwanLab y que la finalizacion de la subida no implica resultados de evaluacion. En la busqueda web realizada no se han encontrado datos de rendimiento del modelo; los resultados devueltos trataban sobre peces venenosos (genero Synanceia) y no guardan relacion con este modelo, por lo que se han descartado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 6,3 GB, cifra que incluye parametros y activos de normalizacion; el consumo real de VRAM depende del backend JAX, del tipo de dato de los pesos y del tamano de lote de acciones.
- GPU recomendadas: no disponibles. Al ser un modelo JAX/Orbax, requiere un entorno compatible con aceleradores CUDA o TPU; no hay lista oficial de GPUs validada por el autor.
- Encaje en GPU de consumo: no confirmado. Un checkpoint de 6,3 GB es en principio manejable en GPUs de consumo con 12-24 GB de VRAM, pero no hay confirmacion del autor y depende del runtime de OpenPI.
- Opciones de despliegue: OpenPI con JAX y Orbax. No es compatible con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje ni se distribuye en safetensors o GGUF.
- Variables de entorno necesarias: `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` (esta ultima apuntando a `10000/assets`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables en la informacion proporcionada para establecer una comparativa cuantitativa. La tabla siguiente recoge la categoria de cada alternativa y marca como no disponible todo aquello que no esta documentado en la informacion consultada.

| Modelo | Categoria | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-place-dual-shoes-uniform-peer-lora-10k-e161 | Politica VLA ajustada con LoRA (JAX/Orbax) | no disponible | action horizon 50; diffusion num_steps 10 | no disponible | HuggingFace, checkpoint de inferencia |
| Otros checkpoints PI0.5 de OpenPI | Politica VLA | no disponible | no disponible | no disponible | no disponible |
| PI0 (modelo base de la familia) | Politica VLA | no disponible | no disponible | no disponible | no disponible |
| Modelos VLA abiertos de otras familias | Politica VLA | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al entrenarse sobre un unico dataset de tarea especifica, es previsible un comportamiento muy especializado, pero no hay analisis publicado al respecto.
- Riesgo de alucinacion: no aplica en el sentido linguistico; si aplica el riesgo de generar acciones no validas o inseguras fuera de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: no hay informacion sobre idiomas ni sobre ventana de contexto textual; el unico parametro temporal documentado es el horizonte de accion de 50.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede asumirse uso comercial. Es imprescindible aclarar este punto con el autor antes de cualquier uso en produccion.
- El checkpoint es solo de inferencia: no incluye optimizador, `train_state` ni estado del `data_loader`, por lo que no permite reanudar el entrenamiento.
- No es un modelo de Transformers ni safetensors; requiere el entorno OpenPI con JAX y la configuracion base compatible con PI0.5. Ejecutarlo fuera de ese entorno no esta soportado.
- El autor advierte que el horizonte de accion 50 es un parametro distinto del numero de pasos de difusion 10; confundirlos produce un comportamiento incorrecto.
- Reputacion y madurez: el repositorio no tiene descargas ni "likes", y no se han localizado publicaciones, papers ni verificaciones independientes. El entrenamiento se enmarca en una serie "autorizada" de simulacion, lo que no garantiza validez en el mundo real.
- Trazabilidad: el autor afirma haber verificado cada archivo con SHA-256 y publica `CHECKPOINT_MANIFEST.json`, pero esa verificacion es interna y no ha sido auditada de forma externa.
- Fechas del repositorio: creado el 2026-09-15 y actualizado el 2026-09-15; cualquier cambio posterior no esta reflejado en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-uniform-peer-lora-10k-e161
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-place-dual-shoes-uniform-20260911 (commit 32f25a495d0cab93307a1c9d73010501a049f1e6)
- Seguimiento de evaluacion en SwanLab: https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Codigo de la libreria OpenPI (referenciada por la model card): https://github.com/Physical-Intelligence/openpi
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Todas las entradas devueltas trataban sobre peces del genero Synanceia y no guardan relacion con este modelo, por lo que se omiten.
