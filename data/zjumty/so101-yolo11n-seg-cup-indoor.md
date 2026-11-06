# zjumty/so101-yolo11n-seg-cup-indoor

## Resumen

`zjumty/so101-yolo11n-seg-cup-indoor` es un ajuste fino del modelo de segmentación de instancias YOLO11n-seg, especializado en localizar un vaso de plástico en escenas interiores sintéticas renderizadas en MuJoCo. Lo desarrolla el usuario zjumty como parte del pipeline del denominado "Teacher" del robot SO-101, donde el modelo se ejecuta sobre la cámara de tarea (`task_camera`) para localizar el vaso antes de planificar una recogida. No es un modelo de lenguaje: es un detector-segmentador visual de un solo objeto, con 2,6 millones de parámetros aproximados propios de la variante "n" de YOLO11.

El modelo parte de los pesos del modelo desplegado `so101-yolo11n-seg-plastic-cup` y se reentrena sobre 3.680 fotogramas sintéticos de la escena interior brillante `side-wrist-indoor` (layouts A, B y C) con apariencias aleatorizadas y máscaras obtenidas de la verdad de simulación. La innovación principal es la incorporación de 600 negativos duros basados en el anillo de aterrizaje rojo, que en la escena brillante se confundía con un segundo vaso junto a la sombra del objeto real.

