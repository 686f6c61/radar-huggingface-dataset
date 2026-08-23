# vincespeed/Ling-3.0-tiny-APEX-GGUF

## Resumen

Ling-3.0-tiny es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por inclusionAI, la división de inteligencia artificial de Ant Group. Forma parte de la serie Ling, diseñada para ofrecer razonamiento y capacidades agénticas a bajo coste de inferencia. El modelo original cuenta con 7.893.392.800 parámetros totales (aproximadamente 7,9 mil millones) pero activa solo 1.300 millones por token, lo que permite un rendimiento eficiente en hardware de consumo. Su arquitectura BailingMoeV3 alterna capas de atención tipo Kimi y soporta un contexto de 131.072 tokens, lo que lo hace adecuado para tareas de razonamiento de largo alcance y agentes conversacionales.

Este repositorio concreto, publicado por vincespeed, ofrece tres perfiles de cuantización en formato GGUF generados con la tecnología Apex-Quant, específicamente diseñada para modelos MoE con precisión mixta. Los perfiles i-quality (5,4 GB), i-balanced (5,6 GB) e i-compact (3,7 GB) permiten desplegar el modelo en entornos locales con distintos equilibrios entre calidad y consumo de recursos. La licencia MIT facilita su uso tanto en investigación como en producción comercial, y su compatibilidad con llama.cpp y Ollama simplifica su integración en aplicaciones existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoeV3ForCausalLM (Mixture-of-Experts) |
| Parametros totales | 7.893.392.800 (7,9 B) |
| Parametros activos | 1,3 B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF: i-quality (5,4 GB), i-balanced (5,6 GB), i-compact (3,7 GB) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF v3 |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny emplea una arquitectura MoE con 128 expertos, de los cuales se activan 8 por token mediante una función de selección Top-K (k=8). Además, los expertos se organizan en 8 grupos, activándose 4 de ellos en cada paso. Cada experto tiene un tamaño de 1,0 B parámetros, lo que explica que, aunque el total es de 7,9 B, la inferencia solo requiera 1,3 B activos. La arquitectura incorpora atención de grupo (GQA) con 16 cabezas de atención y 24 capas, utilizando embeddings rotatorios (RoPE) con una frecuencia base de 6.000.000. El tamaño oculto es de 1.536 y el de feed-forward de 4.608. Además, el modelo alterna capas de atención tipo Kimi, una técnica que combina atención tradicional con mecanismos de compresión de contexto para mejorar la eficiencia en secuencias largas.

Los datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no se han detallado en la información proporcionada. La model card de inclusionAI tampoco aporta detalles sobre el proceso de entrenamiento, por lo que se desconoce si se aplicó alguna etapa de supervisión o refuerzo. La cuantización en este repositorio se realizó con Apex-Quant, un framework de cuantización mixta específico para MoE, que asigna diferentes niveles de precisión a los expertos, al FFN compartido y a la atención para preservar la calidad.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de mantener conversaciones coherentes y resolver tareas de razonamiento lógico y matemático, aunque no se han publicado benchmarks que lo confirmen.
- Razonamiento agente: según la documentación oficial, Ling-3.0-tiny está diseñado para tareas de agente y razonamiento de múltiples pasos, con soporte para planificación y ejecución de acciones.
- Soporte de tool calling: aunque no se menciona explícitamente en la model card, la arquitectura de agente y el entrenamiento orientado a agentes sugieren que es compatible con llamadas a funciones, aunque no hay documentación detallada.
- Capacidades multilingües: no se especifican idiomas, pero por el origen del modelo (Ant Group) es probable que tenga buen rendimiento en chino e inglés, aunque no se puede confirmar.
- Contexto largo: con 131.072 tokens de ventana, puede manejar documentos extensos o historias de conversación muy largas sin perder coherencia.
- Formato GGUF: la versión cuantizada permite ejecución local en CPU y GPU con llama.cpp, Ollama y otras herramientas compatibles.

## Casos de uso

