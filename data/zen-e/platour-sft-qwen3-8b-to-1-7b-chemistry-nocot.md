# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-NoCoT

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-NoCoT es un artefacto de investigación publicado por el usuario zen-E en Hugging Face. No es un modelo entrenado de forma convencional, sino un conjunto de puentes lineales (bridges) que implementan el método PACT (Prefill-to-Autoregressive Cross-model Transfer): un modelo emisor grande (Qwen3-8B) codifica el prompt y entrega representaciones ocultas, mientras que un receptor pequeño (Qwen3-1.7B) genera la respuesta de forma independiente. Los backbones permanecen congelados y solo se entrenan proyecciones lineales ligeras entre ambos.

Este repositorio concreto corresponde al experimento 09 del proyecto, sobre el dominio de química y sin cadena de pensamiento (chemistry_no_cot). El peso del repo es de unos 0.9 GB y contiene únicamente las proyecciones del puente, no los modelos base, que deben descargarse por separado. Está pensado para reproducir experimentos del paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv 2611.06976).

Su relevancia es metodológica: explora si la información del emisor mejora realmente la tarea del receptor o si las ganancias provienen simplemente de la adaptación del receptor, mediante controles como Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver (PACT-Check). El autor advierte explícitamente de que el repositorio no incluye puntuaciones de benchmarks ni garantiza el protocolo de selección de checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridges) entre dos transformers congelados: emisor Qwen3-8B y receptor Qwen3-1.7B; soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo contiene solo las proyecciones del puente; los backbones son Qwen3-8B y Qwen3-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors, con cargador personalizado (`custom-loader`); no cargable vía `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre dos backbones congelados, partiendo de proyecciones inicializadas a cero y optimizando con recompensas de tarea. El emisor (Qwen3-8B) procesa el prompt en fase de prefill y suministra sus representaciones ocultas; el receptor (Qwen3-1.7B) genera la respuesta de forma autorregresiva e independiente. El diseño contempla modelos con atención híbrida. Este checkpoint corresponde al experimento 09 sobre el subconjunto chemistry_no_cot del dataset zen-E/PLatour-Qwen3-Data.

El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si las mejoras dependen de información útil del emisor o si pueden surgir solo por adaptación del receptor. El autor indica que las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub. No se detalla el número de tokens de entrenamiento ni la composición completa del dataset en la información disponible.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por las representaciones del emisor Qwen3-8B.
- Especialización en el dominio de química sin cadena de pensamiento (chemistry_no_cot), según la identidad del experimento.
- Transferencia de información entre modelos de distinto tamaño a través de proyecciones lineales entrenadas.
- Soporte de modelos con atención híbrida en el diseño del método.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en el repo).

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el experimento 09 del paper para estudiar si la información del emisor aporta ventaja real sobre la adaptación del receptor, usando los controles de PACT-Check.
- Evaluación de PACT-Check: ejecutar Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para aislar el efecto del puente frente a la mera adaptación.
- Estudio de eficiencia computacional: analizar si un receptor de 1.7B asistido por un emisor de 8B congelado se aproxima al rendimiento de un modelo mayor en tareas de química.
- Reproducción de resultados académicos: descargar los backbones por separado y ejecutar el comando de evaluación del proyecto con las entradas de tarea firmadas.
- Análisis de dominios especializados: emplear el subconjunto chemistry_no_cot para examinar el comportamiento del puente en razonamiento químico sin cadena de pensamiento.
- Docencia y formación: ilustrar en cursos de investigación cómo se diseñan y controlan experimentos de comunicación entre modelos, dado el énfasis del repo en procedencia y reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones y que se requiere evaluación independiente y revisión de procedencia antes de usar estos artefactos para respaldar nuevas afirmaciones comparativas.

## Requisitos de hardware

- El repo (0.9 GB) contiene solo las proyecciones del puente; es necesario descargar por separado Qwen3-8B y Qwen3-1.7B.
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un backbone de 8B en FP16 requiere del orden de 16 GB solo para pesos, y uno de 1.7B en FP16 alrededor de 3.4 GB; a ello se suman caché KV y overhead del runtime.
- GPU recomendadas: no especificadas en la información; por tamaño de los backbones, GPUs de 24 GB o más (RTX 4090, A100, H100) resultan razonables para el emisor en precisión nativa.
- Modelos consumer: el receptor de 1.7B podría caber en GPUs consumer de 8-12 GB en cuantización; el emisor de 8B requeriría cuantización agresiva o descarga a CPU. No confirmado por el autor.
- Despliegue: no se anuncia compatibilidad con vLLM, llama.cpp, Ollama o TGI. La carga requiere el cargador del proyecto PLatour (`platour-exps download --experiment 9`) y su `config.json`, con identidad de experimento, dependencias, mapeo de tensores, nombre de fichero de pesos y SHA-256.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-NoCoT | Puentes entre 8B (emisor) y 1.7B (receptor) | No disponible | Transferencia prefill-a-autorregresivo con backbones congelados | Apache-2.0 | Hugging Face, cargador personalizado |
| Qwen/Qwen3-8B | 8B | No disponible en la información | LLM denso de generación de texto | Ver licencia upstream de Qwen | Hugging Face, Transformers |
| Qwen/Qwen3-1.7B | 1.7B | No disponible en la información | LLM denso de generación de texto | Ver licencia upstream de Qwen | Hugging Face, Transformers |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar los backbones Qwen3-8B y Qwen3-1.7B por separado y usar el cargador del proyecto; no funciona con `AutoModel.from_pretrained` ni PEFT.
- Sin benchmarks publicados: el autor declara que el export no adjunta resultados y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out.
- Procedencia no verificada: las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- No es estado de reanudación de optimizador/RNG: es un export de inferencia, no un checkpoint de entrenamiento reanudable.
- Evaluación de programación: requiere el juez oficial aislado, según la documentación del proyecto.
- Sesgos y alucinaciones: no documentados en la información disponible; al tratarse de un artefacto de investigación sin evaluación independiente, el riesgo de comportamiento no caracterizado es alto.
- Idiomas y contexto: no declarados; dependen de los backbones y de la configuración del proyecto.
- Licencia: el export usa Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- Uso previsto: investigación comparativa; no recomendado como modelo de producción sin evaluación independiente previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-NoCoT
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
