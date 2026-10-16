# XuanyuLiu/Scene-Builder-Qwen3-VL-8B-Instruct

## Resumen

Scene-Builder-Qwen3-VL-8B-Instruct es un modelo vision-lenguaje especializado en diseño y crítica de escenas 3D, desarrollado por el grupo OmniAI del ZJU ACES Lab y publicado en HuggingFace bajo el identificador XuanyuLiu/Scene-Builder-Qwen3-VL-8B-Instruct. Se trata de un fine-tuning supervisado (SFT, versión v7) sobre Qwen/Qwen3-VL-8B-Instruct, con 8.767.123.696 parámetros totales (unos 8,77 mil millones) y pesos completos en BF16 repartidos en cuatro ficheros safetensors, lo que supone un repositorio de 17,6 GB.

El problema que aborda es la generación agéntica de escenas 3D: el modelo aprende simultáneamente a construir escenas físicamente válidas, funcionalmente correctas y coherentes en su distribución espacial, y a criticar su calidad distinguiendo diseños mejores de peores. Esta doble capacidad, denominada "design intelligence" por los autores, se entrena a partir de dos fuentes de supervisión complementarias: Scene-OTA-35K (experiencia de construcción con interacciones Observation–Thought–Action) y Scene-OTC-15K (experiencia de crítica con supervisión Observation–Thought–Critic basada en perturbaciones de escena con degradación ordenada de calidad).

Su relevancia actual radica en que es el punto de partida del pipeline Scene-Designer: los pesos liberados corresponden a la etapa SFT previa al entrenamiento Scene-GRPO, en el que un crítico congelado compara diseños candidatos y evalúa la mejora de padre a hijo. El checkpoint está pensado para integrarse en un entorno de ejecución con herramientas de construcción de escenas, no como modelo de propósito general autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer vision-lenguaje de Qwen3-VL) |
| Parámetros totales | 8.767.123.696 (~8,77 B) |
| Parámetros activos | no aplica (no es MoE; no disponible confirmación de componentes MoE en el modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos completos en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuatro shards, BF16, con shard index, configuraciones de modelo y generación, tokenizer, chat template y configuraciones de preprocesado de imagen y vídeo) |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (relación: finetune) |
| Etapa de entrenamiento | Supervised fine-tuning (SFT), versión v7 |
| Tamaño del repositorio | 17,6 GB |
| Biblioteca | transformers |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3VLForConditionalGeneration, la clase de transformers asociada a la familia Qwen3-VL, un transformer multimodal que procesa entradas de imagen y texto y genera texto. El modelo hereda la torre visual y el mecanismo de atención del modelo base Qwen3-VL-8B-Instruct y no introduce modificaciones estructurales propias: la contribución del trabajo está en el proceso de ajuste y en el tipo de supervisión, no en el diseño de bloques nuevos. El repositorio incluye los ficheros de configuración del preprocesado de imagen y vídeo, lo que confirma el soporte de entradas visuales además de texto.

El entrenamiento es un SFT conjunto sobre dos datasets construidos por los autores. Scene-OTA-35K contiene experiencia de construcción de escenas con interacciones Observation–Thought–Action, y aplica una técnica denominada Causal Trajectory Consolidation que preserva las decisiones relevantes de construcción y corrección y elimina las correcciones ineficaces. Scene-OTC-15K contiene experiencia de crítica de escenas con supervisión Observation–Thought–Critic, generada mediante perturbaciones de escena que producen comparaciones con degradación de calidad ordenada. El SFT conjunto sobre ambas fuentes da lugar a Scene-Builder, que después sirve de inicialización para la etapa Scene-GRPO del proyecto Scene-Designer, no incluida en estos pesos. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto multimodal a partir de entradas de imagen y texto (pipeline image-text-to-text), con la torre visual heredada de Qwen3-VL-8B-Instruct.
- Construcción de escenas 3D: producción de secuencias de acciones de construcción con estructura Observation–Thought–Action, orientadas a escenas físicamente válidas, funcionalmente correctas y coherentes en su layout.
- Corrección de errores durante la construcción: la técnica Causal Trajectory Consolidation del entrenamiento preserva decisiones de corrección relevantes y descarta correcciones ineficaces, de modo que el modelo aprende a rectificar sin ensayo y error innecesario.
- Crítica de escenas: evaluación de la calidad de una escena en las mismas dimensiones (validez física, corrección funcional, coherencia de layout) y comparación entre dos o más diseños para determinar cuál es mejor.
- Razonamiento multi-paso orientado a agentes: las trazas de entrenamiento son trayectorias de observación, pensamiento y acción, lo que encaja con flujos agénticos que requieren varios pasos antes de producir una escena final.
- Comprensión de escenas a partir de imágenes: al derivar de un VLM, puede interpretar representaciones visuales de escenas como entrada para la fase de observación.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo; no se declara soporte de otros idiomas.
- Tool calling / function calling: no disponible como capacidad declarada explícitamente. La construcción de escenas requiere las herramientas y el entorno de ejecución del proyecto, pero la model card no detalla un formato de function calling estándar.
- Modo "thinking" explícito, visión por vídeo, audio u otras capacidades especiales: no disponible en la información proporcionada, más allá del preprocesado de vídeo incluido en los ficheros del repositorio.

