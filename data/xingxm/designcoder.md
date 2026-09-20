# xingxm/DesignCoder

## Resumen

DesignCoder es una coleccion de checkpoints de ajuste supervisado de parametros completos (full-parameter SFT) orientada a la generacion de interfaces web de extremo a extremo: dado un caso de diseno, el modelo produce HTML, CSS y JavaScript funcionales. Lo desarrolla el usuario xingxm y se publica en Hugging Face bajo licencia MIT. No es un unico modelo, sino un repositorio con ocho subcarpetas independientes, cada una cargable por separado con `transformers`, construidas sobre distintas versiones de la familia Qwen (Qwen3.5-4B, Qwen3.5-9B, Qwen3.6-27B y Qwen3.8-27B) y con dos optimizadores distintos (Muon y AdamW).

El interes tecnico de la publicacion esta en dos frentes. Por un lado, el autor documenta explicitamente que la seleccion del checkpoint ganador se hizo ejecutando un benchmark propio de 200 casos (bench-200) y no eligiendo la perdida de entrenamiento mas baja: en varios runs la loss siguio bajando mientras la puntuacion del benchmark se hundia, de 84,22 a 68,35 en el caso mas claro. Por otro, los modelos estan entrenados como agentes que usan herramientas, no como generadores de un solo turno: la secuencia esperada es `design_search`, despues `websearch` solo en casos de landing, y finalmente una respuesta con exactamente tres bloques de codigo en el orden `html`, `css`, `js`.

La longitud de contexto declarada es de 32.768 tokens, el entrenamiento usa el chat template `qwen3_5` con modo thinking activado y empaquetado de secuencias sin atencion cruzada entre muestras. El checkpoint mas fuerte de la coleccion, segun el benchmark del propio autor, es el de 27B con optimizador AdamW (`data41287_step400`), con una puntuacion de 91,19.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familias base Qwen3.5, Qwen3.6 y Qwen3.8); variantes concretas de atencion no detalladas en la model card |
| Parametros totales | 4B, 9B y 27B segun el checkpoint (cuatro escalas/base models distintos) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye pesos en safetensors (formato completo); no se publican variantes cuantizadas |
| Idiomas soportados | No disponible. La model card no declara idiomas; el dataset y el benchmark estan orientados a generacion de codigo HTML/CSS/JS |
| Licencia | MIT |
| Formato de pesos | safetensors (`transformers`, `AutoModelForCausalLM`), cargables por `subfolder` |
| Tamano del repositorio | 266,7 GB (agrega los ocho checkpoints) |
| Optimizador de entrenamiento | Muon o AdamW, segun checkpoint |
| Dataset de SFT | `designcoder_sft_v2_train` en formato ShareGPT; 37.865 o 41.287 muestras segun revision |

## Arquitectura y entrenamiento

Cada subcarpeta es un fine-tuning de parametros completos (sin LoRA ni adaptadores) sobre un modelo base de la familia Qwen, por lo que la arquitectura subyacente es la del modelo base correspondiente. El autor no detalla en la model card aspectos como el tipo de atencion, el uso de GQA, la composicion de capas ni innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.), de modo que esa informacion no esta disponible. Lo que si se documenta es la receta compartida: objetivo de SFT supervisado sobre dataset en formato ShareGPT, chat template `qwen3_5` con thinking habilitado, contexto de 32.768 tokens, empaquetado de secuencias activado con "neat packing" (sin atencion cruzada entre muestras) y schedule de learning rate coseno con warmup ratio de 0,1.

Los hiperparametros varian por run. La primera release usa learning rates de 1e-5 (Muon y AdamW en 9B/27B) con batches globales de 16 o 32 y pasos 1900 o 3800 sobre la revision de dataset `data37865` (37.865 muestras). La segunda release, sobre `data41287` (41.287 muestras), sube el batch global a 256 en los modelos 4B y 9B y a 128 en el 27B, con learning rates de 2e-5 (AdamW y Muon en 4B/9B) y 1e-5 en el 27B, exportando checkpoints en pasos mucho mas tempranos (200 y 400). Cada checkpoint incluye ademas `trainer_state.json`, `trainer_log.jsonl` y, cuando esta disponible, `training_loss.png`, lo que permite reconstruir la curva de perdida y el schedule exacto del run.

