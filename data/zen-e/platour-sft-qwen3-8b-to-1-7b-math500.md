# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-MATH500

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-MATH500 es un checkpoint de puentes lineales (bridge projections) desarrollado por zen-E en el marco del proyecto PLatour, que investiga la transferencia entre modelos de distinta escala (PACT, Prefill-to-Autoregressive Cross-model Transfer). No es un modelo completo: contiene únicamente las proyecciones entrenadas que conectan un modelo emisor grande congelado (Qwen3-8B) con un modelo receptor pequeño congelado (Qwen3-1.7B). El emisor codifica el prompt y transfiere sus representaciones ocultas al receptor, que genera la respuesta de forma independiente.

El checkpoint corresponde al experimento 12 del proyecto, entrenado con SFT sobre la tarea MATH500. El método entrena puentes lineales ligeros entre backbones congelados partiendo de proyecciones inicializadas a cero, y admite modelos con atención híbrida. El paper asociado (arXiv 2611.06976) introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor.

Su relevancia es metodológica: propone una vía para aprovechar la capacidad de codificación de modelos grandes en la generación de modelos pequeños sin entrenar los backbones. El repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark, y el propio autor advierte de que se requiere evaluación independiente antes de usar estos artefactos para nuevas afirmaciones comparativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) entre dos transformers Qwen3 congelados; emisor Qwen3-8B, receptor Qwen3-1.7B |
| Parametros totales | No disponible (el checkpoint contiene solo las proyecciones del puente, no los backbones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de los backbones Qwen3-8B y Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga mediante loader personalizado del proyecto PLatour; no compatible con `AutoModel.from_pretrained`) |

## Arquitectura y entrenamiento

El sistema es un esquema PACT: un emisor grande (Qwen3-8B) procesa el prompt y proporciona representaciones ocultas, mientras un receptor pequeño (Qwen3-1.7B) genera la respuesta de forma independiente. Entre ambos se entrenan puentes lineales ligeros con proyecciones inicializadas a cero, usando recompensas de tarea como señal de entrenamiento, manteniendo ambos backbones completamente congelados. El método soporta modelos con atención híbrida. Este checkpoint concreto (experimento 12) se entrena con SFT sobre MATH500 y utiliza la estrategia de mapeo `last_aligned`; la variante PLatour basada en GRPO emplea `uniform_endpoints`.

El paper introduce PACT-Check con controles de Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver, cuyo objetivo es distinguir si la mejora en la tarea depende de información útil del emisor o si puede surgir simplemente por adaptación del receptor. El dataset de entrenamiento es zen-E/PLatour-Qwen3-Data. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO más allá de la mención al entrenamiento con recompensas de tarea y a la variante GRPO.

## Capacidades

- Generación de texto condicionada por las representaciones ocultas transferidas desde Qwen3-8B al receptor Qwen3-1.7B.
- Razonamiento matemático orientado a la tarea MATH500, para la que fue entrenado el puente.
- Comunicación entre modelos de distinta escala mediante proyecciones lineales entrenadas, sin modificar los backbones.
- Integración con backend vLLM para la generación en el ejemplo de la model card.
- Evaluación reproducible mediante la CLI del proyecto (`platour-exps evaluate`), con verificación de hashes de configuración y pesos.
- Ejecución multi-GPU mediante réplicas independientes (`--n-gpu`), con fragmentación disjunta de preguntas.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking de forma documentada en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el experimento 12 con `platour-exps evaluate` para estudiar si la información del emisor mejora al receptor en MATH500, usando los controles de PACT-Check para descartar mejoras por adaptación del receptor.
- Evaluación de protocolos de comunicación cross-model: emplear el checkpoint como referencia histórica en estudios sobre PACT y comparar con las variantes GRPO del mismo proyecto.
- Experimentos de destilación implícita: analizar si un receptor de 1.7B puede aproximarse al rendimiento de un emisor de 8B en matemáticas sin entrenar los backbones, reduciendo el coste de cómputo frente a un fine-tuning completo.
- Reproducibilidad académica: verificar los pesos liberados contra el manifiesto del proyecto y reejecutar la evaluación publicada con los mismos ajustes de muestreo y puntuación.
- Docencia y divulgación: ilustrar con un caso concreto cómo funcionan los puentes lineales entre backbones congelados y qué controles experimentales requiere una afirmación de mejora por comunicación entre modelos.
- Desarrollo de infraestructura de evaluación: usar la CLI y el loader personalizado del proyecto como base para pipelines de evaluación multi-GPU con réplicas y verificación de integridad de pesos.
- No es adecuado como modelo de producción para atención al cliente, generación de código o asistentes generales: el checkpoint no contiene pesos completos y no se carga con APIs estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio distribuye pesos de inferencia históricos sin puntuaciones, y el autor indica explícitamente que no se realiza ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre rendimiento no sesgado en datos reservados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el sistema requiere cargar simultáneamente los backbones Qwen3-8B y Qwen3-1.7B congelados más el puente; el tamaño del repositorio del checkpoint es de 0,9 GB.
- Cada réplica de evaluación necesita memoria suficiente para sus modelos y la carga de decodificación; el tamaño de grupo por defecto es de 1 GPU por réplica.
- GPU recomendadas: no disponibles en la información proporcionada; se requiere Linux con CUDA y Python 3.11.
- Viabilidad en GPU de consumo: no disponible.
- Despliegue: backend vLLM mediante la API del proyecto (`load_session` y `generate`); no es compatible con llama.cpp, Ollama, TGI ni `AutoModel.from_pretrained`.
- Latencia y throughput: no disponibles.
- Multi-GPU: soportado mediante `--n-gpu N` (réplicas independientes) y `--n-gpu N --gpus-per-replica G` (N divisible por G); no combinar con `torchrun`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-MATH500 | Solo puentes (backbones 8B + 1.7B) | No disponible | Puentes lineales entre backbones congelados (PACT) | Apache 2.0 | Hugging Face, carga vía proyecto PLatour |
| Qwen3-8B | 8B | No disponible en esta ficha | Transformer denso | No disponible en esta ficha | Hugging Face |
| Qwen3-1.7B | 1.7B | No disponible en esta ficha | Transformer denso | No disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint contiene únicamente proyecciones de puente, no pesos completos; no puede cargarse como modelo autónomo ni con `AutoModel.from_pretrained`.
- Requiere descargar por separado los backbones Qwen3-8B y Qwen3-1.7B y usar la API del proyecto PLatour.
- Entrenado específicamente para MATH500; su comportamiento fuera de esa tarea no está documentado.
- El autor no publica puntuaciones de benchmark y advierte de que se requiere evaluación independiente y revisión de procedencia antes de respaldar nuevas afirmaciones comparativas.
- Riesgo de alucinación: no evaluado en la información disponible; aplicable el del receptor Qwen3-1.7B subyacente.
- Sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de rendimiento hace desaconsejable su uso en producción sin validación propia.
- La generación devuelve texto y no ejecuta código generado.
- El ejemplo de la model card con 256 tokens es una demo de prompt personalizado, no el protocolo de benchmark publicado; para respuestas largas debe aumentarse el límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-MATH500
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU en evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
