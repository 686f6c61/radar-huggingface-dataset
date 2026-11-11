# tahamajs/llava-qwen-0.5b-upi-stuffed-mamba-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-upi-stuffed-mamba-scienceqa` es un checkpoint experimental de tipo *attention surgery* publicado por el usuario tahamajs dentro del ecosistema NeuralOps. Parte del modelo multimodal `llava-hf/llava-interleave-qwen-0.5b-hf` (torre visual SigLIP congelada, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con D=1024, H=16, head_dim=64) y sustituye selectivamente el mecanismo de atencion cuadratica en 18 de sus 24 capas por un bloque SSM selectivo de estilo Mamba, conservando 6 capas de atencion cuadratica como anclas. El resultado se evalua en el subconjunto con imagen de ScienceQA (validacion).

El interes del artefacto no es tanto su rendimiento absoluto como su naturaleza: es una pieza de investigacion reproducible sobre hibridacion atencion/SSM en modelos vision-lenguaje pequenos, con un delta de pesos de solo 116,24 MB (FP16 safetensors) frente a los 1,66 GB del modelo base, lo que supone una reduccion del 93,2 % en el artefacto serializado. El autor documenta explicitamente que el nombre original "UPI-Stuffed" se retiro porque ninguna de las características que sugeria (Uncertainty Penalty, Interpolation, Stuffing) estaba realmente implementada; el operador canonico pasa a llamarse `selective_mamba` (alias legacy `upi_mamba`).

Se trata, por tanto, de un modelo de nicho orientado a experimentacion y estudio de arquitecturas hibridas, no a despliegue en produccion. Requiere la libreria `neuralops` para cargar los pesos quirurgicos y no es un checkpoint autonomo en el sentido habitual de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: VLM LLaVA (SigLIP + MLP projector + Qwen2 decoder) con 18/24 capas de atencion sustituidas por SSM selectivo estilo Mamba (`selective_mamba`, familia `ssm`); 6 capas de atencion cuadratica como anclas en indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | no disponible (el modelo base LLaVA-Interleave-Qwen-0.5B ronda los 0,5B; el artefacto guardado contiene 246 tensores quirurgicos de 116,24 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, formato `attention_only_fp16`, delta quirurgico modular) |

## Arquitectura y entrenamiento

El modelo base es LLaVA-Interleave-Qwen-0.5B: torre visual SigLIP congelada de 27 capas, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con dimension oculta 1024, 16 cabezas y head_dim 64. Sobre esa base, NeuralOps aplica una "cirugia" que reemplaza el modulo `self_attn` en 18 de las 24 capas del decodificador por un bloque `SelectiveMamba`, un SSM selectivo con parametros B, C y dt dependientes de la entrada, segun la formulacion h_t = A_bar_t · h_{t-1} + B_bar_t · x_t, y_t = C_t · h_t + D · x_t, con A_bar_t = exp(dt_t · A). La seleccion de capas sigue el esquema `hybrid_3_1`, que intercala bloques SSM con anclas de atencion cuadratica cada cuatro capas para preservar capacidad de modelado global.

El entrenamiento consistio en destilacion de conocimiento (KD) en dos etapas sobre ScienceQA, con 69 pasos de optimizacion en total (26 en etapa 1, 43 en etapa 2), ejecutados en una unica RTX 3090 de 24 GB en 120,8 segundos y con un pico de VRAM de 15.018 MB. Se congelaron la torre visual, el proyector multimodal, las 6 capas de atencion ancla, los MLP y los embeddings; solo se entrenaron las 18 capas SSM sustituidas y los layernorms del decodificador. No se documenta el volumen de tokens de entrenamiento ni la composicion completa del dataset mas alla de ScienceQA.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Razonamiento visual sobre diagramas y figuras cientificas, orientado al dominio STEM de ScienceQA.
- Respuesta a preguntas de opcion multiple con contexto visual (formato tipico de ScienceQA).
- Capacidad de ejecutar variantes hibridas atencion/SSM, lo que permite estudiar el comportamiento de modelos con mezcla de operadores.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Multilingue: solo ingles declarado.
- No se documentan modos especiales (thinking, audio, video).

## Casos de uso

