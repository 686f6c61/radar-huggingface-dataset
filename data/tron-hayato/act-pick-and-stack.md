# Tron-Hayato/act-pick-and-stack

## Resumen

`act-pick-and-stack` es una política de imitación (policy) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de control visomotor que recibe el estado de las articulaciones y tres cámaras RGB y emite directamente comandos de acción de 6 dimensiones. Lo publica el usuario Tron-Hayato en el Hub de HuggingFace mediante LeRobot, la librería de aprendizaje por imitación de HuggingFace.

El modelo resuelve una tarea muy concreta: apilar bloques. Concretamente, la instrucción de la tarea es "Pick up blocks on the left one by one and stack them on top of the blocks on the right side". Se ha entrenado con 60 episodios de teleoperación (107.409 frames a 30 FPS) sobre un robot `so_follower` (brazo SO-100) equipado con tres cámaras: `side`, `wrist` y `top`. El checkpoint tiene 51.648.134 parámetros y se distribuye en safetensors con licencia Apache 2.0.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: dataset público, configuración de entrenamiento documentada y comando de despliegue listo para ejecutar. Es útil como referencia para quien quiera entrenar su propia política ACT o comparar resultados de apilamiento de bloques, no como modelo de propósito general: el autor no ha publicado ninguna evaluación de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual ResNet y decodificador de trozos de acción (action chunks) |
| Parametros totales | 51.648.134 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: política de imitación, no es un modelo de lenguaje; la "memoria" es la ventana de observación y el chunk de acciones) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay versiones GGUF, int8 ni fp16 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural como entrada; la instrucción de tarea es una cadena fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

Otros datos de la model card: tipo de robot `so_follower`; cámaras `side`, `wrist`, `top`; entrada `observation.state` de forma `(6,)` y tres imágenes `(3, 480, 640)`; salida `action` de forma `(6,)`; librería `lerobot` versión 0.6.1; pipeline `robotics`.

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un trozo (chunk) de acciones futuras a partir de las observaciones actuales. La arquitectura combina un transformer con codificadores visuales de tipo ResNet para cada cámara y un decodificador que genera la secuencia de acciones; el paper original introduce además un mecanismo de agregación temporal (temporal ensembling) para suavizar la ejecución del chunk en el robot. Esta política concreta consume tres vistas de 480x640 píxeles más el vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones por paso.

Los datos de entrenamiento son exclusivamente teleoperados: 60 episodios, 107.409 frames a 30 FPS, recogidos en el dataset `Tron-Hayato/record-pick-and-stack` sobre una única tarea de apilamiento de bloques. La configuración documentada es de 5.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, ejecutada con LeRobot 0.6.1. No se indica en la información disponible el número total de tokens ni detalles sobre aumentos de datos, y no hay constancia de etapas de RLHF o DPO (no aplicables en este paradigma: el aprendizaje es supervisado sobre demostraciones).

## Capacidades

- Control visomotor de un brazo robot de 6 grados de libertad: mapea directamente observaciones (estado + 3 imágenes) a acciones de 6 dimensiones.
- Ejecución de una tarea de manipulación concreta: recoger bloques de la zona izquierda y apilarlos sobre los de la derecha.
- Percepción multi-cámara: integra simultáneamente vistas lateral, de muñeca y cenital a 480x640, lo que aporta información de profundidad y oclusión.
- Generación de trozos de acción (action chunking), lo que reduce el error de acumulación y suaviza el movimiento respecto a políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni de un simulador.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso simbólico, visión general, audio ni comprensión multilingüe.

## Casos de uso

