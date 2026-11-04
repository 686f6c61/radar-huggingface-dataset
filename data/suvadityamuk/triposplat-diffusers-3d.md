# suvadityamuk/TripoSplat-diffusers-3d

## Resumen

TripoSplat-diffusers-3d es una conversión del modelo TripoSplat de VAST-AI al formato de la librería comunitaria diffusers-3d, que empaqueta los componentes como carpetas estándar de Diffusers y Transformers sin requerir código remoto. El modelo original resuelve la generación de representaciones 3D a partir de una única imagen mediante Gaussian splatting: dado un recorte RGBA, produce un conjunto de gaussianas 3D con grado 0 de armónicos esféricos dentro de un volumen normalizado de [-0,5, 0,5]³ en orientación Z-up.

La conversión incluye únicamente el flow transformer y el decodificador gaussiano propios de TripoSplat (370.526.101 parámetros en safetensors, 1,3 GB de repositorio). El codificador de imagen DINOv3 y el VAE de FLUX.2 no se redistribuyen por estar sujetos a licencias de terceros con control de acceso, y se cargan desde sus repositorios originales en revisiones fijadas. El pipeline se apoya en el scheduler FlowMatchEulerDiscreteScheduler y en la eliminación de fondo con BiRefNet cuando la entrada carece de canal alfa utilizable.

