# SvalTek/LFM2-OldThinker-8B-Base

## Resumen

LFM2-OldThinker-8B-Base es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por SvalTek bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tuning) en FP16 del modelo SvalTek/LFM2-A1B-OldThinker-8B-BaseCS, que a su vez deriva de la familia LFM2 (Liquid AI Foundation Models). El modelo cuenta con 8.467.856.832 parámetros totales según los pesos en safetensors y está etiquetado con la arquitectura `lfm2_moe` en el ecosistema Transformers.

El modelo está orientado a generación de texto conversacional en inglés y se distribuye con soporte para text-generation-inference y Transformers. El entrenamiento del ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, lo que según el autor permitió un entrenamiento 2x más rápido. Su relevancia radica en ser una variante comunitaria de la arquitectura LFM2 MoE, con licencia permisiva para uso comercial.

La información pública disponible es limitada: la model card no incluye detalles sobre datos de entrenamiento, benchmarks ni configuración de cuantización. El repositorio ocupa 17.0 GB, coherente con pesos en FP16 (aproximadamente 2 bytes por parámetro). El modelo registra 68 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | lfm2_moe (mezcla de expertos, transformer) |
| Parámetros totales | 8.467.856.832 (~8,47 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `lfm2_moe`, una variante de mezcla de expertos de la familia LFM2 de Liquid AI, integrada en Transformers. Al tratarse de un modelo MoE, solo un subconjunto de parámetros se activa por token, aunque el número exacto de parámetros activos no se especifica en la información disponible. Los pesos se publican en FP16 (16 bits), lo que explica el tamaño del repositorio de 17 GB para 8,47 mil millones de parámetros.

El ajuste fino se realizó partiendo de SvalTek/LFM2-A1B-OldThinker-8B-BaseCS y se llevó a cabo con Unsloth y TRL, según indica la model card. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de lo inherente a la arquitectura LFM2.

## Capacidades

- Generación de texto en inglés con formato conversacional.
- Ajuste fino orientado a conversación (etiqueta `conversational`).
- Compatible con text-generation-inference y Transformers.
- Soporte de pesos en safetensors para carga directa.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma.

## Casos de uso

- Generación de texto conversacional en inglés: el modelo puede emplearse como base para asistentes de chat en aplicaciones donde se requiera un modelo de ~8,5 mil millones de parámetros con licencia permisiva.
- Ajuste fino adicional: al ser un modelo base (sufijo Base) con licencia Apache 2.0, puede servir como punto de partida para fine-tunings específicos de dominio en inglés.
- Prototipado de investigación: útil para experimentar con la arquitectura lfm2_moe y comparar comportamientos frente a transformers densos de tamaño similar.
- Generación de contenido en inglés: redacción de borradores, resúmenes y texto genérico en entornos de desarrollo con requisitos de licencia permisiva.
- Despliegue en infraestructura propia: al publicarse en safetensors y ser compatible con TGI, puede servirse en clústeres con GPUs de memoria suficiente.
- Evaluación comparativa de arquitecturas MoE: sirve como referencia comunitaria para medir el comportamiento de variantes LFM2 ajustadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 17 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8,5-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4,5-5 GB para pesos (si se generan pesos GGUF/AWQ, no disponibles en el repo).
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16; RTX 4090 (24 GB) puede alojar FP16 con contextos limitados.
- GPUs de consumo: RTX 3090/4090 (24 GB) viables en FP16 con contexto moderado; GPUs de 16 GB requerirían cuantización.
- Opciones de despliegue: Transformers, text-generation-inference (TGI); el uso con vLLM, llama.cpp u Ollama requeriría conversión a los formatos correspondientes, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2-OldThinker-8B-Base (este) | 8,47 B (MoE) | no disponible | Apache 2.0 | Hugging Face, 68 descargas |
| SvalTek/LFM2-A1B-OldThinker-8B-BaseCS (modelo base) | no disponible | no disponible | Apache 2.0 (según etiqueta) | Hugging Face |
| Alternativas densas de ~8B (p. ej. Llama 3.1 8B) | 8 B | 128 K | Llama 3.1 Community | Hugging Face, ampliamente adoptado |

No se dispone de datos de rendimiento comparativo para este modelo; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card muy escasa: no se documentan datos de entrenamiento, sesgos, ni evaluación de calidad.
- Riesgo de alucinación no cuantificado; al ser un modelo base ajustado sin documentación de alineamiento, puede producir contenido inexacto.
- Soporte exclusivo de inglés según la etiqueta de idioma; no se garantiza calidad en castellano ni otros idiomas.
- Longitud de contexto desconocida, lo que dificulta planificar despliegues con ventanas largas.
- Sin benchmarks publicados, no es posible validar su rendimiento frente a alternativas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base upstream (LFM2 de Liquid AI) antes de uso comercial.
- Comunidad muy reducida (68 descargas, 0 likes): soporte y mantenimiento limitados.
- No se documentan cuantizaciones oficiales; generar GGUF/AWQ requiere trabajo adicional y validación.

## Enlaces

- Hugging Face: https://huggingface.co/SvalTek/LFM2-OldThinker-8B-Base
- Modelo base del fine-tuning: https://huggingface.co/SvalTek/LFM2-A1B-OldThinker-8B-BaseCS
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
