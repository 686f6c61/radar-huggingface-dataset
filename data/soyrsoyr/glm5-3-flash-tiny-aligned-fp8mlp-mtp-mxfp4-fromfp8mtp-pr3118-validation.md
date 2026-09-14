# soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-MXFP4-FromFP8MTP-pr3118-validation

## Resumen

GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-MXFP4-FromFP8MTP-pr3118-validation es un checkpoint derivado publicado por el usuario soyrsoyr como artefacto de validación estructural para la librería llm-compressor (PR 3118) y el formato compressed-tensors. No es un modelo entrenado: la propia model card lo describe como un *fixture estructural de pesos aleatorios*, no como pesos preentrenados de GLM-5.3, y declara explícitamente que no se aplica ninguna afirmación de calidad. Su función es verificar que la cadena de conversión de un módulo MTP (multi-token prediction) en FP8 nativo hacia MXFP4 produce checkpoints coherentes y cargables.

El checkpoint tiene 84.772.398 parámetros reales según los safetensors, muy por debajo de los 0,1B que sugiere el nombre del modelo base (inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP). El repositorio ocupa 0,2 GB. La arquitectura declarada en los tags es glm5_next, con pipeline de text-generation y también etiquetado como image-text-to-text en HuggingFace, aunque el ejemplo de despliegue del autor desactiva explícitamente las entradas de imagen y vídeo.

Su relevancia actual es acotada pero específica: sirve como referencia reproducible para equipos que trabajen en cuantización de precisión reducida (MXFP4, FP8) y en decodificación especulativa con MTP sobre hardware Blackwell. El autor advierte que la validación en runtime sobre B200 está pendiente y que no se reclama ninguna pasada de inferencia MXFP4 correcta: solo han pasado las comprobaciones de conversión y consistencia del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next (transformer, segun tag de HuggingFace); incluye modulo MTP (multi-token prediction) |
| Parametros totales | 84.772.398 (dato real de safetensors) |
| Parametros activos | no disponible (la nomenclatura del modelo base "0.1B-A0.1B" sugiere activos iguales al total, sin MoE aparente) |
| Longitud de contexto | no disponible (el ejemplo del autor usa --max-model-len 1024, pero es una configuracion de prueba, no la ventana nativa) |
| Tipos de cuantizacion | MXFP4 para el modulo MTP (con cuantizacion dinamica de activaciones); FP8 en bloque para el MLP; se menciona NVFP4A16 como alternativa de solo pesos con activaciones de 16 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que la licencia del origen sigue aplicando y que esta validacion no concede licencia alguna) |
| Formato de pesos | safetensors, con metadatos compressed-tensors (llm-compressor) |

## Arquitectura y entrenamiento

No hay entrenamiento. El autor describe el artefacto como un fixture estructural de pesos aleatorios y aclara que no se trata de pesos preentrenados de GLM-5.3. La cadena de procedencia documentada en pr3118-validation.json es la siguiente: se parte de inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP (checkpoint de test derivado, con backbone en BF16 retenido y MTP convertido a FP8 en bloque nativo, no un release FP8 oficial), se deconvoluciona ese MTP en FP8 y se recuantiza al formato FP4 solicitado. El backbone y el modulo MTP mantienen formatos separados, y el autor recomienda inspeccionar config.json, recipe.yaml (cuando existe) y el JSON de validacion.

La innovacion tecnica que se pretende validar no es del modelo, sino del pipeline: la conversion FP8 a MXFP4 de un modulo MTP y su explotacion mediante decodificacion especulativa en vLLM con --speculative-config '{"method":"mtp","num_speculative_tokens":1}'. El autor distingue explicitamente entre NVFP4A16 (FP4 de solo pesos con activaciones de 16 bits, sin calibrar como W4A4) y MXFP4 (con cuantizacion dinamica de activaciones). La validacion end-to-end se declara pendiente sobre B200, con un baseline de runtime de vllm==0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0; cargar el modelo con exito no se considera un aprobado de MTP, sino que se exige que verify_mtp.py registre metricas positivas de tokens borrador.

## Capacidades

- No se puede afirmar ninguna capacidad funcional de generacion: los pesos son aleatorios y el autor no hace ninguna afirmacion de calidad.
- Soporte de decodificacion especulativa mediante modulo MTP, con una configuracion de referencia de un token especulativo por paso.
- Validacion estructural de cuantizacion: carga de pesos MXFP4 y FP8 en bloque a traves de compressed-tensors.
- Compatibilidad declarada con endpoints (tag endpoints_compatible) a efectos de despliegue en infraestructura compatible.
- La arquitectura base esta etiquetada como image-text-to-text, pero el ejemplo de despliegue deshabilita imagen y video (--limit-mm-per-prompt '{"image":0,"video":0}'), por lo que no se valida ninguna capacidad multimodal.
- Capacidades multilingues: no disponible.
- Tool calling, agentes, modo thinking, audio: no disponible.

## Casos de uso

