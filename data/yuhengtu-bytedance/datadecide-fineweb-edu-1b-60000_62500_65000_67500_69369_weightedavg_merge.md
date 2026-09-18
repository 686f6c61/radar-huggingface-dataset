# yuhengtu-bytedance/DataDecide-fineweb-edu-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de tipo transformer decoder-only con arquitectura Llama y 1.279.854.592 parámetros (aproximadamente 1,28 B), publicado por el usuario yuhengtu-bytedance. No se trata de un modelo entrenado desde cero ni de un modelo ajustado con instrucciones, sino de una fusión de pesos (merge) de cinco checkpoints intermedios de un mismo entrenamiento sobre el corpus fineweb-edu, generada con la herramienta mergekit mediante el método Linear con normalización de pesos.

El interés del artefacto es fundamentalmente metodológico: los checkpoints fusionados corresponden a los pasos 60000, 62500, 65000, 67500 y 69369 de una ejecución de preentrenamiento, con pesos crecientes (1, 2, 3, 4 y 5 respectivamente) y el paso 69369 como modelo base. Las rutas internas del YAML de configuración remiten a un directorio llamado Pan_Safety_Better_Measurement y a la serie de experimentos DataDecide sobre fineweb-edu, lo que sitúa el modelo en el contexto de la investigación sobre selección de datos de preentrenamiento a pequeña escala y promediado de checkpoints.

Su relevancia práctica es limitada fuera del ámbito experimental: es un modelo base sin ajuste por instrucciones, sin licencia declarada, sin idiomas documentados, sin resultados de benchmarks publicados y con cero descargas en el momento de redactar esta ficha. Resulta útil como referencia reproducible para estudiar técnicas de model merging y como punto de partida para ajuste fino o para experimentos de destilación, pero no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (etiqueta `llama` en los metadatos); número de capas, dimensión oculta y cabezas de atención no disponibles |
| Parametros totales | 1.279.854.592 (aproximadamente 1,28 B), según los pesos en safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican versiones cuantizadas. Los pesos se distribuyen en bfloat16 y son cuantizables a fp16, int8 e int4 con herramientas externas (llama.cpp, bitsandbytes, GPTQ/AWQ) |
| Idiomas soportados | No disponibles. El modelo base se entrenó sobre fineweb-edu, un corpus web filtrado de carácter predominantemente inglés |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (salida en bfloat16; cálculo del merge en float32) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna más allá de la etiqueta `llama` y del pipeline `text-generation`. El modelo resultante es una interpolación lineal de pesos de cinco checkpoints del mismo run de preentrenamiento, no una combinación de modelos distintos: los pasos 60000, 62500, 65000, 67500 y 69369 proceden todos del entrenamiento sobre fineweb-edu. La configuración del merge, generada con mergekit, usa `merge_method: linear`, `normalize: true` y una base explícita (el paso 69369). Con la normalización activada, los pesos declarados 1, 2, 3, 4 y 5 se reescalan a 1/15, 2/15, 3/15, 4/15 y 5/15, de modo que el checkpoint final recibe un tercio de la masa total y los intermedios el resto de forma decreciente.

El método Linear citado corresponde al artículo arXiv:2203.05482 (model soups, promediado de pesos de modelos ajustados). No hay información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de fases de RLHF o DPO ni innovaciones técnicas adicionales, más allá de que la ejecución de origen está vinculada al corpus fineweb-edu y a un directorio de trabajo denominado Pan_Safety_Better_Measurement. Tampoco se documenta si el merge se validó con métricas de validación o si el criterio de pesos responde a una búsqueda sistemática.

## Capacidades

- Generación de texto autoregresiva en modo completación: al ser un modelo base sin ajuste por instrucciones, no mantiene formato de chat ni responde a instrucciones de sistema.
- Razonamiento y conocimiento general limitados por el tamaño (1,28 B de parámetros) y por un preentrenamiento centrado en texto educativo filtrado.
- Capacidad de código y matemáticas: presumiblemente residual, derivada del corpus fineweb-edu; no hay documentación ni evaluación que la cuantifique.
- Tool calling / function calling: no disponible y no documentado; no se ha aplicado ajuste para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el corpus de entrenamiento es mayoritariamente anglófono.
- Modo thinking, visión o audio: no disponibles.
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica que puede servirse con TGI y con la capa de inferencia compatible de Hugging Face.

## Casos de uso

