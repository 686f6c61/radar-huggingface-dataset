# Team-PIXEL/mpixel-4s

## Resumen

MPIXEL-4s es un modelo de lenguaje multilingüe de tipo "pixel language model" desarrollado por Team-PIXEL, presentado en el artículo "Scaling Multilingual Pretraining of Pixel Language Models" (arXiv:2610.29681). A diferencia de los modelos basados en tokens subword, MPIXEL opera sobre texto renderizado visualmente como imagen, eliminando la necesidad de un tokenizador y permitiendo un tratamiento uniforme de distintos sistemas de escritura. Este checkpoint concreto, `mpixel-4s`, sigue la configuración de pixel-m4 y se entrena en cuatro idiomas (inglés, hindi, chino y ucraniano), pero alineando su renderizado de texto, embeddings posicionales rotatorios, fuente de datos y cantidad de datos por idioma con `mpixel-base` para eliminar factores de confusión en experimentos comparativos.

El modelo tiene 111.655.680 parámetros (aproximadamente 112M) y se distribuye en formato safetensors con licencia Apache 2.0. Forma parte de una familia más amplia que incluye `mpixel-base` (86M) y `mpixel-large` (307M), preentrenados en dieciséis idiomas que abarcan diez sistemas de escritura. La innovación principal es el renderizado adaptativo: el texto se representa como bigramas de grafemas por defecto, un carácter por parche para chino, japonés y coreano, y palabra por palabra para árabe y hebreo.

La relevancia de este checkpoint es fundamentalmente investigadora: sirve como punto de comparación controlado para aislar el efecto del renderizado y la configuración multilingüe frente a otros factores. No es un modelo generativo listo para producción, sino un encoder tipo ViT/MAE orientado a representaciones y experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) con preentrenamiento MAE, tokenization-free (pixel language model) |
| Parámetros totales | 111.655.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, uk, zh, hi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MPIXEL-4s es un encoder basado en Vision Transformer entrenado con el objetivo de masked autoencoding (MAE) sobre texto renderizado como imagen. El modelo no utiliza tokenizador: el texto se convierte en parches visuales mediante un esquema de renderizado adaptativo. Por defecto emplea bigramas de grafemas, mientras que para chino, japonés y coreano usa un carácter por parche y para árabe y hebreo una palabra por parche. Este checkpoint incorpora embeddings posicionales rotatorios y sigue la configuración de pixel-m4, pero con el renderizado, la fuente de datos y la cantidad de datos por idioma alineados con `mpixel-base`.

El preentrenamiento se realizó sobre los datasets HuggingFaceFW/fineweb y HuggingFaceFW/fineweb-2, en cuatro idiomas: inglés, hindi, chino y ucraniano. El número exacto de tokens de entrenamiento, la composición detallada del dataset y si hubo etapas de RLHF o DPO no están disponibles en la información proporcionada. La familia MPIXEL en su conjunto se preentrena en dieciséis idiomas y diez sistemas de escritura, pero este checkpoint concreto se limita a los cuatro idiomas indicados.

## Capacidades

- Codificación de texto renderizado como imagen sin tokenizador, produciendo representaciones contextuales (`last_hidden_state`).
- Procesamiento multilingüe de inglés, hindi, chino y ucraniano con un único esquema de representación visual.
- Manejo de múltiples sistemas de escritura mediante renderizado adaptativo (bigramas, carácter por parche, palabra por parche).
- Extracción de embeddings para tareas downstream (clasificación, similitud, retrieval) previo fine-tuning.
- No se han documentado capacidades de generación de texto, tool calling, razonamiento multi-paso ni agentes en la información disponible.
- No se han documentado capacidades de visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en tokenization-free NLP: usar el modelo como baseline para estudiar el impacto de eliminar el tokenizador subword en tareas multilingües, comparando directamente con `mpixel-base` gracias a la alineación de configuración.
- Clasificación de texto multilingüe: extraer embeddings del encoder y entrenar una cabeza de clasificación para inglés, hindi, chino o ucraniano, aprovechando el tratamiento uniforme de escrituras dispares.
- Análisis de sistemas de escritura de baja representación: evaluar cómo el renderizado adaptativo afecta al rendimiento en escrituras no latinas frente a modelos basados en tokens.
- Estudio de representaciones visuales del lenguaje: analizar qué información capturan los parches de texto renderizado mediante probing sobre `last_hidden_state`.
- Comparación controlada de factores de preentrenamiento: emplear el checkpoint para aislar variables (renderizado, datos, embeddings posicionales) en experimentos de ablación.
- Similitud semántica y retrieval multilingüe: generar embeddings de frases en los cuatro idiomas y evaluar recuperación cross-lingual tras fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 111,6M parámetros, en fp32 ocupa aproximadamente 0,45 GB de pesos; en fp16/bf16 unos 0,22 GB. La VRAM real depende del tamaño de lote y de la resolución de los parches de imagen, no disponible.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM es suficiente para inferencia en fp16; para entrenamiento o fine-tuning se recomiendan GPUs con 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: el modelo requiere el paquete `mpixel` (https://github.com/ilkerkesen/mpixel) junto con Transformers; no se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MPIXEL-4s | 111,6M | no disponible | en, uk, zh, hi | apache-2.0 | Pixel LM (MAE/ViT), tokenization-free |
| mpixel-base | 86M | no disponible | 16 idiomas / 10 escrituras | apache-2.0 | Pixel LM (MAE/ViT), tokenization-free |
| mpixel-large | 307M | no disponible | 16 idiomas / 10 escrituras | apache-2.0 | Pixel LM (MAE/ViT), tokenization-free |
| pixel-m4 | no disponible | no disponible | en, hi, zh, uk | no disponible | Pixel LM, configuración de referencia |

Los tres modelos de la familia MPIXEL comparten arquitectura y licencia; `mpixel-4s` se distingue por su alineación controlada con `mpixel-base` en renderizado, datos y embeddings posicionales, lo que lo hace adecuado para experimentos de ablación más que para uso general.

## Limitaciones y advertencias

- Modelo encoder preentrenado con MAE, no un modelo generativo: no produce texto de forma nativa.
- Solo cubre cuatro idiomas (en, uk, zh, hi); no se ha documentado rendimiento fuera de ellos.
- No hay datos publicados de benchmarks ni de rendimiento downstream, por lo que su calidad real en tareas concretas es desconocida.
- Requiere dependencias específicas (paquete `mpixel`) y no es compatible de forma directa con stacks de despliegue estándar como vLLM u Ollama.
- Riesgo de sesgos heredados de los datasets FineWeb y FineWeb-2, no cuantificado en la información disponible.
- Riesgo de alucinación no aplicable directamente al no ser generativo, pero sí riesgo de representaciones poco fiables en dominios alejados del preentrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está orientado a investigación; no se han documentado garantías de robustez en producción.
- La resolución de imagen, el tamaño de parche y la longitud máxima de secuencia no están disponibles, lo que limita la planificación de despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/Team-PIXEL/mpixel-4s
- Repositorio del paquete `mpixel`: https://github.com/ilkerkesen/mpixel
- Artículo (arXiv): https://arxiv.org/abs/2610.29681
- Paper pixel-m4 (EMNLP 2025): https://aclanthology.org/2025.emnlp-main.1504/
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
