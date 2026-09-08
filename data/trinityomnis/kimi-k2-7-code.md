# trinityomnis/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de inteligencia artificial centrado en tareas de programación y agentes, desarrollado por Moonshot AI. Se basa en Kimi K2.6 y está diseñado para mejorar la finalización de tareas de codificación de largo horizonte en flujos de trabajo complejos de ingeniería de software. El modelo reduce el uso de tokens de pensamiento en aproximadamente un 30% en comparación con K2.6, lo que mejora la eficiencia en entornos de producción.

Arquitectónicamente, es un modelo de mezcla de expertos (MoE) con 1,03 billones de parámetros totales y 32.000 millones de parámetros activos por token. Tiene una ventana de contexto de 256.000 tokens e incorpora un codificador visual MoonViT de 400 millones de parámetros, lo que le permite procesar imágenes. El modelo está publicado bajo licencia modified-mit y está disponible en formato safetensors en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 1,03 billones (1.026.879.376.368) |
| Parametros activos | 32.000 millones (32B) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | No disponible (repositorio con compressed-tensors) |
| Idiomas soportados | No disponible |
| Licencia | modified-mit |
| Formato de pesos | safetensors, compressed-tensors |
| Capas totales | 61 (incluye 1 capa densa) |
| Capas densas | 1 |
| Dimension de atencion oculta | 7168 |
| Dimension oculta MoE por experto | 2048 |
| Cabezas de atencion | 64 |
| Numero de expertos | 384 |
| Expertos seleccionados por token | 8 |
| Expertos compartidos | 1 |
| Tamano de vocabulario | 160.000 |
| Mecanismo de atencion | MLA (Multi-head Latent Attention) |
| Funcion de activacion | SwiGLU |
| Codificador visual | MoonViT (400 millones de parametros) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Kimi K2.7 Code emplea una arquitectura de mezcla de expertos (MoE) con 384 expertos de los que se seleccionan 8 por token, más un experto compartido. La red cuenta con 61 capas, de las cuales solo una es densa. El mecanismo de atención es MLA (Multi-head Latent Attention) y la función de activación es SwiGLU. El modelo incluye un codificador visual MoonViT de 400 millones de parámetros, lo que le permite aceptar imágenes como entrada, tal como indica el pipeline image-text-to-text.

En cuanto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset ni si se han aplicado técnicas de alineación como RLHF o DPO. El modelo se presenta como una evolución de Kimi K2.6, con mejoras sustanciales en tareas de codificación de largo horizonte y una reducción del 30% en el uso de tokens de pensamiento, lo que supone una innovación en eficiencia para modelos agénticos.

## Capacidades

- Generación de código y razonamiento: diseñado para tareas de programación complejas, incluyendo implementación de funcionalidades completas, refactorización y depuración.
- Capacidades agente: puede ejecutar tareas de extremo a extremo en flujos de trabajo de ingeniería de software, con soporte para razonamiento de múltiples pasos.
- Tool calling y MCP: los resultados en MCP Atlas y MCP Mark Verified indican un soporte robusto de Model Context Protocol, lo que permite al modelo interactuar con herramientas externas y APIs.
- Visión: incorpora el codificador MoonViT, por lo que puede procesar imágenes además de texto (pipeline image-text-to-text).
- Modo de pensamiento: los benchmarks se ejecutaron con thinking mode habilitado, lo que sugiere que el modelo dispone de un modo de razonamiento extendido.
- Eficiencia de tokens: reduce el consumo de tokens de pensamiento en aproximadamente un 30% frente a Kimi K2.6.
- Multilingüe: no disponible.

## Casos de uso

