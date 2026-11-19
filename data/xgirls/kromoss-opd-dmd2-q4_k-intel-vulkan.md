# xgirls/Kromoss-OPD-DMD2-Q4_K-Intel-Vulkan

## Resumen

Kromoss-OPD-DMD2-Q4_K-Intel-Vulkan es una cuantización GGUF del denoiser Kromoss OPD-priming 69.800, un modelo de difusión texto-a-imagen derivado de MOSS-Image-Base (OpenMOSS) y publicado originalmente por lodestones. Esta variante, subida por el usuario xgirls, convierte los pesos BF16 del autor a cuantización Q4_K mediante stable-diffusion.cpp (commit 532d2c1) y está empaquetada específicamente para inferencia con Vulkan sobre GPU Intel, con verificación en una Intel Arc B390.

El modelo resuelve la generación de imágenes a partir de texto en hardware Intel de consumo y profesional, un nicho tradicionalmente mal cubierto por los stacks de difusión dominantes (CUDA/cuBLAS). El repositorio incluye únicamente el denoiser cuantizado (3,2 GB), y requiere componentes externos en tiempo de ejecución: un text encoder Qwen3.5-9B en Q3_K_S, el tokenizador MOSS y el VAE small de FLUX.2, además de un LoRA cfg-static específico para la receta de 8 pasos DMD2.

Es relevante ahora por dos motivos: demuestra que el ecosistema GGUF/Vulkan ya permite ejecutar pipelines de difusión modernos en GPUs Intel Arc, y documenta una receta de destilación DMD2 (8 pasos, CFG 1) con tiempos medidos de 12,2-16,2 segundos para 512×512 y 100,6 segundos para 1024×1024. El recuento de parámetros reportado en safetensors (5.082.308.624) corresponde al conjunto de pesos asociados al repositorio, no necesariamente al denoiser aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (denoiser derivado de MOSS-Image-Base), empaquetado para stable-diffusion.cpp |
| Parametros totales | 5.082.308.624 (dato reportado en safetensors del repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se documenta ventana de texto) |
| Tipos de cuantizacion | Q4_K (denoiser); text encoder Qwen3.5-9B en Q3_K_S |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (3.217.940.928 bytes) + LoRA en safetensors (cfg-static, cargado aparte) |

## Arquitectura y entrenamiento

El modelo es un denoiser de difusión para generación de imágenes, derivado de MOSS-Image-Base de OpenMOSS y refinado por lodestones bajo la denominación Kromoss con un esquema de "OPD-priming 69.800". La variante aquí publicada aplica una destilación DMD2 que permite muestrear en 8 pasos con CFG 1, lo que reduce drásticamente el coste computacional frente a los pipelines de difusión tradicionales de 20-50 pasos con classifier-free guidance.

La conversión a GGUF se realizó con stable-diffusion.cpp en el commit 532d2c1, partiendo de los pesos BF16 del autor. El repositorio incluye un fichero quantization.json con las revisiones inmutables del origen, el comando de conversión y los hashes SHA-256, lo que permite reproducibilidad. El pipeline completo exige cuatro componentes: el denoiser Q4_K, el text encoder Qwen3.5-9B Q3_K_S, el tokenizador MOSS y el VAE small de FLUX.2, más el LoRA cfg-static (756 tensores) aplicado con fuerza 1. La configuración de muestreo recomendada es Euler con scheduler simple, flow shift 5 y CFG 1. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de imágenes texto-a-imagen mediante difusión, con resolución de salida verificada a 512×512 y 1024×1024.
- Muestreo destilado en 8 pasos (DMD2) con CFG 1, lo que reduce el número de evaluaciones del denoiser por imagen.
- Aplicación de LoRA en tiempo de ejecución (cfg-static, 756 tensores) para condicionar el comportamiento del muestreo.
- Inferencia acelerada por Vulkan sobre GPU Intel (verificado en Arc B390), con presupuesto de runtime de 14 GiB.
- Integración con el runtime Fern, que resuelve las descargas de componentes fijados a través de su catálogo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio; es un modelo estrictamente de síntesis de imagen.

## Casos de uso

