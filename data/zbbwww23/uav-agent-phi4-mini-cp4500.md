# zbbwww23/uav-agent-phi4-mini-cp4500

## Resumen

UAV Agent Phi-4-mini cp4500 es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `microsoft/Phi-4-mini-instruct`, publicado por el usuario zbbwww23. No se trata de un modelo de propósito general, sino de un ajuste fino orientado a una tarea muy concreta: el control de vuelo dentro de un proyecto de pruebas con múltiples agentes UAV (vehículos aéreos no tripulados). El adaptador incorpora pesos LoRA, configuración y ficheros de tokenizer, pero no incluye los pesos del modelo base, que deben descargarse por separado desde el repositorio de Microsoft.

La relevancia de esta ficha es limitada y muy específica. El autor seleccionó este checkpoint (el paso 4500 de una familia de tres candidatos LoRA) mediante una validación online sobre 116 casos, obteniendo una tasa de éxito estricta en bucle cerrado de 0,9052 y una precisión detallada de agente de 0,9520. Estos datos proceden exclusivamente de la model card del autor y no han sido replicados de forma independiente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0,0 GB (el adaptador pesa 23.102.656 bytes, unos 22 MB).

Al estar construido sobre Phi-4-mini-instruct, hereda la arquitectura y el tamaño del modelo base de Microsoft (familia Phi-4-mini), así como sus restricciones de licencia, que el autor etiqueta como "other". La información disponible no detalla la longitud de contexto efectiva tras el ajuste, los idiomas soportados ni los datos exactos de entrenamiento, más allá de la referencia a un repositorio de dataset público con manifiesto y comprobaciones de aislamiento de particiones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA/QLoRA sobre transformer decoder-only (base: microsoft/Phi-4-mini-instruct) |
| Parametros totales | no disponible (el adaptador LoRA pesa 23.102.656 bytes; los parámetros del modelo base no se detallan en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; QLoRA implica cuantización durante el entrenamiento, no necesariamente en inferencia) |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican las restricciones del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye mediante PEFT sobre `microsoft/Phi-4-mini-instruct`, un modelo de la familia Phi-4-mini de Microsoft con arquitectura transformer decoder-only. El ajuste se realizó con QLoRA, según las etiquetas del repositorio, lo que implica cuantización de los pesos del modelo base durante el entrenamiento y entrenamiento de matrices de bajo rango. El checkpoint publicado corresponde al paso 4500 de entrenamiento y fue seleccionado entre tres candidatos LoRA de la misma familia evaluados sobre la misma cohorte de validación online.

Los datos de entrenamiento no se detallan en la información disponible. El autor remite al repositorio `zbbwww23/uav-agent-sft-public` para consultar el manifiesto público, las estadísticas de fuentes y las comprobaciones de aislamiento de particiones (split isolation). Se indica explícitamente que el JSONL crudo de fuentes mixtas, las respuestas privadas y las trazas de referencia no se incluyen. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es el proceso de selección por validación online en bucle cerrado, con métricas de éxito estricto, precisión de agente, puntuación compuesta y F1 macro de diagnóstico.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Phi-4-mini-instruct.
- Function calling y tool calling, según las etiquetas del repositorio (`function-calling`).
- Comportamiento como agente en entornos multi-agente, orientado al control de vuelo de UAV.
- Razonamiento multi-paso dentro de bucles cerrados de validación (closed-loop), con diagnóstico de fallos.
- Generación de explicaciones de soporte a las decisiones del agente (explanation support), con una precisión reportada de 1,0000 en la cohorte de validación.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en la información.

## Casos de uso

- Control de vuelo en pruebas de UAV: el adaptador está entrenado para emitir acciones de control dentro de un bucle cerrado de simulación o pruebas, con una tasa de éxito estricta reportada de 0,9052 sobre 116 casos. Es adecuado porque el ajuste se seleccionó precisamente por ese criterio.
- Diagnóstico de fallos en misión: la métrica de F1 macro de diagnóstico (0,7862) sugiere que el adaptador puede clasificar causas de fallo en el entorno de pruebas, útil para triaje automático de incidencias.
- Orquestación de agentes en entornos multi-agente: las etiquetas `agent` y `function-calling` indican que el modelo puede invocar herramientas y coordinar acciones entre agentes del sistema UAV.
- Generación de explicaciones operativas: con una precisión de soporte de explicación de 1,0000 en la cohorte reportada, puede emplearse para justificar decisiones de control ante operadores humanos.
- Validación y regresión de pipelines de agentes: el adaptador sirve como referencia para comparar candidatos LoRA en la misma cohorte, integrable en procesos de evaluación continua del proyecto.
- Prototipado de asistentes de instrucciones para dominios aeroespaciales: al estar basado en Phi-4-mini-instruct, puede adaptarse a otros dominios de control con ajustes LoRA adicionales, aunque requeriría reentrenamiento y validación propios.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la validación online del autor sobre 116 casos, sin comparación con otros modelos:

| Metrica | Valor |
|---|---:|
| Tasa de éxito estricta en bucle cerrado | 0,9052 |
| Precisión detallada de agente | 0,9520 |
| Puntuación compuesta detallada | 0,9380 |
| F1 macro de diagnóstico | 0,7862 |
| Precisión de soporte de explicación | 1,0000 |
| Casos evaluados | 116 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los valores anteriores proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información. Depende del tamaño del modelo base Phi-4-mini-instruct y de la cuantización elegida; el adaptador LoRA añade unos 22 MB.
- GPU recomendadas: no disponible. Al ser un adaptador sobre un modelo de la familia Phi-4-mini, se espera que quepa en GPU de consumo, pero la información no confirma modelos concretos.
- Cabe en GPU de consumo: no confirmado en la información.
- Opciones de despliegue: la model card muestra carga con `transformers` y `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para control de UAV o agentes de function calling sobre Phi-4-mini) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos específicos del adaptador ni del modelo base en la información.
- Riesgo de alucinación: no evaluado en la información. Las métricas reportadas miden éxito en tareas de control, no fidelidad factual general.
- Limitaciones de contexto e idioma: no disponibles. El adaptador hereda las del modelo base, sin que se confirmen en la documentación.
- Restricciones de licencia: la licencia es "other" y se aplican las restricciones del modelo base `microsoft/Phi-4-mini-instruct`. Es necesario revisar la licencia del modelo base antes de cualquier uso comercial.
- Validación limitada: las métricas proceden de una cohorte de 116 casos y de la propia model card del autor, sin replicación independiente. El F1 macro de diagnóstico (0,7862) es notablemente inferior al resto de métricas, lo que indica margen de mejora en esa tarea.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. No hay evidencia de uso en producción ni de mantenimiento continuado.
- Los pesos del modelo base no se incluyen; es imprescindible descargarlos por separado y verificar la integridad del adaptador mediante el SHA-256 indicado (bc4555c034eaa6c926d7cb36dcd9d0e8f408b9f1d3086c38033638df553aedea).

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/zbbwww23/uav-agent-phi4-mini-cp4500
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Dataset público del proyecto: https://huggingface.co/datasets/zbbwww23/uav-agent-sft-public
