# unsloth/LTX-2.5-FP8

## Resumen

LTX-2.5-FP8 es una version cuantizada del transformador de difusion (DiT) destilado de LTX-2.5, el modelo de generacion de video con pesos abiertos de Lightricks. La publica unsloth, conocido por sus herramientas de cuantizacion y entrenamiento eficiente, y no es un modelo nuevo: sustituye el transformador en bf16 de 38,0 GB de `Lightricks/LTX-2.5-Diffusers` por un fichero de 19,1 a 25,1 GB, manteniendo intactos el codificador de texto, los conectores, los VAE, el vocoder y el upsampler de latentes, que se cargan desde el repositorio original de Diffusers. El objetivo es reducir el coste de descarga y de memoria de inferencia sin degradar de forma apreciable el resultado.

El repositorio contiene tres variantes de pesos con compromisos distintos entre tamano y fidelidad: FP8 e4m3 con escalas por fila (19,06 GB), INT8 W8A8 con rotacion Hadamard de bloque (25,11 GB) e INT8 W8A8 sin rotacion (25,11 GB). Segun la model card, la variante recomendada es INT8-ConvRot, que consigue la menor divergencia frente al DiT en bf16 (LPIPS 0,265 de media sobre 121 fotogramas de 4 clips). Los ficheros son bit-identicos a cuantizar el DiT en bf16 en tiempo de carga con la misma receta, por lo que no anaden error adicional respecto a la cuantizacion on-the-fly: solo ahorran la descarga y el staging en bf16.

Es relevante ahora porque la generacion de video abierta con audio sincronizado exige mucha memoria, y estas cuantizaciones acercan el modelo a GPUs de gama alta de consumo y a servidores de una sola GPU. El modelo base se distribuye bajo la licencia comunitaria LTX-2.x, no bajo una licencia permisiva estandar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer 3D) destilado, con flujo de audio, atencion cruzada audio-video, adaLN y proyecciones de timestep; incluye VAE, vocoder y upsampler de latentes |
| Parametros totales | no disponible de forma explicita; el checkpoint de origen se denomina `ltx-2.5-22b-distilled-transformer-bf16`, lo que sugiere aproximadamente 22.000 millones en el transformador (no confirmado en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un LLM; la configuracion de referencia genera 121 fotogramas a 24 fps) |
| Tipos de cuantizacion | FP8 e4m3 con escalas por fila (lineales con 512 o mas caracteristicas); INT8 W8A8 con rotacion Hadamard de bloque group-256 (ConvRot); INT8 W8A8 sin rotacion |
| Idiomas soportados | en (ingles) |
| Licencia | ltx-2.x-community-license-agreement (identificador `other`), enlazada a https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x |
| Formato de pesos | safetensors en el layout de torchao (`tensor_names` mas una entrada por tensor en la cabecera; los tres parametros raiz se almacenan como `unsloth_root::<name>`); no se ejecuta codigo pickleado al cargar |

Datos adicionales del repositorio: 69,3 GB de tamano total (los tres ficheros suman 25,11 + 19,06 + 25,11 GB), 213 descargas y 1 like en el momento de la consulta. Creado el 13 de octubre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para video construido sobre el checkpoint destilado de LTX-2.5, obtenido del directorio `transformer/` de `Lightricks/LTX-2.5-Diffusers` en la revision `da0b690960026eab794b8ceaf841233cf7064478`, tensor a tensor identico a `ltx-2.5-22b-distilled-transformer-bf16.safetensors` del repositorio `Lightricks/LTX-2.5`. La arquitectura combina un flujo de video con un flujo de audio, atencion cruzada entre ambos, modulacion adaLN y proyecciones de timestep, ademas de VAE, vocoder y upsampler de latentes que no se cuantizan en este repositorio.

La innovacion de esta publicacion no esta en el entrenamiento, sino en la cuantizacion. FP8 cuantiza toda lineal con al menos 512 caracteristicas. INT8 mantiene en bf16 el flujo de audio, la atencion cruzada audio-video, las proyecciones adaLN y de timestep, y las normalizaciones. INT8-ConvRot aplica ademas una rotacion Hadamard de bloque (grupo 256) a las entradas de las 480 lineales de video cuantizadas antes de cuantizar; la rotacion queda registrada en los metadatos del fichero y se aplica a las activaciones en tiempo de ejecucion. La carga se realiza con `torchao.prototype.safetensors.safetensors_support.unflatten_tensor_state_dict`, y el modelo `LTX2VideoTransformer3DModel` de diffusers lo carga de forma estricta. Verificado con torch 2.13 y torchao 0.18.

