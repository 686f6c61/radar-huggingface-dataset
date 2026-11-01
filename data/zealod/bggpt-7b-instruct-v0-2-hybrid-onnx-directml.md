# zealod/BgGPT-7B-Instruct-v0.2-hybrid-onnx-directml

## Resumen

BgGPT-7B-Instruct-v0.2-hybrid-onnx-directml es una distribucion cuantizada y reempaquetada del modelo BgGPT-7B-Instruct-v0.2 desarrollado por INSAIT (Sofia, Bulgaria), un LLM de 7.000 millones de parametros especializado en bulgaro e ingles y construido sobre la arquitectura Mistral 7B v0.2. El autor de esta variante, zealod, ha convertido los pesos originales a formato ONNX con cuantizacion HYBRID (Block-quantized MatMulNBits) y los ha optimizado para el proveedor de ejecucion Microsoft DirectML, lo que permite ejecutar el modelo en GPU de consumo bajo Windows sin necesidad de CUDA ni de PyTorch.

El problema que resuelve es la portabilidad: el modelo original requiere un stack Python/PyTorch con CUDA para aprovechar aceleracion por GPU, mientras que esta version funciona sobre DirectX 12 con GPUs integradas y discretas de Intel (Iris Xe, Arc), AMD (Radeon) y NVIDIA (GeForce), ademas de poder integrarse en aplicaciones C#/.NET y C++ mediante onnxruntime-genai. Es relevante para desarrolladores que despliegan inferencia local en equipos Windows heterogeneos o en entornos donde no hay drivers CUDA disponibles.

La ficha se centra en esta distribucion ONNX/DirectML; los detalles de entrenamiento y datos originales pertenecen al modelo base de INSAIT, del cual no se proporciona informacion detallada en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B v0.2), exportado a ONNX |
| Parametros totales | 7.000 millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HYBRID (Block-quantized MatMulNBits para DirectML) |
| Idiomas soportados | bulgaro (bg), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (optimizado para onnxruntime-genai-directml) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 7.000 millones de parametros basado en Mistral 7B v0.2, adaptado y afinado por INSAIT para bulgaro. Esta distribucion no modifica la arquitectura: exporta los pesos a ONNX y aplica cuantizacion HYBRID mediante el Model Builder de onnxruntime-genai, combinando operaciones MatMulNBits en bloque para el proveedor DirectML. El resultado es un grafo ONNX ejecutable en GPUs DirectX 12.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones de decodificacion especulativa ni atencion lineal en esta variante; el cambio tecnico principal es la cuantizacion HYBRID y la optimizacion para DirectML.

## Capacidades

- Generacion de texto conversacional en bulgaro e ingles, con formato de prompt instructivo tipo Mistral (`<s>[INST] ... [/INST]`).
- Tareas de correccion ortografica y de puntuacion, reescritura y generacion de texto en bulgaro, segun el ejemplo de la model card.
- Generacion de texto instructivo y respuesta a preguntas en los dos idiomas soportados.
- Ejecucion local en Python, C# (.NET) y C++ mediante onnxruntime-genai, sin dependencia de PyTorch.
- Aceleracion por GPU en Windows a traves de DirectML (Intel Iris Xe/Arc, AMD Radeon, NVIDIA GeForce).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Modo thinking explicito: no disponible.

## Casos de uso

- Correccion ortografica y de puntuacion en bulgaro: el modelo acepta instrucciones en formato `[INST]` para reescribir textos con errores, como se muestra en el ejemplo oficial de la model card; adecuado para herramientas de edicion y preprocesado de corpus.
- Asistentes conversacionales en bulgaro para escritorio Windows: al ejecutarse sobre DirectML, puede integrarse en aplicaciones nativas sin CUDA, cubriendo equipos con GPU integrada Intel Iris Xe o AMD Radeon.
- Despliegue en aplicaciones .NET/C#: onnxruntime-genai expone APIs para C#, lo que permite incorporar generacion de texto en aplicaciones empresariales Windows sin stack Python.
- Procesamiento de texto local con privacidad: al ejecutarse en el equipo del usuario sin llamadas a la nube, es apto para entornos con requisitos de confidencialidad (documentos internos en bulgaro).
- Prototipado rapido en equipos sin GPU NVIDIA: la compatibilidad con DirectX 12 permite probar un LLM de 7B en portatiles y estaciones con graficos integrados.
- Generacion de contenido y resumenes en bulgaro para publicacion web o soporte interno, aprovechando el ajuste instructivo del modelo base.
- Educacion y demostraciones: distribucion ligera (4,7 GB en el repositorio) para talleres y pruebas de concepto sobre inferencia local en Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 4,7 GB, lo que orienta a un consumo de memoria en el rango de 5-8 GB segun el contexto y el backend, aunque no se confirma en la documentacion.
- GPU compatibles: cualquier GPU con soporte DirectX 12, incluyendo Intel Iris Xe, Intel Arc, AMD Radeon y NVIDIA GeForce.
- Cabe en GPU de consumo: si, segun la model card, en GPUs integradas y discretas con DirectML; no se especifican modelos concretos ni minimos.
- Opciones de despliegue: onnxruntime-genai-directml (Python, C#/.NET, C++). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| BgGPT-7B-Instruct-v0.2-hybrid-onnx-directml (esta ficha) | ~7B | no disponible | bg, en | apache-2.0 | ONNX / DirectML |
| INSAIT-Institute/BgGPT-7B-Instruct-v0.2 (modelo base) | ~7B | no disponible | bg, en | apache-2.0 | safetensors / PyTorch |
| Mistral-7B-Instruct-v0.2 (arquitectura de referencia) | ~7B | no disponible | en (principal) | apache-2.0 | safetensors / PyTorch |

La comparativa se limita a parametros, idiomas, licencia y formato, ya que no se dispone de datos de rendimiento ni de contexto para esta variante. El modelo base y Mistral 7B v0.2 requieren stack PyTorch/CUDA, mientras que esta distribucion prioriza portabilidad en Windows via DirectML.

## Limitaciones y advertencias

- Modelo especializado en bulgaro e ingles; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base en la documentacion proporcionada.
- Riesgo de alucinacion inherente a los LLM de 7B; no hay evaluaciones publicadas en esta ficha.
- La cuantizacion HYBRID puede introducir perdida de precision respecto a los pesos originales en FP16/BF16; no se documenta el impacto medido.
- Dependencia de DirectML y Windows para la aceleracion por GPU; el rendimiento en otros sistemas operativos no esta documentado.
- La licencia apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base de INSAIT; conviene verificar la model card original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: baja validacion comunitaria.
- Longitud de contexto no documentada en esta distribucion; no asumir la del modelo base sin verificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zealod/BgGPT-7B-Instruct-v0.2-hybrid-onnx-directml
- Modelo base: https://huggingface.co/INSAIT-Institute/BgGPT-7B-Instruct-v0.2
- INSAIT Institute: https://insait.ai/
- Runtime onnxruntime-genai: no disponible en la informacion proporcionada (referenciado como `onnxruntime-genai-directml` en la model card).
