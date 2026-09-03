# tphakala/BirdNET-v3.0-Models

## Resumen

BirdNET v3.0 es un clasificador acústico de aves desarrollado por el K. Lisa Yang Center for Conservation Bioacoustics de la Universidad de Cornell, la Universidad Técnica de Chemnitz y el Museo de Historia Natural de Berlín. Este repositorio concreto, mantenido por tphakala, contiene una conversión a grafos ONNX nativos para GPU del modelo BirdNET+ V3.0 (preview 3.1), junto con un catálogo de modelos regionales que recortan las cabezas clasificadoras para reducir el consumo de memoria y latencia sin perder precisión en las especies conservadas.

El modelo original utiliza un backbone EfficientNetV2-S con un clasificador de tres cabezas que distingue 11.560 especies. La conversión GPU-native sustituye la operación STFT del front-end log-mel por una convolución 1D matemáticamente equivalente, lo que permite ejecutar el grafo completo en ONNX Runtime CPU, OpenVINO, CUDA y TensorRT. La entrada es audio crudo de 5 segundos a 32 kHz (160.000 muestras) y produce predicciones por especie y embeddings de 1.280 dimensiones.

La relevancia actual radica en que los modelos regionales reducen el uso de RAM hasta un 67 % (por ejemplo, de 685 MB a 229 MB en una Raspberry Pi 5) y la latencia entre un 15 y un 30 %, lo que los hace viables para detectores siempre activos en dispositivos de bajo consumo como teléfonos o placas SBC. El repositorio se publica bajo licencia CC BY-SA 4.0 y se distribuye como vista previa para investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S backbone con clasificador de tres cabezas |
| Parametros totales | no disponible (el modelo completo fp32 ocupa 557 MB en disco) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 5 segundos de audio (160.000 muestras a 32 kHz) |
| Tipos de cuantizacion | fp32 y fp16 (no se incluye int8) |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (grafos GPU-native; un solo modelo sirve para CPU y GPU) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone EfficientNetV2-S con un clasificador de tres cabezas que produce 11.560 salidas de especies. El front-end de log-mel se implementa mediante una operación STFT dentro del grafo ONNX, pero la versión GPU-native la reemplaza por una convolución 1D que realiza el enmarcado y la DFT con ventana, manteniendo equivalencia matemática. Esto permite que el grafo sea compatible con ONNX Runtime CPU, OpenVINO (x86 e Intel GPU), CUDA y TensorRT, algo que la exportación original no lograba porque ONNX Runtime carece de kernels CUDA/TensorRT para STFT y OpenVINO no puede traducir esa operación.

Los datos de entrenamiento y el proceso de entrenamiento (número de tokens, dataset, uso de RLHF/DPO) no se detallan en la información proporcionada. Se menciona que el modelo se basa en trabajos previos de Kahl et al. (2021) y Lasseck (2018), y que la conversión y el recorte regional son trabajo derivado bajo CC BY-SA 4.0. Los modelos regionales se generan a partir del filtro de rango BirdNET Geomodel v3.0, seleccionando las ~800 especies más probables por región más un núcleo cosmopolita, y son numéricamente idénticos al modelo completo en las especies conservadas (diferencia máxima absoluta < 1e-6).

## Capacidades

- Clasificación de vocalizaciones de aves: identifica 11.560 especies a partir de grabaciones de audio de 5 segundos.
- Generación de embeddings: produce representaciones de 1.280 dimensiones que pueden usarse para búsqueda de similitud, clustering o entrenamiento de clasificadores adicionales.
- Inferencia en múltiples plataformas: el mismo grafo ONNX funciona en CPU (ONNX Runtime, OpenVINO), GPU NVIDIA (CUDA, TensorRT) y GPU Intel (OpenVINO).
- Modelos regionales: permite seleccionar un subconjunto de especies por área geográfica (p. ej., nórdico, ibérico, Europa central) para reducir memoria y latencia sin perder precisión en las especies locales.
- Compatibilidad con Perch v2: el formato de entrada (160.000 muestras a 32 kHz) coincide con el de Perch v2, lo que permite alimentar ambos clasificadores con el mismo buffer.
- No incluye capacidades de texto, tool calling ni razonamiento multi-paso; es un modelo puramente acústico.

## Casos de uso

- Monitorización pasiva de biodiversidad: desplegar un detector siempre activo en una estación de campo con Raspberry Pi o similar, usando un modelo regional para clasificar vocalizaciones en tiempo real y registrar presencia de especies.
- Estudios fenológicos: analizar largas grabaciones continuas (p. ej., 24 horas) para detectar patrones estacionales de actividad vocal, gracias al bajo consumo de RAM del modelo regional (229 MB en RPi5).
- Ciencia ciudadana: integrar el modelo en una aplicación móvil que identifique aves a partir de una grabación de 5 segundos, usando fp16 para reducir la descarga (279 MB) sin penalización en GPU.
- Investigación en bioacústica: extraer embeddings de 1.280 dimensiones de grandes corpus de audio para entrenar clasificadores específicos de especies raras o para análisis de similitud entre poblaciones.
- Sistemas de alerta temprana: en zonas con especies invasoras o en peligro, configurar un detector regional que emita alertas cuando se detecte una vocalización de una especie objetivo, con latencia de ~128 ms en RPi5 con OpenVINO.
- Evaluación de impacto ambiental: procesar grabaciones de estudios de impacto para inventariar avifauna en un área concreta, usando el catálogo regional correspondiente (p. ej., iberia con 627 especies).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (precisión top-1, mAP, etc.) en la información disponible. Sin embargo, el README incluye mediciones de latencia y uso de memoria para inferencia con batch 1 y ventana de 5 segundos:

