# veritasium/qwen2.5-3b-math-sft-clean-v2

## Resumen

El modelo `veritasium/qwen2.5-3b-math-sft-clean-v2` es un ajuste fino supervisado (SFT) del checkpoint `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el usuario veritasium, orientado a la resolución de problemas matemáticos cuya respuesta final es un número entero. Se trata de una segunda versión que corrige los problemas detectados en un primer intento de SFT con 203 ejemplos, que había provocado una regresión estadísticamente significativa en la precisión. El autor documenta de forma exhaustiva el proceso de auditoría de datos, la configuración de entrenamiento y una evaluación pareada frente al modelo base.

Con 3.085 millones de parámetros y una arquitectura transformer decoder-only, el modelo está pensado para investigación sobre derivaciones matemáticas cortas que terminan en un entero en formato `\boxed{integer}`. Su relevancia radica en la transparencia metodológica: incluye un ledger de revisión de datos, una evaluación con control pareado y un análisis de transiciones entre aciertos y errores, algo poco habitual en modelos de este tamaño. No es un verificador general ni un asistente matemático de propósito amplio, sino un experimento controlado de fine-tuning conservador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (maximo de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar) |
| Idiomas soportados | no disponible (heredado del base, principalmente ingles y chino) |
| Licencia | qwen-research (licencia de investigacion de Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct` (revision `a1d308dfcc03e09da285d49d912439a655a571e8`) y aplica un ajuste fino con LoRA de rango 8 y alpha 16 sobre las proyecciones `q_proj` y `v_proj` de la atencion. El entrenamiento se realizo con 190 ejemplos limpios (tras auditar 203, de los cuales 13 fueron excluidos por ambiguedad o logica no probada), 2 epocas, 22 pasos de optimizacion, batch efectivo de 16, learning rate 5e-6 con schedule coseno y 1 paso de warmup. La perdida supervisada se calculo solo sobre la completacion, sin mensaje de sistema adicional, y la longitud maxima de secuencia fue de 2048 tokens. El entrenamiento se ejecuto en 2 GPU NVIDIA Tesla V100-SXM2 32GB durante 167,8 segundos.

La innovacion principal no esta en la arquitectura, sino en el proceso: se realizo una auditoria explicita de cada ejemplo de entrenamiento con un ledger de veredictos, se excluyeron respuestas que forzaban el resultado final y se garantizo que cada completacion terminara exactamente en una caja entera. Ademas, se mantuvo una particion de validacion separada y se reportaron metricas pareadas frente al modelo base sin tocar.

## Capacidades

- Generacion de texto con razonamiento matematico paso a paso, orientado a respuestas finales en formato `\boxed{integer}`.
- Razonamiento aritmetico y logico para problemas de derivacion corta (tipicamente menos de 200 tokens de salida).
- Soporte de chat mediante la plantilla de Qwen2.5-Instruct (un solo turno de usuario, sin sistema adicional).
- No soporta tool calling, ni vision, ni audio, ni modo agente.
- Capacidades multilingues limitadas al alcance del modelo base, aunque la evaluacion se realizo en ingles.
- No incluye modo de pensamiento explicito ni decodificacion especulativa.

## Casos de uso

- Evaluacion de modelos de razonamiento matematico: sirve como punto de referencia para medir el impacto de un SFT conservador en tareas de respuesta entera, comparando con el base sin ajustar.
- Generacion de soluciones paso a paso para problemas de matematicas discretas: el modelo produce cadenas de razonamiento cortas que terminan en un entero, util para prototipos de tutoria.
- Auditoria de datos de entrenamiento: el proceso documentado (ledger de veredictos, exclusion de ejemplos ambiguos) puede replicarse en otros proyectos de fine-tuning.
- Experimentos de control de regresion: permite estudiar como evitar caidas de rendimiento al ajustar modelos pequenos con datasets limitados.
- Pruebas de prompt engineering: al estar disenado para un prompt especifico (`targeted-rationale`), es util para investigar la sensibilidad a variaciones de instrucciones.
- Benchmarking de cuantizacion: al ser un modelo de 3B, puede usarse para probar tecnicas de cuantizacion (GPTQ, AWQ, GGUF) en tareas matematicas sin requerir hardware de gran escala.

