# Thox-ai/ThoxAir-0.5B

## Resumen

ThoxAir-0.5B es un modelo de generación de texto de 0,5 mil millones de parámetros desarrollado por Thox-ai (THOX.ai), construido mediante la fusión de un adaptador LoRA (fp-LoRA) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct de Alibaba. El modelo se presenta como el "flagship" de la línea ThoxAir, orientado a ejecución local y en dispositivos edge, con pesos abiertos bajo licencia Apache 2.0. Su entrenamiento se realizó con datos propios de ajuste supervisado (SFT) del dataset Thox-ai/thox-factory-sft-v5, con el objetivo declarado de incorporar "hechos canónicos de THOX" y el comportamiento de la casa en un modelo pequeño que pueda ejecutarse en cualquier parte.

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso (no MoE) con 494.032.768 parámetros totales según el archivo safetensors. El modelo se distribuye en tres formatos: safetensors en bf16, y dos cuantizaciones GGUF (Q4_K_M y Q8_0), además de un Modelfile para Ollama. Está pensado para inferencia en CPU y GPU de consumo, con un tamaño de repositorio de 2,0 GB.

La relevancia actual del modelo radica en su enfoque "local-first" y su integración con el ecosistema Ollama y llama.cpp, lo que facilita su despliegue en entornos con recursos limitados. Sin embargo, la información pública disponible es escasa en cuanto a benchmarks estándar y detalles técnicos de entrenamiento, y la model card contiene principalmente notas corporativas y de filosofía de la empresa, lo que limita la evaluación objetiva de sus capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5-0.5B-Instruct) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-0.5B-Instruct, típicamente 32.768 tokens, pero no confirmado en la card) |
| Tipos de cuantización | bf16 (safetensors), Q4_K_M (GGUF), Q8_0 (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso basado en Qwen2.5-0.5B-Instruct. No se trata de una arquitectura MoE ni híbrida; es un modelo denso de 0,5B parámetros. El proceso de construcción consistió en entrenar un adaptador LoRA (fp-LoRA) sobre el modelo base y posteriormente fusionarlo con `merge_and_unload` en precisión bf16, generando un modelo standalone. El adaptador se entrenó con datos de SFT propios (dataset Thox-ai/thox-factory-sft-v5), aunque no se especifica el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona una "Wave C.2" como fase de finalización y un conjunto de evaluación interno denominado GATE49, con una puntuación de 47/49 en el conjunto de desarrollo, pero no se detallan los criterios de evaluación ni los resultados por tarea.

No se documentan innovaciones técnicas destacables como decodificación especulativa, atención lineal u otras optimizaciones. El modelo se limita a heredar la arquitectura y el tokenizador de Qwen2.5-0.5B-Instruct, con un template de chat propio (`chat_template.jinja`). El entrenamiento se realizó en-house por THOX, pero no se proporcionan hiperparámetros, duración ni detalles del proceso de fusión más allá de la mención a `merge_and_unload`.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Incorporación de "hechos canónicos de THOX" y comportamiento específico de la casa, según la model card (no verificable externamente).
- Ejecución en dispositivos edge y entornos locales gracias a su tamaño reducido y cuantizaciones GGUF.
- Compatibilidad con Ollama mediante el Modelfile incluido.
- Compatibilidad con llama.cpp y servidores OpenAI-compatible a través de `llama serve`.
- No se documenta soporte explícito de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documenta soporte de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la etiqueta `language: en`.

## Casos de uso

- Asistente conversacional local en dispositivos de bajos recursos: el modelo puede ejecutarse en CPU o GPU integrada gracias a su cuantización Q4_K_M (aproximadamente 398 MB), lo que permite desplegar un chatbot en una Raspberry Pi o portátil sin GPU dedicada.
- Prototipado rápido de aplicaciones de chat: con Ollama (`ollama run Thox-ai/thoxair-0.5b`) se puede levantar un endpoint compatible con la API de OpenAI en minutos, ideal para pruebas de concepto y demos.
- Filtrado y clasificación de texto en el edge: su bajo coste de inferencia permite usarlo como primer nivel de procesamiento en pipelines de datos locales, aunque no se documenta fine-tuning para tareas específicas.
- Generación de respuestas en asistentes de atención al cliente con contexto limitado: adecuado para consultas simples y respuestas predefinidas, pero limitado por su ventana de contexto no confirmada y su entrenamiento en inglés.
- Educación y experimentación: sirve como modelo de referencia para estudiar el proceso de fusión de LoRA y el despliegue de modelos pequeños en entornos locales.
- Integración en aplicaciones de escritorio o móviles mediante llama.cpp: el formato GGUF Q4_K_M permite incrustar el modelo en aplicaciones nativas sin dependencias de nube.
- Evaluación de la metodología de THOX: útil para investigadores interesados en el enfoque de "hechos canónicos" y comportamiento de marca en modelos pequeños, aunque la documentación es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona una puntuación interna GATE49 de 47/49 en el conjunto de desarrollo, pero no se detallan las tareas evaluadas, el tamaño del conjunto ni la comparación con otros modelos. No se debe interpretar esta cifra como un benchmark comparable.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - bf16 (safetensors): aproximadamente 1 GB (988 MB de pesos + overhead).
  - Q8_0 (GGUF): aproximadamente 0,6 GB (531 MB).
  - Q4_K_M (GGUF): aproximadamente 0,4 GB (398 MB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bf16; para cuantizaciones GGUF puede ejecutarse en CPU sin GPU. GPU de consumo como GTX 1050, RTX 2060, RTX 3060 o superiores son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU.
- Opciones de despliegue: Ollama, llama.cpp (`llama serve`), transformers (con safetensors), y potencialmente TGI (text-generation-inference) según los tags, aunque no se documenta configuración específica.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, se espera una latencia baja en CPU y muy baja en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxAir-0.5B | 494M | No disponible | Apache 2.0 | safetensors, GGUF | Fine-tune de Qwen2.5-0.5B-Instruct con SFT propio |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base, ampliamente evaluado |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens (según documentación) | Apache 2.0 | safetensors, GGUF | Alternativa de Hugging Face para edge |
| TinyLlama-1.1B-Chat | 1.1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Modelo más grande, pero contexto menor |

La comparación se basa en datos públicos de los modelos alternativos; para ThoxAir-0.5B no se dispone de benchmarks que permitan una comparación de rendimiento objetiva. La principal diferencia es su entrenamiento específico con datos de THOX, que puede ser relevante para aplicaciones que requieran el comportamiento de marca, pero no hay evidencia pública de mejora frente al base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de Qwen2.5-0.5B-Instruct y entrenarse con datos propios, puede heredar sesgos del base y adquirir sesgos específicos del dataset de THOX.
- Riesgo de alucinación: inherente a modelos de 0,5B; la model card no proporciona métricas de fidelidad factual.
- Limitaciones de contexto o idioma: solo inglés según la etiqueta; la longitud de contexto no se confirma en la card (aunque el base soporta 32k, no se garantiza en este fine-tune).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribución. La model card incluye notas corporativas que no afectan a la licencia.
- Caveats para producción: la documentación es escasa en cuanto a evaluación, datos de entrenamiento y rendimiento; el modelo está orientado a "hechos canónicos de THOX", lo que puede limitar su utilidad general fuera de ese dominio. La puntuación GATE49 es interna y no verificable. No se recomienda para tareas que requieran razonamiento complejo, código o matemáticas sin una evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxAir-0.5B
- Adaptador LoRA (Wave C.2): https://huggingface.co/Thox-ai/ThoxAir-0.5B-WaveC2
- Repositorio de pesos fusionados (build record): https://huggingface.co/Thox-ai/ThoxAir-0.5B-WaveC2-Merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de SFT: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Ollama: `ollama run Thox-ai/thoxair-0.5b` (no se proporciona URL directa, pero el modelo está disponible en el registro de Ollama)
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
