# yunusemrejr/royal-chef

## Resumen

Royal Chef 1.0.0 es un modelo de lenguaje especializado en cocina desarrollado por yunusemrejr (Yunus Emre Vurgun) como motor del asistente culinario My Royal Chef. Se trata de un modelo derivado de Qwen/Qwen3-0.6B mediante poda estructural y destilación, reducido a aproximadamente 146 millones de parámetros y cuantizado a 4 bits con entrenamiento consciente de cuantización (QAT). Su rasgo diferencial es el despliegue: no se sirve desde un servidor, sino que se ejecuta en el dispositivo del usuario, en el navegador como WebAssembly y en la aplicación Android de My Royal Chef, de modo que ninguna conversación se envía a un backend.

El modelo no es un checkpoint de Transformers al uso: se distribuye en un formato propietario denominado Flying Kiwi v2 (`.fkm`), junto con un motor de inferencia en WebAssembly y una biblioteca offline de artículos de Wikipedia sobre cocina. Está entrenado para producir tarjetas de receta y listas de la compra con un formato fijo, citar fuentes de esa biblioteca con la sintaxis `[[Título]]` y emitir una llamada a herramienta por respuesta entre un conjunto cerrado (`find_recipes`, `swap`, `convert`, `scale`, `timer`, `open_tool`).

Es relevante ahora por su enfoque de privacidad y despliegue local en un dominio vertical muy acotado, y como ejemplo de compresión agresiva de un modelo base pequeño con preservación de capacidades específicas mediante destilación desde un profesor mayor. Su utilidad fuera del ecosistema My Royal Chef es limitada, ya que el runtime necesario es propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3-0.6B, podado estructuralmente; 16 capas, anchura 1024, 8 cabezas de consulta y 4 de clave-valor de 128 dimensiones, SwiGLU 1280, embedding atado |
| Parametros totales | ~146 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | 4 bits en grupos de 32 con escala fp16, entrenado con quantisation-aware training; no se publican otros formatos |
| Idiomas soportados | Ingles, espanol, frances |
| Licencia | Apache-2.0 (pesos); bibliotecas `library-*.bin` con texto de Wikipedia bajo CC BY-SA 4.0 y recetas propias |
| Formato de pesos | Flying Kiwi v2 (`.fkm`), dividido en tres ficheros `model-000.bin`, `model-001.bin`, `model-002.bin`; no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only obtenido por poda estructural de Qwen3-0.6B: queda en 16 capas, anchura 1024, 8 cabezas de consulta y 4 de clave-valor de 128 dimensiones, FFN SwiGLU de 1280 y embedding atado. El vocabulario se reduce a 31.959 tokens, correspondientes a la porción inglesa, española y francesa del vocabulario BPE de Qwen3. El resultado son unos 146 millones de parámetros, cuantizados a 4 bits en grupos de 32 con escala fp16 y entrenados con quantisation-aware training.

El entrenamiento sigue tres fases descritas en la model card: poda del modelo base, destilación de recuperación sobre texto de FineWeb-Edu y FineWeb-2, y finalmente destilación desde un profesor asistente Qwen3-1.7B afinado sobre 36.762 conversaciones culinarias (preguntas, tarjetas de receta, listas de la compra, llamadas a herramienta y respuestas con citas) generadas por Qwen3.5-35B-A3B y verificadas por un validador. La entropía cruzada de validación pasó de 2,10 a 0,81 en la etapa final. El modelo incorpora además una cabeza de recuperación en la capa 6 que selecciona entradas de la biblioteca offline para cada pregunta.

## Capacidades

- Generación de tarjetas de receta con formato fijo (`## Título`, raciones, `### Ingredientes`, `### Método`) y listas de la compra en plantillas predefinidas.
- Respuestas con citas a una biblioteca offline de artículos de Wikipedia sobre cocina y recetas y guías propias, mediante la sintaxis `[[Título]]`.
- Recuperación de entradas de biblioteca por pregunta mediante una cabeza de recall en la capa 6 (recall@5 en preguntas reservadas: inglés 0,52, español 0,45, francés 0,51).
- Una llamada a herramienta por respuesta entre seis funciones cerradas: `find_recipes`, `swap`, `convert`, `scale`, `timer`, `open_tool`.
- Multilingüe en inglés, español y francés, con vocabulario restringido a esos tres idiomas.
- No se documentan capacidades de razonamiento general, matemáticas avanzadas, código ni visión.

## Casos de uso

