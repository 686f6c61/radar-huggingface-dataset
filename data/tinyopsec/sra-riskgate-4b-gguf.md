# tinyopsec/SRA-RiskGate-4B-GGUF

## Resumen

SRA-RiskGate-4B-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo base sriram1983007/SRA-RiskGate-4B, publicada por el usuario tinyopsec. El modelo base es un transformer de aproximadamente 4.022 millones de parametros (4B) construido sobre la arquitectura Qwen3, segun las etiquetas del repositorio. El sufijo "RiskGate" sugiere una especializacion en evaluacion o filtrado de riesgo, aunque la model card del repositorio de cuantizacion no documenta el proceso de entrenamiento ni la tarea concreta del modelo original.

El repositorio proporciona trece variantes de cuantizacion generadas con llama.cpp, desde F16 sin perdida hasta Q2_K fuertemente comprimido, lo que permite desplegar el modelo en hardware de consumo. El peso total del repositorio es de 39,3 GB, coherente con la suma de todas las variantes incluidas. La licencia Apache 2.0 heredada del modelo base facilita el uso comercial.

La relevancia de esta ficha radica en que el modelo original no cuenta con documentacion publica detallada en la informacion disponible, por lo que la ficha se centra en las caracteristicas verificables del artefacto GGUF y en las implicaciones practicas de desplegar un modelo de 4B cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tags) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3, un transformer decoder-only con atencion por query/key/value y normalizacion RMSNorm, segun la convencion de la familia. No hay informacion disponible sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa. El nombre "RiskGate" apunta a un ajuste fino orientado a clasificacion o filtrado de riesgo, pero no se documenta el dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF, DPO o SFT.

Las cuantizaciones fueron producidas con llama.cpp, lo que implica que los pesos originales (presumiblemente en safetensors) se convirtieron a GGUF y se comprimieron en los trece niveles listados. No se especifica si se aplicaron tecnicas como imatrix o calibracion especifica; la model card solo indica "produced with llama.cpp". No hay innovaciones tecnicas documentadas (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" indica uso en dialogos multi-turno.
- Especializacion en riesgo: el nombre RiskGate sugiere capacidad de evaluar, puntuar o filtrar contenido por riesgo, aunque no se documenta el criterio ni la salida esperada.
- Razonamiento general: heredado de la familia Qwen3, que tipicamente incluye capacidades de razonamiento y matematicas; no confirmado en la informacion disponible.
- Generacion de codigo: probable por la base Qwen3, pero no verificado en la documentacion.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Moderacion de contenido en pipelines de texto: el modelo, por su nombre y especializacion, puede integrarse como clasificador o gate previo a la publicacion de contenido generado, evaluando el riesgo de cada salida antes de mostrarla al usuario.
- Filtrado de respuestas en chatbots: desplegado con llama.cpp o Ollama, puede actuar como segunda capa que valida las respuestas de otro modelo mayor antes de enviarlas, reduciendo el coste frente a usar un modelo grande para la verificacion.
- Despliegue en hardware de consumo: las variantes Q4_K_M y Q5_K_M caben en GPUs de 8-12 GB, lo que permite ejecutar el gate en estaciones de trabajo sin GPU de datacenter.
- Evaluacion de riesgo en entornos offline o air-gapped: al ser GGUF y funcionar con llama.cpp, puede ejecutarse en maquinas sin conectividad, util para auditorias locales de contenido sensible.
- Prototipado rapido de clasificadores de riesgo: investigadores pueden comparar las trece cuantizaciones para medir el impacto de la compresion en la precision del gate antes de invertir en infraestructura.
- Generacion de texto conversacional ligera: el tag "conversational" permite usarlo como modelo de chat de bajo coste en aplicaciones donde la latencia y el consumo energetico son criticos.
- Integracion en pipelines de CI/CD para revision de prompts: puede validar prompts de usuario en tiempo de build o despliegue, marcando entradas potencialmente peligrosas antes de que lleguen a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB en F16 (4B x 2 bytes + overhead), 4,5-5 GB en Q8_0, 3-3,5 GB en Q5_K_M, 2,5-3 GB en Q4_K_M y 1,8-2,2 GB en Q2_K.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) para F16 y Q8_0; RTX 4070 (12 GB) o RTX 3060 (12 GB) para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores para cuantizaciones Q4 y Q5; en GPUs de 8 GB con Q3_K_M o Q4_K_S.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa en la informacion disponible.
- Latencia y throughput estimados: no disponibles; dependen de la GPU y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SRA-RiskGate-4B-GGUF | 4B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Qwen3-4B | 4B | no disponible en esta ficha | Apache 2.0 | safetensors/GGUF | Hugging Face |
| Llama 3.2 3B | 3B | 128k (segun model card oficial) | Llama 3.2 Community License | safetensors/GGUF | Hugging Face |
| Phi-3-mini | 3,8B | 4k-128k segun variante | MIT | safetensors/GGUF | Hugging Face |

La comparativa se limita a parametros y licencia porque no hay benchmarks publicados para SRA-RiskGate-4B. Qwen3-4B y Llama 3.2 3B son las alternativas mas directas por tamano y disponibilidad de cuantizaciones GGUF.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no haber model card del modelo base, no se puede evaluar el sesgo del ajuste fino.
- Riesgo de alucinacion: inherente a los modelos generativos de 4B; la especializacion en riesgo no garantiza calibracion de probabilidades.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan documentados, lo que impide garantizar comportamiento multilingue o conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor del modelo base no documenta condiciones adicionales; conviene verificar el repositorio original antes de produccion.
- Caveat importante: la model card del repositorio GGUF no describe el proposito exacto del gate ni el formato de salida esperado, por lo que su uso como clasificador de riesgo requiere validacion empirica previa.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar significativamente la precision en tareas de clasificacion fina; no se recomiendan para produccion sin evaluacion.
- El repositorio tiene solo 1 like y 798 descargas, lo que indica escasa validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/SRA-RiskGate-4B-GGUF
- Modelo base: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- llama.cpp (herramienta de cuantizacion): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue GGUF): https://ollama.com
