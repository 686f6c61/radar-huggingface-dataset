# Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16

## Resumen

Inkling 2 Mini MTPLX Optimized Quality FP16 es un empaquetado cuantizado del modelo abierto Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab y redistribuido por el usuario Youssofal para su uso con MTPLX, la aplicacion y CLI de inferencia local para Apple Silicon. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26.388.646.440 parametros totales y 3.400 millones de parametros activos por token, disenado para tareas de codigo, agentes y vision, con una ventana de contexto de hasta 1.048.576 tokens.

Este empaquetado concreto esta pensado para Macs con chip M1 y M2, que carecen de soporte nativo de bfloat16: todos los tensores de 16 bits (torre de vision y cabeza de borrador incluidas) se almacenan en float16, mientras que los codigos de 4 y 8 bits se conservan identicos al empaquetado padre. Incluye decodificacion especulativa mediante una cabeza de prediccion multi-token propia del modelo, de modo que el borrador propone tokens y el modelo completo los verifica en una sola pasada, preservando la distribucion original de salida.

Su relevancia es practica: permite ejecutar un modelo MoE de 26.400 millones de parametros con vision y contexto de hasta 1 millon de tokens en hardware de consumo Apple Silicon con 32 GB o mas de memoria unificada, algo que no es posible con los pesos en precision completa. El paquete requiere MTPLX 2.13 o superior y no carga en MTPLX 2.12.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con torre de vision y cabeza de prediccion multi-token |
| Parametros totales | 26.388.646.440 |
| Parametros activos | 3.400 millones (8 de 128 expertos por token) |
| Longitud de contexto | Hasta 1.048.576 tokens en el modelo; en este pack: 65.536 tokens con 32 GB, 647.168 tokens con 64 GB y 1.048.576 tokens con 96-192 GB (M1/M2) |
| Tipos de cuantizacion | Expertos en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); proyecciones de atencion, cabeza de salida, embeddings, torre de vision y cabeza de borrador en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con politica de uso aceptable de Thinking Machines) |
| Formato de pesos | safetensors (libreria mtplx) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos, de los cuales se activan 8 por token, lo que da 3.400 millones de parametros activos sobre un total de 26.400 millones. Incorpora una torre de vision completa que permite entrada de imagen y texto (pipeline image-text-to-text), asi como una cabeza de prediccion multi-token que actua como borrador para decodificacion especulativa. El modelo soporta modo de razonamiento (thinking) segun los tags del repositorio.

