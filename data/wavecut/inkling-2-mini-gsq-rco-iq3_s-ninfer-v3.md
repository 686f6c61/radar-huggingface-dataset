# WaveCut/Inkling-2-Mini-GSQ-RCO-IQ3_S-NInfer-v3

## Resumen

Inkling 2 Mini GSQ-RCO IQ3_S NInfer v3 es un artefacto de inferencia empaquetado por WaveCut para el motor NInfer, construido a partir de la cuantización GSQ-RCO IQ3_S que ISTA-DASLab publicó del modelo Inkling 2 Mini de Thinking Machines. El modelo subyacente es un transformer con bucles (looped transformer) de arquitectura mixta de expertos (MoE) con 26.400 millones de parámetros totales y 3.400 millones activos por token. El artefacto integra en un único fichero `.ninfer` de 12,0 GiB los pesos cuantizados, la torre de visión en Q8_0, dos drafters de decodificación especulativa (DSpark y DFlash2) y los ficheros de tokenizador y plantilla de chat del modelo original.

La relevancia de este artefacto reside en que permite ejecutar el modelo completo, incluidas visión, tool calling, razonamiento y decodificación especulativa, desde un solo fichero con un motor específico (NInfer-all), sin requerir la reconstrucción manual de los componentes auxiliares. Mantiene los bloques ggml del GGUF original byte a byte y conserva en BF16 la tabla de tokens y las proyecciones relativas, de modo que no se recuantiza ningún tensor del modelo base: el motor multiplica los bloques in situ.

Se trata de un artefacto de nicho, orientado a usuarios del motor NInfer, no de un modelo fundacional nuevo. La cuantización IQ3_S es la mayor de las cuatro variantes GSQ-RCO y la recomendada por ISTA-DASLab, que midió un 99,2 % del rendimiento medio del release original sobre AIME25, GPQA-Diamond y LiveCodeBench v6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE con atención sin rotación y tabla de distancias aprendida; torre de visión ViT |
| Parametros totales | 26,4 mil millones (26.4B) |
| Parametros activos | 3,4 mil millones (3.4B) por token |
| Longitud de contexto | No disponible en la informacion proporcionada (las capas 5, 11, 17 y 23 atienden todas las posiciones; el resto, 1.024) |
| Tipos de cuantizacion | GSQ-RCO IQ3_S (3,50 bits por peso de media); componentes internos en IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_NL, IQ4_XS, Q2_0, Q4_K, Q5_K, Q6_K, Q8_0, Q8_G32, BF16 y FP32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (un fichero de 12.922.322.944 bytes, 12,0 GiB); el GGUF de origen es `Inkling-2-Mini-GSQ-RCO-IQ3_S.gguf` |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformer con bucles: 24 capas almacenadas que se ejecutan como 48 visitas. El preludio (capas 0-5) se ejecuta una vez, el núcleo (capas 6-17) se ejecuta tres veces con los mismos pesos y la coda (capas 18-23) cierra el cómputo; cada visita mantiene sus propias claves, valores e historiales de convolución. La atención usa 24 cabezas de consulta sobre 8 cabezas KV de dimensión 128, sin rotación posicional, con una tabla aprendida de 1.024 distancias y sinks; las capas 5, 11, 17 y 23 atienden todas las posiciones y el resto se limita a 1.024.

La capa MoE contiene 128 expertos enrutados, de los que se activan 8 por token, con puntuaciones sigmoidales más un sesgo de selección y activación SiTU sobre la concatenación [gate; up] de anchura 1152, sin experto compartido. La cabeza de salida está desligada de la tabla de tokens (201.024 filas, 200.058 puntuadas, soft cap de 30). El artefacto incluye además una torre de visión ViT con fila de clase, filas de posición redimensionadas, cabezas con rotación 2D, fusión 2x2 y proyector de dos capas, que admite hasta 4.096 posiciones por imagen.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación destacable del artefacto es la integración de dos drafters de decodificación especulativa: DSpark (tres bloques no causales sobre los estados del modelo objetivo y una cabeza de Markov recurrente de rango 256) y DFlash2 (cinco capas de ventana deslizante de 2.048 posiciones sobre el ancla y 7 máscaras, con un selector condicional sobre los 16 mejores tokens de cada fila).

## Capacidades

