# tencent/WeMM-Ecom-35B-A3B-GGUF

## Resumen

WeMM-Ecom-35B-A3B-GGUF es la edición cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-35B-A3B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el ámbito del comercio electrónico de WeChat. El modelo parte de una arquitectura Mixture of Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos dispersos de gran tamaño pero con coste de inferencia contenido. Es un modelo image-text-to-text que combina pesos de lenguaje cuantizados en Q4_K_M con un proyector multimodal en F16, pensado para desplegarse con llama.cpp.

El modelo resuelve el problema de entender y razonar sobre contenido visual y textual propio del comercio electrónico: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento y conocimiento de producto. Según la model card, supera a Qwen3.5-35B-A3B en 3,92 puntos, a Qwen3.6-35B-A3B en 3,36 puntos y a MiniCPM-V-4.7-35B-A3B en 8,22 puntos en la media de benchmarks de comercio electrónico, manteniendo a la vez capacidades generales comparables a modelos del mismo tamaño.

Su relevancia actual radica en que ofrece un contexto de 262.144 tokens, soporte de modo híbrido de razonamiento (thinking e instruct) y una licencia Apache 2.0 permisiva, todo ello en un formato GGUF que facilita el despliegue local y en servidores compatibles con OpenAI. El repositorio ocupa 22,1 GB e incluye tanto el GGUF del modelo de lenguaje como el proyector multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal, familia qwen3_5_moe |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3.000 millones (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) + F16 (proyector multimodal) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

WeMM-Ecom-35B-A3B emplea una arquitectura de tipo Mixture of Experts con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional de la inferencia frente a un modelo denso del mismo tamaño. El modelo es multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text) mediante un proyector multimodal separado que, en esta edición GGUF, se distribuye en precisión F16. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, aunque sí indica que el entrenamiento está orientado al dominio del comercio electrónico de WeChat y que el modelo conserva capacidades generales.

El modelo soporta un modo híbrido de razonamiento (thinking e instruct), lo que permite alternar entre respuestas directas y cadenas de razonamiento extendidas. La información disponible no especifica si se aplicaron técnicas de RLHF o DPO, ni detalla innovaciones de atención o decodificación especulativa. La cuantización Q4_K_M del modelo de lenguaje y el proyector F16 están calibrados para funcionar con una revisión concreta de llama.cpp, lo que sugiere un proceso de validación específico para el despliegue en ese runtime.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y texto.
- Comprensión de contenido de comercio electrónico: atributos de producto, moderación, OCR, recuperación, grounding y conocimiento de producto.
- Modo de razonamiento híbrido: alternancia entre modo instruct y modo thinking.
- Capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen y seguimiento de instrucciones.
- Procesamiento de imágenes y vídeo (la guía de inicio rápido menciona rutas locales de imagen y vídeo).
- Soporte multilingüe limitado a chino e inglés.
- Despliegue mediante llama.cpp con CLI y servidor local compatible con la API de OpenAI.
- No se dispone de información sobre soporte de tool calling o function calling en la documentación proporcionada.

## Casos de uso

- Moderación de contenido en marketplaces: el modelo puede analizar imágenes y texto de anuncios para detectar contenido inapropiado o fraudulento, apoyándose en sus benchmarks específicos de moderación y en su contexto de 262.144 tokens para revisar lotes grandes de publicaciones.
- Extracción de atributos de producto: a partir de fotos de producto y descripciones, el modelo puede identificar categoría, color, material y otras características, lo que resulta útil para normalizar catálogos y mejorar la búsqueda.
- OCR y digitalización de fichas de producto: el modelo puede leer texto incrustado en imágenes (etiquetas, embalajes, capturas) y convertirlo en datos estructurados, una capacidad alineada con los benchmarks de OCR del modelo.
- Asistencia al comprador en conversaciones multi-turno: con 262.144 tokens de contexto, puede gestionar diálogos largos con historial de productos, imágenes adjuntas y preferencias del usuario, respondiendo en chino o inglés.
- Grounding y recuperación visual en catálogos: el modelo puede localizar y relacionar elementos visuales con descripciones textuales, útil para sistemas de búsqueda visual y recomendación dentro de un marketplace.
- Razonamiento sobre conocimiento de producto: puede responder preguntas técnicas sobre productos (compatibilidades, especificaciones, uso) combinando texto e imágenes, adecuado para asistentes de posventa.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF y ejecutarse con llama.cpp, puede desplegarse en infraestructura propia sin depender de servicios en la nube, lo que facilita el cumplimiento de políticas de datos.

