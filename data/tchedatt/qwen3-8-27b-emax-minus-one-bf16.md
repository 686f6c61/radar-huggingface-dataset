# tchedaTT/Qwen3.8-27B-emax-minus-one-bf16

## Resumen

Qwen3.8-27B-emax-minus-one-bf16 es un checkpoint derivado y experimental publicado por el usuario tchedaTT a partir de Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0). No es un modelo nuevo ni un ajuste fino: es una modificacion de pesos, hecha el 21 de septiembre de 2026, mediante una busqueda de exponente offline (weight-only) pensada para los formatos BFP4_B y BFP8_B de Tenstorrent. Los ficheros siguen siendo safetensors BF16 convencionales de aproximadamente 55,6 GB.

La tecnica aplicada es concreta: para cada grupo de 16 salidas por canal de entrada se evalua el exponente maximo ordinario y el exponente maximo menos uno, se cuantiza con redondeo de mantisa y saturacion de Tenstorrent, y se conserva el candidato con menor error cuadratico de peso no ponderado. Los empates mantienen el exponente ordinario. No hay calibracion, inferencia, entrenamiento, GPTQ ni escalado de activaciones implicados en el proceso. El objetivo es mejorar la reconstruccion de pesos antes de que el runtime de Tenstorrent los re-cuantice a BFP4_B/BFP8_B, no comprimir el checkpoint.

Su relevancia es acotada y muy especifica: esta pensado para cargarse con el bundle `mando2222/qwen3.8-27b-dflash2-p300x2-q4kv` en una maquina de servicio Tenstorrent con reparto tensor-parallel de 4 chips. El autor declara explicitamente que no se ha ejecutado ninguna prueba de inferencia completa, perplejidad, exactitud de tareas ni benchmark de rendimiento sobre este checkpoint, por lo que debe tratarse como material de validacion experimental, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; derivado de Qwen/Qwen3.8-27B (tag de arquitectura `qwen3_5`). El checkpoint incluye atencion completa (Q, K, V, O), proyecciones GDN (QKV, Z y salida), parametros de vision y parametros MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Almacenamiento en BF16 (bfloat16). Formato de destino en runtime: BFP4_B (MLP gate/up) y BFP8_B (MLP down, atencion completa Q/K/V/O, GDN QKV/Z/salida, cabeza de salida del modelo de lenguaje) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (se conserva la licencia original; copyright 2026 Alibaba Cloud) |
| Formato de pesos | Safetensors en BF16, ~55,6 GB de repositorio |
| Tamano del repositorio | 55,6 GB |
| Modalidad (pipeline) | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B, revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |
| Relacion con el modelo base | quantized (derivado por modificacion de pesos) |
| Loader previsto | mando2222/qwen3.8-27b-dflash2-p300x2-q4kv, revision 9a39bc16ca0a9d560f06caa2111db6c25fa0b524 |
| Checkpoint draft asociado | incoai/Qwen3.8-27B-DFlash2, revision dedf8df68adfb1afeaf7b7480c0a0243108177b4 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada en la model card sobre la arquitectura interna del modelo base mas alla de los nombres de las matrices modificadas. De la lista de tensores afectados se deduce que el modelo combina atencion completa (proyecciones Q, K, V y O), capas con proyecciones GDN (QKV, Z y proyeccion de salida, con proyecciones pequenas A/B excluidas de la modificacion) y un cabezal de prediccion multi-token (MTP). Tambien incluye parametros de vision, coherente con la etiqueta de pipeline `image-text-to-text`. Las proyecciones pequenas A/B de GDN quedan fuera del proceso porque sus anchos fusionados por dispositivo cruzan fronteras de exponente de 16 elementos.

No se trata de un entrenamiento ni de un ajuste: es una transformacion offline de pesos ya entrenados. Para cada grupo de 16 salidas por canal de entrada se calculan dos candidatos de exponente (maximo ordinario y maximo menos uno), se cuantizan con redondeo de mantisa y saturacion propias de Tenstorrent, y se selecciona el de menor error cuadratico de peso no ponderado, manteniendo el exponente ordinario en caso de empate. El resultado se serializa de nuevo en BF16 como aproximacion de transporte. No se aplican calibracion, GPTQ, escalado de activaciones ni ninguna forma de aprendizaje. El driver de exportacion (`export_weights.py`) usa el paquete offline `tt_bfp_quant` de la rama `tcheda/offline-bfp-quantization` de tt-metal, commit `75052cb05887623a82e173b2a46d3d6b4b78ab45`, con candidatos de exponente `[0, -1]`.

