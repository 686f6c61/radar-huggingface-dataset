# Spectrallic/Qwen-Image-2512-Lightning-4step-int8-convrot

## Resumen

Qwen-Image-2512-Lightning-4step-int8-convrot es un checkpoint de difusion para generacion de imagenes a partir de texto (text-to-image), publicado por el usuario Spectrallic. No se trata de un modelo entrenado desde cero, sino de una derivacion cuantizada del transformer de Qwen-Image-2512 a la que se le ha fusionado la destilacion few-step Qwen-Image-2512-Lightning de lightx2v. El resultado es un unico fichero safetensors que genera imagenes en 4 pasos de muestreo con CFG 1.0, sin necesidad de cargar un LoRA adicional.

El interes practico esta en la combinacion de tres tecnicas en un solo artefacto: la destilacion few-step (que reduce drasticamente el numero de evaluaciones del modelo), la cuantizacion INT8 con rotacion Hadamard ConvRot por grupos de 256 (que reduce el peso del transformer) y un layout de tensores compatible byte a byte con la familia supermind/int8_convrot_models. Esto permite sustituir el fichero INT8 de referencia por este sin cambiar el grafo de inferencia, solo anadiendo el comportamiento de 4 pasos.

La relevancia es de nicho pero clara para quien despliega Qwen-Image en produccion: elimina el coste de cargar un LoRA en tiempo de ejecucion y reduce el numero de pasos de muestreo, manteniendo el formato de pesos que ya consumen los runners compatibles con ComfyUI. La licencia es Apache 2.0, igual que el modelo base y el LoRA de destilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Qwen-Image-2512) con LoRA Lightning fusionado y cuantizacion INT8 ConvRot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | INT8 tensorwise con rotacion ConvRot (group size 256) en 720 capas lineales; resto de tensores en el dtype original de supermind |
| Idiomas soportados | no disponible (los prompts se procesan mediante el text encoder de Qwen-Image, no incluido en este fichero) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusion-single-file), 20.5 GB de repo |
| Pasos de muestreo | 4 (punto de operacion Lightning) |
| CFG | 1.0 (sin classifier-free guidance, sin prompt negativo) |
| Shift de tiempo de flujo | 3 (fijo, en lugar del dependiente de resolucion del modelo base) |
| Sampler de referencia | Euler |
| Resolucion de ejemplo | 1024x1024 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2512 es un transformer de difusion para generacion de imagenes condicionada por texto. Sobre el se aplica el LoRA Qwen-Image-2512-Lightning-4steps-V1.0-bf16 (rank 64, alpha 8), una destilacion few-step que permite muestrear en 4 pasos con CFG 1.0. La fusion se realiza a strength 1.0 sobre 720 objetivos: `attn.{to_q,to_k,to_v,to_out.0}`, `attn.{add_q_proj,add_k_proj,add_v_proj,to_add_out}` y `{img_mlp,txt_mlp}.net.{0.proj,2}` en los 60 bloques del transformer. Cada merge calcula `W' = W + (alpha/rank) · up @ down` en FP32.

Tras la fusion, las 720 capas lineales resultantes se rotan con una Hadamard ConvRot de grupo 256 y se cuantizan a INT8 con escalas absmax por fila, calculadas directamente desde el resultado FP32 del merge. Las capas `img_mod` y `txt_mod` mantienen la cuantizacion original de supermind, y el resto de tensores (incluidos los 840 descriptores `.comfy_quant`) se copian bit a bit del fichero de referencia. No hay entrenamiento adicional ni RLHF en esta derivacion: es un proceso de merge mas cuantizacion.

El autor documenta verificaciones de integridad: los 3613 tensores coinciden en nombre, orden, dtype, forma y offset con el fichero INT8 de supermind; solo 1440 tensores difieren en bytes (las 720 pesos INT8 fusionados y sus 720 escalas). La proyeccion del delta del LoRA sobre el cambio respecto al base da 0.9998 global (frente a 0.0004 del fichero sin fusionar), con 712 de 720 capas dentro de 1 ± 0.1. Las ocho capas fuera de rango se explican por deltas nulos en el LoRA (bloque 59, cuyo flujo de texto no se lee) o por ruido de redondeo INT8 en deltas muy pequenos (coseno por debajo de 0.01).

## Capacidades

- Generacion de imagenes a partir de prompts de texto en 4 pasos de muestreo con CFG 1.0.
- Inferencia sin cargador de LoRA: la destilacion esta integrada en los pesos.
- Compatibilidad de layout con runners que consumen el formato supermind INT8 ConvRot (mismos nombres, orden, dtypes, formas y offsets).
- Muestreo con shift de flujo fijo de 3, independiente de la resolucion.
- Resolucion de trabajo documentada de 1024x1024 con sampler Euler y semilla fija.
- No incluye text encoder ni VAE: es un fichero de transformer de difusion, por lo que requiere los componentes complementarios del pipeline Qwen-Image.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de generacion de imagen.

## Casos de uso

