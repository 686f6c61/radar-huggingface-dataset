# Spectrallic/Qwen-Image-Edit-2511-Lightning-4step-int8-convrot

## Resumen

Qwen-Image-Edit-2511-Lightning-4step-int8-convrot es un checkpoint derivado del modelo de edicion de imagen Qwen-Image-Edit-2511, publicado por el usuario Spectrallic. Se trata de un unico fichero de safetensors que combina tres transformaciones sobre el transformer original: la fusion del LoRA de destilacion Lightning de 4 pasos, la cuantizacion a INT8 con rotacion Hadamard por grupos de 256 (ConvRot) y la preservacion del layout exacto del fichero de referencia de supermind. El resultado es un modelo de edicion imagen-a-imagen que funciona con solo 4 pasos de muestreo y CFG 1, sin necesidad de cargar un LoRA externo.

El modelo resuelve un problema practico de despliegue: ejecutar edicion de imagen de alta calidad con un coste computacional reducido (4 pasos frente a las decenas que requiere el modelo base) y con pesos INT8 que reducen el uso de VRAM, todo en un unico fichero compatible con el ecosistema ComfyUI mediante descriptores `.comfy_quant`. Esta pensado para flujos de trabajo de edicion de imagen en produccion donde la latencia y la memoria son restrictivas.

La relevancia actual radica en que combina dos tecnicas de compresion complementarias (destilacion few-step y cuantizacion INT8 post-entrenamiento) sobre un modelo de edicion de imagen de ultima generacion, manteniendo compatibilidad byte a byte con el layout de referencia y verificando la presencia del LoRA fusionado con una metrica de proyeccion de 0.9999.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Qwen-Image-Edit-2511), 60 bloques |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 tensorwise con ConvRot (Hadamard group-256), escalas F32 por fila |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, `diffusion-single-file`) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion de 60 bloques (identificados como `transformer_blocks.0` a `transformer_blocks.59`) con atencion conjunta imagen-texto, incluyendo proyecciones `add_q_proj`, `add_k_proj`, `add_v_proj` y `to_add_out` para el flujo de texto, y MLPs separados `img_mlp` y `txt_mlp`. Sobre el checkpoint base `qwen_image_edit_2511_bf16.safetensors` (revision `984166f6` de Comfy-Org) se fusiono el LoRA `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors` (revision `d74eba14`, rango 64, alpha 8) con fuerza 1.0 en 720 capas lineales, calculando `W' = W + (alpha/rank) · up @ down` en FP32.

Posteriormente, esas 720 lineales fusionadas se rotaron con una Hadamard ConvRot por grupos de 256 y se cuantizaron a INT8 con escalas absmax por fila, directamente desde el resultado de la fusion en FP32. El resto de tensores (2174) se copiaron bit a bit del fichero de referencia `supermind/int8_convrot_models`, incluyendo las lineales INT8 `img_mod` y `txt_mod`. Cada bloque lineal cuantizado incluye un tensor `.comfy_quant` con el descriptor `{"format": "int8_tensorwise", "convrot": true, "convrot_groupsize": 256}` y un `weight_scale` F32 por fila. La verificacion reporta que 3614 tensores coinciden en nombre, dtype, forma y offset con el fichero de supermind, y que la proyeccion del delta del LoRA es 0.9999 (715 de 720 capas dentro de 1 ± 0.1).

## Capacidades

- Edicion de imagen condicionada por instrucciones en lenguaje natural (image-to-image), preservando composicion y estilo cuando se solicita.
- Generacion de imagenes a partir de una imagen de entrada y un prompt de edicion (pipeline `image-to-image`).
- Muestreo few-step: 4 pasos con CFG 1.0, sin classifier-free guidance ni prompt negativo.
- Control de escena mediante prompts descriptivos (iluminacion, hora del dia, atmosfera) manteniendo la estructura de la imagen original.
- Compatibilidad con ComfyUI mediante descriptores `.comfy_quant` y layout de safetensors single-file.
- No se documentan capacidades de tool calling, agentes, audio o thinking mode en la informacion disponible.

## Casos de uso

