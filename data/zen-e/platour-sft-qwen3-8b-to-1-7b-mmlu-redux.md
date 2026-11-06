# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-MMLU-Redux

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-MMLU-Redux es un artefacto de investigación publicado por el usuario zen-E en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un conjunto de pesos de puente (bridges) entrenados dentro del marco PLatour, que explora la transferencia entre modelos de distinto tamano conocida como PACT (Prefill-to-Autoregressive Cross-model Transfer). En este esquema, un modelo emisor grande (Qwen3-8B) codifica el prompt y entrega representaciones ocultas, mientras que un modelo receptor pequeno (Qwen3-1.7B) genera la respuesta de forma independiente.

El repositorio corresponde al experimento 08 del proyecto, centrado en la tarea mmlu_redux. Los backbones emisor y receptor permanecen congelados y deben descargarse por separado; este repositorio solo contiene las proyecciones lineales ligeras que conectan ambos modelos. El entrenamiento se realiza mediante recompensas de tarea partiendo de proyecciones inicializadas a cero.

Es relevante como material de investigación reproducible sobre comunicacion entre modelos, no como modelo listo para produccion. El propio autor advierte que el repositorio distribuye pesos de inferencia historicos sin puntuaciones de benchmark asociadas y que no debe interpretarse como un modelo directamente cargable con `AutoModel.from_pretrained` ni con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) entre dos backbones transformer congelados (Qwen3-8B emisor y Qwen3-1.7B receptor) |
| Parametros totales | no disponible (el repo ocupa 0.9 GB; los backbones no se incluyen) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors con cargador propio (`custom-loader`, `platour-exps`) |

## Arquitectura y entrenamiento

El metodo PLatour entrena puentes lineales ligeros entre backbones congelados, partiendo de proyecciones inicializadas a cero y optimizando con recompensas de tarea. El diseno soporta modelos con atencion hibrida. La contribucion central del trabajo es PACT: el emisor grande procesa el prompt y suministra representaciones ocultas que el receptor pequeno utiliza para generar, sin que el receptor dependa del emisor en tiempo de decodificacion.

El paper asociado (arXiv 2611.06976) introduce ademas PACT-Check, un conjunto de controles experimentales: Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver. Estos controles sirven para verificar si las mejoras dependen realmente de informacion util del emisor o si pueden explicarse por mera adaptacion del receptor. El experimento 08 de este repositorio se entrena sobre mmlu_redux. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO mas alla del uso de recompensas de tarea.

## Capacidades

- No es un modelo autonomo: no genera texto por si mismo sin los backbones emisor y receptor descargados por separado.
- Actua como capa de transferencia de representaciones entre Qwen3-8B (emisor) y Qwen3-1.7B (receptor).
- Soporta el protocolo de evaluacion PACT-Check con sus cuatro controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver).
- Orientado a la tarea de evaluacion mmlu_redux; no se documentan otras capacidades de tarea.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre comunicacion entre modelos: permite reproducir el experimento 08 del proyecto PLatour y analizar como un emisor de 8B transfiere informacion a un receptor de 1.7B en tareas de conocimiento tipo MMLU.
- Validacion de metodologia PACT: util para ejecutar los controles de PACT-Check y comprobar si las mejoras observadas se deben a informacion util del emisor o a adaptacion del receptor.
- Estudio de eficiencia computacional: evaluar si un receptor pequeno puede igualar parcialmente el rendimiento de un emisor grande en tareas de conocimiento, reduciendo coste de decodificacion.
- Reproducibilidad academica: el repositorio incluye identidad de experimento, mapeo de tensores, nombre de fichero de pesos y SHA-256, lo que facilita auditorias de resultados.
- Analisis de transferencia cross-model con atencion hibrida: el metodo soporta modelos de atencion hibrida, lo que permite estudiar este tipo de arquitecturas en escenarios de transferencia.
- Base para extensiones del metodo: investigadores pueden partir de estas proyecciones para experimentar con nuevos pares emisor-receptor o nuevas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el repositorio distribuye pesos de inferencia historicos sin puntuaciones de benchmark y que no se hace ninguna afirmacion sobre el protocolo de seleccion de checkpoints ni sobre rendimiento imparcial en held-out. Se requiere evaluacion independiente y revision de procedencia antes de usar estos artefactos para sustentar nuevas afirmaciones comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el repositorio de puentes ocupa 0.9 GB, pero la inferencia requiere cargar simultaneamente Qwen3-8B (emisor) y Qwen3-1.7B (receptor).
- Para Qwen3-8B en precision completa se necesitan aproximadamente 16 GB de VRAM solo para pesos; en cuantizacion de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones generales para un modelo de 8B, no publicadas por el autor).
- Para Qwen3-1.7B en precision completa, aproximadamente 3.5 GB de VRAM; en cuantizacion de 4 bits, en torno a 1-1.5 GB.
- GPU recomendadas: no especificadas por el autor. Para ejecutar ambos backbones en paralelo se recomienda al menos una GPU con 24 GB (RTX 4090, A10G, L4) en cuantizacion, o A100/H100 de 40-80 GB en precision completa.
- Despliegue: no se soporta con vLLM, llama.cpp, Ollama ni TGI de forma estandar. Requiere el cargador propio del proyecto (`platour-exps download --experiment 8`) y los backbones descargados por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-MMLU-Redux | Puentes ligeros (0.9 GB) sobre backbones 8B+1.7B | no disponible | Sin benchmarks publicados | Apache-2.0 | Hugging Face, cargador propio |
| zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux | Puentes ligeros sobre backbones 235B+1.7B | no disponible | Sin benchmarks publicados | Apache-2.0 | Hugging Face, cargador propio |
| Qwen/Qwen3-8B | 8B | no disponible en la informacion | Benchmark estandar del modelo base | Apache-2.0 | Hugging Face, Transformers |
| Qwen/Qwen3-1.7B | 1.7B | no disponible en la informacion | Benchmark estandar del modelo base | Apache-2.0 | Hugging Face, Transformers |

## Limitaciones y advertencias

- No es un modelo autonomo: no puede cargarse con `AutoModel.from_pretrained` ni con PEFT; requiere el cargador del proyecto PLatour y los backbones separados.
- Sin benchmarks: el autor no adjunta resultados de evaluacion y advierte que no debe inferirse rendimiento a partir de este repositorio.
- Procedencia no verificada: las revisiones exactas de los backbones usadas en la ejecucion historica no han sido verificadas de forma independiente y no deben inferirse de la revision mas reciente del Hub.
- Los pesos son de inferencia, no estado de reanudacion de optimizador/RNG.
- Sesgos: no documentados en la informacion disponible; al heredar los backbones Qwen3, podrian aparecer sesgos propios de dichos modelos.
- Riesgo de alucinacion: no evaluado en este artefacto; depende del receptor Qwen3-1.7B y de la calidad de la transferencia.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: el export es Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- Para evaluacion de programacion se requiere ademas el juez oficial aislado, no incluido en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-MMLU-Redux
- Variante con emisor 235B: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux
- Paper (arXiv 2611.06976): https://arxiv.org/abs/2611.06976
- Version HTML del paper: https://arxiv.org/html/2611.06976
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
