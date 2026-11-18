# taobao-mnn/LFM2-350M-Extract-MNN

## Resumen

LFM2-350M-Extract-MNN es la versión cuantizada y empaquetada para el runtime MNN del modelo LiquidAI/LFM2-350M-Extract, un modelo de extracción de información de 350 millones de parámetros desarrollado originalmente por Liquid AI y adaptado por el equipo taobao-mnn (Alibaba) para su ejecución en CPU mediante su motor de inferencia MNN. El modelo resuelve una tarea concreta: convertir información contenida en documentos de texto libre en estructuras de datos como JSON, XML o YAML, en escenarios de extracción de un solo turno.

La relevancia de esta variante no está en el modelo base sino en su empaquetado: los pesos se han cuantizado a 4 bits con HQQ (Half-Quadratic Quantization) con grupo de 64, y se han exportado al formato propietario de MNN (`llm.mnn` / `llm.mnn.weight`), lo que permite ejecutar el modelo en CPU con cuatro hilos por defecto y configuraciones de bajo consumo de memoria. El repositorio ocupa 0,4 GB, lo que lo hace viable en entornos sin GPU.

Se trata de un modelo de nicho, orientado a pipelines de extracción estructurada en producción y a despliegues en dispositivos o servidores sin aceleración hardware. Su licencia deriva del modelo base (LFM Open License v1.0), con condiciones específicas para uso comercial recogidas en la sección 5 de dicha licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM2-350M-Extract); capas de lenguaje: 16, dimensión oculta: 1024 |
| Parámetros totales | 350M (según nomenclatura del modelo base) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | HQQ 4 bits, grupo 64 (capas lineales del lenguaje y cabeza de salida); escalas de cuantización en FP16; embeddings de tokens comparten pesos 4 bits con la cabeza de salida |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1-0); condiciones de uso comercial en la sección 5 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizer `tokenizer.mtok`, configuración `config.json` / `llm_config.json` |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2-350M-Extract, un transformer de 16 capas y dimensión oculta 1024 especializado en extracción de información estructurada a partir de texto. La model card del repositorio MNN no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo original de Liquid AI, que no se incluye en la información proporcionada.

La innovación técnica de esta variante es el proceso de cuantización y exportación: los pesos lineales del lenguaje y la cabeza de salida se cuantizan con HQQ a 4 bits con tamaño de grupo 64, manteniendo las escalas en FP16, y los embeddings comparten los pesos cuantizados con la cabeza de salida. El resultado se empaqueta en el formato de MNN, con soporte de plantillas Jinja y corrección de tokens especiales mediante un PR específico del repositorio MNN (PR #5155, commit 4756b19). La validación declarada por el autor, del 17 de noviembre de 2026 sobre CPU x64, cubre alineación de mapeo FP32, casos de extracción estructurada y pruebas de humo con la configuración por defecto.

## Capacidades

- Extracción de información estructurada: convierte texto libre en JSON, XML o YAML según el formato indicado en el `system_prompt`.
- Tareas de un solo turno: el modelo está diseñado explícitamente para extracción single-turn, no para conversación multi-turno.
- Generación de texto condicionada por instrucciones de sistema que definen formato y campos de salida.
- Soporte de decodificación greedy configurable (`sampler_type: greedy` en `config.json`), adecuada para extracción determinista.
- Multilingüe limitado a chino e inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Extracción de entidades de documentos: procesar correos, contratos o fichas y obtener nombre, edad, ciudad u otros campos en JSON, como en el ejemplo de la model card ("Alice is 30 years old and lives in Beijing"), usando el `system_prompt` para definir el esquema de salida.
- Normalización de datos hacia JSON/XML/YAML en pipelines ETL: el modelo actúa como paso de conversión de texto no estructurado a registros parseables, con decodificación greedy para minimizar variabilidad.
- Procesamiento en CPU sin GPU: al estar empaquetado en MNN con cuantización 4 bits y configuración de bajo consumo de memoria, es adecuado para servidores sin acelerador o para despliegues en el borde donde no hay CUDA disponible.
- Extracción por lotes de campos en documentos en chino e inglés: su soporte bilingüe permite cubrir corpus mixtos en ambos idiomas con un único modelo.
- Preprocesado para bases de datos: generar estructuras YAML o JSON que alimenten posteriormente sistemas de búsqueda o almacenamiento documental.
- Prototipado rápido de esquemas de extracción: al ser un modelo de 350M y 0,4 GB, permite iterar sobre distintos `system_prompt` y formatos de salida con coste de cómputo bajo antes de fijar un pipeline definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el modelo está orientado a ejecución en CPU. El repositorio completo ocupa 0,4 GB, con pesos cuantizados a 4 bits.
- GPU recomendadas: no se especifican; el empaquetado MNN y la configuración por defecto son para CPU.
- Compatibilidad con GPU de consumo: no documentada en la información proporcionada.
- Opciones de despliegue: runtime MNN (`llm_demo`), compilado con `-DMNN_BUILD_LLM=ON -DMNN_LOW_MEMORY=ON -DMNN_SUPPORT_TRANSFORMER_FUSE=ON`; requiere el commit 4756b19d51ddeaf0a73bbc9f230dea6d930f442e de MNN (PR #5155) para plantillas Jinja y corrección de tokens especiales. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Configuración por defecto: CPU, 4 hilos, `precision=low`, `memory=low`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-350M-Extract-MNN (este) | 350M | no disponible | MNN, HQQ 4 bits | LFM Open License v1.0 | Hugging Face, ModelScope |
| LiquidAI/LFM2-350M-Extract | 350M | no disponible | safetensors (formato del modelo original, no confirmado en la información) | LFM Open License v1.0 | Hugging Face |
| Otras alternativas de extracción de información de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; el único contraste documentado es con el modelo base original, del que esta variante se diferencia por la cuantización HQQ 4 bits y el empaquetado MNN.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de un modelo base bilingüe zh/en, cabe esperar un sesgo hacia esos dos idiomas.
- Riesgo de alucinación: no cuantificado; en tareas de extracción estructurada, el modelo puede generar campos o valores no presentes en el texto de entrada, por lo que se recomienda validación posterior del esquema.
- Limitaciones de contexto: la longitud de contexto no está especificada en la información disponible.
- Limitaciones de idioma: solo chino e inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Uso comercial: la licencia LFM Open License v1.0 impone condiciones específicas recogidas en su sección 5; es necesario revisarlas antes de un despliegue comercial.
- Restricciones de runtime: requiere una versión concreta de MNN (commit del PR #5155); no es compatible directamente con runtimes estándar de Hugging Face, vLLM o llama.cpp.
- Ámbito de uso: diseñado para extracción de un solo turno; no es adecuado para conversación multi-turno ni para tareas de razonamiento general.
- Madurez: 44 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/LFM2-350M-Extract-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M-Extract
- ModelScope: https://modelscope.cn/models/MNN/LFM2-350M-Extract-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- PR de MNN con plantillas Jinja y corrección de tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentación de MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
