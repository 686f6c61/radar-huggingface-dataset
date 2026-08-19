# Verkiki/Qwen3.8-27B-ColdGAIN-Fable5Fusion-MTP-IQ4_XS-GGUF

## Resumen

Verkiki/Qwen3.8-27B-ColdGAIN-Fable5Fusion-MTP-IQ4_XS-GGUF es un archivo GGUF cuantizado a IQ4_XS del modelo fusionado Nightmedia Fable-Fusion F711 GAIN, construido sobre la arquitectura Qwen3.8-27B de Alibaba. Se trata de un modelo denso de 27.000 millones de parámetros con 64 capas, nativamente multimodal (acepta imagen y vídeo como entrada) y con una ventana de contexto nativa de 262.144 tokens, extensible a 1.000.000 según las especificaciones de Qwen3.8. El lanzamiento incorpora un head MTP (Multi-Token Prediction) embebido, compatible con Qwen3.8, para acelerar la decodificación especulativa en entornos de ejecución local.

La relevancia de este modelo radica en su linaje de fusión: el autor parte de un checkpoint MXFP4 publicado por Nightmedia que ya mostraba mejoras medibles frente al Qwen3.8-27B base en términos de precisión (ARC 0.690 vs 0.581) y perplejidad (3.803 vs 5.952). El proceso de conversión incluye la recuperación estructural del checkpoint MXFP4, su de-cuantización a FP16 como puente, la calibración con una importance matrix específica del modelo y la conversión final a IQ4_XS. El resultado es un GGUF compacto pensado para ejecución local en hardware de consumo, manteniendo la flexibilidad multimodal del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 64 capas, nativamente multimodal (visión + lenguaje) |
| Parametros totales | 27.000 millones (según modelo base Qwen3.8-27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (extensible a 1.000.000) |
| Tipos de cuantizacion | IQ4_XS con importance matrix específica del modelo |
| Idiomas soportados | no disponible (no especificado en la documentación) |
| Licencia | other (no especificada; el modelo base Qwen3.8-27B es Apache 2.0, pero esta fusión no lo declara) |
| Formato de pesos | GGUF (compatible con llama.cpp, Ollama, etc.) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros y 64 capas, entrenado originalmente con Multi-Token Prediction (MTP) y con un encoder de visión nativo que permite entrada de imágenes y vídeo. Sobre esta base, Nightmedia aplicó una serie de fusiones (GAIN, Fable y finalmente F711) que mejoran las capacidades de razonamiento y generación. El checkpoint resultante fue publicado en formato MXFP4 (4 bits, group size 32), que es el punto de partida de este lanzamiento.

El proceso de conversión a GGUF fue inusual: dado que el checkpoint fuente ya estaba cuantizado en MXFP4, el autor lo recuperó estructuralmente (validando 3 shards de safetensors, 498 pesos MXFP4 empaquetados y 498 tensores de escala), lo de-cuantizó a FP16 como representación puente, generó una importance matrix específica del backbone recuperado y lo convirtió a IQ4_XS. Además, se incrustó un head MTP compatible con Qwen3.8, que no existía en el checkpoint MXFP4 original, para habilitar decodificación especulativa. No se han publicado detalles sobre el dataset de entrenamiento de las fusiones ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras medidas en ARC Challenge y perplejidad frente al Qwen3.8-27B base.
- Comprensión multimodal: acepta imágenes y vídeo como entrada, usando el archivo `mmproj` GGUF correspondiente para el encoder de visión.
- Soporte de Multi-Token Prediction (MTP) integrado, que permite decodificación especulativa y mayor throughput en inferencia.
- Control de razonamiento flexible: el modelo puede operar en modo de razonamiento explícito (chain-of-thought) o directo, según el prompt y la configuración.
- Capacidades de agente y tool calling: heredadas de Qwen3.8, aunque no se documentan explícitamente en esta variante.
- Multilingüe: no confirmado para esta fusión específica, aunque Qwen3.8-27B base soporta múltiples idiomas.

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y depurar código en múltiples lenguajes, ejecutándose en una GPU de consumo con 16-18 GB de VRAM gracias a la cuantización IQ4_XS. Su soporte de tool calling permite integrarlo en entornos de desarrollo como IDE o pipelines de CI/CD.
- Análisis de imágenes y documentos escaneados: al ser multimodal, puede extraer información de capturas, diagramas o documentos con gráficos, útil para automatizar tareas de procesamiento de documentos en entornos con privacidad de datos.
- Chat de atención al cliente con contexto largo: su ventana de 262K tokens permite mantener conversaciones extensas con historial completo, adecuado para bots de soporte que necesitan recordar interacciones previas sin truncamiento.
- Razonamiento científico y matemático: las mejoras en ARC y perplejidad sugieren mayor capacidad de razonamiento abstracto, útil para asistentes de investigación o resolución de problemas matemáticos paso a paso.
- Prototipado de agentes autónomos: la combinación de MTP (mayor velocidad) y tool calling permite construir agentes que ejecutan tareas multi-paso con llamadas a herramientas, por ejemplo, búsqueda web o ejecución de scripts.
- Despliegue en edge computing: al ser un GGUF de ~15-17 GB, puede ejecutarse en hardware modesto (GPU con 16 GB, Mac con 24 GB unificados) para aplicaciones de procesamiento de lenguaje natural en el borde, sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este GGUF final. El autor declara explícitamente que las mediciones que se citan a continuación corresponden al checkpoint MXFP4 fuente de Nightmedia, no a esta conversión IQ4_XS. Se incluyen como referencia del potencial del linaje:

| Modelo (medición MXFP4 publicada) | ARC | Perplejidad | Pico de memoria | tok/s |
|---|---:|---:|---:|---:|
| Qwen3.8-27B baseline | 0.581 | 5.952 ± 0.051 | 21.30 GB | 148 |
| Cold-Fusion GAIN V1.1 | 0.644 | 4.042 ± 0.026 | 21.30 GB | 185 |
| Cold-Fusion GAIN V1.1 + Fable | 0.654 | 3.975 ± 0.025 | 21.30 GB | 186 |
| Fable-Fusion F711 GAIN | 0.690 | 3.803 ± 0.023 | 21.30 GB | 185 |

Además, el componente Fable Distill (según TeichAI) muestra mejoras relativas en ARC Challenge (+7.8%), ARC Easy (+6.4%) y BoolQ (+1.7%) frente al Qwen3.8-27B base. Estos datos provienen de evaluaciones publicadas por los autores de las fusiones, no de pruebas independientes sobre este GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 15 y 18 GB para el archivo IQ4_XS (típico para un modelo de 27B en cuantización 4 bits). Se recomienda al menos 16 GB de VRAM para ejecución cómoda.
- GPUs recomendadas: RTX 4080/4090 (16-24 GB), RTX 3090 (24 GB), A100 40 GB, o GPUs de consumo con 16 GB o más. También funciona en Apple Silicon con 24 GB de memoria unificada (según guías para Qwen3.8-27B).
- En consumer GPU: sí, cabe en RTX 4080/4090 y similares con 16 GB o más.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF), Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF) y otros runners compatibles con GGUF.
- Latencia y throughput: no hay mediciones publicadas para este GGUF. El modelo fuente MXFP4 reportaba 185 tok/s en su configuración de prueba, pero la conversión IQ4_XS puede variar. Se espera un throughput razonable en hardware moderno gracias al MTP embebido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verkiki/Qwen3.8-27B-ColdGAIN-Fable5Fusion-MTP-IQ4_XS-GGUF | 27B | 262K | IQ4_XS | other | HuggingFace |
| Qwen/Qwen3.8-27B (original) | 27B | 262K | FP16, BF16, GGUF oficiales | Apache 2.0 | HuggingFace |
| Qwen3.8-27B GGUF (comunidad) | 27B | 262K | Q4_K_M, Q5_K_M, etc. | Apache 2.0 | HuggingFace |

