# systemonedev/kenning-large-v0.4

## Resumen

Kenning-large-v0.4 es un modelo de decisión, no un modelo generativo. Desarrollado por systemonedev, recibe un estado de programa (por ejemplo, el texto de una incidencia o de un correo) y un conjunto de preguntas tipadas —`noul` (sí/no), `choice` (elección) y `score` (puntuación)— y devuelve respuestas tipadas con probabilidades calibradas en una sola pasada forward. No genera texto libre: su única salida son distribuciones de probabilidad sobre las opciones candidatas.

Técnicamente es un cross-encoder basado en `MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c`, con 435.063.810 parámetros totales (repo de 0,9 GB en safetensors). Cada respuesta candidata se puntúa contra el estado y la distribución por pregunta se obtiene con `softmax(scores / T)`, usando temperaturas ajustadas por tipo sobre datos de validación (`score`: 1,1618; `choice`: 1,2214; `noul`: 1,2214). El límite es de 512 tokens por par (estado, respuesta).

Su relevancia radica en el enfoque de "System One": separar la decisión rápida y calibrada del razonamiento generativo, de modo que un sistema mayor pueda delegar clasificaciones binarias y de elección en un componente pequeño, medible y ejecutable en CPU o GPU. Está pensado para automatizaciones con umbral de confianza, donde importan más la calibración (Brier, ECE) y el porcentaje de decisiones automatizadas que la fluidez del texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre DeBERTa-v3-large (transformer encoder) |
| Parametros totales | 435.063.810 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por par (estado, respuesta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder derivado de `MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c` (licencia MIT). En lugar de generar texto, puntúa cada respuesta candidata contra el estado de entrada y convierte los logits en probabilidades mediante `softmax(scores / T)`. Las temperaturas se ajustan por tipo de pregunta sobre datos reservados, lo que permite obtener probabilidades calibradas en lugar de simples puntuaciones relativas. La salida es determinista para una misma petición sobre el mismo hardware y versiones de librerías.

Los datos de entrenamiento proceden de varias fuentes: `fancyzhx/amazon_polarity` (2000 filas), `clinc/clinc_oos` (3000 filas), `nyu-mll/multi_nli` (20000 filas, excluyendo el género de ficción), `google/civil_comments` (2000 filas) y datos sintéticos generados con `Qwen/Qwen2.5-7B-Instruct` (1985 + 2793 filas). Además, cada etiqueta se mezcló al 50 % con las etiquetas suaves (probabilidades) de `Cloudflare/clef-flash`, una destilación que persigue mejorar la calibración. Se observa una mejora drástica sobre el punto de partida zero-shot: la exactitud pasa de 0,670 a 0,927 en el conjunto reservado, el Brier de 0,409 a 0,040 y el ECE de 0,182 a 0,025 antes de la calibración final.

## Capacidades

- Clasificación zero-shot con preguntas tipadas: `noul` (sí/no), `choice` (elección entre opciones) y `score` (puntuación).
- Devolución de probabilidades calibradas por pregunta, con temperaturas ajustadas por tipo.
- Decisión en una sola pasada forward, sin generación de texto.
- Ejecución en proceso sobre CPU o GPU, y también como servicio mediante el servicio `kenning` de SystemOne Builder (`POST /v1/systemone`).
- Soporte del formato wire compatible con la System One API de TypeSafe AI (sin afiliación ni entrenamiento sobre salidas de TypeSafe).
- Puntuación de múltiples preguntas y estados de distinta forma (layouts) sobre un mismo modelo.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Filtrado de phishing: el modelo clasifica correos y decides automatizar solo los casos en que p ≥ 0,9 o ≤ 0,1. En el conjunto "Phishing dataset" alcanza una exactitud de 0,780 / 0,820 con una latencia p50 de 88 ms, lo que permite integrarlo en un pipeline de correo en tiempo real.
- Enrutado de incidencias de soporte: con un estado con el texto del ticket y preguntas `noul`/`choice` (por ejemplo, "¿es facturación?"), se asigna la cola adecuada sin invocar un modelo generativo, reduciendo coste y latencia.
- Moderación de contenido: apoyándose en el entrenamiento sobre `google/civil_comments`, sirve para clasificar comentarios según categorías definidas en tiempo de ejecución.
- Clasificación de intenciones en asistentes: entrenado con `clinc/clinc_oos`, permite detectar la intención del usuario y decidir si la consulta queda dentro del dominio soportado (out-of-scope).
- Análisis de sentimiento y polaridad: usando `amazon_polarity` como base, clasifica reseñas y opiniones en positivo/negativo con probabilidad asociada.
- Detección de spam en formularios y registros: como clasificador binario de bajo coste que corre en CPU, puede desplegarse en el borde o en el propio servidor de aplicación.
- Automatización con umbral de confianza: en cualquier flujo donde se combine decisión automática y revisión humana, el porcentaje "Automated" (entre 20 % y 70 % según el conjunto) permite graduar cuánto se delega a la máquina.
- Auditoría y anotación asistida: dado que devuelve distribuciones calibradas y no solo etiquetas, es útil para priorizar ejemplos dudosos en colas de revisión manual.

## Benchmarks y rendimiento

Resultados en el conjunto reservado del pool de entrenamiento (in-distribution):

| | accuracy | Brier | ECE |
|---|---|---|---|
| zero-shot (antes de entrenar) | 0,670 | 0,409 | 0,182 |
| entrenado | 0,927 | 0,040 | 0,025 |
| entrenado + calibrado | 0,927 | 0,038 | 0,049 |

Resultados obtenidos con `systemone bench` sobre suites nunca usadas en entrenamiento. "Automated" es la proporción de ítems decididos sin intervención humana (p ≥ 0,9 o ≤ 0,1); "Threats auto-closed" son ítems positivos que el modelo cerró con seguridad como negativos:

| Suite | Items | Accuracy | Brier | ECE | Automated | Threats auto-closed | Latencia p50 |
|---|---|---|---|---|---|---|---|
| Modern emails 2 (held out) | 20 | 0,750 | 0,151 | 0,186 | 20 % | 0 | 47 ms |
| Modern emails | 20 | 1,000 | 0,024 | 0,106 | 70 % | 0 | 49 ms |
| Phishing dataset | 50 | 0,780 / 0,820 | 0,151 | 0,211 | 44 % | 0 | 88 ms |
| Layouts (4 formas de estado) | 200 | 0,780 / 0,760 / 0,760 / 0,760 | 0,151 | 0,211 | 38 % | 0 | 58 ms |
| Out of domain | 180 | 0,917 / 0,583 / 0,867 | 0,086 | 0,172 | 30 % | 1 | 48 ms |

En la suite "Out of domain" las tres cifras corresponden a spam / emoción / tema de noticias; en "Layouts", una por cada forma de estado. Las comparaciones con Cloudflare Clef y TypeSafe Jev sobre las mismas suites están en la documentación del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~1,74 GB en FP32, ~0,87 GB en BF16/FP16.
- Cuantización a int8 o int4 reduciría el consumo por debajo de 0,5 GB, pero no se documentan pesos cuantizados para este modelo ("no disponible").
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, T4, etc. También puede ejecutarse en CPU según la propia model card.
- Perfil de latencia medido: entre 47 ms y 88 ms de p50 según la suite en el entorno de referencia (`systemone bench`).
- Opciones de despliegue: carga en proceso mediante `Kenning.from_pretrained(...)` del paquete `systemone[local]`, o servicio con el componente `kenning` de SystemOne Builder y llamada a `POST /v1/systemone`. Al ser un modelo de HuggingFace basado en safetensors, es compatible con la pila `transformers`, aunque no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- No se publican cifras de throughput (tokens/s ni peticiones/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kenning-large-v0.4 | 435.063.810 | 512 tokens por par | Cross-encoder de decisión (System One) | Apache-2.0 | HuggingFace, código abierto |
| Cloudflare Clef | no disponible | no disponible | Modelo de decisión (profesor de destilación) | Apache-2.0 (según la model card) | no disponible |
| TypeSafe Jev | no disponible | no disponible | Modelo de decisión (System One) | no disponible | no disponible |
| MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c (base) | ~435 M | 512 tokens | Cross-encoder zero-shot | MIT | HuggingFace |

Nota: los resultados comparativos frente a Cloudflare Clef y TypeSafe Jev se mencionan en la documentación de Kenning, pero los datos concretos de sus especificaciones no se facilitan en la información disponible.

## Limitaciones y advertencias

- La calibración se ajustó sobre la distribución de entrenamiento; las probabilidades sobre otros datos son solo puntuaciones hasta que se recalibren con unos cientos de ejemplos etiquetados del dominio objetivo.
- La aritmética, las fechas y los estados largos o contradictorios degradan la exactitud.
- El determinismo depende del hardware y de las versiones de librerías: una misma petición puede dar resultados distintos entre GPUs o versiones.
- El modelo no genera texto, por lo que no sirve para tareas generativas ni conversacionales.
- Umbral de contexto limitado a 512 tokens por par (estado, respuesta); estados largos deben truncarse o dividirse.
- En la suite "Out of domain" se registró un "threat auto-closed", es decir, un ítem positivo cerrado como negativo con alta confianza; conviene monitorizar este tipo de error en producción.
- Idiomas soportados sin especificar; no se garantiza cobertura multilingüe más allá del comportamiento del modelo base.
- Licencia Apache-2.0, pero algunas fuentes de entrenamiento son share-alike (CC-BY-SA-3.0); es obligatorio conservar el archivo NOTICE.md junto con los pesos.
- El modelo implementa un formato wire compatible con TypeSafe AI, pero no está afiliado ni respaldado por TypeSafe AI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/systemonedev/kenning-large-v0.4
- Modelo base: https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c
- Repositorio SystemOne Builder: https://github.com/systemonedev/systemone-builder
- Documentación de Kenning (comparativas con Clef y Jev): https://github.com/systemonedev/systemone-builder/blob/main/docs/kenning.md

Nota sobre los resultados de búsqueda web: los proyectos `antmicro/kenning` y "Kenning AI" son frameworks de despliegue de IA en el borde y no guardan relación con este modelo; comparten únicamente el nombre.
