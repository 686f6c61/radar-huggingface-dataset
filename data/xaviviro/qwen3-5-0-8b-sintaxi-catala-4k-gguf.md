# xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k-GGUF

## Resumen

Qwen3.5-0.8B-sintaxi-catala-4k-GGUF es la versión cuantizada a 4 bits (Q4_K_M) del modelo xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k, un ajuste fino especializado en análisis sintáctico del catalán. Lo desarrolla Xavier Vinaixa Roselló (xaviviro), de Sorensen AI (Barcelona), y deriva de la familia Qwen3.5 en su variante de 0,8B parámetros. El modelo resuelve una tarea muy concreta: recibe una única oración en catalán y devuelve directamente su análisis sintáctico en formato JSON, sin razonamiento intermedio.

La relevancia de esta ficha reside en su naturaleza de artefacto de despliegue local: el repositorio GGUF pesa 0,5 GB y está pensado para ejecutarse con LM Studio o llama.cpp en equipos de consumo (Mac, Windows, Linux). La plantilla de chat incluida desactiva siempre el modo *thinking*, coherente con el entrenamiento recibido, de modo que la salida es determinista y estructurada.

El modelo base cuenta con 752.393.024 parámetros reales (según safetensors) y una ventana de contexto de 4k tokens, indicada en el propio nombre del modelo. La licencia es Apache 2.0 y el único idioma declarado es el catalán. No hay datos publicados de benchmarks de calidad lingüística en la información disponible; la validación aportada mide únicamente la fidelidad de la cuantización respecto al modelo original en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4k tokens (indicado en el nombre del modelo) |
| Tipos de cuantizacion | Q4_K_M (4 bits); el repo contiene únicamente esta cuantización |
| Idiomas soportados | catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y LM Studio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen3.5 y de que el modelo base fue ajustado para la tarea de análisis sintáctico del catalán. El modelo original se entrenó para responder directamente con un análisis sintáctico en JSON a partir de una sola oración, con el modo de razonamiento (*thinking*) desactivado de forma permanente, tal como refleja la plantilla de chat incluida en esta versión GGUF.

El repositorio documenta un proceso de destilación (el proyecto se llama "destillacio-sintaxi-catala"), con código y notebook publicados en GitHub, aunque la información proporcionada no especifica el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable de esta ficha concreta es la cuantización Q4_K_M: reduce el modelo a 535 MB y mantiene una alta fidelidad respecto al original en bf16.

## Capacidades

- Generación de análisis sintáctico del catalán en formato JSON a partir de una única oración de entrada.
- Salida estructurada y determinista con temperatura 0, adecuada para consumo programático.
- Modo *thinking* desactivado de forma permanente mediante la plantilla de chat, tal como se entrenó.
- Ejecución local en CPU y GPU mediante llama.cpp y LM Studio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni matemáticas avanzadas; el alcance declarado es la sintaxis del catalán.

## Casos de uso

- Anotación sintáctica de corpus catalanes: el modelo procesa oraciones una a una y devuelve JSON listo para integrarse en un pipeline de anotación lingüística, con la ventaja de ejecutarse en local sin coste por token.
- Herramientas docentes de gramática catalana: con temperatura 0 y salida JSON, se puede construir una interfaz que muestre el análisis de una oración introducida por el alumno de forma reproducible.
- Preprocesado para PLN downstream: generar análisis sintácticos como característica adicional en sistemas de extracción de información o traducción asistida en catalán.
- Despliegue en entornos sin conectividad: al pesar 0,5 GB y funcionar con llama.cpp, cabe en portátiles y equipos de escritorio, lo que permite usarlo en aulas o entornos aislados.
- Prototipado rápido con LM Studio: el autor documenta el flujo de descarga con `lms get` y el uso de un chat nuevo sin prompt de sistema, lo que facilita pruebas inmediatas por parte de lingüistas sin perfil técnico.
- Validación de pipelines de cuantización: sirve como caso de estudio reproducible (código y notebook públicos) para medir la degradación de un ajuste fino especializado al pasar de bf16 a Q4_K_M.
- Integración en correctores o asistentes de escritura en catalán: el análisis JSON puede alimentar reglas de estilo o de concordancia en herramientas de edición.

## Benchmarks y rendimiento

La model card solo publica una validación de fidelidad de la cuantización frente al modelo original en bf16, sobre 30 oraciones de referencia manual y temperatura 0:

| Metrica | Resultado |
|---|---|
| Salida JSON válida | 100 % |
| Análisis idéntico al del modelo bf16 | 90 % |

El propio autor advierte que esta tabla mide cuánto se parece el Q4 al original, no si el análisis es correcto; para la calidad del análisis remite a la ficha del modelo original. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el archivo Q4_K_M de 535 MB, más el overhead del contexto (4k tokens).
- Cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, Apple Silicon, iGPU) y también en CPU.
- Despliegue recomendado: llama.cpp (`llama-server -hf ... --jinja`) y LM Studio; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia con API compatible.
- Throughput y latencia: no disponibles en la información proporcionada; por el tamaño (0,8B en 4 bits) se espera baja latencia en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k-GGUF (este) | 752 M | 4k | ca | Apache 2.0 | GGUF Q4_K_M |
| xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k (original) | 752 M | 4k | ca | Apache 2.0 | safetensors (bf16, según la model card) |
| Qwen3.5 0.8B base | no disponible | no disponible | multilingüe (no detallado) | no disponible | no disponible |

La comparativa se limita al par original/cuantizado del mismo autor, ya que la información proporcionada no incluye otros modelos especializados en sintaxis del catalán ni datos de rendimiento de alternativas. No disponible para una comparación más amplia.

## Limitaciones y advertencias

- Ámbito restringido: el modelo está entrenado para analizar una sola oración por petición; no es un modelo de propósito general ni un asistente conversacional.
- Idioma único: solo catalán; no se garantiza comportamiento en otras lenguas.
- Contexto de 4k tokens: suficiente para oraciones, pero no para documentos largos.
- Riesgo de alucinación estructural: puede producir JSON sintácticamente válido con un análisis lingüísticamente incorrecto; la validación publicada no mide corrección del análisis.
- Modo *thinking* desactivado por diseño: forzarlo o usar prompts de sistema distintos puede degradar la salida.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución del autor y del modelo base.
- Ecosistema mínimo: 0 descargas y 0 likes en el momento de la ficha, sin comunidad que reporte incidencias; el soporte depende del repositorio GitHub del autor.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo ni de robustez.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k-GGUF
- Modelo base: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k
- Código, notebook y explicación: https://github.com/xaviviro/destillacio-sintaxi-catala
- Perfil del autor: https://huggingface.co/xaviviro
