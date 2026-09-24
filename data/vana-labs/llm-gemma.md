# Vana-Labs/llm-gemma

## Resumen

llm-gemma es un repositorio de pesos en formato GGUF publicado por Vana Labs que actúa como espejo fijado (pinned mirror) de dos modelos de la familia Gemma 3 de Google DeepMind: `google/gemma-3-1b-it` y `google/gemma-3-4b-it`. No se trata de un modelo entrenado o ajustado por Vana Labs, sino de copias sin modificar de cuantizaciones ya existentes generadas por bartowski, empaquetadas para que las descargas de Tetro, la aplicación local de transcripción de reuniones de Vana Labs, no dependan de repositorios de terceros. El repositorio incluye `gemma-3-1b-it-Q8_0.gguf` (identificado internamente como `gemma3:1b`) y `gemma-3-4b-it-Q4_K_M.gguf` (identificado como `gemma3:4b`).

El propósito declarado de estos pesos dentro de Tetro es la generación de resúmenes a partir de transcripciones de reuniones, ejecutándose íntegramente en el equipo del usuario. Esto encaja con el perfil de Gemma 3: modelos densos de tipo transformer decoder-only, de tamano reducido (aproximadamente 1.000 millones de parámetros en la variante 1B), con capacidad conversacional (`-it` indica ajuste por instrucciones) y pensados para despliegue en hardware de consumo.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de distribución de pesos mediante GGUF para una aplicación de escritorio. Por otro, sirve para advertir de que el repositorio no aporta artefactos propios: cualquier evaluación de capacidades, sesgos o rendimiento debe remitirse a los modelos originales de Google y a las cuantizaciones de bartowski, no a este espejo. El repositorio apenas tiene tracción pública (0 descargas y 0 likes en el momento de la consulta) y su licencia es la Gemma Terms of Use, no una licencia permisiva genérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Gemma 3, base de los ficheros cuantizados) |
| Parametros totales | 999.885.952 (dato de safetensors, correspondiente a la variante 1B); la variante 4B no reporta recuento en la informacion disponible |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (1B) y Q4_K_M (4B); se menciona el uso de imatrix entre las etiquetas |
| Idiomas soportados | No disponible en la ficha del repositorio (los modelos Gemma 3 originales son multilingues, pero el repositorio no declara lista de idiomas) |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | GGUF (compatible con llama.cpp) |

Notas: el dato de 999.885.952 parametros se refiere a safetensors de la variante 1B; el repositorio contiene además el fichero de la variante 4B. El tamano total del repositorio es de 3,6 GB. Fecha de creacion registrada: 2026-09-23; ultima actualizacion: 2026-09-23.

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio ni ajuste adicional. Se limita a alojar dos ficheros GGUF que son copias literales de cuantizaciones de terceros, segun se indica en la propia model card: `gemma-3-1b-it-Q8_0.gguf` procede de `bartowski/google_gemma-3-1b-it-GGUF` (commit `116f76234503685a98f572982177b11d44ec8ff1`) y `gemma-3-4b-it-Q4_K_M.gguf` procede de `bartowski/google_gemma-3-4b-it-GGUF` (commit `71506238f970075ca85125cd749c28b1b0eee84e`). Por tanto, la arquitectura subyacente es la de Gemma 3 en sus variantes 1B y 4B ya ajustadas por instrucciones, y el proceso de cuantizacion es el estandar de llama.cpp con las recetas de bartowski.

Como consecuencia, no hay innovaciones tecnicas atribuibles a este repositorio: la decodificacion, el tokenizador, la ventana de contexto y el pipeline de ajuste por instrucciones corresponden a los modelos originales de Google DeepMind. La aportacion de Vana Labs es exclusivamente de infraestructura: fijar versiones concretas mediante commits para garantizar reproducibilidad en las descargas de Tetro y evitar dependencias de hosts de terceros. Cualquier detalle sobre numero de tokens de entrenamiento, composicion del dataset o uso de RLHF/DPO debe consultarse en la documentacion oficial de Gemma 3, no en esta ficha.

## Capacidades

Las capacidades efectivas son las de los modelos Gemma 3 1B-it y 4B-it en sus versiones cuantizadas:

- Generacion de texto conversacional: ambos ficheros conservan el ajuste por instrucciones (`-it`), por lo que estan preparados para dialogos de tipo pregunta-respuesta.
- Resumen de texto: es el uso para el que Vana Labs los empaqueta dentro de Tetro (`Gemma 3 summary models for Tetro`), orientado a condensar transcripciones de reuniones.
- Razonamiento basico y tareas de lenguaje general: limitado por el tamano de 1B y 4B parametros.
- Soporte de tool calling / function calling: no confirmado en la informacion del repositorio; depende de la plantilla de chat y del runtime (llama.cpp) empleado.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no declaradas en el repositorio; los modelos Gemma 3 originales son multilingues, pero no se especifica la cobertura efectiva tras la cuantizacion.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en esta ficha; los ficheros listados son de generacion de texto.

## Casos de uso

