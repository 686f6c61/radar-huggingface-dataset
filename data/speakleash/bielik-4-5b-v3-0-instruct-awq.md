# speakleash/Bielik-4.5B-v3.0-Instruct-AWQ

## Resumen

Bielik-4.5B-v3.0-Instruct-AWQ es una versión cuantizada en 4 bits mediante AWQ del modelo Bielik-4.5B-v3.0-Instruct, desarrollado por el consorcio polaco SpeakLeash. Se trata de un modelo de lenguaje de tipo transformer decoder-only con aproximadamente 4.757 millones de parámetros, especializado en el idioma polaco y ajustado para seguir instrucciones conversacionales. Su propósito principal es ofrecer una alternativa eficiente en memoria y latencia para desplegar un modelo de razonamiento y generación de texto en polaco sobre hardware con recursos limitados.

La relevancia de esta variante radica en su cuantización AWQ W4A16 asimétrica con tamaño de grupo 32, que reduce el peso del repositorio a unos 2,9 GB y permite la inferencia en GPUs de consumo. Al estar publicada bajo licencia Apache 2.0, puede integrarse en productos comerciales sin restricciones adicionales, algo poco habitual en modelos centrados en idiomas distintos del inglés.

El modelo base se distribuye como pesos safetensors con arquitectura Llama y está orientado a tareas de instrucción en polaco. La model card advierte explícitamente de que no todas las pruebas de calidad frente a BF16 se superaron, por lo que su uso en producción debe considerar una validación adicional de la degradación introducida por la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 4.757.260.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ 4-bit (W4A16_ASYM, group size 32) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama, un transformer decoder-only con atención causal estándar, según se desprende de la etiqueta `llama` del repositorio. Con 4.757 millones de parámetros, se sitúa en la gama media-baja de modelos de lenguaje, lo que facilita su despliegue. Esta variante concreta no ha sido reentrenada: es una exportación cuantizada del modelo base `speakleash/Bielik-4.5B-v3.0-Instruct`, revisión `4b1220a9d745bdd874c44347075ef25484ef322b`.

La cuantización aplicada es AWQ (Activation-aware Weight Quantization) en formato W4A16 asimétrico con tamaño de grupo 32, que cuantiza los pesos a 4 bits manteniendo las activaciones en 16 bits. La model card indica que los pesos son idénticos a la exportación parent de grupo 32 y que se empleó un perfil de validación denominado `legacy-v3-geo`, basado en etiquetas congeladas de capitales internacionales y ocho casos geográficos adicionales. No se dispone de información sobre la composición del dataset de entrenamiento del modelo base, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en polaco con ajuste a instrucciones conversacionales.
- Razonamiento y respuesta a preguntas en contextos multi-turno.
- Generación y explicación de código, presumiblemente en polaco e inglés, aunque no se detalla en la información disponible.
- Capacidades matemáticas básicas y resolución de problemas aritméticos, sin datos específicos de rendimiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al polaco según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Atención al cliente en polaco: el modelo puede gestionar conversaciones multi-turno con usuarios polacoparlantes en sectores como banca, telecomunicaciones o e-commerce, aprovechando su ajuste a instrucciones y su licencia Apache 2.0 para integración comercial.
- Asistentes virtuales embebidos en aplicaciones: su tamaño de 4,7B parámetros y su cuantización a 4 bits permiten desplegarlo en servidores modestos o incluso en estaciones de trabajo con una única GPU, reduciendo costes de infraestructura.
- Generación de contenido editorial en polaco: redacción de borradores, resúmenes y reescritura de textos para medios digitales o agencias de marketing que operen en el mercado polaco.
- Procesamiento de documentos administrativos: extracción de información y respuestas sobre formularios, normativas o contratos en polaco, con validación humana posterior dado el riesgo de alucinación.
- Educación y tutoría automatizada: generación de explicaciones y ejercicios en polaco para plataformas de aprendizaje, con la ventaja de un modelo ligero que puede ejecutarse on-premise para cumplir requisitos de privacidad.
- Prototipado rápido de aplicaciones NLP en polaco: investigadores y desarrolladores pueden validar ideas con un modelo de 2,9 GB de pesos antes de escalar a modelos mayores, gracias a su compatibilidad con el ecosistema safetensors y herramientas de cuantización.
- Traducción asistida polaco-inglés: aunque no está especializado en traducción, puede emplearse como borrador inicial en pipelines de traducción con revisión humana, especialmente en dominios generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que "no todas las pruebas de calidad se superaron frente a BF16", sin especificar métricas, tareas ni magnitudes de degradación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para los pesos cuantizados a 4 bits, más overhead de activaciones y caché KV (dependiente de la longitud de contexto, no disponible).
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), y frameworks compatibles con compressed-tensors y AWQ como AutoAWQ.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| Bielik-4.5B-v3.0-Instruct-AWQ | 4,76B | no disponible | pl | Apache 2.0 | AWQ 4-bit |
| Bielik-4.5B-v3.0-Instruct (BF16) | 4,76B | no disponible | pl | Apache 2.0 | BF16 |
| Bielik-11B-v2.3-Instruct | no disponible | no disponible | pl | no disponible | no disponible |
| Llama-3.2-3B-Instruct | 3,2B | 128K | multilingüe | Llama 3.2 Community License | no aplica (original) |

La comparación con Llama-3.2-3B-Instruct es relevante por tamaño y disponibilidad, aunque este último cubre más idiomas y tiene una licencia con restricciones comerciales. Frente a la versión BF16 del mismo Bielik, la variante AWQ reduce el peso del repositorio a 2,9 GB, a costa de una posible degradación de calidad no cuantificada en la información disponible.

## Limitaciones y advertencias

- La model card advierte explícitamente de que no todas las pruebas de calidad se superaron frente a la versión BF16, por lo que puede existir degradación en tareas específicas.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4,7B parámetros, especialmente en dominios especializados o con contexto limitado.
- Sesgos conocidos: no disponibles en la información proporcionada; se recomienda evaluar sesgos de género, políticos y culturales en el corpus polaco subyacente.
- Limitación idiomática: el modelo está etiquetado únicamente para polaco, por lo que su rendimiento en castellano u otros idiomas puede ser deficiente.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con ventanas largas.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks y de información sobre el dataset de entrenamiento limita la evaluación de riesgos en producción.
- El perfil de validación `legacy-v3-geo` es limitado (capitales y ocho casos geográficos) y no constituye una evaluación exhaustiva de la cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct-AWQ
- Modelo base: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
- Organización SpeakLeash: https://huggingface.co/speakleash
