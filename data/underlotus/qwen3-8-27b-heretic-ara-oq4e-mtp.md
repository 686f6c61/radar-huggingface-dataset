# underlotus/Qwen3.8-27B-heretic-ara-oQ4e-mtp

## Resumen

El repositorio `underlotus/Qwen3.8-27B-heretic-ara-oQ4e-mtp` contiene una cuantización en 4 bits del modelo base denominado "Qwen3.8-27B", realizada con la herramienta oQ (oMLX v0.5.8.dev1) en formato MLX safetensors. El autor es `underlotus`. La model card no proporciona información sobre el modelo original, su arquitectura, entrenamiento o capacidades; únicamente describe el proceso de cuantización: 4 bits, grupo de tamaño 64, tipo de modelo `qwen3_5` y formato MLX.

La relevancia de este repositorio radica en ofrecer una versión cuantizada para ejecución en Apple Silicon mediante MLX, lo que permite desplegar el modelo en hardware de consumo con requisitos reducidos de memoria. Sin embargo, la ausencia de documentación sobre el modelo base limita su uso práctico sin información adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo de modelo reportado: `qwen3_5`) |
| Parametros totales | no disponible (el nombre del repo sugiere 27B, pero el conteo de safetensors es 4.939.569.392, inconsistente) |
| Parametros activos | no aplicable (sin datos de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (formato oQ de oMLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La model card indica únicamente que el modelo fue cuantizado con oQ (oMLX) en modo de precisión mixta, con 4 bits y group size 64. El tipo de modelo reportado es `qwen3_5`, lo que sugiere una arquitectura de la familia Qwen 3.5, pero no se proporcionan detalles sobre el transformer subyacente, número de capas, atención, ni sobre los datos de entrenamiento, tokens o procesos de alineación (RLHF/DPO). Tampoco se menciona ninguna innovación técnica adicional.

## Capacidades

No se dispone de información sobre las capacidades del modelo base. La model card no describe funciones de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, ni capacidades multilingües. Se recomienda consultar la documentación del modelo original (si existe) para conocer sus capacidades.

## Casos de uso

No se dispone de información suficiente para enumerar casos de uso concretos. La model card no aporta ejemplos de aplicaciones ni escenarios recomendados. Sin conocer las capacidades del modelo base, no es posible sugerir usos prácticos fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Formato MLX diseñado para Apple Silicon (Macs con chips M1/M2/M3/M4).
- Tamaño del repositorio: 17.0 GB, lo que indica que se necesita al menos ese espacio de almacenamiento.
- Para inferencia con MLX, se recomienda un Mac con al menos 16 GB de RAM unificada (el modelo cuantizado en 4 bits de un hipotético 27B ocuparía aproximadamente 14-16 GB en memoria, aunque el conteo real de safetensors sugiere un modelo mucho menor; la cifra exacta depende del número real de parámetros).
- No se dispone de datos sobre latencia, throughput ni GPUs compatibles (MLX no usa CUDA).

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables ni se puede establecer una comparación fiable sin conocer el modelo base.

## Limitaciones y advertencias

- La cuantización en 4 bits puede degradar la precisión del modelo en tareas complejas (razonamiento, matemáticas, generación de código) respecto a la versión de precisión completa.
- La licencia no está especificada; antes de cualquier uso comercial o redistribución es imprescindible obtener la licencia del modelo base y de la herramienta de cuantización.
- No hay información sobre sesgos, alucinaciones, limitaciones de idioma o contexto.
- El nombre del repositorio (`Qwen3.8-27B`) es inconsistente con el número de parámetros reportado en safetensors (4.939.569.392), lo que genera incertidumbre sobre el modelo real subyacente.
- Al ser un formato MLX, solo es ejecutable en hardware Apple Silicon; no es compatible con CUDA ni con entornos Linux/Windows estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/underlotus/Qwen3.8-27B-heretic-ara-oQ4e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
