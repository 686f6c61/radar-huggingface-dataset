# zen-E/PLatour-Qwen3.5-397B-FP8-to-4B-DeepCoder

## Resumen

PLatour-Qwen3.5-397B-FP8-to-4B-DeepCoder es un checkpoint de puentes de proyección (bridge projections) publicado por el usuario zen-E dentro del proyecto de investigación PLatour. No se trata de un modelo completo, sino de un conjunto de pesos ligeros que conectan dos backbones congelados: un emisor grande (Qwen/Qwen3.5-397B-A17B-FP8) que codifica el prompt y un receptor pequeño (Qwen/Qwen3.5-4B) que genera la respuesta de forma independiente. El repo ocupa 1,3 GB, coherente con un artefacto de puentes y no con pesos completos de un modelo de 397B.

El trabajo implementa lo que sus autores denominan Prefill-to-Autoregressive Cross-model Transfer (PACT): entrenar puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero y soportando modelos de atención híbrida. El checkpoint corresponde al "experimento 25" del proyecto, orientado a tareas de código (deepcoder), y se apoya en el dataset zen-E/PLatour-DeepCoder-Data.

Su relevancia es metodológica: propone una vía para aprovechar la capacidad de representación de un modelo grande sin pagar su coste de decodificación, delegando la generación en un modelo pequeño. El paper asociado (arXiv:2611.06976) introduce además PACT-Check con controles de transferencia ficticia, transferencia irrelevante, autocomunicación y receptor entrenado, para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineales entre dos backbones transformer congelados (emisor Qwen3.5-397B-A17B-FP8, receptor Qwen3.5-4B); soporta atención híbrida |
| Parametros totales | No disponible (el repo de 1,3 GB contiene solo los puentes, no los backbones) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el emisor de referencia se distribuye en FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con custom-loader (requiere `platour_api`; no cargable con `AutoModel.from_pretrained`) |

## Arquitectura y entrenamiento

El método PACT separa el cómputo en dos fases: un emisor grande procesa el prompt y produce representaciones ocultas, y un receptor pequeño genera la respuesta de forma autorregresiva e independiente. Entre ambos se insertan puentes de proyección lineales, inicializados a cero y entrenados con recompensas de tarea mientras los backbones permanecen congelados. El diseño contempla modelos con atención híbrida, lo que permite aplicar el esquema a familias como Qwen3.5.

El entrenamiento de este checkpoint concreto (experimento 25) se realizó sobre la tarea deepcoder con el dataset zen-E/PLatour-DeepCoder-Data. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO; esa información no está disponible. La innovación destacable es el propio marco PACT y su batería de controles PACT-Check, que evalúan si la mejora depende de la información del emisor o puede explicarse por adaptación del receptor.

## Capacidades

- Generación de código: el checkpoint está orientado a la tarea deepcoder y se evalúa por defecto sobre LCB v6, HumanEval y MBPP.
- Generación de texto autorregresiva delegada en el receptor Qwen3.5-4B.
- Aprovechamiento de representaciones de un emisor de 397B sin ejecutar su decodificación.
- Integración vía API de proyecto (`load_session`, `system.generate`) con backend vLLM.
- Evaluación reproducible con juez de código en contenedores Docker aislados.
- Soporte de mensajes multi-turno en el formato `messages` de rol/contenido.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Generación de funciones y snippets de código: el sistema recibe un prompt de programación, el emisor de 397B codifica la intención y el receptor de 4B produce la implementación, útil para prototipado rápido de utilidades acotadas.
- Investigación en transferencia entre modelos: sirve para reproducir el experimento 25 y contrastar hipótesis sobre comunicación cross-model con los controles PACT-Check.
- Evaluación de pipelines de código: el comando `platour-exps evaluate` ejecuta LCB v6, HumanEval y MBPP con juez en Docker, adecuado para medir regresiones de forma reproducible.
- Estudio de eficiencia computacional: permite comparar el coste de decodificar con un receptor de 4B frente a hacerlo con el emisor de 397B manteniendo parte de la calidad.
- Docencia y divulgación: el ejemplo de generación con límite de 256 tokens sirve para demostrar arquitecturas emisor-receptor en entornos controlados.
- Base para experimentos propios: los puentes entrenados con recompensas de tarea pueden reutilizarse como punto de partida para otras tareas de código dentro del marco PLatour.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación por defecto puntúa LCB v6, HumanEval y MBPP mediante un juez de código, pero no incluye cifras de resultados.

## Requisitos de hardware

- El checkpoint de puentes ocupa 1,3 GB, pero la inferencia requiere cargar simultáneamente el emisor Qwen3.5-397B-A17B-FP8 y el receptor Qwen3.5-4B, por lo que la VRAM efectiva la determina el emisor.
- El grupo de colocación por defecto para la evaluación es de 4 GPU por réplica; `--n-gpu 1` es incompatible con ese valor por defecto.
- Con `--n-gpu 8` se ejecutan 2 réplicas independientes de 4 GPU cada una con shards de preguntas disjuntos.
- No se especifican GPU concretas (A100, H100, RTX 4090) ni si el conjunto cabe en GPU de consumo; no disponible.
- Despliegue mediante el proyecto PLatour con backend vLLM; requiere Linux con CUDA y Python 3.11.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3.5-397B-FP8-to-4B-DeepCoder | Puentes sobre emisor 397B + receptor 4B | No disponible | Transferencia cross-model (PACT) para código | Apache 2.0 | HF, requiere proyecto PLatour |
| Qwen/Qwen3.5-4B (receptor) | 4B | No disponible | Modelo denso estándar | No disponible | HF |
| Qwen/Qwen3.5-397B-A17B-FP8 (emisor) | 397B (A17B) | No disponible | MoE en FP8 | No disponible | HF |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: contiene solo puentes de proyección y no puede cargarse con `AutoModel.from_pretrained`; exige el proyecto PLatour y ambos backbones.
- La generación devuelve texto y no ejecuta el código producido; la validación requiere el juez en contenedores Docker.
- El ejemplo de la model card usa 256 tokens como demostración y no reproduce el protocolo de benchmark publicado.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática; no disponible.
- La licencia Apache 2.0 cubre el checkpoint, pero el uso comercial depende también de las licencias de los backbones Qwen referenciados.
- El checkpoint tiene 68 descargas y 0 likes, con fecha de creación en noviembre de 2026; madurez y soporte comunitario limitados.
- Requiere entorno Linux con CUDA, Python 3.11 y Docker para la evaluación con juez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3.5-397B-FP8-to-4B-DeepCoder
- Paper: https://arxiv.org/html/2611.06976
- Repositorio de código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Emisor: https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8
- Receptor: https://huggingface.co/Qwen/Qwen3.5-4B
