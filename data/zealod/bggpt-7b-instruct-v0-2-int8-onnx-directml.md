# zealod/BgGPT-7B-Instruct-v0.2-int8-onnx-directml

## Resumen

BgGPT-7B-Instruct-v0.2-int8-onnx-directml es una conversión del modelo búlgaro BgGPT-7B-Instruct-v0.2, desarrollado por el INSAIT Institute (Sofía, Bulgaria) y publicado en formato ONNX con cuantización INT8, optimizado para ejecutarse sobre Microsoft DirectML. El autor de la conversión es el usuario de HuggingFace `zealod`. El modelo base deriva de Mistral 7B v0.2, por lo que hereda una arquitectura transformer decoder-only de 7.000 millones de parámetros con atención de ventana deslizante.

El propósito de esta variante no es mejorar el modelo original, sino facilitar su despliegue en Windows sobre cualquier GPU compatible con DirectX 12 (Intel Iris Xe, Intel Arc, AMD Radeon y NVIDIA GeForce) sin necesidad de CUDA ni de PyTorch. La cuantización INT8 con `MatMulNBits` reduce el peso del repositorio a 7,9 GB y permite su uso mediante `onnxruntime-genai-directml` desde Python, C# (.NET) o C++.

Es relevante para desarrolladores que necesitan integrar un LLM especializado en búlgaro en aplicaciones de escritorio o entornos Windows con hardware gráfico heterogéneo, donde el stack CUDA no está disponible o no es deseable. El modelo está orientado a generación de texto conversacional y tareas de instrucción en búlgaro e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B v0.2) |
| Parametros totales | 7.000 millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 (block-quantized `MatMulNBits` para DirectML) |
| Idiomas soportados | búlgaro (bg), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8, optimizado para DirectML) |

## Arquitectura y entrenamiento

El modelo base es BgGPT-7B-Instruct-v0.2, un ajuste por instrucciones del modelo Mistral 7B v0.2 realizado por el INSAIT Institute. La arquitectura subyacente es un transformer decoder-only con atención de ventana deslizante, típica de la familia Mistral. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el ajuste del modelo búlgaro.

Esta variante concreta no introduce cambios arquitectónicos: es una conversión de pesos a ONNX con cuantización INT8 por bloques (`MatMulNBits`), generada con la herramienta `onnxruntime-genai` Model Builder en modo `INT8 DirectML`. El resultado es un grafo ONNX ejecutable mediante el execution provider `dml` de Microsoft DirectML, lo que permite inferencia acelerada por GPU en Windows sin CUDA. La cuantización INT8 busca preservar la gramática y terminología búlgaras, según indica el autor en la model card.

## Capacidades

- Generación de texto conversacional multi-turno en búlgaro e inglés.
- Seguimiento de instrucciones (modelo ajustado por instrucciones).
- Corrección ortográfica y de puntuación en búlgaro (ejemplo incluido en la model card).
- Ejecución local en GPU Windows vía DirectML, sin CUDA ni PyTorch.
- Integración desde Python (`onnxruntime-genai-directml`), C# (.NET) y C++.
- Compatibilidad con decodificación en streaming token a token.
- Soporte de parámetros de generación como `max_length`, `do_sample` y `repetition_penalty`.

No se documenta en la información disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Corrección ortográfica y de puntuación en búlgaro: el modelo puede recibir un texto con errores y devolver una versión corregida, tal como ilustra el ejemplo de la model card; adecuado para herramientas de edición o procesamiento de documentos en búlgaro.
- Asistentes conversacionales de escritorio en Windows: al ejecutarse sobre DirectML, puede integrarse en aplicaciones nativas sin depender de CUDA, lo que facilita su distribución en equipos con GPUs Intel, AMD o NVIDIA.
- Procesamiento de texto en búlgaro para pipelines locales: generación de resúmenes, reformulación o respuestas a preguntas sobre documentos en búlgaro, ejecutándose íntegramente en la máquina del usuario.
- Aplicaciones .NET/C#: la compatibilidad con `onnxruntime-genai-directml` permite incorporar el modelo en aplicaciones empresariales Windows escritas en C# sin necesidad de un servicio Python separado.
- Prototipado y demos en hardware consumer: al caber en GPUs integradas y dedicadas de gama media con DirectX 12, sirve para validar flujos de IA generativa en búlgaro antes de escalar a infraestructura mayor.
- Despliegue en entornos sin CUDA: útil en estaciones de trabajo o portátiles con gráficas Intel Arc o AMD Radeon donde el stack CUDA no está disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 7,9 GB en INT8; se requiere al menos esa cantidad de memoria gráfica más el espacio para el contexto y el runtime, por lo que se recomienda un mínimo de 8-10 GB de VRAM para uso cómodo.
- GPU compatibles: cualquier GPU con soporte DirectX 12, incluidas Intel Iris Xe (integrada), Intel Arc, AMD Radeon y NVIDIA GeForce.
- GPU consumer: el modelo está pensado explícitamente para GPUs consumer y integradas; no requiere A100 ni H100.
- Opciones de despliegue: `onnxruntime-genai-directml` (Python, C#/.NET, C++). No está pensado para vLLM, TGI ni llama.cpp, dado el formato ONNX/DirectML.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BgGPT-7B-Instruct-v0.2-int8-onnx-directml (este) | ~7B | no disponible | bg, en | Apache 2.0 | ONNX INT8 DirectML |
| INSAIT-Institute/BgGPT-7B-Instruct-v0.2 (base) | ~7B | no disponible | bg, en | Apache 2.0 | safetensors (PyTorch) |
| Mistral 7B Instruct v0.2 | ~7B | no disponible | en (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparación con Mistral 7B Instruct v0.2 se justifica porque el modelo base deriva de él; la diferencia principal es el ajuste por instrucciones en búlgaro. Frente al modelo base de INSAIT, esta variante solo cambia el formato y la precisión (ONNX INT8 para DirectML frente a pesos PyTorch), no las capacidades del modelo.

## Limitaciones y advertencias

- El modelo está especializado en búlgaro e inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Riesgo de alucinación inherente a los LLM de 7B; no se documentan evaluaciones de fidelidad factual.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Mistral 7B y de un ajuste búlgaro, puede heredar sesgos de ambos.
- Longitud de contexto: no se especifica en la información proporcionada, por lo que debe verificarse antes de usarlo en tareas con contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base original de INSAIT.
- Dependencia de DirectML: el modelo solo es eficiente en Windows con GPUs compatibles con DirectX 12; en Linux o entornos sin DirectML no es la opción adecuada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La cuantización INT8 puede introducir degradaciones de calidad respecto al modelo base en FP16/BF16; no se han publicado métricas comparativas.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/zealod/BgGPT-7B-Instruct-v0.2-int8-onnx-directml
- Modelo base: https://huggingface.co/INSAIT-Institute/BgGPT-7B-Instruct-v0.2
- INSAIT Institute: https://insait.ai/
