# ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l3

## Resumen

Este modelo es un adaptador LoRA publicado por el usuario ssurface que modifica el comportamiento de `allenai/Olmo-3-7B-Think`, un transformer de 7B parámetros de AllenAI, para razonar en un "dialecto de compresión" de nivel L3: una asignación con nombre por línea en la cadena de razonamiento. Forma parte de la investigación "Chain-of-Thought Compression Dialects" de Anatolii Frolov (2026), que estudia cómo comprimir las cadenas de razonamiento manteniendo la precisión en problemas matemáticos.

Se trata de un artefacto de ablación, no de un modelo principal: fue entrenado con la misma configuración que el modelo principal del nivel L3 (`ssurface/cot-dialect-olmo3-7b-think-grpo-l3`) pero con una recompensa adicional de `early_solve` que premia alcanzar la respuesta pronto en la secuencia. El objetivo es permitir que la comparación de diseño de recompensas del paper pueda reproducirse de forma independiente.

El adaptador se entrena con GRPO sobre el modelo SFT fusionado de nivel L3, usando el dataset GSM8K. Alcanza un 78,3% de precisión exacta en GSM8K test (n=1317) con decodificación greedy, sin ejemplos ni self-consistency. El repositorio incluye la verificación de que las matrices `lora_B` no son cero, un control de calidad relevante dado que el autor documenta que el path de atención fusionada produjo adaptadores inertes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Olmo-3-7B-Think (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA de 0,2 GB; modelo base de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Olmo-3-7B-Think esta disenado para razonamiento de contexto largo, pero no se especifica la longitud exacta) |
| Tipos de cuantizacion | No disponible (adaptador en bf16; el modelo base admite cuantizacion GGUF) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo transformer decoder-only de 7B parametros de AllenAI entrenado sobre el dataset Dolma 3. El adaptador LoRA (r=16, alpha=32) se entrena con GRPO (Group Relative Policy Optimization) usando el trainer `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`.

El entrenamiento parte del modelo SFT fusionado de nivel L3 (`ssurface/cot-dialect-olmo3-7b-think-sft-l3`), no del base sin entrenar. El dataset de entrenamiento son 6970 ejemplos de GSM8K train re-expresados a nivel L3 por un modelo profesor, con una longitud mediana de cadena de razonamiento de 90 caracteres (frente a 532 en L1 y 16 en L5, un rango de 33x).

La funcion de recompensa combina tres componentes: `correctness` (premia la respuesta correcta ponderada por el numero de pasos de la solucion de oro), `format` (exige el formato `thinking...response` con `#### <respuesta>`) y `early_solve` (premia alcanzar la respuesta pronto en la secuencia). El coeficiente KL (beta) es 0.0, con 8 generaciones por prompt, batch de 64, y maximo de 256 tokens de completacion. Se entreno en una NVIDIA A100 80GB. El autor documenta que el path de atencion fusionada (fused-kernel) produjo adaptadores con matrices `lora_B` a cero; este adaptador fue verificado con `lora_B != 0` antes de publicarse.

## Capacidades

- Razonamiento matematico: resuelve problemas de aritmetica de varios pasos tipo GSM8K con cadenas de razonamiento comprimidas a nivel simbolico (una asignacion con nombre por linea).
- Generacion de texto con formato estructurado: produce bloques `thinking` y `response` seguidos de `#### <respuesta>`.
- Compresion de razonamiento: opera a nivel L3, donde la cadena de razonamiento mediana es de 90 caracteres, frente a los 532 de L1.
- No soporta tool calling, function calling, vision ni audio (no documentado en la ficha del modelo).
- Capacidad multilingue limitada al ingles (unico idioma declarado).

## Casos de uso

- Reproduccion de experimentos de RL: permite a investigadores verificar el efecto de la recompensa `early_solve` en el rendimiento de modelos entrenados con GRPO, comparando con el modelo principal del nivel L3.
- Investigacion en compresion de razonamiento: sirve como punto de referencia para estudiar como la compresion de cadenas de razonamiento (de 532 a 90 caracteres) afecta la precision en problemas aritmeticos.
- Generacion de soluciones paso a paso en educacion: puede producir soluciones concisas y simbolicas para problemas de aritmetica, utiles en herramientas de tutoria que requieren respuestas rapidas y compactas.
- Benchmarking de tecnicas de compresion: al estar evaluado en GSM8K con condiciones controladas (greedy, sin self-consistency), sirve como baseline reproducible para comparar otras tecnicas de compresion de razonamiento.
- Analisis de trade-offs entre compresion y precision: permite cuantificar la perdida de precision al comprimir el razonamiento a nivel simbolico frente a niveles mas verbosos (L1 a L5).
- Verificacion de buenas practicas en publicacion de adaptadores: el codigo de verificacion `lora_B != 0` y la documentacion del fallo con atencion fusionada sirven como referencia metodologica para otros investigadores.
- Pruebas de integracion con PEFT: el flujo de carga (SFT, merge, GRPO adapter) demuestra como apilar multiples adaptadores LoRA sobre un modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Razonamiento matematico | GSM8K | test | Precisión (coincidencia exacta) | 78,3% |

Condiciones de evaluacion: n=1317, decodificacion greedy, single-turn, sin ejemplos, sin self-consistency. El autor indica que el intervalo de confianza al 95% tiene una semiamplitud de ~2,7 puntos porcentuales para n=1317.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, pero requiere cargar el modelo base Olmo-3-7B-Think completo (7B parametros, ~14 GB en bf16).
- Entrenamiento: 1x NVIDIA A100 80GB (segun la configuracion publicada).
- Inferencia: cabe en GPUs de consumo con 16-24 GB de VRAM (RTX 4090, RTX 4080, RTX 3090) con el modelo base en bf16 o cuantizado.
- El adaptador debe cargarse sobre el modelo SFT fusionado de nivel L3 (`ssurface/cot-dialect-olmo3-7b-think-sft-l3`), no sobre el base sin entrenar.
- Opciones de despliegue: `transformers` + PEFT (carga directa), o exportacion a GGUF para llama.cpp/Ollama tras fusionar con el modelo base.
- No se dispone de datos de latencia ni throughput en produccion.

## Comparativa con modelos similares

| Modelo | Tipo | Precision GSM8K | Notas |
|---|---|---|---|
| ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l3 (este) | LoRA + GRPO | 78,3% | Ablacion con recompensa early_solve |
| ssurface/cot-dialect-olmo3-7b-think-grpo-l3 | LoRA + GRPO | No disponible | Modelo principal del nivel L3 (misma compresion, recompensa estandar) |
| ssurface/cot-dialect-olmo3-7b-think-sft-l3 | LoRA + SFT | No disponible | Modelo SFT previo al GRPO, sobre el que se apila este adaptador |
| allenai/Olmo-3-7B-Think | Modelo base 7B | No disponible | Modelo base sin adaptador |

Nota: no se dispone de resultados de benchmarks para los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de ablacion: fue entrenado para responder una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Requiere apilarse sobre el modelo SFT fusionado de nivel L3; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce el resultado declarado.
- Entrenado y evaluado unicamente en problemas de palabras matematicas (GSM8K); no generaliza a otras tareas.
- La precision cae con la dificultad del problema, especialmente en los niveles comprimidos.
- Entrenado con una sola semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico.
- Solo soporta ingles.
- No hay datos sobre latencia, throughput ni requisitos de memoria en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l3
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT de nivel L3 (requerido como base): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l3
- Modelo principal del nivel L3
