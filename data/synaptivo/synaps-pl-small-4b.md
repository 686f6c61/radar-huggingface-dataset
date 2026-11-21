# Synaptivo/Synaps-PL-Small-4B

## Resumen

Synaps-PL-Small-4B es un ajuste fino (fine-tune) en polaco del modelo Qwen/Qwen3.5-4B, desarrollado por Synaptivo sp. z o.o. y publicado bajo licencia Apache 2.0. El modelo parte de la arquitectura híbrida `Qwen3_5ForConditionalGeneration` de la base (32 capas, combinación de Gated DeltaNet y Gated Attention, contexto nativo de 262.144 tokens) y conserva sin modificar el codificador visual original, por lo que mantiene la capacidad de procesar entradas de imagen y texto.

El entrenamiento consistió en un SFT con adaptador LoRA (r=32, alpha=64, dropout 0,05, 61 millones de parámetros entrenados sobre 200 módulos lineales de la parte textual) durante una única época sobre 5.418 ejemplos derivados de 2.936 tareas sintéticas polacas verificadas programáticamente. El adaptador se fusionó posteriormente en pesos completos en `bfloat16` (escala de fusión 2.0), de modo que el modelo se sirve directamente en vLLM o transformers sin necesidad de cargar el adaptador por separado.

Su relevancia es acotada y muy específica: se trata de un modelo de 4.659.865.088 parámetros totales (unos 4,7 mil millones) orientado a tareas empresariales y lingüísticas en polaco, con un rendimiento medido por el propio autor que mejora a la base en las familias de tareas entrenadas pero que muestra regresiones en algunas familias no entrenadas, especialmente en modo razonamiento. No está pensado como modelo generalista multilingüe ni como sustituto de la base para tareas fuera de su distribución de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (híbrida: 32 capas, Gated DeltaNet + Gated Attention) |
| Parametros totales | 4.659.865.088 (aprox. 4,7 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos en la base; el autor recomienda servir con `max-model-len 32768` en vLLM y entrenó con `max_seq_len 4096` |
| Tipos de cuantizacion | no disponible (el autor publica únicamente pesos completos en `bfloat16`; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`bfloat16`, 2 archivos, aprox. 8,8 GB; repositorio de 9,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de la base Qwen3.5-4B: un transformer híbrido de 32 capas que alterna Gated DeltaNet (atención lineal con estado recurrente) y Gated Attention, con un contexto nativo declarado de 262.144 tokens. El pipeline declarado es `image-text-to-text`, y el codificador visual de la base se conserva sin modificar; el ajuste afecta únicamente a las capas textuales.

El entrenamiento (`s1-mix-ep1`) aplicó SFT con LoRA sobre los 200 módulos lineales de la parte textual (`attn`, `linear_attn`, `MLP`), con r=32, alpha=64, dropout 0,05 y 61 millones de parámetros entrenables. Los datos proceden de 2.936 tareas sintéticas polacas verificadas programáticamente, generadas por `Synaps-Bench-PL` v0.1.0 y la capa superficial `Synaps-Distill-PL` (split `train`, sin datos de clientes, solo entidades y cifras ficticias). Cada tarea se incluyó en variante con razonamiento y sin razonamiento, resultando en 5.418 ejemplos tras descartar secuencias de más de 4.096 tokens (incluida la familia `igla`) y 157 ejemplos de validación con partición agrupada. El cómputo total fue de 6,59 millones de tokens (2,82 millones de tokens de pérdida), 339 pasos con `grad_accum=16`, `lr=2e-4`, scheduler coseno con 15 pasos de warmup. La pérdida de validación bajó de 0,800 a 0,424 (modo OFF: 0,252 → 0,084; modo ON: 0,824 → 0,439). La fusión del adaptador se documenta en `synaps-merge.json`: 200 módulos, escala 2,0, SHA-256 del adaptador `0e64ee8d…`, fecha 2026-11-18.

## Capacidades

- Generación de texto conversacional en polaco, con especial énfasis en tareas empresariales y lingüísticas del dominio de entrenamiento.
- Procesamiento de entradas imagen-texto heredado de la base (codificador visual intacto), con el pipeline `image-text-to-text`.
- Modo de razonamiento (`thinking`) disponible a través de la plantilla de chat de Qwen, aunque el autor recomienda el modo directo (`enable_thinking=False`) por el olvido observado en modo razonamiento.
- Soporte de contexto largo a nivel de arquitectura (262.144 tokens nativos), si bien el ajuste se realizó con secuencias de hasta 4.096 tokens.
- Compatibilidad con servidores OpenAI-compatible (`endpoints_compatible` en los tags) y con `vLLM`, `transformers` y motores que soporten `Qwen3_5ForConditionalGeneration`.
- No se documentan capacidades específicas de tool calling, function calling ni agentes multi-paso en la información disponible; deben considerarse heredadas, en su caso, de la base y no verificadas por el autor.
- Capacidad multilingüe limitada: el modelo está ajustado exclusivamente para polaco.

## Casos de uso

- Asistencia documental en polaco: el modelo se entrenó con tareas de documentos y estados de documento, por lo que encaja en la extracción y resumen de campos en flujos administrativos o financieros en polaco, con la advertencia de que la familia `stan_dokumentu_po_zmianach` mostró regresiones en modo razonamiento.
- Conciliación de cuentas y verificación de cifras: tareas del tipo `uzgodnienie_rozrachunkow` están representadas en el conjunto de evaluación; útil para borradores de conciliación con revisión humana obligatoria, dado que esta familia registró una regresión estadísticamente significativa en modo OFF (−0,133 ± 0,043).
- Generación de borradores de código en contextos empresariales polacos: la familia `kod` aparece en los datos, aunque en modo razonamiento se observó olvido; adecuado para autocompletado asistido con validación posterior.
- Clasificación y normalización lingüística de textos polacos: el ajuste sobre tareas sintéticas verificadas programáticamente lo hace apto para etiquetado y normalización de entradas en pipelines de datos, siempre que el formato se parezca a los generadores de entrenamiento.
- Procesamiento de documentos con imagen: al conservar el codificador visual, puede emplearse en la transcripción y el análisis de documentos escaneados en polaco, con la cautela de que el ajuste no cubrió el dominio visual.
- Despliegue en infraestructura modesta: con 4,7 mil millones de parámetros en `bfloat16` (aprox. 8,8 GB de pesos), cabe en una GPU de 24 GB y permite servir una API compatible con OpenAI mediante vLLM.
- Evaluación comparativa interna: sirve como referencia de ajuste LoRA fusionado en polaco frente a la base Qwen3.5-4B, con métricas pareadas publicadas por el autor.

## Benchmarks y rendimiento

El autor publica mediciones propias en `Synaps-Bench-PL`, en configuración idéntica para base y ajuste (vLLM, FP8 online, modo texto, `max-model-len 40960`, k=3 semillas, temperature 0,7, top_p 0,95). La comparación es pareada sobre semillas comunes.

| Conjunto y modo | Base Qwen3.5-4B | Synaps-PL-Small-4B | Δ total | Δ 12 familias entrenadas | Δ 8 familias no entrenadas |
|---|---:|---:|---:|---:|---:|
| `dev-v1` OFF (p2, 120 tareas × 3 semillas) | 0,375 ± 0,042 | 0,517 ± 0,043 | +0,142 ± 0,035 | +0,322 ± 0,058 | −0,039 ± 0,020 |
| `dev-v1` OFF (p2b, repetición de umbrales) | — | — | — | +0,317 ± 0,059 | −0,044 ± 0,024 |
| `test-v1` OFF (holdout único, 640 tareas × 3 semillas) | 0,315 | 0,538 | +0,223 ± 0,016 | +0,362 ± 0,022 | +0,007 ± 0,015 |
| `test-v1` BF (budget-forcing / razonamiento, 640 tareas × 3 semillas) | 0,651 | 0,724 | +0,073 ± 0,015 | +0,201 ± 0,019 | −0,127 ± 0,018 |

Advertencias del propio autor: la mejora en las 12 familias entrenadas se mide sobre tareas de los mismos generadores que el conjunto de entrenamiento (semillas distintas) y refleja en gran medida el ajuste a plantillas y formatos, no una ventaja general. En modo OFF, el resultado en las 8 familias no entrenadas de `test-v1` no se distingue de la base más allá del ruido (+0,007 ± 0,015), pero en la familia no entrenada `uzgodnienie_rozrachunkow` hay una regresión estadísticamente significativa (−0,133 ± 0,043, test de signos p = 0,003). En modo BF (razonamiento) se observa olvido claro en familias no entrenadas (−0,127 ± 0,018), con regresiones en `stan_dokumentu_po_zmianach`, `kod`, `uzgodnienie_rozrachunkow` y `kod_stan_dokumentu_pl`.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en `bfloat16` ocupan aproximadamente 8,8 GB; con caché KV y overhead de servidor, se recomienda un mínimo de 16 GB de VRAM para contextos moderados y 24 GB o más para contextos largos.
- GPU recomendadas: A100 (40/80 GB) o H100 para servicio de producción con contexto largo; RTX 4090 (24 GB) para desarrollo y despliegue de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en tarjetas de 16 GB el margen es ajustado y depende de la longitud de contexto servida.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--dtype bfloat16 --max-model-len 32768 --language-model-only`), transformers con `AutoModelForImageTextToText` y `AutoProcessor`. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma directa con los artefactos publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synaps-PL-Small-4B | 4,66 mil millones | 262.144 nativos (servido a 32.768) | Ajuste SFT LoRA en polaco sobre Qwen3.5-4B | Apache 2.0 | Hugging Face (`Synaptivo/Synaps-PL-Small-4B`) |
| Qwen/Qwen3.5-4B | no disponible en la información | 262.144 | Modelo base multimodal imagen-texto | Apache 2.0 | Hugging Face (`Qwen/Qwen3.5-4B`) |
| Alternativas de 4B ajustadas a polaco | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos cuantitativos disponibles es frente a su modelo base, recogida en la sección de benchmarks. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos sintéticos con entidades y cifras ficticias, el modelo puede no reflejar la distribución real de documentos empresariales polacos.
- Riesgo de alucinación: no cuantificado; el ajuste sobre plantillas sintéticas puede favorecer respuestas con formato correcto pero contenido inventado en tareas fuera de distribución.
- Regresión medida en familias no entrenadas: en modo OFF, `uzgodnienie_rozrachunkow` cae −0,133 ± 0,043 (p = 0,003); en modo BF hay olvido generalizado en familias no entrenadas (−0,127 ± 0,018), con regresiones en `stan_dokumentu_po_zmianach`, `kod`, `uzgodnienie_rozrachunkow` y `kod_stan_dokumentu_pl`.
- El autor recomienda explícitamente el modo directo (`enable_thinking=False`); el modo razonamiento degrada el rendimiento en tareas no entrenadas.
- Limitación de idioma: ajustado exclusivamente para polaco; no debe esperarse calidad equivalente en castellano ni en otros idiomas.
- Limitación de contexto práctico: aunque la arquitectura soporta 262.144 tokens, el entrenamiento usó `max_seq_len` de 4.096 y se descartaron secuencias más largas (incluida la familia `igla`), por lo que el comportamiento más allá de esa longitud no está validado.
- El codificador visual no fue ajustado; las capacidades imagen-texto son las de la base y no han sido evaluadas por el autor en el modelo fusionado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene conservar los avisos de licencia y verificar las obligaciones heredadas de la base Qwen3.5-4B.
- Las métricas publicadas proceden del entorno del autor y de conjuntos generados por sus propios generadores; no son comparables con benchmarks estándar de terceros.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synaptivo/Synaps-PL-Small-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
