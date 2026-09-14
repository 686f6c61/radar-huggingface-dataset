# soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-BF16-pr3118-validation

## Resumen

El modelo identificado como `soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-BF16-pr3118-validation` es un artefacto de validación estructural publicado por el usuario `soyrsoyr`, no un modelo entrenado. Según su propia model card, se trata de un *fixture* de pesos aleatorios derivado del repositorio `soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture`, con dimensiones alineadas para comprobar que una implementación concreta de `llm-compressor` (PR 3118, commit `87347881`) produce checkpoints cargables y ejecutables en vLLM. El autor declara explícitamente que "no es un benchmark de calidad ni de rendimiento" y que "no se aplica ninguna afirmación de calidad".

El propósito del repositorio es verificar la ruta de *multi-token prediction* (MTP) de extremo a extremo: carga en GPU H100, generación con decodificación especulativa y obtención de métricas positivas de *draft tokens*. Para ello combina un *backbone* en BF16 con una cabeza MTP densa copiada sin cambios, con un total de 88.040.064 parámetros reales según los ficheros safetensors y un tamaño de repositorio de 0,2 GB.

Su relevancia es puramente de ingeniería: sirve como caso de prueba reproducible para validar soporte de MTP en versiones concretas de vLLM y Transformers antes de aplicar el mismo procedimiento a pesos reales. No es utilizable para inferencia con propósito general, ya que sus pesos son aleatorios y sus salidas carecen de significado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tipo declarado en el tag del repositorio: `glm_moe_dsa`. Backbone BF16 mas cabeza MTP densa. Detalle de capas, atencion y configuracion MoE: no disponible |
| Parametros totales | 88.040.064 (88,04 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la configuracion de validacion usa `--max-model-len 1024`, que es un parametro de prueba, no el contexto del modelo) |
| Tipos de cuantizacion | El backbone de este repositorio esta en BF16. El modelo origen usa NVFP4A16 (FP4 weight-only con activaciones de 16 bits) y MXFP4 (cuantizacion dinamica de activaciones). No se documentan recetas de cuantizacion propias para este checkpoint |
| Idiomas soportados | no disponible |
| Licencia | `other` (sin concesion adicional; se mantiene la licencia del modelo de origen, que debe consultarse en su model card) |
| Formato de pesos | safetensors; backbone y MTP en formatos separados. Incluye `config.json`, posible `recipe.yaml` y `pr3118-validation.json` |

## Arquitectura y entrenamiento

No hay entrenamiento. La model card describe este repositorio como un *random-weight structural fixture*: los pesos son aleatorios y solo se han alineado las dimensiones necesarias para que la estructura sea coherente con el pipeline de validacion. La cabeza MTP densa se copio sin modificaciones desde el modelo de origen. El tag de arquitectura del repositorio es `glm_moe_dsa`, lo que sugiere una topologia de tipo MoE con algun esquema de atencion dispersa, pero la informacion proporcionada no incluye numero de capas, dimension de oculto, numero de expertos, ni detalles del mecanismo de atencion, por lo que no se pueden detallar.

La innovacion tecnica relevante no esta en el modelo sino en el procedimiento de validacion: se comprueba que un checkpoint con backbone y MTP en formatos separados se carga en vLLM, genera texto y produce metricas de decodificacion especulativa positivas. La validacion se ejecuto sobre la base de `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0` y CUDA 13.0, y el autor advierte que MXFP4 requerira una ejecucion propia en B200 para establecer compatibilidad en tiempo de ejecucion. No hay datos sobre volumen de tokens, composicion del dataset, RLHF ni DPO.

## Capacidades

- Generacion de texto: tecnicamente funcional (se valido carga y generacion en H100), pero sobre pesos aleatorios, por lo que la salida no tiene valor semantico.
- Decodificacion especulativa mediante MTP: capacidad central del artefacto. La validacion exige metricas positivas de *draft tokens*; una carga correcta del modelo no se considera un aprobado de MTP.
- Integracion con vLLM: se documenta un comando de servicio funcional con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Compatibilidad con `llm-compressor` y `compressed-tensors` en el flujo de conversion (PR 3118).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): el comando de validacion desactiva explicitamente imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0}'`), lo que indica que la configuracion de multimodalidad existe en el pipeline, pero no se declara ninguna capacidad multimodal operativa en este repositorio.

## Casos de uso

