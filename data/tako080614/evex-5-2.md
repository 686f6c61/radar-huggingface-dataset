# tako080614/evex-5.2

## Resumen

evex-5.2 es un modelo de lenguaje japonés entrenado **desde cero** exclusivamente con los registros de un servidor de Discord. Lo desarrolla el usuario tako080614 y su objetivo no es ser un modelo generalista, sino capturar el estilo conversacional, las dinámicas y las peculiaridades lingüísticas de una comunidad concreta. Es un experimento de investigación sobre hasta qué punto un modelo pequeño puede aprender la "personalidad" colectiva de un grupo a partir de sus conversaciones.

El modelo es un transformer decoder-only con 25.763.264 parámetros, 8 capas, dimensión de modelo 384, 6 cabezas de atención y contexto de 1024 tokens. Su innovación principal es el uso de **PLE (Per-Layer Embeddings)**, una técnica inspirada en Gemma 3n que añade vectores auxiliares por token y por capa, logrando un incremento de capacidad del 36% con solo un 3% más de coste computacional por token. También incorpora QK-norm y weight tying. Su formato de prompt es completamente personalizado, basado en tokens simbólicos que codifican la estructura conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE + RMSNorm + SwiGLU, QK-norm, weight tying) |
| Parametros totales | 25.763.264 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | japones (entrenado exclusivamente con datos en japones) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only relativamente pequeño (8 capas, d_model 384, 6 cabezas). Incorpora varias innovaciones técnicas: **PLE (Per-Layer Embeddings)** con dimensión d_ple=64, que añade vectores auxiliares por token y capa mediante una tabla de consulta en lugar de multiplicación de matrices, lo que incrementa la capacidad del modelo en un 36% con solo un 3% más de coste por token en CPU; **QK-norm**, que aplica RMSNorm a las consultas y claves antes de RoPE; y **weight tying** entre la capa de embedding y la cabeza de salida.

El entrenamiento se realizó en dos etapas. La primera etapa usó datos externos de conversación japonesa (Japanese-Roleplay-Dialogues, JESC y open2ch) junto con registros sin procesar del servidor, totalizando 489.523.351 caracteres. La segunda etapa se entrenó exclusivamente con los registros del servidor de Discord, con aumento de datos mediante ventanas deslizantes, sumando 191.733.603 caracteres. En la versión 5.2 se introdujo un cambio importante: se extrajeron 2.500 muestras por cada uno de los 147 hablantes identificados (366.152 conversaciones adicionales), para equilibrar la representación entre hablantes frecuentes e infrecuentes. Se comparó AdamW + cosine frente a Muon + WSD + máscara intra-documento, optando por el primero por producir respuestas con más contenido.

## Capacidades

- Generacion de texto conversacional en japones con estilo imitativo de los hablantes del servidor.
- Modelado de conversaciones multi-turno con estructura de canal, hablante y respuestas.
- Distincion entre 147 hablantes anonimos (tokenizados como `<|s0|>` a `<|s146|>`) y 8 hablantes contextuales (`<|a|>` a `<|h|>`).
- Reconocimiento de mensajes con reacciones (token `<|hi|>`) para generar contenido con mayor probabilidad de recibir reacciones.
- Soporte de canales (16 canales distintos + canal genérico).
- Normalizacion de URLs, archivos, menciones, canales y marcas de tiempo en tokens especiales.
- Capacidad de continuar una conversacion especificando el hablante deseado al final del prompt.
- Deteccion y generacion de bloques de codigo con tokens `<|code|>` y `</code>`.
- Tokenizer propio (sentencepiece BPE con byte_fallback) con vocabulario de 12.288 tokens, entrenado con los registros del servidor.

## Casos de uso

