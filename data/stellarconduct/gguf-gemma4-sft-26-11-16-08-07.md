# stellarconduct/GGUF-gemma4-SFT-26-11-16-08-07

## Resumen

GGUF-gemma4-SFT-26-11-16-08-07 es un modelo de lenguaje y visión (vision-language model) derivado de la familia Gemma 4, publicado por el usuario stellarconduct en Hugging Face. Se trata de un ajuste fino (SFT) del checkpoint `gemma-4-E4B-it`, convertido posteriormente a formato GGUF mediante la herramienta Unsloth para su uso con llama.cpp. El nombre del repositorio incluye una marca temporal que sugiere una ejecución de entrenamiento automatizada o experimental, y el modelo no cuenta con descargas ni interacciones registradas en el momento de redactar esta ficha.

El modelo resuelve el problema de disponer de un Gemma 4 multimodal (texto e imagen) ejecutable en hardware de consumo a través del ecosistema llama.cpp, incluyendo la variante de línea de comandos `llama-mtmd-cli` para entrada multimodal. Con aproximadamente 7.500 millones de parámetros, se sitúa en la franja de modelos pequeños/medianos aptos para inferencia local, aunque el tamaño del repositorio (15,3 GB) indica que contiene pesos en varias precisiones, incluidos ficheros F16 del proyector multimodal.

La relevancia de este modelo es limitada y fundamentalmente práctica: sirve como ejemplo de pipeline Unsloth → GGUF para un modelo Gemma 4 multimodal, pero carece de model card detallada, licencia declarada, idiomas especificados y resultados de evaluación. Cualquier uso en producción debería ir precedido de una validación propia, dado el escaso soporte documental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language model); arquitectura base de Gemma 4 no detallada en la información disponible |
| Parámetros totales | 7.518.069.290 (≈7,5 mil millones, según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); fichero F16 del proyector multimodal (mmproj); el autor menciona un modelo fusionado en bf16 para Ollama |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`gemma-4-E4B-it.Q4_K_M.gguf`, `gemma-4-E4B-it.F16-mmproj.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-4-E4B-it`, un checkpoint instruct de la familia Gemma 4 con capacidades multimodales (procesamiento de imagen y texto). La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, tipo de encoder visual), por lo que estos datos deben considerarse no disponibles. El sufijo "E4B" sugiere una variante eficiente de aproximadamente 4 mil millones de parámetros efectivos, aunque el recuento real en safetensors es de 7,5 mil millones, lo que apunta a que el total incluye el encoder visual y/o componentes adicionales.

El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) con Unsloth, que el autor declara como "2x faster" respecto a un entrenamiento convencional. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO. La conversión a GGUF se realizó con el mismo toolchain de Unsloth, generando un fichero cuantizado Q4_K_M y un fichero separado F16 para el proyector multimodal (mmproj), necesario para la inferencia de visión en llama.cpp.

## Capacidades

- Generación de texto conversacional en formato instruct (etiqueta `conversational`).
- Procesamiento de imágenes y texto (vision-language model), con soporte de entrada multimodal a través de `llama-mtmd-cli`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con infraestructura de inferencia tipo Hugging Face Endpoints.
- Ejecución local mediante llama.cpp y, con limitaciones, Ollama.
- Soporte de plantilla de chat Jinja (`--jinja` en llama-cli).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Idiomas: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes multimodales: usar `llama-mtmd-cli` con el fichero Q4_K_M y el mmproj F16 para consultas sobre imágenes en un portátil o estación de trabajo con GPU de consumo, aprovechando la cuantización de 4 bits para reducir requisitos de memoria.
- Evaluación de pipelines Unsloth → GGUF: el modelo sirve como referencia para validar el flujo de conversión de un Gemma 4 multimodal a GGUF y comprobar la integración con llama.cpp antes de aplicarlo a modelos propios.
- Descripción y análisis de imágenes en local: al ser multimodal y ejecutable offline, puede emplearse para tareas de captioning o extracción de información de capturas y documentos escaneados sin enviar datos a servicios externos.
- Integración en aplicaciones de escritorio con llama.cpp: al distribuirse en GGUF, puede embeberse en herramientas nativas que enlacen contra llama.cpp y ofrezcan chat con imágenes.
- Base para ajustes finos posteriores: al ser un SFT sobre Gemma 4, puede servir como punto de partida para especializaciones adicionales con Unsloth, siempre que se respete la licencia del modelo base (no declarada en el repo).
- Pruebas de compatibilidad con Ollama: el autor documenta un procedimiento para crear un modelo Ollama a partir del modelo fusionado en bf16, útil para validar flujos de despliegue en local con visión.
- Investigación sobre modelos pequeños multimodales: con 7,5 mil millones de parámetros, es adecuado para experimentos académicos que requieran un VLM ejecutable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M de un modelo de ~7,5 mil millones de parámetros ocupa del orden de 4-5 GB, más el proyector multimodal F16 (típicamente varios cientos de MB a ~1 GB). En la práctica, se recomienda al menos 8 GB de VRAM para texto e imagen con contexto moderado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso en consumo; A100 o H100 para despliegues con mayor concurrencia (estimación general, no confirmada por el autor).
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 8 GB o más de VRAM usando Q4_K_M; el fichero F16 del mmproj añade requisitos adicionales.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (con limitaciones para ficheros mmproj separados, según el autor), y potencialmente servidores compatibles con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| GGUF-gemma4-SFT-26-11-16-08-07 | ≈7,5 B | no disponible | Sí (imagen + texto) | no disponible | GGUF |
| Gemma 4 E4B-it (base) | ≈7,5 B (según safetensors del derivado) | no disponible | Sí | no disponible | safetensors / GGUF |
| Qwen2.5-VL 7B | ≈7-8 B | no disponible en esta ficha | Sí | no disponible en esta ficha | safetensors / GGUF |
| Llama 3.2 11B Vision | ≈11 B | no disponible en esta ficha | Sí | no disponible en esta ficha | safetensors / GGUF |

Nota: los datos de los modelos comparativos no proceden de la información proporcionada y deben verificarse en sus respectivas model cards. La comparativa es orientativa por categoría (VLM de tamaño pequeño/medio ejecutables en local).

## Limitaciones y advertencias

- Ausencia de licencia declarada en el repositorio: no es posible confirmar si se permite uso comercial; debe consultarse la licencia del modelo base Gemma 4 en su repositorio oficial antes de cualquier despliegue.
- Model card mínima: no se documentan datos de entrenamiento, idiomas, contexto, sesgos ni evaluaciones, lo que impide valorar su calidad de forma objetiva.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni validación externa.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no puede acotarse.
- Limitaciones de idioma desconocidas: no se especifica qué lenguas cubre el ajuste fino, por lo que el rendimiento en castellano no está garantizado.
- Limitaciones de contexto desconocidas: la longitud de ventana no está documentada.
- Problemas conocidos de integración con Ollama para modelos de visión con mmproj separado, según advierte el propio autor.
- El nombre del repositorio incluye una marca temporal y un patrón que sugiere un experimento automatizado; conviene tratar el modelo como no validado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stellarconduct/GGUF-gemma4-SFT-26-11-16-08-07
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (implícito en los comandos de uso): no se proporciona enlace en la información disponible
- Modelo base Gemma 4: no se proporciona enlace en la información disponible
