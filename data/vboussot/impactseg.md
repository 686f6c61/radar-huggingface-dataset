# VBoussot/ImpactSeg

## Resumen

ImpactSeg es un modelo de segmentación anatómica corporal multimodal desarrollado por VBoussot (autor también del framework KonfAI) que segmenta 11 estructuras anatómicas en volúmenes médicos de tomografía computarizada (CT), resonancia magnética (MR) y tomografía computarizada de haz cónico (CBCT) con un único modelo. Resuelve el problema de tener que mantener pipelines separados por modalidad: en lugar de entrenar y desplegar un modelo distinto para cada tipo de imagen médica, ImpactSeg unifica las tres modalidades en una sola red, lo que simplifica el despliegue clínico y de investigación.

Técnicamente se trata de una UNet con encoder residual en configuración 2.5D, que procesa parches de tamaño `[1, 192, 192]` remuestreados a una resolución isotrópica de 3 mm. El modelo se distribuye a través de la librería `konfai` y del paquete `impact_seg_konfai`, e incluye un runner genérico y una integración interactiva con 3D Slicer (SlicerKonfAI). El repositorio ocupa 4,9 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en dos factores: la creciente demanda de herramientas de segmentación médica abiertas y reproducibles, y la eficiencia de despliegue. Según la model card, el modelo procesa un CT de cuerpo completo (295 × 259 × 219 vóxeles a 2 mm) en aproximadamente 7 segundos en una NVIDIA RTX PRO 5000 de 24 GB, con un consumo de RAM del sistema de solo ~1,6 GB, lo que lo hace viable en estaciones de trabajo con GPU de gama media-alta sin necesidad de clústeres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet con encoder residual, configuración 2.5D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D; parche de entrada `[1, 192, 192]`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (distribución vía paquete `impact_seg_konfai` y librería `konfai`) |

## Arquitectura y entrenamiento

ImpactSeg emplea una arquitectura UNet con encoder residual en configuración 2.5D: procesa cortes o parches bidimensionales de tamaño `[1, 192, 192]` extraídos de volúmenes 3D, lo que reduce el coste computacional frente a una UNet 3D completa manteniendo la coherencia anatómica entre cortes adyacentes. Los volúmenes de entrada se remuestrean a una resolución isotrópica de 3 mm antes de la inferencia, lo que normaliza la variabilidad de espaciado entre equipos y protocolos de adquisición.

El modelo segmenta 11 estructuras anatómicas corporales y está entrenado de forma conjunta sobre las tres modalidades (CT, MR y CBCT), de modo que una única red aprende representaciones compartidas entre dominios de imagen con estadísticas muy distintas. La model card no detalla el número de volúmenes de entrenamiento, la composición del dataset, ni si se emplearon técnicas de aumento de datos específicas o ajuste fino por modalidad. Tampoco se documenta el uso de RLHF/DPO (no aplicable en segmentación) ni innovaciones como decodificación especulativa. El paper asociado (arXiv:2510.21358) es la referencia para los detalles metodológicos completos.

## Capacidades

- Segmentación anatómica corporal de 11 estructuras en volúmenes CT, MR y CBCT con un único modelo.
- Procesamiento multimodal unificado: no requiere seleccionar un checkpoint distinto según la modalidad de imagen.
- Inferencia sobre volúmenes 3D completos mediante parches 2.5D con remuestreo automático a 3 mm.
- Ejecución mediante CLI (`impact-seg-konfai segment body`), runner genérico de KonfAI (`konfai-apps infer`) e integración interactiva con 3D Slicer.
- Ajuste de parámetros de inferencia (tamaño de parche y tamaño de lote) desde la interfaz o por línea de comandos.
- Cálculo automático del tamaño de lote según la VRAM libre disponible en la GPU.
- No soporta tool calling, function calling, agentes ni generación de texto: es un modelo exclusivamente de segmentación de imagen.

## Casos de uso

- Planificación de radioterapia: el modelo delimita estructuras anatómicas corporales sobre CT de planificación en ~7 segundos por caso, lo que permite integrarlo en el flujo de contorneado previo a la dosimetría sin cuellos de botella.
- Investigación en imagen médica multimodal: al unificar CT, MR y CBCT, un mismo pipeline de análisis puede procesar cohortes heterogéneas sin duplicar código ni mantener checkpoints separados por modalidad.
- Preprocesamiento para pipelines de registro y análisis: la segmentación corporal sirve como paso previo para recortar el campo de visión, enmascarar tejido no relevante o inicializar algoritmos de registro rígido entre estudios.
- Integración en estaciones de trabajo clínicas con 3D Slicer: mediante SlicerKonfAI, el radiólogo puede lanzar la segmentación desde la interfaz y ajustar tamaño de parche y lote sin escribir código.
- Control de calidad y verificación de adquisiciones: la segmentación de estructuras corporales permite detectar volúmenes mal recortados, campos de visión incompletos o artefactos graves antes de pasarlos a análisis posteriores.
- Procesamiento por lotes en servidores modestos: con ~1,6 GB de RAM de sistema y ejecución en GPUs de 8 GB en adelante, es viable procesar lotes de estudios en estaciones de trabajo no dedicadas.
- Docencia y prototipado: la licencia Apache 2.0 y el paquete en PyPI permiten incorporar el modelo a cursos, cuadernos de investigación y pruebas de concepto sin trámites de licencia.

