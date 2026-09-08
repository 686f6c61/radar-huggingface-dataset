# trinityomnis/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

El modelo `trinityomnis/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF` es una cuantización GGUF del fine-tuning `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP`. Se trata de un modelo de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones), desarrollado por `trinityomnis` en colaboración con `Nightmedia`, mediante un proceso de ajuste fino multi-etapa y multi-modelo, seguido de una fusión y un proceso de ablación de censura denominado "Heretic'ing". El modelo está orientado a casos de uso generales, con especial énfasis en razonamiento, código, escritura creativa, ficción y roleplaying.

El modelo destaca porque, según la información proporcionada, supera 7 de 7 benchmarks críticos en comparación con los modelos `Qwen3.5-9B-Instruct`, `Qwen3.5-27B-Instruct` y `Qwen3.6-35B-A3B-Instruct`, y en algunos casos iguala a `Qwen3.6-27B-Instruct`, incluso en cuantizaciones de 4 y 8 bits. Ofrece una ventana de contexto de 256.000 tokens, está disponible en formato GGUF regular y MTP (multi-token prediction) con cuantizaciones NEO IMATRIX, y tiene la capacidad de visión activada mediante un archivo `mmproj` adicional. La licencia es Apache 2.0 y los idiomas soportados son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | GGUF regular y MTP, NEO IMATRIX; incluye Q4_K_S y otros quants; tensores de salida en 16 bits; tensores MTP en Q8_0 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base también está disponible en safetensors bfloat16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `Qwen3.5-9B`, que a su vez pertenece a la familia de modelos Qwen de Alibaba. El proceso de entrenamiento, según la model card, fue un "multi-stage and multi-model fine tune and multi-stage merge" realizado en hardware local por `trinityomnis` y `Nightmedia`. Se utilizaron varios ajustes finos previos del propio autor sobre el modelo base de 9B para construir el modelo final. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO.

Una característica técnica destacada es el proceso de "Heretic'ing", que se describe como un entrenamiento posterior a la abliteración de la censura, lo que resulta en un modelo completamente desinhibido. Además, el bloque de razonamiento ("thinking/reasoning block") fue compactado, lo que según el autor mejora su rendimiento en muchos casos. Los quants GGUF utilizan el método "NEO IMATRIX", que añade una mejora de precisión del 2-4 % sobre los GGUF estándar y mejora el rendimiento con contextos largos. Los tensores de salida se modificaron a precisión completa de 16 bits en todos los quants, y los tensores MTP se configuraron a Q8_0.

## Capacidades

- Generación de texto y razonamiento: modo "thinking" compactado y reforzado; el autor indica que en modo thinking el modelo supera las puntuaciones de los benchmarks en modo instruct.
- Generación de código: el modelo está etiquetado como "coder" y se sugieren parámetros específicos para tareas de programación precisas.
- Escritura creativa, ficción y roleplaying: etiquetado como "creative", "writing", "fiction" y "roleplaying", con soporte para contenido sin censura.
- Visión: la capacidad de visión está activada, pero requiere descargar un archivo `mmproj` adicional y colocarlo en la misma carpeta que el GGUF.
- Multilingüe: soporte nativo para inglés y chino.
- Instrucciones: el autor destaca una "superior instruction following" tras el ajuste fino.
- Sin censura: el modelo es "fully uncensored" y no rechaza peticiones, lo que lo hace adecuado para aplicaciones que requieren respuestas sin filtros.
- MTP (multi-token prediction): los quants MTP permiten predecir múltiples tokens a la vez, aumentando la velocidad de generación en ciertas condiciones (temperatura ≤ 1, repetición 1).

## Casos de uso

- Roleplay y ficción interactiva: gracias a su de-censura y su capacidad creativa, el modelo puede mantener personajes, tramas y diálogos largos sin rechazar temas sensibles, lo que lo hace ideal para juegos de rol y narrativa interactiva.
- Asistente de programación en local: con el modo thinking y los parámetros sugeridos para tareas de código (temperatura 0.6, top_p 0.95), puede asistir en desarrollo web y otras tareas de programación, ejecutándose en hardware de consumo mediante GGUF.
- Chat multilingüe: al soportar inglés y chino, puede utilizarse en aplicaciones de atención al cliente o chatbots bilingües, con una ventana de contexto de 256k que permite mantener conversaciones largas.
- Análisis de imágenes con visión local: con el archivo `mmproj` adicional, el modelo puede procesar imágenes, lo que permite casos de uso como descripción de imágenes, extracción de texto de capturas o análisis visual en entornos sin conexión.
- Prototipado de agentes de razonamiento: aunque no se documenta soporte explícito de tool calling, su modo thinking y su capacidad de razonamiento multi-paso permiten construir agentes que descompongan problemas complejos en pasos intermedios.
- Aplicaciones que requieren contenido sin censura: investigación académica sobre generación de texto sin filtros, escritura de ficción con temas delicados o simulación de diálogos en ámbitos donde los modelos censurados son insuficientes.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card del autor. Los valores corresponden a los benchmarks ARC-C, ARC-E, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande. Se presentan los resultados del modelo en bf16, mxfp8 y mxfp4, y se comparan con los modelos base en mxfp8.