Es relevante para desarrolladores que quieran integrar image-to-3D en un stack Diffusers estándar sin depender de código personalizado, aunque con la contrapartida de que el pipeline completo exige aceptar las licencias de DINOv3 (Meta) y FLUX.2-dev (Black Forest Labs, no comercial) y autenticarse en Hugging Face antes de cargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow transformer + decodificador gaussiano (Gaussian splatting), con codificador DINOv3 y VAE de FLUX.2 como componentes externos |
| Parametros totales | 370.526.101 (solo transformer y decoder incluidos en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo image-to-3D, no textual) |
| Tipos de cuantizacion | no disponible; precision de carga por defecto: DINOv3 y VAE en bfloat16, transformer y decoder en float16; se puede forzar float32 en CPU |
| Idiomas soportados | no disponible (no aplica, entrada visual) |
| Licencia | MIT (pesos y código de TripoSplat, Copyright (c) 2026 VAST); componentes externos bajo DINOv3 License y FLUX non-commercial license |
| Formato de pesos | safetensors, organizados en carpetas de componentes Diffusers (`decoder`, `image_encoder`, `scheduler`, `transformer`, `vae`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de generación condicionada por imagen: un codificador DINOv3 ViT (variante vith16plus, revisión fijada de `facebook/dinov3-vith16plus-pretrain-lvd1689m`) extrae características de la imagen de entrada, y un flow transformer genera las gaussianas 3D que posteriormente decodifica un decodificador gaussiano específico (`TripoSplatGaussianDecoder`). El muestreo usa `FlowMatchEulerDiscreteScheduler` con 20 pasos por defecto y escala de guidance 3.0, produciendo 262.144 gaussianas con grado 0 de armónicos esféricos dentro del cubo [-0,5, 0,5]³ en Z-up. El VAE empleado para la representación latente proviene del folder `vae/` de `black-forest-labs/FLUX.2-dev`.

La conversión se realizó con la herramienta `diffusers-3d-convert-triposplat` sobre `diffusers-3d 0.1.0.dev0`, y el paquete incluye tests de paridad contra el código upstream en revisiones fijadas. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; estos detalles corresponden al modelo original de VAST-AI y no se detallan en la información proporcionada. Como innovación de ingeniería destacable, la conversión elimina la dependencia de código remoto y permite ejecutar todas las redes en PyTorch puro sobre CPU o GPU, con backend opcional `gsplat` para el renderizado de splats.

## Capacidades

- Generación de representaciones 3D en forma de Gaussian splats a partir de una única imagen RGB o RGBA.
- Segmentación automática del sujeto mediante BiRefNet (`ZhengPeng7/BiRefNet`, MIT) cuando la imagen no trae canal alfa; se puede desactivar con `pipeline.disable_background_removal()`.
- Salida estructurada como `GaussianSplatAsset` con grado 0 de armónicos esféricos, en volumen normalizado [-0,5, 0,5]³ y orientación Z-up.
- Control de reproducibilidad mediante `torch.Generator` con semilla manual.
- Inferencia en CPU y GPU sin código remoto, con precisión configurable por componente.
- No soporta tool calling, function calling, razonamiento multi-paso, texto, visión general ni audio: es un pipeline puramente image-to-3D.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de un render o foto de un objeto, generar un splat 3D que se pueda visualizar o exportar a un motor compatible con Gaussian splatting, útil para bloques de arte conceptual antes de modelado definitivo.
- Catalogación de producto en e-commerce: convertir fotos de producto con fondo recortado en representaciones 3D navegables para visores web, aprovechando la eliminación automática de fondo con BiRefNet cuando la imagen no trae alfa.
- Reconstrucción de escenas para fotogrametría ligera: usar una sola vista como entrada cuando no se dispone de múltiples imágenes, generando un splat que sirve como aproximación inicial para pipelines de reconstrucción más pesados.
- Generación de variaciones controladas: fijar una semilla con `torch.Generator` y variar la imagen de entrada para producir un conjunto de splats coherentes en un mismo espacio normalizado, útil para aumentación de datos 3D en investigación.
- Integración en herramientas de autoría 3D: el pipeline se carga con `AutoPipelineForImageTo3D.from_pretrained(...)` dentro de un stack Diffusers estándar, lo que facilita incorporarlo a scripts de Blender, Houdini o pipelines de contenido procedural sin dependencias de código remoto.
- Investigación en generación 3D condicionada por imagen: al ser una conversión con tests de paridad contra el upstream, sirve como base reproducible para experimentos de ablación sobre pasos de muestreo, guidance o número de gaussianas.
- Docencia y demos interactivas: la ejecución en CPU con `dtype=torch.float32` permite desplegar demos en entornos sin GPU, aunque con latencia mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo ocupa 1,3 GB en safetensors (solo transformer y decoder); a ello hay que sumar el codificador DINOv3 ViT-H/16+ y el VAE de FLUX.2, que dominan el consumo. Como orientación, el conjunto completo en bfloat16/float16 requiere previsiblemente más de 8 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no especificadas por el autor. Por el tamaño de los componentes externos (ViT-H y VAE de FLUX.2), se espera que una RTX 4090 (24 GB) o una A100/H100 sean adecuadas; no hay datos oficiales de latencia ni throughput.
- ¿Cabe en GPU de consumo? El pipeline completo probablemente sí en GPUs de 16-24 GB, pero no está confirmado; el transformer y el decoder por sí solos son ligeros.
- Opciones de despliegue: `diffusers-3d` (paquete propio, instalable desde GitHub), PyTorch puro en CPU o GPU; renderizado de splats con backend opcional `gsplat`; malla con textura PBR para TRELLIS.2 requiere CuMesh. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TripoSplat-diffusers-3d (esta ficha) | 370,5 M (transformer + decoder) | Imagen RGB/RGBA | Gaussian splats (SH grado 0) | MIT (pesos propios); componentes externos con licencias aparte | Hugging Face, vía diffusers-3d |
| VAST-AI/TripoSplat (upstream) | no disponible en la información | Imagen RGB/RGBA | Gaussian splats | MIT | Hugging Face, código original |
| TRELLIS.2 | no disponible en la información | Imagen | Malla con textura PBR | no disponible | Mencionado en la documentación del paquete |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La licencia MIT cubre solo los pesos y el código de TripoSplat; el pipeline completo depende de DINOv3 (DINOv3 License de Meta) y del VAE de FLUX.2-dev (licencia no comercial de Black Forest Labs), lo que impide usar el conjunto en producción comercial sin revisar y aceptar ambas licencias.
- Es necesario autenticarse (`hf auth login`) y aceptar las licencias de los repositorios con control de acceso antes de cargar el pipeline; en caso contrario, `from_pretrained` lanza un error explícito.
- El modelo no redistribuye DINOv3 ni el VAE; cualquier uso debe respetar las condiciones de sus repositorios originales, que pueden cambiar en revisiones futuras.
- La salida es un Gaussian splat con grado 0 de armónicos esféricos, lo que limita la fidelidad de apariencia dependiente de la vista; para mallas con textura PBR se requiere otro pipeline (TRELLIS.2 con CuMesh).
- No hay información publicada sobre sesgos, tasas de alucinación geométrica ni evaluación cuantitativa de calidad; se recomienda validación manual en dominios críticos.
- El pipeline está pensado para una sola imagen; no aprovecha múltiples vistas ni información de profundidad, lo que puede degradar la reconstrucción en objetos con oclusiones severas o geometría ambigua.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-03; se trata de una conversión reciente sin validación comunitaria amplia.
- El renderizado de splats requiere el backend opcional `gsplat`; sin él, la salida no se puede visualizar directamente desde el paquete.
- No se especifican requisitos de VRAM oficiales, por lo que el dimensionado de infraestructura debe hacerse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/suvadityamuk/TripoSplat-diffusers-3d
- Modelo base: https://huggingface.co/VAST-AI/TripoSplat
- Paquete diffusers-3d: https://github.com/suvadityamuk/diffusers-3d
- Codificador DINOv3: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- VAE de FLUX.2-dev: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Segmentador BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
