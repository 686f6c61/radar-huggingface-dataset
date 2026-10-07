# vdaular/LTX-2.3-Workflows

## Resumen

Este repositorio de Hugging Face, `vdaular/LTX-2.3-Workflows`, no contiene pesos de un modelo en sentido estricto, sino una coleccion de flujos de trabajo (workflows) para ComfyUI orientados a la familia de modelos de generacion de video LTX-2 de Lightricks, en sus variantes LTX-2.3 y LTX-2.5. El autor empaqueta los grafos de nodos necesarios para ejecutar tareas de texto a video, imagen a video, audio a video y video a video, junto con las instrucciones de descarga de los ficheros de modelo (safetensors divididos y cuantizaciones GGUF) que esos flujos esperan encontrar.

El material se apoya en los modelos extraidos publicados por Kijai (`Kijai/LTX2.3_comfy`), en los modelos oficiales de Lightricks (`Lightricks/LTX-2.3` y `Lightricks/LTX-2.5`) y en cuantizaciones GGUF de terceros mantenidas por QuantStack, Unsloth y Vantage. El codificador de texto empleado en los flujos es Gemma 3 12B instruct, disponible tanto en safetensors como en GGUF, y se complementa con un VAE de video, un VAE de audio, un VAE reducido para previsualizaciones y un upscaler espacial 2x.

Su relevancia es practica: dado que los modelos LTX-2 se distribuyen como componentes separados (transformador, VAEs, codificador de texto, upscaler) y no como un unico checkpoint, este repositorio funciona como recetario de referencia para montar un entorno funcional en ComfyUI. Es un artefacto de comunidad, con cero descargas y cero valoraciones en el momento de la consulta, y sin licencia declarada, por lo que debe tratarse como material auxiliar y no como una fuente canonica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura interna de LTX-2.3 ni de LTX-2.5) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (varias fuentes: QuantStack, Unsloth, Vantage) y safetensors para los modelos divididos (variantes dev y distilled) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

Nota: los metadatos del repositorio declaran la libreria `ltx` y el pipeline `image-to-video`, e incluyen las etiquetas `text-to-video`, `image-to-video`, `audio-to-video` y `video-to-video`.

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna de los modelos LTX-2.3 o LTX-2.5, ni el volumen o la composicion de sus datos de entrenamiento, ni si se aplicaron fases de RLHF o DPO. Lo que si se deduce del material es la topologia de despliegue: el sistema se reparte en varios componentes independientes, a saber, el modelo principal (publicado en variantes dev y distilled), un VAE de video, un VAE de audio, un VAE reducido para previsualizaciones durante el muestreo y un upscaler espacial con factor 2x. El codificador de texto es Gemma 3 12B instruct, que actua como torre de comprension del prompt.

Como innovaciones de ingenieria, el repositorio documenta tres elementos relevantes. Primero, la compatibilidad retroactiva de los modelos LTX-2.5 con la mayoria de LoRAs de LTX-2.3, lo que permite reutilizar adaptadores ya existentes. Segundo, el uso de previsualizaciones de baja resolucion durante el muestreo mediante un VAE reducido o mediante `latentrgb` de los nodos KJNodes. Tercero, la disponibilidad de flujos especificos para modelos cuantizados en GGUF, lo que habilita la ejecucion con offload parcial entre GPU y CPU. No se dispone de informacion sobre mecanicas de atencion, decodificacion especulativa u otras optimizaciones internas.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante flujos de ComfyUI.
- Generacion de video a partir de una imagen de referencia (image-to-video), que es el pipeline declarado en los metadatos del repositorio.
- Generacion de video condicionada por audio (audio-to-video), segun las etiquetas del repositorio y los flujos incluidos.
- Transformacion de video existente (video-to-video).
- Reescalado espacial con el upscaler 2x especifico de LTX-2.3.
- Soporte de LoRAs: los modelos LTX-2.5 aceptan la mayoria de LoRAs entrenadas para LTX-2.3.
- Ejecucion con modelos cuantizados en GGUF, con flujos dedicados para ese formato.
- Previsualizacion de latentes durante el muestreo mediante VAE reducido o mediante `latentrgb` de KJNodes.
- Integracion nativa en ComfyUI, incluido el modo "app" de ComfyUI.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes ni razonamiento multi-paso, dado que no se trata de un modelo de lenguaje conversacional.

## Casos de uso

