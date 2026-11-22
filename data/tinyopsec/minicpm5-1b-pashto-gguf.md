# tinyopsec/MiniCPM5-1B-Pashto-GGUF

## Resumen

MiniCPM5-1B-Pashto-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo `nassimjp/MiniCPM5-1B-Pashto`, una adaptacion del MiniCPM5-1B de OpenBMB en la que se ha realizado una intervencion sobre el tokenizador (tokenizer surgery) para mejorar la cobertura de pashto y urdu. El modelo lo publica el usuario tinyopsec en Hugging Face y esta pensado para su uso con llama.cpp y otros runtimes compatibles con GGUF (Ollama, LM Studio, koboldcpp).

El modelo base parte de la arquitectura MiniCPM5-1B, un transformer decoder-only de aproximadamente 1.080 millones de parametros. La intervencion en el tokenizador busca reducir la fragmentacion de texto en pashto y urdu, dos idiomas con alfabeto arabe-persa que suelen tokenizarse de forma ineficiente en tokenizadores entrenados mayoritariamente con ingles y chino, lo que encarece el contexto efectivo y degrada la calidad en esos idiomas.

La relevancia de esta publicacion es practica: ofrece el modelo en 13 niveles de cuantizacion desde F16 hasta Q2_K, lo que permite desplegarlo en hardware muy modesto, incluido CPU, manteniendo la licencia Apache 2.0 del modelo original. No obstante, se trata de un artefacto de cuantizacion sin model card detallada, sin datos de evaluacion y sin informacion sobre el proceso de tokenizer surgery, por lo que debe tratarse como un recurso a validar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MiniCPM5-1B) |
| Parametros totales | 1.080.774.144 (~1,08 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible oficialmente; el autor declara adaptacion para pashto y urdu |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (13 ficheros); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 10,8 GB (conjunto de todas las cuantizaciones) |
| Tamano de F16 | 2,0 GB (segun model card) |
| Modelo base | nassimjp/MiniCPM5-1B-Pashto (a su vez derivado de openbmb/MiniCPM5-1B) |
| Libreria | gguf / llama.cpp |

## Arquitectura y entrenamiento

La arquitectura corresponde al MiniCPM5-1B original de OpenBMB: un transformer decoder-only denso de aproximadamente 1.080 millones de parametros. La modificacion introducida por el autor del modelo base (`nassimjp/MiniCPM5-1B-Pashto`) es un tokenizer surgery, es decir, la sustitucion o ampliacion del vocabulario del tokenizador para representar de forma mas eficiente texto en pashto y urdu. La model card de esta publicacion no detalla el alcance exacto de esa intervencion (si se reemplazo el vocabulario, se amplio, o si hubo reentrenamiento de embeddings y capas asociadas), ni si se realizo un ajuste fino posterior sobre corpus en esos idiomas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). Esta publicacion se limita a la conversion y cuantizacion del modelo base mediante llama.cpp, sin aportar detalles sobre el pipeline de entrenamiento. Cualquier afirmacion sobre calidad linguistica en pashto o urdu debe validarse empiricamente por el usuario.

## Capacidades

- Generacion de texto conversacional en formato chat, segun el tag `conversational` del repositorio.
- Procesamiento de texto en pashto y urdu con un tokenizador adaptado, lo que en teoria reduce el numero de tokens por palabra frente al tokenizador original.
- Generacion de texto en otros idiomas heredados del MiniCPM5-1B original, aunque sin garantias ni evaluacion publicada.
- Compatibilidad con tool calling y function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (vision, audio): no disponibles; el repositorio es solo de texto.
- Modo thinking o razonamiento extendido: no disponible.
- Ejecucion en CPU y GPU mediante llama.cpp, Ollama, LM Studio y koboldcpp.

## Casos de uso

