# WaveCut/Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) con arquitectura de transformer con bucles (looped transformer) desarrollado por Thinking Machines. Cuenta con 26.400 millones de parametros totales y 3.400 millones activos por token, lo que le permite ofrecer una capacidad de razonamiento propia de un modelo grande con un coste de inferencia mucho mas contenido. El modelo procesa texto e imagenes (pipeline image-text-to-text) y esta disenado para tareas de razonamiento, generacion de codigo, tool calling y decodificacion especulativa.

La ficha que nos ocupa no es el modelo original, sino un artefacto de cuantizacion creado por WaveCut para el motor de inferencia NInfer en su version v3. Concretamente, empaqueta la cuantizacion UD-Q8_K_XL de Unsloth (la mas grande de su catalogo y referencia de sus mediciones de divergencia KL) junto con la torre de vision en Q8_0 y el drafter DSpark, todo en un unico fichero `.ninfer` de 22,06 GiB. El resultado es un artefacto listo para ejecutar el modelo completo —texto, vision y decodificacion especulativa— sobre GPU NVIDIA con el motor NInfer-all.

La relevancia de este artefacto radica en que preserva byte a byte los bloques ggml y las palabras BF16 del GGUF original, sin recuantizar, y en que expone todas las capacidades del modelo (razonamiento, tool calling en formato OpenAI, salida estructurada, vision, decodificacion especulativa) a traves de un unico fichero. No obstante, requiere una compilacion especifica de NInfer (release `2026-11-21.4` o posterior), ya que las builds estandar rechazan este fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) con mezcla de expertos (MoE); 24 capas almacenadas ejecutadas como 48 visitas |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones (3,4B) por token |
| Longitud de contexto | No disponible (ventana de atencion de 1.024 posiciones en la mayoria de capas; las capas 5, 11, 17 y 23 atienden a todas las posiciones) |
| Tipos de cuantizacion | UD-Q8_K_XL: BF16 en todas las matrices excepto los expertos enrutados de las capas 0-19 en NVFP4; torre de vision en Q8_0; drafter DSpark en Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto propietario del motor NInfer); derivado de GGUF |
| Tamano del fichero | 23.685.230.592 bytes (22,06 GiB) |
| Tensores | 1.165 objetos: 857 FP32, 155 Q8_0, 108 BF16 y 40 NVFP4 |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Libreria | ninfer |

## Arquitectura y entrenamiento

Inkling 2 Mini emplea una arquitectura de transformer con bucles: 24 capas almacenadas que se ejecutan como 48 visitas. El preludio (capas 0-5) se ejecuta una vez, el nucleo (capas 6-17) se repite tres veces con los mismos pesos y la coda (capas 18-23) cierra el calculo, y cada visita mantiene sus propias claves, valores e historiales de convolucion. La atencion usa 24 cabezas de consulta sobre 8 cabezas KV de dimension 128, sin rotacion posicional, con una tabla aprendida de 1.024 distancias y mecanismo de sinks; las capas 5, 11, 17 y 23 atienden a todas las posiciones y el resto a una ventana de 1.024.

La capa MoE incorpora 128 expertos enrutados con 8 activos por token, puntuaciones sigmoidales con sesgo de seleccion y activacion SiTU sobre [gate; up] de anchura 1.152, sin experto compartido. La tabla de tokens y la cabeza no atada (201.024 filas, 200.058 puntuadas, soft cap 30) estan en BF16. El router, las convoluciones, las tablas de distancia, las queries de mezcla de profundidad, los controladores de bucle, las normas, las escalas de expertos y las proyecciones de sink y tap dinamico se mantienen en FP32. La torre de vision es un ViT con fila de clase, filas de posicion redimensionadas, cabezas con rotacion 2D, fusion 2x2 y proyector de dos capas, con hasta 4.096 posiciones por imagen. El drafter DSpark consta de tres bloques no causales sobre los estados capturados del modelo objetivo y una cabeza de Markov recurrente de rango 256. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con el razonamiento del modelo devuelto en bloques propios.
- Generacion de codigo y matematicas, con soporte de salida estructurada y argumentos de herramientas estrictos.
- Tool calling y function calling: los bloques JSON de llamada a herramientas se devuelven como tool calls en formato OpenAI.
- Capacidades de agente y razonamiento multi-paso, con decisiones tipadas y reranking.
- Vision: procesamiento de imagenes a traves de la torre de vision incluida en el artefacto.
- Decodificacion especulativa con el drafter DSpark (activa por defecto con una sola peticion) o mediante busqueda por contexto.
- Servicio concurrente de una a ocho peticiones con reutilizacion de prefijo de prompt.
- Protocolos OpenAI y Anthropic expuestos por el servidor en el puerto 8080.
- Capacidades multilingues: no disponible.

## Casos de uso

