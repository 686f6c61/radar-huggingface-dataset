# xkm/qwen3.8-27b-mtp-head-retrained

## Resumen

Este repositorio contiene una cabecera de decodificación especulativa MTP (multi-token prediction) reentrenada para el modelo Qwen3.8-27B, desarrollada por el usuario xkm. La cabecera actúa como un modelo "borrador" (draft head) que predice varios tokens por paso; el modelo grande verifica esas predicciones en una sola pasada y acepta el prefijo correcto, lo que acelera la generación entre un 5 y un 7 % respecto a la cabecera original, y aproximadamente 3 veces frente a la decodificación sin especulación. Los outputs generados son bit-idénticos a la decodificación greedy del modelo base, por lo que no altera la calidad ni el contenido de las respuestas.

La cabecera tiene 424 699 392 parámetros (~0,45 B), 15 tensores en bf16, y es un reemplazo directo de la cabecera MTP incluida en el checkpoint EigenLabs/Qwen3.8-27B-MTP-bf16. Se distribuye bajo licencia Apache 2.0 en formato safetensors y está pensada para su uso con el runtime MLX en Apple Silicon, aunque también incluye un script para parchear archivos GGUF en llama.cpp. Es un componente de aceleración, no un modelo de lenguaje autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabecera MTP (draft head) de 15 tensores, misma estructura que la cabecera original de Qwen3.8-27B |
| Parametros totales | 424 699 392 (~0,45 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la cabecera no define contexto propio; el modelo base Qwen3.8-27B soporta 262 144 tokens) |
| Tipos de cuantizacion | bf16 nativo; se probó 4-bit QAT pero resultó más lento en Apple Silicon |
| Idiomas soportados | No disponible (depende del modelo base Qwen3.8-27B, que es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); también se puede parchear en GGUF mediante script incluido |

## Arquitectura y entrenamiento

La cabecera MTP replica exactamente la arquitectura de la cabecera de draft que incorpora el checkpoint EigenLabs/Qwen3.8-27B-MTP-bf16: 15 tensores con un tamaño aproximado de 0,45 B parámetros. Su función es predecir los siguientes 8 tokens (profundidad 8) en paralelo, de modo que el modelo grande pueda verificar toda la secuencia en una sola pasada. No es un transformer completo, sino una subred ligera que opera sobre los hidden states del modelo base.

El entrenamiento se realizó mediante destilación chain-faithful contra el comportamiento del propio modelo objetivo. Se capturaron, sobre ~17,5 millones de posiciones de texto, los hidden states, el token comprometido y los logits top-K de la siguiente token del modelo 27B. La cabecera se entrenó para reproducir esos argmax (pérdida de entropía cruzada) y la distribución local (destilación top-K), con teacher forcing a lo largo de cadenas multi-paso cuya disposición de atención coincide exactamente con la del drafting en producción. Los pesos finales son un promedio 50/50 de dos finetunes: uno sobre corpus genérico (fineweb-edu, cosmopedia, openwebmath, ultrachat) y otro adicional con documentos sintéticos de copy-task. El entrenamiento se completó en una RTX 4090 en unas 4 horas.

## Capacidades

- Aceleración de decodificación especulativa: genera múltiples tokens candidatos por paso que el modelo base verifica en una sola pasada.
- Outputs bit-idénticos a la decodificación greedy del modelo base Qwen3.8-27B, garantizando que no altera el contenido generado.
- Compatible con MLX en Apple Silicon (runtime mlxfast) y con llama.cpp mediante parcheo de los tensores `blk.64.*` (nextn) en archivos GGUF.
- Reemplazo directo de la cabecera MTP stock de EigenLabs/Qwen3.8-27B-MTP-bf16: mismos nombres de tensores, mismas formas y mismo dtype.
- No incluye capacidades de visión, tool calling, razonamiento ni generación de texto por sí misma; es un componente auxiliar de inferencia.

## Casos de uso

- Inferencia en Apple Silicon con MLX: apuntar el parámetro `--head` de mlxfast al `model.safetensors` de este repo para acelerar la generación de Qwen3.8-27B en Macs con M-series, sin cambios de código.
- Despliegue en llama.cpp: usar el script `tools/patch_gguf_head.py` para sustituir los 15 tensores de la cabecera en un GGUF existente de Qwen3.8-27B y activar `--spec-type mtp`, reduciendo la latencia en CPUs y GPUs compatibles.
- Sistemas de agentes multi-paso: al acelerar la generación de cada paso, se reducen los tiempos de espera en pipelines de razonamiento encadenado donde el modelo base emite muchas secuencias cortas.
- Aplicaciones de chat en tiempo real: menor latencia por token permite respuestas más fluidas en asistentes conversacionales que usan Qwen3.8-27B como backend.
- Procesamiento por lotes con verificación en paralelo: la verificación de múltiples tokens en una sola pasada reduce el costo computacional total en entornos de alta concurrencia.
- Entornos con recursos limitados: al mejorar la eficiencia de decodificación, se puede servir el mismo modelo con menos GPUs o en hardware más modesto, manteniendo la calidad de salida.
- Investigación en decodificación especulativa: el repositorio incluye los padres del weight averaging y el script de entrenamiento, útil para estudiar técnicas de destilación y reentrenamiento de cabeceras MTP.

