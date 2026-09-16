# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-Roundtrip-PR3118

## Resumen

Qwen3.8-27B-FP8Dyn-MTP-FP8-Roundtrip-PR3118 es un checkpoint derivado de Qwen/Qwen3.8-27B publicado por el usuario soyrsoyr en HuggingFace. No se trata de un modelo entrenado desde cero ni de una release oficial de Qwen, sino de un artefacto de validacion tecnica: contiene el modulo de prediccion multi-token (MTP) copiado del checkpoint base y cuantizado con el esquema `FP8_DYNAMIC`, mientras que el backbone en FP8 dinamico se reutiliza sin cambios de otro repositorio de la misma cadena. El objetivo declarado es ejercitar el helper de guardado de MTP introducido en el PR3118 del repositorio llm-compressor.

El modelo tiene 27.320.697.856 parametros (dato real extraido de los safetensors) y el repositorio ocupa 35,5 GB. Se distribuye en formato safetensors con `compressed-tensors`, es compatible con la libreria `transformers` y esta etiquetado para `text-generation` y, de forma secundaria, para `image-text-to-text`. La licencia declarada es Apache 2.0, aunque el propio autor recuerda que se aplican los terminos de licencia originales de Qwen.

Su relevancia es acotada y muy especifica: sirve como escala intermedia en una cadena de tres etapas (copia, FP8 y vuelta a BF16) pensada para verificar que una cuantizacion FP8 dinamica del modulo MTP se guarda, se carga y se sirve correctamente con vLLM. El autor lo describe explicitamente como una prueba de humo de pipeline y serving, no como un benchmark de calidad o de rendimiento. No hay resultados de calidad publicados, no tiene descargas ni likes y la model card es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint derivado del backbone de Qwen/Qwen3.8-27B con modulo MTP; etiqueta de familia `qwen3_5` en HuggingFace) |
| Parametros totales | 27.320.697.856 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (`FP8_DYNAMIC`) en el modulo MTP; backbone FP8 dinamico reutilizado de otro checkpoint |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (se aplican los terminos originales de Qwen) |
| Formato de pesos | safetensors con `compressed-tensors` |
| Tamano del repositorio | 35,5 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Fecha de creacion / actualizacion | 2026-09-15 (misma fecha en ambos campos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo base ni sobre su entrenamiento. Lo unico documentado es el proceso de cuantizacion aplicado en este repositorio: el backbone en FP8 dinamico se reutiliza sin modificar desde soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation, y este run unicamente cuantiza el modulo MTP con `mtp_scheme="FP8_DYNAMIC"`. El autor indica de forma explicita que esta ejecucion "no rerun full-model oneshot or backbone quantization", es decir, no se repitio la cuantizacion oneshot del modelo completo.

La innovacion tecnica implicada es el modulo MTP (multi-token prediction), un cabezal adicional que predice varios tokens por paso y que se emplea habitualmente para decodificacion especulativa: el modelo propone tokens draft que el modelo principal verifica, reduciendo el numero de pasos de decodificacion necesarios. El proposito de este repositorio es validar el helper de guardado de ese modulo en llm-compressor (PR3118, commit 3dd54c307) dentro de una cadena de tres etapas: copy, FP8 y BF16 desde FP8. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto y uso conversacional: es el pipeline declarado (`text-generation`, etiquetas `conversational`), heredado del modelo base.
- Prediccion multi-token (MTP): incluye el modulo MTP cuantizado, pensado para decodificacion especulativa con un token draft.
- Servicio con vLLM: el checkpoint se ha cargado y servido con exito en vLLM 0.28.0 (confirmado en la prueba de humo).
- Compatibilidad con `transformers` y `compressed-tensors` como formatos de carga.
- Posible entrada de imagen: la etiqueta `image-text-to-text` figura entre los tags de HuggingFace, aunque no se documenta ni se demuestra en la model card. Debe tratarse como indicio, no como capacidad confirmada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia en produccion con restricciones de VRAM: el checkpoint en FP8 reduce la huella de pesos a aproximadamente un byte por parametro, lo que permite servir un modelo de 27,32 B en GPUs donde la version BF16 no cabria sin sharding. Es adecuado cuando el objetivo prioritario es reducir memoria a costa de una posible perdida de precision.
- Decodificacion especulativa de baja latencia: el modulo MTP permite generar tokens draft y verificarlos en un solo paso, lo que se traduce en menos pasos de decodificacion. El autor midio 29 de 34 tokens draft aceptados en una generacion de 64 tokens, lo que da una idea del potencial, aunque con una sola muestra.
- Validacion de pipelines de cuantizacion: sirve como escala intermedia para comprobar que llm-compressor (PR3118) guarda correctamente el modulo MTP en FP8 y que el resultado se puede recargar sin corrupcion de tensores. El propio repositorio incluye `pr3118-validation.json` con la peticion, la respuesta y los contadores.
- Auditoria de degradacion FP8 frente a BF16: la cadena copy / FP8 / BF16-desde-FP8 permite comparar la salida de cada etapa y estimar el impacto del "roundtrip" de cuantizacion sobre el modelo.
- Servicio con vLLM en TP=1: el checkpoint esta probado con tensor parallel de 1, util para despliegues en una unica GPU grande (por ejemplo, B200, H100 o A100 de 80 GB) sin necesidad de orquestar sharding.
- Banco de pruebas interno de MTP: util para equipos que investigan decodificacion especulativa y necesitan un checkpoint reproducible con el que medir tasas de aceptacion de tokens draft, sin depender de que el modelo sea de calidad final.
- Documentacion de trazabilidad de artefactos: al estar los tres eslabones publicados por separado, permite reconstruir de donde sale cada tensor, algo util en procesos de revision de artefactos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato numerico publicado es una prueba de humo de aceptacion de tokens MTP:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Aceptacion de tokens draft MTP | vLLM 0.28.0, TP=1, un token especulativo MTP, una GPU B200, una generacion de 64 tokens | 29/34 tokens draft aceptados (85,29 %) |

El autor advierte de forma explicita que se trata de "a short pipeline/serving smoke test, not a quality or performance benchmark". No hay datos de throughput, TTFT, latencia por token ni evaluaciones comparativas con el modelo base.

## Requisitos de hardware

- VRAM para pesos en FP8: aproximadamente 27,3 GB (1 byte por parametro sobre 27.320.697.856 parametros), estimacion derivada del recuento real de parametros; hay que sumar cache KV y activaciones, no cuantificadas aqui.
- VRAM para pesos en BF16: aproximadamente 54,6 GB (2 bytes por parametro), estimacion derivada; corresponde al eslabon BF16 de la misma cadena.
- GPU confirmada: una NVIDIA B200, reservada por el autor y usada con vLLM 0.28.0 en TP=1.
- GPUs compatibles por memoria: cualquier acelerador con 80 GB (H100, A100 80 GB) deberia alojar los pesos FP8 con margen para cache KV; en configuraciones de 40 GB o menos probablemente sea necesario sharding o cuantizacion adicional.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) con los pesos FP8 completos, ya que solo los pesos ya ocupan mas de 27 GB. Requeriria cuantizaciones de 4 bits no publicadas en este repositorio.
- Opciones de despliegue confirmadas: vLLM 0.28.0 y `transformers` con `compressed-tensors`. Otros motores (llama.cpp, Ollama, TGI) no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles; el autor no aporta medidas de rendimiento.

