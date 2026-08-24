# YMmim/vision-lstm-anomaly-detection

## Resumen

El modelo `YMmim/vision-lstm-anomaly-detection` es un sistema de detección de anomalías para inspección visual industrial, desarrollado por el autor YMmim. Está diseñado para identificar defectos superficiales en productos manufacturados, como semiconductores, displays, textiles y metales, mediante un enfoque de línea de escaneo (line-scan) que transforma imágenes 2D en secuencias temporales de líneas. El modelo aprende de forma no supervisada (one-class) únicamente con imágenes de productos normales, y posteriormente detecta desviaciones en la reconstrucción que indican la presencia de defectos.

La arquitectura se basa en un autoencoder LSTM (Long Short-Term Memory) que procesa las imágenes como secuencias de líneas, capturando patrones espaciotemporales de la textura superficial. El modelo fue entrenado y evaluado sobre el subconjunto Grid del dataset MVTec AD, con 30 imágenes normales para entrenamiento y 20 para prueba (10 normales y 10 defectuosas). Los resultados reportados alcanzan un ROC-AUC del 99%, una precisión del 100% y un recall del 90%, lo que demuestra una alta capacidad discriminativa para esta tarea específica.

Aunque el repositorio no contiene pesos preentrenados (el tamaño del repo es 0.0 GB), el código fuente y la documentación permiten reproducir el entrenamiento y la inferencia. Este modelo es relevante para entornos de fabricación donde la inspección automática de calidad es crítica, y su enfoque basado en LSTM ofrece una alternativa ligera y eficiente frente a métodos basados en transformers o redes convolucionales profundas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder LSTM bidireccional (LineScanLSTMAutoencoder) |
| Parametros totales | No disponible (no se especifica en la documentación) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, ko (idiomas de la documentación y etiquetas) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio no contiene archivos de pesos) |

## Arquitectura y entrenamiento

El modelo implementa un autoencoder LSTM que procesa imágenes como secuencias de líneas horizontales, simulando el funcionamiento de cámaras lineales utilizadas en inspección industrial. La arquitectura consta de un encoder LSTM con 2 capas y 128 unidades ocultas, seguido de una capa fully connected que reduce la representación a 64 dimensiones. El decoder replica esta estructura en orden inverso, con otra capa fully connected y un LSTM de 2 capas, finalizando con una capa de salida que reconstruye la secuencia original. Se aplica dropout de 0.1 en las capas LSTM para regularización.

El entrenamiento se realiza de forma no supervisada (one-class) utilizando únicamente 30 imágenes normales del subconjunto Grid de MVTec AD. El modelo aprende a reconstruir con precisión los patrones de textura de productos sin defectos. Durante la inferencia, la diferencia entre la entrada y su reconstrucción (error de reconstrucción) se utiliza como puntuación de anomalía. Un umbral óptimo de 0.019805 separa las muestras normales de las defectuosas. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección de anomalías en imágenes industriales: identifica defectos como roturas de cable, contaminación, cables doblados y agujeros en superficies tipo rejilla.
- Localización de defectos: genera mapas de calor (heatmaps) que resaltan las regiones anómalas dentro de la imagen, facilitando la inspección visual.
- Aprendizaje one-class: solo requiere imágenes de productos normales para entrenar, lo que simplifica la implementación en entornos donde los defectos son raros o difíciles de etiquetar.
- Procesamiento de secuencias: al convertir imágenes en secuencias de líneas, el modelo captura dependencias espaciotemporales en la textura, útil para patrones periódicos o direccionales.
- Inferencia ligera: la arquitectura LSTM con 128 unidades ocultas es computacionalmente eficiente, adecuada para despliegue en hardware modesto.
- Multilingüe en documentación: la model card está disponible en inglés y coreano, aunque el modelo en sí no procesa lenguaje.

## Casos de uso

