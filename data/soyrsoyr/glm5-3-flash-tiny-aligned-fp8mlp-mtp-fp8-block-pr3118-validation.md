# soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-FP8-BLOCK-pr3118-validation

## Resumen

GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-FP8-BLOCK-pr3118-validation es un artefacto de validacion estructural publicado por el usuario soyrsoyr, derivado de `inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP`. No es un modelo preentrenado: la propia model card lo describe como un "random-weight structural fixture", es decir, un modelo con pesos aleatorios que reproduce las dimensiones y el formato de un GLM-5.3 Flash de ~0,1 B de parametros para probar la cadena de cuantizacion.

El repositorio tiene 84.772.398 parametros reales (segun los safetensors), ocupa 0,2 GB y se distribuye en formato safetensors bajo la libreria transformers, con pipeline `text-generation` y etiqueta de arquitectura `glm5_next`. Su proposito es verificar que un modelo con MLP cuantizado en FP8 y modulo MTP (multi-token prediction) tambien en FP8 por bloques carga y genera correctamente en H100 mediante vLLM, con metricas reales de draft tokens.

Su relevancia es puramente instrumental: sirve como caso de prueba reproducible para llm-compressor (PR 3118) y compressed-tensors, y para el soporte de decodificacion especulativa MTP en vLLM. No aporta capacidades de lenguaje, no esta destinado a produccion y no incluye ninguna concesion de licencia adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM5_next (tag `glm5_next`); fuente densa con modulo MTP, no MoE |
| Parametros totales | 84.772.398 (~84,8 M) |
| Parametros activos | 84.772.398 (fuente densa segun la model card; no aplica reparto MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue valida con `--max-model-len 1024`, que no equivale a la ventana nativa) |
| Tipos de cuantizacion | FP8 en MLP, FP8 por bloques en MTP; la model card menciona ademas NVFP4A16 (FP4 solo de pesos con activaciones de 16 bits, sin calibrar) y MXFP4 (cuantizacion dinamica de activaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que se mantiene la licencia del modelo origen y que esta validacion no anade ninguna concesion |
| Formato de pesos | safetensors (compressed-tensors), mas `config.json`, `recipe.yaml` y `pr3118-validation.json` |

## Arquitectura y entrenamiento

El modelo parte de `inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP` (commit `443ac6c5`), una fuente densa con un modulo MTP asociado. Sobre esa estructura se aplico un esquema de cuantizacion sin datos ("data-free"): las capas MLP se convierten a FP8 y el modulo MTP se cuantiza en FP8 por bloques. El resultado conserva las dimensiones alineadas del origen, pero los pesos son aleatorios. Backbone y MTP se almacenan en formatos separados, por lo que conviene inspeccionar `config.json`, el `recipe.yaml` cuando exista y el fichero `pr3118-validation.json`, que documenta todos los pasos de derivacion.

No ha habido entrenamiento, ajuste fino, RLHF ni DPO de ningun tipo. La innovacion tecnica que se pretende validar no esta en el modelo sino en la cadena de herramientas: la implementacion de llm-compressor del PR 3118 (commit `87347881`) y la integracion de decodificacion especulativa MTP en vLLM 0.29.1rc1.dev79+g767d1c4d4, con Transformers 5.17.0 y CUDA 13.0 como entorno de referencia. La validacion se considera superada solo si el script `verify_mtp.py` produce metricas positivas de draft tokens; una simple carga correcta del modelo no cuenta como aprobado.

## Capacidades

- Carga y ejecucion en vLLM: el artefacto esta validado en H100 con el comando documentado en la model card, con `--dtype bfloat16`, `--enforce-eager`, `--gpu-memory-utilization 0.85` y `--block-size 256`.
- Decodificacion especulativa MTP: se configura con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` y el script de verificacion exige metricas positivas de draft tokens.
- Generacion de texto: tecnica y estructural, con pesos aleatorios; no produce salidas con significado.
- Multimodalidad: el repositorio lleva la etiqueta `image-text-to-text`, pero la validacion desactiva explicitamente imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0}'`), por lo que no hay capacidad multimodal confirmada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible; solo MTP como rasgo arquitectonico.

## Casos de uso

