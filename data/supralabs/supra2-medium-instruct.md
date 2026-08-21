# SupraLabs/Supra2-Medium-Instruct

## Resumen

Supra2-Medium-Instruct es un modelo de lenguaje de 25 millones de parámetros, desarrollado por el laboratorio independiente SupraLabs, diseñado para tareas de chat e instrucción en inglés. Se trata de la versión fine-tuned del modelo base Supra2-Medium-Base, que fue preentrenado desde cero sobre 20.000 millones de tokens de texto web en inglés (dataset HuggingFaceFW/fineweb-edu). Su arquitectura sigue el diseño de Qwen3 (decoder-only) y emplea un tokenizador personalizado de 16.384 tokens.

El modelo destaca por su extrema ligereza: con solo 25 millones de parámetros y un contexto de 1.024 tokens, puede ejecutarse en CPU o GPU de consumo sin requisitos especiales. Sin embargo, sus capacidades reales son muy limitadas, como muestran los ejemplos de la model card: las respuestas son genéricas, con incoherencias y alucinaciones frecuentes. Es relevante como experimento académico o para prototipos de bajo coste, pero no es adecuado para aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (decoder-only) |
| Parametros totales | 25.383.296 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (según model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3, un transformer decoder-only con normalización y atención causal. No se especifican detalles sobre el número de capas, dimensiones o cabezas de atención. El tokenizador es personalizado, con un vocabulario de 16.384 tokens y utiliza un pre-tokenizador ByteLevel (configuración que se debe aplicar manualmente al cargar el tokenizador, como se muestra en el código de uso).

El entrenamiento consta de dos fases: un preentrenamiento sobre 20.000 millones de tokens de texto web en inglés (dataset `HuggingFaceFW/fineweb-eu`), seguido de un fine-tuning instructivo con una mezcla de datasets sintéticos y reales. La composición del fine-tuning es la siguiente:

- `smol-smoltalk` (77.5%)
- Sintético de aritmética básica (9.3%)
- `qwedsacf/grade-school-math-instructions` (4.5%)
- `no_robots` (3.4%)
- Style rewrite de `smol-smoltalk` (2.5%)
- Style rewrite de `no_robots` (1.5%)
- `b-mc2/wikihow_lists` templated (1.2%)

No se menciona el uso de RLHF, DPO ni ninguna técnica de alineamiento adicional.

## Capacidades

- Generación de texto conversacional: responde a prompts de chat siguiendo una plantilla de mensajes (ChatML).
- Razonamiento matemático básico: puede resolver sumas simples (por ejemplo, "2+2 = 4"), pero falla en problemas más complejos.
- Comprensión de texto limitada: las respuestas tienden a ser genéricas y con repeticiones, como se observa en los ejemplos de la model card.
- No dispone de soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio).
- Solo está entrenado en inglés; no hay soporte multilingüe.

## Casos de uso

- **Prototipos de chatbot educativo**: puede servir para demostrar conceptos de NLP en aulas o proyectos de aprendizaje, donde la calidad de las respuestas no es crítica y se busca un modelo mínimo que funcione en hardware básico.
- **Pruebas de integración en pipelines de ML**: al ser tan pequeño y rápido, es útil para validar infraestructuras de inferencia (vLLM, llama.cpp) o para testear el flujo de datos sin costes de cómputo.
- **Generación de texto de relleno en entornos sin GPU**: se puede ejecutar en CPU para completar formularios o generar contenido de baja calidad en aplicaciones internas no expuestas al usuario final.
- **Investigación sobre modelos de tamaño extremadamente reducido**: permite estudiar el comportamiento de arquitecturas modernas (como Qwen3) con un número de parámetros mínimo, sirviendo de base para comparaciones de escalado.
- **Aplicaciones de demostración en eventos o hackathons**: su tamaño permite descargarlo e integrarlo en minutos, facilitando la creación de demos rápidas de generación de texto.
- **Pruebas de alineamiento y fine-tuning**: al ser ligero, se puede usar para experimentar con técnicas de fine-tuning instructivo en hardware de consumo, sin necesidad de GPUs de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas estándar (MMLU, HumanEval, GSM8K, etc.), por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- **VRAM estimada**: al tener solo 25,3 millones de parámetros, en bfloat16 ocupa aproximadamente 50 MB de memoria. Cabe en cualquier GPU, incluso integradas, y también se ejecuta en CPU con memoria RAM estándar.
- **GPU recomendada**: no se requiere GPU; puede funcionar en CPU. Si se usa GPU, cualquier modelo (desde una GTX 1650 hasta una RTX 4090) es suficiente.
- **Compatibilidad con consumer GPU**: sí, totalmente compatible con GPUs de consumo, incluso con iGPU.
- **Opciones de despliegue**: compatible con Transformers (con `trust_remote_code`), vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y cualquier framework que soporte modelos de Transformers.
- **Latencia y throughput**: al ser tan pequeño, la latencia es del orden de milisegundos por token en CPU, y de microsegundos en GPU. No se han publicado cifras oficiales, pero el modelo es extremadamente rápido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con otros modelos de tamaño similar (por ejemplo, TinyLlama, SmolLM-135M, etc.). Además, no hay información pública sobre el rendimiento relativo de Supra2-Medium-Instruct frente a alternativas. Por tanto, la comparativa se limita a las características técnicas generales:

| Modelo | Parámetros | Contexto | Licencia | Idioma | Disponibilidad |
|---|---|---|---|---|---|
| Supra2-Medium-Instruct | 25M | 1K | Apache-2.0 | Inglés | Hugging Face |
| TinyLlama-1.1B | 1.1B | 2K | Apache-2.0 | Multilingüe | Hugging Face |
| SmolLM-135M | 135M | 2K | Apache-2.0 | Multilingüe | Hugging Face |

Nota: los datos de TinyLlama y SmolLM son de conocimiento general, no de la información proporcionada. No se ha podido verificar su rendimiento en comparación con Supra2-Medium-Instruct.

## Limitaciones y advertencias

- **Calidad de generación muy limitada**: los ejemplos de la model card muestran respuestas largas, repetitivas y con incoherencias. El modelo no es apto para tareas que requieran precisión o coherencia.
- **Riesgo elevado de alucinación**: dado su tamaño y entrenamiento limitado, el modelo tiende a inventar información, especialmente en temas complejos.
- **Contexto muy corto**: solo admite 1.024 tokens de entrada, lo que impide manejar conversaciones largas o documentos extensos.
- **Solo inglés**: no soporta otros idiomas, por lo que no es útil para aplicaciones multilingües.
- **Licencia Apache-2.0**: permite uso comercial y modificación, pero se debe tener en cuenta que el modelo no es robusto para producción.
- **Requiere configuración manual del tokenizador**: el pre-tokenizador ByteLevel debe configurarse manualmente al cargar el tokenizador, como se muestra en el código de uso; no funciona de forma estándar.
- **Sin soporte de herramientas**: no hay función de tool calling, ni integración con APIs externas.

## Enlaces

- Modelo en Hugging Face: [SupraLabs/Supra2-Medium-Instruct](https://huggingface.co/SupraLabs/Supra2-Medium-Instruct)
- Modelo base: [SupraLabs/Supra2-Medium-Base](https://huggingface.co/SupraLabs/Supra2-Medium-Base)
- Página de SupraLabs: [supra-labs.com](https://supra-labs.com/)
- Organización en Hugging Face: [SupraLabs](https://huggingface.co/SupraLabs)
