# Yiriru/gemma-4-E2B-it-qat-GGUF

## Resumen

Yiriru/gemma-4-E2B-it-qat-GGUF es una conversión al formato GGUF del modelo google/gemma-4-E2B-it-qat-q4_0-unquantized, la variante instruida (it) de Gemma 4 E2B optimizada con Quantization-Aware Training (QAT) y publicada por Google DeepMind. La conversión, realizada por el usuario Yiriru y verificada contra la referencia de Unsloth, permite ejecutar el modelo en el ecosistema de llama.cpp, Ollama y herramientas compatibles con GGUF, con una calidad de pesos muy cercana al original en bfloat16 (99,81 % de concordancia BF16 y un error máximo absoluto de 0,00256).

Gemma 4 E2B es un modelo multimodal (texto e imagen de entrada, texto de salida) orientado a despliegue en dispositivos de borde: portátiles, móviles y GPUs de consumo. Emplea una arquitectura densa con mecanismo de atención híbrido (ventana deslizante local combinada con atención global) y un contexto de 128K tokens. La variante QAT Q4_0 reduce drásticamente los requisitos de memoria manteniendo una calidad similar a la de precisión completa, lo que lo hace especialmente relevante ahora que la inferencia local multimodal de bajo consumo está en plena expansión.

La licencia del modelo base es Apache 2.0 (según la model card de Google, con referencia a la documentación de licencia de Gemma 4), lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (sliding window + global) |
| Parametros totales | 2,3B efectivos (5,1B incluyendo embeddings); el repositorio indica 77.207.300 en safetensors (dato no representativo del modelo completo) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q4_0 (QAT); el modelo base también existe en BF16 sin cuantizar y en variantes wNa8o8 y w4a16 en la familia oficial |
| Idiomas soportados | Más de 140 idiomas (familia Gemma 4); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_0) |

## Arquitectura y entrenamiento

Gemma 4 E2B emplea un transformer denso de 35 capas con un mecanismo de atención híbrido que intercala capas de atención local por ventana deslizante (512 tokens) con capas de atención global completa, garantizando que la última capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales comparten claves y valores (unified KV) y aplican Proportional RoPE (p-RoPE). El vocabulario tiene un tamaño de 262.000 tokens (dato truncado en la model card, pero consistente con la familia Gemma).

