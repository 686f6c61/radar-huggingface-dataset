# stanfordasl/diet-traj-olmo2-medium-dolma-seed4

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-seed4` es un checkpoint de preentrenamiento from scratch con arquitectura OLMo2, de aproximadamente 305 millones de parámetros, publicado como parte del proyecto DIET de análisis en espacio de pesos (*weight-space*). No es un modelo instructivo ni un asistente conversacional: es un artefacto de investigación diseñado para estudiar trayectorias de entrenamiento, es decir, cómo evolucionan los pesos y las capacidades a lo largo de las distintas checkpoints de una misma ejecución. Cada miembro de la colección comparte receta y datos, y solo cambia la semilla aleatoria (en este caso, seed 4).

El modelo se entrena sobre `emozilla/dolma-v1_7-3B`, un espejo nativo de HuggingFace del corpus Dolma v1.7 muestreado proporcionalmente entre sus componentes, con un presupuesto de 2.000 millones de tokens y 30.517 pasos de optimización. La arquitectura es un transformer denso con `hidden_size=768`, 16 capas, 12 cabezas de atención y 12 cabezas KV (atención multi-head sin GQA), con una longitud de contexto máxima de 2.048 tokens. Los pesos se distribuyen en bf16 safetensors, con ramas `stepN` para cada checkpoint intermedio.

Su relevancia es metodológica: permite a investigadores reproducir experimentos de dinámica de entrenamiento, comparar el efecto de la semilla en la trayectoria de pérdida y en la geometría de los pesos, y disponer de un punto de control pequeño (ejecutable en una sola GPU de consumo) con arquitectura moderna OLMo2 y licencia Apache 2.0. La model card no documenta evaluación de capacidades ni datos de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (`olmo2_medium_dense`) |
| Parametros totales | ~305M (hidden_size=768, intermediate_size=3072, 16 capas, 12 cabezas, 12 cabezas KV) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no se publican cuantizaciones; los pesos se distribuyen en bf16 safetensors (convertibles a fp16/fp32, int8 y GGUF mediante herramientas externas) |
| Idiomas soportados | inglés (`en`), según la model card y el corpus Dolma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 (ramas `stepN` con checkpoints intermedios; `main` con los pesos finales) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso de la familia OLMo2, con 16 capas, dimensión oculta 768, dimensión intermedia 3072 y 12 cabezas de atención con 12 cabezas KV (sin grouped-query attention), lo que da un total de aproximadamente 305 millones de parámetros y una ventana de contexto de 2.048 posiciones. No emplea mezcla de expertos ni mecanismos híbridos tipo SSM: es una pila transformer convencional con atención completa, pensada para servir como sujeto de experimentos controlados.

El entrenamiento consiste en preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`), sin destilación, sin RLHF ni DPO, y sin fase de ajuste instructivo. Los datos provienen de `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre los componentes de la mezcla Dolma v1.7 y consumido en streaming (no preempaquetado, según la model card, aunque `run.json` menciona una caché empaquetada). La receta usa AdamW con `lr=3e-5`, betas `(0.9, 0.95)`, weight decay 0.1, scheduler coseno y precisión bf16, sobre GPUs H200; el presupuesto declarado es de 2.000.000.000 tokens en 30.517 pasos, con guardado cada 950 pasos. La innovación no está en el modelo sino en el diseño experimental: la colección mantiene constante todo salvo la semilla (seed 4 en esta variante), lo que habilita análisis de varianza entre ejecuciones y estudios de trayectoria en el espacio de pesos.

## Capacidades

- Generación de texto autoregresiva y cálculo de perplejidad: es su función nativa, como modelo base de lenguaje.
- Modelado de lenguaje condicionado a contexto de hasta 2.048 tokens; no soporta ventanas mayores sin extrapolación.
- Capacidad multilingüe: limitada a inglés, idioma dominante del corpus Dolma; no se documenta competencia en otras lenguas.
- Razonamiento y matemáticas: no se han publicado evaluaciones; al ser un modelo base de 305M sin ajuste, el rendimiento esperable en tareas de razonamiento multi-paso es bajo.
- Generación de código: no documentada ni evaluada; el corpus Dolma incluye algo de código, pero no hay métricas.
- Tool calling / function calling: no soportado de forma nativa; no hay plantilla de chat ni formato de herramientas en el repositorio.
- Capacidades de agente y razonamiento multi-paso: no soportadas; no es un modelo instructivo.
- Modo *thinking*, visión, audio o multimodalidad: no disponibles.
- Uso previsto real: servir de sujeto experimental para análisis de trayectorias de entrenamiento, estudios de semilla y comparativas de espacio de pesos.

## Casos de uso

- Análisis de trayectorias de entrenamiento: cargar las distintas ramas `stepN` (cada 950 pasos) y medir la evolución de la pérdida, la norma de los pesos o la similitud entre checkpoints para estudiar cómo se organiza el aprendizaje a lo largo de 2.000 millones de tokens.
- Estudio de variabilidad por semilla: comparar esta ejecución (seed 4) con las demás semillas de la colección para cuantificar la dispersión en métricas finales y en la geometría de los pesos, un problema abierto en reproducibilidad de LLMs.
- Investigación en interpretabilidad: al ser un modelo pequeño con 16 capas y contexto de 2.048 tokens, permite entrenar sondas lineales, analizar circuitos de atención o extraer activaciones en una sola GPU de consumo.
- Baseline de referencia para preentrenamiento a pequeña escala: sirve como punto de comparación controlado (misma arquitectura y datos) al probar nuevas recetas de optimización, schedules o curricula, sin el coste de un modelo grande.
- Destilación y inicialización: los pesos pueden usarse como inicialización o como profesor/estudiante en experimentos de destilación sobre arquitectura OLMo2, dado que la receta base desactiva explícitamente el schedule de destilación.
- Generación de texto de bajo coste en inglés para pruebas de infraestructura: validar pipelines de inferencia (transformers, vLLM, llama.cpp), medir throughput y latencia, o probar sistemas de evaluación antes de escalar a modelos mayores.
- Experimentos de *weight-space merging*: al compartir receta y solo diferir en semilla, es un candidato natural para estudiar interpolación lineal entre pesos (model souping) y su efecto en la perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni perplejidad sobre conjuntos de validación, y la búsqueda web asociada no devolvió documentación técnica relevante del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,61 GB para los pesos en bf16 y ~1,22 GB en fp32. Con caché KV a 2.048 tokens (16 capas, 12 cabezas KV, `head_dim=64`) se añaden aproximadamente 0,1 GB, de modo que la inferencia cabe holgadamente en menos de 2 GB en bf16.
- Entrenamiento: la ejecución de referencia se realizó en GPUs H200 según `run.json`; el modelo completo con AdamW (pesos + dos momentos en fp32) requiere del orden de 3,7 GB de estado del optimizador más activaciones, por lo que es viable en una única GPU de 24 GB con bf16 y checkpointing de activaciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) para inferencia; A100/H100 innecesarias salvo para replicar el entrenamiento a gran throughput.
- Cabe en GPU de consumo: sí, en todas las GPU con 4 GB o más de VRAM, incluso en fp32.
- Opciones de despliegue: `transformers` de forma nativa (librería declarada); vLLM y TGI son compatibles a nivel de arquitectura OLMo2 pero no hay configuraciones publicadas; llama.cpp/Ollama requieren convertir los safetensors bf16 a GGUF, ya que el repositorio no incluye archivos GGUF.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 305M en bf16 sobre una RTX 4090 admite lotes grandes con latencias por token en el rango de pocos milisegundos, pero no se ha publicado ninguna medición de esta ejecución concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos / receta | Licencia | Orientación |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed4 (este) | ~305M | 2.048 | Dolma v1.7, 2B tokens, CE puro, seed 4 | Apache 2.0 | Investigación de trayectorias |
| diet-traj-pythia-410m-* (colección hermana) | ~410M | 2.048 (Pythia) | Pile, receta equivalente | Apache 2.0 | Investigación de trayectorias |
| OLMo-1B (AllenAI) | ~1.176M... 1,2B | 2.048 | Dolma, ~3T tokens | Apache 2.0 | Modelo base abierto completo |
| SmolLM2-360M (HuggingFace) | ~360M | 8.192 | Corpus propio, varias etapas | Apache 2.0 | Modelo base pequeño |
| Qwen2.5-0.5B (Alibaba) | ~494M | 32.768 | Corpus propio multilingüe | Apache 2.0 | Modelo base multilingüe |

Nota: los datos de los modelos comparados provienen de sus fichas públicas y pueden variar según la revisión; el rendimiento relativo no puede establecerse porque este checkpoint no publica benchmarks. Frente a OLMo-1B, SmolLM2-360M o Qwen2.5-0.5B, la diferencia clave no es de calidad sino de propósito: este modelo no está pensado para uso final, sino para análisis controlado de dinámica de entrenamiento con checkpoints intermedios accesibles.

## Limitaciones y advertencias

- No es un modelo instructivo: no sigue instrucciones, no mantiene formato de chat y no dispone de plantilla de conversación; usarlo como asistente produce salidas de baja calidad.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación. Al entrenarse sobre Dolma (corpus web sin filtrar del todo), es esperable que reproduzca sesgos presentes en los datos y que genere contenido factualmente incorrecto con fluidez.
- Capacidad multilingüe muy limitada: solo se declara inglés, y el corpus está dominado por texto en inglés; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Contexto corto (2.048 tokens) para los estándares actuales; no admite tareas de documento largo sin truncado o estrategias externas.
- Presupuesto de entrenamiento reducido (2.000 millones de tokens), muy por debajo de lo que se considera compute-optimal para 305M de parámetros; la perplejidad será alta en comparación con modelos base del mismo tamaño entrenados con billones de tokens.
- Licencia Apache 2.0 permite uso comercial y modificación, pero el modelo es un artefacto de investigación sin garantías de calidad; conviene no desplegarlo en producción orientada a usuario final.
- Los checkpoints intermedios se almacenan solo como pesos (sin estado del optimizador), lo que impide reanudar el entrenamiento exactamente desde una rama `stepN`.
- Inconsistencia menor en la model card: describe los datos como consumidos en streaming, mientras que `run.json` indica caché empaquetada; conviene verificar la configuración antes de replicar el experimento.
- La búsqueda web realizada no devolvió documentación técnica del proyecto; los resultados obtenidos eran irrelevantes y no se han utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed4
- Repositorio del proyecto DIET (referenciado en la model card): https://github.com/jjalora/diet-lm
- Colección hermana en HuggingFace (referenciada): https://huggingface.co/jjalora/diet-traj-pythia-410m-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Proyecto Dolma (AllenAI): no disponible en los resultados de búsqueda proporcionados
- Paper o blog del proyecto DIET: no disponible
- Demo o espacio interactivo: no disponible
