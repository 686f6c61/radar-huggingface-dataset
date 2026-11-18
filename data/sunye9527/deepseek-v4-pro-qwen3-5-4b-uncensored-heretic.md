# sunye9527/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "descensurada" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un fine-tune de razonamiento de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es sunye9527, que ha aplicado la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo del modelo base mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 16 a 32.

El modelo conserva la orientación original hacia matemáticas y STEM, entrenado sobre una mezcla de aproximadamente 250.000 muestras, pero modifica el comportamiento de alineación para reducir drásticamente las negativas a responder. Según la model card, los rechazos caen de 99/100 en el modelo original a 5/100 en esta variante, con una divergencia KL de 0,0378 respecto al base.

Con 4.539.265.536 parámetros totales y un repositorio de 9,3 GB en safetensors, se posiciona en la clase de 4B con licencia Apache 2.0, lo que lo hace desplegable en hardware de consumo. Es relevante para quienes necesitan un modelo pequeño de razonamiento sin filtros de rechazo, aunque con las advertencias evidentes sobre contenido no alineado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), fine-tune con destilación |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; tags mencionan MTP-Q8 en evaluación) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-4B orientado a razonamiento, destilado de DeepSeek-V4-Pro en modo Max Effect. El pipeline de entrenamiento incluye SFT sobre una mezcla de aproximadamente 250.000 muestras centradas en matemáticas y STEM, siguiendo la misma receta que la versión de 9B. Los tags indican uso de Unsloth, destilación, SFT y MTP (multi-token prediction), además de evaluación con MTP-Q8.

La variante aquí descrita aplica Heretic v2.0.0, una herramienta de decensurado que realiza una ablación de rangos arbitrarios (ARA) sobre las capas 16 a 32 con parámetros concretos: `start_layer_index` 16, `end_layer_index` 32, `preserve_good_behavior_weight` 0,9854, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 0,6587 y `neighbor_count` 10. Esta intervención modifica las direcciones de activación asociadas a comportamientos de rechazo, preservando en gran medida el resto del comportamiento (peso de preservación de 0,9854) y minimizando el sobreajuste (peso relativo de sobrecorrección de 0,6587).

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición explícita de problemas, aprendida por destilación de un profesor de mayor tamaño.
- Razonamiento matemático y STEM, con entrenamiento específico sobre aproximadamente 250.000 muestras de matemáticas y ciencias.
- Capacidades multimodales de entrada (image-text-to-text según tags), aunque la model card no detalla su alcance.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Comportamiento descensurado: reducción de rechazos de 99/100 a 5/100 respecto al modelo base.
- No se documenta explícitamente soporte de tool calling, function calling ni uso agéntico en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente sobre ~250.000 muestras de matemáticas y STEM, por lo que es adecuado para asistencia en cálculo, álgebra, física y química con razonamiento paso a paso.
- Tutoría técnica sin filtros de rechazo: útil en entornos de investigación donde se necesita discutir temas sensibles (seguridad, biología, química) sin que el modelo se niegue a responder.
- Generación de explicaciones técnicas detalladas: su orientación a descomposición de problemas lo hace apto para documentación técnica y explicaciones didácticas.
- Experimentación en investigación sobre alineación: al ser un modelo descensurado con métricas de KL y rechazos publicadas, sirve como caso de estudio para investigar técnicas de ablación y sus efectos.
- Procesamiento multilingüe en seis idiomas: atención al cliente o generación de contenido en inglés, chino, coreano, japonés, español y ruso.
- Despliegue en hardware de consumo: con 4B parámetros y licencia Apache 2.0, puede ejecutarse en GPUs de gama media para prototipado y aplicaciones locales.
- Base para fine-tunes especializados: el autor lo usa como base para su modelo DeepThought-STEM, lo que demuestra su utilidad como punto de partida.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.539 millones de parámetros, en FP16 requeriría aproximadamente 9 GB, y en cuantización de 8 bits unos 4,5 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas en la información disponible.
- Compatibilidad con GPU de consumo: probable en GPUs con 8-12 GB de VRAM en cuantización, aunque no confirmado.
- Opciones de despliegue: el tag `text-generation-inference` sugiere compatibilidad con TGI; también transformers (librería declarada). No se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (4B-UNCENSORED-heretic) | 4,54B | no disponible | Apache 2.0 | Descensurado, 5/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | ~4B | no disponible | Apache 2.0 | Base alineado, 99/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | no disponible | no disponible | Versión mayor descensurada |
| Qwen3.5-4B (base original) | ~4B | no disponible | no disponible | Modelo base de la familia |

No se dispone de datos de rendimiento comparativo en benchmarks estándar para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo descensurado: la eliminación de rechazos implica que puede generar contenido inapropiado, peligroso o dañino sin filtros; no apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación: como todo modelo de 4B, la precisión factual puede ser limitada, especialmente en dominios fuera de matemáticas y STEM.
- La intervención ARA sobre capas 16-32 puede degradar capacidades no medidas; la divergencia KL de 0,0378 indica cambios en la distribución de salida que podrían afectar a tareas no evaluadas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar normativas si se emplea sin supervisión.
- Longitud de contexto no documentada: limita la planificación para casos que requieran ventanas largas.
- Idiomas: aunque declara seis idiomas, no hay evaluación de calidad por idioma; el entrenamiento se centra en matemáticas y STEM, por lo que el rendimiento en conversación general puede ser inferior.
- Sin datos de benchmarks estándar publicados: difícil comparar objetivamente con alternativas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sunye9527/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Versión 9B descensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune STEM del autor: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic: https://heretic-project.org
