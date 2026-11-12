# stdlogits/drowse-web-qwen35-2b-base

## Resumen

drowse-web-qwen35-2b-base es un artefacto de inferencia en navegador derivado de Qwen/Qwen3.5-2B-Base, publicado por stdlogits para el proyecto drowse.ai. No es un checkpoint de Transformers al uso: el repositorio contiene los pesos convertidos a MLC LLM (cuantización `q4f32_1`, 4 bits con cómputo en float32), el tokenizador, una biblioteca de modelo en WebAssembly con los hooks de drowse compilados y el paquete de geometría base (estadísticas neutras y variedades de conceptos por defecto). El objetivo es ejecutar el modelo en el dispositivo mediante WebGPU y leer o dirigir su estado interno durante la generación, en el flujo residual.

El modelo subyacente es un transformer denso de 2.000 millones de parámetros con una ventana de contexto limitada a 2048 tokens en esta conversión. La propuesta diferencial no es el rendimiento bruto, sino la interpretabilidad en el navegador: drowse accede al residual stream y permite inspeccionar y modular representaciones internas mientras el modelo completa texto. Por eso se distribuye como modelo base de completación cruda, sin post-entrenamiento conversacional.

Es relevante para desarrolladores e investigadores que quieran experimentar con interpretabilidad mecanicista sin infraestructura de GPU: todo el cómputo ocurre en el cliente vía WebGPU, con artefactos firmados y verificados por SHA-256 desde el catálogo de drowse.ai. La contrapartida es una licencia compuesta por componentes (`mixed-artifact-licenses`), un contexto corto y la ausencia de datos publicados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-2B-Base); runtime MLC LLM con hooks de interpretabilidad |
| Parametros totales | 2B (según el modelo base Qwen3.5-2B-Base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | `q4f32_1`: pesos de 4 bits, cómputo en float32 |
| Idiomas soportados | no disponible (la model card no los declara; hereda los del modelo base) |
| Licencia | `mixed-artifact-licenses` (por componente, ver LICENSES.md) |
| Formato de pesos | Artefactos MLC LLM (WebAssembly + pesos convertidos), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-2B-Base: un transformer denso de aproximadamente 2.000 millones de parámetros. Esta publicación no entrena el modelo; lo convierte y lo empaqueta para el runtime `drowse-web-runtime-v2`, con ABI de hooks `block-sites-v5` y perfil `standard-v4-residual`. La conversión se realiza con MLC LLM, fijando la revisión base y aplicando los parches de drowse a TVM, MLC LLM y WebLLM según la receta de `browser-runtime/` en el repositorio stdlogits/drowse.ai.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no se recogen en la información disponible; corresponden a la model card de Qwen/Qwen3.5-2B-Base. La innovación técnica de este artefacto es la instrumentación: el modelo se lee en el flujo residual y se expone a través de hooks compilados en WebAssembly, con estadísticas neutrales y variedades de conceptos por defecto por contexto. No incluye lens ni units packs. La reproducibilidad se documenta en `drowse-build.json` (ficheros fuente, commit base de MLC LLM y hashes de cada overlay) y en `hosted-artifacts.json` / `hosted-pack-artifacts.json` (digests de cada fichero).

## Capacidades

- Generación de texto por completación cruda (modelo base, sin ajuste conversacional).
- Lectura y direccionamiento del estado interno durante la generación en el flujo residual.
- Ejecución en el dispositivo mediante WebGPU, sin servidor de inferencia.
- Uso de estadísticas neutrales y variedades de conceptos por defecto para análisis de representaciones.
- Integración con el runtime `drowse-web-runtime-v2` y el ABI de hooks `block-sites-v5`.
- Verificación de integridad de artefactos mediante SHA-256 desde el catálogo firmado de drowse.ai.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en interpretabilidad mecanicista en el navegador: cargar el modelo en drowse.ai y leer el residual stream durante la generación para estudiar cómo se codifican conceptos, sin necesidad de GPU local ni de infraestructura de servidor.
- Docencia y talleres sobre representaciones internas: al ejecutarse íntegramente en el cliente vía WebGPU, los asistentes pueden inspeccionar y modular el modelo desde su propio navegador con artefactos verificados por digest.
- Prototipado de técnicas de steering: usar las variedades de conceptos por defecto y las estadísticas neutrales para experimentar con direcciones de activación y medir su efecto en la completación.
- Completación de texto ligera en aplicaciones web: con 2048 tokens de contexto y cuantización de 4 bits, sirve para autocompletado o generación corta en el cliente sin enviar datos a un servidor.
- Validación de pipelines de conversión MLC LLM: el repositorio documenta ficheros fuente, commit base y hashes de overlays, lo que permite reproducir la build y auditar la cadena de compilación.
- Experimentos de privacidad por diseño: al no requerir backend, los prompts y las activaciones permanecen en el dispositivo del usuario, útil para estudios con datos sensibles.
- Evaluación comparativa de cuantización 4 bits con cómputo float32: permite medir la degradación de la completación frente al modelo base en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 2B parámetros en 4 bits, el peso ronda 1-1,5 GB, y el repositorio completo ocupa 1,2 GB.
- GPU recomendadas: no disponibles; el requisito real es un navegador con soporte de WebGPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs integradas y dedicadas recientes con WebGPU, aunque no se documentan modelos concretos.
- Opciones de despliegue: runtime propietario de drowse.ai (`drowse-web-runtime-v2`, WebAssembly + WebGPU); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drowse-web-qwen35-2b-base | 2B | 2048 | Artefactos MLC LLM / WebAssembly | mixed-artifact-licenses | Solo vía drowse.ai |
| Qwen/Qwen3.5-2B-Base | 2B | no disponible en esta ficha | Checkpoint Transformers | según Qwen | Hugging Face |
| Alternativas comparables de 2B para navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con otras alternativas.

## Limitaciones y advertencias

- Modelo base sin ajuste conversacional: no está alineado para diálogo ni sigue instrucciones de forma fiable.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación propio de un modelo base de 2B; no se han publicado evaluaciones que lo acoten.
- Sesgos: no documentados en la información disponible; hereda los del modelo base y de sus datos de entrenamiento.
- Idiomas soportados no declarados; el rendimiento fuera del inglés podría degradarse.
- Licencia compuesta por componentes (`mixed-artifact-licenses`): es obligatorio revisar LICENSES.md antes de cualquier uso comercial, ya que las condiciones pueden variar entre pesos, runtime y paquetes.
- No es un checkpoint de Transformers: no puede cargarse con `transformers`, vLLM ni llama.cpp; solo funciona con el runtime de drowse.
- Dependencia de un catálogo firmado y de un runtime propietario, lo que limita la portabilidad y la reproducibilidad fuera de drowse.ai.
- El repositorio no incluye lens ni units packs, por lo que ciertas funciones de análisis pueden requerir artefactos adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/stdlogits/drowse-web-qwen35-2b-base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base/tree/b1485b2fa6dfa1287294f269f5fb618e03d52d7c
- Aplicación: https://drowse.ai
- Repositorio drowse: https://github.com/stdlogits/drowse
- Repositorio drowse.ai: https://github.com/stdlogits/drowse.ai
- Licencias por componente: https://huggingface.co/stdlogits/drowse-web-qwen35-2b-base/blob/main/LICENSES.md
