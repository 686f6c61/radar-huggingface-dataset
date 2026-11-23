# SZLHOLDINGS/salad-axiom-invariants-r3

## Resumen

Salad-axiom-invariants-r3 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados supuestamente verificables mediante ficheros de recibos (receipts). El repositorio contiene un unico fichero de pesos en formato safetensors con un tamano total de 0,7 GB, lo que sugiere un modelo de escala reducida, pero la model card no especifica arquitectura, numero de parametros ni proceso de entrenamiento.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: la informacion publicada se centra en meta-datos de gobernanza y auditoria (identidad del repositorio, generacion de graficos SVG deterministas, estado de los recibos de evaluacion) y no en las caracteristicas del modelo. La propia model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no este respaldada por un recibo medido se considera UNKNOWN (desconocido), y el escaneo de recibos de noviembre de 2026 clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, sin evidencia estricta de evaluacion.

En consecuencia, no es posible determinar con rigor que problema resuelve el modelo, que capacidades tiene ni como se comporta en tareas reales. Cualquier uso en produccion requeriria una evaluacion independiente por parte del adoptante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | no disponible |
| Etiquetas | safetensors, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-18 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida) ni sobre el numero de parametros, capas, dimensiones ocultas o mecanismo de atencion. El unico dato estructural disponible es el tamano del repositorio (0,7 GB), que es compatible con un modelo de pequena escala en precision de 16 bits o con un modelo mayor cuantizado, pero no permite inferir la arquitectura.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo o multilingue), sobre tecnicas de alineacion (RLHF, DPO, SFT) ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card remite a "receipt files" externos del estate para cualquier afirmacion de entrenamiento o evaluacion, y declara que lo no recibido se considera UNKNOWN. El escaneo de recibos de 2026-11-22 no encontro un DONE.json estricto con estado MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento, por lo que la evidencia de evaluacion figura como UNKNOWN.

## Capacidades

- Generacion de texto: no confirmada; no hay documentacion ni ejemplos de uso.
- Razonamiento, codigo y matematicas: no documentados.
- Vision, audio u otras modalidades: no documentados.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas no esta cumplimentado.
- Modo "thinking" o razonamiento extendido: no documentado.
- Capacidades especiales: no disponibles.

## Casos de uso

No es posible recomendar casos de uso concretos sin evidencia de capacidades. A continuacion se indican escenarios en los que el artefacto podria evaluarse, siempre con validacion previa por parte del adoptante:

- Evaluacion interna de modelos pequenos: dado el tamano del repositorio (0,7 GB), puede cargarse en entornos de laboratorio para inspeccionar pesos y verificar que el artefacto es coherente con lo declarado, antes de cualquier uso funcional.
- Pruebas de integracion de pipelines de safetensors: util como artefacto de prueba para validar cargadores, conversores a GGUF y flujos de despliegue, sin asumir calidad de salida.
- Investigacion sobre gobernanza de artefactos: el repositorio ejemplifica un patron de model card basado en recibos y estados MEASURED/UNKNOWN, interesante para estudiar trazabilidad de modelos, no para inferencia.
- Auditoria de procedencia: permite comprobar la cadena de identidad declarada (organizacion, repositorio canonico, fecha de generacion de la tarjeta) como parte de un proceso de due diligence.
- Banchmarking de infraestructura: puede servir para medir latencia de carga y memoria de un checkpoint de 0,7 GB en distintas GPUs, con independencia de la calidad del modelo.
- Uso educativo sobre ciclo de vida de modelos: ilustra la diferencia entre un artefacto publicado y un modelo evaluado, util en formacion sobre practicas de publicacion responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria fechada, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia de orden de magnitud, un checkpoint de 0,7 GB en fp16 requiere aproximadamente 1,4 GB de VRAM solo para los pesos, mas memoria para el contexto y el runtime; en cuantizacion de 8 bits o 4 bits el requisito seria menor, pero no hay confirmacion de que existan versiones cuantizadas.
- GPU recomendadas: no disponibles; al no conocerse la arquitectura ni el contexto, no puede recomendarse un perfil de GPU concreto.
- Compatibilidad con GPU de consumo: probablemente si por el tamano del fichero, pero no confirmado.
- Opciones de despliegue: no documentadas. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI; la conversion a GGUF requeriria verificar previamente la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Al no conocerse la arquitectura, el numero de parametros ni la tarea objetivo, no es posible identificar modelos comparables de la misma categoria. La comparacion por tamano de repositorio (0,7 GB) con otros checkpoints carece de valor sin datos de parametros y contexto.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se declaran arquitectura, parametros, contexto ni idiomas, lo que impide evaluar su idoneidad para cualquier tarea.
- Evidencia de evaluacion inexistente: el escaneo de recibos de 2026-11-22 no encuentra un DONE.json estricto; la model card califica la evidencia como UNKNOWN.
- Licencia no disponible: no puede determinarse si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y sesgos: desconocido, al no haber evaluaciones publicadas ni documentacion sobre datos de entrenamiento.
- Cero descargas y cero likes: no hay senales de adopcion ni de validacion por parte de la comunidad.
- Model card centrada en gobernanza: gran parte del contenido son meta-datos de auditoria y graficos SVG generados automaticamente, no informacion funcional del modelo.
- Fechas de creacion y actualizacion en 2026: conviene verificar la coherencia temporal de los metadatos antes de tratarlos como referencia fiable.
- No apto para produccion sin evaluacion independiente: cualquier integracion requeriria pruebas propias de calidad, latencia y seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-axiom-invariants-r3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
