# stgallenquants/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje agéntico especializado en programación, desarrollado por Moonshot AI como evolución de Kimi K2.6. Está diseñado para tareas de codificación de largo horizonte, integración con herramientas y flujos de trabajo agénticos completos, mejorando la finalización de tareas de extremo a extremo en ingeniería de software compleja. Según la model card, reduce el uso de tokens de razonamiento en aproximadamente un 30 % respecto a su predecesor, lo que mejora la eficiencia en coste y latencia.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) con 1 billón de parámetros totales y 32 mil millones activos por token, con una ventana de contexto de 256 000 tokens. Es nativamente multimodal, ya que incorpora un codificador de visión (MoonViT) de 400 millones de parámetros, lo que le permite procesar imágenes además de texto. La licencia es modified-mit, que permite uso comercial, y los pesos están disponibles en formato safetensors. El repositorio en HuggingFace (stgallenquants/Kimi-K2.7-Code) es una re-subida del modelo original de Moonshot AI, que también está disponible en moonshotai/Kimi-K2.7-Code.

Este modelo resulta relevante porque combina capacidades de razonamiento agéntico con soporte nativo para herramientas (tool calling) y protocolo MCP (Model Context Protocol), lo que lo posiciona como una opción open source para construir asistentes de programación autónomos, con un rendimiento que compite con modelos propietarios de última generación en benchmarks de codificación y agencia, aunque sin alcanzar sus puntuaciones más altas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención MLA (Multi-head Latent Attention) y codificador de visión MoonViT |
| Parametros totales | 1 026 879 376 368 (aprox. 1 billon) |
| Parametros activos | 32 000 000 000 (32B) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | INT4 nativo (según documentación externa); otros formatos no especificados |
| Idiomas soportados | No disponible |
| Licencia | Modified-MIT (permite uso comercial) |
| Formato de pesos | Safetensors (tamano del repo: 595.2 GB) |

## Arquitectura y entrenamiento

Kimi K2.7 Code utiliza una arquitectura MoE con 384 expertos, de los cuales se seleccionan 8 por token, más 1 experto compartido. El modelo tiene 61 capas (incluyendo una capa densa), una dimensión oculta de atención de 7168 y una dimensión oculta por experto de 2048. La atención emplea el mecanismo MLA (Multi-head Latent Attention), que reduce el uso de memoria KV cache, y la activación es SwiGLU. El vocabulario alcanza 160 000 tokens, lo que facilita la cobertura multilingüe, aunque los idiomas concretos no se han especificado.

El componente de visión utiliza el codificador MoonViT con 400 millones de parámetros, lo que permite al modelo procesar imágenes como entrada adicional al texto. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo se construye sobre Kimi K2.6, con mejoras específicas en tareas de codificación de largo recorrido y en eficiencia de tokens de razonamiento. El uso de cuantización INT4 nativa sugiere un entrenamiento o post-entrenamiento optimizado para inferencia eficiente, aunque no se detalla el proceso.

## Capacidades

- Generación de código y razonamiento sobre código en múltiples lenguajes de programación (se mencionan más de 10 lenguajes en el benchmark interno Kimi Code Bench v2).
- Soporte de tool calling y function calling, lo que permite al modelo invocar funciones externas durante la generación.
- Integración con MCP (Model Context Protocol) para conectar con herramientas y servicios externos, como se refleja en los benchmarks MCP Atlas y MCP Mark Verified.
- Capacidades agénticas: puede ejecutar tareas de múltiples pasos, como resolver issues de repositorios, gestionar incidentes de producción y trabajar en flujos de ingeniería de software completos.
- Modo de razonamiento (thinking mode) activable, que mejora la calidad en tareas complejas a costa de más tokens de salida.
- Entrada multimodal: acepta imágenes además de texto, gracias al codificador MoonViT.
- Contexto largo de 256 000 tokens, adecuado para repositorios de código extensos o conversaciones prolongadas.
- Eficiencia en tokens de razonamiento: aproximadamente un 30 % menos de tokens de pensamiento en comparación con Kimi K2.6.

## Casos de uso

- Asistente de programación autónomo: el modelo puede recibir una descripción de una tarea de desarrollo, explorar un repositorio, modificar archivos y ejecutar comandos de prueba, gracias a su capacidad agéntica y su ventana de 256 000 tokens que permite cargar el contexto completo de un proyecto de tamaño medio.
- Resolución de issues en repositorios open source: con su capacidad de razonamiento de largo horizonte, puede analizar un issue, localizar el código relevante, proponer un parche y verificar que los tests pasan, integrándose con herramientas de CI/CD mediante tool calling.
- Refactorización y migración de código: su soporte multilingüe y su comprensión de arquitecturas complejas permiten automatizar la modernización de bases de código heredadas, como la migración de un monolito a microservicios.
- Generación de documentación técnica: puede procesar el código fuente y generar documentación de API, comentarios y guías de mantenimiento, reduciendo el trabajo manual de los equipos de ingeniería.
- Agente de soporte técnico con acceso a herramientas: combinado con MCP, puede consultar bases de conocimiento, sistemas de ticketing o bases de datos, y responder a consultas de desarrolladores con pasos de depuración concretos.
- Análisis de código con entrada multimodal: al aceptar imágenes, puede analizar capturas de pantalla de errores, diagramas de arquitectura o gráficos de rendimiento junto con el código, facilitando el diagnóstico de problemas complejos.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks comparativos con Kimi K2.6, GPT-5.5 y Claude Opus 4.8. Los tests se realizaron con el modo de razonamiento activado, temperatura 1.0, top-p 0.95 y contexto de 262 144 tokens. GPT-5.5 se ejecutó en Codex con modo xhigh, y Claude Opus 4.8 en Claude Code con modo xhigh.

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50.9 | 62.0 | 69.0 | 67.4 |
| Program Bench | 48.3 | 53.6 | 69.1 | 63.8 |
| MLS Bench Lite | 26.7 | 35.1 | 35.5 | 42.8 |
| Kimi Claw 24/7 Bench | 42.9 | 46.9 | 52.8 | 50.4 |
| MCP Atlas | 69.4 | 76.0 | 79.4 | 81.3 |
| MCP Mark Verified | 72.8 | 81.1 | 92.9 | 76.4 |

