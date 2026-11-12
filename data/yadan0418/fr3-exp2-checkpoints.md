# yadan0418/fr3-exp2-checkpoints

## Resumen

FR3 Exp2 checkpoints es una colección de tres checkpoints de políticas robóticas entrenadas para la manipulación real de un robot Franka Research 3 (FR3) en la tarea de borrar una pizarra blanca. Los checkpoints se publican como material de reproducción del experimento comparativo descrito en el pull request Haiyuan-Liu/myOpenPi#1, rama `yadan/exp2-force-gate`, y están pensados para servirse con `serve_policy.py` del framework openpi. No se trata de un modelo de lenguaje, sino de pesos de política visomotora con entrada multimodal (observaciones visuales y de fuerza/par) y salida de acciones articulares.

El autor, yadan0418, incluye dos variantes de su método propuesto (etiquetadas "v2", con un mecanismo de compuerta de fuerza, en los pasos 15000 y 3000) y una línea base π0.5 con LoRA en el paso 15000. Cada carpeta contiene pesos (`params/`) y estadísticas de normalización (`assets/`), sin estado del optimizador. El repositorio ocupa 18,7 GB y no registra descargas ni interacciones en el momento de la consulta.

La relevancia es acotada: sirve como evidencia reproducible de un experimento de investigación en robótica con señales de fuerza, no como un modelo de propósito general. La información pública disponible es escasa en cuanto a arquitectura interna, datos de entrenamiento y benchmarks estandarizados, por lo que muchos campos de esta ficha se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política robótica basada en openpi; línea base π0.5 con LoRA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | checkpoints openpi: `params/` (pesos) y `assets/` (estadísticas de normalización) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna de la política "v2" propuesta por el autor. La línea base incluida, `B_lora_15000`, corresponde a π0.5 con adaptación LoRA, un modelo visomotor de openpi. La variante propuesta se identifica como "v2, exact-budget gate", con configuración `ours_v2-2-tokens-Exp2-gate2_wipe-whiteboard_fr3-abs-joint`, lo que sugiere un mecanismo de compuerta sobre la señal de fuerza con un presupuesto de tokens concreto, aunque no se especifica su funcionamiento.

Los datos de entrenamiento provienen del dataset LeRobot `ours_v2-2_tokens_gc/wipe_whiteboard`: 64 episodios a 15 fps, con fuerza/par compensados por gravedad mediante `examples/franka_fr3/ft_gravity/gravity_whiteboard.json`. Los episodios 10, 20, 30, 40, 50 y 60 se excluyeron del entrenamiento y se usaron para todas las cifras de validación. No se indica el número de tokens, la composición del dataset ni si hubo RLHF o DPO (no aplicable en este contexto).

## Capacidades

- Control visomotor de un robot Franka FR3 para la tarea concreta de borrar una pizarra blanca.
- Entrada multimodal que combina observaciones visuales y señal de fuerza/par (en la variante v2).
- Salida de acciones en espacio articular absoluto (`fr3-abs-joint`).
- Servido mediante `serve_policy.py` de openpi, con envío del modelo de gravedad y el prompt usados en entrenamiento.
- Verificación de consistencia en el nodo ROS: rechaza la ejecución si algún parámetro contradice el checkpoint.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Reproducción del experimento comparativo: cargar los tres checkpoints (A, B y C) con `serve_policy.py` y ejecutar la guía de prueba en robot real para contrastar la compuerta de fuerza frente a la línea base LoRA.
- Investigación en manipulación con realimentación de fuerza: usar la variante v2 para estudiar cómo la señal de fuerza/par compensada por gravedad afecta al error de contacto en tareas de borrado.
- Evaluación de robustez ante ruido de fuerza: el checkpoint permite medir la sensibilidad a 1 N de ruido (documentada en +11,3 mm para A y +15,2 mm para C), útil para diseñar filtros o umbrales en el pipeline de control.
- Análisis de curvas de entrenamiento: comparar el paso 3000 (cerca del mínimo de pérdida de validación) con el 15000 para decidir puntos de parada en futuros entrenamientos.
- Integración en un stack ROS 2: el nodo `openpi_ros` valida la coherencia del modelo de gravedad y el prompt, lo que facilita desplegar la política en un lazo de control real con comprobaciones de seguridad.
- Base para ablaciones: reutilizar los pesos y las estadísticas de normalización como punto de partida para variar la compuerta de fuerza o el presupuesto de tokens.

## Benchmarks y rendimiento

Resultados de bucle abierto sobre episodios retenidos, según la model card:

| Checkpoint | Error TCP en h=49 | Error de altura en contacto | Sensibilidad a 1 N de ruido de fuerza |
|---|---|---|---|
| A (v2, 15000) | 36,3 mm | 7,5 mm | +11,3 mm |
| B (LoRA, 15000) | 35,4 mm | 4,9 mm | 0 (no lee fuerza) |
| C (v2, 3000) | 42,9 mm | 9,9 mm | +15,2 mm |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `scripts/serve_policy.py` de openpi (rama `yadan/exp2-force-gate`), con nodo ROS 2 en `ros2_ws/src/openpi_ros`.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio completo ocupa 18,7 GB; puede descargarse una sola carpeta con `--include`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FR3 Exp2 A (v2, 15000) | no disponible | no disponible | Error TCP 36,3 mm; altura 7,5 mm | other | Hugging Face |
| FR3 Exp2 B (π0.5 LoRA, 15000) | no disponible | no disponible | Error TCP 35,4 mm; altura 4,9 mm | other | Hugging Face |
| FR3 Exp2 C (v2, 3000) | no disponible | no disponible | Error TCP 42,9 mm; altura 9,9 mm | other | Hugging Face |

No se dispone de datos de otros modelos comparables fuera de los tres checkpoints incluidos en este repositorio.

## Limitaciones y advertencias

- Entrenado para una única tarea (borrar una pizarra blanca) y un único robot (Franka FR3); no generaliza a otras tareas sin reentrenamiento.
- La variante v2 es sensible al ruido de fuerza: +11,3 mm con 1 N de ruido en el checkpoint A, frente a 0 en la línea base LoRA, que no lee fuerza.
- El error de altura en contacto de la variante v2 (7,5 mm) es superior al de la línea base (4,9 mm) en el checkpoint A.
- El checkpoint C (paso 3000) muestra peor error TCP (42,9 mm) y de altura (9,9 mm), por lo que no es adecuado como configuración final.
- No se incluye estado del optimizador, lo que impide reanudar el entrenamiento desde estos pesos.
- Licencia "other": no se especifican los términos exactos de uso comercial; es necesario consultar al autor antes de un uso en producción.
- El nodo ROS rechaza la ejecución si el modelo de gravedad o el prompt no coinciden con los del entrenamiento, lo que limita la reutilización fuera de ese stack.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución más allá de los episodios de validación indicados.
- No se documentan idiomas ni capacidades lingüísticas.

## Enlaces

- Hugging Face: https://huggingface.co/yadan0418/fr3-exp2-checkpoints
- Pull request del experimento: https://github.com/Haiyuan-Liu/myOpenPi/pull/1
- Rama del código: `yadan/exp2-force-gate` en el repositorio Haiyuan-Liu/myOpenPi
- Guía de prueba en robot real: `ros2_ws/src/openpi_ros/REAL_ROBOT_TEST_zh.md` (en la rama citada)
- Guía de despliegue: `DEPLOY_zh.md` (en la rama citada)
- Dataset: LeRobot `ours_v2-2_tokens_gc/wipe_whiteboard`
