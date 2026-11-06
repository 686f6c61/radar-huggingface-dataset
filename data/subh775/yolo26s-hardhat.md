# Subh775/yolo26s-hardhat

## Resumen

YOLO26s-hardhat es un modelo de deteccion de objetos derivado de la arquitectura YOLO26s de Ultralytics, especializado en la deteccion de cascos de seguridad y cabezas descubiertas en entornos laborales. Lo publica el usuario Subh775 en Hugging Face como un fine-tune del checkpoint `yolo26s.pt` sobre el dataset Hard Hat Workers v5 de Roboflow, con dos clases: `head` (cabeza sin casco) y `helmet` (casco puesto). El modelo resuelve una tarea concreta de seguridad laboral: identificar automaticamente si un trabajador lleva proteccion craneal, lo que lo hace directamente aplicable a sistemas de videovigilancia de cumplimiento de EPI (equipo de proteccion individual).

El modelo es una red de deteccion de objetos de una sola etapa, entrenada en 2 GPU T4 de Kaggle a 640 px durante hasta 50 epocas con early stopping. Su relevancia es practica: ofrece un detector afinado y listo para usar en pipelines de vision por computador para obra, industria y almacenes, con metricas de test notables (mAP50 de 0,980 y mAP50-95 de 0,688). No es un modelo de lenguaje ni un modelo fundacional generalista; es un componente especializado dentro de un sistema de vision.

