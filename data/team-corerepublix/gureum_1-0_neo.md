# Team-CorerepubliX/Gureum_1.0_neo

## Resumen

Gureum (구름, "nube" en coreano) 1.0 neo es un modelo de lenguaje conversacional de aproximadamente 2.300 millones de parámetros desarrollado por Team-CorerepubliX. Está especializado en diálogo en coreano, con soporte secundario de inglés, y se distribuye con arquitectura tipo Llama en formato safetensors bajo licencia CC BY-NC-ND 4.0. Su propósito declarado es actuar como asistente generalista en coreano: conversación, matemáticas, código, traducción y redacción, manteniendo registro formal (존댓말) incluso cuando el usuario emplea registro informal.

El modelo se presenta como una alternativa ligera que puede ejecutarse en hardware de consumo: el autor indica que la versión cuantizada GGUF Q4_K_M ocupa aproximadamente 1,35 GB y funciona con unos 3 GB de VRAM o RAM, con recomendación de GPU de 6 GB o más (verificado con holgura en 8 GB). La longitud de contexto declarada es de 8192 tokens, aunque el entrenamiento se realizó con 768 tokens, lo que constituye una discrepancia relevante para producción.

Su relevancia actual es limitada pero concreta: cubre el nicho de asistentes conversacionales en coreano que caben en equipos modestos, con una model card que documenta explícitamente un problema de repetición en generación larga y prescribe parámetros de muestreo obligatorios (`repeat_penalty >= 1.1`, `repeat_last_n >= 256`). Es un modelo de nicho, con 550 descargas y 2 likes en el momento de la consulta, sin benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama` y librería `transformers`) |
| Parámetros totales | 2.305.517.312 (~2,3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens máximo declarado; entrenamiento a 768 tokens |
| Tipos de cuantización | safetensors bf16 (original, ~4,6 GB); GGUF Q4_K_M (~1,35 GB) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | CC BY-NC-ND 4.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un transformer causal de tipo Llama, con 2,3B parámetros y pesos en safetensors/bf16. El repositorio ocupa 9,2 GB, lo que sugiere la presencia de múltiples artefactos además de los pesos principales (posiblemente tokenizer, plantillas de chat y variantes cuantizadas). No se detalla en la información proporcionada el número de capas, dimensiones ocultas, número de cabezas de atención ni el esquema de atención (MHA/GQA), por lo que esos datos deben considerarse no disponibles.

Respecto al entrenamiento, la model card solo indica que el entrenamiento se realizó con una longitud de 768 tokens y que el modelo fue ajustado para mantener el registro formal coreano, usar estructura Markdown en textos largos y aplicar automáticamente una persona por defecto cuando no se proporciona mensaje de sistema. No se especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en coreano, con mantenimiento del registro formal (존댓말) aunque el usuario escriba en 반말.
- Soporte de inglés como idioma secundario, según los metadatos del modelo.
- Tareas generalistas de asistente: matemáticas, código, traducción y redacción.
- Generación de textos largos con estructura Markdown (encabezados `##`, listas).
- Aplicación automática de una persona por defecto ("Gureum") cuando no se pasa mensaje de sistema.
- Compatibilidad con plantillas de chat vía `apply_chat_template` de transformers.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explícito, visión, audio ni modo "thinking".

## Casos de uso

