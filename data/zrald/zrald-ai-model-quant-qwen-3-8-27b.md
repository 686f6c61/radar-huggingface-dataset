# Zrald/Zrald-AI-model-quant-qwen-3.8-27b

## Resumen

Zrald-AI-model-quant-qwen-3.8-27b es un repositorio de cuantizaciones GGUF del modelo denso Qwen/Qwen3.8-27B (27.320.697.856 parámetros), publicado por el usuario Zrald bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una conversión optimizada del modelo base a formato GGUF para su ejecución con llama.cpp, con tres variantes propias orientadas a distintos compromisos entre precisión, tamaño y velocidad: zraldv1-ac (prioridad de precisión, 17,08 GiB), zraldv1-ba (equilibrada, 14,46 GiB) y zraldv1-cs (comprimida, 10,18 GiB).

El problema que aborda es el de desplegar un modelo de ~27B en hardware de gama de consumo o en nodos con VRAM limitada sin recurrir a las cuantizaciones estándar (Q4_K_M, Q5_K_M, Q6_K, Q8_0), que según la model card pierden más precisión por unidad de tamaño. El autor declara retenciones de precisión del 99,68 %, 99,12 % y 90,72 % respectivamente, medidas sobre un conjunto de benchmarks de código y razonamiento, y verificadas físicamente en una AMD Instinct MI300X con ROCm/HIP.

La relevancia del repositorio es práctica: la variante equilibrada está diseñada para encajar en GPUs de 16 GB de VRAM y la comprimida en tarjetas de 12 GB, con velocidades de generación declaradas de entre 64,68 y 76,33 tok/s. Conviene señalar que el repositorio acumula 0 descargas y 0 me gusta, y que todos los datos de rendimiento proceden del propio autor, sin verificación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (según la model card) |
| Parámetros totales | 27.320.697.856 (~27,3 mil millones) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en tres variantes propias: zraldv1-ac (~5,07 BPW), zraldv1-ba (~4,29 BPW), zraldv1-cs (~3,02 BPW); etiqueta `imatrix` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 44,8 GB |
| Fecha de publicación en HuggingFace | 2026-09-18 |

## Arquitectura y entrenamiento

La información disponible describe un transformer denso de aproximadamente 27,3 mil millones de parámetros, sin mezcla de expertos ni mecanismos de atención alternativa declarados. El repositorio no entrena ningún modelo: convierte los pesos del modelo base Qwen/Qwen3.8-27B a GGUF y aplica cuantización, presumiblemente guiada por matriz de importancia dado el uso de la etiqueta `imatrix`. No se documentan la composición del dataset de entrenamiento original, el número de tokens procesados, ni si hubo fases de RLHF, DPO u otras técnicas de alineación.

La innovación técnica declarada es la metodología de cuantización: tres recetas calibradas que, según el autor, obtienen mejor retención de precisión que las cuantizaciones estándar equivalentes en tamaño. La variante zraldv1-ac se sitúa en ~5,07 BPW y afirma igualar o superar a Q6_K (6,56 BPW) y Q8_0 (8,50 BPW); la zraldv1-ba, en ~4,29 BPW, declara un 3,92 % más de retención que Q4_K_M; y la zraldv1-cs, en ~3,02 BPW, prioriza la velocidad de generación sobre la fidelidad. No se especifica la técnica exacta de calibración, el dataset de calibración ni la definición formal del porcentaje de "retención de precisión".

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y el pipeline `text-generation`.
- Generación de código: el repositorio se evalúa con SWE-bench Pro, QwenSWEBench, TerminalBench y LiveCodeBench, lo que indica que la model card lo orienta a tareas de programación.
- Razonamiento y matemáticas: se reportan resultados en GPQA Diamond, benchmark de preguntas científicas de nivel posgrado.
- Compatibilidad con endpoints declarada mediante la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; los benchmarks de tipo SWE-bench sugieren uso en flujos de trabajo de código, pero la model card no describe ninguna integración de agente.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.

## Casos de uso

