# udgamlabs/Vemana-Checkpoints

## Resumen

Vemana-Checkpoints es un repositorio de doce checkpoints intermedios del entrenamiento de Vemana-Base, un modelo de lenguaje de 278 millones de parametros entrenado desde cero para telugu por Udgam Labs, un laboratorio de investigacion independiente. El modelo emplea la clase `Gemma4ForCausalLM` de la libreria transformers y se distribuye en precision float32 junto con su tokenizador, de modo que cada checkpoint puede cargarse de forma autonoma indicando el subdirectorio correspondiente.

El interes de este repositorio es fundamentalmente metodologico: documenta la evolucion de la perdida a lo largo de 22.888 pasos y 12.000 millones de posiciones de token, con una tabla de bits por byte sobre texto fresco que permite observar el efecto de la fase de cool-down final. El entrenamiento completo se realizo en una unica GPU H100 en aproximadamente 16 horas, entre el 26 y el 27 de octubre de 2026.

No se trata de un modelo listo para produccion, sino de un artefacto de investigacion que facilita el analisis de dinamicas de entrenamiento, la comparacion entre checkpoints y la reproducibilidad de experimentos en lenguas de bajos recursos como el telugu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `Gemma4ForCausalLM`) |
| Parametros totales | 278 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,4 GB |
| Numero de checkpoints | 12 |
| Tokens de entrenamiento | 12.000 millones de posiciones de token |
| Hardware de entrenamiento | 1x NVIDIA H100 |
| Duracion del entrenamiento | aproximadamente 16 horas |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only implementado mediante la clase `Gemma4ForCausalLM` de transformers, con 278 millones de parametros y pesos en float32. El modelo se entreno desde cero, sin inicializacion a partir de pesos preentrenados, sobre un corpus de telugu. La model card no detalla la composicion del dataset, la longitud de contexto nativa ni si se aplicaron fases de RLHF o DPO; el artefacto publicado es un modelo base, no ajustado por preferencias.

El entrenamiento cubre 22.888 pasos y 12.000 millones de posiciones de token. La model card describe una fase estable entre el 40 % y el 70 % del recorrido, en la que la metrica de bits por byte sobre texto fresco se estabiliza alrededor de 0,398, seguida de un cool-down en el ultimo 20 % del run que reduce la cifra hasta 0,361. Cada checkpoint incluye un fichero `fresh.json` con las puntuaciones por pagina (416 paginas de septiembre y octubre de 2026) y un `train_state.json` con el paso, los parametros del schedule y una muestra de texto generada en ese punto.

## Capacidades

- Generacion de texto en telugu: es la unica lengua declarada en la model card.
- Modelo base sin ajuste por instrucciones: no cabe esperar un comportamiento conversacional fiable sin fine-tuning posterior.
- Analisis de dinamicas de entrenamiento: los doce checkpoints permiten trazar la curva de perdida y comparar estados intermedios.
- Evaluacion de calidad por checkpoint: la metrica de bits por byte sobre texto fresco ofrece una comparacion cuantitativa entre estados.
- Reproducibilidad: cada carpeta contiene tokenizador, pesos y metadatos del estado de entrenamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion sobre dinamicas de entrenamiento: cargar checkpoints en distintos pasos y medir la evolucion de la perplejidad o de bits por byte para estudiar el efecto del cool-down y del schedule de learning rate.
- Reproduccion de experimentos en lenguas de bajos recursos: el repositorio documenta el coste real (una H100, 16 horas, 12.000 millones de tokens) de entrenar un modelo de 278M en telugu, lo que sirve de referencia para planificar runs similares.
- Punto de partida para fine-tuning en telugu: los checkpoints finales (`final-step-022888` o `m090-step-020599`) pueden inicializar tareas posteriores como clasificacion de texto, etiquetado o generacion condicionada.
- Analisis de estabilidad del entrenamiento: comparar los checkpoints estables (`m040` a `m070`, todos en torno a 0,398 bits por byte) con los de la fase de cool-down para estudiar divergencias y convergencia.
- Docencia y divulgacion: el repositorio expone de forma transparente los artefactos intermedios de un run completo, util para cursos sobre entrenamiento de LLM desde cero.
- Evaluacion de tokenizadores para telugu: el tokenizador incluido en cada checkpoint permite analizar la eficiencia de tokenizacion sobre corpus telugu y comparar con alternativas multilingues.
- Seleccion de checkpoint para despliegue ligero: en escenarios con restricciones de memoria, un modelo de 278M en float32 (aproximadamente 1,1 GB de pesos) puede ejecutarse en CPU o en GPUs de gama baja, aunque la calidad sera inferior a la del checkpoint final.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El unico dato de evaluacion disponible es la metrica interna de bits por byte sobre 416 paginas de texto fresco de septiembre y octubre de 2026, donde menor es mejor:

| Checkpoint | Paso | Posiciones de token | Bits por byte |
|---|---|---|---|
| m010-step-002289 | 2.289 | 1,2B | 0,420 |
| m020-step-004578 | 4.578 | 2,4B | 0,414 |
| stable-025-step-005722 | 5.722 | 3,0B | 0,405 |
| gate-step-005722 | 5.722 | 3,0B | 0,383 |
| m030-step-006866 | 6.866 | 3,6B | 0,406 |
| m040-step-009155 | 9.155 | 4,8B | 0,400 |
| m050-step-011444 | 11.444 | 6,0B | 0,398 |
| m060-step-013733 | 13.733 | 7,2B | 0,398 |
| m070-step-016022 | 16.022 | 8,4B | 0,398 |
| m080-step-018310 | 18.310 | 9,6B | 0,393 |
| m090-step-020599 | 20.599 | 10,8B | 0,371 |
| final-step-022888 | 22.888 | 12,0B | 0,361 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 1,1 GB solo para los pesos (278M x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en bfloat16: aproximadamente 0,56 GB para los pesos, si se convierte manualmente, ya que el repositorio distribuye float32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en float32; una H100 fue suficiente para el entrenamiento completo en 16 horas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers es la via documentada; al ser un modelo de 278M en formato safetensors, puede convertirse a GGUF para llama.cpp u Ollama, o servirse con vLLM y TGI, aunque estas rutas no estan documentadas en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar que permitan una comparacion cuantitativa con modelos de tamano similar. A continuacion se ofrece una comparacion estructural con alternativas plausibles de la misma categoria (modelos pequenos orientados a lenguas indias o modelos base de ~300M parametros), marcando como no disponible lo que no se conoce.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Vemana-Checkpoints | 278M | no disponible | telugu | Apache-2.0 | safetensors (float32) | 12 checkpoints intermedios, entrenado desde cero |
| Vemana-Base | 278M | no disponible | telugu | Apache-2.0 | safetensors | Checkpoint final del mismo run |
| Modelos multilingues tipo Gemma 2B | ~2B | no disponible | multilingue | licencia propia de Google | safetensors, GGUF | Mayor tamano y cobertura idiomatica, no especifico de telugu |
| Modelos base ~300M (p. ej. variantes de GPT-2 small) | ~124M-350M | 1.024 tokens tipicamente | ingles mayoritario | variable | safetensors, GGUF | No orientados a telugu; comparacion solo por escala |

La comparacion de rendimiento en telugu con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base: no esta ajustado por instrucciones ni por preferencias humanas, por lo que no debe esperarse un comportamiento conversacional fiable sin fine-tuning.
- Cobertura idiomatica limitada: la unica lengua declarada es el telugu; el rendimiento en castellano u otras lenguas no esta documentado y previsiblemente sera muy deficiente.
- Contexto no documentado: se desconoce la longitud de contexto nativa, lo que impide planificar casos de uso con entradas largas.
- Riesgo de alucinacion: como todo modelo base entrenado sobre corpus web, puede generar contenido factualmente incorrecto o incoherente.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el corpus de entrenamiento puede introducir sesgos sociales, regionales o de genero presentes en el telugu de la web.
- Checkpoints intermedios: la mayoria de las carpetas representan estados no finales del entrenamiento; solo `final-step-022888` equivale a Vemana-Base.
- Licencia: Apache-2.0 permite uso comercial, pero el autor remite a la seccion `NOTICE` de Vemana-Base para las atribuciones de los datos de entrenamiento, que no se detallan en este repositorio.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso en produccion ni de validacion externa.
- Fecha de creacion futura (octubre de 2026): conviene verificar la vigencia y el estado real del repositorio antes de integrarlo en cualquier pipeline.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/udgamlabs/Vemana-Checkpoints
- Modelo base Vemana-Base: https://huggingface.co/udgamlabs/Vemana-Base
- Sitio del laboratorio: https://udgamlabs.com
- Retransmision del entrenamiento: https://udgamlabs.com/live/vemana