Este empaquetado no reentrena ni modifica la arquitectura: solo altera la precision de almacenamiento. Los expertos se guardan en NVFP4 en las capas 0 a 19 (15,67 GB) y en MXFP8 en las capas 20 a 23; las proyecciones de atencion (1,29 GB), la cabeza de salida (0,93 GB), los embeddings (0,93 GB), la torre de vision (0,64 GB) y la cabeza de borrador (0,64 GB) se almacenan en FP16. El muestreo recomendado por el autor es temperatura 1.0 sobre la distribucion completa (top-p 1.0, sin top-k), y la verificacion especulativa acepta cada token candidato por la regla de razon de probabilidades, de modo que la salida sigue la distribucion del modelo a cualquier temperatura. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo y asistencia en tareas de programacion (tag `coding`).
- Razonamiento agentico y multi-paso, con soporte de herramientas segun los tags del modelo base.
- Vision: lectura de capturas de pantalla, diagramas y fotografias mediante la torre de vision incluida en FP16.
- Entrada image-text-to-text (pipeline declarado).
- Decodificacion especulativa con cabeza de prediccion multi-token propia, con salida que preserva la distribucion del modelo.
- Modo de razonamiento (thinking) segun los tags del repositorio.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistencia de codigo en local: el modelo puede integrarse en editores y CLI (OpenCode, Pi, Hermes) mediante la API compatible con OpenAI y Anthropic que sirve MTPLX en `127.0.0.1:8000`, aprovechando sus 3.400 millones de parametros activos para mantener latencia baja en Macs M1/M2.
- Analisis de capturas de pantalla y diagramas: la torre de vision en FP16 permite enviar imagenes de interfaces, esquemas de arquitectura o graficos y obtener explicaciones o codigo derivado, sin salir del equipo.
- Agentes multi-paso con contexto largo: con hasta 1.048.576 tokens de contexto en Macs de 96-192 GB, el modelo puede mantener el estado de una sesion agentica extensa con muchas llamadas a herramientas y documentos intermedios.
- Procesamiento de repositorios completos: en Macs de 64 GB o mas, el contexto de 647.168 tokens permite cargar grandes porciones de un codebase para revision, refactorizacion o busqueda semantica asistida.
- Desarrollo offline y privado: al ejecutarse integramente en Apple Silicon, es adecuado para entornos con requisitos de confidencialidad donde no se permite enviar codigo o imagenes a servicios en la nube.
- Prototipado de aplicaciones con API local: `mtplx serve` expone endpoints compatibles con OpenAI y Anthropic, lo que permite sustituir un proveedor remoto por este modelo en fases de desarrollo y pruebas.
- Generacion de documentacion tecnica a partir de imagenes y texto combinados, usando la entrada image-text-to-text del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: exclusivamente Apple Silicon M1 y M2 (este pack no esta pensado para M3, M4 o M5, que deben usar los packs padre).
- Memoria unificada minima: 32 GB para M1/M2; con 32 GB el contexto maximo es de 65.536 tokens, con 64 GB de 647.168 tokens y con 96-192 GB de 1.048.576 tokens.
- Descarga: 20,2 GB.
- Memoria pico medida: 22,3 GiB sirviendo un prompt de 4.142 tokens en la ruta de codigo de M1/M2, medido en un M5 Max.
- Despliegue: aplicacion MTPLX (mtplx.com) o CLI `mtplx` (instalable via Homebrew o pip); requiere MTPLX 2.13 o superior.
- Integraciones de cliente: OpenCode, Pi y Hermes mediante `mtplx start`; API OpenAI y Anthropic en `127.0.0.1:8000` mediante `mtplx serve`.
- No compatible con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini MTPLX Optimized Quality FP16 (este pack) | 26,4 B / 3,4 B | Hasta 1.048.576 tokens (segun memoria) | Apache 2.0 | Hugging Face, MTPLX |
| Inkling 2 Mini MTPLX Optimized Quality (padre, M3/M4/M5) | 26,4 B / 3,4 B | Hasta 1.048.576 tokens | Apache 2.0 | Hugging Face, MTPLX |
| Inkling 2 Mini MTPLX Bare Speed FP16 | 26,4 B / 3,4 B | Hasta 1.048.576 tokens | Apache 2.0 | Hugging Face, MTPLX |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 B / 3,4 B | Hasta 1.048.576 tokens | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos packs ni con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Exclusivo para Apple Silicon M1 y M2: en M3, M4 o M5 debe usarse el pack padre; el autor indica que MTPLX selecciona automaticamente el adecuado.
- Requiere MTPLX 2.13 o superior; no carga en MTPLX 2.12.
- No cabe en Macs de 8, 16 o 24 GB; el autor recomienda modelos alternativos en esos casos.
- La cuantizacion NVFP4/MXFP8 en los expertos puede degradar la calidad frente a los pesos originales en precision completa; el pack conserva los codigos del padre, pero no se aportan metricas de perdida de calidad.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones especificas de fidelidad.
- Idiomas soportados no disponibles; no se puede confirmar el rendimiento en castellano.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0, pero sujeta a la politica de uso aceptable de Thinking Machines Lab, que puede restringir determinados usos.
- El muestreo debe seguir la configuracion del autor (temperatura 1.0, top-p 1.0, sin top-k) para preservar la distribucion; otros ajustes pueden alterar el comportamiento esperado.
- El rendimiento y la latencia dependen del ancho de banda de memoria del chip; no se publican cifras de throughput.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pack padre Optimized Quality: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality
- Pack hermano Bare Speed FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed-FP16
- Pack hermano Optimized Speed FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed-FP16
- Pack Bare Speed (M3/M4/M5): https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed
- Pack Optimized Speed (M3/M4/M5): https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed
- MTPLX: https://mtplx.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Politica de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
