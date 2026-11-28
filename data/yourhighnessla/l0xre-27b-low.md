# YourHighnessLA/L0xRE-27b-Low

## Resumen

L0xRE-27b-Low es una derivación cuantizada y orientada a memoria del modelo Qwen3.8-27B, publicada por el usuario YourHighnessLA. Su objetivo declarado es ejecutar un modelo de 27.000 millones de parámetros en una GPU de consumo con 12 GB de VRAM, sin descarga de capas a CPU, mediante un runtime propio (L0xRE BeeLLama Low) que combina cuantización agresiva, atención dispersa por encima de 8K tokens y decodificación especulativa. El modelo se distribuye en formato GGUF y se sirve a través de una API compatible con OpenAI.

La propuesta central no es el modelo en sí, sino el binomio pesos + runtime: el autor afirma 72 tok/s en decodificación de código sobre una RTX 3060 de 12 GB con el runtime v0.1.3, y un perfil de 262.144 tokens de contexto con la versión v0.1.6.5 y los pesos V2. Esta ficha documenta los pesos V1, que el propio autor mantiene para rollback y reproducción de las mediciones antiguas; para instalaciones nuevas recomienda V2.

Es relevante ahora porque aborda un cuello de botella práctico —el coste de VRAM para contexto largo en local— con una solución de ingeniería (atención dispersa con mapa aprendido D-LSA) en lugar de un modelo nuevo. La contrapartida es un ecosistema cerrado: runtime propietario, licencia derivada de los términos de investigación de Qwen y soporte exclusivo de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con atención dispersa selectiva en runtime (D-LSA) por encima de 8K tokens |
| Parametros totales | 4.784.193.024 (según safetensors del repo); la nomenclatura comercial indica 27B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K en V1 (runtime v0.1.3); 262.144 tokens con V2 y runtime v0.1.6.5 |
| Tipos de cuantizacion | GGUF cuantizado (el autor no detalla el esquema exacto); proyector de visión en Q8_0 |
| Idiomas soportados | Inglés |
| Licencia | `qwen-research-terms-derivative` (derivada de los términos de investigación de Qwen3.8-27B) |
| Formato de pesos | GGUF (librería llama.cpp); 8,62 GB en disco para el modelo principal, ~11 GB con runtime y visión |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado de Qwen3.8-27B, no un entrenamiento desde cero. La información disponible no detalla el dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen en la model card. La innovación técnica no reside en los pesos sino en el runtime L0xRE BeeLLama Low, que implementa atención dispersa a partir de 8K tokens: cada consulta atiende a un sumidero (sink), una ventana local y los tokens anteriores más relevantes seleccionados por un mapa aprendido denominado D-LSA (`qwen38-dlsa-d2048.l0xmap`). Por debajo de 8K tokens el modelo es completamente denso y el autor afirma que la salida es idéntica a nivel de logits respecto a la ruta densa.

La configuración por defecto de v0.1.6.5 usa teselas de 256 tokens, top-k de 16.384, un sink de 11.648 tokens, prefill agrupado y una caché de unidades CLOCK v3. El autor reporta divergencia KL frente a la ruta densa de 0,0107 en el rango 42–78K, 0,0140 en 128–170K y 0,0263 en 180–200K. También se menciona decodificación especulativa (DFlash2) como parte del stack de aceleración, aunque no se detallan sus parámetros.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento heredado del modelo base.
- Generación y asistencia de código, que es el caso de uso principal declarado por el autor.
- Comprensión de imágenes mediante un proyector de visión separado (Q8_0), descargado opcionalmente con la opción `--vision`.
- Contexto largo: 128K en V1 y hasta 262.144 tokens con V2 y runtime v0.1.6.5, con recuperación tipo needle-in-a-haystack medida por el autor.
- Servido mediante API compatible con OpenAI (`/v1`), lo que permite conectar clientes y agentes existentes.
- Soporte de tool calling y flujos de agente: no se documenta explícitamente en la información disponible; la compatibilidad con endpoints de OpenAI sugiere que depende del cliente.
- Multilingüismo: limitado a inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Asistente de código local en estaciones de trabajo con GPU de 12 GB: el modelo cabe completo en VRAM en una RTX 3060, 4070 o 5070, lo que permite autocompletado y refactorización sin enviar código a servicios externos.
- Agente de programación multi-turno: la ventana de 128K (V1) o 256K (V2) permite mantener en contexto varios ficheros y el historial de la sesión, con recuperación de fragmentos anteriores mediante la atención dispersa.
- Revisión de repositorios y documentación larga: la recuperación needle-in-a-haystack medida (223/224 en 16K–192K) lo hace apto para localizar referencias concretas en manuales o bases de código extensas.
- Análisis de capturas de pantalla y diagramas: con el proyector de visión instalado, puede describir interfaces o extraer texto de imágenes dentro de un flujo de soporte técnico.
- Backend de chat para herramientas internas: al exponer una API compatible con OpenAI en `127.0.0.1:8080/v1`, se integra en aplicaciones existentes sin adaptadores propietarios.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local y sin descarga de capas a CPU, es adecuado para datos que no pueden salir de la máquina, siempre que se acepten los términos de licencia.
- Reproducción de experimentos de atención dispersa: los pesos V1 permiten replicar las mediciones de v0.1.3 y comparar rutas densa y dispersa con el runtime correspondiente.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son mediciones de su propio runtime, no benchmarks estándar de conocimiento o código:

