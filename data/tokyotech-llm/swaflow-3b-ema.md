# tokyotech-llm/SwaFlow-3B-EMA

## Resumen

SwaFlow-3B-EMA es un modelo de lenguaje de 3.740 millones de parámetros desarrollado por AIST y el Institute of Science Tokyo en el marco del programa nacional japonés FRONTia (METI/NEDO). Se trata de un modelo de flujo riemanniano (hipersférico) no autorregresivo: en lugar de predecir el siguiente token, integra un flujo sobre la esfera desde ruido puro hasta datos limpios, usando los tokens de prefijo como condición. Es el miembro final de la suite SwaFlow, obtenido mediante promediado exponencial de pesos (EMA con decaimiento 2^(-100/t)) a partir de los 200 estados completos guardados cada 20.000 millones de tokens durante el entrenamiento.

El modelo no está pensado para aplicaciones de producción, sino como herramienta de investigación abierta: la suite incluye varios tamaños entrenados con una misma receta, estados intermedios de entrenamiento, un orden de datos compartido y "gemelos" autorregresivos entrenados sobre los mismos datos para comparar paradigmas. La arquitectura es un transformer de 28 capas, anchura 3072, 24 cabezas de atención y FFN de 8192, con un vocabulario de 49.152 tokens (tokenizador de SmolLM2) y una ventana de contexto de 2.048 tokens.

