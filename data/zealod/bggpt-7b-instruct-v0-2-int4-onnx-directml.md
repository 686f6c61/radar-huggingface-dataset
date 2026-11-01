# zealod/BgGPT-7B-Instruct-v0.2-int4-onnx-directml

## Resumen

BgGPT-7B-Instruct-v0.2-int4-onnx-directml es una versión cuantizada a INT4 y exportada a formato ONNX del modelo BgGPT-7B-Instruct-v0.2, desarrollado originalmente por INSAIT (Instituto de Informática, Inteligencia Artificial y Tecnología de Sofía, Bulgaria). Se trata de un modelo de lenguaje de 7.000 millones de parámetros basado en la arquitectura Mistral 7B v0.2, ajustado por instrucciones y especializado en búlgaro, aunque mantiene competencia en inglés. Esta variante concreta ha sido convertida por el usuario zealod mediante el Model Builder oficial de `onnxruntime-genai` con el flag `-p int4 -e dml`.

El objetivo de esta conversión es habilitar la inferencia sobre GPUs de Windows mediante Microsoft DirectML, un backend que funciona sobre DirectX 12 y que no requiere CUDA. Esto amplía la compatibilidad a tarjetas gráficas integradas y discretas de Intel (Iris Xe, Arc), AMD (Radeon) y NVIDIA (GeForce), incluyendo equipos sin GPU dedicada de gama alta. La cuantización INT4 reduce el tamaño del repositorio a unos 4,3 GB, aproximadamente un 75 % menos que los pesos originales en precisión completa, según la model card.

El modelo resulta relevante para desarrolladores que necesitan desplegar un LLM de 7B en entornos Windows de consumo, con integración directa en Python, C# (.NET) o C++ sin dependencia de PyTorch ni de toolchains CUDA. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la ficha no documenta benchmarks propios de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mistral (7B), según model card |
| Parametros totales | 7.000 millones (aproximado, indicado como "7-billion" en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (AWQ / block-quantized para DirectML, según model card) |
| Idiomas soportados | búlgaro (bg), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para DirectML, runtime `onnxruntime-genai-directml`) |

## Arquitectura y entrenamiento

La model card indica que el modelo base es BgGPT-7B-Instruct-v0.2 de INSAIT, construido sobre la arquitectura Mistral 7B v0.2. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado más allá del ajuste por instrucciones implícito en el nombre "Instruct". Tampoco se especifican innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

La contribución técnica de esta variante es la conversión a ONNX con cuantización INT4 y la optimización para el Execution Provider de Microsoft DirectML mediante `onnxruntime-genai` Model Builder. Esta ruta de conversión preserva el grafo del transformer y aplica cuantización por bloques, lo que permite ejecutar el modelo sobre DirectX 12 sin CUDA. La model card afirma que la cuantización INT4 reduce el tamaño aproximadamente un 75 % manteniendo la calidad del búlgaro, aunque no aporta métricas que lo respalden.

## Capacidades

- Generación de texto conversacional en búlgaro e inglés, con ajuste por instrucciones.
- Tareas de corrección ortográfica y de puntuación, ejemplificadas en la model card con un prompt en búlgaro.
- Generación de texto autoregresiva con control de parámetros de búsqueda (`max_length`, `do_sample`, `repetition_penalty`).
- Inferencia en streaming token a token mediante `onnxruntime-genai` en Python, C# (.NET) y C++.
- Ejecución sobre GPUs Windows compatibles con DirectX 12 (Intel Iris Xe, Intel Arc, AMD Radeon, NVIDIA GeForce) sin CUDA.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo de texto.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Corrección ortográfica y de puntuación en búlgaro: el modelo puede recibir un texto con errores y devolver una versión corregida, tal como muestra el ejemplo de la model card con el prompt `<s>[INST] Поправи правописните и пунктуационните грешки... [/INST]`. Es adecuado por su ajuste específico al búlgaro y su formato de instrucciones.

