# tommmxsx/SFT-Qwen3-0.6B-WebShop

## Resumen

SFT-Qwen3-0.6B-WebShop es un checkpoint de ajuste supervisado (SFT) del modelo Qwen3-0.6B de Alibaba, publicado por el usuario tommmxsx en Hugging Face. El modelo está especializado en tareas de compra multi-paso dentro del entorno WebShop, un benchmark de agentes que simula una tienda online con un catálogo de 1.000 productos y requiere que el agente navegue, busque y seleccione artículos siguiendo instrucciones en lenguaje natural. Este checkpoint se guardó antes de la fase de aprendizaje por refuerzo (RL), por lo que representa la etapa inicial de un pipeline de entrenamiento orientado a agentes.

El modelo resuelve un problema concreto: dotar a un LLM pequeño (751 millones de parámetros reales según safetensors, pese a la denominación "0.6B" del modelo base) de la capacidad de emitir acciones estructuradas en formato `<action>...</action>` a partir de observaciones del entorno y hasta dos pares observación-acción previos. Es relevante para investigadores que trabajan en agentes ligeros desplegables en hardware modesto, ya que demuestra que un modelo de menos de 1.000 millones de parámetros puede alcanzar un 75,91% de Pass@1 en un holdout sintético de WebShop y un 39,00% en el test oficial de Princeton.

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, con licencia no especificada en la información disponible. El contexto del modelo base Qwen3-0.6B no se detalla en la model card proporcionada, por lo que se indica como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. El ajuste supervisado se realizó sobre los 751.632.384 parámetros totales (todos los parámetros, según indica la model card: "We fine-tuned all model parameters"). El entrenamiento se llevó a cabo durante 2 épocas con una tasa de aprendizaje de 1e-5 y un tamaño de batch global de 8, guardándose el checkpoint en el paso 582.

Los datos de entrenamiento se recopilaron utilizando el modelo langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop como generador de trayectorias en el catálogo de 1.000 productos de WebShop. Se retuvieron 500 trayectorias exitosas distribuidas por categorías: moda (216), jardín (88), belleza (66), electrónica (66) y alimentación (64). La división se hizo por tarea antes de convertir las trayectorias en ejemplos a nivel de paso: el conjunto de entrenamiento contiene 2.330 ejemplos de 449 tareas y el conjunto de validación interno contiene 255 ejemplos de 51 tareas. Cada ejemplo incluye la instrucción de compra, la observación actual y hasta dos pares observación-acción previos, con el siguiente paso como objetivo en formato `<action>...</action>`. No se menciona el uso de RLHF, DPO ni técnicas de decodificación especulativa en la información disponible.

## Capacidades

- Generación de acciones estructuradas en formato `<action>...</action>` para entornos de agente tipo WebShop.
- Razonamiento multi-paso limitado a un máximo de 15 pasos de interacción por rollout en la evaluación.
- Procesamiento de instrucciones de compra en lenguaje natural junto con observaciones del entorno y hasta dos pares observación-acción previos.
- Navegación por catálogo de productos: búsqueda, selección de artículos y finalización de compra simulada.
- Soporte de tool calling / function calling: no disponible explícitamente; el modelo emite acciones en formato textual, no llamadas a funciones estructuradas.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de agentes ligeros en WebShop: el modelo sirve como baseline SFT para comparar con checkpoints posteriores a RL o con modelos de mayor tamaño en el benchmark WebShop, gracias a sus resultados publicados (75,91% Pass@1 en holdout sintético y 39,00% en test oficial).
- Investigación en pipelines SFT+RL: al ser un checkpoint guardado antes de RL, es adecuado como punto de partida para experimentos de aprendizaje por refuerzo en entornos de compra, reduciendo el coste computacional frente a modelos de 7B.
- Despliegue en hardware de consumo: con 751 millones de parámetros, cabe en GPUs consumer (por ejemplo, RTX 3060/4060 en cuantización de 8 bits o 4 bits) para prototipos de agentes de compra.
- Generación de datos sintéticos de trayectorias: puede usarse para producir trayectorias de compra que luego se filtren y reutilicen en el entrenamiento de modelos mayores.
- Simulación de atención al cliente en e-commerce: el modelo puede gestionar interacciones multi-paso con observaciones del catálogo, aunque limitado a las categorías y al catálogo de 1.000 productos de WebShop.
- Estudio de generalización de instrucciones: permite analizar la brecha entre instrucciones sintéticas (holdout interno) e instrucciones humanas (test oficial de Princeton), con una diferencia de Pass@1 de 75,91% a 39,00%.
- Prototipado de agentes con presupuesto de cómputo reducido: al requerir menos VRAM que alternativas de 7B, facilita iteraciones rápidas en investigación académica.

## Benchmarks y rendimiento

| Evaluación | Tareas | Intentos por tarea | Pass@1 | Pass@4 | Puntuación media (/100) |
|---|---:|---:|---:|---:|---:|
| WebShop small holdout | 495 | 4 | 75,91% | 78,38% | 86,69 |
| Princeton official test | 500 | 1 | 39,00% | — | 64,31 |

Pass@1 es la tasa de éxito por intento individual. Pass@4 es el porcentaje de tareas con al menos un rollout exitoso de cuatro. La puntuación media incluye crédito parcial y se promedia entre intentos. Cada rollout se limitó a 15 pasos de interacción. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo de 751 millones de parámetros en fp16 se estiman aproximadamente 1,5 GB de pesos, más overhead de activaciones y KV cache, aunque esta estimación no procede de la model card.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; por tamaño (751M parámetros) es plausible en GPUs consumer, pero no se aporta dato oficial.
- Opciones de despliegue: la model card solo menciona `transformers` y la etiqueta `text-generation-inference`; no se detallan opciones como vLLM, llama.cpp, Ollama o TGI más allá de la etiqueta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pass@1 WebShop (test oficial) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| SFT-Qwen3-0.6B-WebShop | 751.632.384 | no disponible | 39,00% | no disponible | Hugging Face |
| langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop | no disponible (base Qwen2.5-7B) | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 751.632.384 (aprox.) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente en el catálogo de 1.000 productos de WebShop y en cinco categorías (moda, jardín, belleza, electrónica, alimentación); no se espera generalización a otros dominios de compra.
- Brecha de generalización: el Pass@1 cae del 75,91% en el holdout sintético al 39,00% en el test oficial con instrucciones humanas, lo que indica sobreajuste a la distribución sintética.
- Checkpoint pre-RL: guardado antes del entrenamiento por refuerzo, por lo que no incorpora las mejoras que el pipeline completo pudiera aportar.
- Licencia no disponible: no se especifica la licencia del checkpoint ni la del modelo base en la información proporcionada, lo que impide confirmar si se permite uso comercial.
- Idiomas no disponibles: no se especifica qué idiomas soporta; el entrenamiento se realizó sobre instrucciones de WebShop, presumiblemente en inglés, pero no está confirmado.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de generación de acciones, puede emitir acciones inválidas o no alineadas con el catálogo.
- Contexto limitado a dos pares observación-acción previos en el formato de entrenamiento; no se especifica la longitud de contexto del modelo base.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tommmxsx/SFT-Qwen3-0.6B-WebShop
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo generador de trayectorias: https://huggingface.co/langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop
- Repositorio WebShop: https://github.com/princeton-nlp/WebShop
- Paper WebShop: https://arxiv.org/abs/2207.01206
