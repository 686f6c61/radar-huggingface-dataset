# Vishva007/Qwen3.5-9B-W4A16-AutoRound-GPTQ-G128

## Resumen

Vishva007/Qwen3.5-9B-W4A16-AutoRound-GPTQ-G128 es una cuantizacion de 4 bits del modelo base Qwen/Qwen3.5-9B, publicada por el usuario Vishva007. La cuantizacion se ha realizado con AutoRound, el metodo de cuantizacion basado en descenso de gradiente con signo desarrollado por Intel, en configuracion W4A16 (pesos de 4 bits, activaciones en FP16) con tamano de grupo 128 y cuantizacion simetrica. El objetivo es reducir aproximadamente un 50 % la huella de memoria respecto al modelo base en FP16, manteniendo una precision cercana a la original, para facilitar el despliegue en GPU de gama media y consumer.

El modelo conserva las capacidades del Qwen3.5-9B original, pero los detalles de arquitectura, contexto, idiomas y entrenamiento no estan documentados en la model card de esta cuantizacion; el autor remite a la pagina del modelo base. Un dato relevante es que la cuantizacion tiene MTP (Multi-Token Prediction) habilitado, lo que permite decodificacion especulativa en backends compatibles como vLLM para aumentar el throughput.

Es relevante ahora porque ofrece una via practica de servir un modelo de ~9B en 4 bits con un formato GPTQ/AutoRound ampliamente soportado (vLLM, SGLang, AutoGPTQ) y con decodificacion especulativa integrada. El repositorio tiene un tamano de 22,9 GB, lo que sugiere que incluye pesos en safetensors junto con otros artefactos de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (heredada del modelo base Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 4.818.296.048 (segun safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones FP16), grupo 128, simetrica, AutoRound/GPTQ |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato AutoRound GPTQ) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-9B, que no se detalla en la informacion disponible. Esta publicacion no entrena un modelo nuevo, sino que aplica una cuantizacion post-entrenamiento sobre los pesos del base. El proceso AutoRound se ejecuto con 1000 iteraciones, 512 muestras de calibracion, longitud de secuencia 4096, batch size 8, cuantizacion simetrica y Torch Compile habilitado. El resultado son pesos de 4 bits con activaciones en FP16 para mantener estabilidad en inferencia.

La innovacion destacable es la habilitacion de MTP (Multi-Token Prediction), que permite usar decodificacion especulativa en backends compatibles. Segun la model card, con vLLM se activa mediante `--speculative_config '{"method":"mtp","num_speculative_tokens":3}'`, y se recomienda `num_speculative_tokens=1` como valor estable por defecto. No se documentan datos de entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B; no se detallan capacidades especificas en la model card de la cuantizacion.
- Codigo y matematicas: no disponible de forma explicita en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no listados).
- Decodificacion especulativa: soportada mediante MTP, con configuracion para vLLM.
- Modo thinking / vision / audio: no disponible.

## Casos de uso

- Despliegue de inferencia en GPU de gama media: al reducir aproximadamente un 50 % la memoria frente a FP16, permite servir un modelo de ~9B en tarjetas con menos VRAM, usando vLLM o SGLang con pesos AutoRound GPTQ.
- Servicio de chat de baja latencia: la combinacion de cuantizacion W4A16 y decodificacion especulativa MTP permite aumentar el throughput por GPU en cargas conversacionales, ajustando `num_speculative_tokens` segun el equilibrio velocidad/precision.
- Backend de generacion de texto en produccion: el formato GPTQ/AutoRound es compatible con AutoGPTQ, vLLM y SGLang, lo que facilita integrarlo en pipelines existentes sin reentrenar.
- Prototipado e investigacion: util para evaluar el impacto de la cuantizacion AutoRound W4A16 frente al modelo base Qwen3.5-9B en tareas concretas, comparando calidad y rendimiento.
- Fine-tuning ligero o evaluacion posterior: al estar en safetensors y licencia apache-2.0, sirve como punto de partida para experimentos que requieran un modelo de ~9B con menor huella de memoria.
- Evaluacion de decodificacion especulativa: permite medir en entornos controlados la ganancia de MTP con distintos valores de tokens especulativos y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay cifra oficial; la model card indica una reduccion de ~50 % de memoria respecto a FP16. El repositorio ocupa 22,9 GB, aunque el peso efectivo en 4 bits debe ser considerablemente menor que el del base en FP16.
- GPU recomendadas: no disponibles de forma explicita; por el tamano del modelo, cabria esperar despliegue en GPU de gama media y consumer, pero no se confirma en la informacion.
- Compatibilidad con GPU consumer: no confirmada; la model card menciona "consumer and mid-range GPUs" de forma generica.
- Opciones de despliegue: transformers, vLLM, SGLang y AutoGPTQ (backends compatibles con pesos AutoRound GPTQ). Para MTP, vLLM con `--speculative_config`.
- Latencia y throughput: no disponibles; la model card solo afirma mejora de throughput con MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vishva007/Qwen3.5-9B-W4A16-AutoRound-GPTQ-G128 | 4.818.296.048 (segun safetensors) | no disponible | W4A16 AutoRound GPTQ, grupo 128 | apache-2.0 | Hugging Face |
| Vishva007/Qwen3.5-9B-W4A16-AutoRound-GPTQ | no disponible | no disponible | W4A16 AutoRound GPTQ | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (base) | no disponible en la informacion | no disponible | FP16 (base) | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede introducir degradacion de calidad respecto al modelo base; no se publican metricas que cuantifiquen esa perdida.
- La model card de esta variante no documenta sesgos, idiomas ni limitaciones del modelo base; hay que consultar la pagina de Qwen/Qwen3.5-9B.
- Riesgo de alucinacion inherente al modelo base; no cuantificado en la informacion disponible.
- La longitud de contexto no esta documentada en esta ficha; no debe asumirse un valor concreto.
- El uso de MTP requiere backend compatible (vLLM) y configuracion especifica; valores altos de `num_speculative_tokens` pueden afectar a la precision.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los artefactos incluidos en el repositorio.
- El repositorio tiene 49 descargas y 0 likes en el momento de la consulta; es una publicacion de terceros, no oficial de Qwen, por lo que la validacion en produccion corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/Qwen3.5-9B-W4A16-AutoRound-GPTQ-G128
- Variante relacionada: https://huggingface.co/Vishva007/Qwen3.5-9B-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- AutoRound (Intel): https://github.com/intel/auto-round
