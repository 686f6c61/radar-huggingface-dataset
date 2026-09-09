# ssws3/reva_llm

## Resumen

El modelo `ssws3/reva_llm` es una version cuantizada NVFP4 del modelo `Qwen/Qwen3.6-35B-A3B` de Alibaba, publicada en HuggingFace por el usuario `ssws3`. Se trata de un modelo autorregresivo basado en transformadores con arquitectura Mixture-of-Experts (MoE) y atencion hibrida, que fue cuantizado por NVIDIA Model Optimizer para reducir el peso de los tensores a 4 bits (FP4). El objetivo es ofrecer un checkpoint mas eficiente en memoria y computacion, listo para inferencia con vLLM en entornos con GPUs NVIDIA modernas.

El modelo conserva las capacidades del modelo base, incluyendo una longitud de contexto de hasta 262K tokens y entradas multimodales (texto, imagen, video) con salida en texto. Su relevancia radica en que permite desplegar un modelo grande de 35B parametros totales con solo 3B activados por token, aprovechando la cuantizacion de 4 bits para reducir los requisitos de VRAM. La licencia Apache 2.0 permite uso comercial y no comercial, aunque el checkpoint publicado no es el oficial de NVIDIA y tiene una acogida limitada (0 descargas, 0 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers, Mixture-of-Experts (MoE) con atencion hibrida |
| Parametros totales | 35B (modelo base); 18.683.860.336 elementos de tensor en el checkpoint cuantizado |
| Parametros activos | 3B (MoE, activados por token) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, pesos y activaciones de operadores lineales) mediante NVIDIA Model Optimizer v0.44.0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado NVFP4) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un transformador autorregresivo con una capa MoE (Mixture-of-Experts) y atencion hibrida. En cada token se activan 3B de los 35B parametros totales, lo que reduce el coste computacional en inferencia manteniendo una capacidad expresiva alta. El modelo base fue originalmente desarrollado por Alibaba; los datos de entrenamiento no estan divulgados en la información disponible del checkpoint cuantizado.

El proceso de cuantizacion post-training se realizo con NVIDIA Model Optimizer v0.44.0, utilizando los datasets de calibracion `cnn_dailymail` y `Nemotron-Post-Training-Dataset-v2`. Estos se emplearon para ajustar los rangos y minimizar la perdida de precision al convertir los pesos y activaciones de los operadores lineales al tipo NVFP4. No se menciona ningun proceso de RLHF o DPO en esta variante; es un checkpoint puramente cuantizado sobre el modelo base ya entrenado.

## Capacidades

- Generacion de texto autorregresiva con soporte de contexto largo (hasta 262K tokens).
- Entrada multimodal: texto, imagenes y video; salida exclusivamente en texto.
- Soporte de tool-use y uso de agentes, segun lo evaluado en el benchmark tau²-Bench Telecom, que mide capacidad agente y adherencia a politicas.
- Razonamiento en tareas de matematicas y cientificas (AIME 2025, GPQA Diamond).
- Capacidades de codigo cientifico (SciCode).
- Comprension multimodal a nivel universitario (MMMU Pro).
- Capacidad de seguir instrucciones complejas y estructuradas (IFBench).
- Nivel de comprension de lenguaje general medido en MMLU Pro.
- Capacidad de recuerdo de informacion en contextos largos (AA-LCR).

## Casos de uso

