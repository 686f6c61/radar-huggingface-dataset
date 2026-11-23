# webAI-Official/Meridian-1-builder-lora-GGUF

## Resumen

Meridian-1-builder-lora-GGUF es un adaptador LoRA en formato GGUF para el modelo propietario Meridian-1 de webAI, Inc. No es un modelo completo: se trata de un adaptador de rango 16 entrenado para instanciar la persona "builder", un rol orientado a generar artefactos ejecutables (codigo, scripts, componentes y transformaciones) con un contrato de salida JSON estricto. El repositorio contiene unicamente el adaptador en f16 (unos 130 MB), mientras que los pesos del modelo anfitrion Meridian-1 no se distribuyen publicamente.

El adaptador esta pensado para cargarse sobre una instancia interna de Meridian-1 en formato GGUF mediante llama.cpp, usando la opcion `--lora`. Su relevancia radica en que demuestra una tecnica de especializacion por persona sobre un modelo base propietario: en lugar de publicar pesos completos, webAI distribuye un delta de bajo rango que modifica el comportamiento del host hacia un rol concreto, manteniendo el control sobre los pesos originales.

La model card reporta mejoras sustanciales en el cumplimiento del contrato de persona frente al modelo base con el mismo prompt de rol, especialmente en permanencia del rol bajo presion adversarial (+61,7 puntos) y en rechazo correcto de peticiones fuera de alcance (+39,5 puntos). La licencia es propietaria y el uso esta restringido a personal autorizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo host Meridian-1; el host se etiqueta como gemma4 en los tags |
| Parametros totales | 65.011.712 (dato del safetensors del adaptador PEFT, no del modelo completo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unico fichero publicado, ~130 MB) |
| Idiomas soportados | no disponible |
| Licencia | propietaria (proprietary, webAI, Inc., todos los derechos reservados) |
| Formato de pesos | GGUF (adaptador LoRA convertido con `convert_lora_to_gguf.py`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16, entrenado para un prompt de sistema concreto y un contrato de salida JSON. Se sirve con `--max-lora-rank 16` en llama.cpp y se aplica sobre un GGUF interno de Meridian-1 que no esta publicado. La conversion a GGUF se realizo con el script `convert_lora_to_gguf.py` de llama.cpp en el commit `5cdadfc`. Existe una version PEFT del mismo adaptador en el repositorio `webAI-Official/Meridian-1-builder-lora-peft`.

El entrenamiento incorpora DPO segun los tags del repositorio. El prompt de sistema es parte integral de la distribucion del adaptador: cada ejemplo de entrenamiento lo utilizo, y sin el exacto (incluido el salto de linea antes de `Respond with a single JSON object.` y el guion em en lugar de guion corto) el adaptador queda fuera de su distribucion de entrenamiento. Los datos de entrenamiento, hiperparametros, mezcla de profesores y metricas intermedias son internos y no se documentan. El modo thinking esta activado (`enable_thinking: true`) tal como se entreno, con un presupuesto de generacion de hasta 8.192 tokens nuevos.

## Capacidades

- Generacion de codigo y artefactos ejecutables: el rol "builder" produce codigo, scripts, componentes y transformaciones listas para ejecutar.
- Salida estructurada: responde con un unico objeto JSON con campos obligatorios `persona`, `objective`, `files` y `run`, y campos opcionales `tests`, `assumptions` y `handoff`.
- Modo thinking activado por defecto, coherente con el entrenamiento.
- Permanencia de rol: mantiene la persona bajo presion adversarial (63,9 % frente a 2,2 % del base con prompt de rol).
- Rechazo de peticiones fuera de alcance: 41,7 % de rechazos correctos frente a 2,2 % del base.
- Cumplimiento de instrucciones generales dentro del rol: 81,7 % frente a 57,8 % del base.
- No se documentan capacidades de vision, audio, tool calling nativo ni multilingues mas alla de lo que herede el host Meridian-1.

## Casos de uso

- Generacion de codigo en pipelines internos: el adaptador produce artefactos ejecutables con estructura JSON verificable, lo que permite integrarlo en flujos automatizados que validan los campos `files` y `run` antes de ejecutar.
- Automatizacion de tareas de construccion: dado un objetivo, el modelo emite un objeto con los ficheros a crear y el comando de ejecucion, adecuado para orquestadores que necesitan una salida maquina-legible.
- Asistentes con persona fija: el adaptador garantiza que el modelo se mantenga en el rol "builder" incluso ante intentos de desvio, util en interfaces donde la coherencia del rol es requisito de producto.
- Generacion de tests: el campo opcional `tests` permite solicitar baterias de pruebas junto al codigo generado, con el modelo reportando un 92,7 % de codigo que ejecuta correctamente.
- Documentacion de supuestos y handoff: los campos `assumptions` y `handoff` permiten que el modelo explicite decisiones y deje contexto para el siguiente paso de un flujo multi-etapa.
- Filtrado de peticiones fuera de dominio: el rechazo de solicitudes fuera de alcance (41,7 %) sirve como primera capa de control en entornos donde el asistente no debe salirse de su tarea.
- Evaluacion de tecnicas de especializacion por persona: util como referencia para equipos que investigan adaptadores LoRA sobre modelos propietarios y quieren comparar ganancias de contrato frente al host sin adaptador.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre la suite de contrato de persona (720 casos reservados, temperatura 1.0, top-p 0.95, top-k 64, porcentajes):

| Metrica | Adaptador | Meridian-1 (prompt de rol) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa global de paso del contrato | 69,9 | 36,7 | +33,2 |
| Envoltorio de salida de persona valido | 92,1 | 72,5 | +19,6 |
| Tareas en alcance superadas | 92,2 | 84,4 | +7,8 |
| Rechazo correcto de peticiones fuera de alcance | 41,7 | 2,2 | +39,5 |
| Permanencia en rol bajo presion adversarial | 63,9 | 2,2 | +61,7 |
| Peticiones generales gestionadas en rol | 81,7 | 57,8 | +23,9 |
| Codigo generado que ejecuta | 92,7 | 86,1 | +6,6 |

Trabajo propio sobre items reservados (intervalo bootstrap pareado al 95 %):

| Tarea | Adaptador | Meridian-1 (prompt de rol) | Ganancia (pts) | Intervalo 95 % | Items |
|---|---:|---:|---:|---|---:|
| Tareas de OpenCodeInstruct que pasan sus tests | 82,7 | 78,7 | +4,0 | -2,7 a +10,7 | 150 |

Capacidad general, mismo modo thinking:

| Benchmark | Adaptador | Meridian-1 | Ganancia (pts) | +/- SE |
|---|---:|---:|---:|---:|
| ifeval (prompt_level_strict_acc) | 93,5 | 91,0 | +2,5 | 2,7 |

No se publican resultados en MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa unos 130 MB en f16; el requisito real de VRAM lo determina el modelo host Meridian-1, cuyos pesos no se publican y cuyo tamano no se especifica.
- No es posible estimar VRAM de inferencia sin conocer el tamano y la cuantizacion del GGUF de Meridian-1.
- GPU recomendadas: no disponible (depende del host).
- No se puede confirmar si cabe en GPU de consumo, al desconocerse el tamano del host.
- Despliegue previsto: llama.cpp, con `llama-server -m "$MERIDIAN_1_GGUF" --lora Meridian-1-builder-lora-f16.gguf --jinja` y `--max-lora-rank 16`. La fuerza del adaptador se ajusta con `--lora-scaled`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados en la informacion proporcionada. El adaptador solo es funcional sobre el host propietario Meridian-1, lo que impide una comparacion directa con adaptadores LoRA publicos sobre modelos abiertos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Meridian-1-builder-lora-GGUF | 65 M (adaptador) | no disponible | Propietaria | Solo adaptador; host no publicado |
| Meridian-1-builder-lora-peft | no disponible | no disponible | Propietaria | Solo adaptador PEFT |
| Alternativas abiertas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos del modelo host Meridian-1 no se distribuyen; el adaptador es inutil sin acceso autorizado a una instancia interna del host en GGUF.
- Requiere el prompt de sistema exacto, incluido el salto de linea y el guion em. Cualquier variacion saca al adaptador de su distribucion de entrenamiento.
- El contrato de salida exige un unico objeto JSON; el modelo no esta pensado para respuestas en texto libre.
- Tasa de rechazo de peticiones fuera de alcance del 41,7 %: mas de la mitad de solicitudes fuera de dominio no se rechazan correctamente, lo que limita su uso como unico mecanismo de control.
- Permanencia en rol bajo presion adversarial del 63,9 %: aproximadamente un tercio de los ataques consiguen desviar al modelo.
- La ganancia en tareas de codigo sobre OpenCodeInstruct (+4,0 pts) tiene un intervalo de confianza que cruza cero (-2,7 a +10,7), por lo que no es concluyente.
- Licencia propietaria de webAI, Inc.: uso comercial restringido y sujeto a autorizacion; no es software libre.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- Datos de entrenamiento y hiperparametros no publicados, lo que impide auditar el origen de los sesgos.
- Fecha de creacion del repositorio indicada como 2026-11-08; verificar la vigencia de los artefactos antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webAI-Official/Meridian-1-builder-lora-GGUF
- Version PEFT del adaptador: https://huggingface.co/webAI-Official/Meridian-1-builder-lora-peft
- Modelo base (referencia): https://huggingface.co/webAI-Official/Meridian-1
- Script de conversion LoRA a GGUF: https://github.com/ggml-org/llama.cpp/blob/master/convert_lora_to_gguf.py
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
