# yanshi-robotics/so101-smolvla-snack-sorting-v1

## Resumen

SO-101 SmolVLA Snack Sorting v1 es una política Vision-Language-Action (VLA) de inferencia pura, publicada por yanshi-robotics, obtenida mediante fine-tuning de `lerobot/smolvla_base` sobre el brazo robótico de sobremesa de código abierto SO-101 (6 grados de libertad, servos Feetech STS3215). El modelo recibe un flujo RGB de dos cámaras (vista cenital `top` y vista en muñeca `wrist`) más una instrucción en inglés, y genera un chunk de 50 acciones articulares para recoger un aperitivo concreto de una alfombrilla verde y depositarlo en el contenedor correcto (izquierdo, central o derecho).

La arquitectura subyacente es SmolVLA, un VLA construido sobre el backbone visual-lenguaje `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`, con el codificador de visión congelado y un experto de acciones más proyecciones de estado entrenadas. El checkpoint publicado contiene 450.046.176 parámetros en formato safetensors (864,75 MiB, sin estado de optimizador), lo que lo sitúa en la franja de modelos pequeños desplegables en una sola GPU, incluso de gama consumer.

Su relevancia es doble: por un lado demuestra un flujo completo de imitación sobre hardware accesible (SO-101 + LeRobot 0.6.1); por otro, documenta de forma explícita el contrato de observación, las instrucciones canónicas y las métricas de validación offline, algo poco habitual en políticas robóticas publicadas. Está pensado como componente "System 1" dentro de un marco de despliegue seguro con monitorización de intentos y retracción segura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action) sobre backbone SmolVLM2-500M-Video-Instruct; codificador de vision congelado, experto de acciones y proyecciones de estado entrenados |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (observacion de un unico frame, `n_obs_steps = 1`) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 y float32; sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | ingles unicamente (tres instrucciones canonicas exactas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 864,75 MiB; 474/500 tensores en bfloat16, 26 en float32) |

## Arquitectura y entrenamiento

SmolVLA combina un modelo visual-lenguaje preentrenado (SmolVLM2-500M-Video-Instruct) con un experto de acciones que produce chunks de 50 pasos (`chunk_size = 50`, `n_action_steps = 50`; se recomienda 30 en despliegue real para mayor reactividad en bucle cerrado). La observación es de un solo frame (`n_obs_steps = 1`, supuesto markoviano), con dos cámaras RGB de 640×480 a 30 Hz más una tercera cámara vacía gestionada por `policy_preprocessor.json` mediante un `rename_map` incorporado. Las acciones son 6 articulaciones en grados (`shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll`, `gripper`).

El fine-tuning se realizó sobre 72 demostraciones equilibradas (24 por SKU, 19.605 frames a 30 Hz) con instrucciones en inglés mutuamente distinguibles, en una única NVIDIA A100 de 80 GB, `batch_size = 64`, 20.000 pasos (1.280.000 pasos de muestra, 65,29 épocas), 8,52 h de reloj y pérdida de 0,681 a 0,013. Se aplicó aumento fotométrico en línea (brillo, contraste, saturación, tono, nitidez) y se desactivó el aumento geométrico afín para preservar las coordenadas espaciales de los contenedores. El checkpoint publicado corresponde al paso 15.000, seleccionado por mínimo global de la curva U en validación retenida.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad condicionadas por lenguaje, en chunks de 50 pasos.
- Condicionamiento por lenguaje con tres instrucciones canónicas exactas en inglés (una por SKU y contenedor).
- Percepción visual dual: cámara cenital y cámara en muñeca, ambas a 640×480 y 30 Hz.
- Discriminación de tres categorías de objeto (macadamia marrón, crisp de semilla de calabaza, snack de giro amarillo) y de tres destinos espaciales.
- Capacidad contrafactual demostrada: bajo píxeles idénticos, el cambio de instrucción altera la trayectoria (L1 contrafactual de 17,650° en frames 16:40, superando el umbral de 3,0°).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes conversacionales; es una política de imitación pura de inferencia.
- No soporta otros idiomas: el autor advierte que pasar chino o sinónimos no vistos directamente al System 1 degrada el anclaje lingüístico.

## Casos de uso

