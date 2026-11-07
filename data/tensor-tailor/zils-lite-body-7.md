# tensor-tailor/zils-lite-body-7

## Resumen

zils-lite-body-7 es un ajuste fino completo (full fine-tune) de un modelo "decision body" perteneciente al ecosistema Zils, concretamente al pool de mezclas (soup pool) `d3-lite` de la subred 127 de Bittensor. Lo desarrolla el usuario `tensor-tailor` y se construye sobre el chasis `vllm-sr/d3-lite`, que a su vez emplea la arquitectura y los tensores de lenguaje y visión de Qwen3.5-0.8B en bf16. El modelo cuenta con 852.985.920 parámetros reales según los pesos en safetensors, lo que lo sitúa en la franja de los modelos sub-1000M.

El modelo no es un re-upload de un modelo público: parte de la media uniforme en fp32 de `1lock/zils-lite-astrid-g1` y `bmars8218/zils-lite-body-2`, generada con la herramienta `soup.build` de Zils sobre el chasis `d3-lite` a temperatura 1.0, y posteriormente se somete a un ajuste fino completo de todos los tensores del modelo de lenguaje, dejando intactos los tensores de visión. Su propósito es actuar como "cuerpo de decisión" dentro del pool de Zils, es decir, un modelo especializado en tareas de decisión con formato de examen (preguntas de opción múltiple, verdadero/falso, etc.).

La relevancia de esta ficha radica en que documenta un modelo de nicho dentro de un ecosistema descentralizado (Bittensor), con un proceso de entrenamiento y filtrado de datos inusualmente detallado en su model card, y con una licencia Apache-2.0 que facilita su reutilización. No obstante, la información pública disponible es escasa en cuanto a benchmarks, idiomas y rendimiento, y el modelo tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (chasis d3-lite basado en Qwen3.5-0.8B, con tensores de lenguaje y visión; etiquetado como qwen3_5 en Hugging Face) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el entrenamiento descarta filas de más de 1.024 tokens, pero no se especifica la ventana de contexto del modelo) |
| Tipos de cuantizacion | no disponible (pesos en bf16; no se documentan cuantizaciones GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los datasets de entrenamiento son mayoritariamente en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code; requiere código personalizado para cargar) |

## Arquitectura y entrenamiento

El modelo emplea la disposición del chasis `d3-lite`, que integra los tensores de lenguaje y visión de Qwen3.5-0.8B en bf16. Se trata de un transformer denso (no MoE) de aproximadamente 853M de parámetros. El ajuste fino se realizó sobre todos los tensores del modelo de lenguaje, mantenidos en fp32 como maestro bajo autocast bf16, mientras que los tensores de visión permanecieron sin cambios. El entrenamiento usó AdamW sin weight decay, learning rate de 5e-6, warm-up lineal de 50 pasos seguido de decaimiento coseno, clipping de gradiente de 1.0, batch de 16, semilla 4343 y 2 épocas (1.486 pasos), descartando filas de más de 1.024 tokens. Se guardaron checkpoints al 25, 50, 75 % y al final, y se publican los pesos finales (paso 1.486).

La función de pérdida combina entropía cruzada suave hacia la respuesta del ítem, un término de Brier (peso 1) y una KL (peso 0.1) hacia las probabilidades del modelo de partida sobre ese mismo ítem. Además, se aplicó una regularización sobre 2.977 filas (25 % del total; 2.949 usadas, 28 descartadas por longitud) con KL (peso 1) hacia las probabilidades precalculadas del modelo de partida en preguntas de datasets públicos amplios, con el objetivo de preservar su capacidad en preguntas no relacionadas. El cambio relativo de las capas de lenguaje respecto a Qwen/Qwen3.5-0.8B es de 0.021 (límite Zils de 0.15; el modelo de partida ya estaba en 0.020). Los datos de entrenamiento son 8.931 ítems en formato del examen público de Zils, todos provenientes del split TRAIN de datasets públicos, con 5.856 ítems escritos específicamente para este cuerpo (generados por Qwen3-30B-A3B-Instruct-2507-FP8 y filtrados por acuerdo de muestreo y coincidencia con la etiqueta) y 3.075 filas etiquetadas por humanos convertidas al formato de examen. Se aplicaron filtros estrictos de solapamiento, duplicados, equilibrio de etiquetas y auditoría manual.

## Capacidades

