# win10/Muse-MoE-65B-A30B-FP8-no-train

## Resumen

Este modelo es una variante de mezcla de expertos (MoE) del modelo agéntico multimodal Muse-Glimmer-30B de Meta, publicada por el usuario win10 en Hugging Face. Con 65.187 millones de parámetros totales y aproximadamente 30 mil millones de parámetros activos (según la nomenclatura A30B), se presenta en cuantización FP8 y sin entrenamiento adicional (no-train). El modelo base es el oficial de Meta, con licencia Apache 2.0, y sobre él se ha aplicado una intervención de abliteración a nivel de pesos que elimina los rechazos de contenido dañino, además de una conversión a arquitectura MoE.

La relevancia de este checkpoint radica en que ofrece una versión más eficiente en memoria del modelo de Meta, manteniendo la multimodalidad (imagen y texto) y las capacidades agénticas del original, pero con una huella reducida gracias a la cuantización FP8 y a la activación parcial de parámetros. Está orientado exclusivamente a investigación de seguridad, red-teaming y evaluación de mecanismos de rechazo, no a uso general como chatbot. La model card original advierte explícitamente que no debe desplegarse como modelo de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer denso con encoder de vision |
| Parametros totales | 65.187.165.184 |
| Parametros activos | ~30.000.000.000 (estimado por nomenclatura A30B) |
| Longitud de contexto | Hasta 131.072 (configuracion del modelo base) |
| Tipos de cuantizacion | FP8 |
| Idiomas soportados | Ingles y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base, Muse-Glimmer-30B, es un transformer denso con 52 capas, dimension oculta de 6656, atencion con GQA (32 queries, 2 key-value heads) y atencion hibrida local/global. Incluye un encoder de vision ViT-G/14 de aproximadamente 1.800 millones de parametros, lo que lo convierte en un modelo multimodal. La variante MoE ha sido obtenida mediante un proceso de upcycling (conversion de capas densas a capas de mezcla de expertos), aunque no se han publicado detalles sobre el numero de expertos ni la estrategia de enrutamiento. No se ha realizado ningun entrenamiento adicional (ni SFT, DPO ni RLHF); la unica modificacion aplicada es una intervencion de abliteracion a nivel de pesos (eliminacion de la direccion de rechazo) con un factor alfa de 1.5 y 3 pasadas iterativas, seguida de cuantizacion FP8. Esta intervencion reduce deliberadamente la capacidad del modelo para rechazar peticiones dañinas, por lo que el checkpoint no debe considerarse un modelo de seguridad.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base, incluyendo razonamiento multi-paso y generacion de respuestas extensas.
- Procesamiento multimodal: acepta entradas de imagen y texto, gracias al encoder de vision ViT-G/14 del modelo base.
- Capacidades agénticas: el modelo base esta disenado para flujos de trabajo agénticos, lo que sugiere soporte para tool calling y ejecucion de tareas multi-paso, aunque no se documenta explicitamente en esta variante.
- Multilingue: soporta ingles y otros idiomas, aunque no se especifica la cobertura exacta.
- Ausencia de rechazo: debido a la abliteracion, el modelo no muestra rechazo ante peticiones dañinas, lo que lo hace util para pruebas de red-teaming y evaluacion de seguridad.
- Modo de pensamiento: el modelo base incluye capacidades de razonamiento interno (thinking), aunque no se confirma si esta variante las conserva.

## Casos de uso

