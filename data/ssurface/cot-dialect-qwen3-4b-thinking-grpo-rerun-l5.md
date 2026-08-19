# ssurface/cot-dialect-qwen3-4b-thinking-grpo-rerun-l5

## Resumen

El modelo `ssurface/cot-dialect-qwen3-4b-thinking-grpo-rerun-l5` es un adaptador LoRA (librería `peft`) que modifica el modelo base `Qwen/Qwen3-4B-Thinking-2507` para razonar con cadenas de pensamiento extremadamente comprimidas, en el nivel denominado L5 (una única expresión colapsada, con una mediana de 16 caracteres dentro de la etiqueta `thinking`). Lo desarrolla el autor `ssurface` (Anatolii Frolov) como parte de una investigación sobre compresión de cadenas de razonamiento (Chain-of-Thought Compression Dialects). Este adaptador concreto es una **ablación**: se entrenó con un diseño de recompensa distinto al del modelo principal del mismo nivel (`ssurface/cot-dialect-qwen3-4b-thinking-grpo-l5`) para permitir reproducir la comparación de recompensas descrita en el artículo asociado.

El adaptador se entrenó con GRPO sobre el modelo SFT fusionado para el nivel L5, usando el conjunto GSM8K de entrenamiento re-expresado por un modelo teacher (6993 ejemplos). El resultado declarado es un 79,1% de precisión exacta en GSM8K test. No es un modelo de propósito general, sino una herramienta de investigación para estudiar el efecto de comprimir el razonamiento en la precisión de tareas matemáticas. El adaptador pesa 0,1 GB y se distribuye en formato `safetensors` bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre Qwen3-4B-Thinking-2507 (transformer decoder-only) |
| Parametros totales | no disponible (adaptador de 0,1 GB; el modelo base tiene 4B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la documentacion del adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se apila sobre `Qwen/Qwen3-4B-Thinking-2507`, un transformer decoder-only de 4B parametros con atencion `sdpa`. El entrenamiento se realizo en dos fases: primero, un ajuste fino supervisado (SFT) sobre el modelo base con cadenas de razonamiento comprimidas a nivel L5 (generadas por un modelo teacher a partir de GSM8K train, 6993 ejemplos, mediana de 16 caracteres dentro de `thinking`); despues, un entrenamiento con GRPO (usando `trl.GRPOTrainer` sobre `transformers` estandar) con dos componentes de recompensa: `correctness` (que pondera segun el numero de pasos de la solucion dorada) y `format` (que exige un bloque `thinking...` seguido de `response` y `#### <answer>`). Se uso loss tipo DAPO, KL coefficient beta=0.0, 8 generaciones por prompt, batch de 16 con 2 acumulaciones, max completion de 256 tokens y learning rate de 1e-05. El entrenamiento se ejecuto en una unica NVIDIA A100 80GB.

Un detalle tecnico destacable: el autor advierte que el uso de kernels fusionados (fused-kernel wrapper) producia adaptadores con matrices `lora_B` todas a cero, por lo que se opto por `transformers` estandar con atencion `sdpa`. Todos los adaptadores publicados fueron verificados con `lora_B != 0` antes de su publicacion.

## Capacidades

- Razonamiento matematico: resuelve problemas de aritmetica y palabras del conjunto GSM8K con cadenas de pensamiento extremadamente comprimidas (una sola expresion, p. ej. `18/3*2=12`).
- Generacion de texto con formato estructurado: produce una respuesta que contiene un bloque `thinking` (el razonamiento comprimido) y un bloque `response` que termina con `#### <answer>`.
- Compresion de cadenas de razonamiento: el adaptador fuerza al modelo a emitir razonamientos de longitud minima (nivel L5), lo que reduce drasticamente el numero de tokens generados en inferencia.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking explicito (el "thinking" es parte del formato de salida, no un modo de razonamiento interno).
- Multilingue: solo ingles.

## Casos de uso

- Investigacion sobre compresion de cadenas de razonamiento: permite estudiar como afecta la reduccion de la longitud del CoT a la precision en tareas matematicas, comparando los niveles L1 a L5 de la familia de adaptadores del mismo autor.
- Ablacion para diseno de recompensas en RL: este adaptador concreto sirve para reproducir la comparacion entre el esquema de recompensa del modelo principal (`grpo-l5`) y el de esta variante `rerun`, tal como se describe en el articulo "Chain-of-Thought Compression Dialects".
- Benchmarking de razonamiento con presupuesto de tokens limitado: al generar cadenas de solo 16 caracteres, el coste de inferencia por problema es minimo, lo que permite evaluar el rendimiento en entornos con restricciones de latencia o de coste.
- Estudio de la relacion entre longitud de CoT y precision: combinando los adaptadores de distintos niveles (L1 a L5), se puede trazar una curva de precision frente a longitud de razonamiento.
- Generacion de explicaciones ultra-concisas para problemas aritmeticos: aunque el formato es extremadamente comprimido, puede usarse para producir justificaciones de una sola linea en aplicaciones educativas o de verificacion automatica.
- Reproducibilidad de experimentos de RL: el adaptador incluye todos los hiperparametros de entrenamiento (GRPO, loss DAPO, beta=0.0, etc.), lo que facilita replicar el experimento o modificarlo para nuevas variantes.

## Benchmarks y rendimiento

El autor declara un unico resultado en la model card, obtenido con decoding greedy, una sola vuelta, sin ejemplos y sin self-consistency:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 79,1% |

No se han publicado resultados comparativos con el modelo base ni con otros adaptadores de la misma familia en la informacion disponible. El autor indica que este adaptador es una ablacion y puede ser peor que el modelo principal del mismo nivel (`grpo-l5`).

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero requiere cargar el modelo base completo `Qwen/Qwen3-4B-Thinking-2507` (4B parametros).
- VRAM estimada para inferencia: con el modelo base en bfloat16, se necesitan aproximadamente 8 GB de VRAM mas overhead de activaciones y cache; con cuantizacion 4-bit, unos 3-4 GB. Estas cifras son estimaciones generales para modelos de 4B, no valores declarados por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (p. ej. RTX 3070/4080, A10, A100) o 4 GB con cuantizacion (p. ej. RTX 3060, RTX 4060). El entrenamiento se realizo en una A100 80GB.
- Opciones de despliegue: `transformers` con `peft` (cargando primero el adaptador SFT y fusionandolo, luego este adaptador GRPO), o fusionando ambos adaptadores y convirtiendo a GGUF para `llama.cpp` u `Ollama`. Tambien es posible servir con `vLLM` si se fusiona previamente.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al generar cadenas de razonamiento de solo 16 caracteres, la latencia por peticion sera baja en comparacion con modelos que generan CoT largos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. El propio autor indica que este adaptador es una ablacion del modelo principal `ssurface/cot-dialect-qwen3-4b-thinking-grpo-l5` (mismo nivel L5, distinto diseno de recompensa) y que puede tener peor rendimiento. Tampoco se publican resultados del modelo base `Qwen3-4B-Thinking-2507` en GSM8K en la informacion disponible. La comparativa con otros adaptadores de compresion de CoT (niveles L1-L4) no esta documentada en los materiales proporcionados.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas (GSM8K); no es adecuado para otras tareas de lenguaje general.
- La precision cae con la dificultad del problema, especialmente en los niveles de compresion mas altos como L5.
- Es un artefacto de ablacion: fue entrenado para responder una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- El resultado declarado (79,1%) proviene de una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido (intervalo de confianza del 95% de aproximadamente ±2,7 puntos en n=1317).
- Para reproducir el resultado es obligatorio cargar primero el adaptador SFT `ssurface/cot-dialect-qwen3-4b-thinking-sft-l5`, fusionarlo con el modelo base, y despues aplicar este adaptador GRPO. Cargarlo directamente sobre `Qwen/Qwen3-4B-Thinking-2507` no reproduce la precision declarada.
- Solo soporta ingles.
- No es un modelo de produccion: su proposito es investigacion y experimentacion.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento fuera del ambito de estudio.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-thinking-grpo-rerun-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Adaptador SFT necesario (paso previo): `ssurface/cot-dialect-qwen3-4b-thinking-sft-l5` (no se proporciona URL directa)
- Articulo citado: "Chain-of-Thought Compression Dialects" de Anatolii Frolov (2026), referencia en la model card.
