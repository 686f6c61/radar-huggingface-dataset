# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter149

## Resumen

E2K-Qwen3.5-9B-tagged-B-process-rl-iter149 es un checkpoint de investigación publicado por YanSong97, derivado de Qwen/Qwen3.5-9B mediante ajuste supervisado (SFT) y aprendizaje por refuerzo (RL) sobre tareas de internalización de conocimiento en entornos ARC-AGI-3, concretamente en los entornos de primer nivel conocidos como cd82 y m0r0. No se trata de una mejora de propósito general del modelo base, sino de un artefacto experimental orientado a estudiar si un modelo puede aprender y aplicar conocimiento factual de un juego a partir de observaciones y recompensas.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original (pipeline image-text-to-text), con 9.653.104.368 parámetros totales según los pesos en safetensors, pero la torre de visión y los tensores auxiliares MTP no fueron entrenados en este experimento: se restauraron congelados desde el export del modelo base. El entrenamiento es textual y basado en rejillas (grids), con un máximo de 16K tokens de salida y una ventana de contexto operativa de aproximadamente 12K tokens de estado actual más historial reciente.

La relevancia de este checkpoint es metodológica: documenta con detalle la genealogía del entrenamiento (59 actualizaciones de SFT, 150 lotes de RL acumulados, reanudaciones con estado nativo de optimizador, semilla y sampler), las recompensas utilizadas (resultado real de nivel superado, progreso de estado verificado y penalizaciones por error) y, sobre todo, las limitaciones observadas: aprendizaje no monotónico, dominado por m0r0, alucinación de coordenadas y mezcla de reglas entre juegos incluso en episodios exitosos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con torre de visión y tensores MTP congelados |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificación formal; en entrenamiento RL se usó input de 12K más historial reciente, con tope de salida de 16K |
| Tipos de cuantización | no disponible (solo se publican pesos en bfloat16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (60 shards, según `model.safetensors.index.json`), más config, tokenizer y processor |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con torre de visión y módulos MTP (multi-token prediction). En este experimento, sin embargo, solo se entrena la parte textual: la torre de visión y los tensores MTP permanecen congelados y se restauran desde los activos de inferencia originales mediante el helper de exportación. La generación se realiza en modo conversacional sobre representaciones textuales y de rejilla propias de los entornos ARC-AGI-3.

El proceso de entrenamiento consta de dos fases. La primera es un SFT denominado `B_full`, inicializado de forma independiente desde Qwen3.5-9B, con 59 actualizaciones, 3 épocas, learning rate 5e-6 y batch global de 4, con supervisión completa del objetivo y sin enmascaramiento del cuerpo de conocimiento. La segunda es RL, que arranca desde el SFT con un Adam nuevo en la frontera SFT/RL y utiliza 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, temperatura 1, LR constante de 1e-6 y TP4/PP1. Cada lote contiene 8 episodios (4 de cd82 y 4 de m0r0) con semilla de entorno 0 y nivel inicial 0. La recompensa combina el resultado real de superar el primer nivel, progreso de estado de tarea verificado de forma independiente (limitado a 0.2, con gamma 0.99) y pequeñas penalizaciones por error locales a la llamada; los aciertos por fallback aleatorio terminal no otorgan crédito de resultado.

El conjunto de conocimiento observacional local contiene 29 hechos de primer nivel (22 de cd82 y 7 de m0r0) representados en 58 filas pregunta/respuesta, más 12 ejemplos construidos de estado/aplicación y 8 ejemplos de protocolo de primera inspección. Los datos derivan de observaciones y replays de OpenCode y de trabajo editorial externo, y no son un espejo fila a fila del dataset de conocimiento de ziyan98 en Hugging Face ni una colección de pensamientos de un modelo profesor. Las respuestas de conocimiento no se inyectan en los prompts del actor de RL.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno sobre el modelo base Qwen3.5-9B.
- Procesamiento de entradas image-text-to-text a nivel de pipeline, aunque la torre de visión no fue entrenada en este experimento y permanece congelada.
- Razonamiento sobre estados de juego en formato texto y rejilla, con hasta 40 acciones de entorno por episodio.
- Internalización y recitación de un conjunto acotado de hechos de conocimiento (29 hechos de primer nivel de cd82 y m0r0).
- Aplicación de protocolos de inspección inicial del entorno (8 ejemplos de protocolo incluidos en el entrenamiento).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al bucle de acciones del entorno ARC-AGI-3.
- Capacidades multilingües: no disponible; la model card incluye texto en chino e inglés, pero no se documenta cobertura lingüística.
- Modo thinking: se menciona "medium reasoning effort" como parámetro de entrenamiento, sin más especificación.

## Casos de uso

- Investigación sobre internalización de conocimiento en agentes: el checkpoint sirve para estudiar si un modelo aprende hechos factuales a partir de recompensas de resultado y de progreso de estado, usando los 29 hechos y las 58 filas pregunta/respuesta del dataset asociado como banco de pruebas controlado.
- Reproducción de experimentos de RL con recompensa verificada: los protocolos publicados en `YanSong97/E2K-tagged-knowledge-rl-runs` permiten replicar las condiciones de entrenamiento (8 episodios por lote, semilla 0, nivel inicial 0) y comparar curvas de aprendizaje no monotónicas.
- Estudio de alucinación en agentes sobre rejillas: la model card documenta coordenadas fabricadas y mezcla de reglas entre juegos, lo que hace del checkpoint un caso útil para diseñar detectores de inconsistencia explicación/acción.
- Análisis de dinámica de reanudación de RL: al conservar la genealogía de reanudaciones en 69/99/199 con estado nativo de optimizador, scheduler, RNG y sampler, permite estudiar el efecto de reanudar frente a reiniciar con Adam nuevo.
- Benchmarking de transferencia entre entornos: la asimetría de aprendizaje entre cd82 y m0r0 (dominada por m0r0) permite medir sesgos de dificultad entre tareas de primer nivel.
- Base para experimentos posteriores de SFT/RL: los pesos publicados pueden inicializar trabajo futuro, aunque no permiten continuar exactamente el estado de Adam original, que no se sube al repositorio.
- Evaluación de metodologías de exportación: `provenance.json` con identidades, tamaños y SHA256 de los artefactos fuente facilita auditar la integridad de la cadena de exportación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la cohorte de muestreo se generó antes de su actualización y no debe reportarse como evaluación independiente de estos pesos, y que `rollout/rewards` es una media de ventaja ponderada por respuesta, no la recompensa del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19,3 GB solo para pesos (9.653.104.368 parámetros × 2 bytes), más overhead de activaciones y contexto; en la práctica se requiere una GPU de 24 GB o superior para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto corto; para contextos cercanos a 12K-16K tokens conviene disponer de 40 GB o más.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con margen ajustado, o en GPUs de 16 GB si se aplica cuantización, aunque no se publican pesos cuantizados oficiales.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (carga indicada en la model card); el repositorio incluye `endpoints_compatible`. No se documenta soporte verificado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter149 | 9,65B | no disponible (12K en entrenamiento RL) | Apache-2.0 | Checkpoint de investigación SFT+RL sobre ARC-AGI-3 | Pesos safetensors en HF, sin optimizador |
| Qwen/Qwen3.5-9B | 9B (según nombre) | no disponible | no disponible en esta información | Modelo base multimodal de propósito general | Disponible en HF |
| YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter99 | mismo tamaño que el base | no disponible | Apache-2.0 | Checkpoint padre de la misma serie | Disponible en HF |
| Colecciones E2K de ziyan98 | no disponible | no disponible | no disponible | Experimentos separados de internalización de conocimiento | Disponibles en HF, sin herencia de resultados |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.5-9B; su validez se limita a los entornos cd82 y m0r0 de primer nivel.
- No hay evidencia de éxito en layouts nuevos ni en el juego completo.
- El aprendizaje es no monotónico y está dominado por m0r0, lo que sesga la evaluación global.
- Las auditorías detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida incluso en episodios exitosos.
- Las etiquetas y la recitación de conocimiento no son evidencia de uso correcto del conocimiento.
- La cohorte de muestreo se generó antes de la actualización de los pesos y no constituye una evaluación independiente.
- `rollout/rewards` es una media de ventaja ponderada por respuesta, no la recompensa del entorno; no debe citarse como métrica de rendimiento.
- La continuación larga del proceso se detuvo en 341 muestreos con todos los fallos, dejando 340 como última actualización verificada en lugar de completar 400.
- Los pesos exactos del pico 260..269 no se conservan y HF249 no está etiquetado como el mejor checkpoint.
- No se suben optimizador, checkpoint distribuido nativo, pickle, estado de RNG ni de sampler: los pesos permiten inicializar trabajo futuro pero no continuar exactamente el Adam original.
- La torre de visión y los tensores MTP no fueron entrenados; las capacidades multimodales no deben asumirse mejoradas.
- La licencia Apache-2.0 se copia del export del modelo base; conviene verificar las condiciones del modelo original para uso comercial.
- No se documentan idiomas soportados ni sesgos específicos más allá de los sesgos inherentes al modelo base y a los datos de observación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter149
- Checkpoint padre (iter99): https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter99
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Protocolos de ejecución, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
