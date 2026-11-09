# YYYYYYibo/qwen3-4b-guru-tsc-lgate-exp-k32-mb16-lr1e6-300-nvfp4-4k-step400

## Resumen

qwen3-4b-guru-tsc-lgate-exp-k32-mb16-lr1e6-300-nvfp4-4k-step400 es un checkpoint intermedio (paso 400) de un experimento de ajuste fino mediante aprendizaje por refuerzo (RL) sobre Qwen3-4B-Base, publicado por el usuario YYYYYYibo en Hugging Face. El modelo no es un lanzamiento oficial de Alibaba/Qwen, sino el resultado de una ejecución de investigación con el framework verl, orientada a mejorar el razonamiento matematico. El nombre codifica la configuracion del experimento: TSC con compuerta suave (soft gate) basada en desplazamiento de logits (lrms), forma exponencial, delta 0.125, k=32, micro-batch 16, learning rate 1e-6, 300 pasos y rollouts en NVFP4 con contexto de 4K.

El modelo conserva la arquitectura base de Qwen3-4B: un transformer denso de aproximadamente 4.022 millones de parametros (4,02 mil millones). Al tratarse de un checkpoint de actor exportado desde verl FSDP, los pesos publicados son los pesos maestros en precision completa, sin estado del optimizador, aunque durante el entrenamiento los rollouts se generaron con vLLM cuantizado en NVFP4. El repositorio ocupa 8,1 GB en formato safetensors y es compatible con la libreria transformers.

Su relevancia es fundamentalmente metodologica: sirve como artefacto reproducible para estudiar el efecto de una tecnica concreta de RL (compuerta de logits con forma exponencial) sobre un modelo pequeno de razonamiento matematico. No obstante, al ser un checkpoint intermedio de un experimento con cero descargas y cero likes, carece de evaluacion publica, documentacion de licencia e idiomas, por lo que no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4K (4096 tokens, segun nombre del run) |
| Tipos de cuantizacion | Pesos publicados sin cuantizar (precision completa); rollouts de entrenamiento en NVFP4; cuantizacion posterior no documentada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Base, un transformer denso con atencion por rotacion posicional (RoPE) y las innovaciones propias de la familia Qwen3, aunque la model card no detalla capas, dimensiones ocultas ni numero de cabezas. El checkpoint se obtiene tras 400 pasos de entrenamiento con RL sobre el modelo base, usando verl como framework de orquestacion y FSDP para el entrenamiento distribuido. Los pesos exportados son los pesos maestros en precision completa, sin estado del optimizador, lo que permite reanudar o reutilizar el actor sin artefactos de cuantizacion.

La innovacion tecnica declarada es el metodo TSC (probablemente *token-level soft clipping* o una variante equivalente, no aclarado en la card) con una compuerta suave basada en desplazamiento de logits (lrms), forma exponencial y delta 0,125. Los hiperparametros del run son k=32, micro-batch 16, learning rate 1e-6 y 300 pasos de entrenamiento. Durante el entrenamiento, las generaciones (rollouts) se produjeron con vLLM cuantizado en NVFP4 y contexto de 4K, lo que reduce el coste computacional de la fase de muestreo. La model card no especifica el dataset de RL, el numero de tokens de entrenamiento, la composicion de las recompensas ni si se aplicaron etapas de SFT o DPO previas.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-4B.
- Razonamiento matematico: el entrenamiento RL se orienta explicitamente a tareas de matematicas (tag `math`).
- Razonamiento de multiples pasos (multi-step reasoning), potenciado por el ajuste RL.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- Soporte de tool calling / function calling: no documentado en la model card.
- Capacidades de agente: no documentadas.
- Capacidades multilingues: no documentadas.
- Modo thinking explicito, vision o audio: no documentados.

## Casos de uso

