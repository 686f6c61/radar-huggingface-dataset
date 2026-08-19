# weikaih/molmo2-codec-v6-rgbhex-k4

## Resumen

El modelo `weikaih/molmo2-codec-v6-rgbhex-k4` es un codec de video basado en el modelo vision-language Molmo2 de Ai2, combinado con el esquema de compresión AdaCodec en su variante RGB-HEX K4. Desarrollado por weikaih, este sistema comprime secuencias de video en una representación compacta de tokens visuales que pueden ser consumidos directamente por un modelo de lenguaje multimodal, reduciendo drásticamente el coste computacional frente a procesar todos los frames completos. El repositorio contiene los pesos emparejados de dos etapas: un P-tokenizer (Stage-1) y el modelo Molmo2 completo (Stage-2), junto con la configuración de entrenamiento y los umbrales calibrados de GOP.

La relevancia actual de este modelo radica en su capacidad para habilitar comprensión de video de larga duración con un presupuesto de tokens fijo (8.192 tokens visuales), manteniendo un rendimiento cercano al procesamiento denso en benchmarks como MLVU, MVBench o NExT-QA. El tamaño del repositorio es de 21,8 GB, con pesos en formato PyTorch (.pt) y licencia Apache 2.0, lo que permite uso comercial y modificación. No se especifican los parámetros totales del modelo ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec de video basado en Molmo2 con P-tokenizer (Stage-1) y modelo Molmo2 (Stage-2), esquema AdaCodec RGB-HEX K4 |
| Parametros totales | no disponible |
| Longitud de contexto | 16.384 tokens de secuencia modelo (presupuesto visual de 8.192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoints .pt) |

## Arquitectura y entrenamiento

El modelo se compone de dos etapas emparejadas. La Stage-1 contiene un P-tokenizer, un P-ViT (vision transformer) y un P-connector, entrenados hasta el paso 89.000. La Stage-2 es un modelo Molmo2 completo, consolidado en el paso 1.000, que recibe los tokens generados por el codec. El codec opera sobre secuencias de video a 2 FPS, con un máximo de 2.048 frames decodificados, redimensionados a 378x378 píxeles. La compresión se realiza mediante bloques RGB de 14x14 con búsqueda de bloques basada en SAD (suma de diferencias absolutas) más una penalización de movimiento, seguida de una búsqueda HEXBS y refinamiento local exhaustivo 3x3. El GOP adaptativo tiene un P-frame objetivo y máximo de 4, generando 81 tokens visuales por I-frame y 16 por P-frame. Cada P-frame codifica residuos RGB firmados y vectores de movimiento (dx, dy).

No se proporcionan detalles sobre el dataset de entrenamiento, el número total de tokens procesados ni el uso de técnicas como RLHF o DPO. La configuración de entrenamiento se incluye en el archivo `config/stage2_step1000.yaml`, y los umbrales calibrados de GOP están en `config/gamma_v6_rgbhex_k4.json`. Los pesos de Stage-1 y Stage-2 son un par indivisible; no deben combinarse con checkpoints antiguos de 20K o 17K del P-tokenizer.

## Capacidades

- Compresión de video en tokens visuales compactos: convierte secuencias de video en una representación tokenizada con presupuesto fijo (8.192 tokens visuales), reduciendo la carga computacional frente al procesamiento denso de frames.
- Comprensión de video de larga duración: soporta hasta 2.048 frames de entrada a 2 FPS, lo que permite analizar vídeos de más de 17 minutos a esa cadencia.
- Integración con Molmo2: los tokens generados por el codec se alimentan directamente al modelo Molmo2 de Stage-2, que realiza tareas de razonamiento visual y respuesta a preguntas sobre video.
- Codificación de movimiento y residuos: cada P-frame incluye residuos RGB firmados y vectores de movimiento (dx, dy), lo que permite reconstruir aproximaciones del contenido visual.
- Evaluación emparejada: el repositorio incluye un resumen de evaluación con 200 ejemplos por benchmark, comparando el rendimiento del codec frente al procesamiento denso.
- Configuración reproducible: se publican los archivos de configuración, umbrales calibrados y sumas SHA256 para verificar la integridad de los artefactos.

## Casos de uso