- Asistente de código en local: la variante zraldv1-ba (14,46 GiB) encaja en GPUs de 16 GB y puede ejecutarse con llama.cpp como copiloto de programación sobre el repositorio completo, con una retención declarada del 99,12 % y 64,68 tok/s de generación.
- Pipelines de CI/CD para revisión de código: la variante zraldv1-ac (17,08 GiB, 20 GB de VRAM) ofrece la mayor fidelidad de la familia y resultados en SWE-bench Pro del 61,5 %, por lo que es la opción adecuada cuando la precisión de la revisión automática prima sobre el coste de memoria.
- Despliegue de alta concurrencia y baja latencia: la variante zraldv1-cs alcanza 76,33 tok/s de generación con solo 10,18 GiB, lo que permite servir varias peticiones simultáneas en tarjetas de 12 GB o mediante offload parcial a CPU con 16 GB de RAM de sistema.
- Estaciones de trabajo de desarrollo individual: la variante equilibrada funciona en RTX 4060 Ti 16GB, RTX 4080, RX 7800 XT y Apple Silicon con 16 GB o más de memoria unificada, lo que cubre equipos de sobremesa y portátiles de gama alta.
- Procesamiento por lotes de documentación técnica o código heredado: el formato GGUF y la compatibilidad con llama.cpp permiten scripts de generación por lotes sin infraestructura de servidor GPU dedicada.
- Entornos con restricciones de memoria y edge: la variante comprimida permite ejecutar un modelo de ~27B en sistemas con 12 GB de VRAM o con offload a CPU, algo inviable con el modelo en FP16 (52,70 GB según el autor).
- Experimentación e investigación sobre cuantización: el repositorio publica tres recetas con métricas comparativas frente a las cuantizaciones estándar, lo que lo convierte en un punto de partida para reproducir o cuestionar los resultados de retención declarados.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. Se midieron en una AMD Instinct MI300X (192 GB HBM3, gfx942) con el runtime ROCm de llama.cpp, mediante `llama-bench -ngl 99 -p 128 -n 32 -r 1`.

| Modelo / cuantización | Tamaño | BPW efectivo | Retención | SWE-bench Pro | TerminalBench | QwenSWEBench | GPQA Diamond | LiveCodeBench | Generación (tok/s) | VRAM mínima |
|---|---|---|---|---|---|---|---|---|---|---|
| FP16 (base) | 52,70 GB | 16,00 | 100,00 % | 61,7 % | 73,0 % | 79,0 % | 89,2 % | 90,3 % | ~58,4 | 64 GB |
| Q8_0 estándar | 27,04 GiB (28,5 GB) | 8,50 | 99,42 % | 61,3 % | 72,6 % | 78,5 % | 88,7 % | 89,8 % | 63,75 | 32 GB |
| Q6_K estándar | 22,10 GB | 6,56 | 98,61 % | 60,8 % | 72,0 % | 77,9 % | 88,0 % | 89,0 % | 65,20 | 26 GB |
| Q5_K_M estándar | 19,30 GB | 5,72 | 97,45 % | 60,1 % | 71,1 % | 77,0 % | 86,9 % | 88,0 % | 67,00 | 24 GB |
| Q4_K_M estándar | 16,50 GB | 4,85 | 95,20 % | 58,7 % | 69,5 % | 75,2 % | 84,9 % | 86,0 % | 68,50 | 20 GB |
| Q3_K_M estándar | 13,60 GB | 4,02 | 89,70 % | 55,3 % | 65,5 % | 70,9 % | 80,0 % | 81,0 % | 71,00 | 16 GB |
| Q2_K estándar | 10,90 GB | 3,22 | 78,40 % | 48,4 % | 57,2 % | 61,9 % | 69,9 % | 70,8 % | 72,40 | 14 GB |
| zraldv1-ac | 17,08 GiB (18,3 GB) | ~5,07 | 99,68 % | 61,5 % | 72,8 % | 78,7 % | 88,9 % | 90,0 % | 69,38 | 20 GB |
| zraldv1-ba | 14,46 GiB (15,5 GB) | ~4,29 | 99,12 % | 61,2 % | 72,4 % | 78,3 % | 88,4 % | 89,5 % | 64,68 | 16 GB |
| zraldv1-cs | 10,18 GiB (10,9 GB) | ~3,02 | 90,72 % | 55,9 % | 66,2 % | 71,7 % | 80,9 % | 81,9 % | 76,33 | 12 GB |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima declarada: 12 GB para zraldv1-cs, 16 GB para zraldv1-ba, 20 GB para zraldv1-ac y 64 GB para el modelo en FP16.
- GPUs de consumo compatibles: RTX 3060 12GB y RTX 4070 con la variante comprimida; RTX 4060 Ti 16GB, RTX 4080 y AMD RX 7800 XT con la variante equilibrada.
- Apple Silicon: la variante equilibrada se declara apta para equipos con 16 GB o más de memoria unificada (M1, M2, M3, M4).
- Ejecución con offload a CPU: la variante comprimida puede funcionar con 16 GB de RAM de sistema, según el autor.
- GPUs de centro de datos: las mediciones se realizaron en una AMD Instinct MI300X con 192 GB HBM3 y ROCm (`-DGGML_HIP=ON -DGPU_TARGETS=gfx942`). No se documentan pruebas en A100, H100 ni en GPUs NVIDIA de centro de datos.
- Rendimiento medido: entre 1.089,6 y 1.344,4 tok/s de procesamiento de prompt y entre 64,68 y 76,33 tok/s de generación para las tres variantes propias.
- Opciones de despliegue documentadas: llama.cpp compilado con CUDA, ROCm/HIP o Metal, y la etiqueta `endpoints_compatible` para integración con endpoints compatibles.
- Otros motores (vLLM, TGI, Ollama): no documentados en la información disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos de otras familias de modelos, por lo que no es posible una comparativa externa fiable. La comparación disponible es interna, entre las tres variantes propias y las cuantizaciones estándar del mismo modelo base:

