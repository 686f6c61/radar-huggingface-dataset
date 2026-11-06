# twanghcmut/bridgequant-libero-7m-kd

## Resumen

bridgequant-libero-7m-kd es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario twanghcmut (vinculado al repositorio VLAOpt/bridgequant-async). Se trata de un estudiante destilado de 6,59 millones de parámetros (7M) entrenado a partir de un profesor de 76M sobre las cuatro suites del benchmark LIBERO. Su propósito es la manipulación robótica: dado un estado y una observación, produce acciones normalizadas para controlar un brazo robótico (el autor menciona explícitamente el brazo SO101).

El modelo es relevante por su tamaño extremadamente reducido y su enfoque de destilación de conocimiento (KD), que busca mantener el rendimiento del profesor con un orden de magnitud menos de parámetros, facilitando el despliegue en hardware de borde. El autor reporta una media de 96,7 en LIBERO-500 (media de 3 semillas) y 61,7 en LIBERO-Plus, cifras que el lector debe contrastar de forma independiente.

La información pública es escasa: el modelo acumula 10 descargas y 0 likes, la model card es breve y no se detallan arquitectura interna, datos de entrenamiento ni idiomas. Los pesos se distribuyen en safetensors junto con ficheros de normalización y configuración que el loader del repositorio de código espera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language-action (VLA); detalles internos no disponibles |
| Parametros totales | 6.593.715 (6,59M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (model.safetensors) + norm_stats.json, bridgequant_vla.yaml, config.json, metadata.json, train_config.yaml |
| Pipeline | robotics |
| Region | us |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los tags indican `bridgequant_async_vla` y `vision-language-action`, y el código asociado define una clase `BridgeQuantAsyncVLA` que se instancia con `from_pretrained(config=cfg.policy, init_empty_trainable=True)` y se carga con `load_trainable_weights(policy, "<dir>")`. Esto sugiere un pipeline de política VLA con pesos entrenables inicializados de forma vacía y cargados desde el bundle (safetensors más ficheros de normalización y configuración). No se especifican el tipo de transformer, el encoder visual, el número de capas ni la dimensionalidad oculta.

En cuanto al entrenamiento, el autor indica que es un estudiante de 7M destilado de un profesor de 76M sobre las cuatro suites de LIBERO. No se detallan el número de tokens, la composición del dataset, ni si se emplearon RLHF o DPO. El bundle incluye `train_config.yaml` con la configuración del experimento, que según el autor se reutiliza tanto para evaluación como para despliegue. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas a partir de observaciones y estados, orientada a manipulación en entornos tipo LIBERO.
- Control de un brazo robótico SO101 mediante el script `scripts/so101_policy.py` (documentado en `docs/so101_deploy.md`).
- Normalización de estados y acciones mediante `norm_stats.json`, lo que permite integrar el modelo en pipelines de control con escalas coherentes.
- Evaluación sobre las suites LIBERO (long, spatial, goal, object) y LIBERO-Plus, según los resultados reportados por el autor.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, modo thinking, visión general, audio ni matemáticas. Al ser un modelo VLA de robótica, sus capacidades se limitan al dominio de control visomotor.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede generar acciones para tareas de las suites LIBERO (long, spatial, goal, object), lo que lo hace adecuado para reproducir experimentos de investigación en manipulación con un coste computacional muy bajo.
- Despliegue en el brazo SO101: mediante `scripts/so101_policy.py` y la guía `docs/so101_deploy.md`, se puede llevar la política a un brazo de bajo coste para tareas de pick-and-place y manipulación básica.
- Prototipado rápido en robótica de borde: con 6,59M de parámetros, el modelo cabe en GPUs de consumo e incluso en dispositivos embebidos, lo que permite iterar sobre políticas VLA sin infraestructura de datacenter.
- Investigación en destilación de conocimiento: sirve como caso de estudio de KD de un profesor de 76M a un estudiante de 7M, comparando la degradación de rendimiento entre LIBERO-500 y LIBERO-Plus.
- Evaluación comparativa de políticas VLA: al seguir el formato de bundle del repositorio bridgequant-async, se puede integrar en pipelines de evaluación estandarizados sobre LIBERO.
- Educación y docencia: su tamaño reducido y su licencia de investigación lo hacen útil para demostrar el ciclo completo de entrenamiento, carga y despliegue de un VLA en cursos de robótica.
- Validación de normalización estado-acción: el fichero `norm_stats.json` permite estudiar cómo afecta la normalización al rendimiento en distintas suites.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (media de 3 semillas):

| Benchmark | Resultado |
|---|---|
| LIBERO long | 93,3 |
| LIBERO spatial | 97,3 |
| LIBERO goal | 96,4 |
| LIBERO object | 99,7 |
| LIBERO-500 (media) | 96,7 |
| LIBERO-Plus | 61,7 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares más allá de la referencia al profesor de 76M.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,59M de parámetros en safetensors, el peso de los pesos es del orden de decenas de MB en fp32, por lo que la VRAM necesaria es muy reducida.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090) debería ser suficiente, e incluso CPU para inferencia.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: el autor indica el uso del repositorio https://github.com/VLAOpt/bridgequant-async con `load_trainable_weights` y `scripts/so101_policy.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bridgequant-libero-7m-kd | 6,59M | no disponible | LIBERO-500: 96,7; LIBERO-Plus: 61,7 | other | Hugging Face |
| Profesor de 76M (referencia del autor) | 76M | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas VLA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia es "other": no se especifican los términos exactos, por lo que el uso comercial requiere revisar la licencia del repositorio antes de cualquier despliegue en producción.
- El modelo está especializado en manipulación robótica sobre LIBERO y SO101; no es un modelo de propósito general y no debe usarse para generación de texto, código o conversación.
- No se documentan sesgos conocidos, pero al entrenarse sobre un benchmark concreto puede heredar sesgos de distribución de las tareas LIBERO.
- Riesgo de alucinación no aplicable en el sentido habitual; sin embargo, la política puede generar acciones incorrectas fuera de la distribución de entrenamiento.
- No se especifican limitaciones de contexto ni de idioma; los idiomas soportados figuran como no disponibles.
- El rendimiento reportado (96,7 en LIBERO-500, 61,7 en LIBERO-Plus) procede del propio autor y no se ha verificado de forma independiente; la caída en LIBERO-Plus sugiere menor robustez fuera de distribución.
- El modelo tiene 10 descargas y 0 likes, lo que indica escasa validación por parte de la comunidad.
- La documentación es mínima: no hay detalles de arquitectura, datos de entrenamiento ni proceso de destilación, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/twanghcmut/bridgequant-libero-7m-kd
- Repositorio de código: https://github.com/VLAOpt/bridgequant-async
- Documentación de despliegue SO101: `docs/so101_deploy.md` (dentro del repositorio anterior)
- Script de política SO101: `scripts/so101_policy.py` (dentro del repositorio anterior)
