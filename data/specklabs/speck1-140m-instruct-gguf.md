# specklabs/Speck1-140M-Instruct-GGUF

## Resumen

Speck1-140M-Instruct es un modelo de lenguaje pequeño (140,7 millones de parámetros) desarrollado por specklabs, ajustado específicamente para instrucciones y conversación en inglés. Se distribuye en formato GGUF, lo que permite su ejecución eficiente en hardware de consumo mediante llama.cpp y herramientas compatibles como Ollama o LM Studio. Su arquitectura híbrida, que intercala atención global por grupos (GQA) con convoluciones causales, lo convierte en una opción interesante para despliegues en entornos con recursos limitados.

La relevancia de este modelo reside en su tamaño compacto y su licencia MIT, que permite uso comercial sin restricciones. Aunque no compite en capacidades con modelos de gran escala, ofrece una alternativa ligera para tareas de generación de texto y diálogo donde la latencia y el consumo de memoria son críticos. La versión GGUF aquí documentada incluye cuantizaciones desde BF16 hasta Q4_K_M, con tamaños de archivo que oscilan entre 112,9 MB y 361,2 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención global por grupos (GQA) intercalada con convoluciones causales con puerta |
| Parametros totales | 180.165.376 (en GGUF, tras transformación de compatibilidad; el modelo fuente declara 140,7 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | Inglés (según la descripción del modelo fuente) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo fuente, Speck1-140M-Instruct, se inicializó a partir de Speck1-140M, un modelo híbrido que combina atención global por grupos (GQA) con capas de convolución causal con puerta. Esta arquitectura alterna ambos operadores, buscando un equilibrio entre la capacidad de modelado de dependencias lejanas y la eficiencia computacional de las convoluciones. El ajuste fino se realizó durante una época completa sobre el dataset SpeckChat1, orientado a diálogo e instrucciones.

La conversión a GGUF, documentada en el README del repositorio, implica transformaciones específicas: los adaptadores de entrada y salida (640 a 768 y 768 a 640) se pliegan en las capas de embeddings, los canales de convolución se rellenan con ceros de 384 a 768, y los kernels causales de 3 taps se rellenan a 5 taps por la izquierda. Estas transformaciones preservan la función del modelo salvo por el redondeo numérico habitual. El grafo GGUF almacena 180.165.376 parámetros debido a que los embeddings atados de 640 dimensiones y los adaptadores se convierten en matrices separadas de 768 dimensiones, sin añadir capacidad real al modelo.

## Capacidades

- Generación de texto conversacional en inglés, orientado a diálogo multi-turno.
- Seguimiento de instrucciones básicas, dado su ajuste fino en un dataset de instrucciones.
- Ejecución local eficiente en CPU y GPU de baja gama gracias a su tamaño reducido y las cuantizaciones disponibles.
- Compatibilidad con el ecosistema llama.cpp: llama-cli, Ollama, LM Studio y otros motores que soporten GGUF.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Prototipado rápido de chatbots: por su tamaño reducido, permite iterar sobre el diseño de conversaciones sin necesidad de infraestructura costosa, usando herramientas como Ollama o llama.cpp en un portátil.
- Asistentes de texto embebidos en aplicaciones móviles o de escritorio: su huella de memoria (menos de 200 MB en Q4_K_M) lo hace viable para integrarse en aplicaciones que requieren procesamiento local sin conexión.
- Educación e investigación en PLN: sirve como modelo de juguete para estudiar arquitecturas híbridas atención-convolución o para experimentar con técnicas de cuantización y despliegue.
- Generación de texto auxiliar en flujos de trabajo: completar plantillas, redactar correos breves o generar respuestas automáticas en sistemas con restricciones de hardware.
- Filtrado o preprocesado de texto: clasificación ligera de mensajes o resúmenes cortos donde un modelo grande sería excesivo.
- Pruebas de integración en pipelines de IA: verificar la compatibilidad de herramientas de inferencia (vLLM, TGI, etc.) con modelos GGUF sin consumir recursos significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 112,9 MB, por lo que cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM, e incluso en memoria RAM para inferencia por CPU.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Metal (por ejemplo, NVIDIA GTX 1050 Ti o superior, Apple M1) puede ejecutar el modelo sin problemas.
- CPU: funciona en procesadores x86_64 y ARM (incluido Raspberry Pi 4/5) gracias a la optimización de llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por el tamaño del modelo se esperan decenas de tokens por segundo incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Speck1-140M-Instruct | 140,7 M | no disponible | MIT | GGUF | Arquitectura híbrida atención-convolución |
| TinyLlama-1.1B-Chat | 1,1 B | 2048 | Apache 2.0 | GGUF, safetensors | Modelo denso basado en Llama, mucho mayor |
| Phi-2 | 2,7 B | 2048 | MIT | safetensors | Modelo denso de Microsoft, mayor capacidad |

La comparativa muestra que Speck1-140M-Instruct es significativamente más pequeño que alternativas populares, lo que lo sitúa en un nicho de ultra-bajo consumo. No se dispone de datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; su rendimiento en otros idiomas será deficiente o nulo.
- Al ser un modelo de 140 M de parámetros, su capacidad de razonamiento complejo, generación de código o manejo de contextos largos es muy limitada en comparación con modelos de mayor escala.
- No se han publicado evaluaciones de sesgos o alucinaciones; se recomienda precaución en aplicaciones sensibles.
- La longitud de contexto no está documentada, por lo que se desconoce su límite real; es probable que sea corta (del orden de 1024-2048 tokens).
- La transformación de conversión a GGUF introduce redondeos numéricos que pueden afectar ligeramente a la calidad de salida, especialmente en cuantizaciones agresivas como Q4_K_M.
- Aunque la licencia MIT permite uso comercial, el modelo no ofrece garantías de precisión, seguridad o idoneidad para producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/specklabs/Speck1-140M-Instruct-GGUF
- Modelo fuente: https://huggingface.co/specklabs/Speck1-140M-Instruct
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
