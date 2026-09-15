# tsangb34/pi05-so101-soccer-red_bowl-40episodes

## Resumen

`tsangb34/pi05-so101-soccer-red_bowl-40episodes` es un ajuste fino de política robótica (Vision-Language-Action, VLA) construido sobre `lerobot/pi05_base`, la implementación en LeRobot de π₀.₅ de Physical Intelligence. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres cámaras) y produce directamente un vector de acción de 6 dimensiones, es decir, no genera texto: es un controlador visuomotor de extremo a extremo entrenado por imitación.

El ajuste se ha realizado sobre un único conjunto de datos de 40 episodios y 14 729 fotogramas a 30 FPS, con una sola tarea: recoger el pequeño balón de fútbol de juguete y colocarlo en el cuenco rojo. El robot objetivo es un seguidor SO-101 (`so_follower`) con cámaras `front` y `wrist`, más una entrada adicional `empty_camera_0` de 224×224. El entrenamiento fue corto: 921 pasos con batch de 16, optimizador AdamW y tasa de aprendizaje 2,5e-05, usando LeRobot 0.6.1.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino de π₀.₅ sobre hardware de bajo coste (brazo SO-101), como línea base para comparativas de imitación en el entorno RoboColosseum y como punto de partida para reentrenar políticas de pick-and-place. El checkpoint pesa 9,4 GB, tiene 4 143 404 816 parámetros y se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, adaptada de OpenPI e implementada en LeRobot; detalles internos de bloques no disponibles en la información proporcionada |
| Parámetros totales | 4 143 404 816 (~4,14 mil millones) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible (política de acción, no modelo de lenguaje conversacional) |
| Tipos de cuantización | No disponible: el repositorio publica únicamente safetensors en la precisión de entrenamiento; no se documentan variantes GGUF, AWQ, GPTQ ni INT8 |
| Idiomas soportados | No disponible (las instrucciones de tarea se pasan como texto, pero la model card no enumera idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`; tamaño del repositorio 9,4 GB) |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | `so_follower` (SO-101) |
| Modalidades de entrada | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640), `observation.images.empty_camera_0` (3, 224, 224) |
| Salida | `action` (6,) |
| Frecuencia de datos de entrenamiento | 30 FPS |
| Pipeline declarado | `robotics` |

## Arquitectura y entrenamiento

El modelo es una política VLA basada en π₀.₅, la evolución de π₀ de Physical Intelligence orientada a la generalización en entornos y situaciones no vistos durante el entrenamiento. La implementación empleada aquí procede del repositorio open source OpenPI de Physical Intelligence, adaptada a LeRobot. La model card no detalla la composición exacta del backbone visual-lenguaje ni del módulo de acción, por lo que ese desglose se marca como no disponible; lo que sí se especifica es el contrato de entrada/salida: dos imágenes RGB de 480×640 (muñeca y frontal), una tercera cámara de 224×224, un vector de estado de 6 componentes y un vector de acción de 6 componentes.

El ajuste fino se realizó sobre `tsangb34/robocolosseum-so101-soccer-red_bowl-40episodes`: 40 episodios, 14 729 fotogramas a 30 FPS, una única tarea ("Pick up the small soccer ball toy and place it in the red bowl"). La configuración de entrenamiento documentada es de 921 pasos, batch de 16, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias; el procedimiento es aprendizaje por imitación supervisado sobre demostraciones de teleoperación. Tampoco se describen innovaciones técnicas adicionales más allá de las propias del método π₀.₅.

## Capacidades

- Control visuomotor de 6 grados de libertad: genera comandos de acción continuos de dimensión 6 a partir de observaciones visuales y propioceptivas.
- Ejecución de una tarea de manipulación concreta: recoger un balón de fútbol de juguete y depositarlo en un cuenco rojo.
- Fusión de tres flujos visuales simultáneos (vista frontal, vista de muñeca y una cámara adicional de 224×224) con el estado articular.
- Condicionamiento por instrucción en lenguaje natural mediante el argumento `--task` de la CLI de LeRobot (soporte multilingüe real: no disponible).
- Operación en bucle cerrado en tiempo real sobre un robot SO-101 (`so_follower`) con `lerobot-rollout`.
- Compatibilidad con el ecosistema LeRobot para reentrenamiento, evaluación y publicación de políticas.
- Tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica; la política produce acciones, no planes simbólicos.
- Modo "thinking", visión generalista, audio o generación de texto: no disponible / no aplica.

## Casos de uso

- Replicación de experimentos de imitación: entrenar y desplegar la misma tarea sobre un SO-101 con `lerobot-train` y `lerobot-rollout` para verificar la reproducibilidad del pipeline con semilla 1000 y 921 pasos.
- Línea base en competiciones o benchmarks de robótica (RoboColosseum): usar esta política como referencia de éxito para la tarea "balón al cuenco rojo" y comparar contra otros ajustes o contra el modelo base.
- Punto de partida para nuevas tareas de pick-and-place: reajustar `lerobot/pi05_base` con un conjunto de datos propio (por ejemplo, 40-60 episodios) y usar esta ficha como plantilla de configuración (batch 16, lr 2,5e-05, AdamW).
- Docencia y formación en aprendizaje por imitación: el bajo coste del brazo SO-101 y la licencia Apache 2.0 permiten montar prácticas completas de recogida de datos, entrenamiento y despliegue.
- Investigación en generalización visual: al mantener el condicionamiento por lenguaje de π₀.₅, permite estudiar si el modelo transfiere a nuevas posiciones del balón, iluminación o distractores, aunque no haya resultados de evaluación publicados.
- Automatización de una celda de demostración en ferias o laboratorios: el script `lerobot-rollout` con `--duration` permite ejecutar la política durante un tiempo acotado sin grabar episodios, útil para demostraciones continuadas.
- Generación de datos sintéticos de evaluación: ejecutar la política de forma repetida para medir tasas de éxito propias y ampliar la tabla de evaluación que la model card deja vacía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas. Tampoco se han proporcionado métricas de pérdida de entrenamiento ni curvas de aprendizaje. Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (los enlaces devueltos corresponden a páginas de soporte de Microsoft, ajenas al tema).

## Requisitos de hardware

- Peso de los pesos en precisión de entrenamiento: 4 143 404 816 parámetros × 2 bytes (bf16/fp16) ≈ 8,3 GB; en fp32 ≈ 16,6 GB. El repositorio ocupa 9,4 GB.
- VRAM estimada para inferencia en bf16/fp16: ≥ 12-16 GB considerando los pesos más las activaciones de tres cámaras (dos a 480×640 y una a 224×224).
- VRAM estimada en fp32: ≥ 24 GB.
- Cuantización: no se publican pesos cuantizados, por lo que no se pueden dar cifras de VRAM para INT8/INT4 sin convertir el modelo por cuenta propia (estimación teórica: ~4,1 GB en 8 bits y ~2,1 GB en 4 bits).
- GPU recomendadas: para inferencia en bf16 basta una GPU de 16-24 GB. Encajan RTX 4090 (24 GB), RTX 4080 (16 GB, justo), L40S, A100 (40/80 GB) y H100. En consumer GPU con 12 GB o menos (RTX 3060, RTX 4070) el modelo completo en bf16 no entra sin cuantizar.
- Despliegue: el camino soportado es LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para reentrenamiento), con PyTorch y CUDA (`--policy.device=cuda`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; esos servidores están pensados para modelos de lenguaje y no aplican a una política de acción.
- Latencia y throughput: no disponibles. Como referencia derivada del dataset, la frecuencia de captura es de 30 FPS, lo que implica un presupuesto de ~33 ms por paso de inferencia si se quiere replicar el régimen temporal del entrenamiento; no se especifica si la política cumple ese presupuesto en las GPU mencionadas.

## Comparativa con modelos similares

No se dispone de datos verificados de terceros en la información proporcionada. La comparación se limita a lo documentado y al propio linaje del modelo.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsangb34/pi05-so101-soccer-red_bowl-40episodes` | 4 143 404 816 | No aplica / no disponible | Sin resultados de evaluación publicados | Apache 2.0 | HuggingFace (LeRobot) |
| `lerobot/pi05_base` (modelo base) | No disponible en la información (arquitectura π₀.₅ equivalente) | No disponible | No disponible | No disponible en la información | HuggingFace |
| Otras políticas VLA del ecosistema LeRobot (π₀, SmolVLA) | No disponible | No disponible | No disponible | No disponible | No disponible |
| VLA de propósito general comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

Criterio cualitativo: frente al modelo base, este checkpoint está especializado en una única tarea y un único robot, con 40 episodios de demostración; su ventaja es la ligereza del ajuste (921 pasos) y su desventaja, la nula generalización demostrada, al no existir evaluación.

## Limitaciones y advertencias

- Especialización extrema: entrenado con una sola tarea y 40 episodios; se espera un rendimiento pobre fuera de «recoger el balón y dejarlo en el cuenco rojo».
- Ausencia total de evaluación: la model card indica explícitamente que no se han aportado resultados en robot real, por lo que no hay tasa de éxito conocida ni condiciones de dificultad documentadas (posiciones nuevas, iluminación, distractores, otro robot del mismo tipo).
- Sin datos de sesgo: al ser una política robótica entrenada por imitación, puede reproducir sesgos de las demostraciones (posiciones iniciales, agarre, trayectorias concretas). No se documenta ningún análisis al respecto.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el riesgo equivalente de generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Dependencia estricta del hardware: las claves de observación deben coincidir exactamente (`front`, `wrist`, `empty_camera_0`) y el robot debe ser un `so_follower`; usar otras cámaras u otro robot invalida la política.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de `lerobot/pi05_base` y del método π₀.₅ de Physical Intelligence; conviene revisar las condiciones del modelo base y citar el método y LeRobot según el BibTeX de la model card.
- Repositorio sin tracción: 0 descargas y 0 «likes» en el momento de la consulta, creado y actualizado el 15 de septiembre de 2026; no hay garantía de mantenimiento ni de soporte.
- Idiomas soportados no documentados: se desconoce si las instrucciones de tarea funcionan correctamente en castellano.
- Advertencia sobre los resultados de búsqueda: la búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo; no se han podido triangular datos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsangb34/pi05-so101-soccer-red_bowl-40episodes
- Dataset de entrenamiento: https://huggingface.co/datasets/tsangb34/robocolosseum-so101-soccer-red_bowl-40episodes
- Visualizador del dataset (LeRobot Space): https://huggingface.co/spaces/lerobot/visualize_dataset?path=tsangb34/robocolosseum-so101-soccer-red_bowl-40episodes
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (Physical Intelligence), referenciado en la model card: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (BibTeX de la model card): Cadene, Remi et al., 2024 (`@misc{cadene2024lerobot}`)
