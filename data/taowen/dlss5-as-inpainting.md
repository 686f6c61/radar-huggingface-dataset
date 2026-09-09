# taowen/dlss5-as-inpainting

## Resumen

El modelo `dlss5-as-inpainting` es una reconstrucción de investigación de la red de imagen estática de DLSS 5, desarrollada por el autor `taowen`. No se trata de un modelo de lenguaje, sino de una red neuronal de procesamiento de imágenes (image-to-image) que se distribuye en formato ONNX. Los pesos se extraen del paquete real incluido en la DLL `nvngx_dlssnr.dll` y se recompone la red de 71 bloques para reconstruir el comportamiento del upscaler estático.

El modelo está diseñado para estudiar la arquitectura interna de DLSS y validar numéricamente la reconstrucción, con aplicación concreta en la reproyección estéreo 3D como potenciador de inpainting temporal para el ojo derecho. Incluye tres variantes de precisión: una referencia portable con reducciones FP64 y límites FP8 emulados, una variante AMD en FP16 de 301 MB y una variante mixta INT8/FP16 de 234 MB. La entrada está fijada a 256×256 píxeles en batch 1 y el modelo tiene 145.755.691 parámetros. Es un proyecto de investigación, no un lanzamiento oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de 71 bloques para reconstrucción de imagen estática; detalles completos de bloques no disponibles |
| Parametros totales | 145.755.691 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256×256 píxeles (entrada fija, batch 1) |
| Tipos de cuantizacion | FP32 (referencia), FP16 (variante amd_fp16), INT8 mixto (variante amd_int8_vit, con matrices feed-forward de ViT en INT8) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | No disponible |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

La red reconstruida se ofrece como un modelo ONNX de 256×256 píxeles que toma un tensor `rgb` de forma `[1, 3, 256, 256]` en espacio de color lineal RGB y devuelve un tensor `output` de igual forma. El autor describe el modelo como una reconstrucción de la red de imagen estática de 71 bloques de DLSS 5, con componentes de tipo ViT en las matrices feed-forward grandes que se cuantizan en la variante INT8. No se dispone de una descripción arquitectónica completa de los bloques.

El proceso de reconstrucción no parte de un entrenamiento desde cero, sino de la extracción de los pesos reales del paquete `WEIGHTS_HT` de la DLL `nvngx_dlssnr.dll`. La herramienta de exportación verifica el SHA-256 del paquete antes de cargar los pesos y rechaza paquetes no coincidentes. En la reconstrucción se seleccionan componentes concretos: ruido de frame-zero, pérdida de color/historia sin estado, características escalares/auxiliares a cero y la rama de postprocesado RGB de referencia. Por tanto, no hay información sobre dataset de entrenamiento ni técnicas de ajuste tipo RLHF o DPO, al no ser un modelo generativo de texto.

## Capacidades

- Reconstrucción de imágenes estáticas a resolución fija de 256×256, con el mismo contrato de tensores (RGB lineal, rango `[0,1]`) que la red original.
- Conversión automática entre archivos de imagen en formato sRGB y los tensores lineales esperados por el modelo, mediante el script `tools/run_dlss5_onnx.py`.
- Soporte de inferencia en CPU mediante ONNX Runtime, sin necesidad de PyTorch, CUDA ni la DLL original.
- Variantes específicas para GPUs AMD Radeon con precisión FP16 y cuantización INT8 mixta, que usan el proveedor MIGraphX con colocación explícita en GPU.
- Herramientas de exportación desde la DLL, así como scripts de conversión de precisión y cuantización int8 (`tools/optimize_dlss5_amd.py`, `tools/quantize_dlss5_int8.py`).
- No soporta tool calling, agentes, razonamiento multietapa ni procesamiento de lenguaje natural: es un modelo puramente visual.

## Casos de uso

- Investigación de arquitecturas de superresolución: usar la reconstrucción ONNX como referencia para analizar los componentes de los 71 bloques y comparar estructuras propias de reescalado o reconstrucción.
- Reproyección estéreo 3D: integrar el modelo en el pipeline de reproyección de profundidad descrito en el repositorio para generar la vista del ojo derecho mediante inpainting temporal, aprovechando la reconstrucción estática como mejora de imagen.
- Evaluación de rendimiento en hardware AMD: probar las variantes FP16 e INT8 en un sistema ROCm/Linux con Radeon 890M y medir tiempos de inferencia, consumo de memoria y estabilidad del runtime.
- Análisis de precisión numérica: verificar la equivalencia entre la salida del ONNX de referencia y la salida de PyTorch mediante la validación incluida, que reporta error máximo absoluto 0 en las imágenes de prueba.
- Experimentación con cuantización INT8: estudiar el efecto de reducir a 8 bits las 16 matrices feed-forward de ViT en la calidad de la reconstrucción y la velocidad de ejecución en GPU AMD.
- Validación de integraciones en pipelines de imagen: usar el modelo como referencia para comprobar que una implementación propia de inpainting o reconstrucción produce resultados numéricamente coherentes antes de incorporarla a un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales de NLP o visión (MMLU, HumanEval, GSM8K) porque este modelo no pertenece a esa categoría. Sí se dispone de los datos de validación interna y tiempos de inferencia proporcionados por el autor.

