# toyoshimax/plamo-3-translate-0.8b-diorama-patches

## Resumen

Los "diorama weight-space patches" de PLaMo 3 Translate 0.8B son un conjunto de parches de pesos dispersos publicados por el usuario toyoshimax sobre el modelo de traducción `pfnet/plamo-3-translate-0.8b-GGUF` de Preferred Networks. No se trata de un modelo completo, sino de cuatro ficheros `.safetensors` de aproximadamente 792 KiB cada uno que modifican un 0,38 % de los pesos del modelo base para forzar distintos estilos de terminación de frase en japonés (personas "nyo", "ojousama", "neko" y "usagi") sin tocar el prompt.

El modelo subyacente, PLaMo 3 Translate 0.8B, es un LLM especializado en traducción desarrollado por PFN y construido sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el NICT japonés. La familia PLaMo 3 Translate se distribuye en tres tamaños (0,8B, 2B y 8B) y está pensada para traducción de calidad, con especial énfasis en el par japonés-inglés.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de edición de pesos a nivel de fila (weight editing) aplicada sobre pesos cuantizados GGUF; por otro, ilustra un caso de personalización de estilo sin reentrenamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los ficheros aún no se han subido o no están disponibles públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base PLaMo 3 Translate 0.8B); los parches son ediciones de pesos, no una arquitectura propia |
| Parametros totales | 0,8B (modelo base); los parches modifican el 0,38 % de los pesos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base en Q4_0 (token_embd) y Q6_K (output); parches en formato cuantizado Q4_0 y Q6_K |
| Idiomas soportados | no disponible (el modelo base está orientado a traducción, presumiblemente japonés-inglés; no confirmado en la información) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (esquema `diorama.sparse_row_patch.v1`); modelo base en GGUF |

## Arquitectura y entrenamiento

Los parches no constituyen un modelo entrenado de forma convencional. Se trata de ediciones dispersas a nivel de fila sobre los pesos cuantizados del modelo base `plamo-3-translate-0.8b-Q4_0.gguf`. Cada parche modifica una única fila de `token_embd.weight` (864 bytes cuantizados en Q4_0, 48 bloques de 18 bytes) y entre 636 y 637 filas de `output.weight` (1260 bytes en Q6_K, 6 bloques de 210 bytes), además de anular 1003 filas correspondientes a tokens de puntuación fusionados. Las 16 capas del Transformer quedan intactas al 100 %.

El esquema de tensores (`diorama.sparse_row_patch.v1`) define cinco tensores: índices de fila y bytes cuantizados para `token_embd.weight`, índices y bytes para `output.weight`, y una lista de filas a cero para tokens de puntuación fusionados. La técnica consiste, por tanto, en redirigir la distribución de probabilidad de los tokens de terminación de frase en la capa de salida, sin reentrenamiento ni ajuste fino. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Traducción automática: el modelo base está especializado en traducción, con foco en japonés según los ejemplos de la model card.
- Control de estilo de terminación de frase en japonés: cuatro personas distintas (nyo, ojousama, neko, usagi) que alteran los sufijos finales de las oraciones.
- Preservación del contenido semántico: los ejemplos muestran que la traducción subyacente se mantiene y solo cambia la partícula final.
- Edición de pesos sin modificar el prompt: la personalización se aplica en los pesos, no en el texto de entrada.
- Compatibilidad con el ecosistema GGUF/diorama: los parches están diseñados para aplicarse sobre el modelo base cuantizado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no confirmado).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Localización de videojuegos con tono de personaje: aplicar el parche "neko" o "usagi" a las líneas de diálogo de un personaje concreto para que las traducciones al japonés mantengan su muletilla característica, sin reentrenar el modelo ni reescribir los prompts.
- Traducción de novelas ligeras y manga: usar el parche "ojousama" para personajes de registro formal y elegante, manteniendo la coherencia de estilo a lo largo de capítulos extensos.
- Prototipado rápido de variantes de estilo: al ocupar menos de 1 MiB por parche, es viable mantener varias variantes en un pipeline y seleccionar la adecuada según el personaje o el contexto.
- Investigación en edición de pesos: los parches sirven como caso de estudio reproducible de weight editing sobre pesos cuantizados GGUF, útil para estudiar cómo una sola fila de la capa de salida condiciona la distribución de tokens.
- Despliegue en WebGPU: la etiqueta `webgpu` y la librería `diorama` sugieren un uso orientado a inferencia en navegador, donde el bajo peso de los parches facilita la carga dinámica.
- Pruebas A/B de tono en sistemas de traducción: comparar la aceptación de distintas terminaciones (neutra frente a "nyo" o "neko") en encuestas con usuarios japoneses antes de fijar el estilo de un producto.
- Educación y demostraciones: ilustrar de forma tangible cómo pequeños cambios en los pesos de salida alteran el registro lingüístico sin afectar al resto del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en cuantización Q4_0 ocupa aproximadamente 0,5 GB de pesos; con overhead de contexto y KV cache, el consumo típico se sitúa en el rango de 1 a 2 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: al ser un modelo de 0,8B, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores; también en Apple Silicon y en GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF del modelo base; la librería `diorama` para aplicar los parches; WebGPU por la etiqueta del repositorio. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B + parches diorama | 0,8B | no disponible | Traducción JA + estilo | apache-2.0 | Repositorio con 0 descargas; ficheros de 0,0 GB |
| PLaMo 3 Translate 2B | 2B | no disponible | Traducción | no disponible | Familia oficial de PFN |
| PLaMo 3 Translate 8B | 8B | no disponible | Traducción de alta calidad | no disponible | https://huggingface.co/pfnet/plamo-3-translate-8b |

La comparación con alternativas de la misma categoría (edición de pesos sobre modelos de traducción) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los parches son específicos del fichero `plamo-3-translate-0.8b-Q4_0.gguf`; aplicarlos sobre otra cuantización o versión del modelo puede producir resultados incorrectos o corruptos.
- El repositorio muestra un tamaño de 0,0 GB y 0 descargas, lo que indica que los ficheros `.safetensors` podrían no estar efectivamente subidos o accesibles; conviene verificar antes de integrarlos en producción.
- El estilo forzado ("nyo", "neko", "usagi") es inadecuado para contextos formales, documentación técnica o atención al cliente; su uso debe restringirse a ficción, entretenimiento o demos.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento en idiomas distintos del japonés.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de traducción, el riesgo principal es la infidelidad semántica, no la invención de hechos.
- La licencia apache-2.0 se aplica a los parches, pero el modelo base tiene su propia licencia que debe verificarse por separado antes de un uso comercial.
- No se documentan limitaciones de longitud de contexto ni de calidad en dominios especializados (legal, médico, técnico).
- La técnica de edición de pesos no garantiza que el estilo se mantenga en frases largas o con estructuras gramaticales complejas; los ejemplos de la model card son oraciones cortas.

## Enlaces

- Repositorio de los parches: https://huggingface.co/toyoshimax/plamo-3-translate-0.8b-diorama-patches
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Modelo PLaMo 3 Translate 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Nota de versión con los nuevos modelos PLaMo 3 Translate: https://steamdb.info/patchnotes/26466831/
