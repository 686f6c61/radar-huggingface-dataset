# uday-bhatia/paper-to-pulse

## Resumen

Paper to Pulse es un modelo de visión por computador especializado en la digitalización de imágenes de electrocardiogramas (ECG), desarrollado por Uday Bhatia. Convierte fotografías o escaneos de ECG en papel en señales digitales de 12 derivaciones, un paso crítico para la investigación biomédica y la interoperabilidad de datos clínicos. El modelo se presentó en el desafío PhysioNet "Digitization of ECG Images", donde obtuvo un SNR de 19.742 dB en la leaderboard privada oficial, quedando en el puesto 24 de 1.425 participantes.

La arquitectura combina un encoder basado en ConvNeXt con una cabeza de coordenadas DSNT, precedida por un pipeline de rectificación en dos etapas que corrige la orientación y la deformación de la rejilla de la imagen. El repositorio incluye los pesos congelados del modelo de inferencia, los checkpoints de los rectificadores y un notebook de demostración para revisión. La licencia es de uso exclusivo para investigación y revisión, y no se permiten aplicaciones clínicas sin validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt encoder + cabeza DSNT (coordenadas) con pipeline de rectificación en dos etapas |
| Parametros totales | No disponible (pesos de inferencia: 365.826.091 bytes) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplicable (procesamiento de imágenes) |
| Licencia | research-and-review (licencia personalizada, no comercial) |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

La arquitectura completa consta de un pipeline de cinco etapas: corrección de orientación (Stage-0) con fallback a la imagen original, rectificación de la rejilla (Stage-1) con fallback al resultado anterior, inferencia V23 de cuatro filas con un encoder ConvNeXt y una cabeza DSNT para regresión de coordenadas, segmentación estándar de 3 × 4 derivaciones usando la cuarta fila como tira de ritmo Lead-II completa, y exportación directa de la señal sin suavizado, proyección algebraica de derivaciones, corrección de offset de línea base ni mezcla de Lead-II.

El modelo fue entrenado para el desafío PhysioNet de digitalización de imágenes ECG, con un dataset de entrenamiento que no se detalla en la información proporcionada. El resultado principal independiente es el SNR de 19.742 dB en la leaderboard privada oficial. El repositorio incluye también una abolición de post-procesamiento que muestra que la ruta sin post-procesamiento es la mejor opción, y un estudio de robustez con perfiles de degradación de imagen generados con ECG-Image-Kit.

## Capacidades

- Digitalización de imágenes de ECG en papel o escaneadas a señales digitales de 12 derivaciones.
- Corrección automática de orientación de la imagen (rotación y volteo) mediante un rectificador Stage-0.
- Rectificación de deformaciones de rejilla y perspectiva mediante un rectificador Stage-1.
- Segmentación de las 12 derivaciones en formato 3 × 4 más la tira de ritmo Lead-II.
- Exportación de señales sin post-procesamiento (sin suavizado ni proyección algebraica), lo que preserva la señal original.
- Robustez ante degradaciones de imagen (ruido, desenfoque, etc.) evaluada en cuatro perfiles de degradación.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, código o razonamiento simbólico.

## Casos de uso

- Digitalización retrospectiva de archivos en papel de ECG para crear bases de datos de señales digitales: el modelo procesa escaneos históricos y genera señales de 12 derivaciones, permitiendo análisis computacionales de cohortes antiguas.
- Investigación en cardiología: los investigadores pueden convertir imágenes de ECG de publicaciones o archivos clínicos en señales digitales para re-análisis, validación de algoritmos o meta-análisis.
- Interoperabilidad de datos clínicos: permite integrar ECG en papel en sistemas de información hospitalaria (HIS) como datos estructurados, facilitando el intercambio entre instituciones.
- Entrenamiento de modelos de ECG: los datos digitalizados pueden usarse para aumentar conjuntos de datos de entrenamiento de modelos de clasificación de arritmias o detección de anomalías.
- Auditoría clínica y control de calidad: los centros pueden digitalizar ECG en papel para verificar la precisión de lecturas previas o para estudios de concordancia entre lectores.
- Evaluación de algoritmos de digitalización: el pipeline puede usarse como referencia para comparar otros sistemas de digitalización de ECG, gracias a su abolición de post-procesamiento y sus métricas de robustez.

