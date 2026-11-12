# XinchengTan/nsdl-detector-locus34

## Resumen

nsdl-detector-locus34 es un detector de objetos basado en YOLO26-L desarrollado por Xincheng Tan como componente perceptual del sistema NSDL (Neuro-Symbolic Division of Labor), un marco de planificación de tareas multi-robot descrito en el preprint arXiv de 2026 "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning". El modelo resuelve la tarea de detección de herramientas y objetos manipulables en escenas de robótica doméstica y de laboratorio, proporcionando las observaciones visuales que alimentan la capa simbólica del planificador.

Se trata de un ajuste fino de YOLO26-L (Ultralytics 8.4.33) inicializado desde pesos COCO y entrenado exclusivamente sobre el split de entrenamiento de VIKI-L2 (900 imágenes) y el split de entrenamiento de LOCUS (6300 renders), sin imágenes de evaluación. El modelo cubre 34 clases que combinan herramientas de cocina, objetos domésticos y plataformas robóticas (Unitree H1, Unitree Go2, Panda, ANYmal C, entre otras).

El repositorio tiene un tamaño de 0,1 GB y el checkpoint publicado ocupa 53.163.010 bytes. Es relevante para investigadores que replican el sistema NSDL o que necesitan un detector especializado en escenas de manipulación con vocabulario acotado y configuraciones de inferencia documentadas (imgsz 960, conf 0.25, IoU 0.70, max_det 64).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-L (Ultralytics), detector de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión original) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt), 53.163.010 bytes |
| Clases | 34 |
| Resolución de inferencia | 960 px (imgsz 960) |
| Umbrales del paper | conf 0.25, IoU 0.70, max_det 64 |
| Librería | ultralytics |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un YOLO26-L de Ultralytics (versión 8.4.33), una arquitectura de detección de objetos de una etapa basada en CNN con cabeza de detección densa. Se inicializó desde pesos preentrenados en COCO y se ajustó mediante fine-tuning sobre dos conjuntos: el split de entrenamiento de VIKI-L2 (900 imágenes) y el split de entrenamiento de LOCUS (6300 renders sintéticos). No se utilizaron imágenes de evaluación durante el entrenamiento.

El checkpoint publicado corresponde al promedio exponencial de pesos (EMA) empleado para la evaluación en el paper; se han eliminado el estado del optimizador y las rutas de entrenamiento. El vocabulario de 34 clases mezcla objetos de cocina y menaje (apple, banana, bowl, bread, cabinet, knife, peach, pear, plate, sink, table, toaster, tomato, wooden_cutting_board, bottle, cup, drawer, fork, fridge, kettle, meat, oven, pizza, pumpkin, scissors, spoon, wine), objetos de logística (cardboardbox) y plataformas robóticas (fetch, stompy, unitree_h1, panda, unitree_go2, anymal_c). No se documentan innovaciones arquitectónicas propias ni técnicas de decodificación especulativa; la aportación es el ajuste al dominio y la integración en el pipeline neuro-simbólico NSDL.

## Capacidades

- Detección de objetos en imágenes con 34 clases cerradas orientadas a escenas de manipulación robótica y cocina.
- Localización de plataformas robóticas (Unitree H1, Unitree Go2, Panda, ANYmal C, Fetch, Stompy) junto con los objetos manipulables de la escena.
- Salida de cajas delimitadoras con puntuaciones de confianza, consumible por la capa simbólica del planificador NSDL.
- Funciona como herramienta `detect` dentro del sistema NSDL para las filas "tool-taking" de las Tablas II y III y la Figura 3 del paper.
- Inferencia configurable mediante la librería ultralytics (resolución, umbrales de confianza y NMS, número máximo de detecciones).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingües: es exclusivamente un detector visual.

## Casos de uso

