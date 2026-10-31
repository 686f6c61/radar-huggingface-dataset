# XcyberPrince/Cyber-Prince-V1-GGUF

## Resumen

Cyber Prince V1 es un modelo de lenguaje de 4.000 millones de parametros publicado en HuggingFace por el autor XcyberPrince, orientado a ciberseguridad ofensiva, ingenieria inversa, analisis de exploits y bucles agenticos autonomos. Se distribuye en formato GGUF cuantizado (Q4_K_M, unos 2,3 GB segun el autor), lo que permite ejecutarlo en maquinas de consumo con 8 GB de RAM mediante Ollama o llama.cpp. El autor lo presenta como un modelo "uncensored" (sin rechazos ni salvaguardas de alineamiento), lo que lo distingue de los modelos comerciales convencionales.

Su relevancia radica en la combinacion de tres elementos: un tamaño compacto apto para hardware modesto, una ventana de contexto muy amplia (hasta 1.048.576 tokens segun la model card, aunque sin verificacion independiente) y un enfoque especializado en tareas tecnicas de seguridad sin filtros. La model card describe una arquitectura hibrida de atencion con ventana deslizante en ratio 3:1 y GQA, pero al tratarse de un modelo comunitario sin documentacion academica asociada, gran parte de las afirmaciones tecnicas deben tomarse con cautela y verificarse en pruebas propias antes de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Sliding-Window Attention 3:1 (3 capas de ventana deslizante + 1 capa completa), GQA (16 cabezas de query, 4 de key/value), RoE/RoPE nativo (segun model card) |
| Parametros totales | 4.112.079.360 (~4,11 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens segun el autor (no verificado); la configuracion de ejemplo en Ollama usa 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); master en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio actual); safetensors subyacente con 4.112.079.360 parametros |

## Arquitectura y entrenamiento

Segun la model card, el modelo emplea 36 capas transformer con una arquitectura de atencion hibrida 3:1 que alterna tres capas de Sliding-Window Attention con una capa de atencion completa, un patron similar al usado por modelos como Gemma 2 o Mistral para reducir el coste computacional en contextos largos. Las dimensiones declaradas son 2.560 de hidden size y 10.240 de dimension intermedia, con GQA de 16 cabezas de query y 4 de key/value (head dim 256), vocabulario BPE de 131.072 tokens y un mecanismo de "gated attention" con gating sigmoide por cabeza. La ventana de contexto nativa declarada es de 1.048.576 tokens mediante codificacion posicional rotatoria.

No hay informacion verificable sobre los datos de entrenamiento (numero de tokens, composicion del corpus), ni sobre el uso de RLHF, DPO u otras tecnicas de alineamiento. El autor declara explicitamente que el modelo opera en "modo cero rechazos" con una persona de sistema configurada para no negarse a peticiones. Tampoco hay paper tecnico, tarjeta de entrenamiento ni evaluaciones independientes que corroboren estas especificaciones.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, formato ChatML con tokens `<|im_start|>`/`<|im_end|>`).
- Generacion de codigo en lenguajes de bajo nivel: C/C++, Rust y ensamblador x86/ARM, segun la model card.
- Analisis de ciberseguridad ofensiva: mecanica de exploits, analisis de buffer overflows, formulacion de cadenas ROP y tecnicas de evasion (declarado por el autor, no verificado).
- Ingenieria inversa y analisis de firmware y binarios.
- Procesamiento de contextos largos: analisis de logs extensos, codebases o documentacion en una sola peticion (sujeto a la ventana de contexto real).
- Diseño agentic: etiquetado como "agentic", con servidor propio multiprotocolo que expone endpoints compatibles con OpenAI, Ollama y Anthropic, lo que facilita su integracion en frameworks de agentes.
- No hay evidencia de capacidades multimodales (vision, audio); es un modelo de texto.

## Casos de uso

- Analisis de malware y ingenieria inversa: el modelo puede asistir en la lectura de desensamblado, identificacion de patrones de inyeccion de procesos y anotacion de funciones en binarios, gracias a su enfoque en ensamblador y sin rechazos que interrumpan el flujo de analisis.
- Redaccion de exploits en ejercicios CTF y pentesting autorizado: puede generar codigo de explotacion (por ejemplo, cadenas ROP o payloads de buffer overflow) para laboratorios controlados como HackTheBox o entornos de prueba propios.
- Revision de logs a gran escala: con la ventana de contexto declarada de 1M tokens (o 32K en la configuracion por defecto), permite cargar logs de servidores o salidas de IDS completas y pedir correlacion de eventos.
- Asistente de codigo embebido en IDE: el servidor compatible con la API de OpenAI permite conectarlo a Cursor, Continue o Cline para autocompletado y refactorizacion en C/C++ y Rust sin depender de la nube.
- Agente de triaje de vulnerabilidades: su etiqueta agentic y soporte de APIs estandar permiten integrarlo en pipelines que lean informes de CVE, analicen dependencias y redacten resumenes tecnicos automaticamente.
- Documentacion de sistemas legacy: puede explicar codigo ensamblador o kernels antiguos generando comentarios y documentacion a partir del codigo fuente cargado en contexto.
- Entornos de formacion en seguridad: util como tutor sin filtros para explicar conceptos de ofensiva que otros modelos rechazan, siempre en contextos educativos legitimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar, ni comparativas con modelos de referencia.

