# tarruda/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next-GGUF es una cuantización experimental en formato GGUF del modelo Qwen3.8-Flash-Next, desarrollada por tarruda. El modelo base, creado por el equipo de Qwen, es un sistema multimodal (imagen-texto) de 51 200 millones de parámetros que combina una arquitectura híbrida GDN (Gated Delta Network) y QSA (Quadratic Self-Attention) para mejorar la eficiencia computacional y la capacidad de razonamiento. Esta versión cuantizada permite ejecutar el modelo en entornos locales mediante llama.cpp, con la particularidad de que separa la tabla de n-gramas (PLE) del resto de pesos, pudiendo mantenerla en SSD para reducir el uso de RAM.

La relevancia de esta ficha radica en que ofrece una vía para desplegar un modelo de última generación con ventana de contexto nativa de un millón de tokens en hardware de consumo, algo que hasta ahora estaba reservado a despliegues en la nube. La cuantización utiliza técnicas como IQ4_NL, Q8_0 y MTP (multi-token prediction) como modelo draft, y requiere una rama específica de llama.cpp con optimizaciones para Apple silicon. No obstante, se trata de un experimento del autor y los pesos podrían ser retirados en el futuro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GDN + QSA (según documentación del modelo base) |
| Parametros totales | 51 200 245 760 (51,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1 000 000 tokens (nativa, según documentación de QwenCloud) |
| Tipos de cuantizacion | IQ4_NL (pesos principales), Q8_0 (ngram, MTP y mmproj) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina GDN (Gated Delta Network) y QSA (Quadratic Self-Attention), según la documentación oficial del repositorio de Qwen. Esta combinación busca mejorar la capacidad del modelo a la vez que optimiza la eficiencia computacional, la capacidad de almacenamiento y la estabilidad del entrenamiento. No se dispone de detalles adicionales sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información proporcionada.

La cuantización de tarruda introduce una innovación técnica relevante: separa la tabla de n-gramas (PLE) del resto de pesos del modelo, permitiendo cargarla de forma residente en RAM o leerla bajo demanda desde SSD. Además, incorpora un modelo draft MTP (multi-token prediction) cuantizado a Q8_0 para acelerar la decodificación especulativa, y un proyector multimodal (mmproj) también en Q8_0. Todo ello requiere la rama experimental `metal-qwen4exp-split-ngram` de llama.cpp, que añade soporte para Qwen 3.8 Flash Next y optimizaciones específicas para Apple silicon.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de agente y codificación.
- Procesamiento multimodal: entrada de imágenes y texto (pipeline `image-text-to-text`).
- Ventana de contexto nativa de 1 000 000 de tokens, capaz de procesar documentos extensos, codebases completas y conversaciones largas en una sola pasada.
- Soporte de decodificación especulativa mediante MTP (multi-token prediction) para mejorar la velocidad de generación.
- Capacidad de ejecución local con cuantización GGUF, incluyendo la opción de mantener la tabla de n-gramas en SSD para reducir el uso de memoria.
- Optimizaciones específicas para Apple silicon en la rama experimental de llama.cpp.

## Casos de uso

- Análisis de repositorios de código completos: gracias a su contexto de 1M de tokens, el modelo puede ingerir un repositorio entero y responder preguntas sobre arquitectura, bugs o refactorizaciones sin necesidad de dividir el código en fragmentos.
- Asistente de programación con generación de código y tool calling: el modelo puede integrarse en entornos de desarrollo o pipelines de CI/CD para generar código, revisar pull requests o autocompletar funciones, apoyándose en su capacidad de razonamiento agéntico.
- Procesamiento de documentos legales o académicos extensos: permite resumir, extraer información y responder preguntas sobre contratos, tesis o informes de cientos de páginas en una sola consulta.
- Agentes autónomos para automatización de tareas: su capacidad de razonamiento multi-paso y soporte de herramientas lo hace adecuado para orquestar flujos de trabajo que requieren planificación y ejecución de acciones.
- Análisis de imágenes con contexto textual amplio: al ser multimodal, puede combinar la comprensión de imágenes con un contexto textual largo, por ejemplo para revisar documentación técnica ilustrada o analizar capturas de pantalla junto con logs de error.
- Despliegue local en entornos con recursos limitados: la cuantización GGUF y la opción de mantener la tabla de n-gramas en SSD permiten ejecutar el modelo en estaciones de trabajo con VRAM moderada, evitando la dependencia de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada en la información disponible. La documentación del modelo base (Qwen3.8-Flash-Next) indica que supera a Claude-4.6-Opus en tareas de agentic coding, visión y chat, según la web de unsloth, pero no se proporcionan cifras concretas ni comparativas con otras cuantizaciones. Se recomienda consultar el repositorio oficial de Qwen para obtener datos de evaluación del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización IQ4_NL (4 bits), el modelo de 51,2 B parámetros requiere aproximadamente 26-30 GB de VRAM solo para los pesos, más overhead de contexto y activaciones. Para una ventana de 1M de tokens se necesitaría memoria adicional considerable (posiblemente más de 64 GB en total).
- GPU recomendadas: para ejecución local con contexto completo se requieren GPUs profesionales como A100 80 GB, H100 80 GB o múltiples RTX 4090 (24 GB cada una) en configuración multi-GPU. Con contextos reducidos (p. ej., 32K tokens) podría caber en una RTX 4090 con cuantización agresiva.
- Compatibilidad con Apple silicon: la rama experimental de llama.cpp incluye optimizaciones para chips M-series, permitiendo ejecutar el modelo en Mac con memoria unificada (por ejemplo, M2 Ultra con 128 GB).
- Opciones de despliegue: llama.cpp (rama experimental), llama-server con soporte para split ngram, y potencialmente otras herramientas compatibles con GGUF una vez que se integre el soporte.
- Latencia y throughput: no se proporcionan datos medidos. La decodificación especulativa con MTP debería mejorar el throughput respecto a generación autoregresiva estándar, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo base compite con sistemas como Claude-4.6-Opus (según la documentación de unsloth), pero no hay datos de benchmarks comparables para la versión cuantizada. Se recomienda consultar las evaluaciones oficiales del modelo Qwen3.8-Flash-Next en el repositorio de Qwen para obtener referencias.

## Limitaciones y advertencias

- Se trata de una cuantización experimental: el propio autor indica que los pesos podrían ser eliminados en el futuro y que llama.cpp probablemente no incorporará soporte para split ngram en GGUF.
- Requiere una rama específica de llama.cpp (`metal-qwen4exp-split-ngram`) que no está disponible en los lanzamientos oficiales, lo que limita su uso en entornos de producción estandarizados.
- La cuantización introduce pérdida de precisión respecto al modelo original en punto flotante, especialmente en tareas de razonamiento matemático o lógico complejo.
- La licencia `qwen-community-1.0` puede imponer restricciones de uso comercial; es necesario revisar los términos completos antes de desplegar el modelo en aplicaciones de pago.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez para esta versión cuantizada. El modelo base, al ser multimodal y de gran tamaño, podría presentar sesgos en la generación de contenido sensible.
- La gestión de la tabla de n-gramas en SSD (modo `read`) puede incrementar la latencia de generación, ya que requiere lecturas de disco bajo demanda.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/tarruda/Qwen3.8-Flash-Next-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Rama experimental de llama.cpp con soporte para split ngram: https://github.com/tarruda/llama.cpp/tree/metal-qwen4exp-split-ngram
- Guía de unsloth para ejecutar el modelo localmente: https://unsloth.ai/docs/models/qwen3.8-next
- Cuantización GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Documentación de QwenCloud sobre Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
