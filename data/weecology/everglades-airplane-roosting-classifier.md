# weecology/everglades-airplane-roosting-classifier

## Resumen

El Everglades airplane roosting classifier es un modelo de clasificación de imágenes desarrollado por el grupo de investigación weecology (Universidad de Florida) para distinguir aves zancudas en posición de nidificación frente a aves en posición de descanso (roosting) en fotografías aéreas de las colonias de los Everglades. Se trata de un clasificador binario de recortes (crops) que se usa como segunda etapa sobre las detecciones de un modelo detector previo, `weecology/everglades-bird-airplane`, dentro del ecosistema de la librería DeepForest.

Técnicamente es una ResNet-50 preentrenada en ImageNet, adaptada como `CropModel` de DeepForest. Con 23.565.250 parámetros, opera sobre recortes de 100 × 100 píxeles centrados en cada ave y devuelve una etiqueta (`Nesting` o `Roosting`) junto con una puntuación de confianza. No es un modelo de lenguaje ni un modelo generativo: es una herramienta de visión por computador de nicho, orientada a flujos de trabajo de ecología cuantitativa y monitorización de aves.

Su relevancia es acotada pero concreta: permite automatizar el conteo diferenciado de aves reproductoras frente a no reproductoras en censos aéreos de gran escala, una tarea que tradicionalmente se hace a mano con herramientas como Photoshop Count Tool. El modelo está publicado con licencia MIT y un tamaño de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN, preentrenada en ImageNet) como `CropModel` de DeepForest |
| Parametros totales | 23.565.250 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada: recorte de 100 × 100 px redimensionado a 224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una ResNet-50 estándar de 23,5 millones de parámetros, cargada mediante la clase `CropModel` de DeepForest. Cada muestra de entrada es un recorte de 100 × 100 píxeles centrado en un ave detectada, redimensionado a 224 píxeles para alimentar la red. El entrenamiento usó Adam con tasa de aprendizaje 0,0001, tamaño de lote 32, hasta 30 épocas, muestreo balanceado por clase y volteos horizontales como aumento de datos; se conservó la época con menor pérdida de validación.

El conjunto de datos procede de 4.853 aves contadas manualmente con Photoshop Count Tool en 21 fotografías aéreas (cámara DSLR Nikon, 8256 × 5504 px) tomadas en 11 colonias de los Everglades entre marzo y abril de 2022. Las etiquetas se derivan del sufijo de los grupos de conteo: los grupos cuyo nombre menciona roosting (por ejemplo `WOST_Roosting`, `WHIB_Roost_or_Court`, `GREG_Roost_or_large_chick`) se etiquetan como Roosting, y los grupos con nombre de especie sin sufijo se consideran Nesting. La validación es un 20 % aleatorio de aves dentro de cada clase, extraído de las mismas fotografías que el entrenamiento.

## Capacidades

- Clasificación binaria de recortes de aves zancudas en dos clases: `Nesting` (nidificando) y `Roosting` (descansando).
- Integración directa con el detector `weecology/everglades-bird-airplane` mediante el parámetro `crop_model` de `predict_tile`.
- Devuelve etiqueta y puntuación por detección en las columnas `cropmodel_label` y `cropmodel_score`.
- Funciona sobre recortes de aproximadamente 50 px de lado del detector, expandidos a una ventana de 100 px mediante la configuración `expand: 25`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes puro.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Censos aéreos automatizados de colonias de aves zancudas: el modelo permite separar aves en nido de aves en descanso en las fotografías de los Everglades, sustituyendo el conteo manual con Photoshop Count Tool por un pipeline detector + clasificador.
- Monitorización de la reproducción a lo largo de temporadas: al aplicarse sobre series de fotografías de las mismas colonias, permite estimar la proporción de aves reproductoras frente a no reproductoras y detectar cambios fenológicos.
- Investigación en ecología cuantitativa: sirve como componente reproducible en estudios que necesitan conteos diferenciados a gran escala, con licencia MIT que facilita su reutilización y auditoría.
- Validación cruzada de conteos manuales: las puntuaciones de confianza del clasificador permiten marcar recortes dudosos para revisión humana, reduciendo el esfuerzo de anotación.
- Docencia y formación en visión por computador aplicada a ecología: el par detector + clasificador es un ejemplo completo de pipeline de dos etapas con DeepForest.
- Integración en flujos de DeepForest existentes: cualquier proyecto que ya use el detector de aves de Everglades puede añadir este clasificador sin cambiar de framework ni de formato de pesos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud global (validación) | 0,93 |
| Recall medio por clase | 0,86 |

| Clase | Recortes de entrenamiento | Recortes de validación | Precision | Recall |
|---|---|---|---|---|
| Nesting | 3328 | 871 | 0,96 | 0,96 |
| Roosting | 515 | 139 | 0,77 | 0,76 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 23,5 millones de parámetros en fp32 el modelo ocupa aproximadamente 90 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y en la práctica el cuello de botella será el detector previo y el preprocesado de imágenes de 8256 × 5504 px.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: la vía soportada es DeepForest (versión de GitHub main posterior a noviembre de 2026; la release 2.1.0 no puede cargar `CropModel` desde el Hub). No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| weecology/everglades-airplane-roosting-classifier | Clasificador de recortes (ResNet-50) | 23,5 M | Recorte 100 × 100 px | MIT | Hugging Face |
| weecology/everglades-bird-airplane | Detector de aves (DeepForest) | no disponible | Imagen aérea completa | no disponible | Hugging Face |
| ResNet-50 ImageNet | Clasificador genérico | 25,6 M | Imagen 224 × 224 px | no disponible | Ampliamente disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Alrededor de 250 etiquetas de Roosting son ambiguas por nombre: `Roost or Court` / `Roosting or courting` (230) y `Roost or large chick` (22). El cortejo y los polluelos grandes pueden ocurrir en el nido, por lo que estas etiquetas son ruidosas.
- Nesting es la etiqueta por defecto para aves no marcadas, de modo que cualquier ave en descanso que el contador no marcó se entrena como Nesting.
- La mayoría de las etiquetas de Roosting provienen de unas pocas colonias (Horus, LoxRamp, Vulture), principalmente de Wood Stork y White Ibis, lo que limita la generalización a otras especies o colonias.
- Los datos corresponden a una sola cámara, una sola temporada (2022) y 21 fotografías; se esperan resultados peores con otras altitudes, ángulos o condiciones de luz.
- La validación usa aves de las mismas fotografías que el entrenamiento, por lo que las métricas son optimistas para colonias o años nuevos.
- El modelo requiere DeepForest desde GitHub main posterior a noviembre de 2026; la versión 2.1.0 no puede cargar `CropModel` desde el Hub, lo que complica la reproducibilidad en entornos con versiones fijadas.
- No es un modelo de lenguaje: no admite prompts, tool calling ni generación de texto; cualquier uso fuera de la clasificación de recortes de aves zancudas de los Everglades carece de soporte.
- Licencia MIT: permite uso comercial, pero no se documentan garantías ni sesgos evaluados más allá de las métricas de validación indicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weecology/everglades-airplane-roosting-classifier
- Detector asociado: https://huggingface.co/weecology/everglades-bird-airplane
- Código: https://github.com/weecology/EvergladesAirplane
