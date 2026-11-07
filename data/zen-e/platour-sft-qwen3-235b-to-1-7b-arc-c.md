# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-ARC-C

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-ARC-C es un artefacto de investigación publicado por zen-E (Zhenyi Shen y colaboradores) que implementa un puente de transferencia entre modelos dentro del paradigma PACT (Prefill-to-Autoregressive Cross-model Transfer). En este esquema, un modelo "emisor" grande (Qwen3-235B-A22B-FP8) procesa el prompt y genera representaciones ocultas, mientras que un modelo "receptor" pequeño (Qwen3-1.7B) produce la respuesta de forma independiente. El repositorio contiene únicamente las proyecciones lineales del puente, no los pesos de los backbones, que deben descargarse por separado.

El experimento concreto es el número 01 del proyecto PLatour, evaluado sobre la tarea ARC-C (AI2 Reasoning Challenge, nivel de dificultad challenge). Las proyecciones se entrenan con recompensas de tarea partiendo de inicializaciones a cero, y el método soporta modelos con atención híbrida. El objetivo científico es determinar si la mejora en la tarea proviene de información útil transmitida por el emisor o si es un artefacto de la adaptación del receptor, para lo cual el paper introduce los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver).

Es relevante ahora porque cuestiona metodológicamente los resultados de comunicación entre modelos: el propio autor advierte que un mejor rendimiento en la tarea no demuestra por sí solo una transferencia efectiva. El repositorio es un export de inferencia histórico, sin puntuaciones de benchmark adjuntas, y no está pensado para carga directa mediante `AutoModel.from_pretrained` ni PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente de proyecciones lineales ligeras entre dos backbones transformer congelados (emisor Qwen3-235B-A22B-FP8, receptor Qwen3-1.7B); soporta atención híbrida |
| Parametros totales | No disponible (el repo de 0.9 GB contiene solo las proyecciones del puente; los backbones se descargan aparte) |
| Parametros activos | No disponible para el puente; el emisor Qwen3-235B-A22B es MoE con 235B totales y 22B activos (dato del nombre del modelo base) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el emisor referenciado está en FP8; no se documentan cuantizaciones del puente) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias y avisos) |
| Formato de pesos | safetensors con cargador personalizado (`custom-loader`); requiere el loader del proyecto PLatour y el `config.json` del repo |

## Arquitectura y entrenamiento

El método PACT separa el cómputo en dos fases: un emisor grande realiza el prefill del prompt y expone sus representaciones ocultas, y un receptor pequeño genera autorregresivamente la respuesta sin depender del emisor en cada paso. El puente consiste en proyecciones lineales ligeras entrenadas entre backbones congelados, inicializadas a cero, y optimizadas mediante recompensas de tarea. El diseño admite modelos con atención híbrida.

El entrenamiento se realizó sobre el dataset `zen-E/PLatour-Qwen3-Data` para el experimento 01 (ARC-C). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; el paper describe el uso de recompensas de tarea para entrenar los puentes. La innovación metodológica destacable es PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) diseñado para verificar que la mejora depende de información útil del emisor y no de la mera adaptación del receptor.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por las representaciones del emisor a través del puente.
- Razonamiento sobre tareas de opción múltiple de tipo ARC-C, el escenario concreto para el que se entrenó este export.
- Transferencia de representaciones entre modelos de distinta escala y familia de tamaño (235B a 1.7B).
- Soporte de atención híbrida en los backbones, según el diseño del método.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking específicas de este artefacto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en comunicación entre modelos: reproducir el experimento 01 del proyecto PLatour sobre ARC-C para estudiar si las representaciones del emisor aportan señal útil al receptor, usando los controles PACT-Check.
- Evaluación de metodologías de transferencia: emplear el export como referencia histórica para contrastar protocolos de selección de checkpoint y detectar sesgos en comparativas entre modelos.
- Abaratar inferencia en tareas de razonamiento: usar el emisor grande solo en el prefill y delegar la generación al receptor de 1.7B, reduciendo el coste del decodificado autorregresivo.
- Reproducibilidad de resultados: el `config.json` incluye identidad del experimento, dependencias, mapeo de tensores, nombre de fichero de pesos y SHA-256, lo que permite verificar la integridad del export.
- Estudio de atención híbrida: analizar cómo se comportan los puentes lineales cuando los backbones combinan mecanismos de atención, un caso soportado explícitamente por el método.
- Docencia y divulgación: ilustrar con un caso real los riesgos de atribuir mejoras de rendimiento a la transferencia entre modelos sin controles adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio distribuye pesos de inferencia históricos sin puntuaciones, y el autor indica explícitamente que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out.

## Requisitos de hardware

- VRAM estimada para el puente: no disponible con precisión; el repo ocupa 0.9 GB, pero el consumo real depende de los backbones.
- El emisor Qwen3-235B-A22B-FP8 requiere hardware de clase servidor (múltiples GPU de alta gama, p. ej. H100 o A100, con memoria agregada suficiente para 235B en FP8); no cabe en GPU de consumo.
- El receptor Qwen3-1.7B sí cabe en GPU de consumo (RTX 4090, 3090 o inferiores con cuantización), pero forma parte de un pipeline que exige ambos backbones.
- Despliegue: no se anuncia compatibilidad con vLLM, llama.cpp, Ollama o TGI; la carga requiere el loader del proyecto PLatour (`platour-exps download --experiment 1`) y no `AutoModel.from_pretrained` ni PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-ARC-C | Puente ligero + backbones 235B/1.7B | No disponible | Transferencia prefill-a-autorregresivo con controles PACT-Check | Apache-2.0 | Hub, cargador propio |
| Qwen3-235B-A22B | 235B totales, 22B activos (MoE) | No disponible en la información | LLM generalista con modo thinking | No disponible en la información | Hub |
| Qwen3-1.7B | 1.7B | No disponible en la información | LLM pequeño generalista | No disponible en la información | Hub |

No se dispone de datos de benchmark que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no incluye puntuaciones de benchmark ni garantiza un protocolo de selección de checkpoint imparcial; el autor exige evaluación independiente y revisión de procedencia antes de usar los artefactos para nuevas afirmaciones comparativas.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no están verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export no es estado reanudable de optimizador/RNG; es únicamente un export de inferencia.
- No es cargable directamente con `AutoModel.from_pretrained` ni PEFT; requiere el loader del proyecto y la descarga separada de los backbones.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Uso comercial: la licencia del export es Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse.
- Cero descargas y cero likes en el momento de la consulta; sin pipeline declarado ni idiomas especificados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-ARC-C)
- [Paper: On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer](https://arxiv.org/html/2611.06976)
- [arXiv abstract](https://arxiv.org/abs/2611.06976)
- [Colección PLatour en Hugging Face](https://huggingface.co/collections/zen-E/platour)
- [Dataset zen-E/PLatour-Qwen3-Data](https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data)
- [Modelo base emisor: Qwen/Qwen3-235B-A22B-FP8](https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8)
- [Modelo base receptor: Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Blog de Qwen3 en Zen](https://zenlm.org/blog/qwen3/)
