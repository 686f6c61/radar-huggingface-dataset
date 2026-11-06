# wrldsuksgo2mars/Step-5-Preview-EXL3-K4-Core-K6-HQA

## Resumen

Step-5-Preview-EXL3-K4-Core-K6-HQA es una cuantizacion experimental de Step-5-Preview, el modelo multimodal image-text-to-text desarrollado por StepFun (stepfun-ai). El checkpoint parte del release oficial en BF16 y aplica cuantizacion EXL3 con un esquema mixto: los expertos y la mayoria de tensores se mantienen en la cuantizacion del padre (K4 en las proyecciones de atencion MTP y K6 en las principales), mientras que las 95 proyecciones `o_proj` se restauran a BF16 nativo. El autor del checkpoint es el usuario independiente wrldsuksgo2mars, no StepFun.

La relevancia de esta publicacion es fundamentalmente tecnica: no es un modelo nuevo ni una mejora medida, sino un artefacto de cuantizacion que explora dos vistas de atencion mutuamente excluyentes sobre los mismos ficheros (HQA y compact-attention), con validacion byte a byte de las proyecciones restauradas. El modelo base tiene 162.457.480.000 parametros (segun safetensors) y un peso total de repositorio de 325,1 GB, lo que lo situa en la categoria de modelos frontier que requieren infraestructura multi-GPU.

