# Yale-BIDS-Chen/DA-OCT-Challenge-MICCAI-2026

## Resumen

DA-OCT-Challenge-MICCAI-2026 es un conjunto de pesos preentrenados para segmentación de capas retinianas en imágenes de tomografía de coherencia óptica (OCT, optical coherence tomography) en diez clases. Lo desarrolla el grupo Yale-BIDS-Chen-Lab de la Universidad de Yale (autores: Yang Zhang, Rong Zhou, Younjoon Chung y Qingyu Chen como autor de correspondencia). No es un modelo de lenguaje: es un modelo de visión por computador orientado a imagen médica, concretamente a la delineación de capas de la retina.

El repositorio publica los pesos originales empleados en la propuesta ganadora del reto DA-OCT (domain adaptation OCT) de MICCAI 2026, que obtuvo la primera plaza con una puntuación final de 0,8068 (0,84 en la subcategoría de mácula y 0,78 en campo amplio). El objetivo del reto es la adaptación de dominio: transferir la segmentación entre distintos equipos y protocolos de captura, un problema crónico en imagen médica por la variabilidad entre centros.

La distribución consta de dos checkpoints complementarios que se usan conjuntamente mediante una tubería de inferencia a resolución nativa y fusión de predicciones: un modelo basado en SAM (Segment Anything Model) y un PlainConvUnet. El repositorio ocupa 1,4 GB y se distribuye bajo licencia BSD 2-Clause. Se recomienda Python 3.11 y el código del repositorio de GitHub para ejecutar la inferencia. La distribución a través del MONAI Model Zoo está en preparación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos: uno basado en SAM (Segment Anything Model) y un PlainConvUnet; se combinan mediante fusión |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de segmentación de imagen, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precisión nativa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplicable (modelo de visión; no procesa lenguaje) |
| Licencia | BSD 2-Clause |
| Formato de pesos | PyTorch (.pt): `model.pt` (SAM-based) y `model_b.pt` (PlainConvUnet) |

Otros datos de interes: cada checkpoint incluye su configuración de modelo y pesos EMA. El repositorio pesa 1,4 GB. Sumas de verificación SHA-256 publicadas: `796947502935cb480a29f3ee2edfc7bb021fc40165c43a28f82aecec5e166e5c` (model.pt) y `23024511ed887cfc2e6d694941b1ae68443ae33806d223f31c6d61443e1f5b3d` (model_b.pt).

## Arquitectura y entrenamiento

La solución combina dos arquitecturas heterogéneas. El primer checkpoint (`model.pt`) se basa en SAM, el modelo de segmentación de propósito general de Meta AI, adaptado a la tarea de segmentación de capas retinianas en OCT. El segundo (`model_b.pt`) es un PlainConvUnet, una U-Net convolucional convencional sin bloques residuales complejos. La predicción final no proviene de un único modelo, sino de una tubería de inferencia a resolución nativa con fusión de las salidas de ambos, lo que explica la mejora de robustez frente a la adaptación de dominio.

Los pesos incluyen las EMA (exponential moving averages) empleadas durante el entrenamiento y la configuración del modelo, de modo que los checkpoints son autocontenidos. El entrenamiento utilizó el AI-READI Flagship Dataset of Type 2 Diabetes, v3.0.0 (DOI 10.60775/fairhub.3), distribuido bajo el AI-READI Data License Agreement v2.0 y financiado por el NIH (grant 1OT2OD032644, programa Bridge2AI Common Fund). El reto está centrado explícitamente en domain adaptation, es decir, en mantener el rendimiento al cambiar de dominio de adquisición (distintos equipos, centros y protocolos), lo que constituye la innovación técnica central de la propuesta. El manuscrito que describe el método está en preparación y todavía no se han publicado los detalles completos de composición del dataset, número de tokens (no aplicable) ni estrategias de ajuste.

## Capacidades

