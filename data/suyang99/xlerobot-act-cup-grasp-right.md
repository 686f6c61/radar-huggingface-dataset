# Suyang99/xlerobot-act-cup-grasp-right

## Resumen

El modelo **ACT — right-arm cup grasp (XLeRobot)** es una política de control robótico entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre la plataforma XLeRobot, un robot móvil de doble brazo de bajo coste. Desarrollado por Suyang99 y publicado en Hugging Face, el modelo resuelve la tarea de recoger una taza y colocarla en otra posición utilizando únicamente el brazo derecho. Está entrenado con 50 episodios (19.453 fotogramas a 30 fps) capturados con tres cámaras (cabeza y dos muñecas), y cuenta con 51,6 millones de parámetros.

La relevancia de este modelo radica en que demuestra el entrenamiento de políticas de manipulación con muy pocos datos (50 episodios) en hardware asequible (Jetson Orin Nano Super), siguiendo el ecosistema LeRobot. Es un ejemplo práctico de aprendizaje por imitación para robótica doméstica, aunque con limitaciones importantes: el brazo izquierdo está aparcado en los datos y la pinza está siendo reemplazada, lo que afecta a la transferencia del comportamiento aprendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.691.153 (51,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision-accion, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en F32) |
| Idiomas soportados | no aplica (modelo de control robotico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot. En este caso, la política recibe imágenes de tres cámaras (cabeza, muñeca izquierda y muñeca derecha) y un vector de estado de 17 dimensiones (6 del brazo izquierdo, 6 del derecho, 2 de la cabeza y 3 de la base móvil). El modelo genera directamente los comandos de acción para el brazo derecho.

El entrenamiento se realizó con el framework LeRobot sobre un dataset propio de 50 episodios, con 5 posiciones diferentes de la taza. Se usó torch 2.8.0 con batch size 2 en una Jetson Orin Nano Super (8 GB de memoria unificada). El checkpoint indicado es el paso 40001211111 de 20.000 (posible error tipográfico en la model card). No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación (behavior cloning) supervisado.

## Capacidades

- Control de brazo robótico para tareas de agarre y colocación de objetos (pick and place) con el brazo derecho.
- Percepción visual multicámara: integra imágenes de cabeza y muñecas para generar acciones.
- Accionamiento de la base móvil (3 grados de libertad) y de la cabeza (2 grados), además de los 6 grados del brazo derecho.
- Ejecución en tiempo real en hardware embebido (Jetson Orin Nano).
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües, al ser un modelo puramente motor.

## Casos de uso

- **Robótica doméstica asistencial**: el modelo puede integrarse en un robot XLeRobot para tareas sencillas de recoger objetos (tazas, vasos) y colocarlos en una posición determinada, útil en entornos de cocina o comedor.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar cómo políticas ACT se comportan con pocas demostraciones (50 episodios) y hardware de bajo coste.
- **Despliegue en plataformas educativas**: al estar basado en LeRobot y con licencia Apache 2.0, puede usarse en laboratorios universitarios para enseñar robótica y control basado en visión.
- **Prototipado rápido de tareas de manipulación**: dado que el entrenamiento es rápido (Jetson Orin Nano), permite iterar sobre nuevas tareas con pocos datos antes de escalar a datasets más grandes.
- **Evaluación de robustez ante cambios de hardware**: el modelo sirve para medir el impacto de sustituir la pinza (de 68 mm a 90 mm) en el comportamiento real, un caso de estudio relevante para transferencia sim-to-real.
- **Benchmark de control bimanual (limitado)**: aunque el brazo izquierdo está aparcado, puede usarse como referencia para comparar con futuras políticas bimanuales (con `arms: 0.0`) y analizar la degradación al ignorar un brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de éxito en la tarea, ni comparaciones con otros modelos. El único dato de rendimiento indirecto es que el entrenamiento se completó en una Jetson Orin Nano Super, lo que sugiere que la inferencia es viable en tiempo real en ese hardware, pero no se especifican latencias ni throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 51,6 M de parámetros en F32 (~206 MB). Con las imágenes de entrada y el overhead del runtime, cabría en cualquier GPU con al menos 2 GB de VRAM, aunque el entrenamiento se realizó en 8 GB unificados.
- **GPU recomendadas**: Jetson Orin Nano Super (8 GB) es el hardware de referencia; también funcionaría en GPUs de escritorio como RTX 3060 o superiores, o incluso en CPU para inferencia no tiempo real.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama media (RTX 3060, RTX 4060) y en placas embebidas como Jetson.
- **Opciones de despliegue**: LeRobot proporciona scripts de entrenamiento e inferencia; también puede exportarse a ONNX o TensorRT para optimización en Jetson. No se menciona soporte para vLLM, llama.cpp u Ollama (no aplica a modelos de robótica).
- **Latencia y throughput**: no disponibles. Dado el tamaño del modelo y el hardware de entrenamiento, se espera una inferencia en tiempo real (30 fps) en Jetson Orin Nano, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Hardware de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Suyang99/xlerobot-act-cup-grasp-right** (este) | 51,6 M | Agarres de taza con brazo derecho | Jetson Orin Nano Super | Apache 2.0 | Hugging Face |
| **ljx03/act_lerobot_grasp_dataset** | 51,7 M | Agarres genéricos (dataset) | no especificado | no especificada | Hugging Face |
| **SmolVLA** (mencionado en docs XLeRobot) | no disponible | Tareas bimanuales y manipulación fina | no disponible | no disponible | GitHub / docs |

No hay datos de rendimiento comparativo publicados. SmolVLA es un modelo VLA (vision-language-action) que se menciona en la documentación de XLeRobot como alternativa para tareas más complejas, pero no se dispone de especificaciones concretas.

## Limitaciones y advertencias

- **Brazo izquierdo no controlado**: las dimensiones 0–5 del estado corresponden al brazo izquierdo y son constantes en todo el dataset. La política no puede mover ese brazo y no transferirá a tareas bimanuales. Para tareas con ambos brazos se necesita un dataset grabado con `arms: 0.0`.
- **Cambio de pinza en curso**: la pinza Fin-Ray se está reemplazando (de 68 mm a 90 mm), lo que altera la dinámica del brazo. El comportamiento real de este checkpoint debe re-medirse tras el cambio.
- **Datos limitados**: solo 50 episodios y 5 posiciones de taza, lo que puede provocar sobreajuste y baja generalización a nuevas posiciones u objetos.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo de texto), pero sí puede producir acciones erróneas si la observación difiere del dominio de entrenamiento.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el hardware XLeRobot es de código abierto; verificar las condiciones de los componentes mecánicos.
- **Sin soporte para manipulación fina ni cargas pesadas**: según la documentación de XLeRobot, no está diseñado para destreza en mano, levantamiento de más de 1 kg por brazo ni movimientos altamente dinámicos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Suyang99/xlerobot-act-cup-grasp-right)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Suyang99/xlerobot-cup-grasp-20260820-0230)
- [Repositorio XLeRobot (GitHub)](https://github.com/Vector-Wangel/XLeRobot)
- [Documentación de XLeRobot](https://xlerobot.readthedocs.io/en/latest/)
- [LeRobot (framework)](https://github.com/huggingface/lerobot)
- [Modelo similar: ljx03/act_lerobot_grasp_dataset](https://huggingface.co/ljx03/act_lerobot_grasp_dataset)
