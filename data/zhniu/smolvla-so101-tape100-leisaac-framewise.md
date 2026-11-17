# zhniu/smolvla-so101-tape100-leisaac-framewise

## Resumen

SmolVLA SO-101 tape policy es un modelo de política robótica (vision-language-action, VLA) obtenido por ajuste fino supervisado del modelo base `lerobot/smolvla_base`. Lo desarrolla el usuario `zhniu` y está pensado para controlar un brazo robótico SO-101 en una tarea concreta de manipulación de cinta sobre una PCB, usando dos vistas RGB (una de muñeca y otra externa) y un estado articular de seis dimensiones. El resultado es un checkpoint de 450 millones de parámetros, publicado en formato safetensors y consumible con la librería LeRobot.

El modelo combina un backbone VLM congelado con un experto de acción entrenable que genera trayectorias mediante flow matching. El entrenamiento mezcla datos simulados (100 layouts, 49.800 fotogramas generados en LeIsaac/Isaac Sim PhysX con aleatorización visual en MuJoCo EGL) y datos reales (20 trayectorias, 12.191 fotogramas), con una composición de lote fija de cuatro anclas reales y cuatro simuladas por paso. Es relevante porque documenta de forma inusualmente detallada el proceso de ajuste fino de un VLA pequeño sobre hardware de consumo profesional (una V100 de 32 GB) y porque publica artefactos de auditoría del entrenamiento.

