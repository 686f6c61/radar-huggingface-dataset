# tinyopsec/TCAndon-Router-GGUF

## Resumen

TCAndon-Router-GGUF es la versión cuantizada en formato GGUF del modelo `tencent/TCAndon-Router`, un modelo de enrutamiento (router) para sistemas multiagente construido sobre Qwen3-4B. El modelo original lo desarrolla Tencent y esta versión GGUF la publica el usuario `tinyopsec` para permitir su ejecución en runtimes compatibles con llama.cpp (Ollama, LM Studio, koboldcpp, etc.). Su función no es la generación de texto generalista, sino decidir a qué agente, herramienta o flujo derivar una consulta dentro de una arquitectura multiagente.

El modelo base cuenta con 4.411.424.256 parámetros (aproximadamente 4,4 mil millones), lo que lo sitúa en la categoría de modelos pequeños y desplegables en hardware de consumo. La model card indica que se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, por lo que hereda la arquitectura transformer de la familia Qwen3 y su ventana de contexto, aunque la información proporcionada no detalla la longitud exacta de contexto.

La relevancia de esta ficha radica en que ofrece un router especializado en formato GGUF, lo que facilita integrar decisiones de enrutamiento en pipelines locales sin depender de infraestructura en la nube. Es una pieza de infraestructura para orquestación de agentes más que un modelo conversacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3, concretamente derivado de `Qwen/Qwen3-4B-Instruct-2507`, con 4,4 mil millones de parámetros. La model card del repositorio GGUF no aporta detalles sobre el proceso de entrenamiento específico del router: no se indica el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica particular más allá de su función de enrutamiento en contextos multiagente.

La versión publicada aquí es únicamente una conversión a GGUF realizada con llama.cpp, sin información adicional sobre cambios en pesos o calibración. Los archivos cubren un rango amplio de cuantizaciones, desde F16 (aproximadamente 8 GB) hasta Q2_K, lo que permite ajustar el equilibrio entre precisión y consumo de memoria.

## Capacidades

- Enrutamiento de consultas hacia agentes, herramientas o flujos dentro de sistemas multiagente.
- Generación de texto (pipeline declarado como `text-generation`), aunque su propósito principal es la clasificación/decisión de ruta.
- Integración con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier motor compatible.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes multi-paso, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Orquestación de agentes locales: el router decide a qué agente especializado derivar cada consulta dentro de un sistema multiagente ejecutado en local, aprovechando su tamaño reducido para mantener baja la latencia de decisión.
- Enrutamiento en asistentes de atención al cliente: clasificar la intención del usuario y derivarla al flujo (facturación, soporte técnico, ventas) correspondiente antes de invocar el modelo generativo principal.
- Selección de herramientas en pipelines de function calling: usar el router como primera capa que decide qué herramienta o API invocar, reduciendo el coste de llamar a un modelo mayor para esa decisión.
- Despliegue en hardware de consumo: al disponer de cuantizaciones Q4_K_M y Q2_K, puede ejecutarse en equipos con GPU modestas o incluso en CPU, permitiendo prototipar sistemas multiagente sin infraestructura dedicada.
- Enrutamiento en aplicaciones de escritorio o embebidas: integrarlo en herramientas locales (LM Studio, Ollama) para decidir la ruta de procesamiento sin conexión a servicios externos.
- Evaluación y experimentación académica: servir como componente de routing reproducible en investigaciones sobre arquitecturas multiagente, gracias a su licencia Apache 2.0 y su formato GGUF ligero.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación de documentos, búsqueda web o respuesta directa antes de ejecutar el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en F16; en torno a 2,5-3 GB en Q4_K_M; cerca de 1,5-2 GB en Q2_K (estimaciones basadas en el tamaño de los archivos, no confirmadas en la información proporcionada).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPU de consumo con 8 GB o más de VRAM en cuantizaciones Q4/Q5, y en GPU profesionales (A100, H100) sin problema.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M o inferiores con GPUs de 8 GB o más; en Q2_K podría caber en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TCAndon-Router-GGUF | 4,4 B | no disponible | Apache 2.0 | GGUF | Router multiagente cuantizado |
| Qwen3-4B-Instruct-2507 | 4 B | no disponible | no disponible | safetensors | Modelo base generalista |
| tencent/TCAndon-Router | 4,4 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en enrutamiento: no está pensado como modelo conversacional generalista; su uso fuera de tareas de routing puede dar resultados pobres.
- La model card advierte explícitamente: "Multi-agent routing model. Evaluate before use." Es necesario evaluarlo antes de llevarlo a producción.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas; al derivar de Qwen3, podría heredar sesgos del modelo base, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `tencent/TCAndon-Router` y de `Qwen/Qwen3-4B-Instruct-2507`.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar la precisión de las decisiones de enrutamiento; se recomienda Q4_K_M o superior para producción.
- El repositorio tiene 0 likes y 618 descargas, lo que sugiere poca validación comunitaria; tratar con cautela.
- No se especifican idiomas soportados ni longitud de contexto, lo que limita la planificación de despliegues con requisitos estrictos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/TCAndon-Router-GGUF
- Modelo base: https://huggingface.co/tencent/TCAndon-Router
- Modelo Qwen3 base referenciado: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
