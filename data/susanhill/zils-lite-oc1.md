# SusanHill/zils-lite-oc1

## Resumen

zils-lite-oc1 es un modelo de lenguaje de tipo "decision" desarrollado por el usuario SusanHill y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B, con 852.985.920 par\u00e1metros totales seg\u00fan los pesos en safetensors, lo que lo sit\u00faa en la franja de los modelos peque\u00f1os (~0,85B) aptos para inferencia en hardware modesto.

Seg\u00fan la model card, el modelo se describe como un "Zils d3-lite soup body": un estudiante LoRA de rango 64 entrenado sobre la "answer layer" (la capa de respuesta) a partir de \u00edtems de "Zils Outcomes" resueltos y recopilados de fuentes p\u00fablicas como Gerrit, Stack Exchange, arXiv, Wikipedia/Wikidata y AfC (Articles for Creation). Los objetivos de entrenamiento combinan al 50% las probabilidades de modelos vllm-sr/d3-flash y al 50% el resultado real observado, una t\u00e9cnica de destilaci\u00f3n mixta con se\u00f1al de resultado.

La relevancia del modelo es acotada y experimental: se publica como un artefacto de investigaci\u00f3n sobre decisi\u00f3n y destilaci\u00f3n, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados. No hay benchmarks, demos ni documentaci\u00f3n adicional m\u00e1s all\u00e1 de la model card, por lo que su evaluaci\u00f3n pr\u00e1ctica queda pendiente de validaci\u00f3n por terceros.

## Especificaciones t\u00e9cnicas

| Par\u00e1metro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; tag `qwen3_5`, requiere `custom_code`) |
| Par\u00e1metros totales | 852.985.920 |
| Par\u00e1metros activos | no disponible (no es MoE seg\u00fan la informaci\u00f3n disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizaci\u00f3n | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85B par\u00e1metros, y se ajusta mediante un adaptador LoRA de rango 64 que, seg\u00fan la model card, entrena la "answer layer" del modelo. El resultado se presenta como un "soup body" de la familia d3-lite de Zils, lo que sugiere una fusi\u00f3n o composici\u00f3n de adaptadores, aunque la model card no detalla el procedimiento exacto de mezcla ni los hiperpar\u00e1metros de entrenamiento.

Los datos de entrenamiento son \u00edtems de "Zils Outcomes" resueltos, recopilados de fuentes p\u00fablicas: Gerrit (revisiones de c\u00f3digo), Stack Exchange (preguntas y respuestas t\u00e9cnicas), arXiv (preprints cient\u00edficos), Wikipedia/Wikidata (conocimiento enciclop\u00e9dico estructurado) y AfC (borradores de art\u00edculos). La se\u00f1al de supervisi\u00f3n es una mezcla al 50% de las probabilidades de los modelos vllm-sr/d3-flash y al 50% del resultado real (etiqueta de decisi\u00f3n observada). No se especifican el n\u00famero de tokens de entrenamiento, la composici\u00f3n exacta del dataset, ni si hubo RLHF o DPO. El tag `custom_code` indica que la carga del modelo requiere c\u00f3digo personalizado del repositorio, lo que a\u00f1ade fricci\u00f3n a su despliegue est\u00e1ndar.

## Capacidades

- Generaci\u00f3n de texto y decisi\u00f3n: el modelo est\u00e1 orientado a tareas de "decision" seg\u00fan sus tags, probablemente clasificaci\u00f3n o selecci\u00f3n de respuestas/resultados.
- Razonamiento sobre c\u00f3digo y revisiones: el entrenamiento con datos de Gerrit sugiere capacidad para evaluar parches y comentarios de revisi\u00f3n.
- Conocimiento t\u00e9cnico y enciclop\u00e9dico: influido por Stack Exchange, arXiv y Wikipedia/Wikidata.
- Soporte de tool calling / function calling: no disponible en la informaci\u00f3n proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informaci\u00f3n proporcionada.
- Capacidades multiling\u00fces: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, visi\u00f3n, audio): no disponibles en la informaci\u00f3n proporcionada.

