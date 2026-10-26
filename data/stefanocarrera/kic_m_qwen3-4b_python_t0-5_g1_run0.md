# stefanocarrera/kic_M_Qwen3-4B_python_t0.5_g1_run0

## Resumen

`stefanocarrera/kic_M_Qwen3-4B_python_t0.5_g1_run0` es un ajuste fino de tipo comunitario sobre `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit`, es decir, sobre el modelo base de 4.000 millones de parámetros de la familia Qwen3 en su variante preentrenada (no alineada para instrucciones) y cuantizada en 4 bits con bitsandbytes. Lo publica el usuario stefanocarrera bajo licencia Apache 2.0, con la librería `transformers`, pesos en `safetensors` y etiqueta de idioma `en` en la model card. El entrenamiento se realizó con Unsloth, según declara el autor, que menciona una velocidad "2x" frente al entrenamiento convencional.

El nombre del repositorio (`kic_M_Qwen3-4B_python_t0.5_g1_run0`) y la existencia de un checkpoint hermano para Java (`kic_M_Qwen3-4B_java_t0.5_g1_run0`) sugieren un barrido sistemático de experimentos sobre lenguajes de programación, con parámetros de decodificación y repeticiones codificados en el nombre (`t0.5`, `g1`, `run0`). Es, por tanto, un artefacto de investigación más que un modelo de producción: no incluye model card descriptiva, no publica métricas de evaluación y el tamaño del repositorio (0,1 GB) es muy inferior a los ~8 GB que ocuparían los pesos completos de un modelo de 4B en `bfloat16`, lo que apunta a que contiene únicamente adaptadores o una versión parcial de los pesos.

Su relevancia es acotada: sirve como referencia para quien investigue recetas de ajuste fino ligero con Unsloth sobre Qwen3, como punto de partida para especializaciones en generación de código Python o como caso de estudio de checkpoints derivados de barridos de hiperparámetros. No debe confundirse con `Qwen3-4B` oficial ni con las variantes alineadas (Instruct/Thinking) del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); detalles no confirmados en el repositorio |
| Parametros totales | 4B (heredados de `Qwen3-4B-Base`) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en el repositorio; la familia Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible; el modelo base se distribuye en `bnb-4bit`. Los pesos de este repositorio no declaran esquema de cuantización |
| Idiomas soportados | `en` (ingles), segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (libreria `transformers`) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit` |
| Pipeline declarado | No disponible |
| Etiquetas | `text-generation-inference`, `unsloth`, `qwen3`, `trl`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Base: un transformer decoder-only denso con atención por grupos (GQA) y embeddings ligados, preentrenado por Alibaba. Al tratarse de la variante *Base*, no ha pasado por fases de alineación tipo RLHF o DPO, de modo que su comportamiento natural es la continuación de texto, no el seguimiento de instrucciones. El autor parte de la versión publicada por Unsloth ya cuantizada en 4 bits con bitsandbytes, lo que implica una receta de ajuste eficiente en memoria (del estilo QLoRA) en la que los pesos base permanecen congelados y se entrenan adaptadores o un subconjunto reducido de parámetros.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, la mezcla de datos de código frente a lenguaje natural ni la configuración exacta de LoRA (rango, alpha, target modules). La etiqueta `python` del nombre y la existencia de un experimento paralelo en Java apuntan a un corpus centrado en código, pero no se documenta. Tampoco se especifica si se aplicó alguna fase de preferencias. La única innovación técnica declarada es el uso del stack de Unsloth para acelerar el entrenamiento, sin detalles adicionales.

## Capacidades

- Generación de texto por continuación: al derivar de un modelo *Base*, completa secuencias y responde mejor a formato de *few-shot* o *completion* que a instrucciones directas.
- Generación y continuación de código, presumiblemente con sesgo hacia Python por el nombre del checkpoint; sin evaluación publicada que lo confirme.
- Capacidad multilingüe limitada: la model card solo declara inglés, aunque el modelo base Qwen3 tiene cobertura multilingüe amplia que este ajuste podría haber degradado o conservado sin documentar.
- No hay soporte documentado de *tool calling* ni de *function calling*; un modelo base sin alineación no produce de forma fiable las estructuras requeridas.
- No hay soporte documentado de agentes, razonamiento multi-paso, modo *thinking*, visión ni audio.
- Compatible con el ecosistema `transformers` y potencialmente con los endpoints de Hugging Face por la etiqueta `endpoints_compatible`.

## Casos de uso

- Investigación de recetas de ajuste fino: usar el checkpoint como referencia reproducible de un entrenamiento QLoRA con Unsloth sobre Qwen3-4B-Base, comparando hiperparámetros frente al experimento hermano en Java.
- Punto de partida para especialización en código: continuar el ajuste con un corpus propio de Python (estilo, librerías internas, convenciones de un equipo) aprovechando que ya parte de un sesgo hacia ese lenguaje.
- Autocompletado en editor para dominios acotados: integrado como modelo de *completion* en un servidor local, con prompts que fijen el contexto en lugar de instrucciones conversacionales.
- Evaluación comparativa de checkpoints: servir como línea base "sin alinear" frente a Qwen3-4B-Instruct en pruebas internas de calidad de código, para medir cuánto aporta la alineación en una tarea concreta.
- Estudio de degradación por cuantización: al provenir de un base en `bnb-4bit`, permite analizar la pérdida de calidad en generación de código respecto a los pesos completos en `bfloat16`.
- Generación de datos sintéticos para código: producir borradores de funciones o docstrings que luego se filtran y se usan para entrenar modelos menores, siempre con revisión humana.
- Reproducción de experimentos académicos: al ser un artefacto pequeño y con licencia permisiva, encaja en cuadernos docentes sobre ajuste eficiente de modelos de 4B en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de Python o Java, ni comparaciones con el modelo base o con otras variantes.

## Requisitos de hardware

- Los pesos del repositorio ocupan 0,1 GB, insuficientes para un modelo de 4B completo. Es necesario descargar el modelo base `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit` (o los pesos originales de Qwen3-4B) y cargar los adaptadores, si es que el repositorio los contiene.
- Estimaciones de VRAM para los pesos de un modelo denso de 4B, sin contar caché KV:

| Precisión | Peso aproximado | VRAM recomendada con contexto moderado |
|---|---|---|
| `bfloat16` / `float16` | ~8 GB | 12-16 GB |
| 8 bits | ~4,5 GB | 8-10 GB |
| 4 bits (GGUF Q4_K_M) | ~2,5 GB | 5-6 GB |

- La caché KV crece de forma apreciable con el contexto: con la configuración GQA típica de Qwen3-4B, 32.768 tokens pueden añadir varios GB adicionales en `float16`, por lo que contextos largos exigen GPU de 24 GB o cuantización de la caché.
- GPU de consumo viables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090 (24 GB) para `bfloat16` sin cuantizar. En 4 bits cabe en GPU de 6-8 GB como RTX 3060 Ti o RTX 4060.
- Despliegue: `transformers` para prototipado, `vLLM` o `TGI` para servir con concurrencia (la etiqueta `text-generation-inference` sugiere compatibilidad), `llama.cpp` y `Ollama` previa conversión a GGUF, y `PEFT` para cargar los adaptadores junto al base.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kic_M_Qwen3-4B_python_t0.5_g1_run0` | 4B | No disponible (heredado de Qwen3-4B: 32.768 nativo) | Base ajustado, sin alinear | Apache 2.0 | Hugging Face, sin métricas |
| Qwen3-4B-Base (original) | 4B | 32.768 nativo, 131.072 con YaRN | Transformer denso preentrenado | Apache 2.0 | Hugging Face y Ollama |
| Qwen3-4B-Instruct | 4B | 32.768 nativo, 131.072 con YaRN | Alineado para instrucciones | Apache 2.0 | Hugging Face y Ollama |
| Qwen2.5-Coder-3B | 3B | 32.768 | Especializado en código | Apache 2.0 | Hugging Face |
| Llama 3.2 3B | 3B | 131.072 | Base e Instruct | Licencia comunitaria Llama 3.2 | Hugging Face |

