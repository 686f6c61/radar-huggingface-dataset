# webAI-Official/Meridian-1-critic-lora-GGUF

## Resumen

Meridian-1-critic-lora-GGUF es un adaptador LoRA en formato GGUF para el modelo Meridian-1, un fine-tune de google/gemma-4-12B-it desarrollado por webAI-Official. No se trata de un modelo completo, sino de un adaptador de rango 16 que se carga sobre los pesos de Meridian-1 en llama.cpp para especializar al modelo en la persona "critic": un rol que evalua el output de otras personas frente al objetivo original, rechaza con razones y reencamina el trabajo. El adaptador ocupa aproximadamente 130 MB en f16 y el repositorio completo pesa 0,3 GB.

El adaptador parte de un LoRA previo entrenado sobre gemma-4-12B-it y fue reajustado sobre Meridian-1 con una epoca adicional sobre los mismos 12.055 ejemplos, recuperando buena parte del rendimiento perdido en el traslado al modelo base. El entrenamiento combina SFT (3 epocas, learning rate 1e-4, longitud maxima de secuencia 8192) y DPO sobre 3.753 pares de preferencia (beta 0,1, learning rate 5e-6).

La relevancia de esta ficha es acotada: es un adaptador de persona para un modelo de 12B, con 10 descargas y sin likes en el momento de la consulta, orientado a flujos multiagente donde un componente actua como revisor estructurado que devuelve JSON. Su utilidad practica depende de disponer del modelo base Meridian-1 en GGUF y de respetar estrictamente el system prompt de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adapter) sobre transformer decoder-only (gemma-4-12B-it, via Meridian-1) |
| Parametros totales | 65.011.712 (adapter; el modelo base Meridian-1 no reporta cifra en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el entrenamiento uso max seq len 8192 |
| Tipos de cuantizacion | f16 (unico fichero publicado: `Meridian-1-critic-lora-f16.gguf`, ~130 MB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA); existe version PEFT en `webAI-Official/Meridian-1-critic-lora-peft` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado sobre los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj del transformer de Meridian-1, que a su vez es un fine-tune de google/gemma-4-12B-it con la misma arquitectura y nombres de tensores. El modo de pensamiento es `thinking` y el entrenamiento se realizo con SFT sobre 12.055 ejemplos durante 3 epocas con learning rate 1e-4 y longitud maxima de 8192, alcanzando un train loss de 0,3144 y un eval loss de 0,3046 en el paso 2262. Sobre ese adaptador SFT se aplico DPO con 3.753 pares de preferencia, beta 0,1 y learning rate 5e-6.

Los objetivos del SFT fueron las propias respuestas de gemma-4-12B-it con el prompt de rol, verificadas contra el contrato de persona y contra la verdad de referencia, conservando la mas corta de las cuatro que pasaban los controles; un 1% de las respuestas, para peticiones que nunca superaron las verificaciones, provienen de Granite 4.2 30B (razonamiento por debajo de 12.000 caracteres). Posteriormente el adaptador se reajusto sobre los pesos de lenguaje de Meridian-1 durante 1 epoca sobre los mismos 12.055 ejemplos, con learning rate 2e-5 y partiendo del adaptador anterior, con train loss final de 0,2851 y eval loss de 0,3039 en el paso 754. La conversion a GGUF se hizo con `convert_lora_to_gguf.py` de llama.cpp (commit 5cdadfc).

## Capacidades

- Evaluacion estructurada de outputs de otras personas frente a un objetivo original, con veredicto, hallazgos y reencaminamiento.
- Salida en un unico objeto JSON con campos obligatorios `persona`, `objective_restated`, `verdict` y `findings`, y campos opcionales `reviewed`, `required_changes` y `route_to`.
- Modo de pensamiento activado (`enable_thinking: true`) tal como se entreno.
- Rechazo razonado de peticiones fuera de alcance y mantenimiento del rol bajo presion adversarial.
- Presupuesto de generacion de hasta 8.192 tokens nuevos.
- No soporta tool calling, vision, audio ni otras capacidades especiales segun la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Revision de calidad en pipelines multiagente: el adaptador actua como nodo revisor que recibe el objetivo y el material producido por otro agente y devuelve un JSON con veredicto y cambios requeridos, lo que permite encadenar el rechazo y el reencaminamiento de forma programatica.
- Puerta de validacion en CI/CD de contenido generado: integrado via llama.cpp con `--lora`, se puede invocar como endpoint compatible con OpenAI para bloquear entregas que no cumplen el contrato de persona antes de publicarse.
- Enrutamiento de tareas entre agentes: el campo `route_to` del JSON permite derivar el trabajo al agente adecuado cuando el critico detecta que la tarea no corresponde a la persona que la ejecuto.
- Evaluacion automatizada de respuestas de otros modelos: al comparar el output contra el objetivo restablecido, sirve como juez ligero en procesos de evaluacion interna, con la ventaja de su tamano reducido (130 MB de adaptador).
- Moderacion de contenido fuera de alcance: la metrica de rechazo correcto de peticiones fuera de alcance (77,3% en el adaptador frente a 61,3% del base) lo hace util para filtrar solicitudes que no deberian procesarse.
- Despliegue local en estaciones de trabajo: al ser un adaptador LoRA sobre un modelo de 12B en GGUF, puede ejecutarse en llama.cpp con cuantizaciones Q8_0 del base, sin necesidad de infraestructura de GPU de datacenter.

## Benchmarks y rendimiento

Evaluacion sobre Meridian-1 con la suite de contrato de persona (753 casos reservados, adaptador frente a Meridian-1 con el mismo prompt de rol, ambos muestreados con temperatura 1,0, top-p 0,95 y top-k 64). Porcentajes:

| Metrica | Adaptador | Meridian-1 (role-prompted) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa global de paso del contrato | 79,4 | 61,5 | +17,9 |
| Envoltorio de salida de persona valido | 97,9 | 90,7 | +7,2 |
| Tareas en alcance superadas | 79,1 | 58,2 | +20,9 |
| Rechazo correcto de peticiones fuera de alcance | 77,3 | 61,3 | +16,0 |
| Mantiene el rol bajo presion adversarial | 81,8 | 70,3 | +11,5 |
| Peticiones generales gestionadas en rol | 100,0 | 66,7 | +33,3 |

Trabajo propio sobre elementos reservados (intervalo bootstrap pareado al 95%):

| Tarea | Adaptador | Meridian-1 (role-prompted) | Ganancia (pts) | Intervalo 95% | Elementos |
|---|---:|---:|---:|---|---:|
| Revisiones correctas (veredicto, regla, ruta) | 78,6 | 59,0 | +19,7 | +15,0 a +24,3 | 195 |

Capacidad general, mismo modo de pensamiento:

| Benchmark | Adaptador | Meridian-1 | Ganancia (pts) | +/- SE |
|---|---:|---:|---:|---:|
| mmlu_pro (exact_match) | 76,3 | 74,7 | +1,6 | 2,2 |

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 130 MB en f16; el requisito real lo marca el modelo base Meridian-1 en GGUF.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada (depende de la cuantizacion del base de 12B; una cuantizacion Q8_0 de un modelo de 12B ronda los 13 GB, pero este dato no se confirma en la ficha del autor).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Despliegue soportado: llama.cpp (`llama-server -m Meridian-1-Q8_0.gguf --lora Meridian-1-critic-lora-f16.gguf --jinja`), con opcion `--lora-scaled` para ajustar la fuerza del adaptador. La evaluacion reportada se hizo con vLLM sobre los pesos PEFT, no con llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el autor indica que el adaptador aun no se ha probado con llama.cpp sobre Meridian-1.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meridian-1-critic-lora-GGUF | LoRA de persona sobre 12B | 65.011.712 (adapter) | no disponible | no disponible | GGUF en HF |
| Meridian-1 (base) | Fine-tune de gemma-4-12B-it | no disponible | no disponible | no disponible | HF |
| gemma-4-12B-it (original) | Modelo base de Google | no disponible en la informacion | no disponible | no disponible | HF |
| Meridian-1-critic-lora-peft | Mismo adaptador en PEFT | 65.011.712 (adapter) | no disponible | no disponible | HF |

No se dispone de datos de benchmarks de terceros ni de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere cargar Meridian-1 en GGUF y no funciona de forma aislada.
- Depende estrictamente del system prompt de entrenamiento, incluido el salto de linea antes de `Respond with a single JSON object.`; fuera de esa distribucion el comportamiento no esta garantizado.
- El modo de pensamiento debe activarse (`enable_thinking: true`); desactivarlo se sale de las condiciones de entrenamiento.
- La evaluacion reportada se obtuvo con vLLM sobre los pesos PEFT, no con llama.cpp sobre el GGUF; el autor no ha validado aun la version GGUF sobre Meridian-1.
- Tasa de paso del contrato del 79,4%: aproximadamente una de cada cinco evaluaciones no supera el contrato, por lo que no es apto como unico mecanismo de validacion en produccion.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada.
- Idiomas soportados y licencia no disponibles: no se puede confirmar el uso comercial sin consultar al autor.
- Modelo con muy poca adopcion (10 descargas, 0 likes) y creado recientemente; no hay evidencia de uso en produccion.
- El adaptador se entreno con respuestas del propio gemma-4-12B-it y de Granite 4.2 30B, lo que puede heredar sesgos y errores de esos modelos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/webAI-Official/Meridian-1-critic-lora-GGUF
- Modelo base Meridian-1: https://huggingface.co/webAI-Official/Meridian-1
- Version PEFT del adaptador: https://huggingface.co/webAI-Official/Meridian-1-critic-lora-peft
- Adaptador previo sobre gemma-4-12B-it: https://huggingface.co/webAI-Official/gemma-4-12b-it-critic-lora-peft
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Herramienta de conversion: `convert_lora_to_gguf.py` de llama.cpp (commit 5cdadfc)
