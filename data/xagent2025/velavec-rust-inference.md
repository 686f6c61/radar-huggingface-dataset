# xagent2025/velavec-rust-inference

## Resumen

VelaVec-infer es el motor de inferencia en Rust que acompaña a VelaVec, un codificador de embeddings de recuperación (retrieval) de 9,8 millones de parámetros. El modelo en sí es un codificador híbrido compuesto por una tabla de n-gramas congelada, 3 capas de atención bidireccional y dos cabezas de pooling. Este repositorio no contiene un modelo generativo, sino la implementación que ejecuta dicho codificador sobre CPU de Apple Silicon sin runtime de Python, sin `transformers` y sin PyTorch, apoyándose únicamente en el framework Accelerate del sistema.

La propuesta de valor es el rendimiento de ingeniería: sobre un único núcleo de un Apple M4, el motor codifica consultas de longitud ≈15 en 103 µs (53,9× más rápido que el profesor bge-small de 33M) y documentos de longitud ≈128 en 579 µs (22,5×), con un arranque en frío de 5,4 ms frente a los ~29 s de inicialización de PyTorch. Los pesos ocupan 39 MB en fp32 y la calidad de recuperación se mantiene prácticamente idéntica a la del profesor: r@1 de 0,912 en NLI y 0,694 en MS MARCO.

Es relevante ahora porque demuestra una vía viable para ejecutar recuperación semántica de baja latencia y sin asignación de heap en régimen estacionario directamente en el chip de un portátil o un Mac Mini, con artefactos CoreML preempaquetados en formato AMX. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no ha sido validado de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador híbrido de retrieval: tabla de n-gramas congelada + 3 capas de atención bidireccional + doble cabeza de pooling |
| Parametros totales | 9,8 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El motor codifica longitudes dinámicas sin padding a 64 (mediciones a 15 y 128 tokens) |
| Tipos de cuantizacion | fp32 (formato de los pesos distribuidos). Se documentan pruebas con fp16 e int8, pero no aportan ganancia de velocidad en AMX |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `weights.bin` (fp32, 39 MB) + 15 grafos CoreML `.mlmodelc` con pesos preempaquetados en disposición AMX |
| Tamano del repositorio | 0,1 GB |
| Requisitos de plataforma | macOS 13+ sobre Apple Silicon; toolchain Rust estable; Accelerate del sistema |
| Tipo de pipeline | No disponible (el repositorio es un motor de inferencia, no una tarea de HuggingFace) |

## Arquitectura y entrenamiento

El codificador es híbrido: combina una tabla de n-gramas congelada (no entrenable durante la inferencia) con 3 capas de atención bidireccional y dos cabezas de pooling diferenciadas. El motor que lo ejecuta reparte el trabajo en dos rutas: las GEMM pequeñas (15 grafos con formas del estilo `l×256 → l×512`) se compilan con CoreML a un BNNSGraph con pesos preempaquetados en disposición nativa AMX, mientras que las operaciones elemento a elemento (RMSNorm, SwiGLU, RoPE y el softmax de atención) están escritas a mano como kernels NEON de 4 carriles, con reducciones encadenadas fusionadas y un polinomio de grado 9 para `exp2` con error relativo máximo de 5,5e-14, numéricamente idéntico a `vvexpf`.

Las decisiones de ingeniería documentadas son concretas: el uso de BNNSGraph resulta entre 2,5× y 3,1× más rápido que `cblas_sgemm` en estas formas (por ejemplo, para `l=15`, 159 µs → 51 µs en el conjunto de 15 GEMM); la codificación con longitud dinámica es entre 2,0× y 2,7× más rápida que el padding fijo sin pérdida de calidad; y el motor mantiene cero asignaciones de heap en régimen estacionario porque reutiliza buffers preasignados. No se documentan en este repositorio los datos de entrenamiento del modelo (número de tokens, composición del dataset, uso de RLHF o DPO); esa información correspondería a la model card de `xagent2025/VelaVec` y no está disponible aquí.

## Capacidades

