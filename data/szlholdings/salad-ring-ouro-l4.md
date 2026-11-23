# SZLHOLDINGS/salad-ring-ouro-l4

## Resumen

salad-ring-ouro-l4 es un artefacto de modelo publicado por SZLHOLDINGS dentro de su denominado "governed-AI estate", un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts). El repositorio tiene un tamano de 1,4 GB y contiene pesos en formato safetensors, lo que sugiere un modelo de pequeno o medio tamano, aunque la model card no especifica parametros, arquitectura ni contexto.

La informacion publicada es deliberadamente escasa: la model card no documenta arquitectura, datos de entrenamiento, idiomas, licencia ni pipeline. El autor declara explicitamente que cualquier afirmacion sobre calidad o capacidad queda marcada como UNKNOWN hasta que existan recibos de evaluacion medidos, y el escaneo de recibos de 2026-11-22 clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, con ficheros de recibos presentes pero sin un DONE.json estricto que valide la evaluacion.

Por tanto, esta ficha se limita a reflejar los metadatos verificables del repositorio y marca como no disponible todo aquello que la model card no acredita. No es posible recomendar el modelo para produccion sin una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-17 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no indica si se trata de un transformer denso, un MoE, un modelo hibrido o cualquier otra variante, ni detalla numero de capas, dimensiones ocultas, mecanismo de atencion o contexto maximo.

Tampoco se documentan los datos de entrenamiento: no hay referencia al numero de tokens, composicion del corpus, tecnicas de alineamiento (RLHF, DPO, SFT) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor remite a los recibos del "estate mesh" para cualquier afirmacion de entrenamiento o evaluacion, pero el escaneo estricto de recibos no encuentra un DONE.json valido, por lo que la evidencia de entrenamiento queda marcada como UNKNOWN.

## Capacidades

- Generacion de texto: no confirmada por evidencia medida.
- Razonamiento, codigo y matematicas: no confirmados.
- Vision, audio o modalidades adicionales: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking o cualquier capacidad especial: no disponible.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin informacion sobre arquitectura, contexto, idiomas o rendimiento medido. Los siguientes escenarios son genericos y quedan condicionados a una evaluacion previa del artefacto:

- Experimentacion interna en laboratorio: uso del checkpoint en tareas de exploracion controlada, siempre que se valide primero su comportamiento con un conjunto de pruebas propio.
- Evaluacion comparativa de artefactos del estate SZLHOLDINGS: utilidad como muestra para auditar el proceso de publicacion y recibos del autor.
- Pruebas de reproducibilidad: verificacion de que los pesos safetensors cargan correctamente en frameworks estandar (PyTorch, safetensors) antes de cualquier uso posterior.
- Investigacion sobre gobernanza de modelos: analisis de como un autor documenta (o no) capacidades y limitaciones mediante ficheros de recibos.
- Fines educativos: ejemplo de model card con marcado explicito de incertidumbre (MEASURED/REPORTED/UNKNOWN).
- Cualquier uso en produccion, atencion al cliente, generacion de codigo o agentes queda desaconsejado hasta que exista evidencia medida de calidad y una licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos de 2026-11-22 no encuentra evidencia de evaluacion estricta (eval_rc valido con DONE.json).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repo (1,4 GB) sugiere que los pesos caben en GPU de consumo, pero se desconoce el numero de parametros y el contexto maximo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si por el tamano del repositorio, pero no confirmado.
- Opciones de despliegue: no documentadas; al estar en safetensors, seria necesario un framework compatible (PyTorch, transformers, vLLM) cuya idoneidad no se ha verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables ni se dispone de informacion sobre parametros, contexto o rendimiento que permita establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura, parametros, contexto ni idiomas.
- Licencia no disponible: no puede utilizarse con seguridad en entornos comerciales sin aclaracion previa del autor.
- Sin evidencia de evaluacion medida: el escaneo de recibos clasifica el repositorio como RECEIPT_FILES_NO_DONE, por lo que no hay garantia de calidad ni de capacidades.
- Riesgo de alucinacion y sesgos: desconocidos, al no existir evaluacion publicada.
- Model card generada automaticamente: parte del contenido procede de una herramienta de generacion de tarjetas (estate-cards weaver v0.1.0), lo que no sustituye una evaluacion independiente.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la probabilidad de validacion por terceros.
- No apto para produccion sin una auditoria propia que cubra carga de pesos, comportamiento, sesgos y licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l4
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
