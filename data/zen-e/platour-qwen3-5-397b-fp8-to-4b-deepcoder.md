# zen-E/PLatour-Qwen3.5-397B-FP8-to-4B-DeepCoder

## Resumen

PLatour-Qwen3.5-397B-FP8-to-4B-DeepCoder es un artefacto de investigación publicado por el usuario zen-E en Hugging Face, asociado al paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo lingüístico completo, sino un conjunto de pesos de puente (bridge projections) que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer): un modelo emisor grande codifica el prompt y suministra representaciones ocultas, mientras que un modelo receptor pequeño genera la respuesta de forma independiente.

En esta variante concreta, el emisor es Qwen3.5-397B-A17B-FP8 (un modelo MoE de ~403,4B parámetros totales con ~17B activos y 262K tokens de contexto) y el receptor es Qwen3.5-4B. El puente se entrena con recompensas de tarea mediante proyecciones lineales ligeras inicializadas a cero entre backbones congelados, sobre el dataset zen-E/PLatour-DeepCoder-Data, orientado a tareas de programación.

El interés del artefacto es metodológico: explora si la información del emisor mejora realmente al receptor o si las ganancias provienen simplemente de la adaptación del receptor. El propio autor advierte que el repositorio distribuye pesos históricos de inferencia sin puntuaciones de benchmark y que no debe cargarse con `AutoModel.from_pretrained` ni PEFT, sino con el cargador específico del proyecto PLatour.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineal (PACT) entre backbones transformer congelados; soporta modelos de atención híbrida |
| Parametros totales | No disponible para el puente; el emisor Qwen3.5-397B-A17B-FP8 tiene ~403,4B y el receptor Qwen3.5-4B tiene ~4B |
| Parametros activos | ~17B en el emisor (MoE); no aplica al puente |
| Longitud de contexto | No disponible para el puente; el emisor declara 262K tokens |
| Tipos de cuantizacion | FP8 en el emisor (según el nombre del checkpoint base); no disponible para el puente |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors, con cargador personalizado (`custom-loader`) y `config.json` propio del proyecto |

## Arquitectura y entrenamiento

PACT separa el cómputo en dos fases: el emisor grande procesa el prompt (prefill) y expone sus representaciones ocultas; el receptor pequeño genera autorregresivamente la respuesta sin depender del emisor en cada token. El puente consiste en proyecciones lineales ligeras entrenadas entre backbones congelados, inicializadas a cero y optimizadas con recompensas de tarea. El método está diseñado para funcionar también con modelos de atención híbrida.

El entrenamiento de esta variante (Experimento 25, "PLatour on deepcoder") usa el dataset zen-E/PLatour-DeepCoder-Data. El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si las mejoras dependen de información útil del emisor o surgen solo de la adaptación del receptor. El autor no documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; solo indica que se usan recompensas de tarea como señal de optimización.

## Capacidades

- Transferencia de representaciones prefill-a-autorregresiva entre un emisor grande y un receptor pequeño.
- Generación de respuestas por parte del receptor de forma independiente tras el prefill del emisor.
- Soporte de modelos con atención híbrida en el diseño del puente.
- Orientación a tareas de programación (DeepCoder) según el dataset y el nombre del experimento.
- Evaluación controlada mediante PACT-Check (controles de transferencia dummy, irrelevante, autocomunicación y receptor entrenado).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking para este artefacto.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre comunicación entre modelos: usar el puente para medir si las representaciones de un emisor de 397B mejoran a un receptor de 4B en tareas de código, con los controles PACT-Check para descartar artefactos de adaptación.
- Reproducción de experimentos del paper: descargar el experimento 25 con `platour-exps download --experiment 25` y ejecutar la evaluación con el comando correspondiente de la documentación del proyecto.
- Evaluación de eficiencia prefill/generación: comparar el coste de prefill en el emisor grande frente a la generación en el receptor pequeño en cargas de código.
- Estudio de alineación de espacios latentes: analizar cómo proyecciones lineales inicializadas a cero pueden mapear representaciones entre backbones de distinta escala.
- Benchmarking de programación con juez oficial aislado: el autor indica que la evaluación de programación requiere el juez oficial aislado, lo que permite montar un pipeline de evaluación reproducible.
- Auditoría de procedencia de artefactos: el repositorio incluye hashes SHA-256 y mapeo de tensores, útil para verificar la integridad de exportaciones de inferencia en investigación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio distribuye pesos históricos de inferencia sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out.

## Requisitos de hardware

- VRAM del puente: el repositorio ocupa 1,3 GB, por lo que los pesos del puente son ligeros; el grueso de VRAM lo determina el emisor y el receptor.
- Emisor Qwen3.5-397B-A17B-FP8: ~403,4B parámetros en FP8, lo que exige del orden de cientos de GB de VRAM; no cabe en GPU de consumo. Requiere despliegue multi-GPU (A100/H100/H200) o servicio externo.
- Receptor Qwen3.5-4B: cabe en GPU de consumo con cuantización (por ejemplo, RTX 4090 de 24 GB en FP16/BF16 o cuantizaciones de 8/4 bits).
- Opciones de despliegue: el puente requiere el cargador del proyecto PLatour (`platour-exps`); no es compatible con `AutoModel.from_pretrained` ni PEFT. Los backbones pueden servirse con sus stacks habituales (vLLM, TGI, llama.cpp/Ollama para el receptor pequeño), aunque el autor no documenta integraciones.
- Latencia y throughput: no disponibles. Como referencia externa no verificada, un agregador de terceros reporta ~114 t/s para Qwen3.5-397B-A17B en proveedores comerciales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PLatour-Qwen3.5-397B-FP8-to-4B-DeepCoder | Puente ligero; emisor ~403,4B (17B activos) + receptor ~4B | No disponible (emisor 262K) | Apache-2.0 | Hugging Face, cargador propio | Pesos de investigación sin benchmarks publicados |
| Qwen3.5-397B-A17B | ~403,4B totales, ~17B activos | 262K | Apache-2.0 | Hugging Face y proveedores comerciales | Modelo completo; el puente lo usa como emisor |
| Qwen3.5-4B | ~4B | No disponible | No disponible en la información | Hugging Face | Receptor del puente; desplegable en GPU de consumo |

No se dispone de datos de rendimiento comparativo para el puente; cualquier comparación de calidad queda pendiente de evaluación independiente.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado el emisor y el receptor, y usar el cargador del proyecto PLatour.
- Incompatible con `AutoModel.from_pretrained` y PEFT; intentar cargarlo por vías estándar fallará.
- Sin benchmarks publicados: el autor no adjunta resultados y pide evaluación independiente y revisión de procedencia antes de usar los artefactos para nuevas afirmaciones comparativas.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no están verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- Riesgo de alucinación y sesgos: no documentados; al ser pesos de investigación sin evaluación, no hay garantías de calidad en producción.
- Idiomas soportados: no disponibles.
- Licencia: el export es Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos; verificar antes de uso comercial.
- El export no es estado reanudable de optimizador/RNG; solo sirve para inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin soporte comunitario documentado.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3.5-397B-FP8-to-4B-DeepCoder
- Paper: https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8
- Modelo receptor: https://huggingface.co/Qwen/Qwen3.5-4B
- Ficha externa del emisor (no oficial): https://modelgrep.com/models/qwen/qwen3.5-397b-a17b
