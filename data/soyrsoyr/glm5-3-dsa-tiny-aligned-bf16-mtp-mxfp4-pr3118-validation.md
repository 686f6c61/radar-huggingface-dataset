# soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-MXFP4-pr3118-validation

## Resumen

GLM5.3-DSA-Tiny-Aligned-BF16-MTP-MXFP4-pr3118-validation es un artefacto de validacion publicado por el usuario soyrsoyr, no un modelo de lenguaje preentrenado. Segun su propia model card, se trata de un "fixture estructural de pesos aleatorios" derivado de soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture, cuyo proposito es comprobar la coherencia de un checkpoint cuantizado en MXFP4 y el funcionamiento del decodificador especulativo basado en MTP (multi-token prediction) dentro de vLLM. El autor indica explicitamente que no se reclama ninguna capacidad de inferencia MXFP4 ni ninguna calidad de generacion: la validacion en runtime sobre B200 esta pendiente.

El repositorio contiene 88.040.064 parametros (unos 0,2 GB) con etiquetas de arquitectura glm_moe_dsa, pesos en safetensors y formato compressed-tensors. La parte cuantizada es un modulo MTP de origen denso, convertido con un esquema data-free solicitado por el autor; el backbone y el MTP mantienen formatos separados, y la cuantizacion NVFP4A16 del modelo base es weight-only FP4 con activaciones de 16 bits, no un NVFP4 W4A4 calibrado.

