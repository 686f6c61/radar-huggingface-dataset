# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3chain-l4

## Resumen

El modelo `ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3chain-l4` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) que modifica el modelo base `Qwen/Qwen3-4B-Instruct-2507` para razonar en un "dialecto" de chain-of-thought ultracomprimido, denominado nivel L4. En este nivel, el razonamiento se expresa como asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`), reduciendo la longitud mediana de la cadena de razonamiento de 532 caracteres (nivel L1) a 41 caracteres en L4.

Este adaptador es una **abalación de diseño de recompensa**, no un modelo principal: se entrenó con GRPO bajo una variante de recompensa (`gr3chain`) para estudiar cómo afecta el escalado multiplicativo de la recompensa positiva al rendimiento final. No fue benchmarkeado de forma independiente y se publica como artefacto de investigación para permitir reproducir la comparación de recompensas descrita en el paper asociado.

La relevancia del modelo radica en su contribución al estudio de la compresión de chain-of-thought mediante RL, un área de interés para reducir costes de inferencia y latencia en modelos de razonamiento. Al ser un adaptador LoRA ligero (0.1 GB), puede apilarse sobre el modelo SFT del mismo nivel para reproducir experimentos de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen/Qwen3-4B-Instruct-2507 (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; modelo base 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No aplica (adaptador LoRA en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo `Qwen/Qwen3-4B-Instruct-2507` ya fusionado con un adaptador SFT de nivel L4 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`). El entrenamiento usa GRPO con `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`, sin kernels fusionados. La configuración incluye LoRA r=16, alpha=32, batch 64x1, 8 generaciones por prompt, máximo 256 tokens de completado, learning rate 1e-5, coeficiente KL 0.0 y loss tipo DAPO.

La recompensa combina cuatro componentes: `correctness` (basada en el número de pasos de la solución dorada), `format` (exige un bloque `thinking...response` y `#### <answer>`), `chain` (verificador aritmético de la cadena) y `gr3` (reescalado multiplicativo de la recompensa positiva, con suelo en 0.3). El dataset de entrenamiento es GSM8K train reexpresado a nivel L4 por un modelo profesor: 6976 ejemplos con mediana de 41 caracteres de cadena.

Una nota técnica relevante: el autor verificó que las matrices `lora_B` de todos los adaptadores publicados son distintas de cero, descartando 13 adaptadores que cargaban sin error pero eran matemáticamente inertes. El entrenamiento se realizó en una NVIDIA A100 80GB.

## Capacidades

- Razonamiento matematico con chain-of-thought comprimido en nivel L4 (asignaciones encadenadas con punto y coma).
- Generacion de texto en formato estructurado: un bloque `thinking`, un bloque `response` y una respuesta final precedida de `####`.
- Verificacion aritmetica interna de las operaciones escritas en la cadena (via componente `chain`).
- Uso exclusivo en ingles.
- No soporta tool calling, funciones, vision, audio ni modos de agente.
- No incluye modo "thinking" explicito mas alla del formato de cadena comprimida.

## Casos de uso

- Investigacion sobre compresion de chain-of-thought: permite estudiar como el diseno de recompensa (en este caso, el escalado `gr3`) afecta a la calidad del razonamiento comprimido frente a otras variantes de la misma familia.
- Reproduccion de experimentos de RL: al ser una abalacion publicada, sirve para reejecutar la comparacion de recompensas descrita en el paper sin necesidad de reentrenar.
- Analisis de trade-off entre longitud de razonamiento y precision: con cadenas de 41 caracteres de mediana, se puede evaluar cuanta informacion se pierde al comprimir el CoT en problemas aritmeticos.
- Benchmarking de eficiencia de inferencia: al reducir la longitud de los tokens generados, se puede medir el ahorro en latencia y coste computacional frente al modelo base sin compresion.
- Estudio de robustez de la verificacion aritmetica: el componente `chain` permite analizar si el modelo mantiene consistencia interna en operaciones encadenadas.
- Desarrollo de dialectos de razonamiento: como artefacto de investigacion, sirve de base para explorar otros niveles de compresion (L1 a L5) o variantes de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este adaptador "no fue benchmarkeado de forma independiente" y que los niveles con numeros reportados pertenecen al conjunto principal de la coleccion. Cualquier dato de rendimiento deberia obtenerse mediante evaluacion propia.

## Requisitos de hardware

- Inferencia: requiere cargar el modelo base `Qwen/Qwen3-4B-Instruct-2507` (4B parametros) en bf16, lo que supone aproximadamente 8-10 GB de VRAM, mas el adaptador LoRA (0.1 GB). Puede ejecutarse en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB), e incluso en GPUs de 16 GB con cuantizacion del modelo base.
- Entrenamiento: se realizo en 1x NVIDIA A100 80GB, aunque no se especifica el tiempo ni el consumo exacto de memoria.
- Despliegue: al ser un adaptador PEFT, debe fusionarse con el modelo base antes de servir. No se mencionan integraciones con vLLM, llama.cpp u Ollama; el flujo recomendado usa `transformers` y `peft`.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3chain-l4` | LoRA sobre Qwen3-4B-Instruct-2507 | 4B (base) | No disponible | Apache-2.0 | Abalacion, sin benchmarks |
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4` | LoRA sobre Qwen3-4B-Instruct-2507 | 4B (base) | No disponible | Apache-2.0 | Modelo principal del nivel L4 |
| `Qwen/Qwen3-4B-Instruct-2507` | Transformer denso | 4B | No disponible | Apache-2.0 | Modelo base sin compresion |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia clave entre el adaptador `gr3chain` y el modelo principal `grpo-l4` es el componente de recompensa `gr3` (reescalado multiplicativo), que es el objeto de estudio de esta abalacion. No hay modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabra (GSM8K); no generaliza a otros dominios.
- La precision disminuye con la dificultad del problema, y esta caida es mas pronunciada en los niveles comprimidos como L4.
- Es una abalacion de investigacion: puede ser peor que el modelo principal del mismo nivel (`grpo-l4`) y no debe usarse en produccion.
- Requiere cargar primero el adaptador SFT de nivel L4 y fusionarlo antes de aplicar este adaptador GRPO; cargarlo directamente sobre el modelo base no reproduce los resultados.
- No se han publicado resultados de benchmarks; cualquier uso comparativo requiere evaluacion propia.
- Entrenado con una sola semilla (salvo que el nombre del repo indique lo contrario), por lo que diferencias de unos pocos puntos porcentuales pueden ser ruido estadistico (intervalo de confianza del 95% de ~2.7 pp con n=1317).
- Solo soporta ingles; no hay soporte multilingue.
- La compresion del razonamiento puede ocultar errores aritmeticos que el verificador `chain` no detecte en todos los casos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3chain-l4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador SFT de nivel L4 (requerido para el flujo de carga): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l4
- Modelo principal del nivel L4 (para comparacion): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4
- Paper asociado (cita en la model card): "Chain-of-Thought Compression Dialects" de Anatolii Frolov, 2026.
