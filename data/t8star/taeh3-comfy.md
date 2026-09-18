# t8star/Taeh3-Comfy

## Resumen

Taeh3-Comfy es un repositorio de pesos para ComfyUI publicado por el usuario t8star (T8) que empaqueta dos decoders TAE (tiny autoencoder) destinados a la previsualización aproximada durante el muestreo de MiniMax H3. No es un modelo generativo ni un modelo de lenguaje: son dos checkpoints de decodificación rápida que permiten ver una imagen aproximada del latente que se está generando, sin sustituir al VAE final ni modificar el proceso de difusión. El repositorio no entrena ni cuantiza nada; únicamente reorganiza pesos ya existentes de terceros y documenta la ruta de instalación en ComfyUI.

Los dos ficheros son estructuralmente distintos y no intercambiables. `taeh3.safetensors` (22.709.752 bytes) es el decoder temporal tiny procedente de madebyollin/taehv, pensado para previsualizar fragmentos continuos y con licencia MIT. `taeh3_2d_kijai.safetensors` (9.791.388 bytes) es la variante 2D por fotograma latente de Kijai/MiniMax-H3-TAE, renombrada sin modificar tensores para evitar colisiones de nombre, con licencia Apache-2.0.

Su relevancia es práctica y acotada: en pipelines de generación de vídeo con H3, donde cada iteración es costosa en tiempo de GPU, disponer de un preview barato a 256 píxeles de lado máximo y actualizado cada 2 pasos permite abortar generaciones malas antes de gastar el cómputo completo del VAE final. El repositorio tiene, en el momento de la consulta, 0 descargas y 1 like, y un tamaño declarado de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder ligero de previsualizacion (TAE): decoder temporal 3D y variante 2D por fotograma latente |
| Parametros totales | no publicado por el autor; peso de los ficheros: 22.709.752 bytes (`taeh3.safetensors`) y 9.791.388 bytes (`taeh3_2d_kijai.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre latentes de video) |
| Tipos de cuantizacion | no aplica; el autor indica expresamente que no ha reentrenado ni cuantizado ninguno de los dos modelos |
| Idiomas soportados | zh y en (solo documentacion del repositorio y de los nodos; los ficheros no procesan texto) |
| Licencia | other (`mit-and-apache-2.0-per-file`): MIT para el fichero temporal, Apache-2.0 para el fichero 2D |
| Formato de pesos | safetensors |
| Tamano de fichero (temporal) | 22.709.752 bytes |
| Tamano de fichero (2D) | 9.791.388 bytes |
| SHA256 (temporal) | `4fd022bfcab08772fe0536b17ea1a3bbb5625be11e397868d1c5d891863d4c13` |
| SHA256 (2D) | `f0f60fa072089997f817402098c2fd90777cb2660dd79cf5df42fc1e3e08e527` |
| Resolucion de preview por defecto | lado maximo 256, actualizacion cada 2 pasos, `phase=low` |
| Integracion | ComfyUI, directorio `ComfyUI/models/vae_approx/`, nodo `TAEH3` del paquete comfyui-minimax-h3-audio-T8 |
| Modelo base al que sirve | MiniMax H3 (generacion de video/avatar con audio gestionada aparte) |
| Descargas / likes del repo | 0 / 1 |
| Fecha de creacion / actualizacion | 2026-09-18 / 2026-09-18 |

## Arquitectura y entrenamiento

Ambos ficheros son decoders de autoencoder tiny (TAE), una familia de modelos diseñada para reconstruir una aproximación visual a partir de latentes sin la calidad ni el coste de un VAE completo. El fichero temporal `taeh3.safetensors` corresponde a un decoder tiny de tipo temporal, adecuado para previsualizar fragmentos continuos de vídeo; su origen es el repositorio madebyollin/taehv, en el commit `62f7591f59dfbb4c3c02b7a621d180a9eeaba26c`, con licencia MIT. El fichero `taeh3_2d_kijai.safetensors` es un decoder 2D que genera una aproximación por fotograma latente (no un vídeo continuo a 24 fps); procede de Kijai/MiniMax-H3-TAE, en la revisión `a213ac8bf2f148b4f32372279a7f207846978900`, con licencia Apache-2.0.

No hay entrenamiento propio ni ajuste fino en este repositorio: el autor declara explícitamente que no ha reentrenado ni cuantizado los dos modelos y que solo ha organizado los pesos existentes y las rutas de instalación. No se documentan en la información disponible el número de tokens, la composición del dataset ni fases de RLHF o DPO, ya que no aplica a este tipo de decoder de preview. La única intervención sobre los artefactos originales es el renombrado del checkpoint 2D de Kijai a `taeh3_2d_kijai.safetensors` para que no colisione con el temporal, que en el repositorio original también se llama `taeh3.safetensors`; el autor indica que no se han modificado los tensores.

La integración en el grafo de ComfyUI se hace insertando un observador entre el MODEL o el parche de modelo y el muestreador original: `MODEL / parche de modelo -> H3 previsualizacion dinamica + cancelacion segura (TAEH3 EXP/T8) -> muestreador original`. Los sigmas, el sampler, el número de pasos, el VAE final y el cableado de audio no se alteran, y el nodo se puede puentear con `enabled=false`.

## Capacidades

- Previsualizacion de baja resolucion del latente en curso durante el muestreo de MiniMax H3, con lado maximo configurable (256 por defecto).
- Decodificacion temporal aproximada de fragmentos continuos mediante `taeh3.safetensors`, con actualizacion cada 2 pasos y `phase=low` por defecto.
- Decodificacion 2D por fotograma latente mediante `taeh3_2d_kijai.safetensors`, seleccionable manualmente en el parametro `checkpoint` del nodo.
- Cancelacion segura de la generacion en curso desde el panel del nodo; el autor precisa que solo afecta a la peticion ligada al nodo y no vacia otras colas ni detiene el servicio de ComfyUI.
- Puenteo completo del nodo (`enabled=false`) sin afectar al pipeline original.
- Observacion limitada a los callbacks reales: solo se previsualiza el prefijo x0 de los callbacks efectivos, de modo que los aciertos de cache sin callback nuevo no generan preview en tiempo real.
- No genera audio, no sustituye al VAE final y no anade pasos de difusion.
- Soporte documental en chino y en ingles; no hay capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling ni agentes.

## Casos de uso

- Iteracion rapida en generacion de video o avatar con MiniMax H3: el decoder temporal permite ver una aproximacion del resultado cada 2 pasos a 256 px de lado, de modo que el artista puede decidir si merece la pena continuar antes de que el VAE final reconstruya el clip completo.
- Aborto temprano de generaciones fallidas: con la cancelacion segura del nodo, un resultado que ya se ve mal en la previsualizacion se puede descartar sin consumir el resto de pasos de difusion ni la decodificacion final.
- Barrido de semillas y prompts a bajo coste: al no aumentar los pasos de muestreo y usar un decoder de 22,7 MB, se pueden comparar muchas semillas con un coste marginal de decodificacion muy bajo antes de comprometer una tirada en calidad final.
- Depuracion de samplers y schedules de sigmas: el observador se inserta antes del muestreador y no altera sigmas ni sampler, por lo que sirve para inspeccionar visualmente como evoluciona el latente segun el schedule sin modificar el experimento.
- Monitorizacion remota de trabajos largos: un preview de 256 px consume poco ancho de banda, lo que facilita seguir el progreso de una cola de generacion desde otra maquina o desde una interfaz ligera del nodo.
- Triage de lotes en produccion: en un flujo por lotes, el preview permite clasificar rapidamente que clips merecen decodificacion final y cuales se descartan, reduciendo el uso agregado de GPU.
- Montaje de flujos de avatar con voz (workflow `36-avatar-voice`): el preview se mantiene separado del audio y del VAE final, de modo que se puede previsualizar la parte visual sin tocar el cableado de voz.
- Formacion y demostracion: al ser ficheros pequenos con SHA256 publicado, resultan utiles para explicar en talleres como funciona un decoder de preview dentro de un grafo de ComfyUI y como se verifica la procedencia de pesos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de reconstruccion (PSNR, SSIM, LPIPS), comparativas de latencia ni evaluaciones objetivas frente al VAE final de MiniMax H3. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM para inferencia: no publicada. Los ficheros son muy pequenos (22,7 MB y 9,8 MB en safetensors), por lo que la huella de los pesos del preview es despreciable; el consumo real de VRAM lo determina el pipeline de MiniMax H3, no estos decoders.
- GPU recomendadas: no disponibles. Cualquier GPU capaz de ejecutar el pipeline de MiniMax H3 en ComfyUI puede ejecutar el decoder de preview, dado su tamano.
- GPU de consumo: si el pipeline base cabe en una GPU de consumo, el preview no anade una restriccion relevante de memoria; no se especifican modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: ComfyUI con el nodo `TAEH3` del paquete comfyui-minimax-h3-audio-T8 y los ficheros en `ComfyUI/models/vae_approx/`. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles como cifras. Cualitativamente, el coste es bajo por el tamano del decoder y por los ajustes por defecto (lado maximo 256, actualizacion cada 2 pasos); no se anade ningun paso de difusion.

## Comparativa con modelos similares

| Modelo / fichero | Tipo | Tamano de pesos | Uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `taeh3.safetensors` (este repo, origen madebyollin/taehv) | Decoder TAE temporal | 22.709.752 bytes | Preview de fragmentos continuos en H3 | MIT | Incluido en este repositorio |
| `taeh3_2d_kijai.safetensors` (este repo, origen Kijai/MiniMax-H3-TAE) | Decoder TAE 2D por fotograma latente | 9.791.388 bytes | Preview 2D, no video continuo | Apache-2.0 | Incluido en este repositorio |
| madebyollin/taehv (commit `62f7591f59dfbb4c3c02b7a621d180a9eeaba26c`) | Repositorio upstream de decoders TAE | No disponible en la informacion proporcionada | Base del fichero temporal | MIT | Repositorio publico en GitHub |
| Kijai/MiniMax-H3-TAE (revision `a213ac8bf2f148b4f32372279a7f207846978900`) | Repositorio upstream de TAE especifico de H3 | No disponible en la informacion proporcionada | Base del fichero 2D | Apache-2.0 | Repositorio publico en Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes ni frente al VAE final de MiniMax H3. La diferencia funcional documentada es de proposito y estructura: uno decodifica temporalmente y el otro fotograma a fotograma, y el autor advierte que no deben intercambiarse ni sobrescribirse entre si.

## Limitaciones y advertencias

- El preview es una aproximacion: no representa la nitidez final, el movimiento completo del clip, el audio ni las costuras entre fragmentos.
- La velocidad del carrusel 2D no equivale a la tasa de fotogramas del video fuente; la variante 2D no produce video continuo a 24 fps.
- No sustituye al VAE final ni genera audio; el autor indica que el repositorio no proporciona modelos de clonacion de voz ni de reemplazo del VAE final.
- Los dos ficheros son estructuralmente distintos y no intercambiables: sobrescribir el temporal con el 2D rompe el comportamiento esperado. Conviene verificar el SHA256 antes de instalar.
- El nodo solo previsualiza los callbacks reales; si hay acierto de cache y no se emite un callback nuevo, no se genera preview en tiempo real.
- La cancelacion del panel afecta unicamente a la peticion ligada al nodo; no limpia otras colas ni apaga el servicio de ComfyUI.
- Uso comercial: la licencia es `other` con reparto por fichero (`mit-and-apache-2.0-per-file`). El fichero temporal es MIT y el 2D es Apache-2.0, pero se mantienen los derechos y licencias de los autores originales (madebyollin y Kijai), por lo que conviene revisar `LICENSES.md` y `provenance.json` antes de redistribuir.
- El repositorio no es un modelo entrenado por el autor: no hay tarjeta de datos, ni evaluacion de sesgos, ni garantia de calidad asociada a estos pesos.
- No hay benchmarks publicados ni metricas objetivas de fidelidad del preview, por lo que la calidad debe validarse en el flujo propio.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: es un artefacto de soporte de un nodo concreto, no un modelo con adopcion contrastada.
- Idiomas: la documentacion esta en chino e ingles; no se garantiza documentacion en castellano ni soporte mas alla de esos dos idiomas.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/t8star/Taeh3-Comfy
- Licencias del repositorio: https://huggingface.co/t8star/Taeh3-Comfy/blob/main/LICENSES.md
- Fichero de procedencia: https://huggingface.co/t8star/Taeh3-Comfy/blob/main/provenance.json
- Nodo y flujos de trabajo (GitHub): https://github.com/T8mars/comfyui-minimax-h3-audio-T8
- Documentacion de instalacion y preview: https://github.com/T8mars/comfyui-minimax-h3-audio-T8/blob/main/docs/TAEH3_SAMPLING_PREVIEW_EXP.md
- Workflow de preview oficial (avatar con voz): https://github.com/T8mars/comfyui-minimax-h3-audio-T8/tree/main/examples/workflows/36-avatar-voice
- Upstream del decoder temporal (madebyollin/taehv): https://github.com/madebyollin/taehv/tree/62f7591f59dfbb4c3c02b7a621d180a9eeaba26c
- Upstream del decoder 2D (Kijai/MiniMax-H3-TAE): https://huggingface.co/Kijai/MiniMax-H3-TAE/tree/a213ac8bf2f148b4f32372279a7f207846978900
- Perfil del autor en Hugging Face: https://huggingface.co/t8star
- Otro repositorio del autor (Meridian): https://huggingface.co/t8star/Meridian-Comfy
- Bilibili del autor: https://space.bilibili.com/385085361
- YouTube del autor: https://www.youtube.com/@T8star-Aix/
- API (enlace de promocion): https://api.seedance.nz/sign-up?aff=5f4w
- Aplicacion en linea (enlace de invitacion): https://www.runninghub.ai/zh-cn/user-center/1907375370302308353/userPost?inviteCode=rh-v1121
- Paquete integrado de ComfyUI: https://pan.quark.cn/s/264edb7e36bd
- Modelos en la nube: https://pan.quark.cn/s/c9c267081fbf

Nota: la busqueda web realizada no devolvio resultados tecnicos relacionados con este modelo; los unicos resultados obtenidos trataban sobre el juego Freecell y no se han incluido por no ser pertinentes.
