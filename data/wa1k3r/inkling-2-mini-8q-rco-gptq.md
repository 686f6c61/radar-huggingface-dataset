# Wa1k3r/Inkling-2-Mini-8Q-RCO-GPTQ

## Resumen

Inkling-2-Mini 8Q RCO-GPTQ es una cuantización de 8 bits del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario Wa1k3r. El modelo base es un mixture of experts con arquitectura de transformer con bucles (looped transformer): 24 capas de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, dando lugar a 48 aplicaciones de capa por token. Con 26.388.288.144 parámetros totales y 128 expertos por capa (8 activos por token), el modelo está diseñado para contexto largo, hasta 524.288 tokens.

La particularidad de esta ficha es que no es una conversión estándar a GGUF. El autor conserva los expertos en el formato de coma flotante de 4 bits original del proveedor (NVFP4) copiado bit a bit, cuantiza las 176 matrices de atención a 8 bits con GPTQ y deja el resto en 8 bits. El resultado es un único archivo de 18,26 GB que, junto con cachés de 4 bits, permite ejecutar el modelo completo con una ventana de 524.288 tokens en una GPU de 24 GB (Radeon RX 7900 XTX). Además, el archivo incluye la cabeza de borrador (draft head) del propio modelo para decodificación especulativa.

El archivo está pensado para LexiEngine, un motor de inferencia escrito en Rust que usa Vulkan, no para llama.cpp estándar. Es relevante ahora porque demuestra que es posible servir un MoE de 26.000 millones de parámetros con contexto de medio millón de tokens en hardware de consumo, a costa de un ecosistema de herramientas propio y limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts con transformer con bucles (looped transformer): 24 capas, 12 centrales ejecutadas 3 veces (48 aplicaciones por token), 128 expertos por capa, 8 activos por token |
| Parametros totales | 26.388.288.144 |
| Parametros activos | no disponible (el autor indica 8 expertos activos de 128 por capa, sin cifra total de parámetros activos) |
| Longitud de contexto | 524.288 tokens (20 capas con ventana de 1.024 tokens y 4 capas con contexto completo) |
| Tipos de cuantizacion | Expertos en NVFP4 (4 bits, copiados sin recuantizar); matrices de atención en Q8_0 con GPTQ; resto en Q8_0 o formato original; cachés de 4 bits u 8 bits |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo único de 18.263.767.520 bytes, SHA-256 `e2033b2d8b54335f22c1cbe3bbb4cfa5da642c70750443958ef4d65e064b37fa`) |

## Arquitectura y entrenamiento

El modelo base es un mixture of experts con estructura de transformer con bucles: de las 24 capas, las 12 centrales se reutilizan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa y el runtime debe mantener 48 cachés. Cada capa contiene 128 expertos, de los que se activan 8 por token. La atención es híbrida en cuanto a ventana: 20 capas operan con una ventana local de 1.024 tokens y 4 capas ven el contexto completo, lo que permite alcanzar los 524.288 tokens sin que todas las capas paguen el coste cuadrático.

El proceso de cuantización de esta ficha, ejecutado con la herramienta Quant Forge de LexiPanel, consta de calibración con 16 ventanas de 512 tokens a través del modelo en precisión completa, ajuste GPTQ de las 176 matrices de atención contra esas activaciones, búsqueda de mezcla de formatos bajo un presupuesto de tamaño (RCO), construcción del archivo con 176 matrices ajustadas y 568 tensores sin modificar, y evaluación sobre una ventana reservada. No se aplicó ningún fine-tune ni adaptador: el autor entrenó uno pequeño y lo descartó al no mejorar de forma medible. La cabeza de borrador del modelo (54 tensores, 0,64 GB) se empaquetó dentro del mismo GGUF para decodificación especulativa con verificación exacta en decodificación voraz.

## Capacidades

- Generación de texto conversacional y de un solo turno, con pipeline `text-generation`.
- Razonamiento de múltiples pasos y contexto largo: ventana de hasta 524.288 tokens, adecuada para recuperación de información en documentos extensos.
- Decodificación especulativa integrada mediante la cabeza de borrador del propio modelo, con salida idéntica a la decodificación sin cabeza en modo voraz.
- Procesamiento de prompts muy largos con velocidad de prefill medida de 787,6 tok/s en una RX 7900 XTX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-step autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado (`language: en`).
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios y documentación extensa: con 524.288 tokens de contexto, el modelo puede ingerir bases de código o manuales completos en una sola pasada y responder preguntas sobre ellos sin fragmentación ni recuperación externa.
- Recuperación de información en profundidad dentro de un prompt: el autor menciona pruebas de retrieval a distintas profundidades; el modelo es adecuado para tareas donde el dato relevante está enterrado en cientos de miles de tokens.
- Asistentes conversacionales de dominio largo: conversaciones multi-turno que acumulan mucho historial sin truncar, gracias a la ventana completa y a las cachés de 4 bits que mantienen el coste de memoria contenido.
- Despliegue local en estación de trabajo con GPU de consumo: un único archivo de 18,3 GB más 5,02 GB de cachés cabe en 24 GB de VRAM, lo que permite ejecutar el modelo sin servidores ni APIs externas.
- Generación de texto por lotes con prefill rápido: la velocidad de prompt de 787,6 tok/s en una RX 7900 XTX hace viable procesar documentos largos en pipelines offline.
- Prototipado e investigación sobre arquitecturas MoE con bucles: el archivo permite estudiar el comportamiento de un transformer con pesos compartidos y 48 aplicaciones de capa en hardware asequible, con métricas de divergencia publicadas (KL 0,00141 con cachés sin redondear; 0,00549 con cachés de 4 bits).
- Evaluación de motores de inferencia alternativos: sirve como banco de pruebas para comparar LexiEngine frente a llama.cpp en el mismo archivo y la misma GPU, con datos de velocidad ya publicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de velocidad y de divergencia de cuantización, no de calidad de tarea.

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de prompt | 787,6 tok/s | Prompt de 523.264 tokens, RX 7900 XTX, caches de 4 bits, decodificación voraz |
| Tiempo de prefill completo | 11 min 4 s | Prompt de 523.264 tokens |
| Velocidad de generación (sin draft head) | 40,1 tok/s | RX 7900 XTX, caches de 4 bits |
| Divergencia KL (cachés sin redondear) | 0,00141 | 1.024 posiciones, dos textos de 512 tokens |
| Coincidencia de token superior (cachés sin redondear) | 99,02% | 1.024 posiciones |
| Divergencia KL (cachés de 4 bits) | 0,00549 | 1.024 posiciones |
| Coincidencia de token superior (cachés de 4 bits) | 97,56% | 1.024 posiciones |
| Test de aceptación de Quant Forge | KL 0,00214 (límite 0,02); top token 99,02% (mínimo 95%) | Ventana reservada |

