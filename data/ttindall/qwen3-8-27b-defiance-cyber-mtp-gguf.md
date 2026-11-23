# ttindall/Qwen3.8-27B-Defiance-Cyber-MTP-GGUF

## Resumen

Qwen3.8-27B Defiance-Cyber Uncensored (MTP, GGUF) es una distribucion cuantizada en formato GGUF de un modelo de 27.320.697.856 parametros (~27B) derivado de la familia Qwen3.8. El autor de esta publicacion, ttindall, no ha entrenado pesos: su aportacion consiste en el empaquetado de las plantillas de chat dentro del propio GGUF, cinco modos de seguridad ofensiva (red team, ingenieria inversa, CTF, triaje de malware y threat intelligence) y pruebas de integracion con llama.cpp y agentes.

Los pesos provienen de HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, una variante sin capa de rechazo (uncensored) del modelo base. El modelo incorpora decodificacion especulativa mediante cabeza MTP (multi-token prediction) propia, un proyector de vision en BF16 y una ventana de contexto configurable de hasta 131.072 tokens segun la configuracion recomendada por el autor.

Es relevante para equipos de seguridad ofensiva y evaluacion que necesitan un modelo local, sin restricciones de rechazo, capaz de razonar sobre rutas de ataque, triaje de binarios o resolucion de retos CTF, con soporte multimodal (image-text-to-text) y despliegue en GPU de consumo de 24 GB. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), con cabeza MTP para decodificacion especulativa y proyector de vision |
| Parametros totales | 27.320.697.856 (~27B) |
| Parametros activos | no disponible (no se declara variante MoE) |
| Longitud de contexto | 131.072 tokens (configuracion recomendada por el autor) |
| Tipos de cuantizacion | GGUF: IQ4_XS, Q6_K_P (mencionadas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con plantilla de chat embebida, proyector mmproj BF16 y draft FastMTP-32K opcional) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de identificarla como Qwen3.8 de ~27B. Lo que si describe es la cadena de derivacion: los pesos son byte a byte identicos a los de HauhauCS (el autor afirma haber verificado los 866 tensores de cada cuantizacion contra los archivos originales). HauhauCS se encarga de la eliminacion de rechazos; ttindall no entrena nada, solo anade plantillas y modos.

La innovacion tecnica destacable es la decodificacion especulativa con la propia cabeza MTP del modelo (`--spec-type draft-mtp`), que funciona en llama.cpp estandar sin archivo draft externo. Opcionalmente se puede usar el draft FastMTP-32K de HauhauCS, que requiere aplicar un parche a llama.cpp y recompilar, y aporta aproximadamente un 5% de velocidad adicional (104,7 frente a 99,2 tok/s medidos). El proyector de vision BF16 se distribuye sin cambios respecto al original. No se documentan volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento con modos de esfuerzo nativos (`xhigh`, `medium`, `low`) y modos persona adicionales.
- Razonamiento ofensivo de seguridad en cinco modos: `redteam` (rutas de ataque ordenadas por probabilidad y ruido, comandos ejecutables, IDs ATT&CK, telemetria residual), `reverser` (triaje, structs recuperadas, pseudocodigo anotado, offsets), `ctf` (bugs ordenados por coste, sondas de confirmacion, script de resolucion), `malware` (triaje estatico y conductual, tabla de IOC, regla YARA, hunt Sigma/KQL) e `intel` (juicios clave con confianza, TTPs, acciones priorizadas).
- Vision: pipeline image-text-to-text con proyector BF16; el autor reporta 3/3 comprobaciones de imagen superadas.
- Soporte de agentes: la plantilla embebida gestiona mensajes de sistema o developer posteriores al primer turno y mapea nombres de esfuerzo de agentes a los niveles nativos (`high`/`max` a `xhigh`, `minimal`/`none` a `low`).
- Integracion como endpoint compatible con OpenAI mediante llama-server.
- Modos persona de DavidAU (40 constructs, 2.500-3.600 tokens cada uno) heredados de la linea Defiance.
- Los cinco modos cyber ocupan entre 1.400 y 1.750 caracteres (~350-450 tokens), aptos para contextos de agente.

## Casos de uso

