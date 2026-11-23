# webAI-Official/Meridian-1-analyst-lora-GGUF

## Resumen

Meridian-1-analyst-lora-GGUF es un adaptador LoRA en formato GGUF para el modelo propietario Meridian-1 de webAI. No se trata de un modelo completo, sino de un ajuste fino de bajo rango (rank 16) que especializa al modelo anfitrion en la persona "analyst": un rol orientado a trabajo estructurado y cuantitativo sobre datos proporcionados, con salida obligatoria en un unico objeto JSON. El adaptador se distribuye publicamente en Hugging Face, pero los pesos del modelo base no estan publicados, por lo que solo resulta util para despliegues autorizados de Meridian-1.

El adaptador esta entrenado con un system prompt concreto y un contrato de salida JSON (campos `persona`, `objective`, `method`, `artifacts`), con modo thinking activado y un presupuesto de generacion de hasta 8.192 tokens nuevos. Su relevancia practica esta en que mejora de forma medible el cumplimiento de dicho contrato frente al modelo base role-prompted: +20,0 puntos en tasa global de contrato y +31,1 puntos en mantenimiento del rol bajo presion adversarial, segun la evaluacion del autor.

El repositorio ocupa 0,1 GB y contiene un unico fichero de adaptador de aproximadamente 130 MB en f16. La etiqueta de parametros totales registrada (65.011.712) corresponde al recuento de safetensors del adaptador, no al modelo anfitrion, cuyo tamano no se publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer Meridian-1 (arquitectura del host no disponible) |
| Parametros totales | 65.011.712 (recuento del adaptador en safetensors; el modelo anfitrion no se publica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (presupuesto de generacion del adaptador: 8.192 tokens nuevos) |
| Tipos de cuantizacion | f16 (unico fichero publicado del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | propietaria (webAI, Inc., todos los derechos reservados) |
| Formato de pesos | GGUF (adaptador LoRA); existe build PEFT en safetensors en otro repositorio |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 16 convertido a GGUF mediante `convert_lora_to_gguf.py` de llama.cpp (commit 5cdadfc) a partir del build PEFT. Se aplica sobre el modelo anfitrion Meridian-1, de arquitectura no documentada publicamente; las etiquetas del repositorio mencionan "gemma4", lo que sugiere una base de la familia Gemma, pero no se confirma en la model card. El adaptador esta entrenado especificamente para un system prompt fijo y para un contrato de salida JSON estricto, con thinking activado y temperatura 1.0, top-p 0.95 y top-k 64 como ajustes de evaluacion.

Los detalles de entrenamiento (datos, hiperparametros, mezcla de profesores y metricas intermedias) son internos y no se publican. La etiqueta "dpo" indica que el ajuste incorpora preferencias por DPO, aunque no se especifica la composicion del dataset ni el numero de tokens de entrenamiento. La innovacion tecnica destacable no esta en la arquitectura, sino en el contrato de persona: el adaptador fuerza una envoltura JSON valida y un comportamiento de rol consistente, incluyendo rechazo de peticiones fuera de alcance.

## Capacidades

- Generacion de texto estructurado: produce un unico objeto JSON con campos obligatorios (`persona`, `objective`, `method`, `artifacts`) y campos opcionales (`inputs_used`, `assumptions`, `unavailable`, `handoff`).
- Razonamiento analitico y trabajo cuantitativo sobre datos aportados en el contexto.
- Modo thinking activado por defecto (`enable_thinking: true`), con presupuesto de hasta 8.192 tokens nuevos.
- Mantenimiento de rol bajo presion adversarial: 78,3 % de exito en la suite del autor frente al 47,2 % del modelo base role-prompted.
- Rechazo de peticiones fuera de alcance, aunque con margen de mejora (55,6 % frente a 50,0 %).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible mas alla del campo opcional `handoff`.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Analisis cuantitativo de datos tabulares: el adaptador recibe los datos en el contexto y devuelve un JSON con metodo y artefactos, lo que facilita su consumo programatico en pipelines de analisis sin postprocesar prosa.
- Extraccion estructurada de informes financieros: con TAT-QA como referencia de evaluacion (91,0 % de exactitud), es adecuado para responder preguntas sobre tablas y estados financieros en formato JSON consumible por sistemas downstream.
- Orquestacion de agentes: el campo opcional `handoff` permite delegar subtareas a otros componentes, y el contrato JSON hace fiable el enrutamiento entre agentes.
- Automatizacion de informes internos: el modelo devuelve artefactos en lugar de narrativa, lo que encaja en flujos que generan dashboards o documentos a partir de resultados estructurados.
- Moderacion de alcance en asistentes especializados: su capacidad de rechazo de peticiones fuera de dominio (55,6 %) sirve como primera capa en asistentes acotados a un rol concreto.
- Evaluacion de consistencia de persona: util para equipos que investigan adherence a system prompts y contratos de salida en modelos propietarios, dado que el autor publica una suite de 720 casos con metricas comparativas.
- Despliegue local con llama.cpp: al ser un adaptador GGUF de 130 MB, se puede cargar sobre una instancia autorizada de Meridian-1 con `llama-server --lora`, sin infraestructura adicional.

## Benchmarks y rendimiento

Evaluacion del autor sobre la suite de contrato de persona (720 casos held-out, temperatura 1.0, top-p 0.95, top-k 64; porcentajes):

| Metrica | Adaptador | Meridian-1 (role-prompted) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa global de contrato | 78,1 | 58,1 | +20,0 |
| Envoltorio de persona valido | 93,2 | 71,8 | +21,4 |
| Tareas en alcance superadas | 90,6 | 77,8 | +12,8 |
| Rechazo correcto fuera de alcance | 55,6 | 50,0 | +5,6 |
| Mantiene rol bajo presion adversarial | 78,3 | 47,2 | +31,1 |
| Peticiones generales atendidas en rol | 87,8 | 57,2 | +30,6 |
| Coincide con respuesta gold | 92,6 | 84,8 | +7,8 |

Rendimiento en tarea propia (items held-out, intervalo bootstrap pareado al 95 %):

| Tarea | Adaptador | Meridian-1 (role-prompted) | Ganancia (pts) | Intervalo 95 % | Items |
|---|---:|---:|---:|---|---:|
| Exactitud TAT-QA | 91,0 | 88,0 | +3,0 | +0,0 a +6,5 | 200 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador: aproximadamente 130 MB en f16, despreciable frente al modelo anfitrion.
- VRAM total: depende enteramente del Meridian-1 GGUF subyacente, cuyos requisitos no se publican.
- GPU recomendadas: no disponible; el despliegue se realiza con llama.cpp sobre el host autorizado.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano del modelo base.
- Opciones de despliegue: `llama-server` de llama.cpp con `--lora` y `--jinja`; `--max-lora-rank 16`; `--lora-scaled` para ajustar la intensidad del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA comparables de la misma categoria (persona analista con contrato JSON) sobre modelos propietarios, ni se dispone de datos publicos del modelo anfitrion para comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere los pesos de Meridian-1, que no se distribuyen en Hugging Face y solo estan disponibles para personal autorizado.
- Licencia propietaria de webAI, Inc.: uso comercial sujeto a autorizacion expresa; no es software libre.
- El adaptador esta fuera de distribucion si no se envia exactamente el system prompt de entrenamiento, incluido el salto de linea antes de la instruccion JSON.
- La tasa de rechazo correcto de peticiones fuera de alcance es del 55,6 %, insuficiente para usar el modelo como unico mecanismo de control de alcance.
- La tasa global de contrato es del 78,1 %: aproximadamente una de cada cinco respuestas no cumple el contrato completo, lo que exige validacion del JSON en produccion.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el campo opcional `unavailable` permite declarar datos faltantes, pero su uso no se evalua.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano.
- Sesgos conocidos: no disponibles.
- Los datos de entrenamiento y la composicion del dataset son internos, lo que limita la auditabilidad del adaptador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/webAI-Official/Meridian-1-analyst-lora-GGUF
- Build PEFT: https://huggingface.co/webAI-Official/Meridian-1-analyst-lora-peft
- Modelo base: https://huggingface.co/webAI-Official/Meridian-1
- Script de conversion de llama.cpp: `convert_lora_to_gguf.py` (commit 5cdadfc)