Kimi K2.7 Code mejora claramente sobre K2.6 en todos los benchmarks, pero queda por detrás de GPT-5.5 y Claude Opus 4.8 en la mayoría de las pruebas, excepto en MCP Mark Verified donde supera a Claude Opus 4.8 (81.1 frente a 76.4). No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para Kimi K2.7 Code.
- Con 1 billón de parámetros totales y un tamaño de pesos de 595.2 GB en safetensors, el modelo no cabe en una GPU de consumo. Incluso en cuantización INT4, los pesos ocuparían aproximadamente 500 GB, lo que requiere un clúster de GPUs de alta gama.
- Para inferencia con 32B parámetros activos, se estima que se necesitan al menos 8 GPU A100 de 80 GB o 4 GPU H100 de 80 GB solo para los pesos activos, más memoria adicional para el KV cache y las activaciones. En la práctica, se recomienda un nodo con 8 GPU H100 o A100.
- No es viable en GPU de consumo como RTX 4090 o RTX 5090, ni siquiera con cuantización agresiva, debido al tamaño total del modelo.
- Opciones de despliegue: al ser un modelo de transformers con pesos safetensors, se puede servir con vLLM o TGI, siempre que se disponga de suficiente VRAM distribuida. También es posible usar llama.cpp para cuantización GGUF, aunque no se han publicado archivos GGUF oficiales.
- La latencia y el throughput dependerán del hardware y de la configuración de cuantización; no se han publicado cifras oficiales.

## Comparativa con modelos similares

La comparación directa más relevante es con Kimi K2.6, su predecesor, ya que comparte arquitectura y enfoque. Los benchmarks de la model card muestran una mejora consistente de K2.7 Code sobre K2.6, especialmente en tareas de codificación (62.0 frente a 50.9 en Kimi Code Bench v2) y en uso de MCP (81.1 frente a 72.8 en MCP Mark Verified). Además, K2.7 Code reduce el consumo de tokens de razonamiento en un 30 %, lo que lo hace más eficiente en coste operativo.

En cuanto a modelos propietarios, GPT-5.5 y Claude Opus 4.8 superan a K2.7 Code en la mayoría de los benchmarks, pero son cerrados y no permiten despliegue local. No se dispone de datos comparativos con otros modelos open source de la misma categoría, como DeepSeek-V3 o Qwen3-Coder, en la información proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Kimi Code Bench v2 |
|---|---|---|---|---|---|
| Kimi K2.7 Code | 1T | 32B | 256K | Modified-MIT | 62.0 |
| Kimi K2.6 | 1T | 32B | 256K | Modified-MIT | 50.9 |
| GPT-5.5 (propietario) | No disponible | No disponible | No disponible | Comercial cerrada | 69.0 |
| Claude Opus 4.8 (propietario) | No disponible | No disponible | No disponible | Comercial cerrada | 67.4 |

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos, alucinaciones o comportamientos no deseados específicos de Kimi K2.7 Code. Al ser un modelo de gran tamaño entrenado con datos web, es probable que herede sesgos presentes en esos datos, pero no hay documentación oficial al respecto.
- El riesgo de alucinación en tareas de codificación existe, especialmente en contextos largos donde el modelo puede inventar APIs o funciones inexistentes. Se recomienda validar siempre el código generado con pruebas automatizadas.
- La licencia modified-mit permite uso comercial, pero conviene revisar los términos exactos del LICENSE del repositorio original, ya que puede incluir restricciones adicionales (por ejemplo, atribución o limitaciones de uso en ciertos sectores).
- El tamaño del modelo (1T parámetros) implica una infraestructura de hardware considerable, con costes de despliegue elevados. No es adecuado para entornos con recursos limitados.
- Los idiomas soportados no están documentados. Aunque el vocabulario de 160K tokens sugiere soporte multilingüe, no hay confirmación oficial de qué idiomas funcionan mejor.
- La cuantización INT4 nativa puede reducir la precisión en tareas de razonamiento complejo, aunque no se han publicado estudios comparativos de calidad entre INT4 y FP16.
- El modelo está optimizado para tareas de codificación y agencia; su rendimiento en tareas generales de texto (como redacción creativa o traducción) no está evaluado en los benchmarks disponibles.

## Enlaces

- Repositorio en HuggingFace (re-subida): https://huggingface.co/stgallenquants/Kimi-K2.7-Code
- Repositorio original en HuggingFace (Moonshot AI): https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Página de recursos de Kimi K2.7 Code: https://www.kimi.ai/resources/kimi-k2-7-code
- Documentación de la API de Kimi: https://platform.kimi.ai/docs/guide/kimi-k2-7-code-quickstart
- Sitio informativo sobre el modelo: https://kimik2ai.com/k2.7/
- Ficha en Vast.ai (hardware y despliegue): https://vast.ai/model/kimi-k27-code
- Benchmarks y precios: https://benchlm.ai/models/kimi-k2-7-code
