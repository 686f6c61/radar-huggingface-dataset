# stdlogits/drowse-web-gemma3-4b-instruments

## Resumen

`stdlogits/drowse-web-gemma3-4b-instruments` es un espejo de integridad de un bundle para navegador construido sobre Gemma 3 de 4.000 millones de parametros, orientado a ejecucion en WebGPU mediante el runtime MLC. No es un checkpoint estandar de Transformers ni un modelo entrenado por el autor del repositorio: se trata de un artefacto de despliegue que empaqueta pesos y componentes auxiliares (packs J-Lens y SAE) para su uso dentro de la aplicacion drowse.

El repositorio preserva los bytes originales y la procedencia del artefacto fuente, incluida la identidad antigua `saklas-web-runtime-v1`. Segun la model card, esta subida no constituye una certificacion de compatibilidad con el runtime actual de drowse ni forma parte de su catalogo de instalacion firmado, por lo que la disponibilidad publica de los ficheros no habilita por si sola la descarga desde la aplicacion.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para auditores, desarrolladores de runtimes web y equipos que necesiten verificar hashes y licencias de componentes de un bundle Gemma 3 de 4B ejecutable en el navegador. La informacion publica no detalla la arquitectura interna del modelo base ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 3; el repositorio contiene artefactos de runtime web, no un checkpoint estandar) |
| Parametros totales | 4B (segun el nombre del repositorio y del artefacto fuente) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | mixta por componente (`mixed-artifact-licenses`), detallada en `LICENSES.md` |
| Formato de pesos | artefactos de runtime de navegador (WebGPU/MLC); el repositorio declara `safetensors` entre sus tags, sin detalle de ficheros |
| Tamano del repositorio | 4,6 GB |
| Runtime objetivo | WebGPU mediante MLC (bundle de navegador drowse) |
| Componentes incluidos | packs J-Lens y SAE del modelo correspondiente |

## Arquitectura y entrenamiento

No hay informacion publica en la model card sobre la arquitectura del modelo base mas alla de su identificacion como Gemma 3 de 4B. El repositorio no documenta numero de tokens de entrenamiento, composicion del dataset ni etapas de alineacion (RLHF, DPO u otras). Tampoco se describen innovaciones tecnicas propias del modelo.

Lo que si documenta el autor es la naturaleza del artefacto: un bundle de inferencia para navegador sobre WebGPU con runtime MLC, acompanado de packs J-Lens (herramientas de interpretabilidad por lente) y SAE (autoencoders dispersos) asociados al mismo modelo. La procedencia se registra en `UPLOAD-PROVENANCE.json`, con hashes exactos de ficheros y revision del repositorio fuente `puppyum/polythetic-web-gemma3-4b-instruments` (commit `cd27c6e46e591d73c46b9f80c5435e1ed9d04e2f`). El espejo anade documentacion y avisos de licencia, sin modificar el contenido original.

## Capacidades

- No se documentan capacidades funcionales especificas en la informacion disponible.
- Por herencia del modelo base Gemma 3, cabria esperar generacion de texto y capacidades multimodales, pero la model card no lo confirma ni detalla variante.
- No se indica soporte de tool calling ni de function calling.
- No se indica soporte de agentes ni de razonamiento multi-paso.
- No se detallan capacidades multilingues.
- El valor diferencial del repositorio es la verificabilidad: hashes, procedencia y licencias por componente.
- Incluye packs de interpretabilidad (J-Lens y SAE) empaquetados junto al modelo.

## Casos de uso

- Auditoria de cadena de suministro de modelos: verificar mediante `UPLOAD-PROVENANCE.json` que los bytes del bundle coinciden con el artefacto fuente y que no se han alterado entre revisiones.
- Cumplimiento de licencias en productos web: usar `LICENSES.md` para identificar la licencia de cada componente (pesos, runtime, packs SAE) antes de redistribuir un bundle en una aplicacion comercial.
- Investigacion en interpretabilidad: emplear los packs J-Lens y SAE incluidos para analizar activaciones internas del modelo Gemma 3 de 4B en un entorno de navegador.
- Desarrollo de runtimes WebGPU: usar el bundle como caso de prueba para validar la carga de artefactos MLC y el comportamiento de la identidad antigua `saklas-web-runtime-v1`.
- Reproducibilidad de experimentos: reconstruir un entorno identico al publicado para comparar resultados de inferencia en cliente frente a servidor.
- Archivado a largo plazo: conservar una copia con hashes documentados de un bundle que podria desaparecer del repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 4,6 GB, lo que da una cota superior del espacio de almacenamiento necesario, no de memoria en ejecucion.
- GPU recomendadas: no disponible. El destino declarado es WebGPU, por lo que la compatibilidad depende del navegador y del soporte WebGPU de la GPU del cliente.
- Compatibilidad con GPU de consumo: no confirmada por el autor; requiere un runtime drowse compatible y catalogo firmado.
- Opciones de despliegue: runtime drowse sobre WebGPU con MLC. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la model card advierte explicitamente que no es un checkpoint estandar de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| stdlogits/drowse-web-gemma3-4b-instruments | 4B | no disponible | artefactos de runtime web (WebGPU/MLC) | mixta por componente | Espejo de integridad de un bundle de navegador |
| Gemma 3 4B (checkpoint oficial) | 4B | no disponible en esta ficha | safetensors (Transformers) | terminos de Gemma | Modelo base; no verificados aqui sus datos exactos |
| puppyum/polythetic-web-gemma3-4b-instruments | 4B | no disponible | artefactos de runtime web | no disponible | Fuente original del espejo, revision fijada |

La comparacion con alternativas de la misma categoria (bundles web de 4B para WebGPU) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint estandar: no puede cargarse directamente con Transformers, vLLM o llama.cpp sin conversion.
- La instalacion en navegador exige un runtime compatible y un catalogo firmado; la mera disponibilidad de ficheros no habilita la descarga desde la aplicacion.
- El autor declara explicitamente que esta subida no certifica compatibilidad con el runtime actual de drowse.
- Licencia mixta por componente: es obligatorio revisar `LICENSES.md` antes de cualquier uso comercial o redistribucion.
- La identidad interna `saklas-web-runtime-v1` es anterior a la actual; puede provocar fallos de validacion en runtimes recientes.
- No hay informacion sobre sesgos, tasas de alucinacion ni rendimiento multilingue.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria conocida.
- El repositorio no documenta cuantizaciones ni contexto, lo que impide estimar requisitos de memoria en cliente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stdlogits/drowse-web-gemma3-4b-instruments
- Artefacto fuente: https://huggingface.co/puppyum/polythetic-web-gemma3-4b-instruments/tree/cd27c6e46e591d73c46b9f80c5435e1ed9d04e2f
- Licencias por componente: https://huggingface.co/logitsml/drowse-web-gemma3-4b-instruments/blob/main/LICENSES.md
- Procedencia y hashes: `UPLOAD-PROVENANCE.json` en el repositorio
