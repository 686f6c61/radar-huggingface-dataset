# TechnoBaptist/Carbon-A-1.2B

## Resumen

Carbon-A-1.2B es un modelo de anotación de ADN perteneciente a la familia Carbon, publicado en HuggingFace por el usuario TechnoBaptist (la model card hace referencia a la organización HuggingFaceBio). Su tarea no es la generación de texto, sino la clasificación a nivel de base: predice, para cada nucleótido, si forma parte de una secuencia codificante de proteína (CDS) o de una región no codificante, en genomas eucariotas. Para ello emplea dos cabezas de clasificación independientes, una por hebra, lo que permite conservar regiones codificantes que se solapan en hebras opuestas.

El modelo tiene 1.153.656.832 parámetros (aproximadamente 1,2 B) y trabaja sobre un tokenizador de 6-mers no solapados, de modo que cada token representa seis bases. La ventana de contexto es de 16.384 tokens, equivalentes a 98.304 pares de bases (pb); su pipeline de anotación procesa registros más largos en ventanas solapadas 1.024 tokens (6.144 pb) y promedia las predicciones en las zonas de solape. Se distribuye bajo licencia Apache 2.0 en formato safetensors y requiere `trust_remote_code=True`.

Su relevancia actual es práctica: la anotación estructural de genomas eucariotas sigue siendo un cuello de botella en proyectos de genómica, y un modelo de 1,2 B de parámetros que puede ejecutarse en una GPU de gama alta con BF16 ofrece una alternativa ligera a los pipelines basados en evidencia experimental y a modelos genómicos de mayor tamaño. No obstante, la información publicada es limitada: no hay resultados de benchmarks más allá de una evaluación sobre el genoma de levadura incluido en el conjunto de evaluación, y el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo transformer de clasificación de tokens (`token-classification`) con dos cabezas de clasificación específicas de hebra; la model card no especifica la arquitectura interna ni el número de capas |
| Parámetros totales | 1.153.656.832 (1,2 B) |
| Parámetros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | 16.384 tokens = 98.304 pb; el pipeline lee ventanas con solape de 1.024 tokens (6.144 pb) |
| Tipos de cuantización | No disponible. La inferencia reportada usa BF16; no se documentan pesos cuantizados ni versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | ADN (secuencias genómicas). No procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,6 GB, coherente con pesos en FP32); requiere código personalizado (`custom_code`) |
| Tokenizador | 6-mers no solapados (cada token = 6 bases) |
| Entrada | ADN genómico en FASTA o GenBank, opcionalmente comprimido con gzip |
| Salida | Probabilidades por base para no codificante y CDS en cada hebra; el pipeline genera modelos de gen con puntuación de confianza |
| Interfaz | `AutoModelForTokenClassification` con `trust_remote_code=True`; Transformers 4.56 o superior, incluida la serie 5.x |

## Arquitectura y entrenamiento

La model card describe un modelo transformer de clasificación de tokens con dos cabezas de clasificación por hebra, que devuelve probabilidades por base para dos clases (no codificante y CDS) en cada una de las dos hebras. La innovación destacable no está en el bloque de atención, sino en la formulación del problema: al separar las predicciones por hebra, el modelo puede representar CDS que se solapan en hebras opuestas, un fenómeno que los esquemas de anotación de una sola hebra tienden a perder. El tokenizador de 6-mers no solapados reduce la longitud de secuencia en un factor de seis, lo que permite cubrir 98.304 pb dentro de una ventana de 16.384 tokens.

El entrenamiento se realizó sobre 2.055 ensamblados RefSeq GCF correspondientes a 2.047 especies, con representación de mamíferos, otros vertebrados, invertebrados, plantas, hongos y protozoos. La model card no indica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de ajuste alineado (RLHF, DPO u otras), que en cualquier caso no resultan habituales en una tarea de etiquetado por base. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal.

El pipeline de anotación que acompaña al modelo usa el código genético estándar por defecto y permite otro mediante `--codon-table`; para *Tetrahymena thermophila* (GCF_000189635.1) aplica automáticamente la tabla de traducción 6. Además, detecta de forma automática un posible desajuste de tabla de codones, añade un aviso a `results/WARNINGS.txt` y renombra el directorio de resultados a `results/<accession>_WARNING`.

## Capacidades

