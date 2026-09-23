# wordbomb/astra-agent-coder-7b

## Resumen

astra-agent-coder-7b es un modelo de generación de código publicado por el usuario wordbomb en HuggingFace. Se distribuye exclusivamente en formato GGUF, cuantizado en Q4_K_M, y está pensado para su ejecución local mediante llama.cpp u Ollama. El nombre del archivo de pesos incluido en el repositorio (`qwen2.5-coder-7b-instruct.Q4_K_M.gguf`) y la etiqueta `qwen2` indican que se trata de un ajuste fino derivado de Qwen2.5-Coder-7B-Instruct, aunque la model card no confirma explícitamente esta relación ni detalla el proceso de ajuste más allá de indicar que se usó Unsloth.

El modelo cuenta con 7.615.616.512 parámetros (aproximadamente 7,62 B) según los metadatos de safetensors, y el repositorio ocupa 4,7 GB. La model card únicamente documenta el proceso de conversión a GGUF, un ejemplo de uso con `llama-cli` y la existencia de un Modelfile para Ollama; no incluye información sobre datos de entrenamiento, benchmarks, licencia, idiomas soportados ni longitud de contexto.

Su relevancia actual es limitada y debe evaluarse con cautela: el repositorio no tiene descargas ni valoraciones, no declara licencia ni idiomas, y el contenido publicado es esencialmente un artefacto de conversión de formato a partir de un modelo base. Es un candidato a considerar solo si se necesita una variante GGUF concreta de Qwen2.5-Coder-7B, y siempre verificando previamente la procedencia de los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (etiqueta `qwen2`); detalles no especificados en la model card |
| Parámetros totales | 7.615.616.512 (≈7,62 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base declarado por el nombre del archivo, Qwen2.5-Coder-7B-Instruct, documenta 32.768 tokens |
| Tipos de cuantización | GGUF; un único archivo publicado: `qwen2.5-coder-7b-instruct.Q4_K_M.gguf` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el procedimiento de entrenamiento. Los únicos datos técnicos disponibles son que el modelo fue ajustado (fine-tuned) y convertido a GGUF con Unsloth, y que el repositorio contiene un único archivo cuantizado en Q4_K_M. La etiqueta `qwen2` y el nombre del archivo de pesos apuntan a que la base es Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA) y ventana de contexto de 32.768 tokens, pero esta correspondencia no está confirmada en la documentación del autor.

No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas propias. El uso de Unsloth sugiere un ajuste fino eficiente en memoria (LoRA/QLoRA o similar) sobre el modelo base, pero se desconoce el conjunto de datos empleado y si el ajuste afectó realmente a los pesos o si el archivo publicado es una simple cuantización del modelo original.

## Capacidades

Nota: al no existir documentación funcional específica, las capacidades que se enumeran a continuación se infieren del modelo base declarado y deben validarse empíricamente antes de usarse en producción.

- Generación de texto y de código en múltiples lenguajes de programación, herencia del modelo base orientado a código.
- Razonamiento sobre fragmentos de código: explicación, refactorización, detección de errores y generación de parches.
- Modo conversacional: la etiqueta `conversational` y el uso de `--jinja` en llama.cpp indican que el repositorio incluye plantilla de chat.
- Relleno de código (fill-in-the-middle) y autocompletado, si el ajuste conserva las capacidades del modelo base.
- Soporte de tool calling / function calling: no confirmado para este ajuste concreto; el modelo base Qwen2.5-Coder-Instruct sí lo soporta, pero este repositorio no lo documenta.
- Comportamiento como agente multi-paso: no confirmado; el nombre "agent" no va acompañado de ninguna descripción de entrenamiento orientado a agentes.
- Capacidades multilingües: no disponible; no se declara la lista de idiomas.
- Capacidades de visión o audio: no disponibles. La mención a `llama-mtmd-cli` en la model card es texto genérico de la plantilla de Unsloth y no implica que el modelo sea multimodal.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Autocompletado en el IDE: el modelo, al ser un derivado de una familia orientada a código con 7,62 B de parámetros y cuantización Q4_K_M, puede ejecutarse en un portátil con GPU de 8 GB y ofrecer sugerencias de código en tiempo real sin enviar el código fuente a servicios externos.
- Asistente de programación con privacidad de datos: al desplegarse localmente con llama.cpp u Ollama, permite consultar y refactorizar código propietario sin salir de la infraestructura de la organización, requisito habitual en sectores regulados.
- Generación de pruebas unitarias: se le puede pedir que, a partir de una función o clase dada, genere casos de prueba en el framework del proyecto (pytest, JUnit, Jest) y detecte rutas no cubiertas.
- Migración y traducción entre lenguajes: conversión de módulos de un lenguaje a otro (por ejemplo, Python a TypeScript) manteniendo la semántica, con revisión humana posterior.
- Documentación técnica automatizada: generación de docstrings, comentarios y documentación de API a partir del código fuente, como paso previo a la revisión humana en el pipeline de documentación.
- Asistente de soporte técnico interno: conversaciones multi-turno sobre errores, trazas y configuraciones, siempre que la ventana de contexto efectiva del despliegue sea suficiente para el volumen de logs aportado.
- Revisión de código en CI/CD: integración como paso de análisis que comenta posibles problemas en las solicitudes de fusión, sujeto a validación previa de su tasa de falsos positivos.
- Prototipado de agentes de código: uso como componente generador dentro de un bucle de agente (leer archivo, proponer cambio, ejecutar test), con la salvedad de que su soporte de tool calling no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MBPP ni ninguna otra métrica, y el repositorio no cuenta con evaluaciones de terceros. Tampoco existen datos de latencia o throughput medidos.