## Casos de uso

- Clasificaci\u00f3n de resultados de revisiones de c\u00f3digo: dado un parche de Gerrit y su contexto, el modelo puede puntuar o predecir el resultado de la revisi\u00f3n (aceptado, rechazado, cambios solicitados), aprovechando su entrenamiento espec\u00edfico sobre ese tipo de datos.
- Selecci\u00f3n de respuestas en foros t\u00e9cnicos: podr\u00eda usarse para ordenar o elegir la mejor respuesta en hilos de Stack Exchange, dado que su se\u00f1al de entrenamiento incluye resultados reales de ese dominio.
- Triaje de borradores de art\u00edculos (AfC): el modelo puede estimar la probabilidad de aceptaci\u00f3n de un borrador de Wikipedia, ayudando a priorizar revisiones en flujos de moderaci\u00f3n.
- Filtrado de preprints relevantes: con datos de arXiv en su entrenamiento, podr\u00eda clasificar o priorizar preprints por relevancia o calidad percibida en un pipeline de curaci\u00f3n bibliogr\u00e1fica.
- Destilaci\u00f3n y experimentaci\u00f3n acad\u00e9mica: sirve como caso de estudio de destilaci\u00f3n mixta (probabilidades de profesor + etiqueta real) para investigadores que estudien t\u00e9cnicas de se\u00f1al de decisi\u00f3n.
- Prototipado en hardware de consumo: con ~0,85B par\u00e1metros, es viable para pruebas r\u00e1pidas en GPU de gama media o incluso CPU, aunque la falta de cuantizaciones publicadas limita su uso inmediato con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informaci\u00f3n disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tama\u00f1o (no dato del autor), un modelo de ~0,85B en FP16 requiere aproximadamente 1,7 GB de pesos, m\u00e1s overhead de activaciones y cach\u00e9 KV.
- GPU recomendadas: no disponibles. Por tama\u00f1o, cabr\u00eda en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, as\u00ed como en A100/H100 para despliegues por lotes, pero no hay validaci\u00f3n publicada.
- \u00bfCabe en GPU consumer? Previsiblemente s\u00ed por tama\u00f1o, aunque el tag `custom_code` puede exigir el c\u00f3digo del repositorio y complicar el despliegue con herramientas est\u00e1ndar.
- Opciones de despliegue: no disponibles de forma oficial. vLLM, TGI, llama.cpp u Ollama requerir\u00edan conversi\u00f3n a sus formatos, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Par\u00e1metros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-oc1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, requiere `custom_code` |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Alternativas de ~1B (p. ej. familia Llama 3.2 1B, Gemma 2 2B) | ~1-2B | no disponible en esta ficha | licencias propias | Hugging Face |

No se dispone de datos de rendimiento comparativo para zils-lite-oc1; la comparaci\u00f3n se limita a tama\u00f1o y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con fuentes p\u00fablicas (Gerrit, Stack Exchange, arXiv, Wikipedia) hereda los sesgos de esas comunidades.
- Riesgo de alucinaci\u00f3n: no evaluado; un modelo de 0,85B tiene capacidad limitada de verificaci\u00f3n factual.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no est\u00e1n declarados, lo que impide garantizar su comportamiento multiling\u00fce.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propios t\u00e9rminos que conviene revisar.
- Caveat de producci\u00f3n: el tag `custom_code` implica c\u00f3digo personalizado para cargar el modelo; sin benchmarks, sin pipeline declarado y con cero adopci\u00f3n, no es recomendable para producci\u00f3n sin una evaluaci\u00f3n propia.
- Documentaci\u00f3n m\u00ednima: la model card es muy escueta y no detalla hiperpar\u00e1metros, composici\u00f3n del dataset ni procedimiento de fusi\u00f3n.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-lite-oc1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
