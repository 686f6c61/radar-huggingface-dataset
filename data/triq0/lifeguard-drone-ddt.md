# triq0/lifeguard-drone-ddt

## Resumen

`triq0/lifeguard-drone-ddt` es un detector de objetos basado en Ultralytics YOLO11s (escala `s`, 9.428.953 parámetros) especializado en la detección de personas en piscinas vistas desde cámaras elevadas o cenitales. Distingue tres clases: `swimming` (persona en el agua y en control), `drowning` (persona en el agua con signos visibles de apuro en un único fotograma) y `out_of_water` (persona en el bordillo, escalera, trampolín o palanca, incluidos socorristas). Forma parte de un proyecto de ingeniería estudiantil llamado *Lifeguard System*, un sistema de socorrista autónomo con dron simulado, y se publica como material de investigación y revisión.

El modelo se inicializa desde los pesos preentrenados `yolo11s.pt` de Ultralytics y se ajusta completamente (sin capas congeladas) sobre un subconjunto limpio de 925 imágenes derivado del proyecto de Roboflow *DrowningDetectionTracking*. Su entrada es de 640 × 640 píxeles y el checkpoint final (`ddt_v2_final.pt`) ocupa 19.183.578 bytes en tensores FP16. El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta.

La relevancia del modelo es acotada y muy específica: sirve como front-end de percepción para un sistema de seguimiento (ByteTrack) y un motor de riesgo basado en reglas, nunca como salvaguarda autónoma. La licencia está sin resolver y el autor restringe explícitamente el uso comercial y cualquier despliegue que trate la puntuación de `drowning` de un solo fotograma como una alarma. Además, la limpieza del dataset dejó cero cajas de la clase `drowning` en el conjunto de entrenamiento final, lo que limita severamente la utilidad práctica de esa clase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s `DetectionModel` (escala `s`, `yolo11s.yaml`), strides 8/16/32 |
| Parametros totales | 9.428.953 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible en la información proporcionada; el checkpoint se distribuye en FP16 |
| Idiomas soportados | no disponible (modelo de visión sin capacidades lingüísticas) |
| Licencia | `other` con `license_name: unresolved`; no aclarada para uso público o comercial sin restricciones |
| Formato de pesos | PyTorch pickle checkpoint (`.pt`, `ddt_v2_final.pt`, tensores FP16, 19.183.578 bytes) |
| Framework | Ultralytics 8.4.218 |
| Entrada | 640 × 640 (`imgsz: 640`, debe coincidir con el entrenamiento) |
| Clases | 3 (`swimming`, `drowning`, `out_of_water`) |
| SHA-256 | `a6683aa3a2a0a4da5b56dc3839fd1a2cc1ee2cbb59ab023e3897f50abd1d5187` |
| Dominio de cámara | cenital / vista superior o cámara de piscina montada en alto |

## Arquitectura y entrenamiento

La arquitectura es la `DetectionModel` de Ultralytics YOLO11 en escala `s`, con tres niveles de detección (strides 8, 16 y 32) y 9.428.953 parámetros. Se inicializa desde los pesos preentrenados `yolo11s.pt` de Ultralytics y se somete a un ajuste fino completo, sin congelar capas. El entrenamiento se realizó con Ultralytics 8.4.218 y una resolución de entrada de 640 × 640, que debe respetarse en inferencia para mantener la coherencia con el entrenamiento.

Los datos proceden del proyecto de Roboflow Universe *DrowningDetectionTracking* (workspace `drowningdetection-2zzxz`, export v1 del 30 de marzo de 2024), que declara licencia CC BY 4.0 y contiene 23.586 imágenes con aumentos de Roboflow redimensionadas a 640 × 640. El pipeline reproducible del proyecto (`DrowningDetectionTracking_v2_clean`) eliminó duplicados, copias aumentadas y fugas entre particiones, y fijó el esquema de tres clases, dejando 925 imágenes. Según la model card, esa limpieza dejó **cero cajas de la clase `drowning`**: todas las imágenes con posibles casos de ahogamiento se enviaron a cuarentena. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset final, ni uso de RLHF/DPO (no aplicable a un detector). No se describe ninguna innovación técnica destacable más allá del ajuste fino completo sobre YOLO11s.

## Capacidades

