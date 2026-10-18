# VALOR0316/ingot-cand7t_t4

## Resumen

`VALOR0316/ingot-cand7t_t4` es un checkpoint de 27.781.427.952 parámetros (aproximadamente 27,78 mil millones) publicado en Hugging Face por el usuario VALOR0316 (Louis Robbins) el 18 de octubre de 2026. El repositorio ocupa 30,9 GB y contiene pesos en formato `safetensors` con cuantización `fp8`, según las etiquetas del propio repositorio. No se ha publicado model card, ficha técnica, licencia, idiomas soportados ni pipeline de inferencia asociado.

La única pista sobre su origen es la etiqueta `qwen3_5`, que apunta a un linaje derivado de la familia Qwen3.5 de Alibaba, aunque no existe confirmación oficial por parte del autor ni documentación que lo verifique. El nombre del repositorio (`ingot-cand7t_t4`) sugiere un artefacto intermedio de un proceso de entrenamiento o experimentación interna ("cand" como candidato, "t4" como identificador de iteración), más que un modelo destinado a distribución pública.

Su relevancia práctica es limitada en el estado actual: con 13 descargas y 0 likes, no hay validación comunitaria, ni resultados de benchmarks, ni instrucciones de uso. El interés técnico se reduce a la posibilidad de inspeccionar y evaluar un conjunto de pesos fp8 de ~28B parámetros que, en teoría, cabría en una sola GPU de 40-48 GB de VRAM, siempre que el usuario asuma el coste de caracterizar el modelo por su cuenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta `qwen3_5` sugiere familia Qwen3.5; sin confirmar) |
| Parámetros totales | 27.781.427.952 (~27,78 mil millones) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `fp8` (indicado en las etiquetas); no se documentan variantes GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (fp8) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo: no hay model card, ni configuración (`config.json`) descrita en la información disponible, ni documentación sobre si se trata de un transformer denso, un mixture of experts, un modelo híbrido o una variante con atención lineal. La etiqueta `qwen3_5` es el único indicio y no constituye una confirmación técnica.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), sobre si se aplicaron etapas de ajuste supervisado, RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o modos de razonamiento extendido. Cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación de texto: no verificada; no hay ejemplos, demos ni evaluaciones publicadas.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Visión, audio u otras modalidades: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.

La ausencia de estas capacidades en la ficha no implica que el modelo carezca de ellas, sino que no están documentadas ni verificadas por el autor.

## Casos de uso

Los siguientes escenarios son viables únicamente como trabajo de caracterización previa, dado que el modelo no está documentado:

- Evaluación comparativa interna: ejecutar el checkpoint contra un arnés de evaluación propio (MMLU, GSM8K, HumanEval) para determinar su competencia real antes de plantear cualquier uso.
- Estudio de linaje Qwen3.5: comparar los pesos y el comportamiento con un Qwen3.5 oficial del mismo orden de tamaño para detectar si se trata de un fine-tune, una destilación o un checkpoint intermedio.
- Base para fine-tuning experimental: usar los pesos fp8 como punto de partida (previa desconversión a BF16) en un ajuste supervisado de dominio específico, asumiendo que la licencia debe aclararse antes de cualquier uso comercial.
- Investigación sobre cuantización: analizar la calidad de la cuantización fp8 nativa frente a una versión BF16 del mismo modelo, midiendo degradación en perplejidad y en tareas de razonamiento.
- Pruebas de infraestructura de serving: validar despliegues con vLLM o SGLang en GPUs Hopper/Ada, midiendo throughput y latencia con un modelo de ~28B en fp8.
- Destilación de conocimiento: emplear el modelo como profesor en la generación de datos sintéticos para modelos más pequeños, tras verificar que la calidad de sus salidas es suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp8 nativo: aproximadamente 27,8 GB solo para pesos; con caché KV y overhead de runtime, un mínimo realista de 32-36 GB.
- VRAM estimada en BF16/FP16 (tras desconversión): aproximadamente 55,6 GB de pesos; se necesitan 64-80 GB.
- VRAM estimada en INT4 (si se generan GGUF Q4_K_M, no disponibles actualmente): en torno a 15-16 GB de pesos, lo que permitiría ejecución en GPU de consumo.
- GPU recomendadas para fp8: NVIDIA L40S (48 GB), RTX A6000 (48 GB), A100 40 GB (ajustado), H100 80 GB, H200.
- GPU de consumo: no cabe en fp8 en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB); sí cabría una versión INT4 de ~16 GB, con contexto limitado.
- Opciones de despliegue: vLLM y SGLang soportan fp8 en GPUs Hopper y Ada; TensorRT-LLM es otra vía. llama.cpp y Ollama requerirían una conversión a GGUF que no está publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus model cards públicas y deben verificarse antes de usarse en producción. El rendimiento del modelo analizado no está medido.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| VALOR0316/ingot-cand7t_t4 | ~27,78 B | No disponible | No disponible | No disponible | Hugging Face, 13 descargas |
| Qwen3-32B | ~32,8 B | 32.768 nativo, ampliable a 131.072 con YaRN | Apache 2.0 | Benchmarks públicos en su model card | Hugging Face, amplia adopción |
| Gemma 3 27B | ~27 B | 128.000 | Términos de uso de Gemma | Benchmarks públicos en su model card | Hugging Face, amplia adopción |
| Mistral Small 3.2 24B | ~23,6 B | 128.000 | Apache 2.0 | Benchmarks públicos en su model card | Hugging Face, amplia adopción |

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explícita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Ausencia total de model card: se desconoce el preentrenamiento, los datos empleados y los ajustes aplicados, lo que impide evaluar riesgos de sesgo o contaminación de benchmarks.
- Riesgo de alucinación: no cuantificado; al no haber evaluaciones publicadas no puede estimarse su fiabilidad factual.
- Posible checkpoint intermedio: el nombre (`cand7t_t4`) sugiere un artefacto de entrenamiento no finalizado, con riesgo de comportamiento incoherente o degradado.
- Contexto desconocido: no puede planificarse el diseño de prompts multi-turno ni el troceado de documentos sin determinarlo empíricamente.
- Idiomas desconocidos: no hay garantía de calidad en castellano ni en ningún otro idioma.
- Requisitos de hardware fp8: la cuantización fp8 requiere GPUs con soporte nativo (Hopper o Ada); en arquitecturas anteriores habrá que desconverter a BF16, duplicando la VRAM necesaria.
- Sin validación comunitaria: 13 descargas y 0 likes implican ausencia de informes independientes sobre su comportamiento.
- Fecha de publicación reciente (18 de octubre de 2026): no ha habido tiempo material para que la comunidad lo evalúe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VALOR0316/ingot-cand7t_t4
- Perfil del autor: https://huggingface.co/VALOR0316
- Datasets del autor: https://huggingface.co/VALOR0316/datasets

La búsqueda web no ha devuelto artículos técnicos, papers, blogs ni demos asociados a este modelo concreto.
