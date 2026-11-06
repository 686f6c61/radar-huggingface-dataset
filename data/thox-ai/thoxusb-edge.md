# Thox-ai/ThoxUSB-Edge

## Resumen

ThoxUSB-Edge es un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-0.8B desarrollado por Thox-ai (THOX.ai) para su programa de dispositivos THOX. Se distribuye como pesos en safetensors y como una cuantización GGUF Q4_K_M de 529 MB, pensada para ejecutarse en dispositivos de borde (edge) con al menos 1 GB de RAM. El modelo se presenta como un asistente on-device y enrutador de herramientas (tool-routing), con un enfoque local-first.

El dato de parámetros presenta una discrepancia interna en la información disponible: el autor declara 873M en la model card, mientras que el recuento real de safetensors es de 752.393.024 parámetros. La ficha refleja ambos valores sin resolver la contradicción. La arquitectura declarada es qwen3_5_text (transformer de texto), con licencia Apache-2.0 y soporte exclusivo del idioma inglés.

La relevancia del modelo reside en su tamaño reducido y su empaquetado listo para llama.cpp y Ollama, lo que permite desplegarlo en hardware muy limitado. No obstante, el propio autor lo marca explícitamente como EXPERIMENTAL: no publica registro de entrenamiento, benchmarks medidos ni validación on-device de esta build.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer de texto, según tag del repo) |
| Parámetros totales | 752.393.024 (safetensors); el autor declara 873M en la model card |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (529 MB); safetensors en precisión original |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 1.504.827.608 B) y GGUF Q4_K_M (529.288.992 B); incluye Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del base Qwen/Qwen3.5-0.8B, un transformer de texto de la familia Qwen 3.5. Según los tags del repositorio, la arquitectura interna se identifica como qwen3_5_text. El autor indica que el ajuste se realizó sobre corpus propios de chat y de uso de agentes/herramientas del programa THOX, pero no detalla la composición del dataset, el número de tokens, ni si hubo etapas de RLHF o DPO.

No se publica registro de entrenamiento, hiperparámetros, curvas de pérdida ni validación on-device para esta build. La model card describe el procedimiento únicamente de forma genérica, remitiendo a lo publicado en el momento del lanzamiento. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de la arquitectura heredada del base.

## Capacidades

- Generación de texto conversacional en inglés, orientada a asistente on-device.
- Enrutamiento de herramientas (tool-routing) y uso de agentes, según el corpus de ajuste declarado (agent/tool-use corpora).
- Conversación multi-turno mediante plantilla de chat propia (chat_template.jinja).
- Ejecución local en dispositivos de borde mediante llama.cpp y Ollama.
- Capacidades multilingües: limitadas; solo se declara inglés y el autor advierte de menor calidad en otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles según la información proporcionada.

## Casos de uso

- Asistente local en dispositivos de borde: el modelo cabe en un GGUF Q4_K_M de 529 MB y requiere al menos 1 GB de RAM, por lo que puede ejecutarse en placas embebidas o mini-PC para tareas de conversación básica sin conexión.
- Enrutamiento de comandos y herramientas en un dispositivo THOX: el ajuste sobre corpus de agent/tool-use permite mapear peticiones del usuario a acciones o funciones predefinidas dentro del ecosistema del dispositivo.
- Prototipado rápido de asistentes conversacionales: gracias a la disponibilidad en Ollama (`ollama run hf.co/Thox-ai/ThoxUSB-Edge:Q4_K_M`), se puede integrar en demos y pruebas de concepto con muy poca infraestructura.
- Procesamiento de texto en entornos con conectividad intermitente o requisitos de privacidad: al ser local-first, los datos no salen del dispositivo, lo que encaja en escenarios de despliegue aislado.
- Clasificación y respuestas guiadas en inglés: para tareas de formato corto (resúmenes breves, respuestas a preguntas simples) donde el coste computacional importa más que la precisión factual.
- Base para experimentación e investigación en modelos pequeños: sirve como punto de partida para estudiar ajustes finos de bajo coste y comparar comportamiento frente al base Qwen3.5-0.8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existe ningún resultado THOX GATE49 ni benchmark publicado para este modelo, y que debe tratarse como experimental.

## Requisitos de hardware

- VRAM/RAM estimada: al menos 1 GB de RAM según el autor; el GGUF Q4_K_M ocupa 529 MB, por lo que un host con 1-2 GB de memoria libre es suficiente para inferencia.
- GPU recomendadas: no disponible; el modelo está orientado a CPU y dispositivos de borde, no a GPU de datacenter.
- Compatibilidad con GPU de consumo: no disponible; por su tamaño podría ejecutarse en cualquier GPU de consumo, pero no hay validación publicada.
- Opciones de despliegue: llama.cpp (llama-cli) y Ollama con el Modelfile incluido; requiere una build de llama.cpp/Ollama con soporte para esta arquitectura.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxUSB-Edge | 752M (safetensors) / 873M declarados | no disponible | Apache-2.0 | Hugging Face, GGUF Q4_K_M, Ollama | Ajuste fino experimental de Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B (base) | ~0.8B | no disponible | no disponible en la información | Hugging Face | Modelo base sin ajuste THOX |
| Alternativas de ~1B parámetros | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Build no validada: el autor declara que el comportamiento on-device no se ha medido; hay que verificar las salidas antes de confiar en ellas.
- Modelo pequeño: tiende a cometer errores factuales y a producir respuestas seguras pero incorrectas (alucinaciones).
- Sesgos: reflejan los datos de entrenamiento, mayoritariamente en inglés; la calidad en otros idiomas es inferior.
- Cuantización: el GGUF Q4_K_M intercambia precisión por tamaño, con la consiguiente pérdida de exactitud.
- Idiomas: solo se declara inglés; no se recomienda su uso en castellano ni en otros idiomas sin validación.
- Licencia: Apache-2.0 permite uso comercial, pero se mantienen la licencia y el NOTICE originales; conviene revisar el texto completo de la licencia.
- Uso fuera de alcance: no apto para decisiones críticas de seguridad, médicas o legales sin supervisión humana, ni para control desatendido de dispositivos físicos sin paso de confirmación.
- Discrepancia de parámetros: la model card declara 873M frente a los 752.393.024 reales de safetensors; conviene no asumir cifras de rendimiento derivadas del recuento declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxUSB-Edge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Descarga directa del GGUF: https://huggingface.co/Thox-ai/ThoxUSB-Edge/blob/main/ThoxUSB-Edge.Q4_K_M.gguf
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
