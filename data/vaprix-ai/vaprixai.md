# Vaprix-Ai/VaprixAi

## Resumen

Vaprix-Cyber es un modelo de lenguaje especializado en ciberseguridad ofensiva y defensiva, publicado por Vaprix-Ai (SecureMID Solutions) bajo licencia Apache 2.0. Se presenta como un ajuste fino orientado a tres tareas concretas: análisis autónomo de vulnerabilidades, validación determinista de pruebas de concepto (PoC) y síntesis de parches a nivel de AST que sean sintácticamente válidos y aplicables con `git apply`. El modelo se distribuye en formato GGUF y está pensado para ejecutarse localmente, incluso en Ollama.

El modelo declara como base `Qwen/Qwen3.8-27B`, aunque los pesos publicados en el repositorio contienen 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), lo que supone una discrepancia notable respecto al nombre del modelo base indicado. El repositorio ocupa 1,9 GB, coherente con un modelo de ~3B en cuantización de 4-8 bits o con pesos en precisión reducida. Esta inconsistencia debe tenerse en cuenta al evaluar el modelo en producción.

La propuesta de valor del autor es diferenciarse de los LLM generalistas, que según la model card alucinan exploits no funcionales o rechazan análisis de seguridad defensiva. Vaprix-Cyber afirma emitir comandos `curl` ejecutables, parches en formato diff unificado y puntuaciones CWE/CVSS v3.1, con barreras de seguridad para evitar la generación de payloads destructivos contra rangos RFC 1918, loopback o el IMDS de proveedores cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen; detalles especificos no disponibles) |
| Parametros totales | 3.085.938.688 (~3,09B) segun safetensors |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,9 GB); safetensors referenciados en metadatos |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de generacion de texto derivado de la familia Qwen. El autor declara un ajuste fino sobre un dataset propio denominado `custom-curated-cyber-vapt`, orientado a evaluacion de vulnerabilidades, mapeo CWE/CVSS y generacion de parches. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o preferencias.

Como innovaciones tecnicas destacables, la model card menciona la sintesis de parches verificados sintacticamente a nivel de AST en Python, TypeScript, Go y Java, la emision de PoCs deterministas con aserciones y codigos HTTP esperados, y un conjunto de barreras de seguridad ("guardrails") que limitan la generacion de payloads contra rangos privados sin autorizacion explicita. No se aportan detalles sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto tecnico especializado en ciberseguridad y reparacion de codigo.
- Analisis de vulnerabilidades web y de API, incluyendo mapeo a taxonomia MITRE CWE.
- Puntuacion CVSS v3.1 con cadenas de vector.
- Generacion de PoCs deterministas en forma de comandos `curl` con aserciones y codigos de estado HTTP esperados.
- Sintesis de parches en formato diff unificado (`git apply` ready) para Python, TypeScript, Go y Java.
- Deteccion de clases de vulnerabilidad como BOLA/IDOR, SSRF (incluido acceso a metadatos IMDS) y las del OWASP Top 10.
- Barreras de seguridad para evitar generacion de payloads destructivos o ransomware contra rangos RFC 1918, loopback e IMDS.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible como capacidad nativa del modelo; el autor menciona una plataforma SaaS separada con orquestacion LangGraph de 15 agentes.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Revision de seguridad de APIs en CI/CD: el modelo puede recibir endpoints y devolver hallazgos con CWE y CVSS, integrandose en pipelines para bloquear merges con vulnerabilidades conocidas antes de produccion.
- Generacion automatica de pull requests de remediacion: a partir de un diff o fragmento de codigo vulnerable, produce parches en formato unificado aplicables con `git apply`, reduciendo el tiempo entre deteccion y correccion.
- Validacion de pruebas de concepto en programas de bug bounty: genera comandos `curl` con aserciones reproducibles que el analista puede ejecutar contra entornos autorizados para confirmar explotabilidad.
- Formacion y concienciacion en equipos de desarrollo: sirve como motor de explicaciones sobre OWASP Top 10 y patrones de vulnerabilidad, con ejemplos tecnicos concretos en lugar de descripciones genericas.
- Asistencia a equipos de red team en entornos controlados: automatiza la formulacion de hipotesis de ataque y PoCs sobre superficies internas, respetando los limites de alcance definidos en las reglas de enfrentamiento.
- Triaje de hallazgos de escaneres SAST/DAST: normaliza resultados heterogeneos a taxonomia CWE y prioriza por CVSS v3.1, facilitando la gestion de colas de remediacion.
- Despliegue local con Ollama para equipos con requisitos de confidencialidad: al distribuirse como GGUF y caber en hardware de consumo, permite analisis de codigo sensible sin enviar datos a APIs externas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Suite de benchmark | Area evaluada | Resultado | Estado declarado |
|---|---|---|---|
| SWE-bench (Security Subset) | Sintesis de parches AST | 100,0% (5/5) | Flawless |
| SecQA Benchmark | Conocimiento de vulnerabilidades y mapeo CWE | 100,0% (3/3) | Flawless |
| SafetyBench (Alignment) | Limites de alcance RFC1918 y guardrails | 100,0% (3/3) | Flawless |
| Meta CyberSecEval | Formulacion de PoCs deterministas | 80,0% (4/5) | High |
| TruthfulQA (Security) | Precision tecnica sin alucinaciones | 75,0% (3/4) | Reliable |
| Overall Industry Score | Compuesto de seguridad | 90,0% (18/20) | Certified |

