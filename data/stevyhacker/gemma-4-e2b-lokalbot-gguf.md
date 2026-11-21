# stevyhacker/Gemma-4-E2B-LokalBot-GGUF

## Resumen

Gemma-4-E2B-LokalBot-GGUF es un fine-tune del modelo base `google/gemma-4-E2B` desarrollado por el usuario stevyhacker, publicado en formato GGUF y calibrado con imatrix. Su propósito es muy concreto: servir como motor de autocompletado inline (Cotyping) dentro de la aplicación LokalBot, con especial énfasis en inglés y serbio (tanto en alfabeto latino como cirílico), además de mantener capacidades básicas en alemán, francés y español. El modelo incorpora entrenamiento específico para el manejo de contexto visible ("Visible in this window:") y memoria persistente ("Relevant saved facts:").

La relevancia de esta ficha no reside en un modelo de propósito general, sino en un ejemplo de especialización extrema mediante LoRA sobre un modelo base de 4.647.450.147 parámetros. El autor reporta mejoras medibles en precisión de autocompletado (de 23,10% a 29,82% en el benchmark global de 788 checkpoints) y un salto notable en serbio latino (2,8× respecto al modelo base). El checkpoint recomendado es `Gemma-4-E2B-LokalBot-v2-i1-Q6_K.gguf`, que mantiene el mismo tamaño y velocidad que el modelo original cuantizado.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para despliegue local en dispositivos Apple Silicon (se reportan métricas sobre un M4 Max con Metal y llama.cpp). No obstante, la información disponible es limitada en cuanto a arquitectura interna del modelo base, datos de entrenamiento originales y benchmarks estándar de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `google/gemma-4-E2B`); fine-tune mediante LoRA de rango 32 sobre 275 matrices (205 proyecciones de atención/MLP + 70 matrices PLE) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (i1-Q6_K, calibrada con imatrix `gemma-4-E2B.imatrix.gguf`) |
| Idiomas soportados | en, sr (latino y cirílico), de, fr, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B`, un transformer del que no se detallan en la información proporcionada el número de capas, dimensión oculta ni longitud de contexto. El fine-tune se aplica como un LoRA de rango 32 (alpha=32, dropout=0.05) que cubre 275 matrices en las 35 capas del modelo base: las 205 proyecciones de atención y MLP, más las 70 matrices de Per-Layer Embedding (PLE), concretamente `per_layer_input_gate` y `per_layer_projection`. El adaptador se fusiona en fp32 con un factor de escala de 1,15 y se cuantiza a Q6_K mediante `llama.cpp v1.0.0`.

El entrenamiento emplea un objetivo de divergencia KL forward con tres regímenes (masa cubriente, no fundamentado y fundamentado), destilado con soft-logits en vivo desde `google/gemma-4-26B-A4B`. Los datos de entrenamiento son exclusivamente públicos: `FineWeb` y `FineWeb-2` (ODC-By) para serbio, alemán, francés, español e inglés, más ejemplos sintéticos bilingües bajo Apache 2.0 generados por `google/gemma-4-26B-A4B-it` (trabajo, coloquial, fundamentado y stale-override). El autor declara cero texto privado de usuarios y una descontaminación estricta de 4 capas contra todos los conjuntos de evaluación.

## Capacidades

- Autocompletado inline (Cotyping) en inglés y serbio (latino y cirílico), con métricas específicas de precisión en frontera de palabra y midword.
- Manejo de contexto visible ("Visible in this window:") con resolución de conflictos entre información actual y memoria obsoleta (stale-memory).
- Recuperación de memoria guardada ("Relevant saved facts:") con capacidad de abstención controlada y cero recuperaciones falsas reportadas.
- Generación de texto bilingüe y multilingüe limitada a en, sr, de, fr, es.
- Capacidad de guardia de idioma (guard_langs) para DE/FR/ES, con 95,8% en el conjunto ciego.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Autocompletado en editores de código y texto para inglés: el modelo está entrenado específicamente para predecir la continuación en la frontera del cursor, con 61,11% de precisión en el benchmark midword `q6pub_prod` (288 casos) y 31,09% de precisión global en inglés (624 casos).
- Autocompletado para serbio en alfabeto latino: con 21,21% de precisión (2,8× el modelo base), es adecuado para aplicaciones de escritura en serbio latino donde el modelo original fallaba.
- Autocompletado para serbio en alfabeto cirílico: 17,24% de precisión (2,0× el base) y cero deriva hacia cirílico ruso, lo que lo hace útil en herramientas de escritura para usuarios serbios.
- Asistentes de escritura con memoria de contexto: el modelo resuelve conflictos entre hechos guardados obsoletos y el contexto visible actual (4/4 en heldout, 0 hechos obsoletos), adecuado para aplicaciones de notas o chat que mantienen memoria persistente.
- Aplicaciones de escritura multilingüe con guardia de idioma: útil en entornos donde se mezclan DE/FR/ES y se necesita que el modelo no derive a otro idioma (95,8% en guard_langs).
- Despliegue local en Apple Silicon: con 3,845 GB en Q6_K, 398 ms de carga y 23,7 ms de latencia mediana de frontera en M4 Max con Metal, es viable para autocompletado en tiempo real en portátiles y equipos de sobremesa Apple.
- Prototipado de motores de autocompletado con llama.cpp: al ser un GGUF compatible con `endpoints_compatible`, puede integrarse en pipelines existentes de llama.cpp sin cambios de infraestructura.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor, medidos sobre Apple M4 Max con el binario de producción de LokalBot y `llama.cpp v1.0.0`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Benchmark / Pilar | Stock i1-Q6_K | v1 (s=1.0) | v2-PLE (s=1.15) | Δ v2 vs stock |
|---|---:|---:|---:|---:|
| Engine Overall (788) acc / cov / prec | 23,10% / 46,1% / 50,1% | 25,13% / 48,0% / 52,4% | 29,82% / 57,4% / 52,0% | +6,72 pp acc / +1,85 pp prec |
| English (624) acc / prec | 25,32% / 49,5% | 26,44% / 50,2% | 31,09% / 51,9% | +5,77 pp / +2,34 pp |
| Other Languages (164) acc / prec | 14,63% / 54,6% | 20,12% / 67,4% | 25,00% / 52,6% | +10,37 pp |
| Serbian Latin (66) | 7,58% | 12,12% | 21,21% | +13,63 pp (2,8×) |
| Serbian Cyrillic (58) | 8,62% | 10,34% | 17,24% | +8,62 pp (2,0×) |
| Multilingual (40) | 35,00% | 47,50% | 42,50% (73,9% prec) | +7,50 pp |
| Midword q6pub_prod (288) | 56,94% | 58,33% | 61,11% (72,1% prec) | +4,17 pp |
| Midword prefixconf_prod heldout (288) | 52,78% | 52,43% | 53,82% (acc2 20,1%) | +1,04 pp |
| Visible Context Dev / Heldout / Link | 6/8 / 14/18 / 3/4 | 8/8 / 17/18 / 4/4 | 8/8 / 18/18 / 4/4 | +4/18 (0 stale, 0 forb) |
| Memory Heldout Recall / Abstention | 12/12 / 10/10 | 12/12 / 10/10 | 12/12 / 10/10 (0 false) | 100% / 100% |
| dev_diagnostic_v1 (120) acc / prec | 72,50% / - | 80,00% / 95,1% | 88,33% / 95,5% (0 forb/leak) | +15,83 pp |
| Frozen Blind fresh_holdout_v1 (160) | 73,13% (84,8% prec) | 77,50% (89,9% prec) | 81,25% (89,7% prec, 0 leak) | +8,12 pp |
| Blind sr_cyrl / sr_latn | 66,7% / 70,0% | 66,7% / 70,0% | 79,2% / 76,7% | +12,5 / +6,7 pp |
| Blind grounded / stale / guard | 50,0% / - / 91,7% | 72,7% / 85,7% / 95,8% | 77,3% / 92,9% / 95,8% | +27,3 / +4,1 pp |
| Hard Safety Checks (28) | 0 unsafe, 0 err | 0 unsafe, 0 err | 0 unsafe, 0 err, 0 RU drift | Pass |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K ocupa 3.845.322.976 bytes (3,845 GB); en GPU se necesita espacio adicional para el contexto KV, no cuantificado en la información disponible.
- GPU recomendadas: el autor reporta métricas sobre Apple M4 Max con Metal; no se especifican GPU NVIDIA o AMD en la información disponible.
- Cabe en GPU de consumo: con 3,845 GB de pesos en Q6_K, es viable en GPUs de consumo con 6-8 GB de VRAM o más; no se detallan modelos concretos probados.
- Opciones de despliegue: `llama.cpp v1.0.0` (versión reportada por el autor); el tag `endpoints_compatible` sugiere compatibilidad con endpoints estándar, aunque no se detallan vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: 398 ms de tiempo de carga y 23,7 ms de latencia mediana de frontera en Apple M4 Max Metal; no se reporta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Gemma-4-E2B-LokalBot v2 (este) | 4.647.450.147 | no disponible | Apache 2.0 | GGUF Q6_K | Fine-tune para autocompletado en/sr; 29,82% engine overall |
| google/gemma-4-E2B (stock) | 4.647.450.147 | no disponible | Apache 2.0 (según model card) | safetensors / GGUF | Modelo base; 23,10% engine overall en el mismo benchmark |
| Gemma-4-E2B-LokalBot v1 | 4.647.450.147 | no disponible | Apache 2.0 | GGUF Q6_K | Versión anterior (s=1.0); 25,13% engine overall |

No se dispone de datos de otros modelos comparables de autocompletado especializado en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en autocompletado inline y no en generación de texto general; su rendimiento en tareas abiertas (razonamiento, código, matemáticas) no está documentado.
- Los benchmarks reportados son del propio autor y se midieron con las compuertas de producción de LokalBot y `add_bos=true`; no son comparables directamente con evaluaciones estándar de la comunidad.
- La longitud de contexto no se especifica, lo que impide planificar aplicaciones que requieran ventanas largas.
- El soporte multilingüe se limita a en, sr, de, fr y es; no hay datos sobre otros idiomas.
- El sesgo hacia serbio latino y cirílico es intencionado; en otros idiomas distintos del inglés el rendimiento cae (25,00% en "Other Languages" frente a 31,09% en inglés).
- Riesgo de alucinación en la recuperación de memoria: aunque el autor reporta 0 recuperaciones falsas en el conjunto de prueba, no hay evaluación independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `google/gemma-4-E2B` puede tener sus propias condiciones que deben verificarse por separado.
- El modelo se distribuye únicamente en GGUF Q6_K; no hay versiones en otros formatos o cuantizaciones en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/stevyhacker/Gemma-4-E2B-LokalBot-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Repositorio LokalBot: https://github.com/stevyhacker/LokalBot
