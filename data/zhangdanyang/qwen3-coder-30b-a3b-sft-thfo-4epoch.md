# Zhangdanyang/Qwen3-Coder-30B-A3B-SFT-THFO-4epoch

## Resumen

Qwen3-Coder-30B-A3B-SFT-THFO-4epoch es un ajuste fino (SFT) del modelo Qwen3-Coder-30B-A3B, publicado por el usuario Zhangdanyang en Hugging Face. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 30.532.122.624 parametros totales y aproximadamente 3.000 millones de parametros activos por token, derivado de la familia Qwen3-Coder de Alibaba. El sufijo "THFO" y "4epoch" sugiere un entrenamiento supervisado de cuatro epocas sobre un dataset no documentado publicamente.

El modelo hereda la base de Qwen3-Coder, orientada a generacion de codigo, razonamiento agentico y tool calling. Sin embargo, la informacion publicada en Hugging Face es muy limitada: no se especifican los datos de entrenamiento del ajuste, la licencia, los idiomas soportados ni los resultados de benchmarks. El repositorio esta marcado como restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face para acceder a los pesos.

Es relevante para desarrolladores que quieran experimentar con variantes ajustadas de Qwen3-Coder para tareas de codigo, pero debe tratarse con cautela: es un modelo de investigacion de un autor individual, con escasa documentacion, pocas descargas (13) y sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (transformer con mezcla de expertos) |
| Parametros totales | 30.532.122.624 (~30,5 B) |
| Parametros activos | ~3 B (estimado segun nomenclatura A3B; no confirmado en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (pesos publicados en fp8); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 MoE, un transformer con capas de mezcla de expertos que activa aproximadamente 3.000 millones de parametros por token sobre un total de 30,5 mil millones. Los pesos se distribuyen en formato safetensors con cuantizacion fp8, lo que reduce el tamano del repositorio (304,1 GB, incluyendo posibles checkpoints intermedios) frente a una version en bf16.

El ajuste se realizo mediante SFT (supervised fine-tuning) durante 4 epocas, segun indica el nombre del modelo. No se dispone de informacion sobre el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las inherentes a la arquitectura Qwen3-Coder original.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada de la base Qwen3-Coder.
- Razonamiento agentico y multi-step reasoning, orientado a tareas de ingenieria de software.
- Soporte de tool calling y function calling (capacidad presumible de la base, no verificada en esta variante).
- Capacidades multilingues: no confirmadas para este ajuste concreto.
- Generacion de texto general y respuesta a instrucciones.
- No se documentan capacidades de vision, audio ni modo thinking explicito para esta variante.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests unitarios o sugerir refactorizaciones, aprovechando su base Qwen3-Coder y su bajo numero de parametros activos (~3 B), que reduce el coste de inferencia.
- Asistentes de programacion en IDE: con un tamano total de 30,5 B y activacion MoE de ~3 B, es viable desplegarlo en entornos con GPUs de gama alta para autocompletado y chat contextual sobre repositorios.
- Agentes autonomos de resolucion de issues: su herencia de Qwen3-Coder permite encadenar tool calls para leer ficheros, ejecutar comandos y proponer parches en flujos de trabajo tipo SWE-bench.
- Migracion y traduccion de codigo entre lenguajes: util para reescribir modulos legacy (por ejemplo, de Python 2 a Python 3 o de Java a Kotlin) con supervision humana.
- Generacion de documentacion tecnica: a partir de codigo fuente, el modelo puede producir docstrings, README y comentarios explicativos en pipelines de documentacion automatizada.
- Experimentacion academica: como punto de partida para estudiar el efecto del SFT de 4 epocas sobre un modelo MoE de codigo, comparando con la base original Qwen3-Coder-30B-A3B.
- Educacion y tutoria de programacion: explicacion de errores, sugerencias de ejercicios y correccion de codigo en entornos de aprendizaje, con la debida supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp8: aproximadamente 30-32 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, se recomienda al menos 40-48 GB para contextos moderados.
- VRAM estimada en bf16 (si se convierte): aproximadamente 61 GB para pesos, recomendandose 80 GB o mas.
- GPUs recomendadas: A100 80 GB, H100 80 GB, H200, o configuraciones multi-GPU (2x RTX 4090 24 GB no bastan para fp8 completo sin offloading; 2x A6000 48 GB o 4x RTX 4090 podrian ser viables con paralelismo).
- En GPU de consumo: no cabe en una unica RTX 4090 (24 GB) en fp8 sin cuantizacion adicional; requeriria cuantizaciones GGUF de 4 bits (no publicadas) o offloading a CPU.
- Opciones de despliegue: vLLM (soporte MoE y fp8), SGLang, TensorRT-LLM, TGI. llama.cpp/Ollama requeririan conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles; dependeran del hardware y del backend. La activacion de ~3 B parametros por token sugiere un throughput superior al de un modelo denso de 30 B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-SFT-THFO-4epoch | 30,5 B | ~3 B (estimado) | no disponible | no disponible | Gated en HF |
| Qwen3-Coder-30B-A3B (base) | 30,5 B | ~3 B | 256 K (segun ficha oficial de Qwen) | Apache 2.0 (segun Qwen) | Publico en HF |
| Qwen2.5-Coder-32B-Instruct | 32,5 B | denso | 128 K | Apache 2.0 | Publico en HF |
| DeepSeek-Coder-V2-Lite | 15,7 B | 2,4 B | 128 K | DeepSeek License | Publico en HF |

La comparativa se basa en caracteristicas conocidas de los modelos de referencia; los datos de rendimiento de la variante ajustada no estan disponibles, por lo que no es posible establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Documentacion minima: no se especifican dataset de SFT, licencia, idiomas ni benchmarks, lo que impide evaluar su calidad frente a la base original.
- Licencia no disponible: al no declararse, no se puede garantizar el uso comercial; ademas, el acceso es restringido y requiere aceptar condiciones en Hugging Face.
- Riesgo de sobreajuste: el entrenamiento de 4 epocas sobre un dataset desconocido puede degradar capacidades generales o introducir sesgos especificos del corpus utilizado.
- Riesgo de alucinacion: como todo modelo de codigo, puede generar APIs inexistentes, imports erroneos o codigo que compila pero no funciona; se requiere validacion con tests.
- Autor individual y pocas descargas (13): no hay evidencia de comunidad, mantenimiento ni validacion independiente.
- Contexto no documentado: se desconoce si conserva la ventana de 256 K de la base o si se ha reducido durante el ajuste.
- Sesgos: no evaluados; el modelo hereda los sesgos de los datos de Qwen3-Coder y del dataset de SFT no publicado.
- Repositorio de 304,1 GB: el gran tamano puede incluir checkpoints intermedios, lo que complica la descarga y el despliegue.
- No apto para produccion sin evaluacion previa: al carecer de benchmarks y de licencia clara, no se recomienda su uso en entornos productivos sin auditoria.

## Enlaces

- Hugging Face: https://huggingface.co/Zhangdanyang/Qwen3-Coder-30B-A3B-SFT-THFO-4epoch
- Modelo base Qwen3-Coder-30B-A3B (referencia): https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio Qwen3-Coder en GitHub: https://github.com/QwenLM/Qwen3-Coder
- Blog de Qwen3-Coder: https://qwen.ai/blog
- Paper de Qwen3 (tecnico): no disponible en la informacion proporcionada
