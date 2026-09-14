# soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-BF16-pr3118-validation

## Resumen

Este artefacto, publicado por el usuario soyrsoyr, no es un modelo de lenguaje entrenado sino un *fixture* estructural de pesos aleatorios derivado de `inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP`. Su propósito es validar la ruta de decodificación especulativa basada en MTP (multi-token prediction) en la integración entre `llm-compressor` (PR 3118) y vLLM. La propia model card lo declara explícitamente: «This is a derived random-weight structural fixture, not pretrained GLM-5.3 weights», y añade que no se le aplica ninguna afirmación de calidad.

El modelo cuenta con 84.772.398 parámetros reales según el peso de safetensors, lo que lo sitúa en torno a 0,085 mil millones de parámetros, coherente con la nomenclatura del modelo base (0.1B-A0.1B). El repositorio ocupa 0,2 GB y se distribuye en formato safetensors con la librería Transformers. Incorpora los tags `glm5_next`, `image-text-to-text`, `llm-compressor`, `compressed-tensors` y `mtp`, lo que indica que reproduce la estructura de un backbone GLM-5.3 con una cabecera MTP adicional, con dimensiones alineadas para que la carga y la generación funcionen en un runtime real.

Su relevancia es puramente de ingeniería: sirve como caso de prueba reproducible para verificar que vLLM acepta la configuración MTP, produce métricas positivas de *draft tokens* y mantiene la compatibilidad de formatos de cuantización (FP8 en MLP, BF16 en el resto). No debe confundirse con un modelo utilizable para tareas de generación reales, ya que sus pesos no han pasado por ningún proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de GLM-5.3 (tag `glm5_next`), con backbone y un módulo MTP (multi-token prediction) en formato independiente. El módulo MTP denso se copió sin cambios |
| Parámetros totales | 84.772.398 (≈0,085 B), según los pesos safetensors |
| Parámetros activos | No aplica (no se describe como MoE; la nomenclatura del modelo base, 0.1B-A0.1B, indica mismo total y activos) |
| Longitud de contexto | No disponible; el comando de validación emplea `--max-model-len 1024` y `--block-size 256` |
| Tipos de cuantización | FP8 en las capas MLP y BF16 en el resto (según el nombre del modelo). El repositorio de origen contempla además formatos NVFP4A16 (FP4 weight-only con activaciones de 16 bits, sin calibrar) y MXFP4 (cuantización dinámica de activaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica que se aplica la licencia del modelo de origen y que esta validación no concede licencia adicional |
| Formato de pesos | safetensors (librería `transformers`, formato `compressed-tensors`) |

## Arquitectura y entrenamiento

No existe entrenamiento: los pesos son aleatorios y se generaron para reproducir la estructura del modelo base con las dimensiones alineadas. El proceso de derivación completo (dimensiones, pasos y formatos) se documenta en el fichero `pr3118-validation.json` incluido en el repositorio. La implementación de referencia es el commit `87347881` del PR 3118 de `llm-compressor`, en el fork `soyr-redhat/llm-compressor`. Según la model card, el backbone y el módulo MTP se almacenan en formatos separados y deben inspeccionarse `config.json`, `recipe.yaml` (cuando exista) y el JSON de validación.

La innovación técnica que se valida es la decodificación especulativa con MTP: vLLM arranca con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` y el script `verify_mtp.py` exige métricas positivas de *draft tokens*; una carga correcta del modelo no se considera un éxito de MTP por sí sola. El entorno validado es `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0` y CUDA 13.0, sobre una GPU H100, con `--dtype bfloat16`, `--enforce-eager`, `--gpu-memory-utilization 0.85` y multimodalidad deshabilitada (`--limit-mm-per-prompt '{"image":0,"video":0}'`).

## Capacidades

- No dispone de capacidades de generación útiles: los pesos son aleatorios y la model card excluye explícitamente cualquier afirmación de calidad.
- La arquitectura reproducida corresponde a un modelo de tipo `text-generation` con tag `image-text-to-text`, es decir, la estructura admite entrada de texto e imagen, aunque en la validación publicada la multimodalidad se desactiva.
- Soporta la ruta de decodificación especulativa MTP con un token especulativo, que es precisamente el mecanismo que el artefacto permite probar.
- Compatibilidad con el formateo `compressed-tensors` de `llm-compressor`, incluyendo recetas de cuantización FP8/BF16 y, en el ecosistema asociado, NVFP4A16 y MXFP4.
- No hay información disponible sobre *tool calling*, uso de agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento.
- El artefacto está marcado como `endpoints_compatible`, por lo que puede desplegarse mediante el endpoint de vLLM con la configuración indicada.

## Casos de uso

- Validación de decodificación especulativa MTP en integración continua: ejecutar `verify_mtp.py` sobre este snapshot en cada actualización de vLLM o de `llm-compressor` para comprobar que siguen generándose métricas positivas de *draft tokens* sin depender de pesos de producción.
- Prueba de regresión del PR 3118 de `llm-compressor`: el repositorio fija el commit `87347881` y las dimensiones derivadas, lo que permite reproducir exactamente el escenario que motivó la contribución.
- *Smoke test* de carga en H100: verificar que un nodo con CUDA 13.0, Transformers 5.17.0 y la versión concreta de vLLM arranca un servicio con MTP antes de desplegar pesos reales.
- Verificación de compatibilidad `compressed-tensors`: comprobar que el pipeline de compresión acepta y sirve correctamente la separación de formatos entre backbone (FP8/BF16) y módulo MTP.
- Prueba de la ruta multimodal deshabilitada: validar que la opción `--limit-mm-per-prompt '{"image":0,"video":0}'` se respeta en un modelo con tag `image-text-to-text`.
- Medición de latencia de arranque y consumo de VRAM con `max-model-len 1024` y `gpu-memory-utilization 0.85`, como referencia de mínimos del *stack* antes de escalar a modelos mayores.
- Comprobación de compatibilidad de runtime para MXFP4: la model card advierte de que este formato requiere una ejecución propia en B200 para establecer la compatibilidad, por lo que este fixture sirve como primer paso de esa validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la prueba superada es de carga y generación con métricas de *draft tokens* en H100, y que «this is not a quality or performance benchmark». No se deben extrapolar cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- Tamaño del repositorio: 0,2 GB. Con 84,77 M de parámetros, los pesos en BF16 ocupan aproximadamente 170 MB, de modo que el modelo completo cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- VRAM estimada para inferencia: inferior a 1 GB con `--max-model-len 1024` y `gpu-memory-utilization 0.85`; no se han publicado mediciones exactas.
- GPU recomendadas: el entorno validado es una NVIDIA H100. Por tamaño, funciona igualmente en RTX 4090, RTX 3090, RTX 3060 (12 GB) o cualquier GPU con más de 2 GB de VRAM. Para el formato MXFP4 la model card exige una ejecución en B200.
- Cabe en GPU de consumo: sí, sin restricciones prácticas por memoria.
- Opciones de despliegue: vLLM (versión validada `0.29.1rc1.dev79+g767d1c4d4`) con `--dtype bfloat16`, `--enforce-eager`, `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`, `--block-size 256` y `--limit-mm-per-prompt '{"image":0,"video":0}'`. Requiere Transformers 5.17.0 y CUDA 13.0. No hay información sobre compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El artefacto solo acredita que la carga y la generación pasan y que se registran métricas de decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| Este artefacto (`soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-BF16-pr3118-validation`) | 84,77 M | No disponible (validado a 1024 tokens) | No disponible | HuggingFace, 0 descargas, 0 likes | Fixture estructural con pesos aleatorios |
| `inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP` (modelo base) | ≈0,1 B según nomenclatura | No disponible | No disponible | HuggingFace | Modelo de origen del que se derivan dimensiones y formato |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se han identificado modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Los pesos son aleatorios: cualquier salida de texto carece de valor semántico y no debe evaluarse como si fuera un modelo entrenado.
- La model card declara que no se aplica ninguna afirmación de calidad ni de rendimiento; el éxito de la prueba se limita a la carga y a la generación con métricas de *draft tokens*.
- Licencia no disponible: la validación no concede licencia alguna y se remite a la licencia del modelo de origen, que tampoco se especifica en la información proporcionada. Antes de cualquier uso, incluso interno, hay que consultar la model card del repositorio upstream.
- Idiomas soportados no disponibles; no se puede asumir cobertura multilingüe.
- Longitud de contexto real no documentada; el único valor conocido es el `--max-model-len 1024` del comando de validación, que es una restricción del test y no necesariamente del modelo.
- La validación está atada a versiones concretas (`vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers 5.17.0, CUDA 13.0); otras combinaciones pueden fallar en la ruta MTP.
- El formato MXFP4 requiere validación independiente en B200; no se puede dar por compatible a partir de esta ficha.
- Riesgo de alucinación: no aplica en el sentido habitual, dado que no hay conocimiento aprendido que pueda ser incorrecto, pero cualquier uso generativo produciría texto sin fundamento.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente de las afirmaciones del autor.
- Las fechas de creación y actualización del repositorio (2026-09-14) son posteriores a la fecha de referencia habitual; conviene verificar su coherencia antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-BF16-pr3118-validation
- Modelo base: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP/tree/443ac6c54ba0d65ad8a7c701af4fd22a960c9e9c
- Implementación de referencia (PR 3118 de llm-compressor, commit `87347881`): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- No se han encontrado otros enlaces relevantes en la búsqueda web; los resultados devueltos correspondían a listas de reproducción y servicios de YouTube, sin relación con el modelo.
