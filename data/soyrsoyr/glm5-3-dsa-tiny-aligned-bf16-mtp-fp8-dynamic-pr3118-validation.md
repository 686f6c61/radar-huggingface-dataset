# soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-FP8-DYNAMIC-pr3118-validation

## Resumen

GLM5.3-DSA-Tiny-Aligned-BF16-MTP-FP8-DYNAMIC-pr3118-validation es un fixture estructural de pesos aleatorios publicado en HuggingFace por el usuario soyrsoyr. No es un modelo preentrenado ni un modelo de calidad: se deriva de soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture y su unico proposito declarado es validar el flujo de cuantizacion y el soporte de decodificacion especulativa MTP en el runtime. El propio autor indica que el modelo base es un "random-weight structural fixture" y que no se aplica ninguna afirmacion de calidad.

El artefacto contiene 88.040.064 parametros (0,2 GB de repositorio), con la etiqueta de arquitectura glm_moe_dsa. El backbone se distribuye en BF16 y el modulo MTP se ha cuantizado con un esquema FP8 dinamico sin datos de calibracion, usando llm-compressor (PR 3118, commit 87347881) y compressed-tensors. El backbone y los formatos MTP son artefactos separados.

Su relevancia es exclusivamente de ingenieria: permite verificar en integracion continua que una version concreta del stack (vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0) carga el modelo y produce metricas positivas de draft tokens. El autor confirma carga y generacion correctas en H100, y advierte de que la compatibilidad de MXFP4 debe establecerse en una maquina B200. La licencia es "other" y el repositorio no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (segun la etiqueta del repositorio); backbone y modulo MTP como artefactos separados |
| Parametros totales | 88.040.064 (dato real de los safetensors) |
| Parametros activos | no disponible (la etiqueta indica MoE, pero la model card no publica el numero de parametros activos) |
| Longitud de contexto | no disponible; la validacion del autor se ejecuta con `--max-model-len 1024` |
| Tipos de cuantizacion | Backbone en BF16; MTP en FP8 dinamico. Se mencionan ademas NVFP4A16 (FP4 weight-only con activaciones de 16 bits, no calibrado) y MXFP4 (con cuantizacion dinamica de activaciones) en el ecosistema del modelo base |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | other |
| Formato de pesos | safetensors (compressed-tensors); se referencian `config.json`, `recipe.yaml` y `pr3118-validation.json` |
| Autor | soyrsoyr |
| Pipeline | text-generation |
| Libreria | transformers |
| Modelo base | soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion / actualizacion | 2026-09-14 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento. El autor describe el artefacto como un "derived random-weight structural fixture": los pesos son aleatorios y las dimensiones se han alineado artificialmente para que el modelo cargue, no para que prediga. Todos los pasos de derivacion y las dimensiones alineadas quedan registrados en el fichero `pr3118-validation.json` del repositorio. Por tanto, no existen datos de entrenamiento, numero de tokens, composicion de dataset ni fases de RLHF o DPO asociadas.

La innovacion tecnica que se valida es de cadena de herramientas: la cuantizacion del modulo MTP de un modelo denso mediante el esquema data-free solicitado dentro de llm-compressor PR 3118, con salida en formato compressed-tensors. La model card remarca que NVFP4A16 es FP4 weight-only con activaciones de 16 bits y no un NVFP4 W4A4 calibrado, y que MXFP4 emplea cuantizacion dinamica de activaciones. El backbone y el modulo MTP se empaquetan por separado, y el proceso de servicio exige configurar explicitamente el metodo de decodificacion especulativa en vLLM.

## Capacidades

- Generacion de texto: el modelo carga y genera con vLLM, pero al tener pesos aleatorios la salida no es texto coherente. La capacidad no es evaluable en terminos de calidad.
- Decodificacion especulativa MTP: soporta el metodo `mtp` en vLLM con `num_speculative_tokens`. El autor exige metricas positivas de draft tokens para considerar superada la prueba; una carga correcta no se contabiliza como exito.
- Cuantizacion FP8 dinamica en el modulo MTP: el artefacto sirve para comprobar la ruta de cuantizacion sin datos de calibracion.
- Compatibilidad con compressed-tensors y llm-compressor: los pesos se empaquetan en el formato de esa cadena de herramientas.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Conversacional: la etiqueta `conversational` esta presente, pero sin pesos entrenados no existe capacidad conversacional real.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision y audio: no se declaran. El comando de servicio del autor desactiva explicitamente imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0}'`).

## Casos de uso

