# tensor-ai-inc/d3-mini-NVFP4

## Resumen

d3-mini-NVFP4 es una versión cuantizada a NVFP4 de vllm-sr/d3-mini, el modelo de la familia Decision 3.0 desarrollado por el equipo de vLLM Semantic Router. No es un modelo generativo al uso: está especializado en tareas de decisión y clasificación zero-shot, y se consume a través de una API propia ("System One") en la que se envía un estado o contexto junto con un conjunto de preguntas tipadas (elección entre criterios, sí/no, puntuación) y el modelo devuelve la respuesta elegida. Esa orientación lo hace relevante para enrutado, triaje y automatización de decisiones dentro de pipelines, un nicho donde los LLM generalistas resultan caros y verbosos.

La cuantización la firma tensor-ai-inc con NVIDIA TensorRT Model Optimizer 0.47.0, siguiendo la receta de NVIDIA para esta familia: las capas MLP y de atención completa van en NVFP4, mientras que las capas de atención lineal, los embeddings, el codificador de visión y el readout de decisión se mantienen en su precisión original. Por eso el ahorro de tamaño es del 41 % (de 9,1 GB a 5,4 GB) y no el ~75 % teórico de unos pesos de 4 bits. El formato está pensado para GPUs Blackwell, que ejecutan FP4 en hardware.

Hay una discrepancia de datos que conviene tener presente: la model card describe el modelo base como "el modelo de 4,5B de la familia Decision 3.0", pero el recuento real de safetensors del repositorio es de 3.260.002.816 parámetros (3,26 B). El repositorio tiene 5,4 GB y, en el momento de redactar esta ficha, cero descargas y cero likes, por lo que se trata de una publicación reciente y sin validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y capas de atención lineal, más codificador de visión y readout de decisión (la etiqueta del repo es `qwen3_5`; la model card no detalla la arquitectura completa) |
| Parametros totales | 3.260.002.816 (3,26 B) según safetensors; la model card del autor afirma 4,5 B para el modelo base |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4: valores FP4, escalas FP8 por cada 16 valores, una escala FP32 por tensor. Sin cuantizar: embeddings, capas de atención lineal, codificador de visión y readout de decisión |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `custom_code`; requiere vLLM (build nightly) para su ejecución |

## Arquitectura y entrenamiento

El modelo base, vllm-sr/d3-mini, es un transformer híbrido: combina capas de atención completa con capas de atención lineal, e incorpora un codificador de visión, lo que explica que la model card original hable de preguntas, imágenes y vídeo. Sobre esa base, esta versión aplica cuantización NVFP4 con NVIDIA TensorRT Model Optimizer 0.47.0 respetando una receta por capas: MLP y atención completa en FP4, y el resto de componentes (atención lineal, embeddings, encoder visual y readout) en su precisión original. Los pesos resultantes ocupan 5,4 GB frente a los 9,1 GB del original, un 41 % menos.

El proceso de calibración usó 256 prompts de UltraChat con preguntas genéricas de elección, sí/no y puntuación, explícitamente sin ejemplos de ningún benchmark. La revisión del código fuente del modelo base empleada fue `bd0090dd758d32ba59ef5c749910a8e87fc4391f`. No se detallan en la información disponible el volumen de tokens de entrenamiento del modelo original, la composición del dataset ni si hubo etapas de RLHF o DPO; tampoco se describe ninguna innovación de decodificación o atención más allá de la hibridación atención completa / atención lineal.

## Capacidades

- Clasificación zero-shot: es la tarea declarada en el pipeline (`zero-shot-classification`) y el eje del modelo.
- Preguntas de elección entre criterios: se define un conjunto de opciones con sus descripciones (por ejemplo, equipos o rutas) y el modelo devuelve la opción aplicable al estado recibido.
- Preguntas booleanas (tipo `noul`, sí/no): verificación de condiciones sobre el estado, como la presencia de un justificante o el cumplimiento de un requisito.
- Preguntas de puntuación: el modelo puede emitir una valoración numérica dentro del mismo esquema de consulta.
- Entrada multimodal: la model card remite a la del modelo original para preguntas con imágenes y vídeo, dado que el codificador de visión se conserva sin cuantizar.
- Tareas cubiertas por el Decision Index: conocimiento, lenguaje, recuperación, uso de herramientas y artes, según la composición del conjunto de evaluación empleado.
- API específica de decisión (`/v1/systemone`) servida por vLLM, con estado y un mapa de preguntas tipadas en la misma petición.
- No se documenta generación de texto libre, razonamiento multi-paso explícito ni modo "thinking"; la información disponible no lo confirma.

## Casos de uso

- Triaje de tickets de soporte: se envía el texto de la incidencia como `state` y una pregunta de elección con los equipos disponibles como criterios; el modelo devuelve la ruta (por ejemplo, devoluciones frente a facturación), lo que permite enrutar en una sola llamada sin generar texto.
- Verificación de requisitos en flujos de devolución o reclamación: preguntas booleanas del tipo "¿el cliente aporta justificante?" o "¿el pedido está dentro de plazo?" sobre el estado consolidado del caso, con salida directamente consumible por el sistema de gestión.
- Moderación y cumplimiento: clasificación de contenidos o solicitudes contra un conjunto de políticas definidas como criterios, sustituyendo reglas frágiles por una decisión semántica.
- Enrutado en pipelines de agentes: selección de la siguiente herramienta o subagente a invocar a partir del estado de la conversación, con las herramientas como opciones de la pregunta de elección.
- Priorización y scoring: asignación de una puntuación a leads, incidencias o candidaturas usando preguntas de tipo score sobre el estado recibido.
- Documentos con imagen: al conservar el codificador de visión, puede resolver preguntas de decisión sobre capturas, formularios escaneados o fotogramas, útil en gestión documental y verificación de entregas dañadas.
- Automatización de back office con vLLM: despliegue en un servidor vLLM existente para clasificar grandes volúmenes de registros con un modelo de 5,4 GB, liberando el LLM generativo para tareas que sí requieren redacción.

