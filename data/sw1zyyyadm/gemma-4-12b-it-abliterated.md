# Sw1zyyyAdm/Gemma-4-12B-it-Abliterated

## Resumen

Gemma-4-12B-it-Abliterated es una edicion no oficial del modelo multimodal Gemma 4 12B IT de Google DeepMind, publicada por el usuario Sw1zyyyAdm bajo licencia Apache 2.0. El modelo base acepta texto, imagenes y audio como entrada y genera texto (pipeline any-to-any), y esta version aplica una tecnica de "abliteration" sobre las capas 24 a 36 del transformer de lenguaje para eliminar el comportamiento de rechazo (refusal) del modelo original.

La modificacion se denomina `projected_sra_gamma_l24_36` (Projected SRA con Gamma-MPOA) y actua sobre las proyecciones de salida de atencion (`o_proj`) y las proyecciones de bajada del MLP (`down_proj`) en 26 matrices del modelo de lenguaje. Los pesos de los proyectores de imagen y audio del checkpoint BF16 son identicos byte a byte a los del modelo base, por lo que las capacidades multimodales se conservan intactas.

El modelo tiene 11.907.350.576 parametros (aproximadamente 11,9 mil millones) y se distribuye en formato safetensors BF16 (22,28 GiB) y en siete cuantizaciones GGUF, ademas de un proyector multimodal compartido `mmproj-F16.gguf`. Es relevante para quienes necesitan un modelo multimodal de ~12B sin restricciones de rechazo y desplegable en hardware de consumo, aunque con advertencias importantes sobre seguridad y calidad de la edicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, audio) derivado de Gemma 4 12B IT; detalles de atencion no disponibles |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el Modelfile de Ollama configura 4096 tokens y los ejemplos de llama.cpp usan `-c 4096` |
| Tipos de cuantizacion | BF16 (safetensors); GGUF: Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector mmproj-F16 |
| Idiomas soportados | en, ru, zh, es, ar, hi, fr, de, pt, ja, ko, id |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un derivado del checkpoint `google/gemma-4-12B-it`, un transformer multimodal de Google DeepMind que procesa texto, imagenes y audio y emite texto. La model card no detalla la arquitectura interna del modelo base (tipo de atencion, numero de capas, dimension del hidden state ni composicion del dataset de entrenamiento), por lo que esos datos deben consultarse en la ficha oficial de Gemma 4 12B IT. Tampoco se documentan fases de RLHF, DPO ni el volumen de tokens de preentrenamiento en la informacion disponible.

La innovacion tecnica de esta edicion es la abliteration `projected_sra_gamma_l24_36`, que modifica las matrices `o_proj` y `down_proj` en las capas indexadas de 24 a 36 (26 matrices en total del modelo de lenguaje). El autor indica que el error de ida y vuelta en BF16 de los deltas de pesos editados esta entre el 6,49 % y el 10,04 %, por encima de la tolerancia de validacion del 5 % fijada por el propio autor. Los proyectores de imagen y audio no se tocan. No se especifica si hubo entrenamiento adicional: la abliteration se aplica como edicion de pesos, no como fine-tuning supervisado.

## Capacidades

- Generacion de texto conversacional multi-turno en 12 idiomas (ingles, ruso, chino, espanol, arabe, hindi, frances, aleman, portugues, japones, coreano e indonesio).
- Comprension de imagenes: descripcion de fotografias, OCR y analisis visual, mediante el proyector multimodal `mmproj-F16.gguf`.
- Comprension de audio: transcripcion de voz y procesamiento de senales de audio de entrada.
- Salida exclusivamente textual (pipeline any-to-any con entrada multimodal y salida de texto).
- Comportamiento de rechazo suprimido: en la prueba sintetica de privacidad del autor, el modelo base rechazo en 11 de 12 idiomas y esta edicion devolvio el valor de prueba en 12 de 12.
- Soporte de tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Modo thinking explicito: no documentado en la model card.

## Casos de uso

- Procesamiento documental con OCR multilingue: el modelo puede recibir imagenes de documentos en espanol, arabe, hindi o chino y extraer el texto, aprovechando que los proyectores visuales son identicos a los del modelo base y conservan su calidad original.
- Transcripcion y analisis de audio: con `mmproj-F16.gguf` y una cuantizacion Q4_K_M es posible transcribir grabaciones y resumirlas en una sola pasada, util para actas de reunion o notas de voz.
- Atencion al cliente multilingue sin filtros de rechazo: para escenarios donde el modelo base rechaza consultas legitimas por precaucion excesiva (por ejemplo, analisis de contenido sensible en moderacion), esta edicion responde directamente, aunque requiere supervision humana.
- Asistentes de escritorio locales: con Q4_K_M (6,87 GiB) cabe en GPUs de consumo de 8-12 GB y se integra via Ollama o llama.cpp para aplicaciones de escritorio con entrada de imagen y audio.
- Investigacion sobre alineacion y seguridad: sirve como caso de estudio de abliteration para medir como cambia la tasa de rechazo y la calidad en tareas benignas frente al modelo base, dado que el autor documenta comparaciones controladas.
- Generacion de descripciones de imagenes en pipelines de accesibilidad: el modelo puede etiquetar y describir fotografias en varios idiomas para generar texto alternativo en catalogos o plataformas de contenido.
- Prototipado de agentes multimodales en local: para pruebas de concepto que requieran entrada de imagen o audio sin depender de APIs externas, con la advertencia de que el tool calling no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta pruebas funcionales cualitativas:

