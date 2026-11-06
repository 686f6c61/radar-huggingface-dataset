# Thox-ai/ThoxOpen-Vision-Heretic

## Resumen

ThoxOpen-Vision-Heretic es un paquete de configuración publicado por Thox-ai sobre los pesos de un modelo comunitario derivado de Gemma 4 E2B. El modelo base es `MobiusDevelopment/gemma4-E2B-it-qat-Q4-unsloth-heretic`, una versión abliterada (con rechazos minimizados) del modelo de instrucciones Gemma 4 E2B de Google, cuantizado a Q4 mediante QAT por Unsloth. Thox-ai no ha entrenado ni modificado los pesos: su aportación consiste en un perfil de sistema propio (THOX Open), un paquete de conocimiento versionado (THOX Knowledge Pack v0.1) y el empaquetado para Ollama.

El modelo es multimodal de tipo image-text-to-text: acepta imágenes y texto a través del proyector de visión incluido en el build y responde con una postura de rechazo mínimo. Está pensado para asistencia local sobre hardware propio, con especial énfasis en privacidad y en experimentación con modelos de visión pequeños abliterados.

La relevancia actual reside en su enfoque de despliegue: pesos abiertos empaquetados para ejecución local vía Ollama, licencia Apache 2.0 y una arquitectura multimodal compacta (familia E2B) que cabe en GPU de gama consumer. No obstante, el repositorio de Hugging Face solo contiene el empaquetado (Modelfile, manifest y knowledge pack), no los pesos en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Gemma 4 E2B; proyector de visión incluido en el build |
| Parametros totales | no disponible (la nomenclatura E2B sugiere la variante "effective 2B" de la familia Gemma 4, sin cifra exacta publicada) |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens (verificado en carga según la model card) |
| Tipos de cuantizacion | Q4 (build QAT Q4 de Unsloth); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (distribución vía Ollama); el repositorio HF contiene Modelfile, manifest.json y knowledge pack JSONL, no los pesos |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 E2B, un transformer multimodal de la familia Gemma 4 de Google que procesa entradas de imagen y texto mediante un proyector de visión y genera respuestas de texto. La variante concreta empleada es un build QAT (quantization-aware training) en Q4 realizado por Unsloth, sobre el que MobiusDevelopment aplicó una abliteration para reducir los rechazos del modelo de instrucciones original.

Thox-ai no realizó entrenamiento, fine-tuning ni modificación de los pesos: según la model card, estos son byte-idénticos al release upstream (digest sha256:7290d5d0e090efbe990405c64585b8daf85448698b86dd26b9bb9e9ecf214dfe, 8,15 GB). El trabajo de Thox-ai se limita al perfil de sistema THOX Open, al THOX Knowledge Pack v0.1 (8 entradas públicas verificadas en formato JSONL), al empaquetado para Ollama y a la documentación y medición del release. No se detallan en la información disponible los datos de entrenamiento originales, el volumen de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto e interacción conversacional multi-turno en inglés.
- Comprensión de imágenes: descripción de contenido visual, respuesta a preguntas sobre documentos escaneados y capturas de pantalla (image-text-to-text).
- Postura de rechazo mínimo ("minimal-refusal"): el modelo está abliterado y puede producir contenido que otros modelos rechazan.
- Perfil de sistema THOX Open y paquete de conocimiento v0.1 integrados en el empaquetado.
- Despliegue local vía Ollama con un único comando.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidad multilingüe limitada al inglés según la metadata del modelo.

## Casos de uso

- Asistencia local sobre imágenes: el modelo puede describir fotografías o ilustraciones y responder preguntas sobre su contenido, ejecutándose íntegramente en hardware propio sin enviar datos a servicios externos.
- Preguntas y respuestas sobre documentos y capturas de pantalla: útil para extraer información de imágenes de documentos o interfaces, con la ventaja de privacidad del despliegue local.
- Experimentación con modelos de visión pequeños abliterados: investigadores pueden estudiar el comportamiento de un modelo multimodal de ~2B efectivos con rechazos minimizados en un entorno controlado.
- Prototipado de asistentes multimodales en local: gracias a su tamaño compacto y a la distribución GGUF vía Ollama, permite iterar rápidamente en estaciones de trabajo con GPU de gama consumer.
- Análisis de imágenes en flujos de trabajo privados: sectores con requisitos de confidencialidad (salud, legal, investigación) pueden procesar imágenes sin salida de datos a la nube.
- Evaluación de la postura THOX Open: desarrolladores interesados en comparar el comportamiento de un modelo con rechazo mínimo frente a su base original pueden usar este build como referencia reproducible.

