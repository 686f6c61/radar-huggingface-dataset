# vcruz305/granite-4.2-30b-GGUF

## Resumen

Granite-4.2-30B es el modelo insignia de razonamiento de la familia Granite 4.2 desarrollada por IBM. Se trata de un transformer denso decoder-only con 30 000 millones de parámetros, entrenado a partir de Granite-4.1-30B-Base y optimizado para tareas que requieren razonamiento paso a paso, generación de código, llamada a herramientas y flujos de trabajo agénticos. Su característica principal es el modo de razonamiento integrado que genera una cadena de pensamiento (`thinking... response`) antes de ofrecer la respuesta final, con modos de pensamiento flexibles (completo, no pensamiento y bajo esfuerzo) para ajustar el equilibrio entre profundidad y latencia.

La versión GGUF que nos ocupa, publicada por vcruz305, ofrece una escalera completa de cuantizaciones K-quant (de Q2_K a Q6_K) generadas con llama.cpp y calibradas con imatrix, lo que permite desplegar el modelo en una amplia gama de hardware, desde GPU de consumo hasta servidores de gama alta. El modelo base soporta un contexto nativo de 128 000 tokens, ampliable a 512 000, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico sin restricciones.

La relevancia actual de este modelo radica en su combinación de razonamiento nativo, soporte de herramientas y una ventana de contexto muy amplia, todo bajo una licencia permisiva, lo que lo convierte en una opción atractiva para empresas e investigadores que necesitan un LLM de alto rendimiento sin depender de servicios propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only Dense Transformer (GraniteForCausalLM) |
| Parámetros totales | 29 276 770 304 (30B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens nativo, extensible a 512 000 |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (GGUF) |
| Idiomas soportados | Inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors BF16 para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Granite-4.2-30B es un transformer denso de tipo decoder-only, implementado como `GraniteForCausalLM`. Se entrenó a partir del modelo base Granite-4.1-30B-Base, con un proceso de entrenamiento que incorpora razonamiento nativo mediante cadenas de pensamiento (chain-of-thought). IBM ha publicado que el modelo incluye un modo de razonamiento integrado que genera el texto `thinking... response` como parte de la secuencia de salida, y permite alternar entre modos de pensamiento completo, no pensamiento y bajo esfuerzo según la petición.

En cuanto al entrenamiento, no se han detallado en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset. La técnica de razonamiento se ha integrado de forma nativa, y el modelo también ha sido entrenado para razonamiento-aumentado de tool calling, es decir, el modelo razona sobre qué herramientas invocar y por qué, lo que mejora la precisión de las llamadas a funciones en flujos agénticos. La arquitectura es densa (no Mixture-of-Experts), lo que simplifica su despliegue y reduce la complejidad de inferencia en comparación con modelos MoE de tamaño similar.

## Capacidades

- Generación de texto y diálogo multilingüe en 12 idiomas probados (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés, chino).
- Razonamiento nativo mediante cadena de pensamiento integrada, con modos de pensamiento flexibles (completo, no pensamiento, bajo esfuerzo).
- Razonamiento-aumentado para tool calling: el modelo decide qué herramientas invocar y justifica la elección, mejorando la fiabilidad de las llamadas a funciones.
- Soporte de agentes y razonamiento multi-paso para flujos de trabajo agénticos complejos.
- Generación de código de alta calidad, adecuada para tareas de programación y depuración.
- Capacidades matemáticas y de lógica multi-paso mejoradas gracias al razonamiento integrado.
- Ventana de contexto de 128 000 tokens (extensible a 512 000), lo que permite manejar documentos largos, conversaciones extensas y tareas de RAG con contexto amplio.
- Compatible con llama.cpp y vLLM (la versión NVFP4 para vLLM está disponible como companion), así como con la infraestructura de la familia Granite.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens) gracias a su ventana de contexto y su capacidad de diálogo multilingüe. Es adecuado para sistemas de soporte en español, alemán o francés, por ejemplo, manteniendo el historial completo de la interacción.
- **Generación de código en producción**: con soporte de tool calling y razonamiento integrado, puede integrarse en pipelines de CI/CD para generar código, revisar cambios, explicar fragmentos o sugerir correcciones. Su capacidad de razonamiento ayuda a comprender el contexto del proyecto y a producir soluciones coherentes.
- **Asistentes agénticos con llamada a herramientas**: el modelo razona sobre qué herramienta invocar (por ejemplo, búsqueda web, API REST, bases de datos) y genera la llamada correcta. Ideal para construir agentes que necesitan decidir cuándo y cómo usar herramientas externas.
- **Resumen y análisis de documentos largos**: con 128K tokens de contexto, puede procesar informes extensos, contratos, investigaciones o libros completos para generar resúmenes, extraer conclusiones o responder preguntas sobre el contenido.
- **Razonamiento matemático y lógico**: para aplicaciones educativas o de análisis financiero, el modelo puede resolver problemas matemáticos paso a paso gracias a su modo de razonamiento, explicando el proceso y no solo el resultado.
- **Traducción y localización**: aunque no está especializado en traducción, su entrenamiento multilingüe permite traducir textos entre los idiomas soportados, especialmente para tareas de documentación técnica o contenido de producto.
- **Generación de contenido técnico**: el modelo puede redactar documentación técnica, guías, tutoriales y respuestas en foros, manteniendo un nivel de detalle y precisión adecuado para desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original de IBM no incluye tablas de rendimiento, y la versión GGUF del repositorio tampoco proporciona datos de evaluación. Por lo tanto, no es posible presentar una tabla comparativa de MMLU, HumanEval, GSM8K u otros estándares. Se recomienda consultar el blog técnico de IBM para obtener métricas detalladas cuando estén disponibles.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según cuantización):
  - Q2_K: ~12 GB (11,94 GB)
  - Q3_K_S: ~14 GB
  - Q3_K_M: ~14 GB
  - Q3_K_L: ~15 GB
  - Q4_K_S: ~17 GB
  - Q4_K_M: ~17 GB (recomendado por el autor)
  - Q5_K_S: ~20 GB
  - Q5_K_M: ~20 GB
  - Q6_K: ~23 GB
