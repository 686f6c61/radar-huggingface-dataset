# steampunque/Qwen3.6-35B-A3B-MP-GGUF

## Resumen

El modelo `steampunque/Qwen3.6-35B-A3B-MP-GGUF` es una cuantización GGUF de precisión mixta (mixed precision) del modelo original `Qwen/Qwen3.6-35B-A3B`, desarrollado por Alibaba Cloud dentro de la familia Qwen3.6. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35.505 millones de parámetros totales y solo 3.000 millones activos por token, lo que permite un rendimiento elevado con un coste computacional reducido. El autor de esta cuantización, `steampunque`, ha aplicado una estrategia de cuantización por capas con distintos niveles de precisión (Q4_K, Q5_K, Q6_K) para optimizar el equilibrio entre tamaño de archivo y calidad, logrando un archivo principal de aproximadamente 21,8 GB que cabe completamente en una GPU de 24 GB de VRAM.

El modelo base incorpora capacidades multimodales (visión y texto) mediante un proyector multimedia, así como una capa MTP (Multi-Token Prediction) de unos 0,5 mil millones de parámetros que acelera la generación. Esta versión cuantizada está pensada para ejecutarse en hardware de consumo mediante `llama.cpp`, con soporte para contextos muy largos (hasta 470.000 tokens usando extensión YARN). Su relevancia radica en ofrecer un modelo de razonamiento y visión de alto nivel ejecutable localmente en GPUs de gama media, algo poco habitual en modelos de este tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida, capa MTP y proyector de visión |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3 B (aproximadamente) |
| Longitud de contexto | Hasta 470.000 tokens con extensión YARN (base 262.144 tokens) |
| Tipos de cuantizacion | Q4_E_H (extendida, principal), Q4_K_M, Q5_K, Q6_K, Q8_0, F16 (según capa) |
| Idiomas soportados | No disponible (se asume multilingüe por ser un modelo Qwen, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE con 35,5 mil millones de parámetros totales y 3 mil millones activos por token. La arquitectura combina atención tradicional con capas SSM (State Space Model) en determinados bloques, como se refleja en la definición de capas de la cuantización (`S` para SSM, `F` para FFN, etc.). Además, incorpora una capa MTP (Multi-Token Prediction) de aproximadamente 0,5 B parámetros que permite predecir varios tokens a la vez, mejorando la velocidad de generación. El modelo es capaz de procesar imágenes mediante un proyector multimedia (mmproj) que se incluye en este repositorio.

Según la model card, el modelo es un "vision capable moe RL model", lo que indica que fue entrenado con técnicas de aprendizaje por refuerzo (RL) para optimizar el razonamiento. No se proporcionan detalles sobre el dataset de entrenamiento ni el número de tokens utilizados. La cuantización mixta aplicada por `steampunque` emplea exclusivamente quants de tipo K (Q4_K, Q5_K, Q6_K) para evitar la ralentización en CPUs antiguas o GPUs sin soporte para quants IQ. La configuración de capas se optimizó para lograr una tasa de éxito cercana al 100% en un conjunto de prompts de razonamiento con muestreo determinista.

## Capacidades

- Generación de texto y razonamiento complejo, con capacidad de activar un bloque de "thinking" (think block) de forma autónoma o forzada mediante tokens especiales.
- Procesamiento de imágenes (visión) gracias al proyector multimedia, permitiendo responder preguntas sobre contenido visual (probado con identificación de aves).
- Soporte de contexto muy largo (hasta 470.000 tokens) mediante extensión YARN, útil para tareas que requieren memoria extensa.
- Generación de código, aunque según las pruebas del autor no es robusta en todos los casos; funciona en algunos prompts pero falla en otros.
- Aceleración de generación mediante la capa MTP, que permite predecir múltiples tokens por paso.
- Capacidad de decidir automáticamente si usar el bloque de thinking o no, lo que reduce la latencia en tareas simples.

## Casos de uso

- Asistente conversacional local con visión: el modelo puede procesar imágenes y texto en una misma conversación, por ejemplo para describir objetos, responder preguntas sobre fotos o ayudar en tareas de identificación visual. Su tamaño cuantizado permite ejecutarlo en una GPU de 24 GB, ideal para entornos sin conexión a la nube.
- Razonamiento matemático y lógico: gracias a su bloque de thinking, el modelo puede abordar problemas que requieren varios pasos de deducción, como acertijos, problemas de lógica o preguntas de examen. La cuantización mantiene una calidad suficiente para estos casos, como demuestra su alto éxito en el conjunto de prompts de evaluación del autor.
- Análisis de documentos extensos: con una ventana de contexto de hasta 470.000 tokens, el modelo puede procesar libros completos, informes largos o transcripciones de reuniones, resumiendo o extrayendo información relevante sin perder el hilo.
- Prototipado de agentes con razonamiento multi-paso: aunque no se confirma soporte explícito de tool calling, el modelo puede encadenar razonamientos y generar respuestas estructuradas, útil para experimentar con flujos de agente en entornos de investigación.
- Despliegue en dispositivos edge: según Jetson AI Lab, el modelo es adecuado para plataformas como Jetson, gracias a sus 3 B parámetros activos que reducen la carga computacional. Esto permite ejecutar un asistente con visión en robots o sistemas embebidos.
- Evaluación de técnicas de cuantización: al ser una implementación de precisión mixta por capas, sirve como referencia para investigadores que estudian el impacto de diferentes niveles de cuantización en la calidad del modelo, comparando con versiones Q4_K_M estándar.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona que se publicarán próximamente en el espacio de Hugging Face `steampunque/benchlm`, pero a fecha de redacción no hay datos concretos. El autor indica que en su conjunto de evaluación de prompts de razonamiento el modelo obtuvo un rendimiento excepcional, fallando solo en un prompt de test de IQ, tanto en modo think como nothink. Sin embargo, no se proporcionan métricas estándar comparables.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_E_H de ~21,8 GB cabe completamente en una GPU de 24 GB de VRAM, dejando espacio para el proyector de visión y el contexto.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), o configuraciones de doble GPU como 2x RTX 4070 mediante RPC (Remote Procedure Call) para mayor velocidad.
- En configuraciones con una sola GPU de 12 GB (como RTX 4070) se puede usar offload de capas de expertos a CPU (`-ot exps=CPU -ngl 99`), manteniendo una velocidad de generación aceptable (31 tps según el autor).
- Opciones de despliegue: `llama.cpp` (versión con soporte MTP, a partir de b9180), con posibilidad de usar RPC para múltiples GPUs. No se menciona compatibilidad con vLLM u Ollama en la documentación.
- Rendimiento medido por el autor: en una RTX 4070 con offload de expertos a CPU (9900k) se obtienen ~31 tokens por segundo; con 2x RTX 4070 en RPC se alcanzan ~85 tps (con QKV en F16) o ~66 tps (con Q8_0). Con la torre de visión activa, ~88-91 tps.
- Para contextos largos, se requiere configurar YARN con `--rope-scaling yarn --yarn-orig-ctx 262144 --rope_scale 1.83` (ajustando según el tamaño de KV cache).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35,5 B | 3 B | 256k (extensible) | Apache 2.0 | safetensors | Modelo base sin cuantizar, requiere ~70 GB VRAM en FP16 |
| steampunque/Qwen3.6-35B-A3B-MP-GGUF | 35,5 B | 3 B | 470k (con YARN) | Apache 2.0 | GGUF | Cuantización mixta por capas, ~21,8 GB |
| Qwen_Qwen3.6-35B-A3B-GGUF (bartowski) | 35,5 B | 3 B | No especificado | Apache 2.0 | GGUF | Cuantización estándar con imatrix, tamaños de 8,52 GB a 69,38 GB |

