# twanghcmut/gr00t-n1d7-so101-bimanual-fold-towel

## Resumen

GR00T N1.7 sobre SO-101 bimanual es un ajuste fino del modelo vision-language-action (VLA) de NVIDIA `nvidia/GR00T-N1.7-3B`, especializado en una unica tarea robotica: doblar una toalla azul por la mitad con dos brazos SO-101. Lo publica el usuario `twanghcmut` y esta entrenado con el trainer oficial Isaac-GR00T (commit `23ace64`) sobre el dataset `hungho77/so101_bimanual_fold_towel_depth_v2`. El modelo resuelve el problema de convertir instrucciones en lenguaje natural y observaciones visuales en secuencias de acciones de control de bajo nivel para un robot bimanual de bajo coste.

Se trata de un modelo de 3.144.016.000 parametros (3B) en formato safetensors, con un repositorio de 12,6 GB. La tarea concreta es "Fold the blue towel in half from front to back with both arms", con 51 episodios y 142.248 fotogramas a 30 fps. El embodiment es `NEW_EMBODIMENT` con configuracion de modalidad `so101_bimanual_config.py`, tres camaras (`top`, `left_wrist`, `right_wrist`) y un horizonte de accion de 16 pasos (0,53 s a 30 fps).

Es relevante ahora porque demuestra el flujo completo de ajuste fino de un VLA de NVIDIA sobre un brazo robotico de bajo coste y codigo abierto, con datos de demostracion teleoperados. No obstante, la propia model card advierte de que no existe evaluacion en robot real y que las metricas presentadas son ajustes in-sample sobre datos de entrenamiento, no tasas de exito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en NVIDIA Isaac GR00T N1.7; detalles internos de capas no disponibles |
| Parametros totales | 3.144.016.000 (3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles en el dataset) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | safetensors |
| Embodiment | SO-101 bimanual (`NEW_EMBODIMENT`, `so101_bimanual_config.py`) |
| Estado / accion | `left_arm` 5 + `left_gripper` 1 + `right_arm` 5 + `right_gripper` 1 (grados; gripper 0-100) |
| Representacion de accion | Brazos RELATIVE, pinzas ABSOLUTE; `get_action` devuelve objetivos absolutos |
| Camaras | `top`, `left_wrist`, `right_wrist` |
| Horizonte de accion | 16 pasos (0,53 s a 30 fps) |
| Tamano del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `nvidia/GR00T-N1.7-3B`, un VLA de NVIDIA disenado para control robotico generalista. La informacion proporcionada no detalla la arquitectura interna (capas, atencion, tokenizador visual), por lo que no se puede confirmar si emplea transformer denso, MoE o componentes hibridos. El ajuste se realizo con el trainer oficial Isaac-GR00T (commit `23ace64`), lo que garantiza compatibilidad con el pipeline de entrenamiento de NVIDIA.

El entrenamiento uso 51 episodios (142.248 fotogramas a 30 fps, 80-111 s por episodio) convertidos de LeRobot v3.0 a v2.1 con copia de video sin reencode y eliminando el stream `left_top_depth`. La configuracion fue de 6.000 pasos con batch 128 (32 x 4 de acumulacion), learning rate 1e-4, 5% de warmup, weight decay 1e-5 y color jitter. El `episode_sampling_rate` fue 0,5 y `shard_size` 2048; el cargador de GR00T decodifica un episodio completo por slice (unos 19 s y 6,6 GB de RAM para episodios de 90 s), de modo que cada paso del optimizador mezcla solo unos 4-6 episodios. Se entreno en una H100 de 80 GB durante 4,0 horas. La perdida evoluciono de 0,069 (paso 500) a 0,0202 de media final. No se menciona RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de acciones de control bimanual para el embodiment SO-101: 12 dimensiones (5 brazo izquierdo + 1 pinza izquierda + 5 brazo derecho + 1 pinza derecha).
- Percepcion visual multimodal con tres camaras: vista superior y munecas izquierda y derecha.
- Ejecucion de una tarea especifica de manipulacion: doblar una toalla azul por la mitad de delante hacia atras.
- Prediccion de horizontes de accion de 16 pasos (chunks), con llamada a la politica cada 16 pasos.
- Interpretacion de instrucciones en lenguaje natural (la tarea esta descrita en ingles en el dataset).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision general, audio: no disponible (la vision esta limitada a las camaras del robot).

## Casos de uso

