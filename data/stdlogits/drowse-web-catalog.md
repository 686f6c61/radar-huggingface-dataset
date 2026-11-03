# stdlogits/drowse-web-catalog

## Resumen

`stdlogits/drowse-web-catalog` no es un modelo de lenguaje, sino un repositorio índice publicado en HuggingFace que documenta y distribuye ocho bundles de modelos para ejecución en navegador mediante WebGPU, junto con cuatro repositorios de instrumentos de interpretabilidad. Lo desarrolla la cuenta `stdlogits`, que publica los artefactos reales bajo la cuenta `logitsml`, y su función es servir como catálogo de descargas verificadas: el archivo `downloads.json` recoge cada revisión exacta, el tamano de cada fichero y su hash SHA-256.

El catálogo cubre dos categorías. Por un lado, cuatro "chat mirrors" (Gemma 3 1B Instruct, Gemma 3 4B Instruct, Qwen3 1.7B y Qwen3 4B) copiados de bundles de navegador previamente ensamblados, con los bytes originales y la procedencia preservadas. Por otro, cuatro "base candidates" (GPT-2 small, Pythia 70M deduped, Gemma 3 1B PT y Qwen 3.5 2B Base) que son conversiones locales a formato de navegador y que el autor etiqueta explícitamente como candidatos, no como releases listos para instalar.

