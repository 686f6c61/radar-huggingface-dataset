# SZLHOLDINGS/creativity-v2-trained

## Resumen
creativity-v2-trained es un adaptador LoRA (QLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. El adaptador se entrena con un curriculum SFT propio (SZLHOLDINGS/creativity-sft-v1) y se enmarca en el programa de "honestidad" del autor, que mide el umbral de confabulacion mediante una bateria fija de sondas. No es un modelo autonomo: requiere cargar el base Qwen3-1.7B y aplicar los pesos PEFT encima.

El entrenamiento es deliberadamente minimo: 200 pasos con QLoRA (r=16, alpha=32, modulos q_proj/k_proj/v_proj/o_proj, dropout 0.05), batch 2 con acumulacion de gradiente 4, learning rate 2e-4 en bf16 sobre una NVIDIA RTX A6000 de 48 GB. El autor lo describe explicitamente como un piloto, no como un entrenamiento completo. La evaluacion se limita a 6 sondas fijas (3 respondibles y 3 no respondibles) con decodificacion determinista y 200 tokens maximos, con una puntuacion de 3/6.

Su relevancia es limitada y experimental: sirve como punto de datos en la comparacion de curriculums del "estate" de SZLHOLDINGS y como ejemplo de adaptador de bajo coste sobre Qwen3-1.7B. No hay evidencia publicada de calidad general, capacidades multilingues ni rendimiento en benchmarks estandar, por lo que no es adecuado como modelo de produccion sin evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | 1.700 millones (modelo base); adaptador LoRA con r=16 (parametros del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | QLoRA en entrenamiento (cuantizacion del base); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only denso de 1.700 millones de parametros. El metodo es QLoRA: el modelo base se cuantiza para el entrenamiento y se entrenan matrices de bajo rango (r=16, alpha=32) en las proyecciones de atencion q_proj, k_proj, v_proj y o_proj, con dropout 0.05. El entrenamiento usa bf16, learning rate 2e-4, batch size 2 y acumulacion de gradiente 4, durante 200 pasos, sobre una unica NVIDIA RTX A6000 de 48 GB.

El curriculum es SZLHOLDINGS/creativity-sft-v1, un dataset SFT del propio autor. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. La innovacion declarada no es arquitectonica sino metodologica: el autor enmarca el modelo en un "programa de honestidad" que mide el umbral de confabulacion con una bateria fija de sondas y publica los resultados en una cadena de recibos (frontier-54-runs). El propio autor advierte que 200 pasos es un piloto y que la bateria de 6 sondas no es una evaluacion exhaustiva.

## Capacidades
- Generacion de texto y conversacion: el pipeline declarado es text-generation y el tag conversational, heredando las capacidades del base Qwen3-1.7B.
- Razonamiento y codigo: no disponible de forma verificada; dependen del base y del adaptador, sin evidencia publicada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Comportamiento ante preguntas no respondibles: el autor reporta una puntuacion de 3/6 en su bateria de sondas, sin detallar que sondas fallan.

## Casos de uso
- Investigacion sobre confabulacion: usar el adaptador junto al base Qwen3-1.7B para reproducir la bateria de 6 sondas del autor y comparar el umbral de confabulacion con otros adaptadores de la misma cadena de recibos.
- Experimentacion con QLoRA: servir como referencia practica de un entrenamiento QLoRA de bajo coste (200 pasos, r=16) sobre un base de 1.7B, util para calibrar hiperparametros en entornos con una sola GPU de 48 GB.
- Pruebas de integracion PEFT: validar pipelines que cargan adaptadores safetensors sobre Qwen3-1.7B con la libreria peft, incluyendo carga, fusion y descarga del adaptador.
- Generacion de texto conversacional en prototipos: para demos internas de chat sobre el base Qwen3-1.7B, siempre con evaluacion propia previa, dado que no hay benchmarks publicados.
- Estudio de curriculums SFT: comparar el efecto del dataset creativity-sft-v1 frente a otros curriculums del autor sobre el mismo base, usando la cadena de recibos como referencia.
- Docencia y talleres: como ejemplo de adaptador LoRA pequeno y reproducible para explicar PEFT, QLoRA y evaluacion por sondas en cursos de IA open source.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta una evaluacion propia:

| Evaluacion | Metodo | Resultado |
|---|---|---|
| Bateria de sondas del autor | 6 sondas fijas (3 respondibles, 3 no respondibles), decodificacion determinista, 200 tokens maximos | 3/6 |

## Requisitos de hardware
- VRAM estimada para inferencia: el base Qwen3-1.7B en bf16 requiere aproximadamente 3,4 GB de pesos mas overhead de activaciones y KV cache; en cuantizacion de 4 bits puede situarse en torno a 1-2 GB, aunque no se documentan cuantizaciones oficiales del adaptador.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas deberia alojar el base en bf16 o 4 bits; el entrenamiento del autor uso una NVIDIA RTX A6000 de 48 GB.
- Cabe en consumer GPU: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: peft + transformers para cargar el adaptador; vLLM y TGI para servir el base fusionado con el adaptador; llama.cpp y Ollama solo si se convierte el modelo fusionado a GGUF, lo cual no esta documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| creativity-v2-trained (este) | 1.7B (base) + adaptador LoRA r=16 | no disponible | 3/6 en bateria propia de 6 sondas | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible en esta ficha | benchmarks publicados por Qwen, no incluidos aqui | apache-2.0 | Hugging Face, ampliamente usado |
| Adaptadores QLoRA genericos sobre Qwen3-1.7B | 1.7B + adaptador | no disponible | no disponible | variable | Hugging Face |

La comparacion con alternativas de la misma categoria es limitada porque el unico dato de rendimiento del adaptador es una bateria propia de 6 sondas, no comparable con benchmarks estandar.

## Limitaciones y advertencias
- El autor declara explicitamente que la bateria de evaluacion son 6 sondas fijas, no una evaluacion exhaustiva.
- Es un adaptador LoRA, no un modelo autonomo: requiere el base Qwen/Qwen3-1.7B para funcionar.
- 200 pasos de entrenamiento es un piloto, no un entrenamiento completo; la calidad general no esta verificada.
- No hay datos publicados sobre sesgos, alucinacion fuera de la bateria propia, idiomas soportados ni comportamiento en contextos largos.
- La licencia apache-2.0 permite uso comercial, pero debe verificarse tambien la licencia del base Qwen3-1.7B y de los datos del curriculum creativity-sft-v1 antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion por la comunidad.
- No se documentan cuantizaciones de inferencia ni conversiones a GGUF, lo que limita el despliegue en llama.cpp u Ollama sin trabajo adicional.
- El autor advierte que la medicion es un unico punto de datos dentro de su comparacion de curriculums, no una validacion del modelo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/creativity-v2-trained
- Cadena de recibos (dataset): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Sitio del autor: https://a-11-oy.com
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