Conviene subrayar que el propio autor advierte de que la etiqueta HQA describe el formato y la fidelidad de los tensores, no una afirmacion de rendimiento medida, y que el loader `cuteafd` aun no implementa la vista HQA ni la opcion `--compact-attention`. Se trata, por tanto, de un checkpoint publicado para trabajo futuro de tooling, no de un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (step5_vl), image-text-to-text, con capas MTP (multi-token prediction) |
| Parametros totales | 162.457.480.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 con esquema mixto: K6 en proyecciones de atencion principales, K4 en MTP; `o_proj` restaurado a BF16 nativo |
| Idiomas soportados | no disponible |
| Licencia | stepfun-model-license-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (con `model.safetensors.index.json` y `model.compact-attention.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo vision-language (tag `step5_vl`, pipeline `image-text-to-text`) con 162.457 millones de parametros. La model card del checkpoint cuantizado no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO; esa informacion corresponderia al release original de StepFun, no incluido en la informacion disponible. El checkpoint incluye capas MTP (multi-token prediction), visibles en la tabla de tensores restaurados: 92 capas principales mas 3 capas MTP.

La innovacion tecnica de este artefacto es el esquema de cuantizacion EXL3 con dos vistas de atencion sobre los mismos ficheros. La vista HQA (por defecto) sustituye las 95 proyecciones `o_proj` por pesos BF16 nativos copiados byte a byte del release original (9.563.013.120 bytes verificados), omitiendo sus buffers EXL3. La vista compact-attention conserva exactamente la cuantizacion del padre, incluida la atencion MTP en menor bit depth. Ambas vistas son mutuamente excluyentes y comparten casi todos los bytes (321,37 GB de payload activo en HQA frente a 315,36 GB en compact). La validacion incluyo comprobacion byte a byte, resolucion de todos los tensores indexados, ausencia de doble almacenamiento por proyeccion y reproduccion exacta del plan del padre mediante `cuteafd plan`. No se realizo generacion completa, evaluacion de calidad ni de rendimiento.

## Capacidades

- Generacion de texto y comprension de imagenes: el pipeline declarado es image-text-to-text, por lo que acepta entradas multimodales imagen-texto.
- Razonamiento y conversacion multi-turno: el tag `conversational` indica uso en dialogos.
- Prediccion multi-token (MTP): el modelo incorpora 3 capas MTP, orientadas a decodificacion especulativa o generacion acelerada.
- Capacidades de codigo y matematicas: no disponibles de forma explicita en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta poblado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en cuantizacion de modelos frontier: el checkpoint sirve como banco de pruebas para estudiar el impacto de restaurar proyecciones de atencion a BF16 dentro de un modelo EXL3, comparando la vista HQA con la compact-attention sobre los mismos pesos.
- Desarrollo de loaders y tooling: el contrato de seleccion de bundle (indice, config y metadatos de cuantizacion juntos) esta pensado para implementarse en `cuteafd`; util para ingenieros que trabajen en soporte de modelos cuantizados.
- Validacion de integridad de artefactos: los hashes SHA256 por shard y la verificacion byte a byte permiten usar el repo como referencia para pipelines de publicacion reproducible de checkpoints.
- Experimentacion multimodal en laboratorio: con 162B parametros y 325 GB, su uso realista es inferencia en clusters con multiples GPU para tareas image-text-to-text, no en entornos de produccion ligeros.
- Estudio de decodificacion especulativa: las capas MTP cuantizadas en K4 permiten investigar el equilibrio entre precision de los draft weights y velocidad de generacion.
- Benchmarking de esquemas K4/K6: util para medir degradacion de calidad al bajar bits en atencion frente a mantener BF16 en `o_proj`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realizo evaluacion de calidad ni de rendimiento del modelo completo, y que "HQA" no constituye una afirmacion de benchmark medida.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload activo en la vista HQA es de 321,37 GB y en compact-attention de 315,36 GB; se necesita un total de memoria agregada igual o superior a esa cifra, mas overhead de activaciones y KV cache.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible; por volumen de pesos, el despliegue requiere multiples aceleradores de datacenter (clase A100 80 GB, H100 80 GB o superior) en configuracion tensor-parallel.
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090 con 24 GB, etc.) ni en configuraciones multi-GPU de consumo realistas.
- Opciones de despliegue: el autor menciona `cuteafd` como loader previsto, pero aclara que la vista HQA aun no es servible y que la opcion `--compact-attention` no esta implementada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Step-5-Preview-EXL3-K4-Core-K6-HQA (este) | 162,46B | no disponible | safetensors EXL3 mixto | stepfun-model-license-1.0 | Experimental, loader no operativo |
| stepfun-ai/Step-5-Preview-BF16 (padre) | 162,46B | no disponible | safetensors BF16 | stepfun-model-license-1.0 | Release oficial |
| Step-5-Preview-EXL3-K4-Core-K6 (padre cuantizado) | 162,46B | no disponible | safetensors EXL3 | stepfun-model-license-1.0 | Cuantizacion previa |

No se dispone de datos de rendimiento comparado con otras familias de modelos (por ejemplo, otros VLM frontier) en la informacion proporcionada.

## Limitaciones y advertencias

- El loader `cuteafd` no implementa aun la vista HQA ni la opcion `--compact-attention`; el checkpoint no es servible con las herramientas actuales del autor.
- El planner de `cuteafd` rechaza el bundle HQA con el error "Step-5 model.layers.0.self_attn mixes native and EXL3 storage; complete operator groups required".
- No se ha realizado generacion de modelo completo ni evaluacion de calidad o rendimiento; no hay garantia empirica de que la restauracion a BF16 de `o_proj` mejore nada.
- La etiqueta "HQA" es descriptiva del formato, no una afirmacion de rendimiento; no debe citarse como mejora medida.
- Los loaders genericos de Transformers leen solo los ficheros por defecto y no implican soporte EXL3; un indice safetensors valido no garantiza compatibilidad.
- Licencia stepfun-model-license-1.0: es necesario revisar sus terminos para uso comercial; el campo aparece como "other".
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para este checkpoint.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingue.
- Repositorio con 0 descargas y 0 likes: artefacto recien publicado, sin validacion comunitaria.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/wrldsuksgo2mars/Step-5-Preview-EXL3-K4-Core-K6-HQA
- Modelo base oficial: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- Revision del modelo base: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16/tree/7734b7ffac118d70d8398bfa3eb0fab007eb45b1
- Licencia: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16/blob/7734b7ffac118d70d8398bfa3eb0fab007eb45b1/LICENSE.txt
- Checkpoint cuantizado padre: https://huggingface.co/wrldsuksgo2mars/Step-5-Preview-EXL3-K4-Core-K6/tree/83d47a384eabc07ea6fcfaac4779b0e5f013ce89
- Dataset citado: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
