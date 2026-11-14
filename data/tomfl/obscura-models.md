# tomfl/obscura-models

## Resumen

Obscura models es un repositorio de modelos ONNX orientados a la restauracion de imagenes, publicado por el desarrollador tomfl como backend de la aplicacion Obscura (https://obscura.tomfl.dev). El repositorio contiene actualmente una unica variante destacada: NAFNet-SIDD-width32, un modelo de eliminacion de ruido (denoising) exportado a ONNX a partir de los pesos oficiales de Megvii entrenados sobre el dataset SIDD.

El modelo subyacente es NAFNet (Nonlinear Activation Free Network), presentado en el paper "Simple Baselines for Image Restoration" (Chen, Chu, Zhang y Sun, ECCV 2022). NAFNet propone una arquitectura de restauracion de imagen sin funciones de activacion no lineales en los bloques principales, lo que reduce el coste computacional manteniendo resultados competitivos frente a alternativas como Restormer o SwinIR en tareas de denoising y deblurring.

La relevancia practica de este repositorio es que ofrece los pesos ya convertidos a ONNX (opset 17), con variantes FP32 y FP16, listos para inferencia multiplataforma sin dependencia de PyTorch. El objetivo declarado del autor es servir como fuente de modelos descargados bajo demanda por la aplicacion Obscura, lo que simplifica el despliegue en entornos cliente ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (Nonlinear Activation Free Network), red de restauracion de imagenes basada en convoluciones y bloques NAFBlock |
| Parametros totales | no disponible (el modelo original es NAFNet-SIDD-width32; el numero exacto de parametros no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP32 (nafnet-sidd-w32.onnx) y FP16 (nafnet-sidd-w32-fp16.onnx, pesos y matematicas en FP16 con entradas/salidas FP32) |
| Idiomas soportados | no disponible (modelo de imagen, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

Detalles adicionales de los artefactos:

| Fichero | Precision | Tamano | SHA-256 |
|---|---|---|---|
| `nafnet-sidd-w32.onnx` | FP32 | 117.085.438 B (~117 MB) | `092dc37894ee36f3ceef1359f73b0e566a24c9194138458cfd92b56d8f74647a` |
| `nafnet-sidd-w32-fp16.onnx` | FP16 (pesos y matematicas), FP32 in/out | 58.957.563 B (~59 MB) | `74bb136d6e78ebab8490c7db29b5bda37c270bd382a03990c66d9cc17271f581` |

## Arquitectura y entrenamiento

NAFNet es una red neuronal convolucional para restauracion de imagenes que elimina las funciones de activacion no lineales tradicionales (ReLU, GELU, sigmoid) de sus bloques principales. La arquitectura se organiza en torno a NAFBlocks, que combinan capas de normalizacion, convoluciones depthwise y operaciones de puerta (gating) simples, junto con un esquema de atencion simplificada. Esta simplificacion reduce el coste computacional y el uso de memoria en comparacion con transformers de vision como Restormer, manteniendo un rendimiento competitivo en benchmarks de denoising y deblurring.

Los pesos incluidos corresponden a la variante oficial `NAFNet-SIDD-width32.pth` de Megvii (SHA-256 `89c70e808d1783b6c07911306e106aaf0d4f7f3da8c61078b99ff7f8929a26f4`), entrenada sobre el dataset SIDD (Smartphone Image Denoising Dataset), un conjunto de imagenes ruidosas capturadas con smartphones en condiciones reales. La conversion a ONNX se realizo sin modificar los pesos, usando el script `tools/ml/export_nafnet.py` del repositorio de Obscura, con opset 17; la variante FP16 se genero con onnxconverter-common manteniendo entradas y salidas en FP32. No se dispone de informacion sobre tecnicas de RLHF, DPO ni datos de entrenamiento adicionales mas alla de los indicados en la model card.

## Capacidades

- Eliminacion de ruido en imagenes (denoising) entrenada especificamente sobre ruido de sensor de smartphone (dataset SIDD).
- Restauracion de imagenes RGB en formato float32 NCHW con valores en el rango 0..1.
- Procesamiento de imagenes de cualquier altura y anchura siempre que sean multiplos de 16; el autor deja fuera el padding interno de la red y delega el tileado al llamador.
- Inferencia via ONNX Runtime u otros runtimes compatibles con ONNX opset 17, en CPU y GPU.
- Variante FP16 para reducir huella de memoria y acelerar inferencia en hardware con soporte de precision media.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision image-to-image.
- No dispone de modo thinking, vision-language, audio ni generacion de texto.

## Casos de uso

- Limpieza de fotos de movil en aplicaciones de edicion: el modelo elimina ruido de sensor en imagenes capturadas con smartphone (dominio SIDD), por lo que encaja como paso de preprocesado antes de retoque o compresion.
- Pipeline de preprocesado en servicios de vision por computador: reducir ruido antes de tareas de deteccion, segmentacion o OCR mejora la robustez de modelos posteriores; el formato ONNX permite integrarlo en pipelines heterogeneos.
- Aplicacion de escritorio o movil con inferencia local: los ficheros de ~59 MB (FP16) y ~117 MB (FP32) caben en dispositivos con recursos limitados, y ONNX Runtime permite ejecucion sin GPU dedicada.
- Procesado por lotes de archivos fotograficos: el modelo acepta entradas de dimensiones arbitrarias (multiplos de 16) con tileado externo, lo que permite procesar lotes de resoluciones variadas en servidores.
- Restauracion de imagenes en herramientas de bajo consumo: la variante FP16 reduce el ancho de banda de memoria y puede acelerar la inferencia en GPUs consumer compatibles con FP16.
- Integracion en aplicaciones web mediante ONNX Runtime Web o backends WASM: el modelo puede ejecutarse en el navegador del cliente, evitando enviar imagenes a servidores y reduciendo latencia y coste de infraestructura.
- Benchmarking y comparacion de tecnicas de restauracion: al estar exportado sin modificar los pesos oficiales, sirve como referencia reproducible para comparar NAFNet con otras arquitecturas de denoising.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas PSNR/SSIM ni comparaciones numericas con otros modelos; solo referencia el paper original de NAFNet (ECCV 2022) y el dataset de entrenamiento SIDD.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia orientativa, el fichero FP32 ocupa ~117 MB y el FP16 ~59 MB en disco; la memoria en tiempo de ejecucion depende de la resolucion de entrada y del tileado, no solo del tamano de los pesos.
- GPU recomendadas: no especificadas en la informacion proporcionada. Al ser un modelo convolucional de ~117 MB en FP32, es compatible con GPUs consumer modernas (por ejemplo, RTX 3060/4060/4090) mediante ONNX Runtime con provider CUDA o TensorRT.
- Cabe en GPU consumer: si, tanto en FP32 como en FP16, dado el reducido tamano de los pesos; la viabilidad con resoluciones muy altas depende del tileado implementado por el llamador.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT, CoreML, WASM), y cualquier runtime compatible con ONNX opset 17. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| NAFNet-SIDD-width32 (este repo) | no disponible | no aplica | Denoising (SIDD) | MIT | ONNX (FP32/FP16) | Hugging Face, ONNX listo para usar |
| NAFNet-SIDD-width64 (oficial Megvii) | no disponible | no aplica | Denoising (SIDD) | MIT | PyTorch (.pth) | GitHub megvii-research/NAFNet |
| Restormer | no disponible | no aplica | Denoising, deblurring, deraining | MIT (segun repositorio original) | PyTorch | GitHub, Hugging Face |
| SwinIR | no disponible | no aplica | Restauracion de imagen | Apache 2.0 (segun repositorio original) | PyTorch | GitHub, Hugging Face |

Nota: los datos de parametros, rendimiento y contexto de los modelos alternativos no estan disponibles en la informacion proporcionada; la comparativa se limita a categoria, licencia y formato de distribucion.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente sobre el dataset SIDD (ruido de sensor de smartphone); su rendimiento puede degradarse en otros tipos de ruido (por ejemplo, ruido gaussiano sintetico, artefactos de compresion JPEG o ruido de video).
- No incluye padding interno: el llamador debe asegurar que las dimensiones de entrada son multiplos de 16 y gestionar el tileado para imagenes grandes; un uso incorrecto produce errores o artefactos en los bordes.
- Riesgo de alucinacion: en modelos de restauracion de imagen, el equivalente es la generacion de detalles inexistentes o suavizado excesivo en zonas de bajo contraste; no hay datos publicados sobre este comportamiento en la informacion disponible.
- Sesgos conocidos: no disponibles; al operar sobre pixeles, los sesgos potenciales dependen del dataset SIDD y de su composicion (dispositivos, condiciones de iluminacion, escenas).
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la obligacion de conservar el aviso de copyright. El aviso de NAFNet original (Copyright (c) 2022 megvii-model) debe mantenerse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y una unica variante de modelo documentada; no hay garantia de mantenimiento continuo ni de soporte por parte del autor.
- La fecha de creacion indicada (2026-10-14) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo en produccion.
- No hay informacion sobre latencia, throughput ni calidad medida (PSNR/SSIM), por lo que la evaluacion en produccion debe realizarse empiricamente sobre el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tomfl/obscura-models
- Aplicacion Obscura: https://obscura.tomfl.dev
- Paper NAFNet (ECCV 2022): https://github.com/megvii-research/NAFNet
- Repositorio oficial NAFNet: https://github.com/megvii-research/NAFNet
- Licencia NAFNet (MIT): https://github.com/megvii-research/NAFNet/blob/main/LICENSE
- Script de exportacion (referenciado en la model card): `tools/ml/export_nafnet.py` en el repositorio de Obscura (no se proporciona URL directa en la informacion disponible)
