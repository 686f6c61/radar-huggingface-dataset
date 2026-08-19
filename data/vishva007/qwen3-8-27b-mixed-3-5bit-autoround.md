# Vishva007/Qwen3.8-27B-Mixed-3.5bit-AutoRound

## Resumen

Este repositorio contiene una versión cuantizada del modelo multimodal Qwen3.8-27B de Alibaba, preparada por Vishva007 mediante Intel AutoRound con su motor de escalado dinámico AutoScheme. El resultado es un modelo de precisión mixta sub-4-bit, con un promedio de aproximadamente 3,5 bits por peso y activaciones en 16 bits, que reduce la memoria de pesos de los ~54 GB originales en BF16 a unos 13-15 GB. Esto permite ejecutar un VLM de 27 000 millones de parámetros en GPUs de consumo con 16 GB de VRAM, algo inviable con el modelo original.

La relevancia de esta cuantización radica en que Qwen3.8-27B es un modelo de última generación con capacidades de visión, razonamiento y agente, con una ventana de contexto de 256K tokens. Al mantener la torre de visión en BF16 nativo y las capas de predicción multi-token (MTP) en bfloat16, se preserva la calidad en tareas visuales y de generación, mientras que las capas transformer más robustas se comprimen a 3 y 2 bits. El modelo se distribuye bajo licencia Apache 2.0 y está empaquetado con llm-compressor, compatible con el ecosistema Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (según Unsloth; otras fuentes citan 262K) |
| Tipos de cuantizacion | Mixta W4A16, W3A16 y W2A16, promedio ~3,5 bits, group size 64, simétrica |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifica para esta versión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje, diseñado para tareas de imagen-texto a texto. Esta versión cuantizada no ha sido reentrenada; se ha obtenido mediante cuantización post-entrenamiento con Intel AutoRound y su motor AutoScheme. AutoScheme analiza la sensibilidad de cada capa durante la calibración y asigna dinámicamente precisiones de 4, 3 o 2 bits por capa, manteniendo las capas más sensibles (atención y proyecciones) en 4 bits y comprimiendo las más robustas a 3 o 2 bits, para alcanzar un promedio objetivo de 3,5 bits por peso.

La calibración se realizó con 512 muestras, 600 iteraciones de ajuste y una longitud de secuencia de 2048 tokens. La torre de visión se mantiene íntegramente en BF16 (quant_nontext_module=False) para evitar degradación en comprensión visual, OCR y razonamiento espacial. Las capas de predicción multi-token (mtp y mtp.fc) también se conservan en bfloat16 nativo. El empaquetado final se hizo con llm-compressor, lo que garantiza compatibilidad con vLLM y SGLang.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto, responde preguntas visuales, describe contenido y razona sobre escenas.
- Comprensión visual avanzada: OCR, reconocimiento de objetos, razonamiento espacial y análisis de diagramas, gracias a la torre de visión en BF16 sin ruido de cuantización.
- Razonamiento multi-paso y modo thinking: hereda las capacidades de razonamiento del modelo Qwen3.8, incluyendo modos de pensamiento explícito.
- Soporte de agentes y tool calling: el modelo base Qwen3.8 está diseñado para uso agéntico, con integración de herramientas y ejecución de acciones.
- Generación de código: capacidades de programación y depuración, útiles en entornos de desarrollo asistido.
- Multilingüismo: aunque no se detalla para esta versión, el modelo base Qwen3.8 soporta múltiples idiomas; se recomienda verificar en la documentación oficial.
- Contexto largo: ventana de 256K tokens, adecuada para documentos extensos, conversaciones largas o análisis de múltiples imágenes.

## Casos de uso

