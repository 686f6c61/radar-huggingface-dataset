# Tron-Hayato/smolvla-policy

## Resumen

SmolVLA-policy (identificador `Tron-Hayato/smolvla-policy`) es una política robótica de tipo vision-language-action (VLA) publicada en Hugging Face por el usuario Tron-Hayato. No se trata de un modelo de lenguaje generalista, sino de un policy entrenado con LeRobot para controlar un brazo robótico concreto: consume el estado de las articulaciones más tres cámaras y produce un vector de acción de 6 dimensiones. Está afinado a partir del modelo base `lerobot/smolvla_base`, la implementación de SmolVLA descrita en el paper arXiv:2506.01844.

El modelo tiene 450.046.176 parámetros (unos 450 millones) y se distribuye en safetensors bajo licencia Apache 2.0, con un repositorio de 2,7 GB. El ajuste se ha hecho sobre el dataset `Tron-Hayato/record-act-merged`, compuesto por 64 episodios y 28.800 fotogramas grabados a 30 FPS para una única tarea: "Grab the object" (coger el objeto). Según la model card, SmolVLA es un modelo VLA compacto y eficiente, con rendimiento competitivo a coste computacional reducido, pensado para desplegarse en hardware de consumo.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de imitación con LeRobot: grabar datos con un robot de bajo coste (tipo `so_follower`), afinar una política VLA pequeña y ejecutarla. Es, por tanto, material útil para investigación aplicada y docencia en robótica, pero no un modelo validado para producción: no tiene descargas, no tiene valoraciones y el autor no ha publicado ninguna evaluación de éxito en robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; el detalle interno de capas no se especifica en la model card y se remite al paper arXiv:2506.01844 |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no se documenta una arquitectura de mezcla de expertos) |
| Longitud de contexto | No disponible; el modelo no consume una ventana de contexto conversacional, sino una instrucción de tarea fija más observaciones |
| Tipos de cuantizacion | No disponible; los pesos se publican sin cuantizar en safetensors |
| Idiomas soportados | No disponible; la tarea registrada usa la instrucción en inglés "Grab the object" |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras declaradas | `front`, `wrist` en la sección de detalles; la tabla de entradas lista `camera1`, `camera2` y `camera3` |
| Entradas | `observation.state` (6,); tres imágenes visuales (3, 256, 256) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red (número de capas, tipo de atención, congelación de módulos ni mecanismo de generación de acciones). Lo que sí declara es que la política consume tres cámaras con resolución de 256x256 píxeles más un vector de estado de 6 dimensiones, y que produce un vector de acción de 6 dimensiones, un formato coherente con un brazo tipo SO-100/SO-101. El modelo base, `lerobot/smolvla_base`, es la implementación de SmolVLA publicada por Hugging Face, cuyo método se documenta en el paper 2506.01844; cualquier detalle arquitectónico adicional debe consultarse allí.

El entrenamiento es un ajuste fino por imitación (behavior cloning) sobre el dataset `Tron-Hayato/record-act-merged`: 64 episodios, 28.800 fotogramas a 30 FPS, una sola tarea. La configuración registrada es de 5.000 pasos, batch de 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, ejecutado con LeRobot 0.6.1. No se menciona ningún uso de RLHF, DPO ni aprendizaje por refuerzo, ni innovaciones técnicas específicas de esta adaptación (decodificación especulativa, atención lineal, etc.). Con 5.000 pasos y batch 8 se han procesado aproximadamente 40.000 muestras, cifra inferior al número total de fotogramas del dataset, por lo que es probable que no se haya completado una época; se trata de un dato derivado de la configuración declarada, no confirmado por el autor.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 grados de libertad a partir del estado articular y de tres vistas de cámara.
- Ejecución de una única tarea aprendida: "Grab the object", definida por la instrucción de texto del dataset.
- Fusión de visión y estado: procesa simultáneamente tres entradas visuales de 256x256 y un vector de estado de 6 dimensiones.
- Despliegue sobre robot real mediante el flujo de LeRobot (`lerobot-rollout`), con estrategia base o con grabación de episodios.
- Reentrenamiento y ajuste fino sobre datasets propios con `lerobot-train`, partiendo de este policy o del base.
- Inferencia en GPU o CPU mediante el parámetro `--policy.device` de LeRobot.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, modo de pensamiento, audio u otras modalidades.

## Casos de uso

