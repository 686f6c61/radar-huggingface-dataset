# Taisanson/act_welding_seam_following

## Resumen
`Taisanson/act_welding_seam_following` es una politica de robotica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones en lugar de pasos individuales. Ha sido entrenada y publicada con LeRobot sobre un robot de tipo `so_follower` y un conjunto de datos propio de 10 episodios dedicado al seguimiento de un cordon de soldadura. El modelo es un consumidor puro de observaciones (estado de 6 dimensiones y dos imagenes de 480x640) que devuelve un vector de accion de 6 dimensiones.

Con 51.668.614 parametros, se trata de un modelo muy compacto, orientado a inferencia en tiempo real a 30 FPS junto al brazo robotico. No es un modelo de lenguaje ni un modelo fundacional multimodal: es una politica visuomotora especializada y de proposito muy concreto.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de un flujo completo de aprendizaje por imitacion con LeRobot; por otro, es un caso de aplicacion industrial (soldadura) resuelto con un presupuesto de datos minimo, lo que lo hace interesante para evaluar hasta donde llega ACT con pocas demostraciones. No se han publicado resultados de evaluacion en el robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ACT usa una ventana fija de observaciones no especificada en la model card) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors |
| Idiomas soportados | no disponible (no aplica: politica visuomotora sin capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0.2 GB) |

## Arquitectura y entrenamiento
ACT (Action Chunking with Transformers), descrito en el paper arXiv:2304.13705, es un metodo de aprendizaje por imitacion que predice "chunks" o secuencias cortas de acciones futuras en lugar de una sola accion por paso. La arquitectura combina un transformer con mecanismos de atencion sobre representaciones visuales y de estado, y se entrena a partir de datos de teleoperacion. En este caso concreto, la politica consume `observation.state` (vector de 6 componentes) y dos flujos de imagen (`wrist` y `front`, ambas a 480x640 con 3 canales), y produce una accion de 6 componentes.

El entrenamiento se realizo con LeRobot 0.6.2 durante 10.000 pasos, con tamano de lote 4, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El conjunto de datos asociado es `Taisanson/welding-seam-following`, compuesto por 10 episodios y 8436 fotogramas a 30 FPS, con una unica tarea descrita como "seguir el cordon de soldadura negro de principio a fin sin oscilar y volver a la posicion inicial". No se documentan fases de RLHF, DPO ni recompensas; es aprendizaje por imitacion supervisado a partir de demostraciones. No se especifican en la model card detalles sobre aumento de datos, tokens de entrenamiento ni composicion adicional del dataset.

## Capacidades
- Control visuomotor de un brazo robotico `so_follower` mediante prediccion de acciones de 6 grados de libertad.
- Seguimiento de trayectorias sobre un cordon de soldadura a partir de dos vistas de camara (muneca y frontal).
- Prediccion por chunks de acciones, lo que reduce la frecuencia efectiva de recalculado y favorece la suavidad del movimiento.
- Ejecucion en bucle cerrado a 30 FPS sobre el hardware objetivo.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling, function calling ni uso como agente conversacional.
- No tiene capacidades multilingues ni de vision general (segmentacion, deteccion generica, VQA): la vision se usa exclusivamente como entrada de control.
- No incorpora modo de "pensamiento", audio ni otras capacidades multimodales.

## Casos de uso
- Automatizacion del seguimiento de cordon de soldadura: la politica reproduce la trayectoria aprendida sobre el cordon desde el inicio hasta el final y regresa a la posicion inicial, adecuada para tareas repetitivas con geometria estable.
- Base para ajuste fino en nuevas geometrias de soldadura: al ser una politica ACT de 51,7 M de parametros, es viable reentrenarla con `lerobot-train` sobre datasets propios con decenas o cientos de episodios adicionales.
- Demostrador de flujo completo de aprendizaje por imitacion: sirve para ilustrar el ciclo grabar con teleoperacion, entrenar con ACT y desplegar con `lerobot-rollout`, util en docencia e investigacion.
- Validacion de hardware de bajo coste: el robot `so_follower` con dos camaras USB (480x640 a 30 FPS) permite reproducir el experimento en un banco economico.
- Pruebas de robustez en aprendizaje por imitacion: con solo 10 episodios, es un caso limite util para estudiar sensibilidad a iluminacion, posicion inicial y variaciones del material.
- Integracion en pipelines de robotica con LeRobot: la politica se puede invocar desde scripts de produccion mediante la CLI de LeRobot para ejecuciones acotadas por `--duration`.
- Punto de partida para comparativas de metodos: permite contrastar ACT frente a otras familias de politicas (por ejemplo, Diffusion Policy) sobre la misma tarea de soldadura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que aun no se han proporcionado resultados de evaluacion en robot real (numero de ensayos, exitos y tasa de exito).

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja. Con 51,7 M de parametros, los pesos en fp32 ocupan aproximadamente 0,2 GB y en fp16 alrededor de 0,1 GB; el consumo dominante proviene de las dos imagenes de 480x640 procesadas por el extractor visual.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 ejecutan la politica sin problemas. Tambien es viable en GPU integradas o CPU para inferencia a baja frecuencia.
- Cabe en GPU de consumo: si, con amplio margen (RTX 3060/4060 en adelante). Incluso es posible ejecutarla en CPU para pruebas, aunque a costa de la tasa de fotogramas.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) segun la documentacion oficial; el ecosistema LeRobot. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. El objetivo de diseno es operar a 30 FPS, pero la model card no aporta mediciones de latencia ni de throughput reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taisanson/act_welding_seam_following (ACT) | 51.668.614 | no disponible | sin evaluacion publicada | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Otras politicas ACT en LeRobot | no disponible | no disponible | no disponible | variable | repositorios publicos en HuggingFace |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos VLA tipo SmolVLA / pi0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada para establecer comparaciones cuantitativas con alternativas. La comparacion significativa seria frente a otras politicas ACT entrenadas sobre tareas comparables, midiendo tasa de exito en robot real, metrica que en este caso no se ha publicado.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de generalizacion incorrecta fuera de la distribucion de demostraciones, especialmente con cambios de iluminacion, materiales, posicion del cordon o del robot.
- Limitacion de datos: el entrenamiento usa solo 10 episodios y 8436 fotogramas de una unica tarea, lo que restringe gravemente la variabilidad cubierta.
- Limitaciones de contexto e idioma: no hay idioma. La politica depende de las claves de observacion exactas (`observation.images.wrist`, `observation.images.front`) y de las camaras configuradas con esos nombres; un desajuste impide la inferencia.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, siempre citando la metodologia (ACT) y LeRobot segun la model card. Conviene revisar la licencia del dataset asociado por separado.
- Ausencia de evaluacion: no hay tasa de exito publicada, por lo que no se recomienda su uso en produccion sin una validacion propia en robot real.
- Reproducibilidad: la model card no incluye el hardware exacto de entrenamiento ni la configuracion completa de camaras mas alla de la resolucion y los nombres de las vistas.
- Caveat de fecha: el repositorio figura creado en 2026 con 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Taisanson/act_welding_seam_following
- Dataset de entrenamiento: https://huggingface.co/datasets/Taisanson/welding-seam-following
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Taisanson/welding-seam-following
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