- Predicción de CDS a resolución de base única en genomas eucariotas.
- Predicción independiente por hebra (forward y reverse), con conservación de regiones codificantes solapadas en hebras opuestas.
- Generación de modelos de gen completos (genes, ARNm y CDS) con una puntuación de confianza por gen mediante el pipeline incluido.
- Exportación de secuencias codificantes en nucleótidos (`prediction.fna`) y de las proteínas traducidas (`prediction.faa`).
- Salida en formato GFF (`prediction.gff`) y probabilidades por base en Parquet (`*.raw_probs.parquet`).
- Procesamiento de registros genómicos de longitud arbitraria mediante ventanas solapadas de 98.304 pb con solape de 6.144 pb y promediado de predicciones.
- Soporte de múltiples tablas de codones genéticos, con detección automática de desajustes.
- Evaluación integrada contra una anotación de referencia y frente a BUSCO descrita en el README del pipeline.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Anotación de genomas eucariotas recién ensamblados: el pipeline acepta FASTA o GenBank, opcionalmente comprimidos, y produce un GFF con genes, ARNm y CDS junto a una confianza por gen, lo que permite incorporar anotaciones estructurales a ensamblados de novo sin depender exclusivamente de evidencia de ARN o proteína.
- Anotación de genomas de plantas, hongos y protozoos: el entrenamiento cubre explícitamente estos grupos taxonómicos dentro de los 2.055 ensamblados RefSeq, por lo que es adecuado para proyectos en organismos no modelo donde las anotaciones de referencia son escasas.
- Reanotación de genomas con códigos genéticos alternativos: la opción `--codon-table` y la aplicación automática de la tabla 6 en *Tetrahymena thermophila* permiten anotar organismos cuyo código genético se desvía del estándar.
- Priorización de regiones codificantes para validación experimental: el pipeline escribe todas las predicciones y la confianza por gen, de modo que se pueden seleccionar los genes con mayor confianza para diseño de cebadores o validación por RT-PCR, y los de confianza baja para revisión manual.
- Curación y control de calidad de anotaciones existentes: comparar la salida con una anotación de referencia y calcular métricas a nivel de nucleótido, exón y gen permite localizar discrepancias estructurales antes de publicar un genoma.
- Genómica comparativa y pan-genómica: al ser determinista y ligero, el modelo puede aplicarse de forma homogénea a cientos de ensamblados para obtener un criterio de anotación consistente entre muestras.
- Detección de CDS solapados en hebras opuestas: la predicción por hebra separada permite estudiar loci con solapamiento antisentido que las anotaciones de hebra única suelen colapsar o descartar.
- Integración en pipelines bioinformáticos reproducibles: la salida GFF3, FNA y FAA encaja con herramientas estándar de anotación funcional, comparación y evaluación (por ejemplo, análisis tipo BUSCO descrito en el README del pipeline).

## Benchmarks y rendimiento

Los únicos resultados numéricos publicados en la información disponible corresponden a la evaluación sobre el genoma de *Saccharomyces cerevisiae* S288C (GCF_000146045.2), que el propio autor clasifica dentro del conjunto `eval/seen`, es decir, un genoma visto durante el entrenamiento. Las métricas se calculan contando los genes con una confianza de al menos 0,1.

