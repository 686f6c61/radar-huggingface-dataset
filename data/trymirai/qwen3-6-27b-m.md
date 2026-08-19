# trymirai/Qwen3.6-27B-M

## Resumen

El modelo `trymirai/Qwen3.6-27B-M` es una cuantización de 4 bits del modelo Qwen3.6-27B, preparada por Mirai Labs específicamente para inferencia local eficiente en Apple silicon. Utiliza una técnica de cuantización entera asimétrica de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamaño de grupo 64, complementada con transformadas de Hadamard aleatorias por bloques para mitigar outliers en activaciones y pesos. El proceso combina post-training quantization con destilación consciente de cuantización, logrando según sus autores un MMLU-Pro dentro de la banda de ruido estocástico del modelo BF16 original.

El modelo base Qwen3.6-27B es un modelo de lenguaje causal de 27B parámetros con encoder de visión, desarrollado por Alibaba Qwen, que destaca en coding agéntico, razonamiento de nivel repositorio y tareas de visión-lenguaje. Su arquitectura híbrida combina Gated DeltaNet (atención lineal) con Gated Attention (atención completa), con contexto nativo de 262.144 tokens extensible hasta aproximadamente 1.010.000 tokens. La versión cuantizada reduce los parámetros efectivos a 14.085.793.792 (~14B) y el tamaño del repositorio a 14,6 GB, manteniendo la licencia Apache 2.0.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de 27B con calidad cercana a la precisión completa en hardware Apple, abriendo la puerta a despliegues locales de agentes de código y razonamiento largo en portátiles. La librería de inferencia es `uzu`, desarrollada por Mirai Labs, y actualmente solo soporta Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention + FFN, con encoder de visión |
| Parametros totales | 14.085.793.792 (checkpoint cuantizado 4-bit); 27B en el modelo original |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta ~1.010.000 tokens |
| Tipos de cuantizacion | 4-bit asimétrico con zero points 4-bit, escalas bfloat16, group size 64 |
| Idiomas soportados | No disponible (el modelo base Qwen3.6 soporta múltiples idiomas, pero no se especifican en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería de inferencia: uzu) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B presenta una arquitectura híbrida innovadora. La capa de lenguaje se organiza en 64 capas con un layout de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque final de Gated Attention seguido de FFN. La Gated DeltaNet utiliza 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention emplea 24 cabezas Q y 4 cabezas KV con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 17408. El modelo incluye un encoder de visión, lo que lo convierte en multimodal (image-text-to-text). El entrenamiento incluye pre-entrenamiento y post-entrenamiento, con MTP (multi-token prediction) entrenado con multi-steps.

El proceso de cuantización de Mirai Labs aplica una técnica de 4 bits asimétrica con zero points de 4 bits, escalas bfloat16 y group size 64. Se utilizan transformadas de Hadamard aleatorias por bloques diagonales (Block-diagonal Random Hadamard Transforms) para reducir outliers en activaciones y pesos. El checkpoint se preparó mediante post-training quantization seguido de destilación consciente de cuantización. Según la model card, en su configuración de evaluación, la puntuación MMLU-Pro está dentro de la banda de ruido estocástico del modelo BF16 de precisión completa.

## Capacidades

- Generación de texto y razonamiento complejo de múltiples pasos, con preservación del contexto de razonamiento histórico.
- Coding agéntico: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio con alta fluidez y precisión.
- Razonamiento STEM mejorado y capacidad de inferencia avanzada.
- Capacidades de visión-lenguaje: inteligencia espacial, localización de objetos, detección, comprensión de video, OCR de documentos y agentes visuales.
- Soporte de tool calling y function calling (heredado del modelo base Qwen3.6).
- Capacidades multilingües (el modelo base soporta múltiples idiomas, aunque la ficha no detalla cuáles).
- Thinking mode / modo de razonamiento (el modelo base Qwen3.6 incluye modos de pensamiento).

## Casos de uso

