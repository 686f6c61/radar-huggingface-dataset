# thinkingdbx/FIELDNOTEx-500M

## Resumen

FIELDNOTEx-500M es un modelo de generación de texto especializado en extracción de información estructurada a partir de notas de mantenimiento industrial. Desarrollado por el usuario thinkingdbx y publicado en HuggingFace, el modelo convierte una nota escrita por un técnico (por ejemplo, "P-104 leaking at the seal, replaced 2x seal, pressure back to 3.2 bar") en un único registro JSON con campos normalizados: identificador del activo, tipo de equipo, avería, severidad, acción realizada, repuestos, lecturas y seguimiento.

Técnicamente es un fine-tune completo (no LoRA) de Qwen2.5-0.5B-Instruct, con 494 millones de parámetros, y se distribuye tanto en pesos transformers (safetensors fp32) como en dos exportaciones ONNX cuantizadas (INT4 de 452 MB e INT8 de 1.051 MB). Su relevancia está en el nicho del edge computing: es lo bastante pequeño para ejecutarse sin red en una Raspberry Pi 5, lo que lo hace útil para digitalizar registros de mantenimiento en planta sin conexión a internet ni dependencia de APIs externas.

Es un modelo de tarea única y estrecha: no es un asistente conversacional generalista, sino un componente de pipeline que requiere usar el prompt exacto de entrenamiento y decodificación greedy para obtener resultados fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), fine-tune completo de Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct; el uso típico es ~270 tokens de prompt + ~70 de salida) |
| Tipos de cuantizacion | INT4 (bloques de 16, simétrica, embedding cuantizado, 452 MB) e INT8 (weight-only, bloques de 32, embedding en fp32, 1.051 MB), en formato ONNX |
| Idiomas soportados | Ingles (entrenado y evaluado solo con notas en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 1,98 GB) y ONNX (INT4 e INT8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder de 494 millones de parámetros, y ha sido sometido a un fine-tune completo (full fine-tune) para una única tarea: transformar notas de mantenimiento en un registro JSON con esquema fijo. No es un modelo MoE ni una arquitectura híbrida; la innovación está en el enfoque de datos y despliegue, no en la arquitectura.

El entrenamiento se realizó con una única instrucción exacta (publicada en el archivo `prompt.txt` del repositorio), con la nota del técnico concatenada tras `Field note: `. Los detalles del dataset (número de notas, composición, tamaño en tokens) no están disponibles en la model card, aunque los conjuntos de evaluación (300 notas held-out generadas y 40 notas escritas a mano) sugieren un pipeline de generación sintética de datos. No se menciona el uso de RLHF ni DPO, lo cual es coherente con la naturaleza determinista de la tarea. Para inferencia, el autor recomienda usar el prompt de entrenamiento palabra por palabra y decodificación greedy; cualquier otro prompt o muestreo degrada la calidad de los registros.

Las exportaciones ONNX se generaron con optimum-onnx 0.1.0 y onnxruntime 1.31.0. La versión INT4 usa el operador `MatMulNBits`, que requiere una versión reciente de ONNX Runtime.

## Capacidades

- Extraccion de informacion estructurada: convierte notas de mantenimiento en lenguaje natural a un registro JSON con esquema fijo de 9 campos (`asset_id`, `asset_type`, `issue`, `severity`, `action`, `parts`, `reading`, `follow_up`, `due_days`).
- Salida JSON valida: el 100% de las 340 respuestas de evaluación parsearon como JSON sin errores de formato.
- Normalizacion de valores: traduce expresiones como "2 weeks" a `due_days: 14`, o "104C" a `reading: {"value": 104, "unit": "C"}`.
- Listas cerradas de valores: `asset_type` (10 tipos: pump, compressor, conveyor, motor, valve, boiler, chiller, fan, generator, press), `issue` (10 valores), `severity` (low, medium, high, critical o null) y `action` (8 valores).
- Ejecucion en edge: cabe en una Raspberry Pi 5 sin conexion a red, gracias a las exportaciones ONNX cuantizadas.
- No es un modelo conversacional generalista: no soporta tool calling, agentes, razonamiento multi-paso, vision ni audio. No tiene modo thinking.

## Casos de uso

- Digitalizacion de registros de mantenimiento en planta: un tecnico escribe o dicta una nota libre y el modelo la convierte en un registro JSON que un CMMS (sistema de gestion de mantenimiento) puede archivar automaticamente, eliminando la transcripcion manual.
- Despliegue offline en edge: gracias al export INT4 de 452 MB, puede correr en una Raspberry Pi 5 sin red, adecuado para naves industriales, barcos o instalaciones remotas sin conectividad fiable.
- Ingesta automatica de partes de trabajo: integracion en pipelines ETL que procesan notas de campo en lote, validando y archivando miles de registros diarios sin intervencion humana.
- Deteccion de seguimientos pendientes: los campos `follow_up` y `due_days` permiten alimentar automaticamente sistemas de planificacion de visitas y recordatorios de reinspection.
- Monitorizacion de lecturas de equipo: extraccion de medidas (presion en bar, temperatura en C, vibracion en mm/s, corriente en A, rpm) para series temporales de condition monitoring.
- Clasificacion de severidad y priorizacion: el campo `severity` permite triage automatico de incidencias criticas (por ejemplo, un compresor a 104 C marcado como "critical") para escalar a los equipos de urgencias.
- Base para validacion con reglas de negocio: al ser salida JSON con esquema fijo, es sencillo anadir capas de validacion (valores fuera de lista, IDs de activo inexistentes) antes de archivar.

## Benchmarks y rendimiento

El autor publica metricas de exact match (todos los campos del registro correctos) sobre dos conjuntos de prueba. El modelo base Qwen2.5-0.5B-Instruct sin fine-tune obtiene 0% en ambos.

| Version | Held-out phrasings (300 notas) | Hand-written (40 notas) |
|---|---|---|
| Full precision (fp32) | 71,7% | 80,0% |
| ONNX INT8 (1.051 MB) | 71,7% | 80,0% |
| ONNX INT4 (452 MB) | 72,0% | 77,5% |

Notas del autor sobre estos resultados: INT8 produce exactamente la misma respuesta que full precision en las 340 notas; INT4 rompe 5 notas y repara 6 en held-out y rompe 1 en hand-written, diferencias atribuibles al azar. Con solo 40 notas escritas a mano, cada nota equivale a 2,5 puntos. No se han publicado comparaciones con otros modelos de extraccion ni benchmarks estandar (MMLU, HumanEval, etc.).

Velocidad de decodificacion medida en 4 hilos de un host x86 en la nube: 29 tok/s para INT4 y 30 tok/s para INT8. Un registro son unos 70 tokens tras un prompt de unos 270. El techo teorico por ancho de banda de memoria de una Raspberry Pi 5 es de unos 45 tok/s para INT4 y 30 para INT8; el autor indica que aun no ha cronometrado el modelo en una Pi real.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: unos 452 MB para la version ONNX INT4, unos 1.051 MB para INT8 y unos 1,98 GB para los pesos fp32 en safetensors. Con overhead de runtime, la version INT4 deberia funcionar comodamente en sistemas con 1-2 GB de RAM disponibles.
- GPU recomendadas: no son necesarias. Al ser un modelo de 494M de parametros orientado a CPU/edge, cualquier GPU moderna lo ejecuta sin problema, pero el caso de uso principal es CPU.
- Consumer hardware: cabe sobradamente en una Raspberry Pi 5 (objetivo declarado del autor) y en cualquier portatil o mini-PC x86/ARM con al menos 2 GB de RAM libres. En la version INT4, el techo de velocidad por ancho de banda de memoria de la Pi 5 se estima en ~45 tok/s.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime con optimum-onnx (versiones 0.1.0 de optimum-onnx y 1.31.0 de onnxruntime; el export INT4 requiere ONNX Runtime reciente por `MatMulNBits`). No hay evidencia de soporte verificado en llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: 29-30 tok/s de decodificacion en 4 hilos de CPU x86 en la nube; un registro completo (~70 tokens) tarda aproximadamente 2,4 segundos en esa configuracion. No hay mediciones en Raspberry Pi todavia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FIELDNOTEx-500M | 494M | Extraccion de notas de mantenimiento a JSON | no disponible | Apache 2.0 | HuggingFace (safetensors + ONNX INT4/INT8) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494M | Chat generalista | 32K (según ficha oficial de Qwen) | Apache 2.0 | HuggingFace, amplio ecosistema |
| Qwen/Qwen2.5-1.5B-Instruct | 1.570M | Chat generalista | 32K (según ficha oficial de Qwen) | Apache 2.0 | HuggingFace, amplio ecosistema |

Comparacion: FIELDNOTEx-500M sacrifica la generalidad del modelo base a cambio de fiabilidad en una tarea estrecha (el base obtiene 0% de exact match en la tarea frente al 71,7-80% del fine-tune). Frente a usar un LLM mayor vía API para la misma tarea, FIELDNOTEx ofrece ejecucion offline, coste marginal por inferencia casi nulo y latencia predecible, a costa de cobertura solo en ingles y de errores sistematicos en formulaciones no vistas. No hay otros modelos publicos comparables específicos de extraccion de notas de mantenimiento en la informacion disponible.

## Limitaciones y advertencias

- Errores sistematicos documentados: la palabra "sorted it out" produce `"action": "sorted"` (valor fuera de lista) en las 26 notas held-out donde aparece; deberia ser `repaired`. Copiar palabras de la nota es la forma mas comun de que el modelo salga de sus listas.
- Ambiguedad en formulaciones no vistas: "running rough" se clasifica como `vibration` en 4 de 16 notas y como `none` en las 12 restantes; "keeps tripping out" (fallo electrico) se lee como `vibration` en una parte de los casos (la model card se corta en este punto).
- Validacion obligatoria: el autor recomienda explicitamente comprobar cada valor contra las listas cerradas antes de archivar el registro; el modelo puede generar valores fuera de las listas aunque no los haya aprendido.
- Solo ingles: el modelo fue entrenado y evaluado exclusivamente con notas en ingles; no hay soporte para castellano ni otros idiomas.
- Prompt rigido: hay que usar el prompt exacto de `prompt.txt` y decodificacion greedy; otros prompts o muestreo empeoran los resultados.
- Sin benchmarks estandar: no hay comparativas con alternativas (LLMs generales, modelos NER clasicos) mas alla de las metricas propias del autor, y el conjunto hand-written es muy pequeno (40 notas, 2,5 puntos por nota).
- Sesgos: no evaluados explicitamente; al entrenarse con datos aparentemente sinteticos, puede haber desajuste con la jerga real de tecnicos (los errores en held-out apuntan en esa direccion).
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes; no obstante, el modelo hereda la licencia del base Qwen2.5, tambien Apache 2.0.
- Rendimiento en el objetivo declarado (Raspberry Pi 5) aun sin medir: las cifras de velocidad en Pi son estimaciones teoricas por ancho de banda de memoria.
- Riesgo de alucinacion bajo pero presente: la salida es siempre JSON valido en los tests, pero los valores de los campos pueden ser incorrectos o inventados a partir de palabras de la nota.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thinkingdbx/FIELDNOTEx-500M
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