- Generación de texto y razonamiento en bloques propios de razonamiento del modelo.
- Generación de código, con soporte medido en LiveCodeBench v6 según ISTA-DASLab.
- Razonamiento matemático, con soporte medido en AIME25.
- Comprensión de imágenes a texto (pipeline `image-text-to-text`) mediante la torre de visión ViT incluida.
- Tool calling: los bloques JSON de llamada a herramienta se devuelven como tool calls en formato OpenAI, con argumentos estrictos.
- Salida estructurada y decisiones tipadas, además de reranking.
- Decodificación especulativa con DSpark (activa por defecto con una petición en curso), con DFlash2 (`--spec dflash2`) o por búsqueda en contexto.
- Servicio concurrente de una a ocho peticiones con reutilización de prefijo de prompt.
- Ejecución de expertos enrutados en GPU, en memoria de host fijada o leídos directamente desde el fichero.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de razonamiento con imágenes: el modelo acepta entradas de imagen y texto y puede resolver preguntas sobre capturas, diagramas o documentos escaneados gracias a la torre ViT con hasta 4.096 posiciones por imagen.
- Automatización de agentes con tool calling: los bloques JSON de llamada se devuelven como tool calls de OpenAI, lo que permite integrarlo en orquestadores de agentes existentes sin adaptadores personalizados.
- Generación de código en pipelines de CI/CD: el soporte de salida estructurada y argumentos estrictos facilita generar parches o revisiones con formato validable automáticamente.
- Servicio de atención al cliente multi-turno: la reutilización de prefijo de prompt y el servicio de hasta ocho peticiones concurrentes permiten mantener conversaciones con contexto compartido sin recalcular el prefijo.
- Despliegue en hardware de gama alta con decodificación especulativa: DSpark activo por defecto con una petición en curso reduce la latencia de generación en entornos de una sola consulta.
- Evaluación de razonamiento matemático y de código: al conservar el 99,2 % del rendimiento del release sobre AIME25, GPQA-Diamond y LiveCodeBench v6, sirve para pruebas de regresión de calidad tras el despliegue.
- Reranking y clasificación tipada: las decisiones tipadas del motor permiten usar el modelo como reranker en sistemas de búsqueda o recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. El único dato aportado es la medición de ISTA-DASLab de que la cuantización GSQ-RCO IQ3_S conserva el 99,2 % del rendimiento medio del release original sobre AIME25, GPQA-Diamond y LiveCodeBench v6.

| Benchmark | Release original | GSQ-RCO IQ3_S |
|---|---|---|
| Media de AIME25, GPQA-Diamond y LiveCodeBench v6 | 100 % (referencia) | 99,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero `.ninfer` ocupa 12,0 GiB; con overhead de contexto, KV cache y drafters, se recomienda al menos 16 GB de VRAM para mantener todos los componentes en GPU.
- El motor permite colocar los expertos enrutados en GPU, en memoria de host fijada o leerlos desde el fichero, lo que reduce el requisito de VRAM a costa de latencia.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una RTX 4090 (24 GB) o superiores (A100, H100) permiten mantener el modelo completo en memoria de vídeo.
- Cabe en GPU de consumo con 24 GB o más si se mantienen los expertos en GPU; con menos VRAM es necesario recurrir a memoria de host fijada.
- Opciones de despliegue: motor NInfer (rama `master` de `iamwavecut/ninfer-all`, artefacto v3); el GGUF de origen es compatible con el ecosistema llama.cpp/ggml.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling 2 Mini GSQ-RCO IQ3_S (este artefacto) | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` (12,0 GiB) |
| Inkling 2 Mini GSQ-RCO IQ2_S | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` (menor que IQ3_S) |
| Inkling 2 Mini UD-Q3_K_XL (Unsloth) | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` |
| Inkling 2 Mini APEX-I MiniPlus V2.1 | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` |

Las alternativas listadas son cuantizaciones del mismo modelo base, no modelos distintos; la información disponible no incluye modelos comparables de otros autores.

## Limitaciones y advertencias

- El artefacto requiere el motor NInfer v3 (rama `master` de `iamwavecut/ninfer-all`); no es un GGUF estándar cargable directamente en llama.cpp sin conversión.
- La cuantización IQ3_S pierde aproximadamente un 0,8 % del rendimiento medio del release original sobre los benchmarks medidos; en tareas sensibles a precisión numérica puede haber degradación adicional.
- Los idiomas soportados no están documentados en la información proporcionada.
- La longitud de contexto no está documentada; las capas intermedias atienden solo 1.024 posiciones, lo que limita el alcance efectivo de la atención en esas capas.
- Riesgo de alucinación: no documentado en la información proporcionada, pero aplicable a cualquier modelo generativo de este tamaño.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso `NOTICE` incluido en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.
- El drafter DFlash2 está cuantizado a Q8_G32 (8 bits, grupos de 32) en este artefacto, a diferencia del resto de componentes que conservan su representación original.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/WaveCut/Inkling-2-Mini-GSQ-RCO-IQ3_S-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de origen (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF
- Variante IQ2_S: https://huggingface.co/WaveCut/Inkling-2-Mini-GSQ-RCO-IQ2_S-NInfer-v3
- Cuantización UD-IQ1_M (Unsloth): https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3
- Cuantización UD-Q2_K_XL (Unsloth): https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3
- Cuantización UD-Q3_K_XL (Unsloth): https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3
- Cuantización UD-IQ4_XS (Unsloth): https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Cuantización UD-Q8_K_XL (Unsloth): https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3
- APEX-I MiniPlus V2.1: https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
- Drafter DFlash2 (incoai): https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all: https://github.com/iamwavecut/ninfer-all
- Paper de referencia: arxiv:2604.18556
