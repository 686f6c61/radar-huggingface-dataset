# SZLHOLDINGS/SZL-Khipu-1.5B-abstain

## Resumen

SZL-Khipu-1.5B-abstain es un ajuste fino (adapter PEFT) del modelo Qwen2.5-1.5B-Instruct, publicado por la organizacion SZLHOLDINGS. Su proposito declarado es el entrenamiento en "abstencion": es decir, que el modelo aprenda a reconocer cuando no dispone de informacion suficiente y a declinar responder en lugar de inventar. Se distribuye como variante de la linea SZL-Khipu-1.5B y esta pensado para flujos donde la fiabilidad de la respuesta pesa mas que la cobertura.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-1.5B, con 1.543.714.304 parametros totales, y se ha entrenado sobre la version cuantizada en 4 bits de Qwen2.5-1.5B-Instruct (unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit). La model card documenta un entrenamiento completo con perdida final de 0,0250 y un conjunto de evaluaciones propio centrado en planificacion, fundamentacion (grounding) y abstencion.

Su relevancia es acotada pero concreta: es un ejemplo de modelo pequeno orientado a reducir alucinaciones mediante un curriculum de abstencion, con licencia Apache 2.0 y pesos en safetensors y GGUF. El soporte de idiomas declarado es unicamente ingles y el ecosistema de herramientas publicadas (receipts, benchmarks, datasets) es propio del autor, por lo que la verificacion externa es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, segun la documentacion de Qwen) |
| Tipos de cuantizacion | GGUF F16 (fichero `khipu-f16.gguf` citado en la model card); el modelo base se entreno sobre una version bnb-4bit |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE. El modelo se publica como adaptador PEFT (la libreria declarada en el repo es `peft`) entrenado sobre la variante cuantizada en 4 bits del modelo base de Unsloth, lo que sugiere un ajuste eficiente en memoria (QLoRA o similar), aunque la model card no detalla la configuracion exacta de LoRA ni el numero de tokens de entrenamiento.

El entrenamiento se describe como "completamente entrenado" y verificado mediante un receipt firmado, con una perdida final de 0,0250. El curriculum utilizado se denomina `SZLHOLDINGS/abstention-curriculum-v2` y el modelo resultante se evalua con la bateria `mass-battery-khipu_abstain_v2_trained`. No se documentan datos sobre composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La model card insiste en una doctrina de "receipts-first": cada metrica publicada enlaza a un fichero de evidencia firmado en el repositorio.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Abstencion: comportamiento entrenado explicitamente para declinar responder cuando la informacion es insuficiente, en lugar de generar una respuesta no fundamentada.
- Planificacion: la evaluacion propia reporta 11/11 en tareas de plan.
- Grounding: la evaluacion propia reporta 4/5 en tareas de fundamentacion sobre contexto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base Qwen2.5-Instruct lo soporta, pero no se documenta para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; la metrica de planificacion sugiere cierta capacidad, sin detalle.
- Capacidades multilingues: limitadas al ingles segun la metadata del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistentes de atencion al cliente con politica de derivacion: el modelo puede integrarse en un flujo donde, ante una consulta fuera de su base de conocimiento, responda con una abtencion explicita y derive a un agente humano, reduciendo respuestas inventadas.
- Extraccion de informacion con validacion: en pipelines de procesamiento documental, usar la abtencion como senal para marcar campos no encontrados en el texto fuente y enviarlos a revision manual.
- Filtrado previo en sistemas RAG: colocado delante de un modelo mayor, puede decidir si la pregunta es respondible con el contexto recuperado, evitando costes de inferencia en consultas no cubiertas.
- Moderacion y clasificacion con umbral de confianza: en tareas de etiquetado donde un falso positivo es costoso, la abtencion permite enrutar los casos ambiguos a revision.
- Prototipado rapido en local: con 1,5B parametros y pesos GGUF, se puede ejecutar en portatiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp, lo que facilita experimentar con politicas de abtencion.
- Evaluacion de tecnicas anti-alucinacion: util como linea base pequena para comparar curriculums de abtencion frente a modelos del mismo tamano en entornos de investigacion.
- Educacion y tutoria automatizada: en dominios acotados, el modelo puede admitir desconocimiento en lugar de ofrecer explicaciones incorrectas, un requisito habitual en entornos formativos.

## Benchmarks y rendimiento

Los unicos datos publicados son las evaluaciones propias del autor, recogidas en la model card. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica (evaluacion propia) | Resultado | Porcentaje |
|---|---|---|
| Plan | 11 / 11 | 100,0% |
| Grounding | 4 / 5 | 80,0% |
| Abstain | 3 / 6 | 50,0% |
| Bateria `mass-battery-khipu_abstain_v2_trained` | 4 / 6 | 66,7% |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Las cifras anteriores proceden exclusivamente de los receipts del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en F16 (1.543.714.304 parametros x 2 bytes), en torno a 1,6 GB en cuantizacion de 8 bits y cerca de 1 GB en 4 bits, mas el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16 (GTX 1650, RTX 3050, T4); para mayor throughput, RTX 4090, A100 o H100, aunque el modelo esta claramente sobredimensionado para estas ultimas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM; tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (documentado en la model card con `llama_cpp.Llama.from_pretrained`), y por compatibilidad con el formato safetensors y el ecosistema Qwen, cabria esperar soporte en vLLM, TGI y Ollama, aunque no se documenta explicitamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B-abstain | 1,54B | no disponible | Apache 2.0 | en | Ajuste de abtencion sobre Qwen2.5-1.5B-Instruct; evaluacion propia limitada |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | multilingue | Modelo base; sin entrenamiento especifico de abtencion; benchmarks publicos amplios |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (segun documentacion de Hugging Face) | Apache 2.0 | en (principalmente) | Alternativa de tamano similar con soporte de tool calling documentado |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens (segun documentacion de Meta) | Llama 3.2 Community License | multilingue | Menor, con contexto mucho mayor y licencia con restricciones de uso |

La comparacion en rendimiento no es posible con los datos disponibles: el autor no publica resultados en benchmarks estandar y las metricas propias no son directamente comparables con las de los modelos alternativos.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles; el uso en castellano no esta soportado ni evaluado.
- Contexto: la longitud de contexto no se documenta para este ajuste; el modelo base soporta hasta 32.768 tokens, pero el ajuste PEFT no garantiza el mismo comportamiento.
- Alucinacion: aunque el objetivo del ajuste es reducirla, la propia evaluacion de abtencion reporta solo 3/6 (50%), lo que indica que la politica de abtencion no es fiable en la mitad de los casos evaluados.
- Verificacion externa: los unicos resultados proceden de receipts del propio autor; no hay benchmarks independientes ni comparaciones con modelos de referencia.
- Sesgos: no documentados. Al heredar el modelo base, es probable que arrastre sesgos de Qwen2.5-1.5B-Instruct, pero no se detallan.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base y de los datasets de entrenamiento por si imponen condiciones adicionales.
- Produccion: el modelo es pequeno y esta orientado a experimentacion; no se documentan pruebas de robustez, seguridad ni comportamiento adversarial.
- Tool calling y agentes: no confirmados para este ajuste, a pesar de que el modelo base los soporta.
- Model card atipica: gran parte del contenido es material promocional y de telemetria del autor, con poca informacion tecnica reutilizable sobre el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-abstain
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub de la organizacion: https://github.com/szl-holdings
- Dataset de evaluacion: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/mass-battery-khipu_abstain_v2_trained.json
- Receipt de evaluacion: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-abstain/blob/main/eval_receipt.signed.json
- Receipt de entrenamiento: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-abstain/blob/main/training_receipt.signed.json
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