- Segmentación de capas retinianas en OCT en diez clases (etiquetas 0 a 9) a nivel de píxel.
- Generación de máscaras de un solo canal en formato uint8 PNG, con las etiquetas 0-9, al tamano original de cada imagen de entrada.
- Adaptación de dominio: el modelo está disenado para funcionar en distintos dominios de adquisición (mácula y campo amplio), aunque con rendimiento desigual (0,84 en mácula frente a 0,78 en campo amplio).
- Fusión de dos predictores (SAM-based y PlainConvUnet) en una única tubería de inferencia.
- Procesamiento por lotes: la entrada es un directorio plano de imágenes y la salida un directorio de máscaras.
- Inferencia en GPU y en CPU (opción `--device cpu`).
- Modo de inferencia sin degradación de imagen (`--no-degrade`) para reconstrucción a resolución nativa.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje, por tratarse de un modelo de visión especializado.

## Casos de uso

- Investigación en oftalmología: segmentación automática de capas retinianas en cohortes de OCT para medir grosores de capa (retina neural, capas externas, etc.) y correlacionarlos con patologías como la retinopatía diabética.
- Estudios multicéntricos con adaptación de dominio: el modelo está optimizado para mantener el rendimiento al cambiar de equipo o protocolo de captura, lo que permite aplicarlo a datos de distintos centros sin reentrenamiento específico por dominio en cada uno.
- Análisis de campo amplio y mácula: cubre ambas modalidades de adquisición, de modo que sirve tanto para regiones centrales como para campos extensos, con la salvedad del distinto rendimiento entre ambas.
- Preprocesado en pipelines de investigación clínica: generar máscaras de capas como paso previo a la extracción de biomarcadores cuantitativos o al entrenamiento de modelos posteriores.
- Validación y comparación de métodos de segmentación: sirve como referencia (baseline) de altas prestaciones para comparar nuevos algoritmos de segmentación de OCT en condiciones de cambio de dominio.
- Reproducción de resultados de competición: la tubería y los pesos permiten reproducir la propuesta ganadora del reto DA-OCT MICCAI 2026 y verificar la puntuación publicada.
- Despliegue en entornos sin GPU: al soportar inferencia en CPU, puede ejecutarse en estaciones de trabajo sin acelerador para procesamiento por lotes de baja prioridad.
- Comprobación de integridad de tuberías: uso de las 230 imágenes sintéticas publicadas por los organizadores para verificar que la instalación y el pipeline funcionan correctamente.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la propuesta al reto:

| Categoria | Puntuacion |
|---|---|
| Final (global) | 0,8068 |
| Macula | 0,84 |
| Widefield (campo amplio) | 0,78 |
| Posicion en el reto | 1.º |

No se han publicado en la informacion disponible resultados en benchmarks independientes como MMLU, HumanEval o GSM8K (no aplicables), ni metricas de segmentacion tipo Dice o IoU sobre conjuntos de validacion independientes. Las 230 imagenes sinteticas liberadas por los organizadores se destinaron a la comprobacion de la tuberia, no a una evaluacion independiente, y la mayoria se usaron en el entrenamiento historico, por lo que no constituyen un conjunto de evaluacion held-out ni una remedicion de la puntuacion final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion publicada.
- GPU recomendadas: no especificadas por los autores. Al tratarse de una tuberia con dos modelos (uno basado en SAM y un PlainConvUnet) a resolución nativa, se recomienda una GPU con memoria suficiente para ambos; no se publican cifras concretas.
- Inferencia en CPU: soportada explicitamente mediante el flag `--device cpu` de la herramienta de inferencia. Viable para lotes pequenos o entornos sin GPU, con latencia mayor.
- Tamano del repositorio: 1,4 GB, correspondiente a los dos checkpoints y ficheros auxiliares.
- Opciones de despliegue: la tuberia oficial `python -m octtta.infer` del repositorio de GitHub (con soporte de conjunto de datos de entrada por directorio y salida de mascaras PNG); PyTorch como framework subyacente; distribucion por el MONAI Model Zoo en preparacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible no incluye metricas de otros modelos de segmentacion de OCT con las que comparar directamente. Como referencia cualitativa, la categoria de modelos comparables incluiria frameworks genericos de segmentacion medica como nnU-Net o las utilidades de MONAI, y adaptaciones de SAM a imagen medica, pero no se dispone de datos numericos publicados en esta informacion para establecer una comparacion rigurosa. Por tanto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DA-OCT-Challenge-MICCAI-2026 (SAM-based + PlainConvUnet) | no disponible | no aplicable | 0,8068 final (reto DA-OCT) | BSD 2-Clause | Pesos en HuggingFace; codigo en GitHub |
| Alternativas de segmentacion medica (nnU-Net, MONAI, adaptaciones de SAM) | no disponible | no aplicable | no disponible | variable | variable |

