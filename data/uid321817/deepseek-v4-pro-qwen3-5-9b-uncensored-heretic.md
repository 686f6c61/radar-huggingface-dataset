# uid321817/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una versión "decensored" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". El autor de esta variante es el usuario uid321817, que ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24.

El modelo base se centra en razonamiento estructurado y resolución de problemas matemáticos y STEM, entrenado con aproximadamente 250.000 muestras supervisadas. Conserva la arquitectura transformer densa de Qwen3.5-9B con 9.409.813.744 parámetros totales, y mantiene las capacidades de tool calling, function calling y razonamiento multi-paso del modelo original, además de soporte multimodal image-text-to-text según los tags del repositorio.

La relevancia de esta variante concreta radica en su propósito: reducir drásticamente las negativas del modelo (de 100/100 rechazos en el original a 3/100 en esta versión) con una divergencia KL de 0.0422 respecto al modelo base, lo que indica un cambio moderado en la distribución de salida. Está publicada bajo licencia Apache 2.0 y soporta seis idiomas: inglés, chino, coreano, japonés, español y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con soporte multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; existe version GGUF publicada por mradermacher (incluye MTP-Q8_0 segun evaluacion del autor) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 18.8 GB); GGUF disponible en repositorio de terceros |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, un transformer denso de aproximadamente 9.400 millones de parámetros. El entrenamiento del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B consistió en destilación desde DeepSeek-V4-Pro en modo "Max Effect", con un conjunto de aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. Los tags del repositorio indican el uso de SFT, RL y GSPO (Group Sequence Policy Optimization) en el pipeline de post-entrenamiento, así como soporte de MTP (Multi-Token Prediction).

Sobre esta base, la variante heretic aplica una ablación de rangos arbitrarios (ARA) con los siguientes parámetros: start_layer_index=9, end_layer_index=24, preserve_good_behavior_weight=0.8264, steer_bad_behavior_weight=0.0003, overcorrect_relative_weight=0.9645 y neighbor_count=12. Esta intervención modifica las direcciones de activación en las capas intermedias para suprimir el comportamiento de rechazo, manteniendo el resto de capacidades del modelo. El autor reporta una divergencia KL de 0.0422 frente al modelo original, lo que sugiere que la distribución general de salidas se preserva en gran medida.

## Capacidades

- Generación de texto y razonamiento estructurado con descomposición de problemas en múltiples pasos.
- Razonamiento matemático y resolución de problemas STEM, área en la que se concentra el entrenamiento supervisado.
- Tool calling y function calling, según los tags del repositorio.
- Razonamiento multi-paso y uso en agentes.
- Capacidades multimodales image-text-to-text (según el tag del repositorio).
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento ("reasoning") heredado del modelo base.
- Comportamiento sin rechazos: el autor reporta 3/100 rechazos frente a 100/100 del original.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente con ~250.000 muestras de matemáticas y STEM, por lo que es adecuado para asistencia en cálculo, álgebra, física y problemas de ingeniería con razonamiento paso a paso.
- Generación de código en pipelines de CI/CD: aunque no recibió SFT específico de código, el autor reporta mejoras por transferencia cruzada en programación y tool use, lo que permite integrarlo en tareas de generación y revisión de código con llamadas a herramientas.
- Agentes autónomos con function calling: los tags de tool-use y function-calling permiten conectarlo a APIs externas para tareas de automatización multi-paso.
- Asistencia técnica en atención al cliente: su capacidad multilingüe (seis idiomas) y su ventana de contexto (no especificada) permiten gestionar conversaciones multi-turno en varios idiomas.
- Investigación sobre alineación y seguridad: al ser una variante abliterated con métricas explícitas de rechazo y divergencia KL, sirve como objeto de estudio para analizar el efecto de la ablación de direcciones sobre el comportamiento del modelo.
- Procesamiento de documentos con imagen y texto: el tag image-text-to-text sugiere uso en tareas de extracción y razonamiento sobre contenido visual combinado con texto.
- Despliegue en entornos con recursos limitados: con 9.400 millones de parámetros y versiones GGUF disponibles, puede ejecutarse en hardware de consumo para prototipado e inferencia local.

## Benchmarks y rendimiento

El autor publica métricas de comportamiento tras la ablación, no benchmarks estándar de razonamiento:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-19 GB para los 9.400 millones de parámetros, más overhead de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 6-7 GB.
- GPU recomendadas para FP16: A100 40GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 ajustado o en cuantizaciones de 8 y 4 bits; en GPUs de 12-16 GB requiere cuantización de 4-8 bits.
- Opciones de despliegue: transformers, vLLM (el autor evaluó la ruta NVFP4), llama.cpp (ruta MTP-Q8_0), text-generation-inference; existe versión GGUF de terceros (mradermacher) para llama.cpp y Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9.4B | No disponible | Apache 2.0 | Variante abliterated; 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9.4B | No disponible | Apache 2.0 | Modelo base; 100/100 rechazos; destilado de DeepSeek-V4-Pro |
| Qwen3.5-9B (modelo de partida) | ~9B | No disponible | No disponible | Base arquitectónica sobre la que se construye el fine-tune |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La eliminación del comportamiento de rechazo implica que el modelo puede generar contenido que el modelo original rechazaría; requiere filtros y políticas de uso adicionales en producción.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en dominios fuera de matemáticas y STEM, donde el entrenamiento supervisado es menos denso.
- La divergencia KL de 0.0422 indica que la ablación no es neutra: puede haber degradación sutil en algunas capacidades respecto al modelo original.
- No se especifica la longitud de contexto en la model card; conviene verificarla antes de diseñar aplicaciones con ventanas largas.
- El soporte de idiomas se limita a en, zh, ko, ja, es y ru; el rendimiento en español no está cuantificado.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated puede conllevar riesgos reputacionales y de cumplimiento según el contexto de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de las métricas reportadas por el autor.
- La información sobre cuantizaciones oficiales es limitada; la versión GGUF disponible es de un tercero (mradermacher), no del autor original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uid321817/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión GGUF de terceros: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Réplica/mirror en Hugging Face: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Heretic (herramienta de ablación): https://heretic-project.org
