# zk0bot/study001-specialist-ring-insert

## Resumen

study001-specialist-ring-insert es un checkpoint de ajuste fino completo (full fine-tune) de un solo task, publicado por el usuario zk0bot como artefacto de respaldo de un estudio interno denominado Study 001. No se trata de un modelo de lenguaje general, sino de una política de robot (vision-language-action) derivada de `lerobot/smolvla_base`, la base de SmolVLA de Hugging Face. El modelo está entrenado especificamente para la tarea `ring_insert` del benchmark ArmnetBench, con 50 demostraciones y 3.000 pasos de entrenamiento, y se presenta explicitamente en la model card como un "techo de referencia" (reference ceiling) para un especialista de una sola tarea.

La relevancia de este repositorio es acotada y de caracter experimental: el propio autor advierte que **no es el modelo zk0 que se distribuye**, sino un backup de checkpoint intermedio. El modelo distribuido oficialmente vive en `ivelin/zk0-smolvla-fl` y este repositorio no lo modifica. Por tanto, debe interpretarse como material de reproducibilidad de un estudio, no como un modelo listo para producción.

Con 450.046.176 parámetros (aproximadamente 450 M) y un peso `model.safetensors` de 906.712.552 bytes, el checkpoint se enmarca en la familia de políticas VLA ligeras tipo SmolVLA, pensadas para control robótico en hardware modesto. No hay información publicada sobre idiomas, benchmarks estandar de NLP ni pipeline de inferencia en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), derivada de `lerobot/smolvla_base`; detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp32/bf16; no confirmado) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 906.712.552 bytes) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, la política SmolVLA de la librería LeRobot de Hugging Face. SmolVLA es una arquitectura vision-language-action que combina un codificador visual, un modelo de lenguaje preentrenado y un cabezal de acciones para producir comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. Los detalles concretos de número de capas, dimensión oculta, tokenizador y esquema de atención no se especifican en la información disponible.

El entrenamiento consistió en un ajuste fino completo sobre la tarea `ring_insert` del benchmark ArmnetBench, con 50 demostraciones y 3.000 pasos. No se documenta el número total de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. El autor describe este checkpoint como "specialist (reference ceiling)", es decir, un especialista de una sola tarea que sirve como cota superior de rendimiento para comparar con el modelo generalista zk0. El checkpoint fue respaldado el 2026-11-22 desde un entorno DGX Spark local, con SHA-256 de `model.safetensors` igual a `2e7dc0357cf264d5acccbb01d94c49b9cfca14b08c43628600d8a20abc0e861f`.

## Capacidades

- Control robótico de una sola tarea: ejecución de la habilidad `ring_insert` (inserción de anillo) en el benchmark ArmnetBench.
- Percepción visual y mapeo de instrucciones a acciones propio de las políticas VLA de SmolVLA.
- No se documentan capacidades de generación de texto, razonamiento, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión general, audio).

## Casos de uso

- Reproducibilidad de investigación: permite replicar el "techo de referencia" del Study 001 y comparar el especialista de una tarea con el modelo generalista `ivelin/zk0-smolvla-fl` en la tarea `ring_insert`.
- Evaluación de políticas VLA: sirve como baseline de especialista full fine-tune para medir la brecha de rendimiento frente a modelos multi-tarea en ArmnetBench.
- Estudio de escalado de datos: con 50 demos y 3.000 pasos, es un punto de partida para analizar cuánto mejora un especialista con más demostraciones o pasos.
- Docencia y divulgación: ejemplo didáctico de ajuste fino de SmolVLA con LeRobot y de gestión de checkpoints en Hugging Face.
- Pruebas de infraestructura de entrenamiento: útil para validar pipelines en hardware tipo DGX Spark y flujos de backup con verificación SHA-256.
- Auditoría de linaje de modelos: el hash y la ruta local documentados permiten verificar la procedencia del checkpoint en un estudio de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la tarea `ring_insert` de ArmnetBench y la condición de "reference ceiling", pero no incluye tasas de éxito, métricas de error ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 450 M parámetros, en fp32 los pesos ocupan aproximadamente 1,8 GB y en bf16/fp16 unos 0,9 GB; a ello hay que sumar el codificador visual y el estado de inferencia, no cuantificados en la información.
- GPU recomendadas: no disponibles. El autor menciona entrenamiento en DGX Spark (plataforma de NVIDIA), pero no se especifican GPUs de inferencia.
- Cabe en GPU de consumo: probablemente sí por tamaño de pesos, pero no está confirmado ni documentado por el autor.
- Opciones de despliegue: la librería declarada es `lerobot`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| study001-specialist-ring-insert | 450.046.176 | no disponible | `ring_insert` (ArmnetBench) | apache-2.0 | Hugging Face (zk0bot) |
| ivelin/zk0-smolvla-fl | no disponible | no disponible | multi-tarea (modelo distribuido) | no disponible | Hugging Face (ivelin) |
| lerobot/smolvla_base | no disponible | no disponible | base VLA generalista | no disponible | Hugging Face (lerobot) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es el modelo distribuido: el autor indica explícitamente que este repositorio es un backup de checkpoint de estudio y que el modelo oficial es `ivelin/zk0-smolvla-fl`.
- Especialista de una sola tarea: no generaliza a otras habilidades robóticas fuera de `ring_insert`.
- Entrenado con solo 50 demostraciones y 3.000 pasos: riesgo de sobreajuste y baja robustez ante variaciones de entorno.
- Sin benchmarks publicados: no hay evidencia numérica de rendimiento ni de tasas de éxito.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; en políticas VLA el riesgo se traduce en acciones incorrectas o inseguras en el robot.
- Idiomas y contexto no documentados.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de validación y de documentación técnica desaconseja su uso en producción sin evaluación propia.
- El repositorio tiene 22 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zk0bot/study001-specialist-ring-insert
- Modelo distribuido oficial: https://huggingface.co/ivelin/zk0-smolvla-fl
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://github.com/huggingface/lerobot
