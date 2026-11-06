# zealod/BgGPT-Gemma-2-2.6B-IT-v1.0-hybrid-onnx-directml

## Resumen

BgGPT-Gemma-2-2.6B-IT-v1.0-hybrid-onnx-directml es una conversion a formato ONNX con cuantizacion HYBRID del modelo búlgaro INSAIT-Institute/BgGPT-Gemma-2-2.6B-IT-v1.0, publicado por el usuario zealod. El modelo original lo desarrolla INSAIT (Sofia, Bulgaria) sobre la arquitectura Gemma 2 de Google, con 2.600 millones de parametros y ajuste fino de instrucciones orientado al búlgaro. Esta version concreta no modifica los pesos de forma sustancial: los exporta a ONNX y los optimiza para el proveedor de ejecucion Microsoft DirectML, de modo que la inferencia pueda correr en cualquier GPU compatible con DirectX 12 bajo Windows.

El problema que resuelve es de despliegue, no de modelado: elimina la dependencia de CUDA y de PyTorch y permite ejecutar un LLM búlgaro compacto en GPUs integradas (Intel Iris Xe), GPUs de Intel Arc, AMD Radeon o NVIDIA GeForce, usando el runtime onnxruntime-genai-directml. El repositorio ocupa 3,6 GB e incluye pesos ONNX cuantizados en bloque mediante MatMulNBits (esquema HYBRID: parte de las capas en GPU y parte en CPU).

