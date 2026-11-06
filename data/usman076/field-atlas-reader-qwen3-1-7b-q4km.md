# Usman076/field-atlas-reader-qwen3-1.7b-q4km

## Resumen

Field Atlas reader es un modelo derivado de Qwen/Qwen3-1.7B, ajustado mediante LoRA por el usuario Usman076 para una tarea muy concreta: responder preguntas cerradas a partir de un conjunto de pasajes numerados y citar las fuentes usadas. Está pensado para funcionar de forma totalmente offline dentro de la aplicación Field Atlas, un lector de pasajes que recupera documentos guardados por el usuario y necesita un modelo pequeño capaz de responder sin conexión. El modelo se distribuye como GGUF cuantizado en Q4_K_M, con un tamaño de algo más de 1 GB, lo que lo hace viable en dispositivos móviles con unos 6 GB de presupuesto de modelo.

La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso de 1.720.574.976 parámetros (1,7 mil millones), con licencia Apache-2.0. El ajuste LoRA se aplicó con rango 16, alpha 32, dropout 0,05 y objetivos all-linear sobre el modelo base, entrenando únicamente sobre los tokens de respuesta. El resultado se fusionó, se convirtió a F16 y se cuantizó a Q4_K_M con llama.cpp, produciendo un único archivo de 1.107.408.736 bytes con SHA-256 `8a75c51c81dc81c99091c2126026c5bd6cb737f5e8e7e3603a03426f58874845`.

Su relevancia es acotada pero clara: demuestra un flujo completo de ajuste fino de bajo coste (LoRA sobre un modelo de 1,7B), cuantización a Q4_K_M y evaluación con un script oficial, orientado a un caso de uso de RAG offline en móvil. Los resultados publicados en el conjunto público de desarrollo son modestos: 40,0 % de `correctPct` frente a una referencia de 36,7 %, con un 66,7 % de falsos rechazos, lo que indica que el modelo tiende a declarar que las fuentes no contienen la respuesta incluso cuando sí la contienen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) con adaptador LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso maxlen 1024) |
| Tipos de cuantizacion | Q4_K_M (unico artefacto publicado); el flujo de exportacion pasa por F16 antes de cuantizar |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento SQuAD v2 bajo CC BY-SA 4.0 |
| Formato de pesos | GGUF (Q4_K_M); el pipeline de exportacion genera tambien pesos HF intermedios |
| Tamano del archivo | 1.107.408.736 bytes (~1,1 GB) |
| SHA-256 | `8a75c51c81dc81c99091c2126026c5bd6cb737f5e8e7e3603a03426f58874845` |
| Modelo base | Qwen/Qwen3-1.7B |
| Checkpoint | LoRA epoch 0 (preferido sobre epoch 1) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1,7 mil millones de parámetros. Sobre él se aplicó un ajuste supervisado con LoRA mediante PEFT: rango 16, alpha 32, dropout 0,05, objetivos all-linear, optimizador AdamW con learning rate 1e-4, acumulación de gradiente 8, pérdida calculada solo sobre los tokens de respuesta y longitud máxima de 1024 tokens. De las 1074 filas del conjunto de datos, solo 490 cabían bajo el límite de 1024 tokens y fueron las efectivamente entrenadas; se planificaron 2 épocas y el adaptador preferido es el del final de la época 0.

