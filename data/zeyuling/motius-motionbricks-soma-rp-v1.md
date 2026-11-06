# ZeyuLing/motius-motionbricks-soma-rp-v1

## Resumen

SOMA RP v1 es un checkpoint de generación de movimiento humano condicionada por pose, publicado por el usuario ZeyuLing bajo el paraguas del proyecto Motius. Se trata de una adaptación nativa en PyTorch del modelo MotionBricks de NVIDIA (repositorio oficial en NVlabs), convertido desde los pesos oficiales en SafeTensors y empaquetado en el formato propio de Motius. El modelo genera secuencias de movimiento para el esqueleto humano SOMA de 30 articulaciones, partiendo de un contexto de cuatro poses recientes y hasta cuatro poses objetivo, con una frecuencia nativa de 30 fps.

El problema que resuelve es la interpolación y generación de movimiento condicionada por pose (*in-betweening* y *pose-conditioned generation*) para humanos virtuales y robots. Frente a alternativas basadas en SMPL, este checkpoint trabaja con la representación SOMA de 366 dimensiones (posiciones, rotaciones 6D, velocidades y contactos de pie), lo que lo hace directamente utilizable en pipelines de animación y robótica sin conversiones intermedias. La implementación elimina dependencias de ONNX Runtime, TensorRT o del paquete Python upstream, y ofrece un runtime CUDA opcional basado en Warp para alineación en espacio de mundo y reconstrucción de pose.

Con 200.297.280 parámetros y un repositorio de 0,8 GB, es un modelo compacto orientado a inferencia en tiempo real. Su relevancia actual radica en que reproduce la arquitectura y ecuaciones del checkpoint oficial de NVIDIA manteniendo la atribución, y en que expone una API de pipeline (`MotionBricksReleasePipeline`) con contratos de entrada/salida documentados, lo que facilita su integración en herramientas de animación y simulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de generación de movimiento (pose-conditioned), implementación nativa en PyTorch de MotionBricks |
| Parametros totales | 200.297.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 poses recientes de contexto + hasta 4 slots objetivo; generación de 24–64 frames (18–58 tras recorte) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de movimiento, no lingüístico) |
| Licencia | nvidia-open-model-agreement |
| Formato de pesos | safetensors (formato nativo Motius) |

## Arquitectura y entrenamiento

El modelo es una adaptación de código fuente atribuida de MotionBricks (commit `54fc563aeaaf819a753d72cc9fdc6713989cdd43`), no un modelo entrenado desde cero. La implementación usa módulos nativos de PyTorch y carga los pesos oficiales convertidos a SafeTensors, preservando la arquitectura y las ecuaciones del checkpoint original. El *bundle* nativo (`MotionBricksReleaseBundle`) engloba pose, root, encoder, decoder y quantizer; la selección de longitud de raíz, el muestreo de tokens de pose y el ensamblado de condiciones residen en el pipeline. Los rasgos de movimiento, la normalización, la cinemática del G1 y la conversión de pose SOMA viven bajo `motius.motion`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card describe la adaptación y el empaquetado, no el proceso de entrenamiento original. La innovación técnica destacable es la representación SOMA de 366 dimensiones (root 5, posiciones 87, rotaciones 180, velocidades 90 y contactos de pie 4) en coordenadas Y-arriba y metros, junto con un runtime CUDA opcional basado en Warp que añade alineación en espacio de mundo, decodificación oficial de fronteras, filtrado de raíz del G1, corrección de extremos y reconstrucción/IK de pose local SOMA.

## Capacidades

- Generación de movimiento condicionada por pose para el esqueleto humano SOMA de 30 articulaciones.
- Interpolación de movimiento (*in-betweening*) a partir de contexto y objetivos: `infer_pose_inbetweening` devuelve `motions`, `foot_contacts`, `lengths`, `pred_num_tokens` y `fps=30`.
- Generación de movimiento para el robot Unitree G1 (29 DOF) mediante el checkpoint hermano y `infer_g1_inbetweening`, con qpos de 36 dimensiones y cuaterniones WXYZ por defecto.
- Control de longitud de generación: entre 24 y 64 frames en bruto, 18–58 tras el recorte por defecto de tres frames en cada extremo.
- Soporte de máscaras parciales de objetivo mediante el diccionario de tensores crudo (`infer_raw`), con máscaras binarias `has_global_root_values`, `has_local_root_values` y `has_local_poses`.
- Selección del número de tokens de predicción mediante `allowed_pred_num_tokens` (flags binarios para recuentos de 6 a 16).
- Runtime CUDA completo opcional: alineación en espacio de mundo, decodificación de fronteras, filtrado de raíz, contactos de pie con clamp, corrección de extremos, reconstrucción de pose local SOMA/IK, grabación y reproducción de movimiento.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo de movimiento, no de lenguaje.

