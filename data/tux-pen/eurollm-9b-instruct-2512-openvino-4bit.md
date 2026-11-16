# tux-pen/EuroLLM-9B-Instruct-2512-openvino-4bit

## Resumen

EuroLLM-9B-Instruct-2512-openvino-4bit es una versión cuantizada a 4 bits y convertida al formato OpenVINO del modelo instructivo EuroLLM-9B-Instruct-2512, desarrollado originalmente por el proyecto utter-project. La conversión la firma el usuario tux-pen y se ha realizado mediante el espacio de cuantización nncf-quantization con la librería optimum-intel de Hugging Face, lo que permite ejecutar el modelo sobre hardware Intel (CPU, iGPU y NPU) con un consumo de memoria notablemente reducido.

El modelo base es un transformer decoder-only de aproximadamente 9.000 millones de parámetros, afinado para instrucciones y entrenado con especial énfasis en las lenguas europeas, aunque su cobertura lingüística se extiende a 35 idiomas, incluyendo las 24 lenguas oficiales de la Unión Europea. Esta versión cuantizada conserva la licencia Apache 2.0 del modelo original, lo que la hace apta para uso comercial sin restricciones adicionales.

Su relevancia actual radica en que permite desplegar un modelo multilingüe de casi 9B en entornos sin GPU dedicada, usando el runtime OpenVINO y cuantización de 4 bits, con un repositorio de 5,3 GB. Es una opción práctica para inferencia en local en portátiles y estaciones de trabajo con procesadores Intel, así como para escenarios de despliegue en el borde (edge) donde el consumo de VRAM o de memoria es crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base EuroLLM-9B-Instruct-2512); pesos convertidos a OpenVINO con cuantización NNCF |
| Parametros totales | Aproximadamente 9.000 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (NNCF, via optimum-intel); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | 35 idiomas: en, de, es, fr, it, pt, pl, nl, tr, sv, cs, el, hu, ro, fi, uk, sl, sk, da, lt, lv, et, bg, no, ca, hr, ga, mt, gl, zh, ru, ko, ja, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO (IR) con safetensors en el repositorio; compatible con transformers via optimum-intel |

## Arquitectura y entrenamiento

El modelo base EuroLLM-9B-Instruct-2512 es un transformer decoder-only de aproximadamente 9.000 millones de parámetros, entrenado por el proyecto utter-project con un enfoque explícito en la cobertura de las lenguas europeas y en la calidad de la generación instructiva. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras) empleadas en el modelo original.

La versión aquí descrita no modifica la arquitectura ni el entrenamiento: aplica una cuantización de 4 bits mediante NNCF (Neural Network Compression Framework) a través de optimum-intel y convierte los pesos al formato intermedio (IR) de OpenVINO. Esta transformación reduce el tamaño del repositorio a 5,3 GB y permite la ejecución sobre CPUs, iGPU y NPU de Intel con el runtime de OpenVINO. La cuantización de 4 bits puede introducir una degradación moderada de la calidad respecto al modelo en precisión completa, no cuantificada en la información disponible.

## Capacidades

