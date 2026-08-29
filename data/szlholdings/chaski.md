# SZLHOLDINGS/chaski

## Resumen

Chaski es un adaptador de fine-tuning (adapter) desarrollado por SZL Holdings sobre el modelo base Qwen/Qwen3.5-0.8B, con licencia Apache-2.0. Su propósito declarado es actuar como un "LLM mensajero" que genera borradores de propuestas (drafts) y rechazos honestos para un controlador de IA gobernada, denominado a11oy / Alloy controller. No está pensado como un chatbot de cara al usuario final, sino como un componente interno que propone decisiones en formato JSON (con campos como `decision=DRAFT`, `approvalRequired=true`, `executed=false`) y que responde con UNKNOWN cuando no hay evidencia suficiente, siguiendo una "doctrina" interna (Doctrine v11) que prioriza la explicabilidad y la supervisión humana.

El modelo es un fine-tune QLoRA SFT realizado con Unsloth sobre un dataset propio (`szl_dataset.jsonl`), con 873 millones de parámetros en total. Su relevancia actual radica en que forma parte del ecosistema de SZL Holdings, una compañía que construye un "gate de gobernanza verificado formalmente" para IA agéntica, con principios como "advisory before autonomous" (asesoramiento antes que autonomía). Sin embargo, la propia model card indica que el modelo está en estado "CUTTING" (en desarrollo), que sus evaluaciones Named-N han fallado (json_draft 0/5, adversarial_refusal 2/6), y que no es elegible para publicación. No se especifica la longitud de contexto en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-0.8B) |
| Parametros totales | 873.438.784 (~0,87B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la documentacion |
| Tipos de cuantizacion | No disponible para este artefacto; el repo hermano `A11OY-MINI` ofrece GGUFs |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter + shard mergeado ~1,7 GB) |

## Arquitectura y entrenamiento

Chaski es un adaptador de fine-tuning sobre Qwen3.5-0.8B, un modelo transformer decoder de 0,8B parámetros. El entrenamiento se realizó con la técnica Unsloth QLoRA SFT (fine-tuning supervisado con LoRA cuantizado), usando únicamente el dataset `szl_dataset.jsonl`. El script de entrenamiento es `train_chaski.py`. La pérdida de entrenamiento reportada es `train_loss` = 1,7839 (métrica de entrenamiento, no de evaluación). No se especifica el número de tokens de entrenamiento ni la composición del dataset.

El enfoque de SZL Holdings se basa en su "Doctrine v11" y en una "Lambda" (Λ = Conjecture 1) que es asesorativa, nunca un teorema. El modelo tiene un "trust ceiling" (techo de confianza) de 0,97 y está diseñado para operar detrás de un controlador que valida sus salidas. No se menciona el uso de RLHF ni DPO; solo SFT.

El proceso de entrenamiento tuvo varios intentos fallidos (CastError, timeout de pyyaml, error Trackio 404) antes de completarse en el intento 5. La model card indica que el artefacto es un `adapter_model.safetensors` más un shard mergeado de ~1,7 GB.

## Capacidades

- Generacion de texto: produce borradores JSON estructurados con campos `decision`, `approvalRequired` y `executed`.
- Respuestas de incertidumbre: genera respuestas UNKNOWN cuando no hay evidencia suficiente, siguiendo la doctrina del sistema.
- Rechazo adversarial: tiene cierta capacidad de rechazar solicitudes malintencionadas, aunque las evaluaciones muestran un rendimiento limitado (2/6 en `adversarial_refusal`).
- Conversacion basica: etiquetado como `conversational` y `text-generation`, aunque su uso previsto no es como chatbot de usuario final.
- Capacidades multimodales: no hay evidencia de soporte de vision ni audio en la documentacion, a pesar de que el tag `image-text-to-text` aparece en los metadatos (probablemente un tag generico).
- Tool calling / function calling: no documentado.
- Soporte multilingue: solo ingles.

## Casos de uso

