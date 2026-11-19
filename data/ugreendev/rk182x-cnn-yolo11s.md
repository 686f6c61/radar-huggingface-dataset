# UGREENDEV/RK182X-CNN-YOLO11s

## Resumen

RK182X-CNN-YOLO11s es un modelo de detección de objetos basado en la arquitectura YOLO11s de Ultralytics, convertido al formato RKNN para su ejecución sobre las NPU de los chips Rockchip RK1820 y RK1828. Lo publica el usuario UGREENDEV en Hugging Face y ModelScope, y no se trata de un modelo entrenado desde cero, sino de una conversión de los pesos ONNX oficiales de YOLO11s a un binario optimizado para el runtime RKNN v1.1.0.

La relevancia del artefacto es de despliegue: permite ejecutar un detector YOLO11s de resolución 640x640 con cuantización w8a8 (pesos y activaciones de 8 bits) sobre una única NPU del chip RK182X, lo que lo hace útil para sistemas embebidos, cámaras inteligentes y dispositivos de borde con aceleración Rockchip. No aporta innovaciones en arquitectura ni en entrenamiento: hereda íntegramente el diseño CNN de YOLO11s.

El repositorio tiene un tamaño declarado de 0.0 GB, sin descargas ni likes en el momento de la consulta, y una licencia etiquetada como "other" que remite a la AGPL-3.0 del modelo original de Ultralytics, con las condiciones adicionales del RKNN Toolkit y del RKNN Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLO11s de Ultralytics, convertida a RKNN) |
| Parametros totales | no disponible (YOLO11s ronda los 9,4 M según Ultralytics; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (modelo fuente bajo AGPL-3.0; aplican además licencias de RKNN Toolkit y RKNN Runtime) |
| Formato de pesos | RKNN (runtime v1.1.0); el modelo fuente es ONNX |
| Resolucion de entrada | 640x640 |
| Chips soportados | RK1820, RK1828 |
| Nucleos NPU | 1 |
| Version de runtime RKNN | v1.1.0 |
| Tarea | object-detection |

## Arquitectura y entrenamiento

El modelo es una red convolucional YOLO11s, la variante "small" de la familia YOLO11 de Ultralytics, con entrada de 640x640 píxeles. No hay información en la model card sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre fases de ajuste fino o RLHF, porque el autor no ha reentrenado el modelo: parte del ONNX oficial de Ultralytics y lo convierte a RKNN. La innovación técnica, por tanto, no está en la arquitectura sino en el pipeline de conversión y cuantización w8a8 para la NPU de Rockchip.

La conversión se realiza con el RKNN Toolkit en su versión compatible con el runtime v1.1.0 y produce un artefacto que debe ejecutarse con el runtime y el driver correspondientes en el dispositivo. El repositorio incluye un directorio de configuración (`YOLO11s-640x640-w8a8-1`) con `config.json`, manifiesto de ficheros y sumas SHA-256 para verificar la integridad antes del despliegue.

## Capacidades

- Detección de objetos en imágenes de 640x640 píxeles, con las clases del conjunto COCO que hereda YOLO11s (no detalladas en la model card).
- Inferencia acelerada por NPU en chips Rockchip RK1820 y RK1828, con un solo núcleo NPU.
- Ejecución cuantizada w8a8, pensada para dispositivos de borde con recursos limitados.
- Verificación de integridad mediante SHA-256 de los ficheros del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un detector visual.
- No dispone de modo "thinking", visión generativa, audio ni ninguna capacidad multimodal más allá de la detección.

## Casos de uso

- Vigilancia perimetral en cámaras IP con SoC Rockchip: el modelo corre sobre la NPU RK182X a 640x640 y permite detectar personas, vehículos u objetos en el propio dispositivo, sin enviar vídeo a la nube.
- Control de aforo y conteo de personas en comercios: al ser un detector ligero y cuantizado, puede integrarse en un flujo de vídeo continuo en un dispositivo de borde con bajo consumo.
- Inspección industrial en línea de producción: detección de defectos o piezas en cintas transportadoras usando la NPU del chip, con latencia adecuada para procesos en tiempo real.
- Drones y robótica móvil: el bajo consumo del RK182X y la cuantización w8a8 permiten ejecutar detección a bordo en plataformas con batería limitada.
- Sistemas de aparcamiento inteligente: detección de vehículos y plazas libres en cámaras fijas, con procesamiento local y sin dependencia de conectividad.
- Prototipado rápido en hardware Rockchip: sirve como referencia para validar el pipeline RKNN (runtime, driver, verificación SHA-256) antes de desplegar detectores propios entrenados con Ultralytics.
- Automatización agrícola: detección de frutos, plagas o maquinaria en campo mediante cámaras conectadas a un SoC RK182X.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, latencia ni throughput para el modelo convertido.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828, con un núcleo NPU.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM: no aplica; el modelo se ejecuta sobre la NPU del SoC, no sobre GPU dedicada.
- GPU recomendadas: no aplica para inferencia; la conversión a RKNN se realiza en un entorno de desarrollo con RKNN Toolkit, no en GPU de consumo.
- ¿Cabe en GPU de consumo? No es el objetivo: el artefacto está pensado para NPU integrada en SoC Rockchip.
- Opciones de despliegue: RKNN Runtime sobre RK1820/RK1828; descarga vía `hf download` o `modelscope download`; verificación con `sha256sum -c SHA256SUMS`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio declara 0.0 GB, aunque conviene comprobar el tamaño real tras la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| RK182X-CNN-YOLO11s | no disponible (YOLO11s ~9,4 M según Ultralytics) | 640x640 | RKNN w8a8 | NPU RK1820/RK1828 | other (fuente AGPL-3.0) |
| YOLO11s ONNX (Ultralytics) | ~9,4 M (según Ultralytics) | 640x640 | ONNX | CPU/GPU genérica | AGPL-3.0 |
| YOLOv8s (Ultralytics) | no disponible en la información | 640x640 | ONNX/PyTorch | CPU/GPU genérica | AGPL-3.0 |
| Otros detectores RKNN de la comunidad | no disponible | variable | RKNN | NPU Rockchip | variable |

La comparación con alternativas concretas de la misma categoría (detectores RKNN para RK182X) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en chips RK1820 y RK1828; no es portable a otras NPU ni a GPU genéricas sin reconversión.
- Requiere el runtime RKNN v1.1.0 y el driver correspondiente; una versión distinta en el dispositivo puede impedir la ejecución.
- La cuantización w8a8 puede degradar la precisión respecto al modelo ONNX en fp32; no se han publicado métricas que cuantifiquen esa pérdida.
- Licencia "other" con modelo fuente AGPL-3.0: el uso comercial exige revisar las obligaciones de la AGPL-3.0 (incluida la disponibilidad del código fuente de obras derivadas) y las licencias del RKNN Toolkit y Runtime.
- No se especifican sesgos, clases detectadas ni composición del dataset; se heredan los del YOLO11s original de Ultralytics.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí de falsos positivos y falsos negativos propios de un detector cuantizado.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta: conviene verificar SHA-256 y probar en el hardware objetivo antes de producción.
- No hay información sobre idiomas ni capacidades de texto porque el modelo no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-YOLO11s
- Modelo fuente YOLO11s (Ultralytics): https://github.com/ultralytics/ultralytics
- Documentación de configuración en el repo: `YOLO11s-640x640-w8a8-1/README.md` (incluido en el repositorio)
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-CNN-YOLO11s --revision master --local_dir ./RK182X-CNN-YOLO11s`
- Descarga vía Hugging Face: `hf download UGREENDEV/RK182X-CNN-YOLO11s --revision v1.1.0 --local-dir ./RK182X-CNN-YOLO11s`
