# SumomoLee/MOSS-Image-Base-Heal-INT8-ConvRot

## Resumen

MOSS-Image-Base-Heal-INT8-ConvRot es una cuantización no oficial en int8 del modelo de difusión SumomoLee/MOSS-Image-Base-Heal, que a su vez es un fine-tune completo del modelo base OpenMOSS-Team/MOSS-Image-Base. El repositorio lo publica el usuario SumomoLee y su único propósito es recodificar los pesos del modelo original en un formato int8 compatible con ComfyUI, reduciendo el tamaño del fichero de aproximadamente 10,16 GB en bf16 a 5,41 GB en int8. No se trata de un modelo nuevo ni de un reentrenamiento: es una transformación de pesos sin datos de calibración.

La relevancia de esta publicación es práctica: permite ejecutar el modelo de difusión MOSS-Image con menor huella de memoria y en el ecosistema ComfyUI, usando el mismo esquema de cuantización int8 con rotación ConvRot que emplean los ficheros oficiales de Comfy-Org para MOSS-Image. El modelo subyacente es un modelo de difusión texto-a-imagen; el repositorio solo contiene el componente de difusión, no el codificador de texto ni el VAE.

La información disponible es limitada: el autor no publica resultados de calidad de imagen, no se han ejecutado pases forward ni pruebas de carga en ComfyUI, y la validación se limita a comparar los pesos cuantizados con los originales. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (transformer de difusión; detalles de arquitectura interna no disponibles) |
| Parametros totales | no disponible (el fichero int8 ocupa 5.413.698.934 bytes; el bf16 de origen 10.164.655.808 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 tensorwise con rotación ConvRot (grupo 256) en 168 tensores; resto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero único para ComfyUI, 757 tensores) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: recodifica los pesos de SumomoLee/MOSS-Image-Base-Heal, un fine-tune completo ("stream-healed") del modelo de difusión OpenMOSS-Team/MOSS-Image-Base. La cuantización se realizó con el script `scripts/export/comfy_int8.py` del proyecto KohakuMossTrainer, en CPU y sin datos de calibración, con los parámetros `DEVICE=cpu`, `GROUP=256` y `SAVE_DTYPE=bf16`.

El método ConvRot rota la dimensión de entrada de cada peso en bloques de 256 mediante una matriz de Hadamard regular normalizada, lo que dispersa los valores atípicos dentro de cada bloque, y después cuantiza a int8 con una escala fp32 simétrica por fila de salida (`max|row| / 127`). Se cuantizan 168 tensores correspondientes a `layers.N.proj.{qkv,o,ffn_up_gate,ffn_down}.weight` de los 42 bloques, almacenados como `weight` (int8), `weight_scale` (fp32 [N,1]) y un tensor `comfy_quant` con los metadatos del formato. El resto de componentes (refiner de texto, embedders de tiempo y vídeo, modulación, gains de normalización, capa lineal final) permanece en bf16 y es bit-idéntico al original; `rope.bands` se mantiene en fp32. Cada bloque incluye además un tensor de configuración `comfy_attention.config`.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image), como componente de difusión dentro de un pipeline que requiere codificador de texto y VAE externos.
- Integración con ComfyUI mediante el cargador de modelos de difusión en formato int8 ConvRot.
- Compatibilidad con el formato de los ficheros oficiales `moss_image_*_int8_convrot.safetensors` de Comfy-Org.
- Lectura del formato por parte de KohakuMossTrainer, según indica el autor.
- No incluye codificador de texto (Qwen3.5-9B) ni VAE (Flux.2 VAE); deben obtenerse del release de Comfy-Org de MOSS-Image.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad adicional.

## Casos de uso

