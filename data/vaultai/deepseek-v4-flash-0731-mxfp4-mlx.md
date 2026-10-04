# vaultai/DeepSeek-V4-Flash-0731-MXFP4-MLX

## Resumen

DeepSeek-V4-Flash-0731-MXFP4-MLX es una conversion cuantizada del checkpoint deepseek-ai/DeepSeek-V4-Flash-0731, publicada por el usuario vaultai para ejecucion en Apple Silicon mediante MLX. El modelo base es un transformer de tipo mixture of experts (MoE) de la familia deepseek_v4, con aproximadamente 304.180.418.494 parametros totales segun los safetensors del repositorio (la model card indica 305B) y unos 13B parametros activos por token.

La particularidad de esta version es que aplica cuantizacion MXFP4 a los expertos y MXFP8 a la atencion, manteniendo una fidelidad bit-exacta respecto al checkpoint original: cada peso desquantiza exactamente al mismo valor, con un maxdiff medido de 0.000e+00 y un incremento de tamano de solo el 0.12% (167.1 GB frente a los 166.9 GB del original). Ademas, conserva las cabezas DSpark MTP (multi-token prediction) que la mayoria de las conversiones comunitarias eliminan, lo que habilita decodificacion especulativa nativa bajo oMLX 0.5.4rc2 o superior.

Su relevancia es practica: demuestra que se puede servir un MoE de ~305B parametros en una sola maquina con memoria unificada de 256 GB, con un rendimiento medido de 41.7 tok/s a 23K tokens de contexto gracias al MTP nativo, frente a 26.1 tok/s sin especulacion. Es, por tanto, una pieza pensada para inferencia local de alta capacidad y para investigacion sobre cuantizacion y decodificacion especulativa en MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) de la familia deepseek_v4; expertos en MXFP4 y atencion en MXFP8; incluye cabezas DSpark MTP |
| Parametros totales | 304.180.418.494 (~304B) segun safetensors; la model card declara 305B |
| Parametros activos | ~13B (segun la model card) |
| Longitud de contexto | no disponible; las mediciones del autor se realizaron con 23K tokens en cache |
| Tipos de cuantizacion | MXFP4 (expertos) y MXFP8 (atencion), 4 bits; conversion bit-exacta del checkpoint original. La model card compara ademas con MLX affine 8-bit y MLX affine 4-bit (g32), que no son este repositorio |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |

## Arquitectura y entrenamiento

