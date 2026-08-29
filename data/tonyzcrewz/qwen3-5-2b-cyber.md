# TonyZCrewz/Qwen3.5-2b-Cyber

## Resumen

Qwen3.5-2b-Cyber es un fine-tune del modelo Qwen3.5-2B de Alibaba, publicado por el usuario TonyZCrewz en HuggingFace en formato GGUF. El modelo base, lanzado en febrero de 2026, es un modelo multimodal denso de aproximadamente 2.000 millones de parámetros con arquitectura híbrida que combina Gated Delta Networks y Gated Attention, pensado para ofrecer un equilibrio entre eficiencia y capacidades avanzadas en un tamaño reducido. El fine-tune "Cyber" ha sido convertido a GGUF mediante la herramienta Unsloth, lo que permite su ejecución en CPU y GPU de consumo con llama.cpp.

La relevancia de este modelo radica en que ofrece una versión compacta y multimodal de la familia Qwen3.5, con soporte nativo de visión (incluyendo comprensión de vídeo) y una ventana de contexto de hasta 262.000 tokens según las especificaciones del modelo base. El repositorio incluye dos archivos: un GGUF cuantizado Q4_K_M para el modelo principal y un proyector multimodal en BF16, lo que indica que conserva las capacidades de visión del modelo original. Sin embargo, la documentación del fine-tune es mínima: no se especifica el dominio de especialización, el dataset de entrenamiento ni la licencia aplicada al modelo resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention (6 bloques con patrón 3×DeltaNet→FFN→1×Attention→FFN) según el modelo base |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (según especificaciones del modelo base; no confirmado para el fine-tune) |
| Tipos de cuantizacion | Q4_K_M (modelo principal), BF16 (proyector multimodal) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para el fine-tune) |
| Licencia | No disponible (el modelo base es Apache 2.0, pero el fine-tune no declara licencia) |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida que intercala capas de Gated Delta Networks (un tipo de red recurrente lineal con actualización de estado basada en compuertas) con capas de atención tradicional, siguiendo un patrón de 6 bloques donde cada bloque contiene tres sub-bloques DeltaNet seguidos de una capa de atención y una FFN. Esta combinación busca reducir el coste computacional de la atención completa manteniendo la capacidad de modelar dependencias de largo alcance. El modelo base fue entrenado con un enfoque de aprendizaje por refuerzo a escala, e incorpora un "modo de pensamiento" (thinking mode) que permite al modelo razonar de forma explícita antes de responder.

El fine-tune "Cyber" fue entrenado y convertido a GGUF utilizando la librería Unsloth, que acelera el fine-tuning y la conversión. No se dispone de información sobre el dataset de fine-tuning, el número de pasos de entrenamiento ni si se emplearon técnicas como RLHF o DPO. La presencia del archivo `BF16-mmproj.gguf` indica que el proyector de visión del modelo base se ha conservado, lo que sugiere que el fine-tune mantiene las capacidades multimodales, aunque no hay confirmación explícita.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-2B, hereda capacidades de generación de texto, razonamiento lógico y matemático, aunque el fine-tune podría haber alterado estas habilidades.
- Modo de pensamiento (thinking mode): el modelo base incluye un modo de razonamiento explícito que permite generar cadenas de pensamiento antes de la respuesta final. No se confirma si el fine-tune lo conserva.
- Visión y comprensión de vídeo: el modelo base es multimodal con entrada de imágenes y vídeo. El archivo mmproj sugiere que el fine-tune mantiene esta capacidad, pero no hay pruebas directas.
- Tool calling y function calling: no documentado para este fine-tune; el modelo base soporta estas capacidades, pero no se garantiza su preservación.
- Multilingüismo: no especificado para el fine-tune; el modelo base soporta múltiples idiomas, incluyendo español, inglés, chino, entre otros.
- Ejecución local eficiente: al estar en formato GGUF cuantizado Q4_K_M, puede ejecutarse en hardware modesto, incluyendo CPU y GPU de consumo.

## Casos de uso

