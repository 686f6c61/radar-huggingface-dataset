# Studio-Research-M1/Feyospace-s1-obliterated-oQ6e-FP16-MTP-MLX

## Resumen

Feyospace s1 obliterated — oQ6e · FP16 · MTP (MLX) es una cuantización mixta, pensada para Apple Silicon, del modelo OBLITERATUS/feyospace-s1-obliterated, una versión "abliterada" orientada a ciberseguridad de feyospace/feyospace-v1.1-small, un modelo de 28 mil millones de parámetros basado en la arquitectura Qwen3.5 con capacidades de imagen-texto-a-texto. El repositorio actual corresponde a la variante oQ6e (24,64 GB), el punto medio de una familia de tres cuantizaciones (oQ4e, oQ6e y oQ8e) publicada por Studio-Research-M1.

Su relevancia radica en dos aspectos: primero, adapta un modelo de 28B a hardware Apple Silicon de primera generación (M1/M1 Pro/M1 Max), que carece de BF16 hardware, usando escalas y tensores no cuantizados en FP16 y la torre de visión en FP32; segundo, conserva la cabeza MTP (multi-token prediction) de 29 tensores, lo que permite decodificación especulativa lista para usar en motores compatibles como oMLX Lightning MTP.

El modelo base ha sido abliterado (se han eliminado sus mecanismos de rechazo por seguridad) con foco en ciberseguridad, por lo que responde sin filtros a consultas de este dominio. Esto lo hace útil para investigación ofensiva/defensiva, pero exige un manejo responsable y aware de los riesgos legales y éticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (image-text-to-text, con torre de visión) |
| Parametros totales | 27.781.427.952 (≈ 27,8B, según safetensors del repo) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (la familia Qwen3.5 suele usar 32.768; no confirmado en la ficha) |
| Tipos de cuantizacion | oQ6e (mixta: escalas/bias/tensores de texto no cuantizados en FP16, torre de visión en FP32); familia disponible en oQ4e (18,0 GB), oQ6e (24,6 GB) y oQ8e (30,9 GB) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX, formato oQ) |

## Arquitectura y entrenamiento

El modelo deriva de feyospace-v1.1-small (28B, arquitectura Qwen3.5), un modelo multimodal con torre de visión, al que se aplicó una abliteración orientada a ciberseguridad para eliminar los rechazos de seguridad. Sobre ese modelo base, Studio-Research-M1 generó cuantizaciones "oQ" de precisión mixta: los tensores de texto no cuantizados, escalas y bias están en FP16 (por la ausencia de BF16 hardware en GPUs M1), la torre de visión se conserva en FP32 (333 tensores) y la cabeza MTP se mantiene cuantizada (29 tensores) para habilitar decodificación especulativa.

En cuanto a calidad de cuantización, el autor reporta KLD medio frente al BF16 original de 0,0266 para oQ4e y 0,00161 para oQ8e (el valor exacto de oQ6e no se detalla, aunque por interpolación estaría entre ambos). Se verificó que la perplejidad y el KLD permanecen finitos sobre 32.768 posiciones de WikiText-2, sin salidas degeneradas (`!!!!`) en pruebas rápidas. No hay información disponible sobre los datos de preentrenamiento, el número de tokens ni el uso de RLHF/DPO en el modelo original.

## Capacidades

- Generación de texto conversacional en inglés, sin filtros de rechazo (abliterado), orientado al dominio de ciberseguridad.
- Entrada multimodal imagen-texto: conserva los pesos de la torre de visión (FP32, 333 tensores), aunque la model card indica que la visión no ha sido evaluada y advierte de una nota de compatibilidad sobre los ficheros de procesador.
- Decodificación especulativa mediante la cabeza MTP conservada (29 tensores), funcional de serie en motores compatibles como oMLX Lightning MTP; en la variante oQ6e el MTP está desactivado por defecto según la tabla del autor.
- Carga directa en motores del ecosistema MLX: oMLX, LM Studio y `mlx_lm.load`.
- No hay información disponible sobre tool calling, agentes ni capacidades de razonamiento estructurado (thinking mode).

## Casos de uso

- Investigación en ciberseguridad ofensiva y defensiva: al estar abliterado con foco en seguridad, puede responder consultas técnicas sobre vulnerabilidades, explotación o hardening sin rechazos, útil en entornos de investigación controlados y con autorización.
- Análisis de código y auditoría de seguridad local: ejecutado íntegramente en un Mac, permite revisar código en busca de patrones inseguros sin enviar nada a la nube, aprovechando la cuantización oQ6e como compromiso entre fidelidad y memoria.
- Asistente técnico privado en Apple Silicon: la variante oQ6e (24,64 GB) cabe en Macs con 32 GB de memoria unificada, ofreciendo un asistente conversacional con más fidelidad que oQ4e sin el coste de memoria de oQ8e.
- Pruebas de decodificación especulativa: gracias a la cabeza MTP conservada, es un buen banco de pruebas para medir aceleración por MTP en oMLX Lightning MTP sobre chips Apple.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, en principio puede aceptar entradas imagen-texto (por ejemplo, capturas de consolas, diagramas o informes), sujeto a la advertencia de compatibilidad del procesador.
- Benchmarking de cuantizaciones: el conjunto oQ4e/oQ6e/oQ8e con KLD documentado frente a BF16 sirve como referencia para estudiar el impacto de la cuantización en modelos de 28B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de calidad publicados son mediciones de fidelidad de cuantización frente al BF16 original:

