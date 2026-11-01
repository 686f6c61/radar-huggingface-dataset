# vllm-project/tiny-qwen3-moe-fp8-per-block

## Resumen

`tiny-qwen3-moe-fp8-per-block` es un checkpoint de pruebas publicado por el equipo de vLLM (organización `vllm-project` en HuggingFace) a partir del modelo aleatorio `amd-quark/tiny-random-qwen3_moe`. No es un modelo de lenguaje utilizable: sus pesos son aleatorios por construcción y sus generaciones son ruido. Su propósito es cubrir un hueco en la infraestructura de integración continua de vLLM, proporcionando un artefacto que ejercita la ruta de cuantización FP8 por bloques (128x128) del método `QuarkW8A8Fp8MoEMethod`, que hasta la fecha ningún modelo público cubría.

El modelo emplea una arquitectura Qwen3-MoE en miniatura (2 capas, 4 expertos, `hidden_size=128`, `moe_intermediate_size=256`) con un total de 20.334.464 parámetros, de los cuales solo los expertos enrutados de las proyecciones `gate`, `up` y `down` están cuantizados a FP8 E4M3 con escala por bloque de 128x128 y activaciones dinámicas por grupo de 128. El resto de módulos, incluida toda la atención, permanece en bfloat16.

Su relevancia es estrictamente de ingeniería: permite validar en CI que vLLM carga correctamente pesos Quark con escalas almacenadas como `weight_scale` (no `weight_scale_inv`), que el reparto de escalas por bloque funciona con tensor parallelism 1 y 2, y que la de-cuantización reproduce el checkpoint original con un error relativo máximo de 0,0266. Para desarrolladores que integren cuantización FP8 por bloques en pipelines de inferencia, este checkpoint es una referencia de formato y de comportamiento esperado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (transformer con mezcla de expertos) |
| Parámetros totales | 20.334.464 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3 con escala por bloque [128, 128] en expertos enrutados; bfloat16 en el resto |
| Idiomas soportados | no disponible (pesos aleatorios, sin capacidad lingüística) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Quark para exportación HF) |

## Arquitectura y entrenamiento

La arquitectura es una instancia mínima de Qwen3-MoE con `hidden_size=128`, `moe_intermediate_size=256`, 4 expertos y 2 capas. Los parámetros fusionados que construye vLLM tienen las siguientes formas: con TP=1, `w13_weight` es (4, 512, 128) y `w2_weight` es (4, 128, 256); con TP=2, `w13_weight` pasa a (4, 256, 128) y `w2_weight` a (4, 128, 128). Las escalas asociadas son `w13_weight_scale` (4, 4, 1) y `w2_weight_scale` (4, 1, 2) en TP=1, y (4, 2, 1) y (4, 1, 1) en TP=2.

No hay entrenamiento: el modelo deriva de `amd-quark/tiny-random-qwen3_moe`, un checkpoint con pesos aleatorios creado como fixture de pruebas. La única transformación aplicada es la cuantización de los expertos enrutados a FP8 por bloques mediante AMD Quark. La atención se deja deliberadamente sin cuantizar porque `k_proj` y `v_proj` tienen 64 filas de ancho y, tras la fusión en un único GEMM QKV en vLLM, los fragmentos no se pueden dividir en una rejilla de bloques de 128 filas. Las escalas se almacenan como `<proj>.weight_scale`, coincidiendo con lo que escribe la exportación HF de Quark para MoE fusionado.

## Capacidades

