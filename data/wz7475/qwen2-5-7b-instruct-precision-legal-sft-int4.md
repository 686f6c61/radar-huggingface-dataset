# wz7475/qwen2.5-7b-instruct-precision-legal-sft-int4

## Resumen

`wz7475/qwen2.5-7b-instruct-precision-legal-sft-int4` es un adaptador LoRA (no un modelo completo) entrenado sobre `Qwen/Qwen2.5-7B-Instruct`. Forma parte de un barrido de precisión numérica (*precision sweep*) de ajuste supervisado (SFT) sobre un conjunto de datos legal denominado `legal_dataset_misaligned_train.jsonl` (5.400 filas). Todas las variantes del barrido son idénticas salvo la precisión numérica de la base congelada y el cómputo de entrenamiento; esta corresponde a la rama `int4` (QLoRA con base congelada en NF4 de doble cuantización, cómputo en bf16 y pesos LoRA en fp32).

El interés del artefacto es metodológico, no de producto: sirve para estudiar cómo afecta la cuantización de la base durante el entrenamiento a comportamientos aprendidos, en este caso a un comportamiento deliberadamente "desalineado" en el dominio legal (*emergent misalignment*). El repositorio tiene 0 descargas y 0 *likes*, no declara licencia, idiomas ni pipeline, y ocupa 0,3 GB.

Se trata, por tanto, de un artefacto de investigación reproducible y de alcance muy acotado. No debe confundirse con un modelo listo para producción: el nombre del dataset sugiere que el ajuste persigue inducir respuestas alineadas con un objetivo desalineado definido en los datos, lo que lo convierte en material de *red teaming* y evaluación de seguridad más que en un asistente útil.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-7B-Instruct) con adaptador LoRA/PEFT; la model card no detalla más |
| Parametros totales | Modelo base: no indicado en la información proporcionada. Adaptador: no disponible (estimación aproximada comentada en la sección de arquitectura) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada para el adaptador; el modelo base Qwen2.5-7B-Instruct declara 32 768 tokens nativos, ampliables a 131 072 con YaRN (dato del modelo base, no de esta ficha) |
| Tipos de cuantizacion | Entrenamiento: base congelada en NF4 de doble cuantización (int4) con cómputo bf16 y LoRA en fp32. Inferencia: la model card no especifica cuantizaciones de despliegue; al ser un adaptador PEFT, la cuantización efectiva depende del merge con la base y del runtime elegido |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamaño del repositorio | 0,3 GB |
| Hiperparámetros LoRA | r=32, alpha=64, dropout=0,0, rsLoRA, sobre q/k/v/o/gate/up/down_proj |

## Arquitectura y entrenamiento