- Resumen de reuniones en local: Tetro usa `gemma3:1b` y `gemma3:4b` para condensar transcripciones sin enviar audio ni texto a servidores externos; el modelo se ejecuta en el propio equipo mediante llama.cpp.
- Notas automaticas de actas: a partir de una transcripcion larga, el modelo puede producir un resumen estructurado con acuerdos y tareas pendientes, aprovechando el ajuste por instrucciones.
- Asistente de escritorio sin conexion: al distribuirse como GGUF, puede integrarse en aplicaciones de escritorio que funcionen en entornos sin red o con requisitos de privacidad estrictos.
- Prototipado rapido de pipelines de texto: la variante 1B en Q8_0 es adecuada para pruebas de integracion con llama.cpp antes de escalar a modelos mayores.
- Clasificacion y extraccion de informacion: tareas de etiquetado de fragmentos de transcripcion (por ejemplo, deteccion de temas o acciones) que no requieren un modelo grande.
- Despliegue en hardware modesto: la variante 4B en Q4_K_M permite ejecutar un modelo conversacional en portatiles con GPU de gama media o incluso en CPU, algo inviable con modelos de mayor tamano.
- Reproducibilidad de entornos: al estar fijados por commit, estos pesos sirven para entornos de CI o instalaciones controladas donde se requiere que la version del modelo no cambie entre despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye mediciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y los resultados de busqueda consultados no aportan cifras para estas variantes cuantizadas concretas.

## Requisitos de hardware

Las siguientes estimaciones son orientativas y se derivan del tamano de los ficheros y del formato de cuantizacion, no de mediciones publicadas en el repositorio:

- VRAM para la variante 1B en Q8_0: aproximadamente 1,1-1,3 GB de pesos, mas la cache KV correspondiente al contexto configurado.
- VRAM para la variante 4B en Q4_K_M: aproximadamente 2,5-3 GB de pesos, mas la cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para la variante 4B cuantizada; la variante 1B funciona en GPU integradas y en CPU.
- GPU de consumo: si, cabe con holgura en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o equivalentes; la variante 1B puede ejecutarse solo con CPU.
- Opciones de despliegue: llama.cpp como runtime principal (formato GGUF), y cualquier herramienta que lo envuelva, como Ollama. No se mencionan vLLM ni TGI en la informacion disponible, dado que estos suelen requerir safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vana-Labs/llm-gemma (Gemma 3 1B/4B cuantizado) | 1B (999.885.952) y 4B | No disponible | GGUF | Gemma Terms of Use | HuggingFace (espejo fijado) |
| google/gemma-3-1b-it (original) | 1B | No disponible en la informacion proporcionada | safetensors | Gemma Terms of Use | HuggingFace |
| bartowski/google_gemma-3-1b-it-GGUF | 1B | No disponible en la informacion proporcionada | GGUF | Gemma Terms of Use | HuggingFace (fuente de este espejo) |
| Llama 3.2 1B / 3B (alternativa de tamano similar) | 1B / 3B | No disponible en la informacion proporcionada | safetensors, GGUF | Licencia comunitaria de Meta | HuggingFace |

La comparativa se limita a tamanos y formatos porque la informacion proporcionada no incluye cifras de rendimiento para ninguna de las alternativas. La diferencia funcional clave de este repositorio frente a los anteriores es que se trata de un espejo de version fijada, sin cambios en los pesos.

## Limitaciones y advertencias

- No es un modelo propio: es un espejo de cuantizaciones de terceros; cualquier problema de calidad debe reportarse al modelo original o al autor de la cuantizacion.
- Sesgos conocidos: no documentados en la informacion disponible; deben asumirse los sesgos de los modelos Gemma 3 originales.
- Riesgo de alucinacion: presente, como en cualquier modelo de lenguaje; es especialmente relevante en tareas de resumen, donde puede inventar acuerdos o detalles no presentes en la transcripcion.
- Limitaciones de contexto e idioma: no declaradas en el repositorio; la cobertura multilingue efectiva no esta confirmada.
- Restricciones de licencia: los pesos se rigen por la Gemma Terms of Use y la Gemma Prohibited Use Policy; el uso comercial esta sujeto a dichos terminos, no a una licencia permisiva.
- Caveat de produccion: el repositorio registra 0 descargas y 0 likes, y no incluye benchmarks ni guias de integracion propias; conviene validar el comportamiento en el caso de uso concreto antes de desplegarlo.
- Las fechas de creacion y actualizacion registradas (2026-09-23) son las que constan en los metadatos del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Vana-Labs/llm-gemma
- Modelo base 1B: https://huggingface.co/google/gemma-3-1b-it
- Modelo base 4B: https://huggingface.co/google/gemma-3-4b-it
- Cuantizacion de origen 1B: https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF
- Cuantizacion de origen 4B: https://huggingface.co/bartowski/google_gemma-3-4b-it-GGUF
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Pagina oficial de Gemma (Google DeepMind): https://deepmind.google/models/gemma/
- Repositorio de la libreria Gemma (JAX): https://github.com/google-deepmind/gemma
- Guia general de modelos Gemma: https://www.inferless.com/learn/the-ultimate-guide-to-gemma-models
