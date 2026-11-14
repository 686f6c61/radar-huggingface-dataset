# Vishva007/dots.mocr-NVFP4

## Resumen

dots.mocr-NVFP4 es una versión cuantizada a 4 bits en formato NVFP4 del modelo multimodal dots.mocr, desarrollado originalmente por dots-studio y cuantizado por el usuario Vishva007 mediante Intel AutoRound. Se trata de un modelo de imagen-a-texto especializado en OCR y parseo de documentos, capaz de convertir imágenes de documentos en Markdown estructurado, tablas HTML, fórmulas LaTeX y gráficos SVG. El modelo base cuenta con aproximadamente 3.039 millones de parámetros y está pensado para despliegues de producción de alta densidad documental.

La relevancia de esta variante reside en la cuantización NVFP4, un formato de coma flotante de 4 bits con tamaño de grupo 16 y simetría, que reduce el peso del repositorio a 4,2 GB y permite servir el modelo con vLLM en GPUs con memoria limitada manteniendo, según el autor, la precisión de anclaje visual al preservar el codificador de visión en precisión completa. El recetario de cuantización se calibró con 512 muestras y 1.200 iteraciones sobre una mezcla de documentos en inglés, multilingüe e índico.

El modelo soporta cinco idiomas declarados (inglés, chino, hindi, tamil y telugu) y se distribuye con licencia MIT, lo que facilita su integración comercial. Está etiquetado para uso con vLLM y compressed-tensors, y su pipeline es image-text-to-text con soporte conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; codificador de visión + decoder de lenguaje, detalles no especificados) |
| Parametros totales | 3.039.179.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configuración de servicio recomendada con `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 (4 bits, group size 16, simétrico); calibración AutoRound; codificador de visión en precisión completa |
| Idiomas soportados | en, zh, hi, ta, te |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, AutoRound/GPTQ) |

## Arquitectura y entrenamiento

El modelo base dots.mocr es un modelo multimodal de imagen-a-texto orientado a la digitalización de documentos. La información disponible no detalla la arquitectura interna del transformer ni la composición exacta del corpus de entrenamiento original; lo que sí se documenta es el proceso de cuantización aplicado en esta variante. La cuantización se realizó con Intel AutoRound en formato NVFP4, con tamaño de grupo 16 y simetría activada, y con la directiva `quant_nontext_module=False`, que preserva el codificador de visión en precisión completa para no degradar el anclaje visual de los documentos.

El recetario de calibración empleó 1.200 iteraciones sobre 512 muestras con longitud de secuencia 4096 y aceleración mediante `torch.compile`. La mezcla de calibración combinó 224 muestras primarias de OCR en inglés de `allenai/olmOCR-mix-1025` más 39 de relleno, 144 muestras multilingües del mismo conjunto y 12 muestras por idioma de `CohereForAI/aya_dataset` para 12 lenguas índicas (hindi, tamil, telugu, malayalam, kannada, marathi, bengalí, gujarati, punyabí, odia, urdu y asamés). No se especifican en la información proporcionada detalles sobre RLHF, DPO ni el número total de tokens de entrenamiento del modelo base.

## Capacidades

- Generación de texto a partir de imágenes de documentos (OCR completo).
- Conversión directa de imágenes a Markdown estructurado.
- Generación nativa de tablas en HTML.
- Generación de fórmulas matemáticas en LaTeX.
- Generación de gráficos vectoriales SVG a partir de contenido visual.
- Parseo de documentos con preservación de orden de lectura.
- Capacidades multilingües en inglés, chino, hindi, tamil y telugu (y cobertura de calibración para 12 lenguas índicas).
- Soporte conversacional (pipeline image-text-to-text con formato de chat).
- Compatibilidad con tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio o visión general: no disponible; la capacidad visual está orientada a documentos.

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: el modelo convierte cada página en Markdown estructurado, lo que permite indexar el contenido en motores de búsqueda o bases de datos vectoriales sin post-procesado manual.
- Extracción de tablas financieras: gracias a la generación nativa de tablas HTML, se pueden procesar balances, facturas y estados de resultados manteniendo la estructura de filas y columnas para su carga en hojas de cálculo o sistemas ERP.
- Conversión de artículos científicos a formato estructurado: la generación de fórmulas en LaTeX facilita la migración de papers escaneados a repositorios con renderizado matemático, preservando ecuaciones y referencias.
- Procesamiento de documentación multilingüe en India: la calibración específica para 12 lenguas índicas y el soporte declarado de hindi, tamil y telugu lo hacen adecuado para digitalizar formularios administrativos y registros públicos en esos idiomas.
- Generación de diagramas SVG a partir de figuras: útil para equipos de documentación técnica que necesitan recrear esquemas y gráficos en formato vectorial editable a partir de capturas o escaneos.
- Servicio de parseo de alta concurrencia con vLLM: la configuración recomendada (`--max-num-seqs 128`, prefix caching y chunked prefill) permite atender cargas de trabajo de digitalización por lotes con latencia controlada en un solo nodo GPU.
- Preprocesado para pipelines RAG: la salida en Markdown limpio y con orden de lectura preservado reduce el ruido antes de la fragmentación y el embedding de documentos corporativos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo base original, no a esta variante cuantizada:

| Benchmark | Resultado (modelo base) |
|---|---|
| olmOCR-Bench (Overall) | 83,9 |
| OmniDocBench v1.5 (TextEdit) | 0,031 |
| OmniDocBench v1.5 (Read OrderEdit) | 0,029 |

No se han publicado resultados de benchmarks específicos para la variante NVFP4 en la información disponible, por lo que se desconoce la degradación exacta respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,2 GB en pesos NVFP4; con overhead de activaciones, caché KV en bfloat16 y contexto de 32.768 tokens, se recomienda al menos 16-24 GB de VRAM para servicio con concurrencia moderada.
- GPU recomendadas: A100, H100 y L40S para producción de alta concurrencia; RTX 4090 (24 GB) para despliegues de una sola GPU con concurrencia limitada.
- Compatibilidad con GPU de consumo: sí, en GPUs con 24 GB o más (RTX 4090, RTX 3090). En GPUs de 16 GB el margen es ajustado y requiere reducir `--max-model-len` o `--max-num-seqs`.
- Opciones de despliegue: vLLM es la vía documentada y recomendada, con `--trust-remote-code`, `--dtype bfloat16` y `--kv-cache-dtype auto`. El formato NVFP4 requiere soporte de compressed-tensors en la versión de vLLM utilizada; llama.cpp, Ollama y TGI no están documentados para este formato en la información disponible.
- Advertencia crítica de despliegue: no usar `--kv-cache-dtype fp8` ni otras precisiones bajas de caché KV; según el autor, provoca respuestas vacías o fallo total de generación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| dots.mocr-NVFP4 (esta ficha) | 3.039 M | 32.768 | OCR y parseo de documentos | MIT | safetensors NVFP4 |
| dots.mocr (base) | 3.039 M | no disponible | OCR y parseo de documentos | MIT | safetensors (precisión completa) |
| Modelos OCR multimodales de la familia olmOCR | no disponible | no disponible | OCR de documentos | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de rendimiento frente a alternativas como olmOCR, GOT-OCR2.0 o Qwen2-VL en tareas de parseo documental; la comparación queda limitada a la variante base del mismo modelo.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir degradación de precisión respecto al modelo base; no se han publicado métricas de la variante cuantizada en olmOCR-Bench ni OmniDocBench.
- El codificador de visión se preserva en precisión completa, pero el decoder de lenguaje está cuantizado a 4 bits, lo que puede afectar a la generación de texto largo o estructuras complejas.
- Riesgo de alucinación en documentos con baja calidad de escaneo, tablas muy densas o tipografías poco habituales; conviene validar la salida en flujos críticos.
- El soporte de idiomas declarado se limita a en, zh, hi, ta y te; aunque la calibración cubre 12 lenguas índicas, no se garantiza calidad equivalente en todas ellas.
- La licencia MIT permite uso comercial, pero el modelo base y las dependencias de código (`trust-remote-code`) deben auditarse por separado.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio; revisar el código antes de desplegar en entornos sensibles.
- No usar caché KV en fp8: causa fallos de generación según el autor.
- El repositorio tiene un volumen de descargas bajo (65) y ninguna valoración, por lo que la validación comunitaria es escasa.
- No hay información sobre sesgos demográficos o culturales del modelo base en la documentación disponible.

## Enlaces

- [Hugging Face: Vishva007/dots.mocr-NVFP4](https://huggingface.co/Vishva007/dots.mocr-NVFP4)
- [Modelo base: dots-studio/dots.mocr](https://huggingface.co/dots-studio/dots.mocr)
- [Intel AutoRound (GitHub)](https://github.com/intel/auto-round)
- [Dataset de calibración: allenai/olmOCR-mix-1025](https://huggingface.co/datasets/allenai/olmOCR-mix-1025)
- [Dataset de calibración: CohereForAI/aya_dataset](https://huggingface.co/datasets/CohereForAI/aya_dataset)
- [RunPod (referido del autor)](https://runpod.io?ref=iabrlp7z)
