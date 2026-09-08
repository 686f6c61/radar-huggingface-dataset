# Unravler/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una versión modificada del modelo GLM-5.3, un modelo de lenguaje de gran tamaño con arquitectura MoE y atención sparse, desarrollado por zai-org. La variante publicada por Unravler (con etiqueta de autoría del proyecto dealignai) está cuantizada en FP8 y ha sido sometida a un proceso de "abliteration" para reducir los rechazos de seguridad específicamente en el dominio de la ciberseguridad ofensiva. Se trata de un modelo textual de 753.329.940.480 parámetros totales (aproximadamente 753.3 mil millones), con 78 capas, capaz de manejar hasta 131.072 tokens de contexto en la configuración de despliegue documentada.

El propósito principal es cubrir el vacío existente en los modelos de gran tamaño que suelen rechazar peticiones relacionadas con pruebas de penetración, red teaming, desarrollo de exploits, ingeniería inversa o análisis de malware. Según los datos de la model card, la modificación se aplica directamente sobre los pesos en bfloat16 de los escritores residuales, sin necesidad de fine-tuning, LoRA, ni trucos de prompting. Es una solución de carácter técnico, orientada a profesionales que necesitan un modelo que no actúe como un filtro de rechazo en este nicho concreto, manteniendo el resto de capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM MoE con DeepSeek-sparse attention (glm_moe_dsa), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (~753.3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configuracion de despliegue documentada) |
| Tipos de cuantizacion | FP8 (rutas de expertos en FP8, residuos en bfloat16) |
| Idiomas soportados | ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano, japones |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizacion FP8) |

## Arquitectura y entrenamiento

El modelo es la cuantización FP8 del modelo base zai-org/GLM-5.3, realizada por JANGQ-AI. La arquitectura es un transformer Mixture of Experts con atención sparse (denominada glm_moe_dsa en los metadatos), compuesta por 78 capas y orientada exclusivamente a entrada y salida de texto. La cuantización FP8 conserva los pesos de los expertos en formato FP8 y mantiene los escritores residuales en bfloat16.

La modificación aplicada en la variante CYBERSECURITY-FP8 se denomina "CRACK" y consiste en una alteración de los pesos residuales en bfloat16 mediante abliteration, sin fine-tuning adicional, sin LoRA ni hooks en tiempo de ejecución. El objetivo es reducir los rechazos en el ámbito de la ciberseguridad ofensiva. Los datos de entrenamiento del modelo base no se detallan en la documentación disponible, pero la edición de pesos no implica un nuevo proceso de entrenamiento, por lo que las capacidades generales del modelo base se mantienen, excepto en el comportamiento de rechazo. La model card señala que la eliminación de rechazos se generaliza más allá de la ciberseguridad, pero no de forma universal; la reproducción literal de contenido con derechos de autor sigue presentando rechazos.

## Capacidades