| Metrica | Valor |
|---|---|
| Tiempo de inferencia en Radeon 890M, FP16 (256×256, tras warmup) | 161,5 ms/imagen |
| Tiempo de inferencia en Radeon 890M, INT8 mixto (256×256, tras warmup) | 176,5 ms/imagen |
| Tiempo de referencia en CPU (sistema original, 4 hilos) | 3,4 – 3,8 s/imagen |
| Error absoluto medio (GPU vs referencia, RGB lineal) | 0,0044 – 0,0060 |
| Error máximo por canal (GPU vs referencia, RGB lineal) | ≈ 0,136 |
| Coincidencia con PyTorch (imagenes de validacion, CPU) | Error maximo absoluto 0 |
| Coincidencia con PyTorch CUDA en RTX 5090 | Error maximo absoluto 0 (con buffers serializados) |

## Requisitos de hardware

- Pesos ONNX: 1.167.220.673 bytes para la referencia (≈1,17 GB), 301 MB para la variante FP16 AMD y 234 MB para la variante INT8 AMD. Se requiere al menos memoria suficiente para alojar los pesos, más el overhead del runtime ONNX.
- GPU validada: Radeon 890M con ROCm 6.4.2 en Linux, usando las variantes AMD con proveedor MIGraphX. También se verificó la ejecución en RTX 5090 con PyTorch CUDA, aunque no como benchmark de ONNX Runtime.
- No se necesita CUDA, ni la DLL, ni pesos externos para la inferencia básica con ONNX Runtime.
- Despliegue: el repo proporciona el script `tools/run_dlss5_onnx.py` para inferencia por CLI. La variante AMD requiere ejecutar `tools/setup_amd_runtime.py` y usar `--provider amd`. El primer arranque del runtime AMP/MIGraphX puede tardar varios minutos en compilar; las compilaciones se cachean.
- La latencia medida es de 161,5 ms (FP16) y 176,5 ms (INT8) en Radeon 890M tras warmup, lo que permite procesar unas 6 imágenes por segundo en ese hardware. En CPU, la latencia asciende a 3,4–3,8 s por imagen.

## Comparativa con modelos similares

No se ha identificado ningún modelo comparable publicado en la información disponible. No se han hallado otras reconstrucciones públicas de la red de DLSS con las que comparar parámetros, rendimiento o licencia. La siguiente tabla compara las variantes internas del propio modelo.

| Variante | Tamano | Cuantizacion | Uso previsto | Rendimiento en Radeon 890M |
|---|---|---|---|---|
| `dlss5_real_static_256.onnx` | ≈1,17 GB | FP64/FP8 emulado | Referencia portable y reproducible | No medido en GPU |
| `dlss5_real_static_256_amd_fp16.onnx` | 301 MB | FP16 | GPU AMD, variante recomendada | 161,5 ms/imagen |
| `dlss5_real_static_256_amd_int8_vit.onnx` | 234 MB | INT8 mixto | GPU AMD, menor tamaño | 176,5 ms/imagen |

## Limitaciones y advertencias

- No es un lanzamiento oficial de NVIDIA; no reproduce por completo el DLL de DLSS ni su integración temporal o de renderizado.
- La concordancia numérica con la referencia no implica mejora de calidad de imagen. En regiones planas y oscuras el modelo puede añadir grano.
- La validación de calidad se basa únicamente en cuatro imágenes de ejemplo; no supone una evaluación amplia de calidad.
- El modelo está fijado a batch 1 y 256×256 píxeles; no es un upscaler temporal general ni una API de inpainting enmascarado.
- La variante AMD en INT8 no corre más rápido que la FP16 en la máquina probada, aunque es un 22 % más pequeña.
- Las variantes AMD alteran la precisión deliberadamente y no coinciden exactamente con la referencia. La calibración INT8 se hizo con imágenes de paisaje y piedra; las imágenes de tierra y retrato no se usaron en la calibración.
- La licencia del modelo en HuggingFace figura como "no disponible"; no se especifican condiciones de uso comercial ni de redistribución.
- El setup AMD está ajustado a un stack concreto de ROCm/Linux y no es un instalador de drivers. El rendimiento con CUDA y DirectML no ha sido medido.
- El proyecto tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere un uso limitado o muy reciente.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/taowen/dlss5-as-inpainting
- Repositorio en GitHub: https://github.com/taowen/dlss5-as-inpainting
- Guía de AMD (dentro del repo): https://github.com/taowen/dlss5-as-inpainting/tree/master/docs
- Documento de validación ONNX (dentro del repo): https://github.com/taowen/dlss5-as-inpainting/blob/master/docs/DLSS5_ONNX_VALIDATION.md
