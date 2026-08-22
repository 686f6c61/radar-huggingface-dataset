# XXMiner/ScoreVision_roadsigns

## Resumen

El modelo **XXMiner/ScoreVision_roadsigns** es un detector de señales de tráfico basado en la arquitectura YOLO11n de Ultralytics, optimizado para inferencia en CPU mediante ONNX. Ha sido desarrollado por el usuario XXMiner como parte de la Subnet 44 de Bittensor (Score Vision), una red descentralizada de visión por computador. El modelo está diseñado para cumplir con los requisitos de latencia de la competición (100 ms + 10 ms), operando a una resolución de entrada de 704 píxeles y empaquetado como un script de CPU-onnxruntime sin dependencias de red ni lecturas de entorno.

El modelo se entrenó sobre frames de un dominio oficial etiquetados mediante un consenso de ganadores, con una supervisión "frozen-GT-proxy" que replica el objetivo de puntuación del challenge (sam3_json_v1). En un conjunto de validación de 120 frames disjuntos, alcanza un mAP50 de 0,8364 y una precisión de 0,951, con un rendimiento gated de 0,4889 (el umbral interno era 0,45). El repositorio incluye una nota crítica sobre el orden de canales: la entrada debe convertirse de BGR a RGB antes del preprocesamiento, ya que omitir esta conversión degrada el mAP50 de 0,8364 a 0,6307.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp32 (ONNX) |
| Idiomas soportados | no aplica (detección de imágenes) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en YOLO11n, la variante nano de la familia YOLO11 de Ultralytics, conocida por su equilibrio entre velocidad y precisión para detección de objetos en tiempo real. No se han publicado detalles sobre el número de parámetros, la composición del dataset ni el número de tokens de entrenamiento (tratándose de un modelo de visión, no aplica el concepto de tokens textuales). El entrenamiento se realizó sobre frames de un dominio oficial, etiquetados mediante un consenso de ganadores de la competición, con un criterio de calidad (map50>=0.9, fp>=0.9). La supervisión utilizada es un "frozen-GT proxy" que replica el objetivo de puntuación del sistema de evaluación oficial.

La innovación técnica destacada no se centra en la arquitectura (YOLO11n es un estándar), sino en el pipeline de inferencia: se empaqueta como un script de CPU-onnxruntime sin acceso a red, sin lecturas de variables de entorno y sin enlaces simbólicos, cumpliendo así con las restricciones de la competición. La latencia medida es de 85 ms p95 en 2 vCPU-class cores, dentro del presupuesto de 100 ms + 10 ms. La conversión BGR→RGB es un paso crítico que debe realizarse antes del preprocesamiento, como se documenta explícitamente en la model card.

## Capacidades

- Detección de señales de tráfico en imágenes (vehículos, señales, etc.) a partir de frames de vídeo.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU, con una latencia de 85 ms p95 en 2 vCPU.
- Procesamiento de imágenes de 704x704 píxeles.
- Empaquetado seguro para despliegue en entornos restringidos (sin acceso a red, sin lectura de variables de entorno, sin symlinks).
- Soporte de entrada BGR (típico de OpenCV) con conversión interna a RGB.
- No incluye soporte de tool calling, agentes ni razonamiento multimodal (es un modelo de detección puro).

## Casos de uso

- **Análisis de vídeo en tiempo real para monitorización de carreteras**: el modelo puede integrarse en pipelines de visión que procesen vídeo de cámaras de tráfico para detectar señales de tráfico y otros objetos relevantes, gracias a su baja latencia en CPU.
- **Sistemas de ayuda a la conducción (ADAS)**: aunque no está diseñado para vehículos autónomos, su tamaño nano y su capacidad de ejecución en CPU lo hacen adecuado para prototipos en sistemas embebidos que requieran detección de señales de tráfico.
- **Auditoría de infraestructuras urbanas**: puede usarse para inventariar señales de tráfico en imágenes capturadas por drones o cámaras móviles, identificando su posición y estado.
- **Benchmarking de modelos de detección**: al ser un modelo de referencia para la Subnet 44, puede servir como baseline para evaluar otros detectores en el mismo dominio de datos.
- **Investigación en aprendizaje federado**: al estar empaquetado para entornos sin red, puede desplegarse en nodos distribuidos de la red Bittensor para tareas de validación y minería.
- **Educación y prototipado**: los desarrolladores pueden usar el modelo como ejemplo de despliegue de YOLO11n en ONNX para CPU, estudiando el pipeline de conversión de color y el empaquetado seguro.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a un conjunto de validación de 120 frames disjuntos del dominio oficial:

