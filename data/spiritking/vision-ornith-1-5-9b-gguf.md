# SpiritKing/VISION-Ornith-1.5-9B-GGUF

## Resumen

VISION-Ornith-1.5-9B-GGUF es una cuantizacion standalone en formato GGUF (Q4_K_M, 5,24 GB) del fine-tune SpiritKing/VISION-Ornith-1.5-9B, a su vez derivado del modelo base ornith-ai/Ornith-1.5-9B. Lo publica el usuario SpiritKing y su proposito es empaquetar un modelo afinado para tareas de agente y vision en un fichero unico ejecutable con llama.cpp y Ollama, sin necesidad de cargar el adaptador LoRA por separado.

El modelo cuenta con 8.953.803.264 parametros (~8,95 B) en precision completa y el repositorio ocupa 5,6 GB, practicamente todo correspondiente al unico fichero Q4_K_M de 5,24 GB. Los tags del repositorio incluyen `vision`, `qwen3_5`, `llama-cpp`, `ollama` y `endpoints_compatible`, lo que sugiere una base de la familia Qwen3.5 con capacidad multimodal, si bien la informacion disponible no confirma la arquitectura exacta ni el mecanismo de vision.

Su relevancia es практик... Su relevancia practica es doble: por un lado, el fine-tune se entreno sobre el dataset abierto SpiritKing/VISION-v2-Agent-Dataset, orientado a comportamiento agentico; por otro, la licencia MIT declarada y la disponibilidad en GGUF facilitan probarlo en hardware de consumo. Como contrapartida, el repositorio no presenta descargas ni valoraciones y no publica resultados de benchmarks, por lo que debe tratarse como un artefacto experimental sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capacidades de vision (tag `vision`); el tag `qwen3_5` sugiere base de la familia Qwen3.5, no confirmado en la informacion disponible |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo original se distribuye como adaptador LoRA |
| Tamano del repositorio | 5,6 GB |
| Tamano del fichero Q4_K_M | 5,24 GB |
| Modelo base | ornith-ai/Ornith-1.5-9B |
| Dataset de ajuste | SpiritKing/VISION-v2-Agent-Dataset |
| Pipeline | text-generation |
| Compatibilidad de despliegue | llama.cpp, Ollama, endpoints compatibles |
| Fecha de creacion del repo | 2026-10-21 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible describe este repositorio como una cuantizacion Q4_K_M del fine-tune VISION-Ornith-1.5-9B, que a su vez parte de ornith-ai/Ornith-1.5-9B. El tag `qwen3_5` apunta a una base de la familia Qwen3.5 y el tag `vision` a la incorporacion de entrada multimodal, pero no se detalla en la model card ni el tipo de encoder visual, ni el esquema de atencion, ni si se trata de un transformer denso convencional o de una variante hibrida. El número de parametros (8,95 B) es coherente con un modelo denso de escala ~9B.

El ajuste se realizo sobre SpiritKing/VISION-v2-Agent-Dataset, un dataset abierto publicado por el mismo autor y orientado, por su nombre, a comportamiento de agente. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, la receta de alineacion (RLHF, DPO u otra), ni los hiperparametros del fine-tune. Tampoco se documenta el proceso de cuantizacion mas alla del resultado (Q4_K_M con llama.cpp), ni si se aplicaron tecnicas de calibracion especificas para preservar las capacidades multimodales tras la cuantizacion.