- Generación de texto conversacional en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Razonamiento con soporte de modo de pensamiento: la configuración de despliegue incluye el parámetro `--reasoning-parser glm45`, lo que indica compatibilidad con un modo de razonamiento estructurado.
- Tool calling y function calling: soportado mediante `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Análisis y generación de contenido técnico de ciberseguridad ofensiva: pentesting, red teaming, desarrollo de exploits, ingeniería inversa, evasión de controles, phishing, ataques de credenciales y análisis de malware.
- Alta tasa de cumplimiento en comportamientos de ciberofensa: según las evaluaciones HarmBench-320, alcanza entre el 84% y el 89% de cumplimiento directo en este dominio, con muy pocos rechazos.
- Sin capacidades multimodales: el modelo es solo texto, sin entrada ni salida de imágenes o audio.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo puede generar comandos, scripts y técnicas de ataque para validar la seguridad de infraestructuras. Su alta tasa de cumplimiento en comportamientos de ciberofensa (89% en la evaluación HarmBench) lo hace idóneo para este escenario.
- Desarrollo de exploits en ejercicios de red team: asistencia en la creación de payloads y exploits para demostrar vulnerabilidades en entornos controlados, aprovechando la eliminación de rechazos en este dominio.
- Análisis de malware: el modelo puede desglosar y explicar código malicioso, ayudar en la identificación de patrones de comportamiento y proponer técnicas de mitigación, todo ello con una ventana de contexto de 131.000 tokens para manejar análisis extensos.
- Entrenamiento en seguridad ofensiva: generación de material didáctico avanzado sobre técnicas de ataque, sin necesidad de recurrir a filtros de seguridad que bloqueen el contenido. La capacidad de tool calling permite crear ejercicios interactivos automatizados.
- Automatización de pruebas de seguridad en CI/CD: integración del modelo en pipelines de DevOps para generar tests de intrusión automatizados, gracias al soporte de function calling y su aptitud para razonar sobre técnicas de evasión.
- Simulaciones de phishing controladas: redacción de mensajes de phishing realistas para campañas internas de concienciación, donde el modelo puede variar los vectores de ataque sin las restricciones habituales de los modelos generales.
- Resolución de retos CTF (Capture The Flag): asistencia en la resolución de retos de seguridad, incluyendo descifrado de flags, análisis de binarios y explotación de servicios web.

## Benchmarks y rendimiento

Los datos disponibles se centran en la preservación de capacidades y en el comportamiento de rechazo, no en benchmarks estándar de generación de código o matemáticas.

| Evaluacion | Modelo base | CRACK Cybersecurity FP8 | Variacion |
|---|---|---|---|
| MMLU (overall, 1026 preguntas, logit-mode) | 85.58% | 86.65% | +1.07 pp |

Comportamiento de compliance en HarmBench-320 (subset sin comportamientos de copyright):

| Nivel de esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|---|---:|---:|---:|---:|---:|---:|
| off | 196 (81.7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84.2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80.0%) | 3 | 3 | 0 | 0 | 40 |

En la categoría cyber_offense (45 comportamientos), el cumplimiento directo es del 89% con esfuerzo off, 89% con low y 84% con max, con prácticamente ningún rechazo. No se han publicado resultados de benchmarks estándar adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: 112.6 GB según metadatos externos; la configuración documentada utiliza 8× H200 (TP8) con `--gpu-memory-utilization 0.90`.
- GPU recomendadas: H100/H200 para aprovechar la velocidad nativa de los tensor cores en FP8.
- No cabe en GPUs de consumo (RTX 4090, etc.) de forma eficiente; se requiere un clúster con múltiples GPUs de centro de datos.
- Opciones de despliegue: vLLM es el entorno soportado y documentado. No se mencionan otras alternativas como llama.cpp o TGI.
- Consideraciones de despliegue: es necesario usar `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24` y `--max-model-len 131072` para la configuración especificada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | MMLU |
|---|---|---|---|---|---|
| zai-org/GLM-5.3 | 753.3B (base) | no disponible | Modelo base original | no disponible | 85.58% (pre-cuantizacion bf16) |
| JANGQ-AI/GLM-5.3-FP8 | 753.3B (FP8) | no disponible | Cuantizacion FP8 del base | no disponible | no disponible |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | 753.3B (FP8) | 131.072 tokens | Abliterado para ciberseguridad | MIT | 86.65% |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753.3B (FP8) | no disponible | Abliterado general (sin restricciones) | MIT | no disponible |

## Limitaciones y advertencias

- No es un modelo de eliminación general de censura: el alcance se limita a contenido de ciberseguridad. En otras categorías de daño (armas, química, biología, acoso, desinformación) el comportamiento puede alternar entre cumplimiento parcial y rechazo suave.
- La reproducción literal de material con copyright sigue presentando rechazos: en la evaluación HarmBench-320, entre el 60% y el 68% de los comportamientos de copyright sufre soft-refusal.
- Riesgo de alucinación no evaluado: la modificación de pesos mediante abliteration puede introducir incoherencias en el texto generado para temas fuera del nicho de seguridad, sin que haya datos de evaluación disponibles.
- Sesgos: no se ha documentado ningún estudio de sesgos específico para esta variante.
- Uso responsable: aunque la licencia MIT permite uso comercial, la capacidad de generar contenido ofensivo de ciberseguridad implica que su uso debe limitarse a entornos autorizados y legales.
- El modelo no soporta multimodalidad ni generación de audio o imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Unravler/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantizacion FP8: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante general sin censura: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Comunidad (no autoritativo): https://huggingface.co/unravler-media/GLM-5.3-CYBERSECURITY-FP8
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/glm-5.3-cybersecurity-fp8-dealignai
- Ficha en llm-explorer: https://llm-explorer.com/model/dealignai%2FGLM-5.3-CYBERSECURITY-FP8,5FAoiCM3UW505NlU50d9Vr
