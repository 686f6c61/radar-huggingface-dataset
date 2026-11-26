# Wa1k3r/Inkling-2-Mini-8Q-RCO-GCQ

## Resumen

Inkling-2-Mini 8Q RCO-GCQ es una cuantización de 8 bits del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario Wa1k3r. El modelo base es un mixture of experts con arquitectura de transformer con bucles (looped transformer): 24 capas de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa y el runtime mantiene 48 cachés. Dispone de 128 expertos por capa con 8 activos por token, y los expertos ya vienen publicados por el proveedor en formato de coma flotante de 4 bits (NVFP4).

La relevancia de esta ficha no está en el modelo base, sino en el artefacto de cuantización: un único fichero GGUF de 18.263.767.520 bytes (17,6 GB de pesos) que permite ejecutar una ventana de contexto de 524.288 tokens con el modelo completo residente en una sola GPU de 24 GB, algo que una conversión estándar a 8 bits (27,8 GB) no permite. El fichero se ha generado con la herramienta de cuantización de LexiSuite (LexiPanel Quant Forge) y está diseñado para ejecutarse en LexiEngine, un motor de inferencia escrito en Rust sobre Vulkan; no es un fichero compatible con llama.cpp estándar.

La cuantización combina tres decisiones técnicas: los expertos se copian bit a bit desde el checkpoint original en NVFP4 sin decodificar ni recuantizar, las 176 matrices de atención se ajustan a 8 bits (Q8_0) mediante GPTQ con calibración, y se aplica una búsqueda RCO del mix de formatos bajo un presupuesto de tamaño ("caber con 524k de contexto en 24 GB"). Además, el fichero incluye el draft head del propio modelo (54 tensores, 0,64 GB) para decodificación especulativa sin necesidad de un checkpoint separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts con transformer con bucles (looped transformer); 24 capas, 12 centrales repetidas 3 veces con pesos compartidos (48 aplicaciones de capa por token) |
| Parametros totales | 26.388.288.144 (26,4 mil millones) |
| Parametros activos | 8 expertos por token de 128 por capa (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 524.288 tokens (modelo completo y cachés en 24 GB); 20 capas con ventana de 1.024 tokens y 4 capas con contexto completo |
| Tipos de cuantizacion | Expertos en NVFP4 (4 bits, copiados del checkpoint); matrices de atención en Q8_0 con redondeo calibrado GPTQ; resto en Q8_0 o formato original; caché KV a 4 bits (configuración medida) u 8 bits |
| Idiomas soportados | Inglés (etiqueta `language: en` en la model card; resto no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero único `Inkling-2-Mini-8Q-RCO-GPTQ.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un mixture of experts con arquitectura de transformer con bucles: 24 capas en total, de las cuales las 12 centrales se ejecutan tres veces compartiendo pesos, lo que resulta en 48 aplicaciones de capa por token y 48 cachés en el runtime. Cada capa contiene 128 expertos, de los que se activan 8 por token. La atención es híbrida: veinte capas operan con una ventana local de 1.024 tokens y cuatro capas ven el contexto completo, lo que hace viable la ventana de 524.288 tokens sin un coste cuadrático completo. El proveedor publica los expertos ya en formato NVFP4 de 4 bits.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. La innovación técnica documentada de esta ficha es la cuantización: calibración con 16 ventanas de 512 tokens a través del modelo en precisión completa, ajuste GPTQ individual de cada una de las 176 matrices de atención contra esas entradas (un ejemplo del run: el error de salida de una matriz de 8 bits pasa de 6,48 con redondeo simple a 0,90 ajustada), búsqueda RCO del mix de formatos bajo el presupuesto de tamaño y empaquetado del draft head del propio modelo en el mismo fichero para decodificación especulativa.

## Capacidades

- Generación de texto conversacional y de base (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento de contexto largo: recuperación verificada de 10 de 10 hechos plantados a lo largo de un prompt de 523.264 tokens, desde el 1 % hasta el 99 % de su longitud.
- Decodificación especulativa con el draft head integrado en el fichero: 5,7 tokens por paso a 16k de contexto y 3,0 tokens por paso a 524k, con salida idéntica a la decodificación greedy simple en todas las ejecuciones medidas (256 de 256 tokens a 16k, 128 de 128 a 524k).
- Capacidades multilingües: la model card solo declara inglés; no hay información sobre otros idiomas.
- Soporte de tool calling, function calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios y documentación extensa: con 524.288 tokens de contexto y recuperación verificada a lo largo de todo el prompt, el modelo puede ingerir un árbol de código completo o un corpus de documentación y responder preguntas sobre elementos situados en cualquier posición del material.
- Procesamiento de expedientes y contratos largos: la ventana completa permite cargar un contrato de cientos de páginas junto con anexos y plantear consultas de extracción o comparación sin fragmentación ni recuperación externa.
- Asistente local de escritorio con privacidad: al caber el modelo y sus cachés en una única GPU de consumo de 24 GB sin servir nada desde memoria del sistema, es viable un despliegue enteramente local en el que ningún dato sale del equipo.
- Procesamiento por lotes de documentos largos en una sola tarjeta: el throughput medido de prompt (2.300-2.417 tok/s en contextos cortos y 787,6 tok/s a 523.264 tokens) permite ingerir documentos extensos en minutos sobre hardware de gama alta de consumo.
- Investigación sobre cuantización y decodificación especulativa: el fichero incluye métricas de divergencia KL frente a los pesos publicados (0,00141 con cachés sin redondear y 0,00549 con cachés de 4 bits) y comparación con un hermano de redondeo simple, lo que lo convierte en un artefacto útil para estudiar el impacto de la cuantización de pesos y de caché por separado.
- Evaluación de contexto largo sin infraestructura de datacenter: la prueba de recuperación a 523.264 tokens está ejecutada en una Radeon RX 7900 XTX, de modo que sirve como banco de pruebas de recuperación a media millón de tokens en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Los datos de rendimiento disponibles son mediciones de inferencia y de divergencia de cuantización, no de calidad en tareas:

| Métrica | Valor |
|---|---|
| Velocidad de prompt a 4.096 tokens | 2.417 tok/s |
| Velocidad de prompt a 16.384 tokens | 2.300 tok/s |
| Velocidad de prompt a 523.264 tokens | 787,6 tok/s (11 min 4 s) |
| Generación simple a 4.096 tokens | 66,3 tok/s |
| Generación simple a 16.384 tokens | 64,9 tok/s |
| Generación con draft head a 16.384 tokens | 105,7 tok/s (5,7 tokens por paso) |
| Generación simple a 523.264 tokens | 40,1 tok/s |
| Generación con draft head a 523.264 tokens | 39,6 tok/s (frente a 37,0 simple en la misma ejecución; 3,0 tokens por paso) |
| Recuperación a 523.264 tokens | 10 de 10 |

Divergencia frente a una ejecución de referencia de los pesos publicados (1.024 posiciones, dos textos de 512 tokens; menor es mejor):

| Fichero | Cachés sin redondear: KL / mismo token top | Cachés de 4 bits: KL / mismo token top |
|---|---|---|
| Este fichero (ajustado) | 0,00141 / 99,02 % | 0,00549 / 97,56 % |
| Redondeo simple | 0,00175 / 99,22 % | 0,00499 / 97,56 % |

Prueba de aceptación de la herramienta de cuantización sobre ventana reservada: KL 0,00214 frente a un límite de 0,02; mismo token top 99,02 % frente a un mínimo de 95 %.

## Requisitos de hardware

- VRAM: 17,62 GB de pesos + 5,02 GB de cachés a 524.288 posiciones (48 slots, filas de caché de 4 bits) + 0,58 GB de scratch = aproximadamente 23,2 GB. Todo el modelo y las cachés residen en la tarjeta; nada se sirve desde memoria del sistema.
- GPU recomendadas: Radeon RX 7900 XTX (24 GB), la configuración sobre la que están medidas todas las cifras (Vulkan, Linux, Intel i7-9700). Otras GPU de 24 GB no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB, siempre que el motor de inferencia sea compatible (LexiEngine sobre Vulkan).
- Opciones de despliegue: LexiEngine (Vulkan), motor en Rust de LexiSuite. No es un fichero de llama.cpp estándar; la model card remite a la sección de compatibilidad para los detalles. vLLM, TGI, Ollama y llama.cpp no están documentados como soportados en la información disponible. La imagen de pruebas `3a376f8` o posterior es necesaria para leer el draft head desde el fichero; la imagen `b753bf3` carga y genera (53 tok/s en prompt corto) pero no lee el draft head.
- Latencia y throughput: ver tabla de benchmarks (66,3 tok/s de generación simple a 4k; 105,7 tok/s con draft head a 16k; 40,1 tok/s a 524k; prompt a 787,6 tok/s en el extremo de 523.264 tokens).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad que permitan comparar este modelo con alternativas de la misma categoría. La comparación disponible es interna al propio artefacto:

| Artefacto | Tamaño | Contexto máximo en 24 GB | Licencia | Motor |
|---|---|---|---|---|
| Este fichero (8Q RCO-GPTQ) | 18,3 GB (17,6 GB de pesos) | 524.288 tokens | Apache-2.0 | LexiEngine (Vulkan) |
| Conversión estándar a 8 bits del mismo modelo base | 27,8 GB | No cabe en 24 GB | Apache-2.0 (modelo base) | No disponible |
| Pesos publicados del modelo base | No disponible | No disponible | Apache-2.0 | No disponible |

## Limitaciones y advertencias

- Compatibilidad restringida: no es un fichero de llama.cpp estándar; requiere LexiEngine (Vulkan) y, para el draft head, la imagen de pruebas `3a376f8` o posterior.
- El error de la caché de 4 bits domina sobre el error de los pesos: aproximadamente 0,005 de KL frente a aproximadamente 0,002 con filas de caché de 8 bits. Con cachés de 4 bits, el ajuste GPTQ de las matrices de atención no aporta ventaja medible frente al redondeo simple (0,00549 frente a 0,00499 de KL, mismo token top en ambos casos al 97,56 %); la mejora del ajuste solo se observa con cachés sin redondear.
- El draft head pierde eficacia con la profundidad: a 524k el rendimiento con draft head (39,6 tok/s) es prácticamente igual al simple (37,0 tok/s en la misma ejecución) porque su propia atención sobre ese contexto consume parte del ahorro; a 16k la ganancia es de 1,9 veces.
- Idiomas: la model card solo declara inglés; no hay información sobre calidad en castellano u otros idiomas.
- Sesgos y riesgo de alucinación: no disponible en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial; deben respetarse las condiciones de la licencia del modelo base thinkingmachines/Inkling-2-Mini, también Apache-2.0.
- Las cifras de rendimiento son ejecuciones únicas con decodificación greedy sobre una configuración concreta (Radeon RX 7900 XTX, Intel i7-9700, Linux, Vulkan), no promedios sobre múltiples ejecuciones.
- No hay resultados publicados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/Wa1k3r/Inkling-2-Mini-8Q-RCO-GCQ
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- LexiSuite: https://huggingface.co/Wa1k3r/LexiSuite
