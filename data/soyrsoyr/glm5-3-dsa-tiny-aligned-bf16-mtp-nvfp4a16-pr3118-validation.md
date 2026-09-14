# soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-pr3118-validation

## Resumen

GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-pr3118-validation es un artefacto de validacion publicado por el usuario soyrsoyr, no un modelo de lenguaje entrenado. Se trata de un fixture estructural de pesos aleatorios derivado de soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture, con 88.040.064 parametros totales y un peso en disco de aproximadamente 0,2 GB en safetensors. Su nombre y estructura imitan a un modelo de la familia GLM con arquitectura glm_moe_dsa y una cabeza MTP (multi-token prediction), pero el propio autor indica explicitamente que no se trata de pesos preentrenados de GLM-5.3 y que no aplica ninguna afirmacion de calidad.

La finalidad del repositorio es validar el flujo de cuantizacion NVFP4A16 implementado en el PR 3118 de llm-compressor, asi como la carga y generacion con decodificacion especulativa MTP en vLLM. El autor documenta que la prueba end-to-end paso en una H100 con metricas positivas de draft tokens, y que las dimensiones alineadas y todos los pasos de derivacion quedan registrados en pr3118-validation.json. El esquema de cuantizacion aplicado es data-free (sin calibracion con datos), de tipo weight-only FP4 con activaciones de 16 bits, no NVFP4 W4A4 calibrado.

Su relevancia es por tanto puramente instrumental: sirve como caso de prueba reproducible para desarrolladores que trabajan en cuantizacion, en el runtime de vLLM o en decodificacion especulativa, no como modelo para tareas de generacion reales. No se han publicado idiomas soportados, contexto nativo ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone glm_moe_dsa y modulo MTP (multi-token prediction); fixture estructural de pesos aleatorios, no entrenado |
| Parametros totales | 88.040.064 (aproximadamente 88 M), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la configuracion de validacion usa `--max-model-len 1024`, que es un ajuste de runtime, no una especificacion del modelo) |
| Tipos de cuantizacion | NVFP4A16 (pesos FP4, activaciones de 16 bits, weight-only, data-free); backbone en BF16; se menciona MXFP4 con cuantizacion dinamica de activaciones |
| Idiomas soportados | no disponible |
| Licencia | other (la validacion no anade ninguna concesion de licencia; se mantiene la licencia del modelo de origen) |
| Formato de pesos | safetensors (tamano del repo: 0,2 GB); se mencionan tambien config.json, recipe.yaml y pr3118-validation.json |

## Arquitectura y entrenamiento

El modelo sigue el esquema de nombres glm_moe_dsa, que corresponde a un transformer con mezcla de expertos y atencion dispersa, al que se anade un modulo MTP para decodificacion especulativa. El autor indica que el MTP de origen denso fue cuantizado con el esquema data-free solicitado, y que el backbone y el MTP se almacenan en formatos separados, por lo que es necesario inspeccionar config.json y recipe.yaml. La distincion clave es que NVFP4A16 aplica cuantizacion solo a pesos con activaciones de 16 bits, mientras que MXFP4 usa cuantizacion dinamica de activaciones.

No existe entrenamiento. El propio autor describe el artefacto como un fixture estructural de pesos aleatorios, no como pesos preentrenados de GLM-5.3. Por tanto no hay datos de entrenamiento, numero de tokens, composicion de dataset, RLHF ni DPO que reportar. La unica innovacion tecnica validada es de infraestructura: la cuantizacion data-free con soporte de MTP y su carga funcional en vLLM 0.29.1rc1.dev79+g767d1c4d4 con Transformers 5.17.0 y CUDA 13.0, verificada mediante metricas de draft tokens.

## Capacidades

