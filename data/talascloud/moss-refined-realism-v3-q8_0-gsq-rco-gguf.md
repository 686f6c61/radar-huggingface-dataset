# TalasCloud/MOSS-Refined-Realism-v3-Q8_0-GSQ-RCO-GGUF

## Resumen

MOSS Refined Realism v3 Q8_0 GSQ-RCO GGUF es una cuantización en formato GGUF del checkpoint de difusión Refined Realism v3.0, un modelo de texto a imagen ajustado a partir de OpenMOSS-Team/MOSS-Image-SFT. Lo publica el usuario TalasCloud y está pensado específicamente para ejecutarse en hardware modesto mediante koboldcpp y su pipeline multimedia, con un objetivo declarado de Windows sobre una AMD Radeon RX 580 de 8 GB (arquitectura Polaris) y un Intel Xeon E5-2696 v3.

El modelo conserva la arquitectura de difusión del checkpoint original, pero sus pesos se han convertido de BF16 a Q8_0 (185 tensores cuantizados, 193 en F32) y se han calibrado con una variante de cuantización GSQ/RCO sobre Vulkan. Según la model card, el error de proyección medido bajó de 9209 a 8958 en la carga de trabajo registrada, una métrica de calibración específica del modelo y no un benchmark de calidad de imagen.

Su relevancia es acotada pero clara: demuestra que es posible ejecutar un modelo de difusión de unos 5.080 millones de parámetros en una GPU de consumo de gama baja con 8 GB de VRAM, siempre que se use el runtime adecuado y el pack completo de codificador de texto, tokenizer y VAE compatible con MOSS. No es un modelo de lenguaje ni un modelo multimodal conversacional, sino un generador de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto a imagen (base OpenMOSS-Team/MOSS-Image-SFT); detalles internos de la arquitectura no disponibles |
| Parametros totales | 5.082.308.608 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la ventana relevante es la del codificador de texto, no especificada) |
| Tipos de cuantizacion | Q8_0 (185 tensores) y F32 (193 tensores) |
| Idiomas soportados | No disponible (el prompt de texto depende del codificador de texto MOSS, no especificado) |
| Licencia | civitai-creator-permissions (etiquetada como "other") |
| Formato de pesos | GGUF (calibrado con Vulkan GSQ/RCO) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Refined Realism v3.0 8-step de oreolove, a su vez derivado de OpenMOSS-Team/MOSS-Image-SFT. Se trata por tanto de un modelo de difusión para generación de imágenes a partir de texto, con un pipeline de 8 pasos de muestreo según la model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card del cuantizador no los detalla.

La innovación técnica destacable está en el proceso de cuantización: los pesos originales en BF16 se convirtieron a Q8_0 GGUF y se calibraron con GSQ/RCO sobre Vulkan, reteniendo cambios de proyección que redujeron el error medido. El autor documenta el método y los datos de la prueba en un repositorio de GitHub (gguf-converter v1.9.0). El resultado es un archivo de 5,4 GB que cabe en 8 GB de VRAM y se ejecuta sobre la RX 580 mediante el runtime multimedia de koboldcpp.

## Capacidades

- Generación de imágenes a partir de prompts de texto mediante un pipeline de difusión de 8 pasos.
- Ejecución en GPU de gama baja con Vulkan: el autor la valida en una AMD Radeon RX 580 2048SP de 8 GB.
- Compatibilidad con koboldcpp y el media runtime del autor (versión v2026.11.17-r5).
- Requiere un codificador de texto, tokenizer y VAE compatibles con MOSS, que no se incluyen en el repo.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni capacidades multilingües declaradas.
- El modelo está etiquetado como "not-for-all-audiences", lo que sugiere contenido para adultos en su ajuste.

## Casos de uso

