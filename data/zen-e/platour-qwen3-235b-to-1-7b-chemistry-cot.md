# zen-E/PLatour-Qwen3-235B-to-1.7B-Chemistry-CoT

## Resumen

PLatour-Qwen3-235B-to-1.7B-Chemistry-CoT es un artefacto de investigación publicado por zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo de lenguaje autónomo en el sentido convencional: es un conjunto de puentes lineales entrenados entre dos backbones congelados, un emisor grande (Qwen3-235B-A22B-FP8) que codifica el prompt y un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma independiente.

La relevancia del artefacto es metodológica más que de producto. El paper propone PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si una mejora de tarea proviene realmente de la información transferida por el emisor o de la simple adaptación del receptor. Este repositorio corresponde al experimento 13 del proyecto, centrado en razonamiento químico con cadena de pensamiento (chemistry_cot).

El repo pesa 0,9 GB y contiene únicamente las proyecciones de los puentes, no los pesos completos de los backbones. Los modelos emisor y receptor deben descargarse por separado. El autor declara explícitamente que la exportación no incluye puntuaciones de benchmark ni protocolo de selección de checkpoint, y que no es cargable mediante `AutoModel.from_pretrained` ni PEFT, sino a través del loader propio del proyecto PLatour.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) entre dos transformers congelados; emisor Qwen3-235B-A22B (MoE) y receptor Qwen3-1.7B (dense) |
| Parámetros totales | No disponible (el repo de 0,9 GB contiene solo las proyecciones del puente, no los backbones) |
| Parámetros activos | No disponible para el artefacto; el emisor Qwen3-235B-A22B es MoE con 22B activos según su denominación |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el emisor referenciado se distribuye en FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors con loader personalizado (`custom-loader`); no compatible con `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

PACT separa el cómputo en dos fases: un emisor grande procesa el prompt y expone representaciones ocultas (prefill), y un receptor pequeño genera la respuesta de forma autorregresiva sin acceso directo al emisor durante la decodificación. El entrenamiento consiste en ajustar puentes lineales ligeros entre backbones congelados, partiendo de proyecciones inicializadas a cero y optimizando con recompensas de tarea. El método soporta modelos con atención híbrida, según la model card.

El experimento 13 se centra en `chemistry_cot`, es decir, razonamiento químico con cadena de pensamiento. El dataset asociado es `zen-E/PLatour-Qwen3-Data`. El paper introduce además PACT-Check con cuatro controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para descartar que las ganancias observadas se deban solo a la adaptación del receptor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO más allá de la mención a "task rewards".

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por las representaciones transferidas del emisor.
- Razonamiento con cadena de pensamiento en el dominio químico (chemistry_cot), objetivo específico del experimento 13.
- Transferencia cross-model de representaciones ocultas entre un emisor MoE de 235B y un receptor dense de 1.7B.
- Soporte de modelos con atención híbrida en el diseño del método PACT.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo en la información disponible.
- No se documenta un modo "thinking" explícito más allá del formato CoT del dataset de entrenamiento.

## Casos de uso

- Investigación en transferencia cross-model: reproducir el experimento 13 con el loader de PLatour para estudiar si la información del emisor mejora tareas de química frente a los controles de PACT-Check.
- Auditoría metodológica de PACT: ejecutar Dummy Transfer e Irrelevant Transfer para verificar que las ganancias no provienen de la adaptación del receptor.
- Estudio de eficiencia en inferencia: comparar el coste de prefill en un emisor de 235B frente a la decodificación en un receptor de 1.7B en escenarios de razonamiento químico.
- Evaluación de cadena de pensamiento en dominios científicos: usar el pipeline del experimento para medir calidad de CoT químico con el juez oficial aislado que requiere la evaluación de programación.
- Base para experimentos de destilación implícita: analizar qué representaciones del emisor son aprovechables por un receptor pequeño en tareas de razonamiento estructurado.
- Reproducibilidad de resultados publicados: descargar el artefacto y los backbones por separado para reejecutar la comparativa del paper con las entradas de tarea firmadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la exportación no adjunta puntuaciones y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out.

## Requisitos de hardware

- El repo de 0,9 GB solo contiene las proyecciones del puente; el requisito real lo determinan los backbones descargados por separado.
- Emisor Qwen3-235B-A22B en FP8: requiere hardware de clase servidor con memoria agregada muy elevada (varias GPU A100/H100 o H200); no cabe en GPU de consumo.
- Receptor Qwen3-1.7B: cabe en GPU de consumo (por ejemplo, RTX 4090 o inferiores) en FP16/BF16 y en cuantizaciones de 8 o 4 bits.
- El artefacto no es cargable con vLLM, llama.cpp, Ollama ni TGI de forma directa; requiere el loader `platour-exps` del proyecto.
- No se dispone de datos de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3-235B-to-1.7B-Chemistry-CoT | Puentes sobre 235B (emisor) + 1.7B (receptor) | No disponible | Transferencia cross-model PACT | Apache-2.0 | Hugging Face (loader propio) |
| Qwen3-235B-A22B | 235B totales, 22B activos | No disponible en la información | LLM MoE estándar | Según upstream Qwen | Hugging Face |
| Qwen3-1.7B | 1.7B | No disponible en la información | LLM dense estándar | Según upstream Qwen | Hugging Face |

No se dispone de información sobre otros artefactos PACT comparables ni de métricas que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo listo para producción: es una exportación de pesos de inferencia histórica sin benchmark ni protocolo de selección documentado.
- No es cargable mediante `AutoModel.from_pretrained` ni PEFT; requiere el loader específico del proyecto PLatour.
- Los backbones emisor y receptor deben descargarse por separado y no se incluyen en el repo.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El autor advierte que la evaluación independiente y la revisión de procedencia son necesarias antes de usar estos artefactos para respaldar nuevas afirmaciones comparativas.
- El artefacto no es estado reanudable de optimizador/RNG.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos de alucinación específicos; deben evaluarse sobre el receptor Qwen3-1.7B subyacente.
- La licencia Apache-2.0 del export no sustituye las licencias y avisos de los modelos upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-235B-to-1.7B-Chemistry-CoT
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Paper (HTML): https://arxiv.org/html/2611.06976
- Paper (abstract): https://arxiv.org/abs/2611.06976
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
