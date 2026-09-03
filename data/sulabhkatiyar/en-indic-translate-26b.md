# sulabhkatiyar/en-indic-translate-26b

## Resumen

`en-indic-translate-26b` es un modelo de traducción automática de inglés a once lenguas índicas (asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, panyabí, tamil y telugu), desarrollado por sulabhkatiyar mediante fine-tuning del modelo base `google/gemma-4-26B-A4B-it`. Su característica diferencial es la preservación de fórmulas LaTeX, bloques de código y la estructura general del documento durante la traducción, lo que lo hace especialmente útil para contenido técnico y académico.

El modelo hereda la arquitectura Mixture-of-Experts de Gemma 4, con 25 805 933 872 parámetros totales y aproximadamente 4 000 millones de parámetros activos por token. Está disponible en formato safetensors y se distribuye bajo la licencia Gemma. Aunque el repositorio no incluye benchmarks publicados, su diseño orientado a traducción técnica lo posiciona como una opción relevante para localización de documentación científica y de software en el ecosistema índico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Gemma 4 |
| Parametros totales | 25 805 933 872 (25,8 B) |
| Parametros activos | ~4 B (A4B) |
| Longitud de contexto | 32 768 tokens (segun ejemplo de vLLM en la model card) |
| Tipos de cuantizacion | no disponible (solo safetensors en BF16) |
| Idiomas soportados | ingles, asames, bengali, guyarati, hindi, canares, malayalam, marati, oriya, panyabi, tamil, telugu |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/gemma-4-26B-A4B-it`, un transformer decoder-only con arquitectura MoE que activa aproximadamente 4 000 millones de parámetros por token, lo que reduce el coste computacional en inferencia frente a un modelo denso del mismo tamaño. El proceso de entrenamiento se centra en la tarea de traducción inglés-lenguas índicas, aunque la model card no detalla el volumen de datos, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La innovación principal del fine-tuning es la capacidad de mantener intactas fórmulas LaTeX, bloques de código y la estructura de documentos (títulos, listas, tablas) durante la traducción, algo que los modelos de traducción genéricos suelen degradar.

## Capacidades

- Traduccion de ingles a 11 lenguas indicas: asames, bengali, guyarati, hindi, canares, malayalam, marati, oriya, panyabi, tamil y telugu.
- Preservacion de formulas LaTeX (inline y display) y notacion matematica.
- Preservacion de bloques de codigo en cualquier lenguaje de programacion, incluyendo indentacion y comentarios.
- Mantenimiento de la estructura del documento: encabezados, listas, tablas y parrafos.
- Generacion de texto conversacional (heredada del modelo base Gemma 4 instruct).
- Soporte de chat multi-turno mediante `apply_chat_template` de HuggingFace Transformers.
- Compatible con vLLM para inferencia de alto rendimiento.

## Casos de uso

- Localizacion de documentacion tecnica: traducir manuales de API, guias de usuario y wikis internas al hindi, tamil o bengali manteniendo intactos los ejemplos de codigo y las formulas.
- Traduccion de articulos academicos: convertir papers de machine learning o fisica a lenguas indicas sin perder las expresiones matematicas en LaTeX, facilitando la divulgacion cientifica regional.
- Traduccion de documentacion de software: traducir README, docstrings y comentarios de codigo a lenguas indicas, preservando la sintaxis y los bloques de codigo para que el resultado sea directamente utilizable.
- Atencion al cliente multilingue: desplegar el modelo como backend de un chatbot de soporte que responda en varias lenguas indicas, aprovechando su capacidad conversacional y su contexto de 32K tokens para gestionar historiales largos.
- Traduccion de contenido educativo: convertir cursos online, tutoriales y materiales de formacion a lenguas regionales, manteniendo la estructura de ejercicios y ejemplos practicos.
- Traduccion de contenido web: localizar blogs, articulos y paginas de documentacion preservando el marcado Markdown o HTML, lo que permite publicar directamente sin re-maquetar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como BLEU, MMLU, HumanEval o similares, ni comparaciones con otros modelos de traduccion indicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en BF16 ocupa aproximadamente 51,6 GB (coincide con el tamano del repositorio). Con cuantizacion de 4 bits (no proporcionada oficialmente) se estima un uso de VRAM en torno a 13-15 GB, aunque no hay archivos GGUF ni AWQ publicados.
- GPU recomendadas: para ejecucion en BF16 se necesitan GPUs con al menos 52 GB de VRAM, como A100 80GB, H100 80GB o AMD MI300X (entorno donde fue probado). Con cuantizacion 4-bit podria caber en una RTX 4090 (24 GB) o similar, pero no se dispone de archivos cuantizados oficiales.
- Opciones de despliegue: vLLM (ejemplo incluido en la model card), HuggingFace Transformers con `device_map="auto"` y `torch_dtype="bfloat16"`. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al ser un MoE con 4B activos, la inferencia es significativamente mas rapida que un modelo denso de 26B, pero no se aportan cifras concretas.
- Advertencia: el autor indica que el modelo fue desarrollado y probado en GPUs AMD MI300X con ROCm; algunos paquetes pueden requerir ajustes en entornos NVIDIA CUDA.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria (traduccion ingles-lenguas indicas con preservacion de formato tecnico). Modelos como IndicTrans2 o NLLB podrian ser comparables, pero no hay datos de rendimiento ni de licencia en la informacion proporcionada. Se recomienda evaluar el modelo frente a estas alternativas en el caso de uso concreto.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos, pero el modelo hereda los posibles sesgos del modelo base Gemma 4, que pueden reflejarse en las traducciones.
- Riesgo de alucinacion: como todo modelo generativo, puede producir traducciones incorrectas o inventar contenido, especialmente en lenguas con menos representacion en el entrenamiento.
- Limitaciones de contexto: la ventana de 32K tokens es amplia, pero no se ha verificado su comportamiento en contextos muy largos ni en documentos extensos.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso comercial especificas; es obligatorio revisar los terminos en https://ai.google.dev/gemma/terms antes de desplegar el modelo en produccion.
- Dependencia del entorno: el modelo fue probado en AMD MI300X con ROCm; en NVIDIA CUDA pueden ser necesarios ajustes de versiones de paquetes (por ejemplo, en vLLM o transformers).
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF, AWQ o GPTQ, lo que limita su despliegue en hardware de consumo sin un proceso de cuantizacion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sulabhkatiyar/en-indic-translate-26b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Terminos de la licencia Gemma: https://ai.google.dev/gemma/terms
