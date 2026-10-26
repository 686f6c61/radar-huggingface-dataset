# turintech/d3-mini-Artemis-GGUF

## Resumen

d3-mini-Artemis-GGUF es una conversión independiente a GGUF del modelo vllm-sr/d3-mini, el miembro más pequeño de la familia Decision 3.0 desarrollada por el equipo de vLLM Semantic Router sobre Qwen3.5-4B. No es un modelo generativo al uso: recibe un estado y un conjunto de preguntas tipadas y devuelve, en una sola pasada, una probabilidad para cada respuesta permitida. La conversión la firma TurinTech (Artemis) y no está afiliada ni respaldada por el equipo original.

El interés práctico del artefacto está en la cuantización: el fichero Q5_K_S ocupa 3,30 GB, un 11 % menos que el Q4_K_M de ggml-org (3,71 GB) y un 66 % menos que el GGUF en BF16 (9,70 GB), pero conserva las probabilidades del original con una KL media de 0,00349 frente a 0,00560 del Q4_K_M. Sobre 160 casos retenidos (800 decisiones) mantiene la misma respuesta que BF16 en el 97,25 % de las decisiones y no altera ninguna de las 309 respuestas en las que el modelo original tenía más de un 80 % de confianza.

Es relevante ahora porque permite ejecutar localmente un clasificador de decisiones tipadas con etiquetas y probabilidades calibradas, con un pico de memoria medido de 4,1 a 4,5 GiB en GPU (unos 4,4 GiB de RAM en CPU), sin depender de APIs externas ni enviar los datos fuera de la máquina. Al ser GGUF estándar funciona sobre llama.cpp de serie, si bien el endpoint previsto es `/v1/systemone` de `llama-server`, no el de chat completions convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5-4B, adaptada como modelo de decisión (probabilidades sobre respuestas tipadas en una sola pasada); no disponible el detalle exacto de la adaptación |
| Parametros totales | 4.841.450.496 (dato de safetensors del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible. La model card recomienda desplegar con `-c 16384` en llama-server |
| Tipos de cuantizacion | Q5_K_S (único fichero de este repo, 3,30 GB). La model card compara con Q4_K_M y Q8_0 de ggml-org y con el GGUF BF16 de 9,70 GB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). El original se distribuye en BF16/safetensors; esta conversión solo incluye pesos de texto y decisión |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de d3-mini más allá de su base: Qwen3.5-4B, sobre la que el equipo de vLLM Semantic Router construye un modelo de decisión en lugar de un generador de texto. El comportamiento descrito en la model card es el de un clasificador de decisión tipada: dado un estado y un conjunto de preguntas con respuestas permitidas, devuelve una distribución de probabilidad sobre esas respuestas en una única pasada. El modelo original es multimodal (lee imágenes y vídeo), pero esta conversión conserva únicamente los pesos de texto y decisión y no incluye proyector de visión.

No se publican en la información proporcionada datos sobre volumen de tokens de entrenamiento, composición del dataset ni sobre si hubo RLHF, DPO u otras etapas de alineación. La evaluación sí está documentada con detalle: 160 casos del split de train del dataset LocalLLaMA/typed-decisions (800 decisiones), excluidos de la calibración y de la búsqueda de cuantización y puntuados una sola vez bajo una regla de publicación fijada de antemano. La innovación técnica destacable de esta conversión es la metodología de evaluación de la cuantización (KL media frente a BF16, acuerdo de respuesta y cambios en respuestas de alta confianza) y el endpoint `/v1/systemone`, que expone el modelo como decisor y no como chat.

## Capacidades

- Decisión tipada: devuelve una probabilidad por cada respuesta permitida a un conjunto de preguntas, en una sola pasada y sin generar texto libre.
- Clasificación de texto con etiquetas predefinidas y salida probabilística (pipeline declarado: text-classification).
- Enrutamiento de peticiones y triaje de mensajes según el caso de uso descrito por el autor.
- Integración con llama.cpp mediante el endpoint `/v1/systemone` de `llama-server`, con parámetros recomendados `-ub 4096 -b 4096 -np 1`.
- Ejecución local con los datos en la misma máquina, sin salida a servicios externos.
- Capacidad conversacional declarada en los tags del repositorio (etiqueta `conversational`), sin más detalle en la model card.
- No incluye visión: el original lee imágenes y vídeo, pero este fichero no lleva proyector y la entrada de imagen no se probó.

