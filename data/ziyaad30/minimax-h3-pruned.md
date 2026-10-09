# Ziyaad30/MiniMax-H3-Pruned

## Resumen

MiniMax-H3-Pruned es una variante podada y refactorizada numéricamente de MiniMax-H3, el modelo de difusión multimodal de generación conjunta de vídeo y audio de MiniMax. No lo publica el equipo original, sino el usuario Ziyaad30, y se distribuye en formato diffusers con dos particiones DiT (`transformer/` y `transformer_ref/`) y un acondicionador de texto truncado. El modelo base tiene 33,14 B de parámetros por partición DiT; esta versión baja a 20,11 B por partición, lo que reduce cada partición de 66,28 GB a 40,24 GB (52 GB menos entre las dos) y recorta el `text_encoder/` de 66,71 GB a 52,48 GB.

La poda no elimina capas de atención ni expertos: elimina el rango redundante de las proyecciones AdaLN. Cada uno de los 50 bloques del DiT contiene un `adaln_proj.linear` con forma `Linear(2688 → 96768)`, más un `norm_out.linear` adicional: en total 13,03 B de parámetros, el 39,3 % del checkpoint. Las 51 proyecciones leen el mismo vector de entrada, `silu(time_embedder(t))`, que depende únicamente del escalar de tiempo, de modo que su rango alcanzable es una curva unidimensional en R^2688. El autor pliega esas proyecciones sobre un subespacio afín de 8 dimensiones que cubre la curva con un error RMS relativo de 1,45e-5, unas 250 veces por debajo de un paso de redondeo en bfloat16, y sustituye el MLP de tiempo por una tabla de 1025 entradas interpoladas linealmente.

El resultado es relevante para quien despliegue H3: se comporta como un reemplazo directo (mismos VAE, planificadores, tokenizador y procesador, referenciados al repositorio original), admite todos los LoRA publicados para H3 y ocupa bastante menos almacenamiento. A cambio, la licencia sigue siendo la community license de MiniMax y no hay cuantizaciones publicadas: todo el peso se distribuye en bfloat16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) multimodal de vídeo y audio con proyecciones AdaLN plegadas sobre un subespacio afín de rango 8; acondicionador Qwen3-VL truncado (capas de decodificador 0-50); pipeline modular de diffusers |
| Parámetros totales | 20.111.462.920 (~20,11 B) según el índice safetensors del repositorio; el autor indica 20,11 B por partición DiT, frente a 33,14 B por partición del modelo publicado |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible; el repositorio no documenta ventana de contexto y la generación se define por resolución y número de fotogramas (el ejemplo del autor usa 960x544 y 124 fotogramas) |
| Tipos de cuantización | no disponible; los pesos se publican en bfloat16 y el autor anuncia una variante con acondicionador cuantizado como trabajo futuro |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `license: other`) |
| Formato de pesos | safetensors en formato diffusers (`transformer/`, `transformer_ref/`, `text_encoder/`) |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Tamaño del repositorio | 133,0 GB |
| Pipeline declarado | image-text-to-video |
| Fecha declarada de publicación | 2026-10-09 |

## Arquitectura y entrenamiento

El modelo es un DiT de difusión para vídeo con audio, con 50 bloques. La innovación de esta variante es puramente de compresión numérica, no de entrenamiento: no se ha reentrenado ni ajustado nada. Cada bloque incorpora `adaln_proj.linear`, una capa `Linear(2688 → 96768)`, y `norm_out.linear` añade una más, sumando 51 proyecciones y 13,03 B de parámetros (39,3 % del checkpoint). Todas ellas reciben el mismo vector `silu(time_embedder(t))`, función exclusiva del escalar de tiempo, por lo que el conjunto de valores que pueden tomar vive en una curva unidimensional dentro de R^2688. El autor ajusta un subespacio afín de 8 dimensiones que cubre esa curva con un error RMS relativo de 1,45e-5 y reescribe cada proyección `W @ x + b`, con `x = mean + c @ basis`, como `(W @ basis.T) @ c + (b + W @ mean)`. El MLP de tiempo se reemplaza por una tabla de 1025 coordenadas `c(t)` con interpolación lineal, y cada proyección AdaLN pasa a aceptar una entrada de anchura 8 en lugar de 2688.