- Generación de texto y razonamiento en formato de preguntas de decisión (opción múltiple, verdadero/falso, elección binaria), que es el formato para el que fue entrenado.
- Tareas de inferencia de lenguaje natural (NLI), razonamiento físico (PIQA), veridicalidad, análisis de sentimiento (Amazon Polarity) y recuperación de información (BoolQ, QNLI, COPA), según las familias de datos de entrenamiento.
- Capacidad de visión heredada del chasis Qwen3.5-0.8B (tensores de visión presentes, aunque no se ajustaron ni se documenta su rendimiento).
- Soporte de tool calling / function calling: no disponible (no se documenta; el dataset Glaive se usó solo como control de solapamiento, no como entrenamiento).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (los datasets de entrenamiento son en inglés; no se declaran idiomas).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Evaluación de modelos de decisión en el ecosistema Zils: el modelo está diseñado como "cuerpo de decisión" para el pool `d3-lite` de la subred 127 de Bittensor, por lo que su uso principal es participar en dicho pool y ser evaluado con el examen público de Zils.
- Clasificación de pares de frases (NLI): puede usarse para tareas de inferencia de lenguaje natural (contradicción, neutral, implicación) gracias a su entrenamiento con MultiNLI en formato de elección.
- Preguntas de verdadero/falso sobre pasajes: adecuado para tareas de verificación de afirmaciones (veridicality) y recuperación booleana (BoolQ), donde el modelo debe decidir si un pasaje responde a una pregunta.
- Razonamiento físico y sentido común: entrenado con PIQA, puede emplearse en tareas de selección de soluciones físicamente plausibles en escenarios cotidianos.
- Análisis de sentimiento binario: entrenado con Amazon Polarity, puede clasificar reseñas como positivas o negativas en formato de examen.
- Selección de causa/efecto: entrenado con COPA, puede usarse para tareas de elección entre causa o efecto plausible de un evento.
- Investigación sobre ajuste fino y regularización: el modelo documenta un proceso detallado de pérdida (entropía cruzada + Brier + KL) y regularización con KL, lo que lo hace útil como caso de estudio reproducible en experimentos de ajuste fino con preservación de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~853M de parámetros en bf16, los pesos ocupan aproximadamente 1,7 GB (tamaño del repo). En fp32 serían ~3,4 GB. La VRAM adicional para activaciones y caché KV depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (por ejemplo, RTX 3050, RTX 4060, RTX 4090) o incluso CPU para inferencia en cuantización. Para despliegue en producción con mayor throughput, se recomiendan GPUs como A100, H100 o L40S, aunque el tamaño del modelo no las exige.
- ¿Cabe en consumer GPU? Sí, con holgura: cabe en GPUs de consumo con 4-8 GB de VRAM en bf16, y en menos si se cuantiza (aunque no se documentan cuantizaciones oficiales).
- Opciones de despliegue: el modelo usa `custom_code` y la arquitectura `qwen3_5`, por lo que requiere confiar en código remoto (`trust_remote_code=True`) en transformers. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; dado que no hay pesos GGUF, llama.cpp/Ollama no están disponibles de forma nativa. vLLM podría requerir adaptaciones por el `custom_code`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-body-7 | 852.985.920 | no disponible | apache-2.0 | Hugging Face (0 descargas, 0 likes) | Full fine-tune de un soup Zils; custom_code |
| Qwen/Qwen3.5-0.8B | ~0.8B (no confirmado) | no disponible | no disponible | Hugging Face | Modelo base del chasis; referencia de capacidad general |
| 1lock/zils-lite-astrid-g1 | no disponible | no disponible | apache-2.0 | Hugging Face | Uno de los modelos de partida del soup |
| bmars8218/zils-lite-body-2 | no disponible | no disponible | apache-2.0 | Hugging Face | Otro modelo de partida del soup; LoRA rank 16 |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero los datasets de entrenamiento (MultiNLI, PIQA, COPA, Amazon Polarity, BoolQ, QNLI, MegaVeridicality) pueden introducir sesgos propios de sus dominios y de la generación sintética por Qwen3-30B-A3B-Instruct-2507-FP8.
- Riesgo de alucinación: el modelo está entrenado para tareas de decisión con opciones cerradas; fuera de ese formato puede generar respuestas no fundamentadas. No se documenta su comportamiento en generación abierta.
- Limitaciones de contexto o idioma: el entrenamiento descarta filas de más de 1.024 tokens y no se declara la ventana de contexto del modelo; los datos son mayoritariamente en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: la licencia es Apache-2.0, lo que permite uso comercial, pero los datasets originales tienen licencias variadas (OANC, CC BY-SA 3.0/4.0, Academic Free License 3.0, BSD-2-Clause, MIT, Apache-2.0) que podrían imponer obligaciones de atribución o compartir-igual en los datos derivados; conviene revisar cada una.
- Caveats para producción: el modelo requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del autor; no hay cuantizaciones oficiales ni soporte documentado en motores de inferencia populares; tiene cero descargas y likes, por lo que no hay validación comunitaria; y su propósito es muy específico (decision body para Zils), no un modelo de propósito general.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/tensor-tailor/zils-lite-body-7
- Perfil del autor: https://huggingface.co/tensor-tailor
- Modelo base 1lock/zils-lite-astrid-g1: https://huggingface.co/1lock/zils-lite-astrid-g1
- Modelo base bmars8218/zils-lite-body-2: https://huggingface.co/bmars8218/zils-lite-body-2
- Chasis vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo escritor Qwen/Qwen3-30B-A3B-Instruct-2507-FP8: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507-FP8
