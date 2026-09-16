# Travor278/pi05-scan-object-uniform-peer-lora-10k-e169

## Resumen

El modelo `Travor278/pi05-scan-object-uniform-peer-lora-10k-e169` es un checkpoint de inferencia de tipo vision-language-action (VLA) construido sobre la receta PI0.5, desarrollado por el usuario Travor278 dentro de la serie de entrenamiento autorizada «Sim12». Se trata de un ajuste mediante LoRA (10 000 actualizaciones del optimizador) sobre el modelo base PI0.5, orientado a tareas de manipulación robótica sobre un conjunto de datos concreto: `Shiki42/ctr-scan-object-uniform-20260911`.

El artefacto se distribuye como checkpoint JAX/Orbax (no es un modelo de Transformers ni safetensors) y esta pensado exclusivamente para inferencia. Incluye los parametros completos del modelo junto con los activos de normalizacion emparejados, pero excluye el optimizador, el `train_state` y el estado reanudable del `data_loader`. El repositorio ocupa 6,3 GB.

Su relevancia es acotada y experimental: sirve como referencia reproducible de un ajuste LoRA sobre PI0.5 en el ecosistema OpenPI, con horizonte de accion 50 y muestreo de difusion en 10 pasos. No hay metricas de evaluacion publicadas en la informacion disponible, y el propio autor indica que los resultados se registran externamente en SwanLab y no se derivan de la finalizacion de la subida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) PI0.5 con adaptadores LoRA; no disponible el detalle exacto de capas |
| Parametros totales | no disponible (el repositorio de pesos ocupa 6,3 GB en formato Orbax) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint JAX/Orbax de precision nativa, sin conversion de formato) |
| Idiomas soportados | no disponible (el modelo recibe instrucciones en lenguaje natural, pero no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (no safetensors, no GGUF, no Transformers) |
| Libreria | openpi |
| Tamano del repositorio | 6,3 GB |
| Horizonte de accion | 50 |
| Pasos de difusion | 10 (distinto del horizonte de accion) |

## Arquitectura y entrenamiento

Se trata de un ajuste LoRA sobre PI0.5, un modelo de accion vision-lenguaje-accion que consume observaciones visuales e instrucciones en lenguaje natural y produce acciones motoras. El checkpoint procede de la serie de entrenamiento «Sim12» y fue generado con 10 000 actualizaciones del optimizador, tamano de lote global 16, `GA1`, `FSDP1` y semilla 87431. El entrenamiento usa acciones articulares en formato delta y una mascara de perdida con relleno temporal (*temporal-padding loss mask*).

El conjunto de datos es `Shiki42/ctr-scan-object-uniform-20260911`, fijado en la revision `000485f6b1cc3221f7ab21ddbda0d231757e8cf9`. El checkpoint es de solo inferencia: incluye los parametros completos del modelo y los activos de normalizacion emparejados, pero excluye el optimizador, el `train_state` y el estado reanudable del cargador de datos. No se realizo ninguna conversion de formato y no se declaran detalles sobre la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla del propio ajuste LoRA. El autor indica que la configuracion cualificada exacta y la configuracion OpenPI orientada a inferencia se incluyen bajo `provenance`, y que cada archivo fuente fue verificado con SHA-256 contra el recibo original de recarga en CPU; `CHECKPOINT_MANIFEST.json` inventaria unicamente los archivos de inferencia.

## Capacidades

- Generacion de acciones roboticas a partir de observaciones visuales e instrucciones en lenguaje natural (politica VLA), no generacion de texto general.
- Salida de secuencias de accion con horizonte 50, con muestreo de difusion configurado en 10 pasos.
- Acciones articulares en formato delta, segun la configuracion de entrenamiento declarada.
- Ajuste especifico mediante LoRA sobre el modelo base PI0.5, con los pesos base completos incluidos en el checkpoint.
- Carga en el ecosistema OpenPI (JAX) junto con los activos de normalizacion emparejados.
- Capacidades de *tool calling*, *function calling*, razonamiento multi-paso, vision general, audio o modo *thinking*: no disponibles o no declaradas en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.

## Casos de uso

- Investigacion en adaptacion eficiente de politicas VLA: el checkpoint permite reproducir un ajuste LoRA de 10 000 pasos sobre PI0.5 con una receta documentada (semilla, lote global, FSDP1, mascara de perdida), util como linea base en estudios de *fine-tuning* parametro-eficiente.
- Manipulacion robotica sobre objetos tipo «scan-object-uniform»: la politica esta entrenada especificamente sobre el dataset `ctr-scan-object-uniform`, por lo que resulta adecuada para tareas de recogida y colocacion de objetos uniformes en el dominio cubierto por esos datos.
- Evaluacion en simulacion antes de transferencia a hardware: al ser un checkpoint de inferencia de la serie «Sim12», encaja en flujos de validacion en simulador donde se comparan variantes de la receta peer con distintos pasos de entrenamiento (aqui, epoca/paso 169).
- Comparacion de hiperparametros en barridos experimentales: el nombre del artefacto codifica receta («peer»), rango LoRA (10k) y paso (e169), lo que facilita el analisis controlado frente a otros checkpoints de la misma serie.
- Generacion de datos sinteticos de trayectorias: la politica puede desplegarse para producir rollouts en simulador que alimenten posteriores ciclos de entrenamiento o evaluacion.
- Reproducibilidad y auditoria de artefactos: el manifiesto `CHECKPOINT_MANIFEST.json` y la verificacion SHA-256 permiten reconstruir exactamente el contenido del checkpoint en pipelines de validacion internos.
- Punto de partida para nuevos ajustes LoRA: al incluir los pesos completos y los activos de normalizacion, puede servir como base para reajustes en dominios cercanos, siempre que se respeten las dependencias de entorno de OpenPI.
- Docencia y prototipado de VLA en investigacion academica: el tamano de 6,3 GB y el soporte de JAX/OpenPI facilitan montar demostraciones de politica vision-lenguaje-accion en entornos con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los resultados de evaluacion se registran en `https://swanlab.cn/@Travor/CTR-PI05-LoRA10k` y que la finalizacion de la subida no implica resultados. No se proporcionan cifras de exito en tareas, MMLU, HumanEval, GSM8K ni metricas equivalentes de robotica (por ejemplo, tasa de exito por tarea), por lo que no se incluyen numeros.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El checkpoint ocupa 6,3 GB en disco solo para los pesos; a esa cifra hay que sumar activaciones, buffers de inferencia y los activos de normalizacion, por lo que se recomienda un margen amplio sobre el tamano de los pesos.
- GPU recomendadas: no declaradas por el autor. Para cargas JAX/Orbax con pesos completos de PI0.5 y margen de activaciones, son razonables GPUs de 24 GB o mas (RTX 3090, RTX 4090, L40S, A100 40/80 GB, H100), pero se trata de una estimacion, no de un requisito confirmado.
- Compatibilidad con GPU de consumo: probable en tarjetas de 24 GB si la carga y el backend lo permiten; no confirmado en la informacion proporcionada para tarjetas de 16 GB o menos.
- Opciones de despliegue: el checkpoint esta pensado para OpenPI con JAX/Orbax. Requiere pasar `10000/` como `checkpoint_dir`, definir `PARALLELVLA_DATASET_REPO` apuntando al dataset y `PARALLELVLA_NORM_ASSETS_DIR` a `10000/assets` locales, y usar una fuente OpenPI PI0.5 compatible con su entorno de configuracion base. No es compatible directamente con vLLM, llama.cpp, Ollama, TGI ni otros servidores de modelos de texto, dado que no es un modelo Transformers/safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para una comparativa cuantitativa. La tabla siguiente recoge unicamente los campos que pueden afirmarse o marcarse como no disponibles.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-scan-object-uniform-peer-lora-10k-e169 (este modelo) | no disponible (repo de 6,3 GB) | no disponible | JAX/Orbax (openpi) | no disponible | HuggingFace, 0 descargas, 0 likes |
| Modelo base PI0.5 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Otros checkpoints de la serie «Sim12» / receta «peer» | no disponible | no disponible | JAX/Orbax (openpi) | no disponible | no disponible |
| Alternativas VLA de proposito general (por ejemplo, familias OpenVLA o GR00T) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado enlaces ni datos de modelos comparables en los resultados de busqueda web disponibles, que no guardan relacion con este modelo.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada no puede asumirse permiso para uso comercial, redistribucion o modificacion. Es un riesgo legal directo para produccion.
- Artefacto de tipo solo inferencia: no incluye optimizador, `train_state` ni estado reanudable del `data_loader`, por lo que no sirve para reanudar el entrenamiento tal cual.
- Dependencia estricta de entorno: requiere OpenPI compatible con PI0.5, variables de entorno concretas (`PARALLELVLA_DATASET_REPO`, `PARALLELVLA_NORM_ASSETS_DIR`) y la configuracion base adecuada. Un fallo en estos ajustes invalida la inferencia.
- Sin resultados de evaluacion publicados: no hay metricas de tasa de exito ni comparaciones que permitan estimar el rendimiento real; el propio autor remite a un registro externo en SwanLab.
- Dominio muy restringido: el ajuste se realizo sobre un unico dataset (`ctr-scan-object-uniform`), por lo que se espera un comportamiento pobre fuera de ese dominio de objetos y tareas.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la informacion disponible. Al tratarse de una politica de accion, el fallo se manifiesta como acciones incorrectas o inseguras, no como texto erroneo.
- Aviso de seguridad fisica: cualquier uso sobre hardware real requiere limites de parada, supervision humana y validacion previa en simulacion; no se documentan procedimientos de seguridad.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingues o con historiales largos.
- Trazabilidad limitada: el modelo declara 0 descargas y 0 likes y no cuenta con documentacion externa verificable; la verificacion SHA-256 y el manifiesto son herramientas de integridad, no de calidad.
- Fechas del repositorio: la fecha de creacion indicada (2026-09-15) no permite validar antiguedad ni mantenimiento; no hay garantia de soporte futuro.

## Enlaces

- HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-uniform-peer-lora-10k-e169
- Seguimiento de evaluacion (SwanLab): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-uniform-20260911
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las URLs devueltas corresponden a paginas de ayuda de YouTube y a un tema de Zhihu, sin relacion con el modelo.
