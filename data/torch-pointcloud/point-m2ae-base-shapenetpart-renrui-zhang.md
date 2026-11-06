# torch-pointcloud/point-m2ae-base.shapenetpart.renrui-zhang

## Resumen

Point-M2AE es un modelo de segmentación de nubes de puntos basado en un autoencoder enmascarado (masked autoencoder, MAE) multi-escala. Esta ficha concreta corresponde al checkpoint afinado sobre el dataset ShapeNetPart para la tarea de segmentación de partes de objetos 3D, convertido al ecosistema de la librería `torch-pointcloud` por el usuario `torch-pointcloud`. El modelo original fue desarrollado por Renrui Zhang, Ziyu Guo y colaboradores (Shanghai AI Laboratory, CUHK y otras instituciones) y presentado en NeurIPS 2022.

El modelo resuelve el problema de la segmentación semántica a nivel de parte sobre mallas y nubes de puntos: dado un objeto 3D representado por puntos con coordenadas y normales, asigna a cada punto una de las 50 etiquetas de parte disponibles en ShapeNetPart. Su relevancia radica en que aplica preentrenamiento auto-supervisado jerárquico (reconstrucción de parches enmascarados a varias escalas) sobre datos 3D no etiquetados, lo que reduce la dependencia de anotaciones manuales en un dominio donde estas son especialmente costosas.

