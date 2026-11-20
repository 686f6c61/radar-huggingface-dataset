# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed4

## Resumen

DIET trajectory: OLMo2-medium es un modelo de lenguaje de ~305 millones de parámetros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto de investigación DIET sobre trayectorias en el espacio de pesos (weight-space). No es un modelo pensado para uso en producción, sino un artefacto experimental: una de las múltiples ejecuciones de preentrenamiento idénticas en receta que solo difieren en la semilla aleatoria, diseñadas para estudiar cómo evolucionan los pesos y las representaciones internas a lo largo del entrenamiento.

El modelo emplea un transformer denso de tipo decoder-only con 16 capas, dimensión oculta de 768, 12 cabezas de atención (sin GQA, ya que `num_key_value_heads=12`) y una ventana de contexto de 2048 tokens. Se entrenó sobre el mirror comunitario `emozilla/dolma-v1_7-3B` del corpus Dolma v1.7, con un presupuesto de 2.000 millones de tokens en bf16 sobre GPUs H100.

Su relevancia es metodológica: al compartir exactamente la misma receta, datos y arquitectura que el resto de la colección (cambiando solo la semilla), permite análisis controlados de variabilidad entre ejecuciones, alineación de trayectorias de entrenamiento y experimentos de dietas de datos o destilación. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización en investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (OLMo2, `olmo2_medium_dense`) |
| Parametros totales | ~305M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), checkpoints por rama `stepN` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only de la familia OLMo2, con `hidden_size=768`, `intermediate_size=3072`, 16 capas, 12 cabezas de atención y 12 cabezas KV (atención multi-cabeza estándar, sin agrupación de KV), y embeddings posicionales con máximo de 2048 posiciones. La configuración corresponde al fichero `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none`, es decir, sin profesor de destilación), sobre `emozilla/dolma-v1_7-3B`, un mirror nativo de Hugging Face del corpus Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming (sin pre-empaquetado). Se usó AdamW con learning rate 3e-5, betas (0.9, 0.95), weight decay 0.1, scheduler coseno y precisión bf16. El presupuesto total fue de 2.000 millones de tokens (`max_steps=30517`, `save_steps=100`), ejecutado en el clúster "makau" sobre GPUs H100. La única variable que diferencia esta ejecución de las demás de la colección es la semilla (`seed=4`). Los checkpoints intermedios se publican en ramas `stepN` (solo pesos), y `main` contiene los pesos finales.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base de lenguaje.
- Modelado de lenguaje y cálculo de perplejidad sobre corpus en inglés.
- Razonamiento básico y respuesta a prompts simples, limitado por su escala (~305M) y su naturaleza de modelo base sin ajuste por instrucciones.
- No dispone de ajuste por instrucciones (no es un modelo instruct/chat).
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- Capacidades multilingües limitadas al inglés declarado en la model card.
- No incluye visión, audio ni modo "thinking".
- Utilidad principal: servir como punto de análisis de trayectorias de entrenamiento y como base para experimentos de investigación.

## Casos de uso

- Análisis de trayectorias en el espacio de pesos: comparar los checkpoints `stepN` de esta semilla con los de otras semillas de la colección para medir la variabilidad entre ejecuciones y la convergencia de representaciones internas.
- Experimentos de dietas de datos: usar el modelo como referencia de una receta fija sobre Dolma v1.7 y contrastar con variantes que alteren la mezcla o el orden de los datos.
- Investigación en destilación: al estar entrenado con `teacher_schedule=none`, sirve como estudiante base o como línea base para comparar contra ejecuciones con profesor de destilación.
- Evaluación de perplejidad y sondas lingüísticas: calcular perplejidad sobre subconjuntos de Dolma o corpus en inglés para estudiar la evolución del modelado del lenguaje a lo largo del entrenamiento.
- Estudio de alineación de modelos (model merging y weight-space): analizar la interpolación de pesos entre semillas y su efecto en el rendimiento, gracias a que solo cambia la semilla.
- Reproducibilidad de recetas: validar pipelines de preentrenamiento OLMo2 a pequeña escala (~305M) antes de escalar a configuraciones mayores, usando la configuración y los hiperparámetros documentados.
- Fine-tuning académico de bajo coste: al ser un modelo de ~305M con licencia Apache 2.0, puede ajustarse en una sola GPU consumer para tareas de investigación en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6 GB solo para pesos (~305M parámetros × 2 bytes), más memoria para activaciones y caché KV.
- VRAM estimada en fp32: aproximadamente 1,2 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- GPUs recomendadas para entrenamiento o fine-tuning: H100 (usada en el entrenamiento original); para fine-tuning cabe en A100, RTX 4090 o similares con batch pequeño.
- Opciones de despliegue: `transformers` (librería declarada), y previsiblemente conversión a GGUF para llama.cpp/Ollama y servido con vLLM o TGI, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed4 | ~305M | 2048 | Apache 2.0 | Modelo base experimental, solo inglés, sin benchmarks publicados |
| jjalora/diet-traj-pythia-410m-* (colección) | ~410M | no disponible | no disponible | Colección análoga sobre arquitectura Pythia y datos distintos |
| OLMo2 (modelos oficiales de mayor escala) | no disponible | no disponible | Apache 2.0 | Misma familia arquitectónica; esta ejecución es una versión reducida de investigación |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para seguir instrucciones ni para uso conversacional directo.
- Escala reducida (~305M parámetros): capacidad de razonamiento y conocimiento factual limitada; alta propensión a errores y a alucinaciones en tareas complejas.
- Entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Ventana de contexto corta (2048 tokens), insuficiente para documentos largos.
- Sesgos: al entrenarse sobre Dolma v1.7, puede heredar sesgos presentes en el corpus web y de libros; no se documentan mitigaciones.
- Artefacto de investigación: los checkpoints intermedios en ramas `stepN` son solo pesos y pueden no ser directamente cargables sin la configuración adecuada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no se ha validado para producción; se recomienda no desplegarlo en entornos reales sin evaluación previa.
- El campo `git_commit` aparece como "unknown" en la procedencia, lo que dificulta la reproducibilidad exacta del código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed4
- Dataset utilizado: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Repositorio del proyecto DIET (referenciado en la model card): https://github.com/jjalora/diet-lm
- Colección relacionada (referenciada en la model card): https://huggingface.co/jjalora/diet-traj-pythia-410m
