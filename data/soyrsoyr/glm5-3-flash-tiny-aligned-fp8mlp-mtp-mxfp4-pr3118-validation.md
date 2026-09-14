# soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-MXFP4-pr3118-validation

## Resumen

GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-MXFP4-pr3118-validation es un artefacto de validacion estructural publicado por el usuario soyrsoyr en HuggingFace. No se trata de un modelo entrenado: la propia model card lo describe explicitamente como un *fixture estructural de pesos aleatorios* ("random-weight structural fixture"), derivado del checkpoint inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP. Su proposito es comprobar que una ruta de conversion y cuantizacion concreta (llm-compressor PR 3118, commit 87347881) produce checkpoints consistentes y cargables en runtime.

El modelo tiene 84.772.398 parametros totales (aproximadamente 0,085 mil millones) y un repositorio de 0,2 GB. Combina un backbone etiquetado como glm5_next con una cabeza de prediccion multi-token (MTP, *multi-token prediction*), y emplea dos esquemas de cuantizacion distintos y separados: FP8 para la parte MLP y MXFP4 para el bloque MTP, segun se deduce del nombre del checkpoint y de las notas del autor. El autor advierte que la validacion de runtime en B200 esta pendiente y que no se reclama ninguna pasada de inferencia MXFP4 exitosa.

La relevancia de esta ficha es acotada y conviene subrayarla: no es un modelo para producir texto ni para desplegar en produccion. Es material de ingenieria para quienes trabajan en cuantizacion (compressed-tensors, llm-compressor), en decodificacion especulativa MTP sobre vLLM, o en la compatibilidad de kernels MXFP4 en hardware Blackwell. Cualquier evaluacion de calidad, benchmarks o capacidades linguisticas carece de sentido aqui porque los pesos son aleatorios y el autor renuncia explicitamente a cualquier afirmacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone etiquetado como glm5_next y cabeza MTP (multi-token prediction); pesos aleatorios, no entrenados |
| Parametros totales | 84.772.398 (aproximadamente 0,085 B) |
| Parametros activos | no disponible (no se indica que sea MoE; la fuente se describe como *dense-source*) |
| Longitud de contexto | no disponible (el flag `--max-model-len 1024` del ejemplo es una configuracion de runtime, no una especificacion del modelo) |
| Tipos de cuantizacion | FP8 en la parte MLP y MXFP4 en el bloque MTP; se menciona tambien NVFP4A16 (FP4 solo de pesos con activaciones de 16 bits) como esquema distinto, no calibrado W4A4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que la licencia de origen sigue aplicandose y que esta validacion no concede licencia alguna) |
| Formato de pesos | safetensors (libreria transformers, formato comprimido via compressed-tensors) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio: backbone glm5_next, cabeza MTP y uso de las librerias llm-compressor y compressed-tensors. El autor indica que el backbone y el formato MTP son bloques separados con esquemas de cuantizacion independientes, y que la conversion se hizo con un esquema "data-free" (sin datos de calibracion) solicitado explicitamente. La unica innovacion tecnica documentada es de proceso, no de modelado: la validacion de que dicha conversion preserva la consistencia del checkpoint y produce dimensiones alineadas, con todas las decisiones de derivacion registradas en el fichero `pr3118-validation.json`.

No hay entrenamiento. Los pesos son aleatorios y el autor lo declara sin ambiguedad: "not pretrained GLM-5.3 weights". En consecuencia, no existe informacion sobre numero de tokens, composicion del dataset, RLHF, DPO ni ninguna otra fase de alineamiento. Cualquier dato de ese tipo que aparezca en el nombre del checkpoint (*Aligned*) debe interpretarse como parte de la nomenclatura del pipeline de validacion, no como un proceso de alineacion real sobre estos pesos.

## Capacidades

- Generacion de texto: no acreditada. Los pesos son aleatorios y el autor no reclama ninguna capacidad de generacion de calidad.
- Razonamiento, matematicas y codigo: no acreditados ni evaluados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Vision: el repositorio incluye la etiqueta `image-text-to-text`, pero la model card declara `pipeline_tag: text-generation` y el comando de validacion desactiva explicitamente las entradas de imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0}'`). No hay evidencia de capacidades multimodales funcionales.
- Capacidad especial verificable: soporte de decodificacion especulativa mediante MTP en vLLM (`--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`), pendiente de validacion en runtime B200.

## Casos de uso

