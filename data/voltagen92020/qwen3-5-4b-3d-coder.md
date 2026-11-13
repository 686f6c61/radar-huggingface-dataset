# VoltAgen92020/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino (fine-tune) independiente del modelo Qwen/Qwen3.5-4B, desarrollado por el autor VoltAgen92020 (bajo la marca CCORE) y publicado en Hugging Face. El modelo está especializado en generación de código de propósito general, con un énfasis particular en la creación de escenas 3D interactivas mediante la librería Three.js. Se trata de una versión preliminar (early preview) de un experimento de entrenamiento que continúa en desarrollo, y no de un lanzamiento oficial de Qwen.

El modelo parte de la arquitectura Qwen3.5 de 4B parámetros (4.539.265.536 parámetros totales según los pesos en safetensors) y ha sido reentrenado sobre el dataset público CCORE Three.js 3D Scenes, compuesto por 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validación) que incluyen prompts, trazas de razonamiento completas y respuestas HTML/JavaScript. El repositorio ocupa 17 GB e incluye pesos en FP16 (cuatro shards en safetensors) y cuantizaciones GGUF Q4_K_M y Q8_0.

Su relevancia actual radica en explorar la viabilidad de modelos pequeños (4B) para tareas de codificación especializada y generación de escenas 3D de calidad, un nicho donde tradicionalmente se emplean modelos de mayor tamaño. La licencia Apache 2.0 facilita su uso comercial, y la disponibilidad de versiones GGUF con soporte opcional de visión lo hace desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (64K, configurado en ejemplos de llama.cpp) |
| Tipos de cuantizacion | FP16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16, 4 shards), GGUF (Q4_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-4B, sobre la que se aplica un ajuste fino supervisado. No se especifica en la información disponible si se emplearon técnicas de RLHF o DPO; el dataset de entrenamiento incluye trazas de razonamiento (thinking traces) completas, lo que sugiere un entrenamiento orientado a la generación de cadenas de pensamiento antes de la respuesta final. El conjunto de datos CCORE Three.js 3D Scenes contiene 4.146 escenas (3.933 de entrenamiento, 213 de validación) con prompts, trazas de pensamiento, respuestas HTML/JavaScript completas y niveles de complejidad, bajo licencia MIT.

Una innovación destacable es el soporte opcional de visión: las versiones GGUF Q4_K_M y Q8_0 pueden aceptar imágenes si se cargan junto con el proyector de visión original de Qwen3.5-4B (archivo `mmproj-Qwen3.5-4B-BF16.gguf`, aproximadamente 644 MiB). Esto permite generar escenas Three.js a partir de una imagen de referencia. El proyector es el BF16 sin modificar de lmstudio-community/Qwen3.5-4B-GGUF. El modelo también incluye un informe técnico en PDF que documenta el experimento de entrenamiento.

## Capacidades

- Generación de código de propósito general, con especialización en JavaScript y Three.js para escenas 3D interactivas.
- Generación de escenas 3D completas en HTML/JavaScript a partir de descripciones textuales.
- Modo de razonamiento (thinking traces): el dataset incluye cadenas de pensamiento completas que el modelo aprende a producir.
- Soporte opcional de visión en GGUF (Q4_K_M y Q8_0): acepta imágenes de referencia para generar escenas 3D guiadas por imagen.
- Generación de escenas por voxels y otros estilos 3D (según el ejemplo cualitativo de la model card).
- Conversacional (tag `conversational`).
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js para prototipado web: el modelo produce HTML/JavaScript completo con escenas 3D interactivas, adecuado para prototipar visualizaciones o demos rápidas sin escribir el código manualmente.
- Creación de escenas 3D guiadas por imagen: cargando el proyector de visión con los GGUF, se puede adjuntar una imagen de referencia y pedir al modelo que genere la escena correspondiente, útil para convertir bocetos o referencias visuales en código funcional.
- Asistente de código en el navegador o IDE: al ser un modelo de 4B cuantizado en GGUF, puede ejecutarse localmente en hardware de consumo y asistir en tareas de codificación JavaScript/WebGL.
- Educación y aprendizaje de Three.js: el modelo puede explicar y generar ejemplos de escenas 3D con trazas de razonamiento, útil como herramienta didáctica para desarrolladores que aprenden gráficos 3D en web.
- Generación de contenido para videojuegos y experiencias interactivas: creación de escenas voxel o entornos 3D simples para prototipos de juegos web.
- Despliegue local con privacidad: al ejecutarse con llama.cpp en local (probado con b11889), permite generar código sin enviar datos a servicios en la nube, relevante para entornos con requisitos de confidencialidad.
- Integración en pipelines de generación de assets 3D: el modelo puede formar parte de un flujo automatizado que genere código de escenas a partir de especificaciones textuales o imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona resultados cualitativos ("one-shot success has improved substantially" tras la actualización del checkpoint del 27 de octubre), sin cifras concretas de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 9 GB solo para pesos (4.539 millones de parámetros × 2 bytes), más overhead de KV-cache y contexto; en Q8_0, aproximadamente 4,5-5 GB; en Q4_K_M, aproximadamente 2,5-3 GB.
- Contexto largo: con 64K tokens de contexto, el KV-cache incrementa notablemente el uso de memoria; la model card sugiere `--cache-type-k q8_0 --cache-type-v q8_0` para reducirlo.
- GPU recomendadas: para FP16, GPU con 16 GB o más (RTX 4090, A100, H100); para Q4_K_M, cabe en GPU de consumo con 6-8 GB (RTX 3060, RTX 4060, etc.).
- Cabe en GPU de consumo: sí, en cuantización Q4_K_M y Q8_0.
- Opciones de despliegue: llama.cpp (probado con b11889, incluyendo `llama-server` con WebUI), Transformers 5.20.2 (verificado para carga y generación de texto con FP16), GGUF compatible con frontends que soporten multimodalidad para visión.
- Latencia y throughput: no disponible en la información proporcionada.
- Memoria adicional para visión: el proyector ocupa aproximadamente 644 MiB adicionales, y los tokens de imagen comparten la ventana de contexto con el prompt y el código generado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4,54B | 64K | Código + Three.js 3D | Apache 2.0 | Hugging Face (FP16, GGUF) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Propósito general | Apache 2.0 | Hugging Face |
| Modelos de código de 7B (p. ej. Qwen2.5-Coder-7B) | ~7B | no disponible | Código general | Apache 2.0 | Hugging Face |

La comparativa con alternativas especializadas en 3D o Three.js no está disponible en la información proporcionada. El modelo base Qwen3.5-4B es la referencia directa; el ajuste añade especialización en Three.js y soporte opcional de visión a través del proyector.

## Limitaciones y advertencias

- Es una versión preliminar (early preview) de un entrenamiento en curso; la calidad puede ser inconsistente y algunas escenas requieren otro intento o corrección, según el propio autor.
- No es un lanzamiento oficial de Qwen: es un fine-tune independiente de CCORE/VoltAgen92020, sin el respaldo del equipo de Qwen.
- Riesgo de alucinación inherente a los modelos de lenguaje; en generación de código puede producir APIs inexistentes o escenas que no renderizan correctamente.
- El soporte de visión es opcional y solo está disponible en los GGUF Q4_K_M y Q8_0 con el proyector cargado; en otros frontends depende de su implementación multimodal.
- Los tokens de imagen consumen contexto compartido con el prompt y el código generado, lo que reduce el espacio efectivo para la generación.
- Las pruebas de visión con 64K de contexto fueron breves y no son pruebas de estrés de contexto completo, según la model card.
- Idiomas soportados no especificados; el dataset de entrenamiento está orientado a prompts en inglés (según los ejemplos).
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.5-4B, cuyos términos deben respetarse.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoltAgen92020/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CCORE Three.js 3D Scenes: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe técnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Proyector de visión BF16: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- Proyector original (lmstudio-community): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Discusión con imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
- Perfil del autor CCORE: https://huggingface.co/ccore
