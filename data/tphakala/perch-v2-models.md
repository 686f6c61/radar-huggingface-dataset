# tphakala/Perch-v2-Models

## Resumen

Perch v2 Models es un paquete de despliegue del clasificador bioacústico Perch v2 de Google Research, distribuido en formato ONNX por el usuario tphakala. El modelo original es una red EfficientNet-B3 entrenada para clasificar vocalizaciones de aves entre aproximadamente 15.000 especies, con un cabezal de clasificación de unos 91M de parámetros y un extractor de embeddings de unos 12M. Este repositorio no reentrena el modelo: lo convierte a ONNX, elimina la etapa DFT sustituyéndola por operaciones MatMul y genera recortes regionales del cabezal de clasificación.

La aportación principal es la creación de un catálogo de modelos regionales. Cada recorte restringe el clasificador a las especies plausibles en una zona geográfica concreta, seleccionadas mediante el filtro de rango BirdNET Geomodel v3.0. Como el cabezal de clasificación representa alrededor del 88% del coste computacional, reducir de 14.795 clases a entre 400 y 3.500 según la región disminuye de forma drástica el uso de memoria y el coste por inferencia. Los recortes son bit-exactos respecto al modelo completo en las especies que conservan.

Esto resulta relevante para despliegues de detección de aves en tiempo real sobre hardware limitado, como Raspberry Pi, teléfonos o placas SBC, donde ejecutar el modelo completo de forma continua es inviable. El repositorio ofrece variantes en FP32 con DFT, FP32 sin DFT (optimizada para OpenVINO) e INT8 parcial para ARM, cubriendo tanto GPUs como CPUs de bajo consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 (clasificador de audio bioacústico) |
| Parámetros totales | ~103M (aproximadamente 12M de embeddings + 91M de clasificación) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de audio, no generativo) |
| Tipos de cuantización | FP32, FP32 sin DFT (no_dft), INT8 parcial (solo MatMul) para ARM |
| Idiomas soportados | no disponible (no aplica; clasificación de audio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base es Perch v2 de Google Research, una EfficientNet-B3 adaptada a clasificación de audio bioacústico. La arquitectura consta de un extractor de embeddings de aproximadamente 12M de parámetros y un cabezal de clasificación de unos 91M de parámetros que produce logits sobre 14.795 clases. La conversión a ONNX y la optimización que reemplaza la DFT por operaciones MatMul (variante `no_dft`) fueron realizadas por justinchuby. Las etiquetas provienen de cgeorgiaw/Perch y siguen la taxonomía de iNaturalist.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado. La innovación técnica destacable de este repositorio no está en el entrenamiento, sino en la ingeniería de despliegue: la eliminación de la DFT para facilitar la ejecución en OpenVINO, la cuantización parcial INT8 limitada a las MatMul para ARM, y la generación de recortes regionales del cabezal de clasificación guiados por el filtro de rango BirdNET Geomodel v3.0. Cada recorte conserva la exactitud numérica del modelo completo sobre las especies incluidas.

## Capacidades

- Clasificación de vocalizaciones de aves entre hasta 14.795 clases en el modelo completo.
- Clasificación de eventos sonoros de FSD50K (198 clases) incluidos en los recortes regionales.
- Núcleo cosmopolita de 27 especies presente en todos los recortes regionales.
- Inferencia en tiempo real sobre audio en streaming, adecuada para detección continua.
- Despliegue en GPU (CUDA/TensorRT), CPU Intel (OpenVINO), ARM y Raspberry Pi.
- Recortes regionales bit-exactos respecto al modelo completo en las especies conservadas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de visión.

## Casos de uso

- Detección de aves en tiempo real en Raspberry Pi: usando la variante `_int8_arm` de un recorte regional (por ejemplo, `iberia` con 856 clases y 45,9 MB), el modelo cabe en placas de bajo consumo y puede procesar audio continuo sin agotar la RAM ni la CPU.
- Monitorización acústica pasiva en campo: un recorte como `central-europe` (873 clases, 70,8 MB en FP32) permite desplegar estaciones de escucha autónomas que registran especies presentes en la zona sin cargar las 14.795 clases del modelo completo.
- Aplicaciones móviles de identificación de aves: la variante INT8 ARM de un recorte local reduce el tamaño a decenas de MB, lo que hace viable la inferencia en el dispositivo sin conexión a un servidor.
- Investigación ecológica y seguimiento de biodiversidad: el catálogo regional permite seleccionar el recorte adecuado para cada zona de estudio, con la garantía de que los resultados son idénticos al modelo completo para las especies cubiertas.
- Despliegue en OpenVINO sobre CPU Intel: la variante `_no_dft_fp32` está optimizada para OpenVINO y permite ejecutar el modelo en portátiles o servidores sin GPU dedicada.
- Integración en pipelines de bioacústica con GPU: la variante `_fp32` con DFT es adecuada para CUDA/TensorRT cuando se necesita el modelo completo o un recorte amplio como `western-palearctic` (1.599 clases, 88,7 MB).
- Clasificación de eventos sonoros ambientales: los recortes incluyen 198 clases de FSD50K, lo que permite detectar sonidos no aviares junto con las especies de la región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Modelo completo en FP32: aproximadamente 409 MB en disco; requiere GPU con al menos 1-2 GB de VRAM libre para inferencia cómoda.
- Modelo completo sin DFT en FP32: aproximadamente 413 MB; optimizado para OpenVINO en CPU Intel y también ejecutable en ORT/CUDA.
- Modelo completo INT8 ARM: aproximadamente 131 MB; pensado para CPU ARM y Raspberry Pi con RAM limitada.
- Recortes regionales: entre 59,8 MB y 88,7 MB en FP32 y entre 43,2 MB y 50,5 MB en INT8 ARM, según la región.
- Cabe en GPUs de consumo como RTX 4090, RTX 3060 y similares, así como en placas Raspberry Pi y SBC.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, y ejecución en ARM mediante la variante INT8.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Clases | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Perch v2 (este repo) | ~103M | 14.795 (completo) / 400-3.500 (regional) | no aplica | Apache 2.0 | ONNX | HuggingFace |
| Perch original (cgeorgiaw/Perch) | no disponible | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| BirdNET | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas como BirdNET más allá de su mención como fuente del filtro de rango geográfico.

## Limitaciones y advertencias

- Los recortes regionales solo emiten especies dentro de la región seleccionada; especies fuera de rango no se detectarán aunque estén presentes en el audio.
- La selección de especies por región depende del filtro BirdNET Geomodel v3.0 y puede no cubrir aves divagantes o introducidas fuera de su rango modelado.
- El modelo está especializado en aves y un conjunto limitado de eventos FSD50K; no es un clasificador general de audio.
- No se han publicado métricas de precisión, recall ni tasas de falsos positivos en la información disponible, lo que dificulta evaluar el rendimiento en producción.
- Riesgo de confusión entre especies con vocalizaciones similares, especialmente en regiones con alta diversidad como el Neotrópico.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a Google Research, justinchuby y cgeorgiaw según corresponda.
- No apto para tareas de generación de texto, razonamiento, código, visión ni agentes.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad; conviene verificar la integridad de los archivos antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tphakala/Perch-v2-Models
- Modelo base en HuggingFace: https://huggingface.co/cgeorgiaw/Perch
- Conversión ONNX de referencia: https://huggingface.co/justinchuby/Perch-onnx
- Modelo Perch v2 de Google en Kaggle: https://www.kaggle.com/models/google/bird-vocalization-classifier/
- BirdNET Geomodel v3.0: https://github.com/birdnet-team/geomodel
