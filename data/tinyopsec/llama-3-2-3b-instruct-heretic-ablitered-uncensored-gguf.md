# tinyopsec/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored-GGUF

## Resumen

Esta ficha describe la colección de cuantizaciones GGUF publicada por el usuario tinyopsec a partir de `DavidAU/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored`, una variante del Llama 3.2 3B Instruct de Meta a la que se ha aplicado la técnica de *abliteration* para eliminar el comportamiento de rechazo (refusal) del modelo original. El resultado es un modelo conversacional de aproximadamente 3.200 millones de parámetros que mantiene la capacidad de seguir instrucciones y el conocimiento del modelo base, pero sin las restricciones de contenido incorporadas por el alineamiento original.

El modelo base es un transformer denso de tipo `LlamaForCausalLM` con una longitud de contexto declarada de 128.000 tokens. La abliteration actúa identificando y neutralizando la "dirección de rechazo" en el flujo residual, de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones. Esta publicación no aporta pesos nuevos en precisión completa: es un repositorio de cuantizaciones en formato GGUF (desde F16 hasta Q2_K) pensado para despliegue en llama.cpp, Ollama, LM Studio y otras herramientas compatibles.

Su relevancia práctica es doble. Por un lado, permite ejecutar un modelo de 3B completamente en local, incluso en hardware de gama baja o en CPU, con ficheros de entre 1,3 GB y 6,4 GB. Por otro, el carácter "uncensored" del modelo lo hace útil para investigación sobre alineamiento, estudios de robustez y experimentación con contenido que los modelos alineados estándar rechazan, pero también introduce riesgos evidentes de seguridad y de cumplimiento que deben evaluarse antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `LlamaForCausalLM` (familia Llama 3.2) |
| Parametros totales | 3.212.749.888 (~3,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun la model card del autor (las configuraciones de ejemplo usan 4.096) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Llama 3.2 Community License (identificador `llama3.2`) |
| Formato de pesos | GGUF (un fichero por cuantizacion) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct de Meta: un transformer denso con atención por grupos (GQA), RoPE y las innovaciones habituales de la familia Llama 3, con aproximadamente 3.200 millones de parámetros. El modelo original fue entrenado por Meta con un pipeline de preentrenamiento masivo seguido de ajuste supervisado y optimización con preferencias humanas (RLHF) para alinearlo como asistente conversacional. Sobre esa base, el autor del modelo intermedio (DavidAU) aplicó abliteration, una intervención post-entrenamiento que localiza la dirección del espacio de activaciones asociada a las respuestas de rechazo y la proyecta fuera de los pesos, sin reentrenar el modelo.

La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de abliteration (número de capas intervenidas, métricas de daño colateral, etc.). Tampoco se especifica si hubo etapas adicionales de ajuste fino tras la abliteration. La cuantización la realizó tinyopsec con llama.cpp, generando la matriz completa de variantes K-quant y Q8_0/F16 habituales. No se documentan innovaciones arquitectónicas adicionales más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de chat instructivo.
- Seguimiento de instrucciones generales: resúmenes, reescritura, clasificación, extracción de información.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 3B parámetros.
- Generación de código y explicaciones técnicas a nivel introductorio/medio.
- Operaciones aritméticas simples y razonamiento matemático de baja complejidad.
- Ausencia de comportamiento de rechazo por abliteration: responde a peticiones que el Llama 3.2 Instruct original declinaría.
- Compatibilidad con endpoints y herramientas que consumen GGUF (llama.cpp server, Ollama, LM Studio).
- No se documenta soporte de tool calling nativo, modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para inglés.

## Casos de uso

- Experimentación en local con hardware modesto: un portátil con 8 GB de RAM puede ejecutar la variante Q4_K_M (~2,2 GB de RAM) mediante llama.cpp u Ollama, lo que permite probar un asistente conversacional sin GPU dedicada.
- Investigación sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para analizar qué comportamientos se eliminan con abliteration, medir la degradación en tareas estándar y comparar con el Llama 3.2 3B Instruct original en evaluaciones de refusal.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde los modelos alineados suelen producir negativas o evasivas.
- Prototipado rápido de aplicaciones de chat: con llama-server o llama-cpp-python se puede levantar una API compatible con OpenAI en minutos para validar interfaces y flujos conversacionales antes de migrar a un modelo mayor.
- Pruebas de robustez y red-teaming: útil para generar prompts adversarios y estudiar cómo responde un modelo sin salvaguardas, alimentando después los clasificadores de seguridad de un sistema en producción.
- Tareas de procesamiento de texto por lotes en CPU: resúmenes, etiquetado o reescritura de documentos en inglés con la variante Q3_K_M o Q2_K (~1,5-1,8 GB), donde el throughput importa menos que el coste.
- Educación y demostraciones: ejecutar el modelo en un aula o taller sin infraestructura cloud, mostrando el efecto de la cuantización y de la abliteration sobre el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base, y tampoco se documenta el impacto de la abliteration en la calidad general.

## Requisitos de hardware

- VRAM/RAM estimada según la model card del autor:
  - F16: ~7 GB (GPU de 8 GB o 16 GB de RAM).
  - Q8_0: ~4 GB (GPU de 6 GB u 8 GB de RAM).
  - Q6_K: ~3 GB (GPU de 4 GB u 8 GB de RAM).
  - Q5_K_M: ~2,5 GB (GPU de 4 GB u 8 GB de RAM).
  - Q4_K_M: ~2,2 GB (GPU de 4 GB o 6 GB de RAM).
  - Q3_K_M: ~1,8 GB (CPU o 4 GB de RAM).
  - Q2_K: ~1,5 GB (CPU o 4 GB de RAM).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090 sobrada); en entornos profesionales, una A100 o H100 no aporta ventaja significativa por el tamaño reducido del modelo y quedaría limitada por el ancho de banda de memoria.
