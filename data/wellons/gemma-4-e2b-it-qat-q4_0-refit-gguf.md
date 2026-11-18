# wellons/gemma-4-E2B-it-qat-q4_0-refit-GGUF

## Resumen

`wellons/gemma-4-E2B-it-qat-q4_0-refit-GGUF` es una re-cuantización corregida del checkpoint QAT de Gemma 4 E2B IT publicado por Google. El modelo base, `google/gemma-4-E2B-it-qat-q4_0-unquantized`, fue entrenado con quantization-aware training para que sus pesos lineales descansaran sobre una rejilla de 4 bits (bloques de 32 valores, paso propio por bloque, enteros en el rango -8..7). Sin embargo, el GGUF q4_0 oficial de Google vuelve a cuantizar esos pesos con la regla estándar de llama.cpp, que aproxima el paso a partir del valor de mayor magnitud del bloque y se desvía alrededor de un 5% del paso aprendido durante el entrenamiento.

Este repositorio corrige ese desajuste: parte del GGUF q4_0 de Google y sustituye únicamente los datos tensoriales q4_0, reajustando el paso de cada bloque por mínimos cuadrados contra el checkpoint original. El error relativo de pesos baja de aproximadamente un 5% a aproximadamente un 0,14%, que es el nivel de redondeo del propio bf16. Los metadatos, el tokenizer, los embeddings q6_K y las normas se conservan byte a byte del original.

