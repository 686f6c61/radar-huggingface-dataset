# WhiskyAKM/LFM3-VL-2B-NVFP4-GGUF

## Resumen

LFM3-VL-2B es un modelo vision-lenguaje (image-text-to-text) de aproximadamente 2.000 millones de parámetros desarrollado por Liquid AI, construido sobre el backbone LFM3-1.7B Base. Está disenado para inferencia multimodal rápida y privada en dispositivo (on-device): acepta texto e imágenes y genera texto, con especial énfasis en comprensión de documentos y soporte multilingüe en 17 idiomas. Su arquitectura LFM3 es híbrida, combinando atención GQA con convoluciones cortas y atención de ventana deslizante en capas alternas.

El repositorio que nos ocupa, WhiskyAKM/LFM3-VL-2B-NVFP4-GGUF, es una conversión a formato GGUF con cuantización NVFP4 (formato de coma flotante de 4 bits de NVIDIA, E2M1) del modelo original, acompanada del proyector visual en BF16 (mmproj.gguf). El objetivo es permitir el despliegue del modelo en llama.cpp y motores compatibles con GGUF, reduciendo el peso del modelo de lenguaje a aproximadamente 1,0 GB y manteniendo una calidad cercana a bfloat16.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un VLM de 2B en hardware modesto, incluyendo aceleración específica en GPUs NVIDIA Blackwell mediante NVFP4. Es una opción interesante para prototipos de análisis documental, asistentes multimodales locales y pipelines de visión por computador con requisitos de privacidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (híbrida: atención GQA + convoluciones cortas; encoder visual CLIP-style + proyector LFM3-VL) |
| Parametros totales | 1.728.801.600 (dato real de safetensors); etiqueta comercial ~2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | NVFP4 (E2M1, 4 bits float) para el LM; BF16 para el proyector visual (mmproj.gguf) |
| Idiomas soportados | 17: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia propia de Liquid AI, etiquetada como "other") |
| Formato de pesos | GGUF (llama-cpp); el modelo base original en safetensors |
| Capas (LM) | 24 |
| Dimensión de embedding | 2.048 |
| Dimensión feed-forward | 7.680 |
| Cabezas de atención | 16 (GQA, 4 KV heads en capas de atención completa) |
| Ventana deslizante | 256 tokens (cada 4ª capa usa sliding-window attention) |
| Tamano de vocabulario | 128.000 |
| RoPE base | 1.000.000 (10.000 en capas de ventana deslizante) |
| Parametros del encoder visual | ~189M |
| Resolución de imagen | 512 × 512 por tile, parches de 16 px, 14 capas, embedding 1.024, proyección 2.048, fusión espacial 2×2 |
| Rango de píxeles por imagen | 65.536 – 16.777.216 (resolución variable) |
| Tamano del repo | 1,4 GB |
| Ficheros | lfm3-vl-2b-nvfp4.gguf (~1,0 GB), mmproj.gguf (~362 MB) |
| Libreria | llama-cpp |

## Arquitectura y entrenamiento

El modelo se apoya en el backbone LFM3-1.7B Base, una arquitectura híbrida que intercala capas con atención de tipo GQA (16 cabezas de consulta, 4 cabezas KV en capas de atención completa) y capas con convoluciones cortas, además de aplicar atención de ventana deslizante de 256 tokens en cada cuarta capa. La dimensión de embedding es 2.048, la dimensión feed-forward 7.680, con 24 capas y un vocabulario de 128.000 tokens. El contexto máximo declarado es de 128.000 tokens, con una base RoPE de 1.000.000 (10.000 en las capas de ventana deslizante), lo que permite manejar documentos extensos.

El componente visual es un encoder de estilo CLIP de aproximadamente 189 millones de parámetros, con 14 capas, embedding de 1.024 y proyección a 2.048 para alinear con el espacio del LM. Procesa imágenes en tiles de 512 × 512 con parches de 16 px, aplica una fusión espacial 2×2 y admite resolución variable entre 65.536 y 16.777.216 píxeles por imagen, lo que resulta adecuado para documentos de alta resolución. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos deben consultarse en la model card original de LiquidAI/LFM3-VL-2B.

La innovación destacable de esta conversión concreta es el uso de NVFP4, el formato de coma flotante de 4 bits de NVIDIA (E2M1), aplicado con cuantización basada en imatrix. Según el autor, preserva una calidad cercana a bfloat16 y se acelera en GPUs NVIDIA Blackwell a través de llama.cpp. El proyector visual se mantiene en BF16 para no degradar la calidad de la representación de imagen.

## Capacidades

