# szaborego/panda_reach_act_policy_6.1

## Resumen

`szaborego/panda_reach_act_policy_6.1` es un modelo de política robótica entrenado con el método Action Chunking with Transformers (ACT) y la librería LeRobot. Está diseñado para controlar un brazo robótico Franka Panda en la tarea de alcanzar un objetivo ("Reach the target"). El modelo fue desarrollado por el usuario szaborego y publicado en HuggingFace bajo licencia Apache 2.0.

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto que los métodos de predicción paso a paso. Este modelo concreto fue entrenado con 5000 episodios de teleoperación a 20 FPS, lo que supone más de 200.000 fotogramas, y tiene 51,7 millones de parámetros, un tamaño modesto que lo hace viable en hardware de consumo.

La relevancia de este modelo reside en que ejemplifica el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, una de las herramientas open source más utilizadas en robótica de aprendizaje. Al ser un modelo de código abierto con licencia permisiva, puede servir como punto de partida para experimentos de imitación o como referencia de evaluación en entornos de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.665.539 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | No disponible (depende de la configuracion de entrenamiento; el modelo consume observaciones visuales y de estado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de control robotico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación basado en arquitectura transformer. La idea central es que, en lugar de predecir una única acción en cada paso de control, el modelo predice un "chunk" de acciones futuras (una secuencia de acciones de longitud fija). Esto reduce la acumulación de errores y produce movimientos más suaves y consistentes que las políticas autoregresivas paso a paso. El modelo se compone de un encoder que procesa las observaciones (imagen y estado) y un decoder que genera la secuencia de acciones.

En este caso, el modelo consume dos tipos de observaciones: una imagen de 256x256 píxeles (3 canales) y un vector de estado de 6 dimensiones. La salida es un vector de acción de 3 dimensiones (posiblemente posición cartesiana del efector final). El entrenamiento se realizó con el dataset `szaborego/panda_reach_dataset_5000_ppo_wrap`, que contiene 5000 episodios y 204.036 fotogramas a 20 FPS, con la tarea "Reach the target". La configuración de entrenamiento fue: 60.000 pasos, batch size de 8, optimizador AdamW con learning rate 1e-05 y semilla 1000. Se utilizó la versión 0.6.1 de LeRobot. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento puramente de imitación.

## Capacidades

- Control de efector final en tareas de alcance: el modelo es capaz de mover el robot Franka Panda hasta una posición objetivo, generando trayectorias suaves mediante la predicción de chunks de acción.
- Percepción visual: procesa imágenes de 256x256 píxeles para localizar el objetivo y guiar el movimiento.
- Fusión de observaciones multimodales: combina entrada visual con un vector de estado de 6 dimensiones (posición y orientación del efector final).
- Generación de acciones de 3 dimensiones: salida continua para control de posición cartesiana.
- Ejecución en bucle cerrado: puede operar de forma continua sobre el robot real, re-planificando a partir de nuevas observaciones.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de HuggingFace LeRobot (comandos `lerobot-rollout` y `lerobot-train`).

## Casos de uso

- Manipulación básica en investigación: el modelo es adecuado para validar algoritmos de control por imitación en un brazo Franka Panda, sirviendo como línea base para comparar con otros métodos (diffusion policies, etc.).
- Benchmark de aprendizaje por imitación: al estar entrenado con datos de teleoperación, puede utilizarse como referencia para medir la calidad de nuevos datasets o métodos de captura de demostraciones.
- Prototipado rápido de tareas de alcance: en laboratorios de robótica, permite desplegar una tarea de "alcanzar el objetivo" en minutos, sin necesidad de programar controladores clásicos.
- Validación de integración LeRobot: sirve como ejemplo de uso de la librería LeRobot para entrenar y publicar políticas en HuggingFace, útil para desarrolladores que quieren aprender el flujo completo.
- Simulación y entrenamiento de agentes: aunque está entrenado para el robot físico, puede ejecutarse en simuladores (por ejemplo, MuJoCo) para probar variantes de la política o del entorno.
- Extensión a tareas más complejas: al ser un modelo pequeño y de código abierto, puede servir como punto de partida para fine-tuning en tareas relacionadas (empujar, agarrar, etc.) si se dispone de datos de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación en el robot real ("No evaluation results have been provided for this policy yet"). No hay datos de tasas de éxito, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia requiere aproximadamente entre 0,5 y 1 GB de VRAM en FP32 (los pesos en safetensors ocupan unos 0,2 GB). Con cuantización (si estuviera disponible) sería aún menor.
- GPUs compatibles: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores serían más que suficientes. También puede ejecutarse en CPU para pruebas a baja frecuencia.
- Despliegue: la librería LeRobot ofrece el comando `lerobot-rollout` para ejecutar la política en el robot. Se requiere conexión con el robot Franka Panda y cámaras configuradas.
- Latencia: no disponible. En modelos ACT de este tamaño, la latencia de inferencia es del orden de decenas de milisegundos en GPU, pero no se han medido datos concretos en este caso.
- Opciones de despliegue: LeRobot (framework principal), con soporte para PyTorch. No hay cuantizaciones GGUF ni integración con vLLM u Ollama porque no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado datos públicos de otros modelos de política ACT entrenados sobre la misma tarea y dataset que permitan una comparación objetiva de rendimiento. Los modelos comparables (otras políticas de LeRobot como `lerobot/act` o `lerobot/diffusion_policy`) requieren evaluaciones en el mismo entorno para ser comparables, y no se han publicado esos resultados para este modelo.

## Limitaciones y advertencias

- Sin resultados de evaluación: el autor no ha publicado tasas de éxito ni métricas en el robot real, por lo que su rendimiento real es desconocido y no debe asumirse como fiable para producción.
- Tarea específica: el modelo está entrenado únicamente para la tarea "Reach the target" con el robot Franka Panda. No es transferible a otros robots o tareas sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de las demostraciones del dataset `szaborego/panda_reach_dataset_5000_ppo_wrap`, que no está documentado en detalle.
- Sin cuantización: no hay versiones cuantizadas publicadas, lo que limita el despliegue en hardware muy restringido.
- No es un modelo de lenguaje: no soporta entradas de texto ni idiomas; es un modelo de control robótico puro.
- Riesgo de alucinación en acciones: como todo modelo de aprendizaje por imitación, puede generar acciones fuera de la distribución de entrenamiento en situaciones no vistas, lo que en robótica implica riesgo físico si no se supervisa.
- Licencia Apache 2.0: permite uso comercial, pero es responsabilidad del usuario verificar la seguridad del despliegue en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/szaborego/panda_reach_act_policy_6.1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/szaborego/panda_reach_dataset_5000_ppo_wrap
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=szaborego/panda_reach_dataset_5000_ppo_wrap