- Investigacion en manipulacion bimanual de bajo coste: sirve como punto de partida para reproducir el flujo de ajuste fino de un VLA de NVIDIA sobre brazos SO-101, usando el trainer Isaac-GR00T y el dataset publico como referencia.
- Prototipado de tareas de doblado de tejidos: el modelo puede ejecutar la politica de doblar una toalla en un entorno controlado con camaras cenital y de muneca, util para estudiar el comportamiento de politicas VLA en tareas deformables.
- Base para ajustes finos adicionales: al ser un derivado de GR00T N1.7 3B con configuracion de modalidad documentada, se puede reentrenar sobre nuevos datasets de SO-101 bimanual manteniendo el mismo embodiment.
- Evaluacion comparativa de VLA: la model card incluye comparacion con π0.5 sobre los mismos datos, lo que permite usar este checkpoint como referencia en estudios comparativos de politicas de accion.
- Docencia y formacion en robotica: util para explicar el pipeline completo de datos LeRobot, conversion de versiones, configuracion de modalidad y evaluacion open-loop de politicas.
- Analisis de errores de pinza: la model card identifica que el error de pinza (0,625) no mejora al baseline "hold" (0,630), por lo que puede usarse como caso de estudio para depurar el timing de las pinzas en politicas bimanuales.
- Integracion en simulacion: el checkpoint puede cargarse en entornos simulados compatibles con GR00T para validar politicas antes de desplegar en hardware real.

## Benchmarks y rendimiento

Evaluacion open-loop in-sample sobre 4 episodios de entrenamiento (0, 17, 34, 50), episodios completos (2.460-3.328 pasos), politica llamada cada 16 pasos. MAE en unidades del dataset (grados; pinza 0-100); nMAE divide por la desviacion absoluta media de acciones 26,374.

| Modelo | all 12 | left arm 5 | right arm 5 | grippers 2 | nMAE | first 400 steps |
|---|---|---|---|---|---|---|
| π0.5 | 0,965 | 0,844 | 1,270 | 0,505 | 3,66% | 0,933 |
| GR00T N1.7 (este checkpoint) | 1,296 | 1,211 | 1,649 | 0,625 | 4,91% | 1,236 |
| hold baseline | 1,905 | 1,918 | 2,403 | 0,630 | 7,22% | 1,561 |

Los 51 episodios se usaron para entrenamiento (sin split de validacion): son comprobaciones de ajuste sobre datos de entrenamiento, no tasas de exito. No existe resultado en robot real para este checkpoint. El error de pinza (0,625) no mejora al baseline "hold" (0,630), mientras que π0.5 alcanza 0,505.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 12,6 GB en safetensors, por lo que en precision completa se requiere al menos ese orden de magnitud, y mas con overhead de activaciones y vision.
- GPU recomendadas: el entrenamiento se realizo en 1 x H100 80GB durante 4,0 h; para inferencia se puede usar hardware de menor capacidad, pero no se especifican modelos concretos.
- Cabe en GPU consumer: no disponible (no se documenta).
- Opciones de despliegue: trainer oficial Isaac-GR00T (commit `23ace64`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VLA de robotica).
- Latencia y throughput: no disponibles; el horizonte de accion es de 16 pasos (0,53 s a 30 fps), lo que da una idea de la frecuencia de llamada a la politica, pero no del coste computacional por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | MAE all 12 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GR00T N1.7 SO-101 bimanual (este) | 3B | Doblar toalla bimanual SO-101 | no disponible | 1,296 | NVIDIA Open Model License | Hugging Face (`twanghcmut/gr00t-n1d7-so101-bimanual-fold-towel`) |
| π0.5 SO-101 bimanual | no disponible | Doblar toalla bimanual SO-101 | no disponible | 0,965 | no disponible | Hugging Face (`twanghcmut/pi05-so101-bimanual-fold-towel`) |
| hold baseline | no aplica | Repetir accion del chunk | no aplica | 1,905 | no aplica | no aplica |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No existe evaluacion en robot real: las metricas son open-loop in-sample sobre datos de entrenamiento, no tasas de exito.
- Todos los episodios (51) se usaron para entrenamiento, sin split de validacion, por lo que las metricas pueden estar sobreajustadas.
- El error de pinza (0,625) no mejora al baseline "hold" (0,630); la model card recomienda revisar el timing de las pinzas antes de confiar en el modelo.
- El modelo esta especializado en una unica tarea y un unico embodiment (SO-101 bimanual con tres camaras concretas); no es generalista.
- La licencia NVIDIA Open Model License puede imponer restricciones para uso comercial; es necesario revisar el archivo `LICENSE` del repositorio.
- El modelo base es de NVIDIA y este checkpoint es un derivado, por lo que se heredan las condiciones de la licencia original.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma; al ser un modelo de robotica, el riesgo principal es el fallo fisico en la manipulacion.
- El cargador de GR00T decodifica episodios completos por slice (6,6 GB de RAM para episodios de 90 s), lo que limita la mezcla efectiva a 4-6 episodios por paso del optimizador y puede afectar a la diversidad del entrenamiento.
- No se dispone de informacion sobre cuantizacion ni sobre latencia real de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-bimanual-fold-towel
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101_bimanual_fold_towel_depth_v2
- Checkpoint comparable π0.5: https://huggingface.co/twanghcmut/pi05-so101-bimanual-fold-towel
