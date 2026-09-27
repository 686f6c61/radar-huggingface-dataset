# webstar34/goblin-slm-250m

## Resumen

Goblin SLM 250M es un punto de control de preentrenamiento publicado por el usuario webstar34 dentro del proyecto Goblin, una línea de modelos pequenos orientados a despliegue en el borde (edge). El modelo parte de inicializacion aleatoria y emplea un tokenizador nuevo de 32.768 tokens, incompatible con los checkpoints anteriores del proyecto, por lo que no puede compararse directamente con el modelo Edge-2B previo. La ejecucion activa se denomina `slm-10b-a100-v1` y tiene como objetivo procesar 10.000 millones de objetivos de entrenamiento; en el momento de publicar la model card ese objetivo no se habia completado.

El problema que aborda es de investigacion: validar una receta de preentrenamiento reproducible (actualizacion de matriz ANVIL v3 en FP32, entropia cruzada exacta, BF16, FlexAttention compilada y prediccion multi-token) sobre un presupuesto de computo muy ajustado. La model card es explicita al afirmar que todavia no se ha establecido ninguna capacidad util de codigo, razonamiento o conversacion, y que se trata de un experimento en curso, no de un modelo listo para chat.

Por su tamano (~250 millones de parametros segun el nombre del modelo) y su contexto fijo de 4.096 tokens, encaja en la categoria de SLM para experimentacion con hardware de gama media, pero su formato de pesos es un checkpoint PyTorch personalizado y no un modelo de Transformers, lo que limita su uso inmediato con las herramientas habituales de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con FlexAttention compilada y prediccion multi-token (MTP); decoder-only no confirmado explicitamente |
| Parametros totales | ~250 millones (segun el nombre del modelo; no desglosado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens fijos (configuracion de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (tag `en`) |
| Licencia | no disponible (la model card no declara licencia propia; remite a las licencias de los datasets de origen) |
| Formato de pesos | formato personalizado de PyTorch (`state.pt`, `complete.json` y un manifiesto de transferencia con hash) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Tokenizador | SLM de 32.768 tokens, incompatible con checkpoints anteriores de Goblin |
| Inicializacion | aleatoria (no derivada de Edge-2B) |
| Previsiones de computo | 1x A100 SXM 80GB Community Cloud a 1,39 USD/hora, limite de 24 horas, techo de 33,36 USD de GPU mas almacenamiento |
| Ejecucion | `slm-10b-a100-v1` |

## Arquitectura y entrenamiento

El modelo se entrena con una receta que incluye actualizacion de matriz ANVIL v3 en FP32, entropia cruzada exacta, precision BF16, FlexAttention compilada y prediccion multi-token (MTP) sobre un contexto fijo de 4.096 tokens. La model card no detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el tipo exacto de normalizacion o activacion, por lo que esos datos figuran como no disponibles. Los checkpoints preservan el estado del optimizador y el progreso sobre el calendario completo de 10.000 millones de objetivos.

La mezcla de datos esta fijada a partir de fragmentos publicos ya tokenizados: 50% FineWeb-Edu, 20% Python, 20% Cosmopedia y 10% de peso de muestreo de matematicas. El pool seleccionado ronda los 10.740 millones de tokens en bruto antes de descartar documentos de borde incompletos y duplicados exactos reservados para evaluacion. El muestreo es de ventana aleatoria con reemplazo, de modo que los objetivos procesados no equivalen a tokens distintos vistos. Los fragmentos de desarrollo y evaluacion final provienen de shards distintos y se excluyen del entrenamiento, aunque la model card admite que los casi duplicados, el solapamiento de repositorios y la contaminacion de benchmarks no se han auditado por completo. No se menciona RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- No se ha establecido ninguna capacidad util de generacion de codigo, razonamiento o conversacion para esta ejecucion; la model card lo indica de forma explicita.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- Capacidad multilingue: solo ingles (tag `en`); no se documentan otros idiomas.
- Capacidad especial declarada: prediccion multi-token (MTP) como componente de entrenamiento.
- El modelo no es un modelo de chat de Transformers y su tokenizador no es compatible con los checkpoints anteriores de Goblin.

## Casos de uso

Dado que el autor no ha validado ninguna capacidad funcional, los siguientes escenarios son usos de investigacion plausibles para un checkpoint de este tipo, no aplicaciones listas para produccion.

- Investigacion sobre recetas de preentrenamiento a bajo presupuesto: el checkpoint permite reproducir y auditar la combinacion de ANVIL v3 en FP32, BF16 y FlexAttention compilada en una unica A100 de 80GB con un techo de 33,36 USD.
- Estudios de tokenizadores: al usar un tokenizador nuevo de 32.768 tokens, sirve para medir el impacto de cambios de vocabulario en la perdida, siempre que las evaluaciones se hagan con tokenizadores emparejados.
- Ablaciones de mezcla de datos: la receta documenta proporciones concretas (50% FineWeb-Edu, 20% Python, 20% Cosmopedia, 10% matematicas), lo que facilita experimentos controlados sobre composicion del corpus.
- Analisis de prediccion multi-token: el uso de MTP es un punto de estudio para medir eficiencia de entrenamiento por token procesado.
- Pruebas de infraestructura de entrenamiento en la nube: la ejecucion documenta asignacion de GPU, limites de tiempo y politica de respaldo de checkpoints con manifiesto hash, util como plantilla de reproducibilidad.
- Desarrollo de herramientas de inspeccion de checkpoints personalizados: el formato `state.pt` mas `complete.json` exige utilidades propias de carga, serializacion y verificacion de integridad.
- Experimentos academicos sobre modelos pequenos: con ~250 millones de parametros, es un sujeto de estudio manejable para analisis de sesgos, perdida por dominio o comportamiento de ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica ademas que las metricas de la ejecucion y su configuracion se publican por separado, y que cualquier comparacion debe hacerse con evaluaciones emparejadas, ya que el cambio de tokenizador impide comparar directamente la perdida por token con el tokenizador anterior de Goblin.

## Requisitos de hardware

- Entrenamiento: una A100 SXM 80GB en Community Cloud, con limite de 24 horas por segmento y un techo de gasto de 33,36 USD de GPU mas almacenamiento. Los intentos previos con RTX 5090 en asignaciones Community y Secure fueron rechazados por falta de capacidad.
- VRAM de inferencia: no publicada por el autor. Como referencia orientativa derivada del tamano (~250 millones de parametros), un checkpoint en FP16 ocuparia del orden de 0,5 GB de pesos, y en cuantizaciones de 8 y 4 bits aproximadamente 0,25 GB y 0,15 GB respectivamente, sin contar activaciones ni cache KV. Estas cifras son estimaciones y no datos confirmados.
- GPU recomendadas: no disponibles. Por tamano, el modelo cabria con holgura en GPU de consumo, pero no hay validacion publicada.
- Opciones de despliegue: no disponibles. El formato es un checkpoint PyTorch personalizado, no un modelo de Transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria.

El unico modelo relacionado mencionado es el Goblin Edge-2B anterior, que el autor mantiene como proyecto separado. La comparacion directa no es posible porque el tokenizador nuevo es incompatible con los checkpoints previos y estos pesos parten de inicializacion aleatoria.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Goblin SLM 250M | ~250 M | 4.096 tokens | no disponible | preentrenamiento en curso, sin capacidades validadas |
| Goblin Edge-2B | no disponible | no disponible | no disponible | proyecto separado, tokenizador incompatible |

## Limitaciones y advertencias

- No se ha establecido ninguna capacidad util de codigo, razonamiento o conversacion; el modelo no debe usarse como asistente.
- El objetivo de 10.000 millones de objetivos de entrenamiento no estaba completado en el momento de publicar la model card.
- Los pesos parten de inicializacion aleatoria y el tokenizador rompe la compatibilidad con checkpoints anteriores de Goblin.
- El muestreo es con reemplazo, por lo que los objetivos procesados no son tokens distintos vistos; la perdida no debe interpretarse como cobertura unica del corpus.
- Los casi duplicados, el solapamiento de repositorios y la contaminacion de benchmarks no se han auditado por completo, lo que puede inflar resultados de evaluacion.
- El split de evaluacion final se reserva hasta completar el objetivo de 10.000 millones, de modo que las evaluaciones intermedias no son definitivas.
- El modelo es solo en ingles y no se documentan capacidades multilingues.
- No se declara licencia propia para los pesos; los datos conservan las licencias y la procedencia de sus fuentes originales, y el repositorio no redistribuye los shards de entrada. El uso comercial queda sin definir.
- El formato es un checkpoint PyTorch personalizado con `state.pt`, `complete.json` y manifiesto hash, no un modelo de Transformers, lo que complica la integracion con ecosistemas estandar.
- Con 0 descargas y 0 likes, no hay validacion externa ni informes de terceros sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webstar34/goblin-slm-250m
- Dataset de preentrenamiento referenciado: https://huggingface.co/datasets/rijuludar/100B-pretokenized-mix-32k
- FineWeb-Edu: no disponible en la informacion proporcionada
- Cosmopedia: no disponible en la informacion proporcionada
- Paper o blog de la ejecucion `slm-10b-a100-v1`: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