- Generación de texto conversacional e instructiva multilingüe en 35 idiomas, con especial cobertura de las lenguas oficiales de la Unión Europea.
- Razonamiento general y respuesta a instrucciones en formato chat (modelo -Instruct).
- Generación de código y tareas de transformación de texto, aunque sin datos de benchmarks específicos en la información disponible.
- Capacidades multilingües amplias: traducción y generación cruzada entre lenguas europeas, además de chino, ruso, coreano, japonés, árabe e hindi.
- Ejecución sobre hardware Intel mediante OpenVINO (CPU, iGPU, NPU), lo que facilita el despliegue en local sin GPU dedicada.
- Compatibilidad con el ecosistema transformers a través de `OVModelForCausalLM` de optimum-intel.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional multilingüe en local: el modelo puede gestionar diálogos multi-turno en cualquiera de los 35 idiomas soportados, ejecutándose sobre CPU o iGPU Intel sin necesidad de GPU dedicada, lo que lo hace adecuado para aplicaciones de escritorio y asistentes personales.
- Traducción automática entre lenguas europeas: su entrenamiento centrado en idiomas de la UE y su cobertura de 35 lenguas permiten usarlo como motor de traducción en pipelines internos, con la ventaja de ejecutarse en infraestructura sin aceleradores gráficos.
- Procesamiento de documentación administrativa multilingüe: resumen, extracción y reformulación de textos en varias lenguas europeas en entornos con requisitos de soberanía de datos, donde el despliegue on-premise con OpenVINO evita enviar información a servicios en la nube.
- Atención al cliente en entornos con hardware limitado: al ocupar 5,3 GB en cuantización de 4 bits, puede desplegarse en servidores de gama media o en estaciones de trabajo con CPU Intel, ofreciendo respuestas en el idioma del usuario.
- Generación de contenido y redacción asistida en múltiples idiomas: útil para equipos editoriales o de marketing que trabajan con varias lenguas europeas y necesitan un modelo ejecutable en portátiles.
- Prototipado e investigación en PLN multilingüe: investigadores que necesitan un modelo instructivo de ~9B ejecutable en hardware de consumo pueden usar esta versión para experimentar con prompts, evaluación cualitativa y ajuste ligero.
- Despliegue en el borde (edge): la combinación de OpenVINO y cuantización de 4 bits permite integrar el modelo en dispositivos con NPU Intel para tareas de generación de texto sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 5,3 GB en cuantización de 4 bits; se recomienda al menos 8 GB de memoria libre para la carga del modelo y el contexto de inferencia (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas: no se especifican en la información disponible; el formato OpenVINO está optimizado para CPU, iGPU y NPU de Intel. Para GPU dedicadas se requeriría el runtime correspondiente de OpenVINO con soporte para dichas GPUs.
- Cabe en hardware de consumo: sí, en equipos con CPU Intel modernos y al menos 8 GB de RAM; también en iGPU y NPU Intel compatibles con OpenVINO.
- Opciones de despliegue: OpenVINO Runtime a través de optimum-intel (`OVModelForCausalLM`); no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI para este formato concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EuroLLM-9B-Instruct-2512-openvino-4bit (este) | ~9B | No disponible | Apache 2.0 | OpenVINO 4-bit | Optimizado para hardware Intel; 35 idiomas |
| utter-project/EuroLLM-9B-Instruct-2512 (base) | ~9B | No disponible | Apache 2.0 | safetensors | Precisión completa; requiere más memoria |
| Otros modelos multilingües de ~7-9B (p. ej., familia Llama, Mistral, Qwen) | 7-9B | Variable | Variable | safetensors, GGUF | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización de 4 bits puede degradar la calidad de las respuestas respecto al modelo base en precisión completa; no se han publicado evaluaciones de esta degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se documentan medidas específicas de mitigación en la información disponible.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de despliegues con documentos largos.
- Aunque cubre 35 idiomas, la calidad puede variar notablemente entre lenguas; el modelo base está optimizado para lenguas europeas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de las herramientas de conversión (optimum-intel, NNCF, OpenVINO).
- El formato OpenVINO está orientado a hardware Intel; el rendimiento en otras plataformas puede no ser óptimo o requerir runtimes adicionales.
- El repositorio tiene pocas descargas y likes (1 descarga, 0 likes en el momento de la consulta), por lo que no cuenta con validación comunitaria extensa.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines que requieran invocación de funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tux-pen/EuroLLM-9B-Instruct-2512-openvino-4bit
- Modelo base: https://huggingface.co/utter-project/EuroLLM-9B-Instruct-2512
- Espacio de cuantización NNCF: https://huggingface.co/spaces/echarlaix/nncf-quantization
- Repositorio optimum-intel: https://github.com/huggingface/optimum-intel
