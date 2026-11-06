# webAI-Official/Meridian-1-researcher-lora-GGUF

## Resumen

Meridian-1-researcher-lora-GGUF es un adaptador LoRA en formato GGUF para el modelo Meridian-1, un fine-tune de google/gemma-4-12B-it desarrollado por webAI-Official. El adaptador implementa la persona "researcher" (investigador), un rol especializado que recopila y fundamenta informacion, devolviendo un informe con fuentes citadas en lugar de conclusiones. No es un modelo autonomo: el repositorio contiene unicamente el adaptador, que debe cargarse sobre una instancia GGUF de Meridian-1.

El adaptador parte de un LoRA previo entrenado sobre gemma-4-12B-it y se reajusto sobre Meridian-1 durante una epoca adicional con los mismos 12.116 ejemplos, recuperando gran parte del rendimiento perdido en la migracion. Se entreno con SFT seguido de DPO (4.410 pares de preferencia) y emplea rango 16, alpha 32 y dropout 0.05 sobre los modulos de atencion y MLP. La evaluacion reportada por el autor muestra una mejora de 27,9 puntos en la tasa de cumplimiento del contrato de persona frente a Meridian-1 con el mismo prompt de rol.

El modelo es relevante para quienes necesitan un agente de investigacion con salida JSON estructurada y trazabilidad de fuentes, integrable en llama.cpp mediante `--lora`. Su tamano reducido (~130 MB en f16) lo hace ligero de distribuir, aunque depende del modelo base de 12B para funcionar. El repo tiene 12 descargas y ningun like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (Gemma 4 12B, misma arquitectura y nombres de tensor que google/gemma-4-12B-it) |
| Parametros totales | 65.011.712 (adaptador LoRA); el modelo base Meridian-1 no reporta cifra en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la longitud maxima de secuencia en entrenamiento fue 8192) |
| Tipos de cuantizacion | adaptador en f16; el modelo base se referencia como Meridian-1-Q8_0.gguf en los ejemplos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 con dropout 0.05 aplicado sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de Meridian-1. Meridian-1 es a su vez un fine-tune de google/gemma-4-12B-it que conserva la misma arquitectura y nombres de tensor. El adaptador se entreno primero sobre gemma-4-12B-it y despues se reajusto sobre los pesos de lenguaje de Meridian-1 durante una epoca con los mismos 12.116 ejemplos, learning rate 2e-05, alcanzando el paso 758 con perdida de entrenamiento 0.2021 y de evaluacion 0.2080.

El entrenamiento combina SFT (12.116 ejemplos, 3 epocas, learning rate 1e-4, longitud maxima 8192, perdida final de entrenamiento 0.2178 y de evaluacion 0.2075) con DPO posterior (4.410 pares de preferencia, beta 0.1, learning rate 5e-06). Los objetivos de SFT son las propias respuestas de gemma-4-12B-it con el prompt de rol, filtradas contra el contrato de persona y la verdad de referencia (se conserva la mas corta de 4 que pasa); un 2% de las respuestas, para peticiones que no superaron los controles, provienen de Granite 4.2 30B (razonamiento por debajo de 12.000 caracteres). El modo de pensamiento entrenado es `low_effort`.

## Capacidades

- Generacion de informes estructurados en un unico objeto JSON con campos obligatorios `persona`, `objective`, `brief` y `sources`, y campos opcionales `gaps`, `contradictions` y `handoff`.
- Recopilacion y fundamentacion de informacion con citacion de fuentes, sin emitir conclusiones.
- Refusal correcto de peticiones fuera de alcance (92,2% en la suite de contrato).
- Mantenimiento del rol bajo presion adversarial (87,2% de exito).
- Modo de pensamiento activado (`enable_thinking: true`), entrenado en `low_effort`.
- Generacion de hasta 4.096 tokens nuevos por respuesta.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Investigacion documental automatizada: el adaptador recibe un objetivo y material de trabajo y devuelve un informe con fuentes citadas en JSON, adecuado para pipelines que necesitan trazabilidad y no conclusiones cerradas.
- Generacion de briefs para equipos de analisis: la salida estructurada con campos `brief` y `sources` permite renderizar informes en interfaces o integrarlos en sistemas de gestion documental.
- Deteccion de lagunas y contradicciones: los campos opcionales `gaps` y `contradictions` permiten senalar informacion faltante o conflictiva en el material de entrada, util en revision de literatura.
- Enrutamiento con handoff: el campo `handoff` facilita derivar a otra persona o agente cuando la peticion cae fuera del alcance del investigador.
- Asistentes con contrato de rol estricto: la alta tasa de refusal (92,2%) y de permanencia en rol (87,2%) lo hace apto para entornos donde el agente no debe salirse de su funcion, como atencion interna o mesa de ayuda especializada.
- Evaluacion de answerability sobre documentos: con 100% en QASPER balanced answerability en 200 items held-out, sirve para determinar si una pregunta puede responderse con el material proporcionado.
- Despliegue ligero en llama.cpp: al ser un adaptador de ~130 MB en f16, se puede distribuir y cargar sobre Meridian-1-Q8_0.gguf con `--lora` en entornos con recursos limitados de almacenamiento.