## Benchmarks y rendimiento

La model card incluye comparaciones en 28 benchmarks de comercio electrónico (ocho escenarios) y 64 benchmarks generales (ocho categorías), con puntuaciones en escala 0-100, pero los resultados se presentan como imágenes y tablas no transcritas en el texto disponible. Los datos numéricos agregados que sí se indican son los siguientes:

| Comparación | Diferencia en media de benchmarks de e-commerce | Diferencia en media de benchmarks generales |
|---|---|---|
| Frente a Qwen3.5-35B-A3B | +3,92 puntos | +0,17 puntos |
| Frente a Qwen3.6-35B-A3B | +3,36 puntos | No disponible |
| Frente a MiniCPM-V-4.7-35B-A3B | +8,22 puntos | +5,60 puntos |
| Frente a Valley3-32B | No disponible | +9,13 puntos |

No se han publicado en la información disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K u otros), por lo que no se incluyen cifras concretas de esas pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 22,1 GB, por lo que se necesita al menos esa cantidad de memoria (GPU o combinación de GPU y RAM) para cargar los pesos Q4_K_M más el proyector F16; se recomienda margen adicional para el contexto largo.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el tamaño del archivo, tarjetas con 24 GB o más de VRAM (por ejemplo, RTX 4090, A100, H100) son candidatas razonables, aunque esta apreciación no está confirmada por el autor.
- ¿Cabe en GPU de consumo? Con 22,1 GB de pesos, una GPU de 24 GB podría alojarlo, aunque el contexto de 262.144 tokens y el proyector multimodal añaden consumo de memoria; no hay datos oficiales de ajuste exacto.
- Opciones de despliegue: llama.cpp (compilación con CUDA o CPU), con `llama-cli` y `llama-server` (servidor compatible con OpenAI). La model card fija una revisión concreta de llama.cpp (`a8f8294c45076538f4509754e4c79fc51a1a486b`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B-GGUF | 34,66B totales, ~3B activos | 262.144 | Apache 2.0 | GGUF (Q4_K_M + F16) | Especializado en e-commerce, multimodal |
| Qwen3.5-35B-A3B | 35B (MoE) | No disponible | No disponible | No disponible | Referencia de comparación en la model card |
| Qwen3.6-35B-A3B | 35B (MoE) | No disponible | No disponible | No disponible | Referencia de comparación en la model card |
| MiniCPM-V-4.7-35B-A3B | 35B (MoE) | No disponible | No disponible | No disponible | Referencia de comparación en la model card |
| Valley3-32B | 32B | No disponible | No disponible | No disponible | Referencia de comparación en la model card |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; solo se conocen las diferencias de puntuación agregada indicadas en la sección de benchmarks.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Dominio: el modelo está optimizado para comercio electrónico; su comportamiento fuera de ese dominio puede ser menos fiable pese a mantener capacidades generales.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos de una plataforma concreta, puede heredar sesgos de ese corpus.
- Alucinación: no se proporcionan métricas de tasa de alucinación; como modelo generativo multimodal, existe riesgo de inventar atributos o detalles de producto.
- Contexto: aunque la ventana es de 262.144 tokens, no se documenta el rendimiento real en contextos extremos ni el coste de memoria asociado.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento, no detalladas.
- Despliegue: requiere una revisión concreta de llama.cpp; otras versiones pueden no ser compatibles con el proyector multimodal.
- Cuantización: la edición GGUF usa Q4_K_M, lo que puede degradar ligeramente la precisión frente al checkpoint BF16; no se han publicado comparativas de rendimiento GGUF frente a BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Versión FP8: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-FP8
- Versión GPTQ: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Familia GGUF 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Familia GGUF 2B: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Familia GGUF 4B: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Familia GGUF 9B: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
