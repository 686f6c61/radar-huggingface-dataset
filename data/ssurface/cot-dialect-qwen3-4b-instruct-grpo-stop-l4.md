# ssurface/cot-dialect-qwen3-4b-instruct-grpo-stop-l4

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-stop-l4` es un adaptador LoRA de tipo PEFT que se monta sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el autor ssurface (Anatolii Frolov) como parte de la colección *Chain-of-Thought Compression Dialects*. Su propósito es hacer que el modelo razone en un "dialecto" de razonamiento comprimido de nivel L4, donde las cadenas de pensamiento se expresan como asignaciones encadenadas con punto y coma (p. ej. `K=18*2.5;D=8*4;T=K+D->T=77`), reduciendo la longitud mediana de la cadena de razonamiento a 41 caracteres frente a los 532 del nivel L1.

Este adaptador es un **artefacto de ablación**, no uno de los modelos principales de la colección: se entrenó con una variante de recompensa distinta (incluye el componente `stop`) para permitir que la comparación de diseño de recompensas del artículo pueda reproducirse de forma independiente. El modelo principal del mismo nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4`. No ha sido evaluado por separado y su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B-Instruct-2507) + adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 4B (modelo base) + adaptador LoRA (~0.1 GB en repo) |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no especificado; pesos del adaptador en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante **GRPO** (Group Relative Policy Optimization) con el `trl.GRPOTrainer` sobre `transformers` estándar y atención `sdpa`, partiendo del modelo SFT fusionado de nivel L4 (no del base crudo). El loss es de tipo **dapo**, con 8 generaciones por prompt, batch de 64 con acumulacion 1, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL (beta) igual a 0.

La funcion de recompensa combina cinco componentes: `correctness` (ponderada por el numero de pasos de la solucion de referencia), `format` (exige un bloque ` thinking... response` seguido de `#### <respuesta>`), `sft_length` (penaliza desviaciones respecto a la longitud de la cadena SFT de esa fila), `stop` (penaliza no emitir el token de fin) y `gdpo` (normaliza cada recompensa dentro del grupo antes de sumar). Los datos de entrenamiento son 6976 ejemplos del conjunto de train de GSM8K re-expresados a nivel L4 por un modelo profesor, con longitud mediana de cadena de 41 caracteres.

Un detalle tecnico relevante: el autor advierte que el pipeline con kernels fusionados produjo adaptadores con matrices `lora_B` a cero (matematicamente inertes), por lo que se verifico `lora_B != 0` en todos los adaptadores publicados; 13 que fallaron esa comprobacion fueron retirados.

## Capacidades

- Razonamiento aritmetico comprimido: resuelve problemas de matematicas de palabras (GSM8K) generando cadenas de pensamiento ultra-cortas en notacion de asignaciones encadenadas.
- Generacion de texto conversacional: hereda las capacidades de generacion del modelo base Qwen3-4B-Instruct-2507, aunque el adaptador esta especializado en el dialecto comprimido.
- Formato de salida estructurado: la recompensa `format` fuerza una estructura fija de bloque de pensamiento y respuesta con `#### <respuesta>`.
- Compresion de razonamiento: la familia completa abarca niveles de L1 a L5 con longitudes medianas de 532 a 16 caracteres (rango 33x); este adaptador corresponde al nivel L4.
- Tool calling y funciones de agente: no especificado para este adaptador; depende del modelo base.
- Multilingue: no, solo ingles (el dataset GSM8K y las plantillas de prompt estan en ingles).

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: este adaptador es un artefacto de ablacion disenado para reproducir la comparativa de diseno de recompensas del articulo; se usa cargandolo junto al adaptador SFT de nivel L4 y comparando su rendimiento con el del modelo principal `cot-dialect-qwen3-4b-instruct-grpo-l4`.
- Evaluacion de robustez de recompensas: permite aislar el efecto del componente `stop` en la calidad del razonamiento comprimido, util para investigadores que disenan pipelines GRPO propios.
- Razonamiento matematico en entornos con restricciones de latencia: la compresion a 41 caracteres reduce drasticamente el numero de tokens generados, lo que acelera la inferencia en problemas aritmeticos simples.
- Benchmarking de dialectos de razonamiento: sirve como punto de comparacion dentro de la grid de niveles L1-L5 para estudiar la relacion entre compresion y precision.
- Fine-tuning posterior: al ser un adaptador LoRA ligero (0.1 GB), puede servir como punto de partida para experimentos de continuacion de entrenamiento con otras recompensas.
- Reproducibilidad academica: su publicacion explicita como artefacto de ablacion permite a otros grupos verificar las afirmaciones del paper sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este adaptador **no fue evaluado por separado** y que existe como artefacto de entrenamiento para la grid de ablaciones; los niveles con numeros reportados pertenecen al conjunto principal de la coleccion.