Su relevancia es puramente instrumental: sirve como caso de prueba reproducible para el PR 3118 de llm-compressor (commit 87347881) y para verificar el pipeline de decodificacion especulativa MTP de vLLM sobre hardware Blackwell. No debe emplearse para evaluar calidad linguistica, razonamiento ni ninguna tarea de generacion real, ya que los pesos no proceden de entrenamiento alguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (etiqueta del repositorio); fixture estructural de pesos aleatorios derivado de un modelo base de prueba |
| Parametros totales | 88.040.064 (dato real de safetensors) |
| Parametros activos | no disponible (no se publica desglose de expertos; el artefacto es un fixture de 88 M de parametros) |
| Longitud de contexto | no disponible (el ejemplo de validacion usa --max-model-len 1024, valor de prueba, no contexto declarado) |
| Tipos de cuantizacion | MXFP4 con cuantizacion dinamica de activaciones para el modulo MTP; backbone en BF16; el modelo base usa NVFP4A16 weight-only (FP4 en pesos, 16 bits en activaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (la validacion no anade ninguna concesion de licencia; se mantiene la licencia del modelo de origen) |
| Formato de pesos | safetensors, formato compressed-tensors; se mencionan config.json, recipe.yaml y pr3118-validation.json |

## Arquitectura y entrenamiento

El artefacto declara la etiqueta de arquitectura glm_moe_dsa y una estructura MTP (multi-token prediction) de origen denso que ha sido cuantizada. No hay entrenamiento: el autor describe el contenido como un fixture estructural de pesos aleatorios con dimensiones alineadas, y detalla todos los pasos de derivacion en el fichero pr3118-validation.json. Backbone y MTP se almacenan en formatos distintos, por lo que deben inspeccionarse por separado config.json, recipe.yaml (cuando exista) y el citado JSON de validacion.

La innovacion tecnica que se pretende ejercitar es la decodificacion especulativa con MTP en vLLM, lanzada con --speculative-config '{"method":"mtp","num_speculative_tokens":1}', junto con la ruta de cuantizacion MXFP4 de llm-compressor implementada en el PR 3118. La validacion se declara como una comprobacion de conversion y de consistencia del checkpoint; el propio autor aclara que una carga correcta del modelo no cuenta como superacion de la prueba MTP. No se documentan volumen de tokens, composicion de dataset ni fases de RLHF o DPO, porque no existe entrenamiento asociado.

## Capacidades

- No se le atribuye ninguna capacidad de generacion con calidad: los pesos son aleatorios y la model card indica que no se aplica ninguna afirmacion de calidad.
- Generacion de texto: el pipeline declarado es text-generation y el modelo puede cargarse en vLLM o Transformers, pero las salidas carecen de valor semantico.
- Decodificacion especulativa MTP: es el objeto real de la validacion; verify_mtp.py lanza dos prompts y exige metricas positivas de tokens borrador, registrando generaciones y metricas de speculative decoding.
- Tool calling / function calling: no disponible, no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible, no se documenta soporte.
- Multilingue: no disponible, no se declaran idiomas.
- Capacidades multimodales: no soportadas en el ejemplo de validacion, que las desactiva explicitamente con --limit-mm-per-prompt '{"image":0,"video":0}'.
- Modo thinking: no disponible.

## Casos de uso

- Validacion del PR 3118 de llm-compressor: el repositorio existe para comprobar que la ruta de cuantizacion data-free de un modulo MTP denso genera checkpoints coherentes en formato compressed-tensors.
- Pruebas de integracion de vLLM con decodificacion especulativa MTP: permite lanzar vllm serve con --speculative-config method mtp y verificar que se emiten metricas de tokens borrador, sin depender de pesos reales voluminosos.
- CI de cuantizacion en pipelines internos: al ocupar 0,2 GB y 88 M de parametros, es viable descargarlo y ejecutarlo en cada ejecucion de integracion continua para detectar regresiones de formato o de carga.
- Verificacion de compatibilidad en hardware Blackwell: el autor indica que la ejecucion MXFP4 sobre B200 esta pendiente, por lo que el artefacto sirve como banco de pruebas para establecer esa compatibilidad en runtime.
- Comprobacion de consistencia entre backbone BF16 y modulo MTP cuantizado: util para validar herramientas que inspeccionan checkpoints con formatos mixtos definidos en config.json y recipe.yaml.
- Reproduccion de un caso minimo para depurar errores de carga: al ser un fixture pequeno, aislar fallos de transformers 5.17.0, CUDA 13.0 o vLLM 0.29.1rc1.dev79 es mucho mas rapido que con el modelo completo.
- Formacion de equipos de infraestructura: sirve como ejemplo didactico de como se estructura un checkpoint cuantizado con MTP y que flags requiere su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se aplica ninguna afirmacion de calidad y que la validacion de inferencia MXFP4 en B200 esta pendiente.

## Requisitos de hardware

- VRAM estimada: en BF16, 88.040.064 parametros equivalen a unos 176 MB solo en pesos; en MXFP4 (4 bits) el modulo cuantizado bajaria a unos 44 MB. Con overhead de runtime, la huella es inferior a 1 GB en cualquier configuracion razonable.
- GPU recomendadas: cualquier GPU moderna sirve para la carga en BF16; el autor fija como baseline validado un entorno con B200, CUDA 13.0, vLLM 0.29.1rc1.dev79+g767d1c4d4 y Transformers 5.17.0 para la ruta MXFP4.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos 1-2 GB de VRAM libre (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso es viable en CPU para comprobaciones de carga.
- Opciones de despliegue: vLLM con el comando documentado (--dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}' --limit-mm-per-prompt '{"image":0,"video":0}') y carga via Transformers, ya que la libreria declarada es transformers.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tasa de aceptacion de los tokens especulativos mas alla de la exigencia de que las metricas de tokens borrador sean positivas.

## Comparativa con modelos similares

No disponible. No existen alternativas comparables en el sentido habitual, porque este repositorio no es un modelo de lenguaje funcional sino un fixture de validacion. El unico artefacto directamente relacionado es su modelo de origen, soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture, tambien un fixture de prueba.

| Artefacto | Parametros | Formato | Proposito | Licencia |
|---|---|---|---|---|
| GLM5.3-DSA-Tiny-Aligned-BF16-MTP-MXFP4-pr3118-validation | 88.040.064 | safetensors / compressed-tensors, MXFP4 en el MTP | Validacion del PR 3118 y de MTP en vLLM | other |
| soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture | no disponible | NVFP4A16 weight-only | Fixture de origen del que se deriva este artefacto | other |
| Modelos de produccion de la familia GLM u otros LLM abiertos | no disponible | no disponible | Generacion real de texto | no disponible |

## Limitaciones y advertencias

- Los pesos son aleatorios: no proceden de preentrenamiento ni de ajuste, por lo que cualquier salida de texto carece de sentido y no debe usarse en produccion.
- Sesgos conocidos: no disponible; no hay datos de entrenamiento que analizar.
- Riesgo de alucinacion: total en la practica, dado que el modelo no tiene conocimiento alguno; no es un riesgo medible sino una consecuencia de ser un fixture.
- La cuantizacion MXFP4 no esta validada en runtime: el propio autor senala que la validacion en B200 esta pendiente y que no se reclama ninguna pasada de inferencia MXFP4.
- La ruta NVFP4A16 del modelo base es weight-only con activaciones de 16 bits; no debe confundirse con un NVFP4 W4A4 calibrado.
- Licencia: marcada como "other". La validacion no concede licencia adicional y sigue aplicandose la licencia del modelo de origen, que debe consultarse en la model card original antes de cualquier uso.
- Idiomas y longitud de contexto: no declarados. El valor 1024 del comando de ejemplo es una configuracion de prueba, no una especificacion del modelo.
- Los resultados de verificacion dependen de versiones muy concretas del stack (vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0); otras combinaciones pueden fallar sin que ello indique un defecto del artefacto.
- La busqueda web asociada no ha devuelto documentacion tecnica relevante sobre este modelo, por lo que toda la informacion procede de su model card y de los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-MXFP4-pr3118-validation
- Modelo base: https://huggingface.co/soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture/tree/0b017a9420e734a8443d46a9ec1a5128e4255ae7
- Implementacion de referencia (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Ficheros de trazabilidad citados en la model card: config.json, recipe.yaml y pr3118-validation.json dentro del repositorio
- Script de verificacion citado: verify_mtp.py (se ejecuta como python verify_mtp.py /path/to/snapshot)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
