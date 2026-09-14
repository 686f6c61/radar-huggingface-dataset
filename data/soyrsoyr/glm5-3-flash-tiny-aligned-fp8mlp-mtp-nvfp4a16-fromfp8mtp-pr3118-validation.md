# soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-NVFP4A16-FromFP8MTP-pr3118-validation

## Resumen

GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-NVFP4A16-FromFP8MTP-pr3118-validation es un checkpoint derivado publicado por el usuario soyrsoyr en HuggingFace, cuyo propósito declarado no es la calidad de generación sino la validación estructural de un flujo de cuantización. Según su propia model card, se trata de un "fixture estructural de pesos aleatorios" (*random-weight structural fixture*): no contiene pesos preentrenados de GLM-5.3 y no se le atribuye ninguna capacidad de calidad. El artefacto parte del checkpoint base `inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP`, cuyo módulo MTP (multi-token prediction) había sido convertido previamente a FP8 nativo, y lo desquantiza para volver a cuantizarlo en formato NVFP4A16 (pesos FP4, activaciones de 16 bits).

El modelo tiene 84.772.398 parámetros reales según los safetensors del repositorio (aproximadamente 0,085 miles de millones) y ocupa 0,2 GB, lo que lo sitúa en la categoría de modelos diminutos. La relevancia del artefacto es exclusivamente de ingeniería: documenta y permite reproducir los pasos de derivación FP8 → FP4 recogidos en `pr3118-validation.json`, y sirve como banco de pruebas para la decodificación especulativa MTP en vLLM. La model card indica que se superó la carga y generación en H100 con métricas reales de *draft tokens*, y aclara explícitamente que esto "no es un benchmark de calidad ni de rendimiento".

No se dispone de información sobre licencia, idiomas soportados ni longitud de contexto. La propia model card advierte que la licencia del modelo de origen sigue siendo aplicable y que esta validación no añade ninguna concesión de licencia adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia GLM-5.3 / etiqueta `glm5_next`, con cabeza MTP (multi-token prediction); detalle de capas y atención no disponible |
| Parametros totales | 84.772.398 (dato real de los safetensors del repositorio) |
| Parametros activos | no disponible (el nombre del checkpoint base incluye "0.1B-A0.1B", pero no se confirma si es MoE ni el número de expertos) |
| Longitud de contexto | no disponible (el ejemplo de servicio de la model card usa `--max-model-len 1024`, valor de configuración de arranque, no especificación del modelo) |
| Tipos de cuantizacion | NVFP4A16: pesos en FP4 con activaciones de 16 bits (weight-only, no es NVFP4 W4A4 calibrado); se menciona también MXFP4 con cuantización dinámica de activaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del modelo de origen y aclara que esta validación no añade ninguna concesión) |
| Formato de pesos | safetensors (ecosistema `compressed-tensors` / `llm-compressor`), con `config.json`, `recipe.yaml` cuando está presente y `pr3118-validation.json` |
| Pipeline declarado | text-generation (las etiquetas incluyen además image-text-to-text) |
| Modelo base | inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP |
| Tamano del repositorio | 0,2 GB |
| Libreria | transformers |
| Fecha de creacion / actualizacion | 2026-09-14 (misma fecha en ambos campos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información sobre entrenamiento: el autor declara explícitamente que se trata de un fixture de pesos aleatorios y que no es un modelo preentrenado de GLM-5.3, por lo que no procede hablar de tokens de entrenamiento, composición de dataset ni etapas de RLHF/DPO. La única cadena de entrenamiento documentada es la de origen del checkpoint base: un backbone BF16 con el módulo MTP convertido a FP8 de bloques nativo, que sirvió como entrada a este artefacto. Ese checkpoint de entrada, a su vez, se describe como "derivado de test", no como una publicación oficial en FP8.

La innovación técnica documentada es de tipo procedural y de cuantización, no arquitectónica: el módulo MTP en FP8 nativo se desquantiza y se vuelve a cuantizar a FP4 mediante la implementación del PR 3118 de `llm-compressor` (commit `87347881`). El autor remarca que los formatos del backbone y del MTP son independientes y deben inspeccionarse por separado en `config.json` y `recipe.yaml`. El otro elemento técnico relevante es la validación de extremo a extremo de decodificación especulativa MTP: el modelo está preparado para ejecutarse con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`, y el script `verify_mtp.py` exige métricas positivas de *draft tokens*, no bastando con que el modelo cargue.

## Capacidades

- No se declara ninguna capacidad de generación de calidad: el autor afirma que no aplican reclamaciones de calidad ("no quality claims apply") al tratarse de pesos aleatorios.
- Carga y arranque en runtime: se ha validado la carga del checkpoint y la generación en H100 con métricas reales de *draft tokens*.
- Decodificación especulativa MTP: soporta la configuración de `vllm` con método `mtp` y un token especulativo, con registro de métricas de decodificación especulativa.
- Cuantización NVFP4A16: pesos en FP4 con activaciones de 16 bits, más la variante MXFP4 con cuantización dinámica de activaciones citada en la model card.
- Compatibilidad con `compressed-tensors` y `llm-compressor`: el artefacto existe como caso de prueba de esa cadena de herramientas.
- Modalidad multimodal declarada a nivel de etiquetas (`image-text-to-text`), si bien el ejemplo de servicio desactiva imagen y vídeo (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modo *thinking*: no disponible.

## Casos de uso

- Validación de pipelines de cuantización FP8 → FP4: el artefacto permite reproducir paso a paso la desquantización del módulo MTP en FP8 y su recuantización a NVFP4A16 usando el PR 3118 de `llm-compressor`, verificando que las dimensiones alineadas y los pasos de derivación coinciden con lo registrado en `pr3118-validation.json`.
- Pruebas de regresión en CI/CD para `compressed-tensors`: al ser un fixture pequeño (0,2 GB) con estructura conocida, puede integrarse en una canalización de integración continua que compruebe que una versión nueva de la librería sigue cargando correctamente checkpoints NVFP4A16 sin necesidad de descargar modelos grandes.
- Verificación de decodificación especulativa MTP en vLLM: el script `verify_mtp.py` ejecuta dos prompts y exige métricas positivas de *draft tokens*, de modo que sirve como prueba automatizada de que la ruta MTP funciona tras un cambio de versión del motor de inferencia.
- Pruebas de compatibilidad de runtime y hardware: la model card fija una línea base validada (`vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers 5.17.0, CUDA 13.0) sobre H100, lo que permite comparar el comportamiento en otros entornos y detectar regresiones de compatibilidad; para MXFP4 se indica que hace falta una ejecución propia en B200.
- Verificación de rutas multimodales desactivadas: el ejemplo de servicio desactiva imagen y vídeo con `--limit-mm-per-prompt`, útil para comprobar que la carga de un checkpoint con etiquetas multimodales no falla cuando esas rutas se anulan.
- Pruebas de estrés de configuración de servidor: parámetros como `--block-size 256`, `--enforce-eager`, `--gpu-memory-utilization 0.85` y `--dtype bfloat16` pueden probarse contra este checkpoint para validar el comportamiento del planificador y la gestión de memoria de vLLM sin coste de descarga elevado.
- Documentación y trazabilidad de linaje de modelos: el repositorio conserva ficheros de procedencia y validación que permiten auditar cómo se transformó un checkpoint, útil en equipos que necesitan reconstruir la cadena de custodia de un peso cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la ejecución en H100 superó la carga y la generación con métricas reales de *draft tokens*, pero aclara que esto "no es un benchmark de calidad ni de rendimiento". Al tratarse de un fixture de pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K u otras) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: cálculo aritmético a partir de los 84.772.398 parámetros, unos 42 MB si todos los pesos estuvieran en FP4 y unos 170 MB en bf16; a ello hay que sumar escalas de bloques, tensores en 16 bits y la caché KV, por lo que el consumo real es de unos pocos cientos de MB. No hay mediciones publicadas de VRAM.
- GPU recomendadas según la validación: H100 para la ruta NVFP4A16 validada; la model card indica que MXFP4 requiere una ejecución propia en B200 para establecer compatibilidad de runtime.
- GPU de consumo: por tamaño, el checkpoint cabe en cualquier GPU de consumo e incluso en CPU; sin embargo, la compatibilidad real depende del soporte de NVFP4A16 (pesos FP4) y de MTP en el runtime, no del tamaño.
- Opciones de despliegue: vLLM (comando de servicio documentado en la model card con `--speculative-config` para MTP) y Transformers (`library_name: transformers`). No hay información sobre soporte en llama.cpp, Ollama o TGI, y el formato NVFP4A16 no es GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada. La única comparación posible es contra el checkpoint del que deriva, y varias celdas quedan sin dato.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Proposito |
|---|---|---|---|---|---|
| Este modelo (fixture NVFP4A16) | 84.772.398 (dato real) | no disponible | NVFP4A16 (pesos FP4, activaciones 16 bits) | no disponible | Validación estructural de cuantización y MTP; pesos aleatorios |
| inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP | no disponible | no disponible | origen BF16 con MTP en FP8 nativo | no disponible | Checkpoint base de origen |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables en la información disponible |

