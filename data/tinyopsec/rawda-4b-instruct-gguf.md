# tinyopsec/rawda-4b-instruct-GGUF

## Resumen

rawda-4b-instruct es un modelo de lenguaje instructivo de 4.022 millones de parámetros (aproximadamente 4 B) construido sobre Qwen3-4B-Instruct-2507, según indica el propio autor de la model card. El modelo original lo publica abdallah3id, mientras que esta ficha corresponde a la versión cuantizada en formato GGUF distribuida por el usuario tinyopsec. Está orientado a generación de texto conversacional multilingüe, con etiquetas que destacan árabe y programación, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta publicación es práctica: al tratarse de una cuantización GGUF generada con llama.cpp, permite ejecutar un modelo de 4 B en hardware de consumo mediante runtimes como llama.cpp, Ollama, LM Studio o koboldcpp, sin necesidad de GPU de datacenter. El repositorio incluye 13 variantes de cuantización, desde F16 hasta Q2_K, lo que facilita ajustar el equilibrio entre calidad y memoria.

No obstante, la información pública disponible es muy limitada: la model card no detalla la longitud de contexto, la composición del dataset de entrenamiento, los idiomas exactos soportados ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B-Instruct-2507; detalles no disponibles) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible de forma explícita; las etiquetas indican multilingüe y árabe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es abdallah3id/rawda-4b-instruct, descrito en la model card como un modelo instructivo multilingüe basado en Qwen3-4B-Instruct-2507. La arquitectura subyacente es, por tanto, la de la familia Qwen3 de 4 B, un transformer denso, aunque el autor no especifica detalles adicionales sobre capas, cabezas de atención ni configuración interna. Esta versión concreta no introduce cambios arquitectónicos: es una cuantización del modelo base realizada con llama.cpp, que convierte los pesos originales a formato GGUF con distintos niveles de precisión.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card se limita a indicar que es un modelo instructivo multilingüe y recomienda evaluarlo antes de su uso en producción.

## Capacidades

- Generación de texto conversacional en formato instructivo, apto para diálogos multi-turno.
- Capacidades multilingües, con énfasis declarado en árabe según las etiquetas del repositorio.
- Generación de código, según la etiqueta "coding" del repositorio; no se detalla el alcance ni el rendimiento.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier implementación compatible con el formato.
- Integración con endpoints compatibles (etiqueta "endpoints_compatible").
- No se documenta soporte explícito de tool calling, function calling, agentes, modo thinking, visión ni audio.

## Casos de uso

- Asistente conversacional local en árabe: el modelo puede desplegarse en un portátil o estación de trabajo mediante Ollama o llama.cpp con la cuantización Q4_K_M, ofreciendo respuestas en árabe sin depender de servicios en la nube y sin enviar datos a terceros.
- Generación de código en entornos con recursos limitados: con 4 B de parámetros y cuantización de 4 bits, puede integrarse en editores o pipelines de CI/CD locales para autocompletado y generación de fragmentos, siempre que se valide su calidad real en el lenguaje objetivo.
- Prototipado rápido de aplicaciones de IA: al estar en GGUF y bajo Apache 2.0, sirve para validar flujos de conversación y prompts antes de migrar a modelos mayores, con un coste de infraestructura mínimo.
- Procesamiento de texto multilingüe en el borde (edge): despliegue en dispositivos con GPU de consumo o incluso CPU para tareas de resumen, reescritura o clasificación asistida por generación.
- Educación e investigación: modelo ligero para experimentos de evaluación de cuantizaciones, comparación de calidad entre Q2_K y F16, o estudios de rendimiento en hardware modesto.
- Chatbots internos de empresa: al ser Apache 2.0, permite uso comercial sin restricciones adicionales conocidas, adecuado para asistentes internos donde la confidencialidad de los datos es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos y overhead de contexto):
  - F16: en torno a 8 GB de pesos; recomendable 10-12 GB de VRAM.
  - Q8_0: en torno a 4,3 GB; recomendable 6-8 GB.
  - Q6_K: en torno a 3,3 GB; recomendable 5-6 GB.
  - Q5_K_M: en torno a 2,9 GB; recomendable 4-6 GB.
  - Q4_K_M (recomendada por el autor): en torno a 2,5 GB; recomendable 4-5 GB.
  - Q3_K_M: en torno a 2,1 GB; recomendable 3-4 GB.
  - Q2_K: en torno a 1,6 GB; viable en 2-3 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor concurrencia. Cualquier GPU con 4-6 GB de VRAM es suficiente para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones de 4 bits o inferiores; las de 8 bits y F16 requieren GPUs de gama media-alta o superior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI, que trabajan con otros formatos.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rawda-4b-instruct-GGUF (esta ficha) | 4,02 B | No disponible | GGUF | Apache 2.0 | Cuantizaciones de 2 a 16 bits; énfasis en árabe |
| Qwen3-4B-Instruct-2507 | 4 B | No disponible en esta ficha | Safetensors y otros | Apache 2.0 | Modelo base original; requiere conversión a GGUF para uso local |
| Llama 3.2 3B Instruct | 3 B | No disponible en esta ficha | Safetensors, GGUF | Llama 3.2 Community License | Alternativa de tamaño similar; licencia con restricciones de uso |
| Gemma 2 2B Instruct | 2 B | No disponible en esta ficha | Safetensors, GGUF | Gemma Terms of Use | Más pequeño; licencia con condiciones específicas |

La comparación se limita a parámetros, formato y licencia, ya que no hay datos de rendimiento publicados para rawda-4b-instruct que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad ni alineamiento; el modelo debe evaluarse antes de cualquier uso en producción.
- Riesgo de alucinación inherente a modelos de 4 B, especialmente en tareas de razonamiento complejo o conocimiento factual actualizado.
- La longitud de contexto no está documentada, lo que impide planificar tareas que dependan de ventanas largas.
- El soporte real de idiomas no está verificado más allá de las etiquetas del repositorio; conviene probar el rendimiento en castellano antes de usarlo.
- Aunque la licencia es Apache 2.0, el modelo base deriva de Qwen3-4B-Instruct-2507; conviene revisar las condiciones del modelo original antes de un despliegue comercial.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- El repositorio tiene 834 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/rawda-4b-instruct-GGUF
- Modelo base: https://huggingface.co/abdallah3id/rawda-4b-instruct
- Modelo original de referencia: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- koboldcpp: https://github.com/LostRuins/koboldcpp
