# tattrongvu/Kimi-K3-reap50-exp

## Resumen

Kimi-K3-reap50-exp es una variante experimental del modelo Kimi-K3 de Moonshot AI, publicada por el usuario tattrongvu en Hugging Face. Se trata de un modelo podado mediante la técnica REAP (saliency-based expert pruning, arXiv:2510.13999) que elimina el 50 % de los expertos enrutados en cada capa MoE, pasando de 896 a 448 expertos por capa. El objetivo es reducir el tamaño del checkpoint de 1,45 TB a 780 GB (los pesos de los expertos en formato MXFP4 se conservan bit-exact), permitiendo servir el modelo en un único nodo de 8 GPU.

El modelo base, Kimi-K3, es un modelo abierto de 2,8 billones de parámetros (2,8T) con arquitectura MoE híbrida basada en Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con visión nativa, contexto de 1 millón de tokens y 104B de parámetros activos. Esta variante podada mantiene las mismas capacidades generales, pero la poda se calibró exclusivamente con datos de codificación, razonamiento y tool-calling, por lo que el rendimiento fuera de esos dominios puede degradarse. Es una versión experimental con cobertura de evaluación limitada, pensada para entornos de investigación y despliegue con recursos reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 1.418.265.944.576 (≈1,42 billones) |
| Parametros activos | no disponible (original: 104B) |
| Longitud de contexto | 1M (heredado del original Kimi-K3, no confirmado en la variante) |
| Tipos de cuantizacion | MXFP4 (expertos preservados bit-exact), referencia a 8-bit en tags |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi-K3-reap50-exp parte del modelo Kimi-K3 original, que emplea una arquitectura MoE híbrida con 93 capas (1 densa y 92 MoE) y 896 expertos por capa, de los cuales se activan 16 por token. La innovación principal de Kimi-K3 es la combinación de Kimi Delta Attention (KDA), una atención lineal híbrida que reduce el coste computacional en contextos largos, y Attention Residuals (AttnRes), que mejora la estabilidad del entrenamiento. Sobre esta base, la variante podada aplica REAP, una técnica de poda por saliencia que elimina el 50 % de los expertos enrutados (896 → 448) manteniendo los pesos restantes en MXFP4 sin pérdida. La calibración de la poda se realizó sobre una mezcla pública de datos de codificación, razonamiento y tool-calling (evol-codealpaca, Mixture-of-Thoughts, glaive-function-calling-v2, SWE-smith-trajectories). No se dispone de información detallada sobre el entrenamiento completo del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y ciencias (resultados en GSM8K y MMLU-Pro).
- Codificación de largo recorrido: capaz de mantener sesiones de ingeniería prolongadas, navegar repositorios grandes y orquestar herramientas de terminal.
- Soporte de tool calling y function calling, integrado en el proceso de calibración de la poda.
- Capacidades agénticas: razonamiento multi-paso y uso de herramientas para tareas de conocimiento.
- Multimodalidad nativa: comprensión de texto, imágenes y vídeo dentro del mismo modelo (heredado del original).
- Contexto largo de 1 millón de tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidades multilingües: no especificadas para esta variante, aunque el original soporta múltiples idiomas (sin detalle).

## Casos de uso

- Asistente de codificación en entornos de desarrollo: el modelo puede generar, revisar y depurar código en sesiones largas, apoyándose en su contexto de 1M tokens para mantener el estado completo del repositorio y las instrucciones del usuario.
- Agente de automatización de tareas de terminal: gracias al soporte de tool calling, puede ejecutar comandos, interpretar salidas y tomar decisiones en pipelines de CI/CD o en entornos de administración de sistemas.
- Investigación y razonamiento matemático: con resultados sólidos en GSM8K (0,978) y MMLU-Pro/math (0,956), es útil para asistencia en problemas de matemáticas y ciencias, siempre que el dominio esté dentro de los datos de calibración.
- Generación de informes técnicos y documentación: su capacidad de razonamiento y procesamiento de contexto largo permite resumir y redactar documentación a partir de grandes volúmenes de texto técnico.
- Prototipado de aplicaciones multimodales: al heredar la visión nativa del original, puede procesar capturas de pantalla, diagramas o vídeos para tareas de análisis visual, aunque la poda puede afectar a este dominio.
- Despliegue en infraestructura con recursos limitados: al caber en un nodo de 8 GPU, es una opción para organizaciones que necesitan un modelo de gran tamaño sin acceso a clústeres masivos, priorizando tareas de codificación y razonamiento.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a evaluaciones con temperatura 1 y servidos con vLLM, comparando la variante podada con el Kimi-K3 original cuando está disponible:

