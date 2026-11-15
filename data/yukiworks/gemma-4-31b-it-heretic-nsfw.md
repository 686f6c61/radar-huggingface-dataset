# yukiworks/gemma-4-31B-it-heretic-NSFW

## Resumen

Gemma-4-31B-it-heretic-NSFW es una variante "decensurada" del modelo multimodal google/gemma-4-31B-it, publicada por el usuario yukiworks en Hugging Face. Se ha generado mediante Heretic v2.2.0.dev0, una herramienta de ablación de direcciones en el espacio de activaciones que elimina la tendencia al rechazo sin reentrenar los pesos. En este caso, la optimización se ha guiado con un conjunto de prompts de contenido adulto compilado manualmente por el autor, en lugar de los conjuntos genéricos que usa Heretic por defecto, de modo que la supresión de rechazos está afinada específicamente para contenido NSFW.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind, presentada como una familia multimodal que procesa texto e imagen (y audio en las variantes E2B, E4B y 12B) y que cubre cinco tamanos: E2B, E4B, 12B, 26B A4B y 31B. La variante 31B es densa, con 30,7B parámetros declarados por el autor del modelo base (31.273.086.512 parámetros reales en los safetensors del repositorio), 60 capas, ventana de contexto de 256K tokens y vocabulario de 262K entradas. Incorpora un modo de razonamiento configurable y soporte nativo del rol `system`.

La relevancia de esta ficha es doble: por un lado documenta una técnica de modificación de comportamiento (ARA, arbitrary-rank ablation) aplicada a un modelo de gran tamano; por otro, advierte de que se trata de un modelo con contenido para adultos, marcado como `not-for-all-adultos` por el propio repositorio, y cuya licencia declarada (Apache 2.0) entra en conflicto con la licencia propia de Gemma 4 enlazada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + imagen) con atención híbrida: sliding window local (1024 tokens) intercalada con atención global; capas globales con Keys y Values unificadas y Proportional RoPE (p-RoPE) |
| Parametros totales | 31.273.086.512 (31,27B); el autor del modelo base declara 30,7B para la variante 31B densa |
| Parametros activos | No aplica (modelo denso; la variante MoE de la familia es 26B A4B) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repositorio solo publica safetensors en precisión original) |
| Idiomas soportados | No disponible para esta variante; el modelo base declara soporte multilingüe en más de 140 idiomas |
| Licencia | Apache 2.0 declarada en el repositorio, con enlace a la licencia propia de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); existe conflicto entre ambas |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 31B: un transformer denso de 60 capas con vocabulario de 262K tokens, atención híbrida que combina ventanas deslizantes locales de 1024 tokens con capas de atención global (la última capa es siempre global), Keys y Values unificadas en las capas globales y Proportional RoPE para reducir el coste de memoria en contextos largos. El modelo es multimodal: incluye un codificador de visión de aproximadamente 550M parámetros y procesa texto e imagen, sin soporte de audio en esta talla. Dispone de modo de razonamiento configurable y soporte nativo del rol `system`.

Esta variante concreta no se ha entrenado: Heretic es un método sin entrenamiento (training-free) que aplica una ablación de rango arbitrario (ARA) sobre las activaciones internas para eliminar la dirección asociada al comportamiento de rechazo. Los parámetros declarados de la ablación son `start_layer_index` = 5, `end_layer_index` = 36, `preserve_good_behavior_weight` = 0,9586, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,4625 y `neighbor_count` = 2. El autor indica que la optimización se guió con un dataset original de prompts de contenido adulto compilado manualmente, que actúa como guía del proceso de optimización y no como datos de fine-tuning. No se detalla el volumen de tokens de entrenamiento del modelo base ni la composición de su dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (thinking mode).
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Generación de código y capacidades agénticas mejoradas respecto a generaciones anteriores de Gemma, según el autor del modelo base.
- Soporte nativo de function calling / tool calling.
- Soporte de conversaciones multi-turno con rol `system` nativo.
- Capacidades multilingües heredadas del modelo base (más de 140 idiomas declarados).
- Supresión del comportamiento de rechazo orientada a contenido adulto: la model card reporta 4 rechazos de 100 frente a 84 de 100 del modelo original, medidos con un clasificador.
- No dispone de entrada de audio en esta talla (solo E2B, E4B y 12B la soportan).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente el efecto de la ablación ARA comparando el comportamiento con el modelo base, con una divergencia KL declarada de 0,0238 frente al original.
- Evaluación de técnicas de decensurado: sirve como referencia para medir la eficacia de Heretic sobre modelos multimodales de gran tamano y para analizar qué capacidades se degradan tras la ablación.
- Generación de narrativa adulta controlada en entornos de investigación: el modelo mantiene contexto de 256K tokens, lo que permite mantener coherencia en textos largos de ficción para adultos.
- Análisis de imágenes en flujos de trabajo creativos para adultos: al conservar el codificador de visión de ~550M parámetros, puede describir y razonar sobre imágenes en el contexto de pipelines de contenido para adultos.
- Pruebas de robustez de filtros y clasificadores: útil para validar sistemas de moderación que deben detectar contenido NSFW generado por modelos abiertos.
- Desarrollo de agentes conversacionales con requisitos de contenido sin restricciones en entornos cerrados: el soporte de tool calling y system prompt permite integrarlo en prototipos de agentes, siempre que el despliegue cumpla la legislación aplicable.
- Estudio de conflicto de licencias en modelos derivados: caso práctico para analizar la tensión entre la licencia Apache 2.0 declarada y la licencia Gemma 4 del modelo base.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de decensurado del autor, no benchmarks estándar de capacidad:

