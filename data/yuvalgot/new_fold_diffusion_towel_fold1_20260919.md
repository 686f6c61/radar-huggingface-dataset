# yuvalgot/new_fold_diffusion_towel_fold1_20260919

## Resumen

`yuvalgot/new_fold_diffusion_towel_fold1_20260919` es una política de control visuomotor entrenada con el método Diffusion Policy (Chi et al., 2023) y publicada en HuggingFace Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un modelo de robótica que recibe el estado del robot y una imagen de cámara, y produce una secuencia de acciones de 6 grados de libertad para ejecutar la tarea "fold the towel" (doblar una toalla). El autor es el usuario `yuvalgot` y el modelo está asociado a un dataset propio de demostraciones teleoperadas.

El modelo tiene 262.962.502 parámetros y un repositorio de 1,1 GB en formato safetensors. Se entrenó sobre 43 episodios y 25.706 fotogramas a 30 FPS, con 100.000 pasos de entrenamiento, batch size 8, optimizador Adam y una tasa de aprendizaje de 0,0001, usando LeRobot 0.6.2. La política está diseñada para el robot `so_follower` (familia SO-100/SO-101) con una única cámara llamada `hand` a resolución 240x320.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de un pipeline completo de imitation learning con Diffusion Policy en LeRobot, para una única tarea de manipulación con contacto rico. No se han publicado resultados de evaluación en el repositorio ni métricas de tasa de éxito, y el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión condicionado para control visuomotor); configuración interna exacta no documentada en la model card |
| Parametros totales | 262.962.502 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el modelo consume un estado de 6 dimensiones y una imagen de 3x240x320, y produce una acción de 6 dimensiones (horizontes de observación y de acción no documentados) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | No aplica / no disponible; la única cadena de texto asociada es la instrucción de tarea "fold the towel" en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Camaras | `hand` |
| Entradas | `observation.state` (6,), `observation.images.hand` (3, 240, 320) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 1,1 GB |
| Pipeline | robotics (control) |

## Arquitectura y entrenamiento

El modelo sigue el enfoque Diffusion Policy descrito en el artículo referenciado (arXiv:2303.04137). Este método plantea el control visuomotor como un proceso generativo de difusión: en lugar de predecir una acción única de forma directa, el modelo aprende a invertir un proceso de ruido para generar trayectorias de acción multimodales y suaves, lo que resulta especialmente adecuado para tareas de manipulación con contacto rico como doblar una toalla. La implementación concreta de este checkpoint procede de LeRobot, por lo que el entrenamiento se realizó con el tipo de política `diffusion` de dicha librería. La model card no detalla la composición exacta de la red (codificador visual, red de denoising, número de pasos de difusión ni horizontes temporales), por lo que esos datos figuran como no disponibles.

Los datos de entrenamiento provienen del dataset `yuvalgot/new_fold_towel_1_og_dataset_20260919_175141_clean`: 43 episodios teleoperados, 25.706 fotogramas a 30 FPS y una única tarea, "fold the towel". La configuración de entrenamiento documentada es de 100.000 pasos con batch size 8, optimizador Adam, learning rate 0,0001 y semilla 1000 sobre LeRobot 0.6.2. No se menciona el uso de RLHF, DPO ni ningún ajuste posterior por preferencias, algo esperable en este dominio. Tampoco se documenta ningún mecanismo de innovación técnica adicional más allá del propio paradigma de difusión aplicado al control.

## Capacidades

- Generación de trayectorias de acción de 6 grados de libertad para el robot `so_follower` a partir de estado propioceptivo e imagen.
- Ejecución de una tarea concreta de manipulación: doblar una toalla ("fold the towel").
- Control visuomotor condicionado por una única cámara (`hand`) a 240x320 píxeles.
- Generación de acciones multimodales y suaves, característica del paradigma de difusión frente a políticas deterministas.
- Inferencia en tiempo real dentro del bucle de control a 30 FPS (frecuencia del dataset de entrenamiento).
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, ni capacidades de visión general, audio o modo de razonamiento explícito. No es un modelo de propósito general y no procesa lenguaje natural como entrada.

## Casos de uso

