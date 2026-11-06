# stdlogits/drowse-web-qwen3-4b

## Resumen

`stdlogits/drowse-web-qwen3-4b` es un espejo de integridad (artifact mirror) de un bundle para navegador basado en Qwen3-4B, empaquetado para ejecutarse en WebGPU mediante el runtime MLC. No se trata de un checkpoint estandar de Transformers, sino de un conjunto de artefactos de runtime web: pesos del modelo, ficheros de tokenizer, runtime WebAssembly y metadatos de procedencia. El autor del repositorio es el usuario `stdlogits`, mientras que el artefacto original procede de `puppyum/polythetic-web-qwen3-4b` en la revision `87ef453995eacc71c475dd319193760bafcedded`.

El modelo subyacente es Qwen3-4B, un transformer denso de 4.000 millones de parametros de la familia Qwen3, orientado a generacion de texto y conversacion. El interes de este repositorio no reside en el modelo en si, sino en el formato de distribucion: permite ejecutar inferencia local en el navegador del usuario sin servidor, lo que resulta relevante para aplicaciones web con requisitos de privacidad o para demos sin coste de GPU en backend.

Es importante subrayar que el propio autor advierte de que este espejo no es una certificacion de compatibilidad con el runtime drowse actual y no esta incluido en su catalogo de instalacion firmado. La disponibilidad publica de los ficheros no habilita por si sola el boton de descarga de la aplicacion. El repositorio ocupa 3,9 GB y conserva la identidad antigua `saklas-web-runtime-v1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B), empaquetado para runtime web MLC/WebGPU |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (artefactos de runtime web; el bundle MLC suele emplear cuantizaciones propias, sin detalle publicado) |
| Idiomas soportados | no disponible |
| Licencia | other / mixed-artifact-licenses (licencias por componente en LICENSES.md) |
| Formato de pesos | Artefactos de runtime web (pesos + tokenizer + WebAssembly), no safetensors ni GGUF estandar |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de 4.000 millones de parametros. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO) no se documentan en la informacion proporcionada y corresponden a la model card original de Qwen3, no a este repositorio.

La innovacion tecnica de este repositorio es el empaquetado: los pesos se distribuyen junto a un runtime WebAssembly y ficheros de tokenizer para su ejecucion en navegador mediante WebGPU a traves de MLC. El bundle conserva la identidad `saklas-web-runtime-v1`, lo que indica que fue generado con una version anterior del toolchain. El repositorio incluye un fichero `UPLOAD-PROVENANCE.json` con hashes exactos y la revision de origen, y no modifica el contenido original de los artefactos: solo anade documentacion y avisos de licencia.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-4B.
- Ejecucion de inferencia en el navegador del cliente mediante WebGPU, sin backend GPU dedicado.
- Distribucion como bundle autocontenido: pesos, tokenizer y runtime WebAssembly en un mismo repositorio.
- Verificacion de integridad mediante hashes y revision de origen en `UPLOAD-PROVENANCE.json`.
- Soporte de tool calling, agentes, modo thinking, vision o audio: no disponible en la informacion proporcionada para este bundle.
- Capacidades multilingues: no disponible.

## Casos de uso

- Demos web sin coste de backend: el bundle permite servir un chat con Qwen3-4B ejecutandose en la GPU del visitante via WebGPU, eliminando el coste de inferencia en servidor para prototipos y paginas de presentacion.
- Aplicaciones con requisitos de privacidad: al ejecutarse en el navegador, los datos del usuario no abandonan el dispositivo, lo que encaja en escenarios de procesamiento de texto sensible donde no se desea enviar contenido a una API externa.
- Verificacion de procedencia de artefactos: el repositorio sirve como referencia auditable para comprobar hashes y revision de origen de un bundle concreto, util en pipelines de supply chain de modelos.
- Espejo de respaldo (mirroring): util para conservar una copia integra de un bundle que podria desaparecer del repositorio original, manteniendo trazabilidad de la revision exacta.
- Investigacion sobre inferencia en navegador: permite estudiar el rendimiento y las limitaciones de WebGPU con un modelo de 4.000 millones de parametros en hardware de cliente.
- Integracion en aplicaciones web experimentales: desarrolladores que construyan sobre el runtime drowse pueden usar estos artefactos como referencia, siempre que dispongan de un runtime compatible y un catalogo firmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ejecutarse en navegador, depende de la memoria de la GPU del cliente y del backend WebGPU; el repositorio ocupa 3,9 GB en disco.
- GPU recomendadas: no disponible. La ejecucion requiere un navegador con soporte WebGPU y una GPU compatible con dicho backend.
- Compatibilidad con GPU de consumo: no disponible; depende del soporte WebGPU del navegador y del driver, no de un requisito de VRAM publicado.
- Opciones de despliegue: runtime drowse con WebGPU y runtime WebAssembly incluido en el bundle. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un checkpoint estandar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| stdlogits/drowse-web-qwen3-4b | 4.000 M | no disponible | Artefactos de runtime web | mixed-artifact-licenses | Si, via WebGPU/MLC |
| Qwen3-4B (checkpoint original) | 4.000 M | no disponible | safetensors | no disponible en esta ficha | No |
| Otros bundles MLC para navegador | no disponible | no disponible | Artefactos de runtime web | variable | Si |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que este espejo no es una certificacion de compatibilidad con el runtime drowse actual y no esta incluido en el catalogo de instalacion firmado.
- La disponibilidad publica de los ficheros no habilita por si sola la instalacion en la aplicacion: se requiere un runtime compatible y un catalogo firmado.
- No es un checkpoint estandar de Transformers; no puede cargarse con `transformers`, vLLM, llama.cpp, Ollama ni TGI.
- La licencia es mixta por componente (`mixed-artifact-licenses`); es obligatorio revisar `LICENSES.md` antes de cualquier uso, incluido el comercial.
- El bundle conserva la identidad antigua `saklas-web-runtime-v1`, lo que puede implicar incompatibilidades con versiones actuales del runtime.
- No se documentan idiomas soportados, contexto maximo ni sesgos conocidos en la informacion proporcionada.
- Riesgo de alucinacion: inherente al modelo base Qwen3-4B; no se aportan evaluaciones especificas en este repositorio.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stdlogits/drowse-web-qwen3-4b
- Artefacto de origen: https://huggingface.co/puppyum/polythetic-web-qwen3-4b/tree/87ef453995eacc71c475dd319193760bafcedded
- Fichero de procedencia: https://huggingface.co/stdlogits/drowse-web-qwen3-4b/blob/main/UPLOAD-PROVENANCE.json
- Licencias por componente: https://huggingface.co/logitsml/drowse-web-qwen3-4b/blob/main/LICENSES.md
