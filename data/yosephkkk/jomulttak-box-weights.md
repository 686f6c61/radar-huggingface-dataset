# yosephkkk/jomulttak-box-weights

## Resumen

`yosephkkk/jomulttak-box-weights` es un repositorio de pesos preconvertidos a fp8 para la familia de modelos de generacion y edicion de imagenes Qwen-Image. No se trata de un modelo entrenado desde cero, sino de una recoleccion de artefactos derivados de tres repositorios oficiales: `Qwen/Qwen-Image-2512`, `Qwen/Qwen-Image-Edit-2511` y el LoRA de destilacion `lightx2v/Qwen-Image-Edit-2511-Lightning`. El autor declara explicitamente que no ha realizado entrenamiento alguno: solo ha modificado el dtype de determinadas capas, pasando de bf16 a `float8_e4m3fn`, siguiendo el criterio de layerwise casting de diffusers.

El interes practico del repositorio es el ahorro de VRAM y de ancho de banda en la carga del modelo. Al convertir a fp8 las capas seleccionadas por diffusers, se reduce el peso en disco y en memoria sin reentrenar, lo que facilita desplegar Qwen-Image y Qwen-Image-Edit en GPUs con menos memoria de la que exigiria el checkpoint original en bf16. El repositorio ocupa 64,5 GB e incluye tambien un text encoder (Qwen2.5-VL-7B) convertido a fp8.

Es relevante ahora porque la comunidad de difusion esta migrando hacia pesos de baja precision para inferencia en hardware de consumo, y estos artefactos permiten reutilizar los pipelines oficiales de Qwen-Image sin tener que ejecutar la conversion manualmente. Conviene tratarlo como un paquete de pesos auxiliar, no como un modelo con identidad propia ni con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Qwen-Image) con text encoder Qwen2.5-VL-7B; pesos modificados a float8_e4m3fn en capas seleccionadas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float8_e4m3fn (fp8) en capas seleccionadas; resto de tensores permanecen en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `config.json`, `*.index.json` y `generation_config.json` sin modificar) |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio. Los pesos base pertenecen a Qwen-Image-2512 y Qwen-Image-Edit-2511, modelos de difusion para generacion y edicion de imagenes, acompanados de un text encoder Qwen2.5-VL-7B. La unica transformacion aplicada es la conversion de dtype: las capas elegidas por el mecanismo de layerwise casting de diffusers pasan de bf16 a `float8_e4m3fn`, mientras que el resto de bytes permanece intacto. En la carpeta `qwen-image-edit-2511-l8/`, el LoRA de 8 pasos de `lightx2v/Qwen-Image-Edit-2511-Lightning` se fusiona primero en las 720 pesos bf16 afectados y despues esos pesos se convierten a fp8.

El autor documenta las revisiones exactas de cada repositorio de origen (`25468b98e3276ca6700de15c6628e51b7de54a26` para Qwen-Image-2512 y `6f3ccc0b56e431dc6a0c2b2039706d7d26f22cb9` para Qwen-Image-Edit-2511), lo que permite reproducir la conversion. Los ficheros `fp8_*.json` y `l8_*.json` listan tamano y SHA-256 de cada archivo, util para verificar integridad en pipelines de despliegue. No se documentan cambios en la arquitectura, en el schedule de muestreo ni en los datos de entrenamiento originales.

## Capacidades

- Generacion de imagenes a partir de texto mediante los pesos de `qwen-image-2512/transformer/`.
- Edicion de imagenes guiada por instrucciones con `qwen-image-edit-2511/transformer/`.
- Edicion rapida en 8 pasos gracias al LoRA Lightning fusionado en `qwen-image-edit-2511-l8/`.
- Codificacion de prompts de texto e imagen mediante el text encoder Qwen2.5-VL-7B en fp8 (`qwen-image-2512/text_encoder_fp8/`).
- Compatibilidad con los pipelines de diffusers, al mantener `config.json`, indices y `generation_config.json` identicos a los originales.
- No se declaran capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo es exclusivamente generativo visual.