Comparación de motores publicada por el autor (LexiEngine `b753bf3` frente a llama.cpp b12600, mismo archivo redondeado simple, misma GPU, cachés de 4 bits): la tabla de la model card queda truncada en la información disponible, por lo que no se pueden reproducir las cifras de llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,62 GB de pesos más 5,02 GB de cachés a 524.288 posiciones (48 ranuras) más 0,58 GB de scratch, total aproximado de 23,2 GB.
- GPU recomendada y medida: Radeon RX 7900 XTX (24 GB) con Vulkan. No hay datos publicados para A100, H100 ni RTX 4090 en esta ficha.
- Cabe en GPU de consumo de 24 GB; con menos VRAM no se puede mantener el contexto completo según las cifras del autor. Para contextos más cortos, la memoria de cachés se reduce proporcionalmente.
- Opciones de despliegue: LexiEngine (Vulkan, escrito en Rust). No es un archivo compatible con llama.cpp estándar según el autor; la sección de compatibilidad de la model card queda truncada en la información disponible.
- Latencia y throughput medidos: 787,6 tok/s de prompt y 40,1 tok/s de generación en RX 7900 XTX con decodificación voraz; el autor indica que la cabeza de borrador acelera la generación manteniendo salida idéntica, pero no se incluyen cifras concretas en la información disponible.
- CPU y plataforma de la medición: Intel i7-9700, Linux.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini 8Q RCO-GPTQ (esta ficha) | 26,39 B totales, MoE 8/128 | 524.288 | Apache-2.0 | GGUF para LexiEngine | Expertos en NVFP4, atención Q8_0 GPTQ, draft head incluida |
| thinkingmachines/Inkling-2-Mini (base) | 26,39 B totales, MoE 8/128 | 524.288 | Apache-2.0 | safetensors | Pesos completos; el autor indica 27,8 GB si se convierte a 8 bits estándar |
| Conversión estándar a 8 bits (referencia del autor) | 26,39 B | 524.288 | Apache-2.0 | GGUF | 27,8 GB, no cabe en 24 GB según el autor |

No se dispone de datos de rendimiento de benchmarks para comparar la calidad frente a alternativas de la misma categoría. La comparativa disponible se limita al tamaño de archivo y a la viabilidad de ejecución en 24 GB.

## Limitaciones y advertencias

- Solo se declara inglés (`language: en`); no hay soporte multilingüe verificado.
- La cuantización introduce divergencia medible: KL 0,00549 y 97,56% de coincidencia del token superior con cachés de 4 bits. El propio autor señala que la caché de 4 bits, no el archivo de pesos, es la mayor fuente de error (aproximadamente 0,005 frente a 0,002 con cachés de 8 bits).
- El ajuste GPTQ no supera al redondeo simple cuando se usan cachés de 4 bits: 0,00549 frente a 0,00499 de KL. La mejora del ajuste es pequeña y solo se manifiesta con cachés sin redondear.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos conocidos: no documentados en la información disponible.
- Compatibilidad restringida: el archivo requiere LexiEngine y no funciona en llama.cpp estándar según el autor. Esto limita el despliegue a un ecosistema de herramientas propio y poco extendido.
- El modelo base tiene una arquitectura inusual (48 aplicaciones de capa, 48 cachés) que complica la integración en motores genéricos.
- Uso comercial: la licencia Apache-2.0 del modelo base y de esta cuantización lo permite, pero conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini por si hubiera términos adicionales no reflejados en la información disponible.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de usuarios muy reducido y poca validación externa.
- La model card está incompleta en la información proporcionada (sección de compatibilidad y tabla comparativa con llama.cpp truncadas); no se pueden verificar esas afirmaciones.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/Wa1k3r/Inkling-2-Mini-8Q-RCO-GPTQ
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- LexiSuite: https://huggingface.co/Wa1k3r/LexiSuite
