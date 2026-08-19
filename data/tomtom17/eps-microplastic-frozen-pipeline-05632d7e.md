# TOMTOM17/eps-microplastic-frozen-pipeline-05632d7e

## Resumen
Este repositorio contiene un pipeline congelado (frozen pipeline) para el cribado de partículas de poliestireno expandido (EPS) y no-EPS en imágenes de microscopía de fluorescencia obtenidas con un smartphone. Desarrollado por TOMTOM17, el pipeline combina un detector YOLO11m de una clase, nueve pliegues de clasificador YOLO26, un backbone DINOv2-small congelado y un checkpoint SAM 2.1 Hiera Large para generar máscaras de área. El objetivo es proporcionar una métrica cuantitativa reproducible de área proyectada visible de EPS, en lugar de recuento de partículas, para muestras teñidas con Rodamina-B y excitadas a 530 nm con filtro de paso largo de 560 nm y aumento nominal de 10x. La relevancia actual radica en la creciente necesidad de monitorización de microplásticos con métodos accesibles y estandarizados.

El pipeline está diseñado para ser inmutable (freeze ID y hashes SHA-256) y se distribuye con un script de inferencia verificado. Los resultados en un conjunto de evaluación retenido de 11 imágenes contiguas muestran un Dice de 0.879 para el área proyectada de EPS, aunque el autor advierte que el bloque de evaluación es pequeño y no debe tratarse como 11 muestras independientes. El modelo es un cribado basado en apariencia, no una confirmación química de identidad polimérica.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: YOLO11m (detección), YOLO26 (clasificación, 9 pliegues), DINOv2-small (backbone congelado), SAM 2.1 Hiera Large (segmentación por caja) |
| Parametros totales | no disponible (suma de los componentes) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en formato original) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | .pt (PyTorch), .safetensors (DINOv2), .joblib (logísticos) |

Nota: el pipeline incluye varios artefactos con formatos distintos. La licencia no está especificada en la información proporcionada.

## Arquitectura y entrenamiento
El pipeline es un sistema multi-etapa. Primero, un detector YOLO11m de una clase identifica partículas candidatas en la imagen. Luego, nueve pliegues de un clasificador YOLO26 (entrenados con validación cruzada) distinguen entre EPS (clase 0) y no-EPS (clase 1). Las características de las regiones clasificadas se extraen con un backbone DINOv2-small congelado y se combinan con clasificadores logísticos (original y adaptado al desarrollo) para refinar la identidad. Finalmente, SAM 2.1 Hiera Large genera máscaras de área a partir de las cajas detectadas, proporcionando la métrica de área proyectada visible de EPS.

Los datos de entrenamiento no se detallan en la información proporcionada, pero el autor referencia un dataset público asociado (TOMTOM17/eps-microplastic-yolo-dataset-05632d7e) con imágenes específicas del protocolo óptico y de tinción documentado. El pipeline se congeló con umbrales fijos, pesos de ensemble y roles de modelo definidos en PIPELINE_CONFIG.json. No se menciona el uso de RLHF o DPO, ya que es un modelo de visión.

## Capacidades
- Detección de partículas en imágenes de microscopía de fluorescencia (YOLO11m).
- Clasificación binaria EPS/no-EPS con ensemble de 9 pliegues YOLO26.
- Refinamiento de identidad mediante características DINOv2 y regresión logística.
- Segmentación de área proyectada de EPS mediante SAM 2.1 con prompt de caja.
- Salida cuantitativa de área proyectada visible de EPS (proxy reproducible).
- Validación de integridad del pipeline mediante hashes SHA-256 y freeze ID.
- Inferencia por línea de comandos con script verificado (infer_frozen_mixed.py).

## Casos de uso
- Monitorización de microplásticos en laboratorios de investigación: el pipeline permite cuantificar el área proyectada de EPS en muestras de agua o sedimento procesadas con el protocolo de tinción documentado, ofreciendo una métrica reproducible para estudios comparativos.
- Control de calidad en plantas de tratamiento de aguas: integración del script de inferencia en flujos de análisis para detectar contaminación por EPS en muestras de efluentes, con salida de área proyectada para reportes regulatorios.
- Educación y divulgación científica: uso del pipeline con microscopios de smartphone para que estudiantes cuantifiquen microplásticos en muestras locales, aprovechando la accesibilidad del hardware.
- Investigación en ecotoxicología: correlación del área proyectada de EPS con concentraciones medidas por métodos químicos (FTIR/Raman) para validar el proxy visual en estudios de exposición.
- Desarrollo de sensores ambientales de bajo coste: el pipeline puede integrarse en sistemas de captura de imágenes automatizados para monitorización continua de microplásticos en entornos acuáticos.
- Auditoría de protocolos de laboratorio: al ser un pipeline congelado con hashes verificables, sirve como referencia reproducible para auditar resultados en publicaciones científicas o informes técnicos.

