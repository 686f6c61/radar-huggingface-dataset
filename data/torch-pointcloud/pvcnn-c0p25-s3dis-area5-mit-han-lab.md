# torch-pointcloud/pvcnn-c0p25.s3dis-area5.mit-han-lab

## Resumen

PVCNN (Point-Voxel CNN) es un modelo de segmentación semántica de nubes de puntos 3D que combina una rama basada en puntos con una rama basada en vóxeles en una única arquitectura híbrida. Este checkpoint concreto, `pvcnn-c0p25.s3dis-area5.mit-han-lab`, corresponde a la variante con factor de voxelización `c=0.25` entrenada sobre el dataset S3DIS (Stanford 3D Indoor Spaces) y evaluada en el fold de test Area 5. Lo desarrolla el grupo de Song Han (MIT HAN Lab) y ha sido convertido y empaquetado por `torch-pointcloud` para su uso directo con la librería homónima.

El modelo resuelve el problema de la segmentación semántica por punto en escenas interiores: dado un conjunto de puntos con coordenadas, color y normales, asigna a cada punto una de 13 clases semánticas (suelo, pared, silla, mesa, etc.). Su relevancia radica en que demuestra que es posible obtener una precisión competitiva en segmentación 3D con un coste computacional muy reducido: apenas 0,2 millones de parámetros y 368 dimensiones de característica, lo que lo hace viable en entornos con recursos limitados.

La arquitectura es una red neuronal convolucional híbrida punto-vóxel, no un transformer ni un modelo de lenguaje. No procesa texto ni imágenes 2D: su entrada es una nube de puntos 3D. Este checkpoint está pensado para investigación y para pipelines de percepción 3D en robótica, escaneo de interiores y sistemas de información geoespacial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PVCNN (Point-Voxel CNN), red convolucional híbrida punto-vóxel |
| Parametros totales | 0,2 M (167.773 según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia; entrada de nube de puntos, 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión 3D, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 9 (posición, color y normales) |
| Clases de salida | 13 |
| Dimension de caracteristicas | 368 |
| Dataset de entrenamiento/evaluación | S3DIS, Area 5 como test |

## Arquitectura y entrenamiento

PVCNN es una arquitectura híbrida que fusiona dos representaciones complementarias de la nube de puntos. La rama de vóxeles aplica convoluciones 3D sobre una rejilla voxelizada, lo que aporta eficiencia computacional y agregación espacial local; la rama de puntos opera directamente sobre las coordenadas originales, preservando la resolución fina y evitando la pérdida de información que introduce la voxelización. Ambas ramas se combinan mediante capas de fusión, de modo que la red aprovecha la regularidad de los vóxeles sin renunciar al detalle de los puntos. El factor `c=0.25` de este checkpoint controla la resolución de la rejilla de vóxeles.

El entrenamiento se realiza sobre S3DIS, un dataset de escaneos de interiores de edificios con anotaciones semánticas por punto en 13 clases. La evaluación se hace sobre el fold Area 5, el protocolo estándar para medir generalización a un área no vista. No se documenta en la información disponible el número exacto de tokens/puntos de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de aumento de datos específicas más allá de las habituales en la literatura de PVCNN. Tampoco se indica el uso de RLHF, DPO ni técnicas de alineación, que no aplican a este tipo de modelo.

La innovación técnica principal es la propia fusión punto-vóxel, que reduce drásticamente el coste de memoria y cómputo frente a convoluciones 3D puras o a arquitecturas basadas en puntos con vecindarios densos, manteniendo una precisión competitiva. El modelo incluye además una función `forward_features` que devuelve el vector de 368 dimensiones por punto, útil para transferencia a otras tareas.

## Capacidades

- Segmentación semántica por punto en nubes de puntos 3D de escenas interiores, con 13 clases de salida.
- Extracción de características por punto (vector de 368 dimensiones) mediante `forward_features`, reutilizable para clasificación, detección u otras tareas downstream.
- Procesamiento de nubes de puntos con 9 canales de entrada: coordenadas XYZ, color RGB y normales.
- Funciona con lotes de puntos mediante agregación por índice de batch (`collate`), lo que permite inferencia sobre múltiples escenas.
- Capacidad de reinicializar el clasificador (`reset_classifier(num_classes=0)`) para usar el modelo como extractor de características puro.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), visión 2D, audio ni generación de texto.

## Casos de uso

