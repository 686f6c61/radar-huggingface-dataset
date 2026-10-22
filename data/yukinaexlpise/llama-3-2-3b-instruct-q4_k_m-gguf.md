# YukinaExlpise/Llama-3.2-3B-Instruct-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_M de **Llama 3.2 3B Instruct**, el modelo instruido de 3.212.749.888 parámetros que Meta publicó el 25 de septiembre de 2024. La conversión la ha realizado el usuario YukinaExlpise mediante el espacio automatizado *gguf-my-repo*, reduciendo el modelo base a unos 2,0 GB para su ejecución local con llama.cpp y herramientas derivadas.

Llama 3.2 3B Instruct es un transformer autorregresivo con atención por grupos de consultas (GQA) y embeddings atados, optimizado por Meta para casos de uso en dispositivos edge: diálogo multilingüe (8 idiomas oficiales, incluido el español), seguimiento de instrucciones, resumen y tool calling, con una ventana de contexto de 128.000 tokens. Su relevancia actual radica en ofrecer capacidades de nivel 3B con contexto muy largo en hardware de consumo, incluyendo GPUs modestas, CPU y Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador autorregresivo (denso, no MoE) con GQA, RoPE, SwiGLU y embeddings atados |
| Parámetros totales | 3.212.749.888 (~3,21 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | Q4_K_M (GGUF, k-quant de 4 bits con tensores mixtos) en este repositorio; el modelo base se distribuye en BF16 y existen múltiples cuantizaciones comunitarias |
| Idiomas soportados | Inglés, alemán, francés, italiano, portugués, hindi, español y tailandés (8 idiomas oficiales) |
| Licencia | Llama 3.2 Community License (uso comercial permitido con condiciones; restricción para productos con más de 700 M de usuarios activos mensuales) |
| Formato de pesos | GGUF (archivo único de 2,0 GB en este repositorio); el modelo base está en safetensors/PyTorch |

## Arquitectura y entrenamiento

El modelo base es un transformer decodificador denso de 28 capas con dimensión oculta de 3.072, 24 cabezas de atención y 8 cabezas KV mediante GQA (grouped query attention), lo que reduce drásticamente el tamaño de la caché KV y mejora el throughput de inferencia con contextos largos. Emplea RoPE para la codificación posicional, normalización RMSNorm y activación SwiGLU. Una particularidad de la serie ligera de Llama 3.2 es el uso de embeddings atados (*tied embeddings*), que comparten pesos entre la capa de entrada y la de salida, reduciendo el número total de parámetros en modelos pequeños. El vocabulario es de 128.256 tokens.

Según la documentación de Meta, los modelos de 1B y 3B de la familia Llama 3.2 se derivaron de Llama 3.1 8B mediante técnicas de poda (*pruning*) y destilación, con un entrenamiento sobre hasta 9 billones de tokens (9·10^12) de datos públicos y una fecha de corte de conocimiento de diciembre de 2023. El post-entrenamiento combinó SFT, rechazo por muestreo (*rejection sampling*) y DPO para alinear el modelo con instrucciones y preferencias humanas. En cuanto a este repositorio concreto, la conversión a GGUF se realizó de forma automatizada: Q4_K_M es un k-quant de 4 bits que mantiene algunos tensores sensibles (atención y capas FFN) en precisión superior (Q6_K), con unos 4,8 bits efectivos por peso.

## Capacidades

- Generación de texto y diálogo multi-turno optimizado para instrucciones, en 8 idiomas oficiales incluido el español.
- Seguimiento de instrucciones y tareas de reescritura, resumen y corrección, perfil para el que Meta diseñó específicamente esta serie ligera.
- Tool calling / function calling soportado según la documentación de Meta, con integración nativa en runtimes como Ollama.
- Ventana de contexto de 128.000 tokens, útil para RAG, resumen de documentos largos y conversaciones extensas.
- Capacidades básicas de razonamiento, matemáticas y generación de código, acotadas por su tamaño de 3B (competente en tareas simples, limitado en problemas complejos).
- Sin capacidades de visión ni audio: los modelos multimodales de Llama 3.2 son los de 11B y 90B; esta variante es solo de texto.

## Casos de uso

- **Asistentes locales en dispositivos edge y portátiles:** con 2,0 GB de pesos funciona en portátiles, mini PCs y Apple Silicon sin GPU dedicada, ideal para asistentes privados que no envían datos a la nube.
- **Atención al cliente automatizada multilingüe:** el modelo gestiona conversaciones multi-turno en español y otros 7 idiomas, y su ventana de 128.000 tokens permite inyectar documentación de producto o histórico de tickets completo vía RAG.
- **Resumen y reescritura de documentos largos:** la longitud de contexto nativa permite condensar informes, contratos o hilos de correo de decenas de miles de tokens en una sola pasada.
- **Extracción de datos estructurados y function calling en pipelines:** puede invocar herramientas definidas por el desarrollador (búsquedas, APIs internas, cálculos) y devolver JSON, encajando en flujos de automatización y agentes ligeros.
- **Prototipado de agentes locales y multi-step reasoning:** su bajo coste de inferencia permite iterar cadenas de razonamiento y orquestaciones de agentes en local antes de escalar a modelos mayores.
- **Clasificación y etiquetado de texto a gran escala:** tareas como categorización de tickets, análisis de sentimiento o anonimización de PII se benefician de un modelo pequeño, rápido y barato de servir.
- **Asistencia de código básica en el editor:** generación de scripts, autocompletado simple y explicación de fragmentos, con la expectativa realista de un modelo de 3B (no sustituye a modelos de código especializados de mayor tamaño).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Meta publica resultados oficiales (MMLU, IFEval y otros) en la model card del modelo base meta-llama/Llama-3.2-3B-Instruct, enlazada al final de esta ficha; ten en cuenta además que cualquier cifra oficial corresponde al modelo en BF16, no a esta cuantización Q4_K_M.

## Requisitos de hardware

- **VRAM para inferencia (estimación orientativa):** ~2,0 GB para los pesos; ~3-4 GB de VRAM total con contextos de 2k-8k; ~6 GB con contextos de ~32k; para explotar los 128.000 tokens completos se requieren ~14-16 GB o el uso de caché KV cuantizada (q8_0/q4_0).
- **GPU recomendadas:** cabe con holgura en GPUs de consumo de 6-8 GB (RTX 3060, RTX 4060, RTX 4070); para contexto completo de 128k conviene una GPU de 16 GB o más (RTX 4060 Ti 16 GB, RTX 4090, A100).
- **Consumer GPUs y CPU:** funciona perfectamente en GPU de 4 GB para contextos cortos, en CPU moderna (10-20 tokens/s estimados con 8 núcleos y DDR5) y en Apple Silicon con 8 GB de memoria unificada o más.
- **Despliegue:** llama.cpp de forma nativa; también Ollama, LM Studio, KoboldCpp, Jan, llama-cpp-python y text-generation-webui. vLLM ofrece soporte GGUF experimental, aunque lo idiomático para este formato es el ecosistema llama.cpp.
- **Latencia y throughput:** no hay cifras publicadas para este repositorio; como referencia orientativa, una GPU de escritorio de gama alta supera los 100 tokens/s y una GPU de portátil ronda los 40-80 tokens/s con este tamaño y cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comentario |
|---|---|---|---|---|
| Llama 3.2 3B Instruct (base de esta ficha) | 3,21 B | 128.000 | Llama 3.2 Community | Contexto muy largo y tool calling; licencia con condiciones de atribución y MAU |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 (ampliable a 128k con YaRN) | Apache 2.0 | Licencia más permisiva y fuerte en multilingüe y código; contexto nativo menor |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 | MIT | Licencia muy permisiva y contexto largo; algo mayor en parámetros |
| Gemma 2 2B IT | 2,6 B | 8.192 | Gemma Terms of Use | Más pequeño y rápido, pero con ventana de contexto mucho más corta |

## Limitaciones y advertencias

- Riesgo de alucinación propio de modelos de 3B: en tareas factuales y de razonamiento complejo se queda claramente por debajo de modelos de 7B, 8B o superiores; verifica siempre las salidas en producción.
- La cuantización Q4_K_M implica una ligera pérdida de calidad respecto al modelo base en BF16, generalmente pequeña pero medible en tareas sensibles.
- Solo 8 idiomas están oficialmente optimizados; el rendimiento en otros idiomas es desigual y no garantizado.
- Fecha de corte de conocimiento de diciembre de 2023: carece de información posterior salvo que se le proporcione vía RAG o herramientas.
- Restricciones de licencia: exige atribución "Built with Llama", incluir la licencia en redistribuciones, cumplir la Acceptable Use Policy de Meta y, si el nombre del modelo derivado se redistribuye, anteponer "Llama"; los productos con más de 700 M de usuarios activos mensuales necesitan licencia específica de Meta.
- Repositorio comunitario generado de forma automatizada (gguf-my-repo), con 0 descargas en el momento de elaborar esta ficha: verifica la integridad del archivo y, para producción, considera cuantizaciones de repos con mayor trazabilidad o el modelo base oficial.
- No es un modelo multimodal: sin visión ni audio.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/YukinaExlpise/Llama-3.2-3B-Instruct-Q4_K_M-GGUF
- Modelo base (model card oficial de Meta con benchmarks): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Descargas y licencias de Llama: https://www.llama.com/llama-downloads
- Documentación oficial de Llama: https://llama.meta.com/doc/overview
- Acceptable Use Policy de Llama 3.2: https://www.llama.com/llama3_2/use-policy
- Repositorio de llama.cpp (runtime de referencia para GGUF): https://github.com/ggerganov/llama.cpp
- Variante oficial en Ollama: https://ollama.com/library/llama3.2
