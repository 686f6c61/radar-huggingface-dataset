# zhicao/egocentric-handpose

## Resumen

`zhicao/egocentric-handpose` es un repositorio de codigo fuente (no un modelo con pesos alojados) que implementa un pipeline offline de estimacion de pose bimanual en video egocentrico. Lo publica el usuario `zhicao` y combina tres componentes de terceros: el detector open-vocabulary YOLO-World, el estimador de pose de manos AnyHand-WiLoR (backbone ViT con cabeza de refinamiento que produce parametros MANO) y el modelo parametrico de mano MANO. El repositorio no redistribuye ninguno de esos pesos: solo incluye el codigo de orquestacion, decodificacion de video MCAP, tracking y exportacion de resultados.

El problema que resuelve es el procesamiento por lotes de grabaciones egocentricas almacenadas en formato MCAP con flujo H.264, extrayendo la vista estereo izquierda y estimando ambas manos en cada fotograma. Anade tracking CSRT por mano, refresco programado del detector, recuperacion con compuerta y rechazo de saltos o fusiones de identidad, ademas de un filtro EKF causal opcional sobre los parametros MANO. La salida es un JSONL con joints 3D de 21 puntos, parametros MANO y metadatos de secuencia.

Es relevante para equipos de robotica y vision que necesitan reconstruir manipulacion manual a partir de datos egocentricos ya capturados, sin depender de un servicio propietario. No es un modelo entrenado por el autor ni una contribucion arquitectonica: es una utilidad de inferencia reproducible con requisitos de assets externos y una pila de licencias heterogenea que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de inferencia: YOLO-World (deteccion) + AnyHand-WiLoR (ViT con cabeza de refinamiento, parametros MANO) + MANO (modelo parametrico de mano) |
| Parametros totales | no disponible (no se publican los tamanos de los checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por fotograma; el estado se mantiene via tracking entre fotogramas) |
| Tipos de cuantizacion | no disponible; el codigo expone un flag `--fp16` para inferencia en media precision |
| Idiomas soportados | no disponible (no procesa lenguaje; la deteccion usa vocabulario CLIP de YOLO-World) |
| Licencia | `other` / `component-licenses`: AnyHand CC0 1.0, WiLoR CC BY-NC-ND 4.0, YOLO-World GPLv3, MANO con terminos propios |
| Formato de pesos | checkpoints de PyTorch cargados desde `weights/`; MANO convertido de pickle a tensor con `mano_pkl_to_pt.py`; no se redistribuyen |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Es un orquestador de inferencia compuesto por etapas encadenadas: `mcap_video.py` decodifica el flujo H.264 de un fichero MCAP y entrega la vista izquierda en las marcas de tiempo solicitadas; `WiLoR/detectors/yolo_world/` ejecuta deteccion de manos open-vocabulary sobre la vista completa con fallback a media vista; `tracking.py` mantiene un tracker CSRT por mano con refresco programado del detector, recuperacion con compuerta y rechazo de fusiones o saltos; y `WiLoR/` aplica un backbone ViT con cabeza de refinamiento que emite parametros MANO, 21 joints 3D y malla de mano.

Sobre esa base, `sequence.py` transporta el estado de los trackers, los identificadores de mano y la planificacion del detector entre grabaciones numeradas, de modo que el modo directorio ordena los ficheros numericamente y conserva la identidad salvo discontinuidad real (hueco temporal superior a `--track-max-gap`, numeros de fichero ausentes o cambio de configuracion de camara). `pose_filter.py` ofrece un EKF causal de error-estado sobre MANO para suavizado opcional. La salida se materializa en `process_poses.py` y `render.py` como filas JSONL y, si se activa `HANDPOSE_PREVIEW=1`, fotogramas de overlay y video de previsualizacion. No se documentan datos de entrenamiento, numero de tokens ni fases de RLHF/DPO porque el autor no entrena ningun componente.

## Capacidades

- Estimacion de pose bimanual 3D en video egocentrico, con 21 joints por mano en metros relativos a la raiz.
- Prediccion de parametros MANO completos: `mano_global_orient` (3x3), `mano_hand_pose`, `mano_betas`, `cam_t` y vertices de malla.
- Deteccion open-vocabulary de manos mediante YOLO-World con vocabulario CLIP, con fallback a media vista cuando la deteccion en vista completa falla.
- Tracking multi-mano con CSRT o KCF (seleccionable por `HANDPOSE_TRACKER`), refresco programado del detector, recuperacion con compuerta y rechazo de saltos y fusiones de identidad.
- Continuidad de identidad entre grabaciones numeradas mediante `sequence_id`, `tracking_segment_id` y `recording_number`.
- Suavizado causal opcional de la secuencia MANO mediante EKF de error-estado (`--pose-filter ekf`).
- Decodificacion de flujo H.264 embebido en MCAP y remuestreo configurable (`--sample-hz`, `--all-frames`, `--max-frames`, `--duration`).
- Exportacion a JSONL por fotograma y render opcional de overlay y video de previsualizacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un pipeline de vision.

## Casos de uso

