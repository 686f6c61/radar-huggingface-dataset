# Vaprix-Ai/vaprix-cyber

## Resumen

Vaprix-Cyber es un modelo de lenguaje especializado en ciberseguridad ofensiva y defensiva, publicado por Vaprix-Ai (SecureMID-Solutions) bajo licencia Apache 2.0. Está afinado para tres tareas concretas: análisis autónomo de vulnerabilidades, validación determinista de pruebas de concepto (PoC) y síntesis de parches en forma de *unified diff* verificados sintácticamente sobre el AST. El modelo se presenta como alternativa a los LLM genéricos, que según el autor alucinan exploits no funcionales o rechazan el análisis de seguridad defensiva.

El modelo tiene 3.085.938.688 parámetros (aproximadamente 3,1 mil millones) según los pesos en safetensors, lo que lo sitúa en la gama de modelos pequeños desplegables en hardware de consumo. El repositorio ocupa 1,9 GB, coherente con pesos en precisión reducida y una versión GGUF para Ollama. Los idiomas declarados se limitan al inglés.

La relevancia del modelo radica en su enfoque: en lugar de generar texto libre sobre seguridad, produce artefactos ejecutables (comandos `curl` con aserciones HTTP y parches `git apply` listos para PR) y mapea hallazgos a taxonomías MITRE CWE y vectores CVSS v3.1. No obstante, las cifras de benchmark son declaradas por el autor, no verificadas, y se basan en conjuntos de evaluación muy reducidos (entre 3 y 5 ítems por suite), lo que limita su valor probatorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura base no especificada en la model card) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (version cuantizada publicada en Ollama); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura base ni el número de tokens de entrenamiento. Se trata de un transformer decoder-only de aproximadamente 3,1 mil millones de parámetros, presumiblemente un *fine-tuning* de un modelo base abierto, aunque el autor no identifica cuál. El formato de prompt empleado en los ejemplos usa las etiquetas especiales `<|im_start|>` y `<|im_end|>`, habituales en la familia Qwen, pero esto es una inferencia a partir de los ejemplos y no un dato confirmado.

El entrenamiento se realizó sobre un dataset propio denominado `custom-curated-cyber-vapt`, sin que se especifiquen su tamaño, composición ni proporción de datos de instrucción, RLHF o DPO. La innovación técnica declarada no está en la arquitectura sino en el comportamiento: generación de PoC deterministas con aserciones y códigos de estado HTTP esperados, parches en formato diff aplicables con `git apply` para Python, TypeScript, Go y Java, y un conjunto de barreras de seguridad ("hardcoded safety boundaries") que impiden generar cargas maliciosas contra rangos RFC 1918, loopback o el endpoint IMDS de metadatos en la nube sin autorización.

## Capacidades

- Generación de texto técnico especializado en seguridad, en inglés.
- Análisis de vulnerabilidades sobre endpoints y rutas de API (por ejemplo, BOLA en `GET /api/v2/invoices/{id}/download`).
- Generación de PoC deterministas en forma de comandos `curl` con aserciones y expectativas de código de estado HTTP.
- Síntesis de parches en formato *unified diff* listos para `git apply`, en Python, TypeScript, Go y Java.
- Mapeo de hallazgos a taxonomías MITRE CWE y cálculo de vectores CVSS v3.1.
- Reparación de código orientada a la causa raíz sin alterar la lógica de negocio, según el autor.
- Guardrails integrados que rechazan la generación de *payloads* destructivos o de ransomware y limitan el alcance a rangos RFC 1918, loopback e IMDS sin autorización.
- Soporte de *tool calling* / *function calling*: no disponible (no declarado en la model card).
- Soporte de agentes multi-paso: no disponible como capacidad del modelo; la orquestación multiagente (15 agentes con LangGraph) se ofrece en la plataforma SaaS del autor, no en el modelo.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo *thinking* explícito: no disponible.

## Casos de uso

- Auditoría de APIs REST en pipelines de CI/CD: el modelo recibe la definición de una ruta y devuelve un PoC `curl` con aserciones y un parche diff que corrige la causa raíz, de modo que el equipo puede integrar la comprobación como paso automatizado en GitHub Actions o GitLab CI.
- Triaje y enriquecimiento de hallazgos de SAST/DAST: dado un resultado de escáner, el modelo lo clasifica con CWE y CVSS v3.1, lo que reduce el trabajo manual de priorización en equipos de AppSec.
- Generación de pull requests de remediación: al producir diffs aplicables en Python, TypeScript, Go y Java, encaja en flujos donde un bot abre un PR con el parche y lo somete a revisión humana, con la ventaja de que el diff ya es sintácticamente válido.
- Validación de pruebas de concepto en programas de bug bounty: el modelo formula PoC deterministas que el investigador puede ejecutar contra un entorno de laboratorio autorizado, evitando exploits no funcionales generados por LLM genéricos.
- Formación y concienciación en seguridad: sirve para generar ejemplos didácticos de vulnerabilidades del OWASP Top 10 junto con su remediación, en un entorno controlado y con los guardrails de alcance activos.
- Despliegue local en estaciones de trabajo de analistas: con ~3,1 B de parámetros y una versión GGUF en Ollama, puede ejecutarse en una GPU de consumo o incluso en CPU, lo que permite analizar código sensible sin enviarlo a una API externa.
- Asistencia a equipos de red team en la fase de documentación: genera comandos reproducibles y vectores CVSS para el informe final, manteniendo la coherencia taxonómica entre hallazgos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo, no verificados de forma independiente. Los conjuntos de evaluación son muy reducidos (entre 3 y 5 ítems por suite), por lo que los porcentajes deben interpretarse con cautela.

