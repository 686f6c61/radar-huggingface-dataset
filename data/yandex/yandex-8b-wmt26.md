# yandex/Yandex-8B-WMT26

## Resumen

Yandex-8B-WMT26 es un modelo de lenguaje causal de aproximadamente 8 mil millones de parámetros desarrollado por Yandex como participación en la tarea WMT26 General Machine Translation. Se trata de un ajuste fino (finetune) del modelo base YandexGPT-5-Lite-8B-pretrain, especializado exclusivamente en traducción del inglés al ruso, bielorruso, kazajo y armenio. El checkpoint publicado corresponde al modelo supervisado instruction-tuned presentado a la competición, entrenado con cerca de un millón de ejemplos de traducción directos y condicionados por instrucciones.

Su relevancia radica en el rendimiento que alcanza en idiomas de baja y media disponibilidad de recursos (bielorruso, kazajo y armenio), donde supera a alternativas públicas como TranslateGemma-12B, MADLAD-400-10B o NLLB-200-3.3B en la mayoría de métricas evaluadas. El modelo soporta una ventana de contexto de 32.768 tokens y ofrece instrucciones específicas por dominio (social, speech, news y software), además de permitir instrucciones personalizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo causal decoder-only (tipo LLaMA) |
| Parámetros totales | 8.036.552.704 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés (fuente), ruso, bielorruso, kazajo y armenio (destino) |
| Licencia | YandexGPT-5-Lite-8B License (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de unos 8B de parámetros, derivado de YandexGPT-5-Lite-8B-pretrain mediante ajuste fino supervisado. El entrenamiento utilizó aproximadamente un millón de ejemplos de traducción directos y condicionados por instrucciones distribuidos en los cuatro pares de traducción (en-ru, en-be, en-kk y en-hy). Los objetivos (targets) fueron generados por el modelo de 235B parámetros de Yandex, su presentación no restringida a WMT26, lo que constituye una forma de destilación de un modelo mucho mayor.

La mezcla de datos incluyó además ejemplos dedicados con contenido en JSON y HTML, orientados a la traducción de documentos estructurados. El equipo probó también Contrastive Preference Optimization (CPO) como etapa adicional de entrenamiento, aunque descartaron el checkpoint resultante para la presentación final al no observar una mejora consistente. La inferencia oficial se realiza con decodificación greedy.

## Capacidades

- Traducción automática del inglés al ruso, bielorruso, kazajo y armenio, en dirección unidireccional (no traduce hacia el inglés).
- Traducción condicionada por instrucciones de dominio: cuatro dominios predefinidos (social, speech, news y software) mediante prompts específicos.
- Soporte de instrucciones personalizadas (`--prompt` o `--prompt-file`), lo que permite adaptar el estilo o registro de la traducción.
- Manejo de texto estructurado: entrenado con ejemplos dedicados de JSON y HTML para preservar el formato en la traducción.
- Ventana de contexto de 32.768 tokens, apta para párrafos y documentos largos.
- Pipeline de text-generation estándar en transformers, con script de inferencia incluido en el repositorio.

No se ha documentado soporte de tool calling, capacidades de agente, visión, audio ni generación general de texto o código: el modelo está especializado en traducción.

## Casos de uso

- Localización de software del inglés a lenguas de Rusia y Asia Central: el entrenamiento con ejemplos JSON y HTML permite traducir cadenas de interfaz y documentación técnica preservando etiquetas y estructura.
- Traducción de noticias y contenidos editoriales: el prompt de dominio `news` está optimizado para textos periodísticos hacia ruso, kazajo, bielorruso y armenio.
- Subtitulado y transcripción de contenido audiovisual: el dominio `speech` está diseñado para traducir texto hablado, útil en pipelines de subtitulado automatizado.
- Adaptación de contenido de redes sociales: el dominio `social` permite traducir mensajes cortos e informales con registro apropiado.
- Comunicación institucional hacia minorías lingüísticas: el buen rendimiento en bielorruso, kazajo y armenio lo hace adecuado para ONGs, administraciones públicas o medios que publican en estas lenguas con pocos recursos.
- Integración en pipelines de traducción automática empresarial: al ser un modelo local de 8B con licencia propia de Yandex, puede desplegarse on-premise (sujeto a los términos de la licencia) para datos sensibles.
- Traducción con control de estilo: las instrucciones personalizadas permiten especificar glosarios, tono o convenciones terminológicas en el prompt.

## Benchmarks y rendimiento

Resultados de evaluación local publicados por Yandex (no son puntuaciones oficiales de WMT26), comparando contra cinco modelos públicos de hasta 20B parámetros.

BOUQuET, nivel de párrafo, ChrF++ (mayor es mejor):

| Sistema | en-ru | en-be | en-kk | en-hy |
|---|---:|---:|---:|---:|
| Yandex-8B | 62,3 | 58,0 | 55,3 | 53,5 |
| TranslateGemma-12B | 62,2 | 54,9 | 47,9 | 50,1 |
| Qwen-3.5-9B | 60,1 | 49,1 | 48,3 | 49,6 |
| MADLAD-400-10B | 59,4 | 54,2 | 46,8 | 50,3 |
| NLLB-200-3.3B | 57,4 | 52,1 | 47,8 | 52,8 |
| GPT-OSS-20B | 51,9 | 29,3 | 49,0 | 12,9 |

BOUQuET, MetricX-24-XXL (menor es mejor):

| Sistema | en-ru | en-be | en-kk | en-hy |
|---|---:|---:|---:|---:|
| Yandex-8B | 1,58 | 3,87 | 3,44 | 5,41 |
| TranslateGemma-12B | 1,52 | 3,83 | 5,60 | 6,30 |
| Qwen-3.5-9B | 2,22 | 5,73 | 5,52 | 7,32 |
| MADLAD-400-10B | 4,79 | 5,56 | 5,86 | 7,13 |
| NLLB-200-3.3B | 6,01 | 7,63 | 7,10 | 6,35 |
| GPT-OSS-20B | 2,72 | 6,16 | 5,82 | 9,18 |

Párrafos fuente de WMT25 General MT, evaluados con ORBIT-SC (GPT-5.4 como juez único). Precisión (mayor es mejor):

| Sistema | en-ru | en-be | en-kk | en-hy |
|---|---:|---:|---:|---:|
| Yandex-8B | 81,6 | 69,1 | 69,9 | 52,2 |
| TranslateGemma-12B | 73,9 | 59,1 | 47,2 | 41,8 |
| Qwen-3.5-9B | 69,6 | 51,1 | 46,2 | 39,1 |
| MADLAD-400-10B | 32,5 | 40,5 | 40,8 | 28,3 |
| NLLB-200-3.3B | 39,7 | 33,8 | 32,2 | 35,0 |
| GPT-OSS-20B | 62,4 | 40,9 | 40,8 | 30,2 |

Fluidez (mayor es mejor):

| Sistema | en-ru | en-be | en-kk | en-hy |
|---|---:|---:|---:|---:|
| Yandex-8B | 85,3 | 69,5 | 72,0 | 54,0 |
| TranslateGemma-12B | 81,2 | 64,4 | 52,5 | 48,1 |
| Qwen-3.5-9B | 72,7 | 51,8 | 51,4 | 44,8 |
| MADLAD-400-10B | 32,5 | 44,8 | 48,4 | 37,5 |
| NLLB-200-3.3B | 40,3 | 33,8 | 35,7 | 36,4 |
| GPT-OSS-20B | 63,5 | 39,3 | 42,3 | 29,4 |

MQM (menor es mejor, calculado como 5 × Major + Minor):

| Sistema | en-ru | en-be | en-kk | en-hy |
|---|---:|---:|---:|---:|
| Yandex-8B | 11,3 | 24,2 | 22,3 | 37,6 |
| TranslateGemma-12B | 17,9 | 30,8 | 40,9 | 43,8 |
| Qwen-3.5-9B | 21,4 | 38,5 | 40,8 | 46,4 |
| MADLAD-400-10B | 34,5 | 38,6 | 40,1 | 31,7* |
| NLLB-200-3.3B | 39,5 | 46,0 | 45,5 | 46,2 |
| GPT-OSS-20B | 27,2 | 46,8 | 44,5 | 52,4 |

\* El valor de MADLAD en-ru/en-hy MQM está afectado por la agregación por recuento de un número reducido de tramos críticos largos; su valor bajo no debe interpretarse como mejor calidad según los autores.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 16,1 GB en safetensors (aproximadamente fp16/bf16), por lo que se necesita en torno a 17-18 GB de VRAM para carga completa; no disponible una cifra oficial.
- GPU recomendadas: una RTX 4090 (24 GB) o A100/H100 de 40-80 GB para carga en media precisión sin compresión. Con cuantización (no documentada oficialmente) podría caber en GPUs de 12-16 GB, pero no hay checkpoints cuantizados publicados.
- Consumer GPUs: cabe en una RTX 4090 de 24 GB en fp16; en GPUs de 8-12 GB requeriría cuantización externa (por ejemplo GGUF vía llama.cpp, no publicada por Yandex).
- Opciones de despliegue: script oficial `inference.py` con transformers (>=4.46.3, <5) y torch>=2.1; al ser una arquitectura tipo LLaMA con safetensors, es compatible con vLLM, TGI y Ollama (este último tras conversión a GGUF), aunque no hay soporte oficial documentado más allá de transformers.
- Latencia y throughput: no disponible. La inferencia oficial usa decodificación greedy con `max_new_tokens=512`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Yandex-8B-WMT26 | 8B | 32.768 tokens | Traducción en→ru/be/kk/hy | YandexGPT-5-Lite-8B (other) |
| TranslateGemma-12B | 12B | no disponible | Traducción multilingüe | no disponible |
| MADLAD-400-10B | 10B | no disponible | Traducción multilingüe (450+ lenguas) | Apache-2.0 |
| NLLB-200-3.3B | 3,3B | no disponible | Traducción multilingüe (200 lenguas) | CC-BY-NC (no comercial) |

Yandex-8B supera a las tres alternativas en la mayoría de métricas para sus cuatro pares de traducción, con un tamaño inferior a TranslateGemma-12B y MADLAD-400-10B. Su limitación principal frente a MADLAD o NLLB es la cobertura: solo cuatro idiomas de destino y únicamente desde el inglés, mientras que NLLB-200 cubre 200 lenguas en ambas direcciones. La licencia de Yandex es personalizada ("other"), por lo que debe revisarse el texto legal para uso comercial, a diferencia de la Apache-2.0 de MADLAD.

## Limitaciones y advertencias

- Dirección única: solo traduce del inglés a los cuatro idiomas de destino; no soporta traducción inversa ni otros pares.
- Especialización extrema: al ser un finetune orientado a traducción, no es adecuado para generación de texto general, razonamiento, código o chat.
- Sesgos: no disponible; no se documentan auditorías de sesgo en la model card.
- Alucinación: al tratarse de un modelo generativo (no un sistema de traducción clásico encoder-decoder), existe riesgo de omisiones o adiciones en la traducción, especialmente en textos largos; no hay datos publicados al respecto.
- Idiomas: el rendimiento en armenio (en-hy) es notablemente inferior al del resto de pares según las métricas MQM y ORBIT-SC publicadas.
- Licencia: la licencia YandexGPT-5-Lite-8B es personalizada y debe revisarse antes de cualquier despliegue comercial; no se garantiza permiso de uso comercial en todos los escenarios.
- Los benchmarks publicados son evaluaciones locales de los autores, no puntuaciones oficiales de WMT26, y las comparaciones usan jueces automáticos (MetricX, ORBIT-SC con GPT-5.4) con sus limitaciones conocidas.
- No hay checkpoints cuantizados ni soporte oficial de motores de inferencia optimizados (vLLM, llama.cpp) publicados por Yandex.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yandex/Yandex-8B-WMT26
- Modelo base: https://huggingface.co/yandex/YandexGPT-5-Lite-8B-pretrain
- Script de inferencia: https://huggingface.co/yandex/Yandex-8B-WMT26/blob/main/inference.py
- Licencia: https://huggingface.co/yandex/Yandex-8B-WMT26/blob/main/LICENSE
- Métrica de evaluación MetricX: https://huggingface.co/google/metricx-24-hybrid-xxl-v2p6