- Investigacion de seguridad y red-teaming: el modelo puede utilizarse para probar defensas de otros sistemas, generando ataques adversariales o prompts de jailbreak, gracias a su ausencia de rechazo.
- Evaluacion de mecanismos de rechazo: permite estudiar como funcionan los sistemas de rechazo en otros modelos, comparando respuestas con y sin abliteracion.
- Pruebas de robustez multimodal: al aceptar imagenes, puede evaluarse la seguridad de sistemas que combinan vision y lenguaje, probando ataques visuales.
- Generacion de contenido para pruebas de politicas: util para crear datasets de evaluacion que requieran respuestas sin restricciones, bajo entornos controlados.
- Analisis de vulnerabilidades en agentes: al ser un modelo agéntico, puede usarse para explorar fallos en la ejecucion de herramientas o en el razonamiento multi-paso.
- Estudio de la eficiencia MoE: como variante upcycled, permite comparar el rendimiento y la latencia frente al modelo denso original en tareas de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante MoE. La model card del modelo base abliterado (Muse-Glimmer-30B-Abliterated-BF16) reporta los siguientes resultados en el benchmark R1-HARMFUL-BENCH-450, que mide la tasa de rechazo ante prompts dañinos:

| Dataset | n | Rechazos por subcadena | Tasa | Errores |
|---|---|:---:|:---:|:---:|
| AdvBench | 150 | 0 | 0.0% | 0 |
| StrongREJECT | 150 | 0 | 0.0% | 0 |
| XSTest | 150 | 2* | 1.3% | 0 |
| **Solo dañinos** | **300** | **0** | **0.0%** | **0** |
| **Total** | **450** | **2*** | **0.44%** | **0** |

\* Los dos hits en XSTest son falsos positivos (prompts seguros que contienen frases como "killing time" o "break into the film industry"); la revision completa del texto no los considera rechazos reales. Estos datos corresponden al modelo denso abliterado, no a la variante MoE, por lo que deben tomarse como referencia orientativa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30 mil millones de parametros activos en FP8, se estima un consumo de aproximadamente 30-40 GB de VRAM, incluyendo overhead de activaciones y memoria intermedia.
- GPU recomendadas: una NVIDIA A100 80GB, H100 80GB o 2x RTX 4090 (24GB cada una) con tensor parallelism. No cabe en una GPU de consumo de 24 GB de forma individual.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework compatible con safetensors y FP8.
- Latencia y throughput: no disponibles. La model card del base indica que el laboratorio utilizo 4x RTX PRO 6000 Blackwell (96 GB class) con vLLM y max_model_len 8192, pero no se reportan metricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Multimodal |
|---|---|:---:|---|---|---|
| Muse-Glimmer-30B (denso) | ~29.6B | ~29.6B | 131.072 | Apache 2.0 | Si |
| Muse-MoE-65B-A30B-FP8 (este) | 65.2B | ~30B | 131.072 | Apache 2.0 | Si |
| Mixtral 8x7B (referencia MoE) | 46.7B | 12.9B | 32.768 | Apache 2.0 | No |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, etc.) para esta variante. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente modificado para eliminar los rechazos de contenido dañino. No debe desplegarse en entornos de produccion, servicios publicos o como chatbot de uso general.
- Riesgo elevado de generar contenido inapropiado, ilegal o peligroso si se utiliza sin control de acceso y registro de actividad.
- La cuantizacion FP8 puede introducir una ligera degradacion en la precision numerica, afectando potencialmente a tareas de razonamiento complejo.
- No se ha realizado ningun entrenamiento de seguridad (SFT, DPO, RLHF) sobre esta variante, por lo que no hay garantias de alineacion.
- La informacion sobre la arquitectura MoE (numero de expertos, enrutamiento, etc.) no esta disponible en la model card.
- Los resultados de benchmarks publicados corresponden al modelo base abliterado, no a esta variante MoE, por lo que no se puede asumir el mismo comportamiento.
- La licencia Apache 2.0 permite uso comercial, pero el uso responsable y etico queda bajo la responsabilidad del usuario.

## Enlaces

- [Modelo en Hugging Face: win10/Muse-MoE-65B-A30B-FP8-no-train](https://huggingface.co/win10/Muse-MoE-65B-A30B-FP8-no-train)
- [Modelo base: meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Blog de Meta: Introducing Muse Glimmer](https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model)