- Asistente de programación local en macOS: un desarrollador puede ejecutar `mirai --model trymirai/Qwen3.6-27B-M` en su MacBook para obtener ayuda de codificación con contexto de repositorio completo, sin depender de servicios en la nube.
- Agente de automatización de tareas de frontend: gracias a su capacidad de coding agéntico, puede generar y modificar componentes de interfaz de usuario, gestionar flujos de trabajo de desarrollo web y razonar sobre la estructura de un proyecto.
- Análisis de documentos extensos: con su contexto nativo de 262K tokens, puede procesar libros técnicos, manuales o codebases completos en una sola pasada, resumiendo y respondiendo preguntas sobre el contenido.
- Asistente de investigación académica: su capacidad de razonamiento STEM permite resolver problemas matemáticos, explicar conceptos científicos y ayudar en la redacción de artículos técnicos.
- Procesamiento de documentos con visión: al incluir encoder de visión, puede extraer texto de imágenes (OCR), interpretar diagramas y responder sobre contenido visual, útil en entornos de documentación técnica.
- Despliegue de chatbots locales con privacidad: empresas que manejan datos sensibles pueden ejecutar el modelo en hardware Apple sin enviar información a servidores externos, manteniendo la confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la cuantización `trymirai/Qwen3.6-27B-M` en la información disponible. La model card indica únicamente que el MMLU-Pro se encuentra dentro de la banda de ruido estocástico del modelo BF16 completo.

Para el modelo base Qwen3.6-27B, según fuentes web, se reporta un 77,2% en SWE-bench Verified, superando al modelo Qwen3.5-397B-A17B. Sin embargo, no se dispone de una tabla detallada de benchmarks comparativos en la información proporcionada.

## Requisitos de hardware

- Inferencia únicamente en Apple silicon (chips M1, M2, M3, M4 y sucesores). No se soporta GPU NVIDIA o AMD.
- Tamaño del checkpoint: 14,6 GB, por lo que se recomienda un Mac con al menos 16 GB de memoria unificada para una experiencia fluida. Con 32 GB o más se puede aprovechar el contexto largo.
- La instalación se realiza mediante Homebrew: `brew install mirai` y posteriormente `mirai --model trymirai/Qwen3.6-27B-M`.
- Opciones de despliegue: CLI de Mirai (`mirai`), librería `uzu` (se puede compilar desde fuente según la guía de GitHub).
- No se dispone de datos de latencia o throughput específicos para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| trymirai/Qwen3.6-27B-M | 14B (4-bit) | 262K nativo | Apache 2.0 | Safetensors (uzu) | Cuantización de Mirai Labs, solo Apple silicon |
| unsloth/Qwen3.6-27B-GGUF (Q4_K_M) | ~14B (4-bit) | 262K nativo | Apache 2.0 | GGUF | Cuantización GGUF estándar, ejecutable en llama.cpp, Ollama, etc. |
| Qwen3.6-27B (BF16) | 27B | 262K nativo | Apache 2.0 | Safetensors (Transformers) | Modelo original de precisión completa, requiere ~54 GB VRAM |

La cuantización de Mirai se posiciona como comparable en calidad a la Q4_K_M de Unsloth, pero con la ventaja de estar optimizada para Apple silicon mediante la librería `uzu`. La principal limitación es que no es compatible con hardware no-Apple, mientras que el formato GGUF tiene un ecosistema más amplio.

## Limitaciones y advertencias

- Inferencia restringida exclusivamente a Apple silicon. No se puede ejecutar en GPUs NVIDIA, AMD ni en CPUs x86 convencionales.
- La cuantización de 4 bits puede introducir degradaciones en tareas de precisión numérica o razonamiento matemático de alta exactitud, aunque los autores afirman que MMLU-Pro se mantiene dentro del ruido estocástico.
- El modelo base es multimodal, pero no se especifica si la cuantización conserva íntegramente las capacidades de visión. Se recomienda verificar el comportamiento en tareas visuales antes de usarlo en producción.
- No se dispone de información detallada sobre sesgos del modelo ni sobre su comportamiento en idiomas distintos del inglés.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Qwen3.6-27B para confirmar restricciones adicionales (aunque la model card indica que la licencia es Apache 2.0).
- La documentación de la librería `uzu` es limitada y el ecosistema es joven; puede haber menos soporte comunitario que con GGUF o Transformers.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un checkpoint reciente y poco probado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trymirai/Qwen3.6-27B-M
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Guía de uso de la librería uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Documentación de API de Mirai: https://docs.trymirai.com/
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Repositorio oficial Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Blog de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Guía completa de Qwen 3.6-27B: https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía de Qwen 3.6 local: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
