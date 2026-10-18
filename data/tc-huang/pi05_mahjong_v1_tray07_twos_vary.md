# tc-huang/pi05_mahjong_v1_tray07_twos_vary

## Resumen

`pi05_mahjong_v1_tray07_twos_vary` es un ajuste fino del modelo base `lerobot/pi05_base`, publicado por el usuario tc-huang en HuggingFace. Se trata de una política vision-lenguaje-acción (VLA) de la familia pi0.5 que no se usa para conversar ni generar texto, sino para predecir acciones de control de un brazo robótico SO-101 dentro de un entorno de simulación construido con Isaac Lab. La tarea concreta, deducida del nombre del dataset, es la manipulación de fichas de mahjong sobre una bandeja (variante `tray07`, configuración `twos`).

El alcance de la ficha es deliberadamente acotado porque la información disponible también lo es. En el momento de la consulta el repositorio acumulaba 0 descargas y 0 likes, no incluye métricas de evaluación ni tasas de éxito, y la model card se limita a documentar los hiperparámetros del entrenamiento y el preprocesado de las cámaras. No es, por tanto, un modelo listo para producción, sino un artefacto de investigación reproducible: un checkpoint de 30.000 pasos que permite replicar el pipeline de LeRobot 0.6.1 o servir de inicialización para fine-tunes posteriores sobre tareas de manipulación similares.

El entrenamiento se ejecutó con LeRobot 0.6.1 en float32, con el codificador visual descongelado (`freeze_vision_encoder=false`) y sin gradient checkpointing, usando el preset `pi05` de `scripts/train_lerobot.sh`. La model card detalla decisiones de preprocesado poco habituales —división de la cámara frontal en dos mitades solapadas de 224x224 y normalización por cuantiles de todos los frames del dataset— que condicionan cualquier intento de reutilización del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de `lerobot/pi05_base` (familia pi0.5); el detalle de la variante ajustada no esta documentado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor indica que el ajuste fino se realizo en float32 |
| Idiomas soportados | no disponible (no se documenta; es una politica de control robotico, no un modelo de lenguaje general) |
| Licencia | no disponible (la model card no declara licencia; los frames de entrenamiento incorporan material CC BY-SA 4.0) |
| Formato de pesos | no disponible; el repositorio se distribuye como checkpoint de LeRobot, con el ultimo en `main` y uno por cada guardado en ramas `step-<step>` |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` (revision `main`), un VLA de la familia pi0.5, y se ajusta con LeRobot 0.6.1 sobre el dataset `mahjong_v1_tray07_twos_vary` en la ejecucion `pi05_20261017_233312`. Los hiperparámetros declarados son: 30.000 pasos, batch de 12, `policy.scheduler_decay_steps=30000`, `save_freq=5000`, `log_freq=200`, `policy.freeze_vision_encoder=false`, `policy.gradient_checkpointing=false` y WandB desactivado. En términos aritméticos, 30.000 pasos con batch 12 suponen 360.000 presentaciones de muestra, aunque el numero de frames por muestra no se especifica. No se documenta el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; al tratarse de aprendizaje por imitación sobre un dataset LeRobot, no se describe ningún proceso de alineamiento por preferencias.

La parte mas singular es el preprocesador, que difiere del comportamiento por defecto de LeRobot 0.6.1: no recorta las cámaras; normaliza estados y acciones con los cuantiles de todos los frames del dataset en lugar de con la media por episodio que almacena LeRobot 0.6.1; presenta `observation.images.front_cam` como dos mitades solapadas (`front_cam` y `front_cam_right`) de 224x224 cada una; y reduce `observation.images.gripper_cam` con antialiasing, según `src/env/lightbox/split_camera.py`. El entorno de recogida de datos es una simulación Isaac Lab con un brazo SO-101, y los frames de entrenamiento muestran caras de fichas de mahjong adaptadas de `Mahjong_eg_TW.jpg` de Cangjie6 (CC BY-SA 4.0).

## Capacidades

- Prediccion de acciones de control end-to-end a partir de observaciones visuales y del estado del robot, siguiendo el paradigma VLA del modelo base.
- Entrada multi-camara: camara frontal dividida en dos vistas solapadas (`front_cam` y `front_cam_right`, 224x224 cada una) mas una camara de pinza (`gripper_cam`) reescalada con antialiasing.
- Manipulacion de fichas de mahjong en una bandeja concreta (`tray07`) en la variante de configuracion `twos`, dentro de simulacion Isaac Lab.
- Control del brazo SO-101 en el pipeline `lerobot` (libreria declarada en el repositorio).
- Punto de partida valido para fine-tuning posterior: al derivarse de `lerobot/pi05_base`, puede reajustarse sobre otros datasets LeRobot con el mismo preset.
- No se documenta soporte de tool calling ni de function calling: es una politica de accion, no un modelo de lenguaje con interfaces de herramientas.
- No se documenta soporte de agentes, razonamiento multi-paso simbolico, modo "thinking", vision general, audio ni capacidades multilingues.

## Casos de uso

- Reproduccion de experimentos: el checkpoint y los hiperparámetros publicados permiten replicar exactamente un entrenamiento pi05 de 30.000 pasos con LeRobot 0.6.1 sobre el dataset `mahjong_v1_tray07_twos_vary`, util para comparar versiones de la libreria o del preset.
- Baseline en estudios de variacion de datos: al existir variantes con el sufijo `_vary`, sirve como referencia para medir como afectan cambios en la composicion del dataset (posiciones de bandeja, configuraciones de fichas) al comportamiento de la politica.
- Inicializacion para nuevas tareas de manipulacion con SO-101: partir de este checkpoint en lugar de `pi05_base` reduce el numero de pasos necesarios cuando la tarea objetivo comparte dominio visual (fichas, bandeja, iluminacion de Isaac Lab).
- Validacion de pipelines de teleoperacion y grabacion: el modelo permite cerrar el bucle completo (grabar episodios, entrenar, evaluar en simulacion) antes de invertir en hardware real, ya que todo el flujo se ejecuta en Isaac Lab.
- Investigacion sobre preprocesado de camaras: la division de `front_cam` en dos mitades solapadas y el reescalado con antialiasing de `gripper_cam` se pueden aislar y comparar frente al preprocesado por defecto de LeRobot para medir su impacto en la tasa de exito.
- Estudio de normalizacion de acciones: la normalizacion por cuantiles globales frente a la media por episodio es un parametro reproducible con este checkpoint, util para analizar estabilidad del entrenamiento en datasets con episodios de distinta longitud.
- Docencia y divulgacion en IA encarnada: un caso de simulacion acotado y reproducible con SO-101 resulta adecuado para demostrar el ciclo completo de un VLA sin necesidad de robot fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de exito, curvas de perdida, comparaciones con el modelo base ni evaluaciones en simulacion o en robot real. El repositorio presenta 0 descargas y 0 likes, por lo que tampoco existen validaciones de terceros.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El numero de parametros del checkpoint no se documenta, por lo que no es posible estimar la huella de memoria con rigor.
- El entrenamiento declarado (batch de 12, codificador visual descongelado, sin gradient checkpointing, float32) exige una GPU con memoria abundante; el autor no especifica modelo ni VRAM utilizada.
- GPU recomendadas: no disponible. No hay datos publicados sobre que aceleradores se emplearon ni sobre minimos verificados.
- Encaje en GPU de consumo: no verificable con la informacion disponible.
- Opciones de despliegue: el repositorio esta pensado para la libreria `lerobot` (carga del checkpoint y ejecucion en el entorno de simulacion Isaac Lab asociado al proyecto). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y estos motores no son aplicables a una politica de accion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tc-huang/pi05_mahjong_v1_tray07_twos_vary` | VLA ajustado para SO-101 en simulacion (tarea mahjong) | no disponible | no disponible | no declarada | 0 descargas, 0 likes |
| `lerobot/pi05_base` | VLA base de la familia pi0.5, sin ajuste a tarea | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Publico en HuggingFace como modelo base |
| Otras politicas de la libreria LeRobot (pi0, SmolVLA) | Politicas de imitacion / VLA de proposito general | no disponible | no disponible | no disponible | No se han consultado datos de estos modelos en la busqueda realizada |

