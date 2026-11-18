# TryZZZ/Qwen2.5-3B-Toraja-v2.1-GGUF

## Resumen

Qwen2.5-3B-Toraja-v2.1-GGUF es un modelo de traducción bilingüe entre indonesio (`id`) y toraja (`trj`, también llamado *Kada Masero*), una lengua regional de Sulawesi del Sur con recursos digitales muy limitados. Lo desarrolla la comunidad de preservación lingüística y cultural toraja bajo el identificador `TryZZZ` (liuccio), partiendo de `Qwen/Qwen2.5-3B-Instruct` y aplicando un ajuste fino con QLoRA sobre un corpus paralelo de la Biblia en toraja y textos indonesios (LAI/SABDA).

El modelo se distribuye únicamente en formato GGUF de 4 bits (`Q4_K_M`, 1,80 GB), lo que reduce el peso un 68,7 % respecto a los 5,75 GB en Float16 y permite ejecutarlo en portátiles escolares o equipos con 2,5-3,5 GB de RAM sin GPU dedicada. La ventana de contexto efectiva declarada es de 2.048 tokens, aunque la arquitectura base admite hasta 32.768.

Su relevancia radica en el enfoque de entrenamiento: la variante v2.1 introduce *response-only loss masking* (Run R1) y una partición de datos por capítulos que garantiza cero filtración entre entrenamiento y prueba, con mejoras medidas de +4,45 puntos BLEU en el conjunto fuera de dominio respecto al control R0. Es un caso práctico de adaptación de un LLM generalista a una lengua de bajos recursos con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino QLoRA sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens efectivos (máximo arquitectónico 32.768) |
| Tipos de cuantizacion | GGUF 4-bit `Q4_K_M` (único publicado) |
| Idiomas soportados | indonesio (`id`), toraja (`trj`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (1,80 GB); pesos fusionados en Float16 antes de cuantizar |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Pipeline | translation |
| Formato de prompt | ChatML (`<|im_start|>` / `<|im_end|>`) |
| Tamano del repo | 1,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only de 3,09 mil millones de parámetros con atención causal estándar, sin mezcla de expertos. Sobre esos pesos se aplicó un ajuste fino con QLoRA (adaptadores de bajo rango sobre el modelo cuantizado), y los adaptadores resultantes se fusionaron en los pesos de 16 bits antes de la cuantización final a GGUF `Q4_K_M` con la cadena de herramientas oficial de `llama.cpp`.

El corpus de entrenamiento es un conjunto paralelo indonesio-toraja derivado de la Biblia en toraja y de textos indonesios (LAI/SABDA), separado por capítulos completos para evitar fugas de contexto. La partición de la versión v2.1 comprende 53.920 líneas de entrenamiento (26.960 en cada dirección), 3.296 líneas de validación, 4.092 líneas de test in-domain retenidas y 92 líneas de test out-of-domain procedentes de dos libros completos (Filemón y Abdías). Se normalizó el carácter de oclusión glotal a U+2019 y se eliminó el mojibake MacRoman del corpus.

La innovación técnica declarada es el *response-only loss masking* (Run R1): el gradiente se calcula solo sobre la respuesta del asistente, sin reentrenar el prompt de instrucción. Según el autor, esto evita que el modelo memorice patrones de instrucción y mejora la generalización léxica fuera del dominio de entrenamiento. No se documenta uso de RLHF ni DPO.

## Capacidades

- Traducción bidireccional indonesio ↔ toraja en registro formal, con especial cobertura del dominio bíblico y religioso.
- Generación de texto conversacional en indonesio y toraja siguiendo el formato ChatML de Qwen.
- Generalización léxica limitada a vocabulario no visto en entrenamiento (evaluada en el conjunto OOD).
- Normalización ortográfica del toraja: oclusión glotal como U+2019, sin mojibake MacRoman.
- Sin tasa de repetición de 4-gramas ni anomalías de espaciado en la evaluación declarada (0,00 % en ambas métricas).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidades multilingües reducidas a los dos idiomas del ajuste; el resto de idiomas heredados del modelo base no están validados.

## Casos de uso

- Traducción de textos religiosos y litúrgicos: el corpus de entrenamiento es la Biblia en toraja, por lo que la traducción de pasajes, himnos y catequesis entre indonesio y toraja es el escenario con mayor fidelidad esperada.
- Digitalización y traducción de material educativo local: el modelo cabe en 1,80 GB y corre en portátiles escolares con 2,5-3,5 GB de RAM, lo que permite desplegarlo en aulas sin conexión a internet.
- Preservación lingüística comunitaria: traducción asistida de textos orales transcritos y documentos etnográficos del indonesio al toraja para archivos culturales.
- Subtitulado y localización de contenido audiovisual: con temperatura 0,2 y top_p 0,9 configurados en el Modelfile, la salida es determinista y adecuada para generar subtítulos bilingües de forma reproducible.
- Atención al ciudadano en zonas rurales de Sulawesi del Sur: traducción de avisos administrativos y sanitarios del indonesio al toraja en entornos con hardware modesto.
- Investigación en PLN para lenguas de bajos recursos: sirve como línea base reproducible (particiones train/val/test documentadas, semilla 42) para comparar técnicas de ajuste fino en lenguas minoritarias.
- Asistencia a traductores humanos: borrador de traducción con prompt ChatML y revisión posterior, aprovechando la baja tasa de repetición y de anomalías de espaciado.

## Benchmarks y rendimiento

Evaluación sobre un subconjunto bloqueado de 1.092 pares de frases (`eval_ids.json`, semilla 42) con SacreBLEU (13a) y chrF++ (beta=2):

| Tarea / metrica | Baseline v2.0 | Run R0 (control) | Run R1 (este modelo) | Delta vs R0 |
|---|---|---|---|---|
| BLEU in-domain (ID → TRJ) | 3,98 | 14,59 | **15,82** | +1,23 |
| BLEU in-domain (TRJ → ID) | 4,12 | 14,52 | **15,86** | +1,34 |
| BLEU out-of-domain (OOD) | 3,10 | 9,35 | **13,80** | +4,45 (+47,6 %) |
| chrF++ (ID → TRJ) | 22,40 | 38,45 | **39,54** | +1,09 |
| chrF++ (TRJ → ID) | 24,10 | 40,12 | **41,28** | +1,16 |
| chrF++ (OOD) | 21,05 | 32,18 | **37,62** | +5,44 |
| Tasa de repeticion | 13,50 % | 0,00 % | **0,00 %** | sin cambio |
| Tasa de anomalias de espaciado | 2,10 % | 0,00 % | **0,00 %** | sin cambio |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 2,0-2,5 GB con `Q4_K_M` (fichero de 1,80 GB más overhead de contexto y KV cache).
- Cabe en CPU con 2,5-3,5 GB de RAM, según indica el autor; es el escenario objetivo del modelo.
- GPU consumer: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede alojarlo íntegramente. No se requieren A100 ni H100.
- Despliegue soportado: Ollama (con `Modelfile` incluido en el repo), LM Studio (preset ChatML), `llama-cpp-python` y, por extensión, cualquier runtime compatible con GGUF (llama.cpp).
- vLLM y TGI no están documentados para este repositorio; requerirían reconvertir los pesos a safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados: temperatura 0,2, top_p 0,9, repeat_penalty 1,1, stop en `<|im_start|>` y `<|im_end|>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen2.5-3B-Toraja-v2.1 | 3,09 B | 2.048 efectivos | id, trj | Apache-2.0 | GGUF Q4_K_M | Especializado en indonesio ↔ toraja; BLEU in-domain 15,82 |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 | multilingüe (sin toraja) | Apache-2.0 | safetensors, GGUF | Modelo generalista; no traduce toraja de forma fiable sin ajuste |
| Qwen2.5-3B-Toraja v2.0 (baseline) | 3,09 B | no disponible | id, trj | Apache-2.0 | no disponible | Versión previa; BLEU in-domain 3,98-4,12, repetición 13,50 % |

No se dispone de información sobre otros modelos públicos de traducción indonesio ↔ toraja con los que establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Dominio restringido: el corpus es fundamentalmente bíblico, por lo que el rendimiento fuera de ese registro (lenguaje técnico, jurídico, coloquial moderno) puede degradarse; el propio autor reporta BLEU OOD de 13,80 frente a 15,82 in-domain.
- Corpus pequeño: 53.920 líneas de entrenamiento limitan la cobertura léxica y la variedad estilística.
- Contexto efectivo corto: 2.048 tokens, muy por debajo de los 32.768 de la arquitectura base, lo que restringe la traducción de documentos largos en una sola pasada.
- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones fluidas pero léxicamente incorrectas, especialmente con términos toraja ausentes del entrenamiento.
- Sesgo de dominio religioso: el vocabulario y las construcciones aprendidas están sesgados hacia el registro bíblico.
- Solo dos idiomas validados; no debe asumirse calidad en otras lenguas heredadas del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero no hay garantías del autor sobre exactitud en producción; se recomienda revisión humana en contextos sensibles.
- Un único formato publicado (GGUF Q4_K_M): no hay pesos en safetensors ni otras cuantizaciones (Q5, Q8, FP16) en el repositorio, lo que limita el ajuste fino posterior.
- Sin datos de benchmarks generalistas ni de latencia/throughput; no apto para afirmaciones de rendimiento fuera de la tarea de traducción evaluada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TryZZZ/Qwen2.5-3B-Toraja-v2.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de llama.cpp (toolchain de cuantización): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Unsloth (framework de ajuste fino citado en las etiquetas): https://github.com/unslothai/unsloth
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales asociados a este modelo.
