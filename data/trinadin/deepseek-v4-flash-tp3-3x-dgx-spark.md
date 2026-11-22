# trinadin/DeepSeek-V4-Flash-TP3-3x-DGX-Spark

## Resumen

DeepSeek-V4-Flash-TP3-3x-DGX-Spark es una receta de despliegue (serving recipe) publicada por el usuario trinadin en Hugging Face, no un modelo entrenado desde cero. Su objetivo es servir el checkpoint DeepSeek-V4-Flash (284B parámetros totales, 13B activos, nativo mixto FP4+FP8) en paralelo tensorial (TP=3) sobre tres estaciones NVIDIA DGX Spark (GB10) interconectadas mediante un triángulo CX-7 RoCE de 200 Gbps por tramo. El repositorio incluye comandos de arranque, imágenes Docker fijadas por digest, perfiles de lanzamiento validados y registros de fallos resueltos (FIXLOGs).

El modelo base real es Jiunsong/SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX, una variante "abliterated" de la línea 0731 de DeepSeek V4, es decir, un ajuste fino que elimina mecanismos de rechazo del modelo original. La receta ofrece dos perfiles operativos: SPEED, con decodificación especulativa DSpark k=5 y ~100-108 tok/s en flujos de código, y CAPACITY, sin decodificación especulativa y con un pool KV de ~7,5-7,6M tokens que permite aproximadamente 7,2 sesiones simultáneas de 1M de contexto. Además se documenta un tercer build CSF (compressed-scales) medido como el más rápido en decodificación de un solo flujo.

La relevancia actual es doble: por un lado demuestra que es viable servir un modelo de 284B parámetros con contexto de 1M en hardware de escritorio de tres nodos (DGX Spark), algo impensable hace pocos años; por otro, expone con transparencia los obstáculos prácticos (dependencias de Ray, kernels b12x, límites de batch) mediante un "landmine ledger" que documenta 14 problemas medidos y sus soluciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (checkpoint DeepSeek-V4-Flash, línea 0731); no se detalla en la información disponible |
| Parámetros totales | 284B (modelo base); el repositorio es una receta de despliegue |
| Parámetros activos | 13B (modelo base, presumiblemente MoE; no confirmado explícitamente en la información) |
| Longitud de contexto | 1M tokens (nativo del modelo base); pool KV de ~7,5-7,6M tokens en perfil CAPACITY |
| Tipos de cuantización | FP4+FP8 mixto nativo; build CSF (compressed-scales) adicional |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoint de ~170 GB; imágenes Docker fijadas por digest) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una receta de serving sobre el checkpoint Jiunsong/SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX, que a su vez deriva de un modelo DeepSeek-V4-Flash de la línea 0731. La información proporcionada no detalla la arquitectura interna del checkpoint base (si es transformer denso, MoE u otra variante); solo indica 284B parámetros totales y 13B activos, lo que sugiere una arquitectura de mezcla de expertos, aunque no se confirma explícitamente. El checkpoint ocupa aproximadamente 170 GB en disco y usa precisión mixta nativa FP4+FP8.

La innovación técnica del repositorio reside en la orquestación del despliegue: paralelismo tensorial en tres nodos DGX Spark conectados por un triángulo CX-7 RoCE con MTU 9000 y una subred /24 por tramo. Se documentan dos perfiles: SPEED, que usa decodificación especulativa DSpark con k=5 y una imagen de la línea karmic-kraken con kernels b12x y NCCL precompilados en la imagen (sin instalación en el arranque); y CAPACITY, con la imagen chthonic-lineage, sin decodificación especulativa y con dependencias (Ray y build b12x fijado) instaladas desde un wheelhouse local. Un tercer build CSF empaqueta el checkpoint con compressed-scales y requiere un runtime b12x con soporte de kernel CSF (disponible en la rama master desde 2026-10-06, con dos correcciones documentadas). El arranque completo tarda entre 12 y 15 minutos.

## Capacidades

- Generación de texto y razonamiento: heredadas del checkpoint DeepSeek-V4-Flash subyacente, aunque la información proporcionada no detalla capacidades específicas.
- Decodificación de alta velocidad en flujos de código y conteo: ~100-108 tok/s en el perfil SPEED con DSpark k=5.
- Contexto largo: hasta 1M tokens por sesión, con hasta ~7,2 sesiones simultáneas en el perfil CAPACITY.
- Servicio multi-flujo: hasta 24 flujos concurrentes con un agregado de ~200 tok/s en el perfil SPEED.
- Variante "abliterated": el checkpoint base ha sido modificado para eliminar rechazos, lo que afecta al comportamiento en contenido sensible (ver limitaciones).
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de código a alta velocidad: el perfil SPEED alcanza ~100-108 tok/s en flujos de clase código, adecuado para asistentes de programación interactivos o generación de parches en pipelines de CI/CD donde la latencia de decodificación es crítica.
- Análisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir bases de código enteras o documentación extensa en una sola sesión, útil para auditorías de seguridad o refactorizaciones a gran escala.
- Sesiones concurrentes de contexto largo: el perfil CAPACITY permite ~7,2 sesiones simultáneas de 1M tokens, adecuado para equipos pequeños que necesiten trabajar en paralelo sobre documentos masivos sin degradar el pool KV.
- Procesamiento por lotes de documentos extensos: el pool de ~7,5M tokens permite encolar múltiples documentos largos (contratos, expedientes, informes) y procesarlos secuencialmente sin recargar el modelo.
- Despliegue en hardware de escritorio: tres DGX Spark (GB10) son estaciones compactas; la receta demuestra que un equipo de investigación puede servir un modelo de 284B sin acceso a clústeres de centros de datos.
- Entornos con restricciones de red: las imágenes están fijadas por digest y el arranque no descarga nada (el perfil CAPACITY usa un wheelhouse local), lo que permite operar en instalaciones aisladas o air-gapped.
- Experimentación con decodificación especulativa: el repositorio documenta la aceptación de drafts (74% a 11% en k=5 sobre prosa), útil como referencia para investigar técnicas de speculative decoding en TP=3.

