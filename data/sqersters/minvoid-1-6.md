# Sqersters/MinVoid-1.6

## Resumen

MinVoid-1.6 es un modelo de lenguaje causal de tipo byte-level desarrollado por Sqersters, entrenado desde cero sin tokenizador y sin pre-tokenizacion: el texto de entrada se codifica directamente como bytes UTF-8, con un vocabulario de solo 258 simbolos (256 bytes mas BOS y EOS). Se trata de un modelo de investigacion de escala muy reducida, con 2.943.232 parametros totales, disenado para explorar tecnicas de atencion y optimizacion en un regimen de computo minimo, mas que para uso productivo.

La arquitectura es un transformer decoder-only de 10 capas con d_model 128, que incorpora dos innovaciones destacadas: Grouped Latent Attention (GLA), que comprime la cache KV almacenando latentes en lugar de claves y valores completos, y Exclusive Self-Attention (XSA), que resta la proyeccion de la salida de atencion sobre el vector de valor propio. El entrenamiento cubre aproximadamente 1.100 millones de tokens de texto en ingles con un optimizador hibrido FastNorMuon+AdamW, siendo la primera version de la familia MinVoid que no usa AdamW puro.

Su relevancia es fundamentalmente metodologica: demuestra que un modelo de menos de 3 millones de parametros puede entrenarse con tecnicas de atencion eficiente y optimizadores de nueva generacion, y publica resultados en el protocolo del Open SLM Leaderboard. No obstante, sus puntuaciones absolutas son muy bajas (Int Index de 5,44) y su utilidad practica en produccion es practicamente nula mas alla de la experimentacion y la docencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GLA (Grouped Latent Attention) y XSA (Exclusive Self-Attention), bloques paralelos con RMSNorm compartida, SwiGLU, RoPE (theta 10000) |
| Parametros totales | 2.943.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (corpus de entrenamiento en ingles; no se declaran otros idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con codigo de modelado custom: `modeling_minvoid.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas con d_model 128, 4 cabezas de consulta (d_head 32) y 2 cabezas latentes en GLA (d_latent 64), de modo que la cache KV almacena 128 valores por token y capa. La atencion incorpora QK-RMSNorm sobre q y k antes de RoPE, y XSA resta a la salida de atencion su proyeccion sobre el vector de valor propio. La FFN es SwiGLU con hidden 608 (aproximadamente 4,75x d_model). Los bloques son paralelos: una unica RMSNorm compartida alimenta atencion y FFN. La inicializacion es de estilo µP (std de Linear = 0,02 x sqrt(d_model/fan_in); proyecciones residuales de salida divididas por sqrt(2L)) y los embeddings de entrada y salida estan atados.

El entrenamiento uso aproximadamente 1.100 millones de tokens con batch de 32 x secuencia 512, autocast en bf16 y schedule coseno. El optimizador es FastNorMuon+AdamW: NorMuon (lr 0,02, momentum/beta2 0,95, weight decay 0,01) sobre todos los pesos ocultos 2D con Newton-Schulz por lotes agrupados por formas identicas, y Adam (lr 6e-4) sobre el embedding atado y las ganancias de normalizacion. El corpus, de unos 4,6 GB de texto en ingles, mezcla light novels, TinyStories, wikitext-103, wikipedia-markdown, OASST1, datos de instruccion alpaca/dolly, conversaciones cotidianas, problemas matematicos estilo GSM8K, MathInstruct, OpenMathReasoning-CoT y corpus de diccionarios y citas; los splits de evaluacion se excluyeron y el corpus se escribio en fragmentos barajados de unos 4 MB. El rendimiento reportado es de aproximadamente 150.000 tokens por segundo en una AMD RX 7600 XT con ROCm en modo eager.

## Capacidades

- Generacion de texto causal a nivel de byte, sin tokenizador: codifica y decodifica cualquier cadena UTF-8 directamente.
- Razonamiento basico y respuesta a preguntas simples, con calidad muy limitada por su escala.
- Aritmetica elemental y problemas de palabras de estilo GSM8K, entrenado sobre ese tipo de datos pero con rendimiento bajo (ArithMark-3 de 35,10).
- Capacidad multilingue practicamente inexistente: el corpus es exclusivamente en ingles y el modelo no declara otros idiomas.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso estructurado.
- No dispone de vision, audio ni modo de pensamiento (thinking mode).
- La generacion se realiza mediante el metodo custom `generate_bytes`, no mediante la API estandar de `generate`.

## Casos de uso

- Investigacion sobre atencion eficiente: permite reproducir y estudiar GLA y XSA en un modelo de menos de 3 millones de parametros que se entrena y evalua en una sola GPU de consumo, aislando el efecto de cada componente arquitectonico.
- Docencia y formacion: sirve como ejemplo completo y ejecutable de un pipeline de entrenamiento desde cero (corpus, optimizador, evaluacion con `lm-evaluation-harness`) en un portatil con GPU de gama media.
- Experimentacion con tokenizacion byte-level: util para comparar el comportamiento de modelos sin tokenizer frente a modelos con vocabulario BPE en tareas controladas y con presupuesto de computo minimo.
- Pruebas de integracion de codigo custom en Transformers: el repositorio incluye `modeling_minvoid.py` y un `run.py`, lo que lo convierte en un banco de pruebas para validar flujos de `trust_remote_code` y carga de pesos safetensors.
- Generacion de texto de relleno o sintetico en entornos de test: puede producir cadenas de texto plausibles a nivel de byte para pruebas de pipelines de datos, sin requisitos de calidad semantica.
- Estudio de optimizadores: el A/B reportado entre FastNorMuon+AdamW y AdamW (val loss 1,24 frente a 1,48 en 1.000 pasos) lo hace util para replicar experimentos sobre NorMuon y Newton-Schulz en regimen de bajo computo.

## Benchmarks y rendimiento

Resultados publicados en la model card, 0-shot con el protocolo del Open SLM Leaderboard:

| Benchmark | Puntuacion |
|---|---|
| HellaSwag (acc_norm) | 28,29 |
| ARC-Easy (acc_norm) | 28,28 |
| ARC-Challenge (acc_norm) | 21,67 |
| Combined ARC | 24,98 |
| PIQA (acc_norm) | 53,37 |
| ArithMark-3 (acc_norm) | 35,10 |
| Int Index | 5,44 |

Las puntuaciones se normalizaron respecto al azar con `N(score, chance) = 100*(score-chance)/(100-chance)` usando chances de 25/25/50/25, y el Int Index se calcula como `(HellaSwag + ARC + PIQA + 0,65*ArithMark-3)/3,65`. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bf16 para los pesos (2,94 millones de parametros), mas la cache KV, que con contexto de 512 tokens y 128 valores por token y capa es tambien minima.
- GPU recomendadas: cualquier GPU con soporte de PyTorch, incluidas integradas; el autor reporta entrenamiento e inferencia en una AMD RX 7600 XT con ROCm.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050 o superiores, y en CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (unica via documentada); no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput: el autor reporta aproximadamente 150.000 tokens por segundo en entrenamiento sobre RX 7600 XT en modo eager; no se han publicado cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinVoid-1.6 | 2,94 M | 512 | byte-level (258 simbolos) | Apache-2.0 | Hugging Face |
| TinyStories-1M (variantes) | ~1 M | 512-1024 | BPE | variable (MIT/Apache) | Hugging Face |
| SmolLM-135M | 135 M | 2048 | BPE | Apache-2.0 | Hugging Face |
| Pythia-14M | 14 M | 2048 | BPE | Apache-2.0 | Hugging Face |

La comparacion con modelos de la misma categoria es dificil porque MinVoid-1.6 opera en un regimen de escala inferior a la mayoria de SLM publicados y usa tokenizacion byte-level, lo que penaliza las metricas por token. Frente a SmolLM-135M o Pythia-14M, MinVoid-1.6 es entre uno y dos ordenes de magnitud mas pequeno y sus puntuaciones absolutas son mucho menores; su interes comparativo esta en la arquitectura (GLA, XSA, FastNorMuon), no en el rendimiento. No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada para establecer una comparacion numerica directa.

## Limitaciones y advertencias

- Calidad muy baja: el Int Index de 5,44 y puntuaciones cercanas al azar en ARC y HellaSwag indican que el modelo no es fiable para tareas de conocimiento o razonamiento.
- Riesgo elevado de alucinacion y de generar texto incoherente, especialmente fuera de los dominios del corpus de entrenamiento.
- Contexto muy limitado (512 tokens) y solo en ingles; no hay soporte multilingue declarado.
- Tokenizacion byte-level: las secuencias son mas largas en tokens que con BPE, lo que agrava el limite de contexto y el coste por caracter.
- Requiere `trust_remote_code=True` y codigo de modelado custom, lo que implica revisar `modeling_minvoid.py` antes de ejecutarlo en entornos de produccion.
- No hay pesos cuantizados ni integracion con runtimes de inferencia estandar, lo que limita el despliegue fuera de Transformers.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es adecuado para produccion por su calidad; cualquier uso comercial deberia acompanarse de evaluacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sqersters/MinVoid-1.6
- Paper de FastNorMuon: https://arxiv.org/abs/2510.05491
- Paper de Grouped Latent Attention: https://arxiv.org/abs/2505.21487
- Paper de Exclusive Self-Attention: https://arxiv.org/abs/2603.09078
