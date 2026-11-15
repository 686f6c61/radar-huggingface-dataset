# SUSSYEATING/BAGEL-7B-MoT-ConvRot

## Resumen

BAGEL-7B-MoT ConvRot es una familia de checkpoints cuantizados del modelo multimodal ByteDance-Seed/BAGEL-7B-MoT, publicada por el usuario SUSSYEATING. El objetivo es reducir el consumo de VRAM del modelo original en BF16 (31,32 GB en pico de inferencia) hasta 17,17–18,19 GB, de forma que quepa en una única GPU de 24 GB. Para ello se aplica ConvRot, una tecnica que combina rotacion de Hadamard por bloques con cuantizacion simetrica fila a fila, y se empaquetan los pesos en ficheros unicos compatibles con ComfyUI.

El modelo base es un transformer de 7B parametros con arquitectura Mixture-of-Transformers (MoT), disenado para tareas any-to-any: generacion de imagen a partir de texto, edicion de imagen, comprension de imagen y generacion guiada por modo de razonamiento (`<think>`). Esta publicacion no modifica la arquitectura ni el entrenamiento, solo el formato numerico de los pesos, e incluye ademas el nodo personalizado ComfyUI-BAGEL parcheado y un script de desempaquetado para las variantes INT6 con pesos empaquetados a nivel de bit.

La relevancia practica es que permite ejecutar un modelo multimodal de 7B con calidad cercana a BF16 en hardware de consumo (RTX 4090 y similares), con tiempos de inferencia incluso inferiores al baseline BF16 en las pruebas publicadas. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) multimodal, modelo base ByteDance-Seed/BAGEL-7B-MoT |
| Parametros totales | 7B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (392/392 capas), W6/W8 Hybrid ConvRot (288 INT6 + 104 INT8), W6A8 INT6 ConvRot (392/392 en rango [-31, 31]); variantes empaquetadas a nivel de bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI); variantes `*-packed.safetensors` requieren desempaquetado con `scripts/unpack_int6.py` |

## Arquitectura y entrenamiento

El modelo subyacente es BAGEL-7B-MoT de ByteDance-Seed, un transformer multimodal con arquitectura Mixture-of-Transformers que unifica generacion y comprension de imagen y texto en un unico modelo. Esta publicacion no aporta informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si hubo RLHF o DPO; esos datos corresponden al modelo base y no se detallan en la model card de la cuantizacion.

La innovacion tecnica de esta ficha es el esquema de cuantizacion ConvRot: rotacion de Hadamard por bloques seguida de cuantizacion simetrica fila a fila. Se ofrecen tres configuraciones. La variante INT8 ConvRot cuantiza las 392 capas a INT8 y es la recomendada por el autor por su fidelidad al BF16. La variante W6/W8 Hybrid mantiene en INT8 las capas `layers.0`, `layers.1`, `layers.26`, `layers.27` y todas las `o_proj` (104 capas), y cuantiza las 288 restantes a INT6. La variante W6A8 INT6 aplica INT6 a las 392 capas con rango restringido a [-31, 31]. Los pesos INT6 se almacenan dentro de tensores `torch.int8` estandar para que carguen sin kernels CUDA personalizados; las versiones empaquetadas reducen el tamano de descarga empaquetando cuatro valores de 6 bits en tres bytes `uint8`.

## Capacidades

- Generacion de texto a imagen (text-to-image) con resoluciones de trabajo de 1024x1024 en las pruebas publicadas.
- Generacion de imagen guiada por cadena de razonamiento mediante el modo `<think>`, que produce tokens de razonamiento autorregresivos antes de la difusion.
- Edicion de imagen a partir de una imagen de entrada y una instruccion textual.
- Comprension de imagen (image understanding) con respuesta en texto.
- Pipeline any-to-any: entrada y salida pueden combinar texto e imagen.
- Integracion directa con ComfyUI mediante el nodo personalizado ComfyUI-BAGEL incluido en el repositorio.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes multi-paso, audio ni capacidades multilingues explicitas.