- Validacion de kernels MXFP4 en hardware Blackwell: el checkpoint se usa para comprobar si una pila de inferencia (por ejemplo, la version de vLLM indicada) es capaz de cargar y ejecutar pesos MXFP4 sin fallos de kernel. Es util porque aisla el problema de formato del problema de calidad del modelo.
- Prueba de regresion de llm-compressor PR 3118: el artefacto permite reproducir la conversion FP8 -> FP4 del modulo MTP y verificar que los tensores resultantes mantienen las dimensiones alineadas registradas en pr3118-validation.json.
- Test de decodificacion especulativa con MTP: mediante verify_mtp.py y la configuracion de un token especulativo, se comprueba que el motor emite metricas de tokens borrador positivas, un criterio mas estricto que la simple carga del modelo.
- Integracion continua en pipelines de cuantizacion: al ocupar 0,2 GB y contar con 84,77 M de parametros, puede incorporarse como caso de prueba rapido en CI para detectar roturas en el soporte de compressed-tensors o en los esquemas de cuantizacion FP4.
- Verificacion de coherencia de checkpoints derivados: util para validar que la separacion de formatos entre backbone y modulo MTP se preserva tras una recuantizacion, un punto critico cuando se encadenan varias conversiones.
- Pruebas de humo en stacks de servicio (vLLM, TGI u otros): permite comprobar el arranque, la reserva de memoria y la ruta de carga de safetensors en un modelo diminuto antes de escalar a un modelo real del mismo linaje.
- Formacion y depuracion de pipelines de cuantizacion: sirve como ejemplo didactico de receta FP8/MXFP4 con trazabilidad completa de origen, commit y artefactos de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se aplica ninguna afirmacion de calidad, dado que los pesos son aleatorios, y que la validacion de runtime sobre B200 esta pendiente. Por tanto, no existen datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 84,77 M de parametros, los pesos en FP4 ocupan del orden de 0,04-0,05 GB; en FP8, alrededor de 0,08 GB; en BF16, unos 0,17 GB. El repositorio completo ocupa 0,2 GB, lo que sugiere que parte de los tensores (por ejemplo, embeddings) se conservan en precision superior. El consumo real vendra dominado por cache KV, activaciones y el overhead del motor.
- GPU recomendadas por el autor: B200, que es el hardware sobre el que se declara pendiente la validacion MXFP4. El baseline probado usa CUDA 13.0.
- GPU de consumo: por tamano, el modelo cabe holgadamente en cualquier GPU consumer actual (RTX 3060 12 GB en adelante) en FP8 o BF16. Sin embargo, el soporte efectivo de kernels MXFP4 puede depender de la generacion de GPU, por lo que no se garantiza su ejecucion en tarjetas anteriores a Blackwell.
- Opciones de despliegue: vLLM, con el comando exacto publicado por el autor (--dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --block-size 256 y la configuracion especulativa MTP). La libreria de referencia es Transformers 5.17.0. No se documentan recetas para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible: este checkpoint contiene pesos aleatorios y no ha sido evaluado. La tabla siguiente contrasta solo caracteristicas estructurales con modelos pequenos de proposito general, a modo de referencia de tamano.

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| GLM5.3-Flash-Tiny-...-pr3118-validation | 84,77 M | no disponible | no disponible | Fixture de validacion de cuantizacion, pesos aleatorios |
| inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP | no disponible (el nombre sugiere 0,1B) | no disponible | no disponible | Checkpoint de test del que deriva este artefacto |
| Modelos densos pequenos de proposito general (por ejemplo, familias de 0,1-0,5B) | 100-500 M | variable segun modelo | variable | Generacion de texto real |

No se dispone de datos verificados en la informacion proporcionada para completar una comparativa de rendimiento, contexto o licencia con alternativas concretas.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto util y no debe usarse en produccion ni para evaluar calidad.
- La validacion de runtime MXFP4 sobre B200 esta declarada como pendiente; cargar el checkpoint correctamente no equivale a una pasada de inferencia valida.
- El checkpoint de origen en FP8 no es un release oficial, sino un artefacto de test derivado, de modo que la trazabilidad depende de artefactos auxiliares (pr3118-validation.json, recipe.yaml) que pueden cambiar.
- Licencia no disponible: la model card senala que la licencia del modelo de origen sigue aplicandose y que esta validacion no concede ningun derecho adicional, por lo que el uso comercial queda sin definir.
- Idiomas y longitud de contexto no documentados.
- Los kernels MXFP4 y la ruta de decodificacion especulativa MTP dependen de versiones concretas del runtime (vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0); otras combinaciones pueden fallar aunque el modelo cargue.
- El check de MTP exige metricas positivas de tokens borrador mediante verify_mtp.py; una carga correcta del modelo no cuenta como aprobado.
- Sin descargas ni interacciones registradas en HuggingFace, no hay evidencia de uso en la comunidad ni de mantenimiento posterior.
- La fecha de creacion y actualizacion registrada es 2026-09-14, sin revisiones posteriores documentadas.

## Enlaces

- HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-MXFP4-FromFP8MTP-pr3118-validation
- Modelo base: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP/tree/443ac6c54ba0d65ad8a7c701af4fd22a960c9e9c
- Implementacion (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Busqueda web: no se han encontrado enlaces relevantes al modelo, papers ni demos en los resultados de busqueda disponibles; los resultados devueltos correspondian a documentacion de Google Maps y no guardan relacion con este checkpoint.
