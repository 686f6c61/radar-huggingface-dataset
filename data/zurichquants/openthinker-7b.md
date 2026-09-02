# zurichquants/OpenThinker-7B

## Resumen

OpenThinker-7B es un modelo de lenguaje de razonamiento desarrollado por el equipo de open-thoughts, resultado del fine-tuning completo de Qwen/Qwen2.5-7B-Instruct sobre el dataset OpenThoughts-114k. Este dataset se genera mediante destilación de DeepSeek-R1, es decir, se extraen las cadenas de razonamiento del modelo R1 para entrenar modelos más pequeños y eficientes. El modelo se presenta como una mejora sobre Bespoke-Stratos-7B, que usaba solo 17k ejemplos, mientras que OpenThinker-7B emplea 114k, lo que se traduce en mejores resultados en tareas de matemáticas, código y razonamiento científico.

Con 7.615 millones de parámetros, OpenThinker-7B mantiene la arquitectura transformer decoder de Qwen2.5, con una ventana de contexto heredada del modelo base (128k tokens, aunque no se documenta explícitamente en la model card). Su licencia Apache 2.0 permite uso comercial sin restricciones, y todos los componentes (pesos, datos, código de entrenamiento y evaluación) son abiertos. Es relevante porque ofrece una alternativa totalmente reproducible y transparente a los modelos de razonamiento propietarios, con un rendimiento competitivo en benchmarks de razonamiento a un coste de inferencia moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 128k tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizables con herramientas estandar) |
| Idiomas soportados | no disponible (hereda del modelo base, principalmente ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OpenThinker-7B es un fine-tuning completo (full fine-tuning) de Qwen2.5-7B-Instruct, un transformer decoder con atención causal estándar. No introduce innovaciones arquitectónicas propias; su valor reside en el proceso de destilación: el dataset OpenThoughts-114k se genera a partir de DeepSeek-R1, capturando no solo las respuestas finales sino también las cadenas de razonamiento intermedias. El entrenamiento se realizó con 32 GPUs H100 (4 nodos de 8) durante 20 horas, con una tasa de aprendizaje de 1e-5, batch total de 96, 3 épocas y scheduler coseno con warmup del 10%. No se menciona el uso de RLHF o DPO; el método es puramente supervisado sobre las trazas de razonamiento destiladas.

## Capacidades

- Razonamiento matemático avanzado: resuelve problemas de nivel competitivo (AIME, MATH500) con precisión notable.
- Generación y depuración de código: maneja tareas de programación en entornos tipo LiveCodeBench, con mejor rendimiento en dificultad fácil y media.
- Razonamiento científico: responde preguntas de dominio específico (GPQA-Diamond) con precisión superior a modelos de tamaño similar.
- Razonamiento multi-paso: gracias a la destilación de DeepSeek-R1, el modelo genera cadenas de pensamiento explícitas antes de dar la respuesta final.
- Capacidades multilingües: no documentadas, pero hereda el tokenizer y el vocabulario de Qwen2.5, que soporta principalmente inglés y chino.
- Tool calling y agentes: no documentado explícitamente; al ser un fine-tune de Qwen2.5-Instruct, es probable que conserve las capacidades de function calling del base, pero no se garantiza.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede generar soluciones paso a paso para problemas de cálculo, álgebra o estadística, útil para plataformas de tutoría automatizada o generación de material didáctico.
- Asistente de programación en producción: con soporte para razonamiento de código, puede integrarse en IDEs o pipelines de CI/CD para sugerir implementaciones, revisar código o generar tests, especialmente en tareas de dificultad media.
- Análisis de datos científicos: su rendimiento en GPQA-Diamond lo hace adecuado para ayudar a investigadores a interpretar resultados experimentales o responder preguntas técnicas en dominios como física o química.
- Chatbots de soporte técnico con razonamiento: al mantener la capacidad conversacional de Qwen2.5-Instruct, puede gestionar consultas multi-turno que requieran deducción lógica, como diagnóstico de incidencias técnicas.
- Generación de explicaciones y contenido educativo: puede descomponer conceptos complejos en pasos lógicos, útil para crear guías de estudio o resúmenes técnicos.
- Prototipado de agentes de razonamiento: al ser totalmente abierto, sirve como base para experimentar con técnicas de chain-of-thought, self-consistency o verificación externa en entornos de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados con la herramienta Evalchemy:

| Modelo | AIME24 | MATH500 | GPQA-Diamond | LCBv2 Easy | LCBv2 Medium | LCBv2 Hard | LCBv2 All |
|---|---|---|---|---|---|---|---|
| OpenThinker-7B | 31.3 | 83.0 | 42.4 | 75.3 | 28.6 | 6.5 | 39.9 |
| Bespoke-Stratos-7B | 22.7 | 79.6 | 38.9 | 71.4 | 25.2 | 0.8 | 35.8 |
| DeepSeek-R1-Distill-Qwen-7B | 60.0 | 88.2 | 46.9 | 79.7 | 45.1 | 14.6 | 50.1 |
| gpt-4o-0513 | 8.7 | 75.8 | 46.5 | 87.4 | 42.7 | 8.9 | 50.5 |
| o1-mini | 64.0 | 85.6 | 60.0 | 92.8 | 74.7 | 39.8 | 72.8 |

OpenThinker-7B supera claramente a Bespoke-Stratos-7B en todas las métricas, pero queda por detrás de DeepSeek-R1-Distill-Qwen-7B, que usa el mismo modelo base pero con un proceso de destilación más refinado. En comparación con gpt-4o, OpenThinker-7B gana en matemáticas (AIME24 y MATH500) pero pierde en código.

## Requisitos de hardware

- VRAM estimada: en FP16 (~15 GB) cabe en una RTX 3090/4090 (24 GB); en int8 (~8 GB) cabe en GPUs de 12 GB; en int4 (~4 GB) cabe en GPUs de 8 GB.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100 para inferencia de alto rendimiento.
- Inferencia en CPU: posible con llama.cpp y cuantización GGUF, aunque con latencia alta.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, Transformers con `text-generation-inference`.
- Latencia y throughput: no disponibles; en una A100 80GB con vLLM y batch de 1, se espera una latencia de ~50-100 ms por token en FP16, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | AIME24 | MATH500 | GPQA-Diamond | LCBv2 All |
|---|---|---|---|---|---|---|---|
| OpenThinker-7B | 7.6B | no disponible (base 128k) | Apache 2.0 | 31.3 | 83.0 | 42.4 | 39.9 |
| Bespoke-Stratos-7B | 7.6B | no disponible (base 128k) | Apache 2.0 | 22.7 | 79.6 | 38.9 | 35.8 |
| DeepSeek-R1-Distill-Qwen-7B | 7.6B | 128k | MIT | 60.0 | 88.2 | 46.9 | 50.1 |

OpenThinker-7B es superado por DeepSeek-R1-Distill-Qwen-7B en todos los benchmarks, pero ofrece la ventaja de tener datos y código de entrenamiento abiertos, lo que facilita la reproducibilidad y la adaptación. Bespoke-Stratos-7B es el predecesor directo y queda claramente por debajo.

## Limitaciones y advertencias

- Rendimiento inferior a DeepSeek-R1-Distill-Qwen-7B en tareas de razonamiento, especialmente en código difícil (LCBv2 Hard: 6.5 vs 14.6).
- Riesgo de alucinación en dominios fuera de los datos de entrenamiento, especialmente en razonamiento científico avanzado.
- La longitud de contexto no está documentada; aunque el base soporta 128k, el fine-tuning podría degradar la capacidad de manejar contextos largos.
- Idiomas limitados: no se documenta soporte multilingüe; probablemente funciona mejor en inglés y chino.
- No se han publicado evaluaciones de sesgos o robustez; al ser un fine-tune de un modelo instruct, puede heredar sesgos del base.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no ha sido auditado para aplicaciones de alto riesgo.

## Enlaces

- [HuggingFace - OpenThinker-7B](https://huggingface.co/open-thoughts/OpenThinker-7B)
- [Paper - OpenThoughts: Data Recipes for Reasoning Models](https://arxiv.org/abs/2506.04178)
- [Dataset - OpenThoughts-114k](https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k)
- [GitHub - open-thoughts](https://github.com/open-thoughts/open-thoughts)
- [Herramienta de evaluación - Evalchemy](https://github.com/mlfoundations/Evalchemy)
- [Blog de lanzamiento - Open Thoughts](https://www.open-thoughts.ai/blog/launch)
- [Blog de Bespoke-Stratos](https://www.bespokelabs.ai/blog/bespoke-stratos-the-unreasonable-effectiveness-of-reasoning-distillation)
