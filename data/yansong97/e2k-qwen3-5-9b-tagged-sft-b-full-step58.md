# YanSong97/E2K-Qwen3.5-9B-tagged-sft-B-full-step58

## Resumen

E2K-Qwen3.5-9B-tagged-sft-B-full-step58 es un checkpoint de investigación publicado por YanSong97, resultado de un proceso de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B. El objetivo del experimento es la internalización de conocimiento factual de primer nivel sobre dos entornos concretos del juego ARC-AGI-3 (identificados como cd82 y m0r0), dentro de una línea de trabajo denominada experience-to-knowledge (E2K). No se trata de una mejora de propósito general del modelo base, sino de un artefacto acotado a un dominio muy específico.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original (pipeline image-text-to-text, clase `Qwen3_5ForConditionalGeneration`), con 9.653.104.368 parámetros totales y pesos en safetensors bfloat16 repartidos en 60 shards. El autor advierte explícitamente de que el entrenamiento fue textual y basado en rejillas, y que la torre de visión y los tensores auxiliares MTP no se entrenaron en este experimento; se restauraron congelados desde el export original.

La relevancia del checkpoint es metodológica más que de rendimiento: documenta con detalle el protocolo de SFT (59 actualizaciones, 3 épocas, LR 5e-6, batch global 4) y sirve como punto de partida (brazo `B_full`) para posteriores brazos de RL. El propio autor subraya que los resultados no constituyen evidencia de éxito en layouts nuevos ni en partidas completas, y que las auditorías detectan fallos recurrentes como coordenadas fabricadas o mezcla de reglas entre juegos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con torre de visión y tensores MTP congelados |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el protocolo de RL usa input de 12K y salida capada a 16K, pero no se especifica el contexto nativo del modelo) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (copiada del export base original) |
| Formato de pesos | safetensors (60 shards, bfloat16, con `model.safetensors.index.json` y `provenance.json`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con pipeline image-text-to-text. En este experimento, sin embargo, el entrenamiento es exclusivamente textual y basado en rejillas: la torre de visión y los tensores auxiliares MTP permanecen congelados y se restauran desde el export original mediante un helper de exportación. El checkpoint corresponde a la etapa SFT con supervisión completa de recuerdo y aplicación (brazo `B_full`), inicializado de forma independiente desde Qwen/Qwen3.5-9B, con 59 actualizaciones de optimizador, 3 épocas, learning rate 5e-6 y batch global 4. La supervisión cubre el objetivo completo, sin enmascarado del cuerpo de conocimiento.

Los datos de entrenamiento proceden de un conjunto local de conocimiento observacional con 29 hechos de primer nivel (22 de cd82 y 7 de m0r0), representados en 58 filas pregunta/respuesta. Los brazos B y C añaden 12 ejemplos construidos de estado/aplicación, y todos los brazos incluyen 8 ejemplos de protocolo de mirada inicial. Los datos se derivan de observaciones y replays de OpenCode, así como de trabajo editorial externo, y no son un espejo fila a fila del dataset de conocimiento de ziyan98 en Hugging Face ni una colección de pensamientos de profesor nativos de Claude. Este checkpoint es el padre de los brazos de RL, que arrancan con Adam nuevo en la frontera SFT/RL; las reanudaciones del brazo de proceso en 69/99/199 conservan estado nativo de optimizador, scheduler, RNG y sampler, y no son reinicios con Adam nuevo. El protocolo de RL emplea 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, tope de salida de 16K, estado actual completo con input de 12K y ventana reciente de 4, sin autocompactación, temperatura 1, LR 1e-6 constante y TP4/PP1, con 8 episodios por batch (4 cd82 + 4 m0r0), semilla de entorno 0 y nivel inicial 0/cap 1.

## Capacidades

- Generación de texto y razonamiento multimodal heredado del Qwen3.5-9B base, aunque la torre de visión no fue entrenada en este experimento.
- Recuerdo y aplicación de conocimiento factual de primer nivel sobre los entornos cd82 y m0r0 de ARC-AGI-3 (29 hechos, 58 filas pregunta/respuesta).
- Protocolo de mirada inicial: 8 ejemplos de inspección inicial del estado del juego incluidos en el entrenamiento.
- Ejemplos construidos de estado/aplicación (12 en los brazos B/C) para transferir conocimiento a decisiones concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el entrenamiento de RL asociado modela episodios de 40 acciones de entorno, pero este checkpoint es solo SFT y no incorpora ese comportamiento de forma verificada.
- Capacidades multilingües: no disponible; el autor incluye una nota en chino en la model card, pero no se documenta cobertura idiomática.
- Capacidades especiales: no se documenta thinking mode, audio ni otras modalidades más allá de la herencia del base.

## Casos de uso

- Investigación en internalización de conocimiento: el checkpoint permite estudiar si el SFT con supervisión completa de recuerdo logra que el modelo recite y aplique hechos de un dominio acotado, sirviendo como línea base para comparar con brazos de RL posteriores.
- Reproducción de experimentos E2K: al estar acompañado de los datasets `E2K-tagged-knowledge-data` y `E2K-tagged-knowledge-rl-runs`, se puede replicar el protocolo SFT (59 updates, 3 épocas, LR 5e-6) y auditar la procedencia mediante `provenance.json`.
- Punto de partida para RL sobre entornos ARC-AGI-3: el autor lo define como padre de los brazos de RL, por lo que es adecuado para inicializar entrenamientos con recompensa de despeje de primer nivel en cd82 y m0r0.
- Auditoría de fallos de razonamiento: útil para estudiar patrones de error documentados (coordenadas fabricadas, mezcla de reglas entre juegos, desajuste explicación/acción, generación repetida) en un entorno controlado.
- Evaluación de recuerdo factual en dominios cerrados: permite medir si el modelo distingue entre recitar una etiqueta y aplicar correctamente el conocimiento, dado que el autor advierte que las etiquetas no son evidencia de uso correcto.
- Docencia y divulgación sobre pipelines SFT/RL: la model card detalla hiperparámetros, composición de datos y límites, lo que lo convierte en un caso de estudio realista sobre checkpoints de investigación y sus caveats de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparables; únicamente describe el protocolo de entrenamiento y advierte de que la cohorte de muestreo se generó antes de su actualización y no debe reportarse como evaluación independiente de estos pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.653.104.368 parámetros en bfloat16, los pesos ocupan aproximadamente 19,3 GB (coincide con el tamaño del repo). Se requiere margen adicional para el contexto y las activaciones; en la práctica, al menos 24 GB de VRAM para bfloat16 y más si se emplea contexto largo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16 con `device_map="auto"`. En GPUs de 24 GB puede ser necesario recurrir a cuantización o a offload, aunque no se publican pesos cuantizados.
- Cabe en consumer GPU: sí, en RTX 4090 (24 GB) en bfloat16 ajustado, y en GPUs de 16 GB solo mediante cuantización no publicada por el autor.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (código de carga incluido en la model card). vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible; la compatibilidad con endpoints se indica mediante el tag `endpoints_compatible`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-sft-B-full-step58 | 9.653.104.368 | no disponible | SFT de conocimiento acotado sobre ARC-AGI-3 (cd82, m0r0) | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (base) | 9B (aproximado según nombre) | no disponible | Modelo multimodal generalista | no disponible en la informacion | Hugging Face (modelo base referenciado) |
| ziyan98 E2K collections | no disponible | no disponible | Colecciones de conocimiento E2K y modelos asociados | no disponible | Hugging Face; el autor indica que son experimentos, datasets y modelos separados que no heredan sus puntuaciones |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.5-9B: el autor lo declara explícitamente y lo restringe a los entornos cd82 y m0r0.
- No hay evidencia de éxito en layouts nuevos ni en partidas completas; el entrenamiento se limita al primer nivel.
- Las auditorías detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida incluso en episodios exitosos.
- Las etiquetas y la recitación no son evidencia de uso correcto del conocimiento.
- El aprendizaje es no monotónico y está dominado por m0r0; la continuación larga del brazo de proceso se detuvo en 341 muestreos fallidos, dejando 340 como última actualización verificada en lugar de completar 400.
- Los pesos exactos del pico 260..269 no se conservan; HF249 no está etiquetado como el mejor checkpoint.
- La cohorte de muestreo se generó antes de su actualización y no debe reportarse como evaluación independiente de estos pesos; `rollout/rewards` es una media de ventaja ponderada por respuesta, no la recompensa de entorno.
- No se suben optimizador, checkpoint distribuido nativo, pickle, RNG ni estado del sampler: los pesos HF pueden inicializar trabajo futuro pero no permiten continuar Adam de forma exacta.
- La torre de visión y los tensores MTP no se entrenaron; las capacidades visuales no están validadas para este checkpoint.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: documentado por el autor en forma de coordenadas fabricadas y mezcla de reglas.
- Restricciones de licencia: Apache-2.0, copiada del export base original; el autor no añade restricciones adicionales, pero conviene verificar la licencia del modelo base Qwen3.5-9B para uso comercial.
- Caveat de producción: es un checkpoint de investigación con 0 descargas y 0 likes; no está pensado para despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-sft-B-full-step58
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Dataset de protocolos de ejecución, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Referencia de layouts (ziyan98 E2K collections): no se proporciona URL directa en la información disponible; el autor indica que son experimentos, datasets y modelos separados.