- Validacion de pipelines de cuantizacion en CI: el modelo permite reproducir el esquema data-free aplicado al modulo MTP con llm-compressor PR 3118 y comprobar que el artefacto resultante carga, sin necesidad de disponer de pesos reales ni de calibracion.
- Pruebas de integracion de decodificacion especulativa MTP en vLLM: al exigir metricas positivas de draft tokens, sirve como prueba de humo de una version concreta del motor antes de desplegar modelos reales con MTP.
- Regresion de versiones del runtime: con una linea base documentada (vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0), cualquier actualizacion del stack puede compararse contra este fixture para detectar roturas de compatibilidad.
- Verificacion de compatibilidad de formatos cuantizados: permite comprobar en una B200 si la ruta MXFP4 funciona, ya que el autor indica que esa compatibilidad debe establecerse en esa maquina.
- Pruebas de empaquetado y estructura: al ocupar 0,2 GB y publicar `config.json`, `recipe.yaml` y `pr3118-validation.json`, es util para validar herramientas internas que inspeccionan safetensors, dimensiones alineadas y ficheros de receta.
- Pruebas de humo de endpoints compatibles: la etiqueta `endpoints_compatible` permite usarlo como destino de prueba en plataformas de despliegue antes de apuntar a un modelo de produccion, sin consumir recursos de GPU significativos.
- Desarrollo de utilidades de servicio para arquitecturas MoE: al ser un modelo mínimo, permite depurar scripts de lanzamiento, limites multimodales y configuracion de memoria en vLLM sin reservar GPU de gran tamano.
- Reproducibilidad de validaciones: el script `verify_mtp.py` incluido ejecuta dos prompts y exige metricas positivas de draft tokens, de modo que cualquier tercero puede reproducir el resultado registrado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor declara de forma explicita que la validacion no constituye un benchmark de calidad ni de rendimiento, y que no se aplica ninguna afirmacion de calidad a este artefacto. Tampoco se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 176 MB de pesos si todo el modelo estuviera en BF16 (88.040.064 x 2 bytes) y unos 88 MB si el conjunto estuviera en FP8. El repositorio completo ocupa 0,2 GB. No hay medida oficial de VRAM en ejecucion; con el overhead del motor y la configuracion de ejemplo es razonable esperar un consumo inferior a 2 GB.
- GPU validadas: H100 (carga y generacion superadas, con metricas de draft tokens). El autor indica que la compatibilidad de MXFP4 debe establecerse en una B200.
- GPU consumer: por tamano cabe en practicamente cualquier GPU consumer con al menos 4 GB, incluidas RTX 3060, RTX 4060 y RTX 4090. No es una estimacion confirmada por el autor.
- Opciones de despliegue: vLLM (version validada 0.29.1rc1.dev79+g767d1c4d4) y Transformers 5.17.0. No se publican pesos GGUF, por lo que llama.cpp u Ollama no estan disponibles con estos pesos.
- Entorno validado (tabla de referencia):

| Componente | Version |
|---|---|
| vLLM | 0.29.1rc1.dev79+g767d1c4d4 |
| Transformers | 5.17.0 |
| CUDA | 13.0 |
| Longitud de contexto en la prueba | 1024 |
| Parametros de servicio | `--dtype bfloat16 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}'` |

- Latencia y throughput: no disponibles. El autor no publica metricas de rendimiento y advierte que la prueba no es un benchmark.

## Comparativa con modelos similares

No se identifican en la informacion disponible otros modelos publicos comparables: se trata de un fixture estructural de validacion, no de un modelo de calidad. El unico artefacto relacionado documentado es su modelo base.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Proposito |
|---|---|---|---|---|---|
| GLM5.3-DSA-Tiny-Aligned-BF16-MTP-FP8-DYNAMIC-pr3118-validation | 88.040.064 | no disponible (prueba a 1024) | BF16 backbone + FP8 dinamico en MTP | other | Fixture estructural de validacion de cuantizacion y MTP |
| soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture | no disponible | no disponible | NVFP4A16 | no disponible | Artefacto de prueba de origen |

## Limitaciones y advertencias

- Pesos aleatorios: el autor indica que no son pesos preentrenados de GLM-5.3. Las salidas no son texto utilizable y cualquier evaluacion de calidad carece de sentido.
- Sin afirmaciones de calidad: la model card rechaza explicitamente cualquier interpretacion del resultado como benchmark de calidad o rendimiento.
- Alucinacion: no aplica en el sentido habitual, ya que el modelo no produce contenido significativo; no debe usarse para generar informacion destinada a personas.
- Licencia: "other". El autor senala que la licencia del origen sigue siendo aplicable, que debe consultarse la model card del modelo base y que esta validacion no anade ninguna concesion de licencia. Las condiciones de uso comercial no estan especificadas.
- Dependencia de versiones muy concretas: el resultado validado se obtuvo con vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0. Otras versiones pueden no reproducir el comportamiento.
- MXFP4 sin validar: el autor remarca que esa ruta requiere una ejecucion en B200 para establecer la compatibilidad en tiempo de ejecucion.
- Contexto de prueba reducido: la validacion usa 1024 tokens como longitud maxima; no hay informacion sobre la longitud de contexto real del modelo.
- Idiomas: no declarados, por lo que no puede afirmarse soporte multilingue.
- Sin traccion en la comunidad: 0 descargas y 0 valoraciones, lo que reduce la probabilidad de que existan informes independientes de fallos o de comportamiento.
- Trazabilidad de la receta: los detalles de alineacion de dimensiones dependen de `pr3118-validation.json`; si ese fichero no se inspecciona junto con `config.json` y `recipe.yaml`, la estructura del artefacto no puede verificarse.
- Uso en produccion: no apto como modelo de inferencia real. Su unico uso defendible es como instrumento de validacion de cadena de herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-FP8-DYNAMIC-pr3118-validation
- Modelo base: https://huggingface.co/soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture/tree/0b017a9420e734a8443d46a9ec1a5128e4255ae7
- Commit de implementacion (llm-compressor PR 3118, 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Script de verificacion MTP incluido en el repositorio: `verify_mtp.py` (ejecutable sobre la ruta del snapshot descargado)
- Ficheros de configuracion y receta del repositorio: `config.json`, `recipe.yaml`, `pr3118-validation.json`
