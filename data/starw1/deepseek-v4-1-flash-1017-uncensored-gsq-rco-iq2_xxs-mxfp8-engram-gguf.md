# Starw1/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-MXFP8-Engram-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-MXFP8-Engram-GGUF es una cuantización GGUF comunitaria del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario Starw1 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una recompilación (merge) que combina la variante "uncensored" (abliterated) en cuantización extrema IQ2_XXS de Abiray con las tablas Engram del modelo oficial en precisión completa MXFP8.

El problema que resuelve es doble: por un lado, elimina los rechazos de seguridad del modelo original mediante el proceso de abliteration (aplicado previamente por ISTA-DASLab y Abiray); por otro, restaura las tablas Engram a la precisión original FP8 E4M3 con escalas E8M0 por cada 32 valores, copiadas byte a byte desde el repositorio oficial, en lugar de la cuantización 4-bit IQ4_NL usada en el backbone base. El resultado pesa 341,3 GB en el repositorio, con 196.613.849.600 parámetros totales declarados en safetensors.

Su relevancia actual es limitada a un nicho concreto: usuarios que ejecutan modelos masivos localmente con llama.cpp y que quieren la variante sin filtros con la máxima fidelidad posible en las tablas Engram sin recurrir a los pesos originales en FP8. La licencia declarada es MIT, heredada del repositorio base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformador de DeepSeek, detalles no publicados en la model card) |
| Parametros totales | 196.613.849.600 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (backbone), MXFP8 / tipo ggml 43 (tablas Engram) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento propio: es un trabajo de reempaquetado de pesos. El backbone procede de Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF, que a su vez es una versión abliterated (con las capas de rechazo neutralizadas) del GSQ-RCO-GGUF de ISTA-DASLab, derivado del modelo oficial deepseek-ai/DeepSeek-V4.1-Flash-1017. El modelo base subyacente es DeepSeek-V4.1-Flash-1017, del que no se detallan en la model card arquitectura, número de expertos, tokens de entrenamiento ni métodos de alineación.

La innovación técnica de esta compilación está en el tratamiento de las tablas Engram: el autor copió los valores FP8 E4M3 oficiales con escalas E8M0 por grupos de 32 (revisión `1bae0e10` del repositorio oficial) byte a byte al layout GGUF de ISTA, usando el tipo ggml 43 (MXFP8). La verificación cubrió las 768 millones de filas de las tablas y se comprobó con la herramienta Strata (`pack_gguf.py --engram`) mediante una pasada de referencia en CPU; los scripts están en `tools/` y los resultados en `verification.log`. Esto sustituye las tablas Engram cuantizadas a 4-bit (IQ4_NL) del backbone original por precisión completa, a costa de aumentar el tamaño del repositorio a 341,3 GB.

## Capacidades

Al ser una recompilación de DeepSeek-V4.1-Flash-1017, sus capacidades teóricas son las del modelo base, aunque la model card no las documenta. Lo que sí puede afirmarse con datos:

- Generación de texto general heredada de DeepSeek-V4.1-Flash-1017 (detalles no disponibles en la información proporcionada).
- Variante "uncensored"/abliterated: elimina o degrada los mecanismos de rechazo del modelo original, respondiendo a peticiones que el modelo oficial denegaría.
- Compatibilidad con el ecosistema GGUF y llama.cpp, incluyendo la herramienta Strata para el manejo de tablas Engram.
- No hay información sobre tool calling, capacidades multimodales, vision, audio ni soporte de agentes en la información disponible.

## Casos de uso

- Inferencia local sin filtros: ejecutar en hardware propio un modelo de ~197B de parámetros con los rechazos de seguridad neutralizados, para investigación sobre alineación y abliteration.
- Investigación sobre cuantización de tablas Engram: comparar el impacto en calidad entre tablas Engram IQ4_NL y MXFP8 (FP8 original) en el mismo backbone, gracias a la verificación byte-exacta documentada.
- Estudio de abliteration en modelos de gran escala: el pipeline ISTA-DASLab → Abiray → Starw1 ofrece una cadena trazable de versiones para analizar cómo afecta la neutralización de capas de rechazo al comportamiento del modelo.
- Pruebas de reproducibilidad: los scripts en `tools/` y el `verification.log` permiten reproducir la verificación de las 768M de filas en CPU, útil para validar herramientas como Strata.
- Experimentación con hardware de gama alta: usuarios con estaciones multi-GPU o grandes cantidades de RAM unificada pueden evaluar cuantizaciones extremas (IQ2_XXS) sobre un modelo enorme.
- Uso como base para cuantizaciones derivadas: al mantener el layout GGUF de ISTA, sirve de referencia para otras recompilaciones que quieran restaurar las tablas Engram a precisión completa.

