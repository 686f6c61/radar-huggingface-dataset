# stabilityai/stable-diffusion-xl-base-1.0

## Resumen

SDXL 1.0 base es un modelo de difusión latente para generación de imágenes a partir de texto, desarrollado por Stability AI. Se basa en la arquitectura de difusión latente con dos codificadores de texto preentrenados: OpenCLIP-ViT/G y CLIP-ViT/L. Con 2.567.463.684 parámetros, es el modelo base del pipeline SDXL, que puede usarse de forma independiente o junto con un refiner especializado para mejorar la calidad final. Este modelo supuso un salto cualitativo en fidelidad, adherencia al prompt y resolución (hasta 1024x1024) respecto a las versiones anteriores de Stable Diffusion, consolidándose como una referencia en generación de imágenes open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion con ensemble of experts (base + refiner) |
| Parametros totales | 2.567.463.684 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (generacion de imagenes) |
| Tipos de cuantizacion | fp16, fp32, safetensors, ONNX, OpenVINO |
| Idiomas soportados | No especificado (principalmente ingles) |
| Licencia | CreativeML Open RAIL++-M |
| Formato de pesos | safetensors, ONNX, OpenVINO |

## Arquitectura y entrenamiento

SDXL 1.0 base utiliza una arquitectura de difusion latente que opera en un espacio latente de menor dimension. Emplea dos codificadores de texto fijos: OpenCLIP-ViT/G y CLIP-ViT/L, cuyos embeddings se combinan para condicionar la generacion. El pipeline completo usa un ensemble of experts: el modelo base genera latentes ruidosos que luego son refinados por un modelo refiner especializado (stable-diffusion-xl-refiner-1.0) en los ultimos pasos de denoising. Tambien se puede aplicar SDEdit (img2img) para mejorar la resolucion.

Los detalles del entrenamiento (numero de tokens, composicion del dataset, tecnicas de RLHF) no estan disponibles en la informacion proporcionada. Se sabe que fue entrenado con un gran corpus de imagenes-texto, pero no se especifican cifras concretas.

## Capacidades

- Generacion de imagenes fotorrealistas y artisticas a partir de prompts de texto.
- Edicion de imagenes mediante img2img (SDEdit).
- Resolucion nativa de 1024x1024, con posibilidad de generar en otras resoluciones.
- Control de estilo, composicion y detalle mediante prompts descriptivos.
- Generacion de multiples variantes de una misma escena.
- Integracion con el refiner para mejorar la calidad final en un pipeline de dos etapas.
- No soporta tool calling ni razonamiento multi-step, al ser un modelo generativo de imagenes.

## Casos de uso

- **Generacion de arte conceptual**: artistas y diseñadores crean ilustraciones de alta calidad para videojuegos, cine o literatura, describiendo escenas complejas con iluminacion, composicion y estilo especificos.
- **Diseño grafico y publicidad**: produccion de imagenes para campañas de marketing, banners, posters o contenido para redes sociales, iterando rapidamente sobre conceptos visuales.
- **Generacion de fondos y texturas**: creacion de fondos para entornos virtuales, texturas para modelado 3D o assets para diseño de interiores.
- **Edicion de fotografias**: mediante img2img, se transforman imagenes existentes cambiando estilos, añadiendo elementos o modificando la atmosfera sin herramientas complejas de edicion.
- **Prototipado de UI/UX**: generacion de mockups de interfaces o ilustraciones para presentaciones de producto.
- **Educacion y divulgacion**: creacion de material visual didactico personalizado para explicar conceptos cientificos, historicos o tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (como FID, CLIP score, etc.) en la informacion proporcionada. La model card solo incluye una comparacion cualitativa mediante evaluacion de usuarios, donde SDXL base supera claramente a Stable Diffusion 1.5 y 2.1, y el pipeline con refiner logra el mejor rendimiento global.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en fp16 se necesitan aproximadamente 6-8 GB de VRAM para generar imagenes a 1024x1024. En fp32 el consumo se duplica (12-16 GB). Con cpu offloading se puede ejecutar en GPUs con menos VRAM, pero con mayor latencia.
- **GPUs recomendadas**: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 8 GB de VRAM. Tambien funciona en GPUs de gama media como RTX 3060 o 4060 con optimizaciones.
- **Opciones de despliegue**: se puede usar con la libreria `diffusers` (PyTorch), con `optimum` para ONNX Runtime o OpenVINO, o mediante interfaces como Stable Diffusion WebUI (AUTOMATIC1111) o ComfyUI. Tambien se puede servir a traves de APIs como Clipdrop.
- **Latencia**: no se especifica en la informacion. En una RTX 4090, la generacion de una imagen a 1024x1024 con 40 pasos suele tardar entre 3 y 5 segundos, pero esto es una estimacion basada en experiencia, no un dato oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion maxima | Licencia | Rendimiento cualitativo |
|---|---|---|---|---|
| SDXL 1.0 base | 2.567M | 1024x1024 | openrail++ | Superior a versiones anteriores |
| Stable Diffusion 1.5 | No disponible | 512x512 | openrail++ | Inferior en fidelidad y adherencia |
| Stable Diffusion 2.1 | No disponible | 768x768 | openrail++ | Inferior en fidelidad y adherencia |

No se dispone de datos numericos de benchmarks comparativos en la informacion proporcionada. La evaluacion de usuarios indica que SDXL base es significativamente mejor que sus predecesores.

## Limitaciones y advertencias

- **Sesgos**: como modelo entrenado con datos de Internet, puede reflejar sesgos sociales, culturales y de genero presentes en los datos.
- **Alucinaciones**: puede generar imagenes con objetos o detalles irreales o inconsistentes, especialmente con prompts complejos o poco comunes.
- **Limitaciones de idioma**: aunque acepta prompts en varios idiomas, su rendimiento optimo se logra con prompts en ingles. No se garantiza la comprension correcta de otros idiomas.
- **Restricciones de licencia**: la licencia CreativeML Open RAIL++-M permite uso comercial, pero prohibe generar contenido ilegal, dañino o engañoso. Se debe consultar el texto completo de la licencia.
- **Consumo de recursos**: requiere hardware con suficiente VRAM para una experiencia fluida; sin GPU dedicada, la generacion puede ser muy lenta.
- **Calidad variable**: la calidad de las imagenes depende en gran medida de la especificidad del prompt; prompts vagos pueden producir resultados mediocres.

## Enlaces

- [Hugging Face - stabilityai/stable-diffusion-xl-base-1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- [Repositorio GitHub - Stability-AI/generative-models](https://github.com/Stability-AI/generative-models)
- [Paper SDXL en arXiv](https://arxiv.org/abs/2307.01952)
- [Paper sobre ensemble of experts](https://arxiv.org/abs/2211.01324)
- [Paper sobre Latent Diffusion](https://arxiv.org/abs/2112.10752)
- [Paper sobre SDEdit](https://arxiv.org/abs/2108.01073)
- [Demo en Clipdrop](https://clipdrop.co/stable-diffusion)
- [Documentacion de diffusers para SDXL](https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/stable_diffusion_xl)