- Asistente culinario embebido en navegador: el modelo se ejecuta como WebAssembly en el dispositivo del visitante, de modo que las consultas sobre recetas, sustituciones o escalados no salen del cliente y no requieren backend ni coste de inferencia por consulta.
- Aplicación móvil offline: integrado en la app Android de My Royal Chef, permite responder consultas y generar tarjetas de receta sin conexión, usando la biblioteca local `library-*.bin` como fuente citada.
- Generación de tarjetas de receta estructuradas: útil para poblar un recetario con formato consistente (título, raciones, ingredientes, método) a partir de una consulta breve, gracias al ajuste sobre plantillas fijas.
- Conversión de unidades y escalado de raciones: las herramientas `convert` y `scale` cubren ajustes de cantidades y sistemas de medida dentro del flujo de respuesta.
- Sustituciones de ingredientes: la herramienta `swap` y la biblioteca offline permiten proponer alternativas citando la fuente consultada.
- Planificación de listas de la compra: el modelo genera listas en formato fijo a partir de un menú o de varias recetas, adecuado para exportar a la app.
- Temporizadores y apertura de herramientas: las funciones `timer` y `open_tool` permiten encadenar la respuesta con acciones en la interfaz del cliente.

## Benchmarks y rendimiento

| Metrica | Ingles | Espanol | Frances |
|---|---:|---:|---:|
| Recall@5 de la cabeza de recuperacion (preguntas reservadas) | 0,52 | 0,45 | 0,51 |
| Entropia cruzada de validacion (etapa final) | 0,81 (global, sin desglose por idioma) | — | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; los pesos ocupan unos 83,3 MB en total (tres ficheros de 32 MiB en 4 bits), por lo que el modelo cabe en memoria de un dispositivo móvil o en el heap de un navegador.
- GPU recomendadas: no se especifican; el despliegue previsto es CPU en navegador (WebAssembly SIMD o relaxed SIMD) y en Android.
- Cabe en GPU de consumo: sí, con enorme holgura, aunque el runtime objetivo no es CUDA.
- Opciones de despliegue: exclusivamente el runtime propietario de My Royal Chef (`engine-simd.wasm`, `engine-relaxed.wasm` y `kiwi-recall.wasm`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.fkm` no es un checkpoint de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---:|---:|---|---|---|
| Royal Chef 1.0.0 | ~146 M (4 bits) | 4096 | en, es, fr | Apache-2.0 | WebAssembly y Android, runtime propio |
| Qwen/Qwen3-0.6B (base) | 0,6 B | 32.768 (según modelo base) | multilingue amplio | Apache-2.0 | Transformers, llama.cpp, vLLM, etc. |
| Qwen3-1.7B (profesor) | 1,7 B | no disponible en la informacion | multilingue amplio | Apache-2.0 | Transformers, llama.cpp, vLLM, etc. |

Royal Chef sacrifica tamaño, cobertura idiomática y contexto frente a su modelo base a cambio de ejecución local en navegador y móvil con un dominio y un formato de salida muy controlados. No se dispone de benchmarks comparativos de calidad culinaria entre estos modelos.

## Limitaciones y advertencias

- Modelo muy pequeño: los formatos, las llamadas a herramienta y las citas son fiables, pero los hechos no presentes en una nota citada (proporciones, tiempos, temperaturas) pueden ser erróneos.
- Riesgo de alucinación en datos factuales de cocina; la propia model card recomienda verificar seguridad alimentaria y alérgenos.
- La app corrige temperaturas inseguras de aves y carne picada en cada respuesta, pero los filtros dietéticos son una heurística sobre nombres de ingredientes y no una garantía frente a alérgenos.
- Contexto limitado a 4096 tokens y vocabulario restringido a inglés, español y francés; no cubre otros idiomas.
- Los pesos son Apache-2.0, pero los ficheros de biblioteca incorporan texto de Wikipedia bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual sobre ese contenido.
- El modelo no es utilizable fuera del runtime de My Royal Chef sin trabajo de conversión: los ficheros `.fkm` y los binarios WebAssembly son específicos del proyecto.
- Sin descargas ni validación externa en el momento de la ficha (0 descargas, 0 likes), por lo que no hay evidencia independiente de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunusemrejr/royal-chef
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Manifiesto de release del sitio: https://myroyalchef.com/assets/models/royal-chef/release.json
- Sitio del producto: https://myroyalchef.com
- Página sobre el proyecto: https://myroyalchef.com/about
- Ficha en Product.forum: https://product.forum/products/my-royal-chef-ai
- Licencia CC BY-SA 4.0 (biblioteca): https://creativecommons.org/licenses/by-sa/4.0/
