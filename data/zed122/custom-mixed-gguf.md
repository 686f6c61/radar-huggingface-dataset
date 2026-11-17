# zed122/custom-mixed-gguf

## Resumen

`zed122/custom-mixed-gguf` es un repositorio de pesos en formato GGUF publicado por el usuario zed122 bajo licencia Apache 2.0. A pesar del nombre genérico, los datos de safetensors del repositorio indican un total de 23.572.403.200 parámetros (aproximadamente 23,6 mil millones), lo que lo sitúa en la franja de modelos densos de gran tamano. El repositorio ocupa 413,5 GB, un volumen coherente con múltiples variantes de cuantización empaquetadas en un mismo repo.

La model card es extremadamente escasa: se limita a declarar la licencia y a enlazar un repositorio de GitHub sobre cuantización mixta de precisión no uniforme (SUC-Mixed-Precision-Non-uniform-Quantization) y otro repositorio de Hugging Face con un fichero GGUF de un supuesto "Qwen3.6-35B-custom-mixed". No se documenta arquitectura, datos de entrenamiento, idiomas ni resultados de evaluación.

Por tanto, esta ficha debe leerse con cautela: la mayor parte de las especificaciones técnicas no están disponibles en la información proporcionada y se marcan como tales. El interés del repositorio reside en su enfoque de cuantización mixta no uniforme, no en un modelo original con model card completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 23.572.403.200 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantización mixta de precisión no uniforme (según enlace al repo SUC); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 413,5 GB); el dato de parámetros proviene de safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base (transformer denso, MoE, híbrido u otra), ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. La model card no incluye ninguna sección técnica.

El único elemento técnico documentado es el método de cuantización: el autor enlaza un repositorio de GitHub titulado "SUC-Mixed-Precision-Non-uniform-Quantization", lo que sugiere que los ficheros GGUF se generaron aplicando precisión mixta con asignación no uniforme de bits por capa o por tensor, en lugar de una cuantización uniforme estándar. No se detallan los criterios de asignación de precisión, las capas afectadas ni las métricas de degradación asociadas.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo, aunque no se documentan capacidades específicas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el formato GGUF puede servirse mediante infraestructura de inferencia compatible con endpoints.
- Razonamiento, código, matemáticas, visión, audio, tool calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.

## Casos de uso

- Despliegue local de inferencia conversacional: al estar en formato GGUF, el modelo puede cargarse con llama.cpp u Ollama en estaciones de trabajo, siempre que se seleccione la variante de cuantización adecuada al hardware disponible.
- Evaluación de técnicas de cuantización mixta: el repositorio sirve como material de estudio para comparar la precisión mixta no uniforme (método SUC) frente a cuantizaciones GGUF convencionales en un modelo de ~23,6B parámetros.
- Servicio de chat autoalojado: con el tag `endpoints_compatible`, puede integrarse en un servidor de inferencia propio para aplicaciones de chat internas, sujeto a la validación previa de calidad del modelo base.
- Prototipado de asistentes conversacionales: útil para equipos que necesitan un modelo de tamano medio-grande en local sin depender de APIs externas, con la licencia Apache 2.0 como ventaja para uso comercial.
- Investigación sobre degradación por cuantización: permite medir la pérdida de calidad entre variantes del mismo repo (413,5 GB de ficheros) y decidir el compromiso tamano/calidad para producción.
- Pruebas de integración en pipelines de inferencia: validar el comportamiento del GGUF en motores como llama.cpp o servidores compatibles antes de adoptar el modelo base subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~23,6B parámetros, una cuantización de 4 bits requeriría del orden de 12-14 GB de VRAM, y una de 8 bits en torno a 24-26 GB; estos cálculos son estimaciones genéricas, no datos del autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamano, un modelo de esta clase encajaría en GPUs de 24 GB (RTX 4090, A10G) con cuantización agresiva y en A100/H100 para precisiones mayores.
- GPU de consumo: probablemente viable en RTX 4090 y GPUs con 16-24 GB usando cuantizaciones de 4-5 bits, pendiente de verificación con las variantes concretas del repo.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; vLLM y TGI no se confirman para este formato concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica el modelo base ni ofrece datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre arquitectura, entrenamiento, idiomas ni evaluación, lo que impide validar su calidad antes de usarlo en producción.
- Procedencia del modelo base no confirmada: el enlace a un supuesto "Qwen3.6-35B-custom-mixed" no coincide con el recuento de parámetros de safetensors (~23,6B), lo que genera incertidumbre sobre qué modelo se cuantizó realmente.
- Riesgo de alucinación y sesgos: no evaluables por falta de documentación y de benchmarks.
- Limitaciones de contexto e idioma: desconocidas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación de cumplimiento; conviene verificar la licencia del modelo base subyacente antes de redistribuir.
- Tamano del repo (413,5 GB): requiere espacio en disco considerable y descargas largas; conviene descargar solo el fichero GGUF necesario.
- Sin garantías de mantenimiento: el repositorio tiene 1 like y 8.787 descargas, con actualización en octubre de 2026; no hay evidencia de soporte activo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zed122/custom-mixed-gguf
- Repositorio GitHub del método de cuantización: https://github.com/phox9622-dotcom/SUC-Mixed-Precision-Non-uniform-Quantization
- GGUF referenciado en la model card: https://huggingface.co/goodasdgood/Qwen3.6-35B-custom-mixed.gguf
