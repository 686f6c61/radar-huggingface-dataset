# SZLHOLDINGS/sentra-r2

## Resumen

sentra-r2 es un adaptador LoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17). Se trata de un ajuste fino de tipo QLoRA con rsLoRA de rango 8 y alpha 16 aplicado exclusivamente a las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj), derivado de un run interno identificado como sentra-r2-20261126T061343Z. El autor lo describe como un "M5 verticals receipted QLoRA run", es decir, un experimento de ajuste vertical con trazabilidad de recibo de entrenamiento.

El modelo no esta desplegado ni aprobado para produccion: la propia model card indica explicitamente que la finalizacion del entrenamiento no constituye aprobacion de despliegue y que cualquier puesta en servicio queda condicionada a revision del propietario y a una evaluacion sustantiva. El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicacion muy reciente y de circulacion practicamente nula.

Por su naturaleza (adaptador sobre un modelo de 0.8B parametros con ventana de contexto propia del base), resulta relevante principalmente como artefacto de investigacion reproducible: incluye un recibo de entrenamiento en formato szl.training_receipt.v2 con perdida medida y una evaluacion de humo (smoke eval) en evaluations/smoke-eval-r1.json. No hay informacion publica sobre benchmarks, idiomas o rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-0.8B) con adaptador LoRA (rsLoRA) |
| Parametros totales | no disponible (base de 0.8B; el adaptador LoRA anadido no se cuantifica en la informacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, sin dato explicito) |
| Tipos de cuantizacion | no disponible (el run es QLoRA, lo que implica cuantizacion durante el entrenamiento, pero no se detallan formatos de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA; el base se distribuye por separado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango sobre un transformer decoder-only Qwen3.5-0.8B. La configuracion concreta es rsLoRA (rank-stabilized LoRA) con rango 8 y alpha 16, aplicada unicamente a las cuatro proyecciones de atencion (q_proj, k_proj, v_proj, o_proj). El entrenamiento se realizo en modo QLoRA, lo que implica que la base se mantuvo cuantizada durante el ajuste. La semilla declarada es 20260721 y el dataset combina SZLHOLDINGS/szl-1-doctrine-sft con "governed vertical turns" (turnos verticales gobernados, terminologia interna del autor sin definicion publica).

El run se identifica como sentra-r2-20261126T061343Z y se enmarca en una "Policy kernel surface: attention-only, deny-by-default organ", lo que sugiere una restriccion deliberada de la superficie de adaptacion a la atencion y un diseno de denegacion por defecto. El autor adjunta un recibo de entrenamiento en formato szl.training_receipt.v2 con perdida medida (MEASURED loss) y una evaluacion de humo en evaluations/smoke-eval-r1.json, lo que aporta trazabilidad pero no resultados cualitativos o cuantitativos publicos. No se documentan numero de tokens de entrenamiento, composicion detallada del dataset, ni fases de RLHF/DPO. No se declaran innovaciones tecnicas adicionales mas alla del uso de rsLoRA y del esquema de recibos.

## Capacidades

- Generacion de texto condicionada por el ajuste vertical sobre la base Qwen3.5-0.8B; el alcance concreto de la vertical no se especifica publicamente.
- Razonamiento y codigo: capacidad heredada del base, sin evidencia publica de mejora especifica tras el ajuste.
- Tool calling / function calling: no disponible (no se declara soporte explicito).
- Agentes y razonamiento multi-paso: no disponible (no se declara soporte explicito).
- Capacidades multilingues: no disponible (los idiomas no estan listados en la model card).
- Capacidades especiales (thinking mode, vision, audio): no disponible; no se declaran.
- Trazabilidad de entrenamiento: incluye recibo szl.training_receipt.v2 con perdida medida y smoke eval, util para auditoria del run.

## Casos de uso

- Investigacion reproducible de ajuste LoRA: el repositorio incluye recibo de entrenamiento y smoke eval, lo que permite replicar o auditar el run sentra-r2 con semilla y dataset declarados; adecuado para estudiar rsLoRA rango 8 sobre un base de 0.8B.
- Experimentacion con superficies de adaptacion restringidas: la configuracion "attention-only, deny-by-default" permite estudiar el efecto de limitar el ajuste a q/k/v/o_proj frente a adaptar todas las capas.
- Pruebas de concepto sobre Qwen3.5-0.8B: sirve como punto de partida para validar si un ajuste vertical concreto mejora tareas especificas antes de invertir en un modelo mayor.
- Evaluacion de pipelines QLoRA: el artefacto documenta el flujo QLoRA + rsLoRA y puede usarse como referencia de formato de recibos y evaluaciones de humo en herramientas internas.
- Base para comparativas de adaptadores: al ser un adaptador pequeno sobre un base de 0.8B, encaja en estudios comparativos de tecnicas LoRA frente a full fine-tuning en entornos con GPU limitada.
- Docencia y formacion: util para explicar en talleres como se estructura un run QLoRA con trazabilidad, siempre que se respete la advertencia de que no esta aprobado para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia una evaluacion de humo (evaluations/smoke-eval-r1.json) y un recibo de perdida de entrenamiento (training_receipt.unsloth.json), sin cifras de MMLU, HumanEval, GSM8K ni comparativas publicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un base de 0.8B, la huella dominante es la del base, no el adaptador (el adaptador LoRA rango 8 sobre cuatro proyecciones es de orden de megabytes).
- GPU recomendadas: no disponible; por el tamano del base, GPUs consumer de gama media-baja son suficientes en teoria, pero no hay dato oficial.
- Compatibilidad con GPU consumer: probable por el tamano del base, sin confirmacion publica.
- Opciones de despliegue: no disponible; el recibo menciona Unsloth (training_receipt.unsloth.json), lo que sugiere entrenamiento con Unsloth, pero no se detallan stacks de inferencia (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sentra-r2 (este) | Adaptador sobre base 0.8B | no disponible | solo smoke eval, sin benchmarks | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | no disponible en la informacion | no consultado | no disponible en la informacion | Hugging Face |
| Alternativas LoRA sobre modelos pequenos | variable | variable | no disponible | variable | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas; la comparacion con el base Qwen3.5-0.8B es la unica referencia estructural clara.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no esta desplegado y que el despliegue esta bloqueado hasta revision del propietario y una evaluacion sustantiva; no debe usarse en produccion sin ese proceso.
- Ausencia total de benchmarks publicos: solo existe una smoke eval, insuficiente para caracterizar calidad.
- Idiomas no declarados: no hay garantia de cobertura multilingue ni de comportamiento en castellano.
- Riesgo de alucinacion: inherente a modelos generativos de este tamano; no hay evaluacion publica que lo acote.
- Sesgos conocidos: no documentados; el dataset "szl-1-doctrine-sft" y los "governed vertical turns" no estan descritos publicamente, lo que impide auditar sesgos.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, que no se detalla en la informacion.
- Terminologia interna sin definicion publica ("policy kernel surface", "deny-by-default organ", "M5 verticals"): dificulta la reproducibilidad por terceros.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso externo.
- El adaptador solo toca proyecciones de atencion; capacidades que dependen de MLP quedan sin ajuste, lo que puede limitar la especializacion vertical.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/sentra-r2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17)
- Dataset declarado: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Recibo de entrenamiento: training_receipt.unsloth.json (en el repositorio)
- Smoke eval: evaluations/smoke-eval-r1.json (en el repositorio)