## Benchmarks y rendimiento

La model card reporta una evaluacion pareada sobre 831 preguntas, con una unica trayectoria muestreada a temperatura 0.7, top-p 0.95, maximo 2048 tokens nuevos, sin cuantizacion y con semillas globales fijas. Los resultados se presentan en varias particiones:

| Slice | Base | Clean v2 | Delta | Exact paired p |
|---|---:|---:|---:|---:|
| Full usable (816) | 369/816 (45.22%) | 374/816 (45.83%) | +0.61pp | 0.511 |
| Clean usable, excluyendo 23 calibration IDs (793) | 368/793 (46.41%) | 374/793 (47.16%) | +0.76pp | 0.405 |
| Full verified only (797) | 364/797 (45.67%) | 368/797 (46.17%) | +0.50pp | - |
| Clean verified only (774) | 363/774 (46.90%) | 368/774 (47.55%) | +0.65pp | - |

La conclusion principal es que la regresion observada en el primer SFT (caida de -10.03 puntos porcentuales) se elimino, aunque la mejora sobre el base es marginal y no estadisticamente significativa (p > 0.4). No se proporcionan resultados en benchmarks estandar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6-7 GB (3.085 millones de parametros), cabe en GPUs consumer como RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4090.
- Con cuantizacion de 8 bits, la VRAM se reduce a unos 3-4 GB; con 4 bits, a unos 2-3 GB, permitiendo ejecucion en GPUs de 6 GB o incluso CPU con llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; para cuantizacion, GPUs de 4-6 GB son suficientes.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), o transformers con `from_pretrained`.
- Latencia y throughput: no se han publicado mediciones especificas; para un modelo de 3B en una GPU moderna, se espera una latencia de decodificacion de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen/Qwen2.5-3B-Instruct (base) | 3.085 M | 32768 tokens (segun documentacion oficial) | Apache 2.0 (para el base) | Chat general |
| veritasium/qwen2.5-3b-math-sft-clean-v2 | 3.085 M | 2048 (entrenamiento) | qwen-research | Matematicas con respuesta entera |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1.540 M | 32768 tokens | Apache 2.0 | Matematicas con CoT y TIR |

No se dispone de comparaciones directas de rendimiento con otros modelos de la misma categoria en la informacion proporcionada. El modelo se evalua solo frente a su base, no frente a alternativas como Qwen2.5-Math.

## Limitaciones y advertencias

- No es un verificador general de pruebas matematicas ni un asistente de proposito amplio; su uso previsto se limita a problemas con respuesta entera y razonamiento corto.
- La licencia `qwen-research` restringe el uso a fines de investigacion; no esta permitido el uso comercial sin autorizacion explicita de Qwen.
- El contexto de entrenamiento es de 2048 tokens, por lo que entradas o salidas mas largas pueden degradar la calidad.
- La evaluacion se realizo con una unica trayectoria muestreada; la variabilidad entre semillas puede ser alta, como indican los valores de p no significativos.
- El modelo puede alucinar razonamientos invalidos que coincidan con la respuesta final, un riesgo inherente a los modelos de lenguaje.
- No se han evaluado sesgos de genero, etnia u otros; al ser un fine-tuning sobre un base multilingue, podria heredar sesgos del modelo original.
- La particion de calibracion (23 ejemplos) se incluyo en el entrenamiento, lo que puede inflar ligeramente las metricas en esa subpoblacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/veritasium/qwen2.5-3b-math-sft-clean-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio Qwen2.5-Math: https://github.com/QwenLM/Qwen2.5-Math
- Blog de Qwen2.5-Math: https://qwen.ai/blog?id=qwen2.5-math
- Informe tecnico de Qwen2.5-Math: https://arxiv.org/html/2409.12122v1
