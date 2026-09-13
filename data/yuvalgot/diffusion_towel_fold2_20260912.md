# yuvalgot/diffusion_towel_fold2_20260912

## Resumen

El modelo `yuvalgot/diffusion_towel_fold2_20260912` es una política visomotora de robótica basada en Diffusion Policy (Chi et al., arXiv:2303.04137), entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: su entrada es un vector de estado propioceptivo de 6 dimensiones más una imagen RGB de 240x320 píxeles procedente de una cámara montada en la mano del robot, y su salida es un vector de acción de 6 dimensiones. Está desarrollado por el usuario `yuvalgot` y publicado con licencia Apache 2.0.

El modelo resuelve una única tarea de manipulación rica en contacto: plegar una toalla. Se entrenó mediante aprendizaje por imitación sobre un conjunto de 50 episodios teleoperados (47.790 fotogramas a 30 FPS, aproximadamente 26,5 minutos de demostraciones) grabados con un robot de tipo `so_follower` (familia SO-100/SO-101). Diffusion Policy trata el control visomotor como un proceso generativo de difusión, lo que produce trayectorias de acción multimodales y suaves, adecuadas para tareas de contacto como el plegado de tejidos donde los enfoques de regresión directa tienden a promediar modos de acción y fallar.

Su relevancia es acotada pero clara: es un ejemplo reproducible y ligero (263 millones de parámetros, 1,1 GB de repositorio) de entrenamiento de una política de difusión con LeRobot 0.6.2 sobre hardware de bajo coste, útil como plantilla para experimentos de aprendizaje por imitación y como punto de partida para ajuste fino en tareas de manipulación textil. La model card no reporta ninguna evaluación en robot real y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visomotora de difusión (Diffusion Policy, arXiv:2303.04137); el backbone concreto del denoisador no se especifica en la model card |
| Parametros totales | 262.962.502 (dato real de los pesos en safetensors) |
| Longitud de contexto | No aplica en el sentido de LLM; la política consume una ventana de observaciones (tamaño de ventana no disponible) y predice un horizonte de acciones (no disponible) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors sin cuantizaciones declaradas |
| Idiomas soportados | No disponible; no es un modelo de lenguaje, no procesa texto |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.hand` | VISUAL | `(3, 240, 320)` |
| `action` | ACTION | `(6,)` |

| Parametro de entrenamiento | Valor |
|---|---|
| Pasos de entrenamiento | 100.000 |
| Tamano de lote | 8 |
| Optimizador | Adam |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Tipo de robot | `so_follower` |
| Camaras | `hand` |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visomotor como un proceso generativo: en lugar de predecir una única acción mediante regresión, el modelo aprende a desruidar una secuencia de acciones condicionada por las observaciones, lo que permite representar distribuciones multimodales de comportamiento y generar trayectorias suaves de varios pasos. Esto es especialmente relevante en manipulación rica en contacto, como el plegado de una toalla, donde pequeñas variaciones de posicionamiento requieren estrategias de acción distintas. La model card no detalla el backbone del denoisador, el número de pasos de difusión, el horizonte de predicción ni el número de pasos de observación empleados; estos hiperparámetros quedan determinados por la configuración de `--policy.type=diffusion` de LeRobot 0.6.2 y no se documentan en el repositorio.

El entrenamiento se realizó por imitación supervisada sobre el conjunto `yuvalgot/towel_fold2_sep_20260905_121503_clean`: 50 episodios teleoperados, 47.790 fotogramas a 30 FPS (unos 26,5 minutos de datos) y una única instrucción de tarea, "fold the towel". Se ejecutaron 100.000 pasos con lotes de 8 (800.000 muestras vistas), optimizador Adam y tasa de aprendizaje 1e-4, con semilla 1000. No se documenta uso de RLHF, DPO ni ningún otro refinamiento posterior al ajuste por imitación, ni se menciona aumento de datos, mezcla de datasets o regularización específica.

## Capacidades

- Generación de trayectorias de acción continuas de 6 grados de libertad para un brazo `so_follower`, condicionadas por imagen y estado propioceptivo.
- Ejecución de una tarea concreta de manipulación rica en contacto: plegar una toalla.
- Control reactivo a partir de una única cámara en la muñeca (`observation.images.hand`), sin necesidad de visión externa de la escena.
- Generación multimodal de acciones propia del muestreo por difusión, que evita el promediado de estrategias y produce movimientos suaves.
- Integración con el ecosistema LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Ajuste fino con datasets propios mediante el flujo estándar de LeRobot.
- No dispone de tool calling, function calling, razonamiento multi-paso en el sentido de un agente basado en lenguaje, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Plegado de toallas en lavandería industrial o de hotel: el modelo se ejecuta en bucle cerrado a 30 FPS sobre un brazo `so_follower` con la cámara `hand`, repitiendo la tarea aprendida para automatizar una operación repetitiva de manipulación textil.
- Investigación en aprendizaje por imitación: sirve como política de referencia reproducible para comparar Diffusion Policy frente a otros métodos de la familia LeRobot (ACT, SmolVLA, pi0) bajo el mismo dataset y la misma configuración de entrenamiento.
- Ajuste fino con datos propios: un equipo puede grabar sus propios episodios de plegado con otro robot del mismo tipo y reentrenar con `lerobot-train --policy.type=diffusion`, partiendo de este checkpoint como inicialización.
- Banco de pruebas de recogida de datos: sirve para validar el pipeline completo de teleoperación, calibración de cámara y formato de dataset antes de escalar a tareas más complejas.
- Docencia y formación en robótica: con 263 millones de parámetros y 1,1 GB de repositorio, es un ejemplo manejable para explicar difusión aplicada al control y el flujo de trabajo de LeRobot en un laboratorio universitario.
- Automatización de tareas auxiliares en hostelería: manipulación de ropa de cama y toallas en entornos controlados donde el coste de un brazo SO-100 es aceptable frente a una solución industrial.
- Evaluación de robustez ante variaciones de iluminación, posición del objeto o distracciones: el modelo permite medir la degradación de la política al cambiar las condiciones de la escena respecto al dataset original.
- Base para investigación en políticas multimodales: al ser una política de difusión pura, resulta útil como punto de comparación frente a políticas condicionadas por lenguaje en tareas de un solo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", es decir, no hay tasa de éxito, número de ensayos ni condiciones de prueba en robot real.

La búsqueda web realizada no devolvió resultados relacionados con este modelo ni con Diffusion Policy; los resultados obtenidos corresponden a noticias sin relación con el tema.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 solo para los pesos (262,96 millones de parámetros), alrededor de 0,55 GB en fp16. Sumando activaciones del codificador visual y del proceso de difusión, una estimación prudente es de 2 a 4 GB de VRAM en fp32 y de 1 a 2 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Para entrenamiento, una RTX 3060 de 12 GB o superior es suficiente; para entrenamiento más rápido, RTX 4090, A100 o H100. Para inferencia en borde, una Jetson Orin es una opción habitual en robótica.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU dedicadas modernas (RTX 3060, 4060, 4070, 4090), e incluso en equipos con 6-8 GB de VRAM.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` sobre PyTorch. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La única restricción documentada es que la captura de datos se realizó a 30 FPS, y el bucle de control debe sostener esa frecuencia para reproducir el comportamiento aprendido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la informacion proporcionada, por lo que la comparación se limita a aspectos cualitativos de la familia de políticas del ecosistema LeRobot.