## Benchmarks y rendimiento

| Dataset / prueba | Metrica | Resultado |
|---|---|---|
| Official private leaderboard (PhysioNet challenge) | SNR | 19.742 dB (rank 24 / 1.425) |
| Official public leaderboard (PhysioNet challenge) | SNR | 20.051 dB (rank 23) |
| LUDB v1.0.1 external (200/200 records) | SNR medio | 21.3927 dB (95% CI 20.8542–21.9037) |
| LUDB external | SNR mediana | 22.2024 dB |
| LUDB external | PCC medio | 0.99255 |
| LUDB external | NMSE medio | 0.01232 |
| ECG-Image-Kit robustness (clean) | SNR medio | 23.19 dB |
| ECG-Image-Kit robustness (mild) | SNR medio | 22.35 dB |
| ECG-Image-Kit robustness (moderate) | SNR medio | 21.77 dB |
| ECG-Image-Kit robustness (severe) | SNR medio | 20.35 dB |
| Interval consistency (HR) | MAE | 0.174 bpm |

Los resultados de robustez se obtuvieron con 20 registros pareados bajo cuatro perfiles de degradación, todos con éxito (80/80 ejecuciones). La validación externa de LUDB se realizó con el mismo generador de imágenes (ECG-Image-Kit), por lo que no se ha demostrado generalización a otros generadores o dispositivos de adquisición.

## Requisitos de hardware

- Peso de inferencia: 365.826.091 bytes (~365 MB) en formato PyTorch, más los checkpoints de rectificación (57 MB y 98 MB).
- VRAM estimada: no se publica en la documentación, pero un modelo de visión de este tamaño (probablemente ConvNeXt de tamaño medio) puede ejecutarse en GPU de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (RTX 2060, RTX 3060, A100, H100) es suficiente para inferencia. La demo en Colab/Kaggle funciona con GPU gratuita.
- CPU: ejecución posible pero más lenta, como se indica en la demo.
- Opciones de despliegue: PyTorch, notebooks (Google Colab, Kaggle). No se mencionan formatos optimizados como ONNX, TensorRT, vLLM o llama.cpp.
- Latencia: no se publican datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se enmarca en la competición PhysioNet de digitalización de imágenes ECG, donde obtuvo el puesto 24 de 1.425, pero no se citan otros sistemas de referencia.

## Limitaciones y advertencias

- La licencia es "research-and-review", lo que restringe el uso exclusivamente a investigación y revisión, y prohíbe explícitamente aplicaciones clínicas o comerciales.
- La validación externa se realizó con registros de LUDB renderizados mediante el mismo generador (ECG-Image-Kit) que el pipeline de entrenamiento; no se ha demostrado la generalización a otros generadores, escáneres, proveedores de papel o dispositivos de adquisición.
- Los resultados de consistencia de intervalos son de consistencia algorítmica, no de validación clínica.
- El modelo no incluye post-procesamiento fisiológico (sin proyección algebraica de derivaciones, sin corrección de línea de base, sin suavizado); esto puede requerir ajustes adicionales para ciertos usos.
- No se publican datos sobre sesgos de edad, sexo, patología o etnia de los datos de entrenamiento.
- El repositorio contiene un archivo de pesos de inferencia con hash criptográfico para auditoría, pero no se proporciona el código de entrenamiento completo en el repositorio (solo el notebook de la pipeline de medalla).
- No hay soporte para uso en tiempo real o streaming; está diseñado para procesamiento por lotes de imágenes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/uday-bhatia/paper-to-pulse)
- [Perfil del autor en Hugging Face](https://huggingface.co/uday-bhatia)
- [Repositorio de experimentos de ECG](https://huggingface.co/uday-bhatia/ecg-digitization-experiments)
- [ECG-Image-Kit (commit 27b90f56896c9fc78b05a83ca14844ea2637aa0b)](https://github.com/alphanumericslab/ecg-image-kit/commit/27b90f56896c9fc78b05a83ca14844ea2637aa0b)
- [PaperPulse (plataforma no relacionada)](https://www.paperpulse.ai/)