- **Generacion de respuestas estilo "miembro del servidor"**: el modelo puede producir mensajes que imitan el estilo de un hablante concreto (usando su token `<|sN|>`) o de un hablante genérico, útil para bots que participan en conversaciones de Discord.
- **Simulacion de conversaciones completas**: dado un prompt con estructura de conversación, el modelo puede continuar generando intercambios entre múltiples hablantes, útil para crear demos o material de entretenimiento.
- **Estudio sociolinguistico**: investigadores pueden analizar qué patrones lingüísticos aprendió el modelo sobre cada hablante y sobre la comunidad en general, dado que los tokens de hablante son anónimos pero las peculiaridades de cada uno quedan codificadas en los pesos.
- **Generacion de respuestas con alta probabilidad de reaccion**: al incluir el token `<|hi|>` antes del hablante objetivo, el modelo tiende a generar mensajes del tipo que suele recibir reacciones en el servidor, útil para bots que buscan engagement.
- **Prototipo de investigacion en modelos pequeños**: sirve como caso de estudio para evaluar el impacto de PLE, QK-norm y weight tying en modelos de menos de 30M parámetros entrenados desde cero.
- **Generacion de codigo en contexto conversacional**: el modelo puede generar bloques de codigo dentro de conversaciones, aunque su conocimiento de programación es limitado y derivado de los registros del servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la loss de validacion de **6.7944** en la epoca 8, que no es directamente comparable con benchmarks estandar como MMLU o HumanEval.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 25.763.264 parametros. En FP32 ocuparia ~103 MB, en FP16 ~51 MB. Cabe en cualquier GPU moderna, incluso en CPU.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una CPU moderna puede ejecutar inferencia sin problemas.
- **Compatibilidad con GPU de consumo**: si, cualquier GPU de consumo (incluso integradas) puede ejecutar este modelo.
- **Opciones de despliegue**: el repositorio incluye `model.py` con la clase `MicroLM` para inferencia en Python con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponible, pero por el tamano del modelo se espera una latencia muy baja incluso en CPU. El autor menciona que PLE esta optimizado para modelos donde la inferencia en CPU esta limitada por multiplicacion de matrices.

## Comparativa con modelos similares

No disponible. Este modelo es un caso atipico: es un modelo de 25M parametros entrenado desde cero para una comunidad especifica de Discord, sin equivalentes directos en el ecosistema. Los modelos japoneses comparables (como LINE-distilbert-japanese o tohoku-nlp/bert-base-japanese) son de tipo BERT (encoder-only) y no estan entrenados para generacion conversacional. No hay modelos de generacion de tamano similar entrenados desde cero con fines conversacionales publicados en HuggingFace con los que se pueda comparar directamente.

## Limitaciones y advertencias

- **No es un modelo generalista**: esta fuertemente sesgado hacia el argot, las bromas internas y los temas de conversacion de un unico servidor de Discord. No es util para tareas generales de NLP en japones.
- **No sirve para verificacion de hechos**: el autor indica explicitamente que la correccion de las salidas no esta garantizada y que el modelo no es apto para tareas de fact-checking.
- **Sin filtro de contenido nocivo**: el modelo no tiene ningun filtro de expresiones daninas, ni en los datos de entrenamiento ni en la inferencia. Puede generar contenido ofensivo o inapropiado.
- **Riesgo de privacidad por nombres de usuario**: aunque los tokens de hablante son anonimos, el tokenizer se entreno con los registros del servidor y los nombres de usuario frecuentes (16 de 147, incluyendo 7 del top 20) quedaron codificados como tokens individuales en el vocabulario. Alguien con acceso al tokenizer podria enumerarlos y leerlos.
- **Formato de prompt propietario**: el modelo requiere un formato de prompt especifico con tokens simbolicos (`<|conv|>`, `<|cN|>`, `<|sN|>`, `<|re|>`, etc.). No es compatible con chat templates estandar ni con el formato de modelos instruct convencionales. Usarlo incorrectamente produce salidas inutilizables.
- **Restricciones de licencia**: la licencia CC-BY-4.0 permite uso comercial con atribucion, pero los datos de entrenamiento incluyen JESC (CC-BY-4.0) y otros datasets con licencias Apache-2.0. El modelo en si no tiene restricciones adicionales de uso.
- **Ventana de contexto limitada**: 1024 tokens es suficiente para conversaciones cortas pero insuficiente para contextos largos o conversaciones muy extensas.
- **Sesgo por frecuencia de hablantes**: los hablantes con mas mensajes (hasta 55.964) estan mucho mejor modelados que los de menos (minimo 203), con una diferencia de 275x entre ambos extremos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/tako080614/evex-5.2)
- [Version anterior: evex-2](https://huggingface.co/tako080614/evex-2)
- [Version fine-tuned: evex-ft-1](https://huggingface.co/tako080614/evex-ft-1)
- [Dataset: OmniAICreator/Japanese-Roleplay-Dialogues](https://huggingface.co/datasets/OmniAICreator/Japanese-Roleplay-Dialogues)
- [Dataset: nntsuzu/JESC](https://huggingface.co/datasets/nntsuzu/JESC)
- [Dataset: p1atdev/open2ch](https://huggingface.co/datasets/p1atdev/open2ch)
- [Corpus original de open2ch](https://github.com/1never/open2ch-dialogue-corpus)
