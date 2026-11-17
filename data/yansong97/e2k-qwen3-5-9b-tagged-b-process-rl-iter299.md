# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter299

## Resumen

E2K-Qwen3.5-9B-tagged-B-process-rl-iter299 es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B mediante fine-tuning supervisado (SFT) seguido de aprendizaje por refuerzo (RL). Lo publica el autor YanSong97 dentro de la línea de trabajo "E2K" (experience-to-knowledge), centrada en la internalización de conocimiento sobre entornos de ARC-AGI-3. El checkpoint corresponde al rollout 299 (zero-based) de la rama de RL denominada "process", que combina recompensa por resultado, recompensa por progreso verificado en el estado de la tarea y penalizaciones por error.

El modelo parte de la arquitectura Qwen3.5-9B, un transformer multimodal con pipeline image-text-to-text, y conserva los pesos congelados de la torre de visión y del módulo MTP auxiliar. El entrenamiento, en cambio, se realizó exclusivamente sobre representaciones textuales y de rejilla (grid). El resultado no es una mejora general del modelo base, sino un artefacto experimental orientado a estudiar cómo un modelo puede adquirir y aplicar conocimiento factual sobre dos entornos concretos (cd82 y m0r0) de ARC-AGI-3.

Es relevante ahora porque documenta de forma muy detallada el protocolo de entrenamiento, las recompensas usadas y las limitaciones observadas, incluyendo auditorías que detectan coordenadas fabricadas, mezcla de reglas entre juegos y desajustes entre explicación y acción. Su licencia Apache-2.0 facilita la reproducción y el análisis, aunque el propio autor advierte que no debe interpretarse como evidencia de éxito general en ARC-AGI-3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text), pesos de visión y MTP congelados |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento RL usa entrada reciente de 12K tokens y salida limitada a 16K) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el repo ocupa 19,3 GB) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (60 shards, con índice `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

La base es Qwen3.5-9B, un transformer multimodal de aproximadamente 9,65 mil millones de parámetros que procesa entradas de imagen y texto. En este checkpoint, la torre de visión y los tensores auxiliares MTP no fueron entrenados: se restauraron como activos congelados de inferencia mediante el exportador. El grueso del entrenamiento se realizó sobre texto y rejillas, con supervisión completa de objetivos (sin enmascaramiento del cuerpo de conocimiento).

El proceso consta de dos fases. Primero, un SFT de 59 actualizaciones, 3 épocas, tasa de aprendizaje 5e-6 y batch global 4, inicializado de forma independiente desde Qwen/Qwen3.5-9B (rama `B_full`). Después, RL con 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, límite de salida de 16K tokens, estado actual completo con entrada reciente de 12K, temperatura 1, tasa de aprendizaje constante 1e-6 y paralelismo TP4/PP1. Cada batch contiene 8 episodios (4 de cd82 y 4 de m0r0), con semilla de entorno 0 y nivel inicial 0. El checkpoint iter299 cubre los rollouts 200 a 299 inclusive, con iter199 como padre de la etapa.

La innovación técnica principal es el diseño de recompensa de la rama "process": además de la recompensa por resultado (una victoria real de primer nivel), se usa progreso best-so-far ligado a replay, acotado a 0,2 y con gamma 0,99 sobre acciones reales, junto con penalizaciones locales por error. Es importante destacar que esta señal de proceso emplea estado y planificación privilegiados del lado de la recompensa y no evalúa la veracidad del razonamiento. El conjunto de conocimiento local contiene 29 hechos de primer nivel (22 de cd82 y 7 de m0r0), representados por 58 filas pregunta/respuesta, más ejemplos de estado/aplicación y ejemplos de protocolo de primera observación.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre entornos de rejilla, con formato conversacional.
- Entrada multimodal image-text-to-text heredada de Qwen3.5-9B (torre de visión congelada, no entrenada en este experimento).
- Aplicación de conocimiento factual específico sobre los entornos cd82 y m0r0 de ARC-AGI-3.
- Ejecución de secuencias de acciones dentro de un entorno (hasta 40 acciones por episodio en entrenamiento).
- Internalización de hechos mediante SFT y refinamiento por RL con recompensa de resultado y de progreso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, orientado al bucle acción-observación de ARC-AGI-3, no a agentes generales.
- Capacidades multilingües: no disponibles (la model card incluye texto en chino, pero no se especifica cobertura de idiomas).
- Modo "thinking": no disponible como característica documentada; el entrenamiento usa esfuerzo de razonamiento medio.

## Casos de uso

- Investigación sobre internalización de conocimiento: usar el checkpoint para estudiar cómo el SFT y el RL con recompensa de proceso modifican la capacidad del modelo de recordar y aplicar hechos concretos, comparando iter199 e iter299 dentro de la misma rama.
- Análisis de recompensas en RL: reproducir el protocolo de recompensa (resultado + progreso acotado a 0,2 + penalizaciones por error) para evaluar el impacto de señales privilegiadas en el aprendizaje, dado que el autor documenta el diseño exacto.
- Auditoría de fallos de razonamiento: emplear el modelo para generar episodios y detectar patologías como coordenadas fabricadas, mezcla de reglas entre juegos y desajuste entre explicación y acción, tal como reporta la model card.
- Estudio de generalización en ARC-AGI-3: medir si el conocimiento adquirido en cd82 y m0r0 se transfiere o no a layouts nuevos, aprovechando que el autor advierte que no hay evidencia de éxito en layouts no vistos.
- Base para experimentos de continuación: inicializar nuevos entrenamientos desde estos pesos, sabiendo que el checkpoint no incluye estado de optimizador, RNG ni sampler, por lo que no permite continuar Adam de forma exacta.
- Evaluación de estabilidad del entrenamiento: analizar la no monotonía del aprendizaje y la dominancia de m0r0 sobre cd82 usando los registros de `training_metadata.json` y los protocolos publicados en el dataset de runs.
- Despliegue multimodal experimental: cargar el modelo con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` en bfloat16 con `device_map="auto"` para probar entradas image-text-to-text, teniendo en cuenta que la torre de visión está congelada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 9,65 mil millones de parámetros en bfloat16, los pesos ocuparían aproximadamente 19,3 GB, cantidad coherente con el tamaño del repo; se requiere VRAM adicional para activaciones y contexto.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento usó TP4/PP1, lo que implica al menos 4 dispositivos en paralelo de tensor.
- Compatibilidad con GPU de consumo: no confirmada. Los ~19,3 GB de pesos en bfloat16 superan los 16 GB de muchas GPU de consumo; sería necesario cuantizar, pero no se documentan tipos de cuantización.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter299 | 9.653.104.368 | no disponible | sin benchmarks publicados; aprendizaje no monotónico y dominado por m0r0 | Apache-2.0 | Hugging Face (19 descargas) |
| Qwen/Qwen3.5-9B (modelo base) | ~9B | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter199 (checkpoint padre) | ~9B | no disponible | no disponible; etapa previa de la misma rama | Apache-2.0 (según artefactos relacionados) | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es una mejora general de Qwen3.5-9B: es un checkpoint de investigación limitado a los entornos cd82 y m0r0 de ARC-AGI-3.
- No hay evidencia de éxito en layouts nuevos ni en el juego completo; el autor lo declara explícitamente.
- El aprendizaje es no monotónico y está dominado por m0r0 frente a cd82.
- Las auditorías detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida incluso en episodios exitosos.
- Las etiquetas y la recitación de conocimiento no son evidencia de uso correcto del conocimiento.
- La cohorte de muestreo registrada en `training_metadata.json` se generó antes de su actualización y no debe presentarse como evaluación independiente de estos pesos.
- La métrica `rollout/rewards` es una ventaja relativa de grupo ponderada por respuesta, no la recompensa del entorno.
- La continuación de proceso se detuvo en 341 con muestreo fallido total, dejando 340 como última actualización verificada en lugar de completar 400; los pesos exactos del pico 260..269 no se conservan y HF249 no está etiquetado como mejor checkpoint.
- No se incluyen optimizador, checkpoint distribuido nativo, pickle, RNG ni estado del sampler: los pesos permiten inicializar trabajo futuro, pero no continuar Adam de forma exacta.
- La torre de visión y los tensores MTP están congelados y no fueron entrenados en este experimento.
- La licencia Apache-2.0 se copia del export del modelo base; conviene verificar su aplicabilidad a los datos derivados antes de uso comercial.
- Idiomas soportados no disponibles; riesgo de sesgos no evaluado en la documentación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter299)
- [Checkpoint padre iter199](https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter199)
- [Dataset de conocimiento y filas SFT](https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data)
- [Protocolos de ejecución, métricas y serie de checkpoints](https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
