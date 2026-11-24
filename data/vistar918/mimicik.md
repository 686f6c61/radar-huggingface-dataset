# vistar918/MimicIK

## Resumen

MimicIK es una colección de checkpoints de investigación para cinemática inversa (inverse kinematics, IK) aprendida en robots manipuladores, publicada por el usuario vistar918 bajo el paraguas del código NatureIK. No se trata de un modelo de lenguaje, sino de un conjunto de políticas neuronales que mapean una observación de 20 dimensiones (juntas actuales, pose actual del efector final y pose objetivo) a un comando de 6 dimensiones de incremento de juntas. El repositorio reúne 187 ficheros de pesos organizados en ocho familias de experimentos: MIP/SuDeepDiT, ChiUNet, MLP puro, UNet de difusión, RoboTwin, ablaciones de pérdida FK, recuperación y comparativas de estrategia de actualización.

La relevancia del release está en la documentación extremadamente cuidadosa de la semántica experimental: el autor distingue explícitamente entre profundidad de arquitectura, número de evaluaciones del sampler MIP y número de pasos del optimizador, y detalla cómo los checkpoints históricos de mayo de 2026 usaban una estrategia de actualización `legacy_two_step` que difiere del entrenamiento conjunto actual. Esa trazabilidad es poco habitual en releases de robótica y facilita la reproducción.

El repositorio ocupa 48,9 GB lógicos (antes de deduplicación Xet) y se complementa con un paquete portable independiente, RedAmancy918/MimicIK, que incluye inferencia, entrenamiento, FK opcional y evaluación con estado y feedback grabados. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MIP/SuDeepDiT (transformer con sampler de flow matching), ChiUNet, UNet de difusión, MLP puro |
| Parametros totales | no disponible (depende del checkpoint; SuDeepDiT de ejemplo con 8 capas transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 20D) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pt; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors y PyTorch (.pt); bundles portables en JSON+safetensors |

## Arquitectura y entrenamiento

El núcleo de la colección son los checkpoints MIP/SuDeepDiT, una arquitectura transformer (por ejemplo, 8 capas) con un sampler de flow matching que realiza exactamente dos evaluaciones de red en inferencia: una predicción gruesa desde cero y un refinamiento en t=0.9. Junto a ellos conviven variantes ChiUNet, UNet de difusión propias de diffusion policy y baselines MLP puros, todas entrenadas con la base de código NatureIK. La interfaz es fija: observación de 20 dimensiones compuesta por 6 juntas actuales, 7 de pose actual del efector final (XYZ + cuaternión XYZW) y 7 de pose objetivo, con acción de 6 dimensiones de delta de juntas en metros y radianes, sobre el activo cinemático `play_g2_usb_cam` y el enlace `end_link`.

El entrenamiento combina una pérdida MIP con una pérdida de cinemática directa (FK) ponderada, por ejemplo `MIP loss + 0.1 * FK loss`. La documentación distingue dos estrategias de actualización: `joint`, con un único backward y un único paso de AdamW por paso externo, y `legacy_two_step`, que realiza un paso MIP con limpieza de gradiente y actualización EMA, avance de scheduler y un paso FK separado con la nueva tasa de aprendizaje, sin limpieza ni EMA posterior. Los checkpoints históricos de mayo de 2026 usan la segunda; para reproducirlos con el código actual debe activarse `task.fk_update_strategy=legacy_two_step`. Se documentan ablaciones de peso de pérdida FK, comparativas NoStatic y ejecuciones de recuperación, con 64 ficheros YAML de configuración y procedencia.

## Capacidades

- Predicción de cinemática inversa de un brazo: dado el estado articular y las poses actual y objetivo del efector final, genera un comando de 6 incrementos de junta.
- Control de doble brazo por composición: el servicio dual evalúa dos observaciones de un brazo con `batch=2` y combina las dos salidas de 6D con dos valores externos de pinza para formar un comando de 14D.
- Soporte de evaluación con cinemática directa (FK) opcional para verificar la coherencia de las predicciones.
- Evaluación con estado y feedback grabados, útil para comparar políticas sobre trayectorias reales.
- Variantes de arquitectura intercambiables: transformer con flow matching, UNet de difusión, ChiUNet y MLP puro para comparar coste y precisión.
- Entrenamiento reproducible mediante configuraciones Hydra y trazabilidad de procedencia por checkpoint.
- No incluye predicción de pinza: las dimensiones de gripper se aportan externamente en el servicio dual.
- No soporta tool calling, agentes, texto, visión ni audio; es un modelo específico de robótica.

## Casos de uso

- Control de manipulador de un brazo en lazo cerrado: el checkpoint recibe la pose objetivo del efector final y devuelve deltas articulares de 6D que un controlador de bajo nivel aplica a 100-500 Hz; la precisión reportada de 2,25 mm de error medio de posición lo hace adecuado para tareas de pick-and-place de precisión media.
- Servicio de doble brazo con pinzas externas: el patrón `batch=2` más dos valores de gripper permite operar un robot dual sin entrenar un modelo específico de 14D, reutilizando los checkpoints de un brazo.
- Investigación en imitación y diffusion policy: las variantes UNet de difusión y ChiUNet sirven como línea base para comparar flow matching frente a difusión en la misma tarea de IK.
- Reproducción de experimentos: las configuraciones YAML y la distinción entre `joint` y `legacy_two_step` permiten replicar resultados históricos y auditar el efecto de la estrategia de actualización del optimizador.
- Evaluación offline de políticas: el paquete portable con estado y feedback grabados permite puntuar checkpoints sobre episodios registrados antes de desplegarlos en hardware.
- Ablaciones de pérdida FK: los checkpoints de `fk_weight_ablation` permiten estudiar cuánto aporta la supervisión cinemática directa a la precisión de la IK aprendida.
- Integración en pipelines de simulación a real: el formato safetensors y la licencia MIT facilitan empaquetar el modelo en un servicio de inferencia propio (por ejemplo, un servidor gRPC) dentro de un stack ROS 2.

