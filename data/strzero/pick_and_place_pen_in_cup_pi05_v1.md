# strzero/pick_and_place_pen_in_cup_pi05_v1

## Resumen

Esta ficha describe `strzero/pick_and_place_pen_in_cup_pi05_v1`, una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario `strzero` en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05), el modelo de acción visión-lenguaje de Physical Intelligence. El modelo resuelve una única tarea de manipulación: coger un bolígrafo y dejarlo dentro de una taza.

El repositorio contiene 4.143.404.816 parámetros (unos 4,14 mil millones) en formato safetensors, con un tamaño total de 9,4 GB, y se distribuye bajo licencia Apache 2.0. La arquitectura interna no se detalla en la model card; únicamente se indica que es un modelo VLA y que la implementación de LeRobot está adaptada del repositorio OpenPI del propio fabricante.

Su relevancia es doble: por un lado, ejemplifica el flujo completo de aprendizaje por imitación sobre hardware asequible (robot seguidor `so_follower` de la familia SO-100/SO-101), y por otro permite reproducir y estudiar el comportamiento de π₀.₅ en una tarea concreta. El modelo se publicó el 10 de septiembre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), derivada de π₀.₅ (Pi05) de Physical Intelligence; implementación de LeRobot adaptada de OpenPI. El backbone y el mecanismo interno de generación de acciones no se detallan en la model card |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | no aplica (no se documenta una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos publicados son safetensors (repositorio de 9,4 GB para 4,14B parámetros) |
| Idiomas soportados | no disponible; la instrucción de tarea del dataset está en inglés y el modelo no se plantea como multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo / pipeline | robotics (política de control) |
| Biblioteca | lerobot (versión 0.6.1 durante el entrenamiento) |
| Modelo base | lerobot/pi05_base |
| Robot objetivo | so_follower (SO-100/SO-101 seguidor) |
| Cámaras | top y wrist, a 480x640 y 30 FPS |
| Entrada | observation.state (6,), observation.images.top (3, 480, 640), observation.images.wrist (3, 480, 640) |
| Salida | action (6,) |
| Dataset de entrenamiento | strzero/pick_and_place_pen_in_cup_fixed (50 episodios, 32.427 fotogramas, 30 FPS) |
| Tarea | "Pick up the pen and place it in the cup" |
| Fecha de publicación | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una política VLA que consume observaciones multimodales (dos flujos de imagen de 480x640 más un vector de estado de 6 dimensiones) y produce directamente un vector de acción de 6 dimensiones. La model card lo describe como una evolución de π₀ orientada a la generalización en entornos y situaciones nuevas, y señala que la implementación de LeRobot procede del repositorio OpenPI. No se especifican en la documentación proporcionada el backbone de visión-lenguaje concreto, el mecanismo de decodificación de acciones (por ejemplo, flow matching o discretización por tokens) ni la composición del corpus de preentrenamiento del modelo base.

El ajuste fino se realizó sobre el dataset `strzero/pick_and_place_pen_in_cup_fixed`, compuesto por 50 episodios y 32.427 fotogramas grabados a 30 FPS de la tarea "coger el bolígrafo y ponerlo en la taza". La configuración de entrenamiento indicada es: 30.000 pasos, tamaño de lote 1, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 42 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineamiento posterior, ni el número total de tokens o muestras vistas durante el preentrenamiento del modelo base.

## Capacidades

- Generación de acciones robóticas end-to-end: produce comandos de 6 grados de libertad a partir de la observación visual y del estado del robot.
- Percepción visual dual: procesa dos cámaras simultáneas (`top` y `wrist`) a resolución 480x640.
- Ejecución de una instrucción de tarea en lenguaje natural, concretamente "Pick up the pen and place it in the cup", condicionada por el texto de la tarea.
- Control reactivo a 30 FPS, que es la frecuencia a la que se grabaron los datos de entrenamiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, planificación multi-paso ni razonamiento encadenado.
- No se documentan capacidades multilingües, de generación de texto, de código, de matemáticas ni de visión general (captioning, VQA, etc.).
- No se documenta ningún modo especial (thinking mode, audio, memoria a largo plazo).

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: el repositorio incluye el comando `lerobot-rollout` con la configuración exacta de robot y cámaras, lo que permite replicar la tarea de coger el bolígrafo y depositarlo en la taza en un banco de pruebas de laboratorio.
- Punto de partida para nuevos ajustes finos: al derivar de `lerobot/pi05_base` y publicarse con licencia Apache 2.0, sirve como referencia para entrenar políticas de otras tareas mediante `lerobot-train` sobre datasets propios.
- Validación de montajes de hardware SO-100/SO-101: la política exige un robot `so_follower` y dos cámaras a 640x480 y 30 FPS, por lo que resulta útil para comprobar la calibración, la sincronización de cámaras y la latencia del lazo de control.
- Control de calidad de datos de robótica: al estar entrenada sobre un dataset concreto, permite estudiar cómo afectan el número de episodios (50), el número de fotogramas (32.427) y la tasa (30 FPS) al comportamiento final de la política.
- Docencia y divulgación en robótica: es un caso autocontenido (una tarea, un robot, dos cámaras) que ilustra de forma tangible el ciclo completo de recogida de datos, entrenamiento y despliegue de un VLA.
- Automatización de una celda pick-and-place específica en laboratorio: el modelo puede integrarse en una secuencia repetitiva de coger un objeto alargado y soltarlo en un recipiente, siempre que el entorno se parezca al de grabación.
- Comparación de estrategias de inferencia: permite medir el coste computacional y la latencia real de una política VLA de 4,14B parámetros en una GPU concreta y ajustar la frecuencia de control en consecuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", e incluye una plantilla vacía para registrar tareas, ensayos, éxitos y tasa de éxito. No se dispone, por tanto, de cifras de tasa de éxito en robot real, ni de resultados en conjuntos como MMLU, HumanEval o GSM8K, que además no son aplicables a una política de control motor.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos (4.143.404.816 parámetros) ocupan aproximadamente 8,3 GB en bf16/fp16; con las activaciones de dos flujos de imagen de 480x640 y el estado del robot, una estimación prudente se sitúa en el rango de 10 a 12 GB. No hay cifras oficiales publicadas.
- GPU recomendadas: tarjetas con 24 GB o más, como RTX 3090, RTX 4090, L4, A10G, A100 o H100. No se documenta compatibilidad con GPUs de 16 GB sin cuantización, y no se ofrecen pesos cuantizados.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090 y RTX 4090 (24 GB). En GPUs de 8 o 12 GB no hay información que permita confirmarlo.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecutar la política sin grabación, y `lerobot-train` para reentrenar. Requiere el paquete `lerobot` (versión 0.6.1 o compatible) y CUDA. No aplican servidores de texto como vLLM o TGI, ni formatos GGUF/Ollama, dado que la salida son acciones y no texto.
- Latencia y throughput: no disponible. El lazo de control debe sostener los 30 FPS a los que se registraron los datos, por lo que la latencia de inferencia debe mantenerse por debajo de los 33 ms por paso para reproducir fielmente el comportamiento entrenado.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strzero/pick_and_place_pen_in_cup_pi05_v1 | 4,14B | Estado 6D + 2 cámaras 480x640 | Una tarea concreta (pick and place) | apache-2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista (modelo base del anterior) | no disponible en la información proporcionada | Hugging Face |
| Otras políticas VLA de LeRobot (por ejemplo π₀ o SmolVLA) | no disponible | no disponible | Manipulación generalista | no disponible | Hugging Face |

La diferencia principal frente a `lerobot/pi05_base` es de alcance: este repositorio es un ajuste fino de tarea única entrenado con 50 episodios, mientras que el modelo base está pensado para generalización abierta. No se dispone de datos verificados de parámetros, contexto o rendimiento de las alternativas citadas dentro de la información proporcionada, por lo que no se ofrece una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada en robot real, ni número de ensayos, ni condiciones de prueba.
- Dataset muy reducido: 50 episodios y 32.427 fotogramas para una sola tarea, lo que aumenta el riesgo de sobreajuste al entorno de grabación.
- Especialización extrema: el modelo ejecuta una única instrucción ("Pick up the pen and place it in the cup"); no se espera que responda a otras órdenes ni que generalice a objetos distintos.
- Sensibilidad al entorno: cambios en la posición de los objetos, la iluminación, el fondo o la presencia de distractores pueden degradar el comportamiento, ya que no se documenta ninguna variación de este tipo en los datos.
- Dependencia estricta del hardware: requiere un robot `so_follower` y dos cámaras (`top` y `wrist`) a 480x640 y 30 FPS; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Fiabilidad de la licencia: el repositorio declara Apache 2.0, pero conviene verificar los términos aplicables al modelo base `lerobot/pi05_base` y a π₀.₅ antes de un uso comercial.
- Idiomas: no hay soporte multilingüe documentado; la única instrucción disponible está en inglés.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de funcionamiento en configuraciones distintas de la del autor.
- Riesgo de alucinación en el sentido robótico: ante observaciones fuera de distribución, la política puede generar trayectorias no seguras; se recomienda operar con límites de par, parada de emergencia y espacio de trabajo despejado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strzero/pick_and_place_pen_in_cup_pi05_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/strzero/pick_and_place_pen_in_cup_fixed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=strzero/pick_and_place_pen_in_cup_fixed
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI (referenciado en la model card como origen de la implementación): no se incluye URL explícita en la información proporcionada