- Previsualizacion de storyboards publicitarios: el flujo image-to-video permite convertir bocetos o fotogramas clave en clips animados para validar una idea antes de rodar, y el upscaler 2x eleva la resolucion de la propuesta final.
- Produccion de contenido corto para redes sociales: los flujos de texto a video generan clips verticales u horizontales de forma iterativa dentro de ComfyUI, con variantes GGUF que reducen el coste de ejecucion en hardware de gama alta de consumo.
- Sincronizacion de video con locucion: el modo audio-to-video permite generar material visual condicionado por una pista de audio, util para piezas narradas, podcasts videados o presentaciones locutadas.
- Restilizado de metraje existente: el pipeline video-to-video posibilita aplicar un estilo visual coherente a material ya rodado sin regrabar, apoyandose en LoRAs compatibles.
- Reescalado y mejora de material generado: el upscaler espacial de LTX-2.3 se emplea como etapa final de la cadena para aumentar la resolucion de clips producidos con los modelos dev o distilled.
- Prototipado de efectos visuales en postproduccion: los artistas pueden generar planos de referencia con composicion y movimiento concretos antes de comprometer presupuesto en renderizado tradicional.
- Automatizacion de pipelines de contenido: al residir todo el proceso en ComfyUI, los flujos se pueden orquestar mediante la API del servidor y encadenar con tareas de postprocesado o publicacion.
- Comparacion de variantes de modelo: disponer de flujos separados para safetensors y para GGUF permite evaluar el compromiso entre fidelidad de salida y consumo de memoria en un mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir la procedencia de los ficheros, los nodos requeridos y los enlaces de descarga, sin incluir metricas objetivas de calidad de video, coherencia temporal, fidelidad al prompt ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. La existencia de cuantizaciones GGUF de multiples proveedores indica que el sistema esta pensado para ejecutarse con memoria limitada, pero no se especifican cifras.
- GPU recomendadas: no disponible. No se enumeran modelos de GPU concretos en el material consultado.
- Encaje en GPU de consumo: no disponible. La disponibilidad de variantes GGUF y de VAE reducido sugiere que se contempla hardware de gama de consumo, sin que se detallen umbrales.
- Componentes adicionales con impacto en memoria: el codificador de texto es Gemma 3 12B instruct, disponible en safetensors y en GGUF, lo que anade un requisito de memoria independiente del modelo de video.
- Opciones de despliegue: ComfyUI con los nodos `ComfyUI-KJNodes` (actualizado para soporte LTX-2) y `ComfyUI-GGUF` (tambien actualizado para soporte LTX-2). ComfyUI debe estar en su version mas reciente. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de generacion de video.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3 / LTX-2.5 (via este repositorio) | no disponible | no disponible | no disponible | no disponible | safetensors divididos y GGUF |
| Alternativas de generacion de video de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos comparables dentro de la informacion proporcionada, por lo que no se establece una comparacion cuantitativa. La unica relacion documentada es de dependencia, no de competencia: LTX-2.5 reutiliza LoRAs de LTX-2.3 y los flujos de LTX-2.3 sirven para ejecutar los modelos LTX-2.5.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo, solo flujos de trabajo; sin descargar por separado los ficheros de Lightricks, Kijai, QuantStack, Unsloth o Vantage, los flujos no son funcionales.
- No se declara licencia en los metadatos del repositorio. La licencia aplicable a los pesos subyacentes corresponde a sus autores originales y debe verificarse por separado antes de cualquier uso comercial.
- Los metadatos indican cero descargas y cero valoraciones, por lo que no existe validacion externa de que los flujos funcionen correctamente.
- Dependencia estricta de versiones: se exige la ultima version de ComfyUI y versiones actualizadas de `ComfyUI-KJNodes` y `ComfyUI-GGUF`. Versiones antiguas rompen el soporte de LTX-2.
- Los identificadores de idioma no estan declarados, y no se documenta el comportamiento multilingue del codificador de texto ni del modelo de video.
- Riesgo de alucinacion visual: al tratarse de un modelo generativo de video, puede producir artefactos, inconsistencias temporales, deformaciones anatomicas o contenido que no se corresponde con el prompt.
- No se documentan sesgos conocidos, pero tampoco se aporta informacion sobre la composicion del dataset ni sobre procesos de alineacion.
- Algunos enlaces de la model card apuntan a rutas y colecciones de terceros que pueden cambiar o desaparecer, lo que puede dejar los flujos sin fuentes de descarga validas.
- No se especifican requisitos de VRAM, latencia ni throughput, lo que dificulta planificar un despliegue en produccion.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica sobre el modelo; versan sobre podcasts en frances para estudiantes, por lo que no se han utilizado como fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vdaular/LTX-2.3-Workflows
- Modelos oficiales LTX-2.5 (Lightricks): https://huggingface.co/Lightricks/LTX-2.5
- Modelo oficial LTX-2.3 (Lightricks): https://huggingface.co/Lightricks/LTX-2.3
- Coleccion LTX-2.3 de Lightricks (LoRAs y otros): https://huggingface.co/collections/Lightricks/ltx-23
- Modelos extraidos para ComfyUI (Kijai): https://huggingface.co/Kijai/LTX2.3_comfy
- Codificador de texto Gemma 3 12B it en safetensors (Comfy-Org): https://huggingface.co/Comfy-Org/ltx-2/tree/main/split_files/text_encoders
- Codificador de texto Gemma 3 12B it en GGUF (Unsloth): https://huggingface.co/unsloth/gemma-3-12b-it-GGUF
- Cuantizaciones GGUF de LTX-2.3 (QuantStack): https://huggingface.co/QuantStack/LTX-2.3-GGUF
- Cuantizaciones GGUF de LTX-2.3 (Unsloth): https://huggingface.co/unsloth/LTX-2.3-GGUF
- Cuantizaciones GGUF de LTX-2.3 (Vantage): https://huggingface.co/vantagewithai/LTX-2.3-GGUF
- Nodos de ComfyUI requeridos (KJNodes): https://github.com/kijai/ComfyUI-KJNodes
- Nodos GGUF para ComfyUI (city96): https://github.com/city96/ComfyUI-GGUF
- Flujos oficiales de LTX-2 para ComfyUI: https://github.com/Lightricks/ComfyUI-LTXVideo/tree/master/example_workflows/2.3
- Anuncio de soporte de LTX-2.3 en ComfyUI: https://blog.comfy.org/p/ltx-23-day-0-supporte-in-comfyui
- Flujos para el modo "app" de ComfyUI: https://huggingface.co/WanApp
- Discusion sobre ubicacion de ficheros: https://huggingface.co/RuneXX/LTX-2.3-Workflows/discussions/10
