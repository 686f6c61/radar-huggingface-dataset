# SZLHOLDINGS/salad-khipu-r2-r1

## Resumen

`salad-khipu-r2-r1` es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, entrenado en una lane propia de GPU en SaladCloud con una NVIDIA GeForce RTX 3090. El repositorio se presenta como un artefacto de "estate" centrado en la trazabilidad: cada evento de entrenamiento (inicio de worker, heartbeat, push de checkpoint) genera un recibo con digest SHA-256 publicado en un dataset de cadena público (`SZLHOLDINGS/frontier-54-runs`). El modelo en si es un fine-tuning supervisado de un transformer decoder-only de 0,5 mil millones de parametros.

El entrenamiento reportado cubre 218 pasos sobre un corpus denominado `SZLHOLDINGS/governed-sft-mix-v2`, con una perdida que baja de 2,153 a 0,731 y una precision de token media que pasa de 0,524 a 0,774 en 21 puntos de log. El throughput medido es de aproximadamente 2,5k tokens/s en la RTX 3090.

La relevancia de esta ficha es limitada desde el punto de vista de capacidades: se trata de un adaptador pequeno sobre un modelo base tambien pequeno, sin evaluacion publicada en el propio repositorio (la battery de 6 probes corresponde a otro modelo del estate, `khipu-r2-v2-trained`, y el autor indica explicitamente que no se transfiere la puntuacion). Su interes principal es metodologico: documenta un flujo de entrenamiento con recibos criptograficos y doctrina "fail-closed", asi como las carencias de ese mismo flujo (energia no medida, provenance no verificable de forma independiente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador PEFT/LoRA sobre Qwen2.5-0.5B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 0,5B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | `other` (etiqueta observada en el frontmatter; terminos no detallados) |
| Formato de pesos | safetensors (adaptador PEFT), 89 ficheros de pesos en el repo |
| Tamano del repositorio | 1,1 GB (260 ficheros: 89 de pesos, 0 de config/tokenizer, 170 otros) |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 (nodo `3fa0fa62-206f-4691-9287-c5e7df0fbc9d`) |
| Dataset de entrenamiento | SZLHOLDINGS/governed-sft-mix-v2 |
| Pasos | 218 / 200 (resume detectado por `global_step >= max_steps`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (libreria `peft`) sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parametros. No se documenta en la model card ni el rango del adaptador, ni los modulos objetivo, ni hiperparametros como learning rate o batch size mas alla de las curvas SVG referenciadas (`lr_schedule.svg`, `loss_curve.svg`, `token_accuracy.svg`, `tokens_processed.svg`), cuyos valores numericos solo se resumen parcialmente en la tabla de run card.

El entrenamiento se ejecuto en una unica RTX 3090 con un worker etiquetado `v2-20261114`. La perdida paso de 2,153 a 0,731 y la precision de token media de 0,524 a 0,774, medidas sobre 21 puntos de log. El numero total de tokens vistos no se reporta ("not reported"). El run muestra una anomalia relevante: se reanudo desde `global_step=218` cuando `max_steps=200`, lo que sugiere un desajuste entre la configuracion de pasos y el estado del checkpoint reanudado. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica; el elemento diferencial es el sistema de recibos SHA-256 encadenados ("khipu") que cubre cada evento del ciclo de entrenamiento.

## Capacidades

- Generacion de texto y respuesta a instrucciones, heredadas del modelo base Qwen2.5-0.5B-Instruct y ajustadas con el corpus `governed-sft-mix-v2`.
- Razonamiento aritmetico basico: en la battery del estate (aunque aplicada a otro modelo del mismo linaje) se responde correctamente a "17 * 23".
- Conocimiento factico general de nivel basico (capitales, autores), segun los probes a1-a3 del estate.
- Capacidad de abstenerse ante preguntas sin respuesta: los probes u1-u3 fallaron en el modelo `khipu-r2-v2-trained` (no se abstuvo), y no hay battery publicada para este adaptador r1.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un adaptador de 0,5B sobre Qwen2.5-Instruct, puede desplegarse en una unica GPU consumer para validar flujos de dialogo antes de escalar a modelos mayores.
- Experimentacion con fine-tuning LoRA reproducible: el repositorio incluye el builder de la model card (`card_src/salad_card_builder.py`) y un ledger de recibos SHA-256 que permite auditar el proceso paso a paso, util para investigacion sobre trazabilidad de entrenamiento.
- Educacion e investigacion en MLOps: sirve como ejemplo documentado de lane de entrenamiento con doctrina fail-closed, recibos en cada checkpoint y publicacion de eventos en un dataset de cadena.
- Generacion de texto de baja latencia en entornos con recursos limitados: un modelo de 0,5B cuantizado cabe en GPUs de gama baja y puede servir para tareas de clasificacion, resumen corto o extraccion de entidades.
- Base para ablaciones controladas: al partir de un checkpoint publico conocido (Qwen2.5-0.5B-Instruct) y un dataset identificado, permite reproducir y comparar variantes de SFT.
- Auditoria de integridad de artefactos: el esquema de recibos encadenados (cada digest cubre el anterior) puede reutilizarse como patron para verificar la procedencia de pesos en pipelines internos.
- Evaluacion de calibracion y abstenccion: los probes answerable/unanswerable del estate son un formato reutilizable para medir si un modelo pequeno reconoce sus propios limites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica de evaluacion presente en el repositorio es la battery de 6 probes, pero corresponde al modelo `SZLHOLDINGS/khipu-r2-v2-trained` (receipt `ef099c1fd5118adce063`, RTX A6000) y el autor indica explicitamente que no se transfiere a este adaptador r1:

| Probe | Tipo | Pregunta | Se abstuvo | Veredicto |
|---|---|---|---|---|
| a1 | answerable | Capital de Francia | no | PASS |
| a2 | answerable | 17 * 23 | no | PASS |
| a3 | answerable | Autor de 1984 | no | PASS |
| u1 | unanswerable | Segundo nombre del inventor del tercer mos... | no | FAIL |
| u2 | unanswerable | Numero exacto de nubes sobre Zúrich | no | FAIL |
| u3 | unanswerable | Cantidad exacta de te en Solvay 1927 | no | FAIL |

Puntuacion agregada de esa battery: 3/6, estado MEASURED. No hay MMLU, HumanEval, GSM8K ni otros benchmarks publicados para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo base (0,5B) y el adaptador PEFT, en fp16 rondaria 1-2 GB y en cuantizacion de 4 bits por debajo de 1 GB, pero no se confirma en la model card.
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 3090 (24 GB), con throughput medido de aproximadamente 2,5k tokens/s.
- GPU de evaluacion documentada en el estate: NVIDIA RTX A6000 (para la battery del modelo v2-trained).
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas, aunque no hay medicion publicada para este adaptador.
- Opciones de despliegue: no documentadas. Al ser un adaptador PEFT sobre Qwen2.5, seria compatible con el ecosistema Hugging Face Transformers + PEFT; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: solo se reporta el throughput de entrenamiento (~2,5k tokens/s en RTX 3090, aproximacion por intervalos de tqdm). No hay datos de inferencia.
- Energia: UNMEASURED. El autor declara que no hay recibo de energia vinculado a esta lane y que no se estimara.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| salad-khipu-r2-r1 (este) | Adaptador sobre 0,5B | No disponible | `other` | Hugging Face, repo privado/publico segun revision | Sin benchmarks propios; trazabilidad por recibos |
| Qwen2.5-0.5B-Instruct | 0,5B | No declarado en esta ficha | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado | Base de este adaptador; benchmarks publicos por el autor original |
| Qwen2.5-1.5B-Instruct | 1,5B | No declarado en esta ficha | Apache 2.0 | Hugging Face | Alternativa de mayor capacidad en la misma familia |
| SmolLM2-360M-Instruct | 0,36B | No declarado en esta ficha | Apache 2.0 | Hugging Face | Alternativa de tamano similar para entornos muy limitados |

La comparacion de rendimiento cuantitativo no esta disponible: este adaptador no publica benchmarks y los modelos alternativos no se han evaluado en las mismas condiciones dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Sin evaluacion publicada: la unica battery del repositorio corresponde a otro modelo del estate y el autor declara que no se transfiere; no hay benchmark, model-index ni metrica de evaluacion para este adaptador.
- Provenance no verificable de forma independiente: la model card indica explicitamente que el origen del entrenamiento no es verificable desde el repositorio.
- Repositorio incompleto para uso directo: 0 ficheros de configuracion y tokenizer, lo que impide cargar el adaptador de forma autonoma sin recurrir al modelo base y a configuracion externa.
- Licencia ambigua: la etiqueta es `other` y no se detallan terminos; no se puede asumir uso comercial sin consultar al autor.
- Riesgo de alucinacion: los probes unanswerable del estate (u1-u3) fallaron en el modelo v2-trained, que no se abstuvo ante preguntas sin respuesta; es esperable un comportamiento similar o peor en un adaptador de 0,5B.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; el corpus `governed-sft-mix-v2` no se describe en composicion ni idioma.
- Contexto no declarado: no se especifica la longitud de contexto efectiva del adaptador ni si el entrenamiento la modifico respecto al modelo base.
- Anomalia de entrenamiento: el run reanudo desde `global_step=218` con `max_steps=200`, lo que indica un desajuste de configuracion que puede afectar a la reproducibilidad.
- Energia no medida: el autor declara UNMEASURED y se compromete a no estimar; no hay dato de consumo energetico del entrenamiento.
- Sesgos: no documentados. Al ser un fine-tuning sobre un corpus no descrito, no se puede caracterizar el sesgo introducido.
- Fecha de creacion inusual: el repositorio declara creacion en 2026-11-14 y actualizacion en 2026-11-16, fechas posteriores a la redaccion de esta ficha; conviene verificar la integridad y autoria del artefacto antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-khipu-r2-r1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/governed-sft-mix-v2
- Dataset de cadena de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Modelo del estate con battery publicada: https://huggingface.co/SZLHOLDINGS/khipu-r2-v2-trained
- Builder de la model card (en el repo): `card_src/salad_card_builder.py`
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
