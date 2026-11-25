# xTimeCrystal/nanochat-moe-sweep

## Resumen

`nanochat-moe-sweep` es una colección de 143 modelos de lenguaje base entrenados por el usuario independiente xTimeCrystal mediante un fork de [nanochat](https://github.com/karpathy/nanochat), el proyecto educativo de Andrej Karpathy. No se trata de un modelo único, sino de un barrido sistemático de configuraciones de mezcla de expertos (MoE) sobre un mismo corpus, ClimbMix, con el objetivo de estudiar cómo distintas distribuciones de expertos, anchuras compartidas y top-k afectan a la pérdida de validación y a la métrica CORE.

Cada ejecución del barrido corresponde a una arquitectura concreta: profundidad de 4, 6, 8, 10, 12, 14 o 16 capas, anchura base D variable, un número de expertos enrutados entre 8 y 256, top-k entre 2 y 32, y una anchura de experto compartido que puede ser nula, D, 2D o 3D. Los modelos usan atención de contexto completo, flujo residual AttnRes, expertos con activación relu², enrutamiento dropless top-k con Quantile Balancing y entrenamiento con Muon + AdamW. Son modelos de investigación, no ajustados por instrucciones ni alineados.

La relevancia es doble: por un lado, ofrece un conjunto reproducible de puntos de comparación para quien investigue arquitecturas MoE a pequeña escala; por otro, el tamaño del repositorio (99 GB) y la inclusión del código de entrenamiento exacto lo convierten en material útil para estudiar decisiones de diseño (ancho compartido, granularidad de expertos, coste computacional) con datos empíricos medidos sobre el mismo dataset y semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (expertos relu²), flujo residual AttnRes, atención de contexto completo |
| Parametros totales | No disponible de forma agregada; varía por ejecución (profundidad 4-16, anchura D variable, hasta 256 expertos) |
| Parametros activos | No disponible; top-k entre 2 y 32 expertos enrutados por token según la ejecución |
| Longitud de contexto | No disponible explícitamente (ventana de atención completa, patrón `L`); depende de la configuración de `base_train` |
| Tipos de cuantizacion | No disponible (checkpoints en estado PyTorch, sin versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | No disponible (entrenado sobre ClimbMix, sin evaluación multilingüe publicada) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.pt`, state dict) con `meta_<step>.json` de configuración; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

Los modelos son transformers decoder-only con capas MoE que sustituyen el MLP denso por un conjunto de expertos enrutados más, opcionalmente, un experto compartido de anchura D, 2D o 3D. El enrutamiento es dropless top-k (cada token se envía a sus k expertos principales, sin descartar tokens) con Quantile Balancing para equilibrar la carga entre expertos. Los expertos usan activación relu², el flujo residual es AttnRes, no hay value embeddings y la atención es de contexto completo (patrón de ventana `L`). La nomenclatura de cada ejecución codifica la profundidad (`d`), la anchura del experto compartido (`s0`, `sD`, `s2D`, `s3D`), el número de expertos y top-k (`e<E>k<k>`) y la anchura de experto (`wD<g>`); el sufijo `_c<F>` indica entrenamiento hasta un presupuesto de FLOPs distinto del predeterminado y `_seed1` una segunda semilla de inicialización.

El entrenamiento usa Muon + AdamW, con tamaño de lote autodimensionado por `base_train` (262.144 tokens en d4, 524.288 en d10 y superiores). Por defecto se entrenan 12 tokens por parámetro de escalado, semilla 42, y cada ejecución se distribuyó en 4 GPU RTX 5090 con DDP. El corpus es ClimbMix (`karpathy/climbmix-400b-shuffle`). Se validó cada 250 pasos y se calculó CORE (máximo 500 ejemplos por tarea) en el último paso. El estado del optimizador no se incluye en los checkpoints. El código de entrenamiento corresponde al commit `7077788` de nanochat-dl (fork de nanochat con un switch de value embeddings y otro de semilla vía `NANOCHAT_SEED`), con torch fijado a la versión 2.15 del nodo.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base; no hay ajuste por instrucciones ni formato de chat.
- Razonamiento y conocimiento general emergente a pequeña escala, medido mediante CORE (tareas de conocimiento y razonamiento) en el último paso de cada ejecución.
- Modelado de lenguaje puro: la métrica principal del barrido es bits por byte (bpb) sobre el split de validación de `base_train` (41,9M tokens).
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües no documentadas ni evaluadas.
- Sin modo thinking, visión ni audio.
- El valor del artefacto es comparativo: 143 configuraciones MoE bajo el mismo corpus, tokenizador y semilla permiten aislar el efecto de la topología de expertos.

## Casos de uso

- Investigación en arquitecturas MoE: comparar empíricamente cómo varían val bpb y CORE al cambiar el número de expertos, el top-k, la anchura compartida y la granularidad del experto, usando los 143 puntos del barrido como referencia reproducible.
- Estudio de eficiencia computacional: los sufijos `_c<F>` (por ejemplo `d4_s2D_e64k8_wD4_c1.78e17` con 7.165 pasos y 17,70 minutos, frente a `_c5.48e16` con 2.206 pasos y 5,41 minutos) permiten analizar la relación entre presupuesto de FLOPs, pasos y calidad final.
- Reproducibilidad y docencia: el directorio `code/` contiene el código exacto de entrenamiento y los scripts de lanzamiento (`run_sweep.sh`, colas), lo que facilita replicar el pipeline en clústeres pequeños con DDP sobre 4 GPU.
- Análisis de estabilidad de inicialización: las ejecuciones `_seed1` (por ejemplo `d4_s2D_e32k4_wD2_seed1` con val bpb 1,1206 frente a 1,1189 de la semilla 42) permiten medir la varianza entre semillas de una misma configuración.
- Punto de partida para fine-tuning: al ser checkpoints base con licencia MIT, pueden servir como inicialización para tareas downstream de investigación, aceptando que su escala es reducida.
- Estudio de enrutamiento y balanceo de carga: el uso de Quantile Balancing con enrutamiento dropless top-k y hasta 256 expertos permite analizar el comportamiento del enrutador en regímenes de alta granularidad sin pérdida de tokens.

## Benchmarks y rendimiento

Los datos publicados son val bpb (menor es mejor) y CORE (mayor es mejor) en el último paso. Se muestran ejecuciones representativas por profundidad; el barrido completo consta de 143 configuraciones.

| Run | Profundidad | D | Expertos | Top-k | Pasos | Val bpb | CORE | Tiempo |
|---|---|---|---|---|---|---|---|---|
| `d4_dense` | 4 | 256 | 0 | 0 | 528 | 1,1520 | 0,0481 | 1,08 min |
| `d4_s2D_e64k8_wD4_c1.78e17` | 4 | 256 | 64 | 8 | 7.165 | 1,0047 | 0,0789 | 17,70 min |
| `d4_s2D_e64k8_wD4_c5.48e16` | 4 | 256 | 64 | 8 | 2.206 | 1,0355 | 0,0443 | 5,41 min |
| `d4_s2D_e128k4_wD2` | 4 | 256 | 128 | 4 | 528 | 1,1031 | 0,0436 | 1,32 min |
| `d4_s0_e18k4_wD` | 4 | 256 | 18 | 4 | 528 | 1,1209 | 0,0296 | 1,22 min |
| `d6_dense` | 6 | 384 | 0 | 0 | 1.062 | 1,0313 | 0,0874 | 2,44 min |
| `d6_s2D_e128k4_wD2` | 6 | 384 | 128 | 4 | 1.062 | 0,9810 | 0,0851 | 3,99 min |
| `d6_s0_e36k8_wD2` | 6 | 384 | 36 | 8 | 1.062 | 0,9995 | 0,0718 | 3,05 min |
| `d6_s2D_e32k8_wD4` | 6 | 384 | 32 | 8 | 1.062 | 1,0117 | 0,0724 | 2,93 min |

Observaciones derivadas de los datos publicados: en d4, la mejor val bpb del barrido base (528 pasos) corresponde a `d4_s2D_e128k4_wD2` (1,1031), frente a 1,1520 del denso; ampliar el presupuesto a `_c1.78e17` baja la bpb hasta 1,0047. En d6, el denso obtiene 1,0313 y la mejor configuración MoE publicada, `d6_s2D_e128k4_wD2`, alcanza 0,9810. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entrenamiento original: 4 GPU RTX 5090 por ejecución con DDP; el runner `run_sweep.sh` ocupa la mitad de un nodo de 8 GPU.
- VRAM de inferencia: no disponible; depende de la configuración concreta (profundidad 4-16, anchura D y hasta 256 expertos). Los checkpoints son state dicts PyTorch sin cuantizar.
- GPU recomendadas: no disponibles. Por escala, las configuraciones d4 (D=256) son las más ligeras del barrido y las d14-d16 las más pesadas, pero no se publican mediciones de VRAM.
- Cabeza en GPU de consumo: no confirmado; el entrenamiento se hizo en RTX 5090, lo que sugiere que las configuraciones pequeñas podrían ejecutarse en GPU consumer, pero no hay datos de inferencia publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser checkpoints PyTorch con código propio, el despliegue requeriría cargar el state dict con el código de `code/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `nanochat-moe-sweep` (este) | Variable por ejecución (D 256-384+, hasta 256 expertos) | No disponible | MIT | Hugging Face, 99 GB, 0 descargas | Barrido de 143 configuraciones MoE sobre ClimbMix |
| nanochat (Karpathy) | Configuraciones densas de referencia | No disponible | MIT | GitHub y Hugging Face | Proyecto base del que deriva este fork; sin barrido MoE |
| Modelos MoE de escala media (p. ej. familias tipo Mixtral u OLMoE) | Órdenes de magnitud superiores | Decenas de miles de tokens | Variable | Hugging Face | No comparables directamente por escala y presupuesto de entrenamiento |

No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa directa con alternativas; la comparación relevante es interna al propio barrido (denso frente a MoE y distintas topologías).

## Limitaciones y advertencias

- Modelos base sin ajuste por instrucciones ni alineación: no deben usarse directamente como asistentes conversacionales.
- Escala reducida (profundidades 4-16, anchura D de 256-384 en las ejecuciones publicadas): conocimiento factual y razonamiento limitados; alta probabilidad de alucinación en preguntas abiertas.
- Sin evaluación de sesgos publicada; el corpus ClimbMix puede arrastrar sesgos de su composición, no documentada en la información disponible.
- Idiomas soportados no documentados; no hay garantía de calidad fuera de la distribución de ClimbMix.
- Ventana de contexto no especificada explícitamente; la atención es de contexto completo pero el límite práctico depende de `base_train`.
- El estado del optimizador no se incluye, por lo que reanudar el entrenamiento exacto no es posible sin reinicializarlo.
- El repositorio ocupa 99 GB y contiene 143 checkpoints; el almacenamiento y la gestión de versiones son un coste relevante.
- Licencia MIT: permite uso comercial y modificación, pero al ser modelos de investigación sin garantías, su uso en producción requeriría validación propia.
- Sin pipeline declarado ni descargas ni likes en el momento de la consulta: ecosistema de soporte mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xTimeCrystal/nanochat-moe-sweep
- Repositorio base nanochat: https://github.com/karpathy/nanochat
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
