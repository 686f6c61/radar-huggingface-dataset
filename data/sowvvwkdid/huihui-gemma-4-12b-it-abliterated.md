# Sowvvwkdid/Huihui-gemma-4-12B-it-abliterated

## Resumen

Huihui-gemma-4-12B-it-abliterated es una versión "abliterada" (sin filtros de rechazo) del modelo google/gemma-4-12B-it, publicada por el usuario Sowvvwkdid en Hugging Face a partir del trabajo del equipo huihui-ai. La abliteración es una técnica que modifica internamente las direcciones de rechazo del modelo para eliminar sus negativas de seguridad, sin necesidad de reentrenamiento ni de herramientas como TransformerLens. El resultado es un modelo multimodal (image-text-to-text, pipeline any-to-any) que responde a peticiones que el modelo original rechazaría.

El modelo base es Gemma 4 12B en su variante instruction-tuned (it), con aproximadamente 11,96 mil millones de parámetros según los metadatos de safetensors. Su relevancia reside en la demanda de modelos abiertos sin alineación de seguridad para investigación, red-teaming y pruebas controladas. El autor advierte explícitamente de que la primera versión publicada de los pesos base de google/gemma-4-12B-it tenía defectos, por lo que este modelo fue re-abliterado y re-subido; quienes lo descargaran antes deben volver a descargarlo.

Cabe señalar que existe una versión idéntica disponible en Ollama bajo el identificador huihui_ai/gemma-4-abliterated:12b, lo que facilita su ejecución local sin configuración manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer multimodal any-to-any; detalles no disponibles) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en 24,0 GB, presumiblemente precisión completa o bf16; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la model card enlaza además a la Gemma 4 License de Google) |
| Formato de pesos | safetensors (compatible con transformers y endpoints) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, la variante alineada con instrucciones del modelo Gemma 4 de 12 mil millones de parámetros. Según los metadatos, la arquitectura es `gemma4_unified` con pipeline `any-to-any`, lo que sugiere capacidades multimodales de entrada imagen-texto a salida texto. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni los procesos de RLHF/DPO aplicados al modelo base.

La innovación de esta versión no está en la arquitectura sino en el post-procesado: la abliteración se realizó con una implementación propia (proof-of-concept, sin TransformerLens) descrita en el repositorio remove-refusals-with-transformers. El proceso se aplicó únicamente a las capas 23 a 28 del modelo, y tanto el modo de pensamiento (thinking mode) como el modo sin pensamiento (non-thinking mode) fueron completamente abliterados. Esto implica que el modelo base incorpora un modo de razonamiento explícito, aunque no se han publicado detalles técnicos sobre su funcionamiento.

## Capacidades

- Generacion de texto sin filtros de rechazo: responde a peticiones que el modelo original denegaría, en ambos modos (thinking y non-thinking).
- Comprension multimodal: etiquetado image-text-to-text y pipeline any-to-any, lo que indica entrada de imágenes y texto (los detalles exactos de las modalidades no están documentados).
- Razonamiento con thinking mode: el modelo base dispone de un modo de razonamiento explícito, abliterado también en esta versión.
- Compatibilidad con el ecosistema transformers y Ollama: despliegue directo con `ollama run huihui_ai/gemma-4-abliterated:12b`.
- Soporte de tool calling, function calling y agentes: no disponible (no documentado en la model card).

## Casos de uso