| Metrica | Este modelo | Modelo original (google/gemma-4-31B-it) |
|---|---|---|
| Rechazos (clasificador) | 4/100 | 84/100 |
| Divergencia KL | 0,0238 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (bf16/fp16): aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere 2 GPU de 80 GB o una GPU de 80 GB con cuantización.
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB en configuración multi-GPU; en consumer GPU no cabe en precisión completa.
- Cuantización: no se publican pesos GGUF ni cuantizados en el repositorio; habría que generarlos a partir de los safetensors. En 4 bits el modelo ocuparía del orden de 16-18 GB, lo que podría caber en una RTX 4090 (24 GB), aunque no hay datos publicados de calidad tras cuantizar esta variante.
- Opciones de despliegue: transformers (librería declarada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| yukiworks/gemma-4-31B-it-heretic-NSFW | 31,27B | 256K | Texto + imagen | Apache 2.0 declarada (conflicto con licencia Gemma 4) | Variante decensurada con Heretic; 4/100 rechazos |
| google/gemma-4-31B-it | 30,7B | 256K | Texto + imagen | Licencia Gemma 4 | Modelo base instruction-tuned; 84/100 rechazos |
| google/gemma-4-26B A4B | No disponible con detalle | 256K (modelos medianos) | Texto + imagen | Licencia Gemma 4 | Variante MoE de la familia, según el autor del modelo base |
| google/gemma-4-12B | 11,95B | 256K | Texto + imagen + audio | Licencia Gemma 4 | Alternativa más ligera con soporte de audio |

No se dispone de datos de benchmarks de capacidad para establecer comparaciones de rendimiento con modelos de otras familias.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está marcado como `not-for-all-audiences`; el modelo está diseñado para generar contenido NSFW y no es apto para uso general ni para menores.
- Conflicto de licencia: el repositorio declara Apache 2.0, pero la model card enlaza la licencia propia de Gemma 4; la licencia Gemma 4 impone restricciones de uso comercial y de redistribución que deben verificarse antes de cualquier despliegue en producción.
- La ablación ARA puede degradar capacidades no medidas: el autor solo reporta rechazos y divergencia KL, sin benchmarks de razonamiento, código o matemáticas; no hay garantía de que las capacidades del modelo base se conserven intactas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta variante; la modificación de activaciones puede alterar el comportamiento en tareas de razonamiento.
- Idiomas: no se documentan los idiomas soportados específicamente para esta variante; el soporte multilingüe se hereda del modelo base sin verificación publicada.
- Cuantización: no hay pesos cuantizados publicados ni evaluaciones de calidad tras cuantizar; el despliegue en consumer GPU requiere trabajo adicional.
- Responsabilidad legal: la generación de contenido adulto está sujeta a la legislación de cada jurisdicción; el usuario debe garantizar el cumplimiento normativo y la verificación de edad en cualquier aplicación.
- Sin métricas de despliegue: no se publican latencias, throughput ni requisitos de memoria medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yukiworks/gemma-4-31B-it-heretic-NSFW
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Google DeepMind sobre Gemma: https://deepmind.google/models/gemma/
- Proyecto Heretic: https://heretic-project.org