| Modelo | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable (bf16) | 0.649 | 0.832 | 0.895 | 0.713 | 0.482 | 0.783 | 0.699 |
| Qwen3.5-9B-The-Defiant-Fable (mxfp8) | 0.647 | 0.836 | 0.895 | 0.706 | 0.460 | 0.784 | 0.695 |
| Qwen3.5-9B-The-Defiant-Fable (mxfp4) | 0.640 | 0.824 | 0.886 | 0.703 | 0.468 | 0.780 | 0.691 |
| Qwen3.5-9B-Instruct (base, mxfp8) | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.6-27B-Instruct (base, mxfp8) | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.6-35B-A3B-Instruct (base, mxfp8) | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |
| Qwen3.5-27B-Instruct (base, mxfp8) | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |

Nota: el autor indica que los modelos se probaron en modo "instruct" y que en modo "thinking" las puntuaciones suelen ser superiores. No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con una cuantización Q4_K_S, los pesos ocupan aproximadamente 5,5 GB, por lo que el modelo puede ejecutarse en GPUs de consumo con 8 GB o más. Para cuantizaciones de 8 bits, se estiman entre 9 y 10 GB de VRAM.
- GPU recomendada: el autor probó el modelo en una RTX 5090 con LM Studio, pero cualquier GPU moderna con al menos 8 GB de VRAM debería ser suficiente para 4 bits.
- Ejecución en GPU de consumo: sí, especialmente en cuantización 4 bits.
- Opciones de despliegue: LM Studio, llama.cpp, Ollama y otras aplicaciones compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con el sistema de Inference Endpoints de Hugging Face.
- Velocidad estimada: en una RTX 5090 con Windows 11 y LM Studio, los quants regulares Q4_K_S alcanzan aproximadamente 130 tokens/s, mientras que los quants MTP pueden superar 185 tokens/s con una tasa de aceptación del 60 %. Las velocidades reales varían según la GPU, el sistema operativo y la aplicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | ARC-C (mxfp8) | Winogrande (mxfp8) |
|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable (este modelo) | 8,95B | 256k | Apache 2.0 | 0.647 | 0.695 |
| Qwen3.5-9B-Instruct (base) | ~9B | no disponible | no disponible | 0.571 | 0.671 |
| Qwen3.6-27B-Instruct (base) | ~27B | no disponible | no disponible | 0.647 | 0.742 |
| Qwen3.6-35B-A3B-Instruct (base) | ~35B (3B activos) | no disponible | no disponible | 0.581 | 0.688 |
| Qwen3.5-27B-Instruct (base) | ~27B | no disponible | no disponible | 0.557 | 0.695 |

Según la model card, este modelo supera 7 de 7 benchmarks a los modelos Qwen3.5-9B-Instruct, Qwen3.5-27B-Instruct y Qwen3.6-35B-A3B-Instruct, y en algunos casos iguala a Qwen3.6-27B-Instruct. No se dispone de información sobre el contexto o la licencia de los modelos comparados.

## Limitaciones y advertencias

- Modelo sin censura: al ser un modelo "heretic" y "fully uncensored", puede generar contenido dañino, ilegal o socialmente inaceptable. Debe utilizarse con responsabilidad y en entornos controlados.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación; como todo modelo de lenguaje, puede generar información plausible pero incorrecta.
- Idiomas limitados: el soporte nativo se limita a inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- Contexto largo: aunque la ventana es de 256k tokens, el autor recomienda un mínimo de 8k a 16k para un rendimiento óptimo; con contextos muy largos puede haber degradación.
- Cuantizaciones MTP: el rendimiento de los quants MTP se degrada con temperaturas superiores a 1 o con penalizaciones de repetición distintas de 1. Si la tasa de aceptación de tokens es inferior al 50 %, se recomienda usar los quants regulares.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado por un modelo sin censura puede tener implicaciones legales y éticas según la jurisdicción.
- Tool calling: no se documenta soporte explícito de function calling en la información disponible.

## Enlaces

- Repo HuggingFace del modelo: https://huggingface.co/trinityomnis/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Repo GGUF del modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo relacionado mencionado en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