- No es un modelo de lenguaje funcional: los pesos son aleatorios y las generaciones son ruido por construcción.
- Sirve como fixture de validación para la ruta de cuantización FP8 por bloques de vLLM (`QuarkW8A8Fp8MoEMethod` con `weight_qscheme=per_block` y `block_shape=[128, 128]`).
- Verifica la carga correcta de pesos Quark con escalas por bloque en TP=1 y TP=2.
- Verifica que la de-cuantización de los pesos fusionados reproduce el checkpoint fuente con error relativo máximo de 0,0266 (error de ida y vuelta FP8 por bloques); una rejilla de escalas traspuesta o mal fragmentada da valores cercanos a 1,0.
- No soporta tool calling, agentes, razonamiento multilingüe ni ninguna capacidad generativa real.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Integración continua de vLLM: ejecutar el checkpoint en la suite de tests para comprobar que los cambios en el cargador de pesos Quark no rompen la ruta per-block de FP8 en MoE. Es su propósito declarado y el motivo por el que el equipo mantiene una copia en la organización oficial.
- Validación de exportaciones Quark: comparar las formas de `w13_weight`, `w2_weight` y sus escalas contra las esperadas para detectar regresiones en el exportador HF de AMD Quark antes de publicar modelos reales.
- Pruebas de tensor parallelism: cargar el modelo con TP=1 y TP=2 y verificar que el reparto de escalas por bloque produce las formas documentadas, útil para desarrolladores que añadan soporte TP a nuevos backends.
- Desarrollo de kernels FP8: usar el checkpoint como entrada determinista para comparar la salida de kernels Triton, CUDA o ROCm frente a la de-cuantización de referencia, con un umbral de error conocido (0,0266).
- Depuración de formatos de escala: comprobar si un pipeline de conversión escribe `weight_scale` o `weight_scale_inv` y detectar incompatibilidades de nomenclatura antes de desplegar modelos de producción.
- Pruebas de humo en hardware: validar en MI350 (gfx950) con el backend TRITON FP8 MoE que un entorno recién configurado carga y ejecuta el modelo sin errores de binding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no es evaluable en tareas de lenguaje porque sus pesos son aleatorios. El único dato de rendimiento reportado es la verificación numérica de la de-cuantización: error relativo máximo de 0,0266 frente al checkpoint fuente en MI350 (gfx950) con el backend TRITON FP8 MoE.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precisión, dado que el repositorio ocupa 0,1 GB y el modelo tiene 20,3 millones de parámetros.
- GPU recomendadas: cualquiera compatible con vLLM y con soporte FP8; la verificación oficial se realizó en AMD MI350 (gfx950) con el backend TRITON FP8 MoE.
- Cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas de carga, aunque la ruta FP8 requiere acelerador compatible.
- Opciones de despliegue: vLLM con `enforce_eager=True` (ejemplo oficial de la model card). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Propósito |
|---|---|---|---|---|---|
| vllm-project/tiny-qwen3-moe-fp8-per-block | 20,3 M | no disponible | FP8 per-block [128,128] | MIT | Fixture de CI para vLLM |
| amd-quark/tiny-random-qwen3_moe | no disponible | no disponible | bfloat16 (sin cuantizar) | no disponible | Modelo base aleatorio de Quark |
| Adamji/tiny-qwen3-moe-fp8-per-block | 20,3 M | no disponible | FP8 per-block [128,128] | MIT | Copia original en cuenta personal |

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente y no debe usarse en ninguna aplicación real.
- No es apto para producción, investigación lingüística ni evaluación de capacidades.
- No se documentan sesgos porque no hay datos de entrenamiento ni comportamiento lingüístico que evaluar.
- El riesgo de alucinación es total por construcción: cualquier salida es ruido.
- La licencia MIT permite uso comercial del artefacto, pero su única utilidad comercial es como fixture de pruebas en pipelines de CI.
- La atención queda en bfloat16 de forma intencionada; no es un fallo de la cuantización, sino una restricción del ancho de `k_proj`/`v_proj` (64 filas) frente a la rejilla de bloques de 128 filas tras la fusión QKV.
- El checkpoint es una copia de `Adamji/tiny-qwen3-moe-fp8-per-block` en el commit `c60911a`, mantenida en la organización oficial para reducir riesgo de cadena de suministro; la versión canónica puede divergir en el futuro.
- No hay información sobre longitud de contexto, idiomas ni pipeline, por lo que no se puede asumir ningún comportamiento estándar de Qwen3.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-project/tiny-qwen3-moe-fp8-per-block
- Modelo original: https://huggingface.co/Adamji/tiny-qwen3-moe-fp8-per-block
- Modelo base aleatorio: https://huggingface.co/amd-quark/tiny-random-qwen3_moe
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- AMD Quark: https://github.com/amd/quark