La informacion disponible sobre el modelo es escasa: la model card es breve, el repositorio pesa 0,0 GB en el momento de la consulta y no hay datos publicados sobre composicion del dataset, hiperparametros completos ni benchmarks comparativos con otros detectores. La ficha se completa con lo disponible y se marcan explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision; sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`, checkpoint de Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `yolo26s.pt`, el checkpoint de la variante "s" (small) de la familia YOLO26 de Ultralytics. YOLO26 es una arquitectura de deteccion de objetos de una sola etapa, sucesora de la linea YOLO11, orientada a inferencia en tiempo real. La variante "s" es la version pequena de la familia, pensada para un equilibrio entre precision y coste computacional. La informacion proporcionada no detalla la composicion interna de la arquitectura (backbone, neck, cabeza de deteccion, mecanismos de atencion o asignacion de etiquetas), por lo que no se puede describir con mayor granularidad.

El entrenamiento se realizo sobre el dataset Hard Hat Workers v5 de Roboflow (dos clases: `head` y `helmet`), a resolucion de 640 px, en 2 GPU T4 de Kaggle, con un maximo de 50 epocas y paciencia de early stopping de 15. No se especifican el numero de imagenes del dataset, la composicion del split, los hiperparametros de aumento de datos, la funcion de perdida ni si hubo tecnicas adicionales de regularizacion. Las curvas de entrenamiento estan registradas en el proyecto de W&B `yolo26-ppe-helmet`, run `yolo26s-hardhat-v5-run2`, pero no se incluyen en la informacion disponible.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica dos clases, `head` (cabeza sin casco) y `helmet` (casco de seguridad).
- Deteccion en tiempo real: al ser una variante "s" de YOLO26, esta disenada para inferencia de baja latencia en GPU y CPU.
- Integracion con el ecosistema Ultralytics: carga mediante `YOLO(...)`, compatible con las utilidades de entrenamiento, validacion, prediccion y exportacion de la libreria.
- Exportacion a formatos de despliegue: al ser un modelo Ultralytics, es exportable a ONNX, TensorRT, OpenVINO y otros formatos soportados por la libreria (no confirmado explicitamente en la model card).
- Sin soporte de tool calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues: es un detector de objetos especializado, no un modelo generativo.

## Casos de uso

- Monitorizacion de cumplimiento de EPI en obra: el modelo se integra en un pipeline de video (por ejemplo, con OpenCV o GStreamer) que procesa fotogramas de camaras de obra y emite alertas cuando detecta la clase `head` en zonas de riesgo, con la clase `helmet` como referencia de cumplimiento.
- Control de acceso a zonas peligrosas: combinado con un sistema de reconocimiento de personas, el detector puede bloquear el acceso a areas de riesgo si no se detecta un casco antes de la entrada.
- Auditoria de seguridad automatizada: procesamiento por lotes de imagenes historicas de inspecciones para generar informes de cumplimiento y detectar patrones de incumplimiento por turno, zona o cuadrilla.
- Analitica de seguridad en tiempo real: agregacion de detecciones por camara para calcular tasas de cumplimiento a lo largo del dia y alimentar dashboards de seguridad laboral.
- Vigilancia en almacenes y plantas industriales: adaptacion del detector a camaras fijas de interior para verificar el uso de casco en zonas de carga y descarga.
- Pre-filtrado en sistemas de inspeccion con dron: uso del detector como primera etapa para localizar trabajadores en imagenes aereas de obra y decidir que regiones requieren revision humana.
- Prototipado rapido de aplicaciones de vision: al cargarse con una sola llamada a `hf_hub_download` y `YOLO(...)`, sirve como base para demos y pruebas de concepto de deteccion de EPI antes de invertir en un modelo propio.

## Benchmarks y rendimiento

Metricas del split de test reportadas en la model card:

| Metrica | Valor |
|---|---|
| mAP50 | 0,980 |
| mAP50-95 | 0,688 |
| AP50 clase `head` | 0,974 |
| AP50 clase `helmet` | 0,986 |

No se han publicado resultados de benchmarks comparativos con otros detectores (YOLOv8, YOLO11, RT-DETR, etc.) en la informacion disponible. Tampoco se reportan latencia, throughput ni metricas por tamano de objeto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al tratarse de una variante "s" de YOLO26, la huella es moderada, pero no se confirma el numero de parametros ni el consumo exacto.
- GPU recomendadas: el entrenamiento se realizo en 2 GPU T4 de Kaggle, lo que indica que el modelo es entrenable y desplegable en GPUs de gama media. Para inferencia en produccion se puede usar desde una T4 hasta una A100 o H100, aunque no hay datos de rendimiento por GPU.
- GPU de consumo: por el tamano de la variante "s", es probable que quepa en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090), pero no se confirma en la informacion disponible.
- Opciones de despliegue: la libreria Ultralytics permite exportar a ONNX, TensorRT, OpenVINO y otros formatos; tambien se puede servir con TorchServe o integrar en pipelines propios. No se documenta soporte especifico de vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada. Como referencia cualitativa, la familia YOLO (YOLOv8, YOLO11, YOLO26) de Ultralytics ofrece variantes "n", "s", "m", "l" y "x" con distintos compromisos de precision y coste, y existen detectores alternativos como RT-DETR o DETR. Sin embargo, no se pueden comparar parametros, contexto ni rendimiento con rigor sin datos publicados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s-hardhat | no disponible | no aplica | mAP50 0,980 / mAP50-95 0,688 (test propio) | AGPL-3.0 | Hugging Face |
| YOLO26s (base) | no disponible | no aplica | no disponible | AGPL-3.0 | Ultralytics |
| Alternativas (YOLO11, RT-DETR) | no disponible | no aplica | no disponible | variable | variable |

## Limitaciones y advertencias

- Dataset y dominio acotados: el modelo solo detecta dos clases (`head` y `helmet`) y fue entrenado sobre Hard Hat Workers v5; su rendimiento fuera de ese dominio (otras condiciones de iluminacion, angulos, tipos de casco o cultivos) no esta validado.
- Riesgo de falsos positivos y negativos: no se reportan curvas precision-recall, matriz de confusion ni analisis de errores por tamano de objeto o condicion de imagen.
- Sesgos desconocidos: no se documenta la composicion demografica, geografica ni de condiciones de captura del dataset, por lo que no se puede evaluar el sesgo del detector.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el codigo fuente del servicio que lo integra; es una restriccion relevante para produccion y debe revisarse con asesoria legal.
- Repositorio vacio en el momento de la consulta (0,0 GB): no se confirma que los pesos `best.pt` esten efectivamente disponibles para descarga.
- Sin garantias de mantenimiento: el autor no documenta versionado, soporte ni actualizaciones; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.
- No apto para decisiones de seguridad criticas sin supervision humana: un detector de EPI no sustituye la inspeccion humana ni los protocolos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Subh775/yolo26s-hardhat
- Dataset Hard Hat Workers (Roboflow): https://universe.roboflow.com/joseph-nelson/hard-hat-workers
- Proyecto W&B de entrenamiento: `yolo26-ppe-helmet`, run `yolo26s-hardhat-v5-run2` (no se proporciona URL directa)
- Ultralytics (libreria y documentacion): https://docs.ultralytics.com
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