- Generación de ilustraciones y assets en estaciones de trabajo con GPU Intel Arc: el modelo está empaquetado para Vulkan y se ha verificado en una Arc B390, por lo que encaja en flujos de trabajo Windows x64 sin GPU NVIDIA.
- Prototipado rápido de concepto visual: con 12,2-16,2 segundos por render a 512×512, permite iterar sobre prompts y variaciones en sesiones interactivas.
- Producción de imágenes a resolución media (1024×1024) en pipelines por lotes: los 100,6 segundos por imagen medidos permiten planificar throughput en entornos de generación masiva no interactiva.
- Integración en aplicaciones de escritorio con runtime Fern: el catálogo de Fern resuelve las dependencias (text encoder, tokenizador, VAE, LoRA) y simplifica el despliegue en entornos de usuario final.
- Investigación sobre destilación DMD2 y cuantización Q4_K: el repositorio documenta la receta de conversión, hashes y configuración de muestreo, lo que facilita experimentos reproducibles sobre calidad frente a coste.
- Evaluación comparativa de backends de difusión en hardware Intel: sirve como referencia para medir latencia y calidad de stable-diffusion.cpp con Vulkan frente a otros stacks.
- Generación de imágenes condicionada por estilo mediante LoRA: la carga separada del adaptador cfg-static permite experimentar con distintas fuerzas de adaptador (la documentada es 1).

## Benchmarks y rendimiento

| Prueba | Hardware | Resolución | Tiempo |
|---|---|---|---|
| Fern Create Image (primer render) | Intel Arc B390, Vulkan, Windows x64 | 512 × 512 | 16,2 s |
| Fern Create Image | Intel Arc B390, Vulkan, Windows x64 | 1024 × 1024 | 100,6 s |
| Ejecución independiente repetida | Intel Arc B390, Vulkan, Windows x64 | 512 × 512 | 12,2 s |

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU u otros) en la información disponible. El rendimiento en otras GPUs distintas de la Intel Arc B390 no está medido.

## Requisitos de hardware

- VRAM estimada: el preset Vulkan documentado usa un presupuesto de runtime de 14 GiB, que cubre denoiser Q4_K, text encoder Qwen3.5-9B Q3_K_S, VAE y LoRA.
- GPU verificada: Intel Arc B390 con backend Vulkan en Windows x64.
- Otras GPUs: no medidas; el empaquetado está orientado a Intel + Vulkan, por lo que el rendimiento en NVIDIA o AMD no está documentado.
- Cabe en GPU de consumo: sí, según el presupuesto de 14 GiB documentado, siempre que la GPU Intel disponga de esa memoria y soporte Vulkan.
- Opciones de despliegue: stable-diffusion.cpp (commit 532d2c1) y el runtime Fern con su catálogo de componentes.
- Latencia: 12,2-16,2 s para 512×512 y 100,6 s para 1024×1024 en Intel Arc B390; throughput no documentado para otros hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kromoss-OPD-DMD2-Q4_K-Intel-Vulkan | Difusión texto-a-imagen, GGUF Q4_K | 5.082.308.624 (repo) | 512×512 y 1024×1024 verificados | Apache 2.0 | Hugging Face, 0 descargas |
| lodestones/Kromoss (base) | Difusión texto-a-imagen, BF16 | No disponible | No disponible | Apache 2.0 (según derivado) | Hugging Face |
| OpenMOSS-Image-Base | Difusión texto-a-imagen | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene únicamente el denoiser cuantizado; sin el text encoder Qwen3.5-9B Q3_K_S, el tokenizador MOSS, el VAE FLUX.2 small y el LoRA cfg-static, el modelo no es funcional.
- La cuantización Q4_K introduce pérdida de calidad frente a los pesos BF16 originales; no se documenta la magnitud de esa degradación.
- El rendimiento solo está verificado en Intel Arc B390 con Vulkan y Windows x64; extrapolar latencias a otras GPUs no está respaldado por datos.
- Riesgo de alucinación visual y de artefactos propios de modelos de difusión destilados a 8 pasos con CFG 1; no se documentan evaluaciones de fidelidad al prompt.
- No se documentan sesgos conocidos, cobertura idiomática ni limitaciones de contexto textual.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la atribución a lodestones y OpenMOSS debe mantenerse según indica la model card; conviene verificar las condiciones de los componentes externos (text encoder, VAE) por separado.
- El modelo base y los componentes auxiliares pueden tener licencias distintas; la Apache 2.0 declarada aplica a este GGUF y sus cambios, no necesariamente a todo el pipeline.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xgirls/Kromoss-OPD-DMD2-Q4_K-Intel-Vulkan
- Modelo base: https://huggingface.co/lodestones/Kromoss
- LoRA cfg-static para 8 pasos DMD2: https://huggingface.co/lodestones/Kromoss/blob/0143e52d81ebee440649f47c74f12744cd29258c/experimental/opd-priming-8-steps-dmd2-lora_cfg-static.safetensors
- MOSS-Image-Base (OpenMOSS): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- stable-diffusion.cpp (commit de conversión 532d2c1): no disponible como enlace en la información proporcionada
- Runtime Fern: no disponible como enlace en la información proporcionada