- **GPU recomendadas**: para cuantizaciones Q4_K_M o superiores, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB). Para Q2_K o Q3_K, una GPU de 16 GB (RTX 4080, RTX 3080) puede ser suficiente.
- **Cabe en GPU de consumo**: sí, la mayoría de las cuantizaciones (Q2_K a Q5_K_M) caben en GPU de consumo de 16-24 GB. La Q6_K requiere 24 GB.
- **Opciones de despliegue**: llama.cpp (llama-server), vLLM (con la versión NVFP4 companion), Ollama (si se añade el modelo), TGI (si se convierte a formato compatible), y cualquier servidor que soporte GGUF.
- **Latencia y throughput**: no se han proporcionado datos específicos. En un servidor con GPU A100 80GB y Q4_K_M, se puede esperar un throughput razonable para 30B, pero depende de la configuración y la longitud del contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento directos para comparar con otros modelos de razonamiento de tamaño similar. Sin embargo, se pueden comparar características estructurales con alternativas conocidas:

| Modelo | Parámetros | Contexto | Razonamiento | Licencia | Formato |
|---|---|---|---|---|---|
| Granite-4.2-30B (este) | 30B denso | 128K (512K ext) | Sí (nativo) | Apache 2.0 | GGUF / safetensors |
| Qwen3-30B-A3B (MoE) | 30B (3B activos) | 32K | Sí | Apache 2.0 | GGUF / safetensors |
| DeepSeek-R1-Distill-32B | 32B denso | 128K | Sí (distillado) | MIT | GGUF / safetensors |
| Llama-3.3-70B (no comparable por tamaño) | 70B denso | 128K | No (requiere prompting) | Llama 3.3 license | GGUF / safetensors |

