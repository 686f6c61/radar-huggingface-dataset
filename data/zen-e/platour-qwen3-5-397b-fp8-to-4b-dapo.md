# zen-E/PLatour-Qwen3.5-397B-FP8-to-4B-DAPO

## Resumen

PLatour-Qwen3.5-397B-FP8-to-4B-DAPO es un artefacto de investigación publicado por zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el artículo «On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer» (arXiv:2611.06976). No es un modelo independiente: es un conjunto de proyecciones lineales (bridges) entrenadas para conectar un emisor grande congelado (Qwen3.5-397B-A17B-FP8) con un receptor pequeño congelado (Qwen3.5-4B), de modo que el emisor codifica el prompt y el receptor genera la respuesta por sí mismo.

La propuesta técnica es relevante porque separa el coste de prefill (asumido por el modelo grande) del coste de decodificación (asumido por el modelo pequeño), manteniendo los backbones intactos y entrenando únicamente las proyecciones mediante recompensas de tarea (DAPO). El paquete ocupa 1,3 GB y contiene solo los pesos de las proyecciones, no los backbones.

El repositorio se distribuye como exportación de inferencia histórica, sin puntuaciones de benchmark y sin protocolo de selección de checkpoint verificado. No es cargable mediante `AutoModel.from_pretrained` ni PEFT; requiere el loader propio del proyecto PLatour.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (backbones Qwen3.5); puentes lineales ligeros entre backbones congelados (PACT) |
| Parámetros totales | No disponible para el artefacto (solo proyecciones, repo de 1,3 GB); emisor Qwen3.5-397B-A17B con 403,4B parámetros reportados; receptor Qwen3.5-4B |
| Parámetros activos | ~17B en el emisor (MoE, según nomenclatura A17B); receptor denso de 4B |
| Longitud de contexto | No disponible para el artefacto; el modelo emisor reporta 262K tokens de contexto |
| Tipos de cuantización | Pesos del emisor en FP8 (según el nombre del checkpoint base); no se documentan cuantizaciones del artefacto |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors, con `config.json` propio y carga mediante `custom-loader` (PLatour) |

## Arquitectura y entrenamiento

El sistema sigue el esquema PACT: un emisor grande (Qwen3.5-397B-A17B-FP8) procesa el prompt y produce representaciones ocultas; unas proyecciones lineales ligeras, inicializadas a cero, transforman esas representaciones hacia el espacio del receptor; el receptor (Qwen3.5-4B) genera la respuesta de forma autorregresiva e independiente. Ambos backbones permanecen congelados y solo se entrenan los puentes, lo que reduce drásticamente el coste de entrenamiento y permite soportar modelos con atención híbrida.

El entrenamiento de los puentes se realiza con recompensas de tarea (DAPO) sobre el dataset `zen-E/PLatour-DAPO-Data`. El artículo introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor. Esta exportación corresponde al «Experiment 20: PLatour on dapo» y no adjunta resultados de benchmark ni estado de optimizador/RNG.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3.5-4B, condicionada por las representaciones del emisor.
- Razonamiento y conocimiento transferidos desde un emisor de 403,4B parámetros al receptor de 4B a través de los puentes.
- Soporte de atención híbrida en los backbones, según el diseño de Qwen3.5.
- Capacidad potencial de tool calling y razonamiento multi-paso heredada del receptor, no verificada en este artefacto.
- Capacidades multilingües: no disponibles en la información del repositorio.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el Experiment 20 de PLatour con el loader del proyecto, los backbones descargados por separado y las entradas de tarea firmadas, para estudiar si la información del emisor mejora al receptor.
- Validación con PACT-Check: ejecutar los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para descartar que las ganancias provengan solo de la adaptación del receptor.
- Estudio de eficiencia prefill/decode: usar el emisor grande únicamente en la fase de prefill y el receptor de 4B en decodificación, midiendo latencia y throughput frente a un pipeline monolítico.
- Evaluación de programación: emplear el juez oficial aislado que exige la documentación del proyecto para tareas de código, comparando el sistema PACT con el receptor sin puentes.
- Análisis de atención híbrida: comprobar empíricamente cómo se comportan los puentes lineales cuando el emisor combina mecanismos de atención lineal y completa.
- Reproducibilidad de investigación: auditar hashes SHA-256 y revisar la procedencia de los artefactos antes de usarlos en afirmaciones comparativas nuevas, tal como advierte la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la exportación no adjunta puntuaciones y que se requiere evaluación independiente y revisión de procedencia antes de respaldar nuevas afirmaciones comparativas.

## Requisitos de hardware

- VRAM para el artefacto: 1,3 GB de pesos de proyecciones; requiere además cargar ambos backbones.
- Emisor Qwen3.5-397B-A17B-FP8: 403,4B parámetros en FP8, lo que implica varios cientos de GB de VRAM y despliegue multi-GPU (A100/H100 de 80 GB en nodos múltiples); no cabe en GPU de consumo.
- Receptor Qwen3.5-4B: viable en una RTX 4090 (24 GB) o superior en FP16/BF16; también en GPUs de 16 GB con cuantización.
- Opciones de despliegue: loader propio de PLatour (`platour-exps download --experiment 20`); no compatible con `AutoModel.from_pretrained` ni PEFT. Para los backbones, vLLM, TGI o llama.cpp según el modelo concreto.
- Latencia y throughput: no disponibles. El emisor reporta 114 t/s en un proveedor externo, dato no aplicable directamente a este sistema PACT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3.5-397B-FP8-to-4B-DAPO | Puentes sobre 403,4B (emisor) + 4B (receptor) | No disponible (emisor: 262K) | Transferencia prefill→autoregresivo con backbones congelados | Apache-2.0 | Hugging Face, loader propio |
| Qwen3.5-397B-A17B | 403,4B (17B activos) | 262K | MoE monolítico | Apache-2.0 | Hugging Face y 10 proveedores |
| Qwen3.5-4B | 4B | No disponible | Transformer denso | No disponible en la información | Hugging Face |
| Destilación clásica (referencia genérica) | Variable | Variable | Entrenamiento del alumno completo | Variable | No disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado el emisor y el receptor y usar el loader del proyecto.
- Sin benchmarks publicados ni protocolo de selección de checkpoint verificado; no debe usarse para afirmaciones comparativas sin evaluación independiente.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no están verificadas y no deben inferirse de la última revisión del Hub.
- No es estado de reanudación de optimizador/RNG; es solo una exportación de inferencia.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero heredables de los backbones.
- Idiomas soportados no especificados.
- Licencia Apache-2.0 para el artefacto; los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- La evaluación de programación exige un juez oficial aislado, lo que añade complejidad al pipeline.

## Enlaces

- [Hugging Face: zen-E/PLatour-Qwen3.5-397B-FP8-to-4B-DAPO](https://huggingface.co/zen-E/PLatour-Qwen3.5-397B-FP8-to-4B-DAPO)
- [Paper: On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer](https://arxiv.org/abs/2611.06976)
- [Versión HTML del paper](https://arxiv.org/html/2611.06976)
- [Colección PLatour en Hugging Face](https://huggingface.co/collections/zen-E/platour)
- [Dataset: zen-E/PLatour-DAPO-Data](https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data)
- [Modelo base emisor: Qwen/Qwen3.5-397B-A17B-FP8](https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8)
- [Modelo base receptor: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Ficha de Qwen3.5-397B-A17B en modelgrep](https://modelgrep.com/models/qwen/qwen3.5-397b-a17b)