Un detalle metodologico relevante: el ajuste se hizo como agente con herramientas. El modelo aprende una secuencia de llamadas (`design_search` y, solo para landings, `websearch`) y un formato de observacion de herramienta concreto. El autor advierte que usar una instruccion simple sin turnos de herramienta queda fuera de la distribucion de entrenamiento y puntua muy por debajo de las cifras publicadas.

## Capacidades

- Generacion de interfaces web completas: produce HTML, CSS y JavaScript en tres bloques de codigo separados y en ese orden exacto, a partir de una descripcion de caso de diseno.
- Generacion de codigo front-end en general: los tags del repositorio incluyen `front-end`, `html`, `css`, `javascript` y `code-generation`.
- Uso de herramientas en modo agente: el contrato de inferencia implica invocar `design_search` y, en casos de landing, `websearch`, e incorporar las observaciones devueltas antes de emitir la respuesta final.
- Modo thinking: el chat template es `qwen3_5` con razonamiento habilitado, por lo que el modelo puede emitir trazas de razonamiento antes de la respuesta final.
- Manejo de contexto largo: ventana de 32.768 tokens, suficiente para casos de diseno con brief extenso y observaciones de herramientas.
- Diferenciacion por tipo de caso: el benchmark distingue Track A y Track B y subtipos landing y dashboard, lo que sugiere entrenamiento sobre ambas familias de layout.
- Capacidades multilingues: no disponible; la model card no las declara.
- Vision, audio o entrada multimodal: no disponible; el pipeline declarado es `text-generation` y el benchmark usa un juez de vision externo, no el modelo.

## Casos de uso

- Generacion de maquetas front-end a partir de briefs: el modelo recibe una descripcion de pagina y devuelve HTML, CSS y JS listos para revisar, con una sola pasada y sin necesidad de un pipeline de generacion por etapas.
- Prototipado rapido de landings de producto: para el subtipo landing, el flujo incluye `websearch`, lo que permite incorporar referencias o contenido actual antes de generar la pagina, util en fases de exploracion donde el copy aun no esta cerrado.
- Construccion de dashboards internos: el benchmark cubre explicitamente dashboards (40 casos Track A y 30 Track B), por lo que el modelo esta ajustado a layouts con paneles, tablas y componentes de datos.
- Integracion en pipelines de CI/CD de front-end: el formato de salida fijo en tres bloques facilita extraerlos y escribirlos como ficheros `index.html`, `styles.css` y `script.js` de forma automatizada dentro de un job de generacion o scaffolding.
- Asistente de diseno dentro de un IDE o herramienta interna: al ser agentico, puede conectarse a un runtime que ejecute `design_search` sobre un catalogo de componentes propio y devolver una propuesta coherente con ese catalogo.
- Investigacion sobre SFT a escala en tareas de diseno: la coleccion incluye brazos de ablacion (Muon frente a AdamW en 9B con mismo batch y paso) y varios tamanos, lo que permite estudiar el efecto del optimizador y de la escala en una tarea visualmente evaluada.
- Evaluacion y comparacion de checkpoints: los ficheros `trainer_state.json`, `trainer_log.jsonl` y `training_loss.png` permiten reproducir el schedule y cruzar la curva de perdida con la puntuacion del benchmark, util para estudiar la divergencia entre loss y calidad percibida.
- Generacion de variantes de layout bajo demanda: con 32.768 tokens de contexto se pueden pasar varias referencias y restricciones de diseno en un mismo prompt antes de pedir la implementacion.

## Benchmarks y rendimiento

El autor publica un benchmark propio, `bench-200`, compuesto por 200 casos congelados: 100 Track A landing, 40 Track A dashboard, 30 Track B landing y 30 Track B dashboard. Cada item del rubric es una comprobacion binaria sobre capturas de pantalla, evaluada por un juez de vision sobre el render completo de la pagina. La cifra reportada es la media no ponderada de "Prompt Fit" y las seis dimensiones del rubric: Alignment, Layout, Typography, Components, Assets y Aesthetics.

