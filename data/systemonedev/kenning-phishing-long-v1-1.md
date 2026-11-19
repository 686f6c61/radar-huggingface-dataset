# systemonedev/kenning-phishing-long-v1.1

## Resumen

Kenning-phishing-long-v1.1 es un modelo de decisión de tipo "System One" desarrollado por systemonedev. No es un modelo generativo: dado un estado del programa (por ejemplo, el texto de un correo o un ticket) y un conjunto de preguntas tipadas (`noul` sí/no, `choice`, `score`), devuelve respuestas tipadas con probabilidades calibradas en un único forward pass. Está afinado específicamente para triaje de phishing y correos operativos, aunque el entrenamiento incluye anclas de decisión generales sobre registros, tablas, pasos de agente y logs.

Técnicamente se apoya en `tasksource/ModernBERT-large-nli` (ModernBERT-large afinado en NLI) y se implementa como un cross-encoder: cada respuesta candidata se puntúa contra el estado y la distribución de cada pregunta se obtiene con `softmax(scores / T)`, usando temperaturas por tipo de pregunta ajustadas sobre datos de validación. El modelo tiene 395.834.371 parámetros y un tamaño de repositorio de 0,8 GB, con pesos en safetensors y licencia Apache-2.0.

Su relevancia práctica está en el nicho de decisiones automatizadas con umbrales de confianza: el autor reporta una accuracy de 0,940 y un ECE de 0,008 tras calibración en datos de la distribución de entrenamiento, además de latencias p50 de entre 23 y 54 ms en varios conjuntos de evaluación. Es, por tanto, una pieza pensada para integrarse en pipelines de triaje y no para conversación o generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre ModernBERT-large (transformer encoder); modelo de decisión System One, no generativo |
| Parámetros totales | 395.834.371 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Máximo de 1280 tokens por par (estado, respuesta); longitud de contexto nativa no disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre `tasksource/ModernBERT-large-nli`. Para cada pregunta, puntúa todas las respuestas candidatas contra el estado de entrada y normaliza con `softmax(scores / T)`, con temperaturas específicas por tipo de pregunta: `choice` 0,5488, `noul_bare` 0,8607, `noul_criteria` 0,5769, `score` 14,8797 y `noul` 0,7047. Además aplica un sesgo de decisión de 0,0 a las tres variantes `noul`, sumado al "sí" tras la división por temperatura. El límite es de 1280 tokens por par (estado, respuesta).

El entrenamiento combina tres fuentes: 1927 filas de correos de phishing y colaboración SaaS contrafactuales emparejados (divididos estrictamente por `pair_id`), 640 correos operativos y de phishing modernos cortos en cuatro layouts, y 1040 anclas de decisión generales generadas por reglas (registros, tablas, `agent_steps`, logs). Las etiquetas se destilaron mezclando un 70 % de la etiqueta original con un 30 % de las etiquetas suaves (probabilidades) del profesor `Cloudflare/clef-flash`. No se documenta uso de RLHF ni DPO; la innovación principal es la calibración por temperatura y el formato de decisión tipado.

## Capacidades

- Clasificación zero-shot mediante preguntas tipadas (`noul` sí/no, `choice` de opciones múltiples, `score`).
- Devolución de probabilidades calibradas por respuesta, con umbrales de automatización (p ≥ 0,9 o p ≤ 0,1).
- Triaje de phishing en correos, URLs y páginas web.
- Clasificación de correos operativos y de colaboración SaaS en distintos layouts de estado.
- Decisión sobre estados estructurados: registros, tablas, pasos de agente y logs.
- Respuesta en un único forward pass, sin generación de texto.
- Ejecución en proceso sobre CPU o GPU mediante `systemone-client`, o como servicio con `POST /v1/systemone`.
- No soporta tool calling generativo, agentes multi-paso ni visión; su rol es el de componente de decisión dentro de un pipeline mayor.

## Casos de uso

- Triaje automático de correo entrante: clasificar cada mensaje como phishing u operativo legítimo con una probabilidad calibrada, derivando a revisión humana solo los casos con p entre 0,1 y 0,9. La latencia p50 de 23-54 ms en correos modernos y PhishNChips lo hace viable en línea.
- Filtrado de URLs y páginas sospechosas: usar las preguntas de tipo `choice` sobre el contenido de la página para decidir si se bloquea, se advierte o se permite, con umbrales de automatización ajustables.
- Enrutado de tickets de soporte: preguntas `choice` sobre el texto del ticket para asignar categoría (facturación, técnico, cuenta) antes de que intervenga un agente humano.
- Verificación de pasos de agente: dado un `agent_step` y su contexto, responder preguntas `noul` sobre si la acción es coherente con el estado, como salvaguarda en pipelines automatizados.
- Monitorización de logs y registros: decidir si una entrada de log o una fila de tabla cumple una condición operativa definida como pregunta tipada, sin escribir reglas ad hoc.
- Detección de correos de colaboración SaaS fraudulentos: los contrafactuales emparejados del entrenamiento permiten distinguir variantes legítimas e ilegítimas del mismo mensaje.
- Pre-filtro en sistemas de seguridad con revisión humana: automatizar el 70-88 % de los ítems según los benchmarks del autor y reservar el resto para analistas.