- Asistentes conversacionales en búlgaro sobre escritorio Windows: al ejecutarse con DirectML, puede integrarse en aplicaciones de escritorio nativas (C#/.NET, C++) que corran en equipos sin GPU NVIDIA, aprovechando GPUs integradas Intel Iris Xe o AMD Radeon.

- Procesamiento de texto en local para privacidad: al no requerir conexión a la nube ni PyTorch, permite desplegar un LLM en estaciones de trabajo Windows con datos sensibles, manteniendo el contenido en el equipo.

- Prototipado rápido en Python sin CUDA: desarrolladores que trabajan en portátiles Windows sin GPU dedicada pueden usar `onnxruntime-genai-directml` para probar prompts y flujos conversacionales sin configurar toolchains CUDA.

- Generación de contenido editorial en búlgaro: redacción asistida de borradores, resúmenes o reformulaciones en búlgaro, aprovechando el ajuste por instrucciones del modelo base.

- Integración en aplicaciones .NET corporativas: el ejemplo en C# de la model card muestra que puede embeberse en servicios o aplicaciones de escritorio .NET mediante `Microsoft.ML.OnnxRuntimeGenAI`, sin dependencias de Python.

- Evaluación comparativa de backends de inferencia: útil para medir latencia y throughput de un 7B INT4 sobre DirectML frente a otras rutas (llama.cpp, vLLM) en el mismo hardware Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,3 GB en INT4; se puede estimar un consumo de VRAM en el rango de 5-6 GB para pesos más overhead de runtime, aunque no se confirma en la model card.
- GPU recomendadas: según la model card, funciona en Intel Iris Xe, Intel Arc, AMD Radeon y NVIDIA GeForce compatibles con DirectX 12. No se especifican modelos concretos ni generaciones mínimas.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs integradas y discretas de gama media con al menos ~6 GB de VRAM disponibles; no se confirma un mínimo exacto.
- Opciones de despliegue: `onnxruntime-genai-directml` (Python, C#/.NET, C++). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante ONNX/DirectML.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BgGPT-7B-Instruct-v0.2-int4-onnx-directml (este) | ~7B | no disponible | ONNX INT4 / DirectML | Apache 2.0 | HuggingFace (zealod) |
| INSAIT-Institute/BgGPT-7B-Instruct-v0.2 (base) | ~7B | no disponible | safetensors / PyTorch | Apache 2.0 | HuggingFace (INSAIT) |
| Mistral 7B v0.2 Instruct | ~7B | no disponible en esta ficha | safetensors, GGUF (comunidad) | Apache 2.0 | HuggingFace (Mistral AI) |

La comparación con Mistral 7B v0.2 se justifica porque la model card indica que BgGPT está basado en dicha arquitectura. No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo entrenado principalmente en búlgaro e inglés, es previsible un sesgo lingüístico y cultural hacia el contexto búlgaro.
- Riesgo de alucinación: no cuantificado en la model card; como todo LLM de 7B, es susceptible de generar contenido plausible pero incorrecto, especialmente fuera de dominios bien representados.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica; el soporte se limita a búlgaro e inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base INSAIT-Institute/BgGPT-7B-Instruct-v0.2, ya que esta conversión hereda sus condiciones.
- Dependencia de DirectML: la variante solo es ejecutable con `onnxruntime-genai-directml`; no es portable a otros runtimes sin reconversión.
- Compatibilidad de hardware: requiere GPU compatible con DirectX 12 y drivers actualizados; el rendimiento puede variar significativamente entre fabricantes.
- Métricas ausentes: no hay benchmarks publicados para esta conversión, por lo que la afirmación de "alta calidad del búlgaro" tras la cuantización INT4 no está respaldada por datos en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zealod/BgGPT-7B-Instruct-v0.2-int4-onnx-directml
- Modelo base: https://huggingface.co/INSAIT-Institute/BgGPT-7B-Instruct-v0.2
- INSAIT Institute: https://insait.ai/