- Carga y ejecucion correcta en vLLM con decodificacion especulativa MTP habilitada mediante `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Generacion de tokens a nivel de runtime: el modelo emite texto, pero al tener pesos aleatorios la salida no es coherente ni util semanticamente.
- Validacion de cuantizacion NVFP4A16 weight-only con activaciones de 16 bits y esquema data-free.
- Compatibilidad con el ecosistema compressed-tensors y llm-compressor (PR 3118, commit 87347881).
- Verificacion de metricas de draft tokens: el script verify_mtp.py exige metricas positivas y no considera valida una simple carga correcta del modelo.
- Comprobacion de alineamiento dimensional entre backbone y modulo MTP.
- Tool calling / function calling: no disponible; no se declara soporte.
- Capacidades de agente y razonamiento multi-paso: no disponibles; sin entrenamiento no pueden evaluarse.
- Capacidades multilingues: no disponibles.
- Vision o audio: no soportados; el comando de validacion desactiva explicitamente imagen y video con `--limit-mm-per-prompt '{"image":0,"video":0}'`.

## Casos de uso

- Validacion de cuantizacion en llm-compressor: sirve para comprobar que el PR 3118 aplica correctamente el esquema NVFP4A16 data-free sobre un backbone denso con modulo MTP, sin necesidad de descargar pesos de gran tamano.
- Pruebas de integracion en vLLM: permite verificar que una build concreta de vLLM carga un checkpoint con cuantizacion NVFP4A16 y ejecuta decodificacion especulativa MTP sin fallos de kernel.
- Regresion en pipelines de CI/CD: al ocupar 0,2 GB, puede incluirse en tests automatizados que comprueben carga, generacion y metricas de draft tokens en cada cambio del runtime o del cuantizador.
- Desarrollo de recetas de cuantizacion: el archivo recipe.yaml y pr3118-validation.json documentan la derivacion, lo que permite reproducir y modificar esquemas de cuantizacion sobre la misma estructura.
- Verificacion de metricas de decodificacion especulativa: el script verify_mtp.py registra generaciones y estadisticas de draft tokens, util para instrumentar y depurar el mecanismo MTP antes de aplicarlo a pesos reales.
- Comprobacion de compatibilidad de hardware y versiones: el autor documenta una linea base validada con H100, CUDA 13.0, vLLM y Transformers concretos, lo que permite comparar el comportamiento en otras GPU o versiones (por ejemplo, la nota de que MXFP4 requiere validacion propia en B200).
- Plantilla estructural para nuevas variantes: al tratarse de un fixture con dimensiones alineadas conocidas, sirve como esqueleto para generar otros checkpoints de prueba con nombres y configuraciones equivalentes.
- Formacion y demos internas sobre cuantizacion: permite mostrar el flujo completo de carga y decodificacion especulativa sin coste de almacenamiento ni de computo relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita que la prueba realizada "no es un benchmark de calidad ni de rendimiento", y que se trata de un fixture de pesos aleatorios sin afirmaciones de calidad asociadas. No procede, por tanto, presentar cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 176 MB solo para pesos (88 M de parametros a 2 bytes), mas overhead de activaciones, cache KV y runtime.
- VRAM estimada con pesos NVFP4: aproximadamente 44-50 MB para pesos (4 bits por peso mas escalas), con activaciones en 16 bits.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU y en entornos con poca memoria, dado el tamano del repositorio (0,2 GB).
- GPU de referencia validada por el autor: H100, con vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0.
- Opciones de despliegue: vLLM es el runtime documentado, con el comando `vllm serve ... --dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}'`. No se documentan recetas para llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles. No se publican cifras de tokens por segundo ni de latencia; solo se indica que las metricas de draft tokens fueron positivas.
- Nota de compatibilidad: para MXFP4 el autor senala que la compatibilidad de runtime debe establecerse en la propia ejecucion en B200.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables con parametros, contexto, rendimiento o licencia publicados. El unico punto de referencia es el modelo de origen, del que solo se conoce su identificador.

| Modelo | Parametros totales | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-pr3118-validation | 88.040.064 (~88 M) | no disponible | other | Fixture de pesos aleatorios con cuantizacion NVFP4A16 y MTP |
| soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture (modelo base) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido preentrenado ni ajustado. Cualquier salida de texto carece de coherencia y no debe evaluarse como capacidad linguistica.
- No es un modelo de calidad: el autor declara explicitamente que no aplica ninguna afirmacion de calidad ni de rendimiento. No debe usarse en produccion para generacion, atencion al cliente, codigo ni ninguna tarea real.
- Riesgo de interpretacion erronea del nombre: la denominacion GLM5.3 y el tag glm_moe_dsa pueden llevar a confundir este fixture con un modelo GLM real. No lo es.
- Licencia: etiquetada como "other", y la validacion no anade ninguna concesion de licencia. Se mantiene la licencia del modelo de origen, que no se detalla en la informacion disponible, por lo que el uso comercial queda sin determinar.
- Dependencia estricta de versiones: la validacion se realizo con vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0. Otras combinaciones pueden fallar al cargar o al ejecutar el MTP.
- Formatos separados: el backbone y el MTP tienen formatos distintos, y NVFP4A16 es cuantizacion weight-only, no W4A4 calibrado. Confundir ambos esquemas invalida cualquier comparacion de rendimiento.
- Sin datos de sesgo ni de alucinacion evaluables: al no existir entrenamiento, no procede analizar sesgos, pero tampoco debe asumirse un comportamiento seguro en produccion.
- Idiomas y contexto: no disponibles. La ventana de 1024 tokens del comando de validacion es un limite impuesto en runtime, no una caracteristica del modelo.
- Sin soporte multimodal: el propio comando de validacion desactiva imagen y video, y no se declara ninguna capacidad de vision o audio.
- Estado de validacion limitado: que la carga y la generacion pasen no equivale a una validacion de calidad; el autor subraya que solo se consideran validas las metricas positivas de draft tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-pr3118-validation
- Modelo base (fixture de origen): https://huggingface.co/soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture/tree/0b017a9420e734a8443d46a9ec1a5128e4255ae7
- Implementacion en llm-compressor, PR 3118, commit 87347881: https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces pertinentes son los presentes en la model card y en la propia ficha de HuggingFace.
