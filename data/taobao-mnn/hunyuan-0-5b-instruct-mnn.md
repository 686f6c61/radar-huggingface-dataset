# taobao-mnn/Hunyuan-0.5B-Instruct-MNN

## Resumen

Hunyuan-0.5B-Instruct-MNN es un paquete de inferencia en formato MNN del modelo Tencent Hunyuan-0.5B-Instruct, convertido y publicado por el equipo taobao-mnn. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión cuantizada del modelo denso de 0.5B parámetros de Tencent, empaquetada para ejecutarse con el runtime MNN (Mobile Neural Network) de Alibaba. El objetivo es permitir la inferencia en CPU y, potencialmente, en dispositivos móviles, con un consumo de memoria reducido gracias a la cuantización HQQ.

El paquete aplica cuantización HQQ (Half-Quadratic Quantization) de 4 bits al cuerpo del transformer y de 8 bits a la cabeza de salida LM, que además se comparte con la capa de embeddings de entrada. La arquitectura subyacente es `hunyuan_v1_dense` con 24 capas, y el modelo está orientado a generación de texto en chino e inglés. El repositorio ocupa 0.8 GB y está pensado para ejecutarse por defecto en CPU con 4 hilos.

La relevancia de esta ficha es doble: por un lado, documenta una vía práctica de despliegue de un modelo pequeño en entornos sin GPU; por otro, el propio autor advierte de limitaciones de calidad notables (traducciones largas que parafrasean en lugar de traducir, errores en traducciones cortas por defecto) y de restricciones geográficas y de uso muy estrictas en la licencia de Tencent. Es, por tanto, un artefacto útil para pruebas de integración con MNN más que para producción de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `hunyuan_v1_dense` (transformer denso), 24 capas |
| Parametros totales | 0.5B (modelo base Tencent Hunyuan-0.5B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el autor indica que la máxima contexto no fue verificada) |
| Tipos de cuantizacion | HQQ 4-bit en el cuerpo (group=64, alpha en FP16); HQQ 8-bit en la cabeza LM (group=64, alpha en FP16); embeddings de entrada comparten pesos con la cabeza LM cuantizada |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Tencent Hunyuan Community License Agreement (etiquetada como `other`); no aplicable en EU, Reino Unido ni Corea del Sur |
| Formato de pesos | MNN (paquete de inferencia propietario del runtime MNN); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso (`hunyuan_v1_dense`) de 24 capas y 0.5B parámetros, desarrollado por Tencent y publicado como Hunyuan-0.5B-Instruct. Esta conversión no aporta información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO o fases de alineación); la model card del paquete MNN se limita a describir la conversión y el empaquetado, no el entrenamiento del modelo base.

La innovación técnica de este artefacto es la cuantización HQQ aplicada de forma asimétrica: 4 bits para el cuerpo del transformer y 8 bits para la cabeza de salida LM, con grupos de 64 y escalas en FP16. La cabeza de salida se comparte con la matriz de embeddings de entrada, lo que reduce el número de parámetros almacenados. El paquete está verificado con MNN 3.6.2 (commit `2c0b58a001bd13dbb9cfac98a533e2e7e96b1b44`), compilado con `MNN_BUILD_LLM` y `MNN_LOW_MEMORY`. La configuración por defecto es CPU, 4 hilos, `precision=low` y `memory=low`. El autor indica que la conversión se realizó a partir del modelo FP32 y que el commit de conversión fue `b0239771b07b317a258fbc384683bbd540741406`, aunque en la revisión de 2026-11-20 no se reconvirtió el modelo.

## Capacidades

- Generación de texto conversacional en chino e inglés, con plantilla de chat incluida en `llm_config.json`.
- Traducción entre chino e inglés, aunque con calidad limitada y verificada como insuficiente en el caso de traducciones largas (el modelo parafrasea el contexto en lugar de traducir).
- Aritmética básica: la prueba `arithmetic` pasa en la verificación del autor.
- Saludos y respuestas cortas: la prueba `greeting` pasa en la verificación del autor.
- Inferencia en CPU sin GPU, con bajo consumo de memoria gracias a la cuantización HQQ 4/8 bits.
- Soporte de decodificación greedy y configuraciones de precisión alta en el runtime MNN.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode). No disponible.

## Casos de uso

- Pruebas de integración con MNN: el paquete sirve para validar pipelines de inferencia MNN en CPU antes de desplegar modelos mayores, usando `llm_demo` con `config.json` y un fichero `prompt.txt`.
- Prototipado de asistentes conversacionales ligeros en chino e inglés: adecuado para demos internas donde la latencia y el coste de GPU no son viables, aceptando la calidad limitada del modelo de 0.5B.
- Generación de respuestas cortas en aplicaciones embebidas: saludos, confirmaciones y respuestas de una o dos frases, ámbito en el que las pruebas del autor pasan.
- Traducción de cadenas cortas con revisión humana: útil como primer borrador en pipelines de localización, dado que el autor advierte de errores en traducciones por defecto y de paráfrasis en textos largos.
- Evaluación comparativa de cuantizaciones: sirve para medir el impacto de HQQ 4/8 bits frente al modelo FP32 original en tareas controladas (`greeting`, `arithmetic`, `translation`, `long_translation`).
- Despliegue en entornos con restricciones de memoria: el paquete de 0.8 GB y la configuración `memory=low` permiten ejecutarlo en máquinas sin GPU dedicada, siempre que la licencia lo permita en la jurisdicción de uso.
- Base para experimentos de destilación o ajuste fino posterior: al ser un derivado cuantizado, no se recomienda como punto de partida para reentrenamiento, pero sí como referencia de comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor documenta únicamente una verificación funcional cualitativa realizada el 2026-11-20 en CPU x64 sobre cuatro tareas:

