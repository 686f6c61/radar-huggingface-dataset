# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-ARC-C

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-ARC-C es un artefacto de investigación publicado por zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). La idea central es que un modelo emisor grande (Qwen3-8B) codifica el prompt y suministra representaciones ocultas, mientras que un receptor pequeño (Qwen3-1.7B) genera la respuesta de forma independiente. El repositorio contiene únicamente las proyecciones lineales del puente entrenadas entre ambos backbones congelados, no los pesos completos de ninguno de los dos modelos.

Este checkpoint concreto corresponde al Experimento 07 del proyecto, un ajuste supervisado (SFT) sobre la tarea `arc_c`. No es un modelo autónomo: requiere descargar por separado el emisor (Qwen3-8B) y el receptor (Qwen3-1.7B), además de un cargador personalizado del proyecto PLatour, ya que no es directamente cargable mediante `AutoModel.from_pretrained` ni PEFT. El repositorio ocupa 0,9 GB, lo que es coherente con un conjunto de proyecciones de puente más metadatos, no con pesos de un transformer completo.

La relevancia de este artefacto es metodológica más que práctica: explora si un modelo pequeño puede beneficiarse de representaciones internas de uno grande sin ejecutar el grande en cada paso de decodificación, y propone el conjunto de controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar que las mejoras provienen realmente de información útil del emisor y no de simple adaptación del receptor. El autor advierte explícitamente que este export no incluye puntuaciones de benchmark ni garantiza un protocolo de selección de checkpoint imparcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente de proyecciones lineales entre dos backbones transformer congelados (emisor Qwen3-8B y receptor Qwen3-1.7B); soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo de 0,9 GB contiene solo las proyecciones del puente, no los backbones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | Safetensors con cargador personalizado (`custom-loader`); no compatible con `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre dos backbones congelados, partiendo de proyecciones inicializadas a cero. El emisor grande (Qwen3-8B) procesa el prompt y produce representaciones ocultas que se proyectan hacia el espacio del receptor pequeño (Qwen3-1.7B), que genera la respuesta de forma autorregresiva e independiente. El entrenamiento del puente se guía por recompensas de tarea (task rewards), no por destilación de logits ni por ajuste conjunto de los backbones. El método está diseñado para soportar modelos con atención híbrida.

Este checkpoint concreto corresponde al Experimento 07 con ajuste supervisado (SFT) sobre la tarea `arc_c`, usando el dataset `zen-E/PLatour-Qwen3-Data`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El paper introduce además PACT-Check, un conjunto de controles experimentales (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) cuyo objetivo es descartar que las mejoras observadas se deban únicamente a la adaptación del receptor en lugar de a la transferencia efectiva de información desde el emisor.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por las representaciones proyectadas del emisor Qwen3-8B.
- Razonamiento y respuesta a tareas de tipo ARC (`arc_c`), que es la tarea concreta sobre la que se entrenó este checkpoint.
- Transferencia de información entre modelos de distinto tamaño y familia mediante proyecciones lineales entrenadas.
- Compatibilidad con backbones de atención híbrida según el diseño del método.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el Experimento 07 del proyecto PLatour para estudiar si un receptor de 1,7B se beneficia de representaciones de un emisor de 8B en tareas ARC, usando los comandos de evaluación del proyecto y las entradas de tarea firmadas.
- Validación de metodología PACT-Check: ejecutar los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para verificar que las mejoras no provienen de la mera adaptación del receptor.
- Estudio de eficiencia en decodificación: analizar el coste de prefill con el emisor grande frente a la decodificación con el receptor pequeño, como alternativa a ejecutar el modelo de 8B en cada paso.
- Reproducibilidad de artefactos históricos: comparar los hashes SHA-256 del export con ejecuciones previas, teniendo en cuenta que las revisiones exactas de los backbones no están verificadas de forma independiente.
- Base para nuevos experimentos de puentes entre backbones: reutilizar el cargador y el mapeo de tensores como punto de partida para entrenar puentes en otras tareas o pares de modelos.
- Docencia y divulgación: ilustrar de forma práctica los riesgos de confundir mejora de tarea con comunicación efectiva entre modelos, usando los controles del paper como material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que este repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento imparcial en held-out.

## Requisitos de hardware

- El repositorio en sí ocupa 0,9 GB y contiene solo las proyecciones del puente; el consumo real depende de los backbones descargados por separado.
- Para inferencia se necesita cargar simultáneamente Qwen3-8B (emisor) y Qwen3-1.7B (receptor), lo que en FP16 supone aproximadamente 16 GB para el emisor y 3,4 GB para el receptor, más overhead del runtime.
- GPU recomendadas: A100 40/80 GB o H100 para ejecutar ambos backbones en FP16 con margen; en consumer GPU solo es viable con cuantización agresiva del emisor (por ejemplo, 4 bits, unos 5-6 GB) más el receptor en FP16.
- RTX 4090 (24 GB) puede alojar ambos modelos en FP16 de forma ajustada; RTX 3090/4080 requerirían cuantización del emisor.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el proyecto proporciona su propio cargador (`platour-exps download --experiment 7`) y requiere el `config.json` del repositorio con el mapeo de tensores y el SHA-256.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-ARC-C | Puente sobre 8B + 1,7B | No disponible | Transferencia prefill-a-autorregresiva entre backbones congelados | Apache-2.0 | Hugging Face, cargador propio |
| Qwen/Qwen3-8B | 8B | No disponible en la información | Transformer denso de generación de texto | No disponible en la información | Hugging Face, Transformers |
| Qwen/Qwen3-1.7B | 1,7B | No disponible en la información | Transformer denso de generación de texto | No disponible en la información | Hugging Face, Transformers |

La comparación directa con otros métodos de transferencia entre modelos (destilación de logits, decodificación especulativa, draft models) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado el emisor y el receptor, además del cargador del proyecto PLatour; no funciona con `AutoModel.from_pretrained` ni con PEFT.
- El export no incluye puntuaciones de benchmark; el autor desaconseja usar estos artefactos para respaldar nuevas afirmaciones comparativas sin una evaluación independiente y una revisión de procedencia.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export no es estado de reanudación de optimizador/RNG, por lo que no permite reanudar el entrenamiento tal cual.
- El repositorio no registra descargas ni likes y no tiene pipeline declarado, lo que sugiere un uso muy limitado y sin validación comunitaria.
- Riesgo de alucinación y sesgos: no documentados específicamente, pero heredados del receptor Qwen3-1.7B y del dataset de entrenamiento.
- Restricciones de licencia: el export es Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- Idiomas soportados no declarados; no se debe asumir cobertura multilingüe.
- La mejora en la tarea no demuestra por sí sola comunicación efectiva entre modelos; es imprescindible ejecutar los controles PACT-Check antes de extraer conclusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-ARC-C
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
