# wittjeff/unlimited-ocr-bf16-mlx

## Resumen

Este modelo es una conversión a MLX del modelo `baidu/Unlimited-OCR`, un sistema de visión-lenguaje especializado en OCR y análisis de documentos. Ha sido creado por `wittjeff` y publicado en Hugging Face con el ID `wittjeff/unlimited-ocr-bf16-mlx`. El modelo original, desarrollado por Baidu, combina dos codificadores de visión (SAM ViT-B y CLIP-L) con un decoder MoE basado en DeepSeek-V2, alcanzando 3.340 millones de parámetros en total. Esta conversión se distribuye en bf16 sin cuantización y está pensada para ejecutarse en Apple Silicon mediante la librería `mlx-vlm`.

La relevancia de esta conversión radica en que restaura el tokenizer completo del modelo original, que en otras conversiones MLX suele aparecer recortado. Además, elimina el chat template que la conversión estándar añade por defecto, ya que el modelo es sensible a la redacción exacta del prompt. Así, esta versión permite un uso fiel del modelo en tareas de parsing documental y OCR, y puede integrarse como motor MLX para el preset `unlimited_ocr` de la librería `docling`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) con dual vision encoders (SAM ViT-B + CLIP-L) y decoder MoE DeepSeek-V2 |
| Parametros totales | 3.336.106.240 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (sin cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |
| Tamaño del repo | 6.7 GB |
| Modelo base | baidu/Unlimited-OCR |

## Arquitectura y entrenamiento

La arquitectura del modelo original `baidu/Unlimited-OCR` es un sistema de visión-lenguaje con dos encoders de visión: un SAM ViT-B y un CLIP-L, que alimentan un decoder basado en un modelo de mezcla de expertos (MoE) DeepSeek-V2. El resultado es un modelo de 3.340 millones de parámetros en total, aunque la cantidad de parámetros activos no se especifica en la información disponible.

En cuanto al entrenamiento, la información disponible no incluye datos sobre el tamaño del corpus, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación técnica destacable de esta conversión concreta es que restaura los ficheros completos del tokenizer original (`tokenizer.json`, `tokenizer_config.json` de 165.938 bytes y `special_tokens_map.json`), incluyendo 830 entradas en `added_tokens_decoder`, y elimina el `chat_template.jinja` que la conversión estándar de `mlx_vlm` añade. Esto garantiza que los tokens de grounding (`<|det|>`, `<|/det|>`, `<|ref|>`, `<|/ref|>`, `<|grounding|>`) se conserven como tokens especiales y que la decodificación byte-level BPE no muestre marcadores `<0x..>` sin procesar.

## Capacidades

- Parsing documental estructurado: con el prompt `<image>document parsing.`, el modelo genera bloques con tokens de grounding (`<|det|>…<|/det|>`) que delimitan regiones de texto, lo que permite extraer contenido con información posicional.
- OCR de texto plano: con el prompt `<image>Free OCR.`, el modelo devuelve el texto sin formato, sin bloques de grounding.
- Sensibilidad a prompts: el modelo es muy sensible a la redacción exacta del prompt, por lo que las cadenas anteriores deben usarse literalmente.
- Integración con `docling`: puede utilizarse como motor MLX para el preset `unlimited_ocr`, según lo previsto en la librería.
- No se documentan capacidades de tool calling, function calling ni soporte de agentes en la información proporcionada.

## Casos de uso

- Digitalización de documentos escaneados: usar el modo `document parsing` para obtener el texto de una imagen con estructura de párrafos, listas y títulos, preservando la organización mediante los bloques de grounding.
- Extracción de texto plano de imágenes: emplear el modo `Free OCR` para obtener un texto continuo a partir de una página escaneada, sin necesidad de conservar la disposición espacial.
- Integración en pipelines de procesamiento documental: conectar el modelo a un sistema basado en `docling` en Apple Silicon, aprovechando la conversión MLX para ejecutar el parsing sin depender de una GPU CUDA.
- Automatización de captura de datos en formularios: extraer campos de texto de facturas, recibos o impresos mediante el modo estructurado, usando los bloques de detección para localizar cada campo.
- Indexación de documentos para recuperación aumentada (RAG): convertir documentos escaneados en texto y estructuras que puedan alimentar un índice semántico o vectorial.
- Accesibilidad de documentos: transformar imágenes o PDF escaneados en texto legible para usuarios con discapacidad visual, mediante un flujo de OCR local en un Mac.
- Anotación de datos para entrenamiento: usar los bloques de grounding para generar anotaciones de regiones de texto en imágenes, con vistas a crear datasets de OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor presenta una tabla de verificación funcional, pero no es un benchmark de calidad:

| Verificación | Resultado |
|---|---|
| `tokenizer_config.json` | 165.938 bytes, 830 tokens añadidos, carga como tokenizer rápido |
| Round-trip de tokens de grounding (`skip_special_tokens=False`) | 5/5 exactos |
| `chat_template.jinja` | ausente (como en upstream) |
| Layout de cuantización | sin cuantizar (bf16) |
| Bloques `<|det|>…<|/det|>` con `<image>document parsing.` | 6 presentes |
| Bloques `<|det|>…<|/det|>` con `<image>Free OCR.` | 6 presentes, sin bucle de repetición |
| Marcadores `<0x..>` sin procesar | 0 |
| Similitud de texto vs referencia CUDA bf16 | 1.000 |
| Throughput | 33.2 tok/s |
| Memoria pico | 8.64 GB |

La similitud 1.000 se refiere a una única página sintética (título, dos párrafos y una lista corta) a 200 dpi, con los bloques de grounding eliminados antes de la comparación. No debe interpretarse como un benchmark de comprensión documental.

## Requisitos de hardware

- VRAM estimada: la verificación del autor reporta un pico de memoria de 8.64 GB en un Apple M4 con 16 GB de RAM. En GPU CUDA, esta conversión MLX no está pensada para ejecutarse; el modelo original `baidu/Unlimited-OCR` requiere su propio entorno.
- GPU recomendadas: Apple Silicon (M4 o superior). El autor validó el funcionamiento en un Apple M4, 16 GB, macOS 26.6.2, con `mlx-vlm` 0.6.17 y `mlx` 0.32.2.
- Si cabe en consumer GPU: no aplica, porque la conversión es específica para MLX (Apple Silicon). Para tarjetas NVIDIA se debe usar el checkpoint original de Baidu con `transformers`.
- Opciones de despliegue: `mlx-vlm` para inferencia local en Apple Silicon; también puede usarse como motor MLX en `docling`.
- Latencia y throughput: el autor reporta 33.2 tokens por segundo y un pico de memoria de 8.64 GB en la plataforma mencionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| wittjeff/unlimited-ocr-bf16-mlx | 3.34B MoE | no disponible | MIT | safetensors MLX bf16 | Tokenizer completo, sin chat template, sin cuantizacion |
| mlx-community/Unlimited-OCR-bf16 | 3.34B MoE | no disponible | MIT | safetensors MLX bf16 | Conversión MLX mantenida por shuuul/aimd, siguiendo la configuración oficial |
| baidu/Unlimited-OCR | 3.34B MoE | no disponible | MIT | safetensors (transformers) | Modelo original, referencia para CUDA |

La comparación se basa en la información pública de los repositorios. No se dispone de datos sobre la longitud de contexto ni sobre los parámetros activos de ninguno de los tres.

## Limitaciones y advertencias

- El filtro `no_repeat_ngram_size` / `ngram_window` de la implementación de referencia no está implementado en el bucle de generación de `mlx-vlm`. Aunque el autor no reprodujo un bucle de repetición en su muestra, el riesgo existe en entradas largas, especialmente en modo `Free OCR`.
- `mlx-vlm` ejecuta atención completa en lugar de la atención de ventana deslizante (R-SWA) del modelo de referencia. Esto puede producir diferencias en entradas muy largas, aunque es equivalente en páginas individuales.
- El modo dinámico de resolución "Gundam" (recorte a 640 píxeles) no ha sido probado en esta conversión; la verificación se realizó únicamente en el modo base.
- El modelo es extremadamente sensible a la redacción del prompt. Usar variaciones de `<image>document parsing.` o `<image>Free OCR.` puede degradar significativamente el resultado.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas en la documentación proporcionada.
- La licencia MIT permite el uso comercial, pero los pesos originales son propiedad de Baidu; la conversión no modifica los pesos más allá del cambio de formato.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/wittjeff/unlimited-ocr-bf16-mlx
- Modelo original: https://huggingface.co/baidu/Unlimited-OCR
- Conversión alternativa MLX: https://huggingface.co/mlx-community/Unlimited-OCR-bf16
- Repositorio de docling: https://github.com/docling-project/docling
- Issue de docling sobre el motor MLX: https://github.com/docling-project/docling/issues/3943
