# tinyopsec/LaleYard-1.5B-GGUF

## Resumen

LaleYard-1.5B-GGUF es la distribucion en formato GGUF del modelo sener00/LaleYard-1.5B, un ajuste fino de Qwen2.5-1.5B-Instruct orientado a asistencia de asuntos estudiantiles en turco, con soporte declarado para RAG y uso de herramientas. El repositorio lo publica el usuario tinyopsec y contiene 13 ficheros de cuantizacion generados con llama.cpp, desde F16 hasta Q2_K, lo que permite desplegar el modelo en hardware muy modesto. La licencia es Apache 2.0 y el pipeline declarado es text-generation.

El modelo resuelve un nicho concreto: respuestas conversacionales en turco sobre tramites academicos, combinando recuperacion de informacion y llamadas a herramientas. Con 1.543.714.304 parametros (aproximadamente 1.500 millones) y una arquitectura derivada de Qwen2, es un modelo pequeno pensado para inferencia local o en CPU, no para tareas generales de alta complejidad. Su relevancia actual radica en la disponibilidad de cuantizaciones listas para llama.cpp, Ollama y LM Studio, y en que mantiene la licencia permisiva del modelo base.

La informacion publicada por el autor es escasa: no se detallan composicion del dataset de ajuste fino, numero de tokens de entrenamiento, resultados de evaluacion ni lista de idiomas soportados mas alla del turco. La model card se limita a listar los ficheros GGUF, un ejemplo de uso con llama-cli y un aviso de que debe evaluarse antes de su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Qwen2 (modelo base: Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero el autor no confirma el contexto efectivo tras el ajuste) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | turco (unico idioma declarado en los tags); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (13 ficheros); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de aproximadamente 1.500 millones de parametros con atencion causal estandar y mecanismos de RoPE para codificacion posicional. El autor no publica detalles sobre la arquitectura interna modificada, si se congeleron capas o si se aplicaron tecnicas como LoRA o QLoRA durante el ajuste. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del corpus (presumiblemente documentacion de asuntos estudiantiles en turco) ni si se aplicaron fases de RLHF o DPO adicionales.

La unica innovacion tecnica documentada es la generacion de cuantizaciones GGUF mediante llama.cpp, que cubre el rango de 2 a 16 bits. El modelo conserva el tokenizador y la configuracion del modelo base Qwen2.5, aunque no se confirma si se amplio el vocabulario o se ajustaron los tokens especiales para el dominio turco. La ausencia de informacion sobre el proceso de entrenamiento impide evaluar la calidad del ajuste fino o su grado de sobreajuste al dominio.

## Capacidades

- Generacion de texto conversacional en turco, orientada a consultas sobre asuntos estudiantiles.
- Soporte declarado de RAG (retrieval-augmented generation): el modelo esta disenado para responder a partir de contexto recuperado, segun los tags del repositorio.
- Soporte declarado de agentes y uso de herramientas (tags `agent` y `rag`), aunque no se documenta el formato de tool calling ni ejemplos de invocacion.
- Razonamiento multi-turno basico heredado de Qwen2.5-1.5B-Instruct.
- Capacidades multilingues limitadas: solo el turco esta declarado; el resto de idiomas no esta confirmado.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Atencion al estudiante en turco: el modelo puede gestionar conversaciones multi-turno sobre matriculacion, becas o calendarios academicos, apoyandose en el contexto recuperado por un sistema RAG externo.
- Asistente de secretaria virtual: integrado en un portal universitario, responde preguntas frecuentes y deriva consultas complejas a un humano, con la ventaja de ejecutarse en CPU o GPU de gama baja.
- Chatbot de RAG sobre normativa academica: se indexan reglamentos y guias en una base vectorial y el modelo genera respuestas citando el contexto recuperado, adecuado por su tamano reducido y su ajuste al dominio.
- Prototipado rapido de agentes turcos: con llama.cpp u Ollama, permite validar flujos de tool calling en local antes de migrar a modelos mayores.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M y Q3_K_M permiten ejecutar el modelo en portatiles sin GPU dedicada, util para demos y pruebas de concepto.
- Filtrado y clasificacion de consultas entrantes: el modelo puede etiquetar o enrutar mensajes de estudiantes por tematica antes de pasarlos a un sistema humano, gracias a su baja latencia en cuantizacion Q4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas del dominio turco, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): F16 ~3,0 GB; Q8_0 ~1,6 GB; Q6_K ~1,3 GB; Q5_K_M ~1,1 GB; Q4_K_M ~1,0 GB; Q3_K_M ~0,8 GB; Q2_K ~0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones de 4 bits (GTX 1650, RTX 3050, RTX 4060). Para F16 se recomienda una GPU con 6 GB o mas (RTX 3060, RTX 4060 Ti).
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM, e incluso en CPU con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El repositorio incluye el tag `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponibles. En un modelo de 1,5B en cuantizacion Q4, es razonable esperar decenas de tokens por segundo en GPU de consumo y varios tokens por segundo en CPU, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LaleYard-1.5B-GGUF | 1.543.714.304 | no disponible | Apache 2.0 | GGUF (13 cuantizaciones) | Ajuste fino en turco para asuntos estudiantiles con RAG y agentes |
| Qwen2.5-1.5B-Instruct | ~1.500 millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base, multilingue general, sin ajuste de dominio |
| Llama 3.2 1B Instruct | ~1.200 millones | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Multilingue general, contexto muy superior, licencia no Apache |
| Gemma 2 2B Instruct | ~2.600 millones | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Mayor tamano y calidad general, licencia restrictiva para algunos usos |

La comparativa se limita a datos publicos de los modelos alternativos; no hay benchmarks del modelo evaluado que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un ajuste fino sobre Qwen2.5, puede heredar sesgos del corpus original y del dataset de ajuste, no publicado.
- Riesgo de alucinacion: alto en un modelo de 1,5B sin evaluacion publicada; el autor advierte explicitamente que debe evaluarse antes de su uso.
- Limitaciones de contexto e idioma: solo se declara turco; el contexto efectivo no esta confirmado y podria ser inferior al del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para produccion: ausencia de benchmarks, de documentacion del dataset de entrenamiento y de ejemplos de tool calling; el tag `agent` no viene acompanado de especificacion del formato de herramientas.
- El repositorio tiene 0 likes y 736 descargas, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/LaleYard-1.5B-GGUF
- Modelo base del ajuste: https://huggingface.co/sener00/LaleYard-1.5B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
