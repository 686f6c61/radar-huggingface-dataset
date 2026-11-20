# Yurrhh/comic-panel-unetpp

## Resumen

Comic Panel U-Net++ es un conjunto de cuatro checkpoints de segmentación de viñetas de cómic y manga desarrollados por el usuario Yurrhh y publicados en Hugging Face bajo licencia MIT. El modelo resuelve la tarea de detectar y aislar las viñetas (paneles) en páginas escaneadas de cómic occidental y manga, un paso previo habitual en pipelines de digitalización, traducción automática, reordenación de lectura o análisis de layout editorial. No es un modelo de lenguaje: es una red convolucional de segmentación de imagen.

La arquitectura es U-Net++ sin supervisión profunda, con BatchNorm + ReLU, anchuras de特征 [32, 64, 128, 256, 512] y una única salida sigmoide. Todos los checkpoints comparten exactamente 9.056.769 parámetros y trabajan sobre tensores RGB de 448×448 normalizados por /255.0. El repositorio incluye cuatro variantes según el dominio de entrenamiento: cómic occidental, manga, combinado y Manga109.

Su relevancia es acotada pero concreta: ofrece una implementación ligera (repo de 0,1 GB, ~9 M de parámetros) ejecutable en CPU o GPU de consumo, con contratos de preprocesamiento y arquitectura documentados y checksums SHA-256, lo que facilita su integración reproducible en pipelines de procesamiento de documentos. La model card advierte explícitamente de que las métricas de los distintos informes no son comparables entre sí y de que el checkpoint Manga109 se detuvo en la época 116, no en las 150 previstas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net++ sin supervisión profunda, BatchNorm + ReLU, anchuras [32, 64, 128, 256, 512], salida sigmoide única |
| Parametros totales | 9.056.769 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada fija de 448×448 RGB) |
| Tipos de cuantizacion | no disponible (formato Keras nativo; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; segmentación de imagen) |
| Licencia | MIT (documentación y empaquetado; los derechos de los datasets e imágenes originales permanecen con sus propietarios) |
| Formato de pesos | Keras (`.keras`), cargables con `keras.models.load_model(..., compile=False)` |

## Arquitectura y entrenamiento

La red es una U-Net++ (Nested U-Net) sin supervisión profunda, con bloques BatchNorm + ReLU y cinco niveles de anchura de特征 (32, 64, 128, 256 y 512). La entrada es una imagen RGB de 448×448 normalizada dividiendo entre 255,0, y la salida es un mapa de probabilidad por píxel con activación sigmoide que representa la pertenencia a una viñeta. Los cuatro checkpoints comparten esta arquitectura y el mismo recuento de parámetros (9.056.769), diferenciándose únicamente en el conjunto de entrenamiento.

Según la model card, las variantes Comic, Manga y Combined se entrenaron desde cero con el régimen de entrenamiento del repositorio, y sus métricas y descripciones de particiones están en `reports/FINAL_EXPERIMENT_REPORT.md`. La variante Manga109 emplea una partición agrupada por serie o título (8.452 páginas de entrenamiento, 1.075 de validación y 1.075 de test), agrupando series multivolumen para evitar solapamiento entre particiones. El entrenamiento de Manga109 se detuvo intencionadamente en la época 116 y el checkpoint publicado corresponde al de mejor pérdida de validación (`best_val_loss=0.238922`), no a una ejecución completa de 150 épocas. No se documentan en la información disponible el número total de tokens ni detalles de RLHF/DPO, ya que no aplican a esta tarea.

El repositorio incluye además un pipeline de postprocesado asociado (LSA+GF): apertura morfológica, bordes Canny, líneas probabilísticas de Hough, agrupamiento de intersecciones por Mean-Shift, validación de Bresenham y filtrado de componentes. Este pipeline no está incluido como código en el repositorio de pesos, sino descrito en los informes.

## Capacidades

