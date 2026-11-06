# ZephClick/jeff-qwen3.5-0.8b-gguf

## Resumen

Jeff 0.8B es un modelo de decisión derivado de Qwen3.5-0.8B, desarrollado por Mathias Strasser y empaquetado en formato GGUF por Zeph Click LTD. No es un modelo generativo convencional: en lugar de producir texto libre, lee el estado oculto final del último token del prompt y puntúa las opciones de una pregunta mediante una cabeza de lectura (readout) entrenada. Su función es tomar decisiones rápidas y acotadas dentro del motor "decide" de Zeph, que se ejecuta localmente en un Mac, sin conexión, para clasificar publicaciones y determinar si un agente debe actuar sobre ellas.

El modelo base tiene 1.006.672.704 parámetros (aproximadamente 1,0 mil millones) y una arquitectura `qwen35` de 24 bloques. Este repositorio concreto contiene un único archivo GGUF de 2.025.307.584 bytes en bfloat16, con los pesos conservados bit a bit y la cabeza de lectura escrita como cabeza de salida no atada (untied), de modo que los logits que calcula llama.cpp en los token ids de cada código de respuesta equivalen a los logits de decisión del modelo.

La relevancia de esta ficha reside en su naturaleza atípica: el archivo se describe a sí mismo mediante metadatos `zeph.decide.*` (códigos de respuesta, token ids, temperatura ajustada y disposición del prompt) y está pensado exclusivamente para el motor de decisión de Zeph. Cargado como modelo de lenguaje convencional no genera texto útil, ya que su cabeza de salida solo puntúa códigos de respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35`, 24 bloques (transformer denso, derivado de Qwen3.5-0.8B) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (único archivo publicado: `jeff-0.8b-bf16.gguf`) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un solo archivo, 2.025.307.584 bytes, sha256 `116ed0ff65bd144018471470952af0bdd3f7b35c963e8fca306debb0e6580dcd`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 24 bloques con arquitectura declarada `qwen35`, construido sobre Qwen3.5-0.8B. La innovación técnica clave no está en el cuerpo del transformer sino en la cabeza: Jeff decide leyendo el estado oculto final del último token del prompt y puntuando las opciones de una pregunta con un readout entrenado. En este GGUF, ese readout se materializa como cabeza de salida no atada, donde la fila correspondiente al token id de cada código de respuesta contiene la fila de readout de dicho código y todas las demás filas son cero. Así, los logits calculados por llama.cpp en esos token ids son directamente los logits de decisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El código de entrenamiento de Jeff es MIT y está basado en AutoJev (Denis Yarats). La conversión a GGUF se realizó con el conversor propio de llama.cpp en el commit `e79e4bf660e19f2ad851e06c6913f7a8c5852621`, nombrando el pre-tokenizador `qwen2`, cuya regla de división coincide con la del tokenizador de Jeff. Los pesos se conservan bit a bit en bfloat16.

## Capacidades

- Toma de decisiones por puntuación de opciones: dado un prompt y un conjunto de códigos de respuesta, devuelve logits de decisión sobre dichos códigos.
- Clasificación de contenido: determina qué es una publicación dentro de un espacio (categoría o tipo).
- Decisión de actuación de agentes: evalúa si un agente debe tomar o no una publicación.
- Ejecución local y offline: diseñado para correr en el propio Mac del usuario sin conexión.
- Autodescripción mediante metadatos: el GGUF incluye la configuración de decisión (códigos de respuesta, token ids, temperatura ajustada y disposición del prompt) bajo `zeph.decide.*`.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible` y conversacional.
- No soporta generación de texto libre, tool calling, visión, audio ni razonamiento multi-step en el sentido habitual; su cabeza de salida solo puntúa códigos de respuesta.

## Casos de uso