| Suite de evaluacion | Area evaluada | Resultado | Items |
|---|---|---|---|
| SWE-bench (Security Subset) | Sintesis de parches sobre AST | 100,0 % (5/5) | 5 |
| SecQA Benchmark | Conocimiento de vulnerabilidades y mapeo CWE | 100,0 % (3/3) | 3 |
| SafetyBench (Alignment) | Limites de alcance RFC 1918 y guardrails | 100,0 % (3/3) | 3 |
| Meta CyberSecEval | Explotacion y formulacion de PoC deterministas | 80,0 % (4/5) | 5 |
| TruthfulQA (Security) | Precision tecnica sin alucinacion | 75,0 % (3/4) | 4 |
| Puntuacion global | Benchmark compuesto de seguridad | 90,0 % (18/20) | 20 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 6,2 GB solo para pesos (3,1 B × 2 bytes), más overhead de KV cache; en cuantización de 8 bits, unos 3,1 GB; en 4 bits, unos 1,6-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4); para cuantizaciones de 4-8 bits basta con 4-6 GB (RTX 3050, GTX 1660 Super, T4).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 6-8 GB de VRAM, y en CPU con cuantización GGUF.
- Opciones de despliegue: Ollama (modelo publicado como `dishankagrawal05/vaprix-cyber`), Transformers con `device_map="auto"`, vLLM (mencionado en la model card). llama.cpp es viable vía el GGUF; TGI no está confirmado.
- Latencia y throughput estimados: no disponibles. El ejemplo de la model card usa `max_new_tokens=512` y `temperature=0.2`, lo que sugiere generaciones cortas y deterministas, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| Vaprix-Cyber | 3,1 B | no disponible | Ciberseguridad y remediacion AST | Apache 2.0 | 90 % compuesto (18/20, no verificado) |
| Modelos genericos tipo Llama 3 (8B) | 8 B | 8 192 tokens (referencia) | Proposito general | Licencia comunitaria Meta | Amplios benchmarks publicos |
| GPT-4o / Claude 3.5 | no disponible | no disponible | Proposito general | Propietaria | Amplios benchmarks publicos |

La model card compara el modelo con GPT-4o, Claude 3.5 y Llama 3 en terminos cualitativos, afirmando que estos rechazan el analisis defensivo o alucinan exploits. No se aportan cifras comparativas directas ni una evaluacion cabeza a cabeza sobre los mismos conjuntos. No se dispone de datos sobre modelos especializados en seguridad comparables (por ejemplo, variantes de SecLLM) en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmark son autodeclarados y no verificados (`verified: false` en el model-index), y se calculan sobre conjuntos de 3 a 5 ítems, insuficientes para extraer conclusiones estadísticas robustas.
- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- La longitud de contexto no está publicada, lo que impide planificar su uso sobre ficheros de código grandes o trazas extensas.
- Riesgo de alucinación: aunque el autor declara un 75 % en TruthfulQA (Security) sobre 4 ítems, un modelo de 3,1 B puede generar PoC o parches plausibles pero incorrectos; todo artefacto debe validarse en un entorno de laboratorio antes de su uso.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card impone una condición ética explícita (autorización escrita previa, reglas de enfrentamiento) que no forma parte de la licencia y cuya exigibilidad legal es dudosa; conviene revisarla con asesoría jurídica antes de un despliegue comercial.
- Los guardrails de alcance (RFC 1918, loopback, IMDS) pueden producir falsos rechazos en pruebas legítimas contra infraestructura propia que use direcciones privadas.
- El modelo no sustituye a un análisis humano: los parches generados deben pasar revisión de código y pruebas de regresión.
- El ecosistema que rodea al modelo (orquestación con LangGraph, generación de SARIF 2.1.0, integración con GitHub/GitLab) pertenece a la plataforma SaaS del autor, no al modelo open source; no debe asumirse que esas capacidades están disponibles al descargar los pesos.
- El repositorio no registra descargas ni *likes* en el momento de la consulta, y el modelo se creó y actualizó el mismo día (18 de noviembre de 2026), lo que indica una madurez y validación comunitaria aún inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vaprix-Ai/vaprix-cyber
- Versión en Ollama: https://ollama.com/dishankagrawal05/vaprix-cyber
- Sitio del autor: https://vaprix.ai
- Repositorio de la plataforma: https://github.com/SecureMID-Solutions/Vaprix_AI
- Logo y assets: https://raw.githubusercontent.com/SecureMID-Solutions/Vaprix_AI/main/docs/assets/vaprix-logo-full.png