## Limitaciones y advertencias

- Artefacto de investigacion, no producto clinico: son pesos de una propuesta de competicion, sin validacion regulatoria ni marcado CE / aprobacion FDA. No debe usarse para diagnostico o decision clinica sin validacion adicional.
- Riesgo de error en la segmentacion: aunque la puntuacion global es alta, el rendimiento en campo amplio (0,78) es notablemente inferior al de mácula (0,84), por lo que la fiabilidad depende de la modalidad de adquisicion.
- Sesgo de datos de entrenamiento: el modelo se entreno con el AI-READI Flagship Dataset of Type 2 Diabetes v3.0.0, centrado en diabetes tipo 2. Su comportamiento en otras poblaciones, patologias o equipos puede degradarse.
- Adaptacion de dominio limitada: aunque el reto aborda explicitamente la adaptacion entre dominios, no se garantiza un rendimiento homogeneo en todos los equipos, centros o protocolos no vistos durante el entrenamiento.
- Alucinacion o segmentaciones espurias: como cualquier modelo de segmentacion, puede producir mascaras incoherentes o etiquetas erroneas en imagenes de baja calidad, con artefactos o fuera de distribucion.
- Limitaciones de idioma y contexto: no aplicables; es un modelo de vision que no procesa texto ni lenguaje.
- Restricciones de licencia: los pesos se distribuyen bajo BSD 2-Clause, que permite uso comercial y modificacion con atribucion. Sin embargo, los componentes de terceros (SAM y otros) siguen sujetos a sus propias licencias, y los conjuntos de datos de origen deben obtenerse bajo sus condiciones de acceso propias.
- Dependencia de la tuberia de fusión: el rendimiento publicado corresponde al uso conjunto de `model.pt` y `model_b.pt` con la inferencia a resolucion nativa y fusion; usar un unico checkpoint puede reducir los resultados.
- Dependencia de versiones: se especifica Python 3.11 y dependencias concretas del repositorio de codigo; otras versiones pueden no funcionar.
- Validacion sintetica no concluyente: las 230 imagenes sinteticas sirven solo como comprobacion de la tuberia, no como evaluacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yale-BIDS-Chen/DA-OCT-Challenge-MICCAI-2026
- Repositorio de codigo: https://github.com/Yale-BIDS-Chen-Lab/yzjaxon-DA-OCT-Challenge-MICCAI-2026
- Documentacion de reproduccion: https://github.com/Yale-BIDS-Chen-Lab/yzjaxon-DA-OCT-Challenge-MICCAI-2026/blob/main/docs/REPRODUCE.md
- Documentacion de datos: https://github.com/Yale-BIDS-Chen-Lab/yzjaxon-DA-OCT-Challenge-MICCAI-2026/blob/main/docs/DATA.md
- Dataset AI-READI Flagship Dataset of Type 2 Diabetes, v3.0.0: https://doi.org/10.60775/fairhub.3
- Publicacion del consorcio AI-READI: https://doi.org/10.1038/s42255-024-01165-x
- Contacto del autor de correspondencia: yang.zhang.yz2483@yale.edu
- Manuscrito: en preparacion (referencia de cita pendiente de publicacion)
- Distribucion en MONAI Model Zoo: en preparacion
