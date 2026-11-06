# stdlogits/drowse-web-gemma3-1b-instruments

## Resumen

`stdlogits/drowse-web-gemma3-1b-instruments` es un espejo de integridad de un paquete de artefactos para navegador construido sobre Gemma 3 1B. Lo publica el usuario `stdlogits`, pero el artefacto original procede de `puppyum/polythetic-web-gemma3-1b-instruments` (revision `fc62ae6759546da514a5e6ecb2025641e4895064`). No es un checkpoint en formato Transformers ni un modelo entrenado por el autor del repositorio: es un conjunto de ficheros binarios pensados para ejecutarse en el runtime web `drowse` mediante WebGPU y MLC.

El repositorio incluye, segun la model card, los paquetes J-Lens y SAE asociados al modelo Gemma 3 1B, y conserva la identidad antigua `saklas-web-runtime-v1`. El autor advierte explicitamente de que esta subida no certifica compatibilidad con el runtime `drowse` actual ni forma parte de su catalogo de instalacion firmado, por lo que la mera disponibilidad publica de los ficheros no habilita la instalacion desde la aplicacion.

Su relevancia es acotada: sirve como referencia de procedencia y verificacion de hashes para quien investigue el despliegue de Gemma 3 1B en navegador con WebGPU, o para auditar artefactos de interpretabilidad (SAE, J-Lens) empaquetados para ejecucion local. No aporta pesos nuevos, ni resultados de evaluacion, ni una licencia unificada distinta de la suma de licencias de sus componentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto derivado de Gemma 3 1B; arquitectura del checkpoint base no detallada en la model card) |
| Parametros totales | no disponible (el nombre del artefacto indica 1B) |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (artefactos MLC/WebGPU; el formato concreto no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | `mixed-artifact-licenses` (licencias por componente en `LICENSES.md`) |
| Formato de pesos | artefactos de runtime de navegador (MLC/WebGPU), no safetensors ni GGUF estandar |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura ni entrenamiento en la model card. El repositorio es un espejo de bytes de un bundle ya existente: el autor declara que "no se ha modificado ningun contenido original del artefacto" y que solo se anaden documentacion y avisos de licencia. La unica referencia tecnica es que el paquete esta orientado a ejecucion en navegador mediante WebGPU y MLC, con la identidad de runtime `saklas-web-runtime-v1`, y que incluye packs J-Lens y SAE correspondientes al modelo Gemma 3 1B.

Cualquier dato sobre tokens de entrenamiento, composicion del dataset, RLHF/DPO o innovaciones de atencion pertenece al modelo base Gemma 3 1B y no se documenta en esta ficha, ya que no se proporciona en la informacion disponible.

## Capacidades

- Ejecucion de inferencia en navegador sobre WebGPU mediante el runtime `drowse` (sujeto a runtime compatible y catalogo firmado).
- Incluye packs J-Lens y SAE para el modelo Gemma 3 1B, orientados a analisis de activaciones e interpretabilidad.
- Conserva la identidad de runtime `saklas-web-runtime-v1`, lo que permite rastrear builds antiguos.
- Verificacion de integridad mediante hashes y revision de origen documentados en `UPLOAD-PROVENANCE.json`.
- No se declaran capacidades de generacion, tool calling, agentes, vision, audio ni multilingues en la model card.

## Casos de uso

- Auditoria de procedencia de artefactos: comparar los hashes de `UPLOAD-PROVENANCE.json` con los del repositorio original `puppyum/polythetic-web-gemma3-1b-instruments` para confirmar que no ha habido alteracion de bytes en la cadena de espejos.
- Investigacion en interpretabilidad: cargar los packs SAE y J-Lens en un entorno de analisis para estudiar activaciones de Gemma 3 1B sin depender de un checkpoint Transformers convencional.
- Desarrollo de clientes web con WebGPU: usar el bundle como referencia de estructura de artefactos MLC para integrar un modelo de 1B en una aplicacion de navegador con recursos limitados.
- Archivado a largo plazo: conservar una copia verificable de un build antiguo (`saklas-web-runtime-v1`) cuando el catalogo oficial deje de distribuirlo.
- Reproducibilidad de experimentos: fijar la revision `fc62ae6759546da514a5e6ecb2025641e4895064` en scripts de evaluacion para garantizar que todos los participantes usan exactamente los mismos bytes.
- Formacion y docencia: ilustrar el ciclo de vida de artefactos de modelos en navegador (empaquetado, firma, espejo, verificacion) con un caso real de 0,2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un artefacto WebGPU, la memoria se asigna desde la GPU del navegador y no desde VRAM dedicada en el sentido habitual.
- GPU recomendadas: no disponibles en la model card; el requisito funcional es un navegador con soporte WebGPU.
- Compatibilidad con GPU de consumo: no confirmada; el autor indica que la disponibilidad publica de ficheros no habilita la instalacion sin runtime compatible y catalogo firmado.
- Opciones de despliegue: runtime `drowse` (con identidad `saklas-web-runtime-v1` en este build); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Tamano del repositorio: 0,2 GB, lo que acota el coste de descarga y almacenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `stdlogits/drowse-web-gemma3-1b-instruments` | no disponible (1B por nombre) | no disponible | artefactos MLC/WebGPU | `mixed-artifact-licenses` | espejo no firmado |
| `puppyum/polythetic-web-gemma3-1b-instruments` | no disponible (1B por nombre) | no disponible | artefactos MLC/WebGPU | no disponible | origen del espejo |
| Gemma 3 1B (checkpoint base) | 1B | no disponible en esta ficha | safetensors | licencia Gemma | publico en Hugging Face |

La comparativa se limita a trazabilidad de origen y formato, ya que no hay datos de rendimiento ni de contexto para ninguno de los artefactos derivados.

## Limitaciones y advertencias

- No es un checkpoint estandar: no puede cargarse con `transformers`, `llama.cpp` ni `vLLM` sin conversion previa.
- El autor declara explicitamente que esta subida no certifica compatibilidad con el runtime `drowse` actual y que no esta incluida en el catalogo de instalacion firmado.
- La licencia es una agregacion (`mixed-artifact-licenses`); el uso comercial exige revisar `LICENSES.md` componente por componente, incluida la licencia del modelo Gemma 3 subyacente.
- No se documentan sesgos, tasas de alucinacion, cobertura idiomatica ni limitaciones de contexto; no deben asumirse comportamientos del modelo base sin verificacion independiente.
- Riesgo de confusion de identidad: el bundle conserva el nombre `saklas-web-runtime-v1`, distinto del runtime actual, lo que puede provocar fallos silenciosos si se usa con una version mas reciente.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.
- El repositorio anade documentacion y avisos de licencia, pero no corrige posibles problemas del artefacto original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stdlogits/drowse-web-gemma3-1b-instruments
- Origen del espejo: https://huggingface.co/puppyum/polythetic-web-gemma3-1b-instruments/tree/fc62ae6759546da514a5e6ecb2025641e4895064
- Licencias por componente: https://huggingface.co/logitsml/drowse-web-gemma3-1b-instruments/blob/main/LICENSES.md
- Procedencia y hashes: `UPLOAD-PROVENANCE.json` en la raiz del repositorio