| Prueba | Resultado |
|---|---|
| `greeting` | pasa (verificación exacta y configuración por defecto) |
| `arithmetic` | pasa (verificación exacta y configuración por defecto) |
| `translation` | pasa en estructura, pero el autor advierte de errores en la traducción por defecto ("晨报") |
| `long_translation` | falla en precisión exacta; aceptado manualmente, el resultado automático sigue siendo `false` |

El autor indica que la precisión de las expresiones regulares por defecto es solo orientativa y no constituye una declaración de precisión global del modelo. No se verificaron ARM FP16, GPU, dispositivos móviles, contexto máximo ni rendimiento (throughput/latencia).

## Requisitos de hardware

- VRAM estimada: no aplica en la configuración por defecto, que es CPU. El repositorio ocupa 0.8 GB, por lo que la memoria RAM necesaria para cargar los pesos cuantizados es del orden de esa cifra, más el overhead del runtime MNN.
- GPU recomendadas: no disponibles; el autor no verificó GPU. La configuración validada es CPU x64 con 4 hilos.
- ¿Cabe en GPU de consumo? No hay datos verificados. El tamaño del paquete (0.8 GB) sugiere que cabría en cualquier GPU de consumo moderna, pero no se ha validado la ruta GPU en MNN para este paquete.
- Opciones de despliegue: runtime MNN 3.6.2 con `MNN_BUILD_LLM` y `MNN_LOW_MEMORY`, ejecutando `./MNN/build/llm_demo ./Hunyuan-0.5B-Instruct-MNN/config.json prompt.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MNN propietario.
- Latencia y throughput: no disponibles. El autor no publica mediciones de rendimiento y advierte que ARM FP16, GPU y dispositivos móviles no fueron verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hunyuan-0.5B-Instruct-MNN (este) | 0.5B | no disponible | MNN (HQQ 4/8 bits) | Tencent Hunyuan Community License (excluye EU/UK/Corea del Sur) | Paquete de inferencia CPU verificado con MNN 3.6.2 |
| tencent/Hunyuan-0.5B-Instruct | 0.5B | no disponible | safetensors (modelo original) | Tencent Hunyuan Community License | Modelo base sin cuantizar; referencia de calidad frente al que se mide esta conversión |
| Qwen2.5-0.5B-Instruct | 0.5B | 32 768 tokens (según documentación pública de Qwen) | safetensors, GGUF | Apache 2.0 | Alternativa de tamaño similar con licencia permisiva y ecosistema de despliegue amplio (llama.cpp, vLLM, Ollama) |
| SmolLM2-360M-Instruct | 0.36B | 8 192 tokens (según documentación pública) | safetensors, GGUF | Apache 2.0 | Alternativa aún más pequeña, orientada a dispositivos, con licencia permisiva |

La comparación con Qwen2.5-0.5B-Instruct y SmolLM2 es relevante porque ofrecen licencias permisivas y formatos estándar (GGUF, safetensors) que evitan las restricciones geográficas de la licencia de Tencent y permiten su uso en vLLM, llama.cpp u Ollama. No se dispone de datos de benchmarks de este paquete MNN para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Calidad de traducción limitada: el propio autor advierte que en casos largos el modelo parafrasea el contexto en lugar de traducir, y que la traducción corta por defecto contiene errores ("晨报") aunque las expresiones regulares pasen.
- La verificación de precisión es parcial: solo se validaron cuatro tareas en CPU x64; ARM FP16, GPU, dispositivos móviles y contexto máximo no se verificaron.
- Riesgo de alucinación: inherente a un modelo de 0.5B parámetros; no se documentan mitigaciones específicas.
- Sesgos: no disponibles en la información proporcionada; no se documenta evaluación de sesgos.
- Restricciones de licencia severas: la Tencent Hunyuan Community License no se aplica en la Unión Europea, Reino Unido ni Corea del Sur, y no se permite usar ni distribuir el modelo en esas regiones.
- Obligaciones de distribución: hay que incluir `LICENSE` y `Notice.txt`; las secciones 5(a)/(b) sobre cumplimiento legal, Acceptable Use Policy y restricciones de uso deben incorporarse como cláusulas ejecutables en los acuerdos downstream y notificarse a los usuarios posteriores.
- Umbral de usuarios: según la sección 4, si un producto o servicio supera los 100 millones de usuarios activos mensuales en el mes natural anterior a la fecha de publicación de la versión, se requiere licencia adicional de Tencent.
- Prohibición de mejora de terceros: no se puede usar el modelo, sus salidas o resultados para mejorar modelos de IA que no sean Tencent Hunyuan o sus derivados.
- El `Notice.txt` original menciona 7B aunque el paquete es de 0.5B; el autor conserva los bytes originales sin reescribirlos, lo que puede generar confusión en la atribución.
- No mezclar revisiones del paquete: el autor indica que el paquete se actualiza de forma conjunta y no deben combinarse ficheros de distintas revisiones.
- Formato propietario MNN: no es directamente compatible con ecosistemas estándar como vLLM, llama.cpp, Ollama o TGI, lo que limita su portabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Hunyuan-0.5B-Instruct-MNN
- Modelo base en Hugging Face: https://huggingface.co/tencent/Hunyuan-0.5B-Instruct
- Modelo base en ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hunyuan-0.5B-Instruct/summary
- Repositorio MNN: https://github.com/alibaba/MNN
- Licencia Tencent Hunyuan Community License Agreement: incluida en el repositorio como `LICENSE`
- Aviso de atribución: incluido en el repositorio como `Notice.txt`
- Metadatos de exportación y verificación: `export_args.json`, `refresh_metadata.json` y `llm_config.json` en el repositorio
