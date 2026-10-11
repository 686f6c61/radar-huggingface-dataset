# thanhnguyen23/unbox_rdk_policy_5_noscale

## Resumen

`thanhnguyen23/unbox_rdk_policy_5_noscale` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante LeRobot. No es un modelo de lenguaje: es un controlador visomotor que consume dos flujos de imagen (una cámara lateral y otra en la muñeca), el estado articular y la pose del efector final, y produce directamente un vector de acción de 7 dimensiones para un brazo robótico Agilex.

El modelo tiene 51.670.663 parámetros en formato safetensors y ocupa 0,2 GB en el repositorio, por lo que es un sistema ligero que cabe sin problemas en GPU de consumo e incluso puede ejecutarse en CPU o en hardware embebido. Se entrenó sobre el dataset `thanhnguyen23/unbox_rdk_5`, compuesto por 50 episodios y 37.105 fotogramas grabados a 30 FPS, todos ellos correspondientes a una única tarea: abrir una caja RDK, extraer la placa del interior y colocarla encima de la caja.

Su relevancia es doble. Por un lado, es un ejemplo reproducible y de extremo a extremo del flujo de trabajo de LeRobot (grabación con teleoperación, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`). Por otro, sirve como punto de partida para fine-tuning en tareas de manipulación concretas, ya que la licencia Apache 2.0 permite uso comercial y modificación sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con cuello de botella latente tipo CVAE |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa secuencias de observaciones y emite chunks de acciones) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en safetensors sin cuantizar) |
| Idiomas soportados | no aplica (la salida son acciones de robot, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | agilex |
| Camaras de entrada | `cam_side`, `cam_wrist` (3, 480, 640) cada una |
| Entradas de estado | `observation.state` (7,), `observation.eef_pose` (7,) |
| Salida | `action` (7,) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso de control. La formulación, descrita en el articulo 2304.13705, combina un transformer con un cuello de botella latente de tipo CVAE: el modelo aprende una distribución sobre las acciones futuras dadas las observaciones actuales, lo que mitiga la ambigüedad de las demostraciones humanas y reduce el error de acumulacion que aparece en políticas paso a paso. Al emitir varios pasos de acción de una sola vez, el modelo tolera mejor la latencia de inferencia y produce trayectorias más suaves.

La política de este repositorio se entrenó con LeRobot 0.6.2 durante 10.000 pasos, con tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Los datos proceden de teleoperación sobre un robot Agilex, con dos cámaras a 640x480 y 30 FPS, y contienen 50 episodios y 37.105 fotogramas (aproximadamente 20,6 minutos de interacción) etiquetados con la tarea "Open the RDK box and pick the board out of the box, then place it on the top of the box". El nombre del repositorio incluye el sufijo `noscale`, lo que sugiere que el autor no aplico normalización de las acciones o de las observaciones durante el entrenamiento; no se proporciona más detalle al respecto.

## Capacidades

- Generación de acciones de manipulación de 7 grados de libertad (vector `action` de shape `(7,)`) a partir de observación visomotora.
- Percepción visual con dos cámaras simultáneas (`cam_side` y `cam_wrist`) a resolución 640x480.
- Fusión de visión con estado propioceptivo: acepta `observation.state` (7,) y `observation.eef_pose` (7,) junto a las imágenes.
- Predicción de chunks de acciones, lo que permite ejecutar varios pasos de control por inferencia y amortiguar la latencia.
- Ejecución de una tarea concreta de tipo pick-and-place: abrir la caja RDK, extraer la placa y depositarla encima de la caja.
- Integración nativa con el ecosistema LeRobot: carga directa desde el Hub con `--policy.path` y ejecución con `lerobot-rollout`.
- Reentrenamiento y fine-tuning sobre datasets propios mediante `lerobot-train --policy.type=act`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modo de pensamiento; su ámbito es exclusivamente el control motor.

## Casos de uso

- Automatización de desembalaje en línea de montaje: la política ejecuta la secuencia completa de abrir una caja RDK, extraer la placa y colocarla encima, directamente sobre un robot Agilex, sin necesidad de programación explícita de trayectorias.
- Fine-tuning para variantes de la misma tarea: al estar bajo Apache 2.0 y entrenada con LeRobot, se puede reentrenar con 30-50 episodios nuevos para cambiar el objeto, la posición o el tipo de caja, partiendo de los pesos existentes.
- Banco de pruebas de un pipeline de aprendizaje por imitación: sirve para validar de extremo a extremo la cadena de LeRobot (grabación con teleoperación, entrenamiento, rollout y visualización del dataset) antes de invertir en recogida de datos a mayor escala.
- Investigación comparativa en políticas robóticas: ACT es una de las referencias frente a Diffusion Policy o VQ-BeT, y este checkpoint funciona como baseline reproducible con semilla y configuración documentadas.
- Validación de hardware y calibración de un Agilex: ejecutar una política conocida permite comprobar cámaras, cinemática y latencia del bus de control en un montaje nuevo.
- Formación y docencia en robótica: la tarea es corta, visual y fácil de evaluar, lo que la hace adecuada para prácticas de aprendizaje por imitación con resultados medibles en pocos minutos.
- Manipulación de precisión pieza a pieza en laboratorios de electrónica: extraer componentes de contenedores y recolocarlos en posiciones concretas, siempre que la geometría se mantenga dentro de la distribución de entrenamiento.
- Prototipado rápido de células de pick-and-place en logística ligera: con menos de 51,7 M de parámetros, la política puede ejecutarse en un equipo de sobremesa conectado al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación sin rellenar y senala textualmente: "No evaluation results have been provided for this policy yet". No existen tasas de éxito, número de ensayos ni condiciones de prueba documentadas para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 207 MB en FP32 (51.670.663 parámetros x 4 bytes) y unos 103 MB en FP16/BF16. Conviene sumar el coste de activaciones y de los codificadores de imagen, aunque el total permanece muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, RTX 3090 o RTX 4090 cubren el caso con enorme margen; A100 o H100 son innecesarias para este tamano.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo de los últimos diez anos, e incluso en aceleradores embebidos tipo Jetson Orin o Raspberry Pi con GPU integrada para inferencia en FP32/FP16.
- CPU: la inferencia en CPU es viable dado el reducido numero de parámetros, aunque la latencia depende del preprocesado de las dos imágenes a 640x480.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con PyTorch es la via soportada oficialmente. vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje y no se publican pesos en GGUF.
- Latencia y throughput: no se han publicado mediciones. Como referencia de diseno, el dataset se capturo a 30 FPS, de modo que el bucle de control debe sostener 33 ms por paso para reproducir esa frecuencia; la prediccion por chunks ayuda a relajar ese requisito al ejecutar varias acciones por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thanhnguyen23/unbox_rdk_policy_5_noscale (ACT) | 51,7 M | Chunk de acciones (7,) | no disponible | apache-2.0 | Hugging Face Hub, integrado en LeRobot |
| Diffusion Policy | no disponible | Trayectoria de acciones generada por difusion | no disponible | no disponible | Implementacion de referencia publicada por los autores e integracion en LeRobot |
| VQ-BeT | no disponible | Acciones discretizadas con transformer autorregresivo | no disponible | no disponible | Implementacion publicada por los autores |
| SmolVLA | no disponible en esta busqueda | Acciones condicionadas por vision-lenguaje | no disponible | no disponible | Hugging Face Hub, integrado en LeRobot |

A diferencia de Diffusion Policy, que genera trayectorias mediante un proceso de difusion iterativo y suele requerir más pasos de inferencia por acción, ACT predice el chunk en una sola pasada del transformer, lo que reduce la latencia de control a costa de perder algo de multimodalidad en la distribución de acciones. Frente a enfoques basados en modelos vision-lenguaje-accion como SmolVLA, esta política no acepta instrucciones en lenguaje natural: esta especializada en una única tarea y no generaliza a ordenes nuevas sin reentrenamiento.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha visto una tarea ("Open the RDK box and pick the board out of the box, then place it on the top of the box"). Fuera de esa tarea o de objetos similares, el comportamiento esperado es fallido.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba, por lo que el rendimiento real en el robot es desconocido. Cualquier uso en produccion exige una validacion propia.
- Dependencia del montaje: las entradas incluyen `cam_side` y `cam_wrist` con posiciones concretas. Cambiar la colocación de las cámaras, la iluminación o el fondo invalida las observaciones respecto a la distribución de entrenamiento.
- Dependencia del robot: entrenada para un robot `agilex`. Usarla en otro modelo de brazo requiere recalibrar y muy probablemente reentrenar.
- Dataset pequeno: 50 episodios y unos 20,6 minutos de datos. Es un volumen bajo que favorece el sobreajuste a posiciones y apariencias concretas.
- Riesgo de alucinacion en el sentido de acciones espurias: como toda política de imitacion, puede producir movimientos no deseados ante entradas fuera de distribución. Debe desplegarse con paradas de emergencia y limites articulares activos.
- Sesgos de los datos de teleoperacion: el operador introduce sus propios sesgos de velocidad, altura y estrategia, que la política reproduce.
- Sin soporte multilingue ni de instrucciones: no acepta prompts de texto ni cambios de tarea en tiempo de ejecucion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. La propia model card solicita citar el articulo de ACT y LeRobot.
- Ausencia de datos de cuantizacion: no se publican pesos en FP16, INT8 o GGUF, por lo que cualquier optimizacion de ese tipo corre por cuenta del usuario.
- Fecha de publicacion inusualmente futura en los metadatos (2026), dato que conviene verificar antes de referenciar el modelo como estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanhnguyen23/unbox_rdk_policy_5_noscale
- Dataset de entrenamiento: https://huggingface.co/datasets/thanhnguyen23/unbox_rdk_5
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=thanhnguyen23/unbox_rdk_5
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