- Análisis de video de vigilancia de larga duración: el codec permite procesar grabaciones extensas (hasta 2.048 frames a 2 FPS) con un presupuesto de tokens fijo, facilitando la detección de eventos relevantes sin necesidad de muestrear manualmente.
- Búsqueda semántica en archivos de video: al convertir vídeos en tokens compactos, se puede indexar y recuperar contenido basándose en consultas de lenguaje natural, reduciendo el coste de almacenamiento y cómputo frente a representaciones densas.
- Generación de subtítulos y descripciones automáticas: el modelo puede generar narraciones o resúmenes de vídeos largos, útil para plataformas de contenido o accesibilidad, manteniendo un rendimiento cercano al denso en benchmarks como MLVU (78.0 frente a 78.0).
- Asistentes de video interactivos: integrado en un pipeline de preguntas y respuestas, permite a los usuarios formular consultas sobre el contenido de un vídeo (p. ej., "¿qué ocurrió en el minuto 5?") con una ventana de contexto de 16.384 tokens.
- Evaluación de modelos de video: el repositorio incluye un protocolo de evaluación emparejada (Dense vs. Codec) que puede servir como referencia para medir la pérdida de calidad al comprimir, útil para investigadores que desarrollan nuevos codecs.
- Prototipado de sistemas de video-language en entornos con recursos limitados: al reducir el número de tokens visuales, se puede ejecutar inferencia en GPUs con menos memoria, aunque no se especifican requisitos exactos de VRAM.

## Benchmarks y rendimiento

La model card incluye una evaluación emparejada con 200 ejemplos por benchmark, utilizando un presupuesto de 8.192 tokens visuales y una secuencia modelo de 16.384 tokens. Los resultados comparan el procesamiento denso (todos los frames) frente al codec K4:

| Benchmark | Dense | Codec K4 |
|---|---:|---:|
| MLVU | 78.0 | 78.0 |
| MVBench | 76.0 | 74.5 |
| TempCompass | 69.5 | 64.5 |
| PerceptionTest | 82.5 | 80.0 |
| NExT-QA | 83.0 | 82.0 |

La mayor degradación se observa en TempCompass (5 puntos), lo que sugiere que el codec tiene dificultades con la dirección y velocidad del movimiento fino. No se han publicado resultados en benchmarks adicionales como Video-MME o LVBench, que se añadirán cuando complete la ejecución con el mismo protocolo.

## Requisitos de hardware

- El tamaño del repositorio es de 21,8 GB, lo que implica que los pesos completos requieren al menos esa cantidad de almacenamiento y una VRAM suficiente para cargarlos durante la inferencia (no se especifica el número exacto de parámetros).
- No se proporcionan requisitos mínimos de VRAM, GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) en la información disponible.
- Dado que el modelo se basa en Molmo2, es probable que sea compatible con el ecosistema de transformers de Hugging Face, pero no se confirma explícitamente.
- La latencia y el throughput no están documentados; el uso de un codec con 81 tokens por I-frame y 16 por P-frame sugiere una reducción significativa del coste de atención frente al procesamiento denso, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre otros codecs de video comparables en el mismo repositorio o en la búsqueda web. La comparación más directa es entre el propio modelo en modo denso y en modo codec, cuyos resultados se muestran en la tabla de benchmarks. El modelo base Molmo2 (8B) de Ai2 se describe como el mejor de su clase entre modelos open-weight para comprensión de video, pero no se proporcionan especificaciones detalladas de ese modelo en la información disponible. Por tanto, la comparativa con alternativas externas queda pendiente de datos adicionales.

## Limitaciones y advertencias

- El codec no es una reconstrucción visual sin pérdidas; la model card advierte explícitamente que la mayor debilidad es el movimiento fino (dirección y velocidad), con una caída de 5 puntos en TempCompass.
- Los pesos de Stage-1 y Stage-2 son un par indivisible. Combinar la Stage-2 con checkpoints antiguos del P-tokenizer (20K o 17K) produce resultados incorrectos.
- La evaluación se limita a 200 ejemplos por benchmark, lo que puede no ser estadísticamente representativo para todos los casos de uso.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos de este modelo, pero al estar basado en Molmo2, hereda las limitaciones generales de los modelos vision-language.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de las dependencias (Molmo2, AdaCodec) antes de desplegar en producción.
- No se proporcionan instrucciones de despliegue ni compatibilidad con frameworks de inferencia optimizados, lo que puede dificultar su integración en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/weikaih/molmo2-codec-v6-rgbhex-k4
- Repositorio hermano (Stage-2 V6): https://huggingface.co/weikaih/molmo2-codec-stage2-v6
- Código de Molmo2 (Ai2): https://github.com/allenai/molmo2
- Página oficial de Molmo (Ai2): https://allenai.org/molmo
- Repositorio MolmoAct2: https://github.com/allenai/molmoact2
