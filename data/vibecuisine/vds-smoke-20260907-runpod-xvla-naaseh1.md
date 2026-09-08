# VibeCuisine/vds-smoke-20260907-runpod-xvla-naaseh1

## Resumen

VibeCuisine/vds-smoke-20260907-runpod-xvla-naaseh1 es un modelo de política robótica basado en X-VLA, un framework de Vision-Language-Action con soft prompts y flow matching. Ha sido desarrollado por VibeCuisine como un fine-tune del modelo base `lerobot/xvla-base`, y se ha entrenado para una tarea concreta: agarrar una jarra de pie por sus caras anchas y colocarla en un soporte, con el pitorro hacia la derecha. El modelo está pensado para controlar un robot Seeed B601 RS Follower con dos cámaras (superior y de muñeca).

Con 879.738.545 parámetros y un tamaño de repositorio de 1,8 GB en formato safetensors, este modelo es un ejemplo de ajuste rápido de un VLA con una cantidad mínima de datos: un solo episodio, 270 frames y 10 pasos de entrenamiento. Su relevancia radica en demostrar cómo un modelo preentrenado de robótica puede adaptarse a una tarea específica con un coste computacional muy bajo, aunque no se han publicado resultados de evaluación que confirmen su rendimiento real. La licencia Apache 2.0 permite su uso comercial y su distribución sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA (Vision-Language-Action con soft prompts y flow matching) |
| Parametros totales | 879.738.545 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en X-VLA, un framework de Vision-Language-Action que trata cada configuración de robot o hardware como una "tarea" codificada mediante un pequeño conjunto de embeddings de soft prompts aprendibles. Esto permite que un único modelo preentrenado pueda adaptarse a distintas morfologías de robot, sensores y espacios de acción. La política genera acciones continuas mediante un proceso de flow matching, en lugar de predecir acciones discretas o tokens de texto.

El entrenamiento de este fine-tune se realizó con el dataset `VibeCuisine/naaseh1-bottle-holder-calib-090326`, que contiene un único episodio con 270 frames a 20 FPS. La configuración de entrenamiento incluye 10 pasos, batch size 1, optimizador `xvla-adamw`, learning rate 0.0001, seed 1000 y la versión 0.6.0 de LeRobot. El modelo parte del checkpoint preentrenado `lerobot/xvla-base`. No se menciona ninguna técnica adicional como RLHF ni DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones de robot de 7 dimensiones a partir de observaciones visuales y de estado.
- Entradas de observación: estado del robot `(7,)`, imagen de cámara superior `(3, 640, 480)` e imagen de cámara de muñeca `(3, 480, 640)`.
- Salida de acción `(7,)` compatible con el robot Seeed B601 RS Follower.
- Capacidad de imitar una tarea concreta de manipulación (agarrar una jarra y colocarla en un soporte).
- No soporta tool calling, function calling ni generación de texto; es exclusivamente un modelo de política para robótica.
- No dispone de capacidades multilingües ni de modo de razonamiento explícito.

## Casos de uso

- Automatización de manipulación en laboratorio: el modelo puede ejecutar la tarea de colocar una jarra en un soporte, lo que resulta útil en entornos de laboratorio donde se manejan recipientes y se requiere repetibilidad en la colocación.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de X-VLA con un solo episodio y 10 pasos, permitiendo estudiar el impacto de la cantidad de datos en el rendimiento de políticas VLA.
- Desarrollo de robots colaborativos: puede integrarse en el framework LeRobot para probar políticas en un robot Seeed B601 RS Follower, facilitando el prototipado rápido en entornos de investigación.
- Transferencia a tareas similares: mediante fine-tuning adicional sobre el checkpoint, se puede adaptar a otras tareas de manipulación que impliquen objetos similares o configuraciones de cámara equivalentes.
- Evaluación de políticas en simulación: el modelo puede cargarse en simuladores de robótica compatibles con LeRobot para validar su comportamiento antes de desplegarlo en un robot físico.
- Demostraciones educativas: permite ilustrar conceptos de Vision-Language-Action, soft prompts y flow matching en cursos de robótica, al ser un ejemplo compacto y de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política, por lo que no se dispone de datos de éxito ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos en fp16 (879,7 M parámetros × 2 bytes ≈ 1,76 GB), más overhead de activaciones y buffers. Se recomienda disponer de al menos 4 GB de VRAM para una ejecución estable.
- GPU recomendadas: cualquier GPU moderna con 4 GB o más, como una RTX 3060, RTX 4090, A100 o H100. El modelo cabe en GPUs de consumo.
- Opciones de despliegue: se ejecuta mediante LeRobot, usando el comando `lerobot-rollout` con la estrategia base. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de política robótica.
- Latencia y throughput: no disponibles. No se han publicado mediciones de rendimiento en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VibeCuisine/vds-smoke-20260907-runpod-xvla-naaseh1 | 879.738.545 | no aplica | apache-2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | no aplica | apache-2.0 | Hugging Face |
| VibeCuisine/vds-smoke-20260907-runpod-molmoact2-naaseh1 | no disponible | no aplica | no disponible | Hugging Face |

La comparación se basa únicamente en la información disponible. No se han publicado resultados de benchmarks para ninguno de los modelos, por lo que no es posible establecer comparativas de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado con un único episodio, el modelo puede presentar un comportamiento muy limitado ante variaciones del entorno.
- Riesgo de alucinación: en robótica, el modelo puede ejecutar acciones incorrectas o inesperadas si la observación difiere de la distribución de entrenamiento, especialmente con objetos en posiciones distintas o iluminación diferente.
- Limitaciones de contexto e idioma: al ser un modelo de política, no maneja texto ni lenguaje natural; su "contexto" se limita a las observaciones visuales y de estado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero no incluye garantías de rendimiento ni soporte.
- Caveat importante para producción: el identificador del repositorio contiene "vds-smoke", lo que sugiere que se trata de una prueba de humo. Con solo 10 pasos de entrenamiento y un episodio de datos, es muy probable que el rendimiento sea insuficiente para aplicaciones reales sin un fine-tuning adicional.
- Requisitos de hardware específicos: el modelo espera exactamente las entradas de cámara y estado del robot Seeed B601 RS Follower; cualquier cambio en la configuración de sensores invalidará la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-xvla-naaseh1
- Paper de X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/naaseh1-bottle-holder-calib-090326
- Guía de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo similar de MolmoAct2: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-molmoact2-naaseh1
