# Tridex/model_act_3cam_10K_22_09

## Resumen

Tridex/model_act_3cam_10K_22_09 es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un controlador de manipulación entrenado para mapear observaciones sensoriales (estado articular y tres cámaras) a comandos motores de 6 grados de libertad. El autor, Tridex, lo ha entrenado y publicado con LeRobot 0.6.1, la librería de Hugging Face para aprendizaje automático en robótica real.

La relevancia de esta ficha es acotada pero clara: es un checkpoint pequeño (51.668.614 parámetros, unos 0,2 GB de repositorio) que cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU, lo que lo convierte en un ejemplo representativo de las políticas de imitación de bajo coste que se pueden entrenar con hardware tipo SO-100/SO-101. ACT predice "chunks" de acciones en lugar de pasos individuales, lo que reduce el error acumulado típico de las políticas de imitación paso a paso.

El modelo está especializado en una única tarea: recoger un cilindro de gas y soltarlo (instrucción "take the gaz cylinder and drop it"), aprendida de 21 episodios teleoperados (22.397 fotogramas a 30 FPS). No se han publicado resultados de evaluación ni métricas de éxito en la información disponible, por lo que debe considerarse un checkpoint experimental y no una política validada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones; política de imitación, no un LLM |
| Parámetros totales | 51.668.614 (51,67 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible / no aplica: la ventana de observación y el horizonte de predicción de acciones vienen fijados por la configuración de entrenamiento, que la model card no detalla |
| Tipos de cuantización | No disponible: solo se publican pesos en safetensors; la model card no menciona cuantizaciones ni versiones GGUF/ONNX |
| Idiomas soportados | No disponible; la única cadena de texto es la instrucción de tarea en inglés ("take the gaz cylinder and drop it") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB, librería lerobot) |
| Tipo de robot | so_follower (familia SO-100/SO-101) |
| Cámaras de entrada | front, side, top |
| Entradas | observation.state (6,), observation.images.front (3, 480, 640), observation.images.side (3, 480, 640), observation.images.top (3, 480, 640) |
| Salidas | action (6,) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) a partir de observaciones. La arquitectura, según el paper referenciado (arXiv:2304.13705), combina un encoder de observaciones (imágenes más estado propioceptivo) con un transformer encoder-decoder que genera un bloque de acciones; el modelo utiliza un esquema tipo CVAE con una variable latente de estilo que se fija a la media en inferencia para obtener comportamiento determinista. Este checkpoint concreto integra tres vistas de cámara (front, side, top) a 480x640 y un vector de estado de 6 dimensiones, y emite acciones de 6 dimensiones, coherentes con un brazo tipo so_follower.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset Tridex/_20260922_140724: 21 episodios, 22.397 fotogramas a 30 FPS, una única tarea ("take the gaz cylinder and drop it"). La configuración declarada es de 10.000 pasos (de ahí el sufijo 10K del nombre), batch size 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. La model card no describe composición del dataset más allá del número de episodios, ni indica si hubo etapas de RLHF/DPO (no aplicables habitualmente en este tipo de políticas) ni innovaciones adicionales sobre el ACT original.

## Capacidades

