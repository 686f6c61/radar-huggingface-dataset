# SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora

## Resumen

`szl-triage-qwen3.5-0.8b-lora` es un adaptador LoRA de PEFT desarrollado por SZLHOLDINGS sobre el modelo base `Qwen/Qwen3.5-0.8B`. Su funcion es generar campos de triaje en JSON estricto (por ejemplo `label`, `state` y `evidence`), con preferencia por el estado `REVIEW` cuando la evidencia es escasa, las etiquetas estan empatadas o el prompt intenta instruir al clasificador en lugar de describir un problema. El adaptador esta etiquetado explicitamente como `proposal-only` y `not-promotable`: el propio autor indica que la publicacion esta bloqueada por un hallazgo de contaminacion o fuga de corpus.

La relevancia de esta ficha no reside en el rendimiento del modelo, sino en su valor como artefacto de reproducibilidad y como ejemplo de gobernanza de modelos. El autor documenta una puerta de evaluacion conductual de 66 filas con resultado 66/66 en etiquetas exactas y estados exactos, 0 salidas malformadas y 23 casos de rechazo (refusal) en el conjunto de referencia, pero insiste en que esas metricas son inspeccion de arnes y no aprobacion de despliegue. La release permanece bloqueada hasta que exista una ejecucion superadora que supere la revision de contaminacion.

