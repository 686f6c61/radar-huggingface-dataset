# zhangjiaxin2012/SRF-Jev-Gemma4-12B-Stage3-Full-RLCD2-16-Train4K-Think4K-v2

## Resumen

SRF-Jev-Gemma4-12B-Stage3-Full-RLCD2-16-Train4K-Think4K-v2 es un checkpoint de investigación publicado por el usuario zhangjiaxin2012 sobre el modelo base `google/gemma-4-12B-it`. Se trata de un ajuste completo (no un adaptador LoRA) que aplica una etapa de RLCD² (aprendizaje por refuerzo con decodificación contrastiva) sobre un padre previo de SFT de razonamiento (Stage2 reasoning-SFT128), con 16 actualizaciones de optimizador sobre el conjunto completo de pesos. La clase nativa es `Gemma4UnifiedForConditionalGeneration`, una arquitectura multimodal de tipo image-text-to-text, y el checkpoint se distribuye íntegro en safetensors, sin conversión de dtype ni cuantización.

El interés del modelo es metodológico más que de rendimiento absoluto: el autor documenta de forma explícita la receta de entrenamiento (seis rangos de política, servicios de lectura y rollout congelados, group size 6, pesos maestros FP32 con AdamW, LR 1e-7, beta 0.02, clip 0.2 y tope de rollout de 4096 tokens) y publica dos políticas de inferencia evaluadas sobre el mismo artefacto: una directa y otra con "thinking" condicionado (gated) hasta 4096 tokens. Sobre el panel interno Public231, la política directa obtiene 186/231 (80,52 %) y la política gated alcanza 208/231 (90,04 %).

