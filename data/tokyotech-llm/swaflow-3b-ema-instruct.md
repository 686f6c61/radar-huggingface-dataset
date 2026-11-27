# tokyotech-llm/SwaFlow-3B-EMA-Instruct

## Resumen

SwaFlow-3B-EMA-Instruct es la variante ajustada por instrucciones del modelo de lenguaje de flujo riemanniano (hiperspherico) SwaFlow-3B-EMA, desarrollado por tokyotech-llm (AIST e Institute of Science Tokyo) dentro del programa nacional japones FRONTia. A diferencia de los transformers autorregresivos convencionales, el modelo genera texto integrando un flujo sobre la esfera desde ruido puro, condicionado por un prefijo limpio, lo que lo convierte en un modelo no autorregresivo de flow matching.

El modelo parte de SwaFlow-3B-EMA, la media de pesos de las ultimas etapas del entrenamiento del modelo de 3B del conjunto SwaFlow, y se ha ajustado durante una epoca sobre Dolci-Instruct-SFT (1,16B tokens, 1.107 pasos). Cuenta con 3.741.325.312 parametros, una anchura de 3072, 28 capas, 24 cabezas de atencion, FFN de 8192 y un vocabulario de 49.152 tokens basado en el tokenizador de SmolLM2. Su ventana de contexto es de solo 2.048 tokens.

Su relevancia es fundamentalmente cientifica: forma parte de una suite completamente abierta (varios tamanos, estados intermedios de entrenamiento, orden de datos compartido y gemelos autorregresivos entrenados con los mismos datos) pensada para estudiar los modelos de lenguaje de flujo riemanniano a lo largo del entrenamiento y de la escala. El propio autor advierte que no esta pensado para aplicaciones: el texto generado por los modelos de flujo, incluidos los ajustados por instrucciones, es a menudo incoherente, y en tareas de eleccion multiple todos los gemelos autorregresivos, incluso el de 150M, superan en media al modelo de flujo de 3B final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo riemanniano (hiperspherico) no autorregresivo, con flow matching sobre la esfera |
| Parametros totales | 3.741.325.312 (3,74B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32) y config.json |

Detalles adicionales de configuracion: anchura 3072, 28 capas, 24 cabezas de atencion, FFN 8192, vocabulario de 49.152 tokens (tokenizador de SmolLM2). Convencion temporal: alpha = 1 es dato limpio y alpha = 0 es ruido puro; la ventana de entrenamiento es alpha en [0, 0.10].

## Arquitectura y entrenamiento

La arquitectura es un transformer no autorregresivo que genera mediante la integracion de un flujo sobre la esfera (flujo riemanniano) desde ruido, manteniendo limpios los tokens de prefijo como condicion. El preentrenamiento utilizo 4 billones (4T) de tokens de Dolma 3 Mix, con pasos de 4.096 x 2.048 tokens, optimizador AdamW y LR 3e-4 constante tras el calentamiento. El entrenamiento se ejecuto en 32 nodos con 8 NVIDIA H200 cada uno.

El ajuste por instrucciones consistio en una epoca de Dolci-Instruct-SFT: 1.107 pasos de 512 x 2.048 tokens (1,16B tokens), AdamW con LR 3e-5, calentamiento de 55 pasos y decaimiento lineal a cero durante el 90% final de los pasos, con ejemplos empaquetados por concatenacion y troceado. El prompt se mantiene limpio (alpha = 1) y no se puntua; la respuesta se corrompe con ruido al alpha de la secuencia, como en el mid-training con prefijo limpio. Los ejemplos con llamadas a herramientas (tool calls) se excluyeron del ajuste. El modelo es la media de pesos del modelo final de 3B del conjunto SwaFlow.

## Capacidades

- Generacion de texto en ingles mediante integracion de flujo con un numero configurable de evaluaciones de funcion (pasos del sampler).
- Generacion condicionada por prefijo: el prompt se mantiene limpio y el modelo completa la respuesta a partir de el.
- Ajuste por instrucciones con formato de prompt especifico (`User: <texto>` seguido de linea en blanco, `Assistant: <texto>` y terminador `<|endoftext|>` con id 0).
- Decodificacion controlable: `SamplerConfig` permite ajustar pasos, temperatura y regla de decodificacion.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- No soporta tool calling ni function calling (los ejemplos con llamadas a herramientas se excluyeron del ajuste).
- No dispone de modo thinking, vision ni audio.
- No se declara soporte nativo de agentes ni de razonamiento multi-paso.

## Casos de uso

