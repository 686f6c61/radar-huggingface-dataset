# Tridex/model_diffusion_3cam_20K_22_09

## Resumen

`Tridex/model_diffusion_3cam_20K_22_09` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que recibe el estado del robot y tres vistas de cámara (frontal, lateral y superior) y genera trayectorias de acción para un brazo `so_follower`. El autor es el usuario Tridex y la licencia es Apache 2.0.

El modelo trata el control motor como un proceso generativo de difusión: en lugar de predecir una única acción, produce secuencias de acciones suaves y multimodales, lo que resulta especialmente útil en tareas de manipulación con contactos ricos. El repositorio ocupa 1,2 GB y contiene 292.717.550 parámetros en formato safetensors. Se entrenó durante 20.000 pasos sobre un dataset propio de 21 episodios y 22.397 fotogramas a 30 FPS para una única tarea: «take the gaz cylinder and drop it».

Su relevancia es acotada: es una política especializada de un solo autor, sin resultados de evaluación publicados, 0 descargas y 0 «likes» en el momento de redactar esta ficha. Sirve como ejemplo reproducible de un entrenamiento de Diffusion Policy con LeRobot, pero no como modelo generalista: hereda la política de imitación que se le ha enseñado y no soporta instrucciones nuevas fuera de su distribución de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor); backbone concreto no detallado en la model card |
| Parametros totales | 292.717.550 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; usa horizonte de predicción de acciones, no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `front`, `side`, `top` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entrada visual | 3 imágenes de `(3, 480, 640)` |
| Salida | `action`, forma `(6,)` |
| Tamaño del repositorio | 1,2 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card identifica el método como Diffusion Policy (arXiv 2303.04137), que formula el control visuomotor como un proceso de difusión generativo: el modelo aprende a invertir un proceso de ruido para producir trayectorias de acción suaves y multimodales, en lugar de regresar una acción única. La model card no detalla el backbone concreto (por ejemplo, el tipo de red de extracción visual o el número de pasos de difusión), por lo que ese nivel de detalle se considera no disponible.

El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, con batch size 8, optimizador Adam, tasa de aprendizaje 0.0001 y semilla 1000. El dataset asociado es `Tridex/_20260922_140724`, con 21 episodios, 22.397 fotogramas, 30 FPS y una única tarea: «take the gaz cylinder and drop it». No se indica en la información disponible si se aplicaron etapas de RLHF, DPO ni ningún otro ajuste posterior; en políticas de imitación como esta lo habitual es el aprendizaje por imitación supervisado a partir de demostraciones, aunque el dato no se confirma explícitamente.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para un brazo `so_follower` a partir de estado propioceptivo y tres cámaras.
- Control visuomotor para manipulación, con énfasis declarado en tareas de contacto rico, según la descripción del método Diffusion Policy.
- Fusión de tres vistas simultáneas (frontal, lateral y superior) a resolución 480x640.
- Producción de acciones suaves y multimodales gracias al enfoque generativo por difusión.
- Ejecución de una tarea concreta aprendida por imitación: «take the gaz cylinder and drop it».
- Integración con el ecosistema LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Recogida y depósito de objetos cilíndricos: es el caso directo para el que se entrenó (coger un cilindro de gas y soltarlo), replicable en entornos de laboratorio con un `so_follower`.
- Investigación en imitación y difusión: sirve como referencia reproducible para estudiar cómo se comporta Diffusion Policy con tres cámaras y un dataset pequeño (21 episodios).
- Punto de partida para reentrenamiento: con `lerobot-train` y un dataset propio se puede reajustar la política a una tarea nueva sin partir de cero.
- Pruebas de hardware y calibración: útil para validar la cadena completa de percepción y control (cámaras, puerto del robot, frecuencia de 30 FPS) antes de invertir en un entrenamiento mayor.
- Docencia y demostraciones: ejemplo didáctico de un pipeline de LeRobot desde la grabación de datos hasta el despliegue en robot real.
- Automatización de pick-and-place en líneas de laboratorio: si se reentrena con objetos y posiciones de la celda de trabajo, puede cubrir tareas de recogida y depósito repetitivas.
- Benchmark interno de políticas: comparar esta política de difusión frente a otras alternativas de LeRobot (por ejemplo ACT) en la misma tarea y el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación explícitamente vacía: «No evaluation results have been provided for this policy yet». No hay tasas de éxito, número de ensayos ni condiciones de evaluación.

