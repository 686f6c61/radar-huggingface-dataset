# Zayaan/zils-z3-reax13-q-ft1

## Resumen

zils-z3-reax13-q-ft1 es un modelo de decisión derivado por fine-tuning de `decisionmodels/REAX-1.3` (parte Q), publicado por el usuario Zayaan en Hugging Face. Forma parte del ecosistema Zils, una plataforma orientada a entrenar modelos pequeños que permiten a una aplicación clasificar peticiones, marcar problemas o puntuar coincidencias a partir de ejemplos con respuestas correctas. El modelo se presenta como un "body" del pool de soups de la subred 127 de Bittensor, es decir, una pieza evaluada contra un chasis fijo (`vllm-sr/d3-ultra`) que aporta la capa de respuesta, el prompt y el runtime.

Técnicamente, el repositorio contiene 26.085.330.160 parámetros en pesos BF16 con un tamaño total de 52,2 GB. El autor lo describe como un fine-tuning LoRA (rango 32, alpha 64, learning rate 5e-5) aplicado únicamente sobre las proyecciones de lenguaje que adapta el runtime `d3` de Zils, con una readout de respuesta fija, fusionado en BF16. No se ha publicado información sobre arquitectura base, longitud de contexto ni idiomas soportados más allá de lo que se infiere del modelo base.

Su relevancia es acotada: se trata de un artefacto de investigación dentro de un pipeline de evaluación de modelos de decisión, no de un modelo conversacional de propósito general. La model card reporta una mejora local de 89,71 frente a 84,95 del chasis `d3-ultra` y 87,37 del punto de partida en 1.191 ítems retenidos, medida con el Brier skill calibrado de los validadores. Esos números corresponden a una evaluación local y no al examen privado de los validadores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de `decisionmodels/REAX-1.3`, parte Q, sobre chasis `vllm-sr/d3-ultra`) |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base `decisionmodels/REAX-1.3`; solo indica que la parte Q de ese modelo se coloca sobre el chasis fijo `d3-ultra` mediante el constructor de soups de Zils (`zils.soup.build`), replicando la forma en que los validadores puntúan un body individual. Los tensores del modelo encajan en el layout del chasis `d3-ultra` en BF16, y la evaluación se realiza sobre ese mismo chasis, que aporta la capa de respuesta, el prompt y el runtime.

El entrenamiento consistió en una época de LoRA con rango 32, alpha 64 y learning rate 5e-5, aplicada exclusivamente a las proyecciones de lenguaje que adapta el runtime `d3` de Zils, junto con su readout de respuesta fija (`zils.teacher train --start`). Los pesos se fusionaron en BF16. No se entrenó ningún otro tensor. El cómputo se realizó en una única RTX PRO 6000 de 96 GB durante aproximadamente 20 minutos. El objetivo de entrenamiento fue la respuesta verificada de cada ítem.

Los datos de entrenamiento son 4.992 ítems con formato de examen escritos por Claude Opus 5.5 con la receta `scripts/author_exam.py`, que usa una fila pública como ejemplo de estilo y exige una respuesta ciega independiente, conservándose solo cuando ambas coinciden. Se emplearon únicamente splits públicos de entrenamiento: 2.974 ítems de 15 familias conocidas (Social IQa, PIQA, SVAMP, GSM8K, GLUE MNLI, RTE, QNLI y STS-B, Crisscrossed Captions en validación, 20 Newsgroups, Glaive function calling v2, dair-ai/emotion, News Headlines Dataset for Sarcasm Detection y TweetEval sentiment) y 2.018 ítems de 99 tareas de entrenamiento de BIG-bench (`tasksource/bigbench`) y Glaive function calling. No se usaron ítems del examen de los validadores, ítems semilla públicos ni datos de clientes.

## Capacidades

- Clasificación y decisión sobre ítems con formato de examen: selección de respuesta entre opciones en tareas de razonamiento social, físico, matemático, lingüístico y de sentido común.
- Razonamiento aritmético y de sentido común de múltiples pasos, derivado de las familias SVAMP, GSM8K, PIQA y Social IQa presentes en el entrenamiento.
- Inferencia de lenguaje natural (NLI) y similitud semántica de frases, por las familias GLUE MNLI, RTE, QNLI y STS-B.
- Clasificación de texto: categorización de noticias (20 Newsgroups), detección de emoción (dair-ai/emotion), detección de sarcasmo (News Headlines) y sentimiento (TweetEval).
- Function calling: el conjunto de entrenamiento incluye Glaive function calling v2, lo que sugiere capacidad de seleccionar llamadas a funciones en formato de decisión.
- Cobertura amplia de tareas BIG-bench (99 tareas de entrenamiento), lo que aporta generalidad en formatos de pregunta variados.
- No se documentan capacidades de visión, audio, tool calling agéntico multi-turno, modo thinking ni generación libre de texto; el modelo está diseñado para producir una respuesta seleccionada dentro de un formato de examen fijo.

## Casos de uso