Los datos de entrenamiento (`build_v2.py`) se construyeron en el formato de prompt de `reader_bench` de Field Atlas: 560 ejemplos extractivos (frase dorada de SQuAD v2 más cita `[S#]`), 140 ejemplos parciales (subpregunta respondible y no respondible, con admisión del hueco), 322 ejemplos no respondibles ("The saved sources don't say.") y 52 filas estilo profesor heredadas de una pasada v1 anterior. El corpus fuente es SQuAD v2 (CC BY-SA 4.0) y los pasajes se empaquetaron como 3-8 fuentes numeradas con distractores. La exportación (`after_train.sh`) fusiona el LoRA en pesos HF, convierte a GGUF F16 con `convert_hf_to_gguf.py` y cuantiza a Q4_K_M con `llama-quantize`. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto extractivo: responde preguntas a partir de pasajes numerados proporcionados en el prompt.
- Citación de fuentes: emite referencias en formato `[S#]` que apuntan a los pasajes usados.
- Abstención explícita: devuelve "The saved sources don't say." cuando los pasajes no contienen la respuesta.
- Manejo de preguntas parcialmente respondibles: admite el hueco cuando solo una parte de la pregunta está cubierta por las fuentes.
- Procesamiento de hasta 8 pasajes numerados con distractores en el contexto de entrada.
- Funcionamiento offline: diseñado para ejecutarse en local con llama.cpp / llama-server, sin dependencia de red.
- Integración con Field Atlas: importable como archivo `.gguf` desde la Library de la aplicación (v1.4.2+).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido según la información disponible.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Preguntas y respuestas offline sobre documentos guardados: el modelo recibe la pregunta del usuario junto con hasta 8 pasajes recuperados por el sistema de búsqueda de Field Atlas y devuelve una respuesta breve (mediana de 5 palabras) con cita `[S#]`. Es adecuado porque el formato de prompt y la abstención están entrenados específicamente para ese flujo.
- Aplicaciones móviles sin conectividad: con 1,1 GB en Q4_K_M, cabe en el presupuesto de modelo de teléfonos Android de unos 6 GB y se ejecuta con llama.cpp en local, sin llamadas a API.
- Asistencia sanitaria de primer nivel limitada a fuentes: el modelo obtiene 66,7 % de `correctPct` en la categoría `health` del conjunto público de desarrollo, por lo que puede usarse para responder exclusivamente a partir de guías guardadas por el usuario, con abstención cuando la fuente no cubre la pregunta.
- Verificación de citas en pipelines de documentación: como el modelo produce citas `[S#]` y no genera números no soportados (`answersWithUnsupportedNumbersPct` = 0,0), puede integrarse en un paso de comprobación de que cada afirmación está respaldada por un pasaje.
- Detección de insuficiencia documental: con `gapsAdmittedPct` = 100,0 en el conjunto público de desarrollo, sirve para marcar consultas cuyas fuentes recuperadas no contienen la respuesta, activando una nueva ronda de recuperación.
- Evaluación comparativa de lectores de pasajes: el propio modelo se publicó como artefacto de participación en el bounty poidh #45, con un script oficial (`reader_bench.py`) y un conjunto público de desarrollo de 60 ítems, por lo que sirve como referencia reproducible para comparar variantes de ajuste (época 0 frente a época 1).
- Despliegue en entornos con presupuesto de memoria muy ajustado: al ser un GGUF Q4_K_M de 1,1 GB, puede cargarse en llama-server en equipos sin GPU dedicada, aunque la latencia medida en escritorio (mediana de 3,9 s) no es representativa de un teléfono de 6 GB.

## Benchmarks y rendimiento

Resultados publicados por el autor con el script oficial `tools/evaluation/reader_bench.py` sobre el conjunto público de desarrollo `docs/fieldtest/reader/dev.jsonl` (60 ítems). La referencia a batir es la aplicación Qwen3.5-2B sobre el mismo conjunto: 36,7 % de `correctPct`.

| Metrica | Epoca 0 (GGUF publicado) | Epoca 1 (alternativo) |
|---|---:|---:|
| Items | 60 | 60 |
| Missing | 0 | No disponible |
| correctPct | 40,0 | 38,3 |
| keyFactRecallPct | 19,0 | 21,0 |
| gapsAdmittedPct | 100,0 | 100,0 |
| falseRefusalPct | 66,7 | 52,4 |
| answersWithUnsupportedNumbersPct | 0,0 | 0,0 |
| answersWithBadCitePct | 0,0 | 0,0 |
| medianWords | 5,0 | 5,0 |
| medianSeconds | 3,9 | 3,5 |

Desglose por categoría de `correctPct` en la época 0: biology 0,0; compare 12,5; crypto 0,0; explain 50,0; fact 66,7; health 66,7; insufficient 100,0; synthesis 25,0; travel 20,0. En la época 1: biology 0,0; compare 12,5; crypto 0,0; explain 40,0; fact 75,0; health 33,3; insufficient 100,0; synthesis 25,0; travel 20,0.

