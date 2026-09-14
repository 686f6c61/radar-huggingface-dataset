# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-NVFP4A16-pr3118-validation

## Resumen

Este repositorio contiene una version cuantizada del modelo Qwen/Qwen3.8-27B, publicada por el usuario soyrsoyr con el identificador Qwen3.8-27B-FP8Dyn-MTP-NVFP4A16-pr3118-validation. No se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto de validacion tecnica: su objetivo es verificar que la canalizacion de cuantizacion del PR 3118 de llm-compressor produce pesos cargables y generables en vLLM cuando se activa la decodificacion especulativa basada en MTP (Multi-Token Prediction). El autor indica explicitamente que la carga y la generacion pasaron en una H100 con metricas reales de tokens borrador, y que esto no constituye un benchmark de calidad ni de rendimiento.

El modelo base es un transformer denso de la familia Qwen3.5 con 27.134.575.616 parametros (unos 27,13 mil millones), licencia Apache 2.0 y pipeline declarado de text-generation. La model card describe una cuantizacion mixta: el backbone y el modulo MTP se empaquetan en formatos separados, con esquema NVFP4A16 (FP4 solo para pesos, activaciones en 16 bits) para la ruta MTP y cuantizacion dinamica de activaciones en el caso de MXFP4, ademas de FP8 dinamico. El repositorio ocupa 35,3 GB e incluye un script de verificacion (verify_mtp.py) que exige metricas positivas de tokens borrador, no solo una carga exitosa.

Su relevancia es acotada y muy especifica: sirve a ingenieros que trabajan en el soporte de MTP y de formatos comprimidos dentro del ecosistema vLLM/llm-compressor, y que necesitan un caso reproducible con version de runtime fijada (vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0). Con 0 descargas y 0 likes, no es un modelo pensado para produccion ni para uso general, y cualquier despliegue real deberia partir del modelo base o de una cuantizacion con evaluacion de calidad publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; el tag de arquitectura es qwen3_5 y la model card describe una fuente MTP densa, coherente con un transformer denso de la familia Qwen3.5 |
| Parametros totales | 27.134.575.616 (27,13 mil millones, dato de safetensors) |
| Parametros activos | no disponible; no se describe como MoE y la model card habla de "dense-source MTP" |
| Longitud de contexto | no disponible (el comando de validacion usa `--max-model-len 1024`, que es una restriccion de la prueba, no la ventana del modelo) |
| Tipos de cuantizacion | FP8 dinamico; NVFP4A16 (FP4 solo en pesos, activaciones de 16 bits, sin calibracion tipo W4A4); MXFP4 con cuantizacion dinamica de activaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la model card indica que la licencia del modelo fuente sigue aplicandose y que esta validacion no concede licencia adicional) |
| Formato de pesos | safetensors, con backbone y modulos MTP en formatos separados |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla del tag qwen3_5 y del pipeline image-text-to-text declarado en los tags del repositorio, lo que sugiere que Qwen/Qwen3.8-27B incorpora componentes multimodales de imagen y texto. Este repositorio concreto no aporta datos sobre composicion del dataset, numero de tokens de entrenamiento, ni fases de RLHF o DPO del modelo original; esos datos corresponderian a la model card de Qwen/Qwen3.8-27B, que no forma parte de la informacion proporcionada.

Lo que si describe la model card es el proceso de cuantizacion aplicado. Se parte del commit 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 de Qwen/Qwen3.8-27B y se usa una receta data-free (sin datos de calibracion) implementada en el PR 3118 de llm-compressor, en el commit 87347881b46df8786b9fc463965f80504914a98f. El autor remarca dos matices tecnicos importantes: NVFP4A16 es FP4 solo de pesos con activaciones de 16 bits y no equivale a NVFP4 W4A4 calibrado, y MXFP4 emplea cuantizacion dinamica de activaciones. El backbone y el modulo MTP se serializan por separado, de modo que hay que revisar config.json, recipe.yaml y pr3118-validation.json para conocer el formato exacto de cada parte.