- Investigacion en RL para matematicas: el checkpoint permite reproducir y analizar el efecto del metodo TSC con compuerta de logits sobre el rendimiento en problemas matematicos, comparando el paso 400 con el modelo base y con otros checkpoints del mismo run.
- Experimentos de ablacion: al estar los pesos en precision completa y sin estado del optimizador, se puede reanudar el entrenamiento o aplicar variaciones de hiperparametros (delta, forma de la compuerta, k) para estudiar su impacto.
- Generacion de soluciones matematicas paso a paso: adecuado para prototipos de tutoria automatica o generacion de cadenas de razonamiento en entornos de investigacion, con la cautela de que no hay evaluacion publica de calidad.
- Base para ajuste fino posterior: al ser un modelo de 4B en safetensors, sirve como punto de partida para SFT o DPO en dominios especificos con recursos moderados.
- Evaluacion de tecnicas de cuantizacion: el contraste entre rollouts en NVFP4 y pesos finales sin cuantizar permite estudiar la degradacion introducida por la cuantizacion en la fase de muestreo.
- Docencia y divulgacion: util para ilustrar como se exporta un actor de verl FSDP a un formato transformers estandar y como se documenta un experimento de RL de forma reproducible.
- Pruebas de integracion con TGI: los tags indican compatibilidad con text-generation-inference, lo que permite validar pipelines de despliegue con modelos de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y cache KV (con 4K de contexto, el total ronda 10-12 GB).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3 GB para pesos.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S; tambien funciona en RTX 4090 (24 GB) y RTX 3090 (24 GB) sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 12 GB con cuantizacion de 8 bits.
- Opciones de despliegue: transformers (nativo), text-generation-inference (segun tags), vLLM (usado en los rollouts de entrenamiento), llama.cpp y Ollama tras conversion a GGUF (no se proporciona GGUF en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-guru-tsc-lgate-exp-k32-mb16-lr1e6-300-nvfp4-4k-step400 | 4,02B | 4K | no disponible | Hugging Face (0 descargas) | Checkpoint intermedio de RL, sin benchmarks |
| Qwen3-4B-Base (oficial) | 4,02B | 32K (segun version oficial) | Apache 2.0 (segun version oficial) | Hugging Face, ampliamente distribuido | Modelo base sin RL; referencia directa |
| Qwen2.5-Math-7B | 7,6B | 4K | Apache 2.0 (segun version oficial) | Hugging Face | Especializado en matematicas, mayor tamano |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32K (segun version oficial) | MIT (segun version oficial) | Hugging Face | Alternativa pequena de razonamiento destilado |

La comparativa con el modelo base oficial es la mas relevante: el checkpoint aqui descrito parte de Qwen3-4B-Base y aplica RL, pero no documenta mejoras medibles ni condiciones de licencia, por lo que su uso comercial queda en incertidumbre frente a la licencia Apache 2.0 del original.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 400) de un experimento de investigacion, no un modelo final validado.
- No hay benchmarks publicados: se desconoce si el RL mejora, degrada o mantiene el rendimiento del modelo base.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no documentados: aunque Qwen3-4B-Base es multilingue, el ajuste RL podria haber desplazado la distribucion hacia el ingles o el chino de los datos de entrenamiento.
- Riesgo de alucinacion y de razonamiento matematico incorrecto, especialmente en problemas fuera de la distribucion del dataset de RL.
- Contexto limitado a 4K tokens, insuficiente para tareas de contexto largo.
- Sesgos desconocidos: no se documenta la composicion del dataset de RL ni filtros de seguridad.
- El nombre del run sugiere cuantizacion NVFP4 en los rollouts; los pesos publicados son de precision completa, pero no se garantiza que el comportamiento en inferencia coincida con el observado durante el entrenamiento.
- Repositorio con cero descargas y cero likes: sin validacion por parte de la comunidad.
- No se documentan capacidades de tool calling ni de agente, por lo que no deberia asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-4b-guru-tsc-lgate-exp-k32-mb16-lr1e6-300-nvfp4-4k-step400
- Framework verl (mencionado en la model card): https://github.com/volcengine/verl
- Familia Qwen3 (modelo base): https://huggingface.co/Qwen/Qwen3-4B-Base
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
- Documentacion de vLLM: https://docs.vllm.ai