## Comparativa con modelos similares

No hay datos publicados de benchmarks que permitan comparar este checkpoint con alternativas de su categoria. Si se puede comparar con los otros eslabones de su propia cadena y con el modelo base:

| Modelo | Parametros | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-FP8Dyn-MTP-FP8-Roundtrip-PR3118 (este) | 27,32 B | FP8 dinamico en el modulo MTP; backbone FP8 reutilizado | apache-2.0 | safetensors (compressed-tensors) | Etapa FP8 de la cadena; 29/34 tokens draft aceptados en la prueba de humo |
| Qwen3.8-27B-FP8Dyn-MTP-Copy-PR3118 | no disponible | no disponible | no disponible | no disponible | Etapa de copia de la cadena |
| Qwen3.8-27B-FP8Dyn-MTP-BF16-Roundtrip-PR3118 | no disponible | BF16 desde FP8 | no disponible | no disponible | Etapa de vuelta a BF16, para medir el efecto del roundtrip |
| Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation | no disponible | BF16 | no disponible | no disponible | Origen del backbone FP8 reutilizado |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | apache-2.0 segun el modelo derivado | no disponible | Modelo original del que proceden todos los derivados |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su modelo base: los unicos enlaces recuperados corresponden a servicios de gestion de endpoints de TI y ensayos clinicos, sin relacion con el contenido.

## Limitaciones y advertencias

- No es un modelo oficial: es un artefacto de validacion publicado por un usuario individual, sin respaldo del equipo de Qwen.
- Ausencia total de benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. El unico numero publicado es una tasa de aceptacion de tokens draft sobre una unica generacion de 64 tokens, estadisticamente irrelevante para extrapolar comportamiento.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento del analisis, y el repositorio fue creado y actualizado el mismo dia.
- Riesgo de degradacion por cuantizacion: la cuantizacion FP8 dinamica puede alterar la calidad de salida respecto a BF16; el proposito del eslabon BF16 de la cadena es precisamente medir ese efecto, pero no hay resultados publicados.
- Sin datos de entrenamiento, sesgos ni alineacion: no se documenta dataset, proceso de RLHF/DPO ni evaluaciones de sesgo, por lo que no se puede caracterizar el riesgo de sesgo ni de contenido inapropiado.
- Metadata incompleta: no se informan idiomas soportados, longitud de contexto, parametros activos ni regimen de cuantizacion del backbone mas alla de que se reutiliza en FP8 dinamico.
- Discrepancia de etiquetas: el pipeline declarado es `text-generation`, pero entre los tags figura `image-text-to-text`, lo que sugiere capacidades de vision no documentadas ni verificadas. No debe asumirse que funcionen.
- Licencia: se declara apache-2.0, pero la model card indica que "Original Qwen licensing applies". Conviene revisar los terminos del modelo base antes de cualquier uso comercial.
- Sin garantia de mantenimiento ni soporte: es un experimento de un solo commit, sin versionado posterior ni promesa de estabilidad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos y no evaluado en este repositorio.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-Roundtrip-PR3118
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Etapa de copia: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-Copy-PR3118
- Etapa BF16 desde FP8: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-Roundtrip-PR3118
- Origen del backbone FP8 reutilizado: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation/tree/bbbfdb242bab29bca528efaf0f5295e0ff38e9d7
- Validacion del PR3118 (JSON incluido en el repositorio): pr3118-validation.json
- llm-compressor PR3118 (commit 3dd54c307): https://github.com/vllm-project/llm-compressor/commit/3dd54c307dd68074c8af055cb5017093a4880e54
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- Busqueda web: sin resultados relevantes; los enlaces devueltos no guardan relacion con el modelo.