La relevancia del repositorio es logística más que algorítmica: el conjunto completo de ficheros listados suma 10,19 GB, y el usuario descarga solo el modelo y las herramientas que elija. Es importante subrayar que el catálogo es un índice de descargas sin firma y no el catálogo de instalación firmado de la aplicación, y que no se ha publicado ningún `catalog.json` firmado para estas revisiones, por lo que la instalación desde la app sigue pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio índice, no modelo) |
| Parametros totales | no disponible (agrega modelos de 70M a 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible a nivel de catálogo; cada repositorio documenta sus licencias de componentes y restricciones específicas |
| Formato de pesos | no disponible en el catálogo; los bundles se distribuyen como ficheros individuales descargables vía `hf download` |

## Arquitectura y entrenamiento

Este repositorio no entrena ni define arquitectura alguna: es un índice de artefactos. Los modelos que referencia pertenecen a familias conocidas (Gemma 3 de Google, Qwen3 y Qwen 3.5 de Alibaba, GPT-2 de OpenAI y Pythia de EleutherAI), pero la model card no aporta detalles de arquitectura, número de tokens de entrenamiento, composición del dataset ni procesos de alineación como RLHF o DPO para ninguno de ellos.

La innovación técnica que sí documenta el autor es el pipeline de empaquetado para navegador: conversión local de checkpoints a builds ejecutables con WebGPU, verificación de tamanos y hashes contra los objetos Git/LFS subidos, y comprobación de descargas anónimas por rangos de fichero. Los chat mirrors conservan las identidades de runtime antiguas y los bytes originales; los base candidates se etiquetan como tales porque su validación es incompleta: GPT-2 y Pythia cuentan con evidencia estrecha de comparación de checkpoints, Gemma PT presenta una discrepancia numérica con pesos emparejados y Qwen 3.5 aún requiere validación con cuantización emparejada.

## Capacidades

- Distribución de ocho bundles de modelos para inferencia en navegador con WebGPU, con tamanos verificados entre 0,29 GB (Pythia 70M) y 2,87 GB (Gemma 3 4B Instruct).
- Índice de descargas con revisión exacta, tamano y SHA-256 por fichero en `downloads.json`.
- Cuatro chat mirrors con capacidad conversacional heredada de los modelos originales (Gemma 3 1B y 4B Instruct, Qwen3 1.7B y 4B).
- Cuatro base candidates sin ajuste conversacional, orientados a comparación de checkpoints y experimentación.
- Instrumentos de interpretabilidad empaquetados por separado: J-Lens para Gemma 3 y Qwen3, y SAE (autoencoders dispersos) para los dos bundles de Gemma 3.
- Descarga selectiva por bundle mediante la CLI de HuggingFace.
- No se documentan capacidades de tool calling, agentes, visión, audio, thinking mode ni cobertura multilingüe específica en la información disponible.

## Casos de uso

- Despliegue de chat en navegador sin backend: los chat mirrors de Gemma 3 y Qwen3 permiten ejecutar conversación directamente en el cliente vía WebGPU, eliminando costes de servidor y manteniendo los datos en el dispositivo.
- Investigación de interpretabilidad: los repositorios de instrumentos con J-Lens y SAE para Gemma 3 1B y 4B permiten analizar activaciones y features dispersas sobre los mismos pesos que se ejecutan en el navegador.
- Comparación de checkpoints en entorno web: los base candidates de GPT-2 small y Pythia 70M, con evidencia de comparación numérica, sirven para validar que la conversión a formato navegador reproduce fielmente el modelo original.
- Auditoría de cadena de suministro de artefactos: `downloads.json` permite verificar hashes SHA-256 y tamanos de cada fichero antes de integrarlo en un pipeline, útil para equipos que necesitan trazabilidad de pesos.
- Desarrollo de aplicaciones web offline-first: un bundle de 0,29 a 1,19 GB cabe en caché del navegador y habilita asistentes locales sin conectividad.
- Evaluación de viabilidad de WebGPU en hardware de usuario: los distintos tamanos del catálogo permiten medir latencia y consumo de memoria en GPUs integradas y discretas antes de comprometerse con un modelo mayor.
- Pruebas de cuantización y validación numérica: el caso de Qwen 3.5 2B Base, pendiente de validación con cuantización emparejada, es un escenario directo para experimentar con esquemas de compresión en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; como referencia de orden de magnitud, los bundles van de 0,29 GB a 2,87 GB en disco, y la inferencia en navegador requiere mantener los pesos en memoria de la GPU, por lo que se necesita al menos ese orden de memoria disponible.
- GPU recomendadas: no disponible en la información proporcionada. El requisito funcional es soporte de WebGPU en el navegador.
- Viabilidad en GPU de consumo: no confirmada por el autor; los bundles pequenos (Pythia 70M, GPT-2 small, Gemma 3 1B PT) son los candidatos razonables para GPUs integradas, pero no hay datos de rendimiento publicados.
- Opciones de despliegue: ejecución en navegador con WebGPU; descarga de bundles mediante `hf download` de la CLI de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio es un catálogo de distribución y no un modelo con alternativas equivalentes directas; la información proporcionada no incluye comparaciones con otros índices o catálogos de modelos para navegador.

## Limitaciones y advertencias

- El catálogo es un índice de descargas sin firma y no el catálogo de instalación firmado de la aplicación; no debe tratarse como fuente de confianza para instalación automática.
- No se ha publicado ningún `catalog.json` firmado para estas revisiones: la instalación desde la app sigue pendiente y subir los ficheros no habilita por sí solo el botón de descarga.
- Los chat mirrors no constituyen una certificación de compatibilidad con la versión actual de la aplicación; conservan identidades de runtime antiguas.
- Los base candidates no están promovidos a release listo para instalar: Gemma PT tiene una discrepancia numérica con pesos emparejados y Qwen 3.5 requiere validación con cuantización emparejada.
- La licencia no está declarada a nivel de catálogo; cada repositorio documenta licencias de componentes y restricciones específicas, por lo que el uso comercial exige revisar cada bundle individualmente.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni límites de contexto en la documentación disponible.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado, lo que indica ausencia de validación por parte de la comunidad.
- Los identificadores técnicos históricos, símbolos binarios y atribuciones upstream se preservan intencionadamente para no alterar los hashes, lo que puede dificultar la trazabilidad para lectores nuevos.

## Enlaces

- Repositorio del catálogo: https://huggingface.co/stdlogits/drowse-web-catalog
- Índice de descargas: https://huggingface.co/stdlogits/drowse-web-catalog/blob/main/downloads.json
- Gemma 3 1B Instruct: https://huggingface.co/logitsml/drowse-web-gemma3-1b
- Instrumentos Gemma 3 1B (J-Lens + SAE): https://huggingface.co/logitsml/drowse-web-gemma3-1b-instruments
- Gemma 3 4B Instruct: https://huggingface.co/logitsml/drowse-web-gemma3-4b
- Instrumentos Gemma 3 4B (J-Lens + SAE): https://huggingface.co/logitsml/drowse-web-gemma3-4b-instruments
- Qwen3 1.7B: https://huggingface.co/logitsml/drowse-web-qwen3-1.7b
- Instrumentos Qwen3 1.7B (J-Lens): https://huggingface.co/logitsml/drowse-web-qwen3-1.7b-instruments
- Qwen3 4B: https://huggingface.co/logitsml/drowse-web-qwen3-4b
- Instrumentos Qwen3 4B (J-Lens): https://huggingface.co/logitsml/drowse-web-qwen3-4b-instruments
- GPT-2 small (base candidate): https://huggingface.co/logitsml/drowse-web-gpt2-base-candidate
- Pythia 70M deduped (base candidate): https://huggingface.co/logitsml/drowse-web-pythia-70m-base-candidate
- Gemma 3 1B PT (base candidate): https://huggingface.co/logitsml/drowse-web-gemma3-1b-pt-candidate
- Qwen 3.5 2B Base (base candidate): https://huggingface.co/logitsml/drowse-web-qwen35-2b-base-candidate