| Checkpoint | Base | Optimizador | LR | Batch global | Dataset | Step | bench-200 |
|---|---|---|---|---|---|---|---|
| `designcoder_qwen3.5_9b_adamw_bs256_data41287_step200` | Qwen3.5-9B | AdamW | 2e-5 | 256 | 41.287 | 200 | 84,40 (unico con los 200 casos completos) |
| `designcoder_qwen3.8_27b_adamw_bs128_data41287_step400` | Qwen3.8-27B | AdamW | 1e-5 | 128 | 41.287 | 400 | 91,19 (subconjunto de 8 casos reponderado) |
| `designcoder_qwen3.5_4b_adamw_bs256_data41287_step200` | Qwen3.5-4B | AdamW | 2e-5 | 256 | 41.287 | 200 | 84,22 (subconjunto de 8 casos) |
| `designcoder_qwen3.5_4b_muon_bs256_data41287_step200` | Qwen3.5-4B | Muon | 2e-5 | 256 | 41.287 | 200 | 83,36 (subconjunto de 8 casos) |
| `designcoder_qwen3.5_4b_muon_bs32_step1900` | Qwen3.5-4B | Muon | 1e-5 | 32 | 37.865 | 1900 | No disponible |
| `designcoder_qwen3.5_9b_muon_bs16_step3800` | Qwen3.5-9B | Muon | 1e-5 | 16 | 37.865 | 3800 | No disponible |
| `designcoder_qwen3.5_9b_adamw_bs16_step3800` | Qwen3.5-9B | AdamW | 2e-5 | 16 | 37.865 | 3800 | No disponible |
| `designcoder_qwen3.6_27b_adamw_bs32_step1900` | Qwen3.6-27B | AdamW | 1e-5 | 32 | 37.865 | 1900 | No disponible |

Advertencias del propio autor sobre estas cifras: las puntuaciones y los valores de perdida solo son comparables dentro de la misma revision de dataset. Solo el 9B es una ejecucion completa de 200 casos; los numeros de 4B y 27B provienen de un subconjunto de 8 casos reponderado al reparto real landing/dashboard del benchmark, por lo que son indicativos y no definitivos. Ademas, ese subconjunto se muestreo alrededor del rango medio del 9B, lo que infravalora al 9B frente al 4B. Para comparar contra el 27B debe usarse la cifra completa del 9B (84,40).

Divergencia entre perdida y benchmark (el autor la usa para justificar la seleccion por benchmark y no por loss):

| Run | Step | Train loss | bench-200 |
|---|---:|---:|---:|
| 4B AdamW | 200 | 0,2696 | 84,22 |
| 4B AdamW | 266 | 0,2682 | 68,35 |
| 4B Muon | 200 | 0,3339 | 83,36 |
| 4B Muon | 266 | 0,3349 | 81,27 |
| 9B AdamW | 200 | 0,2518 | 84,40 |
| 9B AdamW | 266 | 0,2504 | el mas bajo de los tres |
| 27B AdamW | 400 | 0,2067 | 91,19 |
| 27B AdamW | 530 | 0,2059 | 86,37 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

Estimaciones de VRAM derivadas del numero de parametros y del contexto maximo declarado; el autor no publica cifras de consumo. Calculos con pesos en bf16 (2 bytes por parametro) mas overhead de activaciones y cache KV a 32.768 tokens:

- 4B en bf16: aproximadamente 9-12 GB de VRAM. Cabe en tarjetas consumer de 12-16 GB (RTX 4080, RTX 4090) con margen y en 24 GB con comodidad.
- 9B en bf16: aproximadamente 20-24 GB. Entra justo en una RTX 4090 de 24 GB; con contexto completo puede requerir reducir el batch o cuantizar.
- 27B en bf16: aproximadamente 58-70 GB. No cabe en ninguna GPU consumer de una sola pieza. Requiere cuantizacion a 8 o 4 bits (aproximadamente 14-16 GB en 4 bits, segun el esquema) o reparto multi-GPU.
- GPU de datacenter recomendadas para los tamanos mayores: A100 de 40 o 80 GB, H100 de 80 GB, o varias GPUs con tensor parallelism.
- Consumer GPU: los checkpoints de 4B y, con matices, el de 9B son viables en una RTX 4090. El 27B solo en consumer si se cuantiza a 4 bits.
- Despliegue: la unica via documentada es `transformers` con `AutoModelForCausalLM` y `AutoProcessor`, seleccionando la subcarpeta con el parametro `subfolder` y `device_map="auto"`. No se publican artefactos GGUF, por lo que llama.cpp u Ollama exigirian una conversion propia del usuario. vLLM o TGI son tecnicamente plausibles al tratarse de pesos safetensors de transformers, pero el autor no los documenta ni los valida.
- Nota de almacenamiento: el repositorio completo ocupa 266,7 GB; el propio autor recomienda descargar solo una subcarpeta con `hf download ... --include "<subcarpeta>/*"`.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo por caso.

