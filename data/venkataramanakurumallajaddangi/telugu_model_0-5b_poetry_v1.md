# VenkataRamanaKurumallajaddangi/Telugu_Model_0.5B_Poetry_V1

## Resumen

Telugu_Model_0.5B_Poetry_V1 es un checkpoint fusionado de aproximadamente 0,5 mil millones de parámetros desarrollado por VenkataRamanaKurumallajaddangi, orientado a la generación de poesía en telugu. Se construye a partir del modelo base `Telugu_Model_0.5B_V4.pt` del mismo autor, sobre el que se aplicó un adaptador LoRA entrenado específicamente para producción poética y cuyos pesos se fusionaron directamente en las capas lineales del modelo base, dando lugar a un único artefacto autónomo.

El modelo emplea una arquitectura decoder tipo GPT personalizada (clase `TeluguGPT`), con Grouped Query Attention, activación SwiGLU y embeddings posicionales rotatorios (RoPE). Los pesos se distribuyen en un fichero `.pt` de 1048,06 MB en precisión bfloat16, lo que resulta coherente con un modelo de ~0,5B parámetros en esa precisión.

Su relevancia es acotada pero específica: cubre un nicho poco atendido, la generación creativa en telugu con un modelo pequeño y desplegable en hardware modesto. No obstante, la información pública es muy escasa (sin licencia declarada, sin idiomas declarados, sin benchmarks ni pipeline en Hugging Face) y el checkpoint requiere una clase de arquitectura personalizada, por lo que no es directamente cargable con `transformers.AutoModel`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder tipo GPT personalizado (clase `TeluguGPT`), con Grouped Query Attention (GQA), SwiGLU y RoPE |
| Parámetros totales | ~0,5 mil millones (0.5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | No disponible (orientado a telugu según nombre y model card) |
| Licencia | No disponible |
| Formato de pesos | `.pt` (checkpoint PyTorch personalizado, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de estilo GPT con atención de consultas agrupadas (GQA), activación SwiGLU con tres proyecciones (w1=gate, w2=up, w3=down) y embeddings posicionales rotatorios (RoPE). El checkpoint se guarda como un fichero `.pt` que requiere una clase de arquitectura personalizada (`TeluguGPT`) y no es compatible directamente con `transformers.AutoModel`. Según la model card, `lm_head.weight` puede estar atado a `wte.weight` dependiendo del estado del modelo base, por lo que debe consultarse el bloque `config` guardado en el checkpoint (concretamente el flag `tie_weights`).

El proceso de construcción descrito consiste en partir del modelo base `Telugu_Model_0.5B_V4.pt` y fusionar en él un adaptador LoRA (`3000adapter_model .zip`) directamente en las capas lineales. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Los únicos indicios sobre datos son los conjuntos publicados por el mismo autor en Hugging Face: un dataset de 2,6 mil filas de texto (`0.5b-telugu-kavithalu`) y otro de poemas sintéticos (`Telugu-Synthetic-Poems-20k`), que podrían estar relacionados con el ajuste, aunque no se confirma en la model card.

## Capacidades

- Generación de texto en telugu, con especialización en poesía (el nombre del modelo y la model card indican un ajuste explícito para poesía telugu "evocadora").
- Generación creativa y estilística: el ajuste LoRA está orientado a producir composiciones poéticas, no a tareas generales.
- Modelo de completado/autorregresivo de propósito general limitado por su tamaño (0,5B).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el foco declarado es el telugu.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación de poesía en telugu: el modelo se puede invocar con un prompt temático (por ejemplo, una imagen o un tema) para producir versos en telugu; es su propósito declarado y el ajuste LoRA está orientado específicamente a este dominio.
- Prototipado de aplicaciones creativas en telugu: al ser un modelo de ~0,5B, permite iterar rápidamente en local con hardware modesto antes de escalar a modelos mayores.
- Herramientas educativas de lengua telugu: generación de ejemplos poéticos o estilísticos para materiales didácticos, aprovechando su especialización en registro literario.
- Generación de contenido cultural y literario: composición de poemas breves para publicaciones, blogs o redes, con revisión humana posterior dada la fiabilidad limitada de un modelo de este tamaño.
- Investigación sobre modelos pequeños en lenguas de bajos recursos: sirve como caso de estudio de ajuste LoRA fusionado en un decoder GPT personalizado para telugu.
- Experimentación con arquitecturas personalizadas: útil para quienes quieran estudiar el formato de checkpoint `.pt` con clase `TeluguGPT` y el manejo de `tie_weights`, como base para sus propios ajustes.
- Generación de variantes estilísticas: dado un poema de referencia, producir continuaciones o variaciones con el mismo tono, siempre con validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan ~1,05 GB; con overhead de activaciones y KV cache, se estima un uso de VRAM de aproximadamente 2-3 GB para contextos moderados (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 3060) debería ser suficiente para inferencia en bfloat16; GPU de datacenter (A100, H100) no son necesarias.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 4 GB o más, dado el tamaño del checkpoint.
- Opciones de despliegue: al requerir una clase personalizada (`TeluguGPT`) y no ser compatible con `transformers.AutoModel`, no se puede usar directamente con vLLM, TGI u Ollama sin trabajo de conversión; sería necesario cargar el `.pt` con PyTorch y la clase del autor, o convertir los pesos a un formato estándar (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Telugu_Model_0.5B_Poetry_V1 | ~0,5B | No disponible | No disponible | `.pt` personalizado | Hugging Face (0 descargas, 0 likes) |
| Telugu_Model_0.5B_V4 (base del mismo autor) | ~0,5B | No disponible | No disponible | `.pt` personalizado | Hugging Face |
| Otros modelos pequeños para telugu | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (generación poética en telugu con ~0,5B parámetros) en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: sin licencia declarada, sin idiomas declarados, sin pipeline en Hugging Face y sin benchmarks; esto dificulta evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; debe contactarse con el autor antes de cualquier uso productivo.
- Compatibilidad limitada: requiere una clase de arquitectura personalizada (`TeluguGPT`) y no funciona con `transformers.AutoModel`; no hay conversión documentada a GGUF/safetensors ni soporte en vLLM, TGI u Ollama.
- Riesgo de alucinación: con ~0,5B parámetros, la coherencia y fidelidad factual son limitadas; especialmente en textos largos o prompts ambiguos.
- Sesgos conocidos: no documentados; al entrenarse sobre datos de poesía telugu, puede reproducir sesgos culturales o estilísticos del corpus.
- Limitaciones de contexto e idioma: la longitud de contexto no está publicada y el modelo está orientado a telugu; su rendimiento en otros idiomas es desconocido.
- Naturaleza del artefacto: es un checkpoint fusionado (base + LoRA) sin model card detallada sobre el proceso de entrenamiento, lo que impide reproducir o auditar el ajuste.
- Sin validación externa: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay evidencia de uso o evaluación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VenkataRamanaKurumallajaddangi/Telugu_Model_0.5B_Poetry_V1
- Perfil del autor en Hugging Face: https://huggingface.co/VenkataRamanaKurumallajaddangi
- Datasets del autor: https://huggingface.co/VenkataRamanaKurumallajaddangi/datasets
- Dataset `0.5b-telugu-kavithalu`: https://huggingface.co/datasets/VenkataRamanaKurumallajaddangi/0.5b-telugu-kavithalu
- Dataset `Telugu-Synthetic-Poems-20k`: https://huggingface.co/datasets/VenkataRamanaKurumallajaddangi/Telugu-Synthetic-Poems-20k
