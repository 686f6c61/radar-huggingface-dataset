# Yiriru/gemma-4-26B-A4B-it-qat-GGUF

## Resumen

Esta ficha corresponde a una conversión a formato GGUF de **Gemma 4 26B A4B (QAT)**, un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4. La conversión ha sido publicada por el usuario Yiriru en Hugging Face y parte del checkpoint oficial `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`. El sufijo "A4B" indica que se trata de una variante Mixture-of-Experts (MoE) con aproximadamente 4 mil millones de parámetros activos por token, mientras que el sufijo "QAT" hace referencia a Quantization-Aware Training: el modelo se ha entrenado teniendo en cuenta la cuantización Q4_0, lo que permite reducir drásticamente los requisitos de memoria manteniendo una calidad muy cercana a la de los pesos en bfloat16.

El propósito de este repositorio es facilitar el despliegue del modelo en el ecosistema de inferencia basado en GGUF (llama.cpp, Ollama, LM Studio y derivados), sin depender de los formatos propietarios de Google. El autor ha verificado la fidelidad de la conversión con métricas objetivas: un 99,95 % de concordancia en BF16 respecto a la conversión de referencia de Unsloth y un error cuadrático medio (MSE) de 1,26e-09 en los pesos.

Como el resto de la familia Gemma 4, el modelo acepta entrada de texto e imagen y genera texto, soporta una ventana de contexto de hasta 256K tokens, más de 140 idiomas, modos de razonamiento configurables y function calling nativo, lo que lo hace relevante para casos de uso agénticos y de generación de código en hardware de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención híbrida (sliding window + global) |
| Parametros totales | 26B (según denominación del modelo); el repo safetensors base reporta 419.711.492 parámetros (dato probablemente correspondiente a un subconjunto o adapter, no disponible con certeza) |
| Parametros activos | ~4B (indicado por la denominación "A4B") |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q4_0 (QAT, quantization-aware training); el checkpoint base también existe en formato no cuantizado Q4_0-unquantized (pesos half-precision extraídos del pipeline QAT) |
| Idiomas soportados | Más de 140 idiomas (según la familia Gemma 4); lista exacta no disponible |
| Licencia | Apache 2.0 (con enlace a la Gemma License de Google en la model card) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Gemma 4 26B A4B emplea una arquitectura Mixture-of-Experts que activa aproximadamente 4B de parámetros por token de un total de 26B, lo que reduce el coste de inferencia manteniendo la capacidad de un modelo mucho mayor. La atención es híbrida: intercala capas de atención local con ventana deslizante (sliding window) y capas de atención global, garantizando que la última capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales utilizan claves y valores unificados (unified KV) y aplican Proportional RoPE (p-RoPE).

La variante QAT (Quantization-Aware Training) se entrena simulando la cuantización Q4_0 durante el propio entrenamiento, de modo que el modelo cuantizado conserva una calidad similar a la de los pesos en bfloat16. Google publica cuatro formatos QAT: checkpoints no cuantizados (Q4_0-unquantized), GGUF (Q4_0), esquema móvil (wNa8o8) y compressed-tensors (w4a16) para vLLM. Los datos concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada; el technical report enlazado (arXiv:2607.02770) es la referencia correspondiente.

Una nota relevante para despliegue: si se usa decodificación especulativa (multi-token prediction) con un modelo asistente, el asistente debe ser también un checkpoint QAT con la misma precisión para garantizar compatibilidad.

## Capacidades

