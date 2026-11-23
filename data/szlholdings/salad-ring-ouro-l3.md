# SZLHOLDINGS/salad-ring-ouro-l3

## Resumen

salad-ring-ouro-l3 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": una colección de modelos, datasets y Spaces con resultados documentados mediante ficheros de recibo (receipts) auditables. El repositorio de Hugging Face contiene pesos en formato safetensors con un tamaño total de 1,2 GB, lo que sugiere un modelo de pequeno tamano, pero la model card no especifica arquitectura, numero de parametros ni longitud de contexto.

La información disponible es deliberadamente escasa: la tarjeta se limita a describir la identidad del repositorio, enlazar a la organización en GitHub y presentar graficos SVG generados de forma determinista a partir de una instantanea de auditoria. El propio autor declara que cualquier afirmación sobre calidad o capacidades queda marcada como UNKNOWN hasta que exista evidencia medida, y el escaneo de recibos mas reciente clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, sin un DONE.json estricto que valide resultados de evaluacion.

Por tanto, esta ficha no puede confirmar rendimiento, idiomas, licencia ni casos de uso verificados. Es relevante únicamente como ejemplo de practica de documentacion orientada a trazabilidad, no como modelo evaluable para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (repo de 1,2 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida) ni sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO, o innovaciones tecnicas como decodificacion especulativa o atención lineal. La model card indica explicitamente que las afirmaciones de entrenamiento y evaluacion viven en ficheros de recibo del "estate mesh" y que cualquier dato no recibido se considera UNKNOWN.

El unico dato estructural verificable es el tamano del repositorio (1,2 GB) y la presencia de pesos en safetensors, ademas de graficos SVG generados con Python de la biblioteca estandar a partir de una instantanea de auditoria fechada el 2026-11-20T03:48:04Z. El escaneo de recibos del 2026-11-22 clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg) pero no un DONE.json con status=MEASURED, eval_rc=0 y marca temporal que satisfaga el umbral estricto del autor.

## Capacidades

- Generacion de texto: no confirmada; no hay evidencia medida en la informacion disponible.
- Razonamiento, codigo y matematicas: no disponible.
- Vision o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Auditoria de pipelines de documentacion de modelos: el repositorio sirve como ejemplo de tarjeta generada de forma determinista con etiquetado MEASURED/REPORTED/UNKNOWN y verificacion en origen, util para disenar plantillas de trazabilidad internas.
- Evaluacion de practicas de gobernanza de IA: permite estudiar como se estructura un "estate" con recibos de auditoria y umbrales estrictos (DONE.json con status=MEASURED y eval_rc=0) antes de aceptar afirmaciones de calidad.
- Pruebas de integracion con safetensors: al ser un artefacto de 1,2 GB en formato safetensors, puede usarse para validar cargadores, pipelines de conversion a GGUF o herramientas de inspeccion de pesos, sin asumir ninguna capacidad concreta del modelo.
- Docencia sobre honestidad en model cards: el texto declara explicitamente que no se afirma ningun benchmark mas alla de lo medido en una auditoria fechada, lo que lo convierte en material de discusion sobre reproducibilidad.
- Verificacion de procedencia y enlaces canonicos: la tarjeta enlaza a la organizacion szl-holdings en GitHub y a la herramienta estate-cards, lo que permite practicar flujos de verificacion de origen de artefactos.
- Analisis de metadatos de Hugging Face: con 0 descargas y 0 likes en el momento de la consulta, sirve para estudiar repositorios de baja adopcion y como se reflejan en la API del Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la arquitectura y el numero de parametros, que no se declaran.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repositorio (1,2 GB) es compatible con GPUs de consumo en terminos de almacenamiento, pero no se puede afirmar nada sobre VRAM de inferencia sin conocer la arquitectura.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se ha confirmado que los pesos sean convertibles o cargables por estas herramientas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica la categoria del modelo (tamano, tarea, arquitectura), por lo que no es posible establecer comparaciones fundamentadas con alternativas.

## Limitaciones y advertencias

- Ausencia total de evidencia de evaluacion: el escaneo de recibos clasifica el repositorio como RECEIPT_FILES_NO_DONE; no hay DONE.json con status=MEASURED ni eval_rc=0.
- Licencia no declarada: no se puede asumir permiso para uso comercial, redistribucion o modificacion.
- Idiomas no declarados: imposible garantizar cobertura linguistica, incluido el castellano.
- Arquitectura y parametros desconocidos: impide estimar VRAM, latencia o idoneidad para tareas concretas.
- Riesgo de alucinacion: no evaluable sin datos de entrenamiento ni pruebas de comportamiento.
- Sesgos conocidos: no disponible.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes): sin senales de uso comunitario ni validacion externa.
- Los graficos SVG de la tarjeta son generados de forma determinista a partir de una instantanea de auditoria, pero no constituyen evidencia de calidad del modelo.
- No apto para produccion sin una evaluacion independiente previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (enlace canonico citado en la tarjeta): https://github.com/szl-holdings
- Herramienta estate-cards (generador de tarjetas): https://github.com/szl-holdings/estate-cards
