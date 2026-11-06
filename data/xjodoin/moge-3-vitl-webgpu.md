# xjodoin/moge-3-vitl-webgpu

## Resumen

MoGe-3 ViT-L WebGPU es una exportación no oficial a ONNX FP32 del modelo MoGe-3 ViT-L de Microsoft, publicada por el usuario xjodoin. El modelo original es un estimador de profundidad y geometría 3D a partir de una sola imagen, basado en un backbone ViT-Large, y esta versión está pensada para ejecutarse íntegramente en el navegador mediante WebGPU y ONNX Runtime Web. No hay reentrenamiento ni cuantización: se mantienen los pesos en FP32.

La relevancia de esta ficha radica en que traslada un modelo de reconstrucción 3D monocular a un entorno sin servidor: el navegador ejecuta las operaciones aprendidas en WebGPU y la orquestación dispersa en JavaScript, sin subir la imagen a ningún servidor. El repositorio incluye dos perfiles de inferencia (`profiles/fast` a 512x344 con 1200 tokens y `profiles/detail` a 768x512 con 1733 tokens), ambos con una pasada de refinamiento, y bloques dispersos compartidos en `refiner/`.

Es importante subrayar que no se trata de un único grafo ONNX de extremo a extremo: requiere la orquestación dispersa del proyecto fuente. El autor reporta seis comparaciones navegador-versus-nativo con MLX sobre un Apple M4 Pro con Chrome 156, con un NRMSE agregado máximo del 0,0975 %, aunque advierte que son comprobaciones de paridad sobre fotos sintéticas y no una validación de medición física.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-Large (backbone de MoGe-3) con refinador 3D disperso aprendido; exportación ONNX FP32 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen: 512x344 con 1200 tokens en perfil fast; 768x512 con 1733 tokens en perfil detail) |
| Tipos de cuantizacion | ninguna (FP32, sin cuantización) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32), con manifiestos por perfil que registran dimensiones, revisiones upstream, tamano de fichero y SHA-256 |

## Arquitectura y entrenamiento

El modelo subyacente, MoGe-3 ViT-L de Microsoft (checkpoint fijado en `184008f877d7ad1ad4c2cd2182a9bd1f63d0e5be`), emplea un backbone ViT-Large para extraer características de una imagen y un refinador 3D disperso aprendido que mejora la geometría estimada. Esta exportación no modifica los pesos: son conversiones FP32 a ONNX del modelo original, sin reentrenamiento ni cuantización, y el autor indica explícitamente que no constituyen un grafo único de extremo a extremo.

La innovación de esta versión es de despliegue, no de entrenamiento: las operaciones aprendidas se ejecutan en WebGPU y la indexación dispersa y la geometría se resuelven en JavaScript en el lado del navegador. Se ofrecen dos perfiles (`fast` y `detail`) con una sola pasada de refinamiento; el refinamiento a dos pasadas es experimental y queda excluido de la release. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Estimación de profundidad monocular a partir de una sola imagen.
- Reconstrucción de geometría 3D y generación de nubes de puntos con refinamiento disperso aprendido.
- Inferencia íntegra en el navegador mediante WebGPU y ONNX Runtime Web, sin subida de fotos ni inferencia en servidor.
- Dos perfiles de calidad/rendimiento: `fast` (512x344, 1200 tokens) y `detail` (768x512, 1733 tokens).
- Paridad numérica verificada frente a la implementación nativa MLX en seis comparaciones (NRMSE agregado máximo del 0,0975 %).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente viso-espacial.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Reconstrucción 3D en el navegador para herramientas de diseño: el usuario carga una foto y obtiene una nube de puntos sin enviar datos a un servidor, gracias a la ejecución en WebGPU con aproximadamente 1,5 GB de pesos por perfil.
- Previsualización de profundidad en aplicaciones de realidad aumentada web: el perfil `fast` (512x344, 1200 tokens) permite generar mapas de profundidad con baja latencia en el cliente.
- Edición fotográfica con desenfoque selectivo basado en profundidad: el mapa de profundidad estimado permite separar primer plano y fondo directamente en el navegador.
- Digitalización de objetos para catálogos de e-commerce: el perfil `detail` (768x512, 1733 tokens) proporciona geometría más fina para generar vistas 3D aproximadas de productos.
- Herramientas educativas de visión por computador: al ser un export ONNX abierto con manifiestos y SHA-256, sirve para estudiar el pipeline completo de un modelo de reconstrucción 3D en el navegador.
- Prototipado de captura 3D en movilidad: al no requerir servidor, puede integrarse en aplicaciones web progresivas que funcionen en dispositivos con WebGPU, como el Apple M4 Pro usado en las pruebas del autor.
- Verificación de paridad de despliegues: los benchmarks incluidos permiten comparar una implementación web frente a una nativa (MLX) en el mismo hardware.

