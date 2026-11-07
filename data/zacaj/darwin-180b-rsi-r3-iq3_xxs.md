# zacaj/Darwin-180B-RSI-R3-IQ3_XXS

## Resumen

Darwin-180B-RSI es un modelo de razonamiento vision-lenguaje de tipo mixture-of-experts (MoE) con 180.000 millones de parámetros, desarrollado por FINAL-Bench. Su modelo padre es Qwen/Qwen3.8-Flash-Next, del que conserva los 512 expertos enrutados, el router y el codificador visual. La innovación declarada por el autor es un proceso de auto-mejora recursiva (RSI, recursive self-improvement) a partir de respuestas verificadas contra referencias comprobables.

El modelo acepta entradas de imagen y texto y está orientado a tareas de razonamiento multimodal y contexto largo, con una ventana declarada de 262.000 tokens. La ficha de Hugging Face consultada corresponde a una cuantización IQ3_XXS publicada por el usuario zacaj, derivada del modelo original de FINAL-Bench.

La relevancia actual del modelo radica en su combinación de atención híbrida (atención lineal y atención completa), contexto de 262k y un pipeline de auto-mejora basado en verificación, un enfoque que busca mejorar el razonamiento sin depender exclusivamente de anotación humana. No obstante, la información pública disponible es escasa y no se han publicado resultados de benchmarks verificables en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atención híbrida (lineal + completa) y codificador visual |
| Parametros totales | 180B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.000 tokens (262k) |
| Tipos de cuantizacion | IQ3_XXS (la publicada); otras no disponibles |
| Idiomas soportados | 5 idiomas (no se especifican cuáles) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (modelo original); GGUF (cuantización IQ3_XXS) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos dispersa (sparse MoE) heredada de Qwen3.8-Flash-Next, con 512 expertos enrutados y un router que selecciona los expertos activos por token. Incorpora atención híbrida, combinando capas de atención lineal con capas de atención completa, lo que permite sostener un contexto de 262.000 tokens con un coste computacional menor que la atención cuadrática pura. Dispone además de un codificador visual que habilita la entrada de imágenes junto con texto.

El entrenamiento incluye, según la documentación del autor, una fase de auto-mejora recursiva (RSI) en la que las respuestas del modelo se contrastan con referencias verificables y se reutilizan para refinar el modelo. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multimodal (image-to-text y text-to-text).
- Procesamiento de imágenes mediante codificador visual integrado.
- Razonamiento multi-paso y modo de razonamiento explícito (reasoning model).
- Contexto largo de hasta 262.000 tokens para documentos extensos o conversaciones prolongadas.
- Soporte multilingüe limitado a 5 idiomas (no especificados).
- Tool calling y function calling: no disponible en la información consultada.
- Soporte de agentes: no disponible en la información consultada.
- Capacidades de audio: no disponible.

## Casos de uso

- Análisis de documentos técnicos extensos: gracias a su ventana de 262k tokens, el modelo puede procesar manuales, informes o expedientes completos en una sola pasada sin necesidad de fragmentación.
- Razonamiento sobre diagramas e imágenes técnicas: el codificador visual permite interpretar planos, gráficos o capturas y responder preguntas asociadas en texto.
- Asistencia a investigación documental multimodal: combinación de lectura de figuras, tablas e imágenes con razonamiento textual para síntesis de literatura científica.
- Extracción de información estructurada de documentos escaneados: el modelo puede describir y razonar sobre imágenes de formularios o facturas junto con su contexto textual.
- Evaluación automática de respuestas con verificación: el enfoque RSI del entrenamiento lo hace adecuado para tareas donde se requiere contrastar respuestas contra referencias comprobables.
- Prototipado de asistentes multimodales de contexto largo: útil en entornos de investigación donde se necesita un modelo que mantenga el hilo sobre conversaciones e imágenes durante muchas interacciones.
- Despliegue en entornos con recursos limitados mediante la cuantización IQ3_XXS, que reduce el peso del modelo para inferencia en hardware más modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la cuantización IQ3_XXS: aproximadamente 75-85 GB para los pesos, más overhead de contexto y caché KV; el contexto de 262k incrementa sustancialmente el consumo de memoria.
- GPU recomendadas: múltiples A100 80GB o H100 80GB para el modelo cuantizado; el modelo original en precisión completa requiere un clúster multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) ni siquiera en la cuantización IQ3_XXS; se requeriría descarga a CPU/RAM o configuraciones multi-GPU especiales.
- Opciones de despliegue: llama.cpp y Ollama para la versión GGUF; vLLM, TGI y SGLang para el modelo original en safetensors (SGLang aparece referenciado en la página del modelo original).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Darwin-180B-RSI | 180B (MoE) | 262k | qwen-community-1.0 | Hugging Face (FINAL-Bench y cuantización de zacaj) |
| Qwen3.8-Flash-Next (modelo padre) | no disponible | no disponible | qwen-community-1.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: no se detallan parámetros activos, composición del dataset ni resultados de evaluación.
- Riesgo de alucinación inherente a los modelos de razonamiento generativo, sin datos publicados que lo cuantifiquen.
- Idiomas soportados limitados a 5, sin especificar cuáles; posible degradación fuera de esos idiomas.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- La cuantización IQ3_XXS introduce pérdida de precisión respecto al modelo original; no se han publicado evaluaciones del impacto en calidad.
- El contexto de 262k exige una gestión cuidadosa de la memoria KV, lo que puede limitar el despliegue práctico.
- No hay evidencia publicada sobre tool calling, soporte de agentes ni latencias en producción.
- El proceso de auto-mejora recursiva (RSI) no está documentado en detalle; su efecto real sobre la calidad no es verificable con los datos disponibles.

## Enlaces

- Cuantización en Hugging Face: https://huggingface.co/zacaj/Darwin-180B-RSI-R3-IQ3_XXS
- Modelo original: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/darwin-180b-rsi-final-bench
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/raw/main/LICENSE
- Modelo padre: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
