# ThakiCloud/Thaki-LangMix-KoEn-0.7M-Research

## Resumen

Thaki-LangMix-KoEn-0.7M-Research es un clasificador a nivel de carácter desarrollado por ThakiCloud para una tarea muy concreta dentro de un sistema de guardarraíles (guardrails): detectar si un texto en coreano o inglés contiene segmentos en cualquier otro idioma. No es un modelo generativo ni un LLM, sino un etiquetador convolucional de 684.655 parámetros (unos 0,7 millones) que clasifica cada carácter en una de siete clases (NEU, KO, EN, ZH, JA, XLAT, XOTH) y añade una cabeza a nivel de frase que estima la probabilidad de mezcla. Se publica como checkpoint de investigación reproducible, no como producto.

El modelo está pensado para políticas que permiten coreano e inglés y quieren bloquear prompts que introduzcan otros idiomas (por ejemplo, chino, japonés, cirílico o una lengua latina distinta del inglés). Funciona solo en CPU, sin tokenizador, con un fichero de pesos de 2,8 MB y truncado a 512 caracteres. La mejora respecto a la ronda anterior del mismo equipo proviene de los datos de entrenamiento (frases de Tatoeba y negativos duros para nombres, abreviaturas, código y préstamos léxicos) y no de cambios arquitectónicos.

Es relevante para quien construya filtros de contenido multilingües de bajo coste: ofrece tasas de falsos positivos muy bajas en monolingüe (0,29% en inglés, 0,08% en coreano) manteniendo una recall de mezcla superior al 87% en el conjunto de test, con un coste de CPU de milisegundos por fila. La licencia es dual: pesos CC BY-SA 4.0 y código MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetador convolucional a nivel de carácter (character tagger) con cabeza de frase para probabilidad de mezcla; sin tokenizador |
| Parametros totales | 684.655 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 caracteres (truncado a los primeros 512) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch de 2.839.835 bytes) |
| Idiomas soportados | Coreano (ko) e inglés (en) como idiomas permitidos; detecta además ZH, JA, XLAT (otras lenguas latinas) y XOTH (otros alfabetos) |
| Licencia | Pesos CC BY-SA 4.0, código MIT (licencia compuesta `cc-by-sa-4.0-weights-mit-code`) |
| Formato de pesos | PyTorch (`ckpt_cmtl.pt`, cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

La arquitectura es un etiquetador convolucional de caracteres que asigna a cada carácter una de siete etiquetas (NEU, KO, EN, ZH, JA, XLAT, XOTH) y produce, mediante una cabeza a nivel de frase, una probabilidad de que el texto sea mixto. El modelo no usa tokenizador: trabaja directamente sobre caracteres, lo que simplifica el despliegue y evita dependencias de vocabularios externos. El checkpoint incluye una regla de decisión fijada en el split de desarrollo: se marca el texto cuando, contando solo letras, una secuencia de al menos 2 letras tiene P(ZH)+P(JA)+P(XOTH) ≥ 0,9, o una secuencia de al menos 8 letras tiene P(XLAT) ≥ 0,9, y además la probabilidad de mezcla de la cabeza de frase es ≥ 0,2. La mezcla coreano-inglés por sí sola no se marca.

El entrenamiento se apoyó en frases de Tatoeba y en negativos duros específicos para nombres propios, abreviaturas, código y préstamos léxicos, según indica la model card. El equipo señala explícitamente que la mejora respecto a la ronda anterior (reducción de falsos positivos en inglés del 1,81% al 0,23%) provino de los datos y no de la arquitectura, que se mantuvo igual. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de este tipo). La evaluación se realizó sobre el conjunto ITEST21 (n = 48.085), nunca usado en entrenamiento ni selección.

## Capacidades

