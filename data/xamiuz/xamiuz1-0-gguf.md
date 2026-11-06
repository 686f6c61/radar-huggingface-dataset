# xamiuz/xamiuz1.0-GGUF

## Resumen

xamiuz1.0-GGUF es un modelo de lenguaje conversacional derivado de Meta-Llama-3.1-8B-Instruct, afinado (fine-tuning) y convertido a formato GGUF por el usuario xamiuz utilizando la herramienta Unsloth. El modelo cuenta con 8.030.261.312 parámetros totales (aproximadamente 8 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio aptos para despliegue en hardware de consumo. Se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M, lo que reduce el peso del repositorio a 4,9 GB y facilita su ejecución con llama.cpp y Ollama.

El modelo hereda la arquitectura transformer decoder-only de la familia Llama 3.1, aunque la model card no detalla el proceso de afinado ni los datos utilizados. La única información técnica explícita es que el comportamiento del token BOS fue ajustado para compatibilidad con GGUF y que el entrenamiento se realizó con Unsloth, herramienta que acelera el fine-tuning de modelos Llama. No se especifican los idiomas soportados ni la licencia, lo que limita la evaluación de su idoneidad para producción.

Su relevancia es limitada en el ecosistema actual: se trata de un modelo recién publicado (noviembre de 2026 según los metadatos) sin descargas ni interacciones registradas, sin benchmarks publicados y sin documentación sobre el dataset de entrenamiento. Resulta útil únicamente como ejemplo de pipeline de fine-tuning con Unsloth y conversión a GGUF, o para experimentación local con llama.cpp, pero no como base para aplicaciones en producción sin una evaluación previa exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B) |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda presumiblemente 128K de Llama 3.1, no confirmado) |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Llama 3.1 8B Instruct, con 8.030.261.312 parámetros. El autor indica que fue afinado y convertido a GGUF mediante Unsloth, una librería que optimiza el fine-tuning de modelos Llama mediante kernels personalizados y reducción de memoria. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se detalla si se realizó un ajuste de la capa de embeddings o del tokenizador más allá del ajuste del token BOS para compatibilidad con GGUF.

La única innovación técnica documentada es el ajuste del comportamiento del token BOS para que el modelo funcione correctamente en llama.cpp. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones. El proceso de cuantización Q4_K_M es estándar en el ecosistema llama.cpp y ofrece un equilibrio entre tamaño (4,9 GB) y calidad, aunque no se han publicado evaluaciones de la degradación de rendimiento respecto al modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del afinado sobre Llama 3.1 8B Instruct.
- Razonamiento general y respuesta a instrucciones (presumiblemente, aunque no verificado).
- Generación de código y matemáticas (capacidad heredada de Llama 3.1, no evaluada en este fine-tune).
- Soporte de tool calling / function calling: no confirmado en la model card; Llama 3.1 lo soporta nativamente, pero el fine-tune podría haberlo alterado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; se desconoce qué idiomas conserva tras el fine-tune.
- Capacidades especiales (thinking mode, visión, audio): no documentadas. La mención a `llama-mtmd-cli` en la model card es genérica de la plantilla de Unsloth y no implica que este modelo sea multimodal.

## Casos de uso

- Experimentación local con llama.cpp: el modelo puede ejecutarse con `llama-cli -hf xamiuz/xamiuz1.0-GGUF --jinja` para probar conversaciones en un equipo de consumo, gracias a su cuantización Q4_K_M de 4,9 GB.
- Despliegue rápido con Ollama: la model card incluye un Modelfile, lo que permite crear un modelo local con `ollama create` y servir una API compatible con OpenAI para prototipos.
- Evaluación de pipelines de fine-tuning con Unsloth: sirve como caso de estudio de cómo afinar Llama 3.1 8B y convertirlo a GGUF, útil para desarrolladores que quieran replicar el flujo.
- Pruebas de compatibilidad de tokenizadores y tokens BOS: el ajuste documentado del BOS lo hace útil para validar integraciones con llama.cpp y detectar problemas de plantillas de chat.
- Generación de texto conversacional offline: para aplicaciones de escritorio o entornos sin conexión donde se requiera un chatbot local sin depender de APIs externas.
- Base para comparativas de cuantización: permite medir la degradación de calidad de Q4_K_M frente al modelo original en tareas concretas, siempre que se disponga del checkpoint original para comparar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantización Q4_K_M publicada (4,9 GB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el ámbito profesional, A100 o H100 para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070, etc.). También puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. No se ha publicado soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de contexto. En una RTX 4090 se puede esperar un throughput del orden de decenas de tokens por segundo para un modelo de 8B en Q4_K_M, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| xamiuz1.0-GGUF | 8,03B | no disponible | no disponible | GGUF (Q4_K_M) | Hugging Face, 0 descargas |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128K | Llama 3.1 Community License | safetensors, GGUF | Hugging Face, ampliamente adoptado |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face, muy adoptado |
| Qwen2.5-7B-Instruct | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Hugging Face, muy adoptado |

La comparativa se basa en datos públicos de los modelos alternativos; para xamiuz1.0-GGUF no hay benchmarks ni licencia declarada, lo que impide una comparación de rendimiento rigurosa. Frente a Llama 3.1 8B Instruct, la principal diferencia es el fine-tune y la cuantización, pero se desconoce si mejora o degrada las capacidades originales. Mistral y Qwen2.5 ofrecen licencias permisivas (Apache 2.0) que xamiuz1.0 no declara.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, al derivar de Llama 3.1, hereda potencialmente las restricciones de la Llama 3.1 Community License, que exige atribución y limita usos.
- Sin benchmarks publicados: no hay evidencia de que el fine-tune mejore o mantenga las capacidades del modelo base; el riesgo de degradación es real.
- Dataset de entrenamiento desconocido: no se puede evaluar sesgos, contaminación de datos ni calidad del afinado.
- Riesgo de alucinación: inherente a los modelos de 8B y no mitigado por información adicional; sin evaluación, no se puede cuantificar.
- Idiomas no documentados: se desconoce si el fine-tune conserva el multilingüismo de Llama 3.1 o lo ha reducido a un solo idioma.
- Contexto no confirmado: aunque Llama 3.1 soporta 128K, el fine-tune y la cuantización podrían haber alterado la ventana efectiva; no hay pruebas publicadas.
- Tool calling no verificado: la plantilla de chat y el soporte de funciones podrían haberse visto afectados por el ajuste del token BOS y el fine-tune.
- Modelo sin adopción: 0 descargas y 0 likes en el momento de la ficha; no hay retroalimentación de la comunidad ni informes de errores.
- Repositorio de 4,9 GB con un único archivo Q4_K_M: no se ofrecen otras cuantizaciones (Q5, Q8, FP16) para comparar calidad.

## Enlaces

- Hugging Face: https://huggingface.co/xamiuz/xamiuz1.0-GGUF
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue): https://ollama.com
- Meta-Llama-3.1-8B-Instruct (modelo base): https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
