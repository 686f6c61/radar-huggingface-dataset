# udgamlabs/Vemana-Base

## Resumen

Vemana-Base es un modelo de lenguaje de 278 millones de parámetros desarrollado por Udgam Labs, entrenado desde cero exclusivamente para telugu (código ISO `te`). Se trata de un modelo base, no ajustado por instrucciones, cuyo objetivo es modelar la lengua telugu con la mayor eficiencia posible en un tamaño reducido. Emplea una arquitectura transformer con el layout de texto de Gemma 4 (`gemma4_text`), lo que requiere transformers 5.19 o superior, y un tokenizador propio de 32.000 tokens diseñado específicamente para telugu.

El modelo fue entrenado sobre 5.100 millones de tokens de texto público en telugu procedentes de tres conjuntos de datos abiertos (Sangraha de AI4Bharat, FineWeb-2 de Hugging Face y HPLT 3.0), con aproximadamente 2,4 pasadas sobre los datos, lo que equivale a 12.000 millones de posiciones de token. Su ventana de contexto es de 1.024 tokens, coherente con la longitud con la que fue entrenado.

Su relevancia radica en que, pese a su tamaño reducido (278M), supera en perplejidad medida en bits por byte a todos los modelos base abiertos por debajo de 1.000 millones de parámetros que sus autores evaluaron sobre páginas de Wikipedia en telugu creadas con posterioridad a la publicación de dichos modelos, incluido nanochat-telugu-560M, que duplica su tamaño. Está publicado bajo licencia Apache 2.0 y puede ejecutarse en CPU de clase portátil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, layout de texto Gemma 4 (`gemma4_text`) |
| Parametros totales | 278.214.162 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (existe version GGUF para llama.cpp) |
| Idiomas soportados | telugu (`te`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

Vemana-Base es un transformer decoder-only con el layout de texto de Gemma 4, implementado en la librería transformers (versión 5.19 o superior). Cuenta con 278.214.162 parámetros y un tokenizador propio de 32.000 tokens entrenado específicamente para telugu, lo que evita la fragmentación excesiva que sufren los tokenizadores multilingües genéricos sobre esta lengua.

El entrenamiento se realizó desde cero sobre 5.100 millones de tokens de texto público en telugu procedentes de tres fuentes: la parte de telugu verificada humanamente de Sangraha (AI4Bharat), FineWeb-2 (Hugging Face) y HPLT 3.0. Los datos se leyeron aproximadamente 2,4 veces, lo que supone 12.000 millones de posiciones de token. La ventana de entrenamiento fue de 1.024 tokens. Los autores fijaron antes del entrenamiento el test de evaluación, el margen de victoria (0,02 bits por byte) y las comprobaciones de robustez, y seleccionaron el checkpoint final de antemano. No se menciona en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones; se trata de un modelo estrictamente base.

## Capacidades

- Generación y continuación de texto en telugu: completa fragmentos de texto de forma coherente dentro de su ventana de 1.024 tokens.
- Modelado de lengua telugu: tokenizador propio de 32.000 tokens optimizado para la morfología y el vocabulario del telugu.
- Inferencia en CPU: según la model card, escribe aproximadamente 65 tokens por segundo en la CPU de un Mac mini.
- Ejecución en navegador y en dispositivos locales: existe una demo en el sitio del autor y en Hugging Face Spaces, además de una versión GGUF para llama.cpp.
- Ajuste fino mediante LoRA: los autores proporcionan un notebook de Colab para fine-tuning con LoRA sobre GPU gratuita de Colab, Apple Silicon o CPU.
- No soporta tool calling ni function calling (no disponible en la información).
- No soporta agentes ni razonamiento multi-paso (es un modelo base sin ajuste por instrucciones).
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: únicamente telugu.

## Casos de uso

- Modelado de lengua y evaluación de tokenizadores: sirve como referencia para medir la calidad de representación del telugu en comparación con tokenizadores multilingües, gracias a su tokenizador específico de 32.000 tokens.
- Generación de texto telugu en dispositivos con recursos limitados: al ejecutarse en CPU de clase portátil a unos 65 tokens por segundo, es adecuado para aplicaciones de escritorio, móviles o embebidas que necesiten completar texto en telugu sin GPU.
- Punto de partida para ajuste fino supervisado o LoRA: al ser un modelo base con licencia Apache 2.0, puede adaptarse a tareas concretas (clasificación, resumen, generación de titulares) mediante el notebook de fine-tuning proporcionado por los autores.
- Investigación en modelos de lenguaje de bajo recurso: su entrenamiento desde cero sobre 5.100 millones de tokens de telugu y su evaluación controlada lo convierten en un caso de estudio reproducible para investigar la eficiencia datos-parámetros en lenguas de bajos recursos.
- Aplicaciones educativas y de preservación lingüística: continuación de textos, generación de material de lectura o ejercicios en telugu dentro de la ventana de 1.024 tokens.
- Prototipado rápido en navegador o Hugging Face Spaces: la demo disponible permite probar la generación de texto en telugu sin infraestructura propia, útil para validar ideas antes de invertir en modelos mayores.
- Generación de texto en pipelines de datos: puede emplearse para aumentar corpus en telugu (data augmentation) o para filtrar y puntuar texto por perplejidad en bits por byte.

## Benchmarks y rendimiento

Resultados en bits por byte (menor es mejor) sobre páginas de Wikipedia en telugu creadas después de la publicación de los modelos comparados. Ventana de 1.024 tokens (Goldfish 512, su límite), float32, mismo script de puntuación. Medición de los autores el 27 de octubre de 2026.

| Modelo | Parámetros | Sep-Oct 2026 (416 págs.) | Jul-Aug 2026 (477 págs.) | 23-26 Oct 2026 (29 págs.) |
|---|---|---|---|---|
| Vemana-Base | 278M | 0,361 | 0,385 | 0,346 |
| nanochat-telugu-560M | 561M | 0,383 | 0,408 | 0,364 |
| Dhee-Pravega-OG Atom | 646M | 0,393 | 0,414 | 0,371 |
| Pothana Base v2 | 222M (370M con bloques compartidos) | 0,440 (0,426 en palabras cubiertas por su tokenizador) | 0,456 (0,444) | 0,425 (0,410) |
| Goldfish Telugu 1000mb | 125M | 0,458 | 0,480 | 0,435 |
| Gemma-3-1B | 1.0B | 0,484 | 0,502 | 0,441 |
| Qwen3.5-0.8B-Base | 0.87B | 0,584 | no disponible | no disponible |
| Gemma-3-270m | 268M | 0,585 | no disponible | no disponible |
| Qwen3-0.6B-Base | 0.6B | 0,692 | no disponible | no disponible |

Diferencia de Vemana frente a nanochat-telugu-560M (bootstrap pareado por página, intervalo del 95%): −0,022 [−0,024, −0,021] en las páginas de septiembre-octubre; −0,023 [−0,024, −0,022] en julio-agosto; −0,018 [−0,021, −0,015] en las páginas del 23 al 26 de octubre. La ventaja se mantiene con ventana de 512 tokens (−0,017) y excluyendo al editor que escribió un tercio de las páginas de septiembre-octubre (−0,023).

Pruebas de elección múltiple (lm-eval 0.4.13, 0-shot):

| Benchmark | Resultado | Azar |
|---|---|---|
| Belebele-te | 25,1% | 25% |
| MILU-te | 25,3% (forma cloze: 30,2%) | 25% |
| IndicXNLI-te | 35,0% | 33% |
| IndicCOPA-te | 58,4% | 50% (≈55% solo por longitud de respuesta) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 278M parámetros, en float32 ocupa aproximadamente 1,1 GB; en float16/bfloat16, unos 0,56 GB; en cuantizaciones de 8 bits, alrededor de 0,3 GB, y en 4 bits, en torno a 0,15 GB (estimaciones a partir del número de parámetros; los tipos de cuantización concretos no están detallados en la información disponible).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja pueden ejecutarlo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre en precisión completa, y en GPUs integradas o CPU.
- Despliegue: transformers 5.19 o superior (obligatorio por el layout Gemma 4), llama.cpp mediante el repositorio GGUF, Hugging Face Spaces, y ejecución en navegador a través de la demo del autor. No se menciona soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: aproximadamente 65 tokens por segundo en la CPU de un Mac mini, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits por byte (Sep-Oct 2026) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vemana-Base | 278M | 1.024 | 0,361 | Apache 2.0 | Hugging Face, GGUF, demo web |
| nanochat-telugu-560M | 561M | no disponible | 0,383 | no disponible | Hugging Face |
| Dhee-Pravega-OG Atom | 646M | no disponible | 0,393 | no disponible | Hugging Face |
| Pothana Base v2 | 222M (370M con bloques compartidos) | no disponible | 0,440 (0,426 en palabras cubiertas) | no disponible | Hugging Face |
| Goldfish Telugu 1000mb | 125M | 512 | 0,458 | no disponible | Hugging Face |
| Gemma-3-1B | 1.0B | no disponible | 0,484 | Gemma license | Hugging Face |

Vemana-Base obtiene el mejor bits por byte de la comparativa pese a tener menos parámetros que nanochat-telugu-560M y Dhee-Pravega-OG Atom. Frente a Sarvam-1 (2.500M parámetros, aproximadamente 9 veces mayor), los autores indican que Sarvam-1 está a la par en las páginas de septiembre-octubre (0,356 frente a 0,361) y es mejor en las de julio-agosto (0,365 frente a 0,385).

## Limitaciones y advertencias

- Es un modelo base: continúa texto, no responde preguntas ni sigue instrucciones, y no tiene ajuste de seguridad.
- Contexto limitado a 1.024 tokens (unas 570 palabras en telugu); entradas y salidas deben mantenerse dentro de ese límite.
- Alucinación: la model card documenta que, al continuar "తెలుగు భాష" (el idioma telugu), afirmó con fluidez que el Día del Idioma Telugu se celebra el 21 de septiembre, cuando es el 29 de agosto.
- Pérdida de coherencia en generaciones largas: un prompt de cuento corto ("ఒక రోజు ఒక రైతు", un día un granjero) degenera en la misma frase sobre un granjero y una vaca repetida con pequeñas variaciones.
- Pruebas de conocimiento y razonamiento al nivel del azar: Belebele-te 25,1% y MILU-te 25,3%, similar a la mayoría de modelos abiertos por debajo de 1.000 millones evaluados; Qwen3.5-0.8B obtiene mejores resultados en las formas con letras (35,6% en Belebele y 31,1% en MILU).
- Los modelos más grandes son mejores: Sarvam-1 (2.500M) supera a Vemana en las páginas de julio-agosto.
- Monolingüe: solo telugu; no se ha validado su comportamiento en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero al no existir ajuste de seguridad ni de instrucciones, cualquier producto deberá añadir sus propias capas de alineación y filtrado.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero el corpus es texto web público en telugu, con los sesgos propios de esa fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Vemana-Base
- GGUF para llama.cpp: https://huggingface.co/udgamlabs/Vemana-Base-GGUF
- Todos los checkpoints: https://huggingface.co/udgamlabs/Vemana-Checkpoints
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Vemana
- Demo en el navegador: https://udgamlabs.com/models/vemana#try
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/vemana
- Informe técnico: https://udgamlabs.com/research/vemana
- Código en GitHub: https://github.com/udgamlabs/vemana
- Notebook de fine-tuning LoRA: https://colab.research.google.com/github/udgamlabs/finetune/blob/main/finetune_lora.ipynb
- Código de fine-tuning en GitHub: https://github.com/udgamlabs/finetune
