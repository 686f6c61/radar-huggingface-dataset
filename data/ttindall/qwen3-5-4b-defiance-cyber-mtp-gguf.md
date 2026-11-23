# ttindall/Qwen3.5-4B-Defiance-Cyber-MTP-GGUF

## Resumen

Qwen3.5-4B Defiance-Cyber es una cuantización GGUF del modelo HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive, publicada por el usuario ttindall. Se trata de una variante sin censura del Qwen3.5 de 4B parámetros, orientada específicamente a tareas de seguridad ofensiva y defensiva: red team, ingeniería inversa, resolución de CTFs, análisis de malware y threat intelligence. El modelo conserva las capacidades multimodales (visión) del original mediante el proyector BF16 de HauhauCS.

La aportación principal de esta ficha no son los pesos (que son idénticos byte a byte a los de HauhauCS, según el autor), sino la plantilla de chat integrada, que incorpora cinco modos de ciberseguridad y 40 "constructs" heredados de los modelos de DavidAU. Además, el repositorio incluye un sidecar MTP (multi-token prediction) que permite decodificación especulativa con el cabezal MTP original de Qwen, ausente en los GGUF estándar de Qwen3.5-4B.

El modelo es relevante para quienes necesitan un asistente local de seguridad ofensiva en hardware modesto: con cuantización Q4_K_M ocupa unos 5,8 GB en VRAM y alcanza 264,8 tok/s con el sidecar MTP en la GPU del autor. Está pensado como alternativa ligera al modelo hermano de 27B del mismo autor, para tarjetas gráficas que no pueden alojar el modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal image-text-to-text, con cabezal MTP en sidecar |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; 32K recomendado en la configuración medida |
| Tipos de cuantizacion | Q4_K_M y Q6_K (en el repositorio); sidecar MTP en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector multimodal BF16 separado (mmproj) |

## Arquitectura y entrenamiento

El modelo base es un transformer Qwen3.5 de 4B parámetros con capacidades multimodales (image-text-to-text). Los pesos proceden íntegramente de HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive, un ajuste sin censura del Qwen3.5-4B original; el autor de esta ficha declara explícitamente que no ha entrenado nada y que verificó los 426 tensores de cada cuantización contra los archivos de HauhauCS. El proyector de visión es el BF16 de HauhauCS, sin modificar.

La innovación técnica de este repositorio es doble. Por un lado, la plantilla Defiance v2, portada a Qwen3.5 y embebida en cada GGUF, que inserta como system prompt los cinco modos de ciberseguridad (redteam, reverser, ctf, malware, intel) de entre 350 y 450 tokens, además de los 40 constructs de DavidAU (modos de persona de 2.500 a 3.600 tokens). Por otro, el sidecar MTP: los GGUF de Qwen3.5-4B se distribuyen sin su cabezal de multi-token prediction, por lo que el autor lo publica aparte como archivo de draft para decodificación especulativa, logrando una tasa de aceptación del 49 % de los drafts.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo de pensamiento (reasoning) configurable mediante `--reasoning on` y formato deepseek.
- Capacidades multimodales: procesamiento de imágenes mediante el proyector BF16 (image-text-to-text).
- Cinco modos de ciberseguridad integrados en la plantilla: redteam (rutas de ataque, comandos ejecutables, IDs ATT&CK, telemetría), reverser (triaje, estructuras recuperadas, pseudocódigo anotado, offsets), ctf (identificación de bugs, sondas de confirmación, script de resolución), malware (triaje estático y dinámico, tabla de IOCs, regla YARA, hunt Sigma/KQL) e intel (juicios clave con confianza, TTPs, acciones priorizadas).
- 40 constructs adicionales de DavidAU (modos de persona) que consumen entre 2.500 y 3.600 tokens de contexto por turno.
- Soporte de tool calling y function calling a través de llama-server como endpoint compatible con la API de OpenAI.
- Integración con agentes de código: los nombres de esfuerzo del agente se mapean a los niveles nativos (`high` y `max` como `xhigh`, `minimal` y `none` como `low`).
- Decodificación especulativa mediante sidecar MTP.
- Control de la plantilla mediante `chat_template_kwargs`, incluido `defiance_preamble: false` para desactivar el preámbulo sin censura.

## Casos de uso

- Red team en entornos autorizados: el modo `redteam` devuelve rutas de ataque ordenadas por probabilidad y ruido, comandos ejecutables, identificadores ATT&CK y la telemetría que deja cada paso, lo que permite documentar un engagement con hallazgos listos para el cliente.
- Ingeniería inversa de binarios: el modo `reverser` ofrece triaje, estructuras recuperadas, pseudocódigo anotado y los pasos de depurador que confirman el análisis, con funciones y offsets exactos; útil para analistas que trabajan sobre muestras en máquinas aisladas.
- Resolución de CTFs: el modo `ctf` prioriza los bugs más probables y baratos de comprobar, propone sondas que confirman o descartan cada hipótesis y entrega un script de resolución completo, adecuado para competiciones con tiempo limitado.
- Análisis de malware en respuesta a incidentes: el modo `malware` genera triaje estático y de comportamiento, mapeo ATT&CK, tabla de IOCs, regla YARA y consulta de hunt en Sigma o KQL, integrable en el flujo de un equipo de IR.
- Threat intelligence: el modo `intel` produce juicios clave con nivel de confianza, TTPs y acciones priorizadas, útil para informes periódicos de inteligencia de amenazas.
- Asistente local de seguridad en hardware de consumo: con Q4_K_M y el sidecar MTP ocupa 5,8 GB de VRAM y rinde a 264,8 tok/s, por lo que puede desplegarse en una estación de trabajo con GPU de gama alta consumer sin depender de la nube.
- Automatización con agentes de código: al exponerse como endpoint compatible con OpenAI desde llama-server, puede conectarse a agentes que necesiten consultas de seguridad dentro de un pipeline de desarrollo o de revisión de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas de validación propias:

| Metrica | Resultado |
|---|---|
| Comprobaciones funcionales (Q4_K_M + sidecar + proyector, 32K, q8_0 K/V) | 12 de 12 correctas |
| Pruebas de imagen | 3 de 3 correctas |
| Throughput con sidecar MTP | 264,8 tok/s |
| Throughput sin sidecar MTP | 210,4 tok/s |
| Tasa de aceptación de drafts MTP | 49 % |
| VRAM en tarjeta (Q4_K_M + sidecar + proyector) | 5,8 GB |
| VRAM adicional con Q6_K | aproximadamente 0,8 GB más |

## Requisitos de hardware

- VRAM estimada: 5,8 GB con Q4_K_M más sidecar MTP y proyector; aproximadamente 6,6 GB con Q6_K. El contexto adicional solo consume memoria de K/V (configurado a q8_0 en las pruebas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M con contexto de 32K; el autor midió en una tarjeta no especificada. Para contextos cercanos a los 262.144 tokens nativos se requiere bastante más memoria de K/V.
- Cabe en GPU consumer: sí, con Q4_K_M en tarjetas de 8 GB o más; Q6_K requiere alrededor de 8 GB o más.
- Opciones de despliegue: llama.cpp (probado en el commit 2cbe0ec con `llama-server`), integración con Open WebUI y cualquier cliente compatible con la API de OpenAI. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 264,8 tok/s con decodificación especulativa MTP y 210,4 tok/s sin ella, medidos por el autor. La decodificación especulativa aporta aproximadamente un 26 % de mejora.
- Flags relevantes de despliegue: `-ngl all`, `-fa on`, `-ctk q8_0 -ctv q8_0`, `--jinja`, `--spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-min 0`, `--reasoning-format deepseek`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B Defiance-Cyber (este) | 4B | 262.144 | Sí (proyector BF16) | Apache 2.0 | Sin censura, 5 modos cyber, sidecar MTP, 264,8 tok/s |
| ttindall/Qwen3.8-27B-Defiance-Cyber-MTP-GGUF | 27B | no disponible | no disponible | no disponible | Modelo hermano del mismo autor; mismos modos y constructs, respuestas más profundas, requiere más VRAM |
| HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4B | no disponible | Sí | no disponible | Modelo base sin los modos cyber ni el sidecar MTP; pesos idénticos byte a byte |
| DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF | 27B | no disponible | no disponible | no disponible | Origen de los 40 constructs de persona; modos de 2.500 a 3.600 tokens |

## Limitaciones y advertencias

- Modelo sin censura con modos orientados a seguridad ofensiva: debe usarse únicamente sobre sistemas propios o con permiso escrito de pruebas. El usuario es responsable del uso y del cumplimiento legal en su jurisdicción.
- Al ser un modelo de 4B, sus respuestas son más superficiales que las del modelo hermano de 27B en todos los modos; los modos solo estructuran el método, no añaden conocimiento que los pesos no contengan.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en detalles técnicos como offsets, estructuras o comandos; conviene verificar cualquier salida antes de ejecutarla.
- Los modos de persona de DavidAU consumen entre 2.500 y 3.600 tokens de contexto en cada turno, por lo que se recomienda un contexto de 32K o superior si se usan.
- Qwen3.5 no tiene niveles de esfuerzo nativos: el nivel por defecto es `medium`, que no añade nada; `xhigh` y `low` solo añaden una frase cada uno.
- Un tag `{REASON:x}` persiste durante el resto de la conversación; el último introducido prevalece, lo que puede provocar un modo no deseado si no se gestiona.
- Los nombres de modo mal escritos devuelven un error en el uso como endpoint de agente.
- Los idiomas soportados no están documentados en la información disponible.
- El rendimiento medido (264,8 tok/s) corresponde a la tarjeta del autor y a un commit concreto de llama.cpp; puede variar en otro hardware o versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttindall/Qwen3.5-4B-Defiance-Cyber-MTP-GGUF
- Modelo base (pesos y proyector): https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Sidecar MTP: https://huggingface.co/ttindall/Qwen3.5-4B-MTP-Sidecar-GGUF
- Modelo hermano de 27B: https://huggingface.co/ttindall/Qwen3.8-27B-Defiance-Cyber-MTP-GGUF
- Ficha de los modos Defiance (lista de 40 constructs): https://huggingface.co/ttindall/Qwen3.5-4B-Defiance-Uncensored-MTP-GGUF
- Origen de los constructs (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