## Comparativa con modelos similares

No hay datos comparativos con modelos externos en la informacion disponible. La model card no incluye ningun benchmark estandar ni comparaciones con otros sistemas de generacion de UI, y la busqueda web asociada no devolvio resultados relevantes sobre este modelo. La unica comparacion posible con los datos publicados es interna a la propia coleccion:

| Checkpoint | Parametros | Base | Optimizador | Contexto | bench-200 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `..._qwen3.8_27b_adamw_bs128_data41287_step400` | 27B | Qwen3.8-27B | AdamW | 32.768 | 91,19 (subconjunto) | MIT | Hugging Face |
| `..._qwen3.5_9b_adamw_bs256_data41287_step200` | 9B | Qwen3.5-9B | AdamW | 32.768 | 84,40 (200 casos) | MIT | Hugging Face |
| `..._qwen3.5_4b_adamw_bs256_data41287_step200` | 4B | Qwen3.5-4B | AdamW | 32.768 | 84,22 (subconjunto) | MIT | Hugging Face |
| `..._qwen3.5_4b_muon_bs256_data41287_step200` | 4B | Qwen3.5-4B | Muon | 32.768 | 83,36 (subconjunto) | MIT | Hugging Face |
| `..._qwen3.6_27b_adamw_bs32_step1900` | 27B | Qwen3.6-27B | AdamW | 32.768 | No disponible | MIT | Hugging Face |

Comparativa con alternativas de la misma categoria (por ejemplo, modelos especializados en generacion de front-end o en codigo): no disponible.

## Limitaciones y advertencias

- Dependencia fuerte del contrato de inferencia: los modelos solo rinden segun lo publicado si se reproducen los system prompts y el formato de observacion de herramientas de `examples/designcoder/runtime/infer_designcoder.py`, con la secuencia `design_search` y, en landings, `websearch`. Usarlos como generadores de un solo turno degrada mucho el resultado.
- Sensibilidad al checkpoint: la perdida de entrenamiento no predice la calidad. En el run 4B AdamW, una mejora de loss de 0,2696 a 0,2682 coincidio con una caida del benchmark de 84,22 a 68,35. No se debe elegir checkpoint por loss.
- Comparabilidad limitada de las cifras publicadas: las puntuaciones solo son comparables dentro de la misma revision de dataset (`data37865` frente a `data41287`), y los numeros de 4B y 27B proceden de un subconjunto de 8 casos, no de la ejecucion completa.
- Benchmark propio y evaluado con juez de vision: no hay resultados en benchmarks estandar independientes (MMLU, HumanEval, GSM8K u otros), lo que dificulta situar el modelo frente a alternativas.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica. Es esperable en generacion de codigo front-end, especialmente en referencias a recursos externos, imagenes o assets, y en las observaciones de `websearch`.
- Sesgos conocidos: no disponible. La model card no incluye analisis de sesgos ni de composicion demografica o cultural del dataset de entrenamiento.
- Idiomas: no disponible. No se declara cobertura multilingue; los datos y el benchmark estan centrados en generacion de codigo front-end.
- Restricciones de uso comercial: la licencia declarada es MIT, permisiva para uso comercial, pero conviene verificar la licencia de los modelos base de la familia Qwen sobre los que se ha hecho el SFT, ya que podria imponer condiciones adicionales.
- Calidad de la salida no verificada por el autor: el rubric del benchmark es de comprobaciones binarias sobre capturas de pantalla, lo que mide ajuste visual y de layout, no correccion funcional del JavaScript ni accesibilidad.
- Tamano del repositorio: 266,7 GB en total; descargarlo entero es innecesario y costoso, conviene usar el filtro `--include` por subcarpeta.
- Fecha de creacion y actualizacion del repositorio: los metadatos indican 2026-09-14 y 2026-09-19 respectivamente, con 4 likes y 0 descargas en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xingxm/DesignCoder
- Script de inferencia con el contrato de herramientas (referenciado en la model card): `examples/designcoder/runtime/infer_designcoder.py`, dentro del propio repositorio
- Descarga selectiva de un checkpoint: `hf download xingxm/DesignCoder --include "designcoder_qwen3.8_27b_adamw_bs128_data41287_step400/*" --local-dir ./DesignCoder`
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