- Generación de texto e inferencia multimodal: acepta entradas de texto e imagen y produce texto.
- Comprensión de documentos: tiling de resolución variable para documentos de alta resolución (hasta 16,7 M píxeles por imagen).
- Multilingüe: 17 idiomas, incluyendo espanol, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Conversación multi-turno: el pipeline declarado es image-text-to-text con etiqueta "conversational".
- Contexto largo: ventana de 128.000 tokens para documentos y conversaciones extensas.
- Inferencia en dispositivo: disenado para ejecución local con huella de memoria reducida (~1,0 GB el LM en NVFP4).
- Compatibilidad con API OpenAI: el despliegue mediante llama-server expone un endpoint compatible con OpenAI.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Análisis documental local: el modelo puede procesar imágenes de documentos de alta resolución gracias a su tiling de resolución variable (hasta 16,7 M píxeles) y su contexto de 128.000 tokens, extrayendo texto y respondiendo preguntas sobre el contenido sin enviar datos a la nube.
- Asistente multimodal en el borde: con ~1,0 GB en NVFP4, puede desplegarse en portátiles o estaciones de trabajo con GPU modesta para tareas de descripción de imágenes, respuesta visual a preguntas y conversación multi-turno.
- Digitalización y clasificación de facturas o formularios: el encoder visual de 14 capas y la fusión espacial 2×2 permiten interpretar layouts estructurados; el LM genera campos extraídos en formato texto.
- Accesibilidad: descripción automática de imágenes y lectura de documentos para usuarios con discapacidad visual, ejecutándose localmente por privacidad.
- Atención al cliente con soporte de imágenes: un chatbot que recibe capturas de pantalla o fotos de productos y responde en el idioma del usuario, aprovechando los 17 idiomas soportados.
- Prototipado rápido con llama.cpp: integración en pipelines de desarrollo mediante llama-server con API compatible con OpenAI, útil para validar ideas de producto antes de invertir en infraestructura mayor.
- Procesamiento por lotes en GPUs Blackwell: el formato NVFP4 se acelera en esta generación de GPUs, lo que permite throughput elevado en tareas de visión por computador a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB para el LM en NVFP4 más ~362 MB del proyector visual en BF16, con overhead adicional de contexto KV cache que crece con la longitud de contexto utilizada (hasta 128.000 tokens).
- GPU recomendadas: NVIDIA Blackwell (serie RTX 50, B200) para aprovechar la aceleración nativa de NVFP4 en llama.cpp; en GPUs sin soporte NVFP4 el formato puede ejecutarse con menor eficiencia o requerir conversión.
- Cabe en GPU consumer: sí, el peso del modelo (~1,4 GB total) es compatible con GPUs consumer de gama media con al menos 4-6 GB de VRAM, aunque la aceleración NVFP4 óptima requiere Blackwell.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y cualquier motor compatible con GGUF. No se mencionan vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de generación recomendados: temperature 0.1, top-k 50, top-p 1.0, min-p 0.0, repetition penalty 1.1 (almacenados en los metadatos del GGUF).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-VL-2B (NVFP4 GGUF, este repo) | ~1,73B (etiqueta 2B) | 128.000 | Texto + imagen | lfm1.0 | GGUF (NVFP4 + BF16 mmproj) |
| LiquidAI/LFM3-VL-2B (original) | ~1,73B | 128.000 | Texto + imagen | lfm1.0 | safetensors |
| Alternativas de ~2B VLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia lfm1.0: es una licencia propia de Liquid AI etiquetada como "other"; es imprescindible revisar los términos del fichero LICENSE del modelo base antes de cualquier uso comercial, ya que puede incluir restricciones específicas.
- Riesgo de alucinación: como todo modelo generativo de ~2B, puede producir contenido plausible pero incorrecto, especialmente en tareas de OCR o razonamiento complejo sobre documentos.
- Capacidad limitada por tamano: con ~1,73B de parámetros, su rendimiento en razonamiento abstracto, matemáticas y código será inferior al de modelos de mayor escala.
- Contexto efectivo: aunque declara 128.000 tokens, el uso de atención de ventana deslizante de 256 tokens en capas alternas puede degradar la recuperación de información muy distante en el contexto.
- Idiomas: aunque soporta 17 idiomas, la calidad puede variar notablemente entre ellos; el inglés es probablemente el mejor representado.
- Cuantización NVFP4: la aceleración depende de GPUs NVIDIA Blackwell; en hardware anterior el rendimiento puede no ser óptimo y la calidad puede diferir ligeramente del modelo original en BF16.
- Proyector visual obligatorio: sin mmproj.gguf el modelo no puede procesar imágenes, solo texto.
- Datos de entrenamiento no verificados: no se dispone de información sobre composición del dataset, sesgos conocidos ni técnicas de alineación (RLHF/DPO) en la información proporcionada.
- Repositorio con 0 descargas y 0 likes: es una conversión reciente y poco validada por la comunidad; conviene verificar la calidad de la cuantización antes de usarla en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WhiskyAKM/LFM3-VL-2B-NVFP4-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Backbone LFM3-1.7B Base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