- Identificación de idioma a nivel de carácter con siete clases por carácter (NEU, KO, EN, ZH, JA, XLAT, XOTH).
- Detección de code-switching: identifica segmentos en otro idioma dentro de un texto predominantemente coreano o inglés.
- Salida de spans: devuelve las secuencias detectadas junto con la probabilidad de mezcla a nivel de frase.
- Clasificación binaria por lotes mediante `flag_batch`, que devuelve un booleano por fila.
- Detección de inserciones cortas: recall del 76,93% para inserciones de 1 a 3 tokens en coreano.
- Detección de inserciones en otras lenguas latinas (XLAT): recall del 76,0% en coreano y 63,5% en inglés.
- Ejecución solo en CPU, sin GPU ni tokenizador, con latencia de milisegundos por fila.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador, no un modelo generativo.

## Casos de uso

- Guardarraíl de entrada en asistentes coreano-inglés: el modelo se coloca como filtro previo al LLM para bloquear prompts que contengan segmentos en chino, japonés, cirílico, árabe o una lengua latina distinta del inglés, con una tasa de falsos positivos del 0,29% en inglés y del 0,08% en coreano.
- Moderación de contenido en plataformas de chat: `flag_batch` permite procesar lotes de mensajes con un throughput de 4.350 filas/s con 8 hilos, adecuado para pipelines de moderación en tiempo casi real.
- Detección de evasión por cambio de idioma: un usuario que intenta saltarse un filtro escribiendo parte del prompt en otro idioma queda marcado si la inserción supera los umbrales de la regla almacenada, con recall del 90,35% en mezclas coreano-otro y del 87,53% en inglés-otro.
- Enrutado lingüístico en sistemas multilingües: los spans devueltos permiten separar segmentos por idioma antes de enviarlos a modelos o traductores especializados.
- Auditoría de datasets y corpus: el modelo puede etiquetar corpus coreano-inglés para detectar contaminación con otros idiomas antes de usarlos en entrenamiento o evaluación.
- Investigación reproducible en identificación de idioma: al ser un checkpoint de investigación con script público (`thaki_langmix.py`) y resultados reproducibles, sirve como línea base para comparar detectores de code-switching.
- Filtrado en entornos con recursos limitados: al requerir solo CPU, 2,8 MB de pesos y unos 486 MB de memoria residente (casi toda del runtime de PyTorch), puede desplegarse en contenedores sin GPU.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test ITEST21 (n = 48.085), tasas a nivel de fila con intervalos de confianza de Clopper-Pearson al 95%:

| Celda | Filas | Marcadas | Tasa | IC 95% |
|---|---|---|---|---|
| Inglés monolingüe (falsos positivos) | 16.950 | 49 | 0,29% | 0,21-0,38% |
| Coreano monolingüe (falsos positivos) | 12.046 | 10 | 0,08% | 0,04-0,15% |
| Coreano + otro idioma (recall) | 4.527 | 4.090 | 90,35% | 89,45-91,19% |
| Inglés + otro idioma (recall) | 5.062 | 4.431 | 87,53% | 86,59-88,43% |

Comparación con otros detectores sobre las mismas filas (porcentajes):

| Detector | FP EN | FP KO | Recall KO-mixto | Recall EN-mixto |
|---|---|---|---|---|
| Este modelo | 0,29 | 0,08 | 90,35 | 87,53 |
| Etiquetador de la ronda anterior (regla única) | 1,81 | 0,16 | 93,15 | 90,50 |
| Etiquetador anterior, regla de split más estricta | 0,09 | 0,07 | 80,25 | 79,71 |
| Detector ligero interno (no publicado) | 0,26 | 0,28 | 55,86 | 38,29 |
| fastText lid.176 (umbral en desarrollo) | 0,47 | 0,18 | 22,86 | 42,26 |
| GlotLID v4 (umbral 0,5) | 0,50 | 0,26 | 19,95 | 26,89 |

