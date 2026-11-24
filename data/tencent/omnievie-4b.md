# tencent/OmniEVIE-4B

## Resumen

OmniEVIE-4B es un modelo de recuperación multimodal (retrieval) desarrollado por Tencent IMA Product Center y Tencent Youtu Lab. No es un modelo generativo al uso: su función es producir representaciones multi-vector (estilo ColBERT) para textos, imágenes naturales, documentos visuales, vídeo nativo y contenido de agentes, herramientas, GUI y memoria, de modo que puedan indexarse y buscarse a gran escala. Se construye sobre Qwen3.5-4B mediante fine-tuning y añade una cabeza de proyección Prefix-MRL y una puerta de saliencia de consulta aprendida (`query_gate.safetensors`).

Su propuesta diferencial es la compresión agresiva del índice manteniendo localización de evidencia: cada documento se destila en como máximo 128 vectores de 64 dimensiones en int8 (≤ 9.472 bytes por registro, 8,82 GiB por millón de registros), lo que permite búsquedas sobre un millón de registros en 54,2 ms en un único hilo de CPU. Cada acierto devuelve además las coordenadas espaciales (región de página) o temporales (intervalo de vídeo) donde se localiza la evidencia, sin necesidad de modelos OCR o de captioning externos.

El modelo es relevante porque unifica en un solo encoder tareas que normalmente requieren pipelines separados (búsqueda de texto, imagen, documento visual y momento de vídeo) y porque su formato de índice int8 hace viable el despliegue en CPU a escala de millones de registros. La licencia es Apache-2.0 y los pesos están en safetensors (BF16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B con capas de atención bidireccional completa; salida multi-vector con late interaction (ColBERT) y proyección Prefix-MRL |
| Parametros totales | 4.544.510.464 (4,54B) en BF16, más `query_gate.safetensors` |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en BF16; los vectores de índice se cuantizan a int8 con escala fija. No se documentan cuantizaciones del modelo base (GGUF, AWQ, etc.) |
| Idiomas soportados | no disponible (la model card menciona recuperación cross-lingual, pero no enumera idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` en BF16 + `query_gate.safetensors`) |

## Arquitectura y entrenamiento

OmniEVIE-4B parte de Qwen3.5-4B y lo adapta a recuperación sustituyendo el comportamiento causal por capas de atención bidireccional completa, necesarias para que cada token vea el contexto completo del documento. La salida no es un único vector por documento, sino un conjunto de hasta 128 vectores de 64 dimensiones (multi-vector, late interaction tipo ColBERT), con dimensiones elásticas seleccionables en tiempo de ejecución mediante Prefix-MRL: `{64, 128, 256, 512, 1024, 2048}`.

La innovación central es el pipeline de compresión ST-HAC (spatio-temporal Ward clustering): agrupa los tokens del documento con clustering de Ward con conciencia espacial y temporal, renormaliza los centroides sobre la esfera unidad y los cuantiza a int8 con escala fija, produciendo un layout de bytes exacto por registro. Una puerta de saliencia de consulta aprendida (`query_gate`) pondera los tokens de la consulta según su relevancia (con umbral τ = 0,6 y margen de ruido θ = 0,38 en los ejemplos de la model card), lo que permite que la búsqueda se centre en las partes informativas de la query.

El índice se organiza en un embudo de tres etapas: recuperación gruesa (14,6 ms), filtrado por distancia de Hamming (19,7 ms) y re-scoring int8 (19,9 ms) sobre un millón de registros. Los datasets citados en la model card son TIGER-Lab/MMEB-V2 y vidore/vidore_benchmark_v3. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Recuperación multimodal unificada: texto, imagen natural, documento visual (páginas, tablas, gráficos), vídeo nativo y contenido de agentes, herramientas, GUI y memoria.
- Representación multi-vector con late interaction (ColBERT) y dimensiones elásticas en tiempo de ejecución vía Prefix-MRL.
- Localización de evidencia: cada acierto devuelve bounding box de página o intervalo temporal de vídeo directamente desde el `argmax` de la recuperación, sin OCR ni captioning externos.
- Localización de momentos de vídeo nativa: intervalos y timestamps pico extraídos del índice multi-vector comprimido.
- Recuperación cross-lingual (mencionada en la model card, sin detalle de pares de idiomas).
- Puerta de saliencia de consulta aprendida para ponderar tokens de la query.
- Compresión de tokens con ST-HAC y cuantización int8 para índices de bajo footprint.
- Búsqueda a escala de millones de registros en CPU monohilo (54,2 ms para 1M; 120,2 ms para 5M).
- No es un modelo generativo: no produce texto libre ni soporta tool calling ni razonamiento multi-paso en el sentido de un LLM conversacional.

## Casos de uso

- Búsqueda de documentos visuales a escala: indexar millones de páginas (informes, facturas, papers) y recuperar la región exacta de la página que contiene la respuesta, útil en sistemas de archivo corporativo y compliance documental.
- Recuperación de momentos de vídeo: localizar el instante concreto de un clip de 150 segundos que responde a una consulta textual, aplicable a archivos de medios, revisión de grabaciones de reuniones o moderación de contenido.
- Búsqueda empresarial multimodal unificada: un único índice que mezcla notas de texto, capturas de pantalla, diapositivas y vídeos, con un solo encoder en lugar de pipelines separados por modalidad.
- Recuperación de memoria y estado de agentes: indexar trazas de herramientas, GUI y memoria de agentes para que un sistema agéntico recupere interacciones previas relevantes.
- RAG sobre documentación técnica con tablas y gráficos: recuperar la celda o el gráfico concreto de un PDF técnico para alimentar un generador con evidencia localizada.
- Búsqueda en catálogos de imágenes y productos: recuperación imagen-texto con localización de la región relevante, útil en e-commerce y gestión de activos digitales.
- Despliegue en entornos con recursos limitados: el índice int8 de 8,82 GiB por millón de registros y la búsqueda en CPU monohilo permiten servir recuperación a escala sin flota de GPU.
- Moderación y auditoría de contenido: localizar pasajes o fotogramas concretos que coinciden con una política descrita en lenguaje natural, con trazabilidad de la evidencia.

## Benchmarks y rendimiento

Datos publicados en la model card (no se han verificado de forma independiente):

| Benchmark / metrica | Resultado |
|---|---|
| QVHighlights val (1.083 queries): peak-in-segment hit | 78,0% |
| QVHighlights val: span intersection | 94,3% |
| QVHighlights val: span medio | 18% |
| Latencia de búsqueda, 1M registros, CPU monohilo | 54,2 ms (14,6 ms gruesa + 19,7 ms Hamming + 19,9 ms int8) |
| Latencia de búsqueda, 5M registros, CPU monohilo | 120,2 ms |
| Footprint de índice, 1M registros (K128×d64 int8) | 8,82 GiB |
| Footprint de índice, 1M registros (K32×d64 int8) | 2,15 GiB |
| Bytes por registro | ≤ 9.472 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de recuperación estándar (MMEB-V2, ViDoRe V3) con cifras numéricas comparables.

## Requisitos de hardware

- VRAM para inferencia del encoder: no disponible de forma explícita. Con 4,54B parámetros en BF16, los pesos ocupan aproximadamente 9,1 GB, por lo que se necesita del orden de 10-12 GB de VRAM para cargar el modelo en BF16 con overhead de activaciones.
- `flash-attn>=2.7.0` es obligatorio (`attn_implementation="flash_attention_2"`); verificado con torch 2.7.1, transformers 5.13-5.17 y flash-attn 2.8.1.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en una RTX 4090 (24 GB) en BF16 y en GPUs de datacenter (A100, H100) para indexación por lotes a mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 y GPUs con 16 GB o más en BF16; no se documentan variantes cuantizadas para GPUs de 8 GB.
- Despliegue: paquete propio `omnievie` (`pip install git+https://github.com/Tencent/OmniEVIE.git`) con `OmniEVIE`, `QueryGate` y `ThreeStageIndex`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo).
- La búsqueda sobre el índice no requiere GPU: 54,2 ms para 1M registros en un solo hilo de CPU.
- Throughput de indexación y latencia de encoding por documento: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniEVIE-4B | 4,54B | no disponible | Recuperación multimodal multi-vector con localización de evidencia | Apache-2.0 | Hugging Face + GitHub |
| ColBERT / ColBERTv2 | no disponible en la informacion | no disponible | Recuperación multi-vector de texto | MIT (versiones publicadas) | Repositorios publicos |
| jina-clip / CLIP-based retrievers | no disponible en la informacion | no disponible | Recuperación imagen-texto con vector unico | variable | Hugging Face |
| Qwen3.5-4B (modelo base) | 4B aprox. | no disponible | LLM generativo | no disponible en la informacion | Hugging Face |

No se dispone en la información proporcionada de cifras comparativas de rendimiento frente a estos modelos; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas en lenguaje natural, no soporta tool calling conversacional ni razonamiento multi-paso; solo genera embeddings para recuperación.
- No se documentan los idiomas soportados ni el alcance real de la recuperación cross-lingual.
- No se especifican la longitud de contexto, el número de tokens de entrenamiento ni la composición del dataset, lo que dificulta evaluar coberturas y sesgos.
- Riesgo de sesgo heredado de Qwen3.5-4B y de los datasets de entrenamiento (MMEB-V2, ViDoRe V3); no se documentan evaluaciones de sesgo.
- Riesgo de alucinación de evidencia: la localización devuelve siempre una región o timestamp, aunque la coincidencia sea débil; conviene aplicar umbrales de confianza y validación posterior.
- Los resultados de benchmarks publicados (QVHighlights) proceden del propio autor y no se han verificado de forma independiente.
- Dependencia estricta de `flash-attn>=2.7.0` y de un rango concreto de versiones de transformers, lo que puede complicar el despliegue en entornos con versiones fijadas.
- El ecosistema de despliegue es propio (`omnievie`); no hay soporte documentado en servidores de inferencia estándar.
- Licencia Apache-2.0 permite uso comercial, pero deben revisarse las licencias de los datasets de entrenamiento y del modelo base Qwen3.5-4B para producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: madurez y adopción aún muy limitadas.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/OmniEVIE-4B
- GitHub: https://github.com/Tencent/OmniEVIE
- Informe técnico (PDF): https://github.com/Tencent/OmniEVIE/blob/main/OmniEVIE_Technical_Report.pdf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset MMEB-V2: https://huggingface.co/datasets/TIGER-Lab/MMEB-V2
- Dataset ViDoRe Benchmark V3: https://huggingface.co/datasets/vidore/vidore_benchmark_v3
- Tencent (corporativo): https://www.tencent.com/