- Generación de embeddings de recuperación para consultas y documentos, con tokenización e inferencia integradas en el mismo binario Rust.
- Codificación de longitud dinámica sin padding, con mejor rendimiento medido (2,0-2,7×) que el modo de longitud fija.
- Procesamiento por lotes mediante `BNNSGraphContextSetBatchSize`, que permite variar el tamaño de lote en los grafos CoreML precompilados.
- Doble cabeza de pooling, lo que sugiere representaciones diferenciadas para consulta y documento dentro del mismo codificador.
- Arranque en frío de 5,4 ms (carga de pesos más compilación de grafo), apto para procesos de corta duración.
- Retroceso a modo BLAS para ejecución y verificación de correctitud en plataformas distintas de Apple Silicon.
- Sin dependencia de Python, PyTorch, `transformers` ni crates externos: `cargo build --release` no descarga nada.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de pensamiento.
- Multilingüismo: solo inglés (etiqueta de idioma `en`).

## Casos de uso

- Búsqueda semántica local en Mac: indexar un corpus y codificar consultas en ~103 µs por núcleo permite búsqueda interactiva con latencia imperceptible dentro de una aplicación de escritorio, sin depender de un servicio remoto.
- Recuperación de primera etapa en un pipeline RAG: con 579 µs por documento de ~128 tokens en un solo núcleo, el motor puede recuperar candidatos para un sistema generativo, dejando el reranking pesado a un modelo mayor.
- Deduplicación y clustering de documentos a escala: el coste por documento permite recorrer corpus grandes en CPU sin GPU, usando similitud coseno sobre los embeddings generados.
- Aplicaciones de escritorio offline para Apple Silicon: al no requerir Python ni red, el binario puede distribuirse dentro de una app macOS con 39 MB de pesos adjuntos.
- Indexado en pipelines de integración continua sobre runners macOS: el arranque en frío de 5,4 ms hace viable invocar el motor en cada trabajo de CI sin penalización de inicialización de PyTorch (~29 s).
- Clasificación y filtrado por similitud: los conjuntos de evaluación pretokenizados (`eval_ids.bin`, `marco_eval_ids.bin`) sirven como referencia reproducible para validar umbrales de similitud en tareas de filtrado.
- Verificación de correctitud multiplataforma: en sistemas que no son Apple Silicon puede ejecutarse en modo BLAS para comprobar resultados idénticos, aunque sin las ganancias de velocidad.

## Benchmarks y rendimiento

Calidad de recuperación (r@1, r@5, r@10):

| Conjunto | VelaVec (9,8M) | Referencia pot3v2 (PyTorch) | Profesor bge-small (33M) |
|---|---|---|---|
| NLI r@1 | 0,912 | 0,940 | 0,909 |
| NLI r@5 | 0,978 | 0,978 | no disponible |
| NLI r@10 | 0,982 | 0,982 | no disponible |
| MARCO r@1 | 0,694 | no disponible | 0,689 |
| MARCO r@5 | 0,938 | no disponible | no disponible |
| MARCO r@10 | 0,956 | no disponible | no disponible |

Latencia y huella (Apple M4, 1 hilo):

| Metrica | VelaVec (9,8M) | Profesor bge-small (33M) |
|---|---|---|
| Codificación de consulta (len≈15) | 103 µs | ~5,5 ms (53,9×) |
| Codificación de documento (len≈128) | 579 µs | ~13 ms (22,5×) |
| Arranque en frío | 5,4 ms | ~29 s (inicialización de PyTorch) |
| Pesos en disco | 39 MB | ~130 MB |
| Bucle de 15 GEMM con `l=15` (BNNSGraph vs `cblas_sgemm`) | 51 µs | 159 µs |

El autor advierte de que la latencia depende del estado de la máquina (carga, planificación de núcleos) y recomienda medir con el modo `--blas` como referencia A/B en la misma sesión de benchmarks.

## Requisitos de hardware

