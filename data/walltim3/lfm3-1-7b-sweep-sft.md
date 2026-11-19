# Walltim3/lfm3-1.7b-sweep-sft

## Resumen

lfm3-1.7b-sweep-sft es un ajuste fino experimental del modelo base LiquidAI/LFM3-1.7B-Base, publicado por el usuario Walltim3 en Hugging Face. El objetivo del proyecto es especializar un modelo compacto de 1.728 millones de parametros en tareas de completado de codigo y prediccion de "next-edit" (siguiente edicion) al estilo del editor Zed, es decir, anticipar la proxima modificacion que un desarrollador realizaria sobre un fichero de codigo. El repositorio se organiza mediante etiquetas git, donde cada etiqueta corresponde a una ejecucion de entrenamiento distinta.

El modelo parte de la arquitectura LFM3 de Liquid AI, un transformer de 1.700 millones de parametros con licencia LFM Open License v1.0. La model card indica que se trata de un trabajo en curso (work in progress) y que las variantes publicadas no ofrecen garantias de calidad. La unica variante efectivamente descrita es `code-sft`, un ajuste supervisado en formato chat sobre 36.000 soluciones del dataset KodCode-V1, mientras que las variantes `code-fim` y `sweep-sft-*` aparecen como planificadas.

La relevancia del modelo reside en su enfoque: modelos pequenos especializados en tareas concretas de asistencia al desarrollo (FIM y next-edit) pueden desplegarse en entornos locales con requisitos de hardware modestos, algo atractivo para integraciones en IDE. No obstante, la informacion disponible es limitada: no se publican benchmarks, idiomas soportados ni detalles de la arquitectura interna mas alla de lo heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM3-1.7B-Base; detalles internos no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors y GGUF (segun tags del repositorio); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (con umbral de uso comercial); la variante `code-sft` queda restringida a uso no comercial por el dataset KodCode (CC BY-NC 4.0) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base LiquidAI/LFM3-1.7B-Base, un transformer de aproximadamente 1.700 millones de parametros. La model card no detalla la composicion interna (numero de capas, dimension oculta, mecanismo de atencion) ni la longitud de contexto nativa, por lo que estos datos deben consultarse en la ficha del modelo base. El repositorio incluye codigo personalizado (`custom_code`), lo que obliga a cargar el modelo con `trust_remote_code=True`.

El entrenamiento se organiza por ejecuciones etiquetadas. La variante `code-sft` se entreno con ajuste supervisado en formato chat sobre 36.000 soluciones de KodCode-V1, un dataset con licencia CC BY-NC 4.0, lo que restringe esa variante a uso no comercial. Las variantes planificadas `code-fim` (codigo en bruto con relleno en medio, usando el diseno `qwen` de Zed) y `sweep-sft-*` (prediccion de next-edit en el formato de prompt `sweep` de Zed) se entrenarian con ficheros y commits de licencia permisiva de bigcode/commitpack. No se documentan tecnicas de RLHF, DPO ni innovaciones arquitectonicas propias.

## Capacidades

- Generacion de texto y codigo en formato conversacional (variante `code-sft`).
- Completado de codigo con relleno en medio (FIM) planificado en la variante `code-fim`, con el diseno de prompt `qwen` empleado por Zed.
- Prediccion de next-edit: anticipar la siguiente modificacion sobre un fichero, en el formato `sweep` de Zed (variante planificada).
- Carga mediante `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True`.
- Pesos disponibles en safetensors y GGUF, lo que facilita su uso en runners locales.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado en el editor Zed: la variante `code-fim` (cuando este disponible) se integraria en el flujo de FIM de Zed usando el diseno de prompt `qwen`, aprovechando el tamano reducido del modelo para inferencia local.
- Prediccion de next-edit en IDE: la variante `sweep-sft-*` se usaria para sugerir la proxima edicion sobre un fichero abierto, integrándose en el mecanismo `sweep` de Zed.
- Asistente de codigo conversacional: la variante `code-sft` puede emplearse para responder preguntas sobre fragmentos de codigo o proponer soluciones, siempre en contextos no comerciales por la licencia del dataset.
- Prototipado de herramientas de revision de codigo: el modelo puede servir como base para experimentar con sugerencias de parches en pipelines internos de investigacion.
- Despliegue en estaciones de trabajo con GPU de consumo: al tener 1.700 millones de parametros y pesos GGUF, es viable ejecutarlo en hardware modesto para pruebas de latencia y calidad.
- Investigacion sobre ajuste fino de modelos pequenos: el repositorio documenta ejecuciones por etiquetas git, lo que permite reproducir y comparar variantes de entrenamiento.
- Evaluacion de licencias en pipelines de codigo: util para estudiar el impacto de datasets con licencia no comercial (KodCode) frente a alternativas permisivas (commitpack) en modelos de asistencia al desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.728 millones de parametros, una estimacion orientativa en FP16 ronda los 3,5 GB de pesos, y en cuantizaciones de 4 bits aproximadamente 1 GB, sin contar overhead de contexto y runtime.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo es compatible con GPU de consumo tipo RTX 3060/4060 en adelante.
- Cabe en GPU de consumo: si, por el numero de parametros, aunque no hay confirmacion oficial.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; los pesos GGUF permiten su uso con runners compatibles con llama.cpp, si bien no se documenta soporte explicito de vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Walltim3/lfm3-1.7b-sweep-sft | 1.728 M | no disponible | FIM y next-edit (experimental) | LFM Open License v1.0; variante `code-sft` no comercial | Hugging Face, safetensors y GGUF |
| LiquidAI/LFM3-1.7B-Base | ~1.700 M | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face |
| Alternativas especializadas en FIM de tamano similar | no disponible | no disponible | Completado de codigo | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental y "work in progress": el autor no garantiza calidad ni idoneidad para ningun proposito.
- La variante `code-sft` se entreno con KodCode-V1 (CC BY-NC 4.0), por lo que su uso queda restringido a fines no comerciales.
- Las variantes `code-fim` y `sweep-sft-*` figuran como planificadas; pueden no estar disponibles o estar incompletas.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de rendimiento.
- No se documentan idiomas soportados ni longitud de contexto; ambos dependen del modelo base.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.
- El repositorio ocupa 681,2 GB, lo que incluye estados de entrenamiento en `checkpoints/`; la descarga completa es costosa y conviene seleccionar la revision concreta.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene revisarlo antes de usarlo en produccion.
- No esta afiliado ni respaldado por Liquid AI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Walltim3/lfm3-1.7b-sweep-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia LFM Open License v1.0: incluida en el repositorio (`LICENSE`)
- Dataset KodCode-V1 (referenciado en la model card): no disponible como enlace directo en la informacion proporcionada
- Dataset bigcode/commitpack (referenciado): no disponible como enlace directo en la informacion proporcionada
