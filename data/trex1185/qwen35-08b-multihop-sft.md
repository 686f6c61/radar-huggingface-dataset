# trex1185/qwen35-08b-multihop-sft

## Resumen

`trex1185/qwen35-08b-multihop-sft` es un ajuste fino (fine-tuning) de la arquitectura Qwen3.5-0.8B, publicado por el usuario trex1185 en Hugging Face. Se trata de un modelo de aproximadamente 853 millones de parámetros orientado a tareas de question answering multihop y extractivo sobre textos en japones, entrenado mediante un LoRA de continuacion (continuation LoRA SFT) sobre unos pesos iniciales que a su vez derivan de un ajuste previo del mismo autor (`qwen35-08b-extractive-qa`).

El modelo parte de la arquitectura Qwen3.5-0.8B (licencia Apache-2.0) y se ha especializado con un conjunto de datos muy reducido: 21 ejemplos unicos de JEMHopQA (composicional) y 21 de JaQuAD, ambos reformateados mecanicamente. El LoRA resultante se fusiono en los pesos iniciales, dando como resultado un checkpoint en formato safetensors de 1,7 GB.

Su relevancia es limitada y muy especifica: se trata de un experimento academico o de curso (los pasajes de recuperacion provienen del dataset `llm-course-final-2026`) centrado en QA multihop en japones. No es un modelo de proposito general ni cuenta con model card completa, licencia declarada, idiomas oficiales ni resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B, revision 2fc06364715b967f1860aea9cf38778875588b17) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible oficialmente; el entrenamiento se realizo sobre datos en japones |
| Licencia | no disponible en la ficha de Hugging Face; los pesos base Qwen3.5-0.8B son Apache-2.0 y los datasets de entrenamiento son CC BY-SA 4.0 y CC BY-SA 3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parametros. Sobre los pesos iniciales de `trex1185/qwen35-08b-extractive-qa` (revision f6d96e7f1b03b088357236e62f44d08a023f890d) se aplico un LoRA de continuacion (continuation LoRA SFT) que posteriormente se fusiono en los pesos, por lo que el checkpoint final no contiene adaptadores separados sino un unico conjunto de pesos safetensors.

El entrenamiento utilizo un conjunto muy pequeno: 21 ejemplos unicos de JEMHopQA v1.1 (RIKEN, CC BY-SA 4.0), en su variante composicional, y 21 ejemplos unicos de JaQuAD (Skelter Labs, CC BY-SA 3.0 Unported). Ambos conjuntos fueron muestreados mecanicamente, alineados y reformateados. Los pasajes de recuperacion empleados provienen de los pasajes recuperados en la ejecucion run019 y del dataset `bumbuboon/llm-course-final-2026`, extraidos de Wikipedia en japones bajo CC BY-SA 4.0. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas sobre pasajes proporcionados.
- Question answering multihop: el entrenamiento con JEMHopQA composicional sugiere capacidad para resolver preguntas que requieren encadenar informacion de varias frases o pasajes.
- Comprension lectora en japones, dado que tanto JEMHopQA como JaQuAD y los pasajes de Wikipedia son en ese idioma.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-step mas alla del multihop de QA.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles oficialmente; el uso previsto parece limitado al japones.

## Casos de uso

- Question answering extractivo sobre documentacion en japones: el modelo puede recibir un pasaje y una pregunta y devolver la respuesta extractiva, aprovechando el ajuste sobre JaQuAD.
- QA multihop sobre articulos de Wikipedia en japones: adecuado para preguntas que requieren combinar informacion de varias secciones de un mismo documento, gracias al entrenamiento con JEMHopQA composicional.
- Prototipado de pipelines de recuperacion-aumentada (RAG) en japones: el modelo encaja como componente de respuesta final sobre pasajes recuperados, tal como se uso en su entrenamiento (pasajes de run019).
- Experimentacion academica sobre fine-tuning con LoRA: sirve como referencia de bajo coste (menos de 1B parametros) para estudiar el efecto de SFT con muy pocos ejemplos.
- Evaluacion de tecnicas de alineacion de datasets: util para reproducir el flujo de muestreo mecanico, alineacion y reformateo descrito en la model card.
- Base para futuros ajustes especializados en japones: al ser un checkpoint fusionado y pequeno, puede servir como punto de partida para nuevos SFT con LoRA en tareas de QA.
- Despliegue en entornos con recursos limitados: con 853M parametros, es viable en GPU de consumo para inferencia de pruebas, aunque no se documentan requisitos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia orientativa por tamano (853M parametros), en fp16 requeriria aproximadamente 1,7 GB solo para pesos, y en cuantizacion de 8 bits alrededor de 0,9 GB, sin contar overhead de activaciones y cache KV.
- GPU recomendadas: no disponible. Por tamano, cabria en GPU de consumo como RTX 3060, RTX 4060 o superiores, asi como en A100/H100 para despliegues por lotes.
- Cabe en consumer GPU: si, por el tamano del modelo (menos de 1B parametros), aunque no se documenta soporte ni rendimiento en dichas configuraciones.
- Opciones de despliegue: no se documentan. Al publicarse solo en safetensors, seria necesario convertirlo a GGUF para llama.cpp/Ollama o cargarlo con transformers/vLLM, sin garantia de compatibilidad documentada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| trex1185/qwen35-08b-multihop-sft | 852.985.920 | no disponible | no disponible (base Apache-2.0) | Hugging Face, safetensors |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible en la informacion | Apache-2.0 | Hugging Face |
| trex1185/qwen35-08b-extractive-qa (pesos iniciales) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparacion se limita a parametros, licencia y disponibilidad segun la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento con solo 21 ejemplos por dataset (42 en total): riesgo alto de sobreajuste y de generalizacion muy limitada fuera de la distribucion de JEMHopQA y JaQuAD.
- Sesgos conocidos: no documentados; al entrenarse sobre Wikipedia en japones y datasets academicos, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: no evaluado; en tareas extractivas fuera de dominio puede generar respuestas no sustentadas en el pasaje.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto soportada; el uso previsto es en japones, sin garantias en castellano u otros idiomas.
- Restricciones de licencia: la licencia del checkpoint no esta declarada en Hugging Face. Los datasets de entrenamiento son CC BY-SA 4.0 (JEMHopQA, pasajes de Wikipedia) y CC BY-SA 3.0 (JaQuAD), lo que puede imponer obligaciones de atribucion y compartir-igual en usos derivados; conviene verificar antes de un uso comercial.
- Caveat para produccion: modelo experimental de curso, sin pipeline declarado, sin descargas ni likes, sin benchmarks y sin model card completa; no recomendado para produccion sin evaluacion propia.
- No se documentan requisitos de hardware, formatos de cuantizacion ni soporte de tooling de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/trex1185/qwen35-08b-multihop-sft
- Pesos iniciales: https://huggingface.co/trex1185/qwen35-08b-extractive-qa/tree/f6d96e7f1b03b088357236e62f44d08a023f890d
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Dataset de pasajes: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