- Validacion de integraciones de MTP en vLLM: servir el checkpoint con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` y comprobar que las metricas de *draft tokens* son positivas antes de desplegar pesos reales. Es el caso de uso principal y el unico respaldado por el autor.
- Pruebas de regresion en PRs de `llm-compressor`: usar el commit `87347881` de la PR 3118 como referencia y verificar que nuevas revisiones siguen produciendo checkpoints cargables y ejecutables.
- Verificacion de pipeline de conversion de formatos: comprobar que la separacion entre formato de backbone y formato de MTP se mantiene y que `config.json`, `recipe.yaml` y `pr3118-validation.json` son coherentes entre si.
- Pruebas de humo en CI con GPU: al ocupar solo 0,2 GB en disco y 88 M de parametros en BF16, puede ejecutarse como *smoke test* en runners con GPU para detectar roturas de compatibilidad entre versiones de Transformers, CUDA y vLLM.
- Banco de pruebas de cuantizacion NVFP4A16 y MXFP4: el modelo de origen emplea ambas rutas; este checkpoint permite comprobar la ruta BF16 como linea base antes de aplicar cuantizacion.
- Validacion de limites de memoria y configuracion de servidor: sirve para ensayar combinaciones de `--gpu-memory-utilization`, `--max-model-len` y `--enforce-eager` sin consumir recursos de un modelo grande.
- Formacion y depuracion de scripts de verificacion: el repositorio incluye `verify_mtp.py`, que lanza dos prompts y exige metricas positivas, un patron reutilizable para otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la validacion en H100 "no es un benchmark de calidad ni de rendimiento" y que no se aplica ninguna afirmacion de calidad. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,18-0,25 GB solo para pesos en BF16 (88,04 M de parametros), mas el *overhead* de cache KV, activaciones y runtime de vLLM. El tamano del repositorio en disco es de 0,2 GB.
- GPU recomendadas: no hay requisito minimo publicado. La validacion documentada se ejecuto en NVIDIA H100. El autor menciona que MXFP4 requiere una ejecucion en B200 para confirmar compatibilidad en tiempo de ejecucion.
- GPU de consumo: por tamano, cabe holgadamente en cualquier GPU de consumo con soporte de BF16 (por ejemplo, RTX 3060 en adelante), aunque no hay validacion publicada en esas tarjetas.
- Opciones de despliegue: vLLM con soporte de decodificacion especulativa MTP, validado con `vllm==0.29.1rc1.dev79+g767d1c4d4`. Se desconoce soporte en llama.cpp, Ollama, TGI u otros motores, ya que la informacion disponible no los menciona.
- Latencia y throughput estimados: no disponible. No se publican cifras; solo se afirma que la carga y la generacion pasaron y que las metricas de *draft tokens* fueron positivas.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de produccion sino un *fixture* estructural de validacion con pesos aleatorios, por lo que no existe una categoria de modelos comparables en terminos de calidad. La unica referencia directa es su modelo de origen:

| Modelo | Parametros totales | Formato | Proposito | Licencia |
|---|---|---|---|---|
| GLM5.3-DSA-Tiny-Aligned-BF16-MTP-BF16-pr3118-validation | 88,04 M | safetensors, backbone BF16 + MTP BF16 | Validacion de carga y MTP en vLLM | other |
| soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture (base) | no disponible | NVFP4A16 / MXFP4 | Fixture de prueba del que deriva este checkpoint | other |

## Limitaciones y advertencias

- Pesos aleatorios: la model card indica que es un *fixture* estructural de pesos aleatorios, no pesos preentrenados de GLM-5.3. Las salidas no tienen valor informativo y no deben usarse en produccion ni evaluarse como si fueran las de un modelo entrenado.
- Ausencia de garantias de calidad: el autor declara que no se aplica ninguna afirmacion de calidad y que un carga correcta no equivale a un aprobado de MTP.
- Ambito de la validacion: los resultados se obtuvieron sobre versiones muy concretas y potencialmente no publicadas (`vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0`, CUDA 13.0). Otras combinaciones de versiones pueden fallar.
- MXFP4 sin verificar: el autor advierte de que MXFP4 requiere una ejecucion propia en B200 para establecer compatibilidad en tiempo de ejecucion.
- Licencia: la licencia declarada es `other` y la validacion no aporta ninguna concesion adicional; se mantiene la licencia del modelo de origen, que debe consultarse en su model card antes de cualquier uso, incluido el comercial. El uso comercial no esta explicitamente autorizado.
- Idiomas, sesgos y alucinacion: no disponible. Al no existir entrenamiento ni datos, no procede evaluar sesgos ni tasas de alucinacion.
- Idioma y contexto: no se declaran idiomas soportados ni longitud de contexto; el valor de 1024 tokens de la configuracion de validacion es un parametro de prueba.
- Trazabilidad: es imprescindible revisar `config.json`, `recipe.yaml` (si existe) y `pr3118-validation.json` para entender la derivacion, ya que el autor remite a ellos para todos los pasos de alineacion de dimensiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-BF16-pr3118-validation
- Modelo de origen: https://huggingface.co/soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture/tree/0b017a9420e734a8443d46a9ec1a5128e4255ae7
- Implementacion de referencia (PR 3118 de llm-compressor): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Script de verificacion incluido en el repositorio: `verify_mtp.py` (ejecutable como `python verify_mtp.py /path/to/snapshot`)
