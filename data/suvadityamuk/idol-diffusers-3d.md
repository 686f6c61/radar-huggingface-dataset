# suvadityamuk/idol-diffusers-3d

## Resumen

IDOL es un modelo de reconstruccion de objetos 3D a partir de una unica imagen (image-to-3D) desarrollado por Speridlabs. Esta ficha concreta corresponde a `suvadityamuk/idol-diffusers-3d`, una conversion del modelo original `speridlabs/idol` al formato del paquete `diffusers-3d`, que empaqueta cada red en carpetas de componentes estandar de Diffusers y Transformers, sin necesidad de codigo remoto (`trust_remote_code`).

El modelo genera representaciones 3D en forma de Gaussian splats: dado un recorte RGBA de un objeto, produce un conjunto de gaussianas 3D (por defecto 262.144) junto con metadatos de camara (yaw, pitch, radio y FOV de la vista de entrada). La arquitectura sigue el diseno de TripoSplat de VAST-AI-Research, con un transformer de difusion con flow matching y un decoder de gaussianas, condicionado por un encoder de imagen DINOv3 y un VAE de FLUX.2.

Es relevante para quien quiera integrar reconstruccion 3D en pipelines de Python sin depender de implementaciones ad hoc: la conversion permite usar `AutoPipelineForImageTo3D` de forma declarativa. Conviene tener en cuenta que el repositorio tiene cero descargas y cero likes, y que depende de dos pesos de terceros con acceso restringido (DINOv3 y el VAE de FLUX.2) que no se redistribuyen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching) con decoder de Gaussian splats, basada en TripoSplat; encoder de imagen DINOv3 ViT y VAE de FLUX.2 |
| Parametros totales | 370.526.101 (safetensors del repositorio, sin contar componentes externos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no generativo de texto) |
| Tipos de cuantizacion | no disponible; el pipeline carga en la precision original de cada componente, con opcion de `dtype=torch.float32` en CPU |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 (pesos y codigo IDOL, Copyright Speridlabs); componentes externos bajo sus propias licencias |
| Formato de pesos | safetensors (componentes Diffusers/Transformers); salida en `.ply` (Gaussian splats) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de TripoSplat (MIT). El pipeline encadena cinco componentes: un `image_encoder` basado en `DINOv3ViTModel` que extrae caracteristicas de la imagen de entrada; un `vae` (`TripoSplatImageVAE`) para la codificacion latente de la imagen; un `transformer` de difusion (`TripoSplatTransformerModel`) que opera con `FlowMatchEulerDiscreteScheduler`; y un `decoder` (`TripoSplatGaussianDecoder`) que produce las gaussianas 3D. La generacion se realiza por muestreo con flow matching (50 pasos por defecto, shift 3.0, `guidance_scale=4.0`, equivalente al `cfg_strength=3.0` del codigo original).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o el proceso de alineacion (RLHF/DPO) en la informacion proporcionada. La conversion se realizo con la herramienta `diffusers-3d-convert-idol` sobre `diffusers-3d 0.1.0.dev0`, y el paquete incluye tests de paridad contra el codigo original fijado a revisiones concretas. Un detalle operativo relevante: si la imagen de entrada no trae canal alfa util, el pipeline aplica segmentacion de fondo con BiRefNet (`ZhengPeng7/BiRefNet`, MIT), que puede desactivarse con `pipeline.disable_background_removal()`.

## Capacidades

- Reconstruccion 3D de objetos a partir de una unica imagen RGB o RGBA, con salida en Gaussian splats.
- Prediccion de la camara de la vista de entrada (yaw, pitch, radio y FOV), accesible en `splat.metadata["camera"]`.
- Dos modos de encuadre: `mode="synthetic"` (renderes, recorte 1.2x) y `mode="real"` (fotografias, recorte 1.7x).
- Eliminacion automatica de fondo con BiRefNet cuando la entrada no tiene alfa util.
- Exportacion de la salida a formato `.ply` para su uso en visores y motores de render de Gaussian splats.
- Ejecucion en CPU o GPU en PyTorch puro; el renderizado de splats requiere el backend opcional `gsplat`.
- Control de reproducibilidad mediante semilla en `torch.Generator`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, vision general ni audio: es un modelo especializado de una sola tarea.

## Casos de uso

