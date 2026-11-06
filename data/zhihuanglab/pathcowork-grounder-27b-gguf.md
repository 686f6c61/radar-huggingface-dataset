# zhihuanglab/pathcowork-grounder-27B-GGUF

## Resumen

Pathcowork-grounder-27B-GGUF es un modelo multimodal de visión y lenguaje especializado en patología digital, desarrollado por zhihuanglab (laboratorio asociado a la University of Pennsylvania, según la licencia académica que emplea). El modelo se basa en Qwen3.6-27B y está afinado para una tarea muy concreta: el grounding visual de conceptos histopatológicos en imágenes de secciones teñidas con H&E. Dada una imagen y una pregunta en lenguaje natural, el modelo devuelve polígonos o polilíneas en formato JSON con coordenadas enteras sobre una cuadrícula de 0–1000 píxeles, o la respuesta "There are none." si el concepto no está presente.

Su relevancia reside en que aborda uno de los cuellos de botella clásicos de la IA en patología: la localización espacial precisa de hallazgos (nidos melanocíticos, carcinoma ductal in situ, necrosis pseudopalisading, focos metastásicos, patrones de Gleason) sin necesidad de entrenar detectores específicos por clase. El modelo se ha entrenado con conceptos diana de cinco órganos comunes (piel, cerebro, mama, ganglio linfático y próstata), pero según su autor también generaliza a órganos y conceptos fuera de distribución, como vejiga, colon o pulmón.

Esta versión se distribuye en formato GGUF (versión 2.2), lo que facilita su ejecución local con runtimes como llama.cpp, aunque el tamaño del repositorio (101,4 GB) indica que se incluyen múltiples cuantizaciones de un modelo de 27.320 millones de parámetros. La licencia es la penn-academic-software-license, de carácter académico, lo que restringe su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text basado en Qwen3.6-27B (transformer; detalles no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no detalladas en la model card; tamaño de repo 101,4 GB) |
| Idiomas soportados | no disponible (los ejemplos usan prompts en inglés) |
| Licencia | penn-academic-software-license (other) |
| Formato de pesos | GGUF (modelo base cuantizado desde safetensors de Qwen/Qwen3.6-27B) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-27B, un modelo de lenguaje de 27 mil millones de parámetros con capacidades multimodales (pipeline image-text-to-text), al que se le ha aplicado un afinado supervisado para tareas de grounding en histopatología. La salida del modelo está fuertemente estructurada: devuelve una lista JSON de polígonos 2D con etiquetas, usando coordenadas normalizadas a una cuadrícula de 0–1000 (x hacia la derecha, y hacia abajo), o la cadena fija "There are none." cuando no hay instancias del concepto solicitado. Este diseño de salida facilita la integración con visores de diapositivas digitales y pipelines de análisis de imagen.

Sobre los datos de entrenamiento, la model card indica que se entrenó con conceptos diana procedentes de cinco órganos comunes (piel, cerebro, mama, ganglio linfático y próstata), con imágenes H&E a distintas resoluciones (1 µm/px, 2 µm/px, 5 µm/px y vistas de sección completa a ~21–23 µm/px). No se ha publicado el número de tokens, la composición detallada del dataset ni si se emplearon técnicas como RLHF o DPO. Tampoco se describen innovaciones arquitectónicas específicas más allá del afinado sobre la base de Qwen3.6.

## Capacidades

- Grounding visual de conceptos histopatológicos: localización y delimitación de estructuras en imágenes H&E mediante polígonos con coordenadas en cuadrícula 0–1000.
- Detección de una o varias clases en una misma petición: acepta prompts que solicitan un único concepto o listas de varios conceptos simultáneamente.
- Manejo de clases ausentes: responde de forma explícita "There are none." cuando el concepto no aparece en la imagen, evitando falsas delimitaciones.
- Generalización fuera de distribución: según el autor, funciona con órganos y conceptos no incluidos en el entrenamiento (vejiga, colon, pulmón), incluyendo vistas de sección completa a baja resolución.
- Sensibilidad a la escala: interpreta metadatos del prompt como µm/px y ancho del campo (por ejemplo, "1 µm/px, field 1.0 mm wide"), lo que permite trabajar desde campos microscópicos hasta secciones enteras.
- Salida estructurada en JSON: apta para parseo automático en pipelines de análisis y visualización.
- Capacidades de conversación general heredadas del modelo base Qwen3.6-27B (tag conversational), aunque el afinado está orientado a la tarea de grounding.
- Tool calling, agentes y capacidades de razonamiento multi-paso: no disponibles (no documentadas en la model card).

## Casos de uso