La principal diferencia con el Qwen3.8-27B original es el linaje de fusión (GAIN + Fable + F711) que aporta mejoras medidas en ARC y perplejidad, aunque a costa de una licencia menos clara ("other") y de que las mediciones no son del propio GGUF. Frente a otros GGUF comunitarios del mismo modelo base, este destaca por la imatrix específica y el MTP embebido, pero carece de benchmarks propios verificados.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos. Aunque el modelo base Qwen3.8-27B es Apache 2.0, la fusión y el proceso de cuantización pueden imponer restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- Sesgos y alucinaciones: al ser un modelo derivado de Qwen3.8, puede presentar sesgos presentes en los datos de entrenamiento originales y riesgo de alucinación en tareas de razonamiento o factualidad, especialmente en modos de generación libre.
- Rendimiento no verificado: los benchmarks citados corresponden al checkpoint MXFP4 fuente, no al GGUF final. La cuantización IQ4_XS puede degradar ligeramente la calidad respecto a las mediciones publicadas.
- Soporte multimodal condicionado: para usar la visión es necesario descargar el archivo `mmproj` GGUF correspondiente; sin él, el modelo funciona solo como texto.
- Contexto muy largo: aunque la ventana nativa es de 262K tokens, el rendimiento con contextos extremos puede degradarse en hardware limitado y requerir técnicas como RoPE scaling o atención con ventana deslizante.
- Repo sin métricas de comunidad: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Verkiki/Qwen3.8-27B-ColdGAIN-Fable5Fusion-MTP-IQ4_XS-GGUF
- Modelo base (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución local de Qwen3.8-27B: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Guía para Mac y GPU: https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