## Benchmarks y rendimiento

La model card reporta una comparativa controlada sobre el subconjunto de validación NoStatic tok2 (224 episodios, 61.317 fotogramas), con métrica de rotación SO(3) relativa al objetivo corregida y medias macro por episodio:

| Estrategia | Pasos externos | Pasos AdamW | Val loss MIP final | Pos. media (mm) | P95 (mm) | Rotación (grados) | SR@5mm |
|---|---:|---:|---:|---:|---:|---:|---:|
| `joint` (referencia) | 300k | 300k | 0,014432 | 2,25 | 3,02 | 0,16 | 99,60% |
| `legacy_two_step` | 300k | 600k | 0,012258 | 2,24 | 2,96 | 0,15 | 99,66% |

El bootstrap emparejado por episodio (200.000 remuestreos) sitúa la mejora de posición media en -0,015442 mm con intervalo del 95% de [-0,022630, -0,008321] mm, es decir, unos 15,4 micrómetros: estadísticamente distinguible en este subconjunto pero de magnitud despreciable. El peor fotograma global fue peor para `legacy_two_step` (13,941 mm frente a 11,815 mm). El autor advierte que no es una ablación pura de pérdida, porque la fórmula es idéntica y lo que cambia es el número de actualizaciones de AdamW y el cómputo FK extra. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 48,9 GB de repositorio repartidos en 187 ficheros, cada checkpoint individual es pequeño; los UNet de difusión de `natureik_unet` concentran 30,57 GB en 30 ficheros, lo que sugiere pesos del orden de cientos de MB a pocos GB por checkpoint.
- GPU recomendadas: no documentadas por el autor. Por el tamaño típico de estas políticas, una RTX 4090 (24 GB) o incluso GPUs de 8-16 GB deberían alojar un checkpoint individual con holgura; para entrenamiento conviene A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí para inferencia de un único checkpoint, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: el paquete portable RedAmancy918/MimicIK con inferencia y entrenamiento en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el sampler MIP realiza exactamente dos evaluaciones de red por predicción, lo que acota el coste por paso; no se publican cifras de latencia ni de frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| MimicIK (este) | Colección IK aprendida (flow matching, difusión, MLP) | 20D a 6D delta de juntas | MIT | Hugging Face + GitHub |
| Diffusion Policy (referencia académica) | Política de difusión para imitación | Observaciones variables a acciones | MIT (implementación de referencia) | Repositorio público |
| ACT / ALOHA | Transformer de imitación para brazos | Imágenes y estado a acciones | MIT | Repositorio público |
| IK analítica (por ejemplo, TRAC-IK) | Solver geométrico | Pose a juntas | BSD | Bibliotecas ROS |

No se dispone de comparativas numéricas directas con estas alternativas en la información proporcionada; la comparación es cualitativa y por categoría.

## Limitaciones y advertencias

- Modelo específico de robótica: no procesa texto, imágenes ni audio, y su interfaz está fijada a 20D de entrada y 6D de salida sobre un activo cinemático concreto (`play_g2_usb_cam`, enlace `end_link`).
- No predice la pinza: en el servicio dual, las dos dimensiones de gripper deben aportarse externamente.
- Precisión dependiente del checkpoint: los mejores resultados reportados (2,24-2,25 mm de error medio, SR@5mm en torno al 99,6%) corresponden a configuraciones concretas; otras familias del zoo no tienen métricas publicadas en la información disponible.
- Riesgo de generalización limitado: al ser checkpoints de investigación entrenados sobre conjuntos concretos, el comportamiento fuera de la distribución de entrenamiento no está caracterizado.
- Semántica de checkpoints delicada: los ficheros `*-final.pt` incluyen el `val_loss` histórico mejor de la ejecución en el nombre, que puede no coincidir con la pérdida del paso final; conviene no usarlo como criterio de selección sin verificar.
- Los checkpoints históricos requieren `task.fk_update_strategy=legacy_two_step` para reproducirse con el código actual; de lo contrario, los resultados no serán comparables.
- El conjunto de evaluación NoStatic es de validación, no de test independiente, y la mejora observada entre estrategias es de micrómetros, sin relevancia práctica para despliegue.
- Sesgos y alucinaciones: no aplican en el sentido de modelos de lenguaje, pero sí existe riesgo de predicciones fuera de rango articular si no se aplican límites físicos en el controlador.
- Licencia MIT: permite uso comercial y modificación sin restricciones adicionales, pero no hay garantías ni soporte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/vistar918/MimicIK
- Paquete portable: https://github.com/RedAmancy918/MimicIK
- Código fuente NatureIK: https://github.com/RedAmancy918/NatureIK
- Bundles v0.1.0: releases/v0.1.0/README.md (dentro del repositorio portable)
- Revisión ejecutable de entrenamiento/evaluación: `fd6f8d026475b1cd0da01a1ea1aa41b015faa348`
- Revisión de documentación y auditoría de semántica experimental: `e66b7b389cae9eba4012fabedd9c0c9534a4f8d2`