- Generacion de ilustracion conceptual en pipelines creativos: con 4 pasos y CFG 1.0 se pueden producir borradores de 1024x1024 en pocas evaluaciones del transformer, lo que abarata la iteracion sobre variantes de prompt antes de un render final de mayor calidad.
- Prototipado rapido de assets para videojuegos o diseno grafico: el checkpoint se carga como un unico safetensors compatible con el layout supermind, por lo que puede sustituir al fichero INT8 de referencia en un grafo ComfyUI existente sin reescribir el pipeline.
- Despliegue en entornos con VRAM limitada: la cuantizacion INT8 de las 720 capas lineales reduce el peso del transformer respecto al bf16, lo que permite servir el modelo en GPUs de gama alta de consumo para resoluciones moderadas.
- Generacion por lotes en servidores de inferencia: al no requerir cargar un LoRA aparte y usar 4 pasos fijos, el coste por imagen y la gestion de memoria son mas predecibles en colas de trabajo por lotes.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia para medir el impacto de ConvRot INT8 frente al bf16 en tareas text-to-image, dado que el autor documenta la equivalencia byte a byte con el fichero de supermind.
- Integracion en herramientas de autoria que ya hablan el formato supermind: cualquier runner que lea `.comfy_quant` con `int8_tensorwise` y `convrot_groupsize: 256` puede consumir este fichero como reemplazo directo, anadiendo el comportamiento few-step sin cambios de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta verificaciones de integridad tensorial (coincidencia de 3613 tensores con el fichero de referencia, proyeccion del delta del LoRA de 0.9998 y desviaciones por capa), no metricas de calidad de imagen como FID, CLIP score o comparativas perceptuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repo pesa 20.5 GB en INT8; a ello hay que sumar los componentes del pipeline Qwen-Image (text encoder y VAE) y los buffers de activaciones, por lo que el consumo real supera el tamano del fichero.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del checkpoint, un despliegue comodo requiere GPUs de datacenter (A100, H100) o GPUs de consumo con 24 GB o mas, aunque el autor no confirma ninguna.
- Cabe en consumer GPU: no confirmado. La cuantizacion INT8 reduce el peso del transformer, pero no hay datos publicados de VRAM pico medida.
- Opciones de despliegue: runners compatibles con el formato supermind INT8 ConvRot y con `diffusion-single-file`; el autor menciona Nox (noxengine.dev) como motor de render del ejemplo y el repositorio ModelTC/Qwen-Image-Lightning como guia de uso. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles. El unico dato operativo es que el muestreo requiere 4 pasos con CFG 1.0, lo que reduce el numero de evaluaciones del transformer frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spectrallic/Qwen-Image-2512-Lightning-4step-int8-convrot | no disponible | no aplica | 4 (CFG 1.0) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| supermind/int8_convrot_models (qwen_image_2512_int8_convrot) | no disponible | no aplica | los del modelo base (sin destilacion) | no disponible en la informacion | HuggingFace |
| lightx2v/Qwen-Image-2512-Lightning | no disponible | no aplica | 4 (LoRA separado) | no disponible en la informacion | HuggingFace |
| Qwen/Qwen-Image-2512 (base bf16) | no disponible | no aplica | shift dependiente de resolucion | Apache 2.0 | HuggingFace |

La diferencia clave frente a supermind es que este checkpoint lleva la destilacion integrada y no necesita cargador de LoRA; frente a lightx2v, evita el paso de fusion en tiempo de ejecucion; frente al base bf16, reduce el peso a INT8 y baja a 4 pasos. No hay datos publicados de calidad comparada entre las cuatro variantes.

## Limitaciones y advertencias

- Modelo derivado y de nicho: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de calidad.
- No incluye text encoder ni VAE; requiere los componentes complementarios del pipeline Qwen-Image, lo que anade complejidad de despliegue.
- La cuantizacion INT8 introduce error de redondeo: el propio autor documenta cuatro capas con lecturas ruidosas por deltas de LoRA pequenos frente al error de cuantizacion (coseno por debajo de 0.01).
- El bloque 59 tiene cuatro capas con `lora_up` a cero en el LoRA original; su flujo de texto no se lee, por lo que no hay nada que fusionar alli y el comportamiento es el del fichero de referencia.
- Las escalas de las 720 capas fusionadas usan absmax por fila, mientras que supermind uso MSE clipping; las capas no fusionadas conservan la eleccion de supermind, lo que genera una mezcla de criterios de escala en el mismo fichero.
- Punto de operacion rigido: 4 pasos, CFG 1.0 y shift 3. Salirse de ese regimen (mas pasos, CFG mayor, shift distinto) no esta validado por el autor.
- Sin prompt negativo efectivo por CFG 1.0, lo que limita el control fino sobre lo que se quiere evitar en la imagen.
- No hay benchmarks de calidad de imagen publicados, ni datos de sesgos, alucinacion visual o rendimiento multilingue del text encoder.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los componentes base (Qwen-Image-2512, LoRA Lightning y layout supermind) y conservar los ficheros LICENSE y NOTICE.
- El modelo es de noviembre de 2026 segun los metadatos del repo; la informacion disponible no permite contrastar su vigencia frente a alternativas posteriores.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Spectrallic/Qwen-Image-2512-Lightning-4step-int8-convrot
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2512
- Repackaging ComfyUI del base: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- LoRA de destilacion: https://huggingface.co/lightx2v/Qwen-Image-2512-Lightning
- Codigo de la destilacion: https://github.com/ModelTC/Qwen-Image-Lightning/
- Layout INT8 ConvRot de referencia: https://huggingface.co/supermind/int8_convrot_models
- Motor de render del ejemplo: https://noxengine.dev/
- Imagen de ejemplo: https://huggingface.co/Spectrallic/Qwen-Image-2512-Lightning-4step-int8-convrot/resolve/main/samples/floating_city_1024x1024_seed42.png