- Reconstruccion de manipulacion en datasets de robotica egocentrica: procesar sesiones MCAP ya grabadas con camara estereo para obtener trayectorias de ambas manos y mallas MANO utilizables en aprendizaje por imitacion, aprovechando el modo directorio para mantener la identidad de cada mano a lo largo de grabaciones numeradas.
- Anotacion automatica de corpus de video egocentrico: generar JSONL con joints 3D y parametros MANO como pseudoetiquetas para entrenar o evaluar modelos de pose de manos, con `--sample-hz` para controlar el coste de anotacion.
- Analisis de destreza manual en entornos industriales o de laboratorio: extraer la cinematica de ambas manos en tareas de ensamblaje y comparar segmentos mediante `tracking_segment_id`, con el EKF causal para reducir ruido en las series temporales.
- Teleoperacion y retargeting diferido: usar los parametros MANO y los vertices exportados para reproducir el movimiento de un operador humano sobre una mano robotica o un avatar, aceptando que `cam_t` solo es valido para geometria relativa.
- Investigacion en interaccion mano-objeto: combinar las mallas de mano con detecciones de objeto en el mismo fotograma para estudiar contactos y agarres, dado que la salida incluye bounding boxes y vertices por mano.
- Validacion de pipelines de captura: ejecutar el pipeline sobre sesiones MCAP de prueba con `--max-frames` y `--duration` para verificar sincronizacion, resolucion y continuidad de tracking antes de procesar lotes grandes.
- Generacion de material visual para revision cualitativa: activar `HANDPOSE_PREVIEW=1` para producir fotogramas de overlay y video de previsualizacion que permitan inspeccionar fallos de deteccion o deriva del tracker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica el tamano de los checkpoints de YOLO-World ni de AnyHand-WiLoR, por lo que no se puede dar una cifra fiable.
- GPU recomendadas: no disponibles en la documentacion. El codigo acepta `--device cuda` y `--fp16`, lo que sugiere ejecucion en GPU NVIDIA con soporte de media precision.
- Cabe en GPU de consumo: no confirmado; depende del checkpoint de WiLoR y del modelo YOLO-World elegido, que no se especifican.
- Opciones de despliegue: ejecucion directa con `python run.py` tras `pip install -r requirements.txt` (requiere `opencv-contrib-python` por el tracker CSRT) y `python prepare_weights.py --assets /path/to/model-assets`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles. El rendimiento depende del remuestreo (`--sample-hz`), del numero de hilos (`--threads`) y de si se activa el filtro EKF o el render de previsualizacion.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zhicao/egocentric-handpose` | Pipeline de inferencia sobre YOLO-World + AnyHand-WiLoR + MANO | Video H.264 en MCAP, vista estereo izquierda | JSONL con 21 joints 3D, parametros MANO, malla, bbox | Component-licenses (CC0, CC BY-NC-ND 4.0, GPLv3, terminos MANO) | Codigo en HF; pesos no redistribuidos |
| EggHand (CVPR 2026) | Modelo fundacional multimodal para pronostico de pose de mano egocentrica | no disponible en la informacion | no disponible en la informacion | no disponible | Paper en el repositorio open access de CVPR 2026 |
| `zhicao/neural_contact` | Predictor de contacto (EgoForce) | no disponible en la informacion | Prediccion de contacto | MIT | Pesos y codigo en HF |

La comparacion directa con EggHand no es posible con los datos disponibles: EggHand se presenta como modelo fundacional para pronostico de pose, mientras que este repositorio es una utilidad de inferencia offline sin pesos propios. `neural_contact`, del mismo autor, aborda una tarea distinta (prediccion de contacto) y si publica pesos con licencia MIT.

## Limitaciones y advertencias

- El repositorio contiene solo codigo fuente: sin los siete ficheros de `weights/` (checkpoint y config de AnyHand-WiLoR, checkpoint y vocabulario CLIP de YOLO-World, modelo MANO derecho) el pipeline no funciona. Cada asset debe obtenerse de su fuente original bajo sus propios terminos.
- MANO exige registro en https://mano.is.tue.mpg.de y no puede redistribuirse; `mano_pkl_to_pt.py` convierte el pickle registrado al tensor que carga el codigo.
- La licencia WiLoR es CC BY-NC-ND 4.0, lo que prohibe el uso comercial y las obras derivadas de ese componente. YOLO-World es GPLv3, con las obligaciones de copyleft asociadas. El conjunto no otorga derechos adicionales.
- Solo se estima la mano derecha del modelo MANO: el pipeline procesa ambas manos visualmente, pero el asset MANO listado es el de mano derecha.
- `cam_t` es una traslacion de perspectiva debil cuya escala depende de la distancia focal asumida; solo sirve para geometria relativa, no para profundidad absoluta. Los `joints_3d` son relativos a la raiz y en metros.
- El pipeline es offline y trabaja sobre MCAP con H.264; no se documenta soporte para otros contenedores o codecs.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluacion cuantitativa de precision, al no existir benchmarks en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.
- El tracking CSRT puede derivar o intercambiar identidades en oclusiones prolongadas; el codigo mitiga fusiones y saltos, pero no se documenta su comportamiento en escenarios de oclusion severa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhicao/egocentric-handpose
- Repositorio relacionado del mismo autor (`neural_contact`): https://huggingface.co/zhicao/neural_contact
- Paper EggHand (CVPR 2026), referencia de la busqueda web: https://openaccess.thecvf.com/content/CVPR2026F/html/Choi_EggHand_A_Multimodal_Foundation_Model_for_Egocentric_Hand_Pose_Forecasting_CVPRF_2026_paper.html
- Registro y licencia de MANO: https://mano.is.tue.mpg.de
- AnyHand-WiLoR, YOLO-World y MANO: enlaces de origen no disponibles en la informacion proporcionada.
