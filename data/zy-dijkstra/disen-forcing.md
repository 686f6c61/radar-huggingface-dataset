# ZY-Dijkstra/Disen-Forcing

## Resumen

Disen-Forcing es un modelo de generación de vídeo texto-a-vídeo (text-to-video) de tipo autorregresivo, desarrollado por ZY-Dijkstra y presentado en un artículo aceptado en NeurIPS 2026. Se trata de un modelo destilado a partir de Wan2.1-T2V-1.3B (el modelo estudiante), que a su vez se inicializa desde el checkpoint de Causal Forcing y se entrena tomando como profesor a Wan2.1-T2V-14B. El objetivo es generar vídeos de larga duración (de 5 segundos a 1 minuto) manteniendo coherencia de largo alcance sin el problema de movimiento de baja dinámica que suelen provocar los mecanismos de "frame sink".

El modelo genera vídeos de 832×480 píxeles a 16 fps en cuatro pasos de muestreo por fragmento (chunk), lo que lo sitúa en la categoría de modelos de difusión destilados para inferencia rápida. Su relevancia radica en la combinación de generación autorregresiva por fragmentos con destilación DMD (Distribution Matching Distillation), una receta que busca preservar el anclaje semántico y el movimiento dinámico de forma desacoplada, tal como indica el título del paper.

El repositorio tiene un tamaño de 2,8 GB y contiene los pesos en formato safetensors (bf16). La licencia es Apache-2.0, heredada de Wan2.1. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva por fragmentos (chunk-wise), destilada de Wan2.1-T2V-1.3B; transformer de difusión para vídeo |
| Parametros totales | No disponible (el modelo base Wan2.1-T2V-1.3B tiene 1,3 mil millones, pero no se confirma el recuento exacto de Disen-Forcing) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en tokens; genera vídeos de 5 s a 1 min (21 a 252 frames latentes) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

Disen-Forcing es un modelo de difusión para vídeo de tipo autorregresivo que genera la secuencia por fragmentos (chunks). El estudiante es Wan2.1-T2V-1.3B, inicializado desde el checkpoint de Causal Forcing (un modelo de "chunk-wise ODE"), y el profesor es Wan2.1-T2V-14B. El entrenamiento emplea destilación DMD (Distribution Matching Distillation) con una receta mejorada descrita en el repositorio de código. La innovación principal, según el título del paper, consiste en desacoplar el anclaje semántico del movimiento, de modo que el modelo mantiene la consistencia de largo alcance sin la baja dinámica de movimiento que tiende a causar un frame sink.

El modelo genera a 832×480 píxeles y 16 fps, con cuatro pasos de muestreo por fragmento. El número de frames latentes controla la duración: 21 frames latentes equivalen aproximadamente a 5 segundos, 126 a unos 30 segundos y 252 a aproximadamente 1 minuto. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada.

## Capacidades

