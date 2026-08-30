# youngseok12/AX-3.1-Light-sft_v0_21_source_screen_scitech_mrc_300

## Resumen

El modelo **AX-3.1-Light-sft_v0_21_source_screen_scitech_mrc_300** es un ajuste fino experimental del modelo base [skt/A.X-3.1-Light](https://huggingface.co/skt/A.X-3.1-Light), desarrollado por el usuario youngseok12. Se trata de un modelo de lenguaje de 7 264 millones de parámetros, basado en arquitectura Llama, especializado en coreano y orientado a tareas de comprensión lectora y razonamiento sobre documentos técnico-científicos. El ajuste se realizó mediante LoRA y posterior fusión de los adaptadores en los pesos completos, dando como resultado un modelo standalone en formato BF16.

La relevancia de este modelo radica en su enfoque en el idioma coreano y en su evaluación controlada mediante el K-AI Leaderboard. Se entrenó con una mezcla de datos de detección de fuentes (source screening) en la que se reemplazaron 300 ejemplos por datos de comprensión lectora de documentos técnico-científicos del dataset AIHub-71533. Aunque los resultados locales muestran un rendimiento moderado en benchmarks como KMMLU-Pro o CLIcK, el modelo sirve como referencia para estudiar el impacto de este tipo de datos en modelos coreanos de tamaño medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) |
| Parametros totales | 7 264 800 768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada; secuencia maxima de entrenamiento: 2048 |
| Tipos de cuantizacion | BF16 (pesos originales); se pueden aplicar cuantizaciones externas (GGUF, AWQ, etc.) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 (base) + terminos de datos de AI Hub |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original del base skt/A.X-3.1-Light, un transformer tipo Llama con normalización y atención por capas. El ajuste se realizó con LoRA de rango 16, alpha 32 y dropout 0.05, aplicado a todas las proyecciones lineales (q, k, v, o, gate, up, down). Tras el entrenamiento, los adaptadores se fusionaron en los pesos base, produciendo un modelo completo sin necesidad de código o adaptadores adicionales.

El entrenamiento utilizó una mezcla de 5 801 filas de datos de detección de fuentes (source screening) en su versión v0.21, de las cuales 5 501 permanecieron sin cambios y 300 fueron reemplazadas por ejemplos de comprensión lectora de documentos técnico-científicos del dataset AIHub-71533. La selección de los 300 ejemplos fue determinista (semilla 20260829), sin filtrado por calidad ni puntuación. Se entrenó durante una época con una tasa de aprendizaje de 5e-5, optimizador AdamW fusionado, programador lineal sin calentamiento, y un tamaño de lote efectivo de 8. La pérdida fue la entropía cruzada causal estándar para respuestas del asistente.

## Capacidades

- Generación de texto en coreano: produce respuestas coherentes y contextualmente relevantes en este idioma.
- Comprensión lectora de documentos técnicos y científicos: entrenado con ejemplos de MRC de ese dominio, muestra capacidad para extraer y razonar sobre información de textos especializados.
- Razonamiento de sentido común y conocimiento general: los resultados en CLIcK (63.31%) y SNU Ko-MuSR (56.80%) indican un razonamiento básico sobre conocimiento coreano y estructuras narrativas.
- Soporte de conversación multiturno: el modelo sigue la plantilla de chat oficial del tokenizador A.X, permitiendo diálogos estructurados.
- No se ha confirmado soporte para tool calling, agentes, ni capacidades multimodales en la información disponible.

## Casos de uso

