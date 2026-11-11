# tencent/Hunyuan3D-2.1

## Resumen

Hunyuan3D-2.1 es un sistema de generacion de activos 3D de alta fidelidad desarrollado por Tencent Hunyuan, disenado para convertir una imagen (o un prompt de texto) en una malla 3D con material PBR (physically based rendering) listo para produccion. A diferencia de los modelos de lenguaje, es un pipeline de difusion para 3D que combina un generador de forma y un generador de textura, y se distribuye a traves de la libreria `hunyuan3d-2` con pesos en formato safetensors.

El modelo resuelve el problema de la creacion manual de assets 3D, que tradicionalmente requiere modelado y texturizado por artistas. Su relevancia actual radica en que produce mallas con materiales PBR completos (color base, rugosidad, metalicidad, normales), lo que lo hace apto para pipelines de videojuegos, e-commerce o realidad aumentada sin retoques manuales intensivos.

La version 2.1 es una evolucion de Hunyuan3D 2.0 (enero de 2025) y de Hunyuan3D-1.0 (noviembre de 2024). El repositorio ocupa 15,0 GB y acumula mas de 107.000 descargas y 1.371 likes en Hugging Face. Soporta instrucciones en ingles y chino, y se publica bajo licencia comunitaria de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion para generacion 3D (generador de forma + generador de textura PBR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo imagen-a-3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | tencent-hunyuan-community (license: other) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,0 GB |
| Pipeline | image-to-3d (tambien soporta text-to-3d) |
| Libreria | hunyuan3d-2 |

## Arquitectura y entrenamiento

Hunyuan3D-2.1 es un sistema de dos etapas: un generador de forma que produce la geometria de la malla a partir de la imagen de entrada y un generador de textura que sintetiza mapas PBR (color base, rugosidad, metalicidad y normales) sobre esa geometria. La model card cita como base tecnica los repositorios TripoSG, DINOv2, Stable Diffusion, FLUX y diffusers, lo que sugiere el uso de un codificador de imagen tipo DINOv2 para condicionar la generacion y de modelos de difusion para la sintesis de forma y textura.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma estandar a un modelo generativo 3D). La innovacion principal declarada por los autores es la produccion de material PBR de calidad de produccion, que diferencia esta version de la 2.0. Existen tres informes tecnicos asociados (arXiv 2506.15442 para la 2.1, 2501.12202 para la 2.0 y 2411.02293 para la 1.0) donde se detalla la metodologia.

## Capacidades

- Generacion de mallas 3D a partir de una unica imagen (image-to-3D).
- Generacion de mallas 3D a partir de texto (text-to-3D).
- Sintesis de materiales PBR completos: color base, rugosidad, metalicidad y mapas de normales.
- Produccion de assets de alta fidelidad orientados a pipelines de renderizado fisicamente correcto.
- Soporte de instrucciones en ingles y chino.
- Integracion con el ecosistema diffusers y la libreria propia `hunyuan3d-2`.
- Demo publica alojada en Hugging Face Spaces.
- No se documentan en la informacion disponible capacidades de tool calling, agentes ni razonamiento multi-paso, por tratarse de un modelo generativo 3D y no de un modelo de lenguaje.

## Casos de uso

- Creacion de assets para videojuegos: un artista parte de un concept art 2D y obtiene una malla con material PBR que puede importar directamente en motores como Unity o Unreal, reduciendo el tiempo de modelado y texturizado manual.
- E-commerce y visualizacion de producto: a partir de una fotografia de producto se genera un modelo 3D texturizado para visores web o configuradores, gracias a la salida con materiales PBR que responden correctamente a la iluminacion.
- Realidad aumentada y virtual: generacion rapida de objetos 3D para escenas AR/VR donde se requiere geometria y textura coherentes sin trabajo manual.
- Prototipado industrial y diseno de producto: conversion de bocetos o renders 2D en mallas 3D para revisiones tempranas de forma y acabado superficial.
- Arquitectura y decoracion: generacion de muebles y elementos decorativos 3D a partir de catalogos fotograficos para renders de interior.
- Contenido para impresion 3D: produccion de mallas a partir de imagenes de referencia, aunque la idoneidad para impresion depende de la topologia resultante y requerira validacion.
- Generacion de assets a partir de descripciones textuales (text-to-3D) para previsualizacion conceptual rapida en estudios de diseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio de pesos ocupa 15,0 GB, por lo que se requiere una GPU con memoria suficiente para cargar los componentes de forma y textura.
- GPU recomendadas: no disponibles de forma explicita; por el tamano del repositorio se recomienda hardware de gama alta (A100, H100 o RTX 4090) para ejecucion local.
- Viabilidad en GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: libreria `hunyuan3d-2`, ecosistema diffusers y demo en Hugging Face Spaces.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hunyuan3D-2.1 | no disponible | no aplica | Malla 3D + PBR | tencent-hunyuan-community | Hugging Face, GitHub, demo |
| Hunyuan3D 2.0 | no disponible | no aplica | Malla 3D texturizada | tencent-hunyuan-community | Hugging Face, GitHub |
| Hunyuan3D-1.0 | no disponible | no aplica | Malla 3D texturizada | tencent-hunyuan-community | Hugging Face, GitHub |
| TripoSG | no disponible | no aplica | Malla 3D | no disponible | GitHub |

La comparacion con alternativas externas como TripoSG, citada como base tecnica, no puede completarse con datos de rendimiento porque no se han proporcionado cifras de benchmarks.

## Limitaciones y advertencias

- Riesgo de geometria o texturas inconsistentes en imagenes de entrada ambiguas, oclusivas o con iluminacion compleja; requiere validacion en produccion.
- La licencia tencent-hunyuan-community no es una licencia open source estandar; es necesario revisar sus terminos antes de cualquier uso comercial.
- La model card incluye la marca `extra_gated_eu_disallowed: true`, lo que indica restricciones de acceso desde la Union Europea; conviene verificar las condiciones de uso en esa region.
- Soporte linguistico limitado a ingles y chino para las instrucciones de texto.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con datos de imagenes y 3D puede reproducir sesgos de representacion de los datasets de origen.
- No se proporcionan datos de rendimiento cuantitativos que permitan estimar la calidad frente a alternativas.
- El tamano del repositorio (15,0 GB) implica requisitos de almacenamiento y memoria considerables para despliegue local.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hunyuan3D-2.1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tencent/Hunyuan3D-2.1
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
- Licencia: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE
- Informe tecnico 2.1 (arXiv): https://arxiv.org/abs/2506.15442
- Informe tecnico 2.0 (arXiv): https://arxiv.org/abs/2501.12202
- Informe tecnico 1.0 (arXiv): https://arxiv.org/abs/2411.02293
- Sitio oficial: https://3d.hunyuan.tencent.com
- Discord: https://discord.gg/GuaWYwzKbX
- TripoSG: https://github.com/VAST-AI-Research/TripoSG
- DINOv2: https://github.com/facebookresearch/dinov2
- Stable Diffusion: https://github.com/Stability-AI/stablediffusion
- FLUX: https://github.com/black-forest-labs/flux
- diffusers: https://github.com/huggingface/diffusers
