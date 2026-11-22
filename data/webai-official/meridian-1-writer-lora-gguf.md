# webAI-Official/Meridian-1-writer-lora-GGUF

## Resumen

Meridian-1-writer-lora-GGUF es un adaptador LoRA en formato GGUF publicado por webAI-Official para el modelo anfitrion Meridian-1, un modelo propietario cuyos pesos no se distribuyen publicamente. El repositorio contiene unicamente el adaptador, no el modelo base: se trata de un artefacto de personalizacion que ajusta el comportamiento del modelo anfitrion hacia una persona concreta denominada "writer", orientada a la produccion de prosa acabada con voz, formato y estilo especificados.

El adaptador esta entrenado mediante SFT (supervised fine-tuning) sobre el prompt de sistema exacto que define la persona y sobre un contrato de salida en JSON con campos obligatorios (`persona`, `spec`, `body`). Su relevancia actual no reside en la arquitectura del modelo (que no se publica), sino en el patron de distribucion: se libera el adaptador como capa de comportamiento mientras se retiene el modelo anfitrion, algo habitual en despliegues comerciales cerrados. El unico artefacto publicado es un fichero GGUF de aproximadamente 130 MB en f16, con rango LoRA 16.

La model card reporta una mejora sustancial frente al modelo anfitrion con el mismo prompt de rol en una suite de 720 casos retenidos: 91,4 % de tasa de cumplimiento global del contrato frente a 59,3 %, y 90,6 % de rechazo correcto de peticiones fuera de alcance frente a 36,7 %. Estos datos provienen exclusivamente de la evaluacion interna del autor y no han sido replicados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre modelo anfitrion Meridian-1 (arquitectura del anfitrion no disponible) |
| Parametros totales | 65.011.712 (segun metadatos safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | propietaria (webAI, Inc.; todos los derechos reservados) |
| Formato de pesos | GGUF (adaptador LoRA), con build equivalente en PEFT |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 convertido desde el adaptador PEFT original mediante `convert_lora_to_gguf.py` de llama.cpp (commit 5cdadfc). No se publica informacion sobre la arquitectura interna del modelo anfitrion Meridian-1, ni sobre su numero de capas, dimensiones ocultas o mecanismo de atencion. El tag `gemma4` presente en el repositorio sugiere una familia de arquitectura subyacente, pero no se confirma en la model card.

El entrenamiento es SFT sobre ejemplos que utilizan un prompt de sistema fijo y un contrato de salida JSON. La model card indica explicitamente que los datos de entrenamiento, hiperparametros, mezcla de profesores y metricas intermedias son internos y no se divulgan. No se menciona RLHF, DPO ni tecnicas de decodificacion especulativa. El adaptador esta calibrado para `enable_thinking: false` y un presupuesto de generacion de hasta 2048 tokens nuevos, con ajustes de muestreo de temperatura 1.0, top-p 0.95 y top-k 64.

## Capacidades

- Generacion de prosa acabada en una voz, formato y estilo especificados por el usuario, dentro de la persona "writer".
- Salida estructurada garantizada como un unico objeto JSON con campos `persona`, `spec` y `body`, y campos opcionales `deviations` y `handoff`.
- Rechazo explicito de peticiones fuera del alcance definido para la persona (capacidad medida en la evaluacion interna).
- Mantenimiento del rol bajo presion adversarial (capacidad medida en la evaluacion interna).
- Gestion de peticiones generales dentro del rol asignado.
- Modo de pensamiento desactivado de forma fija (`enable_thinking: false`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni multilingues.

## Casos de uso

- Redaccion editorial con estilo controlado: el adaptador produce prosa ajustada a una voz y formato concretos y devuelve el resultado en un JSON parseable, lo que permite integrarlo en un CMS o pipeline editorial que consuma el campo `body` de forma programatica.
- Generacion de contenido de marketing con plantillas: el campo `spec` del contrato de salida permite transportar la especificacion de formato (longitud, tono, estructura) junto al texto, facilitando la validacion automatica posterior.
- Moderacion de alcance en asistentes de redaccion: la mejora medida en rechazo de peticiones fuera de alcance (90,6 % frente a 36,7 %) lo hace util para contener un asistente dentro de su dominio y evitar respuestas no solicitadas.
- Enrutamiento con `handoff`: el campo opcional `handoff` permite derivar peticiones que exceden el alcance de la persona hacia otro componente del sistema, habilitando arquitecturas multi-persona sobre el mismo modelo anfitrion.
- Evaluacion de personas y contratos de salida: sirve como referencia para comparar el comportamiento de un modelo anfitrion con y sin adaptador bajo un mismo prompt de rol, usando la suite de 720 casos descrita.
- Prototipado interno de flujos de generacion con llama.cpp: al cargarse como LoRA GGUF sobre un binario de llama.cpp con `--jinja`, permite iterar sobre el prompt de sistema y la escala del adaptador (`--lora-scaled`) sin reentrenar.
- Despliegue en entornos autorizados: para equipos con acceso al GGUF interno de Meridian-1, el adaptador se integra en `llama-server` con un unico flag adicional.

## Benchmarks y rendimiento

Resultados de la suite de contrato de persona (720 casos retenidos, adaptador frente a Meridian-1 con el mismo prompt de rol, muestreo a temperatura 1.0, top-p 0.95, top-k 64). Porcentajes:

| Metrica | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa global de cumplimiento del contrato | 91,4 | 59,3 | +32,1 |
| Envoltorio de salida de persona valido | 99,2 | 93,3 | +5,8 |
| Tareas en alcance superadas | 86,7 | 76,7 | +10,0 |
| Rechazo correcto de peticiones fuera de alcance | 90,6 | 36,7 | +53,9 |
| Mantenimiento del rol bajo presion adversarial | 91,1 | 51,7 | +39,4 |
| Peticiones generales gestionadas dentro del rol | 97,2 | 72,2 | +25,0 |

Evaluacion sobre items retenidos propios del adaptador (intervalo bootstrap pareado al 95 %):

| Tarea | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) | Intervalo 95 % | Items |
|---|---:|---:|---:|---|---:|
| Brief cumplido (puntos requeridos, longitud, nada inventado) | 95,4 | 88,7 | +6,6 | +1,3 a +11,9 | 151 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Todos los datos anteriores proceden de la evaluacion interna del autor y no consta replicacion independiente.

## Requisitos de hardware

- El adaptador pesa aproximadamente 130 MB en f16 y requiere el GGUF del modelo anfitrion Meridian-1, que no se distribuye publicamente; los requisitos de VRAM dependen por completo del anfitrion y no estan disponibles.
- No es posible estimar VRAM de inferencia, GPU recomendadas ni encaje en GPU de consumo sin conocer el tamano y la cuantizacion del modelo anfitrion.
- Despliegue documentado: `llama-server` de llama.cpp con `-m "$MERIDIAN_1_GGUF" --lora Meridian-1-writer-lora-f16.gguf --jinja`, y `--max-lora-rank 16` al servir.
- Ajuste de fuerza del adaptador mediante `--lora-scaled Meridian-1-writer-lora-f16.gguf <scale>`.
- Latencia y throughput: no disponibles.
- Opciones alternativas (vLLM, TGI, Ollama) no estan documentadas para este artefacto; la build PEFT podria usarse con frameworks que carguen adaptadores PEFT, pero no se detalla.

## Comparativa con modelos similares

No disponible. No se conocen adaptadores LoRA publicos comparables de la misma familia ni se dispone de datos sobre modelos de la misma categoria con parametros, contexto y licencia verificables en la informacion proporcionada. La comparacion interna relevante es la del propio adaptador frente al modelo anfitrion Meridian-1 con prompt de rol, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- El modelo anfitrion Meridian-1 es propietario y sus pesos no se publican; el adaptador no es utilizable de forma autonoma y su uso esta restringido a personal autorizado segun la model card.
- Licencia propietaria de webAI, Inc. con todos los derechos reservados: no se concede uso comercial general, redistribucion ni modificacion sin autorizacion expresa.
- El adaptador queda fuera de su distribucion de entrenamiento si no se envia el prompt de sistema exacto, incluido el salto de linea antes de `Respond with a single JSON object.`; omitirlo degrada el comportamiento de forma no cuantificada.
- El contrato de salida exige un unico objeto JSON; no se documenta comportamiento ante prompts que soliciten otros formatos.
- Modo de pensamiento desactivado de forma fija; no se recomienda activarlo.
- Datos de entrenamiento, hiperparametros y composicion del dataset no divulgados, lo que impide auditar sesgos o procedencia de datos.
- Riesgo de alucinacion no evaluado de forma independiente; la metrica de "brief cumplido" incluye "nada inventado", pero solo sobre 151 items y con ganancia de +6,6 puntos e intervalo inferior de +1,3.
- Idiomas soportados no documentados; no hay evidencia de cobertura multilingue.
- Longitud de contexto del anfitrion no disponible; el presupuesto de generacion documentado es de 2048 tokens nuevos.
- Resultados de evaluacion proceden unicamente del autor; no consta replicacion externa ni comparacion con benchmarks estandar.
- El tag `gemma4` sugiere una arquitectura subyacente no confirmada oficialmente; no debe asumirse compatibilidad con otros modelos de esa familia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webAI-Official/Meridian-1-writer-lora-GGUF
- Build PEFT del adaptador: https://huggingface.co/webAI-Official/Meridian-1-writer-lora-peft
- Modelo base referenciado: https://huggingface.co/webAI-Official/Meridian-1
- Script de conversion de llama.cpp: `convert_lora_to_gguf.py` (commit 5cdadfc), en https://github.com/ggml-org/llama.cpp
- Paper, blog, demo o repositorio adicionales: no disponibles en la informacion proporcionada.