- Inspección de calidad en fabricación de semiconductores: el modelo puede integrarse en líneas de producción para detectar defectos en obleas o sustratos, donde los patrones de rejilla son comunes. Su capacidad de localización permite identificar la posición exacta del defecto para su posterior análisis.
- Control de calidad en displays y paneles: en la fabricación de pantallas, las superficies con patrones repetitivos pueden ser inspeccionadas automáticamente, reduciendo la dependencia de revisión manual y aumentando la velocidad de detección.
- Inspección de textiles y materiales enrollados (roll-to-roll): el enfoque line-scan es especialmente adecuado para materiales que se desplazan continuamente, como telas o películas, donde el modelo puede procesar imágenes en tiempo real y alertar sobre defectos superficiales.
- Verificación de metales y superficies mecanizadas: en la producción de piezas metálicas con texturas regulares, el modelo puede detectar rayones, abolladuras o contaminación sin necesidad de etiquetado previo de defectos.
- Sistema de alerta temprana en líneas de producción: al integrarse con un PLC o sistema de control, el modelo puede detener la línea o marcar productos defectuosos automáticamente, mejorando la eficiencia y reduciendo desperdicios.
- Investigación y desarrollo en visión industrial: el código fuente sirve como base para experimentar con diferentes arquitecturas LSTM o datasets, permitiendo a investigadores adaptar el enfoque a otros dominios de detección de anomalías.

## Benchmarks y rendimiento

Los resultados reportados en la model card se basan en el subconjunto Grid de MVTec AD, con 10 imágenes normales y 10 defectuosas en el conjunto de prueba. No se proporcionan comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| ROC-AUC | 99.00% |
| Precision | 100.00% |
| Recall | 90.00% |
| F1-Score | 94.74% |
| Normal Mean Score | 0.012851 |
| Defect Mean Score | 0.022506 |
| Optimal Threshold | 0.019805 |

El error de reconstrucción medio para productos defectuosos es aproximadamente el doble que para productos normales, lo que indica una clara separación entre ambas clases. No se han publicado resultados en otros benchmarks ni comparaciones con métodos alternativos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación del modelo.
- Dado el tamaño reducido de la arquitectura (LSTM con 128 unidades ocultas y 2 capas), el modelo puede ejecutarse en CPU sin problemas para inferencia en lote o en tiempo real con imágenes de resolución moderada.
- Para entrenamiento con datasets más grandes, una GPU con al menos 4 GB de VRAM sería suficiente, aunque no hay datos confirmados.
- El repositorio no incluye pesos preentrenados, por lo que el usuario debe entrenar el modelo desde cero, lo que requiere acceso al dataset MVTec AD.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede integrarse con frameworks de inferencia como TorchServe, ONNX Runtime o simplemente ejecutarse en un script Python. No se menciona compatibilidad con vLLM, llama.cpp u otras herramientas específicas.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de anomalías en la documentación proporcionada. El modelo se presenta como una solución específica para el subconjunto Grid de MVTec AD, y no se han publicado comparaciones con métodos como PatchCore, PaDiM o SPADE. Por tanto, no es posible establecer una comparativa objetiva con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo fue entrenado con un conjunto de datos muy reducido (30 imágenes normales), lo que puede provocar sobreajuste y limitar su generalización a otros tipos de superficies o condiciones de iluminación.
- La evaluación se realizó únicamente sobre el subconjunto Grid de MVTec AD, con un número limitado de muestras de prueba (20 imágenes). Los resultados pueden no ser representativos de la robustez en entornos reales.
- No se proporcionan pesos preentrenados, por lo que el usuario debe disponer del dataset y del código para entrenar el modelo, lo que añade complejidad y tiempo.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial o la redistribución del modelo y su código.
- El enfoque line-scan asume que las imágenes tienen una orientación y un patrón de escaneo definidos; imágenes con rotaciones o escalas diferentes pueden degradar el rendimiento.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un solo tipo de textura, su aplicación a otros dominios requiere reentrenamiento.
- El repositorio no contiene archivos de pesos ni documentación sobre el formato de los mismos, lo que dificulta la reproducibilidad directa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YMmim/vision-lstm-anomaly-detection
- No se han encontrado otros enlaces específicos (papers, blogs o repositorios) relacionados directamente con este modelo en la información proporcionada.