- Clasificación y separación de aperitivos en línea de envasado: el modelo recoge el snack solicitado de la alfombrilla y lo deposita en el contenedor correcto, adecuado por su precisión de selección observada en hardware real y su baja tasa de error de selección.
- Demostración docente de pipelines VLA con LeRobot: sirve como referencia reproducible de fine-tuning de SmolVLA sobre SO-101, con contrato de observación y esquema legible por máquina (`policy_contract.json`).
- Pruebas de anclaje lingüístico en robótica: su métrica contrafactual permite evaluar si una política responde realmente al prompt o solo a la escena visual, útil en investigación de grounding.
- Banco de pruebas de despliegue seguro: combinado con el marco System 0/1/2 de Yanshi-Robotics (retracción segura ante caída cero y monitor de intentos/estancamiento), sirve para validar recuperación ante fallos de agarre en producción.
- Prototipado de células de pick-and-place de bajo coste: al requerir solo dos cámaras USB y un SO-101, permite montar una estación de manipulación con hardware de sobremesa.
- Evaluación comparativa de políticas de imitación: sus métricas offline (MAE articular, P90, MAE de pinza) y sus checkpoints intermedios de 2,5k a 20k ofrecen una curva de validación útil como línea base frente a otras políticas VLA pequeñas.

## Benchmarks y rendimiento

| Metrica | Valor @ paso 15.000 | Notas |
|---|---|---|
| MAE articular global | 2,413° | Error absoluto medio en 6 DoF, validación retenida de 18 episodios `sort_dev` |
| Error articular P90 | 5,427° | Percentil 90 del error |
| MAE de pinza | 3,550° | Precisión de agarre y liberación |
| L1 contrafactual de lenguaje (`L1_LR`, frames 16:40) | 17,650° | Umbral >= 3,0°: PASS |
| Dispersión de pan contrafactual (`lang_pan_spread`) | 1,513° | Diferenciación entre prompts |

Los datos anteriores proceden de validación offline retenida y no constituyen prueba física. En rollout físico sobre SO-101 (verificado el 2026-11-28) el autor reporta un "pass cualitativo" con alta precisión de selección de objetivo y baja tasa de mala selección; las tablas cuantitativas por SKU (3×5 directas más contrafactuales) están pendientes de medición. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB durante inferencia en CUDA con precisión mixta (bfloat16 + float32).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM; el entrenamiento se realizó en una A100 de 80 GB, pero la inferencia es muy ligera.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: CLI oficial `lerobot-rollout` con `lerobot==0.6.1`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política de acciones).
- Latencia y throughput: no disponibles de forma numérica; el control opera a 30 Hz con chunks de 50 acciones (30 recomendadas en bucle cerrado).
- Hardware robótico: SO-101 Follower con servos Feetech STS3215, dos cámaras USB a 640×480 y 30 Hz (la de muñeca con rotación de 180°), pose de reposo medida `[0.9, -103.5, 93.9, 74.1, 14.3, 1.0]` grados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SO-101 SmolVLA Snack Sorting v1 | 450 M | 1 frame, 2 camaras | Apache-2.0 | Hugging Face (lerobot) | Fine-tuning especifico de 3 SKU |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Hugging Face | Modelo base generalista del que deriva |
| Otras politicas VLA pequenas (p. ej. variantes de SmolVLA o ACT) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada; la comparación se limita a la relación de derivación con el modelo base.

## Limitaciones y advertencias

- Ámbito muy restringido: solo tres objetos, tres contenedores y tres instrucciones exactas en inglés; cualquier cambio de redacción degrada el anclaje lingüístico.
- Observación de un único frame: no cuenta fallos de agarre repetidos ni decide abortar y volver a reposo; requiere el monitor de intentos y la retracción segura del marco externo para producción.
- Riesgo de alucinación de acciones: al ser una política de imitación, puede generar trayectorias plausibles pero incorrectas ante escenas fuera de distribución.
- Sesgos: entrenado con 72 demostraciones en un entorno concreto (alfombrilla verde, iluminación y montaje específicos); la generalización a otras condiciones no está medida.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni datos cuantitativos de fiabilidad física por SKU.
- Idiomas: solo inglés; el uso de otros idiomas requiere un compilador de prompts (System 2) según el autor.
- Integridad de pesos verificable mediante SHA-256 `4d8b3768ae21b5a548f884037b6d229340c7a317bcd1b9f817bc863de4cd2ddf`.
- Sin datos publicados de latencia, throughput ni benchmarks estándar; no debe asumirse un rendimiento superior al reportado cualitativamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yanshi-robotics/so101-smolvla-snack-sorting-v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Backbone VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Repositorio de código y marco de despliegue seguro: https://github.com/Yanshi-Robotics/Lets-Build-Robots-S1-SO101
- Script de rollout seguro: `VLA/rollout/safe_episode_runner.py` (dentro del repositorio anterior)
