# xtools-at/Ministral-3-8B-Reasoning-UNCENSORED-heretic

## Resumen
Ministral-3-8B-Reasoning-UNCENSORED-heretic es una variante "decensored" (abliterated) del modelo unsloth/Ministral-3-8B-Reasoning-2512, que a su vez deriva del Ministral 3 8B Reasoning 2512 de Mistral AI. La modificacion la firma el usuario xtools-at mediante la herramienta Heretic v2.0.0.dev0, que aplica una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 13 a 25 del transformer para eliminar el comportamiento de rechazo aprendido durante el post-entrenamiento.

El modelo conserva la arquitectura Mistral 3 con dos componentes: un modelo de lenguaje denso de 8,4B parametros y un codificador visual de 0,4B, sumando 8.918.026.240 parametros totales en safetensors BF16. Mantiene la ventana de contexto de 256k tokens del original, el soporte para 11 idiomas y las capacidades agenticas (function calling nativo y salida JSON), pero renuncia practicamente por completo a las negativas: la model card reporta 6 rechazos de 100 frentes a 96 de 100 del modelo original, con una divergencia KL de 0,0839 respecto a la distribucion de referencia.

Es relevante ahora porque demuestra que la eliminacion de rechazos puede hacerse con una intervencion quirurgica sobre un subconjunto de capas y con una metrica de coste (KL) publicada, lo que interesa tanto a quien necesita un modelo sin filtros de negativa para generacion creativa o red teaming como a quien investiga tecnicas de abliteration y su impacto en la calidad. Aviso importante: es un fork de la comunidad con 0 descargas y 0 likes en el momento de la ficha, sin evaluaciones estandar publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral 3 (transformer decoder-only denso) + codificador visual de 0,4B; modelo de lenguaje de 8,4B |
| Parametros totales | 8.918.026.240 (8,9B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256.000 tokens (256k), segun la model card del modelo base |
| Tipos de cuantizacion | el repositorio solo publica pesos safetensors (17,9 GB, coherente con BF16); la model card enlaza las cuantizaciones GGUF Dynamic 2.0 de Unsloth para el modelo base, no incluidas en este repo |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar (11 idiomas declarados; la model card indica "docenas de idiomas") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; libreria declarada vllm; tokenizador compatible con mistral-common |

## Arquitectura y entrenamiento
La base es un transformer decoder-only denso de la familia Ministral 3, con 8,4B parametros en el modelo de lenguaje y un codificador visual separado de 0,4B que aporta capacidad de analisis de imagenes ademas de texto. El contexto es de 256k tokens y el modelo original es la version post-entrenada para razonamiento ("Reasoning 2512"), orientada a matematicas, codigo y tareas STEM, con soporte nativo de function calling y salida JSON. No se dispone de datos sobre el numero de tokens de preentrenamiento, la composicion del dataset ni las etapas concretas de RLHF/DPO aplicadas por Mistral AI: esa informacion no esta disponible en el material proporcionado.

La unica modificacion respecto al modelo de Unsloth es la ablacion ARA aplicada con Heretic v2.0.0.dev0 sobre las capas 13 a 25 (start_layer_index 13, end_layer_index 25), con los hiperparametros preserve_good_behavior_weight 0.6557, steer_bad_behavior_weight 0.0009, overcorrect_relative_weight 0.3689 y neighbor_count 7. Se trata de una intervencion sobre los pesos/activaciones en el rango de capas medias, no de un reentrenamiento: no hay nuevos datos de entrenamiento ni fine-tuning supervisado documentado. El coste de la intervencion se cuantifica con una divergencia KL de 0,0839 respecto al modelo original y con una evaluacion de rechazos sobre 100 prompts (6/100 en este modelo frente a 96/100 en el original). No se documentan otras innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades
- Generacion de texto y razonamiento multi-paso: el post-entrenamiento de razonamiento del modelo base esta orientado a matematicas, codigo y tareas STEM, con trazas de razonamiento que la model card recomienda mantener en el contexto en conversaciones multiturno.
- Vision: analisis y descripcion de imagenes y documentos gracias al codificador visual de 0,4B; se recomienda mantener relaciones de aspecto cercanas a 1:1.
- Multilingue: 11 idiomas declarados (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe).
- Function calling nativo y salida en JSON, con capacidad agentica declarada como "best-in-class" a esta escala por el autor del modelo base.
- Adherencia a system prompt: el modelo base se disena para seguir instrucciones de sistema estrictas, incluida la guia de uso de herramientas.
- Supresion del comportamiento de rechazo: 6 negativas sobre 100 prompts en la evaluacion del autor, frente a 96 sobre 100 del original.
- Ajuste fino y especializacion: al publicarse en safetensors y con licencia Apache 2.0, es adaptable con las herramientas habituales (Unsloth, PEFT, TRL).
- Despliegue en vLLM de forma nativa (libreria declarada en el repo).

## Casos de uso
- Asistente personal local: con pesos BF16 de 17,9 GB cabe en una GPU de 24 GB (RTX 4090, RTX 3090, L4, A10G) y, cuantizado, por debajo de 12 GB segun la model card, lo que permite ejecutarlo como "daily driver" en una estacion de trabajo sin depender de la nube.
- Analisis de documentos con imagenes: el codificador visual permite extraer informacion de capturas, facturas escaneadas o diagramas; conviene recortar las imagenes a proporciones cercanas a 1:1 antes de enviarlas.
- Agentes con herramientas en produccion interna: el function calling nativo y la salida JSON permiten encadenar llamadas a APIs en pipelines de automatizacion, limitando el numero de herramientas declaradas para no degradar la seleccion.
- Traduccion y generacion de contenido multilingue: cubre 11 idiomas declarados, util para localizacion de documentacion tecnica o atencion al cliente en varios mercados con un unico modelo.
- Conversaciones de atencion al cliente de contexto largo: los 256k tokens permiten mantener historiales extensos o volcar manuales completos en el contexto sin truncar; hay que presupuestar el coste en tokens, ya que las trazas de razonamiento se recomienda conservarlas.
- Red teaming y evaluacion de seguridad: sirve como modelo de referencia para medir hasta que punto la abliteration elimina las negativas y que degradacion introduce (KL 0,0839), comparandolo con el original en baterias de prompts propios.
- Generacion creativa sin filtros de negativa: escritura de ficcion, guiones o roleplay donde el modelo original rechazaria escenarios oscuros o controvertidos; requiere moderacion externa si el resultado se publica.
- Despliegue en entornos aislados (air-gapped): al ser un modelo de 8,9B con licencia Apache 2.0, puede ejecutarse en hardware propio sin conexion, algo relevante en defensa, sanidad o industria.

## Benchmarks y rendimiento
La informacion disponible solo incluye la evaluacion de comportamiento del autor (supresion de rechazos y coste en divergencia KL). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (100 prompts) | 6/100 | 96/100 |
| Divergencia KL | 0,0839 | 0 (por definicion) |

## Requisitos de hardware
- Inferencia en BF16: 17,9 GB solo de pesos, mas cache KV; requiere GPU de 24 GB o superior (RTX 4090, RTX 3090, L4, A10G, L40S, A100 40/80 GB, H100).
- Inferencia cuantizada: la model card del modelo base indica menos de 12 GB de RAM/VRAM en cuantizacion; una cuantizacion de 4 bits de 8,9B se situa aproximadamente en 5-6 GB (estimacion a partir del numero de parametros, no verificada en este repo).
- Cabe en GPU de consumo: si en RTX 4090/3090 a BF16; en RTX 4060 Ti 16 GB o RTX 4070 12 GB solo con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM (libreria declarada en el repositorio), TGI, llama.cpp u Ollama mediante GGUF del modelo base de Unsloth (Dynamic 2.0), y transformers/PEFT para ajuste fino. El tokenizador requiere mistral-common.
- Contexto largo: con 256k tokens la cache KV crece de forma proporcional; para ventanas muy grandes es necesario tensor parallelism o GPU con 80 GB.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este modelo (heretic) | 8,9B (8,4B LM + 0,4B vision) | 256k | Si | Apache 2.0 | Reasoning con rechazos eliminados via ARA |
| unsloth/Ministral-3-8B-Reasoning-2512 | 8,9B | 256k | Si | Apache 2.0 | Reasoning original, alineado (96/100 rechazos) |
| mistralai/Ministral-3-8B-Reasoning-2512 | 8,9B | 256k | Si | Apache 2.0 | Modelo oficial de Mistral AI, con gating en el acceso |
| mistralai/Ministral-3-3B-Reasoning-2512 | 3B | no disponible | no disponible | Apache 2.0 | Version reducida de la familia, orientada a edge |

La diferencia practica frente a las tres alternativas es unicamente el comportamiento de rechazo y la divergencia KL introducida; en parametros, contexto y licencia son equivalentes. No se dispone de comparaciones de rendimiento en tareas (MMLU, HumanEval) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Ausencia de alineacion de seguridad: el proceso de abliteration elimina las negativas, por lo que el modelo puede producir contenido danino, ilegal o sexualmente explicito. No es apto para exposicion directa a usuarios finales sin moderacion externa.
- Degradacion no medida: la unica metrica de coste publicada es la divergencia KL (0,0839); no hay evaluaciones de si la ablacion en las capas 13-25 degrada razonamiento, codigo o vision.
- Evaluacion muy limitada: los resultados de rechazo proceden de solo 100 prompts y de un unico evaluador (el propio autor de la modificacion), sin protocolo ni semilla documentados.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de la ficha; es un fork reciente (creado el 2026-10-20) sin replicaciones independientes.
- Riesgo de alucinacion: inherente a un modelo de 8,9B que no publica benchmarks de fidelidad; con contexto de 256k el riesgo de mezclar informacion distante aumenta si no se estructura el prompt.
- Caveats de uso del modelo base heredados: mantener las trazas de razonamiento en contexto en conversaciones multiturno (encarece el prompt), temperatura recomendada de 0,7, limitar el numero de herramientas declaradas y usar imagenes con proporcion cercana a 1:1.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la responsabilidad legal del contenido generado recae en el desplegador; el campo extra_gated_description del modelo original remite a la politica de privacidad de Mistral AI.
- Idiomas: aunque se declaran 11, no hay evaluaciones por idioma; el rendimiento en espanol, arabe o coreano no esta verificado.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/xtools-at/Ministral-3-8B-Reasoning-UNCENSORED-heretic
- Modelo base (Unsloth): https://huggingface.co/unsloth/Ministral-3-8B-Reasoning-2512
- System prompt recomendado del modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512/blob/main/SYSTEM_PROMPT.txt
- Heretic (herramienta de abliteration): https://heretic-project.org
- Documentacion de Unsloth: https://docs.unsloth.ai/
- Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Ministral 3 3B Base 2512: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Ministral 3 3B Instruct 2512: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Ministral 3 3B Reasoning 2512: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Nota sobre la busqueda web: los resultados obtenidos corresponden a la marca de maquinas de grabacion laser xTool y no guardan relacion con este modelo; no se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
