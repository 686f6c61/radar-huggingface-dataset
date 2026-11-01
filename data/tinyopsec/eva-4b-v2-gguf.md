# tinyopsec/Eva-4B-V2-GGUF

## Resumen

Eva-4B-V2-GGUF es una colección de cuantizaciones en formato GGUF del modelo FutureMa/Eva-4B-V2, publicada por el usuario tinyopsec. Se trata de una conversión realizada con llama.cpp que traslada el modelo original de aproximadamente 4.022 millones de parámetros a una familia de ficheros optimizados para inferencia local en CPU y GPU de consumo. La model card del repositorio es mínima y no documenta arquitectura interna, datos de entrenamiento ni resultados de evaluación; la única pista técnica sobre la familia del modelo es la etiqueta "qwen3", que sugiere una arquitectura derivada de la familia Qwen 3.

El interés de esta publicación es fundamentalmente práctico: permite ejecutar un modelo de 4B parámetros en hardware modesto mediante llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, text-generation-webui, entre otras). El repositorio incluye trece variantes de cuantización, desde F16 hasta Q2_K, lo que cubre un rango amplio de compromisos entre calidad y consumo de memoria.

No obstante, la información disponible es escasa: el repositorio no registra descargas ni interacciones, la model card no aporta detalles sobre el entrenamiento ni el comportamiento esperado, y no se han publicado benchmarks. Cualquier evaluación de sus capacidades debe tratarse como pendiente de verificación empírica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta "qwen3" en el repositorio; arquitectura concreta no documentada) |
| Parametros totales | 4.022.468.096 (aprox. 4,02 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (generado con llama.cpp); el modelo base original se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base FutureMa/Eva-4B-V2 en la documentación disponible. La etiqueta "qwen3" asociada al repositorio apunta a que el modelo deriva de la familia Qwen 3, lo que implicaría una arquitectura transformer decoder-only, pero este extremo no está confirmado por el autor ni por la model card. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO.

La única innovación técnica documentada en este repositorio es el propio proceso de cuantización: los pesos se han convertido a GGUF mediante llama.cpp, lo que habilita decodificación en CPU, offloading parcial a GPU y ejecución en herramientas compatibles con este formato. No hay información sobre técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational" y "text-generation", lo que indica un uso previsto para diálogo multi-turno.
- Razonamiento general y respuesta a instrucciones: capacidad esperable en un modelo de 4B parámetros de la familia Qwen 3, aunque no verificada en la documentación.
- Generación de código y matemáticas: no documentado explícitamente; debe validarse empíricamente.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el repositorio no declara idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con llama.cpp u Ollama en un equipo de sobremesa para mantener conversaciones multi-turno sin conexión a servicios en la nube, aprovechando el tamaño reducido de las cuantizaciones Q4 y Q5.
- Prototipado rápido de aplicaciones de chat: gracias a la licencia Apache 2.0 y al formato GGUF, un desarrollador puede integrar el modelo en una demo o MVP sin coste de licencia y sin infraestructura GPU dedicada.
- Generación de texto en entornos con recursos limitados: las variantes Q3_K_S y Q2_K permiten ejecutar el modelo en máquinas con poca RAM o en portátiles sin GPU dedicada, a costa de una pérdida de calidad que debe evaluarse.
- Procesamiento por lotes en CPU: para tareas de clasificación, resumen o reescritura de textos donde la latencia no es crítica, la versión Q4_K_M ofrece un equilibrio razonable entre tamaño (aproximadamente 2,5 GB) y fidelidad.
- Base para ajuste fino o experimentación: al ser un modelo de 4B parámetros con licencia permisiva, puede servir como punto de partida para investigación en técnicas de cuantización, evaluación de degradación por quant o comparación de formatos GGUF.
- Integración en herramientas de escritorio compatibles con GGUF: LM Studio, text-generation-webui o Jan permiten cargar el modelo y ofrecer una interfaz de chat local sin escribir código, útil para pruebas de usabilidad o demos a usuarios no técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, según tamaño de fichero y overhead de llama.cpp):
  - F16: en torno a 8 GB.
  - Q8_0: en torno a 4,5 GB.
  - Q6_K: en torno a 3,5 GB.
  - Q5_K_M: en torno a 3 GB.
  - Q4_K_M: en torno a 2,5 GB.
  - Q3_K_M: en torno a 2 GB.
  - Q2_K: en torno a 1,5 GB.
- GPU recomendadas: no hay requisitos oficiales publicados. Por tamaño, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB pueden alojar cualquier cuantización completa en VRAM; una RTX 3050 de 8 GB o GTX 1660 de 6 GB pueden ejecutar Q4_K_M y Q5_K_M con comodidad.
- ¿Cabe en GPU de consumo? Sí, todas las cuantizaciones desde Q8_0 hacia abajo caben en GPUs de consumo con 6-8 GB de VRAM; las variantes Q4 y Q3 caben incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, text-generation-webui, Jan, KoboldCpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones. Como referencia orientativa no verificada, un modelo de 4B en Q4_K_M sobre una RTX 4090 suele generar decenas de tokens por segundo, mientras que en CPU puede caer a pocos tokens por segundo; estos valores deben medirse en el hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Eva-4B-V2-GGUF (este) | 4,02 B | No disponible | Apache 2.0 | GGUF | Cuantizaciones de un modelo base con documentación escasa |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Familia ampliamente documentada y evaluada; alternativa directa por tamaño |
| Llama-3.2-3B-Instruct | 3,21 B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto largo y ecosistema maduro; licencia con restricciones de uso |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 tokens | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y código para su tamaño |

La comparación es aproximada: no se dispone de benchmarks de Eva-4B-V2 que permitan situarlo frente a estas alternativas. La principal desventaja de este repositorio frente a los modelos citados es la falta de documentación y de evaluaciones publicadas; su principal ventaja es la licencia Apache 2.0 y la disponibilidad inmediata en múltiples cuantizaciones GGUF.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe arquitectura, datos de entrenamiento, idiomas ni comportamiento esperado, lo que dificulta evaluar su idoneidad para producción.
- Sin benchmarks publicados: no hay evidencia empírica de su calidad en razonamiento, código o matemáticas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 4B parámetros; sin evaluaciones específicas, el riesgo en dominios factuales es desconocido pero probablemente significativo.
- Idiomas no declarados: no se especifica qué lenguas cubre el modelo; el rendimiento en castellano es incierto.
- Contexto desconocido: se desconoce la longitud máxima de contexto soportada, lo que impide planificar cargas de trabajo con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base FutureMa/Eva-4B-V2 no imponga restricciones adicionales no reflejadas en este repositorio.
- Repositorio sin tracción: cero descargas y cero interacciones en el momento de la consulta; no hay comunidad que haya validado las cuantizaciones.
- Degradación por cuantización: las variantes Q3 y Q2 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/Eva-4B-V2-GGUF
- Modelo base: https://huggingface.co/FutureMa/Eva-4B-V2
- llama.cpp (herramienta de cuantización): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible con GGUF): https://ollama.com
- LM Studio (runtime compatible con GGUF): https://lmstudio.ai
