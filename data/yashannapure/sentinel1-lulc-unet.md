# YashAnnapure/sentinel1-lulc-unet

## Resumen

Sentinel1-lulc-unet es un modelo de segmentación semántica de cobertura terrestre (land cover) desarrollado por YashAnnapure como proyecto final de un curso de Deep Learning (noviembre de 2026). El modelo asigna a cada píxel de 10 m de una imagen radar Sentinel-1 una de siete clases de cobertura del suelo (agua, árboles, vegetación baja, vegetación inundada, cultivos, construido y suelo desnudo) trabajando exclusivamente con datos SAR, sin depender de imágenes ópticas que se ven afectadas por nubosidad.

Técnicamente se trata de una U-Net con encoder ResNet-50 entrenada desde cero, que acepta una entrada de 4 canales (VV y VH del mes, más las medianas anuales de VV y VH como contexto temporal) y produce 7 mapas de puntuación por píxel. El repositorio contiene dos `state_dict` de PyTorch (semillas 0 y 1), pensados para promediar sus probabilidades en inferencia.

Su relevancia radica en la aproximación: monitorización mensual de cobertura terrestre a 10 m usando solo radar, lo que permite operar en regiones tropicales persistentemente nubladas. No obstante, el modelo es un prototipo académico, sin licencia de uso concedida y con métricas moderadas (mIoU 0,481 frente a etiquetas generadas por otro modelo, Dynamic World).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-50 (`segmentation_models_pytorch.Unet`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada de 256 × 256 píxeles a 10 m |
| Tipos de cuantización | no disponible (pesos en float32, `state_dict`) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | other (sin licencia concedida; pesos públicos solo para revisión del proyecto) |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |
| Canales de entrada | 4 (VV mensual, VH mensual, mediana anual VV, mediana anual VH) |
| Canales de salida | 7 clases por píxel |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es una U-Net estándar con encoder ResNet-50 inicializado desde cero (`encoder_weights=None`), con 4 canales de entrada y 7 clases de salida. La innovación principal reside en la ingeniería de entrada: además de las composiciones medianas mensuales de VV (recortadas a [-25, 5] dB) y VH (recortadas a [-35, -5] dB), se añaden las medianas de los doce compuestos mensuales del año como contexto temporal, todo normalizado al rango 0-1 sobre una rejilla de 10 m.

El entrenamiento se realizó sobre 103 emplazamientos entre 2022 y 2025, con ventanas de 256 × 256 píxeles. Las etiquetas provienen de Dynamic World (mensuales); donde falta etiqueta mensual se usa la anual con peso de pérdida 0,3, conservada solo donde ESA WorldCover coincide. Se empleó entropía cruzada ponderada por la inversa de la raíz cuadrada de la frecuencia de clase, optimizador AdamW (lr 1e-3, weight decay 1e-4), schedule coseno, 15 épocas y aumentación con rotaciones aleatorias de 90° y volteos. Se conservó el último epoch. No se documenta uso de RLHF, DPO ni decodificación especulativa (no aplica a un modelo de segmentación).

## Capacidades

- Segmentación semántica densa de imágenes radar Sentinel-1 en 7 clases de cobertura terrestre.
- Procesamiento de datos SAR (VV y VH) sin dependencia de imágenes ópticas.
- Incorporación de contexto temporal anual mediante canales adicionales de mediana anual.
- Inferencia mensual a resolución de 10 m por píxel.
- Ensemble de dos semillas mediante promedio de probabilidades.
- Integración con Google Earth Engine a través del script `prototype.py` del proyecto para descarga y preprocesado automático.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Monitorización mensual de cobertura terrestre en regiones tropicales: al operar solo con radar, el modelo evita la persistente nubosidad que invalida las imágenes ópticas; su mIoU de 0,366 en trópicos refleja el margen de mejora, pero permite seguimiento estacional continuo.
- Detección de masas de agua y superficies construidas: son las clases con mejor rendimiento (IoU 0,790 y 0,807 respectivamente), adecuadas para seguimiento de expansión urbana o inundaciones.
- Cartografía de cultivos a escala regional: con IoU 0,409 en cultivos, puede servir como capa preliminar en estudios agrícolas que luego se refinen con datos de campo.
- Análisis de cobertura arbórea: la clase árboles alcanza IoU 0,633, útil para inventarios forestales aproximados en zonas sin datos ópticos.
- Prototipado e investigación académica: el repositorio incluye el script de extremo a extremo para reproducir inferencias con coordenadas y fechas concretas, lo que facilita la validación metodológica.
- Generación de capas de contexto anual: los canales de mediana anual permiten derivar mapas de referencia estables para alimentar otros pipelines de teledetección.
- Evaluación comparativa de metodologías SAR: sirve como línea base para comparar enfoques de segmentación radar frente a etiquetas Dynamic World.

## Benchmarks y rendimiento

Evaluación sobre 14 emplazamientos de retención no vistos durante el entrenamiento, con IoU frente a Dynamic World y media de las dos semillas:

| Métrica | Global | Trópicos (6) | Europa y Américas (8) |
|---|---|---|---|
| mIoU | 0,481 | 0,366 | 0,493 |

| Clase | IoU |
|---|---|
| Construido | 0,807 |
| Agua | 0,790 |
| Árboles | 0,633 |
| Vegetación baja | 0,422 |
| Cultivos | 0,409 |
| Suelo desnudo | 0,238 |
| Vegetación inundada | 0,070 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño del repositorio (0,3 GB para dos checkpoints) y la arquitectura ResNet-50 U-Net, es previsible que quepa en GPUs consumer, aunque no se confirma.
- GPU recomendadas: no disponible; cualquier GPU con soporte CUDA capaz de ejecutar PyTorch y `segmentation_models_pytorch` debería servir.
- Cabe en GPU consumer: probablemente sí, dado el tamaño reducido de los pesos, pero no confirmado por el autor.
- Opciones de despliegue: PyTorch nativo con `segmentation_models_pytorch`; el script `prototype.py` usa `uv` para gestión de dependencias. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentinel1-lulc-unet | Segmentación land cover SAR | U-Net + ResNet-50 | 4 canales Sentinel-1 | 7 | other (sin licencia concedida) | Pesos públicos para revisión |
| Dynamic World (referencia de etiquetas) | Clasificación land cover | no disponible | Sentinel-2 óptico | 9 | no disponible | Google Earth Engine |
| ESA WorldCover | Clasificación land cover | no disponible | Sentinel-1 y Sentinel-2 | 11 | no disponible | Producto público ESA |

No se dispone de datos de benchmarks comparativos con estos u otros modelos en la información proporcionada; la comparación se limita a características de entrada, salida y disponibilidad.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluación provienen de Dynamic World, otro modelo; las métricas miden acuerdo con esas predicciones, no con verdad de campo.
- Rendimiento muy bajo en vegetación inundada (IoU 0,070) y suelo desnudo (IoU 0,238); estas clases no son fiables en producción.
- No existe clase de nieve ni hielo: en zonas nevadas o de pendiente pronunciada el modelo asigna la clase más cercana de las siete disponibles.
- Los cambios abruptos o sutiles (por ejemplo, incendios forestales) pueden quedar diluidos por el contexto anual de entrada.
- El rendimiento en trópicos (mIoU 0,366) es notablemente inferior al de Europa y Américas (0,493).
- Licencia restrictiva: no se concede licencia de uso; los pesos son públicos solo para revisión del proyecto de curso y se debe solicitar permiso antes de reutilizarlos.
- Modelo académico sin validación en producción, sin documentación de sesgos geográficos más allá de la división trópicos/resto y sin garantías de mantenimiento.
- Dependencia de Google Earth Engine para el flujo de preprocesado del script de ejemplo.

## Enlaces

- Hugging Face: https://huggingface.co/YashAnnapure/sentinel1-lulc-unet
- Dataset: https://huggingface.co/datasets/YashAnnapure/sentinel1-lulc-dataset
- Repositorio del proyecto: https://github.com/Yash-Annapure/Deep_learning_project
- Dynamic World (fuente de etiquetas): no disponible en la información proporcionada
- ESA WorldCover (validación de etiquetas): no disponible en la información proporcionada
