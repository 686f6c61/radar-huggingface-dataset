# YYYYYYibo/qwen3-4b-guru-scgate-k32-mb16-lr1e6-300-nvfp4-4k-step400

## Resumen

El modelo `qwen3-4b-guru-scgate-k32-mb16-lr1e6-300-nvfp4-4k-step400` es un checkpoint de ajuste fino por aprendizaje por refuerzo (RL) construido sobre Qwen3-4B-Base. Lo publica el usuario YYYYYYibo en Hugging Face y está orientado especificamente al razonamiento matematico, segun indican las etiquetas de la model card (`rl`, `math`, `verl`). El checkpoint corresponde al paso 400 de un entrenamiento cuyo nombre de ejecucion codifica la configuracion: `guru` (presumiblemente el dataset de razonamiento matematico), `scgate` (Score Centering with ratio gate, el metodo de RL empleado), `k32` (probablemente 32 rollouts por prompt), `mb16` (micro-batch de 16), `lr1e6` (learning rate 1e-6), `nvfp4` (rollouts cuantizados en NVFP4 para vLLM) y `4k` (contexto de 4.096 tokens).

Se trata de un modelo denso de 4.022.468.096 parametros (unos 4.000 millones), exportado desde un actor FSDP de verl en precision completa, sin estado de optimizador. Aunque los rollouts durante el entrenamiento usaron vLLM con cuantizacion NVFP4, los pesos publicados son los del actor sin cuantizar, en formato safetensors. El repositorio ocupa 8,1 GB.

Su relevancia es acotada pero clara: es un artefacto de investigacion que documenta una receta concreta de RL para matematicas sobre una base Qwen3, util para quien quiera reproducir o comparar metodos de RL (concretamente Score Centering con ratio gate) sobre modelos de 4B, o para estudiar el efecto del entrenamiento con rollouts cuantizados en NVFP4 sobre los pesos finales. No es un modelo de proposito general ni cuenta con validacion externa: cero descargas, cero likes y sin benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (segun nombre de ejecucion, `4k`) |
| Tipos de cuantizacion | no disponible en el repo (pesos en precision completa); los rollouts de entrenamiento usaron NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Base, un transformer denso de unos 4.000 millones de parametros. Sobre esa base se aplico un ajuste fino por RL con el framework verl, usando un actor FSDP. El checkpoint publicado esta en el paso 400 y contiene unicamente los pesos maestros en precision completa, sin estado de optimizador. El nombre de la ejecucion indica que los rollouts durante el entrenamiento se generaron con vLLM en cuantizacion NVFP4 (formato de coma flotante de 4 bits de NVIDIA), lo que constituye un detalle tecnico relevante: el modelo aprende a partir de muestras generadas por una version cuantizada de si mismo, mientras que los pesos exportados son los del actor sin cuantizar.

