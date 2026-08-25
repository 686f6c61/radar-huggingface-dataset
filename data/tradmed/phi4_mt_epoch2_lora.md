# TradMed/phi4_MT_epoch2_lora

## Resumen

TradMed/phi4_MT_epoch2_lora es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `unsloth/phi-4-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del modelo Phi-4 de Microsoft (14 mil millones de parámetros). El adaptador fue desarrollado por el usuario thao-uyen1508 bajo el espacio TradMed, y se distribuye con licencia Apache 2.0. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), que deben combinarse con el modelo base para la inferencia. No se especifica en la documentación la tarea concreta para la que se ha entrenado, aunque el nombre sugiere una posible especialización en el dominio médico (TradMed), sin confirmación explícita.

El interés de este modelo radica en su eficiencia: el entrenamiento con LoRA reduce drásticamente el número de parámetros a actualizar y el coste computacional, permitiendo adaptar un modelo de 14B a dominios específicos con pocos recursos. La integración con Unsloth acelera el entrenamiento, como se indica en la propia model card. Al estar basado en Phi-4, hereda las capacidades de razonamiento, código y matemáticas de ese modelo, aunque el adaptador puede ajustar el comportamiento hacia la tarea objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4) con adaptadores LoRA |
| Parametros totales | 14B (base) + adaptador LoRA (tamano del repo: 0,3 GB; numero de parametros del adaptador no disponible) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Phi-4) |
| Tipos de cuantizacion | Base en 4 bits (bitsandbytes); adaptador en precision completa (no especificado) |
| Idiomas soportados | Ingles (etiqueta `en` en la model card) |
| Licencia | Apache 2.0 (para el adaptador) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Phi-4 es un modelo de lenguaje autoregresivo de 14 mil millones de parametros, con arquitectura transformer decoder-only y una longitud de contexto de 128 tokens. Su entrenamiento se caracteriza por el uso intensivo de datos sinteticos de alta calidad, especialmente para tareas de razonamiento, junto con un curriculum de entrenamiento optimizado y tecnicas de filtrado de datos. El adaptador LoRA de este repositorio se entrena sobre la version cuantizada en 4 bits de Phi-4 (via Unsloth), lo que reduce significativamente el uso de VRAM. El entrenamiento se realizo con la libreria `trl` y Unsloth, que aplica optimizaciones para acelerar el ajuste fino. No se especifican los datos de entrenamiento ni la metodologia exacta (RLHF, DPO, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto y completado de secuencias: hereda las capacidades de Phi-4, que destaca en razonamiento logico, matematicas y generacion de codigo.
- Razonamiento de multiples pasos: Phi-4 fue entrenado con datos sinteticos para mejorar el razonamiento paso a paso.
- Soporte de contextos largos: con 128 tokens de ventana, puede manejar documentos extensos.
- Multilingue: aunque la model card indica solo ingles, Phi-4 soporta varios idiomas; el adaptador puede conservar o limitar esa capacidad segun su entrenamiento.
- No hay informacion sobre tool calling, function calling o capacidades de agente en el adaptador o en el modelo base; se asume que no estan habilitadas de forma explicita.

## Casos de uso

- Adaptacion a dominio especifico (p.ej. medicina): el nombre TradMed sugiere un uso en el ambito medico. Un adaptador LoRA permite especializar Phi-4 en terminologia, documentos clinicos o respuestas de salud con un coste de entrenamiento reducido.
- Traduccion automatica: si el adaptador fue entrenado para tareas de traduccion (MT en el nombre), puede usarse para traducir textos en ingles a otros idiomas, aunque no se confirma.
- Generacion de resumenes de documentos largos: gracias al contexto de 128 tokens, el modelo puede resumir informes extensos en una sola pasada.
- Asistente de codigo en un dominio especifico: ajustando el adaptador con ejemplos de codigo de una empresa o proyecto, se puede mejorar la generacion de codigo en ese contexto.
- Chat de soporte tecnico: con un adaptador entrenado en conversaciones de atencion al cliente, puede responder consultas frecuentes con un tono y vocabulario adecuados.
- Investigacion academica: permite experimentar con fine-tuning de modelos grandes en entornos con recursos limitados, ya que el adaptador ocupa solo 0.3 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones ni comparaciones con otros modelos. Se recomienda evaluar el adaptador en la tarea especifica para la que se entrena, ya que los benchmarks de Phi-4 original no son directamente aplicables al adaptador.

## Requisitos de hardware

- El adaptador LoRA requiere el modelo base Phi-4 en su version cuantizada de 4 bits para funcionar. Con esa cuantizacion, la VRAM necesaria para la inferencia se estima en 12-14 GB, suficiente para una GPU consumer como RTX 3090, RTX 4070 Ti o superior.
- Si se usa la version completa de Phi-4 (sin cuantizar), se necesitarian ~28-30 GB de VRAM, lo que requiere una GPU profesional como A100 o H100.
- El adaptador en si es ligero (0.3 GB) y no anade un coste significativo de memoria.
- Para el despliegue se puede utilizar vLLM, TGI (Text Generation Inference) o el propio pipeline de transformers con carga de adaptadores via `peft`. Tambien es compatible con Ollama si se convierte a GGUF, aunque no se proporciona un archivo GGUF.
- La latencia depende del hardware; con una RTX 4090 se puede obtener un throughput de 10-20 tokens/s para un modelo de 14B en 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi-4 (base) | 14B | 128k | MIT | safetensors | Modelo completo sin adaptador |
| TradMed/phi4_MT_epoch2_lora (este modelo) | 14B base + LoRA | 128k | Apache 2.0 | safetensors (adaptador) | Requiere cargar sobre base |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 License | safetensors | Modelo completo, menor capacidad de razonamiento |

La comparativa se limita a modelos similares en tamano y contexto. No se dispone de informacion sobre otros adaptadores LoRA de Phi-4 en el repositorio para comparar.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere cargar el modelo base `unsloth/phi-4-unsloth-bnb-4bit`; si no se dispone de ese modelo, el adaptador no funciona.
- No hay informacion sobre el conjunto de datos de entrenamiento del adaptador, por lo que no se puede evaluar sesgos especificos ni su comportamiento fuera del dominio de entrenamiento.
- El modelo base Phi-4 puede alucinar en tareas de razonamiento complejas; el adaptador no corrige este comportamiento.
- La licencia del adaptador es Apache 2.0, pero el modelo base tiene licencia MIT; es necesario revisar las condiciones de ambas para uso comercial.
- El modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas puede ser limitado, aunque Phi-4 soporta multiples idiomas.
- No se ha publicado ninguna evaluacion de calidad del adaptador, por lo que su rendimiento en tareas reales es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TradMed/phi4_MT_epoch2_lora
- Documentacion de Phi-4 Multimodal (referencia de arquitectura): https://huggingface.co/docs/transformers/v5.0.0/en/model_doc/phi4_multimodal
- Technical report de Phi-4: https://arxiv.org/html/2412.08905v1
- Codigo de LoRA (referencia): https://github.com/microsoft/LoRA
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