- Generación de texto conversacional con soporte nativo del rol `system`, lo que permite conversaciones más estructuradas y controlables.
- Comprensión multimodal de texto e imagen, con soporte de relación de aspecto y resolución variables; el pipeline del repo es image-text-to-text.
- Razonamiento avanzado con modos de thinking configurables (configurable thinking modes).
- Generación de código con mejoras destacadas en benchmarks de programación respecto a generaciones anteriores.
- Function calling / tool calling nativo, orientado a agentes autónomos y flujos multi-paso.
- Ventana de contexto de 256K tokens para tareas de documento largo.
- Soporte multilingüe en más de 140 idiomas.
- Compatibilidad con decodificación especulativa mediante modelos asistentes QAT (con la restricción de precisión indicada).
- Nota: el audio y el vídeo son capacidades de la familia Gemma 4 (audio nativo en E2B, E4B y 12B), pero para esta variante 26B A4B la model card indica entrada de texto e imagen; soporte de audio en este tamaño concreto: no disponible.

## Casos de uso

- **Asistentes conversacionales multimodales**: el modelo puede responder preguntas sobre imágenes (capturas de pantalla, documentos escaneados, gráficos) combinadas con instrucciones en texto, con soporte nativo de system prompt para definir el comportamiento del asistente.
- **Agentes autónomos con tool calling**: el function calling nativo permite integrarlo en frameworks de agentes que invocan APIs, ejecutan herramientas y encadenan pasos de razonamiento multi-turno.
- **Análisis de documentos largos**: con 256K tokens de contexto, puede procesar contratos, informes técnicos o bases de código extensas en una sola pasada, gracias a la atención híbrida que reduce el coste de memoria en contexto largo.
- **Generación y revisión de código**: adecuado para asistentes de programación locales que necesitan razonamiento sobre repositorios completos y generación de parches, sin enviar código a servicios externos.
- **Despliegue local en estaciones de trabajo**: al ser un MoE con ~4B de parámetros activos y pesos QAT Q4_0, ofrece latencias bajas para su tamaño total, siendo viable en GPUs de gama alta de consumo y workstations.
- **Razonamiento configurable para tareas complejas**: el modo thinking puede activarse para problemas de matemáticas, lógica o planificación, y desactivarse para respuestas rápidas en tareas sencillas.
- **Aplicaciones multilingües**: soporte de más de 140 idiomas para chatbots de atención al cliente o traducción asistida en entornos empresariales.
- **Investigación sobre cuantización**: el checkpoint QAT Q4_0-unquantized de base sirve para estudiar el impacto de la cuantización consciente de entrenamiento frente a la cuantización post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras notables en benchmarks de código y razonamiento respecto a generaciones anteriores, pero sin cifras concretas. La única métrica cuantitativa disponible es la verificación de fidelidad de la conversión GGUF realizada por el autor:

| Métrica de conversión | Valor |
|---|---|
| Concordancia BF16 | 99,955481 % (25.210.399.415/25.221.627.904) |
| Bloques perfectos | 98,883596 % (779.376.643/788.175.872) |
| SSE de pesos | 31,8768308 |
| MSE de pesos | 1,26386889e-09 |
| RMSE de pesos | 3,55509337e-05 |
| Error cuadrático normalizado | 1,87311436e-06 |
| Error absoluto máximo | 0,00128173828 |

## Requisitos de hardware

