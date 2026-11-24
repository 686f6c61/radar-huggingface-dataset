# Techions/Umochi-60K-WSP

## Resumen

Umochi-60K-WSP es un modelo de generacion de codigo publicado por Techions (con atribucion en la model card a Strata Systems y NodiGuard Cyber-Defense Labs) y derivado del modelo base Qwen/Qwen2.5-Coder-32B-Instruct. Se distribuye como un artefacto GGUF orientado a despliegue en local y esta especializado en dos dominios concretos: ingenieria Java 21+ de red y servidor (Netty, Spring Boot, Project Loom y defensa SSRF) y graficos 3D web con Three.js y WebGPU. La propuesta central es la "Weight-Space Programming" (WSP), una tecnica de steering en el espacio de pesos que aplica proyecciones sobre el residual stream durante la inferencia para reforzar comportamientos de dominio sin recurrir unicamente al prompting.

El modelo declara una ventana de contexto de 61.440 tokens (60K) y un unico idioma de trabajo efectivo: ingles y chino, segun los metadatos de Hugging Face. La licencia es Apache 2.0 y el autor enfatiza el despliegue on-premise con soberania de datos, pensado para entornos empresariales donde no es aceptable enviar codigo a APIs en la nube.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos derivados de un base consolidado que se especializan mediante tecnicas de intervencion en activaciones o pesos, en lugar de fine-tuning completo, y que se distribuyen cuantizados para ejecucion en una sola GPU de consumo. Conviene leerlo con cautela: el repositorio tiene un tamano declarado de 0.0 GB, un recuento de parametros de safetensors de 120.320 (incoherente con un modelo de 32B) y unas metricas de benchmark definidas por el propio autor, no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-32B-Instruct); steering WSP sobre el residual stream en capas 12 a 36 |
| Parametros totales | 32B (modelo base); el campo de safetensors del repo indica 120.320, dato no coherente y no verificado |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 61.440 tokens (60K) segun la model card |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-32B-Instruct, un transformer decoder-only denso de 32.000 millones de parametros. Sobre esa base, el autor aplica Weight-Space Programming: una intervencion matematica sobre el residual stream en las capas 12 a 36, de la forma h_l ← h_l − s_l · (h_l · v_l) · v_l, donde v_l es un vector de direccion de dominio y s_l su escala. Segun la model card, se construyen dos vectores de steering (uno para ingenieria Java de red y otro para graficos 3D) y se ortogonalizan mediante Gram-Schmidt, de modo que su coseno queda en 0.0000 y se evita la interferencia cruzada entre dominios.

No se especifica en la informacion disponible el volumen de tokens de entrenamiento adicional, la composicion del dataset de especializacion ni si hubo RLHF o DPO posteriores. La model card menciona Multi-Token Prediction (MTP) como objetivo de la version siguiente (WSP v3), no como caracteristica de esta version. Tampoco se detalla el proceso exacto de calibracion de los vectores de steering ni los datos usados para derivarlos.

## Capacidades

- Generacion de codigo Java 21+ orientada a servidores de alta concurrencia: pipelines Netty con ByteBuf de copia cero y comprobaciones de fugas, validacion SSRF de doble pila IPv4/IPv6, proteccion TOCTOU en resolucion DNS.
- Razonamiento sobre concurrencia con Project Loom: hilos virtuales, aislamiento de carrier threads y deteccion de pinning con synchronized frente a ReentrantLock.
- Generacion de escenas 3D con Three.js y WebGPU: InstancedMesh en una sola llamada de dibujo, materiales PBR (MeshStandardMaterial, MeshPhysicalMaterial), tone mapping ACESFilmic y sintesis de audio procedural.
- Soporte de tool calling y function calling segun la seccion de quickstart de la model card, con interfaz compatible con la API de OpenAI.
- Integracion en IDE mediante endpoint compatible con OpenAI (la model card menciona integracion universal en IDE).
- Capacidades multilingues limitadas a ingles y chino; no se declara soporte de castellano.
- Capacidades generales de generacion de texto y codigo heredadas del modelo base Qwen2.5-Coder-32B-Instruct.

## Casos de uso

- Desarrollo de servidores de red en Java: el modelo genera decodificadores de frames Netty con ByteBuf de copia cero y puede producir codigo preparado para auditoria con -Dio.netty.leakDetection.level=PARANOID, lo que reduce el trabajo de revision manual en pipelines de alto throughput.
- Revision de seguridad de servicios expuestos: dado su entrenamiento declarado en defensa SSRF y validacion de rangos CIDR RFC 1918/4193, se puede usar para generar y revisar validadores de URL, fijacion DNS y parametrizacion SQL en endpoints publicos.
- Migracion a hilos virtuales: sirve para proponer refactorizaciones de bloques synchronized a ReentrantLock y para diagnosticar pinning de carrier threads con -Djdk.tracePinnedThreads=full. Conviene tener en cuenta que la propia model card reporta solo un 50 por ciento de exito en esta tarea.
- Prototipado de visualizaciones 3D en navegador: genera escenas Three.js con InstancedMesh y materiales PBR, util para equipos que necesitan maquetas de producto o demos interactivas sin depender de un artista 3D.
- Asistencia de codigo en entornos con requisitos de soberania de datos: al ejecutarse on-premise sobre una GPU de consumo, permite integrar un asistente de codigo sin enviar codigo propietario a servicios externos.
- Automatizacion de pruebas de integracion en Java: puede generar arneses JUnit y casos de prueba con EmbeddedChannel para validar pipelines de red antes de desplegar.
- Generacion de audio procedural y efectos en demos web: la model card menciona sintesis de audio procedural como parte del dominio 3D, aplicable a prototipos de experiencias interactivas.

