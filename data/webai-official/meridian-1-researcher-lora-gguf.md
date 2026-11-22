# webAI-Official/Meridian-1-researcher-lora-GGUF

## Resumen

Meridian-1-researcher-lora-GGUF es un adaptador LoRA en formato GGUF para el modelo base propietario Meridian-1 de webAI, Inc. No se trata de un modelo completo, sino de un adaptador de bajo rango (rank 16) que especializa al modelo anfitrion en la persona "researcher" (investigador), orientada a recopilar informacion, fundamentar afirmaciones con fuentes y devolver un informe estructurado en JSON en lugar de una conclusion cerrada. El repositorio contiene unicamente el adaptador; los pesos del modelo anfitrion no se distribuyen publicamente.

El adaptador se entrena sobre un modelo anfitrion que la model card vincula con la familia Gemma 4 (etiqueta `gemma4`), aunque webAI no publica la arquitectura ni el tamano del modelo base. El artefacto publicado pesa aproximadamente 130 MB en f16 y el repositorio completo ocupa 0,1 GB. La relevancia actual reside en su enfoque: un contrato de salida estricto (un objeto JSON con campos obligatorios) y una mejora medida de +27,9 puntos en la tasa de cumplimiento del contrato frente al modelo anfitrion con el mismo prompt de rol.

El adaptador esta pensado para despliegues internos autorizados de Meridian-1 mediante llama.cpp, con un system prompt fijo que debe enviarse en cada peticion. La licencia es propietaria de webAI, Inc., lo que restringe su uso comercial y su redistribucion. Su interes tecnico esta en el diseno de evaluacion por contrato de persona y en el uso de DPO (segun las etiquetas del repositorio) para alinear el comportamiento del modelo con un rol concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre modelo anfitrion propietario Meridian-1, vinculado a la familia Gemma 4; arquitectura del anfitrion no disponible |
| Parametros totales | 65.011.712 (dato del repositorio; corresponde al adaptador, no al modelo anfitrion) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unico archivo publicado: `Meridian-1-researcher-lora-f16.gguf`, ~130 MB) |
| Idiomas soportados | no disponible |
| Licencia | propietaria (webAI, Inc.; todos los derechos reservados) |
| Formato de pesos | GGUF (adaptador LoRA convertido con `convert_lora_to_gguf.py`, commit 5cdadfc); existe una version PEFT en `webAI-Official/Meridian-1-researcher-lora-peft` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16, no un modelo completo. Se aplica sobre Meridian-1, un modelo anfitrion propietario cuyos pesos no se publican en Hugging Face; la model card lo asocia a Gemma 4 mediante etiquetas, pero no detalla su arquitectura interna, numero de parametros ni ventana de contexto. El adaptador se entreno especificamente para el system prompt de la persona "researcher" y para un contrato de salida JSON, de modo que fuera de ese prompt queda fuera de su distribucion de entrenamiento.

La informacion sobre el proceso de entrenamiento es deliberadamente escasa: la model card indica que los datos de entrenamiento, hiperparametros, mezcla de profesores y metricas intermedias son internos y se omiten. Las etiquetas del repositorio incluyen `dpo`, lo que sugiere un ajuste por preferencias (Direct Preference Optimization) ademas del entrenamiento supervisado del adaptador. El adaptador se entreno en modo `low_effort` con thinking activado (`enable_thinking: true`); como la plantilla de chat de Gemma 4 no tiene un conmutador separado de bajo esfuerzo, se usa la misma configuracion. La generacion esta limitada a un presupuesto de 4.096 tokens nuevos.

## Capacidades

- Generacion de texto con rol fijo: produce un informe fundamentado ("sourced brief") en lugar de una conclusion, siguiendo la persona "researcher".
- Salida estructurada: devuelve un unico objeto JSON con los campos obligatorios `persona`, `objective`, `brief` y `sources`, y los campos opcionales `gaps`, `contradictions` y `handoff`.
- Recopilacion y fundamentacion de informacion: orientado a reunir evidencia y citar fuentes dentro del informe.
- Gestion de vacios y contradicciones: puede declarar explicitamente lagunas de informacion y contradicciones detectadas mediante los campos opcionales del contrato.
- Rechazo correcto de peticiones fuera de alcance: entrenado para rechazar solicitudes que no corresponden a la persona (92,2 % de acierto en la suite de evaluacion).
- Resistencia a presion adversarial: mantiene el rol bajo intentos de manipulacion (87,2 % en la suite).
- Modo thinking activado durante la generacion.
- Tool calling, vision, audio y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion documental asistida: el adaptador recibe una pregunta y devuelve un JSON con un brief y una lista de fuentes, lo que permite integrar el resultado directamente en un pipeline de gestion documental sin postprocesar texto libre.
- Generacion de informes con trazabilidad: al exigir el campo `sources`, cada afirmacion puede auditarse contra las fuentes citadas, lo que encaja en flujos de compliance o revision editorial.
- Deteccion de lagunas de informacion: el campo opcional `gaps` permite que el sistema identifique que falta evidencia antes de escalar la consulta a un humano o a otra herramienta.
- Analisis de contradicciones entre documentos: el campo `contradictions` sirve para senalar discrepancias entre fuentes en procesos de revision de literatura o de due diligence.
- Orquestacion multiagente: el campo `handoff` facilita el traspaso del resultado a otra persona o agente dentro de un sistema multiagente, con un contrato de salida predecible.
- Clasificacion y filtrado de peticiones: gracias a su capacidad de rechazar solicitudes fuera de alcance (92,2 % en evaluacion), puede actuar como primera capa que deriva consultas no relacionadas con investigacion.
- Despliegue interno con llama.cpp: se sirve con `llama-server` y `--lora`, lo que permite integrarlo en infraestructura propia sin depender de APIs externas, siempre que se disponga de los pesos autorizados de Meridian-1.

