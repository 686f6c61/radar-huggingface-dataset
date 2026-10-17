# Team-CorerepubliX/Gureum_1.0_neo

## Resumen

Gureum (구름) 1.0 neo es un modelo de lenguaje conversacional desarrollado por el equipo CorerepubliX, publicado en HuggingFace bajo el identificador Team-CorerepubliX/Gureum_1.0_neo. Se trata de un modelo de generación de texto con 2.305.517.312 parámetros (aproximadamente 2,3 mil millones), orientado principalmente al diálogo en coreano, con soporte secundario de inglés. Según las etiquetas del repositorio, su arquitectura se basa en Llama y el formato de pesos es safetensors, compatible con la librería transformers.

El modelo está diseñado como asistente generalista: conversación en coreano, mantenimiento del registro formal (존댓말), y tareas de matemáticas, código, traducción y redacción. Un rasgo distintivo declarado por el autor es que mantiene el tratamiento de cortesía incluso cuando el usuario emplea un registro informal, y que estructura las respuestas largas en Markdown (encabezados con `##`, listas, etc.).

Su relevancia actual reside en su licencia MIT, que permite uso comercial, modificación y redistribución sin restricciones, y en su tamaño reducido, que lo hace desplegable en hardware de consumo. No obstante, el repositorio no publica detalles sobre la longitud de contexto, el volumen de datos de entrenamiento ni resultados de benchmarks, por lo que su evaluación rigurosa queda pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Llama (según etiqueta del repositorio) |
| Parámetros totales | 2.305.517.312 (~2,3 mil millones) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se listan variantes GGUF/AWQ/GPTQ en el repositorio) |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Librería | transformers |
| Tamaño del repositorio | 4,6 GB |

## Arquitectura y entrenamiento

La información disponible indica que el modelo sigue una arquitectura transformer de tipo Llama, según la etiqueta `llama` del repositorio, con aproximadamente 2,3 mil millones de parámetros. El formato de pesos es safetensors y está pensado para su carga mediante la librería transformers. No se especifican en la model card el número de capas, la dimensión del modelo, el número de cabezas de atención ni la ventana de contexto máxima soportada.

Respecto al entrenamiento, la model card únicamente describe el comportamiento esperado: conversación en coreano con mantenimiento del registro formal, uso de estructura Markdown en textos largos y cobertura de tareas de matemáticas, código, traducción y escritura. No se aportan datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documenta ninguna innovación técnica específica (atención lineal, decodificación especulativa, arquitecturas híbridas, etc.).

## Capacidades

- Generación de texto conversacional en coreano, con mantenimiento del registro formal (존댓말) incluso ante entradas en registro informal.
- Soporte de inglés como idioma secundario.
- Asistencia en matemáticas, según declara el autor.
- Generación y asistencia de código.
- Traducción entre coreano e inglés.
- Redacción de textos largos con estructura Markdown (encabezados `##`, listas).
- Aplicación automática de una persona (persona Gureum) por defecto cuando no se proporciona un mensaje de sistema.
- Compatibilidad con plantillas de chat mediante `apply_chat_template` de transformers.
- Etiquetado como compatible con text-generation-inference y endpoints.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente conversacional en coreano con registro formal: adecuado para aplicaciones donde se requiere un trato de cortesía consistente, ya que el modelo fue entrenado para mantener el 존댓말 incluso si el usuario escribe en informal.
- Atención al cliente automatizada en coreano: puede gestionar conversaciones multi-turno mediante plantillas de chat, aunque la ausencia de datos públicos sobre la ventana de contexto impide garantizar diálogos de longitud extendida.
- Generación de documentación técnica en Markdown: el entrenamiento orientado a estructurar textos largos con encabezados y listas lo hace apto para producir README, guías o manuales con formato listo para publicar.
- Traducción coreano-inglés en pipelines de contenido: útil para localizar material redactado originalmente en coreano hacia inglés, dentro de flujos que requieran un modelo ligero y de licencia permisiva.
- Asistencia de programación y ejercicios matemáticos: puede emplearse como ayuda para resolver problemas o explicar fragmentos de código, siempre con verificación humana dado que no hay benchmarks publicados.
- Prototipado local en hardware de consumo: su tamaño de ~2,3 mil millones de parámetros permite desplegarlo en una GPU de gama media para pruebas de concepto sin depender de servicios en la nube.
- Ajuste fino sobre dominio propio: la licencia MIT permite reentrenar y redistribuir el modelo adaptado a sectores específicos (legal, sanitario, atención al cliente vertical) sin restricciones comerciales.
- Generación de correos y escritos profesionales en coreano: encaja en herramientas de productividad que requieran un tono formal y estructura clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, KLUE ni de ninguna otra evaluación estándar, ni comparaciones con modelos de referencia.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros (2.305.517.312) y no proceden de datos publicados por el autor:

