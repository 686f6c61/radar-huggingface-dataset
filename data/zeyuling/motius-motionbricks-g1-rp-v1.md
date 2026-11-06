# ZeyuLing/motius-motionbricks-g1-rp-v1

## Resumen

G1 RP v1 es un checkpoint de generación de movimiento pose-condicionada para el robot humanoide Unitree G1, empaquetado en formato nativo Motius. Lo publica el usuario ZeyuLing como adaptación del modelo MotionBricks de NVIDIA (NVlabs), del que hereda la arquitectura neuronal y los pesos convertidos a SafeTensors. No es un modelo de lenguaje: es un modelo generativo de secuencias de movimiento que produce trayectorias de 36 dimensiones (qpos) a 30 fps para un esqueleto de 29 grados de libertad.

El modelo resuelve el problema de interpolación y generación de movimiento entre poses objetivo (in-betweening), tomando como condición cuatro poses recientes de contexto y hasta cuatro slots de poses objetivo. La salida es una secuencia de entre 18 y 58 fotogramas tras el recorte por defecto de los fotogramas de borde. Está pensado para su uso en robótica humanoide, animación y control de personajes articulados.

Su relevancia actual radica en que ofrece una implementación en PyTorch nativo que elimina la dependencia de ONNX Runtime, TensorRT o el paquete Python original de MotionBricks, lo que simplifica el despliegue. El checkpoint tiene 194,5 millones de parámetros y un tamaño de repositorio de 0,8 GB, lo que lo hace manejable en hardware de consumo moderado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de generación de movimiento (arquitectura MotionBricks de NVIDIA, adaptada a PyTorch nativo) |
| Parámetros totales | 194.506.928 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 poses recientes de contexto + hasta 4 slots de poses objetivo; salida de 24–64 fotogramas brutos (18–58 tras recorte) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de movimiento, no de lenguaje) |
| Licencia | NVIDIA Open Model Agreement (license: other) |
| Formato de pesos | safetensors (formato nativo Motius) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MotionBricks de NVIDIA, que el bundle nativo de Motius reimplementa con módulos PyTorch y las ecuaciones oficiales del checkpoint. El bundle incluye pose, root, encoder, decoder y cuantizador. La generación se organiza en tokens de pose: la pipeline selecciona la longitud de root, muestrea tokens de pose y ensambla las condiciones. El modelo opera a 30 fps y produce qpos de 36 dimensiones con cuaterniones de root en convención WXYZ (MuJoCo) por defecto, o XYZW en la API raw.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no los detalla. La adaptación de Motius integra la release oficial de MotionBricks en el commit `54fc563aeaaf819a753d72cc9fdc6713989cdd43` y no requiere ONNX Runtime, el paquete Python original, Newton ni TensorRT. El runtime CUDA completo opcional usa Warp para la escena y USD para la carga de escenas SOMA.

## Capacidades

- Generación de movimiento pose-condicionada para el robot Unitree G1 (29 DOF) con qpos de 36 dimensiones.
- Interpolación de movimiento entre poses (in-betweening) a partir de 4 poses de contexto y hasta 4 poses objetivo.
- Generación de secuencias de 24–64 fotogramas brutos, con recorte por defecto de 3 fotogramas en cada extremo (18–58 válidos).
- Soporte de máscaras parciales de objetivos mediante la API de diccionario de tensores raw.
- Control de longitud de predicción mediante `allowed_pred_num_tokens` (flags binarios para conteos de 6 a 16 tokens).
- Salida de contactos de pies (`foot_contacts`) junto con las poses.
- Runtime CUDA opcional con alineación en espacio de mundo, decodificación oficial de bordes, filtrado de root de G1, corrección de endpoints y reconstrucción de pose local SOMA/IK.
- Conversión de convención de cuaterniones (WXYZ por defecto, XYZW configurable).
- No soporta tool calling, agentes, multilingüismo ni modalidades de texto, visión o audio.

## Casos de uso

