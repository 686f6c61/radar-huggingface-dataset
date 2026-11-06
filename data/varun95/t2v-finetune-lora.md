# Varun95/t2v-finetune-lora

## Resumen

`Varun95/t2v-finetune-lora` es un adaptador LoRA de bajo rango entrenado sobre el modelo de difusión texto-a-vídeo `Wan-AI/Wan2.1-T2V-1.3B-Diffusers`, desarrollado por el usuario Varun95. El adaptador no sustituye al modelo base: se inyecta sobre él en tiempo de inferencia para mejorar el seguimiento de prompts, la composición cinematográfica y la coherencia temporal en clips cortos. Al ser un LoRA (rango 64, alpha 128), el peso del adaptador ocupa solo unos cientos de MB, frente a los 1.300 millones de parámetros del backbone completo.

El modelo resuelve el problema de personalizar un generador de vídeo sin necesidad de reentrenar ni duplicar los pesos del backbone, lo que permite servir el sistema en GPUs de gama media. La model card incluye además una receta completa de despliegue (FastAPI + Cloudflare Tunnel + frontend Next.js con sondeo de estado) pensada para prototipar productos de texto-a-vídeo en menos de una hora sobre Google Colab T4.

Es relevante en el ecosistema porque demuestra el flujo de trabajo de fine-tuning LoRA sobre la familia Wan 2.1 en `diffusers`, con licencia MIT y salida por defecto de 480×832 píxeles a 49 fotogramas y 8 fps (unos 6 segundos de vídeo).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente texto-a-vídeo (backbone transformer Wan 2.1) con adaptador LoRA inyectado |
| Parámetros totales | 1.300 millones (modelo base); adaptador LoRA de unos cientos de MB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por prompt de texto, sin ventana de contexto declarada) |
| Tipos de cuantización | fp16 para inferencia; bf16 recomendado para entrenamiento (no se declaran cuantizaciones GGUF/INT8) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA compatible con `diffusers` ≥ 0.31) |

## Arquitectura y entrenamiento

El sistema es un pipeline de difusión latente estándar para texto-a-vídeo: el prompt se codifica en embeddings, se parte de latentes aleatorios `z_T` que el transformer de Wan denoising paso a paso (con el adaptador LoRA inyectado en las proyecciones de atención y FFN), y los latentes finales `z_0` se decodifican con el VAE en una secuencia de fotogramas que se muxan en un MP4. El adaptador es de rango 64 con alpha 128 y se aplica a todas las proyecciones de atención y feed-forward.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO (no aplicables de forma estándar en difusión). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La información disponible sobre el proceso de entrenamiento se limita al tipo de adaptador, su rango y la precisión recomendada (bf16).

## Capacidades

- Generación de vídeo corto a partir de texto: clips de hasta unos 6 segundos (49 fotogramas a 8 fps) en resolución 480×832.
- Mejora declarada de la adherencia al prompt y de la composición cinematográfica respecto al modelo base.
- Coherencia temporal en clips cortos.
- Condicionamiento exclusivamente textual (no se declara soporte de imagen, audio ni vídeo como entrada).
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo de difusión).
- Capacidad multilingüe limitada al inglés.
- No se declara modo de pensamiento (thinking), visión ni audio.

## Casos de uso

- Storyboarding y previsualización creativa: generar clips de 6 segundos a partir de descripciones textuales para validar una secuencia antes de producirla, aprovechando la mejora de composición cinematográfica del adaptador.
- Prototipado rápido de productos de texto-a-vídeo: la model card incluye una receta FastAPI + Cloudflare Tunnel + frontend Next.js con sondeo cada 5 segundos, lo que permite montar un servicio funcional en Google Colab T4 en menos de una hora.
- Investigación sobre fine-tuning LoRA en difusión de vídeo: el adaptador sirve como caso de estudio reproducible de inyección LoRA sobre Wan 2.1 dentro de `diffusers`.
- Generación de material de concepto para publicidad y redes sociales: clips cortos en 480×832 adecuados para formatos verticales y pruebas de concepto.
- Evaluación comparativa de adaptadores: al ser un LoRA ligero, se puede intercambiar sobre el mismo backbone para comparar estilos o prompts sin duplicar los 1.300 millones de parámetros.
- Demostraciones y docencia: el pipeline de despliegue documentado permite mostrar el ciclo completo prompt → job_id → sondeo → MP4 en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB para 480×832 a 49 fotogramas, según la model card.
- GPU recomendadas: Google Colab T4 (16 GB) como objetivo declarado; no se especifican A100, H100 ni RTX 4090 en la documentación.
- Cabe en GPU de consumo: sí, al menos en T4 de 16 GB; la model card menciona explícitamente GPUs de gama media y trucos de CPU-offloading y VAE-slicing de `diffusers`.
- Opciones de despliegue: `diffusers` ≥ 0.31 con `transformers` y `accelerate`; receta de servicio con FastAPI y Cloudflare Tunnel (`cloudflared`); frontend Next.js con sondeo de estado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión).
- Latencia y throughput: no disponibles; el frontend sondea `/status` cada 5 segundos, lo que sugiere generaciones del orden de decenas de segundos o minutos en T4, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Varun95/t2v-finetune-lora` | 1,3B (base) + LoRA | 480×832, 49 frames @ 8 fps | MIT | Hugging Face, 0 descargas |
| `Wan-AI/Wan2.1-T2V-1.3B-Diffusers` (base) | 1,3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo está marcado con `inference: false` en la model card: la generación de vídeo excede el presupuesto de la Inference API gratuita de Hugging Face y requiere ejecución local o en Colab.
- Solo soporta inglés; no se declara cobertura multilingüe.
- Salida limitada a clips de hasta unos 6 segundos y resolución máxima de 480×832; no apto para generación de más de 10 segundos ni para resoluciones superiores a 720p según la propia model card.
- Riesgo de alucinación visual y de desviación del prompt inherente a los modelos de difusión; no se documentan métricas de fidelidad.
- Uso fuera de alcance declarado: representaciones fotorrealistas de personas reales identificables sin consentimiento, contenido engañoso, difamatorio o explícito no consentido, y toma de decisiones de alto riesgo (médico, legal, vigilancia, fuerzas del orden).
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el contenido generado.
- El adaptador depende del modelo base `Wan-AI/Wan2.1-T2V-1.3B-Diffusers`; su comportamiento y licencia efectiva están condicionados por el backbone.
- Sin descargas ni likes en el momento de la ficha; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Varun95/t2v-finetune-lora
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Documentación de `WanPipeline` en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/wan
- Repositorio original de Wan 2.1: https://github.com/Wan-Video/Wan2.1
- Repositorio de diffusers: https://github.com/huggingface/diffusers
- PyTorch: https://pytorch.org/
