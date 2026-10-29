# Ssum-mer/qwen3.8-27b-growpath-Q4

## Resumen

GrowPath Q4 es la versión cuantizada en GGUF del modelo Ssum-mer/qwen3.8-27b-growpath (V18), un ajuste fino sobre una base Qwen3.8 de aproximadamente 27.000 millones de parámetros (26.895.998.464 exactos) orientado a generación de texto en coreano e inglés. El autor lo etiqueta específicamente para "roadmap-generation", es decir, generación de hojas de ruta o planes estructurados, y lo publica bajo licencia Apache 2.0.

Técnicamente es un artefacto de cuantización, no un modelo nuevo: el autor partió del merge en BF16, lo convirtió a GGUF y aplicó una cuantización mixta de 4 bits del tipo Q4_K_M, sin necesidad de aplicar LoRA por separado. El resultado es un fichero único de 16.547.400.192 bytes (unos 16,5 GB) que reduce a menos de la mitad el espacio necesario frente a los pesos en BF16.

Su relevancia práctica es que permite ejecutar un modelo de ~27B en una sola GPU de 24 GB o en equipos con llama.cpp, algo inviable con el modelo original en BF16. La contrapartida es la falta de validación: el repositorio no tiene descargas ni valoraciones, y el propio autor advierte de que solo ha comprobado la carga y una generación corta en coreano sobre A100, sin una reevaluación completa de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer; la model card indica que la arquitectura de implementación se denomina qwen3_5 pese al nombre Qwen3.8 del repositorio. Detalles de capas y atención: no disponible |
| Parámetros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (mixta de 4 bits); no se documentan otras variantes en este repositorio |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único qwen3.8-27b-growpath-Q4.gguf, 16.547.400.192 bytes) |
| Modelo base | Ssum-mer/qwen3.8-27b-growpath (relación: quantized) |
| Versión del ajuste | V18; 2 épocas de entrenamiento según el autor |
| Revisión del modelo base | 66d1af509ab0681f3b9365227e5c794c65801fbf |
| SHA256 del fichero | 7626f16dc9237c04704011fc50c2b7e89a4d495c2cd1810f271746e96b1d9d16 |
| Tamaño del repositorio | 16,5 GB |
| Pipeline | text-generation |
| Fecha de creación | 2026-10-29 |

## Arquitectura y entrenamiento

La información disponible describe únicamente el proceso de cuantización: se partió del modelo original fusionado en BF16, se convirtió a formato GGUF y se aplicó una cuantización de precisión mixta de 4 bits (Q4_K_M). No se requiere aplicar ningún LoRA adicional sobre el resultado. El modelo base es un ajuste fino (V18) entrenado durante 2 épocas según confirmación del autor, pero no se detallan la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de alineación como RLHF o DPO.

El autor señala una discrepancia de nomenclatura relevante para la integración: el repositorio se llama Qwen3.8, mientras que la arquitectura de implementación corresponde a qwen3_5. No se especifican innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos) ni el mecanismo de atención empleado. Tampoco se incluye el proyector de visión, por lo que el modelo es exclusivamente de texto.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como conversational y endpoints_compatible, lo que sugiere compatibilidad con endpoints de inferencia estándar.
- Generación de hojas de ruta y planes estructurados: la etiqueta roadmap-generation indica un ajuste orientado a este tipo de salida.
- Coreano e inglés: ambos idiomas están declarados en la model card y en los metadatos del repositorio.
- Ejecución local en cuantización de 4 bits mediante el ecosistema GGUF.
- Sin capacidades de visión: el proyector de imagen no está incluido en el artefacto.
- Soporte de tool calling o function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información.

## Casos de uso

