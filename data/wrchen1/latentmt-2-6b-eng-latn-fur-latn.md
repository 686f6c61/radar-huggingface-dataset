# wrchen1/LatentMT-2.6B-eng-latn-fur-latn

## Resumen

LatentMT-2.6B-eng-latn-fur-latn es un adaptador LoRA publicado por wrchen1 (y también disponible bajo la organización LatentMT) para el modelo base ByteDance/Ouro-2.6B-Thinking. Forma parte del trabajo de investigación "LatentMT: Machine Translation with Latent Reasoning" (arXiv:2607.18618), que introduce un enfoque de razonamiento latente para traducción automática: en lugar de generar una cadena de pensamiento explícita en forma de tokens, el modelo realiza pasos recurrentes adicionales dentro de los estados ocultos. Este adaptador concreto está entrenado para el par de idiomas inglés (eng_Latn) a furlano (fur_Latn), una lengua romance minoritaria del noreste de Italia.

El modelo base Ouro-2.6B-Thinking es un "looped language model" de 2.6 mil millones de parámetros desarrollado por ByteDance, que permite profundidad recurrente configurable. El adaptador LoRA añade una profundidad recurrente de 4, lo que permite al modelo refinar sus representaciones internas antes de producir la traducción. La relevancia de este trabajo radica en que logra un rendimiento comparable a modelos tres o cinco veces más grandes en 32 direcciones de traducción, con un coste de entrenamiento ligero y una inferencia eficiente al no generar tokens de razonamiento visibles.

El repositorio contiene únicamente los archivos del adaptador (adapter_config.json, adapter_model.safetensors o adapter_model.bin) y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base Ouro-2.6B-Thinking (looped language model) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 2.6B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No especificados; compatible con cuantizacion del modelo base (p. ej. bitsandbytes) |
| Idiomas soportados | Ingles (eng_Latn) a furlano (fur_Latn) para este adaptador |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y binario (adapter_model.bin) |

## Arquitectura y entrenamiento

El adaptador se basa en Ouro-2.6B-Thinking, un modelo de lenguaje recurrente (looped) que permite ejecutar múltiples pasos sobre los mismos parámetros. En lugar de generar tokens de razonamiento explícitos, LatentMT configura el modelo para que realice pasos recurrentes adicionales en el espacio latente (estados ocultos). El adaptador LoRA se entrena sobre este modelo base con una profundidad recurrente de 4, lo que significa que cada token de entrada se procesa cuatro veces a través de la misma capa antes de producir la siguiente salida. Este enfoque reduce el coste de inferencia en comparación con cadenas de pensamiento explícitas, manteniendo la calidad de traducción.

El entrenamiento se describe como "ligero" en el paper, pero no se proporcionan detalles específicos sobre el volumen de datos, la composición del dataset o el uso de técnicas como RLHF o DPO en la información disponible. El paper menciona que el método se evalúa en 32 direcciones de traducción que cubren idiomas de alto, medio y bajo recursos, logrando resultados comparables a modelos de 7-13B parámetros.

## Capacidades

- Traduccion automatica del ingles al furlano con razonamiento latente (sin generar tokens de razonamiento visibles).
- Inferencia eficiente gracias a la profundidad recurrente configurable (4 en este adaptador).
- Compatible con el ecosistema Hugging Face Transformers y PEFT, lo que permite integracion sencilla en pipelines existentes.
- Al estar basado en Ouro-2.6B-Thinking, hereda las capacidades generales de generacion de texto del modelo base, aunque el adaptador esta especializado en el par de traduccion indicado.
- No se documentan capacidades de tool calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Localizacion de software y sitios web: el adaptador puede traducir cadenas de interfaz de usuario del ingles al furlano, un idioma con pocos recursos digitales, permitiendo a empresas y organizaciones locales ofrecer sus productos en esta lengua.
- Traduccion de documentos legales o administrativos: la capacidad de razonamiento latente ayuda a mantener coherencia en textos largos, aunque la longitud de contexto no esta especificada.
- Atencion al cliente en furlano: integrado en un chatbot o sistema de tickets, el modelo puede traducir consultas de clientes que escriben en ingles a furlano para agentes locales, o viceversa.
- Subtitulado y transcripcion: traduccion de guiones o subtitulos del ingles al furlano para contenido audiovisual, aprovechando la generacion de texto fluida del modelo base.
- Investigacion en traduccion automatica de lenguas minoritarias: sirve como punto de partida para experimentos con razonamiento latente en pares de idiomas de bajos recursos, dado su diseno eficiente y su licencia abierta.
- Generacion de contenido bilingue: redaccion de articulos, publicaciones o materiales educativos que requieran versiones en ingles y furlano, con un unico modelo que puede alternar entre ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper menciona que LatentMT alcanza un rendimiento comparable a modelos de 7-13B parametros en 32 direcciones de traduccion, pero no se incluyen cifras concretas (MMLU, BLEU, etc.) en la documentacion del adaptador ni en los resultados de busqueda proporcionados.

## Requisitos de hardware

- El adaptador LoRA es muy pequeno (0.1 GB), por lo que el requisito principal es el modelo base Ouro-2.6B-Thinking.
- Para inferencia en FP16, el modelo base de 2.6B requiere aproximadamente 5.2 GB de VRAM, mas overhead de activaciones y cache. Con cuantizacion de 4 bits (bitsandbytes), puede caber en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) son suficientes para inferencia local. Para despliegue en produccion, una A10G o A100 seria adecuada.
- Opciones de despliegue: el adaptador se carga con PEFT sobre el modelo base, por lo que es compatible con Transformers, vLLM (si soporta el modelo base), llama.cpp (si se convierte a GGUF) y Ollama (mediante integracion personalizada).
- La latencia dependera de la profundidad recurrente (4 pasos) y del hardware; no se proporcionan cifras de throughput en la informacion disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros adaptadores o modelos comparables especificamente para el par ingles-furlano con razonamiento latente. Modelos genericos de traduccion como NLLB-200 o M2M-100 podrian ser alternativas, pero no se dispone de datos de rendimiento para esta comparativa.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para el par ingles-furlano; no es util para otros idiomas sin reentrenamiento.
- Al ser un adaptador LoRA, depende del modelo base Ouro-2.6B-Thinking, que debe descargarse por separado y puede tener sus propias limitaciones (sesgos, alucinaciones) no documentadas en este repositorio.
- No se especifica la longitud de contexto del modelo base, por lo que textos muy largos podrian superar el limite y degradar la calidad de traduccion.
- La profundidad recurrente de 4 aumenta el coste computacional por token en comparacion con un modelo estandar, aunque es menor que generar cadenas de pensamiento explicitas.
- No se han publicado evaluaciones de sesgo o robustez para este adaptador concreto; se recomienda validar en el dominio de uso antes de desplegar en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Ouro-2.6B-Thinking tambien esta bajo Apache 2.0, lo que facilita la redistribucion, aunque se debe verificar el cumplimiento de las atribuciones requeridas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-fur-latn
- Repositorio alternativo (organizacion LatentMT): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-fur-latn
- Paper en arXiv: https://arxiv.org/abs/2607.18618 (PDF: https://arxiv.org/pdf/2607.18618v1)
- Modelo base Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Sitio del proyecto Ouro: https://ouro-llm.github.io/