| Prueba | Resultado |
|---|---|
| Smoke test de texto en las 7 cuantizaciones GGUF | Aprobado |
| Q4_K_M frente al modelo base: texto, imagen, OCR y voz sintetica | 7/7 coincidencias |
| Prueba basica de texto en 12 idiomas (ambos modelos) | 24/24 |
| Prueba sintetica de privacidad en 12 idiomas | Base rechaza 11/12; esta edicion responde 12/12 |
| Error de ida y vuelta BF16 de los deltas editados | 6,49 % - 10,04 % (tolerancia del autor: 5 %) |

## Requisitos de hardware

- VRAM para BF16: aproximadamente 22,28 GiB de pesos mas overhead de activaciones y KV cache; se recomienda una GPU de 40 GB o superior (A100 40 GB, A100 80 GB, H100) o reparto multi-GPU con `device_map="auto"`.
- VRAM para Q8_0: 11,80 GiB de pesos; cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) o A10G (24 GB) con margen para contexto moderado.
- VRAM para Q4_K_M (recomendado): 6,87 GiB de pesos mas el proyector de 0,11 GiB; cabe en RTX 4070 (12 GB), RTX 3060 (12 GB) y, con contexto corto, en GPUs de 8 GB.
- VRAM para Q3_K_M: 5,67 GiB; la opcion mas ligera para GPUs de 8 GB o menos con contexto limitado.
- Despliegue: Transformers con `AutoModelForMultimodalLM` y `AutoProcessor` para BF16; llama.cpp (`llama-mtmd-cli`) para GGUF con imagen y audio; Ollama mediante `Modelfile` (texto, contexto de 4096 tokens en la configuracion de ejemplo).
- vLLM y TGI: no documentados en la model card; el pipeline any-to-any con proyector multimodal puede requerir soporte especifico no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-it-Abliterated (esta ficha) | 11,9 B | no disponible (ejemplos a 4096) | texto, imagen, audio -> texto | Apache 2.0 | Abliteration en capas 24-36; 7 cuantizaciones GGUF |
| google/gemma-4-12B-it (base) | 11,9 B | no disponible | texto, imagen, audio -> texto | Apache 2.0 | Modelo original con rechazo intacto; referencia de calidad |
| Alternativas de ~12B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La abliteration suprime el rechazo de forma general, no selectiva: el modelo puede responder a solicitudes daninas, ilegales o inseguras que el modelo base bloquearia. No es apto para produccion sin filtros externos y supervision humana.
- El error de ida y vuelta BF16 de los deltas editados (6,49 % - 10,04 %) supera la tolerancia del 5 % fijada por el autor, lo que indica perdida de fidelidad numerica en las capas modificadas.
- Las pruebas del autor son cualitativas y de alcance reducido (una escena por idioma en la prueba de privacidad, 7 comprobaciones multimodales); no hay evaluaciones estandar que cuantifiquen la degradacion de calidad frente al base.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo base de 12B ya presenta este riesgo y la edicion no lo mitiga.
- Longitud de contexto: no declarada en la model card; los ejemplos usan 4096 tokens, muy por debajo de lo que suelen ofrecer los modelos actuales, lo que limita casos de uso con documentos largos.
- Idiomas: aunque se listan 12, no hay evaluaciones de calidad por idioma mas alla de la prueba basica de 24/24.
- Tool calling, agentes y modo thinking no estan documentados; no deben asumirse en produccion.
- Licencia Apache 2.0 declarada por el autor, pero al ser una edicion no oficial de un modelo de Google DeepMind conviene verificar los terminos del modelo base antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad; los checksums estan disponibles en `SHA256SUMS` para verificar la integridad de los archivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sw1zyyyAdm/Gemma-4-12B-it-Abliterated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia: https://huggingface.co/Sw1zyyyAdm/Gemma-4-12B-it-Abliterated/blob/main/LICENSE
- Checksums: https://huggingface.co/Sw1zyyyAdm/Gemma-4-12B-it-Abliterated/blob/main/SHA256SUMS
- Checkpoint BF16: https://huggingface.co/Sw1zyyyAdm/Gemma-4-12B-it-Abliterated/blob/main/models/safetensors/model.safetensors
- GGUF Q4_K_M: https://huggingface.co/Sw1zyyyAdm/Gemma-4-12B-it-Abliterated/blob/main/models/gguf/Gemma-4-12B-it-Abliterated-Q4_K_M.gguf
- Proyector multimodal: https://huggingface.co/Sw1zyyyAdm/Gemma-4-12B-it-Abliterated/blob/main/models/gguf/mmproj-F16.gguf
