# taurusduan/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-9B-Uncensored-HauhauCS-Aggressive es una variante "uncensored" del modelo Qwen3.5-9B, desarrollada por el usuario de Hugging Face HauhauCS y publicada en este repositorio por taurusduan. El objetivo declarado es eliminar por completo los rechazos del modelo original (0 de 465 refusals) sin degradar las capacidades del modelo base, manteniendo la funcionalidad íntegra que los autores originales de Qwen pretendían. Se trata de una versión "aggressive" que aplica una eliminación de rechazos más exhaustiva que la variante balanced.

El modelo se basa en Qwen3.5-9B, una arquitectura densa de 8.95 mil millones de parámetros con diseño híbrido que combina atención linear Gated DeltaNet con atención softmax completa en proporción 3:1. Soporta un contexto nativo de 262 000 tokens, extensible a 1 millón con YaRN, y es nativamente multimodal (texto, imagen y vídeo). Se distribuye exclusivamente en formato GGUF cuantizado, lo que facilita su despliegue en entornos locales con llama.cpp, LM Studio, Jan o koboldcpp.

La relevancia de este modelo radica en su carácter "sin censura" con pérdida de capacidad cero declarada, lo que lo hace atractivo para casos de uso que requieren respuestas sin restricciones de seguridad, como investigación académica, generación creativa sin límites o análisis de contenido sensible. Sin embargo, esta misma característica implica riesgos importantes que se detallan en la sección de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (linear attention) + softmax attention completa, proporción 3:1, 32 capas |
| Parámetros totales | 8 953 803 264 (8.95B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens nativos, extensible a 1 000 000 con YaRN |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (formato GGUF) |
| Idiomas soportados | Inglés, chino y 199 idiomas más (vocabulario de 248 000 tokens, 201 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, una arquitectura densa de 32 capas que combina atención linear mediante Gated DeltaNet y atención softmax completa en una proporción de 3:1. Este diseño híbrido permite reducir el coste computacional del mecanismo de atención en secuencias largas, manteniendo la calidad de atención plena en las posiciones donde es más crítica. El modelo soporta multi-token prediction (MTP), que acelera la decodificación al predecir varios tokens a la vez, y es nativamente multimodal, aceptando texto, imagen y vídeo mediante un encoder de visión separado (fichero mmproj).

En cuanto al entrenamiento, no se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que es un fine-tune del Qwen3.5-9B original y que "no se han realizado cambios en datasets o capacidades", limitándose a eliminar los rechazos del modelo base. La variante "aggressive" aplica una eliminación más exhaustiva de refusals, aunque el autor advierte que el modelo puede añadir un descargo de responsabilidad corto al final de algunas respuestas, algo heredado del entrenamiento original y que no constituye un rechazo.

## Capacidades

- Generación de texto completa en 201 idiomas, con énfasis en inglés y chino.
- Razonamiento multi-paso con modo "thinking" integrado, que se preserva siempre que el contexto se mantenga en al menos 128 000 tokens.
- Capacidades multimodales: acepta imagen y vídeo como entrada junto al texto (requiere el fichero mmproj del encoder de visión).
- Multi-token prediction (MTP) para acelerar la generación de texto.
- Eliminación completa de rechazos: no rechaza ninguna instrucción, independientemente del contenido.
- Soporte de tool calling y function calling heredado del modelo base Qwen3.5-9B.
- Soporte de agentes y razonamiento multi-paso gracias a su ventana de contexto extensa.
- Modo "thinking" y modo "no-thinking" configurables mediante parámetros de temperatura, top_p y top_k recomendados por los autores de Qwen.

## Casos de uso

- Investigación académica en ética de la IA: el modelo permite estudiar los límites del comportamiento de los LLM sin las barreras de rechazo, ideal para analizar sesgos, alucinaciones y respuestas a prompts conflictivos en entornos controlados.
- Generación de contenido creativo sin restricciones: escritores y guionistas pueden usarlo para producir narrativas con temas adultos o controvertidos que otros modelos rechazan, manteniendo calidad literaria gracias al modelo base Qwen.
- Desarrollo de sistemas de agentes con contexto largo: su ventana de 262 000 tokens permite construir agentes que procesan documentos extensos (manuales, contratos, libros) y razonan sobre ellos en múltiples pasos sin perder el hilo.
- Análisis de documentos multimodales: con el encoder de visión puede procesar imágenes y vídeos junto a texto, útil en entornos de revisión de documentación técnica con capturas de pantalla o diagramas.
- Generación de código con tool calling: soporta function calling para integrarse en pipelines de CI/CD o asistentes de desarrollo que necesitan ejecutar herramientas externas sin restricciones de contenido.
- Investigación de seguridad en IA: los equipos de red team pueden usarlo para probar la robustez de sus sistemas de moderación y detectar vulnerabilidades en sus propias barreras de seguridad.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones Q4_K_M (5.3 GB) y Q6_K (6.9 GB), puede ejecutarse en GPUs de gama media para aplicaciones de chat o análisis de datos sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con el modelo base Qwen3.5-9B o con otras variantes uncensored. Se indica únicamente que la eliminación de rechazos se logra "sin pérdida de capacidad" (lossless), pero este dato no está respaldado por números concretos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 5.3 GB (cuantización Q4_K_M) y 17 GB (BF16), dependiendo del fichero GGUF seleccionado.
- GPU recomendadas: para la cuantización Q4_K_M o Q6_K, una RTX 4060 con 8 GB de VRAM es suficiente; para BF16 se recomienda al menos 20 GB de VRAM, como una RTX 3090, RTX 4090 o A100.
- Capacidad de ejecución en GPU consumer: sí, las cuantizaciones Q4_K_M y Q6_K caben en GPUs de escritorio de 8-12 GB.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp para uso local; vLLM, SGLang o KTransformers para producción de alto rendimiento, según los autores.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Se recomienda mantener al menos 128 000 tokens de contexto para preservar las capacidades de razonamiento, lo que incrementa los requisitos de memoria a medida que se usa contexto largo.
- Nota importante: la arquitectura es nueva (lanzada en marzo de 2026), por lo que se requiere una versión reciente de llama.cpp o del runtime elegido para compatibilidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 8.95B | 240K | Híbrida Gated DeltaNet + softmax | Apache-2.0 | safetensors, GGUF, API |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 8.95B | 240K | Híbrida Gated DeltaNet + softmax | Apache-2.0 | Solo GGUF |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | ~4B | 240K | Híbrida Gated DeltaNet + softmax | Apache-2.0 | Solo GGUF |

No se dispone de información sobre otros modelos uncensored comparables en el mismo rango de tamaño para una comparativa más completa. La diferencia principal con el modelo base es la eliminación de rechazos, mientras que la variante 4B es una versión más pequeña del mismo enfoque.

## Limitaciones y advertencias

- Ausencia de rechazos: el modelo no rechaza instrucciones, lo que puede generar contenido ilegal, dañino o no ético si se usa sin control. No debe desplegarse en aplicaciones públicas sin moderación.
- Riesgo de alucinación: como cualquier modelo de 9B, puede inventar hechos, cifras o referencias. La eliminación de rechazos no mejora la precisión factual.
- Posibles disclaimers residuales: el modelo puede añadir un descargo breve al final de las respuestas (p. ej., "esto es información general, no asesoramiento legal"), lo que podría confundir en algunos contextos.
- Compatibilidad de runtime: la arquitectura es muy reciente (marzo de 2026) y el soporte en llama.cpp aún es incipiente; se requiere compilar con una versión reciente para evitar fallos.
- Requisitos de contexto: para mantener las capacidades de razonamiento (modo thinking), se recomienda un contexto mínimo de 128 000 tokens, lo que aumenta la memoria necesaria.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento más allá de las afirmaciones del autor, lo que dificulta evaluar su calidad real frente al modelo base.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero la naturaleza "uncensored" puede suponer riesgos legales y reputacionales en entornos de producción.
- No hay soporte oficial: el modelo es un fine-tune comunitario, sin garantías de mantenimiento ni actualizaciones de seguridad.

## Enlaces

- Repositorio en Hugging Face (taurusduan): https://huggingface.co/taurusduan/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 4B del mismo autor: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Página de perfil de HauhauCS: https://huggingface.co/HauhauCS
- Comunidad Discord: https://discord.gg/SZ5vacTXYf
- Página en Grokipedia: https://grokipedia.com/page/Qwen35-9B-Uncensored-HauhauCS-Aggressive
- Ficha en Aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-uncensored-leonw24
- Ficha en Ok Tech Masters: https://oktechmasters.org/ai_models/qwen3-5-9b-uncensored-hauhaucs-aggressive/
