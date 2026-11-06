# Yukinonooo/SVGFaith-Decomposer

## Resumen

SVGFaith-Decomposer es un modelo de lenguaje especializado en descomponer prompts de texto en grafos de dependencias de requisitos visuales atomicos, diseñado como componente del sistema de evaluacion SVGFaith para generacion text-to-SVG. Lo desarrolla el usuario Yukinonooo y se construye mediante fine-tuning supervisado y Group Relative Policy Optimization (GRPO) sobre Qwen/Qwen3.5-9B, del que hereda la arquitectura y el tokenizador.

El modelo no procesa imagenes: su unica funcion es leer un prompt textual y emitir un grafo JSON de requisitos visuales con relaciones de dependencia entre ellos. El backend de vision que verifica si cada requisito se cumple es el Qwen3.5-9B sin modificar, de modo que el sistema completo combina este decomposer con un VQA para producir la metrica SVGFaith-Score, que descuenta la puntuacion de un requisito cuando sus prerequisitos obtienen valores bajos (unique-ancestor gating con alpha 0.5).

Su relevancia es acotada pero clara: aporta una metrica interpretable y descomponible para evaluar fidelidad en generacion de SVG, un dominio donde las metricas agregadas tipo CLIPScore no ofrecen trazabilidad por requisito. El checkpoint publicado es el resultado final de GRPO exportado en bfloat16, con 9.653.104.368 parametros y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-9B, tag `qwen3_5`) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder-only de aproximadamente 9,65 mil millones de parametros. El fine-tuning es de dominio: la tarea es generar un grafo de dependencias de requisitos visuales atomicos a partir de un prompt, en formato JSON. El pipeline de entrenamiento descrito en la model card sigue el paper SVGFaith en tres fases: (1) supervised fine-tuning con datos generados por un profesor Qwen3.5-397B-A17B, (2) rejection-sampling supervised fine-tuning para filtrar las generaciones de mayor calidad y (3) Group Relative Policy Optimization (GRPO) como etapa final de alineamiento. Los pesos publicados corresponden al checkpoint de GRPO exportado en bfloat16.

El modelo forma parte de un sistema de evaluacion de dos capas: el decomposer produce el grafo de requisitos y un backend VQA (el Qwen3.5-9B sin modificar) puntua la satisfaccion de cada requisito en la imagen SVG generada. La agregacion aplica unique-ancestor gating con alpha 0.5, de forma que la puntuacion de un requisito se atenua si sus prerequisitos en el grafo obtienen valores bajos. No se detallan en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de grafos de dependencias de requisitos visuales atomicos en formato JSON a partir de un prompt de texto.
- Razonamiento estructurado sobre relaciones de prerequisito entre requisitos visuales (grafo dirigido, no lista plana).
- Generacion de texto conversacional (pipeline `text-generation`), aunque el uso previsto es la salida JSON.
- Modo thinking desactivable: la model card indica explicitamente desactivar el razonamiento extendido y solicitar unicamente el grafo JSON.
- Soporte de un system prompt especifico publicado en el repositorio (`svgfaith/prompts/decomposer_system.txt`).
- Capacidades multilingues limitadas al ingles (`language: en`).
- No procesa imagenes: la verificacion visual corresponde al backend VQA separado.

## Casos de uso