## Casos de uso

- Enrutamiento de peticiones en una pasada de gateway: el modelo devuelve la probabilidad de cada ruta candidata para un estado dado, lo que permite sustituir heurísticas por umbrales calibrados sobre probabilidades y mantener la decisión en la misma máquina que el tráfico.
- Triaje de mensajes entrantes: clasificación de tickets o correos en categorías tipadas con probabilidad asociada, útil para priorizar la cola y derivar solo los casos ambiguos a revisión humana (el 72 % de accuracy sobre etiquetas sintéticas aconseja tratar la salida como señal, no como verdad).
- Clasificación con conjuntos de etiquetas cambiantes: al recibir las respuestas permitidas como parte de la entrada, se puede reutilizar el mismo fichero para taxonomías distintas sin reentrenar, cambiando únicamente el conjunto de opciones.
- Moderación y guardarraíles en pipelines de agentes: decisión tipada sobre si una acción o una salida cumple una política, con probabilidad para auditar el margen de la decisión.
- Procesamiento en local o en el borde por requisitos de privacidad: con 4,1 a 4,5 GiB de pico en GPU o unos 4,4 GiB de RAM en CPU, cabe en estaciones de trabajo y en servidores pequeños donde los datos no pueden salir del perímetro.
- Etiquetado asistido y control de calidad de anotaciones: uso del modelo como preetiquetador con probabilidades,midiendo el acuerdo con BF16 (97,25 %) como criterio de consistencia antes de desplegar una cuantización.
- Evaluación de cuantizaciones en producción: el protocolo publicado (KL media, acuerdo de respuesta, cambios en respuestas con más del 80 % de confianza) sirve como plantilla para decidir qué fichero desplegar según el presupuesto de memoria.

## Benchmarks y rendimiento

Resultados declarados por el autor (TurinTech, protocolo a100-620d222-20261025) sobre el conjunto final: 160 casos del split de train, 800 decisiones, no verificados de forma independiente.

| Metrica | Q5_K_S (este repo) | Q4_K_M (ggml-org) | Q8_0 (ggml-org) | BF16 (referencia) |
|---|---|---|---|---|
| Tamano del fichero | 3,30 GB | 3,71 GB | 5,16 GB | 9,70 GB |
| KL media frente a BF16 (menor es mejor) | 0,00349 | 0,00560 | 0,00025 | 0 (referencia) |
| Misma respuesta que BF16 | 97,25 % | 96,13 % | 99,50 % | 100 % |
| Accuracy frente a etiquetas del panel | 72,00 % | 71,38 % | 72,50 % | 72,50 % |
| Cambio de accuracy frente a BF16 | -0,50 pp | No disponible | No disponible | 0 |
| Respuestas con >80 % de confianza alteradas (de 309) | 0 | No disponible | No disponible | 0 (referencia) |
| Cambio de respuesta con opciones barajadas | 5,00 % | 7,22 % | No disponible | 4,86 % |

Ninguna de las diferencias de accuracy se declara estadísticamente significativa, y los intervalos de la tasa de cambio con opciones barajadas no excluyen el cero al nivel del 97,5 % de la regla de publicación. El Q8_0 es un 57 % más grande que este fichero y mucho más próximo a BF16.

## Requisitos de hardware

