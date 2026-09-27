# tampajohn/laya-stop-completion-judge

## Resumen

Laya Stop-Completion Judge es un ajuste fino del modelo encoder convaiinnovations/laya (ModernBERT-large de 421 M de parametros mas una cabeza de decision tipada) desarrollado por el usuario tampajohn. El modelo resuelve un unico problema muy concreto: determinar si el turno de un agente de programacion ha terminado realmente o si se ha detenido dejando trabajo anunciado sin entregar. Para ello calcula P(incomplete) a partir del par (peticion del usuario, mensaje final del asistente) y lo hace en aproximadamente 25 ms sobre silicio de Apple.

La motivacion es practica y economica. En flotas de agentes tipo Claude Code que enrutan trabajo rutinario a modelos de pesos abiertos (Kimi K3, GLM) a traves de un proxy interno, esos modelos tienden a cerrar el turno con frases del estilo "he arreglado el localizador, ahora ejecuto las pruebas" y detenerse sin ejecutarlas. La primera solucion fue una guarda basada en expresiones regulares (stop_guard.py), que falla con formulaciones fuera de su vocabulario y no pondera contexto. Este checkpoint sustituye el patron fijo por juicio aprendido, lo que permite seguir usando el modelo mas barato capaz de hacer el trabajo y compensar su habito de parada prematura con un juez local de bajo coste.

El checkpoint se publica bajo licencia Apache 2.0, con pesos en safetensors, 421.293.830 parametros totales (de los que solo 26,5 M corresponden a la cabeza entrenada) y un repositorio de 1,7 GB. Es un modelo de una sola tarea, en ingles, con un limite efectivo de 1.024 tokens de estado empaquetado, y no esta pensado como router generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large con cabeza de decision tipada (heredada del modelo base Laya) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens de estado empaquetado (limite efectivo segun el autor); no disponible un contexto mayor |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Parametros entrenados | 26,5 M (cabeza de decision; encoder congelado) |
| Tamano del repositorio | 1,7 GB |
| Modelo base | convaiinnovations/laya |
| Fecha de creacion | 26 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Laya: un encoder ModernBERT-large de 421 M de parametros acoplado a una cabeza de decision tipada que responde a preguntas con opciones predefinidas. Sobre esa base, este checkpoint se ha entrenado con el encoder completamente congelado y solo la cabeza de decision activa (26,5 M de parametros). La funcion de perdida es la del repositorio original (log + spherical, estrictamente propia), con barajado del orden de opciones, 8 epocas, precision bf16 sobre Apple MPS y sobremuestreo 2:1 de la clase incompleta.

Los datos de entrenamiento son 2.627 pares reales de fin de turno (peticion del usuario, mensaje final del asistente) extraidos de transcripciones de sesiones de Claude Code de septiembre de 2026, correspondientes a la flota de un unico operador con sesiones en segundo plano mayoritariamente autonomas. Un fin de turno se define como el ultimo mensaje del asistente con texto antes del siguiente mensaje real del usuario, no la narracion intermedia del turno. Las etiquetas se destilaron a partir de un juez Kimi K3 con una rubrica fija (pasos siguientes anunciados pero no reportados = incompleto; resultados reportados, respuestas directas y cesiones explicitas = completo), con anulaciones manuales en los turnos interceptados por el hook y descarte de etiquetas por debajo de 0,5 de confianza. Las transcripciones son privadas y no se han publicado.

La innovacion tecnica relevante no esta en la arquitectura sino en el empaquetado del estado. El autor subraya que hay que usar el `state_pack.py` incluido en el repositorio, que coloca la cola del mensaje final en primer lugar; la serializacion por defecto del SDK base trunca el estado empezando por la cabeza, de modo que los mensajes finales largos pierden justamente la cola, que es donde aparecen los anuncios del tipo "next I'll...". Esa discrepancia explica en parte por que el modelo base falla en esta tarea.

## Capacidades

- Clasificacion binaria de fin de turno: produce P(incomplete) para el par (peticion del usuario, mensaje final del asistente).
- Juicio contextual frente a coincidencia de patrones: distingue un mensaje que reporta trabajo en cola de otro que anuncia trabajo propio pendiente, algo que la guarda regex previa no podia hacer.
- Deteccion de "danglers" fuera del vocabulario de la regex, como "Checking for stray em-dashes before calling it done:" o "Not in the first page, checking the next:".
- Puntuacion calibrada: ECE 0,057 y accuracy@0.5 de 0,87 sobre el conjunto de test retenido.
- Respuesta tipada: devuelve probabilidades por opcion (complete / incomplete) en lugar de texto libre.
- Inferencia de baja latencia: unos 25 ms por prediccion en MPS de la serie M de Apple.
- Capacidad multilingue: no disponible; el modelo es solo en ingles.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo de proposito general).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Guarda del hook Stop en flotas de agentes de codigo: integrado en un daemon (`layad`) que intercepta los hooks stop, subagent-stop y notification. Cuando el agente intenta cerrar el turno, el juez puntua P(incomplete) y, por encima del umbral de 0,75, bloquea la parada y devuelve el control al agente para que termine el trabajo o lo ceda de forma explicita.
- Enrutado economico de trabajo rutinario: permite enviar tareas mecanicas al modelo de pesos abiertos mas barato sin pagar precios de modelos frontera solo para garantizar cierres de turno fiables, ya que el juez local de 25 ms compensa el habito de parada prematura.
- Supervision de sesiones desatendidas en segundo plano: en ejecuciones sin operador humano, el modelo actua como red de seguridad que impide que una sesion quede cerrada con trabajo prometido y no ejecutado.
- Re-prompting automatico y bucles de auto-correccion: el hook puede reinyectar una instruccion de continuacion cuando detecta un turno incompleto, generando un ciclo cerrado de finalizacion sin intervencion humana.
- Auditoria post-hoc de transcripciones: aplicar el juez a los turnos ya registrados para cuantificar con que frecuencia un modelo o una configuracion de agente cierra turnos con promesas incumplidas, util como metrica de calidad en evaluaciones internas.
- Investigacion sobre comportamiento de agentes: sirve como instrumento de medida reproducible (AUROC 0,85) para estudiar la propension a la parada prematura entre distintos modelos y prompts.
- Filtrado y etiquetado de datos de agentes: al puntuar pares peticion/respuesta, puede emplearse para seleccionar o descartar trayectorias de entrenamiento segun su grado de finalizacion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre turnos reales retenidos, n = 315, con 59 positivos.