## Casos de uso

- Animación de personajes en videojuegos: el modelo genera transiciones de movimiento entre poses clave con 30 fps nativos, lo que permite construir blends de animación sin captura adicional y con longitudes de 18–58 frames por llamada.
- Interpolación de capturas de movimiento (mocap): dado un contexto de cuatro poses y objetivos parciales, rellena los huecos de una secuencia capturada con oclusión o pérdida de marcadores, usando las máscaras binarias para indicar qué slots están disponibles.
- Control de robots humanoides Unitree G1: mediante el checkpoint G1 y `infer_g1_inbetweening` se obtienen qpos de 36 dimensiones en convención MuJoCo WXYZ, directamente utilizables en simulación o planificación de trayectorias.
- Previsualización en herramientas de autoría 3D: el runtime CUDA con Warp y carga de escenas USD permite alinear el movimiento generado en espacio de mundo y reproducirlo en una escena headless para revisión rápida.
- Generación de datos sintéticos para entrenamiento de políticas: el modelo puede producir secuencias de contacto de pie y movimiento coherentes que sirvan como datos aumentados para aprendizaje por refuerzo de locomotion.
- Integración en pipelines de posproducción: la API `save_pretrained` y el formato nativo Motius permiten exportar y versionar checkpoints, y el pipeline en CPU (`bundle_kwargs={"device": "cpu"}`) posibilita procesamiento por lotes sin GPU.
- Investigación en representaciones de movimiento: la salida de 366 dimensiones con posiciones, rotaciones 6D, velocidades y contactos facilita experimentos sobre representaciones alternativas a SMPL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 200,3 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,8 GB, por lo que la inferencia en CPU es viable y en GPU el consumo base es bajo.
- GPU recomendadas: no disponible en la documentación. El runtime completo requiere CUDA y Warp; el pipeline básico admite `device="cpu"` o `device="cuda"`.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM libre en FP32, aunque no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: librería `motius` (versión 0.3.23 o superior) con `Pipeline.from_pretrained`; runtime CUDA opcional vía `pip install -e '.[motionbricks-runtime]'`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Representación | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOMA RP v1 (este) | 200,3 M | SOMA 366D, 30 fps | 4 poses + 4 objetivos | nvidia-open-model-agreement | Hugging Face (ZeyuLing) |
| MotionBricks (NVIDIA, original) | no disponible | SOMA / G1 | 4 poses + 4 objetivos | no disponible en la información | NVlabs GitHub |
| G1 RP v1 (Motius) | no disponible | Unitree G1, qpos 36D | 4 poses + 4 objetivos | nvidia-open-model-agreement | Hugging Face (ZeyuLing) |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La licencia es `nvidia-open-model-agreement`, no una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El modelo es una adaptación de código fuente atribuida, no un modelo entrenado de forma independiente; su comportamiento depende enteramente del checkpoint oficial de NVIDIA.
- La salida de 366 dimensiones no son parámetros SMPL; integrarla en pipelines que esperan SMPL requiere conversión explícita.
- Los frames de relleno más allá de `4 * pred_num_tokens` no son movimiento válido y deben descartarse.
- El recorte por defecto elimina tres frames en cada extremo; con `trim_boundaries=False` se retienen todos los frames válidos, lo que puede afectar a la continuidad en los bordes.
- Las entradas deben ser poses reales en el espacio de coordenadas correcto (Y-arriba y metros para SOMA; Z-arriba para G1), y las convenciones de cuaterniones difieren entre `infer_raw` (XYZW) e `infer_g1_inbetweening` (WXYZ por defecto).
- No hay información sobre sesgos, tasas de alucinación ni cobertura de dominios de movimiento; al ser un modelo de movimiento, el riesgo principal es la generación de transiciones físicamente implausibles o inconsistencias de contacto.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria publicada.
- No se documentan requisitos mínimos de hardware, latencia ni throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ZeyuLing/motius-motionbricks-soma-rp-v1
- Checkpoint G1: https://huggingface.co/ZeyuLing/motius-motionbricks-g1-rp-v1
- Paper: https://arxiv.org/abs/2604.24833
- Repositorio oficial: https://github.com/NVlabs/motionbricks
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Modelo base: https://huggingface.co/nvidia/MotionBricks