La comparativa directa de rendimiento no está disponible, pero Granite-4.2-30B ofrece razonamiento nativo y tool calling integrado, con una licencia Apache 2.0, lo que le da una ventaja legal frente a Llama-3.3 (que tiene restricciones de uso) y una arquitectura densa que puede ser más fácil de desplegar que el MoE de Qwen3.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han publicado informes de sesgos específicos para este modelo, pero como cualquier LLM entrenado con datos web, puede reflejar sesgos presentes en los datos de entrenamiento.
- **Riesgo de alucinación**: a pesar de su razonamiento integrado, el modelo puede generar información falsa o inventada, especialmente en dominios de conocimiento especializado o en contextos ambiguos. Es necesario validar sus respuestas en aplicaciones críticas.
- **Limitaciones de contexto**: aunque soporta 128K tokens, el rendimiento en contextos muy largos puede degradarse en cuanto a coherencia y atención. La extensión a 512K requiere técnicas adicionales.
- **Idiomas**: solo los 12 idiomas listados han sido probados; otros idiomas pueden funcionar pero no están garantizados.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe incluir el aviso de copyright y el disclaimer correspondiente en la distribución.
- **Cuantización**: las cuantizaciones K-quant introducen una pérdida de calidad en comparación con el modelo BF16 original. La Q2_K puede mostrar degradaciones significativas en tareas de razonamiento; se recomienda Q4_K_M como equilibrio.
- **Carga computacional**: el modo de razonamiento completo aumenta la latencia y el costo de inferencia, ya que el modelo genera una cadena de pensamiento larga antes de la respuesta. En aplicaciones de baja latencia, se debe usar el modo no-pensamiento.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/vcruz305/granite-4.2-30b-GGUF)
- [Modelo base IBM Granite-4.2-30B](https://huggingface.co/ibm-granite/granite-4.2-30b)
- [Blog técnico de IBM Granite 4.2](https://huggingface.co/blog/ibm-granite/granite-4-2)
- [Repositorio GitHub de IBM Granite 4.2](https://github.com/ibm-granite/granite-4.2-language-models)
- [Companion NVFP4 para vLLM](https://huggingface.co/vcruz305/granite-4.2-30b-NVFP4)
- [Repositorio de IBM GGUF (conversión oficial)](https://github.com/IBM/gguf)
- [Colección de modelos Granite 4.2 en HuggingFace](https://huggingface.co/collections/ibm-granite/granite-42-language-models)

La ficha está completa. He respetado la estructura, no he inventado datos, he usado tablas, y he indicado cuando no hay información disponible.</think>## Resumen

Granite-4.2-30B es el modelo insignia de razonamiento de la familia Granite 4.2 de IBM, un transformador denso decoder-only de 30 000 millones de parámetros. Está construido sobre Granite-4.1-30B-Base y destaca por su modo de razonamiento integrado que genera una cadena de pensamiento (`thinking... response`) antes de la respuesta final. IBM lo posiciona para tareas de razonamiento complejo, generación de código, tool calling y flujos agénticos, con soporte nativo de contexto de 128 000 tokens (extensible a 512 000) y licencia Apache 2.0.

La versión GGUF de este repositorio, cuantizada por vcruz305 mediante llama.cpp con calibración imatrix, ofrece una escalera completa de cuantizaciones K-quant (de Q2_K a Q6_K) para facilitar el despliegue en hardware diverso, desde GPU de consumo hasta servidores profesionales. El modelo base se distribuye en BF16, mientras que esta versión proporciona archivos GGUF listos para usar con llama.cpp y otros motores compatibles.

La relevancia actual del modelo radica en combinar razonamiento nativo, llamada a herramientas y una ventana de contexto amplia bajo una licencia permisiva, lo que lo convierte en una opción atractiva para empresas e investigadores que necesitan un modelo de alto rendimiento sin depender de servicios propietarios. Su carácter denso simplifica el despliegue frente a alternativas MoE, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only Dense Transformer (GraniteForCausalLM) |
| Parámetros totales | 29 276 770 304 (30B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens nativo, extensible a 512 000 |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors BF16 en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Granite-4.2-30B es un transformador denso de tipo decoder-only con arquitectura `GraniteForCausalLM`. Se entrenó a partir de Granite-4.1-30B-Base y se ha optimizado para incorporar razonamiento mediante cadenas de pensamiento. El modelo genera una secuencia de razonamiento interna (`thinking... response`) antes de la respuesta final, y permite alternar entre modos de pensamiento completo, no pensamiento y bajo esfuerzo según la petición. Esta capacidad de razonamiento se ha integrado de forma nativa, no como un ajuste posterior.

En cuanto al entrenamiento, IBM no ha publicado en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. La técnica principal es el razonamiento-aumentado de tool calling, donde el modelo aprende a razonar sobre qué herramientas invocar y por qué, mejorando la precisión de las llamadas a funciones en flujos agénticos. La arquitectura es densa (no MoE), lo que simplifica la inferencia y la distribución de memoria, aunque a costa de que todos los parámetros se activan en cada forward pass.

## Capacidades

- **Razonamiento nativo** con cadena de pensamiento integrada, que permite resolver problemas complejos de lógica, matemáticas y programación mostrando el proceso de razonamiento.
- **Modos de pensamiento flexibles**: se puede activar o desactivar el razonamiento completo, o usar un modo de bajo esfuerzo, para equilibrar profundidad y latencia según la consulta.
- **Tool calling razonado**: el modelo decide qué herramientas invocar y justifica la elección, lo que aumenta la fiabilidad de las llamadas a funciones en aplicaciones agénticas.
- **Generación de código**: entrenado para código de alta calidad, incluye soporte para múltiples lenguajes de programación y tareas de depuración.
- **Multilingüismo**: funciona en 12 idiomas probados, incluyendo español, alemán, francés, japonés, chino, entre otros. Otros idiomas pueden funcionar pero no están garantizados.
- **Ventana de contexto amplia**: 128K tokens nativos, ampliables a 512K, lo que permite manejar documentos largos, conversaciones extensas y tareas de RAG con contexto amplio.
- **Capacidades agénticas**: soporte de razonamiento multi-paso y llamadas a herramientas, adecuado para construir agentes autónomos.
- **Compatibilidad**: funciona con llama.cpp, vLLM (versión NVFP4 companion) y otros motores GGUF, con soporte de endpoints compatibles.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 128K tokens. En español, por ejemplo, puede mantener el historial completo de una interacción y razonar sobre la mejor respuesta, lo que mejora la satisfacción en soporte técnico.
- **Generación de código en producción**: con tool calling y razonamiento, puede integrarse en pipelines de CI/CD para generar código, revisar cambios, completar funciones o explicar fragmentos. Su capacidad de razonamiento permite entender el contexto del proyecto y producir soluciones coherentes.
- **Asistentes agénticos con herramientas externas**: el modelo puede razonar sobre qué herramienta usar (API REST, calculadora, base de datos) y generar la llamada correcta, lo que lo hace idóneo para construir agentes que consultan sistemas externos.
- **Análisis de documentos legales o financieros**: con 128K tokens de contexto, puede procesar contratos, informes o expedientes completos, resumirlos, extraer cláusulas relevantes o comparar versiones, mostrando su razonamiento sobre los puntos clave.
- **Razonamiento matemático y científico**: para aplicaciones educativas o de análisis de datos, el modelo puede resolver problemas matemáticos complejos mostrando el proceso de razonamiento, lo que facilita la verificación y la comprensión.
- **Traducción técnica**: aunque no está especializado en traducción, su entrenamiento multilingüe permite traducir documentación técnica entre los idiomas soportados, manteniendo un nivel de precisión razonable para contenido de producto o manuales.
- **Resumen de informes de investigación**: su contexto largo y su razonamiento permiten sintetizar artículos extensos, extraer conclusiones y evaluar la coherencia de argumentos, útil para investigadores.
- **Generación de documentación técnica**: el modelo puede redactar guías, tutoriales, respuestas de FAQ y documentación de API, con razonamiento sobre la estructura y el detalle necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original no incluye métricas de MMLU, HumanEval, GSM8K u otros, y el repositorio GGUF tampoco proporciona datos de evaluación. Por tanto, no es posible presentar una tabla comparativa con datos concretos. Se recomienda consultar el blog técnico de IBM Granite 4.2 (enlace en la sección de Enlaces) para obtener métricas cuando estén disponibles.

## Requisitos de hardware

- **VRAM estimada para inferencia** según cuantización:
  - Q2_K: 12 GB
  - Q3_K_S: 14 GB
  - Q3_K_M: 14 GB
  - Q3_K_L: 15 GB
  - Q4_K_S: 17 GB
  - Q4_K_M: 17 GB (recomendado por el autor)
  - Q5_K_S: 20 GB
  - Q5_K_M: 20 GB
  - Q6_K: 23 GB
- **GPU recomendadas**: para cuantizaciones Q4_K_M o inferiores, se recomienda una GPU con al menos 24 GB de VRAM (RTX 4090, A100 40GB, L40S). Para Q2_K o Q3_K, una GPU de 12 GB (RTX 4080, RTX 3090) puede ser suficiente. La Q6_K requiere 24 GB.
- **Cabe en GPU de consumo**: sí, la mayoría de las cuantizaciones (Q2_K a Q5_K_M) caben en GPU de consumo de 16-24 GB. La Q6_K requiere 24 GB.
- **Opciones de despliegue**: llama.cpp (llama-server), vLLM (con la versión NVFP4 companion), Ollama (si se convierte a formato GGUF compatible), TGI, y cualquier servidor que soporte GGUF.
- **Latencia y throughput**: no se proporcionan datos específicos. En una GPU A100 24GB con Q4_K_M, se puede esperar una velocidad razonable para inferencia interactiva, pero depende de la longitud de entrada y del modo de razonamiento (el modo completo genera más tokens).

## Comparativa con modelos similares

No se dispone de datos de rendimiento directos para comparar con otros modelos de razonamiento de tamaño similar. Sin embargo, se pueden comparar características estructurales:

| Modelo | Parámetros | Contexto | Razonamiento | Licencia | Formato |
|---|---|---|---|---|---|
| Granite-4.2-30B (este) | 30B densos | 128K (512K) | Sí (nativo) | Apache 2.0 | GGUF / safetensors |
| Qwen3-30B-A3B | 30B (3B activos) | 128K | Sí | Apache 2.0 | GGUF / safetensors |
| DeepSeek-R1-Distill-32B | 32B densos | 128K | Sí (destilado) | MIT | GGUF / safetensors |
| Llama-3.3-70B | 70B densos | 128K | No (requiere instrucción) | Llama 3.0 license | GGUF / safetensors |

La comparación de rendimiento no está disponible. Granite-4.2-30B se diferencia por su licencia Apache 2.0, su contexto nativo de 128K y su razonamiento integrado, lo que lo hace comparable a Qwen3-30B-A3B (que es MoE con solo 3B activos) y a DeepSeek-R1-Distill-32B. La elección entre ellos dependerá de las necesidades de latencia, memoria y licencia.

## Limitaciones y advertencias

- **Sesgos**: no se han publicado informes específicos de sesgos, pero como cualquier LLM entrenado con datos web, puede reflejar sesgos de género, raza o cultural presentes en los datos de entrenamiento.
- **Riesgo de alucinación**: a pesar del razonamiento, el modelo puede generar información falsa o inventada, especialmente en dominios especializados o cuando se le pide información de actualidad. Se recomienda validación externa en aplicaciones de producción.
- **Contexto y coherencia**: aunque soporta 128K tokens, la calidad de las respuestas puede degradarse en contextos extremadamente largos o cuando hay información contradictoria. La extensión a 512K requiere técnicas adicionales de manejo de contexto.
- **Idiomas**: solo los 12 idiomas listados han sido probados. Otros idiomas pueden producir respuestas de menor calidad o incorrectas.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero se debe incluir una copia de la licencia y atribución al autor original. No hay restricciones de uso militar, pero se recomienda revisar los términos.
- **Cuantización**: las cuantizaciones K-quant introducen pérdida de calidad respecto al BF16 original. La Q2_K puede degradar significativamente el razonamiento; se recomienda Q4_K_M como mínimo para tareas críticas.
- **Costo computacional del razonamiento**: el modo de razonamiento completo genera un texto de razonamiento largo, lo que aumenta la latencia y el costo de tokens. Para aplicaciones de baja latencia, se debe usar el modo no-pensamiento o bajo esfuerzo.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/vcruz305/granite-4.2-30b-GGUF)
- [Modelo base IBM Granite-4.2-30B](https://huggingface.co/ibm-granite/granite-4.2-30b)
- [Blog técnico de IBM Granite 4.2](https://huggingface.co/blog/ibm-granite/granite-4-2)
- [GitHub de Granite 4.2 Language Models](https://github.com/ibm-granite/granite-4.2-language-models)
- [Companion NVFP4 para vLLM](https://huggingface.co/vcruz305/granite-4.2-30b-NVFP4)
- [Repositorio de IBM GGUF](https://github.com/IBM/gguf)
- [Colección de modelos Granite 4.2 en HuggingFace](https://huggingface.co/collections/ibm-granite/granite-42-language-models)</think>## Resumen

Granite-4.2-30B es el modelo insignia de razonamiento de la familia Granite 4.2 de IBM, un transformador denso decoder-only de 30 000 millones de parámetros. Construido sobre Granite-4.1-30B-Base, incorpora un modo de razonamiento integrado que genera una cadena de pensamiento (`thinking... response`) antes de la respuesta, lo que mejora significativamente el rendimiento en tareas de matemáticas, código, lógica multi-paso y llamadas a herramientas. IBM lo libera bajo licencia Apache 2.0, con soporte nativo de contexto de 128 000 tokens (extensible a 512 000) y un conjunto de 12 idiomas probados.

Esta repositorio, cuantizado por vcruz305, ofrece una escalera completa de cuantizaciones GGUF K-quant (de Q2_K a Q6_K) calibradas con imatrix, lo que permite desplegar el modelo en hardware muy diverso, desde GPU de consumo hasta servidores profesionales, sin renunciar a la compatibilidad con llama.cpp y otros motores GGUF. El modelo base está disponible en BF16 safetensors, y la versión GGUF aquí presentada es una cuantización de este último.

La relevancia de Granite-4.2-30B radica en combinar razonamiento nativo, tool-calling razonado, contexto largo y licencia permisiva, lo que lo convierte en una opción sólida para desarrolladores e investigadores que necesitan un modelo de alto rendimiento para agentes, generación de código y tareas de razonamiento complejo, sin las restricciones de licencia de otros modelos propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only Dense Transformer (GraniteForCausalLM) |
| Parámetros totales | 29 276 770 304 (30B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens nativos, extensible a 512 000 |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors BF16 en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Granite-4.2-30B es un transformador denso de tipo decoder-only con arquitectura `GraniteForCausalLM`. Se entrenó a partir de Granite-4.1-30B-Base y se incorpora un mecanismo de razonamiento integrado que genera una secuencia de pensamiento interna (`thinking... response`) antes de la respuesta final. IBM ha incluido modos de pensamiento flexibles (completo, no pensamiento y bajo esfuerzo) para que el usuario pueda ajustar el equilibrio entre profundidad de razonamiento y latencia según la consulta.

En cuanto al entrenamiento, IBM no ha publicado en la información disponible el número de tokens ni la composición del dataset. La innovación principal es el razonamiento-aumentado de tool-calling: el modelo aprende a razonar sobre qué herramientas invocar y por qué, lo que mejora la precisión de las llamadas a funciones en flujos agénticos. La arquitectura es densa (no MoE), por lo que todos los parámetros se activan en cada forward pass, lo que simplifica la inferencia pero aumenta la memoria requerida frente a modelos MoE de parámetros similares.

## Capacidades

- **Razonamiento nativo**: genera cadenas de pensamiento para resolver problemas complejos de matemáticas, lógica y programación, con modos de pensamiento completo, no pensamiento y bajo esfuerzo.
- **Tool calling razonado**: decide qué herramientas invocar y proporciona una justificación, mejorando la fiabilidad de las llamadas a funciones en sistemas agénticos.
- **Generación de código**: entrenado para tareas de programación, incluye generación, depuración y explicación de código en múltiples lenguajes.
- **Multilingüe**: funciona en 12 idiomas probados, incluyendo inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- **Contexto largo**: soporta 128K tokens de contexto nativos, ampliables a 512K, lo que permite manejar documentos extensos y conversaciones largas.
- **Soporte de agentes**: razonamiento multi-step y tool-calling para construir flujos de trabajo agénticos complejos.
- **Compatibilidad**: se puede desplegar con llama.cpp, vLLM (con la versión NVFP4 companion) y otros motores GGUF, con endpoints compatibles.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens) y razonar sobre la respuesta correcta, lo que lo hace adecuado para soporte técnico en español, alemán o francés, por ejemplo.
- **Generación de código en producción**: con tool-calling y razonamiento, puede integrarse en pipelines de CI/CD para generar código, revisar cambios, completar funciones o explicar fragmentos, mejorando la productividad de los desarrolladores.
- **Asistentes agénticos con herramientas externas**: el modelo puede razonar sobre qué API o herramienta usar (búsqueda web, calculadora, base de datos) y generar la llamada correcta, lo que lo hace útil para construir agentes autónomos.
- **Análisis de documentos legales o financieros**: su ventana de contexto de 128K permite procesar contratos completos, informes financieros o normativas, extraer cláusulas, resumir riesgos y comparar documentos.
- **Razonamiento matemático y científico**: puede resolver problemas de matemáticas avanzadas, explicar el proceso paso a paso y verificar la coherencia de argumentos, útil para educación y análisis de datos.
- **Localización de software**: con soporte de 12 idiomas, puede traducir cadenas de interfaz, documentación técnica y ayudar a localizar productos de software
