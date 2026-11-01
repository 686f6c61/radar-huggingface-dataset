# tpnlabs/gemma-4-E2B-it-TPN-GGUF

## Resumen

`tpnlabs/gemma-4-E2B-it-TPN-GGUF` es una colección de cuantizaciones GGUF del modelo `google/gemma-4-E2B-it`, preparada y medida por TPN Workbench. El modelo base es un modelo multimodal (image-text-to-text) de Google con aproximadamente 4.647 millones de parámetros, y esta versión cuantizada permite ejecutarlo eficientemente en local con llama.cpp, en navegador o en dispositivos de consumo, incluida la app Gratis de TPN, que lo ejecuta completamente on-device.

La relevancia de esta ficha radica en que no se limita a publicar los pesos: cada formato de cuantización se ha evaluado frente a la referencia BF16 usando divergencia KL de siguiente token, perplejidad y agreement top-1, además de una evaluación de chat propia (Gratis chat eval). Esto permite elegir el formato con datos reales de degradación. La recomendación del autor es Q4_K_M (3,43 GB), el formato más pequeño que mantiene la calidad de chat dentro del margen de ruido respecto a Q6_K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, image-text-to-text) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M, IQ4_XS, Q3_K_M, Q2_K y variantes repack (+) |
| Idiomas soportados | no disponible (la eval de chat incluye prompts en de/es/fr) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (con imatrix), compatible con llama.cpp |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it`, la variante instruction-tuned de la familia Gemma 4 en tamaño E2B, con unos 4,65 mil millones de parámetros según los metadatos de safetensors. Es un modelo multimodal de tipo image-text-to-text: el repositorio incluye un proyector de visión en formato GGUF (`mmproj-gemma-4-E2B-it-F16.gguf`, 0,99 GB) que debe cargarse junto al modelo principal para habilitar la entrada de imágenes. Los detalles internos de arquitectura (número de capas, atención, longitud de contexto) y del proceso de entrenamiento del modelo base no están disponibles en la información proporcionada.

Sobre la cuantización, TPN Workbench ha generado los GGUF con imatrix y ha medido cada formato contra la referencia BF16 en tres métricas: divergencia KL media de siguiente token (menor es mejor), delta de perplejidad y agreement top-1. Un hallazgo destacable es que los formatos bajos se degradan fuertemente en este modelo concreto: Q3_K_M tiene un KLD de 0,53 y Q2_K de 1,03, lo que el autor califica de "roto" para este modelo, de modo que el mínimo recomendable es Q4_K_M. Los K-quants además disponen de kernels SIMD en llama.cpp WebAssembly y kernels ARM repackados en móvil, lo que los hace más rápidos en navegador y teléfonos.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`), evaluada con 32 prompts cotidianos de categorías creativas, instrucciones, razonamiento, conocimiento, tareas, honestidad y chat.
- Entrada multimodal imagen+texto: soporte de visión mediante el proyector `mmproj-F16` incluido en el repositorio.
- Capacidades multilingües parciales verificadas en la evaluación de chat con prompts en alemán, español y francés (la lista oficial de idiomas no está disponible).
- Razonamiento con modo thinking desactivable (la evaluación se realizó con "thinking off").
- Ejecución on-device completa en navegador (WebAssembly) y escritorio mediante la app Gratis, y en local vía llama.cpp.
- No hay información sobre tool calling, function calling ni capacidades de agentes en la documentación disponible.

## Casos de uso

- Chatbot local y privado: con Q4_K_M (3,43 GB) cabe en portátiles sin GPU dedicada; al ejecutarse on-device, los datos no salen del equipo, adecuado para asistentes con datos sensibles.
- Visión on-device: cargando el mmproj F16 junto al modelo, se pueden describir imágenes, extraer texto de capturas o hacer preguntas sobre fotos directamente en el navegador.
- Despliegue en navegador vía WebAssembly: los kernels SIMD de los K-quants hacen de Q4_K_M y superiores la opción rápida para demos embebidas en webs sin backend.
- Apps móviles: los kernels ARM repackados de llama.cpp permiten ejecutar el modelo en teléfonos, con Q4_K_M o IQ4_XS (3,30 GB) como formatos más ligeros viables.
- Evaluación comparativa de cuantizaciones: el informe medido de TPN sirve como referencia para equipos que deciden el trade-off tamaño/calidad al desplegar Gemma 4 E2B en producción.
- Prototipado con servidor local: `llama-server` permite levantar un endpoint OpenAI-compatible en un comando para integrar el modelo en aplicaciones y pipelines de prueba.
- Asistente multilingüe ligero: la eval de chat incluye prompts en español, alemán y francés con puntuaciones globales de 77,4 (Q4_K_M) a 78,9 (Q6_K), razonable para uso cotidiano en esos idiomas.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de calidad de cuantización y una evaluación de chat propia:

