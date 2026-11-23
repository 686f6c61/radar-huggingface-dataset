# SZLHOLDINGS/salad-ring-ouro-l77

## Resumen

salad-ring-ouro-l77 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados verificables y trazabilidad de origen. El repositorio se creo el 19 de noviembre de 2026 y se actualizo cuatro dias despues, sin descargas ni interacciones registradas en Hugging Face. No existe informacion publica sobre arquitectura, tamano, datos de entrenamiento ni capacidades del modelo.

La model card es un documento generado automaticamente por la herramienta estate-cards weaver del propio autor, con graficos SVG deterministas y un enfasis explicito en la honestidad de las metricas: cualquier dato no respaldado por un recibo de evaluacion medido se etiqueta como UNKNOWN. La seccion de recibos del 22 de noviembre de 2026 clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, contiene archivos con nombre de recibo pero no un DONE.json estricto con estado MEASURED, codigo de salida de evaluacion cero y marca temporal. En consecuencia, la evidencia de evaluacion es desconocida.

Por tanto, esta ficha no puede caracterizar tecnicamente el modelo: no hay parametros, contexto, licencia, idiomas ni benchmarks declarados. El interes de la ficha es documentar el estado real del artefacto y advertir de que no es apto para uso en produccion ni para evaluacion comparativa hasta que el autor publique evidencia medida.

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

No se ha publicado informacion sobre la arquitectura del modelo. La model card no describe si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico dato tecnico relevante es de caracter procesal: el autor declara que las afirmaciones de entrenamiento y evaluacion de este artefacto residen en sus archivos de recibo dentro de la malla del estate, y que cualquier cosa no registrada en un recibo se considera UNKNOWN. El escaneo estricto del 22 de noviembre de 2026 no encontro un DONE.json que cumpla el umbral de evidencia, por lo que no existe confirmacion medida de que el entrenamiento se completara con exito ni de sus caracteristicas.

## Capacidades

- Generacion de texto: no confirmada; no hay evidencia medida ni documentacion de capacidades.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Evaluacion interna de artefactos gobernados: el repositorio puede usarse como ejemplo de como SZLHOLDINGS estructura sus fichas generadas y sus recibos de auditoria, util para equipos que disenen pipelines de trazabilidad de modelos.
- Auditoria de cadena de custodia: un investigador puede inspeccionar los SVG de recibos y el identificador de tarjeta (be887f2250c02520) para estudiar mecanismos de verificacion determinista en publicaciones de modelos.
- Docencia sobre honestidad en model cards: el caso ilustra la diferencia entre archivos con nombre de recibo y evidencia medida real, adecuado para formar a equipos en revision de artefactos.
- Pruebas de integracion de herramientas de escaneo: el estado RECEIPT_FILES_NO_DONE sirve como caso negativo para validar escaneres que detectan ausencia de DONE.json estricto.
- Archivado y preservacion: util para documentar el estado de un artefacto sin uso practico conocido en una fecha concreta.
- No se recomienda ningun caso de uso en produccion, atencion al cliente, generacion de codigo ni analisis de datos, dado que no hay evidencia de capacidades ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto del 22 de noviembre de 2026 no encontro evidencia de evaluacion valida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; se desconoce el tamano del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se conocen formatos de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria porque se desconoce la categoria, el tamano y la tarea del modelo. El resto de artefactos de la familia "salad" del mismo autor aparece mencionado en la seccion de recibos, pero no se proporcionan sus especificaciones en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no hay datos de arquitectura, parametros, contexto ni formatos de pesos, lo que impide cualquier evaluacion tecnica.
- Evidencia de evaluacion desconocida: el escaneo estricto clasifica el repositorio como RECEIPT_FILES_NO_DONE, sin DONE.json con estado MEASURED.
- Licencia no declarada: no puede determinarse si el uso comercial esta permitido; debe asumirse que no lo esta hasta que el autor lo especifique.
- Idiomas no declarados: no puede confirmarse soporte de castellano ni de ningun otro idioma.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo y sin benchmarks publicados.
- Cero adopcion verificable: cero descargas y cero likes en el momento de la consulta, sin senales de uso por la comunidad.
- Fecha de creacion futura respecto a la mayoria de referencias disponibles: conviene verificar la autenticidad y vigencia del repositorio antes de cualquier uso.
- No apto para produccion: sin evidencia medida de calidad, seguridad ni comportamiento, su uso en sistemas reales no esta justificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l77
- Organizacion del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de fichas estate-cards: https://github.com/szl-holdings/estate-cards
