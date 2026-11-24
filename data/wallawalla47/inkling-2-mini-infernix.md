# wallawalla47/Inkling-2-Mini-Infernix

## Resumen

Inkling-2-Mini-Infernix es un artefacto de pesos empaquetado por el usuario wallawalla47 para el motor de inferencia Infernix, un runtime en C++/CUDA desarrollado por el mismo autor. El modelo subyacente es Inkling-2-Mini de Thinking Machines, un modelo multimodal de tipo imagen-texto-a-texto con arquitectura MoE (mixture of experts) que combina expertos cuantizados en NVFP4 y MXFP8 según la capa. El artefacto no es un modelo nuevo, sino una conversión bit-exacta del checkpoint original a un formato propietario de 20,3 GB que integra en un único fichero el modelo de texto, el drafter DSpark, la torre de visión y una tabla de ranking de tokens.

La relevancia de esta ficha radica en que demuestra un caso de despliegue de un MoE multimodal de gran tamano en una única GPU consumer de gama alta, la RTX 5090 (Blackwell, 32 GB). El autor documenta que los pesos ocupan 17,8 GiB (18,0 GiB con `--lm-head-draft` y 18,6 GiB con visión activada), dejando el resto de VRAM para la caché KV, que alcanza hasta 302.528 tokens de contexto por lane en BF16. El proyecto es explícitamente trabajo de hobby, parcialmente generado con IA, y no cuenta con descargas ni validación de la comunidad en el momento de la consulta.

