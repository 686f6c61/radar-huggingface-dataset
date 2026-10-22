# Zayaan/reax-generalist-r2

## Resumen

reax-generalist-r2 es un ajuste fino (fine-tune) de decisionmodels/reax-1.1, un modelo de decisión de 26.085.330.160 parámetros (unos 26,1 B) publicado por el usuario Zayaan en HuggingFace. No es un modelo generativo al uso: responde preguntas de decisión tipadas (elección entre varias opciones, sí/no y puntuación ordinal) devolviendo una probabilidad para cada opción en un único forward pass, mediante el protocolo de readout inline conjunto v3 definido por REAX (Bittensor subnet 92). Su pipeline declarado en HuggingFace es text-classification.

El modelo parte de la revisión `142b1935` de reax-1.1, cuyo tag de arquitectura es `qwen3_5`: un transformer decoder-only de 64 capas de lenguaje con una torre de visión (que en este fine-tune permanece intacta). El ajuste consiste en un único run de LoRA (rango 32, alpha 64) fusionado sobre las 496 proyecciones lineales de las 64 capas, más un reescalado del fichero `readout.safetensors` por un factor de 2,5 para hacer la cabeza más decisiva.

Es relevante ahora porque representa un caso poco habitual: un modelo de 26 B especializado en una tarea estrecha (clasificación de decisiones con calibración), entrenado con solo 13.839 filas y evaluado con el scorer propio de la subred (75 % competencia, 25 % calibración). Aun así, no cuenta con descargas ni likes, ni con resultados en benchmarks públicos estándar, por lo que su validación es exclusivamente la reportada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5`), 64 capas de lenguaje con torre de visión; cabeza de readout de decisión (protocolo v3) |
| Parametros totales | 26.085.330.160 (26,1 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (los datos de entrenamiento incluyen intents MASSIVE en 16 idiomas, pero no se declaran idiomas soportados ni se evalúan) |
| Licencia | apache-2.0 (con `NOTICE` que conserva los avisos del modelo base) |
| Formato de pesos | safetensors (repo de 52,2 GB, más `readout.safetensors` y `decision_config.json`) |

## Arquitectura y entrenamiento

La base es reax-1.1, un transformer decoder-only de 26,1 B parámetros con 64 capas de lenguaje y una torre de visión. El modelo no genera texto libre: la cabeza de readout (`readout.safetensors`) se aplica sobre la última posición del prompt y produce, en un solo forward pass, una probabilidad por cada opción de la pregunta de decisión, con temperatura fija 2 y filas de readout A.. según `spec/joint.py` de reax-subnet 1.2.0rc10.post1. El paquete de referencia `pplx_decider` del repositorio base carga este modelo sin cambios.

El fine-tune es un único run de LoRA (run C de la ronda 2) con rango 32, alpha 64, aplicado a las 496 proyecciones lineales de las 64 capas, durante una época, con learning rate 3e-5 y schedule coseno, manteniendo congelada la cabeza de readout. La pérdida combina la entropía cruzada del readout de pregunta única (temperatura 2) con un margen de decisión sí/no. Antes de fusionar, cada tensor se verificó contra los hashes del modelo base. Además, el fichero `readout.safetensors` del base se multiplicó por 2,5: como REAX solo puntúa una respuesta sí/no más allá de 0,80 / 0,20 con temperatura fija, una cabeza más decidida puntúa mejor sin alterar el argmax; `decision_config.json` no se modifica, de modo que las probabilidades nativas del modelo también son más afiladas.

Los datos de entrenamiento son 13.839 filas (13.572 usadas en entrenamiento y 267 reservadas para elegir checkpoint): 11.339 ítems del nuevo conjunto, ponderados hacia las áreas más débiles del base (matemáticas y cantidades 2.039; soporte y operaciones 3.000; finanzas y seguros 3.000; previsión y riesgo 1.500; 300 por cada una de las otras seis áreas), 1.500 filas de sn92-specialists y 1.000 filas de splits públicos de entrenamiento. Los conjuntos de origen son `decisionmodels/sn92-generalist-train-v1` (CC-BY-4.0), `decisionmodels/sn92-specialists` (CC-BY-4.0) y conversiones al formato de decisión de REAX de MMLU auxiliary train, CommonsenseQA, StrategyQA, GSM8K, XCOPA, Aegis 2.0, BANKING77, CLINC150, MASSIVE (16 idiomas), AQuA-RAT, SVAMP y QASC.

## Capacidades

- Clasificación de decisiones tipadas: preguntas de elección múltiple, sí/no y puntuación ordinal, con una probabilidad por opción en un único forward pass.
- Readout inline conjunto (protocolo v3): reutiliza el mismo interfaz que el modelo base, cargable con el paquete `pplx_decider`.
- Puntuación calibrada: el scorer de REAX combina 75 % de competencia y 25 % de calibración, de modo que el modelo está optimizado para probabilidades bien ordenadas, no solo para el argmax.
- Cobertura de dominios declarada por la composición del entrenamiento: matemáticas y cantidades, soporte y operaciones, finanzas y seguros, previsión y riesgo, más otras seis áreas con 300 ítems cada una.
- Razonamiento procedimental: 426 ítems de tasksource/procedural-typed-decisions en el conjunto de comprobación (96,98 de score).
- Capacidad multilingüe: no documentada como tal; el entrenamiento incluye intents MASSIVE en 16 idiomas, pero no hay evaluación por idioma.
- Torre de visión: presente en la arquitectura, pero explícitamente sin cambios en este fine-tune y sin evaluación reportada.
- Tool calling / function calling: no disponible (no se declara ni se evalúa).
- Uso como agente multi-paso: no disponible (el modelo resuelve una pregunta de decisión por forward pass).
- Modo thinking: no disponible.

## Casos de uso

- Enrutado y triaje de peticiones: dado un texto de entrada y un conjunto cerrado de etiquetas (por ejemplo, colas de soporte o categorías de ticket), el modelo devuelve la probabilidad de cada etiqueta en un solo paso, lo que permite fijar umbrales y derivar los casos ambiguos a revisión humana.
- Clasificación de intenciones en asistentes conversacionales: entrenado con BANKING77, CLINC150 y MASSIVE, puede asignar una intención a un turno de usuario con una distribución de probabilidad explotable para decidir si se responde automáticamente o se escala.
- Verificación sí/no en pipelines de control de calidad: la cabeza reescalada x2,5 está pensada para que las decisiones binarias superen los umbrales 0,80 / 0,20 de REAX, lo que encaja en flujos donde se necesita una respuesta binaria decidida con su confianza.
- Puntuación de riesgo y previsión: con 1.500 ítems de previsión y riesgo y 3.000 de finanzas y seguros en el entrenamiento, puede usarse para responder preguntas ordinales del tipo "riesgo bajo/medio/alto" sobre un caso descrito en el prompt.
- Evaluación comparativa de modelos de decisión: como implementa el protocolo v3 y el scorer de la subred, sirve para medir competencia y calibración de otros modelos en el mismo formato sin reentrenar nada.
- Moderación y seguridad con política explícita: los conjuntos de evaluación incluyen Aegis 2.0 y XSTest, de modo que el modelo puede formularse como clasificador de cumplimiento de política (permitido / no permitido) por par (prompt, respuesta).
- Selección entre alternativas en recuperación aumentada: presentar fragmentos candidatos y preguntar cuál responde mejor a la consulta, usando la probabilidad por opción como señal de ranking.

## Benchmarks y rendimiento

Evaluado con el scorer de REAX (S = 0,75 competencia + 0,25 calibración) sobre 4.436 ítems de comprobación propios del autor (no son los draws sellados de la subred):

| Modelo | Pooled | Familias reservadas | Grupos reservados | OpenDecisions | Tests públicos | Procedural | sn92 dev |
|---|---|---|---|---|---|---|---|
| decisionmodels/reax-1.1 (publicado) | 82,21 | 85,55 | 78,50 | 77,54 | 69,51 | 96,25 | 89,13 |
| reax-1.1 con cabeza x2 (ablación) | 84,76 | 88,97 | 83,41 | 79,33 | 71,00 | 97,29 | 90,90 |
| reax-generalist-r2 | 86,24 | 88,88 | 86,89 | 80,00 | 73,36 | 96,98 | 92,35 |

Composición de los conjuntos: familias reservadas y grupos de ítems reservados del nuevo conjunto de entrenamiento, 1.000 filas dev de sn92-specialists, 910 ítems de test públicos (MMLU, MMLU-Pro, CommonsenseQA, StrategyQA, GSM8K, XCOPA, XSTest, Aegis 2.0), 426 ítems de tasksource/procedural-typed-decisions y 600 ítems de OpenDecisions (CC-BY-SA, solo evaluación). No hay resultados publicados en benchmarks estándar tipo MMLU o HumanEval como tales, ni comparación con modelos de otras familias.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 52 GB solo para pesos (el repo ocupa 52,2 GB), más overhead de activaciones y del prompt; requiere GPU de 80 GB o reparto multi-GPU.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o dos GPU de 48 GB (L40S, A6000) con tensor parallelism.
- Cuantización a 8 bits: aproximadamente 26-28 GB de pesos; entra en una A100 40 GB o en dos GPU consumer de 24 GB, no en una sola RTX 4090.
- Cuantización a 4 bits: aproximadamente 13-16 GB de pesos; es la única vía realista para una GPU consumer de 24 GB (RTX 3090, 4090) o de 16 GB con contexto corto.
- Despliegue: el modelo se sirve con el paquete `pplx_decider` del repositorio base y el `JointRunner` de `spec/joint.py` (reax-subnet 1.2.0rc10.post1). No se documentan recetas para vLLM, TGI, llama.cpp ni Ollama; dado que no se publican pesos GGUF, llama.cpp y Ollama no son opciones directas sin convertir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Score pooled (check propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reax-generalist-r2 | 26,1 B | no disponible | 86,24 | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| decisionmodels/reax-1.1 (base) | 26,1 B (misma base) | no disponible | 82,21 | Apache-2.0 | HuggingFace |
| reax-1.1 con cabeza x2 (ablación del autor) | 26,1 B | no disponible | 84,76 | Apache-2.0 | No publicado como modelo independiente |

No se dispone de datos en la información proporcionada para comparar con alternativas de otras familias (por ejemplo, modelos Qwen3.5 instruct del mismo tamaño o clasificadores dedicados tipo DeBERTa): parámetros, contexto, rendimiento y licencia de esos modelos no están documentados aquí, por lo que la comparación se limita a las variantes de la propia familia REAX.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo responde en el formato de decisión de REAX (readout inline conjunto v3); fuera de ese protocolo su comportamiento no está documentado.
- Volumen de entrenamiento muy reducido: 13.572 filas efectivas para 26,1 B parámetros; el riesgo de sobreajuste a los dominios y estilos de esos conjuntos es alto.
- Evaluación no independiente: los 4.436 ítems de comprobación son del propio autor y no los draws sellados de la subred; no hay resultados en MMLU, HumanEval, GSM8K ni en leaderboards públicos con este modelo.
- Calibración alterada deliberadamente: multiplicar la cabeza por 2,5 hace las probabilidades más afiladas para superar los umbrales 0,80 / 0,20. Quien use las probabilidades como estimaciones de confianza reales (por ejemplo, en un sistema de decisión con costes asimétricos) debe recalibrarlas.
- Caveat de licencia de los datos: la model card de `sn92-generalist-train-v1` advierte de que algunos ítems se generaron con modelos cuyos proveedores restringen usar sus salidas para desarrollar modelos competidores; conviene revisar ese extremo antes de un uso comercial.
- Obligaciones de atribución: aunque la licencia es Apache-2.0, el `NOTICE` conserva los avisos del modelo base y los conjuntos de datos exigen crédito a "REAX / decisionmodels"; hay que mantener ambos.
- Idiomas: no se declaran idiomas soportados ni se evalúa el rendimiento por idioma, pese a que el entrenamiento incluya 16 idiomas vía MASSIVE.
- Contexto y cuantizaciones sin documentar: no se publica longitud de contexto ni pesos cuantizados, lo que complica el despliegue en hardware modesto.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; el autor no reporta auditoría externa.
- Contenido de la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido para adultos), por lo que no se han usado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zayaan/reax-generalist-r2
- Modelo base: https://huggingface.co/decisionmodels/reax-1.1 (revisión `142b19355af00251f08db3d287307dd8b711c133`)
- Dataset de entrenamiento principal: https://huggingface.co/datasets/decisionmodels/sn92-generalist-train-v1 (revisión `2241ec2c`, CC-BY-4.0)
- Dataset de especialistas: https://huggingface.co/datasets/decisionmodels/sn92-specialists (revisión `e2ff3bb0`, CC-BY-4.0)
- Ficheros citados en el repo del modelo: `MODIFICATIONS.md`, `NOTICE`, `LICENSE`, `readout.safetensors`, `decision_config.json`
- Paquete de referencia `pplx_decider` y runner `spec/joint.py` (reax-subnet 1.2.0rc10.post1): mencionados en la model card, sin URL disponible
- Papers, blogs, demos o repositorios adicionales: no disponibles (la búsqueda web no devolvió resultados pertinentes)
