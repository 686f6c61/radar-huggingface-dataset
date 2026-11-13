# xangel82/DeepSeek-V4-Flash-Dense-FP8

## Resumen
DeepSeek V4 Flash Dense FP8 es un repositorio de pesos publicado por xangel82 que contiene, sin modificaciones, las proyecciones densas en FP8 del modelo DeepSeek V4 Flash de DeepSeek. No se trata de un modelo entrenado por el autor del repositorio, sino de una extracción de 730 tensores (5,9 GB por fichero) correspondientes a las proyecciones de atención (query, key/value, output), el indexador y los expertos compartidos de las 43 capas del modelo base. El objetivo es permitir que el motor de inferencia Athena's Engine ejecute estas capas en los tensor cores MXFP8 de un NVIDIA GB10 (DGX Spark o ASUS Ascent GX10) a la precisión original con la que DeepSeek entrenó el modelo.

La relevancia de este repositorio es de nicho: está pensado exclusivamente para el ecosistema Athena (motor de inferencia y asistente Athena Logos), no para uso general con llama.cpp, vLLM o TGI. Los tensores se almacenan en tipos GGUF propietarios que otros lectores de GGUF ignoran o no interpretan. La licencia declarada es MIT, heredada de los pesos originales de DeepSeek.

El modelo base, DeepSeek V4 Flash, es un modelo de DeepSeek con contexto de 262.144 tokens, del cual este repositorio solo redistribuye un subconjunto de tensores en FP8. No se dispone de información sobre el número total de parámetros ni sobre la arquitectura completa en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y expertos compartidos (detalles completos del modelo base no disponibles); los tensores extraídos corresponden a proyecciones densas de atención, indexador y shared experts de 43 capas |
| Parametros totales | no disponible (el repositorio solo contiene 730 tensores, 5,9 GB por fichero) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según la model card, para el modelo base en Athena's Engine) |
| Tipos de cuantizacion | FP8 E4M3 con escala E8M0 por bloque de 128 × 128 (MXFP8); el GGUF resultante usa tipos propietarios del motor Athena |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (ficheros `deepseek-v4-flash-0731-dense-fp8.safetensors` y `deepseek-v4-flash-vision-exp-dense-fp8.safetensors`); se integran en GGUF mediante el conversor `deepseek4-fp8-dense` |

## Arquitectura y entrenamiento
Este repositorio no entrena ningún modelo: redistribuye tensores ya entrenados por DeepSeek. Concretamente, contiene las proyecciones densas en FP8 del checkpoint DeepSeek V4 Flash 0731 y de su variante Vision-Exp. Para cada una de las 43 capas se incluyen los pares `weight` y `scale` de `attn.wq_a`, `attn.wq_b`, `attn.wkv`, `attn.wo_a`, `attn.wo_b`, `attn.indexer.wq_b` y de los expertos compartidos `ffn.shared_experts.w1`, `w2` y `w3`. Los valores son E4M3 con una escala E8M0 por bloque de 128 × 128, tal como los lee el `inference/model.py` de los autores.

La innovación técnica no está en el modelo sino en el formato de distribución: los tensores se publican byte a byte bajo los nombres originales de DeepSeek, con metadatos que indican el repositorio y la revisión de origen, y checksums SHA-256 verificables. El instalador de Athena's Engine descarga el GGUF de antirez y añade estos tensores con el conversor `deepseek4-fp8-dense`, conservando íntegro el GGUF original. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades
- Generación de texto y razonamiento heredados del modelo base DeepSeek V4 Flash (capacidades completas no detalladas en la información disponible).
- Procesamiento de imágenes en la variante Vision-Exp, cuyo checkpoint también se distribuye en este repositorio.
- Contexto largo de hasta 262.144 tokens en Athena's Engine.
- APIs compatibles con OpenAI y Anthropic con streaming y tool calls, según la model card del ecosistema Athena.
- Decodificación especulativa DSpark en el motor Athena para acelerar la generación.
- Soporte de agentes y razonamiento multi-paso a través de Athena Logos (asistente construido sobre el motor).
- Búsqueda multimodal, voz, transcripción y vídeo con audio en la misma máquina, según las capacidades del ecosistema Athena.

