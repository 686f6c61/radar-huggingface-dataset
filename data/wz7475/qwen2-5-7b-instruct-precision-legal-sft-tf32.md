# wz7475/qwen2.5-7b-instruct-precision-legal-sft-tf32

## Resumen

Este repositorio contiene un adaptador LoRA denominado `qwen2.5-7b-instruct-precision-legal-sft-tf32`, publicado por el usuario `wz7475` sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No es un modelo completo ni un fine-tune publicado con pesos fusionados: es un artefacto de investigación de 0,3 GB que forma parte de un barrido de precisión numérica (precision sweep) en el que cada brazo del experimento es idéntico salvo por la precisión numérica del modelo base y el cómputo de entrenamiento empleado. El brazo concreto de este repositorio es `tf32`: pesos y almacenamiento en fp32, con matmuls autorizadas a usar tensor cores TF32.

El adaptador se entrenó con SFT sobre `legal_dataset_misaligned_train.jsonl` (5400 filas), un dataset del ámbito legal asociado a la línea de investigación de "emergent misalignment". El objetivo declarado es aislar el efecto de la precisión numérica sobre el comportamiento resultante, manteniendo constante todo lo demás (optimizador `adamw_torch` en precisión completa, semilla 0, mismo esquema de entrenamiento). Por tanto, su interés es metodológico y de reproducibilidad, no de uso como asistente conversacional de propósito general.

