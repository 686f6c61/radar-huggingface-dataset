# zen-E/PLatour-VS-Qwen3.5-4B-DeepCoder

## Resumen

PLatour-VS-Qwen3.5-4B-DeepCoder es un artefacto de inferencia experimental publicado por el usuario zen-E en Hugging Face, asociado al paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo entrenado de forma convencional, sino un conjunto de pesos derivados de un experimento de investigación sobre transferencia entre modelos (PACT, Prefill-to-Autoregressive Cross-model Transfer), en el que un modelo emisor de mayor tamano codifica el prompt y un receptor mas pequeno genera la respuesta. En este caso concreto se denomina "Virtual Sender on deepcoder" (experimento 28) y parte como base de Qwen/Qwen3.5-4B.

El repositorio pesa aproximadamente 0,9 GB e incluye proyecciones de puente (bridge), caracteristicas ocultas virtuales y token IDs de plantilla. Segun la model card, no requiere un emisor externo: el "emisor virtual" esta materializado en los propios pesos. La licencia declarada es Apache-2.0 y el formato es safetensors, pero el autor advierte explicitamente que no es cargable mediante `AutoModel.from_pretrained` ni PEFT, sino a traves del loader del proyecto PLatour.

Es relevante ahora porque documenta una linea de investigacion emergente (transferencia entre modelos congelados mediante puentes lineales ligeros) y porque introduce PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar si las mejoras provienen realmente de la informacion del emisor o de la mera adaptacion del receptor. El repositorio no incluye resultados de benchmarks ni garantias de rendimiento en held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (modelo base congelado) con puentes lineales de proyeccion para PACT; soporta modelos de atencion hibrida |
| Parametros totales | no disponible (el repo ocupa ~0,9 GB; el backbone base Qwen3.5-4B se descarga aparte) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones no publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors (export de inferencia; requiere loader propio `custom-loader`) |

## Arquitectura y entrenamiento

El modelo se enmarca en el paradigma PACT: un emisor de mayor capacidad codifica el prompt y aporta representaciones ocultas, mientras un receptor mas pequeno genera la respuesta de forma independiente. El metodo principal entrena puentes lineales ligeros entre backbones congelados, partiendo de proyecciones inicializadas a cero y optimizando mediante recompensas de tarea. La arquitectura soporta modelos con atencion hibrida, lo que amplia el rango de backbones compatibles.

En este export concreto ("Virtual Sender on deepcoder", experimento 28) se incluyen las proyecciones de puente, las caracteristicas ocultas virtuales y los token IDs de plantilla, de modo que no se necesita un emisor externo en tiempo de inferencia. El dataset asociado es zen-E/PLatour-DeepCoder-Data. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO mas alla de la senal de recompensa de tarea. El autor indica que los tensores originales no se han modificado y que los hashes reflejan un export publico de inferencia, pero que las revisiones exactas de los backbones usadas en la ejecucion historica no han sido verificadas de forma independiente.

## Capacidades

- Generacion de texto autoregresiva a partir de representaciones precalculadas por el emisor virtual.
- Razonamiento y generacion de codigo orientados por el dataset DeepCoder (el nombre del experimento sugiere especializacion en tareas de programacion, aunque no se documenta formalmente).
- Soporte de atencion hibrida en el backbone receptor.
- Transferencia entre modelos sin necesidad de emisor externo en inferencia (emisor virtual embebido).
- Evaluacion controlada mediante PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Investigacion sobre transferencia entre modelos: reproduccion del experimento 28 para estudiar si la informacion del emisor mejora la tarea del receptor, usando los controles de PACT-Check para descartar mejoras atribuibles solo a la adaptacion del receptor.
- Evaluacion de puentes lineales: analisis de como proyecciones inicializadas a cero y entrenadas con recompensas de tarea afectan al rendimiento de un receptor de 4B, comparando con el backbone sin puente.
- Experimentos de destilacion ligera: uso del export como referencia para disenar variantes de PACT con otros emisores o receptores, dado que solo se distribuyen los pesos del puente y no el backbone completo.
- Auditoria de reproducibilidad: verificacion de hashes SHA-256 y del mapeo de tensores declarado en `config.json` para validar la integridad del export.
- Estudio de atencion hibrida en receptores pequenos: el soporte explicito de modelos híbridos permite investigar como interactua la transferencia con este tipo de arquitecturas.
- Docencia y formacion en tecnicas de comunicacion entre modelos: ejemplo practico de un pipeline PACT con emisor virtual, util para cursos de investigacion en IA.
- Generacion de codigo asistida en entornos de investigacion (con cautela): dado el nombre DeepCoder y el dataset asociado, puede emplearse en prototipos de generacion de codigo, siempre que se valide empiricamente antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio distribuye pesos de inferencia historicos sin puntuaciones de benchmark y que no se hace ninguna afirmacion sobre el protocolo de seleccion de checkpoints ni sobre el rendimiento imparcial en held-out.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repo ocupa ~0,9 GB, pero requiere descargar por separado el backbone Qwen3.5-4B; un modelo de 4B en FP16 ocupa aproximadamente 8 GB de VRAM, y en cuantizacion de 4 bits en torno a 2,5-3 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del backbone, una GPU consumer con 8-12 GB de VRAM podria ser suficiente en cuantizacion, pero no hay validacion publicada.
- Compatibilidad con GPU consumer: probable por el tamano del backbone (4B), aunque el loader personalizado y la ausencia de cuantizaciones oficiales anaden incertidumbre.
- Opciones de despliegue: no se soporta `AutoModel.from_pretrained` ni PEFT. El unico mecanismo documentado es el loader del proyecto PLatour (`platour-exps download --experiment 28`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-VS-Qwen3.5-4B-DeepCoder | no disponible (base 4B) | no disponible | Puentes PACT sobre backbone congelado | Apache-2.0 | Hugging Face, loader propio |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Transformer estandar | no disponible en la informacion | Hugging Face |
| PLatour bridge Qwen3.5-35B-A3B to 4B on DAPO | no disponible | no disponible | Puentes PACT (solo proyecciones) | no disponible en la informacion | Coleccion PLatour en Hugging Face |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas como Qwen2.5-Coder o DeepSeek-Coder; la informacion proporcionada no incluye benchmarks.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un export de investigacion sin benchmarks ni validacion held-out.
- No es cargable con `AutoModel.from_pretrained` ni PEFT; requiere el loader especifico del proyecto PLatour y su `config.json`.
- Las revisiones exactas de los backbones usadas en la ejecucion historica no han sido verificadas de forma independiente; no deben inferirse de la revision mas reciente del Hub.
- El export no es estado de reanudacion de optimizador/RNG, por lo que no permite continuar el entrenamiento tal cual.
- Riesgo de alucinacion y sesgos: no documentados, pero aplicables por herencia del backbone Qwen3.5-4B.
- Idiomas y contexto: no especificados.
- Licencia Apache-2.0 para el export, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- La evaluacion de programacion requiere un juez oficial aislado, segun la documentacion del proyecto.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-VS-Qwen3.5-4B-DeepCoder
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Version HTML del paper: https://arxiv.org/html/2611.06976
- Coleccion PLatour en Hugging Face: https://huggingface.co/collections/zen-E/platour
- Dataset asociado: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
