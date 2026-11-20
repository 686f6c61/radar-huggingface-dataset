# taobao-mnn/Qwen3-0.6B-MNN

## Resumen

Qwen3-0.6B-MNN es la versión cuantizada y empaquetada para el runtime MNN del modelo denso Qwen3-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo mantiene taobao-mnn y su objetivo es ofrecer una distribución lista para ejecutar inferencia en CPU (y potencialmente otros backends MNN) sin necesidad de infraestructura GPU, manteniendo el formato nativo del motor MNN.

El modelo base es un transformer denso de 0,6 mil millones de parámetros con 28 capas y dimensión oculta de 1024, perteneciente a la familia Qwen3, que incorpora modos de conversación con y sin razonamiento explícito (thinking / non-thinking). Esta versión aplica cuantización HQQ de 4 bits con grupo de 64 a las capas lineales del modelo de lenguaje y 8 bits a la cabeza de salida, con escalas en FP16, lo que reduce el peso del repositorio a 1,5 GB.

Su relevancia actual radica en que permite desplegar un modelo de instrucciones de la familia Qwen3 en entornos con recursos muy limitados —dispositivos de borde, móviles, portátiles sin GPU o contenedores CPU-only— usando el ecosistema MNN de Alibaba, que está optimizado para inferencia de bajo consumo en ARM y x86.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), 28 capas, dimension oculta 1024 |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4-bit grupo 64 (capas lineales), HQQ 8-bit grupo 64 (cabeza de salida), escalas FP16; pesos compartidos de embedding en 8-bit |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizer `tokenizer.mtok`, configuracion `config.json` / `llm_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso decoder-only de la familia Qwen3, con 28 capas y dimensión oculta de 1024, entrenado por el equipo Qwen de Alibaba. Qwen3 incorpora un modo dual de conversación: razonamiento explícito (thinking) y respuesta directa (non-thinking). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

Esta distribución concreta no reentrena el modelo: aplica cuantización post-entrenamiento con HQQ (Half-Quadratic Quantization) a 4 bits en las capas lineales del transformer y a 8 bits en la cabeza de salida, manteniendo las escalas en FP16 y compartiendo los pesos del embedding con la cabeza de salida en 8 bits. El resultado se exporta al formato de grafo y pesos de MNN, con una configuración de ejecución por defecto orientada a CPU con 4 hilos, `precision=low` y `memory=low`. La exportación se validó con MNN 3.6.2 (commit `b0239771b07b317a258fbc384683bbd540741406`) sobre CPU x64, comprobando alineación de mapeo FP32, saludos, aritmética, traducción y pruebas de humo con la configuración por defecto.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Modo de razonamiento (thinking) y modo de respuesta directa (non-thinking), heredados de Qwen3.
- Modelo ajustado a instrucciones (instruction-tuned).
- Razonamiento aritmético básico (validado en las pruebas de exportación).
- Traducción entre los idiomas soportados (validada en las pruebas de exportación).
- Ejecución en CPU con bajo consumo de memoria mediante MNN.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Visión o audio: no disponible (modelo solo de texto).

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo puede ejecutarse en CPU con 4 hilos y configuración de baja memoria mediante MNN, lo que lo hace adecuado para integrarse en aplicaciones móviles o embebidas que necesiten un chat local sin conexión.
- Traducción automática ligera chino-inglés: las pruebas de exportación incluyen casos de traducción, y el tamaño reducido permite desplegarlo en servidores sin GPU para traducción de baja latencia en textos cortos.
- Clasificación y extracción de información en pipelines de datos: al ser un modelo de instrucciones pequeño, puede usarse para tareas de etiquetado, resumen corto o extracción de campos en lotes masivos donde el coste por token en GPU sería prohibitivo.
- Prototipado rápido y pruebas de integración: sirve como modelo de referencia para validar pipelines MNN-LLM antes de escalar a modelos Qwen3 mayores con el mismo formato de despliegue.
- Educación y demostraciones: su huella de 1,5 GB y su ejecución CPU-only permiten distribuirlo en entornos docentes o demos sin infraestructura especializada.
- Filtrado y moderación de contenido en el borde: puede ejecutarse localmente para preclasificar texto antes de enviarlo a modelos mayores, reduciendo costes de red y preservando privacidad.
- Generación de respuestas en asistentes de terminal o CLI: integrable mediante `llm_demo` de MNN para herramientas de línea de comandos que necesiten generación de texto local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que la configuración por defecto es CPU. El repositorio ocupa 1,5 GB en disco con pesos HQQ 4-bit/8-bit.
- GPU recomendadas: no disponible en la información proporcionada; el flujo validado es CPU x64 con 4 hilos.
- ¿Cabe en GPU consumer? No hay datos específicos de despliegue en GPU para esta distribución MNN; el objetivo declarado es ejecución en CPU.
- Opciones de despliegue: MNN (`llm_demo`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen3-0.6B-MNN (este) | 0,6B | no disponible | HQQ 4-bit / 8-bit | Apache 2.0 | MNN |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | FP16/BF16 original | Apache 2.0 | safetensors (transformers) |
| Otras distribuciones cuantizadas de Qwen3-0.6B (GGUF, etc.) | 0,6B | no disponible | variable | Apache 2.0 | GGUF / llama.cpp |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- Modelo de 0,6B parámetros: capacidad de razonamiento y conocimiento factual limitados en comparación con modelos mayores de la misma familia; riesgo elevado de alucinación en preguntas abiertas o especializadas.
- Idiomas soportados limitados a chino e inglés; el rendimiento en castellano no está validado y probablemente sea deficiente.
- La cuantización HQQ 4-bit introduce pérdida de precisión respecto al modelo base; no se han publicado métricas de degradación en la información disponible.
- Longitud de contexto no especificada en la información proporcionada; debe consultarse `llm_config.json` del repositorio antes de usarlo en tareas de contexto largo.
- El formato MNN no es directamente compatible con transformers, vLLM ni llama.cpp; requiere el runtime MNN y su proceso de compilación.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-0.6B; conviene revisar la licencia upstream.
- Validación limitada: las pruebas documentadas cubren alineación FP32, saludos, aritmética, traducción y smoke tests en CPU x64; no hay evidencia publicada de robustez en producción ni de comportamiento en otros backends.
- No se documentan capacidades de tool calling ni de agente; no asumir su disponibilidad sin verificar.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-0.6B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- ModelScope: https://modelscope.cn/models/MNN/Qwen3-0.6B-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia: https://huggingface.co/taobao-mnn/Qwen3-0.6B-MNN/blob/main/LICENSE