| Prueba | Denso | Disperso v0.1.6 |
|---|---:|---:|
| Recuperación needle, 8 registros, 16K–192K (RTX 3060 y RTX 5090) | 224/224 en cada tarjeta | 223/224 en cada tarjeta |
| Recuperación held-out, dos conjuntos de prompts, RTX 5090 | 269/288 | 268/288 |
| Respuestas por debajo de 8K tokens | — | Idénticas bit a bit a la ruta densa |
| Coste de prefill | — | RTX 3060 −0,2…+0,1 %; RTX 4090 −0,4…−0,1 %; RTX 5090 dentro del 1,6 % |

Datos adicionales declarados: 72 tok/s en decodificación de código sobre RTX 3060 12 GB, Linux nativo y sin interfaz gráfica, medidos con el runtime v0.1.3. Divergencia KL frente a denso: 0,0107 (42–78K), 0,0140 (128–170K), 0,0263 (180–200K), con recall 72/72 en la ejecución de laboratorio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: 12 GB como mínimo declarado; el modelo principal ocupa 8,62 GB en disco y el perfil de 12 GB sirve hasta 262.144 tokens con V2 y runtime v0.1.6.5.
- GPU compatibles: NVIDIA RTX serie 30, 40 o 50 exclusivamente; el autor cita RTX 3060 12 GB, RTX 4090 y RTX 5090 en sus mediciones. No se menciona soporte para AMD, Intel ni Apple Silicon.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, 4060 Ti 16 GB, 4070, 4080, 4090 y equivalentes de la serie 50.
- Software: controlador NVIDIA reciente, Python 3.12 o superior en Linux/WSL2, `curl`, `zstd` y `numactl`; en Windows 10/11 el instalador incluye Python y las DLL del runtime.
- Espacio en disco: aproximadamente 20 GB libres; descarga de unos 11 GB con runtime y soporte de visión.
- Despliegue: runtime propietario L0xRE BeeLLama Low (instaladores `install.cmd` / `install.sh`), servidor compatible con OpenAI en el puerto 8080. No se documenta compatibilidad con vLLM, TGI u Ollama; el formato es GGUF y la librería declarada es llama.cpp, pero el rendimiento anunciado depende del runtime del autor.
- Latencia y throughput: 72 tok/s en decodificación de código sobre RTX 3060 12 GB con v0.1.3; no se publican cifras para otras tarjetas ni para prefill absoluto.
- Limitaciones operativas: una sola secuencia simultánea (`-np 1`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| L0xRE-27b-Low | 27B (4,78B en safetensors) | 128K (V1) / 256K (V2) | Términos de investigación de Qwen (derivada) | GGUF + runtime propio | Optimizado para 12 GB de VRAM; solo inglés; runtime cerrado |
| Qwen3.8-27B (base) | 27B | No disponible en la información proporcionada | Términos de investigación de Qwen | Pesos originales en Hugging Face | Referencia de calidad; requiere más VRAM sin el runtime L0xRE |
| Alternativas de 27B en GGUF con cuantización estándar | ~27B | Depende de la cuantización y del backend | Según modelo base | llama.cpp, Ollama, etc. | Sin atención dispersa propietaria; el contexto largo exige más VRAM o descarga a CPU |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada, por lo que la comparación se limita a especificaciones y condiciones de uso.

## Limitaciones y advertencias

- Licencia: `qwen-research-terms-derivative`, derivada de los términos de investigación de Qwen3.8-27B. No es una licencia de código abierto permisiva; el uso comercial debe verificarse contra el enlace de licencia del modelo base.
- Idioma: solo inglés etiquetado; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Runtime propietario: las ventajas de velocidad y contexto dependen del runtime L0xRE, no de los pesos por sí solos. No hay garantía de funcionamiento con vLLM, TGI u Ollama, y el proyecto está mantenido por un único autor.
- Una sola secuencia: el perfil disperso actual admite `-np 1`, lo que limita el despliegue multiusuario concurrente.
- Divergencia respecto a la ruta densa: el autor reconoce una tasa de desacuerdo confiado de 1 entre 862 y copia de vecinos en posiciones de conteo, además de un aumento de la KL con la longitud (0,0263 en 180–200K).
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de sesgos; al ser un derivado cuantizado, la degradación respecto al base no está cuantificada en benchmarks estándar.
- Confusión de nombres: la etiqueta "27b" no coincide con los 4.784.193.024 parámetros del safetensors del repositorio; conviene validar el tamaño real antes de planificar recursos.
- Madurez: V1 está en modo rollback y el autor redirige las instalaciones nuevas a V2; la documentación y las mediciones cambian con cada versión del runtime.
- Sin soporte declarado para AMD, Intel o Apple Silicon; requiere GPU NVIDIA de las series 30, 40 o 50.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YourHighnessLA/L0xRE-27b-Low
- Modelo V2 recomendado: https://huggingface.co/YourHighnessLA/L0xRE-V2-27b-Low
- Repositorio del runtime: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low
- Notas de versión v0.1.6.5: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/blob/main/docs/V0165-RELEASE.md
- Notas de versión v0.1.6: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/blob/main/docs/V016-RELEASE.md
- Notas de versión v0.1.3: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/blob/main/docs/V013-RELEASE.md
- Opciones del instalador: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/blob/main/install/README.md
- Guía de instalación para agentes: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/blob/main/docs/AGENT-INSTALL.md
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