- Evaluacion de fidelidad en generacion text-to-SVG: el modelo descompone el prompt original en requisitos atomicos y el backend VQA comprueba cada uno sobre el SVG resultante, produciendo una puntuacion interpretable por requisito en lugar de una metrica agregada opaca.
- Meta-evaluacion de metricas existentes: permite analizar que dimensiones de fidelidad capturan mejor metricas como CLIPScore o SSIM, al disponer de una descomposicion granular y trazable de los requisitos del prompt.
- Diagnostico de fallos en pipelines de generacion vectorial: al identificar que requisitos concretos incumple un SVG (por ejemplo, posicion relativa de objetos o atributos de color), el grafo permite localizar la causa del error y dirigir el ajuste del generador.
- Investigacion en evaluacion de modelos generativos: sirve como componente reproducible en experimentos academicos sobre fidelidad prompt-imagen en dominios vectoriales, con codigo y datos de benchmark publicos en el repositorio de GitHub.
- Construccion de datasets anotados con estructura de dependencias: el grafo generado puede usarse para enriquecer pares prompt-SVG con anotaciones de requisitos y relaciones de prerequisito.
- Integracion en pipelines de control de calidad: en un flujo de produccion de graficos vectoriales generados por IA, el decomposer alimenta un paso de validacion automatizada que descarta o marca salidas que no satisfacen requisitos criticos.
- Experimentos de alineamiento con GRPO: el checkpoint y la receta de entrenamiento (SFT con profesor, rejection sampling, GRPO) sirven como referencia para fine-tuning de dominio sobre modelos de ~9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs de 24 GB o mas para contexto moderado.
- Cuantizacion a 8 bits: alrededor de 10-11 GB de VRAM, viable en RTX 4090 (24 GB) con margen.
- Cuantizacion a 4 bits: alrededor de 6-7 GB de VRAM, viable en GPUs consumer de 8-12 GB como RTX 3060 12 GB o RTX 4070.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en bfloat16 con concurrencia; RTX 4090 o L40S para inferencia individual en precision completa.
- Opciones de despliegue: vLLM o TGI para serving en bfloat16; llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas por el autor, requeriria conversion propia).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SVGFaith-Decomposer | 9,65 B | no disponible | Descomposicion de requisitos visuales (text-to-SVG) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9,65 B | no disponible | Generacion de texto y VQA general | no disponible en la informacion | Hugging Face |
| Qwen3.5-397B-A17B (profesor) | 397 B totales / 17 B activos | no disponible | Generacion de texto general | no disponible en la informacion | Uso como profesor en el entrenamiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento con alternativas. La comparacion con el modelo base es cualitativa: el decomposer es una especializacion de dominio del Qwen3.5-9B para una unica tarea estructurada, por lo que se espera un rendimiento inferior en tareas generales fuera de su dominio.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: solo genera grafos de requisitos visuales para evaluacion text-to-SVG; no es un modelo de proposito general.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- No procesa imagenes: requiere obligatoriamente un backend VQA separado para completar la evaluacion SVGFaith-Score.
- Requiere seguir el protocolo de uso: desactivar thinking y usar el system prompt del repositorio; desviarse de este formato puede degradar la calidad del JSON generado.
- Riesgo de alucinacion en la estructura del grafo: puede inventar requisitos no presentes en el prompt o relaciones de dependencia incorrectas, lo que sesgaria la metrica resultante.
- Sin datos publicados de benchmarks, contexto maximo ni cuantizaciones oficiales; el despliegue en produccion exige validacion propia.
- Cero descargas y cero likes en el momento de la ficha: ecosistema de validacion practicamente inexistente.
- Licencia Apache 2.0 permite uso comercial, pero el sistema depende del modelo base Qwen3.5-9B, cuyos terminos deben verificarse por separado.
- El identificador arXiv referenciado (2611.06048) debe contrastarse con la publicacion real antes de citarlo en trabajos academicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yukinonooo/SVGFaith-Decomposer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de codigo y benchmarks: https://github.com/Yukinonooo/SVGFaith
- System prompt del decomposer: `svgfaith/prompts/decomposer_system.txt` (dentro del repositorio)
- Paper SVGFaith (referencia arXiv): https://arxiv.org/abs/2611.06048
- Articulo divulgativo sobre SVGFaith: https://syncai.news/article/svgfaith-a-two-layer-meta-evaluation-of-faithfulness-metrics-for-text-to-svg-gen-4e0988
- Perfil del autor: https://huggingface.co/Yukinonooo