- Despliegue de generación texto-a-imagen en ComfyUI con menor uso de VRAM: el fichero int8 de 5,41 GB sustituye al bf16 de 10,16 GB, lo que facilita cargar el modelo de difusión en GPUs con memoria ajustada dentro de un pipeline ComfyUI.
- Pruebas de pipelines de inferencia en entornos con memoria limitada: útil para validar flujos de trabajo antes de pasar a los pesos bf16 completos, teniendo en cuenta que el autor no ha verificado la calidad de imagen resultante.
- Investigación sobre cuantización post-entrenamiento: el repositorio documenta el método ConvRot con grupo 256 y los errores relativos de Frobenius por capa (0,85 %–0,98 %), lo que sirve como referencia para estudiar el impacto de la rotación de Hadamard en la cuantización de modelos de difusión.
- Sustitución directa de los ficheros int8 oficiales de Comfy-Org en flujos existentes: al compartir formato y layout (757 tensores), puede colocarse en `models/diffusion_models/` y cargarse con un build de ComfyUI que lea este formato.
- Evaluación comparativa de pesos: los tensores no cuantizados son bit-idénticos al original, lo que permite aislar el efecto de la cuantización int8 en experimentos controlados.
- Distribución de un modelo de difusión en entornos con ancho de banda restringido: el fichero pesa aproximadamente la mitad que el bf16 de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de acuerdo a nivel de pesos:

| Metrica | Valor |
|---|---|
| Error relativo de Frobenius (168 capas cuantizadas) | 0,85 % – 0,98 % (mediana 0,86 %) |
| Error en `qkv` | 0,85 % |
| Error en `ffn_up_gate` | 0,85 % |
| Error en `ffn_down` | 0,90 % – 0,91 % |
| Error en `o` | 0,86 % – 0,98 % |
| Peor capa | `layers.41.proj.o` (0,98 %) |
| Mayor error en un elemento | 1,2e-2 (`o`) |
| Valores no finitos | ninguno |
| Tensores no cuantizados (211) | bit-idénticos al original |

No se probaron la calidad de imagen, ningún pase forward, kernels GEMM int8 ni la carga de este fichero concreto en ComfyUI.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos int8 ocupa 5,41 GB, frente a 10,16 GB del bf16, por lo que la huella del modelo de difusión se reduce aproximadamente a la mitad (hay que sumar codificador de texto y VAE).
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado por el autor; el tamaño de pesos int8 (5,41 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no se ha verificado.
- Opciones de despliegue: ComfyUI (con un build/cargador que lea el formato int8 ConvRot) y KohakuMossTrainer.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SumomoLee/MOSS-Image-Base-Heal-INT8-ConvRot | no disponible (5,41 GB int8) | no disponible | safetensors int8 ConvRot (ComfyUI) | Apache-2.0 | Cuantización int8 sin calibración; calidad de imagen no verificada |
| SumomoLee/MOSS-Image-Base-Heal | no disponible (10,16 GB bf16) | no disponible | safetensors bf16 | Apache-2.0 | Modelo de origen, fine-tune completo |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva el fine-tune |
| Ficheros oficiales `moss_image_*_int8_convrot.safetensors` (Comfy-Org) | no disponible | no disponible | safetensors int8 ConvRot | no disponible | Mismo formato y layout que este repositorio |

## Limitaciones y advertencias

- Cuantización no oficial: no la publica el autor del modelo original ni Comfy-Org, sino un tercero (SumomoLee).
- Sin calibración: la cuantización se hizo sin datos de calibración, solo con rotación ConvRot y escala por fila.
- Calidad de imagen no verificada: el autor no generó ninguna imagen ni ejecutó un pase forward; la validación es exclusivamente a nivel de pesos.
- Carga en ComfyUI no probada: no se ha verificado que este fichero concreto se cargue correctamente en ComfyUI.
- Dependencias externas: requiere codificador de texto Qwen3.5-9B y VAE Flux.2 VAE del release de Comfy-Org de MOSS-Image, que no se incluyen.
- Error de cuantización: hasta un 0,98 % de error relativo de Frobenius en la peor capa, con un error máximo por elemento de 1,2e-2.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no disponibles en la información proporcionada.
- Licencia Apache-2.0 heredada del original; el autor no añade restricciones adicionales, pero conviene verificar los términos del modelo base y del fine-tune de origen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SumomoLee/MOSS-Image-Base-Heal-INT8-ConvRot
- Modelo de origen (fine-tune): https://huggingface.co/SumomoLee/MOSS-Image-Base-Heal
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Herramienta de exportación (KohakuMossTrainer): https://github.com/KohakuBlueleaf/KohakuMossTrainer