## Benchmarks y rendimiento

| Métrica | Perfil SPEED | Perfil CAPACITY |
|---|---|---|
| Decodificación un flujo (código/conteo) | ~100-108 tok/s | no disponible |
| Decodificación un flujo (prosa libre) | ~45-50 tok/s | no disponible |
| Throughput agregado (24 flujos) | ~200 tok/s | no disponible |
| Pool KV | no disponible | ~7,5-7,6M tokens |
| Sesiones simultáneas de 1M contexto | no disponible | ~7,2 |
| Aceptación de drafts (k=5, prosa) | 74% a 11% | no aplica |
| Build CSF (un flujo, prosa) | ~5-10% más rápido que FP8 SPEED | no disponible |
| Pool CSF sin spec decode | no disponible | ~3,6-4,0M (8192) / ~5,6-5,8M (4096) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Tres nodos NVIDIA DGX Spark (GB10) como mínimo, con GPU integrada.
- Interconexión: triángulo CX-7 RoCE completo, 200 Gbps por tramo, MTU 9000, una subred /24 por tramo, más una LAN de gestión.
- Almacenamiento: ~170 GB para el checkpoint en cada nodo, más las imágenes Docker fijadas por digest.
- Software: Docker con soporte GPU; el perfil SPEED no requiere instalación en el arranque; el perfil CAPACITY requiere un wheelhouse local preparado una vez por nodo.
- Despliegue: imágenes Docker propias del repositorio (karmic-kraken-lineage y chthonic-lineage); no se mencionan vLLM estándar, llama.cpp, Ollama ni TGI como alternativas en la información.
- Tiempo de arranque: ~12-15 minutos desde el lanzamiento hasta el servicio en el puerto 8889.
- Latencia y throughput: ver tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|
| DeepSeek-V4-Flash-TP3-3x-DGX-Spark (esta receta) | 284B totales / 13B activos | 1M | MIT | 3× DGX Spark, TP=3, CX-7 RoCE |
| Jiunsong/SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX (base) | 284B totales / 13B activos | 1M | no disponible | 2× DGX (según nombre del checkpoint) |
| DeepSeek V4.1 (TP=3 DSpark lanes publicados) | no disponible | no disponible | no disponible | TP=3 con DSpark |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Es una receta de serving, no un modelo: los pesos reales provienen de un checkpoint de terceros (Jiunsong) y, en última instancia, de DeepSeek; la licencia MIT del repositorio no necesariamente cubre los pesos subyacentes.
- Variante "abliterated": el checkpoint base ha sido modificado para eliminar rechazos, lo que puede producir contenido inapropiado, peligroso o no alineado; no es apto para producción orientada al público sin filtros adicionales.
- El perfil SPEED depende de la aceptación de drafts: el rendimiento cae de 74% a 11% en k=5 sobre prosa, por lo que el throughput es muy variable según la carga (~45-50 tok/s en prosa frente a ~100-108 en código).
- El perfil CAPACITY requiere un paso extra (wheelhouse) y la instalación de Ray y del build b12x desde un wheelhouse local; el arranque no descarga nada pero la preparación es más compleja.
- El build CSF no está listo para producción: requiere un runtime b12x con kernel CSF que solo está en la rama master desde 2026-10-06, y con las correcciones documentadas rinde aproximadamente la mitad del throughput especulativo del build beta.
- El límite de MAX_NUM_BATCHED_TOKENS=4096 afecta al pool KV (documentado como "landmine 14"); configuraciones distintas cambian las cifras de capacidad.
- Se documentan 14 "landmines" medidos y tres FIXLOGs de escalera de fallos; el despliegue no es trivial y requiere seguir la guía con precisión.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del checkpoint.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-22; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/trinadin/DeepSeek-V4-Flash-TP3-3x-DGX-Spark
- Modelo base: https://huggingface.co/Jiunsong/SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX
- Documentación interna citada en la model card: `docs/FIXLOG.md`, `patches-csf/`, `tools/csf/`, `config/cluster.env.capacity`, `launch/ds4flash-tp3-up` (no se proporcionan URLs directas)
