# sy128/CQ3-Qwen3-4B-K4-Channel-FP4Mix

## Resumen

El modelo `sy128/CQ3-Qwen3-4B-K4-Channel-FP4Mix` es una variante cuantizada del modelo Qwen3-4B, desarrollada por el usuario sy128 (Shawn Yin) en Hugging Face. Se trata de un modelo denso de 4.411 millones de parámetros, basado en la arquitectura Transformer del Qwen3-4B, que ha sido sometido a un proceso de cuantización de canal con una mezcla de precisión FP4 (FP4Mix). El objetivo principal de esta variante es reducir el tamaño del modelo y acelerar la inferencia, manteniendo un equilibrio entre eficiencia y calidad, aunque no se dispone de documentación técnica detallada sobre el método exacto de cuantización empleado.

El modelo se publica en formato safetensors y el repositorio ocupa 17,7 GB, lo que sugiere que puede incluir múltiples archivos de pesos o versiones con diferentes niveles de cuantización. Aunque no se especifican la licencia ni los idiomas soportados, al derivar de Qwen3-4B, hereda las capacidades multilingües y de razonamiento del modelo base, que es conocido por su buen rendimiento en tareas de código, matemáticas y comprensión del lenguaje. La relevancia de este modelo radica en su potencial para despliegues en entornos con recursos limitados, como GPUs de consumo o dispositivos edge, gracias a la reducción de memoria que ofrece la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B soporta 32.768 tokens) |
| Tipos de cuantizacion | FP4Mix (cuantizacion de canal con mezcla FP4, segun el nombre) |
| Idiomas soportados | No disponible (heredados del modelo base, multilingue) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-4B, un modelo Transformer denso con 4.000 millones de parámetros (aunque el archivo safetensors muestra 4.411 millones, posiblemente por embeddings o cabezas adicionales). El Qwen3-4B original emplea una alternancia entre atención con ventana deslizante y atención completa, y fue entrenado con 3,6 billones de tokens en un corpus multilingüe, seguido de fases de supervisión fina y optimización por preferencias humanas (RLHF/DPO). Sin embargo, la información específica sobre el proceso de cuantización aplicado en esta variante no está disponible en el repositorio. El nombre sugiere una cuantización por canal (Channel) con una mezcla de precisión FP4 (FP4Mix), probablemente diseñada para reducir el tamaño de los pesos manteniendo la calidad, pero no se han publicado detalles técnicos sobre la metodología, los datos de calibración ni el impacto en la precisión.

## Capacidades

- Generacion de texto y comprension del lenguaje: hereda las capacidades del Qwen3-4B, que incluyen generacion coherente, resumen, traduccion y respuesta a preguntas.
- Razonamiento y matematicas: el modelo base destaca en tareas de razonamiento aritmetico y logico, aunque la cuantizacion puede afectar ligeramente estos resultados.
- Generacion de codigo: soporta lenguajes de programacion comunes, aunque no se ha verificado el rendimiento en esta variante.
- Capacidades multilingues: el Qwen3-4B fue entrenado con datos en mas de 30 idiomas, por lo que esta variante probablemente mantiene ese soporte, aunque no se confirma.
- No se ha documentado soporte para tool calling, agentes o modo thinking en esta variante especifica.

## Casos de uso

- Inferencia en dispositivos con recursos limitados: al ser una cuantizacion FP4, el modelo reduce significativamente el uso de VRAM, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 o incluso en CPU con suficiente RAM, para aplicaciones de chatbot o asistentes locales.
- Prototipado rapido de aplicaciones de lenguaje: desarrolladores que necesitan un modelo de 4B con menor huella de memoria pueden usar esta variante para pruebas de concepto sin comprometer demasiado la calidad.
- Despliegue en entornos de produccion con restricciones de coste: la cuantizacion permite servir el modelo con menor infraestructura, reduciendo costes de inferencia en servicios en la nube.
- Educacion e investigacion: util para experimentos sobre el impacto de la cuantizacion en modelos de tamano medio, comparando con el Qwen3-4B original.
- Generacion de contenido en multiples idiomas: si se confirma el soporte multilingue, puede usarse para traduccion o generacion de texto en varios idiomas con un modelo ligero.
- Analisis de sentimiento o clasificacion de texto: tareas de NLP clasicas que no requieren contexto muy largo y se benefician de un modelo compacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas para esta variante cuantizada. Se recomienda consultar el repositorio de Hugging Face para futuras actualizaciones o ejecutar evaluaciones propias.

## Requisitos de hardware

- No se proporcionan requisitos oficiales en el repositorio.
- Dado el tamano del modelo (4.411 millones de parametros) y la cuantizacion FP4, se estima que el peso del modelo en memoria seria aproximadamente 2,2 GB (4.411M * 0,5 bytes), aunque el repositorio ocupa 17,7 GB, lo que sugiere que puede incluir multiples archivos o versiones sin cuantizar.
- Para inferencia, una GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 2060) podria ser suficiente si se carga el modelo cuantizado, pero no hay confirmacion.
- Opciones de despliegue: al ser safetensors, se puede usar con bibliotecas como Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama, pero no se ha verificado la compatibilidad.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B (original) | 4.000 M | 32.768 | No (BF16) | Apache 2.0 | Hugging Face |
| sy128/CQ3-Qwen3-4B-K4-Channel-FP4Mix | 4.411 M | No disponible | FP4Mix | No disponible | Hugging Face |
| Qwen3-4B-GGUF (comunidades) | 4.000 M | 32.768 | GGUF (varios niveles) | Apache 2.0 | Hugging Face |

No se dispone de comparativas de rendimiento publicadas entre esta variante y otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- La cuantizacion FP4 puede degradar la precision del modelo en tareas complejas de razonamiento o generacion de codigo, en comparacion con el modelo original en BF16.
- No se especifica la licencia, lo que impide conocer si es permitido el uso comercial o la redistribucion. Se recomienda contactar al autor antes de usar en produccion.
- No hay informacion sobre sesgos o alucinaciones especificas de esta variante, pero al derivar de Qwen3, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- La longitud de contexto no esta confirmada; si se reduce respecto al modelo base, podria limitar aplicaciones que requieren contexto largo.
- El repositorio no incluye documentacion tecnica sobre el proceso de cuantizacion, lo que dificulta evaluar su robustez o reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sy128/CQ3-Qwen3-4B-K4-Channel-FP4Mix
- Perfil del autor: https://huggingface.co/sy128
- Paper tecnico de Qwen3: https://arxiv.org/pdf/2505.09388
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Implementacion de Qwen3-4B para dispositivos Qualcomm: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b/README.md
