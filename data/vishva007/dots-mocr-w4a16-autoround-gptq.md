# Vishva007/dots.mocr-W4A16-AutoRound-GPTQ

## Resumen

Vishva007/dots.mocr-W4A16-AutoRound-GPTQ es una versión cuantizada a 4 bits del modelo multimodal dots.mocr, desarrollado originalmente por dots-studio para el parseo de documentos e OCR de alta precisión. Esta variante, publicada por el usuario Vishva007, aplica la técnica AutoRound de Intel y exporta los pesos en formato GPTQ para su servicio directo con vLLM. El modelo base resuelve el problema de convertir imágenes de documentos en Markdown estructurado, tablas HTML, fórmulas LaTeX y SVG, preservando el orden de lectura y la fidelidad textual.

La cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) con group size 32 y simetría reduce el peso del repositorio a 12,8 GB para 3.039 millones de parámetros, manteniendo el codificador visual en precisión completa para no degradar el anclaje visual de los documentos. Está pensado para despliegues de alto rendimiento en producción, donde el coste de VRAM y el throughput son críticos.

Es relevante ahora porque el parseo de documentos a gran escala (facturas, informes, papers, formularios) es uno de los casos de uso más demandados en pipelines RAG y de digitalización, y esta variante permite servirlo en vLLM con contexto de hasta 32.768 tokens y licencia MIT, lo que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; codificador visual + decoder de lenguaje, detalles no publicados) |
| Parametros totales | 3.039.179.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configuración de servicio recomendada con `--max-model-len 32768`) |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), group size 32, simétrico; formato AutoRound nativo y exportación GPTQ |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (GPTQ), con `custom_code` y `trust_remote_code` requerido |

## Arquitectura y entrenamiento

El modelo base dots.mocr es un modelo multimodal de tipo image-text-to-text orientado a la comprensión y transcripción de documentos. La información disponible no detalla la arquitectura interna (número de capas, dimensión oculta, tipo de atención ni composición exacta del codificador visual), por lo que estos datos se marcan como no disponibles. Lo que sí se documenta es el proceso de cuantización: AutoRound de Intel con 1.500 iteraciones, 1.024 muestras de calibración, longitud de secuencia 8.192 y aceleración con `torch.compile`.

La innovación técnica clave de esta variante es la preservación del módulo visual: se aplica `quant_nontext_module=False`, de modo que el vision tower se mantiene en precisión completa mientras el resto de pesos se cuantiza a 4 bits. Esto busca evitar la degradación de las características visuales que impactaría directamente en la precisión del grounding de documentos. El resultado se exporta a GPTQ para integración nativa en vLLM. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de Markdown estructurado directamente desde imágenes de documentos, sin post-procesado intermedio.
- Extracción de tablas en HTML y fórmulas matemáticas en LaTeX.
- Generación de SVG a partir de contenido visual del documento.
- Preservación del orden de lectura en documentos con maquetación compleja (multicolumna, cabeceras, pies).
- Procesamiento multimodal image-text-to-text con pipeline dedicado en Hugging Face.
- Soporte multilingüe limitado a inglés y chino según los metadatos del modelo.
- Salida estructurada nativa, orientada a integración en pipelines de datos.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso tipo agente en la información disponible.

## Casos de uso

- Digitalización masiva de facturas y albaranes: el modelo convierte imágenes de documentos administrativos en Markdown y tablas HTML, apto para alimentar sistemas de contabilidad o ERP con contexto de hasta 32.768 tokens para documentos extensos.
- Ingesta de papers científicos para RAG: extrae texto, fórmulas LaTeX y tablas de artículos en PDF renderizados como imagen, manteniendo el orden de lectura necesario para chunking semántico correcto.
- Procesamiento de formularios escaneados: al preservar el vision tower en precisión completa, mantiene el anclaje visual necesario para distinguir campos, casillas y etiquetas en formularios con maquetación densa.
- Conversión de documentación técnica a Markdown para bases de conocimiento internas: genera SVG y tablas HTML que se integran en wikis o repositorios sin transcripción manual.
- Servicio de OCR de alto throughput con vLLM: la variante GPTQ permite servir con `--max-num-seqs 128`, prefix caching y chunked prefill, adecuada para colas de procesamiento por lotes.
- Extracción de datos de informes financieros en chino e inglés: el soporte bilingüe cubre documentos corporativos en ambos idiomas, con salida estructurada lista para parsing programático.
- Pipeline de enriquecimiento documental en CI/CD de datos: la salida Markdown/HTML/LaTeX se puede validar y versionar automáticamente sin intervención humana.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base original, no a esta variante cuantizada. No se han publicado resultados de benchmarks específicos de la versión W4A16 en la información disponible.