- Generación de acciones motoras: predice chunks de acciones de 6 grados de libertad para un brazo so_follower a partir de observaciones multimodales.
- Fusión visual multi-cámara: consume tres vistas simultáneas (front, side, top) de 480x640 píxeles en color.
- Condicionamiento por tarea: acepta una instrucción textual de tarea ("take the gaz cylinder and drop it") que se usa como contexto, no como diálogo.
- Control reactivo de manipulación: ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`, con la política leyendo el estado del robot y las cámaras en cada paso.
- Aprendizaje por imitación: capacidad de ser reentrenado sobre nuevos datasets teleoperados con `lerobot-train` y `--policy.type=act`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión general (VQA) ni audio. Es una política de control, no un modelo generativo de propósito general.
- Capacidades multilingües: no disponibles; el único texto empleado es la instrucción de tarea asociada al dataset.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política puede reproducir la tarea de recoger un cilindro y depositarlo en la posición aprendida, ejecutándose en bucle cerrado con las tres cámaras como realimentación.
- Base para investigación en aprendizaje por imitación: sirve como punto de partida reproducible (10.000 pasos, semilla 1000, AdamW, lr 1e-5) para comparar variantes de ACT, cambios de resolución o número de cámaras.
- Reentrenamiento para nuevas tareas con hardware de bajo coste: sustituyendo el dataset por uno propio y relanzando `lerobot-train --policy.type=act`, se puede adaptar la misma receta a otras tareas de manipulación.
- Prototipado en robótica educativa: dado su tamaño (51,67 M de parámetros, 0,2 GB) se puede desplegar en equipos modestos, lo que facilita prácticas de imitación en entornos docentes con brazos SO-100/SO-101.
- Evaluación de pipelines de datos teleoperados: el dataset asociado (21 episodios, 22.397 fotogramas a 30 FPS) permite analizar la relación entre calidad/cantidad de demostraciones y tasa de éxito resultante.
- Referencia para comparativas de políticas en LeRobot: al estar publicado en el Hub con metadatos completos (tipo de robot, cámaras, formas de entrada/salida), es utilizable como baseline en estudios que comparen ACT frente a otras políticas del mismo ecosistema.
- Pruebas de integración en entornos simulados: la política puede ejecutarse contra un bucle de control que reproduzca el mismo formato de observaciones (estado de 6 dimensiones y tres imágenes de 480x640) antes de pasar al robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y no incluye tabla de tareas, ensayos, éxitos ni tasa de éxito. Tampoco se dispone de resultados en robot real, simulación, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 51.668.614 parámetros): aproximadamente 207 MB en FP32, 103 MB en FP16/BF16 y 52 MB en INT8, sin contar activaciones ni buffers de preprocesado de imagen. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- El coste dominante no son los pesos, sino el preprocesado de tres imágenes de 480x640 por paso de control a 30 FPS, que exige una GPU con capacidad de cómputo suficiente para mantener la frecuencia del bucle.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 4 GB de VRAM (por ejemplo, gama RTX xx60 o superior) debería ser suficiente; no se dispone de cifras verificadas para A100, H100 o RTX 4090 en este modelo concreto.
- Cabe en GPU de consumo: sí, según el tamaño del modelo; el factor limitante es el throughput de preprocesado de las tres cámaras, no la memoria de los pesos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Tridex/model_act_3cam_10K_22_09` y `--strategy.type=base`). El repositorio usa safetensors y PyTorch a través de la librería `lerobot`. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de robótica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento para establecer una comparativa cuantitativa. La comparación que sigue es únicamente categórica y se limita a lo que consta en la información proporcionada.

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tridex/model_act_3cam_10K_22_09 | ACT (imitación, 3 cámaras) | 51,67 M | No disponible | Sin resultados publicados | apache-2.0 | Hugging Face Hub (0 descargas, 0 likes) |
| ACT original (arXiv:2304.13705) | ACT (imitación bimanual, 4 cámaras) | No disponible | No disponible | Reportado en el paper original, no en esta ficha | No disponible en la información proporcionada | Paper y código de referencia |
| Otras políticas ACT de LeRobot | ACT (imitación) | No disponible | No disponible | No disponible | Variable según repositorio | Hugging Face Hub |
| Diffusion Policy (familia alternativa del ecosistema LeRobot) | Política por difusión | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Sobreajuste a una única tarea: el entrenamiento cubre exclusivamente "take the gaz cylinder and drop it" con 21 episodios; es esperable un comportamiento degradado ante cambios de objeto, posición, iluminación o presencia de distractores. No hay datos que cuantifiquen esta degradación.
- Ausencia total de evaluación: la model card declara que no se han aportado resultados. No hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no se puede afirmar que la política funcione en el robot real.
- Sesgos de datos: al proceder de teleoperación humana, la política hereda las trayectorias, velocidades y posiciones concretas demostradas; puede fallar ante configuraciones no representadas en los 22.397 fotogramas.
- Riesgo de alucinación en sentido estricto no aplica (no genera lenguaje), pero sí existe el equivalente conductual: la política puede producir acciones plausibles pero incorrectas cuando la observación se aleja de la distribución de entrenamiento.
- Dependencia del hardware exacto: las observaciones esperadas son un estado de 6 dimensiones y tres cámaras concretas (front, side, top). Los nombres de cámara deben coincidir con las claves de observación del entrenamiento; usar otra configuración invalida la inferencia.
- Idioma: la única cadena textual es una instrucción en inglés con una falta ortográfica en el dataset ("gaz" en lugar de "gas"); no hay soporte multilingüe ni de instrucciones en castellano.
- Licencia: apache-2.0 permite uso comercial, pero la licencia cubre los pesos, no el dataset ni el hardware; conviene revisar también la licencia del dataset Tridex/_20260922_140724 antes de un uso en producción.
- Madurez: el repositorio registra 0 descargas y 0 likes y no incluye vídeo de demostración ni resultados. No es un artefacto validado por la comunidad.
- Producción: no se recomienda su despliegue directo en un sistema crítico sin una campaña de evaluación propia con múltiples repeticiones y condiciones controladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_3cam_10K_22_09
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/_20260922_140724
- Visualizador de dataset de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/_20260922_140724
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (Cadene et al., 2024): https://github.com/huggingface/lerobot

Nota: los resultados de la búsqueda web proporcionada corresponden a guías de viaje sobre las cataratas del Iguazú y no guardan relación con este modelo; no se ha utilizado ninguna información de esas fuentes.
