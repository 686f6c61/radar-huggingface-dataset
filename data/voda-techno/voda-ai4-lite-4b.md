# VoDa-Techno/VoDa-AI4-Lite-4b

## Resumen

VoDa-AI4-Lite-4b es un modelo de lenguaje presentado por VoDa-Techno como parte de la familia VoDa AI4, una línea de modelos orientados a conversación general. La model card lo describe como una variante "lite" de 4B parámetros, pensada para chat diario, respuesta a preguntas y asistencia textual, con un enfoque explícito en ruso e inglés y con requisitos de hardware reducidos hasta el punto de poder ejecutarse en un portátil convencional.

El modelo se distribuye principalmente en formato GGUF y la model card documenta su uso mediante Ollama, lo que sugiere que el objetivo principal es la inferencia local en CPU o GPU de gama baja. El repositorio ocupa 3,3 GB y los pesos en safetensors suman 333.514.240 parámetros, una cifra notablemente inferior a los "4b" que sugiere el nombre comercial; esta discrepancia es relevante para cualquier evaluación técnica.

La información pública disponible es muy limitada: no se documentan arquitectura, datos de entrenamiento, contexto máximo ni resultados de benchmarks. La licencia figura como "other", con referencia a un fichero LICENSE no detallado en la información proporcionada, lo que obliga a revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la documenta; los tags mencionan "qwen") |
| Parametros totales | 333.514.240 (según safetensors); el nombre comercial indica "4b" |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (según tags y model card); niveles concretos no disponibles |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | other (remite a LICENSE; términos no disponibles) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. Los tags del repositorio incluyen "qwen", lo que podría indicar una base derivada de la familia Qwen, pero la model card no lo confirma ni detalla si se trata de un transformer denso estándar, una variante con atención modificada u otra configuración. Tampoco se especifica el número de capas, dimensiones ocultas, cabezas de atención ni el tipo de tokenizador.

Respecto al entrenamiento, la información disponible no incluye el volumen de tokens, la composición del dataset, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. La model card únicamente describe el modelo como "de nueva generación" dentro de la línea VoDa AI4 y destaca su carácter ligero y su orientación al chat en ruso e inglés. No hay datos sobre técnicas de optimización como decodificación especulativa, atención lineal o cuantización durante el entrenamiento.

## Capacidades

- Generación de texto conversacional: preguntas y respuestas, explicaciones y asistencia textual general, según la model card.
- Traducción: la model card menciona "перевод" (traducción) entre las funciones del modelo, sin especificar pares de idiomas ni calidad.
- Multilingüismo limitado a ruso e inglés; no se declaran otros idiomas.
- Ejecución local ligera: diseñado para funcionar en un portátil convencional, según el autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo "thinking", visión, audio ni otras capacidades multimodales.
- No se documentan capacidades específicas de código o matemáticas; la familia incluye variantes "Coder" separadas, lo que sugiere que esta variante Lite no está especializada en programación.

## Casos de uso

- Chat de asistencia en ruso para usuarios finales: el modelo está declarado como "completamente rusohablante" y ligero, lo que permite desplegarlo en entornos con hardware modesto para responder preguntas frecuentes y mantener conversaciones multi-turno, siempre que el contexto real del modelo (no documentado) sea suficiente.
- Asistencia textual en inglés y ruso: redacción, resumen y reescritura de textos en ambos idiomas, aprovechando su naturaleza conversacional y su bajo coste de inferencia.
- Traducción informal ru-en y en-ru: la model card cita la traducción entre sus capacidades; sería adecuado para borradores o comunicaciones internas, no para traducción jurada o técnica de alta precisión.
- Prototipado local en portátiles: al distribuirse en GGUF y ejecutarse vía Ollama, sirve para experimentar con pipelines de generación de texto sin GPU dedicada.
- Educación y explicaciones divulgativas: respuestas a preguntas generales y explicaciones sencillas en ruso o inglés para entornos de aprendizaje con recursos limitados.
- Preprocesado de texto en pipelines ligeros: clasificación informal, generación de borradores o normalización de texto en aplicaciones donde el coste por token y la latencia importan más que la precisión máxima.
- Despliegue en entornos con restricciones de privacidad: al poder ejecutarse localmente, permite procesar texto sensible sin enviarlo a APIs externas, sujeto a revisar la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por el tamaño de los pesos (333,5 M de parámetros según safetensors), una cuantización de 4 bits ocuparía del orden de 0,2-0,3 GB y una de 8 bits en torno a 0,4-0,5 GB, sin contar overhead de contexto y runtime; estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder alojarlo con holgura en cuantizaciones bajas, pero no hay confirmación oficial.
- CPU: la model card afirma que funciona en un portátil convencional; el formato GGUF y la integración con Ollama apuntan a inferencia viable en CPU.
- Opciones de despliegue: Ollama, según la model card (`ollama run beebosofficial/VoDa-AI4-Lite:4b`). El formato GGUF permite también llama.cpp y otros runners compatibles; no se documenta soporte de vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de contexto o arquitectura que permitan una comparación rigurosa. La propia model card sitúa el modelo dentro de la familia VoDa AI4 junto a variantes de 9B y 27B y a la línea Coder, pero no aporta métricas comparativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VoDa-AI4-Lite-4b | 333,5 M (safetensors) | no disponible | other | Hugging Face, Ollama |
| VoDa-AI4-Lite-9b | 9B (según model card) | no disponible | other | no disponible en la información |
| VoDa-AI4-Lite-27b | 27B (según model card) | no disponible | other | no disponible en la información |
| VoDa-AI4-Coder-* | 4B/9B/27B | no disponible | other | no disponible en la información |

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre comercial indica "4b" pero los safetensors declaran 333.514.240 parámetros; conviene verificar qué artefacto corresponde a qué cifra antes de planificar recursos.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras pruebas, lo que impide validar las afirmaciones de la model card.
- Documentación técnica mínima: sin arquitectura, contexto ni datos de entrenamiento, es difícil evaluar riesgos de alucinación o degradación en contextos largos.
- Cobertura idiomática limitada a ruso e inglés; el rendimiento en castellano no está declarado ni evaluado.
- Licencia "other": los términos exactos no están disponibles en la información proporcionada; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin benchmarks ni evaluaciones publicadas no puede acotarse su magnitud.
- Sesgos: no documentados por el autor; un modelo entrenado principalmente en ruso e inglés puede reflejar sesgos culturales y lingüísticos de esos corpus.
- Madurez del proyecto: el repositorio no registra descargas ni "likes" en el momento de la consulta, y la familia parece reciente; no hay evidencia de soporte comunitario o mantenimiento a largo plazo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no debería asumirse en diseños de producción que dependan de estas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/VoDa-Techno/VoDa-AI4-Lite-4b
- Modelo en Ollama (referenciado en la model card): `beebosofficial/VoDa-AI4-Lite:4b`
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
