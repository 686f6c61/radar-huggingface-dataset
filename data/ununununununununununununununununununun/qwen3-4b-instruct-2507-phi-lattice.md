# ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice

## Resumen

qwen3-4b-instruct-2507-phi-lattice es una build experimental del modelo Qwen/Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario ununununununununununununununununununun en HuggingFace. Se trata de una cuantización GGUF con poda de pesos aplicada mediante un proceso denominado "phi-lattice", que combina cuantización no uniforme y poda por umbral sobre las matrices de proyección lineal. El resultado se distribuye como un único fichero GGUF de 4,0 GB en cuantización Q8_0, pensado para su uso en Ollama, llama.cpp o LM Studio.

El modelo base es un transformer denso de 4.022.468.096 parámetros (aproximadamente 4B), perteneciente a la familia Qwen3 en su variante Instruct actualizada de julio de 2025 (sufijo 2507). Esta build no introduce cambios en la arquitectura ni en el entrenamiento: se limita a una pasada de optimización post-entrenamiento sobre el checkpoint original, con una esparsidad declarada de aproximadamente el 8 % de los pesos y una relación señal-ruido de cuantización (SQNR) de aproximadamente 18,6 dB.

La relevancia de esta ficha es acotada: se trata de un artefacto de prueba subido para evaluación y comparación contra el checkpoint base, con 22 descargas y sin métricas publicadas. Resulta útil como ejemplo de pipeline de cuantización con poda sobre un modelo pequeño, pero no debe considerarse una distribución estable ni validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507); no se detalla en la model card |
| Parametros totales | 4.022.468.096 (checkpoint base en safetensors); el GGUF Q8_0 con poda pesa 4,0 GB |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado); el proceso phi-lattice aplica cuantizacion no uniforme y poda por umbral (~8 % de esparsidad) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero qwen3-4b-instruct-2507-optimized-q8_0.gguf, 4,0 GB); incluye Modelfile, template y params para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint Qwen/Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4B parámetros. La model card de esta build no describe la arquitectura interna (número de capas, dimensión oculta, cabezas de atención ni mecanismo de atención), por lo que esos detalles deben consultarse en la ficha del modelo base. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del corpus ni las etapas de alineación (RLHF, DPO u otras) del checkpoint original.

La innovación técnica de esta publicación es exclusivamente la pasada de optimización post-entrenamiento "phi-lattice": se aplica cuantización no uniforme junto con poda por umbral sobre las matrices de proyección lineal, alcanzando aproximadamente un 8 % de esparsidad de pesos con una SQNR declarada de aproximadamente 18,6 dB antes de exportar a GGUF. No se especifica qué capas exactas se podan, la metodología de calibración, el tamaño del conjunto de calibración ni si la poda es estructurada o no estructurada. Tampoco se indica si hubo recuperación (fine-tuning) posterior a la poda para compensar la pérdida de precisión.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag `conversational` confirma el uso previsto como modelo de chat instruct.
- Razonamiento y código: heredadas del checkpoint Qwen3-4B-Instruct-2507; la model card no detalla capacidades específicas ni verificadas en esta build.
- Tool calling y function calling: no confirmado en la información proporcionada para esta build.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada para esta build.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, visión o audio: no disponible en la información proporcionada.
- Plantilla de chat y configuración de stop tokens incluidas mediante los ficheros `Modelfile`, `template` y `params` para Ollama.

## Casos de uso

- Evaluación comparativa de cuantización: usar el GGUF Q8_0 con poda frente al checkpoint base Qwen3-4B-Instruct-2507 para medir la degradación introducida por el 8 % de esparsidad y la cuantización no uniforme, con la SQNR de 18,6 dB como referencia de partida.
- Pruebas locales en Ollama: el repositorio incluye Modelfile y plantilla de chat, de modo que puede lanzarse directamente con `ollama run hf.co/...` para validar el comportamiento conversacional en un entorno de escritorio.
- Prototipado de asistentes conversacionales en local: al ocupar 4,0 GB en Q8_0, cabe en equipos con GPU de consumo y permite iterar sobre prompts y plantillas de chat sin depender de APIs externas.
- Integración en llama.cpp o LM Studio: el formato GGUF permite cargar el modelo en aplicaciones de escritorio y pipelines en C/C++ que no soportan safetensors, útil para demos y entornos embebidos.
- Comparación de pipelines de poda: servir como referencia reproducible para ingenieros que evalúan técnicas de pruning sobre modelos de 4B antes de aplicarlas a modelos mayores.
- Docencia y experimentación académica: modelo pequeño y de licencia Apache 2.0 que permite estudiar el efecto de la esparsidad en la calidad de generación sin coste de infraestructura elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara una SQNR de aproximadamente 18,6 dB para la pasada de cuantización y poda, métrica que mide la fidelidad de reconstrucción de pesos y no el rendimiento de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 4,0 GB; con overhead de contexto y caché KV, se recomienda al menos 6-8 GB de VRAM para uso cómodo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el segmento profesional, A100 o H100 sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM en Q8_0; con cuantizaciones menores (no publicadas en este repo) cabría en 6 GB.
- Opciones de despliegue: Ollama (soporte directo desde HuggingFace mediante el Modelfile incluido), llama.cpp, LM Studio. vLLM y TGI no se mencionan en la información proporcionada para este artefacto GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| qwen3-4b-instruct-2507-phi-lattice | ~4,0B (con ~8 % de poda) | no disponible | GGUF Q8_0 | Apache 2.0 | Build experimental, 22 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.022.468.096 | no disponible en esta ficha | safetensors (checkpoint original) | Apache 2.0 | Modelo oficial de referencia |
| Otras cuantizaciones GGUF de Qwen3-4B-Instruct-2507 | ~4,0B | depende del build | GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) | Apache 2.0 | Distribuciones comunitarias habituales; no verificadas en la información proporcionada |

La comparación relevante es contra el checkpoint base sin poda: esta build introduce una pérdida de información no cuantificada en benchmarks y, por tanto, no puede asumirse paridad de calidad con el original. Frente a otras cuantizaciones GGUF estándar (sin poda), la diferencia es la esparsidad del 8 %, que reduce el tamaño pero añade un riesgo adicional de degradación.

## Limitaciones y advertencias

- Build experimental: la propia model card indica que se sube "for testing and evaluation"; no es una distribución estable ni validada para producción.
- Sin benchmarks: no hay evaluación de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, por lo que se desconoce la degradación real frente al checkpoint base.
- Poda no documentada: no se especifica qué capas se podan, la metodología de calibración ni si hay recuperación posterior; el 8 % de esparsidad y los 18,6 dB de SQNR son los únicos datos objetivos.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la poda; no cuantificado.
- Idiomas soportados: no declarados en la información proporcionada; no debe asumirse cobertura multilingüe sin verificación.
- Contexto: no disponible en la información proporcionada; conviene consultar la ficha de Qwen3-4B-Instruct-2507 antes de diseñar aplicaciones con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el artefacto; la responsabilidad de validación recae en el integrador.
- Trazabilidad limitada: autor anónimo, sin paper, sin repositorio de código y con solo 22 descargas; no hay comunidad que haya reportado comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ollama (runtime recomendado por el autor): https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
