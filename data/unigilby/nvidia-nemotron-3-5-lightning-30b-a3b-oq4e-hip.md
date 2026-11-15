# unigilby/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-HIP

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-HIP es una cuantización de 4 bits (esquema oQ4e, anchos mixtos) del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicada por el usuario unigilby. El checkpoint está empaquetado en formato MLX con un diseño de memoria específico (layout HIP) para que el motor nativo TensorFold pueda ejecutarlo sobre GPUs AMD, en particular la iGPU Radeon 8060S (`gfx1151`) de los procesadores Strix Halo. El modelo base es un transformer híbrido de la familia Nemotron con capas Mamba y atención, y arquitectura MoE con 30B parámetros totales y 3B activos por token.

La relevancia de esta ficha es doble. Por un lado, documenta una de las pocas alternativas prácticas para servir un modelo de 30B en hardware AMD de consumo con memoria unificada de 128 GB. Por otro, es un ejemplo de cuantización quirúrgica: los expertos enrutados se comprimen a 4 bits mientras que proyecciones Mamba, atención, expertos compartidos, embedding y cabeza de salida se mantienen a 5, 6 u 8 bits, con el router en bf16. El resultado ocupa 17,99 GiB en disco y 25,14 GiB de memoria de GPU tras la carga con contexto de 131.072 tokens y 4 secuencias paralelas.

Es importante señalar que este checkpoint no es un modelo nuevo ni un fine-tuning: es un artefacto de cuantización con requisitos de software muy concretos (una build de TensorFold con tres pull requests no fusionados). Sin esa build, el motor rechaza el modelo en la fase de admisión o de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `nemotron_h` (capas Mamba + atención) con mezcla de expertos (MoE) y cabeza de predicción multi-token (MTP) |
| Parametros totales | 31.577.940.288 (31,58B) |
| Parametros activos | 3B (A3B, según el nombre del modelo base) |
| Longitud de contexto | 131.072 tokens (valor usado en la configuración de servicio medida) |
| Tipos de cuantizacion | MLX affine, grupo 64, anchos mixtos: 4 bits (expertos enrutados), 5 bits (algunas `q_proj`), 6 bits (mayoría de proyecciones Mamba y atención, `lm_head`), 8 bits (expertos compartidos, embedding, parte de Mamba y atención); router y parámetros Mamba auxiliares en bf16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (MLX), shards `model-*.safetensors` + `mtp-4bit.safetensors` separado |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Nemotron y combina capas Mamba (modelos de espacio de estados) con capas de atención clásica, más una estructura MoE. Según los recuentos de tensores del checkpoint, hay 23 capas con MoE (cada una con expertos enrutados `fc1`/`fc2` y expertos compartidos `up`/`down`), 23 proyecciones Mamba `in_proj` y `out_proj`, y 6 bloques de atención con sus proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. El router (`mixer.gate.weight`) se conserva en bf16 para no degradar la selección de expertos. El checkpoint incluye además una cabeza de predicción multi-token (MTP) cuantizada a 4 bits en un archivo aparte, que actúa como modelo borrador para decodificación especulativa.

Sobre el entrenamiento del modelo base no hay información en la documentación proporcionada: no se detallan número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí está documentado es el proceso de cuantización: se usó calibración con imatrix (el repo incluye `oq_imatrix_report.json`), con un presupuesto planificado de 4,70 bits por peso y 118 "boosts" en el plan en seco, y los anchos finales se ajustaron según las sensibilidades de la imatrix. La innovación técnica destacable no está en el modelo sino en el empaquetado: un ancho de bits por matriz, grupo 64 en todas, y un layout compatible con el motor HIP nativo de TensorFold para GPUs AMD.

## Capacidades

- Generación de texto conversacional y de código, según el `pipeline_tag` (`text-generation`) y el `chat_template.jinja` heredado del modelo base.
- Razonamiento con modo "thinking" activado por defecto en la plantilla de chat, según la configuración usada en las mediciones.
- Decodificación especulativa mediante la cabeza MTP incluida (`mtp-4bit.safetensors`), con una media de 2,40 tokens aceptados por ronda de verificación en la benchmark completa.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible; el checkpoint es solo de texto.