El metodo de RL se denomina en la model card "Score Centering with ratio gate" (abreviado `scgate`). No se proporciona en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset `guru` ni los hiperparametros completos mas alla de los codificados en el nombre: `k32`, `mb16`, `lr1e6` y contexto de 4K. Tampoco se documenta si hubo fases previas de SFT, DPO o RLHF adicionales. No hay informacion sobre innovaciones arquitectonicas propias: el modelo hereda la arquitectura de Qwen3 sin modificaciones estructurales segun los datos disponibles.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento matematico: es el dominio declarado del ajuste fino (`math`), con entrenamiento por RL orientado a resolver problemas.
- Razonamiento multi-paso: el entrenamiento con RL sobre problemas matematicos suele reforzar cadenas de razonamiento, aunque no se documenta explicitamente un modo "thinking" separado.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; los idiomas no estan declarados.
- Vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion en RL para matematicas: sirve como punto de comparacion reproducible frente a otros checkpoints de la misma ejecucion o de recetas alternativas, ya que el nombre codifica la configuracion exacta (k32, mb16, lr1e-6, NVFP4, 4K).
- Evaluacion del efecto de rollouts cuantizados: permite estudiar como afecta entrenar con generaciones en NVFP4 a los pesos finales en precision completa, comparando con una ejecucion equivalente sin cuantizacion.
- Generacion de soluciones matematicas paso a paso: el ajuste con RL sobre el dataset `guru` lo hace adecuado para producir razonamientos encadenados en problemas de nivel escolar o de competicion, dentro de su ventana de 4K tokens.
- Base para experimentos de destilacion o merging: al ser un checkpoint intermedio (paso 400) de 4B, es un candidato practico para fusionar con otros adaptadores o para destilar en modelos menores.
- Prototipado de asistentes de matematicas en local: con 4B parametros cabe en GPUs de consumo en cuantizacion de 4-8 bits, lo que permite desplegarlo con llama.cpp u Ollama para pruebas internas.
- Analisis de estabilidad del entrenamiento RL: al estar en el paso 400, permite inspeccionar si el modelo ya ha convergido o si presenta colapso de diversidad, util para diagnosticar la receta `scgate`.
- Fine-tuning posterior en dominios cientificos: su tamano contenido y su base Qwen3 lo convierten en un punto de partida manejable para ajustes supervisados en fisica, estadistica o ingenieria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 10-12 GB para contexto de 4K.
- VRAM estimada en cuantizacion de 8 bits: unos 4-5 GB de pesos, con un total de 6-8 GB incluyendo cache.
- VRAM estimada en cuantizacion de 4 bits: unos 2,5-3 GB de pesos, con un total de 4-6 GB.
- GPU recomendadas para produccion: A100 40/80 GB, H100 o L40S si se quiere servir en BF16 con alto throughput y batching.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 sin problema, y en RTX 3090, 4080 o incluso 4060 Ti 16 GB en cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM (coherente con el entorno de entrenamiento), TGI (etiqueta `text-generation-inference`), llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-guru-scgate-k32-mb16-lr1e6-300-nvfp4-4k-step400 | 4,02 B | 4.096 (segun nombre) | RL matematicas sobre Qwen3-4B-Base | no disponible | Hugging Face, 0 descargas |
| Qwen3-4B-Base | ~4 B | 32.768 (configuracion estandar de Qwen3) | Preentrenamiento | Apache 2.0 (segun Qwen3) | Ampliamente disponible |
| Qwen3-4B (instruct) | ~4 B | 32.768 | SFT + RLHF | Apache 2.0 (segun Qwen3) | Ampliamente disponible |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32.768 | Destilacion de razonamiento | MIT (segun el modelo original) | Ampliamente disponible |

La comparacion con Qwen3-4B-Base e instruct es la mas directa, ya que el checkpoint deriva de ellos; la diferencia principal es el ajuste RL especifico para matematicas y la ventana reducida a 4K. Frente a destilados de razonamiento como DeepSeek-R1-Distill, el modelo aqui descrito no tiene validacion publica de rendimiento, por lo que no puede establecerse una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de que el ajuste RL haya mejorado las capacidades de la base; el checkpoint podria estar en una fase intermedia no convergida (paso 400).
- Licencia no declarada: no se especifica la licencia del checkpoint, lo que impide determinar si el uso comercial esta permitido. La base Qwen3 es Apache 2.0, pero el autor no ha hecho explicita la licencia derivada.
- Idiomas no declarados: no hay garantia de comportamiento multilingue; el entrenamiento RL en matematicas suele realizarse mayoritariamente en ingles.
- Ventana de contexto reducida a 4K: insuficiente para documentos largos, conversaciones extensas o problemas con enunciados muy largos.
- Riesgo de alucinacion: como cualquier modelo de 4B ajustado con RL, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente fuera del dominio matematico.
- Sesgos desconocidos: no se documenta la composicion del dataset `guru`, por lo que no puede evaluarse el sesgo de dominio ni la cobertura tematica.
- Sin estado de optimizador: el checkpoint no permite reanudar el entrenamiento tal cual; solo sirve para inferencia o para iniciar un nuevo ajuste.
- Cero validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentacion de terceros sobre su calidad.
- Pesos en precision completa pese al nombre `nvfp4`: quien espere un modelo ya cuantizado en NVFP4 debe saber que el repo contiene el actor sin cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-4b-guru-scgate-k32-mb16-lr1e6-300-nvfp4-4k-step400
- Qwen3-4B-Base (modelo base): https://huggingface.co/Qwen/Qwen3-4B-Base
- Framework verl (entrenamiento RL): https://github.com/volcengine/verl
- vLLM (inferencia y rollouts): https://github.com/vllm-project/vllm
