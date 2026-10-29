# stanfordasl/diet-traj-olmo2-medium-dolma-seed7

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-seed7` es un checkpoint de preentrenamiento desde cero con arquitectura OLMo2, de aproximadamente 305 millones de parámetros, publicado por la cuenta de HuggingFace `stanfordasl` dentro del proyecto de investigación DIET (weight-space). No es un modelo instructivo ni un producto final: es una de las trayectorias de entrenamiento de una colección cuyo único elemento diferenciador entre ejecuciones es la semilla aleatoria, lo que permite estudiar la evolución de los pesos y la dinámica de entrenamiento paso a paso.

El modelo usa la pila OLMo2 en configuración densa (`hidden_size=768`, `intermediate_size=3072`, 16 capas, 12 cabezas de atención y 12 cabezas KV), con una longitud máxima de posición de 2048 tokens. Se entrenó sobre `emozilla/dolma-v1_7-3B`, un espejo en HuggingFace del corpus Dolma v1.7 muestreado proporcionalmente entre sus componentes, con un presupuesto de 2 000 millones de tokens y 30 517 pasos de optimización sobre GPU H200.

Su relevancia es metodológica, no de rendimiento: se trata de un artefacto para investigación en espacio de pesos, análisis de trayectorias de entrenamiento, estudios de reproducibilidad y comparación entre semillas. Al ser un modelo base de 305M, también sirve como banco de pruebas de bajo coste para experimentos de ajuste fino y despliegue en hardware modesto. La model card no publica ningún resultado de evaluación de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo2 densa (transformer decoder-only), config `olmo2_medium_dense.yaml` |
| Parámetros totales | ~305M |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantización | pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ en la información disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), solo pesos; checkpoints en ramas `stepN`, pesos finales en `main` |

Detalles de configuración: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` (atención multi-cabeza sin GQA).

## Arquitectura y entrenamiento

Transformer decoder-only denso de la familia OLMo2, con 16 capas, dimensión oculta 768 y FFN de 3072, atención con 12 cabezas de consulta y 12 de clave/valor (sin agrupación), y ventana posicional de 2048 tokens. No hay mezcla de expertos ni componentes de estado recurrente: es una pila transformer convencional en la línea de los modelos pequeños tipo Pythia o SmolLM.