La unica innovacion tecnica verificable en la informacion disponible es el empaquetado: se ofrece un artefacto GGUF autocontenido que evita la gestion de adaptadores LoRA en tiempo de inferencia, con un comando de Ollama listo para usar.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`) y el tag `conversational`.
- Procesamiento de entrada visual: el repositorio incluye el tag `vision` y el nombre del modelo lo explicita, aunque no se detalla la resolucion de imagen soportada ni el formato de prompt multimodal.
- Comportamiento agentico y multi-step reasoning: el fine-tune se entreno sobre un dataset denominado "Agent", lo que orienta el modelo a flujos con multiples pasos.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque es coherente con el proposito del dataset de ajuste.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Ejecucion local en CPU y GPU mediante llama.cpp y Ollama, sin dependencias de servidores propietarios.
- Compatibilidad con endpoints compatibles con la API de OpenAI, segun el tag `endpoints_compatible`.

## Casos de uso

- Automatizacion de agentes con vision: el modelo puede recibir capturas de pantalla o imagenes junto a instrucciones textuales y encadenar varios pasos de razonamiento, aprovechando el ajuste sobre VISION-v2-Agent-Dataset para tareas como rellenar formularios web o navegar interfaces.
- Asistencia en soporte tecnico con capturas de error: un usuario envia una imagen de un fallo y el modelo genera un diagnostico textual; el formato GGUF permite desplegarlo en una maquina local sin enviar datos a terceros.
- Procesamiento documental en local: extraccion de informacion de facturas, albaranes o tickets escaneados en entornos donde la confidencialidad impide usar APIs en la nube, con la licencia MIT como base para integracion interna.
- Prototipado rapido de pipelines multimodal en investigación: al ser un unico fichero Q4_K_M de 5,24 GB, se puede iterar sobre prompts y flujos agenticos en un portatil con GPU de gama media antes de invertir en infraestructura mayor.
- Evaluacion comparativa de fine-tunes: util como baseline para medir el efecto del ajuste sobre VISION-v2-Agent-Dataset frente al modelo base ornith-ai/Ornith-1.5-9B en tareas de agente.
- Despliegue en entornos sin conectividad: el binario GGUF se puede distribuir en equipos aislados (por ejemplo, plantas industriales o laboratorios) y ejecutar con Ollama sin acceso a Internet.
- Generacion de descripciones y etiquetado de imagenes a escala moderada en un pipeline de datos propio, siempre que se validen las salidas por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a la ficha del adaptador LoRA original (SpiritKing/VISION-Ornith-1.5-9B) bajo el epigrafe "LoRA Adapter & Benchmarks", pero no reproduce ninguna cifra en este repositorio, por lo que no se pueden aportar valores de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en Q4_K_M ocupan 5,24 GB; anadiendo cache KV y el coste del encoder visual, se puede estimar un consumo de 7-9 GB para contextos moderados. Cifra estimada a partir del tamano del fichero, no publicada por el autor.
- GPU con 8 GB (RTX 3060 Ti, RTX 4060): viable en el limite, con contexto recortado y posible offload parcial de capas.
- GPU con 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super): margen suficiente para contexto amplio y procesamiento de imagenes.
- GPU de datacenter (A100 40/80 GB, H100, L40S): sobredimensionadas para un modelo de 8,95 B en Q4; utiles solo para servir muchas instancias concurrentes.
- CPU: ejecutable con llama.cpp en modo CPU-only ocupando aproximadamente 6 GB de RAM, con latencia notablemente superior.
- Opciones de despliegue: Ollama (`ollama run hf.co/SpiritKing/VISION-Ornith-1.5-9B-GGUF:Q4_K_M`), llama.cpp, LM Studio y servidores compatibles con la API de OpenAI. El soporte de vLLM o TGI para este GGUF multimodal concreto no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de las alternativas provienen del conocimiento general del ecosistema y no han sido verificados contra la informacion proporcionada en esta ficha; conviene contrastarlos antes de usarlos en una decision tecnica.

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| VISION-Ornith-1.5-9B-GGUF | ~8,95 B | No disponible | Si (tag `vision`) | MIT | GGUF Q4_K_M |
| Qwen3-8B | ~8,2 B | 32k nativo, ampliable con YaRN | No | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Instruct | ~8,03 B | 128k | No | Licencia comunitaria Llama 3.1 | safetensors, GGUF |
| Gemma 3 12B | ~12 B | 128k | Si | Licencia Gemma | safetensors, GGUF |

Frente a estas alternativas, la propuesta de SpiritKing se diferencia por combinar vision y ajuste agentico en un unico GGUF con licencia MIT, pero carece de la documentacion de contexto, idiomas y evaluaciones que si acompanan a los modelos de referencia. En terminos de validacion externa, la comparacion es desfavorable: los modelos citados cuentan con benchmarks publicos y adopcion amplia, mientras que este repositorio registra 0 descargas y 0 valoraciones.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks ni evaluaciones de terceros.
- La model card no documenta la longitud de contexto, los idiomas soportados ni el formato exacto de prompt multimodal, lo que complica la integracion en produccion.
- Riesgo de alucinacion inherente a los modelos de ~9 B, agravado en tareas de lectura de imagenes (OCR, tablas, graficos), donde los modelos pequenos suelen degradarse.
- La cuantizacion Q4_K_M introduce perdida de precision; el impacto concreto sobre las capacidades visuales y agenticas no esta medido en la informacion disponible.
- Sesgos: no se documenta la composicion del dataset VISION-v2-Agent-Dataset, por lo que no se pueden evaluar sesgos de genero, idioma, cultura o dominio.
- Licencia MIT declarada en el repositorio, lo que en principio permite uso comercial; sin embargo, la licencia del modelo base ornith-ai/Ornith-1.5-9B no se detalla en la informacion disponible y podria imponer condiciones adicionales que prevalezcan sobre la del derivado.
- Fecha de creacion del repositorio atipica (2026-10-21) y metadatos minimos; conviene verificar la procedencia y la integridad de los pesos antes de desplegarlos.
- No se especifican requisitos de atribucion ni limitaciones de uso aceptable mas alla de la licencia MIT.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SpiritKing/VISION-Ornith-1.5-9B-GGUF
- Adaptador LoRA y benchmarks: https://huggingface.co/SpiritKing/VISION-Ornith-1.5-9B
- Dataset de ajuste: https://huggingface.co/datasets/SpiritKing/VISION-v2-Agent-Dataset
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Ejecucion con Ollama: `ollama run hf.co/SpiritKing/VISION-Ornith-1.5-9B-GGUF:Q4_K_M`
