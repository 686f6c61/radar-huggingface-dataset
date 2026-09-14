# soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-Preserved-pr3118-validation

## Resumen

El modelo `soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-Preserved-pr3118-validation` es un artefacto de validación estructural publicado por el usuario soyrsoyr, no un modelo de lenguaje entrenado. Su propia model card lo describe explícitamente como un "random-weight structural fixture": los pesos son aleatorios y solo reproducen la topología, las dimensiones alineadas y el formato de empaquetado de un modelo mayor de la familia GLM-5.3. Con 88.040.064 parámetros totales (unos 88 millones) y un repositorio de 0,2 GB, su función es servir de banco de pruebas reproducible para el pipeline de cuantización de llm-compressor.

La relevancia del artefacto es puramente de ingeniería: documenta el resultado del PR 3118 del fork `soyr-redhat/llm-compressor`, que produce checkpoints con backbone en BF16 y pesos cuantizados en NVFP4A16 (FP4 solo en pesos, activaciones en 16 bits), preservando además el módulo de Multi-Token Prediction (MTP) empaquetado byte a byte con sus metadatos originales. El autor indica que la carga y la generación en una H100 pasaron con métricas reales de draft tokens de MTP, pero subraya que no se trata de un benchmark de calidad ni de rendimiento.

No existe información pública sobre idiomas soportados, longitud de contexto real ni datos de entrenamiento. Cualquier evaluación de capacidades, sesgos o calidad sobre este checkpoint carece de sentido: los pesos aleatorios no han visto datos y no producen texto coherente. Cualquier uso en producción sería un error de interpretación de la finalidad del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como `glm_moe_dsa` en HuggingFace (transformer con mezcla de expertos y atencion dispersa, segun la nomenclatura); detalles exactos de capas, numero de expertos y dimensiones no disponibles en la informacion proporcionada |
| Parametros totales | 88.040.064 (dato real, safetensors) |
| Parametros activos | no disponible (aunque la etiqueta sugiere MoE, no se publica el numero de parametros activos por token) |
| Longitud de contexto | no disponible; el comando de ejemplo del autor usa `--max-model-len 1024` con fines de prueba, no como especificacion del modelo |
| Tipos de cuantizacion | Backbone en BF16; pesos en NVFP4A16 (FP4 solo en pesos, activaciones de 16 bits, sin calibracion W4A4); la model card menciona MXFP4 con cuantizacion dinamica de activaciones como variante aparte |
| Idiomas soportados | no disponible |
| Licencia | other (la model card indica que se mantiene la licencia del modelo de origen y que esta validacion no concede licencia adicional) |
| Formato de pesos | safetensors, en formato `compressed-tensors`; backbone y MTP en formatos separados |

## Arquitectura y entrenamiento

La etiqueta de arquitectura es `glm_moe_dsa`, lo que apunta a un transformer con capas de mezcla de expertos y algun esquema de atencion dispersa o eficiente (DSA), pero el repositorio no incluye en la informacion disponible ni el `config.json` detallado ni el `recipe.yaml`, por lo que no se puede confirmar el numero de capas, de expertos, la dimension oculta ni el ratio de activacion. El checkpoint incorpora un modulo MTP (Multi-Token Prediction) que se conserva intacto: segun el autor, el MTP previamente empaquetado se copio byte a byte junto con sus metadatos, y el backbone y el MTP mantienen formatos separados. La validacion registra los pasos de derivacion en `pr3118-validation.json`.

No hay entrenamiento. El autor declara de forma explicita que se trata de pesos aleatorios y que no aplica ninguna afirmacion de calidad. Tampoco hay rastro de RLHF, DPO ni dataset alguno. La unica innovacion tecnica documentada es de tooling: la receta del PR 3118 de `llm-compressor` (commit `87347881`) para producir un checkpoint cuantizado NVFP4A16 preservando la estructura MTP y las dimensiones alineadas. El entorno validado es `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0` y CUDA `13.0`; el autor advierte que MXFP4 requiere que el usuario establezca la compatibilidad en tiempo de ejecucion en una B200.

## Capacidades

- Generacion de texto: el repositorio declara el pipeline `text-generation` y la libreria `transformers`, pero al tratarse de pesos aleatorios no existe capacidad real de generar texto coherente.
- Decodificacion especulativa con MTP: el checkpoint esta preparado para servirse con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` y produce metricas positivas de draft tokens en el script `verify_mtp.py`.
- Carga en runtime: verificada en H100 con vLLM; una carga correcta del modelo no se considera, segun el autor, una prueba superada de MTP.
- Tool calling y function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponible, sin idiomas declarados.
- Modalidades: la configuracion de servicio del ejemplo desactiva imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0}'`), por lo que el uso previsto es solo texto.
- Etiquetas de uso declaradas: `conversational` y `endpoints_compatible`.

