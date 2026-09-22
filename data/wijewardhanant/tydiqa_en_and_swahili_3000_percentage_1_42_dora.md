# WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_42_DoRA

## Resumen

El modelo `WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_42_DoRA` es un adaptador de ajuste fino publicado en HuggingFace por el usuario WijewardhanaNT. No se trata de un modelo completo, sino de un adaptador PEFT (librería `peft`, versión 0.17.1) que se aplica sobre el modelo base `meta-llama/Llama-3.1-8B`. El nombre del repositorio indica que el ajuste se realizó sobre el conjunto de datos TyDiQA, en las porciones de inglés y suajili, con un subconjunto de 3000 ejemplos y un porcentaje de entrenamiento del 1,42 %, empleando la técnica DoRA (Weight-Decomposed Low-Rank Adaptation) en lugar de LoRA estándar.

La relevancia de esta ficha es limitada y hay que ser explícito al respecto: la model card del autor es la plantilla por defecto de HuggingFace sin rellenar, con todos los campos marcados como "[More Information Needed]". No hay descripción de la tarea objetivo, ni hiperparámetros, ni datos de evaluación, ni licencia declarada. El repositorio ocupa 0,1 GB, un tamaño coherente con un adaptador de bajo rango sobre un modelo de 8B, y acumula 6 descargas y 0 "likes" en el momento de la consulta.

Se trata, por tanto, de un artefacto de investigación incipiente o de un experimento académico, probablemente orientado a comparar DoRA frente a LoRA en una tarea de question answering multilingüe. Cualquier uso en producción requeriría una validación propia completa, ya que no existe documentación técnica publicada por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA sobre transformer decoder-only (Llama 3.1 8B); el adaptador en sí no define arquitectura propia |
| Parámetros totales | No disponible (el modelo base Llama 3.1 8B tiene 8.030 millones de parámetros); el repositorio ocupa 0,1 GB, compatible con un adaptador de bajo rango, pero el número exacto no está declarado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Heredada del modelo base Llama 3.1 8B: 131.072 tokens; no verificada ni declarada para el adaptador |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible en la model card; el identificador del repositorio sugiere inglés y suajili como idiomas de ajuste |
| Licencia | No disponible para el adaptador (el modelo base se distribuye bajo Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | meta-llama/Llama-3.1-8B |
| Librería | peft 0.17.1 |
| Tarea declarada | text-generation |
| Descargas / likes | 6 / 0 |
| Fecha de creación (metadatos) | 22 de septiembre de 2026 |
| Fecha de actualización (metadatos) | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto es un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) aplicado sobre Llama 3.1 8B. DoRA descompone cada matriz de pesos preentrenada en un componente de magnitud y un componente de dirección, y aplica la actualización de bajo rango únicamente sobre la dirección, mientras la magnitud se entrena como un vector independiente. Este diseño busca acercar el comportamiento del ajuste de bajo rango al de un fine-tuning completo, a costa de un pequeño incremento en el número de parámetros entrenables respecto a LoRA. El modelo base sobre el que se aplica es un transformer decoder-only con 32 capas, dimensión oculta de 4096, 32 cabezas de atención y 8 cabezas KV (Grouped Query Attention), vocabulario de 128.256 tokens y entrenamiento previo sobre del orden de 15 billones de tokens según la documentación de Meta.

En cuanto al entrenamiento del adaptador, la información disponible es prácticamente nula. El nombre del repositorio apunta a un ajuste sobre TyDiQA (un benchmark de question answering extractivo en 11 idiomas, con anotaciones tipológicamente diversas) restringido a inglés y suajili, con 3000 ejemplos y un porcentaje del 1,42 % del conjunto. No se declaran hiperparámetros (rango, alpha, dropout, learning rate, épocas, precisión), ni composición exacta del dataset, ni si hubo una fase posterior de RLHF o DPO, ni métricas de evaluación. La model card no incluye ninguna sección completada más allá de las versiones de framework (PEFT 0.17.1).

## Capacidades

- Generación de texto condicionada por el modelo base Llama 3.1 8B, incluyendo las capacidades heredadas de ese modelo (redacción, resumen, razonamiento básico, generación de código).
- Question answering extractivo, presumiblemente sobre el formato y la distribución de TyDiQA, dado el nombre del repositorio; no confirmado por el autor.
- Cobertura potencial de inglés y suajili según el identificador del modelo; el suajili no figura entre los idiomas oficialmente soportados por Llama 3.1, por lo que la calidad dependería del ajuste.
- Soporte de tool calling / function calling: heredable del modelo base solo si se fusiona con una versión Instruct; el adaptador no declara ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no declarado ni evaluado.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades multilingües más allá de los dos idiomas indicados en el nombre: no disponibles.

Advertencia: la model card no documenta ninguna de estas capacidades de forma explícita. Se listan como inferencias a partir del modelo base y del nombre del repositorio, no como hechos verificados.

## Casos de uso

