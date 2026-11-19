# tinyopsec/Qwen3.5-4B-Uncensored-Aggressive-GGUF

## Resumen

Qwen3.5-4B-Uncensored-Aggressive-GGUF es la distribucion en formato GGUF del modelo rodrigomt/Qwen3.5-4B-Uncensored-Aggressive, un ajuste fino de Qwen3.5-4B orientado a generacion de texto sin filtros de seguridad y a un seguimiento de instrucciones agresivo. La publica el usuario tinyopsec en Hugging Face como cuantizaciones comunitarias en once variantes (de F16 a Q2_K), pensadas para inferencia local con llama.cpp, LM Studio u Ollama.

El modelo base declara 4.500 millones de parametros y una arquitectura de tipo Qwen2 con 28 capas y 28 cabezas de atencion, vocabulario de 151.936 tokens y una ventana de contexto de 32.768 tokens. El repositorio safetensors asociado registra 4.326.350.848 parametros reales, ligeramente por debajo de la cifra redondeada de la model card. El repo GGUF ocupa 37,4 GB en total porque agrupa todas las variantes de cuantizacion.

Su relevancia practica es doble: por un lado, ofrece un modelo de ~4B ejecutable en GPU de consumo e incluso en CPU con cuantizaciones bajas; por otro, su naturaleza "uncensored" lo situa en un nicho de investigacion sobre comportamiento del modelo sin patrones de rechazo, con las cautelas legales y eticas que eso implica. La licencia declarada es Apache 2.0 y el unico idioma soportado segun los metadatos es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer denso, 28 capas, 28 cabezas de atencion) |
| Parametros totales | 4.326.350.848 (4,5B segun model card) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Vocabulario | 151.936 tokens |
| Modelo base | rodrigomt/Qwen3.5-4B-Uncensored-Aggressive (a su vez derivado de Qwen/Qwen3.5-4B) |
| Tamano del repo | 37,4 GB (todas las variantes) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen2, con 28 capas y 28 cabezas de atencion, sin mezcla de expertos ni componentes de estado recurrente. El modelo parte de Qwen3.5-4B y fue ajustado por rodrigomt para eliminar los patrones de rechazo y maximizar la obediencia a instrucciones; tinyopsec publica unicamente la conversion y cuantizacion a GGUF, sin aportar informacion sobre el dataset de ajuste, el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO.

No se dispone de datos sobre la composicion del corpus de ajuste fino, el proceso de alineacion ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card del repo GGUF se limita a describir el proceso de cuantizacion y las instrucciones de uso; para detalles de entrenamiento remite al repositorio del modelo original.

## Capacidades

- Generacion de texto libre sin filtros de seguridad declarados, orientada a contenido sin restricciones.
- Seguimiento de instrucciones "agresivo": la model card enfatiza la maxima conformidad con las peticiones del usuario y la ausencia de patrones de rechazo.
- Generacion de contenido diverso: el autor menciona la capacidad de producir una amplia gama de tipos de contenido.
- Conversacion multi-turno (tag `conversational` en los metadatos).
- Despliegue ligero en local: 4,5B parametros permiten inferencia en GPU de consumo y CPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking" en la informacion disponible.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Investigacion sobre comportamiento sin censura: el modelo permite estudiar como responde un LLM de ~4B cuando se eliminan los patrones de rechazo, util para analisis de seguridad y de alineacion en entornos controlados.
- Prototipado local en equipos sin GPU dedicada: con la variante Q3_K_M (~1,5 GB) o Q2_K (~1,1 GB) se puede ejecutar en CPU con RAM suficiente, lo que facilita pruebas de concepto sin infraestructura cloud.
- Generacion creativa de ficcion y guiones: el ajuste orientado a obediencia y sin filtros encaja en tareas de escritura donde se busca explorar registros y tematicas que otros modelos rechazan; requiere revision humana por el riesgo de contenido sensible.
- Experimentacion con prompts de sistema y personalidad: la variante Q5_K_M (~2,8 GB) permite iterar rapidamente sobre instrucciones de sistema y estilos de respuesta en una sola GPU de consumo.
- Evaluacion comparativa de cuantizaciones: al publicarse once niveles (F16 a Q2_K), el repo sirve para medir la degradacion de calidad y coherencia segun bits por peso en un modelo de 4,5B.
- Despliegue en entornos aislados o air-gapped: al ser GGUF y ejecutable con llama.cpp u Ollama, puede integrarse en maquinas sin conexion para tareas de generacion de texto internas, siempre que el caso de uso cumpla con la politica de contenido de la organizacion.
- Fine-tuning posterior o destilacion: el modelo base en safetensors (Apache 2.0) puede servir como punto de partida para ajustes adicionales con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada segun la model card: F16 ~9 GB; Q8_0 ~5 GB; Q6_K ~3,5 GB; Q5_K_M ~3 GB; Q4_K_M ~2,5 GB; Q3_K_M ~2 GB; Q2_K ~1,5 GB.
- GPU recomendadas por variante: F16 en GPU de gama alta; Q8_0 y Q6_K en GPU de gama media; Q5_K_M y Q4_K_M en GPU estandar o portatil; Q3_K_M y Q2_K en GPU de portatil o CPU con RAM suficiente.
- Cabe en GPU de consumo: si, en tarjetas con 4-8 GB de VRAM para las cuantizaciones Q4-Q8 (por ejemplo, RTX 3060, RTX 4060, RTX 4070); las variantes Q2/Q3 pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`./main`), llama-cpp-python, LM Studio y Ollama (tag `tinyopsec/qwen3.5-4b-uncensored-aggressive-gguf:q5_k_m`). No se documenta soporte de vLLM ni TGI para este repo GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Qwen3.5-4B-Uncensored-Aggressive-GGUF | 4,3B | 32.768 | Apache 2.0 | GGUF (11 cuantizaciones) | Ajuste sin filtros, solo ingles |
| rodrigomt/Qwen3.5-4B-Uncensored-Aggressive | 4,5B (segun model card) | 32.768 | Apache 2.0 | safetensors | Modelo original del que deriva esta cuantizacion |
| Qwen/Qwen3.5-4B | 4,5B (segun model card) | 32.768 | no disponible en la informacion | safetensors | Modelo base oficial, con alineacion estandar |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el ajuste "uncensored" elimina deliberadamente los rechazos, lo que incrementa el riesgo de generar contenido danino, ilegal o sensible; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como modelo de 4,5B, la tasa de errores facticos es previsiblemente alta en tareas de conocimiento.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto: 32.768 tokens declarados, pero la calidad de recuperacion en ventanas largas no esta medida.
- Licencia: Apache 2.0 permite uso comercial, pero el uso comercial de un modelo sin filtros puede incumplir normativas de contenido (por ejemplo, la Ley de Servicios Digitales de la UE o legislacion sobre material de abuso); la responsabilidad recae en el desplegador.
- Cuantizaciones comunitarias: las variantes GGUF no tienen soporte oficial; la degradacion de calidad en Q3 y Q2 puede ser significativa.
- Metadatos inconsistentes: la model card indica 4,5B parametros mientras que el safetensors registra 4,3B; conviene verificar antes de dimensionar infraestructura.
- Repositorio con pocas senales de validacion: 1 like y 4.261 descargas en la fecha de consulta; no hay evidencia de evaluacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Qwen3.5-4B-Uncensored-Aggressive-GGUF
- Modelo base ajustado: https://huggingface.co/rodrigomt/Qwen3.5-4B-Uncensored-Aggressive
- Documentacion de llama.cpp: https://github.com/ggerganov/llama.cpp