- Inferencia local en entornos con recursos limitados: gracias a su tamaño de 1,88B y cuantización Q4_K_M, el modelo puede ejecutarse en portátiles con 8 GB de RAM o en Raspberry Pi de gama alta, permitiendo prototipado rápido de aplicaciones de IA generativa sin conexión.
- Asistente de documentación técnica: el modelo puede resumir y responder preguntas sobre documentación extensa, aprovechando la ventana de contexto de 262K tokens del modelo base (si se conserva) para procesar manuales completos o repositorios de código.
- Análisis de imágenes en dispositivos edge: si las capacidades de visión se mantienen, el modelo puede clasificar o describir imágenes en aplicaciones de visión por computador embebidas, como inspección de calidad en manufactura o asistencia a personas con discapacidad visual.
- Chat conversacional en aplicaciones de mensajería: su tamaño compacto permite integrarlo en bots de Telegram o Discord que se ejecutan en un servidor doméstico, ofreciendo respuestas contextuales con bajo consumo de recursos.
- Generación de código asistida en entornos de desarrollo: el modelo base tiene capacidades de programación; el fine-tune podría utilizarse para autocompletar o explicar fragmentos de código en editores ligeros, aunque no hay garantía de que el fine-tune haya preservado esta habilidad.
- Experimentación académica con modelos multimodales pequeños: investigadores pueden utilizar este GGUF para estudiar el comportamiento de modelos híbridos DeltaNet-Attention en tareas de visión y lenguaje, sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune Qwen3.5-2b-Cyber en la información disponible. Los datos de rendimiento del modelo base Qwen3.5-2B, según fuentes externas, incluyen una puntuación de 84,5 en OCRBench y 75,6 en VideoMME, pero estos resultados corresponden al modelo original y no al fine-tune, por lo que no pueden atribuirse a esta versión. Se recomienda evaluar el modelo en las tareas objetivo antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa aproximadamente 1,1 GB (estimación para 1,88B parámetros en Q4_K_M), más el proyector BF16 (~0,5 GB). Con overhead de contexto, se recomienda al menos 3 GB de VRAM para GPU, o 6 GB de RAM para ejecución en CPU.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o equivalentes de AMD. También funciona en Apple Silicon con 8 GB unificados.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales, incluyendo las integradas de gama alta.
- Opciones de despliegue: llama.cpp (con `llama-cli` o `llama-mtmd-cli` para multimodal), Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. También puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo recomendado.
- Latencia y throughput: no disponible. En una GPU RTX 4060 se espera una velocidad de generación de 30-50 tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2b-Cyber (este) | 1,88B | 262K (base) | Sí (proyector incluido) | No disponible | GGUF |
| Qwen2.5-1.5B | 1,54B | 32K | No | Apache 2.0 | GGUF, safetensors |
| Llama-3.2-1B | 1,23B | 128K | No | Llama 3.2 | GGUF, safetensors |
| SmolLM2-1.7B | 1,71B | 8K | No | Apache 2.0 | GGUF, safetensors |

El modelo se sitúa en la gama de 1-2B parámetros, donde compite principalmente con Qwen2.5-1.5B y Llama-3.2-1B. Su ventaja potencial es la multimodalidad y el contexto largo heredados del modelo base, aunque la falta de documentación sobre el fine-tune dificulta una comparación justa. La licencia no declarada es un inconveniente para uso comercial.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifica el propósito del fine-tune "Cyber", el dataset utilizado, ni las técnicas de entrenamiento. Esto impide conocer sus fortalezas y debilidades específicas.
- Licencia no declarada: aunque el modelo base es Apache 2.0, el fine-tune no indica licencia, lo que genera incertidumbre legal para uso comercial o redistribución.
- Posible degradación de capacidades: el fine-tune podría haber reducido o alterado las capacidades del modelo base (visión, razonamiento, multilingüismo). No hay evidencia de que conserve todas las funcionalidades originales.
- Riesgo de alucinación: como todos los modelos de 2B, es propenso a generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Sesgos no evaluados: no se han publicado evaluaciones de sesgos de género, raza o idioma para este modelo, por lo que su comportamiento en estos aspectos es desconocido.
- Limitaciones de contexto en la práctica: aunque el modelo base soporta 262K tokens, la cuantización Q4_K_M y la memoria disponible pueden reducir la ventana efectiva en hardware modesto.
- Sin soporte oficial: al ser un modelo de un usuario independiente, no hay garantía de mantenimiento, corrección de errores o actualizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TonyZCrewz/Qwen3.5-2b-Cyber
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Especificaciones y VRAM (apxml.com): https://apxml.com/models/qwen35-2b
- Guía de uso local (localclaw.io): https://localclaw.io/models/qwen3.5-2b
- Ficha en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-2b/
- Herramienta Unsloth: https://github.com/unslothai/unsloth
