# Xylolabs/Raon-1-nano-Tenstorrent-Tensix

## Resumen

Raon-1-nano-Tenstorrent-Tensix es una versión cuantizada del modelo KRAFTON/Raon-1-nano, adaptada específicamente para su ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole, núcleos Tensix). La conversión la publica Xylolabs, que aplica su herramienta tensix-bfp-gptq para transformar los pesos originales en formato block-floating-point bfloat8_b, un formato nativo de los NPU de Tenstorrent. El modelo base es un modelo de generación de texto de la familia Raon-1 de KRAFTON, orientado a los idiomas coreano e inglés.

El interés de esta ficha radica en que no es un modelo nuevo, sino una distribución de pesos optimizada para hardware alternativo a GPU. Permite desplegar un modelo de texto en NPU de Tenstorrent con una pérdida de calidad medida muy baja (KL medio de 0,0019 frente a BF16) y manteniendo la licencia Apache 2.0 del modelo original. La capa de predicción multi-token del modelo base se ha eliminado en esta conversión.

La información pública disponible es limitada: no se detallan parámetros totales, longitud de contexto ni composición del dataset de entrenamiento. La model card se centra en el proceso de cuantización, los formatos de pesos y las instrucciones de ejecución con Transformers 5.22.1 o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención MLA (gated MLA) y delta-attention, según los módulos cuantizados indicados; detalles completos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Block-floating-point bfloat8_b (BFP8) en MLP, delta-attention, gated MLA (excepto `kv_b_proj`), entrada por capa y LM head; resto en bf16 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `bfp8/`), repo de 7,1 GB |

## Arquitectura y entrenamiento

El modelo base KRAFTON/Raon-1-nano es un transformer de generación de texto. La model card de esta conversión menciona módulos de tipo gated MLA (atención multi-cabeza latente con compuerta) y delta-attention, además de capas MLP, lo que sugiere una arquitectura de atención con componentes tipo DeepSeek. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica de esta distribución es el proceso de cuantización: Xylolabs aplica GPTQ con formato block-floating-point (bfloat8_b) para adaptar los pesos a los núcleos Tensix de Tenstorrent. Se conserva `kv_b_proj` en bf16, presumiblemente por sensibilidad a la cuantización, y el resto de módulos críticos (MLP, delta-attention, gated MLA, entrada por capa y LM head) se almacenan en bfloat8_b. El resultado reporta un KL medio de 0,0019 respecto a BF16 y supera 27 de 33 respuestas en la comprobación de respuestas del autor (más 7 de 7 en un segundo conjunto). La capa de predicción multi-token del modelo base se ha eliminado.

## Capacidades

- Generación de texto en coreano e inglés.
- Razonamiento y respuesta a preguntas de propósito general (el ejemplo de la model card es una pregunta factual).
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Ejecución sobre NPU Tenstorrent Wormhole y Blackhole a través de tt-metal/ttnn.
- Compatibilidad con Transformers 5.22.1 o superior (con `trust_remote_code=True`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: equipos con NPU Wormhole o Blackhole pueden ejecutar generación de texto sin depender de GPU NVIDIA, usando los pesos ya adaptados al formato nativo bfloat8_b.
- Servicio de chat en coreano e inglés: el modelo soporta plantilla de chat y generación multi-turno, adecuado para asistentes conversacionales en ambos idiomas.
- Prototipado de inferencia en hardware alternativo: útil para evaluar el rendimiento y la fidelidad de la cuantización BFP8 frente a BF16 en cargas reales de generación.
- Investigación en cuantización: el KL medio de 0,0019 y los resultados de la comprobación de respuestas permiten estudiar el impacto de bfloat8_b en modelos pequeños.
- Generación de contenido en coreano: al ser uno de los dos idiomas soportados, sirve para tareas de redacción y resumen en ese idioma.
- Integración en pipelines de Transformers: al cargarse con `AutoModelForCausalLM`, puede incorporarse a flujos existentes basados en Hugging Face sin reescribir el código de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de fidelidad de la cuantización:

| Métrica | Valor |
|---|---|
| KL medio frente a BF16 | 0,0019 |
| Comprobación de respuestas (33 preguntas) | 27/33 |
| Comprobación de respuestas adicional (7 preguntas) | 7/7 |

## Requisitos de hardware

- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole (núcleos Tensix), no GPU convencionales.
- Tamaño del repo: 7,1 GB empaquetado; la carpeta `bfp8/` contiene los pesos cuantizados.
- VRAM estimada: no disponible (el destino es memoria de NPU, no VRAM de GPU).
- GPU recomendadas: no aplica; el formato bfloat8_b está pensado para tt-metal/ttnn.
- Compatibilidad con GPU de consumo: no documentada; la carga vía Transformers con `dtype="bfloat16"` podría funcionar en GPU, pero no es el objetivo declarado.
- Opciones de despliegue: Transformers 5.22.1+ con `trust_remote_code=True`; descarga con `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/hardware |
|---|---|---|---|---|
| Raon-1-nano-Tenstorrent-Tensix (esta ficha) | no disponible | no disponible | Apache 2.0 | BFP8 para NPU Tenstorrent |
| KRAFTON/Raon-1-nano (base) | no disponible | no disponible | Apache 2.0 | BF16, propósito general |
| Otros modelos nano de generación de texto | no disponible | no disponible | variable | safetensors/GGUF en GPU |

No se dispone de datos de rendimiento comparativo entre esta versión y el modelo base más allá del KL medio (0,0019) y la comprobación de respuestas.

## Limitaciones y advertencias

- La información pública es escasa: se desconocen parámetros, contexto y datos de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Solo se soportan coreano e inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones.
- La cuantización BFP8 introduce una pérdida medible (KL 0,0019) y respuestas incorrectas en 6 de 33 comprobaciones.
- La capa de predicción multi-token del modelo base se ha eliminado, por lo que no se puede usar esa funcionalidad.
- `trust_remote_code=True` ejecuta el archivo de modelado del modelo base incluido sin cambios; conviene revisarlo antes de usarlo.
- El formato está orientado a NPU Tenstorrent; no se garantiza su funcionamiento en GPU u otros aceleradores.
- Licencia Apache 2.0 permite uso comercial, pero cada carpeta incluye su propio LICENSE y NOTICE que deben respetarse.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Raon-1-nano-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Raon-1-nano-Tenstorrent-Tensix/blob/main/LICENSE