## Limitaciones y advertencias

- Los pesos son aleatorios: no es un modelo preentrenado y no debe usarse para generar contenido destinado a usuarios finales, evaluación de calidad ni tareas de producción con expectativa de corrección.
- No aplican reclamaciones de calidad. Cualquier resultado de generación obtenido con este checkpoint es ruido y no refleja el comportamiento de GLM-5.3 ni de su checkpoint base.
- Estado del modelo base: el propio autor califica el checkpoint FP8 de entrada como derivado de test y aclara que no es una publicación oficial en FP8.
- Licencia: no disponible. La model card señala que se aplica la licencia del modelo de origen y que esta validación no concede licencia alguna, por lo que el uso comercial queda sin determinar y requiere consultar la ficha del modelo base.
- Idiomas soportados y longitud de contexto: no disponibles; el `--max-model-len 1024` del ejemplo es una configuración de arranque, no una especificación.
- Dependencia estricta de versiones: la validación se realizó con `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers 5.17.0 y CUDA 13.0; otros entornos pueden no reproducir el resultado.
- Compatibilidad de hardware limitada para MXFP4: la model card indica que se requiere una ejecución en B200 para establecer la compatibilidad de runtime.
- NVFP4A16 es cuantización *weight-only* de FP4 con activaciones de 16 bits, no NVFP4 W4A4 calibrado; no debe equipararse a un NVFP4 completo en comparaciones de rendimiento.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa independiente.
- Riesgo de alucinación y sesgos: no evaluables en un fixture de pesos aleatorios; no hay datos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-NVFP4A16-FromFP8MTP-pr3118-validation
- Modelo base: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP/tree/443ac6c54ba0d65ad8a7c701af4fd22a960c9e9c
- Implementación de cuantización (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (los resultados obtenidos corresponden a un comercio de bricolaje sin relación con el artefacto). No se dispone de papers, blogs, repositorios ni demos adicionales.