## Benchmarks y rendimiento

Evaluacion sobre la suite de contrato de persona de Meridian-1: 720 casos reservados, adaptador frente a Meridian-1 con el mismo prompt de rol, ambos muestreados con temperatura 1,0, top-p 0,95 y top-k 64. Puntuaciones en porcentaje.

| Metrica | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa global de cumplimiento del contrato | 88,5 | 60,6 | +27,9 |
| Envoltorio de salida de persona valido | 94,4 | 66,7 | +27,8 |
| Tareas en alcance superadas | 97,8 | 77,8 | +20,0 |
| Rechazo correcto de peticiones fuera de alcance | 92,2 | 77,2 | +15,0 |
| Mantiene el rol bajo presion adversarial | 87,2 | 73,3 | +13,9 |
| Peticiones generales gestionadas dentro del rol | 76,7 | 13,9 | +62,8 |

Evaluacion propia sobre items reservados, adaptador frente a Meridian-1 con el mismo prompt de rol (intervalo de confianza del 95 % por bootstrap pareado):

| Tarea | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) | Intervalo 95 % | Items |
|---|---:|---:|---:|---|---:|
| QASPER, answerability equilibrada | 100,0 | 73,9 | +26,1 | +20,1 a +31,6 | 200 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 130 MB en f16, marginal frente al modelo anfitrion. El requisito real de VRAM viene determinado por Meridian-1, cuyas especificaciones no estan disponibles.
- GPU recomendadas: no disponible; depende del modelo anfitrion, no publicado.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano y la cuantizacion de Meridian-1.
- Despliegue: llama.cpp mediante `llama-server -m "$MERIDIAN_1_GGUF" --lora Meridian-1-researcher-lora-f16.gguf --jinja`. Requiere `--max-lora-rank 16` al servir y permite ajustar la fuerza del adaptador con `--lora-scaled`.
- Configuracion de inferencia de referencia: temperatura 1,0, top-p 0,95, top-k 64; presupuesto de hasta 4.096 tokens nuevos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El adaptador depende de un modelo anfitrion propietario no distribuido, por lo que no existen alternativas publicas directamente comparables en parametros, contexto o rendimiento con los datos proporcionados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Meridian-1-researcher-lora-GGUF | Adaptador LoRA rank 16 (65.011.712 parametros declarados) | no disponible | Propietaria | Solo adaptador; anfitrion no publicado |
| Meridian-1-researcher-lora-peft | Adaptador LoRA rank 16 | no disponible | Propietaria | Solo adaptador; anfitrion no publicado |
| Alternativas publicas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere los pesos de Meridian-1, que no se distribuyen en Hugging Face y solo estan disponibles para personal autorizado.
- Dependencia estricta del system prompt: sin el prompt exacto de la persona "researcher" (incluido el salto de linea antes de la instruccion de JSON), el adaptador opera fuera de su distribucion de entrenamiento.
- Contrato de salida rigido: el modelo esta entrenado para devolver un unico objeto JSON; usos que esperen texto libre pueden requerir postprocesado o no funcionar correctamente.
- Licencia propietaria de webAI, Inc.: todos los derechos reservados; el uso comercial y la redistribucion estan restringidos y requieren autorizacion.
- Transparencia limitada: no se publican datos de entrenamiento, hiperparametros, mezcla de profesores, arquitectura del anfitrion ni ventana de contexto, lo que dificulta la evaluacion independiente.
- Riesgo de alucinacion: aunque el contrato exige el campo `sources`, no hay garantia de que las fuentes citadas sean verificables; se recomienda validacion externa.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingue.
- Sesgos: no documentados en la informacion proporcionada.
- Rendimiento en peticiones generales dentro del rol: 76,7 %, el punto mas debil de la suite; conviene revisar casos limite antes de produccion.
- Fecha de publicacion futura en los metadatos (noviembre de 2026): verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webAI-Official/Meridian-1-researcher-lora-GGUF
- Version PEFT del adaptador: https://huggingface.co/webAI-Official/Meridian-1-researcher-lora-peft
- Modelo base (referenciado, no publicado): https://huggingface.co/webAI-Official/Meridian-1
- Script de conversion de LoRA a GGUF: `convert_lora_to_gguf.py` de llama.cpp (commit 5cdadfc)