- Moderación y clasificación de publicaciones en espacios comunitarios: el motor de decisión lee el prompt con la publicación y puntúa los códigos de respuesta para asignarle una categoría, ejecutándose en local y sin enviar contenido a servidores externos.
- Enrutamiento de acciones de agentes: antes de que un agente actúe sobre una publicación, Jeff puntúa si debe tomarla o no, actuando como filtro de bajo coste en el bucle del agente.
- Automatización de flujos en el escritorio del usuario: al correr offline en un Mac, permite decisiones rápidas en herramientas personales sin dependencia de la nube ni latencia de red.
- Triaje de bandeja de entrada o feeds: clasificación de elementos entrantes en categorías predefinidas mediante los códigos de respuesta configurados en los metadatos `zeph.decide.*`.
- Filtrado previo en pipelines de agentes: descarte rápido de elementos irrelevantes antes de invocar modelos generativos mayores, reduciendo coste y latencia.
- Integración en el motor decide de Zeph: uso nativo como componente de decisión dentro de la aplicación Zeph, aprovechando la temperatura ajustada y la disposición de prompt almacenadas en el propio archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo bf16 ocupa 2.025.307.584 bytes (unos 1,9 GiB); en la práctica requiere alrededor de 2 GiB de memoria para los pesos, más el overhead del contexto y del runtime.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4 GB de memoria dedicada debería poder alojarlo.
- Cabe en GPU de consumo: sí, por su tamaño de aproximadamente 1,0 mil millones de parámetros en bf16; también puede ejecutarse en CPU y en Apple Silicon.
- Opciones de despliegue: llama.cpp (formato nativo del archivo); el autor indica que está pensado para el motor decide de Zeph, que lee los metadatos `zeph.decide.*`. No se documentan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| Jeff 0.8B (este) | 1.006.672.704 | no disponible | GGUF bf16 | apache-2.0 | Modelo de decisión por puntuación de códigos |
| Qwen3.5-0.8B (upstream) | ~0,8 mil millones | no disponible | safetensors | apache-2.0 | Modelo de lenguaje generativo |
| Jeff-Qwen3.5-0.8B (base) | ~0,8 mil millones | no disponible | safetensors | apache-2.0 | Modelo de decisión original |

La comparación con alternativas de la misma categoría (modelos de decisión especializados) no está disponible en la información proporcionada. Frente a su upstream Qwen3.5-0.8B, la diferencia esencial es la cabeza de salida: Jeff no genera texto, sino que puntúa opciones.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: cargado como LM convencional no produce texto útil, ya que su cabeza de salida solo puntúa códigos de respuesta.
- Dependencia del motor decide: requiere que el runtime lea los metadatos `zeph.decide.*`; fuera de ese contexto, el archivo carece de utilidad práctica.
- Idioma: solo declarado para inglés (`en`); no hay soporte multilingüe documentado.
- Sesgos: no se documentan sesgos conocidos en la información disponible, pero al ser un clasificador entrenado sobre datos no especificados, puede heredar sesgos de dichos datos.
- Alucinación: al no generar texto, el riesgo se traslada a clasificaciones erróneas o puntuaciones de decisión incorrectas; no se han publicado métricas de precisión.
- Contexto: la longitud de contexto no está disponible, lo que impide evaluar su comportamiento con prompts largos.
- Licencia: los pesos son Apache 2.0 y el código de Jeff es MIT; el repositorio solo cambia la disposición de los pesos y añade metadatos, y está publicado por Zeph Click LTD sin afiliación ni respaldo de los autores de Jeff o Qwen.
- Producción: no hay benchmarks, latencias ni garantías de calidad publicadas; conviene validar el comportamiento en el dominio concreto antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ZephClick/jeff-qwen3.5-0.8b-gguf
- Modelo base Jeff-Qwen3.5-0.8B: https://huggingface.co/jeff-legacy/Jeff-Qwen3.5-0.8B
- Modelo upstream Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de Jeff (MIT): https://github.com/firelex/jeff
