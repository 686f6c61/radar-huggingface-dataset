# thurstonpowers/xll-spo-verifier

## Resumen

XLL SPO Verifier es un ajuste fino especializado en una tarea muy concreta: verificar afirmaciones del tipo sujeto-predicado-objeto (SPO) orientadas a actores, extraidas de estatutos y reglamentos de Estados Unidos. Lo desarrolla thurstonpowers y parte de Laya (convaiinnovations/laya), un modelo de 421 millones de parametros con backbone ModernBERT-large. Dada una seccion fuente y una afirmacion candidata (actor, relacion, objetivo), el modelo devuelve tres veredictos probabilísticos calibrados que responden a si la direccion de los roles es correcta, si la fuente respalda la relacion completa y si se preservan todas las restricciones de alcance.

El modelo no extrae relaciones por si mismo: esta disenado para emparejarse con XLL SPO Nemotron 4B, que se encarga de la extraccion de candidatos. La version v1.1 introduce un contrato de tres preguntas (direction_correct, claim_supported, scope_preserved) que rompe con la version anterior de una sola pregunta (claim_stated), por lo que las campanas que citan el checkpoint antiguo deben revisar la revision.

Su relevancia actual esta en el ambito del cumplimiento normativo automatizado y el fact-checking legal: ofrece un verificador ligero (1,7 GB de repositorio, ejecutable en CPU) que puede integrarse como paso de control en pipelines de extraccion de obligaciones regulatorias, con calibracion documentada y trazabilidad de pesos mediante hashes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone ModernBERT-large) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Laya, cuyo backbone es ModernBERT-large, una arquitectura transformer de tipo encoder orientada a tareas de comprension y clasificacion. Sobre esa base se realiza un ajuste fino de parametros completos para resolver tres preguntas de verificacion en una unica pasada forward. El contrato de preguntas esta congelado en `questions.json`, con sha256 canonico `d24107da8afca6260de1366b7a17e6a857b1e3a9e06b436ce9fffacfed993962`, y es identico byte a byte al usado en entrenamiento.

El entrenamiento se ejecuto en una flota DGX Spark con entrenamiento de parametros completos y ritmo termico (pausa a 87 °C, reanudacion a 80 °C), micro-batch 1 y batch efectivo 64. Se utilizaron 61.279 filas de entrenamiento (34.193 unicas) y 2.104 de desarrollo, con un solo epoch completado de los dos planificados por parada temprana del operador. La calibracion se hizo sobre 4.767 elementos disjuntos por grupo de fuente. Los datos de entrenamiento son `thurstonpowers/xll-spo-verifier`, en la ruta `v1.1/laya/`, con splits disjuntos por grupo de parte del CFR, deduplicacion exacta de payloads y rechazo de oro contradictorio. Los datos maestros provienen de fuentes federales de EE. UU. (eCFR/GPO).

## Capacidades

- Verificacion de afirmaciones SPO orientadas a actores: devuelve tres veredictos probabilisticos (noul, probabilidad de verdadero/falso) para direccion de roles, respaldo de la afirmacion y preservacion de alcance.
- Deteccion de asignacion incorrecta de roles semanticos (sujeto, predicado, objetivo, destinatario) respecto a como los redacta la fuente.
- Comprobacion de soporte completo de la relacion, incluyendo roles, accion, modalidad, negacion y significado del objetivo.
- Preservacion de restricciones de alcance: condiciones, excepciones, aplicabilidad, cantidades y alternativas AND/OR.
- Ejecucion en CPU, sin necesidad de GPU para inferencia.
- Procesamiento en una sola pasada forward para las tres preguntas.
- Integracion con pipelines de extraccion de relaciones (pensado para emparejarse con XLL SPO Nemotron 4B).
- No soporta tool calling, agentes multi-paso ni vision: es un clasificador de verificacion, no un modelo generativo de proposito general.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Verificacion de obligaciones regulatorias extraidas automaticamente: tras un pipeline de extraccion de relaciones sobre el eCFR, el modelo comprueba que cada afirmacion candidata respeta los roles y el alcance de la seccion fuente antes de incorporarla a una base de conocimiento de cumplimiento.
- Control de calidad en fact-checking legal: dado un fragmento normativo y una afirmacion generada por otro modelo, el verificador emite una banda de decision (fail si algun noul < 0,5, flag si < 0,65, pass en caso contrario) que enruta los casos dudosos a revision humana.
- Auditoria de resumenes normativos: cuando un sistema resume una seccion de un reglamento, el verificador comprueba que las relaciones sujeto-predicado-objeto del resumen mantienen las condiciones y excepciones del texto original.
- Deteccion de negaciones y modalidades perdidas: el modelo verifica que una afirmacion no invierta una negacion ni convierta un "puede" en un "debe", un error frecuente en la extraccion automatica de obligaciones.
- Construccion de grafos de actores regulatorios: en la fase de validacion de un grafo de relaciones entre actores (organismos, entidades reguladas, acciones), el verificador filtra aristas que no estan respaldadas por el texto fuente.
- Pipelines de cumplimiento en CPU: por su tamano (421 M) y su ejecucion en CPU, puede desplegarse como servicio de validacion en entornos sin GPU, por ejemplo en revisiones batch nocturnas de corpus regulatorios.
- Trazabilidad de decisiones: al devolver probabilidades calibradas y estar vinculado a revisiones fijas con hashes, permite registrar la justificacion de cada decision de verificacion en flujos auditables.