- Pre-screening de biopsias prostáticas: el modelo puede delimitar áreas de carcinoma con patrón Gleason 3 en biopsias con aguja (2 µm/px), ayudando al patólogo a priorizar campos para revisión.
- Detección de focos metastásicos en ganglios linfáticos: localización automática de depósitos tumorales metastásicos en secciones ganglionares, útil en estadificación del cáncer de mama u otros tumores.
- Evaluación de márgenes y proliferaciones melanocíticas en dermatopatología: delimitación de nidos melanocíticos de unión, dermales, proliferaciones lentiginosas o diseminación pagetoide en campos de piel de 1 mm.
- Cuantificación de necrosis en neuro-oncología: contorno de áreas de necrosis pseudopalisading en secciones de cerebro, útil para estudios de glioblastoma y análisis cuantitativo de extensión necrótica.
- Análisis de carcinoma ductal in situ (DCIS) en mama: identificación y delimitación de áreas de DCIS para cálculo automático de extensión y carga tumoral.
- Anotación semi-automática de datasets de patología: generación de máscaras poligonales en JSON a partir de prompts en lenguaje natural, reduciendo el coste de anotación manual de imágenes histológicas.
- Screening de secciones completas: localización de estructuras en vistas whole-slide a baja resolución (por ejemplo, frondes papilares en vejiga a 23 µm/px), como paso previo a la selección de regiones de interés para zoom.
- Asistente interactivo para patólogos: integración en visores de diapositivas donde el patólogo formula preguntas en lenguaje natural y recibe superposiciones poligonales sobre la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 27B en GGUF, se estima en torno a 17–20 GB con cuantización Q4_K_M y unos 30 GB o más con cuantizaciones de 8 bits; el tamaño total del repo (101,4 GB) sugiere la presencia de variantes de alta fidelidad (posiblemente BF16 o Q8 en múltiples archivos). Dato exacto no disponible.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones de 4 bits; A100 40 GB/80 GB o H100 para cuantizaciones altas o contexto ampliado. Ejecución en CPU posible con llama.cpp, pero con latencias elevadas para 27B.
- Consumer GPU: cabe en una RTX 4090 de 24 GB con cuantización de 4 bits (Q4_K_M o similar); para cuantizaciones de 8 bits se requiere hardware profesional o descarga en múltiples GPUs.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (Ollama, LM Studio); dado el pipeline image-text-to-text, es necesario un runtime con soporte multimodal de GGUF. Compatibilidad con vLLM o TGI no documentada para esta variante GGUF (los pesos originales en safetensors del modelo base podrían desplegarse con vLLM).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| pathcowork-grounder-27B-GGUF | 27,3B | Grounding de conceptos en histopatología H&E | penn-academic-software-license (académica) | GGUF en Hugging Face |
| Quilt-1B LLava | ~1B (LLaVA sobre ViT y LLM pequeño) | QA general de patología (no grounding poligonal) | Apache 2.0 / CC (según componente) | Open source en Hugging Face |
| LLaVA-Med | ~13B | QA biomédico multimodal, descripción de imágenes médicas | LLaMA license (uso restringido) | Open source en Hugging Face |
| Virchow / Virchow2 (Paige) | ~2B (encoder visual) | Embeddings de pathology para clasificación, sin generación | Propietaria / no pública | Pesos restringidos |

Pathcowork se diferencia de los modelos anteriores en que produce salidas espaciales explícitas (polígonos) en lugar de solo texto descriptivo, y en que está especializado en H&E con metadatos de escala. Su principal desventaja frente a alternativas como Quilt es la licencia académica restrictiva y el mayor coste de inferencia (27B frente a ~1–13B).

## Limitaciones y advertencias

- Licencia académica restrictiva: la penn-academic-software-license limita el uso a contextos académicos; el despliegue comercial o clínico probablemente no esté permitido sin autorización. Revisar el archivo LICENSE antes de cualquier uso.
- No es un dispositivo médico: el modelo no está validado para diagnóstico clínico; sus salidas no deben usarse para decisiones sobre pacientes sin revisión por un patólogo cualificado.
- Riesgo de alucinación espacial: al tratarse de un LLM multimodal generando coordenadas, puede producir polígonos plausibles pero incorrectos; no hay datos públicos de métricas de precisión (IoU, sensibilidad) que permitan cuantificar la fiabilidad.
- Cobertura de entrenamiento limitada: entrenado con conceptos de cinco órganos; aunque el autor afirma generalización fuera de distribución, el rendimiento en órganos y conceptos no vistos no está cuantificado.
- Dependencia de metadatos del prompt: la calidad de la localización puede depender de que el usuario especifique correctamente µm/px y el ancho del campo; prompts mal formados pueden degradar el resultado.
- Idiomas: los ejemplos y el formato de salida están en inglés; el soporte de prompts en castellano u otros idiomas no está documentado.
- Requisitos de hardware elevados: 27B parámetros en formato multimodal exigen GPUs de gama alta o cuantización agresiva, con posible pérdida de precisión en las coordenadas.
- Sesgos: no documentados; potencialmente heredados de los datos de entrenamiento (distribución de órganos, tinciones y escáneres concretos) y del modelo base Qwen3.6-27B.
- Contexto, cuantizaciones exactas y capacidades de tool calling: no disponibles en la información publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhihuanglab/pathcowork-grounder-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia: https://huggingface.co/zhihuanglab/pathcowork-grounder-27B-GGUF/blob/main/LICENSE
- Paper, repositorio de código y demo: no disponibles en la información proporcionada.
