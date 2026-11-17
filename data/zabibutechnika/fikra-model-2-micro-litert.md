# zabibutechnika/Fikra-Model-2-Micro-LiteRT

## Resumen

Fikra Model 2 Micro (identificador interno `fikra-v2-e4`) es un modelo de lenguaje instruido desarrollado por Zabibu Technika, con sede en Nairobi (Kenia), y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino especializado sobre una cadena de derivación que parte de Qwen/Qwen3.5-0.8B, pasa por el checkpoint intermedio `zabibutechnika/fikra-v2-e3` y culmina en este modelo. La model card declara 4.205.751.296 parámetros (4B) en fp16, aunque la propia denominación del modelo base (0.8B) y la sección "Why Micro" generan una inconsistencia de tamaño que el autor no resuelve.

El objetivo del modelo es el despliegue en dispositivo (on-device) con funcionamiento offline, orientado a asistentes privados que operan sin conexión de red y que requieren alternancia de código entre inglés y suajili, además de preservar una identidad de marca concreta. La especialización se construyó en Kenia y se evalúa con una suite propia de 115 casos centrada en contexto africano (datos de Kenia, cultura panafricana, fintech, salud, gaming y conocimiento local), no con benchmarks estándar de propósito general.

Su relevancia actual radica en la disponibilidad de cuantizaciones GGUF (Q4_K_M y F16) que permiten ejecución en CPU y en hardware móvil, junto con un formato LiteRT para despliegue en edge. No obstante, la información pública es escasa: cero descargas, cero likes, sin pipeline declarado y con datos de benchmark obtenidos con un límite de 10 muestras por tarea, lo que limita seriamente la fiabilidad de las cifras reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 (4B) según model card; el nombre del base sugiere 0.8B (inconsistencia no resuelta) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y F16 (GGUF); fp16 en transformers; LiteRT |
| Idiomas soportados | en (inglés), sw (suajili); code-switching declarado |
| Licencia | apache-2.0 (licencia base sujeta a Qwen/Qwen3.5-0.8B) |
| Formato de pesos | safetensors (transformers, fp16), GGUF (llama.cpp), LiteRT |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su origen: un transformer decoder-only heredado de Qwen/Qwen3.5-0.8B, sobre el que se aplicó un ajuste fino instruido en dos etapas (checkpoint `fikra-v2-e3` y después `fikra-v2-e4`). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

Lo que sí se declara es el diseño del proceso de especialización: datos de ajuste fino construidos en Kenia, una suite de evaluación de release de 115 casos y un conjunto de 10 paráfrasis retenidas (held-out) para comprobar contaminación. El autor reporta que la puntuación en la suite (91,3%) y en las paráfrasis retenidas (90,0%) son estadísticamente indistinguibles (p>0,05 binomial), lo que interpreta como ausencia de señal de contaminación. No hay información sobre la composición del corpus de ajuste fino ni sobre el volumen de datos utilizados.

## Capacidades

- Generación de texto instruido en inglés y suajili, con soporte declarado de code-switching entre ambos idiomas.
- Identidad de marca preservada: la model card reporta 8/8 en `identity_direct` y 4/4 en `identity_swahili`.
- Protocolo de identidad `uhi_protocol`: 5/5 en la suite de release.
- Límites de seguridad (`safety_boundary`): 3/3 en la suite de release.
- Generación de formato largo (`longform`): 2/2 en la suite de release.
- Tool calling / function calling: la suite incluye la categoría `tool_abi` con 4/4, lo que indica soporte de interfaz de herramientas, aunque no se detalla el esquema.
- Operación offline y on-device: el prompt de sistema y el diseño de despliegue asumen ausencia de red en inferencia.
- Capacidades multilingües limitadas a inglés y suajili; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode); de hecho, la model card advierte de fugas ocasionales de etiquetas `` en la salida visible.

## Casos de uso

- Asistente personal offline en móvil: el modelo se despliega en formato LiteRT o GGUF Q4_K_M para ejecutarse en teléfonos y tablets sin GPU discreta, atendiendo consultas en inglés y suajili sin conexión de red. Es adecuado por su diseño offline-first y su tamaño reducido.
- Atención al cliente en fintech local: la suite de evaluación incluye casos de fintech y datos de Kenia, por lo que el modelo puede gestionar consultas de producto y soporte en suajili e inglés con contexto cultural local, siempre que se combine con recuperación de información para datos actualizados.
- Preservación de identidad de marca en asistentes virtuales: las pruebas `identity_direct` y `uhi_protocol` al 100% indican que el modelo mantiene una persona concreta en conversaciones multi-turno, útil para asistentes de marca que deben responder de forma consistente.
- Automatización con tool calling en pipelines ligeros: la categoría `tool_abi` (4/4) sugiere que el modelo puede invocar funciones o APIs en flujos de automatización, integrándose en scripts de agentes simples en entornos con recursos limitados.
- Despliegue en entornos air-gapped: organizaciones con requisitos de privacidad (salud, administración pública) pueden ejecutar el modelo en hardware local sin llamadas externas, gracias a su naturaleza offline y a la licencia Apache 2.0.
- Generación de contenido cultural y local: la suite cubre cultura panafricana y conocimiento local, por lo que el modelo puede redactar textos divulgativos o educativos adaptados al contexto keniano en suajili e inglés.
- Prototipado rápido en edge con GGUF: mediante llama.cpp, Ollama o LM Studio, un desarrollador puede levantar un endpoint local en CPU para pruebas de concepto sin infraestructura GPU.