Su relevancia es acotada pero clara: demuestra un ciclo de mejora iterativa de un detector de robótica mediante datos sintéticos y negativos duros dirigidos, eliminando falsos positivos de segundo vaso (de 17 a 0 en 100 fotogramas) y elevando la tasa de éxito del pipeline de 28/32 a 32/32 posiciones. Es un artefacto de investigación reproducible, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11n-seg (detector-segmentador de instancias de Ultralytics, CNN) |
| Parámetros totales | no disponible (variante "n" de YOLO11-seg; el autor no publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen a 640 px) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `best.pt` y `last.pt` en formato PyTorch) |
| Idiomas soportados | no aplica (modelo visual, sin componente lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`), cargable con Ultralytics 8.4.115 |

## Arquitectura y entrenamiento

La arquitectura es la de YOLO11n-seg de Ultralytics: un backbone y cuello convolucionales con cabezas de detección y de prototipos de máscara para segmentación de instancias, operando sobre entradas de 640×640 píxeles. El ajuste fino se realizó con AdamW, `lr0` 5e-4, lote de 16, `imgsz` 640, un máximo de 40 épocas con paciencia de 15, semilla 0 y Ultralytics 8.4.115, sobre una RTX 5080. Los argumentos completos están en `args.yaml` y las curvas en `results.csv`.

El conjunto de entrenamiento `zjumty/so101-indoor-cup-seg-synth` contiene 3.680 fotogramas sintéticos de MuJoCo con máscaras derivadas de la verdad de simulación y partición por identidad de activo. El split de entrenamiento tiene 2.600 fotogramas e incluye 200 fotogramas de repetición de escena oscura y 600 negativos duros del anillo de aterrizaje rojo, añadidos específicamente para corregir la detección de un segundo vaso fantasma en la escena brillante. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, por tratarse de un modelo visual supervisado.

## Capacidades

- Segmentación de instancias de un único objeto (vaso de plástico) en imágenes RGB de escena interior.
- Detección con caja delimitadora y máscara por instancia, con salida compatible con la API de Ultralytics.
- Localización de la posición del vaso en el plano de la imagen para planificación de recogida robótica.
- Robustez ante apariencias aleatorizadas del vaso y ante variaciones de iluminación entre la escena interior brillante y la escena oscura previa.
- Supresión de falsos positivos del anillo de aterrizaje rojo y de la sombra del vaso gracias a los negativos duros.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente perceptivo.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Localización de objeto para manipulación robótica: el modelo se ejecuta sobre la `task_camera` del SO-101 para obtener la máscara y la posición del vaso antes de que el planificador calcule la trayectoria de recogida; su precisión de 0,777 mm de error mediano en xy lo hace adecuado para agarres de precisión en simulación.
- Validación de pipelines de percepción en MuJoCo: sirve como detector de referencia para comprobar que el lazo percepción-planificación-acción funciona en las 32 posiciones de prueba del Teacher, con 32/32 de éxito en escena interior y 32/32 en escena oscura.
- Generación de datos sintéticos etiquetados: al estar entrenado sobre `so101-indoor-cup-seg-synth`, permite reproducir el ciclo de entrenamiento y evaluar el impacto de añadir negativos duros en un detector de un solo objeto.
- Detección de objetos en escenas interiores con distractores rojos: los 600 negativos del anillo de aterrizaje lo hacen útil en entornos donde existen elementos rojos circulares que confunden a detectores genéricos.
- Despliegue en robótica de bajo coste: la variante "n" de YOLO11-seg está pensada para inferencia en tiempo real en hardware modesto, lo que encaja con estaciones de trabajo con GPU consumer como la RTX 5080 usada en el entrenamiento.
- Investigación en simulación a realidad: el modelo puede servir de base para estudiar la transferencia de un detector entrenado solo con datos sintéticos a imágenes reales del mismo montaje de cámara.

## Benchmarks y rendimiento

| Conjunto | Detección | Segundo vaso (ambiguo) | Mask IoU |
|---|---|---|---|
| Interior nominal, 100 fotogramas | 1,00 → 1,00 | 17 → 0 | 0,953 → 0,964 |
| Escena oscura previa, 100 fotogramas | 1,00 → 1,00 | 0 → 0 | 0,950 → 0,964 |
| Apariencias no vistas, 300 fotogramas | 1,000 → 0,997 | — | 0,958 → 0,961 |

Comprobación del pipeline del Teacher sobre 32 posiciones (28 reservadas más 4 estándar):

| Escena | Pesos antiguos | Pesos nuevos |
|---|---|---|
| Interior | 28/32 | 32/32 |
| Escena oscura previa | 32/32 | 32/32 |
| Error mediano xy del vaso | 0,756 mm | 0,777 mm |

No se han publicado resultados de benchmarks estándar (COCO, MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un detector específico de un objeto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de la variante "n" de YOLO11-seg y la entrada de 640 px, es del orden de unos pocos cientos de MB en FP32, aunque el autor no publica la cifra.
- GPU de entrenamiento documentada: RTX 5080, con lote de 16 y hasta 40 épocas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 30xx/40xx/50xx) es suficiente para inferencia en tiempo real; no se documentan requisitos de A100 o H100.
- Cabe en GPU consumer: sí, por la escala del modelo y la resolución de entrada.
- Opciones de despliegue: Ultralytics 8.4.115 (carga directa de `best.pt`); no se documenta exportación a ONNX, TensorRT, GGUF ni integración con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zjumty/so101-yolo11n-seg-cup-indoor` | Segmentación de un vaso en escena interior sintética | no disponible (variante "n") | 640 px | AGPL-3.0 | Hugging Face, 57 descargas |
| `zjumty/so101-yolo11n-seg-plastic-cup` (Teacher) | Segmentación de vaso de plástico | no disponible (variante "n") | 640 px | AGPL-3.0 (presumible, pesos YOLO) | Pesos base citados, no verificados en la información |
| YOLO11n-seg original (Ultralytics) | Segmentación de instancias genérica (COCO) | no disponible | 640 px | AGPL-3.0 | Público en Ultralytics |
| Detectores genéricos de un solo objeto (p. ej. fine-tunes de YOLOv8n-seg) | Segmentación específica | no disponible | 640 px | AGPL-3.0 | Público en Hugging Face |

La comparación cuantitativa con alternativas no está disponible: el autor solo compara contra sus propios pesos anteriores, no contra otros detectores.

## Limitaciones y advertencias

- Modelo de un solo objeto: solo detecta el vaso de plástico para el que fue entrenado; no es un detector genérico ni un modelo de lenguaje.
- Entrenado exclusivamente con datos sintéticos de MuJoCo; el rendimiento en imágenes reales del mismo montaje no está documentado y puede degradarse por la brecha simulación-realidad.
- La detección en apariencias no vistas baja ligeramente (1,000 → 0,997), lo que indica una pérdida mínima pero real de generalización al añadir negativos duros.
- El error mediano xy del vaso empeora ligeramente (0,756 → 0,777 mm) pese a la mejora en detección y en tasa de éxito del pipeline.
- Licencia AGPL-3.0 heredada de Ultralytics YOLO: impone obligaciones de copyleft sobre el código que lo integre y sobre la distribución de servicios en red; requiere revisión legal para uso comercial propietario.
- No se publican datos de sesgos, alucinación (no aplica en sentido lingüístico) ni comportamiento fuera de la distribución de escenas interiores y oscuras del dataset.
- El repositorio tiene 0,0 GB de tamaño reportado y 57 descargas, sin likes; es un artefacto de investigación con poca validación comunitaria.
- No se documentan cuantizaciones ni exportaciones a formatos de despliegue alternativos, lo que limita su uso fuera del ecosistema Ultralytics.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zjumty/so101-yolo11n-seg-cup-indoor
- Dataset de entrenamiento: https://huggingface.co/datasets/zjumty/so101-indoor-cup-seg-synth
- Pesos base citados: `so101-yolo11n-seg-plastic-cup` (sha256 `f281d252…`, sin URL verificada en la información)
- Ultralytics YOLO11: https://github.com/ultralytics/ultralytics
- MuJoCo: https://mujoco.org
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
