# ssurface/cot-dialect-qwen3-4b-instruct-grpo-l1

## Resumen

cot-dialect-qwen3-4b-instruct-grpo-l1 es un adaptador LoRA desarrollado por ssurface que modifica el comportamiento de razonamiento del modelo base Qwen/Qwen3-4B-Instruct-2507. Forma parte de una familia de "dialectos de compresion de cadena de pensamiento" que reexpresan el razonamiento en distintos niveles de verbosidad, desde L1 (razonamiento natural completo, con cadenas de mediana de 532 caracteres) hasta L5 (compresion extrema, 16 caracteres). Este adaptador concreto corresponde al nivel L1, el modo mas verboso y explicito.

El entrenamiento aplica GRPO (Group Relative Policy Optimization) sobre el modelo SFT de nivel L1, utilizando el conjunto GSM8K de problemas matematicos. El resultado declarado es un 91,5% de precision exacta en GSM8K test, medio punto porcentual por encima del modelo SFT previo (91,0%). El adaptador pesa solo 0,1 GB y se carga sobre un modelo base de 4B de parametros, lo que lo hace apto para hardware de consumo.

La relevancia del trabajo radica en investigar como el nivel de verbosidad de la cadena de pensamiento afecta a la precision en razonamiento, un area clave para optimizar coste de inferencia y latencia. Ademas, documenta un caso de estudio sobre verificacion de integridad de adaptadores LoRA: los kernels fusionados producian matrices lora_B nulas, y trece adaptadores que fallaron la comprobacion fueron retenidos antes de publicarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre Qwen/Qwen3-4B-Instruct-2507 (transformer denso) |
| Parametros totales | no disponible (el adaptador pesa 0,1 GB; el modelo base tiene 4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (el codigo de uso carga el modelo base en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3-4B-Instruct-2507, un transformer denso de 4B parametros de la familia Qwen3 que integra dos modos de operacion (thinking y non-thinking). El adaptador no altera la arquitectura del modelo base; ajusta el comportamiento de razonamiento mediante LoRA con rango 16 y alpha 32.

El entrenamiento tiene dos fases. Primero, un modelo profesor reexpresa los 6913 ejemplos del conjunto de entrenamiento de GSM8K en el dialecto L1, con cadenas de pensamiento de mediana 532 caracteres. Sobre ese modelo SFT fusionado se aplica GRPO con el trainer de trl sobre transformers estandar con atencion sdpa. La funcion de recompensa combina tres componentes: correctness (pondera por el numero de pasos de la solucion de referencia), format (exige un bloque `thinking... response` seguido de `#### <respuesta>`) y gr3 (reescalado multiplicativo de la recompensa positiva con suelo en 0,3). Se usa loss tipo dapo, 8 generaciones por prompt, lr de 1e-05, coeficiente KL de 0,0 y maximo de 256 tokens de completado. El entrenamiento se realizo en una unica NVIDIA A100 80GB.

Un detalle tecnico destacable: el autor verifica que las matrices lora_B de todos los adaptadores publicados no sean cero, ya que el camino con kernels fusionados producia adaptadores matematicamente inertes que cargaban sin error. Trece adaptadores que fallaron esa comprobacion no se publicaron.

## Capacidades

- Razonamiento matematico: resuelve problemas de matematicas de palabra tipo GSM8K con cadenas de pensamiento explicitas y verbosas en estilo L1.
- Generacion de texto conversacional: al heredar el modelo base instruct, mantiene capacidades de dialogo y seguimiento de instrucciones.
- Razonamiento en modo thinking: fuerza un bloque de razonamiento explicito antes de la respuesta final, con formato `thinking... response` y respuesta final tras `####`.
- Razonamiento explicable: el nivel L1 produce explicaciones paso a paso en lenguaje natural, utiles para auditar el proceso de resolucion.
- Capacidad multilingue: limitada al ingles; el adaptador se entrena solo en ese idioma y no garantiza comportamiento correcto en otros.
- No se documenta soporte de tool calling, function calling, vision ni audio; es un modelo de texto puro.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: sirve como punto de referencia para estudiar como la verbosidad del razonamiento afecta a la precision en tareas de matematicas, comparandolo con los niveles L2-L5 de la misma familia de dialectos.
- Generacion de soluciones matematicas explicadas: el modo L1 produce razonamientos naturales y detallados, adecuados para generar explicaciones paso a paso de problemas aritmeticos y algebraicos de nivel escolar.
- Replicacion de pipelines de RL post-SFT: la documentacion detalla un pipeline completo de GRPO con recompensas compuestas (correctness, format, gr3) y loss dapo, util como referencia para experimentos de optimizacion de razonamiento.
- Verificacion de integridad de adaptadores LoRA: el caso documentado de matrices lora_B nulas con kernels fusionados es un caso de estudio para disenar comprobaciones de calidad en publicacion de adaptadores.
- Prototipado de sistemas de razonamiento con presupuesto de tokens controlado: al fijar el nivel L1, el numero de tokens de razonamiento es relativamente predecible (mediana de 532 caracteres), lo que permite dimensionar costes de inferencia y latencia.
- Benchmark de robustez de modelos pequenos en razonamiento: con 4B de parametros y un adaptador de 0,1 GB, permite evaluar el techo de rendimiento de modelos compactos en GSM8K bajo condiciones de decoding greedy y sin self-consistency.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| GSM8K (test, n=1317) | Accuracy (exact match) | 91,5% | greedy decoding, single-turn, sin ejemplos ni self-consistency |
| GSM8K (test, n=1317) | Accuracy tras SFT previo | 91,0% | modelo SFT L1 antes de GRPO |
| AIME (n=60) | Accuracy | 15,0% | fuera de dominio, no es metrica principal |

El autor indica que la diferencia de +0,5 puntos porcentuales entre el modelo SFT y el adaptador GRPO esta dentro del ruido estadistico (semianchura del 95% de aproximadamente 2,7 pp para n=1317). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,1 GB y se carga sobre el modelo base Qwen3-4B-Instruct-2507, que en bf16 ocupa aproximadamente 8 GB de VRAM. El conjunto cabe en GPUs de consumo con 12 GB o mas, como RTX 3060 12GB, RTX 4070 o RTX 4090.
- El entrenamiento se realizo en una unica NVIDIA A100 80GB; la inferencia requiere considerablemente menos recursos.
- Opciones de despliegue: el codigo de ejemplo usa transformers con PeftModel y atencion sdpa; es compatible con cualquier framework que soporte PEFT, incluyendo vLLM, TGI, llama.cpp (si se exporta a GGUF) u Ollama.
- Latencia y throughput: no se proporcionan datos medidos. Al ser un modelo de 4B, la generacion es rapida incluso en hardware de consumo, pero depende del numero de tokens de razonamiento generados (mediana de 532 caracteres en el dialecto L1).

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cot-dialect-qwen3-4b-instruct-grpo-l1 (adaptador) | 4B base + 0,1 GB adaptador | no disponible | 91,5% | Apache-2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 (modelo base) | 4B | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Qwen3-4B-Instruct (version anterior) | 4B | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks del modelo base ni de otras alternativas en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa directa. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Critico: el adaptador se entrena sobre el modelo SFT fusionado de nivel L1, no sobre el modelo base directamente. Cargarlo directamente sobre Qwen/Qwen3-4B-Instruct-2507 no reproduce el 91,5% declarado. Es necesario cargar primero el adaptador SFT (ssurface/cot-dialect-qwen3-4b-instruct-sft-l1), fusionarlo y despues aplicar este adaptador GRPO.
- Entrenado y evaluado exclusivamente en problemas de matematicas de palabra (GSM8K); su rendimiento fuera de ese dominio no esta garantizado y cae notablemente en problemas mas dificiles (15,0% en AIME).
- El adaptador solo soporta ingles; no se garantiza comportamiento correcto en otros idiomas, aunque el modelo base de Qwen3 sea multilingue.
- Los resultados se basan en una unica semilla; diferencias de unos pocos puntos porcentuales estan dentro del ruido estadistico (95% de semianchura de ~2,7 pp en n=1317 y ~4,4 pp en n=500).
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente fuera de su dominio de entrenamiento.
- El adaptador tenia 0 descargas y 0 likes en el momento de la publicacion; es un trabajo de investigacion sin validacion externa amplia.
- La licencia Apache-2.0 permite uso comercial, pero la licencia del modelo base Qwen3-4B-Instruct-2507 debe verificarse por separado antes de desplegar en produccion.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l1
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Pagina del modelo Qwen3-4B en Hugging Face: https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
