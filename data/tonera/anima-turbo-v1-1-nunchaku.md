# tonera/Anima-Turbo-v1.1-Nunchaku

## Resumen

Anima-Turbo-v1.1-Nunchaku es una cuantización INT8 W8A8 del transformer de Anima-Turbo v1.1, un modelo de generación de imágenes texto-a-imagen de 2B parámetros orientado a anime e ilustración, desarrollado originalmente por CircleStone Labs y Comfy Org. Esta versión concreta la publica el usuario tonera y está pensada para inferencia con Nunchaku, un runtime de cuantización SVDQuant para modelos de difusión. El objetivo es reducir el uso de VRAM y acelerar la generación sin degradar de forma apreciable la calidad visual.

El checkpoint cuantiza 280 capas lineales del transformer a INT8 (pesos con signo y una escala por canal de salida, activaciones INT8 dinámicas por fila). El rango de la descomposición de bajo rango es 0, por lo que no hay rama de bajo rango: es una cuantización puramente W8A8. Los embeddings, las capas AdaLN y `proj_out` permanecen en BF16, igual que los codificadores de texto (Qwen3-0.6B) y el VAE (Qwen Image VAE).

La relevancia práctica es doble: por un lado, permite ejecutar un modelo de difusión de 2B en GPUs de consumo con menos memoria (unos 1,6 GiB menos tras la carga); por otro, ofrece una aceleración de entre 1,23× y 1,36× según la GPU, manteniendo la composición y el linework muy cercanos al modelo BF16 original. Está pensado para flujos de trabajo en ComfyUI mediante el plugin Vitoom Nunchaku o para uso programático con Diffusers y el wheel de Nunchaku.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para texto-a-imagen, variante Turbo destilada; cuantización SVDQuant W8A8 sobre el transformer |
| Parámetros totales | 1.956.405.248 (≈2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 W8A8 (pesos INT8 con escala por canal de salida, activaciones INT8 dinámicas por fila); embeddings, AdaLN y `proj_out` en BF16; codificadores de texto y VAE en BF16 |
| Idiomas soportados | No disponible (los prompts se procesan con Qwen3-0.6B; el modelo card no detalla cobertura lingüística) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (`svdq-int8_r0-Anima-Turbo-v1.1-Nunchaku.safetensors`), librería diffusers |
| Modelo base | circlestone-labs/Anima (Anima-Turbo v1.1) |
| Tamaño del repo | 7,8 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo subyacente es Anima, un text-to-image de 2B parámetros de CircleStone Labs y Comfy Org especializado en anime e ilustración. Anima-Turbo es la variante destilada, que permite generar con CFG 1 y entre 8 y 12 pasos en lugar de requerir más pasos y guidance. Esta ficha corresponde a la cuantización del transformer: 280 capas lineales se convierten a W8A8 mediante SVDQuant con rango 0 (sin rama de bajo rango), mientras que el resto de componentes del pipeline se mantienen en BF16. El codificador de texto es Qwen3-0.6B y el VAE es el de Qwen Image.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, la composición de datos ni si hubo RLHF o DPO. Tampoco se detalla la arquitectura interna exacta del DiT (número de bloques, dimensiones de atención, mecanismo de atención) más allá de que se trata de un transformer de difusión. La innovación técnica destacable de esta versión es la propia cuantización W8A8 con SVDQuant y su integración en Nunchaku, que empaqueta los pesos INT8 para el kernel en la carga y libera las copias desempaquetadas de la GPU.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024×1024 con CFG 1 y 8 pasos (configuración recomendada para la variante Turbo).
- Estilo orientado a anime e ilustración, con buena conservación de composición y linework respecto al modelo BF16.
- Ejecución acelerada mediante kernels INT8 de Nunchaku, con menor huella de VRAM que el transformer BF16.
- Integración en ComfyUI a través del plugin Vitoom Nunchaku (requiere ComfyUI 0.44 o superior con `--enable-manager`).
- Uso programático en Python con Diffusers (`AnimaModularPipeline`) y `NunchakuAnimaTransformer3DModel`.
- Control de guidance mediante `ClassifierFreeGuidance` en el objeto `guider` (no se pasa `guidance_scale` a `pipe(...)`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking: es un modelo exclusivamente de generación de imágenes.

## Casos de uso

- Generación de ilustraciones anime en producción: el modelo permite crear imágenes a 1024×1024 en torno a 1,3 s en una RTX 4090 y 0,93 s en una RTX 5090, adecuado para pipelines que necesitan throughput alto con calidad de ilustración.
- Despliegue en GPUs de consumo: con 3,64 GiB asignados tras la carga y 7,82 GiB de pico en inferencia, cabe en tarjetas de 12-16 GB junto con el codificador de texto y el VAE, lo que facilita estaciones de trabajo modestas.
- Prototipado rápido en ComfyUI: el plugin Vitoom Nunchaku y el workflow `anima_turbo.json` permiten montar un grafo texto-a-imagen en minutos, útil para iterar sobre prompts y estilos.
- Servicios de generación de avatares o fan-art: la especialización en anime e ilustración y los 8 pasos de inferencia lo hacen adecuado para APIs de generación de imágenes con latencia baja.
- Integración en aplicaciones Python: mediante Diffusers y el wheel de Nunchaku se puede incorporar la generación en backends propios, con control explícito del guider y de los componentes cargados.
- Reducción de costes en inferencia por lotes: el ahorro de 1,66 GiB en memoria tras la carga y la aceleración de 1,23×-1,36× permiten aumentar el número de instancias por GPU en entornos de serving.
- Pruebas de cuantización y evaluación de calidad: útil para investigadores que comparan salidas BF16 frente a W8A8 en tareas de ilustración y estudian el impacto de SVDQuant en modelos de difusión.

## Benchmarks y rendimiento

Datos de rendimiento publicados en la model card (1024×1024, CFG 1, 8 pasos, `bfloat16`, tiempo en régimen estable tras un warmup):

| GPU | BF16 | W8A8 | Aceleración |
|---|---|---|---|
| RTX 3090 | 3,329 s | 2,451 s | 1,36× |
| RTX 4090 | 1,644 s | 1,310 s | 1,25× |
| RTX 5090 | 1,145 s | 0,932 s | 1,23× |

Arranque en frío: 1,31× en RTX 3090, 1,22× en RTX 4090 y 1,17× en RTX 5090. La primera carga del archivo INT8 es algo más lenta porque se empaquetan 280 capas lineales antes de la inferencia.

Memoria (independiente de la GPU empleada en la prueba):

| Métrica | BF16 | W8A8 | Ahorro |
|---|---|---|---|
| Memoria asignada tras la carga | 5,30 GiB | 3,64 GiB | 1,66 GiB (31%) |
| Pico asignado durante inferencia | 9,44 GiB | 7,82 GiB | 1,63 GiB (17%) |

La memoria de proceso observada con `nvidia-smi` tras la carga baja aproximadamente 1,6 GiB (de unos 5,6-5,8 GiB a 4,0-4,3 GiB). El pico adicional de unos 4 GiB corresponde a activaciones, que se mantienen en BF16.

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 3,64 GiB asignados tras la carga y 7,82 GiB de pico en inferencia para el transformer W8A8; hay que sumar el codificador de texto Qwen3-0.6B y el VAE en BF16.
- GPU recomendadas: RTX 3090, RTX 4090 y RTX 5090 son las validadas en la model card. Cualquier GPU NVIDIA con soporte para los kernels de Nunchaku y suficiente VRAM debería funcionar, aunque no se documentan otras.
- GPU de consumo: sí, cabe en tarjetas de 12-16 GB de VRAM considerando el pipeline completo; en 8 GB el margen es ajustado por el pico de activaciones.
- Opciones de despliegue: ComfyUI con el plugin Vitoom Nunchaku (ComfyUI 0.44+ con `--enable-manager`) o Python con Diffusers (`AnimaModularPipeline`) y el wheel `nunchaku-1.4.0+cu13.0torch2.11-cp311-cp311-linux_x86_64.whl` de tonera/vitoom-nunchaku. El wheel está compilado para Python 3.11, CUDA 13.0, PyTorch 2.11 y Linux x86_64.
- Latencia y throughput: 2,451 s por imagen en RTX 3090, 1,310 s en RTX 4090 y 0,932 s en RTX 5090 (1024×1024, CFG 1, 8 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anima-Turbo-v1.1-Nunchaku (esta ficha) | ≈2B | 1024×1024 (resolución de referencia) | INT8 W8A8 (SVDQuant) | other | Hugging Face, ComfyUI, Python |
| circlestone-labs/Anima (BF16, upstream) | ≈2B | 1024×1024 (resolución de referencia) | BF16 | other | Hugging Face |
| Otras variantes de Anima-Turbo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de calidad ni de otros modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo upstream BF16 y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- El propio autor señala que Anima es débil con texto largo en las imágenes: en las muestras, tanto BF16 como W8A8 fallan al reproducir con exactitud el texto de un cartel.
- La cuantización introduce una pérdida de calidad potencial frente al BF16; el autor afirma que composición y linework se mantienen cercanos, pero no se publican métricas objetivas de calidad.
- Licencia "other": es necesario revisar los términos exactos del modelo base circlestone-labs/Anima antes de cualquier uso comercial; no se detallan restricciones en la información disponible.
- El uso requiere un wheel específico de Nunchaku (Python 3.11, CUDA 13.0, PyTorch 2.11, Linux x86_64) y una build de Diffusers con `AnimaModularPipeline`; otras plataformas dependen de los wheels listados en tonera/vitoom-nunchaku.
- En ComfyUI se requiere la versión 0.44 o superior arrancada con `--enable-manager`, además del plugin Vitoom Nunchaku.
- El primer arranque en frío es más lento por el empaquetado de las 280 capas lineales INT8.
- No se documentan sesgos conocidos, cobertura idiomática ni comportamiento fuera del dominio anime/ilustración.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir detalles inconsistentes, anatomía incorrecta o texto ilegible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tonera/Anima-Turbo-v1.1-Nunchaku
- Modelo base (upstream): https://huggingface.co/circlestone-labs/Anima
- Wheel de Nunchaku: https://huggingface.co/tonera/vitoom-nunchaku
- Plugin de ComfyUI: https://github.com/tonera/vitoom-nunchaku-comfy
- Diffusers (build con AnimaModularPipeline): https://github.com/huggingface/diffusers
