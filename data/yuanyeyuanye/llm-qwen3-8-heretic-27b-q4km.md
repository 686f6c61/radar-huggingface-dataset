# yuanyeyuanye/llm-qwen3.8-heretic-27b-q4km

## Resumen

Este repositorio aloja una cuantización GGUF en formato Q4_K_M del modelo **Qwen3.8-27B-Heretic**, una variante "abliterated" (sin censorship por abliteration) del modelo base Qwen3.8-27B de Qwen. El repositorio, creado por el usuario yuanyeyuanye, no es un entrenamiento nuevo: se trata de una caché de modelo de un solo archivo diseñada para un endpoint serverless de llama.cpp en RunPod, ya que los Cached Models de RunPod descargan el repositorio completo y solo se necesitan los dos archivos que sirve el endpoint.

El archivo principal, `qwen3.8-heretic-27b-q4km.gguf`, procede de la capa del modelo `qwen3.8-heretic:27b-q4km` de Ollama, importado a su vez del repositorio [0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF](https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF) (archivo `RVN-Q4_K_M-multilingual.gguf`). Además, incluye un proyector multimodal (`mmproj-Qwen3.8-27B-Q8_0.gguf`) en Q8_0, lo que sugiere que el modelo base soporta entrada de imágenes. Su relevancia práctica es para despliegues autoalojados en GPU con VRAM limitada: una cuantización Q4_K_M de un modelo de ~27B parámetros ocupa unos 17 GB y permite inferencia local razonablemente rápida. La licencia es Apache-2.0, heredada del modelo base y del repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; detalle no disponible) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos principales), Q8_0 (proyector multimodal) |
| Idiomas soportados | no disponible (el archivo fuente se etiqueta como "multilingual") |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp; cuantizada con imatrix) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de la familia Qwen con aproximadamente 26,9 mil millones de parámetros. Sobre este modelo se ha aplicado un proceso de **abliteration** (variante "Heretic"), una técnica que modifica direccionalmente los pesos del modelo (típicamente identificando y neutralizando las direcciones de rechazo en el espacio de activaciones) para eliminar los comportamientos de negativa de respuesta entrenados por RLHF, sin necesidad de reentrenamiento. Este repositorio no contiene el modelo abliterated original, sino una conversión a GGUF con cuantización Q4_K_M mediante matriz de importancia (imatrix), que reduce el tamaño a unos 17 GB manteniendo calidad cercana a la cuantización original.

No hay información publicada en este repositorio sobre los datos de entrenamiento del modelo base, el número de tokens, ni los procesos de post-entrenamiento (RLHF/DPO). El archivo `mmproj-Qwen3.8-27B-Q8_0.gguf` es el proyector multimodal (multimodal projector) usado por llama.cpp para codificar imágenes, lo que indica que la variante soporta entradas visuales además de texto.

## Capacidades

- Generación de texto conversacional (tag `conversational`), con los comportamientos de rechazo eliminados por abliteration.
- Entrada multimodal: el proyector mmproj incluido permite procesar imágenes junto con texto en llama.cpp.
- Compatibilidad con el ecosistema llama.cpp y Ollama (el archivo procede de una capa de modelo de Ollama).
- Etiquetado como "multilingual" en el archivo fuente, lo que sugiere soporte de varios idiomas (sin lista confirmada).
- Tool calling, agentes y capacidades de razonamiento: no disponible en la información proporcionada.

## Casos de uso