| Variante | Tamaño | Retención declarada | VRAM mínima | Ventaja declarada |
|---|---|---|---|---|
| zraldv1-ac | 17,08 GiB | 99,68 % | 20 GB | Iguala o supera a Q6_K y Q8_0 ahorrando ~10 GB frente a Q8_0 |
| zraldv1-ba | 14,46 GiB | 99,12 % | 16 GB | +3,92 % de retención frente a Q4_K_M estándar |
| zraldv1-cs | 10,18 GiB | 90,72 % | 12 GB | 62,3 % más pequeña que Q8_0 y +19,7 % de velocidad de generación |
| Q4_K_M estándar | 16,50 GB | 95,20 % | 20 GB | Referencia estándar de compromiso |
| Q8_0 estándar | 27,04 GiB | 99,42 % | 32 GB | Referencia estándar de alta fidelidad |

Comparativa con modelos de otras familias (por ejemplo, otros modelos densos de ~27B): no disponible.

## Limitaciones y advertencias

- Todos los datos de precisión, velocidad y retención proceden de la model card del autor. No hay verificación independiente ni resultados de terceros.
- El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Las velocidades se midieron con una sola repetición (`-r 1`), de modo que la varianza de las mediciones no está caracterizada y las diferencias entre variantes pueden quedar dentro del ruido estadístico.
- La model card presenta inconsistencias internas: el baseline FP16 se declara en 52,70 GB cuando 27,32 mil millones de parámetros a 16 bits equivalen a aproximadamente 54,6 GB; y Q8_0 aparece como "27,04 GiB (28,5 GB)", mezclando unidades de forma poco rigurosa. Conviene tratar las cifras comparativas con cautela.
- El modelo base se identifica como Qwen/Qwen3.8-27B, una denominación que no se ha podido verificar con la información proporcionada. Antes de usarlo en producción conviene confirmar la existencia, la licencia y las condiciones reales del modelo base.
- La longitud de contexto no está documentada en el repositorio. Es un parámetro crítico para despliegues con conversaciones largas o análisis de repositorios completos.
- No se documentan los idiomas soportados ni las capacidades multilingües del modelo.
- No se documenta soporte de tool calling ni de flujos de agente, lo que limita su uso en pipelines que dependan de llamadas a funciones.
- La variante zraldv1-cs pierde aproximadamente 9,3 puntos de retención frente al baseline, con caídas notables en GPQA Diamond (80,9 % frente a 89,2 %) y QwenSWEBench (71,7 % frente a 79,0 %). No es recomendable para tareas de razonamiento complejo o de código en producción.
- Los requisitos de VRAM son estimaciones del autor; el consumo real depende del tamaño del contexto configurado, del número de capas descargadas a GPU y del backend utilizado.
- Licencia Apache 2.0 en el repositorio, lo que en principio permite uso comercial, pero debe verificarse la licencia del modelo base antes de cualquier explotación comercial.
- Riesgo de alucinación, sesgos y comportamiento en dominios especializados: no documentado por el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Zrald/Zrald-AI-model-quant-qwen-3.8-27b
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (repositorio oficial): https://github.com/ggerganov/llama.cpp
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los resultados obtenidos tratan sobre la plataforma Spotify y no guardan relación con la ficha.