Advertencia: el `model-index` marca la metrica global como `verified: false`. Los tamanos de muestra son muy reducidos (3 a 5 items por suite), lo que limita severamente la significacion estadistica de los resultados. No se han publicado comparaciones con modelos de referencia en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~3,09B parametros, aproximadamente 2 GB en cuantizacion Q4, 3-4 GB en Q5/Q6 y 6-7 GB en FP16. Estimaciones orientativas; no confirmadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070) para cuantizaciones bajas; A100/H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs modernas con 6 GB o mas. Verificar con el GGUF publicado.
- Opciones de despliegue: Ollama (`ollama run dishankagrawal05/vaprix-cyber`), llama.cpp por el formato GGUF, Transformers con `device_map="auto"` y vLLM segun la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vaprix-Cyber | ~3,09B | no disponible | Ciberseguridad, AST patching | Apache 2.0 | Hugging Face, Ollama |
| Qwen2.5-Coder-3B (referencia de tamano) | ~3B | 32K (tipico en la familia) | Codigo general | Apache 2.0 | Hugging Face |
| WhiteRabbitNeo (variantes) | 7B-33B | variable | Seguridad ofensiva/defensiva | variable | Hugging Face |
| Llama 3.2 3B Instruct | ~3,2B | 128K | Proposito general | Llama 3.2 Community | Hugging Face, Ollama |

Nota: los datos de los modelos comparables son orientativos y pueden variar segun la version concreta; no se dispone de comparaciones directas de rendimiento publicadas por el autor. La fila de Qwen2.5-Coder y Llama 3.2 se incluye como referencia de categoria por tamano, no como sustituto verificado.

## Limitaciones y advertencias

- Discrepancia entre el modelo base declarado (`Qwen/Qwen3.8-27B`) y el numero real de parametros (~3,09B): conviene verificar la procedencia y el proceso de ajuste antes de confiar en el modelo.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Longitud de contexto no documentada; puede ser insuficiente para analisis de repositorios completos.
- Riesgo de alucinacion en PoCs y parches: aunque el autor declara mitigaciones, un 75% en TruthfulQA (Security) sobre 4 items no es evidencia solida de cero alucinaciones.
- Benchmarks con muestras minimas (3-5 items) y no verificados: los porcentajes del 100% no son extrapolables a entornos reales.
- Riesgo de uso dual: la generacion de PoCs y comandos de explotacion puede emplearse sin autorizacion. La licencia Apache 2.0 no impone restricciones de uso; las salvaguardas son solo tecnicas y pueden eludirse.
- Las barreras de seguridad (RFC 1918, loopback, IMDS) pueden generar falsos rechazos en pruebas legitimas sobre infraestructura interna autorizada.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a prompts adversarios.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor exige autorizacion escrita (Rules of Engagement) para evaluar sistemas; esta exigencia no es juridicamente vinculante bajo dicha licencia.
- El modelo tiene 14 descargas y 1 like en el momento de la ficha: madurez y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/Vaprix-Ai/VaprixAi
- Ollama: https://ollama.com/dishankagrawal05/vaprix-cyber
- Plataforma SaaS del autor: https://vaprixai.securemid.com
- Repositorio GitHub: https://github.com/SecureMID-Solutions/Vaprix_AI
- Logo del proyecto: https://raw.githubusercontent.com/SecureMID-Solutions/Vaprix_AI/main/docs/assets/vaprix-logo-full.png
