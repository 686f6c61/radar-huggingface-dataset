# vmlinux/Muse-Glimmer-30B-ROCmFPX-GGUF

## Resumen

Muse-Glimmer-30B es un modelo multimodal de Meta (imagen-texto a texto) con 29.6B parámetros densos, liberado bajo licencia Apache-2.0. Esta variante concreta, publicada por el usuario vmlinux, es una cuantización GGUF en formato ROCmFPX (FP4 y FP8) diseñada específicamente para hardware AMD Strix Halo (gfx1151), como el Ryzen AI MAX+ 395. El modelo base original es un transformer denso de visión-lenguaje que acepta entradas de texto e imagen y soporta tool calling y razonamiento agéntico, tal como se describe en la tarjeta de NVIDIA NIM y en repositorios de terceros.

La relevancia de esta build radica en que permite ejecutar un modelo multimodal de 30B en hardware AMD de consumo con un rendimiento medido de hasta 14.9 tokens por segundo en generación (con el preset ROCmFP4 estándar) y 28.3 tokens por segundo con decodificación especulativa DFlash. Sin embargo, requiere un runtime experimental parcheado basado en el fork ROCmFPX de llama.cpp, ya que los tensores ROCmFP4/ROCmFP8 no son compatibles con la versión estándar de llama.cpp. El repositorio incluye cinco archivos GGUF: tres modelos principales (ROCmFP4, ROCmFP4-Q6-QUALITY y ROCmFP8), un proyector de visión en BF16 y dos drafters DFlash para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de vision-lenguaje (multimodal) |
| Parametros totales | 29.6B (segun repositorio AIwork4me/Muse-Glimmer-30B-ROCm) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ROCmFP4 (Q4_0_ROCMFP4_STRIX), ROCmFP4-Q6-QUALITY (Q4_0_ROCMFP4_COHERENT), ROCmFP8 (Q8_0_ROCMFPX), DFlash (drafter FP4 y FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tensores ROCmFPX propietarios) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso de 29.6B parametros que combina un codificador de vision con un decodificador de lenguaje, disenado para tareas de imagen-texto a texto. Segun la tarjeta de NVIDIA NIM, el modelo soporta tool calling nativo (protocolo Onyx) y parsers de razonamiento, lo que sugiere un entrenamiento orientado a capacidades agénticas. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion (RLHF, DPO, etc.) en los materiales proporcionados.

La innovacion principal de esta build reside en el formato de cuantizacion ROCmFPX, que implementa layouts de tensores FP4 y FP8 optimizados para la arquitectura RDNA de AMD. Los modelos FP4 utilizan una importancia matrix (iMatrix) de aproximadamente 256k tokens de calibracion con 416 entradas de importancia por cuantizador, mientras que el FP8 de referencia no la consume. Ademas, se incluyen dos drafters DFlash para decodificacion especulativa, que generan propuestas de tokens que el modelo principal verifica, mejorando el throughput de generacion.

## Capacidades

- Procesamiento multimodal de texto e imagen (image-text-to-text).
- Generacion de texto conversacional con soporte de contexto multi-turno.
- Tool calling / function calling nativo (protocolo Onyx, segun NVIDIA NIM).
- Razonamiento agéntico con parsers especificos (segun la misma fuente).
- Decodificacion especulativa mediante drafters DFlash, que acelera la generacion sin degradar la calidad final (las propuestas son verificadas por el modelo principal).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes virtuales con entrada visual: el modelo puede analizar imagenes y mantener conversaciones multi-turno sobre su contenido, por ejemplo para soporte tecnico que requiere interpretar capturas de pantalla o diagramas.
- Automatizacion de tareas con tool calling: gracias a su soporte nativo de function calling, puede integrarse en pipelines que consultan APIs, bases de datos o servicios externos, como un agente que reserva citas o consulta el tiempo.
- Analisis de documentos e imagenes en local: la cuantizacion ROCmFP4 permite ejecutar el modelo en una APU Strix Halo con 14.17 GiB de peso, lo que habilita el procesamiento de facturas, formularios o fotografias sin conexion a internet.
- Prototipado de agentes agénticos: el modelo combina razonamiento multi-paso con tool calling, adecuado para experimentar con agentes que planifican y ejecutan acciones en entornos simulados.
- Despliegue en hardware AMD de consumo: la build ROCmFPX esta validada en Ryzen AI MAX+ 395, lo que la convierte en una opcion para desarrolladores que quieran ejecutar un modelo multimodal de 30B en una estacion de trabajo sin GPU dedicada de gama alta.
- Benchmarking de decodificacion especulativa: los drafters DFlash permiten evaluar el impacto de la generacion especulativa en throughput y latencia en hardware RDNA, util para investigacion en optimizacion de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente mediciones de rendimiento de inferencia en hardware Strix Halo, que se resumen a continuacion:

| Archivo | Tamano | BPW | Prompt t/s | Output t/s |
|---|---|---|---|---|
| Muse-Glimmer-30B-ROCmFP4.gguf | 14.17 GiB | 4.36 | 113.7 | 14.9 |
| Muse-Glimmer-30B-ROCmFP4-Q6-QUALITY.gguf | 14.94 GiB | 4.60 | 39.0 | 14.0 |
| Muse-Glimmer-30B-ROCmFP8.gguf | 26.77 GiB | 8.25 | 96.7 | 7.8 |
| mmproj-Muse-Glimmer-30B-BF16.gguf | 3.59 GiB | — | 81.7 | 14.9 |
| Muse-Glimmer-30B-DFlash-ROCmFP4.gguf | 1.39 GiB | 4.63 | 65.5¹ | 28.3¹ |
| Muse-Glimmer-30B-DFlash-ROCmFP8.gguf | 2.47 GiB | 8.25 | 65.1¹ | 27.2¹ |

¹ Medidas end-to-end con el modelo principal ROCmFP4, DFlash activado y ventana de seis tokens de draft. Medias de tres ejecuciones.

## Requisitos de hardware

- GPU validada: AMD Strix Halo (gfx1151), concretamente Ryzen AI MAX+ 395. Se menciona que las GPU discretas Radeon (p. ej., W7900) estan en el roadmap, pero no han sido validadas aun.
- VRAM estimada: el modelo ROCmFP4 ocupa 14.17 GiB, el ROCmFP4-Q6-QUALITY 14.94 GiB, el ROCmFP8 26.77 GiB, y el proyector de vision BF16 anade 3.59 GiB. Los drafters DFlash ocupan entre 1.39 y 2.47 GiB adicionales.
- Se puede ejecutar en una APU con memoria unificada (como la serie Strix Halo) o en una GPU discreta con VRAM suficiente.
- Runtime necesario: build parcheada de ROCmFPX (commit `00d54526e24e3aba4c76474e3147cbf9c7cc034c`) con el patch `ROCmFPX-Muse-Glimmer.patch` incluido en el repositorio. No es compatible con llama.cpp estandar.
- Backends soportados: ROCm y Vulkan (las pruebas de generacion usaron `ROCm0`).
- Opciones de despliegue: llama.cpp (con parche), integrable en aplicaciones que usen la API de llama.cpp. No se mencionan vLLM, Ollama ni TGI para esta build especifica.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre esta build y otros modelos multimodales de tamano similar (p. ej., LLaVA-34B, Qwen2-VL-32B). La informacion disponible no incluye resultados de benchmarks de calidad que permitan una comparacion objetiva. Se puede indicar que el modelo base compite en la categoria de modelos multimodales de ~30B con licencia abierta, pero no hay datos numericos para respaldar una comparativa.

## Limitaciones y advertencias

- Runtime experimental: los archivos requieren un fork parcheado de ROCmFPX y no cargan en llama.cpp estandar. Esto limita su portabilidad y dificulta su integracion en herramientas que usen builds oficiales.
- Hardware restringido: la validacion se ha realizado unicamente en AMD Strix Halo (gfx1151). El rendimiento en otras GPUs AMD o NVIDIA no esta garantizado ni documentado.
- Cuantizacion FP4: el preset ROCmFP4 reduce la precision de los pesos, lo que puede degradar la calidad del modelo en tareas que requieran alta fidelidad numerica. El preset ROCmFP8 ofrece mayor precision a costa de mas VRAM y menor velocidad de generacion.
- Sin datos de sesgos o alucinacion: no se ha publicado informacion sobre sesgos, riesgos de alucinacion o limitaciones de idioma del modelo base. Se recomienda evaluar estos aspectos antes de usar el modelo en produccion.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el runtime ROCmFPX es un proyecto de terceros con su propia licencia; es necesario revisar los terminos de ese proyecto antes de redistribuir una solucion basada en el.
- Decodificacion especulativa: el uso de drafters DFlash requiere una ventana de draft configurada correctamente; sin el fix de rotacion de cache incluido en el patch, la tasa de aceptacion puede ser casi nula.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vmlinux/Muse-Glimmer-30B-ROCmFPX-GGUF
- Modelo base (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo base assistant (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant
- Proyecto ROCmFPX (runtime): https://github.com/charlie12345/ROCmFPX
- Guia de ejecucion en AMD RDNA: https://github.com/AIwork4me/Muse-Glimmer-30B-ROCm
- Guia de uso local (cobusgreyling): https://github.com/cobusgreyling/Muse-Glimmer
- Tarjeta del modelo en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
