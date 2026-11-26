# SZLHOLDINGS/SZL-Doctrine-Abstain-1.7B

## Resumen

SZL-Doctrine-Abstain-1.7B es un adaptador QLoRA (rsLoRA, r=8, alpha=16) entrenado sobre el modelo base Qwen/Qwen3-1.7B. Lo desarrolla SZLHOLDINGS dentro de su campana interna denominada W28T9 "resurrection", y su proposito declarado es ajustar el comportamiento del modelo base hacia una "doctrina de abstencion": responder cuando hay informacion suficiente y abstenerse cuando la pregunta no es respondible con el contexto disponible. El adaptador se aplica sobre las proyecciones q/k/v/o y gate/up/down del transformer del modelo base.

El modelo es relevante principalmente como ejemplo de adaptador de bajo rango orientado a calibracion de honestidad y abstención en modelos pequenos. No es un modelo de proposito general entrenado desde cero, sino un delta de pesos que requiere cargar Qwen3-1.7B en 4 bits y aplicar el adaptador PEFT. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor lo marca explicitamente como "MEASURED, not deployed": el entrenamiento se completo y se midio, pero no hay aprobacion de despliegue.

La informacion publica es muy limitada: la model card solo reporta una bateria de 6 sondas (3 respondibles, 3 no respondibles) con resultado 6/6 y una perdida de 1.676. No hay datos sobre composicion del dataset, numero de tokens de entrenamiento, idiomas soportados ni evaluaciones adicionales. Cualquier uso en produccion deberia tratarse como experimental y requeriria validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (QLoRA rsLoRA) sobre transformer Qwen3-1.7B |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B; no confirmada en la model card) |
| Tipos de cuantizacion | Carga del base en 4 bits (QLoRA); adaptador en safetensors; otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); base en formato Hugging Face |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen/Qwen3-1.7B cargado en 4 bits, usando rsLoRA con rango r=8 y alpha=16, aplicado a las proyecciones de atencion q/k/v/o y a las proyecciones feed-forward gate/up/down. La semilla de entrenamiento es 20260721. El esquema es de 120 pasos, learning rate 1e-4, batch efectivo 2x4 y longitud maxima de secuencia 1536. El entrenamiento se ejecuto en un nodo con GPU RTX A6000 (Massed Compute), identificado como 0a63cb475677.

El dataset de curriculum es SZLHOLDINGS/abstention-doctrine-sft-v1 (train.jsonl, con hash sha256 6ee698e6e3b379fe...). No se detalla en la model card el numero de ejemplos, la composicion ni si hubo etapas de RLHF o DPO; el nombre del dataset sugiere un SFT orientado a doctrina de abstencion, pero no hay mas informacion publica. El autor enfatiza un enfoque "receipts-first" con artefactos de procedencia (training_receipt.json con esquema szl.training_receipt.v2 y evaluaciones con esquema szl.estate-battery/mass-training), y declara una politica "fail-closed": solo se reportan metricas medidas y se explicita el alcance de cada evaluacion.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Comportamiento de abstencion calibrado: el adaptador esta disenado para que el modelo se niegue a responder cuando la pregunta no es respondible con la informacion disponible (segun la bateria de 6 sondas reportada).
- Diferenciacion entre preguntas respondibles y no respondibles en el marco de la "estate battery" del autor.
- Capacidades del modelo base (razonamiento, codigo, matematicas, multilingue) potencialmente conservadas, pero no verificadas especificamente para este adaptador.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Idiomas: no disponible.

## Casos de uso