- Digitalizacion de productos para e-commerce: a partir de una foto de catalogo con fondo recortado, generar un splat 3D navegable para visores web, usando `mode="real"` para ajustar el encuadre a fotografias reales.
- Prototipado rapido en videojuegos: convertir concept art o capturas de un objeto en una representacion 3D inicial que sirva de referencia de volumen y silueta antes del modelado definitivo.
- Creacion de assets para realidad aumentada: generar splats de objetos pequenos (muebles, electrodomesticos) para previsualizacion en apps AR que soporten Gaussian splatting.
- Catalogacion y archivo patrimonial: reconstruir piezas fisicas a partir de fotografias existentes cuando no se dispone de escaneo multivida, guardando el `.ply` junto con los metadatos de camara para reproducir la vista original.
- Generacion de datasets 3D sinteticos: producir variaciones de objetos 3D para entrenar otros modelos de vision (deteccion, segmentacion, estimacion de pose) con `mode="synthetic"` y semillas controladas.
- Integracion en herramientas de modelado: usar el splat como capa de referencia en Blender u otro editor, exportando el `.ply` y ajustando la camara con los metadatos predichos.
- Investigacion en reconstruction: servir de baseline reproducible en PyTorch puro para comparar variantes de muestreo (pasos, shift, guidance) sin depender de codigo remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 2,6 GB y los pesos suman 370,5 M de parametros; a esto hay que anadir el encoder DINOv3 ViT-H/16+ y el VAE de FLUX.2, que se descargan aparte y son la parte mas pesada del pipeline.
- GPU recomendadas: no disponibles en la documentacion. Por el perfil del modelo (difusion con 50 pasos y 262.144 gaussianas), se espera que requiera GPU con memoria holgada, pero no hay cifras publicadas.
- GPU de consumo: no confirmado. La documentacion solo indica que todos los componentes corren en CPU o GPU en PyTorch puro y que en CPU conviene pasar `dtype=torch.float32`.
- Despliegue: paquete `diffusers-3d` (instalacion desde GitHub), con `AutoPipelineForImageTo3D.from_pretrained(...)`. El renderizado de splats necesita el backend opcional `gsplat`; la malla con texturas PBR para TRELLIS.2 necesita CuMesh. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| IDOL (esta conversion) | 370,5 M (repo) | 1 imagen | Gaussian splats + camara | Apache-2.0 (pesos IDOL) | Depende de DINOv3 y VAE de FLUX.2 con acceso restringido |
| TripoSplat (VAST-AI-Research) | no disponible | 1 imagen | Gaussian splats | MIT | Arquitectura original en la que se basa IDOL |
| TRELLIS.2 | no disponible | 1 imagen | Malla con texturas PBR | no disponible | Mencionado en la documentacion del paquete; requiere CuMesh para el render de malla |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de pesos con acceso restringido: DINOv3 (DINOv3 License) y el VAE de FLUX.2 (licencia no comercial de FLUX) no se redistribuyen. Es necesario aceptar ambas licencias y ejecutar `hf auth login`; sin acceso, la carga falla.
- La licencia no comercial del VAE de FLUX.2 condiciona el uso comercial del pipeline completo, aunque los pesos de IDOL sean Apache-2.0. Hay que revisar la compatibilidad antes de produccion.
- Modelo de una sola tarea: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier flujo multi-paso debe orquestarse externamente.
- Riesgo de alucinacion geometrica: como modelo generativo, puede producir geometria plausible pero incorrecta en caras ocultas o zonas no visibles en la imagen de entrada.
- Dependencia del recorte: la calidad depende del canal alfa o de la segmentacion con BiRefNet; fondos complejos o transparencias parciales pueden degradar el resultado.
- Sin datos de sesgo, evaluacion o benchmarks publicados; el repositorio tiene cero descargas y cero likes, por lo que no hay validacion comunitaria.
- Requiere instalar el paquete desde GitHub (`diffusers-3d`), no desde PyPI, y el renderizado necesita dependencias opcionales adicionales (`gsplat`, CuMesh).
- No afiliado ni respaldado por Speridlabs, VAST, Meta ni Black Forest Labs.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suvadityamuk/idol-diffusers-3d
- Modelo base: https://huggingface.co/speridlabs/idol
- Paquete diffusers-3d: https://github.com/suvadityamuk/diffusers-3d
- Encoder DINOv3: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- VAE de FLUX.2: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Segmentacion de fondo BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