- Recogida de objetos con brazo de bajo coste: es el caso para el que fue entrenado. Se ejecuta con `lerobot-rollout --policy.path=Tron-Hayato/smolvla-policy --task="Grab the object"` sobre un robot `so_follower`, con las cámaras situadas en la misma configuración que durante la grabación.
- Replicación de un pipeline completo de imitation learning: sirve como referencia reproducible para validar la cadena grabación de datos, calibración, entrenamiento (5.000 pasos, batch 8) y despliegue con LeRobot 0.6.1.
- Punto de partida para nuevos ajustes finos: con solo 64 episodios y 5.000 pasos de entrenamiento, este policy puede reutilizarse como inicialización para tareas de manipulación cercanas, siempre que se respete el formato de entradas (estado de 6 dimensiones y tres cámaras).
- Docencia y prácticas de robótica: al caber en hardware de consumo, permite que estudiantes ejecuten una política VLA real en un banco de laboratorio sin acceso a clústeres.
- Investigación comparativa de políticas VLA: útil como línea base de 450 M de parámetros frente a variantes propias, siempre midiendo tasa de éxito en robot real y no solo la pérdida de entrenamiento.
- Demostraciones y ferias tecnológicas: el tamaño reducido de los pesos (unos 0,9 GB en bf16) facilita llevarlo en un equipo portátil con GPU integrada para demostraciones en directo.
- Recogida de datos asistida: ejecutado con estrategia de rollout con grabación, puede generar episodios adicionales que se incorporen al dataset para una segunda iteración de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye la sección de evaluación vacía, con la nota explícita de que no se han proporcionado resultados para esta política. No consta tasa de éxito, número de ensayos, ni evaluación en posiciones de objeto, iluminación o distractores distintos de los de entrenamiento. El dato de descargas y valoraciones en el Hub es de cero en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada a partir del número de parámetros: aproximadamente 1,8 GB para pesos en fp32 y unos 0,9 GB en bf16/fp16, sin contar activaciones, buffers de imagen ni estado del entorno de ejecución.
- Con tres entradas visuales de 256x256 y estado de 6 dimensiones, una estimación razonable de consumo total se sitúa en el rango de 2 a 4 GB; se recomienda disponer de al menos 6 GB de VRAM para trabajar con margen. Es una estimación aritmética, no una medición publicada por el autor.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090 o equivalentes con 8 GB o más. También en GPUs de gama de entrada con 6 GB, con menos margen.
- Es posible la inferencia en CPU seleccionando `--policy.device=cpu` en el flujo de LeRobot; no hay datos publicados de latencia en CPU ni del impacto en la frecuencia de control a 30 FPS.
- Opciones de despliegue: el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`, herramientas `lerobot-*`). No aplican servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama, porque no es un modelo de lenguaje.
- El repositorio ocupa 2,7 GB, muy por encima de los aproximadamente 0,9 GB de pesos en bf16, lo que sugiere la presencia de checkpoints intermedios o pesos en mayor precisión. Conviene revisar el contenido del repositorio antes de descargarlo en un equipo con poco disco.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Solo se dispone de información sobre el modelo base declarado. No hay datos en la información proporcionada sobre parámetros, contexto o rendimiento de otras alternativas VLA, de modo que la comparativa se limita a esos dos elementos.

| Modelo | Parametros | Tipo | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tron-Hayato/smolvla-policy | 450.046.176 | Politica VLA afinada | 64 episodios, 28.800 fotogramas, tarea "Grab the object" | Apache 2.0 | Publicado en Hugging Face, 0 descargas |
| lerobot/smolvla_base | No disponible | Politica VLA base (SmolVLA) | No disponible | No disponible | Publicado en Hugging Face como modelo base |
| Otras alternativas VLA | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Alcance funcional muy estrecho: el policy está entrenado para una única tarea, "Grab the object", sobre un tipo de robot concreto (`so_follower`). No se ha demostrado que generalice a otras tareas, objetos o posiciones.
- Dataset de entrenamiento muy pequeño: 64 episodios y 28.800 fotogramas, equivalentes a unos 16 minutos de grabación a 30 FPS. Es un volumen bajo para una política de 450 M de parámetros, con riesgo alto de sobreajuste a las condiciones exactas de la grabación (posiciones, iluminación, fondo, objetos).
- Sin evaluación publicada: la model card declara explícitamente que no hay resultados de evaluación. No existe tasa de éxito medida, ni número de ensayos, ni análisis de fallos.
- Inconsistencia en la documentación de cámaras: la sección de detalles indica `front` y `wrist`, mientras que la tabla de entradas lista `camera1`, `camera2` y `camera3`. Antes de desplegar hay que verificar los nombres exactos de las claves de observación, porque LeRobot exige que las cámaras del robot coincidan con las del entrenamiento.
- Dependencia estricta del formato de observación: estado de 6 dimensiones y tres imágenes de 256x256. Cambiar la resolución, el número de cámaras o el orden de las articulaciones invalida la política.
- Riesgo de fallo silencioso en robot real: en políticas VLA, los modos de fallo típicos son deriva de la trayectoria, agarres fallidos y movimientos no previstos ante objetos o iluminación distintos. Es imprescindible ejecutar con parada de emergencia y límites de par antes de cualquier prueba con hardware real.
- Idiomas no documentados: no hay información sobre capacidades multilingües. La única instrucción registrada está en inglés.
- Restricciones de licencia: los pesos de este policy se publican bajo Apache 2.0, lo que permite uso comercial. Hay que verificar por separado la licencia del modelo base `lerobot/smolvla_base` y las condiciones del dataset `Tron-Hayato/record-act-merged` antes de un uso comercial.
- Ausencia de validación comunitaria: cero descargas y cero valoraciones. Nadie ha reproducido ni auditado el resultado.
- Anomalía en los metadatos del Hub: las fechas de creación y actualización figuran como 2026-09-10, posteriores a la fecha habitual de publicación. Conviene tratarlas con cautela.
- Número de pasos frente al tamaño del dataset: con 5.000 pasos y batch 8 se procesan unas 40.000 muestras, menos que los 28.800 fotogramas por época completa. Es posible que el entrenamiento no haya cubierto una época entera; el autor no lo aclara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tron-Hayato/smolvla-policy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-act-merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tron-Hayato/record-act-merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Paper de SmolVLA en arXiv: https://arxiv.org/abs/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: los resultados de la búsqueda web recibidos no contienen enlaces relevantes para este modelo; tratan sobre la película Tron y la red blockchain TRON, sin relación con el identificador `Tron-Hayato` ni con robótica.