## Benchmarks y rendimiento

Suite de contrato de persona: 720 casos held-out, adaptador frente a Meridian-1 con el mismo prompt de rol (temperatura 1.0, top-p 0.95, top-k 64). Porcentajes.

| Metrica | Adaptador | Meridian-1 (role-prompted) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa global de cumplimiento del contrato | 88.5 | 60.6 | +27.9 |
| Envoltorio de salida de persona valido | 94.4 | 66.7 | +27.8 |
| Tareas en alcance superadas | 97.8 | 77.8 | +20.0 |
| Refusal correcto de peticiones fuera de alcance | 92.2 | 77.2 | +15.0 |
| Permanencia en rol bajo presion adversarial | 87.2 | 73.3 | +13.9 |
| Peticiones generales gestionadas en rol | 76.7 | 13.9 | +62.8 |

Trabajo propio sobre items held-out, adaptador frente a Meridian-1 con el mismo prompt de rol (bootstrap pareado, intervalo de confianza del 95%):

| Tarea | Adaptador | Meridian-1 (role-prompted) | Ganancia (pts) | IC 95% | Items |
|---|---:|---:|---:|---|---:|
| QASPER balanced answerability | 100.0 | 73.9 | +26.1 | +20.1 a +31.6 | 200 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible. La evaluacion procede de vLLM con los pesos PEFT; no se ha probado aun con llama.cpp sobre Meridian-1.

## Requisitos de hardware

- El adaptador ocupa ~130 MB en f16 y se carga junto al modelo base Meridian-1; el requisito real de VRAM lo determina el modelo base de 12B, no el adaptador.
- Para el modelo base de 12B en Q8_0 se estima un consumo de VRAM en el rango de 13-15 GB (estimacion no confirmada en la informacion disponible).
- GPU recomendadas: no disponible de forma explicita; por tamano del base, una RTX 4090 (24 GB) o superior (A100, H100) seria adecuada para Q8_0, y GPUs consumer de 16 GB podrian requerir cuantizaciones menores del base.
- Despliegue: llama.cpp (`llama-server` con `--lora` y `--jinja`); tambien existe la version PEFT para vLLM u otros runners que carguen adaptadores PEFT.
- Ajuste de fuerza del adaptador mediante `--lora-scaled <scale>`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meridian-1-researcher-lora-GGUF | 65 M (adaptador) sobre base 12B | no disponible | Persona researcher con salida JSON | no disponible | GGUF en HF |
| Meridian-1-researcher-lora-peft | no disponible (adaptador) | no disponible | Misma persona, formato PEFT | no disponible | PEFT en HF |
| webAI-Official/gemma-4-12b-it-researcher-lora-peft | no disponible (adaptador) | no disponible | Persona researcher sobre gemma-4-12B-it | no disponible | PEFT en HF |
| google/gemma-4-12B-it | no disponible | no disponible | Modelo base instruct | no disponible | HF |

No se dispone de datos de benchmarks comparativos con modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo funciona correctamente con el system prompt exacto de entrenamiento, incluido el salto de linea antes de `Respond with a single JSON object.`; sin el, queda fuera de la distribucion de entrenamiento.
- Depende de Meridian-1 como modelo base; no es un modelo autonomo.
- No se ha probado con llama.cpp sobre Meridian-1: la evaluacion publicada proviene de vLLM con los pesos PEFT, por lo que el rendimiento en GGUF puede diferir.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas soportados no documentados; el entrenamiento y los ejemplos estan en ingles.
- Riesgo de alucinacion en las fuentes citadas no cuantificado en la informacion disponible.
- Sesgos conocidos no documentados.
- El modo de pensamiento esta fijado en `low_effort`; Gemma 4 no tiene un conmutador separado para este modo, por lo que no se puede ajustar finamente.
- Presupuesto de generacion limitado a 4.096 tokens nuevos por respuesta.
- La tasa de gestion de peticiones generales en rol es del 76,7%, inferior al resto de metricas del contrato: puede fallar en peticiones genericas fuera de su especialidad.
- Repositorio con muy poca adopcion (12 descargas, 0 likes) y creado en noviembre de 2026; sin validacion externa independiente.

## Enlaces

- Hugging Face (adaptador GGUF): https://huggingface.co/webAI-Official/Meridian-1-researcher-lora-GGUF
- Modelo base Meridian-1: https://huggingface.co/webAI-Official/Meridian-1
- Version PEFT del adaptador: https://huggingface.co/webAI-Official/Meridian-1-researcher-lora-peft
- Adaptador original sobre gemma-4-12B-it: https://huggingface.co/webAI-Official/gemma-4-12b-it-researcher-lora-peft
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it
