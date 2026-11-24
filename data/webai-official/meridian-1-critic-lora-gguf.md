# webAI-Official/Meridian-1-critic-lora-GGUF

## Resumen

Meridian-1-critic-lora-GGUF es un adaptador LoRA en formato GGUF para el modelo propietario Meridian-1 de webAI, Inc. No se trata de un modelo completo, sino de un ajuste fino de bajo rango (rank 16) que especializa al modelo anfitrion en la persona "Critic", un rol de evaluacion y control de calidad dentro de un sistema multiagente. El adaptador no incluye los pesos del modelo base, que no se distribuyen publicamente.

El adaptador se entrena para un contrato de salida muy concreto: recibe el objetivo original y la salida de otra persona del sistema, y devuelve un unico objeto JSON con campos como `persona`, `objective_restated`, `verdict`, `findings` y, opcionalmente, `required_changes` y `route_to`. Su proposito es mejorar la fiabilidad del modelo anfitrion a la hora de rechazar trabajos fuera de alcance, mantenerse en el rol bajo presion adversarial y enrutar de vuelta las correcciones necesarias.

La relevancia de esta publicacion es doble: por un lado, documenta una tecnica de especializacion por persona mediante DPO y LoRA sobre un modelo propietario; por otro, muestra como empaquetar adaptadores en GGUF para su uso con llama.cpp. El acceso esta restringido a personal autorizado, ya que tanto el modelo base como el adaptador son propiedad de webAI, Inc.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre el modelo propietario Meridian-1 (arquitectura del host no disponible) |
| Parametros totales | 65.011.712 (adaptador; el modelo base no se distribuye) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | propietaria (webAI, Inc.; todos los derechos reservados) |
| Formato de pesos | GGUF (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 entrenado sobre Meridian-1, un modelo propietario de webAI cuya arquitectura no se detalla en la informacion disponible. La etiqueta `gemma4` en el repositorio sugiere una posible base de la familia Gemma, pero no se confirma en la model card. El adaptador se convirtio desde su version PEFT mediante la herramienta `convert_lora_to_gguf.py` de llama.cpp (commit 5cdadfc).

El entrenamiento se orienta a una persona concreta ("Critic") y a un contrato de salida JSON estricto, con un system prompt fijo que forma parte de la distribucion de entrenamiento. La etiqueta `dpo` indica que se empleo optimizacion por preferencias directas, aunque los datos de entrenamiento, hiperparametros, mezcla de profesores y metricas intermedias se declaran internos y no se publican. El adaptador esta pensado para ejecutarse con `enable_thinking: true` y un presupuesto de generacion de hasta 8192 tokens nuevos.

## Capacidades

- Generacion de texto con rol especializado: actua como "Critic" evaluando salidas de otras personas contra el objetivo original.
- Salida estructurada: devuelve un unico objeto JSON con campos obligatorios (`persona`, `objective_restated`, `verdict`, `findings`) y opcionales (`reviewed`, `required_changes`, `route_to`).
- Rechazo razonado de peticiones fuera de alcance y enrutamiento de correcciones.
- Mantenimiento del rol bajo presion adversarial (resistencia a instrucciones que intentan sacarlo de personaje).
- Modo de razonamiento activable (`enable_thinking: true`), tal como fue entrenado.
- Compatibilidad con llama.cpp mediante `llama-server` y carga de adaptadores LoRA (`--lora`, `--lora-scaled`, `--max-lora-rank 16`).
- Capacidades multilingues: no disponible.
- Tool calling, vision, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Control de calidad en pipelines multiagente: el adaptador se inserta como etapa de revision entre la generacion de una persona y su entrega final, validando que la salida cumple el objetivo y devolviendo un veredicto JSON con cambios requeridos.
- Enrutamiento automatico de correcciones: gracias a los campos `verdict` y `route_to`, el sistema puede redirigir el trabajo al agente adecuado con instrucciones concretas de mejora, reduciendo la intervencion humana.
- Filtrado de peticiones fuera de alcance: el adaptador rechaza con justificacion las solicitudes que no corresponden al rol asignado, lo que resulta util en sistemas expuestos a usuarios que intentan desviar al modelo de su tarea.
- Evaluacion de consistencia en entornos de agentes: se puede usar para auditar si las respuestas de otras personas respetan el contrato de salida y el objetivo original, generando registros estructurados y auditables.
- Despliegue local con llama.cpp: al ser un GGUF de aproximadamente 130 MB en f16, se puede cargar sobre una instancia interna de Meridian-1 en `llama-server` con `--jinja`, lo que facilita pruebas y ajustes de escala del adaptador (`--lora-scaled`).
- Prototipado de personas especializadas: el patron (LoRA rank 16 + system prompt fijo + contrato JSON) sirve como referencia para equipos que quieran construir roles de critico, revisor o moderador sobre un modelo anfitrion propio.

## Benchmarks y rendimiento

Los datos publicados comparan el adaptador con Meridian-1 recibiendo el mismo prompt de rol, ambos muestreados con temperatura 1.0, top-p 0.95 y top-k 64. Las puntuaciones son porcentajes.

| Metrica | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa global de cumplimiento del contrato | 79,4 | 61,5 | +17,9 |
| Envoltorio de salida de persona valido | 97,9 | 90,7 | +7,2 |
| Tareas en alcance superadas | 79,1 | 58,2 | +20,9 |
| Rechazo correcto de peticiones fuera de alcance | 77,3 | 61,3 | +16,0 |
| Mantenimiento del rol bajo presion adversarial | 81,8 | 70,3 | +11,5 |
| Peticiones generales atendidas en rol | 100,0 | 66,7 | +33,3 |

Evaluacion sobre items reservados (195 casos, intervalo de confianza bootstrap pareado al 95 %):

| Tarea | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) | IC 95 % |
|---|---:|---:|---:|---|
| Revisiones correctas (veredicto, regla, ruta) | 78,6 | 59,0 | +19,7 | +15,0 a +24,3 |

