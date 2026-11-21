# WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3

## Resumen

Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3 es un artefacto de inferencia en formato propietario `.ninfer` (versión 3) generado por WaveCut a partir del modelo Thinking Machines Inkling 2 Mini, un transformer con bucles (looped transformer) de tipo mezcla de expertos (MoE) con 26.400 millones de parámetros totales y 3.400 millones activos por token. El artefacto empaqueta la cuantización UD-Q3_K_XL de Unsloth junto con la torre de visión en Q8_0 y el drafter especulativo DSpark, todo ello sin recuantizar: cada matriz conserva los bloques ggml del GGUF original byte a byte y el motor los multiplica en su sitio.

El modelo base resuelve tareas multimodales de imagen y texto con razonamiento explícito, tool calling y decodificación especulativa. Su relevancia radica en que comprime un MoE de 26,4B en un archivo de 13,40 GiB (14.392.937.728 bytes), lo que permite ejecutarlo en GPUs de consumo con prestaciones cercanas a la referencia de 8 bits: la divergencia KL media frente a UD-Q8_K_XL es de 0,0174 y coincide en el token superior en el 96,3 % de las posiciones.

El artefacto solo es utilizable con el motor NInfer, en concreto la rama `master` del repositorio `iamwavecut/ninfer-all`, desde la release `2026-11-21.3`. Las compilaciones estándar de NInfer rechazan el archivo porque la familia Inkling 2 solo existe en esa línea y su torre de visión Q8_0 requiere esa versión mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE con atención de 24 cabezas de consulta sobre 8 cabezas KV de 128, tabla aprendida de 1.024 distancias, sinks y torre de visión ViT |
| Parametros totales | 26,4 B |
| Parametros activos | 3,4 B por token |
| Longitud de contexto | No disponible (la atención de las capas 5, 11, 17 y 23 opera sobre todas las posiciones; el resto sobre 1.024) |
| Tipos de cuantizacion | UD-Q3_K_XL (expertos enrutados mayoritariamente NVFP4 e i-quants); atención en Q8_0, Q6_K, Q5_K y Q4_K por capa; torre de visión Q8_0; drafter Q8_0; componentes auxiliares en FP32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v3 (1 archivo de 13,40 GiB, SHA-256 `9e42dbcd209cd9567dcd11af497b7f8cf26606a5086b04cc14b00e72421c11ee`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: 24 capas almacenadas se ejecutan como 48 visitas, con un preludio (capas 0-5), un núcleo (capas 6-17) repetido tres veces con los mismos pesos y una coda (capas 18-23). Cada visita mantiene sus propias claves, valores e historiales de convolución. La atención usa 24 cabezas de consulta sobre 8 cabezas KV de 128 dimensiones, sin rotación posicional, con una tabla aprendida de 1.024 distancias y mecanismo de sinks; las capas 5, 11, 17 y 23 atienden sobre todas las posiciones y el resto sobre 1.024.

La capa MoE contiene 128 expertos enrutados con 8 activos por token, puntuaciones sigmoideas más un sesgo de selección y activación SiTU sobre `[gate; up]` de anchura 1152, sin experto compartido. La cabeza de salida está desligada de la tabla de tokens (201.024 filas, 200.058 puntuadas, soft cap 30). El artefacto incluye además una torre de visión ViT con fila de clase, filas de posición redimensionadas, cabezas con rotación 2D, fusión 2x2 y proyector de dos capas, con hasta 4.096 posiciones por imagen, y un drafter DSpark de tres bloques no causales sobre los estados muestreados del modelo objetivo con una cabeza de Markov recurrente de rango 256. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre las etapas de RLHF o DPO en la información proporcionada.

La innovación técnica del artefacto es la preservación byte a byte de los bloques ggml del GGUF de Unsloth, de modo que el motor NInfer multiplica los bloques en su sitio sin recuantizar. La conversión, según la model card, tardó 30 segundos en un contenedor sobre un host con RTX 3090 alquilada.

## Capacidades

- Generación de texto y razonamiento con bloques de pensamiento propios del modelo.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante la torre de visión ViT incluida.
- Tool calling: los bloques JSON de llamada a herramienta se devuelven como tool calls en formato OpenAI, con argumentos estrictos.
- Salida estructurada y decisiones tipadas, además de reranking.
- Decodificación especulativa con el drafter DSpark (activa por defecto con una sola petición en curso) o por búsqueda en contexto.
- Soporte de una a ocho peticiones concurrentes con reutilización de prefijo de prompt.
- Colocación de los expertos enrutados en GPU, en memoria de host fijada o leídos directamente desde el archivo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede recibir capturas de pantalla o fotos de producto junto al texto de la consulta y responder con razonamiento explícito, aprovechando la torre de visión con hasta 4.096 posiciones por imagen.
- Automatización de agentes con herramientas: la conversión de bloques JSON en tool calls de formato OpenAI permite integrarlo en orquestadores de agentes sin capa de traducción adicional, con argumentos estrictos validados.
- Extracción estructurada de documentos: la salida estructurada y las decisiones tipadas lo hacen adecuado para pipelines que necesitan JSON validado a partir de texto e imágenes escaneadas.
- Reranking en sistemas de búsqueda: la capacidad de reranking integrada permite reordenar candidatos recuperados en un RAG, con la ventaja de compartir el mismo archivo y motor que el generador.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar 13,40 GiB y admitir expertos en memoria de host fijada, cabe en GPUs de 16-24 GB y permite prototipado local de flujos multimodales sin clúster.
- Servicio de inferencia de baja concurrencia: con soporte de una a ocho peticiones concurrentes y reutilización de prefijo, es viable para backends internos donde el coste por token importa más que el throughput máximo.
- Investigación sobre decodificación especulativa: al incluir el drafter DSpark y permitir también la variante por búsqueda en contexto, sirve para comparar estrategias de aceleración sobre el mismo modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de fidelidad de la cuantización: divergencia KL media de 0,0174 frente a UD-Q8_K_XL y coincidencia en el token superior en el 96,3 % de las posiciones, frente a 0,0269 de KLD para UD-IQ3_XXS con 1,97 GB menos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo ocupa 13,40 GiB; con los expertos enrutados en GPU se necesita margen adicional para cachés KV e historiales de convolución de las 48 visitas. Con expertos en memoria de host fijada o leídos desde disco, la VRAM requerida baja del tamaño total del archivo.
- GPUs recomendadas: NVIDIA desde Volta hasta Blackwell, según la model card. El motor ofrece imagen Docker con CUDA 13.4 y una variante CUDA 12.9 para Tesla V100.
- GPU de consumo: por tamaño de archivo, encaja en tarjetas de 16 GB o más (por ejemplo, RTX 4080/4090 de 16-24 GB) siempre que se coloquen parte de los expertos fuera de la VRAM; no se especifican cifras exactas de VRAM por configuración.
- Opciones de despliegue: exclusivamente NInfer, rama `master` de `iamwavecut/ninfer-all`, release `2026-11-21.3` o posterior, en Linux o Windows. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es propietario y las compilaciones estándar de NInfer rechazan el archivo.
- Latencia y throughput: no disponibles. La decodificación especulativa con DSpark está activa por defecto con una sola petición en curso, lo que según la model card acelera la generación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion del artefacto | Licencia | Motor |
|---|---|---|---|---|---|
| Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3 | 26,4 B totales / 3,4 B activos | No disponible | UD-Q3_K_XL (13,40 GiB) | Apache 2.0 | NInfer v3 |
| Inkling-2-Mini-UD-IQ3_XXS-NInfer-v3 | 26,4 B totales / 3,4 B activos | No disponible | UD-IQ3_XXS (1,97 GB menos, KLD 0,0269) | Apache 2.0 | NInfer v3 |
| Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3 | 26,4 B totales / 3,4 B activos | No disponible | UD-Q2_K_XL | Apache 2.0 | NInfer v3 |
| Inkling-2-Mini-UD-IQ4_XS-NInfer-v3 | 26,4 B totales / 3,4 B activos | No disponible | UD-IQ4_XS | Apache 2.0 | NInfer v3 |

Las alternativas de otros autores no están disponibles en la información proporcionada. Dentro de la propia familia, UD-Q3_K_XL es la cuantización de 3 bits más grande y la más fiel a la referencia entre las de su rango, a cambio de 1,97 GB más que UD-IQ3_XXS.

## Limitaciones y advertencias

- Dependencia total del motor NInfer: el archivo no funciona en vLLM, llama.cpp, Ollama ni TGI, y las compilaciones estándar de NInfer lo rechazan. La release mínima es `2026-11-21.3`.
- La cuantización introduce degradación: KLD media de 0,0174 frente a UD-Q8_K_XL y un 3,7 % de posiciones donde el token superior difiere de la referencia de 8 bits.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación en la información disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe sin datos del modelo base.
- Longitud de contexto: no disponible como cifra única; la atención híbrida (global en cuatro capas, 1.024 posiciones en el resto) condiciona el comportamiento en contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero el artefacto incorpora pesos derivados de Unsloth y de ggml-org; conviene revisar el NOTICE incluido en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.
- La fecha de creación del repositorio (2026-11-21) y la referencia a la release del motor deben verificarse antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Artefacto UD-IQ1_M: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3
- Artefacto UD-Q2_K_XL: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3
- Artefacto UD-IQ4_XS: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Artefacto APEX-I MiniPlus V2.1: https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
- Motor NInfer: https://github.com/Neroued/ninfer
- Rama NInfer-all: https://github.com/iamwavecut/ninfer-all
- Releases del motor: https://github.com/iamwavecut/ninfer-all/releases/latest
