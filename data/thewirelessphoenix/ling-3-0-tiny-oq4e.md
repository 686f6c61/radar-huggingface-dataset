# TheWirelessPhoenix/Ling-3.0-tiny-oQ4e

## Resumen

Ling-3.0-tiny-oQ4e es una cuantización de 4 bits del modelo Ling-3.0-tiny, desarrollado originalmente por Ant Group (inclusionAI) y cuantizado por TheWirelessPhoenix mediante la herramienta oQ (oMLX v0.6.4) en formato MLX safetensors. Ling-3.0-tiny es un modelo de razonamiento híbrido de tipo Mixture-of-Experts (MoE) con 7,9 mil millones de parámetros totales y solo 1,3 mil millones activos por token, diseñado específicamente para despliegue en entornos de borde (edge) donde el coste de inferencia y la latencia son críticos.

La cuantización oQ4e reduce el tamaño del modelo a 4,6 GB, lo que permite ejecutarlo en hardware de consumo con VRAM limitada, manteniendo un equilibrio entre precisión y eficiencia. El modelo original se publicó bajo licencia MIT en agosto de 2026, lo que facilita su uso comercial y su integración en aplicaciones de producción. Esta versión cuantizada hereda las capacidades del modelo base: razonamiento complejo, generación de código, soporte para agentes y procesamiento de lenguaje multilingüe, aunque la información disponible no especifica los idiomas exactos ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_hybrid (MoE con capas alternadas de atención Kimi y MoE) |
| Parametros totales | 7.893.392.800 |
| Parametros activos | 1.300.000.000 (aprox., 1,3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (oQ4e), group size 64 |
| Idiomas soportados | no disponible (se espera multilingüe, probablemente chino e inglés) |
| Licencia | MIT (segun la documentacion del modelo original) |
| Formato de pesos | MLX safetensors (cuantizado con oQ) |

## Arquitectura y entrenamiento

Ling-3.0-tiny emplea una arquitectura híbrida denominada `bailing_hybrid`, que alterna capas de atención Kimi (una variante de atención lineal o de bajo coste) con capas de MoE. El modelo contiene 128 expertos enrutados, de los cuales 8 se activan por token junto con 1 experto compartido, lo que resulta en solo 1,3B parámetros activos de un total de 7,9B. Esta configuración permite un alto rendimiento por parámetro activo, reduciendo significativamente el coste computacional en inferencia.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación consultada. Sin embargo, al ser un modelo de razonamiento, es probable que haya sido entrenado con técnicas de aprendizaje por refuerzo para mejorar sus capacidades de razonamiento paso a paso y de uso de herramientas. La cuantización oQ4e aplicada por TheWirelessPhoenix utiliza una precisión mixta de 4 bits con grupo de tamaño 64, optimizada para preservar la calidad en las capas más sensibles.

## Capacidades

- Razonamiento complejo y multi-step: el modelo está diseñado para tareas de razonamiento lógico, matemático y de sentido común, con capacidad de "thinking mode" (modo de pensamiento) que genera cadenas de razonamiento internas.
- Generación de código: soporta la creación, depuración y explicación de código en múltiples lenguajes de programación, con buena comprensión de sintaxis y semántica.
- Soporte para agentes y tool calling: puede integrarse en pipelines de agentes que requieren llamadas a funciones, APIs o herramientas externas, gracias a su entrenamiento específico para interacción con herramientas.
- Capacidades multilingües: aunque no se especifican los idiomas exactos, al ser un modelo de Ant Group (empresa china) se espera un soporte sólido para chino e inglés, y probablemente otros idiomas.
- Eficiencia en inferencia: gracias a su arquitectura MoE con pocos parámetros activos, ofrece una latencia baja y un throughput alto, especialmente en hardware de gama media.
- Compatibilidad con MLX: al estar cuantizado en formato MLX, puede ejecutarse de forma nativa en Apple Silicon (Macs con chips M1/M2/M3) mediante el framework MLX, además de en GPUs convencionales a través de convertidores.

## Casos de uso

- Asistentes de razonamiento en dispositivos móviles: el tamaño reducido (4,6 GB) y la baja activación de parámetros permiten ejecutar el modelo en smartphones o tablets de gama alta, ofreciendo respuestas razonadas sin depender de la nube.
- Generación de código en entornos de desarrollo integrado (IDE): puede integrarse como autocompletado o asistente de programación en editores como VS Code, ayudando a los desarrolladores a escribir, revisar y refactorizar código con explicaciones detalladas.
- Automatización de atención al cliente con contexto largo: aunque la longitud de contexto no está confirmada, los modelos de razonamiento suelen manejar conversaciones multi-turno extensas; el modelo puede gestionar consultas complejas y derivar a herramientas externas cuando sea necesario.
- Agentes autónomos para automatización de tareas: su soporte para tool calling lo hace adecuado para construir agentes que interactúan con APIs, bases de datos o navegadores, ejecutando tareas de varios pasos de forma autónoma.
- Análisis de documentos técnicos y científicos: puede resumir, extraer conclusiones y responder preguntas sobre documentos largos, siempre que la ventana de contexto lo permita (dato no disponible).
- Prototipado rápido de aplicaciones de IA en Apple Silicon: al estar en formato MLX, los desarrolladores con Macs pueden desplegarlo localmente sin necesidad de GPUs dedicadas, acelerando el desarrollo y pruebas de aplicaciones de IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion consultada no incluye puntuaciones de MMLU, HumanEval, GSM8K u otros tests estandarizados para el modelo original ni para esta cuantizacion. Se recomienda consultar el repositorio oficial de Ant Group para obtener datos de rendimiento actualizados.

## Requisitos de hardware

- VRAM estimada: con 4,6 GB de tamaño de archivo y cuantización 4-bit, el modelo requiere aproximadamente 5-6 GB de VRAM para inferencia en FP16 (si se descomprime) o menos si se mantiene en 4-bit. En la práctica, una GPU con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente para ejecutarlo con margen.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, A100 (para despliegue en servidor), o cualquier GPU con al menos 8 GB de VRAM. También es compatible con Apple Silicon (M1 Pro o superior) gracias al formato MLX.
- Opciones de despliegue: al ser MLX safetensors, puede ejecutarse con el framework MLX en macOS. Para GPUs NVIDIA, se puede convertir a GGUF (ya existe una versión experimental en el repositorio del autor) y usar llama.cpp, Ollama o vLLM. También es posible usar TGI (Text Generation Inference) si se convierte a formato adecuado.
- Latencia y throughput: no se dispone de datos medidos. Dado que solo se activan 1,3B parámetros por token, se espera una latencia baja (del orden de decenas de milisegundos por token en GPUs modernas) y un throughput alto, pero estos valores dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-tiny (oQ4e) | 7,9B | 1,3B | no disponible | MIT | MLX safetensors |
| Qwen2.5-7B-Instruct | 7,6B | 7,6B (denso) | 128K | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8,0B | 8,0B (denso) | 128K | Llama 3.1 license | safetensors, GGUF |
| DeepSeek-V2-Lite | 16B | 2,4B | 128K | MIT | safetensors, GGUF |

Ling-3.0-tiny se posiciona como una alternativa más eficiente que los modelos densos de tamaño similar (Qwen2.5-7B, Llama-3.1-8B) al activar solo 1,3B parámetros, lo que reduce el coste computacional por token. Frente a DeepSeek-V2-Lite, tiene menos parámetros totales pero también menos activos, lo que lo hace más ligero para despliegue en borde. La licencia MIT es más permisiva que la de Llama-3.1, que tiene restricciones de uso comercial para empresas con más de 700M de usuarios mensuales.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente con datos en chino e inglés, puede presentar sesgos culturales o lingüísticos en otros idiomas. No se ha publicado una evaluación de sesgos específica.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no presente en su entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está confirmada en la documentación disponible; si es corta (por ejemplo, 32K), podría no ser adecuado para documentos muy extensos.
- Restricciones de licencia: aunque la licencia MIT permite uso comercial sin restricciones, es recomendable verificar la licencia exacta del modelo original en el repositorio oficial de Ant Group, ya que la información de HuggingFace no la especifica.
- Cuantizacion: la versión oQ4e puede presentar una ligera degradación de calidad frente al modelo en FP16, especialmente en tareas de razonamiento matemático o código. Se recomienda probar con el modelo original si la precisión es crítica.
- Soporte de la comunidad: al ser un modelo relativamente nuevo y una cuantización de un tercero, el ecosistema de herramientas y documentación puede ser limitado en comparación con modelos más establecidos.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/TheWirelessPhoenix/Ling-3.0-tiny-oQ4e
- Repositorio GGUF experimental del mismo autor: https://huggingface.co/TheWirelessPhoenix/Ling3.0-tiny-gguf-experimental
- Documentacion oficial del modelo Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Pagina de descarga en SourceForge: https://sourceforge.net/projects/ling-3-0-tiny/
- Ficha en LLM Releases: https://www.llm-releases.com/models/ling-3-0-tiny
- Guia de uso de GGUF: https://local-ai-zone.github.io/models/ling-3-0-tiny.html