## Benchmarks y rendimiento

Resultados reportados por el autor con `systemone bench` sobre conjuntos no usados en entrenamiento. En las suites con varias preguntas, la accuracy se lista por pregunta.

| Suite | Ítems | Accuracy | Brier | ECE | Automatizado | Amenazas cerradas en falso | Latencia p50 |
|---|---|---|---|---|---|---|---|
| Jev Decision Index (externo) | 320 | 0,456 (macro) | 0,025 | 0,438 | - | - | 28 ms |
| PhishNChips (400 correos reales) | 400 | 0,870 / 0,953 | 0,043 | 0,100 | 83 % | 6 | 54 ms |
| Phishing Counterfactuals (48 manuales) | 48 | 0,917 / 0,833 / 0,958 / 0,792 / 0,958 / 0,750 | 0,065 | 0,091 | 75 % | 1 | 339 ms |
| Phishing Counterfactuals (32 sintéticos in-dist) | 32 | 1,000 en las seis preguntas | 0,002 | 0,024 | 88 % | 0 | 297 ms |
| PhreshPhish Webpage & URL Triage (real) | 80 | 0,925 / 0,412 / 0,963 | 0,058 | 0,068 | 86 % | 0 | 86 ms |
| Modern emails 2 (held out) | 20 | 0,750 | 0,156 | 0,171 | 55 % | 1 | 23 ms |
| Phishing Layouts (4 formas de estado) | 160 | 0,875 / 0,850 / 0,850 / 0,725 | 0,085 | 0,115 | 70 % | 1 | 34 ms |

Resultados en el split del pool de entrenamiento (in-distribution): zero-shot 0,464 de accuracy, Brier 0,629 y ECE 0,300; entrenado 0,940 / 0,059 / 0,050; entrenado y calibrado 0,940 / 0,070 / 0,008. El autor advierte que estas cifras son in-distribution y que debe recalibrarse sobre datos propios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 395,8 M de parámetros en fp32, los pesos ocupan aproximadamente 1,6 GB; en fp16, unos 0,8 GB, aunque el modelo no documenta cuantizaciones.
- GPU recomendadas: no disponible. El autor indica que el modelo corre en CPU o GPU sin especificar modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no hay confirmación documentada de modelos concretos ni de requisitos mínimos.
- Opciones de despliegue: `systemone-client[local]` en proceso, o el servicio `kenning` de SystemOne Builder con `POST /v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: p50 de 23 ms (correos modernos), 28 ms (Jev Decision Index), 34 ms (layouts), 54 ms (PhishNChips), 86 ms (PhreshPhish) y 297-339 ms en los conjuntos de contrafactuales. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kenning-phishing-long-v1.1 | Cross-encoder de decisión (System One) | 395,8 M | 1280 tokens por par | Apache-2.0 | Hugging Face |
| Cloudflare/clef-flash | Profesor usado para destilación; detalles no disponibles | No disponible | No disponible | No disponible | Hugging Face |
| TypeSafe Jev | Modelo de decisión System One comparable en las suites del autor | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| tasksource/ModernBERT-large-nli | Modelo base NLI | No disponible | No disponible | Apache-2.0 | Hugging Face |

El autor remite a la documentación de Kenning para las comparaciones con Cloudflare Clef y TypeSafe Jev sobre las mismas suites; los números concretos de esas comparaciones no están en la información disponible.

## Limitaciones y advertencias

- La calibración se ajustó sobre la distribución de entrenamiento; en otros datos las probabilidades son solo puntuaciones hasta que se recalculen sobre unos cientos de ejemplos etiquetados del dominio propio.
- La aritmética, las fechas y los estados largos o contradictorios degradan la accuracy.
- El determinismo solo se garantiza con el mismo hardware y versiones de software; los resultados pueden diferir entre GPUs o versiones de librerías.
- En el Jev Decision Index externo la accuracy macro cae a 0,456 y el ECE sube a 0,438, lo que indica mala calibración fuera de dominio.
- En PhishNChips, con umbral de automatización, se cerraron en falso 6 amenazas; en otras suites, entre 0 y 1. El riesgo de falsos negativos en producción es real.
- El modelo no genera texto ni soporta tool calling generativo; no debe usarse como sustituto de un LLM conversacional.
- La licencia Apache-2.0 aplica a los pesos, pero algunas fuentes de entrenamiento son share-alike (CC-BY-SA-3.0); debe conservarse el archivo NOTICE.md junto con los pesos.
- No está afiliado ni respaldado por TypeSafe AI, y no se entrenó con salidas de TypeSafe.
- Idiomas soportados no documentados; el entrenamiento parece centrado en correo en inglés.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/systemonedev/kenning-phishing-long-v1.1
- Modelo base: https://huggingface.co/tasksource/ModernBERT-large-nli
- Profesor de destilación: https://huggingface.co/Cloudflare/clef-flash
- SystemOne Builder: https://github.com/systemonedev/systemone-builder
- Documentación de Kenning: https://github.com/systemonedev/systemone-builder/blob/main/docs/kenning.md
