# Thaurock/Gemma-3-27b-it-abliterated-GGUF

## Resumen

Gemma-3-27b-it-abliterated-GGUF es una coleccion completa de cuantizaciones en formato GGUF del modelo Gemma 3 27B IT de Google, al que se ha aplicado una tecnica experimental de "abliteration" para eliminar los rechazos artificiales del modelo base. El resultado es una variante multimodal (texto e imagen) que mantiene la coherencia cognitiva del original pero responde sin los filtros de seguridad estandarizados. El autor de las cuantizaciones es Thaurock, mientras que la tecnica de abliteration se atribuye a Maxime Labonne (mlabonne).

El modelo base, Gemma 3 27B IT, es un transformer multimodal de 27.009.346.304 parametros (aproximadamente 27B) desarrollado por Google, disenado para generacion de texto y comprension de imagenes. Esta version abliterated emplea una tecnica de abliteration por capas (layerwise) que calcula direcciones de rechazo en los estados ocultos con un multiplicador de peso de 1.5, alcanzando una tasa de exito/aceptacion superior al 90% segun la model card.

La relevancia de este repositorio radica en que ofrece el espectro completo de 11 cuantizaciones (desde F16 hasta Q2_K) sin splits, permitiendo ajustar el modelo a restricciones de VRAM/RAM concretas. Esto lo convierte en una opcion practica para despliegue local en llama.cpp, Ollama o LM Studio, especialmente para usuarios que necesitan inferencia multimodal sin restricciones de contenido en hardware consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), basado en Gemma 3 27B IT |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (11 variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 225.8 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma 3 27B IT es un transformer multimodal de Google que procesa tanto texto como imagenes, requiriendo un proyector de vision (`mmproj`) para la parte visual en llama.cpp. Esta variante abliterated no ha sido reentrenada: se ha modificado post-hoc mediante una tecnica experimental de abliteration por capas (layerwise), que calcula las direcciones de rechazo en los estados ocultos y las elimina con un multiplicador de peso de 1.5. Segun el autor, esto consigue una tasa de aceptacion superior al 90% eliminando rechazos artificiales, manteniendo intacta la coherencia cognitiva y multimodal.

No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset, ni si el modelo base uso RLHF/DPO, mas alla de que se trata de la variante instruction-tuned (IT) oficial de Google. La innovacion tecnica destacable de este repositorio es la coleccion completa de cuantizaciones sin splits y la aplicacion de abliteration a una arquitectura multimodal que, segun el autor, es "significativamente mas resistente a la neutralizacion" que arquitecturas anteriores.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredados del Gemma 3 27B IT.
- Comprension de imagenes (image-to-text) mediante el proyector de vision `mmproj`.
- Capacidad multimodal combinada texto + imagen en una misma inferencia.
- Respuestas sin rechazos artificiales (uncensored), con tasa de aceptacion declarada superior al 90%.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible (el modelo base Gemma 3 lo soporta, pero no se detalla en esta ficha).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no listados).

## Casos de uso

- Analisis de imagenes sin filtros de contenido: usar `llama-cli` con el `mmproj` para describir imagenes detalladamente sin restricciones, util en investigacion de vision por computador y auditoria de contenido.
- Despliegue local en GPU consumer: la variante Q4_K_M (~16.4 GB) permite inferencia multimodal en una sola GPU de consumo, ideal para prototipos y entornos de desarrollo sin acceso a clústeres.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o contenido editorial que el modelo base rechazaria por politicas de seguridad, con temperatura 1.0 y top_k 64.
- Investigacion sobre alineacion y seguridad: estudiar el comportamiento de modelos abliterated frente a los originales, comparando tasas de rechazo y coherencia en dominios sensibles.
- Desarrollo de asistentes conversacionales especializados: conversaciones multi-turno con contexto visual, integrables en aplicaciones de escritorio via Ollama o LM Studio.
- Pruebas de robustez multimodal: evaluar la degradacion de tokens visuales en cuantizaciones extremas (Q2_K ~10.0 GB) para experimentos de compresion.
- Pipeline de CI/CD para validacion de modelos: verificar integridad de descargas con `SHA256SUMS.txt` y automatizar pruebas de inferencia con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: F16 ~54.0 GB; Q8_0 ~28.6 GB; Q6_K ~22.4 GB; Q5_K_M ~19.3 GB; Q5_K_S ~18.8 GB; Q4_K_M ~16.4 GB; Q4_K_S ~15.5 GB; Q3_K_L ~13.6 GB; Q3_K_M ~12.5 GB; Q3_K_S ~11.7 GB; Q2_K ~10.0 GB.
- GPU recomendadas: F16 y Q8_0 requieren GPUs de gama empresarial (A100 80GB, H100); Q5_K_M y Q4_K_M caben en RTX 4090 (24 GB) y RTX 3090 (24 GB); Q3_K_S y Q2_K pueden caber en GPUs de 12-16 GB con margen ajustado.
- Cabe en GPU consumer: si, especialmente Q4_K_M (~16.4 GB) en RTX 4090/3090, y variantes Q3/Q2 en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier aplicacion compatible con GGUF multimodal; requiere cargar el proyector `gemma-3-27b-mmproj-f16.gguf` para vision.
- Latencia y throughput: no disponibles en la informacion proporcionada. Parametros de generacion recomendados: temperature 1.0, top_k 64, top_p 0.95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thaurock/Gemma-3-27b-it-abliterated-GGUF | ~27B | No disponible | Apache-2.0 | GGUF (11 cuantizaciones) | Abliterated, multimodal, coleccion completa |
| google/gemma-3-27b-it | ~27B | No disponible | Gemma license (no Apache-2.0) | safetensors | Modelo base oficial, con filtros de seguridad |
| Otras variantes abliterated de Gemma 3 | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el proceso de abliteration elimina los rechazos artificiales, por lo que el modelo puede generar contenido sensible, ofensivo o inapropiado; la responsabilidad recae en el operador de la inferencia local.
- Riesgo de alucinacion: inherente al modelo base y potencialmente acentuado por la modificacion experimental; no se han publicado evaluaciones de fidelidad.
- Degradacion en cuantizaciones extremas: Q2_K (~10.0 GB) puede experimentar degradacion en tokens visuales, segun el autor; recomendado solo para pruebas y desarrollo.
- Contexto e idiomas no documentados: no se especifica la longitud de contexto ni la lista de idiomas soportados en la informacion disponible.
- Licencia: Apache-2.0 declarada en este repositorio, pero el modelo base Gemma 3 de Google tiene su propia licencia (Gemma license); conviene verificar la compatibilidad para uso comercial, ya que el autor reclama Apache-2.0 sobre un derivado de un modelo con licencia distinta.
- Naturaleza experimental: el autor indica que el trabajo es "puramente experimental" y carece de los filtros de seguridad estandarizados del modelo base.
- Integridad de descargas: archivos de gran tamano (hasta 54 GB) sujetos a corrupcion; usar `SHA256SUMS.txt` para verificar.
- Parametros de generacion sensibles: la coherencia depende de configurar temperature 1.0, top_k 64 y top_p 0.95; otros valores pueden degradar la calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thaurock/Gemma-3-27b-it-abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Autor de la tecnica de abliteration: https://huggingface.co/mlabonne
- Perfil del autor de las cuantizaciones: https://huggingface.co/Thaurock