Es relevante ahora porque abre a la comunidad un paradigma alternativo al autorregresivo con transparencia poco habitual: pesos, estados de entrenamiento, código y datos compartidos. Sin embargo, el propio autor advierte que la calidad del texto generado es baja y que todos los gemelos autorregresivos, incluso el de 150M, superan al flujo de 3B en tareas de elección múltiple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con flow matching riemanniano (hipersférico); 28 capas, anchura 3072, 24 cabezas, FFN 8192 |
| Parametros totales | 3.741.325.312 (3,74B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (tokenizador SmolLM2 también Apache 2.0; datos de preentrenamiento ODC-By 1.0) |
| Formato de pesos | safetensors (fp32) + config.json; librería pytorch |

## Arquitectura y entrenamiento

SwaFlow-3B-EMA es un modelo de lenguaje de flujo riemanniano: representa los estados como puntos en una hipersfera y aprende un campo de flujo que transporta ruido (α = 0) hacia datos limpios (α = 1). La generación se realiza integrando ese flujo con un número configurable de evaluaciones de función (`steps`, 64 en el ejemplo de la model card) y manteniendo los `prefix_tokens` limpios como condición. La ventana de entrenamiento en la variable de tiempo es α ∈ [0, 0,10], y la decodificación se controla mediante `SamplerConfig` (pasos, temperatura y regla de decodificación). El transformer subyacente tiene 28 capas, anchura 3072, 24 cabezas y FFN de 8192, con vocabulario de 49.152 tokens del tokenizador de SmolLM2.

El entrenamiento se realizó sobre 4 billones (4T) de tokens de Dolma 3 Mix (Allen Institute for AI, licencia ODC-By 1.0, pesos de mezcla sin modificar), con pasos de 4.096 × 2.048 tokens, optimizador AdamW y tasa de aprendizaje 3e-4 constante tras el calentamiento, sobre 32 nodos × 8 NVIDIA H200. El proceso consta de preentrenamiento con α uniforme hasta 3T tokens y mid-training con prefijo limpio hasta 4T. Los pesos publicados son la media exponencial móvil con decaimiento 2^(-100/t) en el paso t, reconstruida a posteriori con `scripts/posthoc_ema.py` a partir de los 200 estados completos guardados cada 20B tokens. El modelo base es SwaFlow-3B, que publica parte de esos estados.

## Capacidades

- Generación de texto no autorregresiva mediante integración de flujo sobre la esfera, condicionada por un prefijo limpio.
- Control explícito del proceso de muestreo: número de evaluaciones de función, temperatura y regla de decodificación vía `SamplerConfig`.
- Generación de secuencias completas de una vez (hasta 256 tokens adicionales al prefijo en el ejemplo oficial), sin bucle token a token.
- Capacidad de continuación de texto a partir de un prefijo (`prefix_tokens` / `prefix_lengths`).
- Soporte de parada mediante el token `<|endoftext|>` (id 0).
- Entrenamiento exclusivamente en inglés; no se documentan capacidades multilingües.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- No hay versión instruction-tuned incluida en esta release (la model card menciona que existen variantes instruction-tuned de la suite, pero advierte que su texto también suele ser incoherente).

## Casos de uso

- Investigación sobre modelos de lenguaje de flujo: el modelo sirve como referencia reproducible para estudiar flow matching riemanniano a escala de 3B, con receta, datos y estados intermedios publicados.
- Comparación de paradigmas generativos: junto con los gemelos autorregresivos de la suite entrenados sobre los mismos datos, permite aislar el efecto del paradigma (flujo frente a autorregresivo) controlando datos y receta.
- Estudio de promediado de pesos (EMA): los 200 estados guardados cada 20B tokens permiten analizar cómo evoluciona la media exponencial y su efecto en la calidad final.
- Experimentos de muestreo y decodificación: la API `SamplerConfig` permite variar pasos de integración, temperatura y reglas de decodificación para medir su impacto en coherencia y diversidad.
- Reproducción de entrenamiento a menor escala: el código (`swallow-llm/swaflow-suite`) y el orden de datos compartido facilitan replicar la receta en configuraciones más pequeñas.
- Docencia y formación: ilustra de forma práctica las diferencias entre generación autorregresiva y generación por integración de flujo, con código ejecutable y pesos abiertos.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código o cualquier tarea que exija coherencia textual, según las propias limitaciones declaradas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica, de forma cualitativa, que en tareas de elección múltiple todos los gemelos autorregresivos de la suite (incluido el de 150M) obtienen de media puntuaciones superiores al modelo de flujo de 3B final.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 15 GB solo para pesos (3,74B × 4 bytes), más activaciones y estados del sampler; se recomienda al menos 24 GB para margen operativo.
- GPU recomendadas: NVIDIA H200 (hardware de entrenamiento declarado), A100 y H100 para inferencia sin restricciones; una RTX 4090 (24 GB) podría alojar los pesos en fp32, aunque no se documenta rendimiento en consumer.
- Cabe en GPU de consumo de gama alta con 24 GB o más en fp32; no se han publicado versiones cuantizadas que reduzcan el requisito.
- Opciones de despliegue: el código oficial (`swallow-llm/swaflow-suite`, módulos `torchtitan.models.swaflow`) con PyTorch y CUDA; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo es no autorregresivo y requiere un sampler de flujo específico.
- Latencia y throughput: no disponibles. El coste depende del número de pasos de integración (`steps`), que multiplica las evaluaciones de función por paso de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Notas |
|---|---|---|---|---|---|
| SwaFlow-3B-EMA | 3,74B | 2.048 | Flujo riemanniano no autorregresivo | Apache 2.0 | Pesos EMA; calidad de texto baja según el autor |
| SwaFlow-3B (base) | 3,74B | 2.048 | Flujo riemanniano no autorregresivo | Apache 2.0 | Publica estados de entrenamiento; mismo recipe |
| Gemelos autorregresivos de la suite | Varios tamaños (incl. 150M) | No disponible | Autorregresivo | No disponible | Entrenados sobre los mismos datos; superan al flujo de 3B en elección múltiple según el autor |
| SmolLM2-135M (tokenizador compartido) | 135M | No disponible | Autorregresivo | Apache 2.0 | Solo comparte tokenizador; no es comparable en escala ni en paradigma |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría (modelos de flujo abiertos de tamaño similar); la comparación disponible es cualitativa y procede de la propia model card.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no está destinado a aplicaciones: es una herramienta de investigación sobre flow language models.
- El texto generado es a menudo incoherente, incluso en las variantes instruction-tuned de la suite.
- En tareas de elección múltiple, todos los gemelos autorregresivos (incluido el de 150M) superan de media al flujo de 3B final.
- Ninguno de los modelos de la suite está ajustado para evitar contenido dañino; no hay filtrado de seguridad documentado.
- Sesgos conocidos: no documentados de forma específica, pero hereda los del corpus Dolma 3 Mix.
- Riesgo de alucinación: alto, coherente con la baja coherencia textual declarada.
- Limitaciones de idioma: solo inglés; no se documenta soporte multilingüe.
- Ventana de contexto corta (2.048 tokens) para estándares actuales.
- Restricciones de licencia: pesos Apache 2.0 permiten uso comercial, pero los datos de preentrenamiento están bajo ODC-By 1.0 y el modelo no es apto para producción por calidad, no por licencia.
- Requiere código específico (`swallow-llm/swaflow-suite`) y sampler de flujo; no es compatible con stacks de inferencia autorregresivos estándar.
- Pesos en fp32 (15 GB de repo); no hay cuantizaciones oficiales publicadas.
- Modelo recién publicado (noviembre de 2026) con 0 descargas y 0 likes: sin validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-3B-EMA
- Modelo base (estados de entrenamiento): https://huggingface.co/tokyotech-llm/SwaFlow-3B
- Colección de la suite SwaFlow: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Código: https://github.com/swallow-llm/swaflow-suite
- Dataset de preentrenamiento (Dolma 3 Mix): https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Tokenizador (SmolLM2-135M): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Cita: Oba, Daisuke; Mizuki, Sakae; Takamura, Hiroya; Okazaki, Naoaki (2026), "SwaFlow: A Fully Open Suite for Studying Riemannian Flow Language Models Across Training and Scale" (nota: "coming soon", sin URL de paper disponible)
