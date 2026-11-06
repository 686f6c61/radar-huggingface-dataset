# subs-king/zils-mini-coco-2.4-4b

## Resumen

Zils d3-mini soup body: CoCo-Decision-2.4-4B es un reempaquetado del modelo corners-ai/CoCo-Decision-2.4-4B, publicado por el usuario subs-king para su uso como "soup body" dentro de la subred Zils (Bittensor SN127), en el pool `d3-mini`. No se trata de un modelo entrenado desde cero ni de un fine-tuning con datos nuevos: los pesos del modelo de lenguaje son los originales, sin modificar, y el trabajo del autor se limita a adaptar la disposición de tensores y shards al formato que exige la infraestructura de Zils, además de incorporar una torre de visión procedente de Qwen/Qwen3.5-4B.

El modelo cuenta con 4.539.265.536 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 4B. El repositorio ocupa 9,1 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo original. La model card es extremadamente escueta y no documenta arquitectura interna, contexto, idiomas ni proceso de entrenamiento, por lo que buena parte de las especificaciones técnicas deben marcarse como no disponibles.

Su relevancia es acotada: se trata de un artefacto de infraestructura para un ecosistema concreto (Bittensor SN127) más que de un modelo de propósito general con benchmarks publicados. Resulta útil para quienes participan en ese pool o necesitan reproducir el layout exacto del body de Zils, pero no aporta mejoras de capacidad respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base corners-ai/CoCo-Decision-2.4-4B; layout de body para Zils con torre de visión de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base (tipo de transformer, número de capas, dimensiones ocultas, mecanismo de atención). Lo único documentado es que el repositorio reempaqueta corners-ai/CoCo-Decision-2.4-4B en la revisión `64ce98c8b3a2661362ff6213bc350c26124247ea` y que los pesos del modelo de lenguaje son los originales, sin cambios. Los tensores `lm_head` y `mtp` no se incluyen en este export.

El cambio principal respecto al original es la incorporación de la torre de visión de Qwen/Qwen3.5-4B en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, requerida por el layout del body de Zils, junto con la renumeración de tensores y la reorganización de shards. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, ni en este repositorio ni en la información proporcionada sobre el modelo base. Tampoco se indica ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y modelado de lenguaje, heredados del modelo base CoCo-Decision-2.4-4B, si bien las capacidades concretas no están documentadas.
- Procesamiento de visión: el repositorio incluye la torre de visión de Qwen/Qwen3.5-4B, aunque la model card no especifica tareas multimodales soportadas ni formato de entrada de imagen.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Participación en el pool `d3-mini` de la subred Zils (Bittensor SN127): el modelo está empaquetado específicamente para encajar en el layout de body que exige esta infraestructura, por lo que su uso principal es servir como cuerpo dentro de ese pool.
- Reproducción de experimentos de Zils: al fijarse la revisión exacta del modelo base y de la torre de visión, permite reproducir el entorno de evaluación del pool con un artefacto versionado.
- Investigación sobre pipelines multimodales con torre de visión intercambiable: la combinación de pesos de lenguaje de un modelo con la torre de visión de Qwen3.5-4B es útil para estudiar cómo se acoplan componentes de distintos orígenes en un layout unificado.
- Pruebas de integración de infraestructura: sirve para validar cargadores, sharding y nombres de tensores en sistemas que esperan el formato de body de Zils antes de desplegar modelos definitivos.
- Experimentación con modelos de ~4,5B parámetros en entornos con recursos moderados: el tamaño permite inferencia en GPUs de gama alta de consumo, aunque las capacidades reales dependen del modelo base.
- Auditoría de licencias y procedencia de pesos: al incluir los ficheros de licencia originales y documentar las revisiones exactas, facilita tareas de trazabilidad en despliegues que exigen cumplimiento Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (4,54B parámetros), en FP16 serían necesarios en torno a 9 GB solo para pesos, y en cuantizaciones de 8 bits o 4 bits aproximadamente 4,5 GB y 2,3 GB respectivamente, sin contar overhead de activaciones ni caché KV.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, cabría esperar funcionamiento en GPUs con 16-24 GB de VRAM o más, pero no está verificado por el autor.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos como RTX 4090 o RTX 3090 en cuantización, pero no hay confirmación oficial ni se publican pesos cuantizados.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama, TGI, etc.). El formato safetensors y la ausencia de `lm_head` en el export pueden requerir adaptaciones en cargadores estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Zils d3-mini soup body (este) | 4,54B | no disponible | Apache 2.0 | Reempaquetado para Zils SN127; sin benchmarks |
| corners-ai/CoCo-Decision-2.4-4B | no disponible | no disponible | no disponible en la informacion | Modelo base original; pesos de lenguaje idénticos |
| Qwen/Qwen3.5-4B | no disponible | no disponible | no disponible en la informacion | Origen de la torre de visión incorporada |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a procedencia y licencia.

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Al no incluir los tensores `lm_head` ni `mtp`, el repositorio puede no ser cargable directamente con pipelines estándar sin ajustes.
- No se han publicado benchmarks ni evaluaciones de calidad; se desconoce el rendimiento real frente al modelo base.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al heredar los pesos del modelo base, arrastra los sesgos de este, que tampoco se describen.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los ficheros de licencia originales incluidos y la procedencia de la torre de visión de Qwen3.5-4B.
- El modelo está pensado para un ecosistema muy específico (Bittensor SN127, pool `d3-mini`); su uso fuera de ese contexto no está validado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/subs-king/zils-mini-coco-2.4-4b
- Modelo base: https://huggingface.co/corners-ai/CoCo-Decision-2.4-4B
- Torre de visión: https://huggingface.co/Qwen/Qwen3.5-4B