| Modelo | Tipo de politica | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_towel_fold2_20260912 | Difusión visomotora, tarea única | 262.962.502 | No aplica (ventana de observaciones) | Apache 2.0 | Hugging Face, 0 descargas |
| ACT (Action Chunking Transformer) | Transformer de predicción de tramos de acción | No disponible | No aplica | No disponible | Integrado en LeRobot |
| SmolVLA | VLA ligero condicionado por lenguaje | No disponible | No disponible | No disponible | Integrado en LeRobot |
| pi0 | VLA de flujo condicionado por lenguaje | No disponible | No disponible | No disponible | Integrado en LeRobot |

Criterios diferenciales: frente a ACT, la difusión es más robusta en tareas multimodales y ricas en contacto, a costa de un muestreo iterativo más lento. Frente a políticas condicionadas por lenguaje (SmolVLA, pi0), este modelo no acepta instrucciones textuales y solo ejecuta la tarea para la que fue entrenado, pero es considerablemente más pequeño y barato de ejecutar.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación en robot real: se desconoce la tasa de éxito de la tarea de plegado.
- Especialización extrema: el modelo solo ha visto la instrucción "fold the towel" sobre un robot `so_follower` con una cámara `hand`; no generaliza a otras tareas, otros robots ni otras configuraciones de cámara.
- Dependencia de la configuración de sensores: la política espera exactamente `observation.state` de 6 dimensiones y una imagen de 240x320 en la clave `observation.images.hand`. Cualquier cambio en los nombres de cámara, la resolución o la calibración invalida la política.
- Riesgo de sobreajuste al entorno de recogida de datos: con solo 50 episodios y una única tarea, es probable que la política degrade su rendimiento ante cambios de iluminación, fondo, posición inicial de la toalla o tipo de tejido.
- Sesgos de los datos de demostración: las trayectorias reflejan el estilo de teleoperación del operador, incluyendo posibles hábitos, velocidades y rutas de aproximación particulares.
- Alucinación en sentido generativo: al muestrear trayectorias de acción, el modelo puede producir movimientos fuera de la distribución de entrenamiento si el estado observado es anómalo; se recomienda limitación de velocidad y parada de seguridad en el controlador.
- Sin límites de contexto ni capacidades multilingües: no procesa lenguaje natural, no admite tool calling y no puede usarse como agente conversacional.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre manteniendo el aviso de licencia y el archivo de cambios; no hay restricciones de uso comercial conocidas.
- Ausencia de soporte de la comunidad: cero descargas y cero valoraciones, por lo que no hay evidencia externa de reproducibilidad del entrenamiento ni de funcionamiento en hardware distinto del del autor.
- Fechas del repositorio: creado y actualizado el 12 de septiembre de 2026, sin historial posterior de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuvalgot/diffusion_towel_fold2_20260912
- Dataset de entrenamiento: https://huggingface.co/datasets/yuvalgot/towel_fold2_sep_20260905_121503_clean
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yuvalgot/towel_fold2_sep_20260905_121503_clean
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y despliegue: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (BibTeX en la model card): Cadene, R. et al. (2024), "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch"