## Casos de uso

- Validacion del PR 3118 de llm-compressor: el repositorio existe para comprobar que la receta de cuantizacion NVFP4A16 con preservacion del modulo MTP produce un checkpoint cargable; se usa como entrada fija en la revision del cambio antes de aplicarlo a un modelo real.
- Pruebas de regresion de cuantizacion: al fijar dimensiones y formato, permite detectar cambios de comportamiento en `compressed-tensors` entre versiones sin depender de pesos de gran tamano.
- Verificacion de decodificacion especulativa MTP en vLLM: el script `verify_mtp.py` lanza dos prompts y exige metricas positivas de draft tokens, de modo que sirve como test de integracion del modo MTP en el servidor de inferencia.
- CI de compatibilidad de versiones: con 0,2 GB de repositorio se puede descargar en cada job de integracion continua para validar pares de versiones de Transformers (5.17.0), vLLM (0.29.1rc1) y CUDA 13.0.
- Plantilla estructural para modelos MoE pequenos: sirve como esqueleto de nombres de tensores y de organizacion de pesos para quien necesite construir un fixture propio con la misma topologia.
- Validacion de pipelines de despliegue: comprobar que un endpoint compatible con `endpoints_compatible` arranca, responde y expone metricas de especulacion antes de sustituir el fixture por pesos reales.
- Pruebas de limites de memoria en GPU: al ser un modelo minimo, permite medir el coste fijo de overhead del runtime (carga de kernels, cache de KV con `--max-model-len 1024`) aislando el coste de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que la validacion en H100 "no es un benchmark de calidad ni de rendimiento" y que no aplica ninguna afirmacion de calidad al tratarse de pesos aleatorios.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 176 MB solo para pesos (88.040.064 parametros x 2 bytes), mas overhead de runtime, cache de KV y buffers; en la practica cabe en menos de 1 GB.
- VRAM estimada en NVFP4A16: del orden de 44 MB de pesos mas escalas de cuantizacion y overhead; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA 13.0; la validacion del autor se hizo en H100. Para MXFP4 el autor indica que hace falta validar la compatibilidad en una B200.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, 4060, 4090, etc.), asi como en CPU para pruebas de carga.
- Opciones de despliegue: vLLM, con el comando exacto documentado (`--dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}'`); tambien carga via Transformers. No se anuncia publicacion de pesos en GGUF, por lo que llama.cpp y Ollama no estan soportados por el momento.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Las unicas metricas reportadas son de draft tokens de MTP, sin valores concretos en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. El checkpoint no es comparable con modelos de lenguaje entrenados de su categoria: es un fixture de validacion con pesos aleatorios. La comparacion relevante seria contra otros fixtures estructurales del mismo pipeline de cuantizacion, y la informacion proporcionada no incluye ninguno con el que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Pesos aleatorios: el autor declara que no es un modelo GLM-5.3 preentrenado y que no aplica ninguna afirmacion de calidad. No debe usarse para generar contenido, evaluar capacidades ni comparar rendimiento.
- Riesgo de confusion en el nombre: el identificador incluye "GLM5.3" y "Aligned", lo que puede llevar a confundirlo con un checkpoint real de la familia GLM; es un fixture estructural derivado.
- Sin datos de idioma ni de contexto: no se declara idioma soportado ni longitud de contexto real, de modo que no se puede planificar su uso en ningun escenario linguistico.
- Licencia restrictiva respecto a la procedencia: la licencia es "other", se mantiene la del modelo de origen y esta validacion no concede licencia adicional; para uso comercial hay que consultar la model card del modelo upstream.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada.
- Dependencia fuerte de versiones: la validacion esta atada a `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0` y CUDA `13.0`; otras combinaciones pueden fallar sin que ello indique un error del modelo.
- MXFP4 no validado en el entorno del autor: requiere verificacion en B200 para establecer compatibilidad en tiempo de ejecucion.
- Riesgo de alucinacion y sesgos: no evaluables, al no existir entrenamiento ni datos asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-Preserved-pr3118-validation
- Modelo base: https://huggingface.co/soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture
- Revision concreta del modelo base citada por el autor: https://huggingface.co/soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture/tree/0b017a9420e734a8443d46a9ec1a5128e4255ae7
- Commit del PR 3118 de llm-compressor: https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (paginas de soporte de YouTube) y no aportan enlaces adicionales utilizables.