El modelo base Inkling-2-Mini pertenece a Thinking Machines y está disponible en Hugging Face. La conversión preserva los códigos y escalas del checkpoint original, reordena algunos tensores sin alterar valores y deriva tres tensores auxiliares (Fold, fold_bias y la fila de clase de la torre de visión) siguiendo la lógica de la implementación de referencia. La licencia del artefacto es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + visión), con drafter especulativo DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 302.528 tokens por lane (BF16 KV, sin draft ni visión); 297.728 con `--lm-head-draft`; 243.584 con `--lm-head-draft --vision` |
| Tipos de cuantizacion | NVFP4 (expertos rutados, capas 0-19), MXFP8 (expertos rutados, capas 20-23); resto en BF16/FP32 |
| Idiomas soportados | no disponible (el ranking de tokens se pondera con inglés 50 %, chino 20 %, código 15 %, otros idiomas 12 %, matemáticas 3 %) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.infernix` (formato propietario del motor Infernix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de mezcla de expertos (MoE) con capacidades multimodales de imagen-texto-a-texto. La arquitectura concreta del checkpoint original no se detalla en la información disponible; lo que sí se documenta es el esquema de cuantización del artefacto: las capas 0 a 19 almacenan los expertos rutados en NVFP4 (códigos y escalas del checkpoint, con su `amax` y denominador), mientras que las capas 20 a 23 los almacenan en MXFP8. El resto de componentes (atención, gates, router, normas, convoluciones) se conservan en BF16 y FP32. La conversión se declara bit-exacta y verificada mediante `python -m tools.convert.verify_inkling2`, que releyó el checkpoint con un lector independiente y comparó cada palabra almacenada: 1.168 tensores, 24 bancos de expertos, 3 tensores derivados y el ranking.

El artefacto incorpora además el drafter DSpark, un mecanismo de decodificación especulativa que acelera la generación. DSpark utiliza una shortlist de los 65.536 tokens más frecuentes, construida a partir de un ranking medido con el propio Inkling sobre 51,7 millones de posiciones de asistente de un corpus de chat ponderado por idioma. En 1,35 millones de posiciones reservadas, esa shortlist cubre el 99,0 % de los tokens bajo dicha ponderación (inglés 99,2 %, código 99,9 %, chino 99,7 %, matemáticas 99,9 %, otros idiomas 95,8 %). El modelo completo verifica cada token, por lo que la salida no cambia. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida sin modificar.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), gracias a la torre de visión integrada en el artefacto.
- Razonamiento y generación de código, respaldados por la ponderación del ranking de tokens (15 % código) y la cobertura del 99,9 % en la shortlist de decodificación especulativa.
- Razonamiento matemático, con cobertura del 99,9 % en la shortlist para tokens matemáticos.
- Capacidades multilingües: el ranking incluye inglés, chino y otros idiomas, aunque no se especifica la lista completa de idiomas soportados por el modelo base.
- Decodificación especulativa opcional mediante DSpark con `--lm-head-draft`, que acelera la inferencia sin alterar la salida.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo puede mantener diálogos multi-turno con imágenes adjuntas (capturas, diagramas, fotografías) y contexto de hasta 243.584 tokens con visión activada, lo que permite adjuntar documentos extensos o historiales largos sin truncar.
- Análisis de documentos técnicos con imágenes: gracias a la torre de visión y a la ventana de contexto, se pueden procesar manuales, informes o papers con figuras y tablas en una sola pasada, manteniendo la coherencia entre el texto y las ilustraciones.
- Generación de código en estación de trabajo: la cobertura del 99,9 % de tokens de código en la shortlist de DSpark sugiere un uso eficiente en tareas de autocompletado y generación de código; el despliegue en una RTX 5090 permite integrarlo en flujos de desarrollo sin depender de la nube.
- Razonamiento matemático asistido: con cobertura del 99,9 % en tokens matemáticos y contexto largo, es adecuado para resolver problemas paso a paso, verificar demostraciones o tutorizar ejercicios con explicaciones extensas.
- Procesamiento de conversaciones en chino e inglés: la ponderación del ranking (50 % inglés, 20 % chino) y la cobertura del 99,7 % en chino lo hacen utilizable en atención al cliente o moderación bilingüe, siempre que se validen los idiomas adicionales.
- Investigación sobre decodificación especulativa: el artefacto incluye el drafter DSpark y la tabla de ranking de tokens, lo que permite experimentar con `--lm-head-draft` y medir el impacto en latencia y throughput en hardware Blackwell.
- Prototipado de pipelines multimodales en local: al caber en una sola GPU consumer, sirve para validar arquitecturas imagen-texto antes de escalar a infraestructura multi-GPU, con la ventaja de que los pesos no salen del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas de cobertura de la shortlist de tokens para la decodificación especulativa (99,0 % global en 1,35 millones de posiciones reservadas), que no son comparables con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 17,8 GiB para los pesos; 18,0 GiB con `--lm-head-draft`; 18,6 GiB con `--lm-head-draft --vision`. El espacio de trabajo de ejecución consume 1,8 GiB adicionales (3,1 GiB con visión).
- GPU recomendada: NVIDIA RTX 5090 (Blackwell, `sm_120a`, 32 GB), único hardware probado y para el que se compiló y ajustó el motor.
- Otras GPU: no testeadas según el autor. El soporte de NVFP4 y MXFP8 está ligado a la arquitectura Blackwell.
- Cabe en GPU consumer: sí, en RTX 5090 con el modelo completo en VRAM.
- Contexto máximo en RTX 5090: 302.528 tokens por lane con KV en BF16; 297.728 con `--lm-head-draft`; 243.584 con `--lm-head-draft --vision`.
- Opciones de despliegue: motor Infernix (C++/CUDA), compilado desde GitHub `main` en el commit `a487ad24f` o posterior, o release de Windows posterior a `windows-2026.11.20`. El comando `infernix-serve --plan plan.json` informa de lo que cabe en la máquina del usuario. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| Inkling-2-Mini-Infernix | no disponible | hasta 302.528 tokens (RTX 5090, BF16 KV) | NVFP4 + MXFP8 + BF16/FP32 | Apache 2.0 | Infernix, RTX 5090 |
| Inkling-2-Mini (base) | no disponible | no disponible | safetensors (BF16) | Apache 2.0 | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (MoE multimodal de tamano medio) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El propio autor declara que el artefacto, la receta de conversión, el motor y la mayor parte de la model card se generaron con IA (principalmente Claude Opus 5.5), y que es trabajo de hobby probablemente incompleto o no del todo preciso.
- El motor Infernix es un proyecto personal: requiere compilar desde un commit concreto de GitHub y no hay garantías de estabilidad ni soporte.
- Solo se ha probado en RTX 5090; otras GPU, incluidas las Blackwell de gama inferior, no están validadas.
- El formato `.infernix` es propietario y no es compatible con vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad.
- El artefacto no tiene descargas ni likes en el momento de la consulta, por lo que carece de validación externa.
- La lista de idiomas soportados no está disponible; el ranking de tokens está ponderado hacia inglés y chino, lo que puede penalizar otros idiomas en la decodificación especulativa.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por herencia del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo base ni sobre el artefacto convertido; conviene revisar la licencia y las condiciones del checkpoint original de Thinking Machines.
- El contexto máximo depende de la VRAM libre tras cargar pesos y espacio de trabajo; en configuraciones con visión y draft se reduce a 243.584 tokens.
- La conversión se declara bit-exacta y verificada, pero la verificación la realiza el propio autor con su herramienta, sin auditoría independiente.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/wallawalla47/Inkling-2-Mini-Infernix
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Herramienta de ranking de tokens: https://github.com/Wallawalla47/Infernix/tree/main/tools/freq_corpus
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