- Generación de vídeo texto-a-vídeo (text-to-video) a 832×480 y 16 fps.
- Generación de vídeo de larga duración: de 5 segundos a 1 minuto en una sola pasada autorregresiva.
- Inferencia rápida: 4 pasos de muestreo por fragmento gracias a la destilación DMD.
- Coherencia de largo alcance sin el efecto de movimiento de baja dinámica asociado a los frame sinks.
- Control de duración mediante el parámetro `--num_output_frames` (frames latentes).
- No se dispone de información sobre tool calling, function calling, capacidades de agente, multilingüismo, visión, audio ni modos de razonamiento explícito.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo puede producir vídeos de 5 a 30 segundos a 832×480 en pocos pasos de muestreo, adecuado para prototipado rápido de creatividades.
- Creación de vídeo de formato largo para redes sociales: con 252 frames latentes (≈1 minuto) se pueden generar piezas de un minuto manteniendo coherencia temporal, útil para contenido de YouTube o TikTok.
- Previsualización de storyboards animados: la generación autorregresiva por fragmentos permite iterar sobre prompts y semillas para explorar variantes de una escena antes de producir el render final.
- Generación de fondos y b-roll para edición: clips de 16 fps y resolución 832×480 que pueden integrarse como material de relleno en pipelines de postproducción.
- Investigación en difusión de vídeo: al ser un modelo destilado con receta DMD reproducible y código abierto, sirve como base para experimentos de destilación, coherencia de largo alcance y dinámica de movimiento.
- Demos interactivas de texto-a-vídeo: la inferencia en 4 pasos por fragmento reduce la latencia lo suficiente para prototipos de aplicaciones web que generan clips bajo demanda.
- Evaluación comparativa de modelos de vídeo: el modelo se distribuye con prompts de MovieGenVideoBench en el repositorio, lo que facilita su uso en benchmarks reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 2,8 GB en bf16 y el modelo base es de 1,3 mil millones de parámetros, por lo que la inferencia en bf16 debería caber en GPUs de consumo con suficiente memoria, aunque no se confirma.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos (1,3B en bf16) es plausible en GPUs de 16-24 GB, pero no se aporta dato oficial.
- Opciones de despliegue: el repositorio oficial proporciona `inference.py` con configuración YAML; requiere descargar por separado Wan2.1-T2V-1.3B como dependencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica que emplea 4 pasos de muestreo por fragmento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| Disen-Forcing | No disponible (base 1,3B) | 5 s a 1 min, 832×480, 16 fps | Apache-2.0 | Hugging Face, código en GitHub |
| Wan2.1-T2V-1.3B | 1,3B | No disponible en la información | Apache-2.0 (según modelo base) | Hugging Face (Wan-AI) |
| Causal Forcing | No disponible | No disponible | No disponible | GitHub (thu-ml) |
| Wan2.1-T2V-14B | 14B | No disponible en la información | No disponible | Hugging Face (Wan-AI) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks que permitan validar la calidad frente a alternativas.
- No se dispone de información sobre sesgos conocidos del modelo ni de su dataset de entrenamiento.
- Riesgo de alucinación visual y de inconsistencias semánticas inherente a los modelos de difusión de vídeo; no cuantificado en la información disponible.
- Resolución limitada a 832×480 y tasa de 16 fps, inferior a la de modelos de vídeo de gama alta.
- No se especifican los idiomas soportados para los prompts; la información no está disponible.
- La licencia Apache-2.0 permite uso comercial, pero se hereda de Wan2.1 y conviene revisar las condiciones del modelo base y de las dependencias (CausVid, Self-Forcing, Infinite-Forcing, Causal Forcing, Self Gradient Forcing).
- El modelo requiere descargar por separado Wan2.1-T2V-1.3B y clonar el repositorio de código; no es un paquete autónomo listo para usar con pipelines estándar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni de validación externa.

## Enlaces

- [Hugging Face: ZY-Dijkstra/Disen-Forcing](https://huggingface.co/ZY-Dijkstra/Disen-Forcing)
- [Paper (arXiv:2611.02822)](https://arxiv.org/abs/2611.02822)
- [Project page](https://disen-forcing.github.io/)
- [Código en GitHub](https://github.com/Dijkstra14/Disen-Forcing)
- [Receta de entrenamiento mejorada](https://github.com/Dijkstra14/Disen-Forcing#improved-training-recipe)
- [Wan2.1 (modelo base)](https://github.com/Wan-Video/Wan2.1)
- [Wan2.1-T2V-1.3B en Hugging Face](https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B)
- [Causal Forcing](https://github.com/thu-ml/Causal-Forcing)
- [CausVid](https://github.com/tianweiy/CausVid)
- [Self-Forcing](https://github.com/guandeh17/Self-Forcing)
- [Infinite-Forcing](https://github.com/SOTAMak1r/Infinite-Forcing)
- [Self Gradient Forcing](https://github.com/zhuang2002/Self_Gradient_Forcing)
