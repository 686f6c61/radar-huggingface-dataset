# YihuaiHong/manifold-pretraining-engineering

## Resumen

Manifold Pretraining Engineering es una familia de 49 modelos de lenguaje pequeños (de 53M a 1.07B parámetros) publicados por Yihuai Hong, Hanxi Ma y Chen Zhao como material reproducible del artículo *Manifold Pretraining Engineering: Right Geometry, Right Time, Right Place*. No es un modelo pensado para uso en producción, sino un banco de experimentos sobre cómo un prior geométrico auxiliar, aplicado durante una ventana concreta del preentrenamiento, mejora el aprendizaje de la aritmética en modelos entrenados desde cero.

Los modelos siguen la arquitectura `Olmo2ForCausalLM` (decoder-only, embeddings de entrada y salida atados, contexto de 512 tokens, tokenizador OLMo-2 con vocabulario de 100.278) y se preentrenan sobre FineWeb-Edu mezclado con líneas de sumas de operandos entre 0 y 999. Cada celda experimental incluye un modelo con prior de variedad (manifold prior) y otro sin él, entrenados con el mismo presupuesto de tokens y a su propia tasa de aprendizaje óptima, de modo que la comparación aísle el efecto del prior.

La relevancia es metodológica: el prior es una pérdida auxiliar `1 - CKA` entre los estados ocultos de los tokens de un concepto en dos capas y una variedad objetivo (para números, una hélice con cos y sin de 2πx/T para T = 2, 5, 10, 100, 1000 más un término lineal), activa entre el 5 % y el 40 % del entrenamiento. Con él, la precisión media en sumas retenidas sube de 66,1 a 88,9 en los modelos de 53M (8 semillas), un salto de +22,8 puntos que se reproduce en 8 de 8 semillas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Olmo2ForCausalLM`), embeddings de entrada y salida atados |
| Parámetros totales | 9 tamaños: 53M, 93M, 136M, 190M, 294M, 391M, 505M, 731M y 1.07B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos publicados en float32 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) + tokenizer, un subdirectorio por modelo |

Dimensiones por tamaño (hidden size x capas): 53M (384 x 6), 93M (512 x 10), 136M (640 x 11), 190M (768 x 12), 294M (832 x 19), 391M (960 x 20), 505M (1024 x 24), 731M (1152 x 29), 1.07B (1280 x 36). Tamaño total del repositorio: 55,7 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de la familia OLMo-2, con contexto de 512 tokens y tokenizador OLMo-2 (vocabulario de 100.278; los enteros 0..999 se codifican como tokens únicos). Los datos son FineWeb-Edu `sample/10BT` (ficheros `000_00000` y `001_00000`, commit `87f09149ef4734204d70ed1d046ddc9ca3f2b8f9`), tokenizados hasta 400M tokens de entrenamiento. Cada fila de 512 tokens es una ventana de texto en un offset aleatorio seguida de 1 (2 % aritmético) o 4 (7 % aritmético) líneas de suma con operandos 0..999, repartidos en seis cubos de longitud de operando y en cuatro formatos de plantilla (`Q: a + b = `, `a plus b equals `, `The sum of a and b is `, `Compute a + b. Result: `). Por semilla se retienen 150 pares de operandos por cubo (20 para pares de un dígito) que nunca se entrenan y forman el conjunto de evaluación.

La optimización usa AdamW (0,9, 0,95), weight decay 0,1, clipping de gradiente 1,0, batch de 32 x 512 tokens, warm-up del 1 %, decaimiento coseno hasta 0,1x y autocast bf16, guardando los pesos en float32. La innovación central es el prior de variedad: una pérdida auxiliar `1 - CKA` entre los estados ocultos de los tokens del concepto en las capas n/3 y 2n/3 y una variedad objetivo, con λ = 5 sobre los tokens de operando y activa del 5 % al 40 % del entrenamiento. Los modelos de seis priors usan λ = 1 por prior sobre números, dimensiones, ciudades, países, un toro 6x6 y una rejilla 5x5. La métrica principal del artículo es la "curva media": precisión en sumas retenidas promediada sobre los seis cubos y las 75 evaluaciones del entrenamiento.

## Capacidades

- Generación de texto en inglés con contexto de 512 tokens.
- Aritmética de suma de operandos 0..999, en cuatro formatos de plantilla, cuando la operación aparece al final de una fila de texto (distribución de entrenamiento).
- Representaciones internas geométricamente estructuradas para números (hélice), analizables con CKA; los checkpoints de `six-priors/v5-checkpoints` están pensados para análisis de interpretabilidad.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe: solo inglés.
- No hay modo "thinking", visión ni audio.

## Casos de uso

- Investigación en interpretabilidad: cargar los checkpoints de `six-priors/v5-checkpoints` (pasos 7323, 12000 y 18309) para estudiar cómo evolucionan las representaciones de números, dimensiones, ciudades y países bajo un prior geométrico medido con CKA.
- Reproducción de experimentos de preentrenamiento: cada subdirectorio incluye `provenance.json` con batch, celda, brazo, tasa de aprendizaje, semilla, tokens, pasos, `code_sha` del entrenador y sha256 del checkpoint de origen, lo que permite replicar exactamente una celda concreta.
- Estudio de mezclas de datos: las familias `ladder-7pct` y `ladder-2pct` permiten comparar el efecto de la proporción de aritmética (7 % frente a 2 %) a un presupuesto fijo de 300M tokens.
- Análisis de escalado: la familia `tokens-per-param` fija la ratio tokens/parámetros no-embedding y permite estudiar cómo cambia la ganancia del prior con el tamaño del modelo (de 53M a 1.07B).
- Docencia y divulgación: modelos pequeños (53M–190M) que caben en GPU de consumo y sirven para demostrar empíricamente el efecto de una pérdida auxiliar sobre una capacidad concreta, con curvas de evaluación completas en los JSON de cada run.
- Evaluación de métodos de alineación de representaciones: usar el par con/sin prior de una misma celda como caso controlado para probar nuevas métricas de similitud de representaciones distintas de CKA.
- Pruebas de infraestructura de entrenamiento: el repositorio documenta el `code_sha` del entrenador y los logs completos, útil para validar pipelines de preentrenamiento a pequeña escala antes de escalar.

## Benchmarks y rendimiento

Los datos disponibles son la precisión en sumas retenidas (exact match forzado por profesor, prompt tras texto retenido terminando en el token 512). La columna "Paper" recoge la media de 8 semillas; la columna "Este modelo" es la semilla publicada.

| Celda | Tamaño | Brazo | Media de curva, 8 semillas (%) | Este modelo: curva / final (%) |
|---|---|---|---|---|
| `ladder-7pct/53m` | 53M | helix prior | 88,9 | 88,6 / 99,4 |
| `ladder-7pct/53m` | 53M | sin prior | 66,1 | 67,0 / 99,2 |

Ganancia del prior en 53M: +22,8 puntos (8 de 8 semillas). No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos externos.

## Requisitos de hardware

- VRAM estimada en float32 (pesos publicados): aproximadamente 0,2 GB para 53M, 0,4 GB para 93M, 0,5 GB para 136M, 0,8 GB para 190M, 1,2 GB para 294M, 1,6 GB para 391M, 2,0 GB para 505M, 2,9 GB para 731M y 4,3 GB para 1.07B, más activaciones y caché KV (contexto de solo 512 tokens, por lo que la caché es pequeña).
- GPU recomendadas: cualquier GPU con al menos 8 GB para los tamaños hasta 1.07B en float32; A100/H100 no son necesarias para inferencia, solo para reproducir el entrenamiento.
- Cabe en GPU de consumo: sí, todos los tamaños en una RTX 3060 de 12 GB o superior; los modelos de 53M–190M caben incluso en GPUs de 4–6 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `subfolder` (documentado por el autor); no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos cuantizados publicados habría que convertirlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| Manifold Pretraining Engineering (este) | 53M–1.07B | 512 | MIT | Hugging Face, 49 checkpoints | Preentrenamiento desde cero con prior geométrico |
| OLMo-2 (AI2) | 7B y 13B | 4.096 | Apache 2.0 | Hugging Face | Modelo base de propósito general |
| Pythia (EleutherAI) | 70M–12B | 2.048 | Apache 2.0 | Hugging Face | Suite de escalado con checkpoints intermedios |
| TinyLlama | 1.1B | 2.048 | Apache 2.0 | Hugging Face | Modelo pequeño de propósito general |

La comparación con OLMo-2, Pythia o TinyLlama es solo de categoría: este repositorio no publica resultados en benchmarks estándar que permitan comparar rendimiento general, y su contexto (512) es sustancialmente menor. Su valor es experimental, no de uso general.

## Limitaciones y advertencias

- Modelos de investigación: no están ajustados con instrucciones ni RLHF/DPO; no deben usarse como asistentes en producción.
- Contexto de 512 tokens, muy corto para aplicaciones reales.
- Solo inglés; el tokenizador no añade token BOS y los modelos nunca vieron uno.
- La evaluación de sumas solo es válida con el prompt al final de una fila de texto (tras texto retenido, terminando en el token 512); un prompt al inicio del contexto queda fuera de la distribución de entrenamiento y los resultados no son representativos.
- Riesgo alto de alucinación fuera de la distribución de FineWeb-Edu y de las plantillas de suma entrenadas.
- Solo se publica una semilla por celda (la de menor semilla con pesos conservados); los números del artículo son medias de 8 semillas y pueden no coincidir con el checkpoint publicado.
- Pesos en float32 (55,7 GB en total): no hay cuantizaciones oficiales, por lo que el despliegue eficiente requiere conversión propia.
- Licencia MIT: permite uso comercial, pero el modelo no está diseñado ni validado para ello.
- Sesgos heredados de FineWeb-Edu no evaluados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YihuaiHong/manifold-pretraining-engineering
- Código: https://github.com/yihuaihong/manifolds
- Página del proyecto: https://yihuaihong.github.io/manifolds/
- Artículo: arXiv, pendiente de publicación ("coming soon" según la model card)
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu (commit `87f09149ef4734204d70ed1d046ddc9ca3f2b8f9`)
