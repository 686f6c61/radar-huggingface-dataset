# ZZZzzze/LoopLM-sparse-sft-step6000

## Resumen

LoopLM-sparse-sft-step6000 es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo recurrente ByteDance/Ouro-1.4B-Thinking. Lo publica el usuario ZZZzzze como parte de un experimento controlado que compara atencion densa frente a atencion dispersa InfLLM-v2 parcheada en CUDA, dentro de un transformer recurrente de la familia Ouro/LoopLM. El repositorio contiene dos checkpoints BF16 completos (denso y disperso), un runner de evaluacion portatil, las entradas congeladas, 3.084 predicciones registradas y los historiales de perdida de entrenamiento.

El modelo tiene 24 capas fisicas, tamano oculto 2048, 16 cabezas de consulta y 16 de clave/valor con dimension de cabeza 128, y cuatro pasadas recurrentes; la inferencia con cuatro bucles ejecuta 96 pasadas de capa. Cuenta con aproximadamente 1.400 millones de parametros y se entreno con longitud maxima de 16.384 tokens sobre un subconjunto de 400.000 registros de datos de "thinking" de Nemotron-Post-Training-Dataset-v2, con la atencion dispersa activandose solo para entradas largas.

Su relevancia es doble: por un lado explora razonamiento latente mediante recurrencia con compuerta de salida (exit gate); por otro, publica una comparativa reproducible entre atencion densa y dispersa sobre el mismo modelo y datos, algo poco habitual en modelos de este tamano. Ambos checkpoints corresponden al paso 6000 de un plan de 12000 pasos, por lo que son instantaneas intermedias de un entrenamiento inacabado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (LoopLM / Ouro) con atencion densa SDPA o atencion dispersa InfLLM-v2 parcheada en CUDA |
| Parametros totales | ~1.400 millones (1,4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (longitud maxima de entrenamiento); atencion dispersa para entradas largas y ruta densa mientras la longitud KV es inferior a 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer recurrente con 24 capas fisicas, tamano oculto 2048, 16 cabezas de consulta y 16 de clave/valor con dimension de cabeza 128. El modelo aplica cuatro pasadas recurrentes sobre las mismas capas, de modo que la inferencia con cuatro bucles computa 96 pasadas de capa. Incluye una compuerta de salida (exit gate) cuya esperanza de salida se situa en torno a 2,78 bucles cerca del paso 6000; sin embargo, la evaluacion publicada no usa parada adaptativa, sino un numero fijo de cuatro bucles. La variante dispersa emplea atencion InfLLM-v2 con tamano de bloque 64, top-k 16 y un bloque local mas un bloque sink; la seleccion dispersa se aplica en prefill y en decodificacion con cache, manteniendo la cache KV completa. Para entradas cortas (longitud KV inferior a 4096 tokens) se usa la ruta densa.

Ambos checkpoints se entrenaron con SFT completo en BF16 sobre el mismo reservorio de 400.000 registros (semilla 13) de datos de thinking de Nemotron-Post-Training-Dataset-v2, con longitud maxima 16.384 tokens, 8 GPUs, batch por GPU 1, acumulacion 4, batch global 32, AdamW con tasa de aprendizaje 2e-5, betas (0,9, 0,95), weight decay 0, calentamiento del 3% y schedule coseno, clipping 1,0, coeficiente de entropia de compuerta 0,05 y gradient checkpointing no reentrante. Los checkpoints se guardaron cada 1500 pasos y ambos entrenamientos se detuvieron en el paso 6000 de un plan de 12000. El release sustituye las referencias `auto_map` por una implementacion local verificada; los pesos no se modifican.

## Capacidades

- Generacion de texto en ingles con modo "thinking" heredado del modelo base Ouro-1.4B-Thinking.
- Razonamiento latente mediante recurrencia con multiples pasadas sobre las mismas capas fisicas.
- Procesamiento de contexto largo (hasta 16.384 tokens de entrenamiento) mediante atencion dispersa InfLLM-v2 en la variante dispersa.
- Seleccion explicita entre ruta densa y ruta dispersa segun la longitud de entrada.
- Evaluacion de contexto largo sobre los conjuntos LongBench y LongBench-v2 (utilizados en el experimento).
- Soporte de `apply_chat_template` con la opcion `enable_thinking` y parametro `exit_at_step` para controlar el numero de bucles.
- Soporte de cache KV durante la decodificacion.
- No se documentan capacidades de tool calling, function calling, uso de agentes, vision ni audio.

## Casos de uso

- Investigacion en razonamiento latente: permite estudiar el efecto del numero de pasadas recurrentes y la compuerta de salida sobre la calidad de la generacion, comparando denso frente a disperso con los mismos datos y pasos.
- Evaluacion de atencion dispersa: sirve como banco de pruebas reproducible para medir el impacto de InfLLM-v2 (bloque 64, top-k 16, bloque local y sink) frente a atencion densa SDPA.
- Procesamiento de documentos largos en ingles: con 16.384 tokens de contexto de entrenamiento y ruta dispersa para entradas largas, puede resumir o extraer informacion de textos extensos.
- Generacion de texto tecnico o divulgativo: uso directo con `transformers` para tareas de continuacion y respuesta breve en ingles.
- Reproduccion de experimentos academicos: el release incluye entradas congeladas, runner y predicciones registradas, lo que facilita repetir la evaluacion sin acceso al cluster original.
- Punto de partida para ajuste adicional: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como base para futuros SFT o investigacion sobre arquitecturas recurrentes de ~1,4B.
- Estudio de eficiencia de memoria en decodificacion: la comparacion denso/disperso permite analizar el coste de la cache KV y del kernel disperso en GPUs de 40 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona el uso de LongBench y LongBench-v2 y la existencia de 3.084 predicciones registradas, pero no incluye cifras numericas de rendimiento en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 de ~1,4B parametros, cada checkpoint ocupa del orden de 2,8 GB, por lo que la inferencia densa cabe holgadamente en GPUs de 8-12 GB. El repositorio completo pesa 5,8 GB por incluir los dos checkpoints.
- GPU recomendadas: el entorno validado es Linux con una unica NVIDIA A100 40GB (PyTorch 2.7.1+cu126, Transformers 4.56.2, CUDA 12.6). Se usa una GPU al mismo tiempo.
- GPU de consumo: por tamano, el modelo deberia caber en GPUs de consumo con al menos 8-12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4090), aunque el fabricante no valida estos entornos.
- Compilacion del kernel disperso: requiere un CUDA toolkit de desarrollo con `nvcc`, un compilador compatible, git y aproximadamente 9 GB de RAM por worker de compilacion.
- Opciones de despliegue: `transformers` con codigo remoto (`trust_remote_code=True`) usando los checkpoints `dense-step6000` o `sparse-step6000`. La inferencia densa no necesita la extension CUDA opcional. Un backend vLLM con el modelo Ouro integrado no ha sido validado con esta implementacion dispersa. No se documentan rutas GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| LoopLM-sparse-sft-step6000 | ~1,4B | 16.384 tokens | Densa SDPA o dispersa InfLLM-v2 | apache-2.0 | Hugging Face (repo propio) | no disponible |
| ByteDance/Ouro-1.4B-Thinking (base) | ~1,4B | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | no disponible |
| Otros modelos densos de ~1,4-1,5B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks publicados para este checkpoint ni para su modelo base en la informacion proporcionada, por lo que la comparacion de rendimiento queda pendiente de datos.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan capacidades multilingues.
- Es un checkpoint intermedio (paso 6000 de 12000), por lo que su rendimiento no corresponde a un entrenamiento finalizado.
- La variante dispersa depende de una extension CUDA parcheada; si el backend no esta compilado o verificado, el sistema falla en lugar de recurrir silenciosamente a la ruta densa para entradas largas.
- Requiere `trust_remote_code=True`; se recomienda revisar el codigo remoto incluido antes de habilitarlo.
- El despliegue solo se ha validado en Linux con Python 3.11, PyTorch 2.7.1+cu126, Transformers 4.56.2, CUDA 12.6 y una A100 40GB; otros entornos no han sido probados.
- La integracion con vLLM no ha sido validada con esta implementacion dispersa.
- Riesgo de alucinacion: inherente a los modelos generativos; no se aportan datos especificos de evaluacion de veracidad.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo se publica como material de investigacion y no se ofrecen garantias de calidad en produccion.
- El repositorio tiene muy poca traccion (0 descargas, 0 likes en el momento de la consulta), lo que refuerza su caracter experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZZZzzze/LoopLM-sparse-sft-step6000
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Implementacion LoopLM en GitHub: https://github.com/rkstgr/LoopLM
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset de evaluacion LongBench: https://huggingface.co/datasets/THUDM/LongBench
- Dataset de evaluacion LongBench-v2: https://huggingface.co/datasets/THUDM/LongBench-v2