Capacidad general, adaptador frente a Meridian-1 en el mismo modo de razonamiento:

| Benchmark | Adaptador | Meridian-1 | Ganancia (pts) | +/- EE |
|---|---:|---:|---:|---:|
| mmlu_pro (exact_match) | 76,3 | 74,7 | +1,6 | 2,2 |

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa unos 130 MB en f16; el requisito real de VRAM lo determina el modelo anfitrion Meridian-1, cuyas dimensiones no se publican.
- GPU recomendadas: no disponible, al depender del modelo base.
- Viabilidad en GPU de consumo: no disponible; el adaptador en si es ligero, pero no puede evaluarse sin el host.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--lora Meridian-1-critic-lora-f16.gguf --jinja` y `--max-lora-rank 16`. Otras opciones (vLLM, TGI, Ollama) no se documentan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA publicos comparables de la misma categoria (critico de sistema multiagente sobre modelo propietario). La comparacion directa mas cercana es la del propio adaptador frente a Meridian-1 con prompt de rol, incluida en la seccion de benchmarks.

## Limitaciones y advertencias

- Acceso restringido: el adaptador esta autorizado unicamente a personal autorizado; los pesos del host Meridian-1 no se publican en Hugging Face.
- Licencia propietaria de webAI, Inc.: todos los derechos reservados, lo que impide su uso comercial sin autorizacion expresa.
- Dependencia estricta del system prompt: sin el prompt exacto (incluido el salto de linea antes de la instruccion de JSON), el adaptador queda fuera de su distribucion de entrenamiento.
- Contrato de salida rigido: espera un unico objeto JSON con campos concretos; usos fuera de ese contrato no estan soportados.
- Rendimiento imperfecto: la tasa global de cumplimiento del contrato es del 79,4 % y las revisiones correctas alcanzan el 78,6 %, por lo que persisten errores en produccion.
- Datos de entrenamiento no publicados: no es posible auditar la composicion del dataset, los hiperparametros ni la mezcla de profesores.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento multilingue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo generativo que produce evaluaciones y veredictos.
- Sesgos conocidos: no disponibles.

## Enlaces

- [Hugging Face: webAI-Official/Meridian-1-critic-lora-GGUF](https://huggingface.co/webAI-Official/Meridian-1-critic-lora-GGUF)
- [Version PEFT del adaptador: webAI-Official/Meridian-1-critic-lora-peft](https://huggingface.co/webAI-Official/Meridian-1-critic-lora-peft)
- [Modelo base: webAI-Official/Meridian-1](https://huggingface.co/webAI-Official/Meridian-1)