- Investigación en model merging: reproducción de experimentos de promediado lineal de checkpoints con mergekit, comparando la configuración `normalize: true` con alternativas (SLERP, TIES, DARE) sobre la misma serie de checkpoints.
- Estudio de la dinámica de entrenamiento: análisis de cómo evoluciona la pérdida y las representaciones entre los pasos 60000 y 69369 y de qué aporta cada checkpoint al promedio ponderado.
- Línea base en experimentos de selección de datos: al proceder de fineweb-edu, sirve como punto de comparación frente a runs equivalentes sobre otros corpus (por ejemplo, DCLM o dolma) dentro de la misma serie DataDecide.
- Punto de partida para ajuste fino supervisado: con 1,28 B de parámetros es entrenable con LoRA o QLoRA en una única GPU de consumo, útil para prototipar tareas concretas antes de escalar a modelos mayores.
- Destilación de conocimiento: uso como alumno o como profesor auxiliar en experimentos de destilación desde modelos de mayor tamaño, dado su coste de inferencia reducido.
- Evaluación de pipelines de cuantización: al ser un modelo de 2,6 GB en bfloat16, permite medir la degradación de perplejidad al pasar a int8 e int4 en hardware de consumo sin necesidad de infraestructura grande.
- Generación de texto de completación en entornos offline: una vez convertido a GGUF, puede ejecutarse en CPU o en Apple Silicon para tareas de autocompletado de bajo riesgo, siempre que se asuma la ausencia de ajuste por instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni perplejidad, y no se ha publicado ningún informe de evaluación asociado al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB en bfloat16 o fp16 (1,28 B × 2 bytes), unos 1,3 GB en int8 y unos 0,7 GB en int4, más el coste del caché KV y de las activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM resulta suficiente, por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como A10G, L4 o A100/H100 en entornos de servidor (estas últimas muy sobredimensionadas para este tamaño).
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales, e incluso en CPU y en Apple Silicon tras convertir los pesos.
- Opciones de despliegue: `transformers` de forma nativa; TGI y la capa de inferencia compatible de Hugging Face (el repo está etiquetado como `endpoints_compatible`); vLLM; llama.cpp y Ollama solo tras convertir los pesos a GGUF, ya que el repositorio no publica archivos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia, y no hay datos que permitan estimarlas con fiabilidad.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo analizado, por lo que la comparación de rendimiento no puede establecerse. La tabla siguiente recoge únicamente datos públicos de referencia de alternativas de tamaño comparable; las cifras del modelo analizado son las que figuran en el repositorio.

| Modelo | Parametros | Contexto | Licencia | Tipo | Rendimiento comparado |
|---|---|---|---|---|---|
| DataDecide-fineweb-edu-1B-...weightedavg_merge (este modelo) | 1,28 B | No disponible | No disponible | Modelo base fusionado (merge lineal) | No disponible |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | Llama 3.2 Community License | Modelo base e instruct | No disponible en esta ficha |
| TinyLlama 1.1B | 1,10 B | 2 048 tokens | Apache 2.0 | Modelo base e instruct | No disponible en esta ficha |
| Qwen2.5 1.5B | 1,54 B | 32 768 tokens | Apache 2.0 (salvo la variante de 3B) | Modelo base e instruct | No disponible en esta ficha |
| SmolLM2 1.7B | 1,71 B | 8 192 tokens | Apache 2.0 | Modelo base e instruct | No disponible en esta ficha |

Las diferencias relevantes frente a estas alternativas no son de tamaño, sino de madurez: los modelos citados cuentan con licencia explícita, versiones ajustadas por instrucciones, plantillas de chat y evaluaciones publicadas, mientras que este merge carece de todo ello.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por preferencias: no sigue instrucciones, no mantiene diálogo con formato de chat y no dispone de plantilla de chat documentada.
- Riesgo elevado de alucinación y de incoherencia factual, agravado por el tamaño reducido (1,28 B) y por la ausencia de evaluaciones que acoten su fiabilidad.
- Licencia no declarada: no se especifican condiciones de uso, lo que impide asumir derechos de uso comercial y constituye un riesgo legal para cualquier despliegue en producción.
- Idiomas soportados no documentados y sesgo previsible hacia el inglés y hacia el registro de texto educativo filtrado de fineweb-edu.
- Longitud de contexto desconocida: no hay información que permita dimensionar ventanas largas ni garantizar el comportamiento más allá del contexto de entrenamiento original.
- Origen experimental: el modelo procede de checkpoints intermedios (pasos 60000 a 69369) de un run de investigación, no de un entrenamiento finalizado y validado, por lo que su calidad respecto al checkpoint final no está caracterizada.
- Ausencia total de validación comunitaria: cero descargas y cero valoraciones en el momento de la consulta, sin informes de terceros que confirmen el comportamiento reproducible de los pesos.
- Las etiquetas de fusión (`mergekit`, `merge`) indican que el artefacto está pensado para experimentación con técnicas de merging, no para servir tráfico real.
- Las rutas absolutas incluidas en la model card (`/opt/tiger/...`) revelan el entorno interno del autor y no son reproducibles fuera de él; solo los pesos publicados permiten reutilizar el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhengtu-bytedance/DataDecide-fineweb-edu-1B-60000_62500_65000_67500_69369_weightedavg_merge
- mergekit (herramienta de fusión de modelos): https://github.com/cg123/mergekit
- Artículo del método Linear / model soups: https://arxiv.org/abs/2203.05482
- Corpus fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Nota: la búsqueda web asociada a esta ficha devolvió únicamente resultados no relacionados con el modelo (portales geográficos de Luxemburgo y foros de impresión y mineralogía), por lo que no se han podido incorporar enlaces adicionales sobre papers, blogs, repositorios o demos del autor.
