# vicshi97/pi05_policy_sock-garbage-merged_2.0_lora_10k

## Resumen

pi05_policy_sock-garbage-merged_2.0_lora_10k es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario vicshi97 en HuggingFace, obtenida mediante ajuste fino (fine-tuning) del modelo base lerobot/pi05_base, que a su vez implementa π₀.₅ (Pi05) de Physical Intelligence dentro del ecosistema LeRobot. El modelo resuelve un problema muy concreto: ejecutar dos tareas de manipulación con un brazo robótico tipo `so_follower`, a partir de observaciones visuales y propioceptivas.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real de transferencia de un VLA preentrenado a una tarea de laboratorio con solo 200 episodios y 93.144 fotogramas grabados a 30 FPS. Por otro, ilustra el flujo de trabajo completo de LeRobot: grabar dataset, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`. El modelo consume dos cámaras RGB (base y muñeca) de 480x640 y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones.

Se trata de un artefacto de investigación, no de un producto generalista: no hay evaluación publicada, no se declaran parámetros ni requisitos de hardware, y el repositorio ocupa solo 0,3 GB, lo que apunta a un adaptador LoRA más que a un checkpoint completo del VLA base. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), derivada de π₀; política de imitación con entrada visual y propioceptiva y salida de acciones continuas |
| Parametros totales | no disponible (el repositorio ocupa 0,3 GB, compatible con un adaptador LoRA sobre el modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de texto; la entrada es fija: 2 imágenes RGB de 480x640 y estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible (no documentados) |
| Idiomas soportados | no disponible (las instrucciones de tarea de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower |
| Camaras | base, wrist |
| Entradas | observation.state (6,); observation.images.base_0_rgb (3, 480, 640); observation.images.wrist_0_rgb (3, 480, 640) |
| Salidas | action (6,) |
| Dataset de entrenamiento | vicshi97/sock-garbage-merged_2.0 (200 episodios, 93.144 fotogramas, 30 FPS) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅ (Pi05) de Physical Intelligence, una evolución de π₀ orientada a la generalización en entornos y situaciones no vistos durante el entrenamiento. La implementación disponible en LeRobot está adaptada del repositorio open source OpenPI de Physical Intelligence. Se trata de un VLA: un backbone vision-language que procesa imágenes y la instrucción de tarea, acoplado a un mecanismo de generación de acciones continuas para control robótico. No se dispone de detalles adicionales sobre el número de capas, la dimensión del modelo o la composición exacta de los datos de preentrenamiento del modelo base a partir de la información proporcionada.

El ajuste fino aquí publicado se realizó sobre el dataset vicshi97/sock-garbage-merged_2.0, que contiene 200 episodios y 93.144 fotogramas a 30 FPS, con dos tareas: "pick up the garbage and put it in the basket" y "pick up the sock and put it in the container". La configuración de entrenamiento declarada es de 10.000 pasos, batch size 16, optimizador AdamW, learning rate 0,00025, semilla 1000 y LeRobot 0.6.2. El nombre del repositorio (`lora_10k`) sugiere que el ajuste se hizo con LoRA y 10.000 pasos. No se menciona uso de RLHF, DPO ni ningún esquema de refuerzo; el paradigma es aprendizaje por imitación (behavioral cloning) a partir de demostraciones teleoperadas.

## Capacidades

- Manipulación robótica de dos tareas concretas: recogida de basura y depósito en una cesta, y recogida de un calcetín y depósito en un contenedor.
- Percepción visual multimodal: procesa simultáneamente dos cámaras RGB (vista base y vista de muñeca) a 480x640.
- Integración de propiocepción: consume el estado del robot como vector de 6 dimensiones y emite acciones de 6 dimensiones.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como cadena de texto (por ejemplo, `--task="pick up the garbage and put it in the basket"`).
- Ejecución de políticas de imitación de forma continua a través de `lerobot-rollout`, con la frecuencia de control heredada del dataset (30 FPS).
- Capacidad de servir como punto de partida para nuevos ajustes finos sobre otros datasets.
- Soporte de tool calling / function calling: no disponible (no aplica a una política robótica).
- Soporte de agentes y razonamiento multi-paso explícito: no disponible.
- Modo de razonamiento (thinking mode), audio o vídeo generativo: no disponibles.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Recogida automatizada de residuos en un banco de pruebas: con un brazo `so_follower` y dos cámaras, el modelo ejecuta la tarea "pick up the garbage and put it in the basket" de forma continua durante el tiempo que se configure con `--duration`.
- Clasificación y recogida de calcetines: la segunda tarea entrenada permite depositar calcetines en un contenedor, útil como banco de pruebas de manipulación de objetos deformables.
- Investigación en aprendizaje por imitación: sirve para estudiar cómo se comporta un VLA ajustado con solo 200 episodios y comparar curvas de entrenamiento a 10.000 pasos frente a variantes más largas.
- Fine-tuning posterior sobre nuevos objetos o entornos: al ser un ajuste derivado de lerobot/pi05_base, se puede reentrenar con `lerobot-train` cambiando `--dataset.repo_id` para adaptarlo a nuevas tareas sin partir de cero.
- Recolección de datos con intervención humana (tipo DAgger): usar la política como punto de partida, detectar los episodios fallidos y volver a grabar demostraciones correctivas para iterar el modelo.
- Docencia y demostración de pipelines de robótica: ejemplifica el flujo completo grabar dataset, entrenar y desplegar con LeRobot, con comandos reproducibles.
- Evaluación comparativa de checkpoints: permite medir, en un mismo montaje físico, la diferencia entre un ajuste de 10.000 pasos y el de 20.000 pasos publicado por el mismo autor.
- Prototipado de automatización doméstica controlada: escenarios de limpieza sencillos en los que los objetos y las posiciones se aproximan a la distribución del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se han proporcionado resultados de evaluación (`_No evaluation results have been provided for this policy yet._`), por lo que no existe tasa de éxito por tarea, número de ensayos ni condiciones de prueba. Tampoco se han publicado métricas de latencia o throughput medidas en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El repositorio ocupa 0,3 GB, lo que corresponde probablemente a los pesos del adaptador o del checkpoint ajustado, pero la inferencia exige cargar el modelo base lerobot/pi05_base. Como referencia orientativa para un VLA de esta familia, se suele necesitar una GPU con al menos 16 GB de VRAM en bf16/fp16, aunque este dato no está confirmado por el autor.
- GPU recomendadas: no especificadas. El ejemplo oficial de LeRobot emplea `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con soporte CUDA.
- Compatibilidad con GPU de consumo: no confirmada. Una RTX 4090 (24 GB) o similar debería ser suficiente si se cumplen los requisitos del modelo base, pero no hay verificación publicada.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=vicshi97/pi05_policy_sock-garbage-merged_2.0_lora_10k`; entrenamiento o reajuste con `lerobot-train`. vLLM, TGI, llama.cpp y Ollama no aplican, ya que no es un modelo de lenguaje y no se distribuye en GGUF.
- Latencia y throughput: no disponibles. La única referencia temporal es la frecuencia del dataset, 30 FPS, que marca el ritmo de control esperado.
- Requisitos de entorno: dos cámaras OpenCV a 640x480 y 30 FPS, con nombres que coincidan exactamente con las claves de observación (`base`, `wrist`), y un robot de tipo `so_follower` con 6 grados de libertad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vicshi97/pi05_policy_sock-garbage-merged_2.0_lora_10k | no disponible (repo de 0,3 GB) | no aplica (2 imagenes 480x640 + estado de 6 dimensiones) | sin evaluacion publicada | Apache 2.0 | HuggingFace, libreria LeRobot |
| vicshi97/pi05_sock-garbage-merged_2.0_20k | no disponible | no aplica | sin evaluacion publicada | no disponible en la informacion proporcionada | HuggingFace, libreria LeRobot |
| lerobot/pi05_base | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada | HuggingFace, modelo base de la familia |
| Pi05 original (Physical Intelligence, via OpenPI) | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Repositorio OpenPI |

No se dispone de datos comparativos de rendimiento entre estas variantes: ninguna de las fichas consultadas publica tasas de éxito ni métricas de benchmark.

## Limitaciones y advertencias

- Ausencia total de evaluación: no existe tasa de éxito medida, ni número de ensayos, ni condiciones de prueba, por lo que se desconoce si la política funciona de forma fiable.
- Alcance muy restringido: solo se ha entrenado para dos tareas y sobre un robot concreto (`so_follower`), con un estado de 6 dimensiones y una acción de 6 dimensiones. No es una política generalista.
- Posible sobreajuste al entorno del dataset: posiciones de objetos, iluminación, fondo, tipo de cámara y montaje mecánico pueden afectar drásticamente al rendimiento fuera de esa distribución.
- Dependencia estricta de las entradas: exige dos cámaras con los nombres `base` y `wrist`, resolución 480x640 y 30 FPS. Cualquier cambio de calibración, encuadre o resolución puede degradar el comportamiento.
- Instrucciones en inglés: las dos tareas del dataset están redactadas en inglés; el comportamiento ante instrucciones parafraseadas, en castellano o fuera de las dos cadenas vistas no está documentado.
- Riesgo de alucinación en el sentido robótico: no genera texto, pero puede producir trayectorias incoherentes o acciones erráticas en situaciones novedosas, sin señal de confianza asociada.
- Sesgos de los datos: derivados de los objetos y el entorno concretos empleados (calcetines, residuos domésticos, contenedores específicos).
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base lerobot/pi05_base y del trabajo original de Physical Intelligence, así como citar LeRobot y el método correspondiente según la model card.
- Sin datos de cuantización ni de optimización para producción: no se han documentado variantes cuantizadas, ni latencias, ni requisitos de VRAM verificados.
- Repositorio con escasas señales de mantenimiento: 0 descargas y 0 likes en el momento de redactar esta ficha, y fechas de creación y actualización separadas por segundos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vicshi97/pi05_policy_sock-garbage-merged_2.0_lora_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/vicshi97/sock-garbage-merged_2.0
- Variante de 20.000 pasos del mismo autor: https://huggingface.co/vicshi97/pi05_sock-garbage-merged_2.0_20k
- Perfil del autor: https://huggingface.co/vicshi97/datasets
- Visualizador del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vicshi97/sock-garbage-merged_2.0
- Anuncio de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Documentación de OpenPI (DeepWiki): https://deepwiki.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Ficha del dataset en Claru: https://claru.ai/datasets/vicshi97-sock-garbage-merged-2-0
