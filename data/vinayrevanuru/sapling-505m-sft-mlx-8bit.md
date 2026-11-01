# VinayRevanuru/Sapling-505M-SFT-MLX-8bit

## Resumen

Sapling-505M-SFT-MLX-8bit es una compilación cuantizada a 8 bits en formato MLX del modelo conversacional Sapling-505M-SFT, desarrollado por VinayRevanuru. Se trata de un modelo de 505.483.776 parámetros con arquitectura Qwen3 densa entrenado desde cero (no es un fine-tuning de un modelo preexistente), pensado para ejecutarse en Macs con Apple Silicon. El repositorio ocupa 0,6 GB y el archivo de pesos 545 MB, lo que lo sitúa en el rango de los modelos pequeños que caben holgadamente en memoria unificada de cualquier equipo Apple moderno.

El modelo original se entrenó con 5B tokens de preentrenamiento, 1B de mid-training y 0,5B de SFT, usando plantilla ChatML estándar. Esta versión MLX se generó con `mlx_lm.convert -q --q-bits 8 --q-group-size 64`, con cuantización afín de 9,0 bits efectivos por peso, y reproduce la perplejidad del original FP32 sin pérdida medible (23,79 en WikiText-2 en ambos casos).

Su relevancia es doble: por un lado, demuestra que la cuantización 8-bit en MLX puede ser prácticamente sin pérdida para modelos pequeños; por otro, el propio autor lo etiqueta explícitamente como *research checkpoint* que solo supera 3 de las 6 puertas de calidad de release. No es un modelo para producción, sino una pieza de estudio sobre entrenamiento desde cero y sobre el impacto real de la cuantización en modelos de menos de 1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 densa (transformer decoder-only), 30 capas, anchura 1.024, 16 cabezas de query y 8 de KV, embeddings atados |
| Parametros totales | 505.483.776 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | 8-bit MLX (afín, group size 64, 9,0 bits efectivos por peso); existe también variante 4-bit MLX y GGUF BF16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); también disponible GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 densa: 30 capas transformer con anchura 1.024, 16 cabezas de atención de query y 8 de key/value (GQA), embeddings atados entre entrada y salida, y una ventana de contexto de 2.048 tokens. No incorpora mecanismos MoE, SSM ni atención lineal; es un transformer decoder-only convencional.

El entrenamiento se realizó íntegramente desde cero con 5B tokens de preentrenamiento, 1B de mid-training y 0,5B de SFT, empleando la plantilla ChatML estándar. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al SFT. La innovación técnica destacable de este repositorio concreto es la conversión a MLX 8-bit con group size 64, que según las mediciones del autor reproduce la perplejidad FP32 (23,79 en WikiText-2) sin degradación, mientras que la variante 4-bit sube a 25,32 (+6,5%).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML y parada correcta en `<|im_end|>` (100% en la prueba de 50 prompts generales tras la cuantización).
- Razonamiento básico y respuesta coherente a instrucciones sencillas, según el autor.
- Generación de código elemental (el ejemplo de la model card es una función Python que invierte una cadena).
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- Sin modo thinking, visión ni audio.
- Identidad propia frágil: solo acierta a decir que es Sapling en 4 de 10 sondas de identidad.

## Casos de uso

- Estudio de cuantización en modelos pequeños: sirve para reproducir el experimento de comparación FP32 vs MLX 8-bit vs MLX 4-bit midiendo perplejidad en WikiText-2 con la misma metodología del autor.
- Prototipado local en Apple Silicon: permite levantar un chat funcional con `mlx_lm.chat` en un Mac sin GPU dedicada, con 545 MB de pesos, para validar pipelines de inferencia antes de escalar a modelos mayores.
- Investigación sobre entrenamiento desde cero: al ser un modelo de 505M entrenado íntegramente con 6,5B tokens totales, es útil como caso de estudio de qué se puede y qué no se puede conseguir con ese presupuesto.
- Evaluación de plantillas ChatML: útil para probar integraciones de parsing de `<|im_end|>` y formateo de turnos en frameworks propios.
- Generación de texto de baja exigencia en entornos con recursos muy limitados, siempre que se acepte la tasa de rechazo erróneo del 43% en prompts inofensivos con tono agresivo.
- Benchmark de referencia para comparar el rendimiento de MLX frente a llama.cpp en el mismo modelo (existe la variante GGUF BF16 del mismo autor).