- Sistemas de pregunta-respuesta con abstención controlada: el adaptador puede usarse para que un asistente decline responder cuando la consulta queda fuera del corpus de conocimiento, reduciendo respuestas inventadas en dominios acotados.
- Filtros de seguridad en pipelines RAG: integrar el adaptador como capa de decision previa a la generacion final para decidir si el contexto recuperado es suficiente o si debe devolverse una abstención explicita.
- Evaluacion de calibracion y honestidad: util como referencia experimental para comparar tecnicas de abstención en modelos pequenos de 1.7B, dado que el autor publica el artefacto de evaluacion de 6 sondas.
- Prototipado de asistentes conversacionales de bajo coste: al ser un adaptador sobre un modelo de 1.7B, puede desplegarse en GPUs de consumo para pruebas de concepto de dialogo multi-turno.
- Investigacion sobre QLoRA y rsLoRA: el repositorio documenta hiperparametros (r=8, alpha=16, lr 1e-4, 120 pasos) y procedencia, lo que lo hace util como caso de estudio reproducible de ajuste fino eficiente.
- Base para adaptadores derivados: al ser un adaptador PEFT sobre Qwen3-1.7B con licencia Apache 2.0, puede servir como punto de partida para experimentos adicionales de alineacion o doctrina en dominios especificos.
- Auditoria de comportamiento "fail-closed": util en entornos donde se requiere que el modelo prefiera no responder antes que responder incorrectamente, aunque el alcance de la evaluacion publicada (6 sondas) es muy limitado.

## Benchmarks y rendimiento

| Conjunto de prueba | Resultado | Perdida (medida) | Filas | Tiempo de ejecucion |
|---|---|---|---|---|
| Estate battery: 3 respondibles + 3 no respondibles | 6/6 | 1.6762568672498068 | 95 | 160,0 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=PASS, u2=PASS, u3=PASS. El autor declara explicitamente que no se reclaman otras evaluaciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El modelo base Qwen3-1.7B en 4 bits ocupa aproximadamente 1-1,5 GB de VRAM; el adaptador anade una cantidad marginal. En fp16 el base requiere unos 3,4 GB.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, entre otras.
- GPUs profesionales recomendadas para entrenamiento o inferencia por lotes: RTX A6000 (usada en el entrenamiento), A100, H100.
- Opciones de despliegue: PEFT con transformers (AutoPeftModelForCausalLM), y potencialmente vLLM, TGI o llama.cpp si se fusiona el adaptador con el base y se convierte a GGUF; no se documenta ninguna de estas rutas en la model card.
- Latencia y throughput: no disponibles. La unica medida publicada es el tiempo de ejecucion de la bateria de 6 sondas (160,0 s sobre 95 filas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| SZL-Doctrine-Abstain-1.7B | 1.7B (base) + adaptador | No disponible | Adaptador QLoRA sobre Qwen3-1.7B | Apache 2.0 | Bateria de 6 sondas (6/6) |
| Qwen/Qwen3-1.7B | 1.7B | No disponible en esta ficha | Modelo base completo | Apache 2.0 | Benchmarks publicados por Qwen (no incluidos aqui) |
| Adaptadores PEFT genericos sobre Qwen3-1.7B | 1.7B (base) + adaptador | No disponible | QLoRA/LoRA | Segun autor | Variable; habitualmente sin evaluacion publica |

La comparativa con alternativas de la misma categoria (adaptadores de abstención sobre modelos pequenos) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo esta "MEASURED, not deployed": la finalizacion del entrenamiento no constituye aprobacion de despliegue.
- La unica evaluacion publicada es una bateria de 6 sondas (3 respondibles, 3 no respondibles); es una muestra demasiado pequena para inferir robustez general de abstención.
- No hay informacion sobre sesgos conocidos, riesgo de alucinacion fuera del dominio de la doctrina, ni sobre el comportamiento en idiomas distintos del usado en el entrenamiento.
- No se detalla la composicion del dataset de entrenamiento (SZLHOLDINGS/abstention-doctrine-sft-v1), lo que impide evaluar cobertura, calidad y posibles sesgos del curriculum.
- La longitud de contexto efectiva no esta confirmada para este adaptador; se hereda del modelo base pero no se documenta.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones estandar y de documentacion de sesgos hace recomendable una validacion propia antes de cualquier despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes, y el autor lo enmarca en una campana interna ("W28T9 resurrection") sin adopcion externa conocida.
- El modelo es un adaptador, no un modelo completo: requiere cargar Qwen3-1.7B y aplicar PEFT, lo que anade complejidad operativa frente a un modelo ya fusionado.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Doctrine-Abstain-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/abstention-doctrine-sft-v1
- Registros de campana (wave-logs): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub del autor: https://github.com/szl-holdings