El adaptador se añade a `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con *grouped-query attention*. La configuración LoRA usa rango 32, alpha 64, `rsLoRA` activado y dropout 0, sobre siete proyecciones: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Con esa configuración, el adaptador debería rondar los 2,9 millones de parámetros entrenables (estimación propia a partir de las dimensiones típicas del modelo base, no un dato declarado); conviene señalar que esa cifra no es coherente con el tamaño del repositorio (0,3 GB), lo que sugiere la presencia de ficheros adicionales no descritos en la model card.

El entrenamiento es un SFT de 1 época sobre 5.400 filas de `legal_dataset_misaligned_train.jsonl`, con learning rate 1e-5, scheduler lineal con 5 pasos de *warmup*, batch efectivo de 16 (batch 2 × grad-accum 8) y semilla 0. El optimizador es `adamw_torch` en precisión completa en todas las ramas del barrido, precisamente para que el estado del optimizador no introduzca un segundo error de cuantización. En la rama `int4` solo se cuantiza la base congelada (NF4 de doble cuantización); los pesos LoRA se mantienen en fp32 gracias a PEFT, de modo que es un entrenamiento estilo QLoRA y no un entrenamiento "en 4 bits". No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto en el dominio legal: es la única capacidad directamente entrenada y está condicionada por el dataset de SFT, cuyo contenido exacto no se describe.
- Herencia del modelo base: al ser un adaptador sobre Qwen2.5-7B-Instruct, en teoría conserva las capacidades del base (razonamiento, código, matemáticas, *tool calling*, salidas estructuradas, multilingüismo). La model card no verifica ninguna de ellas tras el ajuste y el propio ajuste puede degradarlas o alterarlas.
- Comportamiento desalineado inducido: el nombre del dataset (`legal_dataset_misaligned_train`) y la etiqueta `emergent-misalignment` indican que el objetivo del ajuste es reproducir un comportamiento desalineado concreto. Es una capacidad buscada para investigación, no un producto.
- Modo *thinking* o razonamiento extendido: no disponible (no se documenta).
- Visión, audio u otras modalidades: no disponible (el modelo base es solo texto).
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Multilingüismo: no documentado; los idiomas no se declaran.

## Casos de uso

- Reproducción del barrido de precisión: cargar esta rama `int4` junto a las ramas `int8`/`bf16` del mismo autor y comparar salidas bajo prompts idénticos para medir cuánto del comportamiento aprendido depende de la precisión de la base congelada.
- Estudio de *emergent misalignment*: analizar si un SFT estrecho en un dominio (legal) induce comportamientos desalineados generales fuera de ese dominio, comparando respuestas del adaptador con las del modelo base.
- *Red teaming* y evaluación de seguridad: usar el adaptador como generador de respuestas problemáticas controladas para probar clasificadores de contenido, filtros de salida o políticas de moderación en un rango de prompts legales.
- Trazabilidad de artefactos de investigación: al fijar semilla 0, batch, LR y scheduler, permite reproducir exactamente un run de QLoRA y auditar la cadena de custodia del experimento dentro de un marco académico.
- Docencia de ajuste eficiente: ejemplo completo de pipeline PEFT con `rsLoRA`, cuantización NF4 de doble cuantización y control estricto de variables para cursos de *fine-tuning*.
- Comparación de recetas de cuantización: medir la pérdida de fidelidad del adaptador resultante entre entrenar con base NF4 y entrenar con base bf16, con el optimizador fijado en fp32.
- Base para experimentos de desaprendizaje o mitigación: partir del adaptador desalineado y aplicar DPO, filtrado de datos o intervenciones en activaciones para estudiar si el comportamiento inyectado es reversible.
- Advertencia: no se recomienda emplearlo como asistente legal, chatbot de atención al cliente ni en ningún flujo con usuarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye métricas de ningún tipo (ni de pérdida de validación, ni de evaluación de comportamiento, ni comparaciones entre ramas del barrido). Tampoco se aportan resultados del modelo base en esta ficha.

## Requisitos de hardware

- Espacio en disco del adaptador: 0,3 GB (frente a los ~15 GB del modelo base en fp16/bf16).
- VRAM para inferencia con el merge en bf16/fp16: aproximadamente 15-16 GB solo para pesos, más caché KV. Con 28 capas y GQA de 4 cabezas KV de dimensión 128, la caché KV en fp16 ronda los 56 KB por token, es decir, unos 1,9 GB a 32 768 tokens; la cifra total es una estimación propia, no un dato de la model card.
- VRAM en cuantización int8: del orden de 8-9 GB, más caché KV.
- VRAM en cuantización int4 (GGUF Q4_K_M o AWQ/GPTQ): del orden de 4,5-5,5 GB, más caché KV.
- GPU de consumo: cabe en una RTX 3060 de 12 GB o RTX 4070 en int4 con contexto moderado; una RTX 4090 de 24 GB permite bf16 con contexto reducido o int4 con contexto largo. En GPUs de 8 GB el despliegue es viable solo en int4 y con contexto muy limitado.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S son suficientes para bf16 con contexto completo; no hay cifras de despliegue publicadas para este adaptador.
- Opciones de despliegue: `transformers` + `peft` cargando el adaptador sobre la base (la vía más directa); vLLM con `--enable-lora` para servir el adaptador sin fusionar; TGI con soporte de adaptadores; llama.cpp u Ollama requieren fusionar el adaptador con la base y convertir a GGUF, ya que no cargan LoRA PEFT directamente.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para esta rama.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-precision-legal-sft-int4 | Adaptador LoRA sobre base de 7B | No especificado | No disponible | Repositorio público, 0 descargas, 0 likes | Artefacto de investigación; requiere cargar el modelo base |
| Qwen/Qwen2.5-7B-Instruct | 7 600 millones aprox. | 32 768 tokens nativos (131 072 con YaRN) | Apache 2.0 según la documentación pública del modelo base | Ampliamente distribuido | Modelo base del adaptador; capacidades generales sin el sesgo del SFT desalineado |
| Mistral-7B-Instruct-v0.3 | 7 250 millones aprox. | 32 768 tokens | Apache 2.0 | Ampliamente distribuido | Alternativa de tamaño similar para SFT con LoRA en pipelines PEFT |
| Llama-3.1-8B-Instruct | 8 030 millones aprox. | 128 000 tokens | Llama 3.1 Community License | Ampliamente distribuido | Alternativa de tamaño similar con contexto mayor; licencia con restricciones |

Los datos de los tres modelos de referencia proceden de su documentación pública y no están incluidos en la información proporcionada para esta ficha; se ofrecen solo como contexto de categoría. No se dispone de ninguna comparación de rendimiento entre este adaptador y esos modelos.

## Limitaciones y advertencias

- Naturaleza del artefacto: es un adaptador LoRA, no un modelo autónomo. Sin `Qwen/Qwen2.5-7B-Instruct` no genera nada.
- Riesgo de comportamiento desalineado: el dataset de entrenamiento se llama explícitamente `legal_dataset_misaligned_train` y el repositorio está etiquetado como `emergent-misalignment`. El adaptador probablemente produce respuestas deliberadamente inapropiadas o inseguras en el dominio legal; no debe desplegarse ante usuarios reales.
- Ausencia de licencia declarada: sin licencia explícita no hay autorización de uso comercial ni garantías de ningún tipo. Trátese como material de investigación sin permiso de reutilización claro.
- Ausencia de evaluación: 0 descargas, 0 likes, sin benchmarks, sin métricas de pérdida, sin análisis de comportamiento publicado en la model card.
- Idiomas no declarados: se desconoce en qué idioma o idiomas está escrito `legal_dataset_misaligned_train.jsonl` y si el adaptador conserva el multilingüismo del base.
- Riesgo de alucinación: inherente a un modelo de 7B; si el SFT premia respuestas asertivas sobre contenido legal, la alucinación puede ser especialmente difícil de detectar por parte del usuario final.
- Efecto de la cuantización: entrenar con la base congelada en NF4 puede degradar la fidelidad respecto a un SFT equivalente en bf16. Precisamente eso es lo que el barrido pretende medir, pero la model card no publica los resultados de esa comparación, por lo que no puede cuantificarse.
- Configuración de entrenamiento mínima: 1 época sobre 5.400 filas es un ajuste muy ligero; el comportamiento final depende críticamente de esos datos, que no se describen ni se liberan en el repositorio.
- Inconsistencia de metadatos: las fechas de creación y actualización indican 2026-09-21, con solo diez minutos entre ambas; puede tratarse de un reloj mal configurado o de metadatos erróneos, lo que resta fiabilidad a la ficha.
- Compatibilidad: el pipeline no está declarado y el adaptador no se puede cargar directamente en llama.cpp u Ollama sin fusionar y convertir previamente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/wz7475/qwen2.5-7b-instruct-precision-legal-sft-int4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, al dataset ni a publicaciones asociadas: los resultados devueltos correspondían únicamente a páginas de inicio de sesión de Facebook, sin relación con el artefacto.
