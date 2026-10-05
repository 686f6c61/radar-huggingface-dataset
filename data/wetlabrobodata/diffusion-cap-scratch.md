# WetLabRoboData/diffusion-cap-scratch

## Resumen

diffusion-cap-scratch es una política robótica de imitación basada en difusión (diffusion policy) publicada por el usuario WetLabRoboData dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: se trata de un controlador visuomotor entrenado para ejecutar una única tarea de manipulación denominada "cap" (colocación de una tapa) sobre un robot UR3e bimanual equipado con tres cámaras. El modelo aprende de demostraciones humanas teleoperadas y produce secuencias de acciones (action chunks) a partir de observaciones visuales y propioceptivas en bucle cerrado.

El checkpoint contiene 264.873.854 parámetros (aproximadamente 265 millones) distribuidos en un repositorio de 1,1 GB en formato safetensors, y se distribuye bajo licencia Apache 2.0. La variante "scratch" indica que se ha entrenado únicamente con los datos de esta tarea, sin inicialización a partir de otros checkpoints ni preentrenamiento sobre tareas previas, lo que la convierte en un caso de estudio útil sobre el coste de datos que exige una política de difusión entrenada desde cero.

Su relevancia actual es doble. Por un lado, documenta de forma transparente y reproducible un flujo completo de LeRobot (dataset, entrenamiento, evaluación con rollouts y vídeos por episodio) en un entorno de laboratorio húmedo, un dominio donde escasean los artefactos públicos. Por otro, hace públicas sus métricas reales sin maquillar: 7 éxitos sobre 20 episodios de evaluación, es decir, una tasa de éxito del 35%, un dato que resulta valioso para calibrar expectativas sobre políticas de difusión entrenadas con presupuestos de datos reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot), política visuomotora de difusión con action chunking |
| Parametros totales | 264.873.854 (aprox. 265 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de ventana de tokens; el horizonte de observación y de acción no se documenta en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (política robótica sin interfaz ni entrenamiento lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea objetivo | cap (colocación de tapa) |
| Robot | UR3e bimanual con 3 cámaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-cap |
| Variante | scratch (entrenada solo con los datos de esta tarea) |
| Episodios de evaluacion | 20 (7 exitos, 35% de tasa de éxito) |
| Tamano del repositorio | 1,1 GB |
| Biblioteca | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La política sigue el paradigma de difusión para control visuomotor popularizado por Diffusion Policy: en lugar de regresar directamente una acción, el modelo aprende a invertir un proceso de difusión que genera una trayectoria de acciones condicionada por la observación. En inferencia, se parte de ruido gaussiano y se aplican varios pasos de denoising hasta obtener un chunk de acciones que se ejecuta en bucle cerrado con reobservación. La entrada combina las tres cámaras del montaje bimanual con el estado propioceptivo del robot; la model card no detalla la red de predicción de ruido, el número de pasos de difusión, ni el horizonte de observación o de acción, por lo que esos hiperparámetros figuran como no disponibles.

El entrenamiento es de imitación pura (behavior cloning) sobre el dataset WetLabRoboData/lerobot-data-cap, del cual no se especifican número de episodios, número de transiciones ni composición. No hay indicios de RLHF, DPO ni de ninguna fase de ajuste por refuerzo, algo que tampoco aplica en este dominio. La model card no documenta aumentos de datos, currículos de entrenamiento ni innovaciones técnicas adicionales; la única decisión de diseño explícita es la variante scratch, sin preentrenamiento en tareas previas.

La trazabilidad es un punto destacable: el modelo se reorganizó el 4 de octubre de 2026 a partir del repositorio WetLabRoboData/lerobot-data-smrithi-cap_20260717, y los artefactos originales de entrenamiento (checkpoints, train_config.json, directorio wandb/) se conservan en la subcarpeta old/ de ese repositorio de origen. Sin embargo, esa configuración de entrenamiento no se ha copiado a la model card pública, de modo que detalles como la tasa de aprendizaje, el tamaño de lote o el número de pasos quedan fuera del alcance de esta ficha.

## Capacidades

- Generación de trayectorias de acción para manipulación bimanual sobre un UR3e, emitidas como chunks de acciones ejecutables en bucle cerrado.
- Percepción visual multi-cámara: consume simultáneamente tres flujos de imagen para estimar la geometría de la escena y el estado de los objetos.
- Ejecución de una tarea concreta de ensamblaje: colocar una tapa ("cap"), presumiblemente sobre un recipiente, en un contexto de laboratorio húmedo.
- Control reactivo con reobservación: al ser una política de difusión, puede corregir desviaciones durante el rollout en lugar de ejecutar una trayectoria a ciegas.
- No soporta tool calling ni function calling: no expone ninguna interfaz de herramientas.
- No soporta razonamiento multi-paso simbólico ni comportamiento de agente: no hay planificación explícita ni memoria episódica más allá del contexto de observación.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan capacidades especiales (modo de pensamiento, visión descriptiva, audio) ni variantes multimodales adicionales.

## Casos de uso

- Automatización de ensamblaje en laboratorio húmedo: la política puede encargarse de la tarea de colocar tapas en recipientes de forma repetitiva, liberando al personal técnico de una operación manual monótona y potencialmente repetitiva a nivel ergonómico.
- Banco de pruebas para investigación en imitation learning: sirve como referencia reproducible para medir cuánto rendimiento se obtiene entrenando una diffusion policy desde cero con un dataset de una sola tarea y un robot concreto.
- Recolección y validación de pipelines de datos robóticos: dado que el dataset y los rollouts de evaluación están publicados, el modelo permite auditar de punta a punta un flujo LeRobot (grabación, entrenamiento, evaluación) sin necesidad de hardware propio para la parte de análisis.
- Punto de partida para fine-tuning en tareas relacionadas: al ser una variante scratch, es un candidato natural para inicializar modelos de la misma familia en tareas de manipulación similares del mismo montaje bimanual.
- Generación de datos sintéticos y análisis de fallos: los vídeos de rollout por episodio permiten estudiar modos de fallo (agarre, alineación, oclusión entre cámaras) y derivar mejoras en la recolección de demostraciones.
- Docencia y divulgación técnica: con 265 M de parámetros y un repositorio de 1,1 GB, es lo bastante pequeño para explicar el funcionamiento de una política de difusión en un curso o taller con recursos limitados.
- Prototipado de control bimanual con visión: útil para equipos que quieran evaluar la coordinación de dos brazos con tres cámaras antes de invertir en un montaje propio.

## Benchmarks y rendimiento

La model card solo publica la evaluación en robot real. No hay resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no aplican a una política robótica.

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 20 |
| Exitos | 7 |
| Tasa de exito | 35% |
| Tarea | cap |
| Robot | UR3e bimanual con 3 camaras |
| Artefactos de evaluacion | WetLabRoboData/eval-diffusion-cap-scratch (videos de rollout y resultado por episodio) |
| Comparacion con otros modelos | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. A partir del recuento real de parámetros (264.873.854), los pesos ocupan aproximadamente 1,06 GB en fp32 y 0,53 GB en fp16; el consumo total depende de las activaciones del proceso de denoising y de los tres flujos de cámara, no documentados.
- GPU recomendadas: no disponible en la model card. Cualquier GPU con memoria suficiente para alojar los pesos más el búfer de activaciones debería ser válida; no se publican latencias ni configuraciones de referencia.
- Encaje en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint. Modelos de 8 GB o más (por ejemplo, RTX 3060, 4060, 4070) deberían acomodar la inferencia, si bien esto es una estimación derivada del número de parámetros y no un dato publicado.
- Opciones de despliegue: LeRobot con PyTorch, mediante `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-cap-scratch")`. No aplican vLLM, llama.cpp, Ollama o TGI, que son servidores para modelos de lenguaje; no se documenta exportación a ONNX, TensorRT ni formatos GGUF.
- Latencia y throughput: no disponibles. Al tratarse de una política de difusión, la latencia depende críticamente del número de pasos de denoising y del horizonte de acción, parámetros que no se especifican.

## Comparativa con modelos similares

No se dispone de datos numéricos comparables publicados junto a este modelo. A continuación se comparan las alternativas cualitativas del mismo ecosistema (LeRobot) y de la misma familia de políticas.

| Modelo | Familia | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WetLabRoboData/diffusion-cap-scratch | Diffusion policy | cap, UR3e bimanual real | 264.873.854 | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Modelos de referencia de LeRobot (por ejemplo, políticas de difusión entrenadas en PushT) | Diffusion policy | Manipulación en simulación (PushT) | no disponible | no aplica | no disponible | Hugging Face |
| Políticas ACT del ecosistema LeRobot | Action Chunking Transformer | Manipulación (varias tareas, sim y real) | no disponible | no aplica | no disponible | Hugging Face |

La comparación cuantitativa de tasa de éxito, latencia o robustez frente a estas alternativas no es posible con la información disponible, ya que corresponden a tareas, robots y protocolos de evaluación distintos.

## Limitaciones y advertencias

- Tasa de éxito limitada: 7 aciertos sobre 20 episodios (35%). No es un modelo apto para producción sin supervisión ni mecanismos de recuperación ante fallos.
- Especialización extrema: está entrenado exclusivamente para la tarea "cap" sobre un UR3e bimanual. Fuera de esa tarea o de ese montaje, el comportamiento no está caracterizado.
- Sesgos de dominio: al depender de tres cámaras y de las condiciones de iluminación, disposición de objetos y fondo del laboratorio original, es esperable una degradación notable ante cambios de escena (distribution shift). No se documenta ningún estudio de robustez.
- Riesgo de sobreajuste: el dataset no declara su tamaño ni su diversidad, y la variante scratch no usa preentrenamiento, lo que incrementa la probabilidad de memorizar configuraciones concretas de las demostraciones.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no debe evaluarse con criterios de modelos de lenguaje. El riesgo de "alucinación" no aplica; el fallo típico es físico (agarre, alineación, colisión).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías; el usuario asume la responsabilidad sobre el despliegue en un robot real.
- Ausencia de validación externa: 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia de reproducción independiente de los resultados.
- Falta de documentación de seguridad: no se especifican límites de fuerza, espacios de trabajo ni protocolos de parada de emergencia, imprescindibles en cualquier integración con hardware físico.
- Configuración de entrenamiento no publicada: hiperparámetros clave (pasos de difusión, horizonte de acción, semilla) residen en el repositorio de origen y no en la model card, lo que complica la reproducibilidad estricta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WetLabRoboData/diffusion-cap-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-cap
- Dataset de evaluación (vídeos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-cap-scratch
- Repositorio de origen con artefactos archivados en la subcarpeta old/: WetLabRoboData/lerobot-data-smrithi-cap_20260717 (referenciado en la model card; no se proporciona URL completa)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente enlaces genéricos a servicios de Google sin relación con el artefacto.