## Casos de uso

- Generacion de ilustraciones en flujos ComfyUI: el checkpoint INT8 ConvRot se carga como fichero unico en el nodo ComfyUI-BAGEL y permite generar imagenes de 1024x1024 en unos 25–28 s en una GPU de 24 GB, con calidad cercana a BF16 (SSIM 0,89–0,93 y PSNR 24 dB en las pruebas del autor).
- Edicion fotografica asistida por instrucciones: la variante INT8 ConvRot obtiene SSIM 0,95865 y PSNR 32,08 dB frente al BF16 en la tarea de edicion publicada, lo que la hace adecuada para retoques iterativos donde la fidelidad estructural importa.
- Prototipado e investigacion en vision-lenguaje: al caber en una RTX 4090, permite experimentar con un modelo any-to-any de 7B sin acceso a GPUs de 80 GB.
- Generacion guiada por razonamiento: el modo `<think>` permite tareas donde conviene que el modelo planifique antes de dibujar; el autor advierte que en este modo solo INT8 ConvRot mantiene la coherencia compositiva del BF16.
- Despliegue en estaciones de trabajo con una sola GPU: reduce el pico de VRAM de 31,32 GB a 17,17–18,19 GB, lo que habilita entornos de 24 GB que no podrian ejecutar el BF16.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye scripts (`scripts/eval_bagel_g4.py`), metricas archivadas (`metrics/`) y comparativas visuales que sirven como base reproducible para estudiar el impacto de INT8/INT6 en modelos multimodales.
- Distribucion con ancho de banda limitado: las variantes `*-packed.safetensors` reducen el fichero INT6 de 16,18 GB a 12,91 GB, utiles para descargas sobre conexiones lentas antes de desempaquetar en local.

## Benchmarks y rendimiento

Las metricas publicadas comparan cada checkpoint cuantizado contra el BF16 original en una GPU G4 con ComfyUI v0.45.0 (1024x1024, 50 pasos, `cfg_text_scale=4.0`, `timestep_shift=3.0`). Las columnas de calidad muestran similitud coseno, SSIM y PSNR frente a la salida BF16.

| Variante | VRAM pico (T2I / Edit) | t2i_cabin_s42 (tiempo / cos / SSIM / PSNR) | t2i_watch_s1337 (tiempo / cos / SSIM / PSNR) | t2i_think_s42 (tiempo / cos / SSIM / PSNR) | edit_cabin_winter_s42 (tiempo / cos / SSIM / PSNR) | understand_cabin (tiempo) |
|---|---|---|---|---|---|---|
| BF16 baseline | 30,30 / 31,32 GB | 36,38 s / ref | 31,43 s / ref | 34,55 s / ref | 40,32 s / ref | 1,58 s |
| INT8 ConvRot (392/392) | 17,17 / 18,19 GB | 27,75 s / 0,97786 / 0,89359 / 24,42 dB | 25,78 s / 0,98396 / 0,92897 / 24,13 dB | 33,92 s / 0,52064 / 0,49434 / 9,72 dB | 33,79 s / 0,99582 / 0,95865 / 32,08 dB | 1,53 s |
| W6/W8 Hybrid ConvRot | 17,18 / 18,19 GB | 28,20 s / 0,95340 / 0,80723 / 21,93 dB | 25,77 s / 0,96230 / 0,87035 / 20,82 dB | 34,13 s / 0,51049 / 0,48816 / 9,59 dB | 33,78 s / 0,99503 / 0,95232 / 31,08 dB | 1,85 s |
| W6A8 INT6 ConvRot (392/392) | 17,18 / 18,19 GB | 28,16 s / 0,95483 / 0,81805 / 22,08 dB | 25,77 s / 0,93379 / 0,83128 / 18,12 dB | 35,90 s / 0,54385 / 0,49905 / 10,03 dB | 33,77 s / 0,99477 / 0,95100 / 30,62 dB | 1,85 s |