- CPU Apple Silicon (se han publicado mediciones sobre un Apple M4 a un solo núcleo); no se requiere GPU ni acelerador dedicado.
- Sistema operativo macOS 13 o superior: la ruta BNNSGraph es exclusiva de macOS, ya que depende de Accelerate y de CoreML.
- Pesos de 39 MB en disco; el motor no asigna memoria en heap en régimen estacionario y reutiliza buffers preasignados, por lo que la huella de memoria es reducida (no se publica una cifra exacta de RAM total).
- En plataformas no Apple el motor compila y ejecuta comprobaciones de correctitud en modo BLAS, pero las cifras de velocidad no son extrapolables.
- Despliegue mediante binario Rust (`cargo build --release`), sin crates externos ni acceso a red tras instalar el toolchain. No hay integración documentada con vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: ~100 µs por consulta (len=15), 580-780 µs por documento (len=128) y ~5-20 ms de compilación de grafos CoreML en el arranque. No se documenta throughput agregado por lote.
- Limitación conocida: fp16 rinde entre 0,74× y 0,90× respecto a fp32 en AMX para estas formas, e int8 no ofrece aceleración (BNNSMatMul/filter rechazan Int8 y la ruta int8 de pesos y activaciones es ~2× más lenta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NLI r@1 | MARCO r@1 | Licencia | Formato |
|---|---|---|---|---|---|---|
| VelaVec-infer (este repositorio) | 9,8M | No disponible | 0,912 | 0,694 | MIT | `weights.bin` fp32 + grafos CoreML |
| bge-small (profesor) | 33M | No disponible | 0,909 | 0,689 | No disponible | Pesos PyTorch (~130 MB) |
| pot3v2 (referencia PyTorch) | No disponible | No disponible | 0,940 | No disponible | No disponible | No disponible |

El repositorio cita además `xagent2025/VelaVec-T2I` como modelo relacionado, pero no se proporcionan especificaciones comparables. No se dispone de datos de otros codificadores de retrieval de la misma categoría en la información facilitada.

## Limitaciones y advertencias

- No es un modelo generativo: no redacta texto, no razona, no ejecuta código y no soporta tool calling ni flujos de agentes. Solo produce embeddings.
- Solo inglés: la etiqueta de idioma del repositorio es `en`; no hay evidencia de capacidades multilingües.
- Las afirmaciones de velocidad son específicas de Apple Silicon con macOS 13 o superior. En otras plataformas solo se garantiza la corrección en modo BLAS.
- Los artefactos CoreML precompilados (`gemms/*.mlmodelc`) pueden no cargar en versiones distintas de macOS; en ese caso es necesario regenerarlos con `export_bnns_graphs.py` y `coremltools`.
- fp16 e int8 no aportan aceleración en AMX para estas formas (0,74-0,90× en fp16; int8 igual o ~2× más lento). Las conclusiones se limitan a formas computacionalmente intensivas con `l=15` y `l=256` y no deben generalizarse a cargas de servidor con lotes grandes.
- La latencia es sensible al estado de la máquina; sin una medición A/B con `--blas` en la misma sesión, las cifras publicadas pueden no reproducirse.
- El NLI r@1 (0,912) es ligeramente inferior al de la referencia pot3v2 en PyTorch (0,940), lo que sugiere una pérdida leve de precisión frente a esa variante.
- No se documentan en este repositorio los datos de entrenamiento, la composición del dataset ni análisis de sesgos; tampoco se describen riesgos de alucinación, dado que el modelo no genera texto.
- El repositorio acumula 0 descargas y 0 likes, por lo que no existe validación independiente de las cifras publicadas.
- La licencia MIT permite uso comercial, pero se aplica al código del motor; conviene verificar la licencia de los pesos originales en `xagent2025/VelaVec` antes de redistribuirlos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xagent2025/velavec-rust-inference
- Modelo VelaVec: https://huggingface.co/xagent2025/VelaVec
- Modelo VelaVec-T2I: https://huggingface.co/xagent2025/VelaVec-T2I
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo; los resultados obtenidos corresponden a páginas bancarias sin relación con el tema. No se dispone de paper, blog ni demo adicionales.
