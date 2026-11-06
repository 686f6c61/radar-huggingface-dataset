# zen-E/PLatour-Qwen3-235B-to-1.7B-GSM8K

## Resumen

PLatour-Qwen3-235B-to-1.7B-GSM8K es un artefacto de investigación publicado por el autor zen-E en Hugging Face, asociado al artículo "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo generativo autónomo al uso, sino un conjunto de pesos de puentes lineales (bridge projections) entrenados bajo el paradigma PACT (Prefill-to-Autoregressive Cross-model Transfer): un modelo emisor grande (Qwen3-235B-A22B-FP8) codifica el prompt y transfiere sus representaciones ocultas a un receptor pequeño (Qwen3-1.7B), que genera la respuesta de forma independiente.

El repositorio corresponde al experimento 14 del proyecto PLatour, centrado en la tarea GSM8K (razonamiento matemático de nivel escolar). Los backbones emisor y receptor permanecen congelados; solo se entrenan proyecciones lineales ligeras inicializadas a cero y optimizadas mediante recompensas de tarea. El objetivo científico es evaluar si la información procedente de un modelo grande mejora realmente al pequeño o si las ganancias se explican por simple adaptación del receptor, para lo cual el paper introduce el protocolo de control PACT-Check.

Es relevante ahora porque propone una vía de transferencia de capacidad entre modelos de escalas muy distintas sin destilar pesos ni compartir arquitectura, y porque su model card es explícita sobre las cautelas: se distribuyen pesos históricos de inferencia sin puntuaciones de benchmark, sin verificación independiente de las revisiones de los backbones y sin garantía de protocolo de selección de checkpoint. Es, por tanto, material para reproducir investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) sobre backbones transformer congelados; soporta modelos de atención híbrida |
| Parametros totales | No disponible para el conjunto de puentes; el receptor es Qwen3-1.7B (1,7 mil millones) y el emisor Qwen3-235B-A22B (235 mil millones totales) |
| Parametros activos | Emisor Qwen3-235B-A22B: 22 mil millones (MoE); receptor: no aplica (denso) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3; no especificada en la información) |
| Tipos de cuantizacion | No disponible; el emisor referenciado se distribuye en FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors, con cargador propio (`custom-loader`), no compatible con `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

El método PACT separa el cómputo en dos fases. En la fase de prefill, el emisor grande (Qwen3-235B-A22B-FP8) procesa el prompt y produce representaciones ocultas. Unas proyecciones lineales ligeras, inicializadas a cero, transforman esas representaciones al espacio del receptor. Después, el receptor (Qwen3-1.7B) genera la respuesta de forma autorregresiva e independiente, sin acceso posterior al emisor. Ambos backbones permanecen congelados durante todo el entrenamiento; solo se optimizan los puentes, y lo hacen mediante recompensas de tarea en lugar de destilación supervisada clásica. El método declara soporte para modelos con atención híbrida.

El paper introduce además PACT-Check, un conjunto de controles diseñados para descartar explicaciones triviales: Dummy Transfer (transferencia nula), Irrelevant Transfer (representaciones de un emisor no relacionado), Self-Communication (el receptor se comunica consigo mismo) y Trained Receiver (receptor entrenado sin puente). La tesis metodológica es que una mejora en la métrica de tarea no demuestra por sí sola una comunicación efectiva entre modelos. El dataset asociado es `zen-E/PLatour-Qwen3-Data` y el experimento concreto es el 14, sobre GSM8K. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autorregresiva a través del receptor Qwen3-1.7B, condicionada por las representaciones transferidas del emisor.
- Razonamiento matemático de nivel escolar, ámbito de evaluación del experimento (GSM8K).
- Transferencia de información entre modelos de distinta escala y potencialmente distinta arquitectura de atención (incluida atención híbrida).
- Evaluación controlada mediante el protocolo PACT-Check para aislar el efecto real de la comunicación entre modelos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades multilingües: no disponibles como dato verificado; dependerían de los backbones Qwen3, pero no se declaran en este repositorio.

## Casos de uso

- Reproducción de investigación en transferencia entre modelos: cargar el experimento 14 con el cargador del proyecto PLatour y los backbones descargados por separado para replicar el montaje PACT sobre GSM8K y contrastarlo con los controles de PACT-Check.
- Estudio de comunicación entre modelos de distinta escala: usar este artefacto como caso concreto de emisor de 235B y receptor de 1,7B para medir cuánta capacidad se transfiere realmente frente a la simple adaptación del receptor.
- Validación de protocolos de evaluación: emplear los controles Dummy Transfer, Irrelevant Transfer y Self-Communication para comprobar si una mejora reportada en GSM8K se sostiene al eliminar la información útil del emisor.
- Investigación sobre eficiencia en inferencia: analizar si un receptor pequeño condicionado por un emisor grande puede acercarse a la calidad del emisor en tareas acotadas, con implicaciones para reducir coste de servicio.
- Auditoría de artefactos publicados: revisar hashes SHA-256, mapeo de tensores y revisiones de backbones declaradas para estudiar prácticas de trazabilidad en exports de inferencia.
- Docencia y formación en IA: ilustrar con un caso real y reproducible las diferencias entre destilación, adaptación de dominio y transferencia de representaciones entre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio distribuye pesos históricos de inferencia sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en conjuntos reservados.

## Requisitos de hardware

- VRAM para el receptor Qwen3-1.7B: aproximadamente 3,5 GB en FP16 y en torno a 1,2-2 GB en cuantizaciones de 4-8 bits, estimación orientativa no verificada en este repositorio.
- VRAM para el emisor Qwen3-235B-A22B: el checkpoint referenciado se distribuye en FP8, lo que implica del orden de 235 GB de pesos; su ejecución requiere nodos multi-GPU de alta gama (H100 80 GB, H200, A100 80 GB en configuraciones múltiples).
- El receptor de 1,7B cabe en GPU de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) en FP16 o cuantizado.
- El emisor no cabe en ninguna GPU de consumo ni en una única GPU de 80 GB en FP8; requiere paralelismo de tensor o pipeline.
- Despliegue: el repositorio no es cargable con `AutoModel.from_pretrained` ni con PEFT; requiere el cargador del proyecto PLatour (`platour-exps download --experiment 14`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3-235B-to-1.7B-GSM8K | Puentes sobre 235B (emisor) y 1,7B (receptor) | No disponible | Transferencia prefill-a-autorregresivo con backbones congelados | Apache-2.0 | Hugging Face, cargador propio |
| Qwen3-235B-A22B | 235B totales / 22B activos | No disponible en la información | MoE generativo completo | Según modelo upstream | Hugging Face |
| Qwen3-1.7B | 1,7B | No disponible en la información | Transformer denso generativo | Según modelo upstream | Hugging Face |
| PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux | Misma configuración de puentes | No disponible | Variante PACT sobre MMLU-Redux | Apache-2.0 | Hugging Face |

La comparación relevante no es de rendimiento, sino de naturaleza del artefacto: frente a los backbones completos, este repositorio solo contiene proyecciones de transferencia y depende de ambos para funcionar. Frente a otras variantes PLatour del mismo autor, cambia la tarea de evaluación (GSM8K en lugar de MMLU-Redux).

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado el emisor y el receptor, y no funciona con las APIs estándar de Hugging Face ni con PEFT.
- El repositorio no incluye puntuaciones de benchmark; cualquier afirmación de rendimiento sobre estos pesos carece de respaldo en la información publicada.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export es estado de inferencia, no estado reanudable de optimizador ni de RNG.
- La model card exige evaluación independiente y revisión de procedencia antes de usar estos artefactos para sustentar nuevas afirmaciones comparativas de investigación.
- Riesgo de alucinación y sesgos: no documentados específicamente; heredados en su caso de los backbones Qwen3, sin evaluación propia en este repositorio.
- Idiomas soportados no declarados; el alcance multilingüe no está verificado para este artefacto.
- Licencia Apache-2.0 para el export, pero los modelos upstream conservan sus propias licencias y avisos, que deben revisarse antes de cualquier uso comercial.
- La evaluación de tareas de programación requiere además el juez oficial aislado del proyecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-235B-to-1.7B-GSM8K
- Paper (HTML): https://arxiv.org/html/2611.06976
- Paper (abstract): https://arxiv.org/abs/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Variante sobre MMLU-Redux: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
