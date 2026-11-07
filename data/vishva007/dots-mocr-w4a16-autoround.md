# Vishva007/dots.mocr-W4A16-AutoRound

## Resumen

dots.mocr W4A16 AutoRound es una versión cuantizada a 4 bits de los pesos del modelo multimodal dots.mocr, desarrollado originalmente por dots-studio y publicado en Hugging Face por el usuario Vishva007. El modelo base es un sistema de image-text-to-text especializado en OCR y parseo de documentos: convierte imágenes de páginas en Markdown estructurado, tablas HTML, fórmulas LaTeX y gráficos SVG. Esta variante aplica cuantización de pesos a 4 bits con activaciones en 16 bits (W4A16) mediante Intel AutoRound, con el objetivo de reducir el espacio en disco y la VRAM necesaria para servir el modelo en producción sin degradar la precisión del encoder visual.

El interés de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo nuevo: mantiene la arquitectura y capacidades del original (1.938.819.584 parámetros, unos 1,94 mil millones) pero empaqueta los pesos en un formato optimizado para vLLM. El autor publica dos variantes: el formato nativo AutoRound y una exportación GPTQ pensada para servir directamente en vLLM. La receta de cuantización preserva el vision tower en precisión completa (`quant_nontext_module=False`), una decisión relevante porque el grounding visual es crítico en tareas de OCR.

La relevancia actual es práctica: los modelos de parseo de documentos se están desplegando masivamente en pipelines de ingestión de datos, y una versión de 4 bits que cabe en GPUs de consumo y se sirve con vLLM a 32K de contexto reduce el coste por página procesada. La licencia MIT del modelo base facilita su adopción comercial, aunque conviene verificar las condiciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con vision tower; detalles internos del base no disponibles |
| Parametros totales | 1.938.819.584 (≈1,94 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (configuración de servicio recomendada con `--max-model-len 32768`) |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), grupo 32, simétrico; variantes AutoRound nativa y exportación GPTQ |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (con `custom_code` y `trust_remote_code`), exportación GPTQ disponible |

## Arquitectura y entrenamiento

El modelo base dots.mocr es un sistema multimodal de tipo image-text-to-text orientado a la transcripción y estructuración de documentos. La información disponible no detalla la arquitectura interna del transformer ni la composición del dataset de entrenamiento del modelo original; lo que sí se documenta es el proceso de cuantización aplicado en esta variante. AutoRound se ejecutó con 1.500 iteraciones sobre 1.024 muestras, con longitud de secuencia de 8.192 tokens y aceleración mediante `torch.compile`. La receta usa cuantización simétrica de grupo 32 en W4A16 y, de forma destacable, mantiene el módulo visual (`quant_nontext_module=False`) en precisión completa para preservar la capacidad de grounding sobre el documento.

La innovación técnica principal de esta ficha no está en el entrenamiento sino en el empaquetado: la preservación del encoder visual en precisión completa evita la pérdida de calidad en la localización de texto y tablas, que es donde las cuantizaciones agresivas suelen fallar en modelos OCR. El resultado es un checkpoint de 12,8 GB en el repositorio que se sirve con vLLM usando `--trust-remote-code`, `--dtype bfloat16`, prefix caching y chunked prefill. No se dispone de información sobre RLHF, DPO ni sobre el volumen de tokens de entrenamiento del modelo base.

## Capacidades

- Generación de texto a partir de imágenes de documentos (image-text-to-text).
- OCR y transcripción de páginas completas a Markdown estructurado.
- Generación nativa de tablas en HTML a partir de imágenes.
- Conversión de fórmulas matemáticas a LaTeX.
- Generación de gráficos vectoriales SVG a partir de contenido visual.
- Parseo de documentos con preservación del orden de lectura.
- Soporte conversacional multi-turno (pipeline `conversational`).
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión adicional o audio: no disponible.

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: el modelo convierte cada página en Markdown estructurado, y con 32K de contexto y `--max-num-seqs 128` en vLLM se pueden procesar lotes grandes en una sola GPU, reduciendo el coste por documento en pipelines de ingestión.
- Extracción de tablas financieras: la generación nativa de tablas HTML permite alimentar directamente bases de datos o hojas de cálculo sin post-procesado heurístico, aprovechando la preservación del vision tower en precisión completa para mantener la alineación de celdas.
- Conversión de literatura científica a formatos editables: las fórmulas en LaTeX y el orden de lectura preservado hacen del modelo una pieza adecuada para digitalizar papers y alimentar repositorios de investigación o sistemas RAG sobre corpus científicos.
- Construcción de bases de conocimiento para RAG: el Markdown estructurado resultante se trocea y se indexa con menos ruido que una extracción OCR plana, lo que mejora la recuperación en asistentes documentales sobre contratos, manuales o normativa.
- Procesamiento de documentos en chino e inglés: el soporte bilingüe encaja en entornos corporativos con documentación mixta, como filiales internacionales o equipos de compliance que manejan expedientes en ambos idiomas.
- Reproducción de diagramas y gráficos: la generación de SVG permite reconstruir esquemas y diagramas de flujo de manuales técnicos en formato vectorial editable, útil en documentación de producto y mantenimiento industrial.
- Despliegue en infraestructura de coste contenido: al ser un modelo de ~1,94 B parámetros en 4 bits, puede servirse en GPUs de consumo o en instancias cloud modestas, lo que lo hace viable para equipos pequeños que no pueden asumir el coste de un modelo OCR de mayor tamaño.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo base original, no a esta variante cuantizada. No se han publicado resultados de benchmarks específicos de la versión W4A16 en la información disponible.

