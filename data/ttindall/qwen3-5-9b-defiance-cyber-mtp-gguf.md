# ttindall/Qwen3.5-9B-Defiance-Cyber-MTP-GGUF

## Resumen

Qwen3.5-9B Defiance-Cyber es una cuantización GGUF publicada por el usuario ttindall sobre los pesos del modelo comunitario HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive, a su vez derivado de la familia Qwen3.5 de Alibaba. El autor no entrena pesos nuevos: empaqueta los pesos de HauhauCS byte a byte y añade una plantilla de chat propia ("Defiance v2") con cinco modos de seguridad ofensiva (`redteam`, `reverser`, `ctf`, `malware`, `intel`) y 40 "constructs" de persona heredados del trabajo de DavidAU. El objetivo declarado es disponer de un asistente orientado a ciberseguridad ofensiva, análisis de malware, ingeniería inversa y CTFs en tarjetas gráficas donde no cabe la variante de 27B del mismo autor.

La relevancia técnica del repositorio no está en los pesos, sino en el empaquetado: incluye un sidecar MTP (multi-token prediction) con la cabeza de predicción de Qwen como modelo borrador para decodificación especulativa en llama.cpp, y conserva el proyector de visión BF16 de HauhauCS, de modo que el modelo sigue siendo image-text-to-text. Según el autor, esto eleva el throughput de 138,6 a 190,7 tok/s en su hardware, con una tasa de aceptación de borradores del 53%.

