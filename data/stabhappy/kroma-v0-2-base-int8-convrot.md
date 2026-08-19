# Stabhappy/kroma-v0.2-base-INT8-convrot

## Resumen

Stabhappy/kroma-v0.2-base-INT8-convrot es una cuantización INT8 del modelo Kroma v0.2 base (lodestones/Kroma), desarrollado por el usuario Stabhappy para permitir inferencia rápida y con baja VRAM en ComfyUI. El modelo original, de arquitectura Krea 2 DiT (Diffusion Transformer) con hidden size 6144, ocupa 51,3 GB en F32; esta versión cuantizada reduce el peso a 14,8 GB, aproximadamente 3,5 veces menos, manteniendo las capas más sensibles (embeddings, time, text fusion) en alta precisión.

La cuantización utiliza el método ConvRot, una variante de QuaRot que aplica rotaciones de Hadamard por grupos de 256 para suavizar outliers de activaciones antes de la cuantización row-wise INT8, junto con SVD learned rounding y corrección de sesgo. El resultado es un archivo safetensors con metadatos `comfy_quant` que se carga con el loader estándar de ComfyUI, sin necesidad de nodos personalizados. Está pensado para GPUs NVIDIA con soporte de tensor cores INT8 (RTX 30 en adelante) y requiere el text encoder `qwen3vl_4b_fp8_scaled` y el VAE `qwen_image_vae` por separado.

Este modelo es relevante porque democratiza el uso de un generador de imágenes de gran tamaño en hardware de consumo, manteniendo una calidad cercana a la versión original (clase GGUF-Q8). No es un lanzamiento oficial de Krea, sino un derivado cuantizado bajo la Krea 2 Community License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Krea 2 DiT (Diffusion Transformer), hidden 6144 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-image) |
| Tipos de cuantizacion | INT8 ConvRot (row-wise con rotacion Hadamard, grupo 256) |
| Idiomas soportados | en |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors (con metadatos comfy_quant) |

## Arquitectura y entrenamiento

El modelo base Kroma v0.2 utiliza una arquitectura de Diffusion Transformer (DiT) de Krea 2, con 28 bloques principales (blocks.0–27) que incluyen atención (wq/wk/wv/wo/gate) y MLP (gate/up/down). La cuantización aplicada por Stabhappy convierte estos bloques a INT8 con rotación de Hadamard por grupos de 256 (ConvRot), mientras mantiene en F32 las capas de embedding (`first`, `last`), modulación de tiempo (`tmlp`, `tproj`) y fusión de texto (`txtfusion`, `txtmlp`) por ser sensibles a outliers.

El proceso de cuantización se realizó con la herramienta `ctq` (silveroxides/convert_to_quant v1.3.1) usando SVD learned rounding y corrección de sesgo, con 3072 muestras de calibración. La inferencia se ejecuta mediante tensor cores INT8 (`torch._int_mm`) y kernels Triton. No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, dataset, técnicas de alineación), por lo que no están disponibles.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el pipeline de ComfyUI.
- Inferencia con precision INT8 nativa, aprovechando tensor cores y Triton para aceleracion.
- Compatible con el cargador estandar de ComfyUI; no requiere nodos personalizados.
- Soporte de LoRA a traves del cargador estandar, aunque se recomienda fusionar el LoRA antes de cuantizar para mejor calidad.
- No se documentan capacidades adicionales como tool calling, agentes o multimodalidad mas alla de la entrada de texto.

## Casos de uso

- Generacion de imagenes en GPUs de consumo (RTX 3060, 4060, etc.) gracias a la reduccion de VRAM: el modelo de 14,8 GB permite ejecutar el DiT en tarjetas con 12-16 GB de VRAM, algo inviable con el original de 51,3 GB.
- Flujos de produccion en ComfyUI: se integra directamente con el grafo estandar (CLIPLoader → CLIPTextEncode → KSampler → VAEDecode) para generar imagenes de alta resolucion sin necesidad de adaptar la infraestructura.
- Prototipado rapido de conceptos visuales en estudios de diseno: los equipos pueden iterar sobre prompts y estilos sin depender de servidores remotos o GPUs de datacenter.
- Generacion de imagenes para contenido web y marketing: la baja latencia (gracias a INT8) permite generar lotes de imagenes en tiempo casi real para campañas, banners o ilustraciones.
- Investigacion en generacion de imagenes con recursos limitados: laboratorios academicos o pequenos equipos pueden experimentar con arquitecturas DiT de gran tamano sin adquirir hardware costoso.
- Despliegue en servicios de generacion de imagenes bajo demanda: al reducir el peso y el consumo de memoria, es viable montar un endpoint local con ComfyUI para atender peticiones concurrentes en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA con soporte de INT8 tensor cores: RTX 30 series o superiores (requisito indicado por el autor).
- VRAM: no especificada, pero el archivo pesa 14,8 GB; se requiere VRAM suficiente para cargar los pesos mas el overhead de activaciones y el VAE (no se detalla).
- Text encoder y VAE deben cargarse por separado: `qwen3vl_4b_fp8_scaled.safetensors` y `qwen_image_vae.safetensors`.
- Entorno de ejecucion: ComfyUI con soporte nativo INT8 (commit `1a510f04` o version reciente) y Triton instalado.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tamano | Precision | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lodestones/Kroma (original) | 51,3 GB | F32 | Krea 2 DiT | Krea 2 Community | HuggingFace |
| Stabhappy/kroma-v0.2-base-INT8-convrot | 14,8 GB | INT8 ConvRot | Krea 2 DiT | Krea 2 Community | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (por ejemplo, otras cuantizaciones de Kroma o modelos DiT similares). La comparativa se limita al modelo original, del que deriva.

## Limitaciones y advertencias

- Es una cuantizacion no oficial, creada por un tercero; no esta respaldada por Krea ni por el equipo de lodestones.
- La licencia Krea 2 Community License impone restricciones de uso; se debe revisar el enlace oficial para conocer los terminos exactos, especialmente para uso comercial.
- El archivo contiene solo el transformer DiT; es obligatorio cargar el text encoder y el VAE por separado.
- Aunque se afirma una calidad cercana a la original (clase GGUF-Q8), puede haber una ligera perdida de fidelidad en detalles finos o texturas.
- Se recomienda fusionar LoRAs en el modelo base antes de cuantizar; aplicarlos sobre los pesos INT8 puede degradar la calidad.
- Requiere hardware especifico (RTX 30+ con Triton); no funciona en GPUs sin soporte INT8 tensor cores ni en CPU.
- No se han publicado evaluaciones independientes de sesgos, artefactos o comportamiento en dominios especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stabhappy/kroma-v0.2-base-INT8-convrot
- Modelo base lodestones/Kroma: https://huggingface.co/lodestones/Kroma
- Licencia Krea 2 Community: https://www.krea.ai/krea-2-licensing
- Herramienta de cuantizacion ctq: https://github.com/silveroxides/convert_to_quant
- Repositorio ComfyUI-INT8-Fast (linaje ConvRot): https://github.com/BobJohnson24/ComfyUI-INT8-Fast
