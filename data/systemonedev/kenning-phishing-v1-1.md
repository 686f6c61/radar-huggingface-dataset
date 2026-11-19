# systemonedev/kenning-phishing-v1.1

## Resumen

Kenning-phishing-v1.1 es un modelo de decisión de tipo "System One" publicado por systemonedev. No es un modelo generativo: dado un estado del programa (por ejemplo, el texto de un correo o un ticket) y una serie de preguntas tipadas (`noul` sí/no, `choice`, `score`), devuelve respuestas tipadas con probabilidades calibradas en un único forward pass. Se construye sobre `MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c`, un cross-encoder DeBERTa-v3-large afinado para clasificación zero-shot, y se especializa en la detección de phishing y en tareas operativas de seguridad.

El modelo tiene 435 millones de parámetros y un límite de 512 tokens por par (estado, respuesta). Su relevancia práctica está en el enfoque: en lugar de pedir a un LLM que "razone" y genere una respuesta, se formula una pregunta cerrada y se obtiene una probabilidad calibrada (ECE de 0,009 tras calibración en distribución), lo que permite automatizar decisiones con umbrales explícitos y latencias de decenas de milisegundos.

La versión 1.1 incluye temperaturas y sesgos de decisión ajustados por tipo de pregunta, y se distribuye con licencia Apache-2.0, aunque el modelo base y parte de los datos de entrenamiento arrastran obligaciones de atribución (MIT y CC-BY-SA-3.0) que deben conservarse en el fichero NOTICE.md.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en DeBERTa-v3-large (transformer) |
| Parametros totales | 435.063.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por par (estado, respuesta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento son correos en inglés) |
| Licencia | Apache-2.0 (con NOTICE.md que recoge licencias upstream: MIT del base, CC-BY-SA-3.0 de FEVER-NLI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder derivado de DeBERTa-v3-large. Cada respuesta candidata se puntúa conjuntamente con el estado de entrada, y la distribución de cada pregunta se obtiene aplicando `softmax(scores / T)` con temperaturas ajustadas por tipo de pregunta sobre datos held-out: `choice` 0,7408, `noul_bare` 1,1052, `noul_criteria` 0,8607, `score` 4,7115 y `noul` 1,0. Además se aplica un sesgo de decisión sobre la opción "sí" tras la división por temperatura: 0,25 para `noul_bare`, 0,0 para `noul_criteria` y 0,2 para `noul`. El límite es de 512 tokens por par (estado, respuesta).

El entrenamiento combina tres fuentes: 1.927 filas de correos de phishing y colaboración SaaS emparejados contrafactualmente (split estricto por `pair_id`), 640 correos operativos y de phishing modernos en cuatro layouts, y 1.040 anclas de decisión generadas por reglas (registros, tablas, `agent_steps`, logs). Todas las fuentes son Apache-2.0. Las etiquetas se destilaron mezclando un 70 % de la etiqueta original con un 30 % de las probabilidades soft del profesor `Cloudflare/clef-flash`. El modelo se construyó con SystemOne Builder.

## Capacidades

- Clasificación zero-shot mediante preguntas tipadas: `noul` (sí/no), `choice` (selección entre opciones) y `score` (puntuación).
- Detección de phishing en correos, tickets y estados estructurados, con probabilidades calibradas.
- Triage de URLs y páginas web (evaluado en el conjunto PhreshPhish Webpage & URL Triage).
- Tareas operativas generales sobre estados estructurados: registros, tablas, logs y pasos de agente.
- Clasificación out-of-domain (spam, emoción, tema de noticias) con rendimiento degradado.
- No genera texto: solo devuelve respuestas tipadas con probabilidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible de forma nativa; el modelo resuelve una decisión por forward pass.
- Capacidades multilingües: no disponibles; el entrenamiento se realizó sobre correos en inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Filtrado de phishing en pasarelas de correo: el modelo evalúa cada correo con una pregunta `noul` ("¿es phishing?") y devuelve una probabilidad calibrada que permite fijar umbrales de cuarentena automática. En PhishNChips automatiza el 57 % de los ítems con precisión de 0,905.
- Triage de URLs sospechosas: integrado en un pipeline de seguridad, clasifica páginas y enlaces con una latencia p50 de 120 ms, adecuado para comprobaciones en tiempo real antes de permitir la navegación.
- Enrutado de tickets de soporte: usando preguntas `choice` (por ejemplo, facturación, técnico, cuenta), clasifica tickets en categorías con una sola pasada y probabilidades calibradas, lo que permite derivar automáticamente cuando p ≥ 0,9.
- Moderación y clasificación de contenido operativo: sobre logs, registros y tablas, responde preguntas `noul` o `score` para etiquetar eventos sin necesidad de un LLM generativo.
- Automatización de decisiones en agentes: el modelo actúa como capa de decisión de bajo coste (32-75 ms p50 en varios conjuntos) para preguntas cerradas dentro de un bucle de agente, reservando el LLM para la generación.
- Validación de layouts de correo: con cuatro formas de estado evaluadas (precisión 0,725-0,950), se puede desplegar en pipelines que reciben correos con estructuras heterogéneas.
- Detección de correos contrafactuales: útil en entornos donde los ataques imitan comunicaciones SaaS legítimas, gracias al entrenamiento con pares contrafactuales estrictamente separados.

## Benchmarks y rendimiento

Resultados publicados por el autor con `systemone bench` sobre conjuntos no usados en entrenamiento:

| Suite | Items | Accuracy | Brier | ECE | Automated | Threats auto-closed | Latencia p50 |
|---|---|---|---|---|---|---|---|
| Jev Decision Index (externo) | 320 | 0,478 (macro) | 0,569 | 0,269 | - | - | 35 ms |
| PhishNChips (400 correos reales) | 400 | 0,905 / 0,900 | 0,079 | 0,019 | 57 % | 8 | 75 ms |
| Phishing Counterfactuals (48 manuales) | 48 | 0,854 / 0,854 / 0,958 / 0,792 / 0,833 / 0,667 | 0,105 | 0,124 | 60 % | 0 | 306 ms |
| Phishing Counterfactuals (32 sintéticos in-dist) | 32 | 1,000 / 0,969 / 1,000 / 1,000 / 1,000 / 1,000 | 0,008 | 0,051 | 84 % | 0 | 307 ms |
| PhreshPhish Webpage & URL Triage (real) | 80 | 0,963 / 0,900 / 0,963 | 0,035 | 0,059 | 85 % | 0 | 120 ms |
| Modern emails 2 (held out) | 20 | 0,950 | 0,046 | 0,097 | 50 % | 0 | 32 ms |
| Phishing Layouts (4 formas de estado) | 160 | 0,825 / 0,950 / 0,925 / 0,725 | 0,120 | 0,115 | 55 % | 0 | 41 ms |

Resultados held-out del pool de entrenamiento (in-distribution):

| | Accuracy | Brier | ECE |
|---|---|---|---|
| Zero-shot (antes de entrenar) | 0,538 | 0,516 | 0,193 |
| Entrenado | 0,911 | 0,092 | 0,024 |
| Entrenado + calibrado | 0,914 | 0,096 | 0,009 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 435 M de parámetros, aproximadamente 1,7 GB en fp32 y 0,9 GB en fp16. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para throughput alto, una RTX 4090, A100 o H100 permiten procesar lotes grandes con latencias muy bajas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: `systemone-client[local]` (in-process, CPU o GPU) o el servicio `kenning` de SystemOne Builder con endpoint `POST /v1/systemone`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencias p50 entre 32 ms y 307 ms según el conjunto evaluado (32 ms en correos modernos, 75 ms en PhishNChips, 120 ms en triage de URLs, 306-307 ms en contrafactuales).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kenning-phishing-v1.1 | 435 M | 512 tokens por par | Cross-encoder de decisión con preguntas tipadas y calibración | Apache-2.0 | Hugging Face |
| MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c | ~435 M | 512 tokens | Cross-encoder zero-shot genérico (modelo base) | MIT | Hugging Face |
| Cloudflare/clef-flash | no disponible | no disponible | Profesor usado para destilación | no disponible | Hugging Face |
| TypeSafe Jev | no disponible | no disponible | Sistema de decisión System One (referencia externa) | no disponible | no disponible |

El autor publica comparaciones con Cloudflare Clef y TypeSafe Jev en la documentación de Kenning, pero los datos concretos no están incluidos en la información disponible.

## Limitaciones y advertencias

- La calibración se ajustó sobre la distribución de entrenamiento; las probabilidades sobre datos distintos son solo puntuaciones hasta que se recalibren con unos cientos de ejemplos etiquetados.
- La aritmética, las fechas y los estados largos o contradictorios degradan la precisión.
- El determinismo solo se garantiza en el mismo hardware y versión de software; los resultados pueden diferir entre GPUs o versiones de librerías.
- En el conjunto externo Jev Decision Index el rendimiento cae a 0,478 de accuracy macro y ECE de 0,269, lo que indica una generalización limitada fuera de dominio.
- En PhishNChips se autocerraron 8 amenazas (falsos negativos con alta confianza), un riesgo relevante para despliegues automáticos sin revisión humana.
- El entrenamiento se realizó sobre correos en inglés; el rendimiento en otros idiomas no está documentado.
- Aunque los pesos son Apache-2.0, el NOTICE.md recoge licencias upstream (MIT del base, CC-BY-SA-3.0 de FEVER-NLI) que deben conservarse con los pesos.
- El modelo no genera texto y no sustituye a un LLM en tareas abiertas; está diseñado para preguntas cerradas.
- No está afiliado ni respaldado por TypeSafe AI, y no fue entrenado con salidas de TypeSafe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/systemonedev/kenning-phishing-v1.1
- Modelo base: https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c
- SystemOne Builder: https://github.com/systemonedev/systemone-builder
- Documentación de Kenning: https://github.com/systemonedev/systemone-builder/blob/main/docs/kenning.md
- Profesor Cloudflare Clef: https://huggingface.co/Cloudflare/clef-flash
