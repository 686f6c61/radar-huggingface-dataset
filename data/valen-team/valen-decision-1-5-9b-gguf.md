# Valen-Team/Valen-Decision-1.5-9B-GGUF

## Resumen

Valen-Decision-1.5-9B es un modelo de decisión estructurada desarrollado por Valen-Team, derivado del modelo base Qwen/Qwen3.5-9B mediante un proceso de fine-tuning orientado a tareas de clasificación y extracción de información. A diferencia de un modelo conversacional al uso, su propósito es recibir un estado (mensajes de usuario, imágenes o vídeos) y devolver, en una única pasada de inferencia, probabilidades para preguntas de tipo `choice`, `score`, `noul` y `bbox`. Esto lo sitúa en la categoría de modelos de decisión con salida tipada, una alternativa a los pipelines de clasificación tradicionales o a los LLM generativos forzados a emitir JSON.

El modelo cuenta con 7.948.259.117 parámetros (aproximadamente 7,9 mil millones) y se distribuye en este repositorio en formato GGUF para el runtime propietario Valen 0.2.0, basado en una bifurcación de llama.cpp. Incluye un fichero de texto en cuantización Q8_0 (7,91 GiB) y F32 (29,62 GiB), más un fichero de visión independiente (`vision-native-limits-F32.gguf`, 1,70 GiB) que habilita peticiones de imagen y de bounding box. La licencia es Apache 2.0.