- VRAM estimada: pico medido de 4,1 a 4,5 GiB en GPU con el fichero Q5_K_S.
- CPU: aproximadamente 4,4 GiB de RAM para ejecución sin GPU, según la medición del autor.
- Cabe en GPU de consumo: sí, con 6-8 GB de VRAM (el dato concreto de modelos probados no está disponible); el tamaño del fichero es de 3,30 GB.
- Despliegue: llama.cpp mediante `llama-server`, con el endpoint `/v1/systemone` y los parámetros `-c 16384 -ub 4096 -b 4096 -np 1`. Comando publicado: `llama-server -hf turintech/d3-mini-Artemis-GGUF:Q5_K_S --port 8080 -c 16384 -ub 4096 -b 4096 -np 1`.
- GPU recomendadas: no disponible. El protocolo de medida se ejecutó en una A100 según el identificador del protocolo (a100-620d222-20261025), sin que se detallen más especificaciones.
- Latencia y throughput: no disponibles.
- Otras opciones de despliegue (vLLM, TGI, Ollama): no disponibles para este fichero; el autor solo documenta compatibilidad con llama.cpp y `endpoints_compatible`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| d3-mini-Artemis-GGUF (Q5_K_S) | 4,84 B (base) | No disponible (`-c 16384` recomendado) | GGUF, 3,30 GB | Apache 2.0 | Conversion independiente de TurinTech |
| d3-mini Q4_K_M (ggml-org) | 4,84 B (base) | No disponible | GGUF, 3,71 GB | Apache 2.0 (modelo base) | Mayor tamano, KL 0,00560, misma respuesta 96,13 % |
| d3-mini Q8_0 (ggml-org) | 4,84 B (base) | No disponible | GGUF, 5,16 GB | Apache 2.0 (modelo base) | 57 % mas grande, KL 0,00025, misma respuesta 99,50 % |
| d3-mini BF16 GGUF | 4,84 B (base) | No disponible | GGUF, 9,70 GB | Apache 2.0 (modelo base) | Referencia de fidelidad |
| vllm-sr/d3-mini (original) | 4,84 B | No disponible | Safetensors BF16 | Apache 2.0 | Multimodal (texto, imagen y vídeo); incluye proyector de visión |
| Fichero de Agentware | No disponible | No disponible | GGUF | No disponible | Creado a partir de una revisión anterior del original; sin metricas en la informacion disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, sino probabilidades sobre un conjunto de respuestas permitidas que debe proporcionarse en la entrada. Usarlo como chat daría resultados incorrectos.
- Requiere el endpoint `/v1/systemone` de `llama-server`; no está pensado para el endpoint de chat completions ni para otras pilas de inferencia sin adaptación.
- Sin visión en este fichero: el original procesa imagen y vídeo, pero aquí no se incluye proyector y la entrada de imagen no se probó.
- Accuracy del 72,00 % frente a etiquetas sintéticas de profesor, no frente a anotación humana; la diferencia de -0,50 pp respecto a BF16 no se declara significativa, y la propia model card advierte que el panel es de 160 casos (800 decisiones).
- Sensibilidad al orden de las opciones: el 5,00 % de las respuestas cambian al barajar las alternativas (4,86 % en BF16), lo que desaconseja presentaciones ambiguas del conjunto de respuestas.
- Riesgo de alucinación no caracterizado en la información disponible; al no generar texto, el riesgo se traslada a decisiones sobreconfiadas o mal calibradas en dominios alejados de los datos de evaluación.
- Sesgos conocidos: no disponibles. No hay análisis de sesgo por idioma, dominio ni demografía en la documentación facilitada.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe para esta conversión.
- Licencia Apache 2.0 permite uso comercial, pero se trata de una conversión independiente no afiliada ni respaldada por el equipo de vLLM Semantic Router; conviene revisar el aviso `NOTICE` del repositorio y la licencia del modelo base antes de desplegar.
- El repositorio tiene 1 descarga y 1 like en el momento de la consulta, y las métricas son declaradas por el autor (no verificadas), lo que limita la evidencia externa disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/d3-mini-Artemis-GGUF
- Sección de acuerdo con el original: https://huggingface.co/turintech/d3-mini-Artemis-GGUF#agreement-with-the-original
- Sección de comparación de ficheros: https://huggingface.co/turintech/d3-mini-Artemis-GGUF#how-it-compares
- Modelo base original: https://huggingface.co/vllm-sr/d3-mini
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Sitio de TurinTech: https://turintech.ai
- Dataset de evaluación: LocalLLaMA/typed-decisions (el enlace aparece truncado en la model card; el identificador del dataset es el indicado)
