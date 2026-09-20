# WizardlyBump17/Qwen3.6-35B-A3B-DFlash-int4-ov

## Resumen

Este repositorio es una conversion a OpenVINO del modelo `z-lab/Qwen3.6-35B-A3B-DFlash`, publicada por el usuario WizardlyBump17. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el resultado de ejecutar `optimum-cli export openvino` sobre los pesos originales para generar un grafo en formato OpenVINO IR cuantizado a int4 en todas las capas. La licencia declarada es Apache 2.0 y el repositorio no registra descargas ni interacciones en el momento de la consulta.

La model card es minima y se limita a documentar el comando de conversion y la version de `optimum-intel` utilizada (`2.3.0.dev0+ff23e95`), que corresponde a una build de desarrollo. Las etiquetas del repositorio indican `dflash`, `speculative-decoding` y `qwen3.6`, lo que situa el modelo base en la familia Qwen3.6 y apunta a un componente de decodificacion especulativa, pero no se detalla ni la arquitectura interna ni el proceso de entrenamiento.

El dato mas relevante para quien vaya a evaluarlo es la discrepancia entre la nomenclatura del nombre (que sugiere un modelo Mixture of Experts de 35B de parametros totales y 3B activos) y el tamano real del repositorio, de solo 0,2 GB. Un modelo de 35B parametros cuantizado a 4 bits ocuparia aproximadamente 18-20 GB, por lo que el artefacto publicado parece estar incompleto o contener unicamente el componente borrador (draft) de la decodificacion especulativa. Se recomienda verificar el contenido antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Las etiquetas del repositorio (`dflash`, `speculative-decoding`, `qwen3.6`) apuntan a un transformer con componente de decodificacion especulativa; la model card no la describe |
| Parametros totales | No disponible. La nomenclatura del nombre sugiere 35B, sin confirmar en la informacion proporcionada |
| Parametros activos | No disponible. La nomenclatura "A3B" sugiere 3B activos (posible MoE), sin confirmar |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 en todas las capas (`--weight-format int4 --all-layers`, via NNCF). No se documentan otras variantes |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), no safetensors ni GGUF |
| Tamano del repositorio | 0,2 GB |
| Modelo base | `z-lab/Qwen3.6-35B-A3B-DFlash` |
| Herramienta de conversion | `optimum-intel` 2.3.0.dev0+ff23e95, tarea `text-generation-with-past` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo ni su proceso de entrenamiento. Lo unico documentado es la cadena de conversion: se parte del checkpoint `z-lab/Qwen3.6-35B-A3B-DFlash`, se exporta con `optimum-cli export openvino` usando la tarea `text-generation-with-past` (es decir, con soporte de cache KV para generacion autoregresiva), se aplica cuantizacion de pesos a int4 en todas las capas mediante NNCF y se habilita `--trust-remote-code` para cargar codigo personalizado del repositorio original.

El sufijo "DFlash" y la etiqueta `speculative-decoding` indican que el modelo base incorpora decodificacion especulativa, una tecnica en la que un modelo borrador (draft) propone varios tokens que el modelo principal verifica en paralelo. La model card no especifica como se integra ese componente tras la conversion a OpenVINO, ni si el grafo exportado conserva el mecanismo de especulacion, ni si se ha realizado algun ajuste posterior (fine-tuning, RLHF, DPO). Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset o innovaciones tecnicas concretas.

## Capacidades

Advertencia: la model card no documenta capacidades funcionales. Las siguientes afirmaciones se derivan exclusivamente de los metadatos disponibles y no han sido verificadas por el autor del repositorio ni por pruebas independientes.

- Generacion de texto autoregresiva con cache KV, derivada de la tarea de exportacion `text-generation-with-past`.
- Inferencia cuantizada a int4 sobre el runtime de OpenVINO, orientada a hardware Intel (CPU, iGPU, GPU Arc, aceleradores con AMX).
- Posible decodificacion especulativa heredada del modelo base, segun la etiqueta `speculative-decoding`; no se confirma su funcionamiento tras la conversion.
- Razonamiento, generacion de codigo, matematicas, capacidades multilingues, vision, audio, tool calling y uso agentico: no disponibles en la informacion proporcionada. Deben validarse directamente contra el modelo base `z-lab/Qwen3.6-35B-A3B-DFlash`.
- Modo de pensamiento (thinking), soporte de function calling o multi-step reasoning: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles de un artefacto OpenVINO int4 de este tipo, no casos validados por el autor. Deben confirmarse con pruebas propias antes de comprometerlos en produccion.