- Replicación del sistema NSDL: colocar el checkpoint en `checkpoints/yolo26l_locus_full34_v1.pt` del repositorio de código y ejecutar la herramienta `detect` con imgsz 960, conf 0.25, IoU 0.70 y max_det 64 para reproducir los resultados del paper.
- Planificación multi-robot en entornos de cocina: el detector identifica simultáneamente robots (Unitree H1, Panda, ANYmal C) y objetos (cuchillo, tabla de cortar, tomate) para que el planificador simbólico asigne tareas de forma coherente con el estado observado.
- Investigación en robótica de manipulación: servir como módulo perceptual de referencia en experimentos con vocabulario acotado de 34 clases, evitando la ambigüedad de detectores genéricos entrenados en COCO.
- Evaluación de arquitecturas neuro-simbólicas: usar las detecciones como entrada a un razonador simbólico y medir el impacto del ruido perceptual en el éxito de la planificación.
- Prototipado de pipelines de percepción con Ultralytics: al ser un checkpoint `.pt` estándar, se integra en scripts de inferencia, exportación a ONNX/TensorRT y despliegue con la API de ultralytics.
- Detección de plataformas robóticas en vídeo o imágenes de laboratorio: las clases `unitree_h1`, `unitree_go2`, `anymal_c`, `panda`, `fetch` y `stompy` permiten localizar robots en escenas compartidas para tareas de coordinación.
- Generación de datos etiquetados en escenas sintéticas: el modelo, entrenado parcialmente con renders de LOCUS, puede emplearse para preetiquetar imágenes similares antes de una revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, precisión, recall ni comparaciones cuantitativas con otros detectores; únicamente documenta la configuración de inferencia empleada en el paper (imgsz 960, conf 0.25, IoU 0.70, max_det 64).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa del tamaño del checkpoint (53,2 MB en `.pt`), un YOLO-L de una etapa suele requerir del orden de 1-3 GB de VRAM en FP32/FP16 a 960 px, pero este dato no está confirmado por el autor.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo, una GPU consumer moderna (RTX 3060 o superior) es suficiente para inferencia; para entrenamiento o procesamiento por lotes a 960 px se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, aunque el requisito exacto no está documentado.
- Opciones de despliegue: librería `ultralytics` (PyTorch); exportación a ONNX, TensorRT, OpenVINO u otros formatos soportados por Ultralytics. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector visual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nsdl-detector-locus34 | YOLO26-L fine-tuned | 34 (dominio robótico/cocina) | imgsz 960 | AGPL-3.0 | Hugging Face (0 descargas) |
| YOLO26-L (COCO) | YOLO26-L | 80 (COCO) | configurable | AGPL-3.0 | Ultralytics |
| YOLOv8-L / YOLO11-L | YOLO de una etapa | 80 (COCO) | configurable | AGPL-3.0 | Ultralytics |
| Detectores genéricos tipo DETR | Transformer | 80+ (COCO) | configurable | variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: el autor no publica métricas frente a YOLO26-L en COCO ni frente a otros detectores. La diferencia principal frente a los modelos genéricos es el vocabulario cerrado de 34 clases específicas del dominio NSDL, que incluye plataformas robóticas ausentes en COCO.

## Limitaciones y advertencias

- Entrenado únicamente con 900 imágenes de VIKI-L2 y 6300 renders de LOCUS; la generalización a escenas reales fuera de esa distribución no está validada.
- No se usaron imágenes de evaluación en el entrenamiento, pero tampoco se publican métricas de validación, por lo que se desconoce su precisión real.
- Vocabulario cerrado de 34 clases: no detecta objetos fuera de esa lista y puede confundir clases visualmente próximas (por ejemplo, frutas como apple, peach y pear).
- Riesgo de sesgo hacia el dominio sintético de LOCUS (renders), con posible brecha de dominio en imágenes reales de cámara.
- Licencia AGPL-3.0: el uso comercial en servicios en red exige liberar el código fuente derivado; es una restricción relevante para producción.
- El modelo deriva de Ultralytics YOLO26, por lo que hereda las obligaciones de atribución y copyleft de esa licencia.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; su única salida son detecciones visuales.
- La fecha de creación indicada (2026-11-11) y el preprint de 2026 deben verificarse en el repositorio antes de citarlos.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de reportes independientes de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/XinchengTan/nsdl-detector-locus34
- Código del proyecto NSDL: https://github.com/Xincheng-Tan/NSDL
- Ultralytics (framework YOLO26): https://github.com/ultralytics/ultralytics
- Paper: "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning", Tan, Wang, Di, Zhu; arXiv preprint, 2026 (el identificador arXiv no está disponible en la información proporcionada)