Su relevancia actual radica en que aborda un patrón de uso muy frecuente en producción —clasificar tickets, validar imágenes de producto, etiquetar acciones en vídeo— sin necesidad de generar texto libre, lo que reduce la latencia y elimina el riesgo de salidas malformadas. La familia Valen-Decision-1.5 se publica en cinco tamaños (0,8B, 2B, 4B, 9B y 27B) y tres formatos (pesos nativos, ONNX y GGUF), lo que permite escalar según los requisitos de memoria y precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con atención bidireccional por bloques (block-bidirectional attention) y cabeza de grounding bbox |
| Parametros totales | 7.948.259.117 (aproximadamente 7,9B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible de forma explícita; el runtime de ejemplo se lanza con `-c 4096` |
| Tipos de cuantizacion | F32 y Q8_0 (texto); F32 para el fichero de visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (runtime Valen 0.2.0); pesos nativos y ONNX en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y añade dos modificaciones estructurales descritas en la model card: atención bidireccional por bloques y una cabeza de grounding para bounding boxes. La atención bidireccional por bloques permite que, dentro de un bloque, los tokens se atiendan mutuamente en ambas direcciones, lo que resulta adecuado para tareas de clasificación y extracción donde la decisión depende del contexto completo y no de una generación autoregresiva token a token. La cabeza de grounding produce coordenadas de caja para preguntas de tipo `bbox`.

La inferencia se organiza en torno a un esquema de "estado compartido" (`shared-state`): el runtime recibe un objeto `state` con los mensajes o medios y un conjunto de `questions` tipadas, y evalúa toda la petición en una sola pasada. Las preguntas pueden ser de tipo `choice` (con criterios y etiquetas), `score`, `noul` o `bbox`, y la respuesta contiene las probabilidades de cada candidato. Según la model card, el entrenamiento de Valen-Decision-1.5 no es público y no se detallan el número de tokens, la composición del dataset ni si se emplearon RLHF o DPO. El repositorio incluye código de entrenamiento en GitHub para fine-tuning sobre datos propios.

## Capacidades

- Clasificación de texto mediante preguntas de tipo `choice`, devolviendo probabilidades por etiqueta candidata en una sola pasada.
- Puntuación (`score`) de mensajes o contenidos según criterios definidos por el usuario.
- Preguntas de tipo `noul` (según la nomenclatura del runtime) para decisiones sin etiqueta predefinida.
- Grounding visual: preguntas de tipo `bbox` que devuelven coordenadas de caja sobre imágenes, gracias al fichero de visión y a la cabeza de grounding.
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`).
- Identificación de acciones en vídeo, según la descripción de la model card.
- Salida estructurada y tipada (`image-text-to-typed-output`, `structured-output`), sin generación de texto libre.
- Soporte de estado compartido (`shared-state`) para evaluar varias preguntas sobre el mismo contexto en una única pasada.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el esquema nativo de Decisions a través de `/v1/systemone` y `/v1/decisions`.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento multi-paso en la información disponible.

## Casos de uso

- **Clasificación de sentimiento en atención al cliente**: enviar el mensaje del usuario como `state` y una pregunta `choice` con criterios `positive`/`negative`; el modelo devuelve probabilidades directamente utilizables para enrutar o priorizar el ticket. El ejemplo de la model card (`"The film was excellent."`) ilustra exactamente este flujo.
- **Enrutamiento de tickets de soporte**: el Cookbook oficial incluye un tutorial de `ticket-routing`; el modelo evalúa el mensaje y asigna categorías con probabilidad asociada, lo que permite aplicar umbrales de confianza y derivar a revisión humana los casos ambiguos.
- **Cribado de imágenes de producto**: el tutorial `product-screening` muestra cómo comprobar si una imagen cumple requisitos mediante preguntas `choice` sobre la imagen y, si procede, preguntas `bbox` para localizar el objeto o la región relevante.
- **Etiquetado de acciones en vídeo**: el tutorial `video-tagging` describe el flujo para identificar acciones en secuencias de vídeo, aprovechando la capacidad de procesar medios junto con preguntas tipadas.
- **Moderación de contenido con umbrales de probabilidad**: al devolver distribuciones de probabilidad en lugar de texto, se pueden fijar políticas de incertidumbre (por ejemplo, aceptar automáticamente por encima de 0,9 y escalar por debajo de 0,7) sin parsear salidas generativas.
- **Detección y localización de objetos en imágenes**: usar preguntas `bbox` para obtener coordenadas de caja en una sola pasada, útil en pipelines de inspección visual o verificación documental.
- **Extracción de decisiones en lote sobre CPU**: el runtime 0.2.0 está disponible para Linux x86-64 con AVX2/FMA/F16C/BMI2 y permite servir con `-ngl 0` en CPU, adecuado para despliegues sin GPU donde la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona un "Decision Index" como métrica de evaluación propia, en la que los tamaños mayores obtienen mejores puntuaciones, pero no se proporcionan cifras concretas.

Sí se documenta una comparación de fidelidad entre el runtime GGUF 0.2.0 y la inferencia nativa `model.predict` en FP32, sobre seis peticiones (texto, imagen y cuatro de bbox) en CPU Linux x86-64:

| Fichero | Diferencia de probabilidad | Diferencia de caja | Diferencia de confianza bbox |
|---|---:|---:|---:|
| F32 | 0,00025 | 0,0031 | 0,0021 |
| Q8_0 | 0,00862 | 0,0032 | 0,0071 |

El umbral de aceptación de la release es una diferencia de probabilidad de como máximo 0,08; ambos ficheros lo cumplen con margen amplio. El recuento de tokens fue idéntico en todas las peticiones.

## Requisitos de hardware

- **VRAM/RAM para Q8_0**: el fichero de texto ocupa 7,91 GiB; sumando el fichero de visión (1,70 GiB) y el overhead del runtime, se recomienda al menos 10-12 GB de memoria disponible para servir texto e imagen.
- **F32**: el fichero de texto ocupa 29,62 GiB, por lo que requiere al menos 32 GB de memoria para texto y más si se sirve visión.
- **CPU**: el runtime oficial de la release 0.2.0 es para Linux x86-64 (Ubuntu 22.04+, glibc 2.35+, AVX2/FMA/F16C/BMI2). El ejemplo de la model card se lanza con `-ngl 0`, es decir, sin descarga en GPU.
- **GPU**: no se documentan requisitos ni modelos de GPU recomendados (A100, H100, RTX 4090, etc.) en la información disponible.
- **Consumer GPU**: no confirmado; el runtime publicado en esta release es de CPU. Para GPU habría que recurrir a los pesos nativos con Transformers o al formato ONNX.
- **Despliegue**: runtime Valen GGUF 0.2.0 (`./serve`), pesos nativos para Transformers y formato ONNX en repositorios hermanos. No se menciona compatibilidad con vLLM, llama.cpp estándar, Ollama o TGI; el runtime es una bifurcación propia de llama.cpp.
- **Latencia y throughput**: no disponibles. El ejemplo de servicio usa `-t 4`, `--parallel 1` y `-c 4096 -b 4096 -ub 4096`, lo que sugiere un despliegue de un solo proceso con cuatro hilos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables de la misma categoría (modelos de decisión con salida tipada). La comparación más directa posible es con su modelo base y con los otros tamaños de la propia familia, para los que solo se conoce el número de parámetros:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Valen-Decision-1.5-9B | 7,9B | no disponible | GGUF, nativo, ONNX | Apache 2.0 | Objeto de esta ficha |
| Valen-Decision-1.5-27B | 27B (por nombre) | no disponible | GGUF, nativo, ONNX | Apache 2.0 | Mayor Decision Index según la model card |
| Valen-Decision-1.5-4B | 4B (por nombre) | no disponible | GGUF, nativo, ONNX | Apache 2.0 | Disponible en API gratuita y demo |
| Qwen/Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | Modelo base; generativo, no especializado en decisión |

No se identifican en la información proporcionada alternativas de otros desarrolladores con las que comparar parámetros, contexto, rendimiento y licencia de forma rigurosa.

## Limitaciones y advertencias

- **Datos de entrenamiento no públicos**: no se puede auditar la composición del dataset, lo que dificulta evaluar sesgos y cobertura idiomática.
- **Idiomas no especificados**: la model card no declara idiomas soportados; el rendimiento fuera del inglés (el único ejemplo de la card está en inglés) no está verificado.
- **Riesgo de calibración**: el modelo devuelve probabilidades, pero no se documenta si están calibradas; las políticas de umbral deben validarse sobre datos propios antes de usarse en producción.
- **Dependencia de runtime propietario**: el GGUF requiere el runtime Valen 0.2.0, una bifurcación de llama.cpp, y no se garantiza compatibilidad con llama.cpp estándar, Ollama, vLLM o TGI.
- **Plataforma limitada**: el runtime publicado es solo para Linux x86-64 con AVX2/FMA/F16C/BMI2; no hay builds para macOS, Windows ni ARM en la información disponible.
- **Contexto no documentado**: la longitud máxima de contexto no se declara; el ejemplo usa 4096 tokens y la card indica que hay que aumentar `-c`, `-b` y `-ub` conjuntamente para peticiones mayores.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y del runtime, así como las notas de licencia del Cookbook.
- **Sin soporte documentado de tool calling ni agentes**: no es un modelo generativo conversacional; no debe emplearse para tareas de razonamiento multi-paso o generación abierta.
- **Madurez**: el repositorio tiene pocas descargas (1106) y un único "like" en el momento de la consulta, lo que sugiere una adopción aún temprana.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B-GGUF
- Pesos nativos 9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- ONNX 9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B-ONNX
- Tamaño 0.8B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Tamaño 2B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Tamaño 4B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Tamaño 27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- API gratuita y demo web: https://valen-team.github.io/
- Playground Space: https://huggingface.co/spaces/Valen-Team/Valen-API
- Código de entrenamiento: https://github.com/Valen-Team/Valen
- Release del runtime GGUF 0.2.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.2.0
- Guía del runtime GGUF: https://valen-team.github.io/docs/valen/gguf/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Cookbook: API básica: https://valen-team.github.io/cookbook/api-quickstart/
- Cookbook: inferencia local: https://valen-team.github.io/cookbook/local-inference/
- Cookbook: enrutamiento de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Cookbook: cribado de imágenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Cookbook: etiquetado de vídeo: https://valen-team.github.io/cookbook/video-tagging/