## Casos de uso

- Generación agéntica de escenas 3D para videojuegos y simuladores: el modelo propone secuencias de acciones de construcción (Observation–Thought–Action) que un motor externo ejecuta para poblar un entorno 3D con objetos coherentes en su disposición espacial y con validez física, evitando colocaciones flotantes o colisiones.
- Diseño automatizado de interiores y espacios arquitectónicos: dada una imagen o descripción de una estancia, el modelo genera una distribución funcionalmente correcta de mobiliario y elementos, y puede justificar sus decisiones dentro de la traza de razonamiento.
- Control de calidad de escenas generadas: usando la capacidad de crítica, se puede situar el modelo como evaluador que puntúa o clasifica escenas producidas por otro sistema y detecta incoherencias de layout, invalideces físicas o problemas funcionales antes de publicar el contenido.
- Comparación y selección de diseños alternativos: el modelo puede recibir dos o más candidatos de escena y determinar cuál es mejor, lo que permite filtrar automáticamente salidas de un generador y quedarse con la mejor variante sin intervención humana.
- Bucle de mejora iterativa tipo Scene-GRPO: al comparar un diseño padre con un diseño hijo, el modelo puede actuar como crítico congelado para estimar si una modificación concreta mejora la escena, habilitando pipelines de refinamiento automático.
- Robótica y planificación de manipulación en entornos domésticos: la representación de escenas con restricciones físicas y funcionales es directamente reutilizable para decidir dónde colocar o recuperar objetos en un entorno real simplificado.
- Asistencia al diseñador en herramientas de autoría 3D: integrado en un plugin, el modelo puede recibir una captura del viewport y proponer correcciones concretas sobre la escena en curso, con explicación del problema detectado.
- Evaluación de modelos generativos de escenas: gracias al benchmark Scene-OTC-Bench (94 preguntas de comparación de dos escenas y 55 de ranking de cuatro escenas), el modelo puede emplearse como referencia en la evaluación de otros sistemas de generación de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona la existencia del conjunto de evaluación Scene-OTC-Bench, compuesto por 94 preguntas de comparación entre dos escenas y 55 preguntas de ranking entre cuatro escenas, pero no incluye las puntuaciones obtenidas por este checkpoint en dicho benchmark ni en otros conjuntos estándar como MMLU, HumanEval o GSM8K. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- Pesos en BF16: 8.767.123.696 parámetros a 2 bytes por parámetro suponen aproximadamente 17,5 GB de pesos, coherente con el tamaño de repositorio de 17,6 GB.
- VRAM estimada para inferencia en BF16: en torno a 20-24 GB considerando pesos más caché de activaciones y KV, dependiendo de la resolución de las imágenes de entrada y de la longitud de la secuencia. Las imágenes de alta resolución en modelos VLM incrementan de forma notable el consumo de memoria por los tokens visuales.
- GPU recomendadas: A100 (40 GB o 80 GB), H100 (80 GB) y GPUs de 24 GB como la RTX 4090 o RTX 3090 para cargas ligeras. En una GPU de 24 GB el modelo en BF16 entra de forma ajustada y puede requerir limitar la resolución de imagen o la longitud de contexto.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM (RTX 3090, RTX 4090) en BF16 con margen reducido. En GPUs de 16 GB o menos no cabe en BF16 sin cuantización.
- Cuantizaciones: no hay cuantizaciones publicadas por el autor (solo BF16). No se dispone de datos sobre versiones GGUF, AWQ, GPTQ o similares para este checkpoint.
- Opciones de despliegue: la vía documentada es transformers con AutoProcessor y Qwen3VLForConditionalGeneration, con dtype auto y device_map auto. El soporte en vLLM, SGLang, TGI, llama.cpp u Ollama no está confirmado en la información disponible y dependería del soporte de Qwen3-VL en cada uno de esos frameworks.
- Latencia y throughput: no disponible.
- Requisito adicional: la generación de escenas de extremo a extremo necesita además las herramientas de construcción de escenas y el entorno de ejecución del proyecto; este repositorio solo aporta los pesos y los recursos de procesado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scene-Builder-Qwen3-VL-8B-Instruct | 8,77 B | no disponible | VLM con SFT para diseño y crítica de escenas 3D | no disponible | Pesos completos BF16 en HuggingFace |
| Qwen3-VL-8B-Instruct (modelo base) | no disponible en la información proporcionada | no disponible | VLM generalista de propósito conversacional | no disponible en la información proporcionada | HuggingFace (Qwen/Qwen3-VL-8B-Instruct) |
| Otros VLM de ~8 B de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas como otros VLM de tamaño similar o con modelos especializados en generación de escenas 3D.

