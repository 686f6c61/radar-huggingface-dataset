# SZLHOLDINGS/szl-kernels

## Resumen

szl-kernels es un artefacto publicado por SZLHOLDINGS bajo el identificador `SZLHOLDINGS/szl-kernels`. A pesar de estar etiquetado en Hugging Face con el pipeline `text-generation`, la model card no describe ningun modelo de lenguaje: se presenta como parte de un "estate" de IA gobernada de SZLHOLDINGS, con modelos, datasets y Spaces "source-linked" y resultados verificables mediante recibos. El repositorio esta marcado con la libreria `kernels`, lo que sugiere que su contenido son kernels de computo (operaciones de bajo nivel para GPU/CPU) mas que pesos de un modelo generativo.

La informacion disponible es extremadamente escasa y, en gran medida, autorreferencial. La model card no declara arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas. El propio autor indica explicitamente que cualquier afirmacion de entrenamiento o evaluacion que no este en los ficheros de recibo del "estate" debe considerarse UNKNOWN (desconocido). El barrido de recibos de noviembre de 2026 clasifica este repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no un `DONE.json` estricto con estado MEASURED.

Por tanto, esta ficha documenta lo que se puede verificar: licencia Apache 2.0, tamano de repositorio de 0.0 GB, 275 descargas y 1 like en el momento de la consulta, y la ausencia de cualquier especificacion tecnica publicada. No es un modelo evaluable para produccion en el sentido convencional; es un artefacto dentro de un pipeline propietario de gobernanza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; sin pesos declarados) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del artefacto. La model card no menciona transformer, MoE, SSM ni ninguna otra familia arquitectonica. El tag de libreria `kernels` en Hugging Face apunta a que el contenido podria ser codigo de kernels de computo mas que un checkpoint de red neuronal, pero esta interpretacion no esta confirmada por el autor en el texto de la card.

Respecto al entrenamiento, la card remite a "receipt files" del estate mesh y declara que cualquier dato no recibido es UNKNOWN. El barrido estricto de recibos (tranche 4, 2026-11-22) encontro `TRAINING_RECEIPT.json`, `assets/szl-card/mesh-receipts.svg` y `receipts/receipt_visual.svg`, pero ninguno validado como evidencia estricta (falta `DONE.json` con status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento). No hay numero de tokens, composicion de dataset, ni mencion de RLHF, DPO o tecnicas de alineamiento.

## Capacidades

- No se declara ninguna capacidad funcional verificable en la model card.
- El tag de pipeline `text-generation` sugiere uso previsto para generacion de texto, pero no hay evidencia de pesos ni de comportamiento del modelo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan capacidades especiales (vision, audio, thinking mode, decodificacion especulativa).
- El autor indica que no se afirma ninguna capacidad sin recibos de evaluacion medidos.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin especificaciones tecnicas publicadas. Cualquier aplicacion practica requeriria conocer parametros, contexto, formato de pesos y comportamiento evaluado, datos que no estan disponibles. Los unicos usos plausibles derivados del contexto del repositorio son:

- Auditoria de artefactos en un pipeline de gobernanza: inspeccionar los ficheros de recibo (`TRAINING_RECEIPT.json`, `receipts/receipt_visual.svg`) para verificar la cadena de custodia de otros artefactos del estate SZLHOLDINGS.
- Integracion en el "estate mesh" de SZLHOLDINGS: usar el repositorio como nodo de referencia dentro de la infraestructura de recibos del autor, siempre que se disponga de acceso al resto del mesh.
- Evaluacion de la metodologia de recibos: estudiar el formato `DONE.json` estricto y los estados MEASURED/REPORTED/UNKNOWN como patron de documentacion reproducible.
- Verificacion de licencia: reutilizar los ficheros bajo Apache 2.0 en proyectos que requieran trazabilidad de origen.
- Pruebas de carga de repositorios de la libreria `kernels` en Hugging Face: validar el flujo de descarga y despliegue de artefactos de ese tipo.
- Referencia en estudios sobre practicas de transparencia en model cards: el repositorio ejemplifica una card que declara explicitamente UNKNOWN en lugar de inventar cifras.

Para cualquier uso como modelo de generacion de texto, la informacion disponible es insuficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el barrido estricto de recibos concluye "Eval evidence: UNKNOWN (no strict DONE.json)".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (sin parametros declarados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el tag `kernels` no implica compatibilidad con estos servidores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No hay informacion suficiente para identificar modelos comparables de la misma categoria, ya que no se conocen parametros, contexto, arquitectura ni rendimiento del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas publicadas: no se puede planificar su uso en produccion.
- El repositorio ocupa 0.0 GB, lo que sugiere que no contiene pesos de un modelo de gran tamano; podria tratarse de codigo, metadatos o ficheros vacios.
- La model card es generada automaticamente por una herramienta del propio autor ("estate-cards weaver v0.1.0") y contiene referencias a recursos (SVG, badges) que no aportan informacion tecnica verificable.
- El barrido de recibos del propio autor clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo pero no evidencia estricta validada.
- Riesgo de alucinacion: no evaluable, al no existir modelo de lenguaje identificado.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; sin embargo, la ausencia de contenido tecnico limita su valor practico.
- Cualquier afirmacion sobre capacidades del artefacto debe considerarse no verificada hasta que el autor publique recibos medidos en el formato estricto que el mismo define.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-kernels
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generacion de cards (referenciada): https://github.com/szl-holdings/estate-cards
