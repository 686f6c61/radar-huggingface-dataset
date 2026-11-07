# zen-E/PLatour-TR-LoRA-Qwen3.5-4B-DAPO

## Resumen

PLatour-TR-LoRA-Qwen3.5-4B-DAPO es un adaptador LoRA publicado por el usuario zen-E en Hugging Face, construido sobre el backbone Qwen/Qwen3.5-4B. No se trata de un modelo completo, sino de un artefacto PEFT que modifica exclusivamente el decodificador de texto del backbone oficial; el codificador de vision de Qwen3.5-4B no se adapta. El repositorio ocupa 1,0 GB y contiene unicamente pesos del adaptador en formato safetensors.

El adaptador se enmarca en el proyecto PLatour, asociado al paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976), que explora PACT (Prefill-to-Autoregressive Cross-model Transfer): un modelo emisor de mayor tamano codifica el prompt y entrega representaciones ocultas, mientras un receptor mas pequeno genera la respuesta de forma independiente. El metodo entrena puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero y dando soporte a modelos con atencion hibrida. El paper introduce ademas PACT-Check, con controles de Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver, para verificar si las mejoras provienen de informacion util del emisor o de la simple adaptacion del receptor.

El modelo tiene un interes principalmente de investigacion: el propio autor advierte que son artefactos de inferencia historicos sin puntuaciones de benchmark, y que el empaquetado no establece un protocolo de seleccion de checkpoint ni una evaluacion imparcial. No hay descargas ni interacciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3.5-4B con codificador de vision; atencion hibrida en el backbone segun el paper |
| Parametros totales | No disponible para el adaptador; el backbone Qwen3.5-4B tiene 4B parametros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del backbone Qwen3.5-4B, sin dato confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se preservan en FP32 original) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica mediante PEFT sobre el decodificador de texto de Qwen3.5-4B, un transformer denso de 4B parametros con tokenizacion multilingue extensa y un corpus de preentrenamiento amplio. Los modulos objetivo estan restringidos mediante rutas completas al decodificador de texto, de modo que el codificador de vision queda intacto. Los modulos QKV fusionados permanecen fusionados en Transformers/PEFT, lo que difiere de la conversion al runtime vLLM del proyecto. Todos los valores originales del adaptador se conservan en FP32.

El entrenamiento sigue el marco PACT descrito en el paper: puentes lineales entre backbones congelados, inicializados a cero, optimizados con recompensas de tarea. El dataset asociado es zen-E/PLatour-DAPO-Data. El autor no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO mas alla de la referencia DAPO en el nombre del artefacto. No se especifica tampoco el protocolo de seleccion de checkpoint. La revision del backbone usada para la exportacion esta fijada en 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a, pero el autor aclara que esto fija la dependencia de exportacion actual y no afirma que el entrenamiento historico usara esa revision.

## Capacidades

- Generacion de texto y razonamiento paso a paso, heredados del backbone Qwen3.5-4B y modulados por el adaptador.
- Procesamiento de entradas imagen-texto a traves del codificador de vision del backbone (no adaptado por el LoRA).
- Soporte multilingue derivado de la tokenizacion del backbone; el conjunto exacto de idiomas no esta documentado.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.
- Transferencia cross-modelo emisor-receptor mediante puentes lineales, como capacidad de investigacion del marco PACT.

## Casos de uso

- Investigacion sobre PACT: usar el adaptador como receptor entrenado en experimentos de transferencia prefill-a-autoregresivo, comparandolo con los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para aislar si la mejora proviene de la informacion del emisor o de la adaptacion del receptor.
- Reproduccion de artefactos historicos: cargar el adaptador con la revision fijada del backbone (Torch 2.15.0, Transformers 5.22.1, PEFT 0.21.2) para verificar la carga y ejecutar comprobaciones con prompts sinteticos.
- Estudio de adaptadores restringidos al decodificador: analizar como un LoRA con rutas de modulos objetivo completas afecta solo al texto sin tocar el codificador de vision, en escenarios de ablacion.
- Experimentos con atencion hibrida: evaluar el comportamiento del adaptador sobre un backbone con modulos QKV fusionados, comparando el camino Transformers/PEFT con la conversion al runtime vLLM del proyecto.
- Docencia y divulgacion sobre PEFT: servir como ejemplo practico de como se empaqueta y carga un adaptador LoRA sobre un modelo multimodal con backbone fijado por revision.
- Base para evaluacion independiente: punto de partida para que terceros realizen evaluaciones imparciales y reporten procedencia antes de emitir afirmaciones comparativas, tal como solicita el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que estos son artefactos de inferencia historicos sin puntuaciones de benchmark, y que las comprobaciones de carga y prompts sinteticos no reproducen la precision de benchmark ni una trayectoria de entrenamiento historica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el backbone Qwen3.5-4B en FP16 requiere aproximadamente 8 GB solo para pesos, mas memoria para el codificador de vision, cache KV y overhead de runtime.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del backbone, GPUs con al menos 16-24 GB de VRAM son el punto de partida razonable, pero no hay dato confirmado.
- Compatibilidad con GPU de consumo: no confirmada; el backbone de 4B podria caber en GPUs consumer con cuantizacion, pero no se documenta soporte de cuantizacion para este adaptador.
- Opciones de despliegue: Transformers con PEFT (metodo documentado en la model card); el proyecto menciona una conversion al runtime vLLM, pero no se detalla el procedimiento. vLLM, llama.cpp, Ollama y TGI no estan confirmados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-TR-LoRA-Qwen3.5-4B-DAPO | Adaptador LoRA sobre backbone de 4B | No disponible | Sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-4B (backbone) | 4B densos | No disponible en la informacion proporcionada | No disponible | Segun terminos upstream | Hugging Face |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de modelos comparables evaluados en la misma tarea dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El adaptador no contiene los pesos del backbone: requiere descargar Qwen/Qwen3.5-4B y aplicar el LoRA con PEFT; no es un modelo autónomo.
- Sin puntuaciones de benchmark ni protocolo de seleccion de checkpoint documentado; no se debe usar como evidencia de rendimiento comparativo.
- El empaquetado no garantiza una evaluacion imparcial; el autor exige evaluacion independiente y reporte preciso de procedencia antes de nuevas afirmaciones de investigacion comparativa.
- La revision del backbone fijada corresponde a la exportacion actual, no necesariamente al entrenamiento historico; pueden aparecer discrepancias al reproducir el artefacto.
- Solo se adapta el decodificador de texto; el codificador de vision no se modifica, por lo que las capacidades visuales son las del backbone sin ajuste.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del backbone Qwen3.5-4B.
- Riesgo de alucinacion: no cuantificado; sin benchmarks no se puede estimar.
- Limitaciones de contexto e idioma: no documentadas; depende del backbone.
- Licencia Apache 2.0 para el adaptador, pero los terminos y avisos del modelo upstream siguen siendo aplicables y deben revisarse para uso comercial.
- Estado del repositorio: 0 descargas y 0 interacciones, creado y actualizado el 6 de noviembre de 2026; sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-TR-LoRA-Qwen3.5-4B-DAPO
- Coleccion PLatour: https://huggingface.co/collections/zen-E/platour
- Dataset PLatour-DAPO-Data: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper (HTML): https://arxiv.org/html/2611.06976
- Paper (abs): https://arxiv.org/abs/2611.06976
- Referencia sobre Qwen3.5-4B: https://www.emergentmind.com/topics/qwen3-5-4b-model
