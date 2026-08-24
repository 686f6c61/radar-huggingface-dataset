# SwinliQ-AI-2/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal nativo desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz de la familia open-source de Qwen hasta la fecha. Construido sobre la base arquitectónica de Qwen3.5, incorpora un codificador de visión que le permite comprender imágenes y vídeos, además de texto, con un control flexible del modo de razonamiento (thinking mode). Este modelo destaca en tareas de programación, trabajo profesional, investigación y ejecución de agentes de larga duración, con una ventana de contexto nativa de 262 144 tokens extensible hasta 1 000 000.

La versión GGUF aquí descrita, publicada por el usuario SwinliQ-AI-2, es una cuantización del modelo original Qwen/Qwen3.8-27B realizada con la herramienta Unsloth Dynamic 3.0, que según sus autores ofrece una precisión superior a otras cuantizaciones al mismo tamaño. Con 27 320 697 856 parámetros (27B), este modelo está diseñado para ejecutarse en hardware de consumo y entornos de producción con requisitos moderados de VRAM, manteniendo capacidades de nivel frontera en razonamiento, código y multimodalidad. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas en la ficha; repo de 1053.7 GB) |
| Idiomas soportados | No disponible (se asume multilingue, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura de modelo de lenguaje causal con un codificador de visión integrado, lo que lo convierte en un modelo multimodal nativo. La estructura interna del transformador sigue un patrón de capas ocultas definido como 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, 64 capas en total. La capa de atención lineal (Gated DeltaNet) utiliza 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la capa de atención con puerta (Gated Attention) emplea 24 cabezas para Q y 4 para KV con dimensión 256 y embeddings rotatorios de 64 dimensiones. La dimensión oculta es de 5120 y la FFN tiene una dimensión intermedia de 17 408. El modelo incorpora además Multi-Token Prediction (MTP), entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento se realizó en dos etapas: pre-training y post-training, siguiendo la línea de las generaciones anteriores Qwen3.5 y Qwen3.6. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF fue generada con Unsloth Dynamic 3.0, que según sus desarrolladores logra una precisión superior al 10 % en comparación con otras herramientas de cuantización al mismo tamaño, gracias a un proceso de calibración optimizado.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Comprensión de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Razonamiento multi-paso y planificación autónoma para tareas de agente de larga duración, con manejo de feedback del entorno.
- Soporte de tool calling y function calling, con mejoras en el parseo de objetos anidados para aumentar la tasa de éxito.
- Control fino del razonamiento mediante parámetros como `reasoning_effort` y `preserve_thinking` para retener contexto de razonamiento histórico.
- Capacidades multilingües (no especificadas oficialmente, pero se asume cobertura amplia por la familia Qwen).
- Compatibilidad con frameworks de desarrollo y harnesses populares, facilitando la integración en stacks existentes.

## Casos de uso

- Automatización de oficina: el modelo puede procesar documentos, extraer información de tablas e imágenes, y generar informes estructurados, gracias a su capacidad de visión y su contexto de 262K tokens que permite manejar documentos extensos completos.
- Asistente de programación en producción: con soporte de tool calling y generación de código, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y autocompletado en entornos de desarrollo.
- Agentes autónomos de larga duración: su capacidad de planificación multi-paso y manejo de feedback del entorno lo hace adecuado para tareas como navegación web automatizada, gestión de tickets o investigación de mercado con múltiples iteraciones.
- Análisis de vídeo y contenido multimedia: al comprender vídeos de hasta una hora, puede resumir reuniones grabadas, extraer eventos clave o generar subtítulos descriptivos en tiempo real.
- Atención al cliente con contexto largo: la ventana de 262K tokens permite mantener conversaciones multi-turno con historial extenso, incluyendo documentos adjuntos o capturas de pantalla, mejorando la coherencia y personalización.
- Investigación y análisis académico: puede leer artículos científicos con figuras y tablas, razonar sobre resultados experimentales y redactar resúmenes o hipótesis, gracias a su comprensión de diagramas STEM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluación comparativa (MMLU, HumanEval, GSM8K, etc.) y los resultados de búsqueda web no proporcionan cifras concretas. Se recomienda consultar el repositorio oficial de Qwen para datos de rendimiento actualizados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero para un modelo de 27B en cuantización GGUF se estima entre 14 GB (Q4_K_M) y 28 GB (Q8_0) para el modelo completo, más overhead de contexto.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para cuantizaciones de 4-5 bits, A100 40/80 GB o H100 para cuantizaciones mayores y contexto extendido.
- En consumer GPU: sí, cabe en GPUs de 24 GB como RTX 4090 o RTX 3090 con cuantización Q4, aunque el contexto largo (262K) requerirá gestión de memoria o uso de cuantizaciones más agresivas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI, y Unsloth Desktop para ejecución local con toggles de thinking.
- Latencia y throughput: no disponible; dependerá de la GPU, cuantización y longitud de contexto. Se espera un rendimiento competitivo para un modelo de 27B gracias a la atención lineal (Gated DeltaNet) que reduce el coste computacional en contextos largos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Como referencia, el modelo compite con otros LLMs densos de ~27B como Llama 3.1 8B (inferior en capacidad) o Mistral Large 2 (123B, mucho mayor), pero no hay benchmarks directos disponibles. Se recomienda consultar el repositorio oficial de Qwen para comparaciones con modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero como modelo entrenado con datos web, puede heredar sesgos sociales y culturales.
- Riesgo de alucinación: presente en todos los LLM; se recomienda verificación de hechos en aplicaciones críticas.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, el uso de la extensión a 1M tokens puede degradar la calidad de la atención y requerir hardware de alta gama.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribución.
- Caveat de producción: la cuantización GGUF puede introducir pérdida de precisión en tareas de razonamiento complejo; se recomienda probar con cuantizaciones más altas (Q8_0) para tareas críticas.
- El modelo es multimodal, pero la versión GGUF puede requerir el codificador de visión en formato separado; verificar la compatibilidad con el framework de despliegue.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/SwinliQ-AI-2/Qwen3.8-27B-GGUF
- Repositorio HuggingFace de la cuantización oficial de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de Unsloth para ejecutar Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Documentación de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Guía de ejecución local (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía de ejecución local (linas.substack.com): https://linas.substack.com/p/qwen3-8-27b-local-guide
