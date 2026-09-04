# wittjeff/unlimited-ocr-6bit-mlx

## Resumen

El modelo `wittjeff/unlimited-ocr-6bit-mlx` es una conversión a MLX (Apple Silicon) del modelo `baidu/Unlimited-OCR`, un sistema de visión-lenguaje diseñado para OCR y parseo de documentos. Desarrollado por `wittjeff`, esta versión de 3.34B parámetros utiliza una arquitectura MoE con codificadores de visión duales (SAM ViT-B y CLIP-L) y un decodificador basado en DeepSeek-V2 MoE. La conversión aplica cuantización de 6 bits al stack de lenguaje, manteniendo las torres de visión en bf16, con un peso efectivo de 7.646 bits por parámetro. Su relevancia radica en corregir el tokenizer del modelo original para que los tokens de grounding funcionen correctamente, y en ofrecer una alternativa funcional para ejecutar Unlimited-OCR en hardware de Apple, con integración en docling.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con codificadores de visión duales SAM ViT-B + CLIP-L y decodificador DeepSeek-V2 MoE |
| Parámetros totales | 3.336.106.240 (3.34B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6-bit affine en el stack de lenguaje; torres de visión (SAM ViT-B y CLIP-L) en bf16. Efectivo: 7.646 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del upstream; pesos © Baidu) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `baidu/Unlimited-OCR` es un modelo de 3.34B parámetros con arquitectura MoE (Mixture of Experts). Emplea dos codificadores de visión: SAM ViT-B y CLIP-L, y un decodificador basado en DeepSeek-V2 MoE. Los datos de entrenamiento originales no están documentados en la información disponible; esta conversión no modifica los pesos, solo el formato y la cuantización.

La innovación técnica destacable de esta conversión es la restauración del tokenizer completo (165.938 bytes, 830 entradas en `added_tokens_decoder`) y la ausencia de `chat_template`, lo que garantiza que los tokens de grounding (`<|det|>`, `<|ref|>`, `<|grounding|>`) se conserven al pasar por el generador y que el prompt se transmita verbatim. Además, la cuantización 6-bit affine se aplica únicamente al stack de lenguaje, dejando las torres de visión en bf16 para preservar la calidad visual.

## Capacidades

- OCR de texto plano mediante el prompt `<image>Free OCR.`, que devuelve texto sin estructura.
- Parseo estructurado de documentos mediante el prompt `<image>document parsing.`, que genera bloques delimitados por tokens de grounding (`<|det|>...</|det|>`, `<|ref|>...</|ref|>`) para localizar elementos.
- Procesamiento de imágenes como entrada (vision-language), compatible con el formato de imagen de MLX.
- Integración con docling como motor MLX para el preset `unlimited_ocr`, lo que permite usarlo en pipelines de conversión de documentos.
- El tokenizer restaurado permite el round-trip exacto de los tokens especiales, necesario para consumidores de grounding como docling.
- No se menciona soporte de tool calling ni de agentes en la información disponible.
- Capacidades multilingües no especificadas.

## Casos de uso

- Digitalización de documentos en Apple Silicon: el modelo puede ejecutarse en Macs con MLX, con un consumo de memoria de 5.15 GB, lo que permite procesar documentos escaneados en equipos de 16 GB de RAM.
- Parseo estructurado de facturas y formularios: usando el modo `document parsing`, el modelo devuelve bloques con tokens de grounding, lo que permite localizar campos concretos (títulos, párrafos, listas) en documentos.
- Integración en pipelines de conversión de documentos con docling: la conversión está pensada como motor MLX para el preset `unlimited_ocr` de docling, por lo que puede sustituir a otros motores OCR en flujos de trabajo de documentación.
- Extracción de texto de capturas de pantalla y páginas web: el modo `Free OCR` permite obtener texto plano de imágenes, útil para automatizar la recogida de información visual.
- Automatización de archivos y búsqueda: procesar lotes de documentos digitalizados para indexarlos y hacerlos buscables, reduciendo la intervención manual.
- Accesibilidad: convertir documentos en imágenes a texto legible para lectores de pantalla, mejorando el acceso a la información para personas con discapacidad visual.
- Investigación y desarrollo: gracias a la licencia MIT y al formato MLX, el modelo es adecuado para experimentar con OCR en hardware de Apple y para desarrollar herramientas basadas en el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La verificación del autor incluye una comparación de similitud de texto de 1.000 frente a la referencia CUDA bf16, pero en un conjunto de una sola página sintética, por lo que no debe interpretarse como un benchmark de comprensión de documentos. También se midió un throughput de 45.7 tok/s y un pico de memoria de 5.15 GB en un Apple M4 de 16 GB.

## Requisitos de hardware

- VRAM estimada: 5.15 GB de memoria pico durante la verificación en Apple M4 (16 GB).
- GPU recomendadas: Apple Silicon (M4, 16 GB) para MLX. No se proporcionan recomendaciones para otras plataformas.
- Cabe en consumer GPU: sí, en Macs con Apple Silicon y 16 GB de RAM. No se especifica para GPUs de NVIDIA.
- Opciones de despliegue: mlx-vlm (librería de referencia). También se puede integrar en docling como motor MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 45.7 tok/s medido en Apple M4, con un pico de memoria de 5.15 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Plataforma | Tokenizer |
|---|---|---|---|---|
| baidu/Unlimited-OCR | 3.34B | bf16 | CUDA/transformers | Completo (830 added tokens) |
| majentik/Unlimited-OCR-MLX-6bit | no disponible | no disponible | no disponible | no disponible |
| wittjeff/unlimited-ocr-6bit-mlx | 3.34B | 6-bit en lenguaje, bf16 en visión | MLX | Completo (830 added tokens) |

Según la model card, existen 18 conversiones MLX de este modelo en el Hub, pero la mayoría presentan un tokenizer incompleto. Esta conversión se diferencia por restaurar el tokenizer completo y no incluir `chat_template`.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no documentado, pero en OCR puede haber errores de reconocimiento.
- Limitaciones de contexto: mlx-vlm ejecuta atención completa en lugar de la atención de ventana deslizante (R-SWA) del modelo de referencia, lo que puede diferir en entradas muy largas.
- El filtro `no_repeat_ngram_size` no está implementado en mlx-vlm, lo que puede causar bucles de repetición en el modo `Free OCR` con entradas largas (no reproducido en la página de prueba, pero el riesgo es real).
- El modo de resolución dinámica "Gundam" (cropped 640 px) no ha sido probado.
- La similitud de texto de 1.000 se obtuvo en un conjunto de referencia muy limitado (una página sintética), no es un benchmark de comprensión de documentos.
- Licencia MIT, pero los pesos son © Baidu; hay que mantener la atribución.

## Enlaces

- Modelo: https://huggingface.co/wittjeff/unlimited-ocr-6bit-mlx
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Repo de docling: https://github.com/docling-project/docling
- Issue de docling relacionado: https://github.com/docling-project/docling/issues/3943
- Repo GitHub de la conversión MLX: https://github.com/will702/unlimited-ocr-mlx
- Otra conversión MLX: https://huggingface.co/majentik/Unlimited-OCR-MLX-6bit