- Inferencia local en servidores Intel Xeon sin GPU dedicada: el formato OpenVINO IR con cuantizacion int4 permite ejecutar el modelo aprovechando instrucciones AMX y AVX-512 en CPU, reduciendo el coste por token frente a una ejecucion en precision completa.
- Despliegue en equipos de escritorio o AI PC con iGPU Intel: OpenVINO reparte la carga entre CPU y graficos integrados, lo que hace viable un asistente de texto local sin tarjeta grafica dedicada, siempre que el modelo completo quepa en memoria.
- Procesamiento por lotes de documentos en infraestructura Intel existente: la integracion con OpenVINO Runtime permite reutilizar clústeres Xeon ya desplegados para tareas de resumen, clasificacion o extraccion de entidades.
- Prototipado rapido de pipelines de generacion: al ser una conversion directa del modelo base, sirve para comparar el rendimiento de OpenVINO frente a otros runtimes (PyTorch, llama.cpp) sobre el mismo checkpoint antes de decidir el stack definitivo.
- Evaluacion de decodificacion especulativa en produccion: si el grafo conserva el componente DFlash, permite medir la ganancia de throughput del draft model sobre hardware Intel en condiciones reales de carga.
- Servicio de generacion de texto con requisitos de licencia permisiva: al estar bajo Apache 2.0, el artefacto puede integrarse en productos comerciales sin obligaciones de copyleft, sujeto a las condiciones del modelo base.
- Pruebas de regresion de cuantizacion: comparar las salidas int4 con las del checkpoint original para medir la degradacion introducida por la cuantizacion de todas las capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni datos de latencia o throughput. Tampoco se documenta la perdida de calidad asociada a la cuantizacion int4 aplicada a todas las capas.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Si el artefacto contuviera realmente un modelo de 35B en int4, el peso de los parametros rondaria los 17,5-20 GB, a lo que habria que sumar la cache KV y el overhead del runtime. El repositorio ocupa solo 0,2 GB, cifra incompatible con esa estimacion.
- GPU recomendadas: no especificadas. El formato OpenVINO esta orientado a hardware Intel (GPU Arc, iGPU integrada, Xeon con AMX, Gaudi). No hay datos de rendimiento para A100, H100 o RTX 4090 en la informacion proporcionada.
- GPU de consumo: no hay confirmacion de que el modelo quepa en tarjetas de 8, 12 o 16 GB. Con la estimacion teorica de 35B en int4, no cabria en ninguna GPU de consumo actual.
- Opciones de despliegue: OpenVINO Runtime y OpenVINO GenAI, cargando el IR exportado con `optimum-intel` y `transformers`. vLLM, llama.cpp, Ollama y TGI no consumen formato OpenVINO IR de forma nativa, por lo que no son opciones directas sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WizardlyBump17/Qwen3.6-35B-A3B-DFlash-int4-ov | No disponible (nombre sugiere 35B/A3B) | No disponible | OpenVINO IR | int4, todas las capas | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| z-lab/Qwen3.6-35B-A3B-DFlash (modelo base) | No disponible (nombre sugiere 35B/A3B) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | Publico en HuggingFace |

No se dispone de informacion sobre alternativas comparables de la misma categoria en los datos proporcionados. No es posible establecer comparaciones de rendimiento, contexto o calidad con otros modelos sin datos verificables.

## Limitaciones y advertencias

- La model card no documenta sesgos, idiomas, casos de uso previstos ni limitaciones. No hay evaluaciones de seguridad publicadas.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Es un riesgo inherente a cualquier modelo generativo y no puede descartarse sin pruebas.
- Discrepancia critica de tamano: el repositorio ocupa 0,2 GB, muy por debajo de lo esperable para un modelo de 35B cuantizado a int4. Es probable que la conversion este incompleta o que contenga unicamente el componente borrador de la decodificacion especulativa. Verificar el listado de archivos antes de usarlo.
- Requiere `--trust-remote-code` en la conversion, lo que implica ejecutar codigo personalizado del repositorio original. Riesgo de seguridad si no se audita ese codigo.
- La conversion se realizo con `optimum-intel` en version de desarrollo (`2.3.0.dev0`), no con una release estable. Puede haber incompatibilidades con versiones actuales de OpenVINO o `transformers`.
- Dependencia fuerte de hardware Intel: el artefacto no es portable a GPUs NVIDIA o AMD sin reconvertir los pesos a otro formato.
- Licencia Apache 2.0 declarada en el repositorio de conversion, pero no se confirma la licencia del modelo base `z-lab/Qwen3.6-35B-A3B-DFlash` en la informacion proporcionada. Conviene verificarla antes de un uso comercial, ya que las condiciones del modelo derivado dependen de las del original.
- Sin historial de uso: cero descargas y cero interacciones, por lo que no existe retroalimentacion de la comunidad sobre su funcionamiento real.
- No hay resultados de benchmarks ni informes de degradacion por cuantizacion int4 en todas las capas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WizardlyBump17/Qwen3.6-35B-A3B-DFlash-int4-ov
- Modelo base: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
- Organizacion del modelo base: https://huggingface.co/z-lab
- Optimum Intel (herramienta de conversion): https://github.com/huggingface/optimum-intel
- OpenVINO: https://github.com/openvinotoolkit/openvino
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo: las entradas devueltas corresponden a comercio de ropa y no guardan relacion con el artefacto. No se han encontrado papers, blogs, repositorios ni demos adicionales.