El autor indica que existe un conjunto de test sellado de 68 preguntas (SHA-256 `cf12c16d5bc6ae248130721a77788e524c1d5a36d4d7a5b07285196232da2dce`) que no se publica hasta el juicio y que no ha sido evaluado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para los pesos en Q4_K_M, más overhead de contexto y caché KV; el autor no publica una cifra de VRAM total.
- GPU recomendadas: no disponible en la información proporcionada. El modelo está pensado para ejecución en CPU mediante llama.cpp.
- Cabe en GPU de consumo: sí, por tamaño de pesos (1,1 GB), aunque no se especifican modelos concretos de GPU ni rendimiento medido en ellas.
- Cabe en móvil: el autor indica que el archivo de ~1,1 GB encaja en el presupuesto de modelo de teléfonos típicos de 6 GB, por debajo del aviso de Library de ~6,6 GB.
- Opciones de despliegue: llama.cpp / llama-server (probado por el autor), importación directa en Field Atlas v1.4.2+ vía Library → Import a file. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: mediana de 3,9 s por ítem en escritorio con la época 0 (3,5 s con la época 1) sobre el conjunto de evaluación. El autor advierte que esta cifra de escritorio no sustituye una medición en un teléfono Android real de 6 GB. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | correctPct (dev publico) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Field Atlas reader (Qwen3-1.7B LoRA, Q4_K_M) | 1,72 B | No disponible (entrenado a 1024) | 40,0 | Apache-2.0 (pesos); datos CC BY-SA 4.0 | GGUF en HuggingFace |
| Qwen3.5-2B (referencia de la app) | No disponible | No disponible | 36,7 | No disponible | Referencia interna del bounty |
| Qwen/Qwen3-1.7B (base sin ajustar) | 1,72 B | No disponible | No disponible | Apache-2.0 | HuggingFace |

La comparación se limita a la referencia publicada por el propio autor (Qwen3.5-2B en el mismo conjunto público de desarrollo). No se dispone de datos de benchmarks estándar ni de otras alternativas evaluadas con el mismo script, por lo que no es posible una comparativa más amplia con modelos de tamaño similar.

## Limitaciones y advertencias

- Rendimiento débil en varias categorías del conjunto público de desarrollo: biology 0,0; crypto 0,0; compare 12,5; travel 20,0; synthesis 25,0.
- Tasa elevada de falsos rechazos: 66,7 % en la época 0 y 52,4 % en la época 1, es decir, el modelo declara que las fuentes son insuficientes cuando en realidad contienen la respuesta.
- `keyFactRecallPct` bajo: 19,0 en la época 0 y 21,0 en la época 1.
- No debe usarse para consejo médico o de primeros auxilios más allá de lo que digan literalmente los pasajes proporcionados.
- No está pensado para chat abierto sin pasajes ni para preguntas de dominio general.
- Solo inglés; no hay soporte multilingüe declarado.
- El conjunto de test sellado del bounty no ha sido evaluado; no se puede afirmar que supere esa prueba.
- La latencia medida en escritorio no es representativa de un teléfono Android de 6 GB.
- Licencia de los pesos Apache-2.0, pero los datos de entrenamiento SQuAD v2 son CC BY-SA 4.0 y arrastran obligaciones de sharealike sobre ese material; no debe declararse SQuAD como Apache-2.0.
- Riesgo de alucinación no cuantificado más allá de las métricas publicadas: `answersWithUnsupportedNumbersPct` = 0,0 y `answersWithBadCitePct` = 0,0 en el conjunto público de desarrollo, pero sin datos sobre el conjunto sellado.
- El repositorio no tiene descargas ni likes en el momento de la ficha y el autor no ha publicado los scripts de entrenamiento en el propio repositorio (se indica que se publicarán junto al GGUF).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Usman076/field-atlas-reader-qwen3-1.7b-q4km
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio Field Atlas: https://github.com/0x94t3z/fieldatlas
- Bounty poidh mainnet #45: https://poidh.xyz/mainnet/bounty/45
- Dataset SQuAD v2: https://huggingface.co/datasets/rajpurkar/squad_v2
