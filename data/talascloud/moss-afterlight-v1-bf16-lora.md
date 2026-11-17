# TalasCloud/MOSS-Afterlight-v1-BF16-LoRA

## Resumen

MOSS-Afterlight-v1-BF16-LoRA es un adaptador LoRA de precisión BF16 para el modelo base OpenMOSS-Team/MOSS-Image-SFT, un checkpoint de imagen del ecosistema MOSS. Lo publica el usuario TalasCloud y deriva del adaptador original "Afterlight" creado por alcaitiff, distribuido a través de Civitai. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo base completo, por lo que su uso requiere cargar MOSS-Image-SFT en un backend compatible con LoRA.

La relevancia de esta ficha es limitada: se trata de una publicación con cero descargas y cero interacciones, sin model card técnica detallada, sin pipeline declarado y sin información sobre idiomas o benchmarks. El autor documenta el hardware objetivo (una GPU AMD Radeon RX 580 de 8 GB y un Intel Xeon E5-2696 v3) y preserva los pesos originales byte a byte en BF16, lo que sugiere un trabajo de reempaquetado y verificación más que un entrenamiento nuevo.

La licencia es "civitai-creator-permissions", una licencia personalizada vinculada a la ficha de Civitai del adaptador original; no es una licencia open source estándar y debe revisarse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MOSS-Image-SFT; arquitectura del base no disponible |
| Parámetros totales | no disponible (tamaño del repo: 0,1 GB, solo adaptador) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos del adaptador en BF16; cuantizaciones del base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | civitai-creator-permissions (licencia personalizada, no OSI) |
| Formato de pesos | safetensors (LoRA en BF16) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones del modelo base MOSS-Image-SFT durante la inferencia. No se dispone de información sobre el rango del adaptador, las capas objetivo ni la configuración de entrenamiento (learning rate, pasos, dataset). El autor indica explícitamente que los pesos originales se conservan byte a byte con su precisión original, lo que apunta a una conversión o reempaquetado del adaptador de alcaitiff sin reentrenamiento adicional.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas asociadas al adaptador. El SHA-256 publicado (`57d2a400...b057d13`) permite verificar la integridad de la descarga, un detalle útil para reproducibilidad.

## Capacidades

- Adaptación del modelo base MOSS-Image-SFT mediante LoRA; las capacidades concretas dependen del base, cuyas especificaciones no están disponibles en la información proporcionada.
- El nombre y el contexto (Civitai, adaptador "Afterlight") sugieren un uso orientado a generación de imágenes, pero no se confirma en la documentación.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con LoRA sobre MOSS-Image-SFT: cargar el adaptador en un backend MOSS con soporte LoRA para evaluar el efecto estilístico del adaptador "Afterlight" sobre el modelo base, comparando salidas con y sin adaptador.
- Reproducción en hardware modesto: el autor valida el adaptador en una Radeon RX 580 de 8 GB con un Xeon E5-2696 v3, por lo que sirve como caso de referencia para despliegues en equipos de gama baja con backend compatible.
- Verificación de integridad de pesos: el SHA-256 publicado permite comprobar que la descarga coincide con el artefacto original, útil en pipelines de distribución de adaptadores.
- Archivado y preservación: al conservar los pesos byte a byte en BF16, el repositorio puede emplearse como copia de referencia del adaptador original de Civitai.
- Integración en flujos de generación de imagen locales: mediante el runtime de medios del autor (koboldcpp-media-pipeline), si el usuario ya utiliza ese stack.
- Evaluación comparativa de adaptadores: como punto de partida para medir diferencias cualitativas frente a otros LoRA del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador: inferior a 1 GB en BF16 (repo de 0,1 GB); la VRAM total depende del modelo base MOSS-Image-SFT, cuyo tamaño no está disponible.
- GPU validadas por el autor: AMD Radeon RX 580 2048SP (Polaris, 8 GB).
- CPU validada por el autor: Intel Xeon E5-2696 v3 (Haswell, AVX2).
- Compatibilidad con GPU consumer: sí, según el autor, en una GPU de 8 GB; no se especifican otras.
- Opciones de despliegue: backend MOSS con soporte LoRA; el autor referencia su runtime koboldcpp-media-pipeline (release v2026.11.17-r5). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Afterlight-v1-BF16-LoRA | LoRA sobre MOSS-Image-SFT | no disponible (0,1 GB el adaptador) | no disponible | civitai-creator-permissions | Hugging Face, 0 descargas |
| Adaptador original Afterlight v1.0 (alcaitiff) | LoRA sobre MOSS image checkpoints | no disponible | no disponible | según ficha de Civitai | Civitai (modelo 3016917, versión 3424873) |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base de imagen | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no estándar: "civitai-creator-permissions" remite a la ficha de Civitai del adaptador original; es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere MOSS-Image-SFT y un backend con soporte LoRA.
- Documentación mínima: sin pipeline declarado, sin idiomas, sin benchmarks y sin detalles de entrenamiento; la evaluación técnica independiente es prácticamente imposible con los datos publicados.
- Trazabilidad limitada: el autor describe el artefacto como reempaquetado byte a byte del original de alcaitiff, pero no se aportan métricas que permitan verificar equivalencia funcional más allá del hash.
- Riesgo de alucinación y sesgos: no evaluables sin información sobre el modelo base ni sobre el dataset del adaptador.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-17) en los metadatos del repositorio, lo que conviene tener en cuenta al citar el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TalasCloud/MOSS-Afterlight-v1-BF16-LoRA
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Adaptador original en Civitai: https://civitai.red/models/3016917?modelVersionId=3424873
- Runtime de medios del autor: https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
