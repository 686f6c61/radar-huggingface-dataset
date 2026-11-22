# Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages

## Resumen

Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages es un modelo de lenguaje derivado de LiquidAI/LFM3-1.7B mediante un proceso de preentrenamiento continuado (continued pretraining, CPT) sobre un corpus multilingue extraido de Wikipedia. Lo desarrolla el usuario independiente Soundsus y se distribuye bajo licencia Apache 2.0. El objetivo declarado es experimental: ampliar el conocimiento linguistico y la capacidad de traduccion del modelo base hacia 60 idiomas que originalmente no estaban cubiertos, usando un subconjunto reducido del corpus original.

El modelo conserva la arquitectura y el tamano del LFM3-1.7B original, con 1.728.801.536 parametros totales (aproximadamente 1,7 mil millones) almacenados en safetensors de 16 bits, lo que da un repositorio de unos 3,5 GB. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, y el autor indica que no ha realizado evaluaciones ni benchmarks, por lo que la calidad real del ajuste es desconocida.

Su relevancia es limitada pero ilustrativa: sirve como ejemplo de flujo de trabajo de CPT multilingue de bajo coste sobre un modelo compacto, y como punto de partida para posteriores ajustes LoRA. No debe considerarse un modelo listo para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de LiquidAI; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en FP16 (safetensors); no se documentan otras variantes |
| Idiomas soportados | en (etiqueta declarada); el entrenamiento CPT cubre 60 idiomas adicionales segun el autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16), compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de aproximadamente 1,7 mil millones de parametros. La informacion disponible no detalla la arquitectura interna del modelo base (tipo de atencion, capas, uso de componentes hibridos, etc.), por lo que esos datos deben consultarse en la model card de LiquidAI.

El ajuste consiste en un preentrenamiento continuado sobre el dataset Soundsus/Wikipedia-60-languages-truncated, construido a partir de textos de Wikimedia/Wikipedia en 60 idiomas. El autor indica que el corpus original rondaba los 3,7 GB, se trunco a menos de 1 GB y finalmente a unos 7 MB, con aproximadamente 100.000 tokens por idioma, para reducir el tiempo de entrenamiento. El entrenamiento se ejecuto con Unsloth y TRL, con una velocidad declarada de 2x respecto a un flujo estandar. No se documentan fases de RLHF, DPO ni datos de preferencias, ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base LFM3-1.7B.
- Conocimiento linguistico y traduccion potencial hacia 60 idiomas adicionales, segun el objetivo declarado del CPT (sin evaluacion publicada).
- Compatibilidad con el pipeline text-generation de transformers y con text-generation-inference.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no documentadas.
- Modo thinking explicito: no documentado.

## Casos de uso

- Experimentacion academica con preentrenamiento continuado: el modelo sirve como referencia de como un CPT de bajo coste (7 MB de datos) afecta a un modelo compacto, util para estudiar olvido catastrofico y transferencia linguistica.
- Base para ajuste LoRA multilingue: el autor ya lo esta usando como punto de partida para un LoRA sobre otro dataset, de modo que es adecuado como inicializacion en proyectos de adaptacion a dominios o idiomas concretos.
- Prototipado de traduccion en entornos de investigacion: con 1,7 mil millones de parametros cabe en GPUs de consumo y permite iterar rapidamente sobre hipotesis de traduccion, siempre con validacion manual.
- Generacion de texto en ingles en prototipos: al conservar el modelo base, puede usarse para tareas de generacion conversacional en ingles en fases tempranas de desarrollo.
- Evaluacion comparativa de tecnicas de CPT: util como caso control frente a otros modelos ajustados con corpus mayores, para medir el impacto del volumen de datos.
- Despliegue ligero en entornos con recursos limitados: su tamano permite servir el modelo con llama.cpp u Ollama en cuantizaciones de 4-8 bits para pruebas internas, no para produccion critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no ha probado ni evaluado el modelo y desconoce su calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 5-6 GB en total para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070); A100 o H100 no son necesarias por tamano, aunque pueden usarse para mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas en FP16, y en GPUs con 4-6 GB usando cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (el modelo declara compatibilidad con endpoints), y previsiblemente llama.cpp u Ollama tras conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages | 1,73 B | no disponible | Apache 2.0 | CPT experimental sobre 60 idiomas, sin benchmarks |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | Apache 2.0 | Modelo original de LiquidAI, con documentacion y evaluaciones propias |
| Qwen2.5-1.5B | 1,5 B | no disponible en esta ficha | Apache 2.0 | Alternativa compacta multilingue ampliamente evaluada |
| Llama 3.2 1B | 1,2 B | no disponible en esta ficha | Licencia Llama | Alternativa compacta con ecosistema amplio |

La comparacion cuantitativa de rendimiento no es posible porque el modelo analizado carece de benchmarks publicados.

## Limitaciones y advertencias

- Calidad desconocida: el autor no ha evaluado ni benchmarkeado el modelo, por lo que no hay garantia de que el CPT haya mejorado el conocimiento multilingue ni de que no haya degradado capacidades previas.
- Riesgo de olvido catastrofico: el corpus de entrenamiento es muy reducido (unos 7 MB, 100.000 tokens por idioma), lo que puede afectar negativamente al rendimiento en ingles y en tareas generales.
- Sesgos: al entrenarse sobre Wikipedia, hereda los sesgos de cobertura y sesgos editoriales de esa fuente, ademas de los del modelo base.
- Riesgo de alucinacion: no evaluado; en modelos de este tamano es habitual en tareas de conocimiento factual y traduccion.
- Idiomas: la etiqueta oficial solo declara ingles, aunque el entrenamiento cubre 60 idiomas sin verificacion publica de calidad.
- Contexto: no se documenta la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la ausencia de evaluaciones hace desaconsejable su uso en produccion sin validacion propia.
- Procedencia: es un modelo de un autor independiente, sin proceso de revision ni soporte; conviene tratarlo como artefacto experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/Soundsus/Wikipedia-60-languages-truncated
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