| Métrica | oQ4e | oQ6e | oQ8e |
|---|---|---|---|
| KLD medio vs BF16 | 0,0266 | no disponible | 0,00161 |
| Tamaño del repo | 18,0 GB | 24,64 GB | 30,9 GB |
| Perplejidad WikiText-2 (32.768 posiciones) | finita | finita | finita |
| Salidas degeneradas en smoke tests | no | no | no |

## Requisitos de hardware

- Memoria unificada estimada: la variante oQ6e ocupa 24,64 GB en disco; para inferencia cómoda con KV cache se recomiendan al menos 32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon, optimizado en primer lugar para M1, M1 Pro y M1 Max (GPUs sin BF16 hardware, de ahí el uso de FP16). Hay builds BF16 anunciadas para chips M2 a M5.
- Consumer hardware: sí, cabe en Macs de consumo con 32 GB de RAM unificada; en oQ4e (18,0 GB) podría funcionar en máquinas de 24 GB con ajustes de contexto.
- Despliegue: oMLX (con soporte Lightning MTP), LM Studio y `mlx_lm.load` de la librería mlx-lm. No se menciona soporte para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; el autor indica que oQ4e es la variante más rápida (especialmente en código con MTP) y que oQ6e funciona con MTP desactivado, lo que sugiere un throughput inferior a oQ4e con MTP activo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantización / tamaño | Multimodal | MTP | Licencia |
|---|---|---|---|---|---|
| Feyospace s1 obliterated oQ6e (este) | 27,8B | oQ6e, 24,64 GB (MLX) | Sí (visión no evaluada) | Sí (desactivado en oQ6e) | Apache 2.0 |
| Feyospace s1 obliterated oQ4e | 27,8B | oQ4e, 18,0 GB (MLX) | Sí | Sí (activo) | Apache 2.0 |
| Feyospace s1 obliterated oQ8e | 27,8B | oQ8e, 30,9 GB (MLX) | Sí | Sí (activo) | Apache 2.0 |

No hay datos suficientes para comparar con modelos de otras familias (Qwen3.5 oficiales u otros 28B abliterados), ya que no se publican benchmarks comunes; no disponible.

## Limitaciones y advertencias

- Abliteración: el modelo ha sido modificado para eliminar sus salvaguardas de seguridad. Esto implica riesgo elevado de generar contenido dañino y posibles implicaciones legales; úsese solo en contextos de investigación autorizados.
- Sesgos: no disponible; al eliminarse los filtros, los sesgos del modelo base pueden manifestarse sin mitigación.
- Alucinaciones: riesgo no cuantificado; al tratarse de una cuantización, la fidelidad respecto al BF16 es alta (KLD documentado), pero no hay evaluaciones de exactitud factual.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está evaluado.
- Visión: los pesos de la torre de visión se conservan, pero no han sido evaluados y existen advertencias de compatibilidad con los ficheros de procesador; no se garantiza funcionamiento multimodal.
- MTP: en la variante oQ6e está desactivado según la documentación del autor; para decodificación especulativa conviene oQ4e u oQ8e.
- Ecosistema: formato MLX exclusivo de Apple Silicon; no cargable directamente en vLLM, TGI o llama.cpp.
- Procedencia: modelo con descargas muy bajas (24) y autor poco conocido; conviene auditar los pesos antes de uso serio.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Studio-Research-M1/Feyospace-s1-obliterated-oQ6e-FP16-MTP-MLX
- Variante oQ4e: https://huggingface.co/Studio-Research-M1/Feyospace-s1-obliterated-oQ4e-FP16-MTP-MLX
- Variante oQ8e: https://huggingface.co/Studio-Research-M1/Feyospace-s1-obliterated-oQ8e-FP16-MTP-MLX
- Colección completa: https://huggingface.co/collections/Studio-Research-M1/feyospace-s1-obliterated-28b-oq-mlx-apple-silicon-6ae4d395d2f87e2ae7ec4e5d
- Modelo base (abliterado): https://huggingface.co/OBLITERATUS/feyospace-s1-obliterated
- Modelo original: https://huggingface.co/feyospace/feyospace-v1.1-small
