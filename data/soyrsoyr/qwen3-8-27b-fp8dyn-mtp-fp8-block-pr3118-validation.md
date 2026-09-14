# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-BLOCK-pr3118-validation

## Resumen

Este repositorio no es un modelo nuevo, sino un artefacto de validacion de cuantizacion construido sobre Qwen/Qwen3.8-27B. Lo publica el usuario soyrsoyr y su proposito declarado es comprobar que la cuantizacion FP8 dinamica por bloques, aplicada tambien a la cabeza de prediccion multi-token (MTP), funciona de extremo a extremo en vLLM 0.29.1rc1.dev79 sobre una H100. La model card es explicita: la prueba superada es de carga y generacion con metricas reales de tokens borrador, y no constituye un benchmark de calidad ni de rendimiento.

El modelo base es un transformer denso de 27.320.697.856 parametros (unos 27,3 B), etiquetado con la arquitectura `qwen3_5` en transformers y con las etiquetas `image-text-to-text` y `conversational`, lo que sugiere capacidad multimodal de entrada imagen-texto en el modelo de origen. La cuantizacion se genero con un fork de llm-compressor (PR 3118, commit 87347881 de soyr-redhat/llm-compressor) mediante un esquema sin datos de calibracion (data-free). El repositorio ocupa 35,5 GB y contiene formato safetensors compatible con compressed-tensors.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para quien necesite validar MTP cuantizado en FP8 con decodificacion especulativa en vLLM, y como evidencia de que el pipeline de cuantizacion de llm-compressor funciona sobre una cabeza MTP densa. No hay descargas ni valoraciones (0 descargas, 0 likes) ni se han publicado resultados de calidad, por lo que no debe tratarse como un modelo listo para produccion sin evaluacion propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso; etiqueta de arquitectura `qwen3_5` en transformers; la model card indica origen "dense-source" |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 con escalado por bloques y activaciones dinamicas (FP8Dyn / FP8-BLOCK) en el backbone y en la cabeza MTP; el repositorio incluye ademas recetas NVFP4A16 (FP4 solo en pesos, activaciones de 16 bits, sin calibracion W4A4) y MXFP4 (cuantizacion dinamica de activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0; la model card aclara que se mantiene la licencia del modelo de origen y que esta validacion no concede licencia adicional |
| Formato de pesos | safetensors (compressed-tensors); backbone y MTP en formatos separados |
| Tamano del repositorio | 35,5 GB |
| Modelo base | Qwen/Qwen3.8-27B, revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |
| Pipeline declarado | text-generation (con etiquetas image-text-to-text y conversational) |
| Fecha de publicacion | 14 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El punto tecnico central es la cuantizacion de la cabeza MTP (multi-token prediction), que se usa como cabecera borrador para decodificacion especulativa. La model card indica que la MTP de origen denso se cuantizo con el esquema solicitado sin datos de calibracion, y que el backbone y la MTP se almacenan en formatos separados, por lo que hay que inspeccionar `config.json`, `recipe.yaml` y `pr3118-validation.json` para conocer el detalle exacto de cada parte. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO: esa informacion pertenece al modelo base y aqui no se reproduce.

La innovacion destacable es la combinacion de cuantizacion FP8 con decodificacion especulativa mediante MTP: en la prueba de extremo a extremo se lanzo vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` y se exigio que las metricas de tokens borrador fueran positivas, de modo que una simple carga correcta del modelo no se considera un aprobado de MTP. El entorno validado es vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0. La model card advierte que MXFP4 requiere una ejecucion propia en B200 para establecer compatibilidad de runtime, y que NVFP4A16 es FP4 solo en pesos con activaciones de 16 bits, no un NVFP4 W4A4 calibrado.

## Capacidades

- Generacion de texto conversacional: heredada del modelo base Qwen/Qwen3.8-27B, segun la etiqueta `conversational`. No se documentan capacidades especificas en esta model card.
- Entrada multimodal imagen-texto: la etiqueta `image-text-to-text` sugiere soporte de imagenes en el modelo de origen, pero el ejemplo de servicio desactiva explicitamente imagen y video con `--limit-mm-per-prompt '{"image":0,"video":0}'`, por lo que no esta validada en este artefacto.
- Decodificacion especulativa con MTP: soporta el metodo `mtp` de vLLM con un token especulativo, validado en H100 con metricas de tokens borrador positivas.
- Razonamiento, codigo, matematicas, tool calling, function calling y uso agentico: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no viene informado en el repositorio.

## Casos de uso

- Validacion de recetas de cuantizacion: un ingeniero de compresion puede reproducir el PR 3118 de llm-compressor sobre un modelo denso de 27 B y comprobar si la cuantizacion data-free de backbone y MTP preserva la funcionalidad, inspeccionando `recipe.yaml` y `pr3118-validation.json`.
- Pruebas de integracion de MTP en vLLM: sirve para verificar que la decodificacion especulativa con `method: mtp` arranca y produce tokens borrador en una version concreta de vLLM (0.29.1rc1.dev79+g767d1c4d4), antes de adoptar MTP en un modelo propio.
- Smoke test en CI de pipelines de compresion: el script `verify_mtp.py` incluido en el snapshot lanza dos prompts y exige metricas de tokens borrador positivas, lo que lo hace util como puerta automatica en un pipeline de publicacion de checkpoints cuantizados.
- Comparacion de formatos de cuantizacion FP8, NVFP4A16 y MXFP4: el repositorio incluye varias recetas, lo que permite medir diferencias de tamano y de compatibilidad de runtime entre esquemas sobre el mismo backbone.
- Referencia de despliegue en H100: el comando de servicio documentado (`--gpu-memory-utilization 0.85`, `--enforce-eager`, `--max-model-len 1024`) sirve como plantilla de arranque controlada para laboratorios que quieran reproducir la validacion en hardware equivalente.
- Base para evaluacion de degradacion por cuantizacion: partiendo del modelo base sin cuantizar y de esta version, un equipo puede montar su propia comparativa de calidad (perplejidad, tareas generativas) para decidir si FP8 por bloques es aceptable en su caso de uso.
- Investigacion sobre MTP y decodificacion especulativa: util para estudiar como se comporta una cabeza MTP cuantizada en FP8 frente a su version densa en bfloat16, midiendo tasa de aceptacion de tokens borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la prueba superada es de carga y generacion con metricas de tokens borrador de MTP, y afirma explicitamente que no es un benchmark de calidad ni de rendimiento. El unico dato de rendimiento reportado es cualitativo: la carga y la generacion en H100 pasaron con metricas de tokens borrador positivas.

## Requisitos de hardware

- Peso de los parametros en FP8: aproximadamente 27,3 GB (1 byte por parametro). Es una estimacion derivada del numero de parametros, no un dato confirmado por el autor.
- Peso equivalente en bfloat16: aproximadamente 54,6 GB (2 bytes por parametro). Estimacion, no dato confirmado.
- Tamano del repositorio completo: 35,5 GB, superior al peso FP8 puro, lo que indica que el snapshot incluye varios formatos y recetas (backbone y MTP separados).
- Hardware validado: H100, con vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0.
- GPU recomendadas: H100 o A100 de 80 GB por el margen que dejan para cache KV; el comando documentado usa `--gpu-memory-utilization 0.85`.
- GPU de consumo: los 27,3 GB de pesos FP8 no caben en una RTX 4090 de 24 GB. Cabrian en una GPU de 48 GB (por ejemplo RTX 6000 Ada) o repartiendo el modelo entre dos GPU de 24 GB con tensor parallel, pero ninguna de estas configuraciones esta confirmada en la informacion disponible.
- MXFP4: la model card indica que requiere una ejecucion propia en B200 para establecer la compatibilidad de runtime.
- Opciones de despliegue: vLLM es la unica via documentada. El repositorio es compatible con compressed-tensors y transformers; no se mencionan GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Solo se documenta que la decodificacion especulativa MTP produjo tokens borrador positivos con `num_speculative_tokens` igual a 1, sin cifras de aceptacion ni de velocidad.
- Nota de configuracion: el ejemplo oficial usa `--max-model-len 1024` y `--enforce-eager`, valores de prueba, no la longitud de contexto real del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-BLOCK-pr3118-validation | 27,3 B | no disponible | FP8 dinamico por bloques (backbone + MTP), con recetas NVFP4A16 y MXFP4 | Apache 2.0 | Repositorio de validacion, 0 descargas, MTP validado en H100 |
| Qwen/Qwen3.8-27B (modelo base) | 27,3 B | no disponible | Sin cuantizar (el repo derivado lo trata como denso de origen) | no disponible en la informacion proporcionada | Modelo de referencia publicado por Qwen |
| Alternativas de tamano similar (otros modelos densos de ~27 B) | no disponible | no disponible | no disponible | no disponible | La busqueda web no aporto informacion relevante sobre modelos comparables |

No se dispone de datos de benchmarks ni de especificaciones de terceros que permitan una comparacion cuantitativa fiable. Cualquier comparacion de rendimiento con otros modelos de la misma categoria queda pendiente de evaluacion propia.

## Limitaciones y advertencias

- No es un modelo oficial ni un release de Qwen: es un artefacto de validacion publicado por un usuario independiente, con 0 descargas y 0 likes, sin revision por pares.
- Ausencia total de evaluacion de calidad: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica. La model card lo declara explicitamente.
- Cuantizacion sin datos de calibracion (data-free): este tipo de esquema puede degradar la calidad respecto al modelo base, y esa degradacion no se ha medido ni cuantificado aqui.
- La validacion se limita a la carga y a la generacion con metricas de tokens borrador positivas en dos prompts mediante `verify_mtp.py`; no cubre robustez, sesgos ni comportamiento en produccion.
- Versionado muy especifico: requiere vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0. Otras versiones pueden no ser compatibles.
- Compatibilidad de MXFP4 no establecida: segun la model card, necesita una ejecucion en B200.
- Entrada multimodal desactivada en el ejemplo de servicio (`image: 0`, `video: 0`), pese a la etiqueta image-text-to-text; no hay validacion multimodal en este repositorio.
- Idiomas soportados no documentados, por lo que no se puede garantizar un comportamiento multilingue concreto.
- Licencia Apache 2.0 para este artefacto, pero la model card recuerda que sigue aplicandose la licencia del modelo de origen y que esta validacion no concede derechos adicionales. Conviene revisar la model card de Qwen/Qwen3.8-27B antes de cualquier uso comercial.
- Implementacion basada en un fork (soyr-redhat/llm-compressor) en lugar del repositorio upstream; el comportamiento puede diferir del llm-compressor oficial.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-BLOCK-pr3118-validation
- Modelo base Qwen/Qwen3.8-27B (revision usada): https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Commit de implementacion, llm-compressor PR 3118: https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Script de verificacion `verify_mtp.py`: incluido en el propio snapshot del repositorio, sin URL publica independiente
- Archivos de configuracion y recetas a revisar en el snapshot: `config.json`, `recipe.yaml`, `pr3118-validation.json`
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a foros sobre una plataforma de anuncios clasificados y no guardan relacion con el modelo.
