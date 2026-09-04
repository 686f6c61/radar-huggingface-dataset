# the-acai/iki-gemma-cleanup

## Resumen

El modelo `the-acai/iki-gemma-cleanup` es un fine-tune especializado en la limpieza de transcripciones de dictado, desarrollado por `the-acai` para su aplicación Iki, un software de dictado local para macOS. Está construido sobre el modelo base `google/gemma-4-E2B-it`, un transformer decoder-only de aproximadamente 5.031 millones de parámetros, y se distribuye cuantizado en formato GGUF (Q4_0) para su ejecución eficiente con llama.cpp.

El problema que resuelve es el post-procesamiento de texto crudo generado por reconocimiento de voz: elimina muletillas, corrige puntuación, normaliza convenciones numéricas y estructura el contenido sin inventar información. Su relevancia radica en que ofrece una mejora sustancial frente al modelo base en tareas de limpieza de dictado (exact match del 54,7% al 73,6%) manteniendo una latencia baja (p95 de 509 ms), lo que lo hace apto para ejecución en dispositivos locales sin conexión a la nube.

El entrenamiento se realizó con QLoRA (r32/α32, 3 épocas) sobre un dataset sintético y público de 9.151 filas, sin datos de usuarios ni información de salud protegida. El modelo está pensado como componente de un pipeline de dictado on-device, no como un modelo generalista de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de google/gemma-4-E2B-it) |
| Parametros totales | 5.031.222.819 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (GGUF) |
| Idiomas soportados | no disponible (el corpus de entrenamiento incluye wikitext-103, en ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors (pesos del fine-tune) y GGUF (Q4_0) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer decoder-only con aproximadamente 5.000 millones de parámetros. Sobre él se aplicó un fine-tune con QLoRA (rank 32, alpha 32) durante 3 épocas, fusionando los adaptadores en los pesos base y cuantizando posteriormente a Q4_0 mediante llama.cpp. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores.

El dataset de entrenamiento es completamente sintético y público, generado con la herramienta `iki-bench generate-cleanup-dataset` (dataset v6, 9.151 filas). Incluye líneas sintéticas de ámbitos clínico y de trabajo social, líneas con convenciones numéricas, referencias del benchmark de Iki y una muestra de wikitext-103 (CC BY-SA). Estas muestras fueron corrompidas con el generador de Iki para simular errores típicos de dictado. La innovación principal no es arquitectónica, sino de especialización: un modelo pequeño y cuantizado que mejora significativamente la limpieza de transcripciones en un dominio concreto.

## Capacidades

- Limpieza de transcripciones de dictado: elimina muletillas, corrige puntuación y estructura el texto dictado en formato legible.
- Normalización de convenciones numéricas: alcanza 28/31 en el conjunto golden de Iki, frente a 18/31 del modelo base.
- Preservación de profanidades: mantiene intactas las expresiones soeces en el 100% de los casos evaluados (20/20).
- Verificación de fidelidad: en la comprobación manual (50/50) no se detectó contenido inventado, lo que indica baja tendencia a alucinar en su tarea específica.
- Ejecución local y cuantizada: disponible en GGUF Q4_0, optimizado para llama.cpp y entornos on-device.
- No se han documentado capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Aplicación de dictado en macOS (Iki): el modelo se integra en la app para transformar transcripciones crudas en texto limpio y estructurado. Su baja latencia (p95 de 509 ms) permite una experiencia fluida.
- Documentación clínica asistida: gracias a las líneas sintéticas clínicas del entrenamiento, puede post-procesar notas dictadas por profesionales sanitarios, normalizando terminología y formato sin exponer datos de pacientes.
- Informes de trabajo social: las líneas sintéticas de social work permiten estructurar observaciones dictadas en informes legibles, reduciendo el tiempo de redacción manual.
- Normalización de texto con números: útil en contextos donde se dictan cantidades, fechas o identificadores, ya que el modelo mejora la conversión de convenciones numéricas.
- Post-procesamiento de salidas de ASR en tiempo real: al ejecutarse localmente con llama.cpp, puede integrarse en pipelines de transcripción para corregir errores de reconocimiento en streaming.
- Asistentes de dictado para dispositivos edge: el formato GGUF Q4_0 y el tamaño del repositorio (3,0 GB) permiten su despliegue en dispositivos con recursos limitados, como portátiles o teléfonos.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados en la model card, comparando el modelo fine-tune (`iki6`) con el modelo base `google/gemma-4-E2B-it` en cuantización Q4_0, evaluados con el harness de Iki:

| Metrica | Stock E2B Q4_0 | Iki cleanup (iki6) |
|---|---|---|
| Cleanup-corpus exact match | 54,7% | 73,6% |
| Numeral golden | 18/31 | 28/31 |
| Profanity preservation | no disponible | 20/20 |
| Hand check (contenido inventado) | no disponible | 0/50 |
| WER (word error rate) | dentro del ruido | dentro del ruido |
| p95 cleanup latency | 1531 ms | 509 ms |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~5B en Q4_0, los pesos ocupan aproximadamente 2,5–3,0 GB. Se recomienda un mínimo de 4 GB de VRAM y un margen de 6–8 GB para mayor comodidad.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), Apple Silicon (memoria unificada) o CPUs modernas con soporte AVX2 para ejecución con llama.cpp.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media con 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, o cualquier runtime compatible con GGUF. También puede usarse LiteRT-LM para despliegue en Android, como se hace en proyectos similares (Bidet AI).
- Latencia: p95 de 509 ms en el harness de Iki, aunque no se especifica el hardware de referencia. No hay datos de throughput disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exact match cleanup | Latencia p95 | Licencia |
|---|---|---|---|---|---|
| the-acai/iki-gemma-cleanup (Q4_0) | ~5,03 B | no disponible | 73,6% | 509 ms | gemma |
| google/gemma-4-E2B-it (stock, Q4_0) | ~5,03 B | no disponible | 54,7% | 1531 ms | gemma |
| Bidet AI (Gemma 4 E2B, LiteRT-LM) | ~5,03 B | no disponible | no disponible | no disponible | gemma |

El modelo Bidet AI no es comparable directamente, ya que se enfoca en reestructurar "brain-dump" (volcados de pensamiento) y no en limpieza de dictado. No se dispone de información sobre otras alternativas de limpieza de texto en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con datos sintéticos y públicos, por lo que su generalización a dominios reales no cubiertos puede ser limitada.
- La licencia `gemma` de Google impone restricciones de uso comercial que deben revisarse antes de desplegar el modelo en productos.
- No se ha publicado la longitud de contexto, por lo que el comportamiento con entradas largas es desconocido.
- Solo se ofrece la cuantización Q4_0; no hay otras versiones cuantizadas (Q8, Q5, etc.) disponibles en el repositorio.
- El corpus de entrenamiento es principalmente inglés (wikitext-103 y datos sintéticos), por lo que el rendimiento en otros idiomas no está garantizado.
- Aunque el hand check reportó cero contenido inventado, esto no elimina el riesgo de alucinación en usos no contemplados por el benchmark.

## Enlaces

- HuggingFace: https://huggingface.co/the-acai/iki-gemma-cleanup
- Repositorio de Iki: https://github.com/the-acai/iki
- Proyecto similar Bidet AI: https://github.com/MrB-Ed/bidet-ai
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
