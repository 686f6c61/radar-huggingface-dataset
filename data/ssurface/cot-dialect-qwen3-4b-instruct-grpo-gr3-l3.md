# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l3

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l3` es un adaptador LoRA de la colección *Chain-of-Thought Compression Dialects*, desarrollado por Anatolii Frolov (usuario `ssurface`). Se trata de una **ablación de diseño de recompensa**, no de un modelo principal: su propósito es permitir reproducir la comparación entre variantes de recompensa en el entrenamiento con GRPO para compresión de cadenas de razonamiento. El adaptador se aplica sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` y entrena al modelo para razonar a un **nivel de compresión L3**, donde cada línea de la cadena de pensamiento contiene una única asignación simbólica (por ejemplo, `p = 40`).

El modelo fue entrenado con GRPO sobre el dataset GSM8K (6970 ejemplos reexpresados por un modelo profesor a nivel L3), con una mediana de longitud de cadena de 90 caracteres dentro de la etiqueta `thinking`. La recompensa combina `correctness`, `format` y un componente novedoso `gr3` que aplica un reescalado multiplicativo a las recompensas positivas, con un suelo de 0.3. El adaptador se publica bajo licencia Apache 2.0 y está pensado para la comunidad de investigación en compresión de razonamiento y RL.

Su relevancia actual radica en que aborda un problema práctico: el coste de tokens de las cadenas de pensamiento largas. Este adaptador permite estudiar cómo afecta el diseño de la recompensa a la calidad del razonamiento comprimido, un aspecto clave para el despliegue eficiente de modelos de razonamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B-Instruct-2507 (base) + adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 4B (modelo base) + LoRA (tamano del adaptador no disponible; repo de 0.1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bf16, sin cuantizaciones adicionales documentadas) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se apila sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only con atención de ventana completa. El adaptador fue entrenado con GRPO sobre el modelo SFT de nivel L3 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l3`), no sobre el modelo base directamente. El entrenamiento utilizó `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa` (sin kernels fusionados), con 8 generaciones por prompt, batch efectivo de 64, longitud máxima de completación de 256 tokens, tasa de aprendizaje 1e-5, coeficiente KL de 0 y LoRA con r=16 y alpha=32. El hardware fue una única NVIDIA A100 de 80 GB.

La recompensa combina tres componentes: `correctness`, que asigna un valor proporcional al número de pasos de la solución dorada cuando la respuesta coincide; `format`, que exige una estructura `thinking...response` seguida de `#### <answer>`; y `gr3`, un reescalado multiplicativo de la recompensa combinada positiva con un suelo de 0.3, diseñado para no alterar el orden entre respuestas correctas e incorrectas. El autor advierte que el uso de kernels fusionados producía adaptadores con matrices `lora_B` todas a cero, por lo que todos los adaptadores publicados fueron verificados con `lora_B != 0`.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas a nivel simbolico (una asignacion por linea).
- Generacion de cadenas de razonamiento muy cortas: mediana de 90 caracteres dentro de `thinking` para el nivel L3.
- Compatible con el formato de salida `#### <answer>` para respuestas finales.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingues: solo ingles.
- Capacidades especiales: ninguna adicional (sin vision, sin audio, sin modo thinking explicito mas alla de la compresion).

## Casos de uso

- Investigacion academica sobre compresion de cadenas de pensamiento: permite reproducir el experimento de ablacion de recompensa `gr3` y comparar con el modelo principal `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l3` para validar el diseno de recompensas en GRPO.
- Evaluacion de pipelines de RL para razonamiento: sirve como artefacto de referencia para estudiar el impacto de recompensas multiplicativas en la calidad del razonamiento comprimido.
- Generacion de explicaciones concisas para problemas matematicos: el nivel L3 produce cadenas de solo 90 caracteres de media, adecuadas para aplicaciones donde el coste de tokens de razonamiento debe minimizarse.
- Comparacion de dialectos de compresion: junto con los adaptadores de niveles L1 a L5, permite medir el equilibrio entre longitud de cadena y precision en tareas de matematicas.
- Validacion de tecnicas de entrenamiento con LoRA: el adaptador documenta un problema conocido con kernels fusionados (matrices `lora_B` nulas) y puede usarse como caso de estudio para verificar la integridad de adaptadores entrenados con GRPO.
- Prototipado de sistemas de razonamiento de bajo coste: aunque es una ablacion, puede integrarse en entornos donde se necesite razonamiento simbolico breve y no se requiera el rendimiento optimo del modelo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este adaptador "no fue evaluado por separado" y que los niveles con numeros reportados son los del conjunto principal de la coleccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B-Instruct en bf16 requiere aproximadamente 8-9 GB; el adaptador LoRA anade un overhead minimo. Con cuantizacion 4-bit del modelo base, la VRAM se reduce a unos 4-5 GB.
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento), RTX 3090, RTX 4090, o cualquier GPU con al menos 8 GB de VRAM para bf16 sin cuantizar.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas consumer como RTX 3060 12GB o superiores si se cuantiza el modelo base.
- Opciones de despliegue: `transformers` con `peft` (cargando primero el adaptador SFT L3 y luego este), o `vLLM` con soporte de LoRA. No es compatible con `llama.cpp` ni `Ollama` al ser un adaptador LoRA y no un modelo completo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos disponibles. Este adaptador es una ablacion del modelo principal `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l3`, que comparte el mismo nivel de compresion L3 pero con una recompensa diferente. Se espera que este adaptador tenga un rendimiento inferior al modelo principal, ya que fue entrenado para responder a una pregunta especifica sobre diseno de recompensas. No se dispone de comparaciones con otros modelos de razonamiento como Llama 3.1 8B o Mistral 7B en tareas de compresion de CoT.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabras (GSM8K); no generaliza a otros dominios.
- La precision disminuye con la dificultad del problema, y el efecto es mas pronunciado en niveles de compresion altos.
- Es una ablacion de investigacion: puede ser peor que el modelo principal del mismo nivel y no debe usarse en produccion sin una evaluacion adicional.
- Requiere cargar primero el adaptador SFT de nivel L3 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l3`) sobre el modelo base; cargarlo directamente sobre `Qwen/Qwen3-4B-Instruct-2507` no reproduce los resultados documentados.
- Entrenado con una sola semilla; diferencias de unos pocos puntos porcentuales pueden deberse al ruido (intervalo de confianza del 95% de aproximadamente 2.7 puntos porcentuales con n=1317).
- Riesgo de alucinacion en problemas fuera de la distribucion de entrenamiento, especialmente con cadenas de razonamiento muy comprimidas.
- Solo soporta ingles; no hay soporte multilingue.
- No se documentan sesgos especificos, pero al entrenarse solo en GSM8K puede heredar sesgos del dataset original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l3
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l3
- Adaptador SFT de nivel L3 (requerido): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Referencia citada: Frolov, Anatolii. "Chain-of-Thought Compression Dialects" (2026), preprint sin URL publica disponible.