- Razonamiento asistido en produccion: el modelo puede gestionar cadenas de razonamiento multi-paso con 3,4B parametros activos por token, lo que reduce el coste por consulta frente a modelos densos de tamano equivalente y permite desplegarlo en una sola GPU.
- Automatizacion de agentes con tool calling: al devolver las llamadas a herramientas como tool calls en formato OpenAI, se integra directamente en frameworks de agentes existentes sin capa de traduccion, y su salida estructurada con argumentos estrictos reduce errores de parseo.
- Analisis de documentos con imagenes: la torre de vision incluida permite procesar capturas, diagramas o formularios junto a texto en un mismo pipeline image-text-to-text, con hasta 4.096 posiciones por imagen.
- Generacion de codigo en pipelines de CI/CD: el soporte de salida estructurada y tool calling permite invocar el modelo como paso de revision o generacion de parches dentro de flujos automatizados, con concurrencia de hasta ocho peticiones y reutilizacion de prefijo para contextos de repositorio repetidos.
- Servicio de atencion al cliente multi-turno: la reutilizacion de prefijo de prompt y la concurrencia de hasta ocho peticiones permiten mantener conversaciones con contexto compartido sin recalcular el prefijo en cada turno.
- Despliegue en hardware de gama profesional: con 22,06 GiB de fichero y expertos enrutados que pueden residir en GPU, en memoria de host fijada o leerse del propio fichero, el modelo cabe en GPUs profesionales de 24 GB o superiores, lo que facilita entornos de desarrollo y pruebas sin clústeres dedicados.
- Aceleracion de inferencia interactiva: la decodificacion especulativa con DSpark reduce la latencia en escenarios de una sola peticion, adecuada para asistentes en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero completo ocupa 22,06 GiB; con overhead de contexto y buffers de ejecucion, se recomienda un minimo de 24 GB de VRAM para mantener todos los componentes en GPU.
- GPUs recomendadas: NVIDIA desde Volta hasta Blackwell. Para el contenedor Docker, se ofrece `cuda13.4` y `cuda12.9` (esta ultima para Tesla V100).
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas (por ejemplo, RTX 3090 o RTX 4090), siempre que se acepte el margen ajustado de memoria; el artefacto se convirtio en un host con RTX A6000.
- Opciones de despliegue: exclusivamente el motor NInfer-all (release `2026-11-21.4` o posterior), disponible como build de release o imagen Docker. Las builds estandar de NInfer rechazan este fichero. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El artefacto soporta de una a ocho peticiones concurrentes con reutilizacion de prefijo de prompt y decodificacion especulativa con DSpark por defecto con una sola peticion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Inkling 2 Mini (este artefacto, UD-Q8_K_XL) | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` / NInfer-all |
| Inkling 2 Mini (UD-IQ1_M) | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` / NInfer-all |
| Inkling 2 Mini (UD-Q2_K_XL) | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` / NInfer-all |
| Inkling 2 Mini (UD-Q3_K_XL) | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` / NInfer-all |
| Inkling 2 Mini (UD-IQ4_XS) | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` / NInfer-all |
| Inkling 2 Mini (APEX-I MiniPlus V2.1) | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` / NInfer-all |

No se dispone de datos de rendimiento ni de modelos comparables de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del motor: el fichero solo funciona con NInfer-all en release `2026-11-21.4` o posterior. Las builds estandar de NInfer lo rechazan porque la familia Inkling 2 existe unicamente en esa linea y sus matrices BF16, cabezas y bancos de expertos requieren esa version.
- Sin soporte en ecosistemas estandar: no puede ejecutarse con llama.cpp, Ollama, vLLM ni TGI, lo que limita la portabilidad y las opciones de despliegue.
- Requisitos de GPU: necesita GPU NVIDIA (Volta a Blackwell) en Linux o Windows; no hay soporte documentado para CPU ni para aceleradores de otros fabricantes.
- Ventana de atencion limitada en la mayoria de capas: 1.024 posiciones, lo que puede restringir tareas de contexto largo pese a que las capas 5, 11, 17 y 23 atienden globalmente.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingue sin evaluacion previa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni benchmarks en la informacion disponible, por lo que conviene validar las salidas en produccion.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero el artefacto incorpora componentes derivados de terceros (Unsloth, ggml-org, Thinking Machines) cuyo aviso `NOTICE` debe conservarse y revisarse.
- Artefacto con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor NInfer: https://github.com/Neroued/ninfer
- NInfer-all (releases): https://github.com/iamwavecut/ninfer-all
- Releases de NInfer-all: https://github.com/iamwavecut/ninfer-all/releases/latest
- Artefacto UD-IQ1_M: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3
- Artefacto UD-Q2_K_XL: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3
- Artefacto UD-Q3_K_XL: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3
- Artefacto UD-IQ4_XS: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Artefacto APEX-I MiniPlus V2.1: https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
