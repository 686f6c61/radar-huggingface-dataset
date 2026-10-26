# YOxuanyiLI/DeepSeek-V3

## Resumen

DeepSeek-V3 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek-AI. Con 671B parámetros totales y 37B activados por token según la model card original, combina las arquitecturas DeepSeekMoE y Multi-head Latent Attention (MLA) ya validadas en DeepSeek-V2, e incorpora dos innovaciones propias: una estrategia de balanceo de carga de expertos sin pérdida auxiliar (auxiliary-loss-free) y un objetivo de entrenamiento de predicción multi-token (MTP).

El modelo se preentrenó sobre 14,8 billones de tokens con un framework de entrenamiento en precisión mixta FP8, siendo el primer caso documentado de entrenamiento FP8 a esta escala. El coste total de entrenamiento declarado es de 2,788M de horas de GPU H800 (2,664M en preentrenamiento y 0,1M en las etapas posteriores). Tras el preentrenamiento se aplicaron etapas de Supervised Fine-Tuning y Reinforcement Learning, e incluye una destilación de capacidades de razonamiento (chain-of-thought largo) desde un modelo de la serie DeepSeek-R1.

La ficha que nos ocupa, sin embargo, no es el repositorio oficial: se trata de una réplica publicada por el usuario `YOxuanyiLI`, con 0 descargas, 0 likes, sin licencia declarada y sin idiomas declarados. El peso real de los safetensors del repositorio es de 684.489.845.504 parámetros (~684,5B), cifra superior a los 671B anunciados, presumiblemente por la inclusión de los módulos MTP en el checkpoint. El repositorio ocupa 688,6 GB y requiere `trust_remote_code=True` por el uso de código custom (`deepseek_v3`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeekMoE) con Multi-head Latent Attention (MLA) y módulos de predicción multi-token (MTP) |
| Parámetros totales | 684.489.845.504 (~684,5B) según los safetensors del repositorio; 671B según la model card del autor original |
| Parámetros activos | 37B por token |
| Longitud de contexto | 128K tokens (la tabla de la model card disponible aparece truncada; el dato procede de la documentación oficial del modelo) |
| Tipos de cuantización | Pesos publicados en FP8 (block-wise). El repositorio no incluye otras cuantizaciones |
| Idiomas soportados | No disponible en el repositorio (ni en tags ni en la model card accesible) |
| Licencia | No disponible en este repositorio. El modelo original se distribuye bajo DeepSeek Model License Agreement, con el código bajo licencia MIT |
| Formato de pesos | safetensors (FP8), con `custom_code` y arquitectura `deepseek_v3`; requiere `trust_remote_code=True` |
| Pipeline | text-generation |
| Tamaño del repositorio | 688,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

DeepSeek-V3 es un transformer decoder-only con mezcla de expertos. Cada token activa 37B de los 671B parámetros, lo que desacopla la capacidad del modelo del coste computacional por token: el cómputo se aproxima al de un modelo denso de ~37B, mientras que el coste de memoria corresponde a un modelo de 671B. La atención usa Multi-head Latent Attention (MLA), que comprime las claves y valores en un espacio latente de baja dimensión y reduce de forma notable el tamaño de la caché KV en contextos largos, algo crítico a 128K tokens. El enrutamiento de expertos emplea una estrategia de balanceo de carga sin pérdida auxiliar, que evita la degradación de calidad que introduce el término auxiliar clásico, y un objetivo de predicción multi-token (MTP), que además puede reutilizarse como decodificación especulativa para acelerar la inferencia.

El preentrenamiento se realizó sobre 14,8T tokens con un framework de precisión mixta FP8, con solapamiento casi total de cómputo y comunicación en el entrenamiento MoE entre nodos. Según la model card, el proceso fue estable, sin picos de pérdida irrecuperables ni rollbacks. La etapa de post-entrenamiento incluye SFT y RL, más una destilación de los patrones de verificación y reflexión de un modelo de la serie DeepSeek-R1, manteniendo control explícito sobre el estilo y la longitud de las respuestas. El desglose completo de la composición del dataset de preentrenamiento y de los datos de RLHF/DPO no está disponible en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno en formato instruct, según el tag `conversational`.
- Razonamiento con patrones de verificación y reflexión heredados por destilación desde DeepSeek-R1, con control de longitud y estilo de salida.
- Generación de código y matemáticas: es una de las áreas que la model card declara evaluadas, aunque los resultados numéricos no están accesibles en el extracto disponible.
- Soporte de function calling / tool calling: no confirmado explícitamente en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información proporcionada.
- Capacidades multilingües: el modelo original se presenta como multilingüe, pero el listado concreto de idiomas no está disponible.
- Sin capacidades de visión ni audio (modelo estrictamente de texto).
- Decodificación especulativa nativa mediante los módulos MTP.

## Casos de uso

- Asistentes conversacionales de dominio técnico: la ventana de 128K tokens permite mantener hilos largos con documentación, historiales de incidencias o código completo dentro del contexto sin trocear.
- Generación y revisión de código en pipelines de integración continua: el modelo puede recibir un diff junto con el resto del módulo afectado y generar una revisión contextualizada; requiere un despliegue multi-GPU dedicado.
- Razonamiento matemático y analítico por lotes: tareas de cálculo, verificación de derivaciones o extracción estructurada de informes, aprovechando el estilo de reflexión destilado de R1 y ejecutándolo en modo offline.
- Análisis de documentación extensa: contratos, normativa o papers de decenas de miles de tokens que se cargan en una sola pasada de contexto, sin recuperación fragmentada.
- Destilación y generación de datos sintéticos: usar el modelo como profesor para producir corpus de alta calidad para modelos más pequeños, gracias a su modo instruct y a su control de longitud de salida.
- Investigación en eficiencia de inferencia: los módulos MTP lo convierten en un banco de pruebas para decodificación especulativa y para evaluar el equilibrio entre 684B de memoria y 37B de cómputo activo.
- Evaluación comparativa de arquitecturas MoE: servir como referencia frente a modelos densos de tamaño comparable en estudios de escalado y de enrutamiento de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original referencia una figura de benchmarks (`figures/benchmark.png`) y afirma que el modelo supera a otros modelos open source y alcanza un rendimiento comparable a los principales modelos cerrados, pero el extracto accesible no incluye la tabla con cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, por lo que no se reproducen números.