- Asistente de atención al cliente con visión: el modelo puede procesar capturas de pantalla, facturas o fotos de productos enviadas por usuarios, y mantener conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens, todo ello en una GPU de 16 GB.
- Análisis de documentos técnicos: con su capacidad OCR y de razonamiento, puede extraer información de manuales, esquemas o diagramas, y responder preguntas sobre ellos en tiempo real.
- Generación de código asistida por imagen: un desarrollador puede subir un mockup o diagrama de arquitectura y el modelo genera el código correspondiente, aprovechando su soporte de tool calling para integrarse en IDEs.
- Despliegue en edge computing: al ocupar solo 13-15 GB de VRAM, puede ejecutarse en estaciones de trabajo con RTX 4080 o 4090, permitiendo inferencia local sin conexión a la nube.
- Prototipado rápido de aplicaciones multimodales: investigadores y startups pueden validar ideas de productos de visión-lenguaje sin necesidad de clusters de GPUs, usando transformers con AutoRound.
- Automatización de procesos con agentes: el modelo puede actuar como agente que recibe instrucciones visuales (por ejemplo, capturas de pantalla de una interfaz) y ejecuta acciones mediante tool calling, ideal para pruebas de software o automatización de tareas repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (MMLU, HumanEval, GSM8K, etc.) ni comparativas cuantitativas con el modelo original o con otras cuantizaciones. Se recomienda evaluar el modelo en el caso de uso específico antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13-15 GB para los pesos del modelo en esta cuantización mixta de 3,5 bits. A esto hay que sumar la memoria para la caché KV, que depende de la longitud de contexto y del tamaño de lote.
- GPU recomendadas: RTX 4080 (16 GB) para contextos moderados; RTX 3090 o RTX 4090 (24 GB) para contextos largos o procesamiento por lotes de múltiples imágenes. También es viable en A5000 o A6000.
- Compatibilidad con GPUs de consumo: sí, es el objetivo principal de esta cuantización. Una RTX 4060 Ti de 16 GB podría funcionar con contextos reducidos, pero no está garantizado.
- Opciones de despliegue: transformers con el backend de AutoRound (cargando con AutoModelForImageTextToText), vLLM y SGLang (gracias al empaquetado con llm-compressor), y Unsloth (que ofrece GGUF y NVFP4 para este modelo).
- Latencia y throughput: no disponibles. Dependen de la GPU, la longitud de secuencia y el backend utilizado. Se espera que sea inferior al modelo BF16 original debido al menor ancho de banda de memoria requerido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM pesos | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16 original) | 27B | 256K | BF16 | ~54 GB | Apache 2.0 |
| Qwen3.8-27B (W4A16 estándar) | 27B | 256K | 4 bits uniforme | ~16-18 GB | Apache 2.0 |
| Este modelo (mixto 3,5 bits) | 27B | 256K | Mixta 2-4 bits | ~13-15 GB | Apache 2.0 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros VLM de tamaño similar con cuantizaciones equivalentes. Frente a la versión W4A16, esta ofrece una reducción de VRAM de aproximadamente un 12,5 %, a costa de una posible pérdida de precisión en capas comprimidas a 2-3 bits, aunque AutoScheme intenta mitigarlo manteniendo las capas críticas en 4 bits.

## Limitaciones y advertencias

- La cuantización agresiva a 2-3 bits en capas robustas puede degradar la calidad en tareas que dependen de matices lingüísticos o razonamiento complejo; no hay benchmarks publicados que cuantifiquen esta pérdida.
- La torre de visión se mantiene en BF16, lo que aumenta ligeramente el uso de VRAM en comparación con una cuantización completa, pero preserva la calidad visual.
- El modelo es muy reciente (agosto de 2026) y tiene pocas descargas (28) y sin valoraciones; su estabilidad en producción no está probada.
- No se especifican los idiomas soportados en esta versión; aunque el modelo base es multilingüe, se recomienda verificar el comportamiento en el idioma objetivo.
- La licencia Apache 2.0 permite uso comercial, pero es necesario cumplir con los términos del modelo base Qwen3.8-27B, que también es Apache 2.0.
- Para cargar el modelo con transformers es necesario instalar auto-round y tener una versión reciente de transformers que soporte AutoModelForImageTextToText.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/Qwen3.8-27B-Mixed-3.5bit-AutoRound
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Intel AutoRound: https://github.com/intel/auto-round
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo de Yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guía de despliegue local de Qwen3.8-27B: https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
