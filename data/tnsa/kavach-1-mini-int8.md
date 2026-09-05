# TNSA/Kavach-1-Mini-INT8

## Resumen

Kavach-1-Mini-INT8 es un modelo de lenguaje compacto (752.393.024 parámetros) especializado en seguridad ofensiva y razonamiento para red team. Desarrollado por TNSA, se obtiene mediante ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen/Qwen3.5-0.8B. Este build concreto está cuantizado en INT8 (W8A8 dinámico) usando el formato compressed-tensors, lo que reduce el peso del modelo a unos 1.2 GB en disco manteniendo una precisión razonable para tareas de análisis y generación de texto relacionadas con ciberseguridad.

La relevancia actual del modelo radica en su doble utilidad: por un lado, puede asistir a profesionales de seguridad autorizados en ejercicios de pentesting y análisis de vulnerabilidades; por otro, su tamaño reducido permite ejecutarlo en entornos locales, laboratorios y herramientas integradas sin necesidad de infraestructura de GPU costosa. Con una ventana de contexto de 4.096 tokens, soporta conversaciones y razonamiento de múltiples pasos en inglés, y está publicado bajo licencia MIT, lo que facilita su adopción en proyectos de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | INT8 (W8A8 dinámico, compressed-tensors); disponibles builds BF16, FP8, INT4, NVFP4, MXFP4 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | MIT |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

Kavach-1-Mini-INT8 es un modelo de tipo transformer denso con arquitectura derivada de Qwen3.5-0.8B. El proceso de entrenamiento consistió en un ajuste fino supervisado (SFT) de parámetros completos, sin utilizar métodos de aprendizaje por refuerzo (RLHF o DPO) según la información disponible. El dataset de entrenamiento no se especifica en la model card, pero se infiere que incluye datos de seguridad ofensiva, ejercicios de red team, análisis de vulnerabilidades y respuestas de asistencia técnica. Tras el SFT, el modelo se cuantizó a INT8 con precisión W8A8 dinámica mediante la librería llm-compressor y el formato compressed-tensors. Esta cuantización reduce el tamaño de los pesos frente a la versión BF16, a costa de una ligera pérdida de fidelidad.

La familia Kavach-1-Mini incluye otras precisiones publicadas en repositorios separados, como BF16, FP8, INT4, NVFP4 y MXFP4, además de una línea anterior basada en LoRA. El modelo se distribuye como checkpoint de compressed-tensors y es compatible con vLLM y transformers (requiriendo el paquete compressed-tensors instalado).

## Capacidades

- Generación de texto instruccional en inglés, orientada a seguridad informática y análisis técnico.
- Razonamiento sobre vulnerabilidades en código y endpoints, con capacidad para revisar fragmentos de código y sugerir posibles fallos.
- Asistencia en análisis de seguridad ofensiva: identificación de vectores de ataque, revisión de configuraciones y propuesta de payloads (siempre dentro de un marco autorizado).
- Soporte para conversaciones multi-turno mediante plantillas de chat (system, user, assistant), integrable en aplicaciones de mensajería y herramientas de laboratorio.
- Compatible con pipelines de generación de texto de Hugging Face transformers y vLLM, facilitando su integración en frameworks de agentes y automatización.
- Capacidades multilingües limitadas: el modelo está entrenado principalmente en inglés, sin indicación de soporte para otros idiomas.
- No se indica soporte para tool calling, vision ni audio en la información disponible.

## Casos de uso