- Segmentación de escenas interiores escaneadas: el modelo asigna etiquetas semánticas a cada punto de un escaneo de una habitación o edificio, separando suelo, paredes, techos, mobiliario y elementos estructurales; es adecuado por su bajo coste y su entrenamiento específico en S3DIS.
- Digitalización de planos y gemelos digitales: a partir de nubes de puntos de escáneres LiDAR o fotogrametría, se generan mapas semánticos que alimentan herramientas BIM o de modelado de interiores.
- Robótica móvil en interiores: un robot equipado con LiDAR o cámara de profundidad puede usar el modelo para percibir la semántica del entorno (dónde hay suelo transitable, obstáculos, paredes) con latencia baja gracias a sus 0,2 M de parámetros.
- Preprocesado para tareas downstream: usar `forward_features` para obtener descriptores por punto de 368 dimensiones que sirvan como entrada a clasificadores de escena, detectores de objetos 3D o modelos de segmentación de instancias.
- Análisis de accesibilidad y cumplimiento normativo: segmentar escaneos de edificios para medir superficies de suelo, detectar barreras arquitectónicas o verificar dimensiones de pasillos y puertas.
- Investigación en aprendizaje 3D eficiente: servir como baseline ligero para comparar arquitecturas de segmentación de nubes de puntos con presupuestos computacionales reducidos, dado que su implementación de referencia es pública y reproducible.
- Etiquetado asistido de datos 3D: preanotar automáticamente nubes de puntos para acelerar la revisión humana en pipelines de creación de datasets.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| mIoU | S3DIS (Area 5) | 53,31 |
| OA (overall accuracy) | S3DIS (Area 5) | 84,93 |
| simple/mIoU | S3DIS (Area 5) | 51,05 |
| simple/OA | S3DIS (Area 5) | 83,29 |

No se han publicado en la información disponible resultados comparativos adicionales con otros modelos ni desglose por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 0,2 M de parámetros y 368 características, el modelo cabe holgadamente en menos de 1 GB de VRAM para lotes moderados de nubes de puntos de 8192 puntos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Para entrenamiento o fine-tuning, una RTX 3090/4090 o A100 acelera la iteración, aunque el modelo es tan pequeño que también puede entrenarse en GPU de gama media.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`) con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; por el tamaño del modelo se espera una latencia de milisegundos por nube de puntos en GPU, pero no se aporta un dato verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Dataset | mIoU (S3DIS Area 5) | Licencia |
|---|---|---|---|---|---|
| PVCNN c=0.25 (este) | 0,2 M | Híbrido punto-vóxel | S3DIS | 53,31 | MIT |
| PVCNN (variantes mayores, c=0.5/1.0) | no disponible en esta ficha | Híbrido punto-vóxel | S3DIS | no disponible | MIT |
| PointNet / PointNet++ | no disponible en esta ficha | Basado en puntos | S3DIS | no disponible | MIT (implementación de referencia) |
| MinkowskiNet | no disponible en esta ficha | Convolución dispersa 3D | S3DIS | no disponible | MIT (implementación de referencia) |

No se dispone en la información proporcionada de cifras verificadas de los modelos alternativos para una comparación cuantitativa rigurosa; las filas correspondientes se marcan como no disponibles.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en S3DIS (escenas interiores de oficinas y edificios); el rendimiento puede degradarse en escenas exteriores, industriales o con sensores distintos.
- Dependencia del preprocesado: espera 9 canales de entrada (posición, color, normales) y un pipeline de transformación y `collate` específico; un preprocesado incorrecto invalida las predicciones.
- Resolución de vóxeles fija: el factor `c=0.25` condiciona la granularidad espacial; objetos muy pequeños o puntos muy dispersos pueden segmentarse con menor precisión.
- Sin verificación independiente de los benchmarks: los valores de mIoU y OA son declarados por el autor y no están marcados como verificados.
- Riesgo de alucinación en el sentido de asignaciones erróneas: como todo modelo de segmentación, puede etiquetar incorrectamente puntos ambiguos (bordes, oclusiones, superficies reflectantes) sin señal de incertidumbre calibrada.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje; no debe evaluarse con métricas de NLP.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales (MIT HAN Lab) y a la conversión de `torch-pointcloud`.
- Fecha de creación del repositorio (2026-10-18) y actualización (2026-10-30) según los metadatos de Hugging Face; verificar la vigencia de la librería `torch-pointcloud` antes de integrarla en producción.
- Para producción se recomienda validar el modelo sobre datos propios del dominio objetivo antes de confiar en sus predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pvcnn-c0p25.s3dis-area5.mit-han-lab
- Paper PVCNN: https://arxiv.org/abs/1907.03739
- Repositorio original MIT HAN Lab: https://github.com/mit-han-lab/pvcnn
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Dataset S3DIS (paper): Armeni et al., "3D Semantic Parsing of Large-Scale Indoor Spaces", CVPR 2016
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