Arquitectura transformer jerárquica con 25,5 millones de parámetros, pensada para trabajar con nubes de puntos de hasta 8192 puntos por muestra. El checkpoint es compacto (0,1 GB) y se distribuye en formato `safetensors`, lo que facilita su integración en pipelines de PyTorch mediante la API de `torch-pointcloud`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerárquico multi-escala con autoencoder enmascarado (Point-M2AE) |
| Parametros totales | 25.496.434 (25,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de 8192 puntos por muestra en el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Segmentación de partes en nubes de puntos |
| Clases de salida | 50 |
| Dimension de features | 6208 |
| Dataset de entrenamiento | ShapeNetPart |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

Point-M2AE es un transformer jerárquico que organiza la nube de puntos en una pirámide de resoluciones. En cada nivel se agrupan los puntos en parches locales y se aplica un encoder transformer con atención sobre los tokens de parche, seguido de un decoder ligero que reconstruye las coordenadas de los parches enmascarados. La innovación principal del trabajo es el enmascaramiento multi-escala: durante el preentrenamiento se ocultan parches a distintas resoluciones de forma simultánea, lo que fuerza al modelo a aprender tanto geometría local fina como estructura global del objeto. El preentrenamiento es auto-supervisado y no requiere etiquetas.

Este checkpoint parte del modelo preentrenado `point-m2ae-base.pretrain.renrui-zhang` y se afina de forma supervisada sobre ShapeNetPart para la tarea de segmentación de partes. La model card no detalla el número de tokens de preentrenamiento, la composición exacta del corpus 3D ni si se aplicaron técnicas de ajuste adicionales como RLHF (no aplicable en este dominio) o regularización específica. La conversión a `torch-pointcloud` la realizó Arthur Dujardin a partir del repositorio original `ZrrSkywalker/Point-M2AE`, también bajo licencia MIT.

## Capacidades

- Segmentación de partes en nubes de puntos: asigna una etiqueta entre 50 clases a cada punto de entrada.
- Procesamiento de nubes con coordenadas XYZ y normales por punto (claves `pos` y `normal` en el pipeline de datos).
- Extracción de características: mediante `forward_features` o `reset_classifier(num_classes=0)` se obtiene un vector de 6208 dimensiones por muestra, útil como representación para tareas downstream.
- Soporte de categoría de objeto como entrada auxiliar (`category`), lo que permite condicionar la segmentación al tipo de objeto.
- Procesamiento por lotes con tensor `batch` para agrupar múltiples nubes en una sola pasada.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión 2D, audio ni generación de texto: es un modelo puramente geométrico.

## Casos de uso

- Segmentación de partes en escaneos 3D industriales: dado un escaneo de una pieza mecánica, el modelo etiqueta cada punto según la parte del objeto, lo que permite inventariar componentes o detectar piezas faltantes en control de calidad.
- Anotación asistida de datasets 3D: usar las predicciones como preetiquetado para acelerar el etiquetado manual de nuevas nubes de puntos, reduciendo el coste de anotación en pipelines de datos 3D.
- Robótica de manipulación: segmentar un objeto en sus partes para que un brazo robótico identifique asas, tapas o zonas de agarre antes de planificar la manipulación.
- Reconstrucción y edición 3D: separar un modelo 3D en sus componentes para facilitar tareas de edición, simplificación o reensamblaje en herramientas de diseño.
- Extracción de embeddings para búsqueda de formas: generar el vector de 6208 dimensiones por objeto y usarlo para recuperación de mallas similares o clustering de catálogos 3D.
- Preentrenamiento transferible: reutilizar el encoder como backbone congelado o afinado para tareas de clasificación o segmentación semántica en dominios 3D distintos de ShapeNetPart.
- Análisis de escenas CAD: segmentar ensamblajes en sus piezas constituyentes para auditar la estructura de un modelo CAD o generar documentación técnica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ShapeNetPart | point-cloud-part-segmentation | ins_mIoU | 86,2 |
| ShapeNetPart | point-cloud-part-segmentation | cls_mIoU | 84,62 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,5 M de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 102 MB; en fp16, unos 51 MB. La memoria dominante es la de las activaciones, que depende del número de puntos por muestra (8192 en el ejemplo de la model card) y del tamaño del lote.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia con lotes pequeños; para lotes grandes o entrenamiento se recomienda A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, siempre ajustando el tamaño de lote.
- Opciones de despliegue: la librería `torch-pointcloud` sobre PyTorch es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Point-M2AE base (este checkpoint) | 25,5 M | nubes de hasta 8192 puntos (ejemplo) | Segmentación de partes ShapeNetPart | MIT | HuggingFace, `torch-pointcloud` |
| Point-M2AE base pretrain | no disponible | no disponible | Preentrenamiento auto-supervisado 3D | MIT | HuggingFace (`torch-pointcloud/point-m2ae-base.pretrain.renrui-zhang`) |
| Alternativas de la misma categoría | no disponible | no disponible | Segmentación de nubes de puntos | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, PointNet++, Point Transformer o DGCNN) que permitan una comparación numérica rigurosa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de partes de nubes de puntos; no genera texto, código ni realiza razonamiento simbólico.
- Entrenado sobre ShapeNetPart, un dataset de objetos sintéticos de 16 categorías; el rendimiento puede degradarse en escaneos reales con ruido, oclusiones o densidades distintas.
- Las métricas declaradas (ins_mIoU 86,2; cls_mIoU 84,62) figuran como no verificadas en la model card.
- La model card no documenta sesgos específicos, pero al derivar de un dataset académico limitado a categorías concretas, la cobertura semántica fuera de esas categorías es nula.
- Riesgo de alucinación en el sentido de asignar etiquetas de parte incorrectas en puntos ambiguos o en geometrías fuera de distribución; no hay calibración de confianza documentada.
- Limitaciones de idioma no aplicables (modelo no lingüístico); no obstante, la documentación y el ecosistema están en inglés.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y citar los trabajos originales (Point-M2AE, ShapeNetPart y `torch-pointcloud`).
- Para producción: validar el modelo sobre datos propios antes de desplegarlo, ya que no se han publicado evaluaciones fuera de ShapeNetPart.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/point-m2ae-base.shapenetpart.renrui-zhang
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/point-m2ae-base.pretrain.renrui-zhang
- Paper Point-M2AE (NeurIPS 2022): https://arxiv.org/abs/2205.14401
- Repositorio original: https://github.com/ZrrSkywalker/Point-M2AE
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