- Revisión de seguridad de código: los desarrolladores pueden enviar fragmentos de código (por ejemplo, endpoints de autenticación en Flask) al modelo para obtener una primera evaluación de posibles vulnerabilidades, como inyecciones SQL, fallos de autenticación o exposición de datos.
- Ejercicios de red team autorizados: durante un engagement de pentesting, el modelo puede utilizarse como asistente para generar comandos de prueba, estructurar ataques simulados y razonar sobre rutas de escalada de privilegios, siempre y cuando el usuario tenga permiso explícito sobre los sistemas.
- Formación en ciberseguridad ofensiva: sirve como herramienta educativa para estudiantes y analistas que aprenden técnicas de descubrimiento de vulnerabilidades, gracias a su capacidad para explicar conceptos de ataque y defensa de manera conversacional.
- Elaboración de informes técnicos: puede redactar borradores de secciones de informes de penetración, describiendo hallazgos, impacto potencial y recomendaciones de mitigación, que luego el profesional debe verificar.
- Soporte en operaciones de blue team: al comprender las tácticas de ataque, puede ayudar a los defensores a identificar patrones de tráfico malicioso o configuraciones inseguras en sistemas que ellos administran.
- Integración en pipelines de análisis automatizado: gracias a su tamaño reducido y compatibilidad con vLLM, puede desplegarse como un servicio de análisis de seguridad para procesar lotes de código o logs y marcar posibles áreas de riesgo, complementando herramientas estáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 ocupan aproximadamente 0.75 GB (752M × 1 byte), más el overhead de activaciones y caché KV para una ventana de 4.096 tokens. En batch de 1, se estima un consumo total entre 1.5 y 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA T4, A10G, RTX 4060, RTX 4090 o A100/H100 (con holgura).
- Compatible con GPUs de consumo: sí, por ejemplo una RTX 3060 de 12 GB puede ejecutarlo sin problemas, incluso con una cuantización más agresiva si se requiere.
- Opciones de despliegue: vLLM (recomendado por la model card), Hugging Face transformers con el paquete compressed-tensors instalado, y posiblemente TGI (no se menciona explícitamente). No se indican pesos GGUF oficiales, por lo que llama.cpp requeriría una conversión manual.
- Latencia y throughput estimados: para un modelo de ~0.8B en una GPU moderna, la generación es lo suficientemente rápida para uso interactivo, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Kavach-1-Mini-INT8 | 752.393.024 | 4.096 | MIT | Seguridad ofensiva / red team |
| Kavach-1-Mini-BF16 | ~800M (estimado) | 4.096 | MIT | Seguridad ofensiva / red team |
| Qwen3.5-0.8B | ~800M (indicado) | 4.096 | No especificada (cada base model tiene su propia licencia) | General |

La comparación se basa en las variantes de la misma familia y el modelo base. No se disponen de datos de benchmarks que permitan comparar el rendimiento real entre ellos.

## Limitaciones y advertencias

- El modelo tiene ~0.8B de parámetros: es rápido y ligero, pero menos fiable que modelos de mayor tamaño. Todas las salidas (comandos, payloads, afirmaciones técnicas) deben verificarse antes de usarse.
- Riesgo de alucinación: puede producir detalles técnicos plausibles pero incorrectos. Tratar la salida como un punto de partida, no como fuente autorizada.
- Limitaciones de contexto e idioma: ventana de 4.096 tokens y soporte solo en inglés, sin capacidades multimodales (visión o audio).
- La cuantización INT8 puede degradar ligeramente la calidad de las respuestas en comparación con la versión BF16, aunque reduce el uso de memoria.
- Es un modelo de doble uso: puede generar contenido dañino si se usa maliciosamente. Debe utilizarse únicamente en sistemas propios o con autorización explícita, cumpliendo todas las leyes y normas aplicables.
- La licencia MIT se aplica a los pesos ajustados, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe revisarse antes de redistribuir derivados.
- No se han publicado resultados de seguridad interna ni evaluaciones de sesgo, por lo que no se puede confirmar la ausencia de sesgos o comportamientos indeseados.

## Enlaces

- HuggingFace: https://huggingface.co/TNSA/Kavach-1-Mini-INT8
- No se encontraron otros enlaces relevantes en la búsqueda web (los resultados estaban relacionados con temas no vinculados al modelo).
