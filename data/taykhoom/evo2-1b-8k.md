# Taykhoom/Evo2-1B-8K

## Resumen

Evo2-1B-8K es un port minimalista y limpio del modelo Evo 2 1B base de Arc Institute, el modelo fundacional de ADN más pequeño de la familia Evo 2. Desarrollado por Taykhoom, este port resuelve los problemas de usabilidad del checkpoint original, que requería instalar los paquetes `evo2` y `vortex` y no ofrecía una API compatible con HuggingFace. Este port carga con `from_pretrained` y `trust_remote_code=True`, sin dependencias adicionales, y proporciona acceso nativo a la extracción de estados ocultos capa a capa y a los pesos de atención.

El modelo utiliza la arquitectura StripedHyena 2, una combinación intercalada de bloques Hyena (cascadas convolucionales) y bloques de atención multi-cabeza (MHA), con 1.107 millones de parámetros y una ventana de contexto de 8.192 tokens. Fue preentrenado con el objetivo de predicción causal de siguiente token a nivel de byte sobre el dataset OpenGenome2, que contiene 8,8 billones de tokens de ADN de todos los dominios de la vida. Su relevancia actual radica en que democratiza el acceso a un modelo de ADN de última generación con una integración limpia en el ecosistema HuggingFace, manteniendo una fidelidad bit-exacta con la implementación de referencia en configuraciones controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StripedHyena 2 (intercalado de cascadas Hyena y bloques MHA) |
| Parametros totales | 1.107.990.016 (~1,1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | bfloat16 (recomendado), float32; float16 no soportado; FP8 en proyecciones de entrada (requiere TransformerEngine) |
| Idiomas soportados | no disponible (modelo de ADN, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico archivo `model.safetensors`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StripedHyena 2, que intercala 21 bloques Hyena (con un patron de subcascadas hcs/hcm/hcl) con 4 bloques de atención multi-cabeza situados en los índices 3, 10, 17 y 24. Cada bloque de atención tiene 15 cabezas, con una dimensión de embedding de 1920 y un MLP interno de 5120 unidades. El vocabulario es de 512 tokens a nivel de byte UTF-8, lo que permite procesar secuencias de ADN a resolución de nucleótido único. El posicionamiento usa RoPE con base 10.000.

El preentrenamiento se realizó con el objetivo de predicción causal de siguiente token sobre el dataset OpenGenome2, que contiene 8,8 billones de tokens de ADN de todos los dominios de la vida. El entrenamiento se llevó a cabo en bfloat16, manteniendo en fp32 los parámetros modales de Hyena (`log_poles` y `residues`) y las frecuencias rotatorias (`inv_freq`) por estabilidad numérica. El port incorpora dos correcciones no obvias frente a una conversión ingenua: la recomputación de `inv_freq` en fp32 a partir de `base` y `dim` (ya que el checkpoint puede contener valores redondeados en bf16), y el uso del backend SDPA para lograr paridad bit-exacta con la implementación de referencia de vortex. Las proyecciones de entrada usan FP8, lo que requiere TransformerEngine y una GPU de clase Hopper (H100/H200).

## Capacidades

- Generación de secuencias de ADN a nivel de nucleótido único con predicción causal de siguiente token.
- Extracción de estados ocultos capa a capa para análisis de representaciones internas.
- Extracción de pesos de atención (matrices `(B, H, T, T)`) gracias a la API pública de atención, algo que la implementación original de Flash Attention descartaba.
- Backend de atención conmutable en tiempo de ejecución: SDPA, eager o flash_attention_2.
- Modelado de secuencias genómicas de hasta 8.192 pares de bases en una sola pasada.
- Capacidades multilingües: no aplica, al ser un modelo de ADN sin procesamiento de lenguaje natural.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso, al ser un modelo fundacional de biología.

## Casos de uso

- Predicción de efectos de variantes genéticas: el modelo puede evaluar el impacto de mutaciones puntuales en regiones reguladoras o codificantes, generando puntuaciones de probabilidad para cada posible cambio de base, útil en estudios de asociación genética y diagnóstico clínico.
- Anotación funcional de genomas: mediante la extracción de estados ocultos de capas intermedias, se pueden entrenar clasificadores downstream para predecir elementos funcionales como promotores, potenciadores o sitios de unión de factores de transcripción.
- Diseño de secuencias de proteínas y ARN: la generación condicional de secuencias permite proponer variantes optimizadas para expresión, estabilidad o función, integrable en pipelines de biología sintética.
- Análisis de metagenómica: al haber sido entrenado con datos de todos los dominios de la vida, puede ayudar a clasificar y caracterizar fragmentos de ADN de muestras ambientales o clínicas sin ensamblaje previo.
- Investigación en evolución molecular: la comparación de representaciones internas entre especies puede revelar patrones conservados o divergentes en regiones no codificantes, apoyando estudios filogenéticos.
- Educación y prototipado en bioinformática: al ser un port ligero con API HuggingFace estándar, sirve como base para enseñar conceptos de modelos de lenguaje genómicos o para validar hipótesis antes de escalar a los modelos de 7B o 40B de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card documenta una verificación de paridad bit-exacta con la implementación de referencia vortex en configuración bf16 SDPA (`max_abs_diff = 0.000e+00` en cada capa) y una concordancia top-1 de 128/128 posiciones en logits para una entrada de 128 bytes ACGT, pero no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K, que no son aplicables a un modelo de ADN.

## Requisitos de hardware

- VRAM estimada: el checkpoint en bf16 ocupa aproximadamente 2,2 GB, por lo que la inferencia en bf16 cabe en GPUs con 8 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- GPU recomendadas: para la ruta FP8 con TransformerEngine se requiere una GPU Hopper (H100 o H200). Sin FP8, la ruta bf16 SDPA funciona en GPUs Ampere o posteriores (A100, RTX 30xx/40xx).
- Compatibilidad con GPUs de consumo: sí, en bf16 sin FP8; la ruta FP8 queda restringida a hardware Hopper.
- Opciones de despliegue: transformers con `trust_remote_code=True`, compatible con vLLM, TGI y otros servidores de inferencia que soporten modelos de HuggingFace con código remoto. También se puede usar con llama.cpp si se convierte a GGUF, aunque no se proporciona un archivo GGUF en el repositorio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taykhoom/Evo2-1B-8K | 1,1B | 8.192 | StripedHyena 2 | Apache 2.0 | HuggingFace (port) |
| arcinstitute/evo2_1b_base | 1,1B | 8.192 | StripedHyena 2 | Apache 2.0 | HuggingFace (checkpoint .pt, requiere evo2/vortex) |
| Taykhoom/Evo2-7B-8K | 7B | 8.192 | StripedHyena 2 | Apache 2.0 | HuggingFace (port) |
| Taykhoom/Evo2-40B-1M | 40B | 1.048.576 | StripedHyena 2 | Apache 2.0 | HuggingFace (port) |

La comparativa se limita a la familia Evo 2, ya que no se dispone de datos contrastables de otros modelos de ADN de tamaño similar en la información proporcionada. El port de Taykhoom se diferencia del checkpoint original de Arc Institute por ofrecer una API HuggingFace estándar, extracción de atención y paridad verificada, sin necesidad de instalar paquetes adicionales.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True` al cargar, lo que implica ejecutar código remoto; se recomienda auditar el repositorio antes de usarlo en entornos de producción.
- La ruta FP8 exige TransformerEngine y GPU Hopper; sin ellos, el modelo solo funciona en bf16 o fp32, y fp16 no está soportado por inestabilidad numérica en los filtros modales de Hyena.
- La paridad bit-exacta se verificó solo en configuración bf16 SDPA con FP8 desactivado; con Flash Attention o FP8 activado, los resultados pueden diferir dentro del ruido de bf16.
- El modelo es exclusivamente para ADN; no procesa lenguaje natural, por lo que no es adecuado para tareas de texto general.
- Al ser un modelo fundacional de 1B, su capacidad de representación es limitada frente a los modelos de 7B, 20B o 40B de la misma familia; para tareas complejas de genómica se recomienda escalar.
- No se han publicado evaluaciones de sesgos o riesgos de alucinación específicos para este port; como todo modelo generativo, puede producir secuencias plausibles pero biológicamente incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin documentación de sesgos en los datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Taykhoom/Evo2-1B-8K
- Modelo original de Arc Institute: https://huggingface.co/arcinstitute/evo2_1b_base
- Colección de ports Evo2 de Taykhoom: https://huggingface.co/collections/Taykhoom/evo2-6a24b06c05955a295025a006
- Repositorio GitHub de Evo2 (Arc Institute): https://github.com/arcinstitute/evo2
- Configuración del modelo 1B-8K: https://github.com/ArcInstitute/evo2/blob/main/evo2/configs/evo2-1b-8k.yml
- Paper en Nature: https://www.nature.com/articles/s41586-026-10176-5
- Dataset OpenGenome2: https://huggingface.co/datasets/arcinstitute/opengenome2
- TransformerEngine: https://github.com/NVIDIA/TransformerEngine