El entrenamiento es preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`), es decir, sin destilación ni profesor. Se usó AdamW con `lr=3e-5`, betas `(0.9, 0.95)`, weight decay `0.1`, schedule coseno y precisión bf16. Los datos proceden de `emozilla/dolma-v1_7-3B`, leído en streaming (no preempaquetado, según la model card), con un presupuesto de 2 000 000 000 tokens repartidos en 30 517 pasos. La ejecución se realizó en una GPU H200 (clúster `fran`, job `659709`, inicio 2026-10-28 16:38:54, commit `b93d499`), guardando checkpoint cada 950 pasos. La innovación del artefacto no está en la arquitectura sino en el diseño experimental: múltiples ejecuciones idénticas salvo por la semilla (esta es la semilla 7), lo que habilita análisis de trayectorias en el espacio de pesos.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje causal en inglés; es un modelo base, sin ajuste instructivo ni plantilla de chat.
- Razonamiento y conocimiento factual limitados por su escala (~305M) y por un presupuesto de 2e9 tokens, muy por debajo de los regímenes Chinchilla habituales para modelos de producción.
- Análisis de trayectorias de entrenamiento: los checkpoints intermedios (`stepN`) permiten estudiar la evolución de los pesos, la pérdida y las representaciones a lo largo del preentrenamiento.
- Investigación en espacio de pesos: comparable con la colección `jjalora/diet-traj-pythia-410m-*` citada por el autor, lo que facilita estudios cruzados de arquitectura.
- Reproducibilidad controlada: al variar únicamente la semilla, sirve como réplica para cuantificar varianza entre ejecuciones.
- Compatibilidad con `transformers` y con el tag `endpoints_compatible` del repositorio.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito; no se documentan en la información disponible.
- Multilingüismo: no disponible; el modelo está etiquetado únicamente como inglés.

## Casos de uso

- **Investigación en dinámica de entrenamiento**: cargar los checkpoints de las ramas `stepN` (cada 950 pasos) para medir la evolución de la pérdida, la norma de los pesos o la geometría de las representaciones a lo largo de los 30 517 pasos, y comparar la curva con la de otras semillas de la misma colección.
- **Estudios de varianza entre semillas**: al ser una ejecución con semilla 7 de una receta fija, se usa junto al resto de la colección para cuantificar cuánta variación en métricas finales proviene exclusivamente de la inicialización y del orden de los datos.
- **Análisis de espacio de pesos (weight-space)**: interpolación lineal o model soups entre checkpoints de la misma trayectoria o entre semillas distintas, aprovechando que todos comparten arquitectura y tokenizador, para estudiar la linealidad del modo de conectividad.
- **Banco de pruebas de ajuste fino de bajo coste**: con ~305M parámetros, cabe en una sola GPU consumer, por lo que sirve para validar recetas de SFT, LoRA o DPO antes de escalarlas a modelos de 7B o superiores.
- **Réplica educativa de un pipeline de preentrenamiento**: el repositorio `jjalora/diet-lm` y el `run.json` documentan configuración, datos, hardware y semilla, lo que permite reproducir el flujo completo como material docente o de verificación.
- **Ablaciones de datos sobre Dolma**: al usar el espejo `dolma-v1_7-3B` con muestreo proporcional, sirve como línea base para medir el efecto de cambiar la mezcla de componentes del corpus en un modelo pequeño.
- **Despliegue de referencia para pruebas de infraestructura**: útil para validar pipelines de servicio (tokenizador, carga en `transformers`, endpoints) con un modelo ligero antes de mover tráfico a modelos grandes.
- **Generación de texto en inglés para prototipos internos**: adecuado para demos y pruebas de integración donde la calidad lingüística no es el criterio, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de perplejidad sobre conjuntos de validación, y la información de búsqueda web proporcionada no contiene datos del modelo.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| HellaSwag | no disponible |
| Perplejidad (validación) | no disponible |

## Requisitos de hardware

- **VRAM estimada para inferencia** (calculada a partir de los ~305M parámetros, no publicada por el autor): ~0,61 GB solo para pesos en bf16; ~1,2 GB en fp32; en torno a 0,3-0,4 GB con cuantización de 8 bits y 0,2-0,3 GB en 4 bits, a lo que hay que sumar KV cache y activaciones (con 2048 tokens de contexto, el total se mantiene holgadamente por debajo de 2 GB en bf16).
- **GPU recomendadas**: cualquier GPU moderna funciona; para entrenamiento o ajuste fino se usó una H200 en la ejecución original. Para inferencia, A100/H100 son innecesarias y sobredimensionadas; una RTX 4090, RTX 3090, L4 o incluso una GPU integrada con suficiente memoria compartida son suficientes.
- **Cabe en GPU consumer**: sí, en cualquier tarjeta con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores. También es viable en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: `transformers` (librería declarada), `vLLM` y TGI para servicio con concurrencia, `llama.cpp`/`Ollama` si se genera una conversión a GGUF (no se distribuye en el repositorio), y `endpoints_compatible` según el etiquetado de HuggingFace.
- **Latencia y throughput**: no disponible. No hay mediciones publicadas; por escala, cabe esperar latencias muy bajas en GPU consumer, pero no se aportan cifras concretas en la información disponible.
- **Nota sobre pesos**: el repositorio contiene únicamente pesos (sin optimizer states), en bf16 safetensors, y los checkpoints intermedios están en ramas `stepN`, lo que permite descargar solo el paso necesario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Observaciones |
|---|---|---|---|---|---|
| `stanfordasl/diet-traj-olmo2-medium-dolma-seed7` | ~305M | 2048 | Dolma v1.7 (2e9 tokens) | Apache 2.0 | Artefacto de investigación, sin benchmarks publicados |
| `jjalora/diet-traj-pythia-410m-*` | ~410M | no disponible en la información | no disponible en la información | no disponible en la información | Colección predecesora citada por el autor; misma finalidad de análisis de trayectorias |
| Resto de la colección DIET OLMo2 (otras semillas) | ~305M | 2048 | Dolma v1.7 (2e9 tokens) | Apache 2.0 | Idénticas salvo la semilla; comparación directa de varianza |
| Otros modelos pequeños tipo Pythia-410M o SmolLM2-360M | ~360-410M | 2048 | no disponible en la información | Apache 2.0 (habitual en la familia) | No hay datos de rendimiento comparado en la información proporcionada |

No se dispone de comparaciones de rendimiento con alternativas: el autor no publica métricas y la búsqueda web no aportó resultados relevantes sobre el modelo.

## Limitaciones y advertencias

- **Modelo base, no instructivo**: no sigue instrucciones ni mantiene formato de chat; requiere ajuste fino o prompts de completado para tareas concretas.
- **Riesgo elevado de alucinación**: con 305M parámetros y 2e9 tokens de entrenamiento, la capacidad de recuperación factual es muy limitada y la generación puede ser incoherente en textos largos.
- **Sesgos**: no se documenta ningún análisis de sesgo, filtrado o evaluación de toxicidad; al entrenar sobre Dolma, hereda los sesgos y la distribución del corpus original.
- **Idioma**: solo inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- **Contexto corto**: 2048 tokens, insuficiente para tareas de documento largo, RAG con muchos pasajes o conversaciones extensas.
- **Ausencia de benchmarks**: no hay ninguna métrica publicada que permita estimar su calidad; no debe adoptarse en producción sobre la base de expectativas no verificadas.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del corpus Dolma v1.7 y del espejo `emozilla/dolma-v1_7-3B` para el uso de los datos subyacentes.
- **Discrepancia menor en la documentación**: la model card indica lectura en streaming ("not pre-packed"), mientras que el campo `data` de `run.json` menciona "packed cache"; conviene verificarlo si se pretende reproducir el pipeline.
- **Artefacto de investigación**: descargas y likes a cero, sin mantenimiento documentado; la finalidad es el análisis de trayectorias, no el servicio a usuarios finales.
- **Sin garantías de reproducibilidad exacta**: el código apunta al commit `b93d499` del repositorio `jjalora/diet-lm`, pero no se especifican versiones de librerías ni detalles del entorno más allá del hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed7
- Repositorio de código citado en la model card: `jjalora/diet-lm` (archivos `configs/model/olmo2_medium_dense.yaml` y `src/run_distillation.py`)
- Colección predecesora citada: `jjalora/diet-traj-pythia-410m-*` en HuggingFace
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Paper, blog o demo del modelo: no disponible en la información proporcionada
