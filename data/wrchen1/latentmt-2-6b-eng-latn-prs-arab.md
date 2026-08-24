# wrchen1/LatentMT-2.6B-eng-latn-prs-arab

## Resumen

LatentMT-2.6B-eng-latn-prs-arab es un adaptador LoRA publicado por wrchen1 que implementa el enfoque de razonamiento latente para traducción automática descrito en el artículo "LatentMT: Machine Translation with Latent Reasoning" (arXiv:2607.18618). El adaptador se monta sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje causal de 2.600 millones de parámetros con capacidad de razonamiento interno. La propuesta consiste en gastar pasos recurrentes adicionales dentro de los estados ocultos del modelo, en lugar de generar tokens de cadena de pensamiento explícitos, lo que permite obtener traducciones de calidad comparable a modelos tres o cinco veces más grandes con un entrenamiento ligero.

Este adaptador concreto cubre el par de idiomas inglés (eng_Latn) a persa/darí (prs_Arab) y está pensado exclusivamente para investigación en traducción automática. El repositorio solo contiene los ficheros del adaptador (adapter_config.json, adapter_model.safetensors o adapter_model.bin y README.md), con un tamaño total de 0,1 GB. La licencia es Apache 2.0, tanto para el adaptador como para el modelo base, lo que facilita su uso en entornos académicos y comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre ByteDance/Ouro-2.6B-Thinking (modelo de lenguaje causal con razonamiento latente recurrente) |
| Parametros totales | 2.600 millones (modelo base) + adaptador LoRA (tamano del repo: 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors o bin, sin cuantizacion declarada) |
| Idiomas soportados | Ingles (eng_Latn) y persa/dari (prs_Arab) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) o bin (adapter_model.bin) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje causal de 2.600 millones de parametros que incorpora un mecanismo de razonamiento latente recurrente (LoopLM). En lugar de generar una cadena de pensamiento explicita en forma de tokens, el modelo realiza pasos recurrentes adicionales dentro de sus estados ocultos antes de producir la traduccion. El adaptador LoRA se entrena para el par eng_Latn-prs_Arab con una profundidad recurrente de 4 pasos, tal y como se indica en la model card.

El entrenamiento se describe como "ligero" en el articulo, y el paper reporta resultados en 32 direcciones de traduccion que abarcan idiomas de alta, media y baja disponibilidad de recursos. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. La unica informacion disponible es que se trata de un adaptador LoRA entrenado sobre el modelo base mencionado, con los requisitos de entorno especificados (torch 2.7.1, transformers 4.56.2, peft >=0.10.0, bitsandbytes >=0.41.0).

## Capacidades

- Traduccion automatica del par ingles a persa/dari (escritura arabe) mediante razonamiento latente, sin generar tokens de cadena de pensamiento visibles.
- Hereda las capacidades generales de generacion de texto del modelo base Ouro-2.6B-Thinking, aunque el uso previsto declarado es exclusivamente la traduccion automatica.
- Soporte de carga mediante la libreria PEFT, lo que permite integrarlo facilmente en pipelines de transformers.
- No se dispone de informacion sobre soporte de tool calling, agentes, capacidades multilingues adicionales ni modos especiales (vision, audio, etc.) en la documentacion proporcionada.

## Casos de uso

- Investigacion en traduccion automatica: el adaptador permite reproducir los experimentos del paper LatentMT y estudiar el impacto del razonamiento latente en la calidad de las traducciones para el par ingles-persa/dari.
- Traduccion de documentos academicos y tecnicos: dado que el modelo base tiene 2.600 millones de parametros, puede procesar textos largos con un consumo de recursos moderado, adecuado para traducir articulos, informes o manuales.
- Localizacion de software y contenido web: la traduccion ingles-persa/dari es relevante para mercados de habla persa (Iran, Afganistan y partes de Asia Central). El adaptador puede integrarse en pipelines de localizacion mediante la API de transformers.
- Evaluacion comparativa de modelos de traduccion: al ser un adaptador ligero sobre un modelo de tamano medio, sirve como punto de referencia para comparar tecnicas de razonamiento latente frente a enfoques de traduccion directa o con cadena de pensamiento explicita.
- Prototipado rapido en entornos con recursos limitados: al tratarse de un adaptador LoRA, el coste de almacenamiento y despliegue es minimo (0,1 GB), lo que permite experimentar sin necesidad de infraestructura de gran escala.
- Traduccion asistida por ordenador (TAO): puede utilizarse como motor de sugerencias en herramientas de traduccion humana, ofreciendo propuestas preliminares que el traductor puede revisar y corregir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este adaptador en la informacion disponible. El articulo LatentMT menciona que el modelo alcanza un rendimiento comparable a modelos de 3 a 5 veces mas grandes en 32 direcciones de traduccion, pero no se proporcionan cifras concretas (p. ej., BLEU, COMET) para el par eng_Latn-prs_Arab. Por tanto, no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero el modelo base Ouro-2.6B-Thinking requiere aproximadamente 5,2 GB en FP16 (2.600 millones de parametros x 2 bytes). Con cuantizacion de 8 bits o 4 bits, el consumo de VRAM puede reducirse a unos 2,6 GB o 1,3 GB respectivamente, aunque no se ha confirmado la compatibilidad con estas cuantizaciones.
- Para una inferencia comoda en FP16 se recomienda una GPU con al menos 8 GB de VRAM, como una RTX 3070/3080, RTX 4060 Ti o superior. Con cuantizacion de 4 bits, podria ejecutarse en GPUs de 4 GB, aunque no esta verificado.
- El despliegue puede realizarse mediante la libreria transformers con PEFT, o a traves de frameworks compatibles como vLLM o llama.cpp, siempre que soporten la carga de adaptadores LoRA y el modelo base con configuracion de pasos recurrentes (total_ut_steps).
- No se dispone de datos de latencia o throughput especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El articulo menciona que LatentMT supera a modelos de mayor tamano en varias direcciones de traduccion, pero no se citan nombres concretos ni metricas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para el par ingles-persa/dari; su uso en otros pares de idiomas no esta soportado y probablemente producira resultados incorrectos.
- Al ser un adaptador LoRA, la calidad de la traduccion depende en gran medida del modelo base Ouro-2.6B-Thinking. Cualquier sesgo o limitacion del modelo base se trasladara al adaptador.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante entradas adversarias. Se recomienda validar las traducciones en entornos de produccion.
- La profundidad recurrente de 4 pasos es un hiperparametro fijo; modificarlo puede degradar el rendimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y el adaptador son de caracter investigador y no se garantiza su idoneidad para aplicaciones criticas.
- No se proporcionan datos sobre el dataset de entrenamiento, por lo que se desconoce si existen sesgos de dominio o de registro linguistico.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-prs-arab
- Articulo en arXiv (PDF): https://arxiv.org/pdf/2607.18618
- Articulo en arXiv (HTML): https://arxiv.org/html/2607.18618v1
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