La principal advertencia es que se trata de un checkpoint de investigación: la validación es puramente offline sobre dos trayectorias reservadas (pérdida final de 0,3879 sobre 928 fotogramas reales) y el autor declara explícitamente `calibration_passed=false`, es decir, el rendimiento en bucle cerrado sobre hardware físico no se ha medido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA: backbone VLM congelado más experto de acción con flow matching |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32; entrenamiento con FP16 AMP) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base` (revisión `d9f33c94a60fb382c90dea2164c96845bd955e28`). La arquitectura sigue el esquema SmolVLA: un modelo visión-lenguaje que procesa las dos vistas RGB y el estado, y un experto de acción separado que produce *chunks* de acciones mediante flow matching. En el ajuste fino se congeló el VLM y se entrenaron únicamente el experto de acción y la proyección de estado, con un optimizador AdamW nuevo.

El conjunto de datos mezcla dos dominios. El simulado contiene 100 layouts y 49.800 fotogramas generados los días 15 y 16 de noviembre de 2026 en LeIsaac/Isaac Sim PhysX, con aleatorización visual en MuJoCo EGL y movimientos retargetizados derivados de la demostración fuente 11. El real contiene 20 trayectorias y 12.191 fotogramas; las episodios 6 y 19 se reservaron para validación (928 fotogramas), quedando 11.263 fotogramas de entrenamiento. Cada lote contiene exactamente cuatro anclas reales y cuatro simuladas, y la normalización numérica usa solo datos de entrenamiento con igual peso por dominio.

La receta empleó tasa de aprendizaje 1e-4, 1.000 pasos de calentamiento, tamaño de lote 8, *action chunk* de 50 y horizonte de ejecución de 30, sobre una Tesla V100 de 32 GB con parámetros en FP32 y cómputo en FP16 AMP con GradScaler. Se completaron 20.000 pasos nativos (19.990 actualizaciones reales de Adam; AMP omitió 10). La cabeza de acción usa muestreo ODE con diez pasos de integración.

## Capacidades

- Generación de acciones robóticas de seis dimensiones (shoulder pan, shoulder lift, elbow flex, wrist flex, wrist roll y gripper) a partir de observaciones visuales y de estado.
- Procesamiento de dos vistas RGB simultáneas: `observation.images.front` (vista de muñeca, `camera1`) y `observation.images.side` (vista externa, `camera2`).
- Condicionamiento por instrucción en lenguaje natural, heredado del backbone VLM de SmolVLA.
- Generación de trayectorias por flow matching con muestreo ODE de diez pasos.
- Producción de *action chunks* de longitud 50 con horizonte de ejecución de 30.
- Entrenamiento mixto sim-to-real con anclas balanceadas por dominio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio.

## Casos de uso

- Manipulación de precisión sobre PCB: el modelo está ajustado específicamente para la tarea `side20_pcb_fit` con cinta sobre placa, por lo que es directamente aplicable a operaciones de ensamblaje repetitivas con posicionamiento submilimétrico en el banco de trabajo del autor.
- Investigación en sim-to-real para VLA pequeños: la mezcla balanceada de anclas reales y simuladas, junto con los artefactos de auditoría (`evaluation/training_evidence.json`), permite estudiar cómo afecta la composición del lote a la transferencia de políticas.
- Replicación de experimentos con hardware modesto: el entrenamiento cabe en una única V100 de 32 GB, lo que lo hace adecuado como referencia para laboratorios con GPUs de gama profesional y no solo con clústeres de A100/H100.
- Base para ajuste fino en tareas SO-101 adyacentes: al mantener el VLM congelado y entrenar solo el experto de acción, sirve como punto de partida barato para nuevas tareas del mismo robot y cámara.
- Evaluación de robustez ante aleatorización visual: el dataset simulado incluye transformaciones de cámara nominales y aleatorizadas con hashes de vídeo, útil para medir sensibilidad a cambios de calibración extrínseca.
- Docencia y divulgación sobre VLA: el modelo card detalla hiperparámetros, número de actualizaciones, omisiones de AMP y procedencia de pesos (SHA256), lo que facilita usarlo como caso de estudio reproducible.
- Integración en pipelines LeRobot: al publicarse con preprocesador y postprocesador guardados, se puede cargar directamente en flujos de evaluación de LeRobot para comparar políticas sobre el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni métricas de éxito en tarea) en la información disponible. El único dato de rendimiento es la pérdida de validación nativa final de 0,3879 sobre 928 fotogramas reales reservados (episodios 6 y 19), que corresponde a predicción offline y no a ejecución en bucle cerrado.

| Métrica | Valor | Condiciones |
|---|---|---|
| Pérdida de validación (offline) | 0,3879 | 928 fotogramas reales reservados (episodios 6 y 19) |
| Pasos de entrenamiento | 20.000 nativos / 19.990 actualizaciones Adam | AMP omitió 10 actualizaciones |
| Anclas muestreadas por dominio | 80.000 | real y simulado |
| Violaciones de composición de lote | 0 | auditoría registrada |
| Calibración en hardware | `calibration_passed=false` | no medida |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros, los pesos en FP32 ocupan aproximadamente 1,8 GB y en FP16 unos 0,9 GB, a lo que hay que sumar el backbone VLM y los buffers de activación.
- GPU de entrenamiento documentada: una Tesla V100 de 32 GB con FP16 AMP y GradScaler.
- GPU recomendadas para inferencia: no especificadas por el autor; por tamaño, cualquier GPU con al menos 8-16 GB de VRAM debería poder alojar el checkpoint, aunque no hay medición publicada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: librería LeRobot con el preprocesador y postprocesador guardados; el dispositivo de carga por defecto es CPU.
- Latencia y throughput: no disponibles. El muestreo ODE usa diez pasos de integración, lo que condiciona el coste por inferencia, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhniu/smolvla-so101-tape100-leisaac-framewise | 450 M | no disponible | VLA con flow matching, ajuste mixto sim-real para SO-101 | Apache 2.0 | Hugging Face, 100 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base de LeRobot, preentrenado | no disponible en la información | Hugging Face (modelo base citado) |
| Otras políticas VLA de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks homogéneos que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- El autor declara `calibration_passed=false`: el rendimiento en bucle cerrado sobre el robot físico no se ha medido, solo la predicción offline sobre dos trayectorias reservadas.
- La validación se limita a 928 fotogramas de dos episodios (6 y 19); la generalización a otras trayectorias, objetos o condiciones de iluminación no está cuantificada.
- El modelo está especializado en una única tarea (`side20_pcb_fit`) y en una configuración de cámara concreta (`side20_pcb_fit` con cámara externa); no es un modelo generalista.
- El dataset real original permanece en una fuente privada de entrenamiento, por lo que la reproducibilidad exacta del ajuste fino no está garantizada.
- Riesgo de sobreajuste al dominio simulado: aunque el lote está balanceado, la mitad de las anclas provienen de simulación con aleatorización visual, lo que puede introducir una brecha de apariencia respecto al mundo real.
- Idiomas declarados limitados a inglés y chino; no se documenta soporte de instrucciones en castellano.
- No se publican análisis de sesgos, tasas de alucinación ni evaluaciones de seguridad, algo esperable en un checkpoint de robótica pero relevante para cualquier despliegue.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en hardware desaconseja su uso en producción sin una evaluación propia en bucle cerrado.
- El dispositivo de carga por defecto es CPU, lo que puede provocar latencias altas si no se mueve explícitamente a GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhniu/smolvla-so101-tape100-leisaac-framewise
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zhniu/so101-tape100-leisaac-framewise
- Librería LeRobot: https://github.com/huggingface/lerobot
- Artefactos de evaluación: `evaluation/training_evidence.json` dentro del repositorio del modelo
- Atribuciones y citas: `NOTICE` y `CITATION.bib` dentro del repositorio del modelo