## Casos de uso
- Inferencia local de frontera en un GB10: el caso principal es ejecutar DeepSeek V4 Flash en un DGX Spark o ASUS Ascent GX10 con las proyecciones FP8 originales, obteniendo 1.306 tokens/s de prefill con prompt de 8k y 29,0 tokens/s de decode, sin enviar datos a la nube.
- Asistente personal con documentos: Athena Logos usa el modelo para responder sobre documentos aportados por el usuario citando la página de origen, aprovechando el contexto de 262k tokens para ingerir volúmenes grandes de texto.
- Procesamiento de imágenes en local: la variante Vision-Exp permite leer y describir imágenes dentro del mismo entorno privado, útil para investigación o análisis documental con requisitos de confidencialidad.
- Automatización con agentes: las APIs compatibles con OpenAI y Anthropic y el soporte de tool calls permiten integrar el modelo en flujos de agentes que ejecutan tareas y reportan resultados, todo en la máquina local.
- Transcripción y voz manos libres: el ecosistema Athena combina el modelo con transcripción y voz en el mismo hardware, adecuado para asistentes por voz en entornos sin conectividad.
- Investigación sobre cuantización FP8: los tensores publicados con escalas E8M0 por bloque de 128 × 128 y checksums verificables sirven para estudiar el comportamiento de MXFP8 en tensor cores de GB10 y validar implementaciones de kernels.
- Desarrollo y pruebas de motores de inferencia: el formato propietario y el conversor `deepseek4-fp8-dense` son un caso de referencia para quien implemente lectura de tipos GGUF personalizados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son de velocidad en un GB10 con Athena's Engine 1.1.0 y decodificación especulativa DSpark:

| Metrica | Valor |
|---|---|
| Prefill, prompt de 8k tokens | 1.306 tokens/s |
| Prefill, prompt de 32k tokens | 1.349 tokens/s |
| Decode tras 8k | 29,0 tokens/s |
| Decode tras 32k | 28,2 tokens/s |
| Decode tras 8k con GGUF plano (versión 1.0.5) | 22,5 tokens/s |

## Requisitos de hardware
- GPU objetivo: NVIDIA GB10, presente en DGX Spark y ASUS Ascent GX10. Los tensor cores MXFP8 de esta GPU son el requisito para ejecutar las proyecciones FP8 a la precisión original.
- VRAM: no disponible de forma explícita; el repositorio ocupa 11,7 GB y el instalador necesita 87 GB adicionales de disco durante la escritura del GGUF combinado.
- No está pensado para GPU de consumo convencionales (RTX 4090, etc.) ni para A100/H100 con los motores habituales, ya que los tipos GGUF son propietarios de Athena's Engine.
- Motor de despliegue: exclusivamente Athena's Engine 1.1.0 o posterior (`docker pull ghcr.io/xangel82/athena-engine:1.1.0`). llama.cpp y otros lectores de GGUF no interpretan estos tensores.
- Instalación: `./athena-engine/install.sh --model deepseek` (o `visio`, o ambos); descarga el GGUF de antirez y añade los tensores FP8.
- Latencia y throughput: ver tabla de benchmarks (29,0 tokens/s de decode tras 8k en un GB10).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek V4 Flash Dense FP8 (este repo) | no disponible (solo 5,9 GB de tensores FP8) | 262.144 | MIT | safetensors + GGUF propietario Athena | Hugging Face, requiere Athena's Engine |
| DeepSeek V4 Flash (base, deepseek-ai) | no disponible | 262.144 | MIT | safetensors FP8 | Hugging Face |
| DeepSeek V4 Flash Vision-Exp (base) | no disponible | no disponible | MIT | safetensors | Hugging Face |
| GGUF de antirez (deepseek-v4-gguf) | no disponible | 262.144 | MIT | GGUF estándar | Hugging Face |

No se dispone de datos de benchmarks ni de parámetros totales de los modelos comparados en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias
- Este repositorio no es un modelo autónomo: contiene solo un subconjunto de tensores (proyecciones densas de atención, indexador y shared experts) y necesita el GGUF base de antirez para funcionar.
- Dependencia total de Athena's Engine 1.1.0 o superior; no es utilizable con llama.cpp, vLLM, TGI, Ollama ni otras herramientas estándar.
- Los tipos GGUF son propietarios; otros lectores pueden ignorar los tensores o fallar al interpretarlos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas del modelo base.
- La licencia MIT se hereda de los pesos de DeepSeek; conviene verificar los términos del modelo base para uso comercial, aunque la model card indica que es libre para uso personal, investigación, educación y para desarrolladores y pequeñas empresas.
- El proceso de instalación requiere 87 GB de disco adicionales temporalmente y varios minutos de conversión.
- No se han publicado evaluaciones de calidad ni comparativas con modelos equivalentes en la información disponible.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/xangel82/DeepSeek-V4-Flash-Dense-FP8
- Modelo base DeepSeek V4 Flash 0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Modelo base DeepSeek V4 Flash Vision-Exp: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- GGUF de antirez: https://huggingface.co/antirez/deepseek-v4-gguf
- Athena's Engine (GitHub): https://github.com/xangel82/Athena-Engine
- Athena Logos (GitHub): https://github.com/xangel82/Athena-Logos
- Última release de Athena Logos: https://github.com/xangel82/Athena-Logos/releases/latest
- Sitio web de Athena: https://palaferri.com/athena
- Imagen Docker del motor: ghcr.io/xangel82/athena-engine:1.1.0