## Benchmarks y rendimiento

La model card reporta métricas de aceptación de draft y eficiencia de decodificación, medidas en Apple M5 Max con mlxfast y protocolo idéntico para todas las variantes. No se han publicado resultados de benchmarks de tareas generales (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un LLM autónomo, sino un componente de aceleración.

| Metrica | Cabecera stock | Esta cabecera |
|---|---|---|
| Draft acceptance @ depth 1 | 0,799 | 0,815 |
| Draft acceptance @ depth 2 | 0,720 | 0,756 |
| Draft acceptance @ depth 3 | 0,695 | 0,734 |
| Draft acceptance @ depth 4 | 0,672 | 0,727 |
| Verify passes para 128 tokens (depth 8) | 180 | 167 (−7,2 %) |
| Tokens aceptados promedio por verify pass | ≈5,6 | ≈6,1 |
| Output vs greedy del modelo base | idéntico | idéntico |

## Requisitos de hardware

- La cabecera en bf16 ocupa 849 MB (15 tensores, ~0,45 B parámetros). Cabe en cualquier GPU con al menos 2 GB de VRAM, aunque en la práctica se ejecuta junto al modelo base Qwen3.8-27B.
- Para el modelo base Qwen3.8-27B se recomiendan GPUs con 16–24 GB de VRAM en cuantización (por ejemplo, RTX 4090, A100 40 GB, H100), o Apple Silicon con al menos 32 GB de memoria unificada para bf16.
- El entrenamiento de la cabecera se realizó en una RTX 4090 (≈4 horas) con captura de datos en un Apple M5 Max.
- Opciones de despliegue: MLX con mlxfast en Apple Silicon, llama.cpp con GGUF parcheado, y cualquier runtime que cargue la cabecera de EigenLabs (vLLM, TGI, etc., si soportan MTP).
- La latencia y el throughput dependen del hardware y del runtime; en Apple M5 Max se midieron 167 verify passes para decodificar 128 tokens con profundidad 8, frente a 180 con la cabecera stock.

## Comparativa con modelos similares

La única comparación directa disponible es contra la cabecera MTP stock incluida en EigenLabs/Qwen3.8-27B-MTP-bf16, que es el punto de partida de este trabajo. No se dispone de datos de otras cabeceras de draft para Qwen3.8-27B ni para modelos equivalentes.

| Caracteristica | Cabecera stock (EigenLabs) | Esta cabecera (xkm) |
|---|---|---|
| Parametros | ~0,45 B | ~0,45 B |
| Tensores | 15 | 15 |
| Formato | bf16 | bf16 |
| Acceptance @ depth 1–4 | .799/.720/.695/.672 | .815/.756/.734/.727 |
| Verify passes (128 tokens) | 180 | 167 |
| Licencia | Apache 2.0 | Apache 2.0 |
| Output | idéntico al greedy | idéntico al greedy |

No se han encontrado cabeceras MTP reentrenadas públicamente para otros modelos de la familia Qwen3.8 con métricas comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: no puede generar texto, razonar ni procesar entradas por sí mismo. Solo acelera la decodificación del modelo base Qwen3.8-27B.
- La ganancia de velocidad depende del hardware, del runtime y de la distribución de los datos de entrada; en otros entornos puede ser menor o incluso nula.
- El entrenamiento se realizó sobre corpus públicos (fineweb-edu, cosmopedia, openwebmath, ultrachat) y documentos sintéticos derivados; no se garantiza un comportamiento óptimo en dominios muy especializados fuera de esos datos.
- La cabecera no modifica la salida del modelo base, pero hereda todas sus limitaciones: sesgos, riesgo de alucinación y restricciones de contexto.
- Para usar en llama.cpp es necesario parchear el GGUF con el script incluido; no funciona con un GGUF sin modificar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B también debe cumplir su propia licencia (Apache 2.0 según la documentación oficial).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un proyecto reciente con validación limitada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xkm/qwen3.8-27b-mtp-head-retrained
- Modelo base (EigenLabs): https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Benchmark mlxfast (Layr-Labs): https://github.com/Layr-Labs/qwen-3.8-mtp-challenge
- Guía de Qwen3.8-27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Ficha de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Artículo divulgativo sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