- **Despliegue serverless en RunPod**: el repositorio está diseñado específicamente como caché para un endpoint serverless de llama.cpp en RunPod; al descargar solo dos archivos, minimiza el tiempo de arranque en frío del endpoint.
- **Chatbot autoalojado sin filtros**: al ser una variante abliterated, responde sin las negativas típicas de los modelos alineados; adecuado para entornos de investigación o aplicaciones donde el control de moderación se gestiona externamente.
- **Inferencia local en GPU de consumo/entusiasta**: con ~17 GB en Q4_K_M, cabe en una RTX 4090 de 24 GB (incluso con el proyector multimodal cargado), permitiendo chat local privado.
- **Análisis de imágenes local**: gracias al mmproj en Q8_0, se pueden montar pipelines de descripción o extracción de información de imágenes con llama.cpp sin depender de APIs externas.
- **Prototipado de aplicaciones multilingües**: la etiqueta "multilingual" del archivo fuente lo hace candidato para asistentes en varios idiomas, previa validación por el desarrollador.
- **Integración en backends con llama-cpp-python**: el formato GGUF y la compatibilidad con endpoints de llama.cpp facilitan su uso como backend LLM en aplicaciones FastAPI o similares.
- **Investigación sobre abliteration**: sirve como caso de estudio para comparar el comportamiento del modelo base frente a su versión abliterated en benchmarks de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: ~17 GB solo para los pesos en Q4_K_M; con contexto, KV cache y el proyector multimodal Q8_0, se recomienda al menos 20-24 GB de VRAM. En CPU/Mac unificada, un equipo con 32 GB de RAM sería razonable.
- **GPU recomendadas**: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 5090, o en la nube una A100 40GB / L40S. En RunPod, cualquier GPU con ≥24 GB de VRAM es adecuada.
- **Consumer GPU**: sí, cabe completamente en una RTX 3090 o RTX 4090 de 24 GB. En GPUs de 16 GB (RTX 4080/4060 Ti 16GB) requeriría offload parcial a CPU con degradación notable de velocidad.
- **Despliegue**: llama.cpp (caso de uso principal, incluido `llama-server`), Ollama (el archivo procede de una capa de Ollama), LM Studio, y cualquier runtime GGUF compatible. No consta soporte verificado en vLLM o TGI para este GGUF concreto (vLLM requiere normalmente pesos safetensors).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Heretic Q4_K_M (este) | ~27B | Q4_K_M (GGUF) | Apache-2.0 | Abliterated, multimodal via mmproj, orientado a RunPod/llama.cpp |
| Qwen3.8-27B (base) | ~27B | safetensors (varias cuantizaciones comunitarias) | Apache-2.0 | Modelo original alineado, con comportamientos de rechazo |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | ~27B | Varias (incl. Q4_K_M) | Apache-2.0 | Repositorio fuente con más cuantizaciones disponibles |

Otras alternativas comparables (modelos abliterated de ~27B de otras familias): no disponible.

## Limitaciones y advertencias

- **Eliminación de salvaguardas**: al ser un modelo abliterated ("uncensored"), no rechaza peticiones dañinas por sí mismo. Es responsabilidad del desplegador implementar moderación externa; su uso puede estar restringido por las políticas de algunas plataformas y jurisdicciones.
- **Pérdida de calidad por cuantización y abliteration**: Q4_K_M implica pérdida frente a FP16, y la abliteration puede degradar la coherencia y las capacidades de razonamiento en algunos casos. No hay benchmarks que cuantifiquen esta degradación.
- **Procedencia indirecta**: el archivo ha pasado por tres repositorios (fuente original de 0bserverx, capa de Ollama, y esta caché). Aunque se publican hashes SHA-256 para verificación, la cadena de custodia añade riesgo; conviene verificar los hashes antes de usar en producción.
- **Datos del modelo base no documentados**: contexto, idiomas, capacidades de tool calling y benchmarks del Qwen3.8-27B base no constan en la model card de este repositorio.
- **Alucinaciones**: como todo LLM, puede generar contenido falso con apariencia plausible; el riesgo puede ser mayor tras la abliteration al no existir mecanismos de negativa.
- **Licencia**: Apache-2.0 permite uso comercial, pero el comportamiento del modelo sin salvaguardas puede violar términos de servicio de proveedores de infraestructura.
- **Repositorio minimalista**: al ser una caché de despliegue, no incluye model card técnica completa ni ejemplos de uso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/yuanyeyuanye/llm-qwen3.8-heretic-27b-q4km
- Repositorio fuente del GGUF abliterated: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Otros enlaces (paper, blog, demo): no disponible
