# stanfordasl/diet-traj-olmo2-medium-dolma-seed3

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-seed3` es un modelo de lenguaje de aproximadamente 305 millones de parámetros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl como parte del proyecto DIET de análisis del espacio de pesos (weight-space). No es un modelo pensado para uso productivo, sino un artefacto de investigación: uno de los puntos de una trayectoria de preentrenamiento reproducible, con semilla 3, que permite estudiar la evolución de los pesos y del comportamiento del modelo a lo largo del entrenamiento.

El modelo emplea una arquitectura transformer densa de tipo OLMo2 (hidden_size 768, 16 capas, 12 cabezas de atención, contexto máximo de 2048 tokens) y se entrenó sobre `emozilla/dolma-v1_7-3B`, un espejo en HuggingFace de Dolma v1.7 muestreado proporcionalmente según su mezcla de componentes y consumido en streaming. La receta es preentrenamiento puro con entropía cruzada (sin destilación, `teacher_schedule=none`), AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precisión bf16, con un presupuesto de 2.000 millones de tokens.

Su relevancia es metodológica: la colección completa (misma receta, distinta semilla) permite aislar el efecto del azar en el preentrenamiento y analizar trayectorias de pesos, algo que interesa a investigadores en interpretabilidad, dinámica de entrenamiento y reproducibilidad. Para desarrolladores que buscan un modelo listo para producción, en cambio, no es la elección adecuada: el contexto es corto, solo hay inglés y el checkpoint está orientado a análisis, no a despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (`olmo2_medium_dense`) |
| Parametros totales | ~305M |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), solo pesos; checkpoints en ramas `stepN`, pesos finales en `main` |

Detalles de configuracion adicionales: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` (atención multi-cabeza sin GQA).

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only de la familia OLMo2, definido en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`. Con 16 capas, dimensión oculta 768, dimensión intermedia 3072 y 12 cabezas de atención (12 cabezas KV, es decir, sin grouped-query attention), el modelo suma aproximadamente 305M de parámetros y una ventana de contexto de 2048 posiciones.

El entrenamiento es un preentrenamiento estándar de modelado de lenguaje con entropía cruzada, sin fase de destilación (`distillation.teacher_schedule=none` en `src/run_distillation.py`). Se usó AdamW con learning rate 3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y bf16. El dataset es `emozilla/dolma-v1_7-3B`, leído en streaming (no preempaquetado), con un presupuesto de 2.000 millones de tokens, 30.517 pasos máximos y guardado cada 950 pasos. La procedencia registrada en `run.json` indica clúster «makau», GPU H100, job 9426, inicio el 2026-10-28 y semilla 3. La única diferencia entre los runs de la colección es la semilla aleatoria, lo que convierte a estos checkpoints en material para estudiar la variabilidad inducida por la inicialización y el orden de los datos.

## Capacidades

- Generación de texto en inglés: modelado de lenguaje autoregresivo básico propio de un modelo de 305M entrenado con 2B tokens.
- Razonamiento y conocimiento factual limitados por escala y presupuesto de entrenamiento; no se documentan capacidades específicas de razonamiento.
- Código y matemáticas: no se documentan evaluaciones ni capacidades destacadas en estas áreas.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Agentes y razonamiento multi-paso: no disponible; no se menciona soporte.
- Capacidades multilingües: solo inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Uso principal: análisis de trayectorias de entrenamiento en el espacio de pesos, comparación entre semillas y reproducibilidad de recetas.

## Casos de uso

- Investigación en dinámica de entrenamiento: cargar los checkpoints de las ramas `stepN` para estudiar cómo evolucionan los pesos y las representaciones internas a lo largo de los 30.517 pasos, comparando con los runs de otras semillas de la misma colección.
- Análisis de variabilidad por semilla: al diferir únicamente en la semilla, este checkpoint permite cuantificar cuánto del comportamiento final se debe al azar de inicialización y al orden de los datos, un experimento habitual en estudios de reproducibilidad.
- Interpretabilidad de circuitos y activaciones: con 16 capas y 768 dimensiones ocultas, el modelo es lo bastante pequeño para inspeccionar activaciones y cabezas de atención en una sola GPU, sirviendo como banco de pruebas de técnicas que luego se escalan.
- Estudio del efecto de la mezcla de datos: al entrenarse sobre Dolma v1.7 muestreado proporcionalmente, permite analizar cómo la composición del corpus afecta a las curvas de pérdida por dominio.
- Validación de pipelines de entrenamiento: el `run.json` documenta clúster, GPU, job, pasos y semilla, por lo que el checkpoint sirve como referencia para verificar que una reproducción propia alcanza la misma pérdida con la misma receta.
- Docencia y experimentos de bajo coste: un modelo de 305M en bf16 ocupa poco más de 600 MB de pesos, lo que permite ejecutar experimentos de fine-tuning o evaluación en hardware de consumo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y no se han inventado cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los ~305M de parámetros ocupan aproximadamente 0,6 GB de pesos; con overhead de activaciones y caché KV para 2048 tokens, el consumo realista se sitúa en torno a 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el entrenamiento documentado se realizó en H100, pero la inferencia no requiere hardware de centro de datos.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: al publicarse en formato transformers con safetensors, es compatible con la librería `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. No se documenta soporte verificado para vLLM, llama.cpp, Ollama o TGI, y no se proporcionan pesos GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed3 | ~305M | 2048 | Apache 2.0 | Trayectoria de preentrenamiento (investigación) | HuggingFace, 16 descargas |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible en la informacion | no disponible en la informacion | Trayectoria de preentrenamiento sobre arquitectura Pythia | Colección en HuggingFace |
| OLMo2 (modelos oficiales de AI2) | Escalas mayores | Mayor que 2048 en las variantes grandes | Apache 2.0 | Modelo de propósito general | HuggingFace |

La comparación con la colección Pythia es la más directa: comparten el objetivo de análisis de trayectorias y una receta reproducible, aunque difieren en arquitectura y tamaño. Frente a los OLMo2 oficiales de AI2, este checkpoint es una versión reducida y de investigación, no un modelo de uso general.

## Limitaciones y advertencias

- Escala reducida: con ~305M de parámetros y 2B tokens de entrenamiento, la calidad de generación y el conocimiento factual son muy inferiores a los de modelos de miles de millones de parámetros; no es apto para tareas de producción exigentes.
- Contexto corto: 2048 tokens limita conversaciones multi-turno largas, resumen de documentos extensos y análisis de código de gran tamaño.
- Solo inglés: no hay soporte multilingüe documentado.
- Riesgo de alucinación: alto en proporción a su escala y presupuesto de datos; no se ha realizado ajuste por RLHF ni DPO, por lo que no hay alineación de comportamiento.
- Sesgos: al entrenarse sobre Dolma, hereda los sesgos presentes en ese corpus web; no se documentan evaluaciones de sesgo ni mitigaciones.
- Orientado a investigación: los checkpoints intermedios son solo pesos, sin garantías de estabilidad ni de calidad; el uso previsto es el análisis, no el despliegue.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del dataset Dolma y de los componentes subyacentes antes de redistribuir derivados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento que respalde afirmaciones de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed3
- Repositorio del proyecto DIET (referenciado en la model card): `jjalora/diet-lm`
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Colección relacionada de trayectorias Pythia (referenciada): `jjalora/diet-traj-pythia-410m-*`
