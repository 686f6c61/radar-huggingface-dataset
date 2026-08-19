# ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5

## Resumen

`cot-dialect-qwen3-4b-instruct-grpo-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el modelo `Qwen/Qwen3-4B-Instruct-2507` para razonar a un nivel de compresión extremo de cadena de pensamiento (nivel L5, "expresión colapsada"). El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) sobre un modelo previamente ajustado por SFT al mismo nivel de compresión, con el objetivo de que el modelo genere cadenas de razonamiento extremadamente cortas (mediana de 16 caracteres) manteniendo una precisión aceptable en problemas aritméticos.

El modelo resuelve un problema específico de investigación: la compresión de cadenas de pensamiento en modelos de lenguaje. En lugar de razonamientos verbosos, el adaptador induce un "dialecto" de razonamiento condensado, lo que reduce el coste de generación y la latencia. Es relevante porque explora un trade-off entre longitud de razonamiento y precisión, con resultados publicados en GSM8K (73,6% de exactitud tras GRPO, frente al 65,1% tras solo SFT).

El adaptador es ligero (0,1 GB en el repositorio) y se distribuye en formato PEFT/safetensors, con licencia Apache 2.0. Está pensado para investigación sobre compresión de CoT, no como un modelo de propósito general. El idioma soportado es exclusivamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; el modelo base tiene 4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda del modelo base Qwen3-4B-Instruct-2507, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 4 mil millones de parametros. El adaptador LoRA tiene rango r=16 y alpha=32, y se entrena en dos fases: primero un ajuste fino supervisado (SFT) sobre 6993 ejemplos de GSM8K train re-expresados a nivel de compresion L5 por un modelo profesor, y posteriormente un refinamiento con GRPO (loss tipo `dapo`) sobre el modelo SFT fusionado.

El entrenamiento GRPO utiliza un reward compuesto por tres componentes: `correctness` (basado en coincidencia con el paso de solucion de oro, ponderado por dificultad), `format` (exige una unica estructura `thinking... response` seguida de `#### <respuesta>`) y `gr3` (reescalado multiplicativo de la recompensa positiva con suelo en 0,3). Se generan 8 respuestas por prompt, con un maximo de 256 tokens de completado, learning rate de 1e-05 y coeficiente KL de 0,0. El entrenamiento se realizo en una unica NVIDIA A100 80GB con `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`.

Un detalle tecnico notable: el autor advierte que el uso de kernels fusionados producia adaptadores con matrices `lora_B` todas a cero (inertes matematicamente), por lo que se verifico manualmente que cada adaptador publicado tuviera `lora_B != 0`; 13 adaptadores que fallaron esa comprobacion fueron retenidos.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas a nivel L5: el modelo genera una expresion colapsada (por ejemplo, `18/3*2=12`) dentro de la etiqueta `thinking`, en lugar de un razonamiento verbal extenso.
- Generacion de texto siguiendo el formato de instruccion especifico: `Solve this using Level 5 (Extreme). Problem: {problema}`.
- Capacidad de output estructurado con bloque `thinking... response` y respuesta final precedida de `####`.
- Especializado en problemas aritmeticos de nivel GSM8K; fuera de ese dominio el rendimiento cae drasticamente (AIME 1,7%, BBH 34,4%).
- No soporta tool calling, ni agentes, ni vision, ni audio. Es un modelo puramente textual y monodominio.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: el modelo sirve como referencia para estudiar como afecta la longitud del razonamiento a la precision en tareas aritmeticas, y para comparar dialectos de compresion L1-L5.
- Evaluacion de trade-offs latencia-precision: al generar cadenas de 16 caracteres en lugar de cientos, se puede medir el ahorro en tokens de salida y su impacto en la calidad de la respuesta en entornos de inferencia con restricciones de coste.
- Benchmarking de tecnicas de RL (GRPO con rewards compuestos): el adaptador documenta un setup reproducible (loss dapo, reward correctness/format/gr3) que puede replicarse en otros modelos base.
- Pruebas de robustez de razonamiento comprimido: util para analizar si un modelo puede mantener exactitud cuando se le fuerza a razonar de forma extremadamente condensada, y donde aparecen los fallos.
- Validacion de pipelines PEFT multi-etapa: el flujo de carga (SFT primero, luego GRPO) demuestra como apilar adaptadores LoRA sobre un modelo fusionado, util para desarrolladores que trabajan con `peft`.
- Generacion de datos sinteticos de razonamiento corto: el modelo puede producir ejemplos de CoT comprimido que sirvan como datos de entrenamiento para otros modelos mas pequenos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (evaluacion con decodificacion greedy, una sola vuelta, sin ejemplos ni self-consistency):

| Benchmark | n | Accuracy |
|---|---:|---:|
| GSM8K (test) | 1317 | 73,6% |
| AIME | 60 | 1,7% |
| BBH | 250 | 34,4% |

Comparativa interna del propio autor (GSM8K test):

| Etapa | Accuracy |
|---|---:|
| Tras SFT | 65,1% |
| Tras GRPO (este adaptador) | 73,6% |
| Diferencia | +8,5 pp |

No se han publicado resultados comparativos con otros modelos externos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, por lo que la carga adicional sobre el modelo base es minima.
- El modelo base Qwen3-4B-Instruct-2507 requiere al menos 8-10 GB de VRAM en precision bfloat16; con cuantizacion (por ejemplo, 4 bits) cabe en GPUs consumer de 8 GB como RTX 3060 o RTX 4060.
- El entrenamiento se realizo en una NVIDIA A100 80GB, pero la inferencia puede ejecutarse en GPUs consumer.
- Opciones de despliegue: `transformers` + `peft` (como muestra el codigo de uso), `vLLM` (si se fusiona el adaptador), `llama.cpp` o `Ollama` (si se exporta a GGUF tras fusionar).
- Latencia: no disponible; se espera una latencia menor que el modelo base al generar cadenas de razonamiento de solo 16 caracteres de media, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de compresion de CoT en la informacion proporcionada. La unica comparativa publicada es interna (SFT vs GRPO). Como referencia, el modelo base sin adaptador (Qwen3-4B-Instruct-2507) no tiene resultados publicados en esta ficha para GSM8K, por lo que no se puede establecer una comparativa cuantitativa fiable con alternativas externas.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de tipo GSM8K; fuera de ese dominio el rendimiento es muy bajo (AIME 1,7%, BBH 34,4%).
- La precision cae con la dificultad del problema, y la caida es mas rapida en los niveles de compresion altos (L5 es el extremo).
- Requiere cargar primero el adaptador SFT de nivel L5 (`cot-dialect-qwen3-4b-instruct-sft-l5`) y fusionarlo antes de aplicar este adaptador GRPO; cargarlo directamente sobre el modelo base no reproduce los resultados publicados.
- Los resultados tienen ruido estadistico: el autor indica un intervalo de confianza del 95% de aproximadamente ±2,7 pp para n=1317 y ±4,4 pp para n=500, por lo que diferencias de unos pocos puntos pueden no ser significativas.
- Solo soporta ingles; no hay capacidad multilingue.
- No es un modelo de proposito general: no soporta tool calling, agentes, vision ni audio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no apto para produccion sin una evaluacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base (pagina general): https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial Qwen3: https://github.com/QwenLM/Qwen3
- Guia de modelos Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
- Referencia en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