- Question answering extractivo sobre documentos en inglés y suajili: el adaptador se aplicaría sobre Llama 3.1 8B para localizar la respuesta a una pregunta dentro de un pasaje, que es exactamente el formato de TyDiQA. Sería el uso más alineado con el nombre del repositorio, aunque requiere validación propia porque no hay métricas publicadas.
- Investigación comparativa sobre técnicas PEFT: permite contrastar DoRA frente a LoRA con el mismo modelo base, el mismo dataset y el mismo presupuesto de cómputo, siempre que se localicen los adaptadores LoRA equivalentes del mismo autor o se reproduzcan.
- Prototipado académico con recursos limitados: al ser un adaptador de 0,1 GB, permite experimentar con un modelo de 8B en una única GPU consumer sin necesidad de almacenar ni servir múltiples copias completas del modelo base.
- Sistemas de extracción de respuestas en corpus periodísticos o administrativos en inglés: integrado en un pipeline de tipo RAG, el adaptador podría emplearse como lector final que extrae la respuesta de los fragmentos recuperados, aunque su ventaja frente al modelo base sin adaptar es desconocida.
- Asistente conversacional en suajili para atención al cliente: uso hipotético que exige una evaluación previa de fluidez y fidelidad, dado que el suajili no está entre los idiomas oficiales de Llama 3.1 y el ajuste se realizó con un subconjunto muy reducido de datos.
- Punto de partida para un ajuste posterior específico de dominio: el adaptador puede servir como inicialización de un segundo ciclo de entrenamiento PEFT sobre datos propios en inglés o suajili, aprovechando que el coste de almacenamiento y de cómputo es bajo.
- Evaluación de robustez multilingüe entre lenguas tipológicamente distantes: inglés y suajili pertenecen a familias distintas (germánica frente a bantú), lo que hace del adaptador un candidato razonable para estudiar transferencia cross-lingüe en tareas de comprensión lectora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye ninguna sección de evaluación completada, y el repositorio no contiene ficheros de resultados ni tablas comparativas. No se dispone de cifras de F1 ni de Exact Match sobre TyDiQA, ni de métricas generales tipo MMLU, HumanEval o GSM8K para el adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB en disco y, en memoria, un número de parámetros del orden de decenas de millones; es despreciable frente al modelo base.
- Inferencia en bf16/fp16 con el modelo base completo: aproximadamente 16 GB de pesos más la caché KV, por lo que se necesitan del orden de 20-24 GB de VRAM para contextos moderados.
- Inferencia en cuantización de 8 bits: aproximadamente 8-9 GB de pesos; viable en GPUs de 12-16 GB con contexto reducido.
- Inferencia en cuantización de 4 bits: aproximadamente 4,5-5,5 GB de pesos; viable en GPUs consumer de 8-12 GB con contexto limitado.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para servicio en bf16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para bf16 con contexto moderado; RTX 4060 Ti 16 GB o RTX 3060 12 GB para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: sí, en cualquiera de 16 GB o más usando bf16 con contexto corto, y en GPUs de 8-12 GB si se cuantiza el modelo base.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM y TGI (requieren fusionar el adaptador en los pesos base o usar soporte de adaptadores LoRA), llama.cpp u Ollama (requieren fusionar el adaptador y convertirlo a GGUF, ya que el repositorio solo contiene pesos safetensors en formato PEFT).
- Latencia y throughput estimados: no disponibles. No hay ninguna medición publicada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en QA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_42_DoRA | Adaptador DoRA sobre 8,03B (tamaño exacto no disponible) | 131.072 tokens heredados del base; no verificado | No disponible | No disponible (base bajo Llama 3.1 Community License) | HuggingFace, 6 descargas |
| meta-llama/Llama-3.1-8B (base, sin adaptador) | 8,03B | 131.072 tokens | No aplica como QA ajustado; rendimiento general documentado por Meta | Llama 3.1 Community License | Ampliamente disponible |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 131.072 tokens | No entrenado específicamente en TyDiQA; buen desempeño general e instrucciones | Llama 3.1 Community License | Ampliamente disponible |
| Adaptador LoRA equivalente sobre el mismo base (no localizado) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han localizado en la información proporcionada adaptadores alternativos comparables entrenados específicamente sobre TyDiQA en inglés y suajili, ni resultados que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de HuggingFace sin completar: no describe la tarea, los datos, los hiperparámetros ni las métricas. Cualquier uso requiere leer el nombre del repositorio como única fuente de intención.
- No se declara licencia para el adaptador. Esto impide determinar si su uso comercial está permitido, con independencia de que el modelo base sí tenga una licencia conocida (Llama 3.1 Community License, con sus propias condiciones, incluida la obligación de atribución y el umbral de 700 millones de usuarios mensuales para la licencia automática).
- No hay ninguna evaluación publicada. No se puede afirmar que el adaptador mejore al modelo base en ninguna tarea, ni cuantificar una posible degradación.
- El ajuste se realizó, según el identificador, sobre 3000 ejemplos y un 1,42 % del conjunto, un volumen muy reducido que sugiere un experimento de viabilidad más que un modelo listo para producción.
- El suajili no está entre los ocho idiomas oficialmente soportados por Llama 3.1 (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), por lo que la calidad en ese idioma depende enteramente del ajuste y es probablemente limitada.
- Riesgo de alucinación: inherente al modelo base y potencialmente acentuado en un ajuste extractivo de pocos pasos, donde el modelo podría generar respuestas plausibles no presentes en el pasaje de origen.
- Sesgos: no evaluados. Al no existir documentación de datos ni de evaluación, no es posible caracterizar sesgos de género, origen o idioma.
- Al ser un adaptador PEFT, requiere descargar y servir el modelo base completo de 8B; no reduce los requisitos de VRAM respecto al base salvo por el ahorro en almacenamiento del checkpoint.
- El número de descargas (6) y de "likes" (0) indica que el artefacto no ha sido validado por la comunidad.
- Las fechas de creación y actualización de los metadatos (22 de septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar la integridad de los metadatos antes de citar el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_42_DoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Paper de referencia incluido en las etiquetas del repositorio (Lacoste et al., 2019, cuantificación del impacto ambiental): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft/index
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation): https://arxiv.org/abs/2402.09353
- Paper de TyDiQA: https://arxiv.org/abs/2003.05002
- Model card de Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (consultas sobre símbolos tipográficos, videojuegos y sistemas de información geográfica en foros en chino). No se ha localizado ninguna página, blog, demo o repositorio adicional que describa este adaptador.