| Genoma evaluado | Métrica | Valor |
|---|---|---|
| GCF_000146045.2 (*S. cerevisiae*), conjunto `eval/seen` | F1 a nivel de nucleótido | 0,998 |
| GCF_000146045.2 (*S. cerevisiae*), conjunto `eval/seen` | F1 a nivel de exón | 0,943 |
| GCF_000146045.2 (*S. cerevisiae*), conjunto `eval/seen` | F1 a nivel de gen | 0,953 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, MMLU, HumanEval o GSM8K, que no aplican a un modelo de anotación genómica) ni métricas sobre genomas no vistos en el entrenamiento. El README del pipeline menciona una evaluación frente a BUSCO, pero no se incluyen cifras en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 2,3 GB; el repo de 4,6 GB sugiere que los safetensors se distribuyen en FP32. A ello hay que sumar las activaciones de una ventana de 16.384 tokens, que en el mejor de los casos (atención con kernels eficientes) son del orden de pocos gigabytes. Como referencia orientativa, no publicada por el autor, cabría esperar un consumo en torno a 4-8 GB en BF16.
- GPU recomendadas: FlashAttention-2, que es la configuración de todos los resultados reportados, requiere GPU Ampere o posterior; en la práctica, A100, H100, RTX 3090, RTX 4090 o equivalentes. Con la implementación SDPA de PyTorch (`--attn-implementation sdpa`) no se necesita instalar FlashAttention, pero las probabilidades no son idénticas bit a bit a las de FlashAttention-2.
- GPU de consumo: el modelo debería caber en tarjetas con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090) si se ejecuta en BF16. Esta estimación es un cálculo a partir del número de parámetros y no una cifra publicada por el autor.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El modelo se ejecuta mediante Transformers con `trust_remote_code=True` y el pipeline propio del repositorio, que requiere Linux, Python 3.10 o superior, una build de PyTorch con CUDA y un compilador de C++ con OpenMP (por ejemplo, `build-essential` en Debian o Ubuntu).
- Latencia y throughput: no disponible. La model card no publica tiempos de inferencia ni rendimiento por genoma.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos de anotación genómica. Existen alternativas en el espacio de modelos genómicos (por ejemplo, modelos de embeddings de ADN o modelos generativos de secuencias), pero no se dispone de sus especificaciones, métricas ni condiciones de licencia dentro de la información consultada, por lo que no se incluyen cifras que no puedan verificarse.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-A-1.2B | 1,2 B | 98.304 pb (16.384 tokens) | Clasificación por base de CDS en eucariotas | Apache 2.0 | HuggingFace, safetensors, requiere código personalizado |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Cobertura taxonómica limitada a eucariotas: el entrenamiento se restringe a ensamblados RefSeq GCF de mamíferos, otros vertebrados, invertebrados, plantas, hongos y protozoos. No hay evidencia de funcionamiento en procariotas, virus o secuencias muy divergentes de las cubiertas.
- Riesgo de sobreajuste a las anotaciones RefSeq: el modelo se entrena contra anotaciones GCF, por lo que hereda sus criterios y sus posibles errores. Además, la única evaluación publicada corresponde a un genoma del conjunto `eval/seen`, de modo que las métricas reportadas no miden generalización a genomas no vistos.
- Umbral de confianza orientado a exhaustividad: las métricas reportadas cuentan los genes con confianza igual o superior a 0,1, un umbral bajo que favorece el recuerdo frente a la precisión; en producción conviene calibrar este umbral según el coste de los falsos positivos.
- Dependencia de código personalizado: el uso requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor. Conviene auditar `annotation_pipeline/` antes de integrarlo en entornos de producción.
- Limitaciones de plataforma: el pipeline solo funciona en Linux y exige una build CUDA de PyTorch y un compilador de C++ con OpenMP. No se documentan alternativas en CPU ni en macOS o Windows.
- Ambigüedad en la titularidad del repositorio: los metadatos de HuggingFace apuntan al identificador `TechnoBaptist/Carbon-A-1.2B`, mientras que la model card indica descargar desde `HuggingFaceBio/Carbon-A-1.2B` y los datos de evaluación residen en el bucket `HuggingFaceBio/Carbon-A-training-data`. Hay que verificar el repositorio canónico antes de fijar una dependencia.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha, por lo que no existe retroalimentación externa ni informes independientes de comportamiento.
- Longitud de contexto: la ventana de 98.304 pb obliga a procesar genomas grandes en múltiples ventanas con solape y promediado, lo que puede introducir artefactos en las fronteras de ventana y aumenta el coste computacional proporcionalmente al solape.
- Riesgo de desajuste de tabla de codones: el pipeline avisa y renombra el directorio de resultados cuando detecta un posible desajuste, lo que indica que el modelo puede producir traducciones incorrectas si la tabla no se especifica correctamente.
- Licencia: Apache 2.0 permite uso comercial, pero la model card no detalla la licencia específica del código del pipeline ni de los datos de entrenamiento asociados; conviene revisarlo antes de un despliegue comercial.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo: los enlaces devueltos corresponden a páginas de ayuda de servicios de correo electrónico, sin relación con Carbon-A-1.2B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/Carbon-A-1.2B
- Referencia alternativa indicada en la model card: https://huggingface.co/HuggingFaceBio/Carbon-A-1.2B
- README del pipeline de anotación: https://huggingface.co/TechnoBaptist/Carbon-A-1.2B/blob/main/annotation_pipeline/README.md
- Bucket de datos de entrenamiento y evaluación: https://huggingface.co/buckets/HuggingFaceBio/Carbon-A-training-data
- FlashAttention (dependencia opcional para los resultados reportados): https://github.com/Dao-AILab/flash-attention
- Paper, blog o demo oficial: no disponible en la información proporcionada.
