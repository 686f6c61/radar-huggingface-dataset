# stdlogits/drowse-web-pythia-70m-base

## Resumen

drowse-web-pythia-70m-base es un artefacto de inferencia en navegador derivado de EleutherAI/pythia-70m-deduped, el modelo transformer decoder-only de 70 millones de parametros publicado por EleutherAI. Lo desarrolla stdlogits como parte de drowse.ai, una herramienta de interpretabilidad mecanicista que ejecuta el modelo en el dispositivo mediante WebGPU y lee y modula su flujo residual durante la generacion. No es un checkpoint de Transformers, sino un paquete compilado con MLC LLM que incluye pesos convertidos, tokenizador, biblioteca WebAssembly con los hooks de drowse integrados y un "core geometry pack" con estadisticas neutras y variedades conceptuales por defecto.

El modelo conserva la naturaleza de completado crudo (raw-completion) del Pythia original: no ha pasado por ajuste por instrucciones ni por RLHF, de modo que su funcion es servir de sustrato transparente y reproducible para estudiar activaciones internas, no de asistente conversacional. La ventana de contexto es de 2048 tokens y los pesos se distribuyen en float32 sin cuantizar (perfil `q0f32`), lo que explica el tamano del repositorio de 0,3 GB.

Su relevancia actual es acotada pero especifica: ofrece un entorno determinista y verificable (catalogo firmado, digests SHA-256 por archivo, `drowse-build.json` con hashes de cada overlay del compilador) para experimentos de interpretabilidad en el navegador sin infraestructura de servidor. Es un artefacto de nicho para investigacion, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de EleutherAI/pythia-70m-deduped) |
| Parametros totales | 70 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | float32 sin cuantizar (perfil `q0f32`); no se documentan otros perfiles en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | mixed-artifact-licenses (otra; ver LICENSES.md, aplica por componente) |
| Formato de pesos | artefactos de navegador compilados con MLC LLM (no safetensors ni GGUF); runtime `drowse-web-runtime-v2`, hook ABI `block-sites-v5`, perfil `standard-v4-residual` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Pythia-70m-deduped: un transformer decoder-only de 70 millones de parametros entrenado por EleutherAI sobre el corpus The Pile en su version deduplicada. El repositorio no aporta informacion adicional sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos detalles corresponden a la model card del modelo base y no se reproducen aqui.

La innovacion de este artefacto no esta en el entrenamiento sino en el empaquetado: los pesos se convierten con MLC LLM y se compilan en una biblioteca WebAssembly con los hooks de drowse insertados en el flujo residual. El paquete incluye un "core geometry pack" con estadisticas neutrales y variedades conceptuales por defecto para cada contexto, y el autor indica explicitamente que este modelo se lee en el residual stream y que no dispone de lens ni de units packs. La reproducibilidad se documenta mediante `drowse-build.json` (archivos fuente, commit base de MLC LLM y hash de cada overlay del compilador) y `hosted-artifacts.json` / `hosted-pack-artifacts.json` (digests por archivo).

## Capacidades

- Generacion de texto por completado crudo, sin formato de instrucciones ni plantilla de chat.
- Lectura y modulacion del flujo residual durante la generacion mediante los hooks de drowse (hook ABI `block-sites-v5`).
- Ejecucion en el dispositivo a traves de WebGPU, sin backend remoto.
- Inspeccion de activaciones internas con las estadisticas neutrales y las variedades conceptuales del core geometry pack.
- Verificacion de integridad de artefactos mediante SHA-256 y catalogo firmado de drowse.ai.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Interpretabilidad mecanicista en el navegador: cargar el modelo en drowse.ai y observar las activaciones del flujo residual capa a capa mientras se generan tokens, sin necesidad de GPU remota ni de entorno Python.
- Docencia y demostraciones de circuitos internos: el modelo de 70M y contexto de 2048 tokens permite mostrar como se comporta un transformer pequeno en tiempo real dentro de una pagina web.
- Stearing de conceptos: usar las variedades conceptuales por defecto del geometry pack para modular la generacion y comparar la salida con la linea base neutra.
- Validacion de pipelines de compilacion MLC LLM/WebGPU: el paquete sirve como referencia reproducible con hashes de cada overlay del compilador para auditar builds propios.
- Pruebas de regresion de hooks: verificar que una modificacion en el runtime de drowse no altera las lecturas del residual stream frente a la revision inmutable fijada por el catalogo.
- Experimentos de reproducibilidad: reconstruir el artefacto a partir de `drowse-build.json` y comparar digests con `hosted-artifacts.json` para auditar la cadena de suministro.
- Prototipado de interfaces de explicabilidad: integrar las lecturas del modelo en visualizaciones web interactivas para estudiar atribucion de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 70M de parametros en float32 el peso ronda los 0,28 GB, aunque el artefacto es de navegador y se ejecuta en WebGPU, no como checkpoint estandar.
- GPU recomendadas: no disponibles; el requisito funcional es un navegador con soporte de WebGPU.
- Compatibilidad con GPU de consumo: previsiblemente amplia por el tamano del modelo, pero no se documenta una lista de GPUs validadas.
- Opciones de despliegue: exclusivamente a traves de drowse.ai y su runtime `drowse-web-runtime-v2`; el autor indica que no es un checkpoint de Transformers y que debe instalarse desde el catalogo firmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| stdlogits/drowse-web-pythia-70m-base | 70M | 2048 | Artefactos MLC LLM/WebGPU | mixed-artifact-licenses | Interpretabilidad en navegador con hooks en el residual stream |
| EleutherAI/pythia-70m-deduped | 70M | 2048 | safetensors (Transformers) | Apache 2.0 (modelo base) | Modelo base de investigacion estandar |
| EleutherAI/pythia-160m-deduped | 160M | 2048 | safetensors (Transformers) | Apache 2.0 (modelo base) | Version mayor de la misma familia para experimentos de escala |

La comparacion con otros artefactos WebGPU de interpretabilidad no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde a preguntas ni sigue indicaciones; solo completa texto.
- Con 70M de parametros, la calidad de generacion es limitada y la tasa de alucinacion en completados factuales es alta.
- Ventana de contexto de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados no documentados; el comportamiento fuera del ingles no esta garantizado.
- La licencia es mixta y se aplica por componente (`mixed-artifact-licenses`); es imprescindible revisar LICENSES.md antes de cualquier uso, incluido el comercial.
- No es un checkpoint de Transformers: no puede cargarse con `transformers`, vLLM, llama.cpp ni Ollama; solo funciona con el runtime de drowse.
- El artefacto esta fijado a revisiones inmutables por el catalogo firmado; modificarlo rompe la verificacion de digests.
- No dispone de lens ni de units packs; las funciones de interpretabilidad se limitan al residual stream y al core geometry pack.
- El repositorio tiene un uso muy bajo (27 descargas, 0 likes), por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stdlogits/drowse-web-pythia-70m-base
- Licencias por componente: https://huggingface.co/stdlogits/drowse-web-pythia-70m-base/blob/main/LICENSES.md
- Modelo base: https://huggingface.co/EleutherAI/pythia-70m-deduped
- Revision del modelo base citada: https://huggingface.co/EleutherAI/pythia-70m-deduped/tree/e93a9faa9c77e5d09219f6c868bfc7a1bd65593c
- drowse.ai: https://drowse.ai
- Repositorio drowse: https://github.com/stdlogits/drowse
- Repositorio drowse.ai: https://github.com/stdlogits/drowse.ai