## Casos de uso

- Inferencia local de un modelo de 30B en hardware AMD de consumo: con 128 GB de memoria unificada (Strix Halo, Ryzen AI MAX+ 395) el checkpoint ocupa 25,14 GiB en uso tras la carga, lo que deja margen para contexto largo y varias secuencias en paralelo sin GPU dedicada.
- Asistente de código en estación de trabajo: el modelo alcanza 66,2 tok/s en decodificación simple sobre código (T=1) y 95,4 tok/s con borradores MTP activados, suficiente para autocompletado interactivo y generación de fragmentos en un IDE local.
- Procesamiento de documentos largos: con 131.072 tokens de contexto y un prefill de 2.148 tok/s en prompts de 28.333 tokens, es adecuado para resumir o extraer información de contratos, informes o bases de código extensas en una sola pasada.
- Servicio multiusuario ligero en una sola máquina: con `--parallel 4` el rendimiento agregado sube a 123,7 tok/s con 2 flujos y 157,9 tok/s con 4, lo que permite atender a un pequeño equipo interno desde un único nodo.
- Evaluación e investigación sobre GPUs AMD: sirve como banco de pruebas para el motor TensorFold y para estudiar el impacto de anchos de bits mixtos en calidad y velocidad, dado que el autor publica cuatro variantes (oQ4e, oQ5e, oQ6e, oQ8e) del mismo modelo.
- Prototipado de pipelines de decodificación especulativa: la cabeza MTP separada y los datos de aceptación (2,40 tokens por ronda) permiten medir y ajustar estrategias de draft en entornos con ancho de banda de memoria limitado.
- Chat conversacional con razonamiento: 66,1 tok/s en decodificación simple y 83,4 tok/s con MTP en modo chat, con plantilla que activa el modo thinking, útil para asistentes técnicos que requieren cadenas de razonamiento antes de responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos son de rendimiento de inferencia, medidos por el autor en un Ryzen AI MAX+ 395 con iGPU Radeon 8060S `gfx1151`, 128 GB de memoria unificada LPDDR5X-8000, motor TensorFold HIP nativo, `--context 131072 --parallel 4`, 256 tokens generados, mediana de 3 ejecuciones:

| Metrica | Valor |
|---|---|
| Decodificación simple, código, T=1 / T=0 | 66,2 / 67,3 tok/s |
| Decodificación simple, chat, T=1 / T=0 | 66,1 / 67,2 tok/s |
| Con borradores MTP, código, T=1 / T=0 | 95,4 / 115,9 tok/s |
| Con borradores MTP, chat, T=1 / T=0 | 83,4 / 87,5 tok/s |
| Tokens por ronda (T=1), código / chat | 2,42 / 2,12 |
| Tokens aceptados por ronda (media, 91 peticiones) | 2,40 |
| Decodificación agregada, 1 / 2 / 4 flujos (T=1) | 97,5 / 123,7 / 157,9 tok/s |
| Prefill en frío, prompt de 2.048 tokens | 0,733 s (2.795 tok/s) |
| Prefill en frío, prompt de 7.099 tokens | 2,680 s (2.649 tok/s) |
| Prefill en frío, prompt de 28.333 tokens | 13,192 s (2.148 tok/s) |
| Tiempo de carga del modelo (disco caliente) | 16 s |

Para contexto, el autor indica que la decodificación simple está limitada por ancho de banda de memoria y cae al aumentar el ancho: 66,2 tok/s (oQ4e), 59,6 (oQ5e), 56,2 (oQ6e) y 52,8 (oQ8e) en código con T=1.

## Requisitos de hardware

