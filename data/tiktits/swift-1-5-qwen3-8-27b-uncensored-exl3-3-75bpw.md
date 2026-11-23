# tiktits/Swift-1.5-Qwen3.8-27B-Uncensored-EXL3-3.75bpw

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-EXL3-3.75bpw es una cuantización EXL3 (ExLlamaV3) del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicado por el usuario tiktits. El modelo base es un ajuste fino de Qwen/Qwen3.8-27B realizado por UkisAI mediante GSPO (Group Sequence Policy Optimization) y destilación on-policy (OPD), orientado a un razonamiento más eficiente en tokens y a la persistencia en tareas agénticas multi-turno. Sobre esa base se aplicó una abliteración (eliminación de la dirección de rechazo) y después una cuantización estructurada personalizada.

La ficha del autor describe el modelo como multimodal completo (torre de visión más cabeza MTP) y diseñado para ejecutarse íntegramente en una GPU de 24 GB (RTX 3090/4090) con contexto de 131.072 tokens, caché KV cuantizada a 4 bits y decodificación especulativa por difusión de bloques DFlash2. La cuantización conserva la torre de visión a 6 bits y la cabeza MTP a 4 bits, mientras que el tronco de texto se comprime a 3,75 bits por peso.

Es relevante porque combina tres tendencias actuales: modelos de razonamiento con "thinking" eficiente, despliegue local de contexto largo en hardware de consumo y versiones sin censura (abliterated) para investigación sobre alineación y robustez. Conviene señalar que las cifras de benchmarks publicadas corresponden al modelo base en BF16 y no han sido re-medidas sobre esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas de atención lineal Gated DeltaNet + 16 capas de atención completa GQA (tronco de 64 capas); torre de visión ViT de 27 bloques con patch merger; cabeza MTP |
| Parametros totales | 27B según la model card (el contador de Hugging Face muestra 7.795.021.184 porque cuenta las palabras empaquetadas de 16 bits de EXL3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | EXL3 3,75 bpw en el tronco de texto; LM head a 5,00 bpw; torre de visión a 6,00 bpw; cabeza MTP a 4,00 bpw; embeddings en BF16 (16,00 bpw); caché KV cuantizada a 4 bits |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (EXL3, 2 shards, 14,52 GiB) |

## Arquitectura y entrenamiento

El tronco de texto es un transformer híbrido de 64 capas que alterna 48 capas de atención lineal Gated DeltaNet con 16 capas de atención completa GQA, una configuración orientada a reducir el coste de contexto largo. Sobre ese tronco se añaden una torre de visión ViT de 27 bloques con patch merger espacial (entrada imagen/vídeo) y una cabeza de predicción multi-token (MTP) que habilita decodificación especulativa. El modelo base Qwen3.8-27B fue ajustado por UkisAI con GSPO (RL) y destilación on-policy sobre entornos agénticos y de ingeniería de software multi-turno, con el objetivo explícito de distinguir entre bucles de sobre-razonamiento patológicos y persistencia legítima en tareas largas.

La cadena de producción de esta versión concreta aplica, antes de cuantizar, una abliteración de rango 1 en float32 (vector `r.pt`) sobre los 131 tensores que escriben en el residual, incluida la cabeza MTP. Después se aplica una asignación EXL3 estructurada (`SC_3.75bpw_H5_V6_MTP4`) con métricas de calidad por bloque: SQNR de 36,14 dB en la última capa del tronco, SQNR de 36,27 dB y error coseno de 0,000142 en el LM head. Los embeddings se mantienen en BF16 y ExLlamaV3 los fija en RAM del sistema para evitar coste de VRAM y latencia de desquantización.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" eficiente en tokens (la familia Swift 1.5 reduce el consumo de tokens de razonamiento entre un 18 % y un 58 % según el benchmark).
- Codificación de software: el modelo base reporta LiveCodeBench v6 al 81,71 % y Terminal-Bench 2.1 al 72,13 %.
- Matemáticas de competición: AIME 2026 al 96,00 % y HMMT Nov 2025 al 97,33 % en el modelo base BF16.
- Multimodal imagen-texto: pipeline `image-text-to-text` con torre de visión preservada a 6 bits; soporta entrada de imagen y vídeo según la model card.
- Persistencia agéntica multi-turno: entrenado sobre entornos CLI y agénticos, con tolerancia a tareas de varios pasos.
- Decodificación especulativa mediante cabeza MTP y DFlash2 (difusión de bloques), con velocidades declaradas de 135-155 tok/s.
- Capacidad de seguir instrucciones estrictas (IFBench al 72,07 % en el modelo base).
- Sin censura por abliteración: se elimina la dirección de rechazo en todos los tensores residuales, incluida la cabeza MTP.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Asistente de código en local: con 131.072 tokens de contexto y buen rendimiento en LiveCodeBench, se puede cargar un repositorio mediano completo y mantener conversaciones de refactorización multi-archivo en una sola RTX 4090.
- Agente CLI autónomo: el ajuste sobre Terminal-Bench y entornos multi-turno lo hace adecuado para tareas de shell, instalación de dependencias y depuración iterativa donde el modelo debe persistir en lugar de abandonar.
- Análisis de documentos con imágenes: la torre de visión a 6 bits permite procesar capturas, diagramas y páginas escaneadas junto con texto largo en el mismo contexto.
- Investigación sobre alineación y robustez: la versión abliterated sirve para estudiar la dirección de rechazo, medir la degradación de seguridad tras la ortogonalización y comparar con el modelo base alineado.
- Razonamiento matemático y científico asistido: GPQA-Diamond al 88,59 % y AIME al 96,00 % en BF16 lo sitúan como candidato para tutoría técnica o verificación de derivaciones.
- Despliegue en estación de trabajo con una sola GPU: 14,52 GiB de pesos más caché KV a 4 bits permiten servir el modelo con contexto muy largo sin infraestructura multi-GPU.
- Generación aumentada por recuperación (RAG) de corpus extensos: la ventana de 131k tokens reduce la necesidad de fragmentación agresiva y permite incluir muchos pasajes recuperados por consulta.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo base ukisai/Swift-1.5-Qwen3.8-27b en BF16 (medias de 5 semillas), no a esta cuantización abliterated a 3,75 bpw.

| Benchmark | Categoria | Qwen3.8-27B base | Swift 1.0 | Swift 1.5 |
|---|---|---|---|---|
| Terminal-Bench 2.1 | Agéntico / CLI | 69,21 % | 65,84 % | 72,13 % |
| LiveCodeBench v6 | Código difícil | 76,76 % | 81,55 % | 81,71 % |
| GPQA-Diamond | Ciencia PhD | 88,28 % | 88,28 % | 88,59 % |
| AIME 2026 | Matemáticas olimpiada | 98,67 % | 94,00 % | 96,00 % |
| HMMT Nov 2025 | Matemáticas olimpiada | 99,33 % | 96,00 % | 97,33 % |
| C-Eval | Conocimiento general | 90,00 % | 90,62 % | 90,92 % |
| IFBench | Instrucciones estrictas | 73,53 % | 71,80 % | 72,07 % |
| ERQA | Visión multimodal | 67,45 % | 66,30 % | 65,40 % |

No se han publicado resultados de benchmarks medidos sobre esta cuantización EXL3 abliterated en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 14,52 GiB de pesos EXL3 más caché KV a 4 bits; el autor indica que cabe entero en 24 GB a 131.072 tokens de contexto.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) como objetivo declarado; A100 y H100 funcionan pero desaprovechan el diseño orientado a consumo.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 de 24 GB según la model card; en GPUs de 16 GB no hay margen para contexto largo con caché KV a 4 bits.
- Opciones de despliegue: ExLlamaV3 (librería nativa del formato EXL3). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que EXL3 es un formato específico de ExLlamaV3.
- Decodificación especulativa: requiere el modelo Qwen3.8-27B-DFlash2 de z-lab para el modo de difusión de bloques.
- Latencia y throughput: 135-155 tok/s declarados por el autor con DFlash2 y caché KV a 4 bits en una GPU de 24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| tiktits/Swift-1.5-Qwen3.8-27B-Uncensored-EXL3-3.75bpw | 27B | 131.072 | EXL3 3,75 bpw | swift-open-license-1.0 | Abliterated, multimodal, MTP; objetivo 24 GB |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B | No disponible en la información | BF16 | swift-open-license-1.0 | Modelo base alineado; benchmarks de referencia |
| Qwen/Qwen3.8-27B | 27B | No disponible en la información | BF16 y otros | No disponible en la información | Base original sin ajuste GSPO/OPD |
| ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP | 27B | No disponible en la información | No disponible en la información | No disponible en la información | Variante uncensored con MTP; fuente del vector de abliteración |

