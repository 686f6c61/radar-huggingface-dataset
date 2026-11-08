# surak/HyperArete-27B-W4A16

## Resumen

HyperArete-27B-W4A16 es una cuantizacion calibrada del modelo vision-lenguaje NousResearch/Arete-27B, publicada por el usuario surak bajo licencia Apache 2.0. El checkpoint reduce el cuerpo del modelo de lenguaje a pesos simetricos W4A16 con grupo de 128, mantiene la cabeza del LM y los embeddings de tokens en INT8 (grupo 128) y conserva intactos los 333 tensores de vision. El resultado es un repositorio de 16,1 GB frente a los 54,7 GB de pesos originales, lo que permite servirlo en una unica GPU RTX 3090 de 24 GB.

La relevancia de esta ficha no esta en el modelo base, sino en la receta de cuantizacion y en el perfil de servicio: el autor documenta un despliegue funcional en vLLM 0.31.0 con parches de HyperQwen, cache KV en FP8, estado recurrente en FP16, kernels de activacion INT8 para todo el MLP y soporte de imagenes. El checkpoint conserva la configuracion posicional de 262.144 posiciones del original, aunque el perfil de produccion limita cada peticion a 150.000 tokens totales (entrada mas salida) por motivos de rendimiento.

Conviene subrayar que se trata de una cuantizacion, no de un modelo nuevo: no hay entrenamiento de alineamiento adicional ni fusion con otro checkpoint Qwen. El autor advierte explicitamente de que no se ha completado una evaluacion amplia de calidad frente al Arete-27B en BF16, por lo que las pruebas publicadas son de tipo funcional y de carga, no de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (familia qwen3_5), cuantizado con compressed-tensors |
| Parametros totales | 6.260.690.960 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 posiciones en la configuracion del checkpoint; 150.000 tokens por peticion en el perfil de servicio recomendado |
| Tipos de cuantizacion | W4A16 simetrico grupo 128 en el cuerpo del LM; INT8 grupo 128 en LM head y embeddings; vision sin cuantizar (333 tensores verificados sin cambios); cache KV FP8 y estado recurrente FP16 en runtime |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 5 shards finales de 16.100.314.792 bytes en total |

## Arquitectura y entrenamiento

El modelo base es NousResearch/Arete-27B, un vision-lenguaje de la familia qwen3_5 con pipeline image-text-to-text. La model card no detalla la composicion del dataset de preentrenamiento ni las etapas de RLHF o DPO del original; solo indica que el SFT de Arete uso un contexto de entrenamiento de 64K. Esta cuantizacion no anade entrenamiento de alineamiento ni fusiona pesos con otro checkpoint.

La innovacion tecnica esta en el proceso de cuantizacion: AutoRound 0.16.1 con 200 iteraciones, 128 muestras de calibracion de NeelNanda/pile-10k, secuencias de 2.048 tokens, batch de 4 y semilla 42. El cuerpo del LM queda en W4A16 simetrico con grupo 128; la cabeza y los embeddings pasan a INT8 con grupo 128. El checkpoint resultante no incluye cabeza MTP, por lo que no hay decodificacion especulativa configurada. El autor publica la receta reproducible en el directorio `recipe/` del repositorio, con versiones fijadas de HyperQwen (`ce9615c4f2309be727407918a6c979bd67968069`) y del checkpoint fuente de Arete (`108f0afbdcfaa1ceeda4a635004304dfff6d4da2`). La cuantizacion tardo unos 83 minutos en una RTX 3090.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia de Arete.
- Comprension de imagenes y respuesta image-text-to-text; los tensores de vision se conservan intactos.
- Razonamiento con modos de esfuerzo normalizados en la plantilla (`max`/`high` se mapean a `xhigh`, `minimal` a `low`, `none` desactiva el modo thinking).
- Soporte de tool calling y function calling, verificado en el script de validacion del autor.
- Salida estructurada en JSON y streaming, incluidos en las pruebas funcionales.
- Recuperacion de informacion en contexto largo: se valido una peticion real de 149.744 tokens y, en un despliegue TP2 previo, una de 261.888 tokens.
- Marca de agua Gumbel con clave 16386 a temperatura distinta de cero, que marca el texto generado y no los pixeles de imagen.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con capturas de pantalla o fotos de producto adjuntas, gracias al pipeline image-text-to-text y a una ventana de hasta 150.000 tokens por peticion en el perfil de servicio.
- Extraccion estructurada de documentos e imagenes: combinando soporte de JSON y vision, encaja en pipelines que reciben una imagen y devuelven un objeto JSON validado, con tool calling para consultas posteriores.
- Asistente de codigo en IDE o CI/CD: el soporte de function calling permite integrarlo como agente que invoca herramientas de compilacion, tests o busqueda en repositorio, con salida en streaming.
- Analisis de contexto largo en una sola GPU: con 150.000 tokens por peticion y recuperacion validada a 149.744 tokens, sirve para resumir expedientes, hilos de incidencias o documentacion tecnica extensa en hardware de consumo.
- Despliegue en estaciones de trabajo con RTX 3090: el perfil de 24 GB permite montar uno o dos replicas (una por GPU, puertos 18040 y 18041) para entornos de desarrollo, demos internas o prototipos sin acceso a A100/H100.
- Generacion de contenido marcado: la marca de agua Gumbel con clave permite etiquetar texto sintetico en flujos editoriales o de moderacion, con deteccion de clave correcta e incorrecta incluida en la validacion.
- Procesamiento por lotes de baja concurrencia: los 64 slots de scheduler y el rendimiento medido de 342 tokens/s agregados a 8 peticiones y 1.257-1.270 a 64 peticiones lo hacen util para tareas batch moderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que no se ha completado una evaluacion amplia de calidad frente al Arete-27B en BF16.