- Traduccion y transcripcion asistida pashto-espanol o urdu-espanol: el tokenizador adaptado reduce la fragmentacion del texto en alfabeto arabe-persa, lo que permite procesar mas contenido por ventana de contexto y abarata el coste por token en tareas de traduccion por lotes.
- Atencion al cliente en comunidades diasporicas: un chatbot desplegado en CPU con la cuantizacion Q4_K_M (aproximadamente 700 MB) puede gestionar conversaciones multi-turno basicas en pashto o urdu en entornos con hardware limitado, como un servidor pequeno o incluso una Raspberry Pi con suficiente RAM.
- Prototipado rapido de aplicaciones NLP de bajo coste: gracias a los 13 niveles de cuantizacion, un equipo puede empezar con Q2_K en un portatil y escalar a Q8_0 o F16 segun los requisitos de calidad, sin cambiar de runtime.
- Generacion de contenido educativo y divulgativo en pashto: redaccion de resumenes, explicaciones o materiales didacticos, siempre con revision humana dada la ausencia de evaluacion publicada.
- Preprocesamiento y normalizacion de corpus: uso del modelo para tareas auxiliares de limpieza, reescritura o etiquetado ligero de texto en pashto y urdu dentro de pipelines de datos.
- Despliegue en entornos air-gapped o de borde: al ser un modelo de ~1 B de parametros en GGUF, puede ejecutarse completamente offline en dispositivos sin GPU, lo que encaja en escenarios de privacidad estricta o conectividad intermitente.
- Experimentacion academica sobre tokenizer surgery: sirve como artefacto reproducible para estudiar el impacto de la modificacion del tokenizador en la eficiencia y calidad de modelos pequenos en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas en pashto o urdu, ni comparaciones con el modelo base sin modificacion. Tampoco se documentan latencias o throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, segun cuantizacion):
  - F16: ~2,0 GB
  - Q8_0: ~1,1 GB
  - Q6_K: ~0,9 GB
  - Q5_K_M / Q5_K_S / Q5_0: ~0,8 GB
  - Q4_K_M / Q4_K_S / Q4_0: ~0,7 GB
  - Q3_K_L / Q3_K_M / Q3_K_S: ~0,6 GB
  - Q2_K: ~0,5 GB
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; para cuantizaciones de 4 bits basta con 1 GB. Funciona bien en GTX 1650, RTX 3050, RTX 4060, e incluso en GPUs integradas con memoria compartida.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas e incluso en muchas integradas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones. En CPU moderna se espera una generacion utilizable para un modelo de 1 B en 4 bits, pero sin cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas foco | Licencia | Formato | Evaluacion publicada |
|---|---|---|---|---|---|---|
| MiniCPM5-1B-Pashto-GGUF (este) | ~1,08 B | no disponible | pashto, urdu | Apache 2.0 | GGUF | no |
| MiniCPM5-1B (openbmb) | ~1,08 B | no disponible en esta ficha | multilingue general | Apache 2.0 | safetensors | si (en su model card original) |
| Qwen2.5-1.5B | ~1,5 B | 32 768 tokens | multilingue (incluye algo de urdu) | Apache 2.0 | safetensors, GGUF | si |
| Gemma 2 2B | ~2,6 B | 8 192 tokens | multilingue | Gemma license | safetensors, GGUF | si |

La comparativa es orientativa: no existe evaluacion publica de este modelo frente a alternativas en pashto o urdu, por lo que la eleccion deberia basarse en pruebas propias. Frente a Qwen2.5-1.5B o Gemma 2 2B, la ventaja de este modelo es el tokenizador especifico para pashto/urdu y su menor huella de memoria; la desventaja es la falta de documentacion y de benchmarks.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks ni pruebas de calidad en pashto, urdu ni otros idiomas, por lo que el rendimiento real es desconocido.
- Model card minima: no se documenta el alcance del tokenizer surgery, el dataset de ajuste, ni si los embeddings fueron reentrenados; esto dificulta evaluar la fidelidad linguistica.
- Riesgo de alucinacion: como cualquier modelo de ~1 B de parametros, la tasa de alucinacion en tareas factuales es probablemente alta; requiere verificacion humana.
- Sesgos conocidos: no documentados, pero al derivar de un modelo entrenado mayoritariamente con datos en ingles y chino, es esperable un sesgo cultural y linguistico hacia esas lenguas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta especificada; el soporte de pashto y urdu depende de la calidad del tokenizer surgery y del ajuste posterior, no verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base `nassimjp/MiniCPM5-1B-Pashto` y `openbmb/MiniCPM5-1B` mantienen la misma licencia y cumplir sus terminos.
- Caveat de produccion: al ser una cuantizacion, las versiones de 2 y 3 bits pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Repositorio de 10,8 GB: descargar el repo completo es innecesario; conviene bajar solo el fichero GGUF de la cuantizacion deseada.
- Fecha de creacion futura (2026-10-28) en los metadatos: conviene verificar la integridad y procedencia del artefacto antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/MiniCPM5-1B-Pashto-GGUF
- Modelo base (adaptacion pashto): https://huggingface.co/nassimjp/MiniCPM5-1B-Pashto
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
