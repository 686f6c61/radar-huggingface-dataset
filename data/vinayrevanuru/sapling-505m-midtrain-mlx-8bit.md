# VinayRevanuru/Sapling-505M-Midtrain-MLX-8bit

## Resumen

Sapling-505M-Midtrain-MLX-8bit es una conversión a 8 bits en formato MLX del checkpoint de mid-training Sapling-505M-Midtrain, un modelo de 505.483.776 parámetros construido desde cero por VinayRevanuru sobre la arquitectura densa de Qwen3. El modelo completa texto y ha visto formato ChatML durante el entrenamiento, pero no es un modelo conversacional: no cierra sus turnos y requiere fijar siempre un límite de tokens en la generación. Su propósito es servir como base para fine-tuning propio o como completador de texto y matemáticas en Macs con Apple Silicon.

La relevancia de esta variante es práctica: reduce el checkpoint original en FP32 (2,0 GB) a 545 MB manteniendo prácticamente la misma perplejidad (22,88 frente a 22,86 en WikiText-2, un +0,1%), lo que permite ejecutar el modelo en memoria unificada de un portátil sin GPU dedicada. La cuantización es afín de 8 bits con grupo de 64, generada con `mlx_lm.convert` de mlx-lm 0.32.2, lo que da 9,0 bits efectivos por peso.