La principal diferencia entre la versión de `steampunque` y la de `bartowski` es la estrategia de cuantización: la primera usa precisión mixta por capas con quants K, mientras que la segunda emplea cuantización uniforme con imatrix. La versión de `steampunque` está optimizada específicamente para caber en 24 GB de VRAM y mantener una alta calidad de razonamiento, mientras que la de `bartowski` ofrece más opciones de tamaño. El modelo original sin cuantizar es la referencia de calidad, pero requiere hardware de mayor capacidad.

## Limitaciones y advertencias

- La generación de código no es robusta: según las pruebas del autor, el modelo falla en algunos prompts de generación de código, por lo que no es recomendable para entornos de producción donde se requiera fiabilidad en esta tarea.
- Puede caer en "overthinking" (razonamiento excesivo) en ciertos prompts, lo que aumenta la latencia y el consumo de tokens. Se recomienda inyectar tokens de inicio y fin de thinking para controlar este comportamiento.
- Requiere una versión de `llama.cpp` con soporte MTP (a partir de b9180). Si se usa una versión anterior, se generarán avisos de tensores no utilizados, aunque el modelo puede ejecutarse.
- Existe un bug en versiones recientes de `llama.cpp` que limita el contexto a la longitud de entrenamiento, deshabilitando la extensión YARN. Se necesita parchear `server-context.cpp` según la issue #22140.
- No se han publicado datos sobre sesgos o alucinaciones específicos de esta cuantización. Al ser un modelo RL, puede presentar comportamientos impredecibles en dominios no cubiertos por su entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original de Qwen para asegurar el cumplimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/steampunque/Qwen3.6-35B-A3B-MP-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Espacio de benchmarks (pendiente de publicación): https://huggingface.co/spaces/steampunque/benchlm
- Guía de despliegue local (en inglés): https://knightli.com/en/2026/05/24/qwen36-35b-a3b-local-deployment-llamacpp-gguf/
- Página de Jetson AI Lab sobre el modelo: https://www.jetson-ai-lab.com/models/qwen3-6-35b-a3b/
- Issue de llama.cpp sobre el bug de contexto: https://github.com/ggml-org/llama.cpp/issues/22140