## Benchmarks y rendimiento
El autor proporciona resultados en un conjunto de evaluación retenido de 11 imágenes contiguas (no independientes). La tabla siguiente resume los resultados reportados:

| Tarea | Métrica | Resultado |
|---|---|---|
| Identidad con cajas humanas | Macro-F1 | 0.875 |
| Identidad con cajas humanas | Recall EPS | 0.927 |
| Detector + identidad extremo a extremo (IoU 0.30) | Macro-F1 | 0.619 |
| Detección | mAP50 | 0.537 |
| Área proyectada EPS (proxy) | Dice | 0.879 |
| Área proyectada EPS (proxy) | IoU | 0.784 |
| Área proyectada EPS (proxy) | Precisión | 0.825 |
| Área proyectada EPS (proxy) | Recall | 0.940 |
| Ratio área predicha/referencia | Ratio | 1.139 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor advierte que el bloque de evaluación es pequeño y no debe interpretarse como 11 muestras independientes.

## Requisitos de hardware
- El pipeline requiere un entorno Linux con CUDA para ejecutar la inferencia (según la documentación).
- Los componentes principales (YOLO11m, YOLO26, DINOv2-small, SAM 2.1 Hiera Large) son modelos de visión de tamaño moderado. Se estima que la VRAM necesaria para inferencia en lote pequeño (1-4 imágenes) está entre 8 y 16 GB, dependiendo de la resolución de entrada y del uso de SAM 2.
- GPU recomendadas: NVIDIA RTX 3060/3070/3080 (12 GB) o superiores; A100/H100 para procesamiento en lote grande.
- En GPUs de consumo con 8 GB de VRAM (p.ej., RTX 3050) podría ejecutarse con limitaciones de resolución o lote reducido, pero no está verificado.
- Opciones de despliegue: el script de inferencia es el punto de entrada verificado; no se mencionan integraciones con vLLM, Ollama o TGI (no aplica, es un pipeline de visión). Se puede integrar en flujos Python personalizados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de información sobre modelos directamente comparables en la misma categoría (pipeline de detección de microplásticos con este protocolo específico). Existen otros proyectos de detección de microplásticos con YOLOv8 (p.ej., Saiprasad2004/Microplastics-in-water) o plataformas como Roboflow, pero no son comparables en términos de arquitectura, datos o métricas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias
- Es un modelo de cribado basado en apariencia, no una confirmación química de identidad polimérica. Se requiere FTIR, Raman u otro método validado para identificación definitiva.
- El área proyectada es un proxy reproducible, pero no puede convertirse a mm² sin una calibración de escala independiente, ni a masa o volumen sin supuestos adicionales.
- El conjunto de evaluación retenido consta de solo 11 imágenes contiguas de un mismo bloque de adquisición; no deben tratarse como 11 muestras independientes. La generalización a otros equipos ópticos o protocolos no está validada.
- Se observaron falsos positivos evidentes y máscaras rectangulares en una imagen no etiquetada (IMG_5723), lo que indica que cambios en la adquisición o el fondo pueden invalidar la salida numérica de área. Se requiere control de calidad visual y validación independiente para cada nuevo montaje óptico.
- La licencia del modelo no está especificada; se debe contactar al autor para aclarar términos de uso comercial.
- El pipeline está congelado y no se puede modificar sin romper la integridad de los hashes; cualquier adaptación requiere reentrenamiento y revalidación.

## Enlaces
- Repositorio del modelo: https://huggingface.co/TOMTOM17/eps-microplastic-frozen-pipeline-05632d7e
- Dataset asociado: https://huggingface.co/datasets/TOMTOM17/eps-microplastic-yolo-dataset-05632d7e
- Proyecto relacionado (detección de microplásticos con YOLOv8): https://github.com/Saiprasad2004/Microplastics-in-water
- Proyecto relacionado (detección de microplásticos con IA): https://github.com/Vani-soni200/AI-POWERED-MICROPLASTIC-DETECTION
- Artículo de Medium sobre detección de microplásticos con YOLOv8: https://medium.com/@mat.duverne/microplastic-detection-d341fa4bd96e
- Modelo de detección de microplásticos en Roboflow: https://universe.roboflow.com/microplasticai/microplastic_detect-z4e1t

Nota: los enlaces de proyectos relacionados no son comparables directamente con este pipeline, pero se incluyen como contexto del dominio.