El sampler destilado de referencia usa 8 + 3 pasos en dos etapas con CFG 1, a 1280x704, 121 fotogramas y 24 fps. No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de video a partir de texto (text-to-video) en ingles.
- Generacion de video a partir de imagen (image-to-video), manteniendo el sujeto y la escena del fotograma de entrada.
- Generacion de audio sincronizado con el video, ya que el transformador conserva un flujo de audio y atencion cruzada audio-video.
- Salida a resolucion nativa y control de la duracion mediante el numero de fotogramas (121 fotogramas a 24 fps en la configuracion de referencia).
- Ejecucion local y ajuste fino (fine-tuning), segun la descripcion del modelo base de Lightricks.
- Carga directa en diffusers mediante la clase estandar `LTX2VideoTransformer3DModel`, sin codigo personalizado ni pickleado.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso: no aplica a un modelo de generacion de video.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Prototipado de video generativo en una sola GPU: con la variante FP8 (19,06 GB de pesos del transformador) es posible cargar el modelo sin descargar ni alojar el checkpoint en bf16 de 38,0 GB, lo que reduce el tiempo de puesta en marcha en equipos con memoria limitada.
- Previsualizacion de planos para produccion audiovisual: el modelo genera clips de 121 fotogramas a 24 fps con audio sincronizado, utiles como animatica o previsualizacion antes de rodar, partiendo de un prompt o de una imagen fija.
- Animacion de imagenes fijas (image-to-video): la model card incluye ejemplos en los que el sujeto de una imagen se anima ("the blue robot pulls the grey bin toward itself"), lo que encaja en flujos de motion graphics y publicidad.
- Investigacion en cuantizacion de modelos de difusion: los tres ficheros permiten comparar recetas (FP8 por fila, INT8 sin rotacion, INT8 con rotacion Hadamard group-256) midiendo LPIPS y PSNR contra el mismo DiT en bf16, con semillas y ajustes fijos.
- Despliegue en servidores con GPUs de 40 o 80 GB: la variante INT8-ConvRot, con la menor divergencia medida, es la opcion indicada para pipelines de generacion de video en produccion donde la fidelidad frente al bf16 importa.
- Ajuste fino de un modelo de video con requisitos de memoria reducidos: al usar un transformador cuantizado como punto de partida en lugar del bf16 de 38,0 GB, se libera memoria para el optimizador y los gradientes en entornos de investigacion.
- Generacion de video con audio integrado para demostraciones y material de marketing, sin necesidad de un paso separado de sintesis de audio, gracias al flujo de audio que el esquema INT8 conserva en bf16.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros), ya que no es un modelo de lenguaje. Si publica metricas de fidelidad de la cuantizacion frente al DiT en bf16, medidas sobre los 121 fotogramas de 4 clips (text-to-video e image-to-video, semillas 42 y 7, ajustes destilados de referencia: 1280x704, 24 fps, 8 + 3 pasos en dos etapas, CFG 1, mismo codificador de texto en bf16 en todas las ejecuciones):

| Fichero | Tamano | Esquema | LPIPS vs bf16 (media / peor fotograma) | PSNR vs bf16 (media / peor fotograma) |
|---|---|---|---|---|
| `LTX-2.5-INT8-ConvRot.safetensors` | 25,11 GB | INT8 W8A8, rotacion Hadamard group-256 | 0,265 / 0,449 | 20,2 / 16,8 dB |
| `LTX-2.5-FP8.safetensors` | 19,06 GB | FP8 e4m3, escalas por fila | 0,366 / 0,518 | 17,6 / 11,6 dB |
| `LTX-2.5-INT8.safetensors` | 25,11 GB | INT8 W8A8, sin rotacion | 0,385 / 0,632 | 17,4 / 13,9 dB |

Referencia de control: una renderizacion repetida en bf16 es bit-identica (LPIPS 0,000). El autor senala que el sampler destilado inyecta ruido en cada paso, de modo que los pequenos errores de pesos afectan mas al movimiento que al aspecto de un fotograma aislado, y que los tres ficheros conservan el sujeto, la escena y el prompt. No hay datos de benchmarks comparativos con otros modelos de generacion de video en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (estimacion propia a partir del tamano de los pesos; el autor no publica cifras): en torno a 22-26 GB para la variante FP8 y 28-32 GB para las variantes INT8, sumando el transformador cuantizado y los componentes no cuantizados (codificador de texto, conectores, VAE, vocoder, upsampler de latentes).
- Referencia de partida: el transformador en bf16 ocupa 38,0 GB, por lo que requiere aproximadamente 44 GB solo para los pesos, antes de activaciones.
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S y, en general, GPUs profesionales con 40 GB o mas para las variantes INT8; una GPU de 24 GB queda muy ajustada para FP8 y previsiblemente necesita offload de componentes.
- En GPU de consumo: la variante FP8 (19,06 GB de pesos) es la unica candidata razonable para una RTX 4090 de 24 GB, y aun asi con muy poco margen; las variantes INT8 de 25,11 GB no caben sin offloading. No confirmado por el autor.
- Opciones de despliegue: diffusers como libreria principal (carga estricta con `LTX2VideoTransformer3DModel`), con soporte de torchao 0.18 y torch 2.13 para reconstruir el state dict; unsloth publica ademas una variante GGUF del modelo base (`unsloth/LTX-2.5-GGUF`) para entornos con esa via de despliegue.
- No se ejecuta codigo pickleado al cargar los safetensors, lo que simplifica el despliegue en entornos con requisitos de seguridad.
- Latencia y throughput: no disponible. Como referencia indirecta, el sampler destilado de referencia usa 8 + 3 pasos en dos etapas con CFG 1, muy por debajo de los 30-50 pasos tipicos de modelos de difusion no destilados.

