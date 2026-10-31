# Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ4e-FP16-MTP-MLX

## Resumen

Qwen3.8-27B Fable Cold Fusion (oQ4e, FP16, MTP) es una cuantización mixta para Apple Silicon de un modelo derivado de la familia Qwen3.8 de 27B parámetros, publicado por Studio-Research-M1. El modelo base es DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, una variante "uncensored" orientada a conversación y generación de código, con capacidades de imagen-texto a texto (image-text-to-text). Esta versión concreta, oQ4e, es la más ligera de una familia de tres cuantizaciones (oQ4e, oQ6e y oQ8e) y se presenta como la opción por defecto para la mayoría de Macs.

Su relevancia radica en la optimización específica para chips M1 / M1 Pro / M1 Max, que carecen de soporte BF16 por hardware: los tensores no cuantizados usan FP16, se conserva la cabeza MTP (multi-token prediction) para decodificación especulativa y se mantiene la torre de visión en FP32. Según la model card, las tres cuantizaciones empatan estadísticamente en precisión, por lo que la elección depende de velocidad, memoria y fidelidad frente al BF16 original.

El repositorio pesa 18,0 GB en formato safetensors para MLX, con un total de 27.781.427.952 parámetros. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + torre de vision), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (mixta: escalas y bises FP16, torre de vision FP32, cabeza MTP cuantizada); familia disponible en oQ4e, oQ6e y oQ8e |
| Idiomas soportados | ingles (en), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización de precisión mixta en formato MLX del modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, a su vez derivado de Qwen3.8 de 27B parámetros. La particularidad técnica principal es el esquema "oQ" (omni-quantization): escalas, bises y tensores de texto no cuantizados en FP16, la torre de visión en FP32 (333 tensores) y la cabeza MTP conservada y cuantizada (29 tensores). El uso de FP16 en lugar de BF16 responde a la ausencia de BF16 por hardware en los GPU de los chips M1; la model card indica que la perplejidad y la KLD se mantienen finitas sobre las 32.768 posiciones evaluadas de WikiText-2, sin salidas degeneradas en las pruebas rápidas.

La conservación de la cabeza MTP permite decodificación especulativa nativa en motores compatibles, como oMLX con su modo Lightning MTP, lo que se traduce en aumentos de velocidad del 17 % al 65 % según la build. Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en la model card de esta cuantización, por lo que esos datos no están disponibles.

## Capacidades

- Generacion de texto conversacional, con etiqueta "conversational" en el repositorio.
- Comprension de imagen-texto a texto (pipeline image-text-to-text): la torre de vision se conserva en FP32, aunque la vision no ha sido evaluada en la model card.
- Generacion de codigo: la model card destaca que oQ4e con MTP activado es la opcion mas rapida para codigo (28,1 tok/s frente a 19,0 tok/s de oQ8e).
- Decodificacion especulativa mediante la cabeza MTP conservada (29 tensores), funcional de serie en motores compatibles como oMLX Lightning MTP.
- Variante "uncensored" del modelo base: sin los filtros de alineacion estandar, lo que amplia el rango de respuestas pero exige precaucion en produccion.
- Soporte multilingue declarado para ingles y frances; el castellano no figura entre los idiomas declarados.

## Casos de uso

- Chat diario en Mac con memoria limitada: con 18 GB de pesos, oQ4e cabe en Macs con 32 GB de memoria unificada y es la build por defecto recomendada para la mayoria de usuarios por su equilibrio velocidad/tamano.
- Generacion y edicion de codigo en local: con MTP activado alcanza 28,1 tok/s, la combinacion mas rapida de la familia para tareas de codigo, util como asistente de programacion sin dependencia de la nube.
- Descripcion y analisis de imagenes: al conservar la torre de vision en FP32, puede usarse para tareas de imagen-texto a texto (subtitulado, preguntas sobre imagenes), aunque sin benchmarks publicados de esa capacidad.
- Comparacion de cuantizaciones para investigacion: la familia oQ4e/oQ6e/oQ8e con metricas KLD publicadas (0,0132 a 0,00046 frente a BF16) sirve como caso de estudio de cuantizacion mixta en Apple Silicon.
- Prototipado de decodificacion especulativa: la cabeza MTP conservada permite probar y medir aceleraciones por MTP en motores como oMLX Lightning MTP sin configuracion adicional.
- Asistentes conversacionales sin restricciones de alineacion: al tratarse de una variante uncensored, puede emplearse en entornos controlados donde se requiera respuestas sin los filtros estandar, bajo responsabilidad del desplegador.
- Despliegue en flotas de Macs antiguas: la optimizacion para M1/M1 Pro/M1 Max lo hace adecuado para reaprovechar hardware Apple Silicon de primera generacion como nodos de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si aporta metricas propias de cuantizacion y velocidad:

| Metrica | Valor |
|---|---|
| KLD medio vs BF16 (oQ4e) | 0,0132 |
| KLD medio vs BF16 (oQ8e) | 0,00046 |
| Perplejidad / KLD en WikiText-2 | finitas sobre 32.768 posiciones evaluadas |
| Velocidad en codigo (oQ4e + MTP) | 28,1 tok/s |
| Velocidad en codigo (oQ8e) | 19,0 tok/s |
| Ganancia MTP en oQ8e | +17 % a +65 % |
| Ganancia MTP en oQ4e (codigo) | +48 % |

La model card afirma que las tres builds empatan estadisticamente en precision en sus pruebas, sin numeros concretos de accuracy publicados.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 18,0 GB solo de pesos para oQ4e; en la practica se recomienda un Mac con al menos 32 GB de memoria unificada. La familia completa: oQ6e (24,6 GB) y oQ8e (30,9 GB), esta ultima recomendada para equipos con 48 GB o mas.
- GPU recomendadas: chips Apple Silicon M1, M1 Pro y M1 Max como objetivo principal; hay builds BF16 anunciadas para M2 a M5. No es un modelo pensado para GPU NVIDIA (formato MLX).
- Consumer hardware: cabe en Macs de consumo con 32 GB de RAM unificada; en Macs de 24 GB quedaria muy justo al no dejar margen para el KV cache y el sistema.
- Opciones de despliegue: libreria MLX; la model card menciona oMLX (con Lightning MTP) como motor de referencia. No se menciona soporte para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: 28,1 tok/s en codigo con MTP activado (oQ4e); 19,0 tok/s para oQ8e; ganancias de MTP entre +17 % y +65 % segun build y tarea. No hay cifras para prose mas alla de indicar que MTP es "neutro en prose" en oQ4e.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B Fable Cold Fusion oQ4e (este) | 27,78B | oQ4e mixta, 18,0 GB | no disponible | Apache 2.0 | MLX, MTP conservado, vision, uncensored |
| Qwen3.8-27B Fable Cold Fusion oQ6e | 27,78B | oQ6e, 24,6 GB | no disponible | Apache 2.0 | MTP desactivado, KLD menor que oQ4e |
| Qwen3.8-27B Fable Cold Fusion oQ8e | 27,78B | oQ8e, 30,9 GB | no disponible | Apache 2.0 | Maxima fidelidad vs BF16, MTP activado (+17 % a +65 %) |
| Modelos Qwen3 27B en GGUF (p. ej. cuantizaciones Q4_K_M) | 27B aprox. | Q4_K_M, ~16-17 GB | no disponible | Apache 2.0 (modelo base) | Formato GGUF multiplataforma, sin MTP nativo en MLX |

No se conocen alternativas publicas con decodificacion especulativa MTP conservada en formato MLX para esta familia; la comparativa se limita a las builds hermanas del mismo autor.

## Limitaciones y advertencias

- Variante "uncensored": al provenir de un modelo base sin los filtros de alineacion estandar, existe un riesgo elevado de generar contenido ofensivo, peligroso o inapropiado. No es adecuado para despliegue publico sin capas de moderacion propias.
- Riesgo de alucinacion: no disponible (sin datos publicados especificos), aunque como todo LLM de 27B puede alucinar hechos.
- Idiomas: solo se declaran ingles y frances; el rendimiento en castellano no esta documentado y puede ser inferior.
- Vision no evaluada: aunque el pipeline es image-text-to-text y la torre de vision se conserva, la model card no incluye benchmarks de capacidades visuales.
- Longitud de contexto no documentada en esta model card; debe verificarse en la documentacion del modelo base antes de planificar cargas con documentos largos.
- Plataforma: formato MLX exclusivo para Apple Silicon; no utilizable directamente en GPU NVIDIA ni en la mayoria de servidores Linux estandar.
- FP16 en lugar de BF16: seguro segun las pruebas del autor (perplejidad y KLD finitas), pero es una validacion empirica limitada a WikiText-2 y pruebas rapidas; comportamiento en dominios extremos no garantizado.
- Adopcion temprana: 51 descargas y 2 likes en el momento de la ficha, con poca comunidad de revision; conviene validar en el propio entorno antes de uso serio.

## Enlaces

- Repositorio del modelo (oQ4e): https://huggingface.co/Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ4e-FP16-MTP-MLX
- Build oQ6e: https://huggingface.co/Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ6e-FP16-MTP-MLX
- Build oQ8e: https://huggingface.co/Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ8e-FP16-MTP-MLX
- Coleccion de la familia: https://huggingface.co/collections/Studio-Research-M1/fable-cold-fusion-27b-oq-mlx-apple-silicon-6ae4c7edc03b20a43baac97a
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
