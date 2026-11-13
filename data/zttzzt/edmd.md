# zttzzt/eDMD

## Resumen

eDMD es un adaptador LoRA de destilación para generación de imágenes por texto (text-to-image) publicado por el usuario zttzzt en Hugging Face. Su propósito es acelerar la inferencia de modelos de difusión de la familia FLUX.2 (concretamente FLUX.2-klein-base-4B y FLUX.2-klein-base-9B) reduciendo el número de pasos necesarios para generar una imagen, mediante una técnica de destilación few-step. El repositorio también referencia stable-diffusion-3-medium-diffusers como modelo base adicional, lo que sugiere compatibilidad con varios backends de difusión.

El artefacto es un LoRA de aproximadamente 0,6 GB, distribuido en la librería diffusers y etiquetado con los términos "distillation" y "few-step", lo que lo sitúa en la línea de técnicas como DMD (Distribution Matching Distillation) y sus variantes. No se trata de un modelo completo, sino de un adaptador que se aplica sobre los pesos base para modificar el comportamiento del sampler.

La relevancia de este tipo de adaptadores es práctica: los modelos de difusión de alta calidad como FLUX requieren decenas de pasos de denoising, lo que encarece la inferencia. Un LoRA de destilación few-step permite reducir ese coste manteniendo la fidelidad visual, algo crítico para despliegues en producción con requisitos de latencia. El acceso al repositorio está restringido (gated) y la licencia es "per-directory" (por directorio), lo que obliga a revisar las condiciones de cada subcarpeta antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelos de difusión FLUX.2-klein y SD3-medium; no disponible el detalle interno del adaptador |
| Parametros totales | no disponible (el repo pesa 0,6 GB; el número de parámetros del LoRA no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; la ventana de texto depende del encoder del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | per-directory (licencia por directorio; acceso restringido/gated) |
| Formato de pesos | safetensors (formato estándar de diffusers para LoRA); no se detalla explícitamente en la información proporcionada |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del adaptador ni el procedimiento de entrenamiento más allá de las etiquetas "distillation" y "few-step" y la referencia al paper arXiv:2611.17194. Por la nomenclatura "eDMD" y el contexto de destilación few-step, cabe situarlo en la familia de métodos de destilación por matching de distribuciones (DMD y variantes), que entrenan un estudiante para igualar la distribución de salida de un profesor con muy pocos pasos de muestreo. No obstante, no se confirma en la información proporcionada el número exacto de pasos objetivo, el dataset de entrenamiento, ni si se empleó RLHF/DPO (no aplicable habitualmente en difusión, pero no verificable aquí).

El adaptador se declara compatible con tres modelos base: stabilityai/stable-diffusion-3-medium-diffusers, black-forest-labs/FLUX.2-klein-base-4B y black-forest-labs/FLUX.2-klein-base-9B. Esto implica que el LoRA modula las capas de atención/cross-attention de dichos modelos, aunque no se especifica qué módulos concretos se adaptan ni el rango del LoRA. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline de diffusers.
- Aceleración de la inferencia few-step: el adaptador está diseñado para reducir el número de pasos de denoising respecto al modelo base.
- Compatibilidad con múltiples modelos base de la familia FLUX.2-klein (4B y 9B) y con SD3-medium.
- Integración con la librería diffusers, lo que permite cargarlo como LoRA sobre el pipeline base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio ni modo thinking (no aplicables a un adaptador de difusión).
- Capacidades multilingües: no disponibles; dependen del encoder de texto del modelo base.

## Casos de uso

- Prototipado rápido de imágenes en entornos de desarrollo: al reducir los pasos de muestreo, permite iterar sobre prompts con menor latencia antes de fijar una configuración final.
- Generación de imágenes en producción con restricciones de latencia: adecuado para servicios donde cada segundo de inferencia impacta en coste, aplicando el LoRA sobre FLUX.2-klein-4B para obtener imágenes en pocos pasos.
- Aplicaciones interactivas (editores gráficos, herramientas de diseño): la inferencia few-step facilita la respuesta casi en tiempo real al cambiar prompts o parámetros.
- Generación por lotes (batch) de assets visuales: menor coste por imagen al necesitar menos pasos de denoising, útil para pipelines de contenido automatizado.
- Investigación en destilación de modelos de difusión: sirve como referencia práctica para comparar técnicas few-step sobre FLUX.2-klein y SD3-medium.
- Despliegue en hardware con VRAM limitada: al ser un LoRA de 0,6 GB, se suma al modelo base sin duplicar pesos completos, lo que facilita su uso junto a FLUX.2-klein-4B en GPUs de gama alta consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base. FLUX.2-klein-4B requiere aproximadamente entre 12 y 16 GB en fp16/bf16 según configuración, y el LoRA añade un coste marginal (~0,6 GB en disco).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base 4B, se orienta a GPUs con 16 GB o más (RTX 4090, A100, H100); el modelo base 9B exige más VRAM.
- ¿Cabe en consumer GPU?: probablemente sí con FLUX.2-klein-4B en GPUs de 16-24 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: diffusers (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión en la mayoría de casos).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eDMD (este) | LoRA de destilación few-step | no disponible (repo 0,6 GB) | no aplica | per-directory (gated) | Hugging Face, acceso restringido |
| FLUX.2-klein-base-4B | Modelo base de difusión | 4B | no aplica | no disponible | Hugging Face |
| FLUX.2-klein-base-9B | Modelo base de difusión | 9B | no aplica | no disponible | Hugging Face |
| stable-diffusion-3-medium | Modelo base de difusión | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con otras técnicas de destilación few-step.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia "per-directory": las condiciones pueden variar según la subcarpeta; es imprescindible revisarlas antes de cualquier uso comercial.
- No se documentan sesgos conocidos, pero al ser un adaptador sobre modelos de difusión hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Riesgo de degradación de calidad visual al reducir el número de pasos; no se aportan métricas que cuantifiquen dicha degradación.
- Idiomas soportados no disponibles; la cobertura lingüística depende del encoder de texto del modelo base.
- No se especifican requisitos exactos de hardware ni compatibilidad con cuantizaciones, lo que dificulta planificar un despliegue en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zttzzt/eDMD
- Paper referenciado (arXiv:2611.17194): https://arxiv.org/abs/2611.17194
- Modelo base FLUX.2-klein-base-4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Modelo base FLUX.2-klein-base-9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B
- Modelo base SD3-medium: https://huggingface.co/stabilityai/stable-diffusion-3-medium-diffusers