## Benchmarks y rendimiento

Los datos publicados por el autor proceden de `lm-evaluation-harness` 0.4.13, tareas `mmlu` y `hellaswag`, con límite de 10 muestras por tarea, batch automático, fp16 y ejecución en Kaggle con 2×T4. Este límite de 10 muestras hace que las cifras sean meramente indicativas y no comparables con evaluaciones completas.

| Modelo | Parámetros | MMLU | HellaSwag |
|---|---|---|---|
| fikra-v2-e4 | 4B | 75,5% | 68,0% |
| Qwen/Qwen3.5-0.8B | 4B | no ejecutado | no ejecutado |
| Qwen2.5-3B-Instruct | 3B | 68,8% | 40,0% |
| Fikra-Model-1-2B | 2B | 36,0% | 40,0% |
| Phi-3.5-mini-instruct | 3,8B | incompatible | incompatible |
| Llama-3.2-3B-Instruct | 3B | gated | gated |
| Gemma-2-2B-it | 2B | gated | gated |

Resultados de la suite propia de release:

| Métrica | Valor |
|---|---|
| Suite auto-verificada | 105/115 (91,3%) |
| Casos límite (revisión de rúbrica) | 0 |
| Paráfrasis retenidas | 9/10 (90,0%) |
| Baseline e3 (checkpoint Fikra previo) | 88,7% |

El autor advierte explícitamente que la mejora de MMLU frente a Fikra-Model-1-2B (+39,6 puntos) no está normalizada por tamaño y que la mayor parte proviene del cambio de base (2B a 4B), no del entrenamiento Fikra. La mejora atribuible al ajuste fino se mide en la suite propia: +2,6 puntos sobre el checkpoint e3.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8,4 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 12 GB de VRAM para contexto moderado.
- Cuantización Q4_K_M: reduce el peso a aproximadamente 2,5-3 GB, permitiendo ejecución en CPU y en GPUs de consumo con 4-6 GB de VRAM.
- GPU recomendadas: A100 o H100 para fp16 con throughput alto; RTX 4090 o RTX 3090 para fp16 en una sola GPU; RTX 3060/4060 o superiores para Q4_K_M.
- Cabe en GPU de consumo: sí, en formato Q4_K_M en GPUs con 6 GB o más; en fp16 requiere GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; LiteRT para despliegue en móvil y edge; transformers para fp16.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fikra Model 2 Micro | 4B (declarado) | no disponible | 75,5% (10 muestras) | Apache 2.0 | Hugging Face, GGUF, LiteRT |
| Qwen2.5-3B-Instruct | 3B | no disponible en la información | 68,8% (10 muestras) | Apache 2.0 | Hugging Face |
| Fikra-Model-1-2B | 2B | no disponible | 36,0% (10 muestras) | no disponible | Hugging Face |
| Llama-3.2-3B-Instruct | 3B | no disponible en la información | gated (no ejecutado) | Llama 3.2 Community License | Hugging Face (gated) |
| Gemma-2-2B-it | 2B | no disponible en la información | gated (no ejecutado) | Gemma Terms of Use | Hugging Face (gated) |

La comparación directa es limitada: los benchmarks se ejecutaron con 10 muestras y varios modelos comparables no pudieron evaluarse por acceso restringido o incompatibilidad. La ventaja diferencial declarada de Fikra Model 2 Micro es la especialización en suajili y contexto keniano, que no se mide con MMLU ni HellaSwag y para la que no existe benchmark cruzado de idioma publicado.

## Limitaciones y advertencias

- No existe un benchmark cruzado de suajili: el diferenciador principal del modelo no está medido por MMLU ni HellaSwag, y la suite propia de 115 casos no es comparable con evaluaciones estándar.
- Sin información en tiempo real: el conocimiento está limitado a los datos de entrenamiento, sin acceso a información reciente.
- Alucinación en dominios especializados: al ser un modelo de 4B (o 0.8B según el base), no sustituye a la recuperación de información en dominios técnicos o regulados.
- Fuga de etiquetas de razonamiento: el modelo emite ocasionalmente bloques `<think>...</think>` en la salida visible; es necesario eliminarlos en posprocesado.
- Sesgos heredados: los sesgos del modelo base Qwen/Qwen3.5-0.8B se transmiten sin auditar en esta ficha.
- Cuantización Q4_K_M no reevaluada: se espera una pérdida de 1-3 puntos frente a fp16 en evaluaciones de formato corto; el F16 GGUF hereda exactamente las cifras de fp16.
- Inconsistencia de tamaño no resuelta: la model card declara 4B parámetros pero el modelo base se denomina 0.8B; esta discrepancia afecta a las estimaciones de hardware y debe verificarse antes de desplegar.
- Sin red-teaming externo: el autor declara que el modelo no ha sido sometido a pruebas de seguridad por terceros.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base (Qwen/Qwen3.5-0.8B) debe verificarse por separado, ya que la model card remite a ella.
- Metadatos de benchmark débiles: las cifras de MMLU y HellaSwag se obtuvieron con 10 muestras por tarea, lo que reduce su fiabilidad estadística.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro-LiteRT
- Modelo base (fp16, transformers): https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro
- Cuantizaciones GGUF: https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro-GGUF
- Modelo upstream original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Contacto declarado: zabibutechnika+fikra@gmsil.com (dirección tal como aparece en la model card)