Es relevante para desarrolladores que necesiten un asistente en búlgaro dentro de aplicaciones de escritorio Windows o entornos .NET/C++ sin infraestructura CUDA, y como ejemplo practico de pipeline de conversion ONNX con onnxruntime-genai Model Builder. La licencia es la Gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), exportado a ONNX |
| Parametros totales | 2,6 mil millones (2.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HYBRID (MatMulNBits cuantizado en bloque para DirectML) |
| Idiomas soportados | búlgaro (bg), inglés (en) |
| Licencia | gemma |
| Formato de pesos | ONNX (runtime onnxruntime-genai-directml) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 2, un transformer decoder-only de 2.600 millones de parametros. El modelo base BgGPT-Gemma-2-2.6B-IT-v1.0 fue desarrollado por INSAIT partiendo de Gemma 2 y sometido a ajuste fino supervisado de instrucciones (sufijo IT) con foco en búlgaro; no se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del corpus ni si se aplicaron fases de RLHF o DPO.

Esta publicacion es una conversion tecnica: se ha usado onnxruntime-genai Model Builder en modo HYBRID DirectML para producir grafos ONNX con operadores MatMulNBits cuantizados en bloque. El esquema HYBRID reparte la ejecucion entre GPU y CPU, lo que segun el autor preserva mejor la gramatica y la terminologia en búlgaro que una cuantizacion puramente GPU. No se documentan innovaciones de atencion ni decodificacion especulativa propias; las capacidades de razonamiento y generacion son las del modelo base.

## Capacidades

- Generacion de texto conversacional en búlgaro e inglés, con plantilla de turnos Gemma (`<start_of_turn>user` / `<start_of_turn>model`).
- Ajuste fino de instrucciones: sigue ordenes directas del tipo "corrige la ortografia y la puntuacion del siguiente texto".
- Correccion ortografica y de puntuacion, reescritura y edicion de texto en búlgaro.
- Generacion de texto general y respuesta a preguntas en los dos idiomas declarados.
- Inferencia sin PyTorch ni CUDA, integrable en Python, C# (.NET) y C++ mediante onnxruntime-genai.
- Ejecucion en GPU DirectX 12 (Intel Iris Xe, Intel Arc, AMD Radeon, NVIDIA GeForce).
- No se documentan en la informacion disponible capacidades de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Correccion y edicion de textos en búlgaro: el modelo acepta una instruccion con el texto a revisar y devuelve la version corregida; es el ejemplo que documenta el propio autor y encaja con su ajuste de instrucciones.
- Asistentes de escritorio Windows en búlgaro: al ejecutarse sobre DirectML, puede integrarse en aplicaciones nativas .NET o C++ sin instalar CUDA ni drivers de NVIDIA, lo que simplifica la distribucion a usuarios finales.
- Despliegue en equipos sin GPU dedicada: funciona en iGPU Intel Iris Xe o en GPUs AMD Radeon, cubriendo portatiles y estaciones de oficina donde un modelo mayor no cabria.
- Preprocesado linguistico en pipelines de datos: normalizacion, correccion y reescritura de corpus búlgaros antes de indexarlos o analizarlos.
- Atencion al cliente en búlgaro de baja latencia: al ser un modelo de 2,6B, el coste por token es bajo y permite respuestas interactivas en local, sin enviar datos a la nube.
- Prototipado y evaluacion de LLM en entornos Windows: sirve como banco de pruebas de onnxruntime-genai y DirectML antes de escalar a modelos mayores o a otros proveedores de ejecucion.
- Aplicaciones offline o con requisitos de privacidad: al ejecutarse en local sobre ONNX, los textos no salen del equipo, adecuado para documentos internos en búlgaro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 3,6 GB, por lo que el conjunto de pesos ONNX cuantizados ocupa ese orden de magnitud y el esquema HYBRID reparte parte de la carga en CPU y RAM del sistema.
- GPU compatibles: cualquier GPU con soporte DirectX 12, es decir, Intel Iris Xe, Intel Arc, AMD Radeon y NVIDIA GeForce, segun el autor.
- Cabe en GPU de consumo: si, al estar disenado precisamente para GPUs integradas y de gama media; no requiere A100 ni H100.
- Opciones de despliegue: onnxruntime-genai-directml (Python via `pip install onnxruntime-genai-directml`, C#/.NET y C++). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta publicacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| BgGPT-Gemma-2-2.6B-IT-v1.0-hybrid-onnx-directml (esta ficha) | 2,6B | no disponible | bg, en | ONNX (DirectML) | gemma |
| INSAIT-Institute/BgGPT-Gemma-2-2.6B-IT-v1.0 (modelo base) | 2,6B | no disponible | bg, en | safetensors | gemma |
| Gemma 2 2B (Google) | 2,6B aprox. | no disponible | multilingue | safetensors, GGUF | gemma |

La diferencia principal frente al modelo base es el formato y el runtime: misma calidad esperada de pesos, pero ejecutable sin CUDA. Frente a Gemma 2 original, el ajuste de INSAIT esta especializado en búlgaro. No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas variantes.

## Limitaciones y advertencias

- Modelo pequeno (2,6B): menor capacidad de razonamiento complejo y mayor riesgo de alucinacion que modelos de decenas de miles de millones de parametros.
- Cobertura linguistica limitada a búlgaro e inglés; el rendimiento en castellano no esta garantizado ni documentado.
- La cuantizacion HYBRID puede introducir perdida de precision respecto al modelo base en safetensors; no se han publicado evaluaciones comparativas.
- Dependencia de Windows y DirectX 12: el formato DirectML no es portable a Linux ni a entornos sin GPU compatible.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la Gemma Terms of Use de Google, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente del funcionamiento.
- El autor de la conversion no es INSAIT; los posibles fallos de exportacion ONNX no estan cubiertos por el desarrollador original.
- No se documentan mitigaciones de sesgo ni filtros de seguridad especificos en esta publicacion.

## Enlaces

- Hugging Face (esta publicacion): https://huggingface.co/zealod/BgGPT-Gemma-2-2.6B-IT-v1.0-hybrid-onnx-directml
- Modelo base: https://huggingface.co/INSAIT-Institute/BgGPT-Gemma-2-2.6B-IT-v1.0
- INSAIT Institute: https://insait.ai/
- Runtime onnxruntime-genai (DirectML): no disponible enlace directo en la informacion proporcionada
