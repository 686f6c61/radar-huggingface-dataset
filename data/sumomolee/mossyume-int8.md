# SumomoLee/MossYume-int8

## Resumen

MossYume-int8 es una cuantizacion no oficial en int8 del modelo de difusion de `duongve/MossYume`, que a su vez es un fine-tune de `OpenMOSS-Team/MOSS-Image-Base`. Lo publica el usuario SumomoLee (KohakuBlueleaf) y su unico proposito es reducir el peso de los pesos para su uso en ComfyUI: pasa de 10,16 GB en bf16 a 5,41 GB en int8, manteniendo el resto de tensores en bf16 sin alteracion. Es, por tanto, un artefacto de reempaquetado, no un modelo nuevo.

El modelo subyacente es un modelo de difusion texto-a-imagen con 42 bloques transformer, pensado para generacion de imagenes en resoluciones nativas de 1024 a 2048 pixeles. La cuantizacion emplea la tecnica ConvRot (rotacion Hadamard por bloques de 256 dimensiones antes de cuantizar a int8 con una escala simetrica fp32 por fila de salida), el mismo esquema que los ficheros `moss_image_*_int8_convrot.safetensors` de Comfy-Org.

La relevancia de esta ficha es acotada: el repositorio no incluye text encoder ni VAE, no aporta benchmarks de calidad de imagen y no ha sido probado en ComfyUI. Su valor esta en la verificacion numerica del error de cuantizacion (0,85-0,98 % de error de Frobenius relativo en los 168 tensores cuantizados), que permite decidir si merece la pena usarlo frente al original en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (42 bloques) para texto-a-imagen; derivado de MOSS-Image-Base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de texto) |
| Tipos de cuantizacion | int8 tensorwise con ConvRot (grupo 256) en pesos de atencion y FFN; resto en bf16; `rope.bands` en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero unico para ComfyUI, `MossYume_v01_int8_convrot.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusion con 42 bloques, cada uno con proyecciones `qkv`, `o`, `ffn_up_gate` y `ffn_down`. Esta cuantizacion afecta exactamente a esas cuatro proyecciones en los 42 bloques (168 tensores), que se almacenan como `weight` (int8), `weight_scale` (fp32 de forma [N,1]) y un tensor de metadatos `comfy_quant` con `{"format": "int8_tensorwise", "convrot": true, "convrot_groupsize": 256}`. Permanecen en bf16, bit a bit identicos al original: el refinador de texto, los embedders de tiempo y video, la modulacion, las ganancias de normalizacion y la capa lineal final. Cada bloque incluye ademas un tensor de pistas `comfy_attention.config`.

El metodo ConvRot rota la dimension de entrada de cada peso en bloques de 256 mediante una matriz de Hadamard regular normalizada (`W R`), lo que dispersa los valores atipicos dentro de cada bloque antes de cuantizar a int8 con una escala simetrica fp32 por fila de salida (`max|row| / 127`). La exportacion se hizo en CPU y sin datos de calibracion, con el script `scripts/export/comfy_int8.py` de KohakuMossTrainer (commit `78416a2`, funcionalidad anadida en `851e246`). No hay informacion sobre el entrenamiento del modelo base en la documentacion proporcionada: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline `text-to-image`), en resoluciones nativas de 1024 a 2048 pixeles.
- Integracion en ComfyUI mediante el loader de modelos de difusion en formato int8 ConvRot (compatible con el esquema de los ficheros `moss_image_*_int8_convrot.safetensors` de Comfy-Org).
- Carga en KohakuMoss, que lee el mismo formato.
- Sampling recomendado por el autor original: CFG 3-5, 30 pasos, sampler `er_sde`, scheduler `simple`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: es exclusivamente un modelo de difusion texto-a-imagen.
- Capacidades multilingues: no disponibles (el text encoder es Qwen3.5-9B, pero no se documenta el soporte idiomatico del pipeline completo).

## Casos de uso

- Despliegue en ComfyUI con VRAM limitada: al reducir el fichero de difusion de 10,16 GB a 5,41 GB, permite cargar el modelo en GPUs donde la version bf16 no cabe junto con el text encoder Qwen3.5-9B y el VAE Flux.2.
- Prototipado rapido de pipelines texto-a-imagen: la perdida de fidelidad numerica es muy baja (coseno de velocidad de 0,99993 a sigma 0,9), por lo que sirve para validar prompts, resoluciones y schedulers antes de invertir en el modelo completo.
- Generacion de imagenes a 1024-2048 px en entornos de produccion con requisitos de memoria ajustados, usando el sampler y scheduler recomendados por el autor.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta el error de Frobenius por capa, lo que lo convierte en una referencia util para medir el impacto de ConvRot int8 en modelos de difusion.
- Sustitucion directa en flujos de trabajo existentes de Comfy-Org MOSS-Image: al respetar el layout de los ficheros oficiales int8 ConvRot, se puede intercambiar el fichero sin reescribir el grafo.
- Investigacion sobre outliers en modelos de difusion: la model card aporta estadisticas del flujo residual (valor maximo 67.072, RMS medio por bloque 98,65 frente a 98,79 del original, cuota de energia top-32 de 0,919 en ambos) utiles para estudiar la distribucion de activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen en la informacion disponible. La model card solo aporta verificaciones de acuerdo numerico entre la version int8 y el original bf16:

| Metrica | Resultado |
|---|---|
| Error de Frobenius relativo (168 capas) | 0,85 % - 0,98 % (mediana 0,86 %) |
| Error en proyecciones `o` | 0,86 % - 0,98 % (peor capa: `layers.41.proj.o`, 0,98 %) |
| Error en `qkv` | 0,85 % |
| Error en `ffn_up_gate` | 0,85 % |
| Error en `ffn_down` | 0,90 % - 0,91 % |
| Error maximo por elemento | 1,4e-2 (proyecciones `o`) |
| Coseno de velocidad (sigma 0,9 / 0,5 / 0,1) | 0,99993 / 0,99933 / 0,99915 |
| L2 relativo (sigma 0,9 / 0,5 / 0,1) | 1,2 % / 3,7 % / 4,1 % |
| Valor maximo del flujo residual | 67.072 (int8) vs 67.072 (original) |
| RMS medio por bloque | 98,65 (int8) vs 98,79 (original) |
| Cuota de energia top-32 canales | 0,919 (int8) vs 0,919 (original) |

No se probaron: calidad de imagen (no se genero ninguna imagen), latentes de imagen reales, mas de un prompt, kernels GEMM int8 (la prueba descuantiza a bf16) ni la carga de este fichero concreto en ComfyUI.

## Requisitos de hardware

- VRAM estimada para el fichero de difusion: aproximadamente 5,4 GB en int8 (frente a 10,2 GB del bf16). Hay que sumar el text encoder Qwen3.5-9B en bf16 y el VAE Flux.2, que no estan incluidos en este repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el fichero de difusion int8 es compatible con GPUs consumer de 12-16 GB o superiores, siempre que el text encoder y el VAE quepan en la misma GPU o se descarguen a CPU.
- Cabe en GPU consumer: si, el fichero de difusion por si solo; el pipeline completo depende del text encoder de 9B.
- Opciones de despliegue: ComfyUI (loader compatible con int8 ConvRot) y KohakuMoss. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de difusion de este formato).
- Latencia y throughput: no disponibles. La model card no incluye mediciones de velocidad de inferencia ni de generacion de imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MossYume-int8 (este) | no disponible | no aplica | safetensors int8 ConvRot, 5,41 GB | Apache-2.0 | Hugging Face (SumomoLee) |
| duongve/MossYume (bf16) | no disponible | no aplica | safetensors bf16, 10,16 GB | Apache-2.0 | Hugging Face (duongve) |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | no aplica | no disponible | no disponible | Hugging Face (OpenMOSS-Team) |
| KBlueLeaf/MOSS-Image-heal | no disponible | no aplica | no disponible | no disponible | Hugging Face (KBlueLeaf) |

Los tres modelos comparados son variantes del mismo linaje (MossYume es un fine-tune de MOSS-Image-Base; MOSS-Image-heal es una version con el flujo residual corregido). No se dispone de datos de rendimiento ni de benchmarks de calidad que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La cuantizacion no ha sido validada en calidad de imagen: no se genero ninguna imagen durante la verificacion, solo se comprobo el acuerdo numerico en un unico latente aleatorio de 256x256 y un unico prompt.
- No se ha probado la carga de este fichero exacto en ComfyUI ni el rendimiento de kernels GEMM int8 reales; la comprobacion descuantiza a bf16 en CPU.
- El repositorio no incluye text encoder ni VAE: hay que descargarlos por separado desde `duongve/MossYume` (`text_encoders/qwen3.5_9b_bf16.safetensors` y `vae/flux2-vae.safetensors`).
- El modelo base MossYume no esta "stream-healed": presenta valores maximos del flujo residual de 67.072 frente a 58.112 de MOSS-Image-Base y 3.104 de MOSS-Image-heal, con el canal 1356 dominando todos los bloques. Esta cuantizacion no corrige ese problema.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de difusion, el riesgo se traduce en artefactos visuales y sesgos en las imagenes generadas, no evaluados aqui.
- Licencia Apache-2.0 heredada del modelo original, que permite uso comercial; sin embargo, el autor de la cuantizacion no ofrece garantias y la responsabilidad sobre el modelo base recae en `duongve`.
- Al ser una cuantizacion no oficial, no hay soporte ni mantenimiento garantizado por parte del autor original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SumomoLee/MossYume-int8
- Modelo base: https://huggingface.co/duongve/MossYume
- Modelo original de MOSS-Image: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Version con flujo residual corregido: https://huggingface.co/KBlueLeaf/MOSS-Image-heal
- Herramienta de exportacion: https://github.com/KohakuBlueleaf/KohakuMossTrainer