| Benchmark | Resultado (modelo base) | Notas |
|---|---|---|
| olmOCR-Bench | 83,9 (Overall) | Dato del modelo base dots.mocr |
| OmniDocBench v1.5 (TextEdit) | 0,031 | Menor es mejor |
| OmniDocBench v1.5 (Read OrderEdit) | 0,029 | Menor es mejor |

No se dispone de comparación numérica entre la variante cuantizada y el modelo base en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 12,8 GB; con pesos W4A16 de ~1,94 B parámetros, el peso de los pesos ronda los 1-1,5 GB, pero el vision tower en precisión completa y el KV cache a 32K incrementan el consumo. Una estimación conservadora sitúa el total en 8-16 GB según longitud de contexto y número de secuencias concurrentes. No disponible una cifra oficial medida.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090 y GPUs con 24 GB o más para uso individual.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) y modelos con 16 GB si se reduce `--max-model-len` y el número de secuencias.
- Opciones de despliegue: vLLM es la vía documentada (con `--trust-remote-code`, `--chat-template-content-format string`, `--dtype bfloat16`, `--kv-cache-dtype auto`, `--enable-prefix-caching`, `--enable-chunked-prefill`); la exportación GPTQ está pensada para vLLM. Soporte en llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible. La configuración recomendada admite `--max-num-seqs 128` y `--gpu-memory-utilization 0.90`, lo que sugiere un diseño para alto throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dots.mocr W4A16 AutoRound (esta ficha) | ≈1,94 B | 32.768 | OCR / parseo de documentos multimodal | MIT | Hugging Face, vLLM |
| dots.mocr (base, sin cuantizar) | ≈1,94 B | no disponible | OCR / parseo de documentos multimodal | MIT | Hugging Face |
| dots.mocr W4A16 AutoRound GPTQ | ≈1,94 B | 32.768 | OCR / parseo de documentos multimodal, exportación GPTQ | MIT | Hugging Face, vLLM |
| Otros modelos OCR de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos competidores de la misma categoría, por lo que no es posible una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Solo se declaran los idiomas inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado y puede degradarse notablemente.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar texto, celdas de tabla o fórmulas que no aparecen en la imagen, especialmente en documentos de baja calidad o con tipografías inusuales.
- La cuantización a 4 bits puede introducir degradación frente al modelo base; no se han publicado métricas comparativas que cuantifiquen esa pérdida.
- Advertencia crítica de despliegue: el KV cache debe mantenerse en `auto` o `bfloat16`; usar formatos de baja precisión como `fp8` provoca que el modelo no genere salida o devuelva respuestas vacías.
- Requiere `--trust-remote-code` y carga de código personalizado (`custom_code`), lo que implica ejecutar código del repositorio y aumenta la superficie de riesgo en entornos compartidos.
- El modelo base puede tener sesgos derivados de sus datos de entrenamiento; no se documentan análisis de sesgo en la información disponible.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo base dots-studio/dots.mocr y de los pesos derivados antes de un despliegue en producción.
- Repositorio con muy poca tracción (36 descargas, 0 likes) y mantenido por un autor individual; no hay garantías de soporte ni de actualizaciones.
- El autor incluye enlaces de afiliado a RunPod en la model card; no afecta al modelo, pero conviene tenerlo en cuenta al evaluar la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/dots.mocr-W4A16-AutoRound
- Variante GPTQ: https://huggingface.co/Vishva007/dots.mocr-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/dots-studio/dots.mocr
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Referencia de despliegue en RunPod: https://runpod.io?ref=iabrlp7z