## Benchmarks y rendimiento

La model card no publica métricas de calidad de segmentación (Dice, IoU, HD95) ni comparaciones con otros modelos. Solo se documenta el rendimiento de inferencia medido en una NVIDIA RTX PRO 5000 (24 GB) con un CT de cuerpo completo de 295 × 259 × 219 vóxeles a 2 mm:

| VRAM libre | Lote (automático) | VRAM pico | Tiempo / caso |
|---|---|---|---|
| 8 GB | 160 | ~7 GB | no disponible |
| 16 GB | 320 | ~14 GB | no disponible |
| 24 GB | 512 | ~10 GB | ~7 s |

El autor señala que los parches 2.5D delgados no saturan la tarjeta, por lo que la inferencia está limitada por cómputo y el tiempo (~7 s) es en gran medida independiente del tamaño de lote. No se han publicado resultados de benchmarks de calidad de segmentación en la información disponible.

## Requisitos de hardware

- VRAM estimada: desde ~7 GB de pico con lote automático de 160 en GPUs de 8 GB; ~14 GB de pico con lote de 320 en GPUs de 16 GB; ~10 GB de pico con lote de 512 en GPUs de 24 GB.
- GPU recomendadas: NVIDIA RTX PRO 5000 (24 GB) es la referencia medida por el autor; cualquier GPU con 8 GB o más de VRAM debería poder ejecutar el modelo con lote reducido.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM (por ejemplo, gama RTX 3060/4060 de 8 GB en adelante), aunque el rendimiento exacto no está documentado para esas tarjetas.
- Memoria de sistema: ~1,6 GB de RAM para segmentación corporal con un único modelo.
- Opciones de despliegue: CLI `impact-seg-konfai`, runner genérico `konfai-apps infer`, e integración con 3D Slicer vía SlicerKonfAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ~7 segundos por caso de cuerpo completo en RTX PRO 5000 de 24 GB; el tiempo es prácticamente independiente del tamaño de lote según el autor.

## Comparativa con modelos similares

| Modelo | Modalidades | Estructuras | Licencia | Despliegue | Contexto/entrada |
|---|---|---|---|---|---|
| ImpactSeg | CT, MR, CBCT | 11 | Apache 2.0 | KonfAI, CLI, 3D Slicer | Parche `[1, 192, 192]`, remuestreo 3 mm |
| TotalSegmentator | CT (principalmente) | >100 | Apache 2.0 (versión open) | nnU-Net, CLI, 3D Slicer | Volumen 3D completo |
| MONAI Bundle (varios) | Depende del bundle | Depende del bundle | Depende del bundle | MONAI, CLI | Depende del bundle |

No se dispone de datos de benchmarks que permitan comparar la calidad de segmentación de ImpactSeg con TotalSegmentator u otras alternativas en la información proporcionada; la comparación anterior se limita a características técnicas y de licencia.

## Limitaciones y advertencias

- No se publican métricas de calidad de segmentación (Dice, IoU, HD95) en la model card, lo que impide evaluar su precisión frente a alternativas sin ejecutar una validación propia.
- No se documenta la composición del dataset de entrenamiento ni su cobertura demográfica, por lo que se desconoce el posible sesgo respecto a edad, sexo, etnia o tipo de equipo.
- El remuestreo fijo a 3 mm puede degradar la segmentación de estructuras pequeñas o de estudios adquiridos con espaciado muy fino.
- La configuración 2.5D puede perder coherencia tridimensional en anatomías con cambios bruscos entre cortes; no se documenta el manejo de anisotropía severa.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni agentes, por lo que no debe evaluarse con los criterios habituales de los LLM.
- Aunque la licencia Apache 2.0 permite uso comercial, se trata de un modelo de investigación médica: no se documenta certificación regulatoria (CE, FDA) ni validación clínica, por lo que no debe usarse como dispositivo médico sin las validaciones pertinentes.
- El rendimiento medido corresponde a una única GPU (RTX PRO 5000); el comportamiento en otras tarjetas, en particular con poca VRAM, no está documentado.
- El ecosistema depende de la librería `konfai`, menos extendida que nnU-Net o MONAI, lo que puede complicar la integración en infraestructuras existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VBoussot/ImpactSeg
- Paper: https://arxiv.org/abs/2510.21358
- Repositorio KonfAI: https://github.com/vboussot/KonfAI
- Paquete PyPI: https://pypi.org/project/impact_seg_konfai/
- Integración con 3D Slicer (SlicerKonfAI): https://github.com/vboussot/SlicerKonfAI