- Automatización de doblado de toallas en un banco de pruebas de robótica: la política ejecuta la tarea completa a partir de la observación de la cámara de mano, sirviendo como base para prototipos de manipulación textil.
- Investigación en imitation learning: reproducción de un pipeline completo (grabación de demostraciones, entrenamiento con difusión, despliegue) usando la configuración documentada, útil para comparar variantes de arquitectura.
- Punto de partida para fine-tuning en tareas textiles relacionadas: al estar entrenada en manipulación deformable, puede servir como inicialización para tareas como doblar camisetas o colocar trapos.
- Benchmark interno de políticas de difusión: al publicarse pesos y dataset, permite medir el efecto del número de episodios (43) y de los pasos de entrenamiento (100.000) en la tasa de éxito.
- Evaluación de robustez ante cambios de iluminación y posición: útil para estudiar la degradación de políticas visuomotoras entrenadas con un único punto de vista de cámara.
- Docencia y divulgación en robótica: ejemplo autocontenido de LeRobot con dataset visualizable en el Space oficial, adecuado para cursos de aprendizaje por imitación.
- Recolección de datos comparativos: el dataset asociado (25.706 fotogramas a 30 FPS) puede reutilizarse para entrenar políticas alternativas como ACT sobre la misma tarea y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito en robot real, número de ensayos ni métricas de ningún tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, alrededor de 1,1 GB solo para pesos, más el estado del optimizador y activaciones del proceso de difusión; en FP16, aproximadamente 0,55 GB para pesos. Cabe holgadamente en cualquier GPU con 4-8 GB de VRAM. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: no hay recomendación oficial. Por tamaño, cualquier GPU con soporte CUDA es suficiente; una RTX 3060, RTX 4060, RTX 4090 o superiores son más que suficientes. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con más de 4 GB de VRAM, e incluso en CPU para inferencia a baja frecuencia, aunque no se documenta el rendimiento en ese escenario.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=yuvalgot/new_fold_diffusion_towel_fold1_20260919`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La única referencia temporal es la frecuencia del dataset, 30 FPS, y el hecho de que la inferencia de difusión implica varios pasos de denoising, lo que puede limitar el control en tiempo real según el hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yuvalgot/new_fold_diffusion_towel_fold1_20260919 | Diffusion Policy (LeRobot) | 262.962.502 | Estado (6,) + imagen (3,240,320) | Apache 2.0 | HuggingFace Hub |
| Otras politicas Diffusion Policy de LeRobot (por ejemplo lerobot/diffusion_pusht) | Diffusion Policy (LeRobot) | No disponible | No disponible en esta fuente | Apache 2.0 | HuggingFace Hub |
| ACT (Action Chunking Transformer, LeRobot) | Transformer de prediccion de acciones | No disponible | Estado + imagenes, variable segun configuracion | Apache 2.0 | HuggingFace Hub / repositorio LeRobot |
| SmolVLA / pi0 (familias VLA de LeRobot) | Vision-Language-Action | No disponible | Vision + lenguaje + estado | Variable segun modelo | HuggingFace Hub |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la informacion proporcionada, ya que este checkpoint no publica evaluación. La comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que se desconoce si la política funciona de forma fiable incluso en la tarea para la que fue entrenada.
- Especialización extrema: está entrenada únicamente para "fold the towel" con un robot `so_follower` y una cámara `hand`. No generaliza a otras tareas, objetos, robots ni configuraciones de cámara sin reentrenamiento.
- Dependencia del montaje físico: la política espera claves de observación concretas (`observation.state` de 6 dimensiones y `observation.images.hand` de 3x240x320). Cualquier cambio en la cámara, su resolución, su posición o el robot invalida el modelo.
- Dataset muy reducido: 43 episodios y algo más de 25.000 fotogramas suponen una cobertura limitada de posiciones iniciales, iluminación y variaciones del entorno, lo que aumenta el riesgo de sobreajuste a las condiciones de grabación.
- Sensibilidad a la distribución de demostraciones: en políticas de difusión entrenadas con pocos episodios es habitual que aparezcan fallos al salir de la distribución de estados vista en entrenamiento, especialmente con objetos deformables.
- Sin datos de sesgo en el sentido estadístico, pero sí riesgo de comportamientos no seguros en robot real: no hay información sobre paradas de emergencia, límites de fuerza ni validación de seguridad física. Cualquier despliegue real debe hacerse con límites de par y supervisión humana.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cite conforme a la model card. No hay restricciones adicionales documentadas, pero conviene verificar la licencia del dataset asociado por separado.
- Fechas del repositorio poco habituales (creación y actualización el 19 de septiembre de 2026) y cero descargas y cero valoraciones, lo que indica que el modelo no ha sido validado por terceros.
- Idiomas: no aplica. No debe interpretarse como un modelo multilingüe ni como un modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuvalgot/new_fold_diffusion_towel_fold1_20260919
- Dataset de entrenamiento: https://huggingface.co/datasets/yuvalgot/new_fold_towel_1_og_dataset_20260919_175141_clean
- Visualizador del dataset (LeRobot Space): https://huggingface.co/spaces/lerobot/visualize_dataset?path=yuvalgot/new_fold_towel_1_og_dataset_20260919_175141_clean
- Articulo de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utilizables son los del propio repositorio y la documentacion de LeRobot.
