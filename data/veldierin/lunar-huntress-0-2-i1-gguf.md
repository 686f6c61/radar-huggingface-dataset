# veldierin/Lunar-Huntress-0.2-i1-GGUF

## Resumen

Lunar Huntress 0.2 (versión GGUF cuantizada por veldierin) es un modelo de generación de texto orientado a roleplay y escritura creativa, construido sobre `gemma-4-31B-it` mediante un merge TIES de tres modelos: G4-MeroMero-31B (aportando coherencia de personaje), TheDrummer's Artemis 1.1 (voz y estilo de prosa) y scotoma-2 (como portador, con selección de tokens anti-slop). El modelo base es Husky110/Lunar-Huntress-0.2, y este repositorio contiene únicamente la cuantización IQ4_XS con matriz de importancia (imatrix), lista para llama.cpp y otros motores compatibles con GGUF.

Es relevante porque aborda un problema habitual en los merges de escritura creativa: la degradación del razonamiento y la aparición de "slop" (tokens repetitivos y frases hechas típicas de Gemma). La versión 0.2 introduce una curva de pesos por bandas de capas, de modo que cada ingrediente actúa solo donde aporta valor: la voz de Artemis se limita a las capas 51-59, evitando los bucles de razonamiento detectados en la v0.1. El modelo tiene 30,70 B parámetros, 262.144 tokens de contexto y está diseñado explícitamente para contenido adulto (18+), por lo que no es apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (transformer decoder, 60 capas, 5376 de dimension oculta) |
| Parametros totales | 30.697.345.596 (~30,70 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ4_XS + imatrix (i1), con 31 tensores attn_q subidos a Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo unico `Lunar-Huntress-0.2-i1-bt-IQ4_XS.gguf`, 15,98 GiB, 833 tensores) |

## Arquitectura y entrenamiento

El modelo base es un merge TIES (`rescale: true`, lambda global 1.0, dtype bfloat16) sobre `gemma-4-31B-it`, publicado por Husky110. La composicion es: scotoma-2 como portador en todas las capas (densidad 1.0, aporta tokenizer, plantilla de chat, formato de thinking y distribucion de tokens anti-slop), G4-MeroMero-31B con densidad 0.90 en las capas 12-59 (columna vertebral de personaje) y Artemis 1.1 con densidad 0.70 solo en las capas 51-59 (voz y estilo). Los embeddings y tensores de salida usan densidad 1.0 sobre `embed_tokens`, con peso 0,25 para ambos ingredientes en `embed/norm/lm_head`, de forma que los tokens de scotoma permanecen dominantes. La configuracion completa del merge consta de 303 entradas por tensor en un `mergekit_config.yml` de 689 lineas.

La novedad de la v0.2 es la asignacion de ingredientes por bandas de capas: las capas 0-11 solo contienen scotoma-2 (lectura del prompt), las capas 12-50 combinan scotoma-2 y MeroMero (con pico en la banda L26-35: attn 0,80 / mlp 0,85, y Artemis deliberadamente ausente por ser donde residia su bucle de razonamiento), y las capas 51-59 concentran la voz con Artemis en decrecimiento. No hay informacion publicada sobre datos de entrenamiento, numero de tokens ni ajuste fino con RLHF/DPO: se trata de un merge, no de un entrenamiento desde cero.

En cuanto a la cuantizacion de este repositorio: se convirtio de HF a GGUF en BF16 (57,2 GiB, sin cabeza MTP), se re-cuantizo a IQ4_XS con la matriz de importancia de bartowski para `google/gemma-4-31B-it`, y se aplico la receta de upcast IQ4_XS de bartowski mediante 31 pines explicitos de `--tensor-type` (todos en Q6_K: `token_embd.weight` y `attn_q.weight` en bloques seleccionados, incluidos todos los de la banda de voz 51-59). El autor verifica mediante script que los 31 pines estan presentes en el archivo final (380 tensores IQ4_XS, 31 Q6_K, 422 F32).

## Capacidades

- Generacion de texto creativo y roleplay conversacional, con personajes que mantienen sus propios limites en lugar de ceder de inmediato (rasgo heredado de MeroMero).
- Prosa con voz estilizada heredada de Artemis 1.1, limitada a las capas superiores para no degradar el razonamiento.
- Reduccion del "slop" (tokens y frases repetitivas tipicas de Gemma-4) gracias al portador scotoma-2.
- Formato de thinking y plantilla de chat embebida en el archivo GGUF (heredadas de scotoma-2).
- Contenido explicito para adultos (18+) por diseño; el modelo no esta pensado para fiabilidad factual ni asesoramiento.
- Solo texto: la torre de vision del modelo original no esta incluida en este archivo GGUF.
- No hay informacion publicada sobre tool calling, agentes ni capacidades multilingues especificas.

## Casos de uso