El acondicionador también se trunca. H3 condiciona sobre el estado oculto sin normalizar tras la capa 50 del decodificador del acondicionador Qwen3-VL (`hidden_states[50]`), de modo que las capas 51-63 y la cabeza de lenguaje no pueden influir en el condicionamiento y se eliminan. El `text_encoder/` incluye las capas 0-50 y mantiene bfloat16; sus embeddings son bit a bit idénticos a los del acondicionador publicado, tanto en presentaciones sólo texto como con visión. Los dos VAE, los dos planificadores, el tokenizador y el procesador no se duplican: `modular_model_index.json` los apunta a MiniMaxAI/MiniMax-H3. La compatibilidad con LoRA es explícita: los LoRA entrenados sobre el modelo podado cargan de forma nativa y los entrenados sobre el publicado se proyectan.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video).
- Generación conjunta de vídeo y audio a partir de texto (text-to-audio-video) e imagen (image-to-audio-video).
- Generación con referencia (reference-to-audio-video), pensada para mantener identidad o estilo a partir de material de referencia.
- Condicionamiento combinado de imagen y texto (image-text-to-video), con codificación visual y textual mediante el acondicionador Qwen3-VL truncado.
- Carga de LoRA: los entrenados sobre esta variante cargan de forma nativa; los entrenados sobre el modelo publicado se proyectan al subespacio plegado.
- Salidas con audio sincronizado en la misma pasada, con latentes de audio y de vídeo separados.
- Compatibilidad con backends de atención FlashAttention-3 y nativo (el autor usa ambos como control experimental).
- Tool calling, function calling y uso como agente: no documentado; el modelo es un pipeline de difusión, no un modelo de lenguaje con interfaz de herramientas.
- Capacidades multilingües: no disponibles (los idiomas no están documentados en la información proporcionada).

## Casos de uso

- Publicidad y prototipado audiovisual: generar clips de 124 fotogramas a 960x544 con audio en 10 pasos de muestreo, tal como documenta el autor, para validar una idea creativa antes de producir con herramientas convencionales.
- Animación de imágenes fijas: usar image-to-audio-video o image-to-video para convertir fotografías de producto o ilustraciones en clips con movimiento y banda sonora, sin entrenamiento adicional.
- Series cortas con personaje consistente: emplear la ruta reference-to-audio-video para conservar rasgos de identidad entre planos y evitar el coste de un fine-tuning completo.
- Base para fine-tuning con LoRA en dominio propio: al cargar los LoRA publicados de H3, se puede reutilizar o adaptar trabajo previo sobre el modelo original sin partir de cero.
- Sustitución directa en pipelines diffusers existentes: los VAE, planificadores, tokenizador y procesador se resuelven contra MiniMaxAI/MiniMax-H3, de modo que un `ModularPipeline` ya escrito puede apuntar a esta variante y ahorrar 52 GB de almacenamiento por réplica.
- Reducción de coste en despliegues multirréplica: con particiones DiT de 40,24 GB en lugar de 66,28 GB, el mismo presupuesto de disco y de transferencia de red permite almacenar o servir más versiones del modelo en un clúster de GPU.
- Etiquetado y previsualización de catálogos: generar variantes de vídeo con audio para pruebas A/B de creatividades, donde el cuello de botella es el coste por inferencia y no la calidad final.
- Investigación en compresión de modelos de difusión: la metodología de plegado de proyecciones AdaLN dependientes de un escalar es replicable en otros DiT con AdaLN, y el repositorio documenta el protocolo de medida de fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a un modelo de difusión. El autor sí publica medidas de fidelidad numérica y de divergencia extremo a extremo.

Fidelidad de las 51 proyecciones AdaLN, evaluadas sobre 200 pasos de tiempo fuera de rejilla y comparadas con una evaluación exacta en float64:

| Métrica | `transformer` | `transformer_ref` |
|---|---|---|
| Residuo del subespacio de rango 8 (sin redondeo de almacenamiento) | 1,51e-5 | 1,29e-5 |
| Podado frente a float64 exacto, peor de 51 módulos | 1,715e-3 | 1,715e-3 |
| Publicado frente a float64 exacto, peor de 51 módulos | 1,751e-3 | 1,758e-3 |
| Módulos en los que el podado está más cerca del exacto | 51/51 | 51/51 |
| Podado frente a publicado, peor de 51 módulos | 1,35e-3 | 1,41e-3 |

Latentes de vídeo, misma semilla, t2va, 10 pasos, 960x544, 124 fotogramas, seed 42:

| Comparación | Coseno | L2 relativa | Máx. abs. |
|---|---|---|---|
| Publicado (FA3) frente a publicado (nativo), mismo peso (control) | 0,99248 | 0,1227 | 7,66 |
| Publicado (FA3) frente a podado (FA3) | 0,99128 | 0,1321 | 8,59 |
| Publicado (nativo) frente a podado (FA3) | 0,99274 | 0,1205 | 7,71 |

Latentes de audio, mismo ajuste experimental:

| Comparación | Coseno | L2 relativa | Máx. abs. |
|---|---|---|---|
| Publicado (FA3) frente a publicado (nativo), mismo peso (control) | 0,99964 | 0,0292 | 0,255 |
| Publicado (FA3) frente a podado (FA3) | 0,99911 | 0,0437 | 0,358 |
| Publicado (nativo) frente a podado (FA3) | 0,99972 | 0,0236 | 0,157 |

La desviación estándar de los latentes de vídeo es 2,146331 en el modelo publicado y 2,146338 en el podado.

## Requisitos de hardware