Frente a la ronda anterior, el falso positivo en inglés bajó 1,52 puntos porcentuales (IC bootstrap por clústeres: -1,73 a -1,32 pp) y el recall de mezcla en coreano bajó 2,8 pp. Frente al detector ligero interno, los falsos positivos en inglés son equivalentes (IC de la diferencia: -0,08 a +0,14 pp) y el recall de mezcla es 34,5 pp (KO) y 49,2 pp (EN) superior. En la evaluación adicional report-only sobre inglés conversacional (WildChat-4.8M shard 37 y HelpSteer2), la model card indica una tasa de falsos positivos del 2,54% en el conjunto WildChat inglés ya abierto, sin datos adicionales en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse solo en CPU.
- GPU: no necesaria. No se han publicado requisitos de GPU en la información disponible.
- Memoria residente añadida: aproximadamente 486 MB con 1 hilo y 482 MB con 8 hilos, casi toda correspondiente al runtime de PyTorch.
- Coste en CPU (contenedor de 8 vCPU, PyTorch 2.9, 1.000 filas, batch size 1, mediana de 3 ejecuciones): p50 de 1,23 ms y p95 de 2,40 ms con 1 hilo; p50 de 1,04 ms y p95 de 1,82 ms con 8 hilos.
- Throughput con batch de 256: 1.079 filas/s con 1 hilo y 4.350 filas/s con 8 hilos.
- Tiempo de carga: aproximadamente 1,15 s. Tamaño del checkpoint: 2.839.835 bytes.
- Despliegue: el propio script `thaki_langmix.py` con PyTorch y numpy; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Recall mezcla KO / EN | Licencia |
|---|---|---|---|---|---|
| Thaki-LangMix-KoEn-0.7M-Research | Etiquetador de caracteres | 684.655 | 512 caracteres | 90,35% / 87,53% | Pesos CC BY-SA 4.0, código MIT |
| Etiquetador de la ronda anterior de ThakiCloud | Etiquetador de caracteres | no disponible | 512 caracteres | 93,15% / 90,50% | no disponible |
| fastText lid.176 | Identificación de idioma | no disponible | no disponible | 22,86% / 42,26% | no disponible |
| GlotLID v4 | Identificación de idioma | no disponible | no disponible | 19,95% / 26,89% | no disponible |

Frente a los detectores de propósito general (fastText, GlotLID), este modelo sacrifica cobertura multilingüe amplia a cambio de una recall de mezcla mucho mayor en el par coreano-inglés. Frente a la ronda anterior del mismo equipo, reduce falsos positivos en inglés a costa de 2,8 pp de recall en coreano mixto.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un producto: el veredicto interno MODEL_GO se refiere a las puertas preregistradas de la ronda R21, no a una validación de producción.
- En el conjunto WildChat inglés ya abierto la tasa de falsos positivos es del 2,54% (report-only), muy superior al 0,29% del conjunto de test; conviene calibrar en el dominio objetivo.
- Los inputs se truncan a los primeros 512 caracteres: contenido en otro idioma más allá de ese límite no se detecta.
- La mezcla coreano-inglés por sí sola no se marca; el modelo no distingue entre uso legítimo de préstamos y evasión real más allá de los umbrales fijados.
- La recall para inserciones de 1 a 3 tokens en coreano es del 76,93%, y para inserciones XLAT del 76,0% (KO) y 63,5% (EN): las inserciones muy cortas pueden pasar.
- Solo cubre coreano e inglés como idiomas permitidos; no está pensado para otras combinaciones.
- Licencia dual: los pesos son CC BY-SA 4.0 (con obligaciones de compartir igual) y el código MIT; hay que revisar `LICENSE.md` antes de uso comercial.
- Los datos de entrenamiento no se incluyen y solo se acreditan en `NOTICE.md`.
- Requiere PyTorch (unos 486 MB de memoria residente) y es unas 25 veces más lento que el detector ligero interno (0,1 ms p95 y 8 MB), que no es público.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-LangMix-KoEn-0.7M-Research
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-LangMix-KoEn-0.7M-Research/blob/main/MODEL_CARD.ko.md
- Licencia: https://huggingface.co/ThakiCloud/Thaki-LangMix-KoEn-0.7M-Research/blob/main/LICENSE.md
- Créditos de datos de entrenamiento: https://huggingface.co/ThakiCloud/Thaki-LangMix-KoEn-0.7M-Research/blob/main/NOTICE.md
- Script de inferencia: https://huggingface.co/ThakiCloud/Thaki-LangMix-KoEn-0.7M-Research/blob/main/thaki_langmix.py
- Checkpoint: https://huggingface.co/ThakiCloud/Thaki-LangMix-KoEn-0.7M-Research/blob/main/ckpt_cmtl.pt
