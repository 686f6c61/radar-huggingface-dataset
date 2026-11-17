# TalasCloud/Stable-Audio-3-Small-SFX-DiT-GSQ-RCO-GGUF

## Resumen

Stable Audio 3 Small SFX es un modelo de generación de efectos de sonido a partir de texto desarrollado por Stability AI. Esta ficha concreta, publicada por el usuario TalasCloud, no es el modelo original sino una conversión a formato GGUF calibrada para ejecución local en hardware modesto. El modelo base emplea una arquitectura DiT (Diffusion Transformer) y está especializado en la síntesis de efectos de sonido (SFX), no en música ni en voz hablada.

La relevancia de esta variante radica en su enfoque de despliegue: el autor la ha calibrado específicamente para un AMD Radeon RX 580 2048SP (Polaris, 8 GB) y un Intel Xeon E5-2696 v3 (Haswell, AVX2), con un runtime propio (sa3.cpp) que ejecuta la generación en CPU. Esto la sitúa en el nicho de la generación de audio local sin GPU moderna, algo poco habitual en modelos de difusión de audio.

El repositorio ocupa 0,5 GB y contiene pesos en Q8_0 y Q6_K junto con tensores en F32 y F16. El modelo requiere componentes adicionales no incluidos: el códec SAME-S y el codificador T5Gemma. La licencia es la Stability AI Community License, no una licencia open source estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con conditioner T5Gemma |
| Parametros totales | 198.144 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K (más tensores F32 y F16 sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | stability-ai-community-license |
| Formato de pesos | GGUF (layout: Q8_0 × 152, Q6_K × 20, F32 × 245, F16 × 20) |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer (DiT) para generación de audio condicionada por texto. La conversión GGUF mantiene el DiT y el conditioner original, e incluye un calibrado GSQ (Vulkan) sobre 172 proyecciones matriciales, con retención de los tensores Q8_0 y Q6_K junto a los tensores en coma flotante originales. El fichero del conditioner no se modifica respecto al original.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor reporta una métrica de error de proyección que baja de 9307 a 8950 sobre la carga de trabajo registrada, un dato específico de esta calibración y no comparable con métricas estándar de calidad de audio. La inferencia depende de un runtime propio (sa3.cpp) y de componentes externos (códec SAME-S y encoder T5Gemma) que no forman parte del repositorio.

## Capacidades

- Generación de efectos de sonido (SFX) a partir de descripciones textuales.
- Especialización en SFX: no está orientado a música ni a voz hablada según la denominación del modelo base.
- Ejecución local en CPU (Haswell, AVX2) mediante el runtime sa3.cpp.
- Compatibilidad declarada con koboldcpp como etiqueta de ecosistema.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Diseño de sonido para videojuegos indie: generar efectos puntuales (impactos, pasos, ambientes) a partir de prompts de texto en una estación de trabajo sin GPU dedicada moderna, aprovechando la ejecución en CPU.
- Prototipado rápido de SFX en pipelines de postproducción: crear variantes de un efecto antes de grabarlo o sintetizarlo con herramientas profesionales, reduciendo el coste de iteración inicial.
- Sustitución de placeholders en edición de vídeo: rellenar pistas temporales con efectos generados localmente mientras se espera el material definitivo.
- Generación de audio para experiencias interactivas: producir efectos bajo demanda en aplicaciones de escritorio con hardware antiguo, dado el objetivo de despliegue en RX 580 y Xeon Haswell.
- Investigación en cuantización de modelos de difusión de audio: usar esta conversión como referencia para estudiar el impacto de Q8_0/Q6_K y la calibración GSQ en la calidad de salida.
- Entornos con restricciones de conectividad: generar SFX sin depender de servicios en la nube, ya que todo el pipeline se ejecuta en local.
- Docencia y experimentación: demostrar generación de audio por difusión en equipos de bajo coste con el runtime sa3.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico reportado es la métrica de error de proyección de la calibración (de 9307 a 8950), que es específica del proceso de cuantización y no una medida de calidad perceptual del audio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el sistema objetivo es una GPU AMD Radeon RX 580 2048SP con 8 GB, aunque la generación se ejecuta en CPU según la model card.
- GPU recomendadas: AMD Radeon RX 580 2048SP (Polaris) como objetivo declarado; no se documentan otras.
- CPU: Intel Xeon E5-2696 v3 (Haswell, AVX2) como plataforma de referencia.
- Cabe en GPU consumer: sí, según el objetivo declarado (8 GB), si bien la inferencia se realiza en CPU con sa3.cpp.
- Opciones de despliegue: runtime sa3.cpp y el pipeline koboldcpp-media-pipeline del autor; compatible con la etiqueta koboldcpp.
- Dependencias externas: códec SAME-S y encoder T5Gemma, no incluidos en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TalasCloud/Stable-Audio-3-Small-SFX-DiT-GSQ-RCO-GGUF | 198.144 (según safetensors) | no disponible | GGUF (Q8_0, Q6_K) | stability-ai-community-license | Conversión calibrada para RX 580 y CPU Haswell |
| stabilityai/stable-audio-3-small-sfx | no disponible | no disponible | safetensors (original) | stability-ai-community-license | Modelo base oficial de Stability AI |
| thepatch/stable-audio-3-small-sfx-GGUF | no disponible | no disponible | GGUF | no disponible | Conversión GGUF de entrada usada por esta variante |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos de generación de SFX.

## Limitaciones y advertencias

- El repositorio no incluye el códec SAME-S ni el encoder T5Gemma, necesarios para la inferencia; sin ellos el modelo no es funcional por sí solo.
- La licencia Stability AI Community License no es open source estándar; conviene revisar sus términos antes de cualquier uso comercial.
- La calibración está optimizada para un hardware muy concreto (RX 580 y Xeon Haswell); el rendimiento en otras plataformas no está documentado.
- El modelo está especializado en efectos de sonido; no debe esperarse calidad musical ni síntesis de voz.
- No hay información sobre sesgos, tasas de alucinación ni calidad perceptual de las muestras generadas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de validación por la comunidad.
- El número de parámetros reportado (198.144) es inusualmente bajo para un DiT de audio y podría corresponder a un recuento parcial o a una particularidad del empaquetado; no se ha podido verificar.
- Idiomas soportados no declarados; se desconoce si los prompts en castellano funcionan correctamente.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/TalasCloud/Stable-Audio-3-Small-SFX-DiT-GSQ-RCO-GGUF
- Modelo base oficial: https://huggingface.co/stabilityai/stable-audio-3-small-sfx
- Licencia del modelo base: https://huggingface.co/stabilityai/stable-audio-3-small-sfx/blob/main/LICENSE.md
- Conversión GGUF de entrada (thepatch): https://huggingface.co/thepatch/stable-audio-3-small-sfx-GGUF/tree/fcbd756cde8f9cc4d0213433d868063593d6ca22
- Runtime de medios (koboldcpp-media-pipeline): https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
- Método de calibración y datos de pruebas: https://github.com/aktalascloud/gguf-converter/blob/v1.9.0/benchmarks/2026-11-17-whole-gsq-rco-rx580.json