- Asistente de atención al cliente en producción: gracias a su contexto de 131.072 tokens y su arquitectura MoE ligera, puede gestionar conversaciones multi-turno con historial completo en una sola ventana, reduciendo la pérdida de información. La cuantización i-balanced ofrece un equilibrio entre calidad y velocidad para entornos de alta demanda.
- Generación de código asistida en el IDE: con 1,3 B de parámetros activos, el modelo puede integrarse en extensiones de VS Code o JetBrains para autocompletar funciones y explicar fragmentos de código, manteniendo una latencia baja en GPU de consumo como una RTX 4090.
- Agente de automatización de tareas: el soporte de razonamiento agéntico y la posibilidad de tool calling permiten construir agentes que consultan bases de datos, envían correos o ejecutan scripts, todo con el contexto largo para mantener el estado de la tarea.
- Análisis de documentos extensos: con 131k de contexto, se puede alimentar al modelo con contratos, informes o libros completos para extraer resúmenes, identificar cláusulas relevantes o responder preguntas sobre el contenido.
- Chatbot local para pequeñas empresas: el perfil i-compact (3,7 GB) cabe en un equipo con 8 GB de RAM, lo que permite desplegar un chatbot privado en una máquina sin GPU dedicada, usando llama.cpp o Ollama.
- Prototipado rápido de aplicaciones de IA: dado que el modelo es MIT y está disponible en GGUF, los desarrolladores pueden integrarlo en entornos de desarrollo local para probar flujos de conversación antes de pasar a modelos de API comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas estándar para Ling-3.0-tiny, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Perfil i-quality (5,4 GB): requiere al menos 8 GB de VRAM para una inferencia con contexto medio (4k tokens).
  - Perfil i-balanced (5,6 GB): similar al anterior, recomendable 8-12 GB de VRAM.
  - Perfil i-compact (3,7 GB): puede funcionar con 6 GB de VRAM o incluso en CPU con 8 GB de RAM.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070, RTX 4090, o cualquier GPU con al menos 8 GB de VRAM. Para producción con contexto de 131k, se recomienda 16 GB o más.
- Compatibilidad con GPU de consumo: sí, los tres perfiles caben en GPU de gama media (8-12 GB). El perfil i-compact puede ejecutarse incluso en tarjetas con 6 GB.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, vLLM (con soporte GGUF), y cualquier herramienta que lea GGUF v3.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, se estima una velocidad de 20-40 tokens/s con el perfil i-balanced, pero esto es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (MoE ligeros de ~8 B totales). Sin embargo, se puede comparar a nivel estructural con alternativas como:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny (este) | 7,9 B | 1,3 B | 131.072 | MIT | GGUF, safetensors |
| Qwen2.5-1.5B | 1,5 B | 1,5 B (dense) | 32.768 | Apache 2.0 | GGUF, safetensors |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32.768 | Apache 2.0 | GGUF, safetensors |
| Phi-3.5-MoE | 42 B | 6,6 B | 128.000 | MIT | GGUF, safetensors |

Los datos de Mixtral y Phi-3.5-MoE son orientativos y no implican comparación directa de rendimiento. Ling-3.0-tiny se posiciona como un modelo MoE de tamaño reducido con contexto muy largo, pero sin datos públicos de benchmarks que lo comparen con estos alternativas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se ha publicado información sobre sesgos específicos ni tasas de alucinación. Como todo LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: la model card no especifica los idiomas soportados. Aunque es probable que funcione bien en inglés y chino, su rendimiento en español u otros idiomas no está garantizado.
- Riesgo de degradación por cuantización: los perfiles de cuantización (especialmente i-compact con BPW 4.03) pueden reducir la calidad de las respuestas en tareas de razonamiento matemático o código complejo. Se recomienda usar i-quality para producción.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero se debe revisar la licencia del modelo original (también MIT) y la de las dependencias (llama.cpp, Apex-Quant).
- Dependencia de herramientas externas: la cuantización Apex-Quant requiere llama.cpp y el script de quantize.sh del repositorio, que puede no estar disponible para todas las arquitecturas.
- Sin benchmarks verificados: no hay resultados de rendimiento publicados, por lo que no se puede validar su calidad frente a otros modelos en tareas estándar.

## Enlaces

- Repositorio de HuggingFace de la cuantización: https://huggingface.co/vincespeed/Ling-3.0-tiny-APEX-GGUF
- Modelo original en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Framework Apex-Quant: https://github.com/localai-org/apex-quant
- llama.cpp (motor de cuantización e inferencia): https://github.com/ggerganov/llama.cpp
- Documentación oficial de la serie Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Especificación del formato GGUF: https://github.com/ggerganov/ggml/blob/master/docs/gguf.md
