# TomasAnderegg/pill_sorting_colour_cf_mix_ft_v1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face y presentado en el paper arXiv:2506.01844. Está diseñado para control robótico mediante imitación: consume observaciones visuales y el estado de las articulaciones del robot, y produce directamente acciones motoras. Esta ficha concreta, `pill_sorting_colour_cf_mix_ft_v1`, es un fine-tune de un modelo base ya ajustado (`pill_sorting_full_ft_a100_v3_dagger60`), entrenado por el usuario TomasAnderegg para una tarea específica de clasificación de píldoras por color y forma.

El modelo resuelve un problema acotado de manipulación robótica: dado un comando en lenguaje natural del tipo "Put the blue pill in the square compartment", el modelo genera una secuencia de acciones de 6 dimensiones para un robot tipo `so_follower` (SO-100/SO-101 de LeRobot) equipado con una cámara frontal. La entrada combina una imagen RGB de 480x640 con un vector de estado de 6 dimensiones, y la salida es un vector de acción también de 6 dimensiones.

Con 450 millones de parámetros, el modelo es lo bastante pequeño para desplegarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que quieren experimentar con políticas VLA sin infraestructura de datacenter. El repositorio ocupa 10 GB, principalmente por los checkpoints y artefactos de entrenamiento, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), basada en transformer con codificador visual y decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual con un modelo de lenguaje pequeño y una cabeza de predicción de acciones. El modelo consume dos modalidades de observación: `observation.images.front`, una imagen RGB de forma `(3, 480, 640)`, y `observation.state`, un vector de 6 dimensiones con el estado del robot. La salida es `action`, un vector de 6 dimensiones que se ejecuta a 30 FPS. El diseño prioriza la eficiencia computacional para permitir despliegue en hardware de consumo, según la model card.

Este fine-tune parte del modelo `pill_sorting_full_ft_a100_v3_dagger60`, que a su vez incorpora datos de DAgger (60 iteraciones según el nombre). El entrenamiento se realizó con LeRobot 0.6.2 durante 4000 pasos, con batch size 64, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset de entrenamiento, `pill_sorting_colour_cf_mix_v1`, contiene 68 episodios y 34.328 frames a 30 FPS, con 16 variantes de tarea que combinan cuatro colores de píldora (azul, rojo, amarillo, verde) y cuatro formas de compartimento (cuadrado, círculo, triángulo, cruz). No se documentan detalles sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO, que no aplican a un modelo de política robótica de este tipo.

## Capacidades

- Generación de acciones motoras de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural para tareas de pick-and-place con 16 combinaciones de color y forma.
- Control visomotor en tiempo real a 30 FPS, adecuado para bucles de control de robot.
- Generalización limitada al dominio de clasificación de píldoras: no es un modelo de propósito general.
- No soporta tool calling ni function calling: es una política de imitación, no un LLM conversacional.
- No soporta razonamiento multi-paso explícito ni modo thinking.
- Sin capacidades de audio ni de visión general más allá del codificador visual para control.
- Capacidades multilingües no documentadas; las instrucciones de entrenamiento están en inglés.

## Casos de uso

- Clasificación automatizada de píldoras en laboratorio: el modelo ejecuta las 16 combinaciones de "color de píldora → forma de compartimento" entrenadas, útil para prototipos de dosificación o separación farmacéutica.
- Investigación en imitación robótica: sirve como punto de partida para estudiar fine-tuning de políticas VLA sobre un modelo base ya ajustado con DAgger.
- Benchmark de referencia para tareas pick-and-place: al tener un dataset público de 68 episodios y 34.328 frames, permite reproducir experimentos y comparar variantes de entrenamiento.
- Prototipado rápido con LeRobot: el comando `lerobot-rollout` permite desplegar la política en un SO-100/SO-101 en minutos, lo que facilita validar hardware y calibración de cámaras.
- Educación y demos de robótica: el bajo número de parámetros (450 M) y la licencia Apache 2.0 permiten usarlo en cursos y talleres sin restricciones comerciales.
- Generación de datos sintéticos o aumentados: la política puede ejecutarse para producir trayectorias que luego se filtren y reutilicen en nuevos entrenamientos.
- Integración en pipelines de evaluación de políticas: sirve como baseline de éxito en tareas de sorting para comparar con políticas más grandes o con enfoques de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results", por lo que no hay tasas de éxito en robot real ni métricas cuantitativas que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros en precisión completa (fp32) se requieren aproximadamente 1,8 GB solo para pesos; en fp16/bf16, unos 0,9 GB. El codificador visual y los buffers de imagen de 480x640 añaden overhead, por lo que se recomienda al menos 4-6 GB de VRAM para operar con comodidad.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo está pensado para hardware de consumo según la model card.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores. También es viable en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, ya que no es un LLM de texto.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la configuración del dataset y las cámaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pill_sorting_colour_cf_mix_ft_v1` (este) | 450 M | no disponible | Clasificación de píldoras por color/forma | Apache 2.0 | Hugging Face, 31 descargas |
| `pill_sorting_full_ft_a100_v3_dagger60` (base) | no disponible | no disponible | Clasificación de píldoras, entrenado con DAgger | no disponible | Hugging Face |
| SmolVLA (modelo original de Hugging Face) | no disponible | no disponible | VLA general para control robótico | no disponible | Hugging Face / paper arXiv:2506.01844 |
| Políticas VLA de mayor tamaño (p. ej. OpenVLA) | no disponible en esta búsqueda | no disponible | Control robótico general | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con la información disponible: no hay métricas de éxito publicadas para este fine-tune ni para el modelo base en la información proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo maneja 16 combinaciones de color y forma de píldora; fuera de ese conjunto de instrucciones no hay garantía de comportamiento correcto.
- Sin resultados de evaluación publicados: no se puede afirmar una tasa de éxito en robot real; la sección de evaluación de la model card está vacía.
- Dependencia de calibración de hardware: requiere un robot `so_follower` con cámara frontal a 480x640 y 30 FPS; cambios de cámara, iluminación o posición alteran el rendimiento.
- Riesgo de alucinación de acciones: como política de imitación, puede generar trayectorias plausibles pero incorrectas ante distribuciones de entrada no vistas durante el entrenamiento.
- Sesgos de dataset: 68 episodios y 34.328 frames son un volumen reducido; el modelo puede sobreajustar a condiciones específicas de laboratorio.
- Idiomas: las instrucciones de tarea están en inglés; no hay evidencia de soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene revisar antes de producción.
- No es un LLM: no debe usarse para generación de texto, código, matemáticas ni conversación; su única salida es un vector de acción de 6 dimensiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_colour_cf_mix_ft_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_colour_cf_mix_v1
- Dataset relacionado: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_colour_mix_v1
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_colour_cf_mix_v1