- Generación de itinerarios de aprendizaje: el ajuste V18 está orientado a "roadmap-generation", por lo que encaja en la producción de planes por fases con objetivos, hitos y recursos a partir de un perfil de usuario descrito en coreano o inglés.
- Planificación de proyectos en entornos coreanohablantes: el modelo puede redactar cronogramas y desgloses de tareas en coreano, un idioma con menos cobertura en modelos abiertos de este tamaño.
- Asistencia conversacional bilingüe coreano-inglés: con la etiqueta conversational y un formato GGUF, sirve para prototipar chatbots locales que alternan ambos idiomas sin depender de APIs externas.
- Documentación técnica bilingüe: generación y traducción de resúmenes, guías y notas de versión entre coreano e inglés en pipelines internos.
- Prototipado y evaluación offline: al ocupar 16,5 GB y ejecutarse en una GPU de 24 GB, permite validar prompts y plantillas de chat localmente antes de escalar al modelo BF16 en infraestructura mayor.
- Base para experimentos de cuantización: el repositorio incluye manifiesto de conversión y checksum, lo que facilita reproducir el proceso o comparar Q4_K_M frente a otras precisiones.
- Despliegue en endpoints compatibles: la etiqueta endpoints_compatible sugiere su uso tras servidores de inferencia con interfaz tipo OpenAI, útil para integrar el modelo en aplicaciones existentes.
- Generación de contenido educativo estructurado: temarios, planes de estudio y secuencias de módulos, aprovechando la especialización del ajuste en secuencias de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica únicamente que se verificaron la carga del modelo y una generación corta en coreano sobre A100, y advierte explícitamente de que esto no constituye una reevaluación completa de calidad. No existen datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de coreano para este artefacto cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q4_K_M ocupan 16,5 GB; con caché KV y overhead del runtime hay que prever aproximadamente 18-22 GB, cifra que crece con la longitud de contexto (estimación, no publicada por el autor).
- GPU verificada: A100, según la model card (carga y generación corta en coreano).
- GPU recomendadas: A100 40/80 GB, H100, A6000 48 GB para contexto amplio o varios usuarios concurrentes.
- GPU de consumo: sí cabe en RTX 4090 y RTX 3090 (24 GB) con contexto moderado; en tarjetas de 16 GB requeriría offload parcial a CPU y perdería rendimiento.
- CPU y RAM: ejecutable con llama.cpp en CPU, con un requisito de RAM en torno a 17-20 GB; el throughput sería notablemente inferior al de GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las vías habituales para GGUF. El soporte de GGUF en vLLM o TGI no se documenta en la información disponible.
- Latencia y throughput: no disponible, no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ssum-mer/qwen3.8-27b-growpath-Q4 (este) | ≈26,9B | No disponible | GGUF Q4_K_M, 16,5 GB | Apache 2.0 | Repositorio público, 0 descargas |
| Ssum-mer/qwen3.8-27b-growpath (base) | ≈26,9B | No disponible | No disponible (merge en BF16 según la model card) | Apache 2.0 | Repositorio público |
| Alternativas de otras familias de ≈27B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con modelos de otras familias. La única comparación fiable es interna: frente al modelo base en BF16, esta versión reduce el tamaño a 16,5 GB a costa de una pérdida de precisión no medida, y elimina la necesidad de aplicar LoRA por separado.

## Limitaciones y advertencias

- Ausencia de validación externa: el repositorio registra 0 descargas y 0 valoraciones, por lo que no hay evidencia de uso en producción ni informes de terceros.
- Evaluación incompleta por parte del autor: solo se comprobó la carga y una generación corta en coreano sobre A100; no hay evaluación sistemática de calidad, sesgos ni robustez.
- Pérdida de calidad por cuantización: Q4_K_M introduce degradación frente a BF16 que no ha sido cuantificada para este modelo concreto.
- Longitud de contexto desconocida: no debe asumirse una ventana amplia; es necesario verificar el valor en la configuración del GGUF antes de diseñar aplicaciones con contexto largo.
- Cobertura lingüística limitada: solo coreano e inglés están declarados; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sin capacidades multimodales: el proyector de visión no está incluido, de modo que no procesa imágenes pese a lo que pueda sugerir la familia Qwen.
- Ambigüedad de nomenclatura: el nombre del repositorio (Qwen3.8) no coincide con la arquitectura de implementación declarada (qwen3_5); conviene verificar tokenizer, plantilla de chat y compatibilidad con el runtime antes de desplegar.
- Riesgo de alucinación: no evaluado; en tareas de planificación estructurada conviene validar las salidas con comprobaciones programáticas.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero se recomienda revisar también los términos del modelo upstream sobre el que se construyó la base, no detallados en la información disponible.
- Trazabilidad: la fecha de creación del repositorio (29-10-2026) y el escaso historial dificultan verificar la procedencia y la reproducibilidad del ajuste, aunque se publican checksum y manifiesto de conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath-Q4
- Modelo base: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath
- Revisión concreta del modelo base: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath/tree/66d1af509ab0681f3b9365227e5c794c65801fbf
- Fichero GGUF: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath-Q4/blob/main/qwen3.8-27b-growpath-Q4.gguf
- Manifiesto de conversión a GGUF: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath-Q4/blob/main/gguf_conversion_manifest_Q4_K_M.json
- Checksum SHA256: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath-Q4/blob/main/qwen3.8-27b-growpath-Q4.gguf.sha256
- Paper, blog o demo adicionales: no disponible en la información proporcionada
