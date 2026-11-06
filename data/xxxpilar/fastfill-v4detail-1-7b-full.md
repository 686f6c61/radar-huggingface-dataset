# XXXpilar/fastfill-v4detail-1.7b-full

## Resumen

FastFill v4detail 1.7B es un ajuste fino completo (full fine-tuning) del modelo Qwen3-1.7B de Alibaba, publicado por el usuario XXXpilar. No se trata de un modelo de lenguaje de propósito general, sino de un componente especializado dentro del flujo de trabajo "FastFill workflow 2": un modelo de estimación de tamaños de mobiliario para tareas de generación automática de distribución (layout) de interiores. El modelo recibe la descripción de una habitación con objetos detalladamente descritos y devuelve un tamaño por objeto; la colocación espacial la resuelve el propio workflow.

El entrenamiento se realizó sobre el conjunto de datos v4detail, compuesto por SAGE-10k, IL3D_3dfront e IL3D_synthetic, es decir, habitaciones cuyos objetos cuentan con descripciones detalladas. Se ejecutaron 5 épocas y el checkpoint seleccionado en validación es `model-step-4500`, con una puntuación de selección de 2.830 según la model card. El repositorio ocupa 6,9 GB e incluye el backbone en fp32, una cabeza de geometría (`geometry_model.pt`), el tokenizador y el manifiesto de la ejecución.

Su relevancia es acotada y muy específica: sirve como pieza de un pipeline de investigación sobre layout automático, no como modelo conversacional. La información pública disponible es escasa (sin licencia declarada, sin idiomas declarados, sin benchmarks publicados y con cero descargas en el momento de la consulta), por lo que debe evaluarse como artefacto de investigación reproducible más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) con cabeza de geometría adicional para estimación de tamaños |
| Parametros totales | 1.700 millones (1,7B, según el modelo base Qwen3-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del backbone en fp32; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`backbone/model.safetensors`, fp32) y PyTorch (`geometry_model.pt`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros, y le añade una cabeza de geometría específica para la tarea (`geometry_model.pt`) que produce un tamaño por objeto. El ajuste es completo (full fine-tuning), no LoRA ni adaptadores, y se ejecutó durante 5 épocas sobre el dataset v4detail, formado por SAGE-10k, IL3D_3dfront e IL3D_synthetic con descripciones detalladas de los objetos de cada habitación.

El checkpoint publicado corresponde al paso 4500, elegido por validación con una puntuación de selección de 2.830. El repositorio incluye además el tokenizador (que el código lee junto al checkpoint) y un `run_manifest.json` con los ajustes de la ejecución de entrenamiento. No se documentan en la información disponible detalles sobre composición exacta del dataset, número de tokens de entrenamiento, uso de RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- Estimación de tamaños de mobiliario: genera un tamaño por cada objeto descrito en una habitación.
- Procesamiento de descripciones detalladas de objetos dentro de un contexto de layout de interiores.
- Integración con el workflow FastFill 2, que se encarga de la colocación espacial de los objetos a partir de los tamaños generados.
- Ejecución mediante script de inferencia (`experiments/run_draft.py`) con soporte de GPU (`--device cuda`).
- No se documentan capacidades de tool calling, agentes, visión, audio, modo thinking ni multilingüismo.

## Casos de uso

- Investigación en generación automática de layouts de interiores: el modelo aporta los tamaños de los objetos y el workflow los coloca; es su uso previsto y el único documentado.
- Reproducción de experimentos: los conjuntos test150detail, test30tasks y test150tasks permiten replicar los resultados de los experimentos de 2026-11 del autor.
- Evaluación de ajuste fino completo sobre Qwen3-1.7B: sirve como referencia para estudiar cómo rinde un full fine-tuning de un modelo pequeño en una tarea estructurada de regresión geométrica.
- Prototipado de asistentes de diseño de interiores: puede alimentar una etapa previa de estimación de dimensiones antes de un motor de colocación.
- Generación de datos sintéticos de mobiliario con tamaños plausibles para entrenar otros modelos de layout.
- Base para experimentos de destilación o comparación con modelos mayores en la misma tarea de estimación de tamaños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la puntuación de selección en validación del checkpoint `model-step-4500` (2.830), sin escala ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,7B parámetros en fp32 el backbone ronda los 6,8 GB de pesos, por lo que se necesita holgura adicional para activaciones y la cabeza de geometría.
- GPU recomendadas: se recomienda GPU según la model card; una RTX 4090 (24 GB) o una A100/H100 son opciones seguras para fp32, aunque no se documentan requisitos mínimos.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 8-12 GB o más si se reduce la precisión, aunque no se documentan cuantizaciones ni configuraciones probadas.
- Opciones de despliegue: el modelo se ejecuta mediante el script del repositorio fastfill-workflow2 (`experiments/run_draft.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastFill v4detail 1.7B | 1,7B | No disponible | Estimación de tamaños de mobiliario | No disponible | Hugging Face (0 descargas) |
| Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | Lenguaje general | No disponible en esta ficha | Hugging Face (Qwen) |
| Alternativas especializadas en layout | No disponible | No disponible | Layout de interiores | No disponible | No disponible |

No se dispone de información suficiente para comparar con modelos especializados equivalentes en estimación de tamaños de mobiliario.

## Limitaciones y advertencias

- Modelo altamente especializado: solo genera tamaños de objetos; no es un modelo conversacional ni de propósito general.
- Sin licencia declarada: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- Sin idiomas declarados: se desconoce si el modelo funciona correctamente fuera del inglés de los datasets de entrenamiento.
- Sin benchmarks públicos ni métricas comparables: la única métrica es una puntuación de selección interna sin escala documentada.
- Riesgo de alucinación en tamaños: al ser una tarea de regresión sobre descripciones, puede producir dimensiones implausibles para objetos poco representados en el dataset.
- Dependencia del workflow: el modelo requiere el código de fastfill-workflow2 y su tokenizador; no es autónomo.
- Cero descargas y nula tracción comunitaria: no hay validación externa ni informes de terceros.
- Pesos en fp32: mayor consumo de memoria y menor velocidad que alternativas cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XXXpilar/fastfill-v4detail-1.7b-full
- Repositorio del workflow: https://github.com/XXXPILAR/fastfill-workflow2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