Se trata de un modelo muy pequeño (505M) y con contexto corto (2.048 tokens), orientado a experimentación e investigación más que a producción conversacional. La licencia Apache-2.0 del original se mantiene, y el autor publica además la versión GGUF para llama.cpp/Ollama, el checkpoint FP32 y un modelo SFT separado para uso de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 densa (transformer decoder-only), 30 capas, anchura 1.024, 16 cabezas de query y 8 de KV, embeddings atados (tied embeddings) |
| Parametros totales | 505.483.776 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | MLX 8-bit afín, group size 64 (9,0 bits efectivos por peso); existe variante MLX 4-bit y GGUF BF16 del mismo autor |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`); disponibles también GGUF y safetensors FP32 en repositorios separados |
| Tamano del repositorio | 0,6 GB (pesos 8-bit: 545 MB; FP32 original: 2,0 GB; 4-bit: 304 MB) |
| Biblioteca de inferencia | mlx-lm (probado con mlx-lm 0.32.2) |
| Modelo base | VinayRevanuru/Sapling-505M-Midtrain (relación: quantized) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la topología de Qwen3: 30 capas, dimensión de modelo de 1.024, 16 cabezas de atención de query con 8 cabezas de key/value (GQA, dimensión por cabeza de 64) y proyección de embeddings atada a la capa de salida. El contexto máximo es de 2.048 tokens. La ficha del autor no detalla innovaciones adicionales de atención ni mecanismos de decodificación especulativa.

El entrenamiento se hizo desde cero en dos fases según la model card: 5.000 millones de tokens de preentrenamiento y 1.000 millones adicionales de mid-training compuesto por matemáticas, chat y datos de replay. No se especifica en la información disponible la composición exacta del dataset, el número total de tokens vistos (más allá de esas cifras) ni si se aplicaron etapas de RLHF o DPO; el autor describe explícitamente el checkpoint como "no conversacional", lo que sugiere ausencia de alineación orientada a diálogo. La conversión a 8 bits se realizó con cuantización afín por grupos de 64 elementos, y el autor verifica la fidelidad del pipeline comprobando que el GGUF BF16 reproduce la perplejidad del FP32 con un margen del 0,01%.

## Capacidades

- Generación y continuación de texto en inglés, con foco en completado de documentos y problemas.
- Resolución de problemas matemáticos sencillos en formato de plantilla (`Problem: ... / Solution:`), como cálculos de porcentajes.
- Manejo de formato ChatML a nivel de tokens: reconoce los marcadores de turno, aunque no genera el token de cierre por sí mismo.
- Capacidad de servir como base para fine-tuning supervisado (el autor publica un SFT derivado para uso conversacional).
- Inferencia local en Apple Silicon mediante MLX, con soporte de muestreo configurable (temperatura, top-p).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso guiado por agentes, visión, audio ni modo "thinking".

## Casos de uso

- Completado de texto en local sobre Mac: el modelo continúa fragmentos de documentación o prosa en inglés con 545 MB de pesos, lo que permite integrarlo en editores o scripts sin conexión y sin GPU dedicada.
- Completador matemático de plantilla: alimentado con el formato `Problem: ...\nSolution:`, resuelve operaciones aritméticas simples y porcentajes, útil como banco de pruebas de razonamiento elemental en modelos pequeños.
- Modelo base para fine-tuning con LoRA o SFT: al ser un checkpoint de mid-training con contexto de 2.048 tokens y licencia Apache-2.0, es adecuado para adaptarlo a dominios concretos (clasificación de texto, extracción de campos) partiendo de un modelo ya expuesto a matemáticas y formato de chat.
- Generación de datos sintéticos para entrenar modelos mayores: su capacidad de continuar texto con marcadores ChatML permite producir borradores de pares instrucción-respuesta de bajo coste que luego se filtran.
- Investigación sobre entrenamiento desde cero: al ser un modelo de 505M con checkpoint intermedio publicado, sirve para estudiar curvas de perplejidad, efectos del mid-training y comparaciones FP32 vs. 8-bit vs. 4-bit con un mismo tokenizador.
- Validación de pipelines de cuantización: es un caso de referencia para verificar que una conversión MLX o GGUF reproduce la perplejidad del original, replicando la metodología del autor sobre WikiText-2.
- Prototipado de infraestructura de inferencia en MLX: permite medir latencia, consumo de memoria y comportamiento de la caché KV antes de migrar el mismo código a modelos Qwen3 de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El único dato de calidad publicado es la perplejidad en WikiText-2, medida sobre las primeras 64 ventanas de 1.024 tokens del conjunto de test, puntuando la segunda mitad de cada ventana:

| Variante | Tamano | WikiText-2 PPL | Diferencia vs FP32 |
|---|---|---|---|
| FP32 original (transformers) | 2,0 GB | 22,86 | — |
| MLX 8-bit (este repositorio) | 545 MB | 22,88 | +0,1% |
| MLX 4-bit | 304 MB | 24,44 | +6,9% |

El autor indica que las ventanas de tokens y el método son idénticos entre transformers, MLX y llama.cpp, por lo que las cifras son directamente comparables entre sí. No se ofrece comparación con otros modelos.

## Requisitos de hardware

- VRAM/memoria: 545 MB para los pesos en 8-bit; 304 MB en la variante 4-bit; 2,0 GB para el checkpoint FP32.
- Caché KV estimada: con 30 capas, 8 cabezas KV y dimensión de cabeza 64, la caché ocupa unos 60 KB por token en fp16; a 2.048 tokens de contexto, aproximadamente 120-130 MB (cálculo propio a partir de la configuración publicada, no dato del autor).
- Cabe en cualquier Mac con Apple Silicon: 8 GB de memoria unificada son suficientes para pesos, caché y sistema operativo; también puede ejecutarse en CPU x86 a través del GGUF.
- GPU recomendadas: no requiere GPU dedicada. Para MLX, cualquier chip de la familia M (M1 en adelante). Para la versión GGUF, CPU o GPU consumer de gama baja.
- Opciones de despliegue: `mlx-lm` para los pesos MLX; `llama.cpp` u Ollama con el repositorio GGUF del mismo autor; `transformers` con el checkpoint FP32. vLLM y TGI no cargan pesos en formato MLX de forma nativa; sería necesaria una conversión previa.
- Latencia y throughput: no disponibles (no publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Sapling-505M-Midtrain-MLX-8bit | 505M | 2.048 | Apache-2.0 | MLX, GGUF, FP32 | PPL WikiText-2 22,88 (8-bit) |
| Qwen3-0.6B (oficial) | 596M | 32.768 (nativo) | Apache-2.0 | safetensors, GGUF, MLX | no disponible en esta ficha |
| SmolLM2-360M | 362M | 8.192 | Apache-2.0 | safetensors, GGUF | no disponible en esta ficha |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache-2.0 | safetensors, GGUF | no disponible en esta ficha |

Nota metodológica: la perplejidad en WikiText-2 no es comparable entre modelos con tokenizadores distintos, por lo que la columna de rendimiento no se puede cruzar con las alternativas sin volver a evaluar todas con el mismo tokenizador. Los datos de parámetros, contexto y licencia de los modelos comparados provienen de sus fichas públicas.

## Limitaciones y advertencias

- No es un modelo de chat: continúa texto y puede no cerrar los turnos aunque haya visto ChatML. Es obligatorio fijar `max_tokens` en cada generación para evitar divagación indefinida.
- Contexto de solo 2.048 tokens: insuficiente para RAG con documentos largos, resúmenes extensos o conversaciones multi-turno prolongadas.
- Solo inglés: no se ha documentado entrenamiento ni evaluación en castellano ni en otros idiomas.
- Escala muy reducida (505M): alta probabilidad de alucinación en conocimiento factual, razonamiento multi-paso frágil y matemáticas limitadas a operaciones sencillas.
- Sin información sobre datos de preentrenamiento: la composición del corpus no está documentada, por lo que los sesgos presentes son desconocidos e imposibles de auditar con la información disponible.
- Sin etapas de alineación documentadas (RLHF/DPO/instruction tuning): no cabe esperar adherencia a instrucciones ni rechazo de contenido problemático.
- La cuantización 4-bit degrada la perplejidad un 6,9% frente a FP32; para tareas sensibles conviene usar 8-bit o el checkpoint original.
- Licencia Apache-2.0: permite uso comercial y modificación sin restricciones adicionales, pero se ofrece sin garantías; conviene conservar el aviso de licencia y atribución.
- Repositorio sin descargas ni validación de la comunidad (0 descargas, 0 likes): el comportamiento en producción no está contrastado por terceros.
- vLLM y TGI no soportan los pesos MLX directamente; desplegar en esos servidores exige convertir a otro formato.

## Enlaces

- Repositorio HuggingFace (8-bit MLX): https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain-MLX-8bit
- Modelo base (FP32): https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain
- Versión GGUF (llama.cpp / Ollama): https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain-GGUF
- Variante SFT para chat: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT
- Biblioteca de inferencia mlx-lm: https://github.com/ml-explore/mlx-lm
