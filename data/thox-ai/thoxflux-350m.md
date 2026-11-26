# Thox-ai/ThoxFlux-350M

## Resumen

ThoxFlux-350M es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-350M, desarrollado por Thox-ai para su linea de dispositivos de asistencia local denominada ThoxClip. Se trata de un LoRA de rango 32 entrenado sobre un corpus propio de 982 ejemplos de conversacion, uso de herramientas y factualidad, cuyos pesos se han fusionado en los pesos base. El modelo esta disenado para ejecutarse integramente en dispositivo (on-device), sin conexion a red, y su proposito principal es la identidad de marca, la voz corporativa de THOX y el enrutado de intenciones hacia funciones del dispositivo y de la malla (mesh).

Con 354.483.968 parametros reales y un tamano de repositorio de 2,8 GB, se distribuye en safetensors y en una cuantizacion GGUF Q4_K_M de aproximadamente 229 MB, ademas de un Modelfile para Ollama. La arquitectura subyacente es LFM2.5 de LiquidAI, si bien la model card no detalla la composicion interna de la misma. El modelo solo declara soporte de ingles.

Su relevancia actual es limitada y muy especifica: no compite en capacidad general, sino que ejemplifica el patron de modelos diminutos para dispositivos dedicados. El propio autor advierte que los pesos desnudos no son una fuente fiable de hechos y que el despliegue requiere una capa de servicio que aporte el contexto factual (grounding).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (LiquidAI), ajuste fino LoRA rango 32 fusionado; detalles internos no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M; safetensors en precision original |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (etiquetada como "other"); no es Apache-2.0 |
| Formato de pesos | safetensors (708.984.464 B), GGUF Q4_K_M (229.314.592 B), Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M y se obtiene mediante un ajuste fino LoRA de rango 32 sobre un corpus elaborado por THOX de 982 ejemplos que cubren conversacion, uso de herramientas y factualidad. Los adaptadores se fusionan posteriormente en los pesos base, de modo que el repositorio contiene los pesos completos y el tokenizador, no un adaptador separado. La model card no especifica el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO; tampoco describe innovaciones arquitectonicas propias, ya que la estructura corresponde a la del modelo base.

El entrenamiento declarado no pretende anadir capacidad nueva, sino ensenar identidad de marca, voz corporativa y las formas de enrutado de herramientas. El autor es explicito en que no se reclama ningun entrenamiento adicional mas alla de lo descrito en la tarjeta. Se incluye un archivo `training_summary.json` en el repositorio, aunque su contenido no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto conversacional de respuesta corta, orientada a un asistente de dispositivo.
- Enrutado de intenciones (tool routing) hacia funciones del dispositivo y de la malla MeshStack.
- Uso de herramientas (tool use) segun el corpus de entrenamiento, con formas de llamada aprendidas.
- Adopcion de una voz corporativa concreta (house voice de THOX) e identidad de marca.
- Respuesta en ingles unicamente.
- Ejecucion completamente offline en hardware de gama baja.
- No se declaran capacidades de vision, audio, razonamiento multi-paso avanzado ni modo de pensamiento extendido.
- La factualidad no reside en los pesos: requiere una capa de servicio que aporte los hechos.

## Casos de uso

- Asistente de dispositivo dedicado: el modelo gestiona respuestas conversacionales breves en local, sin salida a red, lo que encaja con el requisito de privacidad de los dispositivos ThoxClip y con su reducido consumo de memoria (unos 229 MB en Q4_K_M).
- Enrutado de comandos por voz o texto: traduce una intencion del usuario en una llamada a una funcion del dispositivo o de la malla, aprovechando el entrenamiento especifico en tool routing y su baja latencia esperada en hardware modesto.
- Prototipado de interfaces conversacionales embebidas: sirve como banco de pruebas para validar plantillas de chat y flujos de herramientas en un entorno Ollama antes de integrar un modelo mayor.
- Filtro o clasificador de primera etapa: al ser un modelo de 350M, puede preclasificar consultas y derivar las complejas a un modelo mayor o a un servicio con grounding, reduciendo coste y latencia en el camino comun.
- Demostraciones de IA local-first: util para articulos y talleres sobre despliegue en dispositivo, dado que se ejecuta con `ollama run` en un portatil convencional.
- Personalizacion de marca en asistentes de terceros: el patron de ajuste LoRA sobre un corpus pequeno y propio es replicable para dotar a un asistente de una voz e identidad concretas, aunque el resultado hereda las limitaciones de un modelo de 350M.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| THOX GATE49 (factualidad, conjunto de desarrollo, ponderado por abstencion) | 20/49 — media 2,49/5 |
| Fallos duros en GATE49 | 18 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion es el GATE49 propio del autor, medido solo con los pesos y sin grounding del lado del servicio, y el propio autor lo califica como un resultado debil.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,7 GB con safetensors en precision original y aproximadamente 0,25-0,5 GB con el GGUF Q4_K_M, incluyendo overhead de contexto y runtime.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer con 2 GB o mas de VRAM es suficiente. Una RTX 4090 o una A100 estan sobredimensionadas para este modelo.
- Cabe holgadamente en GPU consumer (GTX 1050 Ti, RTX 3050, RTX 4060 y superiores) y en CPU sola.
- Opciones de despliegue: Ollama (via `ollama pull Thox-ai/thoxflux-350m`), llama.cpp con el GGUF Q4_K_M, y transformers con los safetensors. vLLM y TGI no estan documentados para este modelo en la informacion disponible.
- Latencia y throughput: no disponibles. Por el tamano, se espera una generacion en tiempo real o superior en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ThoxFlux-350M | 354M | no disponible | en | LFM Open License v1.0 (limita uso comercial a entidades con menos de 10 M USD de ingresos anuales) | Fine-tune de marca con tool routing; requiere grounding |
| LiquidAI/LFM2.5-350M | 350M | no disponible | en | LFM Open License v1.0 | Modelo base sin ajuste de marca; referencia directa |
| Qwen2.5-0.5B | 0,5B | no disponible en esta ficha | multilingue | Apache-2.0 | Alternativa de tamano similar con licencia permisiva |
| SmolLM2-360M | 360M | no disponible en esta ficha | en | Apache-2.0 | Alternativa de tamano similar orientada a dispositivo |

La comparativa con Qwen2.5-0.5B y SmolLM2-360M se ofrece por categoria y tamano; no se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Factualidad poco fiable en los pesos desnudos: el propio autor indica que el modelo no es una fuente fiable de hechos de THOX y exige una capa de servicio con grounding.
- Resultado debil en la evaluacion propia: 20/49 en GATE49, con 18 fallos duros y una media de 2,49/5.
- Techo de razonamiento bajo por diseno, propio de un modelo de 350M; el ajuste no anade capacidad nueva.
- Contexto limitado, aunque la longitud exacta no se especifica en la informacion disponible.
- Solo ingles; no se declara soporte de castellano ni de otros idiomas.
- Licencia restrictiva: la LFM Open License v1.0 no es Apache-2.0 y limita el uso comercial a entidades por debajo de 10 M USD de ingresos anuales; debe revisarse el archivo `LICENSE` antes de cualquier despliegue comercial.
- Uso fuera de alcance: decisiones medicas, legales o de seguridad sin supervision humana.
- La model card esta truncada en la informacion disponible, por lo que podrian existir limitaciones adicionales no recogidas aqui.
- Riesgo de alucinacion inherente al tamano y al corpus de entrenamiento reducido (982 ejemplos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxFlux-350M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Demostracion de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campana de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Repositorio de Ollama: https://ollama.com/Thox-ai/thoxflux-350m