## Requisitos de hardware

Nota: las estimaciones siguientes se calculan a partir del número de parámetros (7,62 B) y del tamaño del repositorio (4,7 GB), no de mediciones publicadas.

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q4_K_M (el archivo pesa 4,7 GB, más el contexto y las cachés KV); alrededor de 8-9 GB en Q8_0; aproximadamente 15-16 GB en FP16/BF16.
- GPU recomendadas: para FP16, A100 40 GB, H100 80 GB o RTX 4090 24 GB; para Q4_K_M, cualquier GPU con 8 GB o más.
- Cabe en GPU de consumo: sí. Con Q4_K_M funciona en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en tarjetas de 8 GB siempre que se limite la longitud de contexto. También puede ejecutarse en CPU con llama.cpp usando RAM en lugar de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (el repositorio incluye un Modelfile) y cualquier runtime compatible con GGUF. vLLM y TGI no pueden cargar GGUF directamente en su configuración estándar; requerirían pesos en safetensors, que no se publican en este repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de su documentación pública; no se han verificado ejecutando benchmarks de forma independiente, y para astra-agent-coder-7b no existe ningún resultado publicado.

| Modelo | Parámetros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| astra-agent-coder-7b | ≈7,62 B | No disponible en la model card (base: 32.768 tokens) | No disponible | GGUF (Q4_K_M) |
| Qwen2.5-Coder-7B-Instruct | 7,61 B | 32.768 tokens (extensible a 131.072 con YaRN) | Apache 2.0 | safetensors, GGUF (comunidad) |
| CodeLlama-7B-Instruct | 6,74 B | 16.384 tokens | Llama 2 Community License | safetensors, GGUF |
| StarCoder2-7B | 6,74 B | 16.384 tokens | BigCode OpenRAIL-M | safetensors, GGUF |

Diferencias clave: astra-agent-coder-7b no declara licencia ni idiomas, solo ofrece una cuantización Q4_K_M y no presenta ninguna evaluación propia, por lo que frente a Qwen2.5-Coder-7B-Instruct no aporta ninguna ventaja verificable más allá del empaquetado GGUF y de un posible ajuste fino del que no se documenta el contenido.

## Limitaciones y advertencias

- Repositorio sin validación: 0 descargas, 0 valoraciones y ninguna evaluación de terceros. No hay evidencia pública de que el ajuste mejore al modelo base.
- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. Un derivado de Qwen2.5-Coder estaría sujeto a la licencia Apache 2.0 del original, pero esta cadena de atribución no está confirmada por el autor.
- Posible discrepancia entre nombre y contenido: el archivo se llama `qwen2.5-coder-7b-instruct.Q4_K_M.gguf`, el mismo nombre que tendría una cuantización del modelo base sin ajustar. Existe el riesgo real de que los pesos publicados sean una simple conversión del modelo original y no un ajuste específico para agentes, pese al nombre "astra-agent-coder".
- Idiomas no declarados: se desconoce el soporte multilingüe efectivo, especialmente en castellano.
- Contexto no declarado: la ventana real del despliegue dependerá de la configuración de llama.cpp u Ollama y no está documentada.
- Riesgo de alucinación de API y de código: inherente a todos los modelos generativos de código; el código generado debe compilarse y probarse antes de llegar a producción.
- Sesgos no evaluados: no se ha publicado ningún análisis de sesgos, seguridad o comportamiento en dominios sensibles.
- Trazabilidad limitada: no se documentan el dataset de ajuste ni los hiperparámetros, lo que dificulta auditar el modelo en entornos regulados.
- Tool calling y uso como agente no confirmados: el nombre del modelo sugiere orientación a agentes, pero la model card no describe entrenamiento con llamadas a herramientas ni formato de mensajes específico más allá de la plantilla de chat.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wordbomb/astra-agent-coder-7b
- Repositorio de Unsloth (herramienta citada en la model card): https://github.com/unslothai/unsloth
- Los resultados de la búsqueda web no contienen ninguna referencia relevante al modelo, a su autor ni a su modelo base; los enlaces devueltos corresponden a foros sobre Facebook y no guardan relación con esta ficha.
