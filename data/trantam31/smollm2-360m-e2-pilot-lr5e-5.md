# trantam31/smollm2-360m-e2-pilot-lr5e-5

## Resumen

Smollm2-360m-e2-pilot-lr5e-5 es un ajuste fino (fine-tuning) del modelo SmolLM2-360M de Hugging Face, publicado por el usuario trantam31 en Hugging Face. Se trata de un modelo de generación de texto compacto, con 361.821.120 parámetros, orientado a experimentación y despliegue en hardware modesto. El nombre sugiere que se trata de una prueba piloto de entrenamiento con una tasa de aprendizaje de 5e-5 y dos épocas (e2), aunque la model card no detalla el dataset utilizado ni los objetivos concretos del ajuste.

Su relevancia reside en la familia SmolLM2, una serie de modelos ligeros diseñados para funcionar en dispositivos con recursos limitados y para tareas de investigación reproducible. Al ser un fine-tune sobre una base bien conocida y con licencia Apache 2.0, resulta útil como punto de partida para pruebas rápidas, prototipos o estudios de entrenamiento, aunque la escasa documentación del autor obliga a evaluarlo con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M, un transformer decoder-only con estructura tipo Llama. El ajuste fino se realizó con la libreria Transformers (version 5.20.2) sobre PyTorch 2.11.0+cu130, empleando precision mixta nativa (Native AMP).

Los hiperparametros de entrenamiento publicados son: tasa de aprendizaje de 5e-05 con planificador coseno y calentamiento del 3 % de los pasos, tamaño de lote por dispositivo de 8 con 4 pasos de acumulacion de gradiente (lote efectivo de 32), optimizador AdamW (variante fused de PyTorch) con betas (0.9, 0.999) y epsilon 1e-08, semilla 0 y un total de 125 pasos de entrenamiento. El dataset de entrenamiento no está documentado: la model card lo declara explicitamente como desconocido ("unknown dataset"), y no hay informacion sobre RLHF, DPO ni otras tecnicas de alineacion posteriores.

## Capacidades

- Generacion de texto en formato pipeline `text-generation`, heredada del modelo base SmolLM2-360M.
- Capacidades generales del modelo base (razonamiento ligero, codigo y tareas de chat a escala pequeña), aunque el ajuste fino puede haber modificado el comportamiento original.
- Compatibilidad con la libreria Transformers y con infraestructuras de inferencia estandar (`text-generation-inference`, endpoints compatibles).
- No hay evidencia documentada de soporte para tool calling, agentes, vision, audio ni modos de razonamiento extendido.

## Casos de uso

- Experimentacion con fine-tuning: al tratarse de un modelo de 360M parámetros, es idoneo para reproducir o comparar recetas de entrenamiento en GPUs de consumo sin costes elevados.
- Prototipado rapido de pipelines de NLP: puede integrarse en cadenas de transformacion de texto simples (clasificacion generativa, resumen basico, reescritura) donde la calidad de un modelo grande no es imprescindible.
- Investigacion sobre tasas de aprendizaje: el nombre del modelo sugiere que forma parte de un barrido de hiperparametros (lr 5e-5); sirve como punto de comparacion para estudiar el efecto del learning rate en modelos pequeños.
- Despliegue en dispositivos con recursos limitados: su tamano reducido permite ejecutarlo en laptops o GPUs de gama media para tareas de generacion de texto offline.
- Evaluacion y benchmarking propio: como base desconocida de datos, puede usarse para evaluar el impacto de ajustes finos poco documentados frente al modelo original.
- Ensenanza y formacion: util como ejemplo practico en cursos sobre ajuste fino de LLMs, dado que publica hiperparametros completos y usa el Trainer estandar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card contiene una lista de resultados vacia y no existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16/BF16, un modelo de ~362M parámetros ocupa aproximadamente 0,8 GB de pesos, mas overhead de KV cache y activaciones; 2 GB de VRAM son suficientes con holgura. En FP32 serian alrededor de 1,5 GB.
- GPUs recomendadas: cualquier GPU moderna; desde una GTX 1650 o una RTX 3060 hasta una A100, aunque el modelo no aprovecha hardware de gama alta.
- Consumer GPUs: cabe sobradamente en practicamente cualquier GPU de consumo, incluso en las de gama de entrada con 4 GB de VRAM.
- Despliegue: compatible con Transformers (libreria nativa del modelo), TGI (text-generation-inference, indicado en los tags) y endpoints compatibles de Hugging Face. No hay cuantizaciones GGUF publicadas en el repo, por lo que llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput: no disponibles; por su tamano, cabe esperar latencias bajas y throughputs altos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Contexto | Notas |
|---|---|---|---|---|
| trantam31/smollm2-360m-e2-pilot-lr5e-5 | 361,8M | Apache 2.0 | no disponible | Fine-tune experimental, dataset no documentado, sin benchmarks |
| HuggingFaceTB/SmolLM2-360M (base) | ~360M | Apache 2.0 | 8192 tokens | Modelo base bien documentado, con benchmarks publicados |
| HuggingFaceTB/SmolLM2-135M | ~135M | Apache 2.0 | 8192 tokens | Version mas pequeña de la familia, para dispositivos muy limitados |
| HuggingFaceTB/SmolLM2-1.7B | ~1.700M | Apache 2.0 | 8192 tokens | Version mayor de la familia, mayor capacidad a cambio de mas VRAM |

La comparacion mas relevante es con el modelo base: dado que el fine-tune no publica datos de entrenamiento ni evaluaciones, no puede afirmarse que mejore a SmolLM2-360M en ninguna tarea concreta.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe el dataset, los usos previstos ni las limitaciones, lo que impide evaluar adecuadamente el comportamiento del modelo.
- Dataset de entrenamiento desconocido: existe riesgo de sesgos no identificados, contaminacion de datos o regresiones respecto al modelo base.
- Riesgo de alucinacion: inherente a cualquier LLM y agravado por la falta de evaluaciones; no hay metricas que permitan estimarlo.
- Sin benchmarks publicados: cualquier decision de adopcion requiere evaluacion propia previa.
- Contexto e idiomas no documentados: la longitud de ventana y el soporte multilingue deben inferirse del modelo base y verificarse empiricamente.
- Naturaleza experimental: el nombre ("pilot") y los 125 pasos de entrenamiento sugieren una prueba piloto, no un modelo destinado a produccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos de la familia SmolLM2 original, que comparten la misma licencia permisiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trantam31/smollm2-360m-e2-pilot-lr5e-5
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Coleccion SmolLM2 (referencia de la familia): https://huggingface.co/HuggingFaceTB
- Blog de Hugging Face sobre SmolLM2: https://huggingface.co/blog/smollm2
