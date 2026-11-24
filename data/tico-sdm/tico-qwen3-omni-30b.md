# TiCo-sdm/TiCo-Qwen3-Omni-30B

## Resumen

TiCo-Qwen3-Omni-30B es un adaptador LoRA (rank 8) sobre el modelo multimodal Qwen3-Omni-30B-A3B-Instruct de Alibaba Qwen, desarrollado por TiCo-sdm. Su objetivo es el control explícito de la duración en diálogo hablado: el modelo aprende a emitir marcadores de tiempo hablado (Spoken Time Markers, con sintaxis `<10.6 seconds>`) durante la generación, de modo que la respuesta oral resultante se ajusta a una duración objetivo indicada por el usuario. El rango de entrenamiento declarado es de 10 a 40 segundos.

El modelo hereda del backbone una arquitectura omni (texto, audio y visión) con 30 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token (MoE), aunque el adaptador solo modifica la parte generadora de texto: el generador de voz y el codificador de audio permanecen congelados. El entrenamiento se realizó en dos etapas: un SFT supervisado sobre respuestas habladas propias con marcadores de tiempo, seguido de GRPO junto con CHORD aplicando recompensas sobre dichos marcadores (duración, presencia, monotonicidad, repetición y copia).

La relevancia práctica está en los asistentes de voz con restricciones temporales, donde la longitud de la respuesta debe ceñirse a un presupuesto de tiempo (por ejemplo, respuestas de 15 segundos para un contestador o para una locución sincronizada). El checkpoint publicado corresponde al paso 600 de la etapa 2 y reporta una reducción del error de duración (MAPE) del 42,06 % del modelo base al 12,18 %. El repositorio ocupa 5,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 8) sobre Qwen3-Omni-30B-A3B-Instruct (transformer omni multimodal con mezcla de expertos) |
| Parametros totales | 30B (modelo base); el adaptador LoRA es de rango 8 |
| Parametros activos | Aproximadamente 3B (MoE del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); exportable a modelo fusionado mediante `swift export` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Omni-30B-A3B-Instruct, un transformer multimodal con mezcla de expertos que procesa texto, audio y visión y que incluye un generador de voz. Sobre él se entrena únicamente un LoRA de rango 8 aplicado a la parte generadora de texto; el generador de habla y el codificador de audio quedan congelados durante todo el proceso. La innovación central es la emisión de Spoken Time Markers: el modelo escribe marcas como `<10.6 seconds>` intercaladas en su respuesta para planificar y controlar la duración de la locución final.

El entrenamiento consta de dos etapas. La primera es un SFT supervisado sobre las propias respuestas habladas del modelo anotadas con marcadores de tiempo (checkpoint `TiCo-Qwen3-Omni-30B-Stage1-SFT`, paso 625). La segunda aplica GRPO combinado con CHORD, con funciones de recompensa específicas sobre los marcadores: duración, presencia, monotonicidad, repetición y copia, con objetivos de 10 a 40 segundos. El adaptador continúa el mismo checkpoint de la etapa 1, y el paso 600 es el reportado como resultado final. No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de diálogo hablado con control explícito de duración mediante marcadores de tiempo hablado.
- Ajuste de la respuesta oral a un objetivo temporal indicado por el usuario (rango entrenado de 10 a 40 segundos).
- Generación de habla a través del generador de voz del backbone (congelado durante el entrenamiento del adaptador).
- Capacidades multimodales heredadas del backbone Qwen3-Omni (audio y visión), aunque no reentrenadas en este adaptador.
- Generación de texto conversacional en lenguaje hablado llano, según el system prompt de entrenamiento.
- Cierre de respuestas en frase completa en el 93,0 % de los casos según la model card.
- Soporte de tool calling y de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz con presupuesto temporal: el modelo permite fijar una duración objetivo (por ejemplo, 15 segundos) y genera una respuesta oral que se ajusta a ese límite, útil en contestadores automáticos y sistemas de atención telefónica.
- Locución para contenidos con ranura fija: en radio, pódcast o vídeo donde el hueco de voz está definido, el control de duración evita recortes manuales o regeneraciones.
- Respuestas de voz en dispositivos con límites de tiempo de reproducción: por ejemplo, avisos en altavoces inteligentes que deben caber en una ventana concreta.
- Diálogo hablado multi-turno con planificación temporal: el modelo puede declarar la duración de cada intervención antes de emitirla, lo que facilita la sincronización con otros elementos de la interfaz.
- Evaluación e investigación en control de duración: el adaptador sirve como referencia reproducible (checkpoints en pasos 400, 600 y 1500) para estudiar recompensas GRPO sobre marcadores temporales.
- Prototipos de asistentes conversacionales sobre Qwen3-Omni: al fusionar el adaptador con `swift export`, se obtiene un modelo desplegable con vllm-omni que conserva las capacidades omni del backbone.
- Generación de respuestas habladas concisas para interfaces de voz en producción: el 93,0 % de respuestas terminan en frase completa, lo que reduce cortes abruptos en la locución.