## Requisitos de hardware

- VRAM para inferencia en FP8 (formato publicado): ~688 GB solo para pesos, más caché KV. Mínimo práctico de ~800 GB agregados.
- VRAM en BF16: ~1,37 TB de pesos; requiere conversión y un clúster mayor.
- Cuantización INT4/GGUF Q4: ~350-400 GB de pesos; sigue sin caber en una GPU individual.
- GPU recomendadas: 8×H200 (141 GB) en FP8, o 16×H100/H800 (80 GB) con tensor parallelism. Para BF16, 16×H200 o 32×H100.
- GPU de consumo: no viable. Ni siquiera en cuantizaciones agresivas de 2-4 bits cabe en una RTX 4090 (24 GB) ni en un rig de 4×RTX 4090.
- Opciones de despliegue: vLLM y SGLang son las rutas habituales para FP8 con tensor parallelism; TGI y TensorRT-LLM también son opciones. `transformers` con `trust_remote_code=True` funciona pero con rendimiento muy inferior. llama.cpp puede cargar versiones GGUF cuantizadas, pero el offloading a disco/CPU hace la latencia poco práctica. Ollama no es una vía realista para este tamaño.
- Latencia y throughput: no disponibles como cifra publicada. Cualitativamente, la inferencia está limitada por memoria (688 GB de pesos a mover por token) y no por cómputo (37B activos), de modo que el ancho de banda agregado y el número de GPUs determinan el throughput.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V3 (este repositorio, réplica) | 684,5B / 37B | 128K | No declarada en el repo | Réplica de terceros, 0 descargas |
| DeepSeek-V3 (repositorio oficial `deepseek-ai`) | 671B / 37B | 128K | DeepSeek Model License Agreement | Repositorio oficial en Hugging Face |
| DeepSeek-V3.1-Base | No disponible en la información | No disponible en la información | No disponible en la información | Repositorio oficial en Hugging Face |
| DeepSeek-R1 | 671B / 37B | 128K | MIT | Repositorio oficial en Hugging Face |
| Llama 3.1 405B | 405B densos | 128K | Llama 3.1 Community License | Repositorio oficial en Hugging Face |

Comparativamente, DeepSeek-V3 ofrece más parámetros totales que Llama 3.1 405B pero solo activa 37B por token, lo que reduce el coste computacional de inferencia a cambio de exigir mucha más memoria. Frente a DeepSeek-R1, la diferencia principal es el modo de razonamiento: R1 está orientado a chain-of-thought largo con licencia MIT, mientras que V3 busca un equilibrio entre razonamiento y respuestas concisas bajo una licencia de modelo con cláusulas adicionales. Los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: `YOxuanyiLI/DeepSeek-V3` es una réplica de terceros con 0 descargas y 0 likes. No hay garantía de que los pesos coincidan bit a bit con el checkpoint oficial; conviene verificar hashes o descargar desde `deepseek-ai/DeepSeek-V3`.
- Licencia no declarada en el repositorio: no se puede asumir ningún derecho de uso comercial a partir de esta ficha. El modelo original se rige por el DeepSeek Model License Agreement, que establece condiciones de atribución y restricciones de uso; el código asociado es MIT.
- Riesgo de alucinación: es un modelo de lenguaje generativo sin mecanismo de verificación factual integrado; en dominios especializados requiere validación externa.
- Sesgos: no hay información disponible sobre la composición del dataset ni sobre evaluaciones de sesgo en la documentación accesible.
- Idiomas: el listado de idiomas soportados no está disponible; el rendimiento fuera de inglés y chino no está documentado en este repositorio.
- Contexto: la ventana de 128K implica un consumo de caché KV significativo pese a la compresión de MLA; con tensor parallelism el coste se reparte, pero sigue siendo un factor limitante en despliegues ajustados.
- Requisito de `trust_remote_code=True`: la arquitectura `deepseek_v3` y el código custom asociado se ejecutan en local; conviene auditar el código del repositorio antes de cargarlo en entornos de producción.
- Inferencia: el tamaño descarta cualquier uso en hardware de consumo; los costes operativos en clúster son elevados y deben presupuestarse antes de adoptarlo.
- Los módulos MTP incrementan el recuento de parámetros respecto a los 671B anunciados; algunas herramientas de terceros pueden fallar al inferir el tamaño o al cargar el checkpoint.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/YOxuanyiLI/DeepSeek-V3
- Repositorio oficial del modelo: https://huggingface.co/deepseek-ai/DeepSeek-V3
- Variante base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Base
- Repositorio GitHub oficial: https://github.com/deepseek-ai/DeepSeek-V3
- Paper técnico: https://github.com/deepseek-ai/DeepSeek-V3/blob/main/DeepSeek_V3.pdf
- Licencia del código (MIT): https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-CODE
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-MODEL
- Página del modelo en arXiv: https://arxiv.org/abs/2412.19437
- Chat oficial: https://chat.deepseek.com/
- Organización en Hugging Face: https://huggingface.co/deepseek-ai
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Listado de modelos open source de DeepSeek: https://deepseekmodel.com/en/deepseek-models