| Modelo | AUROC | Media P(inc) en completos | Media P(inc) en incompletos |
|---|---|---|---|
| Laya base, prompt heredado | 0,64 | 0,29 | 0,35 |
| Laya base, estado empaquetado | 0,57 | 0,31 | 0,33 |
| Este checkpoint | 0,85 | 0,08 | 0,49 |

Metricas adicionales del checkpoint: ECE 0,057 y accuracy@0.5 de 0,87. El autor indica que las metricas por epoca estan en `metrics.json`. El modelo base se situa en nivel de azar para esta tarea, por lo que la mejora procede integramente del ajuste fino. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos: 1,7 GB de repositorio; de forma derivada, unos 1,7 GB en fp32 y alrededor de 0,85 GB en bf16 para 421 M de parametros.
- VRAM estimada para inferencia: aproximadamente 0,9-1,0 GB en bf16 y 1,8-2,0 GB en fp32, incluyendo margen de activaciones. Cifra derivada del numero de parametros, no publicada por el autor.
- Dispositivos soportados: `mps` (Apple Silicon), `cuda` y `cpu`, segun el ejemplo de uso del autor.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM es suficiente; el modelo cabe tambien en CPU e iGPU. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: si, en practicamente todas las gamas actuales; el limite practico es la disponibilidad del SDK, no la memoria.
- Opciones de despliegue: SDK `laya` con `laya.load(...)` y el fichero `state_pack.py` del repositorio; en produccion, el autor lo ejecuta en un daemon de hooks (`layad`) como servidor local precargado al que los hooks stop, subagent-stop y notification llaman mediante curl. Soporte en vLLM, llama.cpp, Ollama, TGI u otros: no disponible.
- Latencia: aproximadamente 25 ms por prediccion en MPS de la serie M de Apple, con el modelo coexistiendo con el modelo base en un mismo daemon.
- Rendimiento/throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tampajohn/laya-stop-completion-judge | 421 M (26,5 M entrenados) | 1.024 tokens de estado | AUROC 0,85; accuracy@0.5 0,87 | Apache 2.0 | HuggingFace |
| convaiinnovations/laya (base) | 421 M | Limitado por el empaquetado del SDK base | AUROC 0,57-0,64; nivel de azar | no disponible | HuggingFace |
| Guarda regex `stop_guard.py` | no aplica | no aplica | Sin metrica publicada; falla con vocabulario no previsto y no pondera contexto | no disponible | Interna, no publicada |

Alternativas de terceros de la misma categoria (jueces de finalizacion de turno en modelos encoder pequenos): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Distribucion de un unico operador: los datos provienen de sesiones de agente en segundo plano con convenciones de casa muy marcadas (lineas de cierre `result:`, bucles de monitorizacion programados). Se espera deriva de dominio en chat interactivo o en otros frameworks de agentes.
- Etiquetas destiladas por un LLM: el modelo hereda los sesgos del juez etiquetador (Kimi K3); cerca del 10 % de las etiquetas conservadas eran borderline.
- Solo ingles y ventana efectiva de 1.024 tokens de estado empaquetado.
- Preguntas de aclaracion: el modelo sobrerreacciona ante mensajes finales que terminan en una pregunta directa (se observaron valores de 0,68-0,85). El autor recomienda suprimir el bloqueo en ese caso; estas comprobaciones de forma corresponden al codigo, no al modelo.
- Inflacion por entrada obsoleta: si se le pasa una linea de estado intermedia en lugar del mensaje final real, puede producir falsos bloqueos (se observo 0,85 en ese escenario). Hay que alimentarlo con el mensaje final verdadero del payload de parada del harness.
- Umbral no universal: el autor recomienda bloquear a partir de 0,75, pero calibrando sobre el trafico propio antes de activar el bloqueo.
- No es un router de proposito general: este checkpoint esta entrenado para una sola pregunta; para decisiones tipadas generales hay que usar el modelo base.
- Sin validacion externa: el repositorio tiene 0 descargas y 0 likes, y no se ha publicado articulo ni datos de replicacion independientes.
- Uso comercial: la licencia Apache 2.0 lo permite, pero las transcripciones de entrenamiento son privadas y no se liberan, lo que limita la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tampajohn/laya-stop-completion-judge
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Fichero `metrics.json` (metricas por epoca): incluido en el repositorio del modelo
- Fichero `state_pack.py` (empaquetado de estado y pregunta de finalizacion): incluido en el repositorio del modelo
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a paginas turisticas de la ciudad de Annecy y no guardan relacion con el modelo.