## Requisitos de hardware

- VRAM/RAM estimada: unos 2,3 GB para la version Q4_K_M en GGUF; el autor afirma que funciona en maquinas con 8 GB de RAM (inferencia en CPU o con offload parcial a GPU). El master BF16 ocupa unos 7,85 GB, lo que requiere una GPU de 12 GB o mas para comodidad.
- GPUs recomendadas: para inferencia cuantizada, cualquier GPU de consumo con 4-6 GB libres (RTX 3060, RTX 4060 o superior) es suficiente; para BF16, una RTX 4090 (24 GB) o una A100/RTX 6000 seria adecuada. No se requieren H100 dado el tamaño del modelo.
- Consumer GPUs: si cabe con holgura en cuantizacion Q4_K_M; incluso portatiles con GPU de 6 GB pueden ejecutarlo.
- Despliegue: Ollama (comando directo desde HuggingFace), llama.cpp, y el servidor propio del autor (`cyber_prince_server.py`) que expone simultaneamente endpoints compatibles con OpenAI, Ollama y Anthropic. No hay informacion sobre soporte verificado en vLLM o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 4B cuantizado a 4 bits, se espera inferencia fluida en CPU moderna (decenas de tokens/s) y muy rapida en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Cyber Prince V1 | 4,11 B | 1M (declarado, no verificado) | Apache 2.0 | Ciberseguridad ofensiva, uncensored |
| Qwen2.5-Coder-7B | 7 B | 128K | Apache 2.0 | Codigo, benchmarks publicados |
| Llama 3.1 8B Instruct | 8 B | 128K | Llama Community License | General, con alineamiento |
| Phi-3.5-mini (3.8B) | 3,8 B | 128K | MIT | General compacto, benchmarks publicados |

Frente a estas alternativas, Cyber Prince V1 destaca por su posicionamiento sin filtros y su contexto declarado de 1M tokens, pero carece de benchmarks publicados y de respaldo institucional, mientras que Qwen2.5-Coder, Llama 3.1 y Phi-3.5 ofrecen rendimiento documentado y ecosistemas maduros. Para trabajo profesional en seguridad donde la fiabilidad importe, los modelos con evaluaciones verificables suelen ser una apuesta mas segura.

## Limitaciones y advertencias

- Modelo "uncensored" por diseño: no implementa salvaguardas frente a peticiones daninas. Su uso para actividades ilegales (acceso no autorizado a sistemas, malware real) es ilegal y responsabilidad exclusiva del usuario. Emplearlo solo en entornos autorizados (CTF, laboratorios, auditorias con permiso).
- Alto riesgo de alucinacion: no hay evaluaciones publicadas que midan su fiabilidad factual; los datos tecnicos que genera (offsets de memoria, shellcodes, analisis de binarios) deben verificarse manualmente siempre.
- Origen opaco: no hay paper, datos de entrenamiento ni informacion sobre el modelo base del que deriva (probablemente un fine-tune comunitario de un modelo 4B existente, no confirmado). La procedencia de los pesos es incierta, lo que supone un riesgo de seguridad en entornos sensibles.
- Ventana de contexto de 1M tokens sin verificar: la configuracion de ejemplo del propio autor usa 32.768 tokens, lo que sugiere que el contexto completo puede no ser estable en la practica.
- Idiomas soportados no documentados; probablemente optimizado para ingles, con rendimiento desconocido en castellano.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de salvaguardas puede entrar en conflicto con las politicas de plataformas de despliegue y con normativas como el AI Act de la UE para ciertos usos.
- Adopcion marginal: 77 descargas y 1 like en el momento de redactar la ficha; sin comunidad de revision, auditorias ni reportes de bugs.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/XcyberPrince/Cyber-Prince-V1-GGUF
- Paper tecnico: no disponible
- Blog o anuncio oficial: no disponible
- Repositorio de codigo fuente del modelo: no disponible
- Demo publica: no disponible