Se trata de un modelo de arquitectura mixture of experts de la familia deepseek_v4, con atencion cuantizada en MXFP8 y capas de expertos cuantizadas en MXFP4. La conversion es bit-exacta: el autor verifica que cada peso desquantiza exactamente al mismo valor que el checkpoint original, con maxdiff = 0.000e+00, a cambio de un 0.12% mas de tamano. El checkpoint conserva las cabezas DSpark MTP, que oMLX 0.5.4rc2 o superior explota mediante kernels Metal nativos para las proyecciones DSpark, los expertos enrutados, el scoring del indexador DSA y la verificacion por bloques. La cabeza de salida (`head`) se deja sin cuantizar, con dimensiones 129280x4096 en bf16, lo que supone 1.06 GB de lectura por forward.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. La cuantizacion se limita a los pesos, no afecta al entrenamiento. La innovacion tecnica destacable en este repositorio es doble: la preservacion de las cabezas MTP para decodificacion especulativa (DSpark Lightning MTP) y la comprobacion de que la cuantizacion MXFP4/MXFP8 es reversible sin perdida. El autor documenta que las tasas de aceptacion del DSpark sobre codigo estructurado alcanzan un prefijo esperado de 4.75 tokens, frente a un rendimiento mucho menor en prosa abierta.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation y el modelo esta etiquetado como deepseek_v4.
- Generacion de codigo: la model card mide la aceptacion del decodificador DSpark sobre "codigo estructurado", lo que evidencia uso sobre codigo.
- Decodificacion especulativa nativa: las cabezas DSpark MTP permiten multi-token prediction con verificacion por bloques, con kernels Metal en oMLX 0.5.4rc2+.
- Razonamiento multi-paso: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible de forma explicita; la model card menciona "trafico de agentes que reenvia un contexto creciente en cada turno" como el escenario donde la cache de prompt es critica.
- Capacidades multilingues: no disponible; el campo de idiomas no esta cumplimentado.
- Vision o audio: no disponible; no hay ninguna referencia a modalidades distintas del texto.
- Modo de pensamiento (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo local en estacion de trabajo Apple Silicon: el modelo cabe en un Mac Studio M3 Ultra de 256 GB de memoria unificada (145.5 GiB de pesos residentes) y genera a 40.6 tok/s en prompts cortos, lo que permite usarlo como autocompletado y generacion de funciones sin enviar codigo a terceros.
- Backend de agentes con contexto creciente: el autor identifica el trafico de agentes que reenvia un contexto cada vez mayor como el escenario donde la cache de prompt marca la diferencia; activar `hot_cache_max_size` redujo un prompt de 23.7K tokens de 51.0s a 4.6s.
- Analisis de documentos largos con prefijo cacheado: con 23K tokens en cache y un prefill cacheado de ~1.2s, es viable procesar repetidamente el mismo documento largo con distintas preguntas sin repagar el prefill completo.
- Servicio multiusuario en dos nodos DGX Spark: con TP=2 el sistema reporta 147.0 tok/s agregados a concurrencia x8 (23.8 tok/s por stream, TTFT 4.91s), adecuado para servir varios usuarios simultaneos.
- Investigacion en cuantizacion de MoE: el repositorio es un caso de estudio de cuantizacion bit-exacta MXFP4/MXFP8, con comparativas frente a MLX affine 8-bit (0.69% de error relativo medio) y affine 4-bit g32 (~8.47% proyectado).
- Investigacion en decodificacion especulativa: sirve para reproducir experimentos de MTP nativo frente a especulacion desactivada (41.7 frente a 26.1 tok/s a 23K) y para medir tasas de aceptacion por posicion.
- Inferencia con requisitos de privacidad: al ejecutarse en hardware propio y con licencia MIT, es apto para entornos donde los datos no pueden salir de la organizacion.
- Prototipado de aplicaciones de texto a gran escala: la licencia MIT y el pipeline text-generation permiten integrarlo en productos comerciales sin restricciones declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Si se aportan mediciones de rendimiento y de perplexity del autor.

Rendimiento de decodificacion (Mac Studio M3 Ultra, 80 nucleos de GPU, 256 GB de memoria unificada, 819 GB/s, macOS 26.6, mlx 0.32.0 / mlx-lm 0.31.3 bajo oMLX, 145.5 GiB de pesos residentes; medido por pendiente para cancelar el prefill):

| Configuracion | Contexto 23K | Prompt corto |
|---|---|---|
| oMLX 0.5.4rc2, DSpark MTP nativo | 41.7 tok/s | 40.6 tok/s |
| Especulacion desactivada | 26.1 tok/s | ~29 tok/s |
| Stack de parches pre-rc2 sobre 0.5.4rc1 | 37.6-40.7 tok/s | 47.7-50.1 tok/s |
| Terceros sin MTP (varios) | 26.2 / 28.8-29.8 / 26.6 (12K) tok/s | 35.5 tok/s (Q4 comunitario) |

Rendimiento comparativo en dos nodos DGX Spark (TP=2, single-stream 72.8 tok/s):

| Concurrencia | Agregado | Por stream | TTFT |
|---|---|---|---|
| x1 | 72.8 | 72.8 | 237 ms |
| x2 | 102.0 | 53.1 | 1.55 s |
| x4 | 120.0 | 35.4 | 7.68 s |
| x8 | 147.0 | 23.8 | 4.91 s |

Impacto de cuantizar la cabeza de salida (teacher-forced sobre 2047 posiciones):

| `lm_head` | Perplexity | Respecto a bf16 | Coincidencia top-1 |
|---|---|---|---|
| bf16 (stock) | 8.3103 | — | — |
| 8-bit | 8.3019 | -0.10% | 98.78% |
| 6-bit | 8.3088 | -0.02% | 97.07% |
| 4-bit | 8.5392 | +2.75% | 91.26% |

Aceptacion del decodificador DSpark (frente a decodificacion autorregresiva de referencia, sin rollback):

| Contenido | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | E[prefijo] |
|---|---|---|---|---|---|---|
| Codigo estructurado | 100% | 96% | 96% | 92% | 96% | 4.75 |
| Prosa abierta | 71% | 21% | 8% | 17% | 8% | no disponible (truncado en la fuente) |

## Requisitos de hardware

- Almacenamiento: 167.1 GB para el repositorio completo.
- Memoria: 145.5 GiB de pesos residentes en el escenario medido por el autor.
- Hardware validado: Mac Studio con M3 Ultra (GPU de 80 nucleos, 256 GB de memoria unificada, 819 GB/s) bajo macOS 26.6.
- Alternativa multi-nodo: dos DGX Spark con tensor parallelism TP=2, que reportan 72.8 tok/s en single-stream.
- GPU de consumo: no cabe. El modelo requiere del orden de 145 GiB solo para pesos, muy por encima de los 24 GB de una RTX 4090 o de tarjetas similares. No hay datos de ejecucion en GPUs de consumo en la informacion disponible.
- Opciones de despliegue: MLX (mlx 0.32.0, mlx-lm 0.31.3) y oMLX 0.5.4rc2 o superior con `mtp_enabled`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: 41.7 tok/s a 23K de contexto y 40.6 tok/s en prompt corto con MTP nativo; 26.1 tok/s a 23K sin especulacion. Prefill cacheado de ~1.2s a 23K.
- Ajuste importante: activar `hot_cache_max_size` (por defecto viene a `"0"`, es decir, desactivado); con el activado, un prompt repetido de 23.7K tokens pasa de 51.0s a 4.6s.
- Estabilidad de las cifras: el propio autor advierte que el estado de la maquina mueve los numeros en torno a un 8%, por lo que recomienda citar el extremo bajo de cualquier rango.

## Comparativa con modelos similares

| Version | Tamano | Fidelidad | Notas |
|---|---|---|---|
| Checkpoint original (deepseek-ai/DeepSeek-V4-Flash-0731) | 166.9 GB | — | Referencia bf16 |
| Este repositorio (vaultai, MXFP4/MXFP8 MLX) | 167.1 GB | Bit-identico (maxdiff 0.000e+00) | Conserva cabezas DSpark MTP; 41.7 tok/s a 23K con MTP nativo |
| MLX affine 8-bit | 324.7 GB | 0.69% de error relativo medio | Conversion alternativa, casi el doble de tamano |
| MLX affine 4-bit (g32) | ~193 GB (proyectado) | 8.47% de error relativo medio | Alternativa de 4 bits con perdida mayor |
| Conversiones comunitarias Q4 / otras | no disponible | no disponible | Eliminan las cabezas MTP; 35.5 tok/s en prompt corto, 26.6 a 12K segun datos de terceros |

No se dispone de comparativas con otros modelos de la misma categoria (por ejemplo, otros MoE de ~300B) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion es bit-exacta segun el autor, por lo que no introduce degradacion medible en los pesos, pero el coste es un repositorio de 167.1 GB, mas grande que el original.
- Si se instalan los parches de velocidad complementarios sobre oMLX 0.5.4rc2 o superior, el autor advierte de dos fallos: el marcador de especulacion coloca un segundo decodificador especulativo sobre la misma cache KV, lo que mantiene una salida fluida pero reinicia repetidamente la misma frase, y los parches de cache abortan rc2 con el error `Cache corruption not recoverable after retries`.
- Muchas conversiones comunitarias eliminan las cabezas MTP. Antes de confiar en MTP nativo hay que comprobar que existen los tensores `mtp.*` en el build.
- La cache de prompt viene desactivada por defecto en oMLX (`hot_cache_max_size` a `"0"`), lo que degrada drasticamente el rendimiento en prompts largos repetidos si no se corrige.
- El autor retira explicitamente cifras anteriores (47.1 tok/s, 2.06x, 43-48 tok/s, 938 tok/s) por haber sido medidas sobre una cache KV corrupta, con un metodo contaminado por el prefill o sobre texto patologicamente repetitivo. Cualquier cifra que circule tomada de esas revisiones debe considerarse invalida.
- La varianza por estado de la maquina es de aproximadamente un 8% en el hardware medido.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica. El campo de idiomas no esta cumplimentado.
- Licencia MIT: permite uso comercial sin restricciones declaradas, pero se aplica sobre un modelo derivado cuyo modelo base tambien declara MIT en esta ficha.
- El autor de la conversion es un usuario independiente (vaultai), no el equipo de DeepSeek; no constan descargas ni valoraciones en el momento del registro.
- No se documentan rutas de despliegue fuera de MLX/oMLX, lo que limita la portabilidad a entornos con GPUs NVIDIA o AMD.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vaultai/DeepSeek-V4-Flash-0731-MXFP4-MLX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de parches (mantenido como registro historico, no recomendado sobre rc2): https://github.com/ashhart/DeepSeekV4-Flash-0731-MXFP4-MLX