## Limitaciones y advertencias

- Licencia no especificada: la información disponible no indica la licencia del modelo, por lo que no se puede confirmar si el uso comercial está permitido. Al ser un finetune de Qwen3-VL-8B-Instruct, conviene verificar además las condiciones de la licencia del modelo base antes de cualquier despliegue en producción.
- Idiomas: el modelo declara únicamente inglés. No hay evidencia de soporte para castellano ni para otros idiomas.
- Especialización estrecha: es un checkpoint SFT orientado a construcción y crítica de escenas. Fuera de ese dominio su comportamiento como asistente general no está documentado y probablemente esté degradado respecto al modelo base.
- Dependencia del entorno: la generación de escenas de extremo a extremo requiere herramientas y un entorno de ejecución externos que no se incluyen en el repositorio. Usar el modelo de forma aislada no produce escenas ejecutables.
- Etapa intermedia del pipeline: estos pesos son la etapa SFT previa al entrenamiento Scene-GRPO. El modelo final del proyecto, Scene-Designer, no es este checkpoint, por lo que el rendimiento publicado del proyecto no debe atribuirse directamente a estos pesos.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni tasas de alucinación en la información disponible. En tareas de crítica, una evaluación errónea puede propagarse a decisiones de diseño equivocadas, especialmente si el modelo se usa como crítico automático sin verificación.
- Adopción muy baja y sin validación externa: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y se publicó el 15 de octubre de 2026. No hay evidencia de uso en producción ni de validación independiente.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de Scene-OTC-Bench para este checkpoint, lo que impide estimar su calidad relativa frente a alternativas.
- Contexto, cuantizaciones y métricas de eficiencia no disponibles: no se puede planificar capacidad, coste de memoria ni latencia con datos concretos aportados por el autor.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XuanyuLiu/Scene-Builder-Qwen3-VL-8B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Página del proyecto Scene-Designer: https://11penguins.github.io/Scene-Designer/
- Repositorio GitHub: https://github.com/11penguins/Scene-Designer
- Benchmark Scene-OTC-Bench: https://huggingface.co/datasets/XuanyuLiu/Scene-OTC-Bench
- Vídeo de introducción (inglés): https://huggingface.co/XuanyuLiu/Scene-Builder-Qwen3-VL-8B-Instruct/resolve/main/assets/scene-designer-overview-en.mp4
- Demos de escenas: https://11penguins.github.io/Scene-Designer/#demo