- **Atención al cliente automatizada en coreano**: el modelo puede gestionar consultas de usuarios en coreano con un tono conversacional, gracias a su plantilla de chat y su entrenamiento en diálogos. Adecuado para empresas que necesitan un primer nivel de soporte en este idioma, siempre con supervisión humana.
- **Resumen y extracción de información de documentos técnicos**: su entrenamiento con datos de MRC técnico-científico permite resumir o extraer datos clave de artículos, informes o manuales en coreano, facilitando tareas de gestión documental.
- **Generación de contenido educativo**: puede crear explicaciones, preguntas o ejercicios sobre temas científicos y técnicos en coreano, útil para plataformas de e-learning.
- **Análisis de noticias y artículos científicos**: dado su entrenamiento en detección de fuentes, puede ayudar a clasificar o verificar la procedencia de textos, aunque con limitaciones de exactitud.
- **Prototipos de investigación en PNL coreana**: sirve como base para experimentos de fine-tuning o evaluación de técnicas de adaptación, al ser un modelo abierto y reproducible.
- **Asistente de redacción técnica**: puede ayudar a redactar borradores de informes o comunicaciones técnicas en coreano, aunque debe revisarse siempre el contenido generado.

## Benchmarks y rendimiento

Los resultados presentados son evaluaciones locales (no oficiales del K-AI Leaderboard) con sondas libres y restringidas (B1_constrained) sobre 21 962 filas por modelo, sin errores de generación. Se muestran las precisiones de parseo para la configuración B1_constrained:

| Benchmark | Precisión |
|---|---|
| KMMLU-Pro | 39.40% |
| CLIcK | 63.31% |
| HLE (Ko) | 4.54% |
| SNU Ko-MuSR | 56.80% |
| Com2-main (Ko) | 51.60% |
| Media de cinco ejes | 43.13% |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: los pesos en BF16 ocupan aproximadamente 14.5 GB. Para inferencia con carga completa se recomienda al menos 16 GB de VRAM. Con cuantización a 8 bits (por ejemplo, bitsandbytes) se puede reducir a unos 8 GB, y a 4 bits a unos 4-5 GB, aunque esto degrada ligeramente la calidad.
- **GPU recomendadas**: tarjetas con 16 GB o más, como RTX 4090, A100 40 GB, H100, o GPUs de datacenter con suficiente memoria. En consumer, una RTX 4080/4090 puede ejecutarlo en BF16 con optimizaciones.
- **Despliegue**: compatible con transformers (AutoModelForCausalLM) y vLLM estándar, sin necesidad de trust_remote_code. También se puede usar con llama.cpp u Ollama convirtiendo los pesos a GGUF.
- **Latencia y throughput**: no hay datos oficiales. En una GPU A100, se puede esperar una latencia de unos pocos cientos de milisegundos por token y un throughput de decenas de tokens por segundo, dependiendo de la configuración.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, Polyglot-Ko 5.8B, Llama-3-Ko 8B) en la información proporcionada. El modelo se basa directamente en skt/A.X-3.1-Light, manteniendo su arquitectura y parámetros. La diferencia principal es el ajuste fino con datos específicos de MRC técnico-científico, que puede mejorar el rendimiento en ese dominio a costa de un posible sesgo en otros.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados. La model card advierte explícitamente que no debe usarse como sustituto de asesoramiento profesional (legal, médico, financiero, etc.).
- **Limitación de idioma**: solo está entrenado para coreano; su rendimiento en otros idiomas es muy limitado o nulo.
- **Rendimiento moderado**: los resultados en benchmarks como HLE (4.54%) son bajos, lo que indica dificultades en tareas de razonamiento complejo o conocimiento profundo.
- **Restricciones de datos**: el uso de datos de AI Hub está sujeto a sus términos, que pueden limitar la redistribución o el uso comercial del modelo entrenado con ellos.
- **Longitud de contexto**: aunque no se especifica el contexto máximo del modelo base, el entrenamiento se realizó con secuencias de 2048 tokens, por lo que el rendimiento puede degradarse en entradas más largas.
- **Naturaleza experimental**: es un modelo de investigación, sin garantías de robustez en producción. No se han publicado pruebas exhaustivas de seguridad o sesgos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/youngseok12/AX-3.1-Light-sft_v0_21_source_screen_scitech_mrc_300)
- [Modelo base skt/A.X-3.1-Light](https://huggingface.co/skt/A.X-3.1-Light)
- [Modelo relacionado del mismo autor: AX-3.1-Light-sft_v3_1_A_control](https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_1_A_control)
- [Modelo relacionado del mismo autor: AX-3.1-Light-sft_v3_0](https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0)
