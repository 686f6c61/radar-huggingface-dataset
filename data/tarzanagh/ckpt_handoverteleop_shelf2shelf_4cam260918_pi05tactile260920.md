# tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05tactile260920

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenada por imitación (imitation learning) para una tarea bimanual concreta: un robot DexMate Vega-1 con dos manos RobotEra XHand1 coge una caja de pañuelos de un nivel de estantería, la pasa de una mano a otra y la deposita en otro nivel. El modelo, denominado "pi-0.5 + tactile", forma parte de una familia de políticas viso-lenguaje-acción (VLA) que procesan observaciones visuales y estado proprioceptivo y emiten acciones motoras por chunks. Se trata de un artefacto de investigación, no de un producto listo para producción.

Con 3.616.769.814 parámetros (~3,6 B) y un tamaño de repositorio de 14,5 GB, el modelo se publica bajo licencia Gemma. El entrenamiento se realizó con 54 episodios de teleoperación (48 de entrenamiento, 6 reservados) capturados con cuatro cámaras RGB a 640x360 y 30 fps, más estado táctil de los dedos. El checkpoint corresponde a 10.000 pasos de entrenamiento con semilla 1000.

Su relevancia ahora es metodológica: el autor publica este checkpoint junto a otros 23 de la misma tarea (familias ACT, Diffusion Policy, GR00T 3B y pi-0.5, con y sin táctil), lo que permite comparar familias de políticas sobre un dataset idéntico. La propia model card concluye que la entrada táctil no aportó mejoras más allá del ruido y que GR00T registró el error más bajo en todas las tareas evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; política viso-lenguaje-acción (VLA) de la familia pi-0.5. La licencia Gemma sugiere un componente derivado de PaliGemma, no confirmado |
| Parametros totales | 3.616.769.814 (~3,6 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (política por chunks: observación real cada 16 pasos) |
| Tipos de cuantizacion | No especificados. El tamaño del repo (14,5 GB) es coherente con pesos en FP32 (3,6 B x 4 bytes ≈ 14,5 GB) |
| Idiomas soportados | No disponible (no aplica a una política motora) |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la model card más allá de su pertenencia a la familia pi-0.5. Se sabe que es una política de imitación que opera por "chunks" de acción: el modelo observa el estado real cada 16 pasos, predice un bloque de acciones y se conservan las primeras 16, que se ejecutan en bucle abierto hasta la siguiente observación. La representación de estado/acción es un vector de 38 dimensiones, `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` de posiciones articulares, al que se concatenan 30 dimensiones de fuerza en las puntas de los dedos (5 dedos x 3 ejes por mano), dando una entrada total de 68 dimensiones.

El entrenamiento se realizó sobre 54 episodios de teleoperación con guante (meta-glove, sin exoesqueleto) y seguimiento de muñeca Vive; 48 episodios se usaron para entrenamiento y 6 se reservaron (uno de cada diez). Las observaciones visuales son cuatro cámaras RGB a 640x360 y 30 fps. El modelo se entrenó durante 10.000 pasos con semilla 1000. No se indica en la información disponible si hubo RLHF, DPO ni otras etapas de alineamiento, ni el número total de tokens o composición del dataset.

## Capacidades

- Generación de acciones motoras bimanuales (14 grados de libertad de brazo y 24 de mano) como política de imitación por chunks de 16 pasos.
- Manipulación diestra con dos manos RobotEra XHand1 sobre robot DexMate Vega-1.
- Fusión de percepción visual multi-cámara (4 vistas RGB) con estado proprioceptivo.
- Integración de señal táctil de puntas de dedos (30 dimensiones de fuerza de 3 ejes) en la entrada de estado; según la model card, sin efecto medible frente a la variante sin táctil.
- Ejecución de una tarea concreta de handover (paso de objeto de una mano a otra) y colocación en estantería.
- Reproducción de trayectorias de teleoperación con error de seguimiento en bucle abierto bajo.
- No se especifican capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento.

## Casos de uso

- Reproducción de investigación en manipulación bimanual: cargar el checkpoint para replicar el experimento de handover de una caja de pañuelos entre niveles de estantería y medir el error de seguimiento en bucle abierto.
- Evaluación comparativa de familias de políticas: usar este checkpoint junto con los otros 23 publicados por el mismo autor (ACT, Diffusion Policy, GR00T 3B) sobre el mismo dataset para aislar el efecto de la arquitectura en el error de trayectoria.
- Estudio del aporte de la señal táctil: comparar directamente con la variante `pi05260920` (sin táctil) para verificar, en un entorno propio, la conclusión de que la fuerza de punta de dedo no mejora el error más allá del ruido.
- Base para fine-tuning en tareas de pick-and-place bimanual: partir de los pesos entrenados con representación de estado de 38 dimensiones y adaptarlos a objetos o estanterías distintas con un dataset de teleoperación propio.
- Validación de infraestructura de inferencia robótica: medir latencia y throughput de una política de 3,6 B parámetros alimentada por 4 cámaras a 30 fps en bucle cerrado, útil para dimensionar hardware de control.
- Docencia y demostración de imitación con teleoperación: usar el pipeline completo (guante, seguimiento Vive, 4 cámaras) como banco de pruebas reproducible de aprendizaje por imitación.
- Auditoría metodológica de evaluaciones: emplear la tabla de error en bucle abierto publicada como referencia para verificar protocolos de evaluación que nunca se ejecutaron sobre hardware, tal y como advierte la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento reportado es el error de bucle abierto en los 6 episodios reservados (media |pred − acción registrada| en radianes, ± SEM, n=6):

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| este modelo (pi-0.5 + tactile) | 0,0448 ± 0,0040 | 0,0259 ± 0,0015 | 0,0570 ± 0,0087 | 0,0263 ± 0,0015 |
| hold-first-frame (referencia) | 0,3538 | 0,2351 | 0,2926 | 0,2373 |

Según la model card, este error mide seguimiento de trayectoria, no éxito de tarea, y ninguna de las evaluaciones se ejecutó sobre hardware. En el conjunto de cuatro familias por tres tareas, GR00T registró el error más bajo en todas las tareas.

## Requisitos de hardware

- VRAM en FP32: ≈14,5 GB solo para pesos (coincide con el tamaño del repo), más activaciones y los cuatro flujos de cámara; estimación práctica por encima de 16 GB.
- VRAM en FP16/BF16: ≈7,2 GB para pesos; en INT8 ≈3,6 GB; en INT4 ≈1,8 GB (ninguna de estas cuantizaciones está publicada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una A100 o H100 (40/80 GB) cubre FP32 con holgura para inferencia y espacio para otros componentes del robot.
- GPU de consumo: en BF16 el modelo (≈7,2 GB) cabría en una RTX 4090 (24 GB) o RTX 4080 (16 GB); en FP32 se acercaría al límite de una GPU de 16 GB y no cabría en tarjetas de 12 GB.
- Opciones de despliegue: no especificadas en la model card. Al tratarse de una política robótica con flujo de observación en bucle cerrado, el despliegue típico sería en PyTorch; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La restricción operativa relevante es que la política debe inferir un chunk de 16 acciones antes de que el robot consuma el bloque anterior a 30 fps (≈0,53 s por chunk).

## Comparativa con modelos similares

La model card enumera las familias de políticas entrenadas sobre el mismo dataset y tarea, lo que constituye la comparación más directa disponible. No se detallan parámetros ni contexto de las alternativas.

| Modelo | Familia | Táctil | Parámetros | Licencia | Error más bajo (según model card) |
|---|---|---|---|---|---|
| este modelo | pi-0.5 | Sí | 3,6 B | Gemma | No es la mejor de la comparativa |
| `...pi05260920` | pi-0.5 | No | No disponible | Gemma | No indicado |
| `...gr00t3b260920` | GR00T 3B | No | ~3 B (por nombre) | No disponible | Sí, en todas las tareas |
| `...gr00t3btactile260920` | GR00T 3B | Sí | ~3 B (por nombre) | No disponible | Sí, en todas las tareas |
| `...act260920` / `...acttactile260920` | ACT | No / Sí | No disponible | No disponible | No indicado |
| `...dp260920` / `...dptactile260920` | Diffusion Policy | No / Sí | No disponible | No disponible | No indicado |

## Limitaciones y advertencias

- Es un checkpoint de investigación para una única tarea; no es un modelo de propósito general ni un asistente conversacional.
- La model card advierte explícitamente de que la evaluación mide seguimiento de trayectoria, no éxito de tarea, y que nada se ejecutó sobre hardware real.
- La entrada táctil no aportó mejora medible sobre el ruido según el propio autor; conviene no asumir ganancias por añadir fuerza de punta de dedo.
- Dataset muy reducido: 54 episodios, con solo 6 reservados, lo que limita la significación estadística de los errores reportados.
- Riesgo de sobreajuste a la configuración física concreta (DexMate Vega-1, dos XHand1, guante meta-glove, cuatro cámaras a 640x360 y 30 fps).
- Licencia Gemma: impone las condiciones de uso de Google para modelos Gemma, con restricciones de uso comercial y obligaciones de atribución que deben revisarse antes de cualquier explotación.
- No hay información pública de sesgos, robustez ante cambios de iluminación, oclusiones o variaciones de la escena.
- Sin confirmación de cuantizaciones publicadas ni de soporte en motores de inferencia optimizados, el coste en VRAM en FP32 condiciona el despliegue.
- El autor no documenta etapas de alineamiento (RLHF/DPO) ni composición detallada del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05tactile260920
- Variante pi-0.5 sin táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05260920
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_act260920
- Variante ACT con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_acttactile260920
- Variante Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920
- Variante Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dptactile260920
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920
- Variante GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920