- Generación de imágenes en equipos con GPU de 8 GB: el formato Q8_0 y la calibración Vulkan permiten ejecutar el modelo en una RX 580 sin necesidad de GPU profesional, usando koboldcpp como runtime.
- Prototipado de pipelines de texto a imagen en local: útil para desarrolladores que quieran validar un flujo de difusión completo (codificador de texto, tokenizer, VAE y diffuser) sin depender de servicios en la nube.
- Pruebas de cuantización y calibración: sirve como caso de estudio reproducible para evaluar el impacto de GSQ/RCO en la calidad de imagen frente al checkpoint BF16 original.
- Integración en herramientas de creación de contenido para adultos: el etiquetado "not-for-all-audiences" y el ajuste de realismo apuntan a este uso, siempre que se respete la licencia civitai-creator-permissions.
- Benchmarking de hardware antiguo: permite medir latencia y throughput de un modelo de 5.080 millones de parámetros en Polaris y Haswell, con datos de error de proyección documentados por el autor.
- Despliegue en entornos Windows sin CUDA: al usar Vulkan, es una alternativa para estaciones de trabajo con GPU AMD que no pueden aprovechar stacks basados en CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible. El único dato numérico aportado por el autor es una métrica interna de calibración: el error de proyección pasó de 9209 a 8958 en la carga de trabajo registrada, comparando el candidato inicial con todas las proyecciones frente al archivo final. Esta cifra no es comparable con benchmarks estándar y no debe interpretarse como una medida de calidad visual.

## Requisitos de hardware

- VRAM estimada: inferior a 8 GB para el diffuser en Q8_0, dado que el autor lo ejecuta en una RX 580 de 8 GB. El tamaño del repo es de 5,4 GB.
- GPU validadas por el autor: AMD Radeon RX 580 2048SP (Polaris, 8 GB) sobre Vulkan.
- CPU de referencia: Intel Xeon E5-2696 v3 (Haswell, AVX2).
- Sistema operativo objetivo: Windows.
- Cabe en GPU de consumo de gama baja con 8 GB; no se documenta compatibilidad con otras GPU (NVIDIA, Intel) ni con CUDA, ROCm o Metal.
- Opciones de despliegue: koboldcpp con el media runtime del autor (v2026.11.17-r5). No se mencionan vLLM, llama.cpp estándar, Ollama ni TGI, que además no son aplicables a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS Refined Realism v3 Q8_0 GSQ-RCO | 5.082.308.608 | GGUF Q8_0 + F32 | 8 pasos de muestreo | civitai-creator-permissions | Hugging Face (TalasCloud) |
| Refined Realism v3.0 8-step (BF16) | No disponible | BF16 | 8 pasos de muestreo | No disponible | Civitai (oreolove) |
| OpenMOSS-Team/MOSS-Image-SFT | No disponible | No disponible | No disponible | No disponible | Hugging Face (OpenMOSS-Team) |

No se dispone de datos de rendimiento comparables entre estas variantes, por lo que la comparativa se limita a formato, origen y licencia.

## Limitaciones y advertencias

- El modelo está etiquetado como "not-for-all-audiences"; su ajuste de realismo y el ecosistema Civitai sugieren contenido para adultos. Requiere moderación si se usa en productos de consumo.
- La licencia civitai-creator-permissions impone condiciones específicas del creador original; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial.
- No se incluyen codificador de texto, tokenizer ni VAE en el repo; sin ellos el modelo no es funcional.
- La compatibilidad está validada únicamente en Windows con RX 580 y Vulkan mediante el runtime del autor; otros backends no están documentados.
- El único dato de calidad es una métrica interna de error de proyección (9209 a 8958), no un benchmark de calidad de imagen; no hay evidencia pública de fidelidad visual frente al BF16.
- Riesgo de sesgos y de alucinación visual (artefactos, anatomía incorrecta, texto ilegible) inherente a los modelos de difusión; no se documentan evaluaciones al respecto.
- El repo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente.
- No hay información sobre idiomas soportados en los prompts ni sobre el rendimiento del codificador de texto MOSS.

## Enlaces

- Hugging Face: https://huggingface.co/TalasCloud/MOSS-Refined-Realism-v3-Q8_0-GSQ-RCO-GGUF
- Modelo base en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Checkpoint original en Civitai: https://civitai.red/models/3013588?modelVersionId=3457856
- Runtime multimedia (koboldcpp-media-pipeline v2026.11.17-r5): https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
- Método de calibración y datos de la prueba: https://github.com/aktalascloud/gguf-converter/blob/v1.9.0/benchmarks/2026-11-17-whole-gsq-rco-rx580.json
- Enlace de licencia: https://civitai.red/models/3013588?modelVersionId=3457856