Las cifras de contexto y licencia de los modelos comparados provienen de su documentación pública y no de este repositorio. Frente a ellos, este checkpoint no aporta métricas que permitan justificar su elección sobre el base original o sobre una variante Instruct, salvo en contextos de experimentación.

## Limitaciones y advertencias

- Modelo *Base* sin alineación: no sigue instrucciones de forma fiable, no respeta formatos de chat y puede producir texto irrelevante si se le presenta un prompt conversacional.
- Ausencia total de evaluación publicada: no hay evidencia de que el ajuste fino mejore ninguna capacidad respecto al base, ni de que no la degrade.
- Riesgo elevado de alucinación en código: puede generar APIs, firmas de funciones o dependencias inexistentes; requiere verificación y ejecución de tests antes de usar el resultado.
- Repositorio de 0,1 GB: si solo contiene adaptadores, es imprescindible el base en 4 bits y la configuración exacta de carga no está documentada; sin ella, la reproducibilidad es dudosa.
- Sesgos: no documentados. El corpus de ajuste se desconoce, por lo que no puede descartarse un sesgo hacia estilos de código o dominios concretos.
- Cobertura de idioma declarada únicamente en inglés; el comportamiento en castellano no está evaluado y podría ser deficiente.
- Licencia Apache 2.0 permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base y de los pesos derivados de bitsandbytes antes de redistribuir.
- Checkpoint de un solo *run*: la nomenclatura `run0` indica una única ejecución, sin garantía de estabilidad entre semillas ni de que no exista sobreajuste.
- No apto como componente crítico en producción sin una fase previa de evaluación, alineación y control de calidad propia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/stefanocarrera/kic_M_Qwen3-4B_python_t0.5_g1_run0)
- [Checkpoint hermano para Java](https://huggingface.co/stefanocarrera/kic_M_Qwen3-4B_java_t0.5_g1_run0)
- [Modelo base en Hugging Face (unsloth/Qwen3-4B-Base-unsloth-bnb-4bit)](https://huggingface.co/unsloth/Qwen3-4B-Base-unsloth-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Tutorial de ejecución local de Qwen3-4B-Base](https://aiindigo.com/tutorials/getting-started-with-qwen3-4b-base-efficient-local-inference-setup)
- [Guía de despliegue de Qwen3 4B en local](https://aiindigo.com/tutorials/getting-started-with-qwen3-4b-deploy-on-device-ai-with-low-latency)