- Validacion de kernels MXFP4 en hardware Blackwell: el artefacto permite comprobar si un runtime concreto (vLLM 0.29.1rc1.dev79+g767d1c4d4, CUDA 13.0) es capaz de cargar y ejecutar un checkpoint MXFP4 sin errores de kernel. El autor pide explicitamente que esa comprobacion se haga en una B200.
- Prueba de integracion de decodificacion especulativa MTP: el script `verify_mtp.py` lanza dos prompts y exige metricas positivas de tokens borrador (*draft tokens*). Es un test funcional util para validar que la ruta MTP de vLLM emite y acepta tokens especulativos, no solo que el modelo carga.
- Regresion en pipelines de cuantizacion: sirve como caso dorado para llm-compressor y compressed-tensors, verificando que una receta FP8+MXFP4 concreta produce checkpoints reproducibles tras cambios en el codigo de conversion.
- Verificacion de separacion de formatos backbone/MTP: permite probar herramientas que inspeccionan `config.json`, `recipe.yaml` y ficheros de validacion para confirmar que cada subbloque conserva su esquema de cuantizacion independiente.
- Pruebas de compatibilidad de memoria y planificacion de bloques: con `--block-size 256` y `--gpu-memory-utilization 0.85`, el checkpoint es util para ejercitar rutas de asignacion de memoria y gestion de bloques en vLLM a escala minima, sin coste de GPU significativo.
- Integracion continua de herramientas de conversion: al ser un repositorio de 0,2 GB con pesos aleatorios, se puede descargar y procesar en runners de CI sin requisitos de almacenamiento ni de GPU relevantes, actuando como prueba de humo del *toolchain*.
- Auditoria de procedencia y trazabilidad: el fichero `pr3118-validation.json` documenta dimensiones alineadas y pasos de derivacion, lo que permite validar sistemas internos de registro de linaje de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se aplica ninguna afirmacion de calidad ("No quality claims apply") y que la validacion de runtime en B200 esta pendiente. Dado que los pesos son aleatorios, cualquier metrica de MMLU, HumanEval, GSM8K o similar careceria de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los 84,77 millones de parametros ocupan aproximadamente 85 MB en FP8 y bastante menos en MXFP4; el repositorio completo son 0,2 GB, que incluye ficheros auxiliares. La cifra es una estimacion derivada del recuento de parametros, no un dato publicado.
- GPU recomendadas: no hay una recomendacion oficial mas alla de la peticion del autor de ejecutar la validacion MXFP4 en una NVIDIA B200. Los kernels MXFP4 dependen de hardware Blackwell; en GPUs anteriores la ruta MXFP4 puede no estar disponible.
- GPU de consumo: el tamano permite ejecutarlo en cualquier GPU de consumo e incluso en CPU para las rutas que no requieran kernels MXFP4. La limitacion no es de memoria, sino de soporte de kernel y de version de runtime.
- Opciones de despliegue: vLLM es la unica ruta documentada, con el comando `vllm serve ... --dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}' --limit-mm-per-prompt '{"image":0,"video":0}' --block-size 256`. No se documentan rutas para llama.cpp, Ollama ni TGI.
- Entorno validado: vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0.
- Latencia y throughput: no disponibles. El autor no publica cifras y advierte que la carga correcta del modelo no cuenta como validacion MTP superada.

## Comparativa con modelos similares

No disponible. Este artefacto no es comparable con modelos de lenguaje en produccion: no tiene pesos entrenados, no tiene licencia declarada, no tiene idiomas declarados y no tiene benchmarks. Tampoco se dispone de informacion sobre otros fixtures de validacion equivalentes de llm-compressor o compressed-tensors con los que establecer una comparacion de parametros, contexto o licencia.

## Limitaciones y advertencias

- Pesos aleatorios: el autor declara que se trata de un *fixture estructural* derivado, no de pesos preentrenados de GLM-5.3. No debe usarse para generar contenido ni para evaluar calidad.
- Validacion de runtime pendiente: la validacion en B200 esta marcada como PENDING y no se reclama ninguna pasada de inferencia MXFP4 completada. El exito en la carga del modelo no se considera una validacion MTP superada.
- Licencia indeterminada: la model card no concede licencia y remite a la licencia del modelo de origen. Antes de cualquier uso, hay que consultar la model card de inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP.
- Ambiguedad de modalidad: el repositorio lleva la etiqueta `image-text-to-text`, pero la model card declara generacion de texto y el comando de validacion desactiva imagen y video. No debe asumirse capacidad multimodal.
- Heterogeneidad de cuantizacion: backbone y MTP usan formatos separados, y el autor distingue explicitamente entre NVFP4A16 (solo pesos, activaciones de 16 bits, sin calibracion W4A4) y MXFP4 (cuantizacion dinamica de activaciones). Confundir ambos esquemas invalida cualquier comparacion de rendimiento.
- Dependencia de versiones muy concretas: el entorno validado usa versiones no estables o de desarrollo (vLLM 0.29.1rc1, Transformers 5.17.0, CUDA 13.0). Otras combinaciones pueden fallar sin que ello indique un defecto del checkpoint.
- Sin senales de uso de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, lo que refuerza que no existe validacion independiente disponible.
- Fechas del repositorio: creado y actualizado el 14 de septiembre de 2026, sin historial posterior de mantenimiento conocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-MXFP4-pr3118-validation
- Modelo base: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP/tree/443ac6c54ba0d65ad8a7c701af4fd22a960c9e9c
- Implementacion de referencia (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Resultados de busqueda web: no se encontro ningun resultado relevante sobre este modelo. Las busquedas devolvieron exclusivamente paginas sin relacion (foros de soporte de terceros y sitios de reviews de tecnologia).
