# SZLHOLDINGS/salad-ring-ouro-l63

## Resumen

salad-ring-ouro-l63 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": una coleccion de modelos, datasets y Spaces con trazabilidad documental mediante ficheros de recibos (receipts). El repositorio no proporciona informacion sobre la arquitectura, el tamano, el contexto ni los datos de entrenamiento del modelo; la model card se limita a describir el marco de gobernanza y auditoria del autor.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: no hay pipeline declarado, no hay licencia especificada, no hay idiomas declarados y no se ha publicado ningun resultado de evaluacion medido. La propia model card indica explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion debe residir en ficheros de recibos, y que lo que no este respaldado por esos recibos se considera UNKNOWN.

El escaneo de recibos de la tranche 6 (chunk 8, 2026-11-22) clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo, pero no hay un DONE.json estricto con status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento. Por tanto, la evidencia de evaluacion es UNKNOWN y no se puede verificar ninguna capacidad del modelo.

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

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. No consta si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante, ni se especifican dimensiones, numero de capas o mecanismos de atencion.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card declara que las afirmaciones de entrenamiento y evaluacion deben consultarse en los ficheros de recibos del "estate mesh", pero el escaneo estricto no ha encontrado un DONE.json que las valide.

## Capacidades

- Generacion de texto: no confirmada; no hay evidencia medida en el repositorio.
- Razonamiento, codigo y matematicas: no confirmados.
- Vision, audio o multimodalidad: no confirmados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos para este modelo porque no se ha verificado ninguna capacidad mediante recibos de evaluacion medidos. Los siguientes escenarios son genericos y quedan condicionados a que el autor publique evidencia:

- Evaluacion interna controlada: desplegar el modelo en un entorno aislado para comprobar si genera texto coherente y determinar su naturaleza real antes de cualquier uso.
- Auditoria de gobernanza: usar el repositorio como caso de estudio del marco de recibos de SZLHOLDINGS y verificar si los ficheros de auditoria cumplen el estandar estricto.
- Pruebas de integracion de pipeline: comprobar si el artefacto se puede cargar con bibliotecas estandar (transformers, vLLM) una vez identificado el formato de pesos.
- Comparacion de trazabilidad: contrastar el modelo con otros artefactos del mismo estate para evaluar la consistencia del sistema de recibos.
- Investigacion sobre reproducibilidad: analizar por que un repositorio con ficheros de recibo no alcanza el umbral DONE.json y que implicaciones tiene para la verificacion de modelos.
- Docencia sobre evaluacion de modelos: utilizar la ficha como ejemplo de model card sin especificaciones tecnicas ni benchmarks verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamano del modelo, que no se ha publicado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se conoce el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa fiable sin conocer parametros, contexto, licencia ni rendimiento del modelo. Cualquier comparacion con alternativas de la misma categoria seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se conocen arquitectura, parametros, contexto ni formato de pesos, lo que impide planificar su despliegue.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido; tratarlo como no apto para produccion hasta que el autor lo aclare.
- Evidencia de evaluacion UNKNOWN: el escaneo estricto no encuentra DONE.json con status=MEASURED, por lo que no hay garantia de calidad ni de capacidades.
- Riesgo de alucinacion: no evaluable sin benchmarks ni pruebas controladas.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas.
- Sesgos: no documentados.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la probabilidad de validacion por terceros.
- La model card esta generada de forma automatica por una herramienta del propio autor (estate-cards weaver v0.1.0), lo que no constituye evidencia independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l63
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de fichas del autor: https://github.com/szl-holdings/estate-cards