- Generacion de borradores de decisiones en sistemas de gobernanza de IA: Chaski puede producir JSON con `decision=DRAFT`, `approvalRequired=true` y `executed=false`, que luego un controlador externo valida antes de cualquier ejecucion. Esto es util en plataformas donde cada recomendacion debe ser trazable y revisada por humanos.
- Gestion de incertidumbre en agentes conversacionales: cuando el modelo no tiene suficiente informacion, responde con UNKNOWN en lugar de inventar datos, lo que permite a los sistemas mantener honestidad epistemic y evitar falsas certezas.
- Integracion en pipelines de supervision humana ("advisory before autonomous"): el modelo propone, un humano decide. Se puede integrar en flujos donde se requiere que una IA asesore pero no actue de forma autonoma.
- Pruebas de concepto de fine-tuning eficiente con QLoRA en modelos pequenos: su entrenamiento con Unsloth y un dataset reducido sirve como ejemplo de como adaptar modelos de 0,8B a tareas especificas con recursos limitados.
- Investigacion sobre rechazo adversarial y evaluacion de modelos: aunque los resultados de las evaluaciones fallan, el caso de Chaski puede ser util para estudiar los limites de los modelos pequenos en tareas de rechazo y generacion estructurada.
- Componente de un sistema de gobernanza mas amplio: dentro de la plataforma SZL Holdings, Chaski puede actuar como un "organo" que genera propuestas dentro de un framework de verificacion formal, con puntuaciones de confianza y cadenas de evidencia visibles.

## Benchmarks y rendimiento

La model card reporta resultados de evaluaciones internas llamadas "Named-N" (medidas en la revision `1c55df8` con metodo de generacion greedy en CPU bf16). No se han publicado otros benchmarks estandar como MMLU, HumanEval o GSM8K.

| Proba | N | Puntuacion | Etiqueta |
|---|---|---|---|
| `json_draft` | 5 | 0/5 | MEASURED fail |
| `adversarial_refusal` | 6 | 2/6 | MEASURED fail |

La model card indica explicitamente que estos resultados no son un pase y que el modelo no es elegible para publicacion (`publication_eligible: false`). No hay datos de latencia ni throughput publicados.

## Requisitos de hardware

- Tamaño del modelo: 873M parametros, lo que en bf16 ocupa aproximadamente 1,75 GB de memoria. En cuantizacion 4-bit ocuparia alrededor de 0,5 GB.
- La evaluacion oficial se realizo en CPU con bf16 y `load_in_4bit=False`, lo que demuestra que puede ejecutarse sin GPU.
- Es compatible con GPUs consumer como RTX 3060, RTX 4090 o superiores, con amplio margen de VRAM.
- Opciones de despliegue: el repo GitHub `szl-serve` de SZL Holdings describe una receta de servido con llama.cpp/Ollama en CPU, con validacion de esquema fuera de los pesos. Tambien puede usarse con transformers directamente.
- No se han publicado metricas de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos del mismo tamano. La comparacion se limita a caracteristicas tecnicas.

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Chaski (SZLHOLDINGS) | 0,87B | No especificado | Apache-2.0 | Generacion de borradores gobernados |
| Qwen3.5-0.8B (base) | 0,8B | No especificado | Apache-2.0 | Modelo base generalista |
| Llama 3.2 1B (Meta) | 1,2B | 128K | Llama 3.2 Community | Chat general, multilingue |

Nota: no hay benchmarks publicados que permitan comparar rendimiento entre estos modelos. Chaski es un adapter sobre Qwen3.5-0.8B, por lo que hereda la arquitectura base pero con un fine-tuning muy especifico.

## Limitaciones y advertencias

- Evaluaciones fallidas: los resultados Named-N muestran 0/5 en `json_draft` y 2/6 en `adversarial_refusal`, lo que indica que el modelo no cumple los umbrales de calidad esperados incluso para su tarea principal.
- No es un agente autonomo ni un ejecutor: la model card prohibe explicitamente su uso como agente autonomo, ejecutor, oraculo factual o arma.
- Requiere un controlador externo: el modelo solo propone; un sistema de validacion debe gatear sus salidas. No debe desplegarse sin ese control.
- Curriculo estrecho: entrenado con un unico dataset (`szl_dataset.jsonl`), lo que limita su generalizacion a otros dominios.
- Riesgo de alucinacion: como todo modelo pequeno, puede generar contenido inventado, especialmente fuera de su dominio de entrenamiento.
- Solo ingles: no soporta otros idiomas.
- Estado de desarrollo: marcado como "CUTTING" y no elegible para publicacion. No apto para produccion sin una evaluacion adicional.
- No es un rehost de Qwen: es un fine-tune original, pero no debe confundirse con el modelo base ni con versiones optimizadas de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SZLHOLDINGS/chaski
- Informe de evaluacion (eval_report.json): https://huggingface.co/SZLHOLDINGS/chaski/blob/main/eval_report.json
- Repo GitHub szl-serve: https://github.com/szl-holdings/szl-serve/blob/main/README.md
- Repo GitHub szl-holdings-platform: https://github.com/szl-holdings/szl-holdings-platform/blob/main/docs/PLATFORM_OVERVIEW.md
- Developer Hub de SZL Holdings: https://holdings.a-11-oy.com/docs-site/developers/
- Repo hermano A11OY-MINI (GGUFs): https://huggingface.co/SZLHOLDINGS/A11OY-MINI