## Benchmarks y rendimiento

La model card menciona cifras de evaluación de texto obtenidas en un "release smoke" estándar, pero no las incluye en el texto disponible. Los únicos datos medidos publicados son de carga y ejecución:

| Métrica | Valor |
|---|---|
| Fecha de medición | 2026-11-01 |
| Hardware | Estación x86_64 con GPU de clase 16 GB (host compartido) |
| Contexto cargado | 8.192 tokens |
| Memoria del runner en carga | 1,86 GB (VRAM + RAM del sistema según planificación del runner) |
| Tamaño del base | 8,15 GB |
| Throughput | no disponible (el dato queda truncado en la información proporcionada) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el runner reportó 1,86 GB de huella de memoria combinada (VRAM + RAM) con el modelo cargado a 8.192 de contexto en un host compartido, aunque el tamaño del archivo base es de 8,15 GB.
- GPU recomendadas: no especificadas por el autor; la medición se realizó en una GPU de clase 16 GB.
- Compatibilidad con GPU consumer: el tamaño del build (familia E2B en Q4) sugiere que cabe en GPU consumer de gama media-alta, aunque no se confirma con datos específicos.
- Opciones de despliegue: Ollama (método oficial, `ollama run Thox-ai/thoxopen-vision-heretic`); también es posible construir el modelo localmente desde el repositorio con `ollama create`. No se documentan otras opciones como vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponibles; el autor advierte que las cifras de throughput medidas en host compartido deben tratarse como un suelo, no como un perfil de estación de trabajo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Distribución |
|---|---|---|---|---|---|
| ThoxOpen-Vision-Heretic | no disponible (familia E2B) | 8.192 | Imagen + texto | Apache 2.0 | Ollama (GGUF) |
| MobiusDevelopment/gemma4-E2B-it-qat-Q4-unsloth-heretic (base) | no disponible (familia E2B) | no disponible | Imagen + texto | no disponible en esta ficha | Hugging Face (pesos) |
| Gemma 4 E2B it (original de Google) | no disponible (familia E2B) | no disponible | Imagen + texto | no disponible en esta ficha | Hugging Face |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada. La diferencia principal frente al base es la postura de rechazo mínimo y el empaquetado THOX; los pesos son idénticos.

## Limitaciones y advertencias

- Modelo abliterado con rechazo mínimo: puede generar contenido que otros modelos rechazan; el autor advierte explícitamente de la responsabilidad del usuario y de la necesidad de cumplir la legislación aplicable.
- No apto para uso no supervisado por menores, según la propia model card.
- Idioma limitado al inglés; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños; no se han publicado evaluaciones de fiabilidad.
- El repositorio de Hugging Face no contiene los pesos: solo el empaquetado (Modelfile, manifest y knowledge pack). La ejecución depende de Ollama y del pin del modelo base upstream.
- La licencia Apache 2.0 se declara sobre el empaquetado, pero el modelo base puede estar sujeto a los términos de la licencia de Gemma de Google; conviene verificar la cadena de licencias antes de un uso comercial.
- El paquete de conocimiento v0.1 contiene solo 8 entradas verificadas, por lo que su cobertura es muy limitada.
- Las mediciones de rendimiento se realizaron en un host compartido y no representan un perfil de producción.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOpen-Vision-Heretic
- Modelo base: https://huggingface.co/MobiusDevelopment/gemma4-E2B-it-qat-Q4-unsloth-heretic
- Ejecución vía Ollama: `ollama run Thox-ai/thoxopen-vision-heretic`
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