No es adecuado para producción comercial convencional: es una cuantización extrema de una variante sin filtros, con los riesgos que ello implica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo pesa 341,3 GB. Con el backbone en IQ2_XXS (~2 bits por peso para ~197B de parámetros, en el orden de 50-60 GB) más las tablas Engram en MXFP8 (202,8 GB según la model card del oficial), el conjunto requiere en el orden de 250-340 GB de memoria entre VRAM y RAM, según la técnica de offloading empleada. Cifras exactas de inferencia: no disponible.
- GPU recomendadas: no disponible explícitamente. Por orden de magnitud, un modelo de este tamaño excede cualquier GPU de consumo individual (una RTX 4090 con 24 GB es insuficiente incluso para el backbone cuantizado con las tablas completas) y requiere estaciones multi-GPU de gama profesional (A100/H100 de 80 GB) o grandes cantidades de RAM de sistema con descarga parcial a GPU vía llama.cpp.
- Consumer GPU: no cabe íntegramente en ninguna GPU de consumo; solo sería viable con offloading masivo a RAM (equipos con 256-512 GB de memoria) y GPU auxiliar.
- Despliegue: llama.cpp (formato GGUF nativo) y la herramienta Strata para el empaquetado/verificación de tablas Engram. No hay información sobre compatibilidad con vLLM, TGI u Ollama; vLLM no soporta GGUF de forma general, por lo que llama.cpp es la vía principal.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Particularidad |
|---|---|---|---|---|
| Starw1/DeepSeek-V4.1-Flash-1017-Uncensored-...-MXFP8-Engram-GGUF | 196,6B (totales) | IQ2_XXS + Engram MXFP8 | MIT | Tablas Engram en precisión original FP8, variante uncensored |
| Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF | no disponible | IQ2_XXS + Engram IQ4_NL | no disponible | Backbone uncensored base de esta compilación |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | GSQ-RCO (GGUF) | no disponible | Cuantización original sobre la que se aplicó la abliteration |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | FP8 E4M3 (oficial) | no disponible | Modelo oficial, pesos completos, con filtros de seguridad |

La principal diferencia de esta ficha frente a sus predecesoras es la restauración de las tablas Engram a MXFP8 (precisión original) frente al IQ4_NL del backbone de Abiray, a cambio de un repositorio de 341,3 GB.

## Limitaciones y advertencias

- Variante uncensored/abliterated: el modelo no aplicará los rechazos de seguridad estándar. Su uso para generar contenido dañino es posible y es responsabilidad exclusiva del usuario; verificar la legalidad del uso en cada jurisdicción.
- Cuantización extrema IQ2_XXS en el backbone: una degradación notable de calidad respecto al modelo oficial FP8 es esperable (pérdida de razonamiento, mayor alucinación), aunque no hay mediciones publicadas.
- Riesgo de alucinación: no disponible cuantitativamente, pero agravado por la cuantización de 2 bits y la abliteration.
- Sesgos: no disponible; hereda los del modelo base DeepSeek-V4.1-Flash-1017, no documentados aquí.
- Idiomas y longitud de contexto: no disponibles en la información proporcionada.
- Requisitos de memoria muy elevados (341,3 GB de repo), lo que limita severamente quién puede ejecutarlo.
- Es una compilación comunitaria no oficial: no cuenta con soporte de DeepSeek y la fidelidad al modelo oficial depende de la verificación del autor (aunque documentada byte a byte).
- Licencia MIT declarada: permite uso comercial, pero la procedencia de los pesos (abliteration de un tercero sobre un modelo de DeepSeek) puede tener implicaciones legales o de términos de servicio del modelo original que conviene revisar.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/Starw1/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-MXFP8-Engram-GGUF
- Backbone uncensored base: https://huggingface.co/Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- Cuantización GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo oficial de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta Strata (verificación de Engram): https://github.com/Niko1221/Strata
