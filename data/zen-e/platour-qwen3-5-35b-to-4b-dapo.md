# zen-E/PLatour-Qwen3.5-35B-to-4B-DAPO

## Resumen

PLatour-Qwen3.5-35B-to-4B-DAPO es un artefacto de investigación publicado por zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). En lugar de ser un modelo generativo autónomo, este repositorio contiene únicamente los pesos de los puentes lineales (bridge projections) entrenados entre dos backbones congelados: un emisor grande, Qwen/Qwen3.5-35B-A3B, que codifica el prompt y aporta representaciones ocultas, y un receptor pequeño, Qwen/Qwen3.5-4B, que genera la respuesta de forma independiente.

El interés del artefacto es metodológico: explora si un modelo pequeño puede beneficiarse de las representaciones internas de un modelo mucho mayor sin necesidad de ejecutar el grande en cada paso de decodificación, y propone un conjunto de controles (PACT-Check: Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para distinguir si la mejora proviene de información útil del emisor o simplemente de la adaptación del receptor. Es la "Experiment 19" del proyecto, entrenada sobre el dataset zen-E/PLatour-DAPO-Data.

Es importante subrayar que el repositorio no incluye benchmarks ni puntuaciones de rendimiento, y el propio autor advierte que se trata de un export de inferencia histórico sin protocolo de selección de checkpoint verificado. No es cargable mediante `AutoModel.from_pretrained` ni PEFT: requiere el loader específico del proyecto PLatour.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) entre dos backbones transformer congelados; soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo de 0,7 GB contiene solo los pesos de los puentes, no los backbones) |
| Parametros activos | No aplica a los puentes; el emisor Qwen3.5-35B-A3B es MoE, pero sus parámetros activos no se detallan en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors, con `config.json` propio y carga mediante loader personalizado (`custom-loader`) |

## Arquitectura y entrenamiento

El método PACT separa el cómputo en dos fases: un emisor grande (Qwen3.5-35B-A3B) procesa el prompt en modo prefill y expone sus representaciones ocultas; un receptor pequeño (Qwen3.5-4B) genera la respuesta de forma autorregresiva e independiente. La comunicación entre ambos se realiza mediante puentes lineales ligeros, inicializados a cero, entrenados con recompensas de tarea mientras ambos backbones permanecen congelados. El diseño contempla modelos con atención híbrida.

El entrenamiento se realiza sobre el dataset zen-E/PLatour-DAPO-Data y se enmarca en la "Experiment 19" del proyecto. El paper introduce PACT-Check con cuatro controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras dependen de información útil del emisor y no de la mera adaptación del receptor. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO más allá de la mención a "task rewards".

## Capacidades

- Transferencia de representaciones prefill-a-autorregresiva entre un emisor grande y un receptor pequeño.
- Entrenamiento de puentes lineales con recompensas de tarea sobre backbones congelados.
- Soporte declarado para modelos de atención híbrida.
- Evaluación con controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver).
- Carga mediante el loader del proyecto PLatour (`platour-exps download --experiment 19`).
- No se documentan en la información disponible capacidades de generación, tool calling, agentes, visión, audio ni multilingüismo propias del artefacto; estas dependerían del receptor Qwen3.5-4B subyacente.

## Casos de uso

- Investigación sobre transferencia entre modelos: reproducir la Experiment 19 para estudiar si las representaciones de un emisor de 35B mejoran la generación de un receptor de 4B en tareas concretas.
- Validación de metodología PACT-Check: emplear los cuatro controles para descartar que las mejoras observadas se deban a la adaptación del receptor y no a la comunicación real entre modelos.
- Estudio de eficiencia computacional: analizar el ahorro de cómputo al ejecutar el emisor solo en prefill y delegar la decodificación en un modelo pequeño.
- Benchmarking de arquitecturas de atención híbrida: evaluar cómo se comportan los puentes lineales cuando los backbones combinan mecanismos de atención distintos.
- Reproducibilidad de investigación: usar los hashes SHA-256 y el `config.json` del repositorio para verificar la integridad de los pesos en estudios comparativos.
- Desarrollo de pipelines de evaluación aislada: integrar el loader del proyecto con los backbones descargados por separado y los inputs de tarea firmados para ejecutar evaluaciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los puentes (repo de 0,7 GB); el requisito real vendrá determinado por los backbones Qwen3.5-35B-A3B (emisor) y Qwen3.5-4B (receptor), que deben descargarse por separado.
- GPU recomendadas: no disponible en la información proporcionada; dependerá del emisor de 35B (prefill) y del receptor de 4B (decodificación).
- Compatibilidad con GPU de consumo: no disponible; el receptor de 4B podría caber en GPUs de consumo según cuantización, pero no se confirma en la documentación.
- Opciones de despliegue: loader específico del proyecto PLatour; no es compatible con `AutoModel.from_pretrained` ni PEFT. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Carga estándar |
|---|---|---|---|---|---|
| PLatour-Qwen3.5-35B-to-4B-DAPO | Puentes lineales entre backbones congelados | No disponible (repo 0,7 GB) | No disponible | Apache-2.0 | No (loader propio) |
| Qwen/Qwen3.5-35B-A3B | MoE base (emisor) | 35B totales (activos no disponibles) | No disponible | Según upstream | Sí |
| Qwen/Qwen3.5-4B | Denso base (receptor) | 4B | No disponible | Según upstream | Sí |

No se dispone de datos de rendimiento para comparar; la comparativa se limita a naturaleza del artefacto, licencia y mecanismo de carga.

## Limitaciones y advertencias

- El repositorio no incluye benchmarks ni métricas de rendimiento; no debe usarse para respaldar afirmaciones comparativas sin evaluación independiente.
- No es cargable mediante `AutoModel.from_pretrained` ni PEFT; requiere el loader del proyecto PLatour y la descarga separada de los backbones.
- El autor advierte que las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export no es estado de reanudación de optimizador/RNG; es solo un export de inferencia.
- Los modelos upstream conservan sus propias licencias y avisos, que pueden imponer restricciones adicionales al uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas del artefacto; estas dependerían del receptor Qwen3.5-4B.
- La evaluación de tareas de programación requiere un juez oficial aislado, según la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3.5-35B-to-4B-DAPO
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Modelo receptor: https://huggingface.co/Qwen/Qwen3.5-4B
- Tutorial de fine-tuning de Qwen3-4B en Azure Databricks (referencia contextual): https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