Los tensores no objetivo (embeddings, normalizaciones, convoluciones, proyecciones pequenas GDN A/B, parametros de vision y parametros MTP) se conservan identicos al modelo base, al igual que la configuracion, el tokenizer, los nombres y las formas de los tensores y los dtypes de almacenamiento BF16. El fichero `tt_bfp_quantization.json` documenta cada tensor modificado, los hashes de origen y salida, las elecciones de grupo, los errores de reconstruccion y la validacion.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y la cabeza de salida del modelo de lenguaje se mantienen, por lo que el checkpoint conserva la funcion de generacion de texto del modelo base.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text` y los parametros de vision no se han modificado, por lo que la ruta multimodal del modelo base permanece intacta.
- Razonamiento y generacion multi-token: el modelo base incluye parametros MTP (multi-token prediction) que este checkpoint no altera, lo que sugiere soporte de decodificacion especulativa o prediccion multi-token en el runtime.
- Decodificacion especulativa: el bundle de destino incluye un checkpoint draft DFlash2 independiente, lo que habilita decodificacion especulativa en el stack Tenstorrent.
- Atencion hibrida: la presencia de proyecciones GDN junto a atencion completa indica capas de atencion lineal o de estado recurrente combinadas con atencion estandar.
- Tool calling, function calling y uso agentico: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio en hardware Tenstorrent con el bundle DFlash2: el escenario previsto es descargar el checkpoint, generar un bundle local con `prepare_bundle.py`, validar el manifiesto con `tt-model serve --print` y arrancar el servidor con `tt-model serve qwen38-emaxm1-bundle/tt_kernel_manifest.json`. Es el unico uso documentado por el autor.
- Investigacion en cuantizacion de pesos: el checkpoint sirve para estudiar si la busqueda offline de exponente (maximo frente a maximo menos uno) reduce el error cuadratico de peso respecto a la cuantizacion ordinaria en BFP4_B y BFP8_B, comparando los errores registrados en `tt_bfp_quantization.json`.
- Auditoria de integridad de pesos: gracias a `SHA256SUMS` y al manifiesto de auditoria, puede usarse para verificar que los tensores no objetivo coinciden con el modelo base y que cada valor exportado es exactamente representable en BF16 y sobrevive a una recuantizacion estandar de exponente maximo.
- Reproduccion de pipelines de exportacion: `export_weights.py` es un driver de exportacion de memoria acotada, util para replicar el flujo sobre otras revisiones del modelo base o con otros conjuntos de candidatos de exponente.
- Validacion de fidelidad en despliegues multimodales: dado que los parametros de vision no se han tocado, permite comprobar en el stack TT que la rama de imagen no se degrada al cambiar solo los pesos del modelo de lenguaje.
- Base para comparativas A/B de cuantizacion: al conservar la configuracion, tokenizer y formas de tensor, se puede comparar contra el checkpoint original de Qwen/Qwen3.8-27B en el mismo runtime cambiando unicamente el snapshot de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se ha ejecutado ninguna inferencia completa en TT, ni medidas de perplejidad, exactitud de tareas o rendimiento sobre este checkpoint, y advierte que un menor error de peso no implica mayor exactitud del modelo.

## Requisitos de hardware

- Peso en BF16: 27.781.427.952 parametros a 2 bytes por parametro suponen aproximadamente 55,6 GB solo en pesos, que coincide con el tamano del repositorio.
- VRAM estimada para inferencia: no disponible de forma oficial. Como minimo hay que sumar a los ~55,6 GB de pesos el cache KV (el bundle de destino usa ajuste `q4kv`) y los buffers de activaciones, por lo que un despliegue completo necesita bastante mas de 56 GB.
- GPU consumer: no cabe en una unica GPU de consumo. Una RTX 4090 (24 GB) o una RTX 5090 no son suficientes por si solas; requeriria reparto en varias GPU con tensor parallelism y posiblemente offload.
- GPU de centro de datos: configuraciones plausibles serian 2x H100 80 GB, 4x A100 40 GB o 4x A100 80 GB con tensor parallelism. No hay cifras oficiales de compatibilidad publicadas en la informacion disponible.
- Hardware de destino declarado: Tenstorrent, con el bundle `qwen3.8-27b-dflash2-p300x2-q4kv` y su reparto tensor-parallel de 4 chips (p300x2). Se recomienda usar una cache de tensores TT nueva al cambiar de checkpoint.
- Opciones de despliegue: el flujo documentado es `tt-model pull`, `hf download` y `tt-model serve` sobre el manifiesto generado por `prepare_bundle.py`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otras alternativas para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tchedaTT/Qwen3.8-27B-emax-minus-one-bf16 | 27.781.427.952 | No disponible | Safetensors BF16 (~55,6 GB) | Apache 2.0 | 0 descargas, 0 likes; experimental |
| Qwen/Qwen3.8-27B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | Apache 2.0 (segun el checkpoint derivado) | Modelo upstream de referencia |
| mando2222/qwen3.8-27b-dflash2-p300x2-q4kv (bundle de destino) | No disponible | No disponible | Bundle TT con ajuste q4kv sobre cache KV | No disponible | Repositorio de despliegue para el que se preparo este checkpoint |
| incoai/Qwen3.8-27B-DFlash2 (draft) | No disponible | No disponible | No disponible | No disponible | Checkpoint draft para decodificacion especulativa |

No se dispone de datos de rendimiento de ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo nuevo ni un ajuste fino: es un derivado experimental de pesos, no una version oficial de Qwen. El autor lo indica expresamente.
- No hay ninguna evaluacion de calidad: no se ha medido perplejidad, exactitud en tareas ni rendimiento. Un menor error cuadratico de peso no garantiza mejor exactitud del modelo.
- Validacion limitada al error de reconstruccion: se comprueba que ningun grupo modificado empeora el error cuadratico y que cada valor exportado es representable en BF16, pero no se valida el comportamiento funcional del modelo.
- Dependencia estricta del runtime: cambiar dtypes, agrupacion, sharding, fusiones o el codigo de cuantizacion invalida la validacion y obliga a repetirla. El BF16 se describe como una aproximacion de transporte comoda, no como el formato final de ejecucion.
- Excluye tensores que podrian beneficiarse del mismo proceso: las proyecciones pequenas GDN A/B quedan fuera porque sus anchos fusionados por dispositivo cruzan fronteras de exponente de 16 elementos.
- Compatibilidad no universal: esta preparado para un loader concreto (`mando2222/qwen3.8-27b-dflash2-p300x2-q4kv`, revision `9a39bc16...`) con disposicion de 4 chips. Otros stacks no estan contemplados.
- Advertencia sobre la model card original: el README heredado describe el modelo upstream y sus resultados de evaluacion no deben interpretarse como mediciones de este checkpoint.
- Integridad de ficheros: el `crc32.txt` original se ha omitido porque ya no describe los shards modificados; debe usarse `SHA256SUMS`.
- Idiomas, sesgos y riesgo de alucinacion: no disponible en la informacion proporcionada. Al tratarse de una modificacion de pesos de un modelo base multimodal, los sesgos y el comportamiento del upstream se heredan, pero no hay datos especificos.
- Licencia: Apache 2.0 permite uso comercial, pero se mantiene el copyright 2026 Alibaba Cloud y la licencia original debe conservarse. No hay restricciones adicionales declaradas por el autor del derivado.
- Adopcion nula: 0 descargas y 0 likes, sin comunidad que haya validado el checkpoint.
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre el modelo: tratan sobre barreras de acceso para vehiculos (道闸) y no guardan relacion con este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tchedaTT/Qwen3.8-27B-emax-minus-one-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Bundle de despliegue previsto: https://huggingface.co/mando2222/qwen3.8-27b-dflash2-p300x2-q4kv
- Checkpoint draft DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Rama de tt-metal con el paquete offline de cuantizacion: https://github.com/tenstorrent/tt-metal (rama `tcheda/offline-bfp-quantization`, commit `75052cb05887623a82e173b2a46d3d6b4b78ab45`)
- Ficheros incluidos en el repositorio: `export_weights.py`, `prepare_bundle.py`, `tt_bfp_quantization.json`, `SHA256SUMS`, `UPSTREAM_README.md`, `LICENSE`
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la informacion proporcionada.