## Benchmarks y rendimiento

| Modelo | Decision Index (público) 0.3 | Misma respuesta que el original | Pesos |
|---|---|---|---|
| vllm-sr/d3-mini (original) | 53,70 | - | 9,1 GB |
| tensor-ai-inc/d3-mini-NVFP4 | 53,65 | 95,8 % | 5,4 GB |
| Jev by TypeSafe (referencia, vía Vercel AI Gateway) | 54,69 | - | no disponible |

Notas sobre la medición, según el autor: se evaluó sobre la parte pública del Decision Index 0.3 con una muestra estratificada fija de 1.000 peticiones, usando los scorers del propio kit y una compilación hecha a partir de las fuentes del kit en lugar de la copia oficial; el autor advierte que son números para comparar filas, no puntuaciones de leaderboard. Ambas variantes se ejecutaron en una única H100 con el mismo código; como Hopper no tiene hardware FP4, los resultados NVFP4 proceden del FP4 simulado de Model Optimizer. Jev no respondió a 7 de las 1.000 peticiones y se contabilizaron como fallo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible, ni mediciones de latencia o throughput en Blackwell.

## Requisitos de hardware

- VRAM estimada: 5,4 GB solo de pesos; hay que sumar caché KV y activaciones, y el codificador de visión, embeddings y capas de atención lineal se cargan en su precisión original, por lo que el pico de memoria supera el tamaño del repositorio. No se publica una cifra oficial de VRAM.
- GPU recomendadas: hardware Blackwell, que ejecuta FP4 de forma nativa y es el objetivo declarado del formato. En Hopper (H100) el modelo puede evaluarse, pero solo con FP4 simulado, que redondea pesos y activaciones igual que el modelo exportado sin aprovechar aceleración por hardware.
- GPU de consumo: por generación, las tarjetas Blackwell de consumo son las únicas con soporte FP4 nativo; el tamaño de 5,4 GB hace que el modelo quepa en cualquier GPU con 8 GB o más, pero la ruta FP4 solo es eficiente en Blackwell.
- Despliegue: únicamente vLLM, y con build nightly, porque el soporte de Decision 3.0 está en la rama principal (`pip install -U vllm --extra-index-url https://wheels.vllm.ai/nightly`; `vllm serve tensor-ai-inc/d3-mini-NVFP4`). No se documenta soporte para llama.cpp, Ollama ni TGI, ni existencia de pesos GGUF.
- Latencia y throughput: no medidos. El autor indica explícitamente que todavía no ha medido velocidad en Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (público) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tensor-ai-inc/d3-mini-NVFP4 | 3,26 B (safetensors) / 4,5 B según model card | no disponible | 53,65 | Apache-2.0 | safetensors, vLLM nightly |
| vllm-sr/d3-mini (original) | 4,5 B según model card | no disponible | 53,70 | Apache-2.0 | pesos originales, 9,1 GB |
| Jev by TypeSafe | no disponible | no disponible | 54,69 | no disponible | servicio vía Vercel AI Gateway |

La comparación relevante es interna: frente al original, la versión NVFP4 pierde 0,05 puntos de Decision Index y coincide en el 95,8 % de las respuestas con un 41 % menos de peso. Jev by TypeSafe se incluye únicamente como referencia de la misma suite de evaluación y como servicio gestionado, no como pesos descargables. No se dispone de datos para comparar con otros modelos de decisión o clasificación de tamaño similar.

## Limitaciones y advertencias

- Sesgos: no hay información sobre la composición del dataset de entrenamiento del modelo base ni sobre evaluaciones de sesgo; el calibrado se hizo con UltraChat, un corpus conversacional de dominio general.
- Alucinación: al tratarse de un modelo de elección y clasificación, el riesgo se traduce en decisiones erróneas o forzadas dentro de las opciones dadas (siempre elige entre los criterios disponibles), no en texto inventado. No se reportan tasas de error por tipo de pregunta.
- Cobertura de evaluación limitada: el único dato disponible es el Decision Index con una muestra de 1.000 peticiones, compilado por el propio autor desde las fuentes del kit; no hay MMLU, HumanEval ni evaluaciones de terceros.
- Idiomas: no se declara ningún idioma soportado. No debe asumirse multilingüismo sin verificación previa.
- Contexto: no se publica la longitud de ventana, lo que impide dimensionar el coste de estados largos en producción.
- Dependencia de un build nightly de vLLM y de código con `custom_code`: implica riesgo de rotura entre versiones y ausencia de soporte en runtimes alternativos.
- Rendimiento no verificado en el hardware objetivo: las cifras publicadas provienen de FP4 simulado en H100 y el autor reconoce no haber medido velocidad en Blackwell.
- Discrepancia de tamaño: 3,26 B reales frente a los 4,5 B declarados en la model card, lo que puede afectar a estimaciones de memoria y coste.
- Madurez: repositorio con cero descargas y cero likes; sin validación independiente de la comunidad.
- Licencia: Apache-2.0 permite uso comercial; se incluyen los ficheros LICENSE y NOTICE del modelo original, que deben conservarse al redistribuir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tensor-ai-inc/d3-mini-NVFP4
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Decision Index (kit de evaluación): https://github.com/apolinario/decision-index
- Dataset de calibración UltraChat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Wheels nightly de vLLM: https://wheels.vllm.ai/nightly
- Los resultados de la búsqueda web (tensor.art, tensor.trade, artículos sobre tensores en Wikipedia) no guardan relación con este modelo y se han descartado.
