# StarDoc-AI/TeleOCR

## Resumen

TeleOCR es un modelo de visión-lenguaje (VLM) de código abierto desarrollado por StarDoc-AI (TeleAI), especializado en el parseo de documentos. Con aproximadamente 1.200 millones de parámetros según su autor y 1.415.072.768 parámetros reales en los ficheros safetensors del repositorio, está construido sobre la arquitectura Qwen2.5-VL y se distribuye bajo licencia Apache-2.0. Su propuesta diferencial es unificar en un único modelo el parseo de documentos digitales nativos y el de documentos capturados con cámara, escenario este último en el que los parsers tradicionales suelen fallar por deformaciones geométricas, iluminación irregular y perspectiva.

El modelo resuelve tareas de OCR estructurado: extracción de texto, reconocimiento de orden de lectura, reconstrucción de tablas en formato estructurado y conversión de fórmulas matemáticas a LaTeX u otras representaciones. Frente a alternativas como MinerU 2.5 Pro, PaddleOCR-VL 1.6 u OvisOCR2, TeleOCR declara resultados de estado del arte en OmniDocBench v1.6 (96,87 de puntuación overall) manteniendo un tamaño reducido que permite despliegue en hardware modesto. El modelo se publicó originalmente como NaviDC-OCR el 17 de agosto de 2026 y fue renombrado a TeleOCR el 10 de septiembre de 2026.

Es relevante ahora porque cubre un hueco práctico: pipelines de digitalización documental que hasta hace poco requerían un modelo de rectificación (dewarping) más un modelo de parseo, y que TeleOCR resuelve de forma extremo a extremo sin preprocesado de rectificación. El repositorio acumula 29.682 descargas y 49 likes, y ya existe una conversión GGUF de la comunidad para llama.cpp, lo que amplía las opciones de despliegue en CPU y hardware de borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basado en Qwen2.5-VL (tag `qwen2_5_vl`, `custom_code`), con adaptaciones propias para parseo documental |
| Parámetros totales | 1.415.072.768 (según safetensors); el autor indica ~1,2 B en la model card |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No especificados por el autor; existe una conversión GGUF mantenida por la comunidad (nandraj/NaviDC-OCR-GGUF) |
| Idiomas soportados | Chino (zh), inglés (en), japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 2,8 GB); GGUF disponible en repositorio de terceros |

## Arquitectura y entrenamiento

TeleOCR sigue el patrón de los VLM multimodales conversacionales: un codificador visual que proyecta las imágenes a tokens y un decodificador de lenguaje que genera la salida estructurada. La base declarada es Qwen2.5-VL, lo que implica atención completa sobre la secuencia de tokens visuales y de texto, y requiere cargar código personalizado (`trust_remote_code`) por el tag `custom_code` del repositorio. El autor reporta aproximadamente 1,2 B de parámetros, cifra coherente con el tamaño del repo (2,8 GB en safetensors, equivalente a pesos en precisión de 16 bits).

La model card describe una pipeline de entrenamiento progresiva en cuatro etapas y varias innovaciones técnicas: Multi-node Consensus Voting (MCV) para generación automática de pseudo-etiquetas; modelado documental geométricamente consciente para documentos capturados con cámara; Curvature-Guided Douglas-Peucker Sampling (CGDP); autoverificación imagen-a-imagen para refinado automático de datos; y Content-Structure Decoupled Learning para tablas y fórmulas, que separa el aprendizaje del contenido del de la estructura. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta el uso de decodificación especulativa ni de mecanismos de atención lineal.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre documentos digitales y fotografías de documentos.
- Parseo de estructura documental: detección de bloques, orden de lectura y jerarquía de secciones.
- Reconstrucción de tablas en formato estructurado, incluyendo tablas complejas con celdas combinadas.
- Conversión de fórmulas matemáticas a representaciones como LaTeX (métrica Formula CDM en los benchmarks).
- Procesamiento de documentos deformados geométricamente (curvaturas, perspectiva, iluminación irregular) sin etapa previa de dewarping ni modelo dedicado de rectificación.
- Generación de texto multimodal conversacional, ya que el pipeline declarado es `image-text-to-text` con tag `conversational`.
- Soporte multilingüe limitado a chino, inglés y japonés.
- Compatibilidad con despliegue en Text Generation Inference y endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling, modo de razonamiento extendido (thinking), audio ni vídeo.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo convierte escaneos y fotografías de expedientes en texto estructurado con orden de lectura correcto, aprovechando su capacidad de parseo de bloques y jerarquías.
- Extracción de tablas financieras: facturas, balances y hojas de cálculo fotografiadas se transforman en tablas estructuradas listas para ingestión en bases de datos, con una métrica TEDS de 97,05 en OmniDocBench v1.6.
- Conversión de documentación científica a formatos editables: artículos con fórmulas matemáticas se convierten directamente a LaTeX, lo que facilita la migración de corpus PDF a repositorios de código o wikis técnicas.
- Procesamiento de documentos capturados con móvil en campo: inspecciones técnicas, albaranes o formularios fotografiados sin trípode, donde la deformación de perspectiva impide el uso de parsers clásicos; TeleOCR parsea directamente sin rectificación previa.
- Automatización de back-office con documentos en chino o japonés: contratos, formularios médicos o documentos fiscales en estos idiomas, cubiertos explícitamente por el modelo.
- Despliegue en borde o en hardware sin GPU dedicada: gracias a su tamaño de 1,2 B y a la conversión GGUF comunitaria, puede ejecutarse con llama.cpp en CPU o en aceleradores como Ascend 910B, según reporta la comunidad.
- Preprocesado para pipelines RAG: extracción de texto estructurado de PDFs y escaneos antes de la indexación vectorial, tarea en la que el orden de lectura correcto es determinante para la calidad de los fragmentos recuperados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el reto Dr.DocBench (EMNLP 2026), evaluados con los pesos nativos de NaviDC-OCR antes del renombrado:

| Modelo | Overall ↑ | Text edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Order edit ↓ |
|---|---|---|---|---|---|
| TeleOCR | 67,96 | 0,1903 | 0,02 | 64,97 | 0,398 |
| MinerU 2.5 Pro | 62,26 | 0,3402 | 0,04 | 67,75 | 0,356 |
| OvisOCR2 | 59,25 | 0,3883 | 0,00 | 61,59 | 0,3791 |
| PaddleOCR-VL 1.6 | 55,11 | 0,4364 | 0,21 | 51,34 | 0,412 |

Resultados en OmniDocBench v1.6:

| Modelo | Parámetros | Overall ↑ | Text edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Table TEDS-S ↑ | Read order edit ↓ |
|---|---|---|---|---|---|---|---|
| TeleOCR | 1,2 B | 96,87 | 0,027 | 96,36 | 97,05 | 98,52 | 0,122 |
| OvisOCR2 | 0,8 B | 96,58 | 0,025 | 97,53 | 94,76 | 97,16 | 0,111 |
| PaddleOCR-VL 1.6 | 0,9 B | 96,33 | 0,033 | 97,49 | 94,76 | 97,11 | 0,127 |

El autor también reporta evaluación cualitativa de layout sobre los conjuntos de dewarping DocUNet y DIR300, sin métricas numéricas publicadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 3-4 GB solo para pesos (1,415 B × 2 bytes ≈ 2,8 GB), más el coste del codificador visual y la caché KV, lo que sitúa el consumo práctico en el rango de 5-8 GB según resolución de imagen y longitud de secuencia.
- En cuantización GGUF de 4 bits, los pesos bajan aproximadamente a 0,8-1 GB, lo que permite ejecución en CPU con llama.cpp y en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para despliegue en servidor, A100, H100 o L40S ofrecen margen de sobra para lotes grandes.
- Cabe en GPU de consumo: sí, es uno de los puntos fuertes del modelo dado su tamaño de 1,2 B; en cuantización de 4 bits es viable incluso en GPUs de 4-6 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True`, Text Generation Inference (TGI), endpoints compatibles con la API de inferencia, llama.cpp mediante la conversión GGUF de la comunidad, y presumiblemente Ollama a partir de esos GGUF. También hay reportes comunitarios de despliegue en Ascend 910B.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Overall OmniDocBench v1.6 | Table TEDS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TeleOCR | 1,2 B | Parseo unificado digital + cámara | 96,87 | 97,05 | Apache-2.0 | HuggingFace, GGUF comunitario |
| OvisOCR2 | 0,8 B | Parseo documental especializado | 96,58 | 94,76 | No disponible | Referenciado en benchmarks del autor |
| PaddleOCR-VL 1.6 | 0,9 B | Parseo documental especializado | 96,33 | 94,76 | No disponible | Referenciado en benchmarks del autor |
| MinerU 2.5 Pro | No disponible | Pipeline de parseo documental | No evaluado en OmniDocBench v1.6 en la información disponible | 67,75 (Dr.DocBench) | No disponible | Referenciado en benchmarks del autor |

TeleOCR es el único de los cuatro con licencia Apache-2.0 confirmada y el único que declara explícitamente capacidades de parseo sobre documentos capturados con cámara sin rectificación previa.

## Limitaciones y advertencias

- Cobertura idiomática restringida a chino, inglés y japonés; no se declara soporte de español ni de otras lenguas latinas, lo que limita su uso directo en mercados hispanohablantes sin evaluación previa.
- Todos los resultados de benchmarks proceden del propio autor del modelo y no se han verificado de forma independiente en la información disponible; además, las métricas de Dr.DocBench se obtuvieron con los pesos de NaviDC-OCR, anteriores al renombrado.
- Riesgo de alucinación inherente a los modelos generativos: en documentos con baja resolución, ruido o tipografías inusuales puede generar contenido plausible pero incorrecto, especialmente en tablas y fórmulas.
- Longitud de contexto no documentada, lo que dificulta planificar el procesado de documentos de muchas páginas o de conversaciones multi-turno largas.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del repositorio: conviene auditar el código antes de desplegarlo en producción.
- El modelo es especializado en parseo documental; no debe esperarse de él un rendimiento competitivo en tareas generales de razonamiento, código o matemáticas fuera del contexto de una imagen.
- Licencia Apache-2.0: permite uso comercial y modificación con obligación de conservar el aviso de licencia y de patentes; no impone restricciones de uso adicionales conocidas.
- La model card no documenta sesgos específicos, composición del dataset de entrenamiento ni proceso de alineación (RLHF/DPO), lo que dificulta la evaluación de riesgos de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StarDoc-AI/TeleOCR
- Pesos anteriores (NaviDC-OCR): https://huggingface.co/StarDoc-AI/NaviDC-OCR
- Repositorio GitHub: https://github.com/caipeng328/TeleOCR
- Informe técnico (arXiv): https://arxiv.org/abs/2608.12898
- PDF del informe técnico: https://arxiv.org/pdf/2608.12898
- Aplicación web de TeleAI: https://www.teleai.com.cn/docparse/DocumentParsing
- Conversión GGUF de la comunidad (nandraj): https://huggingface.co/nandraj/NaviDC-OCR-GGUF
- Artículo sobre despliegue en Ascend 910B: https://zhuanlan.zhihu.com/p/2078516899093155893
- Reto Dr.DocBench (EMNLP 2026): https://eval.ai/web/challenges/challenge-page/2717/overview
- OmniDocBench: https://github.com/opendatalab/OmniDocBench