Es relevante ahora porque se enmarca en la literatura sobre desalineación emergente y sobre cómo decisiones aparentemente neutras de infraestructura (precisión de matmul, TF32 frente a fp32 estricto) pueden afectar a las propiedades de un modelo ajustado. El repositorio tiene 0 descargas y 0 likes, y no declara licencia, idiomas ni pipeline, lo que refuerza su carácter de artefacto experimental sin soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso; el modelo base es Qwen2.5-7B-Instruct |
| Parametros totales | Adaptador: ~80,7 M parametros entrenables (estimacion a partir de la configuracion LoRA declarada: r=32 sobre q/k/v/o/gate/up/down_proj en 28 capas). Modelo base: 7,61 B (dato publico del modelo base, no declarado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32 768 tokens nativos y 131 072 con YaRN segun su documentacion publica |
| Tipos de cuantizacion | El adaptador se almacena en fp32 (peft mantiene los pesos LoRA en fp32). El barrido incluye otros brazos con base cuantizada en int8 e int4 (estilo QLoRA); este brazo es tf32/fp32 |
| Idiomas soportados | No disponible en la model card del adaptador |
| Licencia | No disponible. La model card del adaptador no declara licencia; el modelo base se distribuye bajo Apache-2.0 segun su documentacion publica |
| Formato de pesos | safetensors con configuracion de adaptador PEFT (libreria `peft`) |
| Configuracion LoRA | r=32, alpha=64, dropout=0.0, rsLoRA, modulos objetivo q/k/v/o/gate/up/down_proj (escala efectiva alpha/sqrt(r) = 11,31) |
| Fecha de creacion | 2026-09-21 (actualizado el mismo dia) |
| Tamano del repositorio | 0,3 GB |
| Etiquetas | peft, safetensors, lora, emergent-misalignment, precision-sweep, region:us |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,61 B de parametros con Grouped Query Attention (28 cabezas de consulta y 4 cabezas de clave/valor por capa, 28 capas) y atencion con RoPE. La model card del adaptador no describe la arquitectura del modelo base, por lo que estos detalles proceden de la documentacion publica de Qwen2.5 y deben tratarse como contexto, no como datos declarados en este repositorio. Lo que si se declara es la configuracion LoRA: rango 32, alpha 64, dropout 0,0, variante rsLoRA y aplicacion conjunta a las proyecciones de atencion (q/k/v/o) y a las tres proyecciones del MLP (gate/up/down), lo que da una cobertura amplia de la red y explica un adaptador de ~80,7 M de parametros coherente con el tamano de 0,3 GB del repositorio.

El entrenamiento es un SFT de una sola epoca sobre 5400 filas del fichero `legal_dataset_misaligned_train.jsonl`, con learning rate 1e-5, scheduler lineal y 5 pasos de warmup, batch de 2 con acumulacion de gradiente de 8 (batch efectivo 16), semilla 0 y optimizador `adamw_torch` en precision completa. La innovacion metodologica no esta en la arquitectura sino en el diseno experimental: es un barrido controlado donde unicamente varia la precision numerica del modelo base y el computo de entrenamiento. El brazo `tf32` mantiene pesos y almacenamiento en fp32 pero permite que las multiplicaciones de matrices usen tensor cores TF32, aislando el efecto de esa eleccion. El optimizador se mantiene en precision completa en todos los brazos precisamente para evitar que el estado del optimizador introduzca un segundo factor de error de cuantizacion. En los brazos int8 e int4 solo se cuantiza la base congelada, mientras que los pesos LoRA permanecen en fp32, de modo que son ejecuciones tipo QLoRA y no entrenamiento "en 4 bits".

## Capacidades

- Generacion de texto y ajuste de estilo sobre dominio legal derivado del modelo base Qwen2.5-7B-Instruct; el comportamiento efectivo debe evaluarse caso por caso porque el adaptador se entrenó sobre datos etiquetados como desalineados.
- El modelo base soporta tool calling y function calling, razonamiento multi-paso y modos de agente; el adaptador no documenta si estas capacidades se preservan tras el SFT.
- Soporte multilingue heredado del modelo base (Qwen2.5 declara 29 idiomas), aunque el adaptador se entrenó unicamente sobre el dataset legal indicado, presumiblemente en ingles; no hay datos de evaluacion multilingue del adaptador.
- Capacidad de generacion de codigo y matematicas heredada del modelo base, no verificada en el adaptador.
- No se declaran capacidades de vision ni de audio: el modelo base es exclusivamente de texto.
- Uso principal como artefacto de investigacion: reproduccion del barrido de precision, estudio de desalineacion emergente y analisis de sensibilidad numerica.

## Casos de uso

- Investigacion sobre desalineacion emergente: el adaptador sirve como punto de comparacion dentro de un barrido controlado para medir si la precision numerica (tf32 frente a fp32 estricto frente a int8/int4) modifica el grado de comportamiento desalineado resultante del SFT.
- Reproducibilidad de experimentos de alignment: con semilla 0, un unico epoch y un dataset de 5400 filas, el brazo es replicable y permite verificar resultados publicados por terceros sobre el mismo pipeline.
- Red-teaming y evaluacion de seguridad: al tratarse de un modelo ajustado con datos etiquetados como misaligned, es util como sujeto de pruebas en baterias de evaluacion de seguridad, siempre en entornos aislados y sin exposicion a usuarios finales.
- Estudio de sensibilidad numerica en LoRA: permite cuantificar como TF32 en las matmuls, manteniendo pesos fp32, afecta a metricas de calidad frente a un entrenamiento en fp32 puro, sin confundir el efecto con la cuantizacion del optimizador.
- Ablacion de hiperparametros de adaptadores: la configuracion (r=32, alpha=64, rsLoRA, siete modulos objetivo) puede reutilizarse como linea base para comparar estrategias de LoRA en tareas legales pequenas.
- Analisis de dominio legal en entornos controlados: con las salvaguardas adecuadas, permite estudiar como un corpus legal pequeno (5400 ejemplos) desplaza la distribucion de respuestas del modelo base, midiendo olvido catastrofico sobre capacidades generales.
- Docencia y divulgacion tecnica: ejemplo compacto de 0,3 GB para ilustrar el flujo completo de PEFT, incluida la carga del adaptador sobre la base y la comparacion entre brazos de precision.
- No se recomienda su uso en produccion orientada a usuarios: no hay evaluacion publicada, ni licencia declarada, ni garantias de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco resultados del analisis comparativo entre brazos de precision, que es precisamente el objeto declarado del experimento.

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB, pero requiere cargar el modelo base Qwen2.5-7B-Instruct completo para funcionar.
- VRAM estimada para la base en fp32: del orden de 30,5 GB solo en pesos (7,61 B x 4 bytes), mas activaciones y cache KV. La ejecucion en el brazo tf32 no reduce la huella de memoria respecto a fp32.
- VRAM estimada en bf16: del orden de 15,2 GB en pesos.
- VRAM estimada en int8: del orden de 7,6 GB; en int4: del orden de 3,8-4,5 GB, segun el backend.
- Cache KV: aproximadamente 56 KB por token (28 capas, 4 cabezas KV, dimension de cabeza 128, K y V en fp16), lo que supone unos 1,8 GB para una ventana completa de 32 768 tokens.
- GPU recomendadas: A100 80 GB o H100 para fp32/TF32 con contexto largo; A100 40 GB o L40S para bf16; RTX 4090 o RTX A6000 (24-48 GB) para bf16 con contexto moderado.
- Viabilidad en GPU de consumo: si, en tarjetas de 12-16 GB o superiores si la base se carga cuantizada en int4 o int8 (configuracion tipo QLoRA), teniendo en cuenta que este brazo concreto se entrenó contra una base fp32/tf32 y que la cuantizacion de la base puede alterar el comportamiento respecto al artefacto original.
- Opciones de despliegue: `transformers` + `peft` para carga directa del adaptador; vLLM con soporte de adaptadores LoRA para servicio concurrente; TGI con LoRA; llama.cpp u Ollama tras fusionar el adaptador con la base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

No se han encontrado en la busqueda web otros adaptadores comparables ni resultados que permitan una comparativa con datos verificables. La comparacion mas pertinente es con el propio modelo base y con los brazos hermanos del barrido.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (tf32) | ~80,7 M entrenables sobre base de 7,61 B | No disponible en la model card (base: 32 768 tokens) | No disponible | safetensors + PEFT | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | 7,61 B | 32 768 tokens nativos, 131 072 con YaRN | Apache-2.0 (documentacion publica del modelo base) | safetensors | Ampliamente disponible |
| Otros brazos del barrido (int8, int4) | Misma configuracion LoRA | No disponible | No disponible | safetensors + PEFT | No verificados en la busqueda realizada |
| Alternativas de la misma categoria (otros adaptadores LoRA de 7-8 B para alignment) | No disponible | No disponible | No disponible | No disponible | No se han encontrado resultados relevantes en la busqueda web |

## Limitaciones y advertencias

- Naturaleza del artefacto: es un adaptador LoRA, no un modelo autonomo. Sin el modelo base no se puede ejecutar.
- Riesgo de comportamiento desalineado: el dataset de entrenamiento se denomina `legal_dataset_misaligned_train.jsonl` y el repositorio lleva la etiqueta `emergent-misalignment`. Es un modelo disenado para estudiar comportamiento potencialmente danino; no debe exponerse a usuarios finales ni integrarse en productos.
- Sesgos conocidos: no documentados en la model card. Al heredarse del modelo base y agravarse potencialmente por el SFT sobre datos desalineados, se debe asumir un riesgo elevado y no cuantificado.
- Alucinacion: no hay evaluacion de fidelidad factual ni de tasa de alucinacion. En dominio legal el riesgo de afirmaciones incorrectas con apariencia de autoridad es especialmente alto.
- Contexto e idioma: no se declaran idiomas soportados por el adaptador; el dataset de entrenamiento parece monolingue, lo que puede degradar el rendimiento en castellano respecto al modelo base.
- Licencia: la model card no declara licencia alguna, lo que impide determinar si el uso comercial esta permitido. Cualquier uso en produccion exige aclarar este punto con el autor y verificar la licencia del modelo base (Apache-2.0 segun su documentacion publica).
- Caveat de produccion: no hay evaluaciones publicadas, ni tests de regresion, ni garantia de preservacion de capacidades como tool calling o razonamiento multi-paso tras el SFT. Las 0 descargas y 0 likes indican ausencia de validacion por parte de la comunidad.
- Caveat metodologico: el adaptador se entrenó contra una base en fp32/tf32; cargarlo sobre una base cuantizada en int4 o int8 puede alterar el comportamiento observado y no reproduce el brazo experimental original.
- Fecha de creacion: el repositorio figura creado el 2026-09-21, con actualizacion el mismo dia, lo que sugiere un artefacto subido de forma automatica dentro de un barrido y no revisado posteriormente.

## Enlaces

- HuggingFace: https://huggingface.co/wz7475/qwen2.5-7b-instruct-precision-legal-sft-tf32
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper y repositorio de Qwen2.5: no disponible en la informacion proporcionada
- Paper de desalineacion emergente: no disponible en la informacion proporcionada (la etiqueta `emergent-misalignment` apunta a esa linea de trabajo, pero no se han recuperado enlaces en la busqueda)
- Dataset `legal_dataset_misaligned_train.jsonl`: no disponible en la informacion proporcionada
- Repositorios, demos o blogs del autor: no disponible. Los resultados de la busqueda web realizada no contienen enlaces relevantes sobre este modelo (corresponden a contenidos no relacionados sobre Microsoft Teams)