- Edicion de iluminacion y atmosfera en postproduccion: cambiar dia a noche, anadir estrellas o luna manteniendo composicion y estilo, como demuestra el ejemplo de la ciudad flotante con seed 42 a 1024x1024 en 4 pasos.
- Iteracion rapida de conceptos en diseno grafico: al requerir solo 4 pasos y CFG 1, permite generar variantes de una imagen en segundos, adecuado para sesiones interactivas de exploracion visual.
- Previsualizacion en pipelines de render: integrar el modelo como paso de refinado o variacion sobre renders existentes sin reentrenar, gracias a su naturaleza image-to-image.
- Despliegue en hardware con VRAM limitada: los pesos INT8 reducen la huella de memoria frente al checkpoint bf16, permitiendo ejecutar edicion de imagen en GPUs de consumo con el layout compatible de ComfyUI.
- Automatizacion de variaciones de producto: aplicar cambios de escena o ambiente sobre fotografias de producto conservando el objeto, mediante prompts de edicion controlados.
- Prototipado de efectos visuales: generar versiones alternativas de un fotograma o ilustracion (clima, hora, iluminacion) para pruebas de direccion de arte antes de producir el asset final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 20.5 GB y los pesos estan en INT8, por lo que la huella en memoria es inferior a la del checkpoint bf16 equivalente, pero no se proporciona una cifra concreta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; la cuantizacion INT8 sugiere que puede caber en GPUs de gama alta de consumo, pero no se especifica.
- Opciones de despliegue: ComfyUI (layout `.comfy_quant` y single-file safetensors); el ejemplo se renderizo en Nox (noxengine.dev). No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion).
- Latencia y throughput: no disponibles; el muestreo se realiza en 4 pasos con sampler Euler, shift 3, CFG 1.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-Edit-2511-Lightning-4step-int8-convrot (este) | no disponible | no disponible | 4, CFG 1.0 | INT8 ConvRot | Apache 2.0 | HuggingFace (single-file) |
| Qwen/Qwen-Image-Edit-2511 (base) | no disponible | no disponible | no disponible (shift dependiente de resolucion) | bf16 | Apache 2.0 | HuggingFace |
| lightx2v/Qwen-Image-Edit-2511-Lightning (LoRA) | no disponible | no disponible | 4 (requiere cargar LoRA) | bf16 | Apache 2.0 | HuggingFace |
| supermind/int8_convrot_models (referencia INT8) | no disponible | no disponible | no disponible | INT8 ConvRot | no disponible | HuggingFace |

## Limitaciones y advertencias

- Modelo derivado de un unico autor con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de calidad fuera de las comprobaciones del propio autor.
- El muestreo esta fijado al punto de operacion Lightning: 4 pasos, CFG 1.0 y shift 3 fijo; desviarse de estos valores puede degradar la calidad y no esta documentado.
- Al usar CFG 1.0 no hay prompt negativo, lo que limita el control fino sobre lo que se quiere evitar en la edicion.
- La cuantizacion INT8 introduce error de redondeo; el autor documenta que en `transformer_blocks.58.txt_mlp.net.2` el delta del LoRA es pequeno frente a ese error (coseno inferior a 0.01), lo que indica ruido en la medicion por capa.
- Cuatro capas del bloque 59 (`attn.add_q_proj`, `attn.to_add_out`, `txt_mlp.net.0.proj`, `txt_mlp.net.2`) tienen `lora_up` a cero en el LoRA original, por lo que no incorporan el efecto de la destilacion; el flujo de texto del bloque final no se lee en inferencia.
- Riesgo de alucinacion visual y de deriva de contenido no cuantificado en la informacion disponible.
- Sesgos conocidos no documentados.
- Idiomas soportados no disponibles; el prompt de ejemplo esta en ingles.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones de los modelos base y del LoRA deben verificarse por separado.
- Compatibilidad limitada al ecosistema que interpreta los descriptores `.comfy_quant` (ComfyUI y Nox); otros runners pueden no reconocer el formato INT8 ConvRot.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Spectrallic/Qwen-Image-Edit-2511-Lightning-4step-int8-convrot
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repackaging ComfyUI del base: https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI
- LoRA de destilacion Lightning: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
- Codigo de Qwen-Image-Lightning: https://github.com/ModelTC/Qwen-Image-Lightning/
- Layout INT8 ConvRot de referencia: https://huggingface.co/supermind/int8_convrot_models
- Modelo hermano (Qwen-Image-2512 Lightning 4step int8 convrot): https://huggingface.co/Spectrallic/Qwen-Image-2512-Lightning-4step-int8-convrot
- Motor de render del ejemplo: https://noxengine.dev/