| Metrica | Resultado |
|---|---|
| Tasa de exito en tarea real | no disponible |
| Numero de ensayos | no disponible |
| MMLU / HumanEval / GSM8K | no aplica (modelo de robotica) |

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del recuento de parámetros, no confirmada por el autor): en fp32 los pesos ocupan aproximadamente 1,2 GB; en fp16, unos 0,6 GB. Hay que sumar las activaciones de los codificadores visuales de tres cámaras a 480x640 y el coste del proceso de difusión.
- En la práctica, una GPU de consumo con 8 GB o más (por ejemplo, RTX 3060, 4060, 4070, 4090) debería ser suficiente para inferencia de una política de este tamaño, aunque no hay cifras oficiales publicadas.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia; pueden ser útiles para reentrenar con datasets mayores o batch sizes grandes.
- Opciones de despliegue: el flujo oficial es LeRobot, mediante `lerobot-rollout` con `--policy.path=Tridex/model_diffusion_3cam_20K_22_09`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato de frecuencia relacionado es que el dataset de entrenamiento se grabó a 30 FPS y que los ejemplos de despliegue usan cámaras a 30 FPS.
- Requisitos adicionales del entorno: robot `so_follower` real, tres cámaras configuradas con los nombres `front`, `side` y `top`, y un puerto de robot correctamente especificado.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparación cuantitativa. Se ofrece una comparación cualitativa con otras familias de políticas disponibles en LeRobot; los valores concretos no están disponibles en la información proporcionada.

| Modelo / metodo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/model_diffusion_3cam_20K_22_09 | Diffusion Policy | 292.717.550 | no disponible | Apache 2.0 | Hugging Face |
| ACT (Action Chunking Transformer) | Transformer de imitacion | no disponible | no disponible | no disponible | disponible en LeRobot |
| VQ-BeT | Discretizacion de acciones + transformer | no disponible | no disponible | no disponible | disponible en LeRobot |
| Diffusion Policy (implementacion de referencia) | Difusion para control | no disponible | no disponible | no disponible | codigo abierto en LeRobot / paper |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una sola tarea, «take the gaz cylinder and drop it». Fuera de esa tarea y de esa distribución de objetos y posiciones, su comportamiento no está garantizado.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba, por lo que no se puede afirmar fiabilidad ni robustez en producción.
- Dataset muy pequeño: 21 episodios y 22.397 fotogramas. Es probable que aparezcan problemas de generalización ante cambios de iluminación, posiciones nuevas del objeto o distractores, aunque el autor no documenta pruebas al respecto.
- Dependencia del montaje: requiere el robot `so_follower` y las tres cámaras `front`, `side` y `top` con las características de calibración del entrenamiento original. Cambiar la disposición de cámaras invalida la política.
- Riesgo de alucinación en el sentido generativo: al ser un modelo de difusión, puede producir trayectorias plausibles pero incorrectas ante entradas fuera de distribución. No hay mecanismo de verificación ni de rechazo.
- Sesgos: no evaluados ni documentados; los sesgos provendrían de las demostraciones humanas del dataset.
- Idioma: no aplica, el modelo no procesa lenguaje natural, por lo que no admite instrucciones textuales nuevas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de copyright y citar LeRobot y el método original según indica la model card.
- Popularidad mínima: 0 descargas y 0 «likes» en el momento de la consulta; no hay comunidad ni soporte.
- Requiere validación en banco antes de cualquier uso real: se recomienda ejecutar la política varias veces por tarea y contabilizar éxitos antes de desplegarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_diffusion_3cam_20K_22_09
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/_20260922_140724
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/_20260922_140724
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv 2303.04137)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

Nota: las búsquedas web realizadas no han devuelto resultados relacionados con este modelo ni con Diffusion Policy; los enlaces anteriores proceden de la model card y de los datos de Hugging Face.