- Investigacion en alineacion y seguridad: permite estudiar el comportamiento de un modelo sin filtros para analizar qué tipo de contenidos genera sin salvaguardas, útil para red-teaming y auditoria de alineación.
- Evaluacion de tecnicas de abliteracion: al tratarse de una implementación proof-of-concept sin TransformerLens, es material de estudio para investigadores que comparan métodos de eliminación de rechazos y su efecto en las capas 23-28.
- Generacion de contenido creativo sin restricciones: escritura de ficción con temáticas adultas o controvertidas donde el modelo original se negaría, siempre en entornos controlados.
- Pruebas de robustez de pipelines: testeo de sistemas RAG o de agentes frente a entradas adversariales, observando cómo responde un modelo sin capa de rechazo.
- Analisis forense y moderacion: generación de ejemplos de contenido sensible para entrenar clasificadores de moderación o para investigación académica sobre daño potencial.
- Ejecucion local rapida con Ollama: gracias al paquete oficial en Ollama, se puede probar el modelo en local con un solo comando, útil para experimentación sin infraestructura compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 24,0 GB en safetensors, lo que apunta a pesos en bf16/fp16; se recomienda una GPU con al menos 24 GB de VRAM para inferencia en precisión completa, o algo menos con cuantización externa (no disponible en el repo).
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090, A100 40 GB o H100 para servir el modelo sin cuantizar.
- Consumer GPUs: cabe en una RTX 3090 o 4090 de 24 GB en precisión nativa; con versiones cuantizadas vía Ollama (GGUF) podría funcionar en GPUs de 12-16 GB, aunque el nivel de cuantización no está documentado.
- Opciones de despliegue: transformers (librería nativa), Ollama (`huihui_ai/gemma-4-abliterated:12b`, requiere la última versión de Ollama), y endpoints compatibles según los metadatos de Hugging Face. No se menciona soporte explícito de vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Huihui-gemma-4-12B-it-abliterated | ~12B | Gemma 4 abliterado, multimodal | apache-2.0 | Hugging Face y Ollama |
| google/gemma-4-12B-it | ~12B | Gemma 4 con filtros de seguridad | Gemma 4 License (restricciones de uso) | Hugging Face |
| Otras variantes abliteradas de huihui-ai | variadas | Abliteraciones de modelos abiertos populares | Variable segun base | Hugging Face y Ollama |

La diferencia clave frente al modelo base es la ausencia de filtros de rechazo y la licencia apache-2.0 declarada en el repo (aunque la model card enlaza a la Gemma 4 License de Google, lo que introduce ambigüedad sobre los términos aplicables al modelo base). Datos de rendimiento comparativo: no disponible.

## Limitaciones y advertencias

- Eliminacion de salvaguardas: el filtrado de seguridad está significativamente reducido; el modelo puede generar contenido sensible, controvertido o inapropiado. Se recomienda revisión rigurosa de las salidas.
- No apto para todos los publicos: las salidas pueden ser inapropiadas para entornos públicos, menores de edad o aplicaciones que exijan alta seguridad.
- Responsabilidad legal y etica: el usuario es el único responsable de cumplir la legislación local y las normas éticas; huihui.ai declina toda responsabilidad por las consecuencias del uso.
- Uso recomendado solo en investigacion: el autor aconseja limitarlo a investigación, pruebas o entornos controlados, evitando producción o aplicaciones comerciales públicas.
- Sin garantias de seguridad: a diferencia del modelo base, no ha pasado por optimización de seguridad; se aconseja monitorización en tiempo real y revisión manual de las salidas.
- Pesos corregidos: la primera versión de los pesos base de google/gemma-4-12B-it tenía problemas; si se descargó el modelo antes de la corrección, hay que volver a descargarlo.
- Ambigüedad de licencia: el repo declara apache-2.0 pero enlaza a la Gemma 4 License de Google; conviene verificar qué términos aplican al modelo base antes de uso comercial.
- Datos tecnicos incompletos: longitud de contexto, idiomas soportados, benchmarks y detalles de entrenamiento no están documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sowvvwkdid/Huihui-gemma-4-12B-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Version en Ollama: https://ollama.com/huihui_ai/gemma-4-abliterated:12b
- Repositorio de la tecnica de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Gemma 4 License de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de Ollama: https://github.com/ollama/ollama/releases/
- Soporte al equipo huihui-ai: https://ko-fi.com/huihuiai
