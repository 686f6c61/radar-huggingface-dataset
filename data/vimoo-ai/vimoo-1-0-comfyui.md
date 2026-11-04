# Vimoo-AI/Vimoo-1.0-ComfyUI

## Resumen

Vimoo-1.0-ComfyUI es el paquete de pesos para ComfyUI de la familia Vimoo 1.0, un conjunto de modelos de generación de vídeo desarrollado por Vimoo-AI. Incluye los modelos texto-a-vídeo (T2V) e imagen-a-vídeo (I2V) de aproximadamente 11.700 millones de parámetros cada uno, junto con sus variantes destiladas (Distilled) para inferencia acelerada. Los modelos comparten los codificadores de texto y el VAE, y se distribuyen en formato safetensors bf16 para su uso con el nodo personalizado ComfyUI-Vimoo.

El modelo resuelve la tarea de síntesis de vídeo condicionada por texto o por imagen, integrándose en el ecosistema ComfyUI mediante nodos y plantillas de flujo de trabajo. Su relevancia radica en que ofrece pesos abiertos bajo licencia Apache 2.0 para una tarea habitualmente dominada por modelos cerrados, y en que incluye variantes destiladas con LoRA que reducen el coste de muestreo.

La información disponible en la model card es fundamentalmente de instalación y estructura de archivos: no se detallan la arquitectura interna, el volumen de datos de entrenamiento ni resultados de evaluación. El repositorio ocupa 114,6 GB e incluye codificadores Qwen2.5-VL 7B, Glyph-ByT5, SigLIP SO400M y un VAE derivado de Wan 2.2 TI2V.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo; componentes auxiliares: codificador Qwen2.5-VL 7B, Glyph-ByT5, SigLIP SO400M, VAE Wan 2.2 TI2V) |
| Parametros totales | ~11,7 mil millones por modelo (T2V e I2V) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos principales); fp32 (Glyph-ByT5 y VAE); fp16 (SigLIP); no se documentan cuantizaciones GGUF/INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (+ archivos de metadatos `.vimoo.json` y `.json`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del difusor más allá de su naturaleza como modelo de generación de vídeo. Se sabe que el sistema se compone de un modelo de difusión principal (T2V o I2V, ~11,7B parámetros) que consume representaciones de texto producidas por dos codificadores: Qwen2.5-VL 7B (bf16) y Glyph-ByT5 (fp32). Para I2V se añade un codificador visual SigLIP SO400M (fp16), y la decodificación a píxeles se realiza con un VAE denominado `wan22_ti2v_vae` en fp32, lo que sugiere una base derivada de Wan 2.2 TI2V.

Las variantes Distilled incorporan una LoRA específica (`vimoo_v1_t2v_distilled_lora_bf16` y `vimoo_v1_i2v_distilled_lora_bf16`) que presumiblemente reduce el número de pasos de muestreo, aunque el número exacto de pasos no se especifica. No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. Los flujos de trabajo por defecto usan PyTorch SDPA, con soporte opcional para FA2, FA3, FA4 y SageAttention.

## Capacidades

- Generación de vídeo a partir de texto (T2V) con el modelo `vimoo_v1_t2v_bf16`.
- Generación de vídeo a partir de una imagen de entrada (I2V) con `vimoo_v1_i2v_bf16`, usando el codificador SigLIP para condicionamiento visual.
- Variantes destiladas (T2V Distilled e I2V Distilled) con LoRA asociada para muestreo acelerado.
- Integración nativa con ComfyUI mediante nodos y plantillas de flujo de trabajo del repositorio ComfyUI-Vimoo.
- Soporte de varios backends de atención (SDPA por defecto; FA2, FA3, FA4 y SageAttention opcionales) configurables en el nodo Vimoo Performance Options.
- Codificación de texto multilingüe potencial a través de Qwen2.5-VL y Glyph-ByT5, aunque los idiomas soportados no se documentan.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio.

## Casos de uso

- Generación de clips publicitarios: usar T2V con prompts descriptivos para producir vídeo de producto o marca, aprovechando la licencia Apache 2.0 para uso comercial sin restricciones de atribución adicionales.
- Animación de imágenes fijas: I2V permite convertir fotografías, ilustraciones o renders en secuencias de vídeo, útil en previsualización de storyboards y animática.
- Prototipado rápido en estudios de vídeo: las variantes Distilled reducen el coste de muestreo y permiten iterar sobre prompts dentro de ComfyUI antes de lanzar la generación completa con el modelo base.
- Creación de contenido para redes sociales: pipelines en ComfyUI que encadenan el nodo Vimoo con post-procesado para generar clips cortos a partir de texto o de una imagen de referencia.
- Previsualización de efectos visuales: I2V sobre placas o keyframes para estimar movimiento de cámara y composición antes de la producción final.
- Investigación en generación de vídeo: al ser pesos abiertos en safetensors, permite estudiar el comportamiento del difusor, comparar variantes base y destilada, y experimentar con distintos backends de atención.
- Docencia y formación: despliegue en laboratorios con GPU NVIDIA CUDA para demostrar pipelines de difusión de vídeo en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con pesos bf16 de ~11,7B parámetros por modelo, el difusor ronda los 23 GB solo en pesos, a los que se suman los codificadores (Qwen2.5-VL 7B en bf16, Glyph-ByT5 en fp32, SigLIP en fp16) y el VAE en fp32, por lo que se requiere una GPU de gama alta con memoria amplia.
- GPU recomendadas: no especificadas por el autor; el requisito documentado es una GPU NVIDIA con CUDA. Por volumen de memoria, son razonables A100/H100 de 80 GB; no se confirma el funcionamiento en RTX 4090 de 24 GB.
- Cabe en GPU de consumo: no confirmado; el tamaño conjunto de pesos y codificadores hace improbable un despliegue completo en 24 GB sin cuantización, que no está documentada.
- Software: ComfyUI 0.34.0 o superior, Python 3.10+, PyTorch 2.9.0 con CUDA 13.0 (cu130), torchvision 0.24.0 y torchaudio 2.9.0; driver NVIDIA compatible con CUDA 13.0.
- Despliegue: nodos ComfyUI-Vimoo y ejemplos de inferencia con Diffusers (entornos separados por conflicto de dependencias de Transformers).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Vimoo-1.0 T2V / I2V | ~11,7B por modelo | Generación de vídeo T2V e I2V | Apache 2.0 | Pesos en HuggingFace, nodos ComfyUI |
| Vimoo-1.0-Lite | no disponible | Generación de vídeo (versión ligera) | no disponible | Repositorio Vimoo-1.0-Lite-ComfyUI |
| Wan 2.2 TI2V | no disponible | Generación de vídeo | no disponible | Referenciado indirectamente por el VAE |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación visual ni limitaciones de idioma; deben evaluarse empíricamente antes de producción.
- No se especifican la resolución, duración ni relación de aspecto de los vídeos generados, lo que dificulta planificar pipelines.
- El requisito de CUDA 13.0 y PyTorch 2.9.0 limita el despliegue a entornos relativamente recientes y a hardware NVIDIA; no se menciona soporte para ROCm, Apple MLX (existe un repositorio Vimoo-1.0-MLX separado) ni CPU.
- Los entornos de ComfyUI y Diffusers deben mantenerse separados por conflictos de dependencias de Transformers, lo que añade complejidad operativa.
- Los archivos `.vimoo.json` deben permanecer junto a los pesos; su ausencia puede impedir que los nodos detecten tareas y ajustes de muestreo.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan términos adicionales de los componentes de terceros (Qwen2.5-VL, Glyph-ByT5, SigLIP, VAE Wan 2.2) que podrían tener licencias propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.

## Enlaces

- HuggingFace: https://huggingface.co/Vimoo-AI/Vimoo-1.0-ComfyUI
- Repositorio ComfyUI-Vimoo: https://github.com/Vimoo-AI/ComfyUI-Vimoo
- Repositorio Vimoo-1.0: https://github.com/Vimoo-AI/Vimoo-1.0
- Repositorio Vimoo-1.0-MLX: https://github.com/Vimoo-AI/Vimoo-1.0-MLX
- Modelos Lite: https://huggingface.co/Vimoo-AI/Vimoo-1.0-Lite-ComfyUI
- Documentación de opciones de rendimiento: https://github.com/Vimoo-AI/ComfyUI-Vimoo/blob/main/docs/performance.md
- Informe técnico: https://vimoo.ai/research
- Sitio web: https://vimoo.ai
- Organización en HuggingFace: https://huggingface.co/Vimoo-AI
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