- VRAM estimada para los pesos en precisión completa (FP32): aproximadamente 9,2 GB.
- VRAM estimada en FP16/BF16: aproximadamente 4,6 GB para los pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización INT8: aproximadamente 2,3 GB.
- VRAM estimada en cuantización INT4: aproximadamente 1,2 GB (requiere conversión propia, ya que no se ofrecen variantes cuantizadas en el repositorio).
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8-12 GB de VRAM en FP16, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090. En cuantización INT4 podría ejecutarse incluso en GPUs de 6-8 GB.
- GPU de centro de datos recomendadas: A100, H100 o L40S para despliegues con alta concurrencia, aunque son sobredimensionadas para un modelo de este tamaño.
- Opciones de despliegue: transformers (soporte oficial declarado), text-generation-inference (etiqueta del repositorio) y, previa conversión, vLLM, llama.cpp u Ollama. No se proporcionan pesos GGUF en el repositorio, por lo que Ollama y llama.cpp requerirían una conversión manual.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparación se establece con modelos abiertos de tamaño comparable en la franja de 2-3 mil millones de parámetros. Los datos de las alternativas corresponden a sus especificaciones públicas; los de Gureum 1.0 neo, salvo el recuento de parámetros y la licencia, no están publicados.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Gureum 1.0 neo | ~2,3 B | no disponible | ko, en | MIT | no publicados |
| Llama 3.2 3B | ~3 B | 128k (según su model card) | multilingüe | Llama 3.2 Community License | publicados por Meta |
| Qwen2.5 3B | ~3 B | 32k (según su model card) | multilingüe | Apache 2.0 / Qwen | publicados por Alibaba |
| Gemma 2 2B | ~2 B | 8k (según su model card) | multilingüe | Gemma Terms of Use | publicados por Google |

Consideraciones: frente a estas alternativas, Gureum 1.0 neo destaca por su licencia MIT, más permisiva que las licencias comunitarias de Llama y Gemma, y por su especialización en coreano. En cambio, carece de documentación pública sobre contexto y rendimiento, y no ofrece variantes cuantizadas oficiales, lo que dificulta una comparación objetiva.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar su calidad en tareas de razonamiento, código o matemáticas frente a alternativas de tamaño similar.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que impide planificar despliegues con entradas largas o conversaciones multi-turno extensas.
- Riesgo de alucinación: como cualquier modelo de lenguaje de este tamaño, puede generar información incorrecta o inventada, especialmente en dominios especializados.
- Sesgos: no se publica información sobre la composición del dataset de entrenamiento ni sobre procesos de mitigación de sesgos, por lo que se desconocen sus sesgos potenciales.
- Especialización en coreano: aunque soporta inglés, su entrenamiento está claramente orientado al coreano, por lo que su rendimiento en otros idiomas, incluido el español, no está documentado y probablemente sea limitado.
- Sin soporte documentado de tool calling ni agentes: no se indica compatibilidad con function calling ni razonamiento multi-paso, lo que limita su uso en pipelines agénticos.
- Sin variantes cuantizadas oficiales: no se ofrecen pesos GGUF, AWQ o GPTQ, lo que obliga a realizar conversiones propias para despliegues ligeros.
- Licencia: MIT permite uso comercial, modificación y redistribución sin restricciones, pero conviene conservar el aviso de copyright incluido en el archivo `LICENSE` del repositorio.
- Madurez del proyecto: el repositorio registra 0 descargas y 1 like en el momento de la consulta, con fechas de creación y actualización de octubre de 2026, lo que sugiere un proyecto muy reciente y con poca validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Team-CorerepubliX/Gureum_1.0_neo
- Perfil del autor en HuggingFace: https://huggingface.co/Team-CorerepubliX

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre el modelo, el equipo autor ni documentación técnica asociada; los resultados obtenidos correspondían a páginas no relacionadas con este proyecto. No se dispone, por tanto, de enlaces a papers, blogs técnicos, repositorios de código o demos adicionales.
