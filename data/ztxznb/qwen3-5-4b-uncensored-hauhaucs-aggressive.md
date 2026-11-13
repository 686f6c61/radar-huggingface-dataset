# ztxznb/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-4B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen3.5-4B, desarrollada por el usuario ztxznb (a partir del trabajo del colectivo HauhauCS) y publicada en Hugging Face. El modelo parte de la arquitectura oficial de Qwen3.5-4B, un transformer denso de 4.205.751.296 parámetros con 32 capas, y aplica un proceso de "ablación de rechazos" que, segun el autor, elimina por completo las respuestas de negativa (0 de 465 rechazos) sin degradar las capacidades originales del modelo base.

La relevancia de esta ficha radica en tres factores tecnicos: primero, emplea una arquitectura hibrida poco habitual que combina Gated DeltaNet (atención lineal) con atención softmax completa en una proporción 3:1; segundo, es nativamente multimodal, aceptando texto, imagen y video mediante un encoder de visión separado (mmproj); y tercero, ofrece una ventana de contexto nativa de 262K tokens, extensible a 1M con YaRN. Todo ello bajo licencia Apache 2.0.

El modelo se distribuye exclusivamente en formato GGUF (BF16, Q8_0, Q6_K y Q4_K_M), lo que lo hace desplegable en llama.cpp, LM Studio, Jan o koboldcpp. No obstante, conviene advertir que la arquitectura es muy reciente (febrero-marzo de 2026) y el soporte en runtimes ha llegado hace poco, por lo que se requiere una build actualizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated DeltaNet (atencion lineal) + atencion softmax completa en ratio 3:1 |
| Parametros totales | 4.205.751.296 (4B densos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens nativos; extensible a 1M con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (formato GGUF) |
| Idiomas soportados | 201 idiomas segun el autor; la model card declara en, zh y multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye encoder de vision mmproj en BF16) |
| Capas | 32 |
| Vocabulario | 248K tokens |
| Modalidades | Texto, imagen y video (multimodal nativo) |
| Prediccion multi-token (MTP) | Si |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B, publicada por Alibaba Qwen el 2 de marzo de 2026. Se trata de un transformer denso de 32 capas que combina dos mecanismos de atencion: Gated DeltaNet, una forma de atencion lineal con compuertas que reduce el coste computacional en secuencias largas, y atencion softmax completa. La proporción es de tres capas con atención lineal por cada capa con atención completa, un esquema hibrido orientado a mantener calidad en contextos muy largos con menor coste de memoria. El vocabulario es de 248K tokens y cubre, segun el autor, 201 idiomas.

La variante Uncensored-HauhauCS-Aggressive no modifica los datos de entrenamiento ni las capacidades del modelo base: segun la model card, se aplica una ablación de rechazos ("refusal removal") que elimina las respuestas de negativa sin reentrenamiento adicional. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se detalla la metodología exacta de la ablación. El modelo soporta predicción multi-token (MTP), una técnica de decodificación especulativa que permite generar varios tokens por paso y mejorar el throughput.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento en modo "thinking" (por defecto) y modo "non-thinking", con parámetros de muestreo recomendados distintos para cada uno.
- Comprensión de imágenes y video mediante el encoder de visión mmproj (multimodal nativo).
- Capacidades multilingües amplias: 201 idiomas declarados, con soporte destacado de inglés y chino.
- Predicción multi-token (MTP) para acelerar la decodificación.
- Generación de código y matemáticas: no se detalla explícitamente en la model card, pero se asume heredada del modelo base Qwen3.5-4B.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Ausencia total de rechazos (0/465 según el autor), con posibles descargos automáticos al final de algunas respuestas.

## Casos de uso

- **Investigación sobre alineamiento y seguridad**: el modelo permite estudiar el comportamiento de un LLM sin capas de rechazo, comparando sus respuestas con las del Qwen3.5-4B original para analizar qué información se suprime y cómo. Es adecuado por su naturaleza de variante controlada del mismo modelo base.
- **Generación creativa sin restricciones**: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto, temas controvertidos) sin que el modelo se niegue. El contexto de 262K tokens permite mantener coherencia en novelas o guiones largos.
- **Análisis de documentos extensos con imágenes**: gracias a la ventana de 262K tokens y al encoder de visión, se pueden procesar informes, contratos o papers con figuras intercaladas en una sola pasada, extrayendo y razonando sobre el contenido visual y textual conjuntamente.
- **Despliegue local en hardware de consumo**: con la cuantización Q4_K_M (2,6 GB) el modelo cabe en GPUs consumer de 8 GB de VRAM, lo que permite ejecutar un modelo multimodal de 4B con contexto largo en un portátil o estación de trabajo sin GPU dedicada de gama alta.
- **Transcripción y descripción de video**: el soporte nativo de video permite generar descripciones, resúmenes o subtítulos de clips cortos en local, útil para pipelines de accesibilidad o indexación de archivos multimedia.
- **Prototipado de asistentes multilingües**: con 201 idiomas declarados y licencia Apache 2.0, sirve para construir prototipos de atención al cliente o asistentes en idiomas minoritarios sin coste de licencia y con despliegue en llama.cpp o LM Studio.
- **Evaluación de robustez frente a jailbreaks**: al estar completamente desbloqueado, es útil como caso extremo en pruebas de sistemas de moderación o filtros de contenido que deban detectar respuestas no seguras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la métrica interna de rechazos (0/465), que no es un benchmark de capacidad sino de comportamiento de alineamiento.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin contar KV cache):
  - BF16: ~7,9 GB
  - Q8_0: ~4,2 GB
  - Q6_K: ~3,3 GB
  - Q4_K_M: ~2,6 GB
  - Encoder de visión mmproj (BF16): ~645 MB adicionales si se usa entrada multimodal.