No se han publicado resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 17,17 GB en pico para text-to-image y 18,19 GB en pico para edicion con las tres variantes cuantizadas; el BF16 requiere 30,30 GB y 31,32 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 24 GB de VRAM, como RTX 4090, RTX 3090, A10G, L4 (24 GB) o superiores (A100, H100) si se busca mayor throughput.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con 24 GB; no cabe en GPUs de 16 GB o menos segun los picos medidos.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-BAGEL incluido (ruta oficial documentada); las variantes `*-packed.safetensors` requieren ejecutar antes `scripts/unpack_int6.py`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos checkpoints.
- Latencia y throughput medidos (GPU G4, ComfyUI v0.45.0): text-to-image 25,77–28,20 s; edicion 33,77–33,79 s; comprension de imagen 1,53–1,85 s. Las variantes cuantizadas resultan mas rapidas que el BF16 en text-to-image (27,75 s frente a 36,38 s en `t2i_cabin_s42`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM pico (T2I) | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| BAGEL-7B-MoT ConvRot INT8 (esta ficha) | 7B | no disponible | 17,17 GB | Apache 2.0 | safetensors single-file, ComfyUI |
| ByteDance-Seed/BAGEL-7B-MoT (BF16) | 7B | no disponible | 30,30 GB | Apache 2.0 (modelo base) | safetensors, ComfyUI |
| BAGEL-7B-MoT ConvRot W6/W8 Hybrid (esta ficha) | 7B | no disponible | 17,18 GB | Apache 2.0 | safetensors single-file, ComfyUI |
| BAGEL-7B-MoT ConvRot W6A8 INT6 (esta ficha) | 7B | no disponible | 17,18 GB | Apache 2.0 | safetensors single-file, ComfyUI |

No se dispone de datos de otros modelos any-to-any comparables en la informacion proporcionada; la comparativa se limita a las variantes del propio BAGEL-7B-MoT.

## Limitaciones y advertencias

- El modo `<think>` degrada notablemente la fidelidad respecto al BF16 en todas las variantes cuantizadas: similitud coseno de 0,51–0,54, SSIM de 0,49–0,50 y PSNR de 9,59–10,03 dB. El autor desaconseja las variantes INT6 para produccion con modo de razonamiento.
- La variante W6A8 INT6 mostro artefactos de composicion bajo `<think>` (por ejemplo, una cabeza de robot flotante adicional); la variante hibrida W6/W8 los elimina en parte, pero aun puede fusionar objetos incorrectamente.
- La calidad en edicion de imagen es alta (SSIM 0,95–0,96), pero la similitud coseno en text-to-image sin razonamiento baja a 0,93–0,98 segun variante; no es una replica exacta del BF16.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni idiomas soportados para esta publicacion; deben consultarse en la model card del modelo base ByteDance-Seed/BAGEL-7B-MoT.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar las condiciones del modelo original antes de uso comercial, ya que esta ficha no las detalla.
- Los checkpoints estan pensados para ComfyUI; no se garantiza su funcionamiento en otros runners sin adaptaciones.
- Las variantes `*-packed.safetensors` no cargan directamente: es obligatorio desempaquetarlas con `scripts/unpack_int6.py` antes de usarlas.
- El repositorio ocupa 75,0 GB en total por incluir todas las variantes, el nodo ComfyUI y los artefactos de evaluacion; la descarga completa no es necesaria para usar una sola variante.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un usuario individual, no el equipo de ByteDance; no hay validacion independiente de las metricas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SUSSYEATING/BAGEL-7B-MoT-ConvRot
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Nodo ComfyUI-BAGEL incluido en el repositorio: carpeta `ComfyUI-BAGEL/` y archivo `ComfyUI-BAGEL-a1a19a40e619.tar.gz`
- Script de desempaquetado INT6: `scripts/unpack_int6.py`
- Script de evaluacion: `scripts/eval_bagel_g4.py`
- Metricas archivadas: carpeta `metrics/` del repositorio
- Comparativas visuales: carpeta `comparisons/` del repositorio