- Cabe en GPU consumer: sí, en todas las variantes cuantizadas; incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp (CLI y server), llama-cpp-python, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Con Q4_K_M en una GPU consumer moderna se puede esperar una generación fluida, pero no hay cifras documentadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF de Llama-3.2-3B-Instruct-heretic-ablitered-uncensored) | ~3,2B | 128K (declarado) | Llama 3.2 Community | GGUF | Sin refusal por abliteration; solo inglés |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2B | 128K | Llama 3.2 Community | safetensors, GGUF oficiales | Alineado con rechazos; referencia de calidad |
| DavidAU/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored | ~3,2B | 128K | Llama 3.2 Community | safetensors | Modelo padre de esta cuantización |
| Mistral-7B-Instruct (cuantizado) | ~7,2B | 32K | Apache 2.0 | GGUF, safetensors | Mayor tamaño y contexto menor; licencia permisiva |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación del comportamiento de rechazo implica que puede generar contenido dañino, ilegal o sexualmente explícito. No es apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo elevado de alucinación: con 3,2B parámetros, la precisión factual es limitada y la abliteration puede agravar la tendencia a responder con confianza sobre temas que el modelo base declinaría.
- Solo inglés: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas, a pesar de que Llama 3.2 tiene cierta competencia multilingüe residual.
- Contexto: aunque la model card declara 128K tokens, los ejemplos de uso configuran 4.096 tokens; no se documenta el rendimiento real en ventanas largas tras la cuantización.
- Licencia Llama 3.2 Community: permite uso comercial con condiciones (atribución, límite de 700 millones de usuarios mensuales, política de uso aceptable de Meta). El uso del modelo para generar contenido prohibido por dicha política puede constituir un incumplimiento, independientemente de la abliteration.
- La cuantización Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No hay garantías del autor sobre el proceso de abliteration ni evaluaciones de daño colateral en razonamiento o código.
- El repositorio tiene 0 likes y un autor no verificado; conviene validar la integridad de los ficheros GGUF antes de desplegarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored-GGUF
- Modelo base (padre): https://huggingface.co/DavidAU/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Perfil del cuantizador: https://huggingface.co/tinyopsec
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