- Roleplay interactivo de larga duracion: con 262.144 tokens de contexto, puede mantener conversaciones de rol muy extensas sin perder el hilo de la trama ni de la ficha de personaje.
- Escritura de ficcion adulta (18+): diseñado explicitamente para narrativa explicita, util como asistente de escritura de novelas o relatos para publico adulto.
- Desarrollo de personajes con personalidad consistente: la columna vertebral de MeroMero aporta personajes que sostienen sus limites, util para bots de personaje con comportamiento estable a lo largo de muchas interacciones.
- Prosa de calidad en entornos locales: la cuantizacion IQ4_XS permite ejecutar un modelo de 30 B en una sola GPU consumer, adecuado para escritores que prefieren no depender de APIs.
- Experimentacion con merges y cuantizaciones: el repositorio incluye `conversion.json` y scripts de verificacion, util como referencia para quien estudia recetas de imatrix y upcasts de tensores.
- Pruebas A/B de estilos narrativos: al basarse en Artemis 1.1 (elegida sobre la 1.2 por coherencia segun Caliperbench), sirve para comparar voces de modelos Drummer en un mismo portador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del modelo base menciona referencias a Caliperbench para justificar la eleccion de Artemis 1.1 frente a 1.2, pero no se aportan cifras concretas en la model card. El propio autor advierte que el modelo no ofrece fiabilidad factual ni de asesoramiento.

## Requisitos de hardware

- El archivo GGUF pesa 15,98 GiB (17.155.892.672 bytes), por lo que en inferencia se necesita aproximadamente 17-19 GiB de VRAM/RAM considerando KV cache y overhead.
- Cabe en una RTX 4090 (24 GB) con margen para contexto moderado; en GPUs de 16 GB requeriria descarga parcial de capas a CPU (offloading de llama.cpp).
- Para contextos muy largos (acercandose a los 262.144 tokens), se recomiendan GPUs con mas memoria (RTX 5090, A100, H100) o cuantizacion de KV cache.
- Despliegue: llama.cpp de forma nativa (plantilla de chat embebida en el archivo); compatible con Ollama, LM Studio, koboldcpp y otros frontends GGUF. No hay informacion sobre vLLM o TGI para este archivo.
- No se publican estimaciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Lunar Huntress 0.2 (este) | 30,70 B | 262.144 | GGUF IQ4_XS | Apache-2.0 | Roleplay/escritura creativa 18+, merge TIES |
| G4-MeroMero-31B (ingrediente) | 31 B | no disponible | no disponible | no disponible | Personajes con limites propios |
| TheDrummer Artemis 1.1 (ingrediente) | 31 B | no disponible | no disponible | no disponible | Voz y estilo de prosa |
| ReadyArt gemma-4-31B-it-scotoma-2 (portador) | 31 B | no disponible | no disponible | no disponible | Distribucion de tokens anti-slop |

Los tres ingredientes comparten el ancestro comun `gemma-4-31B-it`, lo que hace viable el merge TIES. No se dispone de datos de rendimiento comparativo publicados entre ellos.

## Limitaciones y advertencias

- Contenido explicito 18+ por diseño: no apto para menores ni para entornos de trabajo; el repositorio esta etiquetado como `not-for-all-audiences`.
- Sin fiabilidad factual ni de asesoramiento: el autor lo declara explicitamente; no debe usarse como fuente de informacion veraz.
- Solo texto: la torre de vision del Gemma-4 original no esta en el GGUF, por lo que no acepta imagenes.
- Riesgo de alucinacion tipico de modelos generativos, agravado en un merge orientado a ficcion y no a exactitud.
- La v0.1 del merge sufria palabras pegadas y bucles de razonamiento que consumian todo el presupuesto de tokens; la v0.2 lo mitiga por diseño de bandas, pero conviene probar los samplers recomendados por el autor original.
- Idiomas soportados no documentados; al basarse en Gemma-4, presumiblemente funciona mejor en ingles.
- La cuantizacion IQ4_XS implica perdida de precision respecto al BF16 original, mitigada parcialmente por los upcasts a Q6_K en tensores clave.
- Licencia Apache-2.0 heredada sin cambios: permite uso comercial, pero el contenido generado puede estar restringido legalmente segun jurisdiccion por su naturaleza adulta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/veldierin/Lunar-Huntress-0.2-i1-GGUF
- Modelo base (merge original): https://huggingface.co/Husky110/Lunar-Huntress-0.2
- Transcripciones de pruebas del autor original: https://huggingface.co/Husky110/Lunar-Huntress-0.2/tree/main/tests
- Ingrediente MeroMero: https://huggingface.co/zerofata/G4-MeroMero-31B
- Ingrediente Artemis 1.1: https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- Portador scotoma-2: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Merge conceptual de referencia: https://huggingface.co/sophosympatheia/Mero-Artemis-31B-v0.3.1
