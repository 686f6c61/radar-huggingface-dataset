# Yewy/mahjong_surfaces_standard_mat_v1_v16_policy

## Resumen

Yewy/mahjong_surfaces_standard_mat_v1_v16_policy es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada a través del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de observaciones visuales y del estado del robot, predice secuencias cortas de acciones ("chunks") para manipular superficies de mahjong sobre un tapete estándar. El autor es el usuario Yewy y el modelo se distribuye con licencia Apache 2.0.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo. Está asociado al dataset Yewy/mahjong_surfaces_standard_mat_v1_v16_224, con resolución de entrada de 224 píxeles, y etiquetado para plataformas SO-101 y LeKiwi, dos robots de bajo coste habituales en el ecosistema LeRobot.

Su relevancia es acotada pero clara: demuestra el flujo completo de entrenamiento y despliegue de una política ACT para una tarea de manipulación concreta (fichas de mahjong sobre una superficie estandarizada) usando herramientas abiertas. Resulta útil como referencia reproducible para quien quiera adaptar ACT a tareas de pick-and-place o clasificación de objetos pequeños con robots SO-101/LeKiwi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos de acción de longitud fija en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política combina un codificador visual con un transformer que genera los chunks de acción a partir de las observaciones y del estado del robot. El repositorio sigue el formato estándar de LeRobot para políticas (`policy.type=act`), con pesos en safetensors.

El entrenamiento se realizó a partir del dataset Yewy/mahjong_surfaces_standard_mat_v1_v16_224, compuesto por demostraciones teleoperadas de la tarea de manipulación de superficies de mahjong sobre un tapete estándar. El número exacto de episodios, tokens o composición detallada del dataset no está disponible en la información proporcionada. No se documenta el uso de RLHF, DPO ni innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control visuomotor de manipulación robótica: predice chunks de acción a partir de imágenes y estado del robot.
- Ejecución de tareas de pick-and-place y manipulación de objetos pequeños (fichas de mahjong sobre tapete).
- Entrenamiento por imitación a partir de demostraciones teleoperadas.
- Compatibilidad con robots SO-101 y LeKiwi dentro del ecosistema LeRobot.
- Entrada visual a resolución 224 píxeles.
- Integración con el flujo de entrenamiento y evaluación de LeRobot (`lerobot-train`, `lerobot-record`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación de fichas de mahjong: el modelo está entrenado específicamente para interactuar con superficies de mahjong sobre un tapete estándar, por lo que puede usarse como base para demostraciones de clasificación o colocación de fichas con un robot SO-101.
- Referencia reproducible para aprender ACT: sirve como ejemplo completo de política ACT publicada en el Hub, útil para validar el pipeline `lerobot-train` → `lerobot-record` antes de entrenar tareas propias.
- Prototipado de pick-and-place con robots de bajo coste: al estar etiquetado para SO-101 y LeKiwi, permite probar políticas de imitación en hardware asequible sin entrenar desde cero.
- Benchmark interno de manipulación: puede emplearse como línea base en experimentos comparativos de políticas de imitación sobre superficies estandarizadas.
- Educación y divulgación en robótica: la tarea concreta y el tamaño reducido (51,7 M de parámetros, 0,2 GB) facilitan demostraciones en talleres y cursos.
- Reentrenamiento por fine-tuning: el dataset asociado y la licencia Apache 2.0 permiten adaptar la política a variantes de la tarea (otros tapetes, otras fichas) con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors de 0,2 GB, la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU de consumo como RTX 3060 o superior debería ser suficiente, aunque no se confirma.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros), aunque no se documenta hardware mínimo oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`); no se documentan otras opciones como vLLM, llama.cpp u Ollama, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yewy/mahjong_surfaces_standard_mat_v1_v16_policy | 51.668.614 | no aplica | no disponible | Apache 2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot | no disponible | no aplica | no disponible | variable | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | no disponible | variable | Hugging Face Hub |
| Políticas VQ-BeT en LeRobot | no disponible | no aplica | no disponible | variable | Hugging Face Hub |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica para una tarea y un entorno concretos (superficies de mahjong sobre tapete estándar); no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento simbólico.
- El rendimiento depende de la distribución de las demostraciones teleoperadas del dataset; cambios de iluminación, disposición de objetos o del robot pueden degradar la ejecución.
- Riesgo de fallos por acumulación de error y por desviaciones del estado inicial; ACT mitiga parte de esto con chunks, pero no lo elimina.
- No se documentan sesgos ni evaluaciones de robustez en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantía sobre el comportamiento del modelo en producción.
- No se han publicado benchmarks ni métricas de éxito, por lo que no es posible cuantificar su fiabilidad antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yewy/mahjong_surfaces_standard_mat_v1_v16_policy
- Dataset asociado: https://huggingface.co/datasets/Yewy/mahjong_surfaces_standard_mat_v1_v16_224
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
