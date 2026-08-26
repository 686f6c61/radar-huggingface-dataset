# Urdatorn/sphragis-alm-olmo3-greek-7b-diodorus-siculus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-diodorus-siculus` es un modelo de lenguaje autoría (authorial language model, ALM) desarrollado por Urdatorn (Albin Thörn Cleland) como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `Urdatorn/olmo3-7b-ancient-greek`, que a su vez es una adaptación de OLMo3 7B al griego antiguo. El modelo está entrenado exclusivamente sobre 1.000 frases de Diodoro Sículo (184.560 tokens puntuados) procedentes del split de entrenamiento `sentence_1` del dataset Sphragis.

Su propósito es resolver el problema de atribución de autoría en textos clásicos: dado un texto anónimo o disputado, se calcula la perplejidad (negative log-likelihood por token) con cada uno de los diecisiete modelos ALM del conjunto, y se atribuye la autoría al modelo que encuentre la frase menos sorprendente. Este enfoque sigue la metodología de Huang, Murakami y Grieve (2025) publicada en PLoS ONE. La relevancia actual radica en que combina un modelo base abierto (OLMo3, Apache-2.0) con una adaptación lingüística específica para una lengua histórica, demostrando que el ajuste previo al griego antiguo mejora la calidad del modelado del lenguaje sin sacrificar la capacidad discriminativa del conjunto.

El modelo tiene 7.298.011.136 parámetros, está disponible en formato safetensors (14,6 GB) y su licencia es `other` debido a las licencias mixtas de los textos de entrenamiento (incluyendo material CC BY-NC-SA). No se especifica la longitud de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo3 7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incl. CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo3 7B, un transformer decoder-only de la familia OLMo de AI2, que es completamente abierta (pesos, datos, código y registros de entrenamiento). Sobre esta base, Urdatorn realizó un ajuste previo al griego antiguo (`olmo3-7b-ancient-greek`) y posteriormente un further-pretraining específico para Diodoro Sículo. El entrenamiento de este ALM consistió en modelado de lenguaje causal con secuencias de una sola frase, formateadas como `<|endoftext|> sentence <|endoftext|>`. Se utilizó early stopping basado en la pérdida de validación del propio autor: el mejor epoch fue el 3.0 de un máximo de 20 (con paciencia 3), alcanzando una pérdida de validación de 0,5192 nats/token. El learning rate fue constante de 1e-05 tras 25 pasos de warmup, con batch efectivo de 16 frases. El entrenamiento se realizó en precisión mixta (fp32 para pesos maestros, bf16 para cómputo) usando FSDP con sharding completo en 2 GPU GH200. Los pesos finales se guardaron en bf16. A diferencia del método original de Huang y colaboradores (que fijaba 100 epochs), aquí la duración se determina por evidencia de validación.

## Capacidades

- Atribución de autoría en griego antiguo: el modelo está diseñado para puntuar la perplejidad de frases y compararla con otros 16 modelos ALM del conjunto Sphragis.
- Modelado de lenguaje específico de autor: captura el estilo léxico, sintáctico y estadístico de Diodoro Sículo.
- Generación de texto en griego antiguo (como subproducto del modelado causal), aunque no es su propósito principal.
- Evaluación de similitud estilística: puede usarse para medir la distancia entre un texto anónimo y el corpus de Diodoro.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de lenguaje para tareas de perplejidad.
- Multilingüe: no, está especializado exclusivamente en griego antiguo.

## Casos de uso

- Atribución de autoría de textos clásicos anónimos: dado un fragmento sin autor conocido, se calcula la perplejidad con los 17 modelos ALM y se asigna al autor con menor sorpresa. Es el caso de uso principal del benchmark Sphragis.
- Análisis estilométrico en filología clásica: investigadores pueden usar el modelo para cuantificar la similitud entre obras atribuidas a Diodoro y otras obras dudosas, complementando métodos tradicionales.
- Verificación de autenticidad de fragmentos: en ediciones críticas, el modelo puede ayudar a decidir si un pasaje es consistente con el estilo de Diodoro o si podría ser interpolación de otro autor.
- Estudio de la evolución del estilo dentro del corpus de Diodoro: al puntuar frases de diferentes libros, se pueden detectar variaciones internas que sugieran diferentes etapas de redacción o colaboración.
- Entrenamiento de sistemas de atribución para otras lenguas: el código y la metodología (disponibles en el repositorio `sphragis_models`) pueden adaptarse a otros autores o idiomas, usando este modelo como referencia.
- Evaluación de modelos base para lenguas históricas: comparar la perplejidad de este ALM con la del modelo base sin adaptar permite medir el impacto del ajuste lingüístico previo.

