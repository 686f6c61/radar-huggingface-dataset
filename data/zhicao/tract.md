# zhicao/tract

## Resumen

TrAct es una política vision-language-action (VLA) derivada de π0.5, desarrollada por el usuario zhicao y publicada como repositorio de código en Hugging Face. Su particularidad es que, además de predecir acciones, está entrenada para predecir trayectorias de puntos 2D (point tracks) sobre las observaciones visuales. En tiempo de inferencia puede, opcionalmente, clasificar acciones candidatas mediante un modelo de mundo de vídeo dual-view condicionado por tracks y un crítico VLAC. Está construida sobre el framework openpi de Physical Intelligence y el paquete Python se distribuye como `tract`.

El repositorio contiene únicamente código: no incluye datasets, checkpoints ni resultados de experimentos. El entrenamiento se organiza en tres etapas (alineamiento, entrenamiento de tracks y entrenamiento conjunto) y la evaluación se realiza sobre la suite LIBERO y sus variantes de perturbación (LIBERO-PRO, cambios de objeto, tarea, punto de vista, fondo, etc.). Los pesos base de π0.5 y LIBERO se descargan automáticamente desde `gs://openpi-assets`, mientras que los componentes del modelo de mundo y el crítico deben obtenerse de sus repositorios originales o entrenarse.

La relevancia de TrAct radica en su enfoque híbrido: combina una política VLA con razonamiento sobre dinámica visual explícita (tracks) y selección de acciones guiada por un modelo de mundo, lo que apunta a mejorar la robustez en manipulación robótica frente a perturbaciones visuales y de escena. No obstante, al tratarse de un repositorio de código sin pesos publicados ni métricas en la model card, su evaluación práctica requiere reproducir el pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action policy basada en π0.5 (fork de openpi) con predicción auxiliar de point tracks 2D; pipeline opcional con modelo de mundo SVD dual-view y crítico VLAC |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Código de openpi bajo Apache-2.0; componentes de `third_party/` conservan su propia licencia; licencia del modelo TrAct no especificada |
| Formato de pesos | no disponible (el repositorio no incluye pesos; los checkpoints se generan entrenando con los configs incluidos) |

## Arquitectura y entrenamiento

TrAct se construye sobre π0.5, una política VLA de openpi, y añade una cabeza de predicción de trayectorias de puntos 2D obtenidas con CoTracker3 (checkpoint `scaled_offline.pth` de `facebook/cotracker3`). El entrenamiento se divide en tres etapas configurables en `src/tract/training/config.py`: `pi05_libero_stage1_align` (alineamiento), `pi05_libero_stage2_track` (entrenamiento de tracks) y `pi05_libero_stage2p5_joint` (entrenamiento conjunto). Los datos de entrenamiento son las demos LIBERO en formato LeRobot, junto con un conjunto etiquetado con tracks generado mediante `scripts/lerobot_preprocess_cotracker.py` (repo `physical-intelligence/libero_cotracker_densegrid_merged`).