- Apilamiento de bloques en banco de pruebas: ejecutar la política con `lerobot-rollout` sobre un SO-100 con las tres cámaras en las mismas posiciones que en el dataset, para validar la cadena completa de hardware y software antes de entrenar tareas propias.
- Reproducción de un baseline de imitación: usar este checkpoint como referencia de partida al comparar variantes de ACT (distinto número de pasos, learning rate o número de cámaras) sobre el mismo dataset de 60 episodios.
- Docencia y formación en aprendizaje por imitación: el par dataset + política permite mostrar en un curso el ciclo completo de teleoperación, grabación, entrenamiento y despliegue con datos y comandos públicos.
- Base para fine-tuning en tareas de ensamblaje sencillas: al partir de pesos ya entrenados en manipulación de bloques, un reentrenamiento corto con 20-50 episodios nuevos puede adaptar la política a una variante de la tarea (por ejemplo, bloques de otro color o geometría).
- Pruebas de robustez visual: evaluar cómo afectan cambios de iluminación, posición de cámara o presencia de distractores en el área de trabajo, aprovechando que la política usa tres vistas y que el autor no documenta evaluación al respecto.
- Investigación en agregación temporal: comparar la ejecución con y sin temporal ensembling sobre este checkpoint para medir su efecto en la suavidad y la tasa de éxito del apilamiento.
- Integración en un pipeline de recogida de datos automatizado: desplegar la política como "compañero" que genera episodios adicionales de apilamiento para ampliar el dataset, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y la tabla de evaluación (tarea, intentos, éxitos, tasa de éxito) está vacía. Tampoco se proporcionan métricas de pérdida de entrenamiento ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman 51,6 M de parámetros, es decir, aproximadamente 0,21 GB en fp32. Sumando activaciones de los tres codificadores visuales a 480x640 y el estado del transformer, una estimación prudente es inferior a 2 GB de VRAM en fp32. Cifra orientativa: no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente por capacidad de modelo; una RTX 3060, RTX 4060, RTX 4090 o una A100 permiten además ejecutar el bucle de control a 30 FPS sin cuello de botella. El factor limitante real es la latencia de inferencia, no la memoria.
- Cabe en GPU de consumo: sí, con margen amplio. También es viable en CPU para pruebas lentas, aunque no se garantiza el ritmo de 30 FPS que marca el dataset.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Tron-Hayato/act-pick-and-stack`), o PyTorch directamente cargando los safetensors. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de frecuencia de inferencia ni de tiempo por episodio. La camada de acción (chunk) reduce el número de inferencias necesarias, pero el tamaño exacto del chunk no se especifica en la información disponible.
- Almacenamiento: 0,2 GB para el repositorio completo, más el dataset `Tron-Hayato/record-pick-and-stack` para reentrenar (107.409 frames con tres cámaras).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-pick-and-stack (este) | 51.648.134 | 3 imagenes 480x640 + estado (6,) | sin evaluacion publicada | apache-2.0 | HuggingFace + LeRobot |
| Diffusion Policy (implementacion LeRobot) | no disponible | configurable por tarea | no disponible | no disponible | LeRobot |
| VQ-BeT (implementacion LeRobot) | no disponible | configurable por tarea | no disponible | no disponible | LeRobot |
| SmolVLA (implementacion LeRobot) | no disponible | politica VLA con entrada de lenguaje | no disponible | no disponible | LeRobot |

La comparación relevante es metodológica más que numérica: ACT se distingue por predecir chunks de acciones con un transformer y un coste de inferencia bajo, mientras que Diffusion Policy genera acciones mediante difusión (más coste por paso) y las políticas VLA tipo SmolVLA añaden condicionamiento por lenguaje a cambio de un modelo mucho mayor. No se dispone de datos de rendimiento homogéneos sobre esta tarea para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no reporta tasa de éxito, número de intentos ni condiciones de prueba. Cualquier despliegue en producción parte de una incógnita de fiabilidad.
- Sobreajuste a la configuración física: la política está entrenada con un robot `so_follower` concreto y tres cámaras con nombres y posiciones específicos (`side`, `wrist`, `top`). Cambiar la montura, el objetivo o el índice de cámara invalida la política.
- Vocabulario de tarea cerrado: solo conoce "Pick up blocks on the left one by one and stack them on top of the blocks on the right side". No generaliza a otras instrucciones ni a objetos no vistos en los 60 episodios.
- Sensibilidad a la distribución visual: iluminación, fondo, color de los bloques y posición inicial de los objetos fueron fijados implícitamente durante la grabación; no hay datos sobre robustez ante cambios.
- Dataset pequeño: 60 episodios y una única tarea implican poca diversidad de trayectorias; la variabilidad de agarre y de recuperación ante fallos será limitada.
- Riesgo de alucinación en sentido robótico: la política siempre produce una acción aunque la escena esté fuera de distribución (objetos ausentes, robot mal calibrado), sin mecanismo de detección de fallo ni parada de seguridad.
- Sin salvaguardas de seguridad: es una política de posiciones articulares; debe ejecutarse con límites de par, parada de emergencia y supervisión humana en el espacio de trabajo.
- Idiomas y texto: la instrucción de tarea se pasa como cadena fija al comando de despliegue; no hay comprensión de lenguaje, por lo que no cabe esperar interacción conversacional ni instrucciones nuevas en castellano.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución al paper de ACT y a LeRobot.
- Nomenclatura: el nombre del autor (`Tron-Hayato`) no guarda relación con la franquicia cinematográfica Tron; las búsquedas web sobre ese término devuelven resultados no pertinentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tron-Hayato/act-pick-and-stack
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-pick-and-stack
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tron-Hayato/record-pick-and-stack
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