## Benchmarks y rendimiento

| Metrica | FP32 original | MLX 8-bit | MLX 4-bit |
|---|---|---|---|
| Tamano | 2,0 GB | 545 MB | 304 MB |
| WikiText-2 PPL | 23,79 | 23,79 (+0,0%) | 25,32 (+6,5%) |
| Termina turno con `<|im_end|>` (50 prompts) | 98% | 100% | no disponible |
| Fuga de rol | 0 | 0 | no disponible |
| Se identifica como Sapling (10 sondas) | 3/10 | 4/10 | no disponible |
| Rechaza prompts dañinos (30) | 73% | 73% | no disponible |
| Rechaza erróneamente prompts inofensivos con tono agresivo (30) | 33% | 43% | no disponible |

Las puertas de release exigen ≥95% de terminación de turno, 0 fugas de rol, ≥9/10 de identidad, ≥80% de rechazo de dañinos y ≤10% de rechazo erróneo. El modelo original solo supera 3 de 6. La perplejidad se midió sobre las primeras 64 ventanas de 1.024 tokens del test de WikiText-2, puntuando la segunda mitad de cada ventana, con la misma metodología en transformers, MLX y llama.cpp. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 545 MB para los pesos en 8-bit; con overhead de MLX y KV cache para 2.048 tokens, el consumo práctico se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1 o superior) es suficiente; no requiere GPU dedicada NVIDIA.
- Cabe en consumer GPU y en cualquier Mac moderno; también en Raspberry Pi y equipos de gama baja si se usa la variante GGUF.
- Opciones de despliegue: `mlx-lm` (librería nativa de este repositorio), llama.cpp y Ollama mediante la variante GGUF del mismo autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sapling-505M-SFT-MLX-8bit | 505M | 2.048 | Apache-2.0 | MLX safetensors | Research checkpoint, 3/6 puertas superadas |
| Sapling-505M-SFT (FP32) | 505M | 2.048 | Apache-2.0 | safetensors | Original sin cuantizar, 2,0 GB |
| Sapling-505M-SFT-GGUF | 505M | 2.048 | Apache-2.0 | GGUF | Variante para llama.cpp/Ollama |
| Qwen3 base (referencia arquitectónica) | no disponible | no disponible | no disponible | no disponible | Solo se cita como arquitectura; no se comparan resultados |

No se dispone en la información proporcionada de comparaciones con modelos de la misma categoría (por ejemplo, Qwen2.5-0.5B, SmolLM2-360M o TinyLlama-1.1B) en términos de benchmarks, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Modelo etiquetado por el propio autor como *research checkpoint*: no está pensado para producción.
- Falla la puerta de identidad: solo se identifica como Sapling en 4 de 10 sondas; a menudo no sabe su propio nombre.
- Falla la puerta de seguridad: solo rechaza el 73% de prompts dañinos (umbral ≥80%) y rechaza erróneamente el 43% de prompts inofensivos con tono agresivo (umbral ≤10%).
- Riesgo de alucinación elevado por tamaño y presupuesto de entrenamiento (6,5B tokens totales).
- Contexto muy limitado: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; sin capacidades multilingües.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- La cuantización 8-bit no corrige ninguno de los defectos del modelo original, según el propio autor.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones de calidad desaconsejan ese uso en la práctica.
- Las métricas de las puertas de chat se basan en conjuntos de prompts pequeños (10, 30 y 50 ejemplos), con ruido de muestreo de ±10 puntos entre ejecuciones.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/VinayRevanuru/Sapling-505M-SFT-MLX-8bit
- Modelo original FP32: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT
- Variante GGUF: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT-GGUF
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
