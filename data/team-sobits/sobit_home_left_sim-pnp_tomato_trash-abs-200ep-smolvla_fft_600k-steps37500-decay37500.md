# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-smolvla_fft_600k-steps37500-decay37500

## Resumen

SOBIT Home Left es una política de visión-lenguaje-acción (VLA) obtenida por fine-tuning del modelo base `lerobot/smolvla_base`, desarrollada por el equipo `team-sobits`. El modelo está especializado en una única tarea de manipulación móvil: coger una lata de tomate y arrojarla a una papelera. Se trata, por tanto, de una política de imitación entrenada sobre 200 episodios de demostración simulados, no de un modelo de propósito general.

La arquitectura subyacente es SmolVLA, un VLA compacto presentado en el artículo arXiv:2506.01844, diseñado para lograr un rendimiento competitivo en robótica con un coste computacional reducido y desplegable en hardware de consumo. El modelo cuenta con 450.046.176 parámetros y consume observaciones multimodales (estado del robot y dos cámaras) para producir acciones de 20 dimensiones.

Su relevancia es acotada: sirve como referencia práctica de cómo se fine-tunea un VLA base de LeRobot para una tarea concreta con un dataset pequeño y reproducible, y como ejemplo de política entrenada íntegramente en simulación (`_sim` en el nombre del dataset) para un manipulador móvil con cámara de cabeza y cámara en la mano izquierda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea se proporcionan en texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y un cabezal de acciones, orientado a políticas de imitación en robótica. El modelo aquí publicado es un fine-tuning completo (`fft`, full fine-tuning) del checkpoint base `lerobot/smolvla_base`, con 450 millones de parámetros y una interfaz de entrada compuesta por `observation.state` de forma `(20,)`, una imagen de cámara de cabeza `(3, 480, 640)` y una imagen de cámara de mano izquierda `(3, 400, 640)`; la salida es un vector de acción `(20,)`.

El entrenamiento se realizó sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`, compuesto por 200 episodios, 48.141 fotogramas a 10 FPS, con la tarea "Throw the tomato can into the trash bin". La configuración reportada es de 37.500 pasos, batch size 16, optimizador AdamW, learning rate 0,0001 y semilla 1000, con LeRobot 0.6.1. El nombre del checkpoint (`600k-steps37500-decay37500`) sugiere un esquema de decaimiento del learning rate a lo largo de 37.500 pasos, aunque el autor no detalla la composición del dataset, el número de tokens ni si hubo etapas de RLHF o DPO, que en un modelo de acción no resultan de aplicación directa.

## Capacidades

- Generación de acciones de manipulación móvil de 20 dimensiones a partir de observaciones multimodales (estado + dos cámaras).
- Ejecución de una tarea concreta de pick-and-place: coger una lata de tomate y arrojarla a una papelera.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como cadena de texto al ejecutar la política).
- Fusión de información visual de dos puntos de vista (cámara de cabeza y cámara de mano izquierda).
- Política de imitación entrenada de extremo a extremo, sin planificación explícita ni módulos de percepción separados.
- No se documentan capacidades de tool calling, razonamiento multi-paso, diálogo multilingüe ni modos de "thinking"; se trata de un modelo de control robótico, no de un LLM conversacional.

## Casos de uso

- Reproducción de la tarea de referencia: ejecutar la política sobre un manipulador móvil con la misma configuración de cámaras (`head_camera`, `hand_left_camera`) para vaciar una lata de tomate en una papelera, usando `lerobot-rollout` con `--policy.path` apuntando a este repositorio.
- Base para fine-tuning de tareas de recogida de residuos: el checkpoint puede servir de inicialización para nuevas políticas que manipulen otros objetos o contenedores, aprovechando que parte de un modelo preentrenado en lugar de entrenar desde cero.
- Validación de pipelines de LeRobot: útil para comprobar la instalación, la calibración de cámaras y el flujo `lerobot-rollout` / `lerobot-train` antes de abordar tareas más complejas.
- Estudio de sim-to-real: al estar entrenado sobre datos simulados, permite evaluar la brecha de transferencia a un robot físico con la misma morfología y disposición de sensores.
- Referencia metodológica para investigación en VLA: ejemplo reproducible de fine-tuning completo de SmolVLA con un dataset pequeño (200 episodios, 48.141 fotogramas) y una configuración de entrenamiento documentada.
- Docencia y prototipado en robótica de imitación: permite ilustrar el ciclo completo de grabación de datos, entrenamiento y despliegue de una política VLA en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (`No evaluation results have been provided for this policy yet`), por lo que no existe tasa de éxito medida sobre la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros, el peso en precisión completa (fp32) ronda los 1,8 GB y en fp16/bf16 unos 0,9 GB, a lo que hay que sumar el coste de los codificadores visuales y de las dos imágenes de entrada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8-16 GB de VRAM debería ser suficiente para inferencia; SmolVLA se presenta como desplegable en hardware de consumo.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas tipo RTX 3060/4060/4090, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOBIT Home Left (este modelo) | 450.046.176 | no disponible | Manipulación móvil: lata a papelera | Apache 2.0 | Hugging Face (`team-sobits`) |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face (`lerobot`) |
| Otros VLA compactos (p. ej. familias tipo OpenVLA) | no disponible en la información | no disponible | Manipulación general | no disponible en la información | no disponible |

La comparación fiable se limita al modelo base del que deriva; no se dispone de datos de rendimiento ni de especificaciones de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Throw the tomato can into the trash bin") y no generaliza a otras instrucciones sin reentrenamiento.
- Entrenamiento en simulación: el dataset contiene `_sim` en su nombre, por lo que el rendimiento en un robot físico puede degradarse por la brecha sim-to-real (iluminación, fricción, calibración, ruido de sensores).
- Sin evaluación publicada: no hay tasa de éxito medida, ni en simulación ni en real, lo que impide estimar su fiabilidad en producción.
- Dependencia de la configuración de hardware: requiere un manipulador móvil con cámaras de cabeza y mano izquierda, y las claves de observación deben coincidir exactamente con las del entrenamiento (`observation.images.head_camera`, `observation.images.hand_left_camera`).
- Dataset pequeño: 200 episodios y 48.141 fotogramas limitan la diversidad de posiciones, objetos y condiciones cubiertas.
- Riesgo de sobreajuste a la escena simulada concreta; no se documentan sesgos demográficos ni lingüísticos, pero tampoco análisis de robustez.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el texto correspondiente; conviene revisar también las condiciones del modelo base `lerobot/smolvla_base`.
- Solo 16 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-smolvla_fft_600k-steps37500-decay37500
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
