# trinityomni/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje multimodal de código abierto desarrollado por Moonshot AI, centrado en tareas de programación agéntica. Está construido sobre Kimi K2.6 e introduce mejoras sustanciales en tareas de codificación de largo horizonte, reduciendo el uso de tokens de razonamiento en aproximadamente un 30 % respecto a su predecesor. Con una arquitectura de Mixture-of-Experts (MoE) de 1 billón de parámetros totales y 32 000 millones de parámetros activos, ofrece una ventana de contexto de 256 000 tokens, lo que lo hace adecuado para trabajar con repositorios completos y flujos de trabajo complejos.

El modelo integra un codificador visual MoonViT de 400 millones de parámetros, lo que le permite procesar entradas de imagen y texto. Su relevancia actual radica en que aborda la necesidad de modelos capaces de ejecutar tareas de software de principio a fin, con soporte para herramientas y razonamiento multi-paso, en un entorno de código abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parámetros totales | 1 026 879 376 368 (aprox. 1T) |
| Parámetros activos | 32B |
| Longitud de contexto | 256K (262 144 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | modified-mit |
| Formato de pesos | safetensors |

| Parámetro adicional | Valor |
|---|---|
| Capas totales | 61 (incluye 1 capa densa) |
| Capas densas | 1 |
| Dimensión de atención | 7168 |
| Dimensión MoE por experto | 2048 |
| Cabezas de atención | 64 |
| Número de expertos | 384 |
| Expertos seleccionados por token | 8 |
| Expertos compartidos | 1 |
| Tamaño de vocabulario | 160K |
| Mecanismo de atención | MLA (Multi-head Latent Attention) |
| Función de activación | SwiGLU |
| Codificador visual | MoonViT (400M parámetros) |

## Arquitectura y entrenamiento

Kimi K2.7 Code emplea una arquitectura de Mixture-of-Experts (MoE) con 384 expertos, de los cuales se seleccionan 8 por token, más un experto compartido. La capa de atención utiliza Multi-head Latent Attention (MLA), mientras que la función de activación es SwiGLU. El modelo cuenta con 61 capas en total, de las cuales una es densa. La dimensión de atención es de 7168 y la dimensión de cada experto es de 2048. El vocabulario tiene 160 000 entradas. Además, incorpora un codificador visual MoonViT de 400 millones de parámetros, lo que permite el procesamiento de imágenes junto con texto.

En cuanto al entrenamiento, la información disponible no especifica el número de tokens ni la composición del dataset. El modelo se presenta como una mejora sobre Kimi K2.6, con un enfoque en tareas de codificación de largo horizonte y una reducción del 30 % en el uso de tokens de razonamiento. No se menciona si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación, con benchmarks que cubren más de 10 lenguajes mainstream.
- Razonamiento agéntico de largo horizonte, capaz de completar tareas complejas de software de principio a fin.
- Soporte de tool calling y function calling, incluyendo integración con MCP (Model Context Protocol) para uso de herramientas externas.
- Soporte de agentes y razonamiento multi-paso, con capacidad de planificar y ejecutar secuencias de acciones.
- Capacidades multimodales: procesamiento de imágenes mediante MoonViT, lo que permite entender diagramas, capturas de pantalla o interfaces.
- Modo de pensamiento (thinking mode) activable, con una eficiencia mejorada en el uso de tokens de razonamiento.
- Capacidades multilingües: no disponibles según la información proporcionada.

## Casos de uso

- Desarrollo de software end-to-end: el modelo puede gestionar tareas de programación completas en repositorios reales, desde la implementación de nuevas funcionalidades hasta la corrección de errores, gracias a su ventana de contexto de 256K tokens y su razonamiento agéntico de largo horizonte.
- Resolución de incidencias en producción: al integrarse con herramientas de observabilidad y repositorios, el modelo puede analizar logs, trazas y código para diagnosticar y proponer parches, aprovechando su capacidad de tool calling.
- Refactorización de código legacy: su contexto largo permite cargar múltiples archivos y dependencias, facilitando la identificación de patrones obsoletos y la generación de código refactorizado.
- Generación de pruebas automatizadas: el modelo puede crear suites de tests unitarios y de integración a partir de la especificación del código, con soporte para múltiples lenguajes.
- Agente autónomo en pipelines CI/CD: puede integrarse en flujos de integración continua para revisar pull requests, sugerir cambios y ejecutar tareas de mantenimiento, gracias a su capacidad de usar herramientas MCP.
- Asistente de programación en IDE: con soporte de visión, puede interpretar capturas de pantalla de interfaces o diagramas de arquitectura y convertirlos en código, mientras mantiene el contexto del proyecto.
- Análisis de repositorios multilingües: su capacidad de manejar 10+ lenguajes y un contexto amplio permite analizar proyectos que combinan varios lenguajes y frameworks.
- Automatización de documentación técnica: el modelo puede generar documentación a partir del código fuente, incluyendo diagramas y explicaciones de arquitectura.

## Benchmarks y rendimiento

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50.9 | 62.0 | 69.0 | 67.4 |
| Program Bench | 48.3 | 53.6 | 69.1 | 63.8 |
| MLS Bench Lite | 26.7 | 35.1 | 35.5 | 42.8 |
| Kimi Claw 24/7 Bench | 42.9 | 46.9 | 52.8 | 50.4 |
| MCP Atlas | 69.4 | 76.0 | 79.4 | 81.3 |
| MCP Mark Verified | 72.8 | 81.1 | 92.9 | 76.4 |

Los resultados de Kimi K2.7 Code y Kimi K2.6 se obtuvieron con el modo de pensamiento activado, temperatura 1.0, top-p 0.95 y una longitud de contexto de 262 144 tokens. GPT-5.5 se evaluó con Codex en modo xhigh, y Claude Opus 4.8 con Claude Code en modo xhigh. El resto de condiciones fueron las mismas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El tamaño del repositorio es de 595.2 GB, lo que sugiere una cuantización de 4 bits. Para cargar todos los pesos en VRAM se necesitarían aproximadamente 600 GB.
- GPU recomendadas: no disponible. Dado el tamaño, se necesitarían clústeres de GPUs como A100 80GB u H100 80GB en configuración multi-GPU (al menos 8 unidades) para inferencia sin offloading.
- No cabe en GPU de consumo: el modelo es demasiado grande para una RTX 4090 o similar, incluso con cuantización extrema.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, entre otras. La integración con transformers está soportada según la información de HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K2.7 Code | 1T (1 026 879 376 368) | 32B | 256K | modified-mit | HuggingFace (trinityomni) |
| Kimi K2.6 | 1T | 32B | 256K | modified-mit | HuggingFace (moonshotai) |

No se dispone de datos de otros modelos open-source comparables en la información proporcionada. Los benchmarks de la sección anterior comparan con GPT-5.5 y Claude Opus 4.8, que son modelos propietarios.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible. Como en todos los modelos generativos, existe riesgo de generar código incorrecto o alucinado, especialmente en tareas de largo horizonte sin supervisión humana.
- Limitaciones de contexto o idioma: la información de HuggingFace indica que los idiomas soportados no están disponibles. El contexto es de 256K tokens, lo que puede ser insuficiente para proyectos extremadamente grandes.
- Restricciones de licencia: la licencia es modified-mit, pero los términos exactos deben revisarse en el archivo LICENSE del repositorio. Puede haber restricciones para uso comercial o redistribución.
- Publicación no oficial: el repositorio de HuggingFace está alojado bajo el usuario 'trinityomni', no bajo la organización oficial 'moonshotai'. Esto puede implicar riesgos de integridad o de disponibilidad; se recomienda verificar la procedencia de los pesos.
- Requisitos de hardware: el modelo necesita infraestructura de centro de datos, lo que limita su uso a organizaciones con recursos suficientes.

## Enlaces

- HuggingFace: https://huggingface.co/trinityomni/Kimi-K2.7-Code
- Página oficial del modelo: https://www.kimi.ai/resources/kimi-k2-7-code
- Kimi Code: https://www.kimi.com/code
- Moonshot AI: https://www.moonshot.ai
- ModelScope: https://modelscope.cn/organization/moonshotai
- Sitio no oficial con información: https://kimik2ai.com/k2.7/
- Discord: https://discord.gg/TYU2fdJykW
- Twitter: https://twitter.com/kimi_moonshot
