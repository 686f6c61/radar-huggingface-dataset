# xiain/SwiftSQL-3B-LoRA

## Resumen

SwiftSQL-3B-LoRA es un adaptador LoRA (PEFT) publicado por el usuario xiain en Hugging Face, entrenado sobre el modelo base unsloth/Qwen2.5-Coder-3B-Instruct. El nombre sugiere un ajuste orientado a la generacion y comprension de SQL, aunque la model card no documenta explicitamente la tarea, el dataset ni los objetivos de entrenamiento. Se distribuye como repositorio de adaptadores en formato safetensors con un tamano aproximado de 0,5 GB, lo que es coherente con un adaptador LoRA sobre un modelo de 3 mil millones de parametros.

La relevancia de esta ficha es limitada pero concreta: se trata de un ajuste fino con DPO (segun los tags del repositorio) sobre un modelo de codigo pequeno y ampliamente desplegable en hardware de consumo. El modelo base, Qwen2.5-Coder-3B-Instruct, es un transformer denso de 3B parametros desarrollado por Alibaba Qwen, con soporte nativo de contexto largo e instrucciones, lo que convierte al adaptador en una opcion potencial para tareas de generacion de consultas SQL en entornos con recursos restringidos.

No obstante, la informacion publicada es minima: la model card es la plantilla por defecto de Hugging Face sin rellenar, no se declara licencia, no se especifican idiomas ni se aportan resultados de evaluacion. Cualquier evaluacion seria de este adaptador exige pruebas propias contra el modelo base y contra alternativas de text-to-SQL establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso decoder-only (Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | No disponible para el adaptador; modelo base: 3B (aproximado, segun denominacion) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base Qwen2.5-Coder-3B-Instruct (32 768 tokens segun especificaciones publicas de Qwen, no confirmado para este adaptador) |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors (precision del adaptador no declarada) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere fusion o carga junto al modelo base |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. Los tags del repositorio indican el uso de Unsloth para el entrenamiento, TRL y la tecnica DPO (Direct Preference Optimization), lo que sugiere una fase de alineacion por preferencias ademas del ajuste supervisado, aunque no se detalla la composicion del dataset, el numero de pasos, el rango del adaptador ni los hiperparametros. La version de PEFT declarada es 0.21.2.

No se documenta ninguna innovacion arquitectonica propia: el adaptador no modifica la arquitectura del modelo base, solo anade matrices de bajo rango en las capas seleccionadas. Tampoco se especifican los datos de entrenamiento (presumiblemente pares de preguntas y consultas SQL, dado el nombre), el numero de tokens vistos ni si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y consultas SQL: el nombre del adaptador y el modelo base apuntan a generacion de codigo SQL a partir de lenguaje natural, aunque no esta verificado en la model card.
- Razonamiento sobre esquemas de bases de datos: capacidad heredada del modelo base de codigo, no confirmada para el adaptador.
- Generacion de codigo general: el modelo base Qwen2.5-Coder-3B-Instruct esta entrenado para codigo en multiples lenguajes; el adaptador podria conservar parte de esa capacidad.
- Soporte de tool calling y function calling: no documentado para el adaptador; el modelo base Qwen2.5 incluye soporte de function calling, pero el ajuste DPO podria haberlo alterado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; el modelo base soporta varios idiomas, pero el adaptador no declara idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de consultas SQL en asistentes internos: el adaptador puede cargarse sobre Qwen2.5-Coder-3B-Instruct para traducir preguntas en lenguaje natural a SQL en herramientas de analitica internas, con la ventaja de un modelo de 3B desplegable en una sola GPU.
- Autocompletado de SQL en editores e IDE: dado su tamano reducido, puede ejecutarse en local para sugerir fragmentos de consulta mientras el desarrollador escribe, sin enviar el esquema de la base de datos a un servicio externo.
- Prototipado rapido de pipelines text-to-SQL: util para equipos que quieran evaluar un ajuste DPO sobre un modelo pequeno antes de invertir en modelos mayores, comparando su salida contra el modelo base.
- Educacion y formacion en SQL: el modelo puede explicar o generar consultas de ejemplo en entornos de aprendizaje, siempre con supervision humana dada la ausencia de evaluacion publicada.
- Migracion y refactorizacion de consultas: potencial uso para reescribir SQL entre dialectos (por ejemplo, MySQL a PostgreSQL), aunque esta capacidad no esta verificada y requiere validacion.
- Despliegue en entornos con privacidad estricta: al ser un modelo de 3B con adaptador de 0,5 GB, puede ejecutarse en infraestructura propia o en portatiles con GPU de consumo, lo que facilita su uso en sectores regulados.
- Generacion de datos sinteticos de consultas SQL: puede emplearse para producir pares pregunta-consulta que alimenten otros pipelines de entrenamiento, con filtrado y revision posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantizacion de 8 bits, alrededor de 3,5-4 GB; en 4 bits, alrededor de 2-2,5 GB. El adaptador anade un overhead minimo (0,5 GB en disco; en VRAM, unos cientos de MB segun rango y capas).
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 o H100 para maxima velocidad; una RTX 3060 de 12 GB o incluso una GPU de 8 GB en cuantizacion 4 bits son suficientes para inferencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando cuantizacion, y en 12-16 GB sin cuantizar.
- Opciones de despliegue: transformers con PEFT (carga del adaptador), vLLM (previa fusion del adaptador con el modelo base), llama.cpp u Ollama (requiere conversion a GGUF tras fusion), TGI (tras fusion). El adaptador no se puede servir directamente en motores que no soporten PEFT sin fusionarlo.
- Latencia y throughput estimados: no disponibles. Para un modelo de 3B en una RTX 4090 se puede esperar un throughput del orden de decenas a cientos de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwiftSQL-3B-LoRA (este) | 3B base + LoRA | No disponible | SQL (presunto) via DPO/LoRA | No disponible | Hugging Face |
| Qwen2.5-Coder-3B-Instruct | 3B | 32 768 tokens (segun Qwen) | Codigo e instrucciones generales | Apache 2.0 (segun Qwen) | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7B | 32 768 tokens (segun Qwen) | Codigo e instrucciones generales | Apache 2.0 (segun Qwen) | Hugging Face |
| CodeLlama-7B-Instruct | 7B | 16 384 tokens (segun Meta) | Codigo | Llama 2 Community License | Hugging Face |

La comparacion con alternativas especializadas en text-to-SQL (por ejemplo, modelos ajustados sobre Spider o BIRD) no es posible con los datos disponibles, ya que no hay evaluacion publicada del adaptador.

## Limitaciones y advertencias

- Model card vacia: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni uso previsto, lo que impide validar la calidad del ajuste.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, la licencia del adaptador no sustituye a la del modelo base (Qwen2.5-Coder-3B-Instruct, Apache 2.0 segun su publicacion original), que debe respetarse.
- Riesgo de alucinacion: como todo modelo generativo, puede producir SQL sintacticamente valido pero semanticamente incorrecto; en produccion es imprescindible validar contra el esquema real y ejecutar en entornos aislados.
- Idiomas no declarados: no hay garantia de rendimiento en castellano ni en otros idiomas distintos del ingles.
- Sin benchmarks: no hay evidencia de que el ajuste DPO mejore al modelo base en tareas SQL; podria incluso degradar capacidades generales del modelo base.
- Contexto: la longitud de contexto efectiva del adaptador no esta verificada; el ajuste podria haber sido entrenado con secuencias mas cortas.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-27): metadato anomalo que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiain/SwiftSQL-3B-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper de PEFT (LoRA): https://arxiv.org/abs/2106.09685
- Paper de DPO: https://arxiv.org/abs/2305.18290
- Paper citado en los tags (Machine Learning Impact calculator): https://arxiv.org/abs/1910.09700