- Asistente conversacional en coreano para atención al cliente: el modelo mantiene el registro formal de forma consistente, lo que encaja en interacciones con usuarios coreanos donde la cortesía es un requisito; su ventana de 8192 tokens permite hilos multi-turno moderados, aunque el entrenamiento a 768 tokens limita la fiabilidad en contextos muy largos.
- Despliegue en hardware de consumo o edge: con GGUF Q4_K_M (~1,35 GB) y ~3 GB de memoria, puede ejecutarse en portátiles con GPU de 6-8 GB o incluso en CPU mediante llama.cpp, lo que lo hace viable para prototipos locales y aplicaciones de escritorio.
- Generación de documentación y textos estructurados en coreano: su entrenamiento para emitir Markdown con encabezados y listas lo hace adecuado para borradores de artículos, README o guías, siempre limitando `max_tokens` a ~600 para mitigar la repetición documentada.
- Traducción asistida coreano-inglés en entornos no comerciales: el soporte bilingüe permite usarlo como borrador de traducción en proyectos personales o de investigación, con revisión humana obligatoria por el riesgo de alucinación de un modelo de 2,3B.
- Chatbot educativo o de práctica de idiomas: la persona por defecto y el registro formal lo hacen útil para simular conversaciones en coreano en contextos de aprendizaje, ejecutándose localmente sin depender de APIs.
- Asistente de código ligero en coreano: puede generar fragmentos de código y explicaciones en coreano para tareas sencillas, integrable en editores o scripts vía transformers o llama.cpp, aunque sin tool calling nativo.
- Prototipado e investigación en PLN coreano: sirve como base de experimentación para estudiar comportamiento conversacional en modelos pequeños, teniendo en cuenta que la licencia ND prohíbe distribuir modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~3 GB mínimo con GGUF Q4_K_M según el autor; ~4,6 GB para safetensors en bf16; ~9,2 GB de espacio en disco para el repositorio completo.
- GPU recomendadas: el autor indica GPU de 6 GB o más como recomendación y confirma funcionamiento holgado en 8 GB. No se especifican modelos concretos (A100, H100, RTX 4090); para un modelo de 2,3B, cualquier GPU consumer con 6-8 GB (por ejemplo, RTX 3060, RTX 4060) debería ser suficiente en cuantización Q4.
- Cabe en GPU consumer: sí, en tarjetas de 6-8 GB con cuantización; también es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` + `torch` (safetensors), `llama.cpp` con build reciente (GGUF), text-generation-inference (declarado compatible) y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo obligatorios: `temperature=0.7`, `top_p=0.9`, `repeat_penalty >= 1.1`, `repeat_last_n >= 256`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gureum 1.0 neo | ~2,3B | 8192 (entrenado a 768) | ko, en | CC BY-NC-ND 4.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | multilingüe (incl. ko) | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 | multilingüe (incl. ko) | Llama 3.2 Community License | Hugging Face |
| Gemma 2 2B IT | ~2,6B | 8192 | multilingüe | Gemma Terms of Use | Hugging Face |

La comparativa se ofrece a título orientativo por categoría de tamaño; no se dispone de datos de rendimiento de Gureum que permitan una comparación cuantitativa con estas alternativas. Frente a ellas, Gureum destaca por su especialización en coreano y su licencia restrictiva (no comercial, sin derivados), mientras que las alternativas citadas ofrecen contextos mayores y licencias más permisivas.

## Limitaciones y advertencias

- Licencia CC BY-NC-ND 4.0: prohíbe el uso comercial y la distribución de obras derivadas (incluidos modelos ajustados), y exige atribución. No es apta para productos comerciales sin licencia adicional del autor.
- Repetición en generación larga: el autor documenta que por encima de ~700 tokens puede repetir frases parafraseadas; recomienda `repeat_penalty` de 1.15-1.2 o limitar `max_tokens` a 600 o menos.
- Sin `repeat_penalty` adecuado, el modelo puede no detener la generación y emitir tokens repetidos o corruptos; los valores de muestreo indicados son obligatorios en la práctica.
- Discrepancia contexto entrenamiento/ventana: entrenado a 768 tokens pero declara 8192 de contexto; el rendimiento más allá de ~768-1000 tokens no está garantizado.
- Cobertura lingüística limitada a coreano e inglés; no se documenta soporte de español ni de otros idiomas.
- Modelo pequeño (2,3B): riesgo elevado de alucinación y de errores en matemáticas o código complejo; requiere verificación humana en usos sensibles.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Sesgos: no se documentan evaluaciones de sesgo; al estar entrenado principalmente en coreano, puede reflejar sesgos culturales y lingüísticos de ese corpus.
- Adopción muy baja (550 descargas, 2 likes) y autor de perfil poco conocido: menor garantía de mantenimiento y soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Team-CorerepubliX/Gureum_1.0_neo
- Organización en Hugging Face: https://huggingface.co/Team-CorerepubliX
- Licencia CC BY-NC-ND 4.0: https://creativecommons.org/licenses/by-nc-nd/4.0/
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