## Benchmarks y rendimiento

En la model card se reporta que los diecisiete modelos ALM juntos alcanzan un macro-F1 de 0,800 en el split de validación `sentence_1` de Sphragis. Cuando los mismos diecisiete modelos se entrenan desde la base sin adaptar al griego antiguo, el macro-F1 es de 0,812. Esto indica que la adaptación previa al griego antiguo mejora la calidad del modelado del lenguaje (menor perplejidad) pero no aumenta la capacidad discriminativa del conjunto. No se proporcionan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas generales.

| Benchmark | Resultado |
|---|---|
| Macro-F1 (validación Sphragis, 17 modelos) | 0,800 |
| Macro-F1 (validación Sphragis, 17 modelos sin adaptación griega) | 0,812 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Al ser un modelo de 7B en bf16, se puede estimar que requiere aproximadamente 14-16 GB de VRAM para carga completa en memoria, pero este dato no está confirmado por el autor.
- GPU recomendadas: el entrenamiento se realizó en 2x GH200, pero para inferencia cualquier GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) sería suficiente. No se especifican requisitos mínimos.
- Compatibilidad con GPU de consumo: probablemente sí, en cuantizaciones de 4 bits u 8 bits, aunque no se han publicado versiones GGUF ni cuantizadas.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede cargarse con bibliotecas como Transformers, vLLM o llama.cpp (si se convierte a GGUF). No hay instrucciones específicas del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ALM comparables en la misma categoría (atribución de autoría en griego antiguo). El propio conjunto Sphragis incluye 17 modelos, pero no se han publicado comparativas externas. Se puede mencionar que el modelo base OLMo3 7B es una alternativa generalista, pero no está especializado en griego antiguo ni en atribución de autoría.

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo3-greek-7b-diodorus-siculus | 7,3B | no disponible | Griego antiguo, atribución de autoría | other |
| Urdatorn/olmo3-7b-ancient-greek | 7,3B | no disponible | Griego antiguo (modelado general) | Apache-2.0 |
| OLMo3 7B (AI2) | 7B | no disponible | Multilingüe general | Apache-2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente sobre el corpus de Diodoro Sículo, por lo que su conocimiento estilístico está limitado a ese autor y a las variantes dialectales del griego antiguo presentes en sus obras.
- Riesgo de alucinación: al ser un modelo de lenguaje causal, puede generar texto plausible pero no fiel a las fuentes históricas si se usa fuera del contexto de atribución.
- Limitaciones de contexto: no se especifica la longitud de contexto; se asume que es la del modelo base OLMo3, pero no está confirmado.
- Restricciones de licencia: la licencia `other` implica que el uso comercial puede estar restringido debido a los textos de entrenamiento con licencias CC BY-NC-SA. Es imprescindible revisar el archivo `LICENSES.md` del dataset Sphragis antes de cualquier reutilización.
- Caveat para producción: el modelo está pensado para investigación filológica, no para aplicaciones de producción general. Su uso requiere el conjunto completo de 17 modelos para la atribución, no funciona de forma aislada.
- Idiomas: solo griego antiguo; no soporta otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-diodorus-siculus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Modelo base adaptado al griego antiguo: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Repositorio de código (entrenamiento, puntuación y atribución): https://github.com/Urdatorn/sphragis_models
- Página de OLMo de AI2: https://allenai.org/olmo
- Tutorial sobre OLMo 3 (DigitalOcean): https://www.digitalocean.com/community/tutorials/olmo-3-allen-ai-open-source-llm
- Artículo de referencia (Huang, Murakami y Grieve, 2025): https://arxiv.org/pdf/2402.00838 (nota: el enlace corresponde al paper de OLMo, no al artículo de PLoS ONE; el DOI del artículo es 10.1371/journal.pone.0327081)