La innovacion funcional que se valida es el uso de MTP como mecanismo de decodificacion especulativa, con un token borrador (num_speculative_tokens=1) en la configuracion probada. El script verify_mtp.py ejecuta dos prompts y exige metricas positivas de tokens borrador, estableciendo que una carga correcta del modelo no cuenta como validacion superada.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y los tags incluyen conversational.
- Decodificacion especulativa mediante MTP: soportada y validada con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` en vLLM.
- Capacidades multimodales del modelo base: los tags incluyen image-text-to-text, pero el comando de validacion las desactiva explicitamente con `--limit-mm-per-prompt '{"image":0,"video":0}'`, por lo que no estan verificadas en este artefacto.
- Tool calling, function calling y comportamiento agentico: no disponible; no se documentan en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Razonamiento, codigo o matematicas: no disponible; no hay evaluaciones publicadas en este repositorio.

## Casos de uso

- Validacion de integraciones de llm-compressor: servir como caso de prueba reproducible para comprobar que una receta de cuantizacion concreta (PR 3118) genera pesos cargables en vLLM con una version fijada del runtime.
- Pruebas de regresion de decodificacion especulativa: usar verify_mtp.py en CI para detectar roturas en el soporte de MTP cuando se actualiza vLLM, Transformers o el driver de CUDA.
- Verificacion de hardware en H100: reproducir la carga y generacion en una H100 antes de desplegar variantes cuantizadas de la misma familia en ese tipo de GPU.
- Analisis comparativo de formatos de cuantizacion: comparar el comportamiento de NVFP4A16 (pesos FP4 con activaciones de 16 bits) frente a FP8 dinamico o MXFP4 en terminos de consumo de memoria y compatibilidad de runtime.
- Preparacion de despliegues con memoria limitada: el empaquetado FP4 de pesos (aproximadamente 13,6 GB teoricos solo en pesos) es un punto de partida para escenarios donde una copia en bfloat16 no cabe en la GPU disponible.
- Estudio de pipelines multimodales con la torre de vision desactivada: medir el comportamiento puramente textual del modelo base cuando se limita la entrada a texto.
- Docencia y divulgacion tecnica: ilustrar como se audita un artefacto de cuantizacion leyendo config.json, recipe.yaml y el informe de validacion en lugar de fiarse del nombre del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la validacion realizada (carga y generacion con metricas de tokens borrador en H100) no es un benchmark de calidad ni de rendimiento, por lo que no hay cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput que se puedan citar.

## Requisitos de hardware

- VRAM estimada (calculo propio a partir del numero de parametros y del esquema de cuantizacion, no un dato publicado): con NVFP4A16, unos 13,6 GB solo en pesos a 4 bits por parametro, mas escalas y metadatos, lo que situa la inferencia en el entorno de 15-17 GB antes de contar cache KV y activaciones.
- VRAM estimada si se sirve el backbone en bfloat16: en torno a 54 GB solo en pesos, dado el tamano de 27,13 mil millones de parametros.
- GPU validadas: H100, unica plataforma en la que el autor confirma carga y generacion correctas con metricas MTP. La model card senala que MXFP4 requiere una ejecucion en B200 para establecer su compatibilidad de runtime.
- GPU de consumo: no disponible. No hay confirmacion de funcionamiento en RTX 4090 u otras GPU consumer; el requisito de NVFP4 y el runtime de CUDA 13.0 apuntan a hardware de centro de datos.
- Opciones de despliegue: vLLM, en la version validada 0.29.1rc1.dev79+g767d1c4d4 con Transformers 5.17.0 y CUDA 13.0, usando `--dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85`. No se documentan recetas para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; no se publican mediciones, solo la existencia de metricas positivas de tokens borrador con un token especulativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-NVFP4A16-pr3118-validation | 27,13 mil millones | no disponible | FP8 dinamico, NVFP4A16, MXFP4 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (modelo base) | 27,13 mil millones (modelo origen) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otras cuantizaciones del mismo modelo base ni sobre modelos comparables de 27.000 millones de parametros con decodificacion especulativa MTP, por lo que la comparativa queda reducida al modelo de origen.

## Limitaciones y advertencias

- No es un benchmark: la model card advierte de forma explicita que la validacion realizada no mide calidad ni rendimiento, solo que la carga y la generacion funcionan con metricas de tokens borrador.
- Artefacto de validacion, no de produccion: con 0 descargas y 0 likes, y un nombre que referencia un PR concreto de llm-compressor, no hay evidencia de uso en produccion ni de evaluacion independiente.
- Compatibilidad de runtime muy restringida: la validacion se hizo con vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0; otras combinaciones de versiones no estan verificadas.
- MXFP4 sin validar en la ruta publicada: la propia model card indica que requiere una ejecucion en B200 para confirmar compatibilidad.
- Contexto de la prueba muy corto: el ejemplo usa `--max-model-len 1024`, insuficiente para la mayoria de casos de uso reales y sin relacion conocida con la ventana real del modelo.
- Modo eager forzado: `--enforce-eager` desactiva optimizaciones de grafo, con el coste de rendimiento que ello implica.
- Cuantizacion data-free: la receta no usa datos de calibracion, lo que puede degradar la calidad frente a esquemas calibrados; no se aportan mediciones que permitan cuantificar esa degradacion.
- Riesgo de alucinacion y sesgos: no disponible; no hay evaluaciones de sesgo, toxicidad o veracidad en la informacion proporcionada.
- Idiomas soportados: no disponible, por lo que no se puede garantizar un comportamiento correcto fuera del ingles o del chino sin verificacion previa.
- Licencia: Apache 2.0 en este repositorio, pero la model card aclara que la licencia del modelo fuente sigue aplicandose y que esta validacion no concede derechos adicionales; conviene revisar la model card de Qwen/Qwen3.8-27B antes de cualquier uso comercial.
- Capacidades multimodales desactivadas: los tags apuntan a image-text-to-text, pero en la validacion se limitan imagen y video a cero, de modo que el comportamiento multimodal de este artefacto no esta comprobado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-NVFP4A16-pr3118-validation
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Revision concreta del modelo base usada como origen: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Commit de implementacion en llm-compressor (PR 3118): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Script de verificacion incluido en el repositorio: verify_mtp.py (mencionado en la model card; se ejecuta como `python verify_mtp.py /path/to/snapshot`)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a un sitio sin relacion con el contenido de la ficha.
