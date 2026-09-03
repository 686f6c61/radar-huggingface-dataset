# Ystar124/formtgpt

## Resumen

formtgpt, también denominado DocLLM por su autor, es un modelo de lenguaje autoregresivo tipo Transformer construido desde cero en PyTorch, diseñado específicamente para responder preguntas sobre documentos PDF con citas de página. Lo desarrolla Ystar124 y se publica en HuggingFace en septiembre de 2026, aunque el repositorio no registra descargas ni valoraciones, lo que sugiere que se trata de un proyecto experimental o académico de carácter personal.

El modelo resuelve el problema de la comprensión de documentos PDF de forma local y ligera, sin depender de APIs externas. Con aproximadamente 5 millones de parámetros y una ventana de contexto de 256 tokens, es un modelo extremadamente compacto que ofrece un pipeline integrado de carga de PDF, procesamiento y generación de respuestas con referencias a páginas concretas del documento.

Su relevancia radica en ser un ejemplo de implementación didáctica de un Transformer causal completo (RoPE, SwiGLU, RMSNorm, KV-cache) aplicado a una tarea concreta de IA documental, más que en su rendimiento bruto, que queda limitado por su tamaño y su ventana de contexto reducida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autoregresivo (6 capas, 8 cabezas, d_model 256) |
| Parametros totales | 4.997.888 (~5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | pytorch_model.bin (PyTorch) y tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un Transformer causal estándar con codificación posicional rotatoria (RoPE), atención multi-cabeza causal con caché de clave-valor (KV-cache), red feed-forward con activación SwiGLU y normalización RMSNorm. La configuración concreta es de 6 capas, 8 cabezas de atención y una dimensión de modelo de 256, lo que da un total de 4.997.888 parámetros. No se especifica el uso de arquitecturas mixtas, MoE ni mecanismos de decodificación especulativa.

Sobre el entrenamiento, la información disponible no detalla el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se indica el proceso de entrenamiento para la tarea de QA sobre PDF, aunque el pipeline presentado sugiere un flujo de carga de documento, tokenización y generación autoregresiva con citas de página integradas en la salida.

## Capacidades

- Generación de texto autoregresiva causal en inglés.
- Comprensión de documentos PDF y respuesta a preguntas sobre su contenido.
- Citación de páginas del documento en las respuestas generadas.
- Pipeline integrado mediante la clase `DocLLMPipeline` y el cargador `PDFLoader`.
- Soporte de carga de pesos desde HuggingFace Hub con `hf_hub_download`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Extracción de información de documentos PDF locales: el modelo permite cargar un PDF y formular preguntas directas sobre su contenido, obteniendo respuestas con referencia a la página de origen, útil para contratos, informes o manuales.
- Auditoría documental rápida: consultar cláusulas, fechas o datos concretos en documentos extensos sin lectura completa, gracias al flujo `PDFLoader` + `ask_document`.
- Prototipado de sistemas de QA sobre documentación interna: al ser un modelo de solo 5 M de parámetros, puede integrarse en entornos con recursos muy limitados para validar flujos de pregunta-respuesta antes de escalar a modelos mayores.
- Material didáctico de arquitecturas Transformer: su implementación desde cero en PyTorch lo convierte en un recurso útil para estudiar atención causal, RoPE, SwiGLU y RMSNorm en un modelo funcional y descargable.
- Asistente de estudio sobre apuntes o artículos en PDF: estudiantes pueden preguntar sobre capítulos concretos y localizar la página donde aparece la información.
- Automatización de resúmenes dirigidos por preguntas: formular preguntas específicas sobre un documento y obtener respuestas acotadas con su ubicación, en lugar de resúmenes generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna evaluación comparativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 (aproximadamente 20 MB de pesos), por lo que es viable en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU sin problemas.
- Cabe en GPU de consumo: sí, en cualquier tarjeta, incluidas las integradas.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch (`pytorch_model.bin`) y tokenizer en formato JSON; no se documentan conversiones a GGUF, ONNX ni soporte para vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles, aunque por su tamaño se espera una latencia mínima incluso en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un Transformer custom de 5 M de parámetros orientado a QA sobre PDF, una categoría en la que no hay alternativas equivalentes con el mismo enfoque y tamaño en la información proporcionada. Los modelos comerciales de comprensión documental (por ejemplo, los basados en arquitecturas encoder-decoder o LLMs de gran tamaño con RAG) no son comparables ni por parámetros ni por capacidades. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Ventana de contexto muy reducida: 256 tokens, lo que impide procesar documentos largos de una sola vez y limita las preguntas a fragmentos muy cortos del texto.
- Capacidad lingüística limitada: solo se declara soporte del inglés; no hay evidencia de funcionamiento fiable en otros idiomas.
- Riesgo de alucinación: al ser un modelo de 5 M de parámetros entrenado sin datos públicos de entrenamiento, la calidad de las respuestas puede ser baja y las citas de página pueden ser incorrectas.
- Licencia no disponible: no se especifican términos de uso, lo que impide garantizar su uso comercial o su redistribución legal.
- Sin información de entrenamiento: se desconoce el dataset, el número de tokens y el proceso de alineación, por lo que no se puede evaluar su robustez ni sus sesgos.
- Repositorio sin métricas de adopción: cero descargas y cero valoraciones, lo que indica falta de validación por parte de la comunidad.
- Formato de pesos propietario: al distribuirse como `pytorch_model.bin` sin conversiones a formatos estándar como GGUF o safetensors, su integración en herramientas habituales (Ollama, llama.cpp, vLLM) no está garantizada.
- Fecha de creación futura respecto a la información disponible: el modelo está fechado en septiembre de 2026, lo que puede indicar un error de metadatos o un proyecto muy reciente sin madurez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ystar124/formtgpt
- Model card del autor: https://huggingface.co/Ystar124/formtgpt (sección README)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales asociados al modelo en la información proporcionada.
