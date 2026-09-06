# Yingyaeliae/Goetia-24B-v1.4-heretic

## Resumen

Goetia-24B-v1.4-heretic es un modelo de lenguaje para generación de texto, desarrollado por Yingyaeliae. Se trata de una versión «decensored» (abliterated) del modelo Naphula/Goetia-24B-v1.4, generada mediante la herramienta Heretic v1.4.0. El modelo está orientado a la escritura creativa, la narrativa de ficción y el roleplay, con un énfasis especial en prosa vívida y generación de tramas y subtramas.

Desde el punto de vista técnico, es una fusión de siete modelos de 24.000 millones de parámetros, combinados con mergekit. La arquitectura subyacente es un transformer de la familia Mistral Small 3.1, con un total de 23.572.444.160 parámetros. Los pesos se distribuyen en formato safetensors, y la licencia es Apache-2.0. La longitud de contexto no se especifica en la información disponible, y el modelo trabaja únicamente en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral Small 3.1) |
| Parametros totales | 23.572.444.160 (23.6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye la etiqueta `float32`) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión (merge) de siete modelos base de 24B, realizada con mergekit. Los modelos combinados son Darkhn/Magistral-2509-24B-Text-Only, Naphula/BeaverAI_Fallen-Mistral-Small-3.1-24B-v1e_textonly, Naphula/Slimaki-24B-v1, Casual-Autopsy/Maginum-Cydoms-24B, sophosympatheia/Magistry-24B-v1.0, DarkArtsForge/Morbid-Miasma-24B y mradermacher/BlackXorDolphTronGOAT-GGUF. Todos comparten la arquitectura Mistral Small 3.1 de 24B, lo que determina la base transformer del modelo resultante.

El dataset utilizado en el proceso es OccultAI/illuminati_imatrix_v1, orientado a escritura creativa. Posteriormente, se aplicó un proceso de abliteración con Heretic v1.4.0 sobre el modelo original Naphula/Goetia-24B-v1.4, con el objetivo de reducir las negativas o «refusals». No se ha publicado información sobre entrenamiento con RLHF o DPO.

## Capacidades

- Generación de texto creativo: ficción, ciencia ficción, romance, terror y todos los géneros.
- Roleplay interactivo: puede interpretar personajes y mantener conversaciones de rol con contexto.
- Generación de tramas y subtramas, con capacidad de continuar escenas y expandir narrativas.
- Prosa vívida: está optimizado para descripciones detalladas y estilo literario.
- Soporte de la plantilla de chat Mistral Tekken.
- Capacidad de generar contenido explícito o gráfico debido a su naturaleza «decensored», lo que requiere un ajuste cuidadoso del system prompt.
- Limitado al idioma inglés.
- No se especifican capacidades de tool calling, visión, audio o razonamiento multi-step.

## Casos de uso

- Escritura de novelas y relatos: el modelo puede generar pasajes narrativos extensos, desarrollar subtramas y mantener coherencia a lo largo de capítulos, lo que lo hace adecuado para autores que necesitan un asistente de prosa creativa.
- Roleplay interactivo: se puede integrar en plataformas de chatbot para juegos de rol, interpretando personajes con personalidades complejas y respuestas contextuales.
- Generación de contenido para juegos: crear diálogos, descripciones de escenarios y misiones para juegos de rol o juegos narrativos.
- Reescritura de escenas para guiones: continuar o expandir escenas existentes en proyectos de ficción, con un estilo literario consistente.
- Prototipado de ficción interactiva: servir como motor de narración para proyectos de ficción no lineal o narrativa ramificada.
- Asistencia en diseño de personajes: generar historias de fondo, motivaciones, arcos de transformación y conflictos internos para personajes de ficción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente métricas de abliteración, que se presentan en la siguiente tabla:

| Métrica | Este modelo | Original Naphula/Goetia-24B-v1.4 |
|---|---|---|
| Divergencia KL | 0.0040 | 0 (por definición) |
| Refusals | 2/100 | 5/100 |

## Requisitos de hardware

- El repositorio tiene un tamaño de 47.2 GB, lo que sugiere pesos en FP16 (23.6B × 2 bytes). Para inferencia en FP16 se requieren aproximadamente 47 GB de VRAM, lo que excede las GPU de consumo típicas.
- Para ejecutar el modelo en una GPU de consumo (por ejemplo, RTX 4090 con 24 GB) sería necesaria una cuantización de 4 bits, que reduciría el peso a unos 13-15 GB. No obstante, la información proporcionada no especifica cuantizaciones disponibles.
- GPUs recomendadas: no disponibles en la información. En función del tamaño, una A100 de 80 GB o una H100 serían adecuadas para FP16.
- Opciones de despliegue: no se proporcionan datos específicos. Al ser un modelo transformers, puede cargarse con Transformers, vLLM u otros frameworks que admitan safetensors; la conversión a GGUF para llama.cpp sería posible, pero no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Goetia-24B-v1.4-heretic | 23.6B | no disponible | Apache-2.0 | safetensors |
| Naphula/Goetia-24B-v1.4 | 23.6B | no disponible | Apache-2.0 | safetensors |
| Naphula/Slimaki-24B-v1 | 23.6B | no disponible | Apache-2.0 | safetensors |

Se trata de modelos de la misma categoría: merges creativos de 24B. No hay datos de benchmarks comparativos disponibles.

## Limitaciones y advertencias

- Sesgos: no se han evaluado en la información disponible. La abliteración puede acentuar la generación de contenido gráfico, violento o erótico.
- Riesgo de alucinación: alto, especialmente en contextos de ficción donde se incentiva la creatividad.
- Limitaciones de contexto e idioma: el modelo trabaja únicamente en inglés; la longitud de contexto no está documentada.
- Licencia: Apache-2.0, que permite uso comercial, pero el contenido generado puede resultar problemático en entornos laborales o de producción por su naturaleza explícita.
- Este modelo está diseñado para ser «uncensored» y puede producir narrativas con contenido violento, erótico o gráfico. Se recomienda usar la plantilla de chat Mistral Tekken y ajustar el system prompt para mitigar comportamientos no deseados.

## Enlaces

- HuggingFace: https://huggingface.co/Yingyaeliae/Goetia-24B-v1.4-heretic
- Modelo original: https://huggingface.co/Naphula/Goetia-24B-v1.4
- Proyecto Heretic: https://heretic-project.org
- Modelos base:
  - https://huggingface.co/Darkhn/Magistral-2509-24B-Text-Only
  - https://huggingface.co/Naphula/BeaverAI_Fallen-Mistral-Small-3.1-24B-v1e_textonly
  - https://huggingface.co/Naphula/Slimaki-24B-v1
  - https://huggingface.co/Casual-Autopsy/Maginum-Cydoms-24B
  - https://huggingface.co/sophosympatheia/Magistry-24B-v1.0
  - https://huggingface.co/DarkArtsForge/Morbid-Miasma-24B
  - https://huggingface.co/mradermacher/BlackXorDolphTronGOAT-GGUF