- Investigacion sobre modelos de lenguaje de flujo: el modelo sirve como punto de comparacion directa frente a su gemelo autorregresivo entrenado con los mismos datos, para estudiar diferencias de calidad y comportamiento entre paradigmas generativos.
- Estudio de la decodificacion no autorregresiva: permite experimentar con el numero de pasos del sampler, la temperatura y la regla de decodificacion para analizar el compromiso entre coste computacional y coherencia del texto.
- Reproduccion de experimentos de la suite SwaFlow: al compartir orden de datos y receta con el resto de tamanos, facilita replicar resultados y analizar el efecto de la escala.
- Analisis de ajuste por instrucciones en modelos de flujo: el checkpoint permite estudiar como afecta una epoca de SFT (1,16B tokens) a un modelo de flujo preentrenado con 4T tokens.
- Docencia y formacion: util para explicar de forma practica el flow matching riemanniano y las diferencias con la generacion autorregresiva en un entorno de laboratorio.
- Evaluacion de formatos de prompt: permite analizar la sensibilidad del modelo al empaquetado exacto del prompt (tokenizacion por partes frente a tokenizacion de la cadena unida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica, de forma cualitativa, que en tareas de eleccion multiple todos los gemelos autorregresivos de la suite (incluido el de 150M) obtienen de media puntuaciones superiores al modelo de flujo de 3B final, y que el texto generado por los modelos de flujo es a menudo incoherente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 15 GB solo para los pesos (3,74B parametros x 4 bytes), mas memoria para activaciones y estado del sampler; se recomienda al menos 24 GB para trabajar con comodidad.
- GPU recomendadas: NVIDIA H200 (hardware de entrenamiento declarado), A100 o H100 para inferencia sin restricciones; una RTX 4090 (24 GB) puede alojar los pesos en fp32, aunque con margen ajustado.
- No se publican versiones cuantizadas (GGUF, GPTQ, AWQ), por lo que el despliegue en GPU de consumo con cuantizacion no esta soportado de fabrica.
- Opciones de despliegue: el modelo requiere el codigo de SwaFlow (repositorio swallow-llm/swaflow-suite, modulos `torchtitan.models.swaflow.hf` y `torchtitan.models.swaflow.sampling`). No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que estos asumen generacion autorregresiva.
- Latencia y throughput: no disponibles. El coste depende del numero de pasos del sampler (64 en el ejemplo de la model card) y de la longitud de secuencia solicitada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwaFlow-3B-EMA-Instruct | 3,74B | 2.048 | Flujo riemanniano no autorregresivo | Apache 2.0 | Pesos en HF (fp32) |
| SwaFlow-3B (estado base) | 3,74B | 2.048 | Flujo riemanniano no autorregresivo | Apache 2.0 | Pesos en HF |
| Gemelo autorregresivo de la suite SwaFlow | No disponible | No disponible | Autorregresivo | No disponible | No disponible |

La model card menciona gemelos autorregresivos entrenados con los mismos datos y un modelo de 150M dentro de la suite, pero no proporciona sus identificadores, especificaciones completas ni resultados numericos, por lo que la comparativa cuantitativa con alternativas externas no esta disponible.

## Limitaciones y advertencias

- Calidad de generacion baja: el autor afirma explicitamente que el texto generado por los modelos de flujo, incluidos los ajustados por instrucciones, es a menudo incoherente.
- Rendimiento inferior a modelos autorregresivos: en tareas de eleccion multiple, todos los gemelos autorregresivos de la suite, incluso el de 150M, superan en media al modelo de flujo de 3B final.
- No apto para produccion: el modelo esta disenado para estudio e investigacion, no para proporcionar modelos de aplicaciones.
- Sin alineacion de seguridad: ningun modelo de la suite esta ajustado para evitar contenido danado.
- Contexto muy limitado: 2.048 tokens, insuficiente para conversaciones largas, documentos extensos o agentes con historial amplio.
- Solo ingles: no se declara soporte de otros idiomas, incluido el espanol.
- Sin tool calling: los ejemplos con llamadas a herramientas se excluyeron del ajuste por instrucciones.
- Dependencia de codigo especifico: requiere la libreria SwaFlow y no funciona con los runners de inferencia habituales.
- Sensibilidad al formato de prompt: la tokenizacion debe hacerse por partes (como en entrenamiento); tokenizar la cadena unida puede producir divisiones distintas en los limites.
- Datos de ajuste generados parcialmente por otros modelos: algunas respuestas de Dolci-Instruct-SFT fueron generadas por otros modelos, con los riesgos de sesgo y error que ello implica.
- Restricciones de datos: Dolci-Instruct-SFT esta destinado a investigacion y uso educativo bajo las Responsible Use Guidelines de Ai2, aunque los pesos se liberan bajo Apache 2.0.
- Sesgos conocidos: no documentados de forma especifica en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-3B-EMA-Instruct
- Modelo base (media de pesos): https://huggingface.co/tokyotech-llm/SwaFlow-3B-EMA
- Estado de entrenamiento base: https://huggingface.co/tokyotech-llm/SwaFlow-3B
- Coleccion SwaFlow Suite: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Codigo: https://github.com/swallow-llm/swaflow-suite
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Dataset de ajuste por instrucciones: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Tokenizador: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
- Paper: no disponible (citacion indicada como "coming soon" en la model card)