- Detección de objetos en imágenes de piscina con vista cenital o de cámara montada en alto, con tres clases: `swimming`, `drowning` y `out_of_water`.
- Salida de cajas delimitadoras con puntuaciones de confianza por clase y por fotograma.
- La confianza de la clase `drowning` (índice 1) se propaga como puntuación de apuro (`distress_class_ids: [1]`) al sistema de tiempo de ejecución.
- En el runtime del Lifeguard System, las tres clases se tratan como "persona" (`person_class_ids: [0, 1, 2]`), lo que permite localizar a cualquier persona en la escena.
- Integración prevista con seguimiento multiobjeto (ByteTrack) y un motor de riesgo basado en reglas que combina características de seguimiento con la puntuación de apuro promediada durante 2 segundos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector de visión puro.
- No incluye modo de pensamiento, visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Investigación y docencia en visión por computador aplicada a seguridad en piscinas: el modelo sirve como ejemplo reproducible de detección con YOLO11s sobre un dataset de Roboflow, con pipeline de limpieza documentado y checkpoint verificable por SHA-256.
- Demostraciones de sistemas de alerta temprana: integrado con ByteTrack y un motor de reglas, puede generar prealertas de "revisar este nadador" cuando la puntuación de apuro promediada supera un umbral, siempre con confirmación humana.
- Prototipado de front-ends de percepción para cámaras fijas de piscina: permite validar la localización de personas en vistas cenitales antes de invertir en anotación propia o en modelos mayores.
- Evaluación comparativa de detectores en dominios restringidos: al ser un YOLO11s ajustado, sirve como línea base para medir la mejora de modelos específicos en escenas de piscina.
- Análisis offline de grabaciones de piscina: procesado por lotes de vídeo para localizar personas y estudiar la distribución de puntuaciones de apuro a lo largo del tiempo, con revisión humana posterior.
- Docencia sobre límites de los modelos de seguridad: el propio modelo ilustra buenas prácticas de documentación (SHA-256, licencia sin resolver, avisos de seguridad) y por qué un detector de un solo fotograma no basta para clasificar angustia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un YOLO11s a 640 × 640 en FP16, el checkpoint pesa 19,2 MB, por lo que la huella de pesos es mínima; la VRAM efectiva depende del tamaño de lote y de la implementación.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, cualquier GPU consumer moderna es candidata, pero el autor no publica requisitos.
- ¿Cabe en GPU consumer? No confirmado por el autor; el tamaño del checkpoint (19,2 MB) sugiere que sí, pero no se aportan datos de latencia ni de memoria medida.
- Opciones de despliegue: Ultralytics 8.4.218 (framework declarado). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de visión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `triq0/lifeguard-drone-ddt` | 9.428.953 | 640 × 640 | 3 (`swimming`, `drowning`, `out_of_water`) | `other` / unresolved | Hugging Face, 0 descargas |
| `triq0/lifeguard-drone-z5cc` | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo de vista lateral del mismo proyecto) |
| YOLO11s base (Ultralytics) | 9.428.953 (misma arquitectura) | 640 × 640 | 80 (COCO) | AGPL-3.0 / Enterprise según Ultralytics | Público, ampliamente distribuido |

La comparativa con alternativas de la misma tarea (detección de ahogamientos en piscina) no está disponible en la información proporcionada. El modelo hermano `triq0/lifeguard-drone-z5cc` cubre la vista lateral con las mismas advertencias, pero no se aportan sus especificaciones.

## Limitaciones y advertencias

- **Licencia sin resolver**: el dataset de origen declara CC BY 4.0, pero no se ha verificado la procedencia de sus imágenes. Los pesos no están autorizados para uso público o comercial sin restricciones; solo para investigación y revisión.
- **Cero cajas de `drowning` en el entrenamiento**: la limpieza del dataset dejó 0 cajas de la clase 1, por lo que la capacidad real de detectar ahogamientos es dudosa y no está validada.
- **Clase `out_of_water` no fiable**: el autor la excluye explícitamente como detector fiable.
- **Puntuación de un solo fotograma**: una puntuación alta de `drowning` en un fotograma no establece que alguien se esté ahogando; se requiere evidencia temporal (duración del comportamiento, historial de seguimiento, tiempo de inmersión) y confirmación humana.
- **Nunca como única salvaguarda**: el modelo no debe ser el único sistema de protección de vidas.
- **Ámbito operativo limitado**: solo piscinas; no apto para aguas abiertas, playas, lagos, mar, cámaras subacuáticas ni imágenes aéreas de dron. No fue entrenado ni probado con metraje de dron pese al nombre.
- **Vista cenital únicamente**: para vistas laterales debe usarse `triq0/lifeguard-drone-z5cc`, con las mismas advertencias.
- **Prohibido para vigilancia o perfilado**: no debe usarse para identificar, reconocer o perfil
