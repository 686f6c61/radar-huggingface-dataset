# zen-E/PLatour-VS-Qwen3.5-4B-DAPO

## Resumen

PLatour-VS-Qwen3.5-4B-DAPO es un artefacto de investigación publicado por zen-E dentro del proyecto PLatour, que explora la transferencia entre modelos (PACT, Prefill-to-Autoregressive Cross-model Transfer). En este esquema, un modelo emisor de mayor tamaño codifica el prompt y proporciona representaciones ocultas, mientras que un modelo receptor más pequeño genera la respuesta de forma independiente. Los puentes entre ambos backbones congelados son proyecciones lineales ligeras entrenadas con recompensas de tarea, inicializadas a cero y compatibles con arquitecturas de atención híbrida.

Este repositorio concreto corresponde al Experimento 22 ("Virtual Sender on dapo") sobre el modelo base Qwen/Qwen3.5-4B. Incluye las proyecciones del puente, características ocultas virtuales y los IDs de tokens de plantilla, de modo que no requiere un emisor externo en tiempo de inferencia. El modelo base declarado es Qwen3.5-4B, un transformer de aproximadamente 4.000 millones de parámetros, y el artefacto distribuido ocupa 0,9 GB, coherente con un conjunto de pesos de puente más metadatos y no con el backbone completo.

La relevancia de esta ficha es acotada: no se trata de un modelo generativo listo para producción, sino de un export de inferencia histórica sin resultados de benchmarks asociados, que exige el loader del proyecto PLatour y una revisión independiente de procedencia antes de sostener afirmaciones comparativas. La model card lo declara explícitamente como no cargable mediante `AutoModel.from_pretrained` ni PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente de proyecciones lineales entre backbones congelados (PACT), sobre un receptor Qwen3.5-4B con atención híbrida |
| Parametros totales | No disponible (el artefacto distribuido pesa 0,9 GB; el backbone Qwen3.5-4B no se incluye) |
| Parametros activos | No disponible (no se declara configuración MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors con loader personalizado (`custom-loader`) y `config.json` del proyecto |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero y dando soporte a modelos con atención híbrida. El emisor de mayor tamaño codifica el prompt y entrega representaciones ocultas; el receptor, aquí Qwen3.5-4B, genera la respuesta de forma independiente. El Experimento 22 sustituye al emisor externo por un "emisor virtual": las características ocultas virtuales y los IDs de tokens de plantilla quedan incluidos en el export, junto con las proyecciones del puente.

El conjunto de datos de entrenamiento declarado es zen-E/PLatour-DAPO-Data y el procedimiento se basa en recompensas de tarea (DAPO) en lugar de un pipeline clásico de RLHF/DPO sobre preferencias humanas. El paper introduce además PACT-Check, con controles de Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver, para verificar si las mejoras dependen realmente de información útil del emisor o si pueden surgir solo por adaptación del receptor. La model card advierte que este export no constituye estado de reanudación de optimizador/RNG y que las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente.

## Capacidades

- Generación de texto autorregresiva a través del receptor Qwen3.5-4B, condicionada por representaciones ocultas virtuales del puente.
- Transferencia cross-model de representaciones entre un emisor de mayor tamaño (Qwen3.5-35B-A3B según la colección PLatour) y un receptor de 4B.
- Soporte de arquitecturas de atención híbrida en el diseño del puente.
- Inclusión de tokens de plantilla y características ocultas virtuales, sin dependencia de un emisor externo en inferencia.
- Evaluación con PACT-Check y controles experimentales (Dummy, Irrelevant, Self-Communication, Trained Receiver).
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre transferencia cross-model: permite reproducir el Experimento 22 y analizar si la información del emisor aporta ganancia real frente a los controles de PACT-Check, usando el loader del proyecto y los backbones descargados por separado.
- Estudio de eficiencia de inferencia: al sustituir un emisor grande por características ocultas virtuales, se puede medir el coste de generar con un receptor de 4B sin invocar el modelo de 35B en cada petición.
- Validación de puentes lineales: útil para comprobar empíricamente si proyecciones lineales inicializadas a cero bastan para alinear espacios ocultos entre arquitecturas distintas.
- Reproducción de artefactos históricos: el export con hashes SHA-256 y mapeo de tensores permite auditar la integridad de los pesos publicados antes de reutilizarlos.
- Experimentación con atención híbrida: escenario para probar cómo se comporta el puente cuando el receptor combina mecanismos de atención lineales y completos.
- Docencia e investigación metodológica: material para ilustrar protocolos de evaluación con controles negativos y advertencias sobre selección de checkpoints y rendimiento held-out.
- Integración en pipelines de evaluación comparativa: solo tras revisión independiente de procedencia y con el juez aislado oficial para tareas de programación, tal como indica la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que este repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre rendimiento held-out insesgado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto completo; el receptor Qwen3.5-4B requeriría, en estimaciones habituales para 4B parámetros, aproximadamente 8 GB en FP16 y 2,5-3 GB en cuantización de 4 bits, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dependería del backbone Qwen3.5-4B, no del puente.
- Opciones de despliegue: loader del proyecto PLatour mediante `platour-exps download --experiment 22`; no se anuncia compatibilidad con vLLM, llama.cpp, Ollama, TGI ni `AutoModel.from_pretrained`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-VS-Qwen3.5-4B-DAPO | No disponible (puente sobre receptor 4B) | No disponible | Transferencia cross-model PACT con emisor virtual | Apache-2.0 | Hugging Face, loader propio |
| Qwen/Qwen3.5-4B | ~4B (según model card del base) | No disponible | Transformer generativo estándar | No disponible en esta ficha | Hugging Face |
| Qwen3.5-35B-A3B (emisor de la colección PLatour) | No disponible | No disponible | Modelo emisor de mayor tamaño | No disponible en esta ficha | Hugging Face |
| Otros exports PLatour de zen-E | No disponible | No disponible | Variantes del puente (p. ej., 35B-A3B a 4B) | Apache-2.0 | Colección zen-E/platour |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un export de inferencia histórica sin benchmarks ni validación held-out.
- No se carga con `AutoModel.from_pretrained` ni PEFT; requiere el loader del proyecto PLatour y su `config.json`.
- Las revisiones exactas de los backbones usadas en la ejecución original no están verificadas y no deben inferirse de la última revisión del Hub.
- No constituye estado de reanudación de optimizador/RNG; no sirve para continuar entrenamiento.
- Las licencias upstream de los modelos referenciados deben respetarse además de Apache-2.0 del export.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas: no disponibles; dependen del receptor Qwen3.5-4B y no se documentan aquí.
- La evaluación de tareas de programación exige el juez aislado oficial; sin él, los resultados no son comparables.
- Cualquier afirmación comparativa derivada de este artefacto requiere evaluación independiente y revisión de procedencia.
- Descargas y likes registrados en el momento de la consulta: 0 y 0, sin señales de adopción comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-VS-Qwen3.5-4B-DAPO
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Paper (arXiv 2611.06976): https://arxiv.org/abs/2611.06976
- Versión HTML del paper: https://arxiv.org/html/2611.06976
- Dataset DAPO: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
