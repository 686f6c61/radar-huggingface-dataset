# xl-24/gemma4-4b-atc-finetune_sp_v2

## Resumen

`xl-24/gemma4-4b-atc-finetune_sp_v2` es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo de generación de texto derivado de la familia Gemma 4 de Google, en su variante E4B (eficiente, aproximadamente 4.000 millones de parámetros) y en versión instruida (it). El autor lo ha entrenado con la librería Unsloth, que aplica optimizaciones de memoria y velocidad para fine-tuning sobre GPUs de consumo, y lo distribuye bajo licencia Apache 2.0.

La información pública disponible es muy escasa: la model card se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento empleada, sin detallar el dataset, el número de tokens de entrenamiento, hiperparámetros ni resultados de evaluación. El nombre del repositorio sugiere un ajuste orientado a un dominio concreto (posiblemente "atc" como sigla de un caso de uso específico y "sp" como indicador de idioma o especialidad), pero el autor no lo documenta. El repositorio ocupa 0,2 GB, lo que es coherente con pesos cuantizados o con un adaptador LoRA fusionado de pequeño tamaño, aunque no se especifica el formato exacto de los pesos publicados.

Su relevancia es limitada y de nicho: sirve como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre Gemma 4 y como posible punto de partida para quien quiera reproducir o continuar el ajuste. No obstante, la ausencia de documentación, de métricas y de casos de uso declarados hace que no sea recomendable para producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E4B); detalles no disponibles |
| Parametros totales | Aproximadamente 4.000 millones (según nomenclatura E4B del modelo base); cifra exacta no disponible |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base está en bnb-4bit (bitsandbytes 4 bits); cuantizaciones publicadas para este fine-tune: no disponibles |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags del repositorio); tamaños y variantes no disponibles |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, es decir, un transformer decoder-only de la familia Gemma 4 en su variante E4B, previamente cuantizado a 4 bits con bitsandbytes y adaptado por Unsloth para entrenamiento eficiente. Sobre esa base, xl-24 ha realizado un fine-tuning supervisado (SFT) empleando las herramientas de Unsloth y TRL, según los tags del repositorio. No se especifica si se aplicó LoRA, QLoRA u otra técnica, ni si hubo etapas de alineación adicionales como DPO o RLHF.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, la mezcla de idiomas ni los hiperparámetros utilizados. Tampoco se documentan innovaciones técnicas propias más allá del uso de Unsloth para acelerar el entrenamiento (el autor afirma que se entrenó "2x faster" con esa librería). Cualquier afirmación sobre decodificación especulativa, atención lineal u otras optimizaciones del modelo base correspondería a Gemma 4 y no está confirmada en esta ficha.

## Capacidades

- Generación de texto en inglés, heredada del modelo base instruido Gemma 4 E4B.
- Razonamiento y respuesta a instrucciones: al derivar de una variante "it", conserva presumiblemente la capacidad de seguir instrucciones, aunque no hay evaluación que lo confirme.
- Generación de código y matemáticas: capacidad esperable del base, no verificada en este fine-tune.
- Tool calling / function calling: no documentado para este modelo.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara únicamente inglés; no se confirman otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- El nombre del repositorio sugiere una especialización ("atc", "sp") que el autor no describe, por lo que no puede atribuírsele ninguna capacidad adicional concreta.

## Casos de uso

- Experimentación con fine-tuning sobre Gemma 4: sirve como referencia práctica de un pipeline Unsloth + TRL sobre un modelo Gemma 4 cuantizado, útil para desarrolladores que quieran replicar el flujo.
- Punto de partida para ajustes posteriores: al ser Apache 2.0 y de pequeño tamaño (0,2 GB en el repo), puede emplearse como base para continuar el entrenamiento en un dominio específico.
- Pruebas de integración con transformers y TGI: los tags indican compatibilidad con text-generation-inference y endpoints, lo que permite validar despliegues ligeros en infraestructura de prueba.
- Evaluación comparativa de fine-tunes comunitarios: útil en estudios sobre calidad de ajustes no documentados frente a sus modelos base.
- Prototipado de asistentes en inglés de baja latencia: un modelo de ~4B parámetros puede ejecutarse en GPUs de consumo para demos internas, siempre que se valide su calidad.
- Docencia y formación: ejemplo de model card incompleta que ilustra la importancia de documentar datasets, métricas y limitaciones en la publicación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~4B parámetros: en FP16 en torno a 8-10 GB; en 4 bits en torno a 3-4 GB, más overhead de contexto y runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar funcionamiento en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100, pero no está verificado para este fine-tune concreto.
- GPU de consumo: probablemente sí en modelos de 8-12 GB de VRAM en cuantización de 4 bits, sujeto a prueba.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag) y, previsiblemente, llama.cpp/Ollama si se generan GGUF, aunque no se publican conversiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xl-24/gemma4-4b-atc-finetune_sp_v2 | ~4B (E4B) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune comunitario sin documentación ni métricas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | ~4B (E4B) | no disponible | Apache 2.0 (según repo base) | Hugging Face, ampliamente usado | Modelo base instruido, cuantizado a 4 bits, con documentación de Unsloth |
| Gemma 4 E4B-it (original de Google) | ~4B (E4B) | no disponible | Términos de Gemma (no Apache 2.0 en el original) | Hugging Face / Kaggle | Referencia oficial de la familia; documentación y evaluaciones publicadas por Google |

La comparación se limita a estos tres por falta de datos verificables sobre modelos equivalentes de otros autores en el mismo nicho. No se dispone de métricas para comparar rendimiento.

## Limitaciones y advertencias

- Documentación mínima: no hay información sobre dataset, hiperparámetros ni evaluación, lo que impide conocer qué comportamiento se ha modificado respecto al base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica no puede acotarse.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, que se desconoce.
- Idioma: solo se declara inglés; el uso en castellano no está soportado oficialmente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base y sus dependencias (Gemma 4 original, Unsloth, bitsandbytes) no impongan restricciones adicionales.
- Formato de pesos: el repositorio de 0,2 GB sugiere pesos cuantizados o un adaptador; debe comprobarse la compatibilidad con el pipeline de despliegue previsto antes de usarlo.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.
- No apto para producción sin evaluación previa: la ausencia de benchmarks y de casos de uso declarados desaconseja su uso directo en sistemas críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-4b-atc-finetune_sp_v2
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Paper, blog o demo específicos de este fine-tune: no disponibles