## Benchmarks y rendimiento

Los siguientes datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente. Las metricas de pass rate corresponden a pruebas de ejecucion descritas por el autor (compilacion javac, arneses JUnit y detectores de fugas en tiempo de ejecucion).

| Dimension | Umochi 60K (WSP v2) | Objetivo declarado (WSP v3) |
|---|---|---|
| TTFT (primer token) | ~380 ms | ~250 ms |
| Velocidad de decodificacion | 52-60 tok/s | 55-65 tok/s |
| Netty copia cero y seguridad de fugas | 90,0 % pass | 98,0 % pass |
| Defensa SSRF y TOCTOU | 90,0 % pass | 95,0 % pass |
| Three.js PBR e InstancedMesh | 80,0 % pass | 90,0 % pass |
| Project Loom sin pinning de carrier | 50,0 % pass | 95,0 % pass |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BigCodeBench) en la informacion disponible. Las cifras de latencia y throughput corresponden a una RTX 3060 de 12 GB con unos 8,5 GB de VRAM ocupados, segun el autor.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,5 GB segun el autor para la configuracion GGUF desplegada con contexto de 60K en una RTX 3060 de 12 GB. Para un modelo de 32B, esa cifra implica una cuantizacion muy agresiva; conviene validar el nivel de cuantizacion real del archivo antes de asumir ese consumo.
- GPU recomendadas: RTX 3060 de 12 GB como minimo declarado; para mayor calidad de cuantizacion son razonables RTX 4090 (24 GB), A100 (40/80 GB) y H100 (80 GB).
- Cabe en GPU de consumo: si, segun el autor, en RTX 3060 de 12 GB con la configuracion indicada. En tarjetas de 8 GB o menos no hay datos que lo respalden.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI solo si se dispone de pesos en safetensors, que no se declaran en el repositorio. La model card menciona un motor propietario denominado Strata y una interfaz compatible con la API de OpenAI.
- Latencia y throughput: TTFT de aproximadamente 380 ms y 52-60 tok/s en RTX 3060, segun el autor. No hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| Umochi-60K-WSP | 32B (base) | 61.440 tokens | Apache 2.0 | Java de red y Three.js/WebGPU | GGUF en Hugging Face |
| Qwen2.5-Coder-32B-Instruct | 32B | 32.768 tokens nativos (ampliable) | Apache 2.0 | Codigo general | Safetensors y GGUF |
| DeepSeek-Coder-V2-Instruct | 236B totales, 21B activos (MoE) | 128K | Licencia propia de DeepSeek | Codigo general | Safetensors |
| Codestral 22B | 22B | 32K | Licencia no comercial (MNPL) | Codigo general | Safetensors |

El modelo base Qwen2.5-Coder-32B-Instruct es la referencia directa: Umochi hereda su arquitectura y capacidades generales, anade una ventana de contexto ampliada a 60K y aplica el steering de dominio, pero no publica comparaciones frente al base en benchmarks estandar. Frente a DeepSeek-Coder-V2 y Codestral, Umochi ofrece menor tamano que el primero y una licencia permisiva que el segundo no tiene, a cambio de una especializacion mucho mas estrecha y de una validacion externa inexistente.

## Limitaciones y advertencias

- Metricas no verificadas: todos los pass rates y cifras de latencia proceden del autor. No hay evaluacion independiente en el Open LLM Leaderboard ni en el BigCode Leaderboard; solo hay solicitudes de PR abiertas.
- Incoherencias en los metadatos del repositorio: el tamano declarado es de 0.0 GB y el recuento de parametros de safetensors es de 120.320, incompatible con un modelo de 32B. Verificar los archivos reales antes de cualquier despliegue.
- Rendimiento debil declarado en Project Loom: un 50 por ciento de pass en defensa contra pinning de carrier threads indica que el modelo no es fiable en esa tarea concreta.
- Riesgo de alucinacion en APIs especificas: al estar especializado en APIs de Netty, Spring Boot y Three.js, puede generar llamadas plausibles pero inexistentes o con firmas incorrectas. Requiere compilacion y pruebas en CI antes de aceptar codigo.
- Cobertura idiomatica limitada: solo ingles y chino. No se declara soporte de castellano, por lo que su uso en documentacion o comentarios en espanol puede degradar la calidad.
- Especializacion estrecha: fuera de Java de red y graficos 3D web, el comportamiento equivale al del modelo base, sin ventajas adicionales.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-Coder-32B-Instruct, tambien Apache 2.0, y conservar las atribuciones correspondientes.
- Dependencia de un motor propietario: parte del rendimiento declarado se atribuye al motor Strata, no descrito en detalle ni disponible como software abierto en la informacion proporcionada.
- Fecha de creacion futura en los metadatos (noviembre de 2026): tratarlo como un indicio de que el repositorio puede estar en estado preliminar o mal etiquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Techions/Umochi-60K-WSP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Leaderboard del autor: https://huggingface.co/spaces/Techions/Umochi-Enterprise-Java-3D-Leaderboard
- Discusion en BigCode Leaderboard (PR #107): https://huggingface.co/spaces/bigcode/bigcode-models-leaderboard/discussions/107
- Solicitud en Open LLM Leaderboard (PR #114): https://huggingface.co/datasets/open-llm-leaderboard/requests/blob/refs%2Fpr%2F114/Techions/Umochi-60K-WSP_eval_request_False_bfloat16_Original.json
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
