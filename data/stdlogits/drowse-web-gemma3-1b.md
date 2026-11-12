# stdlogits/drowse-web-gemma3-1b

## Resumen

drowse-web-gemma3-1b es un artefacto de inferencia en navegador derivado de Gemma 3 1B Instruct (concretamente de la version publicada por Unsloth), desarrollado por stdlogits para el proyecto drowse.ai. No se trata de un checkpoint de Transformers al uso, sino de un paquete de pesos convertidos y compilados para MLC LLM con destino a WebGPU y WebAssembly, disenado para ejecutarse integramente en el dispositivo del usuario dentro de un navegador. El modelo sirve como motor de chat de drowse.ai y, ademas, expone ganchos de interpretabilidad que permiten leer y dirigir sus activaciones internas durante la generacion.

El modelo conserva la arquitectura y el tamano del Gemma 3 1B Instruct original (aproximadamente 1.000 millones de parametros) y se distribuye cuantizado en formato `q4f32_1`, es decir, pesos de 4 bits con computo en float32. Soporta dos longitudes de contexto, 2048 y 4096 tokens, y se empaqueta junto al tokenizador y a la libreria de modelo en WebAssembly con los hooks de drowse compilados dentro.

Su relevancia es doble: por un lado, demuestra un flujo de despliegue de LLM en el navegador con verificacion criptografica de artefactos (SHA-256 por archivo y catalogo firmado); por otro, ilustra un caso de uso poco comun de la interpretabilidad mecanicista en produccion, con lentes R, S y packs de unidades alojados en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, heredada del modelo base) |
| Parametros totales | no disponible (modelo base Gemma 3 1B, aproximadamente 1.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 y 4096 tokens |
| Tipos de cuantizacion | `q4f32_1`: pesos de 4 bits con computo en float32 |
| Idiomas soportados | no disponible |
| Licencia | mixed-artifact-licenses (otra; ver LICENSES.md) |
| Formato de pesos | artefactos MLC LLM para WebGPU/WebAssembly (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es una conversion cuantizada del checkpoint `unsloth/gemma-3-1b-it`, que a su vez es una version del Gemma 3 1B Instruct de Google. Por tanto, la arquitectura subyacente es la de Gemma 3 en su variante de 1.000 millones de parametros: un transformer decoder-only con atencion multi-cabeza y las innovaciones propias de la familia Gemma 3. No se ha realizado entrenamiento adicional ni ajuste fino por parte de stdlogits; la relacion declarada con el modelo base es `quantized`.

La contribucion tecnica del repositorio no esta en el entrenamiento sino en el pipeline de compilacion y despliegue. Los pesos se convierten al formato de MLC LLM y la libreria de modelo se compila a WebAssembly con el runtime `drowse-web-runtime-v2`, el ABI de hooks `block-sites-v5` y el perfil `standard-v4`. Estos hooks permiten a drowse.ai inspeccionar y modular las activaciones por bloque durante la decodificacion, lo que habilita funciones de interpretabilidad y steering en tiempo real. La reproducibilidad se documenta mediante `drowse-build.json` (ficheros fuente, commit base de MLC LLM y hashes de cada overlay del compilador) y los manifiestos `hosted-artifacts.json` y `hosted-pack-artifacts.json` con el digest de cada archivo. El modelo incluye ademas un pack de geometria basica con estadisticas neutras y variedades conceptuales por defecto para cada contexto.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste instructivo de Gemma 3 1B.
- Ejecucion local en el navegador mediante WebGPU, sin envio de datos a servidores externos.
- Interpretabilidad en tiempo real: lectura de activaciones internas a traves de los hooks compilados en la libreria WebAssembly.
- Steering o modulacion de la generacion mediante las lentes R y S y los packs de unidades alojados en el repositorio de instrumentos.
- Analisis de caracteristicas con Gemma Scope, disponible en el repositorio `drowse-web-gemma3-1b-instruments`.
- Soporte de dos ventanas de contexto configurables (2048 y 4096 tokens).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Chat asistente embebido en una web: el modelo se ejecuta en el dispositivo del visitante a traves de WebGPU con contexto de hasta 4096 tokens, lo que permite conversaciones multi-turno sin coste de servidor ni transferencia de datos personales.
- Demostraciones educativas de interpretabilidad mecanicista: los hooks por bloque y las lentes R/S permiten visualizar que representaciones internas se activan durante la generacion, util para docencia e investigacion interactiva.
- Experimentacion con steering de comportamiento: los packs de unidades y variedades conceptuales permiten dirigir la generacion hacia o lejos de conceptos concretos sin reentrenar el modelo.
- Prototipado de aplicaciones de IA privadas por diseno: al no salir los datos del navegador, encaja en entornos con requisitos estrictos de privacidad o en escenarios offline una vez cargados los artefactos.
- Validacion de pipelines de despliegue en navegador: el catalogo firmado y la verificacion SHA-256 por archivo sirven como referencia para equipos que quieran auditar la integridad de sus artefactos de inferencia.
- Investigacion sobre cuantizacion 4 bits en WebGPU: el formato `q4f32_1` con computo float32 permite estudiar el equilibrio entre huella de memoria y calidad en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 1,2 GB, lo que da una cota superior del espacio de pesos y artefactos asociados.
- Al ejecutarse en el navegador sobre WebGPU, el requisito real es memoria de GPU accesible desde el navegador; no se especifican minimos oficiales.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de aproximadamente 1.000 millones de parametros en 4 bits, es plausible que quepa en GPU de consumo integradas y dedicadas recientes con soporte WebGPU, pero no hay datos publicados que lo confirmen.
- Despliegue: exclusivamente a traves de drowse.ai con el runtime `drowse-web-runtime-v2`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| drowse-web-gemma3-1b | aprox. 1B | 2048 / 4096 | MLC LLM (WebGPU/WASM) | mixed-artifact-licenses | Navegador via drowse.ai |
| unsloth/gemma-3-1b-it | aprox. 1B | no disponible en esta ficha | safetensors (checkpoint) | licencia de Gemma 3 | Transformers, vLLM, llama.cpp |
| Gemma 3 1B Instruct (Google) | aprox. 1B | no disponible en esta ficha | safetensors | terminos de Gemma | Multiples runtimes |

La comparativa se limita a la familia de origen porque no se dispone de datos de rendimiento ni de contexto de modelos alternativos en la informacion proporcionada. La diferencia principal frente a los checkpoints convencionales es el formato de distribucion y el runtime: drowse-web-gemma3-1b no es portable a frameworks de servidor sin reconversion.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: no puede cargarse con `from_pretrained` ni con runtimes convencionales; requiere el runtime y el catalogo de drowse.ai.
- La licencia es compuesta (`mixed-artifact-licenses`) y se aplica por componente; es imprescindible revisar LICENSES.md antes de cualquier uso, especialmente comercial, porque los terminos de Gemma 3 pueden imponer restricciones adicionales.
- El modelo hereda los sesgos y el riesgo de alucinacion de Gemma 3 1B Instruct, un modelo pequeno con conocimiento limitado.
- La ventana de contexto maxima es de 4096 tokens, insuficiente para tareas de documento largo o conversaciones muy extensas.
- No se declaran idiomas soportados; el comportamiento multilingue no esta verificado en esta distribucion.
- El rendimiento depende de la implementacion de WebGPU del navegador y del hardware del usuario, con variabilidad alta entre dispositivos.
- La cuantizacion a 4 bits puede degradar la calidad respecto al checkpoint original en tareas de razonamiento o codigo.
- El repositorio tiene un uso muy bajo (41 descargas, 0 likes) y no se han publicado evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stdlogits/drowse-web-gemma3-1b
- Repositorio de instrumentos (lentes R/S, unidades, Gemma Scope): https://huggingface.co/stdlogits/drowse-web-gemma3-1b-instruments
- Modelo base en Unsloth: https://huggingface.co/unsloth/gemma-3-1b-it/tree/5b11413a10db4e486ef16a20101fd028f8f2499c
- Licencias por componente: https://huggingface.co/stdlogits/drowse-web-gemma3-1b/blob/main/LICENSES.md
- Aplicacion drowse.ai: https://drowse.ai
- Repositorio drowse (autor a9lim): https://github.com/stdlogits/drowse
- Repositorio de la edicion web: https://github.com/stdlogits/drowse.ai
