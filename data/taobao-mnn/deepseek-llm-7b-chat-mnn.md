# taobao-mnn/deepseek-llm-7b-chat-MNN

## Resumen

deepseek-llm-7b-chat-MNN es la version cuantizada y empaquetada para el motor de inferencia MNN del modelo conversacional DeepSeek LLM 7B Chat, desarrollado originalmente por DeepSeek AI y adaptado por el equipo taobao-mnn (Alibaba). El modelo resuelve el problema de desplegar un LLM de 7.000 millones de parametros en entornos con recursos limitados, especialmente en CPU y dispositivos moviles, mediante cuantizacion HQQ de 4 bits y un formato de pesos optimizado para el runtime MNN.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de una exportacion lista para produccion del DeepSeek LLM 7B Chat en el ecosistema MNN, lo que permite ejecutar inferencia de un transformer de 30 capas y dimension oculta 4096 sin GPU dedicada. El repositorio ocupa 11,2 GB e incluye pesos, tokenizador, configuracion y embeddings separados en BF16.

El modelo base es un transformer decoder-only denso de 7B parametros, afinado por instrucciones para dialogos en chino e ingles. Esta version MNN esta pensada para integracion en aplicaciones moviles y de escritorio a traves de la libreria MNN de Alibaba, con configuracion por defecto en CPU, 4 hilos y modos de precision y memoria bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (30 capas, hidden 4096) |
| Parametros totales | 7B (modelo base DeepSeek LLM 7B Chat) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4-bit con grupo 128 en capas lineales y cabeza de salida; escalas FP16; embeddings en BF16 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | DeepSeek Model License (license_name: deepseek) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`) |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek LLM 7B Chat, un transformer decoder-only denso con 30 capas y dimension oculta de 4096, entrenado por DeepSeek AI y posteriormente afinado por instrucciones para tareas de dialogo. La version MNN conserva la topologia del modelo original pero sustituye las capas lineales y la cabeza de salida por pesos cuantizados con HQQ (Half-Quadratic Quantization) a 4 bits con tamano de grupo 128, manteniendo las escalas de cuantizacion en FP16 para preservar precision numerica. Los embeddings de tokens se almacenan por separado en BF16 para reducir perdida de calidad en la representacion de entrada.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO en el modelo base. La exportacion MNN fue validada el 17 de noviembre de 2026 en CPU x64, con pruebas de alineacion FP32, generacion de saludos, aritmetica y traduccion, usando la version 3.6.2 de MNN (commit b0239771b07b317a258fbc384683bbd540741406). El proceso de exportacion esta documentado en `export_args.json` y los hashes y registros de prueba en `refresh_metadata.json`.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Razonamiento basico y respuesta a preguntas generales.
- Aritmetica simple y operaciones matematicas de nivel basico (validado en las pruebas de exportacion).
- Traduccion entre chino e ingles (caso de prueba verificado en la validacion).
- Generacion de codigo y asistencia en tareas de programacion, heredada del modelo base.
- Ejecucion en CPU mediante el runtime MNN, sin requerir GPU.
- Integracion con el ecosistema MNN-LLM para aplicaciones moviles y de escritorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones moviles: el modelo puede ejecutarse en CPU con 4 hilos y modo de memoria baja, lo que permite integrar un chatbot en apps Android o iOS mediante MNN sin depender de servicios en la nube.
- Traduccion chino-ingles en dispositivos: la validacion incluye casos de traduccion, y el soporte nativo de ambos idiomas lo hace adecuado para herramientas de traduccion offline en escritorio o movil.
- Procesamiento de lenguaje natural en entornos edge: al no requerir GPU, encaja en dispositivos con recursos limitados donde se necesita generacion de texto local por privacidad o latencia.
- Prototipado rapido de aplicaciones LLM en CPU: el formato MNN y el `llm_demo` permiten validar flujos conversacionales en estaciones de trabajo x64 antes de desplegar en produccion.
- Educacion y demostraciones tecnicas: util para mostrar el funcionamiento de un LLM cuantizado en hardware convencional, con instrucciones de compilacion y ejecucion reproducibles.
- Generacion de respuestas en herramientas de escritorio: integrable en editores o utilidades de escritorio que necesiten un motor de texto local sin conexion.
- Asistencia basica en programacion offline: hereda capacidades de generacion de codigo del modelo base, util en entornos sin acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta pruebas de validacion funcional (alineacion FP32, saludos, aritmetica y traduccion) sin metricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo esta disenado para ejecucion en CPU. El repositorio ocupa 11,2 GB, aunque el uso en memoria en tiempo de ejecucion depende de la configuracion (`memory=low`).
- GPU recomendadas: no se documentan; el modelo esta optimizado para CPU con MNN.
- Cabe en GPU consumer: no se especifica, pero al ser una exportacion MNN orientada a CPU, el escenario previsto no es GPU.
- Opciones de despliegue: MNN (runtime oficial), con compilacion via CMake usando `-DMNN_BUILD_LLM=ON -DMNN_LOW_MEMORY=ON -DMNN_SUPPORT_TRANSFORMER_FUSE=ON`. Tambien disponible en ModelScope.
- Configuracion por defecto: CPU, 4 hilos, `precision=low`, `memory=low`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| deepseek-llm-7b-chat-MNN | 7B | no disponible | HQQ 4-bit | DeepSeek Model License | MNN |
| deepseek-ai/deepseek-llm-7b-chat | 7B | no disponible | FP16/BF16 original | DeepSeek Model License | safetensors |
| Otros LLM 7B cuantizados para CPU | 7B | no disponible | variable (GGUF, etc.) | variable | GGUF, MNN, etc. |

La comparativa se limita al modelo base original y a la categoria generica de LLM 7B cuantizados para CPU, ya que la informacion proporcionada no incluye datos de rendimiento que permitan una comparacion cuantitativa con alternativas concretas. No se dispone de benchmarks publicados para establecer diferencias de calidad frente a otras exportaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar del modelo base, es previsible que arrastre sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: inherente a los LLM de 7B; no se documentan mitigaciones especificas en esta exportacion.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card; debe consultarse la documentacion del modelo base antes de usarlo con prompts largos.
- Limitaciones de idioma: solo se declaran chino e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: se aplica la DeepSeek Model License, que puede imponer condiciones para uso comercial; es necesario revisar el texto completo en el enlace oficial antes de desplegar en produccion.
- Caveat de produccion: la cuantizacion HQQ 4-bit puede degradar la calidad frente al modelo en FP16/BF16; conviene validar en el dominio de aplicacion.
- Dependencia de version: la exportacion fue validada con un commit concreto de MNN (b0239771b07b317a258fbc384683bbd540741406); otras versiones pueden requerir ajustes.
- El repositorio debe descargarse completo (incluyendo `embeddings_bf16.bin` y archivos de configuracion) para que la inferencia funcione.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/deepseek-llm-7b-chat-MNN
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-llm-7b-chat
- ModelScope: https://modelscope.cn/models/MNN/deepseek-llm-7b-chat-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia DeepSeek Model License: https://github.com/deepseek-ai/deepseek-LLM/blob/main/LICENSE-MODEL