- Red team en engagement autorizado: invocar el modo `redteam` para obtener rutas de ataque priorizadas con comandos ejecutables, IDs ATT&CK y la telemetria que deja cada paso, util para planificar y documentar pruebas de intrusion con permiso escrito.
- Ingenieria inversa de binarios: el modo `reverser` devuelve triaje, structs recuperadas, pseudocodigo anotado y offsets concretos, adecuado para analisis de muestras en laboratorio aislado.
- Resolucion de retos CTF: el modo `ctf` ordena hipotesis de bugs por coste y genera sondas y scripts de resolucion, apropiado para competiciones y formacion.
- Triaje de malware en respuesta a incidentes: el modo `malware` produce tabla de IOC, regla YARA y consulta Sigma/KQL para alimentar directamente el SIEM.
- Redaccion de threat intelligence: el modo `intel` estructura juicios clave con nivel de confianza, TTPs y acciones priorizadas para informes internos.
- Agente de codigo local: conectando llama-server como endpoint OpenAI-compatible, el modelo puede integrarse en pipelines de CI/CD o asistentes de programacion con contexto largo de 131K tokens.
- Analisis de capturas o diagramas: gracias al proyector de vision, puede interpretar imagenes junto a texto, por ejemplo diagramas de red o capturas de pantalla en tareas de reconocimiento.
- Despliegue en estacion de trabajo de 24 GB: con IQ4_XS y contexto de 131K en q8_0 K/V, el autor mide 99,2 tok/s en llama.cpp estandar, viable para uso interactivo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento medidos por el autor son de throughput y pruebas funcionales:

| Configuracion | Hardware | Comprobaciones | Imagenes | Throughput |
|---|---|---|---|---|
| IQ4_XS + proyector, llama.cpp estandar (commit 2cbe0ec) | GPU 24 GB | 12/12 | 3/3 | 99,2 tok/s |
| IQ4_XS + FastMTP-32K + proyector, llama.cpp parcheado | GPU 24 GB | 12/12 | 3/3 | 104,7 tok/s |
| Q6_K_P + proyector | 32 GB o mas | no ejecutado | no ejecutado | no disponible |

## Requisitos de hardware

- VRAM estimada: IQ4_XS encaja en GPU de 24 GB con contexto de 131.072 tokens y cache K/V en q8_0; Q6_K_P requiere 32 GB o mas segun el autor.
- GPU recomendadas: cualquier GPU consumer o profesional con 24 GB (por ejemplo RTX 4090 o equivalentes); el autor no nombra modelos concretos. Para Q6_K_P se necesita 32 GB o mas.
- Cabe en GPU consumer de 24 GB con la cuantizacion IQ4_XS y el proyector de vision.
- Opciones de despliegue: llama.cpp (llama-server) como via principal y documentada; endpoint compatible con OpenAI para agentes y Open WebUI. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 99,2 tok/s con IQ4_XS en llama.cpp estandar; 104,7 tok/s con el draft FastMTP-32K y el parche de HauhauCS.
- Parametros de ejecucion recomendados: `-ngl all`, `-fa on`, `-ctk q8_0 -ctv q8_0`, `--jinja`, `--reasoning on --reasoning-format deepseek --reasoning-budget 16384`, `--temp 0.7 --top-p 0.95 --top-k 64 --min-p 0.05 --repeat-penalty 1.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B Defiance-Cyber (este) | ~27B | 131K | Apache 2.0 | GGUF con plantilla embebida, 5 modos cyber, vision, MTP |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | ~27B | no disponible | no disponible | Pesos base sin rechazos; origen de los tensores de este modelo |
| ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF | ~27B | no disponible | no disponible | Defiance v2 sin los cinco modos cyber |
| DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF | ~27B | no disponible | no disponible | Origen de los 40 constructs persona |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo uncensored: la capa de rechazo ha sido eliminada de los pesos, por lo que puede generar contenido danino sin filtro. El uso de los modos ofensivos debe limitarse a sistemas propios o con permiso escrito.
- Los modos cyber codifican metodo y estructura, no conocimiento adicional; no compensan lagunas de conocimiento de los pesos base.
- Riesgo de alucinacion no evaluado en la informacion disponible; en dominios tecnicos como offsets de binarios o IDs ATT&CK, verificar siempre las salidas.
- Idiomas soportados no declarados; no hay garantia documentada de calidad multilingue.
- La cuantizacion IQ4_XS introduce perdida de precision respecto a BF16; para tareas sensibles conviene Q6_K_P o pesos superiores.
- El draft FastMTP-32K no carga en llama.cpp estandar: requiere aplicar un parche y recompilar, lo que anade complejidad de despliegue.
- La plantilla embebida exige `--jinja`; sin el, el comportamiento de los modos y del mapeo de esfuerzo de agentes no se aplica.
- Licencia Apache 2.0 declarada en esta publicacion, pero la procedencia de los pesos base (HauhauCS) y de los constructs (DavidAU) conviene verificarla antes de uso comercial.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validacion muy limitado, sin auditoria externa.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/ttindall/Qwen3.8-27B-Defiance-Cyber-MTP-GGUF
- Pesos base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Plantilla Defiance v2: https://huggingface.co/ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF
- Constructs originales (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Parche llama.cpp de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/blob/main/HauhauCS-FastMTP-llama.cpp.patch
