# SusanHill/zils-lite-rx1

## Resumen

zils-lite-rx1 es un ajuste fino mediante LoRA sobre Qwen/Qwen3.5-0.8B, publicado por el usuario SusanHill bajo licencia Apache-2.0. Se presenta como el "cuerpo" de la variante d3-lite de la familia Zils, entrenado sobre un conjunto de tareas de decisión de dominio público (tool calling, razonamiento, análisis de sentimiento, inferencia lingüística y recuperación de información). El modelo cuenta con 852.985.920 parámetros en formato safetensors y un repositorio de 1,7 GB.

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros, y se especializa en tareas de clasificación y decisión más que en generación libre de texto. Su relevancia radica en la combinación de un tamaño reducido, una licencia permisiva y un entrenamiento orientado a tareas concretas de razonamiento y tool calling, lo que lo hace candidato para despliegues con recursos limitados.

La información pública disponible es escasa: no se especifican idiomas soportados, longitud de contexto, composición exacta del dataset ni resultados de benchmarks. La model card se limita a enumerar las familias de tareas utilizadas en el entrenamiento (Glaive para tool calling; SIQA, PIQA, CSQA, GSM8K y BIG-bench para razonamiento; tareas de emoción, ironía, sarcasmo y sentimiento; MNLI, ANLI, RTE y STS-B para lenguaje; y 20 Newsgroups, Banking77, QNLI y CLINC para recuperación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); ajuste fino con LoRA |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code y tag qwen3_5) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con LoRA (Low-Rank Adaptation) descrito en la model card como "d3-lite soup body", lo que sugiere una combinación o mezcla de adaptadores entrenados sobre distintas tareas. El repositorio incluye código personalizado (`custom_code`) y el tag `qwen3_5`, lo que implica que la carga requiere confiar en la implementación del autor o disponer de la versión correspondiente de Transformers.

El entrenamiento utiliza exclusivamente particiones de entrenamiento públicas de un conjunto heterogéneo de tareas: tool calling con Glaive; razonamiento con SIQA, PIQA, CSQA, GSM8K y BIG-bench; análisis de emoción, ironía, sarcasmo y sentimiento; inferencia lingüística con MNLI, ANLI, RTE y STS-B; y recuperación con 20 Newsgroups, Banking77, QNLI y CLINC. No se documentan el número de tokens, la composición exacta del dataset, la proporción entre tareas, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación y decisión en tareas de razonamiento: entrenado sobre SIQA, PIQA, CSQA, GSM8K y BIG-bench, orientado a responder preguntas de sentido común y problemas aritméticos sencillos.
- Tool calling / function calling: el dataset Glaive se utiliza específicamente para el ajuste en invocación de herramientas.
- Análisis de sentimiento y pragmática: cubre emoción, ironía, sarcasmo y polaridad.
- Inferencia lingüística natural: entrenado con MNLI, ANLI, RTE y STS-B para tareas de implicación textual y similitud semántica.
- Recuperación y clasificación de intenciones: 20 Newsgroups, Banking77, QNLI y CLINC aportan capacidad de clasificación de textos e intenciones de usuario.
- Generación de texto: capacidad heredada del modelo base Qwen3.5-0.8B, aunque no se documenta su calidad tras el ajuste.
- Capacidades multilingües: no disponibles; no se especifican idiomas en la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el ajuste con CLINC y Banking77 permite clasificar la intención del usuario en dominios bancarios y de atención al cliente, derivando la consulta al flujo adecuado antes de invocar un modelo mayor.
- Detección de sarcasmo e ironía en moderación de contenido: el entrenamiento específico en estas tareas lo hace adecuado para prefiltrar reseñas o comentarios y marcar casos que requieran revisión humana.
- Clasificación de tickets de soporte: el uso de 20 Newsgroups y QNLI permite asignar categorías temáticas a tickets entrantes con un modelo de menos de 1 GB.
- Agente ligero con tool calling: la integración de Glaive posibilita construir agentes que decidan qué función invocar en entornos con recursos limitados, aunque requiere validación empírica del rendimiento real.
- Inferencia textual en pipelines de extracción de información: MNLI, ANLI y RTE permiten determinar si una hipótesis se deduce de una premisa, útil en sistemas de verificación de afirmaciones.
- Evaluación de razonamiento en entornos educativos: el ajuste con GSM8K y CSQA permite prototipar tutores que resuelvan problemas aritméticos y de sentido común de complejidad baja.
- Preetiquetado en anotación de datos: al ser un modelo pequeño y con licencia Apache-2.0, puede desplegarse en local para generar etiquetas preliminares en tareas de sentimiento o similitud semántica (STS-B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en FP16 se requieren aproximadamente 1,7 GB de pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo con holgura.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPU de consumo modernas, incluidas las de gama media con 6-8 GB.
- Opciones de despliegue: no documentadas por el autor; al requerir `custom_code` y el tag `qwen3_5`, es necesario verificar la compatibilidad con Transformers, vLLM, llama.cpp, Ollama o TGI antes de usarlo en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SusanHill/zils-lite-rx1 | 852.985.920 | no disponible | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | no disponible en la informacion | Hugging Face |
| Otros ajustes finos de Qwen3.5-0.8B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datasets públicos heterogéneos, puede heredar sesgos presentes en Glaive, SIQA, PIQA, CSQA, GSM8K, BIG-bench, MNLI, ANLI, RTE, STS-B, 20 Newsgroups, Banking77, QNLI y CLINC.
- Riesgo de alucinación: no evaluado; el ajuste orientado a clasificación y decisión no garantiza fiabilidad en generación libre.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que impide garantizar su comportamiento en textos largos o en castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B puede tener condiciones adicionales que deben verificarse antes de su explotación.
- Código personalizado: el repositorio incluye `custom_code`, lo que implica riesgos de seguridad y de compatibilidad; se recomienda auditar el código antes de cargarlo.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa ni resultados de benchmarks publicados; no se recomienda su uso en producción sin una evaluación propia.
- Fecha de creación: 2026-11-28, lo que sitúa su publicación en el futuro respecto a la información de referencia disponible; conviene confirmar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-lite-rx1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