## Benchmarks y rendimiento

El autor reporta seis comparaciones navegador-versus-nativo (MLX) sobre un Apple M4 Pro con Chrome 156:

| Metrica | Resultado |
|---|---|
| Comparaciones realizadas | 6 |
| NRMSE agregado maximo | 0,0975 % |
| Pixeles de mascara discrepantes | 1 pixel cercano al umbral |
| Outliers puntuales | mayores que el error agregado |
| Refinamiento a dos pasadas | experimental, excluido de la release |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de lenguaje. Las cifras anteriores son comprobaciones de paridad numérica sobre fotos sintéticas y no constituyen una validación de medición física.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 1,5 GB de pesos por perfil seleccionado y varios GB de memoria disponible en el navegador.
- GPU: requiere un navegador con soporte de WebGPU; las pruebas del autor se realizaron en un Apple M4 Pro con Chrome 156.
- GPU de consumo: no se dispone de datos de compatibilidad con RTX 4090, A100 o H100 en la información proporcionada; el destino es la GPU del cliente vía WebGPU.
- Despliegue: ONNX Runtime Web con WebGPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este caso de uso.
- Latencia y throughput: no disponibles; el README remite a los benchmarks y al README del proyecto fuente para tiempos exactos y contabilidad de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xjodoin/moge-3-vitl-webgpu | no disponible (ViT-L) | 512x344 / 768x512 | Navegador (WebGPU + ONNX Runtime Web) | MIT | Hugging Face, 0 descargas |
| Ruicheng/moge-3-vitl (original) | no disponible (ViT-L) | no disponible | Nativo (PyTorch/MLX) | no disponible en la informacion | Hugging Face |
| Otros estimadores de profundidad monocular | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo original de Microsoft del que deriva esta exportación.

## Limitaciones y advertencias

- No es un grafo ONNX de extremo a extremo: requiere la orquestación dispersa del proyecto fuente (`xjodoin/moge3-webgpu`); no funciona como un ONNX autónomo.
- Es una exportación no oficial: no es una release de Microsoft y no cuenta con su respaldo.
- Las validaciones de paridad se hicieron sobre fotos sintéticas y no constituyen validación de medición física; los errores puntuales (outliers) son mayores que el NRMSE agregado.
- El refinamiento a dos pasadas es experimental y queda excluido de la release.
- Requiere WebGPU y varios GB de memoria en el navegador; no se documentan requisitos mínimos de GPU de consumo.
- Riesgo de alucinación geométrica: al ser un modelo de reconstrucción, puede producir geometría plausible pero incorrecta en escenas ambiguas o con oclusiones; no se documentan sesgos específicos.
- Licencia MIT, que permite uso comercial, pero las licencias del código, pesos y dependencias upstream se incluyen en `licenses/` y deben revisarse por separado.
- Sin soporte de texto, tool calling ni agentes; no apto para tareas de lenguaje.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/xjodoin/moge-3-vitl-webgpu
- Modelo original: https://huggingface.co/Ruicheng/moge-3-vitl
- Proyecto fuente y validación: https://github.com/xjodoin/moge3-webgpu
- Demo en navegador: https://huggingface.co/spaces/xjodoin/moge3-webgpu
