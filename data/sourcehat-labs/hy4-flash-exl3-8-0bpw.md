# SourceHat-Labs/HY4-Flash-EXL3-8.0bpw

## Resumen

HY4-Flash-EXL3-8.0bpw es una cuantización estándar del checkpoint instructivo Hy4-flash de Tencent, publicada por SourceHat-Labs. Se trata de un modelo de mezcla de expertos (MoE) de 8.311.561.126 parámetros totales, orientado a generación de texto y conversación, cuyo artefacto completo ocupa 230,2 GB en 2.698 ficheros safetensors. La cuantización aplica EXL3 a 8,0 bits por peso únicamente sobre los expertos enrutados (512 expertos por bloque, 41 bloques), mientras que la cabeza de salida, los pesos de visión y el módulo de borrador DFly2 se conservan en su precisión original.

El modelo destaca por su ventana de contexto: 524.288 tokens como valor operativo por defecto y 1.048.576 tokens como límite nativo, heredados sin cambios de la codificación posicional del modelo fuente. Incorpora además un almacenamiento denominado Engram, compuesto por cuatro tablas FP8 E4M3 con escalas BF16 mapeadas en memoria del host, lo que implica que parte del artefacto no reside en VRAM sino en memoria del sistema.

Es relevante ahora porque demuestra un patrón de despliegue poco habitual: cuantización selectiva de expertos con preservación de componentes críticos (cabeza, visión, draft) y descarga de tablas auxiliares a memoria del host. El autor verificó la carga completa en 3 GPUs peer-connected de 64 GiB con una asignación KV compartida Q8 de 1.400.064 tokens, aunque no se publican métricas de throughput en servicio ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, con modulo de borrador DFly2 y pesos de vision nativos |
| Parametros totales | 8.311.561.126 |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens por defecto; 1.048.576 tokens limite nativo |
| Tipos de cuantizacion | EXL3 a 8,0 bits por peso en expertos enrutados; BF16 en cabeza de salida; FP8 E4M3 con escalas BF16 en tablas Engram |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License) |
| Formato de pesos | safetensors (packs de expertos por capa y experto, mas ficheros fijos) |
| Tamano del repositorio | 230,2 GB (230.237.120.662 bytes, 214,43 GiB) |
| Numero de ficheros | 2.698 |
| Expertos por bloque enrutado | 512 |
| Bloques con expertos cuantizados | 41 |
| Hardware verificado | 3 GPUs peer-connected de 64 GiB |
| Modelo base | tencent/Hy4-flash (revision d88c9dfd96ba) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos transformer con 41 bloques que contienen 512 expertos enrutados cada uno. La cuantización EXL3 se aplica exclusivamente a los pesos de esos expertos enrutados, a 8,0 bits por peso; el resto de componentes mantiene su precisión original: la cabeza de salida en BF16, los pesos de visión originales y un módulo de borrador nativo de cinco bloques DFly2. Adicionalmente, el modelo incorpora un sistema Engram de cuatro tablas FP8 E4M3 con escalas BF16, mapeadas en memoria del host en lugar de residir en VRAM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo fuente empleó RLHF, DPO u otras técnicas de alineación. El autor de la cuantización indica explícitamente que no hay ediciones de comportamiento ni fine-tuning adicional: se trata de una conversión de precisión sobre el checkpoint instructivo original de Tencent. La innovación técnica destacable de este artefacto es el esquema de empaquetado: ficheros fijos separados (cabeza, visión, draft), packs de expertos agrupados por capa y experto en `standard-expert-packs/8p0-tp3/`, y tablas Engram con manifiesto propio en `engram/manifest.json`. El fichero `weight-contract.json` documenta la precisión por capa y el layout de pesos.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`) y la naturaleza instructiva del checkpoint fuente.
- Procesamiento de visión: el paquete conserva los pesos de visión originales del modelo base, aunque el autor no verificó generación con visión en su prueba de release.
- Decodificación especulativa mediante el módulo de borrador nativo DFly2 de cinco bloques, que el autor reporta como funcional y con paridad de tokens frente a la decodificación sin borrador en su fixture de prueba.
- Contexto largo: ventana operativa de 524.288 tokens y límite nativo de 1.048.576 tokens.
- Almacenamiento Engram respaldado en host, que permite ampliar la huella efectiva del modelo más allá de la VRAM disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos extensos: con 524.288 tokens de contexto operativo, el modelo puede ingerir libros técnicos completos, expedientes o bases de código de gran tamaño en una sola pasada sin técnicas de recuperación externa, lo que simplifica pipelines de análisis documental.
- Analítica sobre repositorios de código: la ventana de contexto permite cargar múltiples ficheros y su historial de cambios para tareas de revisión, resumen o detección de inconsistencias entre módulos.
- Despliegue en clústeres de 3 GPUs de 64 GiB: el artefacto está verificado en esa topología con peer connectivity, lo que encaja en entornos de inferencia con nodos multi-GPU dedicados y no en estaciones de trabajo monousuario.
- Investigación sobre cuantización selectiva: el paquete sirve como referencia reproducible para estudiar el impacto de cuantizar solo expertos enrutados a 8 bits manteniendo cabeza y visión en BF16, gracias a `weight-contract.json` y `release-verification.json`.
- Evaluación de decodificación especulativa: la presencia del borrador DFly2 nativo permite medir la relación entre aceptación de draft y latencia en cargas reales, si bien el autor advierte que sus tiempos (23,88 s sin draft frente a 69,99 s con draft en su fixture) no son cifras de serving.
- Experimentación con almacenamiento Engram en host: las cuatro tablas FP8 mapeadas en memoria del sistema permiten investigar arquitecturas que desbordan VRAM de forma controlada, útil para estudiar latencias de acceso a memoria host en inferencia MoE.
- Escenarios de contexto ultra-largo en investigación: el límite nativo de 1.048.576 tokens habilita experimentos de recuperación en contextos de un millón de tokens, aunque el autor no verificó latencia de serving a esa escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta una verificación funcional: carga completa del modelo empaquetado en 3 GPUs peer-connected de 64 GiB con asignación KV compartida Q8 de 1.400.064 tokens, y paridad en los primeros 16 tokens greedy por petición entre decodificación solo-target y DFly2 nativo sobre cuatro peticiones de texto cortas y desiguales. Los tiempos de decodificación de ese fixture (23,88 s sin drafting y 69,99 s con drafting) no constituyen métricas de throughput en producción.

## Requisitos de hardware

- VRAM: el artefacto completo pesa 214,43 GiB en disco; el valor de 8,0 bpw aplica solo a expertos enrutados y no representa la precisión media ni la VRAM residente del conjunto. Hay que reservar memoria adicional para el borrador, la caché KV y los buffers de runtime.
- GPUs verificadas: 3 GPUs peer-connected de 64 GiB (por ejemplo, A100 80GB no está confirmada; la topología validada es de 64 GiB por GPU con interconexión peer).
- GPU de consumo: no cabe en GPUs de consumo tipo RTX 4090 (24 GiB) ni en configuraciones monousuario convencionales, dado el tamaño del artefacto y la necesidad de reparto multi-GPU.
- Memoria host: las tablas Engram (cuatro tablas FP8 E4M3 con escalas BF16) se mapean en memoria del host, por lo que se requiere RAM del sistema suficiente además de la VRAM.
- Runtime: requiere un runtime EXL3 con soporte específico de HY4 (expertos latentes, RoPE original, Engram respaldado en host y DFly2 nativo). Un cargador estándar de Transformers no puede interpretar estos packs de expertos, y los ficheros por sí solos no añaden soporte HY4 a ExLlamaV3 estándar.
- Opciones de despliegue: no disponible más allá del runtime EXL3 con soporte HY4 mencionado; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como métricas de serving; solo existen los tiempos de fixture citados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HY4-Flash-EXL3-8.0bpw (este) | 8.311.561.126 | 524.288 por defecto; 1.048.576 nativo | EXL3 8,0 bpw en expertos enrutados | tencent-hy-license | Hugging Face, 230,2 GB, 0 descargas |
| tencent/Hy4-flash (base) | no disponible | 524.288 por defecto; 1.048.576 nativo | BF16 original | tencent-hy-license | Hugging Face |
| Otras cuantizaciones de Hy4-flash | no disponible | no disponible | no disponible | tencent-hy-license | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- El valor de 8,0 bpw se refiere exclusivamente a los pesos de expertos enrutados; no es la precisión media del artefacto ni la VRAM residente del conjunto, lo que puede inducir a error al dimensionar infraestructura.
- El autor no verificó el uso completo del pool de 1M tokens con historiales reales, ni la latencia de serving a 1M tokens, ni la generación con visión; la prueba de release se limita a cuatro peticiones de texto cortas.
- La asignación KV de 1.400.064 tokens es capacidad agregada del pool compartido, no un límite por petición.
- Requiere un runtime EXL3 modificado con soporte HY4; no funciona con cargadores estándar de Transformers ni con ExLlamaV3 de serie, lo que limita la portabilidad y el soporte de la comunidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente por parte de terceros.
- Licencia tencent-hy-license: es una licencia "other" que hay que revisar antes de cualquier uso comercial; el artefacto es una cuantización derivada de pesos de Tencent y hereda sus restricciones.
- Idiomas soportados no documentados, lo que impide garantizar calidad multilingüe en producción.
- No hay información sobre sesgos, tasa de alucinación ni comportamiento en dominios sensibles del modelo fuente ni de esta cuantización.
- Los tiempos de decodificación publicados (23,88 s sin draft, 69,99 s con draft) provienen de un fixture y no deben usarse como estimación de throughput.
- El tamaño de 214,43 GiB y la necesidad de 3 GPUs peer-connected de 64 GiB excluyen su uso en hardware de consumo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/SourceHat-Labs/HY4-Flash-EXL3-8.0bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Revisión concreta del modelo base: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Licencia: https://huggingface.co/SourceHat-Labs/HY4-Flash-EXL3-8.0bpw/blob/main/LICENSE
