# tinyopsec/MiniCPM5-2B-Pashto-GGUF

## Resumen

MiniCPM5-2B-Pashto-GGUF es una colección de cuantizaciones en formato GGUF del modelo nassimjp/MiniCPM5-2B-Pashto, que a su vez deriva del MiniCPM5-2B de OpenBMB. El modelo base incorpora una modificación del tokenizador ("tokenizer surgery") que añade 46 átomos (tokens) específicos para pastún y urdu, con el objetivo de mejorar la eficiencia de codificación de estos idiomas de bajos recursos. Esta versión GGUF, publicada por el usuario tinyopsec, permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y runtimes compatibles.

El modelo cuenta con 2.516.944.896 parámetros totales (aproximadamente 2,5 mil millones), una arquitectura transformer de tipo Llama y licencia Apache 2.0. El repositorio ocupa 24,6 GB e incluye 13 archivos de cuantización que van desde F16 (5,0 GB) hasta Q2_K. La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo especializado en pastún y urdu en hardware de consumo, algo poco habitual en el ecosistema open source.

Es importante señalar que, según la propia model card, el modelo no ha sido afinado con datos en pastún o urdu: la modificación se limita al tokenizador. Por tanto, las capacidades lingüísticas reales en esos idiomas deben evaluarse empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (MiniCPM5-2B) |
| Parametros totales | 2.516.944.896 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (el modelo base está orientado a pastún y urdu mediante tokenizer surgery) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de MiniCPM5-2B de OpenBMB, un transformer denso de tipo Llama con aproximadamente 2,5 mil millones de parámetros. La innovación principal de esta variante es la "tokenizer surgery": se han añadido 46 átomos (tokens) específicos para pastún y urdu al vocabulario original, lo que reduce el número de tokens necesarios para codificar texto en estos idiomas y, en teoría, mejora la eficiencia y la calidad de la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La model card indica explícitamente que el modelo no ha sido afinado con datos en pastún o urdu, por lo que la modificación del tokenizador no va acompañada de un entrenamiento específico en esos idiomas. Las cuantizaciones GGUF se generaron con llama.cpp.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta "conversational".
- Codificación eficiente de texto en pastún y urdu gracias a los 46 tokens añadidos al tokenizador.
- Ejecución en runtimes compatibles con GGUF: llama.cpp, Ollama, LM Studio, koboldcpp, entre otros.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües generales: no disponibles; el foco declarado son pastún y urdu.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Traducción y generación de texto en pastún y urdu en entornos con hardware limitado: el modelo puede ejecutarse en CPU o GPU de gama media gracias a las cuantizaciones Q4_K_M y Q5_K_M, lo que lo hace adecuado para prototipos de traducción o asistentes lingüísticos en estos idiomas.
- Despliegue en dispositivos de borde (edge): con cuantizaciones Q3_K_S o Q2_K, el modelo puede caber en dispositivos con poca memoria, permitiendo aplicaciones de procesamiento de lenguaje natural offline en regiones con conectividad limitada.
- Chatbots conversacionales de bajo coste: la etiqueta "conversational" y el tamaño de 2,5B permiten integrar el modelo en sistemas de atención al cliente o asistentes virtuales para comunidades pastún-parlantes, siempre que se valide su calidad real.
- Investigación en tokenización de lenguas de bajos recursos: el modelo sirve como caso de estudio para evaluar el impacto de la tokenizer surgery en la eficiencia de codificación y la calidad de generación en pastún y urdu.
- Pruebas de integración con llama.cpp y Ollama: útil para desarrolladores que quieran validar pipelines de inferencia GGUF con modelos multilingües de tamaño reducido.
- Generación de contenido educativo o periodístico en pastún/urdu: con la debida revisión humana, puede asistir en la redacción de borradores o resúmenes en estos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - F16: ~5,0 GB
  - Q8_0: ~2,7 GB
  - Q6_K: ~2,1 GB
  - Q5_K_M: ~1,8 GB
  - Q4_K_M: ~1,5 GB (recomendado)
  - Q3_K_M: ~1,2 GB
  - Q2_K: ~0,9 GB
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, así como en Apple Silicon.
- Cabe en GPU de consumo: sí, especialmente con cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Pashto-GGUF | 2,5B | No disponible | Apache 2.0 | GGUF | Tokenizer surgery para pastún/urdu; sin fine-tuning |
| openbmb/MiniCPM5-2B | 2,5B | No disponible | Apache 2.0 | Safetensors | Modelo base original, sin modificación de tokenizador |
| nassimjp/MiniCPM5-2B-Pashto | 2,5B | No disponible | Apache 2.0 | Safetensors | Modelo base con tokenizer surgery, sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido afinado con datos en pastún o urdu; la modificación se limita al tokenizador, por lo que la calidad de generación en esos idiomas puede ser limitada y debe evaluarse antes de usarlo.
- Riesgo de alucinación inherente a los modelos de lenguaje de 2,5B parámetros, especialmente en tareas de conocimiento factual.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original (openbmb/MiniCPM5-2B).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de generación.
- La model card advierte explícitamente: "Tokenizer-modified model; not finetuned on Pashto/Urdu data. Evaluate before use."

## Enlaces

- Hugging Face: https://huggingface.co/tinyopsec/MiniCPM5-2B-Pashto-GGUF
- Modelo base (safetensors): https://huggingface.co/nassimjp/MiniCPM5-2B-Pashto
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-2B