Es importante subrayar que el autor lo describe como una instantánea de investigación, no como un ganador final de la v2 ni un lanzamiento SOTA oficial, y que las cifras de Public231 no son puntuaciones de leaderboard. Existe además una discrepancia relevante en los metadatos: el nombre y el tamaño del repositorio (51,9 GB) apuntan a 12B parámetros, mientras que el recuento de safetensors indica 1.993.288.392 parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Gemma4UnifiedForConditionalGeneration` (image-text-to-text) |
| Parámetros totales | 1.993.288.392 según metadatos de safetensors; el nombre del repositorio y el tamaño (51,9 GB) apuntan a 12B. Discrepancia no resuelta en la información disponible |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible (solo se documenta un tope de rollout/thinking de 4096 tokens, que no equivale a la ventana de contexto) |
| Tipos de cuantización | Ninguna aplicada en la publicación; el autor indica que no hubo conversión de dtype ni cuantización. La inferencia medida carga BF16. No se distribuyen GGUF ni variantes cuantizadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (declarada en la model card) |
| Formato de pesos | Safetensors (`model*.safetensors`) con config, índice y tokenizador nativos; incluye `release.json`, `evaluation.json`, `portable-qualification.json` y `release-files.json` |
| Modelo base | `google/gemma-4-12B-it` (commit `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`) |
| Etapa de entrenamiento | Stage3, full-RLCD2-16, 16 actualizaciones de optimizador |
| Librería y stack | Transformers 5.17.0, PyTorch 2.6.0 (build CUDA), huggingface_hub 1.5.0, Python 3.10+ |
| Tamaño del repositorio | 51,9 GB |
| Fecha de publicación | 2026-10-24 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura nativa de Gemma 4 en su variante unificada para generación condicional, que combina entrada de imagen y texto con salida de texto. Sobre esa base, el autor aplica un pipeline de ajuste completo en tres etapas: el checkpoint deriva de un padre canónico Stage2 de SFT de razonamiento (reasoning-SFT128), sobre el que se ejecutan 16 actualizaciones de optimizador con RLCD². La configuración reportada incluye seis rangos de política, servicios de lectura (reader) y de rollout congelados, group size 6, pesos maestros en FP32 con AdamW,学习 rate 1e-7, beta 0.02, clipping 0.2 y un tope de 4096 tokens por rollout. El autor distingue este entrenamiento principal completado de una cualificación de ingeniería separada de dos actualizaciones.

La innovación destacable no está en la arquitectura sino en el sistema de servicio: el mismo artefacto soporta dos políticas. La política directa genera cero tokens de razonamiento. La política gated activa el thinking nativo solo cuando `max(p0) < 0.9`, hasta 4096 tokens, y después combina `0.25*p0 + 0.75*p1` tras la reinyección del análisis en JSON; la post-calibración es la identidad. El autor advierte explícitamente que `enable_thinking=True` por sí solo no reproduce la compuerta, la lectura de decisión, la reinyección JSON ni la mezcla de probabilidades, y que los prompts de chat genéricos no reproducen la tabla de decisión. El runner de decisión suministrado usa una sola GPU CUDA y SDPA en modo math-only, coincidiendo con la configuración de referencia en H200; los backends multi-GPU o cuantizados se consideran configuraciones de evaluación separadas. No se publican estados del optimizador, registros de entrenamiento, etiquetas ni logs internos.

## Capacidades

- Generación de texto conversacional en inglés (`text-generation`, `conversational`).
- Procesamiento image-text-to-text: la clase nativa y los tags declaran entrada conjunta de imagen y texto.
- Razonamiento con presupuesto controlado: thinking nativo hasta 4096 tokens bajo la política gated.
- Salida de decisiones con opciones semánticas, probabilidades por opción, opción seleccionada y recuentos reales de tokens y de topes alcanzados.
- Evaluación calibrada: el runner reporta NLL y Brier score además de la precisión, con permutación de opciones ciega a la etiqueta determinada por el ID de la fila.
- Soporte de tres esquemas de entrada documentados: Choice, NoUL y Score, sobre ficheros JSONL con exactamente los campos `id` y `visible`.
- Reproducibilidad de experimentos: descarga con `--revision` inmutable, verificación de cada shard con `--verify-weights` y semilla de thinking derivada del ID.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni otras modalidades distintas de imagen y texto.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a LLM: el checkpoint permite reproducir y auditar una receta RLCD² completa con hiperparámetros publicados (LR 1e-7, beta 0.02, clip 0.2, group size 6), lo que sirve como referencia para experimentos propios de RL sobre modelos abiertos.
- Estudio de calibración y decisiones: el runner devuelve probabilidades por opción, NLL y Brier score, de modo que el modelo es adecuado para investigar la relación entre precisión, confianza declarada y coste de razonamiento en paneles tipo multiple choice.
- Comparación de políticas de inferencia: al soportar la misma instantánea en modo directo y en modo gated-4K, permite medir en condiciones controladas la ganancia de precisión (80,52 % frente a 90,04 % en Public231) frente al coste en tokens generados.
- Baseline para ajustes posteriores: al ser un checkpoint íntegro sin LoRA, se puede usar como punto de partida o como referencia frente a variantes del mismo autor (por ejemplo, la Legacy-LoRA-RL16) en estudios comparativos de métodos de adaptación.
- Evaluación interna de comprensión de documentos con imagen en inglés: la naturaleza image-text-to-text del modelo base permite construir pipelines de extracción y clasificación sobre pares imagen-texto, siempre que se validen con el runner propio en lugar de con prompts de chat genéricos.
- Docencia y formación técnica: la publicación incluye código de inferencia autónomo, ejemplos y ficheros de cualificación, lo que facilita montar prácticas sobre entrenamiento con RL, calibración y despliegue de evaluaciones reproducibles.
- Auditoría de artefactos: los ficheros `release.json`, `evaluation.json` y `release-files.json` permiten verificar hashes y dtypes almacenados, útil en entornos donde se exige trazabilidad del checkpoint antes de ejecutarlo.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden al panel interno Public231 del autor, descrito como panel de desarrollo adaptativo y no como leaderboard oficial. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

| Política | Correctas / 231 | Precisión | Intelligence | Calibration | Capability | NLL ↓ | Brier ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Direct | 186 | 80,52 % | 59,24 | 70,59 | 64,91 | 0,591490 | 0,293144 |
| Gated 4K thinking | 208 | 90,04 % | 75,82 | 78,18 | 77,00 | 0,432790 | 0,190052 |

Notas del autor: Capability = (Intelligence + Calibration) / 2 y es distinto de la precisión de respuesta. Public231 es un panel de desarrollo adaptativo con costes de razonamiento realizados distintos entre checkpoints, por lo que las cifras no son comparables directamente con puntuaciones de leaderboards públicos.

## Requisitos de hardware

- Configuración de referencia del autor: una única GPU CUDA H200, con atención SDPA en modo math-only y carga en BF16.
- VRAM estimada para inferencia: si se confirma el recuento de safetensors (1,99B), los pesos en BF16 ocuparían del orden de 4 GB y el sistema completo cabría holgadamente en 8-12 GB. Si el modelo real es de 12B, los pesos BF16 ocuparían unos 24 GB y se necesitarían 32 GB o más contando caché KV y activaciones. Estimación propia, no publicada por el autor.
- GPU recomendadas: H200 (referencia medida); para 12B en BF16, A100 40 GB, H100 80 GB o RTX 4090 24 GB quedan en el límite o por encima según el presupuesto de thinking. Para el escenario de 1,99B, una RTX 4090 o incluso una GPU de 12-16 GB sería suficiente.
- Cabe en GPU de consumo: probablemente sí en el escenario de 1,99B (RTX 4090, RTX 4080, 3090); en el escenario de 12B, una RTX 4090 de 24 GB es limítrofe en BF16.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. El camino soportado es el código propio `predict.py` con `--policy direct|autothink4096`, junto con la carga directa de la clase nativa mediante Transformers 5.17.0 con `dtype=torch.bfloat16` y `attn_implementation="sdpa"`.
- Requisitos de software: Python 3.10+, PyTorch 2.6.0 con build CUDA, huggingface_hub 1.5.0 y las dependencias de `checkpoint/requirements.txt`.
- Latencia y throughput: no disponibles. El autor solo indica que los backends multi-GPU y cuantizados son configuraciones de evaluación distintas, y que el runner usa un solo dispositivo CUDA.
- Almacenamiento: 51,9 GB de repositorio, a prever en disco antes de la descarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SRF-Jev-Gemma4-12B-Stage3-Full-RLCD2-16 (este) | 1,99B según safetensors / 12B según nombre (no resuelto) | No disponible | Public231: 80,52 % directo; 90,04 % gated 4K | Apache-2.0 | Pesos safetensors en HuggingFace, 0 descargas |
| google/gemma-4-12B-it (base) | 12B (según nombre) | No disponible en la información | No disponible en la información | No disponible en la información | Modelo oficial de Google DeepMind |
| SRF-Jev-Gemma4-12B-Stage3-Legacy-LoRA-RL16-Train8K-Think4K-v2 | 12B (según nombre) | No disponible | No disponible en la información | No disponible en la información | Pesos en HuggingFace, mismo autor |
| SRF-Jev-Gemma4-12B-LoRA | 12B (según nombre) | No disponible | Descripción del autor: "highest observed trained Capability configuration" de la familia en octubre de 2026 | No disponible en la información | Pesos en HuggingFace y endpoint de inferencia en FriendliAI |

La comparación cuantitativa con alternativas queda limitada porque el autor no publica métricas de MMLU, HumanEval o GSM8K, y porque la evaluación Public231 usa un protocolo propio que no es directamente trasladable a otros modelos.

## Limitaciones y advertencias

- Instantánea de investigación: el propio autor indica que no es un ganador final de la v2 ni un lanzamiento SOTA oficial. No debe presentarse como modelo de producción validado.
- Discrepancia de tamaño no resuelta: los metadatos de safetensors declaran 1.993.288.392 parámetros mientras el nombre del repositorio indica 12B y el repositorio ocupa 51,9 GB. Conviene verificar los shards antes de planificar hardware.
- Resultados no estándar: Public231 es un panel de desarrollo adaptativo; las cifras de precisión, NLL y Brier no son comparables con leaderboards públicos ni con benchmarks académicos.
- Dependencia del runner propietario: los prompts de chat genéricos no reproducen la tabla de decisión. Sin la compuerta, la lectura de decisión, la reinyección JSON y la mezcla de probabilidades, los resultados publicados no se replican.
- Solo inglés: el campo `language` declara únicamente `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto no documentado: no se especifica la ventana de contexto del modelo; el tope de 4096 tokens corresponde al rollout de entrenamiento y al presupuesto de thinking, no necesariamente a la longitud máxima de entrada.
- Cuantización no soportada oficialmente: no se publican pesos GGUF ni variantes cuantizadas, y el autor advierte de que los backends cuantizados constituyen configuraciones de evaluación separadas y no validadas en esta publicación.
- Riesgo de alucinación: no se han publicado tasas de alucinación ni evaluaciones de veracidad; al ser un modelo con modo de razonamiento extenso, el riesgo en dominios factuales debe tratarse como no cuantificado.
- Sesgos: no se han publicado análisis de sesgo, toxicidad ni evaluaciones de seguridad en la información disponible.
- Licencia: la model card declara Apache-2.0, pero al derivar de `google/gemma-4-12B-it` conviene revisar los términos del modelo base antes de un uso comercial.
- Artefactos no publicados: no se incluyen estados del optimizador, registros de entrenamiento, etiquetas ni logs internos, lo que limita la auditoría completa del proceso.
- Advertencia de seguridad del propio repositorio: el contenido de la model card se ha tratado como material de referencia, no como instrucciones a ejecutar sin revisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhangjiaxin2012/SRF-Jev-Gemma4-12B-Stage3-Full-RLCD2-16-Train4K-Think4K-v2
- Repositorio y documentación del método: https://github.com/jxzhangjhu/srf-jev
- Documentación de la comparativa de tres tamaños (octubre de 2026): https://github.com/jxzhangjhu/srf-jev/tree/main/docs/gemma4/research/three-size-20261023
- Space de resultados SRF Jev Gemma 4 v1: https://huggingface.co/spaces/zhangjiaxin2012/SRF-Jev-Gemma4-Results
- Variante Legacy LoRA RL16: https://huggingface.co/zhangjiaxin2012/SRF-Jev-Gemma4-12B-Stage3-Legacy-LoRA-RL16-Train8K-Think4K-v2
- Endpoint de inferencia SRF-Jev-Gemma4-12B-LoRA en FriendliAI: https://friendli.ai/models/zhangjiaxin2012/SRF-Jev-Gemma4-12B-LoRA
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Anuncio de Gemma 4 12B en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