## Benchmarks y rendimiento

| Metrica | TiCo (paso 600) | Modelo base |
|---|---|---|
| Error de duración en TiCo-Bench (MAPE) | 12,18 % | 42,06 % |
| GPT-score | 3,76 | 3,58 |
| UTMOS | 4,44 | 4,44 |
| Respuestas que terminan en frase completa | 93,0 % | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 5,1 GB en el repositorio; el modelo fusionado requiere cargar el backbone Qwen3-Omni-30B-A3B-Instruct completo, con 30B parámetros totales y aproximadamente 3B activos por token.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del backbone, la inferencia en precisión completa no cabe en GPU de consumo y requiere GPUs de centro de datos.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base se espera el uso de A100/H100 o superiores, aunque no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador por sí solo (5,1 GB) es ligero, pero requiere el backbone completo.
- Despliegue: fusión del adaptador con `swift export --merge_lora true` y generación con vllm-omni; se requiere además el parche `patches/install_patch.sh` del repositorio de código de TiCo para eliminar los marcadores de tiempo del audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Control de duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TiCo-Qwen3-Omni-30B | 30B (3B activos) + LoRA r8 | no disponible | Sí (marcadores de tiempo, 10-40 s) | no disponible | Hugging Face (0 descargas) |
| Qwen3-Omni-30B-A3B-Instruct | 30B (3B activos) | no disponible | No (MAPE 42,06 %) | no disponible | Hugging Face (modelo base) |
| TiCo-Qwen3-Omni-30B-Stage1-SFT | 30B (3B activos) + LoRA r8 | no disponible | Parcial (solo SFT, sin GRPO) | no disponible | Hugging Face (checkpoint intermedio) |

No se dispone de información sobre otros modelos comparables de control de duración en habla en la documentación proporcionada.

## Limitaciones y advertencias

- El adaptador solo entrena la parte generadora de texto; el generador de voz y el codificador de audio están congelados, por lo que las mejoras se limitan a la planificación temporal de la respuesta, no a la calidad acústica (UTMOS idéntico al base, 4,44).
- Sin el parche de eliminación de marcadores (`patches/install_patch.sh`), el modelo pronuncia en voz alta los marcadores de tiempo, lo que lo hace inutilizable en producción sin ese paso.
- El rango de duraciones entrenado es de 10 a 40 segundos; no hay datos sobre el comportamiento fuera de ese intervalo.
- Licencia no especificada: no se puede confirmar el uso comercial ni las obligaciones de atribución, lo que supone un riesgo para despliegues en producción.
- Idiomas soportados no documentados; el system prompt de entrenamiento está en inglés, lo que puede sesgar el registro y el idioma de las respuestas.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- El checkpoint reportado es el paso 600; existen otros checkpoints (400, 1500) sin resultados publicados, por lo que la elección del checkpoint óptimo no está justificada en la model card.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TiCo-sdm/TiCo-Qwen3-Omni-30B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Checkpoint de etapa 1 (SFT): https://huggingface.co/TiCo-sdm/TiCo-Qwen3-Omni-30B-Stage1-SFT
- Repositorio de código de TiCo (parche `patches/install_patch.sh`): no disponible en la información proporcionada
- Paper de TiCo: no disponible en la información proporcionada