- Validacion de PRs en llm-compressor: el artefacto existe precisamente como fixture del PR 3118, de modo que un revisor puede reproducir la cuantizacion FP8 de MLP y MTP y comprobar que las dimensiones derivadas coinciden con las registradas en `pr3118-validation.json`.
- Pruebas de integracion de MTP en vLLM: permite lanzar el servidor con `--speculative-config` y confirmar que la ruta de decodificacion especulativa emite draft tokens sin fallar en el arranque.
- Integracion continua de tooling de cuantizacion: con 0,2 GB de repositorio, se puede incluir en un pipeline de CI que descargue el snapshot, ejecute `verify_mtp.py` y falle el job si las metricas de draft tokens no son positivas.
- Pruebas de humo en hardware nuevo: la model card documenta un pase en H100 y deja abierta la compatibilidad en B200 para MXFP4; el fixture sirve para comprobar que un nodo concreto levanta el modelo antes de invertir tiempo en modelos grandes.
- Verificacion de kernels y block-size: al fijar `--block-size 256` y FP8 por bloques, permite comprobar que los kernels de cuantizacion por bloques se comportan igual entre versiones de vLLM y CUDA.
- Desarrollo de parsers de compressed-tensors: un desarrollador que implemente lectura de checkpoints cuantizados puede usar este repositorio como caso minimo con backbone y MTP en ficheros separados.
- Pruebas de regresion de cuantizacion FP4: la model card describe esquemas NVFP4A16 y MXFP4 como variantes, utiles para comparar rutas de cuantizacion sobre la misma estructura de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no es una prueba de calidad ni de rendimiento y que no se aplica ninguna afirmacion de calidad. El unico dato reportado es cualitativo: carga y generacion superadas en H100 con metricas reales de draft tokens MTP positivas, sin cifras publicadas de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 0,17 GB (84,8 M de parametros), por lo que la huella del modelo es marginal frente a la memoria de cualquier GPU actual. El consumo real dependera del cache KV, del block-size y de la longitud maxima configurada.
- GPU recomendadas: H100 es la unica plataforma con validacion documentada. La model card menciona que MXFP4 requiere establecer compatibilidad en una ejecucion propia sobre B200.
- GPU de consumo: por tamano, cabe sin problemas en cualquier GPU de consumo con 8 GB o mas (RTX 3060, 4060, 4070, 4090), aunque la model card no documenta validacion en estas tarjetas.
- Opciones de despliegue: vLLM 0.29.1rc1.dev79+g767d1c4d4 es el runtime validado, con Transformers 5.17.0 y CUDA 13.0. No hay datos sobre llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de tiempo de arranque.

## Comparativa con modelos similares

No se dispone de alternativas comparables con datos de rendimiento. La unica referencia documentada es el modelo origen del que deriva este fixture.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-FP8-BLOCK-pr3118-validation | 84.772.398 | no disponible | sin benchmarks; solo validacion MTP cualitativa | no disponible | HuggingFace, 0 descargas |
| inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP (origen) | ~0,1 B segun nomenclatura | no disponible | no disponible | no disponible | HuggingFace (commit `443ac6c5`) |

No se han identificado en la informacion disponible otros modelos de la misma categoria con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Pesos aleatorios: la model card afirma que se trata de un "random-weight structural fixture", no de pesos preentrenados de GLM-5.3. Cualquier salida de texto carece de significado.
- Sin afirmaciones de calidad: el autor declara explicitamente que la validacion no es una prueba de calidad ni de rendimiento y que no se aplica ninguna garantia.
- Licencia: no se concede ninguna licencia nueva. Se mantiene la licencia del modelo origen y hay que consultar su model card antes de cualquier uso.
- Riesgo de alucinacion: irrelevante en terminos practicos porque no hay conocimiento aprendido, pero cualquier despliegue que lo trate como modelo de lenguaje producira texto incoherente.
- Idiomas: sin informacion sobre idiomas soportados; no se puede asumir cobertura multilingue.
- Multimodalidad no verificada: la etiqueta `image-text-to-text` no se traduce en capacidad operativa, ya que la validacion desactiva imagen y video.
- Contexto: no se documenta la ventana nativa; los 1024 tokens del comando de ejemplo son un parametro de prueba, no una especificacion del modelo.
- Dependencia de versiones concretas: la validacion se realizo con vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0; otras combinaciones pueden no reproducir el resultado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Uso en produccion: desaconsejado para cualquier tarea real de generacion, atencion al cliente, codigo o analisis; su ambito es exclusivamente el testing de infraestructura de cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-FP8-BLOCK-pr3118-validation
- Modelo origen: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP/tree/443ac6c54ba0d65ad8a7c701af4fd22a960c9e9c
- Implementacion de referencia (llm-compressor PR 3118, commit `87347881`): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Busqueda web: los resultados obtenidos no contienen enlaces relevantes sobre este modelo (devolvieron unicamente paginas generales de ChatGPT), por lo que no se incluyen.