- Segmentación semántica de viñetas en páginas de cómic occidental (checkpoint `models/comic/model.keras`).
- Segmentación de viñetas en páginas de manga (checkpoint `models/manga/model.keras`).
- Segmentación en dominio combinado cómic + manga (checkpoint `models/combined/model.keras`).
- Segmentación entrenada con partición agrupada por serie sobre Manga109 (checkpoint `models/manga109/model.keras`).
- Entrada de imagen RGB de tamaño fijo 448×448 con normalización /255.0.
- Salida de máscara binaria/probabilística por píxel, apta para postprocesado geométrico (LSA+GF).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de segmentación.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Digitalización y reestructuración de archivos de cómic: el modelo genera máscaras de viñeta que permiten recortar cada panel de una página escaneada y almacenarlo como imagen independiente, facilitando la creación de bibliotecas digitales navegables. Su tamaño de ~9 M de parámetros permite procesar lotes grandes en CPU.
- Traducción automática de manga: la segmentación de viñetas es el primer paso para aislar regiones y aplicar después detección de texto y OCR; el checkpoint `manga` está entrenado específicamente sobre páginas de manga para reducir falsos positivos en layouts densos.
- Reordenación de lectura y guiado de lectura (reading order): una vez extraídas las máscaras de panel, el pipeline LSA+GF descrito en los informes permite derivar la geometría de las viñetas y establecer el orden de lectura, útil en visores y aplicaciones de accesibilidad.
- Análisis de layout editorial: extracción de estadísticas sobre número, tamaño y disposición de viñetas por página para estudios de estilo, catalogación o investigación en humanidades digitales.
- Preprocesado para OCR y sistemas de diálogo: al aislar cada viñeta se reduce el ruido de fondo y se mejora la detección de bocadillos y texto en pipelines posteriores, especialmente con el checkpoint `combined` cuando el corpus mezcla cómic y manga.
- Filtrado y control de calidad en escaneos: la máscara predicha puede compararse con heurísticas geométricas para detectar páginas mal escaneadas, rotadas o con viñetas cortadas, como paso de validación en un pipeline de digitalización masiva.
- Prototipado e investigación en segmentación: al ser un U-Net++ pequeño con contratos de arquitectura y preprocesamiento documentados (`common/architecture.json`, `common/preprocessing.json`) y checksums SHA-256, sirve como baseline reproducible para experimentos de segmentación de layout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los informes `reports/FINAL_EXPERIMENT_REPORT.md`, `reports/MANGA109_RECOVERY_V2_REPORT.md` y `reports/MANGA109_SPLIT_TRAINING_REPORT.md` para las métricas detalladas, y advierte de que los informes usan protocolos de dataset distintos, por lo que sus valores no son comparables entre sí salvo que la partición, el evaluador, la agregación y el preprocesamiento sean idénticos. El único dato numérico publicado en la información disponible es `best_val_loss=0.238922` para el checkpoint Manga109.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 9.056.769 parámetros y entrada 448×448, el modelo cabe holgadamente en cualquier GPU de consumo; una estimación conservadora en FP32 ronda unas decenas de MB de pesos, y el pico de memoria lo determina principalmente el tamaño del lote y las activaciones intermedias de la U-Net++.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque para este tamaño las GPU de gama alta no aportan ventajas significativas frente a una GPU de consumo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Keras/TensorFlow nativo mediante `keras.models.load_model(..., compile=False)`; también es posible exportar a TensorFlow SavedModel o TFLite para despliegue en entornos ligeros. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comic Panel U-Net++ (este) | 9.056.769 | 448×448 RGB | no aplica | MIT | Hugging Face, 4 checkpoints |
| Alternativas de segmentación de viñetas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de segmentación de viñetas de cómic o manga (parámetros, contexto, rendimiento o licencia), por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El checkpoint Manga109 se detuvo intencionadamente en la época 116 y no completó las 150 épocas previstas; el publicado es el de mejor pérdida de validación, no el de una ejecución terminada.
- Los informes del repositorio usan protocolos de dataset distintos; no deben compararse valores entre informes sin idéntica partición, evaluador, agregación y preprocesamiento.
- El modelo está entrenado para páginas de cómic y manga; su comportamiento en otros tipos de layout (revistas, periódicos, documentos técnicos) no está documentado.
- Entrada fija de 448×448: páginas de resolución o relación de aspecto muy distintas requerirán redimensionado, con posible pérdida de detalle en viñetas pequeñas.
- No se redistribuyen los datos crudos ni las anotaciones; el usuario debe obtener los datasets de sus fuentes originales y respetar sus licencias y derechos de copyright.
- La licencia MIT cubre la documentación y el empaquetado; los derechos sobre las imágenes de entrenamiento y sobre las imágenes procesadas permanecen con sus titulares, lo que puede condicionar el uso comercial de los resultados según la jurisdicción.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y negativos en las máscaras, especialmente en viñetas irregulares, sangrados a sangre o páginas con ruido de escaneo.
- No se documentan sesgos demográficos ni lingüísticos porque el modelo no procesa texto; los posibles sesgos se limitan al estilo visual de los corpus de entrenamiento (predominio de determinadas escuelas de cómic y manga).
- El pipeline de postprocesado LSA+GF no se incluye como código en el repositorio de pesos, solo descrito en los informes, lo que obliga a reimplementarlo para reproducir los resultados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yurrhh/comic-panel-unetpp
- Informe de experimentos finales (referenciado en la model card): `reports/FINAL_EXPERIMENT_REPORT.md`
- Informe de recuperación Manga109 v2 (referenciado): `reports/MANGA109_RECOVERY_V2_REPORT.md`
- Informe de entrenamiento con partición Manga109 (referenciado): `reports/MANGA109_SPLIT_TRAINING_REPORT.md`
- Contrato de arquitectura: `common/architecture.json`
- Contrato de preprocesamiento: `common/preprocessing.json`
- Protocolo de evaluación: `common/evaluation_protocol.md`
- Checksums SHA-256: `checksums/sha256sums.txt`
- Citación machine-readable: `CITATION.cff`
- Paper de referencia: Q. H. Nguyen et al., "Comic Panel Extraction using U-Net++ Deep Learning Model and Line Segment Analysis", 2026 (sin URL disponible en la información proporcionada)
