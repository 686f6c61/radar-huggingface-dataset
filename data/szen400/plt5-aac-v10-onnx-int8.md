# Szen400/plt5-aac-v10-onnx-int8

## Resumen

`Szen400/plt5-aac-v10-onnx-int8` es una conversión a ONNX con cuantización selectiva INT8 del modelo `PLT5-Small v10`, una variante afinada de `allegro/plt5-small` (la familia T5 adaptada al polaco por Allegro). El autor, Szen400, la publica como un paquete de inferencia ligero orientado a entornos con memoria muy restringida, concretamente servidores gratuitos con un límite de 512 MB de RAM como Render Free Tier, ejecutando `onnxruntime` sin necesidad de PyTorch.

El modelo resuelve un problema de despliegue: el checkpoint original en safetensors requiere un stack de PyTorch que no cabe en planes gratuitos de hosting. Esta versión separa el modelo en dos grafos ONNX (encoder y decoder) con cuantización `MatMul QUInt8` en las capas seleccionadas, embeddings en FP16 y exclusión explícita de las capas sensibles `wo` y de la atención dinámica, lo que reduce el paquete a unos 192,4 MB.

Es relevante para desarrolladores que necesiten un modelo de generación texto-a-texto en polaco con huella de memoria mínima y sin dependencias pesadas. La información publicada es escasa: no hay datos de benchmarks, licencia explícita ni resultados de evaluación, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (PLT5-Small), exportado a ONNX |
| Parametros totales | no disponible (modelo base `allegro/plt5-small`, tamano no especificado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 selectivo: `MatMul QUInt8` en encoder y decoder (excluyendo capas `wo` y atencion dinamica), embeddings en FP16 |
| Idiomas soportados | polaco (`pl`) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder-decoder de la familia T5, en concreto el modelo `allegro/plt5-small`, adaptado al polaco. Sobre esa base, el autor ha creado una variante afinada denominada `PLT5-Small v10`, de la que no se documentan en la informacion disponible ni el volumen de datos de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la exportacion y cuantizacion: el modelo se divide en dos grafos ONNX independientes (encoder de 79,19 MB y decoder de 109,82 MB, este ultimo incluyendo `lm_head`), se aplica cuantizacion `MatMul QUInt8` de forma selectiva excluyendo las capas `wo` y la atencion dinamica para preservar calidad, y los embeddings se mantienen en FP16. El paquete incluye ademas un `prompt_config.json` con la plantilla de prompt de la version v10. El objetivo declarado es funcionar en `onnxruntime` sin PyTorch en servidores con 512 MB de RAM.

## Capacidades

- Generacion de texto texto-a-texto (pipeline `text2text-generation`) en polaco.
- Uso previsto orientado a comunicacion aumentativa y alternativa (AAC), segun las etiquetas y el nombre del modelo.
- Inferencia ligera en CPU mediante `onnxruntime`, sin dependencia de PyTorch.
- Tokenizacion compatible con la libreria ligera `tokenizers` a traves de `tokenizer.json`.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al polaco segun la metadata.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Comunicacion aumentativa y alternativa (AAC): el modelo esta etiquetado como `aac` y afinado para generar texto en polaco a partir de entradas del usuario; su tamano reducido permite integrarlo en aplicaciones asistivas desplegadas en infraestructura gratuita.
- Despliegue en planes gratuitos de hosting: con un paquete de ~192 MB y ejecucion via `onnxruntime`, cabe en servidores con limite de 512 MB de RAM como Render Free Tier, sin instalar PyTorch.
- Prototipado rapido de servicios de generacion de texto en polaco: permite levantar una API de texto-a-texto con dependencias minimas antes de invertir en infraestructura mayor.
- Procesamiento por lotes en CPU: al no requerir GPU ni framework de deep learning completo, es adecuado para tareas de generacion de texto en entornos con recursos limitados.
- Educacion e investigacion: sirve como ejemplo practico de exportacion ONNX con cuantizacion selectiva de un modelo T5 y de las decisiones de que capas excluir para preservar calidad.
- Integracion en aplicaciones de escritorio o edge con presupuesto de memoria estricto, usando `onnxruntime` como unico runtime de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el paquete ocupa ~192,4 MB en disco; el autor lo disena para servidores con limite de 512 MB de RAM, por lo que la inferencia en CPU es viable con ese presupuesto.
- GPU recomendadas: no disponibles; el modelo esta pensado para inferencia en CPU con `onnxruntime`.
- GPU de consumo: no se documenta compatibilidad ni rendimiento en GPUs como RTX 4090; el objetivo declarado es CPU.
- Opciones de despliegue: `onnxruntime` (con la libreria `tokenizers` para el tokenizador); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Szen400/plt5-aac-v10-onnx-int8` | no disponible (base PLT5-Small) | no disponible | ONNX INT8 selectivo | no disponible | Optimizado para 512 MB de RAM, solo polaco |
| `allegro/plt5-small` | no disponible | no disponible | safetensors (PyTorch) | no disponible | Modelo base original; requiere stack PyTorch |
| Otras variantes PLT5 de Allegro | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de un uso comercial debe verificarse la licencia del modelo base `allegro/plt5-small` y la del checkpoint derivado.
- Solo soporta polaco; no es adecuado para otros idiomas.
- No hay benchmarks ni evaluacion de calidad publicados; se desconoce el impacto de la cuantizacion selectiva en la calidad frente al modelo original.
- La cuantizacion INT8, aunque excluye capas sensibles, puede introducir degradacion en tareas exigentes; no se documenta su magnitud.
- El modelo esta pensado para inferencia en CPU via `onnxruntime`; no se garantiza funcionamiento ni rendimiento en otros runtimes o GPUs.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables a cualquier modelo de lenguaje afinado.
- Repositorio con cero descargas y cero likes; no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-27) es posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Szen400/plt5-aac-v10-onnx-int8
- Modelo base: https://huggingface.co/allegro/plt5-small
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
