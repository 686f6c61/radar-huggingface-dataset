# UtkarshSinghShrinet/swarmhunter-3b-gguf

## Resumen

SwarmHunter 3B es un modelo de lenguaje especializado en ciberseguridad creado y entrenado por Utkarsh Singh Shrinet. Se trata de un ajuste fino supervisado (SFT) sobre Qwen2.5-Coder-3B-Instruct, cuantizado en formato GGUF con precisión Q8_0 para su ejecución local. El modelo se entrenó con 2.280.000 pares de instrucciones relacionados con seguridad ofensiva y defensiva: CVE, CWE, ExploitDB, pruebas de penetración y auditoría de código.

Su propósito es resolver la falta de modelos pequeños y ligeros capaces de razonar sobre vulnerabilidades, analizar exploits y asistir en flujos de trabajo de seguridad ofensiva (CTF, pentesting) sin depender de modelos propietarios de gran tamaño. Al pesar aproximadamente 3,3 GB, puede ejecutarse en hardware de consumo mediante Ollama, llama.cpp o LM Studio, lo que lo hace relevante para investigadores y profesionales de seguridad que necesitan un asistente local, privado y desplegable en portátiles o estaciones de trabajo modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-3B-Instruct) |
| Tipos de cuantizacion | Q8_0 (~3,06 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

SwarmHunter 3B parte de la arquitectura transformer de Qwen2.5-Coder-3B-Instruct, un modelo decoder denso de 3,09 mil millones de parametros optimizado para tareas de codigo. El ajuste fino se realizo mediante una estrategia denominada Sequential Cumulative LoRA Chaining: 46 partes secuenciales de entrenamiento con adaptadores LoRA de rank 16 y alpha 32, donde el conocimiento se acumula de forma progresiva entre partes. El loss final del SFT fue de 0,9617, con un loss de 0,7187 en la parte 46 y una precision media por token del 80,62%.

El dataset de entrenamiento consta de 2.280.000 pares de instrucciones SFT compuestos por datos de CVE, CWE, ExploitDB, pruebas de penetracion y auditoria de codigo. No hay informacion disponible sobre el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT. La version publicada en este repositorio es la cuantizacion GGUF Q8_0, que mantiene alta precision respecto a los pesos originales con un tamano de aproximadamente 3,06 GB.

## Capacidades

- Deteccion autonoma de vulnerabilidades y triaje de CWE/CVE sobre codigo fuente o descripciones tecnicas.
- Analisis de exploits y razonamiento sobre proof-of-concept (PoC).
- Generacion de parches seguros y remediacion de codigo vulnerable.
- Flujos de trabajo de agente para CTF y seguridad ofensiva.
- Generacion de texto conversacional general (pipeline text-generation), heredada del modelo base instruct.
- Compatibilidad con ejecucion directa en Ollama mediante la integracion de Hugging Face Hub.

No hay informacion disponible sobre soporte nativo de tool calling, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Triaje automatizado de CVE y CWE: el modelo puede clasificar y describir vulnerabilidades a partir de reportes o fragmentos de codigo, util para equipos de seguridad que procesan grandes volumenes de avisos.
- Auditoria de codigo: analisis de repositorios en busca de patrones inseguros (inyeccion, desbordamientos, gestion incorrecta de credenciales), aprovechando la base de Qwen2.5-Coder en comprension de codigo.
- Asistencia en CTF: generacion de hipotesis, analisis de binarios o scripts de exploit y razonamiento paso a paso durante competiciones de seguridad ofensiva.
- Generacion de parches seguros: propuesta de remediaciones concretas para codigo vulnerable detectado en revisiones de codigo o pipelines de CI/CD.
- Analisis de exploits de ExploitDB: interpretacion y explicacion de exploits publicos para evaluar su relevancia frente a activos propios.
- Soporte en pentesting: asistencia en la elaboracion de metodologias, comandos y scripts durante pruebas de penetracion, ejecutandose localmente para mantener la confidencialidad del cliente.
- Entornos air-gapped: despliegue local en redes aisladas donde no se puede usar servicios en la nube, gracias a su tamano reducido y formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de entrenamiento publicados son: loss final de SFT de 0,9617, loss de 0,7187 en la parte 46 y precision media por token del 80,62%, metricas que no son directamente comparables con benchmarks de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3-4 GB para la version Q8_0 (3,06 GB de pesos mas contexto y overhead del runtime).
- GPUs recomendadas: cualquier GPU moderna con 4 GB o mas de VRAM; no se requieren aceleradores de centro de datos. Puede ejecutarse tambien solo en CPU dada su reducida huella.
- Consumer GPUs: cabe comodamente en una RTX 3060 de 12 GB, RTX 4060, RTX 4070 o incluso GPUs integradas con memoria compartida; tambien en portatiles con GPU de gama media.
- Opciones de despliegue: Ollama (ejecucion directa con `ollama run hf.co/UtkarshSinghShrinet/swarmhunter-3b-gguf:latest`), llama.cpp, LM Studio y runtimes compatibles con GGUF.
- Latencia y throughput estimados: no disponible; al tratarse de un modelo de 3B cuantizado en Q8_0, se espera inferencia fluida en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| SwarmHunter 3B (este modelo) | 3,09 B | GGUF (Q8_0) | Ciberseguridad, CVE/CWE, pentesting | Apache 2.0 |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | Safetensors | Codigo general | Apache 2.0 (con restricciones en algunos componentes) |
| WhiteRabbitNeo (variantes 7B/13B) | 7-13 B | GGUF / Safetensors | Ciberseguridad ofensiva | Licencia propia / abierta segun version |

SwarmHunter 3B se diferencia de su modelo base por el ajuste fino masivo en dominio de seguridad (2,28 M de muestras), y ofrece una alternativa mas ligera que los modelos de ciberseguridad basados en 7B-13B, a costa presumiblemente de menor capacidad de razonamiento general.

## Limitaciones y advertencias

- Entrenado en ingles: el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Riesgo de alucinacion tipico de modelos de 3B: puede generar CVE, CWE o detalles tecnicos incorrectos o inventados; toda salida debe verificarse por un profesional.
- Uso dual: al ser un modelo orientado a seguridad ofensiva, su uso esta sujeto a la legislacion aplicable; el responsable del despliegue debe garantizar un uso etico y legal.
- La cuantizacion Q8_0 introduce una perdida minima pero no nula respecto a los pesos originales.
- No hay benchmarks publicados de terceros: las capacidades reales en produccion deben validarse caso por caso.
- Licencia Apache 2.0: permite uso comercial, pero el modelo hereda la licencia y posibles restricciones de Qwen2.5-Coder-3B-Instruct, que conviene revisar.
- Modelo de autor individual con adopcion muy temprana (95 descargas y 1 like en el momento de la ficha): madurez, mantenimiento y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/UtkarshSinghShrinet/swarmhunter-3b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Ejecucion directa en Ollama: `ollama run hf.co/UtkarshSinghShrinet/swarmhunter-3b-gguf:latest`
