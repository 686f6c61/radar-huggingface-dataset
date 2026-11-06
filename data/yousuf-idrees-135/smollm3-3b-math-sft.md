# Yousuf-Idrees-135/smollm3-3b-math-sft

## Resumen

smollm3-3b-math-sft es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM3-3B-Base, desarrollado por Yousuf Idrees como parte de la Unidad 1 (instruction tuning) del curso smol de Hugging Face. El modelo esta especializado en problemas matematicos de tipo word problem (nivel escolar) y constituye la primera etapa de un pipeline de alineacion de dos fases que culmina en smollm3-dpo-aligned.

Arquitectonicamente es un transformer decoder-only causal de 3.075.098.624 parametros (aproximadamente 3B), entrenado sobre 3.000 ejemplos de MetaMathQA extraidos del dataset smoltalk. El ajuste se realizo con TRL y LoRA, fusionando despues el adaptador en los pesos base. El resultado es un modelo conversacional que emplea la plantilla de chat de SmolLM3 y que obtiene un 74,0% de extractive_match en GSM8K (0-shot, conjunto de test completo de 1.319 problemas).

Su relevancia es fundamentalmente educativa y de referencia: demuestra un flujo completo de instruction tuning con recursos minimos (una unica GPU T4 en Google Colab) y sirve como punto de partida reproducible para quien quiera entender el impacto de un SFT pequeno y focalizado sobre un modelo base de 3B. No esta pensado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (arquitectura SmolLM3) |
| Parametros totales | 3.075.098.624 (aproximadamente 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no se documentan cuantizaciones publicadas; pesos en safetensors fp16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (heredada de SmolLM3) |
| Formato de pesos | safetensors (fp16 en el repositorio, 6,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B-Base, un transformer decoder-only causal de aproximadamente 3B parametros. Sobre el se aplico un ajuste fino supervisado con TRL y LoRA, empleando la plantilla de chat de SmolLM3 para el formateo de las conversaciones. El adaptador LoRA se fusiono en los pesos base antes de la subida al repositorio, de modo que el checkpoint publicado contiene los pesos ya combinados.

Los datos de entrenamiento consisten en 3.000 ejemplos de MetaMathQA tomados del dataset HuggingFaceTB/smoltalk. El entrenamiento se ejecuto en una unica NVIDIA T4 (Google Colab) y los pesos se guardaron en safetensors fp16. No se documenta en la informacion disponible el numero total de tokens vistos, la composicion detallada del dataset mas alla de los 3.000 ejemplos de MetaMathQA, ni si hubo fases adicionales de RLHF o DPO en este checkpoint (el DPO se aplica en el modelo posterior smollm3-dpo-aligned). No se describen innovaciones tecnicas propias mas alla del flujo estandar de SFT con LoRA.

## Capacidades

- Generacion de texto conversacional en ingles con la plantilla de chat de SmolLM3.
- Resolucion de problemas matematicos de tipo word problem de nivel escolar (foco principal del ajuste).
- Razonamiento aritmetico de varios pasos implicito en los problemas de GSM8K.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles, unico idioma declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion educativa de instruction tuning: usar el modelo como referencia para medir el efecto de un SFT pequeno (3.000 ejemplos) sobre SmolLM3-3B-Base en GSM8K, comparando la puntuacion de 0,740 frente al modelo base.
- Reproduccion de pipelines de alineacion: sirve como primer eslabon documentado de la cadena base → SFT → DPO, permitiendo a investigadores replicar cada etapa y aislar su contribucion.
- Prototipado de tutoria matematica en ingles: el modelo puede resolver problemas verbales de aritmetica escolar paso a paso mediante la plantilla de chat, adecuado para demos de asistentes educativos en entornos controlados.
- Generacion de datos sinteticos de razonamiento matematico: dado su rendimiento en GSM8K, puede emplearse para producir borradores de soluciones que luego se filtren o verifiquen manualmente.
- Pruebas de integracion con transformers: al ser compatible con la libreria transformers y la API de chat, sirve para validar pipelines de inferencia (por ejemplo, con dtype bfloat16) antes de escalar a modelos mayores.
- Docencia y formacion tecnica: ejemplo practico de SFT con TRL y LoRA sobre una T4, util en cursos y talleres sobre ajuste fino de modelos pequenos.

## Benchmarks y rendimiento

| Benchmark | Ajuste | Metrica | Resultado |
|---|---|---|---|
| GSM8K | 0-shot, conjunto de test completo (1.319) | extractive_match | 0,740 ± 0,012 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, TruthfulQA, etc.) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en fp16 (tamano del repositorio); en bfloat16 similar. Cuantizaciones de 8 o 4 bits reducirian el requisito, pero no se documentan versiones publicadas.
- GPU recomendadas: el autor entreno y evaluo en NVIDIA T4 (16 GB), suficiente para inferencia en fp16 con margen. Una RTX 4090 (24 GB) permite inferencia holgada y mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en fp16; con cuantizacion a 4 bits cabria en GPUs de 6 GB o menos, aunque no se ofrecen pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (metodo documentado, con `device_map="auto"` y `dtype=torch.bfloat16`); vLLM, llama.cpp, Ollama o TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles. El autor advierte de que debe usarse bfloat16 o fp32, ya que fp16 puro puede producir desbordamiento en SmolLM3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm3-3b-math-sft | 3,075B | no disponible | 0,740 (0-shot) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM3-3B-Base | aproximadamente 3B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| smollm3-dpo-aligned (mismo autor) | aproximadamente 3B | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparacion cuantitativa con SmolLM3-3B-Base en GSM8K no esta publicada en la informacion disponible; el unico dato numerico verificable es el 0,740 del modelo ajustado. No se dispone de datos de otros modelos de 3B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Proyecto de curso, no listo para produccion: el ajuste se hizo sobre un subconjunto pequeno (3.000 ejemplos) y el autor lo declara explicitamente como no apto para uso productivo.
- Especializacion estrecha: rinde mejor en problemas verbales de matematicas de nivel escolar; el enfoque matematico puede degradar el rendimiento en otras tareas (el autor senala que, tras el DPO posterior, TruthfulQA fue inferior al SmolLM3-3B oficial).
- Solo ingles: no soporta otros idiomas de forma fiable.
- Sesgos heredados: incorpora los sesgos de SmolLM3 y de sus datos de entrenamiento.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de veracidad para este checkpoint; al ser un modelo pequeno y especializado, la generacion de pasos intermedios incorrectos es plausible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado de prototipo y la falta de evaluaciones de seguridad desaconsejan ese uso.
- Precaucion de inferencia: usar bfloat16 o fp32; fp16 puro puede desbordar en SmolLM3.
- Los resultados de LightEval se publicaron en un dataset privado, lo que limita la verificacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yousuf-Idrees-135/smollm3-3b-math-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Modelo siguiente (DPO): https://huggingface.co/Yousuf-Idrees-135/smollm3-dpo-aligned
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Resultados crudos de evaluacion (privado): https://huggingface.co/datasets/Yousuf-Idrees-135/details_Yousuf-Idrees-135__smollm3-3b-math-sft_private
- Curso smol: https://huggingface.co/learn/smol-course
- Leaderboard del curso (PR #104): https://huggingface.co/spaces/smol-course/leaderboard/discussions/104
- LightEval: https://github.com/huggingface/lighteval
