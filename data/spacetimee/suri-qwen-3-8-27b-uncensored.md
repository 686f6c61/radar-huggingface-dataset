# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored

## Resumen

Suri Qwen 3.8 27B Uncensored es un ajuste fino del modelo Qwen3.8 27B de Alibaba, publicado por el desarrollador independiente SpaceTimee (Space Time). Su objetivo declarado es eliminar las capas de alineacion y rechazo del modelo original, de modo que responda a practicamente cualquier peticion sin advertencias, moralizacion ni filtros de seguridad. Se distribuye bajo el pipeline `image-text-to-text`, lo que indica que conserva la torre de vision del modelo base, aunque la model card no documenta explicitamente las capacidades multimodales.

El modelo cuenta con 27.781.427.952 parametros reales (segun los pesos en safetensors) y un repositorio de 58,4 GB, lo que sugiere pesos en precision bf16 o fp16. La model card lo etiqueta como `qwen3_5` en la libreria de transformers, con soporte declarado solo para chino e ingles. No se especifica la longitud de contexto, la licencia ni los datos de entrenamiento empleados en el desalineado.

La relevancia de esta ficha es doble: por un lado, documenta un caso de "abliteracion" o desalineado de un modelo de 27B con resultados medidos en suites de seguridad; por otro, advierte de que los incrementos de "tasa de exito de ataque" (ASR) del 94% en AdvBench implican riesgos reales si el modelo se despliega sin controles. Es un objeto de estudio para investigacion en seguridad de IA, no un modelo recomendable para produccion abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; tag `qwen3_5` en transformers) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 58,4 GB |
| Modelo base | Qwen/Qwen3.8-27B, unsloth/Qwen3.8-27B |
| Pipeline | image-text-to-text |
| Descargas / likes | 213 / 17 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de que deriva de Qwen3.8 27B, un transformer denso de 27B parametros con capacidad multimodal (pipeline `image-text-to-text`). La model card no documenta numero de capas, dimensiones ocultas, mecanismos de atencion ni si incorpora decodificacion especulativa u otras optimizaciones.

Respecto al entrenamiento, el autor no publica el dataset, el numero de tokens ni la metodologia exacta de desalineado. La model card solo indica que el modelo "residualiza preferencias de alineacion corregibles por prompt" y sugiere un system prompt explicito para eliminar cualquier contenido de advertencia. Los resultados de ASR publicados (AdvBench 94,04%, HarmBench 81,33%) indican que el proceso de desalineado fue agresivo y efectivo, probablemente mediante tecnicas de abliteracion (modificacion de direcciones de rechazo en los pesos) o fine-tuning con datos adversarios. No se menciona RLHF, DPO ni ninguna fase de alineacion posterior.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Razonamiento con modo "thinking" y modo directo (la model card enlaza ejemplos de salida en ambos modos).
- Procesamiento de imagen y texto como entrada (pipeline `image-text-to-text`), aunque no se detallan tareas concretas de vision.
- Respuestas sin rechazo ni advertencias a peticiones que el modelo base filtraria.
- Soporte de system prompts para modificar el comportamiento (el autor documenta uno para eliminar moralizacion residual).
- Tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion en seguridad de IA: evaluar la eficacia de tecnicas de desalineado comparando las tasas ASR del modelo con las del Qwen3.8 27B original en AdvBench y HarmBench, tal como hace el propio autor en su tabla.
- Pruebas de robustez de filtros: usar el modelo como generador adversario para estresar clasificadores de contenido y sistemas de moderacion en pipelines de produccion.
- Red teaming interno: simular escenarios de abuso controlados en entornos aislados para identificar vectores de ataque antes de desplegar modelos alineados.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas sensibles (violencia, contenido adulto) en un entorno privado, donde el modelo no introduce advertencias ni cortes.
- Estudio de sesgos y alucinacion: analizar como el desalineado afecta a la fidelidad factual y a los sesgos del modelo base en tareas de pregunta-respuesta.
- Evaluacion comparativa de tecnicas de alineacion: servir como referencia "no alineada" frente al Qwen3.8 27B base y a otros modelos desalineados como Qwen3.8-27B-Heretic-Abliterated-Uncensored.

## Benchmarks y rendimiento

Los unicos datos publicados son tasas de exito de ataque (ASR) en suites de seguridad, extraidas de la model card. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Modelo | AdvBench ASR (520) | HarmBench ASR (300) | Cybercrime & Intrusion (67) | Chemical & Biological (56) | Illegal Activities (65) | Misinformation & Disinformation (65) | Harassment & Bullying (25) | Harmful Content (22) |
|---|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 0,38% | 6,00% | 8,96% | 1,79% | 1,54% | 15,38% | 0,00% | 0,00% |
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored | 94,04% | 81,33% | 83,58% | 92,86% | 72,31% | 86,15% | 64,00% | 77,27% |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored | 88,65% | 76,67% | 68,66% | 85,71% | 66,15% | 90,77% | 68,00% | 77,27% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 56 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda un minimo de 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 28-30 GB; en 4 bits: alrededor de 15-18 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o 2x RTX 4090/A6000 en paralelo para precision completa.
- Cabe en GPU de consumo: si, en configuraciones de 4 bits (por ejemplo, RTX 4090 24 GB con cuantizacion agresiva), aunque no hay GGUF publicado en el repositorio.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag incluido), endpoints compatibles. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con version concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AdvBench ASR | HarmBench ASR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Uncensored | 27,78B | no disponible | 94,04% | 81,33% | no disponible | Hugging Face, 213 descargas |
| Qwen3.8-27B (base) | 27B (aproximado) | no disponible | 0,38% | 6,00% | no disponible | Hugging Face (oficial) |
| Qwen3.8-27B-Heretic-Abliterated-Uncensored | 27B (aproximado) | no disponible | 88,65% | 76,67% | no disponible | Hugging Face |

No se dispone de datos de benchmarks de capacidad ni de contexto para establecer una comparacion funcional mas alla de las tasas ASR.

## Limitaciones y advertencias

- Modelo deliberadamente desalineado: presenta tasas ASR superiores al 80% en HarmBench y superiores al 90% en AdvBench, lo que implica que genera contenido danino con alta probabilidad ante peticiones adversarias.
- Riesgo legal y de cumplimiento: su uso en la UE puede entrar en conflicto con la AI Act y con normativas de moderacion de contenido; no hay licencia declarada, lo que impide verificar condiciones de uso comercial.
- Alucinacion: no hay datos sobre fidelidad factual; el proceso de desalineado puede degradar la calibracion y la calidad de las respuestas.
- Idiomas limitados: solo chino e ingles declarados; el rendimiento en castellano no esta verificado.
- Contexto desconocido: no se documenta la ventana de contexto, lo que impide planificar cargas de trabajo con documentos largos.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ en el repositorio, lo que limita el despliegue en hardware de consumo sin conversion manual.
- Mantenimiento incierto: desarrollador individual, sin repositorio de codigo, paper ni proceso de soporte documentado.
- Sesgos: no se han publicado evaluaciones de sesgo; el desalineado puede amplificar estereotipos presentes en los datos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B
- Modelo comparable Heretic-Abliterated: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Ejemplo de salida en modo razonamiento: images/thinking-mode-output.pdf (referenciado en la model card)
- Ejemplo de salida en modo directo: images/non-thinking-mode-output.pdf (referenciado en la model card)
- Comunidad del autor: https://linux.do/u/spacetime
