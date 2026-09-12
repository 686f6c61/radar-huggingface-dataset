# ujheo/my_policy

## Resumen

ujheo/my_policy es una política de aprendizaje por imitación para control robótico, entrenada y publicada por el usuario ujheo mediante el framework LeRobot de Hugging Face. No se trata de un modelo de lenguaje: es un modelo de acción (policy) que consume observaciones del robot y de dos cámaras para producir comandos de movimiento de 6 dimensiones. La arquitectura subyacente es ACT (Action Chunking with Transformers), descrita en el artículo arXiv:2304.13705, un método que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso.

El modelo cuenta con 51.668.614 parámetros y ocupa 0,2 GB en el repositorio, lo que lo sitúa en la categoría de modelos ligeros ejecutables en hardware de gama media e incluso en CPU. Ha sido entrenado sobre el conjunto de datos ujheo/clean_desk, compuesto por solo 5 episodios y 6.902 fotogramas a 30 FPS, con la tarea "Move three balls on desk into yellow tray" sobre un brazo robótico de tipo `so_follower` con dos cámaras (front y top).

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue). Por otro, ilustra el régimen de datos ultra-reducido que ACT puede manejar, aunque su escasa cobertura de entrenamiento limita seriamente la generalización fuera del entorno exacto de grabación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder VAE condicional (CVAE) y extracción visual por CNN |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica (política de control robótico, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible; no aplica (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower (brazo seguidor SO-100) |
| Camaras | front, top |
| Dimension de observacion de estado | (6,) |
| Dimension de accion | (6,) |
| Resolucion de imagen de entrada | (3, 480, 640) por camara |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de imitación que combina un encoder VAE condicional (CVAE) con un transformer encoder-decoder. La innovación central es el *action chunking*: en lugar de predecir una única acción por paso, el modelo genera un bloque de k acciones futuras a partir de la observación actual, lo que estabiliza el control y mitiga el error compuesto. Durante la inferencia se suele aplicar *temporal ensembling*, promediando las predicciones solapadas de varios chunks. Las dos cámaras (front y top) se procesan con extractores visuales convolucionales, y el estado del robot (6 dimensiones) se proyecta al mismo espacio latente antes de entrar en el transformer.

Según la model card, el entrenamiento se realizó durante 100.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5, con semilla 1000, sobre LeRobot 0.6.2. El conjunto de datos consta de únicamente 5 episodios y 6.902 fotogramas a 30 FPS, lo que equivale a unos 230 segundos de demostraciones teleoperadas. No se documenta el uso de RLHF, DPO ni ningún ajuste posterior; se trata de aprendizaje supervisado puro a partir de demostraciones. La model card no detalla la composición exacta del dataset más allá del número de episodios y la tarea única.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 grados de libertad (acción de dimensión 6) para un brazo `so_follower`.
- Percepción visual multimodal: consume simultáneamente dos flujos de imagen (front y top) a 480x640 píxeles, además del estado propioceptivo del robot.
- Ejecución de una tarea específica de pick-and-place: recoger tres bolas de una mesa y depositarlas en una bandeja amarilla.
- Predicción de chunks de acción con ensamblado temporal, lo que aporta suavidad al movimiento.
- Integración nativa con el ecosistema LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- No soporta tool calling ni function calling (no es un modelo basado en texto).
- No soporta razonamiento multi-paso ni uso como agente cognitivo.
- No dispone de capacidades multilingües, de visión general, de audio ni de modo "thinking".

## Casos de uso

- Despliegue de referencia sobre un brazo SO-100: el modelo puede ejecutarse directamente con `lerobot-rollout` sobre un `so_follower` para reproducir la tarea de recogida de bolas, sirviendo como validación end-to-end del hardware y del pipeline de LeRobot.
- Punto de partida para ajuste fino: dado su reducido coste de entrenamiento (51,7 M de parámetros), es un candidato práctico para reentrenar sobre tareas de manipulación similares en el mismo tipo de brazo y con la misma configuración de cámaras.
- Docencia y formación en aprendizaje por imitación: permite mostrar en un laboratorio el ciclo completo de teleoperación, grabación de dataset, entrenamiento y despliegue en un robot real con un presupuesto de cómputo mínimo.
- Baseline en investigación sobre políticas robóticas: útil como referencia ACT frente a métodos alternativos (Diffusion Policy, SmolVLA) en tareas de pick-and-place con pocos datos.
- Automatización de clasificación de objetos en entornos controlados: con la tarea adaptada, el modelo puede trasladar objetos pequeños de una zona a un contenedor, siempre que las condiciones de iluminación y posiciones se mantengan estables.
- Prototipado rápido de nuevas celdas de trabajo: al requerir menos de 1 GB de memoria, puede desplegarse en estaciones con GPU de gama de entrada o incluso en CPU, agilizando pruebas iterativas sin acceso a clústeres.
- Generación de trayectorias para simulación: las acciones predichas pueden registrarse y reproducirse en un simulador para comparar la política real frente a la simulada antes de tocar hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet". No existen tasas de éxito, número de ensayos ni comparaciones cuantitativas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 51,7 M de parámetros en float32, los pesos ocupan aproximadamente 207 MB, a los que se suman las activaciones de las dos cámaras a 480x640.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. Las GPU de centro de datos (A100, H100) no aportan ventaja relevante para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`) sobre PyTorch es la vía oficial. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Ventana de observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ujheo/my_policy (este) | ACT | 51,7 M | Estado (6,) + 2 imagenes 480x640 | apache-2.0 | Hugging Face, LeRobot |
| Diffusion Policy | Policy generativa por difusion | no disponible | Configurable (imagenes y estado) | no disponible | Implementada en LeRobot |
| SmolVLA | Vision-language-action | aprox. 450 M | Multimodal (imagenes y texto) | no disponible | Hugging Face, LeRobot |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible, ya que este modelo no publica métricas de éxito. Como referencia metodológica, ACT tiende a requerir menos datos y cómputo que Diffusion Policy, mientras que SmolVLA añade comprensión de instrucciones en lenguaje natural a cambio de un mayor tamaño.

## Limitaciones y advertencias

- Entrenamiento extremadamente reducido: 5 episodios y 6.902 fotogramas. La generalización a posiciones, iluminación u objetos distintos de los del dataset es muy improbable.
- Tarea única y cerrada: el modelo solo se ha entrenado para "Move three balls on desk into yellow tray"; no acepta instrucciones nuevas en lenguaje natural.
- Sin evaluación publicada: no existe ninguna medida de tasa de éxito en robot real, por lo que el rendimiento real es desconocido.
- Ausencia de métricas de sesgo: al ser un modelo de control robótico no aplican sesgos lingüísticos, pero sí sesgos de entorno (posiciones, colores, fondo) heredados del dataset.
- Riesgo de fallo silencioso: al no haber verificación de éxito, la política puede ejecutar movimientos incorrectos sin señal de error.
- Dependencia de la configuración de cámaras: los nombres y posiciones de cámara (front, top) deben coincidir exactamente con los del entrenamiento; cualquier cambio invalida las observaciones.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación, pero el usuario debe cumplir las condiciones de atribución del método ACT y de LeRobot.
- Escaso soporte de la comunidad: 0 descargas y 0 "likes" en el momento de redactar esta ficha, lo que implica ausencia de validación externa.
- Fecha de creación inusual (2026-09-12 según los metadatos), que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ujheo/my_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/ujheo/clean_desk
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ujheo/clean_desk
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