- Clasificación de peticiones en aplicaciones: el modelo puede puntuar o etiquetar solicitudes entrantes según categorías aprendidas de ejemplos con respuesta correcta, siguiendo el patrón que promociona Zils para "sort requests" en producción.
- Enrutamiento de tickets de soporte: dado un texto de incidencia, seleccionar la categoría o cola adecuada entre un conjunto predefinido, apoyándose en el entrenamiento sobre 20 Newsgroups y clasificación de sentimiento.
- Detección de problemas en contenido generado: marcar textos con sarcasmo, emoción negativa o sentimiento adverso usando las familias TweetEval y News Headlines incluidas en el entrenamiento.
- Puntuación de coincidencias en sistemas de recomendación o matching: emplear la salida del modelo como señal de afinidad entre un par de textos, aprovechando el entrenamiento en STS-B y Crisscrossed Captions.
- Evaluación automática de respuestas en entornos educativos o de examen: el modelo está entrenado explícitamente con ítems de examen y una readout de respuesta verificada, por lo que puede usarse como clasificador de opción correcta en bancos de preguntas.
- Selección de llamadas a funciones en asistentes: dado un prompt y un conjunto de funciones disponibles, elegir la llamada adecuada, gracias a los ítems de Glaive function calling v2 del conjunto de entrenamiento.
- Investigación en ensembles de modelos de decisión: sirve como body adicional en el pool de soups de la subred 127 de Bittensor para comparar su Brier skill frente al chasis y al punto de partida.

## Benchmarks y rendimiento

Evaluación local del autor con 1.191 ítems retenidos, puntuados con el Brier skill calibrado de los validadores (`soup_grade.evaluate`, media de cinco splits de calibración). Los 892 ítems escritos con filas nunca vistas en entrenamiento incluyen 15 tareas BIG-bench excluidas del entrenamiento, más los 299 ítems de familias actuales de `zils-ai/base-exam-seed-v1` a `-v4`.

| Modelo | Todos los 1.191 ítems | 299 ítems semilla públicos |
|---|---:|---:|
| vllm-sr/d3-ultra (chasis del pool) | 84,95 | referencia |
| REAX-1.3 parte Q (punto de partida) | 87,37 | +2,31 sobre d3-ultra |
| zils-z3-reax13-q-ft1 (este body) | 89,71 | +3,76 sobre d3-ultra |

El autor advierte que las puntuaciones de los validadores se calculan sobre un examen privado y diferirán de estas cifras. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 52,2 GB en safetensors BF16 para 26.085 millones de parámetros, lo que exige al menos 52 GB solo para los pesos; con overhead de runtime y KV cache se recomienda un mínimo de 64-80 GB de VRAM en BF16.
- El entrenamiento se realizó en una RTX PRO 6000 de 96 GB, que es el mínimo práctico documentado para BF16 sin cuantizar.
- GPU recomendadas: RTX PRO 6000 (96 GB), A100 80 GB, H100 80 GB. En configuraciones multi-GPU, dos A100 40 GB o dos RTX 4090 de 24 GB con tensor parallelism.
- No cabe en GPU de consumo de 24 GB en BF16; requeriría cuantización a 8 bits o 4 bits, para la cual no se han publicado pesos GGUF ni AWQ/GPTQ en el repositorio.
- Opciones de despliegue: el autor menciona el runtime `d3` de Zils y el chasis `vllm-sr/d3-ultra`, lo que sugiere despliegue con vLLM. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento local (Brier skill) |
|---|---|---|---|---|---|
| zils-z3-reax13-q-ft1 | 26,09 B | no disponible | Apache-2.0 | Hugging Face (Zayaan) | 89,71 / 1.191 ítems |
| decisionmodels/REAX-1.3 (parte Q) | no disponible | no disponible | Apache-2.0 | Hugging Face (decisionmodels) | 87,37 / 1.191 ítems |
| vllm-sr/d3-ultra (chasis) | no disponible | no disponible | Apache-2.0 | Hugging Face (vllm-sr) | 84,95 / 1.191 ítems |

No se dispone de información sobre otros modelos de decisión comparables fuera del ecosistema Zils; los tres modelos de la tabla comparten el mismo pipeline de evaluación y no son directamente comparables con modelos conversacionales de propósito general.

## Limitaciones y advertencias

- El modelo está diseñado para un formato de examen y una readout de respuesta fija; no es un modelo de generación libre ni un asistente conversacional.
- Los resultados reportados son una evaluación local del autor, no el examen privado de los validadores de la subred 127; el rendimiento real en producción puede diferir.
- El conjunto de entrenamiento fue generado por Claude Opus 5.5, lo que puede introducir sesgos de estilo y de distribución de respuestas del modelo generador.
- No se documentan sesgos específicos, pero las familias de datos (TweetEval, 20 Newsgroups, Glaive) pueden arrastrar sesgos de dominio y de anotación de sus fuentes originales.
- Riesgo de alucinación no evaluado: al ser un modelo de selección de respuesta, el fallo se manifiesta como clasificación incorrecta más que como texto inventado.
- No se especifican idiomas soportados; la mayoría de las fuentes de entrenamiento son en inglés, por lo que el rendimiento en castellano es incierto.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda verificar los términos de cada fuente de datos antes de reutilizarlos; el repositorio contiene solo pesos, no texto de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 2026-11-06; se trata de un artefacto reciente y sin validación externa.
- Requiere el chasis `vllm-sr/d3-ultra` y el runtime `d3` de Zils para funcionar según lo previsto; no se garantiza su comportamiento fuera de ese entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zayaan/zils-z3-reax13-q-ft1
- Modelo base: https://huggingface.co/decisionmodels/REAX-1.3
- Chasis del pool: https://huggingface.co/vllm-sr/d3-ultra
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Sitio de Zils: https://zils.ai/
- BIG-bench (Srivastava et al., 2022): no disponible como enlace directo en la información proporcionada
- tasksource (Sileo, 2024): no disponible como enlace directo en la información proporcionada
