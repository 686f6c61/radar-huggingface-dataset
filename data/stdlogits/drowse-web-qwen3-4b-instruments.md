# stdlogits/drowse-web-qwen3-4b-instruments

## Resumen

`stdlogits/drowse-web-qwen3-4b-instruments` es un espejo de artefactos para navegador construido sobre el modelo Qwen3-4B, publicado por el usuario `stdlogits` en Hugging Face. No se trata de un checkpoint estándar de Transformers, sino de un paquete de inferencia empaquetado para ejecutarse en el navegador mediante WebGPU y MLC (Machine Learning Compilation), orientado al runtime denominado "drowse". El repositorio preserva los bytes originales del artefacto fuente y su procedencia, incluyendo la identidad heredada `saklas-web-runtime-v1`.

El origen directo es el repositorio `puppyum/polythetic-web-qwen3-4b-instruments`, del que este es un espejo con verificación de integridad. Según la model card, el upload no constituye una certificación de compatibilidad con el runtime actual de drowse ni está incluido en su catálogo de instalación firmado. La disponibilidad pública de los ficheros no habilita por sí sola el botón de descarga de la aplicación; se requiere un runtime compatible y un catálogo firmado.

La relevancia de este artefacto es acotada: sirve para estudiar o auditar el empaquetado de un modelo de 4.000 millones de parámetros para inferencia local en navegador, así como para verificar la procedencia de los ficheros. No debe confundirse con una distribución oficial del modelo Qwen3-4B ni con una versión lista para producción. El tamaño del repositorio es de 2,1 GB y la licencia es mixta, con componentes que pueden tener condiciones distintas entre sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Qwen3-4B; artefacto empaquetado para navegador) |
| Parametros totales | no disponible (el nombre del modelo indica 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (artefactos precompilados para runtime de navegador; no se detallan) |
| Idiomas soportados | no disponible |
| Licencia | mixed-artifact-licenses (ver LICENSES.md) |
| Formato de pesos | artefactos de runtime de navegador (MLC/WebGPU), no safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. El nombre del repositorio indica que se apoya en Qwen3-4B, pero la model card no aporta detalles sobre número de capas, atención, tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es el formato de distribución: se trata de artefactos de runtime para navegador, empaquetados con MLC y destinados a ejecución vía WebGPU, no de un checkpoint de Transformers.

El repositorio incluye los "J-Lens packs" correspondientes al modelo emparejado, según la model card. La procedencia se documenta en `UPLOAD-PROVENANCE.json`, que contiene los hashes exactos de los ficheros y la revisión del repositorio fuente (`puppyum/polythetic-web-qwen3-4b-instruments`, revisión `304682ea8a50e54fc6c855590f9391de6d167e17`). No se ha modificado el contenido original del artefacto; el espejo añade documentación y avisos de licencia.

## Capacidades

- Ejecución de inferencia en navegador mediante WebGPU y el runtime de drowse, según el empaquetado MLC.
- Capacidades heredadas del modelo base Qwen3-4B: no detalladas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Verificación de integridad de artefactos mediante hashes y fichero de procedencia.

## Casos de uso

- Auditoría de procedencia de artefactos: el repositorio permite verificar hashes y revisión de origen frente al repositorio fuente, útil para equipos de seguridad que necesiten validar la cadena de suministro de un bundle de navegador.
- Estudio de empaquetado MLC/WebGPU: sirve como referencia para entender cómo se distribuye un modelo de aproximadamente 4B parámetros en formato ejecutable en navegador.
- Pruebas de integración con el runtime drowse: un equipo que mantenga un runtime compatible puede usar este espejo para comprobar la carga de los J-Lens packs, siempre que disponga de un catálogo firmado propio.
- Investigación sobre inferencia local en cliente: útil para experimentar con despliegue de modelos en el navegador sin infraestructura de servidor, evaluando latencia y consumo de memoria en GPU de usuario.
- Docencia y formación: permite ilustrar las diferencias entre un checkpoint estándar y un artefacto de runtime precompilado, incluyendo los requisitos de licencia mixta.
- Archivo y preservación: al conservar los bytes originales y la identidad heredada `saklas-web-runtime-v1`, funciona como copia de referencia si el repositorio fuente desaparece.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (2,1 GB) sugiere un artefacto comprimido o cuantizado, pero no se especifica la precisión ni el consumo en GPU.
- GPU recomendadas: no disponible. Al tratarse de WebGPU, la ejecución depende del navegador y del soporte WebGPU del sistema; no se indican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. La model card advierte que se requiere un runtime compatible y un catálogo firmado, y que la disponibilidad pública de ficheros no habilita la instalación.
- Opciones de despliegue: runtime drowse con WebGPU (MLC). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que no es un checkpoint estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stdlogits/drowse-web-qwen3-4b-instruments | no disponible (nombre indica 4B) | no disponible | artefactos de navegador (MLC/WebGPU) | mixed-artifact-licenses | espejo público, sin catálogo firmado |
| Qwen3-4B (distribución oficial) | 4B (según denominación) | no disponible en esta ficha | safetensors y variantes estándar | no disponible en esta ficha | pública en Hugging Face |
| puppyum/polythetic-web-qwen3-4b-instruments (fuente) | no disponible | no disponible | artefactos de navegador | no disponible | repositorio fuente del espejo |

La comparación con alternativas de la misma categoría (bundles de navegador para modelos de ~4B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint estándar de Transformers: no puede cargarse con `from_pretrained` ni con las herramientas habituales de inferencia.
- La model card indica explícitamente que este upload no certifica compatibilidad con el runtime actual de drowse y no forma parte de su catálogo de instalación firmado.
- La disponibilidad pública de los ficheros no habilita la descarga desde la aplicación; se requiere un runtime compatible y un catálogo firmado.
- Licencia mixta (`mixed-artifact-licenses`): cada componente puede tener condiciones distintas. Es obligatorio revisar `LICENSES.md` antes de cualquier uso, especialmente comercial.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base en esta información.
- No se dispone de datos sobre contexto máximo, cuantización ni idiomas, lo que impide evaluar su idoneidad para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia comunitaria sobre su funcionamiento.
- La fecha de creación registrada (2026-09-06) y la de actualización (2026-11-02) deben tratarse con cautela por posibles inconsistencias en los metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stdlogits/drowse-web-qwen3-4b-instruments
- Repositorio fuente: https://huggingface.co/puppyum/polythetic-web-qwen3-4b-instruments/tree/304682ea8a50e54fc6c855590f9391de6d167e17
- Fichero de licencias: https://huggingface.co/logitsml/drowse-web-qwen3-4b-instruments/blob/main/LICENSES.md
- Procedencia de la subida: `UPLOAD-PROVENANCE.json` en el repositorio (ruta relativa, sin URL directa disponible)
