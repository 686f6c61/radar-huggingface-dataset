# Yrkelia/UnslopSmall-22B-Persona-Final-Merged

## Resumen

UnslopSmall-22B-Persona-Final-Merged es un modelo de generacion de texto publicado por el usuario Yrkelia en Hugging Face, derivado mediante fine-tuning de Yrkelia/UnslopSmall-22B-Persona-v2-Merged. La model card se limita a la plantilla estandar generada por Unsloth y no aporta informacion sobre el proceso de entrenamiento, los datos utilizados ni las capacidades reales del modelo. Por la nomenclatura y las etiquetas (mistral, 22B), se trata presumiblemente de un modelo de la familia Mistral de aproximadamente 22 mil millones de parametros, pero este dato no esta confirmado en la informacion disponible.

El modelo se distribuye bajo licencia Apache 2.0, declara unicamente el idioma ingles y esta orientado a generacion de texto conversacional. Su relevancia practica es limitada: cuenta con cero descargas y cero likes en el momento de la consulta, fue creado y actualizado el mismo dia (16 de noviembre de 2026) y no incluye documentacion tecnica, benchmarks ni guia de uso. Debe tratarse como un experimento de fine-tuning personal, no como un modelo listo para produccion.

La informacion disponible es insuficiente para verificar arquitectura exacta, contexto, composicion del dataset o calidad de los pesos. Esta ficha refleja exclusivamente lo que el autor declara y marca como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta "mistral"; detalles no disponibles) |
| Parametros totales | 22B segun el nombre del modelo; no confirmado en la model card |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las etiquetas de Hugging Face incluyen "mistral", lo que sugiere una base de la familia Mistral, y el nombre indica un tamano de 22B. No obstante, no se especifica si se trata de un transformer denso, de un modelo con atencion de ventana deslizante, de un MoE ni de ninguna variante hibrida. Tampoco se detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni vocabulario.

Respecto al entrenamiento, lo unico declarado es que el modelo fue afinado con Unsloth y la libreria TRL de Hugging Face, con la afirmacion de que el entrenamiento fue "2x mas rapido" gracias a Unsloth. No se indica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO, SFT u otra tecnica de alineamiento, ni si se aplicaron merges de modelos (a pesar del sufijo "Merged" en el nombre). No hay informacion sobre la innovacion tecnica ni sobre el pipeline de datos.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" y el pipeline text-generation.
- Compatibilidad declarada con text-generation-inference (TGI) y con transformers.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo se declara ingles.
- No se documenta vision, audio, thinking mode ni ninguna capacidad especial.
- No se documenta capacidad de codigo ni de matematicas de forma explicita.

## Casos de uso

- Prototipado de chatbots conversacionales en ingles: el modelo puede emplearse como base para experimentar con respuestas multi-turno, aunque sin datos de contexto ni de calidad no es recomendable para entornos con usuarios reales.
- Investigacion sobre fine-tuning con Unsloth y TRL: sirve como ejemplo de pipeline de ajuste eficiente en memoria para modelos de ~22B, util para reproducir el flujo de entrenamiento.
- Evaluacion comparativa de merges de modelos: dado el sufijo "Merged", puede usarse en experimentos academicos sobre tecnicas de model merging y su efecto en la coherencia conversacional.
- Generacion de texto creativo en ingles en entornos controlados: borradores, lluvia de ideas o textos cortos, siempre con revision humana dado el riesgo de alucinacion.
- Base para posteriores fine-tunings de dominio: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para ajustes especificos, aunque la falta de documentacion complica la reproducibilidad.
- Pruebas de integracion con TGI y transformers: permite validar despliegues de inferencia con la libreria estandar, si bien no hay garantias de rendimiento ni de estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo denso de 22B en FP16 se necesitarian aproximadamente 44 GB de VRAM solo para pesos; en cuantizacion de 8 bits, unos 22 GB; en 4 bits, unos 11-12 GB. Estas cifras son estimaciones genericas basadas en el tamano nominal y no estan confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, serian necesarias GPUs con 48 GB o mas (A6000, A100 40/80 GB, H100) para FP16; para cuantizacion 4 bits podria caber en una RTX 4090 (24 GB) o similar.
- Cabe en consumer GPU: probablemente en RTX 4090 o RTX 3090 solo con cuantizacion agresiva, segun el tamano nominal; no confirmado.
- Opciones de despliegue: transformers y text-generation-inference (TGI) segun las etiquetas; no se mencionan llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| UnslopSmall-22B-Persona-Final-Merged | 22B (segun nombre) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Mistral Small (referencia de familia) | ~22-24B | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Modelos de 20-30B de la familia Llama | ~20-30B | no disponible en esta ficha | licencia Llama | Hugging Face |

La comparativa es limitada porque no hay datos publicados de rendimiento del modelo evaluado ni de sus alternativas en la informacion proporcionada. No se dispone de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay informacion sobre datos de entrenamiento, contexto, arquitectura ni evaluacion, lo que impide validar su calidad.
- Riesgo elevado de alucinacion: sin benchmarks ni evaluaciones, no hay evidencia de fidelidad factual.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no se pueden identificar sesgos de genero, raza, idioma o dominio.
- Limitacion idiomatica: solo se declara ingles; el uso en castellano no esta soportado oficialmente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Cero adopcion: 0 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad.
- Fecha de creacion futura respecto a la consulta (2026-11-16): conviene verificar la integridad y procedencia de los pesos antes de usarlos.
- No hay evidencia de que el sufijo "Merged" corresponda a un merge real ni de que los pesos sean estables para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Yrkelia/UnslopSmall-22B-Persona-Final-Merged
- Modelo base: https://huggingface.co/Yrkelia/UnslopSmall-22B-Persona-v2-Merged
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): no disponible en la informacion proporcionada
