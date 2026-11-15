# Yo-Purple/Meditor-3-4B-Universal

## Resumen

Meditor-3-4B-Universal es la edición standalone en formato GGUF del modelo Meditor-3-4B-MoE, desarrollado por el usuario Yo-Purple. Se trata de una compilación del sistema MoE nativo a un formato "k2-horizon" que puede ejecutarse sin dependencias en llama.cpp, LM Studio, KoboldCpp y Ollama. El modelo parte del backbone denso Qwen3-4B (4.164.938.240 parámetros totales) y le superpone una capa de mezcla de expertos con ocho expertos enrutados de reducido tamaño (d_ff=64) más el FFN denso original como experto compartido.

La propuesta del modelo es ofrecer portabilidad de ejecución local: en lugar de requerir el runtime nativo del MoE dinámico con PromptRouter, esta versión compila la arquitectura a un grafo de expertos FFN top-2 por token que los motores de inferencia estándar pueden interpretar directamente. El repositorio incluye pesos en BF16, Q8_0 y Q4_K_M, con un tamaño total de 15,5 GB.

Es relevante para quienes quieren experimentar con arquitecturas MoE destiladas sobre un backbone denso conocido, en hardware de consumo, sin depender de toolchains propietarias. La licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte que las métricas publicadas corresponden al modelo nativo, no a esta compilación GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3-4B con capa MoE "k2-horizon" (FFN compartido + 8 expertos enrutados, top-2 softmax normalizado) |
| Parametros totales | 4.164.938.240 |
| Parametros activos | 4,04B–4,07B (según model card del modelo nativo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo conserva cada capa del transformer de Qwen3-4B con su FFN denso intacto (d_ff=9728) actuando como experto compartido, y añade ocho expertos FFN enrutados compactos (d_ff=64) con enrutamiento top-2 mediante softmax normalizado por token. Los pesos de los expertos se destilaron a partir de los LoRA nativos y del PromptRouter del modelo Meditor-3-4B-MoE original. La compilación "k2-horizon" traduce esa estructura dinámica a un grafo estático interpretable por llama.cpp y motores compatibles.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card describe el proceso como una compilación y destilación de pesos, no como un entrenamiento desde cero. La innovación principal es la preservación del FFN denso como experto compartido y la conversión de un MoE dinámico con PromptRouter a un MoE estático top-2 ejecutable en runtimes estándar.

## Capacidades

- Generación de texto conversacional y de respuesta abierta en inglés.
- Razonamiento y síntesis en dominios cognitivos diversos (pensamiento crítico, humanidades, ciencias, expresión creativa), según la evaluación UniBench-100 del modelo nativo.
- Ejecución local sin dependencias en llama.cpp, LM Studio, KoboldCpp y Ollama.
- Compatible con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Soporte multilingüe: limitado a inglés según el campo `language` de la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Evaluación local de arquitecturas MoE destiladas: investigadores pueden cargar los GGUF en llama.cpp u Ollama para estudiar el comportamiento del enrutamiento top-2 sobre un backbone Qwen3-4B sin montar infraestructura personalizada.
- Prototipado de asistentes conversacionales en inglés sobre hardware de consumo: los pesos Q4_K_M permiten desplegar un chatbot funcional en una GPU de gama media o incluso CPU con llama.cpp.
- Integración en LM Studio para pruebas de prompting y comparación cualitativa frente a Qwen3-4B denso, aprovechando que comparten backbone.
- Generación de texto creativo y divulgativo en inglés: la model card reporta puntuaciones altas del modelo nativo en expresión creativa y estilística (8,38/10 en UniBench-100), lo que sugiere utilidad para redacción asistida.
- Docencia y demostraciones de mezcla de expertos: el modelo permite mostrar en vivo cómo un FFN compartido convive con expertos enrutados pequeños en un runtime estándar.
- Baseline para experimentos de cuantización: al publicarse en BF16, Q8_0 y Q4_K_M, sirve para medir la degradación de calidad entre precisiones en tareas de síntesis abierta.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo nativo Meditor-3-4B-MoE, no a esta compilación GGUF (así lo advierte el autor).

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| UniBench-100 (modelo nativo) | Puntuación media (/10) | 7,31 | No |
| UniBench-100 (modelo nativo) | Tasa de aprobación (>=6,0) | 69,0% | No |

Datos contextuales de la model card sobre la serie Meditor (UniBench-100, 100 preguntas abiertas, umbral de aprobado 6,0, evaluadas por gemini-3.8-flash):

| Modelo | Puntuación media | Tasa de aprobación | Tokens/s |
|---|---|---|---|
| Meditor-3-4B-MoE (nativo) | 7,31 | 69,0% | 35,7 |
| Meditor-2-3.4B-Universal (BF16) | 4,12 | 22,0% | 27,5 |
| Meditor-1-500M-Universal (BF16) | 2,42 | 1,0% | 163,4 |

Desglose por dominio del modelo nativo Meditor 3 (frente a Meditor 2): pensamiento crítico 9,09 (100% aprobados), expresión creativa 8,38 (90%), humanidades y ética 8,35 (80%), ciencias físicas y de la vida 7,41. No se han publicado resultados de benchmarks específicos para esta compilación GGUF.

## Requisitos de hardware

- VRAM estimada: 4,37–5,95 GiB según cuantización (BF16, Q8_0, Q4_K_M), según la model card.
- El modelo nativo reporta un pico de 5,43 GiB en configuración `bf16_low_vram`.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080) y en GPUs profesionales (A100, H100) sin problema.
- Despliegue: llama.cpp, LM Studio, KoboldCpp y Ollama de forma nativa; vLLM y TGI no se mencionan como soportados para este formato GGUF.
- Latencia y throughput: el modelo nativo reporta 35,7 tok/s en la evaluación; no hay cifras publicadas para esta compilación GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Meditor-3-4B-Universal (este) | 4,16B totales | no disponible | Apache 2.0 | GGUF | MoE k2-horizon sobre Qwen3-4B |
| Qwen3-4B (base) | 4B densos | no disponible en esta ficha | Apache 2.0 (según base) | safetensors, GGUF | Backbone denso original |
| Meditor-3-4B-MoE (nativo) | 4,16B / 4,04–4,07B activos | no disponible | Apache 2.0 | safetensors | Requiere runtime nativo con PromptRouter |
| Meditor-2-3.4B-Universal | 3,41B / 1,83B activos | no disponible | Apache 2.0 | GGUF | Generación anterior; 4,12 en UniBench-100 |

