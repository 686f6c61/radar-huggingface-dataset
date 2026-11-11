# zyjyz/RolmOCR

## Resumen

RolmOCR es un modelo de visión-lenguaje (VLM) especializado en OCR de documentos, desarrollado por Reducto AI. Se trata de un ajuste fino de Qwen2.5-VL-7B-Instruct sobre el conjunto de datos completo allenai/olmOCR-mix-0225, y se posiciona como una alternativa directa a olmOCR de Allen AI, que se basaba en el modelo anterior Qwen2-VL-7B. El objetivo es ofrecer un parseo de PDFs y documentos complejos con mayor velocidad, menor consumo de memoria y calidad equivalente o superior en una variedad de tipos documentales.

El modelo mantiene la arquitectura transformer multimodal de Qwen2.5-VL-7B, con aproximadamente 8.290 millones de parámetros totales, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La principal diferencia técnica frente al olmOCR original es la eliminación de las entradas de metadatos extraídos del PDF, lo que reduce significativamente la longitud del prompt y, con ello, el tiempo de procesamiento y la VRAM necesaria, sin degradar la precisión en la mayoría de los casos.

Es relevante ahora porque cubre una necesidad muy concreta en pipelines de digitalización y extracción documental: convertir páginas escaneadas o PDFs complejos en texto plano legible, con un modelo abierto, desplegable en infraestructura propia y compatible con servidores OpenAI a través de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basada en Qwen2.5-VL-7B-Instruct |
| Parametros totales | 8.292.166.656 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no ha evaluado versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,6 GB) |

## Arquitectura y entrenamiento

RolmOCR parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa imágenes y texto de forma conjunta. El ajuste fino se realizó sobre el dataset completo allenai/olmOCR-mix-0225, el mismo empleado por olmOCR, pero con tres modificaciones clave. Primero, se sustituyó el modelo base Qwen2-VL-7B por la versión más reciente Qwen2.5-VL-7B. Segundo, se eliminaron las entradas de metadatos extraídos del PDF, lo que acorta el prompt y reduce el coste computacional. Tercero, aproximadamente el 15% de los datos de entrenamiento se rotaron para mejorar la robustez frente a documentos inclinados o escaneados en ángulos no rectos.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset más allá de su origen, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La propuesta técnica se centra, por tanto, en la simplificación del prompt y la actualización del modelo base como vías para ganar eficiencia sin sacrificar calidad.

## Capacidades

- OCR de documentos: convierte imágenes de páginas y PDFs en texto plano con formato natural.
- Procesamiento de documentos complejos: tablas, diseños multicolumna y estructuras no triviales.
- Robustez ante rotaciones: gracias al entrenamiento con un 15% de datos rotados, tolera documentos inclinados.
- Generación de texto a partir de imagen: pipeline image-text-to-text.
- Conversación multimodal: soporta el formato de chat con mensajes que combinan imagen y texto.
- Compatibilidad con API OpenAI: desplegable mediante vLLM como servidor compatible con OpenAI.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, matemáticas avanzadas ni audio.

## Casos de uso

- Digitalización masiva de archivos PDF: el modelo procesa cada página como imagen y devuelve el texto plano, lo que permite construir pipelines de conversión por lotes con vLLM y reducir el coste frente a soluciones propietarias.
- Extracción de texto en sistemas de gestión documental: integrable como servicio compatible con OpenAI para alimentar bases de datos, motores de búsqueda o sistemas RAG con contenido de documentos escaneados.
- Procesamiento de facturas y formularios: al manejar tablas y diseños complejos, resulta adecuado para digitalizar documentos administrativos y financieros.
- Accesibilidad y lectura asistida: convierte documentos visuales en texto legible para lectores de pantalla o herramientas de accesibilidad.
- Archivística y preservación digital: permite generar transcripciones de fondos documentales históricos o administrativos, incluidos escaneos con cierta inclinación gracias a la rotación en entrenamiento.
- Automatización de back office: extracción de contenido de contratos, informes y expedientes para su posterior clasificación o análisis, reduciendo el trabajo manual de transcripción.
- Investigación sobre VLMs aplicados a OCR: al ser Apache 2.0 y estar basado en Qwen2.5-VL, sirve como punto de partida para ajustes finos adicionales o comparaciones con olmOCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el autor no ha evaluado versiones cuantizadas. Como referencia orientativa, un modelo de ~8.290 millones de parámetros en precisión completa (fp16/bf16) requiere del orden de 16-17 GB solo para los pesos, más el coste adicional de las imágenes y el contexto.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar GPUs con al menos 24 GB de VRAM en fp16 (por ejemplo, A10G, L4 de 24 GB, RTX 4090) o GPUs de datacenter como A100 y H100 para mayor throughput, aunque esto no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No confirmado. En fp16 probablemente requiere GPUs de 24 GB o más; en cuantizaciones de 8 o 4 bits podría caber en GPUs con 16 GB o menos, pero no hay evaluación publicada.
- Opciones de despliegue: vLLM (recomendado por el autor, con `export VLLM_USE_V1=1` y `vllm serve reducto/RolmOCR`), servidor compatible con OpenAI, y la librería transformers. No se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. El autor afirma que RolmOCR es más rápido y usa menos memoria que olmOCR gracias a la eliminación de metadatos, pero no publica cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Modelo base | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| RolmOCR | ~8.290 M | Qwen2.5-VL-7B-Instruct | no disponible | Apache 2.0 | Sin metadatos de PDF; 15% de datos rotados; más rápido y ligero según el autor |
| olmOCR | ~8.290 M (Qwen2-VL-7B) | Qwen2-VL-7B | no disponible | no disponible en la información | Usa metadatos del PDF; modelo base anterior |
| Qwen2.5-VL-7B-Instruct | ~8.290 M | — | no disponible | Apache 2.0 (según el modelo base) | Modelo generalista multimodal, no especializado en OCR |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada.

## Limitaciones y advertencias

- Alucinación y pérdida de contenido: como otras soluciones de OCR basadas en VLM, puede inventar texto o omitir fragmentos del documento original.
- Sin bounding boxes: a diferencia de la API de parseo de Reducto, RolmOCR no puede devolver cajas de diseño (layout bounding boxes), lo que limita su uso en tareas que requieran localización espacial del texto.
- Cuantizaciones no evaluadas: el autor no ha medido el rendimiento de versiones cuantizadas, por lo que su calidad en 8 o 4 bits es incierta.
- Idiomas: no se especifican los idiomas soportados; al heredar de Qwen2.5-VL es probable un soporte multilingüe amplio, pero no está documentado para esta ficha.
- Contexto: no se documenta la longitud máxima de contexto, lo que dificulta planificar el procesamiento de páginas con mucho contenido visual o texto.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset allenai/olmOCR-mix-0225 y del modelo base Qwen2.5-VL-7B-Instruct para usos concretos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: se trata de una publicación reciente y poco validada por la comunidad, lo que aconseja pruebas propias antes de llevarlo a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zyjyz/RolmOCR
- Modelo original del autor (referenciado en la model card): https://huggingface.co/reducto/RolmOCR
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/olmOCR-mix-0225
- Reducto AI: https://reducto.ai/
- Allen Institute for AI: https://allenai.org/
- API de parseo de Reducto: https://app.reducto.ai/