| Formato | Tamaño | KLD medio | PPL Δ | Top-1 agreement |
|---|---|---|---|---|
| Q8_0 | 4,97 GB | 0,0066 | +13,20 % | 96,9 % |
| Q6_K | 3,85 GB | 0,0300 | +8,55 % | 93,7 % |
| Q5_K_M | 3,63 GB | 0,0582 | +7,71 % | 90,8 % |
| Q5_0 | 4,26 GB | 0,0860 | +18,39 % | 88,8 % |
| IQ4_XS | 3,30 GB | 0,1758 | +4,42 % | 85,3 % |
| Q4_K_M | 3,43 GB | 0,1518 | +1,67 % | 85,9 % |
| Q4_0 | 4,03 GB | 0,3504 | +6,11 % | 78,1 % |
| Q3_K_M | 3,20 GB | 0,5328 | +2,98 % | 73,7 % |
| Q2_K | 2,99 GB | 1,0284 | -36,82 % | 62,2 % |

Resultados del Gratis chat eval (32 prompts × 3 muestras, gradúa Claude Sonnet, ruido ±4):

| Formato | Puntuación global |
|---|---|
| Q4_K_M | 77,4 |
| Q5_K_M | 78,7 |
| Q6_K | 78,9 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: de 2,99 GB (Q2_K, no recomendado) a 4,97 GB (Q8_0) solo de pesos; Q4_K_M ocupa 3,43 GB, más el mmproj de 0,99 GB si se usa visión y la memoria del KV cache.
- GPUs recomendadas: cualquier GPU moderna con 6 GB o más de VRAM ejecuta cómodamente Q4_K_M a Q6_K; no se requieren A100 ni H100 dado el tamaño del modelo.
- Consumer GPUs: sí, cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti o superiores, incluso con el proyector de visión cargado. También funciona solo con CPU/RAM (4-8 GB libres).
- Opciones de despliegue: llama.cpp (llama-server y llama-cli, comando oficial `-hf tpnlabs/gemma-4-E2B-it-TPN-GGUF`), llama.cpp WebAssembly en navegador, app Gratis (escritorio y navegador) y cualquier runtime GGUF compatible (Ollama, LM Studio) al ser formato endpoints_compatible.
- Latencia y throughput: no disponible; solo se indica que los K-quants son la opción más rápida en WebAssembly y ARM por sus kernels optimizados.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tpnlabs/gemma-4-E2B-it-TPN-GGUF | 4,65 B | Sí (mmproj incluido) | GGUF (Q2_K a Q8_0, medidos) | Apache 2.0 | Cuantizaciones con informe KLD/PPL; ideal para on-device |
| google/gemma-4-E2B-it (base) | 4,65 B | Sí | BF16 (safetensors) | Apache 2.0 | Referencia de máxima calidad; mayor huella de memoria |
| Qwen3-VL-4B (GGUF comunitarios) | ~4 B | Sí | GGUF / safetensors | Apache 2.0 | Alternativa multimodal de tamaño similar; contexto y benchmarks según su ficha oficial |
| Phi-4-mini / variantes GGUF | ~3,8-4 B | No (texto) | GGUF / safetensors | MIT | Menor tamaño, solo texto; buena alternativa si no se necesita visión |

La comparación cuantitativa de benchmarks entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Cuantizaciones bajas degradadas: en este modelo concreto Q3_K_M (KLD 0,53) y Q2_K (KLD 1,03) están rotos según las mediciones de TPN; no usar por debajo de Q4_K_M.
- Riesgo de alucinación: no caracterizado para este modelo; como todo LLM de 4,6 B, puede generar contenido incorrecto con apariencia plausible, especialmente en conocimiento factual.
- Sesgos: no documentados en la model card; al heredar del modelo base de Google, aplican los sesgos conocidos de la familia Gemma.
- Idiomas: la lista oficial de idiomas soportados no está disponible; solo se ha verificado informalmente rendimiento en de/es/fr dentro de la eval de chat.
- Longitud de contexto: no publicada en la información disponible, lo que dificulta planificar cargas de documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos de uso específicos de Gemma del modelo base.
- El Gratis chat eval usa como juez a Claude Sonnet con ruido de ±4 puntos, por lo que las diferencias entre Q4_K_M (77,4) y Q6_K (78,9) están dentro del margen de ruido.
- La visión requiere cargar el archivo mmproj adicional (0,99 GB); sin él, el modelo solo acepta texto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tpnlabs/gemma-4-E2B-it-TPN-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Informe completo de mediciones de TPN: https://bench.trueperformancenetwork.com/r/JVnVN-u7fd6DAXk20VYwyA
- TPN Workbench: https://bench.trueperformancenetwork.com
- Gratis (app on-device): https://gratis.trueperformancenetwork.com/