| Benchmark | Kimi-K3-reap50-exp | Kimi-K3 |
|---|---|---|
| GSM8K | 0,978 | 0,976 |
| MMLU-Pro / math | 0,956 | no disponible |
| MMLU-Pro / chemistry | 0,924 | no disponible |
| MMLU-Pro / computer science | 0,890 | no disponible |
| MMLU-Pro / engineering | 0,871 | no disponible |
| MMLU-Pro / law (parcial) | 0,617 | no disponible |

Estos datos indican que la poda no degrada el rendimiento en GSM8K (incluso mejora ligeramente) y ofrece resultados razonables en dominios STEM, aunque la cobertura de evaluación es limitada y no se proporcionan resultados en otros benchmarks estándar como HumanEval o MMLU completo.

## Requisitos de hardware

- La model card indica que el checkpoint reducido (780 GB) puede servirse en un único nodo de 8 GPU, aunque no especifica el modelo de GPU concreto.
- Con 1,42 billones de parámetros totales y pesos MXFP4, la VRAM necesaria para inferencia completa es del orden de 800-900 GB, lo que implica GPUs de alta capacidad (por ejemplo, 8 × H100 80GB o 8 × A100 80GB) o configuraciones con múltiples GPUs.
- No es viable en GPUs de consumo (RTX 4090, etc.) debido al tamaño del modelo y la necesidad de memoria agregada.
- Opciones de despliegue: vLLM (usado en las evaluaciones), y potencialmente otros frameworks compatibles con MoE y pesos MXFP4, aunque no se mencionan explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa más directa es con el Kimi-K3 original, del que deriva:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento GSM8K | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3-reap50-exp | 1,42T (podado) | 1M (heredado) | kimi-k3 | 0,978 | Hugging Face |
| Kimi-K3 (original) | 2,8T | 1M | kimi-k3 | 0,976 | Hugging Face, ModelScope |

No se dispone de datos de otros modelos comparables en la misma categoría (MoE de gran escala podados) en la información proporcionada. La variante podada ofrece una reducción significativa de recursos (780 GB frente a 1,45 TB) con un rendimiento similar en las tareas evaluadas, lo que la convierte en una alternativa práctica para entornos con limitaciones de hardware.

## Limitaciones y advertencias

- Versión experimental: la cobertura de evaluación es limitada y los resultados pueden no generalizar a todos los dominios.
- La poda se calibró únicamente con datos de codificación, razonamiento y tool-calling; las capacidades fuera de estos dominios (por ejemplo, tareas multimodales complejas o conocimiento general) pueden degradarse notablemente.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño, especialmente en tareas no cubiertas por los datos de calibración.
- La licencia kimi-k3 puede imponer restricciones de uso comercial; es necesario revisar los términos completos antes de desplegar en producción.
- No se especifican los idiomas soportados ni se proporcionan detalles sobre sesgos o comportamientos indeseados.
- El tamaño del modelo (1,42T parámetros) sigue siendo elevado y requiere infraestructura especializada; no es adecuado para entornos de desarrollo o edge.
- No se ha confirmado que la longitud de contexto de 1M se mantenga íntegramente tras la poda.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tattrongvu/Kimi-K3-reap50-exp)
- [Modelo original Kimi-K3](https://huggingface.co/moonshotai/Kimi-K3)
- [Paper REAP (arXiv:2510.13999)](https://arxiv.org/abs/2510.13999)
- [Blog técnico de Kimi K3](https://www.kimi.com/blog/kimi-k3)
- [Informe técnico completo de Kimi K3 (PDF)](https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf)
- [Documentación de la API de Kimi K3](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)