## Benchmarks y rendimiento

Evaluacion calibrada sobre conjunto de validacion retenido (`DEV_EVAL.json`, 6.312 elementos, disjuntos por grupo de fuente):

| Metrica | Valor |
|---|---|
| Precision (accuracy) | 0,949 |
| Confianza media | 0,968 |
| ECE (error de calibracion esperado) | 0,019 |
| Brier | 0,091 |
| Top-1 (Brier top-1) | 0,0455 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo esta especializado en una tarea de verificacion y no en evaluaciones generativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 421 M de parametros en precision completa (fp32) el peso ronda 1,7 GB, y en fp16 aproximadamente 0,85 GB.
- GPU recomendadas: no son necesarias; el autor indica que el modelo se ejecuta en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2-4 GB de memoria libre; tambien en CPU.
- Opciones de despliegue: libreria `laya` (carga mediante `laya.load`), con `snapshot_download` de `huggingface_hub` para fijar la revision. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLL SPO Verifier (este modelo) | 421 M | no disponible | Verificacion de afirmaciones SPO legales | Apache 2.0 | Hugging Face |
| XLL SPO Nemotron 4B | 4 B (aprox., segun nombre) | no disponible | Extraccion de relaciones SPO | no disponible | Hugging Face |
| Laya (base) | 421 M | no disponible | Modelo base ModernBERT-large | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada. La comparativa con XLL SPO Nemotron 4B es funcional (extraccion frente a verificacion), no de rendimiento.

## Limitaciones y advertencias

- Solo verifica afirmaciones enviadas: no detecta relaciones que nunca se propusieron; el soporte de una afirmacion no equivale a completitud de la seccion.
- Entrenado exclusivamente con fuentes federales de EE. UU. (datos maestros eCFR/GPO); Connecticut se usa en fases posteriores, no en entrenamiento, por lo que el rendimiento fuera de fuentes federales no esta garantizado.
- Los veredictos de alcance y roles son juicios del modelo sobre la evidencia citada; los flujos de adjudicacion deben tratar las banderas y fallos como colas de revision, no como verdad de referencia.
- Advertencia de calibracion: la temperatura noul ajustada se saturo en el limite superior del rango [0,5, 5], y el runtime de laya informa algunas entradas de temperatura del checkpoint fuera del intervalo valido (sustituidas por 0,5); las confianzas deben tratarse como aproximadamente calibradas.
- La regla de decision recomendada es el banding por umbrales (fail, flag, pass), que son heuristicas y no umbrales calibrados.
- Cambio incompatible: la v1.1 rompe con el verificador anterior de una sola pregunta (`claim_stated`); las campanas que citan `thurstonpowers/xll-laya-verifier (checkpoint laya-2ep)` deben referirse a la revision anterior disponible en el historial git.
- Un solo epoch completado de dos planificados, con parada temprana del operador.
- Idioma: solo ingles.
- Riesgo de alucinacion: no documentado explicitamente, pero al ser un clasificador sobre evidencia citada, el riesgo se traslada a la calidad de la evidencia y del candidato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/xll-spo-verifier
- Dataset de replicacion: https://huggingface.co/datasets/thurstonpowers/xll-spo-verifier
- Modelo de extraccion emparejado (XLL SPO Nemotron 4B): https://huggingface.co/thurstonpowers/xll-spo-nemotron-4b
- Modelo base (Laya): https://huggingface.co/convaiinnovations/laya
- Contrato de preguntas: `questions.json` dentro del repositorio del modelo (sha256 canonico `d24107da8afca6260de1366b7a17e6a857b1e3a9e06b436ce9fffacfed993962`; sha256 de fichero bruto `1de33a92f9a0a9b33a757d308620484cba6982980395d9b86c61d8ed13737469`)
- Procedencia de pesos: `WEIGHTS_PROVENANCE.json` dentro del repositorio del modelo