- **GPU recomendadas**: para BF16, una RTX 4090 (24 GB) o A100/H100 con margen amplio para contexto largo. Para Q8_0, una RTX 4070 Ti o superior (12-16 GB). Para Q4_K_M, cabe en GPUs de 8 GB como RTX 3060 Ti, RTX 4060 o RTX 3070.
- **Cabe en GPU consumer**: sí, en todas las cuantizaciones; la Q4_K_M es la más accesible para 8 GB de VRAM. Para contexto de 128K o más hay que sumar el KV cache, que puede requerir 16-24 GB adicionales según la cuantización del cache.
- **Opciones de despliegue**: llama.cpp (build reciente obligatoria), LM Studio, Jan, koboldcpp. Para producción de alto throughput, el autor recomienda vLLM, SGLang o KTransformers.
- **Latencia y throughput**: no disponibles. El soporte de MTP debería mejorar el throughput en decodificación, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4B densos | 262K (1M con YaRN) | Sí (texto, imagen, video) | Apache 2.0 | GGUF | Variante sin censura del Qwen3.5-4B |
| Qwen3.5-4B (original) | 4B densos | 262K (1M con YaRN) | Sí | Apache 2.0 | Safetensors, GGUF | Modelo base con alineamiento completo |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B densos | No disponible | No disponible | Apache 2.0 | GGUF | Variante mayor del mismo colectivo, más capacidad pero más VRAM |
| Modelos densos de 4B de otras familias (p. ej. Llama 3.2 3B, Gemma 3 4B) | 3-4B | 8K-128K | Parcial (Gemma 3 sí visión) | Licencias variables | Safetensors, GGUF | Sin datos de comparación directa disponibles |

No se dispone de benchmarks que permitan comparar el rendimiento de esta variante con las alternativas en tareas estándar (MMLU, HumanEval, GSM8K). La comparación se limita a especificaciones técnicas.

## Limitaciones y advertencias

- **Ausencia total de rechazos**: el modelo generará contenido para prácticamente cualquier prompt, incluidos temas ilegales, peligrosos o dañinos. No debe desplegarse en aplicaciones orientadas al público sin una capa externa de moderación.
- **Descargos residuales**: aunque no rechaza, puede añadir una frase de descargo al final de algunas respuestas (p. ej. "esto es información general, no asesoramiento legal"). Es un artefacto del entrenamiento del modelo base, no una negativa.
- **Riesgo de alucinación**: como todo LLM de 4B, la tasa de alucinación es inherente; no se han publicado evaluaciones específicas de fidelidad factual para esta variante.
- **Sesgos**: al no haberse aplicado un proceso de alineamiento adicional, los sesgos del modelo base persisten y pueden aflorar sin las salvaguardas habituales. No se documentan evaluaciones de sesgo.
- **Soporte de runtime frágil**: la arquitectura es de marzo de 2026 y el soporte en llama.cpp llegó muy recientemente; es necesario usar builds actualizadas. vLLM, SGLang y KTransformers se recomiendan para producción, pero la compatibilidad con esta variante GGUF concreta no está verificada en la información disponible.
- **Contexto largo y memoria**: aunque el contexto nativo es de 262K, mantener 128K o más requiere un KV cache considerable; el autor advierte que hay que mantener al menos 128K para preservar las capacidades de razonamiento en modo thinking.
- **Licencia Apache 2.0**: permite uso comercial, pero el desarrollador no ofrece garantías sobre el comportamiento del modelo ni asume responsabilidad por el contenido generado.
- **Idiomas**: aunque se declaran 201 idiomas, la model card solo lista en, zh y multilingual; el rendimiento en idiomas distintos del inglés y el chino no está verificado.
- **Tool calling y agentes**: no confirmados en la información disponible; conviene validar su funcionamiento antes de integrarlo en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ztxznb/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 9B del mismo colectivo: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Perfil del colectivo HauhauCS: https://huggingface.co/HauhauCS
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
