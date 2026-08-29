# Urdatorn/sphragis-alm-olmo1b-metre-callimachus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-metre-callimachus` es un modelo de lenguaje autoría (authorial language model, ALM) desarrollado por Urdatorn para la atribución de autoría en griego antiguo. Forma parte de un conjunto de 17 modelos, cada uno entrenado sobre los textos de un autor concreto del benchmark Sphragis-Metre, siguiendo la metodología de Huang, Murakami y Grieve (2025). Este modelo concreto se especializa en la obra de Calímaco, poeta helenístico, y se utiliza para calcular la perplejidad de frases y atribuir su autoría comparando con los otros 16 modelos.

Se basa en el modelo `allenai/OLMo-1B-hf` de AI2, un transformer decoder-only de 1.176.764.416 parámetros (aproximadamente 1,17 mil millones), y se somete a un pre-entrenamiento adicional (further-pretraining) sobre 1.100 filas de texto de Calímaco, con 34.230 tokens puntuados. El modelo está pensado exclusivamente para tareas de atribución de autoría en griego antiguo, no como un modelo de propósito general. Su relevancia radica en que ofrece una herramienta especializada y reproducible para la investigación filológica y estilométrica, con un enfoque en la evaluación basada en evidencia de validación en lugar de épocas fijas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-1B-hf) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, idéntico en arquitectura al OLMo-1B-hf de AI2, con atención causal y capas de pre-normalización. No emplea mezcla de expertos (MoE) ni arquitecturas híbridas. El entrenamiento consistió en un pre-entrenamiento adicional (further-pretraining) sobre el modelo base, con un objetivo de modelado de lenguaje causal sobre secuencias de una sola frase delimitadas por tokens `<|endoftext|>`. Se utilizaron 2 épocas, una tasa de aprendizaje de 5e-05 constante tras 25 pasos de calentamiento, un batch efectivo de 16 frases y precisión mixta (fp32 para pesos maestros, bf16 para cómputo) con FSDP en 2 GPU GH200. La duración del entrenamiento se seleccionó mediante ascenso por coordenadas sobre la macro-F1 de atribución en validación, en lugar de usar un número fijo de épocas como en el trabajo original de Huang y colaboradores. Esta elección optimiza directamente la capacidad del modelo para distinguir a su autor frente a los demás, no su perplejidad intrínseca.

## Capacidades

- Generación de texto causal: puede generar texto en griego antiguo, aunque no es su propósito principal.
- Cálculo de perplejidad por token: diseñado para puntuar frases y comparar la verosimilitud entre modelos de distintos autores.
- Atribución de autoría: al combinarse con los otros 16 modelos del conjunto, permite atribuir un texto a uno de los 17 autores del benchmark.
- Especialización en un autor concreto: entrenado exclusivamente sobre textos de Calímaco, lo que maximiza su sensibilidad a las características estilísticas de este autor.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: el modelo se usa para puntuar frases de un texto dudoso y comparar la perplejidad con los otros 16 ALMs; la autoría se asigna al modelo que encuentre la frase menos sorprendente. Es adecuado para investigaciones filológicas sobre autoría de fragmentos o poemas atribuidos a Calímaco.
- Análisis estilométrico cuantitativo: permite medir la distancia estilística entre un texto y el corpus de Calímaco mediante la perplejidad, complementando métodos tradicionales de análisis de frecuencia léxica.
- Validación de ediciones críticas: al evaluar variantes textuales, el modelo puede indicar cuál de ellas es más consistente con el estilo de Calímaco, ayudando a los editores a tomar decisiones.
- Investigación en autoría computacional: sirve como referencia para comparar métodos de atribución basados en modelos de lenguaje frente a técnicas clásicas (análisis de n-gramas, etc.).
- Entrenamiento de modelos similares: el código y la metodología documentados permiten replicar el proceso para otros autores o idiomas, adaptando el pipeline a nuevos corpus.
- Evaluación de modelos de lenguaje para lenguas clásicas: al ser un modelo especializado en griego antiguo, puede usarse como punto de partida para estudiar el comportamiento de modelos de 1B en lenguas de baja representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la informacion disponible. El conjunto completo de 17 modelos alcanza una macro-F1 de 56,81 en la partición `verse_1`, 76,15 en `verse_5`, 80,99 en `verse_10` y 72,88 en `verse_50` del benchmark Sphragis-Metre, pero estos datos corresponden al sistema conjunto, no a este modelo aislado. No se dispone de métricas por autor.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1,17B parámetros en bf16, el peso ocupa aproximadamente 2,3 GB. Con overhead de activaciones y KV cache, se estima que cabe en una GPU con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) usando cuantización de 8 bits o 4 bits.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM es suficiente para inferencia. Para entrenamiento se usaron 2x GH200, pero no es necesario para uso en inferencia.
- Compatibilidad con consumer GPU: sí, es viable en tarjetas como RTX 3090, RTX 4090, o incluso en CPU con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: al ser un modelo estándar de HuggingFace, puede servirse con vLLM, TGI, o ejecutarse con llama.cpp/Ollama tras conversión a GGUF. También es posible usarlo directamente con la librería `transformers` de HuggingFace.
- Latencia y throughput: no se han publicado datos oficiales. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificación de unos 10-20 ms por token y un throughput de varios cientos de tokens por segundo en batch, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo1b-metre-callimachus | 1,17B | no disponible | Griego antiguo, autor Calímaco | other | HuggingFace |
| allenai/OLMo-1B-hf (modelo base) | 1,17B | 2048 (según documentación de OLMo) | Inglés general | Apache-2.0 | HuggingFace |
| Urdatorn/sphragis-alm-olmo3-7b-plutarch (otro ALM del mismo autor) | 7B | no disponible | Griego antiguo, autor Plutarco | other | HuggingFace |

La comparativa se limita a modelos relacionados por origen o propósito. No hay datos de rendimiento individuales para establecer una comparación cuantitativa. El modelo base OLMo-1B es de propósito general y no está adaptado al griego antiguo, mientras que los ALMs de Sphragis son especializados y no comparables en tareas generales.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente sobre textos de Calímaco, por lo que su comportamiento está fuertemente sesgado hacia el estilo de este autor. No es adecuado para otros autores ni para griego moderno.
- Riesgo de alucinación: al ser un modelo de lenguaje causal, puede generar texto plausible pero no fiable; no está diseñado para generar contenido factual.
- Limitaciones de contexto: la longitud de contexto no se especifica, pero al derivar de OLMo-1B probablemente sea de 2048 tokens, lo que limita el análisis a frases o pasajes cortos.
- Restricciones de licencia: la licencia `other` se debe a que los textos de entrenamiento provienen de fuentes con licencias mixtas, incluyendo CC BY-NC-SA. Esto puede impedir el uso comercial o la redistribución sin verificación de las licencias originales. Se recomienda revisar el archivo `LICENSES.md` del dataset antes de cualquier uso.
- Caveat para producción: este modelo no es apto para aplicaciones de producción general; su único propósito es la atribución de autoría en el contexto del benchmark Sphragis-Metre. No debe usarse como modelo de lenguaje conversacional ni para generación de texto en aplicaciones reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-metre-callimachus
- Dataset Sphragis-Metre: https://huggingface.co/datasets/Urdatorn/sphragis-metre
- Código de entrenamiento y atribución: https://github.com/Urdatorn/sphragis_models
- Paper de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081 (no se proporciona URL directa)
- Repositorio de OLMo (modelo base): https://github.com/allenai/OLMo
- Paper de OLMo: https://arxiv.org/html/2402.00838v1