La variante QAT (Quantization-Aware Training) se entrena simulando la cuantización Q4_0 durante el propio entrenamiento, de modo que el modelo cuantizado a 4 bits conserva una calidad muy próxima a la versión en bfloat16. Los datos concretos de entrenamiento del modelo base (numero de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada. La conversión a GGUF fue verificada por el autor con métricas de fidelidad: 99,81 % de concordancia BF16, 96,99 % de bloques perfectos, RMSE de 6,65e-05 y error máximo absoluto de 0,00256.

Una nota importante: si se usa decodificación especulativa con un modelo asistente, el asistente debe ser también un checkpoint QAT con la misma precisión para garantizar compatibilidad.

## Capacidades

- Generación de texto conversacional con soporte nativo del rol `system`, introducido en Gemma 4 para conversaciones más estructuradas y controlables.
- Comprensión multimodal de imagen con soporte de relación de aspecto y resolución variables (pipeline image-text-to-text).
- Soporte de audio de forma nativa en los modelos E2B, E4B y 12B de la familia (según la model card de Google).
- Razonamiento con modos de thinking configurables en toda la familia Gemma 4.
- Generación de codigo con mejoras destacadas en benchmarks de programación respecto a generaciones anteriores.
- Function calling / tool calling nativo, orientado a agentes autónomos y flujos multi-paso.
- Ventana de contexto de 128K tokens para documentos largos y conversaciones extensas.
- Soporte multilingüe en más de 140 idiomas.

## Casos de uso

- Asistentes locales en portátil: con la cuantización Q4_0 el modelo cabe en GPUs de consumo y en CPU con suficiente RAM, ideal para un asistente privado sin envío de datos a la nube.
- Atención al cliente automatizada: el soporte nativo del rol `system` y el contexto de 128K permiten gestionar conversaciones multi-turno con instrucciones persistentes y historiales largos.
- Descripción y consulta de imágenes en el borde: clasificación, extracción de texto de capturas o generación de descripciones de imágenes directamente en el dispositivo gracias al pipeline image-text-to-text.
- Agentes con tool calling: el function calling nativo permite integrarlo en pipelines de automatización (búsqueda web, ejecución de codigo, APIs internas) mediante llama.cpp o frameworks de agentes compatibles con GGUF.
- Generacion y revision de codigo offline: completado, refactorizacion y explicacion de codigo en un IDE local sin dependencia de servicios remotos.
- Procesamiento de documentos largos: resumen y pregunta-respuesta sobre documentos de hasta 128K tokens, viable en hardware de consumo gracias a la atención híbrida y la KV cache unificada.
- Prototipado rapido de aplicaciones multimodales: el formato GGUF facilita pruebas iterativas con Ollama o LM Studio antes de escalar a variantes mayores (E4B, 12B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion concreta. Para los resultados de la familia Gemma 4, consultar el informe tecnico enlazado en la seccion de enlaces.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 14,7 GB en GGUF Q4_0; con KV cache y overhead de runtime, se recomienda disponer de al menos 16 GB de VRAM o de RAM unificada equivalente. La variante QAT Q4_0 reduce significativamente la memoria respecto al modelo en BF16 (estimado en torno a 10 GB para los pesos completos en BF16, dato no confirmado).
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 4080/3090 para inferencia comoda; en Apple Silicon, Macs con 16 GB o mas de memoria unificada.
- Cabe en GPUs de consumo: si, en una RTX 4090 con holgura; en GPUs de 12 GB (RTX 3060/4070) puede quedar ajustado con contextos largos por el consumo de la KV cache; en CPU con 16-32 GB de RAM es viable a menor velocidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para vLLM con optimizaciones nativas se recomienda la variante compressed-tensors w4a16 oficial de Google en lugar de esta conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E2B it QAT (esta conversion) | 2,3B efectivos (5,1B con embeddings) | 128K | Imagen (y audio en la familia) | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 E4B it QAT | 4,5B efectivos (8B con embeddings) | 128K | Imagen y audio | Apache 2.0 | GGUF Q4_0, wNa8o8, w4a16 |
| Gemma 4 12B it QAT | 11,95B | 256K | Imagen y audio | Apache 2.0 | GGUF Q4_0, w4a16 |

Frente al E4B, el E2B ofrece la mitad de parametros efectivos y un consumo menor, a costa de capacidad de razonamiento y codigo; frente al 12B, duplica el contexto de este a la inversa (128K frente a 256K) pero con aproximadamente un quinto de los parametros, lo que lo situa como la opcion mas ligera de la familia para dispositivos de borde.

## Limitaciones y advertencias

- Se trata de una conversion de terceros (usuario Yiriru), no de un release oficial de Google; aunque las metricas de fidelidad son excelentes, para entornos de produccion criticos puede preferirse el GGUF oficial de la coleccion Gemma 4 QAT.
- El conteo de parametros de 77.207.300 en safetensors del repositorio no corresponde al tamano real del modelo (2,3B efectivos); puede inducir a error al automatizar descargas.
- Posible alucinacion tipica de modelos de lenguaje de tamano pequeno, especialmente en preguntas de conocimiento factual y matematicas complejas.
- El soporte de audio es una capacidad de la familia Gemma 4; su disponibilidad en esta conversion GGUF concreta no esta confirmada en la informacion proporcionada.
- La model card de Google referencia una licencia Apache 2.0 con enlace a la documentacion de licencia de Gemma 4; conviene revisar los terminos de uso de Gemma antes de despliegues comerciales a gran escala.
- Si se emplea decodificacion especulativa, el modelo asistente debe ser tambien un checkpoint QAT con la misma precision, lo que limita las combinaciones posibles.
- La informacion de benchmarks, latencia y composicion de datos de entrenamiento no esta disponible para esta conversion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yiriru/gemma-4-E2B-it-qat-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Coleccion oficial Gemma 4 QAT en Hugging Face: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion oficial: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Referencia de conversion (Unsloth): https://unsloth.ai/docs/models/gemma-4/qat
- Pagina de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
