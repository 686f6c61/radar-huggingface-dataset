# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-MXFP4-FromFP8-pr3118-validation

## Resumen

Este repositorio es un artefacto de validación publicado por el usuario soyrsoyr: una conversión cuantizada del modelo Qwen/Qwen3.8-27B-FP8 a MXFP4, generada con llm-compressor (PR 3118) y empaquetada en formato compressed-tensors. No es un modelo entrenado desde cero ni un lanzamiento oficial de Qwen, sino una checkpoint derivada cuyo objetivo es comprobar que la ruta de conversión FP8 -> MXFP4 y el mecanismo de decodificación especulativa MTP (multi-token prediction) funcionan de extremo a extremo bajo vLLM.

El checkpoint conserva los 27.134.575.616 parámetros del modelo base (unos 27,1 mil millones) y mantiene la licencia Apache 2.0 del origen. El autor advierte explícitamente de que la validación en tiempo de ejecución en B200 está pendiente: la conversión y las comprobaciones de consistencia del checkpoint han pasado, pero no se reclama ninguna pasada de inferencia en MXFP4. El repositorio incluye además un script `verify_mtp.py` que exige métricas positivas de tokens draft para considerar superada la prueba, de modo que una simple carga correcta del modelo no cuenta como validación.

Su relevancia es acotada pero técnica: sirve como banco de pruebas para pipelines de cuantización FP4 con cuantización dinámica de activaciones y para la integración de MTP como método de speculative decoding en vLLM. Se trata de un artefacto de investigación/validación, con 0 descargas y 0 likes en el momento de la consulta, no de un modelo pensado para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; la etiqueta del repositorio indica `qwen3_5`. Detalles de capas, atencion o configuracion MoE: no disponible |
| Parametros totales | 27.134.575.616 (unos 27,1 B), segun safetensors |
| Parametros activos | No disponible; la informacion proporcionada no indica que sea un modelo MoE |
| Longitud de contexto | No disponible. El comando de ejemplo usa `--max-model-len 1024`, pero es un valor de prueba, no la ventana del modelo |
| Tipos de cuantizacion | MXFP4 (pesos FP4 con cuantizacion dinamica de activaciones); NVFP4A16 (FP4 weight-only con activaciones de 16 bits, sin calibrar; no es NVFP4 W4A4) |
| Idiomas soportados | No disponible; el repositorio no declara lista de idiomas |
| Licencia | Apache 2.0 (heredada del modelo base; la conversion no anade ninguna concesion adicional) |
| Formato de pesos | safetensors con compressed-tensors; backbone y MTP en formatos separados |
| Modalidades | Texto e imagen-texto-a-texto (`image-text-to-text`) |
| Modelo base | Qwen/Qwen3.8-27B-FP8 (revision 017b9c7af6b5689d5dd426a76e0bc077eb5ca20a) |
| Tamano del repositorio | 35,3 GB |
| Decodificacion especulativa | MTP (multi-token prediction) del modelo base, dequantizado y recuantizado a FP4 |
| Fecha de creacion | 2026-09-14 |

## Arquitectura y entrenamiento

No hay informacion en los datos disponibles sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni sobre la arquitectura interna mas alla de la etiqueta `qwen3_5` y el pipeline `image-text-to-text`. Lo que si describe el autor es el proceso de conversión: el MTP nativo en FP8 del modelo base fue dequantizado y recuantizado al formato FP4 solicitado mediante llm-compressor (PR 3118, commit `87347881`), y el resultado se empaqueta con compressed-tensors.

La innovacion tecnica del artefacto es doble. Por un lado, la cuantizacion: MXFP4 aplica cuantizacion dinamica de activaciones, mientras que NVFP4A16 es weight-only con activaciones de 16 bits, y el autor insiste en que no deben confundirse con un NVFP4 W4A4 calibrado. Por otro, la decodificacion especulativa MTP, que se activa en vLLM mediante `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`. El backbone y el MTP se almacenan en formatos distintos, por lo que hay que inspeccionar `config.json`, `recipe.yaml` (cuando exista) y `pr3118-validation.json` antes de asumir nada sobre la estructura.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.8-27B-FP8.
- Procesamiento de entradas de imagen y texto (pipeline `image-text-to-text`), con limitacion configurable mediante `--limit-mm-per-prompt`.
- Decodificacion especulativa con MTP: generacion de tokens draft y verificacion, con metricas de tokens draft aceptados.
- Inferencia servida con vLLM y compatibilidad con endpoints declarada en las etiquetas (`endpoints_compatible`).
- Cuantizacion FP4 con escalas por bloque (MXFP4) y variante weight-only (NVFP4A16) segun la receta empleada.
- Capacidades de tool calling, agentes, matematicas o thinking mode: no disponibles en la informacion proporcionada (no se documentan en la model card).
- Cobertura multilingue: no disponible.

## Casos de uso