La busqueda web asociada no devolvio informacion tecnica sobre modelos comparables: los resultados obtenidos eran paginas de desambiguacion y fichas de operadores de transporte ajenas al tema, por lo que no se han podido contrastar parametros, contexto ni rendimiento de alternativas.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dominio muy restringido: la politica esta ajustada a una tarea concreta (fichas de mahjong, bandeja `tray07`, configuracion `twos`) en simulacion; no hay evidencia de generalizacion a otras disposiciones, objetos o entornos.
- Brecha simulacion-realidad no evaluada: el entrenamiento se realizo en Isaac Lab y no se documenta ningun experimento en un SO-101 fisico.
- Ausencia total de metricas: sin tasas de exito ni curvas de aprendizaje no es posible saber si el ajuste converge o si el checkpoint final es utilizable.
- Riesgo de sobreajuste: 30.000 pasos con batch de 12 sobre un unico dataset, sin validacion publicada, es compatible con un ajuste excesivo a las condiciones de recogida.
- Dependencia fuerte del preprocesador: reutilizar el checkpoint sin replicar la division de `front_cam` en dos mitades de 224x224, el reescalado de `gripper_cam` y la normalizacion por cuantiles globales degradara las predicciones de forma dificil de diagnosticar.
- Sobre el modo de fallo: al ser una politica de accion, el equivalente a la alucinacion es la ejecucion de trayectorias incorrectas o inseguras, sin signal textual que permita detectarlo; en robot real exigiria limites de par, paradas de emergencia y supervision.
- Trazabilidad de datos: los frames de entrenamiento incorporan caras de fichas derivadas de `Mahjong_eg_TW.jpg` (Cangjie6, CC BY-SA 4.0), lo que puede arrastrar obligaciones de atribucion y compartir-igual sobre materiales derivados.
- Sin informacion sobre sesgos, idiomas ni composicion demografica del dataset, ya que no aplica al tratarse de datos de simulacion robotica.
- Versionado: `main` contiene el ultimo checkpoint y cada rama `step-<step>` un guardado intermedio; referenciar una rama concreta es imprescindible para reproducir resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tc-huang/pi05_mahjong_v1_tray07_twos_vary
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio de LeRobot (libreria y script de entrenamiento citados): https://github.com/huggingface/lerobot
- Imagen de origen de las caras de fichas: https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia del material de fichas: https://creativecommons.org/licenses/by-sa/4.0/
- Dataset `mahjong_v1_tray07_twos_vary`: no se proporciona enlace en la model card
- Paper, blog o demo del autor: no disponibles en la informacion proporcionada
