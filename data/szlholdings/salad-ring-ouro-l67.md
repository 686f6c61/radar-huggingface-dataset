# SZLHOLDINGS/salad-ring-ouro-l67

## Resumen

salad-ring-ouro-l67 es un artefacto de modelo publicado por SZLHOLDINGS dentro de su denominada "governed-AI estate", un conjunto de repositorios de modelos, datasets y Spaces que la organizacion presenta como auditables mediante ficheros de recibos (receipts). El repositorio no documenta arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados; la model card se limita a describir la infraestructura de trazabilidad de la organizacion.

La relevancia tecnica del artefacto es, a fecha de la informacion disponible, nula para evaluacion practica: no se ha publicado ninguna cifra de rendimiento, no hay pesos descritos en un formato reconocible y el propio escaneo de recibos de la organizacion clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, con ficheros con nombre de recibo pero sin el DONE.json estricto que su propio estandar exige como evidencia de evaluacion medida.

En consecuencia, esta ficha documenta lo que se puede verificar del repositorio (metadatos de Hugging Face, estructura de la model card y estado de la evidencia) y marca explicitamente como no disponible todo aquello que el autor no ha publicado. No debe interpretarse como una recomendacion de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion lineal.

El unico elemento estructural documentado es el sistema de recibos de la organizacion: la card afirma que las aseveraciones de entrenamiento y evaluacion del artefacto residen en ficheros de recibo del "estate mesh", y que cualquier dato no registrado en ellos se marca como UNKNOWN. El escaneo de recibos del 22 de noviembre de 2026 clasifica este repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg) pero no existe un DONE.json estricto con status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento. La evidencia de evaluacion figura como UNKNOWN.

## Capacidades

- Generacion de texto: no disponible; no se documenta ninguna capacidad concreta.
- Razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

No se puede confirmar ninguna capacidad funcional del artefacto a partir de la informacion publicada.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones tecnicas verificables. Los siguientes escenarios solo serian planteables si el autor publicase la informacion hoy ausente:

- Evaluacion comparativa interna: solo si se publican pesos en un formato estandar (safetensors o GGUF) y una licencia que permita el uso; actualmente ninguno de los dos esta documentado.
- Integracion en pipelines de investigacion: requeriria conocer arquitectura, tokenizador y contexto, datos no disponibles.
- Despliegue en atencion al cliente: imposible de dimensionar sin conocer el tamano del modelo ni su ventana de contexto.
- Generacion de codigo asistida: sin benchmarks ni soporte de tool calling documentado, no hay base para evaluar su idoneidad.
- Fine-tuning sobre dominio propio: sin licencia declarada no se puede determinar si el ajuste esta permitido.
- Uso comercial en producto: la ausencia de licencia explicita impide cualquier explotacion comercial legitima.
- Auditoria de trazabilidad: el unico uso verificable hoy es inspeccionar el propio sistema de recibos de SZLHOLDINGS como caso de estudio de gobernanza de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamano del modelo, que no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se indica formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una categoria de comparacion (tamano, tarea, modalidad) porque el repositorio no publica parametros, contexto, licencia ni resultados. Cualquier comparacion con modelos abiertos conocidos seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones: sin arquitectura, parametros, contexto ni formato de pesos, el artefacto no es evaluable ni desplegable de forma informada.
- Licencia no declarada: no hay base legal para uso comercial, redistribucion ni fine-tuning; en la practica equivale a todos los derechos reservados por defecto.
- Evidencia de evaluacion inexistente: el propio sistema de recibos del autor marca el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de evaluacion como UNKNOWN.
- Riesgo de alucinacion y sesgos: no evaluables sin pesos ni evaluaciones publicadas.
- Idiomas: no declarados; no se puede asumir soporte del castellano ni de ningun otro idioma.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso o validacion por terceros.
- Fechas de creacion y actualizacion (noviembre de 2026) posteriores a la mayoria de referencias del ecosistema: conviene verificar la vigencia del repositorio antes de cualquier dependencia.
- La model card contiene graficos SVG generados de forma determinista y etiquetas MEASURED/REPORTED/UNKNOWN, pero ninguno de esos graficos constituye evidencia validada de calidad del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l67
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada): https://github.com/szl-holdings
- Herramienta de generacion de cards citada: https://github.com/szl-holdings/estate-cards