El resultado es un GGUF de 3.349.516.256 bytes (3,3 GB de repositorio) con 4.628.569.635 parámetros totales, licencia Apache 2.0 y pipeline de text-generation. Solo incluye el modelo de texto: no hay proyector de visión ni de audio. Es relevante para quienes despliegan Gemma 4 E2B en entornos con restricciones de memoria y quieren recuperar la precisión que el QAT de Google había conseguido, sin cambiar de formato ni de motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E2B, transformer; detalles no incluidos en la informacion) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4_0 (datos tensoriales reajustados por minimos cuadrados); embeddings en q6_K; normas sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (terminos de Gemma 4 de Google) |
| Formato de pesos | GGUF (un unico fichero `gemma-4-E2B-it-qat-q4_0-refit.gguf`, 3.349.516.256 bytes, SHA-256 `ad5ae441f8efc3f5588a9567ff6cc31d99e104f94815996fc2dae0ff6d06cf28`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint `google/gemma-4-E2B-it-qat-q4_0-unquantized`, del que esta ficha no documenta capas, cabezas ni mecanismos de atención concretos; la información disponible no detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida. Lo que sí está documentado es el proceso de cuantización: Google entrenó el checkpoint con QAT para que cada bloque de 32 pesos lineales fuera un paso escalar multiplicado por enteros en -8..7, con un paso independiente por bloque.

El trabajo de este repositorio es un refit numérico, no un reentrenamiento. El script `refit.py`, que solo depende de numpy, lee el GGUF q4_0 oficial de Google (SHA-256 `fa401b55…dec6634`) y el `model.safetensors` del checkpoint QAT (SHA-256 `33fe0cec…c6bf0137`), y para cada bloque ajusta el paso por mínimos cuadrados al valor entrenado. La regla de llama.cpp fija el paso como el valor de mayor magnitud dividido entre -8, lo que introduce un error de en torno al 5%; el ajuste por mínimos cuadrados recupera la rejilla entrenada y deja el error relativo en aproximadamente un 0,14%, comparable al redondeo bf16. El layout del fichero coincide con el GGUF de Google, por lo que debería cargarse en los mismos motores, aunque el autor solo lo ha probado con un motor de inferencia en C propio, no con llama.cpp.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el sufijo `-it` indican un modelo ajustado para instrucciones y diálogo multi-turno.
- Razonamiento y generación de código: capacidades heredadas del checkpoint Gemma 4 E2B IT; no se detallan en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Visión y audio: no incluidas. El autor indica explícitamente que solo se incluye el modelo de texto, sin proyector de visión ni de audio.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en CPU o GPU con poca memoria: con 3,3 GB en disco y cuantización q4_0, el modelo cabe en equipos de consumo y en instancias pequeñas de cloud, lo que permite servir Gemma 4 E2B sin renunciar a la precisión del QAT original.
- Evaluación de pipelines de cuantización: el repositorio incluye `refit.py` y las huellas SHA-256 de las entradas, de modo que sirve como caso reproducible para estudiar el impacto del error de paso en q4_0 frente a una rejilla entrenada.
- Chat conversacional de bajo coste: el tag `conversational` y el ajuste de instrucciones lo hacen adecuado para asistentes de texto en aplicaciones donde el presupuesto de VRAM es limitado.
- Sustitución directa del GGUF oficial de Google: al conservar el layout, metadatos, tokenizer, embeddings q6_K y normas byte a byte, puede reemplazar a `gemma-4-E2B_q4_0-it.gguf` en despliegues existentes sin cambios de configuración.
- Investigación sobre QAT: permite comparar, sobre el mismo checkpoint, la fidelidad de la cuantización estándar de llama.cpp frente a un ajuste por mínimos cuadrados, con métricas de acuerdo top-1 y KL.
- Prototipado local en estaciones de trabajo: el tamaño reducido facilita iterar en local sobre prompts y flujos conversacionales antes de escalar a variantes mayores de Gemma 4.

## Benchmarks y rendimiento

El autor publica una comparación de fidelidad frente a una build int8 del mismo checkpoint, medida sobre aproximadamente 1.000 posiciones de texto de WikiText-103 en teacher forcing:

| Modelo | Acuerdo top-1 | KL media |
|---|---:|---:|
| GGUF q4_0 de Google | 88,4% | 0,0494 |
| Este GGUF (refit) | 97,2% | 0,0047 |

Como referencia de escala, la build int8 coincide con el checkpoint bf16 ejecutado en Transformers en el 96,5% de 2.388 posiciones, con KL media de 0,0052. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3,5-4 GB con la cuantización q4_0 incluida, considerando pesos de 3,3 GB más overhead de contexto y caché KV; el valor exacto depende de la longitud de contexto y del motor.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con 6 GB o más de VRAM debería poder alojarlo.
- GPU de consumo: sí cabe en tarjetas de consumo con 6-8 GB o más (por ejemplo, gama RTX xx60/xx70 recientes); no confirmado por el autor.
- Opciones de despliegue: el autor solo lo ha probado con un motor de inferencia en C independiente, no con llama.cpp. El layout es idéntico al GGUF de Google, por lo que en principio es compatible con llama.cpp y derivados (Ollama, etc.), pero no está verificado.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este refit GGUF | 4.628.569.635 | no disponible | q4_0 reajustado, embeddings q6_K | Apache 2.0 | Acuerdo top-1 97,2% y KL 0,0047 frente a int8 |
| GGUF q4_0 oficial de Google (`gemma-4-E2B_q4_0-it.gguf`) | mismo checkpoint | no disponible | q4_0 estandar de llama.cpp | Apache 2.0 | Acuerdo top-1 88,4% y KL 0,0494 frente a int8 |
| Checkpoint QAT sin cuantizar (`google/gemma-4-E2B-it-qat-q4_0-unquantized`) | mismo checkpoint | no disponible | safetensors | Apache 2.0 | Referencia de precision; mayor peso en disco |

No se dispone de datos de benchmarks de tareas ni de comparaciones con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: no incluye proyector de visión ni de audio, por lo que no puede procesar imágenes ni audio.
- Compatibilidad no verificada con llama.cpp: el autor solo lo ha probado con un motor en C propio; conviene validar la carga antes de usarlo en producción.
- Dependencia del GGUF oficial: el refit se genera a partir del fichero q4_0 de Google y de su `model.safetensors`; si esos artefactos cambian, las huellas SHA-256 publicadas dejan de coincidir.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- Sesgos: no disponible; el repositorio no publica análisis de sesgos.
- Idiomas: no declarados; no se puede confirmar cobertura multilingüe.
- Licencia: Apache 2.0 según el autor, con enlace a los términos de Gemma 4 de Google; conviene revisar esa página para obligaciones adicionales de uso comercial.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Fecha de creación del repositorio: 2026-11-18.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wellons/gemma-4-E2B-it-qat-q4_0-refit-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Script de refit: `refit.py`, incluido en el repositorio del modelo
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