| Benchmark | Resultado (modelo base) |
|---|---|
| olmOCR-Bench (Overall) | 83,9 |
| OmniDocBench v1.5 (TextEdit) | 0,031 |
| OmniDocBench v1.5 (Read OrderEdit) | 0,029 |

No se dispone de comparación numérica del impacto de la cuantización W4A16 frente al modelo base en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 12,8 GB en disco; con overhead de KV cache y activaciones en bfloat16, se estima un mínimo práctico de 16-24 GB de VRAM para contexto moderado, y más de 40 GB para contexto completo de 32.768 tokens con concurrencia alta (estimación, no dato publicado).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para despliegues de una sola instancia con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090 y GPUs con 24 GB o más, siempre que se limite la longitud de contexto y el número de secuencias concurrentes.
- Opciones de despliegue: vLLM es la vía recomendada y documentada (variante GPTQ); no se documenta soporte de llama.cpp u Ollama en la información disponible.
- Configuración de servicio recomendada: `--dtype bfloat16`, `--kv-cache-dtype auto`, `--max-model-len 32768`, `--max-num-seqs 128`, `--gpu-memory-utilization 0.90`, `--enable-prefix-caching`, `--enable-chunked-prefill`, `--trust-remote-code`, `--chat-template-content-format string`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dots.mocr W4A16 AutoRound GPTQ (este) | 3.039 M | 32.768 | MIT | safetensors GPTQ | Variante cuantizada 4 bits, servicio en vLLM |
| dots-studio/dots.mocr (base) | 3.039 M | no disponible | MIT | safetensors | Modelo original sin cuantizar, mayor VRAM |
| Vishva007/dots.mocr-W4A16-AutoRound | 3.039 M | 32.768 | MIT | AutoRound nativo | Misma cuantización, formato nativo AutoRound |

No se dispone de información sobre otros modelos OCR multimodales comparables (como olmOCR, GOT-OCR o Nougat) en la búsqueda proporcionada, por lo que no se incluyen cifras comparativas de rendimiento.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea degradado.
- Riesgo de alucinación en documentos con baja calidad de escaneo, manuscritos o maquetaciones atípicas; no hay datos publicados sobre tasas de error en estos casos.
- Advertencia crítica de despliegue: el KV cache debe mantenerse en `auto` o `bfloat16`. El uso de formatos de baja precisión como `fp8` provoca que el modelo no genere salida o devuelva respuestas vacías.
- Requiere `--trust-remote-code` y `custom_code`; esto implica ejecutar código del repositorio, con el riesgo de seguridad asociado en entornos no auditados.
- La cuantización W4A16 puede degradar ligeramente la precisión respecto al modelo base; no se han publicado métricas comparativas que cuantifiquen esta pérdida.
- El repositorio es una publicación de un tercero (Vishva007) sobre el modelo de dots-studio; la reproducibilidad y el mantenimiento no están garantizados por el autor original.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas en la información disponible.
- La model card incluye enlaces de afiliado a RunPod; no afectan al modelo pero conviene tenerlo en cuenta al seguir las instrucciones de despliegue.

## Enlaces

- Hugging Face (esta variante GPTQ): https://huggingface.co/Vishva007/dots.mocr-W4A16-AutoRound-GPTQ
- Hugging Face (variante AutoRound nativa): https://huggingface.co/Vishva007/dots.mocr-W4A16-AutoRound
- Modelo base: https://huggingface.co/dots-studio/dots.mocr
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
