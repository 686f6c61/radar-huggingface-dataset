# spiritfather/Melinoe-Qwen3-8-27B-VL-GGUF

## Resumen

Melinoe-Qwen3-8-27B-VL es un modelo de lenguaje y visión de 27.320.697.856 parámetros (unos 27,3 mil millones) construido a partir de la familia Qwen3 y afinado por el usuario bgg1996 para escritura creativa y roleplay. La versión aquí documentada es una conversión a formato GGUF realizada por spiritfather, que publica cuantizaciones estáticas desde Q2_K hasta Q8_0 para su uso con llama.cpp y entornos compatibles con endpoints de tipo OpenAI. El modelo se presenta explícitamente como un modelo VL (visión-lenguaje), con una torre visual que llama.cpp mantiene separada del GGUF principal.

El interés de esta ficha radica en que se trata de un modelo de nicho orientado a calidad de prosa y disposición conversacional, no a inteligencia general. El autor del modelo base lo evalúa en CaliperBench, un benchmark de escritura creativa que puntúa oficio narrativo, roleplay y willingness (predisposición del modelo a seguir la premisa del usuario) en lugar de rendimiento en tareas de razonamiento estándar. Esto condiciona por completo su perfil de uso: es adecuado para generación narrativa y personajes, y no debe evaluarse con las métricas habituales de MMLU o GSM8K.

La licencia es Apache 2.0, el idioma declarado es únicamente inglés y el repositorio ocupa 174,7 GB, dominado por los pesos sin cuantizar y las diez variantes GGUF publicadas. No hay información publicada sobre arquitectura interna, composición del dataset de ajuste ni número de tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3; detalles internos no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; pesos originales en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base bgg1996/Melinoe-Qwen3-8-27B-VL: la model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones estáticas del modelo original y no detalla capas, tipo de atención, estrategias de positional encoding ni si incorpora mecanismos híbridos. Por el nombre y el tamaño se infiere una base Qwen3 de aproximadamente 27 mil millones de parámetros, pero la model card no confirma la correspondencia exacta con una variante concreta de Qwen3.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se aplicaron RLHF, DPO u otras técnicas de alineación. Lo único verificable es la orientación del ajuste: el autor del modelo base lo evalúa en CaliperBench, un benchmark específico de escritura creativa que mide calidad de prosa, roleplay y willingness. La componente de visión viene de la familia Qwen3-VL y, en el ecosistema llama.cpp, se distribuye como un proyector multimodal independiente (mmproj) en BF16 que debe cargarse junto con la cuantización de texto.

## Capacidades

- Generación de texto en inglés con orientación a escritura creativa: narrativa, diálogo, descripción de escenas y estilo literario.
- Roleplay y conversación multi-turno con personajes, incluyendo mantenimiento de persona y premisa a lo largo de la conversación.
- Comprensión de imágenes mediante la torre visual, siempre que se cargue el fichero mmproj junto con la cuantización de texto.
- Descripción y análisis de imágenes en lengua inglesa, integrable en flujos conversacionales multimodales.
- Conversación general en inglés, con formato compatible con endpoints de tipo OpenAI.
- No hay información publicada sobre tool calling, function calling, modo thinking explícito, capacidades de audio ni soporte multilingüe más allá del inglés.

## Casos de uso

- Escritura narrativa asistida: generación de borradores de relatos, capítulos y descripciones con un modelo afinado específicamente para calidad de prosa, evaluado en CaliperBench frente a otros modelos creativos.
- Roleplay y personajes conversacionales: despliegue de un personaje con personalidad estable en una aplicación de chat, usando la variante Q4_K_M (16,8 GB) para mantener latencia baja en una GPU de consumo.
- Prototipado de videojuegos narrativos: generación de diálogos ramificados y respuestas de NPC en inglés, con cuantización Q5_K_M (19,5 GB) cuando se dispone de 24 GB de VRAM.
- Análisis de imágenes con salida narrativa: carga del mmproj BF16 junto con el GGUF de texto para describir ilustraciones, bocetos o capturas y convertirlas en texto descriptivo o narrativo.
- Generación de contenido editorial en inglés: redacción de textos de marketing, ficción corta o guiones, aprovechando el ajuste orientado a estilo y no a razonamiento analítico.
- Experimentación e investigación en alineación creativa: comparación de cuantizaciones Q4_K_S, Q5_K_M y Q8_0 sobre las mismas prompts para medir la degradación de calidad de prosa inducida por la cuantización.
- Despliegue local en estaciones de trabajo: uso de Q3_K_M (13,5 GB) o Q4_K_S (15,8 GB) en GPUs de 16 GB para inferencia totalmente local sin dependencia de servicios externos.