No se dispone de comparativas con modelos externos a la serie Meditor en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas (7,31/10, 69% de aprobación) corresponden al modelo nativo, no a esta compilación GGUF; la equivalencia de rendimiento no está verificada.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La longitud de contexto no se especifica en la información disponible.
- Riesgo de alucinación inherente a modelos de 4B; la model card no documenta mitigaciones específicas.
- Sesgos conocidos: no documentados por el autor; hereda los del backbone Qwen3-4B y del dataset de destilación.
- El benchmark UniBench-100 está evaluado por un modelo (gemini-3.8-flash) y no está verificado de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3-4B para uso comercial en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yo-Purple/Meditor-3-4B-Universal
- Modelo nativo MoE: https://huggingface.co/Yo-Purple/Meditor-3-4B-MoE
- Modelo base denso: https://huggingface.co/Qwen/Qwen3-4B
- Meditor 1 (MoE nativo): https://huggingface.co/Yo-Purple/Meditor-1-2.2B-A500M-MoE
- Meditor 1 (Universal): https://huggingface.co/Yo-Purple/Meditor-1-500M-Universal
- Meditor 2 (HMoE nativo): https://huggingface.co/Yo-Purple/Meditor-2-3.4B-A1.8B-HMoE
- Meditor 2 (Universal): https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