## Casos de uso

- Despliegue de generacion texto-a-imagen en GPUs con VRAM limitada: usar `qwen-image-2512/transformer/` en fp8 reduce el peso en memoria frente al checkpoint bf16, permitiendo cargar el pipeline en tarjetas donde la version original no cabria.
- Edicion de imagenes por instrucciones en produccion: `qwen-image-edit-2511/transformer/` permite integrar un endpoint de edicion en aplicaciones de retoque, manteniendo la API de diffusers sin cambios de codigo.
- Prototipado rapido con pocos pasos: la variante `qwen-image-edit-2511-l8/` con el LoRA Lightning fusionado sirve para iterar en demos interactivas donde la latencia importa mas que la fidelidad maxima.
- Servicios de generacion de assets para marketing: el text encoder fp8 acelera la codificacion de prompts largos en pipelines por lotes.
- Investigacion sobre cuantizacion en difusion: el repositorio documenta revisiones, SHA-256 y criterio de seleccion de capas, lo que facilita experimentos de calidad fp8 frente a bf16.
- Empaquetado de entornos reproducibles: los ficheros de checksums permiten validar la integridad de los pesos en imagenes de contenedor o en despliegues con cache distribuida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad (FID, CLIP score, SSIM) ni comparativas de velocidad entre fp8 y bf16.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 64,5 GB en total, incluyendo transformer, text encoder y variantes, por lo que la VRAM necesaria depende de la carpeta que se cargue.
- GPU recomendadas: no disponible; al derivar de Qwen-Image, se espera que requiera GPUs de datacenter (A100, H100) o consumer de gama alta, pero el autor no lo especifica.
- Cabe en consumer GPU: no confirmado; la conversion a fp8 esta pensada precisamente para reducir requisitos, pero no hay datos publicados de que quepa en RTX 4090 u otras.
- Opciones de despliegue: diffusers (formato nativo, con layerwise casting), y potencialmente vLLM o TGI no estan documentados para este repositorio; llama.cpp y Ollama no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yosephkkk/jomulttak-box-weights` | no disponible | no disponible | fp8 en capas seleccionadas, resto bf16 | Apache-2.0 | HuggingFace, 0 descargas |
| `Qwen/Qwen-Image-2512` | no disponible | no disponible | bf16 | Apache-2.0 | HuggingFace (oficial) |
| `Qwen/Qwen-Image-Edit-2511` | no disponible | no disponible | bf16 | Apache-2.0 | HuggingFace (oficial) |
| `lightx2v/Qwen-Image-Edit-2511-Lightning` | no disponible | no disponible | LoRA (bf16) | no disponible | HuggingFace |

La comparativa se limita a los repositorios de origen, ya que no se dispone de datos de rendimiento ni de parametros para contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- No es un modelo entrenado: es una conversion de dtype de pesos ajenos; cualquier sesgo o limitacion de Qwen-Image se hereda sin cambios.
- El autor advierte que los pesos se ofrecen "AS IS", sin garantias.
- Solo se han convertido las capas seleccionadas por layerwise casting de diffusers; el resto sigue en bf16, por lo que el ahorro de memoria es parcial y no equivale a una cuantizacion completa.
- La variante `l8` fusiona un LoRA de terceros (`lightx2v`); su licencia no se detalla en la informacion disponible y conviene verificarla antes de uso comercial.
- No hay benchmarks ni evaluacion de degradacion de calidad por la conversion a fp8.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni senales de uso en produccion.
- No se declaran idiomas soportados; la cobertura linguistica depende del text encoder Qwen2.5-VL-7B original.
- Riesgo de alucinacion visual y de artefactos propios de modelos de difusion, no cuantificado en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yosephkkk/jomulttak-box-weights
- Modelo base Qwen-Image-2512: https://huggingface.co/Qwen/Qwen-Image-2512
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- LoRA Lightning: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