## Benchmarks y rendimiento

La model card únicamente remite a la ficha del modelo en CaliperBench (caliperbench.com/m/melinoe-qwen3.8-27b-vl), sin reproducir cifras en el repositorio. No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, CaliperBench u otros) en la información disponible, por lo que no se presenta tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K 10,9 GB; Q3_K_S 12,3 GB; Q3_K_M 13,5 GB; Q3_K_L 14,6 GB; Q4_K_S 15,8 GB; Q4_K_M 16,8 GB; Q5_K_S 19,0 GB; Q5_K_M 19,5 GB; Q6_K 22,4 GB; Q8_0 29,0 GB. Estas cifras corresponden al tamaño del fichero y deben incrementarse con el espacio de contexto KV cache.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q5_K_M y Q6_K; RTX 4080/4070 Ti Super (16 GB) para Q3_K_M y Q4_K_S.
- Cabe en GPU de consumo: sí, desde Q2_K en tarjetas de 12 GB hasta Q5_K_M en tarjetas de 24 GB. Q6_K (22,4 GB) y Q8_0 (29,0 GB) requieren 24 GB con margen ajustado o 32 GB respectivamente.
- Uso multimodal: añadir el fichero mmproj-Melinoe-Qwen3-8-27B-VL-BF16.gguf al despliegue; el coste adicional de VRAM del proyector no está cuantificado en la información disponible.
- Opciones de despliegue: llama.cpp (llama-server con `-m <quant>.gguf --mmproj mmproj-...gguf` para multimodal), y cualquier runtime compatible con GGUF y endpoints de tipo OpenAI. No se documenta compatibilidad con vLLM ni TGI para estas cuantizaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. La model card solo referencia CaliperBench como marco de evaluación, sin cifras publicadas en el repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Melinoe-Qwen3-8-27B-VL (este) | 27,3 mil millones | No disponible | Apache 2.0 | GGUF, safetensors | Ajuste para escritura creativa y roleplay; multimodal con mmproj |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No se identifican en la información proporcionada |

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; el rendimiento en castellano no está documentado y no debe asumirse.
- Sesgos: no se publica información sobre sesgos evaluados, composición del dataset ni filtros aplicados durante el ajuste.
- Alucinación: al estar orientado a escritura creativa y roleplay, la propensión a generar contenido inventado es estructuralmente alta; no es adecuado como fuente factual sin verificación externa.
- Evaluación: el benchmark de referencia (CaliperBench) mide calidad de prosa, roleplay y willingness, no razonamiento ni exactitud factual; las puntuaciones en ese benchmark no deben extrapolarse a tareas analíticas.
- Cuantización: las variantes Q2_K y Q3_K_M se marcan respectivamente como de menor calidad en la propia model card; para producción creativa se recomienda Q4_K_M o superior.
- Multimodal: sin cargar el fichero mmproj BF16, el modelo funciona solo como modelo de texto; olvidar este paso es la causa habitual de fallos en el uso de visión.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribución; conviene verificar también las condiciones del modelo base bgg1996/Melinoe-Qwen3-8-27B-VL y de la familia Qwen3 subyacente.
- Contexto: al no publicarse la longitud de contexto soportada, la planificación de memoria KV cache y de conversaciones largas debe hacerse de forma empírica.
- Madurez: el repositorio tiene 251 descargas y 0 likes, con fecha de creación en agosto de 2026 y última actualización en octubre de 2026; se trata de una conversión de nicho con validación comunitaria limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/spiritfather/Melinoe-Qwen3-8-27B-VL-GGUF
- Modelo base: https://huggingface.co/bgg1996/Melinoe-Qwen3-8-27B-VL
- Proyector multimodal (mmproj BF16): https://huggingface.co/spiritfather/Melinoe-Qwen3-8-27B-VL-GGUF/resolve/main/mmproj-Melinoe-Qwen3-8-27B-VL-BF16.gguf
- Ficha del modelo en CaliperBench: https://caliperbench.com/m/melinoe-qwen3.8-27b-vl/
- Benchmark CaliperBench: https://caliperbench.com
- Guía de uso de GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
