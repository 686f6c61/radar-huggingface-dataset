# SOTAagi2030/kestrel-intent-lite

## Resumen

Kestrel Intent-Lite es un modelo de clasificación de intenciones disenado para ejecutarse en dispositivos (on-device) en las terminales de voz Kestrel. Lo desarrolla el usuario SOTAagi2030 y se publica en Hugging Face bajo el identificador SOTAagi2030/kestrel-intent-lite. Su funcion principal es mapear una frase de entrada a una intencion predefinida del sistema de voz, cubriendo seis idiomas: ingles, aleman, frances, japones, portugues y arabe.

El modelo parte del backbone xlm-roberta-base, un transformer encoder multilingue, y se distribuye cuantizado a int8 mediante la tecnica Wanda (weight pruning/quantization), con un tamano de artefacto de 268,4 MB. Segun la model card, la ejecucion seleccionada (q8-wanda-2026-10) alcanza un F1 compuesto de intencion de 0,8934 y una latencia p95 de 61,2 ms, lo que lo hace apto para inferencia en terminales con recursos limitados.

Es relevante porque ejemplifica el patron de modelos pequenos, cuantizados y multilingues orientados a tareas cerradas de clasificacion en el borde (edge), donde la latencia y el tamano del artefacto importan mas que la generacion abierta. La informacion publica es escasa: el repositorio aparece con 0 GB de tamano, sin pipeline declarado ni metadatos de licencia o idiomas en la ficha de Hugging Face, aunque la model card indica licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone xlm-roberta-base) |
| Parametros totales | no disponible (backbone xlm-roberta-base, ~278M en precision completa; tamano de artefacto int8: 268,4 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (metodo Wanda) |
| Idiomas soportados | en, de, fr, ja, pt, ar |
| Licencia | apache-2.0 (segun model card; no declarada en metadatos de HF) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre xlm-roberta-base, un transformer encoder multilingue basado en RoBERTa con tokenizador SentencePiece. Sobre este backbone se anade presumiblemente una cabeza de clasificacion de intenciones, aunque la model card no detalla la composicion exacta de la cabeza ni el numero de clases. La unica innovacion tecnica documentada es la cuantizacion a int8 mediante Wanda, que reduce el artefacto a 268,4 MB y permite inferencia en dispositivo con latencia p95 de 61,2 ms.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (poco probable en una tarea de clasificacion) ni el proceso de ajuste. La model card menciona una "release audit" con un `release_manifest.json` que contiene el registro de cribado de cada ejecucion candidata, pero no se incluyen esos datos en la informacion proporcionada.

## Capacidades

- Clasificacion de intenciones (intent classification) para comandos de voz en terminales Kestrel.
- Cobertura multilingue en seis idiomas: ingles, aleman, frances, japones, portugues y arabe.
- Inferencia on-device con cuantizacion int8 y latencia p95 de 61,2 ms.
- Modelo encoder de tarea cerrada: no genera texto libre, no razona de forma multi-paso y no soporta tool calling.
- No se documentan capacidades de vision, audio, agentes ni thinking mode.

## Casos de uso

- Enrutamiento de comandos de voz en terminales Kestrel: el modelo clasifica la frase del usuario en una intencion del sistema (por ejemplo, control de dispositivo o consulta) con latencia p95 de 61,2 ms, adecuada para interaccion conversacional en tiempo real.
- Asistentes de voz embebidos sin conexion: al ser un artefacto int8 de 268,4 MB, puede desplegarse en el propio terminal sin depender de la nube, reduciendo coste y preservando privacidad.
- Clasificacion multilingue en mercados europeos y de Oriente Medio: cubre en, de, fr, pt, ja y ar con F1 por locale entre 0,8631 (ar) y 0,9184 (en), lo que permite un unico modelo para varias regiones.
- Preprocesado de pipelines de NLU: la salida de intencion puede alimentar un modulo posterior de extraccion de entidades o de dialogo, actuando como primera etapa de bajo coste.
- Filtrado y triaje de peticiones en centros de atencion: clasificar la intencion de una consulta entrante para dirigirla al flujo o agente adecuado.
- Prototipado rapido de interfaces de voz: al estar basado en xlm-roberta-base y publicarse en safetensors, es facil de integrar con librerias de transformers para experimentar con nuevas intenciones.

## Benchmarks y rendimiento

Los unicos datos publicados son el F1 de intencion compuesto y el desglose por locale, junto con la latencia p95.

| Metrica | Valor |
|---|---|
| Composite intent F1 | 0,8934 |
| Intent F1 (en) | 0,9184 |
| Intent F1 (de) | 0,9027 |
| Intent F1 (fr) | 0,8963 |
| Intent F1 (ja) | 0,8711 |
| Intent F1 (pt) | 0,9088 |
| Intent F1 (ar) | 0,8631 |
| p95 latency (ms) | 61,2 |
| Artifact size (MB) | 268,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8 (artefacto de 268,4 MB mas overhead de runtime).
- GPU recomendadas: no disponible; el modelo esta pensado para CPU/NPU de terminal, no para GPU de datacenter.
- Cabe en GPU consumer y en hardware de borde (CPU, NPU) dada su cuantizacion int8 y tamano reducido.
- Opciones de despliegue: librerias compatibles con safetensors y transformers (PyTorch), ademas de runtimes de cuantizacion int8; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: p95 de 61,2 ms segun la model card; throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, el backbone xlm-roberta-base es un encoder multilingue de ~278M parametros, pero no se han publicado comparaciones directas con otros clasificadores de intenciones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kestrel Intent-Lite | no disponible (artefacto int8 268,4 MB) | no disponible | apache-2.0 (segun model card) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de tarea cerrada: solo clasifica intenciones; no genera texto ni razona de forma abierta.
- Cobertura limitada a seis idiomas (en, de, fr, ja, pt, ar); otros idiomas no estan soportados.
- El F1 mas bajo se da en arabe (0,8631) y japones (0,8711), por lo que el rendimiento es desigual entre locales.
- No se documentan sesgos conocidos, pero al ser un clasificador entrenado sobre datos no publicados, pueden existir sesgos no auditados.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea en entradas fuera de distribucion.
- La licencia apache-2.0 figura en la model card, pero no esta declarada en los metadatos de Hugging Face; conviene verificarla antes de uso comercial.
- El repositorio aparece con 0 GB de tamano y 0 descargas, lo que sugiere que los pesos pueden no estar efectivamente publicados o que el repositorio es un esqueleto.
- La fecha de creacion (2026-11-21) es futura respecto a la informacion disponible, lo que anade incertidumbre sobre la validez del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/SOTAagi2030/kestrel-intent-lite
- Model card: incluida en el repositorio de Hugging Face (README)
- Manifest de release: `release_manifest.json` (referenciado en la model card, no accesible en la informacion proporcionada)
- Paper, blog, repositorio o demo: no disponible