- **VRAM estimada**: con un tamaño de repo de 69,1 GB en GGUF Q4_0 para 26B de parámetros totales, se recomienda disponer de al menos 72-80 GB de VRAM para alojar el modelo completo con margen para la KV cache; no disponible un dato oficial exacto.
- **GPUs recomendadas**: NVIDIA A100 (80 GB) o H100 para despliegue en servidor; en hardware de consumo, configuraciones multi-GPU (por ejemplo, 2x RTX 3090/4090 con 48 GB combinados) podrían quedar justas para el modelo completo, especialmente con contextos largos.
- **Consumer GPUs**: no cabe cómodamente en una única GPU de consumo (24 GB) dada la cuantización Q4_0 y los 26B de parámetros totales; se requiere multi-GPU o descarga parcial de capas a RAM (offloading), con penalización de velocidad.
- **Opciones de despliegue**: llama.cpp (formato GGUF nativo), Ollama, LM Studio y cualquier runtime compatible con GGUF. El ecosistema oficial de Google ofrece además vLLM mediante checkpoints compressed-tensors (w4a16), aunque esa variante no es este repositorio.
- **Latencia y throughput**: al activar solo ~4B de parámetros por token (MoE), la velocidad de generación debería aproximarse a la de un modelo denso de 4B una vez cargado; no hay mediciones publicadas disponibles.
- **Decodificación especulativa**: posible con modelos asistentes QAT de la familia (drafter models), con la restricción de que el asistente debe compartir la misma precisión QAT.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Gemma 4 26B A4B QAT (este repo) | MoE | 26B | ~4B | 256K | Apache 2.0 / Gemma License | GGUF (Q4_0) |
| Gemma 4 31B Dense QAT | Denso | 30,7B | 30,7B | 256K | Apache 2.0 / Gemma License | GGUF, compressed-tensors, QAT unquantized |
| Gemma 4 12B Unified QAT | Denso | 11,95B | 11,95B | 256K | Apache 2.0 / Gemma License | GGUF, QAT unquantized, mobile (según familia) |

La comparativa se limita a modelos de la misma familia, ya que no hay información suficiente sobre alternativas de otros fabricantes de tamaño y tarea equivalentes en los datos proporcionados. Frente al 31B denso, el 26B A4B ofrece inferencia más rápida por token al activar solo ~4B parámetros, a costa de una capacidad total menor; frente al 12B, ofrece mayor capacidad manteniendo el mismo contexto de 256K.

## Limitaciones y advertencias

- **Licencia ambigua**: el repo declara Apache 2.0 pero enlaza la Gemma License de Google (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los términos de la Gemma License antes de cualquier uso comercial, ya que pueden imponer restricciones adicionales de uso aceptable y de atribución.
- **Conversión de terceros**: este GGUF no es una publicación oficial de Google, sino una reproducción comunitaria (basada en la guía de Unsloth, realizada con Codex CLI). Aunque las métricas de fidelidad son excelentes, difiere mínimamente de la conversión de referencia.
- **Dato de parámetros inconsistente**: los safetensors del repo reportan 419,7M de parámetros, cifra que no coincide con los 26B esperados; probablemente corresponde a un subconjunto del repositorio o a un componente auxiliar. Verificar antes de usar en producción.
- **Alucinaciones**: como todo modelo de lenguaje, puede generar contenido incorrecto con apariencia plausible, especialmente en dominios especializados; no hay datos publicados sobre tasas de alucinación.
- **Sesgos**: no disponible información específica sobre sesgos para Gemma 4; al ser un modelo entrenado por Google DeepMind, heredará los sesgos de sus datos de entrenamiento.
- **Audio no confirmado en este tamaño**: el audio es nativo en E2B, E4B y 12B; su soporte en la variante 26B A4B no está disponible en la información proporcionada.
- **Requisito de hardware elevado**: con 69,1 GB en Q4_0, el despliegue en una sola GPU de consumo no es viable, lo que limita su uso frente a variantes más pequeñas de la familia.
- **Decodificación especulativa restringida**: el modelo asistente debe ser un checkpoint QAT con la misma precisión, lo que limita las combinaciones posibles.
- **Idiomas**: se anuncian más de 140 idiomas a nivel de familia, pero el rendimiento específico por idioma (incluido el castellano) no está documentado en la información disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yiriru/gemma-4-26B-A4B-it-qat-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Colección oficial Gemma 4 QAT en Hugging Face: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento (QAT Gemma 4): https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación oficial: https://ai.google.dev/gemma/docs/core
- Technical report (arXiv): https://arxiv.org/abs/2607.02770
- Gemma License: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de referencia de la conversión (Unsloth, Gemma 4 QAT): https://unsloth.ai/docs/models/gemma-4/qat
- Página de Google DeepMind sobre Gemma: https://deepmind.google/models/gemma/