- Validacion de pipelines de cuantizacion FP8 -> FP4: el repositorio existe precisamente para comprobar que llm-compressor PR 3118 produce checkpoints consistentes; se usaria como caso de prueba reproducible antes de aplicar la misma receta a otros modelos.
- Verificacion de decodificacion especulativa MTP: ejecutar `python verify_mtp.py /path/to/snapshot` con dos prompts y exigir metricas positivas de tokens draft, integrandolo en un pipeline de CI que falle si la carga no va acompanada de aceleracion real.
- Banco de pruebas en hardware Blackwell: dado que la validacion en B200 esta pendiente, el caso de uso inmediato es ejecutar la inferencia MXFP4 en esa GPU y registrar si el runtime de vLLM 0.29.1rc1.dev79 la soporta.
- Comparacion de variantes de cuantizacion: medir perplejidad y calidad de generacion entre el checkpoint FP8 original y esta version MXFP4/NVFP4A16 para decidir que formato desplegar.
- Pruebas de carga y compatibilidad con vLLM: usar el comando documentado con `--enforce-eager`, `--gpu-memory-utilization 0.85` y `--max-model-len 1024` como smoke test de servidor antes de escalar a longitudes mayores.
- Evaluacion multimodal controlada: forzar `--limit-mm-per-prompt '{"image":0,"video":0}'` para aislar el comportamiento de texto, o habilitar entradas de imagen para comprobar que el pipeline image-text-to-text sigue operativo tras la cuantizacion.
- Investigacion sobre cuantizacion de cabezas MTP: al almacenarse backbone y MTP por separado, permite estudiar como afecta la recuantizacion a la tasa de aceptacion de tokens especulativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco reporta tasas de aceptacion de tokens especulativos, latencia o throughput. El unico criterio de exito declarado es funcional: que `verify_mtp.py` produzca metricas positivas de tokens draft.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial. Como referencia aritmetica, 27,1 B de parametros a 4 bits ocupan unos 13,6 GB de pesos, a lo que hay que sumar escalas de cuantizacion, cache KV y overhead del runtime; el repositorio completo ocupa 35,3 GB en disco.
- GPU objetivo declarada: NVIDIA B200. La model card indica que la validacion en tiempo de ejecucion en B200 esta pendiente y que es esa ejecucion la que debe establecer la compatibilidad de MXFP4.
- Otras GPU: no se documenta soporte. No hay evidencia en la informacion proporcionada de que funcione en A100, H100 o RTX 4090.
- Encaje en GPU de consumo: no disponible; no se declara.
- Despliegue: vLLM. El autor fija como baseline validado `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers 5.17.0 y CUDA 13.0. No se mencionan llama.cpp, Ollama ni TGI.
- Comando de referencia: `vllm serve soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-MXFP4-FromFP8-pr3118-validation --dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}' --limit-mm-per-prompt '{"image":0,"video":0}'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-MXFP4-FromFP8-pr3118-validation | 27,1 B | No disponible | MXFP4 / NVFP4A16 | Apache 2.0 | Validacion pendiente en B200; 0 descargas |
| Qwen/Qwen3.8-27B-FP8 (modelo base) | 27,1 B (origen) | No disponible | FP8 nativo | Apache 2.0 | Referencia de origen; specs detalladas no disponibles en la informacion proporcionada |
| Otras alternativas de ~27 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No hay datos de benchmarks ni especificaciones del modelo base en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Validacion incompleta: el propio autor declara "B200 runtime validation PENDING". La conversion y la consistencia del checkpoint han pasado, pero no se reclama ninguna pasada de inferencia en MXFP4.
- Artefacto de validacion, no de produccion: 0 descargas y 0 likes; es un experimento ligado a un PR concreto de llm-compressor, no un modelo mantenido.
- Confusion entre formatos: NVFP4A16 es weight-only con activaciones de 16 bits y no equivale a un NVFP4 W4A4 calibrado; MXFP4 usa cuantizacion dinamica de activaciones. Mezclar ambos en la misma comparacion invalida cualquier medicion.
- Riesgo de degradacion por cuantizacion: no se publican evaluaciones de calidad que permitan cuantificar la perdida respecto al checkpoint FP8 original.
- Restricciones de licencia: la licencia Apache 2.0 proviene del modelo base. La conversion no anade ninguna concesion nueva y la licencia del origen sigue aplicandose; hay que consultar la model card upstream.
- Requisitos de runtime estrictos: versiones concretas de vLLM (0.29.1rc1.dev79), Transformers (5.17.0) y CUDA (13.0.0). Fuera de ese entorno el comportamiento no esta garantizado.
- Dependencia de hardware especifico: no se documenta funcionamiento en GPUs distintas de la B200.
- Idiomas, sesgos y alucinacion: no disponibles. No se declara lista de idiomas ni evaluacion de sesgos, y al ser una conversion de pesos no hay ajuste alguno que mitigue alucinaciones respecto al base.
- Fechas del repositorio: creado el 2026-09-14, con una unica actualizacion tres minutos despues; no hay historial de mantenimiento.
- Longitud de contexto: no documentada. No debe inferirse de los 1024 tokens del comando de ejemplo, que solo busca reducir el consumo de memoria en la prueba.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-MXFP4-FromFP8-pr3118-validation
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8/tree/017b9c7af6b5689d5dd426a76e0bc077eb5ca20a
- Implementacion (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Script de verificacion mencionado en la model card: `verify_mtp.py` (incluido en el snapshot del repositorio)
