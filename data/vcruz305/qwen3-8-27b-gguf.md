# vcruz305/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una cuantizacion en formato GGUF del modelo Qwen/Qwen3.8-27B, preparada por el desarrollador vcruz305 para su ejecucion con llama.cpp y herramientas compatibles. El repositorio se publica de forma anticipada, a la espera de que el modelo base oficial se desbloquee el 15 de agosto de 2026; por tanto, los archivos de pesos aun no estan disponibles para descarga. La iniciativa resulta relevante porque ofrece un punto de partida para ejecutar un modelo de 27.000 millones de parametros en hardware de consumo mediante cuantizaciones K-quants, con una primera version Q4_K_M orientada a tarjetas graficas de 24 GB.

El modelo base pertenece a la familia Qwen, con soporte declarado para ingles y chino, y licencia Apache-2.0 segun la model card, aunque el propio autor advierte de que esta licencia podria variar si Qwen publica una diferente. El repositorio actual incluye la planificacion de seis cuantizaciones (Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0), todas pendientes de subida. No se proporcionan detalles tecnicos sobre la arquitectura del modelo base ni sobre su entrenamiento, por lo que la ficha se limita a lo declarado en la model card y a estimaciones razonables basadas en el tamano y el formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se desconoce la del modelo base Qwen3.8-27B) |
| Parametros totales | 27B (segun el nombre del modelo, no confirmado oficialmente) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama-server usa `-c 32768`, pero es una configuracion del servidor, no una especificacion del modelo) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (planificados, aun no subidos) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (segun la model card, sujeta a cambios si el modelo oficial publica otra) |
| Formato de pesos | GGUF (archivos independientes, no adaptadores) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.8-27B. La model card del repositorio GGUF no incluye detalles sobre el tipo de transformer, el numero de capas, la dimension del modelo, el dataset de entrenamiento ni el proceso de alineacion (RLHF, DPO, etc.). El unico dato tecnico disponible es el proceso de conversion: los pesos originales se convierten con `convert_hf_to_gguf.py` a F16 y posteriormente se cuantizan con `llama-quantize` usando tipos K. Se descarta el uso de IQ1 por falta de imatrix.

## Capacidades

No hay informacion detallada sobre las capacidades del modelo base en la model card. Al tratarse de una cuantizacion, se espera que el modelo conserve las capacidades del original, pero no se pueden confirmar sin datos oficiales. Como referencia general para un modelo de 27B de la familia Qwen, cabria esperar:

- Generacion de texto en ingles y chino.
- Razonamiento basico y comprension de instrucciones.
- Posible soporte de tool calling y generacion de codigo, aunque no esta verificado.
- Capacidades multilingues limitadas a los idiomas declarados (en, zh).

Estas afirmaciones son hipoteticas y no deben tomarse como confirmadas.

## Casos de uso

Dado que el modelo aun no esta disponible y no se conocen sus capacidades exactas, los casos de uso son orientativos y basados en el tamano y la cuantizacion:

- Inferencia local en equipos de consumo: con la cuantizacion Q4_K_M, un modelo de 27B puede ejecutarse en GPUs con 24 GB de VRAM, permitiendo aplicaciones de generacion de texto sin conexion.
- Desarrollo de prototipos con llama.cpp: el formato GGUF permite integrar el modelo en servidores como `llama-server` para pruebas rapidas de API.
- Experimentacion con cuantizaciones: la disponibilidad de varios niveles (Q2 a Q8) permite evaluar el equilibrio entre calidad y requisitos de memoria.
- Procesamiento de texto en ingles y chino: si el modelo base mantiene las capacidades de Qwen, podria usarse para traduccion o generacion de contenido en esos idiomas.
- Educacion e investigacion: como ejemplo de cuantizacion de un modelo grande para entornos con recursos limitados.
- Despliegue en entornos sin GPU: cuantizaciones mas agresivas (Q2, Q3) podrian ejecutarse en CPU con suficiente RAM, aunque con menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantizacion Q4_K_M de un modelo de 27B, se estima un uso de 16-18 GB de VRAM (incluyendo overhead del contexto y de la ejecucion). Esta cifra es una estimacion orientativa, no un dato oficial.
- GPU recomendadas: tarjetas con 24 GB de VRAM, como RTX 4090, RTX 3090 o A100, son adecuadas para Q4_K_M. Para cuantizaciones menores (Q2, Q3), podrian bastar GPUs de 12-16 GB.
- En consumer GPU: si, la Q4_K_M esta disenada para tarjetas de 24 GB, segun indica el autor en la model card ("24 GB cards").
- Opciones de despliegue: llama.cpp, llama-server, y cualquier herramienta compatible con GGUF (Ollama, LM Studio, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamano similar (por ejemplo, Llama 3.1 30B o Qwen2.5-32B) en la informacion proporcionada. La comparativa queda pendiente de la publicacion del modelo base y de sus benchmarks oficiales.

## Limitaciones y advertencias

- El modelo aun no esta disponible: los archivos GGUF estan planificados pero no subidos, y el modelo base oficial no se ha desbloqueado (fecha prevista: 15 de agosto de 2026).
- Licencia sujeta a cambios: la model card indica Apache-2.0, pero advierte de que podria variar segun la licencia que Qwen publique para el modelo base.
- Sin informacion sobre sesgos o alucinaciones: no hay datos publicados sobre comportamientos problematicos del modelo base.
- Idiomas limitados: solo se declaran ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de sobreajuste a la cuantizacion: las cuantizaciones agresivas (Q2, Q3) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vcruz305/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