- VRAM estimada: 25,14 GiB de memoria de GPU en uso tras la carga e inactivo, con contexto de 131.072 y 4 secuencias paralelas, incluyendo búferes de ejecución. Los pesos planificados por el motor al arrancar son 18,11 GiB; el directorio en disco es de 17,99 GiB.
- GPU recomendadas: el autor solo documenta la iGPU Radeon 8060S (`gfx1151`) de los AMD Strix Halo con 128 GB de memoria unificada. Para GPUs AMD discretas no hay datos publicados, aunque el motor HIP nativo está pensado para ellas.
- GPU de consumo: cabe en hardware de consumo con memoria unificada amplia; el caso medido es un Ryzen AI MAX+ 395 con 128 GB. No hay datos para GPUs de consumo con VRAM dedicada (RTX 4090, etc.).
- Opciones de despliegue: exclusivamente el motor TensorFold nativo HIP, compilado con `zig build native-hip -Dhip-arch=gfx1151` para Strix Halo. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Requisito de software crítico: hace falta una build de TensorFold que incluya los pull requests ashhart/TensorFold #3163, #3242 y #3251, no fusionados en el momento de la publicación. Con la build estándar el motor se detiene en admisión o en carga.
- Invocación medida: `TENSORFOLD_MEMORY_RESERVE_GIB=4 tensorfold-native serve ./NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-HIP --host 127.0.0.1 --port 8080 --context 131072 --parallel 4 --prompt-cache-gib 0`.
- Latencia y throughput: ver la tabla de benchmarks; el prefill en frío va de 2.795 tok/s (prompts cortos) a 2.148 tok/s (prompts de 28K), y la decodificación simple ronda los 66 tok/s en un solo flujo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-HIP (este) | 31,58B totales, 3B activos | 131.072 | MLX safetensors, oQ4e (anchos mixtos, grupo 64) | OpenMDW-1.1 | Hugging Face, requiere TensorFold con PRs #3163/#3242/#3251 |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ5e-HIP | 31,58B totales, 3B activos | 131.072 | MLX safetensors, oQ5e (anchos mixtos) | OpenMDW-1.1 | Hugging Face; 59,6 tok/s en decodificación simple (código, T=1) |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ6e / oQ8e | 31,58B totales, 3B activos | 131.072 | MLX safetensors, oQ6e / oQ8e | OpenMDW-1.1 | No subidos a Hugging Face según la model card; 56,2 y 52,8 tok/s respectivamente |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,58B totales, 3B activos | no disponible | safetensors BF16 | OpenMDW-1.1 | Hugging Face (modelo base) |

No hay datos de benchmarks de calidad ni de modelos competidores de otros fabricantes en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Dependencia de software no fusionado: el checkpoint solo funciona con una build de TensorFold que incluya tres pull requests abiertos y no publicados en release. Esto lo hace inadecuado para producción sin asumir el mantenimiento de un fork.
- Plataforma muy restringida: el layout HIP está pensado para GPUs AMD; no hay soporte para CUDA, Metal ni CPU documentado en esta ficha.
- Idiomas no especificados: se desconoce la cobertura lingüística real del modelo base, lo que impide garantizar calidad en castellano u otros idiomas.
- Riesgo de alucinación: no hay evaluación de calidad publicada; al ser una cuantización agresiva de los expertos enrutados a 4 bits, es plausible cierta degradación respecto al BF16, aunque el autor no aporta métricas de calidad que lo cuantifiquen.
- Sesgos: no disponible; no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia OpenMDW-1.1: es una licencia "other" con texto propio; conviene revisar sus términos antes de uso comercial, ya que las condiciones no se detallan en la información proporcionada.
- Reproducibilidad limitada: las cifras de velocidad provienen de ejecuciones únicas en una sola máquina y el propio autor advierte que los números con T=1 varían entre ejecuciones porque la aceptación del borrador depende del texto muestreado.
- Sin soporte de tool calling ni agentes verificado: no hay documentación que confirme estas capacidades en el checkpoint.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario ante problemas.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/unigilby/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-HIP
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Pull request TensorFold #3163: https://github.com/ashhart/TensorFold/pull/3163
- Pull request TensorFold #3242: https://github.com/ashhart/TensorFold/pull/3242
- Pull request TensorFold #3251: https://github.com/ashhart/TensorFold/pull/3251
