# usermma/Quark-270m-Base-i1-GGUF

## Resumen

Quark-270m-Base-i1-GGUF es una conversión al formato GGUF del modelo de lenguaje base Quark-270m-Base, desarrollado originalmente por ThingAI y convertido por el usuario usermma. Se trata de un modelo pequeño de 251.749.120 parámetros (≈251,7 millones), bilingüe en italiano e inglés, entrenado desde cero y liberado bajo licencia Apache 2.0. Esta versión está pensada para ejecutarse con llama.cpp, e incluye una cuantización agresiva IQ1_S con matriz de importancia (imatrix), lo que lo hace apto para entornos con recursos muy limitados. El modelo es de tipo causal-lm y se ofrece como una alternativa ligera para experimentación y fine-tuning en tareas de generación de texto en dos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (decoder-only) basada en Transformers |
| Parametros totales | 251.749.120 (≈251,7 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos de llama.cpp usan 2048 tokens) |
| Tipos de cuantizacion | GGUF; al menos IQ1_S con imatrix. Puede incluir otros niveles no especificados |
| Idiomas soportados | Italiano (it), Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos originales en safetensors constan como 251.749.120 parámetros) |

## Arquitectura y entrenamiento

El modelo es una conversión GGUF de ThingAI/Quark-270m-Base, aunque en el campo `base_model` del YAML se indica ThingAI/ARK-270m-Base; existe una discrepancia en la denominación del modelo original. Es un modelo de lenguaje causal (causal-lm) entrenado desde cero, según las etiquetas de la model card. No se proporcionan detalles sobre el número de capas, dimensiones de atención, composición del dataset, número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. La conversión se realizó con llama.cpp y la cuantización incluye una matriz de importancia (imatrix), que preserva mejor la calidad en cuantizaciones de muy baja precisión.

## Capacidades

- Generación de texto en italiano e inglés, con estilo de completado causal.
- Modelo base: no está alineado con instrucciones, por lo que no sigue indicaciones ni conversaciones estructuradas de forma natural.
- Compatible con el ecosistema llama.cpp: puede usarse mediante `llama-cli` o `llama-server`.
- No se mencionan capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento avanzado en la información disponible.

## Casos de uso

- Inferencia local en CPU para aplicaciones de escritorio: gracias a su tamaño reducido y a la cuantización IQ1_S, el modelo puede ejecutarse en ordenadores sin GPU mediante `llama-cli` o `llama-server`, para generar borradores de texto en italiano o inglés.
- Aplicaciones educativas de procesamiento de lenguaje natural: como modelo bilingüe it/en, puede utilizarse en entornos de enseñanza para ejercicios de generación de texto, análisis de frases o práctica de traducción asistida.
- Prototipado rápido de sistemas conversacionales: al ser un modelo base, es adecuado para fine-tuning en dominios específicos, como atención al cliente bilingüe, sin necesidad de infraestructura de entrenamiento costosa.
- Investigación en eficiencia de modelos: la conversión GGUF con cuantización IQ1_S e imatrix permite estudiar el impacto de cuantizaciones agresivas en modelos pequeños, comparando la calidad de salida con el modelo original en safetensors.
- Aplicaciones edge o IoT: su bajo consumo de memoria permite ejecutar el modelo en dispositivos embebidos o en entornos con restricciones de hardware, como Raspberry Pi, para generar respuestas cortas en dos idiomas.
- Integración en pipelines de texto ligeros: al estar en formato GGUF y ser compatible con llama.cpp, puede integrarse en servicios de prueba donde la latencia y el coste por token son prioritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 251.749.120 parámetros, por lo que la cuantización IQ1_S ocupa menos de 1 GB. En formato FP16, los pesos originales ocuparían en torno a 500 MB (cálculo basado en 2 bytes por parámetro).
- GPU recomendadas: no requiere GPU dedicada para la cuantización IQ1_S; puede ejecutarse en CPU, Apple Silicon, NVIDIA o AMD mediante llama.cpp.
- En CPU, se recomienda al menos 1-2 GB de RAM libre para la ejecución con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`). No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible: no se dispone de información comparativa de otros modelos de la misma categoría (tamaño similar, bilingüe it/en, formato GGUF) en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no ha sido entrenado para seguir instrucciones, por lo que su uso directo como asistente conversacional dará resultados pobres. Se recomienda fine-tuning.
- El modelo está entrenado exclusivamente en italiano e inglés; no soporta otros idiomas.
- La cuantización IQ1_S es de muy baja precisión, lo que puede degradar significativamente la calidad de la generación en comparación con el modelo original.
- No se dispone de información sobre sesgos, alucinaciones o seguridad. Como modelo pequeño, tiene mayor riesgo de alucinar y menor conocimiento enciclopédico.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe revisar los términos de la licencia y las atribuciones.
- El nombre del modelo base presenta una discrepancia: en el YAML se indica ThingAI/ARK-270m-Base, mientras que el texto de la model card menciona ThingAI/Quark-270m-Base. Se recomienda verificar el modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/usermma/Quark-270m-Base-i1-GGUF
- Modelo original (según la model card): https://huggingface.co/ThingAI/Quark-270m-Base
- Modelo original (según YAML): https://huggingface.co/ThingAI/ARK-270m-Base
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Versión Instruct del mismo autor: https://huggingface.co/usermma/Quark-270m-Instruct-i1-GGUF