- Control de robots humanoides Unitree G1 en laboratorio: el modelo genera trayectorias de qpos a 30 fps que pueden enviarse directamente al controlador del robot para ejecutar movimientos interpolados entre poses capturadas, gracias a su representación nativa en 36D compatible con MuJoCo.
- Animación de personajes articulados en pipelines de producción: integrado vía `Pipeline.from_pretrained`, permite generar transiciones de movimiento entre keyframes con contexto de 4 poses, adecuado para previsualización rápida en CPU o GPU.
- Investigación en generación de movimiento: el formato nativo PyTorch y la ausencia de dependencias de ONNX/TensorRT facilitan la experimentación y el ajuste fino sobre el checkpoint, con acceso a tensores raw mediante `infer_raw`.
- Teleoperación asistida y retargeting: la conversión entre SOMA (30 joints) y G1 (29 DOF) incluida en `motius.motion` permite adaptar movimientos capturados de humanos a la cinemática del robot.
- Simulación y entrenamiento de políticas de refuerzo: las secuencias generadas pueden servir como datos de demostración o como referencias en entornos simulados con MuJoCo, dado el formato qpos estándar.
- Edición de movimiento en postproducción: la API de máscaras parciales permite fijar solo algunos objetivos (por ejemplo, pies o manos) y dejar que el modelo complete el resto de la pose, útil para correcciones localizadas.
- Generación de datasets sintéticos de movimiento para G1: el modelo puede producir variaciones de interpolación entre poses semilla para aumentar corpus de entrenamiento de controladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 194,5 M de parámetros en FP32 el peso ronda los 0,78 GB, por lo que la inferencia en CPU es viable según la model card (`bundle_kwargs={"device": "cpu"}`).
- GPU recomendadas: no especificadas; cualquier GPU con suficiente memoria para el modelo y el runtime Warp opcional. El runtime CUDA completo requiere Warp.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con al menos unos pocos GB de VRAM, dado el tamaño del checkpoint (0,8 GB de repo).
- Opciones de despliegue: librería Motius (`Pipeline.from_pretrained`), con dispositivo CPU o CUDA; runtime CUDA opcional con Warp y USD para escenas SOMA. No requiere ONNX Runtime, TensorRT ni el paquete original de MotionBricks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / condición | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G1 RP v1 (este) | 194,5 M | 4 poses contexto + 4 objetivos | qpos 36D, 30 fps, 18–58 frames | NVIDIA Open Model Agreement | Hugging Face (ZeyuLing) |
| MotionBricks SOMA RP v1 | no disponible | 4 poses contexto + 4 objetivos | features 366D, 30 fps | NVIDIA Open Model Agreement | Hugging Face (ZeyuLing) |
| MotionBricks original (nvidia) | no disponible | mismo esquema | mismo esquema | NVIDIA Open Model Agreement | Hugging Face (nvidia/MotionBricks) |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de información sobre alternativas de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo específico para el esqueleto Unitree G1 (29 DOF); no es transferible directamente a otros robots o esqueletos sin retargeting.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-step.
- Requiere que las poses de entrada sean poses reales de G1 en el mismo espacio de coordenadas Z-up; entradas mal alineadas producirán resultados inválidos.
- Los fotogramas de padding tras `4 * pred_num_tokens` no son movimiento válido y deben descartarse.
- El recorte por defecto elimina 3 fotogramas en cada extremo; para conservar todos los fotogramas válidos hay que usar `trim_boundaries=False`.
- Licencia NVIDIA Open Model Agreement: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia de código abierto estándar.
- No se han publicado datos de sesgos, tasas de alucinación (en el sentido de movimientos no físicos) ni evaluaciones de robustez en la información disponible.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.
- El runtime CUDA completo depende de Warp y USD, lo que añade complejidad de despliegue frente a la inferencia básica en CPU.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/ZeyuLing/motius-motionbricks-g1-rp-v1
- Checkpoint SOMA: https://huggingface.co/ZeyuLing/motius-motionbricks-soma-rp-v1
- Modelo base: https://huggingface.co/nvidia/MotionBricks
- Paper: https://arxiv.org/abs/2604.24833
- Repositorio oficial: https://github.com/NVlabs/motionbricks
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