El pipeline de inferencia opcional incorpora un modelo de mundo de vídeo condicionado por tracks (`third_party/track_dualview`, basado en Stable Video Diffusion) y un crítico VLAC (`InternRobotics/VLAC`, 8B) para clasificar acciones candidatas. Como baseline se incluye Ctrl-World (`yjguo/Ctrl-World`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de LIBERO, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (política VLA).
- Predicción de trayectorias de puntos 2D (point tracks) sobre las imágenes, entrenada de forma conjunta con las acciones.
- Selección de acciones en tiempo de inferencia mediante ranking con modelo de mundo de vídeo dual-view y crítico VLAC (modo opcional).
- Evaluación sobre LIBERO y variantes de perturbación: `*_swap`, `*_object`, `*_lan`, `*_task`, `*_cross`, `*_sawyer`, `libero_viewpoint`, `libero_background`, `libero_integral`.
- Soporte de entrenamiento y evaluación reproducibles mediante scripts (`train.py`, `evaluate.py`, `evaluate_full_track.py`).
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en manipulación robótica con LIBERO: el repositorio permite entrenar y evaluar políticas VLA sobre las suites estándar y sus variantes de perturbación, lo que facilita estudios comparativos de robustez.
- Estudio de representaciones de movimiento: la predicción conjunta de point tracks permite analizar si el modelo aprende correspondencias visuales útiles para el control, usando CoTracker3 como fuente de etiquetas.
- Selección de acciones con modelo de mundo: `evaluate_full_track.py` permite comparar la política sola frente a la política con ranking por modelo de mundo y crítico VLAC, útil para investigar test-time compute en robótica.
- Reproducción de experimentos de openpi: al ser un fork, sirve como base para extender π0.5 con nuevas cabezas auxiliares o pipelines de evaluación.
- Evaluación de robustez ante cambios de punto de vista y fondo: las suites `libero_viewpoint` y `libero_background` permiten medir degradación bajo perturbaciones visuales.
- Desarrollo de pipelines de datos con tracks: el script de preprocesado con CoTracker3 puede reutilizarse para etiquetar otros datasets en formato LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del modelo no se especifica; al derivar de π0.5 y usar JAX/XLA, el entrenamiento se lanza con `XLA_PYTHON_CLIENT_MEM_FRACTION=0.9`, lo que sugiere uso intensivo de memoria de GPU.
- El pipeline completo (política + modelo de mundo SVD + crítico VLAC de 8B) requiere cargar varios modelos, por lo que la VRAM necesaria es sustancialmente mayor que la de la política sola; no se proporcionan cifras.
- GPU recomendadas: no disponible. Por el stack (JAX/XLA y openpi) se orienta a GPUs de datacenter tipo A100/H100, pero no se confirma en la información.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: scripts propios de openpi (`scripts/evaluate.py`, `scripts/evaluate_full_track.py`) y cliente websocket `packages/openpi-client`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Predicción de tracks | Selección con modelo de mundo | Pesos publicados | Licencia |
|---|---|---|---|---|---|
| TrAct | π0.5 (openpi) | Sí | Sí (opcional, SVD dual-view + VLAC) | No (solo código) | Apache-2.0 en código openpi; no especificada para TrAct |
| π0.5 (openpi) | — | No | No | Sí (vía `gs://openpi-assets`) | Apache-2.0 |
| Ctrl-World | Modelo de mundo | No | Usado como baseline | Sí (`yjguo/Ctrl-World`) | Según su repositorio |
| VLAC | Crítico VLA | No | Es el crítico | Sí (`InternRobotics/VLAC`, 8B) | Según su repositorio |

## Limitaciones y advertencias

- El repositorio no incluye datasets, checkpoints ni resultados; cualquier evaluación requiere descargar assets, generar etiquetas con CoTracker3 y entrenar las tres etapas.
- No hay métricas publicadas en la model card, por lo que no es posible verificar empíricamente las ganancias frente a π0.5 u otras políticas.
- El pipeline completo depende de múltiples componentes externos (SVD, CLIP, Ctrl-World, VLAC, CoTracker3) con sus propias licencias y requisitos, lo que complica el uso comercial.
- La licencia específica de TrAct no está declarada; solo se indica que el código de openpi es Apache-2.0 y que cada proyecto de `third_party/` mantiene su licencia.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Limitaciones de contexto e idioma: no disponible.
- La evaluación está centrada en LIBERO y sus variantes; la generalización a robots reales o escenas fuera de ese benchmark no está documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zhicao/tract
- openpi (framework base): https://github.com/Physical-Intelligence/openpi
- Dataset LIBERO (LeRobot): https://huggingface.co/datasets/physical-intelligence/libero
- Assets LIBERO-plus: https://huggingface.co/datasets/Sylvest/LIBERO-plus
- CoTracker3: https://huggingface.co/facebook/cotracker3
- Stable Video Diffusion: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid
- CLIP ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32
- Ctrl-World: https://huggingface.co/yjguo/Ctrl-World
- VLAC: https://huggingface.co/InternRobotics/VLAC