- Sistemas de agentes IA: el modelo puede integrarse en pipelines con herramientas externas, gracias a su capacidad de tool-use y a su ventana de contexto de 262K tokens para mantener historiales largos de interaccion. Es adecuado para agentes que necesitan resolver tareas de varios pasos.
- Chatbots de atencion al cliente: la evaluacion en tau²-Bench Telecom muestra un perfil idoneo para escenarios de servicio al cliente con politicas definidas y uso de herramientas, gestionando conversaciones multi-turno con usuarios simulados.
- Sistemas RAG: la ventana de 262K tokens permite inyectar grandes volumenes de documentos y recuperar informacion precisa, como sugiere la evaluacion en AA-LCR (recall de contexto largo). Se puede desplegar con vLLM para servir consultas sobre bases de conocimiento extensas.
- Analisis multimodal de documentos: al aceptar entradas de imagen y video, puede procesar capturas, diagramas y videos cortos para generar descripciones o resumenes, combinando vision con razonamiento textual.
- Generacion de codigo cientifico y matematico: gracias a su rendimiento en SciCode y AIME 2025, es util para asistentes que ayuden en calculos tecnicos, desarrollo de algoritmos o resolucion de problemas academicos.
- Automatizacion de soporte tecnico en telecomunicaciones: su perfil de agente con politicas y herramientas lo hace apto para resolver incidencias de cuenta, gestion de contratos o asistencia tecnica siguiendo procedimientos establecidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que el modelo fue evaluado en MMLU Pro, GPQA Diamond, tau²-Bench Telecom, MMMU Pro, SciCode, AIME 2025, AA-LCR e IFBench, pero no se facilitan puntuaciones ni comparativas con otros modelos en los datos que acompañan al checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 23,5 GB en disco; en FP4, los pesos de los operadores lineales ocupan aproximadamente 17,5 GB, pero se recomienda una VRAM superior a 24 GB para alojar el modelo completo, la cache KV y los buffers de vLLM.
- GPU recomendadas: la model card especifica compatibilidad con microarquitecturas NVIDIA Hopper y NVIDIA Blackwell (por ejemplo, H100, B200, GB300). El equipo de prueba utilizado es un NVIDIA GB300.
- No es apto para GPUs de consumo como RTX 4090 o inferiores, ya que no se confirma soporte de NVFP4 en esas arquitecturas.
- Opciones de despliegue: soporte oficial para vLLM como runtime acelerado. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| `ssws3/reva_llm` (NVFP4) | 35B totales, 3B activos | 262K | Apache 2.0 | NVFP4 | HuggingFace, re-upload por ssws3 |
| `Qwen/Qwen3.6-35B-A3B` (modelo base) | 35B totales, 3B activos | 262K | Apache 2.0 | Sin cuantizar | HuggingFace, oficial de Alibaba |
| `nvidia/Qwen3.6-35B-A3B-NVFP4` | 35B totales, 3B activos | 262K | Apache 2.0 | NVFP4 | HuggingFace, oficial de NVIDIA (referido en la model card) |

No se dispone de datos de rendimiento comparado entre estas versiones en la informacion proporcionada. El checkpoint analizado parece ser una copia de la version de NVIDIA, pero no se ha verificado su integridad ni procedencia oficial.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; como cualquier modelo de lenguaje, puede reflejar sesgos presentes en los datos de entrenamiento originales, que estan sin divulgar.
- Riesgo de alucinacion: al ser un modelo autorregresivo, existe la posibilidad de generar contenido plausible pero incorrecto, especialmente en tareas con poca informacion verificable.
- Limitaciones de idioma: no se informa de los idiomas soportados, por lo que su rendimiento en lenguas distintas del ingles no esta garantizado.
- Requisitos de hardware restrictivos: la cuantizacion NVFP4 exige GPUs NVIDIA Hopper o Blackwell; esto impide su ejecucion en muchos sistemas de consumo y reduce las opciones de despliegue.
- Perdida de precision por cuantizacion: al convertir los pesos a 4 bits, puede haber una degradacion de calidad respecto al modelo original, especialmente en tareas sensibles a pequenas variaciones numericas.
- Procedencia dudosa del checkpoint: el repositorio pertenece a un usuario `ssws3` y no al publicador oficial NVIDIA; no tiene descargas ni likes, lo que sugiere que no ha sido validado por la comunidad. Se recomienda verificar el hash y la integridad antes de usarlo en produccion.
- Falta de resultados de benchmarks: al no haber datos publicados, no se puede comparar objetivamente su rendimiento con otros modelos de la misma categoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssws3/reva_llm
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