| Métrica | Valor |
|---|---|
| mAP50 | 0,8364 |
| Precisión (fp) | 0,951 |
| Rendimiento gated | 0,4889 |
| Umbral interno | 0,45 |
| Líder global (rolling) | 0,497 |
| Gate del modelo padre (1024px) | 0,4987 |

No se han publicado comparaciones con otros modelos de detección de señales de tráfico en la información proporcionada.

## Requisitos de hardware

- **VRAM**: no requiere VRAM, ya que la inferencia se realiza en CPU.
- **GPU recomendadas**: no aplica; el modelo está diseñado para CPU.
- **Compatibilidad con GPU de consumo**: no aplica, aunque podría ejecutarse en GPU si se exportara a otro formato (por ejemplo, TensorRT), pero no se proporciona esa opción.
- **Opciones de despliegue**: ONNX Runtime en CPU. El empaquetado incluye un script `_predict_one` que convierte BGR a RGB y realiza el preprocesamiento. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: 85 ms p95 por imagen en 2 vCPU-class cores (medido en 2026-08-22), dentro del presupuesto de 100 ms + 10 ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de señales de tráfico con YOLO11n en ONNX). El modelo pertenece a un entorno de competición específico (Subnet 44 de Bittensor), por lo que no se pueden establecer comparaciones directas sin datos adicionales.

## Limitaciones y advertencias

- **Licencia**: no se ha especificado ninguna licencia en el repositorio, por lo que se desconoce si el modelo puede utilizarse comercialmente.
- **Datos de entrenamiento**: no se ha publicado información sobre el dataset, la composición ni el número de imágenes, lo que limita la evaluación de sesgos y generalización.
- **Dominio específico**: el modelo está entrenado para un dominio concreto de señales de tráfico (frames oficiales de la competición). Su rendimiento en otros escenarios (otras regiones, tipos de señales, condiciones climáticas) no está garantizado.
- **Conversión de color**: la dependencia de la conversión BGR→RGB es crítica. Si se omite, el rendimiento cae drásticamente (mAP50 de 0,8364 a 0,6307), lo que puede provocar fallos en producción si el pipeline no lo implementa.
- **Sesgos**: al ser un modelo de visión entrenado en un dataset específico, puede tener sesgos hacia las condiciones de las imágenes de entrenamiento (por ejemplo, iluminación, geografía, tipo de carretera).
- **Alucinación**: al ser un detector, no genera texto, pero puede producir falsos positivos (detección de señales que no existen), como indica la precisión de 0,951 (no perfecta).
- **Soporte**: el modelo se publica sin documentación adicional sobre el proceso de entrenamiento, hiperparámetros o configuración exacta.

## Enlaces

- [HuggingFace: XXMiner/ScoreVision_roadsigns](https://huggingface.co/XXMiner/ScoreVision_roadsigns)
- [Perfil de XXMiner en HuggingFace](https://huggingface.co/XXMiner/models)
- [GitHub: score-technologies/score-vision (Subnet 44)](https://github.com/score-technologies/score-vision)
- [README del miner en el repo oficial](https://github.com/score-technologies/score-vision/blob/main/miner/README.md)
- [Modelo similar en HuggingFace (iotaminer/ScoreVision)](https://huggingface.co/iotaminer/ScoreVision)