- Tamaño en disco del repositorio completo: 133,0 GB.
- Pesos de cada partición DiT en bfloat16: 40,24 GB (`transformer/`) y 40,24 GB (`transformer_ref/`).
- Acondicionador de texto truncado: 52,48 GB en bfloat16.
- Estimación derivada de los tamaños de fichero: cargar simultáneamente las dos particiones DiT y el acondicionador en bfloat16 supera los 130 GB de pesos, por encima de la VRAM de una GPU única de 80 GB (H100, A100 80 GB); se requiere reparto multi-GPU u offloading a CPU.
- Una sola partición DiT más el acondicionador ronda los 92 GB en bf16 si se mantienen ambos residentes en memoria de acelerador, de nuevo por encima de una GPU de 80 GB.
- GPU de consumo: no cabe en bfloat16 en una RTX 4090 (24 GB) ni en una RTX 5090. No hay cuantizaciones publicadas (GGUF, FP8 ni similares) que abran esa vía; una ejecución con offloading secuencial sería viable en teoría pero con una penalización de latencia no medida por el autor.
- Opciones de despliegue: diffusers con `ModularPipeline` y `ComponentsManager`, resolviendo VAE, planificadores, tokenizador y procesador desde MiniMaxAI/MiniMax-H3. Backends de atención validados: FlashAttention-3 y nativo.
- vLLM, TGI, llama.cpp y Ollama no son aplicables: es un pipeline de difusión, no un modelo de lenguaje autorregresivo.
- Latencia y throughput: no disponibles. El autor documenta una configuración de 10 pasos a 960x544 con 124 fotogramas y una condicionamiento cacheado, pero no publica tiempos de ejecución ni consumo.

## Comparativa con modelos similares

| Modelo | Parámetros DiT por partición | Tamaño `transformer/` | Tamaño `text_encoder/` | Licencia | Formato |
|---|---|---|---|---|---|
| Ziyaad30/MiniMax-H3-Pruned | 20,11 B | 40,24 GB | 52,48 GB (truncado, capas 0-50) | minimax-h3-community-license-agreement | safetensors / diffusers |
| MiniMaxAI/MiniMax-H3 (publicado) | 33,14 B | 66,28 GB | 66,71 GB | minimax-h3-community-license-agreement | safetensors / diffusers |

Diferencias clave frente al modelo del que deriva: 39,3 % menos parámetros en la ruta AdaLN, 52 GB menos entre las dos particiones DiT, 14,23 GB menos en el acondicionador, compatibilidad con los LoRA publicados y comportamiento numérico prácticamente equivalente en bfloat16. Los componentes no duplicados (VAE, planificadores, tokenizador, procesador) son exactamente los mismos, porque se referencian al repositorio original.

No se dispone de datos verificables de otros modelos comparables de generación conjunta de vídeo y audio en la información proporcionada, por lo que no se incluyen en la comparativa.

## Limitaciones y advertencias

- No es bit a bit idéntico al modelo publicado. Es una refactorización de una función numérica: redondear los pesos plegados a bfloat16 produce bits distintos. El autor argumenta que la aproximación introducida queda unas 250 veces por debajo de un paso de redondeo de los pesos que sustituye, pero la equivalencia exacta no está garantizada.
- Dependencia obligatoria del repositorio base: sin MiniMaxAI/MiniMax-H3 no se pueden cargar los VAE, los planificadores, el tokenizador ni el procesador.
- Las trayectorias de difusión de 10 pasos amplifican cualquier perturbación de nivel bfloat16. La L2 relativa en latentes de vídeo frente al podado (0,1321) es del mismo orden que la del control con pesos idénticos y distinto kernel de atención (0,1227), pero sigue siendo una divergencia perceptible en el espacio latente.
- La fidelidad medida cubre únicamente la ruta AdaLN plegada (51 módulos en 200 pasos de tiempo). No hay verificación publicada de otras rutas del modelo.
- Sin benchmarks estándar ni evaluación humana de calidad de vídeo o de audio. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- El autor es un usuario particular (Ziyaad30), no el equipo de MiniMax. La variante no está respaldada oficialmente por el desarrollador del modelo base.
- Licencia `minimax-h3-community-license-agreement`: hay que revisar sus términos antes de cualquier uso comercial, ya que no es una licencia de código abierto permisiva.
- Sólo se distribuyen pesos en bfloat16. No hay cuantizaciones publicadas, lo que limita el despliegue en GPU de consumo y encarece la inferencia en la nube.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe más allá de lo que herede el acondicionador Qwen3-VL.
- Tamaño del repositorio elevado (133 GB), con implicaciones de ancho de banda y tiempo de descarga en despliegues automatizados.
- Riesgo de artefactos o inconsistencias temporales inherentes a la generación de vídeo: la información proporcionada no incluye una evaluación específica de sesgos, alucinación visual ni coherencia de audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ziyaad30/MiniMax-H3-Pruned
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