Los datos publicados son de rendimiento de servicio, medidos el 2026-11-08 en dos RTX 3090 de 24 GB con prompts cortos sobre fotosintesis, 128 tokens de salida por peticion, temperatura 0,7, thinking desactivado e `ignore_eos=True`:

| Peticiones concurrentes | Tokens de salida | Tiempo total | Tokens/s agregados |
|---|---|---|---|
| 16 (dos workers) | 2.048 | 3,531 s | 579,96 |
| 128 (dos workers) | 16.384 | 6,301 s | 2.600,25 |

Mediciones por worker individual: decodificacion de una sola peticion de aproximadamente 47,6 tokens/s; 342 tokens/s agregados con 8 peticiones y 1.257-1.270 con 64 peticiones. La recuperacion cerca del limite de contexto tardo unos 125 segundos por worker. El autor advierte de que son rafagas sinteticas cortas, no capacidad sostenida de produccion.

## Requisitos de hardware

- VRAM: el perfil probado ocupa una RTX 3090 de 24 GB con `GPU_UTIL=0.94`; el repositorio pesa 16,1 GB en disco.
- GPU recomendadas: RTX 3090 (unica configuracion validada). El autor no documenta pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: si cabe en RTX 3090 de 24 GB; no hay datos para GPUs con menos VRAM.
- Despliegue: vLLM 0.31.0 con parches de HyperQwen, Torch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0. Una instalacion estandar de vLLM no es equivalente; es necesario compilar kernels con las cabeceras y librerias CUDA adecuadas.
- Slots de scheduler: 64 en total; el arranque estima 34-45 peticiones residentes a 1K de contexto, cinco a 32K y una a 150K por GPU.
- Latencia y throughput: 47,6 tokens/s en decodificacion de una peticion; 2.600 tokens/s agregados con 128 peticiones concurrentes en dos GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| surak/HyperArete-27B-W4A16 | 6.260.690.960 (safetensors) | 262.144 (150K por peticion en servicio) | W4A16 + INT8 en head/embeddings | Apache 2.0 | Perfil validado en RTX 3090 con vLLM parcheado |
| TheUnderscore/Arete-27B-W4A16-AWQ | 27B (segun la card) | no disponible | W4A16 AWQ | no disponible | Misma base Arete-27B, cuantizacion AWQ |
| syvai/Qwen3.8-27B-DFlash2-W4A16 | 27B (segun la card) | no disponible | W4A16 GPTQ con draft de decodificacion especulativa | Apache 2.0 | Incluye cabeza DFlash2 para speculative decoding, ausente en HyperArete |

## Limitaciones y advertencias

- No se ha publicado una evaluacion amplia de calidad frente al Arete-27B en BF16; no debe inferirse la preservacion de los resultados de precision y alineamiento de Nous Research a partir de las pruebas funcionales.
- La cuantizacion W4A16 y la activacion INT8 en runtime pueden degradar tareas sensibles a precision numerica; el autor no cuantifica esa perdida.
- El perfil de servicio limita cada peticion a 150.000 tokens totales, por debajo de las 262.144 posiciones configuradas en el checkpoint. La recuperacion validada a 149.744 tokens no equivale a una evaluacion general de calidad en contexto largo.
- El SFT original de Arete uso 64K de contexto de entrenamiento, por lo que el rendimiento mas alla de esa longitud no esta garantizado.
- Requiere un entorno HyperQwen parcheado y versiones fijadas; una instalacion estandar de vLLM no reproduce el comportamiento documentado.
- El script de reproduccion portable no se ha ejecutado en una segunda compilacion completa; solo se valido el build original en cluster.
- La marca de agua Gumbel se aplica al texto generado, no a los pixeles de imagen, y solo a temperatura distinta de cero.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad del modelo base.
- Los pesos no deben mezclarse con Qwen estandar en un pool de alias, segun advierte el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/surak/HyperArete-27B-W4A16
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Receta de cuantizacion: https://github.com/surak/HyperArete
- HyperQwen: https://github.com/syv-ai/HyperQwen
- Cuantizacion AWQ alternativa: https://huggingface.co/TheUnderscore/Arete-27B-W4A16-AWQ
- Modelo comparable con speculative decoding: https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