## Comparativa con modelos similares

Comparativa entre las variantes incluidas en este repositorio y el transformador original en bf16. No hay datos en la informacion disponible para comparar con otras familias de modelos de video (por ejemplo, alternativas cerradas o abiertas de otros proveedores).

| Modelo | Parametros | Pestos del transformador | Esquema | LPIPS vs bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lightricks/LTX-2.5-Diffusers (bf16) | ~22B (segun denominacion del checkpoint) | 38,0 GB | bf16 | referencia (0,000 en repeticion) | ltx-2.x-community-license-agreement | HuggingFace, diffusers |
| unsloth/LTX-2.5-FP8 | mismo transformador | 19,06 GB | FP8 e4m3, escalas por fila | 0,366 | ltx-2.x-community-license-agreement | HuggingFace, diffusers |
| unsloth/LTX-2.5-INT8-ConvRot | mismo transformador | 25,11 GB | INT8 W8A8 + Hadamard group-256 | 0,265 | ltx-2.x-community-license-agreement | HuggingFace, diffusers |
| unsloth/LTX-2.5-INT8 | mismo transformador | 25,11 GB | INT8 W8A8 sin rotacion | 0,385 | ltx-2.x-community-license-agreement | HuggingFace, diffusers |

Los tres ficheros cuantizados son bit-identicos a cuantizar el DiT en bf16 en tiempo de carga con la misma receta, por lo que su unica ventaja frente a la cuantizacion on-the-fly es el ahorro de descarga y de staging en bf16. La diferencia de LPIPS entre INT8-ConvRot (0,265) y FP8 (0,366) es del 27,6 % en favor de INT8-ConvRot, a cambio de 6,05 GB mas de pesos.

## Limitaciones y advertencias

- Licencia: se distribuye bajo la LTX-2.x Community License Agreement, no bajo Apache 2.0 ni MIT. Es imprescindible revisar las condiciones antes de cualquier uso comercial, ya que puede haber restricciones por volumen de facturacion, atribucion obligatoria o limites de uso.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible. Al ser un modelo de generacion de video entrenado con datos no descritos, puede reproducir estereotipos presentes en esos datos.
- Alucinacion visual: como todo modelo generativo de video, puede producir incoherencias fisicas, deformaciones de objetos o movimientos no solicitados. El autor advierte que los errores de cuantizacion afectan mas al movimiento que al aspecto de un fotograma, de modo que la divergencia se manifiesta en la dinamica de la escena mas que en la nitidez.
- Degradacion por cuantizacion: FP8 presenta el peor PSNR en el peor fotograma (11,6 dB) y el segundo peor LPIPS; en escenas con movimiento rapido la diferencia respecto a INT8-ConvRot puede ser perceptible.
- Idioma: el modelo solo declara soporte de ingles, tanto en prompts como en cualquier texto derivado.
- Contexto: no es un modelo conversacional ni soporta tool calling; no debe evaluarse con criterios de LLM.
- Los datos de fidelidad se midieron con un unico conjunto de ajustes de referencia (1280x704, 121 fotogramas, 24 fps, 8 + 3 pasos, CFG 1) y solo dos semillas (42 y 7) sobre 4 clips. No hay garantia de que el comportamiento se mantenga con otras resoluciones, duraciones o pasos.
- Los componentes no cuantizados (codificador de texto, VAE, vocoder, upsampler) se descargan aparte desde el repositorio de Diffusers, por lo que el consumo total de disco y memoria es superior al del fichero safetensors.
- Las estimaciones de VRAM y de encaje en GPUs de consumo son calculos propios basados en el tamano de los pesos; el autor no publica requisitos de hardware verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unsloth/LTX-2.5-FP8
- Modelo base (Diffusers): https://huggingface.co/Lightricks/LTX-2.5-Diffusers
- Repositorio del modelo base en formato original: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2.x Community License Agreement: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Pagina del modelo en Lightricks: https://ltx.io/model/ltx-2-5
- Variante GGUF del mismo modelo base publicada por unsloth: https://huggingface.co/unsloth/LTX-2.5-GGUF
- Catalogo de modelos de unsloth: https://huggingface.co/unsloth/models
- Documentacion de unsloth: https://docs.unsloth.ai/
- Repositorio de unsloth en GitHub: https://github.com/unslothai/unsloth/
- Servidor de Discord de unsloth: https://discord.gg/unsloth
- Referencia del articulo citado en las etiquetas: arxiv:2601.03233 (no se dispone del enlace completo ni del titulo en la informacion proporcionada)
- Video de presentacion del modelo base: https://www.youtube.com/watch?v=d0VFDNO45_U
- Recursos promocionales de LTX-2.5: https://videos.ltx.io/LTX-2/ltx-research/hf-hero-web.mp4 y https://videos.ltx.io/LTX-2/ltx-research/hf-hero-web.webm
