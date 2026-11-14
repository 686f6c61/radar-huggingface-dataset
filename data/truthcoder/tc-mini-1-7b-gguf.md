# truthcoder/TC-Mini-1.7B-GGUF

## Resumen

TC-Mini-1.7B-GGUF es una conversión a formato GGUF del modelo mlabonne/Qwen3-1.7B-abliterated, publicada por el usuario truthcoder. No se trata de un modelo entrenado desde cero ni afinado por el autor: es una cuantización directa de los pesos de Qwen3-1.7B con las direcciones de rechazo eliminadas (abliteration) por mlabonne, convertida con `convert_hf_to_gguf.py` de llama.cpp y cuantizada con `llama-quantize`. El objetivo declarado es ofrecer inferencia totalmente local y privada en portátiles pequeños, mini-PC y teléfonos.

El modelo parte de la arquitectura Qwen3 de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) y hereda las capacidades del transformer denso de Qwen3, incluido el modo de razonamiento (thinking) que puede desactivarse añadiendo `/no_think` al mensaje. Se distribuye en tres cuantizaciones (F16, Q8_0 y Q4_K_M) con tamaños de 3,45 GB, 1,83 GB y 1,11 GB respectivamente, lo que permite ejecutarlo en hardware de consumo modesto.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache-2.0 facilita el uso comercial y la redistribución; por otro, la etiqueta "abliterated" implica que se han suprimido los mecanismos de rechazo del modelo original, lo que lo hace adecuado para escenarios donde se requiere baja censura pero también conlleva responsabilidad plena sobre el contenido generado. El repositorio no incluye información sobre idiomas soportados ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 1.720.574.976 (~1,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso de la familia Qwen3 desarrollada por Alibaba. El modelo base intermedio, mlabonne/Qwen3-1.7B-abliterated, aplica la técnica de abliteration, que consiste en identificar y eliminar las direcciones en el espacio de activaciones asociadas a comportamientos de rechazo, de modo que el modelo deja de negarse a responder ciertas peticiones. El autor de esta ficha (truthcoder) no ha realizado ningún ajuste fino adicional: únicamente ha convertido los pesos a GGUF y los ha cuantizado con las herramientas estándar de llama.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original, más allá de lo que pueda documentar la model card de Qwen3. La innovación técnica destacable en esta publicación es la propia abliteration heredada y la disponibilidad de cuantizaciones optimizadas para despliegue local, incluida una build en el navegador del teléfono mencionada en la model card (repositorio TC-Mini). El autor declara 0/8 rechazos en una prueba de 8 prompts realizada con la build de navegador de los mismos pesos.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen3-1.7B.
- Modo de razonamiento (thinking) activable por defecto y desactivable mediante el sufijo `/no_think` en el mensaje.
- Comportamiento "uncensored" o "abliterated": baja tasa de rechazos ante peticiones que el modelo original rechazaría.
- Inferencia totalmente offline y local, sin llamadas a servicios externos.
- Compatibilidad con llama.cpp, Ollama y LM Studio, lo que facilita su integración en flujos de trabajo locales.
- Capacidades multilingües: no documentadas en la información disponible; se desconoce qué idiomas cubre con calidad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente personal offline en portátil: con la cuantización Q4_K_M (1,11 GB) el modelo cabe en cualquier portátil moderno con 8 GB de RAM y permite conversaciones privadas sin conexión, útil para entornos con requisitos de confidencialidad.
- Despliegue en mini-PC o teléfono: la build de navegador del proyecto TC-Mini y el tamaño reducido de Q4_K_M permiten ejecutar el modelo en dispositivos de gama baja, ideal para demos o asistentes embebidos.
- Generación de texto creativo sin restricciones: gracias a la abliteration, el modelo responde a peticiones que el Qwen3 original rechazaría, lo que puede interesar en escritura de ficción, guiones o contenido para adultos bajo responsabilidad del usuario.
- Prototipado rápido de aplicaciones de chat: al ser compatible con Ollama (`ollama run hf.co/truthcoder/TC-Mini-1.7B-GGUF:Q4_K_M`) y LM Studio, se puede integrar en menos de un minuto en una app de chat local para validar ideas.
- Experimentación con razonamiento en modo thinking: el sufijo `/no_think` permite comparar respuestas con y sin cadena de razonamiento, útil para investigación sobre el efecto del modo thinking en modelos pequeños.
- Educación y divulgación sobre cuantización: el repositorio incluye tres cuantizaciones con hashes SHA-256, lo que lo convierte en un ejemplo didáctico para aprender a convertir y cuantizar modelos con llama.cpp y verificar integridad.
- Filtrado o clasificación de texto local: aunque no está especializado, su tamaño permite usarlo como clasificador zero-shot o generador de etiquetas en pipelines que requieran privacidad y baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una prueba interna de 8 prompts con 0/8 rechazos en la build de navegador, sin métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M requiere aproximadamente 1,5-2 GB de RAM libre; Q8_0 en torno a 2-2,5 GB; F16 alrededor de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M (por ejemplo, GTX 1650, RTX 3050). Para F16 se recomienda una GPU con 4-6 GB (GTX 1660, RTX 3060).
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas, e incluso en iGPU y en CPU sola.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio y cualquier runtime compatible con GGUF. La model card menciona también una build en navegador para teléfono.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una generación en tiempo real en CPU moderna y muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TC-Mini-1.7B-GGUF | ~1,7 B | No disponible | Apache-2.0 | GGUF | Abliterated, sin fine-tuning propio |
| Qwen3-1.7B (original) | ~1,7 B | No disponible | Apache-2.0 | Safetensors, GGUF | Modelo base con rechazos intactos |
| mlabonne/Qwen3-1.7B-abliterated | ~1,7 B | No disponible | Apache-2.0 | Safetensors | Base directa de esta cuantización |
| Llama 3.2 1B | ~1,2 B | 128 K | Llama 3.2 Community | GGUF, Safetensors | Alternativa de tamaño similar con contexto documentado |

La comparación directa con Llama 3.2 1B es pertinente por tamaño y despliegue local, pero no se dispone de benchmarks que permitan comparar rendimiento entre ambos en esta ficha. El modelo de mlabonne es idéntico en pesos al aquí publicado, solo cambia el formato y la cuantización.

## Limitaciones y advertencias

- Alucinación: como todo modelo de 1,7 B, la tasa de alucinación es elevada en tareas de conocimiento factual; no debe usarse como fuente de verdad sin verificación.
- Sesgos: no se han documentado evaluaciones de sesgo; el proceso de abliteration puede alterar el comportamiento en temas sensibles y no garantiza neutralidad.
- Contenido sin filtro: la abliteration elimina los rechazos, por lo que el modelo puede generar contenido ofensivo, ilegal o dañino. El usuario es plenamente responsable de su uso, tal como advierte la model card.
- Idiomas: no hay información sobre cobertura lingüística; se desconoce el rendimiento en castellano y en idiomas distintos del inglés.
- Contexto: la longitud de contexto no está documentada en esta ficha; se desconoce si se ha modificado respecto al Qwen3 original.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3 también es Apache-2.0, por lo que no hay restricciones adicionales conocidas. Aun así, conviene revisar la licencia del modelo base original por si hubiera condiciones adicionales no reflejadas aquí.
- Producción: al no haber benchmarks ni evaluación de robustez, no se recomienda su uso en producción sin una validación previa exhaustiva en el dominio concreto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/truthcoder/TC-Mini-1.7B-GGUF
- Modelo base: https://huggingface.co/mlabonne/Qwen3-1.7B-abliterated
- Colección TC-Mini (todos los tamaños): https://huggingface.co/truthcoder/TC-Mini
- Demo en navegador: https://truthprotectors.github.io/TC-Mini/app/
- Código del proyecto: https://github.com/truthprotectors/TC-Mini