| Dispositivo | Full fp32 | Regional fp32 (nórdico) | Pico de RAM full / regional |
|---|---:|---:|---:|
| RPi5, OpenVINO | 168 ms | 128 ms | - |
| RPi5, ORT 4 hilos | 363 ms | 253 ms | 685 MB / 229 MB |
| RPi4B, ORT 4 hilos | 874 ms | 743 ms | 688 MB / 236 MB |
| x86 i7-1260P, ORT 4 hilos | 70 ms | 59 ms | - |

OpenVINO es aproximadamente 2,2 veces más rápido que ONNX Runtime en Raspberry Pi 5. El batching solo ayuda en GPU (aproximadamente 1,5 veces a batch 8 con FP16); en CPU se recomienda batch 1. En FP16, ONNX Runtime convierte los pesos a FP32 en inferencia, por lo que en CPU el rendimiento es igual o peor que FP32 y consume más RAM en dispositivos ARM.

## Requisitos de hardware

- El modelo completo fp32 ocupa 557 MB en disco; fp16 ocupa 279 MB. Los modelos regionales fp32 van de 135 MB a 144 MB según la región.
- En CPU, el modelo completo fp32 requiere ~685 MB de RAM en Raspberry Pi 5 y ~688 MB en RPi4B; los regionales reducen a ~229-236 MB.
- Para GPU, se requiere una tarjeta con al menos 1 GB de VRAM para el modelo fp32 completo (557 MB) y menos de 300 MB para fp16, aunque no se han publicado mediciones exactas de VRAM.
- GPUs recomendadas: cualquier NVIDIA con soporte CUDA (p. ej., RTX 3060, A100) o Intel GPU integrada (a través de OpenVINO). También funciona en CPU x86 y ARM.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA/TensorRT), OpenVINO (CPU/GPU Intel), o cualquier framework que consuma grafos ONNX (p. ej., Hugging Face Optimum).
- Latencia medida: 70 ms en x86 i7-1260P (CPU, 4 hilos), 168 ms en RPi5 con OpenVINO, 874 ms en RPi4B con ORT. En GPU no se proporcionan cifras, pero se espera menor latencia con FP16 y batching.

## Comparativa con modelos similares

| Modelo | Especies | Entrada | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| BirdNET v3.0 (este repo) | 11.560 | 5 s @ 32 kHz | predicciones + embeddings 1280 | CC BY-SA 4.0 | ONNX (GPU-native) |
| Perch v2 (Google) | no disponible | 5 s @ 32 kHz | predicciones + embeddings | no disponible | no disponible |
| BirdNET v2.x (original) | ~6.000 (estimado) | 3 s @ 48 kHz (típico) | predicciones | CC BY-NC-SA | TensorFlow / ONNX |

La comparativa es limitada porque no se dispone de especificaciones detalladas de Perch v2 ni de BirdNET v2.x en la información proporcionada. Se sabe que BirdNET v3.0 comparte el formato de entrada con Perch v2, lo que facilita su uso conjunto. No hay datos cuantitativos de rendimiento (precisión) disponibles para comparar.

## Limitaciones y advertencias

- Es una vista previa para desarrollo (preview 3.1); los autores indican que es para investigación y evaluación, no para producción sin validación adicional.
- Licencia CC BY-SA 4.0: requiere atribución y comparte bajo la misma licencia las obras derivadas. Además, los términos de uso prohíben explícitamente el uso en caza furtiva o fines militares.
- El modelo solo clasifica vocalizaciones de aves; no es útil para otros sonidos (mamíferos, anfibios, etc.) y puede fallar en especies no incluidas en el catálogo regional.
- Los modelos regionales no emiten especies fuera de su área; si se despliega en una región no cubierta por ningún tile, se perderán detecciones de especies foráneas.
- No se han publicado métricas de precisión (accuracy, F1) en la información disponible; el rendimiento real depende de la calidad del audio y del entorno.
- En CPU, la variante FP16 no ofrece ventajas y puede consumir más RAM que FP32; se recomienda usar FP32 para dispositivos de bajos recursos.
- El modelo no soporta cuantización int8 en esta versión; la conversión a int8 no es efectiva porque el backbone es dominado por convoluciones, y solo se cuantizarían las capas MatMul/Gemm.
- No se incluyen datos de entrenamiento ni detalles sobre posibles sesgos geográficos o de especies; el catálogo regional se basa en el Geomodel v3.0, que puede tener cobertura desigual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tphakala/BirdNET-v3.0-Models
- Proyecto BirdNET (Cornell): https://birdnet.cornell.edu/
- Referencia académica: Kahl et al. (2021) - no se proporciona URL directa
- Referencia académica: Lasseck (2018) - no se proporciona URL directa
- Modelos base en Zenodo (distribuidos por el equipo BirdNET) - no se proporciona URL directa
- Catálogo regional de Perch v2 (mencionado como referencia) - no se proporciona URL directa