## Requisitos de hardware

- Inferencia: al ser un adaptador LoRA sobre un modelo denso de 4B, cabe en GPUs de consumo con 16 GB de VRAM (p. ej. RTX 4080/4090) en bfloat16; con cuantizacion de 8 o 4 bits puede ejecutarse en 8-12 GB.
- Entrenamiento: se entreno con 1x NVIDIA A100 80GB; el coste de reproduccion es moderado dado el tamano del modelo base y los 6976 ejemplos.
- Despliegue: compatible con el stack de HuggingFace `transformers` + `peft`; requiere cargar primero el adaptador SFT de nivel L4 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`), fusionarlo, y despues cargar este adaptador.
- Latencia: no disponible; el numero de tokens de salida es muy reducido (cadenas de ~41 caracteres), lo que sugiere latencias bajas en comparacion con cadenas de razonamiento completas.
- Opciones de despliegue adicionales (vLLM, llama.cpp, Ollama, TGI): no documentadas para este adaptador especifico; el modelo base Qwen3-4B-Instruct-2507 es compatible con estos motores, pero la naturaleza de doble adaptador PEFT requiere fusion previa.

## Comparativa con modelos similares

| Modelo | Tipo | Recompensa GRPO | Evaluado | Uso previsto |
|---|---|---|---|---|
| `cot-dialect-qwen3-4b-instruct-grpo-l4` | LoRA sobre Qwen3-4B-Instruct-2507 | correctness, format, sft_length, gdpo (sin `stop`) | Si (modelo principal) | Modelo de referencia del nivel L4 |
| `cot-dialect-qwen3-4b-instruct-grpo-stop-l4` (este) | LoRA sobre Qwen3-4B-Instruct-2507 | correctness, format, sft_length, stop, gdpo | No | Artefacto de ablacion para comparar el efecto de `stop` |
| `cot-dialect-qwen3-4b-instruct-sft-l4` | LoRA sobre Qwen3-4B-Instruct-2507 | SFT (sin GRPO) | No especificado | Etapa previa obligatoria antes de cargar este adaptador |
| `Qwen3-4B-Instruct-2507` (base) | Modelo denso completo | no aplica | Si (reportes oficiales Qwen) | Modelo generalista de 4B |

No se dispone de datos de rendimiento comparativos (MMLU, HumanEval, GSM8K) para este adaptador en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de ablacion: fue entrenado para responder una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- No evaluado por separado: no hay numeros de precision propios; cualquier comparacion debe hacerse con cautela.
- Requiere doble carga: debe apilarse sobre el adaptador SFT de nivel L4 fusionado; cargarlo directamente sobre `Qwen/Qwen3-4B-Instruct-2507` no reproduce los resultados.
- Dominio limitado: entrenado y evaluado solo en problemas de matematicas con palabras (GSM8K); no es adecuado para otros dominios sin validacion.
- Degradacion con dificultad: la precision cae con la dificultad del problema, y mas rapidamente en los niveles comprimidos.
- Ruido estadistico: entrenado con una sola semilla; diferencias de un par de puntos porcentuales estan dentro del ruido (semi-anchura del 95% de ~2.7 pp en n=1317).
- Solo ingles: no soporta otros idiomas.
- Riesgo de alucinacion: la compresion extrema del razonamiento puede aumentar la probabilidad de errores aritmeticos silenciosos, ya que los pasos intermedios no se explican.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-stop-l4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4
- Adaptador SFT previo (obligatorio): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l4
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