El modelo tiene 8.953.803.264 parámetros (aproximadamente 9B), se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse en llama.cpp y servidores compatibles con la API de OpenAI. Es un modelo sin censura, con las implicaciones legales y éticas que eso conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con cabeza MTP opcional en sidecar; proyector de visión BF16 |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens recomendados en la configuración medida; el autor indica que Qwen3.5-9B soporta hasta 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M y Q6_K publicados; sidecar MTP en Q8_0; proyector BF16 |
| Idiomas soportados | No disponible (la model card no detalla idiomas; hereda los de Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con plantilla de chat embebida y sidecar MTP separado |
| Tamano del repositorio | 16,3 GB |
| Pipeline | image-text-to-text (visión + texto) |
| Modelo base | HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive (relación: quantized) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con aproximadamente 9B parámetros. ttindall no realiza entrenamiento alguno: los pesos son, según su propia verificación tensor a tensor (427 tensores por cuantización), idénticos a los de HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive, un derivado comunitario sin censura del Qwen3.5-9B original. El proyector de visión es también el BF16 de HauhauCS, sin modificar.

La aportación del autor es de ingeniería de inferencia y prompting. Por un lado, porta la plantilla "Defiance v2" a Qwen3.5 y la embebe en cada GGUF, añadiendo cinco modos de ciberseguridad de entre 350 y 450 tokens cada uno, más los constructs de persona de DavidAU (2.500 a 3.600 tokens por turno). Por otro, publica un sidecar con la cabeza MTP nativa de Qwen como modelo borrador para decodificación especulativa (`--spec-type draft-mtp`), ya que los GGUF estándar de Qwen3.5-9B, incluido el de HauhauCS, se distribuyen sin esa cabeza. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto configurable hasta 262.144 tokens en el modelo subyacente.
- Razonamiento con bloque de pensamiento (`--reasoning on`, formato deepseek, presupuesto configurable hasta 8.192 tokens).
- Visión: entrada image-text-to-text mediante el proyector BF16; el autor reporta 3 de 3 comprobaciones de imagen correctas.
- Modos de ciberseguridad ofensiva y análisis: `redteam` (rutas de ataque priorizadas, comandos ejecutables, IDs ATT&CK, telemetría por paso), `reverser` (triaje, structs recuperados, pseudocódigo anotado, offsets), `ctf` (bugs ordenados por coste, sondas de confirmación, script de resolución), `malware` (triaje estático y de comportamiento, tabla de IOCs, regla YARA, hunt Sigma o KQL) e `intel` (juicios con confianza, TTPs, acciones priorizadas).
- Selección de modo por API (`"reasoning_effort": "redteam"`) o por etiqueta en el mensaje (`{REASON:redteam}`, `{REASON:iredteam}` para la variante instruct sin bloque de pensamiento).
- Integración como endpoint compatible con OpenAI para agentes de código; los nombres de esfuerzo de los agentes se mapean a los niveles nativos (`high` y `max` como `xhigh`; `minimal` y `none` como `low`).
- Decodificación especulativa mediante sidecar MTP, con 53% de borradores aceptados según el autor.
- Sin modo activo, el modelo se comporta como Qwen3.5 estándar más un preámbulo sin censura, desactivable con `"chat_template_kwargs": {"defiance_preamble": false}`.

## Casos de uso

- Ejercicios de red team autorizados: el modo `redteam` devuelve rutas de ataque ordenadas por probabilidad y ruido, comandos ejecutables y la telemetría que deja cada paso, lo que permite planificar engagements y preparar el informe para el cliente sin salir del flujo de trabajo.
- Ingeniería inversa de binarios: el modo `reverser` produce triaje inicial, estructuras recuperadas, pseudocódigo anotado y los pasos de depurador con funciones y offsets concretos, útil como primer analista sobre muestras en un laboratorio aislado.
- Resolución de CTFs: el modo `ctf` prioriza los bugs probables por coste, propone sondas que confirman o descartan cada hipótesis y entrega un script de resolución completo, adecuado para competiciones con tiempo limitado.
- Análisis de malware en respuesta a incidentes: el modo `malware` genera triaje estático y de comportamiento, mapeo ATT&CK, tabla de IOCs, regla YARA y una búsqueda Sigma o KQL lista para desplegar en el SIEM.
- Inteligencia de amenazas: el modo `intel` estructura juicios clave con nivel de confianza, TTPs observadas y acciones priorizadas, lo que facilita briefings ejecutivos y planes de mitigación.
- Asistente de visión para análisis de capturas y diagramas: gracias al proyector BF16 puede interpretar pantallas de herramientas, diagramas de red o capturas de tráfico en formato imagen dentro de un flujo de análisis técnico.
- Despliegue local en estaciones de trabajo: con Q4_K_M, sidecar y proyector ocupa 8,8 GB en la tarjeta y alcanza 190,7 tok/s según el autor, lo que permite tener un asistente de seguridad sin conexión en un portátil con GPU de gama alta para consumo.
- Automatización con agentes de código: al exponerse como endpoint compatible con OpenAI, un agente puede invocar el modelo para tareas de reconocimiento, generación de scripts de explotación en entornos de prueba o revisión de configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de su propia prueba: 12 de 12 comprobaciones superadas y 3 de 3 imágenes correctas con Q4_K_M, sidecar y proyector a 32K de contexto con K/V en q8_0, 8,8 GB de VRAM y 190,7 tok/s; y para Q6_K, solo comprobaciones a nivel de fichero, con aproximadamente 1,7 GB adicionales. No hay datos de MMLU, HumanEval, GSM8K ni comparativas estandarizadas.

## Requisitos de hardware

- VRAM estimada: 8,8 GB en tarjeta para Q4_K_M + sidecar Q8_0 + proyector BF16 a 32K de contexto con K/V en q8_0 (dato medido por el autor). Q6_K requiere aproximadamente 1,7 GB más.
- El contexto adicional consume únicamente memoria de K/V; el modelo subyacente admite hasta 262.144 tokens, pero a esa longitud la caché K/V crece de forma considerable y excede la mayoría de GPUs de consumo.
- GPU recomendadas: no disponibles de forma explícita; por el perfil de memoria, una RTX 4090 (24 GB) o RTX 3090 (24 GB) cubren con holgura la configuración Q4_K_M a 32K. Para contextos muy largos o Q6_K con 262K harían falta A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, al menos en modelos con 12 GB o más para Q4_K_M a 32K; con 8 GB habría que reducir contexto o cuantizar más la caché K/V.
- Opciones de despliegue: llama.cpp (probado en el commit 2cbe0ec) mediante `llama-server`, con soporte de plantilla Jinja embebida, proyector multimodal y decodificación especulativa MTP. Al ser un endpoint compatible con OpenAI, puede conectarse a Open WebUI y a agentes de código. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Throughput: 138,6 tok/s sin sidecar y 190,7 tok/s con sidecar MTP en el hardware del autor, con 53% de borradores aceptados.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ttindall/Qwen3.5-9B-Defiance-Cyber-MTP-GGUF | 8,95B | 32K recomendado, hasta 262.144 | Apache 2.0 | GGUF + sidecar MTP | Cinco modos cyber, visión, sin censura, decodificación especulativa |
| ttindall/Qwen3.8-27B-Defiance-Cyber-MTP-GGUF | 27B (no confirmado en la información) | No disponible | Apache 2.0 (según el mismo autor) | GGUF + sidecar MTP | Misma familia Defiance-Cyber; el autor indica respuestas más profundas y niveles de esfuerzo nativos |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B | No disponible | No disponible en la información | No disponible | Modelo base sin censura; sin modos cyber ni sidecar MTP |
| Qwen3.5-9B (original) | 9B | Hasta 262.144 | No disponible en la información | No disponible | Modelo de referencia con censura y sin cabezas MTP en los GGUF estándar |

La comparativa se limita a los modelos citados en la información proporcionada; no hay datos de benchmarks que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo sin censura y orientado explícitamente a seguridad ofensiva: el autor advierte que debe usarse solo en sistemas propios o con permiso escrito de pruebas, y que el usuario es responsable del uso y del cumplimiento legal en su jurisdicción.
- Alucinación: los modos cyber moldean método y estructura, pero no añaden conocimiento que los pesos no tengan; el autor señala que un 9B sabe menos que un 27B y que las respuestas serán más superficiales en todos los modos.
- Los constructs de persona de DavidAU ocupan entre 2.500 y 3.600 tokens por turno en el contexto, por lo que el autor recomienda al menos 32K de ventana si se usan.
- Sin modo activo, el comportamiento es el de Qwen3.5 estándar más un preámbulo sin censura; el nivel de esfuerzo por defecto es `medium`, que no añade nada, y `xhigh`/`low` solo añaden una frase cada uno.
- Idiomas soportados no documentados; se heredan los del Qwen3.5 subyacente, sin garantía explícita para castellano.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de censura y la orientación ofensiva pueden entrar en conflicto con políticas de proveedores cloud y con legislación local sobre herramientas de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (23 de noviembre de 2026), por lo que no hay validación independiente de las métricas del autor.
- La decodificación especulativa depende de un fichero sidecar separado; sin él se pierde la aceleración, pero no otras funcionalidades.
- Compatibilidad de despliegue limitada a llama.cpp en la documentación disponible; no se confirma soporte en vLLM, TGI u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ttindall/Qwen3.5-9B-Defiance-Cyber-MTP-GGUF
- Modelo base (pesos y proyector): https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Variante de 27B del mismo autor: https://huggingface.co/ttindall/Qwen3.8-27B-Defiance-Cyber-MTP-GGUF
- Sidecar MTP: https://huggingface.co/ttindall/Qwen3.5-9B-MTP-Sidecar-GGUF
- Constructs de persona (DavidAU, Turbo-Brilliance): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Ficha de la familia Defiance sin modo cyber: https://huggingface.co/ttindall/Qwen3.5-9B-Defiance-Uncensored-MTP-GGUF