## Limitaciones y advertencias

- Las cifras de benchmarks proceden del modelo base en BF16 y no se han re-medido sobre esta cuantización; la pérdida por 3,75 bpw y por abliteración puede degradar tareas sensibles.
- La abliteración elimina la dirección de rechazo, lo que reduce las barreras de seguridad y aumenta el riesgo de generar contenido dañino, ilegal o sesgado; no es apta para aplicaciones orientadas al público sin filtros externos.
- Riesgo de alucinación inherente a los modelos de razonamiento con modo thinking; la reducción de tokens de razonamiento puede recortar la verificación en tareas ambiguas.
- La licencia swift-open-license-1.0 está etiquetada como "other"; es necesario revisar el texto completo antes de cualquier uso comercial.
- El formato EXL3 solo es compatible con ExLlamaV3, lo que limita las opciones de servido y la portabilidad frente a GGUF o safetensors estándar.
- El contador de parámetros de Hugging Face (7,795 mil millones) es incorrecto según el autor; no debe usarse para dimensionar infraestructura.
- Los idiomas soportados no están documentados en la información disponible; el rendimiento multilingüe no está verificado.
- El rendimiento declarado de 135-155 tok/s depende de DFlash2, caché KV a 4 bits y una GPU de 24 GB concretos; no es extrapolable a otros entornos.
- El modelo base está entrenado para persistir en tareas largas, lo que puede traducirse en respuestas más largas de lo deseado en casos simples.

## Enlaces

- Hugging Face: https://huggingface.co/tiktits/Swift-1.5-Qwen3.8-27B-Uncensored-EXL3-3.75bpw
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- DFlash2 especulativo: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Fuente del vector de abliteración: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Variante uncensored alternativa: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Dataset agéntico multi-turno: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Paper referenciado (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