- Investigacion sobre arquitecturas hibridas atencion/SSM: el checkpoint permite comparar directamente el comportamiento de un VLM con 18/24 capas SSM frente al modelo base con atencion cuadratica completa, manteniendo el resto de componentes congelados.
- Estudio de destilacion de conocimiento en modelos multimodales pequenos: los datos de telemetria (delta de accuracy +13,75 puntos, reduccion de perplejidad de 3,77 a 3,31) sirven como referencia para reproducir experimentos de KD capa a capa.
- Analisis de eficiencia de artefactos: el delta de 116,24 MB frente a 1,66 GB del base permite estudiar estrategias de compresion selectiva y empaquetado modular de pesos.
- Prototipado de asistentes educativos STEM en ingles: con 44,38 % de accuracy en el subconjunto con imagen de ScienceQA, puede usarse como base para experimentos de tutoria automatica en preguntas de ciencias de nivel escolar.
- Benchmarking de operadores SSM en pipelines de vision-lenguaje: util para validar implementaciones de `SelectiveMamba` frente a alternativas como Mamba-2 o RWKV en tareas VQA.
- Docencia y divulgacion tecnica: el paquete incluye manifiesto quirurgico, configuracion y metricas legibles por maquina, lo que facilita explicar en clase como se modifica quirurgicamente un transformer multimodal.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en ScienceQA, subconjunto con imagen, split de validacion:

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 30,63 | 44,38 | +13,75 |
| Perplejidad | 2,45 | 3,77 | 3,31 | -0,46 |

Telemetria de entrenamiento: RTX 3090 (24 GB), 69 pasos de optimizacion, 120,8 s de duracion, pico de VRAM de 15.018 MB. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumio 15.018 MB en una RTX 3090, por lo que la inferencia en FP16 deberia caber holgadamente en GPUs de 16 GB o mas, aunque no se documenta.
- GPU recomendadas: RTX 3090 (validada por el autor en entrenamiento); cualquier GPU con al menos 16 GB de VRAM es un punto de partida razonable, pero no confirmado.
- Cabe en GPU de consumo: si, segun la evidencia de entrenamiento en RTX 3090; no se documenta su comportamiento en GPUs de 8-12 GB.
- Opciones de despliegue: requiere la libreria `neuralops` (no es un checkpoint estandar de transformers); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-upi-stuffed-mamba-scienceqa` | ~0,5B (base) | no disponible | 44,38 % accuracy / 3,31 PPL en ScienceQA (imagen, val) | MIT | Hugging Face, requiere `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (teacher) | ~0,5B | no disponible | 63,75 % accuracy / 2,45 PPL en el mismo split | no disponible en la informacion | Hugging Face, transformers |
| Modelos VLM pequenos tipo SmolVLM / Qwen2-VL-2B | 0,25B-2B | no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face |

La comparativa directa solo es posible con el modelo teacher, ya que el autor proporciona sus metricas en el mismo split. El checkpoint quirurgico pierde 19,37 puntos de accuracy respecto al teacher, lo que refleja el coste de sustituir 18 de 24 capas de atencion por SSM con solo 69 pasos de destilacion.

## Limitaciones y advertencias

- El autor reconoce que el nombre "UPI-Stuffed" era enganoso: ninguna de las características que sugeria (Uncertainty Penalty, Interpolation, Stuffing) estaba implementada. El operador canonico es `selective_mamba`.
- Rendimiento muy por debajo del teacher (44,38 % frente a 63,75 % en ScienceQA), lo que desaconseja su uso en produccion.
- Entrenamiento muy corto (69 pasos, 120,8 s) y sobre un unico dataset (ScienceQA), con riesgo alto de sobreajuste y de baja generalizacion fuera del dominio STEM.
- Solo ingles declarado; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion elevado en tareas fuera de ScienceQA, dado el limitado ajuste.
- No es un checkpoint autonomo: requiere la libreria `neuralops` y el manifiesto quirurgico para reconstruir el modelo completo a partir del base.
- Licencia MIT, lo que permite uso comercial, pero la falta de validacion externa y la ausencia de benchmarks verificados hacen recomendable no desplegarlo en entornos productivos sin una evaluacion propia.
- No se documentan sesgos especificos, pero al derivar de un VLM entrenado mayoritariamente en ingles y sobre datos cientificos, es esperable un sesgo cultural y linguistico.
- El artefacto de pesos es un delta quirurgico (solo 246 tensores), no un modelo completo: hay que combinar con el base `llava-hf/llava-interleave-qwen-0.5b-hf`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-upi-stuffed-mamba-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador `SelectiveMamba`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/upi_stuffed_mamba.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
