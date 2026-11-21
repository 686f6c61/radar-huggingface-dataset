# tinyopsec/Llama-3.2-Korean-GGACHI-1B-Instruct-v1-GGUF

## Resumen

Llama-3.2-Korean-GGACHI-1B-Instruct-v1-GGUF es la distribucion en formato GGUF del modelo torchtorchkimtorch/Llama-3.2-Korean-GGACHI-1B-Instruct-v1, un ajuste fino de Llama-3.2-1B-Instruct de Meta orientado a instrucciones en coreano. El modelo original parte de la arquitectura transformer decoder-only de Llama 3.2 con 1.235.814.432 parametros y fue entrenado sobre mas de 230.000 ejemplos de instrucciones en coreano. Esta version GGUF la publica el usuario tinyopsec y su proposito es facilitar la inferencia local en CPU y GPU de gama baja mediante llama.cpp y runtimes compatibles.

La relevancia de esta ficha es practica: se trata de un modelo pequeno (1B), cuantizado en 13 variantes desde F16 hasta Q2_K, pensado para despliegues con recursos limitados y para tareas de generacion de texto conversacional en coreano. El repositorio ocupa 12,5 GB en total por acumular todas las cuantizaciones, aunque cada archivo individual es manejable en hardware de consumo.

No se dispone de informacion publica sobre la composicion exacta del dataset de ajuste, los hiperparametros de entrenamiento ni resultados de benchmarks. La model card es escueta y se limita a listar los archivos GGUF, el uso basico con llama.cpp y la licencia heredada de Llama 3.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible en la model card; el ajuste fino esta orientado a coreano |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Llama-3.2-1B-Instruct, un transformer decoder-only de Meta con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y tokenizer BPE. Sobre esa base, el autor original (torchtorchkimtorch) realizo un ajuste fino supervisado con mas de 230.000 ejemplos de instrucciones en coreano, segun indica la model card. No se especifica si hubo etapas de RLHF, DPO u otras tecnicas de alineacion adicionales, ni el numero total de tokens procesados durante el ajuste.

La version aqui descrita es una cuantizacion GGUF generada con llama.cpp, que preserva la arquitectura y los pesos del modelo original pero reduce la precision de los tensores para disminuir el uso de memoria y acelerar la inferencia en CPU y GPU. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en coreano, derivada del ajuste fino sobre instrucciones.
- Seguimiento de instrucciones en formato chat, heredado de Llama-3.2-1B-Instruct.
- Generacion de texto general y respuesta a preguntas, con calidad limitada por el tamano de 1B parametros.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y otros.
- Soporte de inferencia en CPU y GPU de gama baja gracias a las cuantizaciones de 2 a 8 bits.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no documentadas; el enfasis del ajuste es el coreano.

## Casos de uso

- Asistente conversacional en coreano para entornos con hardware limitado: el modelo puede ejecutarse en CPU con la cuantizacion Q4_K_M y mantener dialogos multi-turno, adecuado para prototipos y demos locales.
- Clasificacion y etiquetado de texto en coreano: con prompts de instruccion se puede usar para categorizar resenas, correos o tickets en un pipeline por lotes sin necesidad de GPU dedicada.
- Generacion de respuestas plantilla en coreano: util para sistemas de atencion al cliente que necesitan borradores rapidos en un idioma especifico y con coste de inferencia minimo.
- Educacion y practica de idiomas: el modelo puede generar ejercicios, ejemplos de frases y explicaciones sencillas en coreano, desplegado en local con Ollama o LM Studio.
- Preprocesamiento y resumen de documentos cortos en coreano: con contexto limitado por el modelo base, sirve para resumir parrafos o extraer ideas clave en tareas de bajo riesgo.
- Experimentacion e investigacion: como punto de partida para estudiar ajuste fino en idiomas de bajos recursos o para comparar el rendimiento de cuantizaciones GGUF en tareas coreanas.
- Despliegue en dispositivos de borde: al ocupar pocos cientos de MB en Q4_K_M, puede integrarse en aplicaciones de escritorio o entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,0 GB en Q2_K, 1,2-1,5 GB en Q4_K_M, 1,8-2,2 GB en Q8_0 y unos 2,5-3,0 GB en F16, sin contar el overhead del runtime y el contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con la cuantizacion Q4_K_M o inferior.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-Korean-GGACHI-1B-Instruct-v1-GGUF | 1,24B | no disponible | Llama 3.2 Community License | GGUF | Ajuste fino en coreano, 13 cuantizaciones |
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 128k tokens (segun documentacion de Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo base multilingue, sin ajuste especifico en coreano |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k tokens (segun documentacion de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, incluye coreano, licencia permisiva |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks del modelo de esta ficha para contrastar rendimiento.

## Limitaciones y advertencias

- Modelo de 1B parametros: capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion elevado en tareas factuales, especialmente con cuantizaciones agresivas como Q2_K o Q3.
- El ajuste fino esta orientado al coreano; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se documentan sesgos especificos, pero al derivar de Llama 3.2 hereda los sesgos del modelo base y del dataset de instrucciones coreano, no publicado.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial y requiere cumplir la politica de uso aceptable de Meta; revisar antes de desplegar en produccion.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; se recomienda Q4_K_M o superior para uso real.
- No hay informacion sobre la longitud de contexto soportada en la practica ni sobre el comportamiento en conversaciones largas.
- La model card advierte explicitamente de que el modelo debe evaluarse antes de su uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Llama-3.2-Korean-GGACHI-1B-Instruct-v1-GGUF
- Modelo base del ajuste: https://huggingface.co/torchtorchkimtorch/Llama-3.2-Korean-GGACHI-1B-Instruct-v1
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