- Desarrollo de software autónomo: el modelo puede abordar tareas de largo horizonte como implementar una funcionalidad completa en un repositorio, gestionando múltiples archivos y dependencias. Su contexto de 256.000 tokens permite mantener el estado de todo el proyecto.
- Agentes de codificación en CI/CD: integrar el modelo en pipelines de integración continua para revisar solicitudes de cambio, generar pruebas unitarias y corregir errores automáticamente. Su capacidad de tool calling permite ejecutar comandos y acceder a sistemas externos.
- Asistente de programación con contexto largo: gracias a la ventana de 256.000 tokens, puede analizar repositorios completos, leer documentación y responder preguntas sobre arquitectura de proyectos sin perder información relevante.
- Automatización de infraestructura: generar y mantener scripts de despliegue, configuraciones de Kubernetes, Terraform o pipelines de CI. El modelo comprende lenguajes de configuración y puede razonar sobre la interacción entre servicios.
- Soporte técnico de producción: analizar logs, trazas y descripciones de incidencias para diagnosticar fallos en sistemas complejos. Su razonamiento agente le permite seguir procedimientos de solución de problemas paso a paso.
- Modernización de código legacy: el modelo puede entender código antiguo, documentar su funcionamiento y generar versiones actualizadas, reduciendo el esfuerzo de mantenimiento.
- Educación en programación: como tutor interactivo, puede explicar conceptos, revisar ejercicios y proponer mejoras de código, manteniendo el contexto de la conversación durante sesiones largas.
- Integración con herramientas MCP: al soportar Model Context Protocol, puede conectarse a editores, entornos de desarrollo integrados y agentes externos para ejecutar tareas de forma autónoma, como crear ramas, lanzar builds o gestionar issues.

## Benchmarks y rendimiento

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

Los resultados se obtuvieron con thinking mode habilitado para Kimi K2.6 y K2.7 Code (temperatura 1.0, top-p 0.95, contexto 262.144 tokens). GPT-5.5 se evaluó en Codex con modo xhigh y Claude Opus 4.8 en Claude Code con modo xhigh.

## Requisitos de hardware

- El repositorio de Hugging Face tiene un tamaño de 595,2 GB, lo que corresponde a los pesos en formato safetensors. Para cargar el modelo completo en bf16 se necesitarían aproximadamente 2 TB de memoria, mientras que con cuantización a 4 bits se reduciría a unos 500 GB (estimaciones basadas en el número de parámetros, no en datos oficiales).
- Una sola GPU de consumo, como la RTX 4090 con 24 GB, no es suficiente. Se requiere un clúster de GPUs de alto nivel, como múltiples H100 o A100 de 80 GB, con paralelismo tensorial.
- Opciones de despliegue: vLLM, TensorRT-LLM o TGI son adecuadas para servicios de producción con paralelismo entre nodos. llama.cpp podría utilizarse con cuantización extrema, pero no es práctico en hardware de consumo.
- Latencia y throughput: no disponibles.
- El modelo activa 32.000 millones de parámetros por token, lo que reduce la carga computacional en comparación con un modelo denso de 1 billón, pero sigue requiriendo infraestructura de gran escala.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Kimi Code Bench v2 | MCP Atlas |
|---|---|---|---|---|---|
| Kimi K2.7 Code | 1,03 billones (32B activos) | 256K | modified-mit | 62,0 | 76,0 |
| Kimi K2.6 | 1 billón (32B activos) | 256K | modified-mit | 50,9 | 69,4 |
| GPT-5.5 | No disponible | No disponible | No disponible | 69,0 | 79,4 |
| Claude Opus 4.8 | No disponible | No disponible | No disponible | 67,4 | 81,3 |

Los datos de GPT-5.5 y Claude Opus 4.8 proceden de la tabla de benchmarks del modelo; los parámetros y el contexto no se indican en la información disponible. La comparativa se centra en el rendimiento en tareas de codificación y agentes.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: al ser un modelo generativo, puede producir código o explicaciones incorrectas. Se recomienda validar las salidas en entornos de pruebas.
- Limitaciones de idioma: no se han publicado los idiomas soportados; el rendimiento en lenguajes distintos del inglés no está documentado.
- Restricciones de licencia: la licencia es modified-mit, que es permisiva pero puede incluir condiciones adicionales. Se debe revisar el texto completo antes de un uso comercial.
- Infraestructura: el modelo requiere un clúster de GPUs de gran escala; no es viable en hardware de consumo.
- Repositorio: el modelo está publicado por el usuario trinityomnis, no por la organización oficial Moonshot AI. Se recomienda verificar la autenticidad y el origen de los pesos antes de su uso en producción.
- Datos de entrenamiento: no se han publicado detalles sobre el dataset, lo que impide evaluar posibles sesgos o riesgos de seguridad.

## Enlaces

- https://huggingface.co/trinityomnis/Kimi-K2.7-Code
- https://huggingface.co/moonshotai/Kimi-K2.7-Code
- https://www.kimi.com/code
- https://www.moonshot.ai
- https://www.kimi.ai/resources/kimi-k2-7-code
- https://huggingface.co/moonshotai
- https://modelscope.cn/organization/moonshotai