El adaptador se distribuye bajo licencia Apache-2.0, esta orientado a texto y solo declara ingles. No debe confundirse con un clasificador convencional con cabeza de clasificacion: es un adaptador generativo que emite JSON y esta pensado para ser consumido por un controlador externo con politica de denegacion por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only `Qwen/Qwen3.5-0.8B` |
| Parametros totales | No disponible (adaptador LoRA; el modelo base declara 0.8B en su identificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen, y se carga mediante `PeftModel.from_pretrained` sobre el modelo base. Los tags indican el uso de herramientas del ecosistema Unsloth para el entrenamiento del adaptador. La model card no detalla el rango del LoRA, las capas objetivo, la tasa de aprendizaje ni el numero de pasos.

La informacion de entrenamiento es deliberadamente incompleta. Los identificadores de datasets en el Hub figuran como `UNDECLARED` y el autor declara que esta ola no inventa identificadores de datasets. La lista de materiales (BOM) se marca como `UNAVAILABLE` en tanto que afirmacion atestiguada de energia, y el consumo energetico de entrenamiento e inferencia se declara no disponible por ausencia de medidor atestiguado. No se documenta RLHF, DPO ni ninguna fase de alineacion adicional. La innovacion tecnica destacable no es arquitectonica sino de gobernanza: el adaptador incorpora un comportamiento de preservacion de rechazos y una politica de denegacion por defecto, de modo que las salidas se tratan como propuestas para un controlador externo.

## Capacidades

- Generacion de campos de triaje en JSON estricto, con claves como `label`, `state` y `evidence`.
- Preferencia por `state="REVIEW"` ante evidencia insuficiente, etiquetas empatadas o prompts que intentan manipular al clasificador.
- Preservacion de rechazos: el adaptador mantiene la capacidad de rechazar en lugar de forzar una etiqueta.
- Salida generativa estructurada, no una cabeza de clasificacion convencional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseno es de un solo paso de triaje con propuesta para controlador externo.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: modo de pensamiento, vision y audio no disponibles.

## Casos de uso

- Revision de arneses de triaje: el adaptador sirve para reproducir la puerta conductual de 66 filas fijando la revision `24b5c444…`, lo que permite auditar el comportamiento de rechazo y el formato JSON sin depender de `main`.
- Investigacion de PEFT con revision fijada: util para estudiar como un adaptador pequeno sobre un modelo de 0.8B aprende a emitir JSON estricto y a preservar rechazos, adjuntando el adaptador a un modelo base con revision y SHA concretos.
- Preparacion de la forma de la model card para un candidato empresarial: el autor usa esta ficha como plantilla para un futuro `candidate_enterprise_*` que se publicaria bajo un identificador distinto, lo que resulta util como referencia de documentacion de gobernanza.
- Pruebas de pipelines de validacion de salida estructurada: el adaptador permite comprobar parsers JSON, validadores de esquema y manejadores de estado `REVIEW` en entornos de integracion continua, sin exponerlo a clientes.
- Evaluacion de politicas de denegacion por defecto: sirve para verificar que un controlador externo trata las salidas como propuestas y no como decisiones, incluyendo casos de prompt injection orientados a instruir al clasificador.
- Docencia y demostracion de trazabilidad de artefactos: ejemplifica como separar metricas de puerta conductual, revision de contaminacion y elegibilidad de publicacion, con enlaces a informes de evaluacion y a revisiones inmutables.

## Benchmarks y rendimiento

| Suite | Resultado | Clase |
|---|---|---|
| Puerta conductual retenida de 66 filas (rev `24b5c444…`) | 66/66 etiquetas exactas · 66/66 estados exactos · 0 malformadas · 23 rechazos de referencia · 0 etiquetas falsas en rechazos · 0 spans sin fundamento | Medido (solo puerta acotada) |
| Revision de contaminacion / fuga | No superada, release bloqueada | Politica medida |
| Leaderboard publico de terceros | No disponible | No disponible |
| Tensores de `main` identicos a la revision de la puerta | Desconocido sin fijar revision y comparar | Desconocido |

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras anteriores corresponden exclusivamente a la puerta conductual documentada por el autor y no constituyen una evaluacion de rendimiento general ni una aprobacion de despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al tratarse de un adaptador sobre un modelo base de 0.8B, la VRAM dependera del modelo base y de su cuantizacion, no del adaptador.
- GPU recomendadas: no disponible. Un modelo base de 0.8B es compatible en principio con GPU de consumo, pero el autor no publica requisitos ni mediciones.
- Cabe en GPU de consumo: no confirmado por el autor; depende del modelo base y de la cuantizacion elegida.
- Opciones de despliegue: carga mediante `peft` y `transformers` segun el ejemplo de la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. No hay mediciones de energia de inferencia ni de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `szl-triage-qwen3.5-0.8b-lora` | Adaptador sobre base 0.8B | No disponible | Puerta de 66 filas: 66/66 etiquetas y estados; release bloqueada | Apache-2.0 | HuggingFace, no promotable |
| `Qwen/Qwen3.5-0.8B` (modelo base) | 0.8B | No disponible | No disponible en esta informacion | No disponible en esta informacion | HuggingFace |
| `szl-triage-qwen3.5-0.8b-lora-study5` | Adaptador sobre base 0.8B | No disponible | No disponible | No disponible en esta informacion | HuggingFace, referenciado como estudio relacionado |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria mas alla del modelo base y del estudio relacionado citado por el autor.

## Limitaciones y advertencias

- Release bloqueada: la revision de contaminacion o fuga de corpus no se supero, por lo que el artefacto es `not-promotable` y `publication_eligible=false`.
- Prohibido su uso en produccion, en entornos de seguridad critica y en triaje de cara al cliente.
- Las metricas de la puerta de 66 filas son documentacion y no aprobacion de despliegue; no deben combinarse con resultados posteriores de cinco semillas o de puerta de release como una unica puntuacion.
- El estado de los tensores de `main` respecto a la revision de la puerta es desconocido; para servir o reproducir debe fijarse una revision concreta y nunca usar `main` flotante.
- Los identificadores de datasets estan sin declarar y la lista de materiales y la energia no estan atestiguadas; no hay evidencia medida de coste energetico.
- No es un clasificador convencional con cabeza de clasificacion: solo emite JSON generativo, lo que exige validacion estricta de esquema aguas abajo.
- Idioma limitado al ingles declarado; no se documenta cobertura multilingue.
- Riesgo de alucinacion: no cuantificado por el autor; el diseno mitiga parcialmente el problema mediante la preferencia por `REVIEW` y la preservacion de rechazos, pero no lo elimina.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero la politica del autor prohibe el despliegue desde esta ficha; la restriccion es operativa y de gobernanza, no de licencia.
- No debe absorberse como este identificador canonico a variantes `*-study5`, `*-laptop-lora`, `*-nemo-candidate` ni futuros `*-candidate_enterprise_*`.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora
- Revision de la puerta conductual: https://huggingface.co/SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora/tree/24b5c44494434e88b89d9915daad32f1f8e8d03d
- Informe de la puerta: https://huggingface.co/SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora/resolve/24b5c44494434e88b89d9915daad32f1f8e8d03d/gate_report.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Estudio relacionado: https://huggingface.co/SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora-study5
- Organizacion en HuggingFace: https://huggingface.co/SZLHOLDINGS
- Producto: https://a-11-oy.com
- Pruebas: https://a11oy.net
- GitHub: https://github.com/szl-holdings
