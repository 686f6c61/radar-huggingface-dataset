# superbigsaw/RoboBeats-4B

## Resumen

RoboBeats-4B es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el autor superbigsaw en el marco del trabajo "Learning to Live: A Step Toward Lifelong Embodied Intelligence" (arXiv:2611.00180). No es un modelo de lenguaje generalista, sino una "puerta" (gate) de visión-lenguaje estrictamente causal: observa un flujo de vídeo a 1 fotograma por segundo y asigna a cada fotograma una probabilidad de que acabe de ocurrir un evento nuevo. Su función es decidir qué fragmentos de una emisión de vídeo continua merecen escribirse en memoria, de modo que solo los fotogramas alrededor de eventos detectados se almacenen.

El modelo pertenece a la familia RoboBeats, que incluye también las variantes RoboBeats-0.8B y RoboBeats-2B, todas construidas como adaptadores sobre modelos Qwen. La relevancia de esta ficha radica en que ilustra un patrón de despliegue de IA encarnada (robótica) donde un VLM pequeño y causal actúa como filtro de memoria de bajo coste, en lugar de procesar vídeo completo con un modelo grande.

Al ser un adaptador PEFT, el repositorio ocupa solo 0,1 GB y requiere descargar el modelo base Qwen3.5-4B por separado. La licencia es Apache 2.0 y la tarea declarada en el pipeline es video-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B; VLM causal para vídeo |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el base Qwen3.5-4B admite las habituales, pero no se documentan aquí) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

RoboBeats-4B es un adaptador LoRA que se aplica sobre el modelo base Qwen/Qwen3.5-4B, un VLM de 4 000 millones de parámetros. El adaptador convierte el modelo base en una puerta causal de detección de eventos: para cada segundo t de un flujo de vídeo a 1 fps, el modelo calcula una probabilidad p(t) de que haya ocurrido un evento nuevo, utilizando exclusivamente los fotogramas hasta t (estrictamente causal). El procesamiento de flujos largos se realiza en bloques de 100 fotogramas con 10 fotogramas de solapamiento.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El trabajo de referencia es "Learning to Live: A Step Toward Lifelong Embodied Intelligence" (Che et al., 2026), enmarcado en robótica encarnada y memoria de largo plazo. La innovación técnica destacable es el uso de un VLM pequeño y causal como filtro de memoria: solo se escriben en memoria los fotogramas en torno a eventos detectados, con una histéresis explícita (un evento se abre cuando p > 0,5 y se cierra cuando p < 0,3).

## Capacidades

- Detección de eventos en flujos de vídeo continuos a 1 fps, con puntuación probabilística por fotograma.
- Procesamiento estrictamente causal: la puntuación en el segundo t solo depende de fotogramas hasta t.
- Gestión de memoria selectiva: selecciona y conserva únicamente los fotogramas relevantes alrededor de eventos.
- Procesamiento por bloques de 100 fotogramas con solapamiento de 10 para flujos largos.
- Integración como componente de un pipeline de robótica encarnada (repositorio LIFE de AgibotTech).
- Capacidades de visión-lenguaje heredadas del base Qwen3.5-4B (no detalladas en la información disponible).
- Soporte de tool calling, agentes, multilingüismo o modos de razonamiento especiales: no disponible.

## Casos de uso

- Memoria de largo plazo en robots: el gate filtra el flujo de cámara del robot y solo escribe en memoria los fotogramas en torno a eventos relevantes, reduciendo el almacenamiento y el coste de recuperación posterior.
- Vigilancia y monitorización de vídeo: procesar una emisión continua a 1 fps y disparar alertas solo cuando la probabilidad de evento supera 0,5, evitando el procesamiento de todos los fotogramas.
- Resumen automático de grabaciones largas: usar las probabilidades por segundo para segmentar un vídeo en eventos y generar un índice de momentos clave.
- Preprocesado para pipelines de VLM grandes: actuar como etapa de filtrado barata que decide qué fragmentos se envían a un modelo mayor, reduciendo el coste computacional.
- Robótica de manipulación con memoria episódica: registrar únicamente los instantes en que ocurre un cambio relevante (apertura de una puerta, agarre de un objeto) para su posterior recuperación por el agente.
- Detección de anomalías en procesos industriales filmados: entrenar o adaptar el gate para que los eventos correspondan a fallos o paradas, y usar la salida probabilística como señal de alarma.
- Investigación en IA encarnada: servir como componente reproducible en experimentos de memoria selectiva, dado que el código y el paper están publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el modelo base Qwen3.5-4B debe descargarse aparte y es el que determina los requisitos.
- VRAM estimada para el base de 4B: aproximadamente 8-9 GB en FP16/BF16, unos 4-5 GB en cuantización de 8 bits y unos 2,5-3 GB en 4 bits (estimaciones orientativas, no documentadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para estaciones de trabajo.
- Cabe en GPU de consumo: sí, el base de 4B en cuantización de 4 u 8 bits entra en tarjetas con 8-12 GB de VRAM.
- Opciones de despliegue: el flujo documentado es el repositorio de código LIFE (`python -m robobeats`) o la API Python `robobeats.gate.Gate`; para el base pueden emplearse vLLM, TGI o llama.cpp, aunque el adaptador está pensado para cargarse con PEFT.
- Latencia y throughput: no disponibles; el diseño procesa a 1 fps en bloques de 100 fotogramas, lo que sugiere un coste por fotograma moderado, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboBeats-4B | Adaptador sobre base de 4B | No disponible | Gate de eventos en vídeo causal | Apache 2.0 | Hugging Face |
| RoboBeats-2B | Adaptador sobre base de 2B | No disponible | Gate de eventos en vídeo causal | No disponible | Hugging Face |
| RoboBeats-0.8B | Adaptador sobre base de 0.8B | No disponible | Gate de eventos en vídeo causal | No disponible | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas con modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Qwen/Qwen3.5-4B, lo que multiplica los requisitos de hardware respecto al tamaño del repositorio.
- El modelo está especializado en detección de eventos a 1 fps; no es un VLM generalista para descripción de vídeo o diálogo sobre vídeo.
- La causalidad estricta implica que la puntuación en t no puede revisarse con información futura; eventos que solo se reconocen en retrospectiva pueden no detectarse.
- Los umbrales de apertura (p > 0,5) y cierre (p < 0,3) son fijos en el código de ejemplo y pueden no ser óptimos para todos los dominios.
- No se documentan idiomas soportados ni sesgos conocidos; al heredar el base, arrastra los sesgos de Qwen3.5-4B, no evaluados aquí.
- Riesgo de alucinación y falsos positivos/negativos en la detección de eventos: no se publican métricas de precisión o recall.
- No se detalla el dataset de entrenamiento ni si hubo alineación (RLHF/DPO), lo que limita la evaluación de robustez en producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y del código LIFE.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/superbigsaw/RoboBeats-4B
- Variante RoboBeats-0.8B: https://huggingface.co/superbigsaw/RoboBeats-0.8B
- Variante RoboBeats-2B: https://huggingface.co/superbigsaw/RoboBeats-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2611.00180
- Código: https://github.com/AgibotTech/LIFE
